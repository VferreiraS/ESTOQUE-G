
(function(){
'use strict';
/* Manter conectado neste aparelho: guarda a chave da conta (não exportável) no IndexedDB do navegador. */
var DB='estoque99-local',STORE='remember',PREF='lojasg.estoque99.remember-pref';
var remembered=null,wanted=null,autoEntering=false;
function idb(){return new Promise(function(res,rej){try{var r=indexedDB.open(DB,1);r.onupgradeneeded=function(){r.result.createObjectStore(STORE)};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}}catch(e){rej(e)}})}
function op(mode,fn){return idb().then(function(db){return new Promise(function(res,rej){var tx=db.transaction(STORE,mode),st=tx.objectStore(STORE),req=fn(st);tx.oncomplete=function(){db.close();res(req&&req.result)};tx.onerror=function(){db.close();rej(tx.error)}})})}
function load(){return op('readonly',function(st){return st.get('session')}).catch(function(){return null})}
function takeHandoff(){return op('readonly',function(st){return st.get('handoff')}).catch(function(){return null}).then(function(h){if(!h)return null;return op('readwrite',function(st){return st.delete('handoff')}).catch(function(){}).then(function(){return h&&h.key&&h.storeKey&&Date.now()-Number(h.at||0)<120000?h:null})})}
/* Página do robô (robo.html): leva a conta aberta para lá sem pedir senha de novo. */
window.beforeSiteReload=function(){if(!authSession)return Promise.resolve();return op('readwrite',function(st){return st.put({storeKey:authSession.storeKey,key:authSession.key,at:Date.now()},'handoff')}).catch(function(){})};
function save(session){if(!session||!session.key||!session.storeKey)return Promise.resolve();var v={storeKey:session.storeKey,key:session.key,at:Date.now()};return op('readwrite',function(st){return st.put(v,'session')}).then(function(){remembered={storeKey:v.storeKey}}).catch(function(){})}
function forget(){remembered=null;return op('readwrite',function(st){return st.delete('session')}).catch(function(){})}
function prefDefault(){try{var p=localStorage.getItem(PREF);if(p==='on')return true;if(p==='off')return false}catch(e){}return !(typeof isPhoneLayout==='function'&&isPhoneLayout())}
function setPref(on){try{localStorage.setItem(PREF,on?'on':'off')}catch(e){}}
async function openWithKey(record,key){var value=await crypto.subtle.decrypt({name:'AES-GCM',iv:authUn64(record.iv),additionalData:authBytes(authLoginName(record.login))},key,authUn64(record.cipher));var payload=JSON.parse(new TextDecoder().decode(value));if(payload.seed)throw Error('seed');payload.state=validate(payload.state);payload.ai=aiNormalize(payload.ai);payload.learn=learnNormalize(payload.learn);if(typeof payload.store!=='string'||!['gestor','estoque','auxiliar'].includes(payload.role))throw Error('Conta inválida.');return payload}
window.rememberIsOn=function(){return !!(remembered&&authSession&&remembered.storeKey===authSession.storeKey)};
window.rememberRefresh=function(session){if(remembered&&session&&remembered.storeKey===session.storeKey)save(session)};
window.rememberToggle=async function(on){if(!authSession)return;if(on){await save(authSession);setPref(true);notify('Este aparelho vai abrir a conta sem pedir senha.')}else{await forget();setPref(false);notify('Este aparelho volta a pedir senha ao abrir.')}if(typeof render==='function')render()};
window.rememberPanelHTML=function(){var on=window.rememberIsOn();return '<div class="panel help" id="remember-panel"><h2>Manter conectado</h2><p>'+(on?'Ativado neste aparelho: o site abre a conta sem pedir senha.':'Desativado: o site pede senha ao abrir.')+'</p><button type="button" class="'+(on?'':'primary')+'" onclick="rememberToggle('+(!on)+')">'+(on?'Desativar neste aparelho':'Manter conectado neste aparelho')+'</button></div>'};
/* Caixa na tela de login e de criar conta. */
var renderBefore=renderAuth;
function injectRemember(){var form=document.getElementById('auth-form');if(!form||authPending||authMode==='recover'||authRecoveryShow||form.querySelector('input[name=remember]'))return;var submit=form.querySelector('button[type=submit]');if(!submit)return;if(wanted===null)wanted=prefDefault();var label=document.createElement('label');label.className='remember-check';label.innerHTML='<input type="checkbox" name="remember"'+(wanted?' checked':'')+'> Manter conectado neste aparelho';submit.parentNode.insertBefore(label,submit);label.querySelector('input').addEventListener('change',function(e){wanted=e.target.checked;setPref(wanted)})}
renderAuth=function(){renderBefore.apply(this,arguments);injectRemember()};
if(!authSession)injectRemember();
var enterBefore=authEnter;
authEnter=function(session){var r=enterBefore.apply(this,arguments);if(!autoEntering&&authSession===session){if(wanted===true)save(session);else if(wanted===false&&remembered&&remembered.storeKey===session.storeKey)forget();else window.rememberRefresh(session)}wanted=null;return r};
var logoutBefore=authLogout;
authLogout=async function(){var r=await logoutBefore.apply(this,arguments);if(!authSession)await forget();return r};
/* Robô removido a pedido do usuário. */if(typeof labels==='object'){delete labels.robot;if(typeof icons==='object')delete icons.robot}
var goBefore=go;go=function(p){if(p==='robot'||p==='assistant')p='home';return goBefore.call(this,p)};
var accountBefore=renderAccount;
renderAccount=function(){return accountBefore.apply(this,arguments)+'<div class="grid2">'+window.rememberPanelHTML()+'</div>'};
/* Ao abrir: entra sozinho se este aparelho foi marcado. */
Promise.all([takeHandoff(),load()]).then(async function(r){var h=r[0],saved=r[1];if(saved&&saved.key&&saved.storeKey)remembered={storeKey:saved.storeKey};var v=h||(saved&&saved.key&&saved.storeKey?saved:null);if(!v)return;if(authSession)return;try{var raw=localStorage.getItem(v.storeKey);if(!raw||authIsBlocked(v.storeKey))throw Error('gone');var record=authCheckRecord(JSON.parse(raw));var payload=await openWithKey(record,v.key);if(authSession)return;autoEntering=true;try{authEnter({key:v.key,record:record,storeKey:v.storeKey,payload:payload})}finally{autoEntering=false}}catch(e){if(!h)await forget()}});
})();
