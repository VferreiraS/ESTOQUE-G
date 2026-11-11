
(function(){
'use strict';
/* v86 · ícones SVG de uma família só (traço 1,75), títulos curtos, "Mais ações", topo de 56 px com sino,
   Preferências em Minha conta, Administração sempre no menu do gestor e cartões 3D no Início. Nenhuma função saiu. */
var P={
 home:'<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20h14V9.5"/><path d="M10 20v-6h4v6"/>',
 plans:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.8h6V4"/><path d="m9 13 2 2 4-4"/>',
 reports:'<path d="M3 21h18"/><path d="M6 17v-5"/><path d="M11 17V6"/><path d="M16 17v-3"/><path d="M20 17V9"/>',
 team:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8"/><path d="M18.5 14.6A6.5 6.5 0 0 1 21.5 20"/>',
 corridors:'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M12 3v18"/>',
 nfs:'<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/><path d="M9 12h7M9 16h7"/>',
 data:'<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/><path d="M4 11.5v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
 agenda:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
 bell:'<path d="M6 16v-5a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
 chat:'<path d="M4 5h16v11H9l-5 4z"/>',
 profile:'<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
 spark:'<path d="M11 3l1.8 4.7 4.7 1.8-4.7 1.8L11 16l-1.8-4.7-4.7-1.8 4.7-1.8z"/><path d="M18.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z"/>',
 account:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.5"/><path d="M5.5 17a3.5 3.5 0 0 1 7 0"/><path d="M15 9.5h3M15 13.5h3"/>',
 admin:'<path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
 more:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 dots:'<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 scan:'<path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3"/><path d="M8 8v8M11 8v8M13.5 8v8M16 8v8"/>',
 upload:'<path d="M12 15V4"/><path d="m7 9 5-5 5 5"/><path d="M4 15v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>',
 share:'<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/>',
 arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
 out:'<path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
 sound:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/>',
 mute:'<path d="M4 9v6h4l5 4V5L8 9z"/><path d="m17 9.5 5 5M22 9.5l-5 5"/>',
 leaf:'<path d="M5 20c0-8.5 6-15 15-15 0 9-6.5 15-15 15z"/><path d="M5 20l8-8"/>',
 top:'<path d="M12 19V5M6 11l6-6 6 6"/>',
 camera:'<rect x="3" y="6" width="18" height="14" rx="2"/><path d="M8 6l1.5-2h5L16 6"/><circle cx="12" cy="13" r="3.5"/>',
 print:'<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
 refresh:'<path d="M20 11a8 8 0 1 0-2.3 5.7"/><path d="M20 4v7h-7"/>',
 check:'<path d="m5 12 5 5 9-10"/>',
 lock:'<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
 cloud:'<path d="M7 18a4 4 0 0 1-.6-8A6 6 0 0 1 17.8 9 4.5 4.5 0 0 1 17.5 18z"/>',
 phone:'<rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18h2"/>',
 desktop:'<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
 palette:'<path d="M12 3a9 9 0 1 0 0 18c1.4 0 2-1 1.6-2.2-.4-1.2.4-2.3 1.7-2.3H18a3 3 0 0 0 3-3A9 9 0 0 0 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7.5" r="1"/><circle cx="14.5" cy="7.5" r="1"/>',
 gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 download:'<path d="M12 4v11"/><path d="m7 10 5 5 5-5"/><path d="M4 20h16"/>',
 key:'<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l2 2M15 8l2 2"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'
};
function svg(n,cls){var p=P[n];if(!p)return '';return '<svg class="ic'+(cls?' '+cls:'')+'" viewBox="0 0 24 24" aria-hidden="true" focusable="false">'+p+'</svg>'}
window.e99Icon=svg;
var PAGE_ICON={home:'home',plans:'plans',reports:'reports',team:'team',corridors:'corridors',nfs:'nfs',data:'data',agenda:'agenda',alerts:'bell',chat:'chat',profile:'profile',account:'account',admin:'admin','mobile-menu':'more'};
var GLYPH={'＋':'plus','+':'plus','▥':'scan','⇪':'upload','↻':'refresh','🔄':'refresh','⇅':'data','✨':'spark','☁️':'cloud','☁':'cloud','📲':'phone','🔔':'bell','⏱':'bell','🖥️':'desktop','🖥':'desktop','💻':'desktop','🔐':'lock','🔒':'lock','🔑':'key','🎨':'palette','💬':'chat','⚙':'gear','⚙️':'gear','▤':'nfs','▣':'plans','✉':'mail','✉️':'mail','📧':'mail','☰':'more','⌂':'home','◫':'home','♙':'profile','▦':'corridors','📷':'camera','📸':'camera','🖨':'print','🖨️':'print','📥':'download','⬇':'download','⬇️':'download','📤':'share','↗':'out','✎':'edit','✏️':'edit','🗑':'trash','🗑️':'trash','📊':'reports','📅':'agenda','🗓':'agenda','🗓️':'agenda','🧾':'nfs','📄':'nfs','👥':'team','👤':'profile','🛡':'admin','🛡️':'admin','🤖':'spark'};
var GLYPH_RE=/^\s*(＋|\+|▥|⇪|↻|🔄|⇅|✨|☁️|☁|📲|🔔|⏱|🖥️|🖥|💻|🔐|🔒|🔑|🎨|💬|⚙️|⚙|▤|▣|✉️|✉|📧|☰|⌂|◫|♙|▦|📷|📸|🖨️|🖨|📥|⬇️|⬇|📤|↗|✎|✏️|🗑️|🗑|📊|📅|🗓️|🗓|🧾|📄|👥|👤|🛡️|🛡|🤖)️?\s*/;
function firstText(el){for(var n=el.firstChild;n;n=n.nextSibling){if(n.nodeType===3){if(n.nodeValue.trim())return n;continue}if(n.nodeType===1&&!/^(SVG|svg|IMG|INPUT)$/.test(n.nodeName)&&n.childNodes.length===1&&n.firstChild.nodeType===3&&n.getAttribute('aria-hidden')==='true')return n.firstChild;return null}return null}
function lastText(el){for(var n=el.lastChild;n;n=n.previousSibling){if(n.nodeType===3){if(n.nodeValue.trim())return n;continue}return null}return null}
function iconize(el){if(!el||el.__ic)return;el.__ic=1;var has=el.querySelector&&el.querySelector('svg.ic');
  var t=has?null:firstText(el);if(t){var m=t.nodeValue.match(GLYPH_RE);if(m){var name=GLYPH[m[1]]||GLYPH[m[1].replace(/️/g,'')];var rest=t.nodeValue.slice(m[0].length);
      var only=!rest.trim()&&t.parentNode===el&&!lastTextOther(el,t);
      if(t.parentNode!==el&&t.parentNode.getAttribute&&t.parentNode.getAttribute('aria-hidden')==='true'){t.parentNode.innerHTML=svg(name)}
      else{t.nodeValue=rest;t.parentNode.insertBefore(range(svg(name)),t)}
      if(only&&!el.getAttribute('aria-label')&&el.title)el.setAttribute('aria-label',el.title)}}
  var l=lastText(el);if(l&&/\s(→|↗)\s*$/.test(l.nodeValue)){var out=/↗\s*$/.test(l.nodeValue);l.nodeValue=l.nodeValue.replace(/\s(→|↗)\s*$/,'');el.appendChild(range(svg(out?'out':'arrow','ic-end')))}}
function lastTextOther(el,t){for(var n=el.firstChild;n;n=n.nextSibling){if(n!==t&&n.nodeType===3&&n.nodeValue.trim())return true;if(n.nodeType===1&&n.textContent.trim()&&n!==t.parentNode)return true}return false}
function range(html){var tp=document.createElement('template');tp.innerHTML=html;return tp.content}
function pageOf(btn){var o=btn.getAttribute('onclick')||'';var m=o.match(/go\('([\w-]+)'\)/);return m?m[1]:''}
function menuIcons(v){v.querySelectorAll('.mobile-options button').forEach(function(b){if(b.__mi)return;b.__mi=1;var nm=PAGE_ICON[pageOf(b)];if(nm&&!b.querySelector('svg.ic:not(.ic-end)'))b.insertBefore(range(svg(nm)),b.firstChild);else if(!nm)iconize(b)})}
function navIcons(root){if(!root)return;root.querySelectorAll('button').forEach(function(b){if(b.__ic)return;var pg=pageOf(b),nm=PAGE_ICON[pg];var sp=b.querySelector('span[aria-hidden]');if(nm&&sp){sp.innerHTML=svg(nm);b.__ic=1}else iconize(b)})}
/* rótulos em CAIXA ALTA → letra normal (siglas ficam) */
var KEEP={NF:1,NFS:1,'NF-E':1,XML:1,PC:1,ADM:1,CEP:1,CNPJ:1,CPF:1,IA:1,G:1,TI:1,LGPD:1,QR:1,OK:1,PDF:1,CSV:1,S:1};
function sentence(s){var seg=s.split(/(\s·\s)/);return seg.map(function(x){if(/^\s·\s$/.test(x))return x;var w=x.toLowerCase().split(/(\s+)/).map(function(y){return KEEP[y.toUpperCase()]&&y.trim()?y.toUpperCase():y}).join('');return w.charAt(0).toUpperCase()+w.slice(1)}).join('')}
function calm(root){if(!root)return;root.querySelectorAll('.eyebrow,.auth-card .brand small').forEach(function(el){if(el.__cs)return;el.__cs=1;for(var n=el.firstChild;n;n=n.nextSibling){if(n.nodeType===3&&/[A-ZÀ-Ý]{2}/.test(n.nodeValue)&&n.nodeValue===n.nodeValue.toUpperCase())n.nodeValue=sentence(n.nodeValue)}})}
/* títulos curtos com o nome da tela; o slogan vira subtítulo */
var TITLE={plans:'Plano de ação',nfs:'Notas fiscais',corridors:'Corredores',team:'Equipe',reports:'Painel',alerts:'Alertas',data:'Dados e ajuda',agenda:'Agenda',account:'Minha conta',admin:'Administração','mobile-menu':'Mais opções'};
var MORE_PAGES={nfs:1,corridors:1,plans:1,team:1};
function shortHero(v){var pg=typeof page!=='undefined'?page:'';var h=v.querySelector('.hero:not(.hero-home)');if(!h||h.__v86)return;h.__v86=1;var h1=h.querySelector('h1');var t=TITLE[pg];
  if(h1&&t){var old=h1.textContent.replace(/\s+/g,' ').trim();if(old&&old.toLowerCase()!==t.toLowerCase()){var box=h1.parentNode;if(!box.querySelector('.subtitle')){var p=document.createElement('p');p.className='subtitle';p.textContent=old.charAt(0)+old.slice(1).toLowerCase();h1.after(p)}}
    var ws=t.split(' ');h1.innerHTML=ws.length>1?esc(ws.slice(0,-1).join(' '))+' <span class="accent-word" data-t="'+esc(ws[ws.length-1])+'">'+esc(ws[ws.length-1])+'</span>':esc(t)}
  if(!MORE_PAGES[pg])return;
  var btns=[].slice.call(h.querySelectorAll('button')).filter(function(b){return !b.closest('.more-actions')});if(btns.length<2)return;
  var main=btns.filter(function(b){return b.classList.contains('primary')})[0]||btns[0];
  var wrap=document.createElement('div');wrap.className='hero-actions';
  var d=document.createElement('details');d.className='more-actions';d.innerHTML='<summary>'+svg('dots')+'Mais ações</summary><div class="more-menu" role="group" aria-label="Mais ações"></div>';var menu=d.querySelector('.more-menu');
  var host=main.parentNode;host.insertBefore(wrap,main);wrap.appendChild(main);
  btns.forEach(function(b){if(b===main)return;menu.appendChild(b)});wrap.appendChild(d);
  [].slice.call(h.querySelectorAll('.toolbar')).forEach(function(tb){if(!tb.children.length)tb.remove()})}
document.addEventListener('click',function(e){document.querySelectorAll('.more-actions[open]').forEach(function(d){if(!d.contains(e.target)||(e.target.closest&&e.target.closest('.more-menu button')))d.open=false})});
document.addEventListener('keydown',function(e){if(e.key==='Escape')document.querySelectorAll('.more-actions[open]').forEach(function(d){d.open=false;var s=d.querySelector('summary');if(s)s.focus()})});
/* topo: título da tela + sino com contador */
function bell(){var b=document.querySelector('header button[onclick="go(\'alerts\')"]');var c=document.getElementById('alert-total');if(!b||!c)return;
  if(!b.classList.contains('bell-btn')){b.classList.add('bell-btn');b.textContent='';b.insertAdjacentHTML('afterbegin',svg('bell'));b.appendChild(c);
    if(window.MutationObserver)new MutationObserver(bellLabel).observe(c,{childList:true,characterData:true,subtree:true})}bellLabel()}
function bellLabel(){var b=document.querySelector('header .bell-btn'),c=document.getElementById('alert-total');if(!b||!c)return;var n=+String(c.textContent).replace(/\D/g,'')||0;var l='Alertas: '+n;if(b.getAttribute('aria-label')!==l)b.setAttribute('aria-label',l);if(n)c.removeAttribute('data-zero');else if(!c.hasAttribute('data-zero'))c.setAttribute('data-zero','')}
function crumb(){var bc=document.getElementById('breadcrumb');if(!bc||!authSession)return;var pg=typeof page!=='undefined'?page:'';var lab=pg==='mobile-menu'?'Mais opções':(labels[pg]||TITLE[pg]||'');var store=authSession.payload&&authSession.payload.store||'';
  var html='<span class="bc-store">'+esc(store)+' / </span><span class="bc-page">'+esc(lab)+'</span>';if(bc.__h!==html||!bc.querySelector('.bc-page')){bc.innerHTML=html;bc.__h=html}}
if(typeof renderStorage==='function'){var rs=renderStorage;renderStorage=function(){var r=rs.apply(this,arguments);try{var s=document.getElementById('storage');if(s){var ok=/Conta salva|Arquivo local conectado/.test(s.textContent);s.setAttribute('data-ok',ok?'1':'0')}}catch(x){}return r}}
/* Administração: o gestor sempre vê o item no menu (antes do menu ser montado) */
function adminNav(){try{if(!authSession||!authSession.payload)return;if(authSession.payload.role==='gestor'){if(!labels.admin){labels.admin='Administração';icons.admin='⚙'}if(typeof FULL==='object'&&FULL&&FULL.labels&&!FULL.labels.admin){FULL.labels.admin='Administração';if(FULL.icons)FULL.icons.admin='⚙'}}else if(labels.admin){delete labels.admin;delete icons.admin}}catch(x){}}
window.e99ApplyAdminNav=function(){adminNav();render()};
/* Preferências em Minha conta: Efeitos, Som e Tema do mês (os controles flutuantes saíram de cima do conteúdo) */
function prefs(v){if(!v||document.getElementById('prefs-panel'))return;var h=v.querySelector('.hero');var snd=typeof siteSoundEnabled!=='undefined'?siteSoundEnabled:true;
  var st=document.getElementById('storage'),stT=st?st.textContent.replace(/^[●⚠]\s*/,''):'';var okS=st&&st.getAttribute('data-ok')==='1';var sz=document.getElementById('season-toggle'),szT=sz?sz.textContent.replace(/^(Sazonal|Tema do mês):\s*/,''):'';var szOn=sz?sz.getAttribute('aria-pressed')==='true':false;
  var d=document.createElement('div');d.className='panel help';d.id='prefs-panel';
  d.innerHTML='<h2>'+svg('gear')+'Preferências</h2>'+(stT?'<p class="small" style="margin:0 0 6px"><span class="status-dot'+(okS?'':' warn')+'" aria-hidden="true"></span>'+esc(stT)+'</p>':'')
   +'<div class="pref-row"><span><b>Som dos toques</b><span class="small">Toques curtos ao usar o app.</span></span><button type="button" id="pref-sound" aria-pressed="'+snd+'" onclick="toggleSiteSound();e99PrefsRefresh()">'+svg(snd?'sound':'mute')+(snd?'Ligado':'Desligado')+'</button></div>'
   +'<div class="pref-row"><span><b>Tema do mês</b><span class="small">Cores e logo da estação.</span></span><button type="button" id="pref-season" aria-pressed="'+szOn+'" onclick="toggleSeason();e99PrefsRefresh()">'+svg('leaf')+esc(szT?szT.charAt(0).toUpperCase()+szT.slice(1):'Sazonal')+'</button></div>';
  if(h&&h.nextSibling)h.parentNode.insertBefore(d,h.nextSibling);else v.insertBefore(d,v.firstChild)}
window.e99PrefsRefresh=function(){setTimeout(function(){var o=document.getElementById('prefs-panel');if(!o)return;var v=o.parentNode,nx=o.nextSibling;o.remove();prefs(v);var n=document.getElementById('prefs-panel');if(n&&nx&&n.nextSibling!==nx)v.insertBefore(n,nx)},30)};
/* PC: Efeitos, Sazonal e Som no rodapé da barra lateral */
var WIDE=window.matchMedia?matchMedia('(min-width:901px)'):null;if(WIDE&&WIDE.addEventListener)WIDE.addEventListener('change',function(){placeTools()});
function placeTools(){var t=document.querySelector('.visual-tools'),a=document.querySelector('aside');if(!t||!a)return;if(WIDE?WIDE.matches:innerWidth>900){if(t.parentNode!==a)a.appendChild(t)}else if(t.parentNode===a)document.body.appendChild(t);
  t.querySelectorAll('button').forEach(function(b){if(b.id==='back-top'&&!b.__ic){b.__ic=1;b.innerHTML=svg('top');b.setAttribute('aria-label','Voltar ao topo')}})}
addEventListener('resize',function(){placeTools()},{passive:true});
/* cartões 3D do Início: inclinam até 8° seguindo o dedo ou o mouse, reflexo de luz e volta ao soltar */
function tilt(v){var box=v.querySelector('.stats');if(!box||box.__tilt||(typeof page!=='undefined'&&page!=='home'))return;box.__tilt=1;box.classList.add('tilt-on');
  box.querySelectorAll('.stat').forEach(function(s){if(!s.querySelector('.tilt-glare')){var g=document.createElement('i');g.className='tilt-glare';g.setAttribute('aria-hidden','true');s.insertBefore(g,s.firstChild)}});
  var cur=null,rect=null,pressed=false,raf=0,px=.5,py=.5;
  function allowed(){return !document.body.classList.contains('fx-user-off')&&!window.__osReduce&&!document.hidden}
  function reset(){if(raf){cancelAnimationFrame(raf);raf=0}if(cur){cur.classList.remove('tilting');cur.style.removeProperty('--rx');cur.style.removeProperty('--ry')}cur=null;rect=null}
  function frame(){raf=0;if(!cur||!rect)return;var rx=(.5-py)*16,ry=(px-.5)*16;cur.style.setProperty('--rx',rx.toFixed(2)+'deg');cur.style.setProperty('--ry',ry.toFixed(2)+'deg');var g=cur.querySelector('.tilt-glare');if(g)g.style.transform='translate('+(px*rect.width).toFixed(1)+'px,'+(py*rect.height).toFixed(1)+'px)';if(!cur.classList.contains('tilting'))cur.classList.add('tilting')}
  function at(c,x,y){if(c!==cur){reset();cur=c;rect=c.getBoundingClientRect()}px=Math.min(1,Math.max(0,(x-rect.left)/rect.width));py=Math.min(1,Math.max(0,(y-rect.top)/rect.height));if(!raf)raf=requestAnimationFrame(frame)}
  /* mouse/caneta: pointer events */
  function track(e){if(e.pointerType==='touch')return;if(!allowed()){reset();return}var c=e.target.closest&&e.target.closest('.stat');if(!c||!box.contains(c)){reset();return}if(e.pointerType!=='mouse'&&!pressed)return;at(c,e.clientX,e.clientY)}
  box.addEventListener('pointerdown',function(e){pressed=true;track(e)},{passive:true});
  box.addEventListener('pointermove',track,{passive:true});
  ['pointerup','pointerleave'].forEach(function(n){box.addEventListener(n,function(e){if(e.pointerType==='touch')return;pressed=false;reset()},{passive:true})});
  /* v90 celular: eventos de toque continuam durante a rolagem vertical (pointer events são cancelados), e o cartão fica inclinado um instante após soltar */
  var tEnd=0;function touch(e){if(!allowed())return;var t=e.touches&&e.touches[0];if(!t)return;var c=e.target.closest&&e.target.closest('.stat');if(!c||!box.contains(c))return;clearTimeout(tEnd);at(c,t.clientX,t.clientY)}
  box.addEventListener('touchstart',touch,{passive:true});box.addEventListener('touchmove',touch,{passive:true});
  ['touchend','touchcancel'].forEach(function(n){box.addEventListener(n,function(){clearTimeout(tEnd);tEnd=setTimeout(reset,450)},{passive:true})});
  box.__tiltReset=reset;TILT_BOX=box}
/* v90: um só ouvinte de visibilidade para os cartões (antes somava um a cada vez que o Início era desenhado) */
var TILT_BOX=null;document.addEventListener('visibilitychange',function(){if(document.hidden&&TILT_BOX&&TILT_BOX.__tiltReset)TILT_BOX.__tiltReset()});
/* pré-carrega o leitor ao passar o mouse ou focar em "Bipar NF" e a busca aproximada ao focar num campo de busca */
function pre(e){var t=e.target;if(!t||!t.closest||!window.e99Prefetch)return;var b=t.closest('button,[onclick]');if(b){var o=b.getAttribute('onclick')||'';if(/openNFScanner|startOfflineCamera/.test(o))window.e99Prefetch('zxing')}
  if(t.matches&&t.matches('input[type=search],.toolbar input,#nf-q,input[name=q]'))window.e99Prefetch('fuse')}
document.addEventListener('pointerover',pre,{passive:true});document.addEventListener('focusin',pre);
/* tudo depois de cada render (este é o último embrulho: roda depois dos outros) */
var r0=render;render=function(){adminNav();var r=r0.apply(this,arguments);try{if(authSession){var v=document.getElementById('view');crumb();bell();navIcons(document.getElementById('nav'));navIcons(document.getElementById('mobile-bottom'));placeTools();
    if(v){shortHero(v);calm(v);var pg=typeof page!=='undefined'?page:'';if(pg==='account')prefs(v);if(pg==='mobile-menu')menuIcons(v);if(pg==='home')tilt(v);
      v.querySelectorAll('button,h2,h3').forEach(function(el){if(!el.closest('#chat-list'))iconize(el)})}}}catch(x){}return r};
var ra=renderAuth;renderAuth=function(){var r=ra.apply(this,arguments);try{calm(document.getElementById('auth-screen'))}catch(x){}return r};
if(typeof checkAlerts==='function'){var ca=checkAlerts;checkAlerts=function(){if(document.hidden&&!arguments[0])return;var r=ca.apply(this,arguments);try{bellLabel()}catch(x){}return r}}
try{if(authSession)render();else if(document.getElementById('auth-screen')&&!document.getElementById('auth-screen').hidden)calm(document.getElementById('auth-screen'))}catch(x){}
})();
