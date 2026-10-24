const L=require('./lib.js');const {ok,until}=L;
(async()=>{const b=await L.chromium.launch();const errs=[];const A=await (await b.newContext(L.devices['iPhone 13'])).newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 const l='tp'+Date.now();await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForTimeout(1500);
 ok(await A.evaluate(()=>e99Totp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',59000))==='287082','código igual ao padrão dos apps Authenticator (RFC 6238)');
 await L.signup(A,l);await A.evaluate(async()=>{state.team=[{id:'zz',name:'Marcador TOTP',role:'x'}];await save();go('account')});
 await A.click('text=Ativar Authenticator');ok(await until(A,()=>!!document.querySelector('.totp-qr svg'),null,10000),'QR code para o Authenticator'); // v86: o leitor/QR (ZXing) carrega sob demanda
 const secret=await A.evaluate(()=>document.querySelector('.totp-secret').textContent.replace(/\s/g,''));
 await A.fill('#totp-panel input[name=code]','000000');await A.fill('#totp-panel input[name=password]','1234');await A.click('#totp-panel button.primary');await A.waitForTimeout(500);ok(await A.evaluate(()=>!!document.querySelector('#totp-panel input[name=code]')),'código errado é recusado');
 await A.fill('#totp-panel input[name=code]',await A.evaluate(s=>e99Totp(s),secret));await A.click('#totp-panel button.primary');ok(await until(A,()=>/✓ Ativado/.test(document.getElementById('totp-panel').innerText),null,5000),'Authenticator ativado');
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1200);ok(!!await A.$('#totp-link'),'botão "Entrar com o código do Authenticator"');
 await A.click('#auth-forgot');await A.click('#totp-link');await A.fill('#totp-rec input[name=login]',l);await A.fill('#totp-rec input[name=code]','123456');await A.fill('#totp-rec input[name=password]','9753');await A.fill('#totp-rec input[name=confirmation]','9753');await A.click('#totp-rec button.primary');await A.waitForTimeout(500);
 ok(/Código errado/.test(await A.textContent('#totp-err')),'código errado na recuperação é recusado');
 await A.fill('#totp-rec input[name=code]',await A.evaluate(s=>e99Totp(s),secret));await A.click('#totp-rec button.primary');
 ok(await until(A,()=>!!authSession&&state.team.some(t=>t.name==='Marcador TOTP'),null,10000),'entrou com o Authenticator e manteve os dados');
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1200);await L.login(A,l,'9753');ok(await A.evaluate(()=>!!authSession),'senha nova funciona');
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1200);await A.click('#auth-forgot');await A.click('#totp-link');await A.fill('#totp-rec input[name=login]',l);await A.fill('#totp-rec input[name=code]',await A.evaluate(s=>e99Totp(s),secret));await A.fill('#totp-rec input[name=password]','1357');await A.fill('#totp-rec input[name=confirmation]','1357');await A.click('#totp-rec button.primary');
 ok(await until(A,()=>!!authSession&&state.team.some(t=>t.name==='Marcador TOTP'),null,10000),'continua funcionando depois da troca de senha');
 console.log('errors',errs);await b.close()})();
