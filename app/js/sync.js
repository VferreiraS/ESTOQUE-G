
(function(){
'use strict';
/* Sincroniza NFs, planos de ação, equipe, corredores, conferências e responsáveis das demandas entre os aparelhos da equipe.
   v148: a única via é a nuvem da loja (v136.js, lojas/{loja}/dados), tudo cifrado no aparelho com a chave do código da equipe.
   Aqui fica o núcleo local: cada item tem [quando, quem, apagado, hash]; ganha a última mudança. */
var C=['team','corridors','nfs','plans','confs','dresp'];/* v143: dresp = responsáveis das demandas (v148: também pela nuvem) */
function auxColl(c){return c==='nfs'||c==='plans'||c==='confs'}
function amAux(){return !!(authSession&&authSession.payload.role==='auxiliar')}
var DEV=(function(){var k='lojasg.estoque99.device',v='';try{v=localStorage.getItem(k)||''}catch(e){}if(!/^[a-z0-9]{12}$/.test(v)){v=Array.from(crypto.getRandomValues(new Uint8Array(12)),function(b){return 'abcdefghijklmnopqrstuvwxyz0123456789'[b%36]}).join('');try{localStorage.setItem(k,v)}catch(e){}}return v})();
var info=null,chan=null,mergeTimer=0,renderTimer=0,lastErr='',deferred=[],gen=0;
function h32(str){var h=0x811c9dc5;for(var i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}
function hashItem(x){return h32(JSON.stringify(x))}
function okId(id){return typeof id==='string'&&/^[a-zA-Z0-9_-]{1,100}$/.test(id)}
function sy(){var s=state.sync;if(!s||typeof s!=='object'){s=state.sync={meta:{},ready:false,replace:false,pending:[],topic:''}}if(!s.meta)s.meta={};C.forEach(function(c){if(!s.meta[c])s.meta[c]={}});if(!Array.isArray(s.pending))s.pending=[];return s}
function arr(c){if(!Array.isArray(state[c]))state[c]=[];return state[c]}
function active(){return !!(authSession&&info&&info.sync&&chan)}
/* ---------- canal e cifra ---------- */
async function channel(code){var n=authNormalizeCode(code);var h=new Uint8Array(await crypto.subtle.digest('SHA-256',authBytes('sync|'+n)));var hex=Array.from(h,function(x){return ('0'+x.toString(16)).slice(-2)}).join('');var topic='e99s-'+hex.slice(0,24);
  var base=await crypto.subtle.importKey('raw',authBytes(n),'PBKDF2',false,['deriveKey']);var key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:authBytes('estoque99-sync|'+topic),iterations:200000},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);return {topic:topic,key:key}}
/* ---------- marcar mudanças locais (roda antes de cada gravação) ---------- */
function stamp(){if(!active())return false;var s=sy();if(!s.ready||s.topic!==chan.topic)return false;var now=Date.now(),by=info.name,touched=false,cp=new Set(Array.isArray(s.cloudPend)?s.cloudPend:[]);
  C.forEach(function(c){if(amAux()&&!auxColl(c))return;var meta=s.meta[c],seen={};arr(c).forEach(function(x){if(!x||!okId(x.id))return;seen[x.id]=1;var h=hashItem(x),m=meta[x.id];if(!m||m[2]||m[3]!==h){meta[x.id]=[Math.max(now,m?m[0]+1:0),by,0,h];cp.add(c+'|'+x.id);touched=true}});
    Object.keys(meta).forEach(function(id){var m=meta[id];if(!seen[id]&&!m[2]){meta[id]=[Math.max(now,m[0]+1),by,1,''];cp.add(c+'|'+id);touched=true}else if(m[2]&&now-m[0]>30*864e5&&!cp.has(c+'|'+id))delete meta[id]})});
  s.pending=[];s.cloudPend=Array.from(cp);return touched}
var baseSave=save;
save=async function(){var t=false;try{t=stamp()}catch(e){}var r=await baseSave.apply(this,arguments);if(t)kick();return r};
function persist(){return baseSave()}
/* ---------- enviar ---------- */
function kick(ms){try{if(window.e99Loja&&window.e99Loja.kick)window.e99Loja.kick(ms)}catch(e){}}
function schedulePublish(ms){kick(ms)}
function cloudSt(){try{return window.e99Loja&&window.e99Loja.status?window.e99Loja.status():null}catch(e){return null}}
function me(){return DEV+h32(authSession?authSession.storeKey:'')}
function oldKey(t){return 'lojasg.estoque99.sync-old:'+t}
/* ---------- receber ---------- */
/* auxiliar só marca atividades como feitas: copia apenas done/doneBy/doneAt para o plano que este aparelho já tem */
function auxPlanOp(op){if(!op||op.c!=='plans')return op;if(op.d||!op.x||!Array.isArray(op.x.activities))return null;var cur=arr('plans').find(function(p){return p&&p.id===op.i});if(!cur)return null;
  var by={};op.x.activities.forEach(function(a){if(a&&a.id)by[a.id]=a});var acts=(cur.activities||[]).map(function(a){var r=by[a.id];if(!r)return a;var n=Object.assign({},a);if(r.done){n.done=true;n.doneBy=r.doneBy;n.doneAt=r.doneAt}else{delete n.done;delete n.doneBy;delete n.doneAt}return n});
  var nx=Object.assign({},cur,{activities:acts});return Object.assign({},op,{x:nx,fix:JSON.stringify(nx)!==JSON.stringify(op.x)})}
/* v96: conferências — cada sessão tem um dono (aparelho dev). Só o dono muda leituras; auxiliar não associa NF; ninguém apaga pela sincronização. */
function confOp(op,o){if(!op||op.c!=='confs')return op;if(op.d)return null;var x=op.x;if(!x||typeof x!=='object')return null;var aux=o.r==='auxiliar',cur=arr('confs').find(function(y){return y&&y.id===op.i});
  if(!cur){if(aux&&x.dev!==o.dev)return null;if(aux)x=Object.assign({},x,{nf:'',assocBy:'',assocAt:''});return Object.assign({},op,{x:x})}
  if(cur.dev&&cur.dev===o.dev&&x.dev===o.dev){if(aux)x=Object.assign({},x,{nf:cur.nf||'',assocBy:cur.assocBy||'',assocAt:cur.assocAt||'',note:cur.note||''});return Object.assign({},op,{x:x})}
  if(aux)return null;return Object.assign({},op,{x:Object.assign({},cur,{nf:typeof x.nf==='string'?x.nf:'',assocBy:typeof x.assocBy==='string'?x.assocBy:'',assocAt:typeof x.assocAt==='string'?x.assocAt:'',note:typeof x.note==='string'?x.note:''})})}
function okOp(op){return op&&typeof op==='object'&&C.indexOf(op.c)>=0&&okId(op.i)&&Number.isFinite(op.t)&&op.t>0&&typeof op.b==='string'&&(op.d||(op.x&&typeof op.x==='object'&&op.x.id===op.i))}
function newer(m,op){return !m||op.t>m[0]||(op.t===m[0]&&String(op.b)>String(m[1]))}
/* aplica numa cópia, valida com as mesmas regras do site e só então grava */
function repairRefs(cand){var fixed=[];var team=new Set(['','todos'].concat((cand.team||[]).map(function(x){return x&&x.id}))),cor=new Set([''].concat((cand.corridors||[]).map(function(x){return x&&x.id})));
  ['corridors','nfs'].forEach(function(c){cand[c]=(cand[c]||[]).map(function(x){if(x&&typeof x==='object'&&typeof x.owner==='string'&&!team.has(x.owner)){x=Object.assign({},x,{owner:''});fixed.push(c+'|'+x.id)}return x})});return fixed}
function commit(cand){var fixedRefs=repairRefs(cand);var test={};Object.keys(state).forEach(function(k){test[k]=state[k]});C.forEach(function(c){test[c]=cand[c]});var v;try{v=validate(JSON.parse(JSON.stringify(test)))}catch(e){return null}if(fixedRefs.length)setTimeout(function(){if(stamp()){persist();schedulePublish(800)}},0);return v}
async function applyOps(ops,isSnap,who){var s=sy();ops=ops.filter(okOp).slice(0,20000);
  if(isSnap&&s.replace&&!s.ready){var cand={},meta={};C.forEach(function(c){cand[c]=[];meta[c]={}});ops.forEach(function(op){meta[op.c][op.i]=[op.t,op.b.slice(0,40),op.d?1:0,''];if(!op.d)cand[op.c].push(op.x)});
    var old={};try{old=JSON.parse(localStorage.getItem(oldKey(s.topic))||'{}')||{}}catch(e){}var kept=0;
    ['nfs','plans','confs'].forEach(function(c){var was=new Set(Array.isArray(old[c])?old[c]:[]);arr(c).forEach(function(x){if(x&&okId(x.id)&&!meta[c][x.id]&&!was.has(x.id)){cand[c].push(x);kept++}})});
    var v=commit(cand);if(!v){lastErr='Os dados recebidos da equipe são inválidos.';return}
        C.forEach(function(c){state[c]=v[c];state[c].forEach(function(x){if(meta[c][x.id])meta[c][x.id][3]=hashItem(x)});Object.keys(meta[c]).forEach(function(id){if(!meta[c][id][2]&&!state[c].some(function(x){return x.id===id}))meta[c][id]=[meta[c][id][0],meta[c][id][1],1,'']})});
    s.meta=meta;s.pending=[];s.replace=false;s.ready=true;try{localStorage.removeItem(oldKey(s.topic))}catch(e){}if(kept&&stamp())schedulePublish(500);await persist();feedAdd(who,'enviou os dados da equipe para este aparelho');notify('Dados da equipe recebidos.');scheduleRender(C);return}
  var wasReady=s.ready,cand={},changes=[];C.forEach(function(c){cand[c]=arr(c).slice()});
  ops.forEach(function(op){if(!newer(s.meta[op.c][op.i],op))return;var list=cand[op.c],idx=list.findIndex(function(x){return x&&x.id===op.i}),prev=idx>=0?list[idx]:null;if(op.d){if(idx<0){s.meta[op.c][op.i]=[op.t,op.b.slice(0,40),1,''];return}list.splice(idx,1)}else if(idx>=0)list[idx]=op.x;else list.push(op.x);changes.push({op:op,prev:prev})});
  var applied=[];if(changes.length){var v=commit(cand);if(v){finish(v,changes);applied=changes}else{/* uma a uma: guarda para depois as que dependem de algo que ainda não chegou */
      for(var i=0;i<changes.length;i++){var ch1=changes[i],c1={};C.forEach(function(c){c1[c]=arr(c).slice()});var l=c1[ch1.op.c],ix=l.findIndex(function(x){return x&&x.id===ch1.op.i});if(ch1.op.d){if(ix>=0)l.splice(ix,1)}else if(ix>=0)l[ix]=ch1.op.x;else l.push(ch1.op.x);var v1=commit(c1);if(v1){finish(v1,[ch1]);applied.push(ch1)}else defer(ch1.op)}}}
  /* v156: avisa as alterações de outras pessoas (v156.js decide quem é "outra pessoa" e se é carga inicial) */
  if(applied.length&&wasReady&&window.e99OnTeamChange)try{window.e99OnTeamChange(applied.slice())}catch(e){}
  if(applied.length&&deferred.length){var d=deferred.splice(0);d.forEach(function(x){x.tries=(x.tries||0)+1});var again=d.filter(function(x){return x.tries<=3});if(again.length){await applyOps(again,false,who);return}}
  if(isSnap&&!s.ready){s.ready=true;s.replace=false;dropDefaults();if(stamp())schedulePublish(500)}
  if(applied.length||isSnap)await persist();
  if(applied.length){if(wasReady)applied.forEach(function(x){var t=describe(x.op,x.prev);if(t)feedAdd(x.op.b||who,t)});scheduleRender(applied.map(function(x){return x.op.c}))}}
/* ao juntar: não espalha para a equipe as pessoas e corredores de exemplo da conta nova, se ninguém mexeu neles */
function dropDefaults(){if(typeof initial!=='function')return;var ini=initial(),s=sy();
  var used=function(kind,id){return ['nfs'].some(function(c){return arr(c).some(function(x){return kind==='team'?x.owner===id:x.corridor===id})})||(kind==='team'&&arr('corridors').some(function(c){return c.owner===id}))};
  ['corridors','team'].forEach(function(c){var defs={};(ini[c]||[]).forEach(function(x){defs[x.id]=JSON.stringify(x)});state[c]=arr(c).filter(function(x){return s.meta[c][x.id]||defs[x.id]!==JSON.stringify(x)||used(c,x.id)})})}
function defer(op){if(deferred.length<200&&!deferred.some(function(x){return x.c===op.c&&x.i===op.i&&x.t===op.t}))deferred.push(op)}
function finish(v,changes){var s=sy();
  C.forEach(function(c){state[c]=v[c]});
  changes.forEach(function(x){var op=x.op,it=op.d?null:state[op.c].find(function(y){return y.id===op.i});s.meta[op.c][op.i]=[op.t,op.b.slice(0,40),it?0:1,it?hashItem(it):'']});}
function first(t){return String(t||'').split('\n')[0].slice(0,60)}
function describe(op,prev){var x=op.x||{},p=prev||{};
  switch(op.c){
   case 'nfs':return op.d?'apagou a NF '+first(p.number):!prev?'cadastrou a NF '+first(x.number):x.status!==p.status?'mudou a NF '+first(x.number)+' para '+x.status:'atualizou a NF '+first(x.number);
   case 'team':return op.d?'tirou '+first(p.name)+' da equipe':!prev?'adicionou '+first(x.name)+' à equipe':'atualizou '+first(x.name)+' na equipe';
   case 'plans':{if(op.d)return 'apagou o plano “'+first(p.title)+'”';if(!prev)return 'criou o plano “'+first(x.title)+'”';var pa=p.activities||[],newly=(x.activities||[]).filter(function(a){return a.done&&!(pa.find(function(b){return b.id===a.id})||{}).done});return newly.length?'fez “'+first(newly[0].title)+'”'+(newly.length>1?' e mais '+(newly.length-1):''):'atualizou o plano “'+first(x.title)+'”'}
   case 'confs':return op.d?'':!prev?'começou a conferência '+first(x.n):x.status==='finalizada'&&p.status!=='finalizada'?'finalizou a conferência '+first(x.n)+' ('+(x.total|0)+' volumes)':x.nf&&x.nf!==p.nf?'associou a conferência '+first(x.n)+' a uma NF':'';
   case 'dresp':return 'definiu o responsável de uma demanda';
   case 'corridors':return op.d?'apagou o corredor '+first(p.number):!prev?'criou o corredor '+first(x.number):'atualizou o corredor '+first(x.number)}return ''}
/* ---------- membros da equipe (quem já criou conta / visto por último) ---------- */
function memKey(){return 'lojasg.estoque99.members:'+authSession.storeKey+':'+chan.topic}
function members(){if(!chan||!authSession)return {};try{var o=JSON.parse(localStorage.getItem(memKey())||'{}');return o&&typeof o==='object'?o:{}}catch(e){return {}}}
function memTouch(dev,f){if(!chan||typeof dev!=='string'||!/^[a-z0-9]{6,40}$/.test(dev))return;var all=members(),m=all[dev]||{};m.name=String(f.name||m.name||'?').slice(0,40);if(f.role)m.role=f.role==='auxiliar'?'auxiliar':'gestor';if(f.login)m.login=String(f.login).slice(0,80);if(f.inviteId)m.inviteId=String(f.inviteId).slice(0,40);if(f.created&&!m.created)m.created=f.created;if(Number.isFinite(f.seen))m.seen=Math.max(m.seen||0,f.seen);all[dev]=m;
  var ks=Object.keys(all);if(ks.length>200)ks.sort(function(a,b){return (all[a].seen||0)-(all[b].seen||0)}).slice(0,ks.length-200).forEach(function(k){delete all[k]});try{localStorage.setItem(memKey(),JSON.stringify(all))}catch(e){}}
window.syncMembers=function(){return members()};window.e99MemTouch=function(d,f){memTouch(d,f)};
window.e99SyncInfo=function(){var c=cloudSt();return active()&&chan?{topic:chan.topic,dev:me(),connected:!!(c&&c.status==='ok')}:null};
window.e99SyncDev=function(){return authSession?me():''};
/* ---------- últimas mudanças ---------- */
function feedKey(){return chan?'lojasg.estoque99.sync-feed:'+authSession.storeKey+':'+chan.topic:''}
function feedGet(){try{var l=JSON.parse(localStorage.getItem(feedKey())||'[]');return Array.isArray(l)?l:[]}catch(e){return []}}
function feedAdd(who,text){if(!chan)return;var l=feedGet();l.unshift({at:Date.now(),who:String(who||'').slice(0,40),text:String(text).slice(0,160)});try{localStorage.setItem(feedKey(),JSON.stringify(l.slice(0,40)))}catch(e){}var f=document.getElementById('sync-feed');if(f)f.innerHTML=feedHTML()}
function hhmm(t){var d=new Date(t);return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function feedHTML(){var l=feedGet();return l.length?l.map(function(x){return '<div><span>'+hhmm(x.at)+'</span><p style="margin:0"><b>'+esc(x.who)+'</b> '+esc(x.text)+'</p></div>'}).join(''):'<p class="small" style="margin:0">Nenhuma mudança recebida ainda.</p>'}
/* ---------- tela ---------- */
var VIEWS={home:1,reports:1,plans:1,team:1,corridors:1,nfs:1,agenda:1,alerts:1,chat:1};
function scheduleRender(){clearTimeout(renderTimer);renderTimer=setTimeout(function(){if(!authSession||!VIEWS[page])return;var a=document.activeElement;if(a&&a.closest&&a.closest('#view')&&/INPUT|TEXTAREA|SELECT/.test(a.tagName)){document.addEventListener('focusout',function(){scheduleRender()},{once:true});return}render()},300)}
function ago(t){if(!t)return '';var m=Math.round((Date.now()-t)/60000);return m<1?'agora':m<60?'há '+m+' min':'há '+Math.round(m/60)+' h'}
function statusText(){if(!info||!info.sync)return '';var s=state&&state.sync,c=cloudSt()||{};if(lastErr)return lastErr;if(!chan)return 'Preparando a sincronização…';
  if(c.status==='sem-nuvem')return 'Sem acesso à nuvem da loja. Peça ao gestor para ativar o acesso automático ou ligue o e-mail.';
  if(c.status==='sem-acesso')return 'Aguardando o gestor abrir o StoK uma vez para liberar os dados da loja.';
  if(s&&!s.ready)return 'Aguardando os dados da loja…';if(c.status==='erro')return 'Sincronização reconectando…';if(c.status!=='ok')return 'Preparando a sincronização…';
  if(c.pend)return 'Equipe sincronizada · enviando mudanças…';return 'Equipe sincronizada'+(c.lastAt?' · '+ago(c.lastAt):'')}
var foot=null;function footEl(){if(foot&&document.contains(foot))return foot;foot=Array.from(document.querySelectorAll('footer span, span')).find(function(x){return /Sem sincronização entre aparelhos|Equipe sincronizada|Sincroniza|Aguardando os dados/.test(x.textContent)&&!x.closest('#view')})||null;return foot}
function paintStatus(){var t=statusText();var f=footEl();if(f)f.textContent=t?t:'Local · Sem sincronização entre aparelhos';var el=document.getElementById('sync-status');if(el)el.textContent=t||'Dados só neste aparelho (sincronização desligada)';var box=document.getElementById('sync-box');if(box)box.classList.toggle('on',!!(info&&info.sync))}
var ICON='<svg class="sync-ico" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7a8 8 0 0 0-14-2L4 7M4 3v4h4M4 17a8 8 0 0 0 14 2l2-2M20 21v-4h-4"></path></svg>';
function boxHTML(){var t=window.e99Team&&window.e99Team.get();if(!t)return '';var on=!!t.sync,s=state.sync||{};
  return '<details class="sync-box'+(on?' on':'')+'" id="sync-box"><summary>'+ICON+'<span id="sync-status">'+esc(statusText()||'Dados só neste aparelho (sincronização desligada)')+'</span></summary><div class="sync-body">'
   +'<label class="chat-check"><input type="checkbox" id="sync-on" '+(on?'checked':'')+' onchange="syncToggle(this.checked)"> Compartilhar NFs, planos de ação, equipe e corredores com a equipe</label>'
   +'<p class="small" style="margin:0">Não vão para a equipe: alertas, planos, senha e chaves do robô. Todos da equipe podem editar e apagar. Os dados vão cifrados para a nuvem da loja.</p>'
   +(on&&!s.ready?'<p class="sync-wait">Aguardando os dados da loja. Com internet, eles chegam sozinhos.</p>':'')
   +(on?'<div class="row toolbar"><button type="button" onclick="syncNow()">Sincronizar agora</button></div>':'')
   +'<h3>Últimas mudanças da equipe</h3><div class="sync-feed" id="sync-feed">'+feedHTML()+'</div></div></details>'}
var rcBefore=window.renderChat;if(typeof rcBefore==='function')window.renderChat=function(){var h=rcBefore.apply(this,arguments);if(h.indexOf('<div id="chat-list"')<0)return h;return h.replace('<div id="chat-list"',boxHTML()+'<div id="chat-list"')};
window.syncToggle=async function(on){if(!window.e99Team)return;await window.e99Team.setSync(on,on?{replace:false}:null);if(page==='chat')render();notify(on?'Compartilhando os dados com a equipe.':'Sincronização desligada neste aparelho.')};
/* reenvia todos os dados desta equipe (pessoas, corredores, NFs e planos), inclusive itens que nunca saíram deste aparelho */
window.e99SendAll=async function(){if(!active()||!chan)return false;var s=sy();C.forEach(function(c){Object.keys(s.meta[c]||{}).forEach(function(id){if(s.meta[c][id]&&!s.meta[c][id][2])s.meta[c][id][3]=''})});if(stamp())await persist();try{if(window.e99Loja)await window.e99Loja.pushNow()}catch(e){}return true};
window.syncNow=async function(){if(!active())return;notify('Sincronizando…');lastErr='';if(stamp())await persist();try{if(window.e99Loja){window.e99Loja.start();window.e99Loja.reconcile();await window.e99Loja.pushNow()}}catch(e){}paintStatus()};
window.syncStatus=function(){return {active:active(),ready:!!(state&&state.sync&&state.sync.ready),pending:(state&&state.sync&&state.sync.cloudPend||[]).length,connected:!!(cloudSt()&&cloudSt().status==='ok'),topic:chan&&chan.topic,dev:DEV,text:statusText()}};
/* ---------- ligar/desligar conforme a equipe do chat ---------- */
function stop(){clearTimeout(mergeTimer);chan=null;info=null;lastErr='';deferred=[]}
async function refresh(){var my=++gen;stop();var t=window.e99Team&&window.e99Team.get();info=t;if(!authSession||!t){paintStatus();return}
  /* v148: a chave do canal existe sempre que há equipe (a nuvem do chat usa a mesma loja); os dados só sincronizam com t.sync */
  var ch=await channel(t.code);if(my!==gen)return;chan=ch;if(!t.sync){paintStatus();return}var s=sy();
  if(s.topic!==ch.topic){var m={};C.forEach(function(c){m[c]={}});s.meta=m;s.pending=[];s.topic=ch.topic;s.ready=!!t.owner;s.replace=!t.owner&&!!t.replace;if(s.replace)try{localStorage.setItem(oldKey(ch.topic),JSON.stringify({nfs:arr('nfs').map(function(x){return x.id}),plans:arr('plans').map(function(x){return x.id}),confs:arr('confs').map(function(x){return x.id})}))}catch(e){}await persist();if(my!==gen)return}
  if(s.ready&&stamp()){await persist();schedulePublish(800)}
  if(!s.ready&&!s.replace)mergeTimer=setTimeout(async function(){if(my!==gen||!active())return;var ss=sy();if(!ss.ready){ss.ready=true;dropDefaults();if(stamp())schedulePublish(500);await persist();paintStatus()}},20000);
  paintStatus()}
if(window.e99Team)window.e99Team.onChange(function(){refresh()});
/* v136: núcleo para a nuvem da loja (v136.js) usar o mesmo aplicador, a mesma chave e as mesmas regras */
window.e99SyncCore={channel:channel,C:C,sy:sy,arr:arr,active:active,chan:function(){return chan},info:function(){return info},stamp:stamp,persist:persist,applyOps:applyOps,auxPlanOp:auxPlanOp,confOp:confOp,okId:okId,hashItem:hashItem,dropDefaults:dropDefaults,amAux:amAux,me:me,paint:paintStatus,render:scheduleRender,schedulePublish:schedulePublish};
/* v100: "no PC não aparecem os dados das outras contas". Os dados ficam no aparelho que os criou; outro aparelho só recebe
   pela equipe (sincronização). O Início diz isso e mostra o caminho: convite / mesmo login, ou abrir o Stok no outro aparelho. */
function hereKey(){return 'lojasg.estoque99.local-note:'+(authSession?authSession.storeKey:'')}
function hereHTML(){if(!authSession)return '';var t=window.e99Team&&window.e99Team.get(),s=state&&state.sync||{};
  if(!t){if(amAux())return '';try{if(localStorage.getItem(hereKey()))return ''}catch(e){}
    return '<div class="panel help" id="local-note"><h2>Dados só neste aparelho</h2><p>Cada aparelho guarda as próprias contas e dados. As NFs, planos, equipe e corredores de outro aparelho (ex.: o iPhone) só aparecem aqui pela equipe.</p><p class="small">Para trazer: no iPhone, abra Chat → Convidar e use o convite aqui; ou saia e entre aqui com o mesmo login e e-mail do iPhone (o app traz a conta da nuvem e volta para a equipe).</p><div class="row toolbar"><button type="button" class="primary" onclick="go(\'chat\')">Abrir o Chat</button><button type="button" onclick="e99LocalNoteOk()">Entendi</button></div></div>'}
  if(t.sync&&!s.ready)return '<div class="panel help" id="local-note"><h2>Aguardando os dados da equipe</h2><p>Os dados da loja vêm da nuvem. Com internet, tudo chega aqui sozinho em instantes.</p><div class="row toolbar"><button type="button" onclick="syncNow()">Sincronizar agora</button></div></div>';
  if(!t.sync&&!amAux())return '<div class="panel help" id="local-note"><h2>Sincronização desligada</h2><p>Este aparelho está na equipe, mas não recebe NFs, planos, equipe e corredores. Ligue em Chat → "Compartilhar NFs, planos…".</p><div class="row toolbar"><button type="button" onclick="go(\'chat\')">Abrir o Chat</button></div></div>';
  return ''}
window.e99LocalNoteOk=function(){try{localStorage.setItem(hereKey(),'1')}catch(e){}var n=document.getElementById('local-note');if(n)n.remove()};
var renderHere=render;render=function(){var r=renderHere.apply(this,arguments);try{if(authSession&&page==='home'&&!document.getElementById('local-note')){var h=hereHTML(),hero=h&&document.querySelector('#view .hero');if(hero)hero.insertAdjacentHTML('afterend',h)}}catch(e){}return r};
var logoutBefore=authLogout;authLogout=async function(){var r=await logoutBefore.apply(this,arguments);if(!authSession){gen++;stop();paintStatus()}return r};
setInterval(function(){if(!document.hidden)paintStatus()},30000);
window.addEventListener('online',function(){if(active()){lastErr='';schedulePublish(500)}});
if(authSession&&window.e99Team&&window.e99Team.get())refresh();
})();
