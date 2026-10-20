/**
 * Stok · Estoque 99 — recebe os dados do app e atualiza esta planilha.
 *
 * Como usar (uma vez):
 * 1. Crie uma planilha nova no Google Sheets (ex.: "Stok · Estoque 99 — Lojas G").
 * 2. Menu Extensões → Apps Script. Apague o que estiver lá e cole este arquivo inteiro.
 * 3. Troque COLE_AQUI_A_SENHA por uma senha só sua (8 caracteres ou mais) e salve.
 * 4. Implantar → Nova implantação → tipo "App da Web".
 *    Executar como: "Eu". Quem pode acessar: "Qualquer pessoa". Implantar e autorizar.
 * 5. Copie o "URL do app da Web" (termina em /exec).
 * 6. No app Stok: Dados e ajuda → Planilha no Google → cole o URL e a mesma senha → Salvar.
 *
 * O app manda uma cópia completa a cada mudança (no máximo a cada 2 minutos).
 * Cada aba é reescrita com os dados mais novos; a aba "Atualizado" guarda o histórico de envios.
 */
const SENHA = 'COLE_AQUI_A_SENHA';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const dados = JSON.parse(e.postData.contents);
    if (!dados || SENHA === 'COLE_AQUI_A_SENHA' || dados.token !== SENHA) {
      return ContentService.createTextOutput('senha incorreta');
    }
    const planilha = SpreadsheetApp.getActiveSpreadsheet();
    const abas = dados.abas || {};
    Object.keys(abas).forEach(function (nome) {
      const aba = abas[nome];
      const folha = planilha.getSheetByName(nome) || planilha.insertSheet(nome);
      folha.clearContents();
      const linhas = [aba.cab].concat(aba.linhas || []).map(function (linha) {
        return aba.cab.map(function (_, i) { return seguro(linha[i]); });
      });
      folha.getRange(1, 1, linhas.length, aba.cab.length).setValues(linhas);
      folha.getRange(1, 1, 1, aba.cab.length).setFontWeight('bold');
      folha.setFrozenRows(1);
    });
    const hist = planilha.getSheetByName('Atualizado') || planilha.insertSheet('Atualizado');
    if (hist.getLastRow() === 0) {
      hist.appendRow(['Quando', 'Loja', 'Conta', 'Aparelho', 'Versão do app', 'Planos', 'Atividades', 'NFs', 'Corredores', 'Pessoas']);
      hist.getRange(1, 1, 1, 10).setFontWeight('bold');
      hist.setFrozenRows(1);
    }
    const n = function (k) { return abas[k] && abas[k].linhas ? abas[k].linhas.length : 0; };
    hist.appendRow([new Date(), seguro(dados.loja), seguro(dados.conta), seguro(dados.aparelho), seguro(dados.versao),
      n('Planos'), n('Atividades'), n('NFs'), n('Corredores'), n('Equipe')]);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput('Stok: planilha ligada.');
}

/* Textos que começam com = + - @ virariam fórmula na planilha: entram como texto. */
function seguro(v) {
  if (v === undefined || v === null) return '';
  if (typeof v === 'string' && /^[=+\-@]/.test(v)) return "'" + v;
  return v;
}
