
(function(){
'use strict';
var KINDS={
  nfs:{title:'Notas fiscais',groups:true,labels:{pending:'Pendentes',done:'Conferidas',all:'Todas'}},
  tasks:{title:'Tarefas',groups:true,labels:{pending:'Pendentes',done:'Concluídas',all:'Todas'}},
  agenda:{title:'Agenda',groups:true,labels:{pending:'Pendentes',done:'Concluídas',all:'Todas'}},
  team:{title:'Equipe',groups:true,labels:{pending:'Com pendências',done:'Com concluídas',all:'Todas'}},
  corridors:{title:'Corredores',groups:true,labels:{pending:'Com pendências',done:'Concluídos',all:'Todos'}},
  plans:{title:'Planos de ação',groups:false,labels:{all:'Todos'}}
};
var report={kind:null,group:'pending',data:null};

function tasksInGroup(list,group){
  if(group==='pending')return list.filter(function(t){return t.status!=='Concluído'});
  if(group==='done')return list.filter(function(t){return t.status==='Concluído'});
  return list.slice();
}
function nfsInGroup(list,group){
  if(group==='pending')return list.filter(function(n){return n.status!=='Conferido'});
  if(group==='done')return list.filter(function(n){return n.status==='Conferido'});
  return list.slice();
}
function countsFor(kind){
  var groups=KINDS[kind].labels,out={};
  Object.keys(groups).forEach(function(g){out[g]=buildRows(kind,g).rows.length});
  return out;
}
function buildRows(kind,group){
  var headers,rows=[],extra='';
  if(kind==='nfs'){
    headers=['NF','Fornecedor','Chegada','Volumes','Responsável','Status','Conferência'];
    nfsInGroup(matchingNFs(),group).forEach(function(n){
      var s=receiptSummary(n);
      rows.push([n.number,n.supplier||'',(date(n.date)+' '+(n.arrivalTime||'')).trim(),n.volumes||0,owner(n.owner),n.status,s.total?s.counted+'/'+s.total:'—']);
    });
  }else if(kind==='tasks'){
    headers=['Tarefa','Prazo','Responsável','Corredor','Prioridade','Status'];
    tasksInGroup(state.tasks,group).forEach(function(t){rows.push([t.title,t.due?date(t.due):'Sem prazo',owner(t.owner),corridor(t.corridor),priority(t),t.status])});
  }else if(kind==='agenda'){
    headers=['Tarefa','Prazo','Responsável','Corredor','Prioridade','Status'];
    var day=state.tasks.filter(function(t){return (t.due||t.date)===agendaDate});
    tasksInGroup(day,group).forEach(function(t){rows.push([t.title,t.due?date(t.due):'Sem prazo',owner(t.owner),corridor(t.corridor),priority(t),t.status])});
    extra='Dia '+date(agendaDate);
  }else if(kind==='team'){
    headers=['Pessoa','Função','Atividades a fazer (30 dias)','Feitas (30 dias)'];
    var people=state.team.map(function(p){return {id:p.id,name:p.name,role:p.role||''}}).concat([{id:'todos',name:'TODOS',role:'Atividade em conjunto'}]);
    people.forEach(function(p){
      var mine=typeof planActsFor==='function'?planActsFor(p.name):[];
      var done=mine.filter(function(a){return a.done}).length,pend=mine.length-done;
      var keep=group==='pending'?pend>0:group==='done'?done>0:true;
      if(keep)rows.push([p.name,p.role,pend,done]);
    });
  }else if(kind==='corridors'){
    headers=['Corredor','Setor','Responsável'];
    state.corridors.forEach(function(c){
      var keep=group==='pending'?!c.owner:group==='done'?!!c.owner:true;
      if(keep)rows.push([c.number,c.sector,owner(c.owner)]);
    });
  }else if(kind==='plans'){
    headers=['Data','Plano','Atividades','Responsáveis'];
    (state.plans||[]).slice().sort(function(a,b){return (b.date||'').localeCompare(a.date||'')}).forEach(function(p){
      var owners=p.activities.map(function(a){return a.owner||'A definir'}).filter(function(v,i,arr){return arr.indexOf(v)===i}).join(', ');
      rows.push([date(p.date),p.title,p.activities.length,owners]);
    });
  }
  return {headers:headers,rows:rows,extra:extra};
}
function reportTitle(kind,group){
  var k=KINDS[kind],label=k.groups?(k.labels[group]||''):'';
  return k.title+(label?' · '+label:'');
}
function buildReport(kind,group){
  var built=buildRows(kind,group),store=authSession?authSession.payload.store:'';
  var now=new Date(),stamp=('0'+now.getDate()).slice(-2)+'/'+('0'+(now.getMonth()+1)).slice(-2)+'/'+now.getFullYear()+' '+('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2);
  var title=reportTitle(kind,group);
  var head='*'+title+'*\n'+store+(built.extra?' · '+built.extra:'')+'\nTotal: '+built.rows.length+'\nGerado em '+stamp;
  var body=built.rows.length?built.rows.map(function(r,i){
    var first=String(r[0]),rest=r.slice(1).map(function(v,j){return built.headers[j+1]+': '+(v===''||v==null?'—':v)}).join('\n   ');
    return (i+1)+'. *'+first+'*\n   '+rest;
  }).join('\n\n'):'Nenhum item neste grupo.';
  var text=head+'\n\n'+body+'\n\n— Estoque 99';
  return {kind:kind,group:group,title:title,store:store,stamp:stamp,headers:built.headers,rows:built.rows,text:text};
}
function reportCsv(data){
  var rows=[data.headers].concat(data.rows);
  return '﻿'+rows.map(function(r){return r.map(csvCell).join(';')}).join('\r\n');
}
function reportFileName(data,ext){return 'estoque99-'+data.kind+'-'+data.group+'-'+iso()+'.'+ext}
function reportHtml(data){
  var head=data.headers.map(function(h){return '<th>'+esc(h)+'</th>'}).join('');
  var body=data.rows.map(function(r){return '<tr>'+r.map(function(v){return '<td>'+esc(String(v==null?'':v))+'</td>'}).join('')+'</tr>'}).join('');
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+esc(data.title)+'</title><style>body{font:13px -apple-system,Segoe UI,system-ui,sans-serif;color:#111;margin:28px}h1{font-size:18px;margin:0 0 4px}.meta{color:#555;margin-bottom:16px}table{width:100%;border-collapse:collapse}th,td{border-bottom:1px solid #ddd;padding:7px 8px;text-align:left;vertical-align:top}th{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#555}@media print{body{margin:14mm}}</style></head><body><h1>'+esc(data.title)+'</h1><div class="meta">'+esc(data.store)+' · '+esc(data.stamp)+' · '+data.rows.length+' item(ns)</div><table><thead><tr>'+head+'</tr></thead><tbody>'+(body||'<tr><td colspan="'+data.headers.length+'">Nenhum item neste grupo.</td></tr>')+'</tbody></table><script>window.onload=function(){setTimeout(function(){window.print()},200)}<\/script></body></html>';
}
function ensureDialog(){
  var d=document.getElementById('report-dialog');
  if(d)return d;
  d=document.createElement('dialog');d.id='report-dialog';d.setAttribute('aria-labelledby','report-title');
  d.innerHTML='<form method="dialog" onsubmit="return false"><h2 id="report-title"></h2><p class="small" id="report-note"></p><div class="report-groups" id="report-groups" role="group" aria-label="Grupo do relatório"></div><div class="report-actions"><button type="button" class="primary wide" onclick="reportShare()">Enviar (WhatsApp, Outlook…)</button><button type="button" onclick="reportCopy()">Copiar texto</button><button type="button" onclick="reportCsvFile()">Baixar CSV</button><button type="button" class="wide" onclick="reportPdf()">Baixar PDF (para imprimir ou anexar)</button></div><textarea id="report-text" readonly aria-label="Prévia do relatório"></textarea><div class="formfoot"><button type="button" onclick="document.getElementById(\'report-dialog\').close()">Fechar</button></div></form>';
  document.body.appendChild(d);
  return d;
}
function renderDialog(){
  var k=KINDS[report.kind],counts=countsFor(report.kind);
  document.getElementById('report-title').textContent='Compartilhar: '+k.title;
  document.getElementById('report-note').textContent=report.kind==='nfs'?'Respeita a busca e o filtro de status que estão na tela.':report.kind==='agenda'?'Tarefas do dia escolhido na agenda.':'Escolha o grupo, confira a prévia e envie.';
  var groups=document.getElementById('report-groups');
  groups.innerHTML='';
  Object.keys(k.labels).forEach(function(g){
    var b=document.createElement('button');b.type='button';b.setAttribute('aria-pressed',String(report.group===g));
    b.textContent=k.labels[g]+' ('+counts[g]+')';
    b.onclick=function(){report.group=g;refreshReport()};
    groups.appendChild(b);
  });
  if(!k.groups)report.group='all';
  refreshReport();
}
function refreshReport(){
  report.data=buildReport(report.kind,report.group);
  var area=document.getElementById('report-text');if(area)area.value=report.data.text;
  var groups=document.getElementById('report-groups');
  if(groups)Array.prototype.forEach.call(groups.querySelectorAll('button'),function(b){
    var key=Object.keys(KINDS[report.kind].labels).filter(function(g){return b.textContent.indexOf(KINDS[report.kind].labels[g]+' (')===0})[0];
    b.setAttribute('aria-pressed',String(key===report.group));
  });
}
window.openShareReport=function(kind){
  if(!authSession||!KINDS[kind])return;
  report.kind=kind;report.group=KINDS[kind].groups?'pending':'all';
  var d=ensureDialog();renderDialog();
  if(!d.open)d.showModal();
};
window.reportCopy=function(){
  var text=report.data.text;
  function fallback(){var a=document.getElementById('report-text');a.focus();a.select();try{document.execCommand('copy');notify('Texto selecionado. Copie e cole no WhatsApp ou no Outlook.')}catch(e){notify('Selecione o texto da prévia e copie manualmente.')}}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(function(){notify('Texto copiado. Cole no WhatsApp ou no Outlook.')},fallback)}else fallback();
};
window.reportCsvFile=function(){
  var csv=reportCsv(report.data);
  planDownload(csv,reportFileName(report.data,'csv'),'text/csv;charset=utf-8');
  notify('CSV baixado. Anexe no WhatsApp ou no Outlook.');
};
window.reportPdf=function(){
  var w=window.open('','_blank');
  if(!w){notify('O navegador bloqueou a janela. Permita pop-ups deste site para gerar o PDF.');return}
  w.document.open();w.document.write(reportHtml(report.data));w.document.close();
  notify('Na janela de impressão, escolha "Salvar como PDF" e anexe o arquivo.');
};
window.reportShare=function(){
  var data=report.data,title=data.title+' · '+data.store;
  if(!navigator.share){window.reportCopy();return}
  var files=[];
  try{
    if(data.rows.length){
      var f=new File([reportCsv(data)],reportFileName(data,'csv'),{type:'text/csv'});
      if(navigator.canShare&&navigator.canShare({files:[f]}))files.push(f);
    }
  }catch(e){}
  var payload={title:title,text:data.text};
  if(files.length)payload.files=files;
  navigator.share(payload).then(function(){},function(e){
    if(e&&e.name==='AbortError')return;
    notify('Não foi possível compartilhar daqui. Use Copiar texto ou Baixar CSV.');
  });
};
window.shareReportButton=function(kind){
  return '<button type="button" onclick="openShareReport(\''+kind+'\')" aria-haspopup="dialog">Compartilhar ↗</button>';
};
})();
