/* v135: index.html dividido em app/css e app/js (mesma ordem, mesmo comportamento). PC 1440×900 + iPhone 13:
   nenhum arquivo app/* falha, 0 erro de console, entra e passa por todas as telas, abre sem internet depois da 1ª carga. */
const L=require('./lib.js');const {ok,until,signup}=L;const fs=require('fs');
const BASE=process.env.BASE||'http://localhost:8000';const U=BASE+'/index.html?ntfy='+L.N;
const html=fs.readFileSync(__dirname+'/../index.html','utf8'),sw=fs.readFileSync(__dirname+'/../sw.js','utf8');
const V=(html.match(/name="estoque99-version" content="(\d+)"/)||[])[1];
const refs=[...html.matchAll(/(?:src|href)="(app\/(?:js|css)\/[^"?]+)\?v=(\d+)"/g)];
ok(refs.length>50&&refs.every(r=>r[2]===V),'index.html: '+refs.length+' arquivos app/ com ?v='+V);
ok(refs.every(r=>fs.existsSync(__dirname+'/../'+r[1])&&sw.includes("'"+r[1]+"'")),'todo arquivo app/ existe e está no pré-cache do sw.js');
ok(sw.includes("'estoque99-v"+V+"'"),'CACHE do sw.js = versão do index.html');
ok(!/<script\b[^>]*>[^<]{1000,}/.test(html.slice(html.indexOf('<body')).replace(/<script type="text\/plain"[\s\S]*?<\/script>/g,'')),'nenhum bloco grande de JS ficou inline no <body>');
ok(/id="v126-reset-js">/.test(html)&&/__e99BootT0=Date\.now\(\)/.test(html)&&/<style id="v121-boot-css">/.test(html),'reset v126, tema e boot continuam inline');
function watch(p,tag,errs,bad){p.on('pageerror',e=>errs.push(tag+' '+e.message));
 p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(tag+' console: '+m.text())});
 p.on('response',r=>{if(/\/app\//.test(r.url())&&r.status()>=400)bad.push(tag+' '+r.status()+' '+r.url())});
 p.on('requestfailed',r=>{if(/\/app\//.test(r.url()))bad.push(tag+' falhou '+r.url())})}
async function run(b,tag,opts){const errs=[],bad=[];const ctx=await b.newContext(opts);const p=await ctx.newPage();watch(p,tag,errs,bad);
 await p.goto(U);await p.waitForTimeout(2000);
 ok(await p.evaluate(()=>typeof go==='function'&&typeof render==='function'&&typeof chatSend==='function'&&!!window.e99Conf&&!!window.e99Week),tag+': funções do app carregadas dos arquivos');
 ok(await p.evaluate(()=>getComputedStyle(document.body).backgroundColor!=='rgba(0, 0, 0, 0)'&&!!document.getElementById('auth-screen')),tag+': estilos aplicados');
 await signup(p,'v135'+Date.now().toString(36));await p.waitForTimeout(800);
 const pages=await p.evaluate(()=>Object.keys(labels).concat(['account']).filter((x,i,a)=>a.indexOf(x)===i));
 const vazio=[];for(const pg of pages){await p.evaluate(x=>{go(x);scrollTo(0,0)},pg);await p.waitForTimeout(350);if(!(await p.evaluate(()=>(document.getElementById('view')||{}).innerText||'')).trim())vazio.push(pg)}
 ok(pages.length>=6&&!vazio.length,tag+': '+pages.length+' telas abrem com conteúdo'+(vazio.length?' → vazias: '+vazio.join(','):''));
 ok(await until(p,()=>!!(navigator.serviceWorker&&navigator.serviceWorker.controller),null,20000),tag+': service worker ativo');
 await p.waitForTimeout(1500);
 const miss=await p.evaluate(async files=>{const k=(await caches.keys()).find(x=>x.startsWith('estoque99-'));const c=await caches.open(k);const out=[];for(const f of files)if(!(await c.match(new URL(f,location.href).href)))out.push(f);return out},refs.map(r=>r[1]+'?v='+r[2]));
 ok(!miss.length,tag+': todos os arquivos app/ no cache do service worker'+(miss.length?' → faltam '+miss.slice(0,5).join(','):''));
 await ctx.setOffline(true);await p.goto(U).catch(()=>{});await p.waitForTimeout(2500);
 ok(await p.evaluate(()=>!!document.querySelector('meta[name="estoque99-version"]')&&typeof go==='function'&&typeof chatSend==='function'&&getComputedStyle(document.body).backgroundColor!=='rgba(0, 0, 0, 0)'),tag+': sem internet abre o app com JS e CSS');
 ok(!bad.length,tag+': nenhum arquivo app/ com erro'+(bad.length?' → '+bad.slice(0,5).join(' ; '):''));
 ok(!errs.length,tag+': 0 erro de console'+(errs.length?' → '+errs.slice(0,5).join(' ; '):''));
 await ctx.close()}
(async()=>{const b=await L.chromium.launch();
 await run(b,'PC',{viewport:{width:1440,height:900}});
 await run(b,'iPhone 13',L.devices['iPhone 13']);
 await b.close()})();
