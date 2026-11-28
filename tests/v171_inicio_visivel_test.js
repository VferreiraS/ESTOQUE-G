/* v171: o Início nunca fica preso no meio de uma animação (print do dono: só o S aparecia, o resto preto).
   iPhone 390×844: animações "paradas" (linha do tempo parada, como no iPhone ao voltar do segundo plano), com e sem
   "menos movimento", indo para outra aba e voltando, e aba oculta/visível. Em até 1,5 s o título, a foto, o botão,
   os cartões e os anéis ficam visíveis (opacidade efetiva 1, sem deslocamento). Animação normal continua acontecendo. */
const L=require('./lib.js');const {ok}=L;
const BASE=process.env.BASE||'http://localhost:8000',U=BASE+'/index.html';
const SEL=['.hero-home h1','.hero-home .ini-kicker','.hero-home .primary','#vd-home .vd-greet h2','#vd-ring-plan','#vd-ring-nf','#ini-counts .ini-count','#view .stats .stat','.e99-demandas'];
const VIS=(sel)=>sel.map(s=>{const e=document.querySelector(s);if(!e)return s+':ausente';let o=1;for(let x=e;x&&x.nodeType===1;x=x.parentElement){o*=+getComputedStyle(x).opacity}
  const r=e.getBoundingClientRect();return o>0.98&&r.height>0?'':s+':'+o.toFixed(2)}).filter(Boolean);
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 for(const [tag,rm,stall] of [['parado','no-preference',1],['parado + menos movimento','reduce',1],['normal','no-preference',0]]){
  const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:rm,userAgent:L.devices['iPhone 13'].userAgent});
  if(stall)await ctx.addInitScript(()=>{/* simula a linha do tempo parada do iPhone: toda animação fica no 1º quadro */const a0=Element.prototype.animate;Element.prototype.animate=function(){const a=a0.apply(this,arguments);try{a.pause();a.currentTime=0}catch(e){}return a};
    document.addEventListener('DOMContentLoaded',()=>{const s=document.createElement('style');s.textContent='*,*::before,*::after{animation-play-state:paused!important}';document.head.appendChild(s)})});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('dialog',d=>d.accept());
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'vis'+tag.length+T);await p.addStyleTag({content:'.firebase-emulator-warning,#toast,#alert-popup{display:none!important}'});
  await p.evaluate(()=>{state.team=[{id:'a',name:'Ana Souza',role:'x'},{id:'b',name:'Bruno',role:'x'}];state.plans=[{id:'p',title:'H',date:iso(),activities:[{id:'1',title:'a',owner:'Ana Souza',notes:'',photos:[],done:true},{id:'2',title:'b',owner:'Bruno',notes:'',photos:[]}]}];return save()});
  await p.evaluate(()=>{go('nfs');go('home');scrollTo(0,0)});
  if(!stall){await p.waitForTimeout(120);ok(await p.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length>0)||rm==='reduce',tag+': o Início anima ao entrar')}
  await p.waitForTimeout(1700);
  let bad=await p.evaluate(VIS,SEL);ok(!bad.length,tag+': Início visível em até 1,5 s ('+(bad.join(' ')||'tudo visível')+')');
  ok(await p.evaluate(()=>document.body.classList.contains('ini-ok')),tag+': rede de segurança ligada (body.ini-ok)');
  await p.evaluate(()=>{go('plans')});await p.waitForTimeout(300);await p.evaluate(()=>{go('home');scrollTo(0,0)});await p.waitForTimeout(1700);
  bad=await p.evaluate(VIS,SEL);ok(!bad.length,tag+': Plano → Início continua visível ('+(bad.join(' ')||'ok')+')');
  /* volta do segundo plano: some e volta */
  await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>false});document.dispatchEvent(new Event('visibilitychange'))});await p.waitForTimeout(200);
  bad=await p.evaluate(VIS,SEL);ok(!bad.length,tag+': ao voltar para o app o Início aparece na hora');
  ok(await p.evaluate(()=>{const s=document.querySelector('.hero-home .ini-s');return !!s&&getComputedStyle(s).filter==='none'}),tag+': S sem filtro (no iPhone o filtro cortava um quadrado)');
  await ctx.close()}
 ok(!errs.length,'0 erro ('+errs.slice(0,3).join(' | ')+')');await b.close()})();
