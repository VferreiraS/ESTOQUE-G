/* v159: logo novo (opção 1, "Prateleira", escolhido pelo dono; exceção dele à regra "preservar o S", só para o logo).
   iPhone 13 (CPU 4x) e PC 1440×900: nenhum recurso 404; ícones do manifest existem, são PNG do tamanho certo e estão no
   pré-cache do sw.js; <link> do favicon/apple-touch com o nome novo; logo do menu e da tela de entrar = forma nova
   (v123 pinta nas cores do tema); abertura monta o S do logo novo, termina (≤2,8 s) e mostra "Entrar"; banner PNG e folha
   impressa usam icons/icon-512-v159.png; tema do mês e favicon piscando (v154) com o logo novo; 0 erro de console.
   Prints 2x em docs/prints/v159/ (fora do git). */
const L=require('./lib.js');const {ok,until}=L;const fs=require('fs');const PORT=process.env.PORT||8000;
const BASE='http://localhost:'+PORT+'/';const OUT='docs/prints/v159/';fs.mkdirSync(OUT,{recursive:true});
const NEW='M22 14h56v12H22z';
(async()=>{const b=await L.chromium.launch();const errs=[];
 /* manifest e pré-cache (lado do servidor) */
 const man=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8')),sw=fs.readFileSync('sw.js','utf8'),html=fs.readFileSync('index.html','utf8');
 ok(man.icons.length>=3&&man.icons.every(i=>/-v159\.png$/.test(i.src)&&fs.existsSync(i.src)),'manifest: ícones -v159 existem ('+man.icons.map(i=>i.src).join(', ')+')');
 ok(man.icons.every(i=>sw.includes("'./"+i.src+"'")),'manifest: todos os ícones estão no pré-cache do sw.js');
 for(const f of ['apple-touch','favicon'])ok(sw.includes("'./icons/"+f+"-v159.png'")&&html.includes('icons/'+f+'-v159.png'),f+'-v159.png no <link> e no pré-cache');
 ok(!/icons\/[a-z-]+-v123\.png/.test(html+sw+fs.readFileSync('manifest.webmanifest','utf8')+fs.readdirSync('app/js').map(f=>fs.readFileSync('app/js/'+f,'utf8')).join('')),'nenhum uso dos ícones antigos -v123 no app');
 for(const [nome,opts] of [['iPhone 13',L.devices['iPhone 13']],['PC',{viewport:{width:1440,height:900}}]]){
  const tag=nome==='PC'?'pc':'iphone';
  const c=await b.newContext({...opts,deviceScaleFactor:2});const bad=[];
  await c.addInitScript(()=>{try{sessionStorage.removeItem('e99-intro');localStorage.removeItem('e99-test-autointro')}catch(e){}
    const id=setInterval(()=>{const st=window.__e99IntroStats;if(!window.__i0&&document.getElementById('stok-intro'))window.__i0=performance.now();if(window.__i0&&st&&st.done&&document.getElementById('si-enter')){window.__i1=performance.now();clearInterval(id)}},10)});
  const p=await c.newPage();
  p.on('pageerror',e=>errs.push(nome+' '+e.message));
  p.on('console',m=>{if(m.type()==='error'&&!/Firebase|firestore|googleapis|ERR_|net::/i.test(m.text()))errs.push(nome+' console: '+m.text())});
  p.on('response',r=>{if(r.status()>=400&&r.url().startsWith(BASE))bad.push(r.status()+' '+r.url())});
  p.on('dialog',d=>d.accept());
  if(nome!=='PC'){const s=await c.newCDPSession(p);await s.send('Emulation.setCPUThrottlingRate',{rate:4})}
  await p.goto(BASE+'index.html');
  await until(p,()=>!!window.__i1,null,8000);const dur=await p.evaluate(()=>window.__i1&&window.__i0?Math.round(window.__i1-window.__i0):-1);
  ok(dur>0&&dur<=2800,nome+': abertura termina com "Entrar" em ≤2,8 s ('+dur+' ms desde que aparece)');
  const st=await p.evaluate(()=>window.__e99IntroStats);
  ok(st.sPts>100&&st.font==='desenho',nome+': S da abertura vem do logo novo ('+st.sPts+' quadradinhos, '+st.font+')');
  await p.waitForTimeout(150);await p.screenshot({path:OUT+tag+'-abertura.png'});
  if(nome==='PC')await p.click('#si-enter');else await p.tap('#si-enter');
  ok(await until(p,()=>!document.getElementById('stok-intro'),null,1500),nome+': "Entrar" tira a abertura');
  await p.waitForTimeout(800);
  const logos=await p.evaluate((nw)=>[...document.querySelectorAll('.logo img,img.entry-logo,img[data-e99-logo]')].filter(i=>i.getBoundingClientRect().width>0).map(i=>{const s=i.getAttribute('src')||'';const t=s.startsWith('data:image/svg+xml;base64,')?atob(s.split(',')[1]):decodeURIComponent(s);return t.includes(nw)}),NEW);
  ok(logos.length>=1&&logos.every(Boolean),nome+': logo da tela de entrar com a forma nova ('+logos.length+')');
  await p.screenshot({path:OUT+tag+'-entrar.png'});
  /* favicon, manifest e ícones carregam */
  const ic=await p.evaluate(async()=>{const l=document.querySelector('link[rel~="icon"]').getAttribute('href'),a=document.querySelector('link[rel="apple-touch-icon"]').getAttribute('href');
    const m=await (await fetch('manifest.webmanifest')).json();const r=[];for(const u of [...m.icons.map(i=>i.src),l,a,'icons/icon-512-v159.png'].filter(u=>!u.startsWith('data:'))){const x=await fetch(u);const bl=await x.blob();let w=0;try{w=(await createImageBitmap(bl)).width}catch(e){}r.push({u,ok:x.ok,type:bl.type,w})}return {fav:l,r}});
  ok(ic.r.every(x=>x.ok&&x.type==='image/png'&&x.w>=32),nome+': ícones carregam como PNG ('+ic.r.map(x=>x.u.replace('icons/','')+'='+x.w).join(', ')+')');
  ok(/favicon-v159\.png$/.test(ic.fav)||/^data:image\/svg/.test(ic.fav),nome+': favicon da aba ('+ic.fav.slice(0,40)+')');
  /* tema do mês: o ícone do tema usa a forma nova */
  const sea=await p.evaluate(()=>{const l=document.querySelector('link[rel~="icon"]').getAttribute('href');return l.startsWith('data:')?decodeURIComponent(l.split(',')[1]):l});
  ok(sea.includes('favicon-v159')||sea.includes('M22 14h56v12H22z'),nome+': favicon (tema do mês ou PNG) com o logo novo');
  /* entra (conta local) e confere o menu */
  await L.signup(p,'v159'+tag+Date.now().toString(36));await p.waitForTimeout(1500);
  if(nome!=='PC'){await p.evaluate(()=>{const b=document.querySelector('.menu-btn,#menu-btn,[aria-label*="menu" i]');if(b)b.click()});await p.waitForTimeout(500)}
  const menu=await p.evaluate((nw)=>{const i=document.querySelector('aside .logo img');if(!i)return null;const s=i.getAttribute('src')||'';const t=s.startsWith('data:image/svg+xml;base64,')?atob(s.split(',')[1]):decodeURIComponent(s);return t.includes(nw)},NEW);
  ok(menu===true,nome+': logo do menu com a forma nova');
  await p.screenshot({path:OUT+tag+'-menu.png'});
  if(nome!=='PC'){await p.keyboard.press('Escape');await p.waitForTimeout(300)}
  /* banner PNG */
  const ban=await p.evaluate(async()=>{const bl=await e99Msg.banner({title:'Logo novo',subtitle:'v159'});const fr=new FileReader();return await new Promise(r=>{fr.onload=()=>r({type:bl.type,size:bl.size,url:fr.result});fr.readAsDataURL(bl)})});
  ok(ban.type==='image/png'&&ban.size>5000,nome+': banner PNG ('+ban.size+' bytes)');
  fs.writeFileSync(OUT+tag+'-banner.png',Buffer.from(ban.url.split(',')[1],'base64'));
  /* folha impressa: o logo da folha é o ícone novo */
  const pp=c.waitForEvent('page',{timeout:5000}).catch(()=>null);
  await p.evaluate(()=>{window.print=()=>{};try{e99Msg.printText('Teste v159','Linha 1\nLinha 2')}catch(e){}});
  const pw=await pp;let printed=false;
  if(pw){await pw.evaluate(()=>{window.print=()=>{}}).catch(()=>{});await pw.waitForLoadState().catch(()=>{});await pw.waitForTimeout(600);
    printed=await pw.evaluate(()=>[...document.images].some(i=>/icon-512-v159\.png$/.test(i.src)&&i.naturalWidth>0)).catch(()=>false);await pw.screenshot({path:OUT+tag+'-impressao.png'}).catch(()=>{});await pw.close()}
  else{const fr=p.frames().find(f=>f!==p.mainFrame());if(fr){printed=await fr.evaluate(()=>[...document.images].some(i=>/icon-512-v159\.png$/.test(i.src))).catch(()=>false)}}
  ok(printed,nome+': folha impressa com o ícone novo');
  /* favicon piscando (v154) continua funcionando com o ícone novo */
  if(nome==='PC'){const blink=await p.evaluate(async()=>{if(typeof e99TitleState!=='function')return 'sem';return JSON.stringify(e99TitleState())});ok(blink!=='sem',nome+': e99TitleState existe ('+blink.slice(0,80)+')')}
  ok(bad.length===0,nome+': nenhum recurso 404 ('+bad.join(', ')+')');
  await c.close()}
 /* ícones PNG soltos em 2x para o relatório */
 for(const f of ['icon-512-v159','icon-maskable-v159','apple-touch-v159','favicon-v159'])fs.copyFileSync('icons/'+f+'.png',OUT+f+'.png');
 ok(errs.length===0,'0 erro de console ('+errs.slice(0,4).join(' | ')+')');
 await b.close()})().catch(e=>{console.log('FAIL erro '+e.message);process.exit(1)});
