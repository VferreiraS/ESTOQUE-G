/* v121: (A) a IA saiu do app — sem agentes, piloto, Central de Agentes, Worker/Apps Script da IA, rotas antigas levam ao Início
   e os dados antigos de IA são apagados do aparelho sem tocar no resto. (B) barra de carregamento na tela de entrar:
   fina, nas cores do tema, avança por etapas, só libera o formulário quando o app carregou, limite de 6 s; som de abertura
   depois da barra (PC toca na hora; iPhone no primeiro toque); sem animação com Efeitos desligados / menos movimento.
   PC 1440×900 e iPhone 13. */
const L=require('./lib.js');const {ok,until}=L;
const URL0='http://localhost:8000/index.html?ntfy='+L.N;
/* grava o que a barra mostrou desde o início (antes de o teste conseguir olhar) */
const REC=()=>{window.__bootRec={vals:[],seen:false,color:'',trans:'',shine:''};document.addEventListener('DOMContentLoaded',()=>{const b=document.getElementById('e99-boot');const R=window.__bootRec;if(!b)return;
  R.seen=document.body.classList.contains('e99-booting');const i=b.firstElementChild,cs=getComputedStyle(i);R.color=cs.backgroundImage;R.trans=cs.transitionDuration;R.shine=getComputedStyle(i,'::after').display;R.h=b.getBoundingClientRect().height;
  R.formOff=(()=>{const f=document.querySelector('#auth-screen form');return f?getComputedStyle(f).pointerEvents:''})();
  R.vals.push(b.getAttribute('aria-valuenow'));new MutationObserver(()=>R.vals.push(b.getAttribute('aria-valuenow'))).observe(b,{attributes:true,attributeFilter:['aria-valuenow']})})};
const IOS=()=>{const O=window.AudioContext,G=Object.getOwnPropertyDescriptor(BaseAudioContext.prototype,'state').get;
 class F extends O{constructor(o){super(o);this.__s=1}get state(){return this.__s?'suspended':G.call(this)}
  resume(){const a=navigator.userActivation&&navigator.userActivation.isActive;return new Promise(r=>setTimeout(()=>{if(a)this.__s=0;super.resume().then(r,r)},300))}}
 window.AudioContext=F;window.webkitAudioContext=F};
const SEED=()=>{try{['lojasg.estoque99.agents:abc','lojasg.estoque99.autopilot:abc','lojasg.estoque99.agent-brief:abc','lojasg.estoque99.robot-groq:abc','lojasg.estoque99.robot','lojasg.estoque99.robot-nostream'].forEach(k=>localStorage.setItem(k,'velho'));
  localStorage.setItem('lojasg.estoque99.chat:abc','fica');localStorage.setItem('lojasg.estoque99.err-n:abc','3');localStorage.setItem('lojasg.estoque99.sheets:abc','fica')}catch(e){}};
(async()=>{const b=await L.chromium.launch({args:['--autoplay-policy=no-user-gesture-required']});const errs=[];const T=Date.now();
 for(const [nome,opts,ios] of [['PC',{viewport:{width:1440,height:900}},false],['iPhone',L.devices['iPhone 13'],true]]){
  const c=await b.newContext(opts);await c.addInitScript(REC);if(ios)await c.addInitScript(IOS);await c.addInitScript(SEED);
  const P=await c.newPage();P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('dialog',d=>d.accept());
  await P.goto(URL0);
  /* (B) barra */
  const R=await P.evaluate(()=>window.__bootRec);
  ok(R.seen&&R.h>0&&R.h<=4,nome+': barra fina aparece na tela de entrar enquanto o app carrega ('+R.h+' px)');
  const neon=await P.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--neon').trim());
  const rgb=await P.evaluate(n=>{const d=document.createElement('i');d.style.color=n;document.body.appendChild(d);const v=getComputedStyle(d).color;d.remove();return v},neon);
  ok(R.color.includes(rgb),nome+': barra nas cores do tema (--neon '+neon+')');
  ok(R.formOff==='none',nome+': formulário bloqueado enquanto carrega');
  ok(await until(P,()=>!!window.__e99Boot,null,7000),nome+': carregamento termina');
  const B=await P.evaluate(()=>window.__e99Boot);
  ok(B.why==='ok'&&B.ms<6000&&['scripts','pagina','fontes','offline','som'].every(k=>k in B.steps),nome+': todas as etapas (scripts, página, fontes, app sem internet, som) em '+B.ms+' ms');
  const vals=(await P.evaluate(()=>window.__bootRec.vals)).map(Number);
  ok(vals.length>=3&&vals.every((v,i)=>!i||v>=vals[i-1])&&vals[vals.length-1]===100,nome+': barra avança por etapas até 100% ('+vals.join(' → ')+')');
  ok(await until(P,()=>!document.getElementById('e99-boot')&&!document.body.classList.contains('e99-booting'),null,3000),nome+': barra some e o formulário é liberado');
  ok(await P.evaluate(()=>getComputedStyle(document.querySelector('#auth-screen form')).pointerEvents!=='none'),nome+': formulário aceita toque');
  /* som de abertura depois da barra */
  if(!ios){ok(await until(P,()=>window.__e99LoginSounds===1,null,5000),nome+': som de abertura toca ao abrir (navegador deixa)');
    ok(await P.evaluate(()=>window.__e99LoginSoundAt>=window.__e99Boot.at),nome+': o som toca só depois que a barra terminou')}
  /* iPhone: o som é conferido numa abertura sem nenhum comando do teste (o Playwright conta cada evaluate como toque) */
  /* (A) IA removida */
  const ls=await P.evaluate(()=>Object.keys(localStorage));
  ok(!ls.some(k=>/^lojasg\.estoque99\.(agents|autopilot|agent-brief|robot)/.test(k)),nome+': dados antigos de IA apagados do aparelho');
  ok(['lojasg.estoque99.chat:abc','lojasg.estoque99.err-n:abc','lojasg.estoque99.sheets:abc'].every(k=>ls.includes(k)),nome+': o resto (chat, planilha, erros) continua');
  ok(await P.evaluate(()=>!window.e99Agent&&!window.e99Autopilot&&!window.agBrief&&!window.agChatSum&&!(window.extraPages&&window.extraPages.agentes)&&!document.getElementById('agents-js')&&!document.getElementById('autopilot-js')),nome+': sem agentes nem piloto no código');
  const st=await P.evaluate(async()=>Promise.all(['apps-script/ia.gs','cloudflare/ia-worker.js','central-agentes/index.html'].map(u=>fetch(u,{cache:'no-store'}).then(r=>r.status))));
  ok(st.every(s=>s===404),nome+': arquivos da IA (Apps Script, Worker, Central de Agentes) não existem mais');
  await L.signup(P,'v121'+nome.toLowerCase()+T);
  ok(await P.evaluate(()=>!!authSession),nome+': cria conta e entra');
  for(const r of ['agentes','assistant','consultas','robot']){await P.evaluate(r=>go(r),r);await P.waitForTimeout(200);ok(await P.evaluate(()=>page==='home'),nome+': rota antiga "'+r+'" leva ao Início')}
  await P.evaluate(()=>go('account'));await P.waitForTimeout(600);
  ok(await P.evaluate(()=>{const t=document.getElementById('view').innerText;return !/Agentes de IA|Ollama|OmniRoute|Gemini|Workers AI|NVIDIA/i.test(t)&&!document.getElementById('ag-cfg')}),nome+': Minha conta sem campos de IA');
  ok(await P.evaluate(()=>{const t=[...document.querySelectorAll('aside nav, #mobile-bottom, nav')].map(n=>n.innerText).join(' ');return !/Agentes|Assistente/.test(t)}),nome+': menu sem Agentes/Assistente');
  await P.evaluate(()=>go('chat'));await P.waitForTimeout(600);ok(await P.evaluate(()=>!document.querySelector('.ag-sum,.ag-chat')&&!/Resumir/.test(document.getElementById('view').innerText)),nome+': chat sem "Resumir" nem "melhorar texto" da IA');
  await P.evaluate(()=>go('nfs'));await P.waitForTimeout(600);ok(await P.evaluate(()=>!document.querySelector('.ag-nfs')),nome+': Notas fiscais sem análise por IA');
  await c.close();
 }
 /* iPhone simulado (áudio suspenso até o toque): som guardado depois da barra e tocado no primeiro toque */
 const ic=await b.newContext({...L.devices['iPhone 13']});await ic.addInitScript(IOS);const I=await ic.newPage();I.on('pageerror',e=>errs.push('ios '+e.message));
 await I.goto(URL0);await I.waitForTimeout(3500);
 const sI=await I.evaluate(()=>({n:window.__e99LoginSounds,p:e99LoginSound.pending(),b:!!window.__e99Boot}));ok(sI.b&&sI.n===0&&sI.p,'iPhone: depois da barra, sem toque o som fica guardado '+JSON.stringify(sI));
 await I.tap('#auth-form input[name=login]');ok(await until(I,()=>window.__e99LoginSounds===1,null,4000),'iPhone: som de abertura toca no primeiro toque');
 await I.tap('#auth-form input[name=password]');await I.waitForTimeout(800);ok(await I.evaluate(()=>window.__e99LoginSounds===1),'iPhone: não repete nos toques seguintes');await ic.close();
 /* menos movimento + Efeitos desligados: barra estática (sem transição nem brilho), avança por etapas */
 const rm=await b.newContext({...L.devices['iPhone 13'],reducedMotion:'reduce'});await rm.addInitScript(()=>{try{localStorage.setItem('lojasg.estoque99.visual-effects','off')}catch(e){}});await rm.addInitScript(REC);
 const C=await rm.newPage();C.on('pageerror',e=>errs.push('rm '+e.message));await C.goto(URL0);
 const RC=await C.evaluate(()=>window.__bootRec);
 ok(RC.seen&&RC.trans.split(',').every(t=>t.trim()==='0s')&&RC.shine==='none','menos movimento: barra sem animação (transição '+RC.trans+', brilho '+RC.shine+')');
 ok(await until(C,()=>!!window.__e99Boot&&!document.getElementById('e99-boot'),null,7000),'menos movimento: barra termina e some');
 const vc=(await C.evaluate(()=>window.__bootRec.vals)).map(Number);ok(vc.length>=3&&vc[vc.length-1]===100,'menos movimento: avança por etapas ('+vc.join(' → ')+')');
 await rm.close();
 /* falha segura: se algo não termina (fontes presas), libera em 6 s; um "Entrar" tocado durante o carregamento é refeito */
 const pc=await b.newContext({viewport:{width:1440,height:900}});const A=await pc.newPage();A.on('pageerror',e=>errs.push('fs '+e.message));A.on('dialog',d=>d.accept());
 await A.goto(URL0);await until(A,()=>!!window.__e99Boot,null,7000);const lg='v121fs'+T;await L.signup(A,lg);
 await A.evaluate(()=>{document.querySelectorAll('dialog[open]').forEach(d=>{try{d.close()}catch(e){}});window.confirm=()=>true;return authLogout()});await A.waitForTimeout(500);
 const A2=await pc.newPage();A2.on('pageerror',e=>errs.push('fs2 '+e.message));A2.on('dialog',d=>d.accept());
 await A2.addInitScript(()=>{try{Object.defineProperty(document.fonts,'ready',{get:()=>new Promise(()=>{})})}catch(e){}});
 await A2.goto(URL0,{waitUntil:'domcontentloaded'});await A2.waitForSelector('#auth-form input[name=login]',{state:'attached'});
 await A2.evaluate(([l])=>{const f=document.getElementById('auth-form');f.querySelector('[name=login]').value=l;f.querySelector('[name=password]').value='1234';f.querySelector('button[type=submit]').click()},[lg]);
 await A2.waitForTimeout(1500);ok(await A2.evaluate(()=>!authSession&&!window.__e99Boot&&document.body.classList.contains('e99-booting')),'falha segura: com fontes presas o formulário espera (o envio fica guardado)');
 const fsB=await until(A2,()=>!!window.__e99Boot&&!document.body.classList.contains('e99-booting'),null,8000);const fsI=await A2.evaluate(()=>({b:window.__e99Boot,u:location.href,c:document.body.className}));ok(fsB&&fsI.b.why==='limite','falha segura: libera em 6 s mesmo sem terminar '+(fsB?'':JSON.stringify(fsI)));
 ok(fsB&&fsI.b.ms>=5900&&fsI.b.ms<7000,'falha segura: limite de 6 s ('+(fsI.b&&fsI.b.ms)+' ms)');
 ok(await until(A2,()=>!!authSession,null,8000),'o "Entrar" tocado durante o carregamento é refeito e entra na conta');
 console.log('errors',errs);await b.close()})();
