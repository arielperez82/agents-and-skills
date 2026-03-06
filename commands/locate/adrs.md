---
description: Return the ADR directory path
argument-hint: (no arguments)
---

# /locate/adrs

Return the path to the Architecture Decision Records directory.

## Output

Print **exactly** this `KEY=value` line and stop:

```
ADR_DIR=<path>
```

## Rules

1. Check if `.docs/canonical/adrs/` exists at the repo root.
   - If it exists: `ADR_DIR=.docs/canonical/adrs`
   - If it does not exist: `ADR_DIR=`
2. Path is **relative to repo root**.
3. Do **not** read any files, explore beyond the existence check, or produce any side effects.
4. Output **only** the single KEY=value line. No commentary, no markdown formatting.
