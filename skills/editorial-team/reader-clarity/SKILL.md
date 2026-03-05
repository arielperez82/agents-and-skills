---
name: reader-clarity
description: Evaluate and improve editorial content readability using Flesch-Kincaid
  grade 8-10 target, context budget concept, jargon detection, and rewriting patterns
  (jargon-to-plain, complex-to-simple, passive-to-active).
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
      - references/jargon-checklist.md
    assets: []
  difficulty: intermediate
  domain: editorial
  examples:
    - title: "Assess article readability"
      input: "Check this newsletter article for readability. Target audience: general business readers."
      output: "Readability report: Flesch-Kincaid grade 11.2 (target: 8-10). 4 jargon terms flagged, 2 passive voice constructions, 1 buried lede. Rewrites suggested for each."
    - title: "Context budget analysis"
      input: "How much assumed context does this article require? Flag passages that assume too much reader knowledge."
      output: "Context budget: 8 assumed-context credits used (target: max 5 per story). 3 passages flagged: unexplained acronym, insider reference, assumed knowledge of prior event."
  featured: false
  frequency: "Per article during editorial review"
  orchestrated-by: []
  related-agents:
    - reader-clarity-reviewer
  related-commands: []
  related-skills:
    - editorial-team/script-to-article
    - editorial-team/bias-screening
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: editorial-quality
  tags:
    - editorial
    - readability
    - clarity
    - jargon
    - plain-language
  tech-stack: []
  time-saved: "10-15 minutes per article review"
  title: Reader Clarity
  updated: 2026-03-05
  use-cases:
    - Assessing newsletter article readability for general audiences
    - Detecting and replacing jargon with plain language
    - Managing assumed context budget per story
    - Improving sentence clarity and structure
  verified: true
  version: v1.0.0
---

# Reader Clarity

Evaluate and improve editorial content readability for general audiences.

## Overview

Newsletter readers are scanning, not studying. They read on phones during commutes, in email clients between meetings, and in bed before sleep. Content must be immediately clear — no re-reading required, no jargon lookups, no "wait, what does that refer to?" moments. This skill provides a systematic framework for assessing and improving readability.

**Core Value:** Every reader should understand every sentence on first read, regardless of their domain expertise.

## Core Capabilities

- **Readability Scoring** — Flesch-Kincaid grade level targeting 8-10 for general newsletter audiences
- **Context Budget** — Limit assumed reader knowledge per story (max N context credits per article)
- **Jargon Detection** — Domain-specific jargon checklist with plain-language alternatives
- **Rewriting Patterns** — Systematic transforms: jargon-to-plain, complex-to-simple, passive-to-active
- **Structural Clarity** — Buried lede detection, unclear antecedents, transition gaps

## Quick Start

1. Read the article to review
2. Estimate Flesch-Kincaid grade level (target: 8-10)
3. Count assumed-context credits (target: max 5 per story)
4. Scan against jargon checklist at `references/jargon-checklist.md`
5. Apply rewriting patterns to flagged passages

## Key Workflows

### 1. Full Readability Assessment

1. **Read the article** — Note passages that require re-reading
2. **Estimate readability score** — Flesch-Kincaid grade level:
   - Grade 8-10 = target for general newsletters
   - Grade 6-8 = very accessible (good for broad audiences)
   - Grade 10-12 = too complex for scanning (acceptable for niche/expert audiences)
   - Grade 12+ = academic level (not suitable for newsletters)
3. **Count context credits** — Each of these costs 1 credit:
   - Unexplained acronym or abbreviation
   - Reference to a prior event without brief context
   - Industry-specific term used without definition
   - Insider reference (assumes reader follows the topic closely)
   - Implicit causal chain (assumes reader connects A→B→C)
4. **Scan for jargon** — Check against domain-specific jargon checklist
5. **Check sentence structure:**
   - Passive voice constructions
   - Sentences over 25 words
   - Unclear antecedents ("it," "this," "they" without clear referent)
   - Buried lede (key information not in first 2 sentences)
   - Missing transitions between paragraphs
6. **Produce readability report** with scores, flagged passages, and rewrites

### 2. Quick Clarity Pass

1. Focus on the 3 highest-impact checks only:
   - Jargon (scan against checklist)
   - Context credits (count assumed knowledge)
   - Buried lede (is the key point in the first 2 sentences?)
2. Flag and provide rewrites for any issues found

## Rewriting Patterns

### Jargon to Plain

| Jargon | Plain |
|--------|-------|
| "monetize" | "make money from" |
| "leverage" | "use" |
| "synergy" | "combined benefit" or [just describe the specific benefit] |
| "pivot" | "change direction" or "shift focus" |
| [See full list in jargon-checklist.md] | |

### Complex to Simple

| Complex | Simple |
|---------|--------|
| "notwithstanding the aforementioned considerations" | "despite this" |
| "it is important to note that" | [delete — just state the fact] |
| "in the event that" | "if" |
| "at this point in time" | "now" |
| "due to the fact that" | "because" |

### Passive to Active

| Passive | Active |
|---------|--------|
| "The decision was made by the Fed" | "The Fed decided" |
| "It was reported that earnings fell" | "The company reported falling earnings" |
| "The policy is expected to be implemented" | "[Actor] plans to implement the policy" |

## Best Practices

- Fix jargon and context budget issues first — these are the biggest barriers to comprehension
- Readability scores are guides, not rules — a score of 11 with zero jargon may be fine
- When simplifying, never lose precision — "The Fed raised rates by 0.25%" is better than "The Fed raised rates a little"
- Context budget resets per story in a multi-story newsletter — each story must stand alone
- The first sentence of each story should be understandable by anyone

## Reference Guides

- **[jargon-checklist.md](references/jargon-checklist.md)** — Domain-specific jargon organized by field with plain-language alternatives

## Integration

Core skill for `reader-clarity-reviewer` agent. Also useful for `editorial-writer` during drafting (awareness mode).
