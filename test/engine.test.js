'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { evaluateRvc, rvcTransactionValue, rvcNetCost } = require('../src/engine/rvc');
const { determineOrigin, checkTariffShift } = require('../src/engine/origin');
const { computeExposure } = require('../src/engine/tariff');
const { runCheck } = require('../src/engine');

test('RVC transaction value and net cost formulas', () => {
  assert.equal(rvcTransactionValue(100, 30), 70);
  assert.equal(rvcNetCost(80, 30), 62.5);
  assert.equal(rvcTransactionValue(0, 30), null);
});

test('evaluateRvc picks whichever method meets the threshold', () => {
  const r = evaluateRvc(
    { transactionValue: 100, netCost: 90, materials: [{ cost: 42, countryOfOrigin: 'CN' }, { cost: 20, countryOfOrigin: 'CA' }] },
    { tv: 60, nc: 50 },
  );
  assert.equal(r.vnm, 42);
  assert.equal(r.transactionValueRvc, 58);
  assert.equal(r.netCostRvc, 53.33);
  assert.equal(r.meets, true);
  assert.equal(r.method, 'net_cost');
});

test('Criterion A when wholly obtained', () => {
  const r = determineOrigin({ hsCode: '440710', transactionValue: 1000, whollyObtained: true, materials: [] });
  assert.equal(r.criterion, 'A');
  assert.equal(r.qualifies, true);
});

test('Criterion C when every material is from CUSMA countries', () => {
  const r = determineOrigin({
    hsCode: '940360',
    transactionValue: 500,
    materials: [
      { hsCode: '440710', cost: 120, countryOfOrigin: 'CA' },
      { hsCode: '830242', cost: 30, countryOfOrigin: 'US' },
    ],
  });
  assert.equal(r.criterion, 'C');
});

test('Criterion B via tariff shift (wooden furniture with Chinese hardware)', () => {
  const r = determineOrigin({
    hsCode: '940360',
    transactionValue: 500,
    materials: [
      { hsCode: '440710', cost: 120, countryOfOrigin: 'CA' },
      { hsCode: '830242', cost: 30, countryOfOrigin: 'CN' },
    ],
  });
  assert.equal(r.criterion, 'B');
  assert.equal(r.qualifies, true);
});

test('de minimis rescues a small non-shifting input', () => {
  const shift = checkTariffShift('392690', [{ hsCode: '392610', cost: 8 }], 'heading', 100);
  assert.equal(shift.deMinimisApplied, true);
  assert.equal(shift.met, true);
});

test('fails when shift fails above de minimis and RVC is too low', () => {
  const r = determineOrigin({
    hsCode: '392690',
    transactionValue: 100,
    materials: [
      { hsCode: '392610', cost: 30, countryOfOrigin: 'CN' },
      { hsCode: '390110', cost: 20, countryOfOrigin: 'KR' },
    ],
  });
  assert.equal(r.status, 'does_not_qualify');
  assert.equal(r.qualifies, false);
  assert.ok(r.reasons.length >= 1);
});

test('machinery qualifies on RVC alone when shift fails', () => {
  const r = determineOrigin({
    hsCode: '847989',
    transactionValue: 10000,
    materials: [{ hsCode: '84798990', cost: 2500, countryOfOrigin: 'DE' }],
  });
  assert.equal(r.criterion, 'B');
  assert.equal(r.evaluation.option.shift, null);
  assert.equal(r.evaluation.rvc.meets, true);
});

test('apparel and autos are routed to expert review', () => {
  assert.equal(determineOrigin({ hsCode: '610910', transactionValue: 10, materials: [] }).status, 'needs_expert');
  assert.equal(determineOrigin({ hsCode: '870899', transactionValue: 10, materials: [] }).status, 'needs_expert');
});

test('invalid input is reported, not guessed', () => {
  const r = determineOrigin({ hsCode: '12', transactionValue: -1, materials: [{}] });
  assert.equal(r.status, 'invalid_input');
  assert.ok(r.errors.length >= 3);
});

test('CUSMA removes MFN duty but not Section 232', () => {
  const e = computeExposure({ hsCode: '730890', shipmentValue: 10000, qualifies: true, mfnRateOverride: 2 });
  const mfn = e.layers.find((l) => l.id === 'mfn');
  const steel = e.layers.find((l) => l.id === 's232_steel');
  assert.equal(mfn.applies, false);
  assert.equal(steel.applies, true);
  assert.equal(e.totalDuty, 5000);
  assert.equal(e.sectoralDutiesApply, true);
});

test('Section 338 applies to listed goods even when CUSMA-qualifying', () => {
  const e = computeExposure({ hsCode: '22030000', shipmentValue: 2000, qualifies: true, mfnRateOverride: 0 });
  const s338 = e.layers.find((l) => l.id === 's338_canada');
  assert.equal(s338.applies, true);
  assert.equal(e.totalDuty, 1000);
  assert.ok(e.warnings.some((w) => w.includes('indicative')));
});

test('non-qualifying good pays MFN and shows potential savings', () => {
  const e = computeExposure({ hsCode: '392690', shipmentValue: 10000, qualifies: false });
  assert.equal(e.totalDuty, 530);
  assert.equal(e.potentialSavingsIfQualified, 530);
});

test('missing MFN rate produces a warning instead of a fake number', () => {
  const e = computeExposure({ hsCode: '901890', shipmentValue: 1000, qualifies: false });
  assert.ok(e.warnings.some((w) => w.includes('MFN rate')));
});

test('runCheck headline flags sectoral tariffs on qualifying steel', () => {
  const r = runCheck({
    hsCode: '730890',
    transactionValue: 10000,
    materials: [{ hsCode: '720851', cost: 4000, countryOfOrigin: 'CA' }],
  });
  assert.equal(r.origin.criterion, 'C');
  assert.match(r.headline, /CUSMA does not cover the sectoral tariffs/);
});
