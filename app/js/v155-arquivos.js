(function(){
'use strict';
/* v155: envio de arquivos no chat (equipe e conversas). Regras comuns aos dois chats:
   - qualquer tipo, menos executáveis e scripts (lista BLOCK, conferida no envio E no recebimento);
   - até MAX bytes por arquivo (2 MB: cabe nos 4 pedaços de 800 mil caracteres do chat da equipe e nos pedaços das conversas);
   - nome e tipo vão DENTRO do conteúdo cifrado; o tipo usado ao baixar vem da extensão (lista SAFE), nunca do remetente;
   - o arquivo recebido só é baixado (Blob + download), nunca aberto na página. */
var MAX=2*1024*1024;
var BLOCK=['exe','bat','cmd','js','mjs','cjs','html','htm','xhtml','mht','mhtml','svg','svgz','msi','msp','apk','aab','scr','com','vbs','vbe','wsf','wsh','hta','ps1','psm1','jar','dll','sys','lnk','reg','sh','pif','cpl','jse','appx','msix','ipa','dmg','pkg','deb','rpm','xsl','xslt'];
var SAFE={pdf:'application/pdf',txt:'text/plain',csv:'text/csv',rtf:'application/rtf',
  doc:'application/msword',docx:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',odt:'application/vnd.oasis.opendocument.text',
  xls:'application/vnd.ms-excel',xlsx:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',ods:'application/vnd.oasis.opendocument.spreadsheet',
  ppt:'application/vnd.ms-powerpoint',pptx:'application/vnd.openxmlformats-officedocument.presentationml.presentation',odp:'application/vnd.oasis.opendocument.presentation',
  zip:'application/zip',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',heic:'image/heic',
  mp3:'audio/mpeg',m4a:'audio/mp4',mp4:'video/mp4',mov:'video/quicktime',json:'application/json',xml:'application/octet-stream'};
var BAD_MIME=/^(text\/html|application\/xhtml|image\/svg|application\/(x-)?javascript|text\/javascript|application\/x-msdownload|application\/x-ms|application\/vnd\.android\.package|application\/x-sh|application\/hta)/i;
function cleanName(n){n=String(n==null?'':n).normalize('NFC').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩]/g,'').replace(/[\\/:*?"<>|]/g,'_').replace(/^[.\s]+/,'').replace(/[.\s]+$/,'').trim();
  if(n.length>120){var m=/\.([A-Za-z0-9]{1,8})$/.exec(n);n=m?n.slice(0,119-m[0].length)+'…'+m[0]:n.slice(0,120)}return n||'arquivo'}
function ext(n){var m=/\.([A-Za-z0-9]{1,10})$/.exec(String(n||''));return m?m[1].toLowerCase():''}
function blocked(n,mime){var e=ext(cleanName(n));if(BLOCK.indexOf(e)>=0)return true;return !!(mime&&BAD_MIME.test(String(mime)))&&!SAFE[e]}
function mimeOf(n){return SAFE[ext(n)]||'application/octet-stream'}
function size(b){b=Number(b)||0;if(b<1024)return b+' B';if(b<1024*1024)return (b/1024).toFixed(b<10240?1:0).replace('.',',')+' KB';return (b/1048576).toFixed(1).replace('.',',')+' MB'}
function kind(n){var e=ext(n);if(e==='pdf')return 'pdf';if(/^(xls|xlsx|ods|csv)$/.test(e))return 'planilha';if(/^(doc|docx|odt|rtf)$/.test(e))return 'documento';if(/^(txt|json)$/.test(e))return 'texto';if(/^(ppt|pptx|odp)$/.test(e))return 'apresentação';if(/^(png|jpg|jpeg|gif|webp|heic)$/.test(e))return 'imagem';if(e==='zip')return 'compactado';return 'arquivo'}
var KLABEL={pdf:'PDF',planilha:'Planilha',documento:'Documento',texto:'Texto','apresentação':'Apresentação',imagem:'Imagem',compactado:'ZIP',arquivo:'Arquivo'};
function svg(p){return '<svg aria-hidden="true" focusable="false" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+p+'</svg>'}
var DOC='<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>';
var ICK={pdf:DOC+'<path d="M8.5 15.5h7M8.5 12.5h4"/>',planilha:DOC+'<path d="M8 12h8M8 15h8M11 10v8"/>',documento:DOC+'<path d="M8 12h8M8 15h8M8 18h5"/>',texto:DOC+'<path d="M8 13h8M8 16h6"/>','apresentação':DOC+'<rect x="8" y="11" width="8" height="6" rx="1"/>',imagem:DOC+'<circle cx="10" cy="12" r="1.5"/><path d="m16 18-3-3-4 3"/>',compactado:DOC+'<path d="M11 9h2M11 12h2M11 15h2"/>',arquivo:DOC};
function icon(n){return svg(ICK[kind(n)]||DOC)}
var CLIP='<svg aria-hidden="true" focusable="false" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21 11-8.6 8.6a5.5 5.5 0 0 1-7.8-7.8l9.2-9.2a3.7 3.7 0 0 1 5.2 5.2l-9.2 9.2a1.8 1.8 0 0 1-2.6-2.6l8.5-8.5"/></svg>';
/* confere o arquivo escolhido: devolve {ok:false, err} ou {ok:true, name, mime, size, bytes} */
async function read(file){if(!file)return {ok:false,err:'Nenhum arquivo escolhido.'};var name=cleanName(file.name);
  if(blocked(name,file.type))return {ok:false,err:'Por segurança o chat não envia este tipo de arquivo ('+(ext(name)?'.'+ext(name):'sem extensão conhecida')+'): programas, scripts e páginas (exe, bat, cmd, js, html, svg, msi, apk…) ficam de fora.'};
  if(!file.size)return {ok:false,err:'O arquivo "'+name+'" está vazio.'};
  if(file.size>MAX)return {ok:false,err:'O arquivo "'+name+'" tem '+size(file.size)+'. O limite do chat é 2 MB por arquivo.'};
  var buf;try{buf=new Uint8Array(await file.arrayBuffer())}catch(e){return {ok:false,err:'Não foi possível ler o arquivo.'}}
  if(buf.length>MAX)return {ok:false,err:'O limite do chat é 2 MB por arquivo.'};
  return {ok:true,name:name,mime:mimeOf(name),size:buf.length,bytes:buf}}
/* metadados vindos da rede (já decifrados): só aceita o que passa nas regras */
function okMeta(f){if(!f||typeof f!=='object'||typeof f.n!=='string'||!Number.isSafeInteger(f.s)||f.s<1||f.s>MAX)return null;var n=cleanName(f.n);return {n:n,s:f.s,m:mimeOf(n),blk:blocked(n,'')}}
/* baixa: Blob com o tipo seguro + atributo download; nada é aberto na página */
function save(bytes,name){name=cleanName(name);if(blocked(name,'')){notify('Este arquivo foi bloqueado por segurança.');return false}
  var url=URL.createObjectURL(new Blob([bytes],{type:mimeOf(name)})),a=document.createElement('a');a.href=url;a.download=name;a.rel='noopener';a.style.display='none';document.body.appendChild(a);a.click();
  setTimeout(function(){a.remove();URL.revokeObjectURL(url)},30000);window.__e99LastDownload={name:name,size:bytes.length,at:Date.now()};return true}
/* texto mostrado nos aparelhos anteriores à v155 (eles só leem o texto da mensagem) */
function fallback(name,sz){return 'Arquivo: '+cleanName(name)+' ('+size(sz)+'). Atualize o Stok para baixar.'}
function label(name,sz){return KLABEL[kind(name)]+' · '+size(sz)}
window.e99Arq={MAX:MAX,BLOCK:BLOCK.slice(),read:read,okMeta:okMeta,save:save,size:size,kind:kind,label:label,icon:icon,clip:CLIP,cleanName:cleanName,blocked:blocked,mimeOf:mimeOf,fallback:fallback,ext:ext};
})();
