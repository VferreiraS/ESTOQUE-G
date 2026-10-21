const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const mk=async(c)=>{const p=await (await b.newContext(c||{viewport:{width:1440,height:900}})).newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());return p};
 const A=await mk(),B=await mk(L.devices['iPhone 13']);
 ok(await L.gestorWithTeam(A,'ct'+T),'A team'); // has Ana + corridor 07 + NF owner ana
 await A.evaluate(async()=>{state.corridors.push({id:'c4old',number:'4',sector:'Velho',owner:''});state.nfs[0].corridor='c4old';await save()});
 const code=await A.evaluate(()=>e99Team.get().code);
 await B.goto('http://localhost:8000/index.html?ntfy='+L.N);await B.waitForTimeout(2000);await L.signup(B,'cb'+T);await B.evaluate(async c=>{await e99Team.join(c,'Celular',{team:'Equipe'})},code);
 ok(await until(B,()=>syncStatus().ready&&syncStatus().connected,40000),'B joined');
 await A.evaluate(()=>go('corridors'));await A.waitForTimeout(500);ok(!!await A.$('.cartazes-btn'),'button in Corredores');
 await A.click('.cartazes-btn');await A.waitForTimeout(400);console.log((await A.textContent('#cartazes-dlg')).slice(0,160));
 await A.click('#cartazes-dlg button.primary');await A.waitForTimeout(1200);
 const r=await A.evaluate(()=>({n:state.corridors.length,team:state.team.map(x=>x.name),c13:state.corridors.find(c=>c.number==='13').owner,c01:state.corridors.find(c=>c.number==='01').owner,c4:state.corridors.find(c=>c.id==='c4old'),c07:state.corridors.find(c=>c.number==='07'),nf:state.nfs[0].corridor,novo:!!state.corridors.find(c=>c.number==='Novo'),leo:state.corridors.find(c=>c.number==='05').owner===state.team.find(x=>x.name==='Leonardo').id}));
 console.log(JSON.stringify(r).slice(0,600));
 ok(r.n===15,'15 corridors (07 and 4 reused)');ok(['Leonardo','Thomaz DSL','Augusto'].every(n=>r.team.includes(n)),'3 people created');
 ok(r.c13==='todos'&&r.c01==='','13=TODOS, 01=A definir');ok(r.c4&&r.c4.sector==='Vidros em Geral'&&r.nf==='c4old','04 updated keeping id');ok(r.novo&&r.leo,'Novo + owner link');
 ok(/Copos, Jarras/.test(await A.textContent('#view')),'products shown on card');
 await A.click('.cartazes-btn');await A.waitForTimeout(400);ok(/já estão cadastrados/.test(await A.textContent('#cartazes-dlg')),'second time: nothing');
 ok(await until(B,()=>state.corridors.length===15&&state.corridors.some(c=>c.products),40000),'B receives the 15 corridors');
 // aux has no button
 await B.evaluate(()=>{authSession.payload.role='auxiliar';go('corridors')});await B.waitForTimeout(300);ok(!await B.$('.cartazes-btn'),'aux: no button');
 console.log('errors',errs);await b.close()})();
