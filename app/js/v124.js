
(function(){
'use strict';
/* v124 (pedido do dono: "a senha está certa, mas diz que está errada"). Nada aqui grava a conta; só ajuda a achar a cópia certa.
   - A mensagem diz qual conta deste aparelho foi testada (a senha vale por aparelho) + dica.
   - Mesma senha com espaço nas pontas ou com acentos digitados de outro jeito (Unicode NFC/NFD) também abre.
   - E-mail usado em mais de uma conta deste aparelho: testa cada uma; se a senha abrir só uma, entra nela; se abrir mais de uma, pede o login. */
var D=document,W=window,MK='lojasg.estoque99.mail-multi';
function isPwErr(e){var m=String(e&&e.message||'');return /Senha incorreta/.test(m)||!!(e&&e.name==='OperationError')}
function variants(pw){var out=[],add=function(v){if(typeof v==='string'&&v&&v!==pw&&out.indexOf(v)<0)out.push(v)};
  try{var t=pw.trim();add(t);add(pw.normalize('NFC'));add(pw.normalize('NFD'));add(t.normalize('NFC'));add(t.normalize('NFD'))}catch(x){}return out}
W.e99PwVariants=variants;
/* tenta as formas da mesma senha só quando a original falha (senha comum não custa nada a mais) */
var dB=authDecrypt;authDecrypt=async function(rec,pw){try{return await dB.apply(this,arguments)}catch(e){if(typeof pw!=='string'||!isPwErr(e))throw e;var vs=variants(pw);
  for(var i=0;i<vs.length;i++){try{var r=await dB.call(this,rec,vs[i]);W.__e99PwVariant=i+1;return r}catch(x){if(!isPwErr(x))throw x}}throw e}};
/* ---------- e-mail → várias contas ---------- */
function rd(){try{return JSON.parse(localStorage.getItem(MK)||'{}')||{}}catch(x){return {}}}
function wr(o){try{localStorage.setItem(MK,JSON.stringify(o))}catch(x){}}
function hk(m){return W.e99MailIdx&&W.e99MailIdx.hash?W.e99MailIdx.hash(String(m||'').trim().toLowerCase()):''}
function addMulti(m,login){var k=hk(m);if(!k||!login)return;login=authLoginName(login);var o=rd(),a=Array.isArray(o[k])?o[k]:[];a=a.filter(function(x){return x!==login});a.unshift(login);o[k]=a.slice(0,8);wr(o)}
if(W.e99MailIdx&&typeof W.e99MailIdx.set==='function'){var s0=W.e99MailIdx.set;W.e99MailIdx.set=function(m,login){var r=s0.apply(this,arguments);try{addMulti(m,login)}catch(x){}return r};
  W.e99MailIdx.all=function(m){var k=hk(m),o=rd(),a=Array.isArray(o[k])?o[k].slice():[];var one='';try{one=W.e99MailIdx.get(m)}catch(x){}if(one&&a.indexOf(authLoginName(one))<0)a.push(authLoginName(one));return a}}
/* semente: e-mails da nuvem já guardados neste aparelho (cloud-email:<conta>) */
(function seed(){try{var P='lojasg.estoque99.cloud-email:',ks=[];for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf(P)===0)ks.push(k)}
  ks.forEach(function(k){var em=localStorage.getItem(k),raw=localStorage.getItem(k.slice(P.length));if(!em||!raw||em.indexOf('@')<0)return;try{var r=JSON.parse(raw);if(r&&typeof r.login==='string')addMulti(em,r.login)}catch(x){}})}catch(x){}})();
async function exists(l){try{return !!localStorage.getItem(await authStorageKey(l))}catch(x){return false}}
async function opens(record,pw){var list=[pw].concat(variants(pw));for(var i=0;i<list.length;i++){try{var bits=await authKeyBits(list[i],record.salt),key=await authKeyFromBits(bits);await crypto.subtle.decrypt({name:'AES-GCM',iv:authUn64(record.iv),additionalData:authBytes(authLoginName(record.login))},key,authUn64(record.cipher));return true}catch(x){}}return false}
var sb=authSubmit;authSubmit=async function(event){var f=event&&event.target,typed='',pw='';
  try{if(authMode==='login'&&!authPending&&!authBusy&&f&&f.id==='auth-form'){var li=f.querySelector('input[name=login]'),pi=f.querySelector('input[name=password]');typed=li?String(li.value||'').trim():'';pw=pi?String(pi.value||''):''}}catch(x){}
  if(!typed||typed.indexOf('@')<0||!pw||!W.e99MailIdx||!W.e99MailIdx.all||(W.e99LoginWait&&W.e99LoginWait(typed)))return sb.apply(this,arguments);
  var cand=[];try{var all=W.e99MailIdx.all(typed);for(var i=0;i<all.length;i++){if(await exists(all[i])&&cand.indexOf(all[i])<0)cand.push(all[i])}}catch(x){}
  if(cand.length<2)return sb.apply(this,arguments);
  try{event.preventDefault()}catch(x){}
  var btn=f.querySelector('button[type=submit]');if(btn){btn.disabled=true;btn.textContent='Aguarde…'}
  var good=[];for(var j=0;j<cand.length;j++){try{var raw=localStorage.getItem(await authStorageKey(cand[j]));if(raw&&await opens(JSON.parse(raw),pw))good.push(cand[j])}catch(x){}}
  if(good.length===1){var li2=f.querySelector('input[name=login]');if(li2)li2.value=good[0];if(btn){btn.disabled=false}return sb.call(this,event)}
  authLoginDraft=typed;authError=good.length?'Este e-mail está em mais de uma conta deste aparelho ('+good.map(function(x){return '@'+x}).join(', ')+'). Digite o login no lugar do e-mail.':'Senha incorreta para as contas deste e-mail neste aparelho ('+cand.map(function(x){return '@'+x}).join(', ')+').';
  if(!good.length&&++authAttempts>=5){authWait=Date.now()+30000;authAttempts=0}
  renderAuth()};
/* ---------- tela de entrar: dica e "Mostrar senha" ---------- */
function deco(){var box=D.getElementById('auth-screen');if(!box||box.hidden)return;
  var er=box.querySelector('.auth-error');if(er&&/^Senha incorreta/.test(authError||'')&&!box.querySelector('.e99-pw-hint')){var h=D.createElement('p');h.className='small e99-pw-hint';h.textContent='A senha vale para a cópia da conta guardada neste aparelho. Se você trocou a senha em outro aparelho (ou no app da tela inicial), aqui ainda vale a senha antiga. Confira o login na mensagem e toque em "Mostrar" para ver o que foi digitado.';er.after(h)}
}
var ra=renderAuth;renderAuth=function(){var r=ra.apply(this,arguments);try{deco()}catch(x){}return r};
try{deco()}catch(x){}
})();
