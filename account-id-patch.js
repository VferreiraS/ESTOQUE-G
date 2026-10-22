/* Stok v74 · ID único por conta (STK-XXXXXXXXXXXX) */
(function(){
'use strict';
function newId(){
  var bytes=crypto.getRandomValues(new Uint8Array(12));
  var alphabet='0123456789ABCDEFGHJKMNPQRSTVWXYZ';
  var s='STK-';
  for(var i=0;i<bytes.length;i++)s+=alphabet[bytes[i]%32];
  return s;
}
function validId(id){return typeof id==='string'&&/^STK-[0-9A-HJKMNP-TV-Z]{12}$/.test(id)}
function ensureId(record){
  if(record&&validId(record.id))return record;
  return Object.assign({},record,{id:newId()});
}
function persistId(storeKey,record){
  try{
    var raw=localStorage.getItem(storeKey);
    if(!raw)return;
    var stored=JSON.parse(raw);
    if(stored&&!stored.id&&record.id){
      stored.id=record.id;
      localStorage.setItem(storeKey,JSON.stringify(stored));
    }
  }catch(e){}
}

function patchWhenReady(){
  if(typeof authCreate!=='function'||typeof authEnter!=='function'){
    setTimeout(patchWhenReady,50);
    return;
  }
  if(window.__stokAccountIdPatched)return;
  window.__stokAccountIdPatched=true;

  var _create=authCreate;
  authCreate=async function(login,store,password,data,role){
    var session=await _create.apply(this,arguments);
    if(session&&session.record&&!validId(session.record.id)){
      session.record=Object.assign({},session.record,{id:newId()});
    }
    return session;
  };

  var _enter=authEnter;
  authEnter=function(session){
    if(session&&session.record){
      session.record=ensureId(session.record);
      if(session.storeKey)persistId(session.storeKey,session.record);
    }
    return _enter.apply(this,arguments);
  };

  if(typeof authCheckRecord==='function'){
    var _check=authCheckRecord;
    authCheckRecord=function(r){
      var out=_check.apply(this,arguments);
      if(r&&r.id!==undefined&&!validId(r.id))throw Error('Arquivo de conta inválido.');
      return out;
    };
  }

  if(typeof authAccounts==='function'){
    var _accounts=authAccounts;
    authAccounts=function(){
      var rows=_accounts.apply(this,arguments);
      return rows.map(function(row){
        try{
          var raw=localStorage.getItem(row.key);
          if(raw){
            var rec=JSON.parse(raw);
            if(rec&&rec.id)row.id=rec.id;
          }
        }catch(e){}
        return row;
      });
    };
  }

  if(typeof renderAccount==='function'){
    var _renderAcc=renderAccount;
    renderAccount=function(){
      var html=_renderAcc.apply(this,arguments);
      if(!authSession||!authSession.record)return html;
      var id=authSession.record.id||'—';
      if(html.indexOf('ID da conta')>=0)return html;
      var block='<p><b>ID da conta:</b> <code>'+String(id).replace(/</g,'&lt;')+'</code> <button type="button" style="padding:4px 8px;font-size:12px" onclick="navigator.clipboard.writeText(authSession.record.id||\'\'").then(function(){notify(\'ID copiado.\')},function(){notify(\'Não foi possível copiar.\')})">Copiar</button></p><p class="small">Este ID identifica a conta em qualquer aparelho.</p>';
      return html.replace('<button class="primary" onclick="authExport()">', block+'<button class="primary" onclick="authExport()">');
    };
  }

  if(typeof authExport==='function'){
    var _export=authExport;
    authExport=async function(){
      var _download=authDownload;
      if(typeof authDownload==='function'&&authSession&&authSession.record){
        authDownload=function(object,name){
          var id=(authSession.record&&authSession.record.id)||'estoque';
          if(name&&name.indexOf('conta-estoque-protegida')===0){
            name='conta-'+id+'-'+(typeof iso==='function'?iso():Date.now())+'.json';
          }
          return _download.call(this,object,name);
        };
      }
      try{return await _export.apply(this,arguments)}
      finally{if(_download)authDownload=_download}
    };
  }

  try{console.info('[Stok] ID de conta ativo (v74)')}catch(e){}
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',patchWhenReady);
else patchWhenReady();
})();
