'use strict';

const { hsAt, chapterOf, isValidHs, normalizeHs } = require('./hs');
const { isOriginatingCountry, evaluateRvc, round2 } = require('./rvc');
const defaultRules = require('../data/psr-rules.json');

// CUSMA Article 4.12: non-originating materials that fail the tariff shift are
// tolerated if their total value is no more than 10% of the good's value.
const DE_MINIMIS_PERCENT = 10;
// CUSMA Article 4.2(d) RVC floor for criterion D.
const CRITERION_D_RVC = { tv: 60, nc: 50 };
const TEXTILE_CHAPTERS = new Set([61, 62, 63]);

const CRITERIA = {
  A: 'Wholly obtained or produced entirely in Canada, the U.S. and/or Mexico (Art. 4.2(a))',
  B: 'Produced using non-originating materials that satisfy the product-specific rule of origin (Art. 4.2(b), Annex 4-B)',
  C: 'Produced entirely in the CUSMA region exclusively from originating materials (Art. 4.2(c))',
  D: 'Non-originating materials cannot change classification because they share the good\'s subheading, and RVC is met (Art. 4.2(d))',
};

function findRule(hsCode, rules) {
  const digits = normalizeHs(hsCode);
  let best = null;
  for (const rule of rules.rules) {
    const prefix = normalizeHs(rule.hs);
    if (digits.startsWith(prefix) && (!best || prefix.length > normalizeHs(best.hs).length)) {
      best = rule;
    }
  }
  return best;
}

function validate(input) {
  const errors = [];
  if (!isValidHs(input.hsCode)) errors.push('hsCode must be 6 to 10 digits.');
  if (!(Number(input.transactionValue) > 0)) errors.push('transactionValue must be a positive number.');
  if (!Array.isArray(input.materials)) errors.push('materials must be a list.');
  else {
    input.materials.forEach((m, i) => {
      if (!isValidHs(m.hsCode)) errors.push(`materials[${i}].hsCode must be 6 to 10 digits.`);
      if (!(Number(m.cost) >= 0)) errors.push(`materials[${i}].cost must be zero or more.`);
      if (!m.countryOfOrigin) errors.push(`materials[${i}].countryOfOrigin is required.`);
    });
  }
  return errors;
}

// Every non-originating material must change classification at `level` versus the good.
function checkTariffShift(goodHs, nonOriginating, level, transactionValue) {
  if (!level) return { required: null, met: true, failing: [], deMinimisApplied: false };

  const failing = nonOriginating.filter((m) => hsAt(m.hsCode, level) === hsAt(goodHs, level));
  const failingValue = failing.reduce((s, m) => s + Number(m.cost), 0);
  const failingPercent = round2((failingValue / transactionValue) * 100);
  const deMinimisApplied = failing.length > 0 && failingPercent <= DE_MINIMIS_PERCENT;

  return {
    required: level,
    met: failing.length === 0 || deMinimisApplied,
    failing: failing.map((m) => ({ description: m.description || null, hsCode: m.hsCode, cost: Number(m.cost) })),
    failingPercentOfValue: failing.length ? failingPercent : 0,
    deMinimisApplied,
  };
}

function evaluateOption(option, input, nonOriginating) {
  const shift = checkTariffShift(input.hsCode, nonOriginating, option.shift, Number(input.transactionValue));
  const rvc = option.rvc ? evaluateRvc(input, option.rvc) : null;
  return { option, shift, rvc, met: shift.met && (!rvc || rvc.meets) };
}

function determineOrigin(input, rules = defaultRules) {
  const errors = validate(input);
  if (errors.length) return { status: 'invalid_input', qualifies: false, errors };

  const materials = input.materials.map((m) => ({ ...m, cost: Number(m.cost) }));
  const ctx = { ...input, materials, transactionValue: Number(input.transactionValue), netCost: input.netCost ? Number(input.netCost) : null };
  const chapter = String(chapterOf(input.hsCode)).padStart(2, '0');
  const base = { hsCode: normalizeHs(input.hsCode), chapter, rulesVerified: Boolean(rules.meta && rules.meta.verified) };

  if (rules.unsupportedChapters && rules.unsupportedChapters[chapter]) {
    return { ...base, status: 'needs_expert', qualifies: null, reasons: [rules.unsupportedChapters[chapter]] };
  }

  if (input.whollyObtained === true) {
    return { ...base, status: 'qualifies', qualifies: true, criterion: 'A', criterionText: CRITERIA.A, reasons: ['Declared wholly obtained or produced in the CUSMA region.'] };
  }

  const nonOriginating = materials.filter((m) => !isOriginatingCountry(m.countryOfOrigin));

  if (materials.length > 0 && nonOriginating.length === 0) {
    return {
      ...base,
      status: 'qualifies',
      qualifies: true,
      criterion: 'C',
      criterionText: CRITERIA.C,
      reasons: ['Every listed material is from Canada, the U.S. or Mexico. Each material must itself be originating (not just shipped from there); keep supplier certifications on file.'],
    };
  }

  const rule = findRule(input.hsCode, rules);
  if (!rule) {
    return { ...base, status: 'not_covered', qualifies: null, reasons: [`HS chapter ${chapter} is not in the launch rule set yet.`] };
  }

  const evaluations = rule.options.map((opt) => evaluateOption(opt, ctx, nonOriginating));
  const passing = evaluations.find((e) => e.met);
  const rvcSummary = evaluateRvc(ctx, CRITERION_D_RVC);

  if (passing) {
    return {
      ...base,
      status: 'qualifies',
      qualifies: true,
      criterion: 'B',
      criterionText: CRITERIA.B,
      rule: { hs: rule.hs, description: rule.description, verified: rule.verified },
      evaluation: passing,
      rvc: passing.rvc || rvcSummary,
      reasons: [describeOption(passing.option) + ' - met.'].concat(passing.shift.deMinimisApplied ? [`De minimis applied: materials failing the shift are ${passing.shift.failingPercentOfValue}% of value (limit ${DE_MINIMIS_PERCENT}%).`] : []),
    };
  }

  // Criterion D: the only obstacle is materials classified in the same subheading as the good.
  const sameSubheading = nonOriginating.filter((m) => hsAt(m.hsCode, 'subheading') === hsAt(input.hsCode, 'subheading'));
  if (!TEXTILE_CHAPTERS.has(Number(chapter)) && sameSubheading.length > 0 && rvcSummary.meets) {
    const otherShift = checkTariffShift(input.hsCode, nonOriginating.filter((m) => !sameSubheading.includes(m)), rule.options[0].shift, ctx.transactionValue);
    if (otherShift.met) {
      return {
        ...base,
        status: 'qualifies',
        qualifies: true,
        criterion: 'D',
        criterionText: CRITERIA.D,
        rule: { hs: rule.hs, description: rule.description, verified: rule.verified },
        rvc: rvcSummary,
        reasons: ['Materials share the good\'s subheading so cannot shift; RVC threshold met under Art. 4.2(d).'],
      };
    }
  }

  return {
    ...base,
    status: 'does_not_qualify',
    qualifies: false,
    rule: { hs: rule.hs, description: rule.description, verified: rule.verified },
    evaluations,
    rvc: rvcSummary,
    reasons: evaluations.map((e) => explainFailure(e)),
  };
}

function describeOption(option) {
  const parts = [];
  if (option.shift) parts.push(`change in tariff ${option.shift}`);
  if (option.rvc) parts.push(`RVC of at least ${option.rvc.tv}% (transaction value) or ${option.rvc.nc}% (net cost)`);
  return parts.length ? parts.join(' plus ') : 'no requirement';
}

function explainFailure(e) {
  const bits = [];
  if (!e.shift.met) {
    const codes = e.shift.failing.map((m) => m.hsCode).join(', ');
    bits.push(`non-originating input(s) ${codes} do not change tariff ${e.shift.required} (${e.shift.failingPercentOfValue}% of value, above the ${DE_MINIMIS_PERCENT}% de minimis)`);
  }
  if (e.rvc && !e.rvc.meets) {
    bits.push(`RVC is ${e.rvc.transactionValueRvc}% (TV)${e.rvc.netCostRvc != null ? ` / ${e.rvc.netCostRvc}% (NC)` : ''}, below the required ${e.rvc.required.tv}% / ${e.rvc.required.nc}%`);
  }
  return `Rule "${describeOption(e.option)}" not met: ${bits.join('; ')}.`;
}

module.exports = { determineOrigin, findRule, checkTariffShift, CRITERIA, DE_MINIMIS_PERCENT };
