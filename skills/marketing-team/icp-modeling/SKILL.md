---
name: icp-modeling
description: ICP definition frameworks, enrichment-driven profiling, and scoring models
  for building data-driven ideal customer profiles. Covers firmographic, technographic,
  behavioral, and psychographic criteria. Use when defining ICP, building lead scoring
  models, analyzing closed-won patterns, or when user mentions ideal customer profile,
  ICP, lead scoring, firmographics, or customer profiling.
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
    - references/icp-scoring-template.md
    assets: []
  difficulty: intermediate
  domain: marketing
  examples:
  - title: "Define B2B SaaS ICP"
    input: "Define an ICP for a developer productivity tool targeting mid-market companies"
    output: "ICP with firmographic (200-1000 employees, $10M-$100M ARR), technographic (cloud-native, CI/CD), behavioral (hiring developers, active on GitHub), psychographic (velocity-focused, developer experience priority) criteria. Composite score: 82/100."
  featured: false
  frequency: Weekly during GTM planning
  orchestrated-by: []
  related-agents:
  - gtm-strategist
  - sales-development-rep
  related-commands: []
  related-skills:
  - marketing-team/marketing-strategy-pmm
  - marketing-team/niche-market-strategy
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: icp-modeling
  tags:
  - icp
  - ideal-customer-profile
  - lead-scoring
  - firmographics
  - enrichment
  - customer-profiling
  tech-stack:
  - Clay
  - Clearbit
  - ZoomInfo
  - Apollo
  - HubSpot CRM
  time-saved: 2-3 hours per ICP iteration
  title: ICP Modeling Skill
  updated: 2026-03-04
  use-cases:
  - Defining ideal customer profiles for GTM targeting
  - Building lead scoring models with weighted criteria
  - Analyzing closed-won patterns to refine ICP
  - Enrichment-driven customer profiling using waterfall pattern
  verified: true
  version: v1.0.0
---

# ICP Modeling

## Overview

Frameworks and methodologies for building data-driven ideal customer profiles. This skill covers the full ICP lifecycle: criteria definition across four dimensions (firmographic, technographic, behavioral, psychographic), enrichment-driven data assembly using the Clay waterfall pattern, closed-won pattern analysis, and weighted scoring models.

**Core Value:** Transform intuition-based targeting into data-driven ICP profiles that increase pipeline quality and win rates.

**Scope boundary:** This skill focuses on *profiling methodology* — how to define, score, and refine ICP criteria. For positioning strategy (how to message to those profiles), see `marketing-strategy-pmm`. For market entry strategy (which markets to target), see `niche-market-strategy`.

## Core Capabilities

- **Firmographic Profiling** — Company size, industry, revenue range, geography, funding stage, growth rate
- **Technographic Profiling** — Tech stack analysis, tool usage, infrastructure patterns, technology maturity
- **Behavioral Signals** — Buying signals, content engagement, event attendance, hiring patterns, vendor evaluation activity
- **Psychographic Criteria** — Pain points, priorities, decision-making style, risk tolerance, innovation appetite
- **Waterfall Enrichment** — Clay-style multi-source data assembly: chain 75+ providers to build complete profiles from partial data
- **Closed-Won Pattern Analysis** — Reverse-engineer ICP from winning deals: extract common firmographic, technographic, and behavioral patterns
- **Scoring Models** — Weighted composite scoring (0-100) across all dimensions with configurable weights

## Quick Start

1. Start with closed-won analysis — your best customers define your ICP
2. Define criteria across all 4 dimensions (firmographic, technographic, behavioral, psychographic)
3. Use the scoring template in `references/icp-scoring-template.md` to build a weighted model
4. Validate scores against pipeline data — high-scoring leads should convert at higher rates
5. Refine quarterly based on new closed-won data

## Key Workflows

### 1. Build ICP from Closed-Won Data

**Time:** 1-2 weeks

1. Export last 12 months of closed-won deals from CRM
2. Identify top 20% of deals by ACV and expansion potential
3. Extract firmographic patterns — company size clusters, industry concentrations, geography
4. Extract technographic patterns — common tech stacks, tools, infrastructure
5. Extract behavioral patterns — how they found you, engagement timeline, buying committee size
6. Extract psychographic patterns — stated pain points, decision criteria, buying triggers
7. Weight dimensions by predictive power (which dimensions most differentiate winners from losers)
8. Build scoring model using template
9. Validate: score existing pipeline, check correlation between score and conversion rate
10. Iterate: adjust weights based on new deal data quarterly

### 2. Waterfall Enrichment for Complete Profiles

**Time:** Ongoing (automated)

The waterfall enrichment pattern chains multiple data providers to build complete profiles:

1. **Start with what you have** — email, domain, or company name
2. **Provider 1 (primary)** — Clearbit/Apollo for firmographic basics (company size, industry, revenue)
3. **Provider 2 (technographic)** — BuiltWith/Wappalyzer for tech stack detection
4. **Provider 3 (intent)** — Bombora/6sense for buying intent signals
5. **Provider 4 (social)** — LinkedIn/GitHub for individual behavioral data
6. **Provider 5 (fill gaps)** — ZoomInfo/Cognism for contact data gaps
7. **Deduplicate and merge** — single unified profile from multiple sources
8. **Score against ICP** — apply scoring model to enriched profile
9. **Route** — high scores to sales, medium to nurture, low to disqualify

Key principle: No single provider has complete data. The waterfall pattern ensures coverage by falling through to the next provider when data is missing.

### 3. ICP Scoring Model Design

**Time:** 2-3 days

1. Select dimensions and criteria (from closed-won analysis)
2. Assign weights per dimension (must total 100%):
   - Firmographic: 25-35% (company fit)
   - Technographic: 20-30% (product fit)
   - Behavioral: 20-30% (buying readiness)
   - Psychographic: 10-20% (motivation fit)
3. Define scoring rubric per criterion (0-10 scale):
   - 10 = perfect match to top customers
   - 7-9 = strong match
   - 4-6 = partial match
   - 1-3 = weak match
   - 0 = disqualifying
4. Set thresholds:
   - 80-100 = Tier 1 (ideal, fast-track to sales)
   - 60-79 = Tier 2 (good fit, standard nurture)
   - 40-59 = Tier 3 (marginal, long-term nurture)
   - 0-39 = Disqualify (do not pursue)
5. Test against known good/bad accounts
6. Calibrate with sales team feedback

See `references/icp-scoring-template.md` for the complete scoring template.

## Python Tools

This skill currently has no Python automation tools. All capabilities are delivered through strategic frameworks and reference templates.

## Best Practices

### ICP Definition

- Start with closed-won data, not assumptions
- Include all 4 dimensions (firms miss technographic and behavioral regularly)
- Validate ICP quarterly with new deal data
- Keep criteria specific and measurable (not "large companies" but "500-2000 employees")

### Scoring Models

- Weight dimensions by predictive power, not gut feel
- Test scoring model against historical pipeline before deploying
- Review threshold calibration monthly for the first quarter
- Track score-to-conversion correlation as the key health metric

### Enrichment

- Never rely on a single data provider
- Build waterfall with 3-5 providers minimum
- Update enrichment data every 90 days (companies change)
- Flag enrichment gaps as data quality issues, not scoring issues

## Reference Guides

**[icp-scoring-template.md](references/icp-scoring-template.md)** — Complete ICP scoring template with weighted criteria across all 4 dimensions, rubric definitions, threshold tiers, and calibration guide.

## Integration

This skill works best with:
- Clay (waterfall enrichment orchestration)
- Clearbit/Apollo (firmographic data)
- ZoomInfo/Cognism (contact enrichment)
- HubSpot CRM (deal data, pipeline tracking, lead scoring)
- BuiltWith/Wappalyzer (technographic data)
- Bombora/6sense (intent signals)

## Additional Resources

- ICP Scoring Template: [references/icp-scoring-template.md](references/icp-scoring-template.md)
- Related Skill: [../marketing-strategy-pmm/SKILL.md](../marketing-strategy-pmm/SKILL.md)
- Related Skill: [../niche-market-strategy/SKILL.md](../niche-market-strategy/SKILL.md)

---

**Last Updated**: March 2026 | **Version**: 1.0
