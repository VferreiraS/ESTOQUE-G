
(function(){
'use strict';
var desktopQuery=window.matchMedia?window.matchMedia('(min-width:901px)'):null;
function isStandalone(){return (window.matchMedia&&window.matchMedia('(display-mode: standalone)').matches)||window.navigator.standalone===true}
var isAppleMobile=/iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);

/* Botão de som: no computador entra na barra de opções visuais; no celular vira um botão redondo. */
function placeSound(){
  var b=document.getElementById('sound-control'),tools=document.querySelector('.visual-tools');
  if(!b||!tools)return;
  var desk=!!(desktopQuery&&desktopQuery.matches)&&!document.body.classList.contains('locked');
  if(desk&&b.parentNode!==tools)tools.insertBefore(b,document.getElementById('back-top'));
  else if(!desk&&b.parentNode===tools)document.body.appendChild(b);
}
if(desktopQuery){if(desktopQuery.addEventListener)desktopQuery.addEventListener('change',placeSound);else if(desktopQuery.addListener)desktopQuery.addListener(placeSound)}
if(window.MutationObserver)new MutationObserver(placeSound).observe(document.body,{attributes:true,attributeFilter:['class']});
placeSound();

/* Aviso para instalar como app (tela de login). */
var HINT_KEY='lojasg.estoque99.install-hint',deferredPrompt=null;
function hintDismissed(){try{return localStorage.getItem(HINT_KEY)==='off'}catch(e){return false}}
function removeHint(){var el=document.getElementById('install-hint');if(el)el.remove();document.body.classList.remove('has-install-hint')}
function showHint(html,actionLabel,action){
  if(hintDismissed()||isStandalone())return;
  var el=document.getElementById('install-hint');
  if(!el){el=document.createElement('div');el.id='install-hint';el.setAttribute('role','note');document.body.appendChild(el)}
  el.innerHTML='<p>'+html+'</p><div class="install-actions">'+(actionLabel?'<button type="button" class="primary" data-act="install">'+actionLabel+'</button>':'')+'<button type="button" data-act="close">Agora não</button></div>';
  el.onclick=function(ev){var t=ev.target.closest('button');if(!t)return;if(t.getAttribute('data-act')==='install'&&action)action();else if(t.getAttribute('data-act')==='close'){try{localStorage.setItem(HINT_KEY,'off')}catch(e){}removeHint()}};
  document.body.classList.add('has-install-hint');
}
if(isAppleMobile&&!isStandalone()&&location.protocol==='https:'){
  showHint('<strong>Use como app no iPhone/iPad:</strong> toque em <b>Compartilhar</b> <span aria-hidden="true">⬆︎</span> e depois em <b>Adicionar à Tela de Início</b>. Ele abre em tela cheia e funciona sem internet.');
}
window.addEventListener('beforeinstallprompt',function(e){
  e.preventDefault();deferredPrompt=e;
  showHint('<strong>Instale o Estoque 99</strong> para abrir como app, em tela cheia e sem internet.','Instalar',function(){
    if(!deferredPrompt)return;deferredPrompt.prompt();
    deferredPrompt.userChoice.then(function(){deferredPrompt=null;removeHint()},function(){deferredPrompt=null});
  });
});
window.addEventListener('appinstalled',removeHint);

/* Funcionar sem internet e permitir instalar: service worker (só em https ou localhost). */
var secureHost=location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1';
if('serviceWorker' in navigator&&secureHost){
  window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){})});
  navigator.serviceWorker.addEventListener('message',function(e){
    if(e.data&&e.data.type==='open-alerts'&&typeof go==='function'&&!document.body.classList.contains('locked'))go('alerts');
  });
}
/* Pede ao navegador para não apagar os dados salvos (importante no iPhone). */
try{if(navigator.storage&&navigator.storage.persisted&&navigator.storage.persist){navigator.storage.persisted().then(function(p){if(!p)return navigator.storage.persist()}).catch(function(){})}}catch(e){}
})();
