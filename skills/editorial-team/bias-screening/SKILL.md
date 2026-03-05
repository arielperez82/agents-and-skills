---
name: bias-screening
description: Detect editorial bias across 6 categories (loaded language, partisan framing,
  false balance, editorializing-as-reporting, selection bias, attribution asymmetry)
  with severity classification and neutral rewriting patterns. Distinguishes neutral
  from centrist.
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
      - references/loaded-terms-dictionary.md
    assets: []
  difficulty: advanced
  domain: editorial
  examples:
    - title: "Screen article for bias"
      input: "Screen this newsletter article for editorial bias. Flag any loaded language, partisan framing, or editorializing."
      output: "Bias report with 3 flagged passages: 1 loaded language (severity: warning), 1 editorializing-as-reporting (severity: flag), 1 attribution asymmetry (severity: flag). Neutral rewrites suggested for each."
    - title: "Screen poll options for balance"
      input: "Check these poll options for bias: A) 'The government's reckless spending plan' B) 'Fiscal responsibility' C) 'Moderate approach' D) 'Bold investment'"
      output: "Options A and D contain loaded language. Neutral alternatives: A) 'The proposed spending bill' D) 'Increased federal spending'"
  featured: false
  frequency: "Per article and per poll in newsletter pipeline"
  orchestrated-by: []
  related-agents:
    - fact-checker
    - editorial-writer
    - poll-writer
  related-commands: []
  related-skills:
    - editorial-team/script-to-article
    - editorial-team/editorial-voice-matching
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: editorial-quality
  tags:
    - editorial
    - bias
    - neutrality
    - screening
    - quality
  tech-stack: []
  time-saved: "10-15 minutes per article screening"
  title: Bias Screening
  updated: 2026-03-05
  use-cases:
    - Screening newsletter articles for editorial bias before publication
    - Validating poll options for balance and neutrality
    - Training editorial writers on neutral language patterns
    - Identifying and rewriting biased passages
  verified: true
  version: v1.0.0
---

# Bias Screening

Detect editorial bias across 6 categories with severity classification and neutral rewriting patterns.

## Overview

Neutral reporting is not the same as centrist positioning. Neutral means presenting facts without editorial opinion, loaded language, or framing that privileges one interpretation. Centrist means taking a position in the middle of a political spectrum — which is still a position. This skill focuses on neutrality: the absence of bias, not the presence of a particular viewpoint.

**Core Value:** Systematic bias detection that catches patterns human editors miss, with actionable neutral rewrites rather than vague "this seems biased" feedback.

## Core Capabilities

- **6 Detection Categories** — Loaded language, partisan framing, false balance, editorializing-as-reporting, selection bias, attribution asymmetry
- **Severity Classification** — Flag (minor, note for awareness), Warning (moderate, should fix), Block (severe, must fix before publication)
- **Neutral Rewriting Patterns** — For each flagged passage, provide a neutral alternative
- **Neutral vs Centrist Distinction** — Explicitly differentiates neutral reporting from centrist positioning
- **Loaded Terms Dictionary** — Reference dictionary of common loaded terms by domain with neutral alternatives

## Quick Start

1. Read the article or poll to screen
2. Scan for each of the 6 bias categories
3. Classify each finding by severity
4. Provide neutral rewrite for each flagged passage
5. Report findings with overall assessment

## 6 Detection Categories

### 1. Loaded Language

Words or phrases with emotional connotation that substitute for neutral description.

| Loaded | Neutral |
|--------|---------|
| "slashed" (budgets) | "reduced" or "cut" |
| "reckless spending" | "the spending proposal" |
| "crackdown" | "enforcement action" |
| "controversial" (without context) | [describe the actual disagreement] |
| "admit" (implies wrongdoing) | "said" or "stated" |

See `references/loaded-terms-dictionary.md` for the complete dictionary.

### 2. Partisan Framing

Presenting facts through a lens that favors one political or ideological position.

**Indicators:**
- Using one side's terminology exclusively ("pro-life" vs "anti-abortion" vs the neutral "abortion opponents")
- Framing a policy by its stated goals (favorable) rather than its mechanisms (neutral)
- Presenting one side's argument in detail and the other in summary

### 3. False Balance

Giving equal weight to unequally supported positions, implying they're equally valid.

**Indicators:**
- "Some scientists say X, while others say Y" when Y has overwhelming consensus
- Quoting one expert per "side" when one side has thousands of experts
- Using "debate" or "controversy" when the scientific community is in consensus

**Note:** Not all balance is false balance. When legitimate disagreement exists among qualified experts, presenting multiple perspectives is good journalism.

### 4. Editorializing-as-Reporting

Inserting opinion or judgment into what appears to be factual reporting.

**Indicators:**
- "Unfortunately, the policy..." (value judgment)
- "The smart move would be..." (prescription disguised as reporting)
- "Clearly, this shows..." (interpretation presented as fact)
- "Not surprisingly..." (implies something should be obvious)

### 5. Selection Bias

Choosing which facts to include or exclude in a way that supports a narrative.

**Indicators:**
- Reporting only positive or only negative aspects of a topic
- Omitting relevant context that complicates the narrative
- Cherry-picking data points or time ranges

**Note:** All editorial selection involves choices. This category flags patterns where the choices consistently favor one narrative.

### 6. Attribution Asymmetry

Treating sources differently based on which "side" they represent.

**Indicators:**
- "Experts say X" vs "Critics claim Y" (experts vs critics implies credibility difference)
- Named, credentialed sources for one side, anonymous "some say" for the other
- "According to" (neutral) for one side, "alleges" (skeptical) for the other

## Severity Classification

| Severity | Meaning | Action |
|----------|---------|--------|
| **Flag** | Minor bias indicator. Could be incidental. | Note for awareness. Fix if easy, skip if it would make prose awkward. |
| **Warning** | Moderate bias. Pattern of framing or loaded language. | Should fix before publication. Neutral rewrite provided. |
| **Block** | Severe bias. Editorializing disguised as reporting, or systematic one-sided framing. | Must fix before publication. Passage cannot go out as-is. |

## Neutral vs Centrist

| Neutral | Centrist |
|---------|----------|
| "The bill would increase spending by $50B" | "The bill takes a moderate approach to spending" |
| "Supporters say X. Opponents say Y." | "The truth is somewhere in the middle" |
| Reports facts without evaluation | Evaluates and takes a middle position |
| No position | A position (the middle one) |

**Key principle:** Neutral reporting lets the reader form their own view from the facts. Centrist reporting forms a view for the reader — it just happens to be a middle-ground view. This skill targets neutrality, not centrism.

## Best Practices

- Screen after transformation, not during — get the facts right first, then check for bias
- Apply to both articles and polls (poll options are a common source of bias)
- When flagging, always provide a neutral rewrite — "this is biased" without an alternative is unhelpful
- Some loaded terms are context-dependent — "crisis" is loaded for a policy disagreement but neutral for an actual emergency
- Check attribution patterns across the entire article, not just individual sentences

## Reference Guides

- **[loaded-terms-dictionary.md](references/loaded-terms-dictionary.md)** — Dictionary of common loaded terms organized by domain with neutral alternatives

## Integration

Core skill for `fact-checker` agent. Also consumed by `editorial-writer` (awareness during drafting) and `poll-writer` (balance checking for poll options).
