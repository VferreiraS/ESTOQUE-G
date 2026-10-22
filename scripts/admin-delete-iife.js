(function(){
'use strict';
/* Administração: excluir contas neste navegador. Só o gestor. Não apaga a conta em uso nem vferreiras / estoque 99. */
function escDel(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function authProtectedLogin(login){
  var n=String(login||'').trim().toLocaleLowerCase('pt-BR');
  return n==='estoque 99'||n==='vferreiras'||n==='vferreira s'||n==='vferreira';
}
function idbDel(db,store,match){try{var r=indexedDB.open(db);r.onsuccess=function(){var d=r.result;if(!d.objectStoreNames.contains(store)){d.close();return}var t=d.transaction(store,'readwrite'),st=t.objectStore(store),c=st.openCursor();
  c.onsuccess=function(){var cur=c.result;if(!cur)return;try{if(match(cur.key,cur.value))cur.delete()}catch(x){}cur.continue()};t.oncomplete=t.onerror=function(){d.close()}};r.onupgradeneeded=function(){try{r.transaction.abort()}catch(x){}}}catch(x){}}
function authPurgeLocalAccount(row){
  localStorage.removeItem(row.key);
  try{localStorage.removeItem(AUTH_BLOCK+row.key)}catch(x){}
  ['lojasg.estoque99.chat:','lojasg.estoque99.robot-groq:','lojasg.estoque99.robot:','lojasg.estoque99.email-reports:','lojasg.estoque99.email-sent:','lojasg.estoque99.aux-invites:','lojasg.estoque99.sheets:','lojasg.estoque99.profile-pub:','lojasg.estoque99.store-renamed:','lojasg.estoque99.profile-seen:','lojasg.estoque99.pc-account:','lojasg.estoque99.cloud-email:','lojasg.estoque99.cloud-pw:','lojasg.estoque99.totp:','lojasg.estoque99.vault:','lojasg.estoque99.agents:','lojasg.estoque99.aux-profile:','lojasg.estoque99.members:'].forEach(function(k){try{localStorage.removeItem(k+row.key)}catch(x){}});
  var rmMine=[];for(var i=0;i<localStorage.length;i++){var lk=localStorage.key(i);if(lk&&lk.indexOf('lojasg.estoque99.')===0&&lk.indexOf(row.key)>0)rmMine.push(lk)}
  rmMine.forEach(function(k){try{localStorage.removeItem(k)}catch(x){}});
  idbDel('estoque99-profiles','p',function(k){return k==='me|'+row.key});
  idbDel('estoque99-local','remember',function(k,v){return v&&v.storeKey===row.key});
}
window.authDeleteAccount=function(index){
  if(!authSession||authSession.payload.role!=='gestor')return;
  var rows=authAccounts(),row=rows[index];
  if(!row)return;
  if(row.key===authSession.storeKey){notify('Não é possível excluir a conta que está aberta.');return}
  if(authProtectedLogin(row.login)){notify('A conta "'+row.login+'" é protegida e não pode ser excluída.');return}
  var typed=window.prompt('Para excluir a conta "'+row.login+'" deste navegador, digite o login exatamente:','');
  if(typed===null)return;
  if(typed.trim().toLowerCase()!==row.login.toLowerCase()){notify('O login digitado não confere. Nada foi excluído.');return}
  try{
    authPurgeLocalAccount(row);
    notify('Conta "'+row.login+'" excluída deste navegador.');
    render();
  }catch(x){notify('O navegador não permitiu excluir a conta.')}
};
window.authDeleteAllOtherAccounts=function(){
  if(!authSession||authSession.payload.role!=='gestor')return;
  var rows=authAccounts().filter(function(r){
    return r.key!==authSession.storeKey && !authProtectedLogin(r.login);
  });
  if(!rows.length){notify('Não há outras contas apagáveis neste navegador.');return}
  if(!confirm('APAGAR '+rows.length+' conta(s) neste navegador, mantendo a sua e as contas protegidas (vferreiras / estoque 99)?\n\nNão dá para desfazer.'))return;
  if(!confirm('Última confirmação: excluir '+rows.length+' conta(s)?'))return;
  var n=0;
  try{
    rows.forEach(function(row){authPurgeLocalAccount(row);n++});
    notify(n+' conta(s) excluída(s) neste aparelho.');
    render();
  }catch(x){notify('Falha ao excluir algumas contas.');render()}
};
var admDel=renderAdmin;
renderAdmin=function(){
  var h=admDel.apply(this,arguments);
  try{
    if(!authSession||authSession.payload.role!=='gestor')return h;
    var rows=authAccounts();
    var deletable=rows.filter(function(r){return r.key!==authSession.storeKey&&!authProtectedLogin(r.login)});
    var bulk=deletable.length?'<p style="margin-top:12px"><button type="button" class="danger" onclick="authDeleteAllOtherAccounts()">Apagar todas as outras contas ('+deletable.length+')</button></p><p class="small">Remove todas as contas deste navegador, exceto a sua e as protegidas (vferreiras / estoque 99). Só vale neste aparelho.</p>':'';
    var list=rows.map(function(r,i){
      var self=r.key===authSession.storeKey,prot=authProtectedLogin(r.login);
      if(self||prot)return '<div class="panel help"><b>'+escDel(r.login)+'</b> · <span class="small">'+(self?'Sua conta (gestor)':'Protegida')+'</span></div>';
      return '<div class="panel help" style="display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap"><span><b>'+escDel(r.login)+'</b><br><span class="small">Excluir remove esta conta deste navegador.</span></span><button type="button" class="danger" onclick="authDeleteAccount('+i+')">Excluir conta</button></div>';
    }).join('');
    return h+bulk+(list?'<h2 style="margin-top:18px">Contas neste aparelho</h2>'+list:'');
  }catch(x){}
  return h;
};
})();
