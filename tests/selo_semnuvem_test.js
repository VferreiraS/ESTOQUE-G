/* v88: selo em aparelho SEM nuvem (nunca vinculou e-mail).
   - gestor sem nuvem vê o próprio S (login vferreiras/vferrreiras + role gestor, só no próprio aparelho)
   - aparelho sem nuvem lê a lista "verificados" (leitura pública) e vê o raio do Leon e o S do gestor pelo ntfy (login gravado no documento)
   - fraudes: perfil pelo ntfy com o uid do Leon e outro login não ganha selo; perfil da nuvem com uid falso e login do Leon também não */
const L=require('./lib.js');const {ok,until}=L;
const P='gen-lang-client-0167474823',AU='http://127.0.0.1:9099',FS='http://127.0.0.1:8080',VUID='TConyCsDQfPWBZ2MuGhVQTy7Mmz1';
const DOCS=`${FS}/v1/projects/${P}/databases/(default)/documents`,OWN={'Content-Type':'application/json',Authorization:'Bearer owner'};
const SHOT=process.env.SHOT_DIR||require('os').tmpdir();
const j=async(u,o={})=>{const r=await fetch(u,o);try{return await r.json()}catch(e){return {}}};
const put=(path,fields)=>j(`${DOCS}/${path}`,{method:'PATCH',headers:OWN,body:JSON.stringify({fields})});
const S=v=>({stringValue:v}),I=v=>({integerValue:String(v)});
/* "sem nuvem": o aparelho não alcança o login do Firebase (Auth), só o Firestore público */
const noCloud=async(ctx)=>{await ctx.route(/127\.0\.0\.1:9099|identitytoolkit|securetoken/,r=>r.abort())};
const badgeOf=(p,re)=>p.evaluate(s=>{const x=[...document.querySelectorAll('.prof-people button')].find(b=>new RegExp(s).test(b.innerText));if(!x)return null;const v=x.querySelector('.vbadge');return v?v.getAttribute('data-vbadge'):''},re);
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 await fetch(`${DOCS}`,{method:'DELETE'});await fetch(`${AU}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
 const cA=await b.newContext(L.devices['iPhone 13']),cB=await b.newContext(L.devices['iPhone 13']),cD=await b.newContext(L.devices['iPhone 13']);
 await noCloud(cA);await noCloud(cD);
 const A=await cA.newPage(),B=await cB.newPage(),D=await cD.newPage();
 [A,B,D].forEach(p=>{p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept())});
 // gestor "vferreiras" sem nuvem cria a equipe (só ntfy)
 ok(await L.gestorWithTeam(A,'vferreiras'),'gestor vferreiras (sem nuvem) com equipe');
 await A.evaluate(()=>{authSession.payload.role='gestor'});/* a conta do dono é gestor ("Criar conta" faz role 'estoque') */
 ok(await A.evaluate(()=>!(window.e99Cloud&&e99Cloud.user())&&authSession.payload.role==='gestor'),'gestor está sem nuvem');
 // Leon (auxiliar) com nuvem; outro auxiliar (D) sem nuvem
 const linkB=await L.makeInvite(A,'Leon');await L.auxAccept(B,linkB,null,'4321');
 ok(await until(B,()=>!!(window.e99Team&&e99Team.get()&&window.e99Cloud&&e99Cloud.user()),null,30000),'Leon na equipe e na nuvem');
 const leonUid=await B.evaluate(()=>e99Cloud.user().uid),leonLogin=await B.evaluate(()=>authSession.record.login);
 await B.evaluate(async()=>{const p=Object.assign({},window.e99ProfilesAll().find(r=>r.me).p);p.name='LEON REI';p.user='leonking';await e99ProfileSave(p)}).catch(()=>{});
 const linkD=await L.makeInvite(A,'Dani');await L.auxAccept(D,linkD,null,'5678');
 ok(await until(D,()=>!!(window.e99Team&&e99Team.get()),null,30000)&&await D.evaluate(()=>!(window.e99Cloud&&e99Cloud.user())),'Dani na equipe, sem nuvem');
 // o administrador grava a lista (como scripts/verificar.js faz)
 await put('verificados/'+VUID,{tipo:S('s'),login:S('vferrreiras,vferreiras')});
 await put('verificados/'+leonUid,{tipo:S('raio'),stkId:S('STK-TESTE'),login:S(leonLogin)});
 // leitura pública da lista (sem login)
 const pub=await fetch(`${DOCS}/verificados/${leonUid}`);ok(pub.status===200,'lista verificados legível sem login ('+pub.status+')');
 const wr=await fetch(`${DOCS}/verificados/${leonUid}`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({fields:{tipo:S('s')}})});ok(wr.status===403,'ninguém grava na lista sem ser administrador ('+wr.status+')');
 // perfis chegam pelo ntfy
 for(const p of [A,D])ok(await until(p,async()=>{await window.e99VerFetch();return Object.values(e99Ver()).includes('raio')},null,20000),'aparelho sem nuvem leu a lista verificados');
 await A.evaluate(()=>openProfile('me'));
 ok(await until(A,()=>{if(page!=='profile')openProfile('me');render();const x=document.querySelector('#view .prof-head h1 .vbadge');return !!(x&&x.getAttribute('data-vbadge')==='s')},null,40000),'gestor sem nuvem vê o próprio S');
 const aDev=await A.evaluate(()=>e99SyncInfo().dev);await D.evaluate(d=>e99SyncSend('profreq',{want:d}),aDev);/* Dani entrou depois: pede o perfil do gestor (como o app faz) */
 await D.evaluate(()=>openProfile('me'));
 ok(await until(D,()=>{render();const l=[...document.querySelectorAll('.prof-people button')];return l.some(x=>/LEON|Leon/.test(x.innerText)&&x.querySelector('.vbadge[data-vbadge=raio]'))},null,60000),'aparelho sem nuvem vê o raio do Leon (perfil pelo ntfy)');
 ok(await until(D,()=>{render();const l=[...document.querySelectorAll('.prof-people button')];return l.some(x=>/Vitor/.test(x.innerText)&&x.querySelector('.vbadge[data-vbadge=s]'))},null,60000),'aparelho sem nuvem vê o S do gestor');
 ok(await until(A,()=>{render();const l=[...document.querySelectorAll('.prof-people button')];return l.some(x=>/LEON|Leon/.test(x.innerText)&&x.querySelector('.vbadge[data-vbadge=raio]'))},null,40000),'gestor sem nuvem vê o raio do Leon');
 ok(await D.evaluate(()=>{const v=JSON.parse(localStorage.getItem('lojasg.estoque99.verificados')||'{}');return Object.values(v).includes('raio')}),'lista guardada no aparelho sem nuvem (uso offline)');
 ok(await until(B,()=>{if(page!=='profile')openProfile('me');render();const x=document.querySelector('#view .prof-head h1 .vbadge');return !!(x&&x.getAttribute('data-vbadge')==='raio')},null,30000),'Leon (com nuvem) vê o próprio raio');
 // fraude 1: perfil pelo ntfy com o uid do Leon e outro login -> sem selo
 await D.evaluate(async(u)=>{const t=e99SyncInfo().topic;await window.e99OnProfile({dev:'fraude0001',pat:Date.now(),login:'impostor',uid:u,r:'auxiliar',pt:{name:'Impostor Um',user:'impostor1'}},async()=>null,t)},leonUid);
 // fraude 2: perfil pelo ntfy com login de quem não está na lista, nome do gestor
 await D.evaluate(async()=>{const t=e99SyncInfo().topic;await window.e99OnProfile({dev:'fraude0002',pat:Date.now(),login:'vitorfake',r:'gestor',pt:{name:'Vitor Falso',user:'vitorfalso'}},async()=>null,t)});
 ok(await until(D,()=>{render();const l=[...document.querySelectorAll('.prof-people button')];return l.some(x=>/Impostor Um/.test(x.innerText))&&l.some(x=>/Vitor Falso/.test(x.innerText))},null,10000),'perfis falsos chegaram');
 ok(await badgeOf(D,'Impostor Um')==='','ntfy com uid do Leon e outro login: sem selo');
 ok(await badgeOf(D,'Vitor Falso')==='','ntfy com nome do gestor e outro login: sem selo');
 // fraude 3: perfil na nuvem com uid falso e login do Leon (visto por um aparelho com nuvem) -> sem selo pelo uid falso
 ok(await B.evaluate(()=>{const v=window.e99VerTipo;return v({uid:'FalsoUid000000000009',login:'leonardo69',uids:['FalsoUid000000000009']})===''}),'nuvem com uid falso e login verificado: sem selo');
 // fotos (iPhone 13) do aparelho sem nuvem: S do gestor e raio do Leon
 const keyOf=(re)=>D.evaluate(s=>{const r=window.e99ProfilesAll().find(x=>new RegExp(s).test(x.p.name));return r?r.key:''},re);
 await D.evaluate(k=>openProfile(k),await keyOf('Vitor'));await D.waitForTimeout(4000);ok(await D.evaluate(()=>{const x=document.querySelector('#view .prof-head h1 .vbadge');return x&&x.getAttribute('data-vbadge')==='s'}),'perfil do gestor com S (aparelho sem nuvem)');
 await D.locator('#view .prof-head').screenshot({path:SHOT+'/selo-v88-s.png'});
 await D.evaluate(k=>openProfile(k),await keyOf('LEON|Leon'));await D.waitForTimeout(1800);ok(await D.evaluate(()=>{const x=document.querySelector('#view .prof-head h1 .vbadge');return x&&x.getAttribute('data-vbadge')==='raio'}),'perfil do Leon com raio (aparelho sem nuvem)');
 await D.locator('#view .prof-head').screenshot({path:SHOT+'/selo-v88-raio.png'});
 console.log('errors',errs);await b.close()})();
