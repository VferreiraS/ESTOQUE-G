/* v144: mensagens mais bonitas para WhatsApp e Outlook (e99Msg). PC 1440×900, gestor.
   Texto com *negrito* e sem marcas vindas do usuário; banner PNG 1080 px; folha com os dois botões; compartilhar com/sem arquivos;
   sem navigator.share abre wa.me; Copiar para o Outlook grava text/html; e-mail automático com o texto novo; 0 erro de console. */
const L=require('./lib.js');const {ok,signup}=L;
const BASE=process.env.BASE||'http://localhost:8000';const U=BASE+'/index.html?ntfy='+L.N;
function watch(p,tag,errs){p.on('pageerror',e=>errs.push(tag+' '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::ERR|firestore|Firebase|identitytoolkit|WebChannel/i.test(m.text()))errs.push(tag+' console: '+m.text())});p.on('dialog',d=>d.accept())}
(async()=>{const b=await L.chromium.launch();const errs=[];
const ctx=await b.newContext({viewport:{width:1440,height:900}});
try{await ctx.grantPermissions(['clipboard-read','clipboard-write'],{origin:BASE})}catch(e){}
const p=await ctx.newPage();watch(p,'PC',errs);
const posts=[];await p.route('https://formsubmit.co/**',async r=>{posts.push(JSON.parse(r.request().postData()||'{}'));await r.fulfill({status:200,contentType:'application/json',body:'{"success":"true"}'})});
await p.goto(U);await p.waitForTimeout(2000);await signup(p,'gestor'+Date.now().toString(36));await p.waitForTimeout(800);
await p.evaluate(async()=>{authSession.payload.role='gestor';
  state.team=[{id:'ana',name:'Ana *Souza*',role:'Repositora'}];
  state.nfs=[{id:'n1',number:'48213',supplier:'Laticínios _Serra_ ~LTDA~',date:iso(),status:'Pendente',owner:'ana',notes:'',volumes:3}];
  state.plans=[{id:'p1',title:'Plano *de* terça',date:iso(),activities:[{id:'a1',title:'Repor *arroz* no 07',owner:'Ana *Souza*',notes:'Linha 1\nLinha _2_ ~ok~',photos:[],done:false,time:'10:00'}]}];
  await save()});
ok(await p.evaluate(()=>typeof e99Msg==='object'&&typeof e99Msg.text==='function'&&typeof e99Msg.banner==='function'&&typeof e99Msg.preview==='function'),'window.e99Msg com text, banner e preview');

/* 1) texto */
const t=await p.evaluate(()=>e99Msg.text(e99Msg.planPayload(state.plans[0])));
const lines=t.split('\n');
ok(/^\*Plano de ação · \d{2}\/\d{2}\/\d{4}\*$/.test(lines[0]),'título em *negrito* ('+lines[0]+')');
ok(/^_Plano de terça · .+ · \d{2}\/\d{2}\/\d{4} às \d{2}:\d{2}_$/.test(lines[1]),'subtítulo com data e hora ('+lines[1]+')');
ok(lines.includes('──────────')&&lines[lines.length-1]==='Stok · Lojas G · Estoque 99','separador e rodapé "Stok · Lojas G · Estoque 99"');
ok(/^\*Atividades \(0 de 1 feitas\)\*$/m.test(t)&&/^• \*1\. Repor arroz no 07\* — até 10:00$/m.test(t),'seção em negrito e linha com "•"');
ok(/Responsável: Ana Souza/.test(t)&&/Orientações: Linha 1 Linha 2 ok/.test(t),'dados do usuário sem * _ ~ e sem quebra de linha');
ok(!/\*arroz\*|\*de\*|_2_|~ok~|\*Souza\*/.test(t),'nenhuma marca vinda do usuário sobra no texto');
/* 1b) v143: atividade com demanda mostra a demanda e o responsável da demanda */
const td=await p.evaluate(()=>{state.dresp=[{id:'d2',resp:'Thomaz *Lima*'}];const pl=JSON.parse(JSON.stringify(state.plans[0]));pl.activities[0].demanda='Quebras';pl.activities.push({id:'a2',title:'Separar',owner:'Ana',notes:'',photos:[],done:false,demanda:'Vencimentos'});return e99Msg.text(e99Msg.planPayload(pl))});
ok(/^   Demanda: Quebras \(responsável da demanda: Thomaz Lima\)$/m.test(td),'plano com demanda: texto tem a demanda e o responsável da demanda');
ok(/^   Demanda: Vencimentos$/m.test(td)&&!/\*Lima\*/.test(td),'demanda sem responsável aparece sozinha; sem * _ ~ do usuário');
await p.evaluate(()=>{state.dresp=[]});
const plain=await p.evaluate(()=>e99Msg.text({title:'A *b*',sections:[{title:'S',lines:['x']}]},{plain:true}));
ok(!/[*_]/.test(plain)&&/^A b\n/.test(plain),'versão sem marcas para e-mail');

/* 2) banner */
const ban=await p.evaluate(async()=>{const bl=await e99Msg.banner({title:'Relatório *teste*',subtitle:'Loja'});const im=await createImageBitmap(bl);return {type:bl.type,w:im.width,h:im.height,size:bl.size}});
ok(ban.type==='image/png'&&ban.w===1080&&ban.h>=380&&ban.h<=460&&ban.size>5000,'banner é PNG 1080 px de largura ('+JSON.stringify(ban)+')');
const logoOk=await p.evaluate(async()=>{const r=await fetch('icons/icon-512-v123.png');return r.ok});ok(logoOk,'logo do app (icons/icon-512-v123.png) existe');

/* 3) folha pelo plano */
await p.evaluate(()=>go('plans'));await p.waitForTimeout(500);
await p.click('text=Copiar para WhatsApp / Outlook');await p.waitForTimeout(300);
ok(await p.evaluate(()=>document.getElementById('e99-msg').open),'"Copiar para WhatsApp / Outlook" abre a folha');
ok(await p.isVisible('#e99m-share')&&await p.isVisible('#e99m-outlook'),'folha com "Compartilhar (WhatsApp)" e "Copiar para o Outlook"');
ok(/^Compartilhar \(WhatsApp\)$/.test((await p.textContent('#e99m-share')).trim())&&/^Copiar para o Outlook$/.test((await p.textContent('#e99m-outlook')).trim()),'rótulos dos botões');
const mail=await p.getAttribute('#e99m-mail','href');ok(/^mailto:\?subject=Plano/.test(mail)&&/body=/.test(mail)&&!/%2A/.test(mail),'link "Abrir no e-mail" com assunto e corpo simples');
await p.waitForFunction(()=>!document.getElementById('e99m-share').disabled&&document.getElementById('e99m-img').getAttribute('src'),null,{timeout:8000});
ok(true,'banner aparece na folha e o botão de compartilhar fica pronto');
const sizes=await p.evaluate(()=>[...document.querySelectorAll('#e99-msg button,#e99-msg a')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return Math.min(r.width,r.height)}));
ok(sizes.length>=4&&sizes.every(s=>s>=44),'toques ≥44 px ('+sizes.map(Math.round).join(',')+')');
ok(await p.evaluate(()=>!document.getElementById('e99m-text').innerHTML.includes('<b>')&&document.getElementById('e99m-text').textContent.includes('Repor arroz')),'texto na folha vai como texto (sem HTML)');

/* 4) compartilhar com arquivos */
await p.evaluate(()=>{window.__sh=[];Object.defineProperty(navigator,'canShare',{configurable:true,value:d=>!!(d&&d.files&&d.files.every(f=>f.type==='image/png'))});
  Object.defineProperty(navigator,'share',{configurable:true,value:d=>{window.__sh.push({files:(d.files||[]).map(f=>({name:f.name,type:f.type,size:f.size})),text:d.text||''});return Promise.resolve()}})});
await p.click('#e99m-share');await p.waitForTimeout(300);
let sh=await p.evaluate(()=>window.__sh);
ok(sh.length===1&&sh[0].files.length===1&&sh[0].files[0].type==='image/png'&&sh[0].files[0].size>5000&&/^\*Plano de ação/.test(sh[0].text),'com canShare(files): navigator.share({files:[png], text}) ('+JSON.stringify(sh[0]&&sh[0].files)+')');
/* sem compartilhar arquivo */
await p.evaluate(()=>{window.__sh=[];Object.defineProperty(navigator,'canShare',{configurable:true,value:()=>false})});
await p.click('#e99m-share');await p.waitForTimeout(300);sh=await p.evaluate(()=>window.__sh);
ok(sh.length===1&&sh[0].files.length===0&&/Repor arroz/.test(sh[0].text),'sem arquivos: navigator.share({text})');
/* Esc fecha e devolve o foco */
await p.keyboard.press('Escape');await p.waitForTimeout(200);
ok(await p.evaluate(()=>!document.getElementById('e99-msg').open),'Esc fecha a folha');
ok(/Copiar para WhatsApp/.test(await p.evaluate(()=>document.activeElement&&document.activeElement.textContent||'')),'foco volta ao botão de origem');

/* 5) sem navigator.share → wa.me + baixar banner */
await p.evaluate(()=>{Object.defineProperty(navigator,'share',{configurable:true,value:undefined});window.__open=[];window.open=function(u){window.__open.push(String(u));return null}});
await p.click('text=Copiar para WhatsApp / Outlook');await p.waitForFunction(()=>!document.getElementById('e99m-share').disabled,null,{timeout:8000});
ok(await p.isVisible('#e99m-dl'),'sem navigator.share: "Baixar banner (PNG)" aparece');
await p.click('#e99m-share');await p.waitForTimeout(200);
const op=await p.evaluate(()=>window.__open);
ok(op.length===1&&/^https:\/\/wa\.me\/\?text=/.test(op[0])&&decodeURIComponent(op[0].split('text=')[1]).startsWith('*Plano de ação'),'sem navigator.share: abre wa.me com o texto');
const [dl]=await Promise.all([p.waitForEvent('download',{timeout:5000}).catch(()=>null),p.click('#e99m-dl')]);
ok(dl&&/\.png$/.test(dl.suggestedFilename()),'baixa o banner em PNG ('+(dl&&dl.suggestedFilename())+')');

/* 6) Copiar para o Outlook */
let types=null;
const real=await p.evaluate(async()=>{const ok1=await e99Msg.outlook();if(!ok1)return null;try{const it=await navigator.clipboard.read();const ty=it[0].types.slice();const h=await (await it[0].getType('text/html')).text();return {types:ty,html:h}}catch(e){return {err:String(e)}}});
if(real&&real.types){types=real.types;ok(/<table/.test(real.html)&&/Plano de ação/.test(real.html)&&/Repor arroz no 07/.test(real.html)&&!/<img/.test(real.html),'HTML do Outlook: tabela de cabeçalho, texto, sem imagem')}
else{types=await p.evaluate(async()=>{let got=null;const orig=navigator.clipboard.write;navigator.clipboard.write=async items=>{got=items[0].types.slice();return};await e99Msg.outlook();navigator.clipboard.write=orig;return got})}
ok(types&&types.includes('text/html')&&types.includes('text/plain'),'Copiar para o Outlook grava text/html e text/plain ('+JSON.stringify(types)+')');
const h=await p.evaluate(()=>e99Msg.html({title:'<b>x</b>',sections:[{title:'S',lines:[{b:'<img src=x onerror=alert(1)>',t:'y'}]}]}));
ok(!/<img|<b>x/.test(h)&&/&lt;img/.test(h),'HTML do Outlook escapa dados do usuário');
/* clipboard falhou → caixa para copiar à mão */
await p.evaluate(async()=>{navigator.clipboard.write=()=>Promise.reject(Error('negado'));await e99Msg.outlook()});
ok(await p.evaluate(()=>!document.getElementById('e99m-manual').hidden&&document.activeElement.id==='e99m-copy'&&document.activeElement.selectionEnd>20),'clipboard falhou: texto aparece selecionado para copiar à mão');
await p.evaluate(()=>e99Msg.close());

/* 7) relatório (Compartilhar ↗) e resumo da semana usam a folha */
await p.evaluate(()=>openShareReport('nfs'));await p.waitForTimeout(200);
ok(/^\*Notas fiscais · Pendentes\*/.test(await p.inputValue('#report-text'))&&/• \*1\. 48213\*/.test(await p.inputValue('#report-text'))&&!/_Serra_|~LTDA~/.test(await p.inputValue('#report-text')),'relatório: prévia com o texto novo');
await p.click('#report-dialog button.primary');await p.waitForTimeout(300);
ok(await p.evaluate(()=>document.getElementById('e99-msg').open&&/Notas fiscais/.test(document.getElementById('e99m-text').textContent)),'relatório: "Enviar" abre a folha');
await p.keyboard.press('Escape');await p.waitForTimeout(150);await p.evaluate(()=>{const d=document.getElementById('report-dialog');if(d.open)d.close()});
await p.evaluate(()=>e99Week.open());await p.waitForTimeout(200);
await p.click('#wk-dlg button:has-text("Compartilhar")');await p.waitForTimeout(300);
ok(await p.evaluate(()=>document.getElementById('e99-msg').open&&/^\*Resumo da semana\*/.test(document.getElementById('e99m-text').textContent)),'relatório da semana: "Compartilhar" abre a folha');
await p.evaluate(()=>{e99Msg.close();document.getElementById('wk-dlg').close()});

/* 8) envio automático (FormSubmit): mesmo texto no corpo, destino igual */
await p.evaluate(()=>{localStorage.setItem('lojasg.estoque99.email-reports:'+authSession.storeKey,JSON.stringify({enabled:true,to:'dono@teste.com',cc:'',times:['08:00']}));emailReportTest()});
await p.waitForTimeout(1500);
ok(posts.length===1&&typeof posts[0].Mensagem==='string'&&/^Relatório de teste\n/.test(posts[0].Mensagem)&&/• NF 48213 — Laticínios Serra LTDA · Pendente/.test(posts[0].Mensagem)&&!/\*/.test(posts[0].Mensagem)&&posts[0].Loja&&posts[0]['NF 48213'],'FormSubmit: corpo com o texto formatado (campos antigos mantidos)');
ok(Object.keys(posts[0]||{})[0]==='Mensagem','FormSubmit: texto formatado vem primeiro');
const wf=await p.evaluate(()=>e99Week.fields(e99Week.data(e99Week.monday(iso()))));
ok(/^Resumo da semana\n/.test(wf.Mensagem)&&wf.Semana&&wf['Divergências'],'resumo semanal: corpo com o texto formatado');

const def=await p.evaluate(()=>{localStorage.removeItem('lojasg.estoque99.email-reports:'+authSession.storeKey);return emailPanelHTML()});
ok(/name="to"[^>]*value="stok99\.app@gmail\.com"/.test(def)&&!/ferreiradasilvavitorhugo44/.test(def),'destino padrão do relatório por e-mail = stok99.app@gmail.com');
ok(errs.length===0,'0 erro de console'+(errs.length?' '+errs.join(' | '):''));
await b.close()})().catch(e=>{console.log('FAIL erro '+e.stack);process.exit(1)});
