---
description: Run a Waste Snake Review to aggregate observations and update the ledger
argument-hint: "[--since YYYY-MM-DD]"
---

# /retro/waste-snake — Waste Snake Review

Aggregate waste observations from the waste snake file at `WASTE_SNAKE` (per `/docs/layout`), classify them, and produce a ledger entry with counts, trends, and recommendations.

## Arguments

- **--since YYYY-MM-DD** (optional): Only review observations after this date. Defaults to the date of the last ledger entry, or all observations if no ledger entries exist.

## Prerequisites

- Load `skills/delivery-team/waste-identification/SKILL.md` for the practice overview
- Load `skills/delivery-team/waste-identification/references/waste-types.md` for the Lean waste taxonomy

## Process

1. **Read the waste snake** — Read the waste snake file at `WASTE_SNAKE` (per `/docs/layout`)
2. **Identify review window** — Find all observations since the last ledger entry (or `--since` date)
3. **Count observations** — Report total count in the review window
4. **Group similar observations** — Cluster observations that describe the same kind of waste
5. **Classify clusters** — For each cluster, assign a Lean waste type from `references/waste-types.md` (Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, Extra processing)
6. **Calculate compound cost** — Where observations include duration estimates, compute `duration x occurrences = total`
7. **Identify top patterns** — Rank clusters by frequency and/or compound cost
8. **Produce recommendations** — Suggest 2-3 concrete actions to eliminate or reduce the top wastes
9. **Append ledger entry** — Add a new entry to the waste snake file at `WASTE_SNAKE` (per `/docs/layout`) under the `## Ledger` section:

```markdown
### Review: YYYY-MM-DD

**Period:** [start date] to [end date]
**Observations reviewed:** [count]

#### Top Waste Patterns

| # | Pattern | Type | Occurrences | Compound Cost |
|---|---------|------|-------------|---------------|
| 1 | [description] | [waste type] | [count] | [estimate] |
| 2 | [description] | [waste type] | [count] | [estimate] |
| 3 | [description] | [waste type] | [count] | [estimate] |

#### Waste Type Distribution

| Type | Count |
|------|-------|
| [type] | [n] |

#### Recommendations

1. [Concrete action to eliminate top waste]
2. [Concrete action to reduce second waste]
3. [Concrete action or investigation for third waste]

#### Snake Size

[Total observations since inception]: [count]
[Total observations this period]: [count]
```

10. **Report results** — Summarize findings for the user

## Notes

- The review is facilitated by the `agile-coach` agent (Workflow 5) but can be run by anyone
- Classification uses the DOWNTIME taxonomy from Lean (see `references/waste-types.md`)
- Recommendations should be specific and actionable, not generic advice
- The snake "grows" with observations — reviews do not remove observations, they produce ledger entries
- If there are fewer than 3 observations, note that the sample is small and recommend continuing to collect
