/* v136: dados da loja na nuvem — todas as contas veem o mesmo sem outro aparelho aberto. ntfy bloqueado em todos os aparelhos.
   PC 1440×900 (gestor) + iPhone 13 (estoque) + iPhone 13 (auxiliar), emulador do Firebase. */
const L=require('./lib.js');const {ok,until}=L;
const URL0='http://localhost:8000/index.html?ntfy='+L.N;const PROJ='gen-lang-client-0167474823';
const FSU='http://127.0.0.1:8080/v1/projects/'+PROJ+'/databases/(default)/documents';
const STRICT=()=>{try{localStorage.setItem('e99-test-strict','1');localStorage.removeItem('e99-test-signup');localStorage.setItem('e99-test-strong','1')}catch(e){}};
async function admin(path,body){const r=await fetch(FSU+path,{method:body?'PATCH':'GET',headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return r.json()}
(async()=>{const b=await L.chromium.launch();const errs=[];
 async function dev(nome,opts){const c=await b.newContext(opts);await c.addInitScript(STRICT);await c.route(u=>u.host==='localhost:20130',r=>r.abort());const P=await c.newPage();
  P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|ERR_FAILED|ntfy|EventSource|firestore|Firebase|identitytoolkit|WebChannel|permission/i.test(m.text()))errs.push(nome+' console: '+m.text())});P.on('dialog',d=>d.accept());return {c,P}}
 const G=await dev('PC',{viewport:{width:1440,height:900}});let A=G.P;
 await A.goto(URL0);await until(A,()=>!!window.__e99Boot,null,8000);await A.waitForTimeout(500);await A.click('#auth-owner');await A.waitForTimeout(300);
 await A.fill('#auth-screen input[name=store]','Lojas G');await A.fill('#auth-screen input[name=email]',L.mail('vferreiras'));await A.fill('#auth-screen input[name=login]','vferreiras');await A.fill('#auth-screen input[name=password]','abc12345');await A.fill('#auth-screen input[name=confirmation]','abc12345');await L.terms(A,'#auth-form');
 await A.click('#auth-form button[type=submit]');await A.waitForTimeout(2500);await A.fill('#recovery-last4',(await A.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await A.click('#recovery-enter');await A.waitForTimeout(2000);await A.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await until(A,()=>!!(e99Cloud.user()&&e99Cloud.user().email),null,40000),'PC: gestor entrou com a nuvem ligada');
 const guid=await A.evaluate(()=>e99Cloud.user().uid);await admin('/verificados/'+guid,{fields:{tipo:{stringValue:'s'}}});
 await A.evaluate(()=>go('chat'));await A.waitForTimeout(500);await A.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await A.click('text=Criar equipe e gerar código');
 await A.evaluate(async()=>{state.team=[{id:'ana',name:'Ana',role:'Repositora'}];state.corridors=[{id:'c7',number:'07',sector:'Mercearia',owner:'ana'}];
  state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios',date:iso(),status:'Pendente',owner:'ana',notes:'',volumes:3},{id:'n2',number:'55001',supplier:'Bebidas',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1}];
  state.plans=[{id:'p1',title:'Plano de terça',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana',notes:'',photos:[]}]}];await save()});
 ok(await until(A,()=>{const s=e99Loja.status();return s.status==='ok'&&s.seeded&&s.pend===0},null,40000),'PC: dados da loja enviados para a nuvem (ntfy bloqueado)');
 const raw=await admin('/lojas/'+await A.evaluate(()=>e99Loja.status().loja)+'/dados');
 ok(raw.documents&&raw.documents.length>=5&&!JSON.stringify(raw).includes('48213')&&!JSON.stringify(raw).includes('Laticínios'),'Nuvem: documentos só cifrados ('+(raw.documents||[]).length+')');
 async function link(nome,login,papel){await A.evaluate(()=>go('admin'));await A.waitForTimeout(400);await A.evaluate(()=>e99OpenAccCreate());await A.waitForTimeout(500);
  await A.fill('#aux-box input[name=name]',nome);await A.fill('#aux-box input[name=login]',login);await A.selectOption('#aux-box select[name=papel]',papel);
  await A.evaluate(()=>{window.__inv='';navigator.share=t=>{window.__inv=t.text;return Promise.resolve()}});await A.click('#aux-box button.primary');await A.waitForTimeout(2500);
  const m=(await A.evaluate(()=>window.__inv||'')).match(/(http\S+#auxiliar=[A-Za-z0-9_-]+\.[0-9A-Z]{10})/);return m&&m[1]}
 const lE=await link('Bia','bia.estoque','estoque'),lX=await link('Caio','caio.aux','auxiliar');ok(!!lE&&!!lX,'PC: links de acesso gerados');
 const ad=await A.evaluate(()=>!!document.getElementById('loja-add')||(go('chat'),true));
 await A.close();
 async function activate(nome,lk,pw){const D=await dev(nome,L.devices['iPhone 13']);const B=D.P;await B.goto('about:blank');await B.goto(L.inviteUrl(lk));await B.waitForSelector('#aux-form input[name=password]',{timeout:20000}).catch(()=>{});
  await B.fill('#aux-form input[name=email]',L.mail(nome));await B.fill('#aux-form input[name=password]',pw);await B.fill('#aux-form input[name=confirmation]',pw);await L.terms(B,'#aux-form');await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);
  await B.fill('#recovery-last4',(await B.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await B.click('#recovery-enter');await B.waitForTimeout(2500);await B.addStyleTag({content:'#alert-popup{display:none!important}'});return D}
 const E=await activate('iPhone estoque',lE,'bia12345x');const P=E.P;
 ok(await until(P,()=>state.nfs.some(n=>n.number==='48213')&&state.plans.some(p=>p.id==='p1')&&state.corridors.some(c=>c.id==='c7'),null,60000),'iPhone estoque: abriu sozinho (gestor fechado, sem ntfy) e vê NFs, plano e corredor');
 await P.evaluate(()=>go('home'));await P.waitForTimeout(600);ok(await P.evaluate(()=>/Dados da loja na nuvem/.test((document.getElementById('loja-note')||{}).textContent||'')),'iPhone estoque: Início diz "Dados da loja na nuvem · atualizado às"');
 await P.evaluate(async()=>{const n=state.nfs.find(x=>x.id==='n1');n.status='Conferido';await save()});
 ok(await until(P,()=>e99Loja.status().pend>0&&e99Loja.status().denied>0,null,20000),'iPhone estoque: antes do gestor confirmar o papel, a edição de NF alheia espera (nível auxiliar na nuvem)');
 const X=await activate('iPhone auxiliar',lX,'caio1234x');const Q=X.P;
 ok(await until(Q,()=>state.nfs.some(n=>n.id==='n1')&&state.plans.some(p=>p.id==='p1'),null,60000),'iPhone auxiliar: vê os dados da loja');
 await Q.evaluate(async()=>{state.nfs.push({id:'nx1',number:'90009',supplier:'Fornecedor do auxiliar',date:iso(),status:'Pendente',owner:'',notes:'',volumes:2});await save()});
 ok(await until(Q,()=>e99Loja.status().pend===0,null,20000),'iPhone auxiliar: NF nova enviada');
 const den=await Q.evaluate(async()=>{const c=await e99Cloud.load(),s=e99Loja.status();try{await c.db.collection('lojas').doc(s.loja).collection('dados').doc('nfs_n2').set({c:'nfs',at:Date.now(),st:firebase.firestore.FieldValue.serverTimestamp(),by:s.uid,cuid:s.uid,del:true,v:1,d:''});return 'gravou'}catch(e){return e.code}});
 ok(den==='permission-denied','iPhone auxiliar: del:true direto na nuvem recusado ('+den+')');
 /* gestor reabre */
 A=await G.c.newPage();A.on('pageerror',e=>errs.push('PC '+e.message));A.on('dialog',d=>d.accept());await A.goto(URL0);await until(A,()=>!!window.__e99Boot,null,8000);await A.waitForTimeout(800);
 if(await A.evaluate(()=>!authSession))await L.login(A,'vferreiras','abc12345');
 ok(await until(A,()=>state.nfs.some(n=>n.id==='nx1'),null,60000),'PC: gestor reabre e vê a NF do auxiliar');
 ok(await A.evaluate(()=>new Set(state.nfs.map(n=>n.id)).size===state.nfs.length&&state.nfs.filter(n=>n.number==='48213').length===1),'PC: sem duplicar');
 ok(await until(A,()=>{const p=e99Loja.status().papeis;return Object.values(p).filter(r=>r==='estoque').length===1&&Object.values(p).filter(r=>r==='auxiliar').length===1},null,60000),'PC: gestor confirmou os papéis das contas dos convites dele');
 ok(await until(A,()=>state.nfs.some(n=>n.id==='n1'&&n.status==='Conferido'),null,60000),'PC: com o papel confirmado, a edição do estoque sobe e chega ao gestor');
 ok(await until(Q,()=>state.nfs.some(n=>n.id==='n1'&&n.status==='Conferido'),null,60000),'iPhone auxiliar: recebe a edição do estoque pela nuvem');
 /* estoque apaga depois do papel confirmado */
 ok(await until(P,()=>Object.values(e99Loja.status().papeis).includes('estoque'),null,30000),'iPhone estoque: papel na nuvem chegou');
 await P.evaluate(async()=>{state.nfs=state.nfs.filter(n=>n.id!=='n2');await save()});
 ok(await until(A,()=>!state.nfs.some(n=>n.id==='n2'),null,40000),'PC: exclusão do estoque chegou ao gestor');
 /* offline: fila e volta */
 await E.c.setOffline(true);await P.evaluate(async()=>{state.nfs.find(n=>n.id==='n1').notes='feito offline';await save()});await P.waitForTimeout(2500);
 ok(await P.evaluate(()=>e99Loja.status().pend>0),'iPhone estoque: sem internet a mudança fica na fila');
 await E.c.setOffline(false);await P.evaluate(()=>dispatchEvent(new Event('online')));
 ok(await until(A,()=>(state.nfs.find(n=>n.id==='n1')||{}).notes==='feito offline',null,90000),'PC: a mudança feita offline chegou quando a internet voltou');
 /* conta sem nuvem: aviso */
 ok(await A.evaluate(()=>{const t=document.createElement('div');return typeof e99LojaAddMail==='function'}),'PC: "Adicionar conta existente pelo e-mail" disponível');
 ok(!errs.length,'sem erro de página/console'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro: '+e.message);process.exit(1)});
