/* v120: limite de requisição — login (5/min por login), envios ao ntfy (60/min) no PC e iPhone 13, e Worker da IA (20/min por IP). */
const L=require('./lib.js');const {ok,until}=L;const path=require('path'),url=require('url');
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['pc',{viewport:{width:1440,height:900}}],['iphone',L.devices['iPhone 13']]]){
  const P=await (await b.newContext(opts)).newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept());
  await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1200);
  const l='lim'+nome+T;await P.evaluate(async l=>{const s=await authCreate(l,'Loja '+l,'1234',authEmpty(),'estoque','x.'+l+'@teste.com');authSaveNewAccount(s)},l);
  for(let i=0;i<5;i++){await P.fill('#auth-form input[name=login]',l);await P.fill('#auth-form input[name=password]','9999');await P.click('#auth-form button[type=submit]');await P.waitForTimeout(1300)}
  await P.fill('#auth-form input[name=login]',l);await P.fill('#auth-form input[name=password]','1234');await P.click('#auth-form button[type=submit]');await P.waitForTimeout(1200);
  ok(await P.evaluate(()=>!authSession&&/Muitas tentativas, aguarde \d+ s/.test(document.querySelector('#auth-screen .auth-error').textContent)),nome+': 6ª tentativa no mesmo minuto é barrada com "Muitas tentativas, aguarde X s"');
  await P.reload();await P.waitForTimeout(1200);ok(await P.evaluate(l=>e99LoginWait(l)>0,l),nome+': o limite vale depois de recarregar');
  await P.evaluate(l=>{const o=JSON.parse(localStorage.getItem('lojasg.estoque99.login-tries'));Object.keys(o).forEach(k=>o[k]=o[k].map(t=>t-61000));localStorage.setItem('lojasg.estoque99.login-tries',JSON.stringify(o))},l);
  await L.login(P,l,'1234');ok(await P.evaluate(()=>!!authSession),nome+': depois de 1 minuto entra normal');
  ok(await P.evaluate(l=>e99LoginWait(l)===0&&!localStorage.getItem('lojasg.estoque99.login-tries').includes('['),l),nome+': entrar com sucesso zera as tentativas');
  /* ntfy: 60 por minuto, depois 429 sem chegar ao servidor */
  const r=await P.evaluate(async n=>{const out=[];for(let i=0;i<62;i++){const x=await fetch(n+'/e99-limite-teste',{method:'POST',body:'x'+i});out.push(x.status)}return out},L.N);
  ok(r.slice(0,60).every(s=>s===200)&&r[60]===429&&r[61]===429,nome+': envios ao ntfy acima de 60/min voltam 429 ('+r.filter(s=>s===429).length+' barrados)');
  ok(await P.evaluate(n=>fetch(n+'/v1/health').then(x=>x.status!==429),L.N),nome+': leituras (GET) não são limitadas');
  await P.close();
 }
 /* Worker da IA */
 const W=(await import(url.pathToFileURL(path.resolve('cloudflare/ia-worker.js')).href)).default;global.fetch=async()=>new Response(JSON.stringify({choices:[{message:{content:'ok'}}]}),{status:200});
 const env={SENHA:'s',AI:{run:async()=>({response:'ok'})}};const req=ip=>new Request('https://w.test/',{method:'POST',headers:{Authorization:'Bearer s','Content-Type':'application/json','CF-Connecting-IP':ip,Origin:'https://vferreiras.github.io'},body:JSON.stringify({messages:[{role:'user',content:'oi'}]})});
 const st=[];for(let i=0;i<21;i++)st.push((await W.fetch(req('1.2.3.4'),env)).status);
 const last=await W.fetch(req('1.2.3.4'),env);
 ok(st.slice(0,20).every(s=>s===200)&&st[20]===429&&last.headers.get('Retry-After')&&/aguarde/.test(JSON.parse(await last.text()).error.message),'Worker: 21ª requisição do mesmo IP no minuto = 429 com Retry-After');
 ok((await W.fetch(req('5.6.7.8'),env)).status===200,'Worker: outro IP continua normal');
 console.log('errors',errs);await b.close()})();
