
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
/* aberto por um aviso com o app fechado (#abrir=pagina): vai para a página depois de entrar */
var wantPage='';try{var mm=String(location.hash||'').match(/abrir=([a-z-]{2,20})/);if(mm){wantPage=mm[1];history.replaceState(null,'',location.pathname+location.search)}}catch(e){}
function openWanted(){if(wantPage&&authSession&&labels[wantPage]){var p1=wantPage;wantPage='';setTimeout(function(){go(p1)},50)}}
var enterOpen=authEnter;authEnter=function(){var r=enterOpen.apply(this,arguments);openWanted();return r};if(typeof authSession!=='undefined'&&authSession)openWanted();
/* Alertas: avisos com o app fechado pelo app ntfy */
var STORE_IOS='https://apps.apple.com/app/ntfy/id1625396347',STORE_AND='https://play.google.com/store/apps/details?id=io.heckel.ntfy';
function panel(){var t=window.e99Team&&window.e99Team.get();var e=function(x){return esc(String(x))};
  if(!t)return '<div class="panel help" id="ntfy-panel"><h2>Avisos com o app fechado</h2><p>Primeiro crie ou entre na equipe em <b>Chat</b>. Depois volte aqui para assinar os avisos no app ntfy.</p></div>';
  return '<div class="panel help" id="ntfy-panel"><h2>Avisos com o app fechado</h2><p>O site só avisa enquanto está aberto. Para receber <b>mesmo com o app fechado ou o celular bloqueado</b>, use o app gratuito <b>ntfy</b>:</p><ol><li>Instale o ntfy: <a href="'+STORE_IOS+'" target="_blank" rel="noopener">iPhone</a> · <a href="'+STORE_AND+'" target="_blank" rel="noopener">Android</a> (no computador, use o navegador).</li><li>Toque em <b>Assinar avisos da equipe</b> abaixo (ou, no app, toque em <b>+</b> e cole o nome do canal).</li><li>Permita as notificações do ntfy quando ele pedir.</li></ol>'
   +'<div class="toolbar"><a class="primary" href="ntfy://ntfy.sh/'+e(t.atopic)+'" style="display:inline-flex;align-items:center;min-height:44px;padding:0 16px;border-radius:12px;text-decoration:none">Assinar avisos da equipe</a><a href="https://ntfy.sh/'+e(t.atopic)+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;min-height:44px">Abrir no navegador</a><button type="button" onclick="navigator.clipboard&&navigator.clipboard.writeText(\''+e(t.atopic)+'\').then(function(){notify(\'Nome do canal copiado.\')})">Copiar canal</button></div>'
   +'<p class="small">Canal: <code>'+e(t.atopic)+'</code>. Chegam avisos curtos de <b>mensagem nova no chat</b> e, uma vez por dia (a partir das 8h), de <b>NFs aguardando conferência</b>, sem dados das notas. Os avisos de NF saem quando algum aparelho da equipe abre o site no dia.</p></div>'}
var before=renderAlertsPage;renderAlertsPage=function(){return before.apply(this,arguments)+panel()};
})();
