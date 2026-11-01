/* v108: mensagens do chat que não saíram ficam guardadas no aparelho (IndexedDB estoque99-chat-out, cifradas com a chave da conta).
   Recarregar a página não apaga; "Tentar de novo" envia uma vez só; "Descartar" apaga de vez; nada do texto fica em claro;
   outra conta do mesmo aparelho não vê; PC 1440×900 e iPhone 13. */
const L=require('./lib.js');const {ok,until}=L;
const FAIL=()=>{window.__f=window.fetch;window.fetch=function(u,o){if(o&&(o.method==='POST'||o.method==='PUT')&&/\/e99-[0-9a-f]{24}$/.test(String(u)))return Promise.resolve(new Response('x',{status:500}));return window.__f.apply(this,arguments)}};
const failedTxt=p=>p.evaluate(()=>[...document.querySelectorAll('#chat-list .chat-msg.failed .chat-txt')].map(x=>x.innerText));
const sentCount=(p,t)=>p.evaluate(t=>[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].filter(x=>x.innerText===t).length,t);
async function rawOutbox(p){return p.evaluate(()=>new Promise(res=>{const r=indexedDB.open('estoque99-chat-out',1);r.onupgradeneeded=()=>r.result.createObjectStore('out');r.onsuccess=()=>{const db=r.result;const tx=db.transaction('out','readonly');const q=tx.objectStore('out').getAll();const k=tx.objectStore('out').getAllKeys();tx.oncomplete=()=>{db.close();res({vals:JSON.stringify(q.result),keys:k.result})}};r.onerror=()=>res({vals:'',keys:[]})}))}
async function relogin(p,l){await p.reload();await p.waitForTimeout(2500);if(!(await p.evaluate(()=>!!authSession)))await L.login(p,l,'1234');await p.evaluate(()=>go('chat'));await p.waitForTimeout(1500)}
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();A.on('pageerror',e=>errs.push('PC '+e.message));A.on('dialog',d=>d.accept());
 const la='ob'+T;ok(await L.gestorWithTeam(A,la),'PC: gestor com equipe');const code=await A.evaluate(()=>e99Team.get().code);
 const B=await (await b.newContext(L.devices['iPhone 13'])).newPage();B.on('pageerror',e=>errs.push('iPhone '+e.message));B.on('dialog',d=>d.accept());
 await B.goto('http://localhost:8000/index.html?ntfy='+L.N);await B.waitForTimeout(2500);const lb='obb'+T;await L.signup(B,lb);await B.evaluate(c=>e99Team.join(c,'Ana'),code);await B.evaluate(()=>go('chat'));await B.waitForTimeout(1500);
 for(const [n,P,lg] of [['PC',A,la],['iPhone',B,lb]]){
  await P.evaluate(()=>go('chat'));await P.waitForTimeout(800);
  const t1='guardada '+n+' '+T,t2='descartar '+n+' '+T;
  await P.evaluate(FAIL);
  await P.fill('#chat-text',t1);await P.press('#chat-text','Enter');
  ok(await until(P,t=>[...document.querySelectorAll('#chat-list .chat-msg.failed .chat-txt')].some(x=>x.innerText===t),t1,8000),n+': falha mostra "Não enviada"');
  await P.fill('#chat-text',t2);await P.press('#chat-text','Enter');await until(P,t=>[...document.querySelectorAll('#chat-list .chat-msg.failed .chat-txt')].some(x=>x.innerText===t),t2,8000);
  const raw=await rawOutbox(P);
  ok(raw.keys.length>=2,n+': as não enviadas ficam no IndexedDB do aparelho');
  ok(raw.vals&&!raw.vals.includes('guardada')&&!raw.vals.includes('descartar')&&!raw.vals.includes(T+''),n+': texto não fica em claro (cifrado com a chave da conta)');
  ok(raw.keys.every(k=>!/guardada|descartar/.test(k)),n+': a chave do registro não tem o texto');
  /* recarregar: continuam lá */
  await relogin(P,lg);
  ok(await until(P,([a,c])=>{const l=[...document.querySelectorAll('#chat-list .chat-msg.failed .chat-txt')].map(x=>x.innerText);return l.includes(a)&&l.includes(c)},[t1,t2],8000),n+': depois de recarregar as não enviadas continuam lá');
  ok(await P.evaluate(()=>!!document.querySelector('#chat-list .chat-msg.failed .chat-retry')&&!!document.querySelector('#chat-list .chat-msg.failed .chat-discard')),n+': Tentar de novo e Descartar continuam');
  /* descartar: some de vez */
  await P.evaluate(t=>{const m=[...document.querySelectorAll('#chat-list .chat-msg.failed')].find(x=>x.querySelector('.chat-txt').innerText===t);m.querySelector('.chat-discard').click()},t2);
  ok(await until(P,t=>!(([...document.querySelectorAll('#chat-list .chat-msg.failed .chat-txt')].map(x=>x.innerText)).includes(t)),t2,5000),n+': Descartar tira da tela');
  await relogin(P,lg);await P.waitForTimeout(800);
  ok(!(await failedTxt(P)).includes(t2)&&(await failedTxt(P)).includes(t1),n+': descartada não volta ao recarregar (a outra continua)');
  /* tentar de novo: envia uma vez só e sai do aparelho */
  await P.evaluate(t=>{const m=[...document.querySelectorAll('#chat-list .chat-msg.failed')].find(x=>x.querySelector('.chat-txt').innerText===t);m.querySelector('.chat-retry').click()},t1);
  ok(await until(P,t=>!document.querySelector('#chat-list .chat-msg.failed')&&[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].filter(x=>x.innerText===t).length===1,t1,10000),n+': Tentar de novo envia uma vez só');
  ok(await until(P,async()=>(await window.e99ChatOutbox()).length===0,null,5000),n+': enviada sai da lista guardada');
  await relogin(P,lg);await P.waitForTimeout(1500);ok(!(await failedTxt(P)).length&&await sentCount(P,t1)===1,n+': depois de recarregar não reaparece nem duplica');
 }
 /* o outro aparelho recebeu a mensagem que foi enviada depois */
 ok(await until(A,t=>[...document.querySelectorAll('#chat-list .chat-msg[data-id] .chat-txt')].some(x=>x.innerText===t),'guardada iPhone '+T,15000),'PC recebe a mensagem que o iPhone enviou com Tentar de novo');
 /* recarregou durante o envio (ficou "Enviando…"): volta como não enviada */
 await A.evaluate(()=>{window.__f=window.fetch;window.fetch=function(u,o){if(o&&o.method==='POST'&&/\/e99-[0-9a-f]{24}$/.test(String(u)))return new Promise(()=>{});return window.__f.apply(this,arguments)}});
 const t3='presa '+T;await A.fill('#chat-text',t3);await A.press('#chat-text','Enter');await A.waitForTimeout(800);
 await relogin(A,la);ok(await until(A,t=>[...document.querySelectorAll('#chat-list .chat-msg.failed .chat-txt')].some(x=>x.innerText===t),t3,8000),'PC: mensagem presa em "Enviando…" volta como não enviada depois de recarregar');
 /* outra conta do mesmo aparelho não vê as não enviadas */
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(800);const lc='obc'+T;await L.signup(A,lc);await A.evaluate(c=>e99Team.join(c,'Bia'),code);await A.evaluate(()=>go('chat'));await A.waitForTimeout(2000);
 ok(!(await failedTxt(A)).includes(t3),'outra conta do mesmo aparelho não vê as não enviadas');
 console.log('errors',errs);await b.close()})();
