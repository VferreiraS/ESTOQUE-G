<script id="particle-badge-js">
(function(){
'use strict';
/* v81: selo verificado = S de partículas vermelhas (mesmo efeito do fundo) */

var S_PATH = 'M42 14h30.5a7.5 7.5 0 0 1 0 15H42a3.5 3.5 0 0 0 0 7H58a21 21 0 0 1 0 42H27.5a7.5 7.5 0 0 1 0-15H58a6 6 0 0 0 0-12H42a18.5 18.5 0 0 1 0-37z';
var RED = [[255,58,36],[255,106,72],[233,24,16],[217,20,11],[255,90,55],[200,30,18],[255,120,80]];

function sampleS(n){
  var c=document.createElement('canvas'),S=160,m=S/2;
  c.width=S;c.height=S;
  var x=c.getContext('2d');
  x.fillStyle='#fff';
  x.save();
  x.translate(m-105,m-98);
  x.scale(2.15,2.15);
  try{ x.fill(new Path2D(S_PATH)); }catch(e){}
  x.restore();
  var d=x.getImageData(0,0,S,S).data,pts=[];
  for(var y=0;y<S;y+=2)for(var X=0;X<S;X+=2)
    if(d[(y*S+X)*4+3]>140) pts.push([(X-S/2)/(S/2),(y-S/2)/(S/2)]);
  var out=[];
  for(var i=0;i<n;i++){
    var p=pts[(Math.random()*pts.length)|0]||[0,0];
    out.push([p[0]+(Math.random()-.5)*.02, p[1]+(Math.random()-.5)*.02]);
  }
  return out;
}

function ParticleBadge(host){
  if(!host || host._pb) return host && host._pb;
  var cv=document.createElement('canvas');
  cv.className='vbadge-canvas';
  cv.setAttribute('aria-hidden','true');
  cv.width=44; cv.height=44;
  host.innerHTML='';
  host.appendChild(cv);
  host.classList.add('vbadge','vbadge-s','vbadge-particle');
  var ctx=cv.getContext('2d');
  var parts=[], raf=0, t0=performance.now(), ang=0, built=false, alive=true;

  function build(){
    var g=sampleS(90);
    parts=g.map(function(p){
      var col=RED[(Math.random()*RED.length)|0];
      var a=Math.random()*Math.PI*2, r=1.5+Math.random()*1.2;
      return {
        tx:p[0], ty:p[1], tz:(Math.random()-.5)*.2,
        x:Math.cos(a)*r, y:Math.sin(a)*r, z:(Math.random()-.5)*1.5,
        vx:0, vy:0, vz:0, c:col,
        s:.7+Math.random()*1.1, tw:Math.random()*6.28
      };
    });
    built=true;
  }

  function frame(now){
    raf=0;
    if(!alive || !cv.isConnected) return;
    if(!built) build();
    var t=(now-t0)/1000;
    ang=Math.sin(t*.35)*.28;
    var dpr=Math.min(2, window.devicePixelRatio||1);
    var css=host.getBoundingClientRect();
    var side=Math.max(16, Math.round((css.width||18)*dpr));
    if(cv.width!==side){ cv.width=side; cv.height=side; }
    var w=cv.width, h=cv.height;
    ctx.clearRect(0,0,w,h);
    ctx.globalCompositeOperation='lighter';
    var cx=w/2, cy=h/2, R=w*.42, ca=Math.cos(ang), sa=Math.sin(ang);
    for(var j=0;j<parts.length;j++){
      var p=parts[j];
      p.vx+=(p.tx-p.x)*.014;
      p.vy+=(p.ty-p.y)*.014;
      p.vz+=(p.tz-p.z)*.014;
      p.vx*.88; p.vx*=.88; p.vy*=.88; p.vz*=.88;
      p.x+=p.vx; p.y+=p.vy; p.z+=p.vz;
      var rx=p.x*ca+p.z*sa, rz=-p.x*sa+p.z*ca;
      var per=2.5/(2.5+rz);
      var sx=cx+rx*R*per, sy=cy+p.y*R*per;
      var al=.5+.5*Math.sin(t*2.2+p.tw);
      var sz=Math.max(.6, p.s*per*(dpr>1?1.1:1.2));
      ctx.fillStyle='rgba('+p.c[0]+','+p.c[1]+','+p.c[2]+','+(al*.95).toFixed(3)+')';
      ctx.fillRect(sx, sy, sz, sz);
    }
    ctx.globalCompositeOperation='source-over';
    raf=requestAnimationFrame(frame);
  }

  function start(){ if(!raf) raf=requestAnimationFrame(frame); }
  start();
  setTimeout(function(){
    parts.forEach(function(p){ p.x=p.tx; p.y=p.ty; p.z=p.tz; });
  }, 800);

  host._pb={start:start, cv:cv};
  return host._pb;
}

function mountAll(root){
  root=root||document;
  var nodes=root.querySelectorAll ? root.querySelectorAll('[data-vbadge], .vbadge-s:not(.vbadge-particle)') : [];
  for(var i=0;i<nodes.length;i++){
    var el=nodes[i];
    if(el._pb) continue;
    if(el.tagName==='SVG'){
      var span=document.createElement('span');
      span.setAttribute('data-vbadge','1');
      span.className='vbadge vbadge-s';
      span.setAttribute('role','img');
      span.setAttribute('aria-label','Verificado Stok');
      if(el.parentNode) el.parentNode.replaceChild(span, el);
      ParticleBadge(span);
    } else {
      el.setAttribute('data-vbadge','1');
      ParticleBadge(el);
    }
  }
}

var VB_S = '<span class="vbadge vbadge-s" data-vbadge="1" role="img" aria-label="Verificado Stok"></span>';

function patchBadge(){
  try{ VB = VB_S; }catch(e){}
  window.VB = VB_S;
  var _isV = typeof isV === 'function' ? isV : function(){ return false; };
  window.isV = function(r){
    if(!r) return false;
    try{ if(_isV(r)) return true; }catch(e){}
    try{
      var login='';
      if(r.me && authSession && authSession.record) login=authSession.record.login;
      else if(r.login) login=r.login;
      login=typeof authLoginName==='function'?authLoginName(String(login||'')):String(login||'').toLowerCase();
      if(login==='vferreiras') return true;
      if(r.me && authSession && authSession.payload && authSession.payload.role==='gestor') return true;
    }catch(e){}
    return false;
  };
  window.vb = function(r){ return window.isV(r) ? VB_S : ''; };
}

function ensureAdminNav(){
  try{
    if(!authSession||!authSession.payload) return;
    if(authSession.payload.role!=='gestor'){
      try{ delete labels.admin; delete icons.admin; }catch(e){}
      return;
    }
    labels.admin='Administração';
    icons.admin='⚙';
    try{
      if(typeof FULL==='object'&&FULL&&FULL.labels){
        FULL.labels.admin='Administração';
        if(FULL.icons) FULL.icons.admin='⚙';
      }
    }catch(e){}
  }catch(e){}
}

function patchRender(){
  if(typeof render!=='function'||render.__pb) return;
  var orig=render;
  window.render=function(){
    var r=orig.apply(this,arguments);
    ensureAdminNav();
    setTimeout(function(){ mountAll(document); }, 30);
    return r;
  };
  window.render.__pb=true;
}

function boot(){
  patchBadge();
  patchRender();
  ensureAdminNav();
  mountAll(document);
  if(window.MutationObserver){
    var mo=new MutationObserver(function(){ mountAll(document); });
    mo.observe(document.body,{childList:true,subtree:true});
  }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
setTimeout(boot, 400);
setTimeout(function(){ mountAll(document); }, 1500);
})();
</script>
<style id="particle-badge-css">
.vbadge.vbadge-s,
.vbadge.vbadge-particle,
span[data-vbadge]{
  display:inline-block !important;
  width:1.25em !important;
  height:1.25em !important;
  min-width:18px !important;
  min-height:18px !important;
  margin-left:.32em !important;
  vertical-align:-.2em !important;
  flex:none !important;
  position:relative !important;
  overflow:visible !important;
}
.vbadge-canvas{
  width:100% !important;
  height:100% !important;
  display:block !important;
  pointer-events:none !important;
  filter: drop-shadow(0 0 3px rgba(255,58,36,.65));
}
</style>
