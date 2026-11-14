/* v141 (pedido do dono: "não quero que o app abra enquanto não clicar no botão de entrar"). PC 1440×900 e iPhone 13.
   - abertura do app fica parada no quadro final, sem prazo (>6 s), cobrindo tudo; nada por baixo é clicável/focável;
   - botão "Entrar" visível, ≥44 px, focado, diálogo com rótulo; nenhum rAF/animação rodando enquanto espera;
   - toque → som de abertura uma vez, abertura some, formulário de entrar usável;
   - conta "Manter conectado" → recarregar: abertura na frente do Início; Enter no teclado abre o Início;
   - janela (showModal) aberta por baixo espera o toque; "menos movimento": quadro final parado + botão;
   - 0 erro de console. */
const L=require('./lib.js');const {ok,until}=L;const U='http://localhost:8000/index.html?ntfy='+L.N;
const GATE=()=>{try{sessionStorage.removeItem('e99-intro');localStorage.setItem('e99-test-gate','1');localStorage.removeItem('e99-test-autointro')}catch(e){}};
const SPY=()=>{const r0=window.requestAnimationFrame.bind(window);window.__rafAfter=0;
  window.requestAnimationFrame=function(cb){const st=(new Error().stack)||'';if(/intro\.js/.test(st)&&window.__e99IntroStats&&window.__e99IntroStats.done)window.__rafAfter++;return r0(cb)}};
const SHOT=process.env.SHOT||'';
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
for(const [nome,opt] of [['PC',{viewport:{width:1440,height:900}}],['iPhone',L.devices['iPhone 13']]]){
 const watch=(p,tag)=>{p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|ERR_|ntfy|firebase|firestore|googleapis|status of 4\d\d/i.test(m.text()))errs.push(tag+' console: '+m.text())})};
 const ctx=await b.newContext(opt);await ctx.addInitScript(GATE);await ctx.addInitScript(SPY);const p=await ctx.newPage();watch(p,nome);p.on('dialog',d=>d.accept());
 const t0=Date.now();await p.goto(U);
 ok(await until(p,()=>!!document.querySelector('#stok-intro #si-enter'),null,4000),nome+': abertura do app com o botão "Entrar"');
 ok(await until(p,()=>window.__e99IntroStats&&window.__e99IntroStats.done,null,6000),nome+': animação chega ao quadro final');
 await p.waitForTimeout(Math.max(0,6800-(Date.now()-t0)));
 ok(await p.evaluate(()=>!!document.getElementById('stok-intro')&&window.e99IntroHeld()),nome+': depois de 6,8 s sem toque a abertura continua na frente');
 const st=await p.evaluate(()=>{const i=document.getElementById('stok-intro'),bt=document.getElementById('si-enter'),r=bt.getBoundingClientRect(),cs=getComputedStyle(bt);
   const f=document.querySelector('#auth-form input[name=login]'),fr=f.getBoundingClientRect(),hit=document.elementFromPoint(fr.left+fr.width/2,fr.top+fr.height/2);
   return {text:bt.textContent,w:r.width,h:r.height,inView:r.top>=0&&r.bottom<=innerHeight,op:+cs.opacity,vis:cs.visibility,focus:document.activeElement===bt,role:i.getAttribute('role'),modal:i.getAttribute('aria-modal'),label:i.getAttribute('aria-label')||'',
     hidden:i.getAttribute('aria-hidden'),hitIntro:!!(hit&&hit.closest('#stok-intro')),inert:!!f.closest('[inert]'),pe:getComputedStyle(i).pointerEvents,bg:getComputedStyle(i).backgroundColor,
     rafAfter:window.__rafAfter,running:window.e99IntroRunning(),anims:document.getAnimations().filter(a=>a.playState==='running').length,canvas:!!i.querySelector('canvas.si-canvas'),sounds:window.__e99LoginSounds||0}});
 ok(st.text==='Entrar'&&st.w>=44&&st.h>=44&&st.inView&&st.op===1&&st.vis==='visible',nome+': botão "Entrar" visível e ≥44 px ('+Math.round(st.w)+'×'+Math.round(st.h)+')');
 ok(st.focus,nome+': botão recebe o foco');
 ok(st.role==='dialog'&&st.modal==='true'&&/Entrar/.test(st.label)&&st.hidden===null,nome+': abertura é diálogo com rótulo para o leitor de tela');
 ok(st.hitIntro&&st.inert&&st.pe==='auto'&&st.bg==='rgb(0, 0, 0)',nome+': nada por baixo é tocável (abertura cobre, resto inerte)');
 ok(st.rafAfter===0&&!st.running&&st.anims===0&&st.canvas,nome+': parada no quadro final sem rAF nem animação rodando');
 ok(st.sounds===0,nome+': som de abertura espera o toque');
 let blocked=false;try{await p.click('#auth-form input[name=login]',{timeout:1200})}catch(e){blocked=true}ok(blocked,nome+': clicar no campo de login por baixo não funciona');
 await p.keyboard.press('Tab');ok(await p.evaluate(()=>{const a=document.activeElement;return !a||a===document.body||!!a.closest('#stok-intro')}),nome+': Tab não sai da abertura');
 /* janela aberta por baixo espera o toque */
 await p.evaluate(()=>{const d=document.createElement('dialog');d.id='t141';d.textContent='teste';document.body.appendChild(d);d.showModal()});
 ok(await p.evaluate(()=>!document.getElementById('t141').open),nome+': janela aberta por baixo espera');
 if(SHOT&&nome==='iPhone')await p.screenshot({path:SHOT});
 if(nome==='PC')await p.click('#si-enter');else await p.tap('#si-enter');
 ok(await until(p,()=>!document.getElementById('stok-intro'),null,1500),nome+': tocar em "Entrar" tira a abertura');
 ok(await until(p,()=>window.__e99LoginSounds===1,null,4000),nome+': som de abertura toca uma vez');
 ok(await p.evaluate(()=>document.getElementById('t141').open&&(document.getElementById('t141').close(),document.getElementById('t141').remove(),true)),nome+': a janela que esperava abre depois do toque');
 ok(await p.evaluate(()=>!document.querySelector('[inert]')&&!window.e99IntroHeld()),nome+': nada fica inerte depois');
 await until(p,()=>!!window.__e99Boot&&!document.body.classList.contains('e99-booting'),null,8000);
 await p.fill('#auth-form input[name=login]','x'+T);ok(await p.evaluate(()=>document.activeElement&&document.activeElement.name==='login'),nome+': formulário de entrar usável');
 await p.fill('#auth-form input[name=login]','');
 /* conta com "Manter conectado" */
 const l='ent'+T+nome.toLowerCase();await L.signup(p,l);await p.evaluate(async()=>{dirty=false;await authLogout()});await p.reload();
 if(await p.$('#si-enter'))await p.click('#si-enter');await until(p,()=>!document.getElementById('stok-intro'),null,3000);
 await p.waitForSelector('#auth-form input[name=password]');await until(p,()=>!document.body.classList.contains('e99-booting'),null,8000);
 await p.fill('#auth-form input[name=login]',l);await p.fill('#auth-form input[name=password]','1234');const cb=await p.$('#auth-form input[name=remember]');if(cb&&!(await cb.isChecked()))await cb.check();
 await p.click('#auth-form button[type=submit]');ok(await until(p,()=>!!authSession,null,15000),nome+': entrou com "Manter conectado"');await p.waitForTimeout(1500);
 const s0=await p.evaluate(()=>window.__e99LoginSounds||0);
 await p.reload();ok(await until(p,()=>!!document.getElementById('si-enter'),null,4000),nome+' conectado: abertura com "Entrar" ao reabrir');
 ok(await until(p,()=>!!authSession&&!!document.querySelector('#view .hero-home, #view'),null,12000),nome+' conectado: app já logado por baixo');
 await p.waitForTimeout(1500);
 ok(await p.evaluate(()=>!!document.getElementById('stok-intro')&&window.e99IntroHeld()&&!!document.querySelector('#view').closest('[inert]')),nome+' conectado: Início coberto e inerte até tocar');
 await p.keyboard.press('Enter');
 ok(await until(p,()=>!document.getElementById('stok-intro'),null,1500),nome+' conectado: Enter no teclado abre');
 ok(await p.evaluate(()=>!!authSession&&!document.querySelector('[inert]')&&!!document.querySelector('#view')&&document.querySelector('#view').getBoundingClientRect().height>50),nome+' conectado: mostra o Início');
 ok(await until(p,()=>window.__e99LoginSounds===1,null,4000),nome+' conectado: som uma vez ('+s0+' antes de recarregar)');
 await p.evaluate(async()=>{dirty=false;document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});await authLogout()});
 await ctx.close();
 /* menos movimento */
 const rc=await b.newContext({...opt,reducedMotion:'reduce'});await rc.addInitScript(GATE);await rc.addInitScript(SPY);const rp=await rc.newPage();watch(rp,nome+' reduzido');
 await rp.goto(U);ok(await until(rp,()=>!!document.getElementById('si-enter'),null,4000),nome+' menos movimento: botão "Entrar"');
 ok(await rp.evaluate(()=>window.e99IntroRunning()&&!window.__e99IntroStats.done),nome+' menos movimento: abertura anima (v146, decisão do dono)');
 await rp.waitForTimeout(6500);
 ok(await rp.evaluate(()=>{const bt=document.getElementById('si-enter');return !!bt&&+getComputedStyle(bt).opacity===1&&document.activeElement===bt&&!window.e99IntroRunning()&&window.__e99IntroStats.done&&window.__rafAfter===0&&getComputedStyle(document.querySelector('#stok-intro .si-word')).opacity==='1'}),nome+' menos movimento: animou, parou no quadro final sem rAF + botão focado, sem prazo (v146)');
 await rp.keyboard.press('Space');ok(await until(rp,()=>!document.getElementById('stok-intro'),null,1500),nome+' menos movimento: Espaço abre');
 await rc.close()}
/* v146: botão "Entrar" no vermelho da marca, letra branca, contraste ≥4,5, sem contorno branco, igual nos 3 temas */
{const lum=c=>{const m=c.match(/\d+(\.\d+)?/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])};
 const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
 for(const tema of ['lilas','violeta','cinza']){const c=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});await c.addInitScript(GATE);await c.addInitScript(t=>{try{localStorage.setItem('lojasg.estoque99.ui-theme',t)}catch(e){}},tema);const p=await c.newPage();
  await p.goto(U);await until(p,()=>!!document.getElementById('si-enter'),null,4000);await p.waitForTimeout(300);
  const cs=await p.evaluate(()=>{const s=getComputedStyle(document.getElementById('si-enter'));return {th:document.documentElement.getAttribute('data-e99-theme'),bg:s.backgroundColor,img:s.backgroundImage,color:s.color,bw:s.borderTopWidth,sh:s.boxShadow,ol:s.outlineStyle==='none'?'':s.outlineColor+' '+s.outlineWidth}});
  const stops=(cs.img.match(/rgba?\([^)]+\)/g)||[]).concat([cs.bg]);const minR=Math.min(...stops.map(x=>ratio(x,cs.color)));
  ok(cs.th===tema&&cs.bg==='rgb(219, 35, 24)'&&/rgb\(224, 40, 28\)/.test(cs.img),tema+': botão "Entrar" vermelho da marca (#DB2318, gradiente '+stops.length+' cores)');
  ok(cs.color==='rgb(255, 255, 255)'&&minR>=4.5,tema+': letra branca, contraste '+minR.toFixed(2)+':1 (≥4,5)');
  ok(cs.bw==='0px'&&!/rgba?\(255, 255, 255(, 0\.[2-9]\d*|, 1)?\) 0px 0px 0px [2-9]/.test(cs.sh)&&/rgba\(255, 42, 31/.test(cs.sh),tema+': sem contorno branco grosso, anel/brilho vermelho');
  ok(!/rgb\(255, 255, 255\)/.test(cs.ol),tema+': sem contorno branco ao aparecer ('+(cs.ol||'sem contorno')+')');
  await p.keyboard.press('Shift');const ol2=await p.evaluate(()=>{const s=getComputedStyle(document.getElementById('si-enter'));return document.activeElement.id+' '+s.outlineColor+' '+s.outlineWidth});
  ok(/^si-enter rgb\(255, 255, 255\) 3px/.test(ol2),tema+': com o teclado o foco fica bem visível ('+ol2+')');
  await c.close()}}
/* falha segura: erro ao montar o canvas não prende; botão aparece do mesmo jeito */
{const c=await b.newContext({viewport:{width:1440,height:900}});await c.addInitScript(GATE);await c.addInitScript(()=>{HTMLCanvasElement.prototype.getContext=function(){throw new Error('sem canvas')}});const p=await c.newPage();
 await p.goto(U);ok(await until(p,()=>!!document.getElementById('si-enter'),null,4000),'PC sem canvas: botão "Entrar" aparece mesmo assim');await p.click('#si-enter');ok(await until(p,()=>!document.getElementById('stok-intro'),null,1500),'PC sem canvas: toque abre');await c.close()}
/* depois do login (não é a abertura do app): continua sumindo sozinha */
{const c=await b.newContext({viewport:{width:1440,height:900}});const p=await c.newPage();await p.goto(U);await p.waitForSelector('#auth-form');await p.evaluate(()=>{window.replayEntrySplash()});
 ok(await p.evaluate(()=>!!document.getElementById('stok-intro')&&!document.getElementById('si-enter')&&!window.e99IntroHeld()),'replayEntrySplash: sem botão');ok(await until(p,()=>!document.getElementById('stok-intro'),null,4000),'replayEntrySplash: some sozinha');await c.close()}
ok(!errs.length,'sem erros de página/console'+(errs.length?': '+errs.slice(0,4).join(' | '):''));
await b.close()})();
