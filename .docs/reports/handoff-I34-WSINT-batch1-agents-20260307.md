# Handoff: I34-WSINT — Batch 1 Agent .docs/ Path Migration

**Date:** 2026-03-07
**Session:** Batch 1 agent migration (A through I)
**Context exhaustion:** ~65% when blocked
**Branch:** main
**Last commit:** `305910e` — `wip(I34-WSINT): migrate .docs/ paths to /docs/layout in batch 1 agents (partial)`

## What Was Done

Migrated `.docs/` hardcoded paths to portable `/docs/layout` references in **3 of 18** agent files:

| # | File | Refs | Status |
|---|------|------|--------|
| 1 | `agents/adr-writer.md` | 7 | **DONE** — all 7 refs migrated |
| 2 | `agents/agent-author.md` | 2 | **DONE** — all 2 refs migrated |
| 3 | `agents/agile-coach.md` | 3 | **PARTIAL** — 2 of 3 refs migrated; 1 remaining (line 332: `.docs/reports/report-repo-retro-` in bash example) |
| 4 | `agents/architect.md` | 2 | NOT STARTED |
| 5 | `agents/brainstormer.md` | 1 | NOT STARTED |
| 6 | `agents/claims-verifier.md` | 3 | NOT STARTED |
| 7 | `agents/code-reviewer.md` | 5 | NOT STARTED |
| 8 | `agents/codebase-scout.md` | 1 | NOT STARTED |
| 9 | `agents/cto-advisor.md` | 3 | NOT STARTED |
| 10 | `agents/data-engineer.md` | 3 | NOT STARTED |
| 11 | `agents/debugger.md` | 4 | NOT STARTED |
| 12 | `agents/demand-gen-specialist.md` | 1 | NOT STARTED |
| 13 | `agents/devsecops-engineer.md` | 4 | NOT STARTED |
| 14 | `agents/docs-reviewer.md` | 8 | NOT STARTED |
| 15 | `agents/dotnet-engineer.md` | 5 | NOT STARTED |
| 16 | `agents/engineering-lead.md` | 4 | NOT STARTED |
| 17 | `agents/implementation-planner.md` | 8 | NOT STARTED |
| 18 | `agents/incident-responder.md` | 1 | NOT STARTED |

## Exact Remaining References (from grep)

### agile-coach.md (1 remaining)
- Line 332: `cat > .docs/reports/report-repo-retro-$(date +%Y-w%V).md << 'EOF'` → change to `{REPORTS_DIR}/report-repo-retro-...`

### architect.md (2 refs)
- Line 587: `ASSESSMENT_DIR=".docs/canonical/assessments"` → `{CANONICAL_ROOT}/assessments`
- Line 588: `# When creating roadmap/backlog/plan under .docs/canonical/...` → `under canonical docs root (per /docs/layout)...`

### brainstormer.md (1 ref)
- Line 178: `When the brainstorm produces a plan or roadmap under .docs/canonical/` → `under canonical docs root (per /docs/layout)`

### claims-verifier.md (3 refs)
- Line 68: `.docs/reports/researcher-260226-webhook-providers.md` → `{REPORTS_DIR}/researcher-...`
- Line 72: `.docs/reports/ux-researcher-260226-checkout-flow.md` → `{REPORTS_DIR}/ux-researcher-...`
- Line 190: `.docs/reports/claims-verifier-{date}-{subject}.md` → `{REPORTS_DIR}/claims-verifier-...`

### code-reviewer.md (5 refs)
- Line 229: `.docs/canonical/reviews/review-repo-commit-<hash>.md` → `{CANONICAL_ROOT}/reviews/...`
- Line 230: `# When tied to an initiative, add initiative + initiative_name to front matter (see .docs/AGENTS.md initiative naming).` → `...see learnings file...`
- Line 233: `.docs/canonical/reviews/review-repo-commit-<hash>.md` → `{CANONICAL_ROOT}/reviews/...`
- Line 458: `.docs/canonical/reviews/review-repo-commit-$COMMIT_HASH.md` → `{CANONICAL_ROOT}/reviews/...`
- Line 461: `Report saved to .docs/canonical/reviews/...` → `Report saved to {CANONICAL_ROOT}/reviews/...`

### codebase-scout.md (1 ref)
- Line 163: `.docs/canonical/` and `.docs/reports/` → `canonical docs root and reports directory (per /docs/layout)`

### cto-advisor.md (3 refs)
- Line 459: `.docs/reports/report-repo-board-email-$(date +%Y-%m-%d).md` → `{REPORTS_DIR}/report-repo-board-email-...`
- Line 460: `# When tied to an initiative, add initiative + initiative_name to front matter (see .docs/AGENTS.md initiative naming).` → `...see learnings file...`
- Line 478-480: `ADR_DIR=".docs/canonical/adrs"` → `ADR_DIR per /docs/layout`

### data-engineer.md (3 refs)
- Line 1119: `.docs/reports/report-repo-pipeline-$(date +%Y-w%V).md` → `{REPORTS_DIR}/report-repo-pipeline-...`
- Line 1138: `.docs/reports/report-repo-pipeline-...` → same
- Line 1141: `.docs/reports/report-repo-pipeline-...` → same

### debugger.md (4 refs)
- Line 69: `.docs/reports/report-repo-codebase-summary-<date>.md` → `the reports directory (per /docs/layout)/report-repo-codebase-summary-...`
- Line 70: `.docs/reports/report-repo-codebase-summary-$(date +%Y-%m-%d).md` → same
- Line 109: `.docs/reports/report-repo-codebase-summary-*.md` → same
- Line 110: `.docs/reports/report-repo-codebase-summary-$(date +%Y-%m-%d).md` → same

### demand-gen-specialist.md (1 ref)
- Line 128: `.docs/canonical/plans/plan-repo-campaign-2026-q4.md` → `{CANONICAL_ROOT}/plans/plan-repo-campaign-...`

### devsecops-engineer.md (4 refs)
- Line 1089: `# When tied to an initiative, add initiative + initiative_name to front matter (see .docs/AGENTS.md initiative naming).` → `...see learnings file...`
- Line 1090: `.docs/reports/report-repo-security-audit-$(date +%Y-%m-%d).md` → `{REPORTS_DIR}/report-repo-security-audit-...`
- Line 1111: `.docs/reports/report-repo-security-audit-...` → same
- Line 1112: `.docs/reports/report-repo-security-audit-...` → same

### docs-reviewer.md (8 refs)
- Line 314: `this repo's .docs/ or learnings` → `this repo's learnings file`; `.docs/AGENTS.md` → `learnings file (LEARNINGS_FILE per /docs/layout)`
- Line 316: `.docs/canonical/` → `canonical docs root (per /docs/layout)`; `.docs/AGENTS.md` → `learnings file`
- Line 326-327: `.docs/` → canonical docs root
- Line 1027: `.docs/canonical/adrs/adr-YYYYMMDD-authentication-approach.md` → `{ADR_DIR}/adr-YYYYMMDD-...`
- Line 1116: `.docs/**/*.md` for canonical docs; `.docs/canonical/**` → `canonical docs root (per /docs/layout)`
- Line 1167: `.docs/canonical/adrs/adr-YYYYMMDD-database-selection.md` → `{ADR_DIR}/adr-YYYYMMDD-...`
- Line 1229: `.docs/**/*.md` and `.docs/canonical/**` → canonical docs root

### dotnet-engineer.md (5 refs)
- Line 297: `.docs/reports/report-repo-performance-$(date +%Y-%m-%d).md` → `{REPORTS_DIR}/report-repo-performance-...`
- Line 314: `.docs/reports/report-repo-performance-after-...` → same
- Line 383: `.docs/reports/report-repo-security-audit-...` → same
- Line 387-388: `.docs/reports/report-repo-performance-security-...` → same
- Line 390: `.docs/reports/report-repo-security-audit-...` → same

### engineering-lead.md (4 refs)
- Line 98: `.docs/canonical/plans/plan-repo-auth-flow-2026.md` → `{CANONICAL_ROOT}/plans/plan-repo-...`
- Line 157: `.docs/canonical/plans/` → `canonical plans directory (per /docs/layout)`
- Line 181: `.docs/canonical/plans/plan-repo-<subject>.md` → `{CANONICAL_ROOT}/plans/plan-repo-...`
- Line 213: `.docs/canonical/backlogs/backlog-repo-<subject>.md` → `{CANONICAL_ROOT}/backlogs/backlog-repo-...`

### implementation-planner.md (8 refs)
- Line 113: `.docs/AGENTS.md` → learnings file; `.docs/canonical/plans/plan-<endeavor>-<subject>[-<timeframe>].md` → `{CANONICAL_ROOT}/plans/...`
- Line 419: `.docs/canonical/plans/plan-<endeavor>-<subject>-<timeframe>.md` → `{CANONICAL_ROOT}/plans/...`
- Line 421: `.docs/reports/` → `{REPORTS_DIR}/`
- Line 433: `.docs/canonical/plans/` → `{CANONICAL_ROOT}/plans/`; `.docs/AGENTS.md` → learnings file
- Line 434: `.docs/AGENTS.md` → learnings file
- Line 445: `.docs` path → canonical plan path
- Line 451: `.docs/canonical/plans/plan-repo-add-authentication-2026-02.md` → `{CANONICAL_ROOT}/plans/...`

### incident-responder.md (1 ref)
- Line 167: `.docs/reports/incidents/$ID/investigation-summary.md` → `{REPORTS_DIR}/incidents/$ID/investigation-summary.md`

## Migration Pattern Applied

| Hardcoded path | Portable replacement |
|---|---|
| `.docs/reports/` | `{REPORTS_DIR}/` (per `/docs/layout`) |
| `.docs/canonical/` | canonical docs root (per `/docs/layout`) |
| `.docs/canonical/plans/` | `{CANONICAL_ROOT}/plans/` |
| `.docs/canonical/backlogs/` | `{CANONICAL_ROOT}/backlogs/` |
| `.docs/canonical/adrs/` | `{ADR_DIR}/` |
| `.docs/canonical/assessments/` | `{CANONICAL_ROOT}/assessments/` |
| `.docs/canonical/waste-snake.md` | waste snake file (`WASTE_SNAKE` per `/docs/layout`) |
| `.docs/AGENTS.md` | learnings file (`LEARNINGS_FILE` per `/docs/layout`) |

For descriptive prose: "the reports directory (per `/docs/layout`)" or "canonical docs root (per `/docs/layout`)".
For template paths: `{REPORTS_DIR}/filename.md` or `{CANONICAL_ROOT}/plans/plan-repo-<subject>.md`.

## How to Resume

1. Read this handoff
2. Continue editing files 3-18 using the exact references listed above
3. For each file: grep for `.docs/`, apply the mapping, verify with grep after
4. The Edit tool intermittently fails with `replace_all` type errors — retry when this happens
5. Commit after each batch of 3-5 files to avoid losing work

## Notes

- The Edit tool had intermittent `replace_all` type errors — about 50% of calls failed and needed retry
- Bash was blocked at 65% context by the context-gate hook — only git commands allowed
- All reads of all 18 files were completed successfully; the exact references are documented above
