/* v118: som de login toda vez que o app abre. PC (navegador deixa tocar sem toque) e iPhone 13 simulado
   (AudioContext nasce suspenso e só destrava num toque, como o Safari): toca no primeiro toque, uma vez por abertura;
   login logo depois não repete; som do app desligado = nada; recarregar = toca de novo. */
const L=require('./lib.js');const {ok,until}=L;
const IOS=()=>{const O=window.AudioContext,G=Object.getOwnPropertyDescriptor(BaseAudioContext.prototype,'state').get;
 class F extends O{constructor(o){super(o);this.__s=1}get state(){return this.__s?'suspended':G.call(this)}
  resume(){const a=navigator.userActivation&&navigator.userActivation.isActive;return new Promise(r=>setTimeout(()=>{if(a)this.__s=0;super.resume().then(r,r)},300))}}
 window.AudioContext=F;window.webkitAudioContext=F};
(async()=>{const b=await L.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[];const T=Date.now();
 /* PC: o navegador deixa — toca ao abrir, sem toque */
 const pc=await b.newContext({viewport:{width:1440,height:900}});const A=await pc.newPage();A.on('pageerror',e=>errs.push('pc '+e.message));A.on('dialog',d=>d.accept());
 await A.goto('http://localhost:8000/index.html?ntfy='+L.N);
 ok(await until(A,()=>window.__e99LoginSounds===1,null,5000),'PC: som de login toca ao abrir o app (sem toque)');
 await L.signup(A,'s8p'+T);await A.waitForTimeout(800);
 ok(await A.evaluate(()=>window.__e99LoginSounds===1),'PC: entrar na conta logo depois não repete o som');
 await A.reload();ok(await until(A,()=>window.__e99LoginSounds===1,null,5000),'PC: recarregar (abrir de novo) toca de novo');
 await A.evaluate(()=>{toggleSiteSound()});await A.reload();await A.waitForTimeout(1500);ok(await A.evaluate(()=>window.__e99LoginSounds===0&&!siteSoundEnabled),'PC: som do app desligado = sem som de login');
 await A.evaluate(()=>{toggleSiteSound()});
 /* iPhone simulado: bloqueado até o toque */
 const ip=await b.newContext({...L.devices['iPhone 13']});await ip.addInitScript(IOS);const B=await ip.newPage();B.on('pageerror',e=>errs.push('iphone '+e.message));B.on('dialog',d=>d.accept());
 await B.goto('http://localhost:8000/index.html?ntfy='+L.N);await B.waitForTimeout(1500);
 ok(await B.evaluate(()=>window.__e99LoginSounds===0&&e99LoginSound.pending()),'iPhone: sem toque o Safari não deixa — som fica guardado');
 await B.tap('#auth-form input[name=login]');ok(await until(B,()=>window.__e99LoginSounds===1,null,4000),'iPhone: toca no primeiro toque na tela');
 await B.tap('#auth-form input[name=password]');await B.waitForTimeout(800);ok(await B.evaluate(()=>window.__e99LoginSounds===1),'iPhone: não repete nos toques seguintes');
 await L.signup(B,'s8i'+T);await B.waitForTimeout(800);ok(await B.evaluate(()=>window.__e99LoginSounds===1),'iPhone: entrar na conta no mesmo uso não repete');
 await B.reload();await B.waitForTimeout(1200);ok(await B.evaluate(()=>window.__e99LoginSounds===0&&e99LoginSound.pending()),'iPhone: abrir de novo guarda o som outra vez');
 await B.tap('body',{position:{x:30,y:30}});ok(await until(B,()=>window.__e99LoginSounds===1,null,4000),'iPhone: e toca no primeiro toque de novo');
 /* Efeitos desligados e menos movimento: o som de login segue só o botão de som (como antes) */
 const rm=await b.newContext({...L.devices['iPhone 13'],reducedMotion:'reduce'});await rm.addInitScript(()=>{try{localStorage.setItem('lojasg.estoque99.visual-effects','off')}catch(e){}});await rm.addInitScript(IOS);
 const C=await rm.newPage();C.on('pageerror',e=>errs.push('rm '+e.message));await C.goto('http://localhost:8000/index.html?ntfy='+L.N);await C.waitForTimeout(1200);
 await C.tap('#auth-form input[name=login]');ok(await until(C,()=>window.__e99LoginSounds===1,null,4000),'menos movimento + Efeitos desligados: o som de login continua (segue o botão de som do app)');
 console.log('errors',errs);await b.close()})();
