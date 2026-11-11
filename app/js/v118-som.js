
(function(){
'use strict';
/* v118 (pedido do dono): o som de login toca toda vez que o app abre.
   - Ao abrir (ou voltar ao app depois de 1 min em segundo plano) tenta tocar na hora; o PC/Android costumam deixar.
   - O iPhone (Safari) não deixa áudio sem um toque na tela: aí o som fica guardado e toca no primeiro toque da pessoa.
   - Uma vez por abertura (o login logo depois não repete). Sem som se o som do app estiver desligado. */
var played=false,pending=false,hiddenAt=0,W=window;
W.__e99LoginSounds=0;
var base=playSiteSound;
function really(){try{base('login');W.__e99LoginSounds++;W.__e99LoginSoundAt=Date.now();played=true;pending=false}catch(x){}}
function attempt(fromGesture){if(played||typeof siteSoundEnabled!=='undefined'&&!siteSoundEnabled||document.hidden)return;
  var ctx=null;try{ctx=unlockSiteAudio()}catch(x){}if(!ctx){pending=true;return}
  if(ctx.state==='running'){really();return}
  pending=true;var t=Date.now();try{ctx.resume().catch(function(){})}catch(x){}
  (function wait(){if(played)return;if(ctx.state==='running'){really();return}if(Date.now()-t<(fromGesture?2500:1500))setTimeout(wait,80)})()}
/* o login (authEnter) chama playSiteSound('login'): vale a mesma regra de uma vez por abertura */
playSiteSound=function(kind){if(kind==='login'){attempt(!!(navigator.userActivation&&navigator.userActivation.isActive));return}return base.apply(this,arguments)};
function onGesture(){if(pending&&!played)attempt(true)}
['pointerdown','touchend','click','keydown'].forEach(function(ev){document.addEventListener(ev,onGesture,{passive:true,capture:true})});
document.addEventListener('visibilitychange',function(){if(document.hidden){hiddenAt=Date.now();return}if(hiddenAt&&Date.now()-hiddenAt>60000){played=false;pending=false;attempt(false)}});
W.e99LoginSound={played:function(){return played},pending:function(){return pending},count:function(){return W.__e99LoginSounds}};
/* v121: espera a barra de carregamento (app carregado e áudio preparado) antes de tentar; sem a barra, tenta em 7 s */
var kicked=false;function kick(){if(kicked)return;kicked=true;attempt(false)}
if(W.__e99Boot)setTimeout(kick,0);else{W.addEventListener('e99:boot',kick);setTimeout(kick,7000)}
})();
