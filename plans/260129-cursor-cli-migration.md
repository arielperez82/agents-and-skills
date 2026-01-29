# Implementation Plan: Orchestrating-Agents — Claude CLI to Cursor CLI Migration

**Plan ID:** 260129-cursor-cli-migration  
**Scope:** `skills/orchestrating-agents`  
**Goal:** Replace Anthropic API (Claude) with Cursor CLI (`agent`) for all programmatic invocations while preserving public API shape and use cases where feasible.

**References:**
- [Cursor CLI — Using Agent](https://cursor.com/docs/cli/using)
- [Cursor CLI — Overview](https://cursor.com/docs/cli/overview)
- AGENTS.md (small tasks, TDD, incremental)
- skill-creator (SKILL.md, references, no aux docs)

---

## 1. Context and Scope

### 1.1 Current State
- **Backend:** `scripts/claude_client.py` — direct Anthropic API usage (`anthropic` package).
- **Capabilities:** `invoke_claude`, `invoke_parallel`, `invoke_claude_streaming`, `invoke_parallel_streaming`, `invoke_parallel_interruptible`, `ConversationThread`, prompt caching, `InterruptToken`.
- **Config:** API key from `ANTHROPIC_API_KEY.txt` or `API_CREDENTIALS.json`.
- **Docs:** SKILL.md, `references/workflows.md`, `references/api-reference.md` — all reference Claude/Anthropic.

### 1.2 Target State
- **Backend:** Cursor CLI as execution engine: subprocess calls to `agent` (e.g. `agent -p "<prompt>" --output-format text`).
- **Config:** No API key in skill; Cursor uses existing auth (user must have `agent` installed and authenticated).
- **Public API:** Same function names and signatures where possible; document behavioral differences (e.g. no prompt caching, optional streaming).

### 1.3 Out of Scope (Explicit)
- Migrating other skills or agents to Cursor CLI.
- Adding new features beyond current orchestrating-agents behavior.
- Supporting both Claude API and Cursor CLI in one skill (single backend: Cursor CLI).

---

## 2. Cursor CLI Contract (Source of Truth)

From [Cursor docs](https://cursor.com/docs/cli/using) and [overview](https://cursor.com/docs/cli/overview):

| Concern | Cursor CLI |
|--------|------------|
| **Command** | `agent` |
| **Non-interactive** | `-p` or `--print` |
| **Pass prompt** | `agent -p "your prompt here"` |
| **Output format** | `--output-format text` or `--output-format json` |
| **Modes** | `--mode=plan`, `--mode=ask` (default: agent) |
| **Resume thread** | `--resume <thread id>`; list threads: `agent ls`; resume latest: `agent resume` |
| **Rules** | AGENTS.md, .cursor/rules, mcp.json (auto-loaded) |
| **Command approval** | Interactive: y/n; non-interactive: full write access |

**Limitations (document in skill):**
- No stdin for prompt in practice; use args or temp file.
- Process may hang in some environments; timeouts recommended for automation.
- No first-party “prompt caching”; treat as N/A for Cursor backend.

---

## 3. Step-by-Step Implementation (AGENTS.md-Aligned)

Work in small batches. One logical step per phase. TDD: tests first, then implementation.

### Phase 1: Environment and Contract Tests
**Owner:** ap-backend-engineer (or executor with TDD)

1. **1.1** Add a small test suite that defines the *contract* for the new client (e.g. `scripts/test_cursor_contract.py` or extend existing tests):
   - **1.1.1** Test: “invoke with a simple prompt returns a non-empty string” — run `agent -p "Reply with OK" --output-format text` (or equivalent) via subprocess; assert exit code 0 and non-empty stdout. Skip if `agent` not found.
   - **1.1.2** Test: “invoke with invalid prompt handling” — e.g. empty prompt or missing required arg; expect clear error or validation before subprocess.
   - **1.1.3** (Optional) Test: “output format json returns parseable JSON” when using `--output-format json`.

2. **1.2** Document in plan or README: required env (e.g. `agent` on PATH, Cursor authenticated). No API key file.

**Exit criteria:** Contract tests exist; they pass when `agent` is available; they skip gracefully when not.

---

### Phase 2: Cursor CLI Client Module (Minimal Single Invocation)
**Owner:** ap-backend-engineer

3. **2.1** Introduce `scripts/cursor_client.py` (new file):
   - **2.1.1** `invoke_cursor(prompt: str, *, mode: str | None = None, output_format: str = "text", timeout: int | None = 300, cwd: str | None = None) -> str`
     - Build argv: `["agent", "-p", prompt, "--output-format", output_format]`; add `--mode=...` if `mode` is set.
     - Run via subprocess (e.g. `subprocess.run` or `Popen` with timeout); capture stdout/stderr.
     - On non-zero exit or timeout: raise a single, clear exception (e.g. `CursorInvocationError`) with message and, if available, stderr.
     - Return stdout as string (strip if appropriate).
   - **2.1.2** No API key reading; no model selection (Cursor uses subscription model).
   - **2.1.3** Optional: accept `extra_args: list[str]` for future flags (e.g. `--resume`).

4. **2.2** Prefer running from project root or a configurable `cwd` so that AGENTS.md and .cursor/rules apply.

5. **2.3** Add unit tests (or extend contract tests) that mock subprocess and assert correct argv and handling of exit codes/timeouts.

**Exit criteria:** `invoke_cursor("Reply with OK")` works when `agent` is installed; tests pass with mocks; real contract test passes.

---

### Phase 3: Map Public API to Cursor CLI (invoke_claude → invoke_cursor)
**Owner:** ap-backend-engineer + skill-creator (docs)

6. **3.1** In `orchestrating-agents`, decide public entrypoint:
   - **Option A (recommended):** Keep `claude_client.py` as the public module; implement it by delegating to `cursor_client.py` (e.g. `invoke_claude` → calls `invoke_cursor`). Deprecate Anthropic usage and remove `anthropic` dependency from this skill.
   - **Option B:** Rename to `cursor_client.py` and expose `invoke_cursor` as the main entrypoint; add a short compatibility alias `invoke_claude` = `invoke_cursor` for one release, then remove.

7. **3.2** Implement `invoke_claude(prompt, ...)` in terms of `invoke_cursor`:
   - Map `prompt` (str or list of blocks) to a single string (e.g. concatenate text blocks).
   - Ignore or document as no-op: `model`, `max_tokens`, `temperature`, `cache_system`, `cache_prompt`, `messages` (multi-turn handled later).
   - Pass `system` by prefixing to prompt or via a single “system + user” string if Cursor CLI has no separate system (doc decision).
   - Add timeout; optional `extra_args` if needed.

8. **3.3** Add `CursorInvocationError` (or reuse a generic name) and document in SKILL.md. Remove or replace `ClaudeInvocationError` in public API with one clear exception type.

**Exit criteria:** Existing callers of `invoke_claude(prompt="...")` get equivalent behavior via Cursor CLI; tests updated and passing.

---

### Phase 4: Parallel Invocations (invoke_parallel)
**Owner:** ap-backend-engineer

9. **4.1** Implement `invoke_parallel` using Cursor CLI:
   - For each item in `prompts`, run `invoke_cursor(prompt["prompt"], ...)` in a thread or process pool (same as current pattern).
   - `shared_system`: prepend to each prompt (or document that Cursor has no shared cache; just concatenate).
   - Drop `cache_shared_system` / `cache_system` / `cache_prompt` (document as N/A for Cursor).
   - Preserve order of results; on first failure either raise or return partial results (decide and document).

10. **4.2** Add tests: mock subprocess for N parallel calls; optionally one integration test with real `agent` if available in CI.

**Exit criteria:** `invoke_parallel([{"prompt": "A"}, {"prompt": "B"}])` returns two responses in order; tests pass.

---

### Phase 5: Streaming and Interruptibility
**Owner:** ap-backend-engineer

11. **5.1** **Streaming:** If Cursor CLI streams to stdout:
    - Implement `invoke_claude_streaming` / `invoke_cursor_streaming` by running `agent -p "..."` with `Popen`, reading stdout line-by-line or by chunk, and calling `callback(chunk)`.
    - If CLI does not stream, document “streaming not supported” and either return full response at end or leave API and no-op callback.

12. **5.2** **Parallel streaming:** Same as current design: one subprocess per task, each with its own callback; collect full response per task.

13. **5.3** **Interruptible:** Keep `InterruptToken`; in `invoke_parallel_interruptible`, pass token to workers and on `interrupt()` terminate in-flight subprocesses (e.g. `process.terminate()`). Document that Cursor CLI may leave partial state.

**Exit criteria:** Streaming and interruptible behavior documented and tested (mocked or integration).

---

### Phase 6: Multi-Turn (ConversationThread)
**Owner:** ap-backend-engineer

14. **6.1** Research: Does `agent ls` / `agent resume` / `--resume=<id>` return a usable thread id from a non-interactive run? If yes:
    - First turn: `agent -p "<system>\n\n<user message>"`; capture and parse thread id from output or from `agent ls` after run.
    - Next turns: `agent -p "<next message>" --resume=<thread_id>`.
    - Implement `ConversationThread` with this pattern; same public API where possible.

15. **6.2** If thread id is not available in non-interactive mode, document “multi-turn not supported for Cursor CLI” and implement `ConversationThread.send` as single-shot `invoke_cursor` (no history), or deprecate for Cursor backend.

**Exit criteria:** Decision documented; ConversationThread either uses resume or single-shot with clear docs.

---

### Phase 7: Skill Docs and References (skill-creator)
**Owner:** skill-creator patterns + executor

16. **7.1** **SKILL.md:**
    - Description: “Cursor CLI” instead of “Anthropic API”; same use cases (parallel analysis, delegation, etc.).
    - Quick start: `invoke_claude` (or `invoke_cursor`) example using Cursor CLI; no API key step; add “Prerequisites: `agent` installed and signed in.”
    - Remove or replace all Anthropic-specific setup (ANTHROPIC_API_KEY, anthropic package).
    - Document: no prompt caching; optional streaming; optional multi-turn (if supported).
    - Keep core function table; adjust parameters (e.g. drop `cache_system`, `cache_prompt`, or mark N/A).

17. **7.2** **references/workflows.md:** Replace Claude-specific examples with Cursor CLI equivalents (same workflows, different backend). Remove or shorten “Prompt Caching Workflows” or label “N/A for Cursor CLI.”

18. **7.3** **references/api-reference.md:** Rename to Cursor CLI; document `invoke_cursor` (and any aliases), `invoke_parallel`, streaming, interruptible, ConversationThread; error handling (`CursorInvocationError`); no model/rate-limit tables from Anthropic (optional: link to Cursor docs).

19. **7.4** Do **not** add README, INSTALLATION_GUIDE, QUICK_REFERENCE, CHANGELOG per skill-creator (skill contains only what’s needed for the agent).

**Exit criteria:** SKILL.md and references are consistent with Cursor CLI; no leftover Claude/Anthropic setup.

---

### Phase 8: Tests and Cleanup
**Owner:** ap-backend-engineer

20. **8.1** Migrate or remove existing tests:
    - `test_integration.py`, `test_streaming.py`, `test_interrupt.py`, `test_caching.py`: either adapt to Cursor CLI (with skip when `agent` unavailable) or replace with mocked subprocess tests.
    - Remove `test_caching.py` if caching is dropped for Cursor.

21. **8.2** Remove `anthropic` dependency from this skill (e.g. no `uv pip install anthropic` in SKILL.md or scripts); remove `get_anthropic_api_key` and any key-file reading.

22. **8.3** Run full test suite; fix any regressions. Ensure contract tests run in CI (e.g. skip when `agent` not in PATH).

**Exit criteria:** All tests pass; no Anthropic usage left; CI green.

---

## 4. Dependency and Agent Handoff

| Phase | Primary | Support |
|-------|---------|--------|
| 1–2  | ap-backend-engineer | — |
| 3–6  | ap-backend-engineer | skill-creator for doc patterns |
| 7    | skill-creator (docs) | ap-backend-engineer for API details |
| 8    | ap-backend-engineer | — |

**ap-implementation-planner:** Produces this plan only; does not implement.  
**ap-backend-engineer:** Implements cursor client, subprocess wiring, tests, exception types.  
**skill-creator:** SKILL.md structure, references, concise wording, no aux docs.

---

## 5. Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Cursor CLI hangs in non-interactive mode | Use timeouts (e.g. 300s default); document; optional retry. |
| No thread id for resume in non-interactive | Implement ConversationThread as single-shot or document N/A. |
| Different behavior (e.g. tools, rules) | Document in SKILL.md; keep “system” as prompt prefix if no separate system. |
| CI has no `agent` | Contract tests skip when `agent` not found; backend tests use mocks. |

---

## 6. Definition of Done

- [ ] `scripts/cursor_client.py` implements single and parallel invocation, optional streaming and interrupt.
- [ ] Public API (`invoke_claude` and/or `invoke_cursor`, `invoke_parallel`, etc.) works via Cursor CLI only; no Anthropic API.
- [ ] SKILL.md and references describe Cursor CLI setup and behavior; no Anthropic API key or caching.
- [ ] Tests pass (mocked and, where possible, one contract test with real `agent`); CI passes.
- [ ] AGENTS.md principles followed: small steps, TDD, minimal surface, documented exceptions and limitations.

---

**Plan path:** `plans/260129-cursor-cli-migration.md`
