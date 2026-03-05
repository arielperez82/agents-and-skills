# lint-changed

Runs lint-staged configurations against uncommitted files without requiring a git staging area. Designed as a continuous lint enforcement layer for Claude Code sessions — advisory feedback during work, hard gate before responding.

## Problem

Lint-staged only runs during `git commit` via pre-commit hooks. This means lint errors accumulate silently while the agent edits files, only surfacing at commit time. By then the agent may have built on top of broken code for dozens of tool calls.

Claude Code hooks give us two enforcement points: **PostToolUse** (after every Write/Edit) and **Stop** (before Claude responds). `lint-changed` bridges lint-staged configs to these hooks, catching errors as they're introduced and blocking responses until they're fixed.

## Architecture

```
PostToolUse (Write|Edit)            Stop
    |                                |
    v                                v
lint-changed.sh                  lint-changed.sh --gate
    |                                |
    v                                v
exit 1 (advisory)                exit 2 (blocks response)
"Fix NOW — you WILL               "BLOCKED — fix before
 be blocked at Stop"                you can respond"
```

The **CLI** (`lint-changed`) discovers all `lint-staged.config.*` files in the repo, groups uncommitted files by nearest config, matches globs, and runs the configured commands concurrently.

The **hook** (`hooks/lint-changed.sh`) wraps the CLI for Claude Code hook integration, handling stdin parsing, output formatting, and exit code semantics.

## How It Works

### CLI

1. Finds the git root
2. Collects all uncommitted files (staged + unstaged + untracked)
3. Discovers all `lint-staged.config.*` files (deepest directory first)
4. Groups files by nearest config (nested projects override parent)
5. For each config: matches files against glob patterns, resolves commands
6. Runs pattern groups concurrently (commands within a pattern chained with `&&`)

Accepts explicit file paths as arguments (used by PostToolUse to lint only the file just written/edited) or defaults to all uncommitted files.

### Hook

Two modes controlled by the `--gate` flag:

| Mode | Flag | Trigger | On failure | Message tone |
|------|------|---------|------------|--------------|
| Advisory | (none) | PostToolUse | exit 1 (non-blocking) | Warning: you WILL be blocked at Stop |
| Gate | `--gate` | Stop | exit 2 (blocks Claude) | BLOCKED: fix before responding |

This follows the same progressive escalation pattern as commit-monitor (nudge → block) and context-management (warn → block).

### Bailout

When `--gate` mode detects lint failures, it checks for a bailout signal before blocking:

1. **`CLAUDE_LINT_BAILOUT=1`** env var — checked first
2. **`~/.claude/.lint-bailout`** file — checked second
3. **Neither present** — exit 2 (blocks Claude, escalates to human approval)

If either bailout is active, the gate downgrades to advisory (exit 1).

```bash
# Quick bailout (current shell / session)
export CLAUDE_LINT_BAILOUT=1

# Persistent bailout (all sessions)
touch ~/.claude/.lint-bailout

# Re-enable gate
unset CLAUDE_LINT_BAILOUT
rm ~/.claude/.lint-bailout
```

## Installation

### CLI

```bash
cd packages/lint-changed
pnpm install
pnpm link --global   # makes `lint-changed` available globally
```

Requires Node >= 22.

### Hook

```bash
pnpm install-hook
# or manually:
ln -s "$(pwd)/hooks/lint-changed.sh" ~/.claude/hooks/lint-changed.sh
```

### Settings.json

Add hook registrations to `~/.claude/settings.json`. See `claude-settings.example.json` for the entries needed:

- **PostToolUse** (`Write|Edit`): `lint-changed.sh` — advisory, async
- **Stop**: `lint-changed.sh --gate` — blocking gate

## Package Structure

```
packages/lint-changed/
  bin/
    lint-changed.mjs           # Entry point (tsx wrapper)
  src/
    cli.ts                     # Core logic: discovery, matching, execution
    cli.test.ts                # Tests
  hooks/
    lint-changed.sh            # Claude Code hook wrapper
    install.sh                 # Symlink installer
  claude-settings.example.json # Example hook registrations
  README.md
```

### Installed symlinks

| Canonical source | Symlink target |
|---|---|
| `hooks/lint-changed.sh` | `~/.claude/hooks/lint-changed.sh` |

## How lint-staged Configs Are Resolved

The CLI mirrors lint-staged internals:

- **Config discovery**: walks the repo for `lint-staged.config.{ts,js,mjs,cjs}` files, sorted deepest-first
- **File grouping**: each file is claimed by the nearest (deepest) config; root config catches the rest
- **Glob matching**: uses micromatch with the same options as lint-staged (`dot: true`, `matchBase` when no `/` in pattern)
- **Command resolution**: string commands get files appended (shell-quoted); function commands receive the file list and return commands
- **Execution**: pattern groups run concurrently via `concurrently`; commands within a pattern chain with `&&`

## Interaction with Other Hooks

This package works alongside commit-monitor and context-management. All three can run simultaneously — they use separate cache files and enforce different concerns:

| Package | Concern | PostToolUse | PreToolUse / Stop |
|---------|---------|-------------|-------------------|
| lint-changed | Code quality | Advisory lint (exit 1) | Stop gate (exit 2) |
| commit-monitor | Commit frequency | Risk score nudge | PreToolUse block at red |
| context-management | Context window | Usage warning | PreToolUse block at 60%+ |
