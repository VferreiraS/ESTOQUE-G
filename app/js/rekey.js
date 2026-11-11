
(function(){
'use strict';
/* Trocar ou recuperar a senha muda a chave da conta. A configuração do chat/equipe e a da planilha são cifradas com ela,
   então são lidas com a chave antiga e gravadas de novo com a nova — senão a conta saía da equipe. */
var lastOpen=null;
var openBefore=authOpenWithBits;authOpenWithBits=async function(record,bits){var r=await openBefore.apply(this,arguments);try{lastOpen={login:record.login,key:await authKeyFromBits(bits)}}catch(e){}return r};
async function readBlob(k,aad,key){var raw=localStorage.getItem(k);if(!raw||!key)return null;try{var o=JSON.parse(raw);var p=await crypto.subtle.decrypt({name:'AES-GCM',iv:authUn64(o.iv),additionalData:authBytes(aad)},key,authUn64(o.cipher));return JSON.parse(new TextDecoder().decode(p))}catch(e){return null}}
async function writeBlob(k,aad,key,val,extra){var iv=crypto.getRandomValues(new Uint8Array(12));var ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:authBytes(aad)},key,authBytes(JSON.stringify(val))));localStorage.setItem(k,JSON.stringify(Object.assign({},extra||{},{iv:authB64(iv),cipher:authB64(ct)})))}
async function grab(storeKey,login,key){var n=authLoginName(login);return {chat:await readBlob('lojasg.estoque99.chat:'+storeKey,'chat|'+n,key),sheets:await readBlob('lojasg.estoque99.sheets:'+storeKey,'sheets|'+n,key)}}
async function put(saved,storeKey,login,key){var n=authLoginName(login);try{if(saved.sheets)await writeBlob('lojasg.estoque99.sheets:'+storeKey,'sheets|'+n,key,saved.sheets)}catch(e){}
  try{if(saved.chat){if(window.e99ChatReload&&authSession&&authSession.key===key)await window.e99ChatReload(saved.chat);else await writeBlob('lojasg.estoque99.chat:'+storeKey,'chat|'+n,key,saved.chat)}}catch(e){}}
var resetBefore=authResetWithBits;authResetWithBits=async function(record,raw,storeKey){var old=lastOpen&&lastOpen.login===record.login?lastOpen.key:null,saved=old?await grab(storeKey,record.login,old):{};
  var r=await resetBefore.apply(this,arguments);if(authSession&&authSession.storeKey===storeKey)await put(saved,storeKey,record.login,authSession.key);return r};
var changeBefore=authChangePassword;authChangePassword=async function(ev){if(ev&&ev.preventDefault)ev.preventDefault();var ses=authSession,old=ses&&ses.key,saved=ses?await grab(ses.storeKey,ses.record.login,old):{};
  var r=await changeBefore.apply(this,arguments);if(ses&&authSession===ses&&ses.key!==old)await put(saved,ses.storeKey,ses.record.login,ses.key);return r};
})();
