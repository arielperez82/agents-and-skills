# Research Report: Monte Carlo Simulation for Throughput Forecasting

**Date:** 2026-02-20
**Sources:** 4 (blog post, GitHub repo, 2 Excel spreadsheets)

## Executive Summary

Monte Carlo forecasting for software delivery uses historical throughput data to simulate thousands of possible futures, producing probability distributions of completion dates. The core algorithm is dead simple: randomly sample from historical throughput, subtract from remaining work each period, repeat until done, record how many periods it took. Do this 500-10,000 times, then use PERCENTILE to extract confidence levels (50th, 85th, 95th).

All four sources converge on the same fundamental approach with varying levels of sophistication. The simplest implementation (ZakLaughton repo) is ~40 lines of TypeScript. The most complex (Troy Magennis spreadsheets) adds story splitting, scope uncertainty, risk events, focus percentage, complexity multipliers, and monthly throughput adjustments -- all of which are optional enhancements.

## Sources Analyzed

1. **Blog post** - Kini Abulatov (2025/09) - conceptual overview of MCS for throughput forecasting
2. **GitHub repo** - ZakLaughton/monte-carlo-forecaster - TypeScript React implementation
3. **Excel: Multiple Feature Cut Line Forecaster** - Troy Magennis (FocusedObjective.com)
4. **Excel: Throughput Forecaster (Single Feature)** - Troy Magennis (FocusedObjective.com)

---

## 1. INPUTS

### Required (minimum viable)

| Input | Type | Description |
|-------|------|-------------|
| `throughputHistory` | `number[]` | Items completed per period (week/sprint/day). Historical data. |
| `remainingItems` | `number` | Total items to forecast completion of |

### Optional (enhanced accuracy)

| Input | Type | Description | Source |
|-------|------|-------------|--------|
| `startDate` | `Date` | Forecast start date, for converting periods to calendar dates | All |
| `iterationCount` | `number` | Simulation runs, default 10,000 | Repo: 10000, Spreadsheets: 500 |
| `storySplitRate` | `{low, high}` | Multiplier for scope growth from story splitting (1.0 = no split) | Spreadsheets |
| `scopeUncertainty` | `{low, high}` | Range for remaining item count when exact count unknown | Throughput sheet |
| `complexityMultiplier` | `{low, high}` | Scope adjustment based on understanding level (1x-3x) | Cut Line sheet |
| `focusPercentage` | `number` | Team allocation to this work (0.25-1.0) | Spreadsheets |
| `risks` | `Array<{probability, lowImpact, highImpact}>` | Discrete risk events that may add scope | Throughput sheet |
| `monthlyAdjustments` | `Record<month, multiplier>` | Throughput scaling by month (holidays, ramp-up) | Cut Line sheet |
| `throughputEstimate` | `{low, high, mostLikely?}` | Manual estimate when no historical data exists | Spreadsheets |

### Throughput Data Source Modes (from spreadsheets)

The spreadsheets support two modes controlled by `SamplesOrEstimateFlag`:
- **"Data"**: Uses historical samples via `INDEX(Samples, RANDBETWEEN(1, TotalCount), 0)` -- randomly picks from actual history
- **"Estimate"**: Uses `RANDBETWEEN(low, high)` or triangle distribution when mostLikely provided

---

## 2. CORE ALGORITHM

### Simplest Form (from ZakLaughton repo, ~40 lines)

```typescript
type SimulateDeliveryWeeksProps = {
  velocityHistory: number[];
  projectSize: number;
  iterationCount?: number;
};

const simulateDeliveryWeeks = ({
  velocityHistory,
  projectSize,
  iterationCount = 10000,
}: SimulateDeliveryWeeksProps): number[] => {
  if (projectSize <= 0) return [];
  if (velocityHistory.length === 0) return [];

  const results: number[] = [];

  for (let i = 0; i < iterationCount; i++) {
    let remaining = projectSize;
    let weeks = 0;

    while (remaining > 0) {
      weeks++;
      // Pick random historical throughput value
      const randomIndex = Math.floor(Math.random() * velocityHistory.length);
      remaining -= velocityHistory[randomIndex];
    }

    results.push(weeks);
  }

  return results; // Array of completion durations (in periods)
};
```

### Enhanced Form (from Throughput Forecaster spreadsheet)

Per trial row, the spreadsheet does:

1. **Randomize total scope**: `CEILING(RANDBETWEEN(scopeLow, scopeHigh) * randomSplitRate, 1)`
2. **Add risk events**: For each risk, `IF(RAND() <= probability, RANDBETWEEN(impactLow, impactHigh), 0)`
3. **Simulate periods**: Each period subtracts a random throughput sample: `remaining = MAX(0, remaining - randomThroughput * focusPercentage)`
4. **Find completion period**: `MATCH(0, trialRow, 0) - 1` (first period where remaining hits 0)
5. **Convert to date**: `startDate + (completionPeriod * daysPerPeriod)`

Key formula (period-by-period countdown):
```
remaining[n] = MAX(0, remaining[n-1] - throughputSample * focusPercentage)
```

Where `throughputSample` is either:
- `INDEX(Samples, RANDBETWEEN(1, TotalCount), 0)` -- random pick from history
- `RANDBETWEEN(low, high)` -- uniform random from estimate range
- Triangle distribution sample when mostLikely is provided

### Multi-Feature Variant (Cut Line Forecaster)

Runs cumulative forecasting across multiple features:
- Each column represents cumulative throughput needed for features 1..N
- `Goal_N = Goal_(N-1) + CEILING(RANDBETWEEN(featureLow, featureHigh) * splitRate, 1)`
- Result columns track cumulative periods needed per feature
- Enables "cut line" analysis: given X periods, which features will likely complete?

---

## 3. OUTPUTS

### Primary Output: Percentile Table

```
PERCENTILE(completionPeriods, likelihood)
```

Standard output format (from Throughput Forecaster):

| Likelihood | Duration (periods) | Date |
|------------|-------------------|------|
| 100% | PERCENTILE(results, 1.0) | startDate + duration * daysPerPeriod |
| 95% | PERCENTILE(results, 0.95) | ... |
| 90% | PERCENTILE(results, 0.90) | ... |
| 85% | PERCENTILE(results, 0.85) | ... |
| 80% | PERCENTILE(results, 0.80) | ... |
| 75% | PERCENTILE(results, 0.75) | ... |
| ... | ... | ... |
| 50% | PERCENTILE(results, 0.50) | ... |

### Secondary Outputs

- **Cumulative probability curve** (S-curve): weeks vs P(done), used for charts
- **Min/Max/Median** of simulation results
- **Cut-line analysis** (multi-feature): given target date + likelihood, which features fit?

### Cumulative Odds Calculation (from ZakLaughton repo)

```typescript
type OddsByWeekPoint = {
  weeks: number;
  p: number;    // cumulative probability 0..1
  count: number; // cumulative count
};

function toOddsByWeek(results: number[]): OddsByWeekPoint[] {
  // Count occurrences per week
  const counts = new Map<number, number>();
  for (const w of results) {
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const total = results.length;
  const sortedWeeks = Array.from(counts.keys()).sort((a, b) => a - b);

  let cumulativeCount = 0;
  return sortedWeeks.map((weeks) => {
    cumulativeCount += counts.get(weeks)!;
    return { weeks, count: cumulativeCount, p: cumulativeCount / total };
  });
}
```

### Date Conversion

```typescript
function toCompletionDate(startDate: string, weeks: number): string | null {
  const base = new Date(`${startDate}T00:00:00`);
  const completion = new Date(base);
  completion.setDate(completion.getDate() + weeks * 7);
  return completion.toLocaleDateString();
}
```

---

## 4. KEY IMPLEMENTATION CONSIDERATIONS

### Data Quality
- Include zero-throughput periods (weekends, holidays, sick days) in historical data -- they represent real variability
- Avoid data older than 6 months
- Use calendar days (not working days) as the time unit
- Minimum 4-6 weeks of history for reliable forecasts; 1-2 weeks = low confidence

### Algorithm Simplicity
- The core loop is trivially simple: random sample, subtract, count periods
- 500 trials (spreadsheets) works fine; 10,000 (repo) is better for smooth distributions
- `PERCENTILE` on results array is all you need for confidence levels
- No need for complex statistical distributions -- the historical data IS your distribution

### Scope Uncertainty (the biggest accuracy lever)
- Story split rate (1.0-2.0x) accounts for work items splitting during development
- Scope low/high range captures estimation uncertainty
- Risks as discrete probability events (e.g., 30% chance of 5-10 extra items)
- Complexity multiplier for poorly-understood work

### Architecture Pattern (from ZakLaughton repo)
- Pure function: `(throughputHistory, projectSize, iterations) -> number[]`
- Separate concerns: simulation, statistics, date conversion, UI
- Client-side computation is fine -- 10K iterations is sub-second in JS

### What NOT to Over-Engineer
- Triangle distributions only needed when you have low/high/mostLikely estimate but no data
- Monthly throughput adjustments rarely needed
- Focus percentage only if team genuinely splits time
- Risk events only for known, discrete risks with estimable probability

---

## 5. RISK ASSESSMENT

| Risk | Mitigation |
|------|-----------|
| Too little historical data | Warn users below 4 weeks; allow manual low/high estimates as fallback |
| Stale data | Only use last 6 months; re-run forecasts every 1-2 weeks |
| No WIP limits = unpredictable throughput | Document that MCS reliability depends on somewhat stable throughput patterns |
| Scope creep not modeled | Story split rate and risk events partially address this |
| Stakeholders treat 85% as "guaranteed" | Communication guidance: always present as probability ranges, not promises |

---

## 6. MINIMAL IMPLEMENTATION SPECIFICATION

For a TypeScript implementation, the absolute minimum is:

**Input type:**
```typescript
type ForecastInput = {
  readonly throughputHistory: readonly number[];
  readonly remainingItems: number;
  readonly iterationCount?: number; // default 10000
};
```

**Output type:**
```typescript
type ForecastResult = {
  readonly simulationResults: readonly number[];  // raw period counts
  readonly percentiles: ReadonlyMap<number, number>; // likelihood -> periods
  readonly oddsByPeriod: readonly { period: number; probability: number }[];
};
```

**Core function:** ~30 lines (see Section 2 above).

**Enhancement layers** (add only when needed):
1. Scope uncertainty: `{low, high}` for remaining items
2. Story split rate: `{low, high}` multiplier
3. Risk events: array of `{probability, impactLow, impactHigh}`
4. Focus percentage: single multiplier on throughput
5. Date conversion: `startDate + periods * daysPerPeriod`

---

## Unresolved Questions

1. **Triangle distribution**: The Throughput Forecaster uses a triangle distribution for 3-point estimates (low/mostLikely/high). Is this worth implementing or is uniform RANDBETWEEN sufficient for an MVP?
2. **Throughput period granularity**: Blog recommends daily throughput; spreadsheets use weekly/sprint. Which granularity produces better forecasts for typical software teams?
3. **How many historical data points are statistically sufficient?** Blog says 6 months max window; spreadsheets allow arbitrary sample sizes. Is there a formal lower bound?
