/* Estoque 99 · service worker: abre sem internet e permite instalar como app. */
const CACHE_PREFIX = 'estoque99-';
const CACHE = 'estoque99-v103';
const VERSION = (CACHE.match(/-v(\d+)$/) || [])[1] || '';
const CORE = [
  './index.html',
  './manifest.webmanifest',
  './privacidade.html',
  './termos.html',
  './icons/apple-touch-v36.png',
  './icons/icon-192-v36.png',
  './icons/icon-512-v36.png',
  './icons/icon-maskable-v36.png',
  './icons/favicon-v36.png',
  /* v86: bibliotecas carregadas sob demanda ficam guardadas para funcionar sem internet */
  './vendor/zxing.min.js',
  './vendor/fuse.min.js',
  './vendor/flatpickr.min.js',
  './vendor/flatpickr.css',
  './vendor/fonts/oswald-latin.woff2',
  './vendor/fonts/oswald-latin-ext.woff2'
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
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => clients.forEach((c) => c.postMessage({ type: 'page-updated', version: VERSION })))
  );
});

async function networkFirst(event, request, page) {
  const cache = await caches.open(CACHE);
  const net = fetch(request, { cache: 'no-cache' });
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
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
    if (typeof page !== 'string') return (await cache.match(page)) || Response.error();
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
  const legal = url.pathname.match(/\/(privacidade|termos)\.html$/);
  /* v89: só a raiz do app e o index.html são guardados como './index.html'; outras páginas (ex.: central-agentes/) ficam com o próprio endereço */
  const scope = new URL(self.registration ? self.registration.scope : './', self.location).pathname;
  const app = url.pathname === scope || url.pathname === scope + 'index.html';
  if (app || robot || legal) {
    event.respondWith(networkFirst(event, request, robot ? './robo.html' : legal ? './' + legal[1] + '.html' : './index.html'));
    return;
  }
  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(event, request, request));
    return;
  }
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const hit = await cache.match(request);
    if (hit) return hit;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone()).catch(() => {});
    return response;
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const page = (event.notification.data && event.notification.data.page) || 'alerts';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const target = './#abrir=' + encodeURIComponent(page);
      const main = clients.find((c) => !/(robo|privacidade|termos)\.html/.test(c.url));
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
