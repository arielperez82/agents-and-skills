---
name: lead-scoring
description: Lead scoring frameworks for MQL/SQL/PQL stage definitions, scoring model
  design, and threshold-based lead routing. Covers demographic, firmographic, behavioral,
  and engagement scoring dimensions with score decay and recency weighting. Use when
  designing lead scoring models, defining MQL/SQL thresholds, building lead routing
  rules, or when user mentions lead scoring, MQL, SQL, PQL, lead qualification, or
  scoring model.
license: MIT
metadata:
  author: Claude Skills Team
  compatibility:
    python-version: 3.8+
    platforms:
    - macos
    - linux
    - windows
  contributors: []
  created: 2026-03-04
  dependencies:
    scripts: []
    references:
    - references/scoring-model-template.md
    assets: []
  difficulty: intermediate
  domain: marketing
  examples:
  - title: "Design B2B SaaS Lead Scoring Model"
    input: "Design a lead scoring model for a developer tool company"
    output: "Scoring model with demographic (25%), firmographic (20%), behavioral (35%), engagement (20%) dimensions. MQL threshold: 50+, SQL: 75+. Score decay: -5 per 14 inactive days. Routing: 90+ hot lead (immediate SDR), 75-89 sales-ready (SDR queue), 50-74 nurture (marketing automation), <50 cold (re-engagement or disqualify)."
  featured: false
  frequency: Weekly during pipeline reviews
  orchestrated-by: []
  related-agents:
  - marketing-ops-manager
  - sales-development-rep
  related-commands: []
  related-skills:
  - marketing-team/icp-modeling
  - marketing-team/marketing-automation
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: lead-scoring
  tags:
  - lead-scoring
  - mql
  - sql
  - pql
  - lead-qualification
  - scoring-model
  - lead-routing
  tech-stack:
  - HubSpot
  - Marketo
  - Salesforce
  - Pardot
  - Customer.io
  time-saved: 3-4 hours per scoring model iteration
  title: Lead Scoring Skill
  updated: 2026-03-04
  use-cases:
  - Designing lead scoring models with weighted criteria
  - Defining MQL/SQL/PQL stage transitions
  - Building threshold-based lead routing rules
  - Implementing score decay and recency weighting
  verified: true
  version: v1.0.0
---

# Lead Scoring

## Overview

Frameworks and methodologies for designing lead scoring models that identify sales-ready leads and route them appropriately. This skill covers the full scoring lifecycle: dimension design (demographic, firmographic, behavioral, engagement), threshold definition for stage transitions (MQL/SQL/PQL), score decay for lead freshness, and routing rules that connect scoring to sales workflows.

**Core Value:** Transform subjective lead qualification into data-driven scoring that increases MQL-to-SQL conversion rates and reduces wasted sales effort on unqualified leads.

**Scope boundary:** This skill focuses on *scoring methodology* — how to design, weight, and calibrate scoring models. For customer profile definition (who to target), see `icp-modeling`. For automation workflows that act on scores (nurture sequences, routing logic), see `marketing-automation`.

## Core Capabilities

- **MQL/SQL/PQL Definitions** — Clear stage definitions with measurable transition criteria between Marketing Qualified, Sales Qualified, and Product Qualified leads
- **Demographic Scoring** — Job title, seniority, department, role relevance scoring with weighted rubrics
- **Firmographic Scoring** — Company size, industry, revenue, funding stage, geography scoring aligned with ICP criteria
- **Behavioral Scoring** — Website visits, content downloads, pricing page views, demo requests, product usage activity
- **Engagement Scoring** — Email opens/clicks, webinar attendance, event participation, social interaction frequency
- **Score Decay & Recency** — Time-based score reduction for inactive leads, recency weighting to prioritize recent activity
- **Threshold-Based Routing** — Score ranges mapped to routing rules (hot lead, SQL, MQL, nurture, disqualify)
- **Predictive vs Rule-Based** — Comparison of manual rule-based scoring versus ML-driven predictive scoring approaches

## Quick Start

1. Define your stages — establish clear MQL, SQL, and PQL criteria with measurable thresholds
2. Choose dimensions — select and weight demographic, firmographic, behavioral, and engagement dimensions
3. Build rubric — use the scoring template in `references/scoring-model-template.md` to define point values per signal
4. Set thresholds — define score ranges for routing (hot/warm/nurture/disqualify)
5. Validate — back-test against 6-12 months of conversion data, calibrate with sales feedback

## Key Workflows

### 1. Build Rule-Based Scoring Model

**Time:** 1-2 weeks

1. Analyze last 12 months of closed-won deals — what signals predicted conversion?
2. Select 4 scoring dimensions with weights totaling 100%:
   - Demographic (20-30%): Job title, seniority, department relevance
   - Firmographic (15-25%): Company size, industry, revenue, ICP match
   - Behavioral (30-40%): High-intent actions (pricing page, demo request, free trial)
   - Engagement (15-25%): Email engagement, webinar attendance, content consumption
3. Define point values per signal within each dimension (0-10 scale per criterion)
4. Set composite score thresholds:
   - 90-100: Hot lead (immediate SDR outreach, 1-hour SLA)
   - 75-89: SQL (SDR queue, 24-hour SLA)
   - 50-74: MQL (marketing nurture sequence)
   - 25-49: Cold (long-term drip, re-engagement campaigns)
   - <25: Disqualify (remove from active campaigns)
5. Back-test: Score historical leads, verify high-scoring leads correlate with conversion
6. Deploy in CRM/MAP with automated routing rules
7. Calibrate monthly with sales team feedback on lead quality

### 2. Define Stage Transitions (MQL to SQL to PQL)

**Time:** 3-5 days

Stage transitions define when a lead moves from marketing ownership to sales ownership:

1. **Anonymous → Known** — Form fill, content gate, or product signup (identity captured)
2. **Known → MQL (Marketing Qualified Lead)**
   - Score reaches MQL threshold (typically 50+)
   - At least one behavioral signal (not just demographic/firmographic fit)
   - Criteria: right profile + showing interest
3. **MQL → SQL (Sales Qualified Lead)**
   - Score reaches SQL threshold (typically 75+)
   - High-intent behavioral signal present (demo request, pricing page, free trial)
   - Sales accepts within SLA or provides rejection reason
   - Criteria: right profile + active buying intent
4. **SQL → PQL (Product Qualified Lead)** — for PLG companies
   - Product usage exceeds activation threshold (e.g., 3+ active users, key feature adopted)
   - Usage pattern matches expansion-ready profile
   - Criteria: SQL + demonstrated product value
5. **Rejection handling** — SQL rejected by sales: analyze reason, adjust score, return to nurture or disqualify

Key principle: Stage transitions should be *bidirectional* — leads can regress from SQL back to MQL if they go cold, ensuring sales only works active opportunities.

### 3. Implement Score Decay & Recency Weighting

**Time:** 2-3 days

Score decay prevents stale leads from clogging the pipeline:

1. **Define decay schedule:**
   - 0-14 days inactive: No decay (normal buying cycle pause)
   - 15-30 days: -5 points per week (mild cooling)
   - 31-60 days: -10 points per week (significant cooling)
   - 61-90 days: -15 points per week (going cold)
   - 90+ days: Reset behavioral/engagement scores to 0 (demographic/firmographic preserved)
2. **Apply recency weighting:**
   - Activity in last 7 days: 1.5x multiplier on behavioral scores
   - Activity in last 30 days: 1.0x multiplier (standard)
   - Activity 30-60 days ago: 0.7x multiplier
   - Activity 60+ days ago: 0.3x multiplier
3. **Preserve permanent scores:**
   - Demographic and firmographic scores do not decay (company size doesn't change)
   - Only behavioral and engagement scores decay (intent signals are time-sensitive)
4. **Re-engagement triggers:**
   - When decayed lead re-engages, restore scores with recency bonus
   - Flag re-engaged leads for sales review (previous interest + new activity = high signal)

## Predictive vs Rule-Based Scoring

| Aspect | Rule-Based | Predictive (ML) |
|--------|-----------|-----------------|
| Setup complexity | Low (manual rules) | High (data pipeline, model training) |
| Data requirement | Minimal (50+ deals) | Significant (500+ deals with outcome data) |
| Transparency | High (explicit rules) | Lower (model weights less interpretable) |
| Maintenance | Manual recalibration needed | Auto-updates with new data |
| Accuracy | Good for clear ICP | Better for complex, multi-signal patterns |
| Best for | Early-stage companies, simple ICPs | Scale-stage with large datasets |

**Recommendation:** Start with rule-based scoring. Migrate to predictive when you have 500+ closed deals with full touchpoint data and a data team to maintain the model.

## Python Tools

This skill currently has no Python automation tools. All capabilities are delivered through strategic frameworks and reference templates.

## Best Practices

### Scoring Model Design

- Start simple: 4 dimensions, 10-15 signals total. Add complexity only when validated
- Weight behavioral signals highest (30-40%) — intent matters more than profile fit alone
- Avoid single-signal MQLs: require both profile fit AND behavioral intent for stage transitions
- Keep point values intuitive: demo request (+15) should be worth more than email open (+2)

### Thresholds

- Set initial thresholds conservatively, then loosen based on conversion data
- Review threshold calibration monthly for the first quarter, then quarterly
- Track the distribution of scores — if 80% of leads are MQL, your threshold is too low
- Separate thresholds for inbound vs outbound leads (different intent levels)

### Score Decay

- Always decay behavioral/engagement scores, never demographic/firmographic
- Decay rate should match your sales cycle length (longer cycles = slower decay)
- Re-engaged leads should be flagged, not just re-scored — they represent high-value signals
- Run a monthly "decay audit" to ensure high-intent leads aren't being unfairly decayed

### Routing

- Define SLAs for each score tier (hot lead: 1 hour, SQL: 24 hours, MQL: 48 hours)
- Include rejection handling: sales must provide reason when rejecting scored leads
- Track routing accuracy: what percentage of routed leads are accepted by sales?
- Round-robin within tiers to distribute leads fairly across SDRs

## Reference Guides

**[scoring-model-template.md](references/scoring-model-template.md)** — Complete lead scoring template with dimension weight allocation, scoring rubric per dimension, threshold tier definitions, decay schedule, routing rules, and calibration checklist.

## Integration

This skill works best with:
- HubSpot (lead scoring, workflows, CRM)
- Marketo (scoring programs, engagement programs)
- Salesforce (lead scoring, routing rules, reports)
- Pardot (scoring categories, automation rules)
- Customer.io (behavioral scoring, segments)

## Additional Resources

- Scoring Model Template: [references/scoring-model-template.md](references/scoring-model-template.md)
- Related Skill: [../icp-modeling/SKILL.md](../icp-modeling/SKILL.md)
- Related Skill: [../marketing-automation/SKILL.md](../marketing-automation/SKILL.md)

---

**Last Updated**: March 2026 | **Version**: 1.0
