
(function(){
'use strict';
function reduced(){return typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches}
function userOff(){try{return false}catch(e){return false}}
/* Reinicia a animação de entrada (o computador costuma ficar com a aba aberta entre um login e outro). */
window.replayEntrySplash=function(){if(userOff())return;var el=document.querySelector('.entry-splash');if(!el||!el.parentNode)return;el.parentNode.replaceChild(el.cloneNode(true),el)};
if(typeof authLogout==='function'){var logoutBefore=authLogout;authLogout=async function(){var r=await logoutBefore.apply(this,arguments);if(!authSession)window.replayEntrySplash();return r}}
if(typeof authEnter==='function'){var enterBefore=authEnter;authEnter=function(session){var r=enterBefore.apply(this,arguments);if(reduced()&&!userOff()){var view=document.getElementById('view');if(view&&typeof view.animate==='function')view.animate([{opacity:0},{opacity:1}],{duration:320,easing:'ease-out'})}return r}}
})();
