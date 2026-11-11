// Sobe a versão do app em todos os lugares: meta do index.html e do robo.html, CACHE do sw.js
// e o ?v= dos arquivos app/css e app/js no index.html (o sw.js monta o ?v= pela própria versão).
// Uso: node scripts/bump-version.mjs <nova-versao>
import fs from 'node:fs';
const V = process.argv[2];
if (!/^\d+$/.test(V || '')) { console.error('uso: node scripts/bump-version.mjs <versao>'); process.exit(1); }
const ed = (f, fn) => { const a = fs.readFileSync(f, 'utf8'); const b = fn(a); if (a === b) console.warn('sem mudança em', f); fs.writeFileSync(f, b); };
ed('index.html', (s) => s.replace(/(name="estoque99-version" content=")\d+"/, '$1' + V + '"').replace(/((?:src|href)="app\/(?:js|css)\/[^"?]+\?v=)\d+"/g, '$1' + V + '"'));
ed('robo.html', (s) => s.replace(/(name="estoque99-version" content=")\d+"/, '$1' + V + '"'));
ed('sw.js', (s) => s.replace(/const CACHE = 'estoque99-v\d+';/, "const CACHE = 'estoque99-v" + V + "';"));
// confere: todo arquivo citado no index.html existe e está no APP_FILES do sw.js
const html = fs.readFileSync('index.html', 'utf8'), sw = fs.readFileSync('sw.js', 'utf8');
const refs = [...html.matchAll(/(?:src|href)="(app\/(?:js|css)\/[^"?]+)\?v=(\d+)"/g)];
let bad = 0;
for (const [, f, v] of refs) {
  if (v !== V) { console.error('versão errada', f, v); bad++; }
  if (!fs.existsSync(f)) { console.error('não existe', f); bad++; }
  if (!sw.includes("'" + f + "'")) { console.error('falta no APP_FILES do sw.js', f); bad++; }
}
console.log('versão', V, '·', refs.length, 'arquivos app/', bad ? '· ' + bad + ' problema(s)' : '· ok');
process.exit(bad ? 1 : 0);
