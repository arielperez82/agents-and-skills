---
description: Return the canonical docs root and subdirectory names
argument-hint: (no arguments)
---

# /locate/canonical

Return the canonical docs root path and the subdirectory names used for coordination artifacts.

## Output

Print **exactly** these two `KEY=value` lines and stop:

```
CANONICAL_ROOT=<path>
CANONICAL_DIRS=<space-separated subdirectory names>
```

## Rules

1. Check if `.docs/canonical/` exists at the repo root.
   - If it exists: `CANONICAL_ROOT=.docs/canonical` and `CANONICAL_DIRS=roadmaps charters backlogs plans`
   - If it does not exist: `CANONICAL_ROOT=` and `CANONICAL_DIRS=`
2. Paths are **relative to repo root** (no leading `/`, no absolute paths).
3. Do **not** read any files, explore the filesystem beyond the existence check, or produce any side effects.
4. Output **only** the two KEY=value lines. No commentary, no markdown formatting.
