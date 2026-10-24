// Testa apps-script/relatorio-email.gs em vm, com MailApp/PropertiesService/ContentService falsos.
const fs=require('fs'),vm=require('vm'),path=require('path');
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
const code=fs.readFileSync(path.join(__dirname,'..','apps-script','relatorio-email.gs'),'utf8');
function box(token){const sent=[];const sb={sent,
 PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='TOKEN_RELATORIO'?token:null})},
 MailApp:{sendEmail:o=>sent.push(o)},
 UrlFetchApp:{fetch:()=>{throw Error('não deve buscar nada')}},
 ContentService:{createTextOutput:t=>({setMimeType:()=>t}),MimeType:{JSON:1}}};
 vm.createContext(sb);vm.runInContext(code,sb);return sb}
const T='segredo-de-teste-123';
const campos={_token:T,_subject:'Estoque 99 · Relatório das 8h · Loja 99 · 24/10/2026','Loja':'Estoque 99 <script>alert(1)</script>','Gerado em':'24/10/2026 08:00',
 'Resumo':'2 NFs a conferir','NF 123':'Fornecedor & Cia · Em divergência','A fazer: Contar "corredor" 3':'Ana · Plano · até 10:00 · ATRASADA','Mais':'1 item'};
// 1) sem token
let sb=box(T);let r=JSON.parse(sb.doPost({parameter:Object.assign({},campos,{_token:undefined})}));
ok(!r.ok&&sb.sent.length===0,'sem token → recusa e não envia');
r=JSON.parse(sb.doPost({parameter:Object.assign({},campos,{_token:'errado'})}));ok(!r.ok&&sb.sent.length===0,'token errado → recusa');
// 2) script sem token configurado recusa tudo
sb=box(null);r=JSON.parse(sb.doPost({parameter:campos}));ok(!r.ok&&sb.sent.length===0,'sem TOKEN_RELATORIO nas propriedades → recusa');
// 3) com token (formulário)
sb=box(T);r=JSON.parse(sb.doPost({parameter:campos}));const m=sb.sent[0]||{};
ok(r.ok&&sb.sent.length===1,'com token → envia');
ok(m.to==='ferreiradasilvavitorhugo44@gmail.com'&&m.cc==='99.estoque@lojasg.com.br','destinatário e cópia fixos');
ok(m.subject===campos._subject,'assunto vem de _subject');
ok(!/<script>/i.test(m.htmlBody)&&/&lt;script&gt;alert\(1\)&lt;\/script&gt;/.test(m.htmlBody),'<script> vira texto escapado');
ok(/Fornecedor &amp; Cia/.test(m.htmlBody)&&/&quot;corredor&quot;/.test(m.htmlBody),'& e aspas escapados');
ok(!/segredo-de-teste/.test(m.htmlBody+m.body),'token não aparece no e-mail');
ok(/#0b0b0c/.test(m.htmlBody)&&/#FF2A1F/.test(m.htmlBody)&&/max-width:600px/.test(m.htmlBody)&&/Oswald/.test(m.htmlBody),'visual do app (escuro, vermelho, 600px, Oswald)');
ok(!/<img|<script|https?:\/\//i.test(m.htmlBody),'sem imagens, scripts nem links externos');
ok(/Loja: Estoque 99 <script>/.test(m.body)&&/NF 123: Fornecedor/.test(m.body),'versão texto puro');
// 4) JSON + conta nova + limite de tamanho
sb=box(T);const big={_token:T,_subject:'Nova conta','Estoque':'E99','Login':'ana','Tipo de conta':'estoque','Criada em':'hoje','Aparelho':'iPhone','Contas':'7'};
for(let i=0;i<90;i++)big['NF '+i]='x'.repeat(900);
r=JSON.parse(sb.doPost({postData:{type:'application/json',contents:JSON.stringify(big)}}));const m2=sb.sent[0]||{};
ok(r.ok&&/ana/.test(m2.htmlBody)&&/iPhone/.test(m2.htmlBody),'JSON da conta nova funciona');
ok(m2.htmlBody.length<=60000&&m2.body.length<=60000,'corpo limitado');
sb=box(T);const huge={_token:T,a:'x'.repeat(200000)};r=JSON.parse(sb.doPost({postData:{type:'application/json',contents:JSON.stringify(huge)}}));ok(!r.ok&&sb.sent.length===0,'pedido gigante → recusa');
// 5) pedido vazio
sb=box(T);r=JSON.parse(sb.doPost(undefined));ok(!r.ok&&sb.sent.length===0,'pedido vazio → recusa');
console.log(fails?fails+' FAIL':'tudo PASS');process.exit(fails?1:0);
