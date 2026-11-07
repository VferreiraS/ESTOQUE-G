/* v92 → v122: som de abertura (Web Audio, sem arquivos) ao entrar, depois do toque e com o som do app ligado.
   A música ambiente e o botão ♫ saíram na v122. */
const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 const c=await b.newContext({...L.devices['iPhone 13']});
 const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForSelector('#auth-form input[name=login]');await A.waitForTimeout(1500);
 ok(await A.evaluate(()=>!window.e99Music&&!window.e99MusicToggle),'sem música ambiente');
 const l='som'+T;await L.signup(A,l);
 ok(await until(A,()=>e99Stings()>=1,null,4000),'som de abertura toca junto com a animação ao entrar');
 await A.waitForTimeout(1500);ok(await A.evaluate(()=>!document.getElementById('music-btn')&&!document.getElementById('pref-music')),'sem botão ♫ no topo nem em Preferências');
 await A.evaluate(()=>toggleSiteSound());const n=await A.evaluate(()=>e99Stings());await A.evaluate(()=>playSiteSound('login'));await A.waitForTimeout(500);
 ok(await A.evaluate(n=>e99Stings()===n,n),'som do app desligado: abertura sem som');await A.evaluate(()=>toggleSiteSound());
 await c.close();console.log('errors',errs);await b.close()})();