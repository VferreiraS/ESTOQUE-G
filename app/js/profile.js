
(function(){
'use strict';
/* v122 (pedido do dono): perfis estilo rede social, capa, foto e selos saíram. Fica só o que o papel de gestor usa:
   a lista "verificados/{uid}" (tipo 's' = gestor; só o administrador grava) e o uid da nuvem desta conta,
   guardados no aparelho (lojasg.estoque99.verificados e lojasg.estoque99.my-uid:<conta>) para v101/v102. */
var VUID='TConyCsDQfPWBZ2MuGhVQTy7Mmz1',VKEY='lojasg.estoque99.verificados',VER={};VER[VUID]='s';
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function initial(n){return e((String(n||'?').trim()[0]||'?').toUpperCase())}
window.profAvatar=function(name,cls){return '<span class="av '+(cls||'')+'" aria-hidden="true">'+initial(name)+'</span>'};
function clean(o){var r={};if(o&&typeof o==='object')Object.keys(o).forEach(function(k){if(/^[A-Za-z0-9]{10,128}$/.test(k)&&o[k]==='s')r[k]='s'});return r}
try{var vc=clean(JSON.parse(localStorage.getItem(VKEY)||'{}'));Object.keys(vc).forEach(function(k){VER[k]='s'})}catch(x){}
function apply(n){n[VUID]='s';VER=n;try{localStorage.setItem(VKEY,JSON.stringify(n))}catch(x){}}
function myUid(){var u=window.e99Cloud&&window.e99Cloud.user&&window.e99Cloud.user(),k=authSession?'lojasg.estoque99.my-uid:'+authSession.storeKey:'';if(u&&u.uid){if(k)try{if(localStorage.getItem(k)!==u.uid)localStorage.setItem(k,u.uid)}catch(x){}return u.uid}try{return k?localStorage.getItem(k)||'':''}catch(x){return ''}}
window.e99Ver=function(){return Object.assign({},VER)};
var unsub=null;async function live(){if(unsub||!window.e99Cloud)return;try{var c=await window.e99Cloud.load();if(!c.auth.currentUser||unsub)return;
  unsub=c.db.collection('verificados').onSnapshot(function(q){var n={};q.forEach(function(d){var x=d.data()||{};if(x.tipo==='s')n[d.id]='s'});apply(n)},function(){unsub=null})}catch(x){}}
var at=0,busy=false;async function fetchList(force){if(unsub||busy||(!force&&Date.now()-at<10*60000))return;busy=true;at=Date.now();
  try{var emu='';try{emu=localStorage.getItem('e99-fb-emu')||''}catch(x){}var base=emu?'http://'+emu.split('|')[1]:'https://firestore.googleapis.com';
    var r=await fetch(base+'/v1/projects/gen-lang-client-0167474823/databases/(default)/documents/verificados?pageSize=300',{cache:'no-store'});if(!r.ok)throw Error('http '+r.status);var j=await r.json(),n={};
    (j.documents||[]).forEach(function(doc){var id=String(doc.name||'').split('/').pop(),f=doc.fields||{};if(/^[A-Za-z0-9]{10,128}$/.test(id)&&f.tipo&&f.tipo.stringValue==='s')n[id]='s'});if(!unsub)apply(n)}catch(x){at=Date.now()-9*60000}finally{busy=false}}
window.e99VerFetch=function(){return fetchList(true)};
function tick(){if(typeof authSession==='undefined'||!authSession||document.hidden)return;myUid();fetchList(false);if(window.e99Cloud&&window.e99Cloud.user&&window.e99Cloud.user())live()}
setInterval(tick,20000);document.addEventListener('visibilitychange',tick);
var en=authEnter;authEnter=function(){var r=en.apply(this,arguments);setTimeout(tick,300);return r};
if(typeof authSession!=='undefined'&&authSession)setTimeout(tick,300);
})();
