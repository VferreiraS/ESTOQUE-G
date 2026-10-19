/* Estoque 99 · service worker: abre sem internet e permite instalar como app. */
const CACHE = 'estoque99-v20';
const CORE = [
  './',
  './index.html',
  './robo.html',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/favicon-32.png',
  './icons/mascote.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Página: busca a versão mais nova na internet; sem conexão, usa a cópia salva.
async function networkFirst(request, page) {
  const cache = await caches.open(CACHE);
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 6000));
    const response = await Promise.race([fetch(request, { cache: 'no-cache' }), timeout]);
    if (response && response.ok && !response.redirected) cache.put(page, response.clone());
    return response;
  } catch (err) {
    return (await cache.match(page)) || (await cache.match('./index.html')) || (await cache.match('./')) || Response.error();
  }
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // consultas externas (CEP, CNPJ) passam direto

  const robot = url.pathname.endsWith('/robo.html');
  if (request.mode === 'navigate' || url.pathname.endsWith('/index.html') || robot) {
    event.respondWith(networkFirst(request, robot ? './robo.html' : './index.html'));
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
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        client.postMessage({ type: 'open-alerts' });
        if ('focus' in client) return client.focus();
      }
      return self.clients.openWindow('./');
    })
  );
});
