---
type: handoff
initiative: I14-MATO
phase: post-phase-4
timestamp: "2026-03-03"
context_usage_at_snapshot: ~75%
---

# Handoff Snapshot: I14-MATO Phase 2 — Post-Phase 4

## Status

Phases 0-4 COMPLETE and committed. Phase 5 (Validate) done inline. Phases 5-6 remaining for formal close.

| Phase | Status | Commit | Key Artifacts |
|-------|--------|--------|---------------|
| 0 Discover | APPROVED | `8c616ca` | Research, strategic assessment, claims verification |
| 1 Define | APPROVED | `d57ca6d` | Backlog (7 stories B1-B7), BDD scenarios (18) |
| 2 Design | APPROVED | `a788628` | Technical design (build_argv per backend) |
| 3 Plan | APPROVED | `a27cfb3` | Implementation plan (7 steps, 3 tracks) |
| 4 Build | APPROVED | `642bebe` | All 7 steps complete, 51 tests, review fixes applied |
| 5 Validate | DONE (inline) | — | 3 reviewers ran: PM, code-reviewer, security-engineer |
| 6 Close | PENDING | — | — |

Status file: `.docs/reports/report-repo-craft-status-I14-MATO-P2.md`

## What Was Built (Phase 4)

Cross-vendor agent dispatch across 4 CLI backends (claude, codex, gemini, cursor).

### Files Created
| File | Purpose |
|------|---------|
| `skills/orchestrating-agents/scripts/codex_client.py` | Codex wrapper (delegates to invoke_cli) |
| `skills/orchestrating-agents/scripts/gemini_client.py` | Gemini wrapper + ANSI strip + approval_mode allowlist |
| `skills/orchestrating-agents/scripts/preflight.py` | Cached backend probing (1hr TTL, symlink-safe) |
| `skills/orchestrating-agents/scripts/telemetry_helper.py` | Best-effort Tinybird POST (HTTPS-only) |
| `commands/dispatch/dispatch.md` | /dispatch command — tier classification + fallback chain |
| `skills/orchestrating-agents/scripts/test_codex_client.py` | 6 tests |
| `skills/orchestrating-agents/scripts/test_gemini_client.py` | 8 tests |
| `skills/orchestrating-agents/scripts/test_preflight.py` | 5 tests |
| `skills/orchestrating-agents/scripts/test_telemetry_helper.py` | 5 tests |

### Files Modified
| File | Changes |
|------|---------|
| `skills/orchestrating-agents/scripts/cli_client.py` | build_argv per backend, 4 backends, auto-detect order, telemetry on all exit paths |
| `skills/orchestrating-agents/scripts/test_cli_client.py` | +7 new tests (backend argv, telemetry integration) |
| `CLAUDE.md` | T2 Delegation Triggers section (routing table, validation sandwich, fallback chain) |

### Test Coverage
51 tests total, all passing. Covers: auto-detection order, per-backend argv shapes, wrapper delegation, ANSI stripping, approval_mode allowlist, cache TTL, telemetry emission/suppression, HTTPS enforcement, backward compatibility.

## Key Decisions Made During Build

1. **`--approval-mode yolo` (two-arg)** over `--yolo` (single flag) — proper Gemini CLI form, validated against allowlist
2. **Telemetry on all exit paths** — `_emit_telemetry()` called on success, non-zero exit, timeout, and FileNotFoundError to avoid survivorship bias
3. **HTTPS enforcement** — telemetry_helper silently refuses to send bearer tokens over non-HTTPS
4. **Symlink-safe cache writes** — preflight checks for symlinks before writing, uses `O_CREAT | O_TRUNC` with `0600` permissions
5. **`shutil.which` for probes** — pragmatic simplification over full subprocess health checks (documented as acceptable)

## Phase 5 Review Summary (Done Inline)

Three reviewers ran in parallel:

### Product Manager: ACCEPT WITH CAVEATS
- Core architecture delivered, B1-B7 ACs largely met
- **Noted gaps (non-blocking):** SKILL.md not updated to v0.4.0, Tinybird datasource/pipe files not created, telemetry payload narrower than B7 spec (missing exit_code, response_length, session_id)
- **Accepted simplifications:** shutil.which instead of subprocess probes, list-based argv handling shell-escaping

### Code Reviewer: Fix Required 3 → All Fixed
- H1: approval_mode flag construction → fixed (allowlist + two-arg flag)
- H2: telemetry survivorship bias → fixed (emit on all paths)
- H3: codex silently ignores output_format → accepted (documented behavior, Codex CLI uses exec subcommand)

### Security Engineer: FAIL → All Fixed
- HIGH: approval_mode allowlist → fixed
- MEDIUM: HTTPS enforcement → fixed
- MEDIUM: symlink-safe cache → fixed

## Remaining Work for Phase 6 (Close)

1. **product-director** — charter delivery acceptance (reconciliation table + verdict)
2. **senior-project-manager** — deviation audit
3. **progress-assessor** — finalize status report
4. **learner** — capture patterns (build_argv strategy, telemetry on all paths, HTTPS-only telemetry)
5. **docs-reviewer** — update permanent docs
6. **SKILL.md update** — bump orchestrating-agents to v0.4.0 documenting Phase 2 changes (PM flagged)
7. Update status file phases 5+6

## Resume Instructions

1. Read this snapshot + status file
2. Update status file: Phase 5 → approved
3. Start Phase 6 Close with the 5 closing agents
4. Update SKILL.md to v0.4.0
5. Final commit via /git/cm
