# Handoff: B04 — Migrate agent files from hardcoded .docs/ paths to /docs/layout discovery

**Date:** 2026-03-06
**Context utilization at handoff:** ~61%
**Status:** NOT STARTED (0/35 files completed)

## What this task is

Backlog item B04: Edit 34 agent markdown files + `agents/README.md` to replace hardcoded `.docs/` path literals with portable references that point to `/docs/layout` for path discovery.

## Migration pattern

Replace `.docs/` path literals with descriptive references + `(per /docs/layout -> KEY_NAME)`.

### Key mapping

| Hardcoded path | Layout key |
|---|---|
| `.docs/` or `.docs` | `DOCS_ROOT` |
| `.docs/canonical/` | `CANONICAL_ROOT` |
| `.docs/canonical/roadmaps/` | subdir under `CANONICAL_ROOT` |
| `.docs/canonical/charters/` | subdir under `CANONICAL_ROOT` |
| `.docs/canonical/backlogs/` | subdir under `CANONICAL_ROOT` |
| `.docs/canonical/plans/` | subdir under `CANONICAL_ROOT` |
| `.docs/reports/` | `REPORTS_DIR` |
| `.docs/AGENTS.md` | `LEARNINGS_FILE` |
| `.docs/canonical/adrs/` | `ADR_DIR` |
| `.docs/canonical/waste-snake.md` | `WASTE_SNAKE` |

### Rules

1. Keep file naming patterns (e.g., `report-repo-<subject>.md`) — only replace directory prefix
2. When path appears in naming grammar, keep grammar but note root is per `/docs/layout`
3. Do NOT break markdown formatting
4. Preserve KEY name in backticks for cross-reference

### Transform examples

- **Before:** `Write the report to .docs/reports/report-<subject>.md.`
- **After:** `Write the report to the reports directory (per /docs/layout -> REPORTS_DIR).`

- **Before:** `Update .docs/AGENTS.md with learnings.`
- **After:** `Update the learnings file (per /docs/layout -> LEARNINGS_FILE).`

## Files to edit (all 35)

1. agents/product-analyst.md
2. agents/agile-coach.md
3. agents/product-manager.md
4. agents/ux-researcher.md
5. agents/incident-responder.md
6. agents/codebase-scout.md
7. agents/engineering-lead.md
8. agents/dotnet-engineer.md
9. agents/devsecops-engineer.md
10. agents/brainstormer.md
11. agents/network-engineer.md
12. agents/implementation-planner.md
13. agents/progress-assessor.md (HEAVY — ~80 refs, be thorough)
14. agents/data-engineer.md
15. agents/claims-verifier.md
16. agents/researcher.md (may have partial edits from prior session — check git diff)
17. agents/legacy-codebase-analyzer.md
18. agents/docs-reviewer.md
19. agents/code-reviewer.md
20. agents/agent-author.md
21. agents/seo-strategist.md
22. agents/observability-engineer.md
23. agents/ui-designer.md
24. agents/java-engineer.md
25. agents/technical-writer.md
26. agents/adr-writer.md
27. agents/product-director.md
28. agents/senior-project-manager.md
29. agents/architect.md
30. agents/qa-engineer.md
31. agents/cto-advisor.md
32. agents/learner.md
33. agents/debugger.md
34. agents/demand-gen-specialist.md
35. agents/README.md

## What was done

- Nothing. Context was exhausted before any edits could begin.
- `agents/researcher.md` shows as modified in git status but that may be from a prior session — verify with `git diff agents/researcher.md`.

## How to resume

1. Start fresh session
2. For each file in the list above: `Read` the file, find all `.docs/` references, apply `Edit` for each replacement
3. For `progress-assessor.md` (~80 refs), batch edits carefully
4. Check `git diff agents/researcher.md` first to see if prior session already started it
5. After all 35 files done, commit

## Do NOT modify

- Any file under `.docs/` itself (reports, backlogs, charters, etc.) — historical artifacts
- CLAUDE.md (separate task)
