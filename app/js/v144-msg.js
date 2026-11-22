/* v144 · Mensagens mais bonitas para WhatsApp e Outlook.
   window.e99Msg.text(payload)      → texto para o WhatsApp (*negrito*, seções com "•", separador e rodapé)
   window.e99Msg.banner(payload)    → Promise<Blob PNG> 1080×420, cores do tema, logo do app (sem rede)
   window.e99Msg.preview(payload,o) → folha com o banner e o texto: Compartilhar (WhatsApp), Copiar para o Outlook, Abrir no e-mail, Imprimir (v156)
   window.e99Msg.print(payload) / printText(título,texto) → v156: folha branca para papel (window.open; reserva em iframe), tudo por esc()
   payload = {title, subtitle?, when?, sections:[{title?, lines:[texto | {b, t?, sub:[texto]}]}], note?, subject?, file?}
   Tudo o que vem do usuário passa por clean() (tira * _ ~ ` e quebras de linha) no texto e por esc() no DOM/HTML.
   v153: linhas com sub viram blocos (título da linha, um campo por linha, linha em branco entre blocos); os campos (sub)
   passam por cleanML(), que mantém as quebras de linha do próprio usuário (cada linha limpa; linhas vazias saem). */
(function(){'use strict';var D=document,W=window;
var FOOT='Stok · Lojas G · Estoque 99',SEP='──────────',LOGO='icons/icon-512-v159.png';
function E(s){return (typeof esc==='function'?esc:function(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})})(s)}
function clean(v){return String(v==null?'':v).replace(/[*_~`]/g,'').replace(/[\r\n\u2028\u2029]+/g,' ').replace(/\s{2,}/g,' ').trim()}
function cleanML(v){return String(v==null?'':v).replace(/\r\n?|[\u2028\u2029]/g,'\n').split('\n').map(clean).filter(Boolean).join('\n')}
function two(n){return ('0'+n).slice(-2)}
function stamp(d){d=d||new Date();return two(d.getDate())+'/'+two(d.getMonth()+1)+'/'+d.getFullYear()+' às '+two(d.getHours())+':'+two(d.getMinutes())}
function norm(p){p=p&&typeof p==='object'?p:{};var secs=Array.isArray(p.sections)?p.sections:[];
  return {title:clean(p.title)||'Stok',subtitle:clean(p.subtitle),when:clean(p.when)||stamp(),note:clean(p.note),subject:clean(p.subject),file:String(p.file||'').replace(/[^a-z0-9-]/gi,'').slice(0,60),
    sections:secs.map(function(s){s=s||{};return {title:clean(s.title),lines:(Array.isArray(s.lines)?s.lines:[]).map(function(l){
      if(l&&typeof l==='object')return {b:clean(l.b),t:clean(l.t),sub:(Array.isArray(l.sub)?l.sub:[]).map(cleanML).filter(Boolean)};var t=clean(l);return t?{b:'',t:t,sub:[]}:null}).filter(Boolean)}}).filter(function(s){return s.title||s.lines.length})}}
function subLine(n){return [n.subtitle,n.when].filter(Boolean).join(' · ')}
/* opts.plain = sem marcas de negrito/itálico (corpo de e-mail) */
function text(p,opts){var n=norm(p),pl=!!(opts&&opts.plain),B=function(s){return s?(pl?s:'*'+s+'*'):''},I=function(s){return s?(pl?s:'_'+s+'_'):''};
  var out=[B(n.title),I(subLine(n))];
  n.sections.forEach(function(s){out.push('');if(s.title)out.push(B(s.title));
    if(!s.lines.length)out.push('• Nada por aqui.');
    s.lines.forEach(function(l,j){var head=l.b?B(l.b)+(l.t?' — '+l.t:''):l.t;
      if(l.sub.length){if(j&&out[out.length-1]!=='')out.push('');if(j===0&&s.title)out.push('');out.push(head);l.sub.forEach(function(x){out.push(x)});if(j<s.lines.length-1)out.push('')}
      else out.push('• '+head)})});
  if(n.note){out.push('');out.push(I(n.note))}
  out.push('');out.push(SEP);out.push(FOOT);return out.join('\n')}
/* ---------- cores do tema (tokens do body) ---------- */
function tok(name,def){try{var v=getComputedStyle(D.body||D.documentElement).getPropertyValue(name).trim();return v||def}catch(e){return def}}
function solid(v,def){v=String(v||'').trim();return /^#[0-9a-f]{3,8}$/i.test(v)||/^rgba?\([\d\s.,%]+\)$/i.test(v)?v:def}
function theme(){var rgb=(tok('--neon-rgb','219,35,24').match(/\d+/g)||[219,35,24]).slice(0,3).join(',');
  return {bg:solid(tok('--e99-bg','#0B0B0D'),'#0B0B0D'),neon:solid(tok('--neon','#FF2A1F'),'#FF2A1F'),btn:solid(tok('--neon-btn','#DB2318'),'#DB2318'),hot:solid(tok('--neon-hot','#FF8A7A'),'#FF8A7A'),ink:solid(tok('--neon-ink','#FFFFFF'),'#FFFFFF'),rgb:rgb,
    font:tok('--font-head','')||"system-ui,-apple-system,'Segoe UI',sans-serif",body:tok('--font-text','')||"system-ui,-apple-system,'Segoe UI',sans-serif"}}
/* ---------- banner PNG ---------- */
var logoP=null;
function logo(){if(logoP)return logoP;logoP=new Promise(function(res){var im=new Image(),done=false,t=setTimeout(function(){if(!done){done=true;res(null)}},2500);
  im.onload=function(){if(!done){done=true;clearTimeout(t);res(im)}};im.onerror=function(){if(!done){done=true;clearTimeout(t);logoP=null;res(null)}};im.src=LOGO});return logoP}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function fit(c,s,max,lines){var words=String(s).split(' '),out=[],cur='';words.forEach(function(w){var t=cur?cur+' '+w:w;if(c.measureText(t).width<=max||!cur)cur=t;else{out.push(cur);cur=w}});if(cur)out.push(cur);
  if(out.length>lines){out=out.slice(0,lines);var last=out[lines-1];while(last.length>1&&c.measureText(last+'…').width>max)last=last.slice(0,-1);out[lines-1]=last+'…'}
  return out.map(function(l){while(l.length>1&&c.measureText(l).width>max)l=l.slice(0,-2)+'…';return l})}
function banner(p){var n=norm(p),th=theme(),Wd=1080,H=420;
  return logo().then(function(img){var cv=D.createElement('canvas');cv.width=Wd;cv.height=H;var c=cv.getContext('2d');
    c.fillStyle='#0a0a0c';c.fillRect(0,0,Wd,H);
    /* cartão escuro arredondado, borda fina e brilho sutil no alto */
    var CX=24,CY=24,CW=Wd-48,CH=H-48;
    var cg=c.createLinearGradient(0,CY,0,CY+CH);cg.addColorStop(0,'#16161a');cg.addColorStop(1,'#0c0c0e');
    rr(c,CX,CY,CW,CH,44);c.fillStyle=cg;c.fill();
    c.save();rr(c,CX,CY,CW,CH,44);c.clip();
    var g=c.createRadialGradient(Wd*.80,CY-30,10,Wd*.80,CY-30,Wd*.6);g.addColorStop(0,'rgba('+th.rgb+',.30)');g.addColorStop(1,'rgba('+th.rgb+',0)');c.fillStyle=g;c.fillRect(0,0,Wd,H);
    var rim=c.createLinearGradient(CX,0,CX+CW,0);rim.addColorStop(0,'rgba(255,255,255,0)');rim.addColorStop(.5,'rgba(255,255,255,.28)');rim.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=rim;c.fillRect(CX,CY,CW,2);
    c.restore();
    c.strokeStyle='rgba(255,255,255,.10)';c.lineWidth=2;rr(c,CX+1,CY+1,CW-2,CH-2,43);c.stroke();
    var L=72,S=200,Y=(H-S)/2;
    c.save();rr(c,L,Y,S,S,46);c.clip();
    if(img){c.drawImage(img,L,Y,S,S)}else{c.fillStyle='#121216';c.fillRect(L,Y,S,S);c.fillStyle='#FF2A1F';c.font='800 160px '+th.font;c.textAlign='center';c.textBaseline='middle';c.fillText('S',L+S/2,Y+S/2+8)}
    c.restore();c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=2;rr(c,L+1,Y+1,S-2,S-2,45);c.stroke();
    var X=L+S+52,MW=Wd-X-72;c.textAlign='left';c.textBaseline='alphabetic';
    /* cabeçalho em pílula */
    c.font='700 22px '+th.body;var pt='STOK · LOJAS G · ESTOQUE 99',pw=c.measureText(pt).width+44;
    rr(c,X,76,pw,44,22);c.fillStyle='rgba(255,255,255,.07)';c.fill();c.strokeStyle='rgba(255,255,255,.14)';c.lineWidth=1.5;rr(c,X+.75,76.75,pw-1.5,42.5,21);c.stroke();
    c.fillStyle=th.neon;c.fillText(pt,X+22,106);
    c.fillStyle='#FFFFFF';c.font='700 58px '+th.font;var tl=fit(c,n.title,MW,2),y=190;tl.forEach(function(l){c.fillText(l,X,y);y+=64});
    c.fillStyle='rgba(255,255,255,.62)';c.font='500 28px '+th.body;fit(c,subLine(n),MW,2).forEach(function(l){c.fillText(l,X,y+2);y+=38});
    /* linha com check-circle */
    var ck=X;c.beginPath();c.arc(ck+13,H-84,13,0,Math.PI*2);c.strokeStyle=th.neon;c.lineWidth=2.5;c.stroke();
    c.beginPath();c.moveTo(ck+7,H-84);c.lineTo(ck+11.5,H-79);c.lineTo(ck+20,H-90);c.strokeStyle='#fff';c.lineWidth=3;c.lineCap='round';c.lineJoin='round';c.stroke();
    c.fillStyle='rgba(255,255,255,.62)';c.font='500 24px '+th.body;c.fillText('Tudo no lugar.',ck+36,H-75);
    return new Promise(function(res,rej){try{cv.toBlob(function(b){b?res(b):rej(Error('Não deu para gerar o banner.'))},'image/png')}catch(e){rej(e)}})})}
/* ---------- HTML para o Outlook (estilos inline; sem imagem: o Outlook descarta data: ao colar) ---------- */
function html(p){var n=norm(p),th=theme(),F="font-family:-apple-system,'Segoe UI',Calibri,Arial,sans-serif;",CK='<span style="display:inline-block;width:18px;height:18px;line-height:18px;text-align:center;border:1px solid '+E(th.neon)+';border-radius:9px;color:#ffffff;font-size:11px;margin-right:10px">&#10003;</span>';
  var h='<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:#0a0a0c;max-width:640px"><tr><td style="padding:12px">'
   +'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:#121215;border:1px solid #2a2a2f;border-radius:22px"><tr><td style="padding:22px 24px">'
   +'<div style="'+F+'margin:0 0 12px"><span style="display:inline-block;padding:6px 14px;border:1px solid #34343a;border-radius:999px;background:#1c1c20;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:'+E(th.neon)+'">'+E(FOOT)+'</span></div>'
   +'<div style="'+F+'font-size:26px;font-weight:700;color:#ffffff;line-height:1.15">'+E(n.title)+'</div>'
   +'<div style="'+F+'font-size:13px;color:#9a9aa3;margin-top:4px">'+E(subLine(n))+'</div>';
  n.sections.forEach(function(s){if(s.title)h+='<div style="'+F+'font-size:13px;font-weight:600;margin:20px 0 6px;color:#9a9aa3;border-top:1px solid #2a2a2f;padding-top:12px">'+E(s.title)+'</div>';
    h+='<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">'+(s.lines.length?s.lines.map(function(l){return '<tr><td valign="top" width="30" style="padding:'+(l.sub.length?'10px 0 10px':'6px 0')+'">'+CK+'</td><td style="'+F+'font-size:14px;color:#f2f2f5;padding:'+(l.sub.length?'10px 0 10px;border-bottom:1px solid #222227':'6px 0')+'">'+(l.b?'<b style="color:#ffffff">'+E(l.b)+'</b>'+(l.t?' — '+E(l.t):''):E(l.t))+(l.sub.length?l.sub.map(subHtml).join(''):'')+'</td></tr>'}).join(''):'<tr><td style="'+F+'font-size:14px;color:#9a9aa3;padding:6px 0">Nada por aqui.</td></tr>')+'</table>'});
  if(n.note)h+='<p style="'+F+'font-size:13px;color:#9a9aa3;font-style:italic;margin:16px 0 0">'+E(n.note)+'</p>';
  h+='<p style="'+F+'font-size:12px;color:#6f6f78;border-top:1px solid #2a2a2f;margin:20px 0 0;padding-top:10px">'+E(FOOT)+'</p></td></tr></table></td></tr></table>';return h}
function subHtml(x){var m=/^([^:\n]{1,40}):\s*([\s\S]*)$/.exec(x),F="font-family:-apple-system,'Segoe UI',Calibri,Arial,sans-serif;";
  return '<div style="'+F+'color:#c9c9d1;font-size:13px;line-height:1.45;margin-top:3px">'+(m?'<b style="color:#ffffff">'+E(m[1])+':</b> '+E(m[2]).replace(/\n/g,'<br>'):E(x).replace(/\n/g,'<br>'))+'</div>'}
/* ---------- v156: imprimir (folha branca para papel, sem botões nem fundo escuro) ---------- */
var PCSS='*{box-sizing:border-box}html,body{background:#fff}body{font:14px/1.45 -apple-system,"Segoe UI",system-ui,Arial,sans-serif;color:#111;margin:28px;max-width:780px}'
 +'.ph{display:flex;align-items:center;gap:14px;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:16px}.ph img{width:44px;height:44px;border-radius:11px}'
 +'.brand{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#555}h1{font-size:22px;margin:2px 0 0}.meta{color:#555;font-size:13px;margin-top:2px}'
 +'h2{font-size:15px;margin:20px 0 8px;padding-bottom:4px;border-bottom:1px solid #ccc}.blk{padding:8px 0 10px;border-bottom:1px solid #e3e3e3;break-inside:avoid;page-break-inside:avoid}'
 +'.blk b.t{font-size:15px}.blk .f{margin-top:3px;color:#222;white-space:pre-wrap}.blk .f b{color:#000}ul{margin:0;padding-left:20px}li{margin:3px 0}'
 +'.note{font-style:italic;color:#444;margin-top:16px}.foot{margin-top:24px;padding-top:8px;border-top:1px solid #ccc;font-size:11px;color:#666}'
 +'pre.txt{white-space:pre-wrap;font:inherit;margin:0}@media print{body{margin:14mm;max-width:none}}';
function pdoc(title,inner){var lg='';try{lg=new URL(LOGO,location.href).href}catch(e){}
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+E(title)+'</title><style>'+PCSS+'</style></head><body>'
   +'<div class="ph">'+(lg?'<img src="'+E(lg)+'" alt="">':'')+'<div><div class="brand">'+E(FOOT)+'</div><h1>'+E(title)+'</h1>'+inner.meta+'</div></div>'+inner.body+'<div class="foot">'+E(FOOT)+' · impresso em '+E(stamp())+'</div></body></html>'}
function printHtml(p){var n=norm(p),b='';
  n.sections.forEach(function(s){if(s.title)b+='<h2>'+E(s.title)+'</h2>';var plain=s.lines.filter(function(l){return !l.sub.length});
    s.lines.forEach(function(l){if(!l.sub.length)return;b+='<div class="blk"><b class="t">'+E(l.b||l.t)+'</b>'+(l.b&&l.t?' — '+E(l.t):'')
      +l.sub.map(function(x){var m=/^([^:\n]{1,40}):\s*([\s\S]*)$/.exec(x);return '<div class="f">'+(m?'<b>'+E(m[1])+':</b> '+E(m[2]):E(x))+'</div>'}).join('')+'</div>'});
    if(plain.length)b+='<ul>'+plain.map(function(l){return '<li>'+(l.b?'<b>'+E(l.b)+'</b>'+(l.t?' — '+E(l.t):''):E(l.t))+'</li>'}).join('')+'</ul>';
    if(!s.lines.length)b+='<p>Nada por aqui.</p>'});
  if(n.note)b+='<p class="note">'+E(n.note)+'</p>';
  return pdoc(n.title,{meta:'<div class="meta">'+E(subLine(n))+'</div>',body:b})}
/* texto livre (já pronto para copiar): mantém as quebras de linha, sem marcas do WhatsApp */
function printTextHtml(title,t){t=String(t==null?'':t).replace(/\r\n?/g,'\n').replace(/[*_~`]/g,'');return pdoc(clean(title)||'Stok',{meta:'',body:'<pre class="txt">'+E(t)+'</pre>'})}
function printDoc(html){var w=null;try{w=W.open('','_blank')}catch(e){}
  if(w){try{w.document.open();w.document.write(html);w.document.close();setTimeout(function(){try{w.focus();w.print()}catch(e){}},300);if(typeof notify==='function')notify('Na janela de impressão, escolha a impressora ou "Salvar como PDF".');return true}catch(e){}}
  var f=D.createElement('iframe');f.setAttribute('aria-hidden','true');f.className='e99-print-frame';f.style.cssText='position:fixed;width:0;height:0;border:0;right:0;bottom:0';D.body.appendChild(f);
  var fd=f.contentDocument;fd.open();fd.write(html);fd.close();
  setTimeout(function(){try{f.contentWindow.focus();f.contentWindow.print()}catch(e){if(typeof notify==='function')notify('Não deu para imprimir aqui.')}setTimeout(function(){f.remove()},60000)},300);
  if(typeof notify==='function')notify('Na janela de impressão, escolha a impressora ou "Salvar como PDF".');return true}
function print(p){return printDoc(printHtml(p))}
function printText(title,t){return printDoc(printTextHtml(title,t))}
/* ---------- folha de prévia ---------- */
var cur=null;
function slug(n){return (n.file||n.title.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)||'mensagem')}
function say(m){if(typeof notify==='function')notify(m);var s=D.getElementById('e99m-status');if(s)s.textContent=m}
function sheet(){var d=D.getElementById('e99-msg');if(d)return d;d=D.createElement('dialog');d.id='e99-msg';d.setAttribute('aria-labelledby','e99m-title');
  d.innerHTML='<div class="e99m-wrap"><div class="e99m-head"><h2 id="e99m-title">Enviar mensagem</h2><button type="button" class="e99m-x" aria-label="Fechar" onclick="e99Msg.close()">'+(typeof e99Icon==='function'?e99Icon('close'):'✕')+'</button></div>'
   +'<div class="e99m-banner"><img id="e99m-img" alt="" width="1080" height="420"><span id="e99m-wait">Preparando o banner…</span></div>'
   +'<pre class="e99m-text" id="e99m-text" tabindex="0" aria-label="Prévia do texto"></pre>'
   +'<div class="e99m-manual" id="e99m-manual" hidden><label>Selecione e copie (Ctrl+C) <textarea id="e99m-copy" readonly rows="6"></textarea></label></div>'
   +'<p class="small" id="e99m-status" role="status" aria-live="polite"></p>'
   +'<div class="e99m-actions"><button type="button" class="primary" id="e99m-share" onclick="e99Msg.share()" disabled>Compartilhar (WhatsApp)</button>'
   +'<button type="button" id="e99m-outlook" onclick="e99Msg.outlook()">Copiar para o Outlook</button>'
   +'<button type="button" id="e99m-dl" onclick="e99Msg.download()" hidden>Baixar banner (PNG)</button>'
   +'<button type="button" id="e99m-print" onclick="e99Msg.printCurrent()">Imprimir</button>'
   +'<a id="e99m-mail" class="e99m-mail" href="#">Abrir no e-mail</a></div></div>';
  d.addEventListener('close',function(){var c=cur;cur=null;if(c){if(c.url)try{URL.revokeObjectURL(c.url)}catch(e){}if(c.from&&c.from.isConnected&&c.from.focus)try{c.from.focus()}catch(e){}}});
  d.addEventListener('click',function(e){if(e.target===d)d.close()});
  D.body.appendChild(d);return d}
function preview(p,o){o=o||{};var n=norm(p),d=sheet(),t=text(p),from=o.from||D.activeElement;
  if(cur&&cur.url)try{URL.revokeObjectURL(cur.url)}catch(e){}
  var c=cur={n:n,payload:p,text:t,html:html(p),blob:null,file:null,url:'',from:from,files:(Array.isArray(o.files)?o.files:[]).filter(function(f){return f instanceof Blob}),name:'stok-'+slug(n)+'.png'};
  D.getElementById('e99m-title').textContent=o.heading||'Enviar mensagem';
  D.getElementById('e99m-text').textContent=t;D.getElementById('e99m-manual').hidden=true;D.getElementById('e99m-status').textContent='';
  var img=D.getElementById('e99m-img'),wait=D.getElementById('e99m-wait'),sh=D.getElementById('e99m-share'),dl=D.getElementById('e99m-dl');
  img.removeAttribute('src');img.alt='';wait.hidden=false;wait.textContent='Preparando o banner…';sh.disabled=true;dl.hidden=!!navigator.share;
  var body=t.replace(/[*_]/g,'');if(body.length>1800)body=body.slice(0,1800)+'\n… (continua no Stok)';
  D.getElementById('e99m-mail').href='mailto:?subject='+encodeURIComponent((n.subject||n.title+' · '+FOOT).slice(0,180))+'&body='+encodeURIComponent(body.replace(/\r?\n/g,'\r\n'));
  if(!d.open){try{d.showModal()}catch(e){d.setAttribute('open','')}}
  try{sh.focus()}catch(e){}
  return banner(p).then(function(b){if(cur!==c)return;c.blob=b;try{c.file=new File([b],c.name,{type:'image/png'})}catch(e){c.file=b}c.url=URL.createObjectURL(b);img.src=c.url;img.alt='Banner: '+n.title;wait.hidden=true;sh.disabled=false;return b},
    function(){if(cur!==c)return;wait.textContent='Banner indisponível; o texto vai sozinho.';sh.disabled=false;return null})}
function canFiles(f){try{return !!(navigator.canShare&&navigator.canShare({files:f}))}catch(e){return false}}
function share(){var c=cur;if(!c)return Promise.resolve(false);
  if(navigator.share){var files=null;if(c.file){var all=[c.file].concat(c.files);if(canFiles(all))files=all;else if(canFiles([c.file]))files=[c.file]}
    var data=files?{files:files,text:c.text}:{title:c.n.title,text:c.text};
    return navigator.share(data).then(function(){say('Pronto.');return true},function(e){if(e&&e.name==='AbortError')return false;say('Não deu para compartilhar daqui. Use Copiar para o Outlook ou Abrir no e-mail.');return false})}
  try{W.open('https://wa.me/?text='+encodeURIComponent(c.text),'_blank','noopener')}catch(e){}
  D.getElementById('e99m-dl').hidden=false;say('Abrindo o WhatsApp. Para mandar o banner, baixe a imagem e anexe na conversa.');return Promise.resolve(true)}
function download(){var c=cur;if(!c||!c.blob)return;var a=D.createElement('a'),u=URL.createObjectURL(c.blob);a.href=u;a.download=c.name;D.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},15000);say('Banner baixado.')}
function manual(c){var box=D.getElementById('e99m-manual'),ta=D.getElementById('e99m-copy');ta.value=c.text.replace(/[*_]/g,'');box.hidden=false;try{ta.focus();ta.select()}catch(e){}say('Não deu para copiar sozinho. O texto está selecionado: copie e cole no Outlook.')}
function outlook(){var c=cur;if(!c)return Promise.resolve(false);var plain=c.text.replace(/[*_]/g,'');
  try{if(navigator.clipboard&&navigator.clipboard.write&&W.ClipboardItem){return navigator.clipboard.write([new ClipboardItem({'text/html':new Blob([c.html],{type:'text/html'}),'text/plain':new Blob([plain],{type:'text/plain'})})]).then(function(){say('Copiado. Cole no corpo do e-mail no Outlook.');return true},function(){manual(c);return false})}}catch(e){}
  manual(c);return Promise.resolve(false)}
function close(){var d=D.getElementById('e99-msg');if(d&&d.open)d.close()}
function printCurrent(){var c=cur;if(!c)return false;return print(c.payload)}
W.e99Msg={print:print,printHtml:printHtml,printText:printText,printTextHtml:printTextHtml,printDoc:printDoc,printCurrent:printCurrent,text:text,banner:banner,preview:preview,html:html,share:share,outlook:outlook,download:download,close:close,clean:clean,current:function(){return cur?{text:cur.text,html:cur.html,ready:!!cur.blob,name:cur.name}:null}};

/* ===================== pontos de envio ===================== */
/* Plano de ação: "Copiar para WhatsApp / Outlook" e "Compartilhar com fotos" abrem a folha (com as fotos junto no compartilhar) */
function planPayload(p){var st=authSession&&authSession.payload?authSession.payload.store:'';var acts=p.activities||[];
  var dt=typeof date==='function'?date(p.date):p.date;
  return {title:'Plano de ação',subtitle:[dt,p.title,st].filter(Boolean).join(' · '),when:'gerado em '+stamp(),file:'plano-'+p.date,subject:'Plano de ação · '+dt+' · '+p.title,
    sections:[{title:'Atividades ('+acts.filter(function(a){return a.done}).length+' de '+acts.length+' feitas)',lines:acts.map(function(a,i){var sub=['Responsável: '+(a.owner||'A definir')];
      if(a.demanda){var dr='';try{dr=typeof demResp==='function'?demResp(a.demanda):''}catch(e){}sub.push('Demanda: '+a.demanda+(dr?' (responsável: '+dr+')':''))}
      if(a.notes)sub.push('Orientações: '+a.notes);if(a.photos&&a.photos.length)sub.push('Fotos: '+a.photos.length+' (enviadas junto)');
      return {b:(i+1)+'. '+a.title,t:[a.time?'até '+a.time:'',a.done?'✓ feita':''].filter(Boolean).join(' · '),sub:sub}})}],
    note:'Se alguma atividade não for concluída, informe o motivo da pendência.'}}
W.e99Msg.planPayload=planPayload;
function hook(){if(typeof planById!=='function')return;
  W.copyPlan=function(id){var p=planById(id);if(!p)return;preview(planPayload(p),{heading:'Enviar plano'})};
  W.sharePlan=function(id){var p=planById(id);if(!p)return;var files=[];try{(p.activities||[]).forEach(function(a,i){(a.photos||[]).forEach(function(ph,j){files.push(photoFile(ph,'atividade-'+(i+1)+'-foto-'+(j+1)+'.jpg'))})})}catch(e){}
    preview(planPayload(p),{heading:'Enviar plano com fotos',files:files})}}
hook();
})();
