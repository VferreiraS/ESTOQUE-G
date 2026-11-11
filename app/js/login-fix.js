
(function(){
'use strict';
/* Login sem falhas:
   - aceita "@usuario", maiúsculas, espaços, o @usuário e o nome do perfil, e o e-mail;
   - se a conta não está neste aparelho (iPhone separa Safari e app, e pode apagar dados), traz da nuvem com e-mail + senha. */
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(x){return null}}
function aliases(){try{return JSON.parse(ls('lojasg.estoque99.login-alias')||'{}')||{}}catch(x){return {}}}
function addAlias(k,login){k=normalText(String(k||'').replace(/^@+/,''));if(!k)return;var a=aliases();a[k]=login;ls('lojasg.estoque99.login-alias',JSON.stringify(a))}
var EMAIL=/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;
async function exists(login){return !!localStorage.getItem(await authStorageKey(login))}
async function resolve(txt){var t=String(txt||'').normalize('NFKC').replace(/[​-‏⁠﻿]/g,'').trim();
  if(EMAIL.test(t)){var lg=window.e99LoginForEmail&&window.e99LoginForEmail(t);return {login:lg||'',email:t.toLowerCase()}}
  t=t.replace(/^@+/,'').trim();if(await exists(t))return {login:t};var a=aliases()[normalText(t)];if(a&&await exists(a))return {login:a};
  var d=t.replace(/\s+/g,'.');if(d!==t&&await exists(d))return {login:d};return {login:t,missing:true}}
/* lembra apelidos (@usuário e nome do perfil) de quem entra neste aparelho */
var eB=authEnter;authEnter=function(){var r=eB.apply(this,arguments);var s=authSession;setTimeout(function(){try{if(!s||authSession!==s)return;var lg=s.record.login;addAlias(lg,lg);var em=ls('lojasg.estoque99.cloud-email:'+s.storeKey);if(em)addAlias(em,lg)}catch(x){}},2500);return r};
var sB=authSubmit;authSubmit=async function(ev){if(authMode!=='login'||authPending){return sB.apply(this,arguments)}
  var f=ev.target,li=f.querySelector('input[name=login]'),pw=f.querySelector('input[name=password]');var typed=li?li.value:'',pass=pw?pw.value:'';var r=await resolve(typed);
  if(r.email&&!r.login){ev.preventDefault();cloudAsk({email:r.email,pass:pass,needLogin:true});return}
  if(li&&r.login)li.value=r.login;var out=await sB.apply(this,arguments);
  if(!authSession&&/não encontrada neste aparelho/.test(authError||'')){cloudAsk({login:r.login,email:r.email||'',pass:pass})}return out};
/* ---------- trazer a conta da nuvem ---------- */
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
var st=null;
function cloudAsk(o){st=o;st.err='';paint()}
function paint(){var d=document.getElementById('cloud-pull');if(!d){d=document.createElement('dialog');d.id='cloud-pull';d.className='cl-pull';document.body.appendChild(d)}
  d.innerHTML='<form class="cl-body" onsubmit="cpGo(event)"><h2>'+(window.e99Icon?e99Icon('cloud'):'')+'Trazer sua conta da nuvem</h2><p>Esta conta ainda não está neste aparelho. No iPhone, o Safari e o app da tela inicial guardam contas separadas. Digite o e-mail da conta para trazê-la da nuvem.</p>'
   +(st.needLogin?'<label>Seu login<input name="login" required maxlength="80" autocomplete="username" value="'+e(st.login||'')+'"></label>':'<p class="small">Login: <b>'+e(st.login)+'</b></p>')
   +'<label>Seu e-mail<input name="email" type="email" required maxlength="120" autocomplete="email" inputmode="email" value="'+e(st.email||'')+'"></label>'
   +'<label>Sua senha do app<input name="password" type="password" required autocapitalize="none" spellcheck="false" autocomplete="current-password" value="'+e(st.pass||'')+'"></label>'
   +(st.err?'<p class="cl-err" role="alert">'+e(st.err)+'</p>':'')+'<button class="primary" '+(st.busy?'disabled':'')+'>'+(st.busy?'Buscando…':'Trazer minha conta')+'</button><button type="button" onclick="document.getElementById(\'cloud-pull\').close()">Cancelar</button>'
   +'<p class="small">Não lembra a senha? Feche esta janela e toque em “Esqueci a senha”.</p></form>';if(!d.open)try{d.showModal()}catch(x){d.setAttribute('open','')}}
async function derive(login,pw){return authCloudDerive(login,pw)}
window.cpGo=async function(ev){ev.preventDefault();if(st.busy)return;var v=readForm(ev.target);var login=String(st.needLogin?v.login:st.login||'').trim().replace(/^@+/,''),email=String(v.email||'').trim().toLowerCase(),p=String(v.password||'');
  st.login=login;st.email=email;st.pass=p;st.err='';if(!EMAIL.test(email)){st.err='Digite um e-mail válido.';paint();return}st.busy=true;paint();
  try{var c=await window.e99Cloud.load();if(c.auth.currentUser)try{await c.auth.signOut()}catch(x){}var u;
    var T9=window.e99CloudTry,w9=T9?T9.wait():0;if(w9)throw Error('Muitas tentativas neste aparelho. Espere '+w9+' min e tente de novo.');
    try{u=(await c.auth.signInWithEmailAndPassword(email,await derive(login,p))).user;if(T9)T9.ok()}catch(x){if(x.code==='auth/network-request-failed')throw Error(await window.e99NetWhy());if(T9)T9.fail();throw Error('E-mail, login ou senha não conferem com a conta da nuvem. Se esqueceu a senha, use "recuperar pelo e-mail".')}
    var ud=null;try{ud=(await c.db.collection('usuarios').doc(u.uid).get()).data()}catch(x){}
    var lg=authLoginName((ud&&ud.login)||login);if(await exists(lg)){st.busy=false;st.err='';document.getElementById('cloud-pull').close();notify('A conta já está neste aparelho: entre com login e senha.');return}
    /* v89: mantém o papel salvo na nuvem; nunca promove a gestor */
    var role=ud&&['gestor','auxiliar','estoque'].indexOf(ud.role)>=0?ud.role:'estoque';
    var prof=null;try{if(ud&&/^[0-9a-f]{32}$/.test(ud.loja||'')){var pd=(await c.db.collection('lojas').doc(ud.loja).collection('perfis').doc(u.uid).get()).data();if(pd&&pd.p)prof=Object.assign({},pd.p,{at:Number(pd.at)||Date.now()})}}catch(x){}
    /* v133: traz também os dados do backup cifrado (se houver e abrir com esta senha) */
    var session=(window.e99BkPull?await window.e99BkPull(c,u,lg,p,role,email):null)||await authCreate(lg,lg==='estoque 99'?'Estoque 99':(prof&&prof.name?String(prof.name).slice(0,80):'Estoque'),p,authEmpty(),role,email);
    try{var eq=(await c.db.collection('equipes').doc(u.uid).get()).data();if(eq&&eq.code){var cc={code:eq.code,name:eq.name||'',team:eq.team||'Equipe',owner:!!eq.owner,sync:!!eq.sync,replace:true};var civ=crypto.getRandomValues(new Uint8Array(12));var cct=await crypto.subtle.encrypt({name:'AES-GCM',iv:civ,additionalData:authBytes('chat|'+authLoginName(session.record.login))},session.key,authBytes(JSON.stringify(cc)));localStorage.setItem('lojasg.estoque99.chat:'+session.storeKey,JSON.stringify({iv:authB64(civ),cipher:authB64(new Uint8Array(cct))}))}}catch(x){}
    if(prof)try{await new Promise(function(res){var rq=indexedDB.open('estoque99-profiles',1);rq.onupgradeneeded=function(){rq.result.createObjectStore('p')};rq.onsuccess=function(){var db=rq.result,tx=db.transaction('p','readwrite');tx.objectStore('p').put(prof,'me|'+session.storeKey);tx.oncomplete=function(){db.close();res()};tx.onerror=function(){db.close();res()}};rq.onerror=function(){res()}})}catch(x){}
    ls('lojasg.estoque99.cloud-email:'+session.storeKey,email);
    localStorage.setItem(session.storeKey,JSON.stringify(session.record));st.busy=false;document.getElementById('cloud-pull').close();authEnter({key:session.key,record:session.record,storeKey:session.storeKey,payload:session.payload});authShownCode=session.recoveryCode||null;
    if(session.restored){notify('Conta e dados trazidos do backup da nuvem.');return}
    notify(localStorage.getItem('lojasg.estoque99.chat:'+session.storeKey)?'Conta trazida da nuvem e de volta à equipe! Anote o novo código em Minha conta.':'Conta trazida da nuvem! Entre na equipe pelo convite (Chat). Anote o novo código em Minha conta.')}
  catch(x){st.busy=false;st.err=x.message||'Não foi possível trazer a conta.';paint()}};
/* dica embaixo do login */
var rA=renderAuth;renderAuth=function(){rA.apply(this,arguments);try{var li=document.querySelector('#auth-form input[name=login]');if(li&&authMode==='login'&&!authPending&&!document.getElementById('login-hint')){li.setAttribute('autocapitalize','none');li.setAttribute('autocorrect','off');li.setAttribute('spellcheck','false');var h=document.createElement('span');h.id='login-hint';h.className='small';h.textContent='Use seu login (ex.: vferreiras), seu @usuário ou seu e-mail.';(li.closest('label')||li).after(h)}}catch(x){}};
if(typeof authSession!=='undefined'&&!authSession&&document.getElementById('auth-form'))renderAuth();
})();
