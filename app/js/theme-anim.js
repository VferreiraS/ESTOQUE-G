
(function(){
'use strict';
var ENTRY={subir:[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],zoom:[{opacity:0,transform:'scale(.92)'},{opacity:1,transform:'none'}],girar:[{opacity:0,transform:'perspective(700px) rotateX(14deg) translateY(10px)'},{opacity:1,transform:'none'}],lado:[{opacity:0,transform:'translateX(-22px)'},{opacity:1,transform:'none'}],desfoque:[{opacity:0,filter:'blur(8px)'},{opacity:1,filter:'none'}]};
var NAMES={subir:'subindo',zoom:'zoom suave',girar:'virando em 3D',lado:'deslizando de lado',desfoque:'saindo do desfoque'};
function K(){return 'lojasg.estoque99.anim-theme:'+authSession.storeKey}
function seedTheme(login){var h=0;for(var i=0;i<login.length;i++)h=(h*31+login.charCodeAt(i))>>>0;var keys=Object.keys(ENTRY);function r(n){h=(h*1103515245+12345)>>>0;return h%n}
  return {entrada:keys[r(keys.length)],brilho:5+r(5),pulso:2+r(3)+(r(2)?.5:0),matiz:r(51)-25,saturacao:1+r(4)/10,anel:2.4+r(15)/10,ms:320+r(5)*40,por:'combinação da conta'}}
function clean(t){var o={};o.entrada=ENTRY[t.entrada]?t.entrada:'subir';o.brilho=Math.min(12,Math.max(4,+t.brilho||7));o.pulso=Math.min(5,Math.max(1.5,+t.pulso||3));o.matiz=Math.min(40,Math.max(-40,+t.matiz||0));o.saturacao=Math.min(1.6,Math.max(.7,+t.saturacao||1));o.anel=Math.min(5,Math.max(1.8,+t.anel||3.2));o.ms=Math.min(700,Math.max(240,+t.ms||380));o.por=String(t.por||'agente').slice(0,40);return o}
function apply(t){var b=document.body.style;b.setProperty('--fx-shine',t.brilho+'s');b.setProperty('--fx-pulse',t.pulso+'s');b.setProperty('--fx-hue',t.matiz+'deg');b.setProperty('--fx-sat',String(t.saturacao));b.setProperty('--fx-ring',t.anel+'s');window.e99EntryKF=ENTRY[t.entrada];window.e99EntryMs=t.ms;window.e99EntryGap=Math.round(t.ms/9)}
function get(){if(!authSession)return null;var t=null;try{t=JSON.parse(localStorage.getItem(K())||'null')}catch(x){}return t?clean(t):null}
function put(t){try{localStorage.setItem(K(),JSON.stringify(t))}catch(x){}}
async function ensure(force){if(!authSession)return;var t=get();if(!t||force){var base=seedTheme(authLoginName(authSession.record.login)+(force?Date.now():''));t=base;
    put(t)}apply(t);return t}
window.e99AnimTheme=function(){return get()};window.e99AnimNew=async function(){var t=await ensure(true);notify('Animação nova para esta conta: entrada '+NAMES[t.entrada]+' ('+t.por+').');render()};
var en=authEnter;authEnter=function(){var r=en.apply(this,arguments);setTimeout(function(){ensure(false)},0);return r};
if(typeof authSession!=='undefined'&&authSession)ensure(false);
var lo=authLogout;authLogout=async function(){var r=await lo.apply(this,arguments);if(!authSession){['--fx-shine','--fx-pulse','--fx-hue','--fx-sat','--fx-ring'].forEach(function(p){document.body.style.removeProperty(p)});window.e99EntryKF=null}return r};
})();
