---
name: abm-strategy
description: Account-based marketing frameworks for target account selection, tiering,
  and campaign orchestration. Covers 1:1 strategic, 1:few cluster, and 1:many programmatic
  ABM tiers with intent data analysis and buying committee mapping. Use when designing
  ABM programs, selecting target accounts, mapping buying committees, analyzing intent
  data, or when user mentions ABM, account-based marketing, target accounts, buying
  committee, or intent data.
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
    - references/account-tier-template.md
    assets: []
  difficulty: advanced
  domain: marketing
  examples:
  - title: "Design 3-Tier ABM Program"
    input: "Design an ABM program for a cybersecurity company targeting enterprise accounts"
    output: "3-tier program: Tier 1 (1:1) top 10 accounts with custom content, executive dinners, dedicated SDRs. Tier 2 (1:few) 30 accounts in 3 industry clusters with shared webinars and vertical content. Tier 3 (1:many) 100 accounts with programmatic ads and intent-triggered sequences. Intent signals: 6sense, Bombora, G2 research activity."
  featured: false
  frequency: Monthly during ABM planning cycles
  orchestrated-by: []
  related-agents:
  - abm-strategist
  - demand-gen-specialist
  related-commands: []
  related-skills:
  - marketing-team/icp-modeling
  - marketing-team/lead-scoring
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: abm-strategy
  tags:
  - abm
  - account-based-marketing
  - intent-data
  - account-scoring
  - account-penetration
  - buying-committee
  tech-stack:
  - 6sense
  - Demandbase
  - Bombora
  - Terminus
  - RollWorks
  - G2
  time-saved: 4-6 hours per ABM campaign planning cycle
  title: ABM Strategy Skill
  updated: 2026-03-04
  use-cases:
  - Designing multi-tier ABM programs (1:1, 1:few, 1:many)
  - Selecting and scoring target accounts using intent data
  - Mapping buying committees for strategic accounts
  - Measuring ABM campaign effectiveness and account penetration
  verified: true
  version: v1.0.0
---

# ABM Strategy

## Overview

Frameworks and methodologies for designing and executing account-based marketing programs. This skill covers the full ABM lifecycle: target account selection and tiering across three program types (1:1 strategic, 1:few cluster, 1:many programmatic), buying committee mapping, intent data analysis, and account-level engagement measurement.

**Core Value:** Shift from lead-centric demand generation to account-centric engagement that concentrates resources on accounts most likely to convert, increasing deal size and win rate.

**Scope boundary:** This skill focuses on *ABM strategy and program design* — how to select accounts, design tier-appropriate plays, and measure account engagement. For customer profile definition (who fits your ICP), see `icp-modeling`. For lead-level scoring (individual scoring within accounts), see `lead-scoring`. For broader demand generation strategy, see `marketing-demand-acquisition`.

## Core Capabilities

- **ABM Tier Design** — Three-tier framework: 1:1 strategic (top accounts, fully personalized), 1:few cluster (industry/segment groups), 1:many programmatic (scaled intent-based)
- **Target Account Selection** — Multi-criteria scoring combining ICP fit, intent signals, and existing engagement to select and prioritize accounts
- **Account Scoring** — Composite scoring framework: ICP fit (40%) + intent signals (30%) + existing engagement (30%)
- **Intent Data Analysis** — Monitoring and interpreting intent signals from providers (Bombora, 6sense, G2) to identify accounts actively researching your category
- **Buying Committee Mapping** — Identifying and categorizing stakeholders: Champion, Decision Maker, Technical Influencer, Business Influencer, Blocker, End User
- **ABM Campaign Orchestration** — Designing tier-appropriate plays with coordinated touchpoints across marketing and sales
- **Account Penetration Tracking** — Measuring stakeholder coverage, engagement depth, and multi-threading progress per account
- **ABM Metrics & Reporting** — Account-level metrics: penetration score, engagement score, pipeline influence, cost per engaged account, program ROAS

## Quick Start

1. Define your ABM tiers — how many accounts per tier, what resources per tier
2. Select target accounts using ICP scores, intent signals, and sales input
3. Map buying committees for Tier 1 accounts (5-8 stakeholders per account)
4. Design tier-specific plays using the template in `references/account-tier-template.md`
5. Measure account engagement weekly, optimize tier assignments monthly

## Key Workflows

### 1. Design 3-Tier ABM Program

**Time:** 2-3 weeks for initial design

1. **Define tier structure:**
   - **Tier 1 (1:1 Strategic):** 5-15 accounts. Fully personalized content, dedicated SDR, executive engagement, custom events. Budget: 40-50% of ABM spend on 10% of accounts.
   - **Tier 2 (1:few Cluster):** 15-50 accounts grouped in 3-5 clusters by industry, use case, or company stage. Shared but targeted content per cluster. Budget: 30-35% of spend.
   - **Tier 3 (1:many Programmatic):** 50-200 accounts. Programmatic ads, intent-triggered email, scaled retargeting. Budget: 15-25% of spend.

2. **Set tier criteria:**
   - Tier 1: ACV potential $250K+, ICP score 85+, active intent or existing relationship
   - Tier 2: ACV potential $50-250K, ICP score 70+, industry cluster alignment
   - Tier 3: ACV potential $25-50K, ICP score 60+, intent signals present

3. **Define per-tier resource allocation:**
   - Tier 1: 1 SDR per 3-5 accounts, custom content creation, executive sponsor assigned
   - Tier 2: 1 SDR per 10-15 accounts, cluster content shared, group events
   - Tier 3: Automated sequences, programmatic ads, no dedicated SDR

4. **Design channel mix per tier:**
   - Tier 1: Direct mail, executive dinners, custom demos, personalized landing pages, 1:1 LinkedIn outreach
   - Tier 2: Industry webinars, vertical case studies, cluster emails, LinkedIn Sponsored Content
   - Tier 3: Display ads (Demandbase/RollWorks), intent-triggered email, retargeting, content syndication

5. **Set measurement framework:** Account penetration, engagement score, pipeline influence, cost per engaged account

### 2. Select & Score Target Accounts

**Time:** 1-2 weeks

1. **Build account universe** — Pull ICP-scored accounts from CRM (minimum 200 for meaningful tiering)
2. **Layer intent data:**
   - Bombora: Topic surge scores for your category keywords
   - 6sense: Buying stage predictions (awareness → consideration → decision)
   - G2: Category research activity, competitor comparisons, review reads
3. **Calculate composite score:**
   - ICP Fit (40%): From gtm-strategist ICP scoring model
   - Intent (30%): Normalized intent score from providers (high/medium/low → 10/6/2)
   - Engagement (30%): Existing CRM activity (meetings, emails, content downloads)
4. **Rank and assign tiers** based on composite score thresholds
5. **Validate with sales** — Present tier assignments, gather relationship intelligence, adjust

### 3. Map Buying Committee

**Time:** 2-3 days per Tier 1 account

Map the buying committee to enable multi-threaded engagement:

1. **Identify stakeholders** — Use LinkedIn, CRM data, org charts to find 5-8 relevant contacts
2. **Classify roles:**
   - **Champion:** Internal advocate, actively evaluating your solution
   - **Decision Maker:** Budget authority, final sign-off
   - **Technical Influencer:** Evaluates technical fit, runs POC
   - **Business Influencer:** Owns the business case, sponsors the initiative
   - **Blocker:** Concerns about risk, compliance, or competing priorities
   - **End User:** Daily users of the solution, provide adoption feedback
3. **Assess engagement status** per stakeholder:
   - Engaged (meeting held, active conversation)
   - Aware (knows about you, no direct engagement)
   - Unknown (identified but not contacted)
4. **Create coverage plan** — Assign specific actions per stakeholder to achieve multi-threaded coverage
5. **Brief SDR** — Provide buying committee map with recommended approach per stakeholder

## ABM vs Traditional Demand Gen

| Dimension | Traditional Demand Gen | Account-Based Marketing |
|-----------|----------------------|------------------------|
| Unit of focus | Individual lead | Account (company) |
| Targeting | Broad audience, persona-based | Named accounts, stakeholder-mapped |
| Content | Generic by persona | Personalized by account or cluster |
| Measurement | Lead volume, MQL count | Account engagement, penetration |
| Sales alignment | Leads tossed over the wall | Joint account planning with sales |
| Funnel | Wide top, narrow bottom | Targeted from start, higher conversion |
| Best for | High-volume, low-ACV | Low-volume, high-ACV enterprise deals |

**Key insight:** ABM is not a replacement for demand gen — it's a complement. Use demand gen for volume and ABM for strategic accounts. Most B2B companies run both simultaneously.

## Python Tools

This skill currently has no Python automation tools. All capabilities are delivered through strategic frameworks and reference templates.

## Best Practices

### Tier Design

- Start with fewer Tier 1 accounts (5-10) rather than too many — quality of engagement matters more than quantity
- Cluster Tier 2 accounts by meaningful similarity (industry, use case, company stage) — not arbitrary groupings
- Review and rebalance tiers quarterly based on engagement data and pipeline results
- Budget allocation should be inversely proportional to account count (most spend on fewest accounts)

### Account Selection

- Always validate tier assignments with sales — they have relationship intelligence you don't
- Intent data is a signal, not a guarantee — combine with ICP fit and engagement for balanced selection
- Include "stretch" accounts in Tier 2 that could become Tier 1 with engagement
- Remove non-responsive Tier 1 accounts after 90 days — don't waste premium resources on cold accounts

### Intent Data

- Use multiple intent providers — no single provider has complete coverage
- Focus on topic-level intent, not just company-level (a company researching "cloud security" vs "HR software" sends very different signals)
- Intent signal recency matters — a surge 2 weeks ago is valuable, 3 months ago is noise
- Combine third-party intent with first-party engagement data for the strongest signal

### Engagement Measurement

- Measure account penetration (stakeholders engaged / buying committee size), not just lead count
- Track engagement velocity (acceleration or deceleration) not just absolute levels
- Multi-threading is the strongest predictor of deal success — 3+ stakeholders engaged significantly increases win rate
- Separate ABM-sourced (first touch from ABM) from ABM-influenced (any ABM touch in journey) metrics

## Reference Guides

**[account-tier-template.md](references/account-tier-template.md)** — Complete ABM tier template with account selection criteria, resource allocation guide, buying committee role definitions, account penetration scorecard, and campaign planning checklist per tier.

## Integration

This skill works best with:
- 6sense (intent data, buying stage predictions, account identification)
- Demandbase (ABM advertising, account intelligence, personalization)
- Bombora (intent data, topic surge scores)
- Terminus (ABM advertising, account analytics)
- RollWorks (ABM advertising, account scoring)
- G2 (buyer intent, category research signals)
- LinkedIn Sales Navigator (stakeholder identification, relationship mapping)

## Additional Resources

- Account Tier Template: [references/account-tier-template.md](references/account-tier-template.md)
- Related Skill: [../icp-modeling/SKILL.md](../icp-modeling/SKILL.md)
- Related Skill: [../lead-scoring/SKILL.md](../lead-scoring/SKILL.md)

---

**Last Updated**: March 2026 | **Version**: 1.0
