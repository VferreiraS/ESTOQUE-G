
/* v130 · A) chat/sync com mensagem clara de qual serviço está bloqueado; B) painel de ajuda "Rede da loja / Antivírus"; C) pacote opcional "Efeitos de energia" (originais). */
(function(){var W=window,D=document;
/* ---------- A: refina a falha do chat com e99NetWhy (sem travar nada) ---------- */
W.e99NetFail=function(rec,done){try{if(navigator.onLine===false||typeof W.e99NetWhy!=='function')return;W.e99NetWhy().then(function(m){if(m&&!/está sem internet/.test(m)){rec.err=m;if(typeof done==='function')done(m)}}).catch(function(){})}catch(e){}};
/* reenvio automático das mensagens do chat quando a rede volta (a fila já existe desde a v108) */
function retryChat(){try{if(navigator.onLine===false||typeof W.chatRetry!=='function')return;var f=typeof W.e99ChatFailed==='function'?W.e99ChatFailed():[];f.forEach(function(x){try{W.chatRetry(x.id)}catch(e){}})}catch(e){}}
W.addEventListener('online',function(){setTimeout(retryChat,1200)});
/* ---------- B: painel "Rede da loja / Antivírus" (na aba Dados) ---------- */
var HOSTS='vferreiras.github.io\nntfy.sh\nidentitytoolkit.googleapis.com\nfirestore.googleapis.com\nwww.gstatic.com';
function panel(){var d=D.createElement('div');d.className='panel help';d.id='net-panel';
  d.innerHTML='<h2>Rede da loja / Antivírus</h2>'
   +'<p class="small">Se aparecer "sem internet" mesmo com internet, em geral é o antivírus (ex.: Bitdefender) ou a rede/Wi-Fi da loja barrando o Stok. Isto não burla nada: só libera o app no seu próprio antivírus.</p>'
   +'<p><b>Libere estes endereços</b> no antivírus e na rede:</p><div class="net-hosts">'+HOSTS+'</div>'
   +'<p style="margin-top:10px"><b>No Bitdefender</b> (passo a passo):</p>'
   +'<ol class="net-steps"><li>Abra o Bitdefender → <b>Proteção</b>.</li>'
   +'<li>Em <b>Antivírus</b> → <b>Exceções</b> (ou "Gerenciar exceções"), e também em <b>Prevenção contra ameaças online</b>.</li>'
   +'<li>Toque em <b>Adicionar exceção</b> e cole cada endereço acima (um por vez). Marque para liberar a navegação segura.</li>'
   +'<li>Se houver <b>Firewall</b>, permita o navegador que você usa (Chrome/Edge/Safari).</li>'
   +'<li>Feche e abra o Stok de novo e toque em <b>Testar conexão</b>.</li></ol>'
   +'<p class="small" style="margin-top:8px">Sem acesso ao antivírus? Peça ao TI da loja para liberar esses endereços, ou teste pelo roteador do celular (4G/5G) para confirmar.</p>'
   +'<button type="button" class="btn" id="net-test" onclick="e99NetTest()">Testar conexão</button>'
   +'<div id="net-result" aria-live="polite"></div>';return d}
W.e99NetTest=async function(){var box=D.getElementById('net-result');if(box)box.innerHTML='<p class="small">Testando…</p>';
  try{if(typeof W.e99NetList==='function'){var r=await W.e99NetList();var any=r.some(function(x){return !x.ok});
      var html='<ul>'+r.map(function(x){return '<li class="'+(x.ok?'ok':'bad')+'"><span aria-hidden="true">'+(x.ok?'✓':'✕')+'</span> '+x.name+' — '+(x.ok?'passou':'bloqueado')+'</li>'}).join('')+'</ul>';
      if(navigator.onLine===false)html+='<p class="msg bad">Este aparelho está sem internet. Confira o Wi-Fi ou o cabo.</p>';
      else if(any)html+='<p class="msg bad">Algo está bloqueando o Stok. Libere no antivírus/rede os itens marcados como bloqueado.</p>';
      else html+='<p class="msg ok">Tudo passou. A conexão com o Stok está liberada.</p>';
      if(box)box.innerHTML=html;return}
    if(typeof W.e99NetWhy==='function'){var m=await W.e99NetWhy();if(box)box.innerHTML='<p class="msg">'+String(m).replace(/</g,'&lt;')+'</p>'}}
  catch(e){if(box)box.innerHTML='<p class="msg bad">Não foi possível testar agora. Tente de novo.</p>'}};
if(typeof render==='function'){var r0=render;render=function(){var r=r0.apply(this,arguments);try{if(typeof authSession!=='undefined'&&authSession&&typeof page!=='undefined'&&page==='data'){var v=D.getElementById('view');if(v&&!D.getElementById('net-panel')){var lic=D.getElementById('lic-panel');if(lic)v.insertBefore(panel(),lic);else v.appendChild(panel())}}}catch(e){}return r}}
/* ---------- C: "Efeitos de energia" (originais; começam desligados) ---------- */
var FXK='lojasg.estoque99.anime-fx';
function reduced(){try{if(typeof W.__osReduce==='boolean')return W.__osReduce;return !!(W.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)}catch(x){return false}}
function pref(){try{return localStorage.getItem(FXK)==='on'}catch(x){return false}}
function animeOn(){return pref()&&!reduced()}
function sync(){D.body.classList.toggle('e99-anime',animeOn())}
W.e99Anime={on:animeOn,set:function(v){try{localStorage.setItem(FXK,v?'on':'off')}catch(x){}sync();if(v&&animeOn())charge();mountAura();try{if(typeof render==='function'&&typeof authSession!=='undefined'&&authSession)render()}catch(x){}prefRow(true);try{notify('Efeitos de energia: '+(v?'ligados':'desligados')+'.')}catch(x){}}};
function tok(n,d){try{var v=getComputedStyle(D.body||D.documentElement).getPropertyValue(n).trim();return /^#[0-9a-f]{3,8}$/i.test(v)?v:d}catch(e){return d}}
function rgb(hex){hex=hex.replace('#','');if(hex.length===3)hex=hex.replace(/./g,'$&$&');var n=parseInt(hex.slice(0,6),16);return[(n>>16)&255,(n>>8)&255,n&255]}
var scrolling=false,sct=0;
W.addEventListener('scroll',function(){scrolling=true;clearTimeout(sct);sct=setTimeout(function(){scrolling=false},260)},{passive:true});
/* aura atrás do S no topo do Início: brilho pulsante + partículas de energia subindo */
var auraRAF=0;
function mountAura(){var hero=D.querySelector('.hero-home');if(!hero)return;var c=D.getElementById('e99-aura');
  if(!animeOn()){if(c){cancelAnimationFrame(auraRAF);auraRAF=0;c.remove()}return}
  if(!c){c=D.createElement('canvas');c.id='e99-aura';c.setAttribute('aria-hidden','true');hero.insertBefore(c,hero.firstChild)}
  else if(c.parentNode!==hero)hero.insertBefore(c,hero.firstChild);
  var ctx=c.getContext('2d'),parts=[],t0=Date.now();
  function size(){var w=hero.clientWidth||300,h=hero.clientHeight||260,dpr=Math.min(2,W.devicePixelRatio||1);c.width=w*dpr;c.height=h*dpr;c.style.width=w+'px';c.style.height=h+'px';ctx.setTransform(dpr,0,0,dpr,0,0)}
  size();var ro=W.ResizeObserver?new ResizeObserver(size):null;if(ro)ro.observe(hero);
  function spawn(w,h){parts.push({x:w*(.28+Math.random()*.44),y:h+8,vy:-(0.5+Math.random()*1.1),r:1+Math.random()*2.2,a:0,life:0,max:70+Math.random()*50})}
  function loop(){if(c.id!=='e99-aura'||!c.parentNode){auraRAF=0;return}
    if(!animeOn()){cancelAnimationFrame(auraRAF);auraRAF=0;c.remove();return}
    var w=c.clientWidth,h=c.clientHeight;ctx.clearRect(0,0,w,h);
    if(D.hidden||scrolling||(typeof page!=='undefined'&&page!=='home')){auraRAF=requestAnimationFrame(loop);return}
    var col=rgb(tok('--neon','#E7B8EF')),pulse=.12+.06*Math.sin((Date.now()-t0)/700);
    var g=ctx.createRadialGradient(w*.5,h*.42,0,w*.5,h*.42,Math.max(w,h)*.5);
    g.addColorStop(0,'rgba('+col[0]+','+col[1]+','+col[2]+','+pulse.toFixed(3)+')');g.addColorStop(1,'rgba('+col[0]+','+col[1]+','+col[2]+',0)');
    ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    if(parts.length<26&&Math.random()<.5)spawn(w,h);
    for(var i=parts.length-1;i>=0;i--){var p=parts[i];p.life++;p.y+=p.vy;p.a=Math.sin(Math.PI*p.life/p.max)*.7;if(p.life>=p.max||p.y<-10){parts.splice(i,1);continue}
      ctx.beginPath();ctx.fillStyle='rgba('+col[0]+','+col[1]+','+col[2]+','+p.a.toFixed(3)+')';ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill()}
    auraRAF=requestAnimationFrame(loop)}
  if(!auraRAF)auraRAF=requestAnimationFrame(loop)}
/* "carregar energia" ao abrir: raios/partículas subindo por ~1,5 s */
function charge(){if(!animeOn())return;var old=D.getElementById('e99-charge');if(old)old.remove();
  var c=D.createElement('canvas');c.id='e99-charge';c.setAttribute('aria-hidden','true');(D.body||D.documentElement).appendChild(c);
  var ctx=c.getContext('2d'),dpr=Math.min(2,W.devicePixelRatio||1);function sz(){c.width=innerWidth*dpr;c.height=innerHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}sz();
  var col=rgb(tok('--neon','#E7B8EF')),rays=[],t0=Date.now(),DUR=1500;
  for(var i=0;i<34;i++)rays.push({x:Math.random(),y:1+Math.random()*.3,v:.004+Math.random()*.01,len:20+Math.random()*60,w:1+Math.random()*1.8});
  function loop(){var e=Date.now()-t0;if(e>=DUR||!animeOn()){c.remove();return}
    var W2=c.clientWidth,H=c.clientHeight;ctx.clearRect(0,0,W2,H);var fade=e<DUR*.7?1:1-(e-DUR*.7)/(DUR*.3);
    for(var j=0;j<rays.length;j++){var r=rays[j];r.y-=r.v;var y=r.y*H,x=r.x*W2;ctx.strokeStyle='rgba('+col[0]+','+col[1]+','+col[2]+','+(.5*fade).toFixed(3)+')';ctx.lineWidth=r.w;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,y+r.len);ctx.stroke()}
    requestAnimationFrame(loop)}
  requestAnimationFrame(loop)}
/* transição de tela: "speed lines" + flash rápido */
var speeding=false;
function speed(){if(!animeOn()||speeding)return;speeding=true;var o=D.createElement('div');o.className='e99-speed';o.setAttribute('aria-hidden','true');(D.body||D.documentElement).appendChild(o);setTimeout(function(){o.remove();speeding=false},360)}
/* "power-up" ao concluir ação importante */
W.e99PowerUp=function(){if(!animeOn())return;var o=D.createElement('div');o.className='e99-powerup';o.setAttribute('aria-hidden','true');o.innerHTML='<i></i>';(D.body||D.documentElement).appendChild(o);try{if(typeof playSiteSound==='function')playSiteSound('tap')}catch(e){}setTimeout(function(){o.remove()},720)};
/* preferência em Preferências → Aparência */
function prefRow(force){var pp=D.getElementById('prefs-panel');if(!pp)return;var old=D.getElementById('pref-anime-row');if(old&&!force)return;if(old)old.remove();
  var on=pref(),r=D.createElement('div');r.className='pref-row';r.id='pref-anime-row';
  r.innerHTML='<span><b>Efeitos de energia</b><span class="small">Aura e brilho no estilo anime, com as cores do tema. Começa desligado; respeita "menos movimento".</span></span>'
   +'<button type="button" class="btn'+(on?' primary':'')+'" aria-pressed="'+(on?'true':'false')+'" onclick="e99Anime.set('+(on?'false':'true')+')">'+(on?'Ligado':'Desligado')+'</button>';
  var themeRow=D.getElementById('pref-theme-row');if(themeRow&&themeRow.parentNode===pp)themeRow.after(r);else pp.appendChild(r)}
/* ganchos de render: monta/remove aura e injeta a preferência; speed lines na troca de página */
var lastPage='';
if(typeof render==='function'){var r1=render;render=function(){var res=r1.apply(this,arguments);try{prefRow(false);var pg=typeof page!=='undefined'?page:'';if(pg&&pg!==lastPage){if(lastPage)speed();lastPage=pg}mountAura()}catch(e){}return res}}
D.addEventListener('visibilitychange',function(){if(!D.hidden){sync();mountAura()}});
sync();setTimeout(function(){sync();mountAura();if(animeOn())charge()},400);
})();
