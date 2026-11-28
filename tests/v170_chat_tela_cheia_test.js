/* v170: chat em tela cheia no celular (390×844): sem a barra de cima do app e sem a de baixo; o chat ocupa a altura toda,
   cabeçalho do chat no topo, campo embaixo; "Mais" (⋯) mostra equipe sincronizada, buscar, convidar e sair; o PC (1440×900) não muda. */
const L=require('./lib.js');const {ok}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 const B=await (await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:L.devices['iPhone 13'].userAgent})).newPage();
 B.on('pageerror',e=>errs.push(e.message));B.on('response',r=>{if(r.status()===404)errs.push('404 '+r.url())});B.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(B,'tc'+T),'iPhone: gestor com equipe');await B.addStyleTag({content:'.firebase-emulator-warning,#toast{display:none!important}'});
 await B.evaluate(()=>{go('home')});await B.waitForTimeout(400);await B.evaluate(()=>{go('chat')});await B.waitForTimeout(1200);
 await B.evaluate(()=>chatSend('Teste tela cheia'));await B.waitForTimeout(1200);
 const m=await B.evaluate(()=>{const q=s=>document.querySelector(s),R=s=>q(s).getBoundingClientRect(),vis=s=>{const e=q(s);return !!e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0};
   return {cls:document.body.classList.contains('v170cf'),hdr:vis('#main-content>header'),nav:vis('#mobile-bottom'),wrap:[R('.chat-wrap').top,R('.chat-wrap').height],head:R('.chat-wrap .chat-head').top,
     comp:R('.chat-wrap .chat-compose').bottom,ih:innerHeight,more:vis('.chat-head .v170-more')?R('.chat-head .v170-more').height:0,sw:document.documentElement.scrollWidth,
     extras:vis('#chat-extras')||vis('.chat-leave-row')}});
 ok(m.cls&&!m.hdr&&!m.nav,'iPhone: no Chat some a barra de cima do app e a barra de baixo');
 ok(Math.abs(m.wrap[0])<=1&&Math.abs(m.wrap[1]-m.ih)<=2&&m.head<60&&Math.abs(m.comp-m.ih)<=2,'iPhone: chat na altura toda, cabeçalho no topo e campo embaixo ('+m.wrap.map(Math.round).join('/')+', campo até '+Math.round(m.comp)+' de '+m.ih+')');
 ok(m.more>=44&&!m.extras&&m.sw<=390,'iPhone: botão Mais (⋯) de 44 px, extras escondidos, sem rolagem lateral');
 await B.click('.chat-head .v170-more');await B.waitForTimeout(300);
 ok(await B.evaluate(()=>{const v=s=>{const e=document.querySelector(s);return !!e&&getComputedStyle(e).display!=='none'};return v('#chat-extras')&&v('.chat-leave-row')&&/Sair da equipe/.test(document.querySelector('.chat-leave-row').innerText)}),'iPhone: Mais mostra equipe sincronizada, buscar, convidar e sair');
 await B.keyboard.press('Escape');await B.waitForTimeout(200);
 ok(await B.evaluate(()=>!document.body.classList.contains('v170-x')),'iPhone: Esc fecha o Mais');
 await B.evaluate(()=>go('home'));await B.waitForTimeout(500);
 ok(await B.evaluate(()=>!document.body.classList.contains('v170cf')&&getComputedStyle(document.querySelector('#main-content>header')).display!=='none'&&getComputedStyle(document.querySelector('#mobile-bottom')).display!=='none'),'iPhone: fora do Chat as barras voltam');
 ok(await B.evaluate(()=>typeof e99ChatBack==='function'),'seta da lista usa a volta da v157 (e99ChatBack)');
 const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();A.on('pageerror',e=>errs.push('PC '+e.message));
 await A.goto('http://localhost:8000/index.html');await A.waitForTimeout(2000);await L.signup(A,'tp'+T);await A.evaluate(()=>go('chat'));await A.waitForTimeout(800);
 ok(await A.evaluate(()=>!document.body.classList.contains('v170cf')&&getComputedStyle(document.querySelector('#main-content>header')).display!=='none'),'PC: chat com a barra de cima, sem tela cheia');
 ok(!errs.length,'0 erro e 0 404 ('+errs.slice(0,3).join(' | ')+')');
 await b.close()})();
