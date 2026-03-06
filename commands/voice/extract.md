---
description: Extract a publication's voice profile from reference editions
argument-hint: <editions-dir|file1,file2,...> [--name "Publication Name"] [--output <path>] [--count 10]
---

# Purpose

Analyze a set of reference newsletter editions and produce a reusable voice profile. The profile captures the publication's editorial voice across 6 dimensions (sentence rhythm, vocabulary register, humor calibration, opening/closing patterns, attribution style, information density) as distilled rules plus concrete reference pairs.

The output is a standard voice profile file that can be loaded by `/newsletter/generate`, `/review/editorial-review`, and any agent that uses the `editorial-voice-matching` skill.

## Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `editions` | Yes | — | Path to a directory of reference editions, or comma-separated file paths |
| `name` | No | inferred from content | Publication name for the profile header |
| `output` | No | `voice-profiles/<name-slug>.voice-profile.md` | Output path for the generated voice profile |
| `count` | No | 10 | Minimum number of editions to analyze (warns if fewer provided) |

## Workflow

1. **Gather editions** — Read all edition files from the provided path. If fewer than `count`, warn that the profile may be less reliable.

2. **Analyze each edition** — For each edition, apply the voice analysis template (`editorial-voice-matching/references/voice-analysis-template.md`) across the 6 dimensions. Record per-edition observations.

3. **Distill cross-edition patterns** — Identify patterns that appear consistently across editions (not one-off variations):
   - Sentence rhythm distribution (average length, variation pattern, fragment usage)
   - Vocabulary register (formality, jargon handling, colloquialisms)
   - Humor calibration (type, frequency, placement)
   - Opening/closing patterns (hook types, sign-off styles)
   - Attribution style (citing patterns, source handling)
   - Information density (facts per paragraph, explanation depth)

4. **Extract reference pairs** — For each dimension, select the most illustrative before/after pair from the analyzed editions.

5. **Generate Do/Don't rules** — Concrete, actionable rules per dimension (3-5 per dimension).

6. **Compile voice profile** — Write the profile using the standard voice profile template (`editorial-voice-matching/references/voice-profile-template.md`).

7. **Validate completeness** — Verify all 6 dimensions have rules and reference pairs. Flag any dimension with insufficient data.

## Output

A standard `.voice-profile.md` file with YAML frontmatter (for machine consumption) and markdown body (for human reading and agent consumption). See the voice profile template for the full structure.

The profile is designed to be:
- **Loadable** by any agent or command via `--voice-profile <path>`
- **Readable** by humans as a style guide
- **Updatable** by re-running extraction with newer editions

## Examples

```bash
# Extract from a directory of editions
/voice/extract editions/daily-dip/february-2026/ --name "The Daily Dip"

# Extract from specific files
/voice/extract editions/ed-01.md,editions/ed-02.md,editions/ed-03.md --name "Morning Brief"

# Custom output path
/voice/extract editions/daily-dip/ --name "The Daily Dip" --output voice-profiles/daily-dip.voice-profile.md

# Fewer editions (will warn)
/voice/extract editions/new-pub/ --count 5
```

## References

- Skill: [editorial-voice-matching](../../skills/editorial-team/editorial-voice-matching/SKILL.md)
- Agent: [voice-consistency-reviewer](../../agents/voice-consistency-reviewer.md)
- Template: [voice-profile-template](../../skills/editorial-team/editorial-voice-matching/references/voice-profile-template.md)
- Analysis template: [voice-analysis-template](../../skills/editorial-team/editorial-voice-matching/references/voice-analysis-template.md)
