# Strategic Assessment: Monte Carlo Forecasting & Advanced Prioritization

**Date:** 2026-02-20
**Assessor:** product-director
**Initiative:** Extends I03-PRFR (Prioritization Frameworks), currently in "Next"

## 1. Strategic Alignment

**Strong alignment.** The goal directly extends I03-PRFR's charter intent: "equip the product team to continuously evaluate what matters most." The charter's gap table lists "Cost of Delay modeling" as High severity -- WSJF is the standard operationalization of Cost of Delay. Monte Carlo forecasting fills an unstated but implied gap: effort estimation has no probabilistic basis, making NPV calculations brittle (garbage-in on the effort/duration axis).

This also aligns with the repo's broader arc: I11-PMSI established the product-team skill structure, I03-PRFR filled the prioritization gap, and this initiative adds the forecasting and calibration layer that makes those frameworks data-driven rather than gut-driven.

## 2. Value vs. Effort

**High value, moderate effort.**

| Component | Effort | Value |
|-----------|--------|-------|
| Monte Carlo script | Small (30-line core, ~2 days with TDD + enhancements) | High -- turns "we think 6 weeks" into "85% confidence by week 8" |
| WSJF framework | Small (reference doc + integration into portfolio_prioritizer.py, ~1 day) | High -- operationalizes Cost of Delay already in the charter |
| AI-pace calibration | Medium (~2-3 days for git history extraction + calibration logic) | Medium -- novel, no established pattern to copy; value depends on team adoption |
| Confidence-driven prioritization | Small (skill documentation + minor script updates, ~1 day) | Medium -- ties the other three together into a coherent workflow |

**Total estimated effort:** 5-7 days of implementation work.

**Expected impact:** Every initiative forecast and prioritization decision in this repo (and consumer repos) gains probabilistic rigor. The 15 completed initiatives provide immediate calibration data -- this is a rare case where historical data already exists.

## 3. Alternative Approaches

**Considered and rejected:**

- **Simple T-shirt sizing:** Already the implicit status quo. Provides no probabilistic output, no confidence intervals, no data-driven improvement over time. Insufficient.
- **Import an external forecasting tool:** Violates the repo's design principle (skills describe methodology; scripts handle computation; agents invoke). External tools cannot integrate with portfolio_prioritizer.py or the agent workflow.
- **WSJF only, skip Monte Carlo:** WSJF improves prioritization order but does not improve duration estimates. The two are complementary, not substitutable.
- **Monte Carlo only, skip WSJF:** Forecasting without urgency-weighted prioritization gives better dates but the same suboptimal sequencing. Also complementary.

**Conclusion:** No simpler approach achieves the same outcome. The components are individually small and collectively synergistic.

## 4. Opportunity Cost

**What we defer by doing this:**

The "Next" queue contains I07-SDCA (Skills Deploy), I09-SHSL (Shell Script Lint), I04-SLSE (Sales Enablement), I03-PRFR itself, and I14-MATO (Token Optimization). Since this work extends I03-PRFR rather than creating a new initiative, it slots naturally into I03-PRFR's scope when that initiative moves to "Now."

The real question is sequencing I03-PRFR against other "Next" items. I03-PRFR should remain behind the active "Now" items (I12-CRFT, I13-RCHG, I10-ARFE) but this assessment does not change that sequencing -- it enriches what I03-PRFR delivers when its turn comes.

**Risk of NOT doing this:** Prioritization remains intuition-based. Duration estimates stay as point estimates with no confidence intervals. WSJF (the industry standard for flow-based prioritization) remains absent from an otherwise comprehensive prioritization skill.

## 5. Recommendation: GO

**Scope it as an extension to I03-PRFR's charter.** Add three outcomes to the charter:

1. Monte Carlo throughput forecaster script (Python, CLI, uses git commit history as data source)
2. WSJF framework reference + integration into portfolio_prioritizer.py
3. AI-pace calibration reference doc + optional calibration mode in the forecaster

**Do NOT create a new initiative.** This is a natural Phase 2 of I03-PRFR, not a separate initiative. The charter's "Outcomes (sequenced)" table should gain items 7-9.

**Sequencing:** Remains in "Next" with I03-PRFR. When I03-PRFR moves to "Now," execute the existing outcomes 1-6 first, then 7-9. The research report is already done, reducing planning overhead when execution begins.

**Pre-conditions satisfied:**
- Research complete (algorithm, inputs/outputs, implementation spec)
- Historical data available (15 initiatives with commit history)
- Skill structure exists (prioritization-frameworks already built through outcome 6)
- No blocking dependencies on "Now" items
