---
name: story-selection
description: Evaluate and rank candidate stories for newsletter inclusion using 5
  weighted criteria (audience relevance, newsworthiness, topic diversity, engagement
  potential, narrative strength). Supports explicit picks and auto-select modes with
  diversity constraints.
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
    references: []
    assets: []
  difficulty: intermediate
  domain: editorial
  examples:
    - title: "Auto-select 3 from 6 candidates"
      input: "6 story drafts from a segmented transcript. Select the best 3 for today's newsletter edition."
      output: "Ranked selection of 3 stories with per-criterion scores, rationale for each pick, and rationale for each exclusion"
    - title: "Validate explicit picks"
      input: "Editor pre-selected stories 1, 3, and 5. Validate the selection against criteria and flag any diversity concerns."
      output: "Validation report confirming or flagging the pre-selected stories with diversity analysis"
  featured: false
  frequency: "Daily per newsletter edition"
  orchestrated-by:
    - newsletter-producer
  related-agents:
    - newsletter-producer
  related-commands: []
  related-skills:
    - editorial-team/script-to-article
    - editorial-team/newsletter-assembly
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: editorial-curation
  tags:
    - editorial
    - curation
    - newsletter
    - story-selection
    - ranking
  tech-stack: []
  time-saved: "15-20 minutes per edition"
  title: Story Selection
  updated: 2026-03-05
  use-cases:
    - Selecting stories for newsletter editions from a pool of candidates
    - Ranking stories by editorial value across multiple criteria
    - Ensuring topic diversity across newsletter editions
    - Validating editor pre-selections against quality criteria
  verified: true
  version: v1.0.0
---

# Story Selection

Evaluate and rank candidate stories for newsletter inclusion using weighted editorial criteria.

## Overview

Not every story from a show makes the newsletter. Story selection applies a structured evaluation framework to pick the strongest 3-5 stories from a larger candidate pool while ensuring topic diversity. It supports two modes: auto-select (algorithm picks) and explicit (editor picks, validated against criteria).

**Core Value:** Consistent, defensible story selection with documented rationale — eliminating "gut feel" curation that can't be reviewed or improved.

## Core Capabilities

- **5-Criterion Evaluation** — Score each story on audience relevance, newsworthiness, topic diversity, engagement potential, and narrative strength
- **Weighted Scoring** — Configurable weights per criterion with sensible defaults
- **Diversity Constraint** — Prevent same-topic clustering (no more than 2 stories from the same domain)
- **Auto-Select Mode** — Rank all candidates, pick top N with diversity constraint applied
- **Explicit Mode** — Validate editor pre-selections against criteria, flag concerns
- **Selection Rationale** — Every pick and every exclusion includes a documented reason

## Quick Start

1. Gather candidate stories (from script-to-article segmentation or other sources)
2. Choose mode: auto-select (pick best N) or explicit (validate pre-selections)
3. Apply the 5-criterion evaluation to each candidate
4. In auto-select: rank and pick top N with diversity constraint
5. In explicit: validate pre-selections and flag any concerns

## Key Workflows

### 1. Auto-Select Mode

1. **Receive candidate stories** — Each with headline, summary, and body
2. **Score each story** on 5 criteria (1-10 scale per criterion):
   - **Audience relevance** (weight: 30%) — Does the target audience care about this topic?
   - **Newsworthiness** (weight: 25%) — Is this timely? Does it contain new information?
   - **Topic diversity** (weight: 15%) — Does this add a different topic to the edition?
   - **Engagement potential** (weight: 15%) — Will readers share, discuss, or act on this?
   - **Narrative strength** (weight: 15%) — Is the story well-told with a clear arc?
3. **Calculate weighted score** for each story
4. **Rank by weighted score**
5. **Apply diversity constraint** — If top N has >2 stories from the same domain, swap the lowest-scoring duplicate for the next-highest story from a different domain
6. **Output:** Selected stories (ordered) + excluded stories, each with scores and rationale

### 2. Explicit Mode (Editor Picks)

1. **Receive pre-selected stories** — Editor has already chosen
2. **Score all candidates** (selected and unselected) on 5 criteria
3. **Compare** — Are the pre-selections the top N by score? If not, flag the gap
4. **Check diversity** — Do the pre-selections cluster on one topic?
5. **Output:** Validation report — confirms good selections or flags concerns with data

## Best Practices

- Score before reading the editor's picks (in explicit mode) to avoid anchoring bias
- When two stories score within 1 point of each other, prefer topic diversity
- Document the "almost made it" stories — they're candidates for next edition
- Review scoring weights quarterly based on reader engagement data

## Integration

Consumed by `newsletter-producer` agent as step 2 of the 7-step pipeline. Receives input from `script-to-article` segmentation output.
