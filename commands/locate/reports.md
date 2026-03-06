---
description: Return the reports directory path
argument-hint: (no arguments)
---

# /locate/reports

Return the path to the reports directory where craft status files and other time-stamped outputs live.

## Output

Print **exactly** this `KEY=value` line and stop:

```
REPORTS_DIR=<path>
```

## Rules

1. Check if `.docs/reports/` exists at the repo root.
   - If it exists: `REPORTS_DIR=.docs/reports`
   - If it does not exist: `REPORTS_DIR=`
2. Path is **relative to repo root**.
3. Do **not** read any files, explore beyond the existence check, or produce any side effects.
4. Output **only** the single KEY=value line. No commentary, no markdown formatting.
