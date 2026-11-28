/* v172: o Início volta ao visual da v169 (a arte nova da v170/v171 deixou o Início vazio no iPhone). 390×844, com e sem
   "menos movimento": "Tudo no seu lugar." e o botão "Novo plano" aparecem, recebem o toque (elementFromPoint) e as abas funcionam. */
const L=require('./lib.js');const {ok}=L;const BASE=process.env.BASE||'http://localhost:8000';
(async()=>{const b=await L.chromium.launch();const errs=[];
 for(const rm of ['no-preference','reduce']){const ctx=await b.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,reducedMotion:rm,userAgent:L.devices['iPhone 13'].userAgent});
  const p=await ctx.newPage();p.on('pageerror',e=>errs.push(rm+' '+e.message));p.on('dialog',d=>d.accept());
  await p.goto(BASE+'/index.html');await p.waitForTimeout(2000);await L.signup(p,'ib'+rm.length+Date.now().toString(36));await p.addStyleTag({content:'.firebase-emulator-warning,#toast,#alert-popup{display:none!important}'});
  await p.evaluate(()=>{go('nfs');go('home');scrollTo(0,0)});await p.waitForTimeout(1800);
  const r=await p.evaluate(()=>{const vis=e=>{if(!e)return false;let o=1;for(let x=e;x&&x.nodeType===1;x=x.parentElement)o*=+getComputedStyle(x).opacity;const rc=e.getBoundingClientRect();return o>0.98&&rc.height>0};
    const hit=e=>{if(!e)return false;const rc=e.getBoundingClientRect(),t=document.elementFromPoint(rc.left+rc.width/2,rc.top+rc.height/2);return !!t&&(t===e||e.contains(t))};
    const h1=document.querySelector('.hero-home h1'),bt=document.querySelector('.hero-home .primary');
    return {t:h1&&h1.textContent.replace(/\s+/g,' ').trim(),h1:vis(h1),bt:vis(bt)&&/Novo plano/.test(bt.textContent),hit:hit(bt),tabs:[...document.querySelectorAll('#mobile-bottom button')].every(hit),art:!!document.querySelector('.ini-kicker,#ini-counts')}});
  ok(r.t==='Tudo no seu lugar.'&&r.h1&&r.bt&&!r.art,rm+': Início com "Tudo no seu lugar." e "Novo plano" visíveis (visual da v169)');
  ok(r.hit&&r.tabs,rm+': botão Novo plano e abas recebem o toque');
  await p.tap('.hero-home .primary');await p.waitForTimeout(600);ok(await p.evaluate(()=>page==='plans'&&!!planDraft),rm+': tocar em Novo plano abre o plano');
  await p.evaluate(()=>{try{planDraft=null}catch(e){}go('home')});await p.waitForTimeout(500);await p.tap('#mobile-bottom button:nth-child(2)');await p.waitForTimeout(400);ok(await p.evaluate(()=>page==='nfs'),rm+': aba Notas abre');
  await ctx.close()}
 ok(!errs.length,'0 erro ('+errs.slice(0,2).join(' | ')+')');await b.close()})();
