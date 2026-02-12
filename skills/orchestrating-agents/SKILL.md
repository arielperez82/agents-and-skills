---
name: orchestrating-agents
description: Orchestrates parallel API instances, delegated sub-tasks, and multi-agent workflows with streaming and tool-enabled delegation patterns. Use for parallel analysis, multi-perspective reviews, or complex task decomposition.
metadata:
  version: 0.2.0
---

# Orchestrating Agents

This skill enables programmatic invocations for advanced workflows including parallel processing, task delegation, and multi-agent analysis. Supports **Claude Code CLI** (`claude`, default) and **Cursor Agent CLI** (`agent`, fallback). Auto-detects which is available.

## When to Use This Skill

**Primary use cases:**
- **Parallel sub-tasks**: Break complex analysis into simultaneous independent streams
- **Multi-perspective analysis**: Get 3-5 different expert viewpoints concurrently
- **Delegation**: Offload specific subtasks to specialized API instances
- **Recursive workflows**: Orchestrator coordinating multiple API instances
- **High-volume processing**: Batch process multiple items concurrently

**Trigger patterns:**
- "Parallel analysis", "multi-perspective review", "concurrent processing"
- "Delegate subtasks", "coordinate multiple agents"
- "Run analyses from different perspectives"
- "Get expert opinions from multiple angles"

## Quick Start

### Single Invocation

```python
import sys
from pathlib import Path
# Add scripts dir to path (e.g. from repo root: skills/orchestrating-agents/scripts)
sys.path.insert(0, str(Path(__file__).resolve().parent / "skills" / "orchestrating-agents" / "scripts"))
from claude_client import invoke_claude

response = invoke_claude(
    prompt="Analyze this code for security vulnerabilities: ...",
)
print(response)
```

### Parallel Multi-Perspective Analysis

```python
from claude_client import invoke_parallel

prompts = [
    {
        "prompt": "Analyze from security perspective: ...",
        "system": "You are a security expert"
    },
    {
        "prompt": "Analyze from performance perspective: ...",
        "system": "You are a performance optimization expert"
    },
    {
        "prompt": "Analyze from maintainability perspective: ...",
        "system": "You are a software architecture expert"
    }
]

results = invoke_parallel(prompts)

for i, result in enumerate(results):
    print(f"\n=== Perspective {i+1} ===")
    print(result)
```

### Parallel with Shared Context

For parallel operations with shared base context, pass `shared_system`; it is prepended to each prompt:

```python
from claude_client import invoke_parallel

base_context = """
<codebase>
...large codebase or documentation...
</codebase>
"""

prompts = [
    {"prompt": "Find security vulnerabilities in the authentication module"},
    {"prompt": "Identify performance bottlenecks in the API layer"},
    {"prompt": "Suggest refactoring opportunities in the database layer"}
]

results = invoke_parallel(prompts, shared_system=base_context)
```

### Multi-Turn Conversation with Auto-Caching

For sub-agents that need multiple rounds of conversation:

```python
from claude_client import ConversationThread

# Create a conversation thread (auto-caches history)
agent = ConversationThread(
    system="You are a code refactoring expert with access to the codebase",
    cache_system=True
)

# Turn 1: Initial analysis
response1 = agent.send("Analyze the UserAuth class for issues")
print(response1)

# Turn 2: Follow-up (reuses cached system + turn 1)
response2 = agent.send("How would you refactor the login method?")
print(response2)

# Turn 3: Implementation (reuses all previous context)
response3 = agent.send("Show me the refactored code")
print(response3)
```

### Streaming Responses

For real-time feedback from sub-agents:

```python
from claude_client import invoke_claude_streaming

def show_progress(chunk):
    print(chunk, end='', flush=True)

response = invoke_claude_streaming(
    "Write a comprehensive security analysis...",
    callback=show_progress
)
```

### Parallel Streaming

Monitor multiple sub-agents simultaneously:

```python
from claude_client import invoke_parallel_streaming

def agent1_callback(chunk):
    print(f"[Security] {chunk}", end='', flush=True)

def agent2_callback(chunk):
    print(f"[Performance] {chunk}", end='', flush=True)

results = invoke_parallel_streaming(
    [
        {"prompt": "Security review: ..."},
        {"prompt": "Performance review: ..."}
    ],
    callbacks=[agent1_callback, agent2_callback]
)
```

### Interruptible Operations

Cancel long-running parallel operations:

```python
from claude_client import invoke_parallel_interruptible, InterruptToken
import threading
import time

token = InterruptToken()

# Run in background
def run_analysis():
    results = invoke_parallel_interruptible(
        prompts=[...],
        interrupt_token=token
    )
    return results

thread = threading.Thread(target=run_analysis)
thread.start()

# Interrupt after 5 seconds
time.sleep(5)
token.interrupt()
```

## Core Functions

### `invoke_claude()`

Single synchronous invocation with full control:

```python
invoke_claude(
    prompt: str | list[dict],
    model: str = "claude-sonnet-4-5-20250929",
    system: str | list[dict] | None = None,
    max_tokens: int = 4096,
    temperature: float = 1.0,
    streaming: bool = False,
    cache_system: bool = False,
    cache_prompt: bool = False,
    messages: list[dict] | None = None,
    **kwargs
) -> str
```

**Parameters:**
- `prompt`: The user message (string or list of content blocks)
- `model`: Claude model to use (default: claude-sonnet-4-5-20250929)
- `system`: Optional system prompt (string or list of content blocks)
- `max_tokens`: Maximum tokens in response (default: 4096)
- `temperature`: Randomness 0-1 (default: 1.0)
- `streaming`: Enable streaming response (default: False)
- `cache_system`: Add cache_control to system prompt (requires 1024+ tokens, default: False)
- `cache_prompt`: Add cache_control to user prompt (requires 1024+ tokens, default: False)
- `messages`: Pre-built messages list for multi-turn (overrides prompt)
- `**kwargs`: Additional API parameters (top_p, top_k, etc.)

**Returns:** Response text as string

**Note:** `cache_system`, `cache_prompt` ignored (N/A for CLI backends). Optional `timeout` in kwargs (default 300).

### `invoke_parallel()`

Concurrent invocations using lightweight workflow pattern:

```python
invoke_parallel(
    prompts: list[dict],
    model: str = "claude-sonnet-4-5-20250929",
    max_tokens: int = 4096,
    max_workers: int = 5,
    shared_system: str | list[dict] | None = None,
    cache_shared_system: bool = False
) -> list[str]
```

**Parameters:**
- `prompts`: List of dicts with 'prompt' (required) and optional 'system', etc.
- `model`, `max_tokens`: Ignored (CLI backends use their own model selection)
- `max_workers`: Max concurrent CLI invocations (default: 5, max: 10)
- `shared_system`: System context prepended to each prompt
- `cache_shared_system`: Ignored (N/A for CLI backends)

**Returns:** List of response strings in same order as prompts

### `invoke_claude_streaming()`

Stream responses in real-time with optional callbacks:

```python
invoke_claude_streaming(
    prompt: str | list[dict],
    callback: callable = None,
    model: str = "claude-sonnet-4-5-20250929",
    system: str | list[dict] | None = None,
    max_tokens: int = 4096,
    temperature: float = 1.0,
    cache_system: bool = False,
    cache_prompt: bool = False,
    **kwargs
) -> str
```

**Parameters:**
- `callback`: Optional function called with each text chunk (str) as it arrives
- (other parameters same as invoke_claude)

**Returns:** Complete accumulated response text

### `invoke_parallel_streaming()`

Parallel invocations with per-agent streaming callbacks:

```python
invoke_parallel_streaming(
    prompts: list[dict],
    callbacks: list[callable] = None,
    model: str = "claude-sonnet-4-5-20250929",
    max_tokens: int = 4096,
    max_workers: int = 5,
    shared_system: str | list[dict] | None = None,
    cache_shared_system: bool = False
) -> list[str]
```

**Parameters:**
- `callbacks`: Optional list of callback functions, one per prompt
- (other parameters same as invoke_parallel)

### `invoke_parallel_interruptible()`

Parallel invocations with cancellation support:

```python
invoke_parallel_interruptible(
    prompts: list[dict],
    interrupt_token: InterruptToken = None,
    # ... same other parameters as invoke_parallel
) -> list[str]
```

**Parameters:**
- `interrupt_token`: Optional InterruptToken to signal cancellation
- (other parameters same as invoke_parallel)

**Returns:** List of response strings (None for interrupted tasks)

### `ConversationThread`

Manages multi-turn conversations with automatic caching:

```python
thread = ConversationThread(
    system: str | list[dict] | None = None,
    model: str = "claude-sonnet-4-5-20250929",
    max_tokens: int = 4096,
    temperature: float = 1.0,
    cache_system: bool = True
)

response = thread.send(
    user_message: str | list[dict],
    cache_history: bool = True
) -> str
```

**Methods:**
- `send(message, cache_history=True)`: Send message and get response
- `get_messages()`: Get conversation history
- `clear()`: Clear conversation history
- `__len__()`: Get number of turns

**Note:** Multi-turn uses last user message per call (CLI backends have no server-side history; local history kept for reference).

## Example Workflows

See [references/workflows.md](references/workflows.md) for detailed examples including:
- Multi-expert code review
- Parallel document analysis
- Recursive task delegation
- Advanced Agent SDK delegation patterns
- Prompt caching workflows



## Setup

**Prerequisites:** Install at least one supported CLI.

**Option A — Claude Code CLI (default):**
```bash
npm install -g @anthropic-ai/claude-code
claude login
```
Or set `ANTHROPIC_API_KEY` for headless/CI.

**Option B — Cursor Agent CLI (fallback):**
```bash
curl https://cursor.com/install -fsS | bash
agent login
```
Or set `CURSOR_API_KEY` for headless/CI.

**Auto-detection:** The client tries `claude` first, then `agent`. To force a backend, use `invoke_cli(prompt, backend="claude")` or `backend="cursor"`.

Check:
```bash
claude -p "Reply OK" --output-format text   # Claude Code
agent -p "Reply OK" --output-format text    # Cursor Agent
```

## Error Handling

The module provides comprehensive error handling:

```python
from claude_client import invoke_claude, ClaudeInvocationError

try:
    response = invoke_claude("Your prompt here")
except ClaudeInvocationError as e:
    print(f"API Error: {e}")
    print(f"Status: {e.status_code}")
    print(f"Details: {e.details}")
except ValueError as e:
    print(f"Configuration Error: {e}")
```

Common errors:
- **No CLI found**: Install Claude Code (`npm install -g @anthropic-ai/claude-code`) or Cursor Agent (`curl https://cursor.com/install -fsS | bash`)
- **Not authenticated**: Run `claude login` / `agent login` or set `ANTHROPIC_API_KEY` / `CURSOR_API_KEY`
- **Timeout**: Increase `timeout` in kwargs (default 300s)
- **Non-zero exit**: Check stderr on `ClaudeInvocationError`

## Prompt Caching

N/A for CLI backends. Use `shared_system` to prepend context; no server-side caching.

## Performance Considerations

- Parallel calls run multiple CLI subprocesses; default `max_workers=5`.
- Use `timeout` in kwargs for long-running prompts (default 300s).
- CLI backends may hang in some environments; timeouts recommended for automation.

## Best Practices

1. **Use parallel invocations for independent tasks only**
   - Don't parallelize sequential dependencies
   - Each parallel task should be self-contained

2. **Set appropriate system prompts**
   - Define clear roles/expertise for each instance
   - Keeps responses focused and relevant

3. **Handle errors gracefully**
   - Always wrap invocations in try-except
   - Provide fallback behavior for failures

4. **Test with small batches first**
   - Verify prompts work before scaling
   - Check token usage and costs

5. **Consider alternatives**
   - Not all tasks benefit from multiple instances
   - Sometimes sequential with context is better

## Token Efficiency

This skill uses ~800 tokens when loaded but enables powerful multi-agent patterns that can dramatically improve complex analysis quality and speed.

## See Also

- [references/api-reference.md](references/api-reference.md) - Detailed API documentation
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) - Official Claude Code docs
- [Cursor Agent CLI](https://cursor.com/docs/cli/using) - Official Cursor CLI docs
