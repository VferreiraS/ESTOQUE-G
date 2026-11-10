/* v128: acabamento profissional. PC 1440×900 + iPhone 13, papéis gestor, estoque e auxiliar, com dados e vazio.
   Em todas as telas: sem rolagem horizontal, sem "undefined/null/NaN/[object Object]/Invalid Date" e sem "(s)" visível,
   sem emoji usado como ícone em menus, botões e títulos, toques ≥44 px no celular e 0 erro de console.
   Pontos arrumados: plural certo, textos sem jargão, ícones SVG, estados vazios com ação, janela centralizada no iPhone. */
const L=require('./lib.js');const {ok,until}=L;
const URL0='http://localhost:8000/index.html?ntfy='+L.N;
(async()=>{const b=await L.chromium.launch();const errs=[];
 async function dev(nome,opts,init){const c=await b.newContext(opts);if(init)await c.addInitScript(init);const P=await c.newPage();
  P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(nome+' console: '+m.text())});P.on('dialog',d=>d.accept());return P}
 const audit=(P,mobile)=>P.evaluate((mobile)=>{const vis=el=>{const s=getComputedStyle(el);if(s.display==='none'||s.visibility==='hidden'||+s.opacity===0)return false;const r=el.getBoundingClientRect();return r.width>0&&r.height>0};
   const out={h:document.documentElement.scrollWidth>innerWidth+1,bad:[],emoji:[],small:[]};const t=(document.getElementById('view')||document.body).innerText+' '+(document.querySelector('aside')||{innerText:''}).innerText;
   const m=t.match(/\b(undefined|NaN)\b|\bnull\b|\[object Object\]|Invalid Date|[A-Za-zÀ-ÿ]\(s\)/g);if(m)out.bad=[...new Set(m)];
   const EM=/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}]/u;
   document.querySelectorAll('aside button,#mobile-bottom button,#view .hero button,#view .hero summary,#view h1,#view h2,#view h3,#view summary,.mobile-options button,#alert-popup h2,#alert-popup button').forEach(el=>{if(!vis(el)||el.closest('.chat-wrap'))return;const x=(el.textContent||'').replace(/[©®™]/g,'');if(EM.test(x))out.emoji.push(x.trim().slice(0,40))});
   if(mobile)document.querySelectorAll('#view button,#view summary,#view select,.mobile-options button,#alert-popup button').forEach(el=>{if(!vis(el))return;if(el.closest('p,li,label,.chat-react,.chat-reacts'))return;const r=el.getBoundingClientRect();if(r.height<43.5||r.width<43.5)out.small.push((el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,30)+' '+Math.round(r.width)+'x'+Math.round(r.height))});
   return out},mobile);
 async function tour(P,nome,mobile){const pages=await P.evaluate(()=>Object.keys(labels).concat(['account']).concat(innerWidth<761?['mobile-menu']:[]).filter((x,i,a)=>a.indexOf(x)===i));const probs=[];
  for(const pg of pages){await P.evaluate(p=>{go(p);scrollTo(0,0)},pg);await P.waitForTimeout(450);const a=await audit(P,mobile);
   if(a.h)probs.push(pg+': rolagem horizontal');if(a.bad.length)probs.push(pg+': texto '+a.bad.join(','));if(a.emoji.length)probs.push(pg+': emoji '+a.emoji.join(' | '));if(a.small.length)probs.push(pg+': toque pequeno '+a.small.slice(0,4).join(' | '))}
  ok(!probs.length,nome+': '+pages.length+' telas sem rolagem lateral, texto quebrado, emoji de ícone'+(mobile?' nem toque <44 px':'')+(probs.length?' → '+probs.slice(0,6).join(' ; '):''))}
 const seed=async(P)=>P.evaluate(async()=>{const d=n=>{const x=new Date();x.setDate(x.getDate()+n);return x.toISOString().slice(0,10)};
   state.team=[{id:'ana',name:'Ana Souza',role:'Repositora'}];state.corridors=[{id:'c7',number:'07',sector:'Mercearia',owner:'ana'}];
   state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios Serra Azul Ltda',date:iso(),status:'Pendente',owner:'ana',notes:'',volumes:3},{id:'n2',number:'48214',supplier:'Distribuidora Paulista de Bebidas e Alimentos S.A.',date:d(-3),status:'Em divergência',owner:'ana',notes:'Faltaram 2 caixas',volumes:12}];
   state.plans=[{id:'p1',title:'Plano de terça',date:iso(),activities:[{id:'a1',title:'Repor arroz no 07',owner:'Ana Souza',notes:'',photos:[]}]}];await save();render()});
 for(const [dk,opts,mob] of [['PC',{viewport:{width:1440,height:900}},false],['iPhone',L.devices['iPhone 13'],true]]){
  /* tela de entrar real (sem a criação livre dos testes antigos) */
  const S=await dev(dk+'-entrar',opts,()=>{try{localStorage.setItem('e99-test-strict','1');localStorage.removeItem('e99-test-signup')}catch(e){}});
  await S.goto(URL0);await until(S,()=>!!window.__e99Boot,null,8000);await S.waitForTimeout(800);
  ok(await S.evaluate(()=>/Lojas G · Estoque 99/i.test(document.querySelector('#auth-screen .brand small').textContent)&&!/ACESSO LOCAL/i.test(document.getElementById('auth-screen').textContent)),dk+': marca da tela de entrar igual à da abertura (Lojas G · Estoque 99)');
  await S.click('#auth-owner');await S.waitForTimeout(300);ok(await S.evaluate(()=>/Primeiro acesso do dono/.test(document.querySelector('#auth-screen h1').textContent)),dk+': título do primeiro acesso diz o que é');
  await S.evaluate(()=>authSetMode('login'));await S.waitForTimeout(300);await S.fill('#auth-form input[name=login]','ninguem');await S.fill('#auth-form input[name=password]','errada123');await S.click('#auth-form button[type=submit]');await S.waitForTimeout(1500);
  ok(await S.evaluate(()=>{const e=document.querySelector('#auth-screen .auth-error');return !!e&&e.textContent.trim().length>0&&getComputedStyle(e).borderStyle!=='none'}),dk+': erro de entrar aparece como aviso (caixa)');
  const dlg=await S.evaluate(()=>{const d=document.getElementById('cloud-pull');if(!d||!d.open)return null;const r=d.getBoundingClientRect();return {l:r.left,r:innerWidth-r.right,t:d.textContent}});
  ok(!!dlg&&Math.abs(dlg.l-dlg.r)<=2&&!/[☁]/.test(dlg.t)&&!/código · recuperar/.test(dlg.t),dk+': "Trazer da nuvem" centralizada, sem emoji e citando "Esqueci a senha"'+(dlg?' ('+Math.round(dlg.l)+'/'+Math.round(dlg.r)+')':''));
  if(mob){await S.evaluate(()=>document.querySelectorAll('dialog[open]').forEach(d=>d.close()));const sm=await S.evaluate(()=>[...document.querySelectorAll('#auth-screen button')].filter(x=>x.offsetParent&&x.getBoundingClientRect().height<43.5).map(x=>x.textContent.trim()));ok(!sm.length,'iPhone: botões da tela de entrar com 44 px'+(sm.length?' → '+sm.join(', '):''))}
  await S.context().close();
  /* gestor */
  const G=await dev(dk+'-gestor',opts);await G.goto(URL0);await G.waitForTimeout(2500);await L.signup(G,'vferreiras','Lojas G');
  await G.evaluate(()=>{if(authSession.payload.role!=='gestor'){authSession.payload.role='gestor';try{applyRole()}catch(e){}}render()});
  await tour(G,dk+' gestor vazio',mob);
  await G.evaluate(()=>go('nfs'));await G.waitForTimeout(400);ok(await G.evaluate(()=>{const e=document.querySelector('#view .empty');return !!e&&/Nenhuma nota fiscal ainda/.test(e.textContent)&&!!e.querySelector('button')}),dk+': lista de notas vazia explica e oferece "Adicionar nota fiscal"');
  await G.evaluate(()=>go('corridors'));await G.waitForTimeout(400);ok(await G.evaluate(()=>{const e=document.querySelector('#view .e99-empty');return !!e&&/Nenhum corredor/.test(e.textContent)&&!!e.querySelector('button')}),dk+': corredores vazio explica e oferece "Adicionar corredor"');
  await seed(G);await tour(G,dk+' gestor com dados',mob);
  ok(await G.evaluate(()=>!/Site Gestor/.test(document.body.innerText)&&!/Seu acesso ADM|Administração local|híbrido|FormSubmit/.test((go('admin'),document.body.innerText)+(go('alerts'),document.body.innerText))),dk+': sem jargão ("Site Gestor", "ADM", "híbrido", "FormSubmit")');
  await G.evaluate(()=>go('nfs'));await G.waitForTimeout(300);
  ok(await G.evaluate(()=>{const b=document.getElementById('conf-go');return !!b&&/Iniciar conferência por câmera/.test(b.textContent)&&!/EAN-13/.test(document.getElementById('view').innerText)&&/Lista de notas/.test(document.getElementById('view').innerText)}),dk+': Notas fiscais com título da lista próprio e botão da conferência sem caixa alta');
  ok(await G.evaluate(()=>{checkAlerts(true);const p=document.getElementById('alert-popup');if(!p||p.classList.contains('hidden'))return 'sem popup';return new Promise(r=>setTimeout(r,50)).then(()=>!/\(s\)/.test(p.textContent)&&/1 pendência precisa de atenção/.test(p.textContent)&&!/⏱/.test(p.textContent)&&!!p.querySelector('h2 svg.ic'))}).catch(e=>String(e)),dk+': aviso de prazos com plural certo e ícone SVG');
  ok(await G.evaluate(()=>window.e99Plural('Recebida há 1 dia(s) · Limite: 2 dia(s)')==='Recebida há 1 dia · Limite: 2 dias'&&window.e99Plural('3 nota(s) adicionada(s)')==='3 notas adicionadas'),dk+': plural automático ("1 dia", "2 dias", "3 notas adicionadas")');
  if(mob){await G.evaluate(()=>go('mobile-menu'));await G.waitForTimeout(300);ok(await G.evaluate(()=>{const b=document.querySelector('.mobile-options button[onclick="authLogout()"]');return !!b&&!!b.querySelector('svg.ic')&&getComputedStyle(b).alignItems==='center'}),'iPhone: "Sair da conta" no menu com ícone e alinhado aos outros itens')}
  await G.context().close();
  /* estoque e auxiliar */
  for(const role of ['estoque','auxiliar']){const B=await dev(dk+'-'+role,opts);await B.goto(URL0);await B.waitForTimeout(2500);await L.signup(B,role+'v128');
   if(role==='auxiliar')await B.evaluate(()=>{authSession.payload.role='auxiliar';try{applyRole()}catch(e){}render()});
   await seed(B);await tour(B,dk+' '+role,mob);await B.context().close()}
 }
 ok(!errs.length,'0 erro de console em todas as telas'+(errs.length?' → '+errs.slice(0,5).join(' | '):''));
 console.log('errors',JSON.stringify(errs.slice(0,10)));await b.close()})().catch(e=>{console.log('FAIL exceção',e.message);process.exit(1)});
