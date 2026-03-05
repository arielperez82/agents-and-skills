# Implementation Plan: I29-GTMSO — GTM Sales Ops & Revenue

**Initiative:** I29-GTMSO
**Date:** 2026-03-05
**Status:** Active
**Scope:** docs-only
**Estimated steps:** 9

## Convention Discovery

Nearest analogs: I27-GTMSI (gtm-strategist agent + marketing-team skills), I28-GTMMC (marketing-ops-manager agent + marketing-team skills). Both follow identical patterns:

- **Agent format:** YAML frontmatter (core identity, use cases, classification, relationships, technical, examples) + markdown body (purpose, skill integration, workflows, success metrics, related agents, references)
- **Skill format:** YAML frontmatter (name, description, domain, related-agents) + markdown body (overview, detailed content, reference files section)
- **Reference files:** Practical templates, checklists, or frameworks in `references/` subdirectory
- **Integration checklist:** Agent README entry, team CLAUDE.md update, cross-references in related agents

## Step 1: Create CRM Ops Skill [B1] — solo
**Files:** `skills/sales-team/crm-ops/SKILL.md`, `skills/sales-team/crm-ops/references/crm-audit-checklist.md`
**Acceptance:** Valid skill with CRM data model, hygiene, integration content + audit checklist reference
**Agent:** docs specialist (orchestrator direct)

## Step 2: Create Pipeline Forecasting Skill [B2] — solo
**Files:** `skills/sales-team/pipeline-forecasting/SKILL.md`, `skills/sales-team/pipeline-forecasting/references/forecast-template.md`
**Acceptance:** Valid skill with forecasting methods, metrics, benchmarks + forecast template reference. Complementary to pipeline-analytics (no overlap).
**Agent:** docs specialist (orchestrator direct)

## Step 3: Create Cadence Design Skill [B3] — solo
**Files:** `skills/sales-team/cadence-design/SKILL.md`, `skills/sales-team/cadence-design/references/cadence-template.md`
**Acceptance:** Valid skill with sequence structure, timing, A/B testing + cadence template reference. Differentiates from sales-outreach.
**Agent:** docs specialist (orchestrator direct)

## Step 4: Create Sales Ops Analyst Agent [B4] — solo
**Files:** `agents/sales-ops-analyst.md`
**Acceptance:** Valid agent with classification (implementation/green/sales/sonnet), skills (crm-ops, pipeline-forecasting), collaborations (account-executive, marketing-ops-manager), 2+ workflows. Passes `/agent/validate`.
**Dependencies:** Steps 1, 2
**Agent:** docs specialist (orchestrator direct)

## Step 5: Create Revenue Analytics Skill [B5] — solo
**Files:** `skills/sales-team/revenue-analytics/SKILL.md`, `skills/sales-team/revenue-analytics/references/revenue-dashboard-template.md`
**Acceptance:** Valid skill with SaaS metrics, GTM efficiency, funnel analytics + dashboard template. Complementary to saas-finance.
**Agent:** docs specialist (orchestrator direct)

## Step 6: Create Revenue Ops Analyst Agent [B6] — solo
**Files:** `agents/revenue-ops-analyst.md`
**Acceptance:** Valid agent with classification (strategic/blue/sales/sonnet), skills (revenue-analytics), collaborations, 2+ workflows. Passes `/agent/validate`.
**Dependencies:** Step 5
**Agent:** docs specialist (orchestrator direct)

## Step 7: Enhance Existing Sales Agents [B7] — solo
**Files:** `agents/sales-development-rep.md`, `agents/account-executive.md`
**SDR changes:** Add cadence-design to related-skills, sales-ops-analyst to related-agents
**AE changes:** Add pipeline-forecasting to related-skills, sales-ops-analyst to collaborates-with, revenue-ops-analyst to related-agents
**Acceptance:** Both agents pass `/agent/validate`
**Dependencies:** Steps 3, 4, 6
**Agent:** docs specialist (orchestrator direct)

## Step 8: Update README + Sales Team Guide [B8] — solo
**Files:** `agents/README.md`, `skills/sales-team/CLAUDE.md`
**Acceptance:** README has entries for both new agents, team guide reflects 10 skills and 4 agents
**Dependencies:** Steps 4, 6
**Agent:** docs specialist (orchestrator direct)

## Step 9: Validate All Agents [B9] — solo
**Command:** Run `/agent/validate` on sales-ops-analyst, revenue-ops-analyst, sales-development-rep, account-executive
**Acceptance:** All 4 pass with zero errors
**Dependencies:** Steps 4, 6, 7
**Agent:** agent-validator

## Wave Structure

| Wave | Steps | Mode |
|------|-------|------|
| 1 | 1, 2, 3 | parallel (independent skills) |
| 2 | 4, 5 | parallel (agent + skill, independent) |
| 3 | 6 | solo (needs step 5) |
| 4 | 7, 8 | parallel (independent edits) |
| 5 | 9 | solo (validation gate) |
