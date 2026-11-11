(function(){
'use strict';
/* v136: dados da loja na nuvem — todas as contas da loja veem o mesmo (NFs, planos, equipe, corredores, conferências),
   mesmo sem outro aparelho aberto. lojas/{loja}/dados/{c}_{id}: blob cifrado com a chave do código da equipe (a mesma do sync),
   AAD = loja|docId. Acesso por prova (HKDF do código). Papel na nuvem = papeis/{uid} (sem documento = nível auxiliar).
   Sem login anônimo: conta sem nuvem/e-mail vê "Ligue o e-mail para ver os dados da loja" e continua recebendo pelo ntfy. */
var K=window.e99SyncCore;if(!K||!window.e99Cloud)return;
var C=K.C,AUXC=['nfs','plans','confs'];
var FS=null,db=null,uid='',loja='',ch=null,unsubD=null,unsubP=null,papeis={},cuids={},cloudAt={},denied={},gen=0,status='off',lastAt=0,pushing=false,pushTimer=0,lastErr='',chain=Promise.resolve(),runKey='',loaded={},entChecked={};
function ls(k){try{return localStorage.getItem(k)}catch(e){return null}}
function team(){return window.e99Team&&window.e99Team.get()}
function sy(){return K.sy()}
function cl(){var s=sy();if(!s.cloud||typeof s.cloud!=='object')s.cloud={cursor:0,seeded:false,loja:''};if(!Array.isArray(s.cloudPend))s.cloudPend=[];return s.cloud}
function user(){try{return e99Cloud.user()}catch(e){return null}}
function hasMail(){return !!(authSession&&ls('lojasg.estoque99.cloud-email:'+authSession.storeKey))}
function isGestor(){return !!(authSession&&authSession.payload.role==='gestor')}
function hex(b){return Array.from(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2)}).join('')}
async function prova(code){var k=await crypto.subtle.importKey('raw',authBytes(authNormalizeCode(code)),'HKDF',false,['deriveBits']);return hex(await crypto.subtle.deriveBits({name:'HKDF',hash:'SHA-256',salt:authBytes('e99-prova'),info:authBytes('stok-loja')},k,256))}
async function seal(docId,o){var iv=crypto.getRandomValues(new Uint8Array(12));var ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:authBytes(loja+'|'+docId)},ch.key,authBytes(JSON.stringify(o))));var out=new Uint8Array(12+ct.length);out.set(iv);out.set(ct,12);return 'S99:'+authB64(out)}
async function unseal(docId,s){if(typeof s!=='string'||s.indexOf('S99:')!==0)return null;try{var b=authUn64(s.slice(4));return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:b.slice(0,12),additionalData:authBytes(loja+'|'+docId)},ch.key,b.slice(12))))}catch(e){return null}}
function slim(x){return JSON.parse(JSON.stringify(x,function(k,v){return typeof v==='string'&&v.length>2000&&/^data:/.test(v)?'':v}))}
function L(){return db.collection('lojas').doc(loja)}
function paint(){try{K.paint()}catch(e){}var n=document.getElementById('loja-note');if(n){var h=noteHTML();if(h)n.outerHTML=h;else n.remove()}}
/* ---------- ligar ---------- */
function stopListen(){if(unsubD){try{unsubD()}catch(e){}unsubD=null}if(unsubP){try{unsubP()}catch(e){}unsubP=null}clearTimeout(pushTimer)}
function stop(){gen++;stopListen();db=null;ch=null;uid='';loja='';papeis={};cuids={};cloudAt={};denied={};status='off'}
async function access(t){var p=await prova(t.code),me=L().collection('acesso').doc(uid);
  try{if((await me.get()).exists)return}catch(e){}
  if(isGestor())try{await L().collection('acesso').doc('_raiz').set({prova:p})}catch(e){}
  await me.set({prova:p})}
async function start(){var my=++gen;stopListen();var t=team();
  if(!authSession||!t||!t.sync||!K.active()||!K.chan()){status='off';paint();return}
  var u=user();if(!u){status=hasMail()?'entrando':'sem-nuvem';paint();return}
  var c;try{c=await e99Cloud.load()}catch(e){status='erro';paint();return}
  if(my!==gen)return;db=c.db;FS=firebase.firestore;uid=u.uid;ch=K.chan();loja=await e99Cloud.sid();if(my!==gen||!loja)return;
  var cc=cl();if(cc.loja!==loja){cc.loja=loja;cc.cursor=0;cc.seeded=false}
  status='entrando';paint();
  try{await access(t)}catch(e){if(my!==gen)return;status='sem-acesso';lastErr=e&&e.code||'';paint();return}
  if(my!==gen)return;
  try{var pq=await L().collection('papeis').get();papeis={};pq.forEach(function(d){papeis[d.id]=(d.data()||{}).role})}catch(e){}
  unsubP=L().collection('papeis').onSnapshot(function(q){papeis={};q.forEach(function(d){papeis[d.id]=(d.data()||{}).role});denied={};schedulePush(800)},function(){});
  confirmPapeis();
  if(!cc.seeded){try{await seed(my)}catch(e){if(my!==gen)return;status='erro';lastErr=e&&e.code||'';paint();return}}
  if(my!==gen)return;listen(my)}
async function seed(my){var q=await L().collection('dados').get();if(my!==gen)return;var docs=[];q.forEach(function(d){docs.push(d)});await take(docs);
  var s=sy(),cc=cl();if(!s.ready){s.ready=true;s.replace=false;try{K.dropDefaults()}catch(e){}}
  K.stamp();reconcile();cc.seeded=true;lastAt=Date.now();status='ok';await K.persist();K.render();paint();schedulePush(300)}
function listen(my){var q=L().collection('dados').where('st','>',FS.Timestamp.fromMillis(cl().cursor||0)).orderBy('st');
  unsubD=q.onSnapshot(function(snap){if(my!==gen)return;var docs=[];snap.docChanges().forEach(function(x){if(x.type!=='removed'&&!x.doc.metadata.hasPendingWrites)docs.push(x.doc)});
    chain=chain.then(async function(){if(my!==gen)return;if(docs.length)await take(docs);if(!snap.metadata.fromCache){lastAt=Date.now();status='ok'}paint()}).catch(function(){})},
   function(e){if(my!==gen)return;status='erro';lastErr=e&&e.code||'';paint()})}
/* ---------- receber ---------- */
function auxCloud(op,x,who){if(op.d||AUXC.indexOf(op.c)<0)return null;if(op.c==='confs')return K.confOp(op,{r:'auxiliar',dev:op.x.dev});
  var cur=K.arr(op.c).find(function(y){return y&&y.id===op.i});
  if(!cur)return Object.assign({},op,{x:Object.assign({},op.x,{cby:op.x.cby||who})});
  if(x.cuid!==x.by)return null;
  var nx=Object.assign({},op.x);['cby','cdev','clogin'].forEach(function(k){if(cur[k])nx[k]=cur[k]});return Object.assign({},op,{x:nx})}
async function take(docs){var ops=[],cc=cl(),max=cc.cursor||0;
  for(var i=0;i<docs.length;i++){var d=docs[i],x=d.data();if(!x)continue;var st=x.st&&x.st.toMillis?x.st.toMillis():0;if(st>max)max=st;
    var id=d.id,p=id.indexOf('_'),c=id.slice(0,p),rest=id.slice(p+1);if(C.indexOf(c)<0||x.c!==c||!Number.isFinite(Number(x.at)))continue;
    cuids[id]=x.cuid;cloudAt[id]=Math.max(cloudAt[id]||0,Number(x.at));
    var f=rest.indexOf('~f~'),item=f<0?rest:rest.slice(0,f);if(!K.okId(item))continue;
    var pl=null;if(!x.del){pl=await unseal(id,x.d);if(!pl||!pl.x||typeof pl.x!=='object'||pl.x.id!==item)continue}
    var who=pl&&typeof pl.b==='string'&&pl.b?pl.b.slice(0,40):'Alguém';
    var op={c:c,i:item,t:Number(x.at),b:who};if(x.del)op.d=1;else op.x=pl.x;
    if(f>=0){if(op.d||c!=='plans')continue;op=K.auxPlanOp(op);if(op){delete op.fix;ops.push(op)}continue}
    var role=x.by===uid?(K.amAux()?'auxiliar':'gestor'):(papeis[x.by]||'auxiliar');
    if(role==='auxiliar')op=auxCloud(op,x,who);else if(c==='confs'&&!op.d)op=K.confOp(op,{r:'gestor',dev:op.x.dev});
    if(op)ops.push(op)}
  if(ops.length)await K.applyOps(ops,false,'Nuvem');
  if(max>(cc.cursor||0)){cc.cursor=max;await K.persist()}}
/* ---------- enviar ---------- */
function reconcile(){if(K.amAux())return;var s=sy(),cp=new Set(s.cloudPend||[]);C.forEach(function(c){Object.keys(s.meta[c]||{}).forEach(function(id){var m=s.meta[c][id],a=cloudAt[c+'_'+id]||0;if(m[0]>a&&!(m[2]&&!a))cp.add(c+'|'+id)})});s.cloudPend=Array.from(cp)}
function schedulePush(ms){if(!db)return;clearTimeout(pushTimer);pushTimer=setTimeout(push,ms==null?1500:ms)}
async function build(k){var p=k.indexOf('|'),c=k.slice(0,p),id=k.slice(p+1),s=sy(),m=s.meta[c]&&s.meta[c][id];if(!m)return null;var docId=c+'_'+id;
  if(K.amAux()){if(AUXC.indexOf(c)<0||m[2])return null;var cu=cuids[docId];if(cu&&cu!==uid){if(c!=='plans')return null;docId+='~f~'+uid}}
  if((cloudAt[docId]||0)>m[0])return null;
  var x=null;if(!m[2]){x=K.arr(c).find(function(y){return y&&y.id===id});if(!x)return null}
  var data={c:c,at:Math.floor(m[0]),st:FS.FieldValue.serverTimestamp(),by:uid,cuid:cuids[docId]||uid,del:!!m[2],v:1,d:''};
  if(x){var d=await seal(docId,{x:x,b:m[1]});if(d.length>900000){data.slim=true;d=await seal(docId,{x:slim(x),b:m[1]});if(d.length>900000)return null}data.d=d}
  return {k:k,id:docId,t:m[0],ref:L().collection('dados').doc(docId),data:data}}
function done(w){var s=sy(),p=w.k.indexOf('|'),m=s.meta[w.k.slice(0,p)]&&s.meta[w.k.slice(0,p)][w.k.slice(p+1)];cloudAt[w.id]=Math.max(cloudAt[w.id]||0,w.t);cuids[w.id]=w.data.cuid;if(!m||m[0]===w.t)s.cloudPend=s.cloudPend.filter(function(x){return x!==w.k})}
var REJ=/permission-denied|invalid-argument|failed-precondition/;
async function push(){if(pushing||!db||!ch||status==='sem-acesso')return;var s=sy();cl();var keys=s.cloudPend.filter(function(k){return !denied[k]});if(!keys.length)return;pushing=true;paint();var more=false,again=false;
  try{var ws=[],drop=[];for(var i=0;i<keys.length&&ws.length<200;i++){var w=await build(keys[i]);if(w)ws.push(w);else drop.push(keys[i])}
    if(drop.length){var ds=new Set(drop);s.cloudPend=s.cloudPend.filter(function(k){return !ds.has(k)})}
    if(ws.length){var b=db.batch();ws.forEach(function(w){b.set(w.ref,w.data)});
      try{await b.commit();ws.forEach(done)}catch(e){if(!REJ.test(e&&e.code||''))throw e;for(var j=0;j<ws.length;j++){try{await ws[j].ref.set(ws[j].data);done(ws[j])}catch(e2){if(REJ.test(e2&&e2.code||''))denied[ws[j].k]=1;else throw e2}}}}
    lastErr='';more=sy().cloudPend.some(function(k){return !denied[k]});await K.persist()}
  catch(e){lastErr=e&&e.code||'rede';again=true}
  finally{pushing=false;paint()}
  if(again)schedulePush(60000);else if(more)schedulePush(500)}
/* gestor confirma o papel das contas que vieram de convite dele (e o próprio) */
async function confirmPapeis(){if(!db||!isGestor())return;try{if(papeis[uid]!=='gestor'){await L().collection('papeis').doc(uid).set({role:'gestor',at:Date.now()});papeis[uid]='gestor'}}catch(e){}
  var inv=[];try{inv=JSON.parse(localStorage.getItem('lojasg.estoque99.aux-invites:'+authSession.storeKey)||'[]')||[]}catch(e){}if(!Array.isArray(inv))inv=[];
  var mem=window.e99CloudMembers?window.e99CloudMembers():[];
  for(var i=0;i<mem.length;i++){var m=mem[i];if(!m||!m.uid||m.uid===uid||papeis[m.uid])continue;var x=inv.find(function(v){return v&&((v.inviteId&&v.inviteId===m.inviteId)||(v.login&&m.login&&authLoginName(v.login)===authLoginName(m.login)))});if(!x)continue;
    var r=x.papel==='estoque'?'estoque':'auxiliar';try{await L().collection('papeis').doc(m.uid).set({role:r,at:Date.now()});papeis[m.uid]=r}catch(e){}}}
/* conta solta: o gestor a põe na loja pelo e-mail; ela lê entradas/{email} ao entrar e liga a equipe */
async function entradas(){var u=user();if(!authSession||team()||!u||!u.emailVerified||!u.email)return;var k=authSession.storeKey+'|'+u.uid;if(entChecked[k])return;entChecked[k]=1;
  try{var c=await e99Cloud.load(),d=await c.db.collection('entradas').doc(u.email.toLowerCase()).get();if(!d.exists||team())return;var x=d.data()||{};if(typeof x.code!=='string')return;
    await window.e99Team.join(x.code,String(authSession.payload.name||authSession.record.login).slice(0,40),{team:typeof x.team==='string'&&x.team?x.team.slice(0,40):'Equipe'});await window.e99Team.setSync(true,{replace:false});
    notify('Você entrou na equipe da loja. Os dados da loja vão chegar sozinhos.');try{render()}catch(e){}}catch(e){entChecked[k]=0}}
window.e99LojaAddMail=async function(ev){ev.preventDefault();var f=ev.target,em=String(f.elements.email.value||'').trim().toLowerCase(),t=team();
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)){notify('Digite um e-mail válido.');return}if(!db||!t||status==='sem-acesso'){notify('Ligue a nuvem (e-mail) desta conta para adicionar contas pelo e-mail.');return}
  try{await db.collection('entradas').doc(em).set({code:t.code,team:String(t.team||'Equipe').slice(0,80),loja:loja,at:Date.now()});f.reset();notify('Pronto. Quando essa conta entrar com o e-mail confirmado, ela entra na equipe sozinha.')}catch(e){notify('Não foi possível adicionar ('+(e&&e.code||'erro')+').')}};
/* ---------- tela ---------- */
function hhmm(t){var d=new Date(t);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function noteHTML(){var t=team();if(!authSession||!t||!t.sync)return '';
  if(status==='sem-nuvem')return '<div class="panel help" id="loja-note"><h2>Ligue o e-mail para ver os dados da loja</h2><p>Com o e-mail ligado à nuvem, esta conta vê as notas, planos, corredores, equipe e conferências da loja mesmo sem outro aparelho aberto. Sem ele, os dados só chegam quando alguém da equipe está com o Stok aberto.</p><div class="row toolbar"><button type="button" onclick="e99CloudOpen&&e99CloudOpen()">Ligar o e-mail</button></div></div>';
  if(status==='sem-acesso')return '<p class="small" id="loja-note">Dados da loja na nuvem: aguardando o gestor abrir o Stok uma vez com a nuvem ligada.</p>';
  if(status!=='ok')return '';var n=(sy().cloudPend||[]).length;
  return '<p class="small" id="loja-note">Dados da loja na nuvem · atualizado às '+hhmm(lastAt||Date.now())+(n?' · '+n+(n===1?' mudança esperando':' mudanças esperando')+' internet':'')+'</p>'}
var rd=render;render=function(){var r=rd.apply(this,arguments);try{if(authSession&&page==='home'&&!document.getElementById('loja-note')){var h=noteHTML(),hero=h&&document.querySelector('#view .hero');if(hero)hero.insertAdjacentHTML('afterend',h)}
  if(page==='chat'&&isGestor()&&!document.getElementById('loja-add')){var b=document.querySelector('#aux-box .sync-body');if(b)b.insertAdjacentHTML('beforeend','<form id="loja-add" onsubmit="e99LojaAddMail(event)"><label>Adicionar conta existente pelo e-mail<input name="email" type="email" required maxlength="120" autocomplete="off"></label><button type="submit">Adicionar</button><p class="small" style="margin:0">Para contas já criadas em outro aparelho: ao entrar com o e-mail confirmado, ela entra na equipe e vê os dados da loja.</p></form>')}}catch(e){}return r};
var sv=save;save=async function(){var r=await sv.apply(this,arguments);if(db&&sy().cloudPend&&sy().cloudPend.length)schedulePush(1200);return r};
/* ---------- ciclo ---------- */
function tick(){if(!authSession){if(runKey){runKey='';stop();}return}
  if(hasMail()&&!user()&&!loaded[authSession.storeKey]){loaded[authSession.storeKey]=1;e99Cloud.load().catch(function(){})}
  entradas();var t=team(),u=user(),c=K.chan();var key=authSession.storeKey+'|'+(t&&t.sync?1:0)+'|'+(c?c.topic:'')+'|'+(u?u.uid:'')+'|'+(K.active()?1:0);
  if(key!==runKey){runKey=key;start().catch(function(){})}}
setInterval(tick,3000);setTimeout(tick,500);
setInterval(function(){if(document.hidden||!db)return;if(status==='sem-acesso'||status==='erro'){runKey='';tick();return}if(cl().seeded)reconcile();confirmPapeis();schedulePush(200)},60000);
addEventListener('online',function(){if(status==='erro'||status==='sem-acesso')runKey='';else schedulePush(300)});
document.addEventListener('visibilitychange',function(){if(!document.hidden&&db)schedulePush(300)});
window.e99Loja={start:function(){runKey='';tick()},stop:stop,pushNow:function(){return push()},reconcile:reconcile,status:function(){return {status:status,pend:(sy().cloudPend||[]).length,lastAt:lastAt,loja:loja,uid:uid,seeded:!!cl().seeded,err:lastErr,denied:Object.keys(denied).length,papeis:Object.assign({},papeis)}}};
})();
