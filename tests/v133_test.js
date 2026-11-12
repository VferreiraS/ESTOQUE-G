/* v133: (A) backup cifrado na nuvem + restaurar (Minha conta e aparelho limpo pelo "Trazer da nuvem"); outro uid não lê.
   (B) custódia: o gestor redefine a senha de um usuário sem o código (envelope com a chave pública do gestor, pedido, abertura
   pelo gestor, pedido forjado/de outro gestor, não-gestor não abre). PC 1440×900 (gestor) + iPhone 13 (auxiliar), emulador do Firebase.
   Prints: SHOTS=<pasta> node tests/v133_test.js */
const L=require('./lib.js');const {ok,until}=L;const path=require('path');
const URL0='http://localhost:8000/index.html?ntfy='+L.N;const SHOTS=process.env.SHOTS||'';
const STRICT=()=>{try{localStorage.setItem('e99-test-strict','1');localStorage.removeItem('e99-test-signup');localStorage.setItem('e99-test-strong','1')}catch(e){}};
(async()=>{const b=await L.chromium.launch();const errs=[];
 async function dev(nome,opts){const c=await b.newContext(opts);await c.addInitScript(STRICT);const P=await c.newPage();
  P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|firestore|Firebase|identitytoolkit|WebChannel|permission/i.test(m.text()))errs.push(nome+' console: '+m.text())});P.on('dialog',d=>d.accept());return P}
 const A=await dev('PC',{viewport:{width:1440,height:900}});const B=await dev('iPhone',L.devices['iPhone 13']);
 /* gestor (dono) */
 await A.goto(URL0);await until(A,()=>!!window.__e99Boot,null,8000);await A.waitForTimeout(500);await A.click('#auth-owner');await A.waitForTimeout(300);
 await A.fill('#auth-screen input[name=store]','Lojas G');await A.fill('#auth-screen input[name=email]',L.mail('vferreiras'));await A.fill('#auth-screen input[name=login]','vferreiras');await A.fill('#auth-screen input[name=password]','abc12345');await A.fill('#auth-screen input[name=confirmation]','abc12345');await L.terms(A,'#auth-form');
 await A.click('#auth-form button[type=submit]');await A.waitForTimeout(2500);await A.fill('#recovery-last4',(await A.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await A.click('#recovery-enter');await A.waitForTimeout(2000);await A.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await A.evaluate(()=>authSession&&authSession.payload.role==='gestor'),'PC: gestor entrou');
 await A.evaluate(()=>go('chat'));await A.waitForTimeout(500);await A.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await A.click('text=Criar equipe e gerar código');
 ok(await until(A,()=>syncStatus().ready&&syncStatus().connected),'PC: equipe criada');
 await A.evaluate(()=>go('admin'));await A.waitForTimeout(400);await A.evaluate(()=>e99OpenAccCreate());await A.waitForTimeout(500);
 await A.fill('#aux-box input[name=name]','Ana');await A.fill('#aux-box input[name=login]','ana.teste');await A.selectOption('#aux-box select[name=papel]','auxiliar');
 await A.evaluate(()=>{navigator.share=t=>{window.__inv=t.text;return Promise.resolve()}});await A.click('#aux-box button.primary');await A.waitForTimeout(2500);
 const text=await A.evaluate(()=>window.__inv||'');const m=text.match(/(http\S+#auxiliar=[A-Za-z0-9_-]+\.[0-9A-Z]{10})/);ok(!!m,'PC: link de acesso gerado');
 ok(await A.evaluate(()=>!!(state.custody&&state.custody.priv)&&!JSON.stringify(localStorage).includes(state.custody.priv.d)),'PC: chave privada do gestor só dentro da conta cifrada (não aparece no localStorage)');
 const gk=await A.evaluate(()=>e99GkPub());
 /* auxiliar ativa no iPhone */
 const AUXMAIL=L.mail('ana');
 await B.goto('about:blank');await B.goto(L.inviteUrl(m[1]));await B.waitForSelector('#aux-form input[name=password]',{timeout:20000}).catch(()=>{});
 await B.fill('#aux-form input[name=email]',AUXMAIL);await B.fill('#aux-form input[name=password]','ana12345x');await B.fill('#aux-form input[name=confirmation]','ana12345x');await L.terms(B,'#aux-form');await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);
 await B.fill('#recovery-last4',(await B.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await B.click('#recovery-enter');await B.waitForTimeout(2500);await B.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await B.evaluate(g=>authSession&&authSession.payload.role==='auxiliar'&&state.custody.gk===g,gk),'iPhone: conta ativada e a chave pública do gestor veio no link');
 ok(await until(B,()=>{const c=e99CustodyState();return c&&c.ok},null,30000),'iPhone: envelope de custódia criado ao entrar');
 ok(await B.evaluate(()=>{const r=JSON.parse(localStorage.getItem(authSession.storeKey));return r.custody&&r.custody.env&&r.custody.w&&r.custody.s===r.salt&&!/[0-9A-Z]{24}/.test(JSON.stringify(r.custody.env))}),'iPhone: envelope guardado junto da conta (cifrado, sem código em claro)');
 /* ---------- (A) backup ---------- */
 ok(await until(B,()=>!!(e99Cloud.user()&&e99Cloud.user().email),null,40000),'iPhone: nuvem ligada na conta do auxiliar');
 await B.evaluate(async()=>{state.nfs=[{id:'nfb1',number:'777001',supplier:'Fornecedor do backup',date:iso(),status:'Pendente',owner:'',notes:'',volumes:2}];await save()});
 const r1=await B.evaluate(async()=>{const r=await e99Backup.run(true);return r&&r.ok});ok(r1,'iPhone: backup enviado para a nuvem');
 const info=await B.evaluate(async()=>{const c=await e99Cloud.load(),u=c.auth.currentUser;const h=(await c.db.collection('backups').doc(u.uid).get()).data();const p0=(await c.db.collection('backups').doc(u.uid).collection('partes').doc('0').get()).data();return {uid:u.uid,h,len:p0.d.length,plain:/777001|Fornecedor do backup/.test(p0.d)}});
 ok(info.h&&info.h.n>=1&&/^[0-9a-f]{64}$/.test(info.h.h)&&info.h.login==='ana.teste','iPhone: cabeçalho do backup na nuvem (n, sha-256, login)');
 ok(!info.plain,'iPhone: nada em claro no backup (dados só cifrados)');
 /* outro uid não lê */
 ok(await until(A,()=>!!e99Cloud.user(),null,40000),'PC: nuvem ligada na conta do gestor');
 const deny=await A.evaluate(async uid=>{const c=await e99Cloud.load();const out=[];try{await c.db.collection('backups').doc(uid).get();out.push('leu')}catch(e){out.push(e.code)}try{await c.db.collection('backups').doc(uid).collection('partes').doc('0').get();out.push('leu')}catch(e){out.push(e.code)}try{await c.db.collection('backups').doc(uid).set({v:1,login:'x',rev:1,n:1,len:1,h:'0'.repeat(64),at:Date.now(),slim:false});out.push('gravou')}catch(e){out.push(e.code)}return out},info.uid);
 ok(deny.every(x=>x==='permission-denied'),'PC: outro uid não lê nem grava o backup do auxiliar ('+deny.join(',')+')');
 const bad=await B.evaluate(async()=>{const c=await e99Cloud.load(),u=c.auth.currentUser,ref=c.db.collection('backups').doc(u.uid);const out=[];
  try{await ref.set({v:1,login:'a',rev:1,n:13,len:1,h:'0'.repeat(64),at:Date.now(),slim:false});out.push('n13')}catch(e){out.push('ok')}
  try{await ref.set({v:1,login:'a',rev:1,n:1,len:1,h:'0'.repeat(64),at:Date.now(),slim:false,senha:'x'});out.push('campo')}catch(e){out.push('ok')}
  try{await ref.collection('partes').doc('12').set({d:'x',at:Date.now()});out.push('p12')}catch(e){out.push('ok')}return out});
 ok(bad.every(x=>x==='ok'),'iPhone: regras recusam pedaço demais, campo a mais e pedaço fora da faixa');
 /* Minha conta: painel, restaurar */
 await B.evaluate(()=>go('account'));await B.waitForTimeout(800);
 ok(await until(B,()=>{const s=document.getElementById('bk-status');return s&&/Último backup/.test(s.textContent)},null,8000),'iPhone: Minha conta mostra "Backup na nuvem" com a data do último backup');
 if(SHOTS){await B.evaluate(()=>document.getElementById('bk-panel').scrollIntoView({block:'center'}));await B.waitForTimeout(400);await B.screenshot({path:path.join(SHOTS,'v133-backup-iphone.png')})}
 await B.evaluate(async()=>{state.nfs=[];await save();render()});
 await B.click('#bk-panel button:not(.primary)');await B.waitForTimeout(300);await B.fill('#bk-dlg input[name=password]','errada123');await B.click('#bk-dlg button.primary');
 ok(await until(B,()=>/Senha incorreta/.test(document.getElementById('bk-err').textContent),null,15000),'iPhone: restaurar com senha errada: mensagem clara, nada muda');
 await B.fill('#bk-dlg input[name=password]','ana12345x');await B.click('#bk-dlg button.primary');
 ok(await until(B,()=>state.nfs.some(n=>n.number==='777001')&&authSession.payload.role==='auxiliar',null,15000),'iPhone: restaurado do backup (dados voltaram, papel igual)');
 /* v136: espera o envio do estado restaurado terminar (antes o iPhone limpo podia baixar a cópia anterior, sem a NF) */
 ok(await B.evaluate(async()=>{const r=await e99Backup.run(true);return !!(r&&r.ok)}),'iPhone: backup do estado restaurado enviado');
 /* aparelho limpo: Trazer da nuvem */
 const C=await dev('iPhone limpo',L.devices['iPhone 13']);await C.goto(URL0);await until(C,()=>!!window.__e99Boot,null,8000);await C.waitForTimeout(500);
 await C.fill('#auth-form input[name=login]','ana.teste');await C.fill('#auth-form input[name=password]','ana12345x');await C.click('#auth-form button[type=submit]');
 await C.waitForSelector('#cloud-pull input[name=email]',{timeout:15000}).catch(()=>{});await C.fill('#cloud-pull input[name=email]',AUXMAIL);await C.click('#cloud-pull button.primary');
 ok(await until(C,()=>!!authSession&&state.nfs.some(n=>n.number==='777001'),null,90000),'iPhone limpo: "Trazer da nuvem" trouxe a conta e os dados do backup');
 ok(await C.evaluate(()=>authSession.payload.role==='auxiliar'&&!!state.custody.gk),'iPhone limpo: papel mantido (auxiliar) e chave do gestor junto');
 await C.close();
 /* ---------- (B) pedido ao gestor ---------- */
 ok(await B.evaluate(async()=>{try{await e99CustodyAnswer('STK-PEDIDO:abc');return false}catch(e){return /Só o gestor/.test(e.message)}}),'iPhone: auxiliar (não-gestor) não abre pedidos');
 await B.evaluate(()=>go('admin'));await B.waitForTimeout(400);ok(await B.evaluate(()=>!document.getElementById('cust-admin')),'iPhone: auxiliar não vê "Redefinir senha de um usuário"');
 await B.evaluate(()=>authLogout());await B.waitForTimeout(2000);await B.evaluate(()=>authSetMode('recover'));await B.waitForTimeout(400);
 ok(await B.evaluate(()=>!!document.querySelector('#cust-ask-box button')),'iPhone: Esqueci a senha tem "Pedir ao gestor"');
 await B.click('#cust-ask-box button');await B.fill('#cust-ask input[name=login]','ana.teste');await B.click('#cust-ask button.primary');await B.waitForTimeout(800);
 const ped=await B.evaluate(()=>{const t=document.getElementById('cust-ask-text');return t?t.value:''});ok(/^STK-PEDIDO:[A-Za-z0-9_-]+$/.test(ped),'iPhone: pedido gerado para copiar/compartilhar');
 await B.evaluate(()=>document.getElementById('cust-ask').close());
 await A.evaluate(()=>go('admin'));await A.waitForTimeout(500);ok(await A.evaluate(()=>!!document.getElementById('cust-admin')),'PC: Administração tem "Redefinir senha de um usuário"');
 const forged=await A.evaluate(async p=>{const out={};const t=async x=>{try{await e99CustodyAnswer(x);return 'abriu'}catch(e){return e.message}};
  out.lixo=await t('oi tudo bem');const j=JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(p.slice(11).replace(/-/g,'+').replace(/_/g,'/')+'==='.slice((p.length-11)%4||3)),c=>c.charCodeAt(0))));
  const enc=o=>'STK-PEDIDO:'+btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o)))).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
  out.outro=await t(enc(Object.assign({},j,{k:'0123456789abcdef'})));const c2=j.c.slice(0,10)+(j.c[10]==='A'?'B':'A')+j.c.slice(11);out.adulterado=await t(enc(Object.assign({},j,{c:c2})));
  out.login=await t(enc(Object.assign({},j,{l:'vferreiras'})));out.xss=await t(enc(Object.assign({},j,{l:'<img src=x onerror=window.__x=1>'})));return out},ped);
 ok(/inválido/i.test(forged.lixo),'PC: pedido sem sentido → "Pedido inválido"');ok(/outro gestor/.test(forged.outro),'PC: pedido de outro gestor/equipe → mensagem clara');
 ok(/adulterado/.test(forged.adulterado)&&/adulterado/.test(forged.login),'PC: pedido adulterado (envelope ou login trocado) não abre');ok(/inválido/i.test(forged.xss),'PC: login com HTML no pedido é recusado');
 await A.fill('#cust-admin textarea[name=pedido]',ped);await A.click('#cust-admin button.primary');
 ok(await until(A,()=>{const c=document.getElementById('cust-code');return c&&/^[0-9A-Z]{4}(-[0-9A-Z]{4}){5}$/.test(c.textContent)},null,10000),'PC: gestor abriu o pedido e vê o código');
 ok(await A.evaluate(()=>/@ana\.teste/.test(document.getElementById('cust-admin-out').textContent)&&!window.__x),'PC: mostra de quem é o pedido');
 if(SHOTS){await A.evaluate(()=>document.getElementById('cust-admin').scrollIntoView({block:'center'}));await A.waitForTimeout(400);await A.screenshot({path:path.join(SHOTS,'v133-redefinir-pc.png')})}
 const code=await A.textContent('#cust-code');
 /* usuário usa o código e escolhe senha nova */
 await B.fill('#auth-form input[name=login]','ana.teste');await B.fill('#auth-form input[name=code]',code);await B.fill('#auth-form input[name=password]','nova2026ok');await B.fill('#auth-form input[name=confirmation]','nova2026ok');await B.click('#auth-form button[type=submit]');
 ok(await until(B,()=>!!authSession&&authSession.record.login==='ana.teste'&&!!authShownCode,null,20000),'iPhone: senha redefinida com o código do gestor; novo código de recuperação mostrado');
 ok(await until(B,()=>{const c=e99CustodyState();return c&&c.ok},null,30000),'iPhone: envelope refeito para a senha nova');
 const reuse=await B.evaluate(async c=>{const r=JSON.parse(localStorage.getItem(authSession.storeKey));return !!(await e99CustodyOpen(c,r))},code);ok(!reuse,'iPhone: o código do gestor não vale de novo');
 await B.evaluate(()=>{authShownCode=null;document.querySelectorAll('dialog[open]').forEach(d=>d.close());if(window.e99CloudLater)e99CloudLater();authLogout()});await B.waitForTimeout(1500);await B.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));await B.waitForTimeout(2000);await B.evaluate(()=>authSetMode('login'));await B.waitForTimeout(300);
 await L.login(B,'ana.teste','ana12345x');ok(await B.evaluate(()=>!authSession),'iPhone: a senha antiga não entra mais');
 await L.login(B,'ana.teste','nova2026ok');ok(await B.evaluate(()=>!!authSession&&authSession.payload.role==='auxiliar'),'iPhone: entra com a senha nova, papel igual');
 ok(!errs.length,'sem erro de página/console'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro: '+e.message);process.exit(1)});
