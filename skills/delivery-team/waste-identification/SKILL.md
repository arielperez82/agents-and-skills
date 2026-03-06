---
name: waste-identification
description: >
  Waste Snake practice for making process waste visible through continuous observation.
  Use when any agent or human encounters frustration, tedium, delays, or low-value work
  during development. Provides the observation format, Lean waste taxonomy reference,
  and review process for aggregating observations into actionable patterns.
---

# Waste Identification (Waste Snake)

The Waste Snake is a practice for making invisible waste visible. It is not about solving problems — it is about noticing them. Small wastes compound: 15 min x 8 agents x 2x/week = 200 hours/year.

**Source:** [Waste Snake](https://www.industriallogic.com/blog/waste-snake/) by Tim Ottinger (Industrial Logic), crediting Martine Devos as inventor.

## Core Principle

> "The job of the waste snake is not to solve the problem but to make us aware of the wastes all around us." — Tim Ottinger

Report what frustrated, bored, or delayed you. Do not classify, analyze, or solve — just write it down. Classification happens during periodic reviews, not at observation time.

## Observation Format

When you encounter waste, append an observation to the waste snake file at `WASTE_SNAKE` (per `/docs/layout`):

```markdown
### YYYY-MM-DD HH:MM

[Free-text description of what frustrated, bored, or delayed you.
Include what you were doing and roughly how long was wasted.]
```

That's it. No category. No severity. No root cause. Just describe the moment.

**Good observations include:**

- What you were trying to do
- What got in the way
- Roughly how long was wasted (even a guess helps)

**Examples:**

- "Spent 15 min manually reformatting YAML frontmatter that a script could fix"
- "Waited 20 min for CI to finish on a docs-only PR — no path filtering"
- "Re-read the same 3 files trying to find the right skill path — no search command existed"
- "Wrote the same boilerplate agent frontmatter for the 4th time this week"

## How to Report

Use `/waste/add` with a free-text description. The command handles formatting and appending.

Or append directly to the waste snake file at `WASTE_SNAKE` (per `/docs/layout`) using the format above.

## Waste Snake Review

Periodically (monthly recommended), run `/retro/waste-snake` to:

1. Scan observations since the last review
2. Group similar observations and count occurrences
3. Classify clusters by Lean waste type (see `references/waste-types.md`)
4. Calculate compound cost where possible
5. Append a ledger entry with counts, trends, and top recommendations

The `agile-coach` agent facilitates this review (Workflow 5).

## Who Reports

Anyone. Any agent, any human. The protocol is opt-in — the skill is available, not mandatory. The only requirement is honesty about what frustrated, bored, or delayed you.

## Who Reviews

The `agile-coach` agent aggregates and classifies during Waste Snake Reviews. The `learner` agent watches for waste moments proactively and offers to capture them.

## Reference

- `references/waste-types.md` — Lean waste type taxonomy for classification during reviews
