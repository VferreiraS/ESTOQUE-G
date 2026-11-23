/* v160 (pedido do dono): "Adicione uma opção de visualizar as imagens adicionadas no app."
   window.e99Img.open(lista, índice): tela cheia escura, imagem inteira, Fechar (✕, Esc), Baixar, contador "1/3",
   setas anterior/próxima e deslizar o dedo; zoom com pinça, toque duplo e roda do mouse; arrastar quando ampliada.
   É uma <dialog> modal: o voltar do aparelho / gesto (v157) fecha o visualizador sem sair do app.
   Só aceita data:image/(jpeg|png|webp|gif);base64 ou blob: já criado pelo próprio app (nunca SVG nem endereço remoto).
   Abre ao tocar: fotos do Plano (lista e editor), fotos do chat da equipe e das conversas, posts do mural, foto e capa do perfil. */
(function(){'use strict';
var D=document,W=window;
var OK=/^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=\r\n]+$/;
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function safe(u){u=String(u||'');if(OK.test(u))return u;if(/^blob:/.test(u)){try{var o=new URL(u.slice(5));if(o.origin===location.origin)return u}catch(e){}}return ''}
function rm(){try{return W.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}
var IC={x:'<path d="M6 6l12 12M18 6L6 18"/>',dl:'<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',l:'<path d="M15 5l-7 7 7 7"/>',r:'<path d="M9 5l7 7-7 7"/>'};
function svg(p){return '<svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
var dlg=null,L=[],I=0,back=null,s=1,tx=0,ty=0,ptr={},g=null,lastTap=0,tapT=0;
function el(){if(dlg)return dlg;dlg=D.createElement('dialog');dlg.id='e99-img';dlg.className='e99-img';dlg.setAttribute('aria-modal','true');dlg.setAttribute('aria-label','Visualizar imagem');
  dlg.innerHTML='<div class="iv-top"><span class="iv-count" aria-live="polite"></span><span class="iv-sp"></span>'
   +'<button type="button" class="iv-b iv-dl" aria-label="Baixar imagem" title="Baixar">'+svg(IC.dl)+'<span class="iv-t">Baixar</span></button>'
   +'<button type="button" class="iv-b iv-x" aria-label="Fechar visualizador" title="Fechar (Esc)">'+svg(IC.x)+'</button></div>'
   +'<div class="iv-stage"><img class="iv-im" alt="" draggable="false"></div>'
   +'<button type="button" class="iv-b iv-nav iv-prev" aria-label="Imagem anterior">'+svg(IC.l)+'</button>'
   +'<button type="button" class="iv-b iv-nav iv-next" aria-label="Próxima imagem">'+svg(IC.r)+'</button>'
   +'<p class="iv-cap"></p>';
  D.body.appendChild(dlg);
  dlg.querySelector('.iv-x').onclick=close;dlg.querySelector('.iv-dl').onclick=function(){download()};
  dlg.querySelector('.iv-prev').onclick=function(){step(-1)};dlg.querySelector('.iv-next').onclick=function(){step(1)};
  dlg.addEventListener('cancel',function(e){e.preventDefault();close()});
  dlg.addEventListener('close',done);
  dlg.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'){step(-1);e.preventDefault()}else if(e.key==='ArrowRight'){step(1);e.preventDefault()}
    else if(e.key==='+'||e.key==='='){zoomAt(s*1.5);e.preventDefault()}else if(e.key==='-'){zoomAt(s/1.5);e.preventDefault()}});
  var st=dlg.querySelector('.iv-stage');
  st.addEventListener('pointerdown',pd);st.addEventListener('pointermove',pm);['pointerup','pointercancel','pointerleave'].forEach(function(t){st.addEventListener(t,pu)});
  st.addEventListener('wheel',function(e){e.preventDefault();var r=st.getBoundingClientRect();zoomAt(s*(e.deltaY<0?1.2:1/1.2),e.clientX-r.left-r.width/2,e.clientY-r.top-r.height/2)},{passive:false});
  return dlg}
function im(){return dlg&&dlg.querySelector('.iv-im')}
function apply(anim){var m=im();if(!m)return;m.style.transition=anim&&!rm()?'transform .18s ease':'none';m.style.transform='translate('+tx+'px,'+ty+'px) scale('+s+')';dlg.classList.toggle('zoomed',s>1.01)}
function clampT(){var st=dlg.querySelector('.iv-stage'),m=im();if(!st||!m)return;var w=m.offsetWidth*s,h=m.offsetHeight*s,mx=Math.max(0,(w-st.clientWidth)/2),my=Math.max(0,(h-st.clientHeight)/2);tx=Math.max(-mx,Math.min(mx,tx));ty=Math.max(-my,Math.min(my,ty))}
function zoomAt(ns,cx,cy){ns=Math.max(1,Math.min(5,ns));cx=cx||0;cy=cy||0;var k=ns/s;tx=cx-(cx-tx)*k;ty=cy-(cy-ty)*k;s=ns;if(s===1){tx=0;ty=0}clampT();apply(true)}
function reset(){s=1;tx=0;ty=0;apply(false)}
function item(i){var x=L[i];return typeof x==='string'?{src:x}:(x||{})}
function show(){var x=item(I),m=im();reset();m.src=x.src;m.alt=String(x.alt||'Imagem');var n=L.length;
  dlg.querySelector('.iv-count').textContent=n>1?(I+1)+'/'+n:'';dlg.querySelector('.iv-count').setAttribute('aria-label',n>1?'Imagem '+(I+1)+' de '+n:'');
  dlg.querySelector('.iv-cap').textContent=String(x.alt||'');dlg.classList.toggle('multi',n>1);
  var ae=D.activeElement,pv=dlg.querySelector('.iv-prev'),nx=dlg.querySelector('.iv-next');pv.disabled=I<=0;nx.disabled=I>=n-1;
  if(ae&&ae.disabled&&(ae===pv||ae===nx)){var o=ae===pv?nx:pv;(o.disabled?dlg.querySelector('.iv-x'):o).focus()}}
function step(d){var j=I+d;if(j<0||j>=L.length)return;I=j;show();if(!rm()){var m=im();m.animate&&m.animate([{opacity:0,transform:'translateX('+(d*24)+'px)'},{opacity:1,transform:'none'}],{duration:180,easing:'ease-out'})}}
function open(list,idx,from){list=(Array.isArray(list)?list:[list]).map(function(x){var o=typeof x==='string'?{src:x}:Object.assign({},x||{});o.src=safe(o.src);return o}).filter(function(o){return o.src});
  if(!list.length)return false;L=list;I=Math.max(0,Math.min(L.length-1,idx|0));el();back=from||D.activeElement;show();
  if(!dlg.open){try{dlg.showModal()}catch(e){dlg.setAttribute('open','')}}
  D.documentElement.classList.add('e99-iv-on');try{dlg.querySelector('.iv-x').focus()}catch(e){}return true}
function close(){if(dlg&&dlg.open){try{dlg.close()}catch(e){dlg.removeAttribute('open');done()}}}
function done(){D.documentElement.classList.remove('e99-iv-on');ptr={};g=null;var b=back;back=null;try{if(b&&b.isConnected)b.focus()}catch(e){}}
/* baixar: os bytes da própria imagem (data: decodificado ou o blob já existente), tipo pela extensão */
function ext(src){var m=/^data:image\/(jpeg|png|webp|gif)/.exec(src);return m?(m[1]==='jpeg'?'jpg':m[1]):'jpg'}
function download(i){var x=item(i==null?I:i);if(!x.src)return false;if(typeof x.download==='function'){try{x.download();return true}catch(e){}}
  var name=String(x.name||('imagem-'+new Date().toISOString().slice(0,10)+'-'+((i==null?I:i)+1)+'.'+ext(x.src))).replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_');
  var href=x.src,tmp=false;if(/^data:/.test(href)){try{var b=atob(href.split(',')[1].replace(/\s/g,'')),a=new Uint8Array(b.length);for(var k=0;k<b.length;k++)a[k]=b.charCodeAt(k);href=URL.createObjectURL(new Blob([a],{type:'image/'+(ext(x.src)==='jpg'?'jpeg':ext(x.src))}));tmp=true}catch(e){return false}}
  var l=D.createElement('a');l.href=href;l.download=name;l.rel='noopener';l.style.display='none';(dlg&&dlg.open?dlg:D.body).appendChild(l);l.click();setTimeout(function(){l.remove();if(tmp)URL.revokeObjectURL(href)},30000);W.__e99LastDownload={name:name,at:Date.now()};return true}
/* gestos: 1 dedo = arrastar (ampliada) ou deslizar (troca de foto); 2 dedos = pinça; toque duplo = zoom */
function pts(){return Object.keys(ptr).map(function(k){return ptr[k]})}
function pd(e){if(e.target.closest&&e.target.closest('button'))return;ptr[e.pointerId]={x:e.clientX,y:e.clientY};try{e.currentTarget.setPointerCapture(e.pointerId)}catch(x){}var p=pts();
  if(p.length===2){var d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y)||1;g={pinch:1,d:d,s:s}}else if(p.length===1){g={x:e.clientX,y:e.clientY,tx:tx,ty:ty,t:Date.now(),moved:false}}}
function pm(e){if(!ptr[e.pointerId]||!g)return;ptr[e.pointerId]={x:e.clientX,y:e.clientY};var p=pts();
  if(g.pinch&&p.length>=2){var d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);var st=dlg.querySelector('.iv-stage').getBoundingClientRect();var ns=Math.max(1,Math.min(5,g.s*d/g.d));zoomAt(ns,(p[0].x+p[1].x)/2-st.left-st.width/2,(p[0].y+p[1].y)/2-st.top-st.height/2);apply(false);return}
  var dx=e.clientX-g.x,dy=e.clientY-g.y;if(Math.abs(dx)+Math.abs(dy)>8)g.moved=true;
  if(s>1){tx=g.tx+dx;ty=g.ty+dy;clampT();apply(false)}else if(L.length>1){var m=im();m.style.transition='none';m.style.transform='translateX('+dx*0.6+'px)'}}
function pu(e){if(!ptr[e.pointerId])return;delete ptr[e.pointerId];if(!g)return;if(g.pinch){if(!pts().length)g=null;return}
  var dx=e.clientX-g.x,dy=e.clientY-g.y,quick=Date.now()-g.t<300;
  if(s===1&&g.moved&&Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.3&&L.length>1){var d=dx<0?1:-1;if(I+d>=0&&I+d<L.length){g=null;step(d);return}}
  if(s===1)apply(true);
  if(!g.moved&&quick&&e.type==='pointerup'){var now=Date.now();if(now-lastTap<320){lastTap=0;var st=dlg.querySelector('.iv-stage').getBoundingClientRect();if(s>1)zoomAt(1);else zoomAt(2.5,e.clientX-st.left-st.width/2,e.clientY-st.top-st.height/2)}else lastTap=now}
  g=null}
/* ---- onde abre: toque/Enter numa imagem do app ---- */
var SEL='.plan-photos img,img[data-chat-img],.cv-img,.sc-img,img.sc-pav,img.pf-av,.sc-cover.img,img.e99-zoomable';
function srcOf(n){if(n.tagName==='IMG')return n.currentSrc||n.getAttribute('src')||'';var m=/url\(["']?([^"')]+)["']?\)/.exec(n.style.backgroundImage||'');return m?m[1]:''}
function altOf(n){return n.tagName==='IMG'?(n.getAttribute('alt')||'Imagem'):'Capa do perfil'}
function group(n){var box=n.closest('.plan-photos')||n.closest('#chat-list')||n.closest('#cv-msgs')||(n.classList.contains('sc-img')&&n.closest('#view'))||null;
  var sel=n.closest('.plan-photos')?'.plan-photos img':n.matches('img[data-chat-img]')?'img[data-chat-img]':n.matches('.cv-img')?'.cv-img':n.matches('.sc-img')?'.sc-img':null;
  var list=box&&sel?[].slice.call(box.querySelectorAll(sel)):[n];list=list.filter(function(x){return safe(srcOf(x))});if(list.indexOf(n)<0)list=[n];return list}
function itemOf(n){var o={src:srcOf(n),alt:altOf(n)};var k=n.getAttribute('data-e99-dl');if(k&&typeof W.downloadPlanPhoto==='function'){var p=k.split('|');o.download=function(){W.downloadPlanPhoto(p[0],p[1],p[2])}}return o}
function openFrom(n){if(n.closest('#e99-img,#st-view'))return false;var l=group(n);var i=l.indexOf(n);return open(l.map(itemOf),i<0?0:i,n)}
function hit(t){var n=t&&t.closest?t.closest(SEL):null;if(!n||n.closest('#e99-img,#st-view,button,label'))return null;return safe(srcOf(n))?n:null}
D.addEventListener('click',function(e){var n=hit(e.target);if(!n)return;if(openFrom(n)){e.preventDefault();e.stopPropagation()}},true);
D.addEventListener('keydown',function(e){if(e.key!=='Enter'&&e.key!==' ')return;var n=hit(e.target);if(!n||e.target!==n)return;if(openFrom(n)){e.preventDefault();e.stopPropagation()}},true);
/* deixa as imagens alcançáveis por teclado/leitor de tela */
function deco(){D.querySelectorAll(SEL).forEach(function(n){if(n.__e99iv||n.closest('#e99-img,#st-view,button,label'))return;if(!safe(srcOf(n)))return;n.__e99iv=1;n.tabIndex=0;n.setAttribute('role','button');n.classList.add('e99-iv-can');
  var a=altOf(n);n.setAttribute('aria-label','Ampliar: '+a);n.title='Toque para ampliar'})}
var dt=0;function later(){clearTimeout(dt);dt=setTimeout(deco,120)}
try{new MutationObserver(later).observe(D.body,{childList:true,subtree:true,attributes:true,attributeFilter:['src','style']})}catch(e){}
later();
W.e99Img={open:open,close:close,next:function(){step(1)},prev:function(){step(-1)},zoom:function(v,x,y){zoomAt(v,x,y)},download:download,safe:safe,
  state:function(){return {open:!!(dlg&&dlg.open),i:I,n:L.length,scale:s,tx:tx,ty:ty,src:dlg?im().src:''}}};
})();
