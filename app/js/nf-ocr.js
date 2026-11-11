
(function(){
'use strict';
/* Leitura de print de NFs pendentes: interpretação do texto lido (sem dependências). */
var NFOCR_STRONG=['LTDA','LTD','LT','ME','EPP','EIRELI','S/A','IND','COM','EMB','BRAS','DISTR','INDUSTRIA','INDUSTRIAL','INDUSTRIAS','COMERCIO','COMERCIAL','DISTRIBUIDORA','DISTRIBUICAO','DISTRIBUIDOR','IMPORTACAO','EXPORTACAO','IMPORTADORA','EXPORTADORA','ALIMENTOS','PRODUTOS','BRASIL','TEXTIL','PLASTICOS','PLASTICO','EMBALAGENS','EMBALAGEM','AMAZONIA','NORDESTE','UTILIDADES','MOVEIS','METALURGICA','QUIMICA','PAPEL','PAPELARIA','BRINQUEDOS','CONFECCOES','CALCADOS','ELETRONICOS','COSMETICOS','HIGIENE','LIMPEZA','ATACADO','ATACADISTA','VAREJO','LOGISTICA','TRANSPORTES','SERVICOS','SOLUCOES','PARTICIPACOES','GRUPO','FABRICA','ARTEFATOS','UTENSILIOS','DECORACAO','VIDROS','CRISTAIS','FERRAMENTAS','COMPANHIA','CIA','BRASILEIRA','BRASILEIRO','BRASILEIRAS','NACIONAL','INTERNACIONAL','PAULISTA','MINEIRA','CATARINENSE','GAUCHA','NORTE','SUL','CENTRO','OESTE','INDUSTRIAS','COMERCIAIS','EMPREENDIMENTOS','REPRESENTACOES','EQUIPAMENTOS','ACESSORIOS','MATERIAIS','SUPRIMENTOS','ELETRICOS','METAIS','MADEIRAS','TECIDOS','UTILIDADE'];
var NFOCR_SHORT=['E','DE','DO','DA','DOS','DAS'];
var NFOCR_ABBR=['IND','COM','EMB','BRAS','DISTR','LT','LTD','ME','EPP','CIA'];
function nfocrSegment(token){
  var t=token.toUpperCase();
  if(t.length<6||NFOCR_STRONG.indexOf(t)>=0)return token;
  var memo={};
  function best(i){
    if(i===t.length)return {cost:0,pieces:[]};
    if(memo[i])return memo[i];
    var out=null;
    for(var j=i+1;j<=t.length;j++){
      var piece=t.slice(i,j),rest=best(j);if(!rest)continue;
      var type=NFOCR_STRONG.indexOf(piece)>=0?'strong':NFOCR_SHORT.indexOf(piece)>=0?'short':'unknown',cost;
      if(type==='strong')cost=NFOCR_ABBR.indexOf(piece)>=0?4.5:0;
      else if(type==='short'){if(!rest.pieces.length||rest.pieces[0].type!=='strong')continue;cost=0.5}
      else{if(piece.length<2)continue;if(rest.pieces.length&&rest.pieces[0].type==='unknown')continue;cost=piece.length+2}
      var total=cost+rest.cost;
      if(!out||total<out.cost)out={cost:total,pieces:[{text:piece,type:type}].concat(rest.pieces)};
    }
    memo[i]=out;return out;
  }
  var r=best(0);if(!r||r.pieces.length<2)return token;
  var strong=r.pieces.some(function(p){return p.type==='strong'&&p.text.length>=2});
  var unknown=r.pieces.filter(function(p){return p.type==='unknown'}).reduce(function(a,p){return a+p.text.length},0);
  if(!strong||unknown/t.length>0.7)return token;
  return r.pieces.map(function(p){return p.text}).join(' ');
}
function nfocrCompact(s){return String(s||'').toUpperCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^A-Z0-9]/g,'')}
function nfocrCleanSupplier(raw,known){
  var s=String(raw||'').toUpperCase().replace(/[|—–_]+/g,' ').replace(/\s+/g,' ').replace(/^[^A-Z0-9À-Ú]+|[^A-Z0-9À-Ú.)]+$/g,'').trim();
  var c=nfocrCompact(s);
  if(known&&known[c])return known[c];
  return s.split(' ').map(nfocrSegment).join(' ').replace(/\s+/g,' ').trim();
}
function nfocrParse(text,known){
  var rows=[];
  String(text||'').split(/\r?\n/).forEach(function(raw){
    var line=raw.replace(/[|—–_]+/g,' ').replace(/\s+/g,' ').trim();
    var m=line.match(/^\D{0,3}(\d{1,3}(?:[.,]\d{3})+|\d{2,9})\s+(.+?)\s+(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/);
    if(!m)return;
    var y=m[5].length===2?'20'+m[5]:m[5],d=('0'+m[3]).slice(-2),mo=('0'+m[4]).slice(-2);
    var okDate=+d>=1&&+d<=31&&+mo>=1&&+mo<=12&&+y>=2000&&+y<=2100;
    rows.push({number:m[1].replace(/,/g,'.'),digits:m[1].replace(/\D/g,''),supplier:nfocrCleanSupplier(m[2],known),date:okDate?y+'-'+mo+'-'+d:'',raw:line});
  });
  return rows;
}


var worker=null,workerPromise=null,items=[],onProgress=null,lastText='';
function abs(p){return new URL(p,location.href).href}
function loadScript(src){return new Promise(function(res,rej){var s=document.createElement('script');s.src=src;s.onload=res;s.onerror=function(){rej(new Error('Não foi possível carregar o leitor. Verifique a internet na primeira vez.'))};document.head.appendChild(s)})}
function getWorker(){
  if(worker)return Promise.resolve(worker);
  if(!workerPromise){
    workerPromise=(window.Tesseract?Promise.resolve():loadScript(abs('vendor/tesseract/tesseract.min.js'))).then(function(){
      return Tesseract.createWorker('por',1,{workerPath:abs('vendor/tesseract/worker.min.js'),corePath:abs('vendor/tesseract/core'),langPath:abs('vendor/tesseract/lang'),gzip:true,logger:function(m){if(onProgress)onProgress(m)}});
    }).then(function(w){worker=w;return w.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'}).then(function(){return w})}).catch(function(e){workerPromise=null;throw e});
  }
  return workerPromise;
}
function prepareImage(file){
  return new Promise(function(res,rej){
    var url=URL.createObjectURL(file),im=new Image();
    im.onload=function(){
      URL.revokeObjectURL(url);
      var scale=Math.min(3,Math.max(1,Math.round(800/im.width)));if(im.width*scale>3000)scale=3000/im.width;
      var c=document.createElement('canvas');c.width=Math.max(1,Math.round(im.width*scale));c.height=Math.max(1,Math.round(im.height*scale));
      var x=c.getContext('2d');x.imageSmoothingEnabled=true;x.imageSmoothingQuality='high';x.drawImage(im,0,0,c.width,c.height);
      var d=x.getImageData(0,0,c.width,c.height),a=d.data;
      for(var i=0;i<a.length;i+=4){var g=0.299*a[i]+0.587*a[i+1]+0.114*a[i+2];g=Math.max(0,Math.min(255,(g-128)*1.6+150));a[i]=a[i+1]=a[i+2]=g}
      x.putImageData(d,0,0);res(c);
    };
    im.onerror=function(){URL.revokeObjectURL(url);rej(new Error('Não consegui abrir a imagem. Use um print em JPG ou PNG.'))};
    im.src=url;
  });
}
function knownSuppliers(){var k={};state.nfs.forEach(function(n){if(n.supplier){var c=nfocrCompact(n.supplier);if(c&&!k[c])k[c]=n.supplier}});return k}
function existingDigits(){var set={};state.nfs.forEach(function(n){var d=String(n.number||'').replace(/\D/g,'').replace(/^0+/,'');if(d)set[d]=true});return set}
function dialog(){
  var d=document.getElementById('nfocr-dialog');if(d)return d;
  d=document.createElement('dialog');d.id='nfocr-dialog';d.setAttribute('aria-labelledby','nfocr-title');
  d.innerHTML='<div class="nfocr-body"><h2 id="nfocr-title">Ler print de NFs pendentes</h2><p class="nfocr-status" id="nfocr-status" role="status"></p><div class="nfocr-bar" id="nfocr-bar"><i></i></div><div id="nfocr-content"></div><div class="nfocr-actions"><button type="button" onclick="document.getElementById(\'nfocr-dialog\').close()">Fechar</button></div></div>';
  document.body.appendChild(d);return d;
}
function setStatus(text,pct){var s=document.getElementById('nfocr-status'),b=document.getElementById('nfocr-bar');if(s)s.textContent=text;if(b){b.style.display=pct==null?'none':'block';b.firstChild.style.width=(pct||0)+'%'}}
function renderReview(){
  var box=document.getElementById('nfocr-content');
  if(!items.length){
    box.innerHTML='<p>Não encontrei linhas no formato <b>Número da NF · Fornecedor · Data</b>. Tente um print mais nítido, mostrando só a tabela.</p>'+(lastText?'<details class="nfocr-raw"><summary>Ver o texto lido</summary><pre>'+esc(lastText)+'</pre></details>':'')+'<div class="nfocr-actions"><button type="button" class="primary" onclick="openNFPhotoImport()">Escolher outro print</button></div>';
    return;
  }
  var sel=items.filter(function(r){return r.selected}).length;
  box.innerHTML='<p class="small">Confira e corrija antes de adicionar. As notas entram como <b>Pendentes</b>, com a data de chegada lida.</p><table class="nfocr-table"><thead><tr><th></th><th>Nº da NF</th><th>Fornecedor</th><th>Chegada</th></tr></thead><tbody>'+items.map(function(r,i){
    var flag=r.duplicate?'<span class="nfocr-flag warn">Já cadastrada — desmarcada</span>':(!r.date?'<span class="nfocr-flag warn">Data não lida — preencha</span>':'');
    return '<tr><td class="nfocr-check"><input type="checkbox" aria-label="Incluir NF '+esc(r.number)+'" '+(r.selected?'checked':'')+' onchange="nfocrToggle('+i+',this.checked)"></td><td><input type="text" inputmode="numeric" aria-label="Número da NF" value="'+esc(r.number)+'" onchange="nfocrEdit('+i+',\'number\',this.value)">'+flag+'</td><td><input type="text" aria-label="Fornecedor" value="'+esc(r.supplier)+'" onchange="nfocrEdit('+i+',\'supplier\',this.value)"></td><td><input type="date" aria-label="Data de chegada" value="'+esc(r.date)+'" onchange="nfocrEdit('+i+',\'date\',this.value)"></td></tr>';
  }).join('')+'</tbody></table><div class="nfocr-actions"><button type="button" class="primary" id="nfocr-add" onclick="nfocrAdd()" '+(sel?'':'disabled')+'>Adicionar '+sel+' nota(s)</button><button type="button" onclick="openNFPhotoImport()">Ler outro print</button></div>'+(lastText?'<details class="nfocr-raw"><summary>Ver o texto lido</summary><pre>'+esc(lastText)+'</pre></details>':'');
}
window.nfocrToggle=function(i,v){if(items[i]){items[i].selected=v;var sel=items.filter(function(r){return r.selected}).length,b=document.getElementById('nfocr-add');if(b){b.disabled=!sel;b.textContent='Adicionar '+sel+' nota(s)'}}};
window.nfocrEdit=function(i,k,v){if(!items[i])return;items[i][k]=String(v).trim();if(k==='number'){items[i].digits=items[i].number.replace(/\D/g,'')}};
async function runFile(file){
  var d=dialog();if(!d.open)d.showModal();
  items=[];lastText='';document.getElementById('nfocr-content').innerHTML='';
  try{
    setStatus('Preparando o leitor… Na primeira vez ele baixa cerca de 5 MB.',5);
    onProgress=function(m){if(m&&m.status==='recognizing text')setStatus('Lendo o print… '+Math.round((m.progress||0)*100)+'%',Math.round(20+(m.progress||0)*80));else if(m&&m.status)setStatus('Preparando o leitor… '+Math.round((m.progress||0)*100)+'%',Math.round((m.progress||0)*20))};
    var w=await getWorker();
    var canvas=await prepareImage(file);
    var r=await w.recognize(canvas);
    lastText=r.data.text||'';
    var have=existingDigits(),seen={};
    items=nfocrParse(lastText,knownSuppliers()).map(function(row){
      var key=row.digits.replace(/^0+/,''),dup=!!have[key]||!!seen[key];seen[key]=true;
      return {number:row.number,digits:row.digits,supplier:row.supplier,date:row.date,duplicate:dup,selected:!dup&&!!row.date};
    });
    setStatus(items.length?items.length+' linha(s) encontrada(s).':'Nada encontrado.',null);
  }catch(e){setStatus(e.message||'Falha ao ler o print.',null)}
  finally{onProgress=null}
  renderReview();
}
window.nfocrAdd=async function(){
  var chosen=items.filter(function(r){return r.selected});
  var errs=[];
  var fresh=chosen.map(function(r,idx){
    var digits=String(r.number||'').replace(/\D/g,'');
    if(!digits)errs.push('Linha '+(idx+1)+': número da NF vazio.');
    if(!String(r.supplier||'').trim())errs.push('NF '+r.number+': fornecedor vazio.');
    if(!validDate(r.date))errs.push('NF '+r.number+': data de chegada inválida.');
    return {id:uid(),number:digits,supplier:String(r.supplier||'').trim().slice(0,200),date:r.date,arrivalTime:'',volumes:0,owner:'',status:'Pendente',notes:'Importada de print em '+date(iso())+'.',accessKey:'',series:'',cnpj:'',emissionMonth:'',issuerUF:''};
  });
  if(errs.length){notify(errs[0]);return}
  try{validate(JSON.parse(JSON.stringify(Object.assign({},state,{nfs:state.nfs.concat(fresh)}))))}catch(e){notify('Alguma linha tem dados inválidos. Confira número, fornecedor e data.');return}
  fresh.forEach(function(n){state.nfs.push(n)});
  await save();
  document.getElementById('nfocr-dialog').close();
  nfQuery='';nfStatusFilter='';
  go('nfs');
  notify(fresh.length+' nota(s) adicionada(s) como Pendentes.');
};
window.openNFPhotoImport=function(){
  if(!authSession)return;
  if(location.protocol==='file:'){notify('Para ler prints, abra o site pelo endereço https (o arquivo local não permite o leitor).');return}
  var input=document.createElement('input');input.type='file';input.accept='image/*';input.style.display='none';
  input.onchange=function(){var f=input.files&&input.files[0];input.remove();if(f)runFile(f)};
  document.body.appendChild(input);input.click();
};
})();
