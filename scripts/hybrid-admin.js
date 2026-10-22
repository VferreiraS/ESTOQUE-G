<script id="hybrid-admin-js">
(function(){
'use strict';
/* Híbrido v78: backup cifrado + gestor redefine senha de auxiliar (com código de recuperação). */

function hyEsc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}

function hyProtected(login){
  var n=String(login||'').trim().toLocaleLowerCase('pt-BR');
  return n==='estoque 99'||n==='vferreiras'||n==='vferreira s'||n==='vferreira';
}

/** Gestor redefine senha de outra conta neste aparelho usando o código de recuperação. */
window.authAdminResetPassword=async function(index){
  if(!authSession||authSession.payload.role!=='gestor'){notify('Só o gestor pode redefinir senha.');return}
  if(typeof authAccounts!=='function'||typeof authCheckRecord!=='function')return;
  var rows=authAccounts(),row=rows[index];
  if(!row)return;
  if(row.key===authSession.storeKey){notify('Use Minha conta para trocar a sua senha.');return}
  if(hyProtected(row.login)){notify('Conta protegida.');return}
  var raw=localStorage.getItem(row.key);
  if(!raw){notify('Conta não encontrada neste aparelho.');return}
  var record;
  try{record=authCheckRecord(JSON.parse(raw))}catch(e){notify('Arquivo de conta inválido.');return}
  if(!record.recovery){
    notify('Esta conta não tem código de recuperação. Peça uma exportação antiga ou apague e crie de novo.');
    return;
  }
  var code=window.prompt('Código de recuperação da conta "'+row.login+'" (o de 24 caracteres):','');
  if(code===null)return;
  code=String(code).trim().toUpperCase().replace(/\s+/g,'');
  if(!code){notify('Informe o código.');return}
  var pass=window.prompt('Nova senha para "'+row.login+'" (4 a 8 números):','');
  if(pass===null)return;
  var pass2=window.prompt('Confirme a nova senha:','');
  if(pass2===null)return;
  try{
    if(typeof authPasswordCheck==='function')authPasswordCheck(pass,pass2);
    else if(pass!==pass2||!/^[0-9]{4,8}$/.test(pass))throw Error('Senha inválida (4 a 8 números).');
  }catch(e){notify(e.message||'Senha inválida.');return}
  try{
    var bits=await authUnwrapRecovery(code,record.login,record.recovery);
    var opened=await authOpenWithBits(record,bits);
    if(opened.payload&&opened.payload.seed)throw Error('Conta especial não pode ser redefinida assim.');
    var newCode=typeof authNewRecoveryCode==='function'?authNewRecoveryCode():code;
    var salt=authB64(crypto.getRandomValues(new Uint8Array(16)));
    var newBits=await authKeyBits(pass,salt);
    var newKey=await authKeyFromBits(newBits);
    var next0=Object.assign({},record,{
      salt:salt,
      revision:(record.revision||1)+1,
      recovery:await authWrapRecovery(newCode,newBits,record.login),
      bio:undefined
    });
    var payload={
      store:opened.payload.store,
      role:opened.payload.role,
      ai:typeof aiNormalize==='function'?aiNormalize(opened.payload.ai):opened.payload.ai,
      learn:typeof learnNormalize==='function'?learnNormalize(opened.payload.learn):opened.payload.learn,
      state:opened.payload.state
    };
    var next=await authEncrypt(newKey,next0,payload);
    if(localStorage.getItem(row.key)!==raw)throw Error('Conta alterada em outra aba. Tente de novo.');
    localStorage.setItem(row.key,JSON.stringify(next));
    try{await hyCloudBackupRecord(next)}catch(x){}
    notify('Senha de "'+row.login+'" redefinida. Novo código de recuperação: '+newCode+' — anote e entregue ao auxiliar.');
    try{alert('NOVO CÓDIGO DE RECUPERAÇÃO de '+row.login+':\n\n'+newCode+'\n\nAnote e entregue ao auxiliar. A senha antiga não funciona mais.')}catch(x){}
    if(typeof render==='function')render();
  }catch(e){
    notify(e&&e.message?e.message:'Não foi possível redefinir. Verifique o código de recuperação.');
  }
};

/** Backup cifrado da conta atual na nuvem (Firebase), se disponível. */
async function hyCloudBackupRecord(record){
  if(!record||!record.login)return;
  try{
    var d=typeof fb==='function'?await fb():null;
    if(!d||!d.collection)return;
    var idSrc=(record.id||record.login)+'|'+record.login;
    var buf=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(idSrc));
    var id=Array.from(new Uint8Array(buf)).map(function(b){return b.toString(16).padStart(2,'0')}).join('').slice(0,40);
    var safe={
      format:record.format,
      login:record.login,
      id:record.id||'',
      salt:record.salt,
      iv:record.iv,
      cipher:record.cipher,
      recovery:record.recovery||null,
      revision:record.revision||1,
      at:Date.now()
    };
    await d.collection('backups').doc(id).set(safe,{merge:true});
  }catch(e){
    try{console.warn('Stok backup:',e&&e.code||e)}catch(x){}
  }
}

window.hyBackupMyAccount=async function(){
  if(!authSession||!authSession.record){notify('Entre na conta.');return}
  try{
    await hyCloudBackupRecord(authSession.record);
    notify('Backup cifrado enviado à nuvem (se o Firebase permitir).');
  }catch(e){notify('Backup indisponível neste momento.')}
};

var _hyEnter=typeof authEnter==='function'?authEnter:null;
if(_hyEnter){
  window.authEnter=function(session){
    var r=_hyEnter.apply(this,arguments);
    try{
      if(session&&session.record)setTimeout(function(){hyCloudBackupRecord(session.record)},2000);
    }catch(x){}
    return r;
  };
}

var _hyAdm=typeof renderAdmin==='function'?renderAdmin:null;
if(_hyAdm){
  window.renderAdmin=function(){
    var h=_hyAdm.apply(this,arguments);
    try{
      if(!authSession||authSession.payload.role!=='gestor')return h;
      var rows=typeof authAccounts==='function'?authAccounts():[];
      var extra='<div class="panel help" style="margin-top:16px"><h2>Redefinir senha (híbrido)</h2>';
      extra+='<p class="small">Se um auxiliar perdeu a senha, use o <b>código de recuperação</b> dele (gerado na criação da conta ou em Minha conta). Os dados cifrados são preservados. Só funciona para contas <b>neste aparelho</b>.</p>';
      extra+='<p><button type="button" onclick="hyBackupMyAccount()">Fazer backup cifrado da minha conta</button></p>';
      var list=rows.map(function(r,i){
        if(r.key===authSession.storeKey||hyProtected(r.login))return '';
        return '<div class="panel help" style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px">'
          +'<span><b>'+hyEsc(r.login)+'</b><br><span class="small">Redefinir senha com código de recuperação</span></span>'
          +'<button type="button" class="primary" onclick="authAdminResetPassword('+i+')">Redefinir senha</button></div>';
      }).join('');
      extra+=(list||'<p class="small">Nenhuma outra conta neste aparelho.</p>')+'</div>';
      return h+extra;
    }catch(x){return h}
  };
}
})();
</script>
