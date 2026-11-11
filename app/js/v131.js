
/* v131 · (A) Excel .xlsx mínimo feito aqui (zip sem compressão + planilha com texto embutido), sem biblioteca e sem rede.
   (B) "Importar XML da nota": um ou vários XML de NF-e; cada um abre o editor já preenchido para conferir e salvar (nada é salvo sozinho). */
(function(){'use strict';var D=document;
var CRC=(function(){var t=new Uint32Array(256);for(var n=0;n<256;n++){var c=n;for(var k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return t})();
function crc32(b){var c=0xFFFFFFFF;for(var i=0;i<b.length;i++)c=CRC[(c^b[i])&255]^(c>>>8);return (c^0xFFFFFFFF)>>>0}
function zip(files){var enc=new TextEncoder(),parts=[],cen=[],off=0,i;
  function h16(a,v){a.push(v&255,(v>>>8)&255)}function h32(a,v){a.push(v&255,(v>>>8)&255,(v>>>16)&255,(v>>>24)&255)}
  for(i=0;i<files.length;i++){var name=enc.encode(files[i][0]),data=enc.encode(files[i][1]),crc=crc32(data),L=[];
    h32(L,0x04034b50);h16(L,20);h16(L,0x0800);h16(L,0);h16(L,0);h16(L,0x21);h32(L,crc);h32(L,data.length);h32(L,data.length);h16(L,name.length);h16(L,0);
    parts.push(new Uint8Array(L),name,data);
    var C=[];h32(C,0x02014b50);h16(C,20);h16(C,20);h16(C,0x0800);h16(C,0);h16(C,0);h16(C,0x21);h32(C,crc);h32(C,data.length);h32(C,data.length);h16(C,name.length);h16(C,0);h16(C,0);h16(C,0);h16(C,0);h32(C,0);h32(C,off);
    cen.push(new Uint8Array(C),name);off+=L.length+name.length+data.length}
  var csize=cen.reduce(function(s,x){return s+x.length},0),E=[];h32(E,0x06054b50);h16(E,0);h16(E,0);h16(E,files.length);h16(E,files.length);h32(E,csize);h32(E,off);h16(E,0);
  return new Blob(parts.concat(cen,[new Uint8Array(E)]),{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'})}
function x(s){return String(s==null?'':s).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g,'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function col(n){var s='';n++;while(n>0){var m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26)}return s}
window.e99Xlsx=function(rows,sheet){sheet=x(String(sheet||'Planilha').replace(/[\\\/?*\[\]:]/g,' ').slice(0,31))||'Planilha';var body='',w=[];
  (rows||[]).forEach(function(r,i){var cells='';(r||[]).forEach(function(v,j){var ref=col(j)+(i+1),t=String(v==null?'':v);w[j]=Math.max(w[j]||8,Math.min(60,t.length+2));if(v==null||t==='')return;
    if(typeof v==='number'&&isFinite(v))cells+='<c r="'+ref+'"'+(i===0?' s="1"':'')+'><v>'+v+'</v></c>';else cells+='<c r="'+ref+'" t="inlineStr"'+(i===0?' s="1"':'')+'><is><t xml:space="preserve">'+x(t)+'</t></is></c>'});
    body+='<row r="'+(i+1)+'">'+cells+'</row>'});
  var cols=w.length?'<cols>'+w.map(function(n,j){return '<col min="'+(j+1)+'" max="'+(j+1)+'" width="'+(n||8)+'" customWidth="1"/>'}).join('')+'</cols>':'';
  var X='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  return zip([['[Content_Types].xml',X+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
    ['_rels/.rels',X+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml',X+'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="'+sheet+'" sheetId="1" r:id="rId1"/></sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels',X+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ['xl/styles.xml',X+'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>'],
    ['xl/worksheets/sheet1.xml',X+'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'+cols+'<sheetData>'+body+'</sheetData></worksheet>']])};

/* ---------- (B) importar um ou vários XML ---------- */
var queue=[],total=0,errs=[],busy=false,MAX=2*1024*1024,MAXF=50;
function msg(){var s=D.getElementById('nf-xml-status');if(!s)return;var pos=total>1?'XML '+(total-queue.length)+' de '+total+'. ':'';
  s.textContent=pos+'Dados preenchidos pelo XML. Confira e toque em Salvar.'+(queue.length?' Ao fechar esta janela abre o próximo XML.':'')+(errs.length?' Não importados: '+errs.join(' · '):'')}
function next(){if(!queue.length||!authSession)return;var d=queue.shift();try{openEditor('nf');var f=D.getElementById('editor');if(!f||!f.elements.namedItem('emissionDate'))return;nfFillFromXml(d);msg();window.__e99XmlOpen=(window.__e99XmlOpen||0)+1}catch(e){notify(e.message||'Falha ao abrir o XML.')}}
async function files(list){if(busy||!authSession)return;busy=true;queue=[];errs=[];total=0;window.__e99XmlErrs=errs;
  try{var arr=Array.prototype.slice.call(list||[],0,MAXF),seen=[];if((list||[]).length>MAXF)errs.push('só os '+MAXF+' primeiros arquivos foram lidos');
    for(var i=0;i<arr.length;i++){var f=arr[i],nm=String(f.name||'arquivo').slice(0,60);
      try{if(f.size>MAX)throw Error('maior que 2 MB');var d=nfParseXML(await readTextFile(f));var dup=nfDupOf(d,null);
        if(dup)throw Error('nota já cadastrada (NF '+dup.number+(dup.supplier?' · '+dup.supplier:'')+')');
        if(seen.some(function(s){return s.accessKey===d.accessKey}))throw Error('repetido na seleção');seen.push(d);queue.push(d)}
      catch(e){errs.push(nm+': '+String(e&&e.message||'XML inválido').replace(/\.$/,''))}}
    total=queue.length;
    if(!total){notify(errs.length===1?'XML não importado. '+errs[0]+'.':'Nenhum XML importado. '+errs.join(' · '));return}
    next()}finally{busy=false}}
window.e99NfXmlPick=function(){if(!authSession)return;var i=D.getElementById('nf-xml-multi');if(!i){i=D.createElement('input');i.type='file';i.id='nf-xml-multi';i.multiple=true;i.accept='.xml,text/xml,application/xml';i.hidden=true;i.setAttribute('aria-hidden','true');
  i.addEventListener('change',function(){var l=i.files;files(l).finally(function(){i.value=''})});D.body.appendChild(i)}i.click()};
window.e99NfXmlFiles=files;
var md=D.getElementById('modal');if(md)md.addEventListener('close',function(){if(queue.length)setTimeout(next,250)});
})();
