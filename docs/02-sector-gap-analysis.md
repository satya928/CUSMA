# 2. Sector-by-sector gap analysis

For each field: what is **uniquely Canadian**, who the **existing players** are (businesses, services, manufacturers, government), real **use cases**, the **gap**, and the **simplest product** that fills it.

**How to read the "Fit" column**

- ★★★: buildable in days as a logic-first web tool, a clear buyer who pays, low competition.
- ★★: real gap, but crowded, slower to build or higher liability.
- ★: avoid for now.

---

## 2.1 Trade, customs and exporting ★★★

| | |
|---|---|
| **Uniquely Canadian** | About 86% of exporting businesses sell to one country. CUSMA rules of origin decide whether goods enter the U.S. duty-free, but in 2026 Section 232 and Section 338 tariffs stack on top **even for CUSMA goods**. The rules change monthly. |
| **Existing players** | Customs brokers (Livingston, Farrow, Cole, Clearit, UPS/FedEx brokerage): $150–400/hr. Big-4 trade advisory: enterprise pricing. Government: Canada Tariff Finder (rate lookup only), Trade Commissioner Service, a funded CUSMA Compliance Series workshop reaching about 700 firms. Software: Shipping Solutions, Descartes, Avalara classification. These generate documents for people who already know they qualify. |
| **Use cases** | A furniture maker adds a new SKU with Asian hardware: does it still qualify? A food processor sees dairy on the Section 338 list: what is the duty on the next truckload? A machine shop must decide whether switching a German part to an Ontario supplier is worth it for origin. |
| **Gap** | No self-serve tool that takes **HS code + bill of materials + costs** and returns **origin verdict + full U.S. duty stack + rule cited**. Nothing alerts SMEs when their HS codes land on a new tariff list. |
| **Simplest product** | **CUSMAcheck** (this repo): a web form that returns a verdict, the tariff stack and the exposure in dollars. Add **Tariff Alerts** (email when a saved HS code changes status). |
| **Format** | Web app (no host page to inject into). |

## 2.2 Importing and counter-tariffs (Canadian buyers of U.S. inputs) ★★★

| | |
|---|---|
| **Uniquely Canadian** | Canada levies counter-tariffs (surtaxes) on certain U.S.-origin goods. Ottawa has offered **remission** (refund or relief) for some inputs, for example those used in manufacturing, processing or food packaging. Eligibility is product- and date-specific (verify current remission orders). |
| **Existing players** | Customs brokers, CBSA guidance pages, trade lawyers. |
| **Use cases** | A small manufacturer imports U.S. resin and pays a surtax. Can they claim remission? For which entries, by what deadline? |
| **Gap** | SMEs don't know remission exists or whether their entries qualify, so money is left unclaimed. |
| **Simplest product** | **Surtax Remission Finder**: upload a customs entry CSV, match tariff codes against remission order schedules and list refundable entries plus deadlines. Pure lookup logic. Natural add-on to CUSMAcheck (same users, same HS data). |
| **Format** | Web app (CSV upload). |

## 2.3 Manufacturing ★★ (served through 2.1 and 2.2)

| | |
|---|---|
| **Uniquely Canadian** | Deeply integrated with U.S. supply chains (autos, parts and metals cross the border several times). Exposed directly to Section 232. |
| **Existing players** | ERPs (SAP, Epicor, Odoo), MRP tools, industry associations (CME, sector councils), EDC insurance and financing. |
| **Use cases** | Re-sourcing inputs to Canadian/Mexican suppliers to meet origin rules; quoting U.S. customers duty-inclusive prices. |
| **Gap** | "What-if sourcing" (if I switch supplier X, does my product qualify, and what duty do I save?). ERPs don't model origin. |
| **Simplest product** | Built into CUSMAcheck Pro as a scenario comparison. |

## 2.4 Retail and e-commerce ★★★ (two gaps)

| | |
|---|---|
| **Uniquely Canadian** | (a) Quebec **Bill 96**: websites, packaging, contracts, product labels and signage must be in French. Fines apply, and enforcement has risen to a record 11,125 complaints and a 7,800-business shopper study. (b) **Four sales-tax regimes**: an Alberta Shopify seller crossing provincial registration thresholds may need GST/HST, BC PST, Saskatchewan PST, Manitoba RST and Quebec QST registrations. Canada is also Shopify's home market. |
| **Existing players** | (a) Enterprise translation (TransPerfect, Smartcat, Weglot, Language IO) and law firms. (b) Avalara, Stripe Tax, TaxJar, accountants. |
| **Use cases** | (a) A 30-person Ontario e-commerce brand with Quebec customers: is my site, checkout, email and packaging compliant? (b) "I sold $40k into BC this year. Do I need to register for PST?" |
| **Gap** | (a) No SMB-priced **compliance audit** producing a prioritized French gap list. Existing tools translate; they don't audit. (b) Tax engines calculate tax once registered; none simply answers "where must I register, by when?" for small sellers. |
| **Simplest product** | (a) **Bill 96 Site Audit**: crawl a site, detect pages, checkout steps, emails and PDFs lacking French equivalents, check trademark/label wording rules and output a gap report. Optional browser extension "scan this page" as lead magnet. AI for French drafting in the paid tier. (b) **Provincial Sales-Tax Registration Checker**: sales by province in, registration obligations, thresholds and deadlines out. A Shopify app variant later. |
| **Format** | (a) Web app + extension lead magnet. (b) Web app, later Shopify app. |

## 2.5 Employment and payroll ★★

| | |
|---|---|
| **Uniquely Canadian** | Employment standards are provincial: vacation pay %, statutory holidays (different list per province), overtime, termination notice. Plus CPP vs **QPP** (Quebec), EI, provincial employer health taxes, and a separate workers' compensation board per province. |
| **Existing players** | Payroll software (Wagepoint, Payworks, ADP, Ceridian/Dayforce, Humi, Rise), HR lawyers, provincial ministry websites. |
| **Use cases** | A company hiring its first employee in another province; calculating termination pay; stat-holiday pay for a part-timer. |
| **Gap** | Payroll tools calculate deductions but don't give plain multi-province "what applies to me" answers before hiring. |
| **Simplest product** | **Province Rules Checker**: answer 5 questions (province, size, industry, employee type) and get the applicable rules with citations. Logic-first, but the rule base is large and must be maintained. |
| **Format** | Web app. |

## 2.6 Privacy, AI and data rules ★★

| | |
|---|---|
| **Uniquely Canadian** | Federal PIPEDA, plus Quebec **Law 25** (strictest in Canada, with privacy impact assessments and consent rules), Alberta and BC PIPA. Federal reform stalled; AI rules are developing province by province. |
| **Existing players** | Privacy law firms, OneTrust/TrustArc (enterprise), cookie-banner tools. |
| **Gap** | No SMB "which privacy laws apply and what must I do" checklist with a Law 25 template pack. |
| **Simplest product** | Fold into the Province Rules Checker or the Bill 96 product (same Quebec buyer). |

## 2.7 Housing and mortgages (consumer) ★★

| | |
|---|---|
| **Uniquely Canadian** | 5-year terms mean almost every homeowner renews on a known date. About 1.15M renewals in 2026 and 940k in 2027. Since late 2024, switching lenders at renewal no longer requires re-passing the stress test for many borrowers (verify scope). Prepayment penalties (IRD) are opaque. |
| **Existing players** | Big Five banks (default auto-renewal offers), brokers, Ratehub, nesto, Wealthsimple mortgages, bank calculators (biased toward their own product). |
| **Use cases** | "My renewal letter arrived: renew, switch, blend-and-extend or refinance?" |
| **Gap** | A neutral, narrow renewal triage that computes the penalty, compares switch versus renew, and gives a decision. |
| **Simplest product** | **Renewal Triage** calculator. **Caveat:** B2C with low willingness to pay. Revenue would come from broker referrals, which can trigger provincial mortgage-brokerage licensing rules. Medium liability. |
| **Format** | Web app (one-time decision). |

## 2.8 Innovation funding (SR&ED, grants) ★★

| | |
|---|---|
| **Uniquely Canadian** | SR&ED gives Canadian-controlled private corporations an enhanced refundable credit (35%; spending limit recently raised, verify). Also IRAP, CanExport SMEs (export marketing cost-share), provincial programs. |
| **Existing players** | Contingency-fee SR&ED consultants (often 15–30% of the refund), accountants, grant databases (e.g. Mentor Works, GrantMatch). |
| **Gap** | A cheap pre-check: is our work likely eligible, and roughly how much is the claim? Also a CanExport-for-exporters eligibility check (natural CUSMAcheck cross-sell). |
| **Simplest product** | **Grant & Credit Pre-check**. Crowded with consultants, but the consultants could be referral partners. |

## 2.9 Agriculture and food ★ (for software) / political flashpoint

| | |
|---|---|
| **Uniquely Canadian** | Supply management of dairy, poultry and eggs (quotas plus over-quota tariffs above 200%). Now targeted by U.S. Section 338 duties. Food is excluded from the 2026 internal-trade free-trade regulations. |
| **Existing players** | Marketing boards, co-ops, CFIA. |
| **Gap** | Food exporters to the U.S. face the tariff stack, which CUSMAcheck covers. Quota systems are not an SMB software gap. |

## 2.10 Energy, mining and forestry ★

| | |
|---|---|
| **Uniquely Canadian** | Resource superpower (oil sands, potash, uranium, critical minerals). Softwood lumber faces both Section 232 and long-running anti-dumping/countervailing duties. Indigenous consultation and benefit agreements shape projects. |
| **Existing players** | Large producers, engineering firms, consultancies. |
| **Gap** | Buyers are large companies with in-house teams. Small suppliers to them benefit indirectly from CUSMAcheck (steel, aluminum and lumber exposure). The **Indigenous procurement** angle (federal 5% target) is a possible directory/matching product but needs community partnership, so it is not a solo quick build. |

## 2.11 Financial services, banking and telecom ★

| | |
|---|---|
| **Uniquely Canadian** | Big Five/Six bank oligopoly, Interac rails, Big Three telecom carriers, open banking still rolling out. |
| **Existing players** | Wealthsimple, KOHO, Neo, EQ Bank, Questrade: well funded. |
| **Gap** | Real but capital- and regulation-heavy. **Avoid.** |

## 2.12 Immigration and newcomers ★

| | |
|---|---|
| **Uniquely Canadian** | Points-based Express Entry. Targets cut for 2025–2027. Rules change often. |
| **Existing players** | Licensed RCIC consultants, lawyers, IRCC's own CRS calculator, newcomer fintechs (KOHO, Borrowell). |
| **Gap** | Crowded, and the consequences for people are serious. Advice may require an RCIC licence. **Avoid** as a solo builder. |

## 2.13 Healthcare ★

Single-payer provincial systems with no insurance-billing maze. The pain shape is different from the U.S. **Low fit.**

## 2.14 Alcohol and cannabis ★★ (niche)

Provincial liquor boards and cannabis retailers each have their own listing and labelling processes. Craft producers selling across provinces are a real but small market. Alcohol is also on the Section 338 list, so craft exporters to the U.S. are CUSMAcheck users.

---

## Summary gap map

| Field | Canada-unique driver | Gap | Product | Fit |
|---|---|---|---|---|
| Export to U.S. | CUSMA + stacked 232/338 tariffs | Self-serve verdict + full duty stack | **CUSMAcheck** | ★★★ |
| Import from U.S. | Counter-tariff surtaxes + remission | Find refundable entries | **Surtax Remission Finder** | ★★★ |
| Retail / web | Quebec Bill 96 fines | SMB French compliance audit | **Bill 96 Site Audit** | ★★★ |
| E-commerce tax | 4 sales-tax regimes | "Where must I register?" | **Sales-Tax Registration Checker** | ★★★ |
| Employment | 10 provincial codes | "What rules apply to me?" | Province Rules Checker | ★★ |
| Privacy | Quebec Law 25 | SMB checklist + templates | Fold into Bill 96 product | ★★ |
| Mortgages | 5-year renewal cycle | Neutral renewal triage | Renewal Triage | ★★ |
| R&D funding | SR&ED / CanExport | Cheap eligibility pre-check | Grant & Credit Pre-check | ★★ |
| Banking, telecom, immigration, health | Oligopolies / licensing | Capital- or licence-heavy | Avoid | ★ |
