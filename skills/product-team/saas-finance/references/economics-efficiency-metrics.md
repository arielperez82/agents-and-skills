<!-- Source: Product-Manager-Skills by Dean Peters (https://github.com/deanpeters/Product-Manager-Skills)
     License: CC BY-NC-SA 4.0 — Attribution required, NonCommercial, ShareAlike
     Adapted for agents-and-skills skill format. -->


## Purpose

Determine whether your SaaS business model is fundamentally viable and capital-efficient. Use this to calculate unit economics, assess profitability, manage cash runway, and decide when to scale vs. optimize. Essential for fundraising, board reporting, and making smart investment trade-offs.

This is not a finance reporting tool—it's a framework for PMs to understand whether the business can sustain growth, when to prioritize efficiency over growth, and which investments have positive returns.

## Key Concepts

### Unit Economics Family

Metrics that measure profitability at the customer level—the foundation of sustainable SaaS.

**Gross Margin** — Percentage of revenue remaining after direct costs (COGS).
- **Why PMs care:** A feature that generates $1M revenue at 80% margin is worth far more than $1M at 30% margin. Margin determines which features to prioritize.
- **Formula:** `(Revenue - COGS) / Revenue × 100`
- **COGS includes:** Hosting, infrastructure, payment processing, customer onboarding costs
- **Benchmark:** SaaS 70-85% good; <60% concerning

**CAC (Customer Acquisition Cost)** — Total cost to acquire one customer.
- **Why PMs care:** Shapes entire go-to-market strategy. Determines which channels are viable and how much you can invest in product-led growth.
- **Formula:** `Total Sales & Marketing Spend / New Customers Acquired`
- **Benchmark:** Varies by model—Enterprise $10K+ ok; SMB <$500 target
- **Include:** Marketing spend, sales salaries, tools, commissions

**LTV (Lifetime Value)** — Total revenue expected from one customer over their lifetime.
- **Why PMs care:** Tells you what you can afford to spend on acquisition. Higher LTV enables premium channels and longer payback periods.
- **Formula (simple):** `ARPU × Average Customer Lifetime (months)`
- **Formula (better):** `ARPU × Gross Margin % / Churn Rate`
- **Formula (advanced):** Account for expansion, discount rates, cohort-specific retention
- **Benchmark:** Must be 3x+ CAC; varies by segment

**LTV:CAC Ratio** — Efficiency of customer acquisition spending.
- **Why PMs care:** Is growth sustainable or are you buying revenue at a loss? Determines when to scale vs. optimize.
- **Formula:** `LTV / CAC`
- **Benchmark:** 3:1 healthy; <1:1 unsustainable; >5:1 might be underinvesting
- **Note:** This ratio alone doesn't tell the full story—also need payback period

**Payback Period** — Months to recover CAC from customer revenue.
- **Why PMs care:** Cash efficiency. Faster payback = reinvest sooner. Slow payback can kill growth even with good LTV:CAC.
- **Formula:** `CAC / (Monthly ARPU × Gross Margin %)`
- **Benchmark:** <12 months great; 12-18 ok; >24 months concerning
- **Critical:** Must have cash to sustain payback period

**Contribution Margin** — Revenue remaining after ALL variable costs (not just COGS).
- **Why PMs care:** True unit profitability. Includes support, processing fees, variable OpEx.
- **Formula:** `(Revenue - All Variable Costs) / Revenue × 100`
- **Variable costs:** COGS + support + payment processing + variable customer success
- **Benchmark:** 60-80% good for SaaS; <40% concerning

**Gross Margin Payback** — Payback period using actual profit, not revenue.
- **Why PMs care:** More accurate than simple payback. Shows true cash recovery time.
- **Formula:** `CAC / (Monthly ARPU × Gross Margin %)`
- **Benchmark:** Typically 1.5-2x longer than simple revenue payback

**CAC Payback by Channel** — Compare payback across acquisition channels.
- **Why PMs care:** Not all channels are created equal. Optimize channel mix based on payback efficiency.
- **Formula:** Calculate CAC and payback separately for each channel
- **Use:** Allocate budget to faster-payback channels when cash-constrained

---

### Capital Efficiency Family

Metrics that measure how efficiently you use cash to grow the business.

**Burn Rate** — Cash consumed per month.
- **Why PMs care:** Determines what you can build and when you need funding. High burn requires aggressive revenue growth.
- **Formula (Gross Burn):** `Monthly Cash Spent (all expenses)`
- **Formula (Net Burn):** `Monthly Cash Spent - Monthly Revenue`
- **Benchmark:** Net burn <$200K manageable for early stage; >$500K needs clear path to revenue

**Runway** — Months until cash runs out.
- **Why PMs care:** Literal survival metric. Dictates timeline for milestones, fundraising, profitability.
- **Formula:** `Cash Balance / Monthly Net Burn`
- **Benchmark:** 12+ months good; 6-12 manageable; <6 months crisis mode
- **Rule:** Raise when you have 6-9 months runway, not 3 months

**OpEx (Operating Expenses)** — Costs to run the business (excluding COGS).
- **Why PMs care:** Your team's salaries live here. Where "efficiency" cuts happen during downturns.
- **Categories:** Sales & Marketing (S&M), Research & Development (R&D), General & Administrative (G&A)
- **Benchmark:** Should grow slower than revenue as you scale (operating leverage)

**Net Income (Profit Margin)** — Actual profit or loss after all expenses.
- **Why PMs care:** True bottom line. Are you making money? Can you self-fund growth?
- **Formula:** `Revenue - All Expenses (COGS + OpEx)`
- **Benchmark:** Early SaaS often negative (growth mode); mature should be 10-20%+ margin

**Working Capital Impact** — Cash timing differences between revenue recognition and cash collection.
- **Why PMs care:** Annual contracts paid upfront boost cash. Monthly billing delays cash. Affects runway calculations.
- **Example:** $1M annual contract paid upfront = $1M cash now, not $83K/month
- **Use:** Understand cash vs. revenue timing when planning runway

---

### Efficiency Ratios Family

Composite metrics that measure growth vs. profitability trade-offs.

**Rule of 40** — Growth rate + profit margin should exceed 40%.
- **Why PMs care:** Framework for balancing growth vs. efficiency. Guides when to prioritize profitability over growth.
- **Formula:** `Revenue Growth Rate % + Profit Margin %`
- **Benchmark:** >40 healthy; 25-40 acceptable; <25 concerning
- **Example:** 60% growth + (-20%) margin = 40 (healthy growth-mode SaaS)
- **Example:** 20% growth + 25% margin = 45 (healthy mature SaaS)

**Magic Number** — Sales & marketing efficiency.
- **Why PMs care:** Is your GTM engine working? Should you scale spend or optimize first?
- **Formula:** `(Current Quarter Revenue - Previous Quarter Revenue) × 4 / Previous Quarter S&M Spend`
- **Benchmark:** >0.75 efficient; 0.5-0.75 ok; <0.5 fix before scaling
- **Note:** "× 4" annualizes quarterly revenue change

**Operating Leverage** — How revenue growth compares to cost growth.
- **Why PMs care:** Are you scaling efficiently? Revenue should grow faster than costs.
- **Measure:** Revenue growth rate vs. OpEx growth rate over time
- **Good:** Revenue growth 50%, OpEx growth 30% (positive leverage)
- **Bad:** Revenue growth 20%, OpEx growth 40% (negative leverage)

**Unit Economics** — General term for profitability of each "unit" (customer, seat, transaction).
- **Why PMs care:** Is the business model fundamentally viable at the unit level?
- **Calculate:** Revenue per unit - Cost per unit
- **Requirement:** Positive contribution required; aim for >$0 after all variable costs

---

### Anti-Patterns (What This Is NOT)

- **Not vanity metrics:** High LTV means nothing if payback takes 4 years and customers churn at 3 years.
- **Not static benchmarks:** "Good" CAC varies wildly by business model (PLG vs. enterprise sales).
- **Not isolated numbers:** LTV:CAC ratio without payback period can mislead (great ratio, terrible cash efficiency).
- **Not just finance's problem:** PMs must own unit economics—every feature decision impacts margins and CAC.

---

### When to Use These Metrics

**Use these when:**
- Evaluating whether to scale acquisition (LTV:CAC, payback, magic number)
- Deciding feature investments (margin impact, contribution to LTV)
- Planning runway and fundraising (burn rate, runway, Rule of 40)
- Comparing customer segments or channels (unit economics by segment)
- Board/investor reporting (Rule of 40, magic number, LTV:CAC)
- Choosing between growth and profitability (Rule of 40 trade-offs)

**Don't use these when:**
- Making decisions without revenue context (pair with `saas-revenue-growth-metrics`)
- Comparing across wildly different business models without normalization
- Early product discovery (pre-revenue focus on PMF, not unit economics)
- Short-term tactical decisions (use engagement metrics, not LTV)

---

## Application

### Step 1: Calculate Unit Economics

Use the templates in `template.md` to calculate your unit economics metrics.

#### Gross Margin
```
Gross Margin = (Revenue - COGS) / Revenue × 100

COGS includes:
- Hosting & infrastructure costs
- Payment processing fees
- Customer onboarding costs
- Direct delivery costs
```

**Example:**
- Revenue: $1,000,000
- COGS: $200,000 (hosting $120K, processing $50K, onboarding $30K)
- Gross Margin = ($1M - $200K) / $1M = 80%

**Quality checks:**
- Is gross margin improving as you scale? (Should benefit from economies of scale)
- Which products/features have highest margins? (Prioritize those)
- Are margins >70%? (SaaS should be high-margin)

---

#### CAC (Customer Acquisition Cost)
```
CAC = Total Sales & Marketing Spend / New Customers Acquired

Include in S&M spend:
- Marketing salaries & tools
- Sales salaries & commissions
- Advertising & paid channels
- SDR/BDR team costs
```

**Example:**
- Sales & Marketing Spend: $500,000/month
- New Customers: 100/month
- CAC = $500,000 / 100 = $5,000

**Quality checks:**
- Is CAC consistent across channels? (Calculate by channel)
- Is CAC increasing or decreasing over time? (Should decrease with scale)
- Does CAC vary by customer segment? (SMB vs. Enterprise)

---

#### LTV (Lifetime Value)
```
LTV (Simple) = ARPU × Average Customer Lifetime (months)

LTV (Better) = ARPU × Gross Margin % / Monthly Churn Rate

LTV (Advanced) = Account for expansion, cohort-specific retention, discount rate
```

**Example (Simple):**
- ARPU: $500/month
- Average Lifetime: 36 months
- LTV = $500 × 36 = $18,000

**Example (Better):**
- ARPU: $500/month
- Gross Margin: 80%
- Monthly Churn: 2%
- LTV = ($500 × 80%) / 2% = $400 / 0.02 = $20,000

**Quality checks:**
- Is LTV growing over time? (From expansion, improved retention)
- Does LTV vary by cohort? (Are new customers more/less valuable?)
- Does LTV vary by segment? (Enterprise vs. SMB)

---

#### LTV:CAC Ratio
```
LTV:CAC Ratio = LTV / CAC
```

**Example:**
- LTV: $20,000
- CAC: $5,000
- LTV:CAC = $20,000 / $5,000 = 4:1

**Quality checks:**
- Is ratio >3:1? (Minimum for sustainable growth)
- Is ratio >5:1? (Might be underinvesting in growth)
- Is ratio improving or degrading over time?

**Interpretation:**
- **<1:1** = Losing money on every customer (unsustainable)
- **1-3:1** = Marginal economics (optimize before scaling)
- **3-5:1** = Healthy (scale confidently)
- **>5:1** = Potentially underinvesting (could grow faster)

---

#### Payback Period
```
Payback Period (months) = CAC / (Monthly ARPU × Gross Margin %)
```

**Example:**
- CAC: $5,000
- Monthly ARPU: $500
- Gross Margin: 80%
- Payback = $5,000 / ($500 × 80%) = $5,000 / $400 = 12.5 months

**Quality checks:**
- Is payback <12 months? (Excellent)
- Is payback <18 months? (Acceptable)
- Do you have cash runway to sustain payback period?

**Critical insight:** 4:1 LTV:CAC with 36-month payback is a cash trap. 3:1 LTV:CAC with 8-month payback is better for growth.

---

#### Contribution Margin
```
Contribution Margin = (Revenue - All Variable Costs) / Revenue × 100

Variable Costs include:
- COGS
- Support costs (variable component)
- Payment processing
- Variable customer success costs
```

**Example:**
- Revenue: $1,000,000
- COGS: $200,000
- Variable Support: $50,000
- Payment Processing: $30,000
- Contribution Margin = ($1M - $280K) / $1M = 72%

**Quality checks:**
- Is contribution margin >60%? (Good for SaaS)
- Are certain products/segments lower margin? (Consider sunsetting)
- Does margin improve with scale?

---

### Step 2: Calculate Capital Efficiency

#### Burn Rate
```
Gross Burn Rate = Total Monthly Cash Spent
Net Burn Rate = Total Monthly Cash Spent - Monthly Revenue
```

**Example:**
- Monthly Expenses: $800,000
- Monthly Revenue: $400,000
- Gross Burn: $800,000/month
- Net Burn: $400,000/month

**Quality checks:**
- Is net burn decreasing over time? (Path to profitability)
- Is burn rate sustainable given runway?
- What's the burn rate relative to revenue? (Burn multiple)

---

#### Runway
```
Runway (months) = Cash Balance / Monthly Net Burn
```

**Example:**
- Cash Balance: $6,000,000
- Net Burn: $400,000/month
- Runway = $6M / $400K = 15 months

**Quality checks:**
- Do you have >12 months runway? (Healthy)
- Do you have <6 months runway? (Crisis—raise now or cut burn)
- Can you reach next milestone before runway ends?

**Rule:** Start fundraising at 6-9 months runway, not 3 months.

---

#### Operating Expenses (OpEx)
```
OpEx = Sales & Marketing + R&D + General & Administrative

Track as % of Revenue:
S&M as % of Revenue
R&D as % of Revenue
G&A as % of Revenue
```

**Example:**
- Revenue: $10M/year
- S&M: $5M (50% of revenue)
- R&D: $3M (30% of revenue)
- G&A: $1M (10% of revenue)
- Total OpEx: $9M (90% of revenue)

**Quality checks:**
- Are OpEx categories growing slower than revenue? (Operating leverage)
- Is S&M spend efficient? (Check magic number)
- Is G&A <15% of revenue? (Should stay low)

---

#### Net Income (Profit Margin)
```
Net Income = Revenue - COGS - OpEx
Profit Margin % = Net Income / Revenue × 100
```

**Example:**
- Revenue: $10M
- COGS: $2M
- OpEx: $9M
- Net Income = $10M - $2M - $9M = -$1M (loss)
- Profit Margin = -10%

**Quality checks:**
- Is profit margin improving over time? (Path to profitability)
- At current growth rate, when will you break even?
- Are you investing losses in growth? (Acceptable if LTV:CAC is healthy)

---

### Step 3: Calculate Efficiency Ratios

#### Rule of 40
```
Rule of 40 = Revenue Growth Rate % + Profit Margin %
```

**Example 1 (Growth Mode):**
- Revenue Growth: 80% YoY
- Profit Margin: -30%
- Rule of 40 = 80% + (-30%) = 50 (Healthy)

**Example 2 (Mature):**
- Revenue Growth: 25% YoY
- Profit Margin: 20%
- Rule of 40 = 25% + 20% = 45 (Healthy)

**Example 3 (Problem):**
- Revenue Growth: 30% YoY
- Profit Margin: -35%
- Rule of 40 = 30% + (-35%) = -5 (Unhealthy)

**Quality checks:**
- Is Rule of 40 >40? (Healthy balance)
- Is Rule of 40 >25? (Acceptable)
- Is Rule of 40 <25? (Burning cash without sufficient growth)

**Trade-offs:**
- Early stage: Maximize growth, accept losses (60% growth, -20% margin = 40)
- Growth stage: Balance (40% growth, 5% margin = 45)
- Mature: Prioritize profitability (20% growth, 25% margin = 45)

---

#### Magic Number
```
Magic Number = (Current Quarter Revenue - Previous Quarter Revenue) × 4 / Previous Quarter S&M Spend
```

**Example:**
- Q2 Revenue: $2.5M
- Q1 Revenue: $2.0M
- Q1 S&M Spend: $800K
- Magic Number = ($2.5M - $2.0M) × 4 / $800K = $2M / $800K = 2.5

**Quality checks:**
- Is magic number >0.75? (Efficient—scale S&M spend)
- Is magic number 0.5-0.75? (Acceptable—optimize before scaling)
- Is magic number <0.5? (Inefficient—fix GTM before spending more)

**Interpretation:**
- **>1.0** = For every $1 in S&M, you get $1+ in new ARR (excellent)
- **0.75-1.0** = Efficient, scale confidently
- **0.5-0.75** = Marginal, optimize before scaling
- **<0.5** = Inefficient, fix before investing more

---

#### Operating Leverage
Track over time to see if you're scaling efficiently.

**Example:**
| Quarter | Revenue | YoY Growth | OpEx | YoY Growth | Leverage |
|---------|---------|------------|------|------------|----------|
| Q1 2024 | $8M | - | $6M | - | - |
| Q2 2024 | $10M | 25% | $7M | 17% | Positive |
| Q3 2024 | $12M | 20% | $9M | 29% | Negative |

**Quality checks:**
- Is revenue growing faster than OpEx? (Positive leverage)
- Are you scaling OpEx too fast relative to revenue?
- Which OpEx category is growing fastest? (R&D, S&M, G&A)

---

### Step 4: Analyze by Segment and Channel

**Unit economics vary dramatically by segment:**

| Segment | CAC | LTV | LTV:CAC | Payback | Gross Margin |
|---------|-----|-----|---------|---------|--------------|
| SMB | $500 | $2,000 | 4:1 | 8 months | 75% |
| Mid-Market | $5,000 | $25,000 | 5:1 | 12 months | 80% |
| Enterprise | $50,000 | $300,000 | 6:1 | 24 months | 85% |

**Quality checks:**
- Which segment has best unit economics?
- Which segment has fastest payback? (Prioritize when cash-constrained)
- Which segment has highest LTV? (Invest in retention/expansion)

---

## Examples

See `examples/` folder for detailed scenarios. Mini examples below:

### Example 1: Healthy Unit Economics

**Company:** CloudAnalytics (mid-market analytics SaaS)

**Unit Economics:**
- CAC: $8,000
- LTV: $40,000
- LTV:CAC: 5:1
- Payback Period: 10 months
- Gross Margin: 82%

**Capital Efficiency:**
- Monthly Net Burn: $300K
- Runway: 18 months
- Rule of 40: 55 (40% growth + 15% margin)
- Magic Number: 0.9

**Analysis:**
- Strong unit economics (5:1 LTV:CAC, 10-month payback)
- Efficient GTM (0.9 magic number)
- Healthy balance (Rule of 40 = 55)
- Sufficient runway (18 months)

**Action:** Scale acquisition aggressively. Economics support growth.

---

### Example 2: Good LTV:CAC, Bad Payback (Cash Trap)

**Company:** EnterpriseCRM (enterprise sales motion)

**Unit Economics:**
- CAC: $80,000
- LTV: $400,000
- LTV:CAC: 5:1 (looks great!)
- Payback Period: 36 months (terrible!)
- Gross Margin: 85%

**Capital Efficiency:**
- Monthly Net Burn: $2M
- Runway: 9 months
- Average Customer Lifetime: 48 months
- Average Contract: $100K/year

**Analysis:**
- Great LTV:CAC ratio (5:1) masks cash problem
- 36-month payback with 9-month runway = cash trap
- Takes 3 years to recover CAC, but only 9 months of cash
- Customers stay 4 years, so economics work IF you have cash

**Problem:** You'll run out of cash before recovering acquisition costs.

**Actions:**
1. Negotiate upfront annual payments (reduce payback to 12 months)
2. Raise capital to extend runway (need 36+ months to sustain growth)
3. Reduce CAC (shorten sales cycle, improve conversion)
4. Target smaller deals with faster payback (mid-market vs. enterprise)

---

### Example 3: Scaling Too Fast (Negative Operating Leverage)

**Company:** SocialScheduler (SMB social media tool)

**Quarter-over-Quarter Trend:**
| Quarter | Revenue | OpEx | Net Income | Revenue Growth | OpEx Growth |
|---------|---------|------|------------|----------------|-------------|
| Q1 | $1.0M | $800K | -$800K | - | - |
| Q2 | $1.3M | $1.2M | -$1.2M | 30% | 50% |
| Q3 | $1.6M | $1.8M | -$1.8M | 23% | 50% |

**Analysis:**
- OpEx growing FASTER than revenue (50% vs. 23-30%)
- Losses accelerating ($800K to $1.8M in 2 quarters)
- Negative operating leverage (should be positive)
- Scaling S&M and R&D without corresponding revenue growth

**Problem:** Burning cash faster while revenue growth is slowing.

**Actions:**
1. Freeze headcount until revenue catches up
2. Cut inefficient S&M spend (magic number likely <0.5)
3. Focus on improving unit economics before scaling
4. Aim for OpEx growth <revenue growth

---

## Common Pitfalls

### Pitfall 1: Celebrating High LTV Without Checking Payback
**Symptom:** "Our LTV:CAC is 6:1, amazing!"

**Consequence:** 6:1 ratio with 48-month payback is a cash trap. You'll run out of money before recovering CAC.

**Fix:** Always pair LTV:CAC with payback period. 3:1 with 10-month payback beats 6:1 with 36-month payback.

---

### Pitfall 2: Ignoring Gross Margin When Calculating LTV
**Symptom:** "LTV = $100/month × 36 months = $3,600"

**Consequence:** You're using revenue, not profit. Actual LTV after 30% COGS = $2,520, not $3,600.

**Fix:** Always include gross margin in LTV calculations. `LTV = ARPU × Margin % / Churn Rate`.

---

### Pitfall 3: Scaling S&M with Low Magic Number
**Symptom:** "We need to grow faster—let's double S&M spend!" (Magic Number = 0.3)

**Consequence:** You're pouring gas on a broken engine. Doubling spend will just accelerate cash burn without proportional revenue growth.

**Fix:** Only scale S&M when magic number >0.75. If <0.5, fix GTM efficiency first.

---

### Pitfall 4: Using Simplistic LTV Formulas
**Symptom:** "LTV = ARPU × Lifetime" (ignoring expansion, discount rates, cohort variance)

**Consequence:** Overstating LTV for decision-making. Reality: expansion boosts LTV; discounting reduces it; cohorts vary.

**Fix:** Use sophisticated LTV models for big decisions. Simple LTV ok for directional guidance only.

---

### Pitfall 5: Forgetting Time Value of Money
**Symptom:** "$10K revenue today = $10K revenue in 5 years"

**Consequence:** Overstating LTV for long-payback businesses. $10K in 5 years is worth ~$7.8K today (at 5% discount rate).

**Fix:** Discount future cash flows for LTV periods >24 months. Use NPV (net present value).

---

### Pitfall 6: Comparing CAC Across Different Payback Periods
**Symptom:** "Channel A has $5K CAC, Channel B has $8K CAC—Channel A is better!"

**Consequence:** If Channel A has 24-month payback and Channel B has 8-month payback, Channel B is actually better (faster cash recovery).

**Fix:** Compare CAC + payback together, not CAC in isolation.

---

### Pitfall 7: Celebrating Rule of 40 >40 with Negative Cash Flow
**Symptom:** "Rule of 40 = 50, we're crushing it!" (60% growth, -10% margin, burning $5M/month)

**Consequence:** Rule of 40 doesn't account for absolute burn. You might have great balance but only 3 months runway.

**Fix:** Pair Rule of 40 with burn rate and runway. Balance matters, but survival matters more.

---

### Pitfall 8: Ignoring Segment-Specific Unit Economics
**Symptom:** "Blended CAC is $2K, blended LTV is $10K, we're good!"

**Consequence:** SMB segment might have $500 CAC / $2K LTV (great), while Enterprise has $20K CAC / $15K LTV (terrible). Blended metrics hide the problem.

**Fix:** Calculate unit economics by segment. Optimize each independently.

---

### Pitfall 9: Confusing Gross Margin with Contribution Margin
**Symptom:** "Gross margin is 80%, our margins are great!"

**Consequence:** After variable support costs (10%) and payment processing (3%), contribution margin might be 67%—not 80%.

**Fix:** Track both gross margin (COGS only) AND contribution margin (all variable costs). Use contribution margin for unit economics.

---

### Pitfall 10: Forgetting Working Capital Timing
**Symptom:** "We have 12 months runway based on burn rate" (but all contracts are paid monthly)

**Consequence:** Annual contracts paid upfront boost cash temporarily. Monthly contracts delay cash collection. Runway is longer/shorter than burn rate suggests.

**Fix:** Account for working capital when calculating runway. Cash-based runway ≠ revenue-based runway.

---

## References

### Related Skills
- `saas-revenue-growth-metrics` — Revenue, retention, and growth metrics that feed into LTV
- `finance-metrics-quickref` — Fast lookup for all metrics
- `feature-investment-advisor` — Uses margin and contribution calculations for feature ROI
- `acquisition-channel-advisor` — Uses CAC, LTV, payback for channel evaluation
- `business-health-diagnostic` — Uses efficiency metrics for health checks

### External Frameworks
- **David Skok (Matrix Partners):** "SaaS Metrics" blog — Definitive guide to CAC, LTV, payback
- **Bessemer Venture Partners:** "SaaS Metrics 2.0" — Rule of 40, magic number benchmarks
- **Ben Murray:** *The SaaS CFO* — Advanced unit economics modeling
- **Jason Lemkin (SaaStr):** SaaS benchmarking research
- **Brad Feld:** *Venture Deals* — Understanding investor perspective on unit economics

### Provenance
- Adapted from `research/finance/Finance for Product Managers.md`
- Consolidated from `research/finance/Finance_QuickRef.md`
- Common mistakes from `research/finance/Finance_Metrics_Additions_Reference.md`

## Template

# SaaS Economics & Efficiency Metrics Calculator

Use this template to calculate your unit economics and capital efficiency metrics. Fill in your numbers and calculate each metric.

---

### Unit Economics

#### Gross Margin
```
Revenue: $__________
COGS (Cost of Goods Sold):
  - Hosting & infrastructure: $__________
  - Payment processing fees: $__________
  - Customer onboarding costs: $__________
  - Other direct costs: $__________
Total COGS: $__________

Gross Profit = Revenue - COGS = $__________
Gross Margin % = (Gross Profit / Revenue) × 100 = __________%
```

#### CAC (Customer Acquisition Cost)
```
Sales & Marketing Spend:
  - Marketing salaries: $__________
  - Sales salaries & commissions: $__________
  - Advertising & paid channels: $__________
  - Marketing tools: $__________
  - SDR/BDR costs: $__________
Total S&M Spend: $__________

New Customers Acquired: __________

CAC = Total S&M Spend / New Customers = $__________
```

#### LTV (Lifetime Value)
```
Method 1 (Simple):
ARPU (monthly): $__________
Average Customer Lifetime (months): __________
LTV = ARPU × Lifetime = $__________

Method 2 (Better):
ARPU (monthly): $__________
Gross Margin %: __________%
Monthly Churn Rate: __________%
LTV = (ARPU × Gross Margin %) / Monthly Churn Rate = $__________

Method 3 (Advanced):
Account for expansion, cohort-specific retention, discount rate
[Use financial model]
```

#### LTV:CAC Ratio
```
LTV: $__________
CAC: $__________
LTV:CAC Ratio = LTV / CAC = __________:1
```

**Benchmark:**
- [ ] >3:1 (Healthy—scale confidently)
- [ ] 1-3:1 (Marginal—optimize before scaling)
- [ ] <1:1 (Unsustainable—fix immediately)

#### Payback Period
```
CAC: $__________
Monthly ARPU: $__________
Gross Margin %: __________%

Payback Period (months) = CAC / (Monthly ARPU × Gross Margin %)
Payback Period = __________ months
```

**Benchmark:**
- [ ] <12 months (Excellent)
- [ ] 12-18 months (Acceptable)
- [ ] >24 months (Concerning—cash trap risk)

#### Contribution Margin
```
Revenue: $__________
Variable Costs:
  - COGS: $__________
  - Variable support costs: $__________
  - Payment processing: $__________
  - Variable customer success: $__________
Total Variable Costs: $__________

Contribution Profit = Revenue - Variable Costs = $__________
Contribution Margin % = (Contribution Profit / Revenue) × 100 = __________%
```

---

### Capital Efficiency

#### Burn Rate
```
Monthly Expenses:
  - S&M: $__________
  - R&D: $__________
  - G&A: $__________
  - COGS: $__________
Total Monthly Expenses (Gross Burn): $__________

Monthly Revenue: $__________

Net Burn Rate = Total Expenses - Revenue = $__________/month
```

#### Runway
```
Cash Balance: $__________
Monthly Net Burn: $__________

Runway (months) = Cash Balance / Net Burn = __________ months
```

**Warning Levels:**
- [ ] >12 months (Healthy)
- [ ] 6-12 months (Start fundraising process)
- [ ] <6 months (Crisis—raise now or cut burn)

#### Operating Expenses (OpEx)
```
Annual Revenue: $__________

OpEx Breakdown:
  Sales & Marketing: $__________
  Research & Development: $__________
  General & Administrative: $__________
Total OpEx: $__________

S&M as % of Revenue: __________%
R&D as % of Revenue: __________%
G&A as % of Revenue: __________%
Total OpEx as % of Revenue: __________%
```

#### Net Income (Profit/Loss)
```
Revenue: $__________
- COGS: $__________
- OpEx: $__________

Net Income = Revenue - COGS - OpEx = $__________
Profit Margin % = (Net Income / Revenue) × 100 = __________%
```

---

### Efficiency Ratios

#### Rule of 40
```
Revenue Growth Rate (YoY): __________%
Profit Margin %: __________%

Rule of 40 = Growth Rate + Profit Margin = __________
```

**Benchmark:**
- [ ] >40 (Healthy balance of growth and efficiency)
- [ ] 25-40 (Acceptable)
- [ ] <25 (Concerning—burning cash without sufficient growth)

#### Magic Number
```
Current Quarter Revenue: $__________
Previous Quarter Revenue: $__________
Revenue Increase = $__________

Previous Quarter S&M Spend: $__________

Magic Number = (Revenue Increase × 4) / Prev Quarter S&M Spend
Magic Number = __________
```

**Benchmark:**
- [ ] >0.75 (Efficient—scale S&M confidently)
- [ ] 0.5-0.75 (Acceptable—optimize before scaling)
- [ ] <0.5 (Inefficient—fix GTM before spending more)

#### Operating Leverage
```
Track over multiple quarters:

Quarter | Revenue | Revenue Growth | OpEx | OpEx Growth | Leverage
--------|---------|----------------|------|-------------|----------
Q1      | $______ | ____%          | $____| ____%       | _______
Q2      | $______ | ____%          | $____| ____%       | _______
Q3      | $______ | ____%          | $____| ____%       | _______
```

**Check:**
- [ ] Revenue growing faster than OpEx? (Positive leverage)
- [ ] OpEx growing faster than Revenue? (Negative leverage)

---

### Segment Analysis

Calculate unit economics by customer segment:

| Metric | SMB | Mid-Market | Enterprise | Blended |
|--------|-----|------------|------------|---------|
| CAC | $____ | $______ | $______ | $______ |
| LTV | $____ | $______ | $______ | $______ |
| LTV:CAC | ___:1 | ___:1 | ___:1 | ___:1 |
| Payback (mo) | ____ | ____ | ____ | ____ |
| Gross Margin % | ___% | ___% | ___% | ___% |

**Analysis:**
- Which segment has best LTV:CAC ratio?
- Which segment has fastest payback?
- Which segment has highest gross margin?
- Should you focus acquisition on specific segment?

---

### Benchmarks & Quality Checks

#### Unit Economics
- [ ] Gross margin >70% (SaaS should be high-margin)
- [ ] LTV:CAC >3:1 (minimum for sustainable growth)
- [ ] Payback period <12 months (cash efficient)
- [ ] Contribution margin >60% (after all variable costs)
- [ ] LTV calculated with gross margin (not just revenue)

#### Capital Efficiency
- [ ] Runway >12 months (healthy buffer)
- [ ] Net burn decreasing over time (path to profitability)
- [ ] OpEx growing slower than revenue (positive operating leverage)
- [ ] G&A <15% of revenue (keep overhead low)

#### Efficiency Ratios
- [ ] Rule of 40 >40 (healthy balance)
- [ ] Magic number >0.75 (efficient GTM)
- [ ] Revenue growth rate > OpEx growth rate (operating leverage)

---

### Red Flags

Check if any of these apply:

- [ ] LTV:CAC <1.5:1 (buying revenue at a loss)
- [ ] Payback period >24 months (cash trap)
- [ ] Runway <6 months (survival crisis)
- [ ] Rule of 40 <25 (burning cash without growth)
- [ ] Magic number <0.5 (GTM engine broken)
- [ ] OpEx growing faster than revenue (negative leverage)
- [ ] Gross margin <60% (margin problem)
- [ ] CAC increasing while LTV flat/decreasing (unit economics degrading)
- [ ] Great LTV:CAC but terrible payback (illusion of health)

---

**If you checked any red flags, see Common Pitfalls section above for fixes.**

## Examples

### Example: Healthy Unit Economics & Efficient Scaling

**Company:** CloudAnalytics (mid-market business intelligence SaaS)
**Stage:** Series B growth stage
**Customer Base:** 500 accounts, 12,000 users
**Period:** Q2 2024

---

#### Unit Economics

**Gross Margin**
```
Quarterly Revenue: $6,000,000
COGS:
  - AWS hosting & infrastructure: $600,000
  - Payment processing (2.5%): $150,000
  - Customer onboarding: $150,000
Total COGS: $900,000

Gross Profit: $5,100,000
Gross Margin: 85%
```

**CAC by Segment**
```
SMB:
  - S&M Spend: $200K/quarter
  - New Customers: 50
  - CAC: $4,000

Mid-Market:
  - S&M Spend: $400K/quarter
  - New Customers: 40
  - CAC: $10,000

Enterprise:
  - S&M Spend: $300K/quarter
  - New Customers: 10
  - CAC: $30,000

Blended CAC: $9,000
```

**LTV by Segment**
```
SMB:
  - ARPU: $250/month
  - Monthly Churn: 3%
  - Gross Margin: 82%
  - LTV: ($250 x 82%) / 3% = $6,833

Mid-Market:
  - ARPU: $1,200/month
  - Monthly Churn: 2%
  - Gross Margin: 85%
  - LTV: ($1,200 x 85%) / 2% = $51,000

Enterprise:
  - ARPU: $5,000/month
  - Monthly Churn: 1%
  - Gross Margin: 88%
  - LTV: ($5,000 x 88%) / 1% = $440,000

Blended LTV: $45,000
```

**LTV:CAC Ratios**
```
SMB: $6,833 / $4,000 = 1.7:1 (marginal)
Mid-Market: $51,000 / $10,000 = 5.1:1 (excellent)
Enterprise: $440,000 / $30,000 = 14.7:1 (outstanding)

Blended: $45,000 / $9,000 = 5:1
```

**Payback Periods**
```
SMB: $4,000 / ($250 x 82%) = 19.5 months
Mid-Market: $10,000 / ($1,200 x 85%) = 9.8 months
Enterprise: $30,000 / ($5,000 x 88%) = 6.8 months

Blended: 11 months
```

---

#### Capital Efficiency

**Burn Rate & Runway**
```
Monthly Expenses:
  - S&M: $300,000
  - R&D: $400,000
  - G&A: $150,000
  - COGS: $300,000
Gross Burn: $1,150,000/month

Monthly Revenue: $2,000,000
Net Burn: -$850,000/month (profitable!)

Cash Balance: $25,000,000
Runway: Infinite (profitable)
```

**Operating Expenses**
```
Annual Revenue: $24M

OpEx:
  - S&M: $3.6M (15% of revenue)
  - R&D: $4.8M (20% of revenue)
  - G&A: $1.8M (7.5% of revenue)
Total OpEx: $10.2M (42.5% of revenue)

Net Income: $24M - $3.6M - $10.2M = $10.2M
Profit Margin: 42.5%
```

---

#### Efficiency Ratios

**Rule of 40**
```
Revenue Growth Rate: 45% YoY
Profit Margin: 42.5%
Rule of 40 = 45% + 42.5% = 87.5 (outstanding!)
```

**Magic Number**
```
Q2 Revenue: $6M
Q1 Revenue: $5.2M
Increase: $800K

Q1 S&M Spend: $850K
Magic Number: ($800K x 4) / $850K = $3.2M / $850K = 3.76 (excellent!)
```

**Operating Leverage (Last 4 Quarters)**
| Quarter | Revenue | Rev Growth | OpEx | OpEx Growth | Leverage |
|---------|---------|------------|------|-------------|----------|
| Q3 2023 | $4.5M | - | $2.2M | - | - |
| Q4 2023 | $5.0M | 11% | $2.4M | 9% | Positive |
| Q1 2024 | $5.2M | 4% | $2.5M | 4% | Neutral |
| Q2 2024 | $6.0M | 15% | $2.55M | 2% | Positive |

**Analysis:** Revenue growing faster than OpEx = positive operating leverage.

---

#### Analysis

**Exceptional Strengths**

**Outstanding unit economics:**
- 5:1 blended LTV:CAC (healthy range: 3-5:1)
- 11-month blended payback (target: <12 months)
- 85% gross margin (well above 70% SaaS benchmark)
- Mid-market and enterprise segments have stellar economics

**Profitable growth:**
- 42.5% profit margin (exceptional for growth-stage SaaS)
- Rule of 40 = 87.5 (nearly double the 40 threshold)
- Infinite runway (profitable, no burn)

**Efficient go-to-market:**
- Magic number = 3.76 (well above 0.75 threshold)
- For every $1 in S&M spend, generating $3.76 in new ARR
- Positive operating leverage (revenue growing faster than costs)

**Segment optimization:**
- Enterprise: 14.7:1 LTV:CAC, 7-month payback (amazing)
- Mid-market: 5.1:1 LTV:CAC, 10-month payback (excellent)
- SMB: 1.7:1 LTV:CAC, 19.5-month payback (marginal)

---

**Opportunities for Optimization**

**SMB segment underperformance:**
- 1.7:1 LTV:CAC is below 3:1 threshold
- 19.5-month payback is concerning
- Contributing to blended metrics, but dragging them down

**Potential actions:**
1. **Reduce SMB CAC** (improve conversion, shorten sales cycle)
2. **Increase SMB LTV** (reduce churn, add expansion paths)
3. **Deprioritize SMB** (shift budget to mid-market/enterprise)

**Channel allocation:**
- Enterprise has 14.7:1 LTV:CAC but only 10 new customers/quarter
- Could scale enterprise acquisition more aggressively

---

#### Recommended Actions

**1. Scale Enterprise Acquisition (High Priority)**
**Why:** 14.7:1 LTV:CAC and 7-month payback = massive opportunity.

**Actions:**
- Increase enterprise S&M budget from $300K to $500K/quarter
- Hire 2 enterprise AEs
- Target 20 enterprise logos/quarter (up from 10)

**Expected impact:**
- Additional $200K/quarter S&M spend
- 10 additional enterprise customers
- 10 x $30K CAC = $300K investment
- 10 x $440K LTV = $4.4M in LTV created
- Net value creation: $4.1M

---

**2. Optimize or Exit SMB Segment (Medium Priority)**
**Why:** 1.7:1 LTV:CAC is marginal; 19.5-month payback strains cash (even though profitable overall).

**Option A: Optimize SMB**
- Reduce CAC through self-serve onboarding (target $2K CAC)
- Improve retention to 2% monthly churn (boost LTV to $10,250)
- New LTV:CAC: 5.1:1 (healthy)

**Option B: Exit SMB**
- Stop SMB acquisition, reallocate $200K/quarter to mid-market/enterprise
- Focus on higher-quality segments with better economics

**Recommendation:** Try Option A for 2 quarters. If LTV:CAC doesn't improve to >3:1, exit SMB.

---

**3. Maintain Profitability While Scaling (Ongoing)**
**Why:** 42.5% profit margin + 45% growth is exceptional. Don't sacrifice this.

**Actions:**
- Continue positive operating leverage (revenue growth > cost growth)
- Maintain Rule of 40 >40 (ideally >60)
- Reinvest profits strategically in highest-ROI channels

### Example: Cash Trap (Good LTV:CAC, Terrible Payback)

**Company:** EnterpriseCRM (enterprise sales-led CRM)
**Stage:** Series A, post-product-market fit
**Customer Base:** 50 enterprise accounts
**Period:** Q2 2024

---

#### The Illusion: Great LTV:CAC Ratio

**Unit Economics (Look Great!)**
```
CAC: $80,000
LTV: $400,000
LTV:CAC: 5:1 (looks healthy!)
Gross Margin: 85%
```

**First impression:** "5:1 LTV:CAC is amazing! Let's scale!"

---

#### The Reality: Terrible Payback Period

**Deep Dive on Payback**
```
CAC: $80,000
Monthly ARPU: $8,333 (from $100K annual contracts)
Gross Margin: 85%

Payback Period = $80,000 / ($8,333 x 85%)
Payback Period = $80,000 / $7,083
Payback Period = 11.3 months

Wait... that doesn't look terrible?
```

**But Wait -- Payment Terms Reality**
```
Average Contract: $100,000/year
Payment Terms: Quarterly invoicing (not annual upfront)
Actual Monthly Cash Collection: $8,333/month

CAC Spend Timing: Upfront (sales cycle complete)
Revenue Collection: Monthly over 12+ months

Cash Payback = Time until cash in > cash out
Actual Cash Payback: 11.3 months
```

**The Real Problem: Sales Cycle + Deal Size**
```
Average Sales Cycle: 6 months
CAC Timing: Spent over 6-month sales cycle ($80K total)
First Payment: Month 7 (after deal closes)
Monthly Cash: $8,333

True Payback Timeline:
- Month 0-6: Spend $80K acquiring customer (no revenue)
- Month 7: First $8,333 payment
- Month 18: Finally break even on cash ($8,333 x 11.3 = ~$94K collected)

Effective Payback: 18 months from start of sales cycle
```

---

#### Capital Efficiency Reality Check

**Burn Rate & Runway**
```
Monthly Expenses:
  - S&M: $500,000 (mostly sales team for 6-month cycles)
  - R&D: $300,000
  - G&A: $100,000
  - COGS: $50,000
Total Monthly Burn: $950,000

Monthly Revenue: $416,665 ($5M ARR / 12)
Net Burn: $533,335/month

Cash Balance: $6,000,000
Runway: $6M / $533K = 11.3 months
```

---

#### The Cash Trap Equation

**What Happens When You Try to Scale**

**Current state:**
- 50 customers
- $5M ARR
- 11.3 months runway

**CEO decision:** "5:1 LTV:CAC is great! Let's double sales headcount and scale!"

**What happens:**
```
Scenario: Double sales team (10 to 20 AEs)

New Monthly Burn:
  - S&M: $1,000,000 (doubled)
  - R&D: $300,000 (same)
  - G&A: $120,000 (+20% for ops support)
  - COGS: $50,000 (same for now)
Total: $1,470,000/month

Revenue (first 6 months): Still $416K/month (deals haven't closed yet)
Net Burn: $1,054,000/month

NEW Runway: $6M / $1.05M = 5.7 months
```

**Result:** You'll run out of money in 6 months, right when the new deals START to close. You've accelerated your own death.

---

#### How to Escape the Cash Trap

**Option 1: Shorten Payback Period (Best)**

**A. Negotiate Annual Upfront Payments**
```
Before: Quarterly billing = 11.3-month payback
After: Annual upfront = 0.96-month payback

Impact on Payback:
$80K CAC / ($100K x 85%) = 0.96 months (instant payback!)

Impact on Runway:
Collect $100K upfront vs. $25K quarterly
4x cash acceleration
Runway extends from 11 months to 30+ months
```

**B. Reduce CAC**
```
Strategies:
- Shorten sales cycle from 6 months to 4 months (reduce CAC by 20%)
- Improve win rate from 20% to 30% (reduce wasted sales effort)
- Target warmer inbound leads (reduce prospecting costs)

Target: Reduce CAC from $80K to $50K
New Payback: $50K / ($8,333 x 85%) = 7 months
```

**C. Increase ARPU**
```
Current: $8,333/month ($100K annual)
Target: $12,500/month ($150K annual) via:
- Premium tier pricing
- Add-on modules
- Seat expansion

New Payback: $80K / ($12,500 x 85%) = 7.5 months
```

---

**Option 2: Raise Capital to Extend Runway**

**Reality check:**
- You need 18+ months of runway to sustain sales cycle + payback
- Current runway: 11 months (insufficient)
- Need to raise: $12M+ to extend runway to 24 months

---

**Option 3: Slow Down Growth (Survive)**

**Accept slower growth to preserve cash:**
```
Reduce sales team from 10 to 6 AEs
S&M Spend: $300K/month (down from $500K)

New Monthly Burn:
- S&M: $300K
- R&D: $300K
- G&A: $100K
- COGS: $50K
Total: $750K/month

Net Burn: $750K - $416K = $334K/month
New Runway: $6M / $334K = 18 months
```

---

#### Key Takeaway

**LTV:CAC ratio is necessary but not sufficient.**

This business has:
- Great LTV:CAC (5:1)
- Strong gross margin (85%)
- Good retention (4+ year lifetime)

But it also has:
- 18-month effective payback (6-month sales cycle + 11-month cash recovery)
- Quarterly billing (delays cash)
- 11-month runway (insufficient for sales cycle + payback)

**The fix is simple:** Negotiate annual upfront payments. This turns an 11-month payback into a <1-month payback, unlocking sustainable scaling.

**Lesson:** Always pair LTV:CAC with payback period AND cash collection timing. Otherwise, you'll scale yourself into bankruptcy while the metrics look great on paper.
