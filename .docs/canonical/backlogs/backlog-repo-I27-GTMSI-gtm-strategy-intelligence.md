---
type: backlog
endeavor: repo
initiative: I27-GTMSI
initiative_name: gtm-strategy-intelligence
status: todo
updated: 2026-03-04
---

# Backlog: GTM Strategy & Intelligence Layer

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by wave, charter outcome, and dependency. Implementers pull from here; execution is planned in the plan doc.

## Architecture Summary

This is a docs-only initiative. All deliverables are markdown files -- no code, no scripts, no deployments.

**Component structure:**
- 3 new agent files (`agents/*.md`)
- 3 new skill directories (`skills/marketing-team/*/SKILL.md` + `references/`)
- Cross-reference updates to 3 existing agents
- 1 README update

**Interface contracts:**
- Agent frontmatter schema: see `agents/product-marketer.md`
- Skill frontmatter schema: see `skills/marketing-team/marketing-strategy-pmm/SKILL.md`

**Scope boundaries (risk mitigations from charter):**
- `icp-modeling` = profiling methodology (firmographics, technographics, scoring). Distinct from `marketing-strategy-pmm` which covers positioning.
- `niche-market-strategy` = market entry patterns (PLG, DevRel, beachhead). Distinct from `marketing-strategy-pmm` which covers GTM execution.
- `competitive-intel` = market-facing CI operations (monitoring, battlecards, win/loss). Distinct from `product-team/competitive-analysis` which is repo/product scorecard analysis.
- `copywriter` = writes copy (execution, haiku). Distinct from `content-creator` = plans content strategy (strategic+execution).

## Changes (ranked)

Full ID prefix for this initiative: **I27-GTMSI**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I27-GTMSI-B01, I27-GTMSI-B02, etc.

### Wave 1: Walking Skeleton

Proves agent-skill wiring and resolves dangling command refs. All 3 items can be parallelized.

| ID | Change | US | Complexity | Parallel | Status |
|----|--------|----|------------|----------|--------|
| B1 | Create `agents/gtm-strategist.md` -- strategic agent (type=strategic, color=blue, model=sonnet). Core skills: `marketing-team/icp-modeling`, `marketing-team/niche-market-strategy`. Related skills: `marketing-team/marketing-strategy-pmm`. Related agents: `product-marketer`, `competitive-intelligence-analyst`. Collaborates-with: `product-marketer` (positioning handoff), `sales-development-rep` (ICP handoff). Purpose: ICP definition, TAM/SAM/SOM analysis, market segmentation, niche market strategy. 2+ workflows (ICP Definition, Market Segmentation). 2+ examples. Must pass `/agent/validate`. | US-1 | moderate | yes (W1) | todo |
| B2 | Create `skills/marketing-team/icp-modeling/SKILL.md` + `references/icp-scoring-template.md`. Covers: firmographic criteria (size, industry, revenue, geography), technographic criteria (tech stack, tools), behavioral criteria (buying signals, engagement), psychographic criteria (pain points, priorities). Documents Clay waterfall enrichment pattern. Includes closed-won pattern analysis methodology. Includes scoring model template (weighted 0-100). Related-agents: `gtm-strategist`, `sales-development-rep`. | US-2 | moderate | yes (W1) | todo |
| B3 | Create `agents/copywriter.md` -- execution agent (type=implementation, color=green, model=haiku). Core skills: `marketing-team/content-creator`. Related skills: `marketing-team/page-cro`, `marketing-team/marketing-psychology`. Related agents: `content-creator`. Related commands: `/content/cro`, `/content/enhance`, `/content/fast`, `/content/good`. Purpose: writing/editing copy for web, email, social, landing pages; CRO-optimized copy; brand voice adherence. Differentiates from `content-creator` in purpose section. 2+ examples with realistic copy. Must pass `/agent/validate`. | US-6 | simple | yes (W1) | todo |

**Wave 1 acceptance:** B1 agent references B2 skill. B3 resolves 4 dangling command refs. All 3 pass `/agent/validate`.

### Wave 2: Remaining Core

Remaining agents and skills. All 3 items can be parallelized within wave. Depends on Wave 1 completion (B1 references `competitive-intelligence-analyst` in related-agents; B4 references `gtm-strategist`).

| ID | Change | US | Complexity | Parallel | Status |
|----|--------|----|------------|----------|--------|
| B4 | Create `skills/marketing-team/niche-market-strategy/SKILL.md` + `references/niche-market-evaluation-template.md`. Covers: Algolia-style PLG + DevRel model (free tier adoption, developer docs, API-first, community, bottom-up expansion). Niche market identification (TAM/SAM/SOM sizing, segment analysis, beachhead strategy). 2+ market entry patterns beyond PLG (community-led growth, vertical SaaS, channel partnerships). Related-agents: `gtm-strategist`, `product-marketer`. | US-3 | moderate | yes (W2) | todo |
| B5 | Create `agents/competitive-intelligence-analyst.md` -- strategic agent (type=strategic, color=blue, model=sonnet). Core skills: `marketing-team/competitive-intel`, `product-team/competitive-analysis`. Related agents: `product-marketer`, `gtm-strategist`, `sales-development-rep`, `account-executive`. Collaborates-with: `product-marketer` (battlecard handoff), `sales-development-rep` (competitive context for outreach). Purpose: continuous CI monitoring, automated battlecard creation, win/loss analysis, share-of-voice tracking, competitor feature/pricing tracking. 2+ workflows (Competitor Monitoring, Battlecard Generation). 2+ examples. Must pass `/agent/validate`. | US-4 | moderate | yes (W2) | todo |
| B6 | Create `skills/marketing-team/competitive-intel/SKILL.md` + `references/battlecard-template.md`. Covers: competitor identification methodology, monitoring cadence (daily/weekly/monthly), data sources (websites, job postings, press releases, product changes, pricing, reviews). Battlecard template: positioning, strengths/weaknesses, objection handling, landmines, win themes. Win/loss analysis framework. Share-of-voice measurement. Differentiates from `product-team/competitive-analysis` (market-facing CI ops vs. repo/product scorecard). Related-agents: `competitive-intelligence-analyst`, `product-marketer`. | US-5 | moderate | yes (W2) | todo |

**Wave 2 acceptance:** B5 agent references B6 skill. B4 completes `gtm-strategist` skill set. All pass validation.

### Wave 3: Integration

Cross-reference wiring and catalog updates. B7 depends on Waves 1+2 (needs new agent names to reference). B8 depends on B7 (README should reflect final state). B7 items can be parallelized internally.

| ID | Change | US | Complexity | Parallel | Status |
|----|--------|----|------------|----------|--------|
| B7 | Update 3 existing agents with cross-references. (a) `product-marketer`: add `gtm-strategist`, `competitive-intelligence-analyst` to `related-agents`; add `marketing-team/competitive-intel` to `related-skills`. (b) `sales-development-rep`: add `gtm-strategist` to `related-agents`; add `collaborates-with` entry for `gtm-strategist` (ICP criteria handoff). (c) `content-creator`: add `copywriter` to `related-agents`; add `collaborates-with` entry for `copywriter`. All 3 must still pass `/agent/validate`. | US-7 | simple | yes (W3, 3 sub-edits) | todo |
| B8 | Update `agents/README.md` with 3 new agent entries: `gtm-strategist`, `competitive-intelligence-analyst`, `copywriter`. Follow existing format (name, description, classification, key skills). Update marketing team section if one exists. | US-8 | trivial | no (after B7) | todo |
| B9 | Run `/agent/validate` on all 6 modified/new agents as final quality gate (SC-12). | SC-12 | trivial | no (after B8) | todo |

**Wave 3 acceptance:** Agent graph fully connected. README updated. All 6 agents pass validation (SC-12).

## Backlog item lens (per charter)

- **Charter outcome:** Mapped via US references in table.
- **Value/impact:** Wave 1 proves architecture and resolves dangling refs; Wave 2 completes core capabilities; Wave 3 ensures discoverability.
- **Design/UX:** N/A (internal tooling).
- **Engineering:** Agent frontmatter + body authoring, skill SKILL.md authoring, reference file creation.
- **Security/privacy:** N/A.
- **Observability:** N/A.
- **Rollout/comms:** Update agents/README.md when complete. I28-GTMMC and I29-GTMSO depend on this initiative.
- **Acceptance criteria:** Per charter US acceptance criteria and SC-1 through SC-12.
- **Definition of done:** All changes merged; all 6 agents pass `/agent/validate`; 4 dangling content command refs resolved; no scope overlap with existing skills.

## Links

- Charter: [charter-repo-I27-GTMSI-gtm-strategy-intelligence.md](../charters/charter-repo-I27-GTMSI-gtm-strategy-intelligence.md)
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md)
- Research: [researcher-260304-ai-gtm-landscape-2025-2026.md](../../reports/researcher-260304-ai-gtm-landscape-2025-2026.md)
