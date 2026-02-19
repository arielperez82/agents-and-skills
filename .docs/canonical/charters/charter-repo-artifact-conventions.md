---
type: charter
endeavor: repo
status: active
updated: 2026-02-06
---

# Charter: Agent Artifact Conventions (Repo)

## Intent

- Establish a single, repo-local "truth surface" for planning and coordination under `.docs/`.
- Eliminate semantic collisions (multiple roadmaps, ambiguous "summary") and duplicated truth across specialty artifacts.
- Ensure all agents read/write only under `.docs/**` and use a minimal set of canonical document types with machine-searchable naming.
- Propagate this convention from this meta repo to every consumer repo via the agents we define.

## Constraints (non-negotiable)

- **No artifacts under `/agents/`.** `/agents/` contains agent definitions only.
- **All artifacts live under `.docs/`.**
- **Agents read/write only under `.docs/**`.**
- **No uppercase coordination files** (no `PLAN.md`, `WIP.md`, `LEARNINGS.md`).
- **Single operating reference:** `.docs/AGENTS.md`.
- **Continuous flow:** single backlog queue; no sprint framing.
- **Commit-level reviews only;** no PR workflow assumptions for artifact layout.

## Non-goals

- We do not support multiple competing "plan" or "roadmap" files at repo root or under arbitrary paths.
- We do not preserve legacy artifact names (e.g. PLAN.md) as first-class; they may exist only as stubs pointing to `.docs/`.

## Decision rights

- **Charter changes:** product + engineering + design (triad); disputes about "why / boundaries / decision rights" resolve here.
- **Roadmap:** product lead; engineering + design required collaborators.
- **Backlog ordering:** flow owner (PM function) with continuous multi-discipline input.
- **Plan (execution):** implementation owner/tech lead with required specialty inputs.
- **Assessments / reviews:** relevant specialty leads; outputs must feed backlog or charter.

## Success measures

- Every agent that touches coordination/canonical artifacts references only `.docs/` and the agreed naming grammar.
- No references to PLAN.md, WIP.md, LEARNINGS.md, or ad-hoc names (e.g. `roadmap.md`, `summary.md`) in agent definitions for coordination.
- Consumer repos using these agents are directed to use `.docs/` and the same conventions.
- Disputes about what to do next resolve upstream: Roadmap (evergreen) for inter-initiative sequencing, Charter for intra-initiative scope, Backlog for execution order.

## Canonical layout (authoritative)

```
.docs/
  AGENTS.md
  canonical/
    charters/
    roadmaps/
    backlogs/
    plans/
    assessments/
    reviews/
    adrs/
    ops/
  reports/
```

## Naming grammar (canonical)

`<type>-<endeavor>[-<scope>]-<subject>[-<timeframe>].md` under `.docs/canonical/<type>/`.

Types: `charter`, `roadmap`, `backlog`, `plan`, `assessment`, `review`, `ops`.

Reports: `report-<endeavor>-<topic>-<timeframe>.md` under `.docs/reports/`.

ADRs: `adr-YYYYMMDD-<subject>.md` under `.docs/canonical/adrs/`.

## Learnings (three layers)

1. **Operational (cross-agent):** `.docs/AGENTS.md`. Bridge rule: deep specialist learnings that change cross-agent behavior get a short entry here pointing to the source.
2. **Domain (endeavor-level):** `.docs/canonical/assessments/` or "Learnings" section in charter/roadmap/backlog/plan. Rule: if a learning changes what we do next, it lands in canonical docs.
3. **Deep specialist:** With the agent's skills/commands. Rule: "how to think/do", not "what this repo has decided."

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

## References

- [Agent Artifact Conventions](https://github.com/.../agent-artifact-conventions) (source charter).
- Plan for this endeavor: [plan-repo-artifact-conventions-migration.md](../plans/plan-repo-artifact-conventions-migration.md).
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md).
- Backlog: [backlog-repo-artifact-conventions-migration.md](../backlogs/backlog-repo-artifact-conventions-migration.md).
