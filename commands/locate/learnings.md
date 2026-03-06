---
description: Return the cross-cutting learnings file and per-charter/plan learnings directories
argument-hint: (no arguments)
---

# /locate/learnings

Return the path to the cross-cutting learnings file and the directories to scan for per-charter/plan `## Learnings` sections.

## Output

Print **exactly** these two `KEY=value` lines and stop:

```
LEARNINGS_FILE=<path>
LEARNINGS_DIRS=<space-separated paths>
```

## Rules

1. **LEARNINGS_FILE**: Check if `.docs/AGENTS.md` exists at the repo root.
   - If it exists: `LEARNINGS_FILE=.docs/AGENTS.md`
   - If it does not exist: `LEARNINGS_FILE=`
2. **LEARNINGS_DIRS**: Check if `.docs/canonical/charters/` and `.docs/canonical/plans/` exist.
   - Include only directories that exist, space-separated.
   - If neither exists: `LEARNINGS_DIRS=`
   - Example: `LEARNINGS_DIRS=.docs/canonical/charters .docs/canonical/plans`
3. Paths are **relative to repo root**.
4. Do **not** read any files, explore beyond the existence checks, or produce any side effects.
5. Output **only** the two KEY=value lines. No commentary, no markdown formatting.
