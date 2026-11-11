
(function(){
'use strict';
/* v122 (pedido do dono: "Remova tudo, menos o chat"): saíram os efeitos pesados (S de partículas, grade Tron, rastros, holograma,
   "Pausar animação", preferência Efeitos), a música ambiente, o aviso "ilha", o relógio do Início, os selos e perfis estilo rede social,
   o gráfico do Início, a aba "O que mudou?" e o Authenticator. Apaga do aparelho o que sobrou dessas funções (o resto fica intacto)
   e grava a conta uma vez para tirar a cópia cifrada antiga (histórico "news"). */
var PRE=['lojasg.estoque99.visual-effects','lojasg.estoque99.fx-pause','lojasg.estoque99.music','lojasg.estoque99.nv-seen','lojasg.estoque99.verificados-login',
  'lojasg.estoque99.profile-pub','lojasg.estoque99.profile-relay','lojasg.estoque99.profile-seen','lojasg.estoque99.aux-profile','lojasg.estoque99.store-renamed','lojasg.estoque99.totp'];
function clean(){var n=0;try{var ks=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&PRE.some(function(p){return k.indexOf(p)===0}))ks.push(k)}ks.forEach(function(k){localStorage.removeItem(k);n++})}catch(x){}
  try{if(window.indexedDB)indexedDB.deleteDatabase('estoque99-profiles')}catch(x){}return n}
window.e99V122Clean=clean;clean();
var en=authEnter;authEnter=function(){var r=en.apply(this,arguments);clean();var s=authSession;
  setTimeout(function(){try{if(!s||authSession!==s)return;var f='lojasg.estoque99.v122-clean:'+s.storeKey;if(localStorage.getItem(f))return;
    Promise.resolve(authPersist(JSON.stringify(state))).then(function(){try{localStorage.setItem(f,'1')}catch(x){}}).catch(function(){})}catch(x){}},2600);return r};
})();
