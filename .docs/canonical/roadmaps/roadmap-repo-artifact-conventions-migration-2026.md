---
type: roadmap
endeavor: repo
initiative: I01-ACM
initiative_name: artifact-conventions-migration
lead: product
collaborators:
  - engineering
  - design
status: active
updated: 2026-02-10
---

# Roadmap: Agent Artifact Conventions Migration (2026)

## Outcomes (sequenced)

Outcomes only; no task granularity. Execution is pulled from the backlog and planned in the plan doc.

| Order | Outcome | Checkpoint |
|-------|---------|------------|
| 1 | `.docs/` is the single source of truth for this repo; no coordination artifacts outside `.docs/` | Phase 0 complete: structure exists, `.docs/AGENTS.md` is operating reference |
| 2 | Every agent's .md read/write is mapped to canonical or report paths | Phase 1 complete: migration checklist done |
| 3 | All agent definitions use only `.docs/` and naming grammar for coordination artifacts | Phase 2 complete |
| 4 | Learnings (three layers) and ADR placement encoded in AGENTS.md and agents | Phase 3 complete |
| 5 | Commands and READMEs point to `.docs/` and new naming | Phase 4 complete |
| 6 | No obsolete names or paths; validation clean | Phase 5 complete; migration done |

## Out of scope (this roadmap)

- Changing behavior of consumer repos (they adopt conventions when they use these agents).
- Adding new agent capabilities unrelated to artifact layout and naming.

## Links

- Charter: [charter-repo-artifact-conventions.md](../charters/charter-repo-artifact-conventions.md)
- Backlog: [backlog-repo-artifact-conventions-migration.md](../backlogs/backlog-repo-artifact-conventions-migration.md)
- Plan: [plan-repo-artifact-conventions-migration.md](../plans/plan-repo-artifact-conventions-migration.md)
