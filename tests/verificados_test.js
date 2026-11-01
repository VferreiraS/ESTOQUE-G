/* v114: Rei só pelo uid 's' em verificados; todos os outros = peão. (v87: selo só pelo uid na lista "verificados" (raio / S); login do perfil não dá selo; o app não grava na lista; sem internet o gestor mantém o S */
const L=require('./lib.js');const {ok,until}=L;const crypto=require('crypto');
const P='gen-lang-client-0167474823',AU='http://127.0.0.1:9099',FS='http://127.0.0.1:8080',VUID='TConyCsDQfPWBZ2MuGhVQTy7Mmz1';
const DOCS=`${FS}/v1/projects/${P}/databases/(default)/documents`,OWN={'Content-Type':'application/json',Authorization:'Bearer owner'};
const SHOT=process.env.SHOT_DIR||require('os').tmpdir();
const derive=(login,pw)=>'Stk#'+crypto.createHash('sha256').update('e99-cloud|'+login+'|'+pw).digest('hex').slice(0,40);
const j=async(u,o={})=>{const r=await fetch(u,o);try{return await r.json()}catch(e){return {}}};
const put=(path,fields)=>j(`${DOCS}/${path}`,{method:'PATCH',headers:OWN,body:JSON.stringify({fields})});
const S=v=>({stringValue:v}),I=v=>({integerValue:String(v)});
async function verifyAll(){const r=await j(`${AU}/emulator/v1/projects/${P}/oobCodes`);for(const c of (r.oobCodes||[]))if(c.requestType==='VERIFY_EMAIL')await fetch(c.oobLink.replace(/^https?:\/\/[^/]+/,AU))}
const kindIn=(p,sel)=>p.evaluate(s=>{const b=document.querySelector(s);return b?b.getAttribute('data-vbadge'):''},sel);
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 await fetch(`${DOCS}`,{method:'DELETE'});await fetch(`${AU}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
 const gl='vg'+T,gEmail='vitor.v'+T+'@teste.com';
 await fetch(`${AU}/identitytoolkit.googleapis.com/v1/projects/${P}/accounts:batchCreate`,{method:'POST',headers:OWN,body:JSON.stringify({users:[{localId:VUID,email:gEmail,rawPassword:derive(gl,'1234')}]})});
 await put('verificados/'+VUID,{tipo:S('s')});
 const A=await (await b.newContext({viewport:{width:1280,height:860}})).newPage();const B=await (await b.newContext(L.devices['iPhone 13'])).newPage();
 [A,B].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept())});
 await A.goto('http://localhost:8000/index.html?ntfy='+L.N);await A.waitForTimeout(2000);
 await A.click('#auth-create');await A.fill('#auth-screen input[name=store]','Loja '+gl);await A.fill('#auth-screen input[name=login]',gl);await A.fill('#auth-screen input[name=email]',gEmail);await A.fill('#auth-screen input[name=password]','1234');await A.fill('#auth-screen input[name=confirmation]','1234');await L.terms(A,'#auth-form');
 await A.click('#auth-form button[type=submit]');await A.waitForTimeout(2500);await A.fill('#recovery-last4',(await A.textContent('.recovery-code')).replace(/[^A-Z0-9]/gi,'').slice(-4));await A.click('#recovery-enter');await A.waitForTimeout(2000);await A.addStyleTag({content:'#alert-popup{display:none!important}'});
 await A.evaluate(async()=>{state.team=[{id:'ana',name:'Ana',role:'Repositora'}];await save();go('chat')});
 await A.fill('#view form[onsubmit="chatCreate(event)"] input[name=name]','Vitor');await A.click('text=Criar equipe e gerar código');
 ok(await until(A,()=>syncStatus().ready&&syncStatus().connected),'gestor com equipe');
 ok(await until(A,(u)=>!!(window.e99Cloud&&e99Cloud.user()&&e99Cloud.user().uid===u),VUID,20000),'gestor na nuvem com o uid verificado');
 const link=await L.makeInvite(A,'Ana');await L.auxAccept(B,link,null,'4321');
 ok(await until(B,()=>!!(window.e99Team&&e99Team.get()&&window.e99Cloud&&e99Cloud.user()),null,30000),'aux na equipe e na nuvem');
 await verifyAll();await B.evaluate(()=>e99Cloud.after(true));await A.evaluate(()=>e99Cloud.after(true));
 const bUid=await B.evaluate(()=>e99Cloud.user().uid);
 // o app não consegue gravar na lista (nem para si mesmo)
 const wr=await B.evaluate(async(u)=>{try{const c=await e99Cloud.load();await c.db.collection('verificados').doc(u).set({tipo:'raio'});return 'gravou'}catch(e){return e.code||String(e)}},bUid);
 ok(/permission-denied/.test(wr),'cliente não grava em verificados ('+wr+')');
 const wr2=await A.evaluate(async(u)=>{try{const c=await e99Cloud.load();await c.db.collection('verificados').doc(u).set({tipo:'s'});return 'gravou'}catch(e){return e.code||String(e)}},bUid);
 ok(/permission-denied/.test(wr2),'nem o gestor grava em verificados pelo app ('+wr2+')');
 // sem selo antes de estar na lista
 await B.evaluate(()=>openProfile('me'));await B.waitForTimeout(1500);ok(await kindIn(B,'#view .prof-head h1 .vbadge')==='peao','Ana com peão antes da lista');
 // o administrador grava o raio (como a CLI faz)
 await put('verificados/'+bUid,{tipo:S('raio'),stkId:S('STK-TESTE')});
 ok(await until(B,()=>{if(page!=='profile')return false;const x=document.querySelector('#view .prof-head h1 .vbadge');return !!(x&&x.getAttribute('data-vbadge')==='peao'&&x.querySelector('svg'))},null,30000),'raio antigo vira peão (Ana)');
 ok(await B.evaluate(()=>{const x=document.querySelector('#view .prof-head h1 .vbadge');return x.getAttribute('aria-label')==='Selo Soldado Comum'&&x.getAttribute('role')==='img'}),'aria-label "Selo Soldado Comum"');
 await A.evaluate(()=>openProfile('me'));
 ok(await until(A,()=>{render();const l=[...document.querySelectorAll('.prof-people button')];return l.some(x=>/Ana/.test(x.innerText)&&x.querySelector('.vbadge[data-vbadge=peao]'))},null,30000),'gestor vê o peão na Ana (Pessoas)');
 ok(await kindIn(A,'#view .prof-head h1 .vbadge')==='rei','gestor (uid S) tem o Rei no próprio perfil');
 ok(await until(B,()=>{const l=[...document.querySelectorAll('.prof-people button')];return l.some(x=>/Vitor/.test(x.innerText)&&x.querySelector('.vbadge[data-vbadge=rei]'))},null,20000),'Ana vê o Rei no Vitor');
 // perfil que se renomeia para o login do gestor (ou 'vferreiras') não ganha selo
 const topic=await A.evaluate(()=>e99SyncInfo().topic);const sid=crypto.createHash('sha256').update('loja|'+topic).digest('hex').slice(0,32);
 const LEON='5mB4IsIggFeQInmVCX5Id5ChIxB3';await put('verificados/'+LEON,{tipo:S('raio'),stkId:S('STK-0091ZHBQ21YE')});
 for(const [uid,lg,nm,us] of [['FalsoUid000000000001','vferreiras','Falso Vitor','falsovitor'],['FalsoUid000000000002','vferrreiras','Copia Gestor','copiagestor'],[LEON,'leonardo69','LEON REI delas','leonking']])
   await put(`lojas/${sid}/perfis/${uid}`,{login:S(lg),role:S('gestor'),at:I(Date.now()),p:{mapValue:{fields:{user:S(us),name:S(nm),v:I(1),at:I(Date.now())}}}});
 ok(await until(A,()=>{render();const l=[...document.querySelectorAll('.prof-people button')];return l.some(x=>/Falso Vitor/.test(x.innerText))&&l.some(x=>/Copia Gestor/.test(x.innerText))&&l.some(x=>/LEON/.test(x.innerText))},null,30000),'perfis falsos e o do leonardo69 chegaram');
 ok(await until(A,()=>[...document.querySelectorAll('.prof-people button')].some(x=>/LEON/.test(x.innerText)&&x.querySelector('.vbadge[data-vbadge=peao]')),null,10000),'leonardo69 (raio antigo) agora com peão');
 ok(await A.evaluate(()=>[...document.querySelectorAll('.prof-people button')].filter(x=>/Falso Vitor|Copia Gestor/.test(x.innerText)).every(x=>!x.querySelector('.vbadge[data-vbadge=rei]'))),'login "vferreiras"/"vferrreiras" no perfil não dá Rei');
 ok(await A.evaluate(()=>!window.isV||!window.isV({login:'vferreiras'})),'isV global não aceita login');
 // efeitos desligados: selo parado (não pede quadros novos)
 const still=await B.evaluate(async()=>{if(visualEffectsOn())toggleVisualEffects();render();await new Promise(r=>setTimeout(r,600));const h=document.querySelector('#view .prof-head h1 .vbadge .cb-hl');const an=getComputedStyle(h).animationName;if(!visualEffectsOn())toggleVisualEffects();return an});
 ok(still==='none','peão parado com Efeitos desligados ('+still+')');
 // fotos (iPhone 13): raio na Ana, S no gestor
 await B.evaluate(()=>{render()});await B.waitForTimeout(1800);await B.locator('#view .prof-head').screenshot({path:SHOT+'/peao.png'});
 await A.waitForTimeout(1500);await A.locator('#view .prof-head').screenshot({path:SHOT+'/rei.png'});
 // sem internet: o gestor mantém o S (uid guardado + lista em cache), mesmo sem a nuvem
 await A.context().setOffline(true);
 const off=await A.evaluate(async()=>{const u0=e99Cloud.user;e99Cloud.user=()=>null;try{openProfile('me');await new Promise(r=>setTimeout(r,500));const x=document.querySelector('#view .prof-head h1 .vbadge');return x?x.getAttribute('data-vbadge'):''}finally{e99Cloud.user=u0}});
 ok(off==='rei','sem internet o gestor mantém o Rei (uid guardado)');
 const offB=await B.evaluate(()=>{const v=JSON.parse(localStorage.getItem('lojasg.estoque99.verificados')||'{}');return Object.values(v).includes('raio')});ok(offB,'lista guardada no aparelho para uso sem internet');
 await A.context().setOffline(false);
 console.log('errors',errs);await b.close()})();
