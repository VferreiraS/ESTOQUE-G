
/* Atualização: procura versão nova ao abrir, ao voltar para o app (iPhone/Android guardam o app aberto em segundo plano),
   quando a internet volta e a cada 30 min. Só recarrega quando a página aberta é mais velha que a publicada e nada está
   sendo editado; a sessão passa para a página recarregada (não pede senha de novo). Senão mostra "Atualizar agora". */
(function(){var VERSION=(document.querySelector('meta[name="estoque99-version"]')||{}).content||'';window.SITE_VERSION=VERSION;
if(!('serviceWorker' in navigator))return;var secure=location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1';if(!secure)return;
var reloaded=false,reg=null,lastCheck=0,pending=false;
function newer(v){return !!v&&!!VERSION&&+v>+VERSION}
function busy(){try{if(typeof window.siteBusy==='function'&&window.siteBusy())return true;if(document.querySelector('dialog[open]'))return true;var a=document.activeElement;if(a&&/^(INPUT|TEXTAREA|SELECT)$/.test(a.tagName)&&a.type!=='button'&&String(a.value||'').length)return true}catch(e){return true}return false}
function doReload(){if(reloaded)return;reloaded=true;try{sessionStorage.setItem('e99-updated',VERSION||'1')}catch(e){}
  var go=function(){location.reload();setTimeout(function(){reloaded=false;try{sessionStorage.removeItem('e99-updated')}catch(e){}},8000)};
  try{Promise.resolve(typeof window.beforeSiteReload==='function'?window.beforeSiteReload():null).catch(function(){}).then(go)}catch(e){go()}}
function bar(){if(document.getElementById('update-bar')||!document.body)return;var b=document.createElement('div');b.id='update-bar';b.setAttribute('role','status');b.innerHTML='<span>Nova versão do site pronta.</span><button type="button">Atualizar agora</button>';b.querySelector('button').onclick=function(){if(busy()&&!confirm('Há uma edição aberta. Atualizar mesmo assim? O que não foi salvo será perdido.'))return;reloaded=false;doReload()};document.body.appendChild(b)}
function ready(){pending=true;if(document.visibilityState==='visible'&&!busy())doReload();else bar()}
/* o service worker avisa a versão: ao assumir (activate) e quando termina de baixar a página nova em segundo plano */
navigator.serviceWorker.addEventListener('message',function(ev){var d=ev.data;if(!d||d.type!=='page-updated'||!newer(d.version))return;pending=true;
  check(true).then(function(){if(reg&&(reg.installing||reg.waiting))return;/* o novo service worker avisa de novo ao assumir */ready()})});
function check(force){if(!reg)return Promise.resolve();var now=Date.now();if(!force&&now-lastCheck<60000)return Promise.resolve();lastCheck=now;return reg.update().catch(function(){})}
navigator.serviceWorker.register('sw.js').then(function(r){reg=r;check(true)}).catch(function(){});
document.addEventListener('visibilitychange',function(){if(document.visibilityState!=='visible')return;if(pending&&!busy()){doReload();return}check()});
window.addEventListener('pageshow',function(e){if(!e.persisted)return;if(reg&&reg.active&&navigator.serviceWorker.controller&&navigator.serviceWorker.controller!==reg.active){ready();return}check(true)});
window.addEventListener('focus',function(){check()});
window.addEventListener('online',function(){check(true)});
setInterval(function(){if(document.visibilityState==='visible')check()},30*60000);
/* botão "Procurar atualização" */
window.checkSiteUpdate=async function(){var say=typeof notify==='function'?notify:function(m){alert(m)};say('Procurando atualização…');var latest='';
  try{var t=await (await fetch('sw.js?check='+Date.now(),{cache:'no-store'})).text();var m=t.match(/estoque99-v(\d+)/);latest=m?m[1]:''}catch(e){say('Sem internet para procurar atualização.');return}
  if(newer(latest)){pending=true;say('Versão '+latest+' encontrada. Atualizando…');await check(true);setTimeout(function(){if(reloaded)return;if(busy()){bar();say('Salve ou feche o que está editando e toque em "Atualizar agora".')}else doReload()},4000)}
  else say('Você já está na versão mais nova ('+(VERSION||latest)+').')};
try{var up=sessionStorage.getItem('e99-updated');if(up){sessionStorage.removeItem('e99-updated');if(up!==VERSION)setTimeout(function(){if(typeof notify==='function')notify('Site atualizado para a versão '+VERSION+'.')},1200)}}catch(e){}
})();
