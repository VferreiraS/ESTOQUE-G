(function(){
'use strict';
/* v138: Chat estilo WhatsApp — lista de conversas (chat geral da equipe + privadas 1 a 1 + grupos).
   Privadas e grupos cifrados de ponta a ponta: cada conta tem um par ECDH P-256 (privada em state.e2e, dentro da conta cifrada;
   pública em perfis_{uid}.pk da v137). 1 a 1 = ECDH + HKDF. Grupo = chave aleatória por versão (kv), o "chaveiro" vai embrulhado
   para a pública de cada membro (cv_{id}.w[uid]); quem sai não recebe a versão nova.
   Transporte: nuvem da v136 (lojas/{loja}/dados): cv_{id} (grupo, selado com a chave da loja; só quem criou altera),
   msgs_{cv}~{id} e msgs_{cv}~{id}~r~{uid} (reação) com d='E2E:kv:…' (chave da conversa; a loja não lê),
   pres_{uid} (online/visto/digitando) e rcpt_{cv}~{uid} (entregue/lido). Só o autor grava o seu (regras). Nada dá papel; tudo por esc(). */
var CH=['cv','msgs','pres','rcpt'],ONLINE=75e3,MAXPH=340000,PH=/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/,REACT=['👍','❤️','😂','😮','😢','🙏'],KP={name:'ECDH',namedCurve:'P-256'};
var R={},M={},CV={},gen=0,unsub=null,ctxKey='',sub=null,rings={},dmK={},dmMap={},pubC={},fail={},draftPh='',replyTo='',lastOn=0,lastTyp=0,typCv='',myPriv=null,myPrivSrc='',rcAt={},started=false,geralN=0,urls={},menuId='';
function E(v){return esc(v)}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v)}catch(e){return null}}
function cx(){return window.e99Loja&&e99Loja.ctx&&e99Loja.ctx()}
function me(){var c=cx();return c?c.uid:''}
function soc(){return window.e99Social&&e99Social.S?e99Social.S():{}}
function pf(uid){var r=soc()['perfis_'+uid];return r&&!r.del&&r.x?r.x:null}
function nm(uid){if(uid===me())return 'Você';var p=pf(uid);return p&&p.name||(p&&p.lg?'@'+p.lg:'Alguém')}
function rid(p){return p+Date.now().toString(36)+Array.from(crypto.getRandomValues(new Uint8Array(6)),function(b){return (b%36).toString(36)}).join('')}
function prefP(){return ls('lojasg.estoque99.chat-presence')!=='off'}
function prefR(){return ls('lojasg.estoque99.chat-read')!=='off'}
function testGeral(){return /^(localhost|127\.0\.0\.1)$/.test(location.hostname)&&ls('e99-test-chatgeral')==='1'}
function img(d){if(typeof d!=='string'||d.length>MAXPH||!PH.test(d))return '';if(urls[d])return urls[d];try{var b=atob(d.split(',')[1]),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);urls[d]=URL.createObjectURL(new Blob([a],{type:'image/jpeg'}))}catch(e){urls[d]=''}return urls[d]}
function av(uid,name,photo){var u=photo?img(photo):'';if(!u&&uid){var p=pf(uid);u=p&&p.photo?img(p.photo):''}
  return u?'<img class="cv-av" src="'+E(u)+'" alt="">':'<span class="cv-av" aria-hidden="true">'+E((String(name||'?').trim()[0]||'?').toUpperCase())+'</span>'}
function hm(t){var d=new Date(t);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function when(t){if(!t)return '';var d=new Date(t),n=new Date();if(d.toDateString()===n.toDateString())return hm(t);var y=new Date(n-864e5);if(d.toDateString()===y.toDateString())return 'ontem';return ('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2)+'/'+d.getFullYear()}
function readKey(){return 'lojasg.estoque99.cv-read:'+(authSession?authSession.storeKey:'')}
function lr(){try{return JSON.parse(ls(readKey())||'{}')||{}}catch(e){return {}}}
function setLr(cv,at){var o=lr();if((o[cv]||0)<at){o[cv]=at;ls(readKey(),JSON.stringify(o))}}
/* ---------- chaves ---------- */
async function mine(){var e=state.e2e;
  if(!e||!e.priv){var k=await crypto.subtle.generateKey(KP,true,['deriveBits']);e={priv:authB64(new Uint8Array(await crypto.subtle.exportKey('pkcs8',k.privateKey))),pub:authB64(new Uint8Array(await crypto.subtle.exportKey('raw',k.publicKey)))};state.e2e=e;try{await save()}catch(x){}if(window.e99Social&&e99Social.pushPerfil)e99Social.pushPerfil(true)}
  if(myPriv&&myPrivSrc===e.priv)return myPriv;myPriv=await crypto.subtle.importKey('pkcs8',authUn64(e.priv),KP,false,['deriveBits']);myPrivSrc=e.priv;return myPriv}
window.e99CvPk=function(){return typeof state!=='undefined'&&state&&state.e2e&&state.e2e.pub||''};
async function pub(uid){var p=pf(uid),pk=p&&p.pk;if(!pk)return null;if(!pubC[pk]){try{pubC[pk]=await crypto.subtle.importKey('raw',authUn64(pk),KP,false,[])}catch(e){return null}}return pubC[pk]}
async function hk(uid,info){var pr=await mine(),pu=await pub(uid);if(!pu)return null;var bits=await crypto.subtle.deriveBits({name:'ECDH',public:pu},pr,256);var base=await crypto.subtle.importKey('raw',bits,'HKDF',false,['deriveKey']);
  return crypto.subtle.deriveKey({name:'HKDF',hash:'SHA-256',salt:authBytes('e99-e2e-v1'),info:authBytes(info)},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
async function aes(k,aad,o){var iv=crypto.getRandomValues(new Uint8Array(12));var ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:authBytes(aad)},k,authBytes(JSON.stringify(o))));var out=new Uint8Array(12+ct.length);out.set(iv);out.set(ct,12);return authB64(out)}
async function unaes(k,aad,s){try{var b=authUn64(s);return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12),additionalData:authBytes(aad)},k,b.slice(12))))}catch(e){return null}}
async function dmId(o){var h=new Uint8Array(await crypto.subtle.digest('SHA-256',authBytes('e99-dm|'+cx().loja+'|'+[me(),o].sort().join('|'))));return 'd'+Array.from(h.slice(0,12),function(b){return ('0'+b.toString(16)).slice(-2)}).join('')}
async function people(){var s=soc(),out=[];for(var k in s){var r=s[k];if(r&&r.c==='perfis'&&!r.del&&r.x&&r.cuid&&r.cuid!==me())out.push(r.cuid)}
  for(var i=0;i<out.length;i++){if(!dmMap['u:'+out[i]]){var id=await dmId(out[i]);dmMap['u:'+out[i]]=id;dmMap[id]=out[i]}}return out}
async function keyFor(cv,kv){if(cv[0]==='d'){var peer=dmMap[cv];if(!peer)return null;var p=pf(peer),k=cv+'|'+(p&&p.pk)+'|'+(state.e2e&&state.e2e.pub);if(!dmK[k])dmK[k]=await hk(peer,'dm|'+cx().loja+'|'+cv);return dmK[k]}
  var ring=await ringOf(cv);return ring&&ring.k[kv]||null}
async function ringOf(cv){var g=CV[cv];if(!g||!g.w||!g.w[me()])return null;var sig=g.at+'|'+g.w[me()];if(rings[cv]&&rings[cv].sig===sig)return rings[cv];
  var kk=await hk(g.ow,'gw|'+cx().loja+'|'+cv+'|'+me());if(!kk)return null;var raw=await unaes(kk,'gw|'+cv+'|'+me(),g.w[me()]);if(!raw||typeof raw!=='object')return null;
  var r={sig:sig,raw:raw,k:{}};for(var v in raw){if(/^\d{1,6}$/.test(v)&&typeof raw[v]==='string'){try{r.k[v]=await crypto.subtle.importKey('raw',authUn64(raw[v]),'AES-GCM',false,['encrypt','decrypt'])}catch(e){}}}rings[cv]=r;return r}
async function encMsg(cv,docId,o){var kv=cv[0]==='d'?0:(CV[cv]&&CV[cv].kv||1);var k=await keyFor(cv,kv);if(!k)throw Error(cv[0]==='d'?'Esta pessoa ainda não abriu o Stok atualizado (sem chave).':'Você não tem a chave deste grupo.');return 'E2E:'+kv+':'+await aes(k,cx().loja+'|'+docId+'|'+kv,o)}
async function decMsg(cv,docId,d){var m=/^E2E:(\d{1,6}):([A-Za-z0-9+/=]+)$/.exec(d||'');if(!m)return null;var k=await keyFor(cv,m[1]);if(!k)return null;return unaes(k,cx().loja+'|'+docId+'|'+m[1],m[2])}
/* ---------- nuvem ---------- */
async function put(c,docId,d,del){var k=cx();if(!k)throw Error('Ligue o e-mail (nuvem) para usar as conversas.');var cur=R[docId],at=Math.floor(Math.max(Date.now(),(cur&&cur.at||0)+1));
  var data={c:c,at:at,st:k.FS.FieldValue.serverTimestamp(),by:k.uid,cuid:k.uid,del:!!del,v:1,d:del?'':d};await k.L().collection('dados').doc(docId).set(data);
  var rec={c:c,at:at,cuid:k.uid,del:!!del,d:data.d};if(c!=='msgs'&&!del){var pl=await k.unseal(docId,d);rec.x=pl&&pl.x}R[docId]=rec;if(c==='msgs')delete M[docId];if(c==='cv')cvOf(docId,rec)}
async function putX(c,docId,x){var k=cx();if(!k)throw Error('nuvem');return put(c,docId,await k.seal(docId,{x:x,b:''}),false)}
function cvOf(docId,rec){var id=docId.slice(3);if(rec.del||!rec.x||rec.x.id!==id||rec.x.ow!==rec.cuid){delete CV[id];return}var x=rec.x;
  CV[id]={id:id,at:rec.at,ow:x.ow,nm:String(x.nm||'Grupo').slice(0,40),ph:typeof x.ph==='string'&&PH.test(x.ph)&&x.ph.length<=MAXPH?x.ph:'',m:Array.isArray(x.m)?x.m.filter(function(u){return typeof u==='string'&&/^[A-Za-z0-9]{1,128}$/.test(u)}).slice(0,64):[],kv:Number.isSafeInteger(x.kv)?x.kv:1,w:x.w&&typeof x.w==='object'?x.w:{}}}
async function take(c,d){var x=d.data(),id=d.id;if(!x||CH.indexOf(x.c)<0||id.indexOf(x.c+'_')!==0)return;var at=Number(x.at)||0,cur=R[id];if(cur&&cur.at>at)return;var cuid=String(x.cuid||'');
  var rest=id.slice(x.c.length+1);
  if(x.c==='pres'&&rest!==cuid)return;if(x.c==='rcpt'&&rest.split('~')[1]!==cuid)return;if(x.c==='msgs'){var p=rest.split('~');if(p.length===4&&(p[2]!=='r'||p[3]!==cuid))return;if(p.length!==2&&p.length!==4)return}
  var rec={c:x.c,at:at,cuid:cuid,del:!!x.del,d:typeof x.d==='string'?x.d:''};
  if(x.c!=='msgs'&&!x.del){var pl=await c.unseal(id,x.d);if(!pl||!pl.x||typeof pl.x!=='object')return;rec.x=pl.x}
  R[id]=rec;if(x.c==='msgs')delete M[id];if(x.c==='cv'){cvOf(id,rec);for(var k in M)if(k.indexOf('msgs_'+id.slice(3)+'~')===0&&!M[k])delete M[k]}}
function listen(){var c=cx(),key=c?c.loja+'|'+c.uid:'';if(key===ctxKey)return;ctxKey=key;gen++;if(unsub){try{unsub()}catch(e){}unsub=null}R={};M={};CV={};rings={};dmK={};started=false;if(!c)return;var my=gen,chain=Promise.resolve();
  mine().catch(function(){});
  unsub=c.L().collection('dados').where('c','in',CH).onSnapshot(function(q){var ds=[];q.docChanges().forEach(function(ch){if(ch.type!=='removed')ds.push(ch.doc)});
    chain=chain.then(async function(){if(my!==gen)return;for(var i=0;i<ds.length;i++)await take(c,ds[i]);await build();started=true;receipts();refresh()}).catch(function(e){window.__e99CvErr=String(e&&e.stack||e)})},
    function(e){window.__e99CvErr=e&&e.code||String(e);ctxKey=''})}
var building=null;
async function build(){if(building)return building;building=(async function(){if(!cx())return;await people();
  for(var id in R){var r=R[id];if(r.c!=='msgs'||M[id])continue;var p=id.slice(5).split('~'),cv=p[0];
    if(r.del){M[id]={del:true};continue}var o=await decMsg(cv,id,r.d);if(!o||typeof o!=='object')continue;
    if(p.length===4){if(REACT.indexOf(o.e)>=0)M[id]={re:1,e:o.e};continue}
    M[id]={t:typeof o.t==='string'?o.t.slice(0,2000):'',ph:typeof o.ph==='string'&&PH.test(o.ph)&&o.ph.length<=MAXPH?o.ph:'',rp:typeof o.rp==='string'?o.rp.slice(0,40):''}}})().finally(function(){building=null});return building}
/* ---------- consultas ---------- */
function msgs(cv){var out=[];for(var id in R){var r=R[id];if(r.c!=='msgs'||id.indexOf('msgs_'+cv+'~')!==0)continue;var p=id.slice(5).split('~');if(p.length!==2)continue;var m=M[id];if(!m)continue;out.push({id:p[1],doc:id,at:r.at,u:r.cuid,del:!!m.del,t:m.t,ph:m.ph,rp:m.rp})}
  (fail[cv]||[]).forEach(function(f){out.push({id:f.id,at:f.at,u:me(),t:f.t,ph:f.ph,rp:f.rp,st:f.st})});return out.sort(function(a,b){return a.at-b.at})}
function reacts(cv,mid){var o={},pre='msgs_'+cv+'~'+mid+'~r~';for(var id in R){if(id.indexOf(pre)!==0)continue;var m=M[id];if(m&&m.re&&!R[id].del)o[m.e]=(o[m.e]||[]).concat(R[id].cuid)}return o}
function members(cv){if(cv[0]==='d')return dmMap[cv]?[dmMap[cv]]:[];var g=CV[cv];return g?g.m.filter(function(u){return u!==me()}):[]}
function convs(){var map={};for(var id in R){var r=R[id];if(r.c!=='msgs')continue;var cv=id.slice(5).split('~')[0];if(cv[0]==='d'&&dmMap[cv])map[cv]=1}
  for(var g in CV)if(CV[g].m.indexOf(me())>=0)map[g]=1;if(sub&&sub!=='geral'&&(sub[0]==='d'?dmMap[sub]:CV[sub]&&CV[sub].m.indexOf(me())>=0))map[sub]=1;var seen=lr();
  return Object.keys(map).map(function(cv){var l=msgs(cv),last=l[l.length-1],unread=l.filter(function(m){return m.u!==me()&&!m.del&&m.at>(seen[cv]||0)}).length;
    var g=CV[cv];return {cv:cv,name:cv[0]==='d'?nm(dmMap[cv]):g?g.nm:'Grupo',photo:g?g.ph:'',uid:cv[0]==='d'?dmMap[cv]:'',last:last,at:last?last.at:(g?g.at:0),unread:unread,g:cv[0]!=='d'}}).sort(function(a,b){return b.at-a.at})}
function pres(uid){var r=R['pres_'+uid];return r&&!r.del&&r.x?r.x:null}
function subtitle(cv){var now=Date.now(),ms=members(cv),ty=ms.filter(function(u){var p=pres(u);return p&&p.ty===cv&&now-(+p.tt||0)<6500});
  if(ty.length)return cv[0]==='d'?'digitando…':ty.map(nm).join(', ')+' digitando…';
  if(cv[0]==='d'){var p=pres(ms[0]);if(!prefP()||!p||!p.on)return '';return now-p.on<ONLINE?'online':'visto por último '+(when(p.on)===hm(p.on)?'hoje às '+hm(p.on):when(p.on)+' às '+hm(p.on))}
  var g=CV[cv];return g?g.m.map(nm).join(', '):''}
function tick(m,cv){if(m.st==='env')return '<span class="cv-tk" title="Enviando">Enviando…</span>';if(m.st)return '';var os=members(cv);if(!os.length)return '<span class="cv-tk">✓</span>';
  var rc=os.map(function(u){var r=R['rcpt_'+cv+'~'+u];return r&&!r.del&&r.x?r.x:{}});
  if(rc.every(function(x){return (+x.rd||0)>=m.at}))return '<span class="cv-tk rd" aria-label="Lida" data-tk="lido">✓✓</span>';
  if(rc.every(function(x){return (+x.dl||0)>=m.at}))return '<span class="cv-tk" aria-label="Entregue" data-tk="entregue">✓✓</span>';return '<span class="cv-tk" aria-label="Enviada" data-tk="enviado">✓</span>'}
/* ---------- recibos e presença ---------- */
var rcT=0;function receipts(){clearTimeout(rcT);rcT=setTimeout(async function(){if(!cx())return;var list=convs();for(var i=0;i<list.length;i++){var c=list[i],l=msgs(c.cv).filter(function(m){return m.u!==me()&&!m.st});if(!l.length)continue;var mx=l[l.length-1].at;
    var open=page==='chat'&&sub===c.cv&&!document.hidden;if(open)setLr(c.cv,mx);var r=R['rcpt_'+c.cv+'~'+me()],x=r&&r.x||{},dl=+x.dl||0,rd=+x.rd||0;
    var ndl=Math.max(dl,mx),nrd=open&&prefR()?Math.max(rd,mx):rd;if(ndl!==dl||nrd!==rd){try{await putX('rcpt','rcpt_'+c.cv+'~'+me(),{dl:ndl,rd:nrd})}catch(e){}}}navBadge()},400)}
async function presence(force,ty){if(!cx())return;var now=Date.now();if(!force&&now-lastOn<60000)return;var r=R['pres_'+me()],x=r&&r.x||{};var on=prefP()?(force==='typ'?(+x.on||0):now):0;if(force!=='typ')lastOn=now;
  try{await putX('pres','pres_'+me(),{on:on,ty:ty===undefined?typCv:ty,tt:ty?now:0})}catch(e){}}
setInterval(function(){listen();if(!cx())return;if(!document.hidden)presence(false,typCv&&Date.now()-lastTyp<6000?typCv:'');if(page==='chat'&&sub&&sub!=='geral'){var s=document.getElementById('cv-sub');if(s)s.textContent=subtitle(sub)}prefRow()},2000);
addEventListener('visibilitychange',function(){if(!document.hidden){presence(true);receipts()}});
/* ---------- tela ---------- */
var rt=0;function refresh(){clearTimeout(rt);rt=setTimeout(function(){if(!authSession||page!=='chat'){navBadge();return}if(sub&&sub!=='geral'){paintMsgs();var s=document.getElementById('cv-sub');if(s)s.textContent=subtitle(sub);return}if(!sub)render()},120)}
function navBadge(){var n=convs().reduce(function(a,c){return a+c.unread},0);document.querySelectorAll('[onclick="go(\'chat\')"]').forEach(function(b){var s=b.querySelector('.cv-unread');if(n>0){if(!s){s=document.createElement('span');s.className='cv-unread nav-unread';b.appendChild(s)}s.textContent=n>99?'99+':String(n)}else if(s)s.remove()})}
function listView(){var l=convs(),c=cx();
  var h=hero('Conversas','')+'<div class="panel cv-panel"><div class="row toolbar cv-tools"><button type="button" class="primary" onclick="e99Cv.newChat()">+ Nova conversa</button><button type="button" onclick="e99Cv.newChat(1)">Novo grupo</button></div>'
   +(c?'':'<p class="small cv-note">Ligue o e-mail (nuvem) em Minha conta para conversar em particular e em grupos. O chat da equipe funciona sem isso.</p>')
   +'<ul class="cv-list" role="list"><li><button type="button" class="cv-item" onclick="e99Cv.open(\'geral\')">'+av('','E')+'<span class="cv-mid"><b>Chat da equipe</b><span class="small">Toda a equipe</span></span><span class="cv-end">'+(geralN?'<span class="cv-badge" aria-label="'+geralN+' não lidas">'+geralN+'</span>':'')+'</span></button></li>'
   +l.map(function(x){var last=x.last,pv=last?(last.del?'Mensagem apagada':(last.u===me()?'Você: ':(x.g?nm(last.u)+': ':''))+(last.t||(last.ph?'Foto':''))):(x.g?'Grupo criado':'');
     return '<li><button type="button" class="cv-item" data-cv="'+E(x.cv)+'" onclick="e99Cv.open(\''+E(x.cv)+'\')">'+av(x.uid,x.name,x.photo)+'<span class="cv-mid"><b>'+E(x.name)+'</b><span class="small cv-last">'+E(pv.slice(0,80))+'</span></span><span class="cv-end"><span class="small">'+E(when(x.at))+'</span>'+(x.unread?'<span class="cv-badge" aria-label="'+x.unread+' não lidas">'+x.unread+'</span>':'')+'</span></button></li>'}).join('')+'</ul></div>';
  if(window.e99ChatUnread)e99ChatUnread().then(function(n){if(n!==geralN){geralN=n;if(page==='chat'&&!sub)refresh()}}).catch(function(){});return h}
function convView(cv){var g=CV[cv],name=cv[0]==='d'?nm(dmMap[cv]):g?g.nm:'Grupo';
  return '<div class="cv-wrap" data-open="'+E(cv)+'"><header class="cv-head"><button type="button" class="cv-back" aria-label="Voltar às conversas" onclick="e99Cv.list()">‹</button>'+av(cv[0]==='d'?dmMap[cv]:'',name,g&&g.ph)
   +'<span class="cv-mid"><b>'+E(name)+'</b><span id="cv-sub" class="small" aria-live="polite">'+E(subtitle(cv))+'</span></span>'+(g?'<button type="button" onclick="e99Cv.info()">Grupo</button>':'')+'</header>'
   +'<p class="small cv-e2e">'+(g&&g.m.indexOf(me())<0?'Você não participa mais deste grupo.':'Cifrada de ponta a ponta: só '+(g?'os membros':'vocês dois')+' leem.')+'</p><div id="cv-msgs" class="cv-msgs" role="log" aria-live="off" aria-label="Mensagens"></div><div id="cv-ann" class="chat-sr" role="status"></div>'
   +'<div id="cv-rp"></div><div id="cv-phprev"></div><form class="cv-compose" onsubmit="e99Cv.send(event)"><label class="as-file cv-phbtn" aria-label="Enviar foto">Foto<input type="file" accept="image/*" onchange="e99Cv.photo(this)"></label>'
   +'<textarea name="t" rows="1" maxlength="2000" placeholder="Mensagem" aria-label="Mensagem" enterkeyhint="send" oninput="e99Cv.typing(this)" onkeydown="e99Cv.key(event)"></textarea><button class="primary" type="submit">Enviar</button></form></div>'}
function bubble(cv,m){var mine=m.u===me(),g=cv[0]!=='d',rq=m.rp?msgs(cv).filter(function(x){return x.id===m.rp})[0]:null;
  var rx=m.del||m.st?{}:reacts(cv,m.id),rs=Object.keys(rx).map(function(e){return '<span class="cv-rx">'+E(e)+(rx[e].length>1?rx[e].length:'')+'</span>'}).join('');
  return '<div class="cv-b'+(mine?' mine':'')+'" data-mid="'+E(m.id)+'">'+(g&&!mine?'<span class="cv-from">'+E(nm(m.u))+'</span>':'')
   +(m.del?'<i class="small">Mensagem apagada</i>':(rq?'<span class="cv-q">'+E(nm(rq.u))+': '+E(String(rq.del?'Mensagem apagada':rq.t||'Foto').slice(0,80))+'</span>':'')+(m.ph?'<img class="cv-img" src="'+E(img(m.ph))+'" alt="Foto">':'')+(m.t?'<span class="cv-t">'+E(m.t)+'</span>':''))
   +'<span class="cv-meta">'+E(hm(m.at))+(mine&&!m.del?' '+tick(m,cv):'')+'</span>'+(rs?'<span class="cv-rxs">'+rs+'</span>':'')
   +(m.st==='err'?'<span class="cv-fail">Não enviada. <button type="button" onclick="e99Cv.retry(\''+E(m.id)+'\')">Tentar de novo</button><button type="button" onclick="e99Cv.drop(\''+E(m.id)+'\')">Descartar</button></span>':'')
   +(!m.del&&!m.st?'<button type="button" class="cv-more" aria-label="Opções da mensagem" onclick="e99Cv.menu(\''+E(m.id)+'\')">⋯</button>':'')+'</div>'}
function paintMsgs(){var box=document.getElementById('cv-msgs');if(!box||!sub)return;var l=msgs(sub),near=box.scrollHeight-box.scrollTop-box.clientHeight<80,first=!box.childElementCount;
  var last=box.getAttribute('data-last')||'',nl=l.length?l[l.length-1]:null;
  box.innerHTML=l.length?l.map(function(m){return bubble(sub,m)}).join(''):'<p class="small cv-empty">Nenhuma mensagem ainda.</p>';
  if(nl&&nl.id!==last){box.setAttribute('data-last',nl.id);if(!first&&nl.u!==me()){var a=document.getElementById('cv-ann');if(a)a.textContent=nm(nl.u)+': '+(nl.t||'Foto')}}
  if(first||near)box.scrollTop=box.scrollHeight;receipts()}
var rc0=window.renderChat;
window.renderChat=function(){if(!authSession)return '';if(sub==='geral'||!sub&&testGeral())return '<div class="cv-geralbar"><button type="button" class="cv-back" onclick="e99Cv.list()">‹ Conversas</button></div>'+rc0.apply(this,arguments);
  if(sub){setTimeout(paintMsgs,0);return convView(sub)}return listView()};
var go0=go;go=function(p){if(p==='chat'&&page!=='chat')sub=testGeral()?'geral':null;if(page==='chat'&&p!=='chat')leave();return go0.apply(this,arguments)};
var oac=window.e99OpenAccCreate;if(oac)window.e99OpenAccCreate=function(){var r=oac.apply(this,arguments);sub='geral';render();return r};
function leave(){if(typCv){typCv='';presence('typ','')}replyTo='';draftPh=''}
/* preferências */
function prefRow(){var pp=document.getElementById('prefs-panel');if(!pp||document.getElementById('pref-cv-row'))return;var r=document.createElement('div');r.className='pref-row';r.id='pref-cv-row';
  r.innerHTML='<span><b>Conversas</b><span class="small">Mostrar "online / visto por último" e confirmação de leitura nas conversas particulares e grupos.</span></span><span class="row"><label class="cv-pref"><input type="checkbox" id="pref-cv-pres" '+(prefP()?'checked':'')+' onchange="e99Cv.pref(\'presence\',this.checked)"> Online e visto por último</label><label class="cv-pref"><input type="checkbox" id="pref-cv-read" '+(prefR()?'checked':'')+' onchange="e99Cv.pref(\'read\',this.checked)"> Confirmação de leitura</label></span>';pp.appendChild(r)}
/* fotos */
function shrink(file){return new Promise(function(res,rej){if(!file||file.size>20*1024*1024){rej(Error('A foto passa de 20 MB.'));return}var u=URL.createObjectURL(file),im=new Image();
  im.onload=function(){URL.revokeObjectURL(u);try{var c=document.createElement('canvas'),side=1280,d='';for(var a=0;a<7;a++){var s=Math.min(1,side/Math.max(im.naturalWidth,im.naturalHeight));c.width=Math.max(1,Math.round(im.naturalWidth*s));c.height=Math.max(1,Math.round(im.naturalHeight*s));var g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);d=c.toDataURL('image/jpeg',.8-a*.07);if(d.length<=MAXPH)break;side=Math.round(side*.8)}if(!PH.test(d)||d.length>MAXPH)throw Error('Esta imagem ainda está grande.');res(d)}catch(e){rej(e)}};im.onerror=function(){URL.revokeObjectURL(u);rej(Error('Formato de imagem não suportado.'))};im.src=u})}
function showPh(){var p=document.getElementById('cv-phprev');if(p)p.innerHTML=draftPh?'<div class="cv-prev"><img src="'+E(img(draftPh))+'" alt="Foto escolhida"><button type="button" onclick="e99Cv.photoRm()">Tirar foto</button></div>':''}
function showRp(){var p=document.getElementById('cv-rp');if(!p)return;var m=replyTo&&msgs(sub).filter(function(x){return x.id===replyTo})[0];p.innerHTML=m?'<div class="cv-prev">Respondendo a '+E(nm(m.u))+': '+E(String(m.t||'Foto').slice(0,60))+' <button type="button" onclick="e99Cv.reply(\'\')">Cancelar</button></div>':''}
/* envio */
async function sendOne(cv,f){var doc='msgs_'+cv+'~'+f.id;f.st='env';refresh();try{var d=await encMsg(cv,doc,{t:f.t,ph:f.ph,rp:f.rp});if(d.length>900000)throw Error('Mensagem grande demais.');await put('msgs',doc,d,false);await build();fail[cv]=(fail[cv]||[]).filter(function(x){return x!==f});return true}
  catch(e){f.st='err';f.err=e&&e.message||'erro';window.__e99CvLastErr=f.err;notify('Mensagem não enviada: '+f.err);return false}finally{refresh()}}
setInterval(function(){if(!cx()||!navigator.onLine)return;Object.keys(fail).forEach(function(cv){(fail[cv]||[]).forEach(function(f){if(f.st==='err'&&!/chave|grande/.test(f.err||''))sendOne(cv,f)})})},60000);
addEventListener('online',function(){Object.keys(fail).forEach(function(cv){(fail[cv]||[]).forEach(function(f){if(f.st==='err')sendOne(cv,f)})})});
async function mkGroup(name,uids,photo){var c=cx();if(!c)throw Error('Ligue o e-mail (nuvem) para criar grupos.');await mine();await people();var id=rid('g'),raw={},key=crypto.getRandomValues(new Uint8Array(32));raw['1']=authB64(key);
  var m=[me()].concat(uids.filter(function(u){return u!==me()&&pf(u)&&pf(u).pk}));var w=await wrapAll(id,m,raw);await putX('cv','cv_'+id,{id:id,ow:me(),nm:String(name||'Grupo').trim().slice(0,40)||'Grupo',ph:photo||'',m:m,kv:1,w:w});return id}
async function wrapAll(id,m,raw){var w={};for(var i=0;i<m.length;i++){var k=await hk(m[i],'gw|'+cx().loja+'|'+id+'|'+m[i]);if(k)w[m[i]]=await aes(k,'gw|'+id+'|'+m[i],raw)}return w}
async function editGroup(id,ch){var g=CV[id];if(!g||g.ow!==me())throw Error('Só quem criou o grupo muda o grupo.');var ring=await ringOf(id);if(!ring)throw Error('Sem a chave do grupo.');var raw=Object.assign({},ring.raw),kv=g.kv,m=g.m.slice();
  if(ch.add)ch.add.forEach(function(u){if(m.indexOf(u)<0&&pf(u)&&pf(u).pk)m.push(u)});
  if(ch.rm&&ch.rm.length){m=m.filter(function(u){return ch.rm.indexOf(u)<0||u===me()});kv=kv+1;raw[String(kv)]=authB64(crypto.getRandomValues(new Uint8Array(32)))}
  var w=await wrapAll(id,m,raw);await putX('cv','cv_'+id,{id:id,ow:me(),nm:ch.nm!==undefined?String(ch.nm).trim().slice(0,40)||'Grupo':g.nm,ph:ch.ph!==undefined?ch.ph:g.ph,m:m,kv:kv,w:w});rings={};await build();refresh()}
/* folhas */
function sheet(id,html){var d=document.getElementById(id);if(!d){d=document.createElement('dialog');d.id=id;d.className='cv-sheet';document.body.appendChild(d)}d.innerHTML=html;if(!d.open)d.showModal();return d}
function personBtn(u,act){var p=pf(u)||{};return '<button type="button" class="cv-item" onclick="'+act+'">'+av(u,p.name)+'<span class="cv-mid"><b>'+E(p.name||'Pessoa')+'</b><span class="small">'+E(p.lg?'@'+p.lg:'')+(p.pk?'':' · ainda sem o Stok atualizado')+'</span></span></button>'}
var gDraft={ph:''};
window.e99Cv={
  open:function(cv){if(cv!=='geral'&&!/^[dg][A-Za-z0-9]{6,40}$/.test(cv))return;leave();sub=cv;render();if(cv!=='geral'){setLr(cv,Date.now());receipts();var t=document.querySelector('.cv-compose textarea');if(t&&matchMedia('(pointer:fine)').matches)t.focus()}},
  list:function(){leave();sub=null;render();scrollTo(0,0)},
  dmTo:async function(uid){if(!/^[A-Za-z0-9]{1,128}$/.test(uid||'')||uid===me())return;if(!cx()){notify('Ligue o e-mail (nuvem) para conversar em particular.');return}await people();var id=dmMap['u:'+uid]||await dmId(uid);dmMap[id]=uid;dmMap['u:'+uid]=id;var d=document.getElementById('cv-new');if(d&&d.open)d.close();if(page!=='chat'){go('chat')}e99Cv.open(id)},
  newChat:async function(group){if(!cx()){notify('Ligue o e-mail (nuvem) em Minha conta para conversar em particular e em grupos.');return}var ps=await people();gDraft={ph:''};
    sheet('cv-new','<form method="dialog" onsubmit="e99Cv.mkGroup(event)"><h2>'+(group?'Novo grupo':'Nova conversa')+'</h2>'+(ps.length?'':'<p class="small">Ninguém da equipe abriu o Stok com a nuvem ligada ainda.</p>')
      +(group?'<label>Nome do grupo<input name="nm" required maxlength="40"></label><label class="as-file">Foto do grupo (opcional)<input type="file" accept="image/*" onchange="e99Cv.gPhoto(this)"></label><fieldset class="cv-pick"><legend>Membros</legend>'+ps.map(function(u){var p=pf(u)||{};return '<label class="cv-pref"><input type="checkbox" name="m" value="'+E(u)+'"'+(p.pk?'':' disabled')+'> '+E(p.name||'Pessoa')+(p.lg?' (@'+E(p.lg)+')':'')+'</label>'}).join('')+'</fieldset>'
        :'<div class="cv-list">'+ps.map(function(u){return personBtn(u,"e99Cv.dmTo('"+E(u)+"')")}).join('')+'</div>')
      +'<div class="row toolbar"><button type="button" onclick="this.closest(\'dialog\').close()">Cancelar</button>'+(group?'<button class="primary" type="submit">Criar grupo</button>':'<button type="button" onclick="e99Cv.newChat(1)">Novo grupo</button>')+'</div></form>')},
  gPhoto:async function(inp){var f=inp.files&&inp.files[0];inp.value='';if(!f)return;try{gDraft.ph=await shrink(f)}catch(e){notify(e.message)}},
  mkGroup:async function(ev){ev.preventDefault();var f=ev.target,u=[].slice.call(f.querySelectorAll('input[name=m]:checked')).map(function(i){return i.value});if(!u.length){notify('Escolha pelo menos uma pessoa.');return}
    try{var id=await mkGroup(f.elements.nm.value,u,gDraft.ph);f.closest('dialog').close();e99Cv.open(id)}catch(e){notify(e.message)}},
  newGroup:function(name,uids){return mkGroup(name,uids,'')},
  editGroup:function(id,ch){return editGroup(id,ch)},
  info:function(){var g=CV[sub];if(!g)return;var own=g.ow===me(),out=Object.keys(soc()).map(function(k){return soc()[k]}).filter(function(r){return r.c==='perfis'&&!r.del&&r.x&&g.m.indexOf(r.cuid)<0}).map(function(r){return r.cuid});
    sheet('cv-info','<form method="dialog" onsubmit="e99Cv.saveInfo(event)"><h2>'+E(g.nm)+'</h2>'+(own?'<label>Nome do grupo<input name="nm" maxlength="40" value="'+E(g.nm)+'"></label><label class="as-file">Trocar foto<input type="file" accept="image/*" onchange="e99Cv.gPhoto(this)"></label>':'<p class="small">Só quem criou o grupo muda nome, foto e membros.</p>')
      +'<h3>Membros ('+g.m.length+')</h3><ul class="cv-mem">'+g.m.map(function(u){return '<li>'+av(u,nm(u))+'<span>'+E(nm(u))+(u===g.ow?' · criou':'')+'</span>'+(own&&u!==me()?'<button type="button" class="danger" onclick="e99Cv.rm(\''+E(u)+'\')">Remover</button>':'')+'</li>'}).join('')+'</ul>'
      +(own&&out.length?'<fieldset class="cv-pick"><legend>Adicionar</legend>'+out.map(function(u){var p=pf(u)||{};return '<label class="cv-pref"><input type="checkbox" name="add" value="'+E(u)+'"'+(p.pk?'':' disabled')+'> '+E(p.name||'Pessoa')+'</label>'}).join('')+'</fieldset>':'')
      +'<div class="row toolbar"><button type="button" onclick="this.closest(\'dialog\').close()">Fechar</button>'+(own?'<button class="primary" type="submit">Salvar</button>':'')+'</div></form>');gDraft={ph:''}},
  saveInfo:async function(ev){ev.preventDefault();var f=ev.target,add=[].slice.call(f.querySelectorAll('input[name=add]:checked')).map(function(i){return i.value});try{await editGroup(sub,{nm:f.elements.nm.value,add:add,ph:gDraft.ph||undefined});f.closest('dialog').close();render()}catch(e){notify(e.message)}},
  rm:async function(u){if(!confirm('Remover '+nm(u)+' do grupo? A chave do grupo será trocada e essa pessoa não lerá as próximas mensagens.'))return;try{await editGroup(sub,{rm:[u]});var d=document.getElementById('cv-info');if(d)d.close();render();notify('Removido do grupo.')}catch(e){notify(e.message)}},
  send:async function(ev){if(ev)ev.preventDefault();var cv=sub;if(!cv||cv==='geral')return;var ta=document.querySelector('.cv-compose textarea'),t=String(ta&&ta.value||'').trim().slice(0,2000);if(!t&&!draftPh)return;
    var f={id:rid('m'),at:Date.now(),t:t,ph:draftPh,rp:replyTo};if(ta){ta.value='';ta.style.height=''}draftPh='';replyTo='';showPh();showRp();(fail[cv]=fail[cv]||[]).push(f);if(typCv){typCv='';presence('typ','')}await sendOne(cv,f)},
  retry:function(id){var f=(fail[sub]||[]).filter(function(x){return x.id===id})[0];if(f)sendOne(sub,f)},
  drop:function(id){fail[sub]=(fail[sub]||[]).filter(function(x){return x.id!==id});refresh()},
  key:function(e){if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();e99Cv.send()}},
  typing:function(ta){ta.style.height='';ta.style.height=Math.min(160,ta.scrollHeight)+'px';if(!sub||sub==='geral')return;var now=Date.now();if(!ta.value){if(typCv){typCv='';presence('typ','')}return}if(now-lastTyp>4000||typCv!==sub){lastTyp=now;typCv=sub;presence('typ',sub)}},
  photo:async function(inp){var f=inp.files&&inp.files[0];inp.value='';if(!f)return;try{draftPh=await shrink(f);showPh()}catch(e){notify(e.message)}},
  photoRm:function(){draftPh='';showPh()},
  reply:function(id){replyTo=id||'';var d=document.getElementById('cv-menu');if(d&&d.open)d.close();showRp();var t=document.querySelector('.cv-compose textarea');if(t&&id)t.focus()},
  menu:function(id){var m=msgs(sub).filter(function(x){return x.id===id})[0];if(!m)return;menuId=id;var mine=m.u===me(),rx=reacts(sub,id);
    sheet('cv-menu','<form method="dialog"><h2>Mensagem</h2><div class="cv-rxrow" role="group" aria-label="Reagir">'+REACT.map(function(e,i){var on=(rx[e]||[]).indexOf(me())>=0;return '<button type="button" aria-pressed="'+on+'" aria-label="Reagir '+E(e)+'" onclick="e99Cv.react('+i+')">'+E(e)+'</button>'}).join('')+'</div>'
      +'<div class="row toolbar"><button type="button" onclick="e99Cv.reply(\''+E(id)+'\')">Responder</button>'+(m.t?'<button type="button" onclick="e99Cv.copy()">Copiar</button>':'')+(mine?'<button type="button" class="danger" onclick="e99Cv.delAll()">Apagar para todos</button>':'')+'<button type="button" onclick="this.closest(\'dialog\').close()">Fechar</button></div></form>')},
  react:async function(i){var e=REACT[i],doc='msgs_'+sub+'~'+menuId+'~r~'+me(),cur=M[doc],on=cur&&cur.re&&cur.e===e&&!R[doc].del;var d=document.getElementById('cv-menu');if(d)d.close();
    try{if(on)await put('msgs',doc,'',true);else await put('msgs',doc,await encMsg(sub,doc,{e:e}),false);await build();refresh()}catch(x){notify('Não deu para reagir: '+(x.message||x))}},
  copy:function(){var m=msgs(sub).filter(function(x){return x.id===menuId})[0];try{navigator.clipboard.writeText(m.t)}catch(e){}var d=document.getElementById('cv-menu');if(d)d.close()},
  delAll:async function(){var d=document.getElementById('cv-menu');if(d)d.close();if(!confirm('Apagar esta mensagem para todos?'))return;try{await put('msgs','msgs_'+sub+'~'+menuId,'',true);await build();refresh()}catch(e){notify('Não deu para apagar: '+(e.message||e))}},
  pref:function(k,on){ls('lojasg.estoque99.chat-'+k,on?null:'off');if(k==='presence')presence(true)},
  state:function(){return {ctx:!!cx(),started:started,pk:window.e99CvPk(),sub:sub,convs:convs().map(function(c){return {cv:c.cv,name:c.name,unread:c.unread,last:c.last&&(c.last.del?'':c.last.t)}}),err:window.__e99CvErr||''}},
  msgs:function(cv){return msgs(cv||sub).map(function(m){return {id:m.id,u:m.u,t:m.t,del:m.del,st:m.st||''}})},
  group:function(id){var g=CV[id];return g?{nm:g.nm,m:g.m.slice(),kv:g.kv,ow:g.ow}:null}
};
})();
