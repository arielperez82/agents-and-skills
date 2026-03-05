# Backlog: I29-GTMSO — GTM Sales Ops & Revenue

**Initiative:** I29-GTMSO
**Date:** 2026-03-05
**Status:** Active

## Wave 1: Walking Skeleton (parallel within wave)

### B1: Create CRM Ops Skill [US-2]
- **What:** Create `skills/sales-team/crm-ops/SKILL.md` + reference file
- **Pattern:** Follow existing `skills/sales-team/pipeline-analytics/SKILL.md` format
- **Acceptance:** Valid frontmatter, covers CRM data model/hygiene/integration, 1+ reference
- **Complexity:** Medium (content authoring)
- **Dependencies:** None

### B2: Create Pipeline Forecasting Skill [US-3]
- **What:** Create `skills/sales-team/pipeline-forecasting/SKILL.md` + reference file
- **Pattern:** Follow existing `skills/sales-team/pipeline-analytics/SKILL.md` format
- **Acceptance:** Valid frontmatter, covers forecasting methods/metrics/benchmarks, 1+ reference, complementary to pipeline-analytics
- **Complexity:** Medium (content authoring)
- **Dependencies:** None

### B3: Create Cadence Design Skill [US-6]
- **What:** Create `skills/sales-team/cadence-design/SKILL.md` + reference file
- **Pattern:** Follow existing `skills/sales-team/sales-outreach/SKILL.md` format
- **Acceptance:** Valid frontmatter, covers sequence structure/timing/testing, 1+ reference, differentiates from sales-outreach
- **Complexity:** Medium (content authoring)
- **Dependencies:** None

### B4: Create Sales Ops Analyst Agent [US-1]
- **What:** Create `agents/sales-ops-analyst.md`
- **Pattern:** Follow existing `agents/account-executive.md` format
- **Acceptance:** Valid frontmatter, correct classification (implementation/green/sales/sonnet), references crm-ops + pipeline-forecasting skills, 2+ workflows
- **Complexity:** Medium (content authoring + cross-referencing)
- **Dependencies:** B1, B2 (skills must exist for references)

## Wave 2: Revenue Layer (parallel within wave, sequential after Wave 1)

### B5: Create Revenue Analytics Skill [US-5]
- **What:** Create `skills/sales-team/revenue-analytics/SKILL.md` + reference file
- **Pattern:** Follow existing skill format
- **Acceptance:** Valid frontmatter, covers SaaS metrics/GTM efficiency/funnel analytics, complementary to saas-finance
- **Complexity:** Medium (content authoring)
- **Dependencies:** None (can start with Wave 1, but logically grouped here)

### B6: Create Revenue Ops Analyst Agent [US-4]
- **What:** Create `agents/revenue-ops-analyst.md`
- **Pattern:** Follow existing agent format
- **Acceptance:** Valid frontmatter, correct classification (strategic/blue/sales/sonnet), references revenue-analytics skill, 2+ workflows
- **Complexity:** Medium (content authoring + cross-referencing)
- **Dependencies:** B5

## Wave 3: Integration (sequential after Wave 1+2)

### B7: Enhance Existing Sales Agents [US-7]
- **What:** Update `agents/sales-development-rep.md` and `agents/account-executive.md` frontmatter
- **SDR changes:** Add `sales-team/cadence-design` to related-skills, `sales-ops-analyst` to related-agents
- **AE changes:** Add `sales-team/pipeline-forecasting` to related-skills, `sales-ops-analyst` to collaborates-with (pipeline data handoff), `revenue-ops-analyst` to related-agents
- **Acceptance:** All modified agents pass `/agent/validate`
- **Complexity:** Low (frontmatter edits)
- **Dependencies:** B3 (cadence-design exists), B4 (sales-ops-analyst exists), B6 (revenue-ops-analyst exists)

### B8: Update README + Sales Team Guide [US-8 + gap]
- **What:** Add entries for `sales-ops-analyst` and `revenue-ops-analyst` in `agents/README.md`. Update `skills/sales-team/CLAUDE.md` to reflect 10 skills, 4 agents.
- **Pattern:** Follow existing README entry format
- **Acceptance:** Entries present, format matches existing entries
- **Complexity:** Low (documentation update)
- **Dependencies:** B4, B6 (agents must exist)

### B9: Validate All Agents [SC-7]
- **What:** Run `/agent/validate` on all 4 new/modified agents
- **Acceptance:** All pass with zero errors
- **Complexity:** Low (validation)
- **Dependencies:** B4, B6, B7

## Deferred Items

- D01: MCP tool integrations (HubSpot, Clarify, Gong APIs) — future initiative
- D02: Python automation scripts — future after reference skills prove patterns
- D03: Commands (`/sales/pipeline-review`, `/sales/forecast`) — future initiative
- D04: Customer success / post-sale agents — future initiative
