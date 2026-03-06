# Voice Commands

Voice commands extract and apply editorial voice profiles — reusable style guides that capture a publication's tone, rhythm, and conventions.

## Quick Start

### 1. Generate a voice profile

Provide reference editions (10+ recommended) and extract the publication's voice:

```bash
# From a directory of editions
/voice/extract editions/daily-dip/ --name "The Daily Dip"

# From specific files
/voice/extract editions/ed-01.md,editions/ed-02.md,editions/ed-03.md --name "Morning Brief"

# Custom output path
/voice/extract editions/daily-dip/ --name "The Daily Dip" --output voice-profiles/daily-dip.voice-profile.md
```

This produces a `.voice-profile.md` file (default location: `voice-profiles/<name-slug>.voice-profile.md`). The file contains YAML frontmatter for machine consumption and a markdown body readable as a human style guide.

The profile captures 6 dimensions: sentence rhythm, vocabulary register, humor calibration, opening/closing patterns, attribution style, and information density.

### 2. Use the voice profile

Pass the profile to any command that supports `--voice-profile`:

```bash
# Generate a newsletter edition matching the voice
/newsletter/generate scripts/show-2026-03-05.md --voice-profile voice-profiles/daily-dip.voice-profile.md

# Run editorial review with voice consistency checking
/review/editorial-review editions/2026-03-05.md scripts/show-2026-03-05.md --voice-profile voice-profiles/daily-dip.voice-profile.md
```

Without a voice profile, `voice-consistency-reviewer` still runs but checks general editorial consistency rather than alignment to a specific publication voice.

### 3. Update a voice profile

Re-run `/voice/extract` with newer editions to refresh the profile. The output file is overwritten with the updated analysis.

## Convention

Store voice profiles in a `voice-profiles/` directory at the project root. Use the naming pattern `<publication-slug>.voice-profile.md`.

## Commands

| Command | Description |
|---------|-------------|
| [`/voice/extract`](extract.md) | Extract a voice profile from reference editions |

## Related

- Skill: [editorial-voice-matching](../../skills/editorial-team/editorial-voice-matching/SKILL.md) — the underlying skill for voice analysis
- Agent: [voice-consistency-reviewer](../../agents/voice-consistency-reviewer.md) — review agent that consumes voice profiles
- Command: [`/review/editorial-review`](../review/editorial-review.md) — editorial review gate (uses voice profile for consistency checking)
- Command: [`/newsletter/generate`](../newsletter/generate.md) — newsletter generation (uses voice profile for tone matching)
