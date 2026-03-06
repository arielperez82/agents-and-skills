# Handoff: I36-DLAYO — Doc Layout Discovery (Session 3)

**Date:** 2026-03-07
**Context exhaustion:** 61%
**Phase:** Phase 4 Build — Wave 2 partially complete (B05 done, B06 done, B04 pending, B07 pending)

## What Was Completed This Session

### Phases 0-3: All complete and auto-approved
- **Phase 0 (Discover):** Fast-tracked. Product-director GO. Claims-verifier skipped (internal only).
- **Phase 1 (Define):** Charter (6 stories, 10 backlog items, 4 waves) + 19 BDD scenarios.
- **Phase 2 (Design):** Backlog with architecture design. No ADR (simple). No panel (light).
- **Phase 3 (Plan):** 9-step plan across 4 waves.

### Phase 4 Build Progress
- **Wave 1 (Steps 1-2): COMPLETE** — Committed `0488ce7`
  - `commands/docs/layout.md` created (new command)
  - `CLAUDE.md` Doc Layout section added

- **Wave 2 (Steps 3-6): PARTIAL**
  - **Step 4 (B05 commands): COMPLETE** — All 16 non-locate command files migrated. Zero `.docs/` refs remain in commands except `locate/` (to be deleted).
  - **Step 5 (B06 skills): COMPLETE** — All skill files migrated. Committed across `dbb19d6` and `d2364a9`. Remaining `.docs/` in skills are concept names (platform name in delivery-team, diagram labels in planning).
  - **Step 3 (B04 agents): NOT STARTED** — 235 refs across 35 files. First subagent exhausted context before starting. Second batch blocked by 60% context gate.
  - **Step 6 (B07 CLAUDE.md refs): NOT STARTED** — 6 refs in CLAUDE.md (outside Doc Layout section).

### Commits
1. `0488ce7` — Wave 1: /docs/layout command + CLAUDE.md Doc Layout section (B01, B02, B03)
2. `dbb19d6` — Partial Wave 2: commands + partial skills (B05, B06 partial)
3. `d2364a9` — Remaining skill migrations (B06 complete)

## What Still Needs to Happen

### Phase 4 Build (remaining)

1. **Step 3 (B04): Migrate 35 agent files** — 235 `.docs/` refs across:
   - `agents/adr-writer.md` (7), `agents/agent-author.md` (2), `agents/agile-coach.md` (3), `agents/architect.md` (2), `agents/brainstormer.md` (1), `agents/claims-verifier.md` (3), `agents/code-reviewer.md` (5), `agents/codebase-scout.md` (1), `agents/cto-advisor.md` (3), `agents/data-engineer.md` (3), `agents/debugger.md` (4), `agents/demand-gen-specialist.md` (1), `agents/devsecops-engineer.md` (4), `agents/docs-reviewer.md` (8), `agents/dotnet-engineer.md` (5), `agents/engineering-lead.md` (4), `agents/implementation-planner.md` (8), `agents/incident-responder.md` (1), `agents/java-engineer.md` (2), `agents/learner.md` (13), `agents/legacy-codebase-analyzer.md` (5), `agents/network-engineer.md` (4), `agents/observability-engineer.md` (4), `agents/product-analyst.md` (9), `agents/product-director.md` (7), `agents/product-manager.md` (1), `agents/progress-assessor.md` (65!), `agents/qa-engineer.md` (3), `agents/researcher.md` (4), `agents/seo-strategist.md` (4), `agents/senior-project-manager.md` (10), `agents/technical-writer.md` (2), `agents/ui-designer.md` (2), `agents/ux-researcher.md` (4), `agents/README.md` (31)
   - **Recommendation:** Split into 3-4 subagent batches of ~9 files each, or use 2 batches focusing on heavy files first. Progress-assessor (65 refs) and README (31 refs) need dedicated attention.

2. **Step 6 (B07): Migrate CLAUDE.md path refs** — 6 hardcoded `.docs/` refs in existing sections (not the new Doc Layout section)

3. **Steps 7-8 (Wave 3):** Delete 6 `/locate/*` commands, clean up `/locate/` refs in `watzup.md` and `standup-context/SKILL.md`

4. **Step 9 (Wave 4):** Add path existence warnings to `commands/docs/layout.md`

### Phase 5 (Validate)
Run `/review/review-changes --mode diff` once all build steps complete.

### Phase 6 (Close)
Dispatch close agents, commit artifacts, update status file.

## Migration Pattern (for next session)

Replace `.docs/` paths with portable `{KEY}` references:
- `.docs/reports/` → `{REPORTS_DIR}/`
- `.docs/canonical/` → `{CANONICAL_ROOT}/`
- `.docs/canonical/plans/` → `{CANONICAL_ROOT}/plans/`
- `.docs/canonical/adrs/` → `{ADR_DIR}/`
- `.docs/canonical/waste-snake.md` → `WASTE_SNAKE`
- `.docs/AGENTS.md` → `LEARNINGS_FILE`
- In prose: "the reports directory (per `/docs/layout`)"
- In templates: `{REPORTS_DIR}/report-repo-<subject>.md`

## Key Files

- **Status file:** `.docs/reports/report-repo-craft-status-I36-DLAYO.md`
- **Plan:** `.docs/canonical/plans/plan-repo-I36-DLAYO-doc-layout-discovery.md`
- **Charter:** `.docs/canonical/charters/charter-repo-I36-DLAYO-doc-layout-discovery.md`
- **Scenarios:** `.docs/canonical/charters/charter-repo-I36-DLAYO-doc-layout-discovery-scenarios.md`
- **Backlog:** `.docs/canonical/backlogs/backlog-repo-I36-DLAYO-doc-layout-discovery.md`
- **New command:** `commands/docs/layout.md`
- **Audit (reference):** `.docs/reports/audit-260306-hardcoded-doc-paths.md`

## Resume Command

```
/craft:resume I36-DLAYO — Phase 4 Build in progress. Steps 1, 2, 4, 5 complete. Steps 3, 6, 7, 8, 9 remain. Status file at .docs/reports/report-repo-craft-status-I36-DLAYO.md. Next: Step 3 (migrate 35 agent files from hardcoded .docs/ to /docs/layout). Split progress-assessor.md (65 refs) and README.md (31 refs) as priority. Then Steps 6-9 + Phases 5-6. DO NOT re-read craft.md or research artifacts — all context is in this handoff.
```

## Lesson Learned

Subagents for bulk markdown migration need scoped batches of ~10 files max. The first attempt with 35 files + full migration instructions exhausted context before any edits. The second (commands subagent, 16 files) succeeded because command files have fewer refs. Third attempt (skills, 24 files) succeeded. Agent files should be split into 3+ batches of ~10 files, with heavy files (progress-assessor, README) in their own dedicated batch.
