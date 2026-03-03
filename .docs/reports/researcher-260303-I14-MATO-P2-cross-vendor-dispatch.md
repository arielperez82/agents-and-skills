# Research: I14-MATO Phase 2 — Cross-Vendor Dispatch Implementation Details

**Date:** 2026-03-03
**Initiative:** I14-MATO Phase 2
**Builds on:** researcher-260219-multi-agent-token-cost-orchestration.md, status-external-agents.md, strategic assessment

## Executive Summary

Phase 2 has four parallel-then-sequential layers. This report provides NEW implementation-specific findings: exact CLI flag mappings for Gemini/Codex backends, telemetry hook architecture analysis, `/dispatch` command pattern, and risks. Prior research covered strategy/rationale -- this covers HOW.

## 1. CLI Flag Mappings (New Findings)

### Gemini CLI v0.29.3

```
Binary: gemini
Non-interactive: -p/--prompt "text"
Model: -m/--model <name>
Output: -o/--output-format text|json|stream-json
Auto-approve: --approval-mode yolo|auto_edit|plan|default
Sandbox: -s/--sandbox (boolean)
```

**cli_client.py backend entry:**
```python
"gemini": {
    "binary": "gemini",
    "name": "Gemini CLI",
    "prompt_flag": "-p",
    "output_flag": "-o",
    "model_flag": "-m",
}
```

**Key difference from claude/cursor:** Uses `-o` not `--output-format`. The `-p` flag works identically. Stdin piping also works: `gemini -p "prompt" < file.ts`.

### Codex CLI v0.104.0

```
Binary: codex
Non-interactive: codex exec "prompt" (subcommand, NOT a flag)
Model: -m/--model <name>
Sandbox: -s/--sandbox read-only|workspace-write|danger-full-access
Output: --json (JSONL to stdout), -o/--output-last-message <file>
No --output-format flag. Stdout capture = text by default.
Stdin: codex exec - (reads prompt from stdin)
Built-in review: codex exec review
```

**cli_client.py backend entry:**
```python
"codex": {
    "binary": "codex",
    "name": "Codex CLI",
    "subcommand": "exec",  # NEW: codex uses subcommand
    "prompt_flag": None,    # prompt is positional after exec
    "output_flag": None,    # no --output-format; stdout is text
    "model_flag": "-m",
}
```

**Critical difference:** Codex uses `codex exec "prompt"` — the prompt is a positional argument to the `exec` subcommand. No `-p` flag. The `invoke_cli` function needs refactoring to handle this: argv = `["codex", "exec", prompt]` not `["codex", "-p", prompt]`. Output format: capture stdout directly (text); for JSON use `--json` flag (JSONL events, not clean JSON — parse last message only). Simpler: use `-o /tmp/output.txt` and read file.

## 2. cli_client.py Refactoring Requirements

Current `invoke_cli` builds argv as: `[binary, "-p", prompt, "--output-format", output_format]`. This breaks for:
- **Codex**: needs `[binary, "exec", prompt]` (no -p, no --output-format)
- **Gemini**: needs `[binary, "-p", prompt, "-o", output_format]` (-o not --output-format)

**Recommended approach:** Move argv construction into per-backend builders.

```python
_BACKENDS = {
    "claude": {"binary": "claude", "name": "Claude Code CLI",
               "build_argv": lambda p, fmt, extra: ["claude", "-p", p, "--output-format", fmt] + (extra or [])},
    "cursor": {"binary": "agent", "name": "Cursor Agent CLI",
               "build_argv": lambda p, fmt, extra: ["agent", "-p", p, "--output-format", fmt] + (extra or [])},
    "gemini": {"binary": "gemini", "name": "Gemini CLI",
               "build_argv": lambda p, fmt, extra: ["gemini", "-p", p, "-o", fmt] + (extra or [])},
    "codex":  {"binary": "codex", "name": "Codex CLI",
               "build_argv": lambda p, fmt, extra: ["codex", "exec", p, "--sandbox", "read-only"] + (extra or [])},
}
```

Auto-detect order should be: claude -> codex -> gemini -> cursor (codex most reliable T2; cursor rate-limited).

## 3. Wrapper Module Patterns

`cursor_client.py` sets the pattern: thin wrapper delegating to `invoke_cli(backend="cursor")` with backend-specific args.

**gemini_client.py** — add `approval_mode` param (default "yolo" for non-interactive), `model` param.

**codex_client.py** — add `sandbox` param (default "read-only"), `model` param. Include `invoke_codex_review()` helper wrapping `codex exec review`.

## 4. Telemetry Hook Architecture

Hooks are Claude Code event-driven: stdin receives JSON event, entrypoint parses + transforms, sends to Tinybird. Current hooks:
- `log-session-summary.ts` — SessionEnd event → session_summaries datasource
- `log-agent-start.ts` / `log-agent-stop.ts` — SubagentStart/Stop → agent_activations
- `log-skill-activation.ts` — PostToolUse → skill_activations
- `inject-usage-context.ts` — SessionStart → injects summary into context

**Problem for cross-vendor telemetry:** These hooks only fire during Claude Code sessions. Non-Claude invocations (gemini/codex subprocess calls from `cli_client.py`) produce no hook events.

**Solution:** Instrument `cli_client.py` itself. After each `invoke_cli` call, emit a telemetry event to Tinybird directly (HTTP POST). Requires:
1. New datasource: `cross_vendor_invocations` (timestamp, backend, model, prompt_length, response_length, duration_ms, exit_code, session_id)
2. Python telemetry helper: read `TB_INGEST_TOKEN` + `TB_HOST` from env, POST to Tinybird append API
3. New pipe: extend `cost_by_agent` or create `cross_vendor_usage` pipe

**session_summaries schema** already has `model_primary` and `agents_used` — no schema changes needed there. The gap is per-invocation tracking of non-Claude calls.

## 5. /dispatch Command Pattern

Commands in this repo are markdown files in `commands/` with YAML frontmatter. Pattern from `commands/scout.md`:

```yaml
---
description: Route a task to the cheapest capable backend
argument-hint: [task-description]
---
```

The command body instructs Claude how to execute. For `/dispatch`:
1. Parse task description from `$ARGUMENTS`
2. Classify tier: T1 (deterministic) / T2 (pattern-following) / T3 (novel judgment)
3. Select backend from fallback chain: gemini -> codex -> haiku -> sonnet
4. Run pre-flight check (is backend binary on PATH + authenticated?)
5. Execute via appropriate CLI
6. Capture output, validate if T3 validation needed
7. Return result

Classification heuristics (rule-based, not ML):
- Keywords "summarize", "boilerplate", "draft", "list", "format" -> T2
- Keywords "architecture", "security", "design", "review critical" -> T3
- File operations, lint, format -> T1 (local script)
- Default: T2 (cheaper is better; escalate on failure)

## 6. Pre-flight Health Check

Simple shell or Python function checking each backend:

```bash
# Check binary exists + responds
command -v gemini && gemini -p "Reply OK" -o text
command -v codex && codex exec "Reply OK" --sandbox read-only
command -v claude && claude -p "Reply OK" --output-format text
command -v agent && agent -p "Reply OK" --output-format text
```

Cache results for session duration. Expensive (~4 subprocess calls) so run once at session start, not per-dispatch.

## 7. Risks Specific to Phase 2

| Risk | Severity | Mitigation |
|------|----------|------------|
| Codex `exec` positional arg breaks quoting with special chars | Medium | Shell-escape prompt; use stdin (`echo "prompt" \| codex exec -`) |
| Gemini `-o text` may include ANSI escape codes | Low | Strip ANSI from output; or use `--raw-output` with post-processing |
| Pre-flight check adds 10-30s to session start | Medium | Run async/background; cache in temp file; skip if cached <1h old |
| Codex `--json` output is JSONL events, not clean text | Medium | Use `-o /tmp/file` or capture stdout without `--json` flag |
| Python telemetry POST fails silently if no TB tokens | Low | Best-effort; log warning, don't block dispatch |
| Cursor quota resets 3/13 — can't test until then | Low | Defer cursor-specific tests; codex+gemini cover T2 |

## Unresolved Questions

1. Does `codex exec` return non-zero exit code on model errors vs tool errors? Need to test error handling paths.
2. Gemini CLI with API key auth (`GEMINI_API_KEY`) — does `-p` work in subprocess mode without interactive OAuth? Likely yes per charter note but needs verification.
3. Should cross-vendor telemetry be a separate datasource or extend `agent_activations`? Separate is cleaner (different schema) but adds a datasource.

## Claims Registry

| # | Claim | Citation | Critical Path |
|---|-------|----------|---------------|
| 1 | Gemini CLI uses `-p` for non-interactive, `-o` for output format | [1] | Yes |
| 2 | Codex CLI uses `codex exec` subcommand with positional prompt arg | [2] | Yes |
| 3 | Codex has no `--output-format` flag; uses `--json` for JSONL or `-o` for file output | [2] | Yes |
| 4 | Codex default sandbox is not specified; must pass `--sandbox read-only` explicitly | [2] | No |
| 5 | Gemini `--approval-mode yolo` auto-approves all tool use | [1] | No |
| 6 | Current telemetry hooks only fire during Claude Code sessions via stdin JSON events | [3] | Yes |

## Source Analysis

| Source | Domain | Reputation | Type | Access Date | Verification |
|--------|--------|------------|------|-------------|--------------|
| gemini --help (local v0.29.3) | CLI output | High | official | 2026-03-03 | Verified locally |
| codex --help / codex exec --help (local v0.104.0) | CLI output | High | official | 2026-03-03 | Verified locally |
| telemetry/src/hooks/ (repo source) | Local codebase | High | primary | 2026-03-03 | Read directly |
| skills/orchestrating-agents/scripts/ (repo source) | Local codebase | High | primary | 2026-03-03 | Read directly |

**Reputation Summary**: High reputation sources: 4 (100%). Average reputation score: 1.0

## References

[1] `gemini --help` output, Gemini CLI v0.29.3, local installation. Accessed 2026-03-03.
[2] `codex --help` and `codex exec --help` output, Codex CLI v0.104.0, local installation. Accessed 2026-03-03.
[3] Telemetry hook source code: `telemetry/src/hooks/entrypoints/`. Accessed 2026-03-03.
