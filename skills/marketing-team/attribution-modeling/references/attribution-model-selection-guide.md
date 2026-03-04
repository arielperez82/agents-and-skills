# Attribution Model Selection Guide

## Quick Selection Flowchart

```text
START: What is your average sales cycle?
  |
  +-- Under 30 days
  |   +-- Limited touchpoint data? --> First-Touch or Last-Touch
  |   +-- Multiple touchpoints tracked? --> Linear
  |
  +-- 30-90 days
  |   +-- Under 5 touchpoints/deal? --> U-Shaped (Position-Based)
  |   +-- 5-15 touchpoints/deal? --> U-Shaped or Time-Decay
  |   +-- 15+ touchpoints/deal? --> W-Shaped
  |
  +-- Over 90 days
      +-- Clear lifecycle stages in CRM? --> W-Shaped
      +-- No lifecycle tracking? --> Time-Decay (then build toward W-Shaped)
```

## Selection Criteria Matrix

| Factor | First-Touch | Last-Touch | Linear | Time-Decay | U-Shaped | W-Shaped |
|--------|:-----------:|:----------:|:------:|:----------:|:--------:|:--------:|
| **Sales cycle <30 days** | Good | Good | OK | - | - | - |
| **Sales cycle 30-90 days** | - | - | OK | Good | Best | Good |
| **Sales cycle 90+ days** | - | - | - | Good | OK | Best |
| **1-2 stakeholders** | Good | Good | Good | Good | Good | OK |
| **3+ stakeholders** | - | - | OK | OK | Good | Best |
| **Data maturity: Low** | Best | Best | - | - | - | - |
| **Data maturity: Medium** | OK | OK | Good | Good | Best | - |
| **Data maturity: High** | - | - | OK | Good | Good | Best |
| **Setup complexity** | Minimal | Minimal | Low | Medium | Medium | High |

**Legend:** Best = ideal fit, Good = works well, OK = acceptable, - = not recommended

## Model Details

### First-Touch

- **Credit allocation:** 100% to the first known interaction
- **Data required:** Source/medium of first visit (UTM or referrer)
- **Implementation:** Set a "first touch" field on lead creation, never overwrite
- **When to use:** Optimizing top-of-funnel spend, early-stage company

### Last-Touch

- **Credit allocation:** 100% to the last interaction before conversion
- **Data required:** Source/medium of converting session
- **Implementation:** Capture UTMs on conversion forms, use most recent campaign in CRM
- **When to use:** Optimizing conversion rate, short sales cycles

### Linear

- **Credit allocation:** Equal credit to every touchpoint (1/N each)
- **Data required:** All touchpoints captured in CRM contact timeline
- **Implementation:** Count touchpoints per deal, divide revenue equally
- **When to use:** First step into multi-touch, when lacking data to weight

### Time-Decay

- **Credit allocation:** Exponential decay from conversion backward
- **Configuration:** Set half-life (7 days = touchpoints 7 days before close get 50% weight)
- **Data required:** Timestamped touchpoints
- **Implementation:** Calculate time delta from each touch to close, apply decay formula
- **When to use:** Long sales cycles where recent touches matter more

### U-Shaped (Position-Based)

- **Credit allocation:** 40% first touch, 40% last touch (before conversion), 20% distributed to middle
- **Data required:** First touch, last touch, and middle touchpoints identified
- **Implementation:** Tag first and last touches, distribute remainder
- **When to use:** Balanced view of demand gen and conversion

### W-Shaped

- **Credit allocation:** 30% first touch, 30% lead creation touch, 30% opportunity creation touch, 10% distributed
- **Data required:** Full lifecycle tracking (first touch, lead creation event, opportunity creation event, all touchpoints)
- **Implementation:** Track lifecycle stage changes in CRM, tag the touchpoint that triggered each transition
- **When to use:** Mature B2B with clear funnel stages

## Implementation Checklist

### Phase 1: Foundation (Week 1-2)

- [ ] Define UTM taxonomy (source, medium, campaign, content, term naming conventions)
- [ ] Audit all marketing channels for UTM compliance
- [ ] Configure CRM to capture touchpoints (form fills, page visits, email clicks, events)
- [ ] Add hidden UTM fields to all conversion forms
- [ ] Create "Original Source" field on contact record (never overwritten after creation)

### Phase 2: Tracking (Week 3-4)

- [ ] Implement first-touch capture (first UTM params saved on lead creation)
- [ ] Implement last-touch capture (most recent UTM params before conversion)
- [ ] Configure lifecycle stage tracking (Lead, MQL, SQL, Opportunity, Customer)
- [ ] Set up offline tracking for events, direct mail, sales-sourced
- [ ] Add self-reported attribution field to demo request and contact forms

### Phase 3: Reporting (Week 5-6)

- [ ] Build channel attribution report (pipeline and revenue by source/medium)
- [ ] Build campaign attribution report (ROI by campaign)
- [ ] Build content attribution report (which assets influence deals)
- [ ] Create self-reported vs software-attributed comparison dashboard
- [ ] Set up monthly reporting cadence

### Phase 4: Optimization (Ongoing)

- [ ] Run chosen model for 3 months before making budget decisions
- [ ] Compare multiple models in parallel (at minimum: first-touch + chosen multi-touch)
- [ ] Calibrate model quarterly with sales team feedback
- [ ] Audit data quality monthly (UTM compliance, touchpoint capture rate)
- [ ] Document and share attribution insights with leadership quarterly

## Common Pitfalls to Avoid

| Pitfall | Why It Happens | Fix |
|---------|---------------|-----|
| Choosing the most complex model first | Desire for accuracy | Start simple, add complexity as data matures |
| Treating attribution as truth | Model outputs look precise | Label all reports as "modeled" — they are estimates |
| Ignoring dark funnel | Software only tracks clicks | Add self-reported attribution to every analysis |
| Over-indexing on paid | Easiest to track | Weight organic channels using self-reported data |
| Never recalibrating | Set-and-forget | Review model accuracy quarterly |
| Siloed reporting | Marketing owns attribution alone | Include sales perspective in all attribution reviews |

## Self-Reported Attribution Guide

### Recommended Form Field

**Label:** "How did you first hear about us?"

**Format:** Dropdown + Other (free text)

**Options:**

1. Google / Search engine
2. LinkedIn (organic post, ad, or profile)
3. Colleague or friend recommendation
4. Podcast
5. Blog article or content
6. Conference or event
7. Community (Slack, Discord, Reddit)
8. Review site (G2, Capterra, TrustRadius)
9. Newsletter
10. Other: [free text]

### Analysis Framework

Compare self-reported with software-attributed monthly:

| Channel | Software-Attributed % | Self-Reported % | Gap | Action |
|---------|:---------------------:|:---------------:|:---:|--------|
| Paid Search | 35% | 20% | -15% | Software over-credits (often captures existing intent) |
| LinkedIn | 15% | 25% | +10% | Dark social browsing not tracked — invest more |
| Podcasts | 0% | 18% | +18% | Invisible to software — major dark funnel channel |
| Referral | 5% | 22% | +17% | Word of mouth undervalued by software |

Use gaps to adjust budget allocation and model weighting.

---

**Usage:** Use this guide to select and implement the right attribution model for your organization. Start with the Quick Selection Flowchart, validate against the Selection Criteria Matrix, then follow the Implementation Checklist.
