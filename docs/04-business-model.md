# 4. CUSMAcheck business model

*All financial figures are **planning assumptions**, not research results. They are labelled so they can be replaced with real data after the first 30 days.*

## 4.1 Business model on one page

| Block | CUSMAcheck |
|---|---|
| **Customer** | Owner or operations lead at a Canadian SME (<500 staff) that makes or distributes physical goods sold to the U.S. Mainly manufacturing, wholesale, food processing, wood/paper, plastics and machinery. |
| **Problem** | "Does my product qualify for CUSMA, and what will the U.S. actually charge me?" In 2026 the answer changes monthly and CUSMA no longer covers every tariff. Today SMEs either pay a broker $150–400/hr per question, guess, or pay full duty. |
| **Value proposition** | Verdict + rule cited + full U.S. duty stack in dollars, in under 60 seconds, repeatable for every SKU, with alerts when rules change. |
| **Product** | Web app. Logic-first rules engine (no AI in the verdict). AI only for plain-English explanations and Certificate of Origin drafts (v1.1). |
| **Revenue** | Monthly SaaS in CAD via Stripe, with a free tier as the funnel. Later a Concierge tier fulfilled with partner customs brokers (revenue share). |
| **Channels** | Industry associations (CFIB, CME, chambers), LinkedIn, customs-broker referral partners, programmatic SEO ("Is HS 9403.60 CUSMA-eligible?"), Trade Commissioner / EDC ecosystem. |
| **Key costs** | Rule and rate verification (broker review), errors-and-omissions insurance, hosting, Stripe fees. |
| **Unfair advantage** | Speed and focus: the only self-serve tool showing the *whole* stack (CUSMA + 232 + 338) at SME prices, an audit log of every check, and a growing dataset of which HS codes SMEs actually ask about. |

## 4.2 Pricing

| Tier | Price (CAD) | Included | Role |
|---|---|---|---|
| **Free** | $0 | 3 checks/month, no history | Lead generation; the "wow" moment |
| **Starter** | $29/month | Unlimited checks, saved product library, exposure history, email/PDF export, **Tariff Alerts** on saved HS codes | Core revenue |
| **Pro** | $79/month | Starter + AI plain-English explanations, Certificate of Origin auto-fill, what-if sourcing scenarios, 3 seats, Surtax Remission Finder | Expansion revenue |
| **Concierge** | From $250 per review (assumption) | A licensed partner broker reviews edge cases (autos, apparel, classification disputes) | Partner revenue share |

**Changes to the original spec:**

1. Add **Tariff Alerts** to Starter. After Section 338, the main reason to keep paying is "tell me when my products' status changes", which drives retention.
2. Price Concierge per review rather than leaving it "custom", so it can launch through a partner broker without new infrastructure.

**Why a subscription and not pay-per-check:** exporters add SKUs, switch suppliers and face new tariff lists every month. Each of those is a new check. $29/month is less than **one** broker consultation, so the first use pays for the first month.

## 4.3 Market size

| Step | Number | Basis |
|---|---|---|
| Canadian enterprises exporting goods (2025) | ~47,900 | Statistics Canada, Apr 2026 |
| …that sell to the U.S. | ~41,000 | ~86% share (establishment basis; approximate) |
| …that are SMEs | ~40,000 | >97% of exporters are SMEs |
| **Serviceable** (in launch HS chapters, not autos/apparel) | ~24,000 | **Assumption:** 60% |
| TAM at Starter price | ~$14.3M CAD/yr | 41,000 × $348 |
| SAM at blended ARPU ($39/mo) | ~$11.2M CAD/yr | 24,000 × $468 |

Blended ARPU assumes 80% Starter and 20% Pro: 0.8 × $29 + 0.2 × $79 = **$39/month**.

## 4.4 Twelve-month scenarios (assumptions)

| Scenario | Paying customers at month 12 | MRR | ARR run-rate | Implied share of SAM |
|---|---|---|---|---|
| Conservative | 50 | $1,950 | $23,400 | 0.2% |
| **Base** | **200** | **$7,800** | **$93,600** | 0.8% |
| Upside | 600 | $23,400 | $280,800 | 2.5% |

Base-case funnel (assumptions): about 6,000 free sign-ups in 12 months, 4% convert to paid, 4% monthly churn. Rough check: 6,000 × 4% = 240 conversions, minus churn, leaves about 200 active at month 12.

## 4.5 Unit economics and costs (assumptions)

| Monthly cost | Estimate (CAD) |
|---|---|
| Render web service | $10–35 |
| Supabase Pro | ~$35 |
| Email (alerts, receipts) | ~$20 |
| Claude API (v1.1 explanations) | $20–100 |
| Errors-and-omissions insurance | $125–250 ($1.5–3k/yr) |
| Broker review of rule and rate tables (retainer) | $500–1,500 |
| **Fixed total** | **~$710–1,940** |

| Per subscriber | Estimate |
|---|---|
| Stripe fee on $39 | ~$1.43 (2.9% + $0.30) |
| Contribution margin | ~$37.50 (96%) |
| **Break-even** | **~20–52 subscribers** |
| CAC target (organic/partners) | < $80, a payback of about 2 months |

Tax note: once revenue passes the $30,000 small-supplier threshold, the business must charge GST/HST and register for QST if selling to Quebec customers. Stripe Tax is enabled in the checkout code.

## 4.6 Go-to-market

| Phase | Actions | Success signal |
|---|---|---|
| **Day 2–3: reach and earn** | Post the free tool in CFIB forums and tariff threads, CME LinkedIn groups and r/smallbusiness/r/canadianbusiness. DM ops and trade-compliance titles. Upgrade screen after the 3rd free check. | **1 paid Starter in 72 hours** = validated. If none, change the channel, not the product. |
| **Weeks 2–6** | Programmatic SEO: one page per covered HS heading ("CUSMA rule + current U.S. tariff stack for 9403"). Weekly "tariff change" email. | 500 free sign-ups; 10+ paying |
| **Months 2–4** | **Broker partnership**: brokers refer small clients who don't justify an hourly fee; CUSMAcheck refers complex cases back (Concierge revenue share). Pitch to chambers of commerce and regional export associations as a member benefit (group pricing). | 2 broker partners; 1 association deal |
| **Months 4–12** | Add the Surtax Remission Finder (Pro). French UI (Quebec is about a fifth of the market, and it is the right thing to do under Bill 96). CSV batch upload. | Base-case trajectory |

## 4.7 Competitive positioning

| Alternative | What it does | Why CUSMAcheck wins for SMEs |
|---|---|---|
| Canada Tariff Finder (free, government) | Rate lookup | Doesn't decide qualification or stack 232/338 |
| Customs broker | Expert answer | $150–400/hr; doesn't scale to repeated checks per SKU |
| Export-documentation software | Fills forms | Assumes you already know you qualify |
| Government CUSMA workshops | One-time training | Reach about 700 of 41,000 exporters |
| Enterprise trade suites (Descartes, Thomson Reuters ONESOURCE, SAP GTS) | Full trade compliance | Priced and built for large companies |

## 4.8 Key metrics

- Activation: % of visitors who complete one check (target >30%)
- Free → paid conversion (target 3–5%)
- Monthly churn (target <4%)
- Checks per paying user per month (retention signal)
- Share of checks hitting `needs_expert` / `not_covered` (shows where to expand rule coverage)
- Accuracy: % of verdicts later contradicted by a broker or CBSA (target ≈0; every one investigated)

## 4.9 Risks

| Risk | Mitigation |
|---|---|
| Wrong verdict leads to customs penalties for a user | "Advisory only" on every result; audit log of inputs, rule and rate date; broker-verified rule tables; E&O insurance; expert routing for autos and apparel |
| Tariff rules change monthly (Section 338 additions, CUSMA annual reviews) | Data-driven rate tables with an `as of` date on every result; scheduled refresh; alerts turn volatility into a reason to subscribe |
| CUSMA ends (U.S. withdrawal on 6 months' notice) | The tariff-stack calculator stays useful (MFN + sectoral); pivot positioning to "U.S. duty calculator for Canadian exporters" |
| Narrow HS coverage at launch | Start with top chapters; log `not_covered` requests to prioritize expansion |
| Freelance customs advice can be regulated | Position as a calculator and education tool, not brokerage; review terms with a Canadian lawyer before launch |
