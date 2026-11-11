
/* v133 · (A) backup cifrado na nuvem + restaurar · (B) gestor redefine senha de usuário sem o código (custódia).
   (A) Sobe só o registro da conta JÁ cifrado no aparelho (AES-GCM com a chave da senha, PBKDF2 600 mil) — o mesmo que fica no
       localStorage, sem o Face ID (que é do aparelho). Firestore backups/{uid} (cabeçalho: v, login, rev, n, len, h=SHA-256, at, slim)
       + backups/{uid}/partes/{0..11} (d ≤ 800 mil caracteres). Regras: só o dono (uid) lê e grava. Automático depois de salvar
       (no máximo 1 a cada 10 min) e ao sair/ir para segundo plano; falha de rede fica calada. Minha conta: data, "Fazer backup agora",
       "Restaurar deste backup" (pede a senha; troca só os cadastros: papel, senha e chaves deste aparelho continuam).
       "Trazer da nuvem" num aparelho novo traz a conta inteira do backup (papel = o da nuvem, como no v89).
   (B) Gestor: par ECDH P-256; a privada fica no estado da conta cifrada (state.custody.priv). A pública vai no link de acesso (v127)
       e pela equipe (mensagem 'gkey'; só aceita a 1ª, de quem não é auxiliar — o link vale mais). O aparelho do usuário cria um
       "código do gestor" (24 caracteres), embrulha os bits da chave da conta com ele (record.custody.w) e sela o código para a
       pública do gestor (ECDH efêmero + HKDF + AES-GCM; record.custody.env). Refaz quando a senha muda (salt novo).
       Esqueci a senha → "Pedir ao gestor": texto STK-PEDIDO:… (envelope + login). Administração → "Redefinir senha de um usuário":
       o gestor cola, o app abre com a privada e mostra o código; o usuário usa em "Código de recuperação" e escolhe senha nova
       (o código de recuperação dele é trocado por um novo). Nada em claro sai do aparelho; o gestor só abre pedidos da chave dele. */
(function(){'use strict';var D=document,W=window;
var BK_ON=true;/* backup na nuvem ligado (as regras de backups/ estão publicadas) */
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(x){return null}}
function b64u(u8){return authB64(u8).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')}
function unb64u(t){t=String(t).replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';return authUn64(t)}
function rnd(n){return crypto.getRandomValues(new Uint8Array(n))}
async function hex(data){var h=await crypto.subtle.digest('SHA-256',typeof data==='string'?authBytes(data):data);return Array.from(new Uint8Array(h)).map(function(b){return b.toString(16).padStart(2,'0')}).join('')}
function when(ms){var d=new Date(ms);return isNaN(d)?'':d.toLocaleDateString('pt-BR')+' às '+d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
function isG(){return !!(authSession&&authSession.payload&&authSession.payload.role==='gestor')}
function cust(){return (typeof state==='object'&&state&&state.custody)||{}}
function dlg(id){var d=D.getElementById(id);if(!d){d=D.createElement('dialog');d.id=id;D.body.appendChild(d)}return d}
function openD(d){if(!d.open)try{d.showModal()}catch(x){d.setAttribute('open','')}}
async function copy(t){try{await navigator.clipboard.writeText(t);notify('Copiado.')}catch(x){try{prompt('Copie:',t)}catch(y){}}}

/* ===================== (B) custódia ===================== */
/* bits da chave da conta: guardados só na memória enquanto a conta está aberta (são o mesmo segredo da chave já em memória) */
var RING=[];
var kfb=authKeyFromBits;authKeyFromBits=async function(bits){try{var c=new Uint8Array(bits);RING=[c].concat(RING).slice(0,4)}catch(x){}return kfb(bits)};
async function hk(ikm,salt,info){var b=await crypto.subtle.importKey('raw',ikm,'HKDF',false,['deriveKey']);return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:salt,info:authBytes(info)},b,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
var EC={name:'ECDH',namedCurve:'P-256'};
var gP=null;
function gPub(){if(!isG())return Promise.resolve('');if(gP)return gP;gP=(async function(){var c=cust();
  if(!c.priv){var kp=await crypto.subtle.generateKey(EC,true,['deriveBits']);var j=await crypto.subtle.exportKey('jwk',kp.privateKey);state.custody=Object.assign({},cust(),{priv:{d:j.d,x:j.x,y:j.y}});await save();c=state.custody}
  var raw=new Uint8Array(65);raw[0]=4;raw.set(unb64u(c.priv.x),1);raw.set(unb64u(c.priv.y),33);return b64u(raw)})();
  gP.then(function(){gP=null},function(){gP=null});return gP}
W.e99GkPub=function(){return gPub().catch(function(){return ''})};
async function fp(gk){return (await hex(unb64u(gk))).slice(0,16)}
async function okPub(gk){try{if(typeof gk!=='string'||!/^[A-Za-z0-9_-]{87}$/.test(gk))return false;await crypto.subtle.importKey('raw',unb64u(gk),EC,false,[]);return true}catch(x){return false}}
async function sealTo(gk,code,login,k){var pub=await crypto.subtle.importKey('raw',unb64u(gk),EC,false,[]);var eph=await crypto.subtle.generateKey(EC,true,['deriveBits']);
  var er=new Uint8Array(await crypto.subtle.exportKey('raw',eph.publicKey));var sh=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:pub},eph.privateKey,256));
  var key=await hk(sh,er,'stk-custodia|'+login),iv=rnd(12);var ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:authBytes('stk-custodia|'+login+'|'+k)},key,authBytes(code)));
  return {e:b64u(er),i:b64u(iv),c:b64u(ct)}}
async function wrapBits(code,bits,login){var salt=rnd(16),key=await hk(authBytes(authNormalizeCode(code)),salt,'stk-custodia-w|'+login),iv=rnd(12);
  var ct=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:authBytes(login+'|custodia')},key,bits);return {salt:authB64(salt),iv:authB64(iv),cipher:authB64(new Uint8Array(ct))}}
/* recuperação: o código que o gestor passou abre os bits da conta (só se a custódia é da senha atual) */
W.e99CustodyOpen=async function(code,record){try{var c=record&&record.custody;if(!c||!c.w||c.s!==record.salt)return null;var n=authNormalizeCode(code);if(!/^[0-9A-Z]{24}$/.test(n))return null;
  var key=await hk(authBytes(n),authUn64(c.w.salt),'stk-custodia-w|'+record.login);return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:authUn64(c.w.iv),additionalData:authBytes(record.login+'|custodia')},key,authUn64(c.w.cipher)))}catch(x){return null}};
async function bitsFor(rec){for(var i=0;i<RING.length;i++){try{var k=await crypto.subtle.importKey('raw',RING[i],{name:'AES-GCM'},false,['decrypt']);await crypto.subtle.decrypt({name:'AES-GCM',iv:authUn64(rec.iv),additionalData:authBytes(authLoginName(rec.login))},k,authUn64(rec.cipher));return RING[i]}catch(x){}}return null}
var eBusy=false;
async function ensure(){if(eBusy||!authSession||isG())return;var s=authSession,gk=cust().gk;if(!gk)return;var rec=s.record,k=await fp(gk);
  if(rec.custody&&rec.custody.k===k&&rec.custody.s===rec.salt)return;eBusy=true;
  try{var bits=await bitsFor(rec);if(!bits||authSession!==s||s.record!==rec)return;var code=authNewRecoveryCode();
    var cu={v:1,k:k,s:rec.salt,w:await wrapBits(code,bits,rec.login),env:await sealTo(gk,code,rec.login,k),at:Date.now()};code='';
    if(authSession!==s||s.record!==rec)return;s.record.custody=cu;await save()}catch(x){try{console.warn('Stok custódia:',x&&x.message||x)}catch(y){}}finally{eBusy=false}}
W.e99CustodyEnsure=ensure;
W.e99CustodyState=function(){var s=authSession;if(!s)return null;var c=s.record.custody;return {gk:!!cust().gk,priv:!!cust().priv,ok:!!(c&&c.s===s.record.salt),k:c?c.k:''}};
/* chave do gestor pela equipe: só a primeira, só de quem não é auxiliar (o link de acesso já traz a certa) */
W.e99OnGkey=async function(o){try{if(!authSession||isG()||!o||o.r==='auxiliar'||cust().gk)return;if(!(await okPub(o.gk)))return;if(cust().gk)return;state.custody=Object.assign({},cust(),{gk:o.gk});await save();ensure()}catch(x){}};
var gAt=0;function sendG(force){try{if(!isG()||!W.e99SyncInfo||!W.e99SyncInfo()||!W.e99SyncSend)return;var t=W.e99Team&&W.e99Team.get();if(!t||!t.owner)return;var lim=force?2*60000:3*3600000;if(Date.now()-gAt<lim)return;gAt=Date.now();
  gPub().then(function(gk){if(gk)W.e99SyncSend('gkey',{gk:gk})}).catch(function(){})}catch(x){}}
var hp=W.e99OnHello;W.e99OnHello=function(){try{if(hp)hp.apply(this,arguments)}catch(x){}sendG(true)};
/* pedido (aparelho do usuário, sem entrar) */
async function pedidoFor(login){login=authLoginName(String(login||'').replace(/^@+/,''));if(!login)throw Error('Digite o seu login.');var raw=localStorage.getItem(await authStorageKey(login));
  if(!raw)throw Error('Não há conta com este login neste aparelho. Faça o pedido no aparelho onde você usa o Stok.');var r;try{r=authCheckRecord(JSON.parse(raw))}catch(x){throw Error('A cópia da conta neste aparelho está danificada.')}
  var c=r.custody;if(!c||!c.env||c.s!==r.salt)throw Error('Esta conta ainda não tem a custódia do gestor neste aparelho (ela é criada quando você entra depois que o gestor libera). Use o código de recuperação ou o e-mail.');
  return 'STK-PEDIDO:'+b64u(authBytes(JSON.stringify({v:1,l:r.login,k:c.k,e:c.env.e,i:c.env.i,c:c.env.c})))}
W.e99CustodyRequest=pedidoFor;
/* gestor abre o pedido */
W.e99CustodyAnswer=async function(text){if(!isG())throw Error('Só o gestor abre pedidos de senha.');var t=String(text||'').replace(/\s+/g,''),m=t.match(/STK-PEDIDO:([A-Za-z0-9_-]{40,1500})/);
  if(!m||t.length>1700)throw Error('Pedido inválido. Copie o texto inteiro, que começa com STK-PEDIDO:');var o;try{o=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(unb64u(m[1])))}catch(x){throw Error('Pedido inválido ou incompleto.')}
  if(!o||typeof o!=='object'||o.v!==1||typeof o.l!=='string'||!o.l||o.l.length>80||o.l!==authLoginName(o.l)||/[<>"'&`]/.test(o.l)||!/^[0-9a-f]{16}$/.test(o.k||'')||!/^[A-Za-z0-9_-]{87}$/.test(o.e||'')||!/^[A-Za-z0-9_-]{16}$/.test(o.i||'')||!/^[A-Za-z0-9_-]{40,90}$/.test(o.c||''))throw Error('Pedido inválido ou incompleto.');
  var c=cust();if(!c.priv)throw Error('Este aparelho ainda não tem a chave de gestor. Ela é criada ao gerar um link de acesso ou ao abrir a equipe.');
  if(o.k!==(await fp(await gPub())))throw Error('Este pedido foi feito para outro gestor ou outra equipe. Peça à pessoa um pedido novo.');
  var code;try{var priv=await crypto.subtle.importKey('jwk',{kty:'EC',crv:'P-256',d:c.priv.d,x:c.priv.x,y:c.priv.y,ext:true},EC,false,['deriveBits']);var er=unb64u(o.e);var pub=await crypto.subtle.importKey('raw',er,EC,false,[]);
    var sh=new Uint8Array(await crypto.subtle.deriveBits({name:'ECDH',public:pub},priv,256));var key=await hk(sh,er,'stk-custodia|'+o.l);
    code=authNormalizeCode(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unb64u(o.i),additionalData:authBytes('stk-custodia|'+o.l+'|'+o.k)},key,unb64u(o.c))))}catch(x){throw Error('Pedido adulterado ou de outra equipe: não foi possível abrir.')}
  if(!/^[0-9A-Z]{24}$/.test(code))throw Error('Pedido inválido.');return {login:o.l,code:code}};
/* tela: Esqueci a senha → Pedir ao gestor */
W.e99CustAsk=function(){var d=dlg('cust-ask');var lg='';try{var li=D.querySelector('#auth-form input[name=login]');lg=li?li.value:''}catch(x){}
  d.innerHTML='<form onsubmit="e99CustMake(event)"><h2>Pedir ao gestor</h2><p class="small">O app monta um pedido com a sua conta, fechado para a chave do gestor da sua equipe. Mande o pedido para ele (WhatsApp, e-mail). Ele te passa um código: digite em “Código de recuperação” e escolha a senha nova.</p><label>Seu login<input name="login" required maxlength="80" autocomplete="username" autocapitalize="none" spellcheck="false" value="'+esc(lg)+'"></label><p class="cust-err" role="alert" id="cust-ask-err"></p><div id="cust-ask-out"></div><div class="toolbar"><button type="button" onclick="this.closest(\'dialog\').close()">Fechar</button><button class="primary" type="submit">Gerar pedido</button></div></form>';openD(d)};
W.e99CustMake=async function(ev){ev.preventDefault();var err=D.getElementById('cust-ask-err'),out=D.getElementById('cust-ask-out');err.textContent='';out.innerHTML='';
  try{var p=await pedidoFor(readForm(ev.target).login);out.innerHTML='<label>Seu pedido (não serve para entrar; só o gestor abre)<textarea class="cust-out" id="cust-ask-text" readonly rows="5"></textarea></label><div class="toolbar"><button type="button" onclick="e99CustCopy()">Copiar pedido</button>'+(navigator.share?'<button type="button" onclick="e99CustShare()">Compartilhar</button>':'')+'</div>';D.getElementById('cust-ask-text').value=p}catch(x){err.textContent=x.message||'Não foi possível gerar o pedido.'}};
W.e99CustCopy=function(){var t=D.getElementById('cust-ask-text');if(t)copy(t.value)};
W.e99CustShare=function(){var t=D.getElementById('cust-ask-text');if(t&&navigator.share)navigator.share({title:'Pedido de senha · Stok',text:'Pedido para redefinir minha senha no Stok (Administração → Redefinir senha de um usuário): '+t.value}).catch(function(){})};
var raB=renderAuth;renderAuth=function(){var r=raB.apply(this,arguments);try{if(authMode==='recover'&&!authSession&&!authRecoveryShow&&!D.getElementById('cust-ask-box')){var card=D.querySelector('#auth-screen .auth-card');var f=D.getElementById('auth-form');
  if(card&&f){var b=D.createElement('div');b.id='cust-ask-box';b.innerHTML='<p class="small">Sem o código? O gestor da sua equipe pode te passar um código para redefinir a senha.</p><button type="button" onclick="e99CustAsk()">Pedir ao gestor</button>';f.after(b)}}}catch(x){}return r};
/* tela do gestor: Administração → Redefinir senha de um usuário */
function adminBox(){if(page!=='admin'||!isG())return;var v=D.getElementById('view');if(!v||D.getElementById('cust-admin'))return;var d=D.createElement('div');d.className='panel help';d.id='cust-admin';
  d.innerHTML='<h2>Redefinir senha de um usuário</h2><p class="small" style="margin:0">Quem esqueceu a senha toca em “Esqueci a senha → Pedir ao gestor” e te manda um pedido (STK-PEDIDO:…). Cole aqui: o app abre o pedido com a sua chave de gestor e mostra um código. Passe o código só para a própria pessoa; ela digita em “Código de recuperação” e escolhe a senha nova.</p>'
   +'<form onsubmit="e99CustOpenForm(event)"><label>Pedido<textarea class="cust-out" name="pedido" required maxlength="2000" rows="4" autocapitalize="none" spellcheck="false" placeholder="STK-PEDIDO:…"></textarea></label><div class="toolbar"><button class="primary" type="submit">Abrir pedido</button></div></form><div id="cust-admin-out" aria-live="polite"></div>';
  var a=D.getElementById('acc-create');if(a)a.after(d);else{var h=v.querySelector('.hero');if(h)h.after(d);else v.prepend(d)}}
W.e99CustOpenForm=async function(ev){ev.preventDefault();var out=D.getElementById('cust-admin-out');if(!out)return;out.innerHTML='<p class="small">Abrindo…</p>';
  try{var r=await W.e99CustodyAnswer(readForm(ev.target).pedido);var f=authFormatCode(r.code);out.innerHTML='<div class="cust-res"><p>Código para <b>@'+esc(r.login)+'</b>:</p><p class="cust-code" id="cust-code">'+esc(f)+'</p><p class="small">Vale uma vez: quando a pessoa redefinir a senha, ela recebe um código de recuperação novo e este deixa de valer.</p><div class="toolbar"><button type="button" onclick="e99CustCopyCode()">Copiar código</button></div></div>'}
  catch(x){out.innerHTML='<p class="cust-err" role="alert">'+esc(x.message||'Pedido inválido.')+'</p>'}};
W.e99CustCopyCode=function(){var c=D.getElementById('cust-code');if(c)copy(c.textContent)};

/* ===================== (A) backup na nuvem ===================== */
var PART=800000,MAXP=12,MIN=10*60000;
function metaKey(s){return 'lojasg.estoque99.bk:'+s.storeKey}
function meta(s){try{return JSON.parse(ls(metaKey(s))||'null')}catch(x){return null}}
function mine(u){var s=authSession;if(!s||!u||!u.email)return false;var em=String(ls('lojasg.estoque99.cloud-email:'+s.storeKey)||'').toLowerCase();if(em&&String(u.email).toLowerCase()===em)return true;return !!ls('lojasg.estoque99.pc-account:'+s.storeKey)&&/@pc\.stok-e99\.app$/.test(u.email)}
async function cloud(){if(!W.e99Cloud||!W.e99Cloud.user)return null;var u=W.e99Cloud.user();if(!u||!mine(u))return null;var c=await W.e99Cloud.load();u=c.auth.currentUser;return u&&mine(u)?{c:c,u:u}:null}
function strip(x){if(typeof x==='string')return x.length>20000&&/^data:/.test(x)?'':x;if(Array.isArray(x))return x.map(strip);if(x&&typeof x==='object'){var o={};Object.keys(x).forEach(function(k){o[k]=strip(x[k])});return o}return x}
async function slim(s,rec){var st=strip(JSON.parse(JSON.stringify(state)));return authEncrypt(s.key,rec,{store:s.payload.store,role:s.payload.role,email:s.payload.email||undefined,ai:aiNormalize(s.payload.ai),learn:learnNormalize(s.payload.learn),state:st})}
async function fetchStr(db,uid){var ref=db.collection('backups').doc(uid);var h=await ref.get();if(!h.exists)return null;var m=h.data()||{};var n=Number(m.n);if(!(n>=1&&n<=MAXP)||!/^[0-9a-f]{64}$/.test(m.h||''))throw Error('Backup da nuvem incompleto.');
  var parts=await Promise.all(Array.from({length:n},function(_,i){return ref.collection('partes').doc(String(i)).get()}));var str=parts.map(function(p){var d=p.exists?p.data():null;return d&&typeof d.d==='string'?d.d:''}).join('');
  if(str.length!==m.len||(await hex(str))!==m.h)throw Error('Backup da nuvem incompleto (envio interrompido). Faça um backup novo no aparelho de origem.');return {str:str,at:Number(m.at)||0,slim:!!m.slim}}
var running=null,timer=0,lastRun=0,pend=false,lastErr='';
async function run(force,s){s=s||authSession;if(!s||!BK_ON)return {ok:false,why:'off'};var cl=await cloud();if(!cl)return {ok:false,why:'nocloud'};
  var raw=localStorage.getItem(s.storeKey);if(!raw)return {ok:false,why:'norec'};var rec=JSON.parse(raw);delete rec.bio;var mt=meta(s);
  if(!force&&mt&&mt.rev===rec.revision&&mt.uid===cl.u.uid&&!mt.slim)return {ok:true,skip:true,at:mt.at};
  var str=JSON.stringify(rec),sl=false;if(str.length>PART*MAXP){rec=await slim(s,rec);delete rec.bio;str=JSON.stringify(rec);sl=true;if(str.length>PART*MAXP)return {ok:false,why:'big'}}
  var n=Math.ceil(str.length/PART)||1,h=await hex(str),ref=cl.c.db.collection('backups').doc(cl.u.uid),old=0;try{var od=await ref.get();old=od.exists?Number(od.data().n)||0:0}catch(x){}
  for(var i=0;i<n;i++)await ref.collection('partes').doc(String(i)).set({d:str.slice(i*PART,(i+1)*PART),at:Date.now()});
  var at=Date.now();await ref.set({v:1,login:String(rec.login).slice(0,80),rev:rec.revision,n:n,len:str.length,h:h,at:at,slim:sl});
  for(var j=n;j<Math.min(old,MAXP);j++)try{await ref.collection('partes').doc(String(j)).delete()}catch(x){}
  ls(metaKey(s),JSON.stringify({rev:rec.revision,at:at,uid:cl.u.uid,slim:sl}));return {ok:true,at:at,slim:sl}}
function go1(force,s){if(running)return running;pend=false;lastRun=Date.now();running=run(force,s).then(function(r){lastErr='';return r},function(x){lastErr=(x&&(x.code||x.message))||'erro';try{console.warn('Stok backup:',lastErr)}catch(y){}return {ok:false,why:'err',err:x}}).then(function(r){running=null;paint();return r});return running}
function soon(){if(!BK_ON||!authSession)return;pend=true;if(timer)return;var wait=Math.max(3000,MIN-(Date.now()-lastRun));timer=setTimeout(function(){timer=0;if(authSession&&pend)go1(false)},wait)}
var apB=authPersist;authPersist=function(){var t=apB.apply(this,arguments);try{Promise.resolve(t).then(function(){soon()},function(){})}catch(x){}return t};
D.addEventListener('visibilitychange',function(){if(D.hidden&&pend&&authSession){if(timer){clearTimeout(timer);timer=0}go1(false)}});
W.addEventListener('pagehide',function(){if(pend&&authSession)go1(false)});
var loB=authLogout;authLogout=async function(){RING=[];var s=authSession;if(s&&pend&&BK_ON){if(timer){clearTimeout(timer);timer=0}try{await Promise.race([go1(false,s),new Promise(function(r){setTimeout(r,2500)})])}catch(x){}}pend=false;return loB.apply(this,arguments)};
var enB=authEnter;authEnter=function(){var r=enB.apply(this,arguments);var s=authSession;setTimeout(function(){if(authSession===s){ensure();sendG(false);soon()}},4000);return r};
setInterval(function(){if(authSession&&!D.hidden){ensure();sendG(false)}},20000);
/* aparelho novo: "Trazer da nuvem" traz a conta inteira do backup */
W.e99BkPull=async function(c,u,lg,p,role,email){if(!BK_ON)return null;try{var got=await fetchStr(c.db,u.uid);if(!got)return null;var rec=authCheckRecord(JSON.parse(got.str));if(authLoginName(rec.login)!==authLoginName(lg))return null;
  var op;try{op=await authDecrypt(rec,p)}catch(x){notify('O backup da nuvem foi feito com outra senha: a conta foi trazida sem os dados.');return null}
  var storeKey=await authStorageKey(lg);if(localStorage.getItem(storeKey))return null;var payload=op.payload;payload.role=['gestor','auxiliar','estoque'].indexOf(role)>=0?role:'estoque';/* a sincronização começa do zero neste aparelho (como numa conta nova): a equipe completa o resto */payload.state.sync=validateSync(null);if(email)payload.email=email;delete rec.bio;
  var next=await authEncrypt(op.key,Object.assign({},rec,{revision:rec.revision+1}),payload);if(got.slim)setTimeout(function(){notify('Fotos grandes não estavam no backup da nuvem.')},2500);
  return {key:op.key,record:next,storeKey:storeKey,payload:payload,recoveryCode:null,restored:true}}catch(x){try{console.warn('Stok backup (trazer):',x&&x.message||x)}catch(y){}return null}};
/* Minha conta */
var cloudAt=null;
function paint(){var el=D.getElementById('bk-status');if(!el||!authSession)return;var u=W.e99Cloud&&W.e99Cloud.user&&W.e99Cloud.user(),on=!!(u&&mine(u)),mt=meta(authSession);
  var t=!BK_ON?'Backup na nuvem desligado nesta versão.':!on?'Nuvem desligada nesta conta: ligue o e-mail da conta à nuvem (aviso ao entrar) para ter backup.':running?'Enviando backup…':(mt&&mt.at?'Último backup: '+when(mt.at)+(mt.slim?' (sem as fotos grandes)':'')+'.':cloudAt?'Último backup na nuvem: '+when(cloudAt)+'.':'Ainda sem backup desta conta.');
  if(on&&lastErr&&!running)t+=' O último envio não terminou (rede); o app tenta de novo depois.';el.textContent=t;
  D.querySelectorAll('#bk-panel button').forEach(function(b){b.disabled=!on||!BK_ON||!!running})}
function accBox(){if(page!=='account'||!authSession)return;var v=D.getElementById('view');if(!v||D.getElementById('bk-panel'))return;var d=D.createElement('div');d.className='panel help';d.id='bk-panel';
  d.innerHTML='<h2>Backup na nuvem</h2><p class="small" style="margin:0">Uma cópia da sua conta, já cifrada com a sua senha neste aparelho, fica guardada na nuvem. Só você consegue abrir: nem a loja nem o Google leem os seus dados. Ela se atualiza sozinha depois que você salva (no máximo a cada 10 minutos) e ao sair.</p><p class="bk-status" id="bk-status" role="status"></p><div class="toolbar"><button class="primary" type="button" onclick="e99Backup.now(true)">Fazer backup agora</button><button type="button" onclick="e99Backup.ask()">Restaurar deste backup</button></div>';
  var lp=D.getElementById('legal-panel');var g=lp&&lp.closest('.grid2');if(g&&g.parentNode===v)v.insertBefore(d,g);else v.appendChild(d);paint();
  cloud().then(function(cl){if(!cl)return;return cl.c.db.collection('backups').doc(cl.u.uid).get().then(function(h){if(h.exists){cloudAt=Number(h.data().at)||null;paint()}})}).catch(function(){})}
async function now(manual){var r=await go1(true);if(!manual)return r;
  if(r.ok)notify('Backup enviado para a nuvem'+(r.slim?' (sem as fotos grandes, que passavam do limite)':'')+'.');
  else if(r.why==='nocloud')notify('Ligue a nuvem nesta conta (e-mail) para fazer backup.');else if(r.why==='big')notify('A conta passou do limite do backup na nuvem (cerca de 9 MB). Exporte uma cópia em Dados.');
  else if(r.why==='err'){var c=r.err&&r.err.code||'';notify(c==='unavailable'||c==='auth/network-request-failed'||navigator.onLine===false?await W.e99NetWhy():'Não foi possível enviar o backup agora. Tente de novo em instantes.')}return r}
function ask(){var d=dlg('bk-dlg');d.innerHTML='<form onsubmit="e99Backup.restore(event)"><h2>Restaurar deste backup</h2><p>Os cadastros deste aparelho (notas, planos, corredores, equipe, conferências) serão <b>substituídos</b> pelos do backup da nuvem'+(cloudAt?' de '+esc(when(cloudAt)):'')+'. Seu papel, sua senha atual e o código de recuperação não mudam.</p>'
  +'<input type="text" name="username" autocomplete="username" value="'+esc(authSession?authSession.record.login:'')+'" hidden><label>Senha da conta (a que valia quando o backup foi feito)<input name="password" type="password" required maxlength="128" autocapitalize="none" spellcheck="false" autocomplete="current-password"></label><p class="cust-err" role="alert" id="bk-err"></p><div class="toolbar"><button type="button" onclick="this.closest(\'dialog\').close()">Cancelar</button><button class="primary" type="submit">Substituir pelos dados do backup</button></div></form>';openD(d)}
async function restore(ev){ev.preventDefault();var f=ev.target,err=D.getElementById('bk-err'),btn=f.querySelector('button.primary'),pw=readForm(f).password,s=authSession;err.textContent='';btn.disabled=true;
  try{var cl=await cloud();if(!cl)throw Error('Ligue a nuvem nesta conta para restaurar.');var got;try{got=await fetchStr(cl.c.db,cl.u.uid)}catch(x){if(x&&x.code)throw Error(x.code==='unavailable'?await W.e99NetWhy():'Não foi possível ler o backup agora.');throw x}if(!got)throw Error('Ainda não há backup desta conta na nuvem.');
    var rec=authCheckRecord(JSON.parse(got.str));if(authLoginName(rec.login)!==authLoginName(s.record.login))throw Error('Este backup é de outra conta.');var op;try{op=await authDecrypt(rec,pw)}catch(x){throw Error('Senha incorreta para este backup.')}
    if(authSession!==s)return;var next=validate(op.payload.state);['photoKey','confKey','sealKey'].forEach(function(k){if(state[k])next[k]=state[k]});var cu=cust();if(cu.priv||cu.gk)next.custody=Object.assign({},next.custody,cu);next.sealed=Object.assign({},next.sealed||{},state.sealed||{});
    state=next;corrupt=false;await save();/* v134: depois de restaurar, a nuvem recebe o estado restaurado já (um envio em andamento podia deixar lá a cópia anterior por 10 min) */Promise.resolve(running).then(function(){if(authSession===s)return go1(true,s)}).catch(function(){});D.getElementById('bk-dlg').close();render();notify('Dados restaurados do backup da nuvem'+(got.slim?' (sem as fotos grandes)':'')+'.')}
  catch(x){err.textContent=x.message||'Não foi possível restaurar.'}finally{btn.disabled=false}}
W.e99Backup={now:now,ask:ask,restore:restore,soon:soon,run:function(f){return go1(!!f)},meta:function(){return authSession?meta(authSession):null},on:BK_ON};
/* ganchos de tela */
var rB=render;render=function(){var r=rB.apply(this,arguments);try{if(authSession){adminBox();accBox()}}catch(x){}return r};
})();
