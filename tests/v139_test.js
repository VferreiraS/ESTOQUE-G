/* v139: conta sem e-mail entra nos dados da loja com login anônimo (ntfy bloqueado). PC gestor com e-mail + iPhone 13 auxiliar sem e-mail; provedor desligado mostra aviso. */
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
 const X=await activate('iPhone auxiliar',lX,'caio1234x');const Q=X.P;
 /* e-mail não liga (login por e-mail recusado): sai e entra de novo */
 await Q.evaluate(async()=>{await authLogout();const c=await e99Cloud.load();await c.auth.signOut();const no=()=>Promise.reject({code:'auth/operation-not-allowed'});c.auth.createUserWithEmailAndPassword=no;c.auth.signInWithEmailAndPassword=no});await Q.waitForTimeout(800);
 await L.login(Q,'caio.aux','caio1234x');
 ok(await until(Q,()=>{const u=e99Cloud.user();return !!(u&&u.isAnonymous)},null,30000),'iPhone auxiliar: sem e-mail entrou na nuvem com login anônimo');
 ok(await until(Q,()=>state.nfs.some(n=>n.number==='48213')&&e99Loja.status().status==='ok',null,60000),'iPhone auxiliar (anônimo): vê as notas do gestor (sem ntfy)');
 const au1=await Q.evaluate(()=>e99Cloud.user().uid);
 await Q.evaluate(()=>go('home'));await Q.waitForTimeout(600);ok(await Q.evaluate(()=>!/Ligue o e-mail|acesso automático/.test(document.body.textContent)),'iPhone auxiliar: sem aviso de e-mail');
 await Q.evaluate(async()=>{state.nfs.push({id:'nx1',number:'90009',supplier:'Fornecedor do auxiliar',date:iso(),status:'Pendente',owner:'',notes:'',volumes:2});await save()});
 ok(await until(Q,()=>e99Loja.status().pend===0,null,20000),'iPhone auxiliar: NF nova enviada');
 await Q.reload();await until(Q,()=>!!window.__e99Boot,null,8000);
 ok(await Q.evaluate(async()=>{await e99Cloud.load();return (e99Cloud.user()||{}).uid})===au1,'iPhone auxiliar: sessão anônima guardada (mesmo uid ao recarregar)');
 A=await G.c.newPage();A.on('pageerror',e=>errs.push('PC '+e.message));A.on('dialog',d=>d.accept());await A.goto(URL0);await until(A,()=>!!window.__e99Boot,null,8000);await A.waitForTimeout(800);
 if(await A.evaluate(()=>!authSession))await L.login(A,'vferreiras','abc12345');
 ok(await until(A,()=>state.nfs.some(n=>n.id==='nx1'),null,60000),'PC: gestor vê a NF criada pelo auxiliar anônimo');
 ok(await until(A,u=>e99Loja.status().papeis[u]==='auxiliar',au1,60000),'PC: gestor confirmou o papel do uid anônimo pelo convite');
 /* provedor anônimo desligado */
 await Q.evaluate(async()=>{if(authSession)await authLogout();const c=await e99Cloud.load();await c.auth.signOut();firebase.auth.Auth.prototype.signInAnonymously=function(){return Promise.reject({code:'auth/operation-not-allowed'})};c.auth.signInAnonymously=firebase.auth.Auth.prototype.signInAnonymously;c.auth.createUserWithEmailAndPassword=c.auth.signInAnonymously;c.auth.signInWithEmailAndPassword=c.auth.signInAnonymously});await Q.waitForTimeout(800);
 await L.login(Q,'caio.aux','caio1234x');await Q.evaluate(()=>go('home'));
 ok(await until(Q,()=>{if(page==='home'&&!document.getElementById('loja-note'))render();return /Peça ao gestor para ativar o acesso automático/.test((document.getElementById('loja-note')||{}).textContent||'')},null,30000),'iPhone auxiliar: provedor desligado mostra "Peça ao gestor para ativar o acesso automático"');
 ok(!errs.length,'sem erro de página/console'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro: '+e.message);process.exit(1)});
