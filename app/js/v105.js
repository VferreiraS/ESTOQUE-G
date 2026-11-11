
(function(){
'use strict';
/* v105 (pedido do dono): e-mail obrigatório para ter conta e acesso ao site.
   - Criar conta e convite de auxiliar já exigem e-mail (authSubmit / auxCreate); ele vai para dentro da conta cifrada (payload.email).
   - Conta antiga sem e-mail NÃO fica trancada para fora: entra normalmente, mas ao entrar aparece esta tela
     (v107: com "Agora não", que vale só para esta sessão) até informar o e-mail. Dá para sair da conta. O e-mail não muda o papel (gestor continua só o dono).
   - Conta que já tinha o e-mail da nuvem (cloud-email) é migrada sozinha para dentro da conta cifrada, sem tela.
   - Conta do PC: o e-mail fica só como contato (a nuvem do PC continua com o login interno). */
var D=document,RE=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,err='',busy=false;
/* v107 (pedido do dono): "Agora não" deixa entrar sem o e-mail; vale só até sair/entrar de novo ou recarregar a página
   (fica só na memória), então a tela volta a pedir pelo menos uma vez a cada sessão. */
var later={};
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(x){return null}}
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ok(m){return typeof m==='string'&&m.length<=120&&RE.test(m)}
function testOff(){try{return (location.hostname==='localhost'||location.hostname==='127.0.0.1')&&localStorage.getItem('e99-no-email-gate')==='1'}catch(x){return false}}
function isPc(s){return !!ls('lojasg.estoque99.pc-account:'+s.storeKey)}
function cloudEm(s){var m=String(ls('lojasg.estoque99.cloud-email:'+s.storeKey)||'').trim().toLowerCase();return ok(m)?m:''}
function mapLogin(s,m){try{window.e99MailIdx.set(m,s.record.login)}catch(x){}}
async function persist(s){if(authSession!==s)return;try{await authPersist(JSON.stringify(state))}catch(x){try{console.warn('Stok e-mail da conta:',x&&x.message||x)}catch(y){}}}
window.e99AccountEmail=function(){var s=authSession;if(!s||!s.payload)return '';return ok(s.payload.email)?s.payload.email:cloudEm(s)};
function needs(){var s=authSession;return !!(s&&s.payload&&!ok(s.payload.email)&&!cloudEm(s)&&!testOff())}
window.e99EmailGateNeeded=needs;
function skipped(){var s=authSession;return !!(s&&later[s.storeKey])}
window.e99EmailGateSkipped=skipped;
window.e99EmailGateLater=function(){var s=authSession;if(!s)return;later[s.storeKey]=1;err='';shut();try{notify('Tudo bem. Vamos pedir o e-mail de novo na próxima vez que você entrar.')}catch(x){}};
/* mantém o e-mail da conta (cifrado) e o e-mail da nuvem iguais */
function align(){var s=authSession;if(!s||!s.payload)return;var pe=ok(s.payload.email)?s.payload.email:'',pc=isPc(s),ce=pc?'':cloudEm(s);
  if(ce&&ce!==pe){s.payload.email=ce;persist(s);return}
  if(pe&&!pc&&!ce){ls('lojasg.estoque99.cloud-email:'+s.storeKey,pe);mapLogin(s,pe)}}
function gate(){var d=D.getElementById('email-gate');if(!d){d=D.createElement('dialog');d.id='email-gate';d.setAttribute('aria-labelledby','eg-title');
    d.addEventListener('cancel',function(ev){ev.preventDefault()});/* o Chromium deixa o 2º Esc fechar mesmo com preventDefault: reabre na hora */d.addEventListener('close',function(){if(authSession&&needs()&&!skipped())setTimeout(function(){if(authSession&&needs()&&!skipped())paint()},0)});D.body.appendChild(d)}return d}
function paint(){var s=authSession;if(!s)return;var d=gate(),pc=isPc(s),keep=d.querySelector('input[name=email]'),val=keep?keep.value:'';
  d.innerHTML='<form class="cl-body" novalidate onsubmit="e99EmailGateSave(event)"><h2 id="eg-title">📧 Informe seu e-mail</h2><p>Agora toda conta do Stok precisa de um e-mail. Ele serve para recuperar a senha e para trazer a conta para outro aparelho. Fica guardado dentro da sua conta, protegido pela sua senha.</p>'
   +(pc?'<p class="small">🖥️ Conta do PC do estoque: o e-mail fica só como contato. A nuvem continua com o login interno.</p>':'')
   +'<p class="small">Conta: <b>'+e(s.record.login)+'</b></p><label>Seu e-mail<input name="email" type="email" required maxlength="120" autocomplete="email" inputmode="email" autocapitalize="none" spellcheck="false" placeholder="voce@gmail.com" value="'+e(val)+'"></label>'
   +'<p class="eg-err" role="alert">'+e(err)+'</p><button class="primary" type="submit" '+(busy?'disabled':'')+'>'+(busy?'Salvando…':'Salvar e continuar')+'</button><button type="button" class="eg-later" onclick="e99EmailGateLater()">Agora não</button><button type="button" class="eg-out" onclick="e99EmailGateOut()">Sair da conta</button></form>';
  if(!d.open){try{d.showModal()}catch(x){d.setAttribute('open','')}var i=d.querySelector('input[name=email]');if(i)try{i.focus()}catch(x){}}}
function shut(){var d=D.getElementById('email-gate');if(d&&d.open)try{d.close()}catch(x){d.removeAttribute('open')}}
function check(){try{if(!authSession){shut();err='';return}align();if(needs()&&!skipped()){var d=D.getElementById('email-gate');if(!d||!d.open)paint()}else shut()}catch(x){}}
window.e99EmailGateOut=function(){shut();Promise.resolve(authLogout()).then(function(){if(authSession)check()}).catch(function(){check()})};
window.e99EmailGateSave=async function(ev){ev.preventDefault();var s=authSession;if(!s||busy)return;var m=String((ev.target.querySelector('input[name=email]')||{}).value||'').trim().toLowerCase();
  if(!m){err='Informe seu e-mail. Toda conta do Stok precisa de um e-mail.';paint();return}
  if(!ok(m)){err='Digite um e-mail válido (ex.: voce@gmail.com).';paint();return}
  /* o mesmo e-mail não pode ficar em duas contas deste aparelho (o login pelo e-mail e a nuvem ficariam confusos) */
  try{var other=window.e99MailIdx.get(m);if(other&&authLoginName(other)!==authLoginName(s.record.login)&&localStorage.getItem(await authStorageKey(other))){err='Este e-mail já é de outra conta deste aparelho ('+other+'). Use outro e-mail.';paint();return}}catch(x){}
  busy=true;err='';paint();try{s.payload.email=m;if(!isPc(s)){ls('lojasg.estoque99.cloud-email:'+s.storeKey,m);mapLogin(s,m)}await persist(s)}finally{busy=false}
  if(authSession!==s)return;shut();notify('E-mail salvo na sua conta.');
  if(!isPc(s)&&window.e99Cloud&&typeof window.e99Cloud.onEnter==='function')setTimeout(function(){if(authSession===s)window.e99Cloud.onEnter()},400)};
var en=authEnter;authEnter=function(){later={};var r=en.apply(this,arguments);err='';setTimeout(check,60);return r};
setInterval(function(){if(!D.hidden)check()},3000);
if(typeof authSession!=='undefined'&&authSession)setTimeout(check,300);
})();
