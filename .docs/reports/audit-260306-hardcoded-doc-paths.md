# Audit: Hardcoded `.docs/` Path References

**Date:** 2026-03-06
**Context:** Discovery audit for doc-layout-discovery initiative
**Method:** `grep -rn '\.docs[/\s"'"'"']'` across agents/, commands/, skills/, CLAUDE.md

## Summary

| Category | Files | Approx. References |
|----------|-------|--------------------|
| Agents | 28 | ~235 |
| Commands | 18 | ~95 |
| Skills | 22 | ~120 |
| CLAUDE.md | 1 | 6 |
| **Total** | **69** | **~456** |

## Agents (28 files)

| Agent | Reference Type | Notes |
|-------|---------------|-------|
| `product-analyst` | Write paths, examples | `.docs/canonical/plans/`, `.docs/canonical/backlogs/` |
| `agile-coach` | Write paths | `.docs/canonical/waste-snake.md`, `.docs/reports/` |
| `product-manager` | Write paths | `.docs/canonical/` general |
| `ux-researcher` | Write paths, examples | `.docs/canonical/plans/` |
| `incident-responder` | Write paths | `.docs/reports/incidents/` |
| `codebase-scout` | Read paths | `.docs/canonical/`, `.docs/reports/` |
| `engineering-lead` | Read paths | `.docs/canonical/plans/`, `.docs/canonical/backlogs/` |
| `dotnet-engineer` | Write paths, examples | `.docs/reports/` |
| `devsecops-engineer` | Write paths, examples | `.docs/reports/` |
| `brainstormer` | Write paths | `.docs/canonical/` |
| `network-engineer` | Write paths, examples | `.docs/reports/` |
| `implementation-planner` | Read/write paths | `.docs/canonical/plans/` -- heaviest planner usage |
| `progress-assessor` | Read paths | **~80 refs** -- worst offender. Every example uses `.docs/` |
| `data-engineer` | Write paths | `.docs/reports/` |
| `claims-verifier` | Read/write paths | `.docs/reports/` |
| `researcher` | Write paths | `.docs/reports/` |
| `legacy-codebase-analyzer` | Write paths | `.docs/canonical/assessments/`, `.docs/reports/` |
| `docs-reviewer` | Read paths | `.docs/**/*.md` globs |
| `code-reviewer` | Write paths | `.docs/canonical/reviews/` |
| `agent-author` | References | `.docs/AGENTS.md` encoding rules |
| `seo-strategist` | Write paths | `.docs/canonical/plans/` |
| `observability-engineer` | Write paths | `.docs/reports/` |
| `ui-designer` | Read/write paths | `.docs/canonical/ops/` |
| `java-engineer` | Write paths | `.docs/reports/` |
| `technical-writer` | Write paths | `.docs/canonical/` |
| `adr-writer` | Write paths | `.docs/canonical/adrs/` |
| `product-director` | Read/write paths | `.docs/canonical/roadmaps/`, `.docs/canonical/charters/` |
| `senior-project-manager` | Read/write paths | `.docs/canonical/`, `.docs/reports/` |
| `architect` | Write paths | `.docs/canonical/assessments/` |
| `qa-engineer` | Write paths | `.docs/canonical/plans/`, `.docs/reports/` |
| `cto-advisor` | Write paths | `.docs/reports/`, `.docs/canonical/adrs/` |
| `learner` | Read/write paths | `.docs/AGENTS.md`, `.docs/canonical/`, `.docs/reports/` |
| `debugger` | Read/write paths | `.docs/reports/` |
| `demand-gen-specialist` | Write paths | `.docs/canonical/plans/` |
| `README.md` | Documentation | ~25 refs describing the canonical flow |

## Commands (18 files)

| Command | Reference Type | Notes |
|---------|---------------|-------|
| `discover` | Write path | `.docs/reports/` |
| `waste/add` | Read/write path | `.docs/canonical/waste-snake.md` |
| `plan` | Read/write path | `.docs/canonical/plans/` |
| `context/handoff` | Read/write path | `.docs/reports/` |
| `code/parallel` | Read path | `.docs/canonical/plans/` |
| `retro/waste-snake` | Read/write path | `.docs/canonical/waste-snake.md` |
| `locate/canonical` | Returns path | `.docs/canonical/` |
| `locate/reports` | Returns path | `.docs/reports/` |
| `locate/learnings` | Returns path | `.docs/AGENTS.md`, `.docs/canonical/` |
| `locate/adrs` | Returns path | `.docs/canonical/adrs/` |
| `locate/waste-snake` | Returns path | `.docs/canonical/waste-snake.md` |
| `locate/memory` | Returns path | External (computed) |
| `craft/craft` | Read/write paths | **~50 refs** -- second worst offender |
| `craft/resume` | Read paths | `.docs/reports/`, `.docs/` |
| `review/codebase` | Write path | `.docs/canonical/plans/` |
| `review/review-changes` | Read paths | `.docs/reports/`, `.docs/` |
| `review/phase-0-check` | Read paths | `.docs/canonical/plans/`, `.docs/canonical/backlogs/` |
| `plan/parallel` | Write path | `.docs/canonical/plans/` |
| `skill/phase-0-check` | Read paths | `.docs/canonical/plans/`, `.docs/canonical/backlogs/` |
| `define` | Write paths | `.docs/canonical/charters/`, `.docs/canonical/roadmaps/` |
| `docs/archive` | Read/write paths | `.docs/canonical/` subdirs |
| `agent/intake` | Write path | `.docs/reports/` |

## Skills (22 files)

| Skill | Reference Type | Notes |
|-------|---------------|-------|
| `brainstorming` | Write path | `.docs/canonical/plans/` |
| `standup-context` | Examples | `.docs/canonical/`, `.docs/reports/`, `.docs/AGENTS.md` |
| `exploring-data` | Write path | `.docs/reports/` |
| `orchestrating-agents` | Reference | `.docs/canonical/charters/` |
| `convening-experts` | Write path | `.docs/canonical/assessments/` |
| `legacy-codebase-analyzer` | Write path | `.docs/canonical/assessments/` |
| `marketing-team/CLAUDE.md` | Reference | `.docs/canonical/roadmaps/` |
| `delivery-team/CLAUDE.md` | Reference | `.docs/` hierarchy |
| `delivery-team/wiki-documentation` | Integration section | `.docs/` hierarchy |
| `delivery-team/ticket-management` | Integration section | `.docs/` hierarchy |
| `delivery-team/waste-identification` | Write path | `.docs/canonical/waste-snake.md` |
| `engineering-team/quality-gate-first` | Reference | `.docs/canonical/` |
| `engineering-team/CLAUDE.md` | Reference | `.docs/canonical/roadmaps/` |
| `engineering-team/subagent-driven-development` | Read path | `.docs/canonical/plans/` |
| `engineering-team/planning` | Read/write paths | **~20 refs** -- heaviest skill |
| `engineering-team/tdd` | Read path | `.docs/reports/review-overrides.md` |
| `engineering-team/architecture-decision-records` | Write path | `.docs/canonical/adrs/` |
| `engineering-team/tiered-review` (test) | Test fixture | `.docs/` |
| `engineering-team/context-continuity` | Write path | `.docs/reports/` |
| `engineering-team/technical-writer` | Reference | `.docs/canonical/` |
| `engineering-team/code-reviewer` | Reference | `.docs/canonical/plans/` |
| `agent-development-team/knowledge-capture` | Reference | `.docs/AGENTS.md`, `.docs/canonical/` |
| `agent-development-team/refactoring-agents` | Write path | `.docs/reports/` |
| `agent-development-team/agent-intake` | Write path | `.docs/reports/` |

## CLAUDE.md (project root)

6 references to `.docs/` covering artifact conventions, canonical flow, context handoff, and learnings.

## Classification

### Type 1: Path references (~400 refs)
Direct path usage like "write to `.docs/reports/report-*.md`". These must go through discovery.

### Type 2: Conditional references (~50 refs)
Already acknowledge paths may differ: "when this repo's artifact conventions are in use (see `.docs/AGENTS.md`)". These need the same treatment but are already designed for flexibility.

### Top offenders by reference count
1. `progress-assessor` -- ~80 refs
2. `craft/craft` -- ~50 refs
3. `agents/README.md` -- ~25 refs
4. `engineering-team/planning` -- ~20 refs
5. `implementation-planner` -- ~15 refs

## Recommendation

Replace hardcoded `.docs/` paths with discovery-based resolution. See companion research report `researcher-260306-project-layout-manifest-landscape.md` for landscape analysis and design direction.
