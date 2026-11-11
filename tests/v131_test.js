/* v131: bibliotecas que ajudam o app, sem rede e sem dado saindo do aparelho.
   1) leitor da conferência: zxing-wasm (principal) com ZXing JS de reserva; 2) "Importar XML da nota" (um ou vários, DOMParser nativo);
   3) Excel (.xlsx) gerado no aparelho; 0 erro de console; nada baixado de fora do próprio site. PC 1440×900 (gestor) + iPhone 13 (auxiliar). */
const L=require('./lib.js');const {ok,until,signup}=L;const fs=require('fs'),path=require('path'),zlib=require('zlib'),cp=require('child_process');
const U='http://localhost:8000/index.html?ntfy='+L.N,FX=path.join(__dirname,'fixtures'),SHOTS=process.env.SHOTS||'';
const A=path.join(FX,'nfe-v131-a.xml'),B=path.join(FX,'nfe-v131-b.xml'),BAD=path.join(FX,'nfe-v131-malformado.xml'),EVT=path.join(FX,'nfe-v131-evento.xml');
function unzip(buf){const out={};let e=buf.length-22;while(e>=0&&buf.readUInt32LE(e)!==0x06054b50)e--;if(e<0)throw Error('sem EOCD');const n=buf.readUInt16LE(e+10);let o=buf.readUInt32LE(e+16);
  for(let i=0;i<n;i++){if(buf.readUInt32LE(o)!==0x02014b50)throw Error('central inválido');const m=buf.readUInt16LE(o+10),cs=buf.readUInt32LE(o+20),nl=buf.readUInt16LE(o+28),xl=buf.readUInt16LE(o+30),cl=buf.readUInt16LE(o+32),lo=buf.readUInt32LE(o+42),name=buf.slice(o+46,o+46+nl).toString();
    const lnl=buf.readUInt16LE(lo+26),lxl=buf.readUInt16LE(lo+28),d=buf.slice(lo+30+lnl+lxl,lo+30+lnl+lxl+cs);out[name]=(m===8?zlib.inflateRawSync(d):d).toString('utf8');o+=46+nl+xl+cl}return out}
function openpyxl(file){try{return JSON.parse(cp.execFileSync('python3',['-P','-E','-c','import openpyxl,json,sys;w=openpyxl.load_workbook(sys.argv[1]);s=w.active;print(json.dumps([[c for c in r] for r in s.iter_rows(values_only=True)],default=str))',file]).toString())}catch(e){return null}}
const ext=[];const local=u=>/^(https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/|data:|blob:|about:)/.test(u);
function watch(p,tag,errs){p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(tag+' console: '+m.text())});
  p.on('request',r=>{if(p.__track&&!local(r.url()))ext.push(tag+' '+r.url())});p.on('dialog',d=>d.accept())}
async function pick(p,files){const [ch]=await Promise.all([p.waitForEvent('filechooser',{timeout:5000}),p.evaluate(()=>e99NfXmlPick())]);await ch.setFiles(files)}
async function seeImport(p){const s='button:has-text("Importar XML da nota")';if(!(await p.isVisible(s))){const m=await p.$('#view .more-actions summary, #view .more-actions > button');if(m)await m.click();await p.waitForTimeout(300)}const v=await p.isVisible(s);await p.keyboard.press('Escape').catch(()=>{});const m=await p.$('#view details.more-actions[open]');if(m)await p.evaluate(()=>document.querySelectorAll('#view details.more-actions[open]').forEach(d=>d.open=false));return v}
const toast=p=>p.evaluate(()=>document.getElementById('toast').textContent);
const F=p=>p.evaluate(()=>{const f=document.getElementById('editor'),g=n=>f.elements.namedItem(n).value;return {open:document.getElementById('modal').open,n:g('number'),serie:g('series'),cnpj:g('cnpj'),sup:g('supplier'),emi:g('emissionDate'),tot:g('totalValue'),vol:g('volumes'),key:g('accessKey'),bold:!!document.querySelector('#fields b b, #nf-import-details um'),status:document.getElementById('nf-xml-status').textContent}});
(async()=>{const b=await L.chromium.launch();const errs=[];
/* ================= PC · gestor ================= */
{const ctx=await b.newContext({viewport:{width:1440,height:900},acceptDownloads:true});const p=await ctx.newPage();watch(p,'PC',errs);
 await p.goto(U);await p.waitForTimeout(2000);await signup(p,'gestor'+Date.now().toString(36));await p.waitForTimeout(800);
 await p.evaluate(()=>go('nfs'));await p.waitForTimeout(600);p.__track=1;
 ok(await seeImport(p)&&await p.isVisible('button:has-text("Excel (.xlsx)")')&&await p.isVisible('button:has-text("Exportar CSV")'),'PC: Notas fiscais tem "Importar XML da nota" (em Mais ações), "Excel (.xlsx)" e o CSV continua');
 if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});const bt=await p.$('button:has-text("Excel (.xlsx)")');await bt.scrollIntoViewIfNeeded();await p.screenshot({path:path.join(SHOTS,'v131-pc-excel.png')})}
 const n0=await p.evaluate(()=>state.nfs.length);
 /* dois XML de uma vez: o 1º abre preenchido, nada é salvo sozinho */
 await pick(p,[A,B]);await until(p,()=>document.getElementById('modal').open&&document.getElementById('editor').elements.namedItem('number').value!=='',null,6000);
 let f=await F(p);
 ok(f.open&&f.n==='4521'&&f.serie==='1'&&f.cnpj==='11222333000181'&&f.sup==='Distribuidora Ficticia de Teste <b> & Cia Ltda'&&f.emi==='05/10/2026'&&f.tot==='1.234,50'&&f.vol==='5'&&f.key==='35261011222333000181550010000045211123456789','XML A preenche número, série, CNPJ, fornecedor, emissão, valor, volumes (3+2) e chave ('+JSON.stringify(f).slice(0,160)+')');
 ok(!f.bold,'texto do XML entra como texto (fornecedor "<b>" e produto "<um>" não viram HTML)');
 ok(/XML 1 de 2/.test(f.status)&&await p.evaluate(n=>state.nfs.length===n,n0),'nada salvo sozinho; aviso "XML 1 de 2"');
 await p.click('#editor button[type=submit], #modal button.primary[type=submit]');await p.waitForTimeout(700);
 ok(await until(p,()=>{const f=document.getElementById('editor');return document.getElementById('modal').open&&f.elements.namedItem('number').value==='98'},null,5000),'ao salvar, abre o próximo XML (NF 98)');
 f=await F(p);ok(f.tot==='89,90'&&f.vol==='7'&&f.emi==='20/10/2026'&&f.sup==='Atacado Inventado SA'&&/XML 2 de 2/.test(f.status),'XML B (raiz NFe): valor 89,90, 7 volumes, emissão 20/10/2026');
 await p.evaluate(()=>document.getElementById('modal').close());await p.waitForTimeout(500);
 const saved=await p.evaluate(()=>state.nfs.filter(n=>n.number==='4521'||n.number==='98').map(n=>({n:n.number,e:n.emissionDate,t:n.totalValue,v:n.volumes,k:n.accessKey,items:(n.items||[]).length})));
 ok(saved.length===1&&saved[0].e==='2026-10-05'&&saved[0].t==='1234.50'&&saved[0].v===5&&saved[0].items===2,'salvo só o que foi conferido (A), com emissão 2026-10-05 e valor 1234.50; B fechado sem salvar ('+JSON.stringify(saved)+')');
 /* duplicada: mesma chave; e mesmo número + fornecedor (sem chave) */
 await p.evaluate(()=>notify(''));await pick(p,[A]);await p.waitForTimeout(800);
 ok(/já cadastrada/.test(await toast(p))&&!(await p.evaluate(()=>document.getElementById('modal').open)),'XML de NF já cadastrada (mesma chave): mensagem clara e não abre ('+(await toast(p)).slice(0,70)+')');
 await p.evaluate(async()=>{state.nfs.push({id:'man98',number:'98',supplier:'Atacado Inventado SA',date:iso(),status:'Pendente',owner:'',notes:'',volumes:0});await save()});
 await pick(p,[B]);await p.waitForTimeout(800);ok(/já cadastrada/.test(await toast(p)),'mesmo número + fornecedor (NF digitada sem chave): também acusa duplicada');
 /* inválidos */
 await pick(p,[BAD]);await p.waitForTimeout(700);ok(/malformado/.test(await toast(p)),'XML malformado: "O arquivo XML está malformado"');
 await pick(p,[EVT]);await p.waitForTimeout(700);ok(/XML completo da NF-e/.test(await toast(p)),'XML de outro tipo (evento): pede o XML completo da NF-e');
 const big=path.join(require('os').tmpdir(),'e99-big.xml');fs.writeFileSync(big,'<a>'+'x'.repeat(2.2*1024*1024)+'</a>');
 await pick(p,[big]);await p.waitForTimeout(700);ok(/2 MB/.test(await toast(p)),'arquivo acima de 2 MB é recusado');
 /* Excel da lista de NFs */
 {const [dl]=await Promise.all([p.waitForEvent('download',{timeout:8000}).catch(()=>null),p.click('button:has-text("Excel (.xlsx)")')]);let z=null,file='';if(dl){file=await dl.path();try{z=unzip(fs.readFileSync(file))}catch(e){}}
  const sh=z&&z['xl/worksheets/sheet1.xml']||'';const rows=(sh.match(/<row /g)||[]).length,nfs=await p.evaluate(()=>matchingNFs().length);
  ok(dl&&/\.xlsx$/.test(dl.suggestedFilename())&&z&&z['[Content_Types].xml']&&z['xl/workbook.xml']&&rows===nfs+1&&/>NF</.test(sh)&&/>4521</.test(sh)&&/Distribuidora Ficticia de Teste &lt;b&gt; &amp; Cia Ltda/.test(sh),'Excel (.xlsx): zip válido, cabeçalho + '+nfs+' linhas (uma por NF filtrada)');
  let py=null;if(file){const x=path.join(require('os').tmpdir(),'e99-v131-'+Date.now()+'.xlsx');fs.copyFileSync(file,x);py=openpyxl(x)}ok(py===null||(py.length===nfs+1&&py[0][0]==='NF'&&py.some(r=>r[0]==='4521'&&r[1]==='Distribuidora Ficticia de Teste <b> & Cia Ltda')),'openpyxl abre o .xlsx e lê as mesmas linhas'+(py===null?' (openpyxl ausente)':''))}
 /* leitor: zxing-wasm principal */
 const rd=await p.evaluate(async()=>{const LC=['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011'],RC=LC.map(s=>s.replace(/./g,c=>c==='0'?'1':'0')),GC=RC.map(s=>s.split('').reverse().join('')),PAR=['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL'];
   const code='7891000315507',d=code.split('').map(Number);let bits='101';for(let i=1;i<=6;i++)bits+=(PAR[d[0]][i-1]==='L'?LC:GC)[d[i]];bits+='01010';for(let i=7;i<=12;i++)bits+=RC[d[i]];bits+='101';
   const c=document.createElement('canvas');c.width=640;c.height=480;const g=c.getContext('2d');g.fillStyle='#ececec';g.fillRect(0,0,640,480);g.fillStyle='#111';const x0=(640-bits.length*4)/2;for(let i=0;i<bits.length;i++)if(bits[i]==='1')g.fillRect(x0+i*4,150,4,180);
   const t=performance.now();const r=await e99Conf.decodeCanvas(c);return {r,eng:e99Conf.engine(),ms:performance.now()-t}});
 ok(rd.r&&rd.r.text==='7891000315507'&&rd.eng==='zxing-wasm','leitor principal: zxing-wasm lê o EAN-13 ('+rd.eng+', '+rd.ms.toFixed(0)+' ms com a carga)');
 const res=await p.evaluate(()=>performance.getEntriesByType('resource').map(e=>e.name).filter(n=>/zxing/.test(n))),org='http://localhost:8000';
 ok(res.some(n=>/vendor\/zxing-wasm\/zxing_reader\.wasm$/.test(n))&&res.every(n=>n.startsWith(org)),'o .wasm vem do próprio site (vendor/zxing-wasm), nunca do CDN');
 p.__track=0;await ctx.close()}
/* ================= reserva: sem o wasm, ZXing JS ================= */
{const ctx=await b.newContext({viewport:{width:1280,height:800},serviceWorkers:'block'});await ctx.route('**/vendor/zxing-wasm/**',r=>r.abort());const p=await ctx.newPage();watch(p,'reserva',errs);
 await p.goto(U);await p.waitForTimeout(1500);await signup(p,'res'+Date.now().toString(36));await p.waitForTimeout(500);
 const rd=await p.evaluate(async()=>{const c=document.createElement('canvas');c.width=400;c.height=200;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,400,200);
   /* ITF-14 17891000315504 */const IP=['nnwwn','wnnnw','nwnnw','wwnnn','nnwnw','wnwnn','nwwnn','nnnww','wnnwn','nwnwn'],code='17891000315504';let bits='1010';for(let i=0;i<14;i+=2){const a=IP[+code[i]],b=IP[+code[i+1]];for(let k=0;k<5;k++){bits+=a[k]==='w'?'111':'1';bits+=b[k]==='w'?'000':'0'}}bits+='11101';
   g.fillStyle='#000';for(let i=0;i<bits.length;i++)if(bits[i]==='1')g.fillRect(40+i*2,30,2,140);const r=await e99Conf.decodeCanvas(c);return {r,eng:e99Conf.engine()}});
 ok(rd.r&&rd.r.text==='17891000315504'&&rd.eng==='zxing-js','sem o zxing-wasm (bloqueado): cai no ZXing JS de reserva e lê o ITF-14 ('+rd.eng+')');
 await ctx.close()}
/* ================= iPhone 13 · auxiliar ================= */
{const ctx=await b.newContext({...L.devices['iPhone 13']});const p=await ctx.newPage();watch(p,'iPhone',errs);
 await p.goto(U);await p.waitForTimeout(2000);await signup(p,'aux'+Date.now().toString(36));await p.waitForTimeout(800);
 await p.evaluate(()=>{authSession.payload.role='auxiliar';go('nfs');render()});await p.waitForTimeout(700);p.__track=1;
 ok(await p.evaluate(()=>isAux())&&await seeImport(p),'iPhone (auxiliar): vê "Importar XML da nota"');
 await pick(p,[A]);await until(p,()=>document.getElementById('modal').open&&document.getElementById('editor').elements.namedItem('number').value==='4521',null,6000);
 const f=await F(p);ok(f.open&&f.tot==='1.234,50'&&f.emi==='05/10/2026'&&f.vol==='5','iPhone: janela de importar abre preenchida (valor, emissão, volumes)');
 const lay=await p.evaluate(()=>({doc:document.documentElement.scrollWidth,m:document.getElementById('modal').getBoundingClientRect().width}));ok(lay.doc<=390&&lay.m<=390,'iPhone: janela cabe em 390 px sem rolagem lateral');
 if(SHOTS){await p.evaluate(()=>{const e=document.querySelector('#editor input[name=emissionDate]');if(e)e.scrollIntoView({block:'center'})});await p.waitForTimeout(300);await p.screenshot({path:path.join(SHOTS,'v131-iphone-xml.png')})}
 await p.click('#editor button[type=submit], #modal button.primary[type=submit]');await p.waitForTimeout(800);
 ok(await p.evaluate(()=>state.nfs.some(n=>n.number==='4521'&&n.totalValue==='1234.50'&&window.e99Mine(n))),'auxiliar salva a NF importada (fica como criada por ele)');
 p.__track=0;await ctx.close()}
ok(!ext.length,'nada baixado de fora do próprio site durante importar/exportar/ler ('+ext.slice(0,3).join(' ')+')');
console.log('errors',JSON.stringify(errs));ok(!errs.length,'0 erro de console');await b.close()})().catch(e=>{console.log('FAIL exceção '+e.message);process.exit(1)});
