const L=require('./lib.js');const {ok,until}=L;const crypto=require('crypto');
const P='gen-lang-client-0167474823',AU='http://127.0.0.1:9099',FS='http://127.0.0.1:8080',ROBOT='YVRBgV80TiNIBRXuoB5uP9qZNeY2';
const j=async(u,o={})=>{const r=await fetch(u,o);const t=await r.text();try{return {s:r.status,b:JSON.parse(t)}}catch(e){return {s:r.status,b:t}}};
const derive=(login,pw)=>'Stk#'+crypto.createHash('sha256').update('e99-cloud|'+login+'|'+pw).digest('hex').slice(0,40);
async function verifyAll(){const r=await j(`${AU}/emulator/v1/projects/${P}/oobCodes`);let n=0;for(const c of (r.b.oobCodes||[]))if(c.requestType==='VERIFY_EMAIL'){await fetch(c.oobLink.replace(/^https?:\/\/[^/]+/,AU));n++}return n}
async function token(email,pw){const r=await j(`${AU}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=x`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pw,returnSecureToken:true})});return r.b.idToken}
const doc=(path,tok)=>j(`${FS}/v1/projects/${P}/databases/(default)/documents/${path}`,{headers:{Authorization:'Bearer '+(tok||'owner')}});
(async()=>{const b=await L.chromium.launch({args:['--use-fake-device-for-media-stream','--use-fake-ui-for-media-stream']});const T=Date.now();const errs=[];
 await fetch(`${FS}/emulator/v1/projects/${P}/databases/(default)/documents`,{method:'DELETE'});await fetch(`${AU}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
 const A=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();const cb=await b.newContext(L.devices['iPhone 13']);const B=await cb.newPage();
 [A,B].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept())});
 const gl='gp'+T;ok(await L.gestorWithTeam(A,gl),'gestor team');
 ok(await until(A,()=>!!(window.e99Cloud&&e99Cloud.user()),null,20000),'gestor ligado à nuvem com o e-mail do cadastro');
 const aEmail=await A.evaluate(()=>e99Cloud.user().email);const aUid=await A.evaluate(()=>e99Cloud.user().uid);
 ok((await doc('usuarios/'+aUid)).s===200,'usuarios/{uid} do gestor gravado');
 const sid=await A.evaluate(()=>e99Cloud.sid());
 ok(await until(A,async(a)=>{const r=await fetch('http://127.0.0.1:8080/v1/projects/gen-lang-client-0167474823/databases/(default)/documents/lojas/'+a[0]+'/membros/'+a[1],{headers:{Authorization:'Bearer owner'}});return r.status===200},[sid,aUid],40000),'membro do gestor na loja');
 // convite com e-mail abre o app de e-mail (mailto)
 await A.evaluate(()=>{window.__mail='';const o=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(/^mailto:/.test(this.href)){window.__mail=this.href;return}return o.call(this)}});
 await A.evaluate(()=>go('chat'));await A.waitForTimeout(500);await A.click('#aux-box summary');await A.fill('#aux-box input[name=name]','Ana');await A.fill('#aux-box input[name=email]','ana.'+Date.now()%1e6+'@teste.com');await A.click('#aux-box button.primary');await A.waitForTimeout(2500);
 const mailto=await A.evaluate(()=>window.__mail);ok(/^mailto:ana\./.test(mailto)&&/auxiliar%3D|auxiliar=/.test(decodeURIComponent(mailto)),'convite por e-mail (mailto com o link)');
 const link=decodeURIComponent(mailto).match(/(http\S+#auxiliar=[A-Za-z0-9_-]+)/)[1];const KEY=await A.evaluate(()=>{const k=Object.keys(localStorage).find(k=>k.startsWith('lojasg.estoque99.aux-invites:'));return JSON.parse(localStorage.getItem(k))[0].key});
 await B.goto(L.inviteUrl(link));await B.waitForTimeout(2500);await B.fill('#aux-form input[name=pin]',KEY);await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);
 ok(/^ana\./.test(await B.inputValue('#aux-form input[name=email]')),'e-mail do convite já vem preenchido');
 await B.fill('#aux-form input[name=password]','4321');await B.fill('#aux-form input[name=confirmation]','4321');await B.click('#aux-form button[type=submit]');await B.waitForTimeout(3000);
 await B.fill('#recovery-last4',(await B.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await B.click('#recovery-enter');await B.waitForTimeout(2500);
 ok(await until(B,()=>!!(window.e99Cloud&&e99Cloud.user()),null,20000),'auxiliar ligado à nuvem');const bUid=await B.evaluate(()=>e99Cloud.user().uid);
 ok(await until(B,async(a)=>{const r=await fetch('http://127.0.0.1:8080/v1/projects/gen-lang-client-0167474823/databases/(default)/documents/lojas/'+a[0]+'/membros/'+a[1],{headers:{Authorization:'Bearer owner'}});if(r.status!==200)return false;const d=await r.json();return !!(d.fields.inviteId&&d.fields.inviteId.stringValue)},[sid,bUid],60000),'membro do auxiliar na loja (com o convite)');
 // o gestor perde o que veio pelo ntfy e recupera pela nuvem
 await A.evaluate(()=>{Object.keys(localStorage).filter(k=>k.startsWith('lojasg.estoque99.members:')).forEach(k=>localStorage.removeItem(k));e99Cloud.relisten()});
 ok(await until(A,()=>Object.keys(syncMembers()).some(k=>/^u/.test(k)&&syncMembers()[k].role==='auxiliar'),null,15000),'gestor recebe o membro pela nuvem');
 await A.evaluate(()=>{go('chat')});await A.waitForTimeout(800);const card=await A.evaluate(()=>e99AuxCardHTML());ok(/Ana[\s\S]*✓ Conta criada/.test(card),'convite marcado como Conta criada');ok(/e-mail a confirmar/.test(card),'mostra e-mail a confirmar');
 // confirmar e-mails (links do emulador) e atualizar
 ok(await verifyAll()>=2,'e-mails de confirmação enviados');
 await B.evaluate(()=>e99Cloud.after(true));await A.waitForTimeout(1500);await A.evaluate(()=>e99Cloud.after(true));
 ok(await until(A,()=>/e-mail confirmado/.test(e99AuxCardHTML()),null,15000),'gestor vê e-mail confirmado');
 // perfil do auxiliar chega ao gestor pela nuvem
 ok(await until(A,async(id)=>{const d=await new Promise(r=>{const q=indexedDB.open('estoque99-profiles');q.onsuccess=()=>r(q.result)});const ks=await new Promise(r=>{const t=d.transaction('p').objectStore('p').getAllKeys();t.onsuccess=()=>r(t.result)});return ks.some(k=>/\|fb[0-9a-f]+$/.test(k))},null,30000),'perfil do auxiliar chega pela nuvem');
 // resumo do dia na fila do robô
 await A.evaluate(()=>apRun());await A.waitForTimeout(3000);
 const q=await j(`${FS}/v1/projects/${P}/databases/(default)/documents/correio`,{headers:{Authorization:'Bearer owner'}});const mails=(q.b.documents||[]);ok(mails.length===1&&mails[0].fields.para.stringValue===bUid,'resumo do auxiliar na fila');
 if(mails[0])ok(/Repor arroz no 07/.test(mails[0].fields.texto.stringValue)&&/07 Mercearia/.test(mails[0].fields.texto.stringValue),'resumo tem atividade e corredor');
 // regras: robô lê; outros não
 await j(`${AU}/identitytoolkit.googleapis.com/v1/projects/${P}/accounts:batchCreate`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({users:[{localId:ROBOT,email:'robo@stok-e99.app',rawPassword:'robo-teste-123'}]})});
 const rt=await token('robo@stok-e99.app','robo-teste-123');const at=await token(aEmail,derive(gl,'1234'));
 ok((await doc('correio',rt)).s===200,'robô lista o correio');ok((await doc('correio',at)).s===403,'gestor não lê o correio');
 ok((await doc('usuarios/'+bUid,rt)).s===200,'robô lê o e-mail do auxiliar');ok((await doc('usuarios/'+bUid,at)).s===403,'gestor não lê dados particulares do auxiliar');
 const cg=await j(`${FS}/v1/projects/${P}/databases/(default)/documents:runQuery`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+rt},body:JSON.stringify({structuredQuery:{from:[{collectionId:'membros',allDescendants:true}]}})});ok(cg.s===200&&cg.b.filter(x=>x.document).length>=2,'robô lista membros de todas as lojas');
 const cg2=await j(`${FS}/v1/projects/${P}/databases/(default)/documents:runQuery`,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+at},body:JSON.stringify({structuredQuery:{from:[{collectionId:'membros',allDescendants:true}]}})});ok(cg2.s===403,'outros não listam membros de todas as lojas');
 const w=await j(`${FS}/v1/projects/${P}/databases/(default)/documents/lojas/${sid}/membros/${bUid}`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+at},body:JSON.stringify({fields:{login:{stringValue:'x'},role:{stringValue:'gestor'},criado:{integerValue:1},visto:{integerValue:1},verificado:{booleanValue:true}}})});ok(w.s===403,'gestor não altera o membro do auxiliar');
 // conta antiga (sem e-mail): ao entrar com a senha, pede para vincular
 await A.evaluate(()=>{localStorage.removeItem('lojasg.estoque99.cloud-email:'+authSession.storeKey)});await A.evaluate(()=>e99Cloud.load().then(c=>c.auth.signOut()));
 await A.evaluate(()=>{window.confirm=()=>true});await A.evaluate(()=>authLogout());await A.waitForTimeout(1500);await L.login(A,gl);
 ok(await until(A,()=>{const d=document.getElementById('cloud-link');return !!(d&&d.open)},null,10000),'conta antiga: pede para vincular o e-mail');
 ok(!(await A.$('#cloud-link input[name=password]')),'não pede a senha de novo logo depois do login');
 await A.fill('#cloud-link input[name=email]',aEmail);await A.click('#cloud-link button.primary');
 ok(await until(A,()=>!document.getElementById('cloud-link').open&&!!e99Cloud.user(),null,15000),'vinculou com o mesmo e-mail');
 // entrar digitando o e-mail no lugar do login
 await A.evaluate(()=>authLogout());await A.waitForTimeout(1500);await L.login(A,aEmail);ok(await A.evaluate(()=>!!authSession),'entra com o e-mail no lugar do login');
 // permissões
 await A.evaluate(()=>{localStorage.removeItem('e99-no-perm-step');e99PermStep()});await A.waitForTimeout(800);ok(await A.evaluate(()=>document.getElementById('perm-step').open&&document.querySelectorAll('#perm-step .perm-row').length===3),'passo de permissões com 3 itens');
 await A.click('#perm-step button[onclick*="camera"]');await A.waitForTimeout(1500);ok(/Câmera[\s\S]*✓ Ativo/.test(await A.textContent('#perm-step')),'câmera liberada');
 await A.click('#perm-step button[onclick*="sound"]');await A.waitForTimeout(800);ok(/Som[\s\S]*✓ Ativo/.test(await A.textContent('#perm-step')),'som liberado');
 await A.evaluate(()=>document.getElementById('perm-step').close());await A.evaluate(()=>go('account'));await A.waitForTimeout(600);ok(/Nuvem e e-mail[\s\S]*e-mail confirmado/.test(await A.textContent('#view')),'tela Conta mostra a nuvem');
 const hs=await B.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);ok(hs,'sem rolagem lateral no iPhone');
 console.log('errors',errs);await b.close()})();
