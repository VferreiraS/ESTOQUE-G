/* v140: abertura "Do caos à ordem" — quadradinhos na cor do tema → grade → scanner → S vermelho da marca + "Stok".
   PC 1440×900 e iPhone 13 com CPU 4x: fundo preto desde o 1º quadro, canvas desenha (pixels vermelhos do S no fim),
   some nos limites da v124, formulário liberado, nenhum rAF/animação depois de terminar, "menos movimento" = quadro parado,
   3 temas, 0 erro de console. */
const L=require('./lib.js');const {ok,until}=L;const PORT=process.env.PORT||8000;
const URL0='http://localhost:'+PORT+'/index.html?ntfy='+L.N;
/* conta rAF pedidos pela abertura depois de ela terminar: envolve requestAnimationFrame e marca a pilha */
const SPY=()=>{const r0=window.requestAnimationFrame.bind(window);window.__rafIntro=0;window.__rafAfter=0;
  window.requestAnimationFrame=function(cb){const st=(new Error().stack)||'';if(/intro\.js/.test(st)){window.__rafIntro++;if(window.__e99IntroStats&&window.__e99IntroStats.done)window.__rafAfter++}return r0(cb)}};
/* lê os pixels do canvas: quantos vermelhos (#FF2A1F) e quantos na cor do tema */
const PIX=(rgb)=>{const c=document.querySelector('#stok-intro canvas.si-canvas');if(!c||!c.width)return null;const g=c.getContext('2d');const d=g.getImageData(0,0,c.width,c.height).data;let red=0,theme=0;
  for(let i=0;i<d.length;i+=16){const r=d[i],G=d[i+1],b=d[i+2],a=d[i+3];if(a<200)continue;if(r>220&&G<90&&b<80)red++;else if(Math.abs(r-rgb[0])<30&&Math.abs(G-rgb[1])<30&&Math.abs(b-rgb[2])<30)theme++}return {red,theme}};
const THEMES={lilas:[231,184,239],violeta:[198,255,52],cinza:[199,255,46]};
(async()=>{const b=await L.chromium.launch();const errs=[];
 for(const [nome,opts] of [['iPhone 13',L.devices['iPhone 13']],['PC',{viewport:{width:1440,height:900}}]]){
  for(const tema of Object.keys(THEMES)){
   const c=await b.newContext(opts);await c.addInitScript(SPY);await c.addInitScript((t)=>{try{localStorage.setItem('lojasg.estoque99.ui-theme',t);sessionStorage.removeItem('e99-intro')}catch(e){}window.__bg=[];const t0=performance.now();
     const id=setInterval(()=>{const i=document.getElementById('stok-intro');if(i)window.__bg.push({t:performance.now()-t0,bg:getComputedStyle(i).backgroundColor})},50);setTimeout(()=>clearInterval(id),8000)},tema);
   const P=await c.newPage();const tag=nome+' '+tema;P.on('pageerror',e=>errs.push(tag+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Firebase|firestore|googleapis|ntfy|ERR_|net::/i.test(m.text()))errs.push(tag+' console: '+m.text())});P.on('dialog',d=>d.accept());
   const cdp=await c.newCDPSession(P);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});const t0=Date.now();await P.goto(URL0);
   ok(await until(P,()=>!!document.querySelector('#stok-intro canvas.si-canvas'),null,4000),tag+' (CPU 4x): abertura com canvas aparece');
   ok(await P.evaluate(()=>{const c=document.querySelector('#stok-intro canvas');return c.getAttribute('aria-hidden')==='true'&&getComputedStyle(document.getElementById('stok-intro')).pointerEvents==='none'}),tag+': canvas aria-hidden e abertura não bloqueia');
   ok(await P.evaluate(()=>document.documentElement.getAttribute('data-e99-theme')),tag+': tema aplicado ('+await P.evaluate(()=>document.documentElement.getAttribute('data-e99-theme'))+')');
   if(tema==='lilas'){await P.waitForTimeout(250);const mid=await P.evaluate(PIX,THEMES[tema]);ok(!!mid&&mid.theme>20,tag+': quadradinhos soltos na cor do tema ('+JSON.stringify(mid)+')')}
   ok(await until(P,()=>window.__e99IntroStats&&window.__e99IntroStats.done,null,5000),tag+': animação chega ao fim');
   const end=await P.evaluate(PIX,THEMES[tema]);ok(!!end&&end.red>300,tag+': S vermelho da marca no fim ('+(end&&end.red)+' pixels vermelhos)');
   const st=await P.evaluate(()=>window.__e99IntroStats);ok(st.n<=(nome==='PC'?360:260)&&st.sPts>100,tag+': '+st.n+' quadradinhos, '+st.sPts+' no S');
   ok(await P.evaluate(()=>['.si-word','.si-tag','.si-sub'].map(s=>document.querySelector('#stok-intro '+s).textContent).join('|')==='Stok|Tudo no lugar.|LOJAS G · ESTOQUE 99'),tag+': textos do fim');
   const r1=await P.evaluate(()=>window.__rafAfter);await P.waitForTimeout(400);
   ok(await P.evaluate(()=>window.__rafAfter===0&&!window.e99IntroRunning()&&window.__rafIntro>5),tag+': nenhum rAF da abertura depois de terminar ('+r1+')');
   ok(await until(P,()=>!document.getElementById('stok-intro')&&!!window.__e99Boot&&!document.body.classList.contains('e99-booting'),null,6500),tag+': abertura some e barra termina ('+(Date.now()-t0)+' ms)');
   const bg=await P.evaluate(()=>window.__bg);const bad=bg.filter(x=>x.bg!=='rgb(0, 0, 0)');ok(bg.length&&!bad.length,tag+': fundo preto em todos os quadros');
   const last=bg[bg.length-1];ok(last&&last.t<=3600,tag+': abertura some até '+Math.round(last?last.t:0)+' ms (≤3,4 s + folga)');
   ok(await P.evaluate(()=>{const f=document.querySelector('#auth-screen form');return getComputedStyle(f).pointerEvents!=='none'&&+getComputedStyle(f).opacity===1}),tag+': formulário liberado');
   ok(await P.evaluate(()=>!document.querySelector('canvas.si-canvas')&&document.getAnimations().filter(a=>a.effect&&a.effect.target&&a.effect.target.closest&&a.effect.target.closest('#stok-intro')).length===0),tag+': canvas removido, nenhuma animação da abertura');
   await c.close()}
  /* menos movimento: quadro final parado, sem rAF, some no tempo curto */
  const c=await b.newContext({...opts,reducedMotion:'reduce'});await c.addInitScript(SPY);const P=await c.newPage();P.on('pageerror',e=>errs.push(nome+' reduzido '+e.message));
  await P.goto(URL0);await P.waitForSelector('#auth-form');await P.waitForTimeout(500);await P.evaluate(()=>window.playStokIntro());
  const r=await P.evaluate(PIX,THEMES.lilas);ok(!!r&&r.red>300,nome+' menos movimento: S vermelho já no 1º quadro ('+(r&&r.red)+')');
  ok(await P.evaluate(()=>!window.e99IntroRunning()&&window.__rafIntro===0&&getComputedStyle(document.querySelector('#stok-intro .si-word')).opacity==='1'&&getComputedStyle(document.querySelector('#stok-intro .si-cap')).display==='none'),nome+' menos movimento: parado, textos visíveis, sem rAF');
  ok(await until(P,()=>!document.getElementById('stok-intro'),null,1500),nome+' menos movimento: some sozinha');
  await c.close()}
 ok(!errs.length,'sem erros de página/console'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
 await b.close()})();
