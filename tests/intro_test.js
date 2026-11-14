const L=require('./lib.js');
const {ok,until}=L;
const errors=[];
function watchPage(p){
 p.on('pageerror',e=>{
  const stack=e.stack||e.message||'';
  const knownAuthFrame=e.name==='SecurityError'
   &&e.message==="Failed to read the 'sessionStorage' property from 'Window': Access is denied for this document."
   &&/https:\/\/apis\.google\.com\/js\/api\.js/.test(stack)
   &&/https:\/\/apis\.google\.com\/_\/scs\/[^\s]*gapi_iframes/.test(stack);
  const detail=p.url()+' :: '+stack;
  if(knownAuthFrame)console.log('WARNING externo conhecido (Firebase Auth Emulator, iframe gapi/sessionStorage): '+detail);
  else errors.push(detail);
 });
}
(async()=>{
 const b=await L.chromium.launch();let p;
 try{
  const c=await b.newContext(L.devices['iPhone 13']);p=await c.newPage();watchPage(p);
  await p.goto('http://localhost:8000/index.html?ntfy='+L.N);await p.waitForSelector('#auth-form');
  ok(!(await p.$('#stok-gate')),'nenhuma tela #stok-gate no login');
  ok(await p.evaluate(()=>typeof window.playStokIntro==='function'&&typeof window.replayEntrySplash==='function'),'callbacks públicos de intro preservados');
  await p.evaluate(()=>window.playStokIntro());await p.waitForSelector('#stok-intro');
  ok(await p.evaluate(()=>getComputedStyle(document.querySelector('.entry-splash')).display==='none'),'splash legado oculto por seletor computado durante movimento normal');
  ok(await p.evaluate(()=>{const e=document.querySelector('#stok-intro');return !!e&&e.getAttribute('aria-hidden')==='true'&&getComputedStyle(e).pointerEvents==='none'}),'intro decorativa, aria-hidden e sem bloquear interação');
  await p.fill('#auth-form input[name=login]','teste-input-na-intro');
  ok(await p.evaluate(()=>document.activeElement?.name==='login'&&document.activeElement.value==='teste-input-na-intro'),'campo de login aceita foco e entrada durante a intro');
  await p.waitForTimeout(3000);ok(!(await p.$('#stok-intro')),'intro removida ao fim da sequência curta');
  await p.evaluate(()=>window.replayEntrySplash());ok(!!(await p.$('#stok-intro')),'replayEntrySplash reapresenta a intro');
  await p.waitForTimeout(3000);

  // Cria conta local de teste e autentica pelo caminho normal, sem dados de produção.
  const login='intro'+Date.now().toString(36);await L.signup(p,login,'Loja teste intro');
  ok(await p.evaluate(()=>!!authSession),'fluxo auxiliar de teste concluiu criação local de conta');
  await p.evaluate(()=>{window.confirm=()=>true;return authLogout()});await p.waitForTimeout(1000);
  await p.evaluate(()=>window.playStokIntro());await p.waitForSelector('#stok-intro');
  await p.fill('#auth-form input[name=login]',login);await p.fill('#auth-form input[name=password]','1234');
  ok(await p.evaluate(()=>!!document.querySelector('#stok-intro')&&!!document.querySelector('#auth-form input[name=login]')),'login permanece visível e preenchível durante a intro');
  await p.click('#auth-form button[type=submit]');
  ok(await until(p,()=>!!authSession,null,15000),'rota normal de login aceita a ação enquanto a intro está ativa');
  ok(await p.evaluate(()=>typeof window.playStokIntro==='function'&&typeof window.replayEntrySplash==='function'),'callbacks continuam disponíveis após autenticação');

  await p.evaluate(()=>{authLogout()});await p.waitForTimeout(900);
  await p.evaluate(()=>window.playStokIntro());ok(!!(await p.$('#stok-intro canvas.si-canvas')),'v122/v140: abertura com o S (canvas) sempre (sem preferência Efeitos)');

  const rc=await b.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const rp=await rc.newPage();watchPage(rp);
  await rp.goto('http://localhost:8000/index.html?ntfy='+L.N);await rp.waitForSelector('#auth-form');
  await rp.evaluate(()=>window.playStokIntro());await rp.waitForSelector('#stok-intro');
  ok(await rp.evaluate(()=>getComputedStyle(document.querySelector('.entry-splash')).display==='none'),'splash legado oculto por seletor computado com prefers-reduced-motion');
  ok(await rp.evaluate(()=>{const e=document.querySelector('#stok-intro');return !e.dataset.reducedMotion&&getComputedStyle(e.querySelector('.si-word')).animationName==='si-type'&&getComputedStyle(e.querySelector('.si-cap')).display!=='none'&&window.e99IntroRunning()}),'v146: com prefers-reduced-motion a abertura anima igual (decisão do dono)');
  ok(await rp.evaluate(()=>getComputedStyle(document.querySelector('#stok-intro')).pointerEvents==='none'),'intro reduzida também não intercepta interação');
  await rp.fill('#auth-form input[name=login]','teste-input-reduzido');
  ok(await rp.evaluate(()=>document.activeElement?.name==='login'&&document.activeElement.value==='teste-input-reduzido'),'campo de login segue interativo com movimento reduzido');
  ok(!(await rp.$('#stok-gate')),'movimento reduzido não introduz gate');
  await rp.waitForTimeout(3400);ok(!(await rp.$('#stok-intro')),'abertura com movimento reduzido também é removida');await rc.close();
  ok(errors.length===0,'sem erros JavaScript de primeira parte'+(errors.length?': '+errors.join(' | '):''));
 }finally{await b.close()}
})();
