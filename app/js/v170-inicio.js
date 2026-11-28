/* v170 · Início no padrão da nova arte (pedido do dono: "Tudo igual à imagem").
   Só apresentação da primeira tela do Início: topo com ☰ + logo StoK + busca + sino, "Visão geral", pílula StoK,
   "Tudo no / seu lugar." com foto do galpão e S vermelho, botão "+ Novo plano" largo, cartão da saudação com ilustração,
   anéis com ícone e dois cartões de contagem (planos de hoje e atividades que passaram do horário).
   O body ganha a classe ini170 só no Início (CSS em app/css/v170-inicio.css com tokens --ini-*). Os blocos de baixo
   (Plano de ação de hoje, Demandas, Equipe, Mapa) e os encaixes (.hero-home, .stats, #vd-home, #loja-note, #local-note) ficam.
   Não muda dados. Falha = fica como antes. */
(function(){'use strict';var W=window,D=document;
function e(s){return typeof esc==='function'?esc(s):String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function svg(p){return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
var IC={
 menu:svg('<path d="M4 6.5h16M4 12h16M4 17.5h16"/>'),
 plano:svg('<rect x="4" y="5" width="16" height="16" rx="2.5"/><path d="M8 3v4M16 3v4M4 10h16M9 15.5l2.2 2.2 4-4.4"/>'),
 notas:svg('<path d="M9 4h6v3H9z"/><path d="M15 5.5h2.5A1.5 1.5 0 0 1 19 7v12.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5V7a1.5 1.5 0 0 1 1.5-1.5H9"/><path d="M8.5 11h1M12 11h3.5M8.5 14.5h1M12 14.5h3.5M8.5 18h1M12 18h3.5"/>'),
 caixa:svg('<path d="M12 2.8 20.5 7v10L12 21.2 3.5 17V7z"/><path d="M3.5 7 12 11.3 20.5 7M12 11.3v9.9M7.8 4.9l8.4 4.3"/><path d="M6.5 13.2l2.5 1.2"/>'),
 relogio:svg('<circle cx="12" cy="12" r="8.8"/><path d="M12 7v5.2h3.8"/>')};
/* imagens com o mesmo ?v= do pré-cache do sw.js (APP_FILES) */
function img(f){var v=W.SITE_VERSION||((D.querySelector('meta[name="estoque99-version"]')||{}).content)||'';try{return new URL('app/img/'+f+(v?'?v='+v:''),location.href).href}catch(x){return 'app/img/'+f}}
var IMG={logo:img('stok-logo.png'),s:img('inicio-s.png'),casa:img('inicio-galpao-icone.png'),foto:img('inicio-galpao.jpg')};
function aux(){try{return !!(W.isAux&&isAux())}catch(x){return false}}
function today(){try{return iso()}catch(x){return new Date().toISOString().slice(0,10)}}
function plansToday(){var t=today();return (state.plans||[]).filter(function(p){return p&&p.date===t}).length}
function lateCount(){try{return collectAlerts().filter(function(x){return x.kind==='act'}).length}catch(x){return 0}}
/* topo do Início (celular): ☰ à esquerda e o logo no centro; busca e sino já existem (v132/v164) */
function top(){var h=D.querySelector('main > header');if(!h)return;var left=h.firstElementChild;if(!left)return;
  /* v169 já põe o ☰ no topo do celular (#v169-menu): usa esse e não cria outro */
  if(!D.getElementById('ini-menu')&&!D.getElementById('v169-menu')){var b=D.createElement('button');b.type='button';b.id='ini-menu';b.className='ini-menu';b.setAttribute('aria-label','Mais opções');b.innerHTML=IC.menu;
    b.addEventListener('click',function(){try{go('mobile-menu')}catch(x){}});left.insertBefore(b,left.firstChild)}
  if(!D.getElementById('ini-logo')){var l=D.createElement('img');l.id='ini-logo';l.className='ini-logo';l.src=IMG.logo;l.alt='StoK';l.width=305;l.height=93;l.decoding='async';
    l.addEventListener('error',function(){l.remove()});h.appendChild(l)}}
function hero(v){var h=v.querySelector('.hero-home');if(!h||h.dataset.ini)return;h.dataset.ini='1';h.style.setProperty('--ini-foto','url("'+IMG.foto+'")');var box=h.firstElementChild;if(!box)return;
  box.classList.add('ini-txt');
  if(!box.querySelector('.ini-kicker')){var k=D.createElement('p');k.className='ini-kicker';k.textContent='Visão geral';box.insertBefore(k,box.firstChild)}
  var h1=box.querySelector('h1');if(h1&&/^\s*Tudo no seu lugar\.\s*$/.test(h1.textContent)){h1.innerHTML='Tudo no <span class="accent-word ini-accent" data-t="seu lugar.">seu lugar.</span>'}
  if(!h.querySelector('.ini-s')){var s=D.createElement('img');s.className='ini-s';s.src=IMG.s;s.alt='';s.setAttribute('aria-hidden','true');s.width=154;s.height=147;s.decoding='async';s.addEventListener('error',function(){s.remove()});h.appendChild(s)}}
/* cartão da saudação: iniciais em anéis vermelhos (até 4 + "+N") e ilustração do galpão */
function greet(v){var g=v.querySelector('#vd-home .vd-greet');if(!g||g.dataset.ini)return;g.dataset.ini='1';
  var avs=[].slice.call(g.querySelectorAll('.vd-av:not(.vd-more)'));var team=(state.team||[]).length;
  avs.forEach(function(a,i){a.classList.add('ini-av','ini-av'+(i%4));if(i>=4)a.remove()});
  var more=g.querySelector('.vd-more');if(team>4){if(!more){more=D.createElement('span');more.className='vd-av vd-more';more.setAttribute('aria-hidden','true');var t=g.querySelector('.vd-team');if(t)t.appendChild(more)}if(more){more.textContent='+'+(team-4);more.classList.add('ini-av','ini-avm')}}else if(more)more.remove();
  if(!g.querySelector('.ini-casa')){var c=D.createElement('img');c.className='ini-casa';c.src=IMG.casa;c.alt='';c.setAttribute('aria-hidden','true');c.width=245;c.height=185;c.decoding='async';c.addEventListener('error',function(){c.remove()});g.appendChild(c)}}
/* anéis: ícone de prancheta ao lado do rótulo e um trecho vermelho no começo (como na arte) */
function rings(v){[['#vd-ring-plan','plano'],['#vd-ring-nf','notas']].forEach(function(x){var r=v.querySelector(x[0]);if(!r||r.dataset.ini)return;r.dataset.ini='1';
  var sv=r.querySelector('svg');if(sv&&!sv.querySelector('.ini-cap')){var C=2*Math.PI*26,c=D.createElementNS('http://www.w3.org/2000/svg','circle');c.setAttribute('cx','32');c.setAttribute('cy','32');c.setAttribute('r','26');c.setAttribute('class','ini-cap');c.setAttribute('stroke-dasharray',(C*0.11).toFixed(2)+' '+C.toFixed(2));c.setAttribute('transform','rotate(-90 32 32)');sv.appendChild(c)}
  var sp=r.querySelector(':scope > span');if(sp&&!r.querySelector('.ini-ic')){var i=D.createElement('i');i.className='ini-ic';i.setAttribute('aria-hidden','true');i.innerHTML=IC[x[1]];sp.parentNode.insertBefore(i,sp)}})}
function countsHTML(){var n=plansToday(),l=lateCount(),a=aux();
  return '<div class="ini-counts" id="ini-counts" aria-label="Hoje">'
   +'<button type="button" class="ini-count" data-ini-go="plans" aria-label="'+e(n+' '+(n?(n===1?'plano para hoje':'planos para hoje'):'— nenhum plano para hoje'))+'"><i class="ini-ic" aria-hidden="true">'+IC.caixa+'</i><b>'+n+'</b><span>'+(n?(n===1?'plano para hoje':'planos para hoje'):'Nenhum plano para hoje')+'</span></button>'
   +'<button type="button" class="ini-count" data-ini-go="'+(a?'plans':'alerts')+'" aria-label="'+e(l+' '+(l===1?'atividade passou do horário':'atividades passaram do horário'))+'"><i class="ini-ic" aria-hidden="true">'+IC.relogio+'</i><b>'+l+'</b><span>passaram do horário</span></button></div>'}
function counts(v){var c=v.querySelector('#ini-counts');if(c)return;var anchor=v.querySelector('#vd-home')||v.querySelector('.hero-home');if(anchor)anchor.insertAdjacentHTML('afterend',countsHTML())}
/* avisos da nuvem/aparelho ficam logo abaixo da primeira tela */
function notes(v){var c=v.querySelector('#ini-counts');if(!c)return;var at=c;['#loja-note','#local-note'].forEach(function(s){var n=v.querySelector(s);if(n){if(at.nextElementSibling!==n)at.after(n);at=n}})}
function decorate(){var home=typeof page==='string'&&page==='home'&&typeof authSession!=='undefined'&&!!authSession;D.body.classList.toggle('ini170',home);if(!home)return;
  var v=D.getElementById('view');if(!v)return;top();hero(v);greet(v);rings(v);counts(v);notes(v)}
D.addEventListener('click',function(ev){var b=ev.target&&ev.target.closest&&ev.target.closest('#view .ini-count[data-ini-go]');if(!b)return;var g=b.getAttribute('data-ini-go');
  try{if(g==='plans'){if(typeof planFilter!=='undefined')planFilter=iso();go('plans')}else go(g)}catch(x){}});
var r0=render;render=function(){var r=r0.apply(this,arguments);try{decorate()}catch(x){try{console.warn('v170',x)}catch(y){}}return r};
W.e99Inicio170={decorate:decorate,plansToday:plansToday,lateCount:lateCount};
try{decorate()}catch(x){}
})();
