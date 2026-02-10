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

## Check: Agents and skills reference initiative naming

- Agents updated: ap-progress-guardian, ap-implementation-planner, ap-product-manager, ap-product-analyst, ap-product-director, ap-senior-pm, ap-architect, ap-adr-writer, ap-learn, ap-docs-guardian. agents/README.md includes initiative naming.
- Skills updated: planning, ticket-management, legacy-codebase-analyzer, seo-strategist, subagent-driven-development, brainstorming, refactoring-agents. skills/README.md includes initiative naming for planning.

## Result

Convention is followed for all initiative-scoped roadmap/backlog/plan. Agents and skills that create or reference these artifacts require or reference initiative + initiative_name and .docs/AGENTS.md References (by initiative).
