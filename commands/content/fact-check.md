---
description: Screen content for editorial bias and loaded language
argument-hint: <content-path> [--mode full|quick]
---

# Purpose

Run editorial bias screening on any content. Reusable for newsletters, articles, blog posts, or any text that should be neutral.

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `content` | Yes | — | Path to the content file to screen |
| `mode` | No | full | `full` = all 6 bias categories; `quick` = loaded language + editorializing only |

## Workflow

1. Read the content at the provided path
2. Engage `fact-checker` agent to screen for editorial bias
3. In `full` mode: check all 6 categories (loaded language, partisan framing, false balance, editorializing-as-reporting, selection bias, attribution asymmetry)
4. In `quick` mode: check loaded language and editorializing only (faster, lighter)
5. Output the bias screening report with findings, severity, and neutral rewrites

## Examples

```bash
# Full bias screening
/content/fact-check articles/fed-rate-decision.md

# Quick check (loaded language + editorializing only)
/content/fact-check articles/fed-rate-decision.md --mode quick

# Screen a newsletter edition
/content/fact-check editions/2026-03-05.md
```

## References

- Agent: [fact-checker](../../agents/fact-checker.md)
- Skill: [bias-screening](../../skills/editorial-team/bias-screening/SKILL.md)
