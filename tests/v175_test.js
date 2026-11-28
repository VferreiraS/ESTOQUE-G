/* v175: (1) botões Voltar estilo Apple: classe única .e99-voltar, chevron SVG vermelho + rótulo da tela anterior, 44 px, à esquerda;
   (2) vidro líquido: botões com backdrop-filter, primário vermelho translúcido com texto branco ≥ 4,5:1, 44 px;
   (3) relatório diário pelo app: no máximo 1 vez por dia, para o e-mail de cada conta deste aparelho, sem e-mail não envia (FormSubmit interceptado). */
const L=require('./lib.js');const {ok}=L;const BASE=process.env.BASE||'http://localhost:8000';
(async()=>{const b=await L.chromium.launch();const errs=[];
for(const [w,h,m] of [[390,844,1],[1440,900,0]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:!!m,hasTouch:!!m});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(w+' '+e.message));p.on('dialog',d=>d.accept());
 const posts=[];await p.route('https://formsubmit.co/**',async r=>{posts.push({to:decodeURIComponent(r.request().url().split('/').pop()),f:JSON.parse(r.request().postData()||'{}')});await r.fulfill({status:200,contentType:'application/json',body:'{"success":"true"}'})});
 await p.goto(BASE+'/index.html');await p.waitForTimeout(2000);await L.signup(p,'gv'+Date.now().toString(36));
 /* (1) Voltar */
 await p.evaluate(()=>go('team'));await p.waitForTimeout(600);
 const bk=await p.evaluate(()=>{const e=document.querySelector('#e99-backbar .e99-back');if(!e)return null;const r=e.getBoundingClientRect(),s=getComputedStyle(e),ic=e.querySelector('svg.e99-voltar-ic');
   return {cls:e.classList.contains('e99-voltar'),txt:e.textContent.trim(),h:r.height,left:r.left,c:s.color,ic:!!ic,bf:s.backdropFilter||s.webkitBackdropFilter,lbl:e.getAttribute('aria-label')}});
 ok(bk&&bk.cls&&bk.ic&&bk.txt==='Início'&&bk.h>=44&&bk.left<330&&/255, 77, 77/.test(bk.c)&&/blur/.test(bk.bf)&&/Início/.test(bk.lbl),w+': Voltar com classe e99-voltar, chevron, "Início", 44 px, vermelho, vidro ('+JSON.stringify(bk)+')');
 await p.click('#e99-backbar .e99-back');await p.waitForTimeout(400);ok(await p.evaluate(()=>page==='home'),w+': Voltar volta ao Início');
 if(m){await p.evaluate(()=>{go('nfs');go('chat')});await p.waitForTimeout(800);
  const cb=await p.evaluate(()=>{const e=document.querySelector('.v170-back');return e&&{cls:e.classList.contains('e99-voltar'),txt:e.textContent.trim(),h:e.getBoundingClientRect().height,l:e.getBoundingClientRect().left}});
  ok(cb&&cb.cls&&cb.txt==='Notas'&&cb.h>=44&&cb.l<40,w+': seta da lista de conversas vira Voltar "Notas" à esquerda ('+JSON.stringify(cb)+')')}
 /* (2) vidro */
 await p.evaluate(()=>{go('home');scrollTo(0,0)});await p.waitForTimeout(700);
 const g=await p.evaluate(()=>{const lum=c=>{const f=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
   const bt=document.querySelector('#view .hero-home .primary'),s=getComputedStyle(bt);const sh=document.createElement('div');document.body.appendChild(sh);
   /* cor efetiva do vidro vermelho sobre o preto: média do gradiente com alfa */
   const P=[...s.backgroundImage.matchAll(/rgba?\(([^)]+)\)/g)].map(x=>x[1].split(',').map(Number));const mix=P.map(c=>c.slice(0,3).map(v=>v*(c[3]==null?1:c[3])));const avg=[0,1,2].map(i=>mix.reduce((a,c)=>a+c[i],0)/mix.length);sh.remove();
   const cr=(1.05)/(lum(avg)+.05);
   const bs=[...document.querySelectorAll('#view button,header button')].filter(e=>e.getBoundingClientRect().width>0);const glass=bs.filter(e=>/blur/.test(getComputedStyle(e).backdropFilter||''));
   const small=bs.filter(e=>e.getBoundingClientRect().height<43.5).map(e=>e.className||e.textContent.trim().slice(0,12));
   return {cr,h:bt.getBoundingClientRect().height,bf:s.backdropFilter,n:bs.length,glass:glass.length,small,color:s.color,mb:getComputedStyle(document.getElementById('mobile-bottom')).backdropFilter}});
 ok(/blur/.test(g.bf)&&g.color==='rgb(255, 255, 255)'&&g.cr>=4.5&&g.h>=44,w+': primário em vidro vermelho, texto branco '+g.cr.toFixed(1)+':1, '+Math.round(g.h)+' px');
 ok(g.n>3&&g.glass===g.n,w+': todos os botões do Início e do topo com backdrop-filter ('+g.glass+'/'+g.n+')');
 ok(!g.small.length,w+': botões com 44 px ou mais'+(g.small.length?' → '+g.small.join(', '):''));
 if(m)ok(/blur/.test(g.mb||''),w+': barra de baixo em vidro');
 /* (3) relatório diário pelo app — só no primeiro contexto */
 if(m){
  await p.evaluate(()=>{localStorage.setItem('e99-test-dailymail','1');localStorage.removeItem(e99DailyMail.key);localStorage.setItem('lojasg.estoque99.cloud-email:'+authSession.storeKey,'eu.teste@example.com');
    localStorage.setItem('lojasg.estoque99.cloud-email:outra-conta-teste','outra.teste@example.com');localStorage.setItem('lojasg.estoque99.cloud-email:sem-email-teste','')});
  posts.length=0;const r1=await p.evaluate(()=>e99DailyMail.run());
  const tos=posts.map(x=>x.to).sort();
  ok(r1&&r1.sent===tos.length&&tos.includes('eu.teste@example.com')&&tos.includes('outra.teste@example.com')&&!tos.some(t=>!t),'envio simulado para cada conta com e-mail ('+tos.join(', ')+')');
  ok(posts.every(x=>/Relatório/.test(x.f._subject||'')),'conteúdo é o relatório do dia');
  ok(await p.evaluate(()=>e99DailyMail.feito()&&localStorage.getItem(e99DailyMail.key)===iso()),'data do envio gravada (uma vez por dia)');
  posts.length=0;const r2=await p.evaluate(()=>e99DailyMail.run());ok(r2===null&&posts.length===0,'segunda abertura no mesmo dia não envia');
  await p.evaluate(()=>localStorage.setItem(e99DailyMail.key,'2000-01-01'));posts.length=0;await p.evaluate(()=>e99DailyMail.run());ok(posts.length>=2,'dia novo envia de novo');
  await p.evaluate(()=>{for(const k of Object.keys(localStorage))if(k.indexOf('lojasg.estoque99.cloud-email:')===0)localStorage.removeItem(k);localStorage.removeItem(e99DailyMail.key);authSession.payload.email=''});
  posts.length=0;const r3=await p.evaluate(()=>e99DailyMail.run());ok(posts.length===0&&r3&&r3.total===0,'sem e-mail: não envia');
  await p.evaluate(()=>{localStorage.removeItem('e99-test-dailymail');localStorage.setItem('lojasg.estoque99.cloud-email:x','x.teste@example.com');localStorage.removeItem(e99DailyMail.key)});
  posts.length=0;await p.evaluate(()=>e99DailyMail.run());ok(posts.length===0,'localhost sem a chave de teste: não envia')}
 await ctx.close()}
ok(!errs.length,'0 erro'+(errs.length?' → '+errs.join(' | '):''));await b.close()})();
