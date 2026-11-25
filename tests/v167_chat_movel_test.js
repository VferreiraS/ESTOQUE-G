/* v167: chat do celular sem compressão. iPhone 13 (gestor com equipe) + PC 1440×900 (Leo); 3 temas.
   Mede lista de conversas, chat da equipe, conversa privada, com e sem teclado simulado (visualViewport da v149).
   "Antes" = mesma tela com app/css/v167-chat-movel.css desligado. PC: larguras iguais com e sem o arquivo novo.
   Prints 2x em docs/prints/v167 (fora do git). */
const L=require('./lib.js');const {ok,until}=L;const path=require('path'),fs=require('fs');
const OUT=path.join(__dirname,'..','docs','prints','v167');fs.mkdirSync(OUT,{recursive:true});
const FAKE=()=>{const vv=new EventTarget();let h=innerHeight,t=0;Object.defineProperty(vv,'height',{get:()=>h});Object.defineProperty(vv,'width',{get:()=>innerWidth});
  Object.defineProperty(vv,'offsetTop',{get:()=>t});Object.defineProperty(vv,'offsetLeft',{get:()=>0});Object.defineProperty(vv,'scale',{get:()=>1});
  Object.defineProperty(window,'visualViewport',{configurable:true,get:()=>vv});
  window.__kb=(on,top)=>{h=on?420:innerHeight;t=top||0;vv.dispatchEvent(new Event('resize'));vv.dispatchEvent(new Event('scroll'))}};
const MEAS=()=>{const R=s=>{const e=typeof s==='string'?document.querySelector(s):s;if(!e||!e.offsetParent&&getComputedStyle(e).position!=='fixed')return null;const r=e.getBoundingClientRect();return {l:r.left,r:r.right,w:r.width,h:r.height}};
 const wrap=document.querySelector('.cv-wrap[data-open]')||document.querySelector('.chat-wrap');const list=document.getElementById('chat-list')||document.getElementById('cv-msgs');
 const bub=[...document.querySelectorAll('#chat-list .chat-msg[data-id],.cv-msgs .cv-b')];const lr=list&&list.getBoundingClientRect();
 const pl=list?parseFloat(getComputedStyle(list).paddingLeft)+parseFloat(getComputedStyle(list).paddingRight):0;
 const txt=bub.map(b=>b.querySelector('.chat-txt,.cv-t')).filter(Boolean);
 const btns=[...document.querySelectorAll('#chat-form .chat-plus,#chat-form .chat-btns button,.cv-compose>button,.cv-compose>label,.chat-head button,.cv-head button,.cv-back')].filter(e=>e.offsetParent);
 const vis=[...document.querySelectorAll('.chat-head,.cv-head,#chat-form,.cv-compose,#chat-text,.cv-compose textarea,#chat-mic,#chat-send')].filter(e=>e.offsetParent);
 return {vw:innerWidth,sw:document.documentElement.scrollWidth,wrapW:wrap?wrap.getBoundingClientRect().width:0,
  listW:lr?lr.width:0,listH:lr?lr.height:0,inner:lr?lr.width-pl:0,bw:bub.map(b=>b.getBoundingClientRect().width),maxBW:bub.length?Math.max(...bub.map(b=>b.getBoundingClientRect().width)):0,
  out:vis.filter(e=>{const r=e.getBoundingClientRect();return r.right>innerWidth+0.5||r.left<-0.5}).map(e=>e.id||e.className),
  tfs:txt.map(t=>parseFloat(getComputedStyle(t).fontSize)),head:R('.chat-head')||R('.cv-head'),field:R('#chat-text')||R('.cv-compose textarea'),
  small:btns.filter(e=>{const r=e.getBoundingClientRect();return r.width<43.5||r.height<43.5}).map(e=>e.getAttribute('aria-label')||e.className||e.textContent.trim()),
  items:[...document.querySelectorAll('.cv-list .cv-item')].filter(e=>e.offsetParent).map(i=>{const a=i.querySelector('.cv-av,.cv-gav'),la=i.querySelector('.cv-last'),cs=la&&getComputedStyle(la);
   return {w:i.getBoundingClientRect().width,av:a?a.getBoundingClientRect().width:0,one:!!la&&la.getBoundingClientRect().height<=parseFloat(cs.lineHeight||'20')*1.3+1&&cs.whiteSpace==='nowrap'&&cs.textOverflow==='ellipsis'}})}};
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const cB=await b.newContext({...L.devices['iPhone 13'],deviceScaleFactor:2});await cB.addInitScript(FAKE);const B=await cB.newPage();
 const A=await (await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:2})).newPage();
 [['iPhone',B],['PC',A]].forEach(([n,p])=>{p.on('pageerror',e=>errs.push(n+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|firestore|Firestore|WebChannel/i.test(m.text()))errs.push(n+' console: '+m.text().slice(0,120))});p.on('dialog',d=>d.accept())});
 ok(await L.gestorWithTeam(B,'cm'+T),'iPhone: gestor com equipe');const code=await B.evaluate(()=>e99Team.get().code);
 await A.goto('http://localhost:8000/index.html');await A.waitForTimeout(2500);await L.signup(A,'cl'+T);await A.evaluate(([c])=>e99Team.join(c,'Leonardo Albuquerque'),[code]);await A.evaluate(()=>go('chat'));await A.waitForTimeout(800);
 for(const P of [A,B])await P.addStyleTag({content:'.firebase-emulator-warning,#toast,.toast{display:none!important}'});
 await B.evaluate(async()=>{await chatSend('Bom dia, equipe! Chegou a NF 48213 com 3 volumes de laticínios.');await chatSend('Ok')});
 await A.evaluate(async()=>{await chatSend('Bom dia! Já estou no corredor 07 conferindo os volumes da nota fiscal de hoje.');await chatSend('Falta conferir 3 volumes.')});
 ok(await until(B,()=>document.querySelectorAll('#chat-list .chat-msg[data-id]').length>=4,null,30000)&&await until(A,()=>document.querySelectorAll('#chat-list .chat-msg[data-id]').length>=4,null,30000),'4 mensagens de 2 pessoas nos dois aparelhos');
 await B.waitForTimeout(1200);
 const off=(P,v)=>P.evaluate(v=>{document.getElementById('v167-chat-movel-css').disabled=v},v);
 const shot=async(n)=>{await B.evaluate(()=>scrollTo(0,0));await B.waitForTimeout(150);await B.screenshot({path:path.join(OUT,n+'.png')})};
 const team=async()=>{await B.evaluate(()=>{localStorage.setItem('e99-test-chatgeral','1');go('chat');if(!document.getElementById('chat-list')&&window.e99Cv)e99Cv.open('geral')});await B.waitForSelector('#chat-text');await B.waitForTimeout(400)};
 const lista=async()=>{await B.evaluate(()=>{localStorage.removeItem('e99-test-chatgeral');e99Cv.list()});await B.waitForTimeout(500)};
 const priv=async()=>{await B.evaluate(()=>e99Cv.open('dTeste12345'));await B.waitForSelector('.cv-compose textarea');
  await B.evaluate(()=>{const m=document.getElementById('cv-msgs');m.innerHTML=Array.from({length:12},(_,i)=>'<div class="cv-b'+(i%2?' mine':'')+(i%3===2?' seq-end':' cont')+'"><span class="cv-t">Linha '+i+' com um texto mais longo para ver a largura da bolha no celular</span></div>').join('')});await B.waitForTimeout(300)};
 /* antes (arquivo novo desligado) — só prints e a causa */
 await off(B,true);await team();const antes=await B.evaluate(MEAS);await shot('antes-equipe');
 ok(true,'Antes (v166): chat da equipe com '+antes.out.length+' peça(s) fora da tela, balão máx. '+Math.round(antes.maxBW)+' px numa lista de '+Math.round(antes.listW)+' px');
 await lista();await shot('antes-lista');await priv();await shot('antes-privada');
 await B.focus('.cv-compose textarea');await B.evaluate(()=>__kb(true));await B.waitForTimeout(400);await shot('antes-privada-teclado');await B.evaluate(()=>{document.activeElement.blur();__kb(false)});
 await off(B,false);
 for(const th of ['lilas','violeta','cinza']){await B.evaluate(t=>e99Theme.set(t),th);await B.waitForTimeout(250);
  /* chat da equipe sem teclado */
  await team();let m=await B.evaluate(MEAS);await shot('depois-equipe-'+th);
  ok(m.sw<=m.vw&&!m.out.length,th+' equipe: sem rolagem lateral e nada fora da tela'+(m.out.length?' ('+m.out.join(',')+')':''));
  ok(m.listW>=340&&m.inner>=330,th+' equipe: área das mensagens larga ('+Math.round(m.listW)+' px)');
  ok(m.bw.every(w=>w<=m.inner*0.75+1)&&m.maxBW>=m.inner*0.7,th+' equipe: balão até 75 % ('+Math.round(m.maxBW)+' de '+Math.round(m.inner)+' px)');
  ok(m.tfs.length&&m.tfs.every(f=>f>=16&&f<=17),th+' equipe: texto do balão 16–17 px ('+m.tfs[0]+')');
  ok(m.head&&m.head.h>=56&&m.head.h<=64&&m.field&&m.field.h>=44&&m.field.h<=48,th+' equipe: cabeçalho '+(m.head&&m.head.h)+' px, campo '+(m.field&&m.field.h)+' px');
  ok(!m.small.length,th+' equipe: botões ≥44 px'+(m.small.length?' ('+m.small.join('|')+')':''));
  /* com teclado */
  await B.focus('#chat-text');await B.evaluate(()=>__kb(true));await B.waitForTimeout(450);m=await B.evaluate(MEAS);await shot('depois-equipe-teclado-'+th);
  ok(m.sw<=m.vw&&!m.out.length&&m.listH>=200&&m.listW>=340&&m.head.h<=64,th+' equipe com teclado: lista '+Math.round(m.listW)+'×'+Math.round(m.listH)+' px, cabeçalho '+Math.round(m.head.h)+' px');
  await B.evaluate(()=>{document.activeElement.blur();__kb(false)});await B.waitForTimeout(250);
  /* lista de conversas */
  await lista();m=await B.evaluate(MEAS);await shot('depois-lista-'+th);
  ok(m.items.length&&m.items.every(i=>Math.round(i.av)===52&&i.w>=340&&i.one)&&m.sw<=m.vw,th+' lista: avatar 52 px, linha '+(m.items[0]&&Math.round(m.items[0].w))+' px, prévia em uma linha com reticências');
  /* conversa privada com e sem teclado */
  await priv();m=await B.evaluate(MEAS);await shot('depois-privada-'+th);
  ok(m.sw<=m.vw&&!m.out.length&&m.bw.every(w=>w<=m.inner*0.75+1)&&m.maxBW>=m.inner*0.7&&m.tfs.every(f=>f>=16&&f<=17),th+' privada: balão '+Math.round(m.maxBW)+' de '+Math.round(m.inner)+' px, texto '+m.tfs[0]+' px');
  ok(!m.small.length&&m.head.h>=44&&m.field.h>=44,th+' privada: cabeçalho, campo e botões ≥44 px'+(m.small.length?' ('+m.small.join('|')+')':''));
  await B.focus('.cv-compose textarea');await B.evaluate(()=>__kb(true));await B.waitForTimeout(450);m=await B.evaluate(MEAS);await shot('depois-privada-teclado-'+th);
  ok(m.sw<=m.vw&&!m.out.length&&m.listH>=200&&m.field.h>=44,th+' privada com teclado: lista '+Math.round(m.listW)+'×'+Math.round(m.listH)+' px');
  await B.evaluate(()=>{document.activeElement.blur();__kb(false)});await B.waitForTimeout(200);
 }
 /* PC: igual com e sem o arquivo novo */
 const pc=async()=>A.evaluate(()=>{const g=s=>[...document.querySelectorAll(s)].map(e=>Math.round(e.getBoundingClientRect().width)).join(',');return g('#chat-list .chat-msg[data-id]')+'|'+g('.chat-head')+'|'+g('#chat-form')+'|'+g('.chat-wrap')+'|'+g('.chat-txt')});
 for(const th of ['lilas','violeta','cinza']){await A.evaluate(t=>e99Theme.set(t),th);await A.waitForTimeout(250);const d=await pc();await off(A,true);await A.waitForTimeout(150);const v=await pc();await off(A,false);
  ok(d===v,th+' PC: chat igual à v166 ('+d.split('|')[0]+')');if(th==='lilas')await A.screenshot({path:path.join(OUT,'pc-equipe.png')})}
 ok(!errs.length,'0 erro de console'+(errs.length?': '+errs.slice(0,3).join(' | '):''));console.log('errors',errs);await b.close()})().catch(e=>{console.log('FAIL erro',e);process.exit(1)});
