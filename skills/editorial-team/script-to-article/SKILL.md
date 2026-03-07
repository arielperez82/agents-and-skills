---
name: script-to-article
description: Transform raw teleprompter scripts, video transcripts, and show outlines
  into polished editorial articles. Covers verbal tic removal, reading flow optimization,
  factual preservation, content condensing with 3-5x compression, and multi-story
  segmentation for newsletter pipelines.
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
      - references/transformation-checklist.md
      - references/inverted-pyramid-structure.md
    assets: []
  difficulty: advanced
  domain: editorial
  examples:
    - title: "Teleprompter script to newsletter article"
      input: "Transform this 2,500-word teleprompter script into a 600-word newsletter article preserving all factual claims and attribution"
      output: "Polished 600-word article with verbal tics removed, reading flow optimized, facts preserved with attribution, and natural paragraph structure"
    - title: "Multi-topic transcript to segmented stories"
      input: "This 45-minute show transcript covers 4 topics. Segment into individual stories for newsletter selection"
      output: "4 standalone story drafts, each with headline, summary, and body — ready for story-selection evaluation"
  featured: false
  frequency: "2-5 times per week per newsletter"
  orchestrated-by:
    - newsletter-producer
  related-agents:
    - editorial-writer
    - newsletter-producer
    - editorial-accuracy-reviewer
  related-commands: []
  related-skills:
    - editorial-team/editorial-voice-matching
    - editorial-team/bias-screening
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: content-transformation
  tags:
    - editorial
    - transcript
    - teleprompter
    - newsletter
    - transformation
    - condensing
  tech-stack: []
  time-saved: "30-60 minutes per script transformation"
  title: Script-to-Article Transformation
  updated: 2026-03-07
  use-cases:
    - Transforming teleprompter scripts into newsletter articles
    - Converting video transcripts into written stories
    - Segmenting multi-topic show scripts into individual stories
    - Condensing long-form spoken content into concise written pieces
    - Preserving factual accuracy during format transformation
  verified: true
  version: v1.0.0
---

# Script-to-Article Transformation

Transform raw teleprompter scripts, video transcripts, and show outlines into polished editorial articles while preserving factual integrity.

## Overview

Spoken content follows different structural rules than written content. Teleprompter scripts use short sentences for delivery cadence, repeat key phrases for emphasis, and include verbal scaffolding ("now, let's talk about...") that clutters written form. This skill provides a systematic transformation process that removes spoken artifacts, restructures for reading flow, and condenses content at 3-5x compression ratios — all while preserving every factual claim and attribution.

**Core Value:** Reliable, repeatable transformation that never invents facts or loses attribution — the two failure modes that destroy editorial credibility.

## Core Capabilities

- **Verbal Tic Removal** — Strip filler words, false starts, repeated phrases, and delivery-cadence artifacts without altering meaning
- **Reading Flow Optimization** — Restructure from spoken delivery order to written reading order (inverted pyramid, thematic grouping, logical progression). See [inverted-pyramid-structure.md](references/inverted-pyramid-structure.md) for the three-layer structure, lede crafting, and AP style reference
- **Factual Preservation** — Every claim, number, quote, and attribution in the output must trace to the source script. Nothing invented, nothing embellished
- **Content Condensing** — Achieve 3-5x compression ratio while retaining all material facts. Target: 500-800 words from a 2,000-3,500 word script
- **Multi-Story Segmentation** — Split multi-topic scripts into standalone story units, each self-contained with its own headline, summary, and body

## Quick Start

1. Read the source script (teleprompter text, transcript, or show outline)
2. Follow the transformation checklist at `references/transformation-checklist.md`
3. Verify factual preservation: every claim in output maps to source
4. Check compression ratio: output word count / source word count should be 0.2-0.33 (3-5x compression)

## Key Workflows

### 1. Single-Story Transformation

**Time:** 15-30 minutes per story

1. **Read source script** — Identify the core topic, key facts, quotes, and data points
2. **Strip verbal artifacts** — Remove filler words, false starts, repeated emphasis phrases, delivery cues ("as you can see," "now here's the thing")
3. **Extract factual skeleton** — List every claim, number, and attribution as bullet points
4. **Restructure for reading** — Reorder from spoken delivery to written flow (lead with the news, support with context, close with implications)
5. **Draft article** — Write clean prose hitting 3-5x compression target
6. **Verify fidelity** — Cross-check every fact in the output against the factual skeleton. Flag any gaps

**Output:** Polished article with headline and body, plus a fidelity checklist

### 2. Multi-Story Segmentation

**Time:** 30-45 minutes for a full show

1. **Read full script** — Map all topic boundaries and transitions
2. **Identify story boundaries** — Mark where each discrete topic begins and ends (transitions, topic shifts, segment breaks)
3. **Segment into units** — Extract each topic as a standalone block
4. **Transform each segment** — Apply Workflow 1 to each story unit independently
5. **Verify self-containment** — Each story must be readable without context from other stories. Add necessary context that was implicit in the show flow

**Output:** Array of story drafts, each with headline, one-line summary, and body

### 3. Show Notes Generation

**Time:** 10-15 minutes

1. **Read source script** — Identify all topics covered, key takeaways, and references
2. **Extract topic list** — One-line summary per topic covered
3. **Pull key quotes** — 2-3 most quotable moments with attribution
4. **List references** — Any sources, reports, people, or organizations mentioned
5. **Format show notes** — Structured show notes with timestamps (if available), topics, quotes, and references

**Output:** Structured show notes suitable for podcast feeds or newsletter footers

## Best Practices

### Factual Preservation

- Never add context the source didn't provide — if the script says "the number went up," don't write "the number increased by 15%" unless 15% appears in the source
- Preserve attribution chains — if the script says "according to the Times report," keep "according to the Times report" in the output
- When condensing, cut commentary before cutting facts
- When two facts must be cut for space, cut the less newsworthy one

### Compression

- Target 3-5x compression (source words / output words)
- 3x = light edit (long interview, already well-structured)
- 5x = heavy condensing (rambling script, lots of repetition)
- Never go below 3x — you're likely losing material facts
- Never go above 5x unless the source has extreme repetition

### Verbal Tic Catalog

Common patterns to remove (non-exhaustive):

- Filler: "you know," "like," "I mean," "right?," "so," "basically," "actually"
- Delivery cues: "now let's talk about," "here's the thing," "as I mentioned"
- Emphasis repetition: "this is huge, this is absolutely huge, I can't stress enough how huge this is" → "this is significant"
- False starts: "I think — well, what I want to say is —"
- Audience address: "for those of you who don't know," "if you've been following"

### Reading Flow

- Written lead ≠ spoken lead. Scripts often build up to the key point; articles lead with it
- Group related facts that may be scattered across the script
- Use paragraph breaks at topic shifts, not at breathing pauses
- Transitions should be logical ("however," "meanwhile") not conversational ("speaking of which")

### Template-Driven Output Format

When drafting stories for a newsletter, **always check the edition template for format requirements before writing.** Different newsletters require different body formats. For example, the Daily Dip template requires:

- One intro/summary sentence
- Exactly 3 bullet points (bold key phrase + completing phrase)
- NO prose paragraphs

This is not the default "clean prose" output. The template's per-story formatting section is the authoritative format spec. Read it before drafting, and verify each story matches the required structure after drafting.

## Reference Guides

- **[transformation-checklist.md](references/transformation-checklist.md)** — Step-by-step checklist for every transformation. Use as a quality gate before delivering output.
- **[inverted-pyramid-structure.md](references/inverted-pyramid-structure.md)** — Three-layer news structure, lede crafting (5Ws, so-what test), quote selection and attribution rules, AP style quick reference, and revision techniques.

## Integration

This skill is the primary skill for the `editorial-writer` agent and is consumed adversarially by the `editorial-accuracy-reviewer` agent (which compares output to source to catch fidelity issues).

Works with:
- `editorial-team/editorial-voice-matching` — Apply after transformation to match the target publication's voice
- `editorial-team/bias-screening` — Run on output to catch any bias introduced during transformation
