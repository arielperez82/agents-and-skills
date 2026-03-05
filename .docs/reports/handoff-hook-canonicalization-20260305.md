# Handoff: Canonicalize ~/.claude Hook Layout

**Date:** 2026-03-05
**Status:** Complete
**Context:** Planned in prior session (~81%), implemented in fresh session

## Goal

Standardize all Claude Code hooks to use **individual symlinks** in `~/.claude/hooks/` per script, matching the canonical convention from Claude Code docs (`$CLAUDE_PROJECT_DIR/.claude/hooks/`).

## Decision

- **Hooks**: `~/.claude/hooks/<script>.sh` → individual symlinks to package scripts
- **Status line**: `~/.claude/scripts/status-line.sh` → symlink (special case, stays in `scripts/`)

## Current State

### What's already correct (individual symlinks in `~/.claude/hooks/`)
- `commit-gate-pre.sh` → `packages/commit-monitor/scripts/commit-gate-pre.sh`
- `commit-nudge-post.sh` → `packages/commit-monitor/scripts/commit-nudge-post.sh`
- `context-gate-pre.sh` → `packages/context-management/scripts/context-gate-pre.sh`
- `context-monitor-post.sh` → `packages/context-management/scripts/context-monitor-post.sh`

### What needs fixing

1. **Telemetry hooks** — Currently use inline `cd ~/.claude/telemetry-hooks && pnpx dotenv-cli -e ~/.claude/.env.prod -- pnpx tsx src/hooks/entrypoints/<file>.ts` in settings.json. Need:
   - Create 6 wrapper shell scripts in `telemetry/scripts/` (one per entrypoint)
   - Each wrapper does the `cd` + `pnpx dotenv-cli` + `pnpx tsx` internally
   - Symlink each to `~/.claude/hooks/`
   - Update `settings.json` to reference `~/.claude/hooks/<wrapper>.sh`
   - Create `telemetry/install.sh` matching the pattern of other packages

   **6 telemetry entrypoints** (from settings.json):
   | Wrapper name | Entrypoint | Hook event |
   |---|---|---|
   | `telemetry-log-agent-start.sh` | `log-agent-start.ts` | SubagentStart |
   | `telemetry-log-agent-stop.sh` | `log-agent-stop.ts` | SubagentStop |
   | `telemetry-log-script-start.sh` | `log-script-start.ts` | PreToolUse (Bash) |
   | `telemetry-log-skill-activation.sh` | `log-skill-activation.ts` | PostToolUse + PostToolUseFailure |
   | `telemetry-log-session-summary.sh` | `log-session-summary.ts` | SessionEnd |
   | `telemetry-inject-usage-context.sh` | `inject-usage-context.ts` | SessionStart |

   **Wrapper template:**
   ```bash
   #!/bin/bash
   SCRIPT_DIR="$(cd "$(dirname "$(readlink -f "$0")")" && pwd)"
   TELEMETRY_DIR="$(cd "$SCRIPT_DIR/../../telemetry" && pwd)"
   cd "$TELEMETRY_DIR" && pnpx dotenv-cli -e ~/.claude/.env.prod -- pnpx tsx src/hooks/entrypoints/<entrypoint>.ts
   ```
   Note: `readlink -f` resolves the symlink to find the real script dir, then navigates to telemetry root. Alternatively, hardcode the path since install.sh creates the symlinks.

2. **lint-changed** — Currently a **copied file** at `~/.claude/hooks/lint-changed.sh` (not a symlink). Need:
   - Update `packages/lint-changed/hooks/install.sh` to use `ln -s` instead of `cp`
   - Replace the copy with a symlink

3. **status-line.sh** — Currently a symlink-inside-a-symlink: `~/.claude/scripts/` is a dir symlink to `repo/scripts/`, and `repo/scripts/status-line.sh` is a symlink to `packages/context-management/scripts/status-line.sh`. This works but is fragile. Need:
   - Keep `~/.claude/scripts/` dir symlink as-is (it serves other scripts too)
   - Keep `scripts/status-line.sh` symlink as-is (it's in the repo's `scripts/` dir, tracked by git)
   - The context-management `install.sh` already handles this correctly (line 26)

4. **Cleanup needed:**
   - Remove `~/.claude/telemetry-hooks` directory symlink (after wrappers are in place)
   - Remove `.bak` files in `~/.claude/hooks/` (`context-gate-pre.sh.bak.*`, `context-monitor-post.sh.bak.*`)

## Files to Create

1. `telemetry/scripts/telemetry-log-agent-start.sh`
2. `telemetry/scripts/telemetry-log-agent-stop.sh`
3. `telemetry/scripts/telemetry-log-script-start.sh`
4. `telemetry/scripts/telemetry-log-skill-activation.sh`
5. `telemetry/scripts/telemetry-log-session-summary.sh`
6. `telemetry/scripts/telemetry-inject-usage-context.sh`
7. `telemetry/install.sh`

## Files to Edit

1. `~/.claude/settings.json` — Replace all `cd ~/.claude/telemetry-hooks && ...` commands with `~/.claude/hooks/telemetry-*.sh`
2. `packages/lint-changed/hooks/install.sh` — Change `cp` to `ln -s`
3. `packages/context-management/install.sh` — No changes needed (already correct)
4. `packages/commit-monitor/install.sh` — No changes needed (already correct)

## settings.json Target State

All hook commands should look like:
```json
"command": "~/.claude/hooks/<script>.sh"
```

Except:
- The SessionEnd cleanup command (inline `rm -f ...`) — fine as-is, it's a one-liner
- The statusLine: `~/.claude/scripts/status-line.sh` — stays in scripts/

## Verification Steps

After implementation:
1. `ls -la ~/.claude/hooks/` — all should be symlinks, no copies, no .bak files
2. `ls -la ~/.claude/scripts/status-line.sh` — should be a symlink (via the dir symlink chain)
3. Run each `install.sh --check` for all 3 packages + new telemetry
4. Start a new Claude Code session — verify status line shows, hooks fire
5. No `~/.claude/telemetry-hooks` symlink remaining
