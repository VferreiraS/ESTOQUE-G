const L=require('./lib.js');const {ok,until}=L;const P='gen-lang-client-0167474823',AU='http://127.0.0.1:9099',FS=`http://127.0.0.1:8080/v1/projects/${P}/databases/(default)/documents`;
async function resetPw(email,np){const r=await (await fetch(`${AU}/emulator/v1/projects/${P}/oobCodes`)).json();const c=(r.oobCodes||[]).filter(x=>x.requestType==='PASSWORD_RESET'&&x.email===email).pop();return (await fetch(`${AU}/identitytoolkit.googleapis.com/v1/accounts:resetPassword?key=x`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({oobCode:c.oobCode,newPassword:np})})).ok}
(async()=>{const b=await L.chromium.launch();const errs=[];const A=await (await b.newContext(L.devices['iPhone 13'])).newPage();A.on('pageerror',e=>errs.push(e.message));A.on('dialog',d=>d.accept());
 const l='rg'+Date.now();ok(await L.gestorWithTeam(A,l),'conta com equipe');
 const uid=await A.evaluate(async()=>{for(let i=0;i<40&&!(window.e99Cloud&&e99Cloud.user());i++)await new Promise(r=>setTimeout(r,500));return e99Cloud.user().uid}),email=await A.evaluate(()=>e99Cloud.user().email);
 const code=await A.evaluate(()=>e99Team.get().code);ok(await until(A,async(a)=>(await fetch(a,{headers:{Authorization:'Bearer owner'}})).status===200,FS+'/equipes/'+uid,30000),'equipe guardada na nuvem');
 await fetch(FS+'/cofre/'+uid,{method:'DELETE',headers:{Authorization:'Bearer owner'}});
 await A.evaluate(()=>{window.confirm=()=>true;return authLogout()});await A.waitForTimeout(1500);
 await A.click('#auth-forgot');await A.click('#mr-link');await A.fill('#mail-rec input[name=email]',email);await A.click('#mail-rec button.primary');await A.waitForSelector('#mail-rec input[name=cloud]');await resetPw(email,'nuvem-789');
 await A.fill('#mail-rec input[name=cloud]','nuvem-789');await A.fill('#mail-rec input[name=password]','8642');await A.fill('#mail-rec input[name=confirmation]','8642');await A.click('#mail-rec button.primary');
 ok(await until(A,()=>!!authSession,null,20000),'conta nova criada');ok(await A.evaluate(()=>authSession.payload.role==='estoque'),'conta nova mantém o papel da nuvem (estoque não vira gestor)');
 ok(await A.evaluate(()=>!Object.keys(localStorage).some(k=>k.startsWith('lojasg.estoque99.conta-antiga:'))),'conta antiga excluída do aparelho');
 ok(await until(A,(u)=>!!(window.e99Cloud&&e99Cloud.user()&&e99Cloud.user().uid===u),uid,20000),'mesma identidade na nuvem');
 ok(await until(A,(c)=>!!(window.e99Team&&e99Team.get()&&e99Team.get().code===c),code,20000),'voltou para o chat da equipe sozinho');
 console.log('errors',errs);await b.close()})();
