---
description: Check content fidelity against source material — catch hallucinated facts, misattributions, and omissions
argument-hint: <content-path> --source <source-path> [--section "## Section Name"]
---

# Purpose

Compare editorial output against its source material (transcript, script, show notes) to catch hallucinated facts, misattributed quotes, invented context, material omissions, and numerical inaccuracies. Produces a 0-100 fidelity score.

This is distinct from fact-checking (`/content/fact-check`), which verifies claims against external sources. Accuracy-checking verifies that the output faithfully represents the *source material* it was derived from.

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `content` | Yes | — | Path to the editorial output to review |
| `source` | Yes | — | Path to the source material (transcript, script, show notes) |
| `section` | No | — | Section heading to extract and review (e.g., `"## FBI Arrests"`). Reviews only that section. Can be specified multiple times. |

## Workflow

1. Read the editorial output at the provided path
2. Read the source material
3. If `--section` provided, extract the specified section(s) from the output
4. Engage `editorial-accuracy-reviewer` agent to compare output against source:
   - Hallucinated facts (in output but not in source)
   - Misattributed quotes (attribution changed or invented)
   - Invented context (background added without source support)
   - Material omissions (important facts from source missing)
   - Numerical accuracy (numbers changed, rounded, approximated)
5. Output the fidelity report with per-finding source comparison

## Examples

```bash
# Check full newsletter against source
/content/accuracy-check editions/2026-03-05.md --source scripts/show-2026-03-05.md

# Check just one section
/content/accuracy-check editions/2026-03-05.md --source scripts/show-2026-03-05.md --section "## FBI Arrests"

# Check multiple sections
/content/accuracy-check editions/2026-03-05.md --source scripts/show-2026-03-05.md --section "## FBI Arrests" --section "## Cuba Incident"
```

## References

- Agent: [editorial-accuracy-reviewer](../../agents/editorial-accuracy-reviewer.md)
- Skill: [script-to-article](../../skills/editorial-team/script-to-article/SKILL.md)
- Related: `/content/fact-check` (verifies against external sources, not source material)
