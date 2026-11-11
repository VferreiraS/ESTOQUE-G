
/* v129 · apresentação: Administração com uma lista só e erro ao lado do campo nos formulários. Não muda dados nem lógica. */
(function(){
  function adminOne(v){try{if(typeof page==='undefined'||page!=='admin')return;var h=[].slice.call(v.querySelectorAll('h2')).filter(function(x){return /^Contas neste aparelho$/.test(x.textContent.trim())})[0];if(!h)return;
    var rows=[].slice.call(v.querySelectorAll('.admin-account'));var byLogin={};rows.forEach(function(r){var b=r.querySelector('b');if(b)byLogin[b.textContent.trim()]=r});
    var note=document.getElementById('acc-local-note');var first=rows[0]&&rows[0].closest('.panel');
    var n=h.nextElementSibling,dead=[h];
    while(n&&!(n.matches('.panel')&&n.querySelector('h2'))){var nx=n.nextElementSibling;
      if(n.id==='acc-local-note'){n=nx;continue}
      if(n.matches('.panel')){var b=n.querySelector('b'),lg=b&&b.textContent.trim(),row=lg&&byLogin[lg];
        if(row){var btn=n.querySelector('button');var acts=row.querySelector('.e99-acc-acts');
          if(!acts){acts=document.createElement('div');acts.className='e99-acc-acts';[].slice.call(row.children).forEach(function(c){if(c.tagName==='BUTTON')acts.appendChild(c)});row.appendChild(acts)}
          if(btn)acts.appendChild(btn);else if(/Protegida/.test(n.textContent)&&!row.querySelector('.e99-acc-tag')){var t=document.createElement('span');t.className='e99-acc-tag';t.textContent='Protegida';b=row.querySelector('b');if(b)b.after(t)}
          dead.push(n)}}
      n=nx}
    dead.forEach(function(x){x.remove()});
    if(note&&first){first.querySelector('.admin-list')?first.querySelector('.admin-list').before(note):first.appendChild(note)}
  }catch(e){}}
  /* erro ao lado do campo: quando o navegador recusa um campo (obrigatório, formato), mostra a mensagem logo abaixo dele */
  document.addEventListener('invalid',function(e){var f=e.target;if(!f||!f.closest||!f.closest('dialog,#auth-screen,#view'))return;try{f.setAttribute('aria-invalid','true');var id=(f.id||f.name||'c')+'-e99err';var m=f.parentNode.querySelector('.e99-field-err[data-for="'+id+'"]');
    if(!m){m=document.createElement('span');m.className='e99-field-err';m.setAttribute('data-for',id);m.id=id;m.setAttribute('role','alert');f.after(m)}m.textContent=f.validationMessage||'Confira este campo.';f.setAttribute('aria-describedby',id)}catch(x){}},true);
  document.addEventListener('input',function(e){var f=e.target;if(!f||f.getAttribute('aria-invalid')!=='true')return;try{if(f.checkValidity()){f.removeAttribute('aria-invalid');var m=f.parentNode.querySelector('.e99-field-err');if(m)m.remove()}}catch(x){}},true);
  if(typeof render==='function'){var r0=render;render=function(){var r=r0.apply(this,arguments);try{adminOne(document.getElementById('view'))}catch(x){}return r}}
  try{var v=document.getElementById('view');if(v)adminOne(v)}catch(x){}
})();
