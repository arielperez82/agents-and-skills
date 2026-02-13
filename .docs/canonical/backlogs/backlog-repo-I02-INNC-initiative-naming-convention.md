---
type: backlog
endeavor: repo
initiative: I02-INNC
initiative_name: initiative-naming-convention
status: active
updated: 2026-02-10
---

# Backlog: Initiative Naming and Traceability Convention

Single continuous queue of **changes** to adopt the initiative-naming charter so all agents and skills follow the convention to the "T". Ordered by roadmap outcome and dependency.

## Changes (ranked)

| ID | Change | Phase | Value | Notes |
|----|--------|-------|-------|--------|
| I02-INNC-B01 | Add initiative-naming section to `.docs/AGENTS.md` (ID grammar, required front matter, References by initiative) | 1 | Single source of truth | Outcome 1 |
| I02-INNC-B02 | Add I01-ACM and I02-INNC to References (by initiative) in AGENTS.md with charter, roadmap, backlog, plan links | 1 | Enables "current plan" lookup | Outcome 1 |
| I02-INNC-B03 | Retrofitting: Add `initiative: I01-ACM`, `initiative_name: artifact-conventions-migration` to roadmap-repo-artifact-conventions-migration-2026.md | 2 | I01-ACM consistent | Outcome 2 |
| I02-INNC-B04 | Retrofitting: Add same initiative + initiative_name to backlog-repo-artifact-conventions-migration.md | 2 | I01-ACM consistent | Outcome 2 |
| I02-INNC-B05 | Retrofitting: Add same initiative + initiative_name to plan-repo-artifact-conventions-migration.md | 2 | I01-ACM consistent | Outcome 2 |
| I02-INNC-B06 | Retrofitting: Add Phase/Outcome column to backlog I01-ACM if missing; use full ID (I01-ACM-Bnn) in table or document shorthand | 2 | Backlog grammar | Outcome 2 |
| I02-INNC-B07 | Update progress-assessor: require initiative + initiative_name when reading/writing plan, status; reference References (by initiative) | 3 | Agent compliance | Outcome 3 |
| I02-INNC-B08 | Update implementation-planner: output plan with initiative + initiative_name in front matter; steps reference backlog IDs (Bnn or full); plan step IDs Bnn-Pp.s when sub-steps | 3 | Agent compliance | Outcome 3 |
| I02-INNC-B09 | Update product-manager, product-analyst, product-director: create roadmap/backlog/plan only with initiative + initiative_name; use ID grammar in examples | 3 | Agent compliance | Outcome 3 |
| I02-INNC-B10 | Update senior-pm: roadmap/backlog/plan references use initiative code; require initiative + initiative_name in created artifacts | 3 | Agent compliance | Outcome 3 |
| I02-INNC-B11 | Update architect: any plan/roadmap/backlog output uses initiative + initiative_name and ID grammar | 3 | Agent compliance | Outcome 3 |
| I02-INNC-B12 | Update adr-writer, learner, docs-reviewer: when touching canonical docs, reference initiative; no creation of roadmap/backlog/plan without initiative fields | 3 | Agent compliance | Outcome 3 |
| I02-INNC-B13 | Update remaining agents that reference .docs/canonical, roadmap, backlog, plan (qa-engineer, ux-researcher, technical-writer, seo-strategist, legacy-codebase-analyzer, cto-advisor, code-reviewer, observability-engineer, devsecops-engineer, brainstormer, etc.): align instructions and examples to initiative naming | 3 | Agent compliance | Outcome 3 |
| I02-INNC-B14 | Update planning skill: .docs/ plans, initiative + initiative_name, References (by initiative); remove any PLAN.md/WIP.md references; add initiative ID grammar to examples | 4 | Skill compliance | Outcome 4 |
| I02-INNC-B15 | Update ticket-management skill: initiative code = epic; backlog ID format I<nn>-<ACRONYM>-B<nn>; require initiative_name for search; add to data quality / maintenance cadence | 4 | Skill compliance | Outcome 4 |
| I02-INNC-B16 | Update legacy-codebase-analyzer skill: roadmap/assessment output paths and templates use initiative + initiative_name and naming grammar | 4 | Skill compliance | Outcome 4 |
| I02-INNC-B17 | Update seo-strategist skill: roadmap output → .docs/canonical/roadmaps/ with initiative + initiative_name in front matter and filename pattern | 4 | Skill compliance | Outcome 4 |
| I02-INNC-B18 | Update technical-writer, architecture-decision-records, refactoring-agents skills: .docs/canonical paths and any plan/backlog/roadmap references use initiative naming | 4 | Skill compliance | Outcome 4 |
| I02-INNC-B19 | Update brainstorming, subagent-driven-development, quality-gate-first, creating-agents/skill-creator: plan/roadmap/backlog paths and examples use .docs/canonical and initiative naming | 4 | Skill compliance | Outcome 4 |
| I02-INNC-B20 | Update agents/README.md and skills/README.md: document initiative naming; point to charter and AGENTS.md References (by initiative) | 4 | Discoverability | Outcome 4 |
| I02-INNC-B21 | Validation: grep for roadmap/backlog/plan creation without initiative or initiative_name; spot-check agents and skills; produce validation summary | 5 | Done | Outcome 5 |

## Backlog item lens (per charter)

- **Roadmap outcome / Phase:** In table.
- **Value:** Unblocks next phase or delivers outcome.
- **Acceptance:** Changes merged; instructions and examples follow charter; no creation of roadmap/backlog/plan without initiative + initiative_name.
- **Definition of done:** Convention followed to the "T" in scope of that change.

## Links

- Charter: [charter-repo-initiative-naming-convention.md](../charters/charter-repo-initiative-naming-convention.md)
- Roadmap: [roadmap-repo-I02-INNC-initiative-naming-convention-2026.md](../roadmaps/roadmap-repo-I02-INNC-initiative-naming-convention-2026.md)
- Plan: (to be created)
- Assessment (source): [assessment-repo-initiative-naming-2026-02-10.md](../assessments/assessment-repo-initiative-naming-2026-02-10.md)
