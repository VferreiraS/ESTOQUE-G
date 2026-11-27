/* v168: quando o usuário da nuvem troca no meio (ex.: link de acesso entra anônimo e depois a conta liga o e-mail),
   a escuta dos dados da loja recebia "permission-denied" do usuário antigo e ficava em "erro" até a revisão de 60 s
   (chaves do chat, grupos e o aviso "Dados da loja na nuvem" sumiam). Agora religa em segundos com o usuário novo. iPhone 13. */
const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const c=await b.newContext({...L.devices['iPhone 13']});const P=await c.newPage();
 P.on('pageerror',e=>errs.push(e.message));P.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(P,'uidtroca'),'gestor com equipe e nuvem');
 ok(await until(P,()=>e99Loja.status().status==='ok'&&e99Loja.status().seeded,null,40000),'dados da loja na nuvem ligados');
 const u0=await P.evaluate(()=>e99Loja.status().uid);
 /* troca o usuário da nuvem (como no link de acesso: anônimo ↔ e-mail) */
 /* o apoio de teste do lib.js religa a loja sozinho ao dar papel; aqui fica sem, como na vida real */await P.evaluate(()=>localStorage.setItem('e99-test-nopapel','1'));
 const u1=await P.evaluate(async()=>{const c=await e99Cloud.load();return (await c.auth.signInAnonymously()).user.uid});
 ok(u1&&u1!==u0,'usuário da nuvem trocou');
 const t0=Date.now();let bad=false;const fast=await until(P,u=>{const s=e99Loja.status();if(s.status==='erro')window.__e168=1;return s.status==='ok'&&s.uid===u},u1,15000);
 bad=await P.evaluate(()=>!!window.__e168);
 ok(fast,'religou com o usuário novo em '+((Date.now()-t0)/1000).toFixed(1)+' s (antes: ficava em erro até religar)');
 ok(!bad,'não passou por "erro" na troca');
 await P.evaluate(()=>go('home'));await P.waitForTimeout(600);
 ok(await P.evaluate(()=>/Dados da loja na nuvem/.test((document.getElementById('loja-note')||{}).textContent||'')),'Início continua com "Dados da loja na nuvem"');
 ok(!errs.length,'sem erro de página'+(errs.length?': '+errs.join(' | '):''));await b.close()})();
