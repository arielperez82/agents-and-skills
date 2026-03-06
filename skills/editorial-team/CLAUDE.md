# Editorial Skills - Claude Code Guidance

This guide covers the 6 editorial skills for transforming raw scripts into polished newsletter editions.

## Editorial Skills Overview

**Available Skills:**
1. **script-to-article/** - Transform teleprompter scripts, transcripts, and outlines into polished articles (3-5x compression)
2. **story-selection/** - Evaluate and rank candidate stories using 5 weighted criteria
3. **newsletter-assembly/** - Assemble stories, polls, and notes into a complete newsletter edition
4. **editorial-voice-matching/** - Match output to a publication's voice profile using reference pairs and distilled principles
5. **bias-screening/** - Detect editorial bias across 6 categories with severity classification
6. **reader-clarity/** - Evaluate readability targeting Flesch-Kincaid grade 8-10

**Total Reference Files:** 6 reference documents across skills

## Pipeline Overview

The editorial skills form a sequential pipeline, typically orchestrated by `newsletter-producer`:

```
Raw Script/Transcript
    |
    v
script-to-article    (segmentation + drafting)
    |
    v
story-selection      (ranking + picking)
    |
    v
editorial-voice-matching  (voice alignment)
    |
    v
bias-screening       (neutrality check)
    |
    v
reader-clarity       (readability check)
    |
    v
newsletter-assembly  (edition assembly)
```

## Skill Details

### 1. Script to Article (`script-to-article/`)

**Purpose:** Transform raw source material into publication-ready articles.

**Key capabilities:**
- Multi-story segmentation from single scripts
- Verbal tic and filler removal
- Reading flow optimization
- Factual preservation with 3-5x compression
- Source attribution tracking

**References:** `references/transformation-checklist.md` - step-by-step quality checklist

### 2. Story Selection (`story-selection/`)

**Purpose:** Evaluate and rank candidate stories for newsletter inclusion.

**Key capabilities:**
- 5 weighted scoring criteria (audience relevance, newsworthiness, topic diversity, engagement potential, narrative strength)
- Explicit picks mode (editor-specified) and auto-select mode
- Topic diversity enforcement across edition

### 3. Newsletter Assembly (`newsletter-assembly/`)

**Purpose:** Combine selected stories, polls, and metadata into a finished edition.

**Key capabilities:**
- Edition template with standard sections
- Subject line methodology
- Story ordering logic (lead, follow, closer)
- Format-agnostic markdown output

**References:** `references/newsletter-edition-template.md` - edition structure template

### 4. Editorial Voice Matching (`editorial-voice-matching/`)

**Purpose:** Ensure articles match a target publication's editorial voice.

**Key capabilities:**
- Voice extraction from existing content
- Reference pair approach (before/after examples)
- Distilled principles (extracted voice rules)
- 6-dimension voice profile (rhythm, register, humor, openings/closings, attribution, density)

**References:**
- `references/voice-profile-template.md` - standard voice profile format (output of `/voice/extract`)
- `references/voice-analysis-template.md` - per-edition analysis template
- `references/style-guide-skeleton.md` - publication style guide skeleton

### 5. Bias Screening (`bias-screening/`)

**Purpose:** Detect and flag editorial bias before publication.

**Key capabilities:**
- 6 bias categories (loaded language, partisan framing, false balance, editorializing-as-reporting, selection bias, attribution asymmetry)
- Severity classification per finding
- Neutral rewrite suggestions

**References:** `references/loaded-terms-dictionary.md` - common loaded terms with neutral alternatives

### 6. Reader Clarity (`reader-clarity/`)

**Purpose:** Ensure content is accessible to the target audience.

**Key capabilities:**
- Flesch-Kincaid grade 8-10 target
- Context budget concept (jargon allowance per article)
- Jargon detection and plain-language rewrites
- Sentence complexity analysis

**References:** `references/jargon-checklist.md` - common jargon with plain alternatives

## Related Agents

| Agent | Role |
|-------|------|
| **editorial-writer** | Executes script-to-article transformation |
| **newsletter-producer** | Orchestrates full pipeline |
| **fact-checker** | Bias screening assessment |
| **poll-writer** | Poll creation for editions |
| **voice-consistency-reviewer** | Voice matching review gate |
| **reader-clarity-reviewer** | Readability review gate |
| **editorial-accuracy-reviewer** | Source fidelity review gate |

## Related Commands

- `/voice/extract` - Extract a publication's voice profile from reference editions (one-time setup per publication)
- `/newsletter/generate` - Generate a complete newsletter edition from a script (accepts `--voice-profile`)
- `/content/fact-check` - Screen content for editorial bias and loaded language
- `/review/editorial-review` - Run parallel editorial review agents on a newsletter edition (accepts `--voice-profile`)

## Quality Standards

**All editorial skills must:**
- Preserve factual accuracy from source material
- Maintain neutral reporting tone (no editorializing)
- Track source attribution for every claim
- Produce markdown output compatible with newsletter-assembly
- Support the review gate pattern (assess-only agents produce reports, never edit source)

---

**Last Updated:** 2026-03-06
**Skills Deployed:** 6/6 editorial skills production-ready
**Voice Profile:** Standard `.voice-profile.md` artifact — extract once per publication via `/voice/extract`, pass to pipeline via `--voice-profile`
