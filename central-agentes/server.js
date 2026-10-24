#!/usr/bin/env node
// Grupo Ferreira S.A. · Central de Agentes — servidor local (sem dependências).
// Recebe eventos dos hooks do Claude Code (POST /event) e repassa ao prédio 3D por SSE (GET /events).
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = Number(process.env.PORT) || 3099;
const HOST = process.env.HOST || '127.0.0.1';
const MAX_BODY = 1024 * 1024;      // 1 MB
const BUFFER_MAX = 500;            // eventos guardados
const BUFFER_MS = 2 * 60 * 1000;   // 2 minutos
const PING_MS = 15 * 1000;
const INDEX = path.join(__dirname, 'index.html');

const clients = new Set();
let buffer = [];

// CORS só para a própria página (localhost) e o GitHub Pages do dono. Pedidos sem Origin (hooks via curl) continuam valendo.
const ORIGENS = [/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/, /^https:\/\/vferreiras\.github\.io$/];
function origemOk(origin) {
  return !origin || ORIGENS.some((r) => r.test(origin));
}
function cors(req) {
  const o = req && req.headers && req.headers.origin;
  const h = { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
  if (o && origemOk(o)) h['Access-Control-Allow-Origin'] = o;
  return h;
}

function send(res, status, body, type) {
  const headers = Object.assign({}, cors(res.req));
  if (body !== undefined && body !== null) headers['Content-Type'] = type || 'application/json; charset=utf-8';
  res.writeHead(status, headers);
  res.end(body === undefined || body === null ? undefined : body);
}

function prune() {
  const limite = Date.now() - BUFFER_MS;
  buffer = buffer.filter((e) => e._t >= limite);
  if (buffer.length > BUFFER_MAX) buffer = buffer.slice(-BUFFER_MAX);
}

function curto(s) {
  return s ? String(s).slice(0, 8) : '-';
}

function logEvento(ev) {
  const quem = ev.agent_type ? ev.agent_type + (ev.agent_id ? '#' + curto(ev.agent_id) : '') : 'sessão ' + curto(ev.session_id);
  const ferramenta = ev.tool_name ? ' · ' + ev.tool_name : '';
  const hora = new Date(ev._t).toLocaleTimeString('pt-BR');
  console.log(`[${hora}] ${ev.hook_event_name || '?'} · ${quem}${ferramenta}`);
}

function broadcast(ev) {
  const msg = 'data: ' + JSON.stringify(ev) + '\n\n';
  for (const res of clients) {
    try { res.write(msg); } catch (_) { clients.delete(res); }
  }
}

function receberEvento(req, res) {
  let tamanho = 0;
  let excedeu = false;
  const partes = [];
  req.on('data', (chunk) => {
    if (excedeu) return;
    tamanho += chunk.length;
    if (tamanho > MAX_BODY) {
      excedeu = true;
      send(res, 413, JSON.stringify({ ok: false, erro: 'corpo maior que 1 MB' }));
      req.resume();
      return;
    }
    partes.push(chunk);
  });
  req.on('end', () => {
    if (excedeu) return;
    let ev;
    try {
      ev = JSON.parse(Buffer.concat(partes).toString('utf8'));
    } catch (_) {
      return send(res, 400, JSON.stringify({ ok: false, erro: 'JSON inválido' }));
    }
    if (!ev || typeof ev !== 'object' || Array.isArray(ev)) {
      return send(res, 400, JSON.stringify({ ok: false, erro: 'esperado um objeto JSON' }));
    }
    ev._t = Date.now();
    send(res, 204);
    buffer.push(ev);
    prune();
    logEvento(ev);
    broadcast(ev);
  });
  req.on('error', () => { if (!res.headersSent) send(res, 400, JSON.stringify({ ok: false })); });
}

function abrirSSE(req, res) {
  res.writeHead(200, Object.assign({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  }, cors(req)));
  res.write('retry: 3000\n');
  res.write('event: hello\ndata: {"ok":true}\n\n');
  prune();
  for (const ev of buffer) res.write('data: ' + JSON.stringify(ev) + '\n\n');
  clients.add(res);
  const fechar = () => clients.delete(res);
  req.on('close', fechar);
  res.on('error', fechar);
}

function servirIndex(res) {
  fs.readFile(INDEX, (err, data) => {
    if (err) {
      return send(res, 404,
        '<!doctype html><meta charset="utf-8"><title>Central de Agentes</title>' +
        '<body style="background:#111;color:#eee;font-family:sans-serif;padding:24px">' +
        '<h1>Central de Agentes</h1><p>O arquivo <code>index.html</code> ainda não está nesta pasta.</p>' +
        '<p>O servidor está no ar: veja <a style="color:#8cf" href="/health">/health</a>.</p></body>',
        'text/html; charset=utf-8');
    }
    send(res, 200, data, 'text/html; charset=utf-8');
  });
}

const server = http.createServer((req, res) => {
  const rota = url.parse(req.url).pathname;
  if (!origemOk(req.headers.origin)) return send(res, 403, JSON.stringify({ ok: false, erro: 'origem não permitida' }));
  if (req.method === 'OPTIONS') return send(res, 204);
  if (req.method === 'POST' && rota === '/event') return receberEvento(req, res);
  if (req.method === 'GET' || req.method === 'HEAD') {
    if (rota === '/events') return abrirSSE(req, res);
    if (rota === '/' || rota === '/index.html') return servirIndex(res);
    if (rota === '/health') {
      prune();
      return send(res, 200, JSON.stringify({ ok: true, clients: clients.size, buffer: buffer.length }));
    }
    return send(res, 404, JSON.stringify({ ok: false, erro: 'não encontrado' }));
  }
  return send(res, 405, JSON.stringify({ ok: false, erro: 'método não permitido' }));
});

setInterval(() => {
  for (const res of clients) {
    try { res.write(': ping\n\n'); } catch (_) { clients.delete(res); }
  }
  prune();
}, PING_MS).unref();

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') console.error(`Porta ${PORT} já está em uso. Use outra: PORT=3100 node server.js`);
  else console.error(err);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Central de Agentes em http://localhost:${PORT}`);
});

function encerrar() {
  for (const res of clients) { try { res.end(); } catch (_) {} }
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 500).unref();
}
process.on('SIGINT', encerrar);
process.on('SIGTERM', encerrar);
