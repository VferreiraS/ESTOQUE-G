
(function(){
'use strict';
/* Importa o mapa de corredores de uma planilha Excel (.xlsx) ou CSV, direto no aparelho (nada é enviado). */
function e(s){return esc(String(s==null?'':s))}
/* ---------- leitor mínimo de .xlsx (zip + XML) ---------- */
function u16(b,o){return b[o]|b[o+1]<<8}function u32(b,o){return (b[o]|b[o+1]<<8|b[o+2]<<16|b[o+3]<<24)>>>0}
async function inflateRaw(bytes){if(typeof DecompressionStream!=='function')throw Error('Este navegador não abre arquivos Excel. Atualize o navegador ou salve a planilha como CSV.');
  var ds=new DecompressionStream('deflate-raw');var out=new Response(new Blob([bytes]).stream().pipeThrough(ds));return new Uint8Array(await out.arrayBuffer())}
function key(n){return String(n).replace(/\\/g,'/').replace(/^\//,'').toLowerCase()}
async function unzip(buf){var b=new Uint8Array(buf),eocd=-1;for(var i=b.length-22;i>=Math.max(0,b.length-65557);i--){if(u32(b,i)===0x06054b50){eocd=i;break}}
  if(eocd<0)throw Error('Arquivo não é uma planilha .xlsx válida.');var n=u16(b,eocd+10),p=u32(b,eocd+16),files={};
  for(var k=0;k<n&&p+46<=b.length;k++){if(u32(b,p)!==0x02014b50)break;var method=u16(b,p+10),csize=u32(b,p+20),nlen=u16(b,p+28),xlen=u16(b,p+30),clen=u16(b,p+32),off=u32(b,p+42);
    var name=new TextDecoder().decode(b.subarray(p+46,p+46+nlen));files[key(name)]={method:method,csize:csize,off:off};p+=46+nlen+xlen+clen}
  return {names:Object.keys(files),read:async function(name){var f=files[key(name)];if(!f)return null;if(u32(b,f.off)!==0x04034b50)throw Error('Planilha danificada.');var start=f.off+30+u16(b,f.off+26)+u16(b,f.off+28);var data=b.subarray(start,start+f.csize);
    var raw=f.method===0?data:f.method===8?await inflateRaw(data):null;if(!raw)throw Error('Compressão da planilha não suportada.');return new TextDecoder().decode(raw)}}}
function xml(t){return new DOMParser().parseFromString(t,'application/xml')}
function kids(node,name){return Array.prototype.filter.call(node.getElementsByTagName('*'),function(x){return x.localName===name})}
function unx(s){return String(s).replace(/_x([0-9A-Fa-f]{4})_/g,function(m,h){return String.fromCharCode(parseInt(h,16))})}
/* texto de uma célula/string, sem a leitura fonética (<rPh>) que o Excel guarda para nomes digitados em japonês/chinês */
function rst(n){return unx(kids(n,'t').filter(function(t){return !t.parentNode||t.parentNode.localName!=='rPh'}).map(function(t){return t.textContent}).join(''))}
function colIndex(ref){var m=/^([A-Z]+)/i.exec(ref||'');if(!m)return -1;var s=m[1].toUpperCase(),n=0;for(var i=0;i<s.length;i++)n=n*26+(s.charCodeAt(i)-64);return n-1}
async function readXlsx(buf){var z=await unzip(buf);var shared=[];var ss=await z.read('xl/sharedStrings.xml');if(ss)kids(xml(ss),'si').forEach(function(si){shared.push(rst(si))});
  var paths=[];try{var wb=xml(await z.read('xl/workbook.xml'));var rels=await z.read('xl/_rels/workbook.xml.rels');var rl=rels?kids(xml(rels),'Relationship'):[];
    kids(wb,'sheet').forEach(function(sh){var rid=sh.getAttribute('r:id')||Array.prototype.map.call(sh.attributes,function(a){return a.localName==='id'?a.value:''}).join('');var rel=rl.find(function(r){return r.getAttribute('Id')===rid});if(rel){var t=rel.getAttribute('Target');paths.push(/^\//.test(t)?t.slice(1):'xl/'+t.replace(/^\.\//,''))}})}catch(x){}
  z.names.filter(function(n){return /^xl\/worksheets\/[^/]+\.xml$/.test(n)}).sort().forEach(function(n){if(!paths.some(function(p){return key(p)===n}))paths.push(n)});
  if(!paths.length)throw Error('A planilha não tem abas.');var first=null;
  for(var i=0;i<paths.length;i++){var txt=await z.read(paths[i]);if(!txt)continue;var doc=xml(txt),rows=[];
    kids(doc,'row').forEach(function(r){var out=[];kids(r,'c').forEach(function(c,ci0){var ci=colIndex(c.getAttribute('r'));if(ci<0)ci=out.length;var t=c.getAttribute('t'),v=kids(c,'v')[0],val='';
      if(t==='s')val=v?shared[+v.textContent]||'':'';else if(t==='inlineStr')val=rst(c);else val=v?unx(v.textContent):'';out[ci]=String(val)});rows.push(out)});
    if(!first)first=rows;try{parseMap(rows);return rows}catch(x){}}
  return first||[]}
function decodeText(buf){try{return new TextDecoder('utf-8',{fatal:true}).decode(buf)}catch(x){return new TextDecoder('windows-1252').decode(buf)}}
function readCsv(text){text=String(text).replace(/^﻿/,'');var ls=text.split(/\r\n|\r|\n/),hl=ls.find(function(l){return /corredor/i.test(l)&&/setor/i.test(l)})||ls[0]||'';var sep=hl.split(';').length>hl.split(',').length?';':hl.split('\t').length>hl.split(',').length?'\t':',';
  var rows=[],row=[],cur='',q=false;function end(){row.push(cur);cur='';if(row.join('').trim())rows.push(row);row=[]}
  for(var i=0;i<text.length;i++){var ch=text[i];if(q){if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++}else q=false}else cur+=ch}else if(ch==='"')q=true;else if(ch===sep){row.push(cur);cur=''}else if(ch==='\r'||ch==='\n'){if(ch==='\r'&&text[i+1]==='\n')i++;end()}else cur+=ch}end();return rows}
/* ---------- interpretar o mapa ---------- */
function parseMap(rows){var h=-1,cc=-1,cs=-1,co=-1;for(var i=0;i<Math.min(rows.length,30)&&h<0;i++){var r=(rows[i]||[]).map(function(x){return normalText(x)});var a=r.findIndex(function(x){return /^corredor/.test(x)}),s=r.findIndex(function(x){return /^setor/.test(x)}),o=r.findIndex(function(x){return /^respons/.test(x)});if(a>=0&&s>=0){h=i;cc=a;cs=s;co=o}}
  if(h<0)throw Error('Não achei as colunas "Corredor" e "Setor" na planilha.');var out=[],seen={};
  for(var j=h+1;j<rows.length;j++){var r2=rows[j]||[];var num=String(r2[cc]==null?'':r2[cc]).replace(/\s+/g,' ').trim().replace(/^corredor\s*/i,''),sec=String(r2[cs]==null?'':r2[cs]).replace(/\s+/g,' ').trim();if(!num||!sec)continue;
    num=num.replace(/^(\d+)\.0+$/,'$1');if(/^\d{1,3}$/.test(num))num=String(+num).padStart(2,'0');else if(!(/^[A-Za-z0-9 ._-]{1,20}$/.test(num)&&/\d/.test(num)))continue;
    var k=/^\d+$/.test(num)?String(+num):normalText(num);if(seen[k])throw Error('O corredor '+num+' aparece duas vezes na planilha.');seen[k]=1;
    out.push({number:num.slice(0,20),sector:sec.slice(0,120),who:co>=0?String(r2[co]==null?'':r2[co]).replace(/\s+/g,' ').trim().slice(0,80):null})}
  if(!out.length)throw Error('Nenhum corredor encontrado abaixo do cabeçalho.');return out}
function matchOwner(who,team){var base=who.replace(/\s*\(.*\)\s*$/,'').trim();var n=normalText(base||who.replace(/[()]/g,''));
  if(!n||/^(a definir|sem responsavel|vago|livre|nenhum|-|—)$/.test(n))return {id:''};if(/^todos\b/.test(n))return {id:'todos'};
  var exact=team.filter(function(p){return normalText(p.name)===n});if(exact.length===1)return {id:exact[0].id};
  var tk=n.split(' '),byFirst=team.filter(function(p){var t=normalText(p.name).split(' ');return (t.length===1||tk.length===1)&&t[0]===tk[0]});if(byFirst.length===1)return {id:byFirst[0].id};
  return base?{id:null,newName:base}:{id:''}}
var draft=null;
function plan(map){var team=state.team.slice(),created={},rows=[],used=[];
  map.forEach(function(m){var cur=state.corridors.find(function(c){return normalText(c.number)===normalText(m.number)})||state.corridors.find(function(c){return /^\d+$/.test(c.number)&&/^\d+$/.test(m.number)&&+c.number===+m.number});
    if(cur&&used.indexOf(cur)>=0)throw Error('Duas linhas da planilha correspondem ao corredor '+cur.number+'.');if(cur)used.push(cur);
    var o=m.who===null?{id:cur?cur.owner:''}:matchOwner(m.who,team);
    if(o.id===null){var k=normalText(o.newName);if(!created[k]){created[k]={id:uid(),name:o.newName.slice(0,60),role:'Auxiliar de estoque'};team.push(created[k])}o={id:created[k].id}}
    rows.push({cur:cur,number:m.number,sector:m.sector,owner:o.id})});
  var keep=state.corridors.filter(function(c){return used.indexOf(c)<0});
  return {rows:rows,newPeople:Object.keys(created).map(function(k){return created[k]}),team:team,keep:keep,ownerless:map.every(function(m){return m.who===null})}}
function nameOf(id,team){return id==='todos'?'TODOS':id?((team.find(function(p){return p.id===id})||{}).name||'?'):'A definir'}
function show(){var d=document.getElementById('cor-import');if(!d){d=document.createElement('dialog');d.id='cor-import';d.setAttribute('aria-labelledby','ci-title');document.body.appendChild(d)}
  var p=draft,changed=0,added=0;var body=p.rows.map(function(r){var isNew=!r.cur,ch=isNew||r.cur.sector!==r.sector||r.cur.owner!==r.owner||r.cur.number!==r.number;if(isNew)added++;else if(ch)changed++;
    var num=!isNew&&r.cur.number!==r.number?'<span class="ci-arrow">'+e(r.cur.number)+' → </span>'+e(r.number):e(r.number);
    var sec=!isNew&&r.cur.sector!==r.sector?'<span class="ci-arrow">'+e(r.cur.sector)+' → </span>'+e(r.sector):e(r.sector);var own=!isNew&&r.cur.owner!==r.owner?'<span class="ci-arrow">'+e(nameOf(r.cur.owner,p.team))+' → </span>'+e(nameOf(r.owner,p.team)):e(nameOf(r.owner,p.team));
    return '<tr class="'+(ch?'ci-change':'')+'"><td>'+num+(isNew?'<span class="ci-tag">novo</span>':'')+'</td><td>'+sec+'</td><td>'+own+'</td></tr>'}).join('');
  d.innerHTML='<div class="ci-body"><div class="rup-head" style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2 id="ci-title">Importar mapa de corredores</h2><button type="button" aria-label="Fechar" onclick="document.getElementById(\'cor-import\').close()" style="min-width:44px;min-height:44px">×</button></div>'
   +'<p class="small" style="margin:0">'+p.rows.length+' corredores na planilha · <b>'+changed+' mudam</b> · '+added+' novos · '+(p.rows.length-changed-added)+' iguais.</p>'
   +(p.ownerless?'<div class="ci-warn">A planilha não tem a coluna "Responsável": os responsáveis atuais são mantidos.</div>':'')
   +(p.newPeople.length?'<div class="ci-warn">Pessoa(s) que não estão na Equipe e serão cadastradas: <b>'+p.newPeople.map(function(x){return e(x.name)}).join(', ')+'</b>.</div>':'')
   +(p.keep.length?'<div class="ci-warn">Corredores que não estão na planilha continuam como estão: '+p.keep.map(function(c){return e(c.number+' · '+c.sector)}).join('; ')+'.</div>':'')
   +'<div class="tablewrap"><table><thead><tr><th>Corredor</th><th>Setor</th><th>Responsável</th></tr></thead><tbody>'+body+'</tbody></table></div>'
   +'<div class="ci-foot"><button type="button" onclick="document.getElementById(\'cor-import\').close()">Cancelar</button><button type="button" class="primary" id="ci-apply" onclick="corridorImportApply()" '+(changed+added+p.newPeople.length?'':'disabled')+'>'+(changed+added?'Aplicar mapa':'Nada para mudar')+'</button></div></div>';
  if(!d.open)d.showModal()}
window.corridorImportPick=function(){var i=document.createElement('input');i.type='file';i.accept='.xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv';i.onchange=function(){if(i.files&&i.files[0])corridorImportFile(i.files[0])};i.click()};
window.corridorImportFile=async function(file){try{if(file.size>5*1024*1024)throw Error('Planilha grande demais (máximo 5 MB).');var buf=await file.arrayBuffer();var isZip=new Uint8Array(buf.slice(0,2))[0]===0x50&&new Uint8Array(buf.slice(0,2))[1]===0x4B;
    var rows=isZip?await readXlsx(buf):(/\.csv$/i.test(file.name)||/csv|text/.test(file.type)?readCsv(decodeText(buf)):await readXlsx(buf));draft=plan(parseMap(rows));show()}
  catch(x){notify(x.message||'Não foi possível ler a planilha.')}};
window.corridorImportApply=async function(){if(!draft)return;var p=draft;draft=null;var bak=JSON.stringify({team:state.team,corridors:state.corridors});
  p.newPeople.forEach(function(x){if(!state.team.some(function(t){return t.id===x.id}))state.team.push(x)});
  p.rows.forEach(function(r){if(r.cur){var c=state.corridors.find(function(x){return x.id===r.cur.id});if(c){c.sector=r.sector;c.owner=r.owner;c.number=r.number}}else state.corridors.push({id:uid(),number:r.number,sector:r.sector,owner:r.owner})});
  var nums={},dup=state.corridors.some(function(c){var k=/^\d+$/.test(c.number)?String(+c.number):normalText(c.number);if(nums[k])return true;nums[k]=1;return false});
  try{if(dup)throw Error('dup');validate(JSON.parse(JSON.stringify(state)))}catch(x){var o=JSON.parse(bak);state.team=o.team;state.corridors=o.corridors;var d0=document.getElementById('cor-import');if(d0&&d0.open)d0.close();notify(dup?'O mapa deixaria dois corredores com o mesmo número. Nada foi alterado.':'A equipe mudou enquanto a prévia estava aberta. Nada foi alterado; importe a planilha de novo.');render();return}
  await save();var d=document.getElementById('cor-import');if(d&&d.open)d.close();if(page!=='corridors')go('corridors');else render();notify('Mapa de corredores aplicado.')};
})();
