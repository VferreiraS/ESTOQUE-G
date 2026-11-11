
(function(){
'use strict';
/* v101 (B): papel "gestor" só vale para a conta do dono. Contas antigas ganharam role 'gestor' sem ser o dono
   (semente "Estoque 99" do PC, "conta perdida vira gestor" da v59 até a v88, ou 'gestor' antigo vindo de usuarios/{uid}).
   Com isso a conta do PC abria Administração (bloquear/apagar contas, redefinir senha) e o envio diário.
   Gestor de verdade = login do dono (vferreiras/vferrreiras) ou uid desta conta marcado com 'S' em verificados.
   Qualquer outro 'gestor' vira 'estoque' ao entrar (o papel antigo fica anotado em role-was:<conta>). */
var OWNER=['vferreiras','vferrreiras'],VUID='TConyCsDQfPWBZ2MuGhVQTy7Mmz1';
function lg(x){try{return authLoginName(String(x||''))}catch(e){return String(x||'').trim().toLowerCase()}}
function verS(uid){if(!uid)return false;if(uid===VUID)return true;try{var v=JSON.parse(localStorage.getItem('lojasg.estoque99.verificados')||'{}');return !!(v&&v[uid]==='s')}catch(e){return false}}
function legit(session){if(!session||!session.record)return false;if(OWNER.indexOf(lg(session.record.login))>=0)return true;var uid='';try{uid=localStorage.getItem('lojasg.estoque99.my-uid:'+session.storeKey)||''}catch(e){}return verS(uid)}
window.e99GestorOk=function(){return !!(authSession&&authSession.payload&&authSession.payload.role==='gestor')};
var enter0=authEnter;authEnter=function(session){try{if(session&&session.payload&&session.payload.role==='gestor'&&!legit(session)){session.payload.role='estoque';try{localStorage.setItem('lojasg.estoque99.role-was:'+session.storeKey,'gestor')}catch(e){}}}catch(e){}return enter0.apply(this,arguments)};
/* nenhuma tela de gestor no menu de quem não é gestor (também depois de trocar de conta na mesma aba) */
var go0=go;go=function(p){if(p==='admin'&&!window.e99GestorOk()){try{delete labels.admin;delete icons.admin}catch(e){}}return go0.apply(this,arguments)};
/* v101 (A): a aba Equipe mostra também quem entrou na equipe com conta (perfil da equipe, convite aceito, mesma equipe da nuvem) */
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function nt(v){return typeof normalText==='function'?normalText(v):String(v||'').toLowerCase().trim()}
function accounts(){var out=[],seenL={},seenN={},list=[];try{list=window.e99ProfilesAll?window.e99ProfilesAll():[]}catch(x){}
  var my=authSession?lg(authSession.record.login):'';
  (state.team||[]).forEach(function(t){if(t.login)seenL[lg(t.login)]=1;seenN[nt(t.name)]=1});
  function add(o){var l=o.login?lg(o.login):'';if(l&&seenL[l])return;if(seenN[nt(o.name)])return;if(o.names&&o.names.some(function(n){return seenN[nt(n)]}))return;if(l)seenL[l]=1;seenN[nt(o.name)]=1;out.push(o)}
  list.forEach(function(r){if(!r||!r.p||!r.p.name)return;add({key:r.key,name:r.p.name,user:r.p.user,cargo:r.p.cargo,names:r.p.names||[],login:r.me?my:(r.login||''),role:r.role,me:!!r.me})});
  if(window.e99SyncInfo&&window.e99SyncInfo()){var m={};try{m=window.syncMembers?window.syncMembers():{}}catch(x){}Object.keys(m).forEach(function(k){var x=m[k];if(!x||!x.name||x.name==='?')return;if(x.login&&lg(x.login)===my)return;add({key:'n:'+x.name,name:x.name,user:'',cargo:'',login:x.login||'',role:x.role})})}
  if(authSession&&!out.some(function(o){return o.me})&&!seenL[my]){var nm='';try{var t=window.e99Team&&window.e99Team.get();nm=t&&t.name||''}catch(x){}add({key:'me',name:nm||authSession.record.login,user:'',cargo:'',login:my,role:authSession.payload.role,me:true})}
  return out}
function roleTxt(o){return o.cargo||(o.role==='auxiliar'?'Auxiliar':o.me&&authSession.payload.role==='gestor'?'Gestor':'Conta no app')}
function teamCards(){if(page!=='team'||!authSession||(window.isAux&&isAux()))return;var box=document.querySelector('#view .cards');if(!box||box.querySelector('.e99-acc'))return;var list=accounts();if(!list.length)return;
  var todos=Array.from(box.children).find(function(c){var h=c.querySelector('h3');return h&&h.textContent==='TODOS'});
  list.forEach(function(o){var tasks=[];try{tasks=planActsFor(o.name)}catch(x){}var done=tasks.filter(function(t){return t.done}).length,todo=tasks.length-done;
    var d=document.createElement('div');d.className='card e99-acc';
    d.innerHTML='<div class="cardtop"><div class="avatar">'+e(String(o.name).slice(0,1).toUpperCase())+'</div></div><h3>'+e(o.name)+(o.me?' <span class="small">(você)</span>':'')+'</h3><div class="small">'+(o.user?'@'+e(o.user)+' · ':'')+e(roleTxt(o))+'</div><p>'+todo+' '+(todo===1?'atividade':'atividades')+' a fazer · '+done+' '+(done===1?'feita':'feitas')+' (últimos 30 dias)</p><div class="progress"><i style="width:'+(tasks.length?done/tasks.length*100:0)+'%"></i></div>';
    if(todos)box.insertBefore(d,todos);else box.appendChild(d)})}
window.e99TeamAccounts=accounts;
var r0=render;render=function(){var r=r0.apply(this,arguments);try{if(authSession&&!window.e99GestorOk()&&labels.admin){delete labels.admin;delete icons.admin}teamCards()}catch(x){}return r};
})();
