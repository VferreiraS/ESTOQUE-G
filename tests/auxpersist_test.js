const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();const cb=await b.newContext(L.devices['iPhone 13']);let B=await cb.newPage();[A,B].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept())});
 ok(await L.gestorWithTeam(A,'gp'+T),'gestor team');const link=await L.makeInvite(A,'Ana');
 // aux: open invite, type code, create account — then the tab "loses" the join info (closed / app opened elsewhere)
 await B.goto(L.inviteUrl(link));await B.waitForTimeout(2500);
 const KEY=await A.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('lojasg.estoque99.aux-invites:'));return JSON.parse(localStorage.getItem(k))[0].key});
 await B.fill('#aux-form input[name=pin]',KEY);await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);
 await B.fill('#aux-form input[name=email]',L.mail('ana'));await B.fill('#aux-form input[name=password]','4321');await B.fill('#aux-form input[name=confirmation]','4321');await L.terms(B,'#aux-form');await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);
 await B.evaluate(()=>{sessionStorage.removeItem('e99-aux-join')});
 await B.fill('#recovery-last4',(await B.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await B.click('#recovery-enter');await B.waitForTimeout(3000);
 ok(await until(B,()=>!!(window.e99Team&&e99Team.get()),20000),'chat config present without the tab info');
 await B.evaluate(()=>go('chat'));await B.waitForTimeout(1500);
 ok(!!await B.$('#chat-text'),'chat composer available');
 await B.evaluate(()=>chatSend('mensagem depois de reabrir'));
 await A.evaluate(()=>go('chat'));let got=false;for(let i=0;i<15&&!got;i++){await A.waitForTimeout(1000);got=await A.evaluate(()=>/mensagem depois de reabrir/.test(document.getElementById('view').innerText))}ok(got,'gestor receives');
 await B.evaluate(()=>go('profile'));await B.waitForTimeout(1500);ok(/Repositora/.test(await B.textContent('#view')),'profile with cargo');
 console.log('errors',errs);await b.close()})();
