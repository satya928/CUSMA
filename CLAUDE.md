# CUSMAcheck — build guide

CUSMAcheck tells a Canadian exporter, in under 60 seconds, whether a product qualifies for CUSMA duty-free treatment into the U.S. and what the **full U.S. tariff stack** costs per shipment (MFN + Section 232 + Section 338). It replaces a $150–400/hr broker consultation for routine checks.

Owner: Sastry. Product type: web app (not a browser extension). Market: ~41,000 Canadian SME goods exporters to the U.S.

## Guiding principle

**If the output is a number or a verdict, write code, not AI.** The origin engine and tariff stack are deterministic. AI (Claude via the existing Render proxy) is only for v1.1 plain-English explanations and Certificate of Origin drafting, and it never decides a verdict.

## Layout

```
src/engine/       Pure logic, no I/O
  hs.js           HS code helpers (chapter/heading/subheading)
  rvc.js          Regional value content: transaction-value and net-cost methods
  origin.js       CUSMA criteria A/B/C/D, tariff shift, 10% de minimis, expert routing
  tariff.js       U.S. duty stack; CUSMA relief per layer
  index.js        runCheck(): origin + exposure + headline + disclaimer
src/data/
  psr-rules.json      Product-specific rules for launch chapters (DRAFT, verified:false)
  tariff-rates.json   MFN samples + Section 232/338 programs (DRAFT, verified:false)
src/server/       node:http server, free-tier counter, Supabase REST store, Stripe REST billing
public/           Static front end (index.html, app.js, styles.css)
db/schema.sql     Supabase tables + RLS
test/             node:test unit + HTTP tests
docs/             Market analysis, business model, tariff landscape, status
presentation/     Self-contained HTML pitch deck
```

## Commands

```bash
npm start          # http://localhost:3000
npm test           # node --test
```

No npm dependencies; Node ≥ 20. Supabase and Stripe are called over REST and are optional locally (the app runs in memory without env vars).

## Rules the code must keep

- **Never invent a rate.** If an MFN rate is missing, return a warning and ask the user for it; do not default to 0.
- **CUSMA removes only the MFN layer.** Section 232 and Section 338 apply regardless (autos: partial relief → expert review). Section 338 is not stacked where a 232 program applies.
- **Autos (ch. 87) and apparel/textiles (ch. 61–63) return `needs_expert`.** Their rules (75% RVC, LVC, yarn-forward) are out of v1 scope.
- **Every result carries the disclaimer and `ratesAsOf`.** Every check is logged (inputs, result, rate date) for the audit trail.
- **Data files stay `verified: false` until a licensed broker has reviewed them** against CUSMA Annex 4-B and the Federal Register/CBP lists. The UI shows "draft data" while unverified.
- Use the most specific HS prefix match for rules and rates.

## Origin logic (CUSMA Art. 4.2)

1. Ch. 61–63 or 87 → `needs_expert`.
2. Declared wholly obtained → **A**.
3. All materials from CA/US/MX → **C** (warn that each material must itself be originating).
4. Product-specific rule: any option met (every non-originating material changes tariff chapter/heading/subheading, with 10% de minimis; plus RVC if required) → **B**.
5. Failing materials share the good's subheading, other materials shift, and RVC ≥ 60% TV / 50% NC → **D**.
6. Otherwise `does_not_qualify`, with reasons per rule option.

RVC: TV method `(TV − VNM)/TV`, NC method `(NC − VNM)/NC`; the producer may use whichever passes.

## Tiers

Free (3 checks/month) · Starter CA$29/mo · Pro CA$79/mo · Concierge per review via partner brokers. See `docs/04-business-model.md`.

## Before launch

See `docs/06-status-and-roadmap.md`. Blockers: verified rule data and verified tariff lists.
