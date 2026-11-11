
(function(){
'use strict';
/* Recuperar a conta pelo e-mail: um "cofre" na nuvem guarda a chave da conta (só o dono do e-mail lê).
   Esqueceu a senha e o código? O Firebase manda um link por e-mail; com ele você abre o cofre e escolhe uma senha nova. */
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(x){return null}}
async function derive(login,pw){return authCloudDerive(login,pw)}
var pw=null;function grab(login,p){pw={login:authLoginName(login),p:String(p),t:Date.now()}}
var dB=authDecrypt;authDecrypt=async function(rec,p){var r=await dB.apply(this,arguments);if(rec&&typeof p==='string')grab(rec.login,p);return r};
var cB=authCreate;authCreate=async function(login,store,p){var r=await cB.apply(this,arguments);grab(login,p);return r};
var rB=authResetWithBits;authResetWithBits=async function(record,raw,storeKey,payload,p){grab(record.login,p);return rB.apply(this,arguments)};
var chB=authChangePassword;authChangePassword=async function(ev){var v=readForm(ev.target),s=authSession,rev=s&&s.record.revision;var r=await chB.apply(this,arguments);if(s&&authSession===s&&s.record.revision!==rev&&v.password){grab(s.record.login,v.password);vault()}return r};
/* guarda o cofre quando a conta está ligada ao e-mail */
async function vault(){if(!authSession||!pw||Date.now()-pw.t>15*60000||pw.login!==authLoginName(authSession.record.login))return false;var c=window.e99Cloud;if(!c||!c.user())return false;
  try{var k=await c.load(),bits=await authKeyBits(pw.p,authSession.record.salt);await k.db.collection('cofre').doc(c.user().uid).set({login:authSession.record.login.slice(0,80),salt:authSession.record.salt,bits:authB64(bits),at:Date.now()});ls('lojasg.estoque99.vault:'+authSession.storeKey,authSession.record.salt);return true}catch(x){return false}}
var tries=0;function vaultSoon(){tries=0;var t=setInterval(function(){tries++;vault().then(function(ok){if(ok||tries>20)clearInterval(t)})},3000)}
var eB=authEnter;authEnter=function(){var r=eB.apply(this,arguments);vaultSoon();return r};

/* ---------- tela de recuperação ---------- */
function dlg(){var d=document.getElementById('mail-rec');if(!d){d=document.createElement('dialog');d.id='mail-rec';document.body.appendChild(d)}return d}
var step=1,busy=false,err='',email='';
function paint(){var d=dlg();d.innerHTML='<form class="mr" onsubmit="mrGo(event)"><h2>📧 Recuperar pelo e-mail</h2>'
  +(step===1?'<p>Esqueceu a senha e perdeu o código? Use o e-mail ligado à sua conta.</p><label>Seu e-mail<input name="email" type="email" required maxlength="120" autocomplete="email" inputmode="email" value="'+e(email)+'"></label>'
   :'<ol class="mr-steps"><li>Abra o e-mail que enviamos para <b>'+e(email)+'</b>.</li><li>Toque no link e crie uma <b>senha da nuvem</b> (qualquer uma, só para esta recuperação).</li><li>Volte aqui e preencha:</li></ol>'
    +'<label>Senha da nuvem que você criou no link<input name="cloud" type="password" required autocomplete="off"></label><label>Nova senha do app (8+ caracteres, com letras e números)<input name="password" type="password" required autocapitalize="none" spellcheck="false" autocomplete="new-password"></label><label>Repita a nova senha<input name="confirmation" type="password" required autocapitalize="none" spellcheck="false" autocomplete="new-password"></label>')
  +(err?'<p class="cl-err" role="alert">'+e(err)+'</p>':'')+'<button class="primary" '+(busy?'disabled':'')+'>'+(busy?'Aguarde…':step===1?'Enviar link para o e-mail':'Recuperar minha conta')+'</button>'
  +(step===2?'<button type="button" onclick="mrBack()">Reenviar o link</button>':'')+'<button type="button" onclick="document.getElementById(\'mail-rec\').close()">Cancelar</button></form>';if(!d.open)try{d.showModal()}catch(x){d.setAttribute('open','')}}
window.mrOpen=function(){step=1;err='';busy=false;if(authSession&&!email)email=ls('lojasg.estoque99.cloud-email:'+authSession.storeKey)||'';paint()};
var raM=renderAccount;renderAccount=function(){return raM.apply(this,arguments)+'<div class="grid2"><div class="panel help" id="forgot-panel"><h2>🔑 Esqueci a senha atual</h2><p>Troque a senha provando pelo seu e-mail. Seus dados continuam.</p><button onclick="mrOpen()">Trocar a senha pelo e-mail</button></div></div>'};window.mrBack=function(){step=1;err='';paint()};
function code(x){var c=x&&x.code||'';return c==='auth/invalid-credential'||c==='auth/wrong-password'||c==='auth/user-not-found'?'E-mail ou senha da nuvem incorretos. Use a senha que você criou no link do e-mail.':c==='auth/too-many-requests'?'Muitas tentativas. Espere alguns minutos.':c==='auth/network-request-failed'?'Sem internet.':(x&&x.message)||'Não foi possível recuperar.'}
window.mrGo=async function(ev){ev.preventDefault();if(busy)return;var v=readForm(ev.target);err='';busy=true;paint();
  try{var c=await window.e99Cloud.load();
    if(step===1){email=String(v.email||'').trim().toLowerCase();if(!/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(email))throw Error('Digite um e-mail válido.');try{await c.auth.sendPasswordResetEmail(email)}catch(x){if(x.code!=='auth/user-not-found')throw x}step=2;busy=false;paint();return}
    authPasswordCheck(v.password,v.confirmation);var T9=window.e99CloudTry,w9=T9?T9.wait():0;if(w9)throw Error('Muitas tentativas neste aparelho. Espere '+w9+' min e tente de novo.');
    var u;try{u=(await c.auth.signInWithEmailAndPassword(email,String(v.cloud||''))).user;if(T9)T9.ok()}catch(x){if(T9&&x&&x.code!=='auth/network-request-failed')T9.fail();throw x}
    var vd=null,ud=null;try{vd=(await c.db.collection('cofre').doc(u.uid).get()).data()}catch(x){}try{ud=(await c.db.collection('usuarios').doc(u.uid).get()).data()}catch(x){}
    var login=authLoginName((vd&&vd.login)||(ud&&ud.login)||'');if(!login)throw Error('Não encontrei uma conta do Stok ligada a este e-mail.');
    var storeKey=await authStorageKey(login),raw=localStorage.getItem(storeKey),record=raw?authCheckRecord(JSON.parse(raw)):null,newCode=authNewRecoveryCode();
    if(record&&authSession&&authSession.storeKey===storeKey&&authLoginName(authSession.record.login)===login){/* conta já aberta (Manter conectado): troca a senha sem perder nada */await authResetWithBits(record,raw,storeKey,authSession.payload,v.password,newCode,null);authShownCode=newCode}
    else if(record&&vd&&vd.salt===record.salt){var opened=await authOpenWithBits(record,authUn64(vd.bits));await authResetWithBits(record,raw,storeKey,opened.payload,v.password,newCode,null);authShownCode=newCode}
    else{var msg=record?'Esta conta foi criada antes da recuperação por e-mail existir, então os dados guardados só neste aparelho não podem ser abertos. Recomeçar a conta com o mesmo login e e-mail? Sua equipe e dados da equipe voltam pela nuvem e pela sincronização.':'Não há cópia desta conta neste aparelho. Criar a conta aqui com o mesmo login e e-mail? Seu perfil e os dados da equipe voltam pela nuvem e pela sincronização.';
      if(!confirm(msg)){busy=false;err='';paint();return}
      if(raw){localStorage.removeItem(storeKey);['lojasg.estoque99.chat:','lojasg.estoque99.agents:','lojasg.estoque99.totp:','lojasg.estoque99.vault:'].forEach(function(p){try{localStorage.removeItem(p+storeKey)}catch(x){}})}/* conta antiga excluída do aparelho */
      /* v89: mantém o papel salvo na nuvem; nunca promove a gestor */
      var role=ud&&['gestor','auxiliar','estoque'].indexOf(ud.role)>=0?ud.role:'estoque';
      /* traz o perfil (nome, foto, capa, cargo) da nuvem antes de entrar */
      var prof=null;try{if(ud&&/^[0-9a-f]{32}$/.test(ud.loja||'')){var pd=(await c.db.collection('lojas').doc(ud.loja).collection('perfis').doc(u.uid).get()).data();if(pd&&pd.p)prof=Object.assign({},pd.p,{at:Number(pd.at)||Date.now()})}}catch(x){}
      var session=await authCreate(login,login==='estoque 99'?'Estoque 99':(prof&&prof.name?String(prof.name).slice(0,80):'Estoque'),v.password,authEmpty(),role,email);
      try{var eq=(await c.db.collection('equipes').doc(u.uid).get()).data();if(eq&&eq.code){var cc={code:eq.code,name:eq.name||'',team:eq.team||'Equipe',owner:!!eq.owner,sync:!!eq.sync,replace:true};var civ=crypto.getRandomValues(new Uint8Array(12));var cct=await crypto.subtle.encrypt({name:'AES-GCM',iv:civ,additionalData:authBytes('chat|'+authLoginName(session.record.login))},session.key,authBytes(JSON.stringify(cc)));localStorage.setItem('lojasg.estoque99.chat:'+session.storeKey,JSON.stringify({iv:authB64(civ),cipher:authB64(new Uint8Array(cct))}))}}catch(x){}
      if(prof)try{await new Promise(function(res){var rq=indexedDB.open('estoque99-profiles',1);rq.onupgradeneeded=function(){rq.result.createObjectStore('p')};rq.onsuccess=function(){var db=rq.result,tx=db.transaction('p','readwrite');tx.objectStore('p').put(prof,'me|'+session.storeKey);tx.oncomplete=function(){db.close();res()};tx.onerror=function(){db.close();res()}};rq.onerror=function(){res()}})}catch(x){}
      localStorage.setItem(session.storeKey,JSON.stringify(session.record));authEnter({key:session.key,record:session.record,storeKey:session.storeKey,payload:session.payload});authShownCode=session.recoveryCode}
    ls('lojasg.estoque99.cloud-email:'+storeKey,email);var d2=await derive(login,v.password);try{await u.updatePassword(d2)}catch(x){}
    grab(login,v.password);vault();var dd=document.getElementById('mail-rec');if(dd)dd.close();busy=false;
    notify(record&&vd&&vd.salt===record.salt?'Conta recuperada com todos os dados! Anote o novo código em Minha conta.':(localStorage.getItem('lojasg.estoque99.chat:'+storeKey)?'Conta recuperada e de volta à equipe! Anote o novo código em Minha conta.':'Conta recuperada! Para voltar à equipe, peça o convite (Chat → Convidar) a quem está na equipe. Anote o novo código em Minha conta.'));try{go('account')}catch(x){}}
  catch(x){busy=false;err=code(x);paint();if(x&&x.code==='auth/network-request-failed'&&window.e99NetWhy)window.e99NetWhy().then(function(t){if(err==='Sem internet.'){err=t;paint()}}).catch(function(){})}};
/* link na tela de entrar */
var raB=renderAuth;renderAuth=function(){raB.apply(this,arguments);try{var f=document.getElementById('auth-form');if(f&&!authRecoveryShow&&!authPending&&(authMode==='login'||authMode==='recover')&&!document.getElementById('mr-link')){var b=document.createElement('button');b.type='button';b.id='mr-link';b.className='mr-link';b.textContent='Esqueci a senha e o código · recuperar pelo e-mail';b.onclick=window.mrOpen;f.after(b)}}catch(x){}};
if(typeof authSession!=='undefined'&&!authSession&&document.getElementById('auth-form'))renderAuth();
})();
