const L=require('./lib.js');const {ok,until}=L;const {spawn}=require('child_process');const path=require('path');
let PW;try{PW=require('playwright')}catch(e){PW=require('/opt/node22/lib/node_modules/playwright')}
(async()=>{const s1=spawn('node',[path.join(__dirname,'fake_llm.js'),'20143']);await new Promise(r=>setTimeout(r,700));
 // som: no iPhone, sem toque ainda, aparece "Toque para abrir" e o som toca junto da animação
 const raw=await PW.chromium.launch();const c=await raw.newContext(PW.devices['iPhone 13']);const P=await c.newPage();await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(900);
 ok(await P.evaluate(()=>!!document.getElementById('stok-gate')),'iPhone: "Toque para abrir" aparece');await P.tap('#stok-gate');await P.waitForTimeout(300);
 ok(await P.evaluate(()=>!!document.getElementById('stok-intro')&&!document.getElementById('stok-gate')),'toque: abertura começa junto');ok(await P.evaluate(()=>siteAudio&&siteAudio.state==='running'),'som liberado no toque');await raw.close();
 // temas únicos
 const b=await L.chromium.launch();const errs=[];const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage(),B=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();[A,B].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
 for(const [p,l] of [[A,'tema'+Date.now()],[B,'outro'+Date.now()]]){await p.goto('http://localhost:8000/index.html?ntfy='+L.N);await p.waitForTimeout(1200);await L.signup(p,l)}
 const ta=await A.evaluate(()=>e99AnimTheme()),tb=await B.evaluate(()=>e99AnimTheme());ok(ta&&tb&&JSON.stringify(ta)!==JSON.stringify(tb),'contas diferentes, animações diferentes');
 ok(await A.evaluate(()=>getComputedStyle(document.body).getPropertyValue('--fx-shine').trim()!==''&&!!window.e99EntryKF),'tema aplicado no site');
 await A.evaluate(()=>go('account'));await A.waitForSelector('#ag-cfg form');await A.evaluate(()=>document.querySelector('.ag-adv').open=true);await A.check('#ag-cfg input[name=local_on]');await A.fill('#ag-cfg input[name=local_url]','http://localhost:20143');await A.click('.ag-adv form button.primary');await A.waitForTimeout(400);
 await A.evaluate(()=>go('agentes'));await A.waitForTimeout(400);await A.click('text=Pedir outra animação aos agentes');
 ok(await until(A,()=>{const t=e99AnimTheme();return t&&t.entrada==='girar'&&t.matiz===30&&/Agente Local/.test(t.por)},null,10000),'agente criou a animação da conta');
 ok(await A.evaluate(()=>/virando em 3D/.test(document.getElementById('view').innerText)),'tela Agentes mostra a animação');
 console.log('errors',errs);await b.close();s1.kill()})();
