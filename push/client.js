// Trecho para colar no index.html (versão futura).
// PUSH_URL = endereço do Worker; VAPID_PUBLIC = chave PÚBLICA (pode ficar no app).
(function () {
  const PUSH_URL = 'https://stok-push.SEU-USUARIO.workers.dev';
  const VAPID_PUBLIC = 'COLE_A_CHAVE_PUBLICA';
  const dec = s => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4)), c => c.charCodeAt(0));
  const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const installed = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

  // Diz se dá para ligar os avisos aqui (no iPhone só no app da tela inicial, iOS 16.4+).
  window.e99PushPode = function () {
    if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) return { ok: false, why: 'Este navegador não tem avisos.' };
    if (isIOS() && !installed()) return { ok: false, why: 'No iPhone, adicione o Stok à Tela de Início e abra por lá.' };
    return { ok: true };
  };
  // Chamar só dentro de um toque (botão "Ligar avisos").
  window.e99PushLigar = async function (lojaId) {
    const p = e99PushPode(); if (!p.ok) return p;
    if (await Notification.requestPermission() !== 'granted') return { ok: false, why: 'Permissão negada.' };
    const reg = await navigator.serviceWorker.ready;
    const sub = (await reg.pushManager.getSubscription()) || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: dec(VAPID_PUBLIC) });
    const r = await fetch(PUSH_URL + '/sub', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lojaId, sub: sub.toJSON() }) });
    return { ok: r.ok };
  };
  window.e99PushDesligar = async function (lojaId) {
    const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription();
    if (!sub) return { ok: true };
    await fetch(PUSH_URL + '/sub', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lojaId, sub: { endpoint: sub.endpoint } }) }).catch(() => {});
    await sub.unsubscribe(); return { ok: true };
  };
  // tipo: 'nf' | 'chat' | 'prazo' — nada da nota sai do aparelho.
  window.e99PushAvisar = function (lojaId, tipo) {
    return fetch(PUSH_URL + '/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ lojaId, tipo }) }).catch(() => null);
  };
})();
