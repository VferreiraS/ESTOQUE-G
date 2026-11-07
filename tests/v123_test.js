/* v123: visual estilo iOS 27 (vidro, cápsulas, barra de abas flutuante, fonte do sistema na Apple), ícone squircle original com o S,
   e a animação de entrada consertada: no iPhone 13 com CPU 4x e no PC a abertura (S) e a barra terminam em ≤6 s, a abertura
   é opaca (não sobrepõe a tela de entrar), não fica pela metade e o formulário é liberado. */
const L=require('./lib.js');const {ok,until}=L;const PORT=process.env.PORT||8000;
const URL0='http://localhost:'+PORT+'/index.html?ntfy='+L.N;
const TL=()=>{try{sessionStorage.removeItem('e99-intro')}catch(e){}window.__tl=[];const t0=performance.now();
  const snap=()=>{const i=document.getElementById('stok-intro'),f=document.querySelector('#auth-screen form');
    window.__tl.push({t:performance.now()-t0,intro:!!i,bg:i?getComputedStyle(i).backgroundColor:'',lock:!!(document.body&&document.body.classList.contains('e99-booting')),pe:f?getComputedStyle(f).pointerEvents:''})};
  const id=setInterval(snap,100);setTimeout(()=>clearInterval(id),9000)};
(async()=>{const b=await L.chromium.launch();const errs=[];
 for(const [nome,opts] of [['iPhone 13',L.devices['iPhone 13']],['PC',{viewport:{width:1440,height:900}}]]){
  const c=await b.newContext(opts);await c.addInitScript(TL);const P=await c.newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept());
  const cdp=await c.newCDPSession(P);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await P.goto(URL0);
  ok(await until(P,()=>!!document.getElementById('stok-intro'),null,4000),nome+' (CPU 4x): abertura com o S aparece');
  ok(await P.evaluate(()=>{const i=document.getElementById('stok-intro');return !!i&&!!i.querySelector('.si-tile')&&!!i.querySelector('.si-mark')}),nome+': S dentro do ícone na abertura');
  ok(await until(P,()=>!!window.__e99Boot&&!document.getElementById('stok-intro')&&!document.body.classList.contains('e99-booting'),null,6500),nome+': abertura e barra terminam em ≤6 s');
  await P.waitForTimeout(300);const tl=await P.evaluate(()=>window.__tl);
  const bad=tl.filter(x=>x.intro&&x.bg!=='rgb(0, 0, 0)');ok(!bad.length,nome+': abertura opaca (não mostra a tela de entrar por trás)'+(bad.length?' '+JSON.stringify(bad.slice(0,2)):''));
  const end=tl.filter(x=>x.intro).pop();ok(!!end&&end.t<=6000,nome+': abertura some até '+(end?Math.round(end.t):'?')+' ms');
  ok(await P.evaluate(()=>getComputedStyle(document.querySelector('#auth-screen form')).pointerEvents!=='none'&&+getComputedStyle(document.querySelector('#auth-screen form')).opacity===1),nome+': formulário liberado e inteiro (não fica pela metade)');
  ok(await P.evaluate(()=>[...document.querySelectorAll('#auth-screen .auth-card *')].every(e=>+getComputedStyle(e).opacity>.98||e.closest('.auth-links,.legal-links')||getComputedStyle(e).display==='none'||e.matches('[hidden]'))),nome+': nada da tela de entrar apagado pela metade');
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  ok(await P.evaluate(()=>{const i=document.querySelector('.logo img');return !!i&&/svg/.test(i.getAttribute('src'))&&decodeURIComponent(i.getAttribute('src')).includes('rx="22.5"')}),nome+': logo = ícone squircle com o S');
  ok(await P.evaluate(()=>document.querySelector('link[rel="apple-touch-icon"]').getAttribute('href')==='icons/apple-touch-v123.png'),nome+': ícone do iPhone novo');
  await L.signup(P,'v123'+nome.replace(/\W/g,'').toLowerCase()+Date.now().toString(36));await P.waitForTimeout(1200);
  const r=await P.evaluate(()=>{const p=document.querySelector('#view .panel'),bt=document.querySelector('#view button.primary'),mb=document.getElementById('mobile-bottom'),cs=e=>e?getComputedStyle(e):null;
    return {card:p?parseFloat(cs(p).borderTopLeftRadius):0,btn:bt?parseFloat(cs(bt).borderTopLeftRadius):0,apple:document.documentElement.classList.contains('e99-apple'),font:getComputedStyle(document.body).fontFamily,
      mb:mb&&cs(mb).display!=='none'?{r:parseFloat(cs(mb).borderTopLeftRadius),l:mb.getBoundingClientRect().left,bf:cs(mb).backdropFilter||cs(mb).webkitBackdropFilter}:null,upper:p?cs(document.querySelector('#view h1')).textTransform:''}});
  ok(r.card>=20&&r.btn>=20,nome+': cartões e botões arredondados ('+r.card+'/'+r.btn+' px)');ok(r.upper!=='uppercase',nome+': títulos sem caixa alta (estilo iOS)');
  if(nome==='PC')ok(!r.apple,nome+': fora da Apple mantém Inter');else{ok(r.apple&&/-apple-system/.test(r.font),nome+': fonte do sistema da Apple');ok(r.mb&&r.mb.r>=40&&r.mb.l>=8&&/blur/.test(r.mb.bf),nome+': barra de abas flutuante em cápsula de vidro')}
  ok(await P.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),nome+': sem rolagem lateral');
  await c.close()}
 ok(!errs.length,'sem erros de página'+(errs.length?': '+errs.join(' | '):''));
 await b.close()})();
