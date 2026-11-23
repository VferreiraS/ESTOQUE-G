/* v162 · Auto-reparo ao vivo (determinístico, sem IA): texto longo sem espaço num cartão estreito, CNPJ numa pílula estreita,
   elemento preso apagado por animação pausada, rolagem lateral por filho largo e animação órfã são corrigidos sozinhos;
   abertura, conferência e visualizador de imagens ficam intocados; desligar pelo painel (Dados) para e desfaz;
   custo por ciclo ~2 ms com CPU 4x no iPhone 13; parado, UpdateLayoutTree = 0; 0 erro de console. */
const L=require('./lib.js');const {ok}=L;
const BASE=process.env.BASE||'http://localhost:8000',U=BASE+'/index.html';
function watch(p,tag,errs){p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(tag+' console: '+m.text())});p.on('dialog',d=>d.accept())}
const LONG='CODIGO'+'7'.repeat(70)+'@lojasg.com.br';
const inject=(p,id,html)=>p.evaluate(([id,html])=>{const v=document.getElementById('view');const d=document.createElement('div');d.id=id;d.innerHTML=html;v.prepend(d);return true},[id,html]);
const fixOf=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);return e?e.getAttribute('data-e99-fix'):'(sem elemento)'},sel);
const hscroll=p=>p.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth);
async function waitFix(p,sel,ms=5000){return L.until(p,s=>{const e=document.querySelector(s);return !!(e&&e.getAttribute('data-e99-fix'))},sel,ms)}
async function cases(p,tag,W){
  await inject(p,'t-long-box','<div class="card" style="width:150px;box-sizing:border-box"><p id="t-long" style="overflow-wrap:normal;word-break:normal">'+LONG+'</p></div>');
  await inject(p,'t-pill-box','<div style="width:80px;display:block"><span class="pill" id="t-pill">12345678000195</span></div>');
  ok(await waitFix(p,'#t-long'),tag+': texto longo sem espaço no cartão estreito foi reparado ('+await fixOf(p,'#t-long')+')');
  const lg=await p.evaluate(()=>{const e=document.getElementById('t-long');return {sw:e.scrollWidth,cw:e.clientWidth,cls:e.className}});
  ok(lg.sw<=lg.cw+1&&/e99-fx-wrap/.test(lg.cls),tag+': o texto agora quebra dentro do cartão ('+lg.sw+' ≤ '+lg.cw+')');
  ok(await waitFix(p,'#t-pill'),tag+': CNPJ de 14 dígitos na pílula estreita foi reparado ('+await fixOf(p,'#t-pill')+')');
  const pl=await p.evaluate(()=>{const e=document.getElementById('t-pill'),cs=getComputedStyle(e);return {w:e.getBoundingClientRect().width,pw:e.parentElement.clientWidth,to:cs.textOverflow,t:e.getAttribute('title')}});
  ok(pl.w<=pl.pw+1&&pl.to==='ellipsis'&&pl.t==='12345678000195',tag+': pílula com reticências e o CNPJ completo no title ('+Math.round(pl.w)+' ≤ '+pl.pw+')');
  await inject(p,'t-wide','<div id="t-wide-in" style="width:'+(W+500)+'px;height:20px">largo</div>');
  const pre=await hscroll(p);
  ok(await waitFix(p,'#t-wide-in'),tag+': rolagem lateral causada por filho largo (+'+pre+' px) foi reparada');
  ok(await L.until(p,()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1,null,4000),tag+': sem rolagem lateral depois do reparo ('+await hscroll(p)+' px)');
}
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 /* ===== PC gestor ===== */
 {const ctx=await b.newContext({viewport:{width:1440,height:900}});const p=await ctx.newPage();watch(p,'PC',errs);
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'rep'+T);await p.addStyleTag({content:'.firebase-emulator-warning,#toast,.toast{display:none!important}'});
  await p.evaluate(()=>{authSession.payload.role='gestor'});await p.evaluate(()=>{go('plans');scrollTo(0,0)});await p.waitForTimeout(1500);
  ok(await p.evaluate(()=>!!window.e99Reparo&&e99Reparo.enabled()),'PC: auto-reparo ligado por padrão');
  await cases(p,'PC',1440);
  /* elemento preso apagado: animação de entrada pausada no meio */
  await p.addStyleTag({content:'@keyframes e99tIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}#t-stuck{animation:e99tIn 3s linear both}'});
  await inject(p,'t-stuck-box','<div id="t-stuck">Elemento que entrou e travou</div>');await p.waitForTimeout(250);
  await p.evaluate(()=>{document.getElementById('t-stuck').style.animationPlayState='paused'});
  const op0=await p.evaluate(()=>+getComputedStyle(document.getElementById('t-stuck')).opacity);
  await p.waitForTimeout(1500);ok(!(await fixOf(p,'#t-stuck')),'PC: antes de 2,5 s o elemento parado não é mexido');
  ok(await waitFix(p,'#t-stuck',6000),'PC: elemento preso com opacity '+op0.toFixed(2)+' (animação pausada) foi reparado');
  const st=await p.evaluate(()=>{const e=document.getElementById('t-stuck'),cs=getComputedStyle(e);return {op:cs.opacity,an:cs.animationName,tr:cs.transform}});
  ok(st.op==='1'&&st.an==='none'&&st.tr==='none','PC: estado final aplicado (opacity '+st.op+', animação '+st.an+', transform '+st.tr+')');
  /* animação órfã (WAAPI em elemento que saiu da tela) */
  await p.evaluate(()=>{const e=document.createElement('div');e.textContent='x';document.getElementById('view').appendChild(e);window.__orf=e.animate([{opacity:0},{opacity:1}],{duration:800,iterations:Infinity});setTimeout(()=>e.remove(),50)});
  ok(await L.until(p,()=>window.__orf.playState==='idle',null,6000),'PC: animação órfã cancelada ('+await p.evaluate(()=>window.__orf.playState)+')');
  /* body.e99-norise perdido */
  await p.waitForTimeout(1200);await p.evaluate(()=>document.body.classList.remove('e99-norise'));
  ok(await L.until(p,()=>document.body.classList.contains('e99-norise'),null,6000),'PC: body.e99-norise perdido volta sozinho');
  const lg=await p.evaluate(()=>e99Reparo.log().map(x=>x.tipo));
  ok(['texto-estoura','pilula-estoura','rolagem-lateral','animacao-presa','animacao-orfa','norise-perdido'].every(t=>lg.includes(t)),'PC: registro na memória com cada tipo ('+[...new Set(lg)].join(', ')+')');
  ok(await p.evaluate(()=>e99Reparo.log().every(x=>x.tipo&&x.sel&&x.tela&&/^\d\d:\d\d:\d\d$/.test(x.hora)&&x.sel.indexOf('7777')<0)),'PC: cada linha tem tipo, seletor curto, tela e hora (sem texto do usuário)');
  /* abertura, conferência e visualizador: intocados */
  for(const [cls,nome] of [['stok-intro-active','abertura'],['conf-on','conferência']]){
    await p.evaluate(c=>document.body.classList.add(c),cls);await inject(p,'t-blk','<div class="card" style="width:140px"><p id="t-blk-p">'+LONG+'</p></div>');
    await p.waitForTimeout(2500);ok(!(await fixOf(p,'#t-blk-p')),'PC: durante a '+nome+' nada é reparado');
    await p.evaluate(c=>document.body.classList.remove(c),cls);ok(await waitFix(p,'#t-blk-p',6000),'PC: depois da '+nome+' o reparo volta');await p.evaluate(()=>document.getElementById('t-blk').remove())}
  await p.evaluate(()=>{window.__img=window.e99Img;window.e99Img={state:()=>({open:true})}});await inject(p,'t-img','<div style="width:140px"><p id="t-img-p">'+LONG+'</p></div>');
  await p.waitForTimeout(2500);ok(!(await fixOf(p,'#t-img-p')),'PC: com o visualizador de imagens aberto nada é reparado');await p.evaluate(()=>{window.e99Img=window.__img;document.getElementById('t-img').remove()});
  await inject(p,'t-zone','<div class="e99-img" style="width:140px"><p id="t-z1">'+LONG+'</p></div><div id="conf-dlg" style="width:140px"><p id="t-z2">'+LONG+'</p></div>');await p.evaluate(()=>e99Reparo.scan());await p.waitForTimeout(1800);
  ok(!(await fixOf(p,'#t-z1'))&&!(await fixOf(p,'#t-z2')),'PC: nada dentro do visualizador (.e99-img) nem da conferência (#conf-dlg) é tocado');await p.evaluate(()=>document.getElementById('t-zone').remove());
  ok(await p.evaluate(()=>![...document.querySelectorAll('.brand,.logo,.logo-img,[class*=logo],canvas,svg')].some(e=>e.hasAttribute('data-e99-fix')||e.querySelector('[data-e99-fix]'))),'PC: logo, canvas e SVG intocados');
  /* reparo desfeito quando o problema some */
  await p.evaluate(()=>{document.querySelector('#t-long-box .card').style.width='900px'});
  ok(await L.until(p,()=>!document.getElementById('t-long').hasAttribute('data-e99-fix'),null,5000),'PC: cartão largo de novo → reparo desfeito sozinho');
  /* parado: nada roda */
  await p.waitForTimeout(3500);const cdp=await ctx.newCDPSession(p);await cdp.send('Performance.enable');const m=async()=>{const r=await cdp.send('Performance.getMetrics');const o={};r.metrics.forEach(x=>o[x.name]=x.value);return o};
  const c0=await p.evaluate(()=>e99Reparo.stats().cycles);const a=await m();await p.waitForTimeout(2000);const c=await m();const c1=await p.evaluate(()=>e99Reparo.stats());
  ok(c.RecalcStyleCount-a.RecalcStyleCount===0&&c.LayoutCount-a.LayoutCount===0&&c1.cycles===c0&&!c1.pending,'PC parado: UpdateLayoutTree = 0 e nenhum ciclo (estilo '+(c.RecalcStyleCount-a.RecalcStyleCount)+', layout '+(c.LayoutCount-a.LayoutCount)+', ciclos '+(c1.cycles-c0)+')');
  /* painel em Dados */
  await p.evaluate(()=>{go('data');scrollTo(0,0)});await p.waitForTimeout(800);
  const pn=await p.evaluate(()=>{const e=document.getElementById('reparo-panel');return e?{t:e.textContent,n:e.querySelectorAll('#reparo-list li').length,b:document.getElementById('reparo-btn').getAttribute('aria-pressed')}:null});
  ok(pn&&/Auto-reparo/.test(pn.t)&&/Reparos nesta sessão: \d+/.test(pn.t)&&pn.n>=5&&pn.n<=10&&pn.b==='true','PC: Dados → painel "Auto-reparo" com contador e últimos reparos ('+(pn&&pn.n)+' linhas)');
  ok(!/IA\b|intelig/i.test(pn?pn.t:''),'PC: painel não promete "IA"');
  await p.click('#reparo-clear');await p.waitForTimeout(200);ok(await p.evaluate(()=>e99Reparo.stats().count===0&&/Reparos nesta sessão: 0/.test(document.getElementById('reparo-panel').textContent)),'PC: "Limpar" zera a lista');
  await p.click('#reparo-btn');await p.waitForTimeout(300);
  const off=await p.evaluate(()=>({ls:localStorage.getItem('lojasg.estoque99.auto-reparo'),on:e99Reparo.enabled(),left:document.querySelectorAll('[data-e99-fix]').length,b:document.getElementById('reparo-btn').textContent}));
  ok(off.ls==='off'&&!off.on&&off.left===0&&/Desligado/.test(off.b),'PC: desligar pelo painel para e desfaz os reparos ('+off.left+' restantes)');
  await inject(p,'t-off','<div class="card" style="width:140px"><p id="t-off-p">'+LONG+'</p></div>');await p.waitForTimeout(3000);
  ok(!(await fixOf(p,'#t-off-p')),'PC: desligado, novo texto estourado não é reparado');
  await p.reload();await p.waitForTimeout(2500);ok(await p.evaluate(()=>!e99Reparo.enabled()),'PC: desligado continua depois de recarregar');
  await p.evaluate(()=>e99Reparo.on());ok(await p.evaluate(()=>e99Reparo.enabled()&&localStorage.getItem('lojasg.estoque99.auto-reparo')===null),'PC: religar volta ao padrão');
  await ctx.close()}
 /* ===== iPhone 13 auxiliar, CPU 4x ===== */
 {const ctx=await b.newContext({...L.devices['iPhone 13']});const p=await ctx.newPage();watch(p,'iPhone',errs);
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'repi'+T);await p.evaluate(()=>{authSession.payload.role='auxiliar'});await p.evaluate(()=>{go('plans');scrollTo(0,0)});await p.waitForTimeout(1500);
  const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  /* custo do vigia: tempo de CPU dentro de cycle() do v162-reparo.js pelo Profiler do DevTools, dividido pelos ciclos, medido com CPU 1x
     e multiplicado por 4 (= iPhone 13 com CPU 4x). Medir direto com CPU 4x não serve: o estrangulamento do DevTools pausa a thread em blocos
     de vários ms e cada pausa cai inteira na função que estava rodando. (A) uso normal: troca de telas; (B) com os casos de reparo. */
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  async function prof(fn){await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:100});await cdp.send('Profiler.start');
    const cy0=await p.evaluate(()=>e99Reparo.stats().cycles);await fn();const cy1=await p.evaluate(()=>e99Reparo.stats().cycles);const {profile}=await cdp.send('Profiler.stop');
    const byId={},par={};profile.nodes.forEach(n=>{byId[n.id]=n;(n.children||[]).forEach(c=>par[c]=n.id)});let cpu=0;
    profile.samples.forEach((id,i)=>{let x=id;while(x){const f=byId[x].callFrame;if(/v162-reparo/.test(f.url)&&f.functionName==='cycle'){cpu+=profile.timeDeltas[i]/1000;break}x=par[x]}});
    return {per:4*cpu/Math.max(1,cy1-cy0),n:cy1-cy0}}
  const A=await prof(async()=>{for(const g of ['nfs','plans','home','plans']){await p.evaluate(x=>go(x),g);await p.waitForTimeout(1800)}});
  ok(A.n>0&&A.per<=2,'iPhone 13 (CPU 4x): vigia ≤ ~2 ms por ciclo no uso normal ('+A.per.toFixed(2)+' ms de CPU por ciclo ×4, '+A.n+' ciclos)');
  const B=await prof(()=>cases(p,'iPhone 13',390));
  ok(B.n>0&&B.per<=3.5,'iPhone 13 (CPU 4x): ciclos com reparo continuam curtos, incluindo o layout do conteúdo novo ('+B.per.toFixed(2)+' ms de CPU por ciclo ×4, '+B.n+' ciclos)');
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await p.waitForTimeout(3500);await cdp.send('Performance.enable');const m=async()=>{const r=await cdp.send('Performance.getMetrics');const o={};r.metrics.forEach(x=>o[x.name]=x.value);return o};
  const a=await m();await p.waitForTimeout(2000);const c=await m();
  ok(c.RecalcStyleCount-a.RecalcStyleCount===0&&c.LayoutCount-a.LayoutCount===0,'iPhone 13 parado: UpdateLayoutTree = 0 (estilo '+(c.RecalcStyleCount-a.RecalcStyleCount)+', layout '+(c.LayoutCount-a.LayoutCount)+')');
  const lp=await p.evaluate(()=>{const n={};e99Reparo.log().forEach(x=>{n[x.sel]=(n[x.sel]||0)+1});return Math.max(0,...Object.values(n))});
  ok(lp<=3,'iPhone 13: sem laço de reparo (máx. '+lp+' reparos no mesmo seletor)');
  await cdp.send('Emulation.setCPUThrottlingRate',{rate:1});
  for(const g of ['home','plans','nfs','chat','account']){await p.evaluate(x=>{try{go(x)}catch(e){}},g);await p.waitForTimeout(900)}
  ok(await p.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1&&e99Reparo.enabled()),'iPhone 13 auxiliar: telas sem rolagem lateral, auto-reparo ligado');
  ok(await p.evaluate(()=>{go('data');return page!=='data'||!!document.getElementById('reparo-panel')}),'iPhone 13 auxiliar: o painel só aparece em Dados (auxiliar não abre Dados)');
  await ctx.close()}
 ok(!errs.length,'0 erro de console'+(errs.length?': '+errs.slice(0,5).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro '+e.message);process.exit(1)});
