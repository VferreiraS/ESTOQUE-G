#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');
if (html.includes('function authNewAccountId')) {
  console.log('Already patched');
  process.exit(0);
}

const marker = 'async function authCreate(';
const insert = `function authNewAccountId(){const bytes=crypto.getRandomValues(new Uint8Array(12));const alphabet='0123456789ABCDEFGHJKMNPQRSTVWXYZ';let s='STK-';for(const b of bytes)s+=alphabet[b%32];return s}
function authEnsureId(record){if(record&&typeof record.id==='string'&&/^STK-[0-9A-HJKMNP-TV-Z]{12}$/.test(record.id))return record;return Object.assign({},record,{id:authNewAccountId()})}
function authPersistId(storeKey,record){try{const raw=localStorage.getItem(storeKey);if(!raw)return;const stored=JSON.parse(raw);if(stored&&!stored.id&&record.id){stored.id=record.id;localStorage.setItem(storeKey,JSON.stringify(stored))}}catch(e){}}
async function authCreate(`;
if (!html.includes(marker)) throw new Error('authCreate not found');
html = html.replace(marker, insert);

const pairs = [
  [
    "const record={format:'estoque99-conta-v1',login:authLoginName(login),salt:authB64(crypto.getRandomValues(new Uint8Array(16))),revision:1};",
    "const record={format:'estoque99-conta-v1',id:authNewAccountId(),login:authLoginName(login),salt:authB64(crypto.getRandomValues(new Uint8Array(16))),revision:1};"
  ],
  [
    "function authCheckRecord(r){if(!r||r.format!=='estoque99-conta-v1'||typeof r.login!=='string'",
    "function authCheckRecord(r){if(!r||r.format!=='estoque99-conta-v1'||(r.id!==undefined&&(typeof r.id!=='string'||!/^STK-[0-9A-HJKMNP-TV-Z]{12}$/.test(r.id)))||typeof r.login!=='string'"
  ],
  [
    "function authEnter(session){authShownCode=null;bioSetup=null;authRecoveryShow=null;authMode='login';",
    "function authEnter(session){session.record=authEnsureId(session.record);authPersistId(session.storeKey,session.record);authShownCode=null;bioSetup=null;authRecoveryShow=null;authMode='login';"
  ],
  [
    "function renderAccount(){return hero('Minha conta',esc(authSession.payload.store)+' · '+esc(authSession.record.login))+`<div class=\"grid2\"><div class=\"panel help\"><h2>Seu acesso local</h2><p>Tipo: ${authSession.payload.role==='gestor'?'Site Gestor — Estoque 99':authSession.payload.role==='auxiliar'?'Auxiliar':'Conta de estoque'}.</p><button class=\"primary\" onclick=\"authExport()\">Exportar conta protegida</button>",
    "function renderAccount(){return hero('Minha conta',esc(authSession.payload.store)+' · '+esc(authSession.record.login))+`<div class=\"grid2\"><div class=\"panel help\"><h2>Seu acesso local</h2><p>Tipo: ${authSession.payload.role==='gestor'?'Site Gestor — Estoque 99':authSession.payload.role==='auxiliar'?'Auxiliar':'Conta de estoque'}.</p><p><b>ID da conta:</b> <code>${esc(authSession.record.id||'—')}</code> <button type=\"button\" style=\"padding:4px 8px;font-size:12px\" onclick=\"navigator.clipboard.writeText(authSession.record.id||'').then(()=>notify('ID copiado.'),()=>notify('Não foi possível copiar.'))\">Copiar</button></p><p class=\"small\">Este ID identifica a conta em qualquer aparelho.</p><button class=\"primary\" onclick=\"authExport()\">Exportar conta protegida</button>"
  ],
  [
    "authDownload(record,'conta-estoque-protegida-'+iso()+'.json');",
    "authDownload(record,'conta-'+(authSession.record.id||'estoque')+'-'+iso()+'.json');"
  ],
  [
    "rows.push({key,login:r.login,blocked:authIsBlocked(key)})",
    "rows.push({key,login:r.login,id:r.id||'',blocked:authIsBlocked(key)})"
  ],
  [
    'rows.map((r,i)=>`<div class="admin-account"><div><b>${esc(r.login)}</b><div class="small">${r.blocked?\'Bloqueado\':\'Ativo\'}${r.key===authSession.storeKey?\' · Seu acesso ADM\':\'\'}</div></div>',
    'rows.map((r,i)=>`<div class="admin-account"><div><b>${esc(r.login)}</b><div class="small">${r.id?esc(r.id)+\' · \':\'\'}</div>${r.blocked?\'Bloqueado\':\'Ativo\'}${r.key===authSession.storeKey?\' · Seu acesso ADM\':\'\'}</div></div>'
  ],
];

for (const [a, b] of pairs) {
  if (!html.includes(a)) {
    console.warn('pattern missing, skip:', a.slice(0, 60));
    continue;
  }
  html = html.replace(a, b);
  console.log('ok', a.slice(0, 40));
}

html = html.replace(/(estoque99-version" content=")(\d+)(")/, '$176$3');
html = html.replace(/vferrreiras/g, 'vferreiras');

if (!html.includes('authNewAccountId') || !html.includes('ID da conta')) {
  throw new Error('patch incomplete');
}

writeFileSync('index.html', html);
console.log('index.html patched, size', html.length);

const sw = `/* Estoque 99 · service worker: abre sem internet e permite instalar como app. */
const CACHE = 'estoque99-v76';
const VERSION = (CACHE.match(/-v(\\d+)$/) || [])[1] || '';
const CORE = [
  './index.html',
  './manifest.webmanifest',
  './privacidade.html',
  './termos.html',
  './icons/apple-touch-v36.png',
  './icons/icon-192-v36.png',
  './icons/icon-512-v36.png',
  './icons/icon-maskable-v36.png',
  './icons/favicon-v36.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(async (c) => {
      await Promise.all(CORE.map(async (u) => {
        try {
          const response = await fetch(new Request(u, { cache: 'reload' }));
          if (response && response.ok) await c.put(u, response);
        } catch (e) {}
      }));
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => clients.forEach((c) => c.postMessage({ type: 'page-updated', version: VERSION })))
  );
});

async function networkFirst(event, request, page) {
  const cache = await caches.open(CACHE);
  const net = fetch(request, { cache: 'no-cache' });
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000));
    const response = await Promise.race([net, timeout]);
    if (response && response.ok && !response.redirected) event.waitUntil(cache.put(page, response.clone()).catch(() => {}));
    return response;
  } catch (err) {
    event.waitUntil(net.then(async (response) => {
      if (!response || !response.ok || response.redirected) return;
      await cache.put(page, response.clone());
      const text = await response.text();
      const m = text.match(/name="estoque99-version" content="(\\d+)"/);
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((c) => c.postMessage({ type: 'page-updated', version: m ? m[1] : '' }));
    }).catch(() => {}));
    return (await cache.match(page)) || (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/sw.js') || request.cache === 'no-store') return;

  const robot = url.pathname.endsWith('/robo.html');
  const legal = url.pathname.match(/\\/(privacidade|termos)\\.html$/);
  if (request.mode === 'navigate' || url.pathname.endsWith('/index.html') || robot || legal) {
    event.respondWith(networkFirst(event, request, robot ? './robo.html' : legal ? './' + legal[1] + '.html' : './index.html'));
    return;
  }
  event.respondWith(
    caches.match(request).then((hit) => hit || fetch(request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
      }
      return response;
    }))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const page = (event.notification.data && event.notification.data.page) || 'alerts';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const target = './#abrir=' + encodeURIComponent(page);
      const main = clients.find((c) => !/(robo|privacidade|termos)\\.html/.test(c.url));
      if (main) {
        main.postMessage({ type: 'open-page', page });
        if (page === 'alerts') main.postMessage({ type: 'open-alerts' });
        if ('focus' in main) return main.focus();
      }
      if (clients[0] && 'navigate' in clients[0]) return clients[0].navigate(target).then((c) => c && c.focus && c.focus());
      return self.clients.openWindow(target);
    })
  );
});
`;
writeFileSync('sw.js', sw);
console.log('sw.js -> v76');
