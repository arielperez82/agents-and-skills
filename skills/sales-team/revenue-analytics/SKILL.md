---
name: revenue-analytics
description: SaaS revenue metrics, GTM efficiency analytics, funnel analysis, and
  cohort-based revenue intelligence for B2B sales operations
license: MIT
metadata:
  author: Claude Skills Team
  compatibility:
    platforms:
    - macos
    - linux
    - windows
  contributors: []
  created: 2026-03-05
  dependencies:
    scripts: []
    references:
    - references/revenue-dashboard-template.md
  difficulty: advanced
  domain: sales
  examples:
  - title: Quarterly Revenue Health Review
    input: 'Analyze Q4 revenue: $2.4M ARR, 112% NDR, $18K CAC, 14-month payback,
      3.2x LTV:CAC. 340 MQLs with 8% full-funnel conversion.'
    output: 'Revenue Health: Strong. NDR above 110% benchmark indicates healthy expansion.
      CAC payback at 14 months exceeds 12-month target -- investigate channel mix.
      LTV:CAC at 3.2x is in ideal range (3-5x). Funnel: MQL-to-Close at 8% is above
      B2B SaaS average (5-7%). Recommendation: Shift 15% of paid spend to referral
      channel (2.1x higher conversion) to reduce blended CAC.'
  - title: Cohort Expansion Analysis
    input: 'Compare Jan-Jun cohorts: Jan cohort at 118% NDR (month 12), Mar cohort
      at 95% NDR (month 10). Both started at similar ACV ($24K avg).'
    output: 'Divergence alert: Jan cohort expanding at 118% NDR while Mar cohort contracting
      at 95%. Root cause analysis: Jan cohort onboarded with new CSM playbook (avg
      time-to-value 18 days vs. Mar cohort 34 days). Mar cohort has 3x higher support
      ticket volume. Recommendation: Apply Jan onboarding playbook retroactively to
      Mar cohort accounts showing contraction. Projected NDR lift: 8-12pp.'
  featured: false
  frequency: Weekly (operational), monthly (executive), quarterly (board/strategic)
  orchestrated-by: []
  related-agents:
  - revenue-ops-analyst
  - account-executive
  related-commands: []
  related-skills:
  - sales-team/pipeline-analytics
  - sales-team/pipeline-forecasting
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: revenue-operations
  tags:
  - revenue
  - analytics
  - saas-metrics
  - arr
  - ndr
  - ltv-cac
  - funnel
  - cohort-analysis
  - gtm-efficiency
  - revenue-operations
  time-saved: Reduces monthly revenue analysis from 4 hours to 45 minutes
  title: Revenue Analytics & GTM Efficiency
  updated: 2026-03-05
  use-cases:
  - Calculating and tracking core SaaS revenue metrics (ARR, NDR, LTV, CAC)
  - Measuring GTM efficiency across acquisition channels
  - Analyzing full-funnel conversion rates and stage velocity
  - Running cohort-based revenue retention and expansion analysis
  - Designing executive and board-level revenue dashboards
  - Identifying CAC payback and unit economics trends
  verified: true
  version: v1.0.0
---

# Revenue Analytics & GTM Efficiency

## Overview

Revenue analytics translates raw financial and pipeline data into actionable intelligence about how efficiently a B2B SaaS company acquires, retains, and expands revenue. While pipeline analytics (see `sales-team/pipeline-analytics`) focuses on deal-level health and rep coaching, revenue analytics operates at the business level -- measuring unit economics, GTM efficiency, and revenue quality over time.

**Core Value:** Understand not just how much revenue you are generating, but how efficiently you are generating it, how durable it is, and where the highest-leverage improvements exist.

**Complementary to saas-finance:** This skill focuses on GTM operational measurement -- how efficiently the go-to-market engine acquires and grows revenue. The saas-finance skill focuses on financial planning, business model health, and investor-facing metrics. Where saas-finance asks "Is the business model sound?", revenue analytics asks "Is the GTM engine efficient?" Minimal overlap by design: revenue analytics provides the operational inputs that saas-finance uses for financial modeling.

**Who Uses This Skill:**

- **Revenue Operations** uses it for operational measurement: tracking GTM efficiency, identifying channel ROI, monitoring unit economics, and surfacing trends before they become problems.
- **Sales Leadership** uses it for strategic decisions: where to invest in headcount, which channels to scale, when CAC is trending unhealthy, and how to set realistic targets.
- **Executive Team / Board** uses it for business health assessment: ARR growth trajectory, NDR trends, LTV:CAC ratios, and Magic Number as indicators of scalable growth.
- **Finance Partners** use the operational data as inputs for financial models, runway calculations, and investor reporting.

**What It Does:**

1. Defines and calculates core SaaS revenue metrics with industry benchmarks
2. Measures GTM efficiency across acquisition channels and motions
3. Analyzes full-funnel conversion rates from visitor to closed-won
4. Tracks cohort-level revenue retention, expansion, and contraction
5. Provides dashboard design guidance for different audiences (board, exec, ops)

## Core SaaS Revenue Metrics

These are the foundational metrics every B2B SaaS company must track. Each metric is defined with its formula, what it measures, and benchmark ranges.

### ARR and MRR

**Annual Recurring Revenue (ARR)** and **Monthly Recurring Revenue (MRR)** are the foundation of SaaS revenue measurement.

**Formulas:**

```
MRR = Sum of all active monthly subscription values
ARR = MRR x 12
```

**MRR Components (MRR waterfall):**

| Component | Definition | Calculation |
|-----------|-----------|-------------|
| New MRR | Revenue from new customers acquired this month | Sum of first-month values for new customers |
| Expansion MRR | Revenue increase from existing customers (upsell, cross-sell, seat expansion) | Sum of MRR increases from existing customers |
| Contraction MRR | Revenue decrease from existing customers (downgrades) | Sum of MRR decreases from existing customers (negative) |
| Churn MRR | Revenue lost from customers who cancelled | Sum of MRR from churned customers (negative) |
| Reactivation MRR | Revenue from previously churned customers who return | Sum of MRR from reactivated customers |

**Net New MRR:**

```
Net New MRR = New MRR + Expansion MRR + Reactivation MRR - Contraction MRR - Churn MRR
```

**Healthy MRR profile:** Expansion MRR should eventually exceed Churn MRR + Contraction MRR, creating "negative net churn" where the existing customer base grows in value without any new customers.

**Benchmarks:**

| Metric | Early Stage (<$5M ARR) | Growth ($5-50M ARR) | Scale ($50M+ ARR) |
|--------|----------------------|--------------------|--------------------|
| ARR Growth Rate | 100-300% | 50-100% | 30-50% |
| Net New MRR Growth (MoM) | 10-20% | 5-10% | 2-5% |
| Expansion % of New MRR | 10-20% | 20-40% | 30-50%+ |

### Net Dollar Retention (NDR) and Gross Dollar Retention (GDR)

NDR and GDR measure how well you retain and grow revenue from existing customers, independent of new customer acquisition.

**Formulas:**

```
GDR = (Beginning Period ARR - Contraction ARR - Churn ARR) / Beginning Period ARR
NDR = (Beginning Period ARR + Expansion ARR - Contraction ARR - Churn ARR) / Beginning Period ARR
```

**Key distinction:** GDR can never exceed 100% (it only measures retention). NDR can exceed 100% when expansion outpaces churn and contraction.

**Benchmarks:**

| Metric | Below Average | Average | Good | Best-in-Class |
|--------|--------------|---------|------|---------------|
| GDR | < 85% | 85-90% | 90-95% | 95%+ |
| NDR | < 100% | 100-110% | 110-130% | 130%+ |

**Interpretation:**

- **NDR > 120%:** Strong product-market fit with clear expansion paths. The installed base is a growth engine.
- **NDR 100-120%:** Healthy retention with moderate expansion. Room to improve upsell/cross-sell motions.
- **NDR < 100%:** The customer base is shrinking. Churn and contraction outpace expansion. Acquisition must outrun the leak to grow.
- **GDR < 85%:** Fundamental retention problem. Fix churn before investing more in acquisition -- you are filling a leaky bucket.

### Customer Lifetime Value (LTV)

LTV estimates the total revenue a customer will generate over the entire relationship.

**Formula:**

```
LTV = Average Revenue Per Account (ARPA) x Gross Margin % / Revenue Churn Rate
```

**Simplified (monthly):**

```
LTV = (Monthly ARPA x Gross Margin %) / Monthly Revenue Churn Rate
```

**Example:**
- Monthly ARPA: $2,000
- Gross Margin: 80%
- Monthly Revenue Churn: 2%

```
LTV = ($2,000 x 0.80) / 0.02 = $80,000
```

**Benchmarks by segment:**

| Segment | Typical LTV Range |
|---------|------------------|
| SMB (self-serve) | $5K - $25K |
| Mid-Market (sales-assisted) | $25K - $200K |
| Enterprise (sales-led) | $200K - $2M+ |

### Customer Acquisition Cost (CAC)

CAC measures the fully-loaded cost to acquire a new customer.

**Formula:**

```
CAC = (Total Sales & Marketing Spend in Period) / (New Customers Acquired in Period)
```

**Fully-loaded includes:** Salaries (sales + marketing teams), commissions, advertising spend, tooling/software, events, content production, overhead allocation.

**CAC by channel:** Calculate CAC separately for each acquisition channel to identify the most efficient sources.

| Channel | Typical CAC Range (B2B SaaS) | Notes |
|---------|----------------------------|-------|
| Organic/Inbound | $500 - $5,000 | Lowest CAC but slow to build |
| Content Marketing | $1,000 - $8,000 | Long payback but compounds over time |
| Paid Search/Social | $3,000 - $15,000 | Fast to scale but expensive |
| Outbound Sales | $5,000 - $25,000 | Higher CAC but larger deal sizes |
| Events/Conferences | $8,000 - $30,000 | High cost but relationship-driven |
| Referral/Partner | $1,000 - $5,000 | Low CAC and high close rates |

### CAC Payback Period

CAC Payback measures how many months it takes to recover the cost of acquiring a customer.

**Formula:**

```
CAC Payback (months) = CAC / (Monthly ARPA x Gross Margin %)
```

**Example:**
- CAC: $18,000
- Monthly ARPA: $2,000
- Gross Margin: 80%

```
CAC Payback = $18,000 / ($2,000 x 0.80) = 11.25 months
```

**Benchmarks:**

| Payback Period | Assessment |
|---------------|------------|
| < 6 months | Excellent -- very efficient acquisition; consider investing more aggressively |
| 6-12 months | Good -- healthy unit economics for most B2B SaaS |
| 12-18 months | Acceptable -- typical for enterprise sales motions with longer cycles |
| 18-24 months | Concerning -- monitor closely; may not be sustainable at scale |
| 24+ months | Unhealthy -- acquisition is too expensive relative to revenue; fix before scaling |

### LTV:CAC Ratio

The ratio of customer lifetime value to acquisition cost is the single most important unit economics metric.

**Formula:**

```
LTV:CAC = Customer Lifetime Value / Customer Acquisition Cost
```

**Benchmarks:**

| Ratio | Assessment | Implication |
|-------|------------|-------------|
| < 1x | Unsustainable | Losing money on every customer; fundamental business model problem |
| 1-3x | Underperforming | May be viable but not generating enough return on acquisition investment |
| 3-5x | Ideal | Healthy balance between growth investment and return |
| 5x+ | Under-investing | Strong unit economics but possibly leaving growth on the table; invest more in acquisition |

**Common mistake:** A very high LTV:CAC (7x+) is not always good. It often means the company is under-investing in growth and leaving market share for competitors. The ideal range balances efficiency with growth velocity.

### Magic Number

The Magic Number measures the efficiency of sales and marketing spend in generating new ARR.

**Formula:**

```
Magic Number = Net New ARR (current quarter) / Sales & Marketing Spend (previous quarter)
```

**Why previous quarter spend:** Sales and marketing investments typically take one quarter to produce pipeline and revenue. Using a one-quarter lag provides a more accurate efficiency signal.

**Benchmarks:**

| Magic Number | Assessment | Implication |
|-------------|------------|-------------|
| < 0.5 | Inefficient | Spending too much relative to ARR generation; optimize before scaling |
| 0.5-0.75 | Developing | Room for improvement; acceptable for early-stage or new market entry |
| 0.75-1.0 | Efficient | Healthy GTM efficiency; good candidate for accelerated investment |
| 1.0+ | Highly Efficient | Strong signal to invest more aggressively in sales and marketing |

## GTM Efficiency Analytics

GTM efficiency analytics measures how productively the go-to-market engine converts investment into revenue. These metrics help answer: "For every dollar we spend on sales and marketing, how much revenue do we get back?"

### Sales Efficiency Ratio

**Formula:**

```
Sales Efficiency = Net New ARR / Total Sales Cost (fully loaded)
```

Total Sales Cost includes: sales team salaries, commissions, sales tooling, sales management, travel, and allocated overhead.

**Benchmarks:**

| Ratio | Assessment |
|-------|------------|
| < 0.5x | Inefficient -- sales cost exceeds revenue generation |
| 0.5-1.0x | Developing -- covering costs but not yet efficient |
| 1.0-1.5x | Good -- generating healthy return on sales investment |
| 1.5x+ | Excellent -- strong signal to add sales capacity |

**Segmented analysis:** Calculate sales efficiency by rep, team, territory, and segment. Large variations reveal where the sales model works well and where it needs adjustment.

### Pipeline-to-Revenue Conversion

**Formula:**

```
Pipeline-to-Revenue = Closed-Won ARR / Total Pipeline Created (same cohort)
```

This measures how efficiently the pipeline machine converts generated pipeline into actual revenue. Unlike win rate (which counts deals), this measures dollar conversion.

**Benchmarks:**

| Conversion Rate | Assessment |
|----------------|------------|
| < 15% | Low -- significant pipeline waste; investigate quality at the top |
| 15-25% | Average -- typical for B2B SaaS with mixed inbound/outbound |
| 25-35% | Good -- pipeline quality is strong |
| 35%+ | Excellent -- highly qualified pipeline with strong conversion |

**Diagnostic splits:**

| Split By | What It Reveals |
|----------|----------------|
| Channel | Which channels create pipeline that actually converts vs. vanity pipeline |
| Rep | Which reps convert pipeline efficiently vs. those who accumulate but do not close |
| Segment | Whether enterprise pipeline converts at different rates than SMB |
| Time | Whether conversion rates are improving or declining over time |

### Customer Acquisition Efficiency

**Formula:**

```
CAE = (New Customer LTV x Number of New Customers) / Total S&M Spend
```

CAE extends beyond CAC by incorporating the expected lifetime value of acquired customers, not just the count. A high CAE means you are acquiring high-value customers efficiently.

**Benchmarks:**

| CAE Ratio | Assessment |
|-----------|------------|
| < 3x | Inefficient -- acquired customers do not generate enough lifetime value to justify spend |
| 3-5x | Healthy -- good balance of acquisition cost and customer value |
| 5-8x | Strong -- efficient acquisition of high-value customers |
| 8x+ | Under-investing -- expand acquisition channels to capture more of the market |

### Channel ROI

Measure the return on investment for each acquisition channel to optimize budget allocation.

**Formula (per channel):**

```
Channel ROI = (Revenue Attributed to Channel - Channel Cost) / Channel Cost x 100%
```

**Channel comparison template:**

| Channel | Spend | Leads | SQLs | Customers | ARR Won | CAC | LTV:CAC | ROI |
|---------|-------|-------|------|-----------|---------|-----|---------|-----|
| Organic/SEO | $X | X | X | X | $X | $X | X.Xx | X% |
| Paid Search | $X | X | X | X | $X | $X | X.Xx | X% |
| Outbound | $X | X | X | X | $X | $X | X.Xx | X% |
| Events | $X | X | X | X | $X | $X | X.Xx | X% |
| Referral | $X | X | X | X | $X | $X | X.Xx | X% |
| Partner | $X | X | X | X | $X | $X | X.Xx | X% |

**Budget allocation principle:** Shift spend toward channels with the best LTV:CAC ratio, not the lowest CAC. A channel with $15K CAC but 8x LTV:CAC is better than a channel with $5K CAC but 2x LTV:CAC.

## Funnel Analytics

Funnel analytics tracks the full journey from first touch to closed-won deal, measuring conversion rates and velocity at every stage. This reveals where the GTM engine leaks and where to invest.

### Full-Funnel Conversion Rates

**Standard B2B SaaS funnel stages:**

```
Visitor → Lead → MQL → SQL → Opportunity → Close-Won
```

**Benchmark conversion rates (B2B SaaS):**

| Stage Transition | Below Average | Average | Above Average |
|-----------------|--------------|---------|---------------|
| Visitor → Lead | < 1% | 1-3% | 3-5% |
| Lead → MQL | < 15% | 15-30% | 30-50% |
| MQL → SQL | < 20% | 20-40% | 40-60% |
| SQL → Opportunity | < 40% | 40-60% | 60-80% |
| Opportunity → Close-Won | < 15% | 15-25% | 25-40% |
| Full Funnel (Visitor → Close) | < 0.1% | 0.1-0.5% | 0.5-2% |

**Reading the funnel:**

- **Top-of-funnel leak (Visitor to Lead):** Content, SEO, or website conversion problem. Fix: landing page optimization, better CTAs, lead magnets.
- **Middle-of-funnel leak (MQL to SQL):** Qualification criteria too loose or nurture sequences ineffective. Fix: tighten MQL scoring, improve nurture content, align marketing and sales on SQL definition.
- **Bottom-of-funnel leak (Opportunity to Close):** Sales execution or product-market fit problem. Fix: analyze lost deal reasons, improve sales enablement, review competitive positioning.

### Stage Velocity

Stage velocity measures how long prospects spend in each funnel stage before advancing or dropping out.

**Benchmark stage durations (B2B SaaS, mid-market):**

| Stage | Typical Duration | Healthy Range |
|-------|-----------------|---------------|
| Lead to MQL | 7-14 days | Up to 30 days |
| MQL to SQL | 3-7 days | Up to 14 days |
| SQL to Opportunity | 5-14 days | Up to 21 days |
| Opportunity to Close | 30-90 days | Up to 120 days |
| Full Cycle (Lead to Close) | 60-120 days | Up to 180 days |

**Velocity analysis:**

- **Decreasing velocity** (stages taking longer): Investigate specific stages. Common causes: insufficient sales capacity, poor lead quality, competitive pressure, buyer budget freezes.
- **Increasing velocity** (stages getting shorter): Good signal if win rates hold. If velocity increases but win rates drop, deals may be rushing through without proper qualification.

### Drop-Off Analysis

For every stage transition, measure not just conversion rate but the reasons for drop-off.

**Drop-off tracking template:**

| Stage | Entered | Advanced | Dropped | Drop Rate | Top Drop Reasons |
|-------|---------|----------|---------|-----------|-----------------|
| Lead → MQL | X | X | X | X% | 1. No fit (X%), 2. No engagement (X%), 3. Competitor (X%) |
| MQL → SQL | X | X | X | X% | 1. Budget (X%), 2. Timing (X%), 3. Wrong persona (X%) |
| SQL → Opp | X | X | X | X% | 1. No pain (X%), 2. Status quo (X%), 3. Lost to competitor (X%) |
| Opp → Close | X | X | X | X% | 1. Price (X%), 2. Competitor won (X%), 3. No decision (X%) |

**High-impact interventions:** Focus on the stage with the largest absolute drop-off (not percentage). Improving conversion by 5pp at a stage that processes 1,000 leads has more impact than 10pp at a stage that processes 50.

## Cohort Revenue Intelligence

Cohort analysis groups customers by their acquisition period and tracks their revenue behavior over time. This reveals whether revenue quality is improving or degrading with each new cohort.

### Cohort Analysis by Acquisition Month

Group all customers acquired in the same month and track their aggregate revenue over time.

**Cohort table template (NDR by month since acquisition):**

| Cohort | Month 0 | Month 3 | Month 6 | Month 9 | Month 12 |
|--------|---------|---------|---------|---------|----------|
| Jan | 100% | 98% | 102% | 108% | 115% |
| Feb | 100% | 96% | 99% | 103% | 110% |
| Mar | 100% | 94% | 95% | 96% | 95% |
| Apr | 100% | 97% | 101% | 106% | -- |
| May | 100% | 98% | 103% | -- | -- |

**Reading the cohort table:**

- **Upward curves (Jan, Feb):** Healthy expansion revenue. These cohorts grow over time.
- **Flat/declining curves (Mar):** Contraction or churn outpacing expansion. Investigate what changed in the March acquisition process, onboarding, or product experience.
- **Comparison across cohorts:** Are newer cohorts performing better or worse than older ones? Improving cohort curves indicate GTM and product improvements are working. Declining curves indicate a systemic problem.

### Expansion and Contraction Tracking

Track expansion and contraction at the cohort level to understand revenue dynamics beyond the aggregate NDR number.

**Expansion/Contraction breakdown:**

| Cohort | Starting ARR | Expansion ARR | Contraction ARR | Churn ARR | Ending ARR | NDR |
|--------|-------------|--------------|----------------|----------|-----------|-----|
| Q1 | $500K | $75K | -$20K | -$30K | $525K | 105% |
| Q2 | $620K | $50K | -$35K | -$45K | $590K | 95% |
| Q3 | $480K | $90K | -$15K | -$25K | $530K | 110% |

**Diagnostic questions:**

- **High expansion, high churn (Q2):** Polarized customer base. Some customers love the product and expand; others churn. Investigate: are there different segments with different product-market fit?
- **Low expansion, low churn (stable):** Customers are satisfied but not growing. Investigate: are there upsell/cross-sell motions? Is the product expanding into adjacent use cases?
- **High expansion, low churn (Q3):** Ideal profile. Understand what drives expansion in these cohorts and replicate.

### Revenue Retention Curves

Plot the revenue retention curve (percentage of original cohort revenue retained over time) to visualize long-term revenue durability.

**Healthy retention curve characteristics:**

- **Month 1-3:** Minimal churn (< 5% cumulative). Early churn indicates onboarding or expectation-setting problems.
- **Month 3-6:** Churn stabilizes. Customers who survive the first 3 months typically have stronger retention.
- **Month 6-12:** Curve flattens or inflects upward (expansion begins to offset churn).
- **Month 12+:** Curve exceeds 100% in the best cohorts (negative net churn).

**Warning signs:**

| Pattern | Meaning | Action |
|---------|---------|--------|
| Steep early drop (>10% in 3 months) | Onboarding failure or mismatched expectations at sale | Improve onboarding; audit sales qualification criteria |
| Steady linear decline | Ongoing value delivery problem | Investigate product engagement; improve customer success |
| Curve never inflects upward | No expansion motion or product is not sticky | Build upsell/cross-sell paths; add features that grow with usage |
| Newer cohorts worse than older | GTM quality declining | Tighten ICP targeting; review lead source quality |

## Revenue Dashboard Design

Effective revenue dashboards serve different audiences with different cadences and levels of detail. The key principle is: every metric on the dashboard should drive a decision. If no one will act on a metric, remove it.

### KPI Selection Principles

1. **Start with decisions, not data.** Ask: "What decisions does this audience make?" Then select the metrics that inform those decisions.
2. **Limit to 5-7 primary KPIs per view.** More than 7 primary metrics creates cognitive overload. Supporting detail goes in drill-down views.
3. **Include leading and lagging indicators.** Lagging (ARR, revenue) confirm results. Leading (pipeline, MQLs, velocity) predict future results. Both are needed.
4. **Show trends, not snapshots.** A number without context is meaningless. Always show the metric alongside its trend (MoM, QoQ) and target.
5. **Benchmark against targets and prior periods.** Every metric should have a target (plan) and a comparison (prior period) to provide immediate context.

### Dashboard Layout Principles

**Z-pattern layout:** Place the most important metrics in the top-left (where the eye starts). Summary KPIs across the top row, trend charts in the middle, detail tables at the bottom.

**Color coding:**

| Color | Meaning | Usage |
|-------|---------|-------|
| Green | On track / above target | Metric meets or exceeds plan |
| Yellow | Watch / slightly off target | Metric within 10% of plan |
| Red | Off track / below target | Metric more than 10% below plan |
| Gray | No target set / informational | Context metrics without targets |

**Cadence alignment:** Match the dashboard refresh rate to the decision cadence. A board dashboard updated quarterly does not need real-time data. An ops dashboard driving weekly actions should refresh daily.

### Audience-Specific Views

See `references/revenue-dashboard-template.md` for detailed templates for three audiences:

1. **Board-Level View (Quarterly):** Business health, growth trajectory, unit economics. 5-6 KPIs maximum. Focus on trends and benchmarks.
2. **Executive View (Monthly):** ARR movement, GTM efficiency, funnel health, cohort trends. 7-8 KPIs with drill-down capability.
3. **Operations View (Weekly):** Detailed funnel metrics, channel performance, pipeline-to-revenue conversion, rep-level efficiency. Full detail for operational decision-making.

## Input/Output Contract

### Inputs

**Primary Input: Revenue and Financial Data**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| period | string | Yes | Reporting period (month, quarter) |
| arr | number | Yes | Annual Recurring Revenue at period end |
| new_mrr | number | Yes | New MRR added this period |
| expansion_mrr | number | Yes | Expansion MRR this period |
| contraction_mrr | number | Yes | Contraction MRR this period (negative) |
| churn_mrr | number | Yes | Churned MRR this period (negative) |
| new_customers | number | Yes | New customers acquired this period |
| churned_customers | number | Yes | Customers lost this period |
| total_customers | number | Yes | Total active customers at period end |
| sm_spend | number | Yes | Total sales and marketing spend this period |
| gross_margin_pct | number | Yes | Gross margin percentage |

**Secondary Input: Funnel Data**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| visitors | number | Recommended | Website visitors this period |
| leads | number | Recommended | New leads generated |
| mqls | number | Recommended | Marketing Qualified Leads |
| sqls | number | Recommended | Sales Qualified Leads |
| opportunities | number | Recommended | New opportunities created |
| closed_won | number | Recommended | Deals closed-won |
| closed_won_arr | number | Recommended | ARR from closed-won deals |
| channel | string | Recommended | Acquisition channel for segmentation |

**Tertiary Input: Cohort Data**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| cohort_month | string | Recommended | Acquisition month (e.g., 2026-01) |
| customers_in_cohort | number | Recommended | Number of customers in cohort |
| starting_arr | number | Recommended | ARR at cohort formation |
| current_arr | number | Recommended | Current ARR for the cohort |
| expansion_arr | number | Optional | Expansion ARR within the cohort |
| contraction_arr | number | Optional | Contraction ARR within the cohort |
| churned_arr | number | Optional | Churned ARR within the cohort |

### Outputs

**1. Revenue Health Report (Structured Markdown)**

Core SaaS metrics with trend analysis, benchmark comparison, and actionable insights. Includes ARR waterfall, NDR/GDR, LTV:CAC, CAC Payback, and Magic Number.

**2. GTM Efficiency Analysis**

Channel-level ROI, sales efficiency ratios, pipeline-to-revenue conversion, and customer acquisition efficiency with optimization recommendations.

**3. Funnel Conversion Report**

Full-funnel conversion rates with stage velocity, drop-off analysis, and high-impact intervention recommendations.

**4. Cohort Revenue Report**

Cohort-level NDR curves, expansion/contraction breakdown, retention curve analysis, and cohort comparison with diagnostic insights.

**5. Revenue Dashboard**

Audience-specific KPI views (board, executive, operations) following the templates in `references/revenue-dashboard-template.md`.

### External Actions

| Action | Trigger | Target System |
|--------|---------|--------------|
| Send monthly revenue report | Monthly analysis complete | Messaging platform (leadership channel) |
| Alert on NDR decline | NDR drops below 100% for any cohort | Messaging platform (revenue ops channel) |
| Update revenue dashboard | New period data available | BI tool or spreadsheet |
| Flag CAC payback regression | Payback period exceeds 18 months | Messaging platform (finance + sales leadership) |
| Generate board deck metrics | Quarterly board prep | Presentation tool or document platform |
| Trigger cohort investigation | Cohort NDR diverges >15pp from average | Task management (assign to CS + Rev Ops) |

## Reference Files

- **[Revenue Dashboard Template](references/revenue-dashboard-template.md):** Detailed dashboard layouts for board, executive, and operations audiences with specific metrics, visualization recommendations, and benchmark targets.

## Quick Reference

### Core Metrics Cheat Sheet

| Metric | Formula | Ideal Range |
|--------|---------|-------------|
| NDR | (Start ARR + Expansion - Contraction - Churn) / Start ARR | 110-130% |
| GDR | (Start ARR - Contraction - Churn) / Start ARR | 90-95% |
| LTV:CAC | Customer LTV / CAC | 3-5x |
| CAC Payback | CAC / (Monthly ARPA x Gross Margin %) | 6-12 months |
| Magic Number | Net New ARR (this Q) / S&M Spend (last Q) | 0.75-1.0+ |
| Sales Efficiency | Net New ARR / Total Sales Cost | 1.0-1.5x |

### Funnel Benchmarks (B2B SaaS)

| Transition | Average Conversion |
|-----------|-------------------|
| Visitor to Lead | 1-3% |
| Lead to MQL | 15-30% |
| MQL to SQL | 20-40% |
| SQL to Opportunity | 40-60% |
| Opportunity to Close | 15-25% |

### Cohort Health Signals

| Signal | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| Month 3 retention | > 95% | 90-95% | < 90% |
| Month 12 NDR | > 110% | 100-110% | < 100% |
| Expansion onset | By month 4-6 | By month 8-10 | No expansion by month 12 |
| Cohort trend (new vs old) | Improving | Flat | Declining |
