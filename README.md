# CUSMAcheck

**Know in 60 seconds whether your product qualifies for CUSMA, and what the U.S. will actually charge you.**

A self-serve web app for Canadian SME exporters. Enter an HS code and a bill of materials; get:

- the CUSMA origin verdict (Criterion A/B/C/D or not qualified), with the rule and the RVC math,
- the **full U.S. tariff stack** for the shipment. CUSMA removes MFN duty, but in 2026 Section 232 and the new Section 338 duties (50%) still apply to many Canadian goods,
- dollar exposure, the savings from qualifying, and an audit-ready log.

> **Status (Oct 2026):** working engine, API, UI and tests. Rule and tariff data are **drafts pending broker verification**, which is a launch blocker. See [status and roadmap](docs/06-status-and-roadmap.md).

## Documents

| | |
|---|---|
| [1. Canada's economy explained (vs U.S., India, world)](docs/01-canada-economy-explained.md) | Plain-language primer and what's unique about Canada |
| [2. Sector-by-sector gap analysis](docs/02-sector-gap-analysis.md) | 14 fields: existing players, use cases, gaps, simplest product |
| [3. Opportunity ranking](docs/03-opportunity-ranking.md) | Scored shortlist and why CUSMAcheck goes first |
| [4. Business model](docs/04-business-model.md) | Pricing, market size, scenarios, unit economics, go-to-market |
| [5. U.S. tariff landscape 2026](docs/05-us-tariff-landscape-2026.md) | MFN, Section 232, Section 338, IEEPA, CUSMA review |
| [6. Status and roadmap](docs/06-status-and-roadmap.md) | What's built, launch blockers, next versions |
| [Sources](docs/sources.md) | Links for every figure |
| [Pitch deck](presentation/cusmacheck-deck.html) | Open in a browser; arrow keys to navigate |
| [CLAUDE.md](CLAUDE.md) | Build guide and engineering rules |

## Run it

```bash
npm start
```

Then open http://localhost:3000. No dependencies; Node 20+.

```bash
npm test
```

Copy `.env.example` to `.env` to enable Supabase (accounts, audit log) and Stripe (Starter/Pro in CAD).

## API

`POST /api/check`

```json
{
  "hsCode": "940360",
  "transactionValue": 500,
  "shipmentValue": 25000,
  "materials": [
    { "description": "Oak lumber", "hsCode": "440791", "cost": 120, "countryOfOrigin": "CA" },
    { "description": "Steel hinges", "hsCode": "830242", "cost": 30, "countryOfOrigin": "CN" }
  ]
}
```

The response contains `origin` (status, criterion, reasons, RVC), `exposure` (layers, total duty, effective rate, warnings, `ratesAsOf`), `headline` and `disclaimer`.

## Disclaimer

Advisory estimates only. CUSMAcheck is not a licensed customs broker and does not issue rulings.
