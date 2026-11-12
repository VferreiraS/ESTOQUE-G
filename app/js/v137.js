(function(){
'use strict';
/* v137: Equipe como rede social — mural (posts, curtidas, comentários), stories de 24 h e página de cada pessoa.
   Dados pela nuvem da v136 (lojas/{loja}/dados/{c}_{id}, mesmo blob cifrado AES-GCM com a chave da equipe, AAD loja|docId).
   posts_{id}, posts_{id}~l~{uid} (curtida), comments_{id}, stories_{id}, perfis_{uid}. Nunca apaga: exclusão = del:true.
   Tudo da rede passa por esc(); foto só JPEG data: verificada → blob:. Nada aqui dá papel. */
var SOC=['posts','comments','stories','perfis'],DAY=864e5,MAXPH=340000,PH=/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/;
var S={},gen=0,unsub=null,ctxKey='',pend=[],limit=20,urls={},draft={t:'',ph:''},stDraft=null,pessoa='',viewer=null,timer=0,started=false;
function E(v){return esc(v)}
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
function cx(){return window.e99Loja&&window.e99Loja.ctx&&window.e99Loja.ctx()}
function me(){var c=cx();return c?c.uid:''}
function isAux(){return !!(authSession&&authSession.payload.role==='auxiliar')}
function canMod(){return !!(authSession&&!isAux())}
function rid(p){return p+Date.now().toString(36)+Array.from(crypto.getRandomValues(new Uint8Array(5)),function(b){return (b%36).toString(36)}).join('')}
function nowMs(){return Date.now()}
function myName(){var p=state.perfil;return String(p&&p.name||authSession&&(authSession.payload.name||authSession.record.login)||'Eu').slice(0,40)}
function myLogin(){return String(authSession?authSession.record.login:'').slice(0,80)}
function okPh(d){return typeof d==='string'&&d.length<=MAXPH&&PH.test(d)}
function str(v,n){return typeof v==='string'?v.slice(0,n):''}
function img(d){if(!okPh(d))return '';if(urls[d])return urls[d];try{var b=atob(d.split(',')[1]),a=new Uint8Array(b.length);for(var i=0;i<b.length;i++)a[i]=b.charCodeAt(i);urls[d]=URL.createObjectURL(new Blob([a],{type:'image/jpeg'}))}catch(e){urls[d]=''}return urls[d]}
/* ---------- dados recebidos ---------- */
function clean(c,x,id){if(!x||typeof x!=='object')return null;var o={};
  if(c==='perfis')return {id:id,name:str(x.name,40),cargo:str(x.cargo,40),bio:str(x.bio,200),photo:okPh(x.photo)?x.photo:'',cover:okPh(x.cover)?x.cover:'',lg:str(x.lg,80)};
  o.id=str(x.id,100);o.n=str(x.n,40);o.lg=str(x.lg,80);
  if(c==='posts'&&x.l){o.l=1;return o}
  o.t=str(x.t,c==='comments'?500:1000);if(c!=='comments')o.ph=okPh(x.ph)?x.ph:'';if(c==='comments')o.p=str(x.p,100);return o}
async function takeDoc(c0,d){var x=d.data();if(!x||SOC.indexOf(x.c)<0)return;var id=d.id,c=x.c;if(id.indexOf(c+'_')!==0)return;var key=id.slice(c.length+1);
  var at=Number(x.at)||0,cur=S[id];if(cur&&cur.at>at)return;
  if(x.del){S[id]={id:id,c:c,at:at,cuid:x.cuid,del:true};return}
  var pl=await c0.unseal(id,x.d);if(!pl||!pl.x)return;var lk=key.indexOf('~l~');var base=lk<0?key:key.slice(0,lk);
  var o=clean(c,pl.x,base);if(!o||(c!=='perfis'&&o.id!==base))return;if(c==='perfis'&&base!==x.cuid)return;if(lk>=0&&(c!=='posts'||!o.l||key.slice(lk+3)!==x.cuid))return;
  S[id]={id:id,c:c,at:at,cuid:String(x.cuid||''),del:false,x:o,like:lk>=0}}
function listen(){var c=cx(),k=c?c.loja+'|'+c.uid:'';if(k===ctxKey)return;ctxKey=k;gen++;if(unsub){try{unsub()}catch(e){}unsub=null}S={};if(!c)return;var my=gen,chain=Promise.resolve();
  unsub=c.L().collection('dados').where('c','in',SOC).onSnapshot(function(q){var docs=[];q.docChanges().forEach(function(ch){if(ch.type!=='removed')docs.push(ch.doc)});
    chain=chain.then(async function(){if(my!==gen)return;for(var i=0;i<docs.length;i++)await takeDoc(c,docs[i]);started=true;refresh();pushPerfil()}).catch(function(e){window.__e99SocErr=String(e)})},function(e){window.__e99SocErr=e&&e.code||String(e);ctxKey=''});flush()}
/* ---------- gravar ---------- */
async function write(c,docId,x,del,cuid){var k=cx();if(!k){pend.push([c,docId,x,del,cuid]);return false}
  var at=Math.max(nowMs(),(S[docId]&&S[docId].at||0)+1),data={c:c,at:Math.floor(at),st:k.FS.FieldValue.serverTimestamp(),by:k.uid,cuid:cuid||k.uid,del:!!del,v:1,d:''};
  if(!del)data.d=await k.seal(docId,{x:x,b:myName()});
  S[docId]=del?{id:docId,c:c,at:at,cuid:data.cuid,del:true}:{id:docId,c:c,at:at,cuid:data.cuid,del:false,x:clean(c,x,c==='perfis'?k.uid:x.id),like:docId.indexOf('~l~')>0};refresh();
  try{await k.L().collection('dados').doc(docId).set(data);return true}catch(e){if(!/permission-denied|invalid-argument/.test(e&&e.code||''))pend.push([c,docId,x,del,cuid]);else notify('A nuvem recusou ('+(e.code||'erro')+').');return false}}
async function flush(){if(!cx()||!pend.length)return;var p=pend.splice(0);for(var i=0;i<p.length;i++)await write.apply(null,p[i])}
setInterval(function(){listen();flush()},3000);addEventListener('online',flush);
/* ---------- consultas ---------- */
function live(c){return Object.keys(S).map(function(k){return S[k]}).filter(function(r){return r.c===c&&!r.del&&r.x&&!r.like})}
function posts(){return live('posts').sort(function(a,b){return b.at-a.at})}
function likes(pid){return Object.keys(S).filter(function(k){var r=S[k];return r.like&&!r.del&&k.indexOf('posts_'+pid+'~l~')===0}).map(function(k){return S[k]})}
function comments(pid){return live('comments').filter(function(r){return r.x.p===pid}).sort(function(a,b){return a.at-b.at})}
function stories(){var t=nowMs();return live('stories').filter(function(r){return t-r.at<DAY&&r.at<=t+6e4}).sort(function(a,b){return a.at-b.at})}
function perfil(uid){var r=S['perfis_'+uid];return r&&!r.del&&r.x?r.x:null}
function nameOf(r){var p=perfil(r.cuid);return p&&p.name||r.x&&r.x.n||'Alguém'}
function loginOf(r){var p=perfil(r.cuid);return p&&p.lg||r.x&&r.x.lg||''}
function av(uid,name,cls){var p=perfil(uid),u=p&&p.photo?img(p.photo):'';if(uid===me()&&!u&&state.perfil&&state.perfil.photo)u=img(state.perfil.photo);
  return u?'<img class="sc-av '+(cls||'')+'" src="'+E(u)+'" alt="">':'<span class="sc-av '+(cls||'')+'" aria-hidden="true">'+E((String(name||'?').trim()[0]||'?').toUpperCase())+'</span>'}
function when(t){var d=nowMs()-t;if(d<6e4)return 'agora';if(d<36e5)return Math.floor(d/6e4)+' min';if(d<DAY)return Math.floor(d/36e5)+' h';var x=new Date(t);return ('0'+x.getDate()).slice(-2)+'/'+('0'+(x.getMonth()+1)).slice(-2)+'/'+x.getFullYear()}
function seenKey(){return 'lojasg.estoque99.st-seen:'+(authSession?authSession.storeKey:'')}
function seen(){try{return JSON.parse(ls(seenKey())||'[]')||[]}catch(e){return []}}
function markSeen(id){var s=seen();if(s.indexOf(id)<0){s.push(id);ls(seenKey(),JSON.stringify(s.slice(-300)))}}
/* ---------- fotos ---------- */
function shrink(file,maxSide){return new Promise(function(res,rej){if(!file||file.size>20*1024*1024){rej(Error('A foto passa de 20 MB.'));return}var u=URL.createObjectURL(file),im=new Image();
  im.onload=function(){URL.revokeObjectURL(u);try{var c=document.createElement('canvas'),side=maxSide,d='';for(var a=0;a<7;a++){var s=Math.min(1,side/Math.max(im.naturalWidth,im.naturalHeight));c.width=Math.max(1,Math.round(im.naturalWidth*s));c.height=Math.max(1,Math.round(im.naturalHeight*s));var g=c.getContext('2d');g.fillStyle='#000';g.fillRect(0,0,c.width,c.height);g.drawImage(im,0,0,c.width,c.height);d=c.toDataURL('image/jpeg',.8-a*.07);if(d.length<=MAXPH)break;side=Math.round(side*.8)}
    if(!okPh(d))throw Error('Esta imagem ainda está grande.');res(d)}catch(e){rej(e)}};im.onerror=function(){URL.revokeObjectURL(u);rej(Error('Formato de imagem não suportado.'))};im.src=u})}
/* ---------- ações ---------- */
window.e99SocPhoto=async function(inp){var f=inp.files&&inp.files[0];inp.value='';if(!f)return;try{draft.ph=await shrink(f,1280);refresh(true)}catch(e){notify(e.message)}};
window.e99SocPhotoRm=function(){draft.ph='';refresh(true)};
window.e99SocDraft=function(t){draft.t=String(t.value||'').slice(0,1000)};
window.e99SocPost=async function(ev){if(ev)ev.preventDefault();var t=String(draft.t||'').trim().slice(0,1000);if(!t&&!draft.ph){notify('Escreva algo ou escolha uma foto.');return}if(!cx()){notify('Ligue o e-mail (nuvem) para publicar no mural.');return}
  var id=rid('p');var x={id:id,t:t,ph:draft.ph||'',n:myName(),lg:myLogin()};draft={t:'',ph:''};await write('posts','posts_'+id,x,false);notify('Publicado no mural.')};
window.e99SocLike=async function(pid){var u=me();if(!u)return;var k='posts_'+pid+'~l~'+u,r=S[k],on=!(r&&!r.del);await write('posts',k,{id:pid,l:1,n:myName(),lg:myLogin()},!on)};
window.e99SocComment=async function(ev,pid){ev.preventDefault();var f=ev.target,t=String(f.elements.t.value||'').trim().slice(0,500);if(!t)return;var id=rid('c');f.reset();await write('comments','comments_'+id,{id:id,p:pid,t:t,n:myName(),lg:myLogin()},false)};
window.e99SocDel=async function(docId){var r=S[docId];if(!r||r.del)return;var mine=r.cuid===me();if(!mine&&!canMod())return;
  if(!confirm(mine?'Apagar esta publicação?':'Apagar o conteúdo de '+nameOf(r)+'? (moderação)'))return;await write(r.c,docId,null,true,r.cuid)};
window.e99SocMore=function(){limit+=20;refresh(true)};
window.e99SocLikers=function(pid){var l=likes(pid).map(function(r){return nameOf(r)});alert(l.length?'Curtiram: '+l.join(', '):'Ninguém curtiu ainda.')};
/* stories */
window.e99StNew=function(){stDraft={t:'',ph:''};openSheet()};
function openSheet(){var d=document.getElementById('st-new');if(!d){d=document.createElement('dialog');d.id='st-new';d.className='sc-sheet';document.body.appendChild(d)}
  d.innerHTML='<form method="dialog" onsubmit="e99StSave(event)"><h2>Novo status</h2><p class="small">Some em 24 horas.</p><label>Texto<textarea name="t" maxlength="300" rows="3"></textarea></label><label class="as-file">Foto (opcional)<input type="file" accept="image/*" onchange="e99StPhoto(this)"></label><div id="st-prev">'+(stDraft.ph?'<img class="sc-prev" src="'+E(img(stDraft.ph))+'" alt="Prévia">':'')+'</div><div class="row toolbar"><button type="button" onclick="this.closest(\'dialog\').close()">Cancelar</button><button class="primary" type="submit">Publicar</button></div></form>';
  if(!d.open)d.showModal()}
window.e99StPhoto=async function(inp){var f=inp.files&&inp.files[0];if(!f)return;try{stDraft.ph=await shrink(f,1080);var p=document.getElementById('st-prev');if(p)p.innerHTML='<img class="sc-prev" src="'+E(img(stDraft.ph))+'" alt="Prévia">'}catch(e){notify(e.message)}};
window.e99StSave=async function(ev){ev.preventDefault();var t=String(ev.target.elements.t.value||'').trim().slice(0,300);if(!t&&!stDraft.ph){notify('Escreva algo ou escolha uma foto.');return}if(!cx()){notify('Ligue o e-mail (nuvem) para publicar status.');return}
  var id=rid('s');document.getElementById('st-new').close();await write('stories','stories_'+id,{id:id,t:t,ph:stDraft.ph||'',n:myName(),lg:myLogin()},false);stDraft=null};
function groups(){var g={},o=[];stories().forEach(function(r){if(!g[r.cuid]){g[r.cuid]=[];o.push(r.cuid)}g[r.cuid].push(r)});return o.map(function(u){return {uid:u,items:g[u]}})}
window.e99StOpen=function(u){var gs=groups(),i=gs.findIndex(function(g){return g.uid===u});if(i<0)return;var sn=seen(),j=gs[i].items.findIndex(function(r){return sn.indexOf(r.id)<0});viewer={g:i,i:j<0?0:j};showStory()};
function closeStory(){clearTimeout(timer);viewer=null;var v=document.getElementById('st-view');if(v)v.remove();refresh(true)}
window.e99StClose=closeStory;
window.e99StStep=function(n){if(!viewer)return;var gs=groups(),g=gs[viewer.g];if(!g){closeStory();return}viewer.i+=n;
  if(viewer.i<0){viewer.g--;if(viewer.g<0){viewer.g=0;viewer.i=0}else viewer.i=gs[viewer.g].items.length-1}
  else if(viewer.i>=g.items.length){viewer.g++;viewer.i=0;if(viewer.g>=gs.length){closeStory();return}}showStory()};
function showStory(){clearTimeout(timer);var gs=groups(),g=gs[viewer.g];if(!g){closeStory();return}var r=g.items[viewer.i];markSeen(r.id);
  var v=document.getElementById('st-view');if(!v){v=document.createElement('div');v.id='st-view';v.setAttribute('role','dialog');v.setAttribute('aria-modal','true');v.setAttribute('aria-label','Status');document.body.appendChild(v)}
  var bars=g.items.map(function(x,k){return '<i class="'+(k<viewer.i?'done':k===viewer.i?'on':'')+'"><b></b></i>'}).join('');
  var del=(r.cuid===me()||canMod())?'<button type="button" class="sc-x" onclick="e99StClose();e99SocDel(\''+E(r.id)+'\')">Apagar</button>':'';
  v.innerHTML='<div class="st-bars">'+bars+'</div><div class="st-top">'+av(r.cuid,nameOf(r))+'<b>'+E(nameOf(r))+'</b><span class="small">'+E(when(r.at))+'</span>'+del+'<button type="button" class="sc-x" aria-label="Fechar" onclick="e99StClose()">Fechar</button></div>'
   +'<div class="st-body">'+(r.x.ph?'<img src="'+E(img(r.x.ph))+'" alt="Foto do status">':'')+(r.x.t?'<p>'+E(r.x.t)+'</p>':'')+'</div>'
   +'<button type="button" class="st-prev" aria-label="Anterior" onclick="e99StStep(-1)"></button><button type="button" class="st-next" aria-label="Próximo" onclick="e99StStep(1)"></button>';
  timer=setTimeout(function(){window.e99StStep(1)},5000)}
document.addEventListener('keydown',function(e){if(!viewer)return;if(e.key==='Escape')closeStory();else if(e.key==='ArrowRight')window.e99StStep(1);else if(e.key==='ArrowLeft')window.e99StStep(-1)});
/* perfil na nuvem */
var lastPf='';
function pushPerfil(force){var u=me(),p=state.perfil;if(!u||!started)return;var cur=perfil(u),cover=cur&&cur.cover||'';
  var x={id:u,name:String(p&&p.name||myName()).slice(0,40),cargo:p&&p.cargo||'',bio:p&&p.bio||'',photo:p&&p.photo||'',cover:cover,lg:myLogin()};var sig=JSON.stringify(x);
  if(!force&&(sig===lastPf||(cur&&JSON.stringify(Object.assign({},cur,{id:u}))===JSON.stringify(Object.assign({},clean('perfis',x,u))))))return;lastPf=sig;write('perfis','perfis_'+u,x,false)}
window.e99SocCover=async function(inp){var f=inp.files&&inp.files[0];inp.value='';if(!f)return;try{var d=await shrink(f,1200);setCover(d)}catch(e){notify(e.message)}};
window.e99SocCoverRm=function(){setCover('')};
function setCover(d){var u=me();if(!u){notify('Ligue o e-mail (nuvem) para mudar a capa.');return}var p=state.perfil||{},x={id:u,name:String(p.name||myName()).slice(0,40),cargo:p.cargo||'',bio:p.bio||'',photo:p.photo||'',cover:d,lg:myLogin()};lastPf=JSON.stringify(x);write('perfis','perfis_'+u,x,false)}
var ps=window.e99PerfilSave;if(ps)window.e99PerfilSave=async function(){var r=await ps.apply(this,arguments);setTimeout(function(){pushPerfil(true)},300);return r};
/* ---------- tela ---------- */
function postHTML(r){var pid=r.x.id,ls_=likes(pid),liked=ls_.some(function(l){return l.cuid===me()}),cs=comments(pid),name=nameOf(r);
  var del=(r.cuid===me()||canMod())?'<button type="button" class="sc-link" onclick="e99SocDel(\''+E(r.id)+'\')">'+(r.cuid===me()?'Apagar':'Apagar (moderação)')+'</button>':'';
  return '<article class="panel sc-post" data-post="'+E(pid)+'"><header>'+'<button type="button" class="sc-who" onclick="e99Pessoa(\''+E(r.cuid)+'\')">'+av(r.cuid,name)+'<span><b>'+E(name)+'</b><span class="small">'+(loginOf(r)?'@'+E(loginOf(r))+' · ':'')+E(when(r.at))+'</span></span></button>'+del+'</header>'
   +(r.x.t?'<p class="sc-text">'+E(r.x.t)+'</p>':'')+(r.x.ph?'<img class="sc-img" src="'+E(img(r.x.ph))+'" alt="Foto da publicação" loading="lazy">':'')
   +'<div class="sc-acts"><button type="button" class="sc-like" aria-pressed="'+liked+'" onclick="e99SocLike(\''+E(pid)+'\')">'+(liked?'Curtido':'Curtir')+'</button><button type="button" class="sc-link sc-count" onclick="e99SocLikers(\''+E(pid)+'\')">'+ls_.length+(ls_.length===1?' curtida':' curtidas')+'</button><span class="small">'+cs.length+(cs.length===1?' comentário':' comentários')+'</span></div>'
   +'<div class="sc-cmts">'+cs.map(function(c){var n=nameOf(c);return '<div class="sc-cmt">'+av(c.cuid,n,'sm')+'<div><b>'+E(n)+'</b> '+E(c.x.t)+'<div class="small">'+E(when(c.at))+((c.cuid===me()||canMod())?' · <button type="button" class="sc-link" onclick="e99SocDel(\''+E(c.id)+'\')">Apagar</button>':'')+'</div></div></div>'}).join('')+'</div>'
   +'<form class="sc-cform" onsubmit="e99SocComment(event,\''+E(pid)+'\')"><input name="t" maxlength="500" placeholder="Escreva um comentário" aria-label="Comentário"><button type="submit">Comentar</button></form></article>'}
function storiesHTML(){var sn=seen(),u=me();var b='<button type="button" class="sc-story add" onclick="e99StNew()" aria-label="Novo status">'+av(u,myName())+'<span>Seu status</span></button>';
  return '<div class="sc-stories" role="list">'+b+groups().map(function(g){var r=g.items[g.items.length-1],n=nameOf(r),un=g.items.some(function(x){return sn.indexOf(x.id)<0});return '<button type="button" role="listitem" class="sc-story'+(un?' new':'')+'" onclick="e99StOpen(\''+E(g.uid)+'\')" aria-label="Status de '+E(n)+(un?' (não visto)':'')+'">'+av(g.uid,n)+'<span>'+E(n)+'</span></button>'}).join('')+'</div>'}
function muralHTML(){if(!cx())return '<section id="sc-mural" class="sc"><div class="panel help"><h2>Mural da equipe</h2><p class="small">Ligue o e-mail (nuvem) desta conta e entre na equipe para ver e publicar no mural, nos status e nos perfis.</p></div></section>';
  var ps=posts(),shown=ps.slice(0,limit);
  return '<section id="sc-mural" class="sc" aria-label="Mural da equipe">'+storiesHTML()
   +'<form class="panel sc-new" onsubmit="e99SocPost(event)"><h2>Mural da equipe</h2><textarea name="t" maxlength="1000" rows="3" placeholder="Compartilhe algo com a equipe" aria-label="Texto da publicação" oninput="e99SocDraft(this)">'+E(draft.t)+'</textarea>'
   +(draft.ph?'<div class="sc-prevbox"><img class="sc-prev" src="'+E(img(draft.ph))+'" alt="Prévia da foto"><button type="button" onclick="e99SocPhotoRm()">Tirar foto</button></div>':'')
   +'<div class="row toolbar"><label class="as-file sc-file">Foto<input type="file" accept="image/*" onchange="e99SocPhoto(this)"></label><button class="primary" type="submit">Publicar</button></div></form>'
   +(shown.length?shown.map(postHTML).join(''):'<p class="small">Nenhuma publicação ainda. Seja o primeiro.</p>')
   +(ps.length>limit?'<div class="toolbar"><button type="button" onclick="e99SocMore()">Mostrar mais</button></div>':'')+'</section>'}
/* página da pessoa */
function wk(){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime()}
function feats(names){var n=names.filter(Boolean).map(function(v){return String(v).toLowerCase().trim()}),has=function(v){return n.indexOf(String(v||'').toLowerCase().trim())>=0},w=wk(),cr=0,cf=0,acts=0;
  (state.nfs||[]).forEach(function(nf){var h=Array.isArray(nf.hist)?nf.hist:[];h.forEach(function(e){if(!Array.isArray(e)||e[0]<w||!has(e[1]))return;if(/^Criou a nota/.test(e[2]))cr++;if(/→ Conferido/.test(e[2]))cf++})});
  (state.plans||[]).forEach(function(p){(p.activities||[]).forEach(function(a){if(a&&a.done&&has(a.doneBy))acts++})});return {cr:cr,cf:cf,acts:acts}}
function render0(){if(!authSession)return '';var u=pessoa||me(),isMe=u===me()||!u,p=perfil(u)||{};
  if(isMe&&state.perfil){p=Object.assign({},p,{name:state.perfil.name||p.name,cargo:state.perfil.cargo,bio:state.perfil.bio,photo:state.perfil.photo||p.photo})}
  var name=p.name||(isMe?myName():'Pessoa'),lg=p.lg||(isMe?myLogin():''),ph=p.photo?img(p.photo):'',cv=p.cover?img(p.cover):'';
  var my=posts().filter(function(r){return r.cuid===u}),f=feats([name,isMe?myName():'']);
  return hero('Perfil','')+'<div class="panel sc-prof" id="sc-prof"><div class="sc-cover'+(cv?' img':'')+'"'+(cv?' style="background-image:url(\''+E(cv)+'\')"':'')+'></div><div class="sc-phead">'+(ph?'<img class="sc-pav" src="'+E(ph)+'" alt="Foto de '+E(name)+'">':'<span class="sc-pav" aria-hidden="true">'+E((name[0]||'?').toUpperCase())+'</span>')
   +'<div><h2>'+E(name)+'</h2><div class="small">'+(lg?'@'+E(lg):'')+(p.cargo?' · '+E(p.cargo):'')+'</div></div></div>'+(p.bio?'<p>'+E(p.bio)+'</p>':'')
   +(isMe?'<div class="row toolbar"><button type="button" onclick="openProfile(\'me\')">Editar perfil</button><label class="as-file">Capa (imagem)<input type="file" accept="image/*" onchange="e99SocCover(this)"></label>'+(p.cover?'<button type="button" onclick="e99SocCoverRm()">Capa na cor do tema</button>':'')+'</div>':'')
   +'<div class="sc-feats" aria-label="Conquistas da semana"><div><b>'+f.cr+'</b><span>notas criadas na semana</span></div><div><b>'+f.cf+'</b><span>notas conferidas na semana</span></div><div><b>'+f.acts+'</b><span>atividades feitas</span></div></div></div>'
   +'<h2 class="sc-h">Publicações</h2>'+(my.length?my.slice(0,limit).map(postHTML).join(''):'<p class="small">Nenhuma publicação.</p>')}
window.extraPages=window.extraPages||{};window.extraPages.pessoa=render0;
window.e99Pessoa=function(u){pessoa=typeof u==='string'&&/^[A-Za-z0-9]{1,128}$/.test(u)?u:'';go('pessoa')};
function peopleHTML(){var ps=Object.keys(S).filter(function(k){return k.indexOf('perfis_')===0&&!S[k].del&&S[k].x}).map(function(k){return S[k]});if(!ps.length)return '';
  return '<div class="panel"><h2>Pessoas</h2><div class="sc-people">'+ps.map(function(r){var p=r.x;return '<button type="button" class="sc-who" onclick="e99Pessoa(\''+E(r.cuid)+'\')">'+av(r.cuid,p.name)+'<span><b>'+E(p.name||'Pessoa')+'</b><span class="small">'+E(p.cargo||(p.lg?'@'+p.lg:''))+'</span></span></button>'}).join('')+'</div></div>'}
var focusIn=function(){var a=document.activeElement;return a&&a.closest&&a.closest('#sc-mural form,#st-new')&&a.value}
var rt=0;function refresh(now){clearTimeout(rt);rt=setTimeout(function(){if(!authSession||viewer)return;if(page==='team'||page==='pessoa'){if(!now&&focusIn())return;var y=scrollY;render();scrollTo(0,y)}},now?0:250)}
var rd=render;render=function(){var r=rd.apply(this,arguments);try{if(authSession&&page==='team'&&!document.getElementById('sc-mural')){var h=document.querySelector('#view .hero');if(h){h.insertAdjacentHTML('afterend',muralHTML()+peopleHTML());if(isAux())document.querySelectorAll('#view .hero button,#view .card button[onclick^="openEditor"]').forEach(function(b){b.remove()})}}}catch(e){}return r};
window.e99Social={state:function(){return {posts:posts().length,stories:stories().length,ctx:!!cx(),pend:pend.length,started:started}},S:function(){return S}};
})();
