/* v89: o service worker não guarda outras páginas (ex.: central-agentes/) como se fossem o app (S12). */
const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const c=await b.newContext({viewport:{width:1300,height:900}});const A=await c.newPage();A.on('pageerror',e=>errs.push(e.message));
 await A.goto('http://localhost:8000/index.html');ok(await until(A,()=>!!(navigator.serviceWorker&&navigator.serviceWorker.controller),null,20000),'service worker ativo');
 await A.goto('http://localhost:8000/central-agentes/index.html');await A.waitForTimeout(1500);
 const r=await A.evaluate(async()=>{const ks=await caches.keys();const k=ks.find(x=>x.startsWith('estoque99-'));const cc=await caches.open(k);const m=await cc.match(location.origin+'/index.html');const t=m?await m.text():'';const own=await cc.match(location.href);return {app:/estoque99-version/.test(t),agents:/Central de Agentes/i.test(t),own:!!own}});
 ok(r.app&&!r.agents,'cópia do app (index.html) continua sendo o app');ok(r.own,'a outra página fica guardada com o próprio endereço');
 await c.setOffline(true);await A.goto('http://localhost:8000/index.html').catch(()=>{});await A.waitForTimeout(1500);ok(await A.evaluate(()=>!!document.querySelector('meta[name="estoque99-version"]')),'sem internet abre o app certo');
 console.log('errors',errs);await b.close()})();
