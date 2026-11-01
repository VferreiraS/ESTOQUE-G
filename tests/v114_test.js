/* v114: selos de xadrez — peão para todos, Rei só pelo uid 's'; 3 temas, PC e iPhone; forjar pelo ntfy e pelo perfil */
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
 const SH=process.env.V114_SHOTS||SHOT;
 await A.evaluate(()=>openProfile('me'));await B.evaluate(()=>openProfile('me'));
 ok(await until(A,()=>{render();const x=document.querySelector('#view .prof-head h1 .vbadge');return x&&x.getAttribute('data-vbadge')==='rei'&&x.querySelector('svg')},null,30000),'PC: dono (uid S) com Rei');
 ok(await until(B,()=>{render();const x=document.querySelector('#view .prof-head h1 .vbadge');return x&&x.getAttribute('data-vbadge')==='peao'&&x.querySelector('svg')},null,30000),'iPhone: auxiliar com peão');
 ok(await until(A,()=>{render();return [...document.querySelectorAll('.prof-people button')].some(x=>/Ana/.test(x.innerText)&&x.querySelector('.vbadge[data-vbadge=peao]'))},null,30000),'PC: Ana com peão na lista de pessoas');
 ok(await until(B,()=>{render();return [...document.querySelectorAll('.prof-people button')].some(x=>/Vitor/.test(x.innerText)&&x.querySelector('.vbadge[data-vbadge=rei]'))},null,30000),'iPhone: Ana vê o Rei no Vitor');
 const col=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s+' .cb-edge');return e?getComputedStyle(e).stroke:''},sel);
 for(const th of ['lilas','violeta','cinza']){
  for(const [p,n] of [[A,'pc'],[B,'iphone']]){await p.evaluate(t=>{localStorage.setItem('lojasg.estoque99.ui-theme',t);document.documentElement.setAttribute('data-e99-theme',t);openProfile('me');render()},th);await p.waitForTimeout(700);
   await p.locator('#view .prof-head').screenshot({path:SH+'/v114-'+n+'-'+th+'.png'})}
  for(const [p,n] of [[A,'pc'],[B,'iphone']]){const lg=await p.evaluate(()=>{const i=[...document.querySelectorAll('img[data-e99-logo]')];const h=getComputedStyle(document.body).getPropertyValue('--neon-btn').trim().toLowerCase();return {n:i.length,ok:i.length>0&&i.every(x=>decodeURIComponent(x.src).toLowerCase().includes(h)&&decodeURIComponent(x.src).includes('M42 14h30.5'))}});ok(lg.ok,th+' '+n+': logo S na cor do tema ('+lg.n+')');}
  await A.evaluate(()=>go('home'));await A.waitForTimeout(500);await A.locator('aside .brand').screenshot({path:SH+'/v114-logo-pc-'+th+'.png'}).catch(()=>{});
  await B.screenshot({path:SH+'/v114-tela-iphone-'+th+'.png'});await A.evaluate(()=>openProfile('me'));
  const neon=await A.evaluate(()=>{const d=document.createElement('i');d.style.color='var(--neon)';document.body.appendChild(d);const c=getComputedStyle(d).color;d.remove();return c});
  const rei=await col(A,'#view .prof-head h1 .vbadge'),pe=await col(B,'#view .prof-head h1 .vbadge');
  ok(pe===neon,th+': peão na cor de destaque ('+pe+')');ok(rei&&rei!==pe&&!/255, 1[0-9]{2}, 0|255, 165/.test(rei),th+': Rei na 2ª cor do tema ('+rei+')');
 }
 // forjar o Rei pelo ntfy: perfil com o uid do dono, papel gestor e login vferreiras
 await B.evaluate(async(u)=>{const t=e99SyncInfo().topic;await window.e99OnProfile({dev:'fraude0101',pat:Date.now(),login:'vferreiras',uid:u,r:'gestor',pt:{name:'Rei Falso',user:'reifalso'}},async()=>null,t)},VUID);
 ok(await until(B,()=>{render();const x=[...document.querySelectorAll('.prof-people button')].find(b=>/Rei Falso/.test(b.innerText));return x&&x.querySelector('.vbadge[data-vbadge=peao]')},null,15000),'ntfy com uid do dono e login vferreiras: peão, não Rei');
 // forjar pelo perfil: conta muda o próprio perfil (nome/login do dono) e continua peão
 await B.evaluate(async()=>{const p=Object.assign({},window.e99ProfilesAll().find(r=>r.me).p);p.name='Vitor';p.user='vferreiras';await e99ProfileSave(p)}).catch(()=>{});
 ok(await until(B,()=>{openProfile('me');render();const x=document.querySelector('#view .prof-head h1 .vbadge');return x&&x.getAttribute('data-vbadge')==='peao'},null,15000),'perfil renomeado para o dono continua peão');
 ok(await B.evaluate(()=>e99VerTipo({login:'vferreiras'})==='peao'&&e99VerTipo({ntfy:1,login:'vferreiras'})==='peao'),'login nunca dá Rei');
 const wr=await B.evaluate(async(u)=>{try{const c=await e99Cloud.load();await c.db.collection('verificados').doc(u).set({tipo:'s'});return 'gravou'}catch(e){return e.code||String(e)}},bUid);
 ok(/permission-denied/.test(wr),'ninguém se dá o Rei ('+wr+')');
 ok(await B.evaluate(()=>authSession.payload.role)!=='gestor','peão não vira gestor');
 // animação: parada com Pausar animação
 const an=(p)=>p.evaluate(()=>getComputedStyle(document.querySelector('#view .prof-head h1 .vbadge .cb-hl')).animationName);
 ok(await an(A)==='cb-light','luz animada com Efeitos ligados');
 await A.evaluate(()=>e99FxPause(true));ok(await an(A)==='none','parada com Pausar animação');await A.evaluate(()=>e99FxPause(false));
 const B2=await (await b.newContext({...L.devices['iPhone 13'],reducedMotion:'reduce'})).newPage();await B2.goto('http://localhost:8000/index.html');await B2.evaluate(()=>{document.body.insertAdjacentHTML('beforeend','<span id=t1 class="vbadge" data-vbadge="peao"></span>')});await B2.waitForTimeout(800);
 ok(await B2.evaluate(()=>{const h=document.querySelector('#t1 .cb-hl');return h&&getComputedStyle(h).animationName==='none'}),'parada com menos movimento');
 console.log('errors',errs);await b.close()})();
