
(function(){
'use strict';
/* v123: aparelho Apple usa a fonte do sistema (SF); logo = ícone squircle de vidro com o S nas cores do tema (ícone original, não é o da Apple). */
var D=document,H=D.documentElement;
try{var ua=navigator.userAgent||'',pf=navigator.platform||'';if(/iPhone|iPad|iPod|Macintosh|Mac OS X/.test(ua)||/^Mac|iPhone|iPad/.test(pf))H.classList.add('e99-apple')}catch(e){}
var S='M42 14h30.5a7.5 7.5 0 0 1 0 15H42a3.5 3.5 0 0 0 0 7H58a21 21 0 0 1 0 42H27.5a7.5 7.5 0 0 1 0-15H58a6 6 0 0 0 0-12H42a18.5 18.5 0 0 1 0-37z';
function tok(n,d){var v='';try{v=getComputedStyle(D.body||H).getPropertyValue(n).trim()}catch(e){}return /^#[0-9a-f]{3,8}$/i.test(v)?v:d}
function svg(){var a=tok('--neon-hot','#F3DDF7'),b=tok('--neon','#C79BD0');
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#38343f"/><stop offset=".55" stop-color="#17151b"/><stop offset="1" stop-color="#070608"/></linearGradient>'
   +'<radialGradient id="g" cx=".5" cy=".42" r=".55"><stop offset="0" stop-color="'+b+'" stop-opacity=".5"/><stop offset="1" stop-color="'+b+'" stop-opacity="0"/></radialGradient>'
   +'<linearGradient id="s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".5" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient>'
   +'<linearGradient id="r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".35" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity=".22"/></linearGradient></defs>'
   +'<rect width="100" height="100" rx="22.5" fill="url(#b)"/><rect width="100" height="100" rx="22.5" fill="url(#g)"/><ellipse cx="50" cy="4" rx="55" ry="29" fill="#fff" opacity=".07"/>'
   +'<rect x=".5" y=".5" width="99" height="99" rx="22" fill="none" stroke="url(#r)"/>'
   +'<g transform="translate(50 51.5) scale(.74) translate(-50 -46)"><path fill="url(#s)" d="'+S+'"/></g></svg>'}
var last='';function uri(){return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg())}
function paint(){var u=uri();last=u;D.querySelectorAll('.logo img,img[data-e99-logo],img.entry-logo').forEach(function(im){if(im.getAttribute('src')!==u)im.setAttribute('src',u)})}
window.e99LogoV123=function(){paint();return last};
['render','renderAuth'].forEach(function(n){var f=window[n];if(typeof f!=='function')return;window[n]=function(){var r=f.apply(this,arguments);try{paint()}catch(e){}return r}});
if(typeof window.e99ApplySeason==='function'){var as=window.e99ApplySeason;window.e99ApplySeason=function(){var r=as.apply(this,arguments);try{paint()}catch(e){}return r}}
if(typeof window.e99LogoPaint==='function'){var lp=window.e99LogoPaint;window.e99LogoPaint=function(){var r=lp.apply(this,arguments);try{paint()}catch(e){}return r}}
try{new MutationObserver(function(){setTimeout(paint,0)}).observe(H,{attributes:true,attributeFilter:['data-e99-theme']});new MutationObserver(function(ms){if(ms.some(function(m){var t=m.target;return t.tagName==='IMG'&&t.getAttribute('src')!==last&&t.matches('.logo img,img[data-e99-logo],img.entry-logo')}))paint()}).observe(D.documentElement,{attributes:true,attributeFilter:['src'],subtree:true,childList:false})}catch(e){}
/* o tema do mês trocava o ícone da aba por um SVG: fica o ícone novo */
function fav(){var l=D.querySelector('link[rel="icon"]');if(l&&l.getAttribute('href')!=='icons/favicon-v123.png'){l.setAttribute('type','image/png');l.setAttribute('href','icons/favicon-v123.png')}}
setInterval(fav,4000);paint();fav();setTimeout(paint,300);
})();
