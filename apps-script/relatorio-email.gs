/**
 * Stok · Estoque 99 — envio de e-mail do relatório e da conta nova (substitui o FormSubmit).
 *
 * PASSO A PASSO PARA O DONO (uma vez só):
 *  1. Abra https://script.google.com → Novo projeto → apague o que houver e cole este arquivo inteiro.
 *  2. Engrenagem "Configurações do projeto" → "Propriedades do script" → Adicionar:
 *       Nome: TOKEN_RELATORIO   Valor: uma senha longa inventada por você (ex.: 32 letras e números).
 *     (Esse token NUNCA vai para o GitHub. Guarde-o: ele será digitado no Stok.)
 *  3. Botão "Implantar" → "Nova implantação" → tipo "App da Web".
 *       Executar como: Eu (sua conta).   Quem pode acessar: "Qualquer pessoa".
 *     Autorize o acesso ao Gmail quando o Google pedir.
 *  4. Copie a URL que termina em /exec.
 *  5. No Stok, em Avisos → Relatório por e-mail, cole a URL e o token (ficam cifrados no aparelho).
 *  Ao mudar este código: "Implantar" → "Gerenciar implantações" → editar → "Nova versão" (a URL continua a mesma).
 *
 * Recebe POST (formulário ou JSON) com os campos do app: Loja, Gerado em, Resumo, Situação, NF …, A fazer: …, Mais,
 * e na conta nova: Estoque, Login, Tipo de conta, Criada em, Aparelho, Contas/Total de contas …
 * Campos com "_" no começo são de controle: _token (obrigatório), _subject (assunto).
 */

var DESTINO = 'ferreiradasilvavitorhugo44@gmail.com';
var COPIA = '99.estoque@lojasg.com.br';
var MAX_CAMPOS = 120;
var MAX_VALOR = 1000;      // caracteres por campo
var MAX_CORPO = 60000;     // caracteres do HTML final
var MAX_PEDIDO = 100000;   // bytes do pedido recebido

function doGet() { return resposta_({ ok: true, servico: 'Stok · e-mail' }); }

function doPost(e) {
  try {
    var campos = lerCampos_(e);
    if (!campos) return resposta_({ ok: false, erro: 'pedido inválido' });
    var segredo = PropertiesService.getScriptProperties().getProperty('TOKEN_RELATORIO') || '';
    if (!segredo || !iguais_(String(campos._token || ''), segredo)) return resposta_({ ok: false, erro: 'token' });
    var assunto = limpa_(campos._subject || 'Estoque 99 · Relatório', 200).replace(/[\r\n]+/g, ' ');
    var lista = ordenar_(campos);
    var html = montarHtml_(assunto, lista);
    if (html.length > MAX_CORPO) html = montarHtml_(assunto, lista.slice(0, 30).concat([['Mais', 'O e-mail ficou grande demais. Veja o restante no site.']]));
    MailApp.sendEmail({ to: DESTINO, cc: COPIA, subject: assunto, htmlBody: html, body: montarTexto_(assunto, lista).slice(0, MAX_CORPO), name: 'Stok · Estoque 99' });
    return resposta_({ ok: true });
  } catch (err) {
    return resposta_({ ok: false, erro: 'falha ao enviar' });
  }
}

function lerCampos_(e) {
  if (!e) return null;
  var bruto = e.postData && e.postData.contents ? String(e.postData.contents) : '';
  if (bruto.length > MAX_PEDIDO) return null;
  if (bruto && /json/i.test((e.postData && e.postData.type) || '') || /^\s*\{/.test(bruto)) {
    try { var j = JSON.parse(bruto); if (j && typeof j === 'object' && !Array.isArray(j)) return j; } catch (x) {}
  }
  return e.parameter || null;
}

function iguais_(a, b) { // comparação sem pressa (tempo constante)
  if (a.length !== b.length) return false;
  var d = 0; for (var i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

function limpa_(v, max) {
  if (v === null || v === undefined) return '';
  var s = typeof v === 'object' ? JSON.stringify(v) : String(v);
  s = s.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
  return s.length > (max || MAX_VALOR) ? s.slice(0, (max || MAX_VALOR) - 1) + '…' : s;
}

function esc_(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Devolve [[nome, valor], …] sem campos de controle, limitado. */
function ordenar_(campos) {
  var out = [];
  Object.keys(campos).forEach(function (k) {
    if (out.length >= MAX_CAMPOS || k.charAt(0) === '_') return;
    out.push([limpa_(k, 160), limpa_(campos[k])]);
  });
  return out;
}

function grupos_(lista) {
  var g = { topo: [], nf: [], fazer: [], conta: [], outros: [] };
  var TOPO = /^(Loja|Gerado em|Resumo|Situação|Mais)$/;
  var CONTA = /^(Estoque|Login|Tipo de conta|Criada em|Aparelho|Contas|Total de contas.*)$/;
  lista.forEach(function (p) {
    var k = p[0];
    if (TOPO.test(k)) g.topo.push(p);
    else if (/^NF\b/.test(k)) g.nf.push([k.replace(/^NF\s*/, ''), p[1]]);
    else if (/^A fazer\b/.test(k)) g.fazer.push([k.replace(/^A fazer:?\s*/, ''), p[1]]);
    else if (CONTA.test(k)) g.conta.push(p);
    else g.outros.push(p);
  });
  return g;
}

var C = { fundo: '#0b0b0c', cartao: '#111113', borda: '#2A2A2E', texto: '#F2F2F2', sec: '#A3A3A8', red: '#FF2A1F' };
var TITULO = "font-family:Oswald,'Arial Narrow',Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em;";
var CORPO = 'font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;';

function cartao_(nome, valor) {
  return '<tr><td style="padding:0 0 10px 0"><div style="background:' + C.cartao + ';border:1px solid ' + C.borda + ';border-radius:12px;padding:12px 14px">' +
    '<div style="' + CORPO + 'font-size:12px;color:' + C.sec + ';margin:0 0 4px 0">' + esc_(nome) + '</div>' +
    '<div style="' + CORPO + 'font-size:15px;line-height:1.45;color:' + C.texto + ';word-break:break-word">' + esc_(valor || '—') + '</div></div></td></tr>';
}

function tabela_(titulo, col1, linhas) {
  if (!linhas.length) return '';
  var h = '<tr><td style="padding:14px 0 6px 0;' + TITULO + 'font-size:16px;color:' + C.texto + '"><span style="color:' + C.red + '">▍</span>' + esc_(titulo) + ' (' + linhas.length + ')</td></tr>' +
    '<tr><td style="padding:0 0 10px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;background:' + C.cartao + ';border:1px solid ' + C.borda + ';border-radius:12px">' +
    '<tr><th align="left" style="' + CORPO + 'font-size:12px;color:' + C.sec + ';font-weight:600;padding:8px 12px;border-bottom:1px solid ' + C.borda + '">' + esc_(col1) + '</th>' +
    '<th align="left" style="' + CORPO + 'font-size:12px;color:' + C.sec + ';font-weight:600;padding:8px 12px;border-bottom:1px solid ' + C.borda + '">Detalhes</th></tr>';
  linhas.forEach(function (p, i) {
    var b = i < linhas.length - 1 ? 'border-bottom:1px solid ' + C.borda + ';' : '';
    var atrasada = /ATRASADA/.test(p[1]) ? 'color:' + C.red + ';' : 'color:' + C.texto + ';';
    h += '<tr><td valign="top" style="' + CORPO + b + 'font-size:14px;color:' + C.texto + ';font-weight:600;padding:8px 12px;word-break:break-word">' + esc_(p[0]) + '</td>' +
      '<td valign="top" style="' + CORPO + b + 'font-size:14px;' + atrasada + 'padding:8px 12px;line-height:1.4;word-break:break-word">' + esc_(p[1]) + '</td></tr>';
  });
  return h + '</table></td></tr>';
}

function montarHtml_(assunto, lista) {
  var g = grupos_(lista);
  var corpo = '';
  g.topo.concat(g.conta).concat(g.outros).forEach(function (p) { corpo += cartao_(p[0], p[1]); });
  corpo += tabela_('Notas fiscais', 'NF', g.nf);
  corpo += tabela_('A fazer hoje', 'Atividade', g.fazer);
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta name="color-scheme" content="dark"><title>' + esc_(assunto) + '</title></head>' +
    '<body style="margin:0;padding:0;background:' + C.fundo + '">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:' + C.fundo + '"><tr><td align="center" style="padding:16px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">' +
    '<tr><td style="padding:4px 0 14px 0;border-bottom:2px solid ' + C.red + '">' +
    '<span style="' + TITULO + 'font-size:34px;font-weight:700;color:' + C.red + ';vertical-align:middle">S</span>' +
    '<span style="' + TITULO + 'font-size:20px;color:' + C.texto + ';vertical-align:middle;padding-left:8px">Stok · Estoque 99</span>' +
    '<div style="' + CORPO + 'font-size:13px;color:' + C.sec + ';margin-top:4px">' + esc_(assunto) + '</div></td></tr>' +
    '<tr><td style="height:14px;line-height:14px;font-size:0">&nbsp;</td></tr>' + corpo +
    '<tr><td style="' + CORPO + 'font-size:11px;color:' + C.sec + ';padding:14px 0 0 0;border-top:1px solid ' + C.borda + '">Enviado automaticamente pelo Stok · Lojas G.</td></tr>' +
    '</table></td></tr></table></body></html>';
}

function montarTexto_(assunto, lista) {
  var t = 'STOK · ESTOQUE 99\n' + assunto + '\n' + new Array(31).join('-') + '\n';
  lista.forEach(function (p) { t += p[0] + ': ' + p[1] + '\n'; });
  return t + '\nEnviado automaticamente pelo Stok · Lojas G.\n';
}

function resposta_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
