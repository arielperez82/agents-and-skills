# Forecast Review Template

Practical templates for structured forecast reviews at weekly, monthly, and quarterly cadences. Use these templates to maintain forecast discipline and track accuracy over time.

## Weekly Commit Call Format

Use this template for the weekly rep-to-manager forecast review. Run every Monday or Tuesday, 15-30 minutes per rep.

### Header

```
COMMIT CALL: [Rep Name]
PERIOD: [Quarter] Week [N] ([Date])
QUOTA: $[Amount]
CLOSED-WON YTD (This Quarter): $[Amount] ([X]% of quota)
REMAINING TARGET: $[Amount]
```

### Current Quarter Deals by Category

#### Commit (High Confidence -- 85-95%)

Deals the rep is confident will close this period. Each must have specific evidence.

| Deal | Value | Stage | Expected Close | Evidence for Commit |
|------|-------|-------|---------------|-------------------|
| [Company A] | $[XXK] | [Stage] | [Date] | [e.g., Contract in legal review, decision-maker confirmed] |
| [Company B] | $[XXK] | [Stage] | [Date] | [e.g., Procurement process started, PO expected this week] |
| **Commit Total** | **$[XXK]** | | | |

#### Best Case (Probable -- 50-70%)

Deals progressing well that could close this period if conditions hold.

| Deal | Value | Stage | Expected Close | What Needs to Happen |
|------|-------|-------|---------------|---------------------|
| [Company C] | $[XXK] | [Stage] | [Date] | [e.g., Final budget approval from CFO] |
| [Company D] | $[XXK] | [Stage] | [Date] | [e.g., Technical validation completing this week] |
| **Best Case Total** | **$[XXK]** | | | |

#### Upside (Possible -- 20-40%)

Deals that could close this period under favorable conditions.

| Deal | Value | Stage | Expected Close | Conditions Required |
|------|-------|-------|---------------|-------------------|
| [Company E] | $[XXK] | [Stage] | [Date] | [e.g., Budget released early, champion pushes timeline] |
| **Upside Total** | **$[XXK]** | | | |

### Forecast Summary

```
FORECAST SUMMARY:
  Closed-Won (to date):     $[XXK]
  + Commit:                  $[XXK]
  = Expected:                $[XXK] ([X]% of quota)

  + Best Case (x 0.60):     $[XXK]
  = Best Case Total:         $[XXK] ([X]% of quota)

  + Upside (x 0.30):        $[XXK]
  = Upside Total:            $[XXK] ([X]% of quota)

  CALL: [On track / At risk / Behind] to hit $[Quota]
```

### Manager Challenge Questions

Use these to validate rep forecast calls:

- **For each Commit deal:** "What specific event confirms this will close? Who said yes, and when?"
- **For each Best Case deal:** "What is the one thing that could prevent this from closing? What is your plan if that happens?"
- **For deals that moved categories:** "What changed since last week to move this from Best Case to Commit (or vice versa)?"
- **For close dates that slipped:** "Is the new date based on buyer-confirmed timeline or your hope?"

---

## Pipeline Coverage Calculator

Use this template to assess whether sufficient pipeline exists to hit quota.

### Current Quarter Coverage

```
PIPELINE COVERAGE ANALYSIS
Period: [Quarter / Month]
As of: [Date]

QUOTA TARGET:                              $[Amount]
CLOSED-WON (to date):                     $[Amount]
REMAINING TARGET:                          $[Amount]

OPEN PIPELINE (raw value):                 $[Amount]
COVERAGE RATIO (raw):                      [X.X]x

WEIGHTED PIPELINE:
  Qualification  ([N] deals x 10%):       $[Amount]
  Discovery      ([N] deals x 20%):       $[Amount]
  Proposal       ([N] deals x 50%):       $[Amount]
  Negotiation    ([N] deals x 75%):       $[Amount]
  Verbal Commit  ([N] deals x 90%):       $[Amount]
  TOTAL WEIGHTED:                          $[Amount]

WEIGHTED COVERAGE RATIO:                   [X.X]x

VERDICT: [Strong (4x+) / Healthy (3-4x) / At Risk (2-3x) / Critical (<2x)]
```

### Required Pipeline Calculation

When coverage is below target, calculate how much new pipeline is needed.

```
PIPELINE GAP ANALYSIS

Remaining Quota Target:                    $[Amount]
Required Coverage (3.5x):                 $[Amount]  (target x 3.5)
Current Open Pipeline:                     $[Amount]
PIPELINE GAP:                              $[Amount]

Required Pipeline Generation:
  This month:                              $[Amount]
  Per week:                                $[Amount]
  Per rep per week:                        $[Amount]

To close the gap, each rep needs to generate
$[Amount] in new qualified pipeline per week.
```

### Next Quarter Coverage (Forward Look)

```
NEXT QUARTER COVERAGE
Period: [Next Quarter]
Quota Target: $[Amount]

Pipeline already created for next quarter:  $[Amount]
Expected pipeline from current generation:  $[Amount]
  (Based on [X] new deals/week at $[X]K avg)
PROJECTED TOTAL PIPELINE:                   $[Amount]
PROJECTED COVERAGE:                         [X.X]x

VERDICT: [On pace / Behind / Needs acceleration]
```

---

## Forecast Accuracy Tracking Table

Track forecast accuracy over time to identify systematic biases and improve prediction quality.

### Weekly Accuracy Tracker

| Week | Forecast (Commit) | Forecast (Best Case) | Forecast (Upside) | Forecast (Blended) | Actual Closed | Accuracy | Direction |
|------|-------------------|---------------------|-------------------|-------------------|--------------|----------|-----------|
| W1 | $[XXK] | $[XXK] | $[XXK] | $[XXK] | $[XXK] | [X]% | [Over/Under/Accurate] |
| W2 | $[XXK] | $[XXK] | $[XXK] | $[XXK] | $[XXK] | [X]% | [Over/Under/Accurate] |
| W3 | $[XXK] | $[XXK] | $[XXK] | $[XXK] | $[XXK] | [X]% | [Over/Under/Accurate] |
| W4 | $[XXK] | $[XXK] | $[XXK] | $[XXK] | $[XXK] | [X]% | [Over/Under/Accurate] |

**Accuracy formula:** `1 - ABS(Forecast - Actual) / Actual`

**Direction:** Over = forecast exceeded actual (optimism bias). Under = actual exceeded forecast (sandbagging). Accurate = within 10%.

### Monthly Accuracy Tracker

| Month | Forecast (Start of Month) | Forecast (Mid-Month) | Actual Closed | Start Accuracy | Mid Accuracy | Variance | Bias Pattern |
|-------|---------------------------|---------------------|--------------|---------------|-------------|----------|-------------|
| [Month 1] | $[XXK] | $[XXK] | $[XXK] | [X]% | [X]% | $[+/-XXK] | [Over/Under/Neutral] |
| [Month 2] | $[XXK] | $[XXK] | $[XXK] | [X]% | [X]% | $[+/-XXK] | [Over/Under/Neutral] |
| [Month 3] | $[XXK] | $[XXK] | $[XXK] | [X]% | [X]% | $[+/-XXK] | [Over/Under/Neutral] |
| **Quarter** | **$[XXK]** | **$[XXK]** | **$[XXK]** | **[X]%** | **[X]%** | **$[+/-XXK]** | **[Pattern]** |

### Rep-Level Accuracy

| Rep | Q Forecast | Q Actual | Accuracy | Bias | Trend (vs. Last Quarter) |
|-----|-----------|---------|----------|------|--------------------------|
| [Rep A] | $[XXK] | $[XXK] | [X]% | [Over/Under] | [Improving/Stable/Declining] |
| [Rep B] | $[XXK] | $[XXK] | [X]% | [Over/Under] | [Improving/Stable/Declining] |
| [Rep C] | $[XXK] | $[XXK] | [X]% | [Over/Under] | [Improving/Stable/Declining] |
| **Team** | **$[XXK]** | **$[XXK]** | **[X]%** | **[Pattern]** | **[Trend]** |

### Accuracy Improvement Actions

Based on accuracy data, identify corrections:

| Issue Detected | Root Cause | Correction | Owner | Target Date |
|---------------|-----------|------------|-------|-------------|
| [e.g., Team overforecasts by 15% consistently] | [e.g., Reps categorize Best Case as Commit] | [e.g., Require specific evidence checklist for Commit calls] | [Manager] | [Date] |
| [e.g., Rep B underforecasts by 20%] | [e.g., Sandbagging to create easy beats] | [e.g., Compare rep calls to weighted pipeline; challenge large gaps] | [Manager] | [Date] |

---

## Deal Movement Tracker

Track how deals move between forecast reviews to spot trends and catch problems early.

### Week-Over-Week Movement

```
DEAL MOVEMENT REPORT
Period: [Week N] to [Week N+1]
Date: [Date]
```

#### New Deals Added to Pipeline

| Deal | Value | Stage | Source | Owner | Expected Close |
|------|-------|-------|--------|-------|---------------|
| [Company] | $[XXK] | [Stage] | [Source] | [Rep] | [Date] |
| **Total New** | **$[XXK]** | | | | |

#### Deals Advanced (Moved to Later Stage)

| Deal | Value | Previous Stage | New Stage | Days in Previous | Owner |
|------|-------|---------------|-----------|-----------------|-------|
| [Company] | $[XXK] | [From] | [To] | [N days] | [Rep] |
| **Total Advanced** | **$[XXK]** | | | | |

#### Deals Slipped (Close Date Pushed or Category Downgraded)

| Deal | Value | Change | Previous | New | Reason | Owner |
|------|-------|--------|----------|-----|--------|-------|
| [Company] | $[XXK] | Close date | [Old Date] | [New Date] | [Reason] | [Rep] |
| [Company] | $[XXK] | Category | Commit | Best Case | [Reason] | [Rep] |
| **Total Slipped** | **$[XXK]** | | | | | |

#### Deals Lost (Closed-Lost or Removed from Pipeline)

| Deal | Value | Stage Lost At | Loss Reason | Days in Pipeline | Owner |
|------|-------|-------------|-------------|-----------------|-------|
| [Company] | $[XXK] | [Stage] | [Reason] | [N days] | [Rep] |
| **Total Lost** | **$[XXK]** | | | | |

#### Deals Won (Closed-Won Since Last Review)

| Deal | Value | Days to Close | Source | Owner |
|------|-------|-------------|--------|-------|
| [Company] | $[XXK] | [N days] | [Source] | [Rep] |
| **Total Won** | **$[XXK]** | | | |

### Net Pipeline Change Summary

```
NET PIPELINE CHANGE:
  Starting Pipeline:        $[X.XM] ([N] deals)
  + New:                    +$[XXK] ([N] deals)
  + Won (removed):          -$[XXK] ([N] deals)
  + Lost (removed):         -$[XXK] ([N] deals)
  + Value Changes:          +/-$[XXK]
  = Ending Pipeline:        $[X.XM] ([N] deals)

  NET CHANGE:               +/-$[XXK] (+/-[N] deals)

  Pipeline Created:         $[XXK]
  Pipeline Consumed:        $[XXK] (won + lost)
  CREATION RATIO:           [X.X]x (target: >1.0x to grow pipeline)
```

### Movement Patterns to Watch

| Pattern | Signal | Action |
|---------|--------|--------|
| More deals slipping than advancing | Pipeline is decelerating; forecast at risk | Investigate blockers; increase manager deal coaching |
| High loss rate from late stages | Qualification or competitive issues | Review loss reasons; tighten stage exit criteria |
| Low new deal creation | Future pipeline at risk | Increase prospecting activity; check marketing lead volume |
| Close dates clustering at period end | Hockey stick pattern; deals may slip to next period | Validate close dates with buyer-confirmed evidence |
| Large deals dominating movement | Forecast depends on a few big bets | Diversify pipeline; track concentration risk |
