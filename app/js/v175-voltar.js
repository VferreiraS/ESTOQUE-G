/* v175 · botões Voltar no padrão do iOS (pedido do dono: "botões de Voltar igual da Apple").
   Todo botão de voltar do app ganha a classe única .e99-voltar e o mesmo desenho:
   chevron fino vermelho + rótulo da tela anterior (ou "Voltar"), alinhado à esquerda, toque ≥ 44 px.
   Botões cobertos: "‹ Voltar" do topo das telas (v157, .e99-back), seta da lista de conversas (v170, .v170-back),
   seta do chat da equipe (.chat-back) e da conversa privada/grupo (.cv-back, v138).
   O que cada botão faz não muda (onclick original; gesto de deslizar/voltar do aparelho da v157 continua). */
(function(){'use strict';var D=document,W=window;
var NAMES={home:'Início','mobile-menu':'Mais',nfs:'Notas',plans:'Plano',chat:'Chat',team:'Equipe',corridors:'Corredores',data:'Dados',alerts:'Alertas',account:'Minha conta',admin:'Admin',profile:'Perfil',pessoa:'Perfil',reports:'Relatórios'};
var SEL='.e99-back,.cv-back,.chat-back,.v170-back';
var CH='<svg class="e99-voltar-ic" aria-hidden="true" focusable="false" width="12" height="21" viewBox="0 0 12 21" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M10 2 2 10.5 10 19"/></svg>';
function prev(){try{var t=W.e99Nav&&e99Nav.target?e99Nav.target():'home';return NAMES[t]||'Voltar'}catch(e){return 'Voltar'}}
function label(b){if(b.classList.contains('cv-back'))return 'Conversas';return prev()}
function deco(){var l=D.querySelectorAll(SEL);for(var i=0;i<l.length;i++){var b=l[i];
  if(!b.classList.contains('e99-voltar'))b.classList.add('e99-voltar');
  if(!b.querySelector('.e99-voltar-ic'))b.innerHTML=CH+'<span class="e99-voltar-t"></span>';
  var t=label(b),s=b.querySelector('.e99-voltar-t');if(s&&s.textContent!==t)s.textContent=t;
  if(b.classList.contains('v170-back')){var a='Voltar para '+t;if(b.getAttribute('aria-label')!==a)b.setAttribute('aria-label',a)}}}
var q=false;function later(){if(q)return;q=true;(W.requestAnimationFrame||setTimeout)(function(){q=false;try{deco()}catch(e){}})}
if(typeof render==='function'){var r0=render;render=function(){var r=r0.apply(this,arguments);try{deco()}catch(e){}return r}}
function watch(){var v=D.getElementById('view');if(!v||!W.MutationObserver)return;new MutationObserver(later).observe(v,{childList:true,subtree:true})}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',function(){watch();later()});else{watch();later()}
W.e99Voltar={deco:deco,sel:SEL};
})();
