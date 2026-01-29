# Cursor CLI API Reference

API documentation for the orchestrating-agents skill (backend: Cursor CLI).

## Backend

- **Engine:** Cursor CLI (`agent`). Non-interactive: `agent -p "<prompt>" --output-format text`.
- **Auth:** No API key in skill; user must have `agent` installed and authenticated (`agent login` or `CURSOR_API_KEY`).
- **Models:** Cursor uses subscription model; `model` parameter is ignored.

## Core Functions

### `invoke_cursor()` (cursor_client.py)

Single invocation via Cursor CLI:

```python
from cursor_client import invoke_cursor, CursorInvocationError

result = invoke_cursor(
    "Your prompt here",
    mode=None,           # Optional: "plan", "ask"
    output_format="text",  # "text" or "json"
    timeout=300,
    cwd=None,
    extra_args=None,    # e.g. ["--resume=thread-id"]
)
```

**Raises:** `ValueError` (empty prompt, agent not on PATH), `CursorInvocationError` (non-zero exit, timeout).

### `invoke_claude()` (claude_client.py)

Public alias; delegates to `invoke_cursor`. Same behavior; accepts `prompt`, `system` (prefixed to prompt), `timeout` in kwargs. `model`, `max_tokens`, `temperature`, `cache_system`, `cache_prompt` ignored.

### `invoke_parallel()`

Multiple invocations in parallel (ThreadPoolExecutor). Each item: `invoke_claude(prompt, system=shared_system + individual_system)`. `shared_system` prepended to each prompt (no caching). `max_workers` default 5, max 10.

### `invoke_claude_streaming()`

For Cursor CLI: returns full response at end; callback, if provided, is called once with the full string (no chunk-by-chunk streaming).

### `invoke_parallel_streaming()`

Parallel invocations; each callback receives full response for that task (no chunk streaming).

### `invoke_parallel_interruptible()`

Parallel invocations with `InterruptToken`. Interrupt is checked **before** each request; in-flight subprocesses are not killed mid-run. Use timeout for long runs.

### `ConversationThread`

Multi-turn: each `send()` uses last user message only (Cursor CLI has no server-side history). Local `messages` list kept for reference.

## Error Handling

### CursorInvocationError (ClaudeInvocationError)

Raised when Cursor CLI exits non-zero or times out.

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

- **Agent not found:** Install Cursor CLI: `curl https://cursor.com/install -fsS | bash`
- **Not authenticated:** Run `agent login` or set `CURSOR_API_KEY`
- **Timeout:** Increase `timeout` in kwargs (default 300s)
- **Empty prompt:** Ensure prompt is non-empty after strip

## Parallel Patterns

Same patterns as before (map-reduce, multi-expert, speculative execution); backend is Cursor CLI. Use `shared_system` for common context; no prompt caching.

## Performance

- Use `timeout` in kwargs for long prompts (default 300s).
- `max_workers` (default 5) limits concurrent `agent` subprocesses.
- Cursor CLI may hang in some environments; timeouts recommended for automation.

## Security

- No API key in this skill; Cursor uses its own auth.
- Validate/sanitize prompts if they include user input.
- Run from project root (or set `cwd`) so AGENTS.md and .cursor/rules apply.

## Further Reading

- [Cursor CLI — Using Agent](https://cursor.com/docs/cli/using)
- [Cursor CLI — Overview](https://cursor.com/docs/cli/overview)
