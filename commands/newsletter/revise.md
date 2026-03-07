---
description: Dispatch editorial-writer to revise specific sections based on review feedback
argument-hint: <newsletter-path> --feedback <feedback-path-or-text> [--section "## Section Name"] [--source <source-path>] [--voice-profile <profile-path>]
---

# Purpose

Revise specific sections of a newsletter edition based on review feedback. Dispatches the `editorial-writer` agent with the feedback, source material, and voice profile so it can produce an improved version. Enables the review-revise loop: run a review command, get feedback, dispatch revisions, re-review.

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `newsletter` | Yes | — | Path to the newsletter edition to revise |
| `feedback` | Yes | — | Path to a review report, or inline feedback text describing what to fix |
| `section` | No | all sections with findings | Section heading(s) to revise (e.g., `"## FBI Arrests"`). If omitted, revises all sections that have findings in the feedback. Can be specified multiple times. |
| `source` | No | — | Path to the original source material (transcript, script). Helps the writer maintain fidelity during revision. |
| `voice-profile` | No | — | Path to a `.voice-profile.md` file. Helps the writer maintain voice during revision. |
| `template` | No | — | Path to the edition template. Helps the writer maintain format during revision. |

## Workflow

1. Read the newsletter edition
2. Read the feedback (file or inline text)
3. If `--section` provided, scope revisions to those sections only. Otherwise, parse the feedback to identify which sections need revision.
4. For each section needing revision:
   - Extract the section from the newsletter
   - Extract relevant feedback for that section
   - Dispatch `editorial-writer` with:
     - The section content
     - The specific feedback to address
     - The source material (if provided) for fidelity reference
     - The voice profile (if provided) for voice matching
     - The template (if provided) for format matching
5. Replace each revised section in the newsletter
6. Output the revised newsletter with a summary of changes made

## Revision Dispatch

Each section revision is dispatched to `editorial-writer` with a focused brief:

```
Revise this section based on the following feedback.

SECTION:
[extracted section content]

FEEDBACK:
[relevant feedback for this section]

SOURCE (for fidelity reference):
[relevant source material, if provided]

VOICE PROFILE:
[voice profile, if provided]

TEMPLATE FORMAT:
[template section format, if provided]

Produce a revised version that addresses the feedback while maintaining
fidelity to the source, voice consistency, and template format.
```

Multiple sections can be revised in parallel when they are independent.

## Examples

```bash
# Revise based on a review report (auto-detect sections from findings)
/newsletter/revise editions/2026-03-05.md --feedback reports/editorial-review-2026-03-05.md

# Revise specific sections with inline feedback
/newsletter/revise editions/2026-03-05.md --section "## FBI Arrests" --feedback "tone is too editorializing, rewrite neutral"

# Revise with full context
/newsletter/revise editions/2026-03-05.md \
  --feedback reports/editorial-review-2026-03-05.md \
  --source scripts/show-2026-03-05.md \
  --voice-profile voice-profiles/daily-dip.voice-profile.md \
  --template templates/daily-dip.md

# Revise multiple specific sections
/newsletter/revise editions/2026-03-05.md \
  --section "## FBI Arrests" \
  --section "## Cuba Incident" \
  --feedback reports/editorial-review-2026-03-05.md \
  --source scripts/show-2026-03-05.md
```

## The Review-Revise Loop

These commands compose into a feedback loop:

```
/newsletter/generate → edition.md
  ↓
/review/editorial-review edition.md source.md → review-report.md
  ↓
/newsletter/revise edition.md --feedback review-report.md → revised-edition.md
  ↓
/review/editorial-review revised-edition.md source.md → re-review.md
  ↓
(repeat until PASS)
```

Or target a single perspective:

```
/content/voice-check edition.md --voice-profile voice.md --section "## FBI Arrests"
  ↓
/newsletter/revise edition.md --section "## FBI Arrests" --feedback "voice score 62, too formal" --voice-profile voice.md
  ↓
/content/voice-check edition.md --voice-profile voice.md --section "## FBI Arrests"
```

## References

- Agent: [editorial-writer](../../agents/editorial-writer.md)
- Review commands: `/review/editorial-review`, `/content/bias-check`, `/content/voice-check`, `/content/clarity-check`, `/content/accuracy-check`, `/content/fact-check`
