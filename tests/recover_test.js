const L=require('./lib.js');const {ok,until}=L;const P='gen-lang-client-0167474823',AU='http://127.0.0.1:9099',FS=`http://127.0.0.1:8080/v1/projects/${P}/databases/(default)/documents`;
async function resetPw(email,np){const r=await (await fetch(`${AU}/emulator/v1/projects/${P}/oobCodes`)).json();const c=(r.oobCodes||[]).filter(x=>x.requestType==='PASSWORD_RESET'&&x.email===email).pop();if(!c)return false;const q=await fetch(`${AU}/identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=x`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({oobCode:c.oobCode,newPassword:np})});return q.ok}
async function recover(A,email,cloud,pw){await A.click('#mr-link');await A.fill('#mail-rec input[name=email]',email);await A.click('#mail-rec button.primary');await A.waitForSelector('#mail-rec input[name=cloud]');ok(await resetPw(email,cloud),'link de redefinição chegou ao e-mail');
 await A.fill('#mail-rec input[name=cloud]',cloud);await A.fill('#mail-rec input[name=password]',pw);await A.fill('#mail-rec input[name=confirmation]',pw);await A.click('#mail-rec button.primary')}
(async()=>{const b=await L.chromium.launch();const errs=[];const A=await (await b.newContext({viewport:{width:1300,height:900}})).newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 const l='rc'+Date.now();await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForTimeout(1500);await L.signup(A,l);
 await A.evaluate(async()=>{state.team=[{id:'zz',name:'Marcador Secreto',role:'x'}];await save()});
 ok(await until(A,()=>!!(window.e99Cloud&&e99Cloud.user()),null,20000),'conta ligada à nuvem');const uid=await A.evaluate(()=>e99Cloud.user().uid),email=await A.evaluate(()=>e99Cloud.user().email);
 ok(await until(A,async(u)=>(await fetch('http://127.0.0.1:8080/v1/projects/gen-lang-client-0167474823/databases/(default)/documents/cofre/'+u,{headers:{Authorization:'Bearer owner'}})).status===200,uid,30000),'cofre guardado na nuvem');
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1500);
 ok(!!await A.$('#mr-link'),'link "recuperar pelo e-mail" na tela de entrar');
 await recover(A,email,'nuvem-123','5678');ok(await until(A,()=>!!authSession&&state.team.some(t=>t.name==='Marcador Secreto'),null,20000),'conta recuperada com os dados');
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1200);await L.login(A,l,'5678');ok(await A.evaluate(()=>!!authSession),'entra com a senha nova');
 // conta antiga, sem cofre
 await fetch(FS+'/cofre/'+uid,{method:'DELETE',headers:{Authorization:'Bearer owner'}});await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1200);
 await recover(A,email,'nuvem-456','2468');ok(await until(A,()=>!!authSession,null,20000),'conta antiga recomeçada');
 ok(await A.evaluate((l)=>authLoginName(authSession.record.login)===l&&!state.team.some(t=>t.name==='Marcador Secreto'),l),'mesmo login, dados do aparelho recomeçados');
 ok(await until(A,(u)=>!!(window.e99Cloud&&e99Cloud.user()&&e99Cloud.user().uid===u),uid,20000),'mesma conta da nuvem (perfil e selo voltam)');
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1200);await L.login(A,l,'2468');ok(await A.evaluate(()=>!!authSession),'entra com a senha nova (2)');
 ok(await until(A,(u)=>!!(window.e99Cloud&&e99Cloud.user()&&e99Cloud.user().uid===u),uid,20000),'nuvem continua ligada depois');
 // conta aberta (sem saber a senha): troca pelo e-mail sem perder dados
 await A.evaluate(async()=>{state.team.push({id:'yy',name:'Marcador Aberto',role:'x'});await save()});await A.evaluate(()=>go('account'));await A.waitForTimeout(600);
 await A.click('#forgot-panel button');ok(await A.inputValue('#mail-rec input[name=email]')===email,'e-mail já preenchido');await A.click('#mail-rec button.primary');await A.waitForSelector('#mail-rec input[name=cloud]');ok(await resetPw(email,'nuvem-789'),'link chegou (conta aberta)');
 await A.fill('#mail-rec input[name=cloud]','nuvem-789');await A.fill('#mail-rec input[name=password]','1357');await A.fill('#mail-rec input[name=confirmation]','1357');await A.click('#mail-rec button.primary');
 ok(await until(A,()=>!!authShownCode,null,20000),'senha trocada com a conta aberta');ok(await A.evaluate(()=>state.team.some(t=>t.name==='Marcador Aberto')),'dados continuam');
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1200);await L.login(A,l,'1357');ok(await A.evaluate(()=>!!authSession&&state.team.some(t=>t.name==='Marcador Aberto')),'entra com a senha nova e os dados');
 ok(await until(A,(u)=>!!(window.e99Cloud&&e99Cloud.user()&&e99Cloud.user().uid===u),uid,20000),'nuvem ligada com a senha nova');
 console.log('errors',errs);await b.close()})();
