---

# === CORE IDENTITY ===
name: pipeline-analytics
title: Pipeline Analytics & Health Monitoring
description: Pipeline health monitoring, deal risk flagging, stage velocity analysis, and coaching insights for B2B sales. Enables daily pipeline reviews that surface at-risk deals, identify coaching opportunities, and provide data-driven forecasting inputs.
domain: sales
subdomain: sales-operations

# === WEBSITE DISPLAY ===
difficulty: advanced
time-saved: "Reduces daily pipeline review from 60 minutes to 15 minutes"
frequency: "Daily (pipeline review), weekly (deep analysis), quarterly (forecast)"
use-cases:
  - Running daily pipeline health reviews across all deals
  - Flagging at-risk deals based on staleness, engagement gaps, or missing milestones
  - Analyzing stage-to-stage conversion rates and velocity
  - Generating pipeline health scores for individual reps and team overall
  - Producing coaching insights from pipeline patterns
  - Providing forecast accuracy inputs

# === RELATIONSHIPS ===
related-agents:
  - ap-account-executive
related-skills:
  - sales-team/sales-call-analysis
  - sales-team/meeting-intelligence
  - sales-team/lead-qualification
related-commands: []
orchestrated-by: []

# === TECHNICAL ===
dependencies:
  scripts: []
  references: []
compatibility:
  platforms: [macos, linux, windows]

# === EXAMPLES ===
examples:
  - title: Daily Pipeline Review
    input: "Review pipeline: 45 deals across 5 stages, $2.1M total value"
    output: "Pipeline Health: 72/100 (Moderate). 8 deals at risk (4 stale >14 days, 2 no recent activity, 2 missing champion). Stage breakdown: Qualification(12) → Demo(15) → Proposal(10) → Negotiation(5) → Close(3). Velocity: avg 18 days/stage. Action items: [5 specific deal interventions]"
  - title: Rep Pipeline Coaching
    input: "Analyze pipeline patterns for Rep A: 12 deals, 60% stuck in Demo stage"
    output: "Pattern: Demo-to-Proposal conversion at 25% (team avg 45%). Root cause: demos not tailored to pain points (see call analysis scores). Coaching: Run discovery recap before every demo. 3 specific deals to re-engage with new approach."

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
updated: 2026-02-11
license: MIT

# === DISCOVERABILITY ===
tags: [sales, pipeline, analytics, forecasting, deal-risk, coaching, sales-ops, velocity]
featured: false
verified: true
---

# Pipeline Analytics & Health Monitoring

## Overview

Pipeline analytics transforms raw CRM data into actionable intelligence for B2B sales teams. Instead of reacting to lost deals after the fact, this skill enables proactive risk detection -- surfacing problems while there is still time to intervene.

**Core Value:** Proactive risk detection, not retroactive loss analysis. Every day a deal sits unattended or a risk goes undetected is a day closer to a lost opportunity. This skill catches those signals early.

**Who Uses This Skill:**

- **Account Executives** use it for self-management: daily review of their own pipeline, identifying which deals need attention today, and tracking their own velocity and conversion patterns.
- **Sales Managers** use it for team oversight: comparing rep performance, identifying coaching opportunities, validating forecast accuracy, and ensuring pipeline coverage meets quota targets.
- **Revenue Operations** uses it for strategic planning: aggregate pipeline health trends, capacity planning, and forecasting model inputs.

**What It Does:**

1. Scores overall pipeline health on a 0-100 scale using weighted metrics
2. Flags individual deals at risk with severity levels and recommended actions
3. Analyzes stage-to-stage conversion rates and velocity to find bottlenecks
4. Generates coaching insights by detecting patterns in rep-level data
5. Produces structured daily/weekly reports for consistent pipeline discipline

## Pipeline Health Framework

Pipeline health is a composite score reflecting whether the pipeline can realistically support quota attainment. A healthy pipeline has sufficient coverage, balanced distribution, reasonable velocity, and strong conversion rates.

### Coverage Ratio

Coverage ratio is the most fundamental pipeline health metric: total pipeline value divided by quota target for the period.

| Coverage Ratio | Assessment | Action |
|---------------|------------|--------|
| 4x+ | Strong | Maintain quality; avoid over-investing in generation |
| 3-4x | Healthy | Target range for most B2B sales teams |
| 2-3x | At Risk | Increase prospecting activity; accelerate early-stage deals |
| < 2x | Critical | Emergency pipeline generation; re-examine lost deal patterns |

**How to calculate:**

```
Coverage Ratio = Total Weighted Pipeline Value / Quota Target
```

Weighted pipeline value applies stage-specific probabilities:

| Stage | Typical Weight |
|-------|---------------|
| Qualification | 10% |
| Discovery/Demo | 20% |
| Proposal | 50% |
| Negotiation | 75% |
| Verbal Commit | 90% |

**Important nuance:** Raw coverage (unweighted) can mask problems. A pipeline that is 5x but 80% sits in Qualification is weaker than a 3x pipeline balanced across stages.

### Stage Distribution

A healthy pipeline resembles a funnel: more deals at the top, fewer (but higher-value and higher-probability) at the bottom. Pathological distributions signal systemic problems.

**Top-Heavy Pipeline** (too many deals in early stages):
- Symptom: 70%+ of deals in Qualification or Discovery
- Cause: Reps generating interest but failing to advance deals
- Risk: Forecast will miss because early-stage deals have low close probability
- Action: Investigate qualification criteria, discovery call effectiveness, demo conversion

**Bottom-Heavy Pipeline** (too many deals in late stages):
- Symptom: 60%+ of deals in Proposal, Negotiation, or Close
- Cause: Reps not generating enough new pipeline; living on existing deals
- Risk: Next quarter will be empty; current deals may be zombie deals that never close
- Action: Mandate prospecting activity targets; audit late-stage deal freshness

**Hourglass Pipeline** (thin middle):
- Symptom: Many deals in Qualification and Negotiation, few in Discovery/Demo/Proposal
- Cause: Qualification criteria too loose (letting unqualified deals in) combined with deals that skip stages
- Risk: Forecast unreliable; deals in late stages may not be properly qualified
- Action: Enforce stage exit criteria; require completed milestones before stage advancement

**Target distribution** (varies by sales cycle, but a reasonable B2B SaaS benchmark):

| Stage | % of Total Deals |
|-------|-----------------|
| Qualification | 30-35% |
| Discovery/Demo | 25-30% |
| Proposal | 20-25% |
| Negotiation | 10-15% |
| Close | 5-10% |

### Age Analysis

Track how long deals spend in each stage and compare against benchmarks. Deals that exceed the average by a significant margin are likely stalled.

**Stage age benchmarks** (B2B SaaS, mid-market, adapt to your sales cycle):

| Stage | Healthy | Warning | Critical |
|-------|---------|---------|----------|
| Qualification | 1-7 days | 8-14 days | 15+ days |
| Discovery/Demo | 5-14 days | 15-21 days | 22+ days |
| Proposal | 3-10 days | 11-21 days | 22+ days |
| Negotiation | 5-14 days | 15-30 days | 31+ days |
| Close | 1-7 days | 8-14 days | 15+ days |

**Total cycle benchmarks** (creation to close-won):

| Segment | Typical Cycle | Healthy Range |
|---------|--------------|---------------|
| SMB (<$10K ACV) | 14-30 days | Up to 45 days |
| Mid-Market ($10-100K ACV) | 30-90 days | Up to 120 days |
| Enterprise ($100K+ ACV) | 90-180 days | Up to 270 days |

### Velocity

Pipeline velocity measures how quickly revenue moves through the pipeline. It combines deal count, win rate, average deal size, and cycle length into a single throughput metric.

**Formula:**

```
Pipeline Velocity = (Number of Deals x Win Rate x Average Deal Value) / Average Sales Cycle (days)
```

**Example:**
- 50 deals in pipeline
- 25% win rate
- $20,000 average deal value
- 60-day average sales cycle

```
Velocity = (50 x 0.25 x $20,000) / 60 = $4,167/day
```

**Using velocity:** Track velocity weekly. A declining trend means future revenue is at risk even if the pipeline value looks stable. Velocity is the leading indicator; closed-won revenue is the lagging indicator.

**Improving velocity:** Any of the four levers can be pulled:
- Increase deal count (more pipeline generation)
- Increase win rate (better qualification, better selling)
- Increase deal size (upsell, multi-product, better targeting)
- Decrease cycle length (remove friction, improve buyer experience)

### Win Rate

Win rate segmented by multiple dimensions reveals where the team is strong and where it struggles.

**Dimensions to segment:**

| Dimension | What It Reveals |
|-----------|----------------|
| By stage | Where deals die -- early (qualification problem) or late (closing problem) |
| By rep | Individual performance gaps and strengths |
| By deal size | Whether the team can sell large and small deals equally well |
| By segment/industry | Product-market fit signals by vertical |
| By source | Which channels produce deals that actually close |
| By competitor | Win/loss patterns against specific competitors |

**Benchmarks** (B2B SaaS):

| Metric | Below Average | Average | Above Average |
|--------|--------------|---------|---------------|
| Overall win rate | < 15% | 15-25% | 25-35% |
| Qualified-to-close | < 25% | 25-40% | 40-55% |
| Proposal-to-close | < 40% | 40-60% | 60-75% |

### Health Score Formula

The pipeline health score is a weighted composite on a 0-100 scale.

**Formula:**

```
Health Score = (Coverage Score x 0.25) + (Distribution Score x 0.20) +
              (Age Score x 0.20) + (Velocity Score x 0.20) + (Win Rate Score x 0.15)
```

**Component scoring (each 0-100):**

| Component | Score 90-100 | Score 60-89 | Score 30-59 | Score 0-29 |
|-----------|-------------|-------------|-------------|------------|
| Coverage | 3.5-4.5x | 2.5-3.5x or 4.5-5.5x | 2-2.5x or 5.5x+ | < 2x |
| Distribution | Within 5pp of target per stage | Within 10pp | Within 20pp | >20pp deviation |
| Age | 80%+ deals within healthy range | 60-80% healthy | 40-60% healthy | <40% healthy |
| Velocity | Trending up or stable (4+ weeks) | Stable (2-4 weeks) | Flat or slight decline | Declining 3+ weeks |
| Win Rate | Above team/industry benchmark | At benchmark | 10-20% below benchmark | >20% below benchmark |

**Interpreting the score:**

| Score Range | Label | Implication |
|-------------|-------|-------------|
| 85-100 | Excellent | Pipeline supports quota attainment with margin |
| 70-84 | Healthy | On track; monitor for emerging risks |
| 55-69 | Moderate | Action needed; specific areas require intervention |
| 40-54 | At Risk | Multiple issues; risk of missing quota |
| 0-39 | Critical | Immediate intervention required across pipeline |

## Deal Risk Flagging Rules

Every deal in the pipeline is evaluated against a set of risk rules. A deal can trigger multiple rules simultaneously. Risk severity is determined by the highest-severity rule triggered.

### Stale Deals

A deal is stale when no meaningful activity (email, call, meeting, note update) has occurred within the expected cadence for its stage.

| Stage | Expected Activity Cadence | Stale After |
|-------|--------------------------|-------------|
| Qualification | Every 2-3 days | 5 days no activity |
| Discovery/Demo | Every 3-5 days | 7 days no activity |
| Proposal | Every 2-3 days | 5 days no activity |
| Negotiation | Every 1-2 days | 4 days no activity |
| Close | Daily | 3 days no activity |

**Severity escalation:**

| Days Past Stale Threshold | Severity |
|--------------------------|----------|
| 1-3 days | Medium |
| 4-7 days | High |
| 8+ days | Critical |

**Recommended actions:**
- Medium: Send a value-add touchpoint (relevant article, case study, industry insight)
- High: Direct outreach to champion with a specific ask or new information
- Critical: Executive-level re-engagement or qualification review (should this deal still be in the pipeline?)

### Missing Milestones

Deals should achieve specific milestones by certain stages. Missing milestones indicate the deal may not be as advanced as the stage suggests.

| Milestone | Expected By Stage | Risk If Missing |
|-----------|------------------|----------------|
| Champion identified | Discovery | High -- no internal advocate to drive buying process |
| Pain point validated | Discovery | High -- solution may not map to real need |
| Budget confirmed | Proposal | High -- deal may stall on procurement |
| Decision criteria documented | Proposal | Medium -- unclear how buyer will evaluate |
| Technical validation complete | Proposal | Medium -- technical blocker may surface late |
| Decision maker engaged | Negotiation | Critical -- champion alone cannot sign |
| Pricing discussed | Negotiation | High -- no anchor means surprises at close |
| Legal/procurement timeline known | Negotiation | Medium -- close date is a guess |
| Mutual action plan agreed | Negotiation | Medium -- no shared commitment to close |

**Scoring:** Count the number of milestones missing relative to the current stage. Each missing milestone adds risk.

- 0 missing: No risk from milestones
- 1 missing: Medium risk
- 2 missing: High risk
- 3+ missing: Critical risk

### Engagement Decay

Engagement decay detects deals where buyer responsiveness is declining, even if activity is technically occurring.

**Signals:**

| Signal | Detection Method | Severity |
|--------|-----------------|----------|
| Response time increasing | Average reply time this week vs. last 2 weeks | Medium (2x slower) to High (3x+ slower) |
| Meetings being rescheduled | 2+ reschedules in a row | High |
| Meetings being cancelled | Any cancellation without immediate rebook | Critical |
| Shorter meetings | Meeting duration declining 30%+ | Medium |
| Fewer attendees | Stakeholders dropping off calls | High |
| One-way communication | 3+ unanswered outreach attempts | Critical |

**Recommended actions:**
- Medium: Change communication channel or approach; offer something new (demo of different feature, reference customer intro)
- High: Reach out to a different stakeholder; ask champion directly about internal obstacles
- Critical: Direct conversation about deal viability; propose a mutual "go/no-go" checkpoint

### Single-Threaded Deals

A deal is single-threaded when only one contact at the buyer organization is engaged. This creates existential risk: if that person changes roles, goes on leave, or leaves the company, the deal dies.

**Risk assessment:**

| Contacts Engaged | Risk Level |
|-----------------|------------|
| 1 contact | Critical |
| 2 contacts, same department | High |
| 2 contacts, different departments | Medium |
| 3+ contacts, including decision maker | Low |

**Multi-threading targets by deal size:**

| Deal Size | Minimum Contacts | Target Contacts |
|-----------|-----------------|-----------------|
| < $25K ACV | 2 | 3 |
| $25K-$100K ACV | 3 | 5 |
| $100K+ ACV | 5 | 7+ |

**Recommended actions:**
- Request introductions to other stakeholders through existing champion
- Invite relevant personas to upcoming meetings (technical evaluation, business case review)
- Host a multi-stakeholder workshop or value assessment session
- Connect executive sponsors (your leadership to their leadership)

### Stuck Stage

A deal is stuck when it has been in its current stage significantly longer than the average for deals of similar size and segment.

**Calculation:**

```
Stuck Score = Days in Current Stage / Average Days in Stage (for comparable deals)
```

| Stuck Score | Risk Level |
|-------------|------------|
| 1.0-1.5x | Low (within normal variance) |
| 1.5-2.0x | Medium (monitor closely) |
| 2.0-3.0x | High (likely blocked; investigate) |
| 3.0x+ | Critical (probable zombie deal) |

**Common blockers by stage:**

| Stage | Common Blockers |
|-------|----------------|
| Qualification | Prospect not responding; unclear fit; contact is not decision-maker |
| Discovery | Cannot get key stakeholders on a call; pain not compelling enough |
| Proposal | Internal priorities shifted; budget cycle mismatch; competing project |
| Negotiation | Legal review delays; procurement process; internal champion resistance |
| Close | Signature authority unavailable; last-minute objections; buyer remorse |

### Risk Severity Summary

| Severity | Definition | Expected Response Time |
|----------|-----------|----------------------|
| Critical | Deal is in immediate danger of being lost | Action today |
| High | Significant risk that will worsen without intervention | Action this week |
| Medium | Potential risk; early warning signal | Monitor; act if it escalates |
| Low | Minor concern; within normal variance | Watch in next review |

**Aggregation:** When a deal triggers multiple risk rules, use the highest severity as the deal's overall risk level. Additionally, flag deals that trigger 3+ rules at any severity as "compound risk" -- these deserve special attention regardless of individual rule severity.

## Stage-to-Stage Conversion Analysis

Conversion analysis reveals where deals advance, where they stall, and where they die. This is the diagnostic tool for understanding pipeline health at a structural level.

### Conversion Rate by Stage Pair

Measure the percentage of deals that advance from each stage to the next.

**Calculation:**

```
Conversion Rate (Stage A → Stage B) = Deals entering Stage B / Deals that were in Stage A
```

**Benchmark conversion rates** (B2B SaaS, mid-market):

| Stage Transition | Below Average | Average | Above Average |
|-----------------|--------------|---------|---------------|
| Qualification → Discovery | < 50% | 50-65% | 65-80% |
| Discovery → Proposal | < 40% | 40-55% | 55-70% |
| Proposal → Negotiation | < 50% | 50-65% | 65-80% |
| Negotiation → Close-Won | < 55% | 55-70% | 70-85% |
| Overall (Qualification → Close-Won) | < 10% | 10-25% | 25-35% |

**Reading the data:**
- A steep drop at any transition indicates a systemic problem at that stage
- Compare the team's conversion rates against these benchmarks to identify the weakest link
- The weakest transition is the highest-leverage coaching opportunity

### Conversion Rate by Rep

Compare individual rep conversion rates to the team average at each stage transition.

**Analysis template:**

| Rep | Qual → Disc | Disc → Prop | Prop → Neg | Neg → Close | Overall |
|-----|------------|------------|-----------|-------------|---------|
| Rep A | 70% | 55% | 60% | 75% | 17% |
| Rep B | 65% | 35% | 70% | 80% | 13% |
| Rep C | 55% | 50% | 45% | 65% | 8% |
| Team Avg | 63% | 47% | 58% | 73% | 13% |

**Interpretation:**
- **Rep B** converts Discovery to Proposal at 35% vs. team average 47%. This is the specific skill gap to coach on (likely demo effectiveness or value articulation).
- **Rep C** is below average across most transitions but especially weak at Proposal to Negotiation (45% vs. 58%). Investigate proposal quality and objection handling.
- **Rep A** is above average everywhere -- study their approach for team enablement content.

### Conversion Rate by Deal Size

Large and small deals often behave very differently in the pipeline.

| Deal Size | Qual → Disc | Disc → Prop | Prop → Neg | Neg → Close |
|-----------|------------|------------|-----------|-------------|
| SMB (<$10K) | 70% | 55% | 65% | 75% |
| Mid-Market ($10-50K) | 60% | 45% | 55% | 70% |
| Enterprise ($50K+) | 50% | 40% | 50% | 65% |

**Key insight:** Enterprise deals convert at lower rates at every stage but close at higher values. If your team is pushing enterprise deals through the same process as SMB, conversion will suffer. Enterprise deals require more stakeholders, longer evaluations, and different milestone expectations.

### Conversion Rate by Source

Track how deals from different sources move through the pipeline.

| Source | Qualification Rate | Overall Win Rate | Avg Deal Size | Avg Cycle |
|--------|-------------------|-----------------|---------------|-----------|
| Inbound (website) | High volume, lower qualification rate | 15-20% | Smaller | Shorter |
| Outbound (prospecting) | Lower volume, higher qualification rate | 20-30% | Larger | Longer |
| Referral | Moderate volume, high qualification rate | 30-50% | Varies | Shorter |
| Partner | Variable | 25-35% | Larger | Variable |
| Event/Conference | High volume, lower qualification | 10-15% | Varies | Longer |

**Strategic implications:**
- If referral deals close at 2-3x the rate of other sources, invest in referral programs
- If outbound deals are larger but slower, adjust forecasting models for those deals
- If inbound deals have high volume but low win rate, tighten qualification criteria at intake

## Pipeline Review Template

Use this structure for consistent daily and weekly pipeline reviews. Consistency in format allows patterns to emerge over time.

### Daily Pipeline Review (15 minutes)

#### 1. Executive Summary

```
Pipeline Health Score: [0-100] ([Excellent/Healthy/Moderate/At Risk/Critical])
Total Pipeline Value: $X.XM (weighted: $X.XM)
Coverage Ratio: X.Xx (target: 3-4x)
Deals at Risk: X of Y total ([Critical: N] [High: N] [Medium: N])
Expected Closes This Period: X deals, $XXK value
Change Since Yesterday: +/- X deals, +/- $XXK value
```

#### 2. Stage Breakdown

```
| Stage          | Count | Value    | Avg Age | Conv. Rate | vs. Benchmark |
|----------------|-------|----------|---------|------------|---------------|
| Qualification  | XX    | $XXK     | X days  | XX%        | [+/-]         |
| Discovery/Demo | XX    | $XXK     | X days  | XX%        | [+/-]         |
| Proposal       | XX    | $XXK     | X days  | XX%        | [+/-]         |
| Negotiation    | XX    | $XXK     | X days  | XX%        | [+/-]         |
| Close          | XX    | $XXK     | X days  | XX%        | [+/-]         |
| TOTAL          | XX    | $X.XM    | X days  | XX%        |               |
```

#### 3. Risk Report

For each flagged deal, provide:

```
DEAL: [Company Name] - [Deal Value] - [Current Stage] - [Days in Stage]
SEVERITY: [Critical / High / Medium]
RISK FACTORS:
  - [Risk rule triggered] ([details])
  - [Risk rule triggered] ([details])
RECOMMENDED ACTION: [Specific, actionable next step]
OWNER: [Rep Name]
```

Sort by severity (Critical first), then by deal value (largest first).

#### 4. Wins and Losses This Period

```
WINS:
  - [Company] - $XXK - [Days to close] - [Source] - [Rep]
  - Key factor: [What drove the win]

LOSSES:
  - [Company] - $XXK - [Stage lost at] - [Source] - [Rep]
  - Key factor: [What caused the loss]
  - Lesson: [What to do differently]
```

#### 5. Coaching Insights

```
PATTERN: [Description of pattern observed]
AFFECTED: [Rep(s) or deal type(s)]
ROOT CAUSE: [Hypothesis for why this is happening]
RECOMMENDATION: [Specific coaching action]
DEALS TO WATCH: [Specific deals where this pattern applies]
```

### Weekly Deep Analysis (30 minutes, supplements daily review)

In addition to the daily review sections, the weekly analysis adds:

- **Velocity trend:** Compare this week's velocity to trailing 4-week average
- **Forecast accuracy:** Compare last week's forecast to actual outcomes
- **Pipeline generation:** New pipeline created this week vs. pipeline consumed (won or lost)
- **Rep scorecards:** Individual health scores, conversion rates, velocity
- **Aging deals audit:** Review all deals older than 2x average cycle length

## Coaching Insights from Pipeline Data

Pipeline data is a coaching goldmine. The key is translating data patterns into specific, actionable coaching conversations.

### Rep-Level Pattern Detection

Analyze each rep's pipeline data to identify their specific strengths and weaknesses.

**Pattern: Slow Stage Advancement**

| Signal | What It Means | Coaching Focus |
|--------|--------------|----------------|
| Slow Qualification | Rep is not disqualifying fast enough | Teach qualification frameworks (budget, authority, need, timeline); practice saying "no" to bad-fit prospects |
| Slow Discovery → Proposal | Demos are not converting | Review demo recordings; ensure demos address stated pain points, not generic features; practice value articulation |
| Slow Proposal → Negotiation | Proposals are not compelling or not being followed up | Review proposal content; teach proposal follow-up cadence; practice objection handling |
| Slow Negotiation → Close | Deals stall in legal/procurement or rep lacks closing skills | Teach negotiation techniques; build mutual action plans; practice closing conversations |

**Pattern: Low Conversion at Specific Stage**

When a rep's conversion rate at a specific stage is 15+ percentage points below team average, that stage represents their highest-leverage coaching opportunity.

**Coaching approach:**
1. Show the data: "Your Discovery-to-Proposal conversion is 35% vs. team average of 50%."
2. Listen for context: There may be legitimate reasons (different deal types, territory challenges).
3. Identify root cause: Shadow calls, review recordings, examine deal notes.
4. Prescribe specific practice: Role-play the critical moments, provide frameworks, pair with a high performer.
5. Set a measurable target: "Let's get Discovery-to-Proposal to 45% over the next 6 weeks."

### Deal-Type Pattern Detection

Some reps excel with certain deal types and struggle with others.

**Dimensions to analyze:**

| Dimension | Pattern Example | Coaching Implication |
|-----------|----------------|---------------------|
| Deal size | Wins SMB but loses enterprise | Needs enterprise selling skills: multi-threading, exec engagement, longer nurture |
| Industry | Strong in tech, weak in healthcare | Needs industry-specific knowledge, case studies, and talk tracks for weak verticals |
| Source | Closes referrals but loses outbound | Outbound approach may be too transactional; needs consultative selling for cold prospects |
| Competitor | Wins against Competitor A, loses to Competitor B | Needs competitive positioning for Competitor B: battle cards, differentiators, trap-setting questions |
| Buying committee | Wins with technical buyers, loses with business buyers | Needs to translate technical value into business outcomes; practice ROI conversations |

### Recommended Interventions by Pattern

| Pattern | Intervention | Format | Duration |
|---------|-------------|--------|----------|
| Low qualification rate | Qualification framework workshop | Group training + role-play | 2 hours |
| Poor demo conversion | Demo teardown sessions (review recordings as a team) | Group coaching | 1 hour/week for 4 weeks |
| Weak proposals | Proposal template + peer review process | Process change + 1:1 review | Ongoing |
| Stalled negotiations | Negotiation skill building + mutual action plan template | Workshop + coaching | 2 hours + weekly 1:1 |
| Single-threaded deals | Multi-threading playbook + account mapping exercise | Workshop + deal review | 2 hours + weekly check |
| Enterprise selling gap | Enterprise deal strategy sessions | 1:1 coaching on active deals | Weekly 30 min for 8 weeks |
| Industry knowledge gap | Industry deep-dive + customer reference calls | Self-study + facilitated calls | 2 weeks |

### Tracking Improvement Over Time

Coaching is only effective if it produces measurable results. Track these metrics for each coaching initiative:

**Before/after comparison:**
- Conversion rate at the target stage (primary metric)
- Average days in the target stage (secondary metric)
- Deal velocity for the coached rep vs. team (tertiary metric)

**Timeline expectations:**
- Behavioral change should be visible in 2-4 weeks (are they doing the new thing?)
- Metric improvement should follow in 4-8 weeks (is the new behavior producing results?)
- If no improvement after 8 weeks, revisit the diagnosis (was the root cause correct?)

**Coaching cadence:**
- Weekly 1:1 pipeline review with data-driven coaching (15-30 minutes)
- Monthly skill-building session on the team's weakest conversion point (1 hour)
- Quarterly pipeline retrospective -- what did the data say, what did we do, what improved (1 hour)

## Input/Output Contract

### Inputs

**Primary Input: CRM Pipeline Export**

A structured dataset of all open deals with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| deal_id | string | Yes | Unique deal identifier |
| deal_name | string | Yes | Company or opportunity name |
| deal_value | number | Yes | Total deal value (ACV or TCV) |
| stage | string | Yes | Current pipeline stage |
| stage_entered_date | date | Yes | Date the deal entered the current stage |
| created_date | date | Yes | Date the deal was created |
| last_activity_date | date | Yes | Date of most recent activity (email, call, meeting, note) |
| owner | string | Yes | Rep name or ID |
| source | string | Recommended | Lead source (inbound, outbound, referral, partner, event) |
| contacts | list | Recommended | List of engaged contacts with roles |
| champion_identified | boolean | Recommended | Whether a champion has been identified |
| decision_maker_engaged | boolean | Recommended | Whether a decision maker has been engaged |
| next_step | string | Recommended | Documented next step |
| close_date | date | Recommended | Expected close date |
| segment | string | Optional | Deal segment (SMB, mid-market, enterprise) |
| industry | string | Optional | Buyer's industry |
| competitor | string | Optional | Known competitor in the deal |
| milestones | object | Optional | Milestone completion flags |
| notes | string | Optional | Latest deal notes |

**Secondary Input: Historical Closed Deals**

For benchmark calculation, provide closed deals (won and lost) from the past 6-12 months with the same fields plus:

| Field | Type | Description |
|-------|------|-------------|
| outcome | string | Won or Lost |
| close_date_actual | date | Actual close date |
| loss_reason | string | Reason for loss (if lost) |
| stage_history | list | Dates of each stage transition |

**Tertiary Input: Quota Targets**

| Field | Type | Description |
|-------|------|-------------|
| rep | string | Rep name or ID |
| quota_period | string | Period (e.g., Q1 2026) |
| quota_value | number | Target quota for the period |

**Alternative: Manual Deal List**

If CRM export is unavailable, provide a structured list of deals with at minimum: deal name, value, stage, days in stage, last activity date, and owner.

### Outputs

**1. Pipeline Health Report (Structured Markdown)**

Following the Pipeline Review Template above. Includes executive summary, stage breakdown, risk report, wins/losses, and coaching insights.

**2. Deal Risk Flags**

For each flagged deal:
- Deal identifier and key details
- Risk severity (Critical / High / Medium / Low)
- Triggered rules with specifics
- Recommended action

**3. Stage Conversion Analysis**

Conversion rates by stage pair, by rep, by deal size, and by source. Includes comparison to benchmarks and trend data.

**4. Coaching Insights**

Rep-level patterns, deal-type patterns, recommended interventions, and improvement tracking data.

### External Actions

Based on analysis results, the following actions can be triggered:

| Action | Trigger | Target System |
|--------|---------|--------------|
| Send daily pipeline report | Daily review complete | Messaging platform (team channel) |
| Send individual risk alerts | Critical-severity deal flagged | Messaging platform (direct message to deal owner) |
| Update deal risk fields | Risk flags calculated | CRM (custom risk field on deal record) |
| Schedule coaching 1:1 | Rep pattern detected (15+ pp below team avg) | Calendar platform |
| Create follow-up tasks | At-risk deal with recommended action | CRM or task management platform |
| Update forecast | Pipeline health score calculated | Business intelligence tool or spreadsheet |
| Flag zombie deals | Deals at 3x+ average cycle length | CRM (tag for pipeline hygiene review) |

## Quick Reference

### Health Score Formula

```
Health Score = (Coverage x 0.25) + (Distribution x 0.20) + (Age x 0.20) +
              (Velocity x 0.20) + (Win Rate x 0.15)
```

Each component scored 0-100. Overall score: 85+ Excellent, 70-84 Healthy, 55-69 Moderate, 40-54 At Risk, <40 Critical.

### Risk Flag Rules Cheat Sheet

| Rule | Trigger | Severity |
|------|---------|----------|
| Stale deal | No activity past stage cadence | Medium → High → Critical (escalates with time) |
| Missing milestones | 1+ expected milestones not completed | Medium (1), High (2), Critical (3+) |
| Engagement decay | Response times 2x+ slower, meetings rescheduled/cancelled | Medium → High → Critical |
| Single-threaded | Only 1 contact engaged | Critical |
| Stuck stage | 2x+ average time in stage | Medium (1.5x), High (2x), Critical (3x+) |
| Compound risk | 3+ rules triggered on same deal | Elevate regardless of individual severity |

### Benchmark Conversion Rates (B2B SaaS Mid-Market)

| Transition | Average |
|-----------|---------|
| Qualification → Discovery | 50-65% |
| Discovery → Proposal | 40-55% |
| Proposal → Negotiation | 50-65% |
| Negotiation → Close-Won | 55-70% |
| Overall Win Rate | 15-25% |

### Daily Review Checklist

1. Pull current pipeline data from CRM
2. Calculate health score (coverage, distribution, age, velocity, win rate)
3. Run risk flags against all open deals
4. Sort flagged deals by severity, then by value
5. For each Critical/High deal: write specific recommended action
6. Note wins and losses since last review with key takeaways
7. Identify one coaching insight from the data
8. Distribute report to team via messaging platform
9. Update CRM risk fields for flagged deals
10. Create follow-up tasks for Critical-severity deals
