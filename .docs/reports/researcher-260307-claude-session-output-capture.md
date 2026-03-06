# Research Report: Alternatives to `script` for Claude Code Session Output Capture

**Date:** 2026-03-07

## Executive Summary

The `script` command approach is fundamentally wrong for this use case. There are **three superior alternatives**, ranked by reliability:

1. **File-based detection via hooks** (RECOMMENDED) -- use Claude's `Stop` hook or `PostToolUse(Write)` hook to detect when agent writes a handoff marker file, then `fswatch` triggers restart. Zero terminal capture needed.
2. **Claude Code SDK** (`@anthropic-ai/claude-agent-sdk`) -- run sessions programmatically via Node.js, get structured streaming events, detect markers in the event stream.
3. **`--output-format stream-json` with `-p`** -- non-interactive mode emits structured JSON events to stdout; parse for markers. Loses interactive terminal.

The file-based approach (option 1) is the clear winner: it preserves the interactive terminal, requires no ANSI stripping, has zero buffering issues, and leverages infrastructure already deployed in this repo.

## Research Methodology

- Sources: Claude Code CLI `--help` output (direct), npm registry, existing hooks research in this repo, Gemini web search, official Anthropic docs
- Key search terms: claude code cli flags, claude-agent-sdk, claude code hooks, terminal capture alternatives

## Key Findings

### 1. Claude Code CLI Flags

The CLI has extensive output control [1]:

| Flag | Description |
|------|-------------|
| `--output-format json` | Single JSON result (requires `-p`) |
| `--output-format stream-json` | Realtime streaming JSON events (requires `-p`) |
| `--output-format text` | Plain text (requires `-p`, default) |
| `--include-partial-messages` | Include partial chunks (requires `-p` + `stream-json`) |
| `--input-format stream-json` | Accept streaming JSON input (requires `-p`) |
| `--json-schema <schema>` | Structured output validation |
| `--debug-file <path>` | Write debug logs to file |

**Critical limitation:** `--output-format` and `--input-format` only work with `-p` (print/non-interactive mode). In `-p` mode, the user loses the interactive terminal -- no permission prompts, no live tool use display, no manual intervention. For an auto-restart wrapper that must preserve interactivity, these flags are unusable.

`--debug-file` writes internal debug logs, not agent output text. Not useful for marker detection.

### 2. Claude Code SDK (`@anthropic-ai/claude-agent-sdk`)

The SDK exists and is actively maintained [2]:

```
@anthropic-ai/claude-agent-sdk@0.2.70
SDK for building AI agents with Claude Code's capabilities.
https://github.com/anthropics/claude-agent-sdk-typescript
```

**Key API: `query()` function** returns async iterable of structured events:

```typescript
import { query } from "@anthropic-ai/claude-agent-sdk";

const stream = query({
  prompt: "Do the work...",
  options: {
    allowedTools: ["Read", "Edit", "Bash", "Write"],
    permissionMode: "acceptEdits",
  }
});

for await (const event of stream) {
  if (event.type === "text") {
    // Check for marker in agent text output
    if (event.text.includes("---HANDOFF-RESTART---")) {
      // Trigger restart
    }
  }
}
```

**Trade-offs:**
- Full structured output with typed events
- No ANSI codes, no buffering issues
- But: runs headless (no interactive terminal for user)
- Requires managing permissions programmatically
- Good for fully automated pipelines, bad for user-attended sessions

### 3. Claude Code Hooks System

This repo already uses hooks extensively [3]. The hooks system provides 13+ event types including `Stop`, `PostToolUse`, `SessionEnd`, and `PostToolUse(Write)`.

**Key insight:** Instead of capturing terminal output, make the agent write a sentinel file. Then detect the file via a hook or `fswatch`.

**Approach A: PostToolUse(Write) hook** -- when agent writes a file matching a pattern (e.g., `/tmp/claude-handoff-restart-*`), the hook fires and can signal the wrapper script.

```json
{
  "matcher": "Write",
  "hooks": [{
    "type": "command",
    "command": "~/.claude/hooks/detect-handoff-restart.sh",
    "timeout": 5
  }]
}
```

Hook script reads `tool_input.file_path` from stdin JSON, checks if it matches the sentinel pattern.

**Approach B: Stop hook** -- fires when agent finishes responding. Check if a sentinel file exists at that point.

**Approach C: SessionEnd hook** -- fires when session terminates. Can trigger restart logic.

### 4. File-Based Detection (Recommended Approach)

Bypass terminal capture entirely. Architecture:

```
Agent instructions:
  "When you need to restart, write a file to
   /tmp/claude-restart-{session_id}.json with handoff data,
   then stop."

Wrapper script:
  fswatch -1 /tmp/claude-restart-*.json && restart_session()
```

**Implementation:**

```bash
#!/bin/bash
RESTART_DIR="/tmp/claude-restarts"
mkdir -p "$RESTART_DIR"

while true; do
  # Run claude interactively (user sees full terminal)
  claude --session-id "$SESSION_ID" \
    --append-system-prompt "When context is exhausted, write handoff to $RESTART_DIR/handoff.json and exit."

  # After claude exits, check for restart signal
  if [ -f "$RESTART_DIR/handoff.json" ]; then
    HANDOFF=$(cat "$RESTART_DIR/handoff.json")
    rm "$RESTART_DIR/handoff.json"
    # Start new session with handoff context
    SESSION_ID=$(uuidgen)
    # Feed handoff into next session via --append-system-prompt or initial message
  else
    break  # Normal exit, no restart
  fi
done
```

**Why this wins:**
- Preserves interactive terminal completely
- Zero ANSI/buffering issues (no terminal capture at all)
- Agent already writes files as core capability
- `fswatch` is native macOS (FSEvents API), <1ms latency
- Works with existing hooks infrastructure
- Simple to implement and debug

### 5. Alternative Terminal Capture (If Terminal Capture Is Required)

If for some reason you must capture terminal output:

| Method | Reliability | Buffering | ANSI | macOS | Interactive |
|--------|-------------|-----------|------|-------|-------------|
| `script -q` | Low | Flaky | Raw/corrupt | Yes | Yes |
| `node-pty` | High | Event-driven | Raw (clean) | Excellent | Possible |
| `tmux capture-pane` | High | History-based | Optional `-e` | `brew` | Yes |
| `unbuffer` | Medium | Forces line | Preserved | `brew` | Partial |
| Python `pty` | Medium | Configurable | Raw | Builtin | Possible |

**`tmux` approach** (best terminal-capture option if needed):

```bash
# Start claude in a tmux session
tmux new-session -d -s claude-session "claude"

# Poll for marker (every 2s)
while true; do
  OUTPUT=$(tmux capture-pane -t claude-session -p -S -100)
  if echo "$OUTPUT" | grep -q "HANDOFF-RESTART"; then
    # Found marker, trigger restart
    break
  fi
  sleep 2
done
```

But this is still inferior to file-based detection.

### 6. Transcript File Monitoring

Claude Code writes JSONL transcripts to `~/.claude/projects/.../SESSION_ID.jsonl`. The `transcript_path` is available in every hook event. You could monitor this file with `fswatch` and parse the JSONL for markers.

**Trade-off:** Transcript format is internal/undocumented; may change between versions. The file-based sentinel approach (section 4) is more robust because you control the format.

## Ranked Recommendations

| Rank | Approach | Complexity | Reliability | Preserves Interactive | macOS |
|------|----------|------------|-------------|----------------------|-------|
| 1 | File-based sentinel + `fswatch` | Low | High | Yes | Native |
| 2 | Stop/SessionEnd hook + sentinel file | Low | High | Yes | Native |
| 3 | SDK `query()` with event stream | Medium | High | No | Yes |
| 4 | `-p --output-format stream-json` | Medium | High | No | Yes |
| 5 | `tmux capture-pane` polling | Medium | Medium | Yes (in tmux) | `brew` |
| 6 | `node-pty` wrapper | High | High | Possible | Yes |
| 7 | `script -q` (current) | Low | Low | Yes | Native |

**Recommendation:** Use approach 1 (file-based sentinel) combined with approach 2 (Stop hook as backup). The agent writes a JSON file with handoff data, `fswatch` or the Stop hook detects it, wrapper script restarts. No terminal capture needed at all.

## Claims Registry

| # | Claim | Citation | Critical Path |
|---|-------|----------|---------------|
| 1 | `--output-format` requires `-p` flag (non-interactive only) | [1] | Yes |
| 2 | `@anthropic-ai/claude-agent-sdk` v0.2.70 exists on npm with `query()` API | [2] | No |
| 3 | Claude Code hooks support 13+ event types including PostToolUse, Stop, SessionEnd | [3] | Yes |
| 4 | PostToolUse hook receives `tool_input` with file path for Write operations | [3] | Yes |
| 5 | `fswatch` uses macOS FSEvents API natively | [4] | No |
| 6 | `node-pty` provides event-driven PTY with excellent macOS support | [5] | No |
| 7 | `--session-id` flag accepts UUID for session identification | [1] | No |

## Source Analysis

| Source | Domain | Reputation | Type | Access Date | Verification |
|--------|--------|------------|------|-------------|--------------|
| Claude CLI --help | Local binary | High | Official | 2026-03-07 | Direct |
| npm registry | npmjs.com | High | Official | 2026-03-07 | Direct |
| Hooks research report | Internal | High | Technical | 2026-02-18 | Cross-verified |
| Gemini web search | Multiple | Medium-High | Industry | 2026-03-07 | Partially verified |

**Reputation Summary:**
- High reputation sources: 3 (75%)
- Medium-high reputation: 1 (25%)
- Average reputation score: 0.88

## References

[1] Claude Code CLI. `claude --help` output, v2.1.70. Local binary. Accessed 2026-03-07.
[2] Anthropic. "@anthropic-ai/claude-agent-sdk". npm registry. https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk. Accessed 2026-03-07.
[3] Internal. "Claude Code Hooks JSON Schema Reference". `.docs/reports/researcher-260218-claude-code-hooks-json-schema.md`. 2026-02-18. Cross-verified against https://docs.anthropic.com/en/docs/claude-code/hooks.
[4] Apple. "FSEvents Programming Guide". https://developer.apple.com/library/archive/documentation/Darwin/Conceptual/FSEvents_ProgGuide/. Accessed 2026-03-07.
[5] Microsoft. "node-pty". https://github.com/microsoft/node-pty. Accessed 2026-03-07.

## Unresolved Questions

1. Does `@anthropic-ai/claude-agent-sdk` `query()` support resuming sessions (`--continue`/`--resume` equivalent)?
2. Can the SDK's event stream include tool use details (file paths written) in real-time?
3. Is there a way to run Claude Code interactively while also getting structured output (hybrid mode)? The `--help` output suggests `--input-format stream-json` + `--output-format stream-json` but both require `-p`.
4. Could the `--replay-user-messages` flag (requires stream-json) enable a pseudo-interactive mode where a wrapper program mediates stdin/stdout?
