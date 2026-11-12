(function(){
'use strict';
/* v140: abertura "Do caos à ordem". Quadradinhos soltos na cor do tema se arrumam numa grade (prateleira), a linha do
   scanner passa e a grade vira o S vermelho da marca feito de quadradinhos; depois "Stok", "Tudo no lugar." e
   "Lojas G · Estoque 99". Um canvas só (aria-hidden), requestAnimationFrame até ~2,1 s e para; o canvas sai com a abertura.
   Contrato antigo mantido: fundo #000, não bloqueia o login, "Toque para abrir" + som (v124/v118), some sozinha. */
var S_PATH='M42 14h30.5a7.5 7.5 0 0 1 0 15H42a3.5 3.5 0 0 0 0 7H58a21 21 0 0 1 0 42H27.5a7.5 7.5 0 0 1 0-15H58a6 6 0 0 0 0-12H42a18.5 18.5 0 0 1 0-37z';
var RED=[255,42,31],DUR=2.1,END=2800,END_HOLD=3400,END_R=950,END_RHOLD=2600;
var active=null,removeTimer=0,anim=null;
function off(){return false}
function reduced(){try{if(typeof window.__osReduce==='boolean')return window.__osReduce;return !!(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(x){return false}}
function endMs(hold){return reduced()?(hold?END_RHOLD:END_R):(hold?END_HOLD:END)}
var stats=window.__e99IntroStats={frames:0,n:0,sPts:0,font:'',done:false,finalRed:false};
function clear(){if(removeTimer)clearTimeout(removeTimer);removeTimer=0;if(anim){anim.stop();anim=null}
  if(active){var cv=active.querySelector('canvas');if(cv){cv.width=0;cv.height=0}if(active.parentNode)active.remove()}active=null;document.body&&document.body.classList.remove('stok-intro-active')}
function ease(t){return t<0?0:t>1?1:t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}
function cl(t,a,b){return Math.min(1,Math.max(0,(t-a)/(b-a)))}
function themeRgb(){try{var v=getComputedStyle(document.body).getPropertyValue('--neon-rgb').trim().split(',').map(Number);if(v.length===3&&v.every(function(n){return n>=0&&n<=255}))return v}catch(x){}return [231,184,239]}
function headFont(){try{var f=getComputedStyle(document.body).getPropertyValue('--font-head').trim();if(f)return f}catch(x){}return "'Space Grotesk',system-ui,sans-serif"}
/* fonte do S: espera no máximo 300 ms; sem fonte a tempo, usa a que estiver (ou o desenho do S da marca) */
function fontReady(fam){var first=fam.split(',')[0].trim();return new Promise(function(res){var done=false,fin=function(ok){if(!done){done=true;res(ok)}};setTimeout(function(){fin(false)},300);
  try{if(document.fonts&&document.fonts.load&&!/^-apple-system|^BlinkMacSystemFont|^system-ui/.test(first))document.fonts.load('700 120px '+first).then(function(l){fin(!!(l&&l.length))},function(){fin(false)});else fin(true)}catch(x){fin(false)}})}
/* amostra o S numa grade: devolve os centros dos quadradinhos (até n) e o passo */
function sampleS(sz,n,fam){var o=document.createElement('canvas');o.width=o.height=sz;var g=o.getContext('2d');if(!g)return null;g.fillStyle='#fff';
  var useText=true;try{var fs=sz;g.font='700 '+fs+'px '+fam;var m=g.measureText('S'),h=(m.actualBoundingBoxAscent||0)+(m.actualBoundingBoxDescent||0);
    if(h>0){fs=fs*sz*.94/h;g.font='700 '+fs+'px '+fam;m=g.measureText('S');var w=(m.actualBoundingBoxLeft||0)+(m.actualBoundingBoxRight||0);h=m.actualBoundingBoxAscent+m.actualBoundingBoxDescent;g.textAlign='left';g.textBaseline='alphabetic';g.fillText('S',(sz-w)/2+(m.actualBoundingBoxLeft||0),(sz-h)/2+m.actualBoundingBoxAscent)}
    else{g.textAlign='center';g.textBaseline='middle';g.font='700 '+Math.round(sz*1.2)+'px '+fam;g.fillText('S',sz/2,sz/2)}}catch(x){useText=false}
  var d=g.getImageData(0,0,sz,sz).data;
  function pts(step){var r=[];for(var y=step/2;y<sz;y+=step)for(var x=step/2;x<sz;x+=step)if(d[((y|0)*sz+(x|0))*4+3]>128)r.push([x,y]);return r}
  var best=null,bestStep=0;for(var k=8;k<=48;k+=.5){var st=sz/k,p=pts(st);if(p.length<=n){best=p;bestStep=st}else break}
  if(!best||best.length<30){/* sem fonte: o S da marca (desenho do ícone) */g.clearRect(0,0,sz,sz);try{g.save();g.translate(sz*.5,sz*.5);var sc=sz/68;g.scale(sc,sc);g.translate(-50,-46);g.fill(new Path2D(S_PATH));g.restore()}catch(x){return null}
    d=g.getImageData(0,0,sz,sz).data;best=null;for(k=8;k<=48;k+=.5){st=sz/k;p=pts(st);if(p.length<=n){best=p;bestStep=st}else break}useText=false}
  if(!best||!best.length)return null;return {pts:best,step:bestStep,text:useText}}
function start(d,cv,box,red){var W=innerWidth,H=innerHeight,dpr=Math.min(2,window.devicePixelRatio||1);cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
  var x=cv.getContext('2d');if(!x)return null;
  var phone=W<700||!!(window.matchMedia&&matchMedia('(pointer: coarse)').matches),N=phone?240:360;
  var cx=box.left+box.width/2,cy=box.top+box.height/2,Sh=box.height,col=themeRgb(),R=7;
  function rnd(){R=(R*16807)%2147483647;return R/2147483647}
  var cols=Math.ceil(Math.sqrt(N)),rows=Math.ceil(N/cols),gs=Sh*.92/cols,gx0=cx-gs*(cols-1)/2,gy0=cy-gs*(rows-1)/2,P=[];
  for(var i=0;i<N;i++){var gx=gx0+(i%cols)*gs,gy=gy0+Math.floor(i/cols)*gs;P.push({ax:rnd()*W,ay:rnd()*H,r:rnd()*6.28,v:.6+rnd()*1.4,gx:gx,gy:gy,sx:gx,sy:gy,d:rnd()*.15})}
  var step=gs,sReady=false,stopped=false,raf=0,t0=performance.now(),fam=headFont();
  stats.frames=0;stats.n=N;stats.sPts=0;stats.done=false;stats.finalRed=false;
  function placeS(){if(sReady||stopped)return;sReady=true;var r=null;try{r=sampleS(Math.max(40,Math.round(Sh)),N,fam)}catch(x){}if(!r)return;
    var M=r.pts.length,ox=cx-Sh/2,oy=cy-Sh/2;step=r.step;stats.sPts=M;stats.font=r.text?fam:'desenho';
    /* cada quadradinho vai para o ponto do S mais "parecido" com a ordem da grade (linha a linha): o S se monta de cima para baixo */
    for(var i=0;i<N;i++){var p=r.pts[Math.floor(i*M/N)];P[i].sx=ox+p[0];P[i].sy=oy+p[1]}}
  if(red)placeS();else fontReady(fam).then(placeS);
  function frame(t,final){x.setTransform(dpr,0,0,dpr,0,0);x.clearRect(0,0,W,H);
    var glow=.10+.16*cl(t,1.45,2.05),bg=x.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*.6);bg.addColorStop(0,'rgba('+col[0]+','+col[1]+','+col[2]+','+(glow*.6)+')');bg.addColorStop(.45,'rgba('+RED[0]+','+RED[1]+','+RED[2]+','+(glow*.35*cl(t,1.3,2))+')');bg.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=bg;x.fillRect(0,0,W,H);
    var fin=cl(t,0,.25),k2avg=ease(cl(t,1.25,2.05)),pass,i,p,k1,k2,dr,ax,ay,px,py,sz,rot,c0,c1,c2,a,co,si;
    for(pass=0;pass<2;pass++){if(pass===0&&(k2avg<=0||final))continue;
      if(final&&pass===1){x.shadowColor='rgba(255,42,31,.8)';x.shadowBlur=Math.max(4,step*.7)*dpr}
      for(i=0;i<N;i++){p=P[i];k1=ease(cl(t,.3+p.d,.95+p.d));k2=ease(cl(t,1.25+p.d,1.9+p.d));
        dr=(1-k1)*28;ax=p.ax+Math.cos(p.r+t*p.v)*dr;ay=p.ay+Math.sin(p.r+t*p.v)*dr;
        px=ax+(p.gx-ax)*k1;py=ay+(p.gy-ay)*k1;px+=(p.sx-px)*k2;py+=(p.sy-py)*k2;
        sz=gs*.42+(gs*.62-gs*.42)*k1;sz+=(step*.8-sz)*k2;rot=(1-k1)*(p.r+t*p.v);
        c0=Math.round(col[0]+(RED[0]-col[0])*k2);c1=Math.round(col[1]+(RED[1]-col[1])*k2);c2=Math.round(col[2]+(RED[2]-col[2])*k2);
        a=(.45+.55*k1)*fin;if(pass===0){a*=.22*k2;sz+=step*.55}if(a<=0)continue;
        co=Math.cos(rot);si=Math.sin(rot);x.setTransform(dpr*co,dpr*si,-dpr*si,dpr*co,dpr*px,dpr*py);x.globalAlpha=a;x.fillStyle='rgb('+c0+','+c1+','+c2+')';x.fillRect(-sz/2,-sz/2,sz,sz)}
      x.shadowBlur=0;x.globalAlpha=1}
    x.setTransform(dpr,0,0,dpr,0,0);
    /* linha do scanner sobre a prateleira */
    var sc=cl(t,.95,1.32);if(!final&&sc>0&&sc<1){var gyTop=gy0-gs*.6,gyH=gs*rows+gs*.2,yy=gyTop+sc*gyH,ww=gs*cols+gs*1.2;x.globalAlpha=.35;x.fillStyle='rgb(255,42,31)';x.fillRect(cx-ww/2,yy-4,ww,9);x.globalAlpha=.95;x.fillRect(cx-ww/2,yy-1,ww,2.5);x.globalAlpha=1}
    stats.frames++}
  function loop(now){raf=0;if(stopped)return;if(!cv.isConnected){stop();return}var t=(now-t0)/1000;
    if(t>=DUR){if(!sReady)placeS();frame(DUR,true);stats.done=true;stats.finalRed=true;return}frame(t,false);raf=requestAnimationFrame(loop)}
  function stop(){stopped=true;if(raf)cancelAnimationFrame(raf);raf=0}
  if(red){frame(DUR,true);stats.done=true;stats.finalRed=true}else raf=requestAnimationFrame(loop);
  return {stop:stop,running:function(){return !!raf}}}
function show(first){if(off()||document.hidden||!document.body)return;if(active&&active.parentNode)return;clear();
  var red=reduced(),d=document.createElement('div');d.id='stok-intro';d.setAttribute('aria-hidden','true');if(red)d.setAttribute('data-reduced-motion','true');
  d.innerHTML='<canvas class="si-canvas" aria-hidden="true"></canvas><div class="si-space"></div><div class="si-txt"><div class="si-cap">Cada caixa tem um lugar.</div><div class="si-word">Stok</div><div class="si-tag">Tudo no lugar.</div><div class="si-sub">LOJAS G · ESTOQUE 99</div></div>';
  active=d;document.body.classList.add('stok-intro-active');document.body.appendChild(d);d.classList.add('si-ending');
  var sp=d.querySelector('.si-space'),Sh=Math.round(Math.max(120,Math.min(innerWidth*.62,innerHeight*.42,340)));sp.style.width=sp.style.height=Sh+'px';
  try{anim=start(d,d.querySelector('canvas'),sp.getBoundingClientRect(),red)}catch(x){anim=null}
  /* v124: na abertura do app, botão "Toque para abrir" (destrava o áudio e toca o som de abertura); segura a abertura até 3,4 s */
  var hold=first===true&&wantTap();if(hold)addTap(d);removeTimer=setTimeout(clear,endMs(hold))}
function wantTap(){try{if(typeof siteSoundEnabled!=='undefined'&&!siteSoundEnabled)return false;if(window.e99LoginSound&&window.e99LoginSound.played())return false;if(navigator.userActivation&&navigator.userActivation.hasBeenActive)return false;return true}catch(x){return false}}
function soundGone(){try{return (typeof siteSoundEnabled!=='undefined'&&!siteSoundEnabled)||!!(window.e99LoginSound&&window.e99LoginSound.played())}catch(x){return true}}
function addTap(d){var t0=Date.now();d.classList.add('si-hold');d.removeAttribute('aria-hidden');Array.prototype.forEach.call(d.children,function(c){c.setAttribute('aria-hidden','true')});
  var b=document.createElement('button');b.type='button';b.id='si-tap';b.className='si-tap';b.textContent='Toque para abrir';b.setAttribute('aria-label','Toque para abrir o app com som');d.appendChild(b);
  var done=false,w=0;function end(ms){if(done)return;done=true;clearInterval(w);if(b.parentNode)b.remove();if(removeTimer)clearTimeout(removeTimer);removeTimer=setTimeout(clear,Math.max(0,ms))}
  b.addEventListener('click',function(ev){ev.preventDefault();ev.stopPropagation();window.__e99IntroTap=Date.now();try{if(typeof unlockSiteAudio==='function')unlockSiteAudio()}catch(x){}try{if(typeof playSiteSound==='function')playSiteSound('login')}catch(x){}d.classList.add('si-tapped');end(220)});
  /* som já tocou sozinho (PC/Android) ou som desligado: tira o botão e a abertura termina no tempo normal */
  w=setInterval(function(){if(!d.isConnected){clearInterval(w);return}if(!done&&soundGone()){d.classList.remove('si-hold');end(endMs(false)-(Date.now()-t0))}},250)}
/* Som sintético só em contexto já desbloqueado e quando o som do app está ligado. */
function tudum(ctx){var t=ctx.currentTime+.02,out=ctx.createGain();out.gain.value=.75;out.connect(ctx.destination);
  function thud(at,f0,f1,len,vol){var o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(f0,at);o.frequency.exponentialRampToValueAtTime(f1,at+len);g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(vol,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+len);o.connect(g);g.connect(out);o.start(at);o.stop(at+len+.05)}
  thud(t,78,42,.32,.18);thud(t+.3,64,30,.48,.2);var lp=ctx.createBiquadFilter();lp.type='lowpass';lp.Q.value=4;lp.frequency.setValueAtTime(260,t+.32);lp.frequency.exponentialRampToValueAtTime(1800,t+1.2);var cg=ctx.createGain();cg.gain.setValueAtTime(.0001,t+.32);cg.gain.exponentialRampToValueAtTime(.045,t+.8);cg.gain.exponentialRampToValueAtTime(.0001,t+1.25);lp.connect(cg);cg.connect(out);[110,164.81,220].forEach(function(f,i){var o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(f,t+.32);o.connect(lp);o.start(t+.32);o.stop(t+1.35)})}
function play(){try{if(document.hidden||typeof siteSoundEnabled!=='undefined'&&!siteSoundEnabled)return;if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;var ctx=typeof unlockSiteAudio==='function'?unlockSiteAudio():null;if(!ctx)return;var go=function(){if(ctx.state==='running'){if(window.e99Sting)window.e99Sting(ctx);else tudum(ctx)}};if(ctx.state==='running')go();else ctx.resume().then(go).catch(function(){})}catch(x){}}
window.playStokIntro=function(withSound){show();if(withSound&&!off())play()};
window.e99IntroRunning=function(){return !!(anim&&anim.running())};
var en=typeof authEnter==='function'?authEnter:null;if(en)authEnter=function(){var r=en.apply(this,arguments);show();return r};
window.replayEntrySplash=function(){show()};
document.addEventListener('visibilitychange',function(){if(document.hidden)clear()});
try{if(!sessionStorage.getItem('e99-intro')){sessionStorage.setItem('e99-intro','1');show(true)}}catch(x){show(true)}
})();
