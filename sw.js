/* Estoque 99 · service worker: abre sem internet e permite instalar como app. */
const CACHE_PREFIX = 'estoque99-';
const CACHE = 'estoque99-v137';
const VERSION = (CACHE.match(/-v(\d+)$/) || [])[1] || '';
/* v135: blocos do app (antes inline no index.html). A versão vai no endereço (?v=) para nunca misturar HTML novo com JS velho.
   Arquivo novo em app/ = acrescentar aqui e no index.html. */
const APP_FILES = [
  'app/css/visual-effects-grupo.css',
  'app/js/site-theme.js',
  'app/css/base-1.css',
  'app/css/mobile-edition.css',
  'app/js/onerror.js',
  'app/js/core.js',
  'app/js/view-motion.js',
  'app/css/device-compat.css',
  'app/js/device-compat.js',
  'app/css/auth-redesign-grupo.css',
  'app/js/auth-redesign.js',
  'app/css/ds-grupo.css',
  'app/js/seasons.js',
  'app/css/share-reports.css',
  'app/js/share-reports.js',
  'app/css/nf-ocr.css',
  'app/js/nf-ocr.js',
  'app/css/mono-grupo.css',
  'app/js/login-motion.js',
  'app/css/remember-email.css',
  'app/js/remember.js',
  'app/js/email-reports.js',
  'app/css/account-stats.css',
  'app/js/account-stats.js',
  'app/css/chat.css',
  'app/js/chat.js',
  'app/css/painel.css',
  'app/js/painel.js',
  'app/css/sync.css',
  'app/js/sync.js',
  'app/css/plano-aux.css',
  'app/js/plano-aux.js',
  'app/css/corridor-import.css',
  'app/js/corridor-import.js',
  'app/js/notify.js',
  'app/css/space.css',
  'app/js/rekey.js',
  'app/css/glow.css',
  'app/js/glow.js',
  'app/css/profile.css',
  'app/js/profile.js',
  'app/css/dedupe.css',
  'app/js/dedupe.js',
  'app/js/delete-account.js',
  'app/js/hybrid-admin.js',
  'app/js/team-diag.js',
  'app/js/sheets.js',
  'app/js/cartazes.js',
  'app/js/reset.js',
  'app/css/ptr.css',
  'app/js/ptr.js',
  'app/css/anim.css',
  'app/js/anim.js',
  'app/css/intro.css',
  'app/js/intro.js',
  'app/css/cloud.css',
  'app/js/cloud.js',
  'app/css/social.css',
  'app/js/social.js',
  'app/js/erros.js',
  'app/css/theme-anim.css',
  'app/js/theme-anim.js',
  'app/css/mail-recover.css',
  'app/js/mail-recover.js',
  'app/js/login-fix.js',
  'app/css/lgpd.css',
  'app/js/lgpd.js',
  'app/js/update-check.js',
  'app/css/login-clean.css',
  'app/js/login-clean.js',
  'app/css/fluid-grupo.css',
  'app/js/v86.js',
  'app/css/v90.css',
  'app/js/v90.js',
  'app/css/v91.css',
  'app/js/v92-som.js',
  'app/css/v95-colar.css',
  'app/js/v95-colar.js',
  'app/css/conf.css',
  'app/js/conf.js',
  'app/js/v101.js',
  'app/js/v102.js',
  'app/js/v103.js',
  'app/css/v103-grupo.css',
  'app/js/v105.js',
  'app/css/v106-chat-grupo.css',
  'app/js/v110.js',
  'app/js/v111.js',
  'app/css/v112.css',
  'app/js/v112.js',
  'app/js/v114-logo.js',
  'app/css/v116-s.css',
  'app/js/v116-s.js',
  'app/css/v117.css',
  'app/js/v117.js',
  'app/js/v118-som.js',
  'app/js/v120-limite.js',
  'app/js/v121.js',
  'app/js/v122.js',
  'app/css/v123.css',
  'app/js/v123.js',
  'app/css/v124.css',
  'app/js/v124.js',
  'app/css/v127.css',
  'app/js/v127.js',
  'app/css/v128.css',
  'app/js/v128.js',
  'app/css/v129.css',
  'app/js/v129.js',
  'app/css/v130.css',
  'app/js/v130.js',
  'app/js/v131.js',
  'app/css/v132.css',
  'app/js/v132.js',
  'app/css/v133.css',
  'app/js/v133.js',
  'app/css/v134.css',
  'app/js/v134.js',
  'app/js/v136.js',
  'app/css/v137.css',
  'app/js/v137.js'
];
const CORE = [
  './index.html',
  './manifest.webmanifest',
  './privacidade.html',
  './termos.html',
  './icons/apple-touch-v123.png',
  './icons/icon-192-v123.png',
  './icons/icon-512-v123.png',
  './icons/icon-maskable-v123.png',
  './icons/favicon-v123.png',
  /* v86: bibliotecas carregadas sob demanda ficam guardadas para funcionar sem internet */
  './vendor/zxing.min.js',
  './vendor/fuse.min.js',
  './vendor/flatpickr.min.js',
  './vendor/flatpickr.css',
  './vendor/fonts/oswald-latin.woff2',
  './vendor/fonts/oswald-latin-ext.woff2',
  /* v112: fontes novas (títulos Space Grotesk, texto Inter) */
  './vendor/fonts/inter-latin.woff2',
  './vendor/fonts/inter-latin-ext.woff2',
  './vendor/fonts/space-grotesk-latin.woff2',
  './vendor/fonts/space-grotesk-latin-ext.woff2'
].concat(APP_FILES.map((f) => './' + f + '?v=' + VERSION));

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
  /* v89: só a raiz do app e o index.html são guardados como './index.html'; outras páginas (ex.: privacidade.html) ficam com o próprio endereço */
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
