const L=require('./lib.js');const {ok,until}=L;
let PW;try{PW=require('playwright')}catch(e){PW=require('/opt/node22/lib/node_modules/playwright')}
(async()=>{
 // som: no iPhone a abertura v84 não pede toque ("Toque para abrir" removido); o som é liberado no primeiro toque do usuário
 const raw=await PW.chromium.launch();const c=await raw.newContext(PW.devices['iPhone 13']);await c.addInitScript(()=>{try{localStorage.setItem('e99-test-autointro','1')}catch(e){}});const P=await c.newPage();await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(200);
 ok(await P.evaluate(()=>!document.getElementById('stok-gate')&&!!document.getElementById('stok-intro')),'iPhone: abertura sem tela "Toque para abrir"');await P.waitForTimeout(1500);await P.tap('body');/* v140: a abertura dura ~2,8 s */await P.waitForTimeout(1500);
 ok(await P.evaluate(()=>!document.getElementById('stok-intro')),'abertura some sozinha e não bloqueia');ok(await P.evaluate(()=>siteAudio&&siteAudio.state==='running'),'som liberado no toque');await raw.close();
 // temas únicos
 const b=await L.chromium.launch();const errs=[];const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage(),B=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();[A,B].forEach(p=>p.on('pageerror',e=>errs.push(e.message)));
 for(const [p,l] of [[A,'tema'+Date.now()],[B,'outro'+Date.now()]]){await p.goto('http://localhost:8000/index.html?ntfy='+L.N);await p.waitForTimeout(1200);await L.signup(p,l)}
 const ta=await A.evaluate(()=>e99AnimTheme()),tb=await B.evaluate(()=>e99AnimTheme());ok(ta&&tb&&JSON.stringify(ta)!==JSON.stringify(tb),'contas diferentes, animações diferentes');
 ok(await A.evaluate(()=>getComputedStyle(document.body).getPropertyValue('--fx-shine').trim()!==''&&!!window.e99EntryKF),'tema aplicado no site');
 /* v121: sem IA — a animação é uma combinação da conta; pedir outra muda o tema sem chamar agente nenhum */
 ok(await A.evaluate(()=>!window.e99Agent&&!(window.extraPages&&window.extraPages.agentes)),'sem e99Agent nem tela Agentes');
 const t0=await A.evaluate(()=>JSON.stringify(e99AnimTheme()));await A.evaluate(()=>e99AnimNew());
 ok(await until(A,a=>{const t=e99AnimTheme();return !!t&&JSON.stringify(t)!==a&&t.por==='combinação da conta'},t0,10000),'pedir outra animação cria uma combinação nova da conta (sem IA)');
 console.log('errors',errs);await b.close()})();
