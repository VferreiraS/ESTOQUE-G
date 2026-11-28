/* v157: botão "‹ Voltar" nas telas de segundo nível + voltar do sistema/gesto (history.pushState/popstate).
   PC 1440×900 gestor + iPhone 13 auxiliar em modo "app da tela inicial" (standalone simulado), pela nuvem do emulador. */
const L=require('./lib.js');const {ok,until}=L;
const STAND=()=>{try{Object.defineProperty(navigator,'standalone',{get:()=>true});const mm=window.matchMedia.bind(window);
  window.matchMedia=q=>/display-mode:\s*standalone/.test(q)?{matches:true,media:q,onchange:null,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){},dispatchEvent(){return false}}:mm(q)}catch(e){}};
const BAR=()=>{const b=document.querySelector('#e99-backbar .e99-back');if(!b)return null;const r=b.getBoundingClientRect();
  return {h:r.height,w:r.width,top:r.top,lbl:b.getAttribute('aria-label')||'',txt:b.textContent.trim(),v175:b.classList.contains('e99-voltar')&&!!b.querySelector('svg.e99-voltar-ic'),vis:r.width>0&&r.height>0&&getComputedStyle(b).visibility!=='hidden'}};
const HS=()=>document.documentElement.scrollWidth>innerWidth+1;
async function back(p){await p.evaluate(()=>history.back());await p.waitForTimeout(450)}
async function suite(p,who,pages){
 /* (A) cada tela de segundo nível: Voltar visível, 44 px, rótulo, e volta para a origem (Início) */
 for(const pg of pages){await p.evaluate(()=>go('home'));await p.waitForTimeout(150);await p.evaluate(x=>go(x),pg);await p.waitForTimeout(350);
  const b=await p.evaluate(BAR),cur=await p.evaluate(()=>page);
  ok(b&&b.vis&&b.h>=43.5&&/^Voltar para Início$/.test(b.lbl)&&(b.v175?b.txt.length>0:/Voltar/.test(b.txt)&&/‹/.test(b.txt))/* v175: chevron SVG + nome da tela anterior */,who+': '+pg+' tem "‹ Voltar" ('+(b?Math.round(b.h)+'px, '+b.lbl:'sem botão')+')'+(cur!==pg?' [abriu '+cur+']':''));
  ok(!(await p.evaluate(HS)),who+': '+pg+' sem rolagem lateral');
  if(b){await p.click('#e99-backbar .e99-back');await p.waitForTimeout(350);ok(await p.evaluate(()=>page==='home'),who+': Voltar em '+pg+' volta ao Início')}}
 /* raiz sem botão */
 for(const pg of ['home','nfs','plans','chat','mobile-menu']){await p.evaluate(x=>go(x),pg);await p.waitForTimeout(250);ok(!(await p.evaluate(BAR)),who+': raiz '+pg+' sem Voltar')}
 /* (B) pilha: Início → Equipe → pessoa → Voltar (Equipe) → Voltar (Início) */
 await p.evaluate(()=>{go('home');go('team')});await p.waitForTimeout(250);await p.evaluate(()=>e99Pessoa('me'));await p.waitForTimeout(400);
 {const lb=await p.evaluate(()=>page+' · '+(document.querySelector('#e99-backbar .e99-back')||{getAttribute(){return ''}}).getAttribute('aria-label'));ok(lb==='pessoa · Voltar para Equipe',who+': perfil aberto da Equipe mostra "Voltar para Equipe" ('+lb+')')}
 await p.click('#e99-backbar .e99-back');await p.waitForTimeout(350);ok(await p.evaluate(()=>page==='team'),who+': Voltar do perfil → Equipe');
 await p.click('#e99-backbar .e99-back');await p.waitForTimeout(350);ok(await p.evaluate(()=>page==='home'),who+': Voltar da Equipe → Início');
 /* (C) voltar do sistema: tela */
 await p.evaluate(()=>{go('home');go('account')});await p.waitForTimeout(300);ok(await p.evaluate(()=>e99Nav.armed()),who+': guarda no histórico armada');
 const url0=await p.evaluate(()=>location.href);
 await back(p);ok(await p.evaluate(()=>page==='home'),who+': history.back() volta da Minha conta ao Início');
 ok(await p.evaluate(u=>location.href===u,url0),who+': endereço não muda');
 /* janela aberta: history.back() fecha a janela e fica na tela */
 await p.evaluate(()=>go('plans'));await p.waitForTimeout(300);await p.evaluate(()=>copyPlan('p1'));await p.waitForTimeout(400);
 ok(await p.evaluate(()=>{const d=document.getElementById('e99-msg');return !!d&&d.open}),who+': folha de compartilhar aberta');
 await back(p);ok(await p.evaluate(()=>{const d=document.getElementById('e99-msg');return !d.open&&page==='plans'}),who+': history.back() fecha a folha e fica no Plano');
 /* busca (dialog) */
 await p.evaluate(()=>{const b=document.querySelector('[aria-label*="Busca"],[aria-label*="Buscar"]');b&&b.click()});await p.waitForTimeout(400);
 if(await p.evaluate(()=>{const d=document.getElementById('e99-search');return !!d&&d.open})){await back(p);ok(await p.evaluate(()=>!document.getElementById('e99-search').open),who+': history.back() fecha a busca')}
 /* editor do plano */
 await p.evaluate(()=>openPlan(isAux()?undefined:'p1'));await p.waitForTimeout(400);const eb=await p.evaluate(BAR);
 ok(eb&&eb.h>=44&&/Plano de ação/.test(eb.lbl),who+': editor do plano tem Voltar');
 await back(p);ok(await p.evaluate(()=>!planDraft&&page==='plans'),who+': history.back() fecha o editor do plano');
 /* menu lateral do celular */
 await p.evaluate(()=>{go('home');go('nfs');document.body.classList.add('menu')});await back(p);ok(await p.evaluate(()=>!document.body.classList.contains('menu')&&page==='nfs'),who+': history.back() fecha o menu');
 await back(p);ok(await p.evaluate(()=>page==='home'),who+': history.back() de Notas → Início');
 /* (D) Início: não sai do app, não prende (próximo voltar fica livre) */
 await p.evaluate(()=>go('home'));await p.waitForTimeout(200);await p.evaluate(()=>{if(!e99Nav.armed())history.pushState({e99g:1},'')});
 await back(p);ok(await p.evaluate(u=>location.href===u&&page==='home'&&!!authSession&&e99Nav.resting()&&!e99Nav.armed(),url0),who+': no Início o voltar não sai do app e não rearma (sem laço)');
 await p.evaluate(()=>go('team'));await p.waitForTimeout(200);ok(await p.evaluate(()=>e99Nav.armed()&&!e99Nav.resting()),who+': ao navegar de novo a guarda volta');
 await p.evaluate(()=>go('home'))}
(async()=>{const b=await L.chromium.launch();const T=Date.now();const errs=[];
 const hook=(p,n)=>{p.on('pageerror',e=>errs.push(n+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|favicon/i.test(m.text()))errs.push(n+' console '+m.text())});p.on('dialog',d=>d.accept())};
 const cA=await b.newContext({viewport:{width:1440,height:900}});const A=await cA.newPage();hook(A,'PC');
 ok(await L.gestorWithTeam(A,'vb'+T),'PC: gestor com equipe');
 const link=await L.makeInvite(A,'Bia','');
 const cB=await b.newContext(L.devices['iPhone 13']);await cB.addInitScript(STAND);const B=await cB.newPage();hook(B,'iPhone');
 await L.auxAccept(B,link,'','Senha1234x');
 ok(await until(B,()=>typeof authSession!=='undefined'&&!!authSession&&!!window.e99Nav&&syncStatus().ready,null,40000),'iPhone: auxiliar entrou (standalone '+await B.evaluate(()=>navigator.standalone)+')');
 ok(await until(B,()=>(state.plans||[]).some(p=>p.id==='p1'),null,30000),'iPhone: recebeu o plano');
 /* rotas antigas continuam */
 await A.evaluate(()=>go('agenda'));await A.waitForTimeout(250);ok(await A.evaluate(()=>page==='plans'),'PC: rota antiga (GONE agenda → plans) continua');
 await suite(A,'PC',['team','corridors','data','alerts','account','admin','profile','reports']);
 /* Esc no PC fecha a janela (Relatório da semana) */
 await A.evaluate(()=>e99Week.open());await A.waitForTimeout(400);await A.keyboard.press('Escape');await A.waitForTimeout(300);
 ok(await A.evaluate(()=>!document.getElementById('wk-dlg').open),'PC: Esc fecha o Relatório da semana');
 await A.evaluate(()=>e99Week.open());await A.waitForTimeout(400);await back(A);ok(await A.evaluate(()=>!document.getElementById('wk-dlg').open),'PC: history.back() fecha o Relatório da semana');
 await B.evaluate(()=>go('home'));
 await suite(B,'iPhone',['team','account','profile','reports']);
 /* auxiliar: tela proibida continua redirecionando ao Início */
 await B.evaluate(()=>go('admin'));await B.waitForTimeout(300);ok(await B.evaluate(()=>page==='home'&&!document.getElementById('e99-backbar')),'iPhone: auxiliar não abre Administração (vai ao Início, sem Voltar)');
 /* visual: o botão usa as cores do tema (não transparente), S do logo intacto */
 await B.evaluate(()=>{go('home');go('team')});await B.waitForTimeout(300);
 ok(await B.evaluate(()=>{const s=getComputedStyle(document.querySelector('.e99-back'));return s.borderRadius!=='0px'&&s.cursor==='pointer'}),'iPhone: estilo do botão Voltar');
 await B.screenshot({path:require('os').tmpdir()+'/v157-iphone-team.png'});
 ok(!errs.length,'0 erro de console'+(errs.length?': '+errs.join(' | '):''));
 await b.close();console.log('fim')})().catch(e=>{console.log('FAIL erro',e);process.exit(1)});
