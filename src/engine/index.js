'use strict';

const { determineOrigin } = require('./origin');
const { computeExposure } = require('./tariff');

const DISCLAIMER =
  'Advisory estimate only. CUSMAcheck is not a licensed customs broker and this is not a ruling. ' +
  'Confirm origin and classification with a licensed broker or CBSA/CBP before you certify.';

// One full check: origin verdict plus the U.S. duty stack for the shipment.
function runCheck(input) {
  const origin = determineOrigin(input);
  if (origin.status === 'invalid_input') return { origin, exposure: null, disclaimer: DISCLAIMER };

  const exposure = computeExposure({
    hsCode: input.hsCode,
    shipmentValue: input.shipmentValue || input.transactionValue,
    qualifies: origin.qualifies,
    mfnRateOverride: input.mfnRateOverride,
    section232ContentValue: input.section232ContentValue,
  });

  return { origin, exposure, headline: headline(origin, exposure), disclaimer: DISCLAIMER };
}

function headline(origin, exposure) {
  const money = (n) => `$${Number(n).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (origin.status === 'needs_expert') return 'This product category needs expert review (special CUSMA rules).';
  if (origin.status === 'not_covered') return 'This HS chapter is not covered yet.';
  const verdict = origin.qualifies ? `Qualifies for CUSMA under Criterion ${origin.criterion}` : 'Does not qualify for CUSMA';
  const duty = exposure.totalDuty > 0 ? `estimated U.S. duty ${money(exposure.totalDuty)} per shipment (${exposure.effectiveRate}%)` : 'no U.S. duty estimated';
  const caveat = origin.qualifies && exposure.sectoralDutiesApply ? ' - CUSMA does not cover the sectoral tariffs on this product' : '';
  return `${verdict}; ${duty}${caveat}.`;
}

module.exports = { runCheck, DISCLAIMER };
