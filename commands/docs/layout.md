---
description: Discover doc layout for the current repo and return all path keys
argument-hint: (no arguments)
---

# /docs/layout

Discover the documentation layout for the current repo and return all path keys as `KEY=value` pairs.

## Output

Print **exactly** these 9 `KEY=value` lines and stop:

```
DOCS_ROOT=<path>
CANONICAL_ROOT=<path>
CANONICAL_DIRS=<space-separated subdirectory names>
REPORTS_DIR=<path>
LEARNINGS_FILE=<path>
LEARNINGS_DIRS=<space-separated paths>
ADR_DIR=<path>
WASTE_SNAKE=<path>
MEMORY_FILE=<path>
```

## Discovery Rules

1. **Read CLAUDE.md** from the repo root. Look for a `## Doc Layout` section containing a fenced code block with `DOCS_ROOT=<value>`.
2. **If found:** use the `DOCS_ROOT` value as the base. Any additional key overrides in the same code block take precedence over derived defaults.
3. **If not found** (no CLAUDE.md, no `## Doc Layout` section, or empty file): default to `DOCS_ROOT=docs`.

## Derivation Rules

Given `DOCS_ROOT`, derive all other keys unless explicitly overridden:

| Key | Default derivation | Notes |
|-----|-------------------|-------|
| `CANONICAL_ROOT` | `{DOCS_ROOT}/canonical` | Only if directory exists |
| `CANONICAL_DIRS` | Space-separated subdirectory names inside `CANONICAL_ROOT` | Only existing subdirs |
| `REPORTS_DIR` | `{DOCS_ROOT}/reports` | Only if directory exists |
| `LEARNINGS_FILE` | `{DOCS_ROOT}/AGENTS.md` | Only if file exists |
| `LEARNINGS_DIRS` | `{CANONICAL_ROOT}/charters {CANONICAL_ROOT}/plans` | Only existing directories |
| `ADR_DIR` | `{CANONICAL_ROOT}/adrs` | Only if directory exists |
| `WASTE_SNAKE` | `{CANONICAL_ROOT}/waste-snake.md` | Only if file exists |
| `MEMORY_FILE` | `~/.claude/projects/<encoded-repo-root>/memory/MEMORY.md` | Absolute path; only if file exists |

## Path Existence

- Each key's value is set **only if** the resolved path exists on disk.
- If the path does not exist, set the value to empty string (e.g., `REPORTS_DIR=`).
- **Exception:** `DOCS_ROOT` is always set (it comes from CLAUDE.md or defaults to `docs`), even if the directory doesn't exist.
- When a path does not exist, append a comment line: `# WARNING: <KEY> path does not exist: <path>`

## MEMORY_FILE Computation

1. Get the repo root absolute path (e.g., `/Users/me/projects/my-repo`).
2. Encode by replacing the leading `/` with `-` and all subsequent `/` with `-` (e.g., `-Users-me-projects-my-repo`).
3. Construct: `~/.claude/projects/<encoded-path>/memory/MEMORY.md`.
4. Resolve `~` to the actual home directory.
5. If the file exists, output the full absolute path. Otherwise, output empty string.

## Format Rules

1. Paths are **relative to repo root** (no leading `/`, no absolute paths).
2. **Exception:** `MEMORY_FILE` is an **absolute path** (lives outside the repo).
3. Output **only** the 9 KEY=value lines plus any warning comments. No markdown formatting, no extra commentary.
4. One key per line. Keys appear in the order listed above.
