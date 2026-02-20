---
type: roadmap
endeavor: repo
initiative: I16-MCEF
initiative_name: monte-carlo-estimation-forecasting
status: proposed
updated: 2026-02-20
---

# Roadmap: Monte Carlo Estimation & Forecasting (I16-MCEF)

## Overview

Sequences the outcomes for delivering probabilistic forecasting, WSJF prioritization, and AI-pace calibrated estimation. Walking skeleton first (Monte Carlo script), then data pipeline, then parallel documentation and tooling, then agent integration last.

## Implementation Waves

| Wave | Outcomes | Rationale |
|------|----------|-----------|
| 1 | Outcome 1 (US-1) | Walking skeleton proves Monte Carlo forecasting end-to-end |
| 2 | Outcome 2 (US-2) | Git extractor provides real data input to the forecaster |
| 3 | Outcomes 3, 4, 5 (parallel: US-3, US-4, US-5+US-6) | Independent: WSJF docs, WSJF script mode, calibration and confidence docs |
| 4 | Outcome 6 (US-7) | Agent updates depend on all scripts and docs being complete |

## Outcome Sequence

### Outcome 1: Monte Carlo Forecaster Script [MUST -- Walking Skeleton]

Python CLI script that accepts throughput history and remaining item count, runs 10,000 simulations, outputs percentile table (50th/85th/95th) with optional date conversion and JSON output. Covers US-1.

**Driving ports:** CLI command (`python3 monte_carlo_forecast.py --throughput ... --remaining N`)

**Walking skeleton slice:** Accept hardcoded throughput via `--throughput 3,5,2,4,6`, simulate, print percentile table. This is the thinnest vertical slice that proves the core algorithm works through the CLI interface.

**Acceptance test handoff:** 10 scenarios (5 happy, 1 edge, 4 error). The first failing acceptance test is "Forecast completion periods from historical throughput" -- inner-loop TDD starts here.

### Outcome 2: Git Throughput Extractor [MUST]

Python CLI script that analyzes git commit history for initiative/backlog markers, produces throughput-per-period JSON array compatible with the forecaster. Covers US-2. Depends on Outcome 1 (output format compatibility).

**Driving ports:** CLI command (`python3 git_throughput_extractor.py --repo-path . --period week`)

**Acceptance test handoff:** 7 scenarios (4 happy, 3 error). First failing test is "Extract weekly throughput from repository commit history."

### Outcome 3: WSJF Framework Documentation [MUST]

Reference document with WSJF formula, 1-10 scoring rubrics, 3+ worked examples, portfolio allocation relationship, and WSJF vs RICE decision guide. Covers US-3.

**Driving ports:** Document existence and content validation (reference doc in `references/`)

**Acceptance test handoff:** 4 scenarios (all happy path -- documentation completeness). First failing test is "WSJF formula and scoring rubric are documented."

### Outcome 4: WSJF Scoring Mode in portfolio_prioritizer.py [SHOULD]

Add `--wsjf` flag to existing script. Accepts WSJF columns in CSV, computes and ranks by WSJF score within buckets. Existing modes unbroken. Covers US-4.

**Driving ports:** CLI command (`python3 portfolio_prioritizer.py items.csv --wsjf`)

**Acceptance test handoff:** 5 scenarios (2 happy, 3 error). First failing test is "Rank items by WSJF score within a bucket."

### Outcome 5: AI-Pace Calibration and Confidence-Driven Patterns [SHOULD]

Two reference documents: (a) AI-pace calibration methodology with data collection protocol, baseline calculation, and calibration workflow; (b) confidence-driven prioritization patterns with percentile communication, WSJF adjustment, and re-forecasting triggers. Covers US-5 and US-6.

**Driving ports:** Document existence and content validation (reference docs in `references/`)

**Acceptance test handoff:** 6 scenarios (5 happy, 1 error). First failing test is "Data collection protocol is documented."

### Outcome 6: Agent Frontmatter and Workflow Updates [MUST]

Update product-director, product-manager, senior-project-manager, and implementation-planner to reference and invoke forecasting, WSJF, and calibration capabilities. Covers US-7. Depends on all prior outcomes.

**Driving ports:** Agent definition files and agent-validator

**Acceptance test handoff:** 5 scenarios (4 happy, 1 validation). First failing test is "product-director references Monte Carlo forecasting."

## Dependency Graph

```
Outcome 1 (Monte Carlo Forecaster) [Walking Skeleton]
  |
  +---> Outcome 2 (Git Throughput Extractor)
  |       |
  |       +---> Outcome 3 (WSJF Docs)         \
  |       |                                      \
  |       +---> Outcome 4 (WSJF Script Mode)     |-- Wave 3 (parallel)
  |       |                                      /
  |       +---> Outcome 5 (Calibration + Conf.) /
  |
  All --------> Outcome 6 (Agent Updates)
```

## Priority Mapping

| Outcome | Priority | Stories |
|---------|----------|---------|
| 1 | Must | US-1 |
| 2 | Must | US-2 |
| 3 | Must | US-3 |
| 4 | Should | US-4 |
| 5 | Should | US-5, US-6 |
| 6 | Must | US-7 |

## Acceptance Test Budget

| Outcome | Scenarios | Happy | Error/Edge |
|---------|-----------|-------|------------|
| 1 | 10 | 5 | 5 |
| 2 | 7 | 4 | 3 |
| 3 | 4 | 4 | 0 |
| 4 | 5 | 2 | 3 |
| 5 | 6 | 5 | 1 |
| 6 | 5 | 4 | 1 |
| **Total** | **37** | **24** | **13 (35%)** |

Note: Charter acceptance scenarios section shows 35 total with 43% error+edge. The 2-scenario difference reflects the roadmap grouping US-5 and US-6 into a single outcome. Both counts are consistent with the 40%+ error path target.
