
(function(){
'use strict';
/* v120 (pedido do dono): limite de requisição no aparelho.
   - Entrar: no máximo 5 tentativas por minuto por login (vale ao recarregar); depois "Muitas tentativas, aguarde X s".
   - Envios para o ntfy (equipe, chat, avisos): no máximo 60 por minuto por conta; o excedente volta como 429 e o app tenta de novo depois
     (a sincronização guarda o pendente; o chat mostra "Não enviada" com Tentar de novo). Mesma ideia do e99CloudTry da nuvem. */
var K='lojasg.estoque99.login-tries',LOGIN_MAX=5,NET_MAX=60,WIN=60000,net=[];
function ls(v){try{if(v===undefined)return JSON.parse(localStorage.getItem(K)||'{}')||{};localStorage.setItem(K,JSON.stringify(v))}catch(x){return {}}}
function h(l){return window.e99MailIdx?window.e99MailIdx.hash('login|'+authLoginName(l)):authLoginName(l)}
function recent(a,now){return (Array.isArray(a)?a:[]).filter(function(t){return now-t<WIN&&t<=now})}
window.e99LoginWait=function(login){var now=Date.now(),a=recent(ls()[h(login)],now);return a.length>=LOGIN_MAX?Math.ceil((WIN-(now-a[0]))/1000):0};
var sb=authSubmit;authSubmit=async function(event){try{if(authMode==='login'&&!authPending&&event&&event.target&&event.target.id==='auth-form'){var lg=String(readForm(event.target).login||'').trim();
  if(lg){var w=window.e99LoginWait(lg);if(w){event.preventDefault();authError='Muitas tentativas, aguarde '+w+' s.';renderAuth();return}
   var o=ls(),now=Date.now(),k=h(lg);o[k]=recent(o[k],now).concat(now);Object.keys(o).forEach(function(x){o[x]=recent(o[x],now);if(!o[x].length)delete o[x]});ls(o)}}}catch(x){}
  return sb.apply(this,arguments)};
/* depois de entrar com sucesso, as tentativas daquele login zeram */
var en=authEnter;authEnter=function(s){var r=en.apply(this,arguments);try{var o=ls();delete o[h(s.record.login)];ls(o)}catch(x){}return r};
function ntfyUrl(u){try{var n=window.e99Team&&window.e99Team.ntfy?window.e99Team.ntfy():'https://ntfy.sh';return String(u).indexOf(n)===0||/^https:\/\/ntfy\.sh\//.test(String(u))}catch(x){return false}}
var f0=window.fetch;window.fetch=function(u,o){try{var m=o&&o.method?String(o.method).toUpperCase():'GET';if((m==='POST'||m==='PUT')&&ntfyUrl(typeof u==='string'?u:u&&u.url)){var now=Date.now();net=net.filter(function(t){return now-t<WIN});
   if(net.length>=NET_MAX){var w=Math.ceil((WIN-(now-net[0]))/1000);return Promise.resolve(new Response('Muitas requisições, aguarde '+w+' s',{status:429,headers:{'Retry-After':String(w)}}))}net.push(now)}}catch(x){}
  return f0.apply(this,arguments)};
window.e99NetLimit=function(){var now=Date.now();net=net.filter(function(t){return now-t<WIN});return {used:net.length,max:NET_MAX}};
})();
