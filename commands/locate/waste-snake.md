---
description: Return the waste snake file path
argument-hint: (no arguments)
---

# /locate/waste-snake

Return the path to the waste snake ledger file.

## Output

Print **exactly** this `KEY=value` line and stop:

```
WASTE_SNAKE=<path>
```

## Rules

1. Check if `.docs/canonical/waste-snake.md` exists at the repo root.
   - If it exists: `WASTE_SNAKE=.docs/canonical/waste-snake.md`
   - If it does not exist: `WASTE_SNAKE=`
2. Path is **relative to repo root**.
3. Do **not** read any files, explore beyond the existence check, or produce any side effects.
4. Output **only** the single KEY=value line. No commentary, no markdown formatting.
