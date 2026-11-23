/* v161 · animação do mouse só no PC: brilho que segue o cursor (lerp, rAF para quando o mouse para), ondinha no clique,
   botões/cartões reagem ao passar o mouse. iPhone 13 não cria nada; "menos movimento" e a preferência desligam;
   não atua em campos de texto, na conferência nem no visualizador de imagens; parado, UpdateLayoutTree = 0; 0 erro de console. */
const L=require('./lib.js');const {ok}=L;
const BASE=process.env.BASE||'http://localhost:8000',U=BASE+'/index.html';
function watch(p,tag,errs){p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(tag+' console: '+m.text())});p.on('dialog',d=>d.accept())}
const SEED=()=>{state.team=[{id:'a',name:'Ana Souza',role:'Repositora'}];
  state.plans=[{id:'p1',title:'Plano do dia',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana Souza',notes:'',photos:[],done:false},{id:'a2',title:'Limpar corredor 09',owner:'Ana Souza',notes:'',photos:[],done:false}]}];return save()};
const ST=p=>p.evaluate(()=>window.e99Mouse?e99Mouse.state():null);
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 /* ===== PC ===== */
 {const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();watch(p,'PC',errs);
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'mfx'+T);await p.addStyleTag({content:'.firebase-emulator-warning,#toast,.toast{display:none!important}'});
  await p.evaluate(()=>{authSession.payload.role='gestor'});await p.evaluate(SEED);await p.evaluate(()=>{go('plans');scrollTo(0,0)});await p.waitForTimeout(1200);
  ok(await p.evaluate(()=>!!window.e99Mouse&&e99Mouse.on()&&document.body.classList.contains('mfx-on')),'PC: animação do mouse ligada por padrão');
  await p.mouse.move(300,300);await p.mouse.move(700,420,{steps:8});await p.waitForTimeout(60);
  const mid=await ST(p);ok(mid&&mid.shown&&mid.raf&&Math.abs(mid.x-700)>1,'PC: brilho aparece e vai atrás do mouse com atraso ('+(mid&&mid.x.toFixed(0))+' → 700)');
  await p.waitForTimeout(900);const s1=await ST(p);
  ok(s1.x===700&&s1.y===420&&!s1.raf,'PC: brilho alcança o mouse e o rAF para ('+s1.x+','+s1.y+', rAF '+s1.raf+')');
  const g=await p.evaluate(()=>{const e=document.getElementById('mfx-glow'),cs=getComputedStyle(e);return {pe:cs.pointerEvents,op:cs.opacity,tr:e.style.transform,bg:cs.backgroundImage,neon:getComputedStyle(document.body).getPropertyValue('--neon-rgb').trim(),filter:cs.filter}});
  ok(g.pe==='none'&&g.op==='1'&&/translate3d\(700/.test(g.tr)&&g.filter==='none','PC: brilho com pointer-events:none, só transform/opacity, sem filtro');
  ok(g.neon&&g.bg.replace(/\s/g,'').indexOf('rgba('+g.neon.replace(/\s/g,'')+',')>=0,'PC: brilho na cor --neon do tema ('+g.neon+')');
  await p.waitForTimeout(1000);const s2=await ST(p);ok(s2.frames===s1.frames&&!s2.raf,'PC: mouse parado = nenhum quadro de rAF ('+s1.frames+' → '+s2.frames+')');
  const cdp=await ctx.newCDPSession(p);await cdp.send('Performance.enable');const m=async()=>{const r=await cdp.send('Performance.getMetrics');const o={};r.metrics.forEach(x=>o[x.name]=x.value);return o};
  const a=await m();await p.waitForTimeout(2000);const c=await m();
  ok(c.RecalcStyleCount-a.RecalcStyleCount===0&&c.LayoutCount-a.LayoutCount===0,'PC parado: UpdateLayoutTree = 0 (estilo '+(c.RecalcStyleCount-a.RecalcStyleCount)+', layout '+(c.LayoutCount-a.LayoutCount)+')');
  /* passar o mouse num botão e num cartão grande */
  const btn=await p.evaluate(()=>{const b=[...document.querySelectorAll('#view button')].find(x=>{if(x.classList.contains('primary')||x.offsetWidth<30)return false;const r=x.getBoundingClientRect();if(r.top<60||r.bottom>890)return false;const e=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return e&&x.contains(e)});const r=b.getBoundingClientRect();b.id=b.id||'mfx-t-btn';return {id:b.id,x:r.left+r.width/2,y:r.top+r.height/2}});
  await p.mouse.move(btn.x,btn.y,{steps:4});await p.waitForTimeout(400);
  const hb=await p.evaluate(id=>{const e=document.getElementById(id),cs=getComputedStyle(e);return {hot:e.classList.contains('mfx-hot'),tr:cs.translate,sc:cs.scale,ol:cs.outlineStyle}},btn.id);
  ok(hb.hot&&/-1\.5px/.test(hb.tr)&&hb.sc==='1.03'&&hb.ol==='solid','PC: botão sobe, cresce e realça a borda ('+JSON.stringify(hb)+' '+btn.id+')');
  const card=await p.evaluate(()=>{const c=document.querySelector('.plan-card');const r=c.getBoundingClientRect();return {x:r.left+r.width*.85,y:r.top+12,w:r.width,h:r.height}});
  await p.mouse.move(card.x,card.y,{steps:5});await p.waitForTimeout(900);
  const hc=await p.evaluate(()=>{const c=document.querySelector('.plan-card');const s=e99Mouse.state();return {hot:c.classList.contains('mfx-hot'),tr:c.style.transform,tilt:s.tilt}});
  const deg=hc.tilt?Math.max(Math.abs(hc.tilt.x),Math.abs(hc.tilt.y)):0;
  ok(hc.hot&&/rotateY/.test(hc.tr)&&deg>0.5&&deg<=3,'PC: cartão grande inclina sutilmente ('+deg.toFixed(2)+'° ≤ 3°) ['+Math.round(card.w)+'×'+Math.round(card.h)+']');
  await p.mouse.move(700,860,{steps:4});await p.waitForTimeout(500);
  ok(await p.evaluate(()=>{const c=document.querySelector('.plan-card');return !c.classList.contains('mfx-hot')&&!/rotate/.test(c.style.transform)}),'PC: ao sair o cartão volta ao normal');
  /* ondinha no clique */
  await p.evaluate(()=>{window.__rp=0;new MutationObserver(l=>l.forEach(x=>x.addedNodes.forEach(n=>{if(n.classList&&n.classList.contains('mfx-rip-box'))window.__rp++}))).observe(document.body,{childList:true})});
  const c2=await p.evaluate(()=>{const c=document.querySelector('.plan-card .cardtop')||document.querySelector('.plan-card');const r=c.getBoundingClientRect();return {x:r.left+8,y:r.top+8}});
  await p.mouse.move(c2.x,c2.y);await p.mouse.down();await p.mouse.up();
  const rp=await p.evaluate(()=>({n:window.__rp,props:[...document.querySelectorAll('.mfx-rip')].flatMap(i=>i.getAnimations()).flatMap(a=>a.effect.getKeyframes()).flatMap(k=>Object.keys(k)).filter(k=>!/^(offset|easing|composite|computedOffset)$/.test(k))}));
  ok(rp.n===1&&rp.props.length&&rp.props.every(k=>/^(transform|opacity)$/.test(k)),'PC: ondinha ao clicar no cartão (só transform/opacity: '+[...new Set(rp.props)].join(',')+')');
  await p.waitForTimeout(700);ok(await p.evaluate(()=>!document.querySelector('.mfx-rip-box')&&e99Mouse.state().ripples===0),'PC: a ondinha some sozinha');
  /* campos de texto: nada */
  await p.evaluate(()=>{go('nfs');scrollTo(0,0)});await p.waitForTimeout(500);
  const inp=await p.evaluate(()=>{const i=[...document.querySelectorAll('#view input:not([type=hidden]),#view textarea,#view select')].find(x=>x.offsetWidth>40);if(!i)return null;const r=i.getBoundingClientRect();return {x:r.left+10,y:r.top+r.height/2}});
  if(inp){await p.mouse.move(inp.x,inp.y,{steps:3});await p.waitForTimeout(300);await p.evaluate(()=>{window.__rp=0});await p.mouse.down();await p.mouse.up();
    const si=await ST(p);ok(!si.shown&&!si.hotB&&await p.evaluate(()=>window.__rp===0),'PC: em campo de texto não há brilho, realce nem ondinha')}
  else ok(false,'PC: campo de texto não encontrado');
  /* conferência (câmera/coletor) e visualizador de imagens: pausa */
  await p.mouse.move(600,500,{steps:3});await p.waitForTimeout(300);
  await p.evaluate(()=>document.body.classList.add('conf-on'));await p.mouse.move(640,520,{steps:3});await p.waitForTimeout(200);
  const sc=await ST(p);await p.evaluate(()=>document.body.classList.remove('conf-on'));
  ok(!sc.shown&&!sc.raf,'PC: durante a conferência o brilho some');
  await p.evaluate(()=>{window.__img=window.e99Img;window.e99Img={state:()=>({open:true})}});await p.mouse.move(600,500,{steps:3});await p.waitForTimeout(200);
  const sv=await ST(p);await p.evaluate(()=>{window.e99Img=window.__img});ok(!sv.shown,'PC: com o visualizador de imagens aberto o brilho some');
  /* aba oculta, janela sem foco e cursor fora da janela: pausa */
  await p.mouse.move(500,400,{steps:3});await p.waitForTimeout(200);
  const hid=await p.evaluate(()=>{const a=e99Mouse.state().shown;Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));const b=e99Mouse.state();delete document.hidden;return {a,b:b.shown,raf:b.raf}});
  ok(hid.a&&!hid.b&&!hid.raf,'PC: aba oculta pausa o brilho');
  await p.mouse.move(520,410,{steps:2});await p.waitForTimeout(100);const bl=await p.evaluate(()=>{window.dispatchEvent(new Event('blur'));return e99Mouse.state().shown});ok(!bl,'PC: janela sem foco pausa o brilho');
  await p.mouse.move(540,420,{steps:2});await p.waitForTimeout(100);const lv=await p.evaluate(()=>{document.dispatchEvent(new MouseEvent('mouseout',{bubbles:true,relatedTarget:null}));return e99Mouse.state().shown});ok(!lv,'PC: cursor fora da janela pausa o brilho');
  /* preferência */
  await p.evaluate(()=>{go('account');scrollTo(0,0)});await p.waitForTimeout(600);
  const pr=await p.evaluate(()=>{const r=document.getElementById('pref-mouse-row');return r?{t:r.textContent,b:document.getElementById('pref-mouse-btn').getAttribute('aria-pressed')}:null});
  ok(pr&&/Animação do mouse/.test(pr.t)&&pr.b==='true','PC: Preferências tem "Animação do mouse" ligada ('+(pr&&pr.b)+')');
  if(pr){await p.click('#pref-mouse-btn');await p.waitForTimeout(200)}
  const off=await p.evaluate(()=>({ls:localStorage.getItem('lojasg.estoque99.mouse-fx'),on:e99Mouse.on(),glow:!!document.getElementById('mfx-glow'),cls:document.body.classList.contains('mfx-on'),b:(document.getElementById('pref-mouse-btn')||{}).textContent}));
  await p.mouse.move(400,300,{steps:4});await p.waitForTimeout(200);const so=await ST(p);
  ok(off.ls==='off'&&!off.on&&!off.glow&&!off.cls&&!so.shown&&/Desligada/.test(off.b||''),'PC: preferência desligada apaga tudo (mouse-fx=off)');
  await p.reload();await p.waitForTimeout(2500);ok(await p.evaluate(()=>!e99Mouse.on()),'PC: preferência desligada continua depois de recarregar');
  await p.evaluate(()=>e99Mouse.set(true));ok(await p.evaluate(()=>e99Mouse.on()&&localStorage.getItem('lojasg.estoque99.mouse-fx')===null),'PC: religar volta ao padrão');
  /* janela estreita (≤900 px): nada */
  await p.setViewportSize({width:880,height:900});await p.waitForTimeout(300);ok(await p.evaluate(()=>!e99Mouse.on()&&!document.getElementById('mfx-glow')),'PC com janela de 880 px: desligado');
  await ctx.close()}
 /* ===== abertura ===== */
 {const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();watch(p,'PC-intro',errs);await p.goto(U);await p.waitForTimeout(600);
  await p.evaluate(()=>{document.body.classList.add('stok-intro-active')});await p.mouse.move(300,300);await p.mouse.move(600,400,{steps:5});await p.waitForTimeout(200);
  const s=await ST(p);ok(s&&!s.shown,'PC: durante a abertura nada aparece');await ctx.close()}
 /* ===== "menos movimento" ===== */
 {const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const p=await ctx.newPage();watch(p,'PC-rm',errs);
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'mfxrm'+T);await p.mouse.move(300,300);await p.mouse.move(700,500,{steps:6});await p.waitForTimeout(300);
  const s=await ST(p);ok(s&&!s.on&&!s.glow&&!s.shown&&s.frames===0,'"menos movimento": nada é criado nem animado');await ctx.close()}
 /* ===== iPhone 13 ===== */
 {const ctx=await b.newContext({...L.devices['iPhone 13']});const p=await ctx.newPage();watch(p,'iPhone',errs);
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'mfxi'+T);await p.evaluate(SEED);await p.evaluate(()=>go('plans'));await p.waitForTimeout(600);
  const c=await p.evaluate(()=>{const e=document.querySelector('.plan-card');const r=e.getBoundingClientRect();return {x:r.left+20,y:r.top+20}});
  await p.touchscreen.tap(c.x,c.y);await p.waitForTimeout(300);await p.evaluate(()=>go('account'));await p.waitForTimeout(500);
  const s=await p.evaluate(()=>({st:e99Mouse.state(),glow:!!document.getElementById('mfx-glow'),rip:!!document.querySelector('.mfx-rip-box'),hot:!!document.querySelector('.mfx-hot'),row:!!document.getElementById('pref-mouse-row'),cls:document.body.classList.contains('mfx-on')}));
  ok(!s.st.on&&!s.glow&&!s.rip&&!s.hot&&!s.row&&!s.cls&&s.st.frames===0,'iPhone 13: nada é criado (sem brilho, ondinha, realce nem preferência)');
  await ctx.close()}
 ok(!errs.length,'0 erro de console'+(errs.length?': '+errs.slice(0,5).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro '+e.message);process.exit(1)});
