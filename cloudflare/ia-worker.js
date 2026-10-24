/**
 * Stok · Intermediário da IA — Cloudflare Worker (grátis, sem cartão)
 * Padrão: Workers AI da própria Cloudflare (não precisa de chave nenhuma).
 * Opcional: NVIDIA (só se você criar o segredo NVIDIA_API_KEY).
 *
 * Como instalar (dá para fazer pelo celular):
 * 1. Crie a conta grátis em https://dash.cloudflare.com/sign-up
 * 2. Jeito rápido: no Stok, toque em "Criar o Worker com 1 toque", invente a SENHA e toque em Create and deploy.
 *    Jeito à mão: Workers e Pages → Criar → Worker → Implantar → Editar código; apague tudo, cole este arquivo e Implantar.
 *    Depois, em Configurações → Associações (Bindings) → Adicionar → Workers AI, com o nome AI.
 * 3. Em Configurações → Variáveis e segredos → Adicionar (tipo "Segredo"):
 *      SENHA          = uma senha que você inventar (a mesma que vai no Stok)  ← obrigatório
 *      NVIDIA_API_KEY = (opcional) sua chave de https://build.nvidia.com/settings/api-keys
 * 4. Copie o endereço do Worker (termina em .workers.dev).
 * 5. No Stok: Minha conta → Agentes de IA → "Cloudflare": cole o endereço e a SENHA → Ligar e testar.
 * Nunca coloque chave nenhuma no Stok, no chat ou no GitHub.
 */
const ORIGENS = ['https://vferreiras.github.io', 'https://gen-lang-client-0167474823-295e1.web.app', 'http://localhost:8000'];
const MODELO_CF = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const MODELO_NV = 'nvidia/nemotron-3-ultra-550b-a55b';
function cors(req) {
  const o = req.headers.get('Origin') || '';
  return { 'Access-Control-Allow-Origin': ORIGENS.includes(o) ? o : ORIGENS[0], 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Authorization, Content-Type', 'Vary': 'Origin' };
}
function json(req, obj, status) { return new Response(JSON.stringify(obj), { status: status || 200, headers: Object.assign({ 'Content-Type': 'application/json' }, cors(req)) }); }
function resposta(req, text) { return json(req, { choices: [{ message: { role: 'assistant', content: String(text || '') } }] }); }
export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
    if (req.method === 'GET') return json(req, { ok: true, servico: 'Stok · intermediário da IA (Workers AI / NVIDIA)', workersAI: !!(env.AI && env.AI.run), nvidia: !!env.NVIDIA_API_KEY });
    if (req.method !== 'POST') return json(req, { error: { message: 'método inválido' } }, 405);
    if (!env.SENHA) return json(req, { error: { message: 'falta o segredo SENHA no Worker' } }, 500);
    if ((req.headers.get('Authorization') || '') !== 'Bearer ' + env.SENHA) return json(req, { error: { message: 'senha incorreta' } }, 401);
    let body = {};
    try { body = await req.json(); } catch (e) { return json(req, { error: { message: 'pedido inválido' } }, 400); }
    const msgs = (body.messages || []).slice(0, 20).map(m => ({ role: String(m.role || 'user'), content: String(m.content || '').slice(0, 14000) }));
    const pedido = String(body.model || '');
    const max = Math.min(Number(body.max_tokens) || 1024, 4096);
    // NVIDIA só quando o Stok pedir um modelo nvidia/… e houver a chave
    if (/^nvidia\//.test(pedido) && env.NVIDIA_API_KEY) {
      const r = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.NVIDIA_API_KEY },
        body: JSON.stringify({ model: pedido, messages: msgs, temperature: 0.3, top_p: 0.95, max_tokens: max, stream: false, chat_template_kwargs: { enable_thinking: false } })
      });
      let j = {};
      try { j = await r.json(); } catch (e) { return json(req, { error: { message: 'resposta inválida da NVIDIA (' + r.status + ')' } }, 502); }
      if (!r.ok) return json(req, { error: { message: 'NVIDIA ' + r.status + ': ' + String((j.error && (j.error.message || j.error)) || j.detail || '') } }, 502);
      return resposta(req, j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content);
    }
    // Workers AI (grátis, sem chave): modelo @cf/… pedido ou o padrão
    if (!env.AI || typeof env.AI.run !== 'function') return json(req, { error: { message: /^nvidia\//.test(pedido) ? 'falta NVIDIA_API_KEY nos segredos do Worker (ou use Workers AI)' : 'falta o binding AI (Workers AI) no Worker' } }, 500);
    const model = /^@cf\//.test(pedido) ? pedido : MODELO_CF;
    let out;
    try { out = await env.AI.run(model, { messages: msgs, max_tokens: max, temperature: 0.3 }); }
    catch (e) { return json(req, { error: { message: 'Workers AI: ' + String((e && e.message) || e) } }, 502); }
    const text = (out && (out.response || (out.choices && out.choices[0] && out.choices[0].message && out.choices[0].message.content))) || '';
    if (!text) return json(req, { error: { message: 'Workers AI devolveu resposta vazia' } }, 502);
    return resposta(req, text);
  }
};
