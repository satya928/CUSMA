'use strict';

const { normalizeHs, matchesAnyPrefix } = require('./hs');
const { round2 } = require('./rvc');
const defaultRates = require('../data/tariff-rates.json');

function findMfnRate(hsCode, rates) {
  const digits = normalizeHs(hsCode);
  let best = null;
  for (const r of rates.mfn.rates) {
    const prefix = normalizeHs(r.hs);
    if (digits.startsWith(prefix) && (!best || prefix.length > normalizeHs(best.hs).length)) best = r;
  }
  return best ? best.rate : rates.mfn.default;
}

// Builds the U.S. duty stack for one shipment of a Canadian good.
//   qualifies: result of the origin check (true / false / null when unknown)
//   mfnRateOverride: lets the user supply the HTSUS rate when it is not in our table
//   section232ContentValue: metal content value for derivative products (defaults to shipment value)
function computeExposure({ hsCode, shipmentValue, qualifies, mfnRateOverride, section232ContentValue }, rates = defaultRates) {
  const value = Number(shipmentValue);
  const warnings = [];
  const layers = [];

  const mfnRate = mfnRateOverride != null && mfnRateOverride !== '' ? Number(mfnRateOverride) : findMfnRate(hsCode, rates);
  if (mfnRate == null) warnings.push('MFN rate for this HS code is not in the reference table; enter the HTSUS general rate to complete the estimate.');

  const mfnApplies = qualifies !== true;
  layers.push({
    id: 'mfn',
    name: 'U.S. MFN (general) duty',
    rate: mfnRate,
    applies: mfnApplies && mfnRate != null,
    removedByCusma: qualifies === true,
    amount: mfnApplies && mfnRate != null ? round2((value * mfnRate) / 100) : 0,
  });

  const applied = new Set();
  for (const p of rates.programs) {
    if (!matchesAnyPrefix(hsCode, p.hs)) continue;
    const excludedBy = (p.excludedIfProgramApplies || []).find((id) => applied.has(id));
    if (excludedBy) {
      layers.push({ id: p.id, name: p.name, rate: p.rate, applies: false, amount: 0, note: `Not stacked: excluded where ${excludedBy} applies.` });
      continue;
    }
    const isS232 = p.id.startsWith('s232');
    const base = isS232 && section232ContentValue != null && section232ContentValue !== '' ? Number(section232ContentValue) : value;
    applied.add(p.id);
    layers.push({
      id: p.id,
      name: p.name,
      authority: p.authority,
      rate: p.rate,
      applies: true,
      cusmaRelief: p.cusmaRelief,
      amount: round2((base * p.rate) / 100),
      confidence: p.matchConfidence || 'listed',
      note: p.note || p.basis || null,
    });
    if (p.cusmaRelief === 'partial') warnings.push(`${p.name}: CUSMA gives only partial relief here; get expert review.`);
    if (p.matchConfidence === 'indicative') warnings.push(`${p.name}: matched on an indicative HS prefix. Confirm the 8-digit HTSUS line is on the proclamation annex.`);
  }

  const total = round2(layers.reduce((s, l) => s + (l.applies ? l.amount : 0), 0));
  const mfnIfNotQualified = mfnRate != null ? round2((value * mfnRate) / 100) : null;

  return {
    shipmentValue: value,
    ratesAsOf: rates.meta.ratesAsOf,
    ratesVerified: Boolean(rates.meta.verified),
    layers,
    totalDuty: total,
    effectiveRate: value > 0 ? round2((total / value) * 100) : 0,
    cusmaSavings: qualifies === true ? mfnIfNotQualified : 0,
    potentialSavingsIfQualified: qualifies === false ? mfnIfNotQualified : 0,
    sectoralDutiesApply: layers.some((l) => l.id !== 'mfn' && l.applies),
    warnings,
  };
}

module.exports = { computeExposure, findMfnRate };
