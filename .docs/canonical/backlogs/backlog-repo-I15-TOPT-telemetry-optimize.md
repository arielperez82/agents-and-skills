---
type: backlog
endeavor: repo
initiative: I15-TOPT
initiative_name: telemetry-optimize-command
status: proposed
updated: 2026-02-19
---

# Backlog: Telemetry Optimize Command

## Changes (ranked)

| ID | Change | Outcome | Status |
|----|--------|---------|--------|
| B1 | **Walking skeleton: bare command file** with frontmatter, Purpose, Execution Steps, Output Format, Notes sections | 1 | todo |
| B2 | **MCP query: optimization_insights pipe** via use-mcp stdin pattern with --days param | 1 | todo |
| B3 | **MCP query: cost_by_agent pipe** via use-mcp with same days param | 1 | todo |
| B4 | **Classification + sorted table**: merge by agent_type, classify CRITICAL/HIGH/MEDIUM/LOW, render table | 1 | todo |
| B5 | **Enriched recommendations**: per-bucket actionable guidance + token budget + prompt bloat signals | 2 | todo |
| B6 | **Configurable time window**: --days N parsing, validation, report header | 4 | todo |
| B7 | **Error resilience**: empty data, partial failures, MCP unavailable, malformed JSON | 5 | todo |
| B8 | **Model tier mismatch**: flag opus where sonnet suffices, multi-model rows | 3 | todo |
| B9 | **Command validation**: pass command-validator with zero errors | 6 | todo |

## Waves

```
Wave 1:  B1 -> B2 -> B3 -> B4  (walking skeleton, sequential)
Wave 2:  B5 | B6 | B7          (parallel expansions)
Wave 3:  B8                     (depends on B5)
Wave 4:  B9                     (final validation)
```
