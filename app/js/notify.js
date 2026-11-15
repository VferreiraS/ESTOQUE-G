
(function(){
'use strict';
/* Notificações do sistema: no Android e no iPhone instalado só funcionam pelo service worker (showNotification). */
window.showSiteNotification=function(title,body,tag,pg){if(typeof Notification==='undefined'||Notification.permission!=='granted')return Promise.resolve(false);
  var opts={body:String(body||''),tag:tag||'estoque99',renotify:true,icon:'icons/icon-192-v36.png',badge:'icons/icon-192-v36.png',data:{page:pg||'alerts'}};
  function legacy(){try{var n=new Notification(title,opts);n.onclick=function(){window.focus();if(typeof go==='function')go(pg||'alerts');n.close()};return true}catch(e){return false}}
  if(!navigator.serviceWorker||!navigator.serviceWorker.getRegistration)return Promise.resolve(legacy());
  return navigator.serviceWorker.getRegistration().then(function(r){if(r&&r.showNotification)return r.showNotification(title,opts).then(function(){return true});return legacy()}).catch(function(){return legacy()})};
emitDesktop=function(title,body){try{if(desktopPermission()!=='granted')return false}catch(e){return false}window.showSiteNotification(title,body,'estoque99-prazos','alerts');return true};
if(navigator.serviceWorker)navigator.serviceWorker.addEventListener('message',function(ev){var d=ev.data;if(d&&d.type==='open-page'&&typeof go==='function'&&authSession&&labels[d.page])go(d.page)});
/* aberto por um aviso (#abrir=pagina): vai para a página depois de entrar */
var wantPage='';try{var mm=String(location.hash||'').match(/abrir=([a-z-]{2,20})/);if(mm){wantPage=mm[1];history.replaceState(null,'',location.pathname+location.search)}}catch(e){}
function openWanted(){if(wantPage&&authSession&&labels[wantPage]){var p1=wantPage;wantPage='';setTimeout(function(){go(p1)},50)}}
var enterOpen=authEnter;authEnter=function(){var r=enterOpen.apply(this,arguments);openWanted();return r};if(typeof authSession!=='undefined'&&authSession)openWanted();
/* v148: os avisos só aparecem com o Stok aberto (ou em segundo plano no navegador); não há mais app externo de avisos. */
})();
