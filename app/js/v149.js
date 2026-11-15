/* v149: conversa no celular (iPhone) — campo de mensagem logo acima do teclado, sem a página balançar.
   Conversa privada/grupo (v138, .cv-wrap) fica em tela cheia fixa enquanto aberta; chat da equipe (.chat-wrap)
   só enquanto o campo está focado. Altura = visualViewport (não innerHeight/100vh). Barra de baixo some. */
(function(){
  var mq=window.matchMedia?matchMedia('(max-width:900px)'):{matches:false},on=false,kb=false,raf=0,lockY=0;
  var CF='.cv-compose textarea,#chat-text';
  function vv(){var v=window.visualViewport;return v?{h:v.height,t:v.offsetTop}:{h:innerHeight,t:0}}
  function typing(){var a=document.activeElement;return !!(a&&a.matches&&a.matches(CF))}
  function list(){return document.getElementById('cv-msgs')||document.getElementById('chat-list')}
  function nearEnd(b){return b&&b.scrollHeight-b.scrollTop-b.clientHeight<80}
  function toEnd(b){if(b)b.scrollTop=b.scrollHeight}
  function apply(){raf=0;var B=document.body;if(!B)return;
    var pg=typeof page!=='undefined'?page:'';var cv=document.querySelector('.cv-wrap[data-open]'),gw=document.querySelector('.chat-wrap');
    var t=typing(),want=pg==='chat'&&mq.matches&&!!(cv||(gw&&t));
    if(want!==on){on=want;
      if(on){lockY=window.scrollY||0;document.documentElement.classList.add('e99-convo-lock')}
      else{document.documentElement.classList.remove('e99-convo-lock');B.style.removeProperty('--e99-vvh');B.style.removeProperty('--e99-vvt')}
      B.classList.toggle('e99-convo',on);if(!on&&lockY){try{scrollTo(0,lockY)}catch(e){}lockY=0}}
    var k=on&&t;if(k!==kb){kb=k;B.classList.toggle('e99-convo-kb',kb)}
    if(!on)return;
    var b=list(),stay=nearEnd(b),m=vv();
    B.style.setProperty('--e99-vvh',Math.round(m.h)+'px');B.style.setProperty('--e99-vvt',Math.round(Math.max(0,m.t))+'px');
    /* o Safari rola a página ao focar: a página fica parada (a conversa acompanha a área visível) */
    if(window.scrollY&&!(window.visualViewport&&window.visualViewport.offsetTop)){try{scrollTo(0,0)}catch(e){}}
    if(stay)toEnd(b)}
  function q(){if(!raf)raf=requestAnimationFrame(apply)}
  window.e99Convo={on:function(){return on},kb:function(){return kb},apply:apply};
  if(window.visualViewport){visualViewport.addEventListener('resize',q);visualViewport.addEventListener('scroll',q)}
  addEventListener('resize',q);if(mq.addEventListener)mq.addEventListener('change',q);
  document.addEventListener('focusin',function(ev){if(!ev.target||!ev.target.matches||!ev.target.matches(CF))return;
    var b=list();apply();
    /* ao focar: fim da conversa visível (de novo quando o teclado terminar de subir) */
    toEnd(b);setTimeout(function(){if(on&&typing())toEnd(list())},350)},true);
  document.addEventListener('focusout',function(){setTimeout(q,60)},true);
  /* troca de tela / redesenho */
  if(window.MutationObserver)document.addEventListener('DOMContentLoaded',function(){var v=document.getElementById('view');if(v)new MutationObserver(q).observe(v,{childList:true})});
  var r0=window.render;if(typeof r0==='function'){window.render=function(){var x=r0.apply(this,arguments);q();return x};try{render=window.render}catch(e){}}
  /* toque arrastando fora da lista e do campo não rola a página por trás (iOS) */
  document.addEventListener('touchmove',function(ev){if(!on)return;var t=ev.target;if(t&&t.closest&&t.closest('.cv-msgs,#chat-list,textarea,dialog,.cv-sheet'))return;if(ev.cancelable)ev.preventDefault()},{passive:false});
  q();
})();
