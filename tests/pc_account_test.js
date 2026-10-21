const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const G=await (await b.newContext({viewport:{width:1300,height:900}})).newPage(),P=await (await b.newContext({viewport:{width:1300,height:900}})).newPage(),N=await (await b.newContext({viewport:{width:1300,height:900}})).newPage();[G,P,N].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept())});
 ok(await L.gestorWithTeam(G,'pg'+Date.now()),'gestor com equipe');
 await G.evaluate(()=>go('chat'));await G.waitForTimeout(500);await G.click('#aux-box summary');await G.fill('#aux-box input[name=name]','Computador');await G.check('#aux-box input[name=pc]');
 await G.evaluate(()=>{navigator.share=t=>{window.__inv=t.text;return Promise.resolve()}});await G.click('#aux-box button.primary');await G.waitForTimeout(2500);
 const text=await G.evaluate(()=>window.__inv);const link=text.match(/(http\S+#auxiliar=[A-Za-z0-9_-]+)/)[1];const KEY=await G.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('lojasg.estoque99.aux-invites:'));const l=JSON.parse(localStorage.getItem(k))[0];return l.pc?l.key:''});ok(!!KEY,'convite marcado como conta PC');
 await P.goto(L.inviteUrl(link));await P.waitForTimeout(2500);await P.fill('#aux-form input[name=pin]',KEY);await P.click('#aux-form button[type=submit]');await P.waitForTimeout(3000);
 ok(!(await P.$('#aux-form input[name=email]'))&&/não precisa de e-mail/.test(await P.textContent('#aux-form')),'tela da conta PC sem campo de e-mail');
 await P.fill('#aux-form input[name=password]','2580');await P.fill('#aux-form input[name=confirmation]','2580');await P.click('#aux-form button[type=submit]');await P.waitForTimeout(3000);
 await P.fill('#recovery-last4',(await P.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await P.click('#recovery-enter');await P.waitForTimeout(4000);
 ok(await P.evaluate(()=>!!authSession),'conta PC criada sem e-mail');ok(await P.evaluate(()=>!(document.getElementById('cloud-link')||{}).open),'não pede para vincular e-mail');
 ok(await until(P,()=>!!(window.e99Team&&e99Team.get()),null,20000),'conta PC entra na equipe e no chat');
 const lg=await P.evaluate(()=>authSession.record.login);await P.evaluate(()=>{window.confirm=()=>true;return authLogout()});await P.waitForTimeout(1000);await L.login(P,lg,'2580');await P.waitForTimeout(2500);
 ok(await P.evaluate(()=>!!authSession&&!(document.getElementById('cloud-link')||{}).open),'sai e entra de novo sem pedir e-mail');
 await P.evaluate(()=>go('account'));await P.waitForTimeout(500);ok(/Conta do PC do estoque: não usa e-mail/.test(await P.textContent('#view')),'tela Conta explica');
 // criar conta normal com a caixa PC
 await N.goto('http://localhost:8000/index.html?ntfy='+L.N);await N.waitForTimeout(1500);await N.click('text=Criar conta de outro estoque');await N.fill('#auth-screen input[name=store]','PC loja');await N.fill('#auth-screen input[name=login]','pc'+Date.now());await N.check('#auth-screen input[name=pc]');
 await N.fill('#auth-screen input[name=password]','1234');await N.fill('#auth-screen input[name=confirmation]','1234');await N.click('#auth-form button[type=submit]');await N.waitForTimeout(2500);ok(!!(await N.$('.recovery-code')),'criar conta com a caixa PC: sem e-mail');
 // conta normal continua exigindo e-mail
 const M=await (await b.newContext()).newPage();await M.goto('http://localhost:8000/index.html?ntfy='+L.N);await M.waitForTimeout(1500);await M.click('text=Criar conta de outro estoque');ok(await M.evaluate(()=>document.querySelector('#auth-screen input[name=email]').required),'conta normal continua exigindo e-mail');
 await M.reload();await M.waitForTimeout(1500);await L.signup(M,'normal'+Date.now());ok(await M.evaluate(()=>!localStorage.getItem('lojasg.estoque99.pc-account:'+authSession.storeKey)&&!!localStorage.getItem('lojasg.estoque99.cloud-email:'+authSession.storeKey)),'conta normal NÃO vira conta PC');
 console.log('errors',errs);await b.close()})();
