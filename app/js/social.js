
(function(){
'use strict';
function e(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function T(){try{return window.e99Team&&window.e99Team.get()}catch(x){return null}}
function myName(){var t=T();return t&&t.name?String(t.name).slice(0,40):''}
function myLogin(){return authSession?authLoginName(authSession.record.login):''}
async function sha(t){var h=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(t));return Array.from(new Uint8Array(h)).map(function(b){return b.toString(16).padStart(2,'0')}).join('')}
async function cdb(){var c=window.e99Cloud;if(!c||!c.user())return null;var k=await c.load(),sid=await c.sid();if(!sid||!c.user())return null;return {sid:sid,uid:c.user().uid,col:function(n){return k.db.collection('lojas').doc(sid).collection(n)}}}

/* ---------- pessoas: nomes para @menção e o login de cada uma ---------- */
function persons(){var out=[],seen={};function add(n,lg){n=String(n||'').trim();if(!n||normalText(n)==='todos'||seen[normalText(n)])return;seen[normalText(n)]=1;out.push({name:n,login:lg||''})}
  (state.team||[]).forEach(function(t){add(t.name,t.login)});(window.e99CloudMembers?window.e99CloudMembers():[]).forEach(function(m){add(m.nome,m.login)});return out}
function loginOf(name){var n=normalText(name),p=persons().find(function(x){return normalText(x.name)===n});if(p&&p.login)return p.login;var m=(window.e99CloudMembers?window.e99CloudMembers():[]).find(function(x){return normalText(x.nome)===n});return m?m.login:''}
function rx(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}
window.e99Mentions=function(html){var ps=persons().map(function(p){return e(p.name)}).sort(function(a,b){return b.length-a.length});if(!ps.length||html.indexOf('@')<0)return html;
  return html.replace(new RegExp('@('+ps.map(rx).join('|')+')','gi'),'<span class="mention">@$1</span>')};
function myNames(){var l=[myName()];return l.filter(Boolean).map(function(x){return normalText(x)})}
window.e99IsMention=function(text){var t=normalText(text);return myNames().some(function(n){return n&&t.indexOf('@'+n)>=0})};
function mentionedIn(text){var t=normalText(text);return persons().filter(function(p){return t.indexOf('@'+normalText(p.name))>=0})}

/* ---------- avisos com o app fechado, grátis: app ntfy (Android/iPhone) ou ntfy.sh/app no PC ---------- */
function ntfyBase(){try{return (window.e99Team&&window.e99Team.ntfy())||'https://ntfy.sh'}catch(x){return 'https://ntfy.sh'}}
async function personalTopic(login){var t=T();if(!t||!login)return '';return 'e99p-'+(await sha('pessoal|'+String(t.code).toUpperCase().replace(/[^A-Z0-9]/g,'')+'|'+authLoginName(login))).slice(0,24)}
function site(){return location.origin+location.pathname.replace(/(robo|index)\.html$/,'')}
async function pushTo(login,title,body,page,self){try{if(!login||(authLoginName(login)===myLogin()&&!self))return false;var tp=await personalTopic(login);if(!tp)return false;
  var u=ntfyBase()+'/'+tp+'?title='+encodeURIComponent(title)+'&tags=bell&click='+encodeURIComponent(site()+'#abrir='+(page||'chat'));
  var r=await fetch(u,{method:'POST',body:String(body).slice(0,240)});return r.ok}catch(x){return false}}
window.e99PushTo=pushTo;
window.e99PushCardHTML=function(){return '<div class="push-card" id="push-card"><b>'+(window.e99Icon?e99Icon('bell'):'')+'Avisos com o app fechado (grátis)</b><span class="small">Instale o app gratuito <b>ntfy</b> e assine seus canais. Você recebe marcações, tarefas e mensagens mesmo com o Stok fechado.</span><div id="push-topics" class="small">Carregando seus canais…</div></div>'};
async function fillPush(){var box=document.getElementById('push-topics');if(!box)return;var t=T();if(!t||!authSession){box.textContent='Entre numa equipe no Chat para ativar os avisos.';return}
  var mine=await personalTopic(authSession.record.login),host=ntfyBase().replace(/^https?:\/\//,'');
  box.innerHTML='<p style="margin:0 0 6px">1. Instale: <a href="https://play.google.com/store/apps/details?id=io.heckel.ntfy" target="_blank" rel="noopener">Android</a> · <a href="https://apps.apple.com/app/ntfy/id1625396347" target="_blank" rel="noopener">iPhone</a> · no PC use <a href="'+e(ntfyBase())+'/app" target="_blank" rel="noopener">ntfy.sh/app</a></p>'
   +'<p style="margin:0 0 6px">2. No ntfy, toque em <b>+</b> e assine estes canais (servidor <code>'+e(host)+'</code>):</p>'
   +'<div class="row"><code>'+e(mine)+'</code><button type="button" onclick="e99CopyTopic(\''+e(mine)+'\')">Copiar · seus avisos</button></div>'
   +(t.atopic?'<div class="row"><code>'+e(t.atopic)+'</code><button type="button" onclick="e99CopyTopic(\''+e(t.atopic)+'\')">Copiar · equipe</button></div>':'')
   +'<div class="row"><a class="button" href="ntfy://'+e(host)+'/'+e(mine)+'">Abrir no app ntfy</a><button type="button" onclick="e99PushTest()">Enviar aviso de teste</button></div>'}
window.e99CopyTopic=function(t){try{navigator.clipboard.writeText(t);notify('Canal copiado: '+t)}catch(x){prompt('Copie o canal:',t)}};
window.e99PushTest=async function(){var tp=await personalTopic(authSession.record.login);try{var r=await fetch(ntfyBase()+'/'+tp+'?title='+encodeURIComponent('Stok · teste')+'&tags=white_check_mark&click='+encodeURIComponent(site()),{method:'POST',body:'Seus avisos estão funcionando! 🎉'});notify(r.ok?'Aviso de teste enviado. Se apareceu no ntfy, está tudo certo.':'Não foi possível enviar o teste.')}catch(x){notify('Sem internet para enviar o teste.')}};
new MutationObserver(function(){var b=document.getElementById('push-topics');if(b&&!b.__f){b.__f=1;fillPush()}}).observe(document.documentElement,{childList:true,subtree:true});

/* ---------- enviar: avisa quem foi marcado (@) e quem recebeu resposta ---------- */
var sendBefore=window.chatSend;if(typeof sendBefore==='function')window.chatSend=async function(text){var re=window.e99ChatReplyTo?window.e99ChatReplyTo():null;var ok=await sendBefore.apply(this,arguments);
  try{if(ok){typing(true);var me=myName(),t=String(text||'').trim(),done={};
    mentionedIn(t).forEach(function(p){var lg=p.login||loginOf(p.name);if(lg&&!done[lg]){done[lg]=1;pushTo(lg,me+' marcou você no Stok',t.slice(0,200))}});
    if(re&&re.from&&re.from!==me){var lg=loginOf(re.from);if(lg&&!done[lg]){done[lg]=1;pushTo(lg,me+' respondeu você',(t||'📎 mídia').slice(0,200))}}}}catch(x){}return ok};

/* ---------- digitando… ---------- */
var tyAt=0,typers={},tyUnsub=null,rdUnsub=null,rcUnsub=null,pinUnsub=null,subSid='',readers={},reacts={},pinned=null,lastRead='',lastReadAt=0;
async function typing(stop){var c=await cdb();if(!c)return;var now=Date.now();if(!stop&&now-tyAt<3000)return;tyAt=stop?0:now;try{await c.col('digitando').doc(c.uid).set({nome:myName(),at:stop?0:now})}catch(x){}}
document.addEventListener('input',function(ev){if(ev.target&&ev.target.id==='chat-text'){if(ev.target.value.trim())typing(false);mentionSuggest(ev.target)}});
function paintTyping(){var el=document.getElementById('chat-typing');if(!el){var h=document.querySelector('.chat-wrap .chat-head');if(!h)return;el=document.createElement('div');el.id='chat-typing';el.setAttribute('aria-live','polite');h.after(el)}
  var now=Date.now(),names=Object.keys(typers).filter(function(u){return typers[u].at>now-7000}).map(function(u){return typers[u].nome||'Alguém'});
  var th=names.length?'<span class="dots"><i></i><i></i><i></i></span>'+e(names.length>2?names.length+' pessoas estão digitando…':names.join(' e ')+(names.length>1?' estão':' está')+' digitando…'):'';if(el.__h!==th){el.__h=th;el.innerHTML=th}}
setInterval(function(){if(page==='chat'&&!document.hidden)paintTyping()},1500);

/* ---------- ouvir a nuvem da equipe ---------- */
async function subscribe(){var c=await cdb();if(!c){return}if(subSid===c.sid&&tyUnsub)return;[tyUnsub,rdUnsub,rcUnsub,pinUnsub].forEach(function(f){if(f)f()});subSid=c.sid;
  tyUnsub=c.col('digitando').onSnapshot(function(q){typers={};q.forEach(function(d){if(d.id!==c.uid)typers[d.id]=d.data()});if(page==='chat')paintTyping()},function(){});
  rdUnsub=c.col('lidos').onSnapshot(function(q){readers={};q.forEach(function(d){if(d.id!==c.uid)readers[d.id]=d.data()});decorate()},function(){});
  rcUnsub=c.col('reacoes').orderBy('at','desc').limit(600).onSnapshot(function(q){reacts={};q.forEach(function(d){var x=d.data();if(REACT_OK.indexOf(x.emoji)<0)return;(reacts[x.msg]=reacts[x.msg]||[]).push({uid:x.uid,emoji:x.emoji,nome:x.nome})});decorate()},function(){});
  pinUnsub=c.col('fixada').doc('atual').onSnapshot(function(d){pinned=d.exists?d.data():null;paintPin()},function(){})}
setInterval(function(){if(!document.hidden&&authSession&&T()&&window.e99Cloud&&window.e99Cloud.user())subscribe()},5000);

/* ---------- visto, reações e menções em cada mensagem ---------- */
/* v89: só estes emojis valem (no app e na regra da nuvem); nada da rede vai para onclick */
var REACT_OK=['👍','❤️','😂','😮','😢','🙏'];
var decT=0;function decorate(){clearTimeout(decT);decT=setTimeout(decorateNow,40)}
function decorateNow(){var box=document.getElementById('chat-list');if(!box)return;var uid=window.e99Cloud&&window.e99Cloud.user()?window.e99Cloud.user().uid:'';
  box.querySelectorAll('.chat-msg').forEach(function(m){var id=m.getAttribute('data-id'),l=reacts[id]||[];var old=m.querySelector('.reacts');if(old)old.remove();if(!l.length)return;var g={};l.forEach(function(r){(g[r.emoji]=g[r.emoji]||[]).push(r)});
    var d=document.createElement('div');d.className='reacts';d.innerHTML=Object.keys(g).map(function(k){var mine=g[k].some(function(r){return r.uid===uid});var ns=g[k].map(function(r){return r.nome}).join(', ');return '<button type="button" class="'+(mine?'me':'')+'" title="'+e(ns)+'" aria-pressed="'+(mine?'true':'false')+'" aria-label="Reação '+e(k)+', '+g[k].length+(g[k].length>1?' pessoas':' pessoa')+(mine?'. Toque para tirar a sua':'. Toque para reagir também')+'" data-react="'+REACT_OK.indexOf(k)+'">'+e(k)+' '+g[k].length+'</button>'}).join('');
    d.addEventListener('click',function(ev){var b=ev.target.closest('button[data-react]');if(b)window.e99React(id,REACT_OK[+b.getAttribute('data-react')])});
    d.setAttribute('role','group');d.setAttribute('aria-label','Reações');var when=m.querySelector(':scope>.chat-meta')||m.querySelector('.when');if(when&&when.parentNode===m)m.insertBefore(d,when);else m.appendChild(d)});
  box.querySelectorAll('.seen-by').forEach(function(s){s.remove()});var mine=box.querySelectorAll('.chat-msg.mine[data-id]');var last=mine[mine.length-1];
  if(last){var at=last.getAttribute('data-at')||'';var who=Object.keys(readers).filter(function(u){return String(readers[u].at||'')>=at}).map(function(u){return readers[u].nome||'?'});
    var s=document.createElement('span');s.className='seen-by';s.innerHTML=who.length?'<b aria-hidden="true">✓✓</b> Visto por '+e(who.slice(0,4).join(', '))+(who.length>4?' e mais '+(who.length-4):''):'✓ Enviada';last.appendChild(s)}
  markRead(box)}
async function markRead(box){if(page!=='chat'||document.hidden)return;var all=box.querySelectorAll('.chat-msg[data-at]');if(!all.length)return;var at=all[all.length-1].getAttribute('data-at');if(!at||at<=lastRead||Date.now()-lastReadAt<4000)return;
  var c=await cdb();if(!c)return;lastRead=at;lastReadAt=Date.now();try{await c.col('lidos').doc(c.uid).set({nome:myName(),at:String(at).slice(0,40)})}catch(x){}}
function watch(){var box=document.getElementById('chat-list');if(!box||box.__social)return;box.__social=1;new MutationObserver(decorate).observe(box,{childList:true});decorate()}
setInterval(function(){if(page==='chat'&&!document.hidden){watch();paintPin()}},700);

/* ---------- reações (❤️ com dois toques, como no Instagram) ---------- */
window.e99React=async function(id,emoji,heart){if(REACT_OK.indexOf(emoji)<0||!/^[A-Za-z0-9_-]{1,60}$/.test(String(id||'')))return;var c=await cdb();if(!c){notify('Vincule seu e-mail (tela Conta) para reagir às mensagens.');return}
  var ref=c.col('reacoes').doc(id+'_'+c.uid),cur=(reacts[id]||[]).find(function(r){return r.uid===c.uid});
  if(heart){var el=document.querySelector('.chat-msg[data-id="'+id+'"]');if(el){var h=document.createElement('span');h.className='heart-pop';h.textContent='❤️';el.appendChild(h);setTimeout(function(){h.remove()},950)}if(cur&&cur.emoji==='❤️')return}
  try{if(cur&&cur.emoji===emoji)await ref.delete();else await ref.set({msg:id,uid:c.uid,emoji:emoji,nome:myName(),at:Date.now()});
    var sn=window.e99ChatSnip&&window.e99ChatSnip(id);if(sn&&sn.from&&sn.from!==myName()&&!(cur&&cur.emoji===emoji)){var lg=loginOf(sn.from);if(lg)pushTo(lg,myName()+' reagiu '+emoji,(sn.t||'à sua mensagem').slice(0,120))}}catch(x){notify('Não foi possível reagir agora.')}};
/* dois toques no celular */
var tap={id:'',t:0,x:0,y:0};document.addEventListener('touchend',function(ev){var m=ev.target.closest&&ev.target.closest('#chat-list .chat-msg');if(!m||ev.target.closest('button,audio,a'))return;var id=m.getAttribute('data-id'),now=Date.now(),t0=ev.changedTouches&&ev.changedTouches[0];if(!t0)return;
  if(tap.id===id&&now-tap.t<320&&Math.abs(t0.clientX-tap.x)<24&&Math.abs(t0.clientY-tap.y)<24){tap.id='';window.e99React(id,'❤️',true)}else tap={id:id,t:now,x:t0.clientX,y:t0.clientY}},{passive:true});
/* segurar a mensagem (ou botão direito no PC): reações e ações, como no WhatsApp/Facebook */
var lp=null;document.addEventListener('touchstart',function(ev){var m=ev.target.closest&&ev.target.closest('#chat-list .chat-msg');if(!m||ev.target.closest('button,audio'))return;var t0=ev.touches[0];lp={x:t0.clientX,y:t0.clientY,tm:setTimeout(function(){lp=null;menu(m.getAttribute('data-id'))},480)}},{passive:true});
document.addEventListener('touchmove',function(ev){if(!lp)return;var t0=ev.touches[0];if(Math.abs(t0.clientX-lp.x)>8||Math.abs(t0.clientY-lp.y)>8){clearTimeout(lp.tm);lp=null}},{passive:true});
document.addEventListener('touchend',function(){if(lp){clearTimeout(lp.tm);lp=null}},{passive:true});
document.addEventListener('contextmenu',function(ev){var m=ev.target.closest&&ev.target.closest('#chat-list .chat-msg');if(!m||ev.target.closest('audio'))return;ev.preventDefault();menu(m.getAttribute('data-id'))});
function menu(id,back){if(!id)return;try{if(navigator.vibrate)navigator.vibrate(15)}catch(x){}var old=document.getElementById('msg-menu');if(old)old.remove();var sn=window.e99ChatSnip&&window.e99ChatSnip(id)||{};back=back||document.activeElement;
  var d=document.createElement('div');d.id='msg-menu';d.setAttribute('role','dialog');d.setAttribute('aria-modal','true');d.setAttribute('aria-label','Opções da mensagem');
  /* v106: sem emoji nas ações; "Apagar deste aparelho" também aqui (no celular o botão some da bolha); Esc fecha e o foco volta */
  d.innerHTML='<div class="mm"><div class="emo" role="group" aria-label="Reagir">'+REACT_OK.map(function(k,i){return '<button type="button" data-emo="'+i+'" aria-label="Reagir com '+['curti','coração','risada','surpresa','triste','obrigado'][i]+'">'+k+'</button>'}).join('')+'</div><div class="act"><button type="button" data-a="reply">Responder</button><button type="button" data-a="pin">Fixar no topo</button><button type="button" data-a="fwd">Encaminhar</button><button type="button" data-a="copy">Copiar texto</button><button type="button" data-a="delall" class="danger" hidden>Apagar para todos</button><button type="button" data-a="del" class="danger">Apagar deste aparelho</button><button type="button" data-a="close">Fechar</button></div></div>';
  function close(){d.remove();document.removeEventListener('keydown',key,true);try{if(back&&back.isConnected)back.focus({preventScroll:true});else{var t=document.getElementById('chat-text');if(t)t.focus({preventScroll:true})}}catch(x){}}
  function key(ev){if(!d.isConnected){document.removeEventListener('keydown',key,true);return}if(ev.key==='Escape'){ev.preventDefault();ev.stopPropagation();close();return}
    if(ev.key==='Tab'){var bs=[].slice.call(d.querySelectorAll('button'));var i=bs.indexOf(document.activeElement);if(ev.shiftKey&&i<=0){ev.preventDefault();bs[bs.length-1].focus()}else if(!ev.shiftKey&&i===bs.length-1){ev.preventDefault();bs[0].focus()}}}
  document.addEventListener('keydown',key,true);
  d.addEventListener('click',function(ev){var b=ev.target.closest('button');if(ev.target===d){close();return}if(!b)return;var k=b.getAttribute('data-emo'),a=b.getAttribute('data-a');close();
    if(k!=null)window.e99React(id,REACT_OK[+k]);else if(a==='reply')window.chatReply(id);else if(a==='pin')pin(id,sn);else if(a==='del')window.chatDelete(id);else if(a==='delall')window.chatDeleteAll(id);else if(a==='copy'){try{navigator.clipboard.writeText(sn.t||'');notify('Texto copiado.')}catch(x){}}
    else if(a==='fwd'){var t=document.getElementById('chat-text');if(t){t.value='↪ Encaminhada de '+(sn.from||'?')+': '+(sn.t||'');t.dispatchEvent(new Event('input',{bubbles:true}));t.focus()}}});
  document.body.appendChild(d);var f=d.querySelector('.emo button');if(f)f.focus();
  if(window.e99CanDelAll)window.e99CanDelAll(id).then(function(y){var b=d.querySelector('[data-a=delall]');if(b&&y&&d.isConnected)b.hidden=false}).catch(function(){})}
window.e99MsgMenu=menu;

/* ---------- mensagem fixada ---------- */
async function pin(id,sn){var c=await cdb();if(!c){notify('Vincule seu e-mail para fixar mensagens.');return}try{await c.col('fixada').doc('atual').set({msg:id,t:String(sn.t||'Mensagem').slice(0,140),from:String(sn.from||'').slice(0,60),por:myName(),at:Date.now()});notify('Mensagem fixada no topo do chat.')}catch(x){notify('Não foi possível fixar agora.')}}
function paintPin(){var list=document.getElementById('chat-list');if(!list)return;var b=document.getElementById('chat-pin');if(!b){b=document.createElement('div');b.id='chat-pin';b.hidden=true;list.before(b)}
  if(!pinned){b.hidden=true;return}var html='<span aria-hidden="true">📌</span><button type="button" class="pin-go"><b>Fixada por '+e(pinned.por||'?')+'</b><span>'+e(pinned.from?pinned.from+': ':'')+e(pinned.t)+'</span></button><button type="button" aria-label="Desafixar mensagem" title="Desafixar" data-unpin="1">✕</button>';
  if(b.__h!==html){b.__h=html;b.innerHTML=html;b.onclick=async function(ev){if(ev.target.closest('[data-unpin]')){var c=await cdb();if(c)try{await c.col('fixada').doc('atual').delete()}catch(x){}return}window.chatJump(pinned.msg)}}b.hidden=false}

/* ---------- @menção com sugestões ---------- */
function mentionSuggest(ta){var box=document.getElementById('mention-box');var form=document.getElementById('chat-form');if(!form)return;if(!box){box=document.createElement('div');box.id='mention-box';box.hidden=true;box.setAttribute('role','group');box.setAttribute('aria-label','Sugestões de menção');form.before(box)}
  var pos=ta.selectionStart||ta.value.length,before=ta.value.slice(0,pos),m=before.match(/(^|\s)@([^\s@]{0,20})$/);if(!m){box.hidden=true;return}
  var q=normalText(m[2]),l=persons().filter(function(p){return normalText(p.name).indexOf(q)===0||normalText(p.name).split(' ').some(function(w){return w.indexOf(q)===0})}).slice(0,6);
  if(!l.length){box.hidden=true;return}box.innerHTML=l.map(function(p){return '<button type="button" data-n="'+e(p.name)+'">@'+e(p.name)+'</button>'}).join('');box.hidden=false;
  box.onclick=function(ev){var b=ev.target.closest('button');if(!b)return;var n=b.getAttribute('data-n');var start=pos-m[2].length-1;ta.value=ta.value.slice(0,start)+'@'+n+' '+ta.value.slice(pos);var c=start+n.length+2;ta.focus();ta.setSelectionRange(c,c);box.hidden=true}}

/* ---------- encaminhar atividade, NF ou corredor no chat (marcando o responsável) ---------- */
function ownerName(id){if(!id)return '';if(normalText(id)==='todos')return 'TODOS';var t=(state.team||[]).find(function(x){return x.id===id});return t?t.name:''}
window.e99Forward=function(kind,id,aid){var txt='';
  if(kind==='act'){var p=(state.plans||[]).find(function(x){return x.id===id});var a=p&&(p.activities||[]).find(function(x){return x.id===aid});if(!a)return;var who=a.owner&&normalText(a.owner)!=='todos'?'@'+a.owner:'@TODOS';
    txt='📌 Atividade para '+who+': '+a.title+(a.time?' (até '+a.time+')':'')+' — '+(p.title||'Plano de ação')+' · '+String(p.date||'').split('-').reverse().join('/')+(a.done?' ✅ feita':'')}
  else if(kind==='nf'){var n=(state.nfs||[]).find(function(x){return x.id===id});if(!n)return;var w=ownerName(n.owner);txt='📦 NF '+n.number+' · '+(n.supplier||'')+' — '+(n.status||'')+(w?' · responsável @'+w:'')}
  else if(kind==='cor'){var c=(state.corridors||[]).find(function(x){return x.id===id});if(!c)return;var w2=ownerName(c.owner);txt='🧭 Corredor '+c.number+(c.sector?' · '+c.sector:'')+(w2?' — responsável @'+w2:'')}
  if(!T()){notify('Entre numa equipe no Chat para encaminhar.');return}go('chat');setTimeout(function(){var t=document.getElementById('chat-text');if(t){t.value=txt+' ';t.focus();t.setSelectionRange(t.value.length,t.value.length)}notify('Revise e toque em Enviar. Quem foi marcado recebe o aviso.')},150)};

/* ---------- plano salvo: avisa quem recebeu atividade nova ---------- */
if(typeof savePlan==='function'){var spBefore=savePlan;savePlan=async function(ev){var d=planDraft?JSON.parse(JSON.stringify(planDraft)):null,old=d&&(state.plans||[]).find(function(x){return x.id===d.id});var r=await spBefore.apply(this,arguments);
  try{if(d&&!planDraft){var by={};(d.activities||[]).forEach(function(a){var o=old&&(old.activities||[]).find(function(x){return x.id===a.id});if(!a.owner||normalText(a.owner)==='todos'||(o&&normalText(o.owner)===normalText(a.owner)))return;(by[a.owner]=by[a.owner]||[]).push(a.title)});
    Object.keys(by).forEach(function(n){var lg=loginOf(n);if(lg)pushTo(lg,'Nova atividade para você',by[n].slice(0,3).join(' · ')+(by[n].length>3?' e mais '+(by[n].length-3):''),'plans')})}}catch(x){}return r}}

/* ---------- contas confirmadas entram na Equipe e recebem corredores (só no aparelho do gestor) ---------- */
var linkT=0;window.e99OnMembers=function(){clearTimeout(linkT);linkT=setTimeout(linkAccounts,1500)};setInterval(function(){if(authSession&&!document.hidden)linkAccounts()},60000);setTimeout(function(){if(authSession)linkAccounts()},12000);var goL=go;go=function(p){var r=goL.apply(this,arguments);if(p==='team'||p==='corridors'||p==='profile')setTimeout(linkAccounts,300);return r};
function invitesList(){try{return JSON.parse(localStorage.getItem('lojasg.estoque99.aux-invites:'+authSession.storeKey)||'[]')||[]}catch(x){return []}}
function confirmed(){var out=[],seen={};function add(m){if(!m.login)return;var lg=authLoginName(m.login);if(lg===myLogin()||lg==='estoque 99'||seen[lg])return;seen[lg]=1;out.push(m)}
  (window.e99CloudMembers?window.e99CloudMembers():[]).forEach(add);
  try{var mem=window.syncMembers?window.syncMembers():{};Object.keys(mem).forEach(function(d){var m=mem[d];if(m&&m.login)add({login:m.login,nome:m.name,role:m.role,uid:'',verificado:false,inviteId:m.inviteId||''})})}catch(x){}return out}
async function linkAccounts(){var t=T();if(!authSession||!t||!(t.owner||authSession.payload.role!=='auxiliar')||!state||!Array.isArray(state.team))return;var ms=confirmed();if(!ms.length)return;var inv=invitesList(),added=[],linked=0;
  ms.forEach(function(m){var lg=authLoginName(m.login);var per=state.team.find(function(x){return x.login&&authLoginName(x.login)===lg});if(per)return;
    var pr=window.profByLogin?window.profByLogin(m.login):null,iv=inv.find(function(i){return i.inviteId&&i.inviteId===m.inviteId})||inv.find(function(i){return i.login&&authLoginName(i.login)===lg});
    var names=[iv&&iv.name,m.nome,pr&&pr.p&&pr.p.name].concat(pr&&pr.p&&pr.p.names||[]).filter(Boolean).map(normalText);
    per=state.team.find(function(x){return !x.login&&names.indexOf(normalText(x.name))>=0});
    if(per){per.login=m.login.slice(0,80);linked++;return}
    var id='c'+String(m.uid||lg).replace(/[^a-zA-Z0-9]/g,'').slice(0,14);if(state.team.some(function(x){return x.id===id}))id+=Date.now().toString(36).slice(-4);
    state.team.push({id:id,name:String((pr&&pr.p&&pr.p.name)||m.nome||m.login).slice(0,60),role:String((pr&&pr.p&&pr.p.cargo)||(m.role==='auxiliar'?'Auxiliar de estoque':'Estoque')).slice(0,60),login:m.login.slice(0,80)});added.push(state.team[state.team.length-1].name)});
  var dist=distribute(false);if(added.length||linked||dist){await save();render();notify((added.length?'Na Equipe agora: '+added.join(', ')+'. ':'')+(linked?linked+' pessoa(s) ligada(s) à conta. ':'')+(dist?dist+' corredor(es) distribuído(s) entre as contas confirmadas.':''))}}
function auxConfirmed(){var lgs={};confirmed().forEach(function(m){if(m.role==='auxiliar')lgs[authLoginName(m.login)]=1});return state.team.filter(function(x){return x.login&&lgs[authLoginName(x.login)]})}
function corNum(c){var n=parseInt(String(c.number).replace(/\D/g,''),10);return isNaN(n)?999:n}
/* all=false: só corredores sem responsável; all=true: redistribui todos (menos os de TODOS) em blocos seguidos */
function distribute(all){var ps=auxConfirmed();if(!ps.length||!Array.isArray(state.corridors))return 0;var ids={};state.team.forEach(function(x){ids[x.id]=1});
  var list=state.corridors.filter(function(c){var o=normalText(c.owner||'');if(o==='todos')return false;return all||!o||!ids[c.owner]}).sort(function(a,b){return corNum(a)-corNum(b)});if(!list.length)return 0;
  if(all){var per=Math.ceil(list.length/ps.length);list.forEach(function(c,i){c.owner=ps[Math.min(ps.length-1,Math.floor(i/per))].id});return list.length}
  var load={};ps.forEach(function(p){load[p.id]=state.corridors.filter(function(c){return c.owner===p.id}).length});list.forEach(function(c){var p=ps.slice().sort(function(a,b){return load[a.id]-load[b.id]})[0];c.owner=p.id;load[p.id]++});return list.length}
window.e99Distribute=async function(){var ps=auxConfirmed();if(!ps.length){notify('Nenhum auxiliar com conta ainda.');return}if(!confirm('Distribuir os corredores (menos os de TODOS) em blocos entre: '+ps.map(function(p){return p.name}).join(', ')+'?'))return;var n=distribute(true);await save();render();notify(n+' corredor(es) distribuído(s).')};
var rBefore=render;render=function(){var r=rBefore.apply(this,arguments);try{if(page==='corridors'&&T()&&T().owner){var v=document.getElementById('view'),h=v&&v.querySelector('.hero');if(h&&!v.querySelector('.cor-dist')){var ps=auxConfirmed();var d=document.createElement('div');d.className='panel help cor-dist';
  d.innerHTML='<span><b>⚖️ Corredores por conta</b><br><span class="small">'+(ps.length?ps.length+' auxiliar(es) com conta: '+e(ps.map(function(p){return p.name}).join(', ')):'Quando os auxiliares criarem a conta, eles entram aqui.')+'</span></span><button type="button" class="primary" onclick="e99Distribute()" '+(ps.length?'':'disabled')+'>Distribuir corredores</button>';h.after(d)}}}catch(x){}return r};
})();
