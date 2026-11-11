
/* v114: a logo (S da marca) segue a cor de destaque do tema (--neon-hot → --neon-btn), mesma forma e brilho. Ícones instalados (PNG do manifest) ficam como estão. */
(function(){var PRE='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InIi';
var S='M42 14h30.5a7.5 7.5 0 0 1 0 15H42a3.5 3.5 0 0 0 0 7H58a21 21 0 0 1 0 42H27.5a7.5 7.5 0 0 1 0-15H58a6 6 0 0 0 0-12H42a18.5 18.5 0 0 1 0-37z',last='';
function tok(n,d){var v='';try{v=getComputedStyle(document.body||document.documentElement).getPropertyValue(n).trim()}catch(e){}return /^#[0-9a-f]{3,8}$/i.test(v)?v:d}
function src(){var a=tok('--neon-hot','#ff6a48'),b=tok('--neon-btn','#d9140b');return 'data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="'+a+'"/><stop offset="1" stop-color="'+b+'"/></linearGradient></defs><path fill="url(#r)" d="'+S+'"/></svg>')}
function paint(force){var u=src();if(u===last&&!force){mark();return}last=u;mark()}
function mark(){var l=document.querySelectorAll('img');for(var i=0;i<l.length;i++){var im=l[i];if(im.dataset.e99Logo||(im.getAttribute('src')||'').indexOf(PRE)===0){im.dataset.e99Logo='1';if(im.getAttribute('src')!==last)im.setAttribute('src',last)}}}
window.e99LogoPaint=function(){paint(true)};
function boot(){paint(true);try{new MutationObserver(function(){paint()}).observe(document.documentElement,{attributes:true,attributeFilter:['data-e99-theme']});}catch(e){}['render','renderAuth'].forEach(function(n){var f=window[n];if(typeof f!=='function'||f.__lg)return;var w=function(){var r=f.apply(this,arguments);try{mark()}catch(e){}return r};w.__lg=true;window[n]=w})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();setTimeout(boot,500)})();
