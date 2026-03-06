# Lean Waste Types

Reference taxonomy for classifying waste observations during Waste Snake Reviews. These categories come from Lean manufacturing (Taiichi Ohno's Toyota Production System) adapted for software delivery.

Use this during `/retro/waste-snake` reviews to classify clusters of observations. Do not ask reporters to classify at observation time.

## The 8 Wastes (DOWNTIME)

| Waste Type | Mnemonic | Software Examples |
|---|---|---|
| **Defects** | D | Bugs found late, rework from unclear requirements, wrong assumptions |
| **Overproduction** | O | Features nobody asked for, gold-plating, premature optimization, over-engineering |
| **Waiting** | W | Waiting for CI, waiting for code review, waiting for decisions, blocked on dependencies |
| **Non-utilized talent** | N | Manual work a script could do, expert doing junior tasks, knowledge siloed in one person |
| **Transportation** | T | Unnecessary handoffs, context switching between tasks, moving data between systems manually |
| **Inventory** | I | Large PRs waiting for review, WIP piling up, branches that live too long, unmerged work |
| **Motion** | M | Searching for information, navigating complex tooling, re-reading files to find something, repetitive manual steps |
| **Extra processing** | E | Unnecessary approvals, redundant documentation, formatting that a tool should handle, manual processes that could be automated |

## Classification During Reviews

When reviewing a cluster of waste observations:

1. Read the observations in the cluster
2. Identify which waste type best fits the cluster (use the examples above as guidance)
3. If a cluster spans multiple types, pick the dominant one
4. Record the type in the ledger entry

Not every observation will fit cleanly. That is fine — the goal is pattern recognition, not perfect taxonomy.

## Compound Cost Estimation

When observations include duration estimates:

```
[duration per occurrence] x [number of occurrences] = [total waste]
```

Example: "15 min reformatting YAML" x 6 occurrences = 1.5 hours of Motion waste.

Even rough estimates are valuable. They make invisible waste visible in aggregate.

## Common Software Waste Patterns

| Pattern | Typical Type | Signal |
|---|---|---|
| Manual formatting/linting | Extra processing | "I spent N min formatting..." |
| Waiting for CI/CD | Waiting | "Waited N min for pipeline..." |
| Re-finding information | Motion | "Searched for...", "Re-read..." |
| Redoing work after late review | Defects | "Had to rewrite...", "Rework..." |
| Building unused features | Overproduction | "Nobody ended up using..." |
| Context switching | Transportation | "Switched between...", "Lost focus..." |
| Stale branches/PRs | Inventory | "PR sat for N days..." |
| Repetitive boilerplate | Non-utilized talent | "Wrote the same thing again..." |
