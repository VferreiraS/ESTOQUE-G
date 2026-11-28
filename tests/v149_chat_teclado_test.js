/* v149: conversa no iPhone com o teclado aberto. visualViewport simulado (o teclado reduz a área visível para 420 px):
   o campo fica dentro da área visível, a barra de baixo não cobre o campo, a página não rola, a lista rola sozinha e enviar funciona.
   Chat da equipe (fixo só com o campo focado) e conversa privada/grupo da v138 (fixa enquanto aberta). */
const L=require('./lib.js');const {ok,until}=L;
const FAKE=()=>{const vv=new EventTarget();let h=innerHeight,t=0;Object.defineProperty(vv,'height',{get:()=>h});Object.defineProperty(vv,'width',{get:()=>innerWidth});
  Object.defineProperty(vv,'offsetTop',{get:()=>t});Object.defineProperty(vv,'offsetLeft',{get:()=>0});Object.defineProperty(vv,'scale',{get:()=>1});
  Object.defineProperty(window,'visualViewport',{configurable:true,get:()=>vv});
  window.__kb=(on,top)=>{h=on?420:innerHeight;t=top||0;vv.dispatchEvent(new Event('resize'));vv.dispatchEvent(new Event('scroll'))}};
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const c=await b.newContext(L.devices['iPhone 13']);await c.addInitScript(FAKE);const B=await c.newPage();
 B.on('pageerror',e=>errs.push(e.message));B.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(B,'kb'+T),'iPhone: conta com equipe');
 for(let i=1;i<=30;i++)await B.evaluate(t=>chatSend(t),'Mensagem '+i+' para encher a conversa');
 await B.evaluate(()=>{go('chat');if(!document.getElementById('chat-list')&&window.e99Cv)e99Cv.open('geral');scrollTo(0,0)});await B.waitForSelector('#chat-text');
 ok(await until(B,()=>document.querySelectorAll('#chat-list .chat-msg[data-id]').length>=30,null,30000),'iPhone: 30 mensagens na lista');
 ok(await B.evaluate(()=>!document.body.classList.contains('e99-convo')&&(getComputedStyle(document.querySelector('.mobile-bottom')).display!=='none'||document.body.classList.contains('v169-conv'))),'Chat da equipe sem foco: layout normal (v169: dentro da conversa a barra de baixo sai, como no print)');
 const geo=sel=>B.evaluate(sel=>{const f=document.querySelector(sel).getBoundingClientRect(),n=document.querySelector('.mobile-bottom'),nv=n&&getComputedStyle(n).display!=='none'?n.getBoundingClientRect():null,v=visualViewport,l=document.getElementById('cv-msgs')||document.getElementById('chat-list');
   return {top:Math.round(f.top),bot:Math.round(f.bottom),vh:v.height,vt:v.offsetTop,navCover:!!(nv&&nv.top<f.bottom&&nv.bottom>f.top),sy:scrollY,
    lst:l.scrollHeight-l.scrollTop-l.clientHeight,lov:getComputedStyle(l).overflowY,los:getComputedStyle(l).overscrollBehaviorY,lh:l.clientHeight,lsh:l.scrollHeight,
    wpos:getComputedStyle(document.querySelector('.cv-wrap[data-open],.chat-wrap')).position,vhUse:/100vh/.test(document.querySelector('.cv-wrap[data-open],.chat-wrap').style.height||'')}},sel);
 /* foco + teclado */
 await B.focus('#chat-text');await B.evaluate(()=>__kb(true));await B.waitForTimeout(500);
 let g=await geo('#chat-text');
 ok(await B.evaluate(()=>document.body.classList.contains('e99-convo')&&document.body.classList.contains('e99-convo-kb')),'Chat da equipe: modo conversa com o teclado');
 ok(g.top>=g.vt&&g.bot<=g.vt+g.vh,'Chat da equipe: campo dentro da área visível acima do teclado ('+g.top+'–'+g.bot+' de '+g.vh+')');
 ok(!g.navCover,'Chat da equipe: barra de baixo não cobre o campo');
 ok(g.sy===0&&g.wpos==='fixed','Chat da equipe: página parada (scrollY='+g.sy+') e conversa fixa');
 ok(g.lov==='auto'&&g.los==='contain'&&g.lsh>g.lh,'Chat da equipe: lista com rolagem própria (overflow auto, overscroll contain)');
 ok(g.lst<6,'Chat da equipe: fim da conversa visível ao focar');
 ok(await B.evaluate(()=>{const w=document.querySelector('.chat-wrap'),c=getComputedStyle(w).backgroundColor;return /^rgb\(/.test(c)&&w.getBoundingClientRect().width===innerWidth}),'Chat da equipe: conversa cobre a tela com fundo sólido (nada da página aparece por trás)');
 /* Safari rola a área visível: a conversa acompanha */
 await B.evaluate(()=>__kb(true,120));await B.waitForTimeout(300);g=await geo('#chat-text');ok(g.top>=120&&g.bot<=120+420,'Chat da equipe: acompanha a área visível deslocada (offsetTop 120)');
 await B.evaluate(()=>__kb(true,0));await B.waitForTimeout(200);
 /* rolar a lista não mexe na página */
 await B.evaluate(()=>{document.getElementById('chat-list').scrollTop=0});await B.waitForTimeout(300);
 ok(await B.evaluate(()=>scrollY===0&&document.getElementById('chat-list').scrollTop<50),'Chat da equipe: a lista rola sozinha, a página não');
 ok(await B.evaluate(()=>{const j=document.getElementById('chat-jump');return j&&!j.hidden}),'Chat da equipe: "Ir para o fim" aparece ao subir');
 /* enviar com Enter */
 await B.fill('#chat-text','Teclado aberto v149');await B.press('#chat-text','Enter');
 ok(await until(B,()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].some(x=>x.innerText==='Teclado aberto v149'),null,20000),'Chat da equipe: enviar com Enter funciona com o teclado aberto');
 await B.waitForTimeout(600);ok(await B.evaluate(()=>{const l=document.getElementById('chat-list');return l.scrollHeight-l.scrollTop-l.clientHeight<6&&scrollY===0}),'Chat da equipe: depois de enviar fica no fim e a página não rolou');
 ok(await B.evaluate(()=>[...document.querySelectorAll('.chat-wrap .chat-btns button,#chat-send')].filter(e=>e.offsetParent).every(e=>{const r=e.getBoundingClientRect();return r.width>=44&&r.height>=44})),'Chat da equipe: botões do campo ≥44 px');
 await B.screenshot({path:process.env.SHOT||'/tmp/v149-teclado-equipe.png'}).catch(()=>{});
 /* sai do campo: volta ao normal */
 await B.evaluate(()=>{document.activeElement.blur();__kb(false)});await B.waitForTimeout(500);
 ok(await B.evaluate(()=>!document.body.classList.contains('e99-convo')&&(getComputedStyle(document.querySelector('.mobile-bottom')).display!=='none'||document.body.classList.contains('v169-conv'))),'Chat da equipe: sem foco volta o layout normal');

 /* conversa privada (v138): fixa enquanto aberta */
 await B.evaluate(()=>e99Cv.open('dTeste12345'));await B.waitForSelector('.cv-compose textarea');
 await B.evaluate(()=>{const m=document.getElementById('cv-msgs');m.innerHTML=Array.from({length:40},(_,i)=>'<div class="cv-b"><span class="cv-t">Linha '+i+'</span></div>').join('')});
 await B.waitForTimeout(300);g=await geo('.cv-compose textarea');
 ok(await B.evaluate(()=>document.body.classList.contains('e99-convo')),'Conversa: modo conversa ao abrir');
 ok(!g.navCover&&g.bot<=g.vh&&g.wpos==='fixed','Conversa sem teclado: campo visível, barra de baixo fora ('+g.bot+'/'+g.vh+')');
 await B.focus('.cv-compose textarea');await B.evaluate(()=>__kb(true));await B.waitForTimeout(500);g=await geo('.cv-compose textarea');
 ok(g.top>=0&&g.bot<=420&&!g.navCover&&g.sy===0,'Conversa com teclado: campo acima do teclado ('+g.bot+'/420), página parada');
 ok(g.lov==='auto'&&g.los==='contain'&&g.lst<6,'Conversa: lista rola sozinha e mostra o fim ao focar');
 ok(await B.evaluate(()=>[...document.querySelectorAll('.cv-compose button,.cv-compose label,.cv-back')].filter(e=>e.offsetParent).every(e=>{const r=e.getBoundingClientRect();return r.height>=44})),'Conversa: toques ≥44 px');
 await B.screenshot({path:process.env.SHOT2||'/tmp/v149-teclado-conversa.png'}).catch(()=>{});
 await B.evaluate(()=>{document.activeElement.blur();__kb(false);e99Cv.list()});await B.waitForTimeout(500);
 ok(await B.evaluate(()=>!document.body.classList.contains('e99-convo')&&!document.documentElement.classList.contains('e99-convo-lock')),'Lista de conversas: sai do modo conversa');
 await B.evaluate(()=>go('home'));await B.waitForTimeout(300);ok(await B.evaluate(()=>!document.body.classList.contains('e99-convo')&&getComputedStyle(document.querySelector('.mobile-bottom')).display!=='none'),'Início: barra de baixo de volta');
 /* PC não muda */
 const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();A.on('pageerror',e=>errs.push('PC '+e.message));
 ok(await L.gestorWithTeam(A,'kbp'+T),'PC: conta com equipe');await A.evaluate(()=>{go('chat');if(!document.getElementById('chat-list')&&window.e99Cv)e99Cv.open('geral')});await A.waitForSelector('#chat-text');await A.focus('#chat-text');await A.waitForTimeout(300);
 ok(await A.evaluate(()=>!document.body.classList.contains('e99-convo')),'PC: layout do chat igual (sem modo conversa)');
 ok(!errs.length,'0 erro de JavaScript'+(errs.length?': '+errs.join(' | '):''));
 await b.close();console.log('fim')})().catch(e=>{console.log('FAIL erro',e);process.exit(1)});
