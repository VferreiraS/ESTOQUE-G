/* v165: menu neutro (só o ativo com a cor da área) e títulos no texto 1 — paleta da v165.
   v158 · vida: cor por área, Início vivo (saudação, anéis, iniciais coloridas), animações leves (só transform/opacity, nada infinito),
   telas vazias ilustradas. 3 temas × PC 1440×900 e iPhone 13: contraste AA, sem rolagem lateral, toques ≥44 px, "menos movimento" sem animação,
   iPhone 13 com CPU 4x: troca de tela sem travar e, parado, nenhum recálculo de estilo (UpdateLayoutTree = 0). Prints 2x do Início em cada tema. */
const L=require('./lib.js');const {ok}=L;const fs=require('fs'),path=require('path');
const BASE=process.env.BASE||'http://localhost:8000',U=BASE+'/index.html',OUT=process.env.SHOTS||'docs/prints/v158';
function watch(p,tag,errs){p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(tag+' console: '+m.text())});p.on('dialog',d=>d.accept())}
const SEED=()=>{state.team=[{id:'a',name:'Ana Souza',role:'Repositora'},{id:'b',name:'Bruno Lima',role:'Conferente'},{id:'c',name:'Carla Dias',role:'Repositora'},{id:'d',name:'Diego',role:'Auxiliar'}];
  state.plans=[{id:'p1',title:'Plano do dia',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana Souza',notes:'',photos:[],done:true},{id:'a2',title:'Limpar corredor 09',owner:'Bruno Lima',notes:'',photos:[],done:false},{id:'a3',title:'Contar caixas',owner:'Carla Dias',notes:'',photos:[],done:true}]}];
  state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios Serra',date:iso(),status:'Conferido',owner:'a',notes:'',volumes:3},{id:'n2',number:'48214',supplier:'Bebidas Norte',date:iso(),status:'Em divergência',owner:'b',notes:'Faltou 1',volumes:2},{id:'n3',number:'48215',supplier:'Hortifruti',date:iso(),status:'Pendente',owner:'',notes:'',volumes:1}];
  state.corridors=[{id:'c7',number:'07',sector:'Mercearia',owner:'a'}];return save()};
const LUM=c=>{const m=String(c).match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2])};
const CR=(a,b)=>{const x=LUM(a),y=LUM(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const HEX=h=>{h=h.trim().replace('#','');if(h.length===3)h=h.split('').map(c=>c+c).join('');return 'rgb('+parseInt(h.slice(0,2),16)+','+parseInt(h.slice(2,4),16)+','+parseInt(h.slice(4,6),16)+')'};
(async()=>{const b=await L.chromium.launch();const errs=[];fs.mkdirSync(OUT,{recursive:true});const T=Date.now().toString(36);const shots=[];
 for(const dev of ['PC','iPhone']){
  const opt=dev==='PC'?{viewport:{width:1440,height:900},deviceScaleFactor:2}:{...L.devices['iPhone 13'],deviceScaleFactor:2};
  const ctx=await b.newContext(opt);const p=await ctx.newPage();watch(p,dev,errs);
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'vd'+dev.toLowerCase()+T);await p.addStyleTag({content:'.firebase-emulator-warning,#toast,.toast{display:none!important}'});
  await p.evaluate(()=>{authSession.payload.role='gestor'});
  /* telas vazias (sem dados, sem equipe) */
  await p.evaluate(()=>{state.nfs=[];state.plans=[];state.corridors=[];state.team=[];return save()});
  const emp={};for(const pg of ['nfs','plans','corridors','team','alerts','chat']){await p.evaluate(pg=>{go(pg);window.scrollTo(0,0)},pg);await p.waitForTimeout(450);
    emp[pg]=await p.evaluate(()=>{const a=document.querySelector('#view .vd-art');if(!a)return null;const box=a.closest('.vd-empty');const btn=box&&box.querySelector('button');return {txt:!!(box&&box.querySelector('h3')),btn:btn?btn.getBoundingClientRect().height:0,fill:getComputedStyle(a).color}})}
  ok(Object.keys(emp).every(k=>emp[k]&&emp[k].txt&&emp[k].btn>=44),dev+': telas vazias com ilustração, texto e botão ≥44 px ('+Object.keys(emp).map(k=>k+':'+(emp[k]?Math.round(emp[k].btn):'—')).join(' ')+')');
  await p.evaluate(SEED);
  for(const th of ['lilas','violeta','cinza']){
   await p.evaluate(t=>{e99Theme.set(t);go('nfs')},th);await p.waitForTimeout(300);await p.evaluate(()=>{go('home');window.scrollTo(0,0)});await p.waitForTimeout(1600);
   const h=await p.evaluate(()=>{const g=document.querySelector('#vd-home .vd-greet h2'),cs=getComputedStyle(document.body);
     const rings=[...document.querySelectorAll('#vd-home .vd-ring')].map(r=>({n:r.querySelector('.vd-num').textContent,c:getComputedStyle(r.querySelector('.vd-ring-fg')).stroke}));
     const avs=[...document.querySelectorAll('#vd-home .vd-av')].map(a=>({bg:getComputedStyle(a).backgroundColor,c:getComputedStyle(a).color}));
     const nav=[...document.querySelectorAll((innerWidth<800?'#mobile-bottom':'aside .nav')+' button[data-vd-area]')].filter(b=>b.dataset.vdArea&&b.dataset.vdArea!=='inicio').map(b=>{const s=b.querySelector('svg.ic');return s?getComputedStyle(s).stroke:''});
     const stats=[...document.querySelectorAll('#view .stats .stat.e99-go')].map(s=>s.dataset.vdArea);
     return {greet:g?g.textContent:'',card:cs.getPropertyValue('--glass-card'),bg:cs.getPropertyValue('--ds-bg'),ink:getComputedStyle(g).color,muted:getComputedStyle(document.querySelector('.vd-greet p')).color,rings,avs,nav,stats,
       areas:['notas','plano','equipe','chat','painel','corredores','alertas'].map(a=>cs.getPropertyValue('--area-'+a)),sw:document.documentElement.scrollWidth,iw:innerWidth}});
   ok(/^(Bom dia|Boa tarde|Boa noite), \S+!$/.test(h.greet),dev+' '+th+': saudação do dia ('+h.greet+')');
   ok(h.rings.length===2&&h.rings[0].n==='67'&&h.rings[1].n==='33',dev+' '+th+': anéis do plano (67%) e das notas conferidas (33%) ('+h.rings.map(r=>r.n).join(',')+')');
   ok(h.avs.length===4&&new Set(h.avs.map(a=>a.bg)).size>=3&&h.avs.every(a=>CR(a.bg,a.c)>=4.5),dev+' '+th+': iniciais coloridas por pessoa com contraste AA');
   ok(h.nav.length>=3&&new Set(h.nav).size<=2,dev+' '+th+': v165: ícones do menu neutros, só o item ativo leva a cor da área ('+new Set(h.nav).size+' cores)');
   const card=HEX(h.card),bg=HEX(h.bg);const low=h.areas.map(a=>CR(HEX(a),card)).filter(c=>c<4.5);
   ok(!low.length&&CR(h.ink,card)>=4.5&&CR(h.muted,card)>=4.5&&CR(h.areas.length?HEX(h.areas[0]):bg,bg)>=4.5,dev+' '+th+': contraste AA (7 cores de área, título e texto sobre o cartão; mín. '+Math.min(...h.areas.map(a=>CR(HEX(a),card))).toFixed(1)+')');
   ok(h.stats.filter(Boolean).length>=3,dev+' '+th+': resumo do que pede ação colorido por área ('+h.stats.join(',')+')');
   ok(h.sw<=h.iw,dev+' '+th+': Início sem rolagem lateral');
   const f=path.join(OUT,'inicio-'+th+'-'+(dev==='PC'?'pc':'iphone')+'.png');await p.waitForTimeout(400);await p.screenshot({path:f});shots.push(f);
  }
  /* todas as áreas: título com a cor da área, sem rolagem lateral, toques ≥44 px nos elementos novos */
  const ar=[];for(const pg of ['nfs','plans','team','corridors','alerts','chat','reports']){await p.evaluate(pg=>{go(pg);window.scrollTo(0,0)},pg);await p.waitForTimeout(450);
    ar.push(await p.evaluate(pg=>{const a=document.body.dataset.area,h=document.querySelector('#view .hero h1 .accent-word,#view h2.vh');const t1=document.createElement('i');t1.style.color='var(--p-t1)';document.body.appendChild(t1);const t1c=getComputedStyle(t1).color;t1.remove();return {pg,a,t1:t1c,c:h?getComputedStyle(h).color:'',want:getComputedStyle(document.body).getPropertyValue('--area-'+a).trim(),sw:document.documentElement.scrollWidth<=innerWidth}},pg))}
  ok(ar.every(x=>x.sw),dev+': nenhuma área com rolagem lateral');
  ok(ar.filter(x=>x.a&&x.want&&x.c&&x.c===x.t1).length>=4,dev+': v165: títulos no texto 1 do tema, área marcada no body ('+ar.map(x=>x.pg+':'+x.a).join(' ')+')');
  await p.evaluate(()=>go('plans'));await p.waitForTimeout(500);
  ok(await p.evaluate(()=>{const b=document.querySelector('.plan-card .vd-bar i');return b&&/scaleX\(0\.66/.test(b.style.transform)}),dev+': barra de progresso no cartão do plano (2 de 3)');
  /* animações: rodam na troca de tela, só transform/opacity, e terminam (nada infinito) */
  const run=await p.evaluate(async()=>{go('home');const n=e99Vida.running();const props=new Set();e99Vida.list().forEach(a=>{try{a.effect.getKeyframes().forEach(k=>Object.keys(k).forEach(x=>{if(!/^(offset|easing|composite|computedOffset)$/.test(x))props.add(x)}))}catch(e){}});
    const inf=document.getAnimations().filter(a=>{try{return a.effect.getTiming().iterations===Infinity}catch(e){return false}}).length;await new Promise(r=>setTimeout(r,2200));return {n,props:[...props],inf,after:e99Vida.running()}});
  ok(run.n>=5&&run.after===0&&run.inf===0,dev+': animações na troca de tela ('+run.n+') terminam sozinhas, nenhuma infinita');
  ok(run.props.every(x=>/^(transform|opacity)$/.test(x)),dev+': só transform/opacity ('+run.props.join(',')+')');
  ok(await p.evaluate(()=>{const s=[...document.querySelectorAll('#view .stat strong')].map(x=>x.textContent);return s.length&&s.every(t=>/^\d+$/.test(t))}),dev+': números do resumo terminam no valor certo (count-up)');
  /* check que pula */
  await p.evaluate(()=>go('plans'));await p.waitForTimeout(600);
  const pop=await p.evaluate(()=>{const b=[...document.querySelectorAll('.act-check')].find(x=>x.getAttribute('aria-pressed')==='false');b.click();return new Promise(r=>setTimeout(()=>{r(e99Vida.running())},120))});
  ok(pop>=1,dev+': check pula ao concluir a atividade');
  /* aba oculta: tudo termina na hora */
  const hid=await p.evaluate(()=>{go('home');const a=e99Vida.running();Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));const b=e99Vida.running();delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));return {a,b}});
  ok(hid.a>0&&hid.b===0,dev+': aba oculta termina as animações ('+JSON.stringify(hid)+')');
  if(dev==='iPhone'){
   /* CPU 4x: troca de tela sem travar e, parado, UpdateLayoutTree = 0 */
   const cdp=await ctx.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});await cdp.send('Performance.enable');
   const gap=await p.evaluate(()=>new Promise(r=>{let last=performance.now(),max=0,n=0;go('nfs');function f(t){max=Math.max(max,t-last);last=t;if(++n<60)requestAnimationFrame(f);else r(Math.round(max))}requestAnimationFrame(f)}));
   ok(gap<250,'iPhone CPU 4x: troca de tela sem travar (maior quadro '+gap+' ms)');
   await p.evaluate(()=>go('home'));await p.waitForTimeout(3000);
   const m=async()=>{const r=await cdp.send('Performance.getMetrics');const o={};r.metrics.forEach(x=>o[x.name]=x.value);return o};
   const a=await m();await p.waitForTimeout(2000);const c=await m();
   ok(c.RecalcStyleCount-a.RecalcStyleCount===0&&c.LayoutCount-a.LayoutCount===0,'iPhone CPU 4x parado: UpdateLayoutTree = 0 (estilo '+(c.RecalcStyleCount-a.RecalcStyleCount)+', layout '+(c.LayoutCount-a.LayoutCount)+')');
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:1})}
  await ctx.close()}
 /* "menos movimento": nenhuma animação */
 {const ctx=await b.newContext({viewport:{width:1440,height:900},reducedMotion:'reduce'});const p=await ctx.newPage();watch(p,'PC-rm',errs);
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'vdrm'+T);await p.evaluate(()=>{authSession.payload.role='gestor'});await p.evaluate(SEED);
  const r=await p.evaluate(async()=>{let max=0;for(const pg of ['nfs','plans','team','home']){go(pg);await new Promise(r=>setTimeout(r,80));max=Math.max(max,e99Vida.running(),document.getAnimations().filter(a=>{if(a.playState!=='running'||a.animationName)return false;try{return a.effect.getKeyframes().some(k=>k.transform&&k.transform!=='none')}catch(e){return false}}).length)}return {max,num:document.querySelector('#vd-home .vd-num').textContent}});
  ok(r.max===0&&r.num==='67','"menos movimento": nenhuma animação da vida nem de movimento (só o esmaecer antigo) e números já no valor final ('+JSON.stringify(r)+')');
  ok(await p.evaluate(()=>getComputedStyle(document.querySelector('#view button')).transitionDuration.split(',').every(x=>parseFloat(x)===0)),'"menos movimento": toque sem transição');
  await ctx.close()}
 console.log('prints: '+shots.join(' '));
 ok(errs.length===0,'0 erro de console');console.log('errors',JSON.stringify(errs));await b.close()})().catch(e=>{console.log('FAIL erro do teste: '+e.message);process.exit(1)});
