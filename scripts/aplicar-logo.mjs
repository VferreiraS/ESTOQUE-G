// v158: aplica uma das 3 opções de logo (scripts/logos.mjs) no app inteiro.
// Uso: node scripts/aplicar-logo.mjs <1|2|3> [sufixo, ex.: -v159]   e depois: node scripts/bump-version.mjs <N>, testes e publicação.
// Troca: ícones PNG (192, 512, maskable 512, apple-touch 180, favicon 32) com nomes novos (-l<opção>) no manifest, index.html e sw.js;
// o SVG do S no menu/tela de entrar (base64 no index.html) e o S da abertura e dos outros blocos (S_PATH em app/js).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { OPCOES, iconSvg, markSvg } from './logos.mjs';
const require = createRequire(import.meta.url);
const n = process.argv[2];
if (!OPCOES[n]) { console.error('uso: node scripts/aplicar-logo.mjs <1|2|3>'); process.exit(1); }
let PW; try { PW = require('playwright'); } catch (e) { PW = require('/opt/node22/lib/node_modules/playwright'); }
// 1) caminho do S atual (o da abertura) e troca em todos os blocos
const intro = fs.readFileSync('app/js/intro.js', 'utf8');
const OLD = (intro.match(/var S_PATH='([^']+)'/) || [])[1];
if (!OLD) { console.error('não achei S_PATH no app/js/intro.js'); process.exit(1); }
const NEW = OPCOES[n].mark;
let trocas = 0;
for (const f of fs.readdirSync('app/js').map((x) => 'app/js/' + x)) {
  const a = fs.readFileSync(f, 'utf8'); if (!a.includes(OLD)) continue;
  const b = a.split(OLD).join(NEW).replace(/#ff6a48/g, OPCOES[n].grad[0]).replace(/#d9140b/g, OPCOES[n].grad[1]);
  fs.writeFileSync(f, b); trocas++; console.log('S trocado em', f);
}
// 2) SVG do S em base64 no index.html (menu e tela de entrar)
let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/data:image\/svg\+xml;base64,([A-Za-z0-9+/=]+)/g, (m, b64) => {
  const svg = Buffer.from(b64, 'base64').toString('utf8');
  if (!svg.includes(OLD)) return m; trocas++;
  return 'data:image/svg+xml;base64,' + Buffer.from(markSvg(n).replace(/ width="100" height="100"/, '')).toString('base64');
});
if (html.includes(OLD)) { html = html.split(OLD).join(NEW); trocas++; }
// 3) ícones PNG
const b = await PW.chromium.launch();
const png = async (svg, px, file) => { const p = await b.newPage({ viewport: { width: px, height: px }, deviceScaleFactor: 1 }); await p.setContent(`<body style="margin:0;background:transparent">${svg.replace(/width="\d+" height="\d+"/, `width="${px}" height="${px}" style="display:block"`)}</body>`); await p.screenshot({ path: file, omitBackground: true }); await p.close(); };
const S = process.argv[3] || ('-l' + n); // v159: sufixo opcional (ex.: -v159)
await png(iconSvg(n, 1024), 192, `icons/icon-192${S}.png`);
await png(iconSvg(n, 1024), 512, `icons/icon-512${S}.png`);
await png(iconSvg(n, 1024, { maskable: true }), 512, `icons/icon-maskable${S}.png`);
await png(iconSvg(n, 1024, { maskable: true }), 180, `icons/apple-touch${S}.png`);
await png(iconSvg(n, 1024), 32, `icons/favicon${S}.png`);
await b.close();
const ren = (s) => s.replace(/icons\/(icon-192|icon-512|icon-maskable|apple-touch|favicon)-[a-z0-9]+\.png/g, (m, k) => `icons/${k}${S}.png`);
fs.writeFileSync('index.html', ren(html));
for (const f of ['manifest.webmanifest', 'sw.js', 'robo.html', 'push/sw-push.js', ...fs.readdirSync('app/js').map((x) => 'app/js/' + x)]) if (fs.existsSync(f)) fs.writeFileSync(f, ren(fs.readFileSync(f, 'utf8')));
console.log(`Logo opção ${n} (${OPCOES[n].nome}) aplicado: ${trocas} troca(s) de S, 5 ícones icons/*${S}.png. Agora: node scripts/bump-version.mjs <N> e bash tests/run.sh.`);
