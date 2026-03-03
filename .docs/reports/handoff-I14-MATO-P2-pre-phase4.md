---
type: handoff
initiative: I14-MATO
phase: pre-phase-4
timestamp: "2026-03-03"
context_usage_at_snapshot: 61%
---

# Handoff Snapshot: I14-MATO Phase 2 — Pre-Phase 4

## Status

Phases 0-3 COMPLETE and committed. Phase 4 (Build) not started.

| Phase | Status | Commit | Key Artifacts |
|-------|--------|--------|---------------|
| 0 Discover | APPROVED | `8c616ca` | Research, strategic assessment, claims verification (all PASS) |
| 1 Define | APPROVED | `d57ca6d` | Backlog (7 stories B1-B7), BDD scenarios (18 across 6 features) |
| 2 Design | APPROVED | `a788628` | Technical design (build_argv per backend, separate telemetry_helper) |
| 3 Plan | APPROVED | `a27cfb3` | Implementation plan (7 steps, 3 tracks) |
| 4 Build | PENDING | — | — |
| 5 Validate | PENDING | — | — |
| 6 Close | PENDING | — | — |

Status file: `.docs/reports/report-repo-craft-status-I14-MATO-P2.md`

## What This Initiative Does

Activates cross-vendor agent dispatch so Claude actually delegates T2 work to Gemini/Codex instead of doing everything itself. Four layers:
- Layer 1A: CLAUDE.md dispatch rules (zero-code)
- Layer 2: Python client backends (gemini + codex in cli_client.py)
- Layer 1B: /dispatch command
- Layer 3: Pre-flight health check + telemetry

## Implementation Plan Summary (Phase 4 Input)

Plan: `.docs/canonical/plans/plan-repo-I14-MATO-P2-implementation.md`

**3 tracks, 7 steps:**

```
TRACK A (docs, parallel)     TRACK B (python, parallel)
  Step 1: B1 CLAUDE.md         Step 2: B2 cli_client refactor
                                Step 3: B3 codex_client.py
                                Step 4: B4 gemini_client.py
         |                              |
         +------------------------------+
                      |
              TRACK C (integration, sequential)
                Step 5: B6 preflight.py
                Step 6: B7 telemetry_helper.py
                Step 7: B5 /dispatch command
```

Tracks A+B are PARALLEL. Track C starts after both complete.

## Key Technical Decisions (from Design)

1. **Per-backend `build_argv` in `_BACKENDS`** — each backend gets a lambda that builds subprocess argv. Codex uses `["codex", "exec", prompt]` (positional), Gemini uses `["-p", prompt, "-o", fmt]`
2. **Auto-detect order**: claude → codex → gemini → cursor
3. **Telemetry**: separate `telemetry_helper.py` (not in cli_client.py). Direct HTTP POST to Tinybird. Best-effort, never blocks.
4. **Pre-flight**: `preflight.py` with ThreadPoolExecutor, 10s probe timeout, 1hr cache in /tmp
5. **`/dispatch`**: Markdown command (not Python). Claude interprets classification rules.

## Key Files

| File | Status | Purpose |
|------|--------|---------|
| `skills/orchestrating-agents/scripts/cli_client.py` | EXISTS, MODIFY | Add build_argv + gemini/codex backends |
| `skills/orchestrating-agents/scripts/cursor_client.py` | EXISTS | Pattern for wrappers |
| `skills/orchestrating-agents/scripts/test_cli_client.py` | EXISTS, MODIFY | Add new backend tests |
| `skills/orchestrating-agents/scripts/codex_client.py` | NEW | Thin wrapper |
| `skills/orchestrating-agents/scripts/gemini_client.py` | NEW | Thin wrapper + ANSI strip |
| `skills/orchestrating-agents/scripts/telemetry_helper.py` | NEW | Tinybird POST |
| `skills/orchestrating-agents/scripts/preflight.py` | NEW | Cached backend probes |
| `commands/dispatch/dispatch.md` | NEW | Tier classification command |
| `CLAUDE.md` | MODIFY | T2 delegation triggers section |

## craft:auto Protocol Reminders

- Mode: `auto` — auto-approve gates, commit incrementally
- Phase 4 uses `/code:auto` per plan step
- Step Reviews: `/review/review-changes --mode diff`, auto-approve if 0 Fix Required
- Story Reviews: full-mode, auto-approve if no Critical/High from cognitive-load-assessor
- Phase 5: auto-approve if 0 Fix Required
- Phase 6: auto-commit close artifacts via `/git/cm`
- Red flags pause: security warnings, >50 files, agent errors, external side effects

## Resume Instructions

1. Read this snapshot + status file
2. Start Phase 4 Build
3. Execute plan steps 1-7 per the implementation plan
4. For each step: write tests first (TDD), implement, run tests, commit
5. Track A (Step 1) and Track B (Steps 2-4) can be parallel
6. Track C (Steps 5-7) after both tracks complete
