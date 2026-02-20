---

# === CORE IDENTITY ===
name: prioritization-frameworks
title: Prioritization Frameworks
description: Portfolio allocation with NPV-based within-bucket prioritization for comparing features, tech debt, bugs, reliability, and polish on a unified scale. Replaces standalone RICE as the top-level method while preserving RICE within growth/revenue buckets. Use for cross-type prioritization, financial quantification of tech debt, and strategic capacity allocation.
domain: product
subdomain: product-management

# === WEBSITE DISPLAY ===
difficulty: advanced
time-saved: "Reduces quarterly prioritization from days to hours"
frequency: "Quarterly (allocation), continuous (within-bucket ranking)"
use-cases:
  - Setting quarterly capacity allocations across strategic buckets
  - Ranking items within buckets using RICE + NPV + Cost of Delay
  - Ranking items within buckets using WSJF when time sensitivity matters
  - Comparing tech debt paydown against growth features using unified priority score
  - Modeling financial impact of bugs via CLV-at-risk
  - Classifying polish work using Kano Model
  - Monte Carlo forecasting for probabilistic delivery dates
  - Extracting throughput data from git commit history
  - Calibrating effort estimates for AI-assisted development

# === RELATIONSHIPS ===
related-agents:
  - product-director
  - product-manager
  - senior-project-manager
  - agile-coach
  - product-analyst
  - implementation-planner
related-skills:
  - product-team/product-manager-toolkit
  - product-team/product-strategist
  - delivery-team/agile-coach
related-commands: []
orchestrated-by: []

# === TECHNICAL ===
dependencies:
  scripts:
    - scripts/portfolio_prioritizer.py
    - scripts/monte_carlo_forecast.py
    - scripts/git_throughput_extractor.py
  references:
    - references/npv-financial-model.md
    - references/portfolio-allocation-framework.md
    - references/must-strategic-tracks.md
    - references/product-operating-model.md
    - references/experimental-product-management.md
    - references/prioritization-selection-guide.md
    - references/wsjf-framework.md
    - references/ai-pace-calibration.md
    - references/confidence-driven-prioritization.md
compatibility:
  python-version: "3.8+"
  platforms: [macos, linux, windows]
tech-stack:
  - Python 3.8+
  - CLI
  - CSV processing
  - JSON export

# === EXAMPLES ===
examples:
  - title: Quarterly Portfolio Allocation
    input: "Set capacity split: 60% growth, 20% revenue, 15% tech debt, 5% polish"
    output: "Allocation applied. 42 items scored within buckets. Top 3 per bucket shown."
  - title: Tech Debt vs Feature Comparison
    input: "Compare auth refactor (debt) against SSO feature (growth) for overflow capacity"
    output: "Auth refactor: Priority Score 8.7 (NPV $598K, strategic 9/10). SSO: Priority Score 9.2 (NPV $720K, strategic 8/10)."

# === ANALYTICS ===
stats:
  downloads: 0
  stars: 0
  rating: 0.0
  reviews: 0

# === VERSIONING ===
version: v1.0.0
author: Claude Skills Team
contributors: []
created: 2026-02-11
updated: 2026-02-20
license: MIT

# === DISCOVERABILITY ===
tags: [prioritization, portfolio, npv, rice, tech-debt, product, strategy, kano, cost-of-delay, monte-carlo, forecasting, wsjf]
featured: false
verified: true
---

# Prioritization Frameworks

## Overview

Portfolio allocation with NPV-based within-bucket prioritization. Enables cross-type comparison (features vs. tech debt vs. bugs vs. reliability vs. polish) using financial quantification and strategic alignment scoring.

**Core Value:** Eliminates the "apples-to-oranges" problem by: (1) setting strategic capacity buckets upfront, (2) using domain-appropriate ranking within each bucket, and (3) providing a unified priority score for cross-bucket overflow decisions.

**Target Audience:** Product Director, CTO, Product Manager, Senior PM, Agile Coach

**Decision Rights:**
- **Portfolio allocations:** Product Director + CTO (quarterly)
- **Within-bucket ranking:** Product Manager with engineering input
- **Rebalancing signals:** Senior PM (monitors, does not set allocations)
- **Sprint mapping:** Agile Coach (maps sprint capacity to bucket allocations)

## Primary Approach: Portfolio Allocation + Within-Bucket Prioritization

### Step 1: Set Strategic Buckets (Product Director + CTO)

Allocate quarterly capacity across work types. Example starting allocation:

| Bucket | Allocation | Contains |
|--------|-----------|----------|
| Growth | 60% | New features, experiments, market expansion |
| Revenue | 20% | Sales enablement, monetization, deal-closing tools |
| Tech Debt | 15% | Stability, scalability, architecture modernization |
| Polish | 5% | UX improvements, accessibility, performance tuning |

Adjust ratios based on:
- **Company stage:** Early-stage skews growth; mature skews revenue + debt
- **System health:** Increase tech debt allocation if velocity is declining or incidents rising
- **Market pressure:** Increase growth if competitive window is closing
- **Customer signals:** Increase polish if NPS/CSAT is dropping despite feature delivery

### Step 2: Rank Within Each Bucket (Product Manager)

Each bucket uses the framework best suited to its work type:

#### Growth and Revenue Buckets: RICE + NPV + Cost of Delay

Score each item on three dimensions:

1. **RICE Score** (existing `rice_prioritizer.py`):
   `(Reach x Impact x Confidence) / Effort`

2. **Risk-Adjusted NPV:**
   Model the item as a cash flow stream. Discount future value. Multiply by probability of success.

   ```
   Risk-Adjusted NPV = Probability x SUM(t=1..n) [ (Revenue_t - Cost_t) / (1 + discount_rate)^t ]
   ```

   Example — validated new feature:
   - 60% chance of $2M revenue over 3 years
   - $200K development cost
   - 10% discount rate
   - Risk-Adjusted NPV = 0.6 x ($2M discounted) - $200K = ~$720K

3. **Cost of Delay** (urgency modifier):
   Value lost per unit time if delayed. High CoD items jump ahead of higher-NPV items with low urgency.
   - **Market window closing** → High CoD (ship now or lose the opportunity)
   - **Regulatory deadline** → High CoD (non-negotiable date)
   - **No external pressure** → Low CoD (sequence by NPV alone)

**Combined rank:** Sort by `RICE_normalized x 0.3 + Risk_Adjusted_NPV_normalized x 0.5 + CoD_normalized x 0.2`

#### Tech Debt Bucket: Debt Severity Matrix

Score each debt item on three axes:

| Axis | Scale | What it measures |
|------|-------|-----------------|
| Criticality | High / Medium / Low | Security risk, outage potential, data integrity |
| Compound Interest | $/month | Productivity tax — cost of not fixing, compounding over time |
| Dependency Impact | Yes / No | Does this block other planned initiatives? |

**Quantify as NPV:**
```
NPV = -Fix_Cost + SUM(t=1..n) [ (Recovered_Productivity - Ongoing_Maintenance) / (1 + r)^t ]
```

Example — legacy auth system:
- Fix cost: $50K
- Recovered productivity: $200K/year (team spends 33% of time on workarounds)
- Ongoing maintenance: $30K/year
- NPV over 5 years at 10% discount: **$598K**

**Decision thresholds:**
- Address if NPV of fix > 2x the debt's annual interest payment
- Escalate to Product Director if dependency impact = Yes and blocks a growth item

#### Bug Bucket: CLV-at-Risk

Model bugs as revenue-at-risk using customer lifetime value:

```
CLV_at_Risk = (Churn_Rate_Increase x Affected_Customers x ARPU x Gross_Margin) / (Discount_Rate - Retention_Rate)
```

Example — payment processing bug:
- Causes 5% additional churn among 1,000 affected customers
- $100 ARPU, 70% gross margin
- CLV-at-Risk = **$233K**

Also factor in:
- **Support cost:** Ticket volume x average handle time x labor rate
- **Brand damage:** Qualitative severity (P0/P1/P2/P3 mapping)

**Decision thresholds:**
- Fix if CLV-at-Risk > 3x fix cost
- P0/P1 bugs bypass portfolio allocation entirely (incident response)

#### Polish Bucket: Kano Model

Classify each polish item:

| Category | Definition | Priority within bucket |
|----------|-----------|----------------------|
| Must-have (Basic) | Absence causes dissatisfaction; presence is expected | Fix first |
| Performance | Linear relationship — more investment = more satisfaction | Rank by conversion/retention lift |
| Delighter | Unexpected value — absence doesn't hurt, presence surprises | Fund only after must-haves and top performers |

Quantify where possible:
- Conversion lift (A/B test data or estimate)
- NPS/CSAT impact
- Retention correlation

### Step 3: Cross-Bucket Normalization (When Buckets Compete)

When items compete for overflow capacity or when rebalancing triggers a cross-bucket comparison, use the unified priority score:

```
Priority Score = (Risk-Adjusted NPV_normalized x 0.7) + (Strategic Alignment x 0.3)
```

Where:
- **Risk-Adjusted NPV** is normalized to a 0-10 scale across all candidates
- **Strategic Alignment** is scored 1-10 against current OKRs (feeds from `okr_cascade_generator.py`)

**Example cross-bucket comparison:**

| Initiative | Bucket | Risk-Adj NPV | Strategic Alignment | Priority Score |
|-----------|--------|-------------|-------------------|---------------|
| Growth Feature X | Growth | $720K (8.2) | 8/10 | **8.1** |
| Auth Refactor Y | Tech Debt | $538K (6.1) | 9/10 | **7.0** |
| Payment Bug Fix Z | Bug | $420K (4.8) | 7/10 | **5.5** |
| Sales Dashboard A | Revenue | $665K (7.6) | 6/10 | **7.1** |

**When to use cross-bucket normalization:**
- A bucket is exhausted and has leftover capacity → overflow to highest-scoring items from other buckets
- Quarterly rebalancing reveals a bucket is over/under-allocated
- A single initiative is so large it spans multiple buckets

**When NOT to use it:**
- Normal within-bucket ranking (use the bucket-specific framework)
- P0/P1 incidents (bypass all frameworks — fix immediately)

### Step 4: Continuous Rebalancing

#### Quarterly Cadence

1. **Product Director + CTO** review bucket allocations against:
   - Actual spend vs. planned allocation (drift detection)
   - Velocity trends (is tech debt slowing delivery?)
   - Market/competitive shifts
   - Customer health metrics (NPS, churn, support volume)

2. **Product Manager** refreshes within-bucket scores with updated data

3. **Senior PM** reports portfolio health:
   - Items at risk (RAG status)
   - Rebalancing recommendations (not decisions)
   - Cross-bucket contention points

#### Dynamic Thresholds

Trigger rebalancing mid-quarter when:
- **Tech debt velocity tax** exceeds 20% of engineering capacity
- **Incident rate** increases >50% quarter-over-quarter
- **Churn rate** increases >2 percentage points
- **A critical market window** opens or closes unexpectedly

#### Tech Debt Sprint Allocation

Reserve 10-20% of each sprint for debt reduction regardless of quarterly bucket allocation. This ensures continuous debt paydown even when the quarterly tech debt bucket is small.

- **Agile Coach** maps sprint capacity to bucket allocations
- **Sprint debt allocation** is a floor, not a ceiling — can increase if quarterly allocation is higher

## Supplementary Frameworks (Reach-For)

These frameworks address specific strategic situations beyond day-to-day prioritization. They are reference material, not mandatory process.

### NPV Financial Model
**When to use:** Making the dollar case for a specific tech debt or reliability investment to leadership.
**Who uses it:** Product Manager + Engineering leads
**Reference:** [npv-financial-model.md](references/npv-financial-model.md)

### MuST (Multiple Strategic Tracks)
**When to use:** Annual/multi-year strategy when the "right bet" is genuinely unknown. Run parallel strategic tracks with defined kill criteria.
**Who uses it:** Product Director
**Reference:** [must-strategic-tracks.md](references/must-strategic-tracks.md)

### POM (Product Operating Model)
**When to use:** Organizational retrospective when the prioritization process itself feels broken. Assess where the org sits on the traditional-to-modern spectrum.
**Who uses it:** Product Director + CTO
**Reference:** [product-operating-model.md](references/product-operating-model.md)

### Experimental Product Management
**When to use:** Scaling the team or rethinking how capacity is allocated structurally. Dynamic resourcing model for experiment-driven environments.
**Who uses it:** Senior PM + Product Director
**Reference:** [experimental-product-management.md](references/experimental-product-management.md)

### Confidence-Driven Prioritization
**When to use:** Translating Monte Carlo forecast percentiles into WSJF adjustments, stakeholder commitments, and portfolio rebalancing triggers.
**Who uses it:** Product Director, Senior Project Manager, Product Manager
**Reference:** [confidence-driven-prioritization.md](references/confidence-driven-prioritization.md)

## Python Tools

### portfolio_prioritizer.py

Portfolio allocation + NPV scoring tool. Operates alongside and wraps the existing `rice_prioritizer.py`.

**Key Features:**
- Set and adjust bucket allocations
- Score items using bucket-appropriate frameworks (RICE+NPV, Debt Severity, CLV-at-risk, Kano)
- Cross-bucket normalization with unified priority score
- Integrates with `rice_prioritizer.py` for growth/revenue bucket scoring
- CSV input/output, JSON export

**Usage:**
```bash
# Score items with portfolio context
python3 scripts/portfolio_prioritizer.py items.csv --allocation growth:60,revenue:20,debt:15,polish:5

# Cross-bucket comparison
python3 scripts/portfolio_prioritizer.py items.csv --cross-bucket
```

**CSV Format:**
```csv
name,bucket,reach,impact,confidence,effort,npv,probability,cost_of_delay,strategic_alignment
SSO Feature,growth,500,3,0.8,5,2000000,0.6,high,8
Auth Refactor,debt,,,,,598000,0.9,,9
Payment Bug,bug,,,,,233000,0.9,high,7
```

**WSJF Mode:**
```bash
# WSJF scoring for growth/revenue buckets
python3 scripts/portfolio_prioritizer.py items.csv --wsjf

# WSJF + JSON output
python3 scripts/portfolio_prioritizer.py items.csv --wsjf --output json
```

**WSJF CSV Columns (required when --wsjf):**
```csv
name,bucket,business_value,time_criticality,risk_reduction,job_size
Feature A,growth,8,6,4,3
```

WSJF = (Business Value + Time Criticality + Risk Reduction) / Job Size. See [wsjf-framework.md](references/wsjf-framework.md) for scoring rubrics and decision guide.

**Complete Documentation:** See tool source for full options and integration patterns.

### monte_carlo_forecast.py

Probabilistic delivery date estimator. Runs Monte Carlo simulations using historical throughput data to produce confidence-level completion estimates.

**Key Features:**
- 10,000 simulation iterations (configurable)
- Percentile output: 50th, 85th, 95th confidence levels
- Calendar date projection with `--start-date`
- JSON and text output formats
- Accepts throughput as comma-separated values or JSON file (pipeline-compatible with git_throughput_extractor.py)

**Usage:**
```bash
# Basic forecast
python3 scripts/monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20

# With date projection
python3 scripts/monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20 --start-date 2026-03-01

# From extractor output (pipeline)
python3 scripts/git_throughput_extractor.py --output json --file throughput.json
python3 scripts/monte_carlo_forecast.py --throughput throughput.json --remaining 15

# JSON output
python3 scripts/monte_carlo_forecast.py --throughput 3,5,2,4,6 --remaining 20 --output json
```

**When to invoke:** Before committing to delivery dates. Use 85th percentile for internal planning, 95th for external commitments. See [confidence-driven-prioritization.md](references/confidence-driven-prioritization.md).

### git_throughput_extractor.py

Extracts delivery throughput from git commit history by matching initiative markers (`I<nn>-<ACRONYM>`) and backlog markers (`B-<nn>`) in commit messages.

**Key Features:**
- Counts unique items completed per period (day or week)
- Configurable date range (default: last 6 months)
- Includes zero-throughput periods for accurate variance modeling
- JSON output directly compatible as Monte Carlo forecaster input

**Usage:**
```bash
# Default: current repo, weekly, last 6 months
python3 scripts/git_throughput_extractor.py

# Custom range
python3 scripts/git_throughput_extractor.py --since 2026-01-01 --until 2026-02-20

# Daily granularity
python3 scripts/git_throughput_extractor.py --period day

# JSON for pipeline
python3 scripts/git_throughput_extractor.py --output json --file throughput.json
```

**When to invoke:** When calibrating forecasts with real data. See [ai-pace-calibration.md](references/ai-pace-calibration.md) for calibration methodology.

## Integration Points

This skill integrates with existing product team tools:

| Tool | Skill | Integration |
|------|-------|------------|
| `rice_prioritizer.py` | product-manager-toolkit | RICE scores feed into growth/revenue bucket ranking |
| `okr_cascade_generator.py` | product-strategist | OKR alignment scores feed into strategic alignment dimension |
| `okr_lifecycle.py` | product-strategist | Quarterly OKR reviews trigger rebalancing assessment |
| `prioritize_backlog.py` | delivery-team/agile-coach | Sprint-level prioritization maps to bucket allocations |
| `user_story_generator.py` | agile-product-owner | Prioritized items broken into INVEST stories |
| `customer_interview_analyzer.py` | product-manager-toolkit | Interview insights inform NPV estimates and Kano classification |

## Quick Reference

**Bucket allocation:** Product Director + CTO set quarterly. Typical starting split: 60/20/15/5.

**Within-bucket ranking:**
- Growth/Revenue → RICE + NPV + Cost of Delay (default) or WSJF `--wsjf` (when time sensitivity matters)
- Tech Debt → Debt Severity Matrix (criticality x compound interest x dependency)
- Bugs → CLV-at-Risk (churn cost modeling)
- Polish → Kano Model (must-have / performance / delighter)

**Cross-bucket formula:**
`Priority Score = (Risk-Adjusted NPV_norm x 0.7) + (Strategic Alignment x 0.3)`

**Decision thresholds:**
- Tech debt: Fix if NPV > 2x annual interest
- Bugs: Fix if CLV-at-Risk > 3x fix cost
- Features: Approve if Risk-Adj NPV > WACC + 5% hurdle rate
- P0/P1 incidents: Bypass all frameworks — fix immediately

**WSJF formula:** `(Business Value + Time Criticality + Risk Reduction) / Job Size` — opt-in via `--wsjf` flag.

**Monte Carlo forecasting:**
- Extract throughput: `python3 scripts/git_throughput_extractor.py --repo-path . --period week`
- Forecast delivery: `python3 scripts/monte_carlo_forecast.py --throughput data.json --remaining 12`
- Confidence levels: P50 (planning), P85 (commitment), P95 (worst-case)

**Rebalancing triggers:**
- Tech debt velocity tax > 20% of engineering capacity
- Incident rate up > 50% QoQ
- Churn up > 2pp
- Critical market window opens/closes
