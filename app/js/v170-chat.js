/* v170 · chat em tela cheia no celular (≤900 px, pedido do dono): no Chat some a barra de cima do app e a de baixo;
   lista de conversas, chat da equipe e conversas privadas/grupos usam a altura toda (100dvh / visualViewport da v149),
   com o cabeçalho do chat no topo, mensagens no meio e o campo embaixo (área segura do iPhone). A seta volta:
   na conversa → lista (como antes); na lista → tela anterior (e99Back da v157, senão Início).
   No chat da equipe, "Mais" (⋯) mostra o que ficava abaixo do chat (equipe sincronizada, buscar, convidar, sair). PC não muda. */
(function(){'use strict';var W=window,D=document;
var mq=W.matchMedia?W.matchMedia('(max-width:900px)'):{matches:false};
function on(){return typeof page!=='undefined'&&page==='chat'&&typeof authSession!=='undefined'&&!!authSession&&mq.matches}
function back(){try{if(W.e99Back&&W.e99Back())return}catch(x){}try{go('home')}catch(x){}}
W.e99ChatBack=back;
var IB='<svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
var IM='<svg aria-hidden="true" focusable="false" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>';
function deco(){var B=D.body;if(!B)return;var c=on();if(B.classList.contains('v170cf')!==c)B.classList.toggle('v170cf',c);if(!c){B.classList.remove('v170-x');return}
  var v=D.getElementById('view');if(!v)return;
  /* lista de conversas: seta para a tela anterior */
  var h=v.querySelector(':scope > .hero');if(h&&!v.querySelector('.chat-wrap,.cv-wrap[data-open]')&&!h.querySelector('.v170-back')){var b=D.createElement('button');b.type='button';b.className='v170-back';b.setAttribute('aria-label','Voltar');b.innerHTML=IB;b.addEventListener('click',back);h.insertBefore(b,h.firstChild)}
  /* chat da equipe: botão Mais (⋯) com o que fica abaixo do chat */
  var hd=v.querySelector('.chat-wrap .chat-head');if(hd&&!hd.querySelector('.v170-more')){var m=D.createElement('button');m.type='button';m.className='v170-more';m.setAttribute('aria-label','Mais opções do chat');m.setAttribute('aria-expanded','false');m.innerHTML=IM;
    m.addEventListener('click',function(){var x=!B.classList.contains('v170-x');B.classList.toggle('v170-x',x);m.setAttribute('aria-expanded',String(x))});hd.appendChild(m)}
  if(!hd)B.classList.remove('v170-x')}
D.addEventListener('keydown',function(e){if(e.key==='Escape'&&D.body.classList.contains('v170-x')){D.body.classList.remove('v170-x');var m=D.querySelector('.v170-more');if(m)m.setAttribute('aria-expanded','false')}});
D.addEventListener('click',function(e){var B=D.body;if(!B.classList.contains('v170-x'))return;var t=e.target;if(t.closest&&(t.closest('.v170-more')||t.closest('#chat-extras')||t.closest('.chat-leave-row')))return;B.classList.remove('v170-x');var m=D.querySelector('.v170-more');if(m)m.setAttribute('aria-expanded','false')});
var r0=render;render=function(){var r=r0.apply(this,arguments);try{deco()}catch(x){}return r};
if(mq.addEventListener)mq.addEventListener('change',function(){try{deco()}catch(x){}});
W.e99ChatFull={on:on,deco:deco};
try{deco()}catch(x){}
})();
