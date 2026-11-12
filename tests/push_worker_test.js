// node tests/push_worker_test.js — Worker de Web Push (push/worker.js)
const path = require('path');
const { pathToFileURL } = require('url');
const S = crypto.subtle, te = new TextEncoder();
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('PASS', m); } else { fail++; console.log('FAIL', m); } };

(async () => {
  const W = await import(pathToFileURL(path.join(__dirname, '../push/worker.js')).href);
  const { b64u } = W;
  const hmac = async (k, d) => new Uint8Array(await S.sign('HMAC', await S.importKey('raw', k, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']), d));
  const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };

  // Chaves VAPID de teste (geradas agora, nunca gravadas)
  const vk = await S.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
  const vPub = b64u.enc(await S.exportKey('raw', vk.publicKey));
  const vPriv = (await S.exportKey('jwk', vk.privateKey)).d;
  // Inscrição falsa do navegador
  const ua = await S.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const uaPub = new Uint8Array(await S.exportKey('raw', ua.publicKey));
  const auth = crypto.getRandomValues(new Uint8Array(16));
  const sub = { endpoint: 'https://push.example.com/ab/cd', keys: { p256dh: b64u.enc(uaPub), auth: b64u.enc(auth) } };

  async function verifyJwt(h) {
    const m = /^vapid t=([^,]+), k=(.+)$/.exec(h); if (!m) return null;
    const [a, b, s] = m[1].split('.');
    const pk = await S.importKey('raw', b64u.dec(m[2]), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
    const v = await S.verify({ name: 'ECDSA', hash: 'SHA-256' }, pk, b64u.dec(s), te.encode(a + '.' + b));
    return { v, k: m[2], claims: JSON.parse(new TextDecoder().decode(b64u.dec(b))) };
  }
  async function decrypt(body) {
    const salt = body.slice(0, 16), idlen = body[20], asPub = body.slice(21, 21 + idlen), ct = body.slice(21 + idlen);
    const as = await S.importKey('raw', asPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
    const sh = new Uint8Array(await S.deriveBits({ name: 'ECDH', public: as }, ua.privateKey, 256));
    const ikm = await hmac(await hmac(auth, sh), cat(te.encode('WebPush: info\0'), uaPub, asPub, new Uint8Array([1])));
    const prk = await hmac(salt, ikm);
    const cek = (await hmac(prk, cat(te.encode('Content-Encoding: aes128gcm\0'), new Uint8Array([1])))).slice(0, 16);
    const nonce = (await hmac(prk, cat(te.encode('Content-Encoding: nonce\0'), new Uint8Array([1])))).slice(0, 12);
    const pt = new Uint8Array(await S.decrypt({ name: 'AES-GCM', iv: nonce }, await S.importKey('raw', cek, 'AES-GCM', false, ['decrypt']), ct));
    let e = pt.length - 1; while (pt[e] === 0) e--; ok(pt[e] === 2, 'delimitador 0x02 no fim');
    return new TextDecoder().decode(pt.slice(0, e));
  }

  // 1. VAPID assinado e verificável
  const j = await verifyJwt(await W.vapidAuth(sub.endpoint, vPub, vPriv));
  ok(j && j.v, 'assinatura VAPID ES256 verificável');
  ok(j.claims.aud === 'https://push.example.com' && j.claims.exp > Date.now() / 1000, 'aud/exp corretos');
  // 2. aes128gcm decifrável
  const body = await W.encryptPayload('{"x":1}', sub.keys.p256dh, sub.keys.auth);
  ok(new DataView(body.buffer).getUint32(16) === 4096 && body[20] === 65, 'cabeçalho aes128gcm (rs=4096, idlen=65)');
  ok(await decrypt(body) === '{"x":1}', 'payload decifrado igual ao original');

  // Ambiente falso
  const kv = new Map(); const env = { VAPID_PUBLIC: vPub, VAPID_PRIVATE: vPriv, SUBS: { get: async k => kv.get(k) ?? null, put: async (k, v) => { kv.set(k, v); } } };
  const sent = []; let status = 201;
  globalThis.fetch = async (url, o) => { sent.push({ url, o }); return new Response(null, { status }); };
  const O = 'https://vferreiras.github.io';
  const call = (p, m, b, origin = O, ip = '1.1.1.1') => W.default.fetch(new Request('https://w.dev' + p, { method: m, headers: { Origin: origin, 'CF-Connecting-IP': ip, 'Content-Type': 'application/json' }, body: JSON.stringify(b) }), env);

  ok((await call('/sub', 'POST', { lojaId: 'loja1', sub })).status === 200, 'POST /sub salva');
  ok(JSON.parse(kv.get('loja:loja1')).length === 1, 'inscrição no KV');
  ok((await call('/sub', 'POST', { lojaId: 'loja1', sub: { endpoint: 'http://x' } })).status === 400, 'inscrição inválida recusada');
  ok((await call('/send', 'POST', { lojaId: 'loja1', tipo: 'nf' }, 'https://evil.example')).status === 403, 'origem estranha recusada');
  ok((await call('/send', 'POST', { lojaId: 'loja1', tipo: 'livre', title: 'NF 123 R$' })).status === 400, 'tipo livre recusado');
  const r = await call('/send', 'POST', { lojaId: 'loja1', tipo: 'nf', title: 'NF 999 fornecedor X' }, 'https://gen-lang-client-0167474823-295e1.web.app');
  ok(r.status === 200 && sent.length === 1, 'POST /send envia (origem Firebase)');
  const h = sent[0].o.headers;
  ok(h['Content-Encoding'] === 'aes128gcm' && (await verifyJwt(h.Authorization)).v, 'envio com VAPID válido');
  const msg = JSON.parse(await decrypt(sent[0].o.body));
  ok(msg.body === 'Nova nota fiscal' && !JSON.stringify(msg).includes('999'), 'só texto fixo, nada da nota');
  status = 410; await call('/send', 'POST', { lojaId: 'loja1', tipo: 'chat' });
  ok(JSON.parse(kv.get('loja:loja1')).length === 0, 'inscrição 410 apagada');
  await call('/sub', 'POST', { lojaId: 'loja1', sub });
  ok((await call('/sub', 'DELETE', { lojaId: 'loja1', sub: { endpoint: sub.endpoint } })).status === 200 && JSON.parse(kv.get('loja:loja1')).length === 0, 'DELETE /sub remove');

  // Limite 30/min por IP
  W._resetLimite(); let last;
  for (let i = 0; i < 31; i++) last = await call('/send', 'POST', { lojaId: 'loja1', tipo: 'prazo' }, O, '9.9.9.9');
  ok(last.status === 429 && last.headers.get('Retry-After') === '60', '31ª requisição no minuto = 429');
  ok((await call('/send', 'POST', { lojaId: 'loja1', tipo: 'prazo' }, O, '8.8.8.8')).status === 200, 'outro IP segue livre');

  console.log(`\n${pass} PASS, ${fail} FAIL`); process.exit(fail ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
