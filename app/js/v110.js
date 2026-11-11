
(function(){
'use strict';
/* v110 (pedido do dono): senha mais forte.
   - Contas novas e toda senha nova: 8+ caracteres, com letras e números (authPasswordCheck). A senha da nuvem passa a ser
     PBKDF2 (600 mil voltas, sal da conta) — authCloudDerive. Quem ainda usa a senha antiga de números continua entrando
     (aqui e na nuvem, com a fórmula antiga); nada muda na nuvem até a pessoa trocar a senha.
   - Ao entrar com a senha antiga, o app pede a troca: nos primeiros 30 dias dá para deixar para depois ("Agora não", vale até sair
     ou recarregar); depois disso a troca é obrigatória (só "Trocar senha" ou "Sair da conta"). A troca usa o "Trocar senha" de sempre
     (conta recifrada, novo código de recuperação, senha da nuvem atualizada pelo bloco cloud-js). */
var D=document,DAYS=30,later={},err='',busy=false;
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(x){return null}}
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function testOff(){try{return authWeakTestOK()&&localStorage.getItem('e99-test-pw-upgrade')!=='1'}catch(x){return false}}
function sinceKey(s){return 'lojasg.estoque99.pw-upgrade:'+s.storeKey}
function since(s){var v=Number(ls(sinceKey(s))||0);if(!v){v=Date.now();ls(sinceKey(s),String(v))}return v}
function due(s){return since(s)+DAYS*86400000}
function forced(s){return Date.now()>=due(s)}
function needs(){var s=authSession;return !!(s&&s.weakPw===true&&!testOff())}
window.e99PwUpgradeNeeded=needs;
function other(){var l=D.querySelectorAll('dialog[open]');for(var i=0;i<l.length;i++){if(l[i].id!=='pw-upgrade')return true}return false}
function dlg(){var d=D.getElementById('pw-upgrade');if(!d){d=D.createElement('dialog');d.id='pw-upgrade';d.setAttribute('aria-labelledby','pu-title');
  d.addEventListener('cancel',function(ev){var s=authSession;if(s&&forced(s))ev.preventDefault();else later[s?s.storeKey:'-']=1});
  d.addEventListener('close',function(){var s=authSession;if(s&&needs()&&forced(s))setTimeout(function(){if(authSession&&needs()&&forced(authSession))paint()},0)});D.body.appendChild(d)}return d}
function fmt(t){try{return new Date(t).toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit',year:'numeric'})}catch(x){return ''}}
function paint(){var s=authSession;if(!s)return;var d=dlg(),f=forced(s);
  d.innerHTML='<form class="cl-body" novalidate onsubmit="e99PwUpgradeSave(event)"><h2 id="pu-title">🔒 Troque para uma senha mais forte</h2>'
   +'<p>Sua senha ainda é só de números. Agora o Stok usa senhas com <b>pelo menos 8 caracteres, com letras e números</b> (ex.: <i>estoque2026</i>). Ela protege seus dados neste aparelho e na nuvem.</p>'
   +(f?'<p class="pu-due"><b>A troca agora é obrigatória.</b> O prazo terminou em '+e(fmt(due(s)))+'.</p>':'<p class="small">Você pode deixar para depois até <b>'+e(fmt(due(s)))+'</b>. Depois disso a troca será obrigatória.</p>')
   +'<p class="small">Conta: <b>'+e(s.record.login)+'</b>. Ao trocar, um novo código de recuperação é criado (guarde-o).</p>'
   +'<input type="text" name="username" autocomplete="username" value="'+e(s.record.login)+'" readonly tabindex="-1" aria-hidden="true" class="e99-user-hint">'
   +'<label>Senha atual (só números)<input name="current" type="password" required maxlength="128" autocomplete="current-password" autocapitalize="none" spellcheck="false"></label>'
   +'<label>Nova senha (8+ caracteres, com letras e números)<input name="password" type="password" required maxlength="128" autocomplete="new-password" autocapitalize="none" spellcheck="false"></label>'
   +'<label>Repita a nova senha<input name="confirmation" type="password" required maxlength="128" autocomplete="new-password" autocapitalize="none" spellcheck="false"></label>'
   +'<p class="pu-err" role="alert">'+e(err)+'</p><button class="primary" type="submit" '+(busy?'disabled':'')+'>'+(busy?'Trocando…':'Trocar senha')+'</button>'
   +(f?'':'<button type="button" class="pu-later" onclick="e99PwUpgradeLater()">Agora não</button>')
   +'<button type="button" class="pu-out" onclick="e99PwUpgradeOut()">Sair da conta</button></form>';
  if(!d.open){try{d.showModal()}catch(x){d.setAttribute('open','')}var i=d.querySelector('input[name=current]');if(i)try{i.focus()}catch(x){}}}
function shut(){var d=D.getElementById('pw-upgrade');if(d&&d.open)try{d.close()}catch(x){d.removeAttribute('open')}}
function check(){try{var s=authSession;if(!s){shut();err='';return}if(!needs()){shut();return}var d=D.getElementById('pw-upgrade');if(d&&d.open)return;
  if(!forced(s)&&later[s.storeKey])return;if(other())return;paint()}catch(x){}}
window.e99PwUpgradeLater=function(){var s=authSession;if(!s||forced(s))return;later[s.storeKey]=1;err='';shut();notify('Tudo bem. Vamos lembrar de novo na próxima vez que você entrar.')};
window.e99PwUpgradeOut=function(){shut();Promise.resolve(authLogout()).then(function(){if(authSession)check()}).catch(function(){check()})};
window.e99PwUpgradeSave=async function(ev){ev.preventDefault();var s=authSession;if(!s||busy)return;var f=ev.target,v=readForm(f);
  if(!v.current){err='Digite a senha atual.';paint();return}
  try{if(v.password!==v.confirmation)throw Error('As senhas não conferem.');if(!authPasswordStrong(v.password))throw Error('A nova senha precisa ter pelo menos 8 caracteres, com letras e números (ex.: estoque2026).')}catch(x){err=x.message;paint();return}
  try{await authDecrypt(s.record,v.current)}catch(x){err='Senha atual incorreta.';paint();return}
  busy=true;err='';var salt=s.record.salt;
  try{/* mesmo caminho do "Trocar senha" de Minha conta (o cloud-js também atualiza a senha da nuvem) */
    var fake={preventDefault:function(){},target:f};await authChangePassword(fake)}catch(x){}
  busy=false;if(authSession!==s)return;
  if(s.record.salt===salt){err='Não foi possível trocar a senha agora. Tente de novo.';paint();return}
  s.weakPw=false;ls(sinceKey(s),null);shut();notify('Senha trocada. Guarde o novo código de recuperação em Minha conta.');try{go('account')}catch(x){}};
/* descobre, no login com senha, se a senha ainda é a antiga (só números). Nada é gravado sobre a senha. */
var sb=authSubmit;authSubmit=async function(event){var pw='',login=false;try{login=authMode==='login'&&!authPending&&event&&event.target&&event.target.id==='auth-form';if(login)pw=String(readForm(event.target).password||'')}catch(x){}
  var before=authSession;var r=await sb.apply(this,arguments);if(login&&authSession&&authSession!==before&&authPinOld(pw)){authSession.weakPw=true;since(authSession);setTimeout(check,900)}return r};
var en=authEnter;authEnter=function(){later={};err='';return en.apply(this,arguments)};
setInterval(function(){if(!D.hidden)check()},3000);
})();
