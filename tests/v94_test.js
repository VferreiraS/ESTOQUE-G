/* v94: no topo do Início o S de partículas e a grade Tron não se sobrepõem; o botão "Pausar animação" não fica em cima de nenhuma animação nem do título */
const L=require('./lib.js');const {ok}=L;
const geo=()=>{const h=document.querySelector('#view .hero-home'),r=e=>{if(!e)return null;const x=e.getBoundingClientRect();return {l:x.left,t:x.top,r:x.right,b:x.bottom}};
 const cv=h.querySelector('.fx-g'),cr=cv.getBoundingClientRect(),d=cv.width/cr.width,px=cv.getContext('2d').getImageData(0,0,cv.width,cv.height).data;let l=1e9,t=1e9,R=-1,B=-1;
 for(let y=0;y<cv.height;y++)for(let x=0;x<cv.width;x++)if(px[(y*cv.width+x)*4+3]>0){if(x<l)l=x;if(x>R)R=x;if(y<t)t=y;if(y>B)B=y}
 const s=R<0?null:{l:cr.left+l/d,t:cr.top+t/d,r:cr.left+(R+1)/d,b:cr.top+(B+1)/d};
 return {s,g:r(h.querySelector(':scope>.tron-grid')),btn:r(h.querySelector('.fx-pause')),h1:r(h.querySelector('h1')),sub:r(h.querySelector('.subtitle')),np:r(h.querySelector('.toolbar button.primary')),vw:innerWidth}};
const hit=(a,b)=>!!(a&&b)&&a.l<b.r-.5&&b.l<a.r-.5&&a.t<b.b-.5&&b.t<a.b-.5;
(async()=>{const b=await L.chromium.launch();const errs=[];
for(const [nm,vp] of [['celular',{...L.devices['iPhone 13']}],['PC',{viewport:{width:1300,height:900}}]]){
 const c=await b.newContext(vp);await c.addInitScript(()=>{try{localStorage.removeItem('lojasg.estoque99.fx-pause')}catch(e){}});const p=await c.newPage();p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8000/index.html?ntfy='+L.N);await p.waitForSelector('#auth-form input[name=login]');await p.waitForTimeout(800);
 await L.signup(p,'v94'+nm[0]+Date.now().toString(36));await p.evaluate(()=>{go('home');scrollTo(0,0)});
 await p.waitForTimeout(300);let G=await p.evaluate(geo);
 ok(G.s&&G.g&&!hit(G.s,G.g),nm+': S de partículas se montando não passa por cima da grade');
 for(const fx of [true,false]){if(!fx)await p.evaluate(()=>{if(visualEffectsOn())toggleVisualEffects()});await p.waitForTimeout(fx?5000:1500);G=await p.evaluate(geo);const e=fx?'Efeitos ligados':'Efeitos desligados';
  ok(G.s&&G.g&&G.g.b-G.g.t>40&&!hit(G.s,G.g),nm+' ('+e+'): partículas e grade em faixas separadas');
  ok(G.btn&&!hit(G.btn,G.s)&&!hit(G.btn,G.g)&&!hit(G.btn,G.h1),nm+' ('+e+'): "Pausar animação" fora do S, da grade e do título');
  ok(!hit(G.g,G.h1)&&!hit(G.g,G.sub)&&!hit(G.g,G.np)&&!hit(G.s,G.h1)&&!hit(G.s,G.np),nm+' ('+e+'): título, data e "Novo plano" livres das animações');
  ok([G.h1,G.sub,G.np,G.btn].every(x=>x.l>=0&&x.r<=G.vw+.5),nm+' ('+e+'): nada cortado na largura da tela')}
 await p.evaluate(()=>toggleVisualEffects());
 await p.click('#view .hero-home .fx-pause');ok(await p.evaluate(()=>localStorage.getItem('lojasg.estoque99.fx-pause')==='1'&&/Retomar/.test(document.querySelector('#view .hero-home .fx-pause').textContent)),nm+': "Pausar animação" continua funcionando');
 await p.click('#view .hero-home .fx-pause');await c.close()}
console.log('errors',errs);await b.close()})();
