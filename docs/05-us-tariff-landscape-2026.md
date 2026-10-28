# 5. The U.S. tariff stack on Canadian goods (as of October 2026)

The engine's tariff model (`src/data/tariff-rates.json`) follows this page. **All of it must be verified against primary sources (Federal Register, CBP CSMS, Trade Commissioner Service) before launch.** Several advisories disagree on dates.

## How the layers combine

```
U.S. duty on a shipment =
    MFN (general) rate        -> removed if the good qualifies under CUSMA
  + Section 232 sectoral      -> NOT removed by CUSMA (autos: partial relief)
  + Section 338 (Canada list) -> NOT removed by CUSMA; not stacked where 232 applies
```

| Layer | Rate | Scope | CUSMA relief | Status |
|---|---|---|---|---|
| **MFN (general) duty** | 0–~30% by HTSUS line; many industrial goods 0–6% | All goods | **Full** (if the good qualifies) | Permanent |
| **Section 232: steel and derivatives** | 50% | Ch. 72, many ch. 73 articles; derivatives on steel content | None | In force |
| **Section 232: aluminum** | 50% | Ch. 76 + derivatives on aluminum content | None | In force |
| **Section 232: copper** | 50% | Semi-finished copper | None | In force |
| **Section 232: softwood lumber** | 10% | HS 4407 (plus separate company-specific AD/CVD duties) | None | In force |
| **Section 232: upholstered furniture, cabinets, vanities** | 25% (scheduled increases reported) | 9401.61/.71, 9403.40, 9403.60.80 | None | In force; dates of increases conflict |
| **Section 232: autos and parts** | 25% | 8703, 8704, 8708 | Partial (non-U.S. content) | In force; expert review |
| **Section 338: Canada-specific** | 50% | 3 proclamations (Jul 20, 2026): alcohol (63 subheadings), dairy and other agri (52 subheadings), plus a broader list. About 569 lines, ~$20B | **None** | Effective ~Aug 22, 2026 (originally Aug 19). A further expansion reported for Oct 30, 2026 is unconfirmed |
| ~~IEEPA "fentanyl" tariff~~ | ~~35% on non-CUSMA goods~~ | — | — | **Struck down** Feb 20, 2026 (*Learning Resources v. Trump*); collection stopped Feb 24. Refunds in litigation |
| Section 122 surcharge | 10% | Global, temporary | Unclear | Began Feb 24, 2026; 150-day statutory limit. **Current status unconfirmed** |

## Why this makes CUSMAcheck more valuable

Before 2026 the question was binary: *qualify, pay 0%; otherwise pay MFN + the IEEPA tariff.* Now:

- A CUSMA-qualifying steel bracket still pays **50%** (232).
- A CUSMA-qualifying Quebec cheese or Ontario wine can pay **50%** (338).
- A non-qualifying plastic part might pay only the **MFN 5.3%**, now that IEEPA is gone.

SMEs can't work this out from a single government lookup. The engine shows each layer, whether it applies, why, and the total.

## CUSMA's own status

- **July 1, 2026 joint review:** Canada and Mexico agreed to extend; the U.S. did not. The agreement **remains in force** (through 2036 unless a party withdraws on six months' notice under Art. 34.6). Annual reviews now apply; 2027 review comments close January 12, 2027 (reported).
- Practical effect today: CUSMA preferences (MFN removal) still apply.

## Data the production app needs

1. Full HTSUS general rates (USITC HTS, 8–10 digit).
2. Exact HTSUS annex lists for each Section 232 action and the three Section 338 proclamations.
3. CUSMA Annex 4-B product-specific rules for the launch chapters, verified line by line.
4. A refresh process: watch the Federal Register and CBP CSMS, update `tariff_rates` with an `effective_date`, and stamp every result with "rates as of".
