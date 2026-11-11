
(function(){
'use strict';
/* Nuvem (Firebase): cada pessoa entra com o próprio e-mail.
   - A senha da nuvem é gerada a partir do login + senha do app (v110: authCloudDerive — senha antiga de números = fórmula antiga; senha forte = PBKDF2).
   - usuarios/{uid}: dados particulares (e-mail) — só o dono lê.
   - lojas/{loja}/membros/{uid}: status na loja (sem e-mail) — a equipe lê.
   - correio/{id}: resumos que o robô (tarefa agendada) envia por e-mail. */
var FB={apiKey:"AIzaSyBy72TCofmFQGsaiC72TWKkwT8fsMXfxLI",authDomain:"gen-lang-client-0167474823.firebaseapp.com",projectId:"gen-lang-client-0167474823",storageBucket:"gen-lang-client-0167474823.firebasestorage.app",messagingSenderId:"1025566705857",appId:"1:1025566705857:web:66be4b316f327de3c42c40"};
var FBV='10.14.1',appP=null,stash=null,linkBusy=false,linkErr='',linkSoft=false,memUnsub=null,memSid='',cloudMem={},lastVisto=0;
var EMAIL_RE=/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(x){return null}}
function js(u){return new Promise(function(res,rej){var x=document.createElement('script');x.src=u;x.onload=res;x.onerror=rej;document.head.appendChild(x)})}
function pre(u){return new Promise(function(res){var l=document.createElement('link');l.rel='preload';l.as='script';l.href=u;l.onload=res;l.onerror=res;document.head.appendChild(l)})}
async function sha(t){var h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.from(new Uint8Array(h)).map(function(b){return b.toString(16).padStart(2,'0')}).join('')}
function load(){if(appP)return appP;appP=(async function(){var b='https://www.gstatic.com/firebasejs/'+FBV+'/';if(!window.firebase||!firebase.auth){/* v90: os três arquivos baixam juntos e rodam na ordem */await Promise.all([js(b+'firebase-app-compat.js'),pre(b+'firebase-auth-compat.js'),pre(b+'firebase-firestore-compat.js')]);await Promise.all([js(b+'firebase-auth-compat.js'),js(b+'firebase-firestore-compat.js')])}
  var app=firebase.apps.length?firebase.app():firebase.initializeApp(FB);var auth=app.auth(),db=app.firestore();auth.languageCode='pt-BR';
  /* testes automáticos: emulador local (só quando o teste liga esta chave) */
  var emu=ls('e99-fb-emu');if(emu&&!load.emu){load.emu=1;var p=emu.split('|');auth.useEmulator('http://'+p[0]);db.useEmulator(p[1].split(':')[0],Number(p[1].split(':')[1]))}
  await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(function(){});
  await new Promise(function(r){var u=auth.onAuthStateChanged(function(){u();r()})});return {auth:auth,db:db}})();
  appP.catch(function(){appP=null});return appP}
function sk(){return authSession?authSession.storeKey:''}
function myEmail(){return sk()?(ls('lojasg.estoque99.cloud-email:'+sk())||''):''}
function setMyEmail(v){if(sk())ls('lojasg.estoque99.cloud-email:'+sk(),v);try{window.e99MailIdx.set(v,authSession.record.login)}catch(x){}}
async function derive(login,pw){return authCloudDerive(login,pw)}
function topic(){var i=window.e99SyncInfo&&window.e99SyncInfo();if(i)return i.topic;var t=window.e99Team&&window.e99Team.get();return t?t.topic:''}
async function sid(){var t=topic();return t?(await sha('loja|'+t)).slice(0,32):''}
function role(){var r=authSession&&authSession.payload.role;return r==='gestor'||r==='auxiliar'?r:'estoque'}
function nome(){try{var t=window.e99Team&&window.e99Team.get();if(t&&t.name)return String(t.name).slice(0,40)}catch(x){}return String(authSession?authSession.record.login:'').slice(0,40)}
function user(){return appP&&window.firebase&&firebase.apps.length?firebase.app().auth().currentUser:null}
function msg(x){var c=x&&x.code||'';return c==='auth/invalid-email'?'E-mail inválido. Confira o endereço.':c==='auth/network-request-failed'?'Sem internet. Tente de novo quando conectar.':c==='auth/too-many-requests'?'Muitas tentativas. Espere alguns minutos.':c==='auth/user-disabled'?'Esta conta foi desativada.':(x&&x.message)||'Não foi possível conectar à nuvem.'}
function soft(x){var c=x&&x.code||'';return !c||c==='auth/network-request-failed'||c==='auth/internal-error'||c==='unavailable'}
/* v99: "Sem internet" no PC com internet. Quando o Firebase dá falha de rede, testa cada serviço e diz qual está bloqueado
   (firewall da loja, antivírus que inspeciona HTTPS, bloqueador de anúncios, relógio do computador errado). */
function netNtfy(){try{var o=new URLSearchParams(location.search).get('ntfy');if(o&&(location.hostname==='localhost'||location.hostname==='127.0.0.1'))return o.replace(/\/+$/,'')}catch(x){}return 'https://ntfy.sh'}
async function probe(u){var ac=typeof AbortController==='function'?new AbortController():null,t=setTimeout(function(){if(ac)ac.abort()},8000);try{await fetch(u,{mode:'no-cors',cache:'no-store',signal:ac?ac.signal:undefined});return true}catch(x){return false}finally{clearTimeout(t)}}
function netServices(){return [['login da nuvem (identitytoolkit.googleapis.com)','https://identitytoolkit.googleapis.com/v1/projects?key='+FB.apiKey],['banco da nuvem (firestore.googleapis.com)','https://firestore.googleapis.com/'],['arquivos do Firebase (www.gstatic.com)','https://www.gstatic.com/firebasejs/'+FBV+'/firebase-app-compat.js'],['equipe e chat (ntfy.sh)',netNtfy()+'/v1/health']]}
/* v130: lista estruturada de cada serviço (passou/bloqueado), para o painel "Rede da loja / Antivírus" e para a mensagem clara no chat/sync. */
window.e99NetList=async function(){var list=netServices();var r=await Promise.all(list.map(function(x){return probe(x[1])}));return list.map(function(x,i){return {name:x[0],ok:!!r[i]}})};
window.e99NetWhy=async function(){if(navigator.onLine===false)return 'Este aparelho está sem internet. Confira o Wi-Fi ou o cabo e tente de novo.';
  var list=netServices();
  var r=await Promise.all(list.map(function(x){return probe(x[1])})),bad=list.filter(function(x,i){return !r[i]}).map(function(x){return x[0]});
  if(!bad.length)return 'A nuvem não respondeu a tempo, mas este aparelho tem internet. Tente de novo em instantes.';
  if(bad.length===list.length)return 'Sem acesso à internet por este navegador. Se o computador tem internet, confira a data e a hora do Windows (relógio errado bloqueia sites seguros), o proxy da rede e o antivírus. Veja Dados · "Rede da loja / Antivírus".';
  return 'O antivírus ou a rede da loja está bloqueando o Stok: '+bad.join(', ')+'. Libere o app no antivírus (ex.: Bitdefender) ou teste em outra rede (roteador do celular). Veja Dados · "Rede da loja / Antivírus".'};

/* guarda a senha digitada só na memória, por 10 minutos, para ligar a conta da nuvem logo depois do login */
var decBefore=authDecrypt;authDecrypt=async function(record,password){var r=await decBefore.apply(this,arguments);if(record&&typeof password==='string')stash={login:authLoginName(record.login),pw:password,t:Date.now()};return r};
var createBefore=authCreate;authCreate=async function(login,store,password){var r=await createBefore.apply(this,arguments);stash={login:authLoginName(login),pw:password,t:Date.now()};return r};
function freshPw(){if(!stash||!authSession)return '';if(Date.now()-stash.t>10*60000){stash=null;return ''}return stash.login===authLoginName(authSession.record.login)?stash.pw:''}

/* liga (ou cria) a conta da nuvem desta pessoa */
/* v89: a marca "senha da nuvem já atualizada" fica cifrada com a chave da conta (antes era parte do hash e deixava testar o PIN fora do app) */
async function pwSame(s,h){try{var o=JSON.parse(ls('lojasg.estoque99.cloud-pw:'+s.storeKey)||'null');if(!o||!o.iv)return false;var t=new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:authUn64(o.iv),additionalData:authBytes('cloudpw|'+authLoginName(s.record.login))},s.key,authUn64(o.c)));return t===h}catch(x){return false}}
async function pwSet(s,h){try{var iv=crypto.getRandomValues(new Uint8Array(12));var c=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:authBytes('cloudpw|'+authLoginName(s.record.login))},s.key,authBytes(h)));ls('lojasg.estoque99.cloud-pw:'+s.storeKey,JSON.stringify({iv:authB64(iv),c:authB64(c)}))}catch(x){}}
try{Object.keys(localStorage).forEach(function(k){if(k.indexOf('lojasg.estoque99.cloud-pw:')===0&&!/^\{/.test(localStorage.getItem(k)||''))localStorage.removeItem(k)})}catch(x){}
/* v89: limite de tentativas de senha da nuvem neste aparelho (5 erros → espera 5 min, dobra a cada novo bloqueio) */
window.e99CloudTry={K:'lojasg.estoque99.cloud-tries',get:function(){try{return JSON.parse(localStorage.getItem(this.K)||'{}')||{}}catch(x){return {}}},
  wait:function(){var o=this.get();return o.until&&o.until>Date.now()?Math.ceil((o.until-Date.now())/60000):0},
  fail:function(){var o=this.get();o.n=(o.n||0)+1;if(o.n>=5){o.b=(o.b||0)+1;o.until=Date.now()+5*60000*Math.pow(2,o.b-1);o.n=0}try{localStorage.setItem(this.K,JSON.stringify(o))}catch(x){}},
  ok:function(){try{localStorage.removeItem(this.K)}catch(x){}}};
async function link(email,pw){var s=authSession;if(!s)throw Error('Entre na conta.');email=String(email||'').trim().toLowerCase();if(!EMAIL_RE.test(email)||email.length>120)throw Error('Digite um e-mail válido.');
  var c=await load(),d=await derive(s.record.login,pw),u=c.auth.currentUser;
  if(u&&u.email!==email){await c.auth.signOut();u=null}
  if(!u){try{u=(await c.auth.createUserWithEmailAndPassword(email,d)).user}catch(x){if(x.code!=='auth/email-already-in-use')throw x;try{u=(await c.auth.signInWithEmailAndPassword(email,d)).user}catch(y){if(y.code==='auth/network-request-failed'||y.code==='auth/too-many-requests')throw y;throw Error('Este e-mail já está ligado a outra conta do Stok, com outra senha. Use a mesma senha daquela conta ou outro e-mail.')}}}
  else if(!(await pwSame(s,(await sha(d)).slice(0,16)))){try{await u.updatePassword(d)}catch(x){}}
  if(authSession!==s)return;setMyEmail(email);await pwSet(s,(await sha(d)).slice(0,16));
  if(!u.emailVerified&&!/@pc\.stok-e99\.app$/.test(email))verify(u,false);await after(true,true)}
async function verify(u,force){var k='lojasg.estoque99.cloud-verify:'+u.uid;if(!force&&Date.now()-Number(ls(k)||0)<6*3600000)return;try{await u.sendEmailVerification();ls(k,String(Date.now()));if(force)notify('Enviamos um novo e-mail de confirmação para '+u.email+'.')}catch(x){if(force)notify(msg(x))}}

/* depois de conectado: grava a conta, o status na loja e começa a ouvir a equipe */
async function after(fresh,perm){var u=user();if(!u||!authSession)return;try{await u.reload()}catch(x){}u=user();if(!u)return;if(u.emailVerified)try{await u.getIdToken(true)}catch(x){}
  var c=await load(),now=Date.now(),loja=await sid(),me=authSession;if(!me||!user())return;
  if(loja)try{if((await c.db.collection('encerradas').doc(loja).get()).exists&&window.e99Team){await window.e99Team.close();try{c.db.collection('equipes').doc(u.uid).delete().catch(function(){})}catch(x){}ls('lojasg.estoque99.team-saved:'+me.storeKey,'');notify('O gestor encerrou este chat. Peça um convite para a equipe nova.');loja=await sid()}}catch(x){}
  try{var ref=c.db.collection('usuarios').doc(u.uid),old=null;try{old=(await ref.get()).data()}catch(x){}
    await ref.set({email:u.email,login:me.record.login.slice(0,80),nome:nome(),role:role(),loja:loja,criado:old&&Number.isInteger(old.criado)?old.criado:now,visto:now,verificado:!!u.emailVerified})}catch(x){try{console.warn('Stok nuvem usuarios:',x.code||x)}catch(y){}}
  if(loja&&(fresh||now-lastVisto>30*60000)){lastVisto=now;try{var mref=c.db.collection('lojas').doc(loja).collection('membros').doc(u.uid),mo=null;try{mo=(await mref.get()).data()}catch(x){}
    var inv=ls('lojasg.estoque99.invite-id:'+me.storeKey)||'';var m={login:me.record.login.slice(0,80),nome:nome(),role:role(),criado:mo&&Number.isInteger(mo.criado)?mo.criado:now,visto:now,verificado:!!u.emailVerified};if(inv)m.inviteId=inv.slice(0,40);
    await mref.set(m)}catch(x){try{console.warn('Stok nuvem membros:',x.code||x)}catch(y){}}}
  try{var tq=window.e99Team&&window.e99Team.get();if(tq&&tq.code){var sig=tq.code+'|'+tq.name+'|'+tq.team+'|'+tq.owner;if(ls('lojasg.estoque99.team-saved:'+me.storeKey)!==sig){await c.db.collection('equipes').doc(u.uid).set({code:String(tq.code).slice(0,20),name:String(tq.name||'').slice(0,40),team:String(tq.team||'Equipe').slice(0,80),owner:!!tq.owner,sync:!!tq.sync,at:now});ls('lojasg.estoque99.team-saved:'+me.storeKey,sig)}}}catch(x){}
  listen(loja);if(window.e99ProfileCloud)try{window.e99ProfileCloud()}catch(x){}
  var tm=null;try{tm=window.e99Team&&window.e99Team.get()}catch(x){}if(role()==='gestor'||(tm&&tm.owner))daily(loja).catch(function(){});
  if(perm)setTimeout(function(){permStep(false)},900)}

/* status dos membros da loja (chega na hora, mesmo que o celular estivesse fechado) */
function listen(loja){if(!loja||(memSid===loja&&memUnsub))return;load().then(function(c){if(memUnsub)memUnsub();memSid=loja;
  memUnsub=c.db.collection('lojas').doc(loja).collection('membros').onSnapshot(function(q){q.forEach(function(doc){var x=doc.data()||{};var key=authLoginName(String(x.login||''));cloudMem[key]={uid:doc.id,login:String(x.login||''),nome:x.nome,role:x.role,inviteId:x.inviteId||'',criado:x.criado,visto:x.visto,verificado:!!x.verificado};if(window.e99OnMembers)try{window.e99OnMembers()}catch(y){}
      if(window.e99MemTouch){var dev=('u'+doc.id.toLowerCase().replace(/[^a-z0-9]/g,'')).slice(0,40);window.e99MemTouch(dev,{name:x.nome||x.login,role:x.role==='auxiliar'?'auxiliar':'gestor',login:x.login,inviteId:x.inviteId,created:x.criado,seen:x.visto})}});
    var box=document.getElementById('aux-box');if(box&&window.e99AuxCardHTML&&!box.contains(document.activeElement)){var open=box.open,h=window.e99AuxCardHTML();if(h){box.outerHTML=h;var nb=document.getElementById('aux-box');if(nb)nb.open=open}}},
    function(x){try{console.warn('Stok nuvem ouvir membros:',x.code||x)}catch(y){}})}).catch(function(){})}
window.e99CloudMembers=function(){return Object.keys(cloudMem).map(function(k){return cloudMem[k]})};
window.e99CloudMember=function(login){return cloudMem[authLoginName(String(login||''))]||null};

/* gestor: uma vez por dia prepara o resumo de cada auxiliar com e-mail confirmado; o robô envia */
function day(){var d=new Date();return d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0')}
async function daily(loja){var u=user();if(!u||!u.emailVerified||!loja||!authSession)return;var k='lojasg.estoque99.cloud-daily:'+loja;if(ls(k)===day())return;var c=await load(),list=Object.keys(cloudMem).map(function(l){return cloudMem[l]}).filter(function(m){return m.role==='auxiliar'&&m.verificado&&m.uid!==u.uid});
  if(!list.length)return;var ok=0;for(var i=0;i<list.length;i++){var m=list[i];var t=summary(m.nome||'');try{await c.db.collection('correio').doc(loja+'_'+m.uid+'_'+day()).set({de:u.uid,para:m.uid,assunto:('Stok · seu resumo de '+new Date().toLocaleDateString('pt-BR')).slice(0,150),texto:t.slice(0,4000),tipo:'resumo',loja:loja,criado:Date.now()});ok++}catch(x){}}
  if(ok)ls(k,day())}
function summary(name){var n=normalText(name),p=(state.team||[]).find(function(x){return normalText(x.name)===n||normalText(x.id)===n})||null,id=p?normalText(p.id):'';
  function mine(o){o=normalText(o||'');return o==='todos'||(id&&o===id)}
  var cor=(state.corridors||[]).filter(function(c){return mine(c.owner)}).map(function(c){return '• Corredor '+(c.number||'')+(c.sector?' — '+c.sector:'')}).slice(0,20);
  var acts=[];(state.plans||[]).forEach(function(pl){(pl.activities||[]).forEach(function(a){if(!a.done&&a.title&&mine(a.owner))acts.push('• '+a.title+(pl.title?' ('+pl.title+')':''))})});
  var al=0;try{al=collectAlerts().length}catch(x){}
  return 'Olá, '+(p?p.name:name)+'!\n\nResumo do Stok · '+(authSession.payload.store||'Estoque 99')+'\n\n'
    +(acts.length?'Atividades em aberto ('+acts.length+'):\n'+acts.slice(0,25).join('\n'):'Nenhuma atividade em aberto para você. 👏')+'\n\n'
    +(cor.length?'Seus corredores:\n'+cor.join('\n')+'\n\n':'')+(al?'Alertas no estoque: '+al+'.\n\n':'')
    +'Abra o app: https://vferreiras.github.io/ESTOQUE-G/\n\nPara não receber estes e-mails, avise o gestor.'}

/* tela "Vincule seu e-mail" */
function dlg(id){var d=document.getElementById(id);if(!d){d=document.createElement('dialog');d.id=id;document.body.appendChild(d);d.addEventListener('cancel',function(){try{sessionStorage.setItem('e99-cloud-later','1')}catch(x){}})}return d}
function showLink(){if(!authSession||ls('lojasg.estoque99.pc-account:'+authSession.storeKey))return;/* v105: a tela obrigatória de e-mail vem antes */var eg=document.getElementById('email-gate');if(eg&&eg.open)return;/* v107: quem tocou em "Agora não" não recebe outro pedido de e-mail nesta sessão */if(window.e99EmailGateSkipped&&window.e99EmailGateSkipped())return;var d=dlg('cloud-link'),pw=freshPw(),em=myEmail();
  d.innerHTML='<form class="cl-body" onsubmit="e99CloudLink(event)"><h2>📧 Vincule seu e-mail</h2><p>Agora cada conta do Stok fica guardada na nuvem com o e-mail da pessoa. Assim você recebe avisos e resumos por e-mail.</p>'
   +'<label>Seu e-mail<input name="email" type="email" required maxlength="120" autocomplete="email" inputmode="email" value="'+e(em)+'" placeholder="voce@gmail.com"></label>'
   +(pw?'':'<label>Sua senha do app (a mesma do login)<input name="password" type="password" required autocapitalize="none" spellcheck="false" autocomplete="current-password"></label>')
   +(linkErr?'<p class="cl-err" role="alert">'+e(linkErr)+'</p>':'')
   +'<button class="primary" '+(linkBusy?'disabled':'')+'>'+(linkBusy?'Vinculando…':'Vincular e-mail')+'</button>'
   +(pcFree()?'<button type="button" onclick="e99MakePc()">🖥️ Esta é a conta do PC (nuvem com login interno)</button>':'')+'<button type="button" onclick="e99CloudLater()">Agora não</button><button type="button" onclick="e99CloudForgot()">Esqueci a senha</button><button type="button" onclick="e99CloudLater();authLogout()">Sair da conta</button>'+'<p class="small">Você vai receber um e-mail de confirmação. Seus dados do estoque continuam protegidos pela sua senha.</p></form>';
  if(!d.open)try{d.showModal()}catch(x){d.setAttribute('open','')}}
function pcFree(){if(!authSession)return false;for(var i=0;i<localStorage.length;i++){var k=localStorage.key(i);if(k&&k.indexOf('lojasg.estoque99.pc-account:')===0&&k!=='lojasg.estoque99.pc-account:'+authSession.storeKey)return false}return true}
window.e99MakePc=async function(){if(!authSession||!pcFree())return;if(!confirm('Marcar esta conta como a conta do PC do estoque? A nuvem dela usa um login interno (o e-mail da conta fica só como contato). Só uma conta pode ser a do PC.'))return;ls('lojasg.estoque99.pc-account:'+authSession.storeKey,'1');var d=document.getElementById('cloud-link');if(d)d.close();try{var c=await load(),u=c.auth.currentUser;if(u&&!/@pc\.stok-e99\.app$/.test(u.email||''))await c.auth.signOut()}catch(x){}notify('Pronto: esta é a conta do PC. A nuvem dela usa um login interno.');if(freshPw())onEnter();if(page==='account')render()};
window.e99CloudForgot=function(){var d=document.getElementById('cloud-link');if(d)d.close();try{sessionStorage.setItem('e99-cloud-later','1')}catch(x){}if(window.mrOpen){window.mrOpen();return}notify('Abra Minha conta e use “Trocar senha” com a senha atual. Se não lembrar, toque em Sair da conta e, na tela de entrar, use “Esqueci a senha”.')};
window.e99CloudLater=function(){var d=document.getElementById('cloud-link');if(d)d.close();try{sessionStorage.setItem('e99-cloud-later','1')}catch(x){}};
window.e99CloudLink=async function(ev){ev.preventDefault();if(linkBusy||!authSession)return;var v=readForm(ev.target),pw=freshPw()||String(v.password||'');linkErr='';
  if(!pw){linkErr='Digite sua senha.';showLink();return}
  if(!freshPw()){try{await decBefore(authSession.record,pw)}catch(x){linkErr='Senha incorreta.';showLink();return}stash={login:authLoginName(authSession.record.login),pw:pw,t:Date.now()}}
  linkBusy=true;showLink();try{await link(v.email,pw);linkBusy=false;var d=document.getElementById('cloud-link');if(d)d.close();var u=user();notify(u&&!u.emailVerified?'E-mail vinculado! Abra a mensagem que enviamos para '+u.email+' e toque no link de confirmação.':'E-mail vinculado à nuvem.');if(page==='account')render()}
  catch(x){linkBusy=false;linkErr=msg(x);linkSoft=soft(x);showLink();if(x&&x.code==='auth/network-request-failed')window.e99NetWhy().then(function(t){if(linkErr===msg(x)){linkErr=t;showLink()}}).catch(function(){})}};

/* ao entrar na conta */
async function onEnter(){if(!authSession)return;var pc=!!ls('lojasg.estoque99.pc-account:'+authSession.storeKey);/* conta do PC do estoque: e-mail interno automático */var s=authSession,c;try{c=await load()}catch(x){return}if(authSession!==s)return;var u=c.auth.currentUser,em=pc?'pc-'+(await sha('pc|'+authLoginName(s.record.login))).slice(0,24)+'@pc.stok-e99.app':myEmail(),pw=freshPw();
  if(pc){if(u&&u.email===em){after(false);return}if(pw)try{await link(em,pw)}catch(x){try{console.warn('Stok nuvem PC:',x.code||x)}catch(y){}}return}
  if(u&&em&&u.email===em){if(pw){try{var d=await derive(s.record.login,pw),h=(await sha(d)).slice(0,16);if(!(await pwSame(s,h))){await u.updatePassword(d);await pwSet(s,h)}}catch(x){}}after(false);return}
  if(em&&pw){try{await link(em,pw);return}catch(x){if(soft(x))return;linkErr=msg(x);linkSoft=false}}
  else if(u&&!em){try{await c.auth.signOut()}catch(x){}}
  try{if(sessionStorage.getItem('e99-cloud-later'))return}catch(x){}showLink()}
var enterBefore=authEnter;authEnter=function(){var r=enterBefore.apply(this,arguments);linkErr='';linkSoft=false;setTimeout(onEnter,700);return r};
var logoutBefore=authLogout;authLogout=async function(){var r=await logoutBefore.apply(this,arguments);if(!authSession){if(memUnsub){memUnsub();memUnsub=null;memSid=''}cloudMem={};stash=null;load().then(function(c){return c.auth.signOut()}).catch(function(){})}return r};
var cpBefore=authChangePassword;authChangePassword=async function(ev){var v=readForm(ev.target),s=authSession,rev=s&&s.record.revision;var r=await cpBefore.apply(this,arguments);
  if(s&&authSession===s&&s.record.revision!==rev&&v.password){var u=user();if(u)try{var nd=await derive(s.record.login,v.password);try{await u.updatePassword(nd)}catch(x){if(x.code!=='auth/requires-recent-login')throw x;await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email,await derive(s.record.login,v.current)));await u.updatePassword(nd)}if(authSession)await pwSet(authSession,(await sha(nd)).slice(0,16))}catch(x){try{console.warn('Stok nuvem senha:',x.code||x)}catch(y){}}}return r};
window.e99LoginForEmail=function(v){v=String(v||'').trim().toLowerCase();if(v.indexOf('@')<0)return '';try{return window.e99MailIdx.get(v)}catch(x){return ''}};
setInterval(function(){if(authSession&&!document.hidden&&user())after(false).catch(function(){})},5*60000);
document.addEventListener('visibilitychange',function(){if(!document.hidden&&authSession&&user()){var u=user();if(!u.emailVerified)after(false).catch(function(){})}});

/* permissões do aparelho: notificações, som e câmera */
function isIOS(){return /iP(hone|ad|od)/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1)}
function standalone(){return (window.matchMedia&&matchMedia('(display-mode: standalone)').matches)||navigator.standalone===true}
async function permState(name){try{if(name==='notifications'&&window.Notification&&Notification.permission!=='default')return Notification.permission==='granted'?'granted':'denied';var q=await navigator.permissions.query({name:name});return q.state}catch(x){return name==='notifications'&&window.Notification?(Notification.permission==='default'?'prompt':Notification.permission):'prompt'}}
async function permStep(force){if(!authSession)return;var k='lojasg.estoque99.perm-asked:'+authSession.storeKey;if(!force&&(ls(k)||ls('e99-no-perm-step')))return;ls(k,String(Date.now()));var d=dlg('perm-step');
  var n=window.Notification?await permState('notifications'):'none',cam=navigator.mediaDevices&&navigator.mediaDevices.getUserMedia?await permState('camera'):'none',camOk=ls('lojasg.estoque99.perm-camera:'+authSession.storeKey);if(camOk&&cam==='prompt')cam='granted';var snd=ls('lojasg.estoque99.perm-sound:'+authSession.storeKey)?'granted':'prompt';
  function row(key,icon,title,desc,st){var ok=st==='granted',bad=st==='denied'||st==='none';return '<div class="perm-row"><span><b>'+icon+' '+title+'</b><span class="small">'+desc+(bad?'<br>'+(st==='none'?'Este navegador não oferece este recurso'+(key==='notif'&&isIOS()&&!standalone()?': no iPhone, instale o app na Tela de Início (Compartilhar → Adicionar à Tela de Início) e abra por lá.':'.'):'Bloqueado. Libere nas configurações do navegador/aparelho para este site.'):'')+'</span></span>'+(ok?'<span class="perm-ok">✓ Ativo</span>':'<button type="button" class="primary" onclick="e99Perm(\''+key+'\')" '+(st==='none'?'disabled':'')+'>Permitir</button>')+'</div>'}
  d.innerHTML='<div class="cl-body"><h2>📲 Ativar no aparelho</h2><p>Para receber os avisos do estoque, ouvir os sons e ler códigos e fotos, permita estes recursos:</p>'
   +row('notif','🔔','Notificações','Chat, alertas e tarefas.',n)+row('sound','🔊','Som','Sons de aviso e de abertura.',snd)+row('camera','📷','Câmera','Fotos de ruptura e leitura de código de barras.',cam)
   +(window.e99PushCardHTML?window.e99PushCardHTML():'')+'<button type="button" onclick="document.getElementById(\'perm-step\').close()">Pronto</button></div>';
  if(!d.open)try{d.showModal()}catch(x){d.setAttribute('open','')}}
window.e99PermStep=function(){permStep(true)};
window.e99Perm=async function(key){try{
  if(key==='notif'){if(typeof enableDesktopNotifications==='function')await enableDesktopNotifications();else if(window.Notification)await Notification.requestPermission()}
  else if(key==='sound'){var ctx=typeof unlockSiteAudio==='function'?unlockSiteAudio():null;if(ctx&&ctx.resume)await ctx.resume().catch(function(){});if(typeof playSiteSound==='function')playSiteSound('tap');ls('lojasg.estoque99.perm-sound:'+authSession.storeKey,'1')}
  else if(key==='camera'){var st=await navigator.mediaDevices.getUserMedia({video:true,audio:false});st.getTracks().forEach(function(t){t.stop()});ls('lojasg.estoque99.perm-camera:'+authSession.storeKey,'1')}}catch(x){notify(key==='camera'?'A câmera não foi liberada.':'Não foi possível ativar.')}permStep(true)};

/* tela Conta: nuvem e permissões */
var raBefore=renderAccount;renderAccount=function(){var h=raBefore.apply(this,arguments),u=user(),em=myEmail();
  var box='<div class="panel help"><h2>☁️ Nuvem e e-mail</h2>'+(ls('lojasg.estoque99.pc-account:'+authSession.storeKey)?'<p>🖥️ Conta do PC do estoque: a nuvem usa um login interno'+(authSession.payload.email?' · e-mail de contato <b>'+e(authSession.payload.email)+'</b>':'')+'. Para recuperar, use o código de recuperação.</p>':u&&em&&u.email===em?'<p>Conectado como <b>'+e(u.email)+'</b> · '+(u.emailVerified?'<span class="perm-ok">e-mail confirmado ✓</span>':'confirmação pendente')+'</p>'+(u.emailVerified?'':'<button onclick="e99CloudVerify()">Reenviar e-mail de confirmação</button>'):'<p>Esta conta ainda não está ligada a um e-mail.</p><button class="primary" onclick="e99CloudOpen()">Vincular e-mail</button>'+(pcFree()?' <button onclick="e99MakePc()">🖥️ Conta do PC (nuvem com login interno)</button>':''))
    +'<h2 style="margin-top:14px">📲 Permissões do aparelho</h2><p class="small">Notificações, som e câmera.</p><button onclick="e99PermStep()">Ativar no aparelho</button>'+(window.e99PushCardHTML?'<div style="margin-top:12px">'+window.e99PushCardHTML()+'</div>':'')+'</div>';
  return h.replace('<div class="grid2">','<div class="grid2">'+box)};
window.e99CloudVerify=function(){var u=user();if(u)verify(u,true)};
window.e99CloudOpen=function(){try{sessionStorage.removeItem('e99-cloud-later')}catch(x){}linkErr='';linkSoft=false;showLink()};
/* entrou numa equipe (ou trocou): grava o status na loja nova na hora */
var lastSid='';setInterval(function(){if(document.hidden||!authSession||!user())return;sid().then(function(s){if(s&&s!==lastSid){lastSid=s;after(true).catch(function(){})}}).catch(function(){})},15000);
window.e99Cloud={load:load,user:user,sid:sid,after:after,onEnter:onEnter,relisten:function(){if(memUnsub){memUnsub();memUnsub=null}var s=memSid;memSid='';listen(s)}};
if(typeof authSession!=='undefined'&&authSession)setTimeout(onEnter,1500);
})();
