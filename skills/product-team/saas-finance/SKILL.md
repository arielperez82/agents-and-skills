---

# === CORE IDENTITY ===
name: saas-finance
title: SaaS Finance Metrics & Analysis
description: "SaaS finance metrics, pricing, acquisition channels, investment analysis, and business health diagnostics. Consolidates 7 reference guides for PM financial fluency."
domain: product
subdomain: saas-finance

# === WEBSITE DISPLAY ===
difficulty: intermediate
time-saved: "Eliminates hours of metric lookup and financial modeling per decision"
frequency: "Weekly (metrics review), quarterly (health diagnostic, pricing/channel decisions)"
use-cases:
  - Quick lookup of SaaS metric formulas and benchmarks
  - Calculating and interpreting revenue, retention, and growth metrics
  - Evaluating unit economics and capital efficiency
  - Making data-driven pricing change decisions
  - Evaluating acquisition channel viability (scale/test/kill)
  - Assessing feature investment ROI (build/don't build)
  - Running comprehensive business health diagnostics

# === RELATIONSHIPS ===
related-agents:
  - product-director
  - product-manager
  - product-analyst
related-skills:
  - product-team/prioritization-frameworks
  - product-team/product-strategist
related-commands: []
orchestrated-by: []

# === TECHNICAL ===
dependencies:
  references:
    - references/metrics-quickref.md
    - references/revenue-growth-metrics.md
    - references/economics-efficiency-metrics.md
    - references/pricing-advisor.md
    - references/channel-advisor.md
    - references/investment-advisor.md
    - references/business-health-diagnostic.md
compatibility:
  platforms: [macos, linux, windows]

# === EXAMPLES ===
examples:
  - title: Quick Metric Lookup
    input: "What's a healthy LTV:CAC ratio and how do I calculate it?"
    output: "LTV:CAC = LTV / CAC. Healthy: 3:1; <1:1 unsustainable; >5:1 underinvesting. See metrics-quickref.md."
  - title: Business Health Check
    input: "We have $15M ARR, 40% YoY growth, 95% NRR, 3.5:1 LTV:CAC. How are we doing?"
    output: "Moderate health. NRR <100% is a red flag -- base is contracting. Fix retention before scaling. See business-health-diagnostic.md."

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
created: 2026-02-17
updated: 2026-02-17
license: CC-BY-NC-SA-4.0

# === DISCOVERABILITY ===
tags: [saas, finance, metrics, pricing, acquisition, investment, ltv, cac, mrr, arr]
featured: false
verified: true
---

# SaaS Finance Metrics & Analysis

## Purpose

PM financial literacy hub covering four metric families and four decision frameworks. Use this skill when you need to calculate, interpret, or act on SaaS finance metrics -- from quick formula lookups to full business health diagnostics.

**Target Audience:** Product Managers, Product Directors, Product Analysts, and anyone making product decisions that require financial context.

**What this covers:**
- 32+ SaaS metric formulas with benchmarks and red flags
- Revenue, retention, and growth metrics (deep dive)
- Unit economics and capital efficiency metrics (deep dive)
- Pricing change financial impact analysis
- Acquisition channel evaluation (scale/test/kill)
- Feature investment ROI assessment (build/don't build)
- Comprehensive business health diagnostics

## Key Concepts

### Four Metric Dimensions

1. **Revenue & Growth** -- Top-line metrics: MRR/ARR, ARPU/ARPA, churn, NRR, expansion, Quick Ratio, cohort analysis
2. **Unit Economics** -- Customer-level profitability: CAC, LTV, LTV:CAC, payback period, gross margin, contribution margin
3. **Capital Efficiency** -- Cash management: burn rate, runway, OpEx, net income, working capital
4. **Strategic Position** -- Growth vs. profitability balance: Rule of 40, Magic Number, operating leverage, revenue concentration

### Four Decision Frameworks

1. **Should we build this feature?** -- Revenue impact, cost structure, ROI, strategic value
2. **Should we scale this channel?** -- Unit economics, customer quality, scalability, strategic fit
3. **Should we change pricing?** -- ARPU/ARPA impact, conversion, churn risk, NRR, payback
4. **Is the business healthy?** -- Stage-appropriate benchmarks across all four metric dimensions

## Application

### When to Use Which Reference

| Situation | Reference | What You Get |
|-----------|-----------|--------------|
| Need a quick formula or benchmark | [metrics-quickref.md](references/metrics-quickref.md) | Fast lookup table, decision frameworks, red flags |
| Calculating revenue/retention metrics | [revenue-growth-metrics.md](references/revenue-growth-metrics.md) | Formulas, examples, quality checks, common pitfalls |
| Evaluating unit economics or efficiency | [economics-efficiency-metrics.md](references/economics-efficiency-metrics.md) | CAC, LTV, payback, Rule of 40, Magic Number |
| Considering a pricing change | [pricing-advisor.md](references/pricing-advisor.md) | Interactive framework: impact, scenarios, go/no-go |
| Evaluating an acquisition channel | [channel-advisor.md](references/channel-advisor.md) | Interactive framework: scale/test/kill recommendation |
| Deciding whether to build a feature | [investment-advisor.md](references/investment-advisor.md) | Interactive framework: build/don't build with ROI |
| Running a business health check | [business-health-diagnostic.md](references/business-health-diagnostic.md) | Interactive diagnostic: scorecard, red flags, action plan |

### Workflow

1. **Quick check?** Start with `metrics-quickref.md` for formulas and benchmarks.
2. **Need depth?** Use `revenue-growth-metrics.md` or `economics-efficiency-metrics.md` for detailed calculations and examples.
3. **Making a decision?** Use the appropriate advisor (`pricing-advisor.md`, `channel-advisor.md`, `investment-advisor.md`).
4. **Holistic assessment?** Use `business-health-diagnostic.md` for a full health check.

## Consolidated References

| Reference | Description |
|-----------|-------------|
| [metrics-quickref.md](references/metrics-quickref.md) | Fast lookup table for 32+ SaaS metrics with formulas, benchmarks, red flags, and decision frameworks |
| [revenue-growth-metrics.md](references/revenue-growth-metrics.md) | Deep dive on revenue, ARPU/ARPA, MRR/ARR, churn, NRR, expansion, cohort analysis with templates and examples |
| [economics-efficiency-metrics.md](references/economics-efficiency-metrics.md) | Deep dive on CAC, LTV, payback, margins, burn rate, Rule of 40, Magic Number with templates and examples |
| [pricing-advisor.md](references/pricing-advisor.md) | Interactive pricing change evaluator: ARPU impact, churn risk, conversion, NRR, go/no-go recommendations |
| [channel-advisor.md](references/channel-advisor.md) | Interactive acquisition channel evaluator: unit economics, customer quality, scalability, scale/test/kill |
| [investment-advisor.md](references/investment-advisor.md) | Interactive feature investment evaluator: revenue connection, cost structure, ROI, build/don't build |
| [business-health-diagnostic.md](references/business-health-diagnostic.md) | Interactive business health diagnostic: four-dimension scorecard, red flags, prioritized action plan |
