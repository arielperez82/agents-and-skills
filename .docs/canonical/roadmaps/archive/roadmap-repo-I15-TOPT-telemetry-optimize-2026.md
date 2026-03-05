---
type: roadmap
endeavor: repo
initiative: I15-TOPT
initiative_name: telemetry-optimize-command
status: proposed
updated: 2026-02-19
---

# Roadmap: Telemetry Optimize Command (I15-TOPT)

## Overview

Sequences the outcomes for delivering `/telemetry:optimize`. Walking skeleton first, then breadth expansion.

## Implementation Waves

| Wave | Outcomes | Rationale |
|------|----------|-----------|
| 1 | Outcome 1 | Walking skeleton proves architecture end-to-end |
| 2 | Outcomes 2, 4, 5 (parallel) | Independent expansions: recommendations, time window, error handling |
| 3 | Outcome 3 | Depends on Outcome 2 |
| 4 | Outcome 6 | Final validation |

## Outcome Sequence

### Outcome 1: Walking Skeleton [MUST]
Query both pipes via MCP, classify agents, render sorted table. Covers US-1, US-2, US-6.

### Outcome 2: Enriched Recommendations [MUST]
Per-agent actionable recommendations by priority bucket. Covers US-3. Depends on Outcome 1.

### Outcome 3: Model Tier Mismatch [SHOULD]
Flag opus agents where sonnet suffices. Covers US-4. Depends on Outcome 2.

### Outcome 4: Configurable Time Window [SHOULD]
`--days N` argument parsing. Covers US-5. Depends on Outcome 1.

### Outcome 5: Error Resilience [MUST]
Graceful handling of MCP failures, empty data, partial results. Covers US-1/US-6 error paths. Depends on Outcome 1.

### Outcome 6: Command Validation [MUST]
Pass command-validator. Covers US-7. Depends on all prior outcomes.

## Dependency Graph

```
Outcome 1 (Walking Skeleton)
  |
  +---> Outcome 2 (Recommendations)
  |       |
  |       +---> Outcome 3 (Model Tier Mismatch)
  |
  +---> Outcome 4 (Time Window)
  |
  +---> Outcome 5 (Error Resilience)
  |
  All ----> Outcome 6 (Command Validation)
```
