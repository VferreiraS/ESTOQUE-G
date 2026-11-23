/* v161 · Animação do mouse, só no PC (pedido do dono):
   (1) brilho suave que segue o cursor, na cor --neon do tema, com atraso leve (lerp);
   (2) ondinha ao clicar em botões e cartões;
   (3) botões e cartões reagem ao passar o mouse (sobe um pouco, cresce de leve, borda realçada; cartões grandes inclinam até 3°).
   Só com mouse de verdade ((pointer:fine) and (hover:hover)) e tela > 900 px; nada no celular/tablet.
   Só transform/opacity, sem canvas nem blur. Um único requestAnimationFrame, que para quando o brilho alcança o mouse.
   Pausa com a aba oculta, janela sem foco ou cursor fora da janela. Desligado com "menos movimento" e em
   Preferências → "Animação do mouse" (lojasg.estoque99.mouse-fx = 'off'). Não atua na abertura, na conferência
   (câmera/coletor), no visualizador de imagens (v160) nem em campos de texto. Falha = fica como antes. */
(function(){'use strict';var W=window,D=document;
var KEY='lojasg.estoque99.mouse-fx';
var FINE=W.matchMedia?W.matchMedia('(pointer:fine) and (hover:hover)'):null;
var RM=W.matchMedia?W.matchMedia('(prefers-reduced-motion: reduce)'):null;
var BTN='button,.btn,a.btn,[role=button]';
var CARD='.card,.plan-card,.corridor-card,.pn-card,.aux-card,.stat,.vd-ring';
var TEXT='input,textarea,select,[contenteditable=""],[contenteditable=true]';
var VIDA='button.primary,.stat.e99-go,.vd-ring'; /* esses já ganham a ondulação da v158 */
var CAN_LIFT=!!(W.CSS&&CSS.supports&&CSS.supports('translate','0 1px')&&CSS.supports('scale','1'));
function pref(){try{return localStorage.getItem(KEY)!=='off'}catch(x){return true}}
function device(){return !!(FINE&&FINE.matches)&&W.innerWidth>900}
function enabled(){return device()&&pref()&&!(RM&&RM.matches)}
function blocked(){var b=D.body;if(!b)return true;
  if(b.classList.contains('conf-on')||b.classList.contains('stok-intro-active')||D.getElementById('stok-intro'))return true;
  try{if(W.e99Img&&W.e99Img.state&&W.e99Img.state().open)return true}catch(x){}
  return false}

var on=false,glow=null,shown=false,raf=0,frames=0,tx=0,ty=0,cx=0,cy=0,hotB=null,hotC=null,tilt=null,rips=0;
function mkGlow(){if(glow||!D.body)return;glow=D.createElement('div');glow.id='mfx-glow';glow.setAttribute('aria-hidden','true');D.body.appendChild(glow)}
function place(){if(glow)glow.style.transform='translate3d('+cx.toFixed(1)+'px,'+cy.toFixed(1)+'px,0)'}
function show(){if(!glow)mkGlow();if(!glow||shown)return;shown=true;cx=tx;cy=ty;place();glow.classList.add('on')}
function hide(){if(raf){cancelAnimationFrame(raf);raf=0}if(glow&&shown)glow.classList.remove('on');shown=false;cool()}
function kick(){if(!raf)raf=requestAnimationFrame(frame)}
function frame(){raf=0;if(!on||!shown)return;frames++;var dx=tx-cx,dy=ty-cy,moving=false;
  if(Math.abs(dx)<.4&&Math.abs(dy)<.4){cx=tx;cy=ty}else{cx+=dx*.18;cy+=dy*.18;moving=true}place();
  if(tilt&&tilt.el===hotC){var r=tilt.r,px=Math.min(1,Math.max(0,(tx-r.left)/r.width)),py=Math.min(1,Math.max(0,(ty-r.top)/r.height));
    var wx=(.5-py)*6,wy=(px-.5)*6,ex=wx-tilt.x,ey=wy-tilt.y;
    if(Math.abs(ex)<.02&&Math.abs(ey)<.02){tilt.x=wx;tilt.y=wy}else{tilt.x+=ex*.2;tilt.y+=ey*.2;moving=true}
    tilt.el.style.transform='perspective(900px) rotateX('+tilt.x.toFixed(2)+'deg) rotateY('+tilt.y.toFixed(2)+'deg)'}
  if(moving)raf=requestAnimationFrame(frame)}

/* passar o mouse: sobe/cresce (propriedades translate/scale, que somam com o transform que o elemento já tem) + borda realçada */
function lift(el,k){if(!el)return;el.classList.add('mfx-hot');if(!CAN_LIFT||typeof el.animate!=='function')return;
  var a=el.__mfx;if(a)try{a.cancel()}catch(x){}
  try{el.__mfx=el.animate([{translate:'0 0',scale:'1'},{translate:'0 '+(k==='b'?'-1.5px':'-3px'),scale:k==='b'?'1.03':'1.012'}],{duration:170,easing:'cubic-bezier(.2,.8,.3,1)',fill:'forwards'})}catch(x){el.__mfx=null}}
function drop(el){if(!el)return;el.classList.remove('mfx-hot');var a=el.__mfx;el.__mfx=null;if(a){try{a.reverse();a.onfinish=function(){try{a.cancel()}catch(x){}}}catch(x){try{a.cancel()}catch(y){}}}}
function untilt(){if(!tilt)return;var t=tilt;tilt=null;t.el.style.transform=t.old}
function setHot(b,c){if(b!==hotB){drop(hotB);hotB=b;lift(b,'b')}
  if(c!==hotC){untilt();drop(hotC);hotC=c;lift(c,'c');
    if(c&&!c.closest('.tilt-on')){var r=c.getBoundingClientRect();if(r.width>=300&&r.height>=120)tilt={el:c,r:r,x:0,y:0,old:c.style.transform||''}}}}
function cool(){untilt();drop(hotB);drop(hotC);hotB=hotC=null}
function pick(t){if(!t||!t.closest||t.closest(TEXT))return [null,null];var b=t.closest(BTN),c=t.closest(CARD);
  if(b&&(b.disabled||b.closest('#auth-screen .recovery-code')))b=null;return [b,c]}

function mouse(e){return !e.pointerType||e.pointerType==='mouse'}
function move(e){if(!on||!mouse(e))return;if(blocked()){hide();return}
  tx=e.clientX;ty=e.clientY;var t=e.target,txt=t&&t.closest&&t.closest(TEXT);
  if(txt){if(shown){if(glow)glow.classList.remove('on');shown=false}cool();return}
  if(!shown)show();var h=pick(t);setHot(h[0],h[1]);if(tilt)tilt.r=tilt.el.getBoundingClientRect();kick()}
function down(e){if(!on||!mouse(e)||e.button!==0||blocked())return;var t=e.target;if(!t||!t.closest||t.closest(TEXT))return;
  var el=t.closest(BTN)||t.closest(CARD);if(!el||el.disabled||el.closest(VIDA))return;ripple(el,e.clientX,e.clientY)}
function ripple(el,x,y){var r=el.getBoundingClientRect();if(!r.width||!r.height)return;var box=D.createElement('div');box.className='mfx-rip-box';box.setAttribute('aria-hidden','true');
  var br='';try{br=getComputedStyle(el).borderRadius}catch(z){}
  box.style.cssText='left:'+r.left+'px;top:'+r.top+'px;width:'+r.width+'px;height:'+r.height+'px;border-radius:'+(br||'0');
  var s=Math.min(900,Math.max(r.width,r.height)*2.2),i=D.createElement('i');i.className='mfx-rip';i.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(x-r.left-s/2)+'px;top:'+(y-r.top-s/2)+'px';
  box.appendChild(i);D.body.appendChild(box);rips++;
  function end(){rips=Math.max(0,rips-1);box.remove()}
  var a=null;try{a=i.animate([{transform:'scale(0)',opacity:.5},{transform:'scale(1)',opacity:0}],{duration:480,easing:'ease-out'})}catch(z){}
  if(a){a.onfinish=end;a.oncancel=end}else end()}

/* liga/desliga conforme aparelho, preferência e "menos movimento" */
function apply(){var want=enabled();if(want===on)return;on=want;if(D.body)D.body.classList.toggle('mfx-on',on);
  if(on){mkGlow()}else{hide();if(glow){glow.remove();glow=null}}}
function pause(){hide()}
D.addEventListener('pointermove',move,{passive:true});
D.addEventListener('pointerdown',down,{passive:true});
D.addEventListener('pointerover',function(e){if(on&&mouse(e)&&shown){var h=pick(e.target);setHot(h[0],h[1])}},{passive:true});
D.documentElement.addEventListener('mouseleave',pause,{passive:true});
D.addEventListener('mouseout',function(e){if(!e.relatedTarget)pause()},{passive:true});
D.addEventListener('visibilitychange',function(){if(D.hidden)pause()});
W.addEventListener('blur',pause);
W.addEventListener('resize',apply,{passive:true});
[FINE,RM].forEach(function(m){if(m&&m.addEventListener)m.addEventListener('change',apply)});

/* Preferências → "Animação do mouse" (só no PC) */
function prefRow(){var pp=D.getElementById('prefs-panel'),old=D.getElementById('pref-mouse-row');if(!pp){return}
  if(!device()){if(old)old.remove();return}var v=pref();if(old&&old.getAttribute('data-on')===String(v))return;if(old)old.remove();
  var r=D.createElement('div');r.className='pref-row';r.id='pref-mouse-row';r.setAttribute('data-on',String(v));
  r.innerHTML='<span><b>Animação do mouse</b><span class="small">Brilho que segue o cursor, ondinha no clique e cartões que reagem. Só no computador; respeita "menos movimento".</span></span>'
   +'<button type="button" id="pref-mouse-btn" class="btn'+(v?' primary':'')+'" aria-pressed="'+v+'" onclick="e99Mouse.set('+(!v)+')">'+(v?'Ligada':'Desligada')+'</button>';
  pp.appendChild(r)}
if(typeof render==='function'){var r0=render;render=function(){var res=r0.apply(this,arguments);try{cool();prefRow()}catch(x){}return res}}

W.e99Mouse={set:function(v){try{if(v)localStorage.removeItem(KEY);else localStorage.setItem(KEY,'off')}catch(x){}apply();prefRow()},
  on:function(){return on},
  state:function(){return {on:on,shown:shown,raf:!!raf,frames:frames,x:cx,y:cy,hotB:!!hotB,hotC:!!hotC,tilt:tilt?{x:tilt.x,y:tilt.y}:null,ripples:rips,glow:!!glow}}};
if(D.body)apply();else D.addEventListener('DOMContentLoaded',apply);
try{prefRow()}catch(x){}
})();
