'use strict';

// Free-tier counter: checks per visitor per calendar month. In-memory is enough
// for launch on a single Render instance; move to Supabase when running more than one.

const FREE_CHECKS_PER_MONTH = Number(process.env.FREE_CHECKS_PER_MONTH || 3);
const counts = new Map();

function monthKey(id) {
  const d = new Date();
  return `${id}:${d.getUTCFullYear()}-${d.getUTCMonth() + 1}`;
}

const usage = {
  count: (id) => counts.get(monthKey(id)) || 0,
  increment: (id) => counts.set(monthKey(id), (counts.get(monthKey(id)) || 0) + 1),
  reset: () => counts.clear(),
};

module.exports = { usage, FREE_CHECKS_PER_MONTH };
