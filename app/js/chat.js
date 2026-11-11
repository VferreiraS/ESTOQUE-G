
(function(){
'use strict';
var NTFY='https://ntfy.sh';
try{var o=new URLSearchParams(location.search).get('ntfy');if(o&&(location.hostname==='localhost'||location.hostname==='127.0.0.1'))NTFY=o.replace(/\/+$/,'')}catch(e){}
var cfg=null,team=null,es=null,connected=false,mem={},sending=false,pendingInvite='',own={},audioURL={},rec=null;
/* v106: rascunho (só na memória), envio pendente/com erro, rolagem presa no fim, separador de não lidas */
var draft='',pend=null,failed=[],stuck=true,newCount=0,unreadFrom=null,unreadTo='',inChat=false,painted=null;
/* convite: #equipe=CODIGO */
try{var m=String(location.hash||'').match(/equipe=([A-Za-z0-9-]{8,20})/);if(m){pendingInvite=m[1];history.replaceState(null,'',location.pathname+location.search)}}catch(e){}
function b64(b){return authB64(b)}function un64(s){return authUn64(s)}
function cfgKey(){return 'lojasg.estoque99.chat:'+authSession.storeKey}
async function loadCfg(){var raw=localStorage.getItem(cfgKey());if(!raw)return null;try{var o=JSON.parse(raw);var p=await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(o.iv),additionalData:authBytes('chat|'+authLoginName(authSession.record.login))},authSession.key,un64(o.cipher));return JSON.parse(new TextDecoder().decode(p))}catch(e){return null}}
async function saveCfg(c){if(!c){localStorage.removeItem(cfgKey());return}var iv=crypto.getRandomValues(new Uint8Array(12));var ct=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:authBytes('chat|'+authLoginName(authSession.record.login))},authSession.key,authBytes(JSON.stringify(c)));localStorage.setItem(cfgKey(),JSON.stringify({iv:b64(iv),cipher:b64(ct)}))}
function norm(code){return authNormalizeCode(code)}
function fmt(code){return norm(code).match(/.{1,4}/g).join('-')}
function newCode(){var b=crypto.getRandomValues(new Uint8Array(12)),s='';for(var i=0;i<12;i++)s+=AUTH_CODE_CHARS[b[i]%32];return s}
async function makeTeam(code){var n=norm(code);var h=new Uint8Array(await crypto.subtle.digest('SHA-256',authBytes('canal|'+n)));var hex=Array.from(h).map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('');var topic='e99-'+hex.slice(0,24);
  var base=await crypto.subtle.importKey('raw',authBytes(n),'PBKDF2',false,['deriveKey']);var key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:authBytes('estoque99-chat|'+topic),iterations:200000},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);return {topic:topic,key:key}}
async function enc(bytes){var iv=crypto.getRandomValues(new Uint8Array(12));var ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv:iv},team.key,bytes));var out=new Uint8Array(12+ct.length);out.set(iv);out.set(ct,12);return out}
async function dec(bytes){bytes=new Uint8Array(bytes);return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},team.key,bytes.slice(12)))}
async function encMsg(obj){return 'E99:'+b64(await enc(authBytes(JSON.stringify(obj))))}
async function decMsg(str){if(typeof str!=='string'||str.indexOf('E99:')!==0)return null;try{var o=JSON.parse(new TextDecoder().decode(await dec(un64(str.slice(4)))));if(!o||o.v!==1||typeof o.id!=='string'||!/^[a-zA-Z0-9_-]{1,60}$/.test(o.id))return null;return {id:o.id,from:String(o.from||'?').slice(0,60),at:String(o.at||''),text:String(o.text||'').slice(0,1000),img:!!o.img,audio:okAudio(o.audio),re:okRe(o.re)}}catch(e){return null}}
function okRe(r){if(!r||typeof r!=='object'||typeof r.id!=='string'||!/^[a-zA-Z0-9_-]{1,60}$/.test(r.id))return null;return {id:r.id,from:String(r.from||'?').slice(0,60),t:String(r.t||'').slice(0,140)}}
function okAudio(a){if(!a||typeof a!=='object'||typeof a.mime!=='string'||!/^audio\/(mp4|webm|ogg|aac|mpeg|x-m4a)$/.test(a.mime)||!Number.isFinite(a.dur)||a.dur<0||a.dur>130)return null;return {mime:a.mime,dur:Math.round(a.dur)}}
function mmss(s){s=Math.max(0,Math.round(s||0));return Math.floor(s/60)+':'+('0'+s%60).slice(-2)}
/* ---------- histórico local (IndexedDB, guardado ainda criptografado com o código da equipe) ---------- */
function cdb(){return new Promise(function(res,rej){try{var r=indexedDB.open('estoque99-chat',1);r.onupgradeneeded=function(){r.result.createObjectStore('msgs');r.result.createObjectStore('imgs')};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}}catch(e){rej(e)}})}
function cop(store,mode,fn){return cdb().then(function(db){return new Promise(function(res,rej){var tx=db.transaction(store,mode),req=fn(tx.objectStore(store));tx.oncomplete=function(){db.close();res(req&&req.result)};tx.onerror=function(){db.close();rej(tx.error)}})})}
function putMsg(rec){return cop('msgs','readwrite',function(st){return st.put(rec,rec.topic+'|'+rec.id)})}
function allMsgs(){return cop('msgs','readonly',function(st){return st.getAll()}).then(function(l){return (l||[]).filter(function(r){return team&&r.topic===team.topic})}).catch(function(){return []})}
function putImg(id,bytes){return cop('imgs','readwrite',function(st){return st.put(bytes,team.topic+'|'+id)})}
function getImg(id){return cop('imgs','readonly',function(st){return st.get(team.topic+'|'+id)})}
async function trim(){var l=await allMsgs();if(l.length<=500)return;l.sort(function(a,b){return String(a.at).localeCompare(String(b.at))});var gone=l.slice(0,l.length-500);await cop('msgs','readwrite',function(st){gone.forEach(function(r){st.delete(r.topic+'|'+r.id)});return null});await cop('imgs','readwrite',function(st){gone.forEach(function(r){st.delete(r.topic+'|'+r.id)});return null})}
/* v108: mensagens não enviadas ficam guardadas neste aparelho (IndexedDB estoque99-chat-out), cifradas com a chave da conta
   (AES-GCM, como o resto da conta). Assim não somem ao recarregar a página. O formato das mensagens do chat não mudou. */
function odb(){return new Promise(function(res,rej){try{var r=indexedDB.open('estoque99-chat-out',1);r.onupgradeneeded=function(){r.result.createObjectStore('out')};r.onsuccess=function(){res(r.result)};r.onerror=function(){rej(r.error)}}catch(e){rej(e)}})}
function oop(mode,fn){return odb().then(function(db){return new Promise(function(res,rej){var tx=db.transaction('out',mode),req=fn(tx.objectStore('out'));tx.oncomplete=function(){db.close();res(req&&req.result)};tx.onerror=function(){db.close();rej(tx.error)}})})}
function oPre(){return authSession&&team?authSession.storeKey+'|'+team.topic+'|':''}
function oAad(){return authBytes('chat-out|'+authLoginName(authSession.record.login)+'|'+team.topic)}
async function outPut(f){try{var p=oPre();if(!p||!f||!f.id)return;var iv=crypto.getRandomValues(new Uint8Array(12));
  var ct=await crypto.subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:oAad()},authSession.key,authBytes(JSON.stringify({id:f.id,text:String(f.text||'').slice(0,1000),re:f.re||null,err:String(f.err||'').slice(0,300),at:f.at||Date.now()})));
  await oop('readwrite',function(st){return st.put({iv:b64(iv),c:b64(new Uint8Array(ct))},p+f.id)})}catch(e){}}
function outDel(id){var p=oPre();if(!p)return Promise.resolve();return oop('readwrite',function(st){return st.delete(p+id)}).catch(function(){})}
function outDelTopic(tp){var p=authSession?authSession.storeKey+'|'+tp+'|':'';if(!p)return Promise.resolve();return oop('readwrite',function(st){st.delete(IDBKeyRange.bound(p,p+'￿'));return null}).catch(function(){})}
async function outLoad(){var p=oPre();if(!p)return [];var rows=[];try{rows=await oop('readonly',function(st){return st.getAll(IDBKeyRange.bound(p,p+'￿'))})||[]}catch(e){return []}
  var out=[];for(var i=0;i<rows.length;i++){try{var r=rows[i];var pt=await crypto.subtle.decrypt({name:'AES-GCM',iv:un64(r.iv),additionalData:oAad()},authSession.key,un64(r.c));var o=JSON.parse(new TextDecoder().decode(pt));
    if(!o||typeof o.id!=='string'||!/^[a-zA-Z0-9_-]{1,60}$/.test(o.id)||typeof o.text!=='string')continue;out.push({id:o.id,text:o.text.slice(0,1000),re:okRe(o.re),err:String(o.err||'Não saiu antes de fechar a página.').slice(0,300),at:Number(o.at)||0})}catch(e){}}
  out.sort(function(a,b){return a.at-b.at});return out}
window.e99ChatOutbox=function(){return oPre()?oop('readonly',function(st){return st.getAll(IDBKeyRange.bound(oPre(),oPre()+'￿'))}).catch(function(){return []}):Promise.resolve([])};
/* ---------- receber ---------- */
function sinceKey(){return 'lojasg.estoque99.chat-since:'+team.topic}
function readKey(){return 'lojasg.estoque99.chat-read:'+(authSession?authSession.storeKey:'-')+':'+(team?team.topic:'-')}
function setStatus(on){connected=on;var s=document.getElementById('chat-status');if(s){s.textContent=on?'Conectado':'Reconectando…';s.classList.toggle('on',on)}}
function connect(){disconnect();if(!team||typeof EventSource!=='function')return;var since=localStorage.getItem(sinceKey())||'12h';
  es=new EventSource(NTFY+'/'+team.topic+'/sse?since='+encodeURIComponent(since));
  var me1=es;es.onopen=function(){setStatus(true);retry=0};es.onerror=function(){setStatus(false);/* fechado de vez (erro HTTP): o navegador não tenta de novo sozinho */if(me1.readyState===2&&es===me1){clearTimeout(retryTimer);retryTimer=setTimeout(function(){if(es===me1)connect()},Math.min(60000,3000*Math.pow(2,retry++)))}};
  es.onmessage=function(ev){var d;try{d=JSON.parse(ev.data)}catch(e){return}if(!d||d.event!=='message')return;receive(d)}}
var retry=0,retryTimer=0;
function revive(){if(team&&!document.hidden&&(!es||es.readyState===2)){retry=0;connect()}}
addEventListener('online',revive);document.addEventListener('visibilitychange',revive);
function disconnect(){clearTimeout(retryTimer);if(es){es.close();es=null}connected=false}
async function receive(d){var t=team;if(!t)return;if(typeof d.message==='string'&&d.message.indexOf('E99D:')===0){await recvDel(d,t);return}var msg=await decMsg(d.message);if(!msg||t!==team)return;
  if(d.time)try{var prev=+localStorage.getItem(sinceKey())||0;if(d.time>prev)localStorage.setItem(sinceKey(),String(d.time))}catch(e){}
  if(delSet().indexOf(msg.id)>=0)return;
  var key=t.topic+'|'+msg.id;var exists=await cop('msgs','readonly',function(st){return st.get(key)}).catch(function(){return null});
  if(own[msg.id]){/* minha própria mensagem: quem envia já guarda; se a confirmação do envio se perdeu, guarda pelo eco */
    if(!exists){await putMsg({topic:t.topic,id:msg.id,at:msg.at||new Date().toISOString(),payload:d.message,mine:true,hasImg:false,rx:Date.now()});if((msg.img||msg.audio)&&d.attachment&&d.attachment.url)await fetchImg(msg.id,d.attachment.url);if(page==='chat')paint(true)}return}
  if(exists){if((msg.img||msg.audio)&&d.attachment&&d.attachment.url&&!exists.hasImg)fetchImg(msg.id,d.attachment.url);return}
  await putMsg({topic:t.topic,id:msg.id,at:msg.at||new Date().toISOString(),payload:d.message,mine:false,hasImg:false,rx:Date.now()});
  if((msg.img||msg.audio)&&d.attachment&&d.attachment.url)await fetchImg(msg.id,d.attachment.url);
  trim();if(page==='chat'&&!document.hidden){markRead();if(!stuck)newCount++;announce(msg);paint(false)}else{badges();notifyNew(msg)}}
async function fetchImg(id,url){try{var r=await fetch(url);if(!r.ok)throw Error(r.status);var buf=await r.arrayBuffer();await putImg(id,buf);var rec=await cop('msgs','readonly',function(st){return st.get(team.topic+'|'+id)});if(rec){rec.hasImg=true;await putMsg(rec)}if(page==='chat')paint(false)}catch(e){}}
/* várias mensagens chegando juntas (ao reconectar) viram um único aviso e um único som */
var nq=[],nTimer=0,nFirst=0;
function notifyNew(m){nq.push(m);if(!nFirst)nFirst=Date.now();clearTimeout(nTimer);nTimer=setTimeout(function(){var l=nq;nq=[];nTimer=0;nFirst=0;try{if(typeof playSiteSound==='function')playSiteSound('tap')}catch(e){}
  if(!(document.hidden||page!=='chat')||!window.showSiteNotification)return;
  if(l.length>1){var who=[];l.forEach(function(x){if(who.indexOf(x.from)<0)who.push(x.from)});window.showSiteNotification('Chat · '+l.length+' novas mensagens','De '+who.slice(0,3).join(', ')+(who.length>3?'…':''),'estoque99-chat','chat');return}
  var m1=l[0];window.showSiteNotification('Chat · '+m1.from,m1.audio?'🎤 Áudio ('+mmss(m1.audio.dur)+')':m1.img&&!m1.text?'📷 Foto':String(m1.text||'').slice(0,140),'estoque99-chat','chat')},Date.now()-nFirst>4000?0:1500)}
/* ---------- não lidas ---------- */
async function unread(){if(!team)return 0;var last=localStorage.getItem(readKey())||'';var l=await allMsgs();return l.filter(function(r){return !r.mine&&(r.rx?new Date(r.rx).toISOString():String(r.at))>last}).length}
function markRead(){if(team)localStorage.setItem(readKey(),new Date(Date.now()+1000).toISOString());badges()}
function badges(){unread().then(function(n){document.querySelectorAll('[onclick="go(\'chat\')"]').forEach(function(b){var s=b.querySelector('.nav-unread');if(n>0){if(!s){s=document.createElement('span');s.className='nav-unread';b.appendChild(s)}s.textContent=n>99?'99+':String(n)}else if(s)s.remove()})})}
/* ---------- enviar ---------- */
function msgId(){return Date.now().toString(36)+'-'+b64(crypto.getRandomValues(new Uint8Array(6))).replace(/[^a-zA-Z0-9]/g,'').slice(0,8)}
function failMsg(status){return status===429?'Limite grátis do ntfy.sh atingido nesta internet (250 mensagens por dia). Tente pelos dados móveis ou amanhã.':status===413?'Foto grande demais (máximo 2 MB).':'Não foi possível enviar ('+(status||'sem internet')+'). Tente de novo.'}
window.chatSend=async function(text,photoData,audio,opts){if(!team||sending)return false;text=String(text||'').trim().slice(0,1000);if(!text&&!photoData&&!audio)return false;sending=true;var btn=document.getElementById('chat-send');if(btn)btn.disabled=true;
  try{var oid=opts&&typeof opts.id==='string'&&/^[a-zA-Z0-9_-]{1,60}$/.test(opts.id)?opts.id:'';var obj={v:1,id:oid||msgId(),from:cfg.name,at:new Date().toISOString(),text:text,img:!!photoData};var sentRe=replyTo;if(sentRe)obj.re={id:sentRe.id,from:sentRe.from,t:sentRe.t};if(audio)obj.audio={mime:audio.mime,dur:Math.round(audio.dur)};own[obj.id]=1;var payload=await encMsg(obj);var r;
    if(audio){var abytes=new Uint8Array(await audio.blob.arrayBuffer());var aenc=await enc(abytes);if(aenc.length>1900000){notify('Áudio grande demais. Grave mensagens mais curtas.');return false}
      r=await fetch(NTFY+'/'+team.topic,{method:'PUT',headers:{'X-Message':payload,'X-Filename':'audio.bin'},body:aenc});if(r.ok){await putImg(obj.id,aenc.buffer);if(audio.url)audioURL[team.topic+'|'+obj.id]=audio.url}}
    else if(photoData){var bytes=Uint8Array.from(atob(photoData.split(',')[1]),function(c){return c.charCodeAt(0)});var encd=await enc(bytes);
      r=await fetch(NTFY+'/'+team.topic,{method:'PUT',headers:{'X-Message':payload,'X-Filename':'foto.bin'},body:encd});if(r.ok){await putImg(obj.id,encd.buffer)}}
    else r=await fetch(NTFY+'/'+team.topic,{method:'POST',body:payload});
    if(!r.ok){lastFail=failMsg(r.status);notify(lastFail);return false}
    await putMsg({topic:team.topic,id:obj.id,at:obj.at,payload:payload,mine:true,hasImg:!!(photoData||audio)});if(sentRe&&replyTo===sentRe)window.chatReplyCancel();chatPing();markRead();if(page==='chat')paint(true);return true}
  catch(e){lastFail=failMsg(0);notify(lastFail);return false}finally{sending=false;if(btn)btn.disabled=false}};
var lastFail='';
/* ---------- áudio ---------- */
var MAXREC=120;
function pickMime(){var l=['audio/mp4','audio/mp4;codecs=mp4a.40.2','audio/webm;codecs=opus','audio/webm','audio/ogg;codecs=opus'];if(typeof MediaRecorder!=='function'||!MediaRecorder.isTypeSupported)return '';for(var i=0;i<l.length;i++){try{if(MediaRecorder.isTypeSupported(l[i]))return l[i]}catch(e){}}return ''}
function recSecs(r){return r&&r.start?((r.stopAt||Date.now())-r.start)/1000:0}
function recBar(){var b=document.getElementById('chat-rec'),mic=document.getElementById('chat-mic');if(mic)mic.setAttribute('aria-pressed',rec?'true':'false');if(!b)return;b.hidden=!rec;if(!rec)return;var t=b.querySelector('.t');if(t)t.textContent=!rec.mr?'Abrindo o microfone…':rec.stopAt?'Limite de 2:00. Toque em Enviar áudio.':'Gravando '+mmss(recSecs(rec));var sb=document.getElementById('chat-rec-send');if(sb)sb.disabled=!rec.mr}
function stopMr(r){return new Promise(function(res){if(!r.mr||r.mr.state==='inactive'){res();return}r.mr.addEventListener('stop',function(){res()},{once:true});try{r.mr.stop()}catch(e){res()}})}
function endRec(r){clearInterval(r.timer);if(r.stream)r.stream.getTracks().forEach(function(t){t.stop()});if(rec===r)rec=null;recBar()}
function cancelRec(){var r=rec;if(!r)return;stopMr(r);endRec(r)}
window.chatRecCancel=cancelRec;
window.chatRecording=function(){return !!rec};
window.chatSending=function(){return !!sending};
window.chatMic=async function(){if(rec||!team)return;if(typeof MediaRecorder!=='function'||!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia){notify('Este navegador não grava áudio. Atualize o navegador ou use outro aparelho.');return}
  var r={chunks:[],start:0,stream:null,mr:null,timer:0,stopAt:0};rec=r;recBar();
  try{r.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true}})}
  catch(e){if(rec===r){rec=null;recBar()}notify(e&&e.name==='NotAllowedError'?'Permita o uso do microfone para gravar áudio (toque no cadeado ao lado do endereço do site).':e&&e.name==='NotFoundError'?'Nenhum microfone encontrado neste aparelho.':'Não foi possível abrir o microfone.');return}
  if(rec!==r){r.stream.getTracks().forEach(function(t){t.stop()});return}
  var mime=pickMime();try{r.mr=new MediaRecorder(r.stream,mime?{mimeType:mime,audioBitsPerSecond:32000}:{audioBitsPerSecond:32000})}catch(e){try{r.mr=new MediaRecorder(r.stream)}catch(e2){endRec(r);notify('Este navegador não grava áudio.');return}}
  r.mr.ondataavailable=function(ev){if(ev.data&&ev.data.size)r.chunks.push(ev.data)};
  try{r.mr.start(1000)}catch(e){endRec(r);notify('Não foi possível começar a gravar.');return}
  r.start=Date.now();try{if(typeof playSiteSound==='function')playSiteSound('tap')}catch(e){}
  window.e99ChatSay('Gravando áudio. Máximo de 2 minutos.');r.timer=setInterval(function(){if(rec!==r)return;if(page!=='chat'||!team){cancelRec();return}if(!r.stopAt&&recSecs(r)>=MAXREC){r.stopAt=r.start+MAXREC*1000;stopMr(r)}recBar()},250);recBar()};
window.chatRecSend=async function(){var r=rec;if(!r||!r.mr)return;var dur=Math.min(MAXREC,recSecs(r));await stopMr(r);endRec(r);
  if(dur<0.7||!r.chunks.length){notify('Áudio muito curto. Toque no microfone, fale e depois toque em Enviar áudio.');return}
  var type=String(r.mr.mimeType||pickMime()||'audio/webm').split(';')[0];var blob=new Blob(r.chunks,{type:type});var url=URL.createObjectURL(blob);
  notify('Enviando áudio…');var ok=await window.chatSend('',null,{blob:blob,mime:type,dur:dur,url:url});if(!ok)URL.revokeObjectURL(url)};
/* ---------- tela ---------- */
function esc2(s){return esc(String(s==null?'':s))}
function time(at){var d=new Date(at);return isNaN(d)?'':('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function day(at){var d=new Date(at);if(isNaN(d))return '';var t=new Date();var same=function(a,b){return a.toDateString()===b.toDateString()};if(same(d,t))return 'Hoje';var y=new Date(t);y.setDate(t.getDate()-1);if(same(d,y))return 'Ontem';
  var dm=('0'+d.getDate()).slice(-2)+'/'+('0'+(d.getMonth()+1)).slice(-2);if(d<t&&t-d<6*864e5)return ['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'][d.getDay()]+', '+dm;return dm+'/'+d.getFullYear()}
/* v106: ícones próprios (sem emoji novo) */
function svg(p,fill){return '<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" '+(fill?'fill="currentColor"':'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"')+'>'+p+'</svg>'}
var IC={re:svg('<path d="M9 14 4 9l5-5"/><path d="M4 9h10a6 6 0 0 1 6 6v5"/>'),del:svg('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),more:svg('<circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>',1),
  cam:svg('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>'),gal:svg('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
  send:svg('<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>'),down:svg('<path d="m6 9 6 6 6-6"/>')};
function whoName(n){return cfg&&n===cfg.name?'Você':n}
var opened={};
function bubble(r,m,cont){var id=esc2(r.id),from=esc2(m.from),long=!!(m.text&&m.text.length>420);
  return '<div class="chat-msg'+(r.mine?' mine':'')+(cont?' cont':'')+(long?' long':'')+(long&&opened[r.id]?' open':'')+(m.text&&window.e99IsMention&&window.e99IsMention(m.text)&&!r.mine?' mentioned':'')+'" data-id="'+id+'" data-at="'+esc2(m.at)+'" data-from="'+from+'" tabindex="-1">'
   +(r.mine?'<span class="chat-sr">Você: </span>':cont?'<span class="chat-sr">'+from+': </span>':(window.profChip?window.profChip(m.from):'<span class="who"><span class="av av-s" aria-hidden="true">'+esc2((String(m.from||'?').trim()[0]||'?').toUpperCase())+'</span><span>'+from+'</span></span>'))
   +(m.re?'<button type="button" class="chat-quote" aria-label="Ver a mensagem respondida, de '+esc2(whoName(m.re.from))+'" onclick="chatJump(\''+esc2(m.re.id)+'\')"><b>'+esc2(whoName(m.re.from))+'</b><span>'+esc2(m.re.t||'Mensagem')+'</span></button>':'')
   +(m.img?(r.hasImg?'<img data-chat-img="'+id+'" alt="Foto enviada por '+from+'" decoding="async" width="260" height="195">':'<span class="img-wait">📷 Foto (baixando… fotos ficam no servidor só por 3 horas)</span>'):'')
   +(m.audio?(r.hasImg?'<span class="chat-audio"><audio data-chat-audio="'+id+'" data-mime="'+esc2(m.audio.mime)+'" controls preload="metadata" aria-label="Áudio de '+from+', '+mmss(m.audio.dur)+'"></audio><span class="dur" aria-hidden="true">'+mmss(m.audio.dur)+'</span></span>':'<span class="img-wait">🎤 Áudio de '+mmss(m.audio.dur)+' (baixando… áudios ficam no servidor só por 3 horas)</span>'):'')
   +(m.text?'<div class="chat-txt">'+(window.e99Mentions?window.e99Mentions(esc2(m.text)):esc2(m.text))+'</div>':'')
   +(long?'<button type="button" class="chat-more" aria-expanded="'+(opened[r.id]?'true':'false')+'" onclick="chatMore(this)">'+(opened[r.id]?'Ver menos':'Ver mais')+'</button>':'')
   +'<div class="chat-meta"><time class="when" datetime="'+esc2(m.at)+'">'+time(m.at)+'</time></div>'
   +'<div class="chat-acts"><button type="button" class="chat-re-btn" aria-label="Responder '+(r.mine?'à sua mensagem':'a '+from)+'" title="Responder" onclick="chatReply(\''+id+'\')">'+IC.re+'</button>'
   +'<button type="button" class="chat-del-btn" aria-label="Apagar mensagem deste aparelho" title="Apagar mensagem (neste aparelho)" onclick="chatDelete(\''+id+'\')">'+IC.del+'</button>'
   +'<button type="button" class="chat-opt-btn" aria-label="Mais opções da mensagem'+(r.mine?'':' de '+from)+'" aria-haspopup="dialog" title="Mais opções" onclick="chatOptions(\''+id+'\',this)">'+IC.more+'</button></div>'
   +'<span class="swipe-ico" aria-hidden="true">↩</span></div>'}
/* mensagem que ainda está saindo (pend) ou que não saiu (fail): só neste aparelho, até enviar ou descartar */
function localBubble(f,kind){var id=esc2(f.id);
  return '<div class="chat-msg mine '+(kind==='pend'?'pending':'failed')+'" data-local="'+id+'"><span class="chat-sr">Você: </span>'
   +(f.re?'<span class="chat-quote"><b>'+esc2(whoName(f.re.from))+'</b><span>'+esc2(f.re.t||'Mensagem')+'</span></span>':'')
   +'<div class="chat-txt">'+esc2(f.text)+'</div>'
   +'<div class="chat-meta">'+(kind==='pend'?'<span class="chat-state">Enviando…</span>':'<span class="chat-state err">Não enviada'+(f.err?' · '+esc2(f.err):'')+'</span>')+'</div>'
   +(kind==='pend'?'':'<div class="chat-fail-acts"><button type="button" class="chat-retry" onclick="chatRetry(\''+id+'\')">Tentar de novo</button><button type="button" class="chat-discard" onclick="chatDiscard(\''+id+'\')">Descartar</button></div>')+'</div>'}
async function paint(scroll){var box=document.getElementById('chat-list');if(!box||!team)return;if(scroll){stuck=true;newCount=0}var keepBottom=stuck;var l=await allMsgs();l.sort(function(a,b){return String(a.at).localeCompare(String(b.at))});
  var html='',lastDay='',people={},prev=null,sepDone=false,ids={};
  for(var i=0;i<l.length;i++){var r=l[i];var m=mem[r.topic+'|'+r.id]||(mem[r.topic+'|'+r.id]=await decMsg(r.payload));if(!m)continue;ids[r.id]=1;people[m.from]=1;var dd=day(m.at);if(dd!==lastDay){html+='<div class="chat-day" role="separator" aria-label="'+esc2(dd)+'"><span aria-hidden="true">'+esc2(dd)+'</span></div>';lastDay=dd;prev=null}
    if(!sepDone&&unreadFrom&&!r.mine&&(r.rx?new Date(r.rx).toISOString():String(r.at))>unreadFrom&&(r.rx?new Date(r.rx).toISOString():String(r.at))<=unreadTo){sepDone=true;html+='<div class="chat-new" id="chat-new" role="separator" aria-label="Mensagens novas"><span aria-hidden="true">Mensagens novas</span></div>';prev=null}
    snip[r.id]={from:m.from,t:m.text?m.text.slice(0,140):(m.img?'📷 Foto':m.audio?'🎤 Áudio':'')};
    var cont=!!(prev&&prev.from===m.from&&prev.mine===!!r.mine&&(new Date(m.at)-new Date(prev.at))<5*60000);prev={from:m.from,mine:!!r.mine,at:m.at};
    html+=bubble(r,m,cont)}
  /* não duplica: a que já está no histórico (eco do ntfy ou envio que deu certo) sai da lista local */
  failed=failed.filter(function(f){if(ids[f.id]){outDel(f.id);return false}return true});if(pend&&!ids[pend.id])html+=localBubble(pend,'pend');failed.forEach(function(f){html+=localBubble(f,'fail')});
  if(box!==painted){painted=box;box.__init=true}
  /* nada mudou: não refaz a lista (evita piscar fotos/áudios e travadinhas a cada sincronização) */
  if(box.__h===html&&box.firstChild){if(keepBottom)toBottom(box);jumpBtn(box);return}box.__h=html;
  var keep={};box.querySelectorAll('audio[data-chat-audio]').forEach(function(a){if(a.src)keep[a.getAttribute('data-chat-audio')]=a});
  box.innerHTML=html||'<p class="chat-empty">Nenhuma mensagem ainda. Diga oi para a equipe!</p>';
  var cnt=document.getElementById('chat-people');if(cnt){var np=Object.keys(people).length;cnt.textContent=np?np+(np>1?' pessoas já falaram':' pessoa já falou'):''}
  box.querySelectorAll('img[data-chat-img]').forEach(function(img){var id=img.getAttribute('data-chat-img');getImg(id).then(function(buf){if(!buf)return;return dec(buf).then(function(b){var u=URL.createObjectURL(new Blob([b],{type:'image/jpeg'}));img.src=u;img.tabIndex=0;img.setAttribute('role','button');img.onclick=function(){viewImg(u,img.alt)};img.onkeydown=function(ev){if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();viewImg(u,img.alt)}}})}).catch(function(){img.replaceWith(Object.assign(document.createElement('span'),{className:'img-wait',textContent:'📷 Foto indisponível'}))})});
  box.querySelectorAll('audio[data-chat-audio]').forEach(function(a){var id=a.getAttribute('data-chat-audio'),mime=a.getAttribute('data-mime'),k=team.topic+'|'+id;if(keep[id]){a.replaceWith(keep[id]);return}
    if(a.canPlayType&&a.canPlayType(mime)===''){a.parentNode.replaceWith(Object.assign(document.createElement('span'),{className:'img-wait',textContent:'🎤 Este aparelho não toca este formato de áudio ('+mime.replace('audio/','')+'). Abra no computador ou atualize o navegador.'}));return}
    if(audioURL[k]){a.src=audioURL[k];return}
    getImg(id).then(function(buf){if(!buf)throw Error('sem');return dec(buf).then(function(b){audioURL[k]=URL.createObjectURL(new Blob([b],{type:mime}));a.src=audioURL[k]})}).catch(function(){if(a.parentNode)a.parentNode.replaceWith(Object.assign(document.createElement('span'),{className:'img-wait',textContent:'🎤 Áudio indisponível'}))})});
  settle(box);jumpBtn(box)}
/* ---------- v106: rolagem ---------- */
/* stuck = a lista está no fim: mensagem nova rola junto. Se a pessoa subiu para ler, não pula: aparece "N novas mensagens". */
function calm(){return document.body.classList.contains('fx-off')||!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}
var smoothTill=0;
function toBottom(box,smooth){if(!box)return;stuck=true;newCount=0;if(smooth&&!calm()&&box.scrollTo){smoothTill=Date.now()+1200;box.scrollTo({top:box.scrollHeight,behavior:'smooth'});setTimeout(function(){smoothTill=0;if(stuck&&box.isConnected)box.scrollTop=box.scrollHeight},1250)}else box.scrollTop=box.scrollHeight;jumpBtn(box);
  requestAnimationFrame(function(){if(stuck&&!smooth)box.scrollTop=box.scrollHeight})}
var keepTop=null,sepShown=false;
function settle(box){if(!box||!box.__h||!box.clientHeight)return;
  if(box.__init){box.__init=false;if(!stuck&&keepTop!=null){box.scrollTop=keepTop;keepTop=null;return}keepTop=null;var sep=document.getElementById('chat-new');
    if(sep&&!sepShown){sepShown=true;if(box.scrollHeight-sep.offsetTop>box.clientHeight){stuck=false;box.scrollTop=Math.max(0,sep.offsetTop-12);jumpBtn(box);return}}}
  if(stuck)toBottom(box)}
function onScroll(){var box=this;if(Date.now()<smoothTill)return;var d=box.scrollHeight-box.scrollTop-box.clientHeight;stuck=d<80;if(stuck)newCount=0;jumpBtn(box)}
function jumpBtn(box){var j=document.getElementById('chat-jump');if(!j||!box)return;var show=!stuck&&box.scrollHeight-box.clientHeight>40;var t=newCount?newCount+(newCount>1?' novas mensagens':' nova mensagem'):'Ir para o fim';
  if(j.hidden!==!show)j.hidden=!show;var s=j.querySelector('span');if(s&&s.textContent!==t)s.textContent=t;j.classList.toggle('has-new',newCount>0)}
window.chatToBottom=function(){var box=document.getElementById('chat-list');if(!box)return;toBottom(box,true);try{box.focus({preventScroll:true})}catch(e){}};
/* altura da lista: o chat inteiro (lista + campo de escrever) cabe na tela, no celular e no PC */
function fit(){var box=document.getElementById('chat-list'),wrap=box&&box.closest('.chat-wrap'),cp=wrap&&wrap.querySelector('.chat-compose');if(!box||!cp||!box.offsetParent)return;
  var br=box.getBoundingClientRect(),cr=cp.getBoundingClientRect(),y=window.scrollY||0,nav=document.querySelector('.mobile-bottom'),nh=0;
  if(nav&&!document.body.classList.contains('keyboard-open')&&getComputedStyle(nav).display!=='none'&&getComputedStyle(nav).position==='fixed')nh=nav.getBoundingClientRect().height;
  var pb=parseFloat(getComputedStyle(wrap).paddingBottom)||0;var h=Math.max(innerHeight<760?200:260,Math.round(innerHeight-(br.top+y)-(cr.bottom-br.bottom)-pb-nh-16));
  if(Math.abs((parseFloat(box.style.height)||0)-h)>2){box.style.height=h+'px';if(stuck)toBottom(box)}}
addEventListener('resize',function(){if(page==='chat')fit()});
function still(){var w=document.querySelector('.chat-wrap');if(w)w.classList.toggle('still',calm())}
/* ---------- v106: campo de escrever ---------- */
function grow(t){if(!t)return;t.style.height='auto';t.style.height=Math.min(t.scrollHeight+2,160)+'px';var c=document.getElementById('chat-count');if(c){var left=1000-t.value.length;c.hidden=left>100;c.textContent=left<=0?'Limite de 1000 caracteres':'Faltam '+left+' caracteres'}}
document.addEventListener('input',function(ev){if(ev.target&&ev.target.id==='chat-text'){draft=ev.target.value;grow(ev.target)}});
window.chatKey=function(ev){if(ev.key==='Enter'&&!ev.shiftKey&&!ev.altKey&&!ev.isComposing&&ev.keyCode!==229){var mb=document.getElementById('mention-box');if(mb&&!mb.hidden){var b=mb.querySelector('button');if(b){ev.preventDefault();b.click();return}}ev.preventDefault();window.chatSubmit(ev);return}
  if(ev.key==='Escape'){var mb2=document.getElementById('mention-box');if(mb2&&!mb2.hidden){mb2.hidden=true;ev.stopPropagation()}}};
window.chatMore=function(b){var m=b.closest('.chat-msg');if(!m)return;var on=m.classList.toggle('open');var id=m.getAttribute('data-id');if(on)opened[id]=1;else delete opened[id];b.textContent=on?'Ver menos':'Ver mais';b.setAttribute('aria-expanded',on?'true':'false');var box=document.getElementById('chat-list');if(box)box.__h=''};
window.chatOptions=function(id,btn){if(window.e99MsgMenu)window.e99MsgMenu(id,btn);else window.chatReply(id)};
/* aviso para leitor de tela: só a mensagem nova (a lista não é lida inteira a cada atualização) */
var annT=0,annQ=[];function announce(m){annQ.push(m);clearTimeout(annT);annT=setTimeout(function(){var q=annQ;annQ=[];var el=document.getElementById('chat-ann');if(!el||!q.length)return;var x=q[q.length-1];
  el.textContent=q.length>1?q.length+' mensagens novas no chat.':'Mensagem de '+x.from+': '+(x.text?x.text.slice(0,200):x.audio?'áudio':x.img?'foto':'')},700)}
window.e99ChatSay=function(t){window.__e99ChatAnn={t:String(t||''),at:Date.now()};var el=document.getElementById('chat-ann');if(el){el.textContent='';setTimeout(function(){var e2=document.getElementById('chat-ann')||el;e2.textContent=String(t||'')},50)}};
function viewImg(u,alt){var d=document.getElementById('chat-img-view');if(!d){d=document.createElement('dialog');d.id='chat-img-view';d.setAttribute('aria-label','Foto do chat');d.innerHTML='<img alt="Foto do chat"><button type="button" onclick="this.closest(\'dialog\').close()">Fechar</button>';document.body.appendChild(d)}var im=d.querySelector('img');im.src=u;im.alt=alt||'Foto do chat';var back=document.activeElement;d.onclose=function(){try{if(back&&back.isConnected)back.focus()}catch(e){}};d.showModal();var c=d.querySelector('button');if(c)c.focus()}
function setup(){var box=document.getElementById('chat-list');if(!box)return;var ex=document.getElementById('chat-extras');
  /* status da sincronização e contas dos auxiliares vão para baixo do campo de escrever: a conversa vem primeiro */
  if(ex)['sync-box','aux-box'].forEach(function(i){var d=document.getElementById(i);if(d&&d.closest('.chat-wrap')&&d.parentNode!==ex)ex.appendChild(d)});
  if(!box.__sc){box.__sc=1;box.addEventListener('scroll',onScroll,{passive:true});
    if(window.ResizeObserver){var ro=new ResizeObserver(function(){if(!box.isConnected){ro.disconnect();return}settle(box);fit()});ro.observe(box);
      var cp=document.querySelector('.chat-compose');if(cp)ro.observe(cp);var hd=document.querySelector('.chat-head');if(hd)ro.observe(hd)}
    /* reações, "visto por" e fotos dos perfis entram depois: se estava no fim, continua no fim */
    var raf=0;new MutationObserver(function(){if(raf||!stuck)return;raf=requestAnimationFrame(function(){raf=0;if(stuck&&box.isConnected&&box.__h)box.scrollTop=box.scrollHeight})}).observe(box,{childList:true,subtree:true})}
  grow(document.getElementById('chat-text'));fit();still()}
window.renderChat=function(){if(!cfg){return hero('Chat da equipe','')+'<div class="panel chat-setup">'
   +'<div><h2>Criar equipe</h2><form onsubmit="chatCreate(event)"><label>Seu nome no chat<input name="name" required maxlength="40" autocomplete="nickname" value="'+esc2(authSession.payload.store==='Estoque 99'?'Gestor':authSession.record.login)+'"></label><button class="primary">Criar equipe e gerar código</button></form></div>'
   +'<div><h2>Entrar com código</h2><form onsubmit="chatJoin(event)"><label>Código da equipe<input name="code" required maxlength="20" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="XXXX-XXXX-XXXX" value="'+esc2(pendingInvite?fmt(pendingInvite):'')+'"></label><label>Seu nome no chat<input name="name" required maxlength="40" autocomplete="nickname" value="'+esc2(authSession.record.login)+'"></label><label class="chat-check"><input type="checkbox" name="sync" checked> Compartilhar NFs, planos de ação, equipe e corredores com a equipe</label><label class="chat-check"><input type="checkbox" name="replace" checked> Usar só os dados da equipe neste aparelho <span class="small">(desmarque para juntar o que já existe aqui)</span></label><button class="primary">Entrar no chat</button></form></div>'
   +'<p class="small">As mensagens e fotos são cifradas com o código da equipe antes de sair do aparelho. Limites: 250 mensagens por dia por conexão; no servidor, fotos ficam 3 horas e mensagens 12 horas (o histórico fica salvo em cada aparelho). Detalhes na Política de privacidade.</p></div>'}
  /* o redesenho da tela (sincronização da equipe) não perde o rascunho nem a posição da leitura */
  var t0=document.getElementById('chat-text');if(t0)draft=t0.value;var b0=document.getElementById('chat-list');keepTop=b0&&!stuck?b0.scrollTop:null;
  if(!inChat){inChat=true;sepShown=false;stuck=true;newCount=0;keepTop=null;unreadFrom=localStorage.getItem(readKey())||'';unreadTo=new Date().toISOString()}
  setTimeout(function(){setup();paint(false);markRead();setStatus(connected);recBar();replyBar();/* v134: o redesenho da tela não apaga o aviso recente ao leitor de tela */var a=window.__e99ChatAnn,an=document.getElementById('chat-ann');if(a&&an&&!an.textContent&&Date.now()-a.at<10000)an.textContent=a.t},0);
  return '<div class="panel chat-wrap"><div class="chat-head"><div class="chat-title"><h2 id="chat-h">Chat · '+esc2(cfg.team||'Equipe')+'</h2><p class="chat-sub"><span class="chat-status" id="chat-status">Conectando…</span><span id="chat-people"></span></p></div><div class="chat-head-acts"><button type="button" class="chat-invite" onclick="chatInvite()">Convidar</button></div></div>'
   +'<div class="chat-body"><div id="chat-list" role="log" aria-live="off" aria-labelledby="chat-h" tabindex="0"></div><button type="button" id="chat-jump" class="chat-jump" hidden onclick="chatToBottom()">'+IC.down+'<span>Ir para o fim</span></button></div>'
   +'<div id="chat-ann" class="chat-sr" role="status" aria-live="polite" aria-atomic="true"></div>'
   +'<div class="chat-compose"><div id="chat-typing" aria-live="off"></div>'
   +'<div id="chat-rec" class="chat-rec" role="group" aria-label="Gravação de áudio"'+(rec?'':' hidden')+'><span class="dot" aria-hidden="true"></span><span class="t">Gravando 0:00</span><span class="lim">máx. 2:00</span><button type="button" onclick="chatRecCancel()">Cancelar</button><button type="button" class="primary" id="chat-rec-send" onclick="chatRecSend()">Enviar áudio</button></div>'
   +'<div id="chat-reply" class="chat-reply" role="status" hidden></div>'
   +'<form id="chat-form" onsubmit="chatSubmit(event)" aria-label="Escrever mensagem"><div class="chat-field"><textarea id="chat-text" rows="1" maxlength="1000" placeholder="Mensagem para a equipe…" aria-label="Mensagem para a equipe" aria-describedby="chat-kbd" enterkeyhint="send" autocomplete="off" onkeydown="chatKey(event)">'+esc2(draft)+'</textarea><span class="chat-hint"><span id="chat-kbd" class="chat-kbd">Enter envia · Shift+Enter quebra a linha</span><span id="chat-count" class="chat-count" aria-live="polite" hidden></span></span></div>'
   +'<div class="chat-btns"><button type="button" class="chat-ico" aria-label="Tirar foto" title="Tirar foto" onclick="document.getElementById(\'chat-cam-in\').click()">'+IC.cam+'</button><input type="file" id="chat-cam-in" accept="image/*" capture="environment" hidden tabindex="-1" onchange="chatPhoto(this)">'
   +'<button type="button" class="chat-ico" aria-label="Enviar foto da galeria" title="Foto da galeria" onclick="document.getElementById(\'chat-gal-in\').click()">'+IC.gal+'</button><input type="file" id="chat-gal-in" accept="image/*" hidden tabindex="-1" onchange="chatPhoto(this)">'
   +'<button type="button" id="chat-mic" class="chat-ico" aria-label="Gravar áudio" title="Gravar áudio" aria-pressed="false" onclick="chatMic()"><svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="3" width="6" height="11" rx="3"></rect><path d="M5 11a7 7 0 0 0 14 0M12 18v3"></path></svg></button>'
   +'<button type="submit" class="primary" id="chat-send">'+IC.send+'<span>Enviar</span></button></div></form></div>'
   +'<div class="chat-extras" id="chat-extras"></div><div class="chat-leave-row"><button type="button" class="chat-leave" onclick="chatLeave()">Sair da equipe</button></div></div>'};
/* ---------- responder mensagem (como no WhatsApp) ---------- */
var replyTo=null,snip={};
function replyBar(){var b=document.getElementById('chat-reply');if(!b)return;if(!replyTo){b.hidden=true;b.innerHTML='';return}b.hidden=false;
  b.innerHTML='<div><b>Respondendo a '+esc2(replyTo.from===cfg.name?'você':replyTo.from)+'</b><span>'+esc2(replyTo.t||'Mensagem')+'</span></div><button type="button" aria-label="Cancelar resposta" title="Cancelar resposta" onclick="chatReplyCancel()">✕</button>'}
/* v103: apagar mensagem deste aparelho (fica anotada para não voltar quando o ntfy reenviar) */
function delKey(){return 'lojasg.estoque99.chat-del:'+(team?team.topic:'-')}
function delSet(){try{var o=JSON.parse(localStorage.getItem(delKey())||'[]');return Array.isArray(o)?o:[]}catch(e){return []}}
window.chatDelete=async function(id){if(!team||typeof id!=='string'||!/^[a-zA-Z0-9_-]{1,60}$/.test(id))return;if(!confirm('Apagar esta mensagem deste aparelho? Quem já recebeu continua vendo.'))return;
  var l=delSet();if(l.indexOf(id)<0)l.push(id);try{localStorage.setItem(delKey(),JSON.stringify(l.slice(-500)))}catch(e){}
  var k=team.topic+'|'+id;try{await cop('msgs','readwrite',function(st){return st.delete(k)})}catch(e){}try{await cop('imgs','readwrite',function(st){return st.delete(k)})}catch(e){}
  if(replyTo&&replyTo.id===id){replyTo=null;replyBar()}await paint();badges();notify('Mensagem apagada deste aparelho.');var bx=document.getElementById('chat-list');if(bx&&(!document.activeElement||document.activeElement===document.body))try{bx.focus({preventScroll:true})}catch(e){}};
/* v109: "Apagar para todos". Mensagem nova no protocolo do chat, com outro prefixo (E99D:) para que aparelhos com versão antiga
   a ignorem (o leitor antigo só aceita E99:) em vez de mostrar uma mensagem vazia. Nesses aparelhos antigos a mensagem original
   continua aparecendo. Só quem enviou (mesmo nome) ou o gestor da equipe pode apagar para todos; os outros aparelhos conferem. */
function okId(x){return typeof x==='string'&&/^[a-zA-Z0-9_-]{1,60}$/.test(x)}
/* gestor da equipe = quem criou a equipe (dono do código). Os outros aparelhos conferem pelo papel que a sincronização registrou (não auxiliar). */
function iAmGestor(){return !!(cfg&&cfg.owner===true)}
function gestorNames(){var out={};try{var m=window.syncMembers?window.syncMembers():{};Object.keys(m).forEach(function(k){var x=m[k];if(x&&x.role==='gestor'&&x.name)out[String(x.name).slice(0,60)]=1})}catch(e){}return out}
async function origOf(t,id){var r=await cop('msgs','readonly',function(st){return st.get(t.topic+'|'+id)}).catch(function(){return null});if(!r)return null;var m=mem[t.topic+'|'+id]||await decMsg(r.payload);return m?{rec:r,msg:m}:null}
async function dropLocal(t,id){var l;try{l=JSON.parse(localStorage.getItem('lojasg.estoque99.chat-del:'+t.topic)||'[]');if(!Array.isArray(l))l=[]}catch(e){l=[]}if(l.indexOf(id)<0)l.push(id);try{localStorage.setItem('lojasg.estoque99.chat-del:'+t.topic,JSON.stringify(l.slice(-500)))}catch(e){}
  var k=t.topic+'|'+id;delete mem[k];try{await cop('msgs','readwrite',function(st){return st.delete(k)})}catch(e){}try{await cop('imgs','readwrite',function(st){return st.delete(k)})}catch(e){}if(replyTo&&replyTo.id===id){replyTo=null;replyBar()}}
/* quem pode: a minha mensagem (gravada como minha ou com o meu nome) ou qualquer uma se eu sou o gestor */
window.e99CanDelAll=async function(id){if(!team||!cfg||!okId(id))return false;var o=await origOf(team,id);if(!o)return false;return !!(o.rec.mine||o.msg.from===cfg.name||iAmGestor())};
async function recvDel(d,t){var o=null;try{o=JSON.parse(new TextDecoder().decode(await dec(un64(d.message.slice(5)))))}catch(e){return}
  if(!o||o.v!==1||o.t!=='del'||!okId(o.id)||!okId(o.ref))return;if(d.time)try{var prev=+localStorage.getItem(sinceKey())||0;if(d.time>prev)localStorage.setItem(sinceKey(),String(d.time))}catch(e){}
  var from=String(o.from||'').slice(0,60),org=await origOf(t,o.ref);if(t!==team)return;
  if(org){var allowed=org.msg.from===from||(o.g===1&&!!gestorNames()[from]);if(!allowed)return}
  /* sem a original neste aparelho: só anota para ela não aparecer se chegar depois */
  await dropLocal(t,o.ref);if(page==='chat'&&team===t){await paint(false);if(org)window.e99ChatSay('Uma mensagem foi apagada por '+from+'.')}badges()}
window.chatDeleteAll=async function(id){if(!team||!cfg||!okId(id)||sending)return false;var t=team;if(!(await window.e99CanDelAll(id))){notify('Só quem enviou a mensagem ou o gestor pode apagar para todos.');return false}
  if(!confirm('Apagar esta mensagem para todos da equipe? Quem ainda usa uma versão antiga do app continua vendo.'))return false;
  var obj={v:1,t:'del',id:msgId(),ref:id,from:cfg.name,at:new Date().toISOString(),g:iAmGestor()?1:0},r;
  try{r=await fetch(NTFY+'/'+t.topic,{method:'POST',body:'E99D:'+b64(await enc(authBytes(JSON.stringify(obj))))})}catch(e){r=null}
  if(!r||!r.ok){notify(failMsg(r?r.status:0).replace('enviar','apagar para todos'));return false}
  if(t!==team)return false;await dropLocal(t,id);await paint();badges();notify('Mensagem apagada para todos.');return true};
window.chatReply=function(id){var s=snip[id];if(!s)return;replyTo={id:id,from:s.from,t:s.t};replyBar();var t=document.getElementById('chat-text');if(t)t.focus();try{if(navigator.vibrate)navigator.vibrate(12)}catch(e){}};
window.chatReplyCancel=function(){var had=document.activeElement&&document.activeElement.closest&&document.activeElement.closest('#chat-reply');replyTo=null;replyBar();if(had){var t=document.getElementById('chat-text');if(t)t.focus()}};window.e99ChatReplyTo=function(){return replyTo};window.e99ChatSnip=function(id){return snip[id]||null};
window.chatJump=function(id){var box=document.getElementById('chat-list');if(!box)return;var el=box.querySelector('.chat-msg[data-id="'+id.replace(/[^a-zA-Z0-9_-]/g,'')+'"]');if(!el){notify('A mensagem original não está mais neste aparelho.');return}el.scrollIntoView({behavior:calm()?'auto':'smooth',block:'center'});el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');try{el.focus({preventScroll:true})}catch(e){}};
/* arrastar para a direita responde (celular); clique duplo responde (computador) */
(function(){var sw=null;
  document.addEventListener('touchstart',function(ev){var el=ev.target.closest&&ev.target.closest('#chat-list .chat-msg');if(!el||ev.touches.length!==1||ev.target.closest('audio,button,img'))return;sw={el:el,x:ev.touches[0].clientX,y:ev.touches[0].clientY,dx:0,on:false}},{passive:true});
  document.addEventListener('touchmove',function(ev){if(!sw)return;var dx=ev.touches[0].clientX-sw.x,dy=ev.touches[0].clientY-sw.y;if(!sw.on){if(Math.abs(dy)>14&&Math.abs(dy)>Math.abs(dx)){sw=null;return}if(dx>10&&dx>Math.abs(dy)){sw.on=true;sw.el.classList.add('swiping')}}
    if(sw&&sw.on){sw.dx=Math.max(0,Math.min(dx,80));sw.el.style.transform='translateX('+sw.dx+'px)';var ic=sw.el.querySelector('.swipe-ico');if(ic)ic.style.opacity=String(Math.min(1,sw.dx/60))}},{passive:true});
  function end(){if(!sw)return;var s=sw;sw=null;s.el.classList.remove('swiping');s.el.style.transform='';var ic=s.el.querySelector('.swipe-ico');if(ic)ic.style.opacity='0';if(s.on&&s.dx>=55)window.chatReply(s.el.getAttribute('data-id'))}
  document.addEventListener('touchend',end,{passive:true});document.addEventListener('touchcancel',end,{passive:true});
  document.addEventListener('dblclick',function(ev){var el=ev.target.closest&&ev.target.closest('#chat-list .chat-msg');if(el&&!ev.target.closest('audio,img,button')){try{getSelection().removeAllRanges()}catch(e){}if(window.e99React)window.e99React(el.getAttribute('data-id'),'❤️',true);else window.chatReply(el.getAttribute('data-id'))}});
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&replyTo&&document.getElementById('chat-reply'))window.chatReplyCancel()})})();
/* v106: a mensagem aparece na hora como "Enviando…"; se falhar fica "Não enviada" com Tentar de novo (mesmo id: não duplica) */
window.chatSubmit=async function(e){if(e&&e.preventDefault)e.preventDefault();var t=document.getElementById('chat-text');if(!t||!t.value.trim()||!team||sending)return;var v=t.value,re=replyTo,id=msgId(),txt=v.trim().slice(0,1000);t.value='';draft='';grow(t);
  pend={id:id,text:txt,re:re,at:Date.now()};outPut(pend);paint(true);var ok=await window.chatSend(v,null,null,{id:id});pend=null;
  if(ok)outDel(id);else{var nf={id:id,text:txt,re:re,err:lastFail,at:Date.now()};failed.push(nf);outPut(nf);if(re&&replyTo===re)window.chatReplyCancel();window.e99ChatSay('Mensagem não enviada. Use Tentar de novo.');window.e99NetFail&&window.e99NetFail(nf,function(){outPut(nf);if(page==='chat')paint(true)})}
  await paint(true);var t2=document.getElementById('chat-text');if(t2)t2.focus()};
window.chatRetry=async function(id){var i=-1;failed.forEach(function(f,k){if(f.id===id)i=k});if(i<0||sending||!team)return;var f=failed[i];failed.splice(i,1);
  var ex=await cop('msgs','readonly',function(st){return st.get(team.topic+'|'+f.id)}).catch(function(){return null});if(ex){outDel(f.id);await paint(true);return}
  pend=f;await paint(true);var prev=replyTo;replyTo=f.re||null;var ok=await window.chatSend(f.text,null,null,{id:f.id});replyTo=prev;replyBar();pend=null;
  if(!ok){f.err=lastFail;failed.splice(Math.min(i,failed.length),0,f);outPut(f);window.e99NetFail&&window.e99NetFail(f,function(){outPut(f);if(page==='chat')paint(true)})}else outDel(f.id);await paint(true);
  var nb=document.querySelector('#chat-list [data-local="'+f.id+'"] .chat-retry')||document.getElementById('chat-text');if(nb)nb.focus();if(ok)window.e99ChatSay('Mensagem enviada.')};
window.chatDiscard=async function(id){failed=failed.filter(function(f){return f.id!==id});await outDel(id);await paint(false);var t=document.getElementById('chat-text');if(t)t.focus()};
window.e99ChatFailed=function(){return failed.map(function(f){return {id:f.id,text:f.text}})};
window.chatPhoto=async function(input){var f=input.files&&input.files[0];input.value='';if(!f)return;try{notify('Preparando foto…');var p=await compressPlanPhoto(f);var t=document.getElementById('chat-text');var cap=t?t.value:'';if(await window.chatSend(cap,p.data)&&t){t.value='';draft='';grow(t)}}catch(e){notify(e.message||'Não foi possível ler a foto.')}};
async function alertTopic(code){var h=new Uint8Array(await crypto.subtle.digest('SHA-256',authBytes('avisos|'+norm(code))));return 'e99a-'+Array.from(h).map(function(x){return ('0'+x.toString(16)).slice(-2)}).join('').slice(0,24)}
function siteURL(){return location.origin+location.pathname.replace(/(robo|index)\.html$/,'')}
window.e99AlertPing=function(text,tags){if(!team||!team.atopic)return Promise.resolve(false);return fetch(NTFY+'/'+team.atopic,{method:'POST',headers:{'Title':'Estoque 99','Tags':tags||'bell','Click':siteURL()},body:String(text).slice(0,200)}).then(function(r){return r.ok}).catch(function(){return false})};
function chatPing(){try{var k='lojasg.estoque99.chat-ping',last=+localStorage.getItem(k)||0;if(Date.now()-last<120000)return;localStorage.setItem(k,String(Date.now()))}catch(e){}window.e99AlertPing('Nova mensagem de '+cfg.name+' no chat da equipe','speech_balloon')}
async function start(c){cancelRec();replyTo=null;if(!c||!cfg||c.code!==cfg.code){draft='';failed=[];pend=null}cfg=c;team=c?await makeTeam(c.code):null;if(team)team.atopic=await alertTopic(c.code);if(team){var t8=team;outLoad().then(function(l){if(team!==t8||!l.length)return;var have={};failed.forEach(function(f){have[f.id]=1});if(pend)have[pend.id]=1;l.forEach(function(f){if(!have[f.id])failed.push(f)});failed.sort(function(a,b){return (a.at||0)-(b.at||0)});if(page==='chat')paint(false)})}mem={};Object.keys(audioURL).forEach(function(k){URL.revokeObjectURL(audioURL[k])});audioURL={};if(team)connect();else disconnect();badges();listeners.forEach(function(fn){try{fn()}catch(e){}})}
var listeners=[];
window.e99Team={get:function(){return cfg&&team?{code:cfg.code,name:cfg.name,owner:!!cfg.owner,team:cfg.team,sync:cfg.sync===true,replace:cfg.replace===true,topic:team.topic,atopic:team.atopic}:null},onChange:function(fn){listeners.push(fn)},ntfy:function(){return NTFY},
  join:async function(code,name,o){var c={code:norm(code),name:String(name||'').slice(0,40),team:(o&&o.team)||'Equipe',owner:false,sync:true,replace:true};await saveCfg(c);await start(c)},
  close:async function(){if(!team)return;var tp=team.topic+'|';await outDelTopic(team.topic);function del(st){var r=st.openCursor();r.onsuccess=function(){var c=r.result;if(!c)return;if(String(c.key).indexOf(tp)===0)c.delete();c.continue()};return null}try{await cop('msgs','readwrite',del);await cop('imgs','readwrite',del)}catch(e){}await saveCfg(null);await start(null);try{render()}catch(e){}},
  setSync:async function(on,extra){if(!cfg)return;cfg.sync=!!on;if(extra)Object.assign(cfg,extra);await saveCfg(cfg);listeners.forEach(function(fn){try{fn()}catch(e){}})}};
window.chatCreate=async function(e){e.preventDefault();var v=readForm(e.target);var name=String(v.name||'').trim().slice(0,40);if(!name)return;var code=newCode();var c={code:code,name:name,team:authSession.payload.store||'Equipe',owner:true,sync:true,replace:false};await saveCfg(c);await start(c);render();notify('Equipe criada. Toque em Convidar para chamar os auxiliares.')};
window.chatJoin=async function(e){e.preventDefault();var v=readForm(e.target);var code=norm(v.code);var name=String(v.name||'').trim().slice(0,40);if(code.length!==12){notify('O código tem 12 letras e números.');return}if(!name)return;var c={code:code,name:name,team:'Equipe',owner:false,sync:!!(e.target.elements.sync&&e.target.elements.sync.checked),replace:!!(e.target.elements.replace&&e.target.elements.replace.checked)};await saveCfg(c);pendingInvite='';await start(c);render();notify('Você entrou no chat da equipe.')};
window.chatInvite=function(){if(!cfg)return;var link=location.origin+location.pathname.replace(/robo\.html$/,'')+'#equipe='+fmt(cfg.code);var text='Entre no chat da equipe do Estoque 99: '+link+' (código '+fmt(cfg.code)+')';
  if(navigator.share){navigator.share({title:'Chat da equipe',text:text}).catch(function(){})}else{try{navigator.clipboard.writeText(text);notify('Convite copiado. Cole no WhatsApp dos auxiliares.')}catch(e){prompt('Copie o convite:',text)}window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank','noopener')}};
window.chatLeave=async function(){if(!cfg||!confirm('Sair do chat desta equipe neste aparelho? Para voltar, use o código.'))return;await saveCfg(null);await start(null);render()};
/* ---------- integração ---------- */
if(typeof labels==='object'&&!labels.chat){labels.chat='Chat';if(typeof icons==='object')icons.chat='✉'}
var renderBefore=render;render=function(){var r=renderBefore.apply(this,arguments);badges();return r};
var goChat=go;go=function(p){if(p!=='chat'){inChat=false;unreadFrom=null}return goChat.apply(this,arguments)};
window.e99ChatReload=async function(c){if(!authSession||!c)return;await saveCfg(c);await start(c);if(page==='chat')render()};
var enterBefore=authEnter;authEnter=function(){var r=enterBefore.apply(this,arguments);loadCfg().then(function(c){return start(c)}).then(function(){if(pendingInvite&&!cfg){notify('Convite para o chat da equipe recebido.');go('chat')}else if(page==='chat')render()});return r};
var logoutBefore=authLogout;authLogout=async function(){var r=await logoutBefore.apply(this,arguments);if(!authSession){cfg=null;team=null;draft='';failed=[];pend=null;disconnect()}return r};
document.addEventListener('visibilitychange',function(){if(!document.hidden&&page==='chat'&&team){markRead();paint(false)}});
if(typeof authSession!=='undefined'&&authSession)loadCfg().then(start).then(function(){if(page==='chat')render()});
})();
