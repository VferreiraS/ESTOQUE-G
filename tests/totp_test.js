const L=require('./lib.js');const {ok,until}=L;const crypto=require('crypto');
/* v89: o app não expõe mais e99Totp; o código é calculado aqui (RFC 6238) */
function totp(sec,at){const A='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let bits='';for(const c of sec.toUpperCase().replace(/[^A-Z2-7]/g,''))bits+=A.indexOf(c).toString(2).padStart(5,'0');const k=[];for(let i=0;i+8<=bits.length;i+=8)k.push(parseInt(bits.slice(i,i+8),2));
 const b=Buffer.alloc(8);const t=Math.floor((at||Date.now())/30000);b.writeUInt32BE(Math.floor(t/4294967296),0);b.writeUInt32BE(t>>>0,4);const h=crypto.createHmac('sha1',Buffer.from(k)).update(b).digest();const o=h[19]&15;return String(((h[o]&127)<<24|h[o+1]<<16|h[o+2]<<8|h[o+3])%1e6).padStart(6,'0')}
(async()=>{const b=await L.chromium.launch();const errs=[];const A=await (await b.newContext(L.devices['iPhone 13'])).newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 const l='tp'+Date.now();await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForTimeout(1500);
 ok(totp('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',59000)==='287082','código do teste igual ao padrão RFC 6238');ok(await A.evaluate(()=>typeof window.e99Totp==='undefined'),'e99Totp não fica exposto no app');
 await L.signup(A,l);await A.evaluate(async()=>{state.team=[{id:'zz',name:'Marcador TOTP',role:'x'}];await save();go('account')});
 await A.click('text=Ativar Authenticator');ok(await until(A,()=>!!document.querySelector('.totp-qr svg'),null,10000),'QR code para o Authenticator'); // v86: o leitor/QR (ZXing) carrega sob demanda
 const secret=await A.evaluate(()=>document.querySelector('.totp-secret').textContent.replace(/\s/g,''));
 await A.fill('#totp-panel input[name=code]','000000');await A.fill('#totp-panel input[name=password]','1234');await A.click('#totp-panel button.primary');await A.waitForTimeout(500);ok(await A.evaluate(()=>!!document.querySelector('#totp-panel input[name=code]')),'código errado é recusado');
 await A.fill('#totp-panel input[name=code]',totp(secret));await A.click('#totp-panel button.primary');ok(await until(A,()=>/✓ Ativado/.test(document.getElementById('totp-panel').innerText),null,5000),'Authenticator ativado');
 ok(await A.evaluate(s=>{const k=Object.keys(localStorage).find(k=>k.startsWith('lojasg.estoque99.totp:'));const v=localStorage.getItem(k)||'';return !!k&&v.indexOf(s)<0&&!/"secret"/.test(v)},secret),'chave do Authenticator não fica em claro no aparelho');
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1200);ok(!!await A.$('#totp-link'),'botão "Entrar com o código do Authenticator"');
 await A.click('#auth-forgot');await A.click('#totp-link');await A.fill('#totp-rec input[name=login]',l);await A.fill('#totp-rec input[name=key]',secret);await A.fill('#totp-rec input[name=code]','123456');await A.fill('#totp-rec input[name=password]','9753');await A.fill('#totp-rec input[name=confirmation]','9753');await A.click('#totp-rec button.primary');await A.waitForTimeout(500);
 ok(/código errado/i.test(await A.textContent('#totp-err')),'código errado na recuperação é recusado');
 await A.fill('#totp-rec input[name=code]',totp(secret));await A.click('#totp-rec button.primary');
 ok(await until(A,()=>!!authSession&&state.team.some(t=>t.name==='Marcador TOTP'),null,10000),'entrou com o Authenticator e manteve os dados');
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1200);await L.login(A,l,'9753');ok(await A.evaluate(()=>!!authSession),'senha nova funciona');
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1200);await A.click('#auth-forgot');await A.click('#totp-link');await A.fill('#totp-rec input[name=login]',l);await A.fill('#totp-rec input[name=key]',secret);await A.fill('#totp-rec input[name=code]',totp(secret));await A.fill('#totp-rec input[name=password]','1357');await A.fill('#totp-rec input[name=confirmation]','1357');await A.click('#totp-rec button.primary');
 ok(await until(A,()=>!!authSession&&state.team.some(t=>t.name==='Marcador TOTP'),null,10000),'continua funcionando depois da troca de senha');
 /* conta com Authenticator antigo (chave em claro): a chave some e o app pede para ativar de novo */
 await A.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('lojasg.estoque99.totp:'));localStorage.setItem(k,JSON.stringify({secret:'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ',w:{iv:'x',cipher:'y'},salt:'z'}))});
 await A.reload();await A.waitForTimeout(2000);ok(await A.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('lojasg.estoque99.totp:'));return !/GEZDGNBV/.test(localStorage.getItem(k))}),'chave antiga em claro é apagada na abertura');
 await L.login(A,l,'1357');await A.evaluate(()=>go('account'));await A.waitForTimeout(600);ok(/Ative de novo/.test(await A.textContent('#totp-panel')),'aviso claro para ativar de novo');
 console.log('errors',errs);await b.close()})();
