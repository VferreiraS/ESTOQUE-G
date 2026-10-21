/* Estoque 99 · service worker: abre sem internet e permite instalar como app. */
const CACHE = 'estoque99-v55';
const VERSION = (CACHE.match(/-v(\d+)$/) || [])[1] || '';
const CORE = [
  './index.html',
  './manifest.webmanifest',
  './icons/apple-touch-v36.png',
  './icons/icon-192-v36.png',
  './icons/icon-512-v36.png',
  './icons/icon-maskable-v36.png',
  './icons/favicon-v36.png'
];

self.addEventListener('install', (event) => {
  // cache:'reload' busca direto da internet: o cache HTTP do navegador (10 min no GitHub Pages) pode ter a versão anterior.
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      // avisa as páginas abertas qual versão assumiu; só as mais velhas recarregam
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => clients.forEach((c) => c.postMessage({ type: 'page-updated', version: VERSION })))
  );
});

// Página: busca a versão mais nova na internet (o tempo limite vale só até a resposta começar a chegar);
// sem conexão ou muito lenta, usa a cópia salva e termina de baixar a nova em segundo plano, avisando a página aberta.
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
      const m = text.match(/name="estoque99-version" content="(\d+)"/);
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
  if (url.origin !== self.location.origin) return; // consultas externas (CEP, CNPJ) passam direto
  if (url.pathname.endsWith('/sw.js') || request.cache === 'no-store') return; // checagem de versão vai sempre à internet

  const robot = url.pathname.endsWith('/robo.html');
  if (request.mode === 'navigate' || url.pathname.endsWith('/index.html') || robot) {
    event.respondWith(networkFirst(event, request, robot ? './robo.html' : './index.html'));
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

// Toque na notificação: abre o site na central de alertas.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const page = (event.notification.data && event.notification.data.page) || 'alerts';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const target = './#abrir=' + encodeURIComponent(page);
      const main = clients.find((c) => !/robo\.html/.test(c.url));
      if (main) {
        main.postMessage({ type: 'open-page', page });
        if (page === 'alerts') main.postMessage({ type: 'open-alerts' });
        if ('focus' in main) return main.focus();
      }
      // Só a página do robô está aberta: leva ela para o site principal, já na página do aviso.
      if (clients[0] && 'navigate' in clients[0]) return clients[0].navigate(target).then((c) => c && c.focus && c.focus());
      return self.clients.openWindow(target);
    })
  );
});
