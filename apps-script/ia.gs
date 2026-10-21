/**
 * Stok · Intermediário da IA (Ollama Cloud) — Google Apps Script
 * Guarda a chave do Ollama no Google (fora do site) e responde aos agentes do Stok.
 *
 * Como instalar (dá para fazer tudo pelo celular, no navegador em "modo computador"):
 * 1. Abra https://script.google.com → Novo projeto → apague o conteúdo e cole este arquivo.
 * 2. Engrenagem (Configurações do projeto) → Propriedades do script → adicione:
 *      OLLAMA_API_KEY = sua chave nova de https://ollama.com/settings/keys
 *      SENHA          = uma senha sua (a mesma que vai no Stok)
 * 3. Implantar → Nova implantação → tipo "App da Web" → Executar como: Eu → Quem pode acessar: Qualquer pessoa → Implantar.
 *    Autorize e copie o endereço que termina em /exec.
 * 4. No Stok: Minha conta → Agentes de IA → Agente Nuvem: endereço = esse /exec, modelo = gemma4:31b, chave = a SENHA. Testar.
 * Nunca coloque a chave do Ollama no Stok, no chat ou no GitHub.
 */
function doPost(e) {
  var props = PropertiesService.getScriptProperties();
  var body = {};
  try { body = JSON.parse(e.postData.contents); } catch (err) { return out({ erro: 'pedido inválido' }); }
  if (!props.getProperty('SENHA') || body.senha !== props.getProperty('SENHA')) return out({ erro: 'senha incorreta' });
  var key = props.getProperty('OLLAMA_API_KEY');
  if (!key) return out({ erro: 'falta OLLAMA_API_KEY nas propriedades do script' });
  var msgs = (body.messages || []).slice(0, 20).map(function (m) { return { role: String(m.role || 'user'), content: String(m.content || '').slice(0, 14000) }; });
  var r = UrlFetchApp.fetch('https://ollama.com/api/chat', {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    headers: { Authorization: 'Bearer ' + key },
    payload: JSON.stringify({ model: String(body.model || 'gemma4:31b'), messages: msgs, stream: false, options: { temperature: 0.3 } })
  });
  var j = {};
  try { j = JSON.parse(r.getContentText()); } catch (err) { return out({ erro: 'resposta inválida do Ollama (' + r.getResponseCode() + ')' }); }
  if (r.getResponseCode() >= 300) return out({ erro: String(j.error || ('Ollama ' + r.getResponseCode())) });
  return out({ text: (j.message && j.message.content) || '' });
}
function doGet() { return out({ ok: true, servico: 'Stok · intermediário da IA' }); }
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
