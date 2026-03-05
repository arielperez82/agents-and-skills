# Context Management Hooks

Automatic context window monitoring and handoff enforcement for Claude Code sessions. Prevents agents from running past context limits by escalating from warnings to hard blocks.

## Problem

Agents ignore instructions to check context utilization and write handoffs. They stay "in the zone" until context degrades silently, producing low-quality output with no handoff for the next session. Instructions are suggestions; hooks are enforcement.

## Architecture

Three components work together:

```
status-line.sh (renders every cycle)
    |
    v
/tmp/claude-ctx-pct-{SSE_PORT}   <-- per-session cache file
    ^                ^
    |                |
context-monitor-post.sh      context-gate-pre.sh
(PostToolUse: warnings)      (PreToolUse: blocks)
```

The **status line** computes context percentage on every render and caches it to a temp file namespaced by `CLAUDE_CODE_SSE_PORT` (unique per Claude Code instance). The **hooks** read that cached value — no computation, < 1ms overhead.

A **SessionEnd** hook cleans up temp files when the session terminates.

## Installation

### Quick install

```bash
cd packages/context-management
./install.sh
```

This creates symlinks from `~/.claude/hooks/` and `~/.claude/scripts/` to the canonical scripts in this package. Existing files are backed up with a `.bak` timestamp.

### Check current state

```bash
./install.sh --check
```

### Uninstall

```bash
./install.sh --uninstall
```

### Settings.json

After running `install.sh`, add the hook registrations to `~/.claude/settings.json`. See `claude-settings.example.json` for the exact entries needed:

- **PreToolUse**: `context-gate-pre.sh` (hard blocker at 75%+)
- **PostToolUse**: `context-monitor-post.sh` (warnings at 55%+)
- **SessionEnd**: cleanup temp files
- **statusLine**: `status-line.sh` (colored context bar)

## Escalation Tiers

| Context | Status Line | PostToolUse Hook | PreToolUse Hook |
|---------|-------------|------------------|-----------------|
| < 55% | Green | Silent | Allow all |
| 55-64% | Yellow | Warning: "wrap up, past 65% you'll be asked to STOP" | Allow all |
| 65-74% | Orange | STOP: "initiate handoff NOW, at 75% tools BLOCKED" | Allow all |
| 75%+ | Red | STOP (same) | **exit 2 blocks** all tools except Write/Edit/Read/Glob/Grep |

### Why these thresholds?

- **55%**: Early warning. Agent has room to finish current task and commit.
- **65%**: Firm directive. Agent must stop feature work and begin handoff.
- **75%**: Hard gate. Agent literally cannot use Bash, Agent, or other tools. Only file read/write for producing the handoff document.

### Why exit 2, not exit 1?

| Exit code | Effect on PreToolUse |
|-----------|---------------------|
| exit 0 | Allow — parse JSON from stdout |
| exit 1 | Non-blocking error — **silently ignored**, tool proceeds |
| exit 2 | **Blocking error** — tool call prevented, stderr shown to Claude |

Exit 1 is invisible to the agent. Only exit 2 actually blocks.

## Package Structure

```
packages/context-management/
  scripts/
    status-line.sh           # Status line + cache writer
    context-monitor-post.sh  # PostToolUse (soft warnings)
    context-gate-pre.sh      # PreToolUse (hard blocker)
  tests/
    status-line.test.sh
    context-gate-pre.test.sh
    context-monitor-post.test.sh
  install.sh                 # Symlink installer
  test.sh                    # Test runner
  claude-settings.example.json
  README.md
```

### Installed symlinks

| Canonical source | Symlink target |
|---|---|
| `scripts/status-line.sh` | `~/.claude/scripts/status-line.sh` |
| `scripts/context-gate-pre.sh` | `~/.claude/hooks/context-gate-pre.sh` |
| `scripts/context-monitor-post.sh` | `~/.claude/hooks/context-monitor-post.sh` |

## Testing

```bash
# Run all tests
./test.sh

# Run individual test suites
bash tests/status-line.test.sh
bash tests/context-gate-pre.test.sh
bash tests/context-monitor-post.test.sh

# Shellcheck
shellcheck scripts/*.sh install.sh
```

Tests use fake `CLAUDE_CODE_SSE_PORT` values and clean up after themselves — they never touch real session cache files.

## Per-Session Isolation

Multiple concurrent Claude Code sessions each bind to a different SSE port. The `CLAUDE_CODE_SSE_PORT` environment variable is available to both the status line and hooks, so each session reads/writes its own cache file. Falls back to `global` if the env var is missing.

## Throttling

The PostToolUse hook fires on every tool call but only emits a warning once per 60 seconds. This prevents the ironic scenario of context warnings consuming context. The throttle state is stored in `/tmp/claude-ctx-warned-{SSE_PORT}` and cleaned up on session end.

The PreToolUse hook has no throttling — it checks on every call but the check is a single file read (< 1ms), and when it blocks, the agent needs to see the message every time to understand why tools aren't working.

## Tuning

To adjust thresholds, edit the percentage checks in:
- `scripts/context-monitor-post.sh`: lines checking `$pct -lt 55` and `$pct -ge 65`
- `scripts/context-gate-pre.sh`: line checking `$pct -lt 75`
- `scripts/status-line.sh`: `classify_zone()` function

To adjust throttle interval, change `THROTTLE_SECONDS=60` in `scripts/context-monitor-post.sh`.

To allow additional tools through the 75%+ gate, add them to the `case` statement in `scripts/context-gate-pre.sh`.
