/* v158 · "Vida" no app todo (pedido do dono, intensidade forte):
   (1) cor por área (--area-*): ícone do menu, título, etiquetas de status e canto dos cartões; mesma paleta clara nos 3 temas escuros (contraste AA).
   (2) Início: saudação do dia, anéis do plano de hoje e das notas conferidas (7 dias), resumo colorido do que pede ação, iniciais coloridas da equipe.
   (3) Animações curtas só com transform/opacity: toque (escala + ondulação), números que sobem, check que pula, entrada escalonada,
       troca de tela, barras que enchem. Nada infinito; com a aba oculta tudo termina na hora; "menos movimento" = sem animação.
   (4) Telas vazias com ilustração SVG própria (inline), texto curto e botão de ação.
   Só apresentação: não muda dados. O S (logo, abertura, ícone) não é tocado. Falha = fica como antes. */
(function(){'use strict';var W=window,D=document;
var AREA={nfs:'notas',plans:'plano',team:'equipe',chat:'chat',reports:'painel',corridors:'corredores',alerts:'alertas',home:'inicio'};
var mq=W.matchMedia?W.matchMedia('(prefers-reduced-motion: reduce)'):null;
function still(){return !!(mq&&mq.matches)||D.hidden}
function e(s){return typeof esc==='function'?esc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function cur(){return typeof page==='string'?page:''}
var mine=[];function anim(el,k,o){if(still()||!el||typeof el.animate!=='function')return null;try{var a=el.animate(k,o);mine.push(a);a.onfinish=a.oncancel=function(){var i=mine.indexOf(a);if(i>=0)mine.splice(i,1)};return a}catch(x){return null}}
function finishAll(){mine.slice().forEach(function(a){try{a.finish()}catch(x){}});mine=[]}

/* ===== ilustrações (SVG próprio, cores do tema e da área) ===== */
var ART={
 notas:'<rect x="34" y="18" width="62" height="80" rx="10" fill="var(--glass-card)" stroke="var(--area)" stroke-width="3"/><path d="M46 38h38M46 50h38M46 62h24" stroke="var(--ds-muted)" stroke-width="4" stroke-linecap="round"/><circle cx="92" cy="86" r="16" fill="var(--area)"/><path d="M85 86l5 5 9-10" fill="none" stroke="var(--ds-bg)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>',
 plano:'<rect x="26" y="22" width="76" height="76" rx="14" fill="var(--glass-card)" stroke="var(--area)" stroke-width="3"/><rect x="38" y="40" width="12" height="12" rx="3" fill="var(--area)"/><path d="M58 46h32" stroke="var(--ds-ink)" stroke-width="4" stroke-linecap="round"/><rect x="38" y="62" width="12" height="12" rx="3" fill="none" stroke="var(--ds-muted)" stroke-width="3"/><path d="M58 68h24" stroke="var(--ds-muted)" stroke-width="4" stroke-linecap="round"/><path d="M40 16v12M88 16v12" stroke="var(--area)" stroke-width="5" stroke-linecap="round"/>',
 corredores:'<path d="M20 96h88" stroke="var(--ds-muted)" stroke-width="4" stroke-linecap="round"/><rect x="24" y="26" width="24" height="70" rx="5" fill="var(--glass-card)" stroke="var(--area)" stroke-width="3"/><rect x="80" y="26" width="24" height="70" rx="5" fill="var(--glass-card)" stroke="var(--area)" stroke-width="3"/><path d="M28 48h16M28 70h16M84 48h16M84 70h16" stroke="var(--area)" stroke-width="3"/><rect x="30" y="34" width="10" height="10" rx="2" fill="var(--area)"/><rect x="88" y="58" width="10" height="10" rx="2" fill="var(--area)"/><path d="M64 88V40m0 0-8 8m8-8 8 8" stroke="var(--ds-ink)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none"/>',
 equipe:'<circle cx="46" cy="48" r="14" fill="var(--area)"/><path d="M22 92c2-16 12-24 24-24s22 8 24 24" fill="var(--area)"/><circle cx="84" cy="44" r="12" fill="none" stroke="var(--ds-ink)" stroke-width="3"/><path d="M66 90c2-13 9-20 18-20s16 7 18 20" fill="none" stroke="var(--ds-ink)" stroke-width="3"/><circle cx="104" cy="26" r="10" fill="var(--glass-card)" stroke="var(--area)" stroke-width="3"/><path d="M104 21v10M99 26h10" stroke="var(--area)" stroke-width="3" stroke-linecap="round"/>',
 alertas:'<path d="M64 18c-16 0-26 12-26 28v20l-8 12h68l-8-12V46c0-16-10-28-26-28z" fill="var(--glass-card)" stroke="var(--area)" stroke-width="3" stroke-linejoin="round"/><path d="M56 88a8 8 0 0 0 16 0" fill="none" stroke="var(--area)" stroke-width="3"/><circle cx="92" cy="30" r="14" fill="var(--area)"/><path d="M86 30l4 4 8-8" fill="none" stroke="var(--ds-bg)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>',
 chat:'<path d="M18 30a10 10 0 0 1 10-10h50a10 10 0 0 1 10 10v28a10 10 0 0 1-10 10H44l-16 12V68h0a10 10 0 0 1-10-10z" fill="var(--area)"/><circle cx="38" cy="44" r="4" fill="var(--ds-bg)"/><circle cx="53" cy="44" r="4" fill="var(--ds-bg)"/><circle cx="68" cy="44" r="4" fill="var(--ds-bg)"/><path d="M60 78h40a10 10 0 0 0 10-10V50" fill="none" stroke="var(--ds-ink)" stroke-width="3" stroke-linecap="round"/><path d="M98 78v12l-10-12" fill="none" stroke="var(--ds-ink)" stroke-width="3" stroke-linejoin="round"/>',
 painel:'<path d="M22 98h84" stroke="var(--ds-muted)" stroke-width="4" stroke-linecap="round"/><rect x="30" y="62" width="14" height="30" rx="4" fill="var(--area)"/><rect x="54" y="40" width="14" height="52" rx="4" fill="var(--ds-ink)"/><rect x="78" y="52" width="14" height="40" rx="4" fill="var(--area)"/>'};
function cssv(n,d){try{var v=getComputedStyle(D.body).getPropertyValue(n).trim();return v||d}catch(x){return d}}
function art(a){var m={'--area':'currentColor','--glass-card':cssv('--glass-card','#16111A'),'--ds-muted':cssv('--ds-muted','#B8A9BD'),'--ds-ink':cssv('--ds-ink','#F5EEF7'),'--ds-bg':cssv('--ds-bg','#0B090D')};
  return '<svg class="vd-art" data-vd-area="'+a+'" viewBox="0 0 128 112" aria-hidden="true" focusable="false">'+(ART[a]||ART.plano).replace(/var\((--[a-z-]+)\)/g,function(x,k){return m[k]||x})+'</svg>'}
function emptyPanel(a,title,text,btn,act){return '<div class="panel vd-empty-panel" data-vd-area="'+a+'"><div class="empty vd-empty">'+art(a)+'<h3>'+e(title)+'</h3><p>'+e(text)+'</p>'+(btn?'<button type="button" class="primary" onclick="'+act+'">'+e(btn)+'</button>':'')+'</div></div>'}

/* ===== Início ===== */
function hello(){var h=new Date().getHours();return h<5?'Boa noite':h<12?'Bom dia':h<18?'Boa tarde':'Boa noite'}
function who(){var n='';try{if(state&&state.perfil&&state.perfil.name)n=state.perfil.name}catch(x){}
  try{if(!n&&W.e99Team&&W.e99Team.get()&&W.e99Team.get().name)n=W.e99Team.get().name}catch(x){}
  if(!n&&typeof authSession!=='undefined'&&authSession&&authSession.record)n=authSession.record.login;return String(n||'').trim().split(/\s+/)[0].slice(0,24)}
function hue(s){var h=2166136261;s=String(s||'');for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)>>>0}return (h%24)*15}
function initials(n){var p=String(n||'?').trim().split(/\s+/);return ((p[0]||'?')[0]+(p.length>1?p[p.length-1][0]:'')).toUpperCase()}
function avatar(n){return '<span class="vd-av" style="--h:'+hue(n)+'" title="'+e(n)+'" aria-hidden="true">'+e(initials(n))+'</span>'}
W.e99Avatar=avatar;
function ring(id,label,done,total,a){var p=total?Math.max(0,Math.min(1,done/total)):0,C=2*Math.PI*26;
  return '<div class="vd-ring" id="'+id+'" data-vd-area="'+a+'" role="img" aria-label="'+e(label)+': '+(total?done+' de '+total:'nada ainda')+'"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" class="vd-ring-bg"/><g class="vd-ring-arc"><circle cx="32" cy="32" r="26" class="vd-ring-fg" stroke-dasharray="'+C.toFixed(2)+'" stroke-dashoffset="'+(C*(1-p)).toFixed(2)+'" transform="rotate(-90 32 32)"/></g></svg><div><b class="vd-num" data-n="'+(total?Math.round(p*100):0)+'">'+(total?Math.round(p*100):0)+'</b><i>%</i></div><span>'+e(label)+'<small>'+(total?done+' de '+total:'nada ainda')+'</small></span></div>'}
function homeHTML(){var today=iso(),acts=[];(state.plans||[]).forEach(function(p){if(p.date===today)(p.activities||[]).forEach(function(a){acts.push(a)})});
  var done=acts.filter(function(a){return a.done}).length;var d7=new Date();d7.setDate(d7.getDate()-6);var k7=iso(d7);
  var nf=(state.nfs||[]).filter(function(n){return n.date&&n.date>=k7&&n.date<=today}),ok=nf.filter(function(n){return n.status==='Conferido'}).length;
  var team=(state.team||[]).slice(0,8),more=(state.team||[]).length-team.length,n=who();
  return '<section class="vd-home" id="vd-home" aria-label="Resumo do dia"><div class="vd-greet"><h2>'+e(hello())+(n?', '+e(n):'')+'!</h2><p>'+(acts.length?(acts.length-done?(acts.length-done===1?'Falta 1':'Faltam '+(acts.length-done))+' de '+acts.length+' atividades do plano de hoje.':'Plano de hoje concluído. Mandou bem!'):'Sem plano para hoje ainda.')+'</p>'
   +(team.length?'<div class="vd-team" aria-label="Equipe: '+e(team.map(function(p){return p.name}).join(', '))+'">'+team.map(function(p){return avatar(p.name)}).join('')+(more>0?'<span class="vd-av vd-more" aria-hidden="true">+'+more+'</span>':'')+'</div>':'')+'</div>'
   +'<div class="vd-rings">'+ring('vd-ring-plan','Plano de hoje',done,acts.length,'plano')+ring('vd-ring-nf','Notas conferidas (7 dias)',ok,nf.length,'notas')+'</div></section>'}
function areaOfGo(s){s=String(s||'');return /plans/.test(s)?'plano':/alerts/.test(s)?'alertas':/nfs/.test(s)?'notas':/corridors/.test(s)?'corredores':/team/.test(s)?'equipe':/chat/.test(s)?'chat':/reports/.test(s)?'painel':''}

/* ===== decorar depois de cada render ===== */
var lastPage='',seen={};
function navAreas(){D.querySelectorAll('aside .nav button,#mobile-bottom button,.mobile-menu button,#mobile-menu button').forEach(function(b){if(b.dataset.vdArea!=null)return;var m=/go\('([a-z-]+)'\)/.exec(b.getAttribute('onclick')||'');b.dataset.vdArea=m&&AREA[m[1]]||''})}
function decorate(){var v=D.getElementById('view');if(!v||typeof authSession==='undefined'||!authSession)return;var pg=cur(),a=AREA[pg]||'';D.body.setAttribute('data-area',a||'outra');navAreas();
  if(pg==='home'&&!D.getElementById('vd-home')){var hero=v.querySelector('.hero-home');if(hero)hero.insertAdjacentHTML('afterend',homeHTML())}
  v.querySelectorAll('.stat.e99-go').forEach(function(s){if(!s.dataset.vdArea)s.dataset.vdArea=areaOfGo(s.getAttribute('data-go'))});
  v.querySelectorAll('.empty:not(.vd-empty)').forEach(function(x){if(x.closest('.vd-empty-panel'))return;x.classList.add('vd-empty');var ar=a&&a!=='inicio'?a:x.querySelector('[onclick*=openPlan]')?'plano':x.querySelector('[onclick*=nf]')?'notas':'plano';x.insertAdjacentHTML('afterbegin',art(ar));
    if(pg==='alerts'&&!x.querySelector('button')){x.innerHTML=art('alertas')+'<h3>Tudo em dia!</h3><p>'+e(x.textContent.replace(/^Tudo em dia\.\s*/,''))+'</p><button type="button" class="primary" onclick="go(\'home\')">Voltar ao Início</button>'}});
  if(pg==='team'&&!(state.team||[]).length&&!v.querySelector('.vd-empty-panel')){var h=v.querySelector('.hero');if(h)h.insertAdjacentHTML('afterend',emptyPanel('equipe','Sua equipe começa aqui','Cadastre as pessoas do estoque para dar responsáveis a planos e corredores.','Adicionar pessoa',"openEditor('person')"))}
  if(pg==='chat'&&!(W.e99Team&&W.e99Team.get())&&!v.querySelector('.vd-empty-panel')){var hc=v.querySelector('.hero');if(hc)hc.insertAdjacentHTML('afterend',emptyPanel('chat','Converse com a equipe','Crie a equipe ou entre com o código do gestor para começar.','Começar',"(function(){var f=document.querySelector('#view form input');if(f){f.scrollIntoView({block:'center'});f.focus()}})()"))}
  v.querySelectorAll('.plan-card').forEach(function(c){if(c.querySelector('.vd-bar'))return;var all=c.querySelectorAll('.act-check').length;if(!all)return;var dn=c.querySelectorAll('.act-check[aria-pressed=true]').length;
    c.insertAdjacentHTML('beforeend','<div class="vd-bar" role="img" aria-label="'+dn+' de '+all+' atividades feitas"><i style="transform:scaleX('+(dn/all).toFixed(3)+')"></i></div>')});
  var changed=pg!==lastPage;lastPage=pg;motion(v,changed)}
function countUp(el){var n=+el.getAttribute('data-n');if(!(n>0)||still())return;var t0=0,dur=650;el.textContent='0';
  function f(t){if(!t0)t0=t;var k=Math.min(1,(t-t0)/dur);if(D.hidden)k=1;el.textContent=String(Math.round(n*(1-Math.pow(1-k,3))));if(k<1)requestAnimationFrame(f)}requestAnimationFrame(f)}
function motion(v,changed){if(still())return;
  if(changed){anim(v,[{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:260,easing:'cubic-bezier(.2,.9,.3,1.15)'});
    var kids=[].slice.call(v.querySelectorAll(':scope > *, #view .cards > *, #view .stats > .stat, #view .plan-card, #view .vd-rings > *, #view tbody > tr')).slice(0,24);
    kids.forEach(function(k,i){anim(k,[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:340,delay:40+i*45,easing:'cubic-bezier(.2,.9,.3,1.2)',fill:'backwards'})});
    v.querySelectorAll('.vd-ring-arc').forEach(function(g){anim(g,[{opacity:0,transform:'rotate(-140deg) scale(.6)'},{opacity:1,transform:'none'}],{duration:700,delay:120,easing:'cubic-bezier(.2,.9,.3,1.1)',fill:'backwards'})});
    v.querySelectorAll('.vd-bar i').forEach(function(b){var s=b.style.transform;anim(b,[{transform:'scaleX(0)'},{transform:s}],{duration:700,delay:200,easing:'cubic-bezier(.2,.9,.3,1)',fill:'backwards'})});
    v.querySelectorAll('.vd-art').forEach(function(s){anim(s,[{opacity:0,transform:'translateY(10px) scale(.8) rotate(-6deg)'},{opacity:1,transform:'none'}],{duration:520,easing:'cubic-bezier(.2,.9,.3,1.3)',fill:'backwards'})})}
  v.querySelectorAll('.vd-num,#view .stat strong').forEach(function(el){if(!el.hasAttribute('data-n')){var t=el.textContent.trim();if(!/^\d{1,5}$/.test(t))return;el.setAttribute('data-n',t)}var key=(el.id||el.closest('[id],[data-go]')&&(el.closest('[id],[data-go]').id||el.closest('[id],[data-go]').getAttribute('data-go'))||'')+'|'+el.getAttribute('data-n');
    if(changed||seen[key]===undefined){seen[key]=1;countUp(el)}})}
/* check que pula ao concluir */
var lastTog=null;var ptd=W.planToggleDone;if(typeof ptd==='function')W.planToggleDone=function(p,a){lastTog=[p,a];var r=ptd.apply(this,arguments);setTimeout(pop,30);return r};
function pop(){if(!lastTog)return;var sel='.act-check[onclick*="'+String(lastTog[1]).replace(/"/g,'')+'"]',b=D.querySelector(sel);lastTog=null;if(!b||b.getAttribute('aria-pressed')!=='true')return;
  anim(b,[{transform:'scale(1)'},{transform:'scale(1.35) rotate(-8deg)'},{transform:'scale(.92)'},{transform:'scale(1)'}],{duration:420,easing:'ease-out'})}
/* toque: ondulação (transform/opacity) */
D.addEventListener('pointerdown',function(ev){if(still())return;var t=ev.target&&ev.target.closest&&ev.target.closest('button.primary,.stat.e99-go,.vd-ring');if(!t)return;var r=t.getBoundingClientRect(),s=Math.max(r.width,r.height)*2,i=D.createElement('i');i.className='vd-ripple';i.setAttribute('aria-hidden','true');
  i.style.cssText='width:'+s+'px;height:'+s+'px;left:'+(ev.clientX-r.left-s/2)+'px;top:'+(ev.clientY-r.top-s/2)+'px';t.appendChild(i);var a=anim(i,[{transform:'scale(0)',opacity:.35},{transform:'scale(1)',opacity:0}],{duration:520,easing:'ease-out'});if(a)a.addEventListener('finish',function(){i.remove()});else i.remove()},{passive:true});
D.addEventListener('visibilitychange',function(){if(D.hidden)finishAll();D.body.classList.toggle('vd-paused',D.hidden)});
if(mq&&mq.addEventListener)mq.addEventListener('change',function(){if(mq.matches)finishAll()});
var r0=render;render=function(){var r=r0.apply(this,arguments);try{decorate()}catch(x){try{console.warn('vida',x)}catch(y){}}return r};
W.e99Vida={decorate:decorate,still:still,running:function(){return mine.length},list:function(){return mine.slice()}};
try{if(typeof authSession!=='undefined'&&authSession)decorate()}catch(x){}
})();
