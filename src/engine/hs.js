'use strict';

// HS code helpers. Canadian/US tariff codes are 6-digit HS plus national digits
// (Canada 8-10, US HTSUS 8-10). Origin rules work at chapter (2), heading (4)
// and subheading (6) level.

const LEVEL_DIGITS = { chapter: 2, heading: 4, subheading: 6 };

function normalizeHs(code) {
  if (code === undefined || code === null) return '';
  return String(code).replace(/[^0-9]/g, '');
}

function isValidHs(code) {
  const digits = normalizeHs(code);
  return digits.length >= 6 && digits.length <= 10;
}

function hsAt(code, level) {
  const digits = LEVEL_DIGITS[level];
  if (!digits) throw new Error(`Unknown HS level: ${level}`);
  return normalizeHs(code).slice(0, digits);
}

function chapterOf(code) {
  return Number(hsAt(code, 'chapter'));
}

// True when `code` falls under any of the given HS prefixes ("7308", "8471.30", "94").
function matchesAnyPrefix(code, prefixes = []) {
  const digits = normalizeHs(code);
  return prefixes.some((p) => digits.startsWith(normalizeHs(p)));
}

module.exports = { LEVEL_DIGITS, normalizeHs, isValidHs, hsAt, chapterOf, matchesAnyPrefix };
