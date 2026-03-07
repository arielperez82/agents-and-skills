---
description: Screen content for editorial bias, loaded language, and partisan framing
argument-hint: <content-path> [--section "## Section Name"] [--mode full|quick]
---

# Purpose

Run editorial bias screening on any content — a full file, a specific section, or inline text. Checks for loaded language, partisan framing, editorializing, and attribution asymmetry. Assess-only: flags issues and provides neutral rewrites.

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `content` | Yes | — | Path to the content file to screen, or inline text |
| `section` | No | — | Section heading to extract and review (e.g., `"## FBI Arrests"`). Reviews only that section instead of the full file. Can be specified multiple times. |
| `mode` | No | full | `full` = all 6 bias categories; `quick` = loaded language + editorializing only |

## Workflow

1. Read the content at the provided path
2. If `--section` provided, extract the specified section(s) from the file
3. Engage `fact-checker` agent to screen for editorial bias
4. In `full` mode: check all 6 categories (loaded language, partisan framing, false balance, editorializing-as-reporting, selection bias, attribution asymmetry)
5. In `quick` mode: check loaded language and editorializing only (faster, lighter)
6. Output the bias screening report with findings, severity, and neutral rewrites

## Examples

```bash
# Full bias screening
/content/bias-check articles/fed-rate-decision.md

# Quick check (loaded language + editorializing only)
/content/bias-check articles/fed-rate-decision.md --mode quick

# Screen just one section
/content/bias-check editions/2026-03-05.md --section "## FBI Arrests"

# Screen multiple sections
/content/bias-check editions/2026-03-05.md --section "## FBI Arrests" --section "## Cuba Incident"

# Screen inline text
/content/bias-check "The reckless spending spree drew criticism from experts who say the policy is clearly unsustainable."
```

## References

- Agent: [fact-checker](../../agents/fact-checker.md)
- Skill: [bias-screening](../../skills/editorial-team/bias-screening/SKILL.md)
