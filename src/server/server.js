'use strict';

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const { runCheck } = require('../engine');
const { usage, FREE_CHECKS_PER_MONTH } = require('./usage');
const store = require('./store');
const billing = require('./billing');

const PORT = Number(process.env.PORT || 3000);
const PUBLIC_DIR = path.join(__dirname, '..', '..', 'public');
const MAX_BODY = 100 * 1024;

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.json': 'application/json' };

function send(res, status, body, headers = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body);
  res.writeHead(status, { 'Content-Type': 'application/json', ...headers });
  res.end(payload);
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('Body too large'), { status: 413 }));
        req.destroy();
      } else chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {});
      } catch {
        reject(Object.assign(new Error('Invalid JSON'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

// Anonymous visitors are identified by a cookie so the free tier can be counted.
function visitorId(req, res) {
  const match = /(?:^|;\s*)cc_vid=([a-f0-9-]{36})/.exec(req.headers.cookie || '');
  if (match) return match[1];
  const id = crypto.randomUUID();
  res.setHeader('Set-Cookie', `cc_vid=${id}; Path=/; Max-Age=31536000; HttpOnly; SameSite=Lax`);
  return id;
}

function serveStatic(req, res) {
  const urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const file = path.normalize(path.join(PUBLIC_DIR, urlPath === '/' ? 'index.html' : urlPath));
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, { error: 'Forbidden' });
  fs.readFile(file, (err, data) => {
    if (err) return send(res, 404, { error: 'Not found' });
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
    res.end(data);
  });
}

async function handleCheck(req, res) {
  const vid = visitorId(req, res);
  const body = await readJson(req);
  const tier = await store.tierFor(body.email);

  if (tier === 'free') {
    const used = usage.count(vid);
    if (used >= FREE_CHECKS_PER_MONTH) {
      return send(res, 402, {
        error: 'free_limit_reached',
        message: `You have used your ${FREE_CHECKS_PER_MONTH} free checks this month. Upgrade to Starter for unlimited checks.`,
        upgradeUrl: '/api/billing/checkout',
      });
    }
  }

  const result = runCheck(body);
  if (result.origin.status === 'invalid_input') return send(res, 400, result);

  if (tier === 'free') usage.increment(vid);
  await store.logCheck({ visitorId: vid, email: body.email || null, input: body, result }).catch((e) => console.error('logCheck failed:', e.message));

  send(res, 200, { ...result, tier, freeChecksRemaining: tier === 'free' ? FREE_CHECKS_PER_MONTH - usage.count(vid) : null });
}

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://x');
    if (req.method === 'GET' && pathname === '/api/health') return send(res, 200, { ok: true });
    if (req.method === 'GET' && pathname === '/api/rates-meta') return send(res, 200, require('../data/tariff-rates.json').meta);
    if (req.method === 'POST' && pathname === '/api/check') return await handleCheck(req, res);
    if (req.method === 'POST' && pathname === '/api/billing/checkout') return await billing.createCheckout(req, res, await readJson(req));
    if (req.method === 'POST' && pathname === '/api/billing/webhook') return await billing.webhook(req, res);
    if (req.method === 'GET') return serveStatic(req, res);
    send(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    send(res, err.status || 500, { error: err.status ? err.message : 'Internal error' });
  }
});

if (require.main === module) {
  server.listen(PORT, () => console.log(`CUSMAcheck listening on http://localhost:${PORT}`));
}

module.exports = { server };
