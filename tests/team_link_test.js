const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();const B=await (await b.newContext(L.devices['iPhone 13'])).newPage();[A,B].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept())});
 ok(await L.gestorWithTeam(A,'tl'+Date.now()),'gestor team');await A.evaluate(()=>{state.team=[];state.corridors.push({id:'c11',number:'11',sector:'Bebidas',owner:''});return save()});
 const link=await L.makeInvite(A,'Bruno Lima');await L.auxAccept(B,link,null,'4321');
 ok(await until(A,()=>state.team.some(t=>t.login&&/bruno/i.test(t.name+t.login)),null,90000),'auxiliar sem e-mail confirmado entra na Equipe');
 await A.evaluate(()=>go('team'));await A.waitForTimeout(600);ok(/Bruno/.test(await A.textContent('#view')),'aparece na aba Equipe');
 ok(await until(A,()=>{const p=state.team.find(t=>/bruno/i.test(t.name+t.login));return p&&state.corridors.some(c=>c.owner===p.id)},null,15000),'recebe corredor sem responsável');
 await A.evaluate(()=>go('profile'));await A.waitForTimeout(600);const n=await A.evaluate(()=>[...document.querySelectorAll('.prof-people button b')].map(x=>x.textContent).filter(x=>/Bruno/.test(x)).length);ok(n===1,'aparece uma vez em Pessoas');
 console.log('errors',errs);await b.close()})();
