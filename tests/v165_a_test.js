/* v165-a · Início, Painel, Alertas, Minha conta e Dados no padrão do sistema de design (app/css/v165-a.css + app/js/v165-a.js).
   3 temas × PC 1440×900 e iPhone 13: tela marcada (data-p165), um só botão primário visível por tela, fontes e raios na escala --p-*,
   contraste AA nos textos (inclui os números dos cartões), toques ≥44 px no iPhone, sem rolagem lateral, estados vazios com ação,
   datas legíveis, 0 erro de console. CPU 4x no iPhone: abrir o Início sem travar. Prints 2x em docs/prints/v165/a (fora do git). */
const L=require('./lib.js');const {ok}=L;const fs=require('fs'),path=require('path');
const BASE=process.env.BASE||'http://localhost:8000',OUT=process.env.SHOTS||'docs/prints/v165/a';
const SCALE=['12px','13px','15px','16px','22px','28px','40px','34px'],RADII=['0px','8px','12px','20px','28px','999px','50%','22.5%'];
const SEED=()=>{const d=n=>{const x=new Date();x.setDate(x.getDate()-n);return iso(x)};state.team=[{id:'a',name:'Ana Souza',role:'Repositora'},{id:'b',name:'Bruno Lima',role:'Conferente'}];
  state.plans=[{id:'p1',title:'Plano do dia',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana Souza',notes:'',photos:[],done:true},{id:'a2',title:'Limpar corredor 09',owner:'Bruno Lima',notes:'',photos:[],done:false}]}];
  state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios Serra',date:iso(),status:'Conferido',owner:'a',notes:'',volumes:3},{id:'n2',number:'48214',supplier:'Bebidas Norte',date:d(3),status:'Em divergência',owner:'b',notes:'Faltou 1',volumes:2},
    {id:'n3',number:'48215',supplier:'Hortifruti Vale Verde Distribuidora de Alimentos Ltda',date:d(6),status:'Pendente',owner:'',notes:'',volumes:1250}];
  state.corridors=[{id:'c7',number:'07',sector:'Mercearia',owner:'a'}];return save()};
const MEASURE=(mob)=>{const SCALE=['12px','13px','15px','16px','22px','28px','40px','34px'],RADII=['0px','8px','12px','20px','28px','999px','50%','22.5%'];const vis=e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return false;const s=getComputedStyle(e);return s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>0.05};
  const v=document.getElementById('view');const P=x=>{const m=String(x).match(/[\d.]+/g);return m?m.map(Number):[0,0,0,0]};
  const lum=c=>{const f=x=>{x/=255;return x<=.03928?x/12.92:Math.pow((x+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
  const bgOf=e=>{let x=e;while(x&&x.nodeType===1){const s=getComputedStyle(x);if(s.backgroundImage&&s.backgroundImage!=='none'&&!/^(BODY|HTML)$/.test(x.nodeName))return null;if(s.backgroundColor!=='rgba(0, 0, 0, 0)'){const c=P(s.backgroundColor);if(c.length<4||c[3]>=.95)return c.slice(0,3);if(c[3]>.3)return null}x=x.parentElement}
    return getComputedStyle(document.documentElement).getPropertyValue('--p-bg').trim().replace('#','').match(/../g).map(h=>parseInt(h,16))};
  const fsz=new Set(),rad=new Set(),low=[],small=[],off=[];
  for(const e of [v,...v.querySelectorAll('*')]){if(e instanceof SVGElement||/^(BR|SCRIPT|STYLE|OPTION|IMG|CANVAS)$/.test(e.nodeName)||!vis(e)||e.closest('details:not([open])>:not(summary)'))continue;const s=getComputedStyle(e);
    const own=[...e.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim());
    if(own||/^(INPUT|SELECT|BUTTON)$/.test(e.nodeName)){fsz.add(s.fontSize);if(!SCALE.includes(s.fontSize))off.push(e.nodeName+'.'+String(e.className).split(' ')[0]+' '+s.fontSize)}
    if(own&&!e.closest('[disabled],.lic-text')&&s.textDecorationLine.indexOf('line-through')<0){const bg=bgOf(e);if(bg){const fg=P(s.color),a=fg.length>3?fg[3]:1,c=[0,1,2].map(i=>fg[i]*a+bg[i]*(1-a));const L1=lum(c),L2=lum(bg),cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
      const big=parseFloat(s.fontSize)>=24;if(cr<(big?3:4.5))low.push(e.nodeName+'.'+String(e.className).split(' ')[0]+' '+cr.toFixed(2)+' "'+e.textContent.trim().slice(0,20)+'"')}}
    if(s.backgroundColor!=='rgba(0, 0, 0, 0)'||(parseFloat(s.borderTopWidth)>0&&s.borderTopStyle!=='none'))rad.add(s.borderTopLeftRadius);
    if(mob&&/^(BUTTON|INPUT|SELECT|SUMMARY)$/.test(e.nodeName)&&!/^(hidden|checkbox|radio)$/.test(e.type)&&!e.closest('th')){const r=e.getBoundingClientRect();if(Math.min(r.width,r.height)<43.5)small.push((e.getAttribute('aria-label')||e.textContent||e.nodeName).trim().slice(0,20)+' '+Math.round(r.width)+'×'+Math.round(r.height))}}
  const acc=getComputedStyle(document.documentElement).getPropertyValue('--p-accent').trim().replace('#','').match(/../g).map(h=>parseInt(h,16)).join(', ');
  const prim=[...v.querySelectorAll('button')].filter(b=>vis(b)&&getComputedStyle(b).backgroundColor==='rgb('+acc+')').map(b=>b.textContent.trim().slice(0,24));
  const empties=[...v.querySelectorAll('.p165-empty')].filter(vis).map(x=>!!x.querySelector('button'));
  return {mark:v.getAttribute('data-p165'),fs:[...fsz],offFs:off,r:[...rad].filter(x=>!RADII.includes(x)),low,small,prim,empties,scroll:document.documentElement.scrollWidth-innerWidth}};
(async()=>{const b=await L.chromium.launch();const errs=[];fs.mkdirSync(OUT,{recursive:true});const T=Date.now().toString(36);
 for(const dev of ['PC','iPhone']){const mob=dev==='iPhone';
  const ctx=await b.newContext(mob?{...L.devices['iPhone 13'],deviceScaleFactor:2}:{viewport:{width:1440,height:900},deviceScaleFactor:2});const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(dev+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(dev+' console: '+m.text())});p.on('dialog',d=>d.accept());
  await p.goto(BASE+'/index.html');await p.waitForTimeout(2500);await L.signup(p,'p165a'+dev.toLowerCase()+T);
  await p.addStyleTag({content:'.firebase-emulator-warning,#toast,.toast{display:none!important}'});await p.evaluate(()=>{authSession.payload.role='gestor'});await p.evaluate(SEED);
  for(const th of ['lilas','violeta','cinza']){await p.evaluate(t=>e99Theme.set(t),th);await p.waitForTimeout(300);
   for(const pg of ['home','reports','alerts','account','data']){await p.evaluate(pg=>{go(pg);scrollTo(0,0)},pg);await p.waitForTimeout(900);
    await p.evaluate(()=>{const n=document.getElementById('local-note');if(n)n.remove()});
    const m=await p.evaluate(MEASURE,mob);const tag=dev+' '+th+' '+pg;
    ok(m.mark===pg,tag+': tela marcada para o padrão v165');
    ok(m.prim.length<=1,tag+': no máx. um botão primário visível ('+m.prim.join(' | ')+')');
    ok(!m.offFs.length,tag+': fontes na escala --p-*'+(m.offFs.length?' → '+m.offFs.slice(0,4).join(' | '):''));
    ok(!m.r.length,tag+': raios na escala --p-*'+(m.r.length?' → '+m.r.join(' '):''));
    ok(!m.low.length,tag+': contraste AA'+(m.low.length?' → '+m.low.slice(0,4).join(' | '):''));
    if(mob)ok(!m.small.length,tag+': toques ≥44 px'+(m.small.length?' → '+m.small.slice(0,4).join(' | '):''));
    ok(m.scroll<=1,tag+': sem rolagem lateral'+(m.scroll>1?' (+'+m.scroll+')':''));
    ok(m.empties.every(Boolean),tag+': estados vazios com ação');
    if(th==='lilas')await p.screenshot({path:path.join(OUT,pg+'-'+(mob?'iphone':'pc')+'.png')})}}
  await p.evaluate(()=>go('home'));await p.waitForTimeout(500);
  ok(await p.evaluate(()=>/^(dom|seg|ter|qua|qui|sex|sáb)\., \d{1,2} [a-zç]+\.?$/.test(document.querySelector('#view .hero-home .subtitle').textContent.trim())),dev+': data legível no Início');
  ok(await p.evaluate(()=>{go('alerts');return [...document.querySelectorAll('#view .alert-item .p165-ic')].length>0}),dev+': alertas em linhas com ícone');
  if(mob){const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   const gap=await p.evaluate(()=>new Promise(r=>{let last=performance.now(),max=0,n=0;go('home');function f(t){max=Math.max(max,t-last);last=t;if(++n<60)requestAnimationFrame(f);else r(Math.round(max))}requestAnimationFrame(f)}));
   ok(gap<250,'iPhone CPU 4x: abrir o Início sem travar (maior quadro '+gap+' ms)');await cdp.send('Emulation.setCPUThrottlingRate',{rate:1})}
  await ctx.close()}
 ok(!errs.length,'0 erro de console'+(errs.length?' → '+errs.slice(0,4).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro: '+e.message);process.exit(1)});
