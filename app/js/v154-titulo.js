/* v154: no computador, a aba pisca (título alterna) quando chega mensagem nova no chat com o Stok em segundo plano.
   Só mensagens (chat da equipe e conversas privadas/grupos); alertas, prazos e NFs não piscam.
   Para ao voltar o foco. Celular não pisca. Com "menos movimento" do aparelho o título não alterna: fica fixo com o aviso.
   Junto do título o ícone da aba alterna para o mesmo ícone com uma bolinha vermelha (#FF2A1F), desenhada por canvas na hora (sem arquivo, sem rede).
   Sem som e sem notificação do sistema; no título só o número. Timer só enquanto há aviso pendente. */
(function(){
'use strict';
var base='',n=0,timer=0,on=false,flip=false,icoLink=null,icoBase='',icoRed='';
function link(){return document.querySelector('link[rel~="icon"]')}
function mkRed(){if(icoRed)return;var l=link();var href=l?l.href:'';
  function draw(img){try{var c=document.createElement('canvas');c.width=c.height=32;var g=c.getContext('2d');if(img)g.drawImage(img,0,0,32,32);
    g.beginPath();g.arc(23,9,8.5,0,Math.PI*2);g.fillStyle='#FF2A1F';g.fill();g.lineWidth=2;g.strokeStyle='#000';g.stroke();icoRed=c.toDataURL('image/png');if(on&&flip)setIco(true)}catch(e){}}
  if(!href){draw(null);return}var im=new Image();im.onload=function(){draw(im)};im.onerror=function(){draw(null)};im.src=href}
function setIco(red){var l=link();if(!l)return;if(red){if(!icoRed)return;if(!icoLink){icoLink=l;icoBase=l.getAttribute('href')||''}l.setAttribute('href',icoRed)}else if(icoLink){icoLink.setAttribute('href',icoBase)}}
function desktop(){try{return window.matchMedia('(pointer:fine)').matches&&window.innerWidth>900}catch(e){return false}}
function calm(){try{return window.matchMedia('(prefers-reduced-motion: reduce)').matches}catch(e){return false}}
function away(){try{return document.hidden||!document.hasFocus()}catch(e){return !!document.hidden}}
function msg(){return '('+(n>99?'99+':n)+') '+(n>1?'Novas mensagens':'Nova mensagem')+' · Stok'}
function tick(){flip=!flip;document.title=flip?msg():base;setIco(flip)}
function stop(){if(!on)return;clearInterval(timer);timer=0;on=false;flip=false;n=0;document.title=base;setIco(false);icoLink=null}
window.e99TitleAlert=function(k){
  k=Math.max(1,Math.floor(Number(k)||1));
  if(!desktop()||!away())return false;
  if(!on){base=document.title;on=true;n=0;mkRed()}
  n+=k;
  if(calm()){clearInterval(timer);timer=0;flip=true;document.title=msg();setIco(true);return true}
  if(!timer){flip=false;tick();timer=setInterval(tick,1000)}
  return true};
window.e99TitleStop=stop;
window.e99TitleState=function(){var l=link();return {on:on,n:n,timer:!!timer,base:base,icon:l?l.getAttribute('href'):'',red:!!icoRed&&!!l&&l.getAttribute('href')===icoRed}};
document.addEventListener('visibilitychange',function(){if(!document.hidden)stop()});
window.addEventListener('focus',stop);
/* prepara o ícone vermelho cedo (só no computador) para o 1º piscar já trocar o ícone */
setTimeout(function(){if(desktop())mkRed()},1500);
})();
