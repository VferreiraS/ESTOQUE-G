/* v130: A) chat/sync mostram QUAL serviço está bloqueado (não "sem internet"); painel "Rede da loja / Antivírus" com "Testar conexão".
   C) "Efeitos de energia" (anime) opcionais: começam desligados; ligam por preferência; "menos movimento" mantém parado; 0 erro de console. */
const L=require('./lib.js');const {ok,until,signup}=L;const U='http://localhost:8000/index.html?ntfy='+L.N;
(async()=>{const b=await L.chromium.launch();const errs=[];
/* ---- normal (PC): A + B + C ligado aparece ---- */
{const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();p.on('pageerror',e=>errs.push('PC '+e.message));p.on('dialog',d=>d.accept());
 await p.goto(U);await p.waitForTimeout(2000);await signup(p,'gestor'+Date.now().toString(36));await p.waitForTimeout(800);

 /* A: e99NetFail refina a falha com e99NetWhy (clara, não "sem internet") */
 const refined=await p.evaluate(async()=>{window.e99NetWhy=async()=>'O antivírus ou a rede da loja está bloqueando o Stok: equipe e chat (ntfy.sh). Libere o app no antivírus (ex.: Bitdefender).';
   return await new Promise(res=>{const rec={err:'Não foi possível enviar (sem internet). Tente de novo.'};window.e99NetFail(rec,function(m){res({err:rec.err,m:m})});setTimeout(()=>res({err:rec.err,m:null}),1500)})});
 ok(refined.m&&/ntfy\.sh/.test(refined.err)&&/Bitdefender/.test(refined.err)&&!/sem internet/i.test(refined.err),'A: falha do chat vira mensagem clara do serviço bloqueado ('+(refined.err||'-').slice(0,40)+'…)');

 /* A: com navigator.onLine=false, e99NetFail não troca (fica "sem internet" mesmo) */
 const off=await p.evaluate(async()=>{const d=Object.getOwnPropertyDescriptor(Navigator.prototype,'onLine');Object.defineProperty(navigator,'onLine',{configurable:true,get:()=>false});
   const rec={err:'base'};window.e99NetFail(rec,()=>{});await new Promise(r=>setTimeout(r,500));Object.defineProperty(navigator,'onLine',d||{value:true});return rec.err});
 ok(off==='base','A: sem internet de verdade (onLine=false) não roda o teste de serviços');

 /* B: painel "Rede da loja / Antivírus" abre na aba Dados */
 await p.evaluate(()=>go('data'));await p.waitForTimeout(600);
 ok(await p.evaluate(()=>!!document.getElementById('net-panel')&&/Rede da loja/.test(document.getElementById('net-panel').textContent)&&/Bitdefender/.test(document.getElementById('net-panel').textContent)),'B: painel "Rede da loja / Antivírus" com passo a passo do Bitdefender');

 /* B: "Testar conexão" lista o que passou/bloqueou (e99NetList mockada) */
 await p.evaluate(()=>{window.e99NetList=async()=>[{name:'equipe e chat (ntfy.sh)',ok:false},{name:'banco da nuvem (firestore.googleapis.com)',ok:true}]});
 await p.click('#net-test');await until(p,()=>/bloqueado|passou/.test((document.getElementById('net-result')||{}).textContent||''),null,6000);
 const res=await p.evaluate(()=>document.getElementById('net-result').textContent);
 ok(/ntfy\.sh[^]*bloqueado/.test(res)&&/firestore[^]*passou/.test(res),'B: "Testar conexão" lista passou/bloqueado por serviço');

 /* C: liga os Efeitos de energia → classe no body + aura no topo do Início */
 await p.evaluate(()=>{e99Anime.set(true);go('home')});await p.waitForTimeout(700);
 ok(await p.evaluate(()=>e99Anime.on()===true&&document.body.classList.contains('e99-anime')),'C: efeitos ligados pela preferência (body.e99-anime)');
 ok(await p.evaluate(()=>{const h=document.querySelector('.hero-home');return !!(h&&h.querySelector('#e99-aura'))}),'C: aura de energia montada no topo do Início');
 ok(await p.evaluate(()=>{const n=document.querySelectorAll('.e99-powerup').length;window.e99PowerUp();const a=document.querySelectorAll('.e99-powerup').length;return a>n}),'C: power-up aparece com efeitos ligados');
 /* preferência em Preferências → Aparência */
 await p.evaluate(()=>go('account'));await p.waitForTimeout(500);
 ok(await p.evaluate(()=>!!document.getElementById('pref-anime-row')),'C: preferência "Efeitos de energia" em Aparência');
 /* desliga: sem aura */
 await p.evaluate(()=>{e99Anime.set(false);go('home')});await p.waitForTimeout(500);
 ok(await p.evaluate(()=>!document.body.classList.contains('e99-anime')&&!document.getElementById('e99-aura')),'C: desligado remove a aura');
 await ctx.close()}

/* ---- "menos movimento": mesmo ligado, fica parado ---- */
{const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const p=await ctx.newPage();p.on('pageerror',e=>errs.push('reduce '+e.message));p.on('dialog',d=>d.accept());
 await p.goto(U);await p.waitForTimeout(2000);await signup(p,'g2'+Date.now().toString(36));await p.waitForTimeout(600);
 await p.evaluate(()=>{e99Anime.set(true);go('home')});await p.waitForTimeout(600);
 ok(await p.evaluate(()=>e99Anime.on()===false&&!document.body.classList.contains('e99-anime')&&!document.getElementById('e99-aura')),'menos movimento: efeitos ficam parados mesmo com a preferência ligada');
 ok(await p.evaluate(()=>{window.e99PowerUp();return document.querySelectorAll('.e99-powerup').length===0}),'menos movimento: power-up não dispara');
 await ctx.close()}

ok(!errs.length,'sem erros de página '+errs.slice(0,3).join(' | '));
await b.close()})();
