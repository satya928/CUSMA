'use strict';

const form = document.getElementById('check-form');
const rows = document.getElementById('bom-rows');
const tpl = document.getElementById('row-tpl');
const out = document.getElementById('result');

const money = (n) => (n == null ? '—' : Number(n).toLocaleString('en-CA', { style: 'currency', currency: 'CAD' }));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

function addRow(values = {}) {
  const row = tpl.content.firstElementChild.cloneNode(true);
  for (const [k, v] of Object.entries(values)) row.querySelector(`[name="${k}"]`).value = v;
  row.querySelector('.remove').addEventListener('click', () => row.remove());
  rows.appendChild(row);
}

document.getElementById('add-row').addEventListener('click', () => addRow());
addRow({ description: 'Oak lumber', hsCode: '440791', cost: 120, countryOfOrigin: 'CA' });
addRow({ description: 'Steel hinges', hsCode: '830242', cost: 30, countryOfOrigin: 'CN' });

fetch('/api/rates-meta').then((r) => r.json()).then((m) => {
  document.getElementById('rates-meta').textContent = `Tariff rates as of ${m.ratesAsOf}${m.verified ? '' : ' (draft data — not yet verified)'}.`;
}).catch(() => {});

function readForm() {
  const fd = new FormData(form);
  const num = (k) => (fd.get(k) === '' || fd.get(k) == null ? undefined : Number(fd.get(k)));
  return {
    productName: fd.get('productName'),
    hsCode: fd.get('hsCode'),
    transactionValue: num('transactionValue'),
    netCost: num('netCost'),
    shipmentValue: num('shipmentValue'),
    mfnRateOverride: num('mfnRateOverride'),
    whollyObtained: fd.get('whollyObtained') === 'on',
    email: fd.get('email') || undefined,
    materials: [...rows.querySelectorAll('tr')].map((tr) => ({
      description: tr.querySelector('[name=description]').value,
      hsCode: tr.querySelector('[name=hsCode]').value,
      cost: Number(tr.querySelector('[name=cost]').value || 0),
      countryOfOrigin: tr.querySelector('[name=countryOfOrigin]').value,
    })).filter((m) => m.hsCode),
  };
}

function render(data) {
  const { origin, exposure } = data;
  const cls = origin.qualifies === true ? 'ok' : origin.qualifies === false ? 'bad' : 'warn';
  let html = `<div class="verdict ${cls}"><h2>${esc(data.headline)}</h2>`;
  if (origin.criterionText) html += `<p>${esc(origin.criterionText)}</p>`;
  html += `<ul>${(origin.reasons || []).map((r) => `<li>${esc(r)}</li>`).join('')}</ul></div>`;

  if (origin.rvc) {
    const r = origin.rvc;
    html += `<p class="rvc">Regional value content: <strong>${r.transactionValueRvc ?? '—'}%</strong> (transaction value)` +
      `${r.netCostRvc != null ? `, <strong>${r.netCostRvc}%</strong> (net cost)` : ''}. Non-originating materials: ${money(r.vnm)} per unit.</p>`;
  }

  if (exposure) {
    html += `<h3>U.S. tariff stack on a ${money(exposure.shipmentValue)} shipment</h3><div class="table-scroll"><table class="stack"><thead><tr><th>Layer</th><th>Rate</th><th>Applies?</th><th>Duty</th></tr></thead><tbody>`;
    for (const l of exposure.layers) {
      const status = l.removedByCusma ? 'Removed by CUSMA' : l.applies ? 'Yes' : 'No';
      html += `<tr class="${l.applies ? 'on' : ''}"><td>${esc(l.name)}${l.note ? `<br><small>${esc(l.note)}</small>` : ''}</td><td>${l.rate == null ? '?' : l.rate + '%'}</td><td>${status}</td><td>${money(l.amount)}</td></tr>`;
    }
    html += `</tbody><tfoot><tr><td colspan="3">Total estimated U.S. duty (${exposure.effectiveRate}%)</td><td>${money(exposure.totalDuty)}</td></tr></tfoot></table></div>`;
    if (exposure.cusmaSavings) html += `<p class="save">CUSMA saves you ${money(exposure.cusmaSavings)} of MFN duty on this shipment.</p>`;
    if (exposure.potentialSavingsIfQualified) html += `<p class="save">Qualifying would save ${money(exposure.potentialSavingsIfQualified)} of MFN duty on this shipment.</p>`;
    if (exposure.warnings.length) html += `<div class="warnings"><strong>Check before relying on this:</strong><ul>${exposure.warnings.map((w) => `<li>${esc(w)}</li>`).join('')}</ul></div>`;
    html += `<p class="rates">Rates as of ${esc(exposure.ratesAsOf)}${exposure.ratesVerified ? '' : ' — draft data, not yet verified'}.</p>`;
  }

  if (data.freeChecksRemaining != null) html += `<p class="quota">${data.freeChecksRemaining} free check(s) left this month.</p>`;
  html += `<p class="disclaimer">${esc(data.disclaimer)}</p>`;
  out.innerHTML = html;
}

function renderUpgrade(data) {
  out.innerHTML = `<div class="verdict warn"><h2>${esc(data.message)}</h2>
    <p>Starter: CA$29/month — unlimited checks, saved product library, exposure history.</p>
    <button class="primary" id="upgrade">Upgrade to Starter</button></div>`;
  document.getElementById('upgrade').addEventListener('click', async () => {
    const email = form.email.value || prompt('Email for your subscription:');
    if (!email) return;
    const r = await fetch('/api/billing/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, plan: 'starter' }) });
    const d = await r.json();
    if (d.url) location.href = d.url;
    else alert(d.error || 'Billing unavailable.');
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  out.hidden = false;
  out.innerHTML = '<p>Checking…</p>';
  try {
    const r = await fetch('/api/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(readForm()) });
    const data = await r.json();
    if (r.status === 402) return renderUpgrade(data);
    if (r.status === 400) {
      out.innerHTML = `<div class="verdict bad"><h2>Please fix these inputs</h2><ul>${(data.origin.errors || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
      return;
    }
    render(data);
  } catch (err) {
    out.innerHTML = `<div class="verdict bad"><h2>Something went wrong.</h2><p>${esc(err.message)}</p></div>`;
  }
  out.scrollIntoView({ behavior: 'smooth' });
});
