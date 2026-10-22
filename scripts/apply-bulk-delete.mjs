#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';

let html = readFileSync('index.html', 'utf8');
if (html.includes('authDeleteAllOtherAccounts') && html.includes('authProtectedLogin')) {
  console.log('Already has bulk delete');
  process.exit(0);
}

const start2 = html.indexOf('/* Excluir uma conta gestor deste navegador');
const iifeStart = html.lastIndexOf('(function()', start2);
const end3 = html.indexOf('</script>\n<script id="team-diag-js">', iifeStart);
const NEW = readFileSync('scripts/admin-delete-iife.js', 'utf8').trim() + '\n';

if (iifeStart < 0 || end3 < 0) {
  console.error('markers missing', iifeStart, end3);
  process.exit(1);
}
const close = html.lastIndexOf('})();', end3);
html = html.slice(0, iifeStart) + NEW + html.slice(close + 5);

html = html.replace(/(estoque99-version" content=")(\d+)(")/, (_, a, v, c) => a + '77' + c);
let sw = readFileSync('sw.js', 'utf8');
sw = sw.replace(/estoque99-v\d+/, 'estoque99-v77');
writeFileSync('sw.js', sw);
writeFileSync('index.html', html);
if (!html.includes('authDeleteAllOtherAccounts')) throw new Error('patch failed');
console.log('OK bulk delete v77', html.length);
