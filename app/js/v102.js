
(function(){
'use strict';
/* v102 (pedido do dono): Agenda sai do menu e das rotas ("Agenda" leva ao Plano de ação).
   v121: a IA saiu do app; endereços antigos (agentes, assistant, consultas, robot) levam ao Início. */
var GONE={agentes:'home',assistant:'home',consultas:'home',robot:'home',agenda:'plans',novidades:'home'};/* v127: perfil voltou (rota profile) */
/* Administração do dono: a conta do dono criada em "Criar conta" ficava como 'estoque' e não via Administração.
   Se esta conta entrou na nuvem com o uid marcado com S em "verificados" (só o administrador grava), ela é gestor. */
var VUID='TConyCsDQfPWBZ2MuGhVQTy7Mmz1';
function myUidNow(){try{var u=window.e99Cloud&&e99Cloud.user&&e99Cloud.user();if(u&&u.uid)return u.uid;return localStorage.getItem('lojasg.estoque99.my-uid:'+authSession.storeKey)||''}catch(e){return ''}}
function verS(uid){if(!uid)return false;if(uid===VUID)return true;try{var v=JSON.parse(localStorage.getItem('lojasg.estoque99.verificados')||'{}');return !!(v&&v[uid]==='s')}catch(e){return false}}
function promote(){try{if(!authSession||!authSession.payload||authSession.payload.role!=='estoque')return false;if(!verS(myUidNow()))return false;authSession.payload.role='gestor';labels.admin='Administração';icons.admin='⚙';try{var al=document.getElementById('account-label');if(al)al.textContent=authSession.payload.store+' · Gestor'}catch(x){}try{save()}catch(x){}return true}catch(e){return false}}
setInterval(function(){if(!document.hidden&&promote())render()},15000);
function strip(){try{Object.keys(GONE).forEach(function(k){delete labels[k];delete icons[k]})}catch(e){}}
var go0=go;go=function(p){if(GONE[p])p=GONE[p];return go0.call(this,p)};
var r0=render;render=function(){if(GONE[page])page=GONE[page];strip();promote();var r=r0.apply(this,arguments);try{var v=document.getElementById('view');if(v)v.querySelectorAll('button[onclick="go(\'agenda\')"]').forEach(function(b){b.textContent='Abrir plano de ação →'})}catch(e){}return r};
var e0=authEnter;authEnter=function(){var r=e0.apply(this,arguments);strip();try{if(GONE[page]){page=GONE[page];render()}}catch(e){}return r};
strip();
})();
