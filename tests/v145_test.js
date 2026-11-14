/* v145: lista de notas compacta no celular (linha que abre e fecha). iPhone 13 gestor + iPhone 13 auxiliar + PC 1440×900 gestor.
   Confere: linha fechada ≤130 px, ≥5 notas na 1ª tela com 8 notas, tocar abre os 3 status + Abrir/Excluir, só uma aberta, teclado,
   mudar status pela linha aberta, auxiliar sem Excluir e sem volumes, busca/filtros/"Mostrar mais", busca geral abre a nota,
   sem rolagem lateral, toques ≥44 px, contraste AA nos 3 temas, PC com a tabela de antes e 0 erro de console. Prints com SHOTS=pasta. */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs');
const U='http://localhost:8000/index.html?ntfy='+L.N;const SH=process.env.SHOTS||'';
(async()=>{const b=await L.chromium.launch();const errs=[];
 async function dev(nome,opts){const c=await b.newContext(opts);const P=await c.newPage();
  P.on('pageerror',e=>errs.push(nome+' '+e.message));P.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|ERR_CONNECTION|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(nome+' console: '+m.text())});P.on('dialog',d=>d.accept(d.type()==='prompt'?'Faltou 1 caixa':undefined));return P}
 const seed=(P,n)=>P.evaluate(async(n)=>{const d=k=>{const x=new Date();x.setDate(x.getDate()-k);return x.toISOString().slice(0,10)};const ST=['Pendente','Em conferência','Conferido','Em divergência'];
   const SUP=['Laticínios Serra Azul Ltda','Distribuidora Paulista de Bebidas e Alimentos do Brasil S.A.','Atacadão Central','Frios Bom Sabor','Higiene & Cia Comércio de Produtos de Limpeza Ltda','Doces Mineiros','Hortifruti Vale Verde','Padaria Trigo de Ouro'];
   state.team=[{id:'ana',name:'Ana Souza',role:'Repositora'}];state.nfs=[];
   for(let i=0;i<n;i++)state.nfs.push({id:'n'+(i+1),number:String(843114+i),supplier:i<8?SUP[i]:'Fornecedor '+(i+1),date:d(i),arrivalTime:i%2?'08:30':'',status:ST[i%4],owner:i%3===0?'ana':'',notes:i%4===3?'Importada de print em 11/11/2026. Faltaram 2 caixas de leite e 1 caixa veio amassada.':(i===0?'Conferir validade':''),volumes:3+i,
     items:i===2?[{code:'1',description:'Leite',quantity:'10',received:'10'},{code:'2',description:'Queijo',quantity:'5',received:'4'},{code:'3',description:'Manteiga',quantity:'2'}]:[]});
   await save();nfStatusFilter='';nfQuery='';go('nfs');scrollTo(0,0)},n);
 const rowsInfo=(P)=>P.evaluate(()=>{const rs=[...document.querySelectorAll('#nf-results tr[data-nf]')].filter(r=>r.getClientRects().length);const hs=rs.map(r=>r.getBoundingClientRect());const bar=document.getElementById('mobile-bottom');const bottom=bar&&bar.getClientRects().length?bar.getBoundingClientRect().top:innerHeight;
   return {n:rs.length,max:Math.max(...hs.map(r=>r.height)),min:Math.min(...hs.map(r=>r.height)),fit:Math.floor(bottom/(hs[1].top-hs[0].top)),open:rs.filter(r=>r.classList.contains('nf-x')).length,exp:rs.filter(r=>r.querySelector('.nf-sum').getAttribute('aria-expanded')==='true').length}});
 const vis=`(el)=>{if(!el)return false;const s=getComputedStyle(el);const r=el.getBoundingClientRect();return s.display!=='none'&&s.visibility!=='hidden'&&r.width>0&&r.height>0}`;

 /* ================= iPhone 13 · gestor ================= */
 {const P=await dev('iPhone-gestor',L.devices['iPhone 13']);await P.goto(U);await P.waitForTimeout(2500);await L.signup(P,'vferreiras','Lojas G');
  await P.evaluate(()=>{if(authSession.payload.role!=='gestor'){authSession.payload.role='gestor';try{applyRole()}catch(e){}}render()});await P.addStyleTag({content:'#alert-popup,#toast{display:none!important}'});
  await seed(P,8);await P.waitForTimeout(500);
  const i0=await rowsInfo(P);
  ok(i0.n===8&&i0.max<=130,'iPhone: cada linha fechada tem ≤130 px (maior '+Math.round(i0.max)+' px, menor '+Math.round(i0.min)+' px)');
  ok(i0.fit>=5,'iPhone: cabem '+i0.fit+' notas na altura de uma tela (≥5)');
  /* 1ª tela de verdade: rola até a lista encostar no topo e conta as linhas inteiras visíveis */
  const seen=await P.evaluate(()=>{const hd=document.querySelector('header');const first=document.querySelector('#nf-results tr[data-nf]');scrollTo(0,0);const top0=first.getBoundingClientRect().top+scrollY;const hh=getComputedStyle(hd).position==='sticky'||getComputedStyle(hd).position==='fixed'?hd.getBoundingClientRect().height:0;scrollTo(0,top0-hh-8);
    const bar=document.getElementById('mobile-bottom');const bottom=bar&&bar.getClientRects().length?bar.getBoundingClientRect().top:innerHeight;return [...document.querySelectorAll('#nf-results tr[data-nf]')].filter(r=>{const x=r.getBoundingClientRect();return x.top>=hh-1&&x.bottom<=bottom+1}).length});
  ok(seen>=5,'iPhone: '+seen+' notas inteiras visíveis de uma vez (≥5)');
  if(SH){fs.mkdirSync(SH,{recursive:true});await P.screenshot({path:SH+'/iphone13-lista-fechada.png'})}
  await P.evaluate(()=>scrollTo(0,0));
  ok(await P.evaluate(()=>{const b=document.querySelector('#nf-results tr[data-nf="n4"] .nf-sum');const t=b.innerText;return /NF 843117/.test(t)&&/Em divergência/.test(t)&&/Frios Bom Sabor/.test(t)&&/\d\d\/\d\d\/\d{4}/.test(t)&&/6 vol\./.test(t)&&/Sem XML/.test(t)&&/Ana Souza/.test(t)&&!/A definir/.test(document.querySelector('#nf-results tr[data-nf="n2"] .nf-sum').innerText)&&/1 dif\./.test(document.querySelector('#nf-results tr[data-nf="n3"] .nf-sum').innerText)}),'iPhone: linha mostra número, status em texto, fornecedor, chegada dd/mm/aaaa, volumes, conferência e responsável (só se definido)');
  ok(await P.evaluate(()=>{const s=document.querySelector('#nf-results tr[data-nf="n2"] .nf-s2');return getComputedStyle(s).whiteSpace==='nowrap'&&getComputedStyle(s).textOverflow==='ellipsis'&&s.scrollWidth>s.clientWidth}),'iPhone: fornecedor comprido fica em 1 linha com reticências');
  ok(await P.evaluate(`(()=>{const vis=${vis};return ![...document.querySelectorAll('#nf-results .nf-quick button,#nf-results .nf-open,#nf-results .e99-del')].some(vis)})()`),'iPhone: fechada não mostra botões de status, Abrir nem Excluir');
  /* tocar abre */
  await P.tap('#nf-results tr[data-nf="n4"] .nf-sum');await P.waitForTimeout(200);
  ok(await P.evaluate(`(()=>{const vis=${vis};const tr=document.querySelector('#nf-results tr[data-nf="n4"]');const q=[...tr.querySelectorAll('.nf-quick button')];return tr.classList.contains('nf-x')&&tr.querySelector('.nf-sum').getAttribute('aria-expanded')==='true'&&q.length===3&&q.every(vis)&&q.map(x=>x.textContent).join('|')==='Em conferência|Conferido|Em divergência'&&vis(tr.querySelector('.nf-open'))&&vis(tr.querySelector('.e99-del'))&&/Faltaram 2 caixas de leite e 1 caixa veio amassada/.test(tr.querySelector('td:nth-child(4)').innerText)&&vis(tr.querySelector('td:nth-child(4)'))})()`),'iPhone: tocar abre a nota com o texto completo da divergência, os 3 status, Abrir e Excluir');
  ok(await P.evaluate(()=>{const tr=document.querySelector('#nf-results tr[data-nf="n4"]');return [...tr.querySelectorAll('button')].filter(b=>b.getClientRects().length).every(b=>{const r=b.getBoundingClientRect();return r.height>=43.5&&r.width>=43.5})&&[...tr.querySelectorAll('.nf-quick button')].every(b=>b.scrollWidth<=b.clientWidth+1)}),'iPhone: toques da nota aberta ≥44 px e textos dos status inteiros');
  if(SH)await P.screenshot({path:SH+'/iphone13-nota-aberta.png'});
  await P.tap('#nf-results tr[data-nf="n2"] .nf-sum');await P.waitForTimeout(200);
  let i1=await rowsInfo(P);ok(i1.open===1&&i1.exp===1&&await P.evaluate(()=>document.querySelector('#nf-results tr[data-nf="n2"]').classList.contains('nf-x')),'iPhone: só uma nota aberta por vez');
  await P.tap('#nf-results tr[data-nf="n2"] .nf-sum');await P.waitForTimeout(200);i1=await rowsInfo(P);ok(i1.open===0&&i1.exp===0&&i1.max<=130,'iPhone: tocar de novo fecha');
  /* teclado */
  await P.focus('#nf-results tr[data-nf="n1"] .nf-sum');await P.keyboard.press('Enter');await P.waitForTimeout(150);
  ok(await P.evaluate(()=>document.querySelector('#nf-results tr[data-nf="n1"] .nf-sum').getAttribute('aria-expanded')==='true'&&document.activeElement.classList.contains('nf-sum')),'iPhone: Enter no teclado abre a linha (botão com aria-expanded)');
  /* mudar status pela linha aberta */
  await P.evaluate(()=>{[...document.querySelectorAll('#nf-results tr[data-nf="n1"] .nf-quick button')].find(b=>b.textContent==='Conferido').click()});
  ok(await until(P,()=>state.nfs.find(n=>n.id==='n1').status==='Conferido'&&/Conferido/.test(document.querySelector('#nf-results tr[data-nf="n1"] .nf-sum .badge').textContent)&&document.querySelector('#nf-results tr[data-nf="n1"]').classList.contains('nf-x')&&document.querySelector('#nf-results tr[data-nf="n1"] .nf-quick button[aria-pressed="true"]').textContent==='Conferido'),'iPhone: muda o status pela linha aberta (etiqueta atualiza e a nota continua aberta)');
  await P.evaluate(()=>{[...document.querySelectorAll('#nf-results tr[data-nf="n1"] .nf-quick button')].find(b=>b.textContent==='Em divergência').click()});
  ok(await until(P,()=>{const n=state.nfs.find(n=>n.id==='n1');return n.status==='Em divergência'&&n.notes==='Faltou 1 caixa'}),'iPhone: "Em divergência" pede a descrição como antes');
  /* Abrir e Excluir */
  await P.evaluate(()=>document.querySelector('#nf-results tr[data-nf="n1"] .nf-open').click());await P.waitForTimeout(400);
  ok(await P.evaluate(()=>document.getElementById('modal').open&&document.getElementById('editor').elements.namedItem('number').value==='843114'),'iPhone: Abrir abre o editor da nota');
  await P.evaluate(()=>document.getElementById('modal').close());
  await P.evaluate(()=>document.querySelector('#nf-results tr[data-nf="n1"] .e99-del').click());
  ok(await until(P,()=>!state.nfs.some(n=>n.id==='n1')&&!document.querySelector('#nf-results tr[data-nf="n1"]')&&document.querySelectorAll('#nf-results tr[data-nf]').length===7),'iPhone: Excluir (com confirmação) tira a nota');
  /* filtros e busca */
  await P.evaluate(()=>{[...document.querySelectorAll('#nf-tabs button')].find(b=>/^Conferidas/.test(b.textContent)).click()});await P.waitForTimeout(250);
  ok(await P.evaluate(()=>{const r=[...document.querySelectorAll('#nf-results tr[data-nf]')];return r.length===2&&r.every(x=>/Conferido/.test(x.querySelector('.nf-sum .badge').textContent))}),'iPhone: filtro por status continua');
  await P.evaluate(()=>{[...document.querySelectorAll('#nf-tabs button')].find(b=>/^Todas/.test(b.textContent)).click()});await P.waitForTimeout(250);
  await P.fill('#view input[name=nf-busca]','hortifruti');await P.waitForTimeout(500);
  ok(await P.evaluate(()=>{const r=[...document.querySelectorAll('#nf-results tr[data-nf]')].filter(x=>x.getClientRects().length);return r.length===1&&/Hortifruti/.test(r[0].innerText)}),'iPhone: busca continua');
  await P.fill('#view input[name=nf-busca]','');await P.waitForTimeout(500);
  /* busca geral abre a nota */
  await P.evaluate(()=>{e99Search.open();const i=document.getElementById('e99-sx-q');i.value='843120';i.dispatchEvent(new Event('input',{bubbles:true}))});await P.waitForTimeout(400);
  await P.evaluate(()=>document.querySelector('#e99-sx-res .sx-it[data-k="nf"]').click());await P.waitForTimeout(600);
  ok(await P.evaluate(()=>document.getElementById('modal').open&&document.querySelector('#nf-results tr[data-nf="n7"]').classList.contains('nf-x')),'iPhone: busca geral abre o editor e deixa a nota aberta na lista');
  await P.evaluate(()=>document.getElementById('modal').close());await P.waitForTimeout(300);
  ok(await P.evaluate(()=>{const r=document.querySelector('#nf-results tr[data-nf="n7"]').getBoundingClientRect();return r.top>=0&&r.top<innerHeight}),'iPhone: a nota da busca geral fica à vista');
  /* sem rolagem lateral, toques, contraste nos 3 temas */
  ok(await P.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'iPhone: sem rolagem lateral');
  ok(await P.evaluate(()=>[...document.querySelectorAll('#nf-results button')].filter(b=>b.getClientRects().length).every(b=>{const r=b.getBoundingClientRect();return r.height>=43.5&&r.width>=43.5})),'iPhone: toques da lista ≥44 px');
  const bad=[];for(const th of ['lilas','violeta','cinza']){await P.evaluate(t=>e99Theme.set(t),th);await P.waitForTimeout(200);
   const r=await P.evaluate(()=>{const parse=c=>{const m=c.match(/rgba?\(([^)]+)\)/);const p=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}};const lum=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b)};
     const bgOf=el=>{const st=[];for(let e=el;e&&e.nodeType===1;e=e.parentElement){const c=parse(getComputedStyle(e).backgroundColor);if(c&&c.a>0){st.push(c);if(c.a>=1)break}}let base=parse(getComputedStyle(document.documentElement).backgroundColor);if(!base||base.a===0)base={r:0,g:0,b:0,a:1};for(let i=st.length-1;i>=0;i--){const c=st[i];base=c.a>=1?c:{r:c.r*c.a+base.r*(1-c.a),g:c.g*c.a+base.g*(1-c.a),b:c.b*c.a+base.b*(1-c.a),a:1}}return base};
     const ratio=el=>{let f=parse(getComputedStyle(el).color),bg=bgOf(el);if(f.a<1)f={r:f.r*f.a+bg.r*(1-f.a),g:f.g*f.a+bg.g*(1-f.a),b:f.b*f.a+bg.b*(1-f.a)};const a=lum(f),b=lum(bg);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)};
     const out=[];document.querySelectorAll('#nf-results .nf-s1 b,#nf-results .nf-s2,#nf-results .nf-s3,#nf-results .nf-sum .badge').forEach(el=>{const x=ratio(el);if(x<4.5)out.push(el.className+' '+el.textContent.slice(0,14)+' '+x.toFixed(2))});return [...new Set(out)]});
   r.forEach(x=>bad.push(th+': '+x));if(SH&&th!=='lilas')await P.screenshot({path:SH+'/iphone13-lista-'+th+'.png'})}
  await P.evaluate(()=>e99Theme.set('lilas'));
  ok(!bad.length,'iPhone: contraste AA dos textos da linha e das etiquetas nos 3 temas'+(bad.length?' → '+bad.slice(0,5).join(' | '):''));
  ok(await P.evaluate(()=>{const b=document.querySelector('#nf-results .nf-sum');const s=getComputedStyle(b);return (s.transitionDuration==='0s'||s.transitionProperty==='none')&&(s.animationName==='none')}),'iPhone: abrir/fechar sem animação');
  /* Mostrar mais: 60 notas */
  await seed(P,60);await P.waitForTimeout(500);
  ok(await P.evaluate(()=>document.querySelectorAll('#nf-results tr[data-nf]').length===50&&!!document.querySelector('#nf-results .more-row button')),'iPhone: 50 por vez');
  await P.evaluate(()=>document.querySelector('#nf-results tr[data-nf="n3"] .nf-sum').click());await P.evaluate(()=>document.querySelector('#nf-results .more-row button').click());await P.waitForTimeout(400);
  ok(await P.evaluate(()=>document.querySelectorAll('#nf-results tr[data-nf]').length===60&&document.querySelectorAll('#nf-results tr.nf-x').length===1&&document.querySelector('#nf-results tr[data-nf="n3"]').classList.contains('nf-x')),'iPhone: "Mostrar mais" traz o resto e mantém a nota aberta');
  /* lista vazia */
  await P.evaluate(async()=>{state.nfs=[];await save();go('nfs')});await P.waitForTimeout(300);
  ok(await P.evaluate(()=>/Nenhuma nota fiscal ainda/.test(document.getElementById('nf-results').innerText)),'iPhone: lista vazia como antes');
  await P.context().close()}

 /* ================= iPhone 13 · auxiliar ================= */
 {const P=await dev('iPhone-aux',L.devices['iPhone 13']);await P.goto(U);await P.waitForTimeout(2500);await L.signup(P,'aux'+Date.now().toString(36));await P.waitForTimeout(600);await P.addStyleTag({content:'#alert-popup,#toast{display:none!important}'});
  await seed(P,8);await P.evaluate(()=>{state.nfs[1].clogin=authSession.record.login;authSession.payload.role='auxiliar';try{applyRole()}catch(e){}go('home');go('nfs');scrollTo(0,0)});await P.waitForTimeout(500);
  const i0=await rowsInfo(P);ok(await P.evaluate(()=>isAux())&&i0.n===8&&i0.max<=130&&i0.fit>=5,'auxiliar: linhas compactas (maior '+Math.round(i0.max)+' px, '+i0.fit+' por tela)');
  ok(await P.evaluate(()=>!document.querySelector('#nf-results .nf-vol')&&!/\bvol\./.test(document.getElementById('nf-results').innerText)),'auxiliar: linha sem volumes');
  await P.tap('#nf-results tr[data-nf="n4"] .nf-sum');await P.waitForTimeout(250);
  ok(await P.evaluate(`(()=>{const vis=${vis};const tr=document.querySelector('#nf-results tr[data-nf="n4"]');return tr.classList.contains('nf-x')&&[...tr.querySelectorAll('.nf-quick button')].every(vis)&&vis(tr.querySelector('.nf-open'))&&!document.querySelector('#nf-results .e99-del')&&!vis(tr.querySelector('td:nth-child(3)'))&&!/Volumes/.test(tr.innerText)})()`),'auxiliar: nota aberta com status e Abrir, sem Excluir e sem volumes');
  await P.evaluate(()=>document.querySelector('#nf-results tr[data-nf="n4"] .nf-open').click());await P.waitForTimeout(400);
  ok(await P.evaluate(()=>!document.getElementById('modal').open),'auxiliar: não abre o editor de nota de outra pessoa');
  await P.evaluate(()=>{nfToggle('n2',true);document.querySelector('#nf-results tr[data-nf="n2"] .nf-open').click()});await P.waitForTimeout(400);
  ok(await P.evaluate(()=>document.getElementById('modal').open),'auxiliar: abre o editor da nota que criou');
  await P.evaluate(()=>document.getElementById('modal').close());
  /* busca geral em nota de outra pessoa: lista filtrada e nota aberta */
  await P.evaluate(()=>{e99Search.open();const i=document.getElementById('e99-sx-q');i.value='843119';i.dispatchEvent(new Event('input',{bubbles:true}))});await P.waitForTimeout(400);
  await P.evaluate(()=>document.querySelector('#e99-sx-res .sx-it[data-k="nf"]').click());await P.waitForTimeout(600);
  ok(await P.evaluate(()=>{const r=[...document.querySelectorAll('#nf-results tr[data-nf]')];return !document.getElementById('modal').open&&r.length===1&&r[0].getAttribute('data-nf')==='n6'&&r[0].classList.contains('nf-x')}),'auxiliar: busca geral filtra a lista e abre a linha da nota');
  ok(await P.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'auxiliar: sem rolagem lateral');
  await P.context().close()}

 /* ================= PC 1440×900 · gestor ================= */
 {const P=await dev('PC-gestor',{viewport:{width:1440,height:900}});await P.goto(U);await P.waitForTimeout(2500);await L.signup(P,'vferreiras','Lojas G');
  await P.evaluate(()=>{if(authSession.payload.role!=='gestor'){authSession.payload.role='gestor';try{applyRole()}catch(e){}}render()});await P.addStyleTag({content:'#alert-popup,#toast{display:none!important}'});
  await seed(P,8);await P.waitForTimeout(500);
  ok(await P.evaluate(`(()=>{const vis=${vis};const tr=document.querySelector('#nf-results tr[data-nf="n4"]');const tds=[...tr.children];return getComputedStyle(tr).display==='table-row'&&tds.length===6&&tds.every(vis)&&![...document.querySelectorAll('#nf-results .nf-sum')].some(vis)&&vis(tr.querySelector('.nf-pc b'))&&[...tr.querySelectorAll('.nf-quick button')].every(vis)&&vis(tr.querySelector('.nf-open'))&&vis(tr.querySelector('.e99-del'))&&[...document.querySelectorAll('#nf-results thead th')].map(x=>x.textContent).join('|')==='Nota / fornecedor|Chegada|Volumes|Conferência|Status|Ações'})()`),'PC: tabela igual (6 colunas, ações na linha, sem a linha compacta)');
  ok(await P.evaluate(()=>{const tr=document.querySelector('#nf-results tr[data-nf="n4"]');const h=tr.getBoundingClientRect().height;nfToggle('n4');const h2=tr.getBoundingClientRect().height;nfToggle('n4');return Math.abs(h-h2)<1}),'PC: abrir/fechar não muda a tabela');
  await P.evaluate(()=>{[...document.querySelectorAll('#nf-results tr[data-nf="n2"] .nf-quick button')].find(b=>b.textContent==='Conferido').click()});
  ok(await until(P,()=>state.nfs.find(n=>n.id==='n2').status==='Conferido'),'PC: status pela linha continua');
  await P.fill('#view input[name=nf-busca]','hortifruti');await P.waitForTimeout(500);
  ok(await P.evaluate(()=>[...document.querySelectorAll('#nf-results tr[data-nf]')].filter(x=>x.getClientRects().length).length===1),'PC: busca continua');
  ok(await P.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'PC: sem rolagem lateral');
  if(SH)await P.screenshot({path:SH+'/pc-lista.png'});
  await P.context().close()}
 ok(!errs.length,'0 erro de console'+(errs.length?' → '+errs.slice(0,4).join(' | '):''));
 await b.close()})();
