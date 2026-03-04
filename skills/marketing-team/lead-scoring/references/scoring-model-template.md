# Lead Scoring Model Template

## Dimension Weight Allocation

| Dimension | Weight | What It Measures | Example Signals |
|-----------|--------|-----------------|-----------------|
| Demographic | 20-30% | Person-level fit | Job title, seniority, department |
| Firmographic | 15-25% | Company-level fit | Size, industry, revenue, funding |
| Behavioral | 30-40% | Buying intent | Page visits, downloads, demo requests |
| Engagement | 15-25% | Relationship depth | Email clicks, webinar attendance, events |

**Total must equal 100%.** Adjust weights based on your data — if behavioral signals are the strongest predictor of conversion, weight them higher.

## Scoring Rubric

### Demographic Dimension (Example: 25% weight)

| Signal | 10 (Perfect) | 7-9 (Strong) | 4-6 (Moderate) | 1-3 (Weak) | 0 (Disqualify) |
|--------|-------------|--------------|----------------|------------|----------------|
| Job Title | VP/C-level in target dept | Director in target dept | Manager in target dept | IC in target dept | Intern, student |
| Seniority | Decision maker | Budget influencer | Technical evaluator | End user | No relevance |
| Department | Primary buyer dept | Adjacent dept | Related dept | Unrelated dept | N/A |

### Firmographic Dimension (Example: 20% weight)

| Signal | 10 (Perfect) | 7-9 (Strong) | 4-6 (Moderate) | 1-3 (Weak) | 0 (Disqualify) |
|--------|-------------|--------------|----------------|------------|----------------|
| Company Size | ICP sweet spot | Adjacent range | Fringe range | Far outside | Too small/large |
| Industry | Primary vertical | Adjacent vertical | Broad match | Tangential | Excluded industry |
| Revenue/Funding | Series B-D / $10-100M | Series A / $5-10M | Seed / $1-5M | Pre-seed | N/A |
| Geography | Primary market | Secondary market | Tertiary market | Restricted | Embargoed |

### Behavioral Dimension (Example: 35% weight)

| Signal | Points | Rationale |
|--------|--------|-----------|
| Demo request | +15 | Highest intent — actively evaluating |
| Pricing page visit | +10 | Evaluating cost, strong buying signal |
| Free trial signup | +12 | Product engagement intent |
| Case study download | +7 | Researching proof points |
| 3+ website visits in 7 days | +8 | Active research pattern |
| Product documentation view | +6 | Technical evaluation signal |
| Blog post read | +3 | Awareness-stage interest |
| Homepage visit only | +1 | Passive interest |

### Engagement Dimension (Example: 20% weight)

| Signal | Points | Rationale |
|--------|--------|-----------|
| Webinar attendance (live) | +8 | Active time investment |
| Email reply | +7 | Direct engagement |
| Free trial active usage | +12 | Product-qualified signal |
| 3+ email opens in 30 days | +5 | Consistent interest |
| Social media interaction | +3 | Brand awareness |
| Webinar registration (no-show) | +4 | Interest without commitment |
| Email open (single) | +1 | Minimal signal |

## Threshold Tier Definitions

| Score Range | Tier | Status | Routing | SLA |
|------------|------|--------|---------|-----|
| 90-100 | Hot Lead | Immediate sales | Direct to SDR | 1 hour |
| 75-89 | SQL | Sales-ready | SDR queue | 24 hours |
| 50-74 | MQL | Marketing-ready | Nurture sequence | 48 hours |
| 25-49 | Cold | Low priority | Long-term drip | Weekly batch |
| 0-24 | Disqualify | Not a fit | Remove from active | N/A |

## Score Decay Schedule

| Inactivity Period | Decay Rate | Applied To |
|-------------------|-----------|------------|
| 0-14 days | None | — |
| 15-30 days | -5 points/week | Behavioral + Engagement |
| 31-60 days | -10 points/week | Behavioral + Engagement |
| 61-90 days | -15 points/week | Behavioral + Engagement |
| 90+ days | Reset to 0 | Behavioral + Engagement only |

**Note:** Demographic and firmographic scores never decay — they represent static fit criteria.

## Recency Multipliers

| Activity Recency | Multiplier | Applied To |
|-----------------|------------|------------|
| Last 7 days | 1.5x | Behavioral + Engagement scores |
| 8-30 days | 1.0x | Standard weighting |
| 31-60 days | 0.7x | Reduced weight |
| 61+ days | 0.3x | Minimal weight |

## Routing Rules Template

```
IF score >= 90 THEN
  route_to: SDR (round-robin, Tier 1 queue)
  sla: 1 hour
  notification: Slack alert + email
  priority: URGENT

IF score >= 75 AND score < 90 THEN
  route_to: SDR (round-robin, standard queue)
  sla: 24 hours
  notification: CRM task
  priority: HIGH

IF score >= 50 AND score < 75 THEN
  route_to: Marketing automation
  action: Enroll in nurture sequence
  sequence: Based on behavioral signals (product-led vs content-led)
  priority: MEDIUM

IF score >= 25 AND score < 50 THEN
  route_to: Marketing automation
  action: Enroll in long-term drip
  review: Monthly batch review for re-scoring
  priority: LOW

IF score < 25 THEN
  route_to: Disqualify pool
  action: Remove from active campaigns
  review: Quarterly cleanup
  priority: NONE
```

## Calibration Checklist

Run this checklist monthly for the first quarter, then quarterly:

- [ ] **Score distribution** — Are scores normally distributed? (If >50% are MQL, threshold may be too low)
- [ ] **Conversion correlation** — Do higher scores correlate with higher win rates? (Target: r > 0.5)
- [ ] **False positive rate** — What % of SQL-scored leads are rejected by sales? (Target: <20%)
- [ ] **False negative rate** — Are closed-won deals coming from low-scored leads? (Indicates missing signals)
- [ ] **Decay effectiveness** — Are stale leads being appropriately decayed? (Check 60+ day inactive pool)
- [ ] **Sales feedback** — Does sales agree with lead quality at each tier? (Bi-weekly check-in)
- [ ] **Signal validation** — Are behavioral signals still predictive? (e.g., pricing page still correlates with intent?)
- [ ] **Threshold adjustment** — Do thresholds need recalibration based on pipeline volume?
- [ ] **New signals** — Are there new behavioral signals to add? (new product features, new content types)
- [ ] **Weight rebalancing** — Do dimension weights still reflect predictive power?
