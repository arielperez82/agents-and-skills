# AI-Pace Calibration

Calibrate effort estimates for AI-assisted (agent-augmented) development. Default effort frameworks assume solo human development measured in person-weeks. Claude-assisted delivery runs 5-10x faster, distorting any framework that uses effort as a denominator (WSJF job_size, RICE effort, capacity planning).

This reference provides a repeatable protocol for measuring actual throughput and feeding it into forecasting tools.

## Data Collection Protocol

Use `git_throughput_extractor.py` to extract delivery throughput from repository history.

```bash
python3 prioritization-frameworks/scripts/git_throughput_extractor.py \
  --repo-path <path> --output json > throughput.json
```

**Collection rules:**

| Rule | Guidance |
|------|----------|
| Minimum sample | 4-6 weeks of history for reliable calibration |
| Maximum window | 6 months (older data may not reflect current tooling or pace) |
| Zero-throughput periods | Include weekends, holidays, gaps. They represent real variability. |
| Segment by type | If commit messages follow `type(scope):` convention, segment by initiative size/type for finer calibration |
| AI vs human commits | Both count. The unit is items delivered, not human effort hours. |

## Baseline Calculation

**Central tendency:** Use median throughput per period (more robust than mean for skewed distributions).

**Variance analysis:**
- High variance = less predictable forecasts. Widen confidence intervals.
- Low variance = more reliable forecasts. Tighter intervals acceptable.

**Trend detection:** Compute a 3-period moving average. Classify as:
- Improving: latest 3-period MA exceeds prior by >10%
- Stable: within +/-10%
- Declining: latest 3-period MA below prior by >10%

A declining trend may indicate tooling issues, increased complexity, or team changes. Investigate before forecasting.

## Calibration Data: Size-to-Delivery Mapping

Observed delivery pace for Claude-assisted development. Use as starting rubric; replace with your own data after 4-6 weeks.

| Size | Description | Typical delivery |
|------|-------------|-----------------|
| Trivial | Config change, field mapping | 0.5 day or less |
| Small | New endpoint, extend existing pattern | 0.5-1 day |
| Medium | New component following established patterns | 1-2 days |
| Large | New domain, new infrastructure pattern | 2-4 days |
| Unknown | Unconfirmed data source, requires spike | Spike (0.5-1 day) then re-estimate |

These replace traditional person-week estimates in WSJF job_size and similar denominators.

## Calibration Workflow

### When to recalibrate

- New team member joins or leaves
- New AI tooling adopted (e.g., model upgrade, new agent capabilities)
- Process change (new review gates, CI changes, repo restructure)
- Observed delivery consistently mismatches forecasts (>30% error over 3+ items)

### How to recalibrate

1. Re-run the extractor over the most recent 4-6 weeks:
   ```bash
   python3 prioritization-frameworks/scripts/git_throughput_extractor.py \
     --repo-path <path> --output json > throughput-new.json
   ```
2. Compare the new throughput distribution to the prior baseline (median, variance, trend).
3. If median shifted by >20%, update the baseline.

### What to adjust

- **Monte Carlo throughput input:** Replace the throughput array fed to `monte_carlo_forecast.py`.
- **WSJF job_size estimates:** Shift the size rubric anchors to match observed pace.
- **Capacity planning:** Update sprint/cycle capacity assumptions.

## Common Pitfalls

**Conflating effort with throughput.** AI-generated and human-generated commits both count as throughput. The forecasting unit is items delivered per period, not human hours spent. Do not discount AI-assisted items.

**Initiative complexity variance.** A "medium" initiative in a familiar domain may be "large" in unfamiliar territory. Segment calibration data by domain when possible.

**Seasonal patterns.** Holiday weeks, conference weeks, and on-call rotations produce zero-throughput periods. Include these in the distribution rather than filtering them out -- they affect real delivery timelines.

**Over-relying on averages.** Mean throughput hides the shape of the distribution. A team averaging 3 items/week but ranging from 0-8 is very different from one averaging 3 but ranging from 2-4. Always use the full distribution via Monte Carlo rather than point estimates.

**Stale baselines.** AI tooling capabilities change rapidly. A baseline from 3 months ago may significantly underestimate current pace. Recalibrate quarterly at minimum.

## Integration with Forecasting Tools

### End-to-end flow

```bash
# 1. Extract throughput
python3 prioritization-frameworks/scripts/git_throughput_extractor.py \
  --repo-path <path> --output json > throughput.json

# 2. Run Monte Carlo forecast
python3 prioritization-frameworks/scripts/monte_carlo_forecast.py \
  --throughput throughput.json --remaining <n>

# 3. Use WSJF with calibrated job_size
#    Replace person-week anchors with the size-to-delivery table above
```

### WSJF job_size calibration

Map the size rubric to the WSJF 1-10 scale using observed delivery pace:

| Size | Delivery | WSJF job_size |
|------|----------|---------------|
| Trivial | 0.5 day | 1 |
| Small | 0.5-1 day | 2 |
| Medium | 1-2 days | 3-5 |
| Large | 2-4 days | 5-8 |
| Unknown | Spike first | 8-10 (until spike completes) |

After spike, re-score with actual size estimate.

---

**Target audience:** implementation-planner and product-director agents calibrating delivery forecasts.

**Related references:** [wsjf-framework.md](wsjf-framework.md), [portfolio-allocation-framework.md](portfolio-allocation-framework.md)

**Related tools:** `git_throughput_extractor.py`, `monte_carlo_forecast.py`
