/* v173: topo do celular sem sobreposição — ☰, logo + "StoK / ESTOQUE 99", busca, sino e perfil não se cruzam (bounding boxes)
   em 320, 375, 390 e 430 px, no Início, Notas e Plano. PC (1440) com o topo de sempre. */
const L=require('./lib.js');const {ok}=L;const BASE=process.env.BASE||'http://localhost:8000';
(async()=>{const b=await L.chromium.launch();const errs=[];
 for(const w of [320,375,390,430]){const ctx=await b.newContext({viewport:{width:w,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:L.devices['iPhone 13'].userAgent});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(w+' '+e.message));p.on('dialog',d=>d.accept());
  await p.goto(BASE+'/index.html');await p.waitForTimeout(2000);await L.signup(p,'tp'+w+Date.now().toString(36));
  for(const pg of ['home','nfs','plans']){await p.evaluate(pg=>{go(pg);scrollTo(0,0)},pg);await p.waitForTimeout(400);
   const r=await p.evaluate(()=>{const els=[...document.querySelectorAll('main>header :is(#v169-menu,.v169-brand,.e99-search-btn,.bell-btn,#v169-me)')].filter(e=>getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0);
     const R=els.map(e=>({n:e.id||e.className.split(' ')[0],r:e.getBoundingClientRect()}));const bad=[];
     for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const a=R[i].r,c=R[j].r;if(a.left<c.right-0.5&&c.left<a.right-0.5&&a.top<c.bottom-0.5&&c.top<a.bottom-0.5)bad.push(R[i].n+'×'+R[j].n)}
     const br=document.querySelector('.v169-brand');return {n:R.length,bad,brand:!!br&&br.getBoundingClientRect().width>40,sw:document.documentElement.scrollWidth,iw:innerWidth}});
   ok(r.n===5&&!r.bad.length&&r.brand&&r.sw<=r.iw,w+' px '+pg+': topo sem sobreposição ('+(r.bad.join(' ')||r.n+' itens')+')')}
  await ctx.close()}
 ok(!errs.length,'0 erro ('+errs.slice(0,2).join(' | ')+')');await b.close()})();
