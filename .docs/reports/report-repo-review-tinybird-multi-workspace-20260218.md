# Code Review: Tinybird Multi-Workspace & Dynamic Port Changes

**Date:** 2026-02-18
**Reviewer:** code-reviewer (via claude-opus-4-6)
**Scope:** 6 files — Tinybird local development docs, dynamic-port wrapper script, integration test helper

## Summary

Documents the preferred approach for running multiple Tinybird projects locally: one Local instance with multiple workspaces (preferred) vs. multiple containers with dynamic ports (fallback). Adds a shell wrapper script for the multi-container case and generalizes the integration test host check to accept any port.

## Files Reviewed

| File | Change |
|------|--------|
| `skills/engineering-team/tinybird/rules/local-development.md` | +6 — new "Multiple projects / concurrency" section |
| `skills/engineering-team/tinybird/rules/typescript-sdk.md` | +1/-1 — clarify workspace-per-branch behavior |
| `telemetry/README.md` | +17/-2 — restructure into Option A/B/C |
| `telemetry/package.json` | +2/-1 — add `tinybird:local` script |
| `telemetry/scripts/tinybird-local-start.sh` | +89 — new dynamic-port wrapper |
| `telemetry/tests/integration/helpers/wait-for-tinybird.ts` | +1/-1 — generalize `isLocalHost` regex |

## Findings

### Fix Required

| # | File | Issue |
|---|------|-------|
| 1 | `tinybird-local-start.sh:30-38` | **`start_or_create` silences failures.** The `docker start ... && echo "$port"` pattern swallows errors. If `docker start` fails (e.g. port bound by a non-Docker process), the only output is a generic "failed to start or create" message with no diagnostic info. Replace the `&&` chains with explicit `if ! docker start ...; then echo "..." >&2; return 1; fi` so the user gets actionable errors. |
| 2 | `telemetry/package.json:30` | **Script assumes executable bit.** `"tinybird:local": "scripts/tinybird-local-start.sh"` will fail with "permission denied" if the executable bit is lost (Windows/WSL, `core.fileMode=false`). Change to `"sh scripts/tinybird-local-start.sh"`. |
| 3 | `telemetry/README.md` (Option B) | **`TB_TOKEN` export vs `.env.local` conflict.** Option B exports `TB_TOKEN` to the shell, but `pnpm tinybird:build` loads `../.env.local` via `dotenv-cli`, which would override the shell env var if `.env.local` has a different token. Clarify whether `TB_TOKEN` should be set in `.env.local` or whether the shell export takes precedence with `dotenv-cli`. |

### Suggestions

| # | File | Suggestion |
|---|------|------------|
| 4 | `tinybird-local-start.sh:41-63` | **`fetch_token` retry gives no diagnostic on timeout.** If `/tokens` returns a body without `workspace_admin_token`, the script waits 30s then fails generically. Log the response body on the last attempt so the user can diagnose. |
| 5 | `local-development.md:42`, `README.md` Option B | **Workspace token retrieval is underspecified.** Both files say to use the "workspace token" but don't show the actual command to get it. Add a concrete command (e.g. `tb local generate-tokens` or which key to read from `.tinyb`). |
| 6 | `typescript-sdk.md:81` | **SDK workspace note hedges too much.** "May use or create" with a link to "confirm current behavior" is vague for a reference rule file. Document the actually-observed behavior instead. |
| 7 | `tinybird-local-start.sh:1` | **Verify shellcheck coverage.** Script is POSIX-clean (good), but confirm the pre-commit hook / shellcheck covers this new file. |
| 8 | `tinybird-local-start.sh:17-27` | **`find_free_port` doesn't detect non-Docker port conflicts.** If a non-Docker process holds a port, the script will try to bind it and fail. Consider mentioning this as a known limitation. |

### Correct / No Concerns

| # | File | Note |
|---|------|------|
| 9 | `wait-for-tinybird.ts:12` | **`isLocalHost` regex is correct and safe.** Properly anchored (`^...$`), accepts any port via `(:\d+)?`, handles both `localhost` and `127.0.0.1`, strips trailing slash before test. Good generalization for the dynamic-port case. |
| 10 | All three doc files | **Documentation is internally consistent.** Option A/B/C structure in README maps cleanly to local-development.md. Cross-references (README to skill, skill to typescript-sdk.md) are accurate. Preferred/alternative ordering is consistent. |
| 11 | `tinybird-local-start.sh:85-88` | **`TELEMETRY_TINYBIRD_ENV_FILE` naming is clear.** Project-prefixed env var avoids collision. Writes `KEY=value` (no `export`) — correct for `dotenv-cli` consumption. |
| 12 | `tinybird-local-start.sh:49-53` | **`jq`-optional fallback is a good portability choice.** The `sed` pattern handles compact JSON from the Tinybird Local tokens endpoint. |
| 13 | README.md | **`eval $(...)` pattern is safe here.** Values come from localhost URL and Tinybird-generated token — no injection risk. Script outputs properly quoted `export` statements with semicolons. |

## Verdict

| Tier | Count |
|------|-------|
| Fix Required | 3 |
| Suggestions | 5 |
| Correct / No Concerns | 5 |

**Action:** Address the three fix-required items before merging. Items 1 and 2 are quick fixes; item 3 needs a decision on `dotenv-cli` override behavior (test it, then update the docs accordingly).
