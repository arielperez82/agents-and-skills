---
type: backlog
endeavor: repo
initiative: I14-MATO
initiative_name: multi-agent-token-optimization
phase: 2
status: proposed
updated: 2026-03-03
---

# Backlog: I14-MATO Phase 2 -- Cross-Vendor Dispatch

Single continuous queue of changes for Phase 2. Ordered by dependency wave and charter layer. Implementers pull from here; execution is planned in the plan doc.

Changes touch: `CLAUDE.md`, `skills/orchestrating-agents/scripts/cli_client.py`, new wrapper modules (`codex_client.py`, `gemini_client.py`), `commands/dispatch/dispatch.md`, telemetry datasource/pipe, `skills/orchestrating-agents/SKILL.md`.

## Changes (ranked)

Full ID prefix: **I14-MATO**. In-doc shorthand: B1, B2, ... Cross-doc: use I14-MATO-B01, I14-MATO-B02, etc.

| ID | Change | Charter Layer | Wave | Status |
|----|--------|---------------|------|--------|
| B1 | CLAUDE.md T2 delegation rules | 1A | 1 | todo |
| B2 | Refactor `cli_client.py` to per-backend argv builders | 2 | 1 | todo |
| B3 | Codex backend + `codex_client.py` wrapper | 2 | 1 | todo |
| B4 | Gemini backend + `gemini_client.py` wrapper | 2 | 1 | todo |
| B5 | `/dispatch` command with tier classification | 1B | 2 | todo |
| B6 | Pre-flight backend health check with session caching | 3 | 2 | todo |
| B7 | Cross-vendor telemetry from `cli_client.py` | 3 | 2 | todo |

---

### B1 -- CLAUDE.md T2 Delegation Rules

**Layer:** 1A (zero-code, immediate value)
**User Story:** As a developer using Claude Code, I want Claude to automatically delegate T2 tasks to cheaper backends during normal workflow, so that I stop paying Opus/Sonnet prices for pattern-following work.

**Change:** Add a "T2 Delegation Triggers" section to `CLAUDE.md` containing:
1. Task-to-backend routing table (research/summarization/boilerplate/doc-drafts -> gemini; code generation/refactoring scaffolds -> codex; lint/format/file-ops -> T1 local scripts)
2. Validation sandwich protocol: cheap generation + Claude validation for T2 outputs
3. Pre-flight auth check instruction: at session start, verify backend availability before attempting dispatch
4. Fallback chain: gemini -> codex -> claude-haiku -> claude-sonnet

**Acceptance Criteria:**
- Given a new Claude Code session, when Claude encounters a summarization task, then it follows the routing table and attempts delegation to gemini before doing the work itself
- Given a T2 backend produces output, when Claude receives the result, then it validates the output before presenting it to the user (validation sandwich)
- Given a T2 backend is unavailable, when Claude attempts delegation, then it falls back to the next backend in the chain without user intervention
- Given the routing table in CLAUDE.md, when a task matches multiple categories, then the table has clear precedence rules (T1 local > T2 gemini/codex > T3 claude)

---

### B2 -- Refactor cli_client.py to Per-Backend Argv Builders

**Layer:** 2
**User Story:** As a developer extending the dispatch system, I want `cli_client.py` to use per-backend argv builder functions instead of hardcoded flag patterns, so that backends with different CLI conventions (positional args, different flags) work correctly.

**Change:** Refactor `invoke_cli` in `skills/orchestrating-agents/scripts/cli_client.py`:
1. Add `build_argv` callable to each `_BACKENDS` entry that constructs the full subprocess argv from (prompt, output_format, extra_args)
2. Claude/Cursor: `[binary, "-p", prompt, "--output-format", fmt]` (existing behavior)
3. Gemini: `[binary, "-p", prompt, "-o", fmt]` (uses `-o` not `--output-format`)
4. Codex: `[binary, "exec", prompt, "--sandbox", "read-only"]` (subcommand + positional arg, no `-p`, no `--output-format`)
5. Update `_resolve_backend` auto-detect order: claude -> codex -> gemini -> cursor (codex most reliable T2)
6. Update error message to list all four backends

**Acceptance Criteria:**
- Given backend="claude", when `invoke_cli` builds argv, then it produces `["claude", "-p", prompt, "--output-format", fmt]`
- Given backend="codex", when `invoke_cli` builds argv, then it produces `["codex", "exec", prompt, "--sandbox", "read-only"]` with no `-p` flag
- Given backend="gemini", when `invoke_cli` builds argv, then it produces `["gemini", "-p", prompt, "-o", fmt]` with `-o` not `--output-format`
- Given backend="auto", when resolving, then it checks claude -> codex -> gemini -> cursor in order
- Given existing Claude/Cursor tests, when refactoring is complete, then all existing tests still pass (no behavior change for claude/cursor)

---

### B3 -- Codex Backend + codex_client.py Wrapper

**Layer:** 2 (implement before B4 -- Codex is confirmed most reliable T2)
**User Story:** As a developer, I want to route T2 tasks to Codex CLI so that I leverage my Codex subscription for pattern-following work instead of paying Claude API tokens.

**Change:**
1. Add "codex" entry to `_BACKENDS` in `cli_client.py` with the argv builder from B2
2. Create `skills/orchestrating-agents/scripts/codex_client.py` wrapper following `cursor_client.py` pattern
3. Include `sandbox` parameter (default "read-only"), `model` parameter
4. Handle Codex-specific output: capture stdout directly (text mode); for structured output use `-o /tmp/file` and read file
5. Shell-escape prompts containing special characters (Codex `exec` positional arg is quoting-sensitive)
6. Tests for codex backend argv construction and wrapper functions

**Acceptance Criteria:**
- Given a prompt with special characters (quotes, backticks), when invoking codex, then the prompt is properly shell-escaped in the positional argument
- Given `codex_client.py` is called with default parameters, when it invokes the CLI, then it passes `--sandbox read-only`
- Given Codex returns non-zero exit code, when the wrapper catches the error, then it raises `CLIInvocationError` with the stderr content
- Given Codex times out, when the timeout expires, then the wrapper raises `CLIInvocationError` with a timeout message
- Given a model parameter is provided, when building argv, then `-m model_name` is included in the command

---

### B4 -- Gemini Backend + gemini_client.py Wrapper

**Layer:** 2 (implement after B3)
**User Story:** As a developer, I want to route summarization, boilerplate, and documentation drafts to Gemini CLI so that these tasks cost zero additional API tokens.

**Change:**
1. Add "gemini" entry to `_BACKENDS` in `cli_client.py` with the argv builder from B2
2. Create `skills/orchestrating-agents/scripts/gemini_client.py` wrapper following `cursor_client.py` pattern
3. Include `approval_mode` parameter (default "yolo" for non-interactive), `model` parameter
4. Strip ANSI escape codes from Gemini output (Gemini `-o text` may include terminal formatting)
5. Handle `GEMINI_API_KEY` auth path (no interactive OAuth in subprocess mode)
6. Tests for gemini backend argv construction and wrapper functions

**Acceptance Criteria:**
- Given a prompt, when invoking gemini, then it passes `--approval-mode yolo` by default for non-interactive use
- Given Gemini output contains ANSI escape codes, when the wrapper processes the response, then escape codes are stripped from the returned text
- Given `GEMINI_API_KEY` is not set and OAuth is not pre-authenticated, when invocation fails, then the error message includes auth guidance ("run `gemini` interactively first or set GEMINI_API_KEY")
- Given a model parameter is provided, when building argv, then `-m model_name` is included
- Given output format "json" is requested, when building argv, then `-o json` is passed (not `--output-format json`)

---

### B5 -- /dispatch Command with Tier Classification

**Layer:** 1B (depends on B1 routing table + B2-B4 backends)
**User Story:** As a developer, I want a `/dispatch` command that classifies a task's cognitive tier and routes it to the cheapest capable backend, so that I get structured routing with fallback without manually choosing backends.

**Change:**
1. Create `commands/dispatch/dispatch.md` command definition
2. Classification logic (rule-based, not ML): keywords "summarize", "boilerplate", "draft", "list", "format" -> T2; keywords "architecture", "security", "design", "review critical" -> T3; file operations, lint, format -> T1 (local script); default -> T2
3. Backend selection with fallback chain: gemini -> codex -> haiku -> sonnet
4. Pre-flight check integration: verify backend available before attempting (use B6 cached results if available)
5. Output capture: return result to Claude for validation if T2, pass through if T1
6. Invocation logging: print which backend was selected and why

**Acceptance Criteria:**
- Given a task description "summarize the changes in this PR", when `/dispatch` classifies it, then it assigns tier T2 and routes to gemini (first in fallback chain)
- Given a task "review this code for security vulnerabilities", when `/dispatch` classifies it, then it assigns tier T3 and does not delegate (T3 stays with Claude)
- Given gemini is unavailable, when `/dispatch` attempts gemini and fails pre-flight, then it falls back to codex without user interaction
- Given all T2 backends are unavailable, when fallback chain is exhausted, then it falls back to claude-haiku with a warning message
- Given `/dispatch` completes a T2 task, when returning the result, then it includes metadata: backend used, tier assigned, duration
- Given a T1 task (e.g., "format this file"), when `/dispatch` classifies it, then it recommends a local command rather than invoking a CLI backend

---

### B6 -- Pre-flight Backend Health Check with Session Caching

**Layer:** 3 (depends on B2-B4 backend registry)
**User Story:** As a developer, I want backend availability verified once at session start and cached, so that dispatch attempts do not waste 10-30 seconds per invocation on health checks.

**Change:**
1. Create pre-flight check function in `cli_client.py` (or separate `preflight.py`): for each backend in `_BACKENDS`, verify binary exists on PATH and responds to a minimal probe (`claude -p "OK"`, `codex exec "OK"`, `gemini -p "OK"`)
2. Cache results in a temp file (`/tmp/mato-preflight-{session_id}.json`) with timestamp
3. Cache validity: 1 hour (skip re-check if cached results are fresh)
4. Return availability map: `{"claude": true, "codex": true, "gemini": false, "cursor": false}`
5. Integrate with CLAUDE.md dispatch rules (B1): reference pre-flight at session start
6. Run probes in parallel (subprocess per backend) to minimize wall-clock time

**Acceptance Criteria:**
- Given a fresh session with no cache, when pre-flight runs, then it probes all configured backends and writes results to the cache file
- Given a cached result less than 1 hour old, when pre-flight is called again, then it returns cached results without re-probing
- Given a cached result older than 1 hour, when pre-flight is called, then it re-probes all backends
- Given one backend probe times out (>10s), when pre-flight completes, then that backend is marked unavailable and others are not blocked
- Given pre-flight results, when `/dispatch` (B5) selects a backend, then it skips backends marked unavailable in the cache

---

### B7 -- Cross-Vendor Telemetry from cli_client.py

**Layer:** 3 (depends on B2-B4 backends being invokable)
**User Story:** As a developer, I want non-Claude CLI invocations tracked in Tinybird, so that I can see cross-vendor usage and measure actual cost savings from dispatch.

**Change:**
1. Add telemetry emission to `invoke_cli` in `cli_client.py`: after each successful or failed invocation, POST to Tinybird append API
2. Create Tinybird datasource: `cross_vendor_invocations` with schema (timestamp, backend, model, prompt_length, response_length, duration_ms, exit_code, session_id, task_tier)
3. Python telemetry helper: read `TB_INGEST_TOKEN` and `TB_HOST` from environment, HTTP POST to Tinybird Events API
4. Best-effort: if env vars missing or POST fails, log warning and continue (never block dispatch)
5. Create or extend Tinybird pipe: `cross_vendor_usage` aggregating invocations by backend, model, day
6. Update `orchestrating-agents` SKILL.md to v0.4.0 documenting all Phase 2 changes

**Acceptance Criteria:**
- Given `TB_INGEST_TOKEN` and `TB_HOST` are set, when `invoke_cli` completes, then a telemetry event is POSTed to Tinybird with backend, duration_ms, exit_code, and prompt/response lengths
- Given `TB_INGEST_TOKEN` is not set, when `invoke_cli` completes, then no telemetry POST is attempted and no error is raised
- Given a Tinybird POST fails (network error, 4xx, 5xx), when the failure occurs, then a warning is logged and the dispatch result is still returned normally
- Given multiple cross-vendor invocations over a day, when querying the `cross_vendor_usage` pipe, then it returns aggregated counts and durations by backend
- Given the `orchestrating-agents` SKILL.md, when Phase 2 is complete, then it documents all four backends, the dispatch command, pre-flight protocol, and telemetry schema at version 0.4.0

---

## Parallelization Strategy

**Wave 1 (parallel -- start immediately):**
- B1: CLAUDE.md dispatch rules (zero-code, immediate behavioral change)
- B2: Refactor cli_client.py argv builders (enables B3 and B4)
- B3: Codex backend + wrapper (depends on B2; implement in sequence B2 then B3)
- B4: Gemini backend + wrapper (depends on B2; can parallel with B3 after B2 done)

Within Wave 1, B2 -> B3 -> B4 is the code sequence. B1 is fully independent.

**Wave 2 (depends on Wave 1):**
- B5: /dispatch command (needs B1 routing table + B2-B4 backends)
- B6: Pre-flight health check (needs B2-B4 backend registry)
- B7: Cross-vendor telemetry (needs B2-B4 backends invokable)

B5, B6, B7 are independent of each other within Wave 2.

## Dependency Graph

```
B1 (CLAUDE.md rules) ─────────────────┐
                                       ├── B5 (/dispatch command)
B2 (argv refactor) ──┬── B3 (codex) ──┤
                     │                 ├── B6 (pre-flight)
                     └── B4 (gemini) ──┤
                                       └── B7 (telemetry)
```

## Backlog Item Lens (per charter)

- **Charter outcome:** Phase 2 layers 1A, 1B, 2, 3 all covered. US-3/US-4 map to B3/B4. US-5 (split-tier) addressed through B5 classification. US-6 (task classifier) is B5 core logic.
- **Value/impact:** B1 alone transforms Claude behavior (zero-code, highest leverage). B2-B4 enable programmatic dispatch. B5-B7 add structure, reliability, and observability.
- **Engineering:** Python code changes in `skills/orchestrating-agents/scripts/`. Tests required for B2-B4, B6, B7. B1 and B5 are markdown only.
- **Risks:** Codex positional arg quoting (mitigated by shell-escape in B3). Gemini ANSI output (mitigated by strip in B4). Pre-flight latency (mitigated by parallel probes + caching in B6). Telemetry failure (mitigated by best-effort in B7).
- **Rollback:** Revert CLAUDE.md section (B1). Delete wrapper files and revert cli_client.py (B2-B4). Delete command file (B5). Delete preflight and telemetry additions (B6-B7). All changes are additive.
- **Definition of done:** `/review/review-changes` passes. All Python changes have tests. CLAUDE.md dispatch rules are actionable (not aspirational). Orchestrating-agents SKILL.md updated to v0.4.0.
