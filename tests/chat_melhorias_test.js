/* v106: chat da equipe — rolagem (fim, não pular ao ler, "N novas mensagens"), rascunho que não se perde, Enter/Shift+Enter,
   "Enviando…"/"Não enviada" com Tentar de novo (sem duplicar), separador de mensagens novas, aviso para leitor de tela,
   rótulos (aria-label), foco (Tab, contorno, menu com Esc), toque ≥44 px, sem rolagem lateral no iPhone e coluna central no PC. */
const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();const B=await (await b.newContext(L.devices['iPhone 13'])).newPage();
 [A,B].forEach((p,i)=>{p.on('pageerror',e=>errs.push((i?'iPhone ':'PC ')+e.message));p.on('dialog',d=>d.accept())});
 ok(await L.gestorWithTeam(A,'cm'+T),'PC: gestor com equipe');const code=await A.evaluate(()=>e99Team.get().code);
 await B.goto('http://localhost:8000/index.html?ntfy='+L.N);await B.waitForTimeout(2500);await L.signup(B,'cmb'+T);
 await B.evaluate(c=>e99Team.join(c,'Ana'),code);await B.evaluate(()=>{go('chat');scrollTo(0,0)});await B.waitForTimeout(800);
 const msgs=(p)=>p.evaluate(()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].map(m=>m.querySelector('.chat-txt')?m.querySelector('.chat-txt').innerText:''));
 const atEnd=(p)=>p.evaluate(()=>{const l=document.getElementById('chat-list');return l.scrollHeight-l.scrollTop-l.clientHeight<6});

 /* rótulos e estrutura */
 for(const [n,P] of [['PC',A],['iPhone',B]]){
  const r=await P.evaluate(()=>{const w=document.querySelector('.chat-wrap');const sem=[...w.querySelectorAll('button,textarea,input:not([type=file]):not([type=hidden]),select,summary')].filter(e=>e.offsetParent!==null||e.closest('#chat-list')).filter(e=>!((e.getAttribute('aria-label')||'').trim()||(e.textContent||'').trim()||(e.getAttribute('title')||'').trim()||(e.labels&&e.labels.length&&e.labels[0].textContent.trim()))).map(e=>e.outerHTML.slice(0,80));
   const l=document.getElementById('chat-list'),t=document.getElementById('chat-text'),a=document.getElementById('chat-ann');
   return {sem,log:l.getAttribute('role')==='log'&&l.getAttribute('aria-live')==='off'&&!!l.getAttribute('aria-labelledby'),txt:!!t.getAttribute('aria-label')&&t.getAttribute('enterkeyhint')==='send',ann:a&&a.getAttribute('role')==='status'&&a.getAttribute('aria-live')==='polite',
    files:[...w.querySelectorAll('input[type=file]')].every(i=>i.hidden),fbtn:!!w.querySelector('button[aria-label="Tirar foto"]')&&!!w.querySelector('button[aria-label="Enviar foto da galeria"]')}});
  ok(!r.sem.length,n+': todo botão/campo do chat tem nome acessível'+(r.sem.length?' — sem nome: '+r.sem.join(' | '):''));
  ok(r.log&&r.txt&&r.ann,n+': lista role=log sem ler tudo (aria-live=off), campo com aria-label e área de aviso role=status');
  ok(r.files&&r.fbtn,n+': câmera e galeria são botões de verdade (alcançáveis pelo teclado)')}

 /* rolagem: abre no fim */
 for(let i=1;i<=24;i++)await A.evaluate(t=>chatSend(t),'Mensagem número '+i+' para encher a lista');
 ok(await until(A,()=>document.querySelectorAll('#chat-list .chat-msg[data-id]').length>=24),'PC: 24 mensagens na lista');
 await A.waitForTimeout(600);ok(await atEnd(A),'PC: a lista fica no fim depois de enviar');
 ok(await until(B,()=>document.querySelectorAll('#chat-list .chat-msg[data-id]').length>=24,null,25000),'iPhone: recebe as 24 mensagens');
 await B.waitForTimeout(800);ok(await atEnd(B),'iPhone: a lista fica no fim ao receber (estava no fim)');
 await B.evaluate(()=>go('home'));await B.waitForTimeout(400);await B.evaluate(()=>go('chat'));await B.waitForTimeout(1200);ok(await atEnd(B),'iPhone: ao abrir o chat a lista começa no fim');
 /* lendo mensagens antigas: chegar mensagem não pula; aparece "1 nova mensagem" */
 await B.evaluate(()=>{const l=document.getElementById('chat-list');l.scrollTop=0;l.dispatchEvent(new Event('scroll'))});await B.waitForTimeout(300);
 await A.evaluate(()=>chatSend('Chegou enquanto a Ana lia'));
 ok(await until(B,()=>{const j=document.getElementById('chat-jump');return j&&!j.hidden&&/1 nova mensagem/.test(j.innerText)},null,20000),'iPhone: lendo o histórico, aparece o botão "1 nova mensagem"');
 ok(await B.evaluate(()=>document.getElementById('chat-list').scrollTop<40),'iPhone: a lista não pulou para o fim enquanto lia');
 const jb=await B.evaluate(()=>{const r=document.getElementById('chat-jump').getBoundingClientRect();return Math.min(r.width,r.height)});ok(jb>=44,'iPhone: botão de ir para o fim com toque ≥44 px');
 await B.tap('#chat-jump');ok(await until(B,()=>{const l=document.getElementById('chat-list');return l.scrollHeight-l.scrollTop-l.clientHeight<6&&document.getElementById('chat-jump').hidden},null,5000),'iPhone: tocar no botão vai para o fim e o botão some');

 /* Enter envia, Shift+Enter quebra a linha (PC) */
 await A.click('#chat-text');await A.keyboard.type('linha um');await A.keyboard.press('Shift+Enter');await A.keyboard.type('linha dois');
 ok(await A.inputValue('#chat-text')==='linha um\nlinha dois','PC: Shift+Enter quebra a linha sem enviar');
 await A.keyboard.press('Enter');ok(await until(A,()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].some(x=>x.innerText==='linha um\nlinha dois')),'PC: Enter envia (com a quebra de linha)');
 ok(await A.inputValue('#chat-text')==='','PC: campo limpo depois de enviar');
 ok(await A.evaluate(()=>document.activeElement&&document.activeElement.id==='chat-text'),'PC: o foco continua no campo depois de enviar');

 /* rascunho não se perde quando a tela é redesenhada (sincronização) nem ao trocar de tela */
 await A.fill('#chat-text','rascunho importante');await A.evaluate(()=>document.activeElement.blur());await A.evaluate(()=>render());await A.waitForTimeout(400);
 ok(await A.inputValue('#chat-text')==='rascunho importante','PC: rascunho fica depois do redesenho da tela');
 await A.evaluate(()=>go('nfs'));await A.waitForTimeout(300);await A.evaluate(()=>go('chat'));await A.waitForTimeout(500);
 ok(await A.inputValue('#chat-text')==='rascunho importante','PC: rascunho fica ao sair e voltar para o chat');await A.fill('#chat-text','');

 /* erro de envio: "Não enviada" + Tentar de novo, sem duplicar */
 await A.evaluate(()=>{window.__f=window.fetch;window.fetch=function(u,o){if(o&&o.method==='POST'&&/\/e99-[0-9a-f]{24}$/.test(String(u)))return Promise.resolve(new Response('x',{status:500}));return window.__f.apply(this,arguments)}});
 await A.fill('#chat-text','falhou da primeira vez');await A.press('#chat-text','Enter');
 ok(await until(A,()=>{const f=document.querySelector('#chat-list .chat-msg.failed');return f&&/Não enviada/.test(f.innerText)&&!!f.querySelector('.chat-retry')},null,8000),'PC: falha de envio mostra "Não enviada" com Tentar de novo');
 ok(await until(A,()=>/não enviada/i.test(document.getElementById('chat-ann').textContent),null,3000),'PC: falha avisada ao leitor de tela');
 await A.evaluate(()=>{window.fetch=window.__f});await A.click('#chat-list .chat-msg.failed .chat-retry');
 ok(await until(A,()=>!document.querySelector('#chat-list .chat-msg.failed')&&[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].filter(x=>x.innerText==='falhou da primeira vez').length===1,null,10000),'PC: Tentar de novo envia uma vez só');
 ok(await until(B,()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].filter(x=>x.innerText==='falhou da primeira vez').length===1,null,20000),'iPhone: recebe a mensagem reenviada uma vez só');
 await A.waitForTimeout(2500);ok((await msgs(A)).filter(x=>x==='falhou da primeira vez').length===1,'PC: eco do ntfy não duplica');

 /* separador de mensagens novas + aviso para leitor de tela */
 await B.evaluate(()=>go('home'));await B.waitForTimeout(1600);await A.evaluate(async()=>{await chatSend('Não lida um');await chatSend('Não lida dois')});
 ok(await until(B,()=>!!document.querySelector('.nav-unread'),null,20000),'iPhone: contador de não lidas aparece');
 await B.evaluate(()=>go('chat'));ok(await until(B,()=>{const s=document.getElementById('chat-new');const n=s&&s.nextElementSibling;return !!(n&&/Não lida um/.test(n.innerText))},null,8000),'iPhone: separador "Mensagens novas" antes da primeira não lida');
 await A.evaluate(()=>chatSend('Aviso para leitor de tela'));
 ok(await until(B,()=>/Mensagem de Vitor: Aviso para leitor/.test(document.getElementById('chat-ann').textContent),null,20000),'iPhone: só a mensagem nova é anunciada (role=status)');

 /* foco: Tab sai do campo para os botões; contorno visível; menu da mensagem abre pelo teclado e Esc devolve o foco */
 await A.focus('#chat-text');await A.keyboard.press('Tab');
 ok(await A.evaluate(()=>!!document.activeElement.closest('.chat-btns')),'PC: Tab vai do campo para os botões de enviar');
 ok(await A.evaluate(()=>{const s=getComputedStyle(document.activeElement);return s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>=2}),'PC: foco visível (contorno ≥2 px)');
 await A.evaluate(()=>{const l=[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].pop();l.querySelector('.chat-opt-btn').focus()});await A.keyboard.press('Enter');
 ok(await until(A,()=>{const m=document.getElementById('msg-menu');return m&&m.getAttribute('aria-modal')==='true'&&m.contains(document.activeElement)},null,3000),'PC: opções da mensagem abrem pelo teclado com o foco dentro');
 await A.keyboard.press('Escape');ok(await A.evaluate(()=>!document.getElementById('msg-menu')&&document.activeElement.classList.contains('chat-opt-btn')),'PC: Esc fecha as opções e o foco volta ao botão');
 ok(await A.evaluate(()=>{const m=[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].pop();m.dispatchEvent(new MouseEvent('mouseover',{bubbles:true}));return !!m.querySelector('.chat-re-btn')&&!!m.querySelector('.chat-del-btn')}),'PC: responder e apagar continuam em cada mensagem');

 /* mensagem longa: "Ver mais" */
 await A.evaluate(()=>chatSend('Texto longo. '+'conferir a validade dos produtos da gôndola '.repeat(14)));
 ok(await until(A,()=>!!document.querySelector('#chat-list .chat-msg.long .chat-more')),'PC: mensagem longa mostra "Ver mais"');
 await A.click('#chat-list .chat-msg.long .chat-more >> nth=-1');ok(await A.evaluate(()=>[...document.querySelectorAll('#chat-list .chat-msg.long')].pop().querySelector('.chat-more').getAttribute('aria-expanded')==='true'),'PC: "Ver mais" abre a mensagem (aria-expanded)');

 /* celular: toques ≥44 px, apagar pelas opções, sem rolagem lateral */
 const small=await B.evaluate(()=>[...document.querySelectorAll('.chat-wrap .chat-btns button,#chat-send,#chat-list .chat-opt-btn,.chat-head-acts button,.chat-leave')].filter(e=>e.offsetParent!==null).map(e=>{const r=e.getBoundingClientRect();return [e.className||e.id,Math.round(r.width),Math.round(r.height)]}).filter(x=>x[1]<44||x[2]<44));
 ok(!small.length,'iPhone: botões do chat com toque ≥44 px'+(small.length?' — '+JSON.stringify(small.slice(0,4)):''));
 ok(await B.evaluate(()=>{const m=document.querySelector('#chat-list .chat-msg[data-id] .chat-del-btn');return m&&m.getBoundingClientRect().height===0}),'iPhone: lixeira não ocupa a bolha (fica nas opções)');
 await B.evaluate(()=>chatSend('Apagar pelo menu'));await until(B,()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].some(m=>/Apagar pelo menu/.test(m.innerText)));
 await B.evaluate(()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].find(m=>/Apagar pelo menu/.test(m.innerText)).querySelector('.chat-opt-btn').click());
 ok(await until(B,()=>!!document.querySelector('#msg-menu [data-a=del]'),null,3000),'iPhone: opções da mensagem têm "Apagar deste aparelho"');
 await B.click('#msg-menu [data-a=del]');ok(await until(B,()=>![...document.querySelectorAll('#chat-list .chat-msg')].some(m=>/Apagar pelo menu/.test(m.innerText))),'iPhone: apaga pela lista de opções');
 ok(await B.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.getElementById('chat-list').scrollWidth<=document.getElementById('chat-list').clientWidth+1),'iPhone: sem rolagem lateral (página e lista)');
 ok(await B.evaluate(()=>{const c=document.querySelector('.chat-compose').getBoundingClientRect(),n=document.querySelector('.mobile-bottom');return !n||c.bottom<=n.getBoundingClientRect().top+1||scrollY>0}),'iPhone: campo de escrever cabe acima da barra de baixo');
 ok(await B.evaluate(()=>{const w=document.querySelector('.chat-wrap').getBoundingClientRect();return w.left>=12&&innerWidth-w.right>=12}),'iPhone: margem lateral de ~16 px');
 await B.locator('.chat-wrap').screenshot({path:require('os').tmpdir()+'/stok-chat-v106-iphone.png'});

 /* PC: coluna central legível, lista sem rolagem lateral, campo visível sem rolar a página */
 ok(await A.evaluate(()=>{const w=document.querySelector('.chat-wrap').getBoundingClientRect();return w.width<=921}),'PC: chat numa coluna central (≤920 px)');
 ok(await A.evaluate(()=>{const l=document.getElementById('chat-list');return l.scrollWidth<=l.clientWidth+1&&document.documentElement.scrollWidth<=innerWidth}),'PC: sem rolagem lateral');
 ok(await A.evaluate(()=>{scrollTo(0,0);return document.querySelector('#chat-form').getBoundingClientRect().bottom<=innerHeight}),'PC: campo de escrever aparece sem rolar a página');
 ok(await A.evaluate(()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].every(m=>m.getBoundingClientRect().width<=621)),'PC: bolhas com no máximo 620 px (linhas legíveis)');
 ok(await A.evaluate(()=>!document.getElementById('chat-new')),'PC: mensagem que chega com o chat aberto não vira "Mensagens novas"');
 await A.screenshot({path:require('os').tmpdir()+'/stok-chat-v106-pc.png'});

 /* menos movimento / Efeitos desligados: sem animação no chat */
 await A.emulateMedia({reducedMotion:'reduce'});await A.evaluate(()=>render());await A.waitForTimeout(400);
 ok(await A.evaluate(()=>document.querySelector('.chat-wrap').classList.contains('still')),'PC: "menos movimento" deixa o chat parado');
 await A.emulateMedia({reducedMotion:'no-preference'});await A.evaluate(()=>{try{localStorage.setItem('lojasg.estoque99.fx-pause','1')}catch(e){}render()});await A.waitForTimeout(400);
 ok(await A.evaluate(()=>document.querySelector('.chat-wrap').classList.contains('still')),'PC: "Pausar animação" deixa o chat parado');
 await A.evaluate(()=>{try{localStorage.removeItem('lojasg.estoque99.fx-pause')}catch(e){}});
 console.log('errors',errs);await b.close()})();
