/* v91 (só visual): grade Tron só no Início e na entrada, rastros de luz nos cartões visíveis, vidro com desfoque, pulso de luz
   na abertura e ciano neon nos destaques. Tudo para em segundo plano, fora da tela, rolando, com "Pausar animação",
   com Efeitos desligados e com "menos movimento". O som de abertura e a música ambiente ficaram para a v92 (fora do ar). */
const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 const c=await b.newContext({...L.devices['iPhone 13']});await c.addInitScript(()=>{try{localStorage.removeItem('lojasg.estoque99.fx-pause')}catch(e){}});
 const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForSelector('#auth-form input[name=login]');await A.waitForTimeout(1500);
 /* entrada: grade desenhada uma vez num canvas + pulsos de luz correndo; rastro na borda do formulário */
 ok(await A.evaluate(()=>{const g=document.querySelector('#auth-screen>.tron-grid'),cv=g&&g.querySelector('canvas');return !!cv&&cv.width>0&&cv.height>0&&getComputedStyle(g).position==='fixed'}),'grade Tron atrás da tela de entrar (canvas desenhado)');
 ok(await until(A,()=>{const g=document.querySelector('#auth-screen>.tron-grid');return g&&g.__anims&&g.__anims.length===3&&g.__anims.every(a=>a.playState==='running')},null,14000),'pulsos de luz correm pela grade (depois que o S se monta)');
 ok(await until(A,()=>!!document.querySelector('#auth-form .e99-streak.run'),null,8000),'rastro de luz corre pela borda do formulário');
 ok(await A.evaluate(()=>/blur/.test(getComputedStyle(document.getElementById('auth-form')).backdropFilter)),'formulário de entrar é vidro com desfoque');
 /* segundo plano */
 await A.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'))});
 ok(await A.evaluate(()=>{const g=document.querySelector('#auth-screen>.tron-grid');return document.body.classList.contains('e99-hidden')&&g.classList.contains('tg-pause')&&g.__anims.every(a=>a.playState!=='running')}),'em segundo plano a grade para');
 await A.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'))});
 ok(await until(A,()=>{const g=document.querySelector('#auth-screen>.tron-grid');return !g.classList.contains('tg-pause')&&g.__anims.every(a=>a.playState==='running')},null,9000),'volta a animar ao voltar para a tela (depois que o S se monta de novo)');
 /* Pausar animação vale para a grade e o rastro */
 await A.evaluate(()=>e99FxPause(true));
 ok(await until(A,()=>{const g=document.querySelector('#auth-screen>.tron-grid');return g.classList.contains('tg-pause')&&!document.querySelector('.e99-streak.run')},null,3000),'"Pausar animação" para grade e rastro');
 await A.evaluate(()=>e99FxPause(false));
 /* entrar: sem som novo nem música nesta versão (ficaram para a v92) */
 const l='v91'+T;await L.signup(A,l);
 ok(await A.evaluate(()=>typeof window.e99Music==='undefined'&&typeof window.e99Sting==='undefined'&&!document.getElementById('music-btn')&&!document.querySelector('.e99-music')),'sem som de abertura nem música ambiente nesta versão (ficaram para a v92)');
 /* Início: grade só aqui; rastros nos cartões visíveis (no máximo 4 no celular); vidro na barra e no topo */
 await A.evaluate(()=>{go('home');scrollTo(0,0)});await A.waitForTimeout(1200);
 ok(await A.evaluate(()=>{const g=document.querySelector('#view .hero-home>.tron-grid');return !!g&&g.querySelector('canvas').width>0}),'grade Tron no topo do Início');
 ok(await until(A,()=>{const n=document.querySelectorAll('#view .e99-streak.run').length;return n>0&&n<=4},null,12000),'rastros de luz nos cartões visíveis (até 4 no celular)');
 ok(await A.evaluate(()=>/blur/.test(getComputedStyle(document.querySelector('header')).backdropFilter)&&/blur/.test(getComputedStyle(document.getElementById('mobile-bottom')).backdropFilter)),'topo e barra de baixo em vidro com desfoque');
 ok(await A.evaluate(()=>/@supports not/.test(document.getElementById('v91-css').textContent)),'sem suporte a desfoque: fundo sólido');
 ok(await A.evaluate(()=>/cubic-bezier\(0\.34, 1\.56, 0\.64, 1\)/.test(getComputedStyle(document.querySelector('#view button.primary')).transitionTimingFunction)),'botão principal com resposta de mola');
 ok(await A.evaluate(()=>{const h=document.querySelector('#view .hero h1');return parseFloat(getComputedStyle(h).letterSpacing)>=parseFloat(getComputedStyle(h).fontSize)*.035}),'títulos com espaçamento largo (Daft Punk)');
 ok(await A.evaluate(()=>{const c=x=>getComputedStyle(x).backgroundColor;const btn=document.querySelector('#view button.primary'),w=document.querySelector('#view .accent-word');return c(btn)==='rgb(46, 230, 255)'&&getComputedStyle(w).color==='rgb(46, 230, 255)'}),'destaques em ciano neon (botão principal e palavra de destaque)');
 /* rolando: rastros somem e a grade para */
 await A.evaluate(()=>dispatchEvent(new Event('scroll')));ok(await A.evaluate(()=>document.body.classList.contains('e99-scrolling')&&[...document.querySelectorAll('.e99-streak')].every(e=>!e.__a||e.__a.playState!=='running')&&getComputedStyle(document.querySelector('.e99-streak')).display==='none'),'rolando: rastros somem e param');
 await A.waitForTimeout(600);
 /* fora da tela: grade para */
 await A.evaluate(()=>{const s=document.createElement('div');s.style.height='3000px';s.id='v91-spacer';document.getElementById('view').appendChild(s);scrollTo(0,2500)});
 ok(await until(A,()=>{const g=document.querySelector('#view .hero-home>.tron-grid');return g.classList.contains('tg-pause')&&g.__anims.every(a=>a.playState!=='running')},null,4000),'grade fora da tela fica parada');
 await A.evaluate(()=>{document.getElementById('v91-spacer').remove();scrollTo(0,0)});
 /* outras telas: sem grade visível */
 await A.evaluate(()=>go('nfs'));await A.waitForTimeout(800);
 ok(await A.evaluate(()=>[...document.querySelectorAll('.tron-grid')].every(g=>!g.isConnected||!g.getClientRects().length||g.closest('[hidden]'))),'nas outras telas não há grade');
 /* Efeitos desligados: tudo parado, a grade continua bonita (desenho fixo) */
 await A.evaluate(()=>{go('home');if(visualEffectsOn())toggleVisualEffects()});await A.waitForTimeout(700);
 ok(await A.evaluate(()=>{const g=document.querySelector('#view .hero-home>.tron-grid');return g.querySelector('canvas').width>0&&g.classList.contains('tg-pause')&&!document.querySelector('.e99-streak.run')&&getComputedStyle(g).animationName==='none'}),'Efeitos desligados: grade parada e sem rastros');
 await A.evaluate(()=>toggleVisualEffects());
 /* abertura: pulso de luz (e nada disso com "menos movimento") */
 await A.evaluate(()=>playStokIntro());await A.waitForSelector('#stok-intro');
 ok(await A.evaluate(()=>getComputedStyle(document.getElementById('stok-intro'),'::before').animationName==='si-pulse'),'pulso de luz na abertura');
 await c.close();
 const rc=await b.newContext({...L.devices['iPhone 13'],reducedMotion:'reduce'});const R=await rc.newPage();R.on('pageerror',e=>errs.push(e.message));
 await R.goto('http://localhost:8000/index.html?ntfy='+L.N);await R.waitForSelector('#auth-form');await R.waitForTimeout(1500);
 ok(await R.evaluate(()=>{const g=document.querySelector('#auth-screen>.tron-grid');return document.body.classList.contains('fx-off')&&g.classList.contains('tg-pause')&&!document.querySelector('.e99-streak.run')}),'"menos movimento": grade parada e sem rastros');
 await R.evaluate(()=>playStokIntro());await R.waitForSelector('#stok-intro');ok(await R.evaluate(()=>getComputedStyle(document.getElementById('stok-intro'),'::before').display==='none'),'"menos movimento": sem pulso de luz');
 await rc.close();
 console.log('errors',errs);await b.close()})();
