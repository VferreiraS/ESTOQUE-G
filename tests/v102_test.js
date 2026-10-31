/* v102: Agentes e Agenda fora do menu e das rotas; Administração funciona para o gestor (PC e celular): lista, bloqueia, apaga e redefine senha com código. */
const L=require('./lib.js');const {ok,until}=L;
async function shut(p){await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()))}
async function seed(p,login,role){return p.evaluate(async([l,r])=>{const s=await authCreate(l,'Loja '+l,'1234',authEmpty(),r);authSaveNewAccount(s);return s.recoveryCode},[login,role])}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['PC',{viewport:{width:1440,height:900}}],['celular',L.devices['iPhone 13']]]){
  const P=await (await b.newContext(opts)).newPage();P.on('pageerror',e=>errs.push(e.message));const ans=[];P.on('dialog',d=>{const v=ans.length?ans.shift():undefined;v===undefined?d.accept():d.accept(v)});
  await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1500);
  await seed(P,'vferreiras','gestor');const auxA='auxa'+T,auxB='auxb'+T,auxC='auxc'+T;await seed(P,auxA,'auxiliar');await seed(P,auxB,'auxiliar');const codeC=await seed(P,auxC,'auxiliar');
  await L.login(P,'vferreiras','1234');await shut(P);
  ok(await P.evaluate(()=>authSession.payload.role==='gestor'),nome+': gestor entra');
  ok(await P.evaluate(()=>!!labels.admin&&!labels.agentes&&!labels.agenda),nome+': menu com Administração, sem Agentes e Agenda');
  ok(await P.evaluate(()=>{const t=[...document.querySelectorAll('aside nav, #mobile-bottom, nav')].map(n=>n.innerText).join(' ');return !/Agentes|Agenda/.test(t)}),nome+': Agentes/Agenda não aparecem na navegação');
  await P.evaluate(()=>go('agenda'));await P.waitForTimeout(300);ok(await P.evaluate(()=>page==='plans'),nome+': rota Agenda leva ao Plano');
  await P.evaluate(()=>go('agentes'));await P.waitForTimeout(300);ok(await P.evaluate(()=>page==='home'),nome+': rota Agentes leva ao Início');
  if(nome==='celular'){await P.evaluate(()=>go('mobile-menu'));await P.waitForTimeout(400);ok(await P.evaluate(()=>/Administração/.test(document.getElementById('view').innerText)&&!/Agentes|Agenda/.test(document.getElementById('view').innerText)),'celular: menu "Mais" tem Administração e não tem Agentes/Agenda')}
  await P.evaluate(()=>go('admin'));await P.waitForTimeout(400);
  ok(await P.evaluate(l=>{const t=document.getElementById('view').innerText;return /Contas cadastradas/.test(t)&&l.every(x=>t.includes(x))},[auxA,auxB,auxC]),nome+': Administração lista as contas do aparelho');
  /* bloquear */
  const iA=await P.evaluate(l=>authAccounts().findIndex(r=>r.login===l),auxA);await P.evaluate(i=>authBlockAccount(i),iA);await P.waitForTimeout(300);
  ok(await P.evaluate(l=>authAccounts().find(r=>r.login===l).blocked,auxA),nome+': bloqueia conta');
  /* apagar (digita o login) */
  const iB=await P.evaluate(l=>authAccounts().findIndex(r=>r.login===l),auxB);ans.push(auxB);await P.evaluate(i=>authDeleteAccount(i),iB);await P.waitForTimeout(400);
  ok(await P.evaluate(l=>!authAccounts().some(r=>r.login===l),auxB),nome+': apaga conta');
  /* redefinir senha com o código de recuperação */
  const iC=await P.evaluate(l=>authAccounts().findIndex(r=>r.login===l),auxC);ans.push(codeC,'5678','5678');await P.evaluate(i=>authAdminResetPassword(i),iC);
  ok(await until(P,()=>/redefinida/.test(document.getElementById('toast').textContent),null,30000),nome+': redefine senha do auxiliar');
  ok(await P.evaluate(()=>/Redefinir senha/.test(document.getElementById('view').innerText)&&!!document.querySelector('#view button.danger')),nome+': botões de apagar e redefinir na tela');
  await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);await shut(P);await L.login(P,auxC,'5678');await shut(P);
  ok(await P.evaluate(l=>!!authSession&&authSession.record.login===l,auxC),nome+': auxiliar entra com a senha nova');
  ok(await P.evaluate(()=>!labels.admin),nome+': auxiliar não vê Administração');
  await P.evaluate(()=>go('admin'));await P.waitForTimeout(300);ok(await P.evaluate(()=>page!=='admin'||/Só o gestor/.test(document.getElementById('view').innerText)),nome+': auxiliar não abre Administração');
  await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);await shut(P);
  await L.signup(P,'comum'+nome+T);ok(await P.evaluate(()=>authSession.payload.role==='estoque'&&!labels.admin),nome+': conta comum não vê Administração');
  await P.evaluate(()=>go('admin'));await P.waitForTimeout(300);ok(await P.evaluate(()=>/Só o gestor/.test(document.getElementById('view').innerText)&&!document.querySelector('#view button.danger')),nome+': conta comum não abre Administração');
 }
 /* conta do dono criada em "Criar conta" (estoque) com o uid verificado S: vira gestor e vê Administração */
 const D=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();D.on('pageerror',e=>errs.push(e.message));D.on('dialog',d=>d.accept());await D.goto('http://localhost:8000/index.html?ntfy='+L.N);await D.waitForTimeout(1500);
 await L.signup(D,'dono'+T);ok(await D.evaluate(()=>authSession.payload.role==='estoque'&&!labels.admin),'conta comum sem uid verificado: sem Administração');
 await until(D,()=>!!(window.e99Cloud&&e99Cloud.user()),null,20000);await D.evaluate(()=>{const u=e99Cloud.user().uid;localStorage.setItem('lojasg.estoque99.verificados',JSON.stringify({[u]:'s'}));render()});await D.waitForTimeout(400);
 ok(await D.evaluate(()=>authSession.payload.role==='gestor'&&!!labels.admin),'conta do dono (uid com S) vira gestor e vê Administração');
  const E2=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();E2.on('dialog',d=>d.accept());await E2.goto('http://localhost:8000/index.html?ntfy='+L.N);await E2.waitForTimeout(1500);await L.signup(E2,'outro'+T);
 await E2.evaluate(()=>{localStorage.setItem('lojasg.estoque99.my-uid:'+authSession.storeKey,'uidQualquer12345');render()});await E2.waitForTimeout(300);ok(await E2.evaluate(()=>authSession.payload.role==='estoque'&&!labels.admin),'uid sem S continua sem Administração');
 console.log('errors',errs);await b.close()})();
