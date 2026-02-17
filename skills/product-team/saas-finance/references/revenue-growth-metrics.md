<!-- Source: Product-Manager-Skills by Dean Peters (https://github.com/deanpeters/Product-Manager-Skills)
     License: CC BY-NC-SA 4.0 — Attribution required, NonCommercial, ShareAlike
     Adapted for agents-and-skills skill format. -->


## Purpose

Master revenue and retention metrics to understand SaaS business momentum, evaluate product-market fit, and make data-driven decisions about growth investments. Use this to calculate key metrics, interpret trends, identify problems early, and communicate business health to stakeholders.

This is not a business intelligence tool—it's a framework for PMs to understand which metrics matter, how to calculate them correctly, and what actions to take based on the numbers.

## Key Concepts

### Revenue Metrics Family

The "top-line" metrics that measure how much money the business generates.

**Revenue** — Total money earned from selling products/services before expenses. The "top line" of the income statement.
- **Why PMs care:** Every feature should connect to revenue (direct or indirect). If you can't articulate revenue impact, prioritization becomes impossible.
- **Formula:** Sum of all customer payments in a period
- **Benchmark:** Growth rate matters more than absolute number (context-dependent by stage)

**ARPU (Average Revenue Per User)** — Average revenue generated per individual user.
- **Why PMs care:** Measures per-seat monetization effectiveness. Critical for seat-based pricing models.
- **Formula:** `Total Revenue / Total Users`
- **Benchmark:** Varies by model; track trend more than absolute value
- **B2C SaaS:** $5-50/month typical; B2B: $50-500+/month

**ARPA (Average Revenue Per Account)** — Average revenue generated per customer account.
- **Why PMs care:** Measures account-level deal size. Critical for account-based pricing models.
- **Formula:** `MRR / Active Accounts`
- **Benchmark:** SMB SaaS: $100-$1K/month; Mid-market: $1K-$10K; Enterprise: $10K+

**ARPA/ARPU Analysis** — Using both metrics together to understand monetization.
- **Why PMs care:** Prevents packaging mistakes. High ARPA + low ARPU = undermonetized per seat. Low ARPA + high ARPU = small deal sizes.
- **Example:** $10K ARPA with 100 seats = $100 ARPU (reasonable). $10K ARPA with 1,000 seats = $10 ARPU (leaving money on table).

**ACV (Annual Contract Value)** — Annualized recurring revenue per contract (excludes one-time fees).
- **Why PMs care:** Compares economics across different contract structures. Enables sales compensation design and segment analysis.
- **Formula:** `Annual Recurring Revenue per Contract` (don't include setup fees, professional services)
- **Benchmark:** SMB: $5K-$25K; Mid-market: $25K-$100K; Enterprise: $100K+

**MRR/ARR (Monthly/Annual Recurring Revenue)** — Predictable recurring revenue normalized to monthly or annual.
- **Why PMs care:** The heartbeat of subscription businesses. Valued at 5-10x+ multiples. Track components (new, expansion, churn).
- **Formula:** `MRR = Sum of all recurring subscription revenue per month`; `ARR = MRR × 12`
- **Benchmark:** Growth rate and quality matter; track new MRR, expansion MRR, churned MRR, contracted MRR

**Gross vs. Net Revenue** — Gross revenue before vs. net revenue after discounts, refunds, credits.
- **Why PMs care:** Discounts and refunds can hide bad acquisition quality or product problems.
- **Formula:** `Net Revenue = Gross Revenue - Discounts - Refunds - Credits`
- **Benchmark:** Refunds >10% is a red flag; track by acquisition channel

---

### Retention & Expansion Metrics Family

Metrics that measure how well you keep and grow existing customers.

**Churn Rate** — Percentage of customers who cancel in a period.
- **Why PMs care:** Silent killer of SaaS. Undermines all acquisition efforts. 5% monthly churn = 46% annual churn (compounding).
- **Formula:** `Customers Lost in Period / Starting Customers`
- **Benchmark (Monthly):** <2% great, 2-5% acceptable, >5% crisis
- **Benchmark (Annual):** <10% great, 10-30% acceptable, >30% crisis
- **Note:** Logo churn (customer count) differs from revenue churn (dollar amount)

**NRR (Net Revenue Retention)** — Revenue retention from existing customers including expansion and contraction.
- **Why PMs care:** The holy grail metric. NRR >100% means you grow without new logos. Highly valued by investors.
- **Formula:** `(Starting ARR + Expansion - Churn - Contraction) / Starting ARR × 100`
- **Benchmark:** >120% excellent, 100-120% good, 90-100% acceptable, <90% problem
- **Example:** Start with $1M ARR, add $300K expansion, lose $100K to churn = $1.2M / $1M = 120% NRR

**Expansion Revenue** — Additional revenue from existing customers (upsells, cross-sells, usage growth).
- **Why PMs care:** Most capital-efficient revenue (no CAC). Should drive NRR >100%.
- **Formula:** `Sum of upsells + cross-sells + usage increases from existing customers`
- **Benchmark:** Should represent 20-30% of total revenue; drives NRR >100%

**Quick Ratio (SaaS)** — Revenue gains vs. revenue losses.
- **Why PMs care:** Shows if you're building on solid ground or running on a treadmill.
- **Formula:** `(New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)`
- **Benchmark:** >4 excellent, 2-4 healthy, <2 leaky bucket

---

### Analysis Frameworks

**Revenue Mix Analysis** — Breakdown of revenue by product, segment, or channel.
- **Why PMs care:** Identifies which products fund the business and where to invest. Reveals concentration risk.
- **Formula:** `Product/Segment Revenue / Total Revenue × 100`
- **Benchmark:** No single product >60% ideal; diversification reduces risk

**Cohort Analysis** — Group customers by join date and track behavior over time.
- **Why PMs care:** Blended metrics hide critical trends. Shows whether business is improving or degrading.
- **Method:** Track retention, expansion, and LTV by cohort (e.g., "Jan 2024 cohort")
- **Benchmark:** Recent cohorts should perform same or better than old cohorts

---

### Anti-Patterns (What This Is NOT)

- **Not profit metrics:** Revenue is top-line, not bottom-line. High revenue with negative margins is a disaster.
- **Not vanity metrics:** Total revenue growth means nothing if driven by unsustainable discounting or margin-destroying deals.
- **Not blended averages:** ARPU that averages $10 SMB and $1,000 enterprise customers hides segment economics.
- **Not isolated numbers:** Churn rate alone doesn't tell the story—need to see cohort trends and NRR.

---

### When to Use These Metrics

**Use these when:**
- Evaluating overall business health and product-market fit
- Comparing performance across time periods or cohorts
- Prioritizing features with direct monetization paths (ARPU impact, expansion enablers)
- Communicating with leadership, board, or investors
- Assessing retention problems (churn analysis, cohort degradation)
- Measuring pricing or packaging changes (ARPU/ARPA shifts)

**Don't use these when:**
- Evaluating profitability (use margin metrics instead)
- Assessing capital efficiency (use LTV:CAC, payback period)
- Making product investment decisions without cost context (revenue alone isn't ROI)
- Comparing across wildly different business models without normalization

---

## Application

### Step 1: Calculate Revenue Metrics

Use the templates in `template.md` to calculate your core revenue metrics.

#### Revenue
```
Revenue = Sum of all customer payments in period
```

**Example:**
- Month 1 payments: $100,000
- Revenue = $100,000

**Quality checks:**
- Is this gross or net revenue? (Clarify if discounts/refunds are included)
- Is revenue growing cohort-over-cohort, or just from new customer adds?
- What's the revenue growth rate vs. headcount/cost growth rate?

---

#### ARPU (Average Revenue Per User)
```
ARPU = Total Revenue / Total Users
```

**Example:**
- Total Revenue: $100,000/month
- Total Users: 2,000
- ARPU = $100,000 / 2,000 = $50/user/month

**Quality checks:**
- Is ARPU growing or shrinking over time?
- Is ARPU growth from price increases or mix shift (losing small customers)?
- How does ARPU vary by cohort? (Are new customers less valuable?)

---

#### ARPA (Average Revenue Per Account)
```
ARPA = MRR / Active Accounts
```

**Example:**
- MRR: $100,000
- Active Accounts: 200
- ARPA = $100,000 / 200 = $500/account/month

**Quality checks:**
- Is ARPA growing from expansion or just larger new deals?
- How does ARPA compare across customer segments?
- Is ARPA high but ARPU low? (Undermonetized per seat)

---

#### ARPA/ARPU Combined Analysis
```
ARPA = MRR / Active Accounts
ARPU = MRR / Total Users
Average Seats per Account = ARPA / ARPU
```

**Example:**
- ARPA: $500/month
- ARPU: $50/month
- Average Seats: $500 / $50 = 10 seats/account

**Quality checks:**
- Are you monetizing per seat effectively?
- Could you charge more per seat (raise ARPU)?
- Could you expand seat count per account (raise ARPA)?

---

#### ACV (Annual Contract Value)
```
ACV = Annual Recurring Revenue per Contract
(Exclude one-time fees like setup, professional services)
```

**Example:**
- Customer signs 3-year contract for $300K total
- ACV = $300K / 3 years = $100K/year

**Quality checks:**
- How does ACV vary by segment (SMB vs. Enterprise)?
- Is ACV growing over time (moving upmarket)?
- Does ACV justify sales team cost structure?

---

#### MRR/ARR (Monthly/Annual Recurring Revenue)
```
MRR = Sum of all recurring monthly subscriptions
ARR = MRR × 12

Track components:
- New MRR (from new customers)
- Expansion MRR (from upsells/cross-sells)
- Churned MRR (from lost customers)
- Contraction MRR (from downgrades)
```

**Example:**
- Starting MRR: $500K
- New MRR: +$50K
- Expansion MRR: +$20K
- Churned MRR: -$15K
- Contraction MRR: -$5K
- Ending MRR: $550K
- ARR = $550K × 12 = $6.6M

**Quality checks:**
- Is MRR growth from new customers or expansion?
- Is churn/contraction increasing as you grow?
- What's the ratio of new:expansion:churn MRR? (Best: expansion > new)

---

#### Gross vs. Net Revenue
```
Net Revenue = Gross Revenue - Discounts - Refunds - Credits
```

**Example:**
- Gross Revenue: $100K
- Discounts: -$10K
- Refunds: -$2K
- Net Revenue: $88K

**Quality checks:**
- Are discounts >20%? (Pricing power problem)
- Are refunds >10%? (Product quality problem)
- Do certain channels have higher discount/refund rates?

---

### Step 2: Calculate Retention & Expansion Metrics

#### Churn Rate
```
Logo Churn Rate = Customers Lost / Starting Customers × 100
Revenue Churn Rate = MRR Lost / Starting MRR × 100
```

**Example (Logo Churn):**
- Starting Customers: 1,000
- Customers Lost: 30
- Logo Churn = 30 / 1,000 = 3% monthly

**Example (Revenue Churn):**
- Starting MRR: $500K
- MRR Lost: $15K
- Revenue Churn = $15K / $500K = 3% monthly

**Quality checks:**
- Is churn rate accelerating or decelerating over time?
- Are newer cohorts churning faster than older ones? (PMF degradation)
- Is revenue churn higher than logo churn? (Losing big customers)

**Convert monthly to annual:**
- Monthly churn compounds: 3% monthly ≠ 36% annual
- Formula: `Annual Churn = 1 - (1 - Monthly Churn)^12`
- 3% monthly = ~31% annual churn

---

#### NRR (Net Revenue Retention)
```
NRR = (Starting ARR + Expansion - Churn - Contraction) / Starting ARR × 100
```

**Example:**
- Starting ARR: $5M
- Expansion: +$800K
- Churn: -$300K
- Contraction: -$100K
- Ending ARR from cohort: $5.4M
- NRR = $5.4M / $5M = 108%

**Quality checks:**
- Is NRR >100%? (You grow without new logos)
- Is NRR improving or degrading cohort-over-cohort?
- What's driving NRR? (Expansion or low churn?)

---

#### Expansion Revenue
```
Expansion Revenue = Upsells + Cross-sells + Usage Growth (from existing customers)
```

**Example:**
- Upsells to higher tier: $50K/month
- Cross-sells of add-ons: $20K/month
- Usage growth: $10K/month
- Total Expansion Revenue: $80K/month

**Quality checks:**
- Is expansion revenue growing as % of total revenue?
- What % of customers expand each year? (Expansion rate)
- Are certain cohorts/segments more likely to expand?

---

#### Quick Ratio (SaaS)
```
Quick Ratio = (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)
```

**Example:**
- New MRR: $50K
- Expansion MRR: $20K
- Churned MRR: $15K
- Contraction MRR: $5K
- Quick Ratio = ($50K + $20K) / ($15K + $5K) = $70K / $20K = 3.5

**Quality checks:**
- Quick Ratio >4 = excellent (gains far exceed losses)
- Quick Ratio 2-4 = healthy (sustainable growth)
- Quick Ratio <2 = leaky bucket (fix retention before scaling)

---

### Step 3: Analyze Trends with Frameworks

#### Revenue Mix Analysis
```
Product/Segment % = Product/Segment Revenue / Total Revenue × 100
```

**Example:**
- Product A Revenue: $300K
- Product B Revenue: $500K
- Product C Revenue: $200K
- Total Revenue: $1M
- Product A: 30%, Product B: 50%, Product C: 20%

**Quality checks:**
- Is revenue concentration increasing? (Risk: over-reliance on one product)
- Which products are growing/shrinking?
- Does revenue mix match your strategic priorities?

---

#### Cohort Analysis
Group customers by when they joined and track metrics over time.

**Example:**
| Cohort | Month 0 | Month 1 | Month 2 | Month 3 | Month 6 |
|--------|---------|---------|---------|---------|---------|
| Jan 2024 | 100% | 95% | 92% | 90% | 85% |
| Feb 2024 | 100% | 94% | 90% | 87% | 80% |
| Mar 2024 | 100% | 92% | 86% | 82% | - |

**Quality checks:**
- Are recent cohorts retaining better or worse than older cohorts?
- If worse: Product-market fit is degrading (fix before scaling)
- If better: Improvements are working (safe to scale)
- Track revenue retention by cohort, not just logo retention

---

### Step 4: Quality Checks & Benchmarks

Before reporting metrics, validate:

**Revenue metrics:**
- Gross vs. net revenue clearly labeled
- Revenue growth rate > cost growth rate
- ARPU/ARPA trends analyzed by cohort (not just blended)

**Retention metrics:**
- Logo churn and revenue churn both tracked
- Cohort-over-cohort trends analyzed (not just blended churn)
- NRR tracked with components (expansion, churn, contraction)

**Analysis:**
- Cohort analysis shows retention trends
- Revenue mix shows concentration risk
- Quick ratio shows growth sustainability

---

## Examples

See `examples/` folder for detailed scenarios. Mini examples below:

### Example 1: Healthy SaaS Metrics

**Company:** Mid-market project management SaaS

**Revenue Metrics:**
- MRR: $2M (growing 10% month-over-month)
- ARR: $24M
- ARPA: $1,200/month (200 accounts)
- ARPU: $120/month (20,000 users)
- Average seats: 100 per account

**Retention Metrics:**
- Monthly logo churn: 2%
- Revenue churn: 1.5% (losing smaller customers)
- NRR: 115% (strong expansion)
- Expansion revenue: $200K/month (10% of MRR)
- Quick Ratio: 5.0

**Analysis:**
- Strong growth (10% MoM MRR)
- Excellent retention (2% logo churn, 115% NRR)
- Healthy expansion (NRR >100%)
- Sustainable (Quick Ratio 5.0)
- Revenue churn < logo churn (losing smaller customers, good signal)

**Action:** Scale acquisition. Unit economics are strong.

---

### Example 2: Warning Signs

**Company:** SMB marketing automation SaaS

**Revenue Metrics:**
- MRR: $500K (growing 15% month-over-month)
- ARR: $6M
- ARPA: $250/month (2,000 accounts)
- ARPU: $50/month (10,000 users)

**Retention Metrics:**
- Monthly logo churn: 6% (increasing from 4% six months ago)
- Revenue churn: 7% (losing larger customers)
- NRR: 85% (contracting)
- Expansion revenue: $5K/month (1% of MRR)
- Quick Ratio: 1.2

**Cohort Analysis:**
| Cohort | Month 6 Retention |
|--------|-------------------|
| 6 months ago | 75% |
| 3 months ago | 65% |
| Current | 58% |

**Analysis:**
- High churn (6% monthly = ~50% annual)
- Revenue churn > logo churn (losing bigger customers)
- NRR <100% (contracting, not expanding)
- Cohort degradation (newer customers churn faster)
- Quick Ratio 1.2 (leaky bucket)

**Action:** STOP scaling acquisition. Fix retention first. Investigate:
- Why are newer cohorts churning faster?
- Why is expansion revenue only 1% of MRR?
- What's causing customer contraction?

---

### Example 3: Blended Metrics Hiding Problems

**Company:** Multi-product SaaS platform

**Blended Metrics Look Great:**
- MRR: $3M (growing 20% MoM)
- Blended churn: 3%
- Blended NRR: 110%

**But Revenue Mix Analysis Shows:**
| Product | Revenue | % of Total | Growth | Churn | NRR |
|---------|---------|------------|--------|-------|-----|
| Legacy Product | $2M | 67% | -5% MoM | 8% | 75% |
| New Product | $1M | 33% | +80% MoM | 1% | 150% |

**Analysis:**
- Legacy product (67% of revenue) is dying: -5% growth, 8% churn, 75% NRR
- New product is stellar: +80% growth, 1% churn, 150% NRR
- Blended metrics hide the fact that 2/3 of revenue is contracting
- High dependency on one product (67% concentration risk)

**Action:** Accelerate migration from legacy to new product. Plan for legacy product sunset.

---

## Common Pitfalls

### Pitfall 1: Confusing Revenue with Profit
**Symptom:** "We grew revenue 50% this year, we're crushing it!"

**Consequence:** Revenue is the top line, not bottom line. You might be growing at a loss, destroying margins, or scaling unprofitable products.

**Fix:** Always pair revenue metrics with margin metrics (see `saas-economics-efficiency-metrics`). $1M revenue at 80% margin >> $2M revenue at 20% margin.

---

### Pitfall 2: Celebrating ARPU Growth from Mix Shift
**Symptom:** "ARPU increased 30%!" (but customer count dropped 40%)

**Consequence:** ARPU rose because you lost all your small customers, not because you improved monetization.

**Fix:** Analyze ARPU by cohort and segment. True ARPU improvement = same customers paying more, not losing cheap customers.

---

### Pitfall 3: Ignoring Cohort Degradation
**Symptom:** "Blended churn is stable at 3%"

**Consequence:** Blended metrics can hide that new cohorts churn at 6% while old cohorts churn at 1%. Product-market fit is degrading.

**Fix:** Always analyze retention by cohort. If newer cohorts perform worse, stop scaling and fix the product.

---

### Pitfall 4: Logo Churn vs. Revenue Churn Confusion
**Symptom:** "Logo churn is only 2%, we're great!"

**Consequence:** You might be losing 2% of customers but 10% of revenue if you're churning large customers.

**Fix:** Track both logo churn AND revenue churn. If revenue churn > logo churn, you're losing high-value customers.

---

### Pitfall 5: Treating All Churn Equally
**Symptom:** "We lost 50 customers this month" (no context on who)

**Consequence:** Losing 50 small customers ($10/month) is different from losing 50 enterprise customers ($10K/month).

**Fix:** Segment churn analysis by customer size, cohort, and reason. Weight by revenue impact, not just logo count.

---

### Pitfall 6: Forgetting Compounding Churn
**Symptom:** "3% monthly churn is fine, that's only 36% annually"

**Consequence:** Churn compounds. 3% monthly = 31% annual churn, not 36%. Math: `1 - (1 - 0.03)^12 = 31%`.

**Fix:** Use the correct formula when converting monthly to annual churn. Don't just multiply by 12.

---

### Pitfall 7: Celebrating Gross Revenue While Net Contracts
**Symptom:** "Gross revenue is up 20%!" (but discounts/refunds doubled)

**Consequence:** Net revenue might be flat or shrinking. Discounts hide pricing power problems; refunds hide product quality issues.

**Fix:** Always track gross AND net revenue. If discounts >20% or refunds >10%, investigate why.

---

### Pitfall 8: NRR >100% from Low Churn, Not Expansion
**Symptom:** "NRR is 105%, we're expanding!"

**Consequence:** NRR can be >100% just from very low churn, without meaningful expansion. True expansion-driven NRR is >120%.

**Fix:** Break down NRR into components: expansion MRR vs. churned/contracted MRR. Aim for expansion-driven NRR, not just low churn.

---

### Pitfall 9: Revenue Concentration Risk
**Symptom:** "We're at $10M ARR!" (but $5M is from one customer)

**Consequence:** Losing that one customer cuts revenue in half. Roadmap becomes hostage to one customer's requests.

**Fix:** Track revenue concentration. Ideal: Top customer <10% of revenue, Top 10 customers <40%. Diversify early.

---

### Pitfall 10: Averaging ARPU/ARPA Across Segments
**Symptom:** "Our ARPU is $100" (average of $10 SMB and $1,000 enterprise)

**Consequence:** Blended ARPU hides segment economics. Can't make smart acquisition or product decisions.

**Fix:** Calculate ARPU/ARPA by segment (SMB, mid-market, enterprise). Optimize each segment independently.

---

## References

### Related Skills
- `saas-economics-efficiency-metrics` — Unit economics (CAC, LTV, margins, burn rate)
- `finance-metrics-quickref` — Fast lookup for all metrics
- `feature-investment-advisor` — Uses revenue metrics to evaluate feature ROI
- `finance-based-pricing-advisor` — Uses ARPU/ARPA to evaluate pricing changes
- `business-health-diagnostic` — Uses revenue/retention metrics to diagnose business health

### External Frameworks
- **Bessemer Venture Partners:** "SaaS Metrics 2.0" — Definitive guide to SaaS metrics
- **David Skok (Matrix Partners):** "SaaS Metrics" blog series — Deep dive on unit economics
- **Tomasz Tunguz (Redpoint):** SaaS benchmarking research
- **Tien Tzuo:** *Subscribed* — Subscription business model fundamentals
- **ChartMogul, Baremetrics, ProfitWell:** SaaS analytics platforms with metric definitions

### Provenance
- Adapted from `research/finance/Finance for Product Managers.md`
- Consolidated from `research/finance/Finance_QuickRef.md`
- Common mistakes from `research/finance/Finance_Metrics_Additions_Reference.md`

## Template

# SaaS Revenue & Growth Metrics Calculator

Use this template to calculate your revenue and retention metrics. Fill in your numbers and calculate each metric.

---

### Revenue Metrics

#### Revenue
```
Period: [Month/Quarter/Year]
Total Customer Payments: $__________
Revenue = $__________
```

#### ARPU (Average Revenue Per User)
```
Total Revenue: $__________
Total Users: __________
ARPU = Total Revenue / Total Users = $__________
```

#### ARPA (Average Revenue Per Account)
```
MRR: $__________
Active Accounts: __________
ARPA = MRR / Active Accounts = $__________
```

#### ARPA/ARPU Analysis
```
ARPA: $__________
ARPU: $__________
Average Seats per Account = ARPA / ARPU = __________
```

#### ACV (Annual Contract Value)
```
Annual Recurring Revenue per Contract: $__________
(Exclude one-time fees like setup, professional services)
ACV = $__________
```

#### MRR/ARR
```
Starting MRR: $__________

MRR Components:
+ New MRR (new customers): $__________
+ Expansion MRR (upsells/cross-sells): $__________
- Churned MRR (lost customers): $__________
- Contraction MRR (downgrades): $__________

Ending MRR: $__________
ARR = MRR × 12 = $__________
```

#### Gross vs. Net Revenue
```
Gross Revenue: $__________
- Discounts: $__________
- Refunds: $__________
- Credits: $__________
Net Revenue = $__________

Discount Rate = Discounts / Gross Revenue = __________%
Refund Rate = Refunds / Gross Revenue = __________%
```

---

### Retention & Expansion Metrics

#### Churn Rate (Monthly)
```
Logo Churn:
Starting Customers: __________
Customers Lost: __________
Logo Churn Rate = Customers Lost / Starting Customers = __________%

Revenue Churn:
Starting MRR: $__________
MRR Lost: $__________
Revenue Churn Rate = MRR Lost / Starting MRR = __________%
```

**Convert to Annual Churn:**
```
Monthly Churn Rate: __________%
Annual Churn Rate = 1 - (1 - Monthly Churn)^12 = __________%
```

#### NRR (Net Revenue Retention)
```
Starting ARR: $__________
+ Expansion Revenue: $__________
- Churned Revenue: $__________
- Contraction Revenue: $__________
Ending ARR (from cohort): $__________

NRR = Ending ARR / Starting ARR × 100 = __________%
```

#### Expansion Revenue
```
Upsells (tier upgrades): $__________
Cross-sells (add-ons): $__________
Usage growth: $__________
Total Expansion Revenue: $__________

Expansion as % of MRR = Expansion / Total MRR = __________%
```

#### Quick Ratio
```
New MRR: $__________
Expansion MRR: $__________
Churned MRR: $__________
Contraction MRR: $__________

Quick Ratio = (New MRR + Expansion MRR) / (Churned MRR + Contraction MRR)
Quick Ratio = __________
```

---

### Analysis Frameworks

#### Revenue Mix Analysis
```
Product/Segment A Revenue: $__________
Product/Segment B Revenue: $__________
Product/Segment C Revenue: $__________
Total Revenue: $__________

Product A % = __________
Product B % = __________
Product C % = __________
```

#### Cohort Retention Analysis
```
Cohort: [Month/Quarter]
Starting Customers: __________

Month 0: 100%
Month 1: __________%
Month 2: __________%
Month 3: __________%
Month 6: __________%
Month 12: __________%
```

---

### Benchmarks & Quality Checks

#### Revenue Metrics
- [ ] Gross vs. net revenue clearly labeled
- [ ] Revenue growth rate > cost growth rate
- [ ] ARPU/ARPA tracked by cohort (not just blended)
- [ ] Revenue concentration: Top customer <10%, Top 10 <40%

#### Retention Metrics
- [ ] Monthly churn <5% (ideally <2%)
- [ ] Revenue churn vs. logo churn compared
- [ ] NRR >100% (ideally >120%)
- [ ] Quick Ratio >2 (ideally >4)

#### Cohort Analysis
- [ ] Recent cohorts perform same or better than older cohorts
- [ ] Revenue retention tracked, not just logo retention
- [ ] Expansion analyzed by cohort

---

### Red Flags

Check if any of these apply:

- [ ] Revenue churn > logo churn (losing big customers)
- [ ] ARPU growing but customer count shrinking (mix shift, not improvement)
- [ ] Newer cohorts churn faster than older cohorts (PMF degradation)
- [ ] NRR <100% (contracting, not expanding)
- [ ] Quick Ratio <2 (leaky bucket)
- [ ] Discounts >20% or refunds >10% (pricing/product problems)
- [ ] Revenue concentration >50% in top 10 customers (risk)
- [ ] Expansion revenue <10% of total MRR (monetization problem)

---

**If you checked any red flags, see Common Pitfalls section above for fixes.**

## Examples

### Example: Healthy SaaS Metrics

**Company:** ProjectHub (mid-market project management SaaS)
**Stage:** Growth stage, Series B funded
**Customer Base:** 200 accounts, 20,000 users
**Period:** Monthly snapshot

---

#### Revenue Metrics

**MRR/ARR**
```
Starting MRR: $2,000,000
+ New MRR: $100,000 (10 new accounts)
+ Expansion MRR: $80,000 (upsells + usage growth)
- Churned MRR: $30,000 (5 accounts churned)
- Contraction MRR: $10,000 (3 accounts downgraded)
Ending MRR: $2,140,000

MRR Growth Rate: 7% MoM
ARR: $25.7M
```

**ARPA/ARPU**
```
ARPA = $2,140,000 / 200 accounts = $10,700/month
ARPU = $2,140,000 / 20,000 users = $107/month
Average seats per account = 100 users
```

**Revenue Components**
```
New MRR: $100K (5% of total)
Expansion MRR: $80K (4% of total)
Churned MRR: $30K (1.5% of total)
Contraction MRR: $10K (0.5% of total)
```

---

#### Retention & Expansion Metrics

**Churn Rate**
```
Logo Churn: 5 / 200 = 2.5% monthly (~26% annual)
Revenue Churn: $30K / $2M = 1.5% monthly (~17% annual)
```

**Analysis:** Revenue churn < logo churn = losing smaller customers, which is healthy.

**NRR**
```
Starting ARR: $24M
Expansion: $960K (annual)
Churned: $360K (annual)
Contraction: $120K (annual)
Ending ARR: $24.48M

NRR = $24.48M / $24M = 102%
```

**Quick Ratio**
```
Gains = $100K + $80K = $180K
Losses = $30K + $10K = $40K
Quick Ratio = $180K / $40K = 4.5
```

---

#### Analysis

**Strengths**

**Strong growth:**
- 7% MoM MRR growth
- Healthy mix: 5% new + 4% expansion

**Excellent retention:**
- 2.5% logo churn (below 5% threshold)
- 1.5% revenue churn (better than logo)
- 102% NRR (growing without new logos)

**Efficient expansion:**
- $80K expansion MRR (4% of base)
- Expansion-driven NRR
- Average expansion per account: $400/month

**Sustainable growth:**
- Quick Ratio 4.5 (gains far exceed losses)
- Revenue churn declining (was 2% six months ago)
- Newer cohorts retain better than older cohorts

**Opportunities**

**Expansion room:**
- NRR at 102% is good, but room to grow to 110-120%
- Only 40% of customers have expanded (could push to 60%)
- Cross-sell opportunity: 30% of customers don't use integrations add-on

**ARPU optimization:**
- $107/user is solid for mid-market, but enterprise segment shows $200/user potential
- Could introduce premium tier for advanced features

**Reduce churn:**
- 2.5% logo churn is acceptable but not excellent
- Analysis shows 70% of churn happens in first 90 days (onboarding problem)
- Fix: Improve onboarding, aim for <2% logo churn

---

#### Actions Recommended

1. **Scale acquisition aggressively** — Unit economics are strong (see `saas-economics-efficiency-metrics` for CAC/LTV)
2. **Improve onboarding** — Reduce early churn from 5% to 3% in first 90 days
3. **Expand cross-sell** — Push integrations add-on to 30% of base without it (potential +$30K MRR)
4. **Test premium tier** — 20 enterprise customers show willingness to pay 2x for advanced features
5. **Monitor cohort retention** — Continue tracking that new cohorts retain better than old

---

#### Cohort Retention Trend (Positive Signal)

| Cohort | Month 6 Retention | Month 12 Retention |
|--------|-------------------|---------------------|
| 12 months ago | 85% | 78% |
| 6 months ago | 88% | TBD |
| Current | 92% (on track) | TBD |

**Analysis:** Newer cohorts retaining better = product improvements working. Safe to scale acquisition.

### Example: Warning Signs (Leaky Bucket)

**Company:** MarketingFlow (SMB marketing automation SaaS)
**Stage:** Early growth, post-Seed
**Customer Base:** 2,000 accounts, 10,000 users
**Period:** Monthly snapshot

---

#### Revenue Metrics

**MRR/ARR**
```
Starting MRR: $500,000
+ New MRR: $100,000 (200 new accounts)
+ Expansion MRR: $5,000 (minimal upsells)
- Churned MRR: $50,000 (120 accounts churned)
- Contraction MRR: $10,000 (40 accounts downgraded)
Ending MRR: $545,000

MRR Growth Rate: 9% MoM (but driven entirely by new customer acquisition)
ARR: $6.5M
```

**ARPA/ARPU**
```
ARPA = $545,000 / 2,000 accounts = $272/month
ARPU = $545,000 / 10,000 users = $54.50/month
Average seats per account = 5 users
```

**Revenue Components**
```
New MRR: $100K (20% of base — very high)
Expansion MRR: $5K (1% of base — very low)
Churned MRR: $50K (10% of base — crisis level)
Contraction MRR: $10K (2% of base — concerning)
```

---

#### Retention & Expansion Metrics

**Churn Rate**
```
Logo Churn: 120 / 2,000 = 6% monthly (~50% annual)
Revenue Churn: $50K / $500K = 10% monthly (~69% annual)
```

**Analysis:** Revenue churn > logo churn = losing bigger customers. Crisis signal.

**NRR**
```
Starting ARR: $6M
Expansion: $60K (annual)
Churned: $600K (annual)
Contraction: $120K (annual)
Ending ARR: $5.34M

NRR = $5.34M / $6M = 89%
```

**Analysis:** NRR <100% = contracting base. Losing revenue from existing customers faster than expanding them.

**Quick Ratio**
```
Gains = $100K + $5K = $105K
Losses = $50K + $10K = $60K
Quick Ratio = $105K / $60K = 1.75
```

**Analysis:** Quick Ratio <2 = leaky bucket. Barely outpacing losses.

---

#### Cohort Retention Trend (Negative Signal)

| Cohort | Month 3 Retention | Month 6 Retention | Month 12 Retention |
|--------|-------------------|-------------------|---------------------|
| 12 months ago | 82% | 75% | 68% |
| 6 months ago | 75% | 65% | TBD |
| Current | 68% (on track) | TBD | TBD |

**Analysis:** Newer cohorts churning FASTER than older cohorts. Product-market fit is degrading.

---

#### Analysis

**Critical Problems**

**Unsustainable churn:**
- 6% monthly logo churn = ~50% annual (crisis level)
- 10% monthly revenue churn = ~69% annual (existential threat)
- Revenue churn > logo churn = losing high-value customers
- Churn rate increasing (was 4% six months ago)

**Cohort degradation:**
- Newer customers churn faster than older customers
- Month 6 retention: 75% to 65% to on track for 58%
- This signals product-market fit is getting WORSE, not better

**No expansion engine:**
- Expansion revenue only 1% of MRR (should be 10-30%)
- NRR at 89% (contracting, not expanding)
- Only 5% of customers have ever expanded

**Leaky bucket:**
- Quick Ratio 1.75 (barely exceeding losses)
- Losing $60K/month, only gaining $105K/month
- Running on a treadmill: need 200 new customers/month just to stay flat

**Revenue dependency:**
- 90% of growth from new customer acquisition
- If acquisition slows, revenue will shrink immediately
- Retention is broken—scaling will just accelerate the problem

---

#### Actions Recommended (URGENT)

**STOP Scaling Acquisition**

Do NOT increase marketing spend until retention is fixed. Scaling a leaky bucket just burns cash faster.

**Why:** At current churn rates, every dollar spent acquiring customers leaks out within 12 months. Fix the bucket first.

---

**Priority 1: Fix Retention (Weeks 1-4)**

**Investigate churn:**
1. Run churn interviews with 20-30 churned customers
2. Segment churn by cohort, use case, customer size
3. Identify top 3 churn reasons

**Quick wins:**
1. Improve onboarding (70% of churn happens in first 60 days)
2. Proactive support for at-risk accounts (identify usage drop-offs)
3. Re-engage dormant accounts before they churn

**Goal:** Reduce logo churn from 6% to 4% within 8 weeks, target 3% within 16 weeks.

---

**Priority 2: Build Expansion Engine (Weeks 5-8)**

**Create upsell paths:**
1. Introduce premium tier (advanced features)
2. Usage-based add-ons (additional seats, integrations)
3. Cross-sell complementary features

**Identify expansion candidates:**
1. Which customers use product heavily? (Target for upsell)
2. Which customers hit usage limits? (Offer expansion)

**Goal:** Increase expansion MRR from 1% to 5% of base within 12 weeks.

---

**Priority 3: Improve Cohort Retention (Ongoing)**

**Track cohorts rigorously:**
1. Weekly cohort retention dashboards
2. Compare new cohorts to baseline (75% at Month 6)
3. Don't scale until new cohorts retain BETTER than old cohorts

**Product improvements:**
1. Fix onboarding (time-to-value)
2. Improve core use cases (reduce churn reasons)
3. Add sticky features (integrations, data accumulation)

**Goal:** Reverse cohort degradation trend within 16 weeks. New cohorts should retain at 75%+ by Month 6.

---

**Success Criteria (Fix Before Scaling)**

Do NOT scale acquisition until:
- [ ] Logo churn <4% monthly (ideally <3%)
- [ ] Revenue churn <5% monthly
- [ ] NRR >100% (expansion exceeds churn)
- [ ] Quick Ratio >2.5 (ideally >4)
- [ ] New cohorts retain same or better than old cohorts
- [ ] Expansion MRR >5% of total MRR

**Timeline:** 12-16 weeks to fix. Then reassess scaling.

---

#### Financial Impact of Fixing Retention

**Current state (bad):**
- Need 200 new customers/month just to offset churn
- Net growth: only 80 customers/month after churn
- 90% of acquisition spend wasted on replacing churned customers

**If churn fixed to 3% (good):**
- Need 60 new customers/month to offset churn
- Net growth: 140 customers/month (75% more efficient)
- Acquisition budget goes 3x further

**If NRR fixed to 110% (great):**
- Existing base grows 10%/year without new customers
- All new acquisition is net growth
- Can afford higher CAC because LTV increases 2-3x

**Bottom line:** Fixing retention is worth 6-12 months of paused growth. Don't skip this.
