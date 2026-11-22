/* v157 (pedido do dono): "Adicione opções de voltar. Algumas telas não têm como voltar, só saindo do app."
   (A) Botão "‹ Voltar" (44 px, aria-label "Voltar para …") no topo de toda tela de segundo nível
       (Equipe, Corredores, Dados, Alertas, Minha conta, Administração, Perfil, pessoa, Relatórios, editor do plano…).
       Volta para a tela de onde veio (pilha própria); sem origem, vai ao Início.
       Telas-raiz (Início, Notas, Plano, Chat, Mais) não têm o botão: ficam na barra de baixo/menu.
   (B) Botão voltar do sistema / gesto de deslizar: uma "guarda" no histórico (history.pushState, sem mudar o endereço).
       Ao voltar: fecha a janela aberta (como o Esc), sai da conversa, do editor do plano, ou volta uma tela; e arma a guarda de novo.
       No Início sem nada aberto o 1º voltar é absorvido (avisa) e o 2º sai normalmente: não prende nem cria laço.
       Não muda o endereço (#auxiliar=, ?v=, abertura e "Entrar" seguem iguais).
   (C) Esc no PC fecha também o menu lateral do celular aberto (as janelas <dialog> já fecham com Esc). */
(function(){'use strict';
var D=document,W=window,S=[],nav=false,rest=false,MAX=20;
var ROOT={home:1,'mobile-menu':1,nfs:1,plans:1,chat:1};
var NAMES={home:'Início','mobile-menu':'Mais opções',nfs:'Notas fiscais',plans:'Plano de ação',chat:'Chat',team:'Equipe',corridors:'Corredores',data:'Dados e ajuda',alerts:'Alertas',account:'Minha conta',admin:'Administração',profile:'Meu perfil',pessoa:'Perfil',reports:'Relatórios'};
function logged(){try{return typeof authSession!=='undefined'&&!!authSession}catch(e){return false}}
function nameOf(p){try{return NAMES[p]||(typeof labels!=='undefined'&&labels[p])||'tela anterior'}catch(e){return 'tela anterior'}}
function draft(){try{return page==='plans'&&typeof planDraft!=='undefined'&&!!planDraft}catch(e){return false}}
function convOpen(){return page==='chat'&&!!D.querySelector('#view .cv-wrap[data-open]')}
function vis(e){if(!e||!e.isConnected)return false;var r=e.getBoundingClientRect();return r.width>0&&r.height>0}
/* ---- pilha ---- */
function push(from,to){if(!from||from===to)return;if(to==='home'){S.length=0;return}var i=S.lastIndexOf(to);if(i>=0){S.length=i;return}
  if(S[S.length-1]!==from)S.push(from);if(S.length>MAX)S.splice(0,S.length-MAX)}
function target(){if(draft())return 'plans';var t=S.length?S[S.length-1]:'home';return t===page?'home':t}
/* ---- guarda no histórico ---- */
function armed(){try{return !!(history.state&&history.state.e99g)}catch(e){return false}}
function arm(){if(!logged()||rest||armed())return;try{history.pushState({e99g:1},'')}catch(e){}}
function wake(){rest=false;arm()}
/* ---- camadas abertas (de cima para baixo) ---- */
function topDialog(){var l=[].slice.call(D.querySelectorAll('dialog[open]')).filter(function(d){return d.id!=='e99-boot'});return l[l.length-1]||null}
function closeLayer(){
  var mm=D.getElementById('msg-menu');if(mm&&mm.isConnected){D.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));if(mm.isConnected)mm.remove();return true}
  var sv=D.getElementById('st-view');if(sv&&vis(sv)&&W.e99StClose){try{e99StClose()}catch(e){}return true}
  var d=topDialog();if(d){var ev=new Event('cancel',{cancelable:true});d.dispatchEvent(ev);if(!ev.defaultPrevented&&d.open)d.close();return true}
  if(D.body.classList.contains('menu')){D.body.classList.remove('menu');return true}
  return false}
/* um passo para trás. fromSystem = veio do botão/gesto do aparelho */
function back(fromSystem){
  if(!logged())return false;
  if(D.querySelector('.si-gate'))return true;/* abertura com "Entrar" (v141): fica como está */
  if(closeLayer())return true;
  if(convOpen()&&W.e99Cv){try{e99Cv.list()}catch(e){}return true}
  if(draft()){try{planCancel()}catch(e){}return true}
  if(page!=='home'){var t=S.length?S.pop():'home';if(t===page)t='home';nav=true;try{go(t)}finally{nav=false}if(page!==t&&page!=='home'){nav=true;try{go('home')}finally{nav=false}}return true}
  return false}
W.e99Back=function(){var r=back(false);if(r)wake();return r};
addEventListener('popstate',function(ev){if(!logged())return;if(armed())return;/* chegou numa guarda (avançar): nada a fazer */
  if(back(true)){rest=false;arm();return}
  /* Início sem nada aberto: o próximo voltar sai do app */
  rest=true;try{notify('Toque em voltar de novo para sair do app.')}catch(e){}});
/* Esc no PC: as <dialog> já fecham sozinhas; aqui só o menu lateral e o status em tela cheia */
D.addEventListener('keydown',function(e){if(e.key!=='Escape'||e.defaultPrevented||topDialog())return;if(D.body.classList.contains('menu')){D.body.classList.remove('menu');e.preventDefault()}});
/* ---- navegação: guarda a origem ---- */
var go0=go;go=function(p){var from=page;var r=go0.apply(this,arguments);try{if(!nav&&page!==from)push(from,page);if(logged()){rest=false;arm();bar()}}catch(e){}return r};
if(typeof openPlan==='function'){var op0=openPlan;openPlan=function(){var from=page;var r=op0.apply(this,arguments);try{if(page!==from)push(from,page);wake();bar()}catch(e){}return r}}
if(typeof authEnter==='function'){var ae0=authEnter;authEnter=function(){S.length=0;rest=false;var r=ae0.apply(this,arguments);setTimeout(arm,0);return r}}
if(typeof authLogout==='function'){var lo0=authLogout;authLogout=function(){var r=lo0.apply(this,arguments);S.length=0;return r}}
/* janela aberta = arma a guarda (o voltar do aparelho fecha a janela em vez de sair) */
try{var sm=HTMLDialogElement.prototype.showModal;HTMLDialogElement.prototype.showModal=function(){var r=sm.apply(this,arguments);try{if(logged())wake()}catch(e){}return r}}catch(e){}
/* ---- botão Voltar no topo da tela ---- */
function bar(){var v=D.getElementById('view');if(!v)return;var old=D.getElementById('e99-backbar');
  var need=logged()&&(draft()||!ROOT[page]);if(!need){if(old)old.remove();return}
  var t=target(),lbl=draft()?'Voltar para o Plano de ação (fecha o editor)':'Voltar para '+nameOf(t);
  if(old&&old.parentNode===v&&v.firstChild===old){var b0=old.querySelector('button');if(b0.getAttribute('aria-label')!==lbl)b0.setAttribute('aria-label',lbl);return}
  if(old)old.remove();var d=D.createElement('div');d.id='e99-backbar';d.className='e99-backbar';
  d.innerHTML='<button type="button" class="e99-back" aria-label="'+lbl.replace(/"/g,'&quot;')+'" onclick="e99Back()"><span aria-hidden="true" class="e99-back-ic">‹</span><span>Voltar</span></button>';
  v.insertBefore(d,v.firstChild)}
var r0=render;render=function(){var r=r0.apply(this,arguments);try{bar()}catch(e){}return r};
W.e99Nav={stack:function(){return S.slice()},back:W.e99Back,armed:armed,resting:function(){return rest},target:target,bar:bar};
try{if(logged()){bar();arm()}}catch(e){}
})();
