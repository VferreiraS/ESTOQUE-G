
(function(){
/* print do dono no iPhone: título e "Novo plano" pela metade, resto vazio — a animação de entrada ficava presa no meio
   (redesenho da tela reiniciando a animação, ou o Safari pausando/atrasando a animação). Agora: anima só na troca de tela e,
   1 s depois, desliga a animação de vez nessa tela (opacidade 1 garantida). */
var last='',t=0,B=document.body;
function settle(){clearTimeout(t);t=setTimeout(function(){B.classList.add('e99-norise')},1000)}
var r0=render;render=function(){var p=typeof page!=='undefined'?page:'';if(p!==last){last=p;B.classList.remove('e99-norise');void B.offsetWidth}else B.classList.add('e99-norise');var r=r0.apply(this,arguments);settle();return r};
document.addEventListener('visibilitychange',function(){if(!document.hidden)B.classList.add('e99-norise')});
settle();window.e99NoRise=function(){return B.classList.contains('e99-norise')};
})();
