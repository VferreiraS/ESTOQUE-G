/* v120: limite de requisição — login (5/min por login) no PC e iPhone 13 (o limite de envios do chat fica no chat.js; v148). (O Worker da IA saiu na v121.) */
const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['pc',{viewport:{width:1440,height:900}}],['iphone',L.devices['iPhone 13']]]){
  const P=await (await b.newContext(opts)).newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept());
  await P.goto('http://localhost:8000/index.html');await P.waitForTimeout(1200);
  const l='lim'+nome+T;await P.evaluate(async l=>{const s=await authCreate(l,'Loja '+l,'1234',authEmpty(),'estoque','x.'+l+'@teste.com');authSaveNewAccount(s)},l);
  for(let i=0;i<5;i++){await P.fill('#auth-form input[name=login]',l);await P.fill('#auth-form input[name=password]','9999');await P.click('#auth-form button[type=submit]');await P.waitForTimeout(1300)}
  await P.fill('#auth-form input[name=login]',l);await P.fill('#auth-form input[name=password]','1234');await P.click('#auth-form button[type=submit]');await P.waitForTimeout(1200);
  ok(await P.evaluate(()=>!authSession&&/Muitas tentativas, aguarde \d+ s/.test(document.querySelector('#auth-screen .auth-error').textContent)),nome+': 6ª tentativa no mesmo minuto é barrada com "Muitas tentativas, aguarde X s"');
  await P.reload();await P.waitForTimeout(1200);ok(await P.evaluate(l=>e99LoginWait(l)>0,l),nome+': o limite vale depois de recarregar');
  await P.evaluate(l=>{const o=JSON.parse(localStorage.getItem('lojasg.estoque99.login-tries'));Object.keys(o).forEach(k=>o[k]=o[k].map(t=>t-61000));localStorage.setItem('lojasg.estoque99.login-tries',JSON.stringify(o))},l);
  await L.login(P,l,'1234');ok(await P.evaluate(()=>!!authSession),nome+': depois de 1 minuto entra normal');
  ok(await P.evaluate(l=>e99LoginWait(l)===0&&!localStorage.getItem('lojasg.estoque99.login-tries').includes('['),l),nome+': entrar com sucesso zera as tentativas');
  await P.close();
 }
 console.log('errors',errs);await b.close()})();
