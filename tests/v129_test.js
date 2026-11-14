/* v129: interface mais clara. PC 1440×900 + iPhone 13, papéis gestor, estoque e auxiliar.
   Confere: sem rolagem lateral, toques ≥44 px no celular, contraste AA dos textos principais nos 3 temas, item ativo da navegação evidente,
   Painel com período selecionado e sem subtítulo repetido, Administração com uma lista só, textos de toque na janela da NF no celular,
   Salvar/Cancelar fixos embaixo na folha do celular, status da NF numa fileira, contador da conferência sem borda vermelha e 0 erro de console. */
const L=require('./lib.js');const {ok}=L;
const URL0='http://localhost:8000/index.html?ntfy='+L.N;
(async()=>{const b=await L.chromium.launch();const errs=[];
 async function dev(nome,opts){const c=await b.newContext(opts);const P=await c.newPage();
  P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(nome+' console: '+m.text())});P.on('dialog',d=>d.accept());return P}
 const seed=async(P)=>P.evaluate(async()=>{const d=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
   state.team=[{id:'ana',name:'Ana Souza',role:'Repositora'}];state.corridors=[{id:'c7',number:'07',sector:'Mercearia',owner:'ana'}];
   state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios Serra Azul Ltda',date:iso(),status:'Pendente',owner:'ana',notes:'',volumes:3},{id:'n2',number:'48214',supplier:'Distribuidora Paulista de Bebidas e Alimentos S.A.',date:d(-3),status:'Em divergência',owner:'ana',notes:'Faltaram 2 caixas',volumes:12}];
   state.plans=[{id:'p1',title:'Plano de terça',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana Souza',notes:'',photos:[]}]}];await save();render()});
 const audit=(P,mobile)=>P.evaluate((mobile)=>{const vis=el=>{const s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0};
   const out={h:document.documentElement.scrollWidth>innerWidth+1,small:[]};
   if(mobile)document.querySelectorAll('#view button,#view summary,#view select,.mobile-options button,#mobile-bottom button').forEach(el=>{if(!vis(el))return;if(el.closest('p,li,label,.chat-react,.chat-reacts'))return;const r=el.getBoundingClientRect();if(r.height<43.5||r.width<43.5)out.small.push((el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,24)+' '+Math.round(r.width)+'×'+Math.round(r.height))});
   return out},mobile);
 async function tour(P,nome,mobile){const pages=await P.evaluate(()=>Object.keys(labels).concat(['account']).filter((x,i,a)=>a.indexOf(x)===i));const probs=[];
  for(const pg of pages){await P.evaluate(p=>{go(p);scrollTo(0,0)},pg);await P.waitForTimeout(350);const a=await audit(P,mobile);
   if(a.h)probs.push(pg+': rolagem horizontal');if(a.small.length)probs.push(pg+': toque pequeno '+a.small.slice(0,3).join(' | '))}
  ok(!probs.length,nome+': '+pages.length+' telas sem rolagem lateral'+(mobile?' e toques ≥44 px':'')+(probs.length?' → '+probs.slice(0,5).join(' ; '):''))}
 /* contraste: cor do texto × fundo efetivo (camadas translúcidas compostas sobre o fundo da página) */
 const contrast=(P)=>P.evaluate(()=>{const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);if(!m)return null;const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};
   const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
   const pageBg=parse(getComputedStyle(document.body).getPropertyValue('--ds-bg').trim().replace(/^#(..)(..)(..)$/,(m,a,b,c)=>'rgb('+parseInt(a,16)+','+parseInt(b,16)+','+parseInt(c,16)+')'))||{r:0,g:0,b:0,a:1};
   const bgOf=el=>{const st=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement){const c=parse(getComputedStyle(e).backgroundColor);if(c&&c.a>0){st.push(c);if(c.a>=1)break}}let base=pageBg;for(let i=st.length-1;i>=0;i--){const c=st[i];if(c.a>=1){base=c;continue}base={r:c.r*c.a+base.r*(1-c.a),g:c.g*c.a+base.g*(1-c.a),b:c.b*c.a+base.b*(1-c.a),a:1}}return base};
   const ratio=el=>{let f=parse(getComputedStyle(el).color),bg=bgOf(el);if(f.a<1)f={r:f.r*f.a+bg.r*(1-f.a),g:f.g*f.a+bg.g*(1-f.a),b:f.b*f.a+bg.b*(1-f.a)};const l1=lum(f),l2=lum(bg);return (Math.max(l1,l2)+.05)/(Math.min(l1,l2)+.05)};
   const sels=['#view .panel>h2','#view .panelhead h2','#view p.small','#view .stat span','#view .eyebrow','#view td','#view button.primary','#nav button[aria-current="page"]','#nav button:not(.active)','#mobile-bottom button[aria-current="page"]','#mobile-bottom button:not(.active)'];const bad=[];
   sels.forEach(s=>{const el=[...document.querySelectorAll(s)].find(x=>x.offsetParent&&x.textContent.trim());if(!el)return;const r=ratio(el);if(r<4.5)bad.push(s+' '+r.toFixed(2))});return bad});
 for(const [dk,opts,mob] of [['PC',{viewport:{width:1440,height:900}},false],['iPhone',L.devices['iPhone 13'],true]]){
  const G=await dev(dk+'-gestor',opts);await G.goto(URL0);await G.waitForTimeout(2500);await L.signup(G,'vferreiras','Lojas G');
  await G.evaluate(()=>{if(authSession.payload.role!=='gestor'){authSession.payload.role='gestor';try{applyRole()}catch(e){}}render()});await seed(G);
  await G.addStyleTag({content:'#alert-popup{display:none!important}'});
  await tour(G,dk+' gestor',mob);
  /* navegação: item ativo evidente */
  await G.evaluate(()=>go('nfs'));await G.waitForTimeout(300);
  ok(await G.evaluate((mob)=>{if(mob){const a=document.querySelector('#mobile-bottom button[aria-current="page"]'),o=document.querySelector('#mobile-bottom button:not(.active)');const s=a.querySelector('span');return !!a&&getComputedStyle(a).color!==getComputedStyle(o).color&&getComputedStyle(s).backgroundColor!=='rgba(0, 0, 0, 0)'&&+getComputedStyle(a).fontWeight>=700}
    const a=document.querySelector('#nav button[aria-current="page"]');return !!a&&/inset/.test(getComputedStyle(a).boxShadow)&&/3px 0px 0px 0px/.test(getComputedStyle(a).boxShadow)&&getComputedStyle(a).backgroundColor!=='rgba(0, 0, 0, 0)'},mob),dk+': item ativo da navegação evidente (cor, fundo e '+(mob?'peso':'barra lateral')+')');
  /* contraste AA nos 3 temas */
  const cbad=[];for(const th of ['lilas','violeta','cinza']){await G.evaluate(t=>{e99Theme.set(t)},th);for(const pg of ['home','nfs','reports']){await G.evaluate(p=>{go(p);scrollTo(0,0)},pg);await G.waitForTimeout(250);const r=await contrast(G);r.forEach(x=>cbad.push(th+'/'+pg+': '+x))}}
  await G.evaluate(()=>e99Theme.set('lilas'));
  ok(!cbad.length,dk+': contraste AA (≥4,5:1) dos textos principais nos 3 temas'+(cbad.length?' → '+cbad.slice(0,6).join(' | '):''));
  /* Painel */
  await G.evaluate(()=>go('reports'));await G.waitForTimeout(300);
  ok(await G.evaluate(()=>{const v=document.getElementById('view');const p=v.querySelector('.pn-period button[aria-pressed="true"]'),q=v.querySelector('.pn-period button[aria-pressed="false"]');return !!p&&getComputedStyle(p).backgroundColor!==getComputedStyle(q).backgroundColor&&!/Painel da operação/i.test(v.innerText)&&!v.querySelector('.hero .subtitle')}),dk+': Painel com o período selecionado visível e sem subtítulo repetido');
  /* Administração com uma lista só (com outra conta no aparelho) */
  ok(await G.evaluate(()=>{const A=window.authAccounts;window.authAccounts=function(){return A().concat([{login:'teste9',key:'zz-teste9',id:'STK-TESTE9'}])};try{go('admin');const v=document.getElementById('view');
     const twoLists=[...v.querySelectorAll('h2')].some(h=>/Contas neste aparelho/.test(h.textContent));const row=[...v.querySelectorAll('.admin-account')].find(r=>/teste9/.test(r.textContent));
     const note=document.getElementById('acc-local-note');return !twoLists&&!!row&&!!row.querySelector('button.danger[onclick^="authDeleteAccount"]')&&!!row.querySelector('button[onclick^="authBlockAccount"]')&&!!note&&!!note.closest('.panel')&&/Contas cadastradas/.test(v.innerText)}finally{window.authAccounts=A;render()}}),dk+': Administração com uma lista só (Excluir e Bloquear na mesma linha da conta)');
  /* janela da NF */
  await G.evaluate(()=>{go('nfs');openEditor('nf','n1')});await G.waitForTimeout(500);
  ok(await G.evaluate((mob)=>{const d=document.querySelector('dialog[open]');const t=d.innerText;const touch=/Toque no campo/.test(t)&&!/leitor USB/.test(t);const pc=/leitor USB/.test(t)&&!/Toque no campo/.test(t);return mob?touch:pc},mob),dk+': janela da NF com texto '+(mob?'de toque (sem "Clique"/"leitor USB")':'de PC'));
  if(mob){ok(await G.evaluate(()=>{const d=document.querySelector('dialog[open]');const f=d.querySelector('.formfoot');const r=f.getBoundingClientRect(),dr=d.getBoundingClientRect();return getComputedStyle(f).position==='sticky'&&r.bottom<=dr.bottom+1&&r.bottom>dr.bottom-90&&!!f.querySelector('button.primary')}),'iPhone: Salvar/Cancelar fixos embaixo da folha');}
  await G.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));
  if(mob){await G.evaluate(()=>{go('nfs');scrollTo(0,0)});await G.waitForTimeout(300);
   /* v145: no celular a nota é uma linha compacta; as ações aparecem ao abrir */
   await G.tap('#nf-results tr[data-nf] .nf-sum');await G.waitForTimeout(200);
   ok(await G.evaluate(()=>{const q=document.querySelector('#view tr.nf-x .nf-quick');if(!q||!q.getClientRects().length)return false;const bs=[...q.querySelectorAll('button')].map(b=>b.getBoundingClientRect());const o=document.querySelector('#view tr.nf-x .nf-actions .nf-open').getBoundingClientRect(),x=document.querySelector('#view tr.nf-x .nf-actions .e99-del').getBoundingClientRect();if(!o.height||!x.height)return false;
     return bs.every(r=>Math.abs(r.top-bs[0].top)<1)&&Math.abs(o.top-x.top)<1&&[...q.querySelectorAll('button')].every(b=>b.scrollWidth<=b.clientWidth+1)}),'iPhone: cartão da NF com status numa fileira e Abrir/Excluir lado a lado');
   await G.evaluate(()=>go('account'));await G.waitForTimeout(300);
   ok(await G.evaluate(()=>{const b=[...document.querySelectorAll('#view button')].filter(x=>/^(Exportar conta protegida|Sair da conta)/.test(x.textContent.trim()));return b.length===2&&b.every(x=>Math.abs(x.getBoundingClientRect().height-b[0].getBoundingClientRect().height)<1&&Math.abs(x.getBoundingClientRect().width-b[0].getBoundingClientRect().width)<1)}),'iPhone: Minha conta com botões da mesma altura e largura')}
  ok(await G.evaluate(()=>{const d=document.createElement('div');d.className='cf-countbox';document.body.appendChild(d);const c=getComputedStyle(d).borderTopColor;d.remove();return !/255, 42, 31/.test(c)}),dk+': contador da conferência sem a borda vermelha');
  ok(await G.evaluate(()=>{const s=getComputedStyle(document.documentElement);return s.getPropertyValue('--t-body').trim()==='15px'&&s.getPropertyValue('--sp-4').trim()==='16px'}),dk+': escala de texto e de espaçamento em tokens');
  await G.context().close();
  for(const role of ['estoque','auxiliar']){const B=await dev(dk+'-'+role,opts);await B.goto(URL0);await B.waitForTimeout(2500);await L.signup(B,role+'v129');
   if(role==='auxiliar')await B.evaluate(()=>{authSession.payload.role='auxiliar';try{applyRole()}catch(e){}render()});
   await seed(B);await B.addStyleTag({content:'#alert-popup{display:none!important}'});await tour(B,dk+' '+role,mob);await B.context().close()}
 }
 ok(!errs.length,'0 erro de console em todas as telas'+(errs.length?' → '+errs.slice(0,5).join(' | '):''));
 console.log('errors',JSON.stringify(errs.slice(0,10)));await b.close()})().catch(e=>{console.log('FAIL exceção',e.message);process.exit(1)});
