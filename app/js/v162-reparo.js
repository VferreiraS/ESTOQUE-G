/* v162 · Auto-reparo ao vivo (pedido do dono: "conserta as quebras de texto e a falha nas animações ao vivo").
   Determinístico, sem IA, sem serviço externo, sem chave. Vigia a tela (MutationObserver só de childList/characterData,
   ResizeObserver da página, eventos de animação) e, em lotes no tempo ocioso (requestIdleCallback, no máximo a cada ~500 ms,
   orçamento de ~1,5 ms por ciclo, parado com a aba oculta), corrige sozinho só com classes reversíveis (data-e99-fix):
   - texto que estoura o contêiner / palavra, código, e-mail ou CNPJ longo sem quebrar → quebra (overflow-wrap:anywhere, min-width:0, max-width:100%);
   - texto cortado sem reticências, pílula estreita com texto quebrado ou estourando → reticências + title com o texto completo;
   - rolagem lateral da página → acha o filho largo culpado e limita a 100% da largura;
   - elemento preso apagado (animação de entrada parada/pausada há > 2,5 s) → estado final (animation:none, opacity:1);
   - animação WAAPI em elemento que saiu da tela → cancela; body.e99-norise perdido → volta; animações em loop pausam com a aba oculta.
   Nunca mexe na abertura, na conferência (câmera/coletor), no visualizador de imagens, em canvas/vídeo/SVG nem no logo.
   Não altera dados nem cores. Cada reparo vira uma linha na memória (máx. 50) e, com a nuvem ligada, 1 registro por reparo diferente
   por sessão em lojas/{id}/erros (sem dados pessoais, sem texto de usuário). Dados → "Auto-reparo" liga/desliga
   (lojasg.estoque99.auto-reparo = 'off'). API window.e99Reparo (on, off, stats, scan, log, clear). Falha = fica como antes. */
(function(){'use strict';var W=window,D=document,DE=D.documentElement;
var KEY='lojasg.estoque99.auto-reparo',CONFIRM=400,GAP=500,BUDGET=1,STUCK=2500,MAXTRY=3,LOGMAX=50;
var SKIP='#stok-intro,#conf-dlg,#e99-img,.e99-img,canvas,video,svg,picture,img,input,textarea,select,option,script,style,noscript,.brand,.logo,.logo-img,[class*="logo"],#mfx-glow,.mfx-rip-box,[data-e99-nofix]';
var PILL=/(^|[\s_-])(pill|chip|badge|tag)(\s|$)/i;
var FX=['e99-fx-wrap','e99-fx-ell','e99-fx-ib','e99-fx-wide','e99-fx-scroll','e99-fx-anim','e99-fx-tf'];
function now(){return W.performance&&performance.now?performance.now():Date.now()}
function pref(){try{return localStorage.getItem(KEY)!=='off'}catch(x){return true}}
function pg(){try{return typeof page!=='undefined'?String(page||''):''}catch(x){return ''}}
function blocked(){var b=D.body;if(!b)return true;
  if(b.classList.contains('stok-intro-active')||b.classList.contains('conf-on')||D.getElementById('stok-intro'))return true;
  try{if(W.e99Img&&W.e99Img.state&&W.e99Img.state().open)return true}catch(x){}return false}
function skip(el){try{return !el||el.nodeType!==1||!!el.closest(SKIP)}catch(x){return true}}

/* ---------- registro ---------- */
var log=[],count=0,sent={},stats={cycles:0,lastMs:0,maxMs:0,totalMs:0,scanned:0,active:0};
function short(el){if(!el||!el.tagName)return '?';var s=el.tagName.toLowerCase(),c=String(el.getAttribute&&el.getAttribute('class')||'').split(/\s+/).filter(function(k){return k&&!/^e99-fx-|^mfx-/.test(k)}).slice(0,2);
  if(c.length)s+='.'+c.join('.');var p=el.parentElement;if(p&&p!==D.body&&p.tagName){var pc=String(p.getAttribute('class')||'').split(/\s+/).filter(function(k){return k&&!/^e99-fx-|^mfx-/.test(k)})[0];s=p.tagName.toLowerCase()+(pc?'.'+pc:'')+'>'+s}
  return s.replace(/[^a-z0-9_.>-]/gi,'').slice(0,60)}
function hhmm(){var d=new Date();return ('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)+':'+('0'+d.getSeconds()).slice(-2)}
function rec(tipo,el){count++;var line={tipo:tipo,sel:short(el),tela:pg().slice(0,20)||'-',hora:hhmm()};log.push(line);if(log.length>LOGMAX)log.shift();if(!sent[line.tipo+'|'+line.sel])setTimeout(function(){cloud(line)},1200);dirty=true}
async function cloud(l){var k=l.tipo+'|'+l.sel;if(sent[k])return;sent[k]=1;
  try{if(!W.e99Cloud||!W.e99Cloud.user||!W.e99Cloud.user()||!W.crypto||!crypto.subtle)return;var c=await W.e99Cloud.load(),sid=await W.e99Cloud.sid();if(!sid||!c||!c.db)return;
    var ver=String(W.SITE_VERSION||(D.querySelector('meta[name=estoque99-version]')||{}).content||'').slice(0,10),msg=('auto-reparo: '+l.tipo+' '+l.sel).slice(0,300);
    var h=new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ver+'|'+msg))),id=Array.from(h).map(function(b){return b.toString(16).padStart(2,'0')}).join('').slice(0,24);
    var nk='lojasg.estoque99.err-n:'+id,n=1;try{n=(+localStorage.getItem(nk)||0)+1;localStorage.setItem(nk,String(n))}catch(y){}
    await c.db.collection('lojas').doc(sid).collection('erros').doc(id).set({msg:msg,onde:'v162-reparo',pagina:l.tela.slice(0,40),ver:ver,por:'',n:Math.min(n,1000000),at:Date.now()})}catch(x){}}

/* ---------- reparos reversíveis ---------- */
var pend=new Map(),fixed=new Set(),tries=new WeakMap(),finalEl=new WeakSet();
function mark(el,cls,tipo,full){var t=(tries.get(el)||0)+1;tries.set(el,t);if(t>=MAXTRY)finalEl.add(el);
  cls.forEach(function(c){el.classList.add(c)});var cur=el.getAttribute('data-e99-fix');el.setAttribute('data-e99-fix',cur&&cur.indexOf(tipo)<0?cur+' '+tipo:(cur||tipo));
  if(full&&!el.hasAttribute('title')){var tx=(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,300);if(tx){el.setAttribute('title',tx);el.setAttribute('data-e99-title','1')}}
  fixed.add(el);watchSize(el);rec(tipo,el)}
var pro=null,pw0=new WeakMap();
function watchSize(el){if(!W.ResizeObserver||el.classList.contains('e99-fx-anim'))return;var p=el.parentElement;if(!p||p===D.body)return;
  if(!pro)pro=new ResizeObserver(function(es){var ch=false;es.forEach(function(e){var w=Math.round(e.contentRect.width),o=pw0.get(e.target);pw0.set(e.target,w);if(o!=null&&o!==w)ch=true});if(ch&&on){recheck=true;schedule()}});
  try{pro.observe(p)}catch(x){}}
function unfix(el){FX.forEach(function(c){el.classList.remove(c)});el.removeAttribute('data-e99-fix');if(el.getAttribute('data-e99-title')){el.removeAttribute('title');el.removeAttribute('data-e99-title')}fixed.delete(el)}

/* ---------- texto ---------- */
function busy(el){/* não repara enquanto o próprio elemento ou os 3 de cima estão animando */for(var e=el,i=0;e&&e!==D.body&&i<4;e=e.parentElement,i++){try{var a=e.getAnimations();for(var j=0;j<a.length;j++)if(a[j].playState==='running'&&a[j].effect&&a[j].effect.getTiming().iterations!==Infinity)return true}catch(x){return false}}return false}
function hasText(el){var n=el.firstChild,i=0;for(;n&&i<40;n=n.nextSibling,i++)if(n.nodeType===3&&n.nodeValue.trim())return true;return false}
function isPill(el){var c=el.getAttribute('class');return !!(c&&PILL.test(c))}
function textProblem(el){if(el.hasAttribute('data-e99-fix'))return null;var cw=el.clientWidth;if(cw<8)return null;
  var sw=el.scrollWidth,p=el.parentElement,pill=isPill(el),wide=p&&p!==D.body&&p.clientWidth>8&&el.offsetWidth>p.clientWidth+1;
  if(sw<=cw+1&&!wide){if(pill&&!el.children.length&&el.offsetHeight>30){var cs0=getComputedStyle(el),lh=parseFloat(cs0.lineHeight)||parseFloat(cs0.fontSize)*1.2,inner=el.clientHeight-parseFloat(cs0.paddingTop)-parseFloat(cs0.paddingBottom);
      if(lh>0&&inner>lh*1.6)return {tipo:'pilula-quebrada',cls:ellCls(el,cs0)}}return null}
  var cs=getComputedStyle(el),ox=cs.overflowX;if(ox==='auto'||ox==='scroll')return null;
  var nowrap=/^(nowrap|pre)$/.test(cs.whiteSpace);
  if(pill)return {tipo:'pilula-estoura',cls:ellCls(el,cs)};
  if(ox==='hidden'||ox==='clip'){if(cs.textOverflow==='ellipsis'&&!wide)return null;return nowrap?{tipo:'texto-cortado',cls:ellCls(el,cs)}:{tipo:'texto-cortado',cls:['e99-fx-wrap']}}
  return nowrap?{tipo:'texto-estoura',cls:ellCls(el,cs)}:{tipo:'texto-estoura',cls:['e99-fx-wrap']}}
function ellCls(el,cs){var c=['e99-fx-ell'];if(/flex|grid/.test(cs.display)&&!el.children.length)c.push('e99-fx-ib');return c}

/* ---------- rolagem lateral ---------- */
function spills(k){if(k.scrollWidth<=k.clientWidth+1)return false;var o=getComputedStyle(k).overflowX;return o==='visible'}
function wideCulprit(t0){var vw=DE.clientWidth;if(DE.scrollWidth<=vw+1)return null;var seen=0;wideLeft=true;
  function dfs(el,pw,depth){if(depth>40)return null;var ks=el.children;for(var i=0;i<ks.length&&i<400;i++){var k=ks[i];if(++seen>600||((seen&3)===0&&now()-t0>BUDGET))return null;if(skip(k))continue;if(hiddenCV(k))continue;/* content-visibility:auto contém o próprio conteúdo */var r=k.getBoundingClientRect();if(!(r.width>0))continue;
      if(r.right>vw+1||spills(k)){if(k.offsetParent===null&&k.tagName!=='BODY')continue;/* fixo (ou sem caixa) não rola a página */if(r.width>pw+1&&!k.hasAttribute('data-e99-fix'))return deepest(k,pw);var f=dfs(k,k.clientWidth,depth+1);if(f)return f}}return null}
  var f=dfs(D.body,vw,0);if(f||seen<=600&&now()-t0<=BUDGET||++wideTry>30){wideLeft=false;wideTry=0}return f}
var wideLeft=false,wideTry=0;
function deepest(k,pw){/* desce enquanto um filho é tão largo quanto ele (é o filho que força a largura) */for(var d=0;d<20;d++){var w=k.getBoundingClientRect().width,c=null;
    for(var i=0;i<k.children.length&&i<200;i++){var x=k.children[i];if(skip(x)||x.hasAttribute('data-e99-fix'))continue;var xw=x.getBoundingClientRect().width;if(xw>=w-1&&xw>pw+1){c=x;break}}
    if(!c)return k;k=c}return k}
function fixWide(el){if(el.classList.contains('e99-fx-wide')){unfixKeepTries(el);mark(el,['e99-fx-wide','e99-fx-scroll'],'rolagem-lateral');return}mark(el,/^(TABLE|PRE)$/.test(el.tagName)?['e99-fx-wide','e99-fx-scroll']:['e99-fx-wide'],'rolagem-lateral')}
function unfixKeepTries(el){FX.forEach(function(c){el.classList.remove(c)})}

/* ---------- animações ---------- */
var starts=new Map(),waapi=new Set(),pausedHidden=[];
D.addEventListener('animationstart',function(e){var t=e.target;if(!on||!t||t.nodeType!==1)return;if(starts.size>300)prune();starts.set(t,now());later(STUCK+150)},true);
function endA(e){starts.delete(e.target)}D.addEventListener('animationend',endA,true);D.addEventListener('animationcancel',endA,true);
function prune(){starts.forEach(function(t,el){if(!el.isConnected)starts.delete(el)})}
var A0=W.Element&&Element.prototype.animate;
if(A0){Element.prototype.animate=function(){var a=A0.apply(this,arguments);try{if(a&&waapi.size<600){a.__e99t=now();waapi.add(a);var dl=function(){waapi.delete(a)};a.addEventListener('finish',dl);a.addEventListener('cancel',dl)}}catch(x){}return a}}
function stuckCheck(todo){var n=now();starts.forEach(function(t,el){if(n-t<STUCK)return;if(!el.isConnected){starts.delete(el);return}
    if(skip(el)||el.classList.contains('e99-fx-anim'))return starts.delete(el);
    var run=false,loop=false;try{el.getAnimations().forEach(function(a){if(a.playState==='running'){run=true;var tm=a.effect&&a.effect.getTiming&&a.effect.getTiming();if(tm&&tm.iterations===Infinity)loop=true}})}catch(x){}
    if(loop)return starts.delete(el);/* animação em loop rodando não é entrada presa: não fica sendo vigiada */
    if(run)return;starts.delete(el);var op=parseFloat(getComputedStyle(el).opacity);if(!(op<.99))return;
    var cls=['e99-fx-anim'];if(/^(static|relative)$/.test(getComputedStyle(el).position))cls.push('e99-fx-tf');todo.push(function(){mark(el,cls,'animacao-presa')})});
  waapi.forEach(function(a){try{var tg=a.effect&&a.effect.target;if(tg&&!tg.isConnected&&n-a.__e99t<=1000&&a.playState==='running')later(1100);if(tg&&!tg.isConnected&&n-a.__e99t>1000&&a.playState!=='idle'&&a.playState!=='finished'&&long(a)){todo.push(function(){a.cancel();waapi.delete(a);rec('animacao-orfa',tg)})}}catch(x){waapi.delete(a)}})}
function long(a){try{var t=a.effect.getComputedTiming();return t.endTime===Infinity||t.endTime-(a.currentTime||0)>2000}catch(x){return true}}
var lastRender=0;
function noRise(todo){var b=D.body;try{if(!b||typeof authSession==='undefined'||!authSession)return;if(!b.classList.contains('e99-norise')&&now()-lastRender>STUCK&&D.getElementById('view')){todo.push(function(){b.classList.add('e99-norise');rec('norise-perdido',b)})}}catch(x){}}
D.addEventListener('visibilitychange',function(){if(D.hidden){if(!on||!D.getAnimations)return;try{D.getAnimations().forEach(function(a){var t=a.effect&&a.effect.target,tm=a.effect&&a.effect.getTiming&&a.effect.getTiming();
      if(a.playState==='running'&&tm&&tm.iterations===Infinity&&t&&!skip(t)){a.pause();pausedHidden.push(a)}})}catch(x){}}
  else{var l=pausedHidden;pausedHidden=[];l.forEach(function(a){try{if(a.playState==='paused')a.play()}catch(x){}});schedule()}});

/* ---------- vigia ---------- */
var verify=false,on=false,mo=null,ro=null,timer=0,idle=0,last=0,queue=[],queued=new Set(),full=true,recheck=false,dirty=false,laterT=0;
/* tempo ocioso do navegador (depois do quadro; sem pedir quadro novo) */
function ric(fn){return W.requestIdleCallback?requestIdleCallback(fn,{timeout:1000}):setTimeout(fn,16)}
/* com tela mudada: espera o próximo quadro ser pintado (layout pronto), aí lê no ocioso; mutação já pede quadro, então não cria quadro extra */
function ricDom(fn){var t=0;if(!W.requestAnimationFrame)return ric(fn);requestAnimationFrame(function(){setTimeout(function(){idle=ric(fn)},0)});return -1}
function schedule(){if(!on||timer||idle||D.hidden)return;var w=Math.max(0,last+GAP-Date.now());timer=setTimeout(function(){timer=0;if(!on||D.hidden)return;idle=(queue.length||full||work)?ricDom(cycle):ric(cycle)},w)}
function later(ms){if(laterT)return;laterT=setTimeout(function(){laterT=0;schedule()},ms)}
function enqueue(node){if(!node)return;if(node.nodeType===3)node=node.parentElement;if(!node||node.nodeType!==1||queue.length>4000)return;
  if(node.closest&&node.closest('[data-e99-fix]'))recheck=true;
  if(!queued.has(node)){queued.add(node);queue.push(node)}}
function onMut(list){if(!on)return;for(var i=0;i<list.length;i++){var m=list[i];if(m.type==='characterData')enqueue(m.target);else{enqueue(m.target);for(var j=0;j<m.addedNodes.length&&j<50;j++)enqueue(m.addedNodes[j])}}schedule()}
var ZONE='#stok-intro,#conf-dlg,#e99-img,.e99-img,svg,canvas,video,picture,script,style,noscript,template,.brand,.logo,.logo-img,[data-e99-nofix],#mfx-glow,.mfx-rip-box',LONGTOK=/[^\s]{12,}/,TAGS={BUTTON:1,TH:1,TD:1,LABEL:1,SUMMARY:1};
function zoneEl(e){if(e.matches(ZONE))return true;var c=e.getAttribute('class');return !!(c&&c.indexOf('logo')>=0)}
var NODES=500,ELS=20;/* teto por ciclo: nós percorridos e textos medidos (custo fixo, mesmo em aparelho lento) */
function walkerFor(root){return D.createTreeWalker(root,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT,{acceptNode:function(n){return n.nodeType===1&&zoneEl(n)?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT}})}
function collect(wk){/* elementos com texto direto; sem ler layout: só os que podem estourar (palavra/código/e-mail/CNPJ longo, texto comprido, pílula, botão, célula) */
  var budget=NODES,n;while(budget>0){if(!wk.w){var r=wk.roots.shift();if(!r)return;if(!r.isConnected||(r!==D.body&&skip(r)))continue;wk.w=walkerFor(r)}
    n=wk.w.nextNode();if(!n){wk.w=null;continue}budget--;if(n.nodeType!==3)continue;var v=n.nodeValue,p=n.parentElement;if(!p||wk.seen.has(p)||!v.trim())continue;
    if(LONGTOK.test(v)||v.length>60||TAGS[p.tagName]||isPill(p)){wk.seen.add(p);wk.list.push(p)}}}
var work=null;
/* fora da tela com content-visibility:auto (o navegador nem montou o layout): não ler, senão força o layout; volta a olhar quando aparecer */
var CV=!!(W.Element&&Element.prototype.checkVisibility);
function hiddenCV(el){if(!CV)return false;try{return !el.checkVisibility({contentVisibilityAuto:true})}catch(x){return false}}
D.addEventListener('contentvisibilityautostatechange',function(e){if(on&&e.skipped===false&&e.target){enqueue(e.target);schedule()}},true);
function cycle(){idle=0;if(!on||D.hidden)return;if(blocked()){later(1500);return}
  var t0=now(),todo=[],again=false;last=Date.now();stats.cycles++;
  try{
    if(recheck){recheck=false;var arr=[];fixed.forEach(function(el){if(!el.isConnected){fixed.delete(el);return}if(!finalEl.has(el)&&!el.classList.contains('e99-fx-anim')&&!el.classList.contains('e99-fx-wide'))arr.push(el)});
      arr=arr.slice(0,30);var keep=arr.map(function(el){var c=FX.filter(function(k){return el.classList.contains(k)}),f=el.getAttribute('data-e99-fix'),tt=el.getAttribute('data-e99-title')?el.getAttribute('title'):null;unfix(el);return {el:el,c:c,f:f,tt:tt}});
      keep.forEach(function(k){if(textProblem(k.el)){k.c.forEach(function(c){k.el.classList.add(c)});k.el.setAttribute('data-e99-fix',k.f);if(k.tt!=null){k.el.setAttribute('title',k.tt);k.el.setAttribute('data-e99-title','1')}fixed.add(k.el)}});again=true}
    else{
    /* ciclo só de relógio (nada mudou na tela): não lê layout, só confere animações */
    var dom=!!(full||work||queue.length||pend.size||verify||wideLeft);verify=false;
    /* rolagem lateral primeiro (a página inteira pesa mais que um texto) */
    if(dom){var wc=wideCulprit(t0);if(wc&&!finalEl.has(wc))todo.push(function(){fixWide(wc)})}
    if(dom&&!work){var roots=full?[D.body]:queue;queue=[];queued=new Set();full=false;work={roots:roots,w:null,list:[],seen:new Set(),i:0}}
    if(work){collect(work);var L=work.list,k=0;while(work.i<L.length&&k<ELS){var el=L[work.i++];k++;stats.scanned++;if(!el.isConnected||finalEl.has(el)||hiddenCV(el))continue;if(textProblem(el)&&!pend.has(el))pend.set(el,now())}
      if(work.i>=L.length&&!work.w&&!work.roots.length)work=null}
    /* confirma depois de ~400 ms (ignora estouro passageiro de animação/carregamento) */
    if(pend.size){var tn=now();pend.forEach(function(t,el){if(tn-t<CONFIRM||now()-t0>BUDGET)return;pend.delete(el);if(!el.isConnected||finalEl.has(el)||skip(el))return;if(busy(el)){pend.set(el,tn);return}var pb=textProblem(el);if(pb)todo.push(function(){mark(el,pb.cls,pb.tipo,pb.cls.indexOf('e99-fx-ell')>=0)})})}
    if(now()-t0<BUDGET){stuckCheck(todo);noRise(todo)}else again=true;if(wideLeft||pend.size&&now()-t0>BUDGET)again=true;
    /* só escreve depois de ler tudo (sem forçar layout em laço) */
    for(var q=0;q<todo.length;q++)todo[q]();if(todo.length)again=verify=true}
  }catch(x){work=null}
  var ms=now()-t0;stats.lastMs=ms;if(ms>stats.maxMs)stats.maxMs=ms;stats.totalMs+=ms;stats.active=fixed.size;
  if(dirty){dirty=false;try{panelUpdate()}catch(x){}}
  if(work&&on&&!D.hidden&&!idle&&!timer)idle=ric(cycle);/* continua o mesmo lote no próximo tempo ocioso */
  else if(queue.length||again)schedule();
  else if(pend.size)later(CONFIRM+60);
  else if(starts.size)later(STUCK)}
function start(){if(on||!pref()||!D.body)return;on=true;full=true;
  mo=new MutationObserver(onMut);mo.observe(D.body,{childList:true,subtree:true,characterData:true});
  if(W.ResizeObserver){var w0=-1;ro=new ResizeObserver(function(){var w=DE.clientWidth;if(w===w0)return;w0=w;fixed.size&&(recheck=true);full=true;schedule()});ro.observe(DE)}
  schedule()}
function stop(){on=false;if(pro){pro.disconnect();pro=null}if(mo){mo.disconnect();mo=null}if(ro){ro.disconnect();ro=null}clearTimeout(timer);timer=0;clearTimeout(laterT);laterT=0;
  if(idle){try{(W.cancelIdleCallback||clearTimeout)(idle)}catch(x){}idle=0}queue=[];queued=new Set();work=null;starts.clear();pend.clear();
  Array.from(fixed).forEach(unfix);D.querySelectorAll('[data-e99-fix]').forEach(unfix)}

if(typeof render==='function'){var r0=render;render=function(){lastRender=now();var res=r0.apply(this,arguments);try{panel();if(on){later(STUCK+150)}}catch(x){}return res}}

/* ---------- Dados → painel "Auto-reparo" ---------- */
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function listHTML(){var l=log.slice(-10).reverse();return l.length?l.map(function(x){return '<li><span class="small">'+esc(x.hora)+'</span> · '+esc(x.tela)+' · <b>'+esc(x.tipo)+'</b></li>'}).join(''):'<li class="small">Nenhum reparo nesta sessão.</li>'}
function panelInner(){var v=pref();return '<h2>Auto-reparo</h2><p>Corrige sozinho, na hora, texto que estoura ou fica cortado e animação que trava. Não muda dados, cores nem o logo.</p>'
  +'<div class="toolbar"><button type="button" id="reparo-btn" class="'+(v?'primary':'')+'" aria-pressed="'+v+'" onclick="e99Reparo.'+(v?'off':'on')+'()">'+(v?'Ligado':'Desligado')+'</button>'
  +'<button type="button" id="reparo-clear" onclick="e99Reparo.clear()">Limpar</button></div>'
  +'<p id="reparo-count">Reparos nesta sessão: <b>'+count+'</b></p><ul id="reparo-list" class="reparo-list">'+listHTML()+'</ul>'}
function panel(){if(pg()!=='data')return;var v=D.getElementById('view');if(!v)return;var p=D.getElementById('reparo-panel');
  if(!p){p=D.createElement('div');p.className='panel help reparo-panel';p.id='reparo-panel';p.setAttribute('data-e99-nofix','');var lic=D.getElementById('lic-panel');if(lic&&lic.parentNode===v)v.insertBefore(p,lic);else v.appendChild(p)}
  p.innerHTML=panelInner()}
function panelUpdate(){if(D.getElementById('reparo-panel'))panel()}

W.e99Reparo={on:function(){try{localStorage.removeItem(KEY)}catch(x){}start();panelUpdate();return true},
  off:function(){try{localStorage.setItem(KEY,'off')}catch(x){}stop();panelUpdate();return false},
  enabled:function(){return on},
  stats:function(){return {on:on,count:count,active:fixed.size,cycles:stats.cycles,lastMs:+stats.lastMs.toFixed(3),maxMs:+stats.maxMs.toFixed(3),avgMs:stats.cycles?+(stats.totalMs/stats.cycles).toFixed(3):0,scanned:stats.scanned,pending:!!(timer||idle||laterT),tracked:starts.size,pend:pend.size,waapi:waapi.size}},
  scan:function(){if(!on)return false;full=true;work=null;clearTimeout(timer);timer=0;if(idle){try{(W.cancelIdleCallback||clearTimeout)(idle)}catch(x){}idle=0}last=0;cycle();return true},
  log:function(){return log.slice()},
  clear:function(){log=[];count=0;panelUpdate()}};
function boot(){start();try{panel()}catch(x){}}
if(D.body)boot();else D.addEventListener('DOMContentLoaded',boot);
})();
