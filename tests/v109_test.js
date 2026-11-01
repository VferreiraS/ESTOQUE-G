/* v109: "Apagar para todos" no chat (mensagem nova E99D: no protocolo).
   Quem enviou apaga a própria para todos; o gestor (quem criou a equipe) apaga qualquer uma; auxiliar/outro não apaga a dos outros
   (nem pelo botão nem forjando a mensagem); aparelho com leitor antigo (só E99:) ignora o E99D: e não mostra mensagem vazia.
   PC 1440×900 (gestor) + iPhone 13 (Ana, conta comum) + auxiliar (PC). */
const L=require('./lib.js');const {ok,until}=L;
const has=(p,t)=>p.evaluate(t=>[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].some(x=>x.innerText===t),t);
const idOf=(p,t)=>p.evaluate(t=>{const m=[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].find(x=>x.querySelector('.chat-txt')&&x.querySelector('.chat-txt').innerText===t);return m?m.getAttribute('data-id'):''},t);
const seen=(p,t,ms)=>until(p,t=>[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].some(x=>x.innerText===t),t,ms||15000);
const gone=(p,t,ms)=>until(p,t=>![...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].some(x=>x.innerText===t),t,ms||15000);
async function send(p,t){await p.fill('#chat-text',t);await p.press('#chat-text','Enter');await seen(p,t,10000)}
async function menuHasDelAll(p,id){await p.evaluate(id=>e99MsgMenu(id),id);await p.waitForTimeout(700);const r=await p.evaluate(()=>{const b=document.querySelector('#msg-menu [data-a=delall]');return !!b&&!b.hidden});await p.evaluate(()=>{const m=document.getElementById('msg-menu');if(m)m.remove()});return r}
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();A.on('pageerror',e=>errs.push('PC '+e.message));A.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(A,'dg'+T),'PC: gestor com equipe');const code=await A.evaluate(()=>e99Team.get().code);
 const B=await (await b.newContext(L.devices['iPhone 13'])).newPage();B.on('pageerror',e=>errs.push('iPhone '+e.message));B.on('dialog',d=>d.accept());
 await B.goto('http://localhost:8000/index.html?ntfy='+L.N);await B.waitForTimeout(2500);await L.signup(B,'db'+T);await B.evaluate(c=>e99Team.join(c,'Ana'),code);
 const link=await L.makeInvite(A,'Aux Caio');const C=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();C.on('pageerror',e=>errs.push('Aux '+e.message));C.on('dialog',d=>d.accept());
 await L.auxAccept(C,link,null,'2468');ok(await C.evaluate(()=>authSession&&authSession.payload.role==='auxiliar'),'auxiliar entrou');
 for(const p of [A,B,C]){await p.evaluate(()=>go('chat'));}await A.waitForTimeout(3000);
 /* aparelho "antigo": só o leitor antigo (aceita E99: e ignora o resto) — registra tudo o que chegasse como mensagem */
 await B.evaluate(()=>{window.__old=[];const N=e99Team.ntfy(),tp=e99Team.get().topic;const es=new EventSource(N+'/'+tp+'/sse?since=1m');es.onmessage=ev=>{try{const d=JSON.parse(ev.data);if(d.event!=='message')return;if(typeof d.message==='string'&&d.message.indexOf('E99:')===0)window.__old.push('msg');else if(typeof d.message==='string'&&d.message.indexOf('E99D:')===0)window.__old.push('ignorado')}catch(e){}}});
 /* 1) Ana apaga a própria para todos */
 const t1='da Ana '+T;await send(B,t1);ok(await seen(A,t1)&&await seen(C,t1),'todos recebem a mensagem da Ana');
 const id1=await idOf(B,t1);ok(await menuHasDelAll(B,id1),'iPhone: menu da própria mensagem tem "Apagar para todos"');
 ok(await B.evaluate(id=>chatDeleteAll(id),id1),'iPhone: Ana apaga a própria para todos');
 ok(await gone(B,t1,5000),'iPhone: some no aparelho dela');ok(await gone(A,t1),'PC (gestor): some');ok(await gone(C,t1),'auxiliar: some');
 ok(await B.evaluate(()=>window.__old.includes('ignorado')),'leitor antigo recebeu o E99D: e ignorou (não virou mensagem)');
 /* 2) auxiliar não apaga a mensagem dos outros: sem botão e recusado */
 const t2='do gestor '+T;await send(A,t2);ok(await seen(C,t2)&&await seen(B,t2),'todos recebem a do gestor');
 const id2=await idOf(C,t2);ok(!(await menuHasDelAll(C,id2)),'auxiliar: sem "Apagar para todos" na mensagem do gestor');
 ok(!(await C.evaluate(id=>chatDeleteAll(id),id2)),'auxiliar: chatDeleteAll recusa');
 /* 3) mensagem forjada (alguém da equipe manda E99D: com o próprio nome) não apaga a dos outros */
 const forge=async(p,ref,from,g)=>p.evaluate(async([ref,from,g])=>{const t=e99Team.get();const n=t.code.toUpperCase().replace(/O/g,'0').replace(/[IL]/g,'1').replace(/[^0-9A-Z]/g,'');const te=new TextEncoder();
   const base=await crypto.subtle.importKey('raw',te.encode(n),'PBKDF2',false,['deriveKey']);const key=await crypto.subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:te.encode('estoque99-chat|'+t.topic),iterations:200000},base,{name:'AES-GCM',length:256},false,['encrypt']);
   const iv=crypto.getRandomValues(new Uint8Array(12));const ct=new Uint8Array(await crypto.subtle.encrypt({name:'AES-GCM',iv},key,te.encode(JSON.stringify({v:1,t:'del',id:'fx'+Date.now().toString(36),ref,from,at:new Date().toISOString(),g}))));
   const out=new Uint8Array(12+ct.length);out.set(iv);out.set(ct,12);let s='';out.forEach(x=>s+=String.fromCharCode(x));return (await fetch(e99Team.ntfy()+'/'+t.topic,{method:'POST',body:'E99D:'+btoa(s)})).ok},[ref,from,g]);
 ok(await forge(C,id2,'Aux Caio',0),'auxiliar manda E99D: forjado (nome dele)');
 ok(await forge(C,id2,'Aux Caio',1),'auxiliar manda E99D: forjado dizendo ser gestor');
 await A.waitForTimeout(4000);ok(await has(A,t2)&&await has(B,t2)&&await has(C,t2),'forjado é ignorado: a mensagem do gestor continua em todos');
 /* 4) Ana (conta comum) também não apaga a do gestor */
 ok(!(await menuHasDelAll(B,await idOf(B,t2))),'iPhone: Ana não vê "Apagar para todos" na mensagem do gestor');
 /* 5) gestor apaga a mensagem do auxiliar para todos */
 const t3='do auxiliar '+T;await send(C,t3);ok(await seen(A,t3)&&await seen(B,t3),'todos recebem a do auxiliar');
 const id3=await idOf(A,t3);ok(await menuHasDelAll(A,id3),'PC: gestor vê "Apagar para todos" na mensagem do auxiliar');
 ok(await A.evaluate(id=>chatDeleteAll(id),id3),'PC: gestor apaga a do auxiliar');
 ok(await gone(C,t3)&&await gone(B,t3)&&await gone(A,t3,5000),'mensagem do auxiliar some em todos');
 /* 6) apagada não volta ao recarregar (ntfy reenvia as últimas 12 h) */
 await B.reload();await B.waitForTimeout(2500);if(!(await B.evaluate(()=>!!authSession)))await L.login(B,'db'+T,'1234');await B.evaluate(()=>go('chat'));await B.waitForTimeout(4000);
 ok(!(await has(B,t1))&&!(await has(B,t3))&&await has(B,t2),'iPhone: depois de recarregar as apagadas não voltam e a outra continua');
 ok(!(await B.evaluate(()=>[...document.querySelectorAll('#chat-list .chat-msg[data-id]')].some(m=>!m.querySelector('.chat-txt')&&!m.querySelector('img,audio')))),'nenhuma mensagem vazia na lista');
 console.log('errors',errs);await b.close()})();
