# Commit Monitor Hooks

Commit frequency enforcement for Claude Code sessions. Continuously monitors uncommitted risk and escalates from nudges to hard blocks, preventing agents from accumulating large uncommitted changesets.

## Problem

Agents get "in the zone" and accumulate hundreds of lines of uncommitted changes over long periods. This violates the "commit early, commit often" principle and puts work at risk. Instructions are suggestions; hooks are enforcement.

## Architecture

```
commit-nudge-post.sh (PostToolUse: computes git metrics + nudges)
    |
    v
/tmp/claude-commit-risk-{SSE_PORT}   <-- per-session cache
    ^
    |
commit-gate-pre.sh (PreToolUse: reads cache, blocks at red)
```

The **PostToolUse hook** runs after every tool call, computes a risk score from git state, caches it, and outputs escalating nudge messages. The **PreToolUse hook** reads the cached score and blocks expansive tools when risk is critical.

A **SessionEnd** hook cleans up temp files.

## Risk Score

The score is a weighted composite of multiple git metrics:

```
score = prod_lines * 1.0
      + test_lines * 0.25
      + doc_lines  * 0.5
      + minutes_since_commit * 3
      + unique_dirs_touched * 5
```

**File classification:**
- **Test files** (0.25x): `*.test.*`, `*.spec.*`, `__tests__/*`, `tests/*`
- **Doc files** (0.5x): `*.md`
- **Production code** (1.0x): everything else

**Why weighted?** Test code is lower risk (it's verifying behavior, not changing it). Doc changes matter but don't break production. Production code is the highest risk.

Both tracked changes (staged + unstaged) and untracked files are counted.

## Escalation Tiers

| Zone | Score | PostToolUse | PreToolUse |
|------|-------|-------------|------------|
| Green | < 200 | Silent | Allow all |
| Yellow | 200-499 | Nudge: "Consider committing" | Allow all |
| Orange | 500-999 | Directive: "STOP and COMMIT NOW" | Allow all |
| Red | 1000+ | "BLOCKED from new work" | **exit 2 blocks** expansive tools |

### What gets blocked at Red?

- **Blocked**: Agent, WebSearch, WebFetch, Skill, NotebookEdit, TaskCreate (expansive/new work)
- **Allowed**: Bash (for git commands), Write, Edit, Read, Glob, Grep (fixing + committing)

The agent can still fix code, run tests, and commit. It just can't start new work.

### Throttling

- **Yellow/Orange** messages: throttled to once per 120 seconds (configurable)
- **Red** messages: always shown (critical, must get through)
- PostToolUse computation runs every time (git operations are fast, < 100ms)

## Installation

### Quick install

```bash
cd packages/commit-monitor
./install.sh
```

Creates symlinks from `~/.claude/hooks/` to the canonical scripts.

### Check current state

```bash
./install.sh --check
```

### Uninstall

```bash
./install.sh --uninstall
```

### Settings.json

Add hook registrations to `~/.claude/settings.json`. See `claude-settings.example.json` for entries needed:

- **PreToolUse**: `commit-gate-pre.sh` (blocker at red)
- **PostToolUse**: `commit-nudge-post.sh` (compute + nudge)
- **SessionEnd**: cleanup temp files

## Configuration

All thresholds and weights are configurable via environment variables:

### Thresholds

| Variable | Default | Description |
|----------|---------|-------------|
| `COMMIT_MONITOR_YELLOW` | 200 | Score threshold for nudge messages |
| `COMMIT_MONITOR_ORANGE` | 500 | Score threshold for strong directives |
| `COMMIT_MONITOR_RED` | 1000 | Score threshold for tool blocking |

### Weights

| Variable | Default | Description |
|----------|---------|-------------|
| `COMMIT_MONITOR_TEST_WEIGHT` | 25 | Test file line weight (25 = 0.25x) |
| `COMMIT_MONITOR_DOC_WEIGHT` | 50 | Doc file line weight (50 = 0.5x) |
| `COMMIT_MONITOR_TIME_WEIGHT` | 3 | Points per minute since last commit |
| `COMMIT_MONITOR_DIR_WEIGHT` | 5 | Points per unique directory touched |

### Other

| Variable | Default | Description |
|----------|---------|-------------|
| `COMMIT_MONITOR_THROTTLE` | 120 | Seconds between yellow/orange nudges |

### Tuning strategy

Start with the generous defaults. As commit habits improve, tighten:

| Phase | Yellow | Orange | Red |
|-------|--------|--------|-----|
| Initial (current) | 200 | 500 | 1000 |
| Intermediate | 150 | 350 | 700 |
| Strict | 100 | 250 | 500 |

Set via environment or shell profile:
```bash
export COMMIT_MONITOR_YELLOW=150
export COMMIT_MONITOR_ORANGE=350
export COMMIT_MONITOR_RED=700
```

## Package Structure

```
packages/commit-monitor/
  scripts/
    commit-nudge-post.sh     # PostToolUse (compute + nudge)
    commit-gate-pre.sh       # PreToolUse (blocker)
  tests/
    commit-gate-pre.test.sh
    commit-nudge-post.test.sh
    risk-scoring.test.sh
  install.sh                 # Symlink installer
  test.sh                    # Test runner
  claude-settings.example.json
  README.md
```

### Installed symlinks

| Canonical source | Symlink target |
|---|---|
| `scripts/commit-gate-pre.sh` | `~/.claude/hooks/commit-gate-pre.sh` |
| `scripts/commit-nudge-post.sh` | `~/.claude/hooks/commit-nudge-post.sh` |

## Testing

```bash
# Run all tests
./test.sh

# Run individual test suites
bash tests/commit-gate-pre.test.sh     # Threshold blocking
bash tests/commit-nudge-post.test.sh   # Nudge messaging
bash tests/risk-scoring.test.sh        # Git computation (uses temp repos)

# Shellcheck
shellcheck scripts/*.sh install.sh
```

Tests use fake `CLAUDE_CODE_SSE_PORT` values and temp git repos. They never touch real session cache files or your working repository.

## Score Examples

| Scenario | Score | Zone |
|----------|-------|------|
| 20 uncommitted test lines, 0 min | 5 | Green |
| 50 prod lines + 20 test lines, 5 min, 2 dirs | 80 | Green |
| 150 prod lines + 50 test lines, 10 min, 3 dirs | 207 | Yellow |
| 300 prod lines, 20 min, 5 dirs | 385 | Yellow |
| 400 prod lines + 100 test lines, 30 min, 8 dirs | 555 | Orange |
| 500 prod lines, 60 min, 10 dirs | 730 | Orange |
| 600 prod lines + 200 test lines, 90 min, 15 dirs | 995 | Orange |
| 700 prod lines, 120 min, 20 dirs | 1160 | Red |

## Non-git Directories

If the working directory is not inside a git repository, both hooks silently pass through (no computation, no blocking, no nudges).

## Interaction with Context Management

This package is independent from `context-management`. Both can run simultaneously:
- Context management monitors context window usage
- Commit monitor monitors uncommitted work risk

They use separate cache files and don't interfere with each other.
