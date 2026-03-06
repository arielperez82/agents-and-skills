---
description: Return the cross-session memory file path
argument-hint: (no arguments)
---

# /locate/memory

Return the full resolved path to the Claude Code cross-session memory file for this repo.

## Output

Print **exactly** this `KEY=value` line and stop:

```
MEMORY_FILE=<path>
```

## Rules

1. Compute the memory file path:
   - Get the repo root absolute path (e.g., `/Users/me/projects/my-repo`)
   - Encode it by replacing the leading `/` with `-` and all subsequent `/` with `-` (e.g., `-Users-me-projects-my-repo`)
   - Construct the path: `~/.claude/projects/<encoded-path>/memory/MEMORY.md`
   - Resolve `~` to the actual home directory for the final output
2. Check if the computed file exists.
   - If it exists: `MEMORY_FILE=<full resolved path>`
   - If it does not exist: `MEMORY_FILE=`
3. This is the **one exception** to the repo-relative rule: MEMORY_FILE is an **absolute path** because it lives outside the repo.
4. Do **not** read any files, explore beyond the existence check, or produce any side effects.
5. Output **only** the single KEY=value line. No commentary, no markdown formatting.
