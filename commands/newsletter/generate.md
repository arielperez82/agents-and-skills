---
description: Generate a complete newsletter edition from a script
argument-hint: <script-path> [--stories "story1, story2"] [--count 3] [--voice-ref <path>]
---

# Purpose

Produce a complete newsletter edition from a raw teleprompter script or transcript by orchestrating the full editorial pipeline.

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `script` | Yes | — | Path to the source script (teleprompter, transcript, or show outline) |
| `stories` | No | auto-select | Comma-separated story topics to include (explicit mode). If omitted, auto-selects the best N stories. |
| `count` | No | 3 | Number of stories to include in the edition |
| `voice-ref` | No | — | Path to a reference edition for voice matching |

## Workflow

1. Read the source script at the provided path
2. Engage `newsletter-producer` agent to orchestrate the 7-step pipeline:
   - Segment script into stories
   - Select stories (auto or explicit based on `stories` parameter)
   - Draft each selected story
   - Screen drafts for bias
   - Generate poll
   - Assemble edition
   - Run editorial review gate
3. Output the complete newsletter edition in markdown

## Examples

```bash
# Auto-select best 3 stories
/newsletter/generate scripts/show-2026-03-05.md

# Explicit story selection
/newsletter/generate scripts/show-2026-03-05.md --stories "Fed rate decision, tech earnings, oil prices"

# With voice reference
/newsletter/generate scripts/show-2026-03-05.md --voice-ref editions/2026-03-01.md

# Custom story count
/newsletter/generate scripts/show-2026-03-05.md --count 4
```

## References

- Agent: [newsletter-producer](../../agents/newsletter-producer.md)
- Skills: [story-selection](../../skills/editorial-team/story-selection/SKILL.md), [newsletter-assembly](../../skills/editorial-team/newsletter-assembly/SKILL.md)
