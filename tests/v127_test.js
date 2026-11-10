/* v127: (A) Perfil de volta (foto, nome, cargo, sobre; sem selos) — salva, volta depois de entrar de novo, chega à equipe, texto escapado.
   (B) Auxiliar cria NF e plano (chegam ao gestor), edita os seus; não exclui de outro, não abre Administração; apagar forjado pelo ntfy é barrado.
   (C) Contas só pelo gestor: sem "Criar conta" livre; gestor cria conta e gera UM link; o link ativa uma vez; reabrir não cria outra conta;
   link inválido tem mensagem clara; auxiliar não cria contas. PC 1440×900 (gestor) + iPhone 13 (auxiliar). */
const L=require('./lib.js');const {ok,until}=L;const path=require('path');
const URL0='http://localhost:8000/index.html?ntfy='+L.N;
const STRICT=()=>{try{localStorage.setItem('e99-test-strict','1');localStorage.removeItem('e99-test-signup')}catch(e){}};
const BAD='V<img src=x onerror=window.__xss=1>';
(async()=>{const b=await L.chromium.launch();const errs=[];
 async function dev(nome,opts){const c=await b.newContext(opts);await c.addInitScript(STRICT);const P=await c.newPage();
  P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(nome+' console: '+m.text())});P.on('dialog',d=>d.accept());return P}
 const A=await dev('PC',{viewport:{width:1440,height:900}});const B=await dev('iPhone',L.devices['iPhone 13']);
 /* ---------- C: tela de entrar sem criação livre ---------- */
 for(const [nome,P] of [['PC',A],['iPhone',B]]){await P.goto(URL0);await until(P,()=>!!window.__e99Boot,null,8000);await P.waitForTimeout(600);
  ok(await P.evaluate(()=>!document.getElementById('auth-create')&&/Peça seu link de acesso ao gestor/.test(document.getElementById('auth-screen').textContent)),nome+': sem "Criar conta" livre; pede o link ao gestor');
  ok(await P.evaluate(()=>!!document.getElementById('auth-owner')),nome+': aparelho vazio: só "Primeiro acesso do dono"');
  await P.click('#auth-owner');await P.waitForTimeout(400);
  ok(await P.evaluate(()=>!document.querySelector('#auth-form input[name=pc]')),nome+': sem caixa "Conta do PC" na criação');
  await P.fill('#auth-screen input[name=store]','Loja X');await P.fill('#auth-screen input[name=login]','fulano');await P.fill('#auth-screen input[name=email]',L.mail('fulano'));await P.fill('#auth-screen input[name=password]','abc12345');await P.fill('#auth-screen input[name=confirmation]','abc12345');await L.terms(P,'#auth-form');
  await P.click('#auth-form button[type=submit]');await P.waitForTimeout(1500);
  ok(await P.evaluate(()=>!authSession&&!authRecoveryShow&&/Só o dono/.test(document.getElementById('auth-screen').textContent)&&!authAccounts().length),nome+': outro login não cria conta pela tela de entrar');
 }
 await B.evaluate(()=>authSetMode('login'));await B.waitForTimeout(300);await B.fill('#auth-form input[name=login]','Estoque 99');await B.fill('#auth-form input[name=password]','qualquer1');await B.click('#auth-form button[type=submit]');await B.waitForTimeout(1500);
 ok(await B.evaluate(()=>!authSession&&!authPending&&/Conta não encontrada/.test(document.getElementById('auth-screen').textContent)),'iPhone: semente "Estoque 99" não cria conta');
 /* gestor (dono) num aparelho vazio */
 await A.fill('#auth-screen input[name=store]','Lojas G');await A.fill('#auth-screen input[name=email]',L.mail('vferreiras'));await A.fill('#auth-screen input[name=login]','vferreiras');await A.fill('#auth-screen input[name=password]','abc12345');await A.fill('#auth-screen input[name=confirmation]','abc12345');await L.terms(A,'#auth-form');
 await A.click('#auth-form button[type=submit]');await A.waitForTimeout(2500);await A.fill('#recovery-last4',(await A.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await A.click('#recovery-enter');await A.waitForTimeout(2000);await A.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await A.evaluate(()=>!!authSession&&authSession.payload.role==='gestor'&&e99CanCreateAccounts()),'PC: o dono cria a 1ª conta (gestor) e pode criar contas');
 await A.evaluate(async()=>{state.team=[{id:'ana',name:'Ana',role:'Repositora'}];state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios',date:iso(),status:'Pendente',owner:'ana',notes:'',volumes:3}];
   state.plans=[{id:'p1',title:'Plano do gestor',date:iso(),activities:[{id:'a1',title:'Repor arroz',owner:'Ana',notes:'',photos:[]}]}];await save();go('chat')});
 await A.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await A.click('text=Criar equipe e gerar código');
 ok(await until(A,()=>syncStatus().ready&&syncStatus().pending===0&&syncStatus().connected),'PC: equipe criada e sincronizada');
 await A.evaluate(()=>go('admin'));await A.waitForTimeout(400);ok(await A.evaluate(()=>!!document.querySelector('#acc-create button.primary')),'PC: Administração tem "Criar conta e link"');
 await A.evaluate(()=>e99OpenAccCreate());await A.waitForTimeout(500);
 await A.fill('#aux-box input[name=name]','Ana');await A.fill('#aux-box input[name=login]','ana.teste');await A.selectOption('#aux-box select[name=papel]','auxiliar');
 await A.evaluate(()=>{navigator.share=t=>{window.__inv=t.text;return Promise.resolve()}});await A.click('#aux-box button.primary');await A.waitForTimeout(2500);
 const text=await A.evaluate(()=>window.__inv||'');const m=text.match(/(http\S+#auxiliar=[A-Za-z0-9_-]+\.[0-9A-Z]{10})/);ok(!!m,'PC: gestor gerou um link de acesso pessoal (com o código dentro)');
 const link=L.inviteUrl(m[1]);
 /* ---------- C: ativar pelo link (iPhone) ---------- */
 await B.goto('about:blank');await B.goto(link);await B.waitForSelector('#aux-form input[name=password]',{timeout:20000}).catch(()=>{});
 ok(await B.evaluate(()=>{const i=document.querySelector('#aux-form input[name=login]');return !!i&&i.readOnly&&i.value==='ana.teste'}),'iPhone: o link abre direto a ativação com o login fixo do gestor');
 await B.fill('#aux-form input[name=email]',L.mail('ana'));await B.fill('#aux-form input[name=password]','abc12345');await B.fill('#aux-form input[name=confirmation]','abc12345');await L.terms(B,'#aux-form');await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);
 await B.fill('#recovery-last4',(await B.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await B.click('#recovery-enter');await B.waitForTimeout(2500);await B.addStyleTag({content:'#alert-popup{display:none!important}'});
 ok(await B.evaluate(()=>!!authSession&&authSession.payload.role==='auxiliar'&&authSession.record.login==='ana.teste'),'iPhone: conta ativada (auxiliar, login do gestor)');
 ok(await until(B,()=>{try{return syncStatus().ready&&state.nfs.some(n=>n.id==='n1')}catch(e){return false}},null,30000),'iPhone: entrou na equipe e recebeu os dados');
 ok(await B.evaluate(()=>!e99CanCreateAccounts()&&(go('chat'),!document.getElementById('aux-box'))),'iPhone: auxiliar não cria contas');
 /* reabrir o mesmo link: não cria outra conta */
 ok(await until(A,()=>Object.values(syncMembers()).some(m=>m&&m.inviteId),null,30000),'PC: gestor vê a conta ativada (aviso da equipe)');await B.evaluate(()=>authLogout());await B.waitForTimeout(800);await B.goto('about:blank');await B.goto(link);await B.waitForTimeout(6000);
 ok(await B.evaluate(()=>!!document.getElementById('inv-used')&&/já foi usado/.test(document.getElementById('inv-used').textContent)&&!document.querySelector('#aux-form input[name=password]')&&authAccounts().length===1),'iPhone: reabrir o link mostra "já foi usado" e não cria outra conta');
 const C=await dev('PC2',{viewport:{width:1440,height:900}});await C.goto(link);await C.waitForTimeout(7000);
 ok(await C.evaluate(()=>!!document.getElementById('inv-used')&&/ativado em outro aparelho/.test(document.getElementById('inv-used').textContent)&&!authAccounts().length),'outro aparelho: o link já ativado não cria segunda conta');
 await C.goto('about:blank');await C.goto(URL0+'#auxiliar='+'A'.repeat(60)+'.ABCDEFGHJK');await C.waitForTimeout(4000);
 ok(await C.evaluate(()=>/Link de acesso inválido/.test(document.getElementById('auth-screen').textContent)&&!authAccounts().length),'link inválido: mensagem clara, nenhuma conta');
 await C.context().close();
 await B.evaluate(()=>auxCancel());await B.waitForTimeout(400);await L.login(B,'ana.teste','abc12345');await B.waitForTimeout(1500);
 ok(await B.evaluate(()=>!!authSession&&isAux()),'iPhone: entra de novo com a conta ativada');
 /* ---------- B: auxiliar ---------- */
 ok(await B.evaluate(()=>!!labels.nfs&&!!labels.plans&&!!labels.chat&&!!labels.profile&&!labels.admin),'iPhone: menu do auxiliar com NFs, Plano, Chat e Perfil (sem Administração)');
 await B.evaluate(()=>go('admin'));await B.waitForTimeout(300);ok(await B.evaluate(()=>page!=='admin'),'iPhone: auxiliar não abre Administração');
 await B.evaluate(()=>{go('nfs');openEditor('nf')});await B.waitForTimeout(600);
 await B.evaluate(()=>{const f=document.getElementById('editor');f.elements.number.value='77001';f.elements.supplier.value='Fornecedor da Ana';f.elements.volumes.value='4';f.requestSubmit()});await B.waitForTimeout(1500);
 const nfA=await B.evaluate(()=>{const n=state.nfs.find(x=>x.number==='77001');return n?{id:n.id,cby:n.cby,mine:e99Mine(n)}:null});
 ok(!!nfA&&nfA.cby==='Ana'&&nfA.mine,'iPhone: auxiliar adicionou NF nova (marcada como dele)');
 await B.evaluate(()=>{go('plans');openPlan()});await B.waitForTimeout(500);
 ok(await B.evaluate(()=>!!document.getElementById('plan-editor')),'iPhone: auxiliar abre "Novo plano"');
 await B.evaluate(()=>{planDraft.title='Plano da Ana';planDraft.activities[0].title='Contar caixas';render();document.getElementById('plan-editor').requestSubmit()});await B.waitForTimeout(1500);
 const plA=await B.evaluate(()=>{const p=state.plans.find(x=>x.title==='Plano da Ana');return p?{id:p.id,cby:p.cby}:null});ok(!!plA&&plA.cby==='Ana','iPhone: auxiliar criou plano com atividade');
 ok(await B.evaluate(id=>{render();const own=document.querySelector('#view .plan-card button.e99-own[onclick="openPlan(\''+id+'\')"]');const other=document.querySelector('#view .plan-card button[onclick="openPlan(\'p1\')"]');return !!own&&getComputedStyle(own).display!=='none'&&(!other||getComputedStyle(other).display==='none')},plA.id),'iPhone: "Editar plano" só no plano dele');
 ok(await B.evaluate(()=>openPlan('p1')===false&&!planDraft),'iPhone: não edita plano do gestor');
 await B.evaluate(()=>planToggleDone('p1','a1'));await B.waitForTimeout(500);
 ok(await A.evaluate(()=>{}).then(()=>until(A,(x)=>state.nfs.some(n=>n.number==='77001'&&n.cby==='Ana')&&state.plans.some(p=>p.id===x&&p.cby==='Ana'),plA.id,30000)),'PC: NF e plano do auxiliar chegaram ao gestor');
 ok(await until(A,()=>{const p=state.plans.find(x=>x.id==='p1');return p&&p.activities[0].done===true},null,20000),'PC: atividade marcada pelo auxiliar chegou');
 /* auxiliar edita a própria NF; tentativa de mudar a do gestor e de apagar pelo ntfy */
 await B.evaluate(id=>{openEditor('nf',id);const f=document.getElementById('editor');f.elements.supplier.value='Fornecedor editado';f.requestSubmit()},nfA.id);await B.waitForTimeout(1200);
 ok(await until(A,()=>state.nfs.some(n=>n.number==='77001'&&n.supplier==='Fornecedor editado'),null,20000),'PC: edição da NF do auxiliar chegou');
 ok(await B.evaluate(()=>{openEditor('nf','n1');return !document.getElementById('modal')||!document.getElementById('modal').open}),'iPhone: não abre para editar NF do gestor');
 await B.evaluate(async()=>{const n1=state.nfs.find(x=>x.id==='n1');await e99SyncSend('ops',{ops:[{c:'nfs',i:'n1',t:Date.now()+5e6,b:'Ana',x:Object.assign({},n1,{supplier:'HACK'})},{c:'nfs',i:'n1',t:Date.now()+6e6,b:'Ana',d:1},{c:'plans',i:'p1',t:Date.now()+6e6,b:'Ana',d:1}]})});
 await A.waitForTimeout(4000);
 ok(await A.evaluate(()=>{const n=state.nfs.find(x=>x.id==='n1');return !!n&&n.supplier==='Laticínios'&&state.plans.some(p=>p.id==='p1')}),'PC: NF/plano do gestor não mudam nem somem com mensagem forjada do auxiliar');
 ok(await B.evaluate(()=>{e99Del('nf','n1');return state.nfs.some(x=>x.id==='n1')}),'iPhone: auxiliar não exclui NF de outra pessoa');
 /* ---------- A: perfil ---------- */
 await A.evaluate(()=>go('profile'));await A.waitForTimeout(500);
 ok(await A.evaluate(()=>page==='profile'&&!!document.getElementById('pf-form')&&/@vferreiras/.test(document.getElementById('view').textContent)&&/Gestor/.test(document.getElementById('view').textContent)),'PC: Perfil abre com @login e papel');
 await A.setInputFiles('#pf-photo-in',path.join(__dirname,'face.jpg'));await A.waitForTimeout(1500);
 await A.fill('#pf-name',BAD);await A.fill('#pf-cargo','Gestor do estoque');await A.fill('#pf-bio','Sobre <b>eu</b>');await A.click('#pf-form button[type=submit]');await A.waitForTimeout(1200);
 ok(await A.evaluate(b=>state.perfil&&state.perfil.name===b&&/^data:image\/jpeg;base64,/.test(state.perfil.photo)&&state.perfil.photo.length<120000,BAD),'PC: perfil salvo com foto pequena');
 ok(await A.evaluate(()=>!window.__xss&&!document.querySelector('#view img[src="x"]')&&!document.querySelector('#view .pf-bio b')),'PC: texto malicioso escapado na própria tela');
 await A.evaluate(()=>authLogout());await A.waitForTimeout(800);await A.reload();await A.waitForTimeout(2500);await L.login(A,'vferreiras','abc12345');await A.waitForTimeout(1500);
 ok(await A.evaluate(b=>!!authSession&&state.perfil&&state.perfil.name===b&&!!state.perfil.photo,BAD),'PC: perfil continua depois de sair, recarregar e entrar');
 ok(await until(B,b=>e99ProfilesAll().some(p=>!p.me&&p.p.name===b),BAD,30000),'iPhone: colega recebe o perfil do gestor pelo sync');
 await B.evaluate(()=>go('chat'));await B.waitForTimeout(400);await A.evaluate(()=>{go('chat')});await A.fill('#chat-text','Oi equipe').catch(()=>{});await A.evaluate(()=>{const f=document.querySelector('#chat-text');if(f)f.closest('form').requestSubmit()});
 ok(await until(B,()=>{const b=[...document.querySelectorAll('#view .chat-msg button.prof-chip')].find(x=>x.getAttribute('data-name')==='Vitor');return !!b&&!!b.querySelector('img.av')},null,30000),'iPhone: foto do gestor no chat');
 await B.evaluate(()=>{const b=[...document.querySelectorAll('#view .chat-msg button.prof-chip')].find(x=>x.getAttribute('data-name')==='Vitor');b.click()});await B.waitForTimeout(600);
 ok(await B.evaluate(()=>page==='profile'&&!!document.getElementById('pf-view')&&!document.getElementById('pf-form')&&/Gestor do estoque/.test(document.getElementById('view').textContent)),'iPhone: "Ver perfil" do colega abre só leitura');
 ok(await B.evaluate(()=>!window.__xss&&!document.querySelector('img[src="x"]')&&!document.querySelector('#view .pf-bio b')),'iPhone: texto malicioso do colega escapado');
 await B.evaluate(()=>openProfile('me'));await B.waitForTimeout(400);await B.fill('#pf-name','Ana Souza');await B.click('#pf-form button[type=submit]');await B.waitForTimeout(800);
 ok(await until(A,()=>e99ProfilesAll().some(p=>!p.me&&p.p.name==='Ana Souza'),null,30000),'PC: perfil do auxiliar chega ao gestor');
 await A.evaluate(()=>go('team'));await A.waitForTimeout(500);ok(await A.evaluate(()=>!!document.querySelector('#view .e99-prof-open')),'PC: Equipe tem "Ver perfil"');
 ok(!errs.length,'0 erro de console ('+errs.slice(0,3).join(' | ')+')');
 await b.close();process.exit(0)})().catch(e=>{console.log('FAIL erro '+e.message);process.exit(1)});
