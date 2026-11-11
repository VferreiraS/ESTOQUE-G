
(function(){
'use strict';
/* No celular: arrastar a tela para baixo no topo e soltar atualiza (equipe, dados e versão do site). */
if(!('ontouchstart' in window))return;
var el=document.createElement('div');el.id='ptr';el.setAttribute('aria-hidden','true');el.innerHTML='<i></i>';document.body.appendChild(el);
var y0=null,dy=0,busy=false,MAX=110,GO=70;
function topNow(){return (window.scrollY||document.documentElement.scrollTop||0)<=0}
function blocked(t){return !!(document.querySelector('dialog[open]')||(t&&t.closest&&t.closest('input,textarea,select,#chat-list,.tablewrap')))}
function show(d){var p=Math.min(MAX,d);el.style.transform='translateY('+(p-50)+'px) rotate('+(p*4)+'deg)';el.style.opacity=String(Math.min(1,p/GO))}
function hide(){el.classList.remove('spin');el.style.transition='transform .25s,opacity .25s';el.style.transform='translateY(-60px)';el.style.opacity='0';setTimeout(function(){el.style.transition=''},260)}
addEventListener('touchstart',function(e){if(busy||!topNow()||blocked(e.target)||e.touches.length!==1){y0=null;return}y0=e.touches[0].clientY;dy=0},{passive:true});
addEventListener('touchmove',function(e){if(y0==null)return;dy=e.touches[0].clientY-y0;if(dy>0&&topNow())show(dy*.6);else if(dy<=0){y0=null;hide()}},{passive:true});
addEventListener('touchend',async function(){if(y0==null)return;y0=null;if(dy*.6<GO){hide();return}
  busy=true;el.classList.add('spin');el.style.transform='translateY(18px)';el.style.opacity='1';
  try{if(navigator.vibrate)navigator.vibrate(10)}catch(x){}
  try{
    if(typeof authSession==='undefined'||!authSession){location.reload();return}
    var jobs=[];if(window.syncNow)jobs.push(Promise.resolve(window.syncNow()).catch(function(){}));
    if(navigator.serviceWorker)jobs.push(navigator.serviceWorker.getRegistration().then(function(r){return r&&r.update()}).catch(function(){}));
    await Promise.race([Promise.all(jobs),new Promise(function(r){setTimeout(r,4000)})]);
    /* versão nova publicada? recarrega já com ela */
    try{var sv=await (await fetch('./sw.js?'+Date.now(),{cache:'no-store'})).text();var nv=(sv.match(/estoque99-v(\d+)/)||[])[1];var cv=String(window.SITE_VERSION||((document.querySelector('meta[name="estoque99-version"]')||{}).content)||'');if(nv&&cv&&Number(nv)>Number(cv)){el.classList.remove('spin');location.reload();return}}catch(x){}
    await new Promise(function(r){setTimeout(r,500)});
    try{render()}catch(x){}
  }finally{busy=false;hide()}},{passive:true});
})();
