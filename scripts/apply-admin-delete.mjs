#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');
if (html.includes('function authDeleteAccount')) {
  console.log('Already has authDeleteAccount');
  process.exit(0);
}

const start = html.indexOf("function renderAdmin(){if(!authSession||authSession.payload.role!=='gestor')");
const blockStart = html.indexOf('function authBlockAccount(index)');
const blockEnd = html.indexOf('\n', html.indexOf("notify('O navegador não permitiu salvar a alteração.')}", blockStart)) + 1;

if (start < 0 || blockStart < 0) {
  console.error('markers not found', start, blockStart);
  process.exit(1);
}

const replacement = `function authPurgeAccountExtras(storeKey){
  const prefixes=[
    AUTH_BLOCK,
    'lojasg.estoque99.pc-account:',
    'lojasg.estoque99.cloud-email:',
    'lojasg.estoque99.cloud-pw:',
    'lojasg.estoque99.cloud-verify:',
    'lojasg.estoque99.totp:',
    'lojasg.estoque99.vault:',
    'lojasg.estoque99.chat:',
    'lojasg.estoque99.agents:',
    'lojasg.estoque99.lgpd-ok:',
    'lojasg.estoque99.email-reports:',
    'lojasg.estoque99.email-sent:',
    'lojasg.estoque99.aux-profile:',
    'lojasg.estoque99.members:',
    'lojasg.estoque99.sync-since:',
    'lojasg.estoque99.sync-old:',
    'lojasg.estoque99.sync-feed:',
    'lojasg.estoque99.presence:',
    'lojasg.estoque99.nfping:',
    'lojasg.estoque99.invite-id:',
    'lojasg.estoque99.profile-pub:',
    'lojasg.estoque99.sheets:',
    'lojasg.estoque99.robot-groq:',
    'lojasg.estoque99.robot:',
    'lojasg.estoque99.agent-brief:',
    'lojasg.estoque99.autopilot:',
    'lojasg.estoque99.err-n:',
    'lojasg.estoque99.store-renamed:',
    'lojasg.estoque99.profile-seen:',
    'lojasg.estoque99.perm-asked:',
    'lojasg.estoque99.perm-camera:',
    'lojasg.estoque99.perm-sound:',
    'lojasg.estoque99.anim-theme:',
    'lojasg.estoque99.cloud-daily:'
  ];
  try{
    for(const p of prefixes){try{localStorage.removeItem(p+storeKey)}catch(e){}}
    const doomed=[];
    for(let i=0;i<localStorage.length;i++){
      const k=localStorage.key(i);
      if(k&&k!==storeKey&&k.indexOf(storeKey)>=0&&k.indexOf('lojasg.estoque99.')===0)doomed.push(k);
    }
    for(const k of doomed){try{localStorage.removeItem(k)}catch(e){}}
  }catch(e){}
}
function renderAdmin(){
  if(!authSession||authSession.payload.role!=='gestor')return '<div class="notice">Acesso restrito ao ADM local.</div>';
  const rows=authAccounts();
  const others=rows.filter(r=>r.key!==authSession.storeKey).length;
  return hero('Administração local','Contas neste navegador. Só o gestor pode apagar contas daqui.')
    +`<div class="panel help"><h2>Contas cadastradas</h2>
<p>Você pode <b>bloquear</b> ou <b>apagar</b> contas neste aparelho. Apagar remove a conta e os dados locais dela de forma permanente. O ADM não lê senhas nem o conteúdo criptografado de outras contas.</p>
${others?`<p><button class="danger" onclick="authDeleteAllOtherAccounts()">Apagar todas as outras contas (${others})</button></p>`:''}
<div class="admin-list">${rows.map((r,i)=>`<div class="admin-account"><div><b>${esc(r.login)}</b><div class="small">${r.id?esc(r.id)+' · ':''}${r.blocked?'Bloqueado':'Ativo'}${r.key===authSession.storeKey?' · Seu acesso ADM':''}</div></div>${r.key===authSession.storeKey?'':`<span style="display:flex;gap:8px;flex-wrap:wrap"><button onclick="authBlockAccount(${i})">${r.blocked?'Liberar':'Bloquear'}</button><button class="danger" onclick="authDeleteAccount(${i})">Apagar</button></span>`}</div>`).join('')}</div>
<p class="small">Este controle é <b>local neste navegador</b>. Contas criadas em outros celulares ou PCs só podem ser apagadas nesses aparelhos (ou pelo gestor logado neles). Não existe lista central de contas no servidor.</p></div>`;
}
function authBlockAccount(index){
  if(!authSession||authSession.payload.role!=='gestor')return;
  const row=authAccounts()[index];
  if(!row||row.key===authSession.storeKey)return;
  if(!confirm((row.blocked?'Liberar':'Bloquear')+' acesso de '+row.login+' neste navegador?'))return;
  try{
    localStorage.setItem(AUTH_BLOCK+row.key,row.blocked?'no':'yes');
    render();
    notify('Acesso atualizado. Os cadastros foram preservados.');
  }catch(e){notify('O navegador não permitiu salvar a alteração.')}
}
function authDeleteAccount(index){
  if(!authSession||authSession.payload.role!=='gestor')return;
  const row=authAccounts()[index];
  if(!row||row.key===authSession.storeKey){notify('Você não pode apagar a própria conta gestor por aqui.');return}
  if(!confirm('APAGAR definitivamente a conta "'+row.login+'" neste navegador?\\n\\nIsso remove a conta e os dados locais dela. Não dá para desfazer.'))return;
  if(!confirm('Confirme de novo: apagar "'+row.login+'"?'))return;
  try{
    localStorage.removeItem(row.key);
    authPurgeAccountExtras(row.key);
    render();
    notify('Conta "'+row.login+'" apagada neste aparelho.');
  }catch(e){notify('Não foi possível apagar a conta.')}
}
function authDeleteAllOtherAccounts(){
  if(!authSession||authSession.payload.role!=='gestor')return;
  const rows=authAccounts().filter(r=>r.key!==authSession.storeKey);
  if(!rows.length){notify('Não há outras contas neste navegador.');return}
  if(!confirm('APAGAR as '+rows.length+' outra(s) conta(s) neste navegador, mantendo só a sua ('+authSession.record.login+')?\\n\\nNão dá para desfazer.'))return;
  if(!confirm('Última confirmação: apagar todas as outras contas locais?'))return;
  let n=0;
  try{
    for(const row of rows){
      localStorage.removeItem(row.key);
      authPurgeAccountExtras(row.key);
      n++;
    }
    render();
    notify(n+' conta(s) apagada(s). Só a sua permanece neste aparelho.');
  }catch(e){notify('Falha ao apagar algumas contas.');render()}
}
`;

html = html.slice(0, start) + replacement + html.slice(blockEnd);
html = html.replace(/(estoque99-version" content=")(\d+)(")/, (_, a, v, c) => a + '77' + c);

let sw = readFileSync('sw.js', 'utf8');
sw = sw.replace(/estoque99-v\d+/, 'estoque99-v77');
writeFileSync('sw.js', sw);
writeFileSync('index.html', html);

if (!html.includes('function authDeleteAccount')) throw new Error('patch failed');
console.log('OK admin delete + v77, size', html.length);
