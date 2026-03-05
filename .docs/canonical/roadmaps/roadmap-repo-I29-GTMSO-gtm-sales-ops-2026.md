# Roadmap: I29-GTMSO — GTM Sales Ops & Revenue (2026)

**Initiative:** I29-GTMSO
**Date:** 2026-03-05
**Status:** Active

## Outcome Sequence

### Wave 1: Walking Skeleton (Must-Have)

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O1 | Sales ops analyst agent operational | US-1, US-2 | Agent passes `/agent/validate`, core skills exist |
| O2 | Cadence design skill + SDR enhancement | US-6, US-7 (SDR part) | Skill exists, SDR frontmatter updated |

### Wave 2: Pipeline + AE Enhancement (Must-Have)

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O3 | Pipeline forecasting skill operational | US-3 | Skill exists with references |
| O4 | Account executive enhanced | US-7 (AE part) | AE frontmatter updated, passes validate |

### Wave 3: Revenue Layer + README (Should-Have)

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O5 | Revenue ops analyst agent operational | US-4, US-5 | Agent passes `/agent/validate`, revenue-analytics skill exists |
| O6 | README + team guide updated | US-8 + research gap | README entries, sales-team/CLAUDE.md updated |

## Dependencies

- Wave 1 has no blockers (I27, I28 complete)
- Wave 2 depends on Wave 1 (sales-ops-analyst must exist for AE cross-ref)
- Wave 3 depends on Wave 1+2 (revenue-ops-analyst cross-refs sales-ops-analyst)
