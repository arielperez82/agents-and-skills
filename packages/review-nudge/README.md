# Review Nudge Hook

Level 1 nudge hook for Claude Code sessions. Detects git commits and reminds the agent to run `/review/review-changes` before continuing with new work. Enforces the commit-review cadence without blocking.

## Problem

Agents commit code (good) but forget to run the per-story review gate before moving on. This accumulates unreviewed changes that get harder to review as the session progresses. The review-nudge hook gently reminds the agent after each commit.

## Architecture

```
review-nudge-post.sh (PostToolUse: detects commits + nudges toward review)
    |
    v
/tmp/claude-review-pending-{SSE_PORT}    <-- pending review flag (count|timestamp)
/tmp/claude-review-throttle-{SSE_PORT}   <-- throttle marker
```

The **PostToolUse hook** runs after every tool call. It inspects the tool result to detect:
1. **Successful git commits** (sets a pending-review flag with commit count)
2. **`/review/review-changes` invocations** (clears the pending flag)
3. **Any other tool call while flag is set** (emits a nudge)

A **SessionEnd** hook cleans up temp files.

## Enforcement Level

**Level 1: Nudge only.** The hook emits `systemMessage` reminders but never blocks tool calls (always exits 0). This is intentional. Review is a per-story gate, not a per-commit gate. The nudge keeps it top-of-mind without disrupting flow.

## Ignored Commits

The following commit types do not trigger the pending-review flag:

- **`wip:` prefix** - Work-in-progress checkpoints (not reviewable yet)
- **`docs:` prefix** - Documentation-only changes (low review urgency)
- **Failed commits** - Non-zero exit code means nothing was committed

## Installation

### Quick install

```bash
cd packages/review-nudge
chmod +x scripts/*.sh
# Symlink into hooks directory
ln -sf "$(pwd)/scripts/review-nudge-post.sh" ~/.claude/hooks/review-nudge-post.sh
ln -sf "$(pwd)/scripts/review-nudge-cleanup.sh" ~/.claude/hooks/review-nudge-cleanup.sh
```

### Settings.json

Add hook registrations to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "command": "~/.claude/hooks/review-nudge-post.sh",
        "timeout": 1000
      }
    ],
    "SessionEnd": [
      {
        "command": "~/.claude/hooks/review-nudge-cleanup.sh",
        "timeout": 1000
      }
    ]
  }
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `REVIEW_NUDGE_THROTTLE` | 60 | Seconds between nudge messages |

## Cache Format

| File | Format | Description |
|------|--------|-------------|
| `/tmp/claude-review-pending-{SSE_PORT}` | `count\|timestamp` | Number of unreviewed commits and time of last commit |
| `/tmp/claude-review-throttle-{SSE_PORT}` | Unix timestamp | Last nudge emission time |

## Context-Utilization Caveat (R3)

At high context utilization (>50%), prefer `/context/handoff` over `/review/review-changes`. The context-management hook will enforce this boundary. A clean handoff preserves review context for the next session, while running a full review at high utilization risks degraded output quality.

## Package Structure

```
packages/review-nudge/
  scripts/
    review-nudge-post.sh       # PostToolUse (detect commits + nudge)
    review-nudge-cleanup.sh    # SessionEnd (cleanup temp files)
  tests/
    review-nudge-post.test.sh  # PostToolUse tests
  test.sh                      # Test runner
  README.md
```

### Per-session temp files

| File | Created by | Cleaned by |
|------|------------|------------|
| `/tmp/claude-review-pending-{SSE_PORT}` | `review-nudge-post.sh` | SessionEnd hook |
| `/tmp/claude-review-throttle-{SSE_PORT}` | `review-nudge-post.sh` | SessionEnd hook |

## Testing

```bash
# Run all tests
bash test.sh

# Run individual test suite
bash tests/review-nudge-post.test.sh
```

Tests use fake `CLAUDE_CODE_SSE_PORT` values. They never touch real session cache files.

## Known Limitations

- JSON parsing uses `grep`/`sed` (no `jq` dependency). Commands containing escaped quotes may truncate the extracted fields. The failure mode is a missed nudge (fail-open), consistent with ADR-003.
- The throttle and pending-counter file operations are not atomic. Concurrent hook invocations could cause a double-nudge or incorrect count. This is acceptable for an advisory hook.

## Interaction with Other Hooks

- **commit-monitor**: Independent. Commit-monitor tracks uncommitted risk; review-nudge tracks unreviewed commits. Different concerns, separate cache files.
- **context-management**: At high context (>50%), the context-management hook takes priority. The nudge message itself reminds the agent of this boundary.
