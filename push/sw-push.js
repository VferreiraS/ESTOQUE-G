// Trecho para colar no sw.js (versão futura). Mostra o aviso e abre o app ao tocar.
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (_) {}
  const ok = { nf: 'Nova nota fiscal', chat: 'Mensagem nova no chat', prazo: 'Prazo vencendo' };
  const body = ok[d.tipo] || 'Novidade no Stok';
  e.waitUntil(self.registration.showNotification('Stok', {
    body, tag: 'stok-' + (d.tipo || 'aviso'), renotify: true,
    icon: 'icons/icon-192-v123.png', badge: 'icons/icon-192-v123.png', data: { tipo: d.tipo },
  }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const page = { nf: '#nfs', chat: '#chat', prazo: '#alertas' }[(e.notification.data || {}).tipo] || '';
  const url = new URL('./' + page, self.registration.scope).href;
  e.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    for (const c of l) if (c.url.startsWith(self.registration.scope)) { c.focus(); return c.navigate ? c.navigate(url) : null; }
    return clients.openWindow(url);
  }));
});
