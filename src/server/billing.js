'use strict';

const crypto = require('node:crypto');
const store = require('./store');

// Stripe Checkout through the REST API (no SDK). Prices are created in the Stripe
// dashboard in CAD and referenced by ID from the environment.

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const PRICES = { starter: process.env.STRIPE_PRICE_STARTER, pro: process.env.STRIPE_PRICE_PRO };
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function createCheckout(req, res, body) {
  const plan = body.plan === 'pro' ? 'pro' : 'starter';
  if (!STRIPE_KEY || !PRICES[plan]) return json(res, 503, { error: 'Billing is not configured yet.' });
  if (!body.email) return json(res, 400, { error: 'email is required' });

  const form = new URLSearchParams({
    mode: 'subscription',
    'line_items[0][price]': PRICES[plan],
    'line_items[0][quantity]': '1',
    customer_email: body.email,
    'metadata[plan]': plan,
    // Copied onto the subscription so cancellation webhooks can find the user.
    'subscription_data[metadata][email]': body.email,
    success_url: `${APP_URL}/?upgraded=1`,
    cancel_url: `${APP_URL}/?upgrade_cancelled=1`,
    'automatic_tax[enabled]': 'true',
  });

  const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  const data = await r.json();
  if (!r.ok) return json(res, 502, { error: data.error ? data.error.message : 'Stripe error' });
  json(res, 200, { url: data.url });
}

function rawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

// Verifies the Stripe-Signature header (t=...,v1=...) with HMAC-SHA256.
function verifySignature(payload, header, secret, toleranceSec = 300) {
  const parts = Object.fromEntries(String(header || '').split(',').map((kv) => kv.split('=')));
  if (!parts.t || !parts.v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(parts.t)) > toleranceSec) return false;
  const expected = crypto.createHmac('sha256', secret).update(`${parts.t}.${payload}`).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(parts.v1);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function webhook(req, res) {
  if (!WEBHOOK_SECRET) return json(res, 503, { error: 'Webhook not configured' });
  const payload = (await rawBody(req)).toString('utf8');
  if (!verifySignature(payload, req.headers['stripe-signature'], WEBHOOK_SECRET)) return json(res, 400, { error: 'Bad signature' });

  const event = JSON.parse(payload);
  const obj = event.data && event.data.object;
  if (event.type === 'checkout.session.completed') {
    await store.setTier(obj.customer_details.email, (obj.metadata && obj.metadata.plan) || 'starter', obj.customer);
  }
  if (event.type === 'customer.subscription.deleted' && obj.metadata && obj.metadata.email) {
    await store.setTier(obj.metadata.email, 'free', obj.customer);
  }
  json(res, 200, { received: true });
}

module.exports = { createCheckout, webhook, verifySignature };
