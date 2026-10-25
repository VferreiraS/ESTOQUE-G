/* v93: som de abertura no iPhone. Simula o Safari do iOS no emulador do iPhone 13: o AudioContext nasce suspenso,
   resume() só termina ~0,7 s depois (assíncrono) e o Web Audio respeita a chave de silêncio se a sessão não for "playback".
   Na v92 o login terminava antes do resume e a abertura desistia calada. Agora: nada antes do toque; depois do toque
   o áudio é retomado dentro do gesto, a sessão vira "playback" e a abertura toca quando o áudio fica pronto. */
const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 const c=await b.newContext({...L.devices['iPhone 13']});
 await c.addInitScript(()=>{try{localStorage.removeItem('lojasg.estoque99.music')}catch(e){}
  try{Object.defineProperty(navigator,'audioSession',{configurable:true,value:{type:'auto'}})}catch(e){}
  const O=window.AudioContext,G=Object.getOwnPropertyDescriptor(BaseAudioContext.prototype,'state').get;window.__ios={made:0,resumeInGesture:0,resumeOutside:0,silent:0};
  class F extends O{constructor(o){super(o);this.__s=1;window.__ios.made++}
   get state(){return this.__s?'suspended':G.call(this)}
   resume(){const a=navigator.userActivation&&navigator.userActivation.isActive;if(a)window.__ios.resumeInGesture++;else window.__ios.resumeOutside++;
    return new Promise(r=>setTimeout(()=>{if(a)this.__s=0;super.resume().then(r,r)},700))}
   createBufferSource(){const s=super.createBufferSource(),st=s.start.bind(s);s.start=(...x)=>{if(s.buffer&&s.buffer.length===1)window.__ios.silent++;return st(...x)};return s}}
  window.AudioContext=F;window.webkitAudioContext=F});
 const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForSelector('#auth-form input[name=login]');await A.waitForTimeout(1500);
 await A.evaluate(()=>{window.__calls=[];const p=playSiteSound;playSiteSound=function(k){window.__calls.push(k);return p.apply(this,arguments)}});
 ok(await A.evaluate(()=>!siteAudio&&e99Music().stings===0&&window.__ios.made===0),'antes do toque: nenhum áudio criado e nenhum som');
 const l='ios'+T;await L.signup(A,l);
 ok(await A.evaluate(()=>window.__calls.includes('login')),'ao entrar o app pede o som de abertura (playSiteSound login)');
 ok(await A.evaluate(()=>window.__ios.resumeInGesture>0),'áudio retomado dentro do toque');
 ok(await A.evaluate(()=>window.__ios.silent>0),'amostra muda tocada no toque (destrave do iOS)');
 ok(await A.evaluate(()=>navigator.audioSession.type==='playback'),'sessão de áudio "playback" (toca com a chave de silêncio)');
 ok(await until(A,()=>e99Music().stings>=1&&siteAudio.state==='running',null,5000),'som de abertura toca depois que o áudio fica pronto');
 ok(await A.evaluate(()=>!e99Music().on&&!e99Music().pref),'música continua desligada (botão ♫ liga)');
 /* abertura chamada num toque com o áudio ainda suspenso: espera e toca */
 await A.evaluate(()=>{siteAudio.__s=1});const n0=await A.evaluate(()=>e99Music().stings);
 await A.evaluate(()=>{const b=document.createElement('button');b.id='t-intro';b.textContent='x';b.style.cssText='position:fixed;top:0;left:0;z-index:99999;width:60px;height:60px';b.onclick=()=>playStokIntro(true);document.body.appendChild(b)});
 await A.tap('#t-intro');ok(await until(A,n=>e99Music().stings>n,n0,4000),'abertura com som depois de um toque (áudio suspenso no começo)');
 await c.close();console.log('errors',errs);ok(errs.length===0,'sem erros de JavaScript');await b.close()})();
