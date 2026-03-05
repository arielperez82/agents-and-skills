---
name: pipeline-forecasting
description: Revenue forecasting methods, pipeline coverage analysis, forecast cadence
  frameworks, and predictive deal scoring for B2B sales. Complements pipeline-analytics
  (health monitoring) with forward-looking prediction and forecast discipline.
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
    - references/forecast-template.md
  difficulty: advanced
  domain: sales
  examples:
  - title: Quarterly Revenue Forecast
    input: 'Forecast Q2: 62 open deals worth $3.4M, quota $1.1M, historical win rate
      22%'
    output: 'Weighted forecast: $1.28M (116% of quota). Coverage: 3.1x (healthy).
      Commit: $820K (12 deals in Negotiation+). Best-case: $1.1M. Upside: $1.4M.
      Risk: 4 deals past 2x stage average, 3 single-threaded. Forecast confidence:
      Moderate -- coverage adequate but 23% of weighted value from at-risk deals.'
  - title: Weekly Commit Call Preparation
    input: 'Prepare commit call: 8 deals expected to close this month, $480K total'
    output: 'Commit (high confidence): 5 deals, $310K -- all in Negotiation with
      mutual action plans and decision-maker engaged. Best-case: +2 deals, $120K --
      proposals out, awaiting procurement. Upside: +1 deal, $50K -- verbal interest
      but no proposal yet. Movement since last week: 2 deals advanced (Demo to Proposal),
      1 slipped (pushed close date 30 days), 1 lost ($35K, competitor). Net change:
      -$35K from lost, +$85K from new pipeline entering Proposal.'
  featured: false
  frequency: Weekly (commit call), monthly (outlook), quarterly (plan)
  orchestrated-by: []
  related-agents:
  - sales-ops-analyst
  - account-executive
  related-commands: []
  related-skills:
  - sales-team/pipeline-analytics
  - sales-team/sales-call-analysis
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: sales-operations
  tags:
  - sales
  - forecasting
  - pipeline
  - revenue
  - prediction
  - sales-ops
  - coverage
  time-saved: Reduces weekly forecast preparation from 90 minutes to 20 minutes
  title: Pipeline Forecasting & Revenue Prediction
  updated: 2026-03-05
  use-cases:
  - Building weekly commit/best-case/upside forecasts for management review
  - Calculating pipeline coverage ratios against quota targets
  - Tracking forecast accuracy over time to improve prediction discipline
  - Scoring deal probability using blended methods (stage weight, rep judgment, pattern matching)
  - Running monthly and quarterly forecast outlook reviews
  - Identifying pipeline generation gaps before they become quota misses
  verified: true
  version: v1.0.0
---

# Pipeline Forecasting & Revenue Prediction

## Overview

Pipeline forecasting translates current pipeline state into forward-looking revenue predictions. While pipeline-analytics answers "how healthy is the pipeline right now?", pipeline forecasting answers "how much revenue will this pipeline produce, and when?"

**Core Value:** Predictable revenue through disciplined forecasting methodology. Accurate forecasts enable confident resource allocation, hiring decisions, and board-level planning. Inaccurate forecasts erode trust and create reactive fire drills.

**Relationship to Pipeline Analytics:** This skill is complementary to `pipeline-analytics`, not a replacement. Pipeline analytics provides health monitoring, deal risk flagging, and coaching insights -- the diagnostic foundation. Pipeline forecasting builds on that foundation with forward-looking prediction methods, coverage analysis, and forecast cadence discipline. Use both together: analytics to understand pipeline state, forecasting to predict pipeline outcomes.

**Who Uses This Skill:**

- **Account Executives** use it to build their individual commit/best-case/upside calls and track their own forecast accuracy over time.
- **Sales Managers** use it to aggregate rep forecasts into team-level predictions, challenge optimistic or pessimistic calls, and report to VP-level leadership.
- **VP Sales / CRO** uses it for board-level forecasting, resource planning, and pipeline generation target-setting.
- **Revenue Operations** uses it to build and refine forecasting models, track accuracy metrics, and identify systematic biases in the forecasting process.

**What It Does:**

1. Applies multiple forecasting methods (weighted pipeline, rep judgment, AI-assisted, blended) to produce revenue predictions
2. Calculates pipeline coverage ratios to determine whether sufficient pipeline exists to hit quota
3. Scores individual deals on close probability using stage, activity, and engagement signals
4. Structures forecast cadence (weekly, monthly, quarterly) with appropriate detail at each level
5. Tracks forecast accuracy over time to identify biases and improve prediction quality

## Forecasting Methods

No single forecasting method is reliable on its own. Each method has blind spots that the others compensate for. The strongest forecasts blend multiple methods and reconcile the differences.

### Weighted Pipeline (Stage Probability)

The simplest and most common method. Each stage has a historical close probability, and the forecast is the sum of all deals multiplied by their stage probability.

**Formula:**

```
Weighted Forecast = SUM(Deal Value x Stage Probability) for all open deals
```

**Stage probability benchmarks** (B2B SaaS, mid-market -- calibrate to your own historical data):

| Stage | Default Probability | Typical Range |
|-------|-------------------|---------------|
| Qualification | 10% | 5-15% |
| Discovery/Demo | 20% | 15-30% |
| Proposal | 50% | 40-60% |
| Negotiation | 75% | 65-85% |
| Verbal Commit | 90% | 85-95% |

**Example:**

| Deal | Value | Stage | Probability | Weighted Value |
|------|-------|-------|-------------|----------------|
| Acme Corp | $80,000 | Proposal | 50% | $40,000 |
| Beta Inc | $45,000 | Negotiation | 75% | $33,750 |
| Gamma Ltd | $120,000 | Discovery | 20% | $24,000 |
| Delta Co | $60,000 | Verbal Commit | 90% | $54,000 |
| **Total** | **$305,000** | | | **$151,750** |

**Strengths:** Simple, objective, easy to calculate, works across large deal volumes.

**Weaknesses:** Treats all deals in a stage as equal (a stale Proposal and a hot Proposal both get 50%). Does not account for deal-specific signals like engagement level, buyer urgency, or competitive dynamics.

**When to use:** As a baseline. Always calculate weighted pipeline as your starting point, then adjust with other methods.

### Rep Judgment (Commit Categories)

Reps classify each deal into forecast categories based on their knowledge of the deal, the buyer, and the competitive landscape.

**Categories:**

| Category | Definition | Expected Close Probability |
|----------|-----------|---------------------------|
| **Commit** | Rep is confident this deal will close this period. Specific evidence: decision-maker verbally committed, procurement process started, or contract in legal review. | 85-95% |
| **Best Case** | Deal is progressing well and could close this period if everything goes right. No blocking issues identified, but some uncertainty remains (e.g., final budget approval pending). | 50-70% |
| **Upside** | Deal has potential to close this period but requires favorable conditions. May depend on accelerated timeline, budget being released early, or competitive displacement. | 20-40% |
| **Pipeline** | Deal is in progress but not expected to close this period. Included in coverage calculations but not in the current-period forecast. | 5-15% |

**Calculating the rep judgment forecast:**

```
Rep Forecast = SUM(Commit deals) + SUM(Best Case x 0.60) + SUM(Upside x 0.30)
```

**Strengths:** Captures deal-specific knowledge that no formula can. Reps know things about buyer urgency, internal politics, and competitive dynamics that stage alone cannot reflect.

**Weaknesses:** Subject to cognitive biases. Common biases include:

| Bias | Description | Correction |
|------|-----------|------------|
| Optimism bias | Reps overweight positive signals and underweight risks | Require specific evidence for Commit calls; track accuracy by rep |
| Sandbagging | Reps underforecast to create easy beats | Compare rep calls to weighted pipeline; challenge large gaps |
| Recency bias | Last interaction dominates the assessment | Require review of full deal history, not just latest touchpoint |
| Anchoring | Original close date or deal size persists despite changes | Force fresh assessment each forecast cycle; compare to stage benchmarks |

**When to use:** For current-period forecasts where deal-specific context matters. Always validate rep judgment against weighted pipeline and historical patterns.

### AI-Assisted Forecasting (Pattern Recognition)

AI-assisted forecasting uses historical deal data to identify patterns that predict close likelihood beyond what stage alone can tell.

**Pattern Recognition Signals:**

| Signal Category | Specific Signals | Predictive Value |
|----------------|-----------------|-----------------|
| **Activity patterns** | Email frequency, meeting cadence, response times | High -- active deals close; silent deals stall |
| **Engagement breadth** | Number of stakeholders engaged, departments involved | High -- multi-threaded deals close at 2-3x rate |
| **Timeline signals** | Days in stage vs. average, close date movement, stage velocity | High -- deals that move on pace close; those that slow down lose |
| **Content engagement** | Proposal views, document shares, case study requests | Medium -- intent signals correlate with progression |
| **Competitive signals** | Mentions of competitors, evaluation criteria changes | Medium -- competitive dynamics shift probability up or down |

**Deal Similarity Scoring:**

Compare current open deals to historical closed deals (won and lost) to find the closest matches.

```
Similarity Score = weighted match across:
  - Same industry segment (0.15)
  - Similar deal size (+/- 30%) (0.20)
  - Same source type (0.10)
  - Similar stage velocity (0.20)
  - Similar engagement pattern (0.20)
  - Same competitor present (0.15)
```

Deals that resemble historical wins get a probability boost; deals that resemble historical losses get a reduction.

**Strengths:** Removes human bias. Identifies patterns across hundreds of deals that no individual could spot. Improves over time as more data accumulates.

**Weaknesses:** Requires sufficient historical data (minimum 100-200 closed deals for meaningful patterns). Cannot account for truly novel situations. Black-box nature can reduce rep buy-in.

**When to use:** When you have 6+ months of clean historical data. Best as a complement to human judgment, not a replacement.

### Blended Forecasting

The most accurate forecasts combine multiple methods and reconcile the differences. Disagreements between methods are themselves a signal.

**Blended Forecast Formula:**

```
Blended Forecast = (Weighted Pipeline x W1) + (Rep Judgment x W2) + (AI-Assisted x W3)
```

**Recommended weights** (adjust based on your data):

| Scenario | Weighted Pipeline (W1) | Rep Judgment (W2) | AI-Assisted (W3) |
|----------|----------------------|-------------------|-------------------|
| Early in quarter (weeks 1-4) | 0.40 | 0.30 | 0.30 |
| Mid-quarter (weeks 5-8) | 0.25 | 0.45 | 0.30 |
| Late in quarter (weeks 9-12) | 0.15 | 0.55 | 0.30 |
| No historical data available | 0.50 | 0.50 | 0.00 |
| New reps (< 2 quarters tenure) | 0.45 | 0.20 | 0.35 |

**Rationale:** Early in the quarter, deals are further from close and rep judgment is less reliable -- lean on statistical methods. Late in the quarter, reps have the most current information about their commit deals -- lean on judgment. AI-assisted weight stays relatively constant as a bias-correction layer.

**Reconciliation process:** When methods disagree by more than 20%, investigate the gap:

| Gap Type | Likely Cause | Action |
|----------|-------------|--------|
| Weighted > Rep Judgment | Reps are conservative or see risks not in the data | Review at-risk deals; if risks are real, trust judgment |
| Rep Judgment > Weighted | Reps are optimistic or know something the data does not | Challenge: what specific evidence supports the higher call? |
| AI-Assisted diverges from both | Historical patterns differ from current dynamics | Investigate: has something changed (new product, new market, new competitor)? |

## Pipeline Health Metrics for Forecasting

These metrics feed directly into forecast accuracy. Monitoring them proactively prevents forecast surprises.

### Coverage Ratio

The most critical leading indicator for quota attainment.

**Formula:**

```
Coverage Ratio = Total Pipeline Value / Quota Target
```

**Coverage benchmarks** (B2B SaaS, mid-market):

| Coverage Ratio | Assessment | Forecast Implication |
|---------------|------------|---------------------|
| 4x+ | Strong | High confidence in quota attainment; focus on quality over quantity |
| 3-4x | Healthy | Target range; forecast should land within 90-110% of quota |
| 2-3x | At Risk | Forecast will likely miss unless win rates are above average |
| < 2x | Critical | Quota miss is probable; immediate pipeline generation required |

**Weighted coverage** is more meaningful than raw coverage:

```
Weighted Coverage = SUM(Deal Value x Stage Probability) / Quota Target
```

A weighted coverage of 1.0-1.2x indicates pipeline is sufficient to hit quota at historical close rates. Below 1.0x means the math does not work without above-average performance.

**Coverage by time horizon:**

| Time Horizon | Minimum Raw Coverage | Why |
|-------------|---------------------|-----|
| Current quarter | 3x | Deals in pipeline today must close within weeks |
| Next quarter | 4x | More time for deals to fall out; need buffer |
| Two quarters out | 5x | Early-stage pipeline has high attrition |

### Velocity by Stage

Track how quickly deals move through each stage and trend over time.

**Velocity calculation per stage:**

```
Stage Velocity = Average days deals spend in [Stage] before advancing
```

**Forecasting application:** If average Discovery-to-Proposal takes 14 days and a deal has been in Discovery for 10 days, forecast it to reach Proposal in approximately 4 days. If it has been in Discovery for 28 days (2x average), flag it as at-risk and reduce its forecast probability.

**Velocity trend analysis:**

| Velocity Trend | Signal | Forecast Impact |
|---------------|--------|----------------|
| Accelerating (getting faster) | Market tailwind, product improvements, or better selling | Increase forecast confidence; deals may close earlier than expected |
| Stable | Normal operations | Use historical benchmarks for forecasting |
| Decelerating (getting slower) | Market headwind, competitive pressure, or process problems | Decrease forecast confidence; push expected close dates out |

### Conversion Rates by Stage

Conversion rates are the backbone of weighted pipeline forecasting. Use actuals, not textbook defaults.

**How to calculate your own stage probabilities:**

```
Stage Probability = (Deals that entered this stage and eventually closed-won) /
                    (All deals that entered this stage)
```

Calculate over a rolling 6-12 month window. Update quarterly.

**Segmented conversion rates** improve accuracy:

| Segment | Qual to Close-Won | Pipeline to Use |
|---------|-------------------|-----------------|
| SMB deals (<$10K) | 22% | Higher volume, faster cycle |
| Mid-market ($10-100K) | 16% | Core business, standard cycle |
| Enterprise ($100K+) | 11% | Lower volume, longer cycle |
| Inbound source | 18% | Self-qualified, higher intent |
| Outbound source | 14% | Rep-qualified, needs nurturing |
| Referral source | 32% | Pre-validated, highest close rate |

### Average Deal Size Trends

Track whether average deal size is growing, stable, or shrinking. This directly affects forecast accuracy.

**Trend analysis:**

```
Avg Deal Size (Rolling 3-Month) = Total Closed-Won Revenue / Number of Closed-Won Deals
```

**Forecasting application:** If average deal size is trending up, current pipeline may produce more revenue than historical probabilities suggest. If trending down, pipeline may underperform.

### Win Rate by Segment, Source, and Competitor

Granular win rates produce more accurate deal-level forecasts than a single overall win rate.

**Win rate segmentation matrix:**

| Dimension | High Win Rate Segments | Low Win Rate Segments | Forecast Adjustment |
|-----------|----------------------|----------------------|-------------------|
| Segment | SMB (faster decision, fewer stakeholders) | Enterprise (complex buying, long cycles) | Weight enterprise deals lower |
| Source | Referrals (pre-validated) | Events (low intent) | Weight referral pipeline higher |
| Competitor | No known competitor (greenfield) | Incumbent vendor displacement | Reduce probability for competitive deals |

## Deal Risk Signals for Forecasting

These signals reduce forecast probability for individual deals. When present, move the deal down in forecast confidence or extend the expected close date.

### Age Greater Than 2x Stage Average

A deal that has been in its current stage for more than twice the average is likely stalled. Historical data shows these deals close at less than half the rate of on-pace deals.

**Forecast adjustment:** Reduce the deal's forecast probability by 50% when age exceeds 2x stage average. At 3x, reduce by 75%.

### No Activity in 14+ Days

Deals with no recorded activity (email, call, meeting, note) for 14 or more days have a significantly lower close rate.

**Forecast adjustment:** Reduce probability by 40% after 14 days of inactivity. After 21 days, reduce by 60%. After 30 days, consider removing from the active forecast entirely.

### Single Stakeholder Engagement

Deals with only one engaged contact at the buyer organization are at high risk. If that contact leaves, goes on vacation, or loses internal support, the deal dies.

**Forecast adjustment:** Reduce probability by 30% for single-threaded deals. Multi-threaded deals (3+ contacts, including a decision-maker) close at 2-3x the rate of single-threaded deals.

### Stuck Stage (Days Greater Than 1.5x Benchmark)

Deals spending more than 1.5x the benchmark time in a stage are showing early signs of stalling, even if not yet at the 2x critical threshold.

**Forecast adjustment:** Reduce probability by 20% at 1.5x. This is a softer signal than the 2x rule but catches problems earlier for forecasting purposes.

### Declining Engagement Signals

When buyer engagement is decreasing -- response times lengthening, meetings being rescheduled, fewer stakeholders attending calls -- the deal is cooling.

**Specific signals:**

| Signal | Detection | Forecast Adjustment |
|--------|----------|-------------------|
| Response time 2x slower than average | Compare last 2 weeks to prior pattern | -15% probability |
| Meeting rescheduled 2+ times | Count reschedules in last 30 days | -25% probability |
| Meeting cancelled without rebook | Any cancellation without new date | -40% probability |
| Stakeholders dropping off calls | Fewer attendees than previous calls | -20% probability |
| One-way communication (3+ unanswered) | Count unanswered outreach | -50% probability |

**Cumulative adjustment:** Risk signals stack. A deal that is single-threaded (-30%), with declining engagement (-20%), and past 1.5x stage average (-20%) should have its forecast probability reduced by the combined adjustment, with a floor of 5% (never forecast a deal at 0% unless it is formally closed-lost).

## Forecast Cadence

Forecast discipline requires a structured cadence at each organizational level. Each cadence serves a different audience and purpose.

### Weekly Commit Call (Rep to Manager)

**Frequency:** Weekly, every Monday or Tuesday
**Duration:** 15-30 minutes per rep
**Audience:** Individual rep + direct manager

**Agenda:**

1. **Current period commit** -- Which deals will close this period? What is the specific evidence for each commit call?
2. **Category review** -- Walk through Commit, Best Case, and Upside deals. Challenge or validate each classification.
3. **Deal movement** -- What changed since last week? Deals advanced, slipped, added, lost.
4. **Risk review** -- Any commit deals at risk? What is the mitigation plan?
5. **Pipeline coverage check** -- Is coverage sufficient for the remaining period? If not, what is the generation plan?

**Output:** Updated forecast by category (Commit / Best Case / Upside) with deal-level detail.

**Manager's role:** Challenge optimistic calls, validate evidence, push for specificity. "You say Acme is a commit -- has the decision-maker explicitly confirmed timeline and budget?"

### Monthly Outlook (Manager to VP)

**Frequency:** Monthly, first week of month
**Duration:** 30-60 minutes per team
**Audience:** Sales manager + VP Sales / CRO

**Agenda:**

1. **Month and quarter forecast** -- Aggregated forecast by category across all reps
2. **Forecast accuracy review** -- How did last month's forecast compare to actuals? What caused the variance?
3. **Pipeline generation health** -- Is enough new pipeline being created to sustain future quarters?
4. **Coverage analysis** -- Current quarter and next quarter coverage ratios
5. **Team-level trends** -- Win rate, velocity, average deal size, conversion rate trends
6. **Key deals review** -- Top 10 deals by value with status and risk assessment
7. **Upside and risk scenarios** -- Best-case and worst-case quarterly outcomes

**Output:** Monthly forecast report with accuracy tracking, coverage analysis, and key deal commentary.

### Quarterly Plan (VP to CRO / Board)

**Frequency:** Quarterly, 2-3 weeks before quarter end (for next quarter) and at quarter start (for current quarter plan)
**Duration:** 60-90 minutes
**Audience:** VP Sales + CRO + CFO / Board

**Agenda:**

1. **Quarterly revenue forecast** -- Blended forecast with confidence range (low / expected / high)
2. **Coverage and pipeline analysis** -- Current quarter close-out and next quarter readiness
3. **Year-to-date attainment** -- Cumulative performance against annual plan
4. **Segment analysis** -- Performance by segment, product line, and geography
5. **Forecast methodology update** -- Any changes to weights, probabilities, or models based on accuracy data
6. **Resource and capacity review** -- Does the team have capacity to work the pipeline? Hiring needs?
7. **Risk factors** -- Market conditions, competitive changes, churn risk, major deal dependencies

**Output:** Board-ready forecast package with scenarios, supporting data, and strategic commentary.

### Rolling Forecast Accuracy Tracking

Track forecast accuracy over time to identify systematic biases and improve prediction quality.

**Accuracy formula:**

```
Forecast Accuracy = 1 - ABS(Forecast - Actual) / Actual
```

**Example:**
- Forecast: $1.1M
- Actual: $1.0M
- Accuracy: 1 - |$1.1M - $1.0M| / $1.0M = 90%

**Accuracy benchmarks:**

| Accuracy Level | Assessment | Implication |
|---------------|-----------|-------------|
| 90%+ | Excellent | Forecasting model and process are well-calibrated |
| 80-90% | Good | Minor adjustments needed; track direction of errors |
| 70-80% | Fair | Systematic bias likely; investigate methodology |
| 60-70% | Poor | Process overhaul needed; reps may not be engaged |
| < 60% | Unreliable | Forecast is not usable for planning; rebuild from fundamentals |

**Bias detection:**

| Pattern | Bias Type | Correction |
|---------|----------|------------|
| Consistently overforecast (actual < forecast) | Optimism bias | Reduce stage probabilities; challenge rep commit calls more aggressively |
| Consistently underforecast (actual > forecast) | Sandbagging / conservatism | Push reps to categorize more deals as Commit/Best Case; review upside pipeline |
| Accuracy varies wildly month to month | Process inconsistency | Standardize methodology; ensure all reps follow the same categorization criteria |
| Accuracy good for team total but bad per rep | Averaging effect masking individual errors | Coach individual reps on forecasting discipline; track accuracy by rep |

## B2B SaaS Pipeline Benchmarks

These benchmarks represent realistic ranges for mid-market B2B SaaS companies ($10K-$100K ACV). Use them as starting points, then calibrate to your own data as it accumulates.

### Pipeline Metrics

| Metric | Below Average | Average | Above Average |
|--------|--------------|---------|---------------|
| Pipeline coverage ratio | < 2.5x | 3-4x | 4-5x |
| Weighted coverage ratio | < 0.8x | 1.0-1.2x | 1.2-1.5x |
| Pipeline generation (monthly, per rep) | < $150K | $200-350K | $400K+ |
| Average sales cycle | 90+ days | 45-75 days | 30-45 days |
| Average deal size (ACV) | < $15K | $20-50K | $50K+ |

### Win Rates

| Metric | Below Average | Average | Above Average |
|--------|--------------|---------|---------------|
| Overall win rate (all pipeline) | < 15% | 18-25% | 25-35% |
| Qualified opportunity win rate | < 25% | 30-45% | 45-55% |
| Competitive win rate | < 30% | 35-50% | 50-65% |
| Referral win rate | < 35% | 40-55% | 55-70% |

### Forecast Accuracy

| Metric | Below Average | Average | Above Average |
|--------|--------------|---------|---------------|
| Weekly forecast accuracy | < 70% | 75-85% | 85%+ |
| Monthly forecast accuracy | < 75% | 80-90% | 90%+ |
| Quarterly forecast accuracy | < 80% | 85-92% | 92%+ |

### Conversion Rates by Stage (Mid-Market)

| Transition | Below Average | Average | Above Average |
|-----------|--------------|---------|---------------|
| Qualification to Discovery | < 50% | 55-65% | 65-80% |
| Discovery to Proposal | < 40% | 45-55% | 55-70% |
| Proposal to Negotiation | < 50% | 55-65% | 65-80% |
| Negotiation to Close-Won | < 55% | 60-72% | 72-85% |

### Velocity Benchmarks

| Metric | Below Average | Average | Above Average |
|--------|--------------|---------|---------------|
| Pipeline velocity ($/day/rep) | < $2,000 | $3,000-5,000 | $5,000+ |
| Stage-to-stage velocity (avg days) | 20+ days | 10-18 days | 7-10 days |
| Time to first meeting (from MQL) | 5+ days | 2-4 days | < 2 days |

## Input/Output Contract

### Inputs

**Primary Input: CRM Pipeline Snapshot**

A structured dataset of all open deals with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| deal_id | string | Yes | Unique deal identifier |
| deal_name | string | Yes | Company or opportunity name |
| deal_value | number | Yes | Total deal value (ACV or TCV) |
| stage | string | Yes | Current pipeline stage |
| stage_entered_date | date | Yes | Date the deal entered the current stage |
| created_date | date | Yes | Date the deal was created |
| expected_close_date | date | Yes | Rep's expected close date |
| last_activity_date | date | Yes | Date of most recent activity |
| owner | string | Yes | Rep name or ID |
| forecast_category | string | Recommended | Rep's call: Commit, Best Case, Upside, or Pipeline |
| contacts_engaged | number | Recommended | Count of engaged contacts at buyer org |
| champion_identified | boolean | Recommended | Whether a champion has been identified |
| decision_maker_engaged | boolean | Recommended | Whether a decision maker has been engaged |
| source | string | Recommended | Lead source (inbound, outbound, referral, partner, event) |
| segment | string | Optional | Deal segment (SMB, mid-market, enterprise) |
| competitor | string | Optional | Known competitor in the deal |
| close_date_history | list | Optional | History of close date changes (for slip detection) |

**Secondary Input: Historical Closed Deals**

For probability calibration and AI-assisted forecasting, provide closed deals (won and lost) from the past 6-12 months:

| Field | Type | Description |
|-------|------|-------------|
| outcome | string | Won or Lost |
| close_date_actual | date | Actual close date |
| loss_reason | string | Reason for loss (if lost) |
| stage_durations | object | Days spent in each stage |
| forecast_history | list | Historical forecast category assignments over time |

**Tertiary Input: Quota and Forecast History**

| Field | Type | Description |
|-------|------|-------------|
| rep | string | Rep name or ID |
| quota_period | string | Period (e.g., Q1 2026) |
| quota_value | number | Target quota for the period |
| prior_forecasts | list | Previous forecast submissions for accuracy tracking |
| prior_actuals | list | Actual closed-won revenue for accuracy tracking |

### Outputs

**1. Revenue Forecast (Structured Markdown)**

Forecast by category (Commit / Best Case / Upside) with deal-level detail, blended forecast total, and confidence range.

**2. Pipeline Coverage Analysis**

Current and next-quarter coverage ratios (raw and weighted), with gap analysis and generation targets.

**3. Deal-Level Probability Scores**

For each open deal: adjusted probability incorporating stage weight, risk signals, engagement patterns, and historical similarity.

**4. Forecast Accuracy Report**

Rolling accuracy tracking with bias detection, rep-level accuracy, and methodology improvement recommendations.

**5. Forecast Cadence Outputs**

Structured agendas and data packages for weekly commit calls, monthly outlooks, and quarterly planning sessions.

### External Actions

Based on forecast results, the following actions can be triggered:

| Action | Trigger | Target System |
|--------|---------|--------------|
| Send weekly forecast summary | Commit call complete | Messaging platform (management channel) |
| Alert on coverage gap | Coverage drops below 3x | Messaging platform (rep + manager) |
| Update forecast fields on deals | Probability scores calculated | CRM (custom forecast fields) |
| Flag close date slippage | Deal close date pushed 2+ times | CRM + messaging (manager notification) |
| Generate pipeline target | Coverage below threshold for next quarter | CRM + reporting (pipeline generation dashboard) |
| Publish forecast accuracy report | Monthly cycle complete | Business intelligence tool or spreadsheet |
| Schedule commit call | Weekly cadence trigger | Calendar platform |

## Quick Reference

### Forecasting Methods Summary

| Method | Best For | Weakness | Weight (Mid-Quarter) |
|--------|---------|----------|---------------------|
| Weighted Pipeline | Baseline across large deal volumes | Treats all same-stage deals equally | 25% |
| Rep Judgment | Current-period deal-specific context | Subject to cognitive biases | 45% |
| AI-Assisted | Removing bias, finding patterns | Needs historical data; black box | 30% |
| Blended | Maximum accuracy | Requires all three inputs | 100% (combined) |

### Coverage Quick Check

| Coverage | Verdict | Action |
|----------|---------|--------|
| 4x+ | Strong | Focus on conversion, not generation |
| 3-4x | Healthy | Maintain current generation pace |
| 2-3x | At Risk | Increase prospecting activity |
| < 2x | Critical | Emergency pipeline generation |

### Forecast Category Definitions

| Category | Probability | Evidence Required |
|----------|-----------|------------------|
| Commit | 85-95% | Decision-maker confirmed, procurement started, or contract in review |
| Best Case | 50-70% | Progressing well, no blockers, some uncertainty remains |
| Upside | 20-40% | Possible but requires favorable conditions |
| Pipeline | 5-15% | In progress, not expected this period |

### Risk Signal Forecast Adjustments

| Signal | Probability Reduction |
|--------|--------------------|
| Age > 2x stage average | -50% |
| No activity 14+ days | -40% |
| Single stakeholder | -30% |
| Stuck stage (1.5x benchmark) | -20% |
| Declining engagement | -15% to -50% (varies by signal) |

### Accuracy Targets

| Cadence | Target Accuracy |
|---------|----------------|
| Weekly | 80%+ |
| Monthly | 85%+ |
| Quarterly | 90%+ |
