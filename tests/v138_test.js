/* v138: conversas estilo WhatsApp — 1 a 1 e grupos cifrados de ponta a ponta. PC gestor + iPhone estoque + iPhone auxiliar, emulador. */
const L=require('./lib.js');const {ok,until}=L;
const URL0='http://localhost:8000/index.html?ntfy='+L.N;const PROJ='gen-lang-client-0167474823';
const FSU='http://127.0.0.1:8080/v1/projects/'+PROJ+'/databases/(default)/documents';
const SHOTS=process.env.SHOTS||'';
const STRICT=()=>{try{localStorage.setItem('e99-test-chatlist','1');localStorage.removeItem('e99-test-chatgeral');localStorage.setItem('e99-test-strict','1');localStorage.removeItem('e99-test-signup');localStorage.setItem('e99-test-strong','1')}catch(e){}};
async function admin(path,body){const r=await fetch(FSU+path,{method:body?'PATCH':'GET',headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return r.json()}
(async()=>{const b=await L.chromium.launch();const errs=[];
 async function dev(nome,opts){const c=await b.newContext(opts);await c.addInitScript(STRICT);await c.route(u=>u.host==='localhost:20130',r=>r.abort());const P=await c.newPage();
  P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|ERR_FAILED|ntfy|EventSource|firestore|Firebase|identitytoolkit|WebChannel|permission/i.test(m.text()))errs.push(nome+' console: '+m.text())});P.on('dialog',d=>d.accept());return {c,P}}
 const G=await dev('PC',{viewport:{width:1440,height:900}});const A=G.P;
 await A.goto(URL0);await until(A,()=>!!window.__e99Boot,null,8000);await A.waitForTimeout(500);await A.click('#auth-owner');await A.waitForTimeout(300);
 await A.fill('#auth-screen input[name=store]','Lojas G');await A.fill('#auth-screen input[name=email]',L.mail('vferreiras'));await A.fill('#auth-screen input[name=login]','vferreiras');await A.fill('#auth-screen input[name=password]','abc12345');await A.fill('#auth-screen input[name=confirmation]','abc12345');await L.terms(A,'#auth-form');
 await A.click('#auth-form button[type=submit]');await A.waitForTimeout(2500);await A.fill('#recovery-last4',(await A.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await A.click('#recovery-enter');await A.waitForTimeout(2000);await A.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await until(A,()=>!!(e99Cloud.user()&&e99Cloud.user().email),null,40000),'PC: gestor com nuvem');
 const guid=await A.evaluate(()=>e99Cloud.user().uid);await admin('/verificados/'+guid,{fields:{tipo:{stringValue:'s'}}});
 await A.evaluate(()=>go('chat'));await A.waitForTimeout(500);ok(await A.evaluate(()=>!!document.querySelector('.cv-list .cv-item')),'PC: Chat abre a lista de conversas');await A.evaluate(()=>e99Cv.open('geral'));await A.waitForTimeout(500);await A.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await A.click('text=Criar equipe e gerar código');
 ok(await until(A,()=>!!e99Loja.ctx()&&e99Cv.state().started&&!!e99Cv.state().pk,null,40000),'PC: conversas ligadas à nuvem com chave pública');
 async function mk(nome,papel){await A.evaluate(()=>go('admin'));await A.waitForTimeout(400);await A.evaluate(()=>e99OpenAccCreate());await A.waitForTimeout(500);
  await A.fill('#aux-box input[name=name]',nome);await A.fill('#aux-box input[name=login]',nome.toLowerCase()+'.x');await A.selectOption('#aux-box select[name=papel]',papel);
  await A.evaluate(()=>{window.__inv='';navigator.share=t=>{window.__inv=t.text;return Promise.resolve()}});await A.click('#aux-box button.primary');await A.waitForTimeout(2500);
  const lk=((await A.evaluate(()=>window.__inv||'')).match(/(http\S+#auxiliar=[A-Za-z0-9_-]+\.[0-9A-Z]{10})/)||[])[1];ok(!!lk,'PC: link de '+nome);
  const X=await dev(nome,L.devices['iPhone 13']);const Q=X.P;await Q.goto('about:blank');await Q.goto(L.inviteUrl(lk));await Q.waitForSelector('#aux-form input[name=password]',{timeout:20000}).catch(()=>{});
  await Q.fill('#aux-form input[name=email]',L.mail(nome.toLowerCase()));await Q.fill('#aux-form input[name=password]','senha1234x');await Q.fill('#aux-form input[name=confirmation]','senha1234x');await L.terms(Q,'#aux-form');await Q.click('#aux-form button[type=submit]');await Q.waitForTimeout(3000);
  await Q.fill('#recovery-last4',(await Q.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await Q.click('#recovery-enter');await Q.waitForTimeout(2500);await Q.addStyleTag({content:'#alert-popup{display:none!important}'});
  await Q.evaluate(async n=>{state.perfil={name:n,cargo:'',bio:'',photo:'',at:Date.now()};await save()},nome);
  ok(await until(Q,()=>!!window.e99Cv&&e99Cv.state().started&&!!e99Cv.state().pk,null,60000),nome+': conversas ligadas');return Q}
 const B=await mk('Bia','estoque');const C=await mk('Caio','auxiliar');
 const uid=async P=>P.evaluate(()=>e99Loja.ctx().uid);const ug=await uid(A),ub=await uid(B),uc=await uid(C);
 const hasPk=(P,u)=>until(P,u=>{const S=e99Social.S();const r=S['perfis_'+u];return !!(r&&r.x&&r.x.pk)},u,40000);
 ok(await hasPk(A,ub)&&await hasPk(A,uc)&&await hasPk(B,ug)&&await hasPk(C,ug),'Chaves públicas publicadas nos perfis');
 /* 1 a 1 */
 await B.evaluate(()=>{go('team')});await A.evaluate(u=>e99Pessoa(u),ub);await A.waitForTimeout(500);
 ok(await A.evaluate(()=>[...document.querySelectorAll('#view button')].some(b=>/^Mensagem$/.test(b.textContent))),'PC: perfil da pessoa tem botão Mensagem');
 await A.evaluate(u=>e99Cv.dmTo(u),ub);await A.waitForTimeout(600);ok(await A.evaluate(()=>page==='chat'&&!!document.querySelector('.cv-compose')),'PC: conversa privada aberta');
 await A.fill('.cv-compose textarea','Oi Bia <i>x</i>');await A.click('.cv-compose button.primary');
 ok(await until(A,()=>e99Cv.msgs().some(m=>/Oi Bia/.test(m.t)&&!m.st),null,15000),'PC: enviada');
 await B.evaluate(()=>go('chat'));ok(await until(B,()=>{const c=e99Cv.state().convs.find(c=>/Oi Bia/.test(c.last||''));return !!c&&c.unread===1&&!!document.querySelector('.cv-item .cv-badge')},null,20000),'iPhone estoque: conversa na lista com 1 não lida');
 ok(await until(A,()=>!!document.querySelector('.cv-b.mine [data-tk=entregue]'),null,20000),'PC: ✓✓ entregue');
 await B.evaluate(()=>{const c=e99Cv.state().convs.find(c=>/Oi Bia/.test(c.last||''));e99Cv.open(c.cv)});await B.waitForTimeout(800);
 ok(await B.evaluate(()=>!document.querySelector('.cv-b i')&&/<i>x<\/i>/.test(document.querySelector('.cv-b .cv-t').textContent)),'iPhone: texto escapado');
 ok(await until(A,()=>!!document.querySelector('.cv-b.mine [data-tk=lido]'),null,20000),'PC: ✓✓ lido');
 await B.type('.cv-compose textarea','respondendo');ok(await until(A,()=>/digitando/.test(document.getElementById('cv-sub').textContent),null,15000),'PC: vê "digitando…"');
 await B.click('.cv-compose button.primary');ok(await until(A,()=>e99Cv.msgs().some(m=>m.t==='respondendo'),null,15000),'PC: recebeu a resposta');
 ok(await until(A,()=>/online|visto/.test(document.getElementById('cv-sub').textContent),null,15000),'PC: online/visto por último');
 await B.evaluate(()=>{e99Cv.pref('read',false);e99Cv.list()});await A.fill('.cv-compose textarea','sem lido');await A.click('.cv-compose button.primary');
 await B.waitForTimeout(3000);await B.evaluate(()=>{const c=e99Cv.state().convs.find(c=>/sem lido/.test(c.last||''));e99Cv.open(c.cv)});
 ok(await until(A,()=>{const l=[...document.querySelectorAll('.cv-b.mine')].pop();return !!l&&!!l.querySelector('[data-tk=entregue]')},null,15000)&&(await A.waitForTimeout(4000),await A.evaluate(()=>!![...document.querySelectorAll('.cv-b.mine')].pop().querySelector('[data-tk=entregue]'))),'PC: confirmação de leitura desligada mostra só entregue');
 /* grupo */
 const gid=await A.evaluate(async(a)=>{const id=await e99Cv.newGroup('Turma <b>1</b>',a);e99Cv.open(id);return id},[ub,uc]);
 await A.fill('.cv-compose textarea','Grupo 1');await A.click('.cv-compose button.primary');
 ok(await until(C,(g)=>e99Cv.msgs(g).some(m=>m.t==='Grupo 1'),gid,20000)&&await until(B,(g)=>e99Cv.msgs(g).some(m=>m.t==='Grupo 1'),gid,20000),'Grupo: estoque e auxiliar leem');
 await C.evaluate(g=>{go('chat');e99Cv.open(g)},gid);await C.waitForTimeout(500);ok(await C.evaluate(()=>/Turma <b>1<\/b>/.test(document.querySelector('.cv-head b').textContent)),'Grupo: nome escapado');
 if(SHOTS){await A.waitForTimeout(800);await A.screenshot({path:SHOTS+'/grupo-pc.png'});await B.evaluate(()=>e99Cv.list());await B.waitForTimeout(800);await B.screenshot({path:SHOTS+'/lista-iphone.png'})}
 await A.evaluate(async(u)=>{await e99Cv.editGroup(e99Cv.state().sub,{rm:[u]})},uc);ok(await A.evaluate(g=>e99Cv.group(g).kv===2&&e99Cv.group(g).m.length===2,gid),'Grupo: auxiliar removido e chave trocada');
 await A.fill('.cv-compose textarea','Segredo');await A.click('.cv-compose button.primary');
 ok(await until(B,(g)=>e99Cv.msgs(g).some(m=>m.t==='Segredo'),gid,20000),'Grupo: estoque lê depois da troca');
 await C.waitForTimeout(5000);ok(await C.evaluate(g=>!e99Cv.msgs(g).some(m=>m.t==='Segredo')&&!e99Cv.state().convs.some(c=>c.cv===g),gid),'Grupo: quem saiu não lê mais');
 const lj=await A.evaluate(()=>e99Loja.status().loja);const raw=JSON.stringify(await admin('/lojas/'+lj+'/dados?pageSize=300'));
 ok(raw.includes('msgs_')&&!/Oi Bia|Grupo 1|Segredo|respondendo/.test(raw),'Nuvem: mensagens só cifradas');
 /* regras */
 const deny=await C.evaluate(async([g,ug])=>{const k=e99Loja.ctx(),D=k.L().collection('dados'),st=k.FS.FieldValue.serverTimestamp(),r=[];
  const tr=async(id,o)=>{try{await D.doc(id).set(Object.assign({at:Date.now(),st,by:k.uid,del:false,v:1,d:'x'},o));r.push('ok:'+id)}catch(e){r.push('no')}};
  await tr('cv_'+g,{c:'cv',cuid:k.uid});await tr('pres_'+ug,{c:'pres',cuid:k.uid});await tr('msgs_'+g+'~m1~r~'+ug,{c:'msgs',cuid:k.uid});await tr('rcpt_'+g+'~'+ug,{c:'rcpt',cuid:k.uid});return r},[gid,ug]);
 ok(deny.every(x=>x==='no'),'Regras: não grava grupo/presença/recibo/reação de outro '+deny.join(','));
 const small=await B.evaluate(()=>{e99Cv.list();return [...document.querySelectorAll('#view button')].filter(b=>b.offsetParent&&b.getBoundingClientRect().height<43.5).map(b=>b.textContent.trim()).slice(0,5)});
 ok(!small.length,'iPhone: toques ≥44 px na lista'+(small.length?': '+small.join('|'):''));
 ok(await B.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'iPhone: sem rolagem lateral');
 ok(!errs.length,'sem erro de página/console'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro: '+e.message);process.exit(1)});
