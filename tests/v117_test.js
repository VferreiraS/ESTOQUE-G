/* v117: Início não fica pela metade (animação de entrada presa) — iPhone 13 e PC, 3 temas, Efeitos ligados/desligados.
   Casos: normal, animação pausada pelo navegador, tela redesenhada várias vezes seguidas. Prints: SHOTS=<pasta>. */
const L=require('./lib.js');const {ok}=L;const fs=require('fs'),path=require('path');
const OUT=process.env.SHOTS||path.join(require('os').tmpdir(),'stok-v117');fs.mkdirSync(OUT,{recursive:true});
const minOp=()=>{const v=document.getElementById('view');return Math.min(...[...v.children,...v.querySelectorAll('.stats>.stat,h1,.toolbar button.primary')].map(e=>+getComputedStyle(e).opacity))};
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['iphone',L.devices['iPhone 13']],['pc',{viewport:{width:1440,height:900}}]]){
  for(const t of ['cinza','lilas','violeta']){for(const fx of ['on','off']){
   if(nome==='pc'&&fx==='off')continue;
   const c=await b.newContext({...opts,reducedMotion:'no-preference'});await c.addInitScript(([t,f])=>{try{localStorage.setItem('lojasg.estoque99.ui-theme',t);localStorage.setItem('lojasg.estoque99.visual-effects',f);localStorage.removeItem('lojasg.estoque99.fx-pause')}catch(e){}},[t,fx]);
   const P=await c.newPage();P.on('pageerror',e=>{if(!/localStorage/.test(e.message))errs.push(nome+' '+e.message)});P.on('dialog',d=>d.accept());
   await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1500);await L.signup(P,'v7'+nome[0]+t+fx+T);
   await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});go('nfs')});await P.waitForTimeout(300);
   await P.evaluate(()=>{go('home');scrollTo(0,0)});await P.waitForTimeout(1600);
   const k=nome+' '+t+' Efeitos '+fx;
   ok(await P.evaluate(minOp)>=.99,k+': Início todo visível depois da entrada');
   await P.screenshot({path:path.join(OUT,nome+'-'+t+'-fx'+fx+'.png')});
   /* navegador pausa a animação logo no começo (como o Safari às vezes faz) */
   await P.evaluate(()=>go('nfs'));await P.waitForTimeout(200);await P.evaluate(()=>{go('home');scrollTo(0,0);document.getAnimations().forEach(a=>{try{a.pause()}catch(e){}})});await P.waitForTimeout(1600);
   ok(await P.evaluate(minOp)>=.99,k+': animação pausada pelo navegador não deixa nada apagado');
   /* redesenhos seguidos (sincronização) não reiniciam a entrada */
   await P.evaluate(()=>{let n=0;const i=setInterval(()=>{render();if(++n>8)clearInterval(i)},150)});await P.waitForTimeout(400);
   ok(await P.evaluate(minOp)>=.99,k+': redesenhos seguidos não deixam a tela pela metade');
   await c.close();
  }}
 }
 console.log('shots',OUT);console.log('errors',errs);await b.close()})();
