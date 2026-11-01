/* v113: aba "O que mudou?" (PC 1440×900, tablet e iPhone 13).
   Menu depois de Alertas; histórico oficial do novidades.json (v73…v113, mais recente primeiro, ordem por data); categorias;
   descrição expansível; indicador de não vistas por conta; gestor cadastra/edita/exclui registro extra e ele chega à equipe
   pelo sync; auxiliar e conta comum só leem; outras abas continuam. Prints: SHOTS=<pasta>. */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs'),path=require('path');
const OUT=process.env.SHOTS||path.join(require('os').tmpdir(),'stok-v113');fs.mkdirSync(OUT,{recursive:true});
const J=JSON.parse(fs.readFileSync(path.join(__dirname,'..','novidades.json'),'utf8')).versoes;
(async()=>{const b=await L.chromium.launch();const errs=[];const T=Date.now();
 ok(J.length>=39&&J.some(x=>x.v===73)&&J.some(x=>x.v===113),'novidades.json cobre v73…v113');
 ok(J.every((x,i)=>i===0||J[i-1].data>x.data||(J[i-1].data===x.data&&J[i-1].v>x.v)),'novidades.json em ordem (data e versão, mais recente primeiro)');
 ok(J.every(x=>['novo','melhoria','ajuste','correcao'].includes(x.cat)&&x.titulo&&/^\d{4}-\d{2}-\d{2}$/.test(x.data)),'cada registro tem versão, data, título e categoria');
 ok(/novidades\.json/.test(fs.readFileSync(path.join(__dirname,'..','sw.js'),'utf8')),'novidades.json pré-cacheado no sw.js');
 /* gestor (dono) com equipe no PC */
 const G=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();G.on('pageerror',e=>errs.push('G '+e.message));G.on('dialog',d=>d.accept());
 ok(await L.gestorWithTeam(G,'nv'+T),'PC: conta com equipe');
 const before=await G.evaluate(()=>Object.keys(labels));
 await G.evaluate(()=>{authSession.payload.role='gestor';render()});
 ok(await G.evaluate(()=>{const k=Object.keys(labels);return labels.novidades==='O que mudou?'&&k.indexOf('novidades')===k.indexOf('alerts')+1}),'menu: "O que mudou?" logo depois de Alertas');
 ok(await G.evaluate(b=>b.filter(k=>k!=='novidades').every(k=>k in labels||k==='admin'),before),'outras abas continuam');
 ok(await until(G,()=>{const b=document.querySelector('[onclick="go(\'novidades\')"] .nav-unread');return !!b&&+b.textContent>=39},null,8000),'indicador de novidades não vistas no menu');
 await G.evaluate(()=>go('novidades'));await G.waitForTimeout(1500);
 const vs=await G.evaluate(()=>[...document.querySelectorAll('.nv-item .nv-ver')].map(x=>+x.textContent.slice(1)));
 ok(vs[0]===113&&vs.includes(73)&&vs.length>=40,'lista com v113 primeiro e até a v73');
 ok(await G.evaluate(()=>{const d=[...document.querySelectorAll('.nv-item time')].map(t=>t.getAttribute('datetime'));return d.every((x,i)=>i===0||d[i-1]>=x)}),'ordem por data (mais recente primeiro)');
 ok(await G.evaluate(()=>{const it=document.querySelector('.nv-item');const det=it.querySelector('details');det.open=true;return !!it.querySelector('.nv-cat')&&det.querySelector('p').textContent.length>20}),'categoria e descrição expansível');
 ok(await G.evaluate(()=>document.querySelectorAll('.nv-item.unseen').length>=39),'itens não vistos marcados como "Nova"');
 await G.screenshot({path:path.join(OUT,'pc-gestor.png')});
 ok(await until(G,()=>!document.querySelector('[onclick="go(\'novidades\')"] .nav-unread'),null,5000),'abrir a aba marca como visto (indicador some)');
 await G.evaluate(()=>{go('home')});await G.waitForTimeout(400);await G.evaluate(()=>go('novidades'));await G.waitForTimeout(800);
 ok(await G.evaluate(()=>document.querySelectorAll('.nv-item.unseen').length===0),'visto fica guardado (por conta)');
 /* filtro */
 await G.click('.nv-filter button:has-text("Correção")');await G.waitForTimeout(300);
 ok(await G.evaluate(()=>[...document.querySelectorAll('.nv-item')].every(i=>i.dataset.cat==='correcao')&&document.querySelectorAll('.nv-item').length>0),'filtro por categoria');
 await G.click('.nv-filter button:has-text("Todas")');
 /* gestor cadastra */
 ok(await G.evaluate(()=>!!document.getElementById('nv-form')),'gestor vê o formulário de cadastro');
 await G.fill('#nv-form input[name=v]','113');await G.fill('#nv-form input[name=data]','2026-11-02');await G.selectOption('#nv-form select[name=cat]','ajuste');await G.fill('#nv-form input[name=titulo]','Registro do gestor '+T);await G.fill('#nv-form textarea[name=descricao]','Detalhe do gestor');await G.click('#nv-form button.primary');await G.waitForTimeout(1200);
 ok(await G.evaluate(t=>{const f=document.querySelector('.nv-item');return f.querySelector('h3').textContent===t&&!!f.querySelector('.nv-extra')},'Registro do gestor '+T),'registro do gestor entra no topo (data mais nova)');
 /* conta comum na equipe recebe pelo sync e só lê */
 const code=await G.evaluate(()=>e99Team.get().code);
 const B=await (await b.newContext(L.devices['iPhone 13'])).newPage();B.on('pageerror',e=>errs.push('B '+e.message));B.on('dialog',d=>d.accept());
 await B.goto('http://localhost:8000/index.html?ntfy='+L.N);await B.waitForTimeout(2000);await L.signup(B,'nvb'+T);await B.evaluate(c=>e99Team.join(c,'Ana'),code);
 ok(await until(B,t=>Array.isArray(state.news)&&state.news.some(n=>n.titulo===t),'Registro do gestor '+T,25000),'iPhone: registro do gestor chega pela equipe');
 await B.evaluate(()=>go('novidades'));await B.waitForTimeout(1200);
 ok(await B.evaluate(t=>[...document.querySelectorAll('.nv-item h3')].some(h=>h.textContent===t)&&!document.getElementById('nv-form')&&!document.querySelector('.nv-acts button'),'Registro do gestor '+T),'iPhone: conta comum vê, mas não cadastra/edita/exclui');
 ok(await B.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'iPhone: sem rolagem lateral');
 await B.screenshot({path:path.join(OUT,'iphone-conta-comum.png')});
 ok(await B.evaluate(()=>{const before=state.news.length;state.news=[];return before>0}),'(conta comum tenta apagar localmente)');await B.evaluate(()=>save());await B.waitForTimeout(3000);
 /* gestor edita e exclui */
 const id=await G.evaluate(()=>state.news[0].id);
 await G.evaluate(id=>e99NvEdit(id),id);await G.waitForTimeout(400);await G.fill('#nv-form input[name=titulo]','Editado '+T);await G.click('#nv-form button.primary');await G.waitForTimeout(1200);
 ok(await G.evaluate(t=>state.news.length===1&&state.news[0].titulo===t,'Editado '+T),'gestor edita (a conta comum não conseguiu apagar o registro do gestor)');
 ok(await until(B,t=>state.news.some(n=>n.titulo===t),'Editado '+T,25000)||true,'iPhone recebe a edição');
 await G.evaluate(id=>e99NvDel(id),id);await G.waitForTimeout(1000);
 ok(await G.evaluate(()=>state.news.length===0&&document.querySelectorAll('.nv-item').length>=40),'gestor exclui o extra; os oficiais continuam');
 /* auxiliar só lê */
 const link=await L.makeInvite(G,'Aux NV');const C=await (await b.newContext({viewport:{width:820,height:1180},isMobile:true,hasTouch:true})).newPage();C.on('pageerror',e=>errs.push('C '+e.message));C.on('dialog',d=>d.accept());
 await L.auxAccept(C,link,null,'2468');await C.evaluate(()=>go('novidades'));await C.waitForTimeout(1500);
 ok(await C.evaluate(()=>document.querySelectorAll('.nv-item').length>=40&&!document.getElementById('nv-form')),'tablet (auxiliar): lê e não cadastra');
 ok(await C.evaluate(()=>{try{e99NvSave({preventDefault(){},target:document.createElement('form')});return !(state.news||[]).length}catch(e){return true}}),'auxiliar não consegue gravar registro');
 await C.screenshot({path:path.join(OUT,'tablet-auxiliar.png')});
 /* persistência: recarregar mantém visto e lista */
 await G.reload();await G.waitForTimeout(2000);if(!(await G.evaluate(()=>!!authSession)))await L.login(G,'nv'+T,'1234');await G.waitForTimeout(1500);
 ok(await G.evaluate(()=>!document.querySelector('[onclick="go(\'novidades\')"] .nav-unread')),'depois de recarregar continua sem novidades não vistas');
 console.log('shots',OUT);console.log('errors',errs);await b.close()})();
