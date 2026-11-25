// v158: gera os prints (PNG 2x) das 3 opções de logo: ícone de app (squircle 1024) e o logo no menu, na tela de entrar e na abertura, nos 3 temas.
// Uso: node scripts/logo-previews.mjs <pasta de saída>   (também grava docs/logos/opcao-N.svg e opcao-N-marca.svg)
import fs from 'node:fs';
import { createRequire } from 'node:module';
import { OPCOES, iconSvg, markSvg } from './logos.mjs';
const require = createRequire(import.meta.url);
let PW; try { PW = require('playwright'); } catch (e) { PW = require('/opt/node22/lib/node_modules/playwright'); }
const out = process.argv[2] || 'docs/prints/v158';
fs.mkdirSync(out, { recursive: true }); fs.mkdirSync('docs/logos', { recursive: true });
const TEMAS = {
  lilas: { nome: 'Lilás', bg: '#0B090D', surf: '#16111A', line: '#2F2535', ink: '#F5EEF7', muted: '#B8A9BD', neon: '#E7B8EF', btn: '#C79BD0', btnInk: '#1B0F1E' },
  violeta: { nome: 'Violeta + Lima', bg: '#000000', surf: '#0F0B17', line: '#2A1F42', ink: '#F4F2FA', muted: '#B3ABC6', neon: '#C6FF34', btn: '#C6FF34', btnInk: '#0B0B0B' },
  cinza: { nome: 'Cinza + Lima', bg: '#0A0A0A', surf: '#141516', line: '#2A2D31', ink: '#F7F7F1', muted: '#C9D0D6', neon: '#C7FF2E', btn: '#C7FF2E', btnInk: '#0A0A0A' },
};
const b = await PW.chromium.launch();
const shot = async (html, w, h, file) => { const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 2 }); await p.setContent(html); await p.screenshot({ path: file }); await p.close(); };
const files = [];
for (const n of Object.keys(OPCOES)) {
  const o = OPCOES[n];
  fs.writeFileSync(`docs/logos/opcao-${n}.svg`, iconSvg(n, 1024));
  fs.writeFileSync(`docs/logos/opcao-${n}-marca.svg`, markSvg(n));
  const f1 = `${out}/logo-opcao-${n}-icone-1024.png`;
  await shot(`<body style="margin:0;background:transparent">${iconSvg(n, 512).replace('width="512" height="512"', 'width="512" height="512" style="display:block"')}</body>`, 512, 512, f1); files.push(f1);
  for (const [k, t] of Object.entries(TEMAS)) {
    const mk = (s) => markSvg(n, s);
    const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:${t.bg};color:${t.ink};font:15px Inter,system-ui,sans-serif}
.g{display:grid;grid-template-columns:repeat(4,1fr);gap:18px;padding:22px}.c{background:${t.surf};border:1px solid ${t.line};border-radius:22px;padding:16px;min-height:330px;display:flex;flex-direction:column;gap:10px}
h3{margin:0 0 4px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${t.muted}}.home{flex:1;border-radius:18px;background:linear-gradient(160deg,#2b3d5c,#4a2a55);display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:18px;align-content:start}
.home i{display:block;aspect-ratio:1;border-radius:22%;background:rgba(255,255,255,.18)}.home .me{display:flex;flex-direction:column;align-items:center;gap:5px;font-size:11px;color:#fff}.home .me svg{width:100%;height:auto}
.menu{background:${t.bg};border-radius:16px;padding:14px;flex:1}.brand{display:flex;gap:10px;align-items:center;margin-bottom:14px}.brand b{font-size:20px}.brand small{display:block;color:${t.muted};font-size:11px}
.nav div{padding:10px 12px;border-radius:12px;color:${t.muted};margin:2px 0}.nav div.a{background:color-mix(in srgb,${t.neon} 16%,transparent);color:${t.neon}}
.auth{flex:1;border-radius:16px;background:${t.bg};display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:14px}.auth .in{width:100%;height:38px;border:1px solid ${t.line};border-radius:12px;background:${t.surf}}.auth .bt{width:100%;height:42px;border-radius:999px;background:${t.btn};color:${t.btnInk};display:grid;place-items:center;font-weight:700}
.op{flex:1;border-radius:16px;background:#000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px}.op b{font-size:30px;color:#fff}.op small{color:#bbb}
.t{grid-column:1/-1;display:flex;justify-content:space-between;align-items:baseline}.t b{font-size:20px}.t span{color:${t.muted}}</style>
<div class="g"><div class="t"><b>Opção ${n} · ${o.nome}</b><span>Tema ${t.nome} · ${o.ideia}</span></div>
<div class="c"><h3>Ícone do app</h3><div class="home"><i></i><i></i><i></i><div class="me">${iconSvg(n, 120)}StoK</div><i></i><i></i></div></div>
<div class="c"><h3>Menu</h3><div class="menu"><div class="brand">${mk(42)}<span><b>StoK</b><small>Estoque 99</small></span></div><div class="nav"><div class="a">Início</div><div>Notas fiscais</div><div>Plano de ação</div><div>Chat</div></div></div></div>
<div class="c"><h3>Tela de entrar</h3><div class="auth">${mk(78)}<b style="font-size:22px">StoK</b><div class="in"></div><div class="in"></div><div class="bt">Entrar</div></div></div>
<div class="c"><h3>Abertura</h3><div class="op">${mk(130)}<b>StoK</b><small>Tudo no lugar.</small></div></div></div>`;
    const f = `${out}/logo-opcao-${n}-${k}.png`; await shot(html, 1200, 420, f); files.push(f);
  }
}
await b.close();
console.log(files.join('\n'));
