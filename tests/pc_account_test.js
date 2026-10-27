const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const G=await (await b.newContext({viewport:{width:1300,height:900}})).newPage(),P=await (await b.newContext({viewport:{width:1300,height:900}})).newPage(),N=await (await b.newContext({viewport:{width:1300,height:900}})).newPage();[G,P,N].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept())});
 ok(await L.gestorWithTeam(G,'pg'+Date.now()),'gestor com equipe');
 await G.evaluate(()=>go('chat'));await G.waitForTimeout(500);await G.click('#aux-box summary');await G.fill('#aux-box input[name=name]','Computador');await G.check('#aux-box input[name=pc]');
 await G.evaluate(()=>{navigator.share=t=>{window.__inv=t.text;return Promise.resolve()}});await G.click('#aux-box button.primary');await G.waitForTimeout(2500);
 const text=await G.evaluate(()=>window.__inv);const link=text.match(/(http\S+#auxiliar=[A-Za-z0-9_-]+)/)[1];const KEY=await G.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('lojasg.estoque99.aux-invites:'));const l=JSON.parse(localStorage.getItem(k))[0];return l.pc?l.key:''});ok(!!KEY,'convite marcado como conta PC');
 await P.goto(L.inviteUrl(link));await P.waitForTimeout(2500);await P.fill('#aux-form input[name=pin]',KEY);await P.click('#aux-form button[type=submit]');await P.waitForTimeout(3000);
 ok(!(await P.$('#aux-form input[name=email]'))&&/não precisa de e-mail/.test(await P.textContent('#aux-form')),'tela da conta PC sem campo de e-mail');
 await P.fill('#aux-form input[name=password]','2580');await P.fill('#aux-form input[name=confirmation]','2580');await L.terms(P,'#aux-form');await P.click('#aux-form button[type=submit]');await P.waitForTimeout(3000);
 await P.fill('#recovery-last4',(await P.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await P.click('#recovery-enter');await P.waitForTimeout(4000);
 ok(await P.evaluate(()=>!!authSession),'conta PC criada sem e-mail');ok(await P.evaluate(()=>!(document.getElementById('cloud-link')||{}).open),'não pede para vincular e-mail');
 ok(await until(P,()=>!!(window.e99Team&&e99Team.get()),null,20000),'conta PC entra na equipe e no chat');
 ok(await until(P,()=>!!(window.e99Cloud&&e99Cloud.user()&&/@pc\.stok-e99\.app$/.test(e99Cloud.user().email)),null,20000),'conta PC entra na nuvem com e-mail interno (vê perfis e selo)');
 const lg=await P.evaluate(()=>authSession.record.login);await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(1000);await L.login(P,lg,'2580');await P.waitForTimeout(2500);
 ok(await P.evaluate(()=>!!authSession&&!(document.getElementById('cloud-link')||{}).open),'sai e entra de novo sem pedir e-mail');
 await P.evaluate(()=>go('account'));await P.waitForTimeout(500);ok(/Conta do PC do estoque: não usa e-mail/.test(await P.textContent('#view')),'tela Conta explica');
 // criar conta normal com a caixa PC
 await N.goto('http://localhost:8000/index.html?ntfy='+L.N);await N.waitForTimeout(1500);await N.click('#auth-create');await N.fill('#auth-screen input[name=store]','PC loja');await N.fill('#auth-screen input[name=login]','pc'+Date.now());await N.check('#auth-screen input[name=pc]');
 await N.fill('#auth-screen input[name=password]','1234');await N.fill('#auth-screen input[name=confirmation]','1234');await L.terms(N,'#auth-form');await N.click('#auth-form button[type=submit]');await N.waitForTimeout(2500);ok(!!(await N.$('.recovery-code')),'criar conta com a caixa PC: sem e-mail');
 // conta normal continua exigindo e-mail
 const M=await (await b.newContext()).newPage();await M.goto('http://localhost:8000/index.html?ntfy='+L.N);await M.waitForTimeout(1500);await M.click('#auth-create');ok(await M.evaluate(()=>document.querySelector('#auth-screen input[name=email]').required),'conta normal continua exigindo e-mail');
 await M.reload();await M.waitForTimeout(1500);await L.signup(M,'normal'+Date.now());ok(await M.evaluate(()=>!localStorage.getItem('lojasg.estoque99.pc-account:'+authSession.storeKey)&&!!localStorage.getItem('lojasg.estoque99.cloud-email:'+authSession.storeKey)),'conta normal NÃO vira conta PC');
 // conta comum já criada vira a conta do PC (só uma)
 const Q=await (await b.newContext()).newPage();Q.on('dialog',d=>d.accept());await Q.goto('http://localhost:8000/index.html?ntfy='+L.N);await Q.waitForTimeout(1500);await L.signup(Q,'virapc'+Date.now());
 await Q.evaluate(()=>e99CloudOpen());await Q.waitForTimeout(400);ok(!!(await Q.$('#cloud-link button[onclick="e99MakePc()"]')),'aviso de e-mail oferece "conta do PC"');
 await Q.click('#cloud-link button[onclick="e99MakePc()"]');await Q.waitForTimeout(1500);ok(await Q.evaluate(()=>!!localStorage.getItem('lojasg.estoque99.pc-account:'+authSession.storeKey)&&!(document.getElementById('cloud-link')||{}).open),'virou conta do PC e não pede e-mail');
 await Q.evaluate(()=>{window.confirm=()=>true;return authLogout()});await Q.waitForTimeout(1000);await L.signup(Q,'outra'+Date.now());await Q.evaluate(()=>e99CloudOpen());await Q.waitForTimeout(400);ok(!(await Q.$('#cloud-link button[onclick="e99MakePc()"]')),'segunda conta no mesmo aparelho não pode ser PC');
 // v99: no PC (tela larga, sem toque) criar conta comum e entrar por convite; e a falha de rede diz o que está bloqueado
 const W=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();W.on('pageerror',e=>errs.push(e.message));W.on('dialog',d=>d.accept());await W.goto('http://localhost:8000/index.html?ntfy='+L.N);await W.waitForTimeout(1500);
 ok(await W.evaluate(()=>!matchMedia('(pointer:coarse)').matches&&innerWidth>=1440),'PC: tela larga sem toque');await L.signup(W,'pcnormal'+Date.now());ok(await W.evaluate(()=>!!authSession),'PC: cria conta comum (com e-mail) e entra');
 const lk=await L.makeInvite(G,'Caixa PC');const X=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();X.on('pageerror',e=>errs.push(e.message));X.on('dialog',d=>d.accept());await L.auxAccept(X,lk,null,'3690');
 ok(await X.evaluate(()=>!!authSession&&authSession.payload.role==='auxiliar'),'PC: entra por convite (auxiliar)');ok(await until(X,()=>!!(window.e99Team&&e99Team.get())),'PC: convite já entra na equipe');
 const Y=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();await Y.route(/127\.0\.0\.1:9099|identitytoolkit\.googleapis\.com/,r=>r.abort());await Y.route(/^https:\/\/firestore\.googleapis\.com\/$/,r=>r.fulfill({status:404,body:''}));
 await Y.goto('http://localhost:8000/index.html?ntfy='+L.N);await Y.waitForTimeout(1500);await L.login(Y,'soemnuvem'+Date.now(),'1234');ok(await until(Y,()=>{const d=document.getElementById('cloud-pull');return !!(d&&d.open)},null,8000),'PC: conta fora do aparelho abre "Trazer da nuvem"');
 await Y.fill('#cloud-pull input[name=email]','alguem@teste.com');await Y.click('#cloud-pull button.primary');ok(await until(Y,()=>/barrando: login da nuvem \(identitytoolkit/.test((document.querySelector('#cloud-pull .cl-err')||{}).textContent||''),null,30000),'PC: rede bloqueada diz qual serviço (não "Sem internet")');
 ok(await Y.evaluate(()=>!/Sem internet/.test(document.getElementById('cloud-pull').textContent)),'PC: não culpa a internet quando o PC está online');
 console.log('errors',errs);await b.close()})();
