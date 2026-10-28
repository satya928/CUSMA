'use strict';

// Regional Value Content (CUSMA Article 4.5).
//   Transaction value method: RVC = (TV - VNM) / TV x 100
//   Net cost method:          RVC = (NC - VNM) / NC x 100
// VNM = value of non-originating materials used to produce the good.

const CUSMA_COUNTRIES = new Set(['CA', 'US', 'MX']);

function isOriginatingCountry(country) {
  return CUSMA_COUNTRIES.has(String(country || '').trim().toUpperCase());
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function valueOfNonOriginating(materials) {
  return materials
    .filter((m) => !isOriginatingCountry(m.countryOfOrigin))
    .reduce((sum, m) => sum + Number(m.cost || 0), 0);
}

function rvcTransactionValue(transactionValue, vnm) {
  if (!(transactionValue > 0)) return null;
  return round2(((transactionValue - vnm) / transactionValue) * 100);
}

function rvcNetCost(netCost, vnm) {
  if (!(netCost > 0)) return null;
  return round2(((netCost - vnm) / netCost) * 100);
}

// Returns both methods and whether either meets the thresholds in `requirement`
// ({ tv: 60, nc: 50 }). A producer may use whichever method it qualifies under,
// except where a rule only allows net cost (requirement.tv === null).
function evaluateRvc({ transactionValue, netCost, materials }, requirement) {
  const vnm = valueOfNonOriginating(materials);
  const tv = rvcTransactionValue(transactionValue, vnm);
  const nc = rvcNetCost(netCost, vnm);

  const meetsTv = requirement.tv != null && tv != null && tv >= requirement.tv;
  const meetsNc = requirement.nc != null && nc != null && nc >= requirement.nc;

  let method = null;
  if (meetsTv) method = 'transaction_value';
  else if (meetsNc) method = 'net_cost';

  return {
    vnm: round2(vnm),
    transactionValueRvc: tv,
    netCostRvc: nc,
    required: requirement,
    meets: meetsTv || meetsNc,
    method,
  };
}

module.exports = {
  CUSMA_COUNTRIES,
  isOriginatingCountry,
  valueOfNonOriginating,
  rvcTransactionValue,
  rvcNetCost,
  evaluateRvc,
  round2,
};
