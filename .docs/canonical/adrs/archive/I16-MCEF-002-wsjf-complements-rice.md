---
type: adr
endeavor: repo
initiative: I16-MCEF
initiative_name: monte-carlo-estimation-forecasting
status: accepted
created: 2026-02-20
updated: 2026-02-20
---

# ADR I16-MCEF-002: WSJF Complements RICE (Not Replacement)

## Status

Accepted

## Context

The prioritization-frameworks skill currently ranks growth/revenue bucket items using RICE + NPV + Cost of Delay. The combined score formula is:

```
bucket_score = (RICE_normalized * 0.3) + (Risk_Adjusted_NPV_normalized * 0.5) + (CoD_normalized * 0.2)
```

I16-MCEF adds Weighted Shortest Job First (WSJF), the SAFe-originated framework that ranks by Cost of Delay divided by Job Size:

```
WSJF = (Business Value + Time Criticality + Risk Reduction/Opportunity Enablement) / Job Size
```

Both RICE and WSJF are legitimate prioritization frameworks. The question is: should WSJF replace RICE within growth/revenue buckets, or complement it as an alternative mode?

### Key Differences

| Dimension | RICE | WSJF |
|-----------|------|------|
| Primary signal | Reach (users affected) | Cost of Delay (value of time) |
| Effort role | Denominator (penalizes large work) | Denominator (penalizes large work) |
| Best for | Consumer products with measurable reach | Flow-based teams with time-sensitive work |
| Weakness | Ignores urgency dynamics | Ignores audience size |
| Data needed | Reach, Impact, Confidence, Effort | Business Value, Time Criticality, Risk Reduction, Job Size |

### Forces

1. **Existing users** rely on RICE + NPV scoring. Replacing it breaks their workflows and mental models.
2. **Some backlog contexts** are time-driven (regulatory deadlines, competitive windows) where WSJF is superior.
3. **Some backlog contexts** are reach-driven (user growth, engagement) where RICE is superior.
4. **Portfolio_prioritizer.py** already has a stable CLI interface and JSON schema. Breaking changes require migration effort.

## Decision

WSJF is added as an **alternative within-bucket scoring mode** via a `--wsjf` flag on portfolio_prioritizer.py. It does not replace or modify the existing RICE + NPV + Cost of Delay scoring path.

Specifically:

1. **Default mode unchanged.** Running `portfolio_prioritizer.py items.csv` uses existing RICE + NPV + CoD scoring exactly as before.
2. **WSJF mode is opt-in.** Running `portfolio_prioritizer.py items.csv --wsjf` activates WSJF scoring for growth/revenue buckets.
3. **WSJF operates within buckets.** It ranks items within their assigned bucket, not across buckets. Cross-bucket normalization continues to use the unified priority score formula.
4. **Both scores can coexist.** When `--wsjf` is active, items in growth/revenue buckets get a `wsjf_score` field alongside `bucket_score`. The `bucket_score` is set from the WSJF calculation in WSJF mode.
5. **CSV input is additive.** WSJF requires `business_value`, `time_criticality`, `risk_reduction`, `job_size` columns. Existing columns (`reach`, `impact`, `confidence`, `effort`, `npv`, etc.) remain valid for default mode.
6. **Reference documentation** includes a "When to use WSJF vs RICE" decision guide with concrete criteria.

## Consequences

### Positive

1. **No breaking changes.** Every existing CLI invocation, CSV format, and JSON output continues to work identically. Zero migration effort for current users.
2. **Right tool for the context.** Teams with time-sensitive backlogs use `--wsjf`. Teams with reach-driven backlogs use default RICE. The decision guide helps teams choose.
3. **Composable with Monte Carlo.** WSJF's `time_criticality` component can be informed by Monte Carlo forecast confidence intervals (documented in confidence-driven prioritization patterns). RICE has no natural integration point for probabilistic dates.
4. **Incremental adoption.** Teams can try WSJF on one quarter's planning, compare results to RICE, and decide which fits their context. No commitment required.

### Negative

1. **Two scoring modes to explain.** Agents and users must understand when to use which mode. Mitigated by the decision guide in the WSJF reference documentation.
2. **CSV columns grow.** Adding 4 WSJF columns to an already wide CSV format. Mitigated by making WSJF columns optional (only required when `--wsjf` is used).
3. **Agent invocation complexity.** Agents (product-director, product-manager) must decide which mode to recommend. Mitigated by explicit triggers in agent workflow sections.

### Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| Replace RICE with WSJF | Breaking change. RICE is better for reach-driven contexts. No single framework fits all backlogs. |
| Merge RICE and WSJF into a combined score | Over-complex formula with too many inputs. Loses the simplicity that makes each framework useful. |
| WSJF as a separate script | Fragments the portfolio prioritizer. Users would need to run two scripts and manually merge results. |
| WSJF for all buckets (not just growth/revenue) | Tech debt and bug buckets have specialized scoring (Debt Severity, CLV-at-Risk) that WSJF does not improve upon. |

## References

- SAFe WSJF documentation: `(Business Value + Time Criticality + Risk Reduction) / Job Size`
- Existing scoring: `score_growth_revenue()` in portfolio_prioritizer.py (lines 57-70)
- Charter US-4: WSJF scoring mode acceptance criteria
- Charter US-3: WSJF reference documentation with decision guide
