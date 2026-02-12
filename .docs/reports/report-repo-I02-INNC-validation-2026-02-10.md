---
endeavor: repo
initiative: I02-INNC
initiative_name: initiative-naming-convention
topic: validation
timeframe: 2026-02-10
---

# Validation: Initiative Naming Convention (I02-INNC)

**Date:** 2026-02-10  
**Backlog item:** I02-INNC-B21

## Check: Canonical roadmap/backlog/plan have initiative + initiative_name

| Document | initiative | initiative_name |
|----------|------------|-----------------|
| roadmap-repo-artifact-conventions-migration-2026.md | I01-ACM | artifact-conventions-migration |
| backlog-repo-artifact-conventions-migration.md | I01-ACM | artifact-conventions-migration |
| plan-repo-artifact-conventions-migration.md | I01-ACM | artifact-conventions-migration |
| roadmap-repo-I02-INNC-initiative-naming-convention-2026.md | I02-INNC | initiative-naming-convention |
| backlog-repo-I02-INNC-initiative-naming-convention.md | I02-INNC | initiative-naming-convention |
| plan-repo-I02-INNC-initiative-naming-convention.md | I02-INNC | initiative-naming-convention |

**Not yet assigned to an initiative (acceptable):** `backlog-repo-skills-audit-cleanup.md`, `agent-artifact-migration-checklist.md` — add initiative/initiative_name when that work is scoped as an initiative.

## Check: AGENTS.md has initiative naming and References (by initiative)

- Initiative naming section: present (ID grammar, required front matter).
- References (by initiative): I01-ACM and I02-INNC listed with charter, roadmap, backlog, plan links.

## Check: Agents reference initiative naming

**Phase 3 core agents (B07-B12):** progress-assessor, implementation-planner, product-manager, product-analyst, product-director, senior-pm, architect, adr-writer, learn, docs-reviewer.

**Phase 3 remaining agents (B13):** qa-engineer, ux-researcher, technical-writer, seo-strategist, legacy-codebase-analyzer, cto-advisor, code-reviewer, observability-engineer, devsecops-engineer, brainstormer.

**Total: 20 agents updated.** agents/README.md includes initiative naming.

## Check: Skills reference initiative naming

**Phase 4 skills (B14-B19):** planning, ticket-management, legacy-codebase-analyzer (skill), seo-strategist (skill), subagent-driven-development, brainstorming, refactoring-agents, technical-writer (skill), architecture-decision-records, quality-gate-first.

**Correctly excluded (no .docs/canonical references):** skill-creator, creating-agents — these create skills/agents, not canonical docs.

**Total: 10 skills updated.** skills/README.md includes initiative naming for planning.

## Check: READMEs (B20)

- agents/README.md: references initiative naming convention.
- skills/README.md: references initiative naming for planning skill.

## Result

Convention is followed to the letter for all initiative-scoped roadmap/backlog/plan. All 20 agents and 10 skills that create or reference canonical artifacts include initiative + initiative_name guidance pointing to .docs/AGENTS.md initiative naming and References (by initiative). B01-B21 complete.
