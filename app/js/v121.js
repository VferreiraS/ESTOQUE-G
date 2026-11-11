
(function(){
'use strict';
/* v121 (pedido do dono): (A) toda a IA saiu do app — apaga do aparelho o que sobrou dela (configuração dos agentes,
   piloto automático, resumo do dia, robô antigo); o resto (chat, equipe, planilha, e-mails, conferência) fica intacto.
   (B) barra de carregamento na tela de entrar: avança por etapas (scripts, página, fontes, app sem internet + bibliotecas,
   som de abertura) e só então libera o formulário. Limite de 6 s (falha segura). Um envio feito durante o carregamento
   não se perde: é refeito quando a barra termina. */
var W=window,D=document;
/* ---------- (A) limpeza dos dados antigos de IA ---------- */
var IA_PRE=['lojasg.estoque99.agents','lojasg.estoque99.autopilot','lojasg.estoque99.agent-brief','lojasg.estoque99.robot'];
function iaClean(){var n=0;try{var ks=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&IA_PRE.some(function(p){return k.indexOf(p)===0}))ks.push(k)}ks.forEach(function(k){localStorage.removeItem(k);n++})}catch(x){}return n}
W.e99IaClean=iaClean;iaClean();
/* dentro da conta cifrada: o validate já descarta o resumo da IA (state.sealed) e a configuração antiga (payload.ai);
   grava a conta uma vez para não sobrar cópia antiga */
var en=authEnter;authEnter=function(){var r=en.apply(this,arguments);iaClean();var s=authSession;
  setTimeout(function(){try{if(!s||authSession!==s)return;var f='lojasg.estoque99.ia-clean:'+s.storeKey;if(localStorage.getItem(f))return;
    Promise.resolve(authPersist(JSON.stringify(state))).then(function(){try{localStorage.setItem(f,'1')}catch(x){}}).catch(function(){})}catch(x){}},2500);return r};
/* ---------- (B) barra de carregamento ---------- */
var bar=D.getElementById('e99-boot'),fill=bar&&bar.firstElementChild,STEPS=['scripts','pagina','fontes','offline','som'],done={},finished=false,queued=null,T0=W.__e99BootT0||Date.now();
function calm(){try{return D.body.classList.contains('fx-off')||D.documentElement.classList.contains('e99-calm')||(W.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(x){return false}}
function pct(){return Math.round(8+92*Object.keys(done).length/STEPS.length)}
function paint(){if(!bar)return;var p=pct();if(fill)fill.style.width=p+'%';bar.setAttribute('aria-valuenow',String(p))}
function mark(k){if(finished||done[k])return;done[k]=Date.now()-T0;paint();if(Object.keys(done).length>=STEPS.length)finish('ok')}
function finish(why){if(finished)return;finished=true;W.__e99Boot={why:why,ms:Date.now()-T0,at:Date.now(),steps:done};
  if(bar){if(fill)fill.style.width='100%';bar.setAttribute('aria-valuenow','100');bar.classList.add('done');var b=bar;bar=null;setTimeout(function(){if(b.parentNode)b.parentNode.removeChild(b)},calm()?0:450)}
  D.body.classList.remove('e99-booting');var sc=D.getElementById('auth-screen');if(sc)sc.removeAttribute('aria-busy');
  try{W.dispatchEvent(new Event('e99:boot'))}catch(x){}
  if(queued&&queued.isConnected){var f=queued;queued=null;/* evento sintético: nunca faz o envio nativo do formulário (que poria login e senha no endereço); só chama o authSubmit */
    setTimeout(function(){try{f.dispatchEvent(new Event('submit',{cancelable:true,bubbles:true}))}catch(x){}},0)}}
W.__e99BootFinish=finish;W.e99Boot={done:function(){return finished},steps:function(){return done}};
if(!bar||!D.body.classList.contains('e99-booting')){finish('sem-barra')}
else{
  var sc0=D.getElementById('auth-screen');if(sc0)sc0.setAttribute('aria-busy','true');
  /* envio durante o carregamento: guarda e refaz ao terminar */
  D.addEventListener('submit',function(ev){if(finished)return;var f=ev.target;if(!f||!f.closest||!f.closest('#auth-screen'))return;ev.preventDefault();ev.stopImmediatePropagation();queued=f},true);
  /* toque durante o carregamento já destrava o áudio (o iPhone só deixa dentro do toque) */
  ['pointerdown','touchend','click'].forEach(function(t){D.addEventListener(t,function(){if(finished)return;try{unlockSiteAudio()}catch(x){}},{passive:true,capture:true})});
  mark('scripts');
  function afterLoad(){mark('pagina');
    try{if(D.fonts&&D.fonts.ready)D.fonts.ready.then(function(){mark('fontes')},function(){mark('fontes')});else mark('fontes')}catch(x){mark('fontes')}
    offline();sound()}
  function offline(){if(!('serviceWorker' in navigator)||!W.caches){mark('offline');return}var t=Date.now();
    (function poll(){navigator.serviceWorker.getRegistration().then(function(r){
      if(r&&r.active&&!r.installing){vendor();return}
      if((r&&(r.installing||r.waiting))||Date.now()-t<1500){setTimeout(poll,150);return}mark('offline')}).catch(function(){mark('offline')})})()}
  function vendor(){var L=['vendor/zxing.min.js','vendor/fuse.min.js','vendor/flatpickr.min.js','vendor/fonts/inter-latin.woff2','vendor/fonts/space-grotesk-latin.woff2'];
    Promise.all(L.map(function(u){return caches.match(u).then(function(m){return !!m},function(){return false})})).then(function(a){W.__e99BootVendor=a.every(Boolean);mark('offline')},function(){mark('offline')})}
  function sound(){if(typeof siteSoundEnabled!=='undefined'&&!siteSoundEnabled){mark('som');return}var ctx=null;try{ctx=unlockSiteAudio()}catch(x){}
    if(!ctx||ctx.state==='running'){mark('som');return}var t=Date.now();try{ctx.resume().catch(function(){})}catch(x){}
    /* sem toque o iPhone deixa o áudio suspenso: o som fica guardado para o primeiro toque (v118) */
    (function w(){if(ctx.state==='running'||Date.now()-t>1200){mark('som');return}setTimeout(w,80)})()}
  if(D.readyState==='complete')afterLoad();else W.addEventListener('load',afterLoad,{once:true});
}
})();
