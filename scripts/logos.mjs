// v158: 3 opções de logotipo (desenho próprio). Cada opção tem:
//  mark  = o S em um caminho só (caixa 0..100), usado no menu, na tela de entrar e na abertura (Path2D do intro.js);
//  icon(size,{maskable}) = ícone de app (squircle) em SVG.
// Ainda NÃO aplicadas: o dono escolhe e roda `node scripts/aplicar-logo.mjs <1|2|3>`.
const SQ = (s, r) => `M${r} 0H${s - r}C${s - r * 0.18} 0 ${s} ${r * 0.18} ${s} ${r}V${s - r}C${s} ${s - r * 0.18} ${s - r * 0.18} ${s} ${s - r} ${s}H${r}C${r * 0.18} ${s} 0 ${s - r * 0.18} 0 ${s - r}V${r}C0 ${r * 0.18} ${r * 0.18} 0 ${r} 0Z`;
export const OPCOES = {
  1: {
    nome: 'Prateleira',
    ideia: 'S montado com três prateleiras e duas colunas, com caixas nas prateleiras (estoque organizado).',
    mark: 'M22 14h56v12H22zM22 14h12v40H22zM22 42h56v12H22zM66 42h12v44H66zM22 74h56v12H22zM46 30h10v10H46zM56 32h8v8h-8zM30 60h10v12H30z',
    grad: ['#ff6a48', '#d9140b'],
    bg: ['#1a0f0d', '#050404'],
  },
  2: {
    nome: 'Vidro',
    ideia: 'S minimalista de dois arcos contínuos, em gradiente, sobre fundo com cantos de vidro.',
    mark: 'M64.55 23.79A19 19 0 1 0 50 55A7 7 0 1 1 44.64 66.5L35.45 74.21A19 19 0 1 0 50 43A7 7 0 1 1 55.36 31.5Z',
    grad: ['#ff5a3c', '#b517ff'],
    bg: ['#140b1c', '#030205'],
    vidro: true,
  },
  3: {
    nome: 'Monograma Stok',
    ideia: 'Monograma: S largo em destaque com "tok" ao lado, como etiqueta de estoque.',
    mark: 'M74 16H40a17 17 0 0 0 0 34h20a5 5 0 0 1 0 10H26v14h34a19 19 0 0 0 0-38H40a3 3 0 0 1 0-6h34z',
    grad: ['#ff4a36', '#e0160c'],
    bg: ['#121212', '#000000'],
    tok: true,
  },
};
export function markSvg(n, size = 100) {
  const o = OPCOES[n];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}"><defs><linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.grad[0]}"/><stop offset="1" stop-color="${o.grad[1]}"/></linearGradient></defs><path fill="url(#r)" d="${o.mark}"/></svg>`;
}
// "tok" em traços (sem fonte), para a opção 3
const TOK = '<g transform="translate(2 4)" fill="none" stroke="#F5F2F7" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M62 52v24a4 4 0 0 0 4 4h3M57 60h11"/><circle cx="80" cy="70" r="8"/><path d="M95 50v30M95 70l9-9M98 67l7 13"/></g>';
export function iconSvg(n, size = 1024, { maskable = false } = {}) {
  const o = OPCOES[n];
  const pad = maskable ? 0.24 : 0.16; // zona segura do maskable
  const inner = size * (1 - pad * 2);
  const sq = maskable ? `<rect width="${size}" height="${size}" fill="url(#bg)"/>` : `<path d="${SQ(size, size * 0.225)}" fill="url(#bg)"/>`;
  const glass = o.vidro ? `<path d="M0 ${size * 0.34}V${size * 0.22}C0 ${size * 0.04} ${size * 0.04} 0 ${size * 0.22} 0H${size * 0.34}Z" fill="#fff" opacity=".10"/><path d="M${size} ${size * 0.66}V${size * 0.78}C${size} ${size * 0.96} ${size * 0.96} ${size} ${size * 0.78} ${size}H${size * 0.66}Z" fill="#fff" opacity=".07"/><path d="${SQ(size, size * 0.225)}" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="${size * 0.012}"/>` : '';
  const scale = o.tok ? inner / 112 : inner / 100;
  const off = (size - (o.tok ? 112 : 100) * scale) / 2;
  const body = `<g transform="translate(${off} ${off}) scale(${scale})">${o.tok ? '<g transform="translate(-8 -2) scale(.8)">' : ''}<path fill="url(#r)" d="${o.mark}"/>${o.tok ? '</g>' + TOK : ''}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}"><defs><linearGradient id="r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${o.grad[0]}"/><stop offset="1" stop-color="${o.grad[1]}"/></linearGradient><linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${o.bg[0]}"/><stop offset="1" stop-color="${o.bg[1]}"/></linearGradient></defs>${sq}${glass}${body}</svg>`;
}
