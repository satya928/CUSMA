# 6. Project status and roadmap

*Last updated: October 28, 2026*

## Where the project stands

| Item | Status |
|---|---|
| Product specification (`CUSMAcheck_Project_Spec.pdf`, Sep 8, 2026) | ✅ Done; carried into [`CLAUDE.md`](../CLAUDE.md) and updated for 2026 tariffs |
| Market and sector research | ✅ Done in this repo ([docs 01–05](.)) |
| Rules engine: origin criteria A/B/C/D, RVC (both methods), tariff shift, de minimis | ✅ Built and unit-tested |
| Tariff stack: MFN + Section 232 + Section 338, with CUSMA relief per layer | ✅ Built and unit-tested |
| Web app: form, verdict, tariff stack, free-tier gate (3/month) | ✅ Built (Node.js, no dependencies) |
| Supabase schema with audit log and RLS | ✅ Written (`db/schema.sql`); project not yet created |
| Stripe Checkout + webhook | ✅ Coded; Stripe account and CAD prices not yet created |
| Pitch deck | ✅ [`presentation/cusmacheck-deck.html`](../presentation/cusmacheck-deck.html) |
| **Rule data verified against CUSMA Annex 4-B** | ❌ **Draft only. Launch blocker** |
| **Tariff lists verified (exact HTSUS lines for 232/338, full MFN table)** | ❌ **Draft only. Launch blocker** |
| Deployment to Render | ❌ Not started |
| Legal review of disclaimer/terms; E&O insurance | ❌ Not started |
| French UI | ❌ v1.1 |

## Launch checklist (in order)

1. **Verify data.** Encode the launch chapters' Annex 4-B rules exactly, load the HTSUS MFN rates, and load the Section 232/338 annex lists. Ideally a licensed customs broker reviews them (paid retainer or partner deal). Flip `verified: true` only after review.
2. Create the Supabase project and run `db/schema.sql`.
3. Create the Stripe account (CAD), Starter and Pro prices, and a webhook to `/api/billing/webhook`.
4. Deploy to Render (`npm start`, env vars from `.env.example`).
5. Test with 3 real products from target users.
6. Run Day 2 outreach (see business model §4.6).
7. Success test: one paid Starter within 72 hours.

## Roadmap

| Version | Scope |
|---|---|
| **v1.0 (launch)** | Verified rules for 15–20 chapters, tariff stack, free/Starter tiers, audit log |
| **v1.1** | Tariff Alerts, AI plain-English explanation, Certificate of Origin (9 data elements) PDF, Pro tier, French UI |
| **v1.2** | Surtax Remission Finder (Canadian importers of U.S. inputs), what-if sourcing scenarios, CSV batch upload |
| **v2** | Concierge tier with partner brokers, full HS coverage, association/group plans |
| **Product #2** | Bill 96 Site Audit (web app + "scan this page" extension) |

## Note on GitHub access

An earlier session could not push to `satya928/CUSMA`. This session has GitHub access to the repository, so the work is committed and pushed directly to the branch `claude/charming-ramanujan-sqcgrh`.
