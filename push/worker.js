// Stok · Estoque 99 — Worker de avisos com o app fechado (Web Push).
// Sem bibliotecas: VAPID (RFC 8292) e cifragem aes128gcm (RFC 8291/8188) com WebCrypto.
// Nunca recebe dados das notas: /send só aceita um "tipo" e manda um texto fixo.

const ORIGENS = ['https://vferreiras.github.io', 'https://gen-lang-client-0167474823-295e1.web.app'];
const TEXTOS = {
  nf: { title: 'Stok', body: 'Nova nota fiscal' },
  chat: { title: 'Stok', body: 'Mensagem nova no chat' },
  prazo: { title: 'Stok', body: 'Prazo vencendo' },
};
const LIMITE = 30, JANELA = 60000, MAX_SUBS = 200;
const enc = new TextEncoder();
const hits = new Map();

export const b64u = {
  enc(buf) { const b = new Uint8Array(buf); let s = ''; for (const c of b) s += String.fromCharCode(c); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); },
  dec(str) { const s = atob(String(str).replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((String(str).length + 3) % 4)); return Uint8Array.from(s, c => c.charCodeAt(0)); },
};
const cat = (...a) => { const o = new Uint8Array(a.reduce((n, x) => n + x.length, 0)); let i = 0; for (const x of a) { o.set(x, i); i += x.length; } return o; };
async function hmac(key, data) {
  const k = await crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', k, data));
}

// ---- VAPID (JWT ES256) ----
export async function vapidAuth(endpoint, pubB64, privB64, sub = 'https://vferreiras.github.io/ESTOQUE-G/') {
  const pub = b64u.dec(pubB64);
  const key = await crypto.subtle.importKey('jwk', {
    kty: 'EC', crv: 'P-256', d: privB64, x: b64u.enc(pub.slice(1, 33)), y: b64u.enc(pub.slice(33, 65)), ext: true,
  }, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const head = b64u.enc(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const body = b64u.enc(enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub })));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(head + '.' + body));
  return `vapid t=${head}.${body}.${b64u.enc(sig)}, k=${pubB64}`;
}

// ---- Cifragem aes128gcm (RFC 8291) ----
export async function encryptPayload(text, p256dhB64, authB64, salt = crypto.getRandomValues(new Uint8Array(16))) {
  const uaPub = b64u.dec(p256dhB64), auth = b64u.dec(authB64);
  const as = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPub = new Uint8Array(await crypto.subtle.exportKey('raw', as.publicKey));
  const ua = await crypto.subtle.importKey('raw', uaPub, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const shared = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: ua }, as.privateKey, 256));
  const prkKey = await hmac(auth, shared);
  const ikm = await hmac(prkKey, cat(enc.encode('WebPush: info\0'), uaPub, asPub, new Uint8Array([1])));
  const prk = await hmac(salt, ikm);
  const cek = (await hmac(prk, cat(enc.encode('Content-Encoding: aes128gcm\0'), new Uint8Array([1])))).slice(0, 16);
  const nonce = (await hmac(prk, cat(enc.encode('Content-Encoding: nonce\0'), new Uint8Array([1])))).slice(0, 12);
  const k = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, k, cat(enc.encode(text), new Uint8Array([2]))));
  const head = new Uint8Array(21); head.set(salt); new DataView(head.buffer).setUint32(16, 4096); head[20] = 65;
  return cat(head, asPub, ct);
}

// ---- Rotas ----
function cors(origin) {
  return { 'Access-Control-Allow-Origin': origin, 'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
}
const resp = (o, st, h) => new Response(JSON.stringify(o), { status: st, headers: { 'Content-Type': 'application/json', ...h } });
const lojaOk = l => typeof l === 'string' && /^[A-Za-z0-9_-]{3,64}$/.test(l);
function subOk(s) {
  try {
    return s && typeof s.endpoint === 'string' && s.endpoint.length < 1000 && new URL(s.endpoint).protocol === 'https:'
      && b64u.dec(s.keys.p256dh).length === 65 && b64u.dec(s.keys.auth).length === 16;
  } catch { return false; }
}
function limitado(ip, now = Date.now()) {
  const a = (hits.get(ip) || []).filter(t => now - t < JANELA);
  if (a.length >= LIMITE) { hits.set(ip, a); return true; }
  a.push(now); hits.set(ip, a);
  if (hits.size > 5000) hits.clear();
  return false;
}
export function _resetLimite() { hits.clear(); }

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    if (!ORIGENS.includes(origin)) return resp({ erro: 'origem' }, 403, {});
    const h = cors(origin);
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: h });
    const ip = req.headers.get('CF-Connecting-IP') || '?';
    if (limitado(ip)) return resp({ erro: 'limite' }, 429, { ...h, 'Retry-After': '60' });
    const path = new URL(req.url).pathname;
    let b; try { b = await req.json(); } catch { return resp({ erro: 'json' }, 400, h); }
    if (!b || !lojaOk(b.lojaId)) return resp({ erro: 'loja' }, 400, h);
    const kk = 'loja:' + b.lojaId;
    const lista = JSON.parse((await env.SUBS.get(kk)) || '[]');

    if (path === '/sub' && req.method === 'POST') {
      if (!subOk(b.sub)) return resp({ erro: 'inscricao' }, 400, h);
      const s = { endpoint: b.sub.endpoint, keys: { p256dh: b.sub.keys.p256dh, auth: b.sub.keys.auth } };
      const nova = [s, ...lista.filter(x => x.endpoint !== s.endpoint)].slice(0, MAX_SUBS);
      await env.SUBS.put(kk, JSON.stringify(nova));
      return resp({ ok: true }, 200, h);
    }
    if (path === '/sub' && req.method === 'DELETE') {
      await env.SUBS.put(kk, JSON.stringify(lista.filter(x => x.endpoint !== (b.sub && b.sub.endpoint))));
      return resp({ ok: true }, 200, h);
    }
    if (path === '/send' && req.method === 'POST') {
      const t = TEXTOS[b.tipo];
      if (!t) return resp({ erro: 'tipo' }, 400, h);
      const data = JSON.stringify({ title: t.title, body: t.body, tipo: b.tipo });
      const mortos = new Set(); let ok = 0;
      await Promise.all(lista.map(async s => {
        try {
          const r = await fetch(s.endpoint, {
            method: 'POST',
            headers: {
              Authorization: await vapidAuth(s.endpoint, env.VAPID_PUBLIC, env.VAPID_PRIVATE),
              'Content-Encoding': 'aes128gcm', 'Content-Type': 'application/octet-stream', TTL: '86400', Urgency: 'normal',
            },
            body: await encryptPayload(data, s.keys.p256dh, s.keys.auth),
          });
          if (r.status === 404 || r.status === 410) mortos.add(s.endpoint); else if (r.ok) ok++;
        } catch { /* tenta na próxima */ }
      }));
      if (mortos.size) await env.SUBS.put(kk, JSON.stringify(lista.filter(x => !mortos.has(x.endpoint))));
      return resp({ ok: true, enviados: ok }, 200, h);
    }
    return resp({ erro: 'rota' }, 404, h);
  },
};
