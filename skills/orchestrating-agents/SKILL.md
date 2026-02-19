---
name: orchestrating-agents
description: Orchestrates parallel API instances, delegated sub-tasks, and multi-agent workflows across four CLI backends (Claude Code, Cursor Agent, Gemini, Codex). Supports cost-optimized tier routing, streaming, and tool-enabled delegation patterns. Use for parallel analysis, multi-perspective reviews, cross-vendor delegation, or complex task decomposition.
metadata:
  version: 0.3.0
---

# Orchestrating Agents

This skill enables programmatic invocations for advanced workflows including parallel processing, task delegation, multi-agent analysis, and **cost-optimized cross-vendor routing**. Supports four CLI backends:

| CLI | Command | Cost Model | Ecosystem Access | Notes |
|-----|---------|-----------|-----------------|-------|
| **Claude Code** | `claude` | Per-token (Anthropic API) | Native | Default orchestrator |
| **Cursor Agent** | `agent` | Flat subscription | 37 models (GPT-5.x, Claude 4.x, Gemini 3.x, Grok) | Skill discovery buggy — use as leaf executor |
| **Gemini CLI** | `gemini` | Subscription | Full (loads from `~/.agents/skills/`) | Full ecosystem access |
| **Codex CLI** | `codex` | Subscription | Full (scans repo + `~/.codex/skills/`) | Built-in `review` command |

## When to Use This Skill

**Primary use cases:**
- **Parallel sub-tasks**: Break complex analysis into simultaneous independent streams
- **Multi-perspective analysis**: Get 3-5 different expert viewpoints concurrently
- **Cost-optimized delegation**: Route tasks to the cheapest capable backend
- **Cross-vendor workflows**: Use Gemini/Codex for T2 tasks, Claude for T3 validation
- **Recursive workflows**: Orchestrator coordinating multiple API instances
- **High-volume processing**: Batch process multiple items concurrently

**Trigger patterns:**
- "Parallel analysis", "multi-perspective review", "concurrent processing"
- "Delegate subtasks", "coordinate multiple agents"
- "Optimize token cost", "use cheaper model for this"
- "Run analyses from different perspectives"

## Cost-Optimized Tier Routing

Route tasks to the cheapest backend that can handle them. See I14-MATO charter for full tier classification.

### Tier Model

| Tier | Label | Route To | Use When |
|------|-------|----------|----------|
| **T1** | Mechanical | Local scripts, linters, `tsc` | Deterministic: formatting, validation, file search |
| **T2** | Analytical | `gemini`, `codex`, `agent`, `claude --model haiku` | Pattern-following: docs review, style checks, boilerplate, summarization |
| **T3** | Strategic | `claude --model sonnet` or `claude --model opus` | Novel judgment: architecture, TDD coaching, security analysis |

### Delegation Decision

```
Is this deterministic? ──yes──► T1 (local script)
        │ no
Does it follow established patterns? ──yes──► T2 (gemini/codex/agent/haiku)
        │ no
Requires novel judgment? ──yes──► T3 (claude sonnet/opus)
```

### Validation Sandwich Pattern

Cheap agents generate, expensive agents validate. This preserves quality while reducing cost.

```
T2 Agent (cheap)         T3 Agent (expensive)
    │                         │
    │  Produce work           │
    │────────────────────────►│
    │                         │  Validate work
    │                         │  (cheaper than
    │                         │   produce + validate)
    │  Accept / Reject        │
    │◄────────────────────────│
```

Works because validation processes only the diff/findings, not the full reasoning chain.

## CLI Quick Reference

### Claude Code (`claude`)

```bash
# Non-interactive with model selection
claude -p "analyze this code" --model sonnet
claude -p "quick summary" --model haiku
claude -p "complex architecture review" --model opus

# With budget cap
claude -p "task" --model haiku --max-budget-usd 0.05

# JSON output for programmatic consumption
claude -p "list issues" --model sonnet --output-format json
```

Key flags: `-p` (print/non-interactive), `--model` (haiku/sonnet/opus), `--max-budget-usd`, `--output-format` (text/json/stream-json).

### Cursor Agent (`agent`)

```bash
# Non-interactive with model selection (37 models available)
agent -p "review this diff for style" --model gpt-5.3-codex
agent -p "generate test data" --model gemini-3-flash
agent -p "summarize changes" --model sonnet-4.6

# List available models
agent --list-models

# Read-only modes
agent -p "explain this function" --mode ask
agent -p "propose a refactoring plan" --mode plan
```

Key flags: `-p` (print/non-interactive), `--model`, `--mode` (plan/ask), `--output-format` (text/json/stream-json), `--force`/`--yolo` (auto-approve).

**Known limitations (as of 2026-02):** Cannot consistently find user skills. Missing Task tool for subagent dispatch. Use as **leaf executor only** — embed all context in prompt. Requires `--trust` flag for non-interactive use. Subject to monthly Pro usage limits — all models rate-limited when quota exhausted.

### Gemini CLI (`gemini`)

```bash
# Non-interactive
gemini -p "summarize this file" < file.ts
gemini -p "generate REST endpoint boilerplate" -m gemini-2.5-pro

# With output format
gemini -p "list code issues" -o json

# Auto-approve mode (for trusted operations)
gemini -p "format this code" --approval-mode yolo
```

Key flags: `-p`/`--prompt` (non-interactive), `-m`/`--model`, `-o`/`--output-format` (text/json/stream-json), `--approval-mode` (default/auto_edit/yolo/plan).

**Ecosystem access:** Loads skills from `~/.agents/skills/` and `~/.gemini/skills/`. Reads AGENTS.md. Full agent/skill/command discovery confirmed.

**Auth note:** Requires interactive terminal for OAuth consent on first use. Pre-authenticate by running `gemini` interactively before using in non-interactive delegation. Cannot be invoked non-interactively from another agent subprocess without prior auth.

### Codex CLI (`codex`)

```bash
# Non-interactive execution
codex exec "summarize this code" < file.ts

# Built-in code review
codex exec review

# With model and sandbox control
codex exec -m o3 "generate test data" --sandbox read-only

# Full auto (sandboxed, no approval needed)
codex exec --full-auto "format and lint this file"
```

Key flags: `exec` (non-interactive), `review` (built-in code review), `-m`/`--model`, `--sandbox` (read-only/workspace-write/danger-full-access), `--full-auto`.

**Ecosystem access:** Scans repo for agents/skills/commands. Loads skills from `~/.codex/skills/`. Full discovery confirmed.

## Cross-Vendor Delegation Examples

### Example 1: Docs Review — T2 First Pass + T3 Validation

```bash
# T2: Gemini does structural/grammar check (subscription cost)
gemini -p "Review this document for spelling, grammar, broken links, and structural completeness. Output a findings list." < README.md > /tmp/docs-t2-findings.txt

# T3: Claude validates content accuracy (per-token cost, but smaller input)
claude -p "Review this document for content accuracy, API correctness, and conceptual clarity. Also review these T2 findings and filter out false positives: $(cat /tmp/docs-t2-findings.txt)" --model sonnet < README.md
```

### Example 2: Code Review — Style Pass + Architecture Pass

```bash
# T2: Codex does style/lint review (subscription cost, has built-in review)
codex exec review > /tmp/codex-review.txt

# T3: Claude does architectural review with Codex findings as context
git diff HEAD~1 | claude -p "Review this diff for architectural concerns, subtle bugs, and design pattern issues. Codex already found these style issues (ignore duplicates): $(cat /tmp/codex-review.txt)" --model sonnet
```

### Example 3: Research Delegation

```bash
# T2: Gemini gathers raw research (subscription cost)
gemini -p "Research the latest best practices for TypeScript monorepo tooling in 2026. List tools, trade-offs, and recommendations with links." -o text > /tmp/research-raw.txt

# T3: Claude synthesizes and evaluates (per-token, but smaller focused input)
claude -p "Evaluate this research for our project. Given our constraints (TypeScript strict, Vitest, pnpm), which recommendation fits best and why? Research: $(cat /tmp/research-raw.txt)" --model sonnet
```

### Example 4: Cursor Agent as Multi-Model Proxy

```bash
# Use Cursor's flat subscription to access GPT-5.3 for free
agent -p "Generate 20 realistic test user records as JSON with name, email, role, created_at" --model gpt-5.3-codex

# Use Cursor to access Gemini 3 Flash for summarization
agent -p "Summarize the key changes in this diff" --model gemini-3-flash < diff.txt

# Use Cursor to access Grok for a different perspective
agent -p "What are the security implications of this code?" --model grok < auth.ts
```

## Programmatic Invocation (Python)

### Single Invocation

```python
import sys
from pathlib import Path
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

### Multi-Turn Conversation

```python
from claude_client import ConversationThread

agent = ConversationThread(
    system="You are a code refactoring expert with access to the codebase",
    cache_system=True
)

response1 = agent.send("Analyze the UserAuth class for issues")
response2 = agent.send("How would you refactor the login method?")
response3 = agent.send("Show me the refactored code")
```

### Streaming and Interruptible Operations

```python
from claude_client import invoke_claude_streaming, invoke_parallel_interruptible, InterruptToken

# Streaming
response = invoke_claude_streaming(
    "Write a comprehensive security analysis...",
    callback=lambda chunk: print(chunk, end='', flush=True)
)

# Interruptible parallel
token = InterruptToken()
results = invoke_parallel_interruptible(prompts=[...], interrupt_token=token)
# Call token.interrupt() to cancel
```

## Core Functions

### `invoke_claude()`

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

**Note:** `cache_system`, `cache_prompt` ignored for CLI backends. Optional `timeout` in kwargs (default 300).

### `invoke_parallel()`

```python
invoke_parallel(
    prompts: list[dict],
    max_workers: int = 5,
    shared_system: str | list[dict] | None = None,
) -> list[str]
```

### `ConversationThread`

```python
thread = ConversationThread(system="...", cache_system=True)
response = thread.send("message")
```

Methods: `send()`, `get_messages()`, `clear()`, `__len__()`.

## Setup

**Prerequisites:** Install at least one supported CLI. All four are recommended for cost optimization.

```bash
# Claude Code (default orchestrator)
npm install -g @anthropic-ai/claude-code
claude login

# Cursor Agent (flat-rate multi-model proxy)
curl https://cursor.com/install -fsS | bash
agent login

# Gemini CLI
npm install -g @anthropic-ai/gemini-cli  # or via Google's install method
gemini  # auth via browser on first run

# Codex CLI
npm install -g @openai/codex
codex login
```

**Verify all backends:**
```bash
claude -p "Reply OK" --output-format text
agent -p "Reply OK" --output-format text
gemini -p "Reply OK" -o text
codex exec "Reply OK"
```

**Auto-detection:** The Python client tries `claude` first, then `agent`. To force a backend, use `invoke_cli(prompt, backend="claude")` or `backend="cursor"`.

## Error Handling

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
- **No CLI found**: Install the relevant CLI (see Setup)
- **Not authenticated**: Run login for the relevant CLI
- **Timeout**: Increase `timeout` in kwargs (default 300s)
- **Non-zero exit**: Check stderr on `ClaudeInvocationError`

## Best Practices

1. **Route by tier** — Use the cheapest backend that can handle the task
2. **Validate with T3** — Cheap agents generate, Claude validates (validation sandwich)
3. **Use parallel invocations for independent tasks only** — Don't parallelize sequential dependencies
4. **Set appropriate system prompts** — Define clear roles/expertise for each instance
5. **Embed context for Cursor** — Cursor can't reliably discover skills; pass full context in prompt
6. **Test with small batches first** — Verify prompts work before scaling
7. **Prefer `codex exec review`** — Built-in code review is free with subscription

## See Also

- [references/api-reference.md](references/api-reference.md) — Detailed Python API documentation
- [references/workflows.md](references/workflows.md) — Multi-expert review, parallel analysis, recursive delegation
- [I14-MATO Charter](/.docs/canonical/charters/charter-repo-I14-MATO-multi-agent-token-optimization.md) — Full tier classification and roadmap
- [Claude Code CLI](https://docs.anthropic.com/en/docs/claude-code) — Official Claude Code docs
- [Cursor Agent CLI](https://cursor.com/docs/cli/using) — Official Cursor CLI docs
