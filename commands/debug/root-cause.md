---
description: Systematic root cause analysis using Toyota 5 Whys methodology
argument-hint: [problem-statement]
---

**Problem Statement**:
$ARGUMENTS

Use the `debugger` subagent to perform root cause analysis on the reported problem.

## Process

1. **Load skill**: Load the `debugging` skill (`skills/engineering-team/debugging/SKILL.md`)
2. **Apply technique**: Use the **five-whys-methodology** reference (`skills/engineering-team/debugging/references/five-whys-methodology.md`) to drill through causal layers
3. **Classify evidence**: Use the evidence-classification reference to distinguish symptoms from causes
4. **Identify root cause**: Trace backward through the causal chain until the deepest actionable cause is found
5. **Report**: Present the full Why chain, root cause, and recommended fix

## Output

Structured report with:
- Problem statement (restated)
- Why chain (up to 5 levels)
- Root cause identification
- Recommended corrective action
- Preventive action (how to avoid recurrence)

**IMPORTANT**: **Do not** implement the fix automatically. Report findings and wait for user direction.
**IMPORTANT**: Sacrifice grammar for the sake of concision when writing outputs.
