/* v165 · área B (Notas fiscais e Plano de ação) no padrão do sistema de design (app/css/v165-b.css).
   3 temas × PC 1440×900 e iPhone 13: fontes e raios na escala --p-*, sem rolagem lateral, toques ≥44 px no iPhone, contraste AA,
   estados vazios com ação, linhas de nota e de atividade com estrutura padronizada, ações do plano em primário + "Mais ações", 0 erro de console.
   Prints 2x "depois" em docs/prints/v165/b (fora do git). */
const L=require('./lib.js');const {ok}=L;const fs=require('fs'),path=require('path');
const BASE=process.env.BASE||'http://localhost:8000',U=BASE+'/index.html',OUT=process.env.SHOTS||'docs/prints/v165/b';
function watch(p,tag,errs){p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(tag+' console: '+m.text())});p.on('dialog',d=>d.accept())}
const SEED=()=>{state.team=[{id:'a',name:'Ana Souza',role:'Repositora'},{id:'b',name:'Bruno Lima',role:'Conferente'}];
  state.plans=[{id:'p1',title:'Plano do dia',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana Souza',notes:'',photos:[],done:true,time:'09:00'},{id:'a2',title:'Limpar corredor 09',owner:'Bruno Lima',notes:'Começar pela ponta',photos:[],done:false}]}];
  state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios Serra da Mantiqueira Ltda',date:iso(),status:'Conferido',owner:'a',notes:'',volumes:3},{id:'n2',number:'48214',supplier:'Bebidas Norte',date:iso(),status:'Em divergência',owner:'b',notes:'Faltou 1',volumes:1250},{id:'n3',number:'48215',supplier:'Hortifruti',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1}];return save()};
const SCALE=['12px','13px','15px','16px','22px','28px','40px','34px'];const RADII=['0px','8px','12px','20px','28px','999px','50%','22.5%'];
const MEASURE=(mob)=>{const vis=e=>{const r=e.getBoundingClientRect();if(r.width<1||r.height<1)return false;const s=getComputedStyle(e);return s.visibility!=='hidden'&&s.display!=='none'&&+s.opacity>0.05};
  const root=document.getElementById('view');const fsz=new Set(),rad=new Set(),low=[],small=[];const P=x=>(String(x).match(/[\d.]+/g)||[0,0,0]).map(Number);
  const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2])};
  const bgOf=e=>{let x=e;while(x&&x.nodeType===1){const s=getComputedStyle(x);if(s.backgroundImage&&s.backgroundImage!=='none'&&!/^(BODY|HTML)$/.test(x.nodeName))return null;if(s.backgroundColor!=='rgba(0, 0, 0, 0)'){const c=P(s.backgroundColor);if(c.length<4||c[3]>=.95)return c.slice(0,3);if(c[3]>.3)return null}x=x.parentElement}
    return getComputedStyle(document.documentElement).getPropertyValue('--p-bg').trim().replace('#','').match(/../g).map(h=>parseInt(h,16))};
  root.querySelectorAll('*').forEach(e=>{if(e instanceof SVGElement||!vis(e)||e.closest('.vd-art,.logo'))return;const s=getComputedStyle(e);const own=[...e.childNodes].some(n=>n.nodeType===3&&n.nodeValue.trim());
    if(own){fsz.add(s.fontSize);if(!e.closest('[disabled]')&&s.textDecorationLine.indexOf('line-through')<0){const bg=bgOf(e);if(bg){const fg=P(s.color);const a=fg.length>3?fg[3]:1;const c=[0,1,2].map(i=>fg[i]*a+bg[i]*(1-a));const cr=(Math.max(lum(c),lum(bg))+.05)/(Math.min(lum(c),lum(bg))+.05);
      const big=parseFloat(s.fontSize)>=24;if(cr<(big?3:4.5))low.push(e.nodeName+'.'+String(e.className).split(' ')[0]+' '+cr.toFixed(2)+' "'+e.textContent.trim().slice(0,20)+'"')}}}
    if(s.backgroundColor!=='rgba(0, 0, 0, 0)'||(parseFloat(s.borderTopWidth)>0&&s.borderTopStyle!=='none'))rad.add(s.borderTopLeftRadius);
    if(mob&&/^(BUTTON|INPUT|SELECT|SUMMARY)$/.test(e.nodeName)&&!/checkbox|radio|hidden/.test(e.type||'')&&!e.matches('.ph-dl,.ph-rm')){const r=e.getBoundingClientRect();if(Math.min(r.width,r.height)<43.5)small.push((e.textContent||e.name||e.nodeName).trim().slice(0,20)+' '+Math.round(r.width)+'×'+Math.round(r.height))}});
  return {fs:[...fsz],r:[...rad],low,small,scroll:document.documentElement.scrollWidth-innerWidth}};
(async()=>{const b=await L.chromium.launch();const errs=[];fs.mkdirSync(OUT,{recursive:true});const T=Date.now().toString(36);
 for(const dev of ['PC','iPhone']){const mob=dev==='iPhone';
  const ctx=await b.newContext(mob?{...L.devices['iPhone 13'],deviceScaleFactor:2}:{viewport:{width:1440,height:900},deviceScaleFactor:2});const p=await ctx.newPage();watch(p,dev,errs);
  await p.goto(U);await p.waitForTimeout(2500);await L.signup(p,'v165b'+dev.toLowerCase()+T);
  await p.addStyleTag({content:'.firebase-emulator-warning,#toast,.toast{display:none!important}'});await p.evaluate(()=>{authSession.payload.role='gestor'});await p.evaluate(SEED);
  ok(await p.evaluate(()=>!!document.getElementById('v165-b-css')&&getComputedStyle(document.documentElement).getPropertyValue('--p-soft-ok').trim()!==''),dev+': v165-b.css carregado com os tokens novos');
  for(const th of ['lilas','violeta','cinza']){await p.evaluate(t=>e99Theme.set(t),th);await p.waitForTimeout(300);
   for(const pg of ['nfs','plans']){await p.evaluate(pg=>{go(pg);scrollTo(0,0)},pg);await p.waitForTimeout(900);
    const m=await p.evaluate(MEASURE,mob);const offF=m.fs.filter(x=>!SCALE.includes(x)),offR=m.r.filter(x=>!RADII.includes(x));
    ok(!offF.length,dev+' '+th+' '+pg+': fontes na escala ('+m.fs.join(' ')+')');
    ok(offR.length<=1,dev+' '+th+' '+pg+': raios na escala'+(offR.length?' (fora: '+offR.join(' ')+')':''));
    ok(m.scroll<=1,dev+' '+th+' '+pg+': sem rolagem lateral');
    ok(!m.low.length,dev+' '+th+' '+pg+': contraste AA'+(m.low.length?' → '+m.low.slice(0,4).join(' | '):''));
    if(mob)ok(!m.small.length,dev+' '+th+' '+pg+': toques ≥44 px'+(m.small.length?' → '+m.small.slice(0,4).join(' | '):''));
    if(th==='lilas')await p.screenshot({path:path.join(OUT,'teste-'+pg+'-'+(mob?'iphone':'pc')+'.png'),fullPage:true})}
   /* estrutura das linhas */
   await p.evaluate(()=>go('nfs'));await p.waitForTimeout(400);
   ok(await p.evaluate(()=>{const rs=[...document.querySelectorAll('#nf-results tr[data-nf]')];return rs.length===3&&rs.every(r=>r.querySelector('.nf-pc b')&&r.querySelector('.p-sup[title]')&&r.querySelector('.badge')&&r.querySelector('td.p-num'))
     &&getComputedStyle(document.querySelector('#nf-results td.p-num')).textAlign==='right'&&/1\.250/.test(document.querySelector('#nf-results tr[data-nf=n2] td.p-num').textContent)}),dev+' '+th+': linha de nota padronizada (número, fornecedor com title, etiqueta, volumes à direita com milhar)');
   ok(await p.evaluate(()=>{const c=getComputedStyle(document.querySelector('#nf-results .badge.Conferido')).color,d=getComputedStyle(document.querySelector('#nf-results .badge.Em-divergência')).color;return c!==d}),dev+' '+th+': status em etiqueta semântica (cores distintas)');
   await p.evaluate(()=>go('plans'));await p.waitForTimeout(400);
   ok(await p.evaluate(()=>{const li=[...document.querySelectorAll('#view .plan-activities>li.p-act')];return li.length===2&&li.every(l=>l.querySelector('.act-check')&&l.querySelector('.p-act-head b')&&l.querySelector('.p-av')&&l.querySelector('.p-act-meta'))
     &&getComputedStyle(li[0].querySelector('.act-check')).borderTopLeftRadius==='999px'}),dev+' '+th+': atividades com check circular, título, inicial do responsável e meta');
   ok(await p.evaluate(()=>{const tb=document.querySelector('#view .plan-card .p-plan-actions');const vis=[...tb.children].filter(x=>x.getClientRects().length);return tb.querySelectorAll(':scope > .primary').length===1&&vis.length===3&&!!tb.querySelector('details.more-actions .more-menu button.danger')}),dev+' '+th+': ações do plano = 1 primário + Imprimir + Mais ações');
   ok(await p.evaluate(()=>/^[a-zé]{3}\., \d{1,2} [a-zç]{3}\.$/.test(document.querySelector('#view .plan-card .p-day').textContent)),dev+' '+th+': data legível no plano (ex. "ter., 25 nov.")');
  }
  /* estados vazios com ação */
  await p.evaluate(()=>{go('nfs');nfStatusFilter='Pendente';nfQuery='zzz';refreshNFs()});await p.waitForTimeout(300);
  ok(await p.evaluate(()=>{const e=document.querySelector('#nf-results .p-empty');const b=e&&e.querySelector('button');return !!(e&&e.querySelector('h3')&&b&&b.getBoundingClientRect().height>=43.5)}),dev+': lista filtrada vazia com título e botão "Limpar filtros"');
  await p.evaluate(()=>document.querySelector('#nf-results .p-empty button').click());await p.waitForTimeout(300);
  ok(await p.evaluate(()=>document.querySelectorAll('#nf-results tr[data-nf]').length===3),dev+': "Limpar filtros" volta a mostrar todas');
  await p.evaluate(()=>{planFilter='2001-01-01';go('plans')});await p.waitForTimeout(500);
  ok(await p.evaluate(()=>{const e=document.querySelector('#view .empty');return !!(e&&e.querySelector('h3')&&e.querySelector('button'))}),dev+': plano vazio com título e ação');
  await p.evaluate(()=>{planFilter=''});
  if(mob){const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   const gap=await p.evaluate(()=>new Promise(r=>{let last=performance.now(),max=0,n=0;go('plans');function f(t){max=Math.max(max,t-last);last=t;if(++n<60)requestAnimationFrame(f);else r(Math.round(max))}requestAnimationFrame(f)}));
   ok(gap<250,'iPhone CPU 4x: Plano abre sem travar (maior quadro '+gap+' ms)');await cdp.send('Emulation.setCPUThrottlingRate',{rate:1})}
  await ctx.close()}
 ok(!errs.length,'0 erro de console'+(errs.length?' → '+errs.slice(0,4).join(' | '):''));
 await b.close()})().catch(e=>{console.log('FAIL erro: '+e.message);process.exit(1)});
