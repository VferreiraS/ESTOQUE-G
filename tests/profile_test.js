const L=require('./lib.js');const {ok,until}=L;const path=require('path');
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage(),B=await (await b.newContext(L.devices['iPhone 13'])).newPage();[A,B].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept())});
 ok(await L.gestorWithTeam(A,'adm'+T),'gestor team ready');const link=await L.makeInvite(A,'Ana Souza');await L.auxAccept(B,link,'','4321');
 await B.waitForTimeout(6000);
 // A edits profile
 await A.evaluate(()=>go('profile'));await A.waitForTimeout(800);ok(/Editar perfil/.test(await A.textContent('#view')),'own profile page');
 await A.click('text=Editar perfil');await A.setInputFiles('#prof-edit input[type=file] >> nth=1',path.join(__dirname,'face.jpg'));await A.waitForTimeout(800);
 await A.setInputFiles('#prof-edit input[type=file] >> nth=0',path.join(__dirname,'face.jpg'));await A.waitForTimeout(800);
 await A.fill('#prof-edit input[name=user]','@vitor.gestor');await A.fill('#prof-edit input[name=cargo]','Gestor de estoque');await A.fill('#prof-edit textarea[name=bio]','Tudo no seu lugar.');
 await A.click('#prof-edit button[type=submit]');await A.waitForTimeout(1500);
 const pa=await A.evaluate(()=>document.querySelector('#view .prof').innerText);ok(/@vitor.gestor/.test(pa)&&/Tudo no seu lugar/.test(pa),'profile saved');
 ok(await A.evaluate(()=>!!document.querySelector('#view .prof-head img.av')),'photo shown');
 await A.screenshot({path:require('os').tmpdir()+'/stok-prof-desktop.png'});
 // B receives
 let got=false;for(let i=0;i<20&&!got;i++){await B.waitForTimeout(1000);got=await B.evaluate(()=>{go('profile');return /vitor\.gestor/.test(document.getElementById('view').innerText)})}
 ok(got,'aux sees gestor in people list');
 await B.evaluate(()=>{const b=[...document.querySelectorAll('.prof-people button')].find(x=>/vitor/.test(x.innerText));b&&b.click()});await B.waitForTimeout(800);
 ok(/Tudo no seu lugar/.test(await B.textContent('#view')),'aux opens gestor profile');await B.screenshot({path:require('os').tmpdir()+'/stok-prof-iphone.png'});
 // chat avatar
 await A.evaluate(()=>go('chat'));await A.waitForTimeout(500);await A.fill('#chat-text','oi equipe');await A.press('#chat-text','Enter');
 await B.evaluate(()=>go('chat'));let av=false;for(let i=0;i<15&&!av;i++){await B.waitForTimeout(1000);av=await B.evaluate(()=>!!document.querySelector('#chat-list .who img.av'))}
 ok(av,'chat shows photo of sender');await B.screenshot({path:require('os').tmpdir()+'/stok-prof-chat.png'});
 // aux edits own profile; A sees
 await B.evaluate(()=>go('profile'));await B.waitForTimeout(500);await B.click('text=Editar perfil');await B.fill('#prof-edit input[name=user]','@vitor.gestor');await B.click('#prof-edit button[type=submit]');await B.waitForTimeout(500);
 ok(/já é de/.test(await B.textContent('#prof-edit')),'duplicate username refused');
 await B.fill('#prof-edit input[name=user]','@ana');await B.fill('#prof-edit textarea[name=bio]','Repondo tudo');await B.click('#prof-edit button[type=submit]');
 let ga=false;for(let i=0;i<20&&!ga;i++){await A.waitForTimeout(1000);ga=await A.evaluate(()=>{go('profile');return /@ana/.test(document.getElementById('view').innerText)})}ok(ga,'gestor sees aux profile');
 const sw=await B.evaluate(()=>document.documentElement.scrollWidth);ok(sw<=390,'no horizontal scroll '+sw);
 console.log('errors',errs);await b.close()})();
