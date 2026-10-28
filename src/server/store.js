'use strict';

// Persistence through Supabase's REST API (PostgREST). With no SUPABASE_URL set,
// the app runs fully in memory, which is what local development and tests use.

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const enabled = Boolean(SUPABASE_URL && SUPABASE_KEY);

async function rest(pathAndQuery, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${pathAndQuery}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`);
  return res.status === 204 || options.method === 'POST' || options.method === 'PATCH' ? null : res.json();
}

async function tierFor(email) {
  if (!enabled || !email) return 'free';
  const rows = await rest(`users?select=license_tier&email=eq.${encodeURIComponent(email)}&limit=1`);
  return (rows && rows[0] && rows[0].license_tier) || 'free';
}

async function logCheck({ visitorId, email, input, result }) {
  if (!enabled) return;
  await rest('checks', {
    method: 'POST',
    body: JSON.stringify({
      visitor_id: visitorId,
      email,
      hs_code: result.origin.hsCode,
      criterion_result: result.origin.criterion || null,
      status: result.origin.status,
      qualifies: result.origin.qualifies,
      rvc_percent: result.origin.rvc ? result.origin.rvc.transactionValueRvc : null,
      tariff_exposure_estimate: result.exposure ? result.exposure.totalDuty : null,
      rates_as_of: result.exposure ? result.exposure.ratesAsOf : null,
      input,
      result,
    }),
  });
}

async function setTier(email, tier, stripeCustomerId) {
  if (!enabled) return;
  await rest('users?on_conflict=email', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify({ email, license_tier: tier, stripe_customer_id: stripeCustomerId || null }),
  });
}

module.exports = { enabled, tierFor, logCheck, setTier };
