/**
 * Stok · Intermediário da IA (NVIDIA) — Cloudflare Worker (grátis)
 * Guarda a chave da NVIDIA na Cloudflare (fora do site) e responde aos agentes do Stok.
 *
 * Como instalar (dá para fazer pelo celular):
 * 1. Crie a conta grátis em https://dash.cloudflare.com/sign-up
 * 2. Workers e Pages → Criar → Worker → "Hello World" → Implantar → Editar código.
 *    Apague tudo, cole este arquivo e toque em Implantar.
 * 3. No Worker: Configurações → Variáveis e segredos → Adicionar (tipo "Segredo"):
 *      NVIDIA_API_KEY = sua chave de https://build.nvidia.com/settings/api-keys
 *      SENHA          = uma senha que você inventar (a mesma que vai no Stok)
 * 4. Copie o endereço do Worker (termina em .workers.dev).
 * 5. No Stok: Minha conta → Agentes de IA → "Cloudflare + NVIDIA": cole o endereço e a SENHA → Ligar e testar.
 * Nunca coloque a chave da NVIDIA no Stok, no chat ou no GitHub.
 */
const ORIGENS = ['https://vferreiras.github.io', 'https://gen-lang-client-0167474823-295e1.web.app', 'http://localhost:8000'];
const MODELO = 'nvidia/nemotron-3-ultra-550b-a55b';
function cors(req) {
  const o = req.headers.get('Origin') || '';
  return { 'Access-Control-Allow-Origin': ORIGENS.includes(o) ? o : ORIGENS[0], 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Vary': 'Origin' };
}
function json(req, obj, status) { return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json' }, cors(req)) }); }
export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
    if (req.method === 'GET') return json(req, { ok: true, servico: 'Stok · intermediário da IA (NVIDIA)' });
    if (req.method !== 'POST') return json(req, { error: { message: 'método inválido' } }, 405);
    if (!env.SENHA || (req.headers.get('Authorization') || '') !== 'Bearer ' + env.SENHA) return json(req, { error: { message: 'senha incorreta' } }, 401);
    if (!env.NVIDIA_API_KEY) return json(req, { error: { message: 'falta NVIDIA_API_KEY nos segredos do Worker' } }, 500);
    let body = {};
    try { body = await req.json(); } catch (e) { return json(req, { error: { message: 'pedido inválido' } }, 400); }
    const msgs = (body.messages || []).slice(0, 20).map(m => ({ role: String(m.role || 'user'), content: String(m.content || '').slice(0, 14000) }));
    const model = /^nvidia\//.test(String(body.model || '')) ? String(body.model) : MODELO;
    const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.NVIDIA_API_KEY },
      body: JSON.stringify({ model, messages: msgs, temperature: 0.3, top_p: 0.95, max_tokens: Math.min(Number(body.max_tokens) || 1024, 4096), stream: false, chat_template_kwargs: { enable_thinking: false } })
    });
    let j = {};
    try { j = await r.json(); } catch (e) { return json(req, { error: { message: 'resposta inválida da NVIDIA (' + r.status + ')' } }, 502); }
    if (!r.ok) return json(req, { error: { message: 'NVIDIA ' + r.status + ': ' + String((j.error && (j.error.message || j.error)) || j.detail || '') } }, 502);
    const text = (j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content) || '';
    return json(req, { choices: [{ message: { role: 'assistant', content: text } }] });
  }
};
