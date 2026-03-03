---
type: plan
endeavor: repo
initiative: I14-MATO
initiative_name: multi-agent-token-optimization
phase: 2
status: proposed
updated: 2026-03-03
---

# Technical Design: I14-MATO Phase 2 -- Cross-Vendor Dispatch

## 1. Module Structure

All Python changes in `skills/orchestrating-agents/scripts/`. One new command dir.

| File | Action | Purpose |
|------|--------|---------|
| `cli_client.py` | Modify | Add `build_argv` per backend; add gemini+codex to `_BACKENDS`; update `_resolve_backend` order; add telemetry hook point |
| `codex_client.py` | New | Thin wrapper: `invoke_codex(prompt, sandbox, model)` -> `invoke_cli(backend="codex")` |
| `gemini_client.py` | New | Thin wrapper: `invoke_gemini(prompt, approval_mode, model)` -> `invoke_cli(backend="gemini")` + ANSI strip |
| `telemetry_helper.py` | New | `emit_invocation(backend, duration_ms, exit_code, prompt_len, response_len)` -> HTTP POST to Tinybird |
| `preflight.py` | New | `check_backends() -> dict[str, bool]`; parallel probes; cache to `/tmp/mato-preflight-*.json` |
| `test_cli_client.py` | Modify | Add codex/gemini argv builder tests; update auto-detect order tests |
| `test_codex_client.py` | New | Wrapper delegation tests |
| `test_gemini_client.py` | New | Wrapper delegation + ANSI strip tests |
| `test_telemetry_helper.py` | New | Best-effort POST; graceful failure |
| `test_preflight.py` | New | Caching; parallel probes; timeout handling |
| `commands/dispatch/dispatch.md` | New | Markdown command: tier classification + backend routing |
| `CLAUDE.md` | Modify | Add T2 Delegation Triggers section |

## 2. Key Design Decision: `build_argv` Per Backend

Current `invoke_cli` hardcodes `[binary, "-p", prompt, "--output-format", fmt]`. This breaks for Codex (positional arg, no `-p`) and Gemini (`-o` not `--output-format`).

**Approach:** Add a `build_argv` callable to each `_BACKENDS` entry.

```python
_BACKENDS = {
    "claude": {
        "binary": "claude",
        "name": "Claude Code CLI",
        "build_argv": lambda p, fmt, extra: ["claude", "-p", p, "--output-format", fmt] + (extra or []),
    },
    "cursor": {
        "binary": "agent",
        "name": "Cursor Agent CLI",
        "build_argv": lambda p, fmt, extra: ["agent", "-p", p, "--output-format", fmt] + (extra or []),
    },
    "codex": {
        "binary": "codex",
        "name": "Codex CLI",
        "build_argv": lambda p, fmt, extra: ["codex", "exec", p, "--sandbox", "read-only"] + (extra or []),
    },
    "gemini": {
        "binary": "gemini",
        "name": "Gemini CLI",
        "build_argv": lambda p, fmt, extra: ["gemini", "-p", p, "-o", fmt, "--approval-mode", "yolo"] + (extra or []),
    },
}
```

**In `invoke_cli`**, replace the hardcoded argv line:

```python
# Before (hardcoded):
argv = [binary, "-p", prompt, "--output-format", output_format]

# After (per-backend):
backend_key = _resolve_backend_key(backend)  # returns key, not binary
backend_def = _BACKENDS[backend_key]
argv = backend_def["build_argv"](prompt, output_format, extra_args)
```

**Backward compat:** `_resolve_backend` currently returns a binary name. Refactor to `_resolve_backend_key` returning a registry key. The binary is accessed via `_BACKENDS[key]["binary"]`. Existing tests assert on `argv[0]` (the binary) -- these continue to work since `build_argv` puts the binary first.

**Auto-detect order:** `claude -> codex -> gemini -> cursor` (codex most reliable T2; cursor rate-limited).

## 3. Data Flow

```
/dispatch command (markdown)
  |
  Claude reads instructions, classifies tier (T1/T2/T3)
  |
  T1 -> local script (no Python)
  T3 -> Claude handles directly (no delegation)
  T2 -> Claude calls invoke_cli(prompt, backend="codex"|"gemini")
          |
          invoke_cli() -> build_argv() -> subprocess.run()
          |                                     |
          emit_invocation() -------> Tinybird POST (best-effort)
          |
          return stdout
```

The `/dispatch` command is a markdown file that Claude interprets. It does NOT call Python directly -- Claude reads the classification rules and invokes the appropriate Python scripts via Bash tool. This is the same pattern as `/scout`.

## 4. Telemetry Helper (`telemetry_helper.py`)

Separate module (not in `cli_client.py`) because:
- Single responsibility: transport vs observability
- Testable in isolation (mock HTTP, not subprocess)
- Optional dependency: works when `TB_INGEST_TOKEN` absent

```python
def emit_invocation(
    backend: str, duration_ms: int, exit_code: int | None,
    prompt_len: int, response_len: int, session_id: str | None = None,
) -> None:
    """Best-effort POST to Tinybird. Never raises."""
    token = os.environ.get("TB_INGEST_TOKEN")
    host = os.environ.get("TB_HOST", "https://api.us-east.aws.tinybird.co")
    if not token:
        return  # silent no-op
    # POST to {host}/v0/events?name=cross_vendor_invocations
    # Timeout: 5s. Catch all exceptions, log warning.
```

**Integration point:** `invoke_cli` calls `emit_invocation` after subprocess completes (success or error). Wrapped in try/except to guarantee no dispatch blocking.

## 5. Pre-flight Cache (`preflight.py`)

```python
CACHE_PATH = Path(tempfile.gettempdir()) / "mato-preflight.json"
CACHE_TTL_SECONDS = 3600  # 1 hour

def check_backends(force: bool = False) -> dict[str, bool]:
    """Return {backend: available} map. Uses cache if fresh."""
    if not force and _cache_is_fresh():
        return _read_cache()
    results = _probe_all_parallel(timeout_per_probe=10)
    _write_cache(results)
    return results
```

Probes run via `concurrent.futures.ThreadPoolExecutor` -- one subprocess per backend, 10s timeout each. Total wall-clock: ~10s max (parallel). Cache is a plain JSON file keyed by backend name with timestamp.

## 6. Error Handling Strategy

| Layer | Error | Handling |
|-------|-------|----------|
| `invoke_cli` | Binary not on PATH | `ValueError` (existing) |
| `invoke_cli` | Non-zero exit | `CLIInvocationError` (existing) |
| `invoke_cli` | Timeout | `CLIInvocationError` (existing) |
| `gemini_client` | Auth failure (exit 1 + "auth" in stderr) | `CLIInvocationError` with auth guidance message |
| `telemetry_helper` | POST failure / missing env | Silent no-op + `logging.warning` |
| `preflight` | Probe timeout | Mark backend unavailable; don't block others |
| `/dispatch` | All T2 backends unavailable | Fall back to claude-haiku (Claude does the work itself) |

No new exception classes needed. `CLIInvocationError` handles all CLI failures uniformly.

## 7. Testing Approach

All tests use `unittest` + `unittest.mock` (matching existing `test_cli_client.py` patterns).

**Existing tests that need updating:**
- `test_raises_when_neither_cli_available`: Update error message assertion (now lists 4 backends)
- `test_invalid_backend_raises`: Update valid backend list in message
- `test_passes_output_format`: Currently asserts `--output-format` in argv. After refactor, this test should assert on claude-specific behavior (backend="claude") explicitly.

**New test files:**
- `test_cli_client.py` additions: codex argv has `["codex", "exec", prompt]` with no `-p`; gemini argv has `-o` not `--output-format`; auto-detect order is claude->codex->gemini->cursor
- `test_codex_client.py`: delegates to `invoke_cli(backend="codex")`; passes sandbox param; passes model via extra_args
- `test_gemini_client.py`: delegates to `invoke_cli(backend="gemini")`; strips ANSI from output; passes approval_mode
- `test_telemetry_helper.py`: POSTs when env vars set; no-ops when missing; catches HTTP errors silently
- `test_preflight.py`: returns cached results within TTL; re-probes after TTL; handles probe timeout; parallel execution

**Mock boundaries:** `subprocess.run` and `shutil.which` (existing pattern). `urllib.request.urlopen` for telemetry. `Path.stat` for cache freshness.

## 8. Implementation Order (TDD)

Following backlog waves and walking skeleton from BDD scenarios:

1. **B2**: Refactor `_BACKENDS` + `build_argv` (RED: codex argv test fails -> GREEN: add builder)
2. **B3**: Codex backend + wrapper (RED: `invoke_codex` test -> GREEN: implement)
3. **B4**: Gemini backend + wrapper (RED: `invoke_gemini` test -> GREEN: implement)
4. **B1**: CLAUDE.md dispatch rules (no code, no tests)
5. **B6**: Pre-flight (RED: cache test -> GREEN: implement)
6. **B7**: Telemetry helper (RED: POST test -> GREEN: implement)
7. **B5**: `/dispatch` command (markdown, tested via B2-B4 backends)

B1 can happen anytime (zero-code). B5 is last because it depends on all other pieces existing.
