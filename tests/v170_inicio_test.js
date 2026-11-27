/* v170: Início no padrão da nova arte (iPhone 13 390×844 e PC 1440×900).
   Topo com ☰ + logo StoK (celular), "Visão geral", pílula StoK, "Tudo no / seu lugar." (vermelho), foto do galpão e S,
   botão "+ Novo plano" largo e vermelho (≥44 px, abre o plano), saudação com iniciais (até 4 + "+N") e ilustração,
   anéis com ícone, contagem de planos de hoje e de atividades que passaram do horário, aba Início vermelha só no Início,
   blocos de baixo preservados (Plano de ação de hoje, Demandas, Equipe, Mapa), sem rolagem lateral, 0 erro e 0 404. */
const L=require('./lib.js');const {ok}=L;
const BASE=process.env.BASE||'http://localhost:8000',U=BASE+'/index.html';
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now().toString(36);
 for(const dev of ['iPhone','PC']){
  const opt=dev==='PC'?{viewport:{width:1440,height:900}}:{viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,userAgent:L.devices['iPhone 13'].userAgent};
  const ctx=await b.newContext(opt);const p=await ctx.newPage();
  p.on('pageerror',e=>errs.push(dev+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(dev+' console: '+m.text())});
  p.on('response',r=>{if(r.status()===404)errs.push(dev+' 404 '+r.url())});p.on('dialog',d=>d.accept());
  await p.goto(U);await p.waitForTimeout(2000);await L.signup(p,'ini'+dev.toLowerCase()+T);await p.addStyleTag({content:'.firebase-emulator-warning,#toast,#alert-popup{display:none!important}'});
  await p.evaluate(()=>{authSession.payload.role='gestor';const y=new Date();y.setDate(y.getDate()-1);const yi=y.toISOString().slice(0,10);
    state.team=['Luis Fernando','Marcos','Tiago','Lucas','Ana','Bia'].map((n,i)=>({id:'t'+i,name:n,role:'Repositor'}));
    state.plans=[{id:'p0',title:'Ontem',date:yi,activities:[{id:'x1',title:'Repor',owner:'Marcos',notes:'',photos:[],time:'08:00'}]}];state.nfs=[];return save()});
  await p.evaluate(()=>{go('nfs');go('home');scrollTo(0,0)});await p.waitForTimeout(1500);
  const h=await p.evaluate(()=>{const q=s=>document.querySelector(s),cs=(s,k)=>q(s)?getComputedStyle(q(s))[k]:'';const r=s=>q(s)?q(s).getBoundingClientRect():{width:0,height:0};
    const acc=q('.hero-home h1 .accent-word');const lg=q('#ini-logo');const bf=getComputedStyle(q('.hero-home'),'::before');
    return {cls:document.body.classList.contains('ini170'),logo:!!lg&&lg.complete&&lg.naturalWidth>0,logoVis:!!lg&&getComputedStyle(lg).display!=='none',menu:cs('#ini-menu','display'),menuH:r('#ini-menu').height,
      kicker:(q('.hero-home .ini-kicker')||{}).textContent,pill:(q('.hero-home .hero-pill')||{}).textContent,h1:(q('.hero-home h1')||{}).textContent,acc:acc&&acc.textContent,accC:acc&&getComputedStyle(acc).color,
      foto:/inicio-galpao\.jpg/.test(bf.backgroundImage)&&bf.display!=='none',s:!!q('.hero-home .ini-s')&&q('.hero-home .ini-s').naturalWidth>0,date:(q('.hero-home .subtitle')||{}).textContent,
      btn:{w:r('.hero-home .primary').width,h:r('.hero-home .primary').height,bg:cs('.hero-home .primary','backgroundImage'),on:(q('.hero-home .primary')||{getAttribute(){return ''}}).getAttribute('onclick')},
      viewW:r('#view').width,greet:(q('#vd-home .vd-greet h2')||{}).textContent,sub:(q('#vd-home .vd-greet p')||{}).textContent,
      avs:[...document.querySelectorAll('#vd-home .vd-av')].map(a=>a.textContent),casa:!!q('#vd-home .ini-casa')&&q('#vd-home .ini-casa').naturalWidth>0,
      rings:[...document.querySelectorAll('#vd-home .vd-ring')].map(x=>!!x.querySelector('.ini-ic svg')&&!!x.querySelector('.ini-cap')),ringC:cs('#vd-home .vd-ring-fg','stroke'),
      counts:[...document.querySelectorAll('#ini-counts .ini-count')].map(c=>c.querySelector('b').textContent+'|'+c.querySelector('span').textContent+'|'+Math.round(c.getBoundingClientRect().height)),
      order:[...q('#view').children].map(e=>e.id||e.className.split(' ')[0]).slice(0,12).join(','),
      blocks:['Plano de ação de hoje','Demandas do estoque','colaboradores','corredores'].map(t=>q('#view').textContent.includes(t)),
      stats:!!q('#view .stats .stat.e99-go'),navBg:cs('#mobile-bottom button.active>span:first-child','backgroundImage'),bg:getComputedStyle(document.body).backgroundColor,
      sw:document.documentElement.scrollWidth,iw:innerWidth}});
  ok(h.cls,dev+': body.ini170 no Início');
  if(dev==='iPhone'){ok(h.logo&&h.logoVis&&h.menu!=='none'&&h.menuH>=44,dev+': topo com ☰ (44 px) e logo StoK');
    ok(/gradient/.test(h.navBg),dev+': aba Início com pílula vermelha')}
  else ok(h.logo&&!h.logoVis,dev+': logo do topo só no celular (PC usa o menu lateral)');
  ok(h.kicker==='Visão geral'&&/StoK/.test(h.pill)&&/^Tudo no\s*seu lugar\.$/.test(h.h1.trim())&&h.acc==='seu lugar.',dev+': textos da arte ('+h.kicker+' · '+h.pill+' · '+h.h1+')');
  ok(/rgb\(24[0-9], 0, 1\)/.test(h.accC),dev+': "seu lugar." em vermelho ('+h.accC+')');
  ok(h.foto&&h.s,dev+': foto do galpão no fundo e S vermelho');
  ok(/^[a-záéíóúâêôãõç]{3,4}\., \d{1,2} [a-zç]{3,4}\.?$/i.test(h.date||''),dev+': data curta ('+h.date+')');
  ok(h.btn.h>=44&&h.btn.w>=h.viewW-2&&/gradient/.test(h.btn.bg)&&/openPlan\(\)/.test(h.btn.on),dev+': botão "+ Novo plano" largo, vermelho, ≥44 px, abre o plano ('+Math.round(h.btn.w)+'×'+Math.round(h.btn.h)+')');
  ok(/^(Bom dia|Boa tarde|Boa noite), \S+!$/.test(h.greet)&&h.sub==='Sem plano para hoje ainda.',dev+': saudação real ('+h.greet+' · '+h.sub+')');
  ok(h.avs.join(',')==='LF,M,T,L,+2'&&h.casa,dev+': até 4 iniciais + "+N" e ilustração do galpão ('+h.avs.join(',')+')');
  ok(h.rings.length===2&&h.rings.every(Boolean)&&/250, 41, 43/.test(h.ringC),dev+': anéis vermelhos com ícone');
  ok(h.counts.length===2&&/^0\|Nenhum plano para hoje\|/.test(h.counts[0])&&/^1\|passaram do horário\|/.test(h.counts[1])&&h.counts.every(c=>+c.split('|')[2]>=44),dev+': contagens (planos de hoje e atrasadas) ('+h.counts.join(' ; ')+')');
  ok(/^hero,vd-home,ini-counts/.test(h.order)&&h.blocks.every(Boolean)&&h.stats,dev+': primeira tela na ordem da arte e blocos de baixo preservados ('+h.order+')');
  ok(h.bg==='rgb(0, 0, 0)'&&h.sw<=h.iw,dev+': fundo preto e sem rolagem lateral');
  /* plano de hoje conta */
  await p.evaluate(()=>{state.plans.push({id:'p1',title:'Hoje',date:iso(),activities:[{id:'y1',title:'Contar',owner:'Ana',notes:'',photos:[]}]});return save()});await p.evaluate(()=>{go('nfs');go('home')});await p.waitForTimeout(600);
  ok(await p.evaluate(()=>document.querySelector('#ini-counts .ini-count b').textContent==='1'&&/1 plano para hoje|plano para hoje/.test(document.querySelector('#ini-counts .ini-count span').textContent)),dev+': 1 plano de hoje contado');
  /* clique nos cartões e no botão */
  await p.click('#ini-counts .ini-count[data-ini-go=alerts]');await p.waitForTimeout(400);const pg1=await p.evaluate(()=>page);
  await p.evaluate(()=>go('home'));await p.waitForTimeout(400);await p.click('.hero-home .primary');await p.waitForTimeout(600);const pg2=await p.evaluate(()=>page+':'+!!planDraft);
  ok(pg1==='alerts'&&pg2==='plans:true',dev+': cartão leva aos alertas e o botão abre o plano ('+pg1+' · '+pg2+')');
  /* outras telas sem a arte do Início */
  const o=[];for(const pg of ['nfs','plans','chat','mobile-menu']){await p.evaluate(pg=>{try{planDraft=null}catch(e){}go(pg)},pg);await p.waitForTimeout(300);
    o.push(await p.evaluate(()=>!document.body.classList.contains('ini170')&&(!document.querySelector('#ini-menu')||getComputedStyle(document.querySelector('#ini-menu')).display==='none')&&!/gradient/.test(getComputedStyle(document.querySelector('#mobile-bottom button.active>span:first-child')||document.body).backgroundImage)))}
  ok(o.every(Boolean),dev+': Notas, Plano, Chat e Mais sem a arte do Início ('+o.join(',')+')');
  await ctx.close()}
 ok(!errs.length,'0 erro e 0 404 ('+errs.slice(0,3).join(' | ')+')');
 await b.close()})();
