/**
 * Stok · Intermediário da IA (Google Gemini, Ollama Cloud ou NVIDIA) — Google Apps Script
 * Guarda a chave da IA no Google (fora do site) e responde aos agentes do Stok.
 *
 * Como instalar (dá para fazer tudo pelo celular, no navegador em "modo computador"):
 * 1. Abra https://script.google.com → Novo projeto → apague o conteúdo e cole este arquivo.
 * 2. Engrenagem (Configurações do projeto) → Propriedades do script → adicione:
 *      GEMINI_API_KEY = sua chave grátis de https://aistudio.google.com/apikey (sem cartão)
 *        e/ou OLLAMA_API_KEY = sua chave nova de https://ollama.com/settings/keys
 *        e/ou NVIDIA_API_KEY = sua chave nova de https://build.nvidia.com (API Keys)
 *      SENHA          = uma senha sua (a mesma que vai no Stok)
 * 3. Implantar → Nova implantação → tipo "App da Web" → Executar como: Eu → Quem pode acessar: Qualquer pessoa → Implantar.
 *    Autorize e copie o endereço que termina em /exec.
 * 4. No Stok: Minha conta → Agentes de IA → Agente Nuvem: endereço = esse /exec, modelo = gemma4:31b, chave = a SENHA. Testar.
 *    Para a NVIDIA, modelo = nvidia/nemotron-3-ultra-550b-a55b. Para o Gemini, modelo = gemini-3.8-flash.
 * Nunca coloque a chave do Gemini, do Ollama nem da NVIDIA no Stok, no chat ou no GitHub.
 */
function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out({ erro: 'pedido inválido' }); }
  if (!props.getProperty('SENHA') || body.senha !== props.getProperty('SENHA')) return out({ erro: 'senha incorreta' });
  var model = String(body.model || '');
  var nkey = props.getProperty('NVIDIA_API_KEY'), key = props.getProperty('OLLAMA_API_KEY'), gkey = props.getProperty('GEMINI_API_KEY');
  var msgs = (body.messages || []).slice(0, 20).map(function (m) { return { role: String(m.role || 'user'), content: String(m.content || '').slice(0, 14000) }; });
  if (/^gemini/.test(model) || (gkey && !key && !nkey)) {
    if (!gkey) return out({ erro: 'falta GEMINI_API_KEY nas propriedades do script' });
    var rg = UrlFetchApp.fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + gkey },
      payload: JSON.stringify({ model: /^gemini/.test(model) ? model : 'gemini-3.8-flash', messages: msgs, temperature: 0.3, max_tokens: 2048 })
    });
    var jg = {};
    try { jg = JSON.parse(rg.getContentText()); } catch (err) { return out({ erro: 'resposta inválida do Gemini (' + rg.getResponseCode() + ')' }); }
    if (jg && jg.length && jg[0]) jg = jg[0];
    if (rg.getResponseCode() >= 300) return out({ erro: 'Gemini ' + rg.getResponseCode() + ': ' + String((jg.error && (jg.error.message || jg.error)) || '') });
    return out({ text: (jg.choices && jg.choices[0] && jg.choices[0].message && jg.choices[0].message.content) || '' });
  }
  if (/^nvidia\//.test(model) || (nkey && !key)) {
    if (!nkey) return out({ erro: 'falta NVIDIA_API_KEY nas propriedades do script' });
    var rn = UrlFetchApp.fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'post', contentType: 'application/json', muteHttpExceptions: true,
      headers: { Authorization: 'Bearer ' + nkey },
      payload: JSON.stringify({ model: /^nvidia\//.test(model) ? model : 'nvidia/nemotron-3-ultra-550b-a55b', messages: msgs, temperature: 0.3, top_p: 0.95, max_tokens: 2048, stream: false, chat_template_kwargs: { enable_thinking: false } })
    });
    var jn = {};
    try { jn = JSON.parse(rn.getContentText()); } catch (err) { return out({ erro: 'resposta inválida da NVIDIA (' + rn.getResponseCode() + ')' }); }
    if (rn.getResponseCode() >= 300) return out({ erro: 'NVIDIA ' + rn.getResponseCode() + ': ' + String((jn.error && (jn.error.message || jn.error)) || jn.detail || '') });
    return out({ text: (jn.choices && jn.choices[0] && jn.choices[0].message && jn.choices[0].message.content) || '' });
  }
  if (!key) return out({ erro: 'falta OLLAMA_API_KEY nas propriedades do script' });
  var r = UrlFetchApp.fetch('https://ollama.com/api/chat', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify({ model: model || 'gemma4:31b', messages: msgs, stream: false, options: { temperature: 0.3 } })
  });
  var j = {};
  try { j = JSON.parse(r.getContentText()); } catch (err) { return out({ erro: 'resposta inválida do Ollama (' + r.getResponseCode() + ')' }); }
  if (r.getResponseCode() >= 300) return out({ erro: String(j.error || ('Ollama ' + r.getResponseCode())) });
  return out({ text: (j.message && j.message.content) || '' });
}
function doGet() { return out({ ok: true, servico: 'Stok · intermediário da IA' }); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
