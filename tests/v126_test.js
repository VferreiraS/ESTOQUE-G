/* v126: limpeza geral única por aparelho ("manter o app sem nenhuma conta antiga"). PC 1440×900 e iPhone 13.
   - aparelho com conta antiga + sessão + IndexedDB + sessão do Firebase: abre, tudo do Stok apagado, tela de entrar normal,
     tema preservado, chaves de outros apps e a sessão Firebase de outro app ficam; aviso aparece uma vez;
   - recarregar não apaga de novo nem mostra o aviso;
   - conta criada depois da limpeza sobrevive a recarregar;
   - aparelho novo: só grava o marcador, sem aviso;
   - sem erro de página nem de console (fora falha de rede). */
const L=require('./lib.js');const {ok,until}=L;
let PW;try{PW=require('playwright')}catch(e){PW=require('/opt/node22/lib/node_modules/playwright')}
const U='http://localhost:8000/index.html?ntfy='+L.N;
/* igual ao INIT do lib.js, mas SEM o marcador da limpeza */
const INIT=()=>{try{sessionStorage.setItem('e99-intro','1');localStorage.setItem('e99-fb-emu','127.0.0.1:9099|127.0.0.1:8080');localStorage.setItem('e99-test-weak-pw','1');localStorage.setItem('e99-no-perm-step','1');localStorage.setItem('e99-no-cookie-note','1')}catch(e){}};
const FBK='firebase:authUser:AIzaSyBy72TCxTESTE:[DEFAULT]',OTHER='firebase:authUser:AIzaOUTROAPP:[DEFAULT]';
async function ready(p){await p.waitForSelector('#auth-form input[name=password]',{timeout:15000});await until(p,()=>!!window.__e99Boot,null,9000)}
const seedIdb=()=>new Promise(res=>{
  const z=indexedDB.open('estoque99-zzz',1);z.onupgradeneeded=()=>z.result.createObjectStore('s');
  z.onsuccess=()=>{const t=z.result.transaction('s','readwrite');t.objectStore('s').put({a:1},'x');t.oncomplete=()=>{z.result.close();
    const f=indexedDB.open('firebaseLocalStorageDb');f.onupgradeneeded=()=>{if(!f.result.objectStoreNames.contains('firebaseLocalStorage'))f.result.createObjectStore('firebaseLocalStorage',{keyPath:'fbase_key'})};
    f.onsuccess=()=>{const d=f.result;if(!d.objectStoreNames.contains('firebaseLocalStorage')){d.close();res('sem store');return}
      const t2=d.transaction('firebaseLocalStorage','readwrite'),st=t2.objectStore('firebaseLocalStorage');
      st.put({fbase_key:'firebase:authUser:AIzaSyBy72TCxTESTE:[DEFAULT]',value:{uid:'u1'}});st.put({fbase_key:'firebase:authUser:AIzaOUTROAPP:[DEFAULT]',value:{uid:'u2'}});
      t2.oncomplete=()=>{d.close();res('ok')}}}}});
const readIdb=()=>new Promise(async res=>{const out={};const names=indexedDB.databases?(await indexedDB.databases()).map(x=>x.name):[];out.names=names;
  const cnt=(db,store)=>new Promise(r=>{if(!names.includes(db))return r(-1);const q=indexedDB.open(db);q.onsuccess=()=>{const d=q.result;if(!d.objectStoreNames.contains(store)){d.close();return r(-2)}
    const t=d.transaction(store,'readonly'),k=t.objectStore(store).getAllKeys();k.onsuccess=()=>{d.close();r(k.result.map(String))}};q.onerror=()=>r(-3)});
  out.remember=await cnt('estoque99-local','remember');out.fb=await cnt('firebaseLocalStorageDb','firebaseLocalStorage');res(out)});
const keys=()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k)}const s={};for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);s[k]=1}return {ls:o,ss:s}};
(async()=>{const b=await PW.chromium.launch();const errs=[];const T=Date.now().toString(36);
for(const [nome,opt] of [['PC',{viewport:{width:1440,height:900}}],['iPhone',PW.devices['iPhone 13']]]){
 const watch=(p)=>{p.on('pageerror',e=>errs.push(nome+' '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_|ntfy|status of 4\d\d/i.test(m.text()))errs.push(nome+' console: '+m.text())})};
 // 1) aparelho novo (navegador sem nada): só o marcador, nada apagado, sem aviso
 const c0=await b.newContext(opt);const p0=await c0.newPage();watch(p0);await p0.goto(U);await ready(p0);
 let st=await p0.evaluate(()=>({mk:localStorage.getItem('stok-reset'),r:window.__e99Reset}));
 ok(st.mk==='r126'&&st.r&&st.r.removed===0&&st.r.saved===true,nome+': aparelho novo só grava o marcador r126');
 await p0.waitForTimeout(9000);ok(!(await p0.$('#e99-wiped')),nome+': aparelho novo sem aviso de limpeza');await c0.close();
 const ctx=await b.newContext(opt);await ctx.addInitScript(INIT);const p=await ctx.newPage();watch(p);
 await p.goto(U);await ready(p);await p.reload();await ready(p);
 // 2) conta "antiga": cria a conta (com o marcador já gravado), depois tira o marcador para simular aparelho de antes da v126
 const old='antiga'+T+nome.toLowerCase();await L.signup(p,old);
 ok(await p.evaluate(()=>!!authSession),nome+': conta antiga criada');
 await p.evaluate(()=>{localStorage.setItem('lojasg.estoque99.ui-theme','cinza');localStorage.setItem('lojasg.estoque99.remember-pref','on');localStorage.setItem('estoque99-velho','1');localStorage.setItem('stok-qualquer','1');localStorage.setItem('e99-algo','1');
   localStorage.setItem('firebase:authUser:AIzaSyBy72TCxTESTE:[DEFAULT]','{"uid":"u1"}');localStorage.setItem('firebase:authUser:AIzaOUTROAPP:[DEFAULT]','{"uid":"u2"}');localStorage.setItem('outroapp.chave','fica');
   sessionStorage.setItem('e99-cloud-later','1');sessionStorage.setItem('lojasg.x','1');sessionStorage.setItem('outro.sess','fica')});
 ok((await p.evaluate(seedIdb))==='ok',nome+': IndexedDB semeado (banco extra + sessão Firebase)');
 const before=await p.evaluate(keys);ok(Object.keys(before.ls).some(k=>k.indexOf('lojasg.estoque99.account.v1.')===0),nome+': conta antiga está no localStorage');
 await p.evaluate(()=>{dirty=false;localStorage.removeItem('stok-reset')});
 // 3) abre de novo: limpeza
 await p.reload();await ready(p);
 st=await p.evaluate(keys);const ls=Object.keys(st.ls);
 /* o id do aparelho é recriado pelo app ao abrir: vale só se for um id novo */
 ok(!ls.some(k=>k.indexOf('lojasg.')===0&&k!=='lojasg.estoque99.ui-theme'&&!(k==='lojasg.estoque99.device'&&st.ls[k]!==before.ls[k])),nome+': nenhuma chave lojasg.* além do tema ('+ls.filter(k=>k.indexOf('lojasg.')===0).join(',')+')');
 ok(!ls.some(k=>/^(estoque99|stok-qualquer|e99-algo)/.test(k)),nome+': chaves estoque99*/stok*/e99* apagadas');
 ok(!(FBK in st.ls)&&st.ls[OTHER]==='{"uid":"u2"}'&&st.ls['outroapp.chave']==='fica',nome+': sessão Firebase deste app apagada; outro app e outra chave ficam');
 ok(!st.ss['e99-cloud-later']&&!st.ss['lojasg.x']&&st.ss['outro.sess'],nome+': sessionStorage do Stok apagado, o resto fica');
 ok(st.ls['stok-reset']==='r126',nome+': marcador gravado');
 ok(st.ls['lojasg.estoque99.ui-theme']==='cinza'&&(await p.evaluate(()=>document.documentElement.getAttribute('data-e99-theme')))==='cinza',nome+': tema preservado (cinza)');
 const r=await p.evaluate(()=>window.__e99Reset);ok(r&&r.removed>5,nome+': limpeza contou '+(r&&r.removed)+' chaves');
 await p.waitForTimeout(800);const idb=await p.evaluate(readIdb);
 ok(!idb.names.includes('estoque99-zzz'),nome+': banco estoque99-* desconhecido apagado');
 ok(!Array.isArray(idb.remember)||idb.remember.length===0,nome+': sessão lembrada (estoque99-local) apagada');
 ok(Array.isArray(idb.fb)&&!idb.fb.some(k=>k.indexOf('AIzaSyBy72TC')>0)&&idb.fb.some(k=>k.indexOf('OUTROAPP')>0),nome+': firebaseLocalStorageDb: só a entrada deste app sai ('+JSON.stringify(idb.fb)+')');
 ok(await p.evaluate(()=>!authSession&&!!document.querySelector('#auth-form input[name=password]')&&getComputedStyle(document.getElementById('auth-screen')).display!=='none'),nome+': tela de entrar normal, sem sessão');
 ok(await until(p,()=>{const d=document.getElementById('e99-wiped');return !!d&&/Este aparelho foi limpo\. Crie uma conta ou traga a sua da nuvem\./.test(d.textContent)},null,12000),nome+': aviso discreto aparece');
 ok(await p.evaluate(()=>{const d=document.getElementById('e99-wiped').getBoundingClientRect();return d.left>=0&&d.right<=innerWidth&&d.bottom<=innerHeight}),nome+': aviso cabe na tela');
 // login antigo não existe mais
 await p.fill('#auth-form input[name=login]',old);await p.fill('#auth-form input[name=password]','1234');await p.click('#auth-form button[type=submit]');await p.waitForTimeout(1500);
 ok(await p.evaluate(()=>!authSession),nome+': conta antiga não entra mais');
 // 4) recarregar: não apaga de novo nem avisa
 await p.reload();await ready(p);
 ok(await p.evaluate(()=>!window.__e99Reset&&localStorage.getItem('stok-reset')==='r126'),nome+': recarregar não roda a limpeza de novo');
 await p.waitForTimeout(9000);ok(!(await p.$('#e99-wiped')),nome+': aviso não volta');
 // 5) conta nova depois da limpeza sobrevive
 const nova='nova'+T+nome.toLowerCase();await L.signup(p,nova);ok(await p.evaluate(()=>!!authSession),nome+': conta nova criada');
 await p.evaluate(()=>{dirty=false});await p.reload();await ready(p);
 ok(await p.evaluate(l=>{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.indexOf('lojasg.estoque99.account.v1.')===0)return true}return false},nova)&&await p.evaluate(()=>!window.__e99Reset),nome+': conta nova continua depois de recarregar');
 await p.fill('#auth-form input[name=login]',nova);await p.fill('#auth-form input[name=password]','1234');await p.click('#auth-form button[type=submit]');
 ok(await until(p,()=>!!authSession,null,15000),nome+': conta nova entra');
 await ctx.close()}
ok(!errs.length,'sem erros de página/console '+errs.slice(0,3).join(' | '));
await b.close()})().catch(e=>{console.log('FAIL Error '+e.message);process.exit(1)});
