---
description: Validate command definitions (dispatch targets, argument-hint, naming, deduplication)
argument-hint: [command-path or --all]
---

# Command Validate

Run the command validator script on the `commands/` directory. Reports pass/fail per command: dispatch target exists, namespace deduplication, argument-hint presence, naming consistency.

**Input:** $ARGUMENTS — path to a command subdirectory (e.g. `commands/agent`) or `--all` to validate all commands under `commands/`.

## Behavior

1. **Resolve path:** If `--all` or omitted, use repo root `commands/`. Else use the given path as the commands directory to scan.
2. **Run validator:**
   ```bash
   python3 skills/agent-development-team/creating-agents/scripts/validate_commands.py [path]
   ```
   From repo root. For `--all`, omit path so the script uses `commands/`.
3. **Report:** Present the script output (per-command PASS/FAIL and summary table).

## Checks

- **Dispatch target exists:** Referenced skills (paths under `skills/`) and agents (`agents/<name>.md`) resolve to existing files.
- **Namespace deduplication:** Flags commands that share the same or near-identical description.
- **Argument-hint presence:** Frontmatter includes `argument-hint`.
- **Naming consistency:** Command file names use lowercase and hyphens.

## Integration

- **Script:** `skills/agent-development-team/creating-agents/scripts/validate_commands.py`
