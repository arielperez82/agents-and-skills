---
name: editorial-voice-matching
description: Match article output to a target publication's editorial voice using a
  two-layer approach — reference pairs (before/after examples) and distilled principles
  (extracted voice rules). Covers voice extraction, prompt patterns for voice-matched
  generation, and differentiates from brand_guidelines.md marketing voice.
license: MIT
metadata:
  author: Claude Skills Team
  compatibility:
    python-version: "3.8+"
    platforms:
      - macos
      - linux
      - windows
  contributors: []
  created: 2026-03-05
  dependencies:
    scripts: []
    references:
      - references/voice-analysis-template.md
      - references/style-guide-skeleton.md
      - references/voice-profile-template.md
    assets: []
  difficulty: advanced
  domain: editorial
  examples:
    - title: "Extract voice from reference editions"
      input: "Analyze these 10 past newsletter editions and extract the publication's editorial voice profile"
      output: "Voice profile with 10 reference pairs, distilled principles across 6 dimensions, and a style guide skeleton"
    - title: "Apply voice to new article"
      input: "Rewrite this article to match the voice profile extracted from the Daily Dip newsletter"
      output: "Article revised to match voice profile — sentence rhythm, vocabulary register, humor calibration, and information density aligned"
  featured: false
  frequency: "Per article during newsletter production"
  orchestrated-by: []
  related-agents:
    - editorial-writer
    - voice-consistency-reviewer
  related-commands:
    - voice/extract
  related-skills:
    - editorial-team/script-to-article
    - editorial-team/bias-screening
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: editorial-voice
  tags:
    - editorial
    - voice
    - tone
    - style
    - consistency
  tech-stack: []
  time-saved: "20-30 minutes per voice extraction; 5-10 minutes per article application"
  title: Editorial Voice Matching
  updated: 2026-03-05
  use-cases:
    - Extracting a publication's voice from existing editions
    - Applying a voice profile to new articles
    - Maintaining voice consistency across multiple writers
    - Building and maintaining publication style guides
  verified: true
  version: v1.0.0
---

# Editorial Voice Matching

Match article output to a target publication's editorial voice using reference pairs and distilled principles.

## Overview

Every publication has a voice — the combination of sentence rhythm, vocabulary choices, humor calibration, information density, and structural patterns that make it recognizably itself. This skill provides a two-layer approach to capturing and reproducing that voice: concrete reference pairs (showing the transformation) and distilled principles (the rules behind the transformation).

**Core Value:** Reproducible voice consistency across articles and writers, without requiring the original author.

**Differentiator from brand_guidelines.md:** The marketing-team's `brand_guidelines.md` defines brand personality archetypes (Expert, Friend, Innovator) for marketing content. This skill captures the specific editorial voice of a publication — not what personality to project, but how this particular publication writes: its sentence length distribution, its approach to humor, its vocabulary register, its information density per paragraph.

## Core Capabilities

- **Two-Layer Voice Capture** — Reference pairs (concrete before/after) + distilled principles (abstract rules)
- **Voice Extraction Process** — Analyze 10+ reference editions to build a voice profile
- **6 Voice Dimensions** — Sentence rhythm, vocabulary register, humor calibration, opening/closing patterns, attribution style, information density
- **Prompt Patterns** — Structured prompts for voice-matched generation
- **Voice Comparison** — Compare two texts for voice consistency

## Quick Start

1. Gather 10+ reference editions of the target publication
2. Use the voice analysis template at `references/voice-analysis-template.md`
3. Extract reference pairs and distilled principles
4. Apply the voice profile when drafting new articles

## Key Workflows

### 1. Voice Extraction (One-Time Setup)

1. **Gather references** — Collect 10+ editions of the target publication
2. **Analyze each edition** across 6 dimensions:
   - **Sentence rhythm** — Average sentence length, variation pattern, use of fragments
   - **Vocabulary register** — Formal/informal ratio, jargon handling, colloquialism frequency
   - **Humor calibration** — Type (dry, sarcastic, wordplay), frequency, placement
   - **Opening/closing patterns** — How articles begin and end (hook types, sign-off style)
   - **Attribution style** — How sources are cited ("according to," "X says," "per X")
   - **Information density** — Facts per paragraph, detail level, explanation depth
3. **Extract reference pairs** — For each dimension, capture a before (generic) and after (publication voice) example
4. **Distill principles** — From the reference pairs, extract 3-5 rules per dimension
5. **Compile voice profile** — Use the style guide skeleton at `references/style-guide-skeleton.md`

### 2. Voice Application (Per Article)

1. **Load voice profile** — Read the distilled principles and reference pairs
2. **Draft article** — Write content following the factual requirements (script-to-article)
3. **Apply voice layer** — Revise the draft against each dimension:
   - Adjust sentence rhythm to match distribution
   - Align vocabulary register
   - Calibrate humor (add, remove, or adjust type)
   - Match opening/closing patterns
   - Align attribution style
   - Match information density
4. **Verify** — Compare a sample paragraph against reference pairs for voice similarity

### 3. Voice Consistency Check (Adversarial)

1. **Read the article** and the voice profile
2. **Score each dimension** (0-100) against the voice profile
3. **Flag deviations** — Passages that break voice consistency
4. **Suggest corrections** — Specific rewrites to restore voice alignment

## Best Practices

- Extract voice from the publication's best editions, not average ones
- Update reference pairs quarterly as the publication's voice evolves
- Voice matching is a post-transformation step — get the facts right first, then apply voice
- When voice matching conflicts with clarity, clarity wins
- Don't over-match — slight natural variation keeps writing from sounding robotic

## Voice Profile (Standard Artifact)

The voice profile (`.voice-profile.md`) is the standard output of the extraction process and the standard input for all voice-related operations. It contains YAML frontmatter (for machine parsing) and a markdown body (for human reading and agent consumption).

**Generate:** `/voice/extract <editions-dir> --name "Publication Name"`
**Consume:** Pass via `--voice-profile <path>` to `/newsletter/generate`, `/review/editorial-review`, or any agent using this skill.

The profile is publication-scoped and reusable — extract once, use for every edition. Re-extract quarterly or when the publication's voice evolves.

See `references/voice-profile-template.md` for the full template structure.

## Reference Guides

- **[voice-profile-template.md](references/voice-profile-template.md)** — Standard voice profile format (output of `/voice/extract`, input to all voice consumers)
- **[voice-analysis-template.md](references/voice-analysis-template.md)** — Template for analyzing a single edition across 6 dimensions
- **[style-guide-skeleton.md](references/style-guide-skeleton.md)** — Template for compiling a complete voice profile (superseded by voice-profile-template for new work)

## Integration

Used by `editorial-writer` as a post-transformation voice layer. Consumed adversarially by `voice-consistency-reviewer` for voice compliance checking.
