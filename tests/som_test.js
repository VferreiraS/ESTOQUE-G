/* v92: som de abertura e música ambiente (Web Audio, sem arquivos). Só depois de um toque e com o som do app ligado;
   a música começa desligada (botão ♫ no topo). Para em segundo plano, com o som desligado e ao sair.
   Também para ao rolar e com "menos movimento" / Efeitos desligados. */
const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 const c=await b.newContext({...L.devices['iPhone 13']});await c.addInitScript(()=>{try{localStorage.removeItem('lojasg.estoque99.music')}catch(e){}});
 const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForSelector('#auth-form input[name=login]');await A.waitForTimeout(1500);
 ok(await A.evaluate(()=>!siteAudio&&!e99Music().on&&e99Music().stings===0),'sem toque: nada de som nem música (regra do iPhone)');
 /* entrar: abertura com som (depois do toque), música começa desligada */
 const l='som'+T;await L.signup(A,l);
 ok(await until(A,()=>e99Music().stings>=1,null,4000),'som de abertura toca junto com a animação ao entrar');
 await A.waitForTimeout(2500);ok(await A.evaluate(()=>siteAudio&&siteAudio.state==='running'&&!e99Music().on&&!e99Music().pref),'música ambiente começa desligada (decisão do dono)');
 ok(await A.evaluate(()=>{const b=document.getElementById('music-btn');return !!b&&b.getAttribute('aria-pressed')==='false'&&/Música ambiente/.test(b.getAttribute('aria-label'))}),'botão de música no topo');
 await A.click('#music-btn');ok(await until(A,()=>e99Music().on&&e99Music().pref&&document.getElementById('music-btn').getAttribute('aria-pressed')==='true',null,4000),'botão liga a música (depois do toque)');
 ok(await A.evaluate(()=>e99Music().vol<=.06),'música em volume baixo');
 await A.click('#music-btn');ok(await until(A,()=>!e99Music().on&&!e99Music().pref,null,3000),'botão desliga a música');
 await A.click('#music-btn');ok(await until(A,()=>e99Music().on,null,4000),'e liga de novo');
 await A.evaluate(()=>toggleSiteSound());ok(await until(A,()=>!e99Music().on,null,3000),'som do app desligado: música para');
 await A.evaluate(()=>{e99MusicToggle();e99MusicToggle()});ok(await A.evaluate(()=>!e99Music().on&&e99Music().pref),'com o som desligado a música não toca');
 await A.evaluate(()=>toggleSiteSound());ok(await until(A,()=>e99Music().on,null,4000),'som ligado de novo: música volta');
 await A.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
 ok(await A.evaluate(()=>!e99Music().on),'em segundo plano a música para');
 await A.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
 await until(A,()=>e99Music().on,null,4000);
 await A.evaluate(()=>document.body.classList.add('e99-scrolling'));ok(await until(A,()=>!e99Music().on,null,3000),'rolando a tela: música para');
 await A.evaluate(()=>document.body.classList.remove('e99-scrolling'));ok(await until(A,()=>e99Music().on,null,4000),'rolagem acabou: música volta');
 await A.evaluate(()=>{window.__osReduce=true;document.body.classList.add('x-r')});ok(await until(A,()=>!e99Music().on,null,3000),'"menos movimento": música para');
 await A.evaluate(()=>{window.__osReduce=false;document.body.classList.remove('x-r')});
 /* sair: música para */
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(800);ok(await A.evaluate(()=>!e99Music().on),'ao sair a música para');
 await c.close();console.log('errors',errs);await b.close()})();
