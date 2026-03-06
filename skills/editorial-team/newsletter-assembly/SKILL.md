---
name: newsletter-assembly
description: Assemble selected stories, poll, and show notes into a complete newsletter
  edition. Covers edition template structure, subject line methodology, story ordering
  logic, and format-agnostic markdown output.
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
      - references/newsletter-edition-template.md
      - references/templates/default.md
    assets: []
  difficulty: intermediate
  domain: editorial
  examples:
    - title: "Assemble 3-story edition"
      input: "3 selected stories, 1 poll, show notes, and voice reference. Assemble into a complete newsletter edition."
      output: "Complete newsletter edition in markdown: subject line, 3 ordered stories, poll section, show notes footer"
    - title: "Generate subject line candidates"
      input: "Given these 3 stories, generate 3-5 subject line candidates ranked by open-rate potential."
      output: "5 subject line candidates with rationale for each, recommended pick highlighted"
  featured: false
  frequency: "Daily per newsletter edition"
  orchestrated-by:
    - newsletter-producer
  related-agents:
    - newsletter-producer
  related-commands: []
  related-skills:
    - editorial-team/story-selection
    - editorial-team/script-to-article
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: newsletter-production
  tags:
    - editorial
    - newsletter
    - assembly
    - edition
    - subject-line
  tech-stack: []
  time-saved: "20-30 minutes per edition"
  title: Newsletter Assembly
  updated: 2026-03-05
  use-cases:
    - Assembling complete newsletter editions from component parts
    - Generating and evaluating subject line candidates
    - Ordering stories for maximum reader engagement
    - Producing format-agnostic newsletter output ready for any delivery platform
  verified: true
  version: v1.0.0
---

# Newsletter Assembly

Assemble selected stories, polls, and show notes into a complete newsletter edition.

## Overview

Newsletter assembly is the final production step: taking individually crafted components (stories, poll, show notes) and composing them into a cohesive edition with a compelling subject line and intentional story ordering. The output is format-agnostic markdown that can be adapted to any delivery platform (email, web, RSS).

**Core Value:** Consistent edition structure that readers can rely on, with intentional story ordering that maximizes engagement.

## Core Capabilities

- **Edition Template** — Parameterized templates in `references/templates/`; defaults to `default.md` if none specified
- **Subject Line Methodology** — Generate 3-5 candidates using proven patterns, rank by open-rate potential
- **Story Ordering Logic** — Lead = strongest/most newsworthy, close = most engaging/shareable, middle = substance/depth
- **Format-Agnostic Output** — Clean markdown that adapts to email HTML, web pages, or RSS feeds
- **Component Integration** — Weave stories, poll, and show notes into a coherent reading experience

## Quick Start

1. Gather all components: selected stories, poll (if any), show notes
2. Select an edition template from `references/templates/` (defaults to `default.md` if none specified)
3. Generate subject line candidates
4. Order stories: lead, middle, close
5. Assemble into complete edition

## Template Selection

Templates live in `references/templates/`. When no `--template` is provided, the workflow prompts the user to choose from available templates or accept the default.

**Adding a new template:** Create a `.md` file in `references/templates/` following the same structure as `default.md` — a markdown code block defining the edition skeleton, followed by section guidance. The template is automatically discoverable.

## Key Workflows

### 1. Full Edition Assembly

1. **Receive components** — Selected stories (from story-selection), poll (from poll-writer), show notes (from editorial-writer)
2. **Order stories:**
   - **Lead** (position 1) — Strongest news value or most broadly relevant story
   - **Middle** (position 2) — Deepest substance or most analytical story
   - **Close** (position 3) — Most engaging, shareable, or emotionally resonant story
3. **Generate subject line candidates** (3-5):
   - Pattern 1: Lead story headline (direct)
   - Pattern 2: Teaser from the most surprising fact across all stories
   - Pattern 3: Question that the lead story answers
   - Pattern 4: Number-driven ("3 things about X")
   - Pattern 5: Contrast or tension ("X happened, but Y")
4. **Rank candidates** by open-rate potential (clarity > curiosity > urgency)
5. **Assemble edition** using the template
6. **Verify completeness** — All sections present, no placeholder text, all links/references resolved

### 2. Subject Line Generation (Standalone)

1. **Read all story headlines and summaries**
2. **Generate 3-5 candidates** using the 5 patterns above
3. **Score each** on: clarity (does it tell you what you'll get?), curiosity (does it make you want to open?), length (under 60 characters preferred)
4. **Recommend top pick** with rationale

## Best Practices

- Subject lines under 60 characters have higher open rates
- The lead story should justify the subject line — don't bait-and-switch
- Story transitions should be implicit (section breaks) not explicit ("next up...")
- The poll should relate to at least one story in the edition
- Show notes go at the bottom — they're reference material, not primary content
- Keep the intro to 1-2 sentences maximum — get to the first story fast

## Reference Guides

- **[newsletter-edition-template.md](references/newsletter-edition-template.md)** — Template index and instructions for adding custom templates
- **[templates/default.md](references/templates/default.md)** — Default edition template (3-story + poll + show notes)

## Integration

Consumed by `newsletter-producer` agent as the final assembly step (step 6 of the 7-step pipeline). Receives stories from `story-selection`, poll from `poll-writer`, show notes from `editorial-writer`.
