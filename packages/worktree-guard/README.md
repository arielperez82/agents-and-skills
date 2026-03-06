# worktree-guard

PreToolUse hook that blocks `git worktree add` when unpushed commits exist on the current branch. Prevents worktree agents from branching off stale `origin/main`, which causes them to miss recent work.

## Problem

When an orchestrator agent dispatches a worktree subagent via `git worktree add`, the new worktree branches from `origin/main`. If the orchestrator has local commits that haven't been pushed, those commits are invisible to the subagent. This causes duplicated or conflicting work (L75).

## How it works

1. Hook reads stdin JSON from Claude Code's PreToolUse event
2. Fast path: if tool is not `Bash` or command does not contain `git worktree add`, exits 0 (allow)
3. Runs `git log @{push}..HEAD --oneline` to detect unpushed commits
4. If unpushed commits exist: exits 2 (block) with a message instructing the agent to push first
5. If no unpushed commits, no remote tracking branch, or any error: exits 0 (fail-open)

## Enforcement level

**Level 2 (blocker)** -- exit code 2 blocks the tool call. The agent cannot proceed with `git worktree add` until it pushes.

## Fail-open behavior

The hook fails open (exit 0, allow) in all ambiguous cases:

- No remote tracking branch configured
- Not inside a git repository
- Malformed or empty stdin JSON
- `git log @{push}..HEAD` returns an error for any reason

## Install

```bash
./install.sh
```

Or manually: symlink `scripts/worktree-guard-pre.sh` into your Claude Code hooks directory and register it as a `PreToolUse` hook in `~/.claude/settings.json`.

## Environment variables

None. This hook has no configurable thresholds.

## Testing

```bash
bash test.sh
```

## Known limitations

- JSON parsing uses `grep`/`sed` (no `jq` dependency). Commands containing escaped quotes (e.g., heredoc-style commit messages) may truncate the extracted `command` field. The failure mode is always fail-open (allow), consistent with ADR-003.
- If Claude Code's JSON field ordering changes (e.g., `tool_result` before `tool_input`), the `head -1` extraction could pick the wrong `command` value. This is a known coupling to the current protocol.

## Dependencies

- `bash` (4.0+)
- `git`
- No `jq` -- uses bash string manipulation for JSON parsing
