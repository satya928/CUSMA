'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const { server } = require('../src/server/server');
const { usage } = require('../src/server/usage');

const product = {
  hsCode: '940360',
  transactionValue: 500,
  shipmentValue: 25000,
  materials: [
    { hsCode: '440791', cost: 120, countryOfOrigin: 'CA' },
    { hsCode: '830242', cost: 30, countryOfOrigin: 'CN' },
  ],
};

let base;
test.before(async () => {
  await new Promise((r) => server.listen(0, r));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => server.close());
test.beforeEach(() => usage.reset());

const post = (path, body, cookie) =>
  fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(cookie ? { cookie } : {}) }, body: JSON.stringify(body) });

test('serves the app page', async () => {
  const r = await fetch(base + '/');
  assert.equal(r.status, 200);
  assert.match(await r.text(), /CUSMA/);
});

test('POST /api/check returns verdict and exposure', async () => {
  const r = await post('/api/check', product);
  assert.equal(r.status, 200);
  const d = await r.json();
  assert.equal(d.origin.criterion, 'B');
  assert.equal(d.exposure.shipmentValue, 25000);
  assert.equal(d.freeChecksRemaining, 2);
});

test('invalid input returns 400 and does not use a free check', async () => {
  const r = await post('/api/check', { hsCode: 'abc', transactionValue: 0, materials: [] });
  assert.equal(r.status, 400);
});

test('free tier is capped at 3 checks per month', async () => {
  const first = await post('/api/check', product);
  const cookie = first.headers.get('set-cookie').split(';')[0];
  await post('/api/check', product, cookie);
  await post('/api/check', product, cookie);
  const fourth = await post('/api/check', product, cookie);
  assert.equal(fourth.status, 402);
  assert.equal((await fourth.json()).error, 'free_limit_reached');
});

test('path traversal is blocked', async () => {
  const r = await fetch(base + '/..%2fpackage.json');
  assert.notEqual(r.status, 200);
});
