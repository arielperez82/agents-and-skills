# CLI API Reference

API documentation for the orchestrating-agents skill. Supports Claude Code CLI (`claude`, default) and Cursor Agent CLI (`agent`, fallback).

## Backend

- **Engine:** Auto-detects CLI: tries `claude` first, falls back to `agent`. Non-interactive: `<cli> -p "<prompt>" --output-format text`.
- **Auth:** No API key in skill; user must have a CLI installed and authenticated (`claude login` / `agent login`, or `ANTHROPIC_API_KEY` / `CURSOR_API_KEY`).
- **Models:** CLI backends use their own model selection; `model` parameter is ignored.
- **Explicit backend:** Use `invoke_cli(prompt, backend="claude")` or `backend="cursor"` to force a backend.

## Core Functions

### `invoke_cli()` (cli_client.py)

Core transport function. Auto-detects or explicitly selects backend:

```python
from cli_client import invoke_cli, CLIInvocationError

result = invoke_cli(
    "Your prompt here",
    backend=None,          # None/"auto", "claude", or "cursor"
    output_format="text",  # "text" or "json"
    timeout=300,
    cwd=None,
    extra_args=None,       # e.g. ["--verbose"]
)
```

**Raises:** `ValueError` (empty prompt, CLI not on PATH, invalid backend), `CLIInvocationError` (non-zero exit, timeout).

### `invoke_cursor()` (cursor_client.py)

Backward-compatible wrapper; delegates to `invoke_cli(backend="cursor")`. Accepts `mode` parameter for Cursor-specific modes ("plan", "ask").

### `invoke_claude()` (claude_client.py)

High-level API; delegates to `invoke_cli`. Accepts `prompt`, `system` (prefixed to prompt), `timeout` in kwargs. `model`, `max_tokens`, `temperature`, `cache_system`, `cache_prompt` ignored (CLI backends use their own settings).

### `invoke_parallel()`

Multiple invocations in parallel (ThreadPoolExecutor). Each item: `invoke_claude(prompt, system=shared_system + individual_system)`. `shared_system` prepended to each prompt (no caching). `max_workers` default 5, max 10.

### `invoke_claude_streaming()`

Returns full response at end; callback, if provided, is called once with the full string (no chunk-by-chunk streaming via CLI backends).

### `invoke_parallel_streaming()`

Parallel invocations; each callback receives full response for that task (no chunk streaming).

### `invoke_parallel_interruptible()`

Parallel invocations with `InterruptToken`. Interrupt is checked **before** each request; in-flight subprocesses are not killed mid-run. Use timeout for long runs.

### `ConversationThread`

Multi-turn: each `send()` uses last user message only (CLI backends have no server-side history). Local `messages` list kept for reference.

## Error Handling

### CLIInvocationError (ClaudeInvocationError / CursorInvocationError)

Raised when a CLI backend exits non-zero or times out.

- `message`: Error description
- `returncode`: Process exit code (or None if timeout)
- `stderr`: stderr from process
- `status_code`: Alias for returncode (backward compat)
- `details`: Alias for stderr (backward compat)

```python
from claude_client import invoke_claude, ClaudeInvocationError

try:
    response = invoke_claude("Your prompt")
except ClaudeInvocationError as e:
    print(e)
    print(e.returncode, e.stderr)
except ValueError as e:
    print("Validation:", e)
```

### Common Errors

- **No CLI found:** Install Claude Code (`npm install -g @anthropic-ai/claude-code`) or Cursor Agent (`curl https://cursor.com/install -fsS | bash`)
- **Not authenticated:** Run `claude login` / `agent login` or set `ANTHROPIC_API_KEY` / `CURSOR_API_KEY`
- **Timeout:** Increase `timeout` in kwargs (default 300s)
- **Empty prompt:** Ensure prompt is non-empty after strip

## Parallel Patterns

Same patterns as before (map-reduce, multi-expert, speculative execution). Use `shared_system` for common context; no prompt caching via CLI backends.

## Performance

- Use `timeout` in kwargs for long prompts (default 300s).
- `max_workers` (default 5) limits concurrent CLI subprocesses.
- CLI backends may hang in some environments; timeouts recommended for automation.

## Security

- No API key in this skill; CLI backends use their own auth.
- Validate/sanitize prompts if they include user input.
- Run from project root (or set `cwd`) so AGENTS.md and project rules apply.

## Further Reading

- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) - Official Claude Code docs
- [Cursor CLI — Using Agent](https://cursor.com/docs/cli/using)
- [Cursor CLI — Overview](https://cursor.com/docs/cli/overview)
