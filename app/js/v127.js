
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
window.e99InvMark=function(inv,login){if(!inv||!inv.inviteId)return;var m=usedMap();m[String(inv.inviteId).slice(0,40)]={login:String(login||inv.login||'').slice(0,80),at:Date.now()};var ks=Object.keys(m);if(ks.length>200)ks.slice(0,ks.length-200).forEach(function(k){delete m[k]});ls(USED,JSON.stringify(m))};
window.e99InvUsed=function(inv){if(!inv)return '';var id=String(inv.inviteId||''),lg=authLoginName(inv.login||''),u=id?usedMap()[id]:null;
  var here=u||(lg&&authAccounts().some(function(a){return authLoginName(a.login)===lg}));
  if(here)return 'Este link de acesso já foi usado neste aparelho (conta @'+(u&&u.login||lg)+'). Entre com o seu login e a senha que você escolheu. Esqueceu? Use "Esqueci a senha".';
  if(id&&remote[id]==='rev')return 'Este link de acesso foi cancelado pelo gestor. Peça um novo link ao gestor.';
  if(id&&remote[id]==='used')return 'Este link de acesso já foi ativado em outro aparelho. Entre com o seu login e senha (ou traga a sua conta da nuvem). Se não foi você, avise o gestor.';
  return ''};
window.e99InvCheck=async function(inv){if(!inv||!inv.code||!window.e99SyncPeek)return;var id=String(inv.inviteId||''),lg=authLoginName(inv.login||'');var l=[];try{l=await window.e99SyncPeek(inv.code,3500)}catch(x){}
  l.forEach(function(o){if(!o||typeof o!=='object')return;
    if(o.k==='member'&&((id&&o.inviteId===id&&o.event==='created')||(lg&&typeof o.login==='string'&&authLoginName(o.login)===lg)))remote[id]=remote[id]||'used';
    if(o.k==='invused'&&o.r!=='auxiliar'&&id){if(Array.isArray(o.rev)&&o.rev.indexOf(id)>=0)remote[id]='rev';else if(Array.isArray(o.ids)&&o.ids.indexOf(id)>=0&&remote[id]!=='rev')remote[id]='used'}})};
/* gestor: avisa a equipe quais links já foram ativados ou cancelados (o ntfy guarda 12 h; repete de tempos em tempos) */
function invList(){if(!authSession)return [];try{return JSON.parse(localStorage.getItem('lojasg.estoque99.aux-invites:'+authSession.storeKey)||'[]')||[]}catch(x){return []}}
function revKey(){return 'lojasg.estoque99.invite-revoked:'+(authSession?authSession.storeKey:'')}
function revList(){try{var a=JSON.parse(ls(revKey())||'[]');return Array.isArray(a)?a.filter(function(x){return typeof x==='string'}).slice(-100):[]}catch(x){return []}}
var invAt=0;
function sendInvused(force){try{if(!window.e99CanCreateAccounts()||!window.e99SyncInfo||!window.e99SyncInfo()||!window.e99SyncSend)return;if(!force&&Date.now()-invAt<3*3600000)return;
  var mem=window.syncMembers?window.syncMembers():{},ms=Object.keys(mem).map(function(k){return mem[k]});
  var used=invList().filter(function(x){return x&&x.inviteId&&ms.some(function(m){return m&&(m.inviteId===x.inviteId||(m.login&&x.login&&authLoginName(m.login)===authLoginName(x.login)))})}).map(function(x){return String(x.inviteId)}).slice(0,100),rev=revList();
  if(!used.length&&!rev.length)return;invAt=Date.now();window.e99SyncSend('invused',{ids:used,rev:rev})}catch(x){}}
window.e99InvRevoke=function(id){var a=revList();if(a.indexOf(id)<0)a.push(String(id).slice(0,40));ls(revKey(),JSON.stringify(a.slice(-100)));setTimeout(function(){sendInvused(true)},300)};
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
var DB='estoque99-perfis',db=null,team={},loadedT='',loadedSk='',view='me',draft=null,urls={};
function idbOpen(){if(db)return Promise.resolve(db);return new Promise(function(res,rej){var r=indexedDB.open(DB,1);r.onupgradeneeded=function(){r.result.createObjectStore('p')};r.onsuccess=function(){db=r.result;db.onversionchange=function(){try{db.close()}catch(x){}db=null};res(db)};r.onerror=function(){rej(r.error)}})}
function idb(mode,fn){return idbOpen().then(function(d){return new Promise(function(res,rej){var t=d.transaction('p',mode),st=t.objectStore('p'),out=fn(st);t.oncomplete=function(){res(out&&'result' in out?out.result:out)};t.onerror=function(){rej(t.error)}})})}
async function dbGet(k){try{var v=await idb('readonly',function(st){return st.get(k)});var S=window.e99Seal;if(!v||!S||!S.isSealed(v))return null;return await S.open(v,'perfil|'+k)}catch(x){return null}}
async function dbPut(k,v){try{var S=window.e99Seal;if(!S||!authSession)return;var x=await S.seal(v,'perfil|'+k);await idb('readwrite',function(st){st.put(x,k)})}catch(x){}}
function topic(){var i=window.e99SyncInfo&&window.e99SyncInfo();if(i)return i.topic;try{var t=window.e99Team&&window.e99Team.get();return t?t.topic||'':''}catch(x){return ''}}
var PH=/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;
function cleanRec(r){if(!r||typeof r!=='object')return null;var s=function(v,n){return typeof v==='string'?v.trim().slice(0,n):''};var o={name:s(r.name,40),chat:s(r.chat,40),cargo:s(r.cargo,40),bio:s(r.bio,200),login:s(r.login,80),papel:['auxiliar','estoque','gestor'].indexOf(r.papel)>=0?r.papel:'',photo:typeof r.photo==='string'&&r.photo.length<=120000&&PH.test(r.photo)?r.photo:'',at:Number(r.at)>0?Math.min(Number(r.at),Date.now()+86400000):0};if(!o.name&&!o.chat)return null;if(!o.name)o.name=o.chat;return o}
async function load(){if(!authSession)return;var sk=authSession.storeKey,t=topic();if(loadedSk===sk&&loadedT===t)return;loadedSk=sk;loadedT=t;team={};if(!t)return;var all=await dbGet('tm|'+t);if(authSession&&authSession.storeKey===sk&&topic()===t&&all&&typeof all==='object'){Object.keys(all).forEach(function(k){if(/^[a-z0-9]{6,40}$/.test(k)){var r=cleanRec(all[k]);if(r)team[k]=r}});refresh()}}
var saveT=0;function persistTeam(){clearTimeout(saveT);saveT=setTimeout(function(){var t=topic();if(t&&authSession)dbPut('tm|'+t,team)},500)}
function mine(){var p=state&&state.perfil;return {name:(p&&p.name)||myName()||'',cargo:p&&p.cargo||'',bio:p&&p.bio||'',photo:p&&p.photo||'',at:p&&p.at||0}}
function papelOf(){var r=authSession&&authSession.payload.role;return r==='auxiliar'?'auxiliar':r==='gestor'?'gestor':'estoque'}
function papelTxt(p){return p==='auxiliar'?'Auxiliar':p==='gestor'?'Gestor':p==='estoque'?'Estoque':'Equipe'}
function url(d){if(!d)return '';if(urls[d])return urls[d];try{var b=atob(d.split(',')[1]),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);urls[d]=URL.createObjectURL(new Blob([a],{type:'image/jpeg'}))}catch(x){urls[d]=''}return urls[d]}
function find(name){var n=nm(name);if(!n||!authSession)return null;var me=mine();if(n===nm(myName())||n===nm(me.name))return {key:'me',p:me,me:true};
  var ks=Object.keys(team);for(var i=0;i<ks.length;i++){var r=team[ks[i]];if(nm(r.chat)===n||nm(r.name)===n)return {key:ks[i],p:r}}return null}
function initial(n){return e((String(n||'?').trim()[0]||'?').toUpperCase())}
function avatar(rec,name,cls){var p=rec&&rec.p;var u=p&&p.photo?url(p.photo):'';if(u)return '<img class="av '+(cls||'')+'" src="'+e(u)+'" alt="" decoding="async">';return '<span class="av '+(cls||'')+'" aria-hidden="true">'+initial(p&&p.name||name)+'</span>'}
window.profAvatar=function(name,cls){return avatar(find(name),name,cls)};
window.profChip=function(name){var r=find(name);return '<button type="button" class="who prof-chip" data-prof="'+e(r?r.key:'')+'" data-name="'+e(name)+'" aria-label="Ver perfil de '+e(name)+'">'+avatar(r,name,'av-s')+'<span>'+e(name)+'</span></button>'};
document.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('button.prof-chip,button.e99-prof-open');if(!b)return;ev.preventDefault();ev.stopPropagation();var k=b.getAttribute('data-prof')||'';if(!k){var r=find(b.getAttribute('data-name'));k=r?r.key:''}if(!k){notify('Essa pessoa ainda não mandou o perfil para a equipe.');return}window.openProfile(k)},true);
window.openProfile=function(k){view=typeof k==='string'&&(k==='me'||team[k])?k:'me';draft=null;go('profile')};
window.e99ProfilesAll=function(){if(!authSession)return [];var me=mine(),out=[{key:'me',p:{name:me.name,user:'',cargo:me.cargo,names:[myName()]},role:authSession.payload.role,me:true}];
  Object.keys(team).forEach(function(k){var r=team[k];out.push({key:k,p:{name:r.name,user:'',cargo:r.cargo,names:r.chat&&r.chat!==r.name?[r.chat]:[]},login:r.login,role:r.papel==='auxiliar'?'auxiliar':'gestor'})});return out};
/* envio para a equipe */
function pubKey(){return 'lojasg.estoque99.perfil-pub:'+(authSession?authSession.storeKey:'')}
function lastPub(t){try{return (JSON.parse(ls(pubKey())||'{}')||{})[t]||0}catch(x){return 0}}
var pubT=0,pubBusy=false;
function publish(force){clearTimeout(pubT);pubT=setTimeout(async function(){var i=window.e99SyncInfo&&window.e99SyncInfo();if(!i||!authSession||!window.e99SyncSend||pubBusy)return;if(!force&&Date.now()-lastPub(i.topic)<2.5*3600000)return;pubBusy=true;
  try{var p=mine();var ok=await window.e99SyncSend('perfil',{pat:p.at||1,login:String(authSession.record.login).slice(0,80),papel:papelOf(),ph:p.photo?1:0,pt:{name:p.name,cargo:p.cargo,bio:p.bio}},p.photo?{photo:p.photo}:null);
    if(ok){var o={};try{o=JSON.parse(ls(pubKey())||'{}')||{}}catch(x){}o[i.topic]=Date.now();ls(pubKey(),JSON.stringify(o))}}finally{pubBusy=false}},force?400:1500+Math.random()*3000)}
window.e99OnPerfil=async function(o,who,getBody,t){if(!authSession||!o||typeof o.dev!=='string'||!/^[a-z0-9]{6,40}$/.test(o.dev))return;await load();if(t!==topic())return;
  if(typeof o.login==='string'&&authLoginName(o.login)===authLoginName(authSession.record.login))return;
  var pt=o.pt&&typeof o.pt==='object'?o.pt:{},cur=team[o.dev],at=Number(o.pat)||0;if(cur&&cur.at>at)return;if(cur&&cur.at===at&&(cur.photo||!o.ph))return;
  var body=null;try{body=await getBody()}catch(x){}
  var r=cleanRec({name:pt.name,chat:who,cargo:pt.cargo,bio:pt.bio,login:o.login,papel:o.papel,photo:body&&body.photo||'',at:at});if(!r)return;if(!r.photo&&cur&&cur.photo&&o.ph)r.photo=cur.photo;
  team[o.dev]=r;persistTeam();refresh()};
var helloPrev=window.e99OnHello;window.e99OnHello=function(){try{if(helloPrev)helloPrev.apply(this,arguments)}catch(x){}var i=window.e99SyncInfo&&window.e99SyncInfo();if(i&&Date.now()-lastPub(i.topic)>2*60000)publish(true);sendInvused(false)};
var refT=0;function refresh(){clearTimeout(refT);refT=setTimeout(function(){if(!authSession)return;
    if(page==='profile'||page==='team'){var a=document.activeElement;if(!(a&&a.closest&&a.closest('#pf-form')))render()}
    document.querySelectorAll('#view .chat-msg button.prof-chip').forEach(function(b){var n=b.getAttribute('data-name');var r=find(n);b.setAttribute('data-prof',r?r.key:'');var av=b.querySelector('.av');if(av){var t=document.createElement('span');t.innerHTML=avatar(r,n,'av-s');av.replaceWith(t.firstChild)}})},400)}
/* tela */
function viewHTML(r){var p=r.p,me=!!r.me;return '<div class="pf-head">'+(p.photo?'<img class="pf-av" src="'+e(url(p.photo))+'" alt="Foto de '+e(p.name)+'">':'<span class="pf-av" aria-hidden="true">'+initial(p.name)+'</span>')+'<div><h2>'+e(p.name)+'</h2><div class="small">'+(r.login?'@'+e(r.login)+' · ':'')+e(papelTxt(r.papel))+(p.cargo?' · '+e(p.cargo):'')+'</div></div></div>'+(p.bio?'<p class="pf-bio">'+e(p.bio)+'</p>':'')}
function teamList(){var ks=Object.keys(team).sort(function(a,b){return nm(team[a].name)<nm(team[b].name)?-1:1});if(!ks.length)return '<p class="small">'+(topic()?'Os perfis da equipe aparecem aqui quando os colegas abrem o app.':'Para ver os perfis da equipe, entre numa equipe no Chat com a sincronização ligada.')+'</p>';
  return '<div class="pf-list">'+ks.map(function(k){var r=team[k];return '<button type="button" class="e99-prof-open" data-prof="'+e(k)+'">'+avatar({p:r},r.name,'')+'<span><b>'+e(r.name)+'</b><br><span class="small">'+e(r.cargo||papelTxt(r.papel))+'</span></span></button>'}).join('')+'</div>'}
function render0(){if(!authSession)return '';load();
  if(view!=='me'&&team[view]){var r=team[view];return hero('Perfil','')+'<div class="panel pf-page" id="pf-view">'+viewHTML({p:r,login:r.login,papel:r.papel})+'<p class="small" style="margin:0">Perfil enviado pela equipe. Só leitura; não muda o que a pessoa pode fazer no app.</p><div class="toolbar"><button type="button" onclick="openProfile(\'me\')">Meu perfil</button></div></div>'}
  view='me';var m=mine();if(!draft)draft={name:m.name,cargo:m.cargo,bio:m.bio,photo:m.photo};
  return hero('Perfil','')+'<div class="panel pf-page" id="pf-me">'+viewHTML({p:{name:draft.name||m.name,cargo:draft.cargo,bio:'',photo:draft.photo},me:true,login:authSession.record.login,papel:papelOf()})
   +'<form id="pf-form" class="pf-form" onsubmit="e99PerfilSave(event)"><div class="pf-photo"><label class="as-file">Foto (opcional)<input type="file" id="pf-photo-in" accept="image/*" onchange="e99PerfilPhoto(this)"></label>'+(draft.photo?'<button type="button" id="pf-photo-rm" onclick="e99PerfilPhotoRm()">Tirar foto</button>':'')+'</div>'
   +'<label>Nome de exibição<input name="name" id="pf-name" required maxlength="40" autocomplete="name" value="'+e(draft.name)+'" oninput="e99PerfilDraft(this)"></label>'
   +'<label>Cargo<input name="cargo" id="pf-cargo" maxlength="40" value="'+e(draft.cargo)+'" oninput="e99PerfilDraft(this)" placeholder="ex.: Auxiliar de estoque"></label>'
   +'<label>Sobre<textarea name="bio" id="pf-bio" maxlength="200" oninput="e99PerfilDraft(this)" placeholder="Uma frase curta sobre você">'+e(draft.bio)+'</textarea></label>'
   +'<button class="primary" type="submit">Salvar perfil</button></form><p class="small" style="margin:0">A foto fica pequena e cifrada neste aparelho. O perfil vai para a sua equipe (chat e Equipe) pelo canal cifrado. Não muda o que você pode fazer no app.</p></div>'
   +'<div class="panel help"><h2>Perfis da equipe</h2>'+teamList()+'</div>'}
window.extraPages=window.extraPages||{};window.extraPages.profile=render0;
window.e99PerfilDraft=function(inp){if(!draft)return;draft[inp.name]=String(inp.value||'')};
function shrink(file){return new Promise(function(res,rej){var u=URL.createObjectURL(file),img=new Image();img.onload=function(){try{var S=240,c=document.createElement('canvas');c.width=S;c.height=S;var w=img.naturalWidth,h=img.naturalHeight,s=Math.min(w,h);if(!s)throw Error('vazia');c.getContext('2d').drawImage(img,(w-s)/2,(h-s)/2,s,s,0,0,S,S);var q=.84,d=c.toDataURL('image/jpeg',q);while(d.length>110000&&q>.4){q-=.12;d=c.toDataURL('image/jpeg',q)}URL.revokeObjectURL(u);if(!PH.test(d)||d.length>120000)throw Error('grande');res(d)}catch(x){URL.revokeObjectURL(u);rej(x)}};img.onerror=function(){URL.revokeObjectURL(u);rej(Error('img'))};img.src=u})}
window.e99PerfilPhoto=async function(inp){var f=inp&&inp.files&&inp.files[0];if(!f)return;if(!/^image\//.test(f.type||'')||f.size>15e6){notify('Escolha uma imagem (até 15 MB).');return}try{var d=await shrink(f);if(!draft)draft=mine();draft.photo=d;render();notify('Foto pronta. Toque em Salvar perfil.')}catch(x){notify('Não foi possível ler essa foto.')}};
window.e99PerfilPhotoRm=function(){if(!draft)draft=mine();draft.photo='';render()};
window.e99PerfilSave=async function(ev){if(ev)ev.preventDefault();if(!authSession)return;var f=document.getElementById('pf-form');if(f){['name','cargo','bio'].forEach(function(k){if(f.elements[k])draft[k]=String(f.elements[k].value||'')})}
  var p=validatePerfil({name:draft.name,cargo:draft.cargo,bio:draft.bio,photo:draft.photo,at:Date.now()});if(!p||!p.name){notify('Informe o nome de exibição.');return}state.perfil=p;draft=null;await save();publish(true);render();notify(storageOK?'Perfil salvo.':'Perfil em memória. Exporte uma cópia protegida.')};
function teamDeco(){if(page!=='team')return;document.querySelectorAll('#view .cards .card').forEach(function(c){if(c.querySelector('.e99-prof-open'))return;var h=c.querySelector('h3');if(!h)return;var n=(h.firstChild&&h.firstChild.nodeType===3?h.firstChild.textContent:h.textContent).trim();if(n==='TODOS')return;var r=find(n);if(!r)return;
  var av=c.querySelector('.avatar');if(av&&r.p.photo){var u=url(r.p.photo);if(u)av.innerHTML='<img src="'+e(u)+'" alt="">'}
  var b=document.createElement('button');b.type='button';b.className='e99-prof-open';b.setAttribute('data-prof',r.key);b.textContent='Ver perfil';c.appendChild(b)})}
/* menu */
function label(){if(!authSession)return;if(!labels.profile){var acc=labels.account,ai=icons.account;if(acc){delete labels.account;delete icons.account}labels.profile='Perfil';icons.profile='☺';if(acc){labels.account=acc;icons.account=ai}}}
var r0=render;render=function(){if(authSession)label();if(page!=='profile')draft=null;var r=r0.apply(this,arguments);try{if(authSession){auxDeco();teamDeco();adminPanel()}}catch(x){}return r};
var en0=authEnter;authEnter=function(){var r=en0.apply(this,arguments);try{label();loadedSk='';loadedT='';team={};view='me';draft=null;load();try{render()}catch(x){}}catch(x){}return r};
var lo0=authLogout;authLogout=async function(){var r=await lo0.apply(this,arguments);if(!authSession){team={};loadedSk='';loadedT='';draft=null;try{delete labels.profile;delete icons.profile}catch(x){}}return r};
setInterval(function(){if(!authSession||document.hidden)return;load();var i=window.e99SyncInfo&&window.e99SyncInfo();if(i&&Date.now()-lastPub(i.topic)>2.5*3600000)publish(false);sendInvused(false)},15000);
if(typeof authSession!=='undefined'&&authSession){label();load()}
})();
