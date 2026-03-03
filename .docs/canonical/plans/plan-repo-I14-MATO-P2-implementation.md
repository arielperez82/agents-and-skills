---
type: plan
endeavor: repo
initiative: I14-MATO
initiative_name: multi-agent-token-optimization
phase: 2
status: active
updated: 2026-03-03
---

# Implementation Plan: I14-MATO Phase 2 -- Cross-Vendor Dispatch

## Dependency Graph

```
TRACK A (docs)              TRACK B (python)
  Step 1: B1                  Step 2: B2 -> Step 3: B3 -> Step 4: B4
     |                                  |
     +----------------------------------+
                    |
            TRACK C (integration, sequential)
              Step 5: B6
              Step 6: B7
              Step 7: B5
```

TRACK A and TRACK B are PARALLEL. TRACK C starts after both complete.

---

## TRACK A -- Documentation (parallel with Track B)

### Step 1: B1 -- CLAUDE.md T2 Delegation Rules

**What:** Add "T2 Delegation Triggers" section to `CLAUDE.md` after "Route work to the cheapest capable model" bullet.
**Files:** `CLAUDE.md`
**No tests** (zero-code change).

**Content to add:**
1. Task-to-backend routing table (summarization/boilerplate/doc-drafts -> gemini; code gen/refactoring scaffolds -> codex; lint/format/file-ops -> T1 local scripts)
2. Validation sandwich protocol: cheap generation + Claude validation
3. Pre-flight instruction: verify backend availability at session start
4. Fallback chain: gemini -> codex -> claude-haiku -> claude-sonnet

**AC (B1):** Routing table has clear precedence (T1 > T2 gemini/codex > T3 claude). Validation sandwich documented. Fallback chain specified.

---

## TRACK B -- Python Backends (parallel with Track A)

### Step 2: B2 -- Refactor _BACKENDS + build_argv (Walking Skeleton)

**What:** TDD refactor of `cli_client.py`. Add `build_argv` callable to each `_BACKENDS` entry. Refactor `_resolve_backend` to return registry key. Add codex+gemini entries. Update auto-detect order: claude -> codex -> gemini -> cursor.
**Files:**
- `skills/orchestrating-agents/scripts/test_cli_client.py` (modify -- add tests FIRST)
- `skills/orchestrating-agents/scripts/cli_client.py` (modify)

**TDD sequence:**
1. RED: Add test `test_codex_argv_has_exec_subcommand` -- assert argv = `["codex", "exec", prompt, "--sandbox", "read-only"]`
2. RED: Add test `test_gemini_argv_uses_short_output_flag` -- assert `-o` not `--output-format`
3. RED: Add test `test_auto_detect_order_four_backends` -- assert claude -> codex -> gemini -> cursor
4. RED: Update `test_raises_when_neither_cli_available` -- assert error lists all 4 backends
5. RED: Update `test_invalid_backend_raises` -- assert valid list includes codex/gemini
6. GREEN: Implement `build_argv` per backend, refactor `_resolve_backend` -> `_resolve_backend_key`
7. GREEN: Verify all existing claude/cursor tests still pass (no behavior change)

**AC (B2):** Per-backend argv builders produce correct flags. Auto-detect order is claude->codex->gemini->cursor. All pre-existing tests pass.

### Step 3: B3 -- Codex Backend + Wrapper

**What:** Create `codex_client.py` wrapper following `cursor_client.py` pattern.
**Files:**
- `skills/orchestrating-agents/scripts/test_codex_client.py` (new -- tests FIRST)
- `skills/orchestrating-agents/scripts/codex_client.py` (new)

**TDD sequence:**
1. RED: Test `invoke_codex` delegates to `invoke_cli(backend="codex")`
2. RED: Test default sandbox is `"read-only"` passed via extra_args
3. RED: Test model param adds `-m model_name` to extra_args
4. RED: Test special chars in prompt are handled (Codex positional arg)
5. RED: Test non-zero exit raises `CLIInvocationError`
6. GREEN: Implement `invoke_codex` + `CodexInvocationError = CLIInvocationError`

**AC (B3):** Wrapper delegates to `invoke_cli`. Sandbox defaults to read-only. Model param passed. Errors raise `CLIInvocationError`.

### Step 4: B4 -- Gemini Backend + Wrapper

**What:** Create `gemini_client.py` wrapper following same pattern. Adds ANSI stripping.
**Files:**
- `skills/orchestrating-agents/scripts/test_gemini_client.py` (new -- tests FIRST)
- `skills/orchestrating-agents/scripts/gemini_client.py` (new)

**TDD sequence:**
1. RED: Test `invoke_gemini` delegates to `invoke_cli(backend="gemini")`
2. RED: Test default approval_mode is `"yolo"` passed via extra_args
3. RED: Test ANSI escape codes stripped from output
4. RED: Test model param adds `-m model_name`
5. RED: Test auth failure error includes guidance message
6. GREEN: Implement `invoke_gemini` + `strip_ansi()` helper + `GeminiInvocationError = CLIInvocationError`

**AC (B4):** Wrapper delegates to `invoke_cli`. ANSI stripped. Approval mode defaults to yolo. Auth error has guidance.

---

## TRACK C -- Integration (sequential, after Tracks A+B complete)

### Step 5: B6 -- Pre-flight Health Check

**What:** Create `preflight.py` with cached backend probing.
**Files:**
- `skills/orchestrating-agents/scripts/test_preflight.py` (new -- tests FIRST)
- `skills/orchestrating-agents/scripts/preflight.py` (new)

**TDD sequence:**
1. RED: Test `check_backends()` returns dict of `{backend: bool}` for all registered backends
2. RED: Test results cached to temp file; second call within TTL returns cache without subprocess
3. RED: Test cache older than 1 hour triggers re-probe
4. RED: Test probe timeout (10s) marks backend unavailable, does not block others
5. RED: Test `force=True` bypasses cache
6. GREEN: Implement with `concurrent.futures.ThreadPoolExecutor`, JSON cache file

**AC (B6):** Returns availability map. Caches 1hr. Parallel probes. Timeout marks unavailable. Force bypasses cache.

### Step 6: B7 -- Telemetry Helper

**What:** Create `telemetry_helper.py`. Wire into `invoke_cli` post-subprocess.
**Files:**
- `skills/orchestrating-agents/scripts/test_telemetry_helper.py` (new -- tests FIRST)
- `skills/orchestrating-agents/scripts/telemetry_helper.py` (new)
- `skills/orchestrating-agents/scripts/cli_client.py` (modify -- add telemetry hook)
- `skills/orchestrating-agents/scripts/test_cli_client.py` (modify -- add telemetry integration test)

**TDD sequence:**
1. RED: Test `emit_invocation` POSTs to Tinybird when env vars set
2. RED: Test no-op when `TB_INGEST_TOKEN` missing (no error)
3. RED: Test HTTP error caught silently, logged as warning
4. RED: Test `invoke_cli` calls `emit_invocation` after subprocess (integration)
5. GREEN: Implement `emit_invocation` with `urllib.request.urlopen`. Wire into `invoke_cli`.

**AC (B7):** POSTs when configured. Silent no-op when unconfigured. Never blocks dispatch. Integrated into `invoke_cli`.

### Step 7: B5 -- /dispatch Command

**What:** Create markdown command for tier classification + backend routing.
**Files:**
- `commands/dispatch/dispatch.md` (new)

**No Python tests** (markdown command interpreted by Claude). Tested via B2-B4 backends + B6 pre-flight.

**Content:**
1. Tier classification rules (keyword-based: T1 local / T2 gemini|codex / T3 claude)
2. Backend selection with fallback chain: gemini -> codex -> haiku -> sonnet
3. Pre-flight integration: check `preflight.check_backends()` before dispatch
4. Output capture: return T2 result to Claude for validation sandwich
5. Invocation logging: print backend selected + tier + duration

**AC (B5):** Summarization -> T2 gemini. Security review -> T3. Format files -> T1 local. Fallback works. Metadata included.

---

## Final Step: Update SKILL.md

After all steps complete, update `skills/orchestrating-agents/SKILL.md` to v0.4.0 documenting Phase 2 changes (4 backends, dispatch command, pre-flight, telemetry).

---

## Execution Recommendation

- **Method:** Subagent-driven development
- **Agent:** `engineering-lead` with `subagent-driven-development` skill
- **Dispatch plan:**
  - **Parallel wave 1:** Step 1 (B1, T1-trivial docs edit) + Steps 2-4 (B2->B3->B4, sequential Python TDD)
  - **Sequential wave 2:** Steps 5-7 (B6->B7->B5) after wave 1 completes
- **Cost tiers:** Step 1 (T1 manual edit). Steps 2-4 (T2 pattern-following, codex/haiku capable). Steps 5-6 (T2). Step 7 (T1 markdown).
- **Estimated items:** 7 steps. Sub-steps (TDD RED/GREEN cycles): ~30 total.
