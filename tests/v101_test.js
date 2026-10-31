/* v101: (A) a aba Equipe mostra as contas que entraram na equipe (perfil + o próprio dono);
   (B) conta que não é do dono (ex.: PC com 'gestor' antigo) não vê nem abre Administração e não faz ações de gestor. */
const L=require('./lib.js');const {ok,until}=L;
async function shut(p){await p.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()))}
async function seed(p,login,role){return p.evaluate(async([l,r])=>{const s=await authCreate(l,'Loja '+l,'1234',authEmpty(),r);authSaveNewAccount(s);return s.storeKey},[login,role])}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 const G=await (await b.newContext({viewport:{width:1300,height:900}})).newPage(),A=await (await b.newContext(L.devices['iPhone 13'])).newPage();[G,A].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept())});
 /* ---------- A: Equipe ---------- */
 ok(await L.gestorWithTeam(G,'eq'+T),'dono com equipe');const code=await G.evaluate(()=>e99Team.get().code);
 await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForTimeout(1500);await L.signup(A,'thomaz'+T);await A.evaluate(()=>go('chat'));
 await A.fill('#view form[onsubmit="chatJoin(event)"] input[name=code]',code);await A.fill('#view form[onsubmit="chatJoin(event)"] input[name=name]','Thomaz');await A.click('#view form[onsubmit="chatJoin(event)"] button');
 ok(await until(A,()=>!!(window.e99Team&&e99Team.get()),null,20000),'Thomaz entrou na equipe pelo código');
 await A.evaluate(()=>go('profile'));await A.waitForTimeout(500);await A.click('text=Editar perfil');await A.fill('#prof-edit input[name=name]','peludinho');await A.click('#prof-edit button[type=submit]');
 ok(await until(G,()=>{if(page!=='team')go('team');else render();return [...document.querySelectorAll('#view .cards .card.e99-acc h3')].some(h=>/peludinho/.test(h.textContent))},null,90000),'Equipe do dono mostra a conta do Thomaz (perfil "peludinho")');
 ok(await G.evaluate(()=>[...document.querySelectorAll('#view .cards .card.e99-acc h3')].some(h=>/\(você\)/.test(h.textContent))),'Equipe mostra o próprio dono');
 ok(await G.evaluate(()=>{const n=[...document.querySelectorAll('#view .cards .card h3')].map(h=>h.textContent);return n.filter(x=>/^Ana/.test(x)).length===1&&n[n.length-1]==='TODOS'}),'sem repetir colaborador e TODOS no fim');
 await G.click('#view .card.e99-acc .e99-acc-open');await G.waitForTimeout(500);ok(await G.evaluate(()=>page==='profile'),'Ver perfil abre o perfil');
 /* ---------- B: conta do PC com 'gestor' que não é do dono ---------- */
 const P=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();P.on('pageerror',e=>errs.push(e.message));P.on('dialog',d=>d.accept());
 await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1500);
 const pcLogin='pcgestor'+T;await seed(P,pcLogin,'gestor');await seed(P,'outra'+T,'estoque');await seed(P,'vferreiras','gestor');
 await L.login(P,pcLogin,'1234');await shut(P);ok(await P.evaluate(()=>!!authSession),'PC entra');
 ok(await P.evaluate(()=>authSession.payload.role==='estoque'),'PC: gestor antigo vira estoque ao entrar');
 ok(await P.evaluate(()=>!labels.admin&&!document.querySelector('[onclick*="\'admin\'"],[data-page=admin]')),'PC: sem Administração no menu');
 await P.evaluate(()=>go('admin'));await P.waitForTimeout(400);ok(await P.evaluate(()=>/Só o gestor/.test(document.getElementById('view').innerText)&&!document.querySelector('#view button.danger')&&!/Redefinir senha|Bloquear acesso/.test(document.getElementById('view').innerText)),'PC: tela Administração não abre');
 const n0=await P.evaluate(()=>authAccounts().length);
 await P.evaluate(async()=>{const rows=authAccounts();for(let i=0;i<rows.length;i++){try{authDeleteAccount(i)}catch(e){}try{authBlockAccount(i)}catch(e){}}authDeleteAllOtherAccounts();for(let i=0;i<rows.length;i++){try{await authAdminResetPassword(i)}catch(e){}}});await P.waitForTimeout(600);
 ok(await P.evaluate(n=>authAccounts().length===n&&!authAccounts().some(r=>r.blocked),n0),'PC: não apaga, não bloqueia nem redefine contas');
 ok(await P.evaluate(()=>!/Gestor/.test(document.getElementById('account-label').textContent)),'PC: rótulo não diz Site Gestor');
 /* ---------- o dono continua gestor ---------- */
 await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(1000);await shut(P);await L.login(P,'vferreiras','1234');
 ok(await P.evaluate(()=>authSession.payload.role==='gestor'&&!!labels.admin),'dono vferreiras continua gestor com Administração');
 await P.evaluate(()=>go('admin'));await P.waitForTimeout(400);ok(await P.evaluate(()=>/Contas cadastradas/.test(document.getElementById('view').innerText)),'dono abre Administração');
 await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(1000);await shut(P);await L.login(P,pcLogin,'1234');
 ok(await P.evaluate(()=>authSession.payload.role==='estoque'&&!labels.admin),'trocar de conta na mesma aba não devolve Administração');
 console.log('errors',errs);await b.close()})();
