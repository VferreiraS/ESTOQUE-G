/* v115: "O que mudou?" no iPhone 13 e no PC — lista aparece (também sem rede, pelo cache do SW), abre no topo, título e
   "Pausar animação" não se sobrepõem, e o contador de novidades bate com as não vistas (o sino é o de Alertas). */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs'),path=require('path');
const OUT=process.env.SHOTS||path.join(require('os').tmpdir(),'stok-v115');fs.mkdirSync(OUT,{recursive:true});
const N=JSON.parse(fs.readFileSync(path.join(__dirname,'..','novidades.json'),'utf8')).versoes.length;
const hit=(a,b)=>a.l<b.r-.5&&b.l<a.r-.5&&a.t<b.b-.5&&b.t<a.b-.5;
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['iphone',L.devices['iPhone 13']],['pc',{viewport:{width:1440,height:900}}]]){
  const P=await (await b.newContext(opts)).newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept());
  await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1500);await L.signup(P,'nv5'+nome+T);
  await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});go('home')});await P.waitForTimeout(1200);
  const menu=await P.evaluate(()=>{const s=document.querySelector('[onclick="go(\'novidades\')"] .nav-unread');return s?+s.textContent:0});
  const real=await P.evaluate(()=>e99NovidadesUnseen());
  ok(real===N&&(menu===0||menu===real),nome+': contador de novidades = não vistas reais ('+real+' de '+N+')');
  ok(await P.evaluate(()=>/Alertas/.test(document.querySelector('.bell-btn,[onclick="go(\'alerts\')"]').getAttribute('aria-label')||document.querySelector('[onclick="go(\'alerts\')"]').textContent)),nome+': o sino é o contador de Alertas (não de novidades)');
  await P.evaluate(()=>scrollTo(0,99999));await P.evaluate(()=>go('novidades'));await P.waitForTimeout(1500);
  ok(await P.evaluate(()=>scrollY<5),nome+': a aba abre no topo');
  ok(await P.evaluate(n=>document.querySelectorAll('.nv-item').length===n&&document.querySelector('.nv-item').getBoundingClientRect().top<innerHeight,N),nome+': a lista aparece ('+N+' versões) e a primeira está na tela');
  const g=await P.evaluate(()=>{const r=e=>{const x=e.getBoundingClientRect();return {l:x.left,t:x.top,r:x.right,b:x.bottom}};const btn=document.querySelector('#view .hero .fx-pause');return {h:r(document.querySelector('#view .hero h1')),b:btn&&btn.offsetParent?r(btn):null}});
  ok(!g.b||!hit(g.h,g.b),nome+': título e "Pausar animação" não se sobrepõem');
  await P.screenshot({path:path.join(OUT,nome+'-o-que-mudou.png')});
  ok(await until(P,()=>!document.querySelector('[onclick="go(\'novidades\')"] .nav-unread')&&e99NovidadesUnseen()===0,null,5000),nome+': depois de abrir, nenhuma não vista');
  /* sem rede: usa a cópia do service worker */
  if(nome==='iphone'){
   await P.reload();await P.waitForTimeout(2500);if(!(await P.evaluate(()=>!!authSession)))await L.login(P,'nv5'+nome+T,'1234');
   await P.evaluate(async()=>{const c=await caches.open('estoque99-teste');await c.put('./novidades.json',new Response(JSON.stringify({versoes:[{v:1,data:'2026-01-01',titulo:'do cache',descricao:'',cat:'ajuste'}]}),{headers:{'content-type':'application/json'}}))});
   await P.route('**/novidades.json',r=>r.abort());
   const fresh=await P.evaluate(async()=>{const r=await fetch('novidades.json').then(()=>1,()=>0);return r});
   await P.evaluate(()=>{location.hash='';});await P.reload();await P.waitForTimeout(2500);if(!(await P.evaluate(()=>!!authSession)))await L.login(P,'nv5'+nome+T,'1234');
   await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});go('novidades')});
   ok(await until(P,()=>document.querySelectorAll('.nv-item').length>0,null,8000),'iphone: sem rede, a lista vem da cópia guardada no aparelho');
   await P.evaluate(async()=>{for(const k of await caches.keys())await caches.delete(k)});await P.reload();await P.waitForTimeout(2500);if(!(await P.evaluate(()=>!!authSession)))await L.login(P,'nv5'+nome+T,'1234');
   await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});go('novidades')});
   ok(await until(P,()=>/Tentar de novo/.test(document.getElementById('view').textContent),null,8000),'iphone: sem rede e sem cópia, mostra "Tentar de novo" (não fica em branco)');
   await P.unroute('**/novidades.json');await P.evaluate(()=>e99NvRetry());ok(await until(P,()=>document.querySelectorAll('.nv-item').length>10,null,8000),'iphone: "Tentar de novo" carrega a lista');
  }
  await P.close();
 }
 console.log('shots',OUT);console.log('errors',errs);await b.close()})();
