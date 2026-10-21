/* Robô do correio: entra com a conta do robô (ROBO_EMAIL / ROBO_SENHA no ambiente, nunca no repositório),
   lista os resumos na fila e mostra para quem enviar (só e-mails confirmados)
   e os últimos erros vistos nos aparelhos da equipe (errosDosAparelhos).
   Uso:  node tests/robo_correio.js              -> imprime JSON [{id, para, assunto, texto}]
         node tests/robo_correio.js --apagar id1,id2   -> apaga da fila os já enviados */
const KEY='AIzaSyBy72TCofmFQGsaiC72TWKkwT8fsMXfxLI',P='gen-lang-client-0167474823';
const FS=`https://firestore.googleapis.com/v1/projects/${P}/databases/(default)/documents`;
async function j(u,o={}){const r=await fetch(u,o);const t=await r.text();let b;try{b=JSON.parse(t)}catch(e){b=t}if(!r.ok)throw Error(u.replace(/key=[^&]+/,'')+' '+r.status+' '+t.slice(0,200));return b}
(async()=>{const email=process.env.ROBO_EMAIL,pw=process.env.ROBO_SENHA;if(!email||!pw)throw Error('Faltam ROBO_EMAIL e ROBO_SENHA.');
 const tok=(await j(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${KEY}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password:pw,returnSecureToken:true})})).idToken;
 const H={Authorization:'Bearer '+tok,'Content-Type':'application/json'};
 const i=process.argv.indexOf('--apagar');if(i>0){const ids=(process.argv[i+1]||'').split(',').filter(x=>/^[A-Za-z0-9_]+$/.test(x));for(const id of ids)await j(`${FS}/correio/${id}`,{method:'DELETE',headers:H});console.log(JSON.stringify({apagados:ids.length}));return}
 const list=(await j(`${FS}/correio?pageSize=100`,{headers:H})).documents||[];const out=[],skip=[];
 for(const d of list.slice(0,50)){const f=d.fields||{},id=d.name.split('/').pop(),para=f.para&&f.para.stringValue,loja=f.loja&&f.loja.stringValue;
  try{const m=await j(`${FS}/lojas/${loja}/membros/${para}`,{headers:H});if(!(m.fields&&m.fields.verificado&&m.fields.verificado.booleanValue)){skip.push({id,motivo:'e-mail não confirmado'});continue}
   const u=await j(`${FS}/usuarios/${para}`,{headers:H});out.push({id,para:u.fields.email.stringValue,assunto:f.assunto.stringValue,texto:f.texto.stringValue})}catch(e){skip.push({id,motivo:String(e.message).slice(0,120)})}}
 let erros=[];try{const r=await j(`${FS}:runQuery`,{method:'POST',headers:H,body:JSON.stringify({structuredQuery:{from:[{collectionId:'erros',allDescendants:true}],orderBy:[{field:{fieldPath:'at'},direction:'DESCENDING'}],limit:30}})});erros=r.filter(x=>x.document).map(x=>{const f=x.document.fields;return {msg:f.msg.stringValue,onde:f.onde.stringValue,pagina:f.pagina.stringValue,versao:f.ver.stringValue,vezes:+f.n.integerValue,quando:new Date(+f.at.integerValue).toISOString()}})}catch(e){erros=[{msg:'não consegui ler os erros: '+e.message}]}
 console.log(JSON.stringify({enviar:out,pulados:skip,naFila:list.length,errosDosAparelhos:erros},null,1))})().catch(e=>{console.error('ERRO',e.message);process.exit(1)});
