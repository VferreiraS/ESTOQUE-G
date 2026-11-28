/* v169: chat no padrão do print do dono ("Equipe do Estoque", verde no escuro) e barra de cima do celular com o logo atual + StoK.
   Só acrescenta e reorganiza o que já existe: responder, reagir, apagar, anexos, áudio, busca, convite, "Lida por" e a cifra não mudam.
   - Barra de cima (≤900 px): ☰ (Mais opções), logo oficial fixo (prateleira, sem troca de temporada) + StoK / ESTOQUE 99, sino e Minha conta.
   - Chat da equipe: cabeçalho com anel verde, "N participantes • M online", telefone e vídeo (ainda sem chamadas: só avisa),
     cada sequência começa com foto (anel verde e bolinha de online), nome, coroa do gestor e cargo; balões alinhados à esquerda.
   - Mensagem fixada vira o cartão dourado "Aviso importante" (social.js). Anexo com ícone de PDF e botão quadrado de baixar.
   - Campo: "+" (foto, câmera, arquivo e áudio), "Mensagem...", emoji e enviar sempre à vista. */
(function(){
'use strict';
var LOGO='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InIiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmZjZhNDgiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNkOTE0MGIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cGF0aCBmaWxsPSJ1cmwoI3IpIiBkPSJNMjIgMTRoNTZ2MTJIMjJ6TTIyIDE0aDEydjQwSDIyek0yMiA0Mmg1NnYxMkgyMnpNNjYgNDJoMTJ2NDRINjZ6TTIyIDc0aDU2djEySDIyek00NiAzMGgxMHYxMEg0NnpNNTYgMzJoOHY4aC04ek0zMCA2MGgxMHYxMkgzMHoiLz48L3N2Zz4=';
function E(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function ic(p,w,sw){w=w||22;return '<svg aria-hidden="true" focusable="false" width="'+w+'" height="'+w+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="'+(sw||1.9)+'" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
var I={menu:'<path d="M3.5 6h17M3.5 12h17M3.5 18h17"/>',user:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 phone:'<path d="M5 3.5h3.5l2 5-2.6 1.6a12 12 0 0 0 6 6l1.6-2.6 5 2V19a2 2 0 0 1-2 2A17 17 0 0 1 3 5.5a2 2 0 0 1 2-2z"/>',
 video:'<rect x="2.5" y="6" width="13" height="12" rx="2.5"/><path d="m15.5 10.5 6-3.5v10l-6-3.5z"/>',
 smile:'<circle cx="12" cy="12" r="9"/><path d="M8.3 14.2a4.6 4.6 0 0 0 7.4 0"/><circle cx="9" cy="9.6" r=".6" fill="currentColor"/><circle cx="15" cy="9.6" r=".6" fill="currentColor"/>',
 plane:'<path d="M21.5 2.5 10.6 13.4"/><path d="M21.5 2.5 15 21l-4.4-7.6L3 9z"/>',dl:'<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M5 20h14"/>',
 back:'<path d="m15 18-6-6 6-6"/>',mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>'};
var SHELF='<svg aria-hidden="true" focusable="false" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M3 21V3.5h18V21M3 12h18M3 20.5h18"/><path d="M5.5 11.5V7h4v4.5M10.8 11.5V8.2h3.6v3.3M5.5 20V15.4h4.6V20M11.6 20v-3.6h3.3V20M16.2 20v-5.5h2.9V20"/></svg>';
var CROWN='<svg class="v169-crown" aria-hidden="true" focusable="false" width="20" height="16" viewBox="0 0 24 18"><path fill="currentColor" d="M2 4.5 7 9l5-7 5 7 5-4.5-2 11H4z"/><rect x="4" y="16" width="16" height="2" rx="1" fill="currentColor"/></svg>';
var CHECK2='<svg class="v169-tk" aria-hidden="true" focusable="false" width="20" height="14" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m1.5 8.5 4.5 4.5 9-10.5"/><path d="m10.5 12.5.5.5 9-10.5"/></svg>';
var PDF='<svg aria-hidden="true" focusable="false" width="36" height="44" viewBox="0 0 40 48"><path d="M4 0h22l14 14v30a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z" fill="#dc3d3a"/><path d="M26 0v10a4 4 0 0 0 4 4h10z" fill="#f4a09d"/><text x="19" y="36" font-size="12.5" font-weight="600" fill="#fff" text-anchor="middle" font-family="system-ui,-apple-system,Segoe UI,sans-serif">PDF</text></svg>';
var EMO=['👍','😀','😂','🙏','👏','✅','📦','🚚','⚠️','❤️','👀','🔥'];
var CALL='Chamadas ainda não estão disponíveis neste app.';
function pg(){return typeof page!=='undefined'?page:''}
function say(t){try{if(typeof notify==='function')notify(t)}catch(e){}try{if(window.e99ChatSay)window.e99ChatSay(t)}catch(e){}}
window.e99Call=function(){say(CALL)};

/* ---------- barra de cima do celular ---------- */
function topbar(){var h=document.querySelector('main>header');if(!h||typeof authSession==='undefined'||!authSession)return;
  var left=h.firstElementChild,tb=h.querySelector('.toolbar');if(!left||!tb)return;
  if(!h.querySelector('.v169-menu'))left.insertAdjacentHTML('afterbegin','<button type="button" id="v169-menu" class="v169-menu" aria-label="Abrir menu" onclick="go(\'mobile-menu\')">'+ic(I.menu,26,1.8)+'</button>');
  if(!h.querySelector('.v169-brand'))left.insertAdjacentHTML('afterend','<div class="v169-brand" role="img" aria-label="StoK · Estoque 99"><img class="v169-logo" alt="" src="'+LOGO+'" width="30" height="30"><span class="v169-name"><b>StoK</b><small>ESTOQUE 99</small></span></div>');
  if(!h.querySelector('.v169-me')){var bell=tb.querySelector('.bell-btn')||tb.querySelector('[onclick="go(\'alerts\')"]');var b='<button type="button" id="v169-me" class="v169-me" aria-label="Minha conta" onclick="go(\'account\')">'+ic(I.user,26,1.8)+'</button>';if(bell)bell.insertAdjacentHTML('afterend',b);else tb.insertAdjacentHTML('beforeend',b)}
  var hh=Math.round(h.getBoundingClientRect().height)||56;if(document.body.style.getPropertyValue('--v169-hh')!==hh+'px')document.body.style.setProperty('--v169-hh',hh+'px')}

/* ---------- dados das pessoas ---------- */
function ctx(){try{return window.e99Loja&&e99Loja.ctx&&e99Loja.ctx()}catch(e){return null}}
function onl(){try{return window.e99Cv&&e99Cv.online?e99Cv.online():[]}catch(e){return []}}
function who(name,cache,on){if(cache[name])return cache[name];var p=null;try{p=window.e99Perfil?e99Perfil({name:name}):null}catch(e){}
  var c=ctx(),uid=p&&p.me?(c&&c.uid):(p&&p.uid),role=uid&&c&&c.papeis?c.papeis[uid]||'':'';
  if(!role&&p&&!p.me&&p.papel)role=p.papel;
  if(!role){try{var m=window.syncMembers?syncMembers():{};for(var k in m){var x=m[k];if(x&&x.name===name&&x.role){role=x.role;break}}}catch(e){}}
  var g=role==='gestor'||!!(p&&p.me&&window.e99GestorOk&&e99GestorOk());
  var cargo=p&&p.cargo||(g?'Gestor':role==='auxiliar'?'Auxiliar de Estoque':role==='estoque'?'Estoque':'');
  var r={name:p&&p.name||name,cargo:cargo,g:g,on:!!(p&&p.me)||!!(uid&&on.indexOf(uid)>=0),ref:p?p.ref:'',me:!!(p&&p.me)};cache[name]=r;return r}
function avHtml(name){try{return window.profAvatar?profAvatar(name,'av-s'):''}catch(e){return ''}}

/* ---------- chat da equipe ---------- */
function head(){var hd=document.querySelector('#view .chat-wrap .chat-head');if(!hd)return;
  var gav=hd.querySelector('.chat-gav');if(gav&&!gav.__v169){gav.__v169=1;gav.innerHTML=SHELF}
  var h2=document.getElementById('chat-h');if(h2&&h2.textContent!=='Equipe do Estoque'){if(!h2.title)h2.title=h2.textContent;h2.textContent='Equipe do Estoque'}
  var acts=hd.querySelector('.chat-head-acts');if(acts&&!acts.querySelector('.v169-call'))acts.insertAdjacentHTML('afterbegin','<span class="v169-sep" aria-hidden="true"></span><button type="button" class="chat-hbtn v169-call" aria-label="Ligar para a equipe" title="Ligar" onclick="e99Call()">'+ic(I.phone,26,1.8)+'</button><button type="button" class="chat-hbtn v169-call" aria-label="Chamada de vídeo com a equipe" title="Vídeo" onclick="e99Call()">'+ic(I.video,28,1.8)+'</button>');
  sub();
  /* busca e convite (que no celular saem do cabeçalho) ficam também na linha de baixo */
  var lr=document.querySelector('#view .chat-wrap .chat-leave-row');if(lr&&!lr.querySelector('.v169-more')){lr.insertAdjacentHTML('afterbegin','<button type="button" class="v169-more" onclick="scrollTo(0,0);chatSearch(true)">Buscar mensagens</button><button type="button" class="v169-more" onclick="chatInvite()">Convidar para a equipe</button>')}}
function sub(){var s=document.querySelector('#view .chat-wrap .chat-sub');if(!s)return;var st=document.getElementById('chat-status');var on=!!(st&&st.classList.contains('on'));
  var n=1;try{n=1+(window.e99PerfilAll?e99PerfilAll().length:0)}catch(e){}
  var froms={};document.querySelectorAll('#chat-list .chat-msg[data-from]').forEach(function(m){froms[m.getAttribute('data-from')]=1});n=Math.max(n,Object.keys(froms).length||1);
  var o=Math.min(n,Math.max(on?1:0,onl().length));
  var t=on?n+(n>1?' participantes':' participante')+' • '+o+' online':(st?st.textContent:'Conectando…');
  var v=s.querySelector('.v169-sub');if(!v){v=document.createElement('span');v.className='v169-sub';v.setAttribute('aria-hidden','true');s.insertBefore(v,s.firstChild)}
  if(v.textContent!==t){v.textContent=t}v.classList.toggle('on',on)}
function msgs(){var box=document.getElementById('chat-list');if(!box)return;var cache={},on=onl();
  box.querySelectorAll('.chat-msg[data-id]').forEach(function(m){
    var id=m.getAttribute('data-id'),from=m.getAttribute('data-from')||'?',mine=m.classList.contains('mine');
    /* hora + dois tiques nas próprias */
    var meta=m.querySelector(':scope>.chat-meta');if(meta&&mine&&!meta.querySelector('.v169-tk'))meta.insertAdjacentHTML('beforeend',CHECK2);
    files(m);
    var prev=m.previousElementSibling,hasHead=prev&&prev.classList.contains('v169-who')&&prev.getAttribute('data-for')===id;
    if(m.classList.contains('cont')){if(hasHead)prev.remove();return}
    var w=who(from,cache,on),sig=[w.name,w.cargo,w.g,w.on,w.ref,(avHtml(from).match(/src="([^"]{0,80})/)||[])[1]||''].join('|');
    if(hasHead&&prev.getAttribute('data-sig')===sig)return;
    var html='<div class="v169-who'+(w.g?' g':'')+(mine?' mine':'')+'" data-for="'+E(id)+'" data-sig="'+E(sig)+'"><button type="button" class="prof-chip v169-av'+(w.on?' on':'')+'" tabindex="-1" aria-hidden="true" data-ref="'+E(w.ref)+'" data-name="'+E(from)+'">'+avHtml(from)+'</button>'
      +'<button type="button" class="prof-chip v169-nm" data-ref="'+E(w.ref)+'" data-name="'+E(from)+'" aria-label="Ver perfil de '+E(w.name)+(w.cargo?', '+E(w.cargo):'')+(w.g?', gestor':'')+(w.on?', online':'')+'"><span class="v169-n"><b>'+E(w.name)+'</b>'+(w.g?CROWN:'')+'</span>'+(w.cargo?'<span class="v169-cg">'+E(w.cargo)+'</span>':'')+'</button></div>';
    if(hasHead)prev.outerHTML=html;else m.insertAdjacentHTML('beforebegin',html)});
  /* cabeçalho que ficou sem mensagem (apagada) sai */
  box.querySelectorAll('.v169-who').forEach(function(h){var n=h.nextElementSibling;if(!n||!n.classList.contains('chat-msg')||n.getAttribute('data-id')!==h.getAttribute('data-for'))h.remove()})}
function files(root){root.querySelectorAll('.chat-file').forEach(function(f){if(f.__v169)return;f.__v169=1;var b=f.querySelector('.cf-mid b'),n=b?b.textContent:'',x=(n.split('.').pop()||'').toLowerCase();f.setAttribute('data-ext',x);
    if(x==='pdf'){var i=f.querySelector('.cf-ic');if(i)i.innerHTML=PDF}
    var d=f.querySelector('.cf-dl');if(d)d.innerHTML=ic(I.dl,24,2)+'<span class="chat-sr">Baixar</span>';
    var m=f.closest('.chat-msg,.cv-b');if(m)m.classList.add('v169-hasfile')})}
function compose(){var f=document.getElementById('chat-form');if(f){var t=document.getElementById('chat-text');if(t&&t.placeholder!=='Mensagem...')t.placeholder='Mensagem...';
    var s=document.getElementById('chat-send');if(s&&!s.__v169){s.__v169=1;var sv=s.querySelector('svg');if(sv)sv.outerHTML=ic(I.plane,24,2)}
    var mic=document.getElementById('chat-mic'),at=document.getElementById('chat-attach');if(mic&&at&&mic.parentNode!==at){at.appendChild(mic);if(!mic.querySelector('span'))mic.insertAdjacentHTML('beforeend','<span aria-hidden="true">Áudio</span>')}
    var fd=f.querySelector('.chat-field');if(fd&&!fd.querySelector('.v169-emo'))emoBtn(fd,t)}
  var cv=document.querySelector('#view .cv-compose');if(cv&&!cv.__v169){cv.__v169=1;var ta=cv.querySelector('textarea');if(ta)ta.placeholder='Mensagem...';var sb=cv.querySelector('button.primary svg');if(sb)sb.outerHTML=ic(I.plane,24,2)}}
function emoBtn(fd,t){fd.insertAdjacentHTML('beforeend','<button type="button" class="v169-emo" aria-label="Inserir emoji" title="Emoji" aria-expanded="false" aria-controls="v169-emo-box">'+ic(I.smile,28,1.8)+'</button><div id="v169-emo-box" class="v169-emo-box" role="group" aria-label="Emojis" hidden>'+EMO.map(function(e){return '<button type="button" aria-label="Inserir '+e+'">'+e+'</button>'}).join('')+'</div>');
  var b=fd.querySelector('.v169-emo'),box=fd.querySelector('.v169-emo-box');
  b.onclick=function(){var on=box.hidden;box.hidden=!on;b.setAttribute('aria-expanded',String(on));if(on){var x=box.querySelector('button');if(x)x.focus()}};
  box.onclick=function(ev){var x=ev.target.closest('button');if(!x)return;var ta=document.getElementById('chat-text')||t;if(!ta)return;var e=x.textContent,a=ta.selectionStart==null?ta.value.length:ta.selectionStart,z=ta.selectionEnd==null?a:ta.selectionEnd;
    ta.value=ta.value.slice(0,a)+e+ta.value.slice(z);ta.dispatchEvent(new Event('input',{bubbles:true}));box.hidden=true;b.setAttribute('aria-expanded','false');try{ta.focus();ta.selectionStart=ta.selectionEnd=a+e.length}catch(er){}};
  box.onkeydown=function(ev){if(ev.key==='Escape'){ev.stopPropagation();box.hidden=true;b.setAttribute('aria-expanded','false');b.focus()}}}
document.addEventListener('click',function(ev){var bx=document.getElementById('v169-emo-box');if(bx&&!bx.hidden&&!ev.target.closest('.v169-emo,.v169-emo-box')){bx.hidden=true;var b=document.querySelector('.v169-emo');if(b)b.setAttribute('aria-expanded','false')}},true);

/* ---------- conversas privadas e grupos (v138) ---------- */
function cvHead(){var h=document.querySelector('#view .cv-head');if(!h||h.querySelector('.v169-call'))return;var g=h.querySelector('.cv-gav');if(g)g.innerHTML=SHELF;
  var html='<span class="v169-sep" aria-hidden="true"></span><button type="button" class="cv-hbtn v169-call" aria-label="Ligar" title="Ligar" onclick="e99Call()">'+ic(I.phone,26,1.8)+'</button><button type="button" class="cv-hbtn v169-call" aria-label="Chamada de vídeo" title="Vídeo" onclick="e99Call()">'+ic(I.video,28,1.8)+'</button>';
  var more=h.querySelector('.cv-hbtn');if(more)more.insertAdjacentHTML('beforebegin',html);else h.insertAdjacentHTML('beforeend',html)}

/* ---------- ciclo ---------- */
function marks(){var B=document.body;if(!B)return;var c=pg()==='chat'&&typeof authSession!=='undefined'&&!!authSession;if(B.classList.contains('v169c')!==c)B.classList.toggle('v169c',c);
  var conv=c&&!!document.querySelector('#view .chat-wrap,#view .cv-wrap[data-open]');if(B.classList.contains('v169-conv')!==conv)B.classList.toggle('v169-conv',conv)}
var busy=false,raf=0;
/* o cartão do aviso e o cabeçalho novo empurram a lista para baixo sem mudar o tamanho dela: o chat.js recalcula a altura (fit) no "resize" */
var lastTop=-1;function refit(){var b=document.getElementById('chat-list');if(!b||!b.offsetParent){lastTop=-1;return}var t=Math.round(b.getBoundingClientRect().top+(window.scrollY||0));if(t!==lastTop){var first=lastTop<0;lastTop=t;if(!first)setTimeout(function(){try{dispatchEvent(new Event('resize'))}catch(e){}},0)}}
function run(){raf=0;if(busy)return;busy=true;try{marks();topbar();if(pg()==='chat'){head();msgs();compose();cvHead();var cv=document.getElementById('cv-msgs');if(cv)files(cv)}refit()}catch(e){window.__e99V169Err=String(e&&e.stack||e)}finally{busy=false}}
function q(){if(!raf)raf=requestAnimationFrame(run)}
window.e99V169={run:run};
var r0=window.render;if(typeof r0==='function'){window.render=function(){var x=r0.apply(this,arguments);q();return x};try{render=window.render}catch(e){}}
function watch(){var v=document.getElementById('view');if(v&&window.MutationObserver)new MutationObserver(function(){if(!busy)q()}).observe(v,{childList:true,subtree:true});q()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch);else watch();
addEventListener('e99:perfil',q);addEventListener('resize',q);
/* presença muda sem redesenhar a lista: confere a cada 15 s com o chat aberto */
setInterval(function(){if(pg()==='chat'&&!document.hidden)q()},15000);
})();
