const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const A=await (await b.newContext(L.devices['iPhone 13'])).newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(A,'ph'+T),'phone gestor team');const code=await A.evaluate(()=>e99Team.get().code);
 await A.evaluate(()=>go('profile'));await A.waitForTimeout(500);await A.click('text=Editar perfil');await A.fill('#prof-edit input[name=user]','@vitor.celular');await A.fill('#prof-edit input[name=cargo]','Gestor');await A.click('#prof-edit button[type=submit]');await A.waitForTimeout(3000);
 await A.context().close(); // phone closed
 const B=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();B.on('pageerror',e=>errs.push(e.message));B.on('dialog',d=>d.accept());
 await B.goto('http://localhost:8000/index.html?ntfy='+L.N);await B.waitForTimeout(2000);await L.signup(B,'pc'+T);
 await B.evaluate(async c=>{await e99Team.join(c,'Computador',{team:'Equipe'})},code);
 await B.evaluate(()=>go('profile'));let seen=false;for(let i=0;i<20&&!seen;i++){await B.waitForTimeout(1500);seen=await B.evaluate(()=>{render();return /vitor\.celular/.test(document.getElementById('view').innerText)})}
 ok(seen,'PC sees phone profile even with phone closed');
 console.log('errors',errs);await b.close()})();
