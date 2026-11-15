
(function(){
'use strict';
/* v127 (pedido do dono): (A) Perfil de volta, simples: foto, nome de exibição, cargo e "sobre" (sem selos, partículas, capa ou Authenticator).
   O meu perfil fica dentro da conta cifrada (state.perfil); os da equipe chegam pelo canal cifrado da sincronização (mensagem 'perfil',
   foto no anexo cifrado) e ficam no IndexedDB estoque99-perfis, cifrados com state.sealKey (e99Seal). Perfil nunca dá papel nem permissão.
   (B) Auxiliar cria NFs e planos e edita só os que criou (cby/cdev/clogin), sem excluir nada.
   (C) Contas só pelo gestor: sem "Criar conta" livre; o gestor gera um link de acesso pessoal (convite do Chat) que só ativa aquela conta.
   Limite: as contas são locais e cifradas no aparelho, sem servidor — é regra do app, não barreira contra quem alterar o código. */
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function nm(v){return String(v||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\s+/g,' ').trim()}
function aux(){return !!(window.isAux&&window.isAux())}
function myName(){try{var t=window.e99Team&&window.e99Team.get();if(t&&t.name)return t.name}catch(x){}return authSession?authSession.record.login:''}
function testOpen(){try{return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&localStorage.getItem('e99-test-signup')==='1'}catch(x){return false}}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(x){return null}}

/* ================= (C) contas só pelo gestor ================= */
window.e99CanCreateAccounts=function(){if(!authSession||!authSession.payload)return false;var r=authSession.payload.role;if(r==='gestor')return true;return r!=='auxiliar'&&testOpen()};
function emptyDevice(){try{return !authAccounts().length}catch(x){return false}}
var ASK='Peça seu link de acesso ao gestor.';
function fixAuth(){if(authSession)return;var box=document.getElementById('auth-screen');if(!box||box.hidden)return;if(testOpen())return;
  var c=document.getElementById('auth-create');if(c){if(emptyDevice()){c.id='auth-owner';c.textContent='Primeiro acesso do dono'}else c.remove()}
  var links=document.getElementById('auth-links');if(links&&!box.querySelector('.auth-ask')){var p=document.createElement('p');p.className='small auth-ask';p.textContent=ASK;links.after(p)}
  if(authMode==='signup'&&!authPending&&!authRecoveryShow){var pc=box.querySelector('#auth-form input[name=pc]');if(pc){var l=pc.closest('label')||pc;l.remove()}
    var f=document.getElementById('auth-form');if(f&&!f.querySelector('.auth-owner-note')){var n=document.createElement('p');n.className='small auth-owner-note';n.textContent='Só o dono cria a primeira conta num aparelho vazio. Os outros usuários ativam a conta pelo link de acesso que o gestor envia. '+ASK;f.prepend(n)}}}
var mo=new MutationObserver(function(){try{fixAuth()}catch(x){}});
function watchAuth(){var b=document.getElementById('auth-screen');if(b)mo.observe(b,{childList:true,subtree:true});try{fixAuth()}catch(x){}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watchAuth);else watchAuth();
var ownerNext=false;
/* a 1ª conta do dono num aparelho vazio nasce gestor (só o login vferreiras; o v101 confere o dono ao entrar) */
var ac0=authCreate;authCreate=function(login,store,password,data,role,email){if(ownerNext&&authLoginName(login)==='vferreiras'&&emptyDevice())role='gestor';ownerNext=false;return ac0.apply(this,[login,store,password,data,role,email])};
var sub0=authSubmit;authSubmit=async function(ev){ownerNext=false;if(!testOpen()&&!authPending&&!authRecoveryShow){var f=ev&&ev.target,lg='';try{lg=f&&f.elements&&f.elements.login?authLoginName(f.elements.login.value):''}catch(x){}
    if(authMode==='signup'){if(!(emptyDevice()&&lg==='vferreiras')){if(ev&&ev.preventDefault)ev.preventDefault();authError=emptyDevice()?'Só o dono cria a primeira conta neste aparelho. '+ASK:'Contas novas só pelo link de acesso do gestor. '+ASK;renderAuth();return}ownerNext=true}
    else if(authMode==='login'&&lg==='estoque 99'){if(ev&&ev.preventDefault)ev.preventDefault();var raw=null;try{raw=localStorage.getItem(await authStorageKey(lg))}catch(x){}if(!raw){authError='Conta não encontrada neste aparelho. '+ASK;renderAuth();return}}}
  return sub0.apply(this,arguments)};
/* uso único do link de acesso */
var USED='lojasg.estoque99.invite-used',remote={};
function usedMap(){try{return JSON.parse(ls(USED)||'{}')||{}}catch(x){return {}}}
window.e99InvMark=function(inv,login){if(!inv||!inv.inviteId)return;claim(inv,login);var m=usedMap();m[String(inv.inviteId).slice(0,40)]={login:String(login||inv.login||'').slice(0,80),at:Date.now()};var ks=Object.keys(m);if(ks.length>200)ks.slice(0,ks.length-200).forEach(function(k){delete m[k]});ls(USED,JSON.stringify(m))};
window.e99InvUsed=function(inv){if(!inv)return '';var id=String(inv.inviteId||''),lg=authLoginName(inv.login||''),u=id?usedMap()[id]:null;
  var here=u||(lg&&authAccounts().some(function(a){return authLoginName(a.login)===lg}));
  if(here)return 'Este link de acesso já foi usado neste aparelho (conta @'+(u&&u.login||lg)+'). Entre com o seu login e a senha que você escolheu. Esqueceu? Use "Esqueci a senha".';
  if(id&&remote[id]==='rev')return 'Este link de acesso foi cancelado pelo gestor. Peça um novo link ao gestor.';
  if(id&&remote[id]==='used')return 'Este link de acesso já foi ativado em outro aparelho. Entre com o seu login e senha (ou traga a sua conta da nuvem). Se não foi você, avise o gestor.';
  return ''};
/* v148: uso único entre aparelhos pela nuvem da loja. eq_u~{convite} só pode ser criado uma vez (regras: quem chega depois não grava por cima):
   quem ativa o link cria o documento; o gestor cria o mesmo documento para cancelar um link ainda não usado. O aparelho novo entra
   anônimo, prova o código da equipe (que veio no link) e lê esse documento e a lista de membros antes de ativar. */
var UID=/^[A-Za-z0-9_-]{1,60}$/,peekC={};
function lim(p,ms){return new Promise(function(res){var t=setTimeout(function(){res(null)},ms);Promise.resolve(p).then(function(v){clearTimeout(t);res(v)},function(){clearTimeout(t);res(null)})})}
function peekOf(code){var k=String(code);if(!peekC[k]){peekC[k]=window.e99Loja&&window.e99Loja.peek?window.e99Loja.peek(code):Promise.reject();peekC[k].catch(function(){delete peekC[k]})}return peekC[k]}
function uDoc(c,id,o){return c.seal('eq_u~'+id,o).then(function(d){return c.L().collection('dados').doc('eq_u~'+id).set({c:'eq',at:Date.now(),st:c.FS.FieldValue.serverTimestamp(),by:c.uid,cuid:c.uid,del:false,v:1,d:d})})}
window.e99InvCheck=async function(inv){if(!inv||!inv.code)return;var id=String(inv.inviteId||''),lg=authLoginName(inv.login||'');if(!UID.test(id))return;
  var c=await lim(peekOf(inv.code),7000);if(!c)return;
  var d=await lim(c.L().collection('dados').doc('eq_u~'+id).get(),5000);
  if(d&&d.exists){var x=d.data()||{},o=await c.unseal('eq_u~'+id,x.d);remote[id]=o&&o.rev?'rev':'used';return}
  var q=await lim(c.L().collection('membros').get(),5000);if(q)q.forEach(function(m){var y=m.data()||{};if(m.id!==c.uid&&((y.inviteId&&y.inviteId===id)||(lg&&typeof y.login==='string'&&authLoginName(y.login)===lg)))remote[id]=remote[id]||'used'})};
function claim(inv,login){try{var id=String(inv.inviteId||'');if(!UID.test(id)||!inv.code)return;lim(peekOf(inv.code),7000).then(function(c){if(c)uDoc(c,id,{login:String(login||inv.login||'').slice(0,80),at:Date.now()}).catch(function(){})})}catch(x){}}
function revKey(){return 'lojasg.estoque99.invite-revoked:'+(authSession?authSession.storeKey:'')}
function revList(){try{var a=JSON.parse(ls(revKey())||'[]');return Array.isArray(a)?a.filter(function(x){return typeof x==='string'}).slice(-100):[]}catch(x){return []}}
function revDone(){try{return JSON.parse(ls(revKey()+':ok')||'[]')||[]}catch(x){return []}}
/* gestor: cancela na nuvem os links ainda não usados (tenta de novo sozinho se estava sem internet) */
function sendRev(){try{if(!authSession||!window.e99CanCreateAccounts||!window.e99CanCreateAccounts())return;var c=window.e99Loja&&window.e99Loja.conn&&window.e99Loja.conn();if(!c)return;var done=revDone();
  revList().filter(function(id){return UID.test(id)&&done.indexOf(id)<0}).forEach(function(id){var ok=function(){var d=revDone();if(d.indexOf(id)<0)d.push(id);ls(revKey()+':ok',JSON.stringify(d.slice(-100)))};uDoc(c,id,{rev:1,at:Date.now()}).then(ok,function(e){if(/permission-denied/.test(e&&e.code||''))ok()})})}catch(x){}}
window.e99InvRevoke=function(id){var a=revList();if(a.indexOf(id)<0)a.push(String(id).slice(0,40));ls(revKey(),JSON.stringify(a.slice(-100)));setTimeout(sendRev,300)};
/* Administração: atalho para criar a conta e o link */
function adminPanel(){if(page!=='admin'||!authSession||authSession.payload.role!=='gestor')return;var v=document.getElementById('view');if(!v||v.querySelector('#acc-create'))return;var t=window.e99Team&&window.e99Team.get();
  var d=document.createElement('div');d.className='panel help';d.id='acc-create';d.innerHTML='<h2>Criar conta e link de acesso</h2><p class="small" style="margin:0">Só você cria contas. Informe nome, login, papel (auxiliar ou estoque) e e-mail: o site gera um link de acesso pessoal. Quem abre o link só ativa essa conta e escolhe a própria senha; o link vale uma vez.</p>'+(t&&t.owner?'<button class="primary" type="button" onclick="e99OpenAccCreate()">Criar conta e link</button>':'<p class="small">Primeiro crie a equipe no Chat (Criar equipe e gerar código).</p><button type="button" onclick="go(\'chat\')">Abrir o Chat</button>');
  var h=v.querySelector('.hero');if(h)h.after(d);else v.prepend(d)}
window.e99OpenAccCreate=function(){go('chat');setTimeout(function(){var b=document.getElementById('aux-box');if(b){b.open=true;b.scrollIntoView({block:'start'});var i=b.querySelector('input[name=name]');if(i)i.focus()}},80)};

/* ================= (B) auxiliar: cria NFs e planos e edita os que criou ================= */
function stampOf(){return {cby:String(myName()).slice(0,60),cdev:String(window.e99SyncDev?window.e99SyncDev():'').slice(0,40),clogin:authSession?String(authSession.record.login).slice(0,80):''}}
function clean0(o){Object.keys(o).forEach(function(k){if(!o[k])delete o[k]});return o}
window.e99Mine=function(x){if(!x||!authSession)return false;var dv=window.e99SyncDev?window.e99SyncDev():'';return !!((x.cdev&&dv&&x.cdev===dv)||(x.clogin&&authLoginName(x.clogin)===authLoginName(authSession.record.login))||(x.cby&&nm(x.cby)===nm(myName())))};
var oe=openEditor;openEditor=function(kind,id){if(kind==='nf'&&id&&aux()){var n=(state.nfs||[]).find(function(x){return x.id===id});if(n&&!window.e99Mine(n)){notify('Você pode editar só as NFs que criou.');return}}return oe.apply(this,arguments)};
var pend=null;
var ed=document.getElementById('editor');if(ed&&typeof ed.onsubmit==='function'){var es0=ed.onsubmit;ed.onsubmit=async function(ev){var k=editing&&editing.kind,id=editing&&editing.id;
  if(k==='nf'){var prev=id?(state.nfs||[]).find(function(x){return x.id===id}):null;if(aux()&&prev&&!window.e99Mine(prev)){ev.preventDefault();notify('Você pode editar só as NFs que criou.');return}
    pend={before:new Set((state.nfs||[]).map(function(x){return x.id})),keep:prev?{cby:prev.cby,cdev:prev.cdev,clogin:prev.clogin}:null,id:id}}
  try{return await es0.call(this,ev)}finally{pend=null}}}
var sv=save;save=async function(){if(pend){var p=pend;pend=null;try{(state.nfs||[]).forEach(function(n){if(p.keep){if(n.id===p.id)['cby','cdev','clogin'].forEach(function(k){if(p.keep[k])n[k]=p.keep[k]})}else if(!p.before.has(n.id)&&!n.cby)Object.assign(n,clean0(stampOf()))})}catch(x){}}return sv.apply(this,arguments)};
var sp=savePlan;savePlan=async function(ev){try{if(planDraft&&authSession){var old=planById(planDraft.id);
    if(!old){if(!planDraft.cby)Object.assign(planDraft,clean0(stampOf()))}
    else if(aux()&&!window.e99Mine(old)){if(ev&&ev.preventDefault)ev.preventDefault();notify('Você pode editar só os planos que criou.');return}
    else ['cby','cdev','clogin'].forEach(function(k){if(old[k])planDraft[k]=old[k];else delete planDraft[k]})}}catch(x){}return sp.apply(this,arguments)};
function auxDeco(){if(!aux()||page!=='plans')return;document.querySelectorAll('#view .plan-card button[onclick^="openPlan(\'"]').forEach(function(b){var m=/openPlan\('([^']+)'\)/.exec(b.getAttribute('onclick')||'');var p=m&&(state.plans||[]).find(function(x){return x.id===m[1]});if(p&&window.e99Mine(p))b.classList.add('e99-own')})}

/* ================= (A) perfil ================= */
var DB='estoque99-perfis',db=null,team={},loadedT='',loadedSk='',draft=null,urls={};
function idbOpen(){if(db)return Promise.resolve(db);return new Promise(function(res,rej){var r=indexedDB.open(DB,1);r.onupgradeneeded=function(){r.result.createObjectStore('p')};r.onsuccess=function(){db=r.result;db.onversionchange=function(){try{db.close()}catch(x){}db=null};res(db)};r.onerror=function(){rej(r.error)}})}
function idb(mode,fn){return idbOpen().then(function(d){return new Promise(function(res,rej){var t=d.transaction('p',mode),st=t.objectStore('p'),out=fn(st);t.oncomplete=function(){res(out&&'result' in out?out.result:out)};t.onerror=function(){rej(t.error)}})})}
async function dbGet(k){try{var v=await idb('readonly',function(st){return st.get(k)});var S=window.e99Seal;if(!v||!S||!S.isSealed(v))return null;return await S.open(v,'perfil|'+k)}catch(x){return null}}
async function dbPut(k,v){try{var S=window.e99Seal;if(!S||!authSession)return;var x=await S.seal(v,'perfil|'+k);await idb('readwrite',function(st){st.put(x,k)})}catch(x){}}
function topic(){var i=window.e99SyncInfo&&window.e99SyncInfo();if(i)return i.topic;try{var t=window.e99Team&&window.e99Team.get();return t?t.topic||'':''}catch(x){return ''}}
var PH=/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;
function cleanRec(r){if(!r||typeof r!=='object')return null;var s=function(v,n){return typeof v==='string'?v.trim().slice(0,n):''};var o={name:s(r.name,40),chat:s(r.chat,40),cargo:s(r.cargo,40),bio:s(r.bio,200),login:s(r.login,80),papel:['auxiliar','estoque','gestor'].indexOf(r.papel)>=0?r.papel:'',photo:typeof r.photo==='string'&&r.photo.length<=120000&&PH.test(r.photo)?r.photo:'',cover:typeof r.cover==='string'&&r.cover.length<=340000&&PH.test(r.cover)?r.cover:'',at:Number(r.at)>0?Math.min(Number(r.at),Date.now()+86400000):0};if(!o.name&&!o.chat)return null;if(!o.name)o.name=o.chat;return o}
async function load(){if(!authSession)return;var sk=authSession.storeKey,t=topic();if(loadedSk===sk&&loadedT===t)return;loadedSk=sk;loadedT=t;team={};if(!t)return;var all=await dbGet('tm|'+t);if(authSession&&authSession.storeKey===sk&&topic()===t&&all&&typeof all==='object'){Object.keys(all).forEach(function(k){if(/^[a-z0-9]{6,40}$/.test(k)){var r=cleanRec(all[k]);if(r)team[k]=r}});refresh()}}
var saveT=0;function persistTeam(){clearTimeout(saveT);saveT=setTimeout(function(){var t=topic();if(t&&authSession)dbPut('tm|'+t,team)},500)}
function mine(){var p=state&&state.perfil;return {name:(p&&p.name)||myName()||'',cargo:p&&p.cargo||'',bio:p&&p.bio||'',photo:p&&p.photo||'',cover:p&&p.cover||'',at:p&&p.at||0}}
function papelOf(){var r=authSession&&authSession.payload.role;return r==='auxiliar'?'auxiliar':r==='gestor'?'gestor':'estoque'}
function papelTxt(p){return p==='auxiliar'?'Auxiliar':p==='gestor'?'Gestor':p==='estoque'?'Estoque':'Equipe'}
function url(d){if(!d)return '';if(urls[d])return urls[d];try{var b=atob(d.split(',')[1]),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);urls[d]=URL.createObjectURL(new Blob([a],{type:'image/jpeg'}))}catch(x){urls[d]=''}return urls[d]}
function initial(n){return e((String(n||'?').trim()[0]||'?').toUpperCase())}
/* ===== v147: UM perfil por pessoa. window.e99Perfil(ref) junta a nuvem perfis_{uid} (v137; desde a v148 a única via) e os perfis antigos guardados neste aparelho
   e é a única leitura usada pelo chat da equipe, conversas, Equipe, mural e página da pessoa. Vale o mais novo (at); empate = nuvem.
   ref: 'me' | uid | 'u:<uid>' | 'd:<aparelho>' | {uid}|{dev}|{login}|{name}. Só visual: nunca dá papel; o chamador passa tudo por esc(). */
function LG(v){try{return authLoginName(String(v||''))}catch(x){return String(v||'').trim().toLowerCase()}}
function socS(){try{return window.e99Social&&window.e99Social.S?window.e99Social.S()||{}:{}}catch(x){return {}}}
function myUid(){try{var c=window.e99Loja&&window.e99Loja.ctx&&window.e99Loja.ctx();if(c&&c.uid)return c.uid;var u=window.e99Cloud&&window.e99Cloud.user&&window.e99Cloud.user();return u&&u.uid||''}catch(x){return ''}}
function cloudRec(uid){var r=socS()['perfis_'+uid];if(!r||r.del||!r.x)return null;var x=r.x;return {uid:String(uid),name:x.name||'',cargo:x.cargo||'',bio:x.bio||'',photo:x.photo||'',cover:x.cover||'',login:x.lg||'',at:Number(x.pat)||Number(r.at)||0}}
function cloudBy(fn){var s=socS(),best=null;for(var k in s){if(k.indexOf('perfis_')!==0)continue;var c=cloudRec(k.slice(7));if(c&&fn(c)&&(!best||c.at>best.at))best=c}return best}
function teamBy(fn){var best=null;Object.keys(team).forEach(function(k){var r=team[k];if(fn(r)&&(!best||r.at>best.r.at))best={dev:k,r:r}});return best}
function mems(){var out=[];try{(window.e99CloudMembers?window.e99CloudMembers():[]).forEach(function(m){if(m)out.push({uid:String(m.uid||''),login:String(m.login||''),name:String(m.nome||'')})})}catch(x){}
  try{var s=window.syncMembers?window.syncMembers():{};Object.keys(s||{}).forEach(function(k){var m=s[k];if(m&&m.name&&m.name!=='?')out.push({uid:'',login:String(m.login||''),name:String(m.name)})})}catch(x){}return out}
function meRec(){var p=mine(),u=myUid();return {me:true,ref:'me',uid:u,dev:'',login:authSession.record.login,name:p.name,cargo:p.cargo,bio:p.bio,photo:p.photo,cover:p.cover,papel:papelOf(),at:p.at,names:[myName()]}}
function parseRef(v){if(v==='me')return {me:true};if(/^d:[a-z0-9]{6,40}$/.test(v))return {dev:v.slice(2)};if(/^u:[A-Za-z0-9]{1,128}$/.test(v))return {uid:v.slice(2)};if(/^[A-Za-z0-9]{1,128}$/.test(v))return {uid:v};return {}}
window.e99Perfil=function(ref){if(typeof authSession==='undefined'||!authSession)return null;var o=typeof ref==='string'?parseRef(ref):(ref&&typeof ref==='object'?ref:{});
  var myL=LG(authSession.record.login),mu=myUid(),n=o.name?nm(o.name):'';
  if(o.me||(o.uid&&o.uid===mu)||(o.login&&LG(o.login)===myL)||(n&&(n===nm(myName())||n===nm(mine().name))))return meRec();
  var c=null,t=null,lg='',uid=typeof o.uid==='string'?o.uid:'',m;
  if(uid){c=cloudRec(uid);lg=c?LG(c.login):'';if(!lg){m=mems().filter(function(x){return x.uid===uid&&x.login})[0];lg=m?LG(m.login):''}}
  else if(typeof o.dev==='string'){if(team[o.dev]){t={dev:o.dev,r:team[o.dev]};lg=LG(t.r.login)}}
  else if(o.login)lg=LG(o.login);
  else if(n){t=teamBy(function(r){return nm(r.chat)===n||nm(r.name)===n});lg=t?LG(t.r.login):'';if(!lg){m=mems().filter(function(x){return x.login&&nm(x.name)===n})[0];lg=m?LG(m.login):''}}
  else return null;
  if(lg){if(lg===myL)return meRec();var c2=cloudBy(function(x){return LG(x.login)===lg});if(c2&&(!c||c2.at>c.at)){if(!uid)uid=c2.uid;c=c2}var t2=teamBy(function(r){return LG(r.login)===lg});if(t2&&(!t||t2.r.at>t.r.at))t=t2}
  else if(!c&&t){c=cloudBy(function(x){return !x.login&&(nm(x.name)===nm(t.r.name)||nm(x.name)===nm(t.r.chat))})}
  else if(!c&&!t&&n){c=cloudBy(function(x){return nm(x.name)===n})}
  if(!c&&!t)return null;if(c&&!uid)uid=c.uid;
  var b=t&&t.r,nw=(b&&(!c||b.at>c.at))?b:c,od=nw===c?b:c;
  return {me:false,ref:uid?'u:'+uid:'d:'+t.dev,uid:uid,dev:t?t.dev:'',login:(c&&c.login)||(b&&b.login)||'',name:nw.name||(od&&od.name)||'',cargo:nw.cargo||'',bio:nw.bio||'',photo:nw.photo||'',cover:nw.cover||(od&&od.cover)||'',papel:b&&b.papel||'',at:nw.at||0,names:b&&b.chat?[b.chat]:[]}};
/* todas as pessoas (sem mim), uma entrada por pessoa */
window.e99PerfilAll=function(){if(typeof authSession==='undefined'||!authSession)return [];var out=[],seen={},s=socS(),ids=[];
  function add(p){if(!p||p.me||!p.name)return;var k=p.login?'l:'+LG(p.login):p.ref;if(seen[k])return;seen[k]=1;out.push(p)}
  for(var k in s){if(k.indexOf('perfis_')===0&&s[k]&&!s[k].del&&s[k].x)ids.push([k.slice(7),Number(s[k].x.pat)||Number(s[k].at)||0])}
  ids.sort(function(a,b){return b[1]-a[1]}).forEach(function(i){add(window.e99Perfil({uid:i[0]}))});Object.keys(team).forEach(function(d){add(window.e99Perfil({dev:d}))});
  return out.sort(function(a,b){return nm(a.name)<nm(b.name)?-1:1})};
function avatar(p,name,cls){var u=p&&p.photo?url(p.photo):'';if(u)return '<img class="av '+(cls||'')+'" src="'+e(u)+'" alt="" decoding="async">';return '<span class="av '+(cls||'')+'" aria-hidden="true">'+initial(p&&p.name||name)+'</span>'}
window.profAvatar=function(name,cls){return avatar(window.e99Perfil({name:name}),name,cls)};
window.profChip=function(name){var p=window.e99Perfil({name:name}),show=p&&p.name||name;return '<button type="button" class="who prof-chip" data-ref="'+e(p?p.ref:'')+'" data-name="'+e(name)+'" aria-label="Ver perfil de '+e(show)+'">'+avatar(p,name,'av-s')+'<span>'+e(show)+'</span></button>'};
document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button.prof-chip,button.e99-prof-open');if(!b)return;ev.preventDefault();ev.stopPropagation();var k=b.getAttribute('data-ref')||'';if(!k){var p=window.e99Perfil({name:b.getAttribute('data-name')});k=p?p.ref:''}if(!k){notify('Essa pessoa ainda não tem perfil na equipe.');return}window.openProfile(k)},true);
/* 'me' sem mais nada = editor do meu perfil; qualquer outra pessoa = a página única (rota pessoa) */
window.openProfile=function(k){if(typeof k==='string'&&k!=='me'&&window.e99Pessoa){var p=window.e99Perfil(k);if(p&&!p.me){window.e99Pessoa(p.ref);return}}draft=null;go('profile')};
window.e99ProfilesAll=function(){if(!authSession)return [];var me=mine(),out=[{key:'me',p:{name:me.name,user:'',cargo:me.cargo,names:[myName()]},role:authSession.payload.role,me:true}];
  window.e99PerfilAll().forEach(function(p){out.push({key:p.ref,p:{name:p.name,user:'',cargo:p.cargo,names:p.names.filter(function(x){return x!==p.name})},login:p.login,role:p.papel==='auxiliar'?'auxiliar':'gestor'})});return out};
/* v148: o perfil vai para a equipe só pela nuvem (perfis_{uid}, v137.js) */
window.e99PerfilPublish=function(){try{if(window.e99Social&&window.e99Social.pushPerfil)window.e99Social.pushPerfil(true)}catch(x){}};
function publish(){window.e99PerfilPublish()}
var refT=0;function refresh(){clearTimeout(refT);refT=setTimeout(function(){if(!authSession)return;
    if(page==='profile'||page==='team'||page==='pessoa'){var a=document.activeElement,busy=a&&a.closest&&(a.closest('#pf-form')||(a.closest('#sc-mural form,#st-new')&&a.value));if(!busy&&!document.getElementById('st-view')){var y=scrollY;render();scrollTo(0,y)}}
    try{dispatchEvent(new Event('e99:perfil'))}catch(x){}
    document.querySelectorAll('#view .chat-msg button.prof-chip').forEach(function(b){var n=b.getAttribute('data-name');var r=window.e99Perfil({name:n});b.setAttribute('data-ref',r?r.ref:'');var av=b.querySelector('.av');if(av){var t=document.createElement('span');t.innerHTML=avatar(r,n,'av-s');av.replaceWith(t.firstChild)}var sp=b.querySelector('span:last-child');if(sp&&r&&r.name&&sp.textContent!==r.name){sp.textContent=r.name;b.setAttribute('aria-label','Ver perfil de '+r.name)}})},400)}
/* a nuvem (v137) avisa quando chega perfil novo: os chips do chat e as telas usam a mesma leitura */
addEventListener('e99:perfil-nuvem',function(){refresh()});
/* tela */
function viewHTML(r){var p=r.p,me=!!r.me;return '<div class="pf-head">'+(p.photo?'<img class="pf-av" src="'+e(url(p.photo))+'" alt="Foto de '+e(p.name)+'">':'<span class="pf-av" aria-hidden="true">'+initial(p.name)+'</span>')+'<div><h2>'+e(p.name)+'</h2><div class="small">'+(r.login?'@'+e(r.login)+' · ':'')+e(papelTxt(r.papel))+(p.cargo?' · '+e(p.cargo):'')+'</div></div></div>'+(p.bio?'<p class="pf-bio">'+e(p.bio)+'</p>':'')}
function teamList(){var l=window.e99PerfilAll();if(!l.length)return '<p class="small">'+(topic()?'Os perfis da equipe aparecem aqui quando os colegas abrem o app.':'Para ver os perfis da equipe, entre numa equipe no Chat com a sincronização ligada.')+'</p>';
  return '<div class="pf-list">'+l.map(function(r){return '<button type="button" class="e99-prof-open" data-ref="'+e(r.ref)+'">'+avatar(r,r.name,'')+'<span><b>'+e(r.name)+'</b><br><span class="small">'+e(r.cargo||papelTxt(r.papel))+'</span></span></button>'}).join('')+'</div>'}
/* v147: esta tela é só o EDITOR do meu perfil. Ver um perfil (o meu ou o de um colega) é sempre a página única da rota "pessoa". */
function render0(){if(!authSession)return '';load();
  var m=mine();if(!draft)draft={name:m.name,cargo:m.cargo,bio:m.bio,photo:m.photo};
  return hero('Perfil','')+'<div class="panel pf-page" id="pf-me">'+viewHTML({p:{name:draft.name||m.name,cargo:draft.cargo,bio:'',photo:draft.photo},me:true,login:authSession.record.login,papel:papelOf()})
   +'<form id="pf-form" class="pf-form" onsubmit="e99PerfilSave(event)"><div class="pf-photo"><label class="as-file">Foto (opcional)<input type="file" id="pf-photo-in" accept="image/*" onchange="e99PerfilPhoto(this)"></label>'+(draft.photo?'<button type="button" id="pf-photo-rm" onclick="e99PerfilPhotoRm()">Tirar foto</button>':'')+'</div>'
   +'<label>Nome de exibição<input name="name" id="pf-name" required maxlength="40" autocomplete="name" value="'+e(draft.name)+'" oninput="e99PerfilDraft(this)"></label>'
   +'<label>Cargo<input name="cargo" id="pf-cargo" maxlength="40" value="'+e(draft.cargo)+'" oninput="e99PerfilDraft(this)" placeholder="ex.: Auxiliar de estoque"></label>'
   +'<label>Sobre<textarea name="bio" id="pf-bio" maxlength="200" oninput="e99PerfilDraft(this)" placeholder="Uma frase curta sobre você">'+e(draft.bio)+'</textarea></label>'
   +'<div class="toolbar"><button class="primary" type="submit">Salvar perfil</button>'+(window.e99Pessoa?'<button type="button" id="pf-see" onclick="e99Pessoa(\'me\')">Ver meu perfil</button>':'')+'</div></form><p class="small" style="margin:0">Este é o seu único perfil: o mesmo nome, foto e cargo aparecem no chat, nas conversas, na Equipe e no mural. Não muda o que você pode fazer no app.</p></div>'
   +'<div class="panel help"><h2>Perfis da equipe</h2>'+teamList()+'</div>'}
window.extraPages=window.extraPages||{};window.extraPages.profile=render0;
window.e99PerfilDraft=function(inp){if(!draft)return;draft[inp.name]=String(inp.value||'')};
function shrink(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),img=new Image();img.onload=function(){try{var S=240,c=document.createElement('canvas');c.width=S;c.height=S;var w=img.naturalWidth,h=img.naturalHeight,s=Math.min(w,h);if(!s)throw Error('vazia');c.getContext('2d').drawImage(img,(w-s)/2,(h-s)/2,s,s,0,0,S,S);var q=.84,d=c.toDataURL('image/jpeg',q);while(d.length>110000&&q>.4){q-=.12;d=c.toDataURL('image/jpeg',q)}URL.revokeObjectURL(u);if(!PH.test(d)||d.length>120000)throw Error('grande');res(d)}catch(x){URL.revokeObjectURL(u);rej(x)}};img.onerror=function(){URL.revokeObjectURL(u);rej(Error('img'))};img.src=u})}
window.e99PerfilPhoto=async function(inp){var f=inp&&inp.files&&inp.files[0];if(!f)return;if(!/^image\//.test(f.type||'')||f.size>15e6){notify('Escolha uma imagem (até 15 MB).');return}try{var d=await shrink(f);if(!draft)draft=mine();draft.photo=d;render();notify('Foto pronta. Toque em Salvar perfil.')}catch(x){notify('Não foi possível ler essa foto.')}};
window.e99PerfilPhotoRm=function(){if(!draft)draft=mine();draft.photo='';render()};
window.e99PerfilSave=async function(ev){if(ev)ev.preventDefault();if(!authSession)return;var f=document.getElementById('pf-form');if(f){['name','cargo','bio'].forEach(function(k){if(f.elements[k])draft[k]=String(f.elements[k].value||'')})}
  var p=validatePerfil({name:draft.name,cargo:draft.cargo,bio:draft.bio,photo:draft.photo,cover:state.perfil&&state.perfil.cover||'',at:Date.now()});if(!p||!p.name){notify('Informe o nome de exibição.');return}state.perfil=p;draft=null;await save();publish(true);render();notify(storageOK?'Perfil salvo.':'Perfil em memória. Exporte uma cópia protegida.')};
function teamDeco(){if(page!=='team')return;document.querySelectorAll('#view .cards .card').forEach(function(c){if(c.querySelector('.e99-prof-open'))return;var h=c.querySelector('h3');if(!h)return;var n=(h.firstChild&&h.firstChild.nodeType===3?h.firstChild.textContent:h.textContent).trim();if(n==='TODOS')return;var r=window.e99Perfil({name:n});if(!r)return;
  var av=c.querySelector('.avatar');if(av&&r.photo){var u=url(r.photo);if(u)av.innerHTML='<img src="'+e(u)+'" alt="">'}
  var b=document.createElement('button');b.type='button';b.className='e99-prof-open';b.setAttribute('data-ref',r.ref);b.textContent='Ver perfil';c.appendChild(b)})}
/* menu */
function label(){if(!authSession)return;if(!labels.profile){var acc=labels.account,ai=icons.account;if(acc){delete labels.account;delete icons.account}labels.profile='Perfil';icons.profile='☺';if(acc){labels.account=acc;icons.account=ai}}}
var r0=render;render=function(){if(authSession)label();if(page!=='profile')draft=null;var r=r0.apply(this,arguments);try{if(authSession){auxDeco();teamDeco();adminPanel()}}catch(x){}return r};
var en0=authEnter;authEnter=function(){var r=en0.apply(this,arguments);try{label();loadedSk='';loadedT='';team={};draft=null;load();try{render()}catch(x){}}catch(x){}return r};
var lo0=authLogout;authLogout=async function(){var r=await lo0.apply(this,arguments);if(!authSession){team={};loadedSk='';loadedT='';draft=null;try{delete labels.profile;delete icons.profile}catch(x){}}return r};
setInterval(function(){if(!authSession||document.hidden)return;load();sendRev()},15000);
if(typeof authSession!=='undefined'&&authSession){label();load()}
})();
