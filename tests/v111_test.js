/* v111: dados pessoais do aparelho cifrados com a conta.
   Dados antigos em claro (members:, aux-invites:, cloud-logins e fotos/perfis no IndexedDB) são levados para dentro
   da conta cifrada sem perder nada; depois nada disso fica em claro; outra conta não vê; trocar senha não perde; convite continua
   funcionando. v121: o resumo antigo da IA (agent-brief:) é apagado do aparelho. PC 1440×900 + iPhone 13. */
const L=require('./lib.js');const {ok,until}=L;
const SECRETS=['Convidado Secreto','BRIEF-SECRETO','Membro Escondido','segredo.email@exemplo.com','FOTO-SECRETA'];
const PHOTO='data:image/jpeg;base64,'+Buffer.from('FOTO-SECRETA'.repeat(20)).toString('base64');
async function rawLS(p){return p.evaluate(()=>Object.keys(localStorage).map(k=>k+'='+window.__rawGet(k)).join('\n'))}
async function rawProf(p){return p.evaluate(()=>new Promise(res=>{const r=indexedDB.open('estoque99-profiles',1);r.onupgradeneeded=()=>r.result.createObjectStore('p');r.onsuccess=()=>{const db=r.result,tx=db.transaction('p','readonly'),q=tx.objectStore('p').getAll();tx.oncomplete=()=>{db.close();res(JSON.stringify(q.result))}};r.onerror=()=>res('')}))}
/* lê o localStorage "cru" (sem o bloco v111) guardando o getItem original antes de a página carregar */
const RAW=()=>{const g=Storage.prototype.getItem;window.__rawGet=k=>g.call(localStorage,k)};
async function seed(p,login,pw,tag){return p.evaluate(async([l,pw,tag,photo])=>{const s=await authCreate(l,'Loja '+l,pw,authEmpty(),'estoque',tag+'.'+l.toLowerCase()+'@teste.com');authSaveNewAccount(s);const sk=s.storeKey;
  localStorage.setItem('lojasg.estoque99.aux-invites:'+sk,JSON.stringify([{id:'i1',name:'Convidado Secreto '+tag,key:'ABCD1234EFGH',at:Date.now()}]));
  localStorage.setItem('lojasg.estoque99.members:'+sk+':e99s-topicoteste',JSON.stringify({dev123456:{name:'Membro Escondido '+tag,role:'auxiliar',seen:Date.now()}}));
  localStorage.setItem('lojasg.estoque99.agent-brief:'+sk,'BRIEF-SECRETO '+tag);
  const o=JSON.parse(localStorage.getItem('lojasg.estoque99.cloud-logins')||'{}');o[tag+'.segredo.email@exemplo.com']=l;localStorage.setItem('lojasg.estoque99.cloud-logins',JSON.stringify(o));
  await new Promise(res=>{const r=indexedDB.open('estoque99-profiles',1);r.onupgradeneeded=()=>r.result.createObjectStore('p');r.onsuccess=()=>{const db=r.result,tx=db.transaction('p','readwrite');tx.objectStore('p').put({v:1,user:'perfil.'+tag.toLowerCase(),name:'Nome '+tag,cargo:'',bio:'',photo:photo,cover:'',names:[],at:Date.now()},'me|'+sk);tx.oncomplete=()=>{db.close();res()}}});return sk},[login,pw,tag,PHOTO])}
const vals=(p,sk)=>p.evaluate(sk=>({inv:localStorage.getItem('lojasg.estoque99.aux-invites:'+sk),mem:localStorage.getItem('lojasg.estoque99.members:'+sk+':e99s-topicoteste'),brief:localStorage.getItem('lojasg.estoque99.agent-brief:'+sk),nw:localStorage.getItem('lojasg.estoque99.members:'+sk+':e99s-outro')}),sk);
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 for(const [nome,opts] of [['PC',{viewport:{width:1440,height:900}}],['celular',L.devices['iPhone 13']]]){
  const c=await b.newContext(opts);await c.addInitScript(RAW);const P=await c.newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept());
  await P.goto('http://localhost:8000/index.html?ntfy='+L.N);await P.waitForTimeout(1500);
  /* dados de exemplo no formato antigo (em claro), em duas contas */
  const la='sela'+nome+T,lb='selb'+nome+T;await P.evaluate(()=>localStorage.removeItem('lojasg.estoque99.cloud-logins2'));
  const ska=await seed(P,la,'1234','A'),skb=await seed(P,lb,'1234','B');
  /* recarrega: o índice de e-mail é migrado ao abrir */
  await P.reload();await P.waitForTimeout(1500);
  let raw=await rawLS(P);
  ok(!raw.includes('segredo.email@exemplo.com')&&!raw.includes('lojasg.estoque99.cloud-logins='),nome+': índice e-mail → login sem e-mail em claro (cloud-logins antigo migrado e apagado)');
  ok(await P.evaluate(l=>e99LoginForEmail('A.segredo.email@exemplo.com')===l,la),nome+': entrar pelo e-mail continua achando a conta');
  ok(raw.includes('Convidado Secreto A')&&raw.includes('Convidado Secreto B'),nome+': antes de entrar, os dados antigos ainda estão lá (ninguém perde nada)');
  /* entra na conta A: migra */
  await L.login(P,'A.segredo.email@exemplo.com','1234');ok(await P.evaluate(l=>!!authSession&&authSession.record.login===l.toLowerCase(),la),nome+': entra pela conta A (login pelo e-mail)');
  await P.waitForTimeout(2500);
  const va=await vals(P,ska);
  ok(/Convidado Secreto A/.test(va.inv)&&/Membro Escondido A/.test(va.mem)&&va.brief===null,nome+': o app continua lendo os dados (nada se perdeu) e o resumo antigo da IA sumiu');
  raw=await rawLS(P);
  ok(!raw.includes('Convidado Secreto A')&&!raw.includes('Membro Escondido A')&&!raw.includes('BRIEF-SECRETO A'),nome+': dados da conta A não ficam mais em claro no localStorage');
  ok(raw.includes('Convidado Secreto B')&&!raw.includes('BRIEF-SECRETO'),nome+': dados da conta B continuam guardados até ela entrar (resumo da IA apagado)');
  ok(await until(P,()=>new Promise(res=>{const r=indexedDB.open('estoque99-profiles',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('p','readonly'),q=tx.objectStore('p').get('me|'+authSession.storeKey);tx.oncomplete=()=>{db.close();res(!!q.result&&q.result.__e99s===1)}}}),null,10000),nome+': perfil/foto da conta A fica cifrado no IndexedDB');
  
  ok(await P.evaluate(()=>{const r=JSON.parse(localStorage.getItem(authSession.storeKey));return !JSON.stringify(r).includes('Convidado')}),nome+': registro da conta está cifrado (sem os dados em claro)');
  /* novo dado gravado também fica cifrado */
  await P.evaluate(sk=>localStorage.setItem('lojasg.estoque99.members:'+sk+':e99s-outro','NOVO-BRIEF-XYZ'),ska);await P.waitForTimeout(1500);
  ok(!(await rawLS(P)).includes('NOVO-BRIEF-XYZ')&&(await vals(P,ska)).nw==='NOVO-BRIEF-XYZ',nome+': dado novo vai direto cifrado');
  /* sair e entrar: continua */
  await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);
  ok((await vals(P,ska)).inv===null,nome+': sem conta aberta, ninguém lê os dados (nem o app)');
  await L.login(P,la,'1234');await P.waitForTimeout(1500);const va2=await vals(P,ska);
  ok(/Convidado Secreto A/.test(va2.inv)&&va2.nw==='NOVO-BRIEF-XYZ',nome+': depois de sair e entrar, os dados voltam');
  ok(await P.evaluate(()=>window.e99Seal.ready()),nome+': chave das fotos pronta');
  /* trocar a senha não perde nada */
  await P.evaluate(()=>go('account'));await P.waitForTimeout(800);
  await P.evaluate(()=>{const f=[...document.querySelectorAll('form')].find(f=>f.getAttribute('onsubmit')==='authChangePassword(event)');f.querySelector('[name=current]').value='1234';f.querySelector('[name=password]').value='4321';f.querySelector('[name=confirmation]').value='4321';return authChangePassword({preventDefault(){},target:f})});await P.waitForTimeout(2500);
  await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});authShownCode=null;window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);
  await L.login(P,la,'4321');await P.waitForTimeout(2500);const va3=await vals(P,ska);
  ok(!!(await P.evaluate(()=>authSession))&&/Convidado Secreto A/.test(va3.inv)&&va3.nw==='NOVO-BRIEF-XYZ',nome+': depois de trocar a senha os dados continuam');
  ok(await until(P,()=>new Promise(res=>{const r=indexedDB.open('estoque99-profiles',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('p','readonly'),q=tx.objectStore('p').get('me|'+authSession.storeKey);tx.oncomplete=()=>{db.close();window.e99Seal.open(q.result,'prof|me|'+authSession.storeKey).then(v=>res(!!v&&v.name==='Nome A'))}}}),null,8000),nome+': foto/perfil continua abrindo depois de trocar a senha');
  /* conta B: não vê os dados da A e migra os dela */
  await P.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});window.confirm=()=>true;return authLogout()});await P.waitForTimeout(800);
  await L.login(P,lb,'1234');await P.waitForTimeout(2500);
  ok((await vals(P,ska)).inv===null,nome+': conta B não lê os dados da conta A');
  const vb=await vals(P,skb);ok(/Convidado Secreto B/.test(vb.inv)&&vb.brief===null,nome+': conta B continua com os dados dela');
  raw=await rawLS(P);ok(!SECRETS.some(s=>raw.includes(s)),nome+': nada dos dados de exemplo fica em claro no localStorage');
  ok(await until(P,f=>new Promise(res=>{const r=indexedDB.open('estoque99-profiles',1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('p','readonly'),q=tx.objectStore('p').getAll();tx.oncomplete=()=>{db.close();res(!JSON.stringify(q.result).includes(f))}}}),Buffer.from('FOTO-SECRETA'.repeat(20)).toString('base64').slice(0,40),10000),nome+': nenhuma foto/perfil fica em claro no IndexedDB (A e B)');
  await P.close();
 }
 /* convite de auxiliar continua funcionando com a lista cifrada */
 const G=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();G.on('pageerror',e=>errs.push('G '+e.message));G.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(G,'sg'+T),'gestor com equipe');const link=await L.makeInvite(G,'Aux Teste');
 ok(await G.evaluate(()=>!Object.keys(localStorage).some(k=>k.startsWith('lojasg.estoque99.aux-invites:'))&&JSON.parse(localStorage.getItem('lojasg.estoque99.aux-invites:'+authSession.storeKey)).length===1),'convite fica só dentro da conta cifrada');
 const B=await (await b.newContext(L.devices['iPhone 13'])).newPage();B.on('pageerror',e=>errs.push('B '+e.message));B.on('dialog',d=>d.accept());
 await L.auxAccept(B,link,null,'2468');ok(await B.evaluate(()=>!!authSession&&authSession.payload.role==='auxiliar'),'auxiliar entra pelo convite');
 console.log('errors',errs);await b.close()})();
