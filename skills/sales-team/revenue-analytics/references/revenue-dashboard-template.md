# Revenue Dashboard Templates

This reference provides detailed dashboard layouts for three audiences, each with specific metrics, visualization recommendations, and benchmark targets. These templates complement the Revenue Analytics skill by providing ready-to-implement dashboard designs.

**Design principle:** Every metric on a dashboard must drive a decision. If no one will act on a number, remove it.

## Executive Dashboard (Monthly Cadence)

The executive dashboard provides the CEO, CRO, and VP Sales with a monthly view of revenue health, GTM efficiency, and forward-looking indicators. It balances lagging indicators (what happened) with leading indicators (what will happen).

**Refresh:** Monthly, within 5 business days of month-end close.

**Audience:** CEO, CRO, VP Sales, VP Marketing, CFO.

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                     EXECUTIVE REVENUE DASHBOARD                     │
│                        Month / Year                                 │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│  ARR         │  Net New ARR │  NDR         │  Customers            │
│  $X.XM       │  +$XXK       │  XXX%        │  XXX                  │
│  ▲ X% MoM    │  vs plan: X% │  vs LQ: Xpp  │  +XX net this month  │
├──────────────┴──────────────┴──────────────┴───────────────────────┤
│                                                                     │
│  ARR Waterfall (Bar Chart)                                          │
│  ┌────┐                                          ┌────┐            │
│  │Start│ + New + Expansion - Contraction - Churn = │End │           │
│  └────┘                                          └────┘            │
│                                                                     │
├─────────────────────────────┬───────────────────────────────────────┤
│  GTM Efficiency             │  Funnel Summary                       │
│                             │                                       │
│  LTV:CAC      X.Xx  [●]    │  MQLs       XXX  (▲/▼ X% MoM)       │
│  CAC Payback  XX mo  [●]   │  SQLs       XXX  (▲/▼ X% MoM)       │
│  Magic Number X.XX  [●]    │  New Opps   XXX  (▲/▼ X% MoM)       │
│  Sales Eff.   X.Xx  [●]    │  Closed-Won XX   (▲/▼ X% MoM)       │
│                             │  Full-Funnel X.X% (▲/▼ X.Xpp MoM)  │
│  [●] = Green/Yellow/Red     │                                       │
├─────────────────────────────┴───────────────────────────────────────┤
│  Cohort NDR Trend (Line Chart)                                      │
│                                                                     │
│  Plot last 6 cohorts, NDR at month 3, 6, 9, 12                     │
│  Highlight cohorts trending below 100% NDR                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│  Channel Performance (Horizontal Bar Chart)                         │
│                                                                     │
│  Organic    ████████████████  LTV:CAC 5.2x  CAC $3.2K             │
│  Outbound   ██████████████    LTV:CAC 3.8x  CAC $12K              │
│  Referral   ████████████████  LTV:CAC 6.1x  CAC $2.8K             │
│  Paid       ████████████      LTV:CAC 2.4x  CAC $9.5K             │
│  Events     ██████████        LTV:CAC 1.8x  CAC $18K              │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Metrics Detail

| Metric | Definition | Target | Visualization | Benchmark |
|--------|-----------|--------|---------------|-----------|
| ARR | Annual Recurring Revenue at month-end | Per plan | Large number with MoM trend arrow | Growth: 50-100% YoY ($5-50M) |
| Net New ARR | New + Expansion - Contraction - Churn ARR | Per plan | Number with plan attainment % | Positive and growing MoM |
| NDR | Net Dollar Retention (trailing 12 months) | > 110% | Number with QoQ trend | 110-130% (good to best-in-class) |
| Total Customers | Active paying customers | Per plan | Number with net adds this month | Growing; net adds > 0 |
| ARR Waterfall | Decomposition of ARR movement | N/A | Waterfall bar chart | Expansion > Contraction + Churn |
| LTV:CAC | Customer LTV / CAC | 3-5x | Gauge or number with color | < 3x red, 3-5x green, > 5x yellow |
| CAC Payback | Months to recover CAC | < 12 months | Number with color | < 12 green, 12-18 yellow, > 18 red |
| Magic Number | Net New ARR / Prior Q S&M Spend | > 0.75 | Number with color | < 0.5 red, 0.5-0.75 yellow, > 0.75 green |
| Sales Efficiency | Net New ARR / Sales Cost | > 1.0x | Number with color | < 0.5 red, 0.5-1.0 yellow, > 1.0 green |
| Funnel Summary | Stage-by-stage conversion | Per plan | Funnel visualization or numbers | See funnel benchmarks in SKILL.md |
| Cohort NDR Trend | NDR curves by acquisition cohort | > 100% all cohorts | Multi-line chart | Newer cohorts should match or exceed older |
| Channel Performance | LTV:CAC and CAC by channel | LTV:CAC > 3x per channel | Horizontal bar with annotations | Shift budget toward highest LTV:CAC |

### Recommended Visualizations

- **ARR Waterfall:** Waterfall bar chart showing Start ARR, +New, +Expansion, -Contraction, -Churn, =End ARR. Green bars for adds, red for subtracts.
- **NDR Trend:** Line chart showing trailing-12-month NDR over the past 6-12 months. Add a horizontal reference line at 100%.
- **Cohort Curves:** Multi-line chart with one line per cohort (last 6 months). X-axis is months since acquisition, Y-axis is cumulative NDR.
- **Channel ROI:** Horizontal bar chart sorted by LTV:CAC descending. Annotate each bar with CAC and LTV:CAC values.
- **GTM Efficiency Gauges:** Four numbers (LTV:CAC, CAC Payback, Magic Number, Sales Efficiency) with color-coded status indicators.

## Board-Level Metrics View (Quarterly Cadence)

The board dashboard distills the business to 5-6 metrics that answer: "Is this business growing efficiently and sustainably?" Board members have limited time and need signal, not noise.

**Refresh:** Quarterly, prepared 3-5 business days before the board meeting.

**Audience:** Board of Directors, CEO, CFO.

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BOARD REVENUE METRICS                             │
│                     Q[N] [Year]                                      │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│  ARR         │  ARR Growth  │  NDR         │  Gross Margin          │
│  $X.XM       │  XX% YoY     │  XXX%        │  XX%                   │
│  Plan: $X.XM │  LQ: XX%     │  LQ: XXX%    │  LQ: XX%              │
│  Att: XX%    │  Plan: XX%   │  Target:110% │  Target: XX%          │
├──────────────┴──────────────┴──────────────┴───────────────────────┤
│                                                                     │
│  ARR Bridge — Quarterly (Waterfall Chart)                           │
│                                                                     │
│  Start ARR → +New ARR → +Expansion → -Contraction → -Churn → End  │
│  $X.XM        $XXK        $XXK          -$XXK         -$XXK  $X.XM│
│                                                                     │
├──────────────────────────────┬──────────────────────────────────────┤
│  Unit Economics              │  Efficiency                          │
│                              │                                      │
│  LTV:CAC    X.Xx [●]        │  Magic Number  X.XX [●]             │
│  QoQ trend  ▲/▼             │  QoQ trend     ▲/▼                  │
│                              │                                      │
│  CAC Payback XX mo [●]      │  Burn Multiple X.Xx [●]             │
│  QoQ trend   ▲/▼            │  QoQ trend     ▲/▼                  │
│                              │                                      │
├──────────────────────────────┴──────────────────────────────────────┤
│  ARR Growth Trajectory (Line Chart)                                 │
│                                                                     │
│  Quarterly ARR for last 8 quarters                                  │
│  Overlay: plan line vs. actual line                                 │
│  Show YoY growth rate on secondary axis                             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Metrics Detail

| Metric | Definition | Target | Why Board Cares | Benchmark |
|--------|-----------|--------|-----------------|-----------|
| ARR | End-of-quarter ARR | Per plan | Size and trajectory of the business | Context-dependent |
| ARR Growth (YoY) | Year-over-year ARR growth rate | Per plan | Growth velocity relative to stage | 50-100% ($5-50M); 30-50% ($50M+) |
| NDR | Net Dollar Retention (trailing 12 months) | > 110% | Revenue durability; can the business grow from its base? | 110-130% |
| Gross Margin | (Revenue - COGS) / Revenue | > 75% | Business model health; ability to scale profitably | 70-85% for SaaS |
| LTV:CAC | Customer Lifetime Value / Acquisition Cost | 3-5x | Unit economics sustainability | < 3x unsustainable; > 5x under-investing |
| CAC Payback | Months to recover acquisition cost | < 18 months | Capital efficiency; how fast investment recycles | 6-12 months ideal |
| Magic Number | Net New ARR (Q) / S&M Spend (prior Q) | > 0.75 | GTM efficiency; should we invest more? | > 1.0 = invest aggressively |
| Burn Multiple | Net Burn / Net New ARR | < 2x | Capital efficiency of growth | < 1x excellent; 1-2x good; > 2x inefficient |

### Board Dashboard Principles

1. **No more than 6 primary KPIs.** Board members scan, not study. Five to six numbers with clear targets and trends.
2. **Always show plan attainment.** The board approved a plan. Every metric should show actual vs. plan.
3. **Trend over absolute.** A $10M ARR number means nothing without context. Show QoQ and YoY trends.
4. **One narrative chart.** The ARR bridge (waterfall) tells the story of the quarter in one visual: how much was added, how much was lost, and what drove each.
5. **Flag exceptions.** If any metric is red (off plan by >10%), include a brief explanation and remediation plan. Do not make the board ask.

## Operations Dashboard (Weekly Cadence)

The operations dashboard provides Revenue Operations, Sales Management, and Marketing with detailed, actionable data for weekly decision-making. This is the working dashboard -- it prioritizes completeness and drill-down over simplicity.

**Refresh:** Weekly (Monday morning), with daily data feeds where available.

**Audience:** VP Revenue Operations, Sales Managers, Marketing Operations, Demand Generation leads.

### Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│                  REVENUE OPERATIONS DASHBOARD                       │
│                   Week of [Date]                                    │
├──────────────┬──────────────┬──────────────┬───────────────────────┤
│  MTD ARR     │  MTD Net New │  Pipeline    │  Funnel Health         │
│  Movement    │  MRR         │  Created     │  Score                 │
│  +$XXK       │  +$XXK       │  $X.XM       │  XX/100                │
│  vs plan: X% │  vs LM: X%   │  vs target:X%│  LW: XX/100           │
├──────────────┴──────────────┴──────────────┴───────────────────────┤
│                                                                     │
│  Weekly Funnel Flow (Sankey or Table)                                │
│                                                                     │
│  Visitors  Leads   MQLs    SQLs    Opps    Close                   │
│  XX,XXX    XXX     XXX     XX      XX      X                      │
│  Conv:     X.X%    XX%     XX%     XX%     XX%                     │
│  WoW:      ▲/▼    ▲/▼     ▲/▼     ▲/▼     ▲/▼                    │
│  Velocity: --      X days  X days  X days  X days                  │
│                                                                     │
├──────────────────────────────┬──────────────────────────────────────┤
│  Channel Performance (WTD)   │  Pipeline-to-Revenue                 │
│                              │                                      │
│  Channel    Leads  SQLs CAC │  Created Pipeline   $X.XM            │
│  Organic    XXX    XX   $XK │  Converted to Won   $XXK  (XX%)      │
│  Paid       XXX    XX   $XK │  Lost               $XXK  (XX%)      │
│  Outbound   XX     XX   $XK │  Still Open         $X.XM (XX%)      │
│  Referral   XX     XX   $XK │  Avg Days to Close  XX days          │
│  Partner    XX     XX   $XK │                                      │
│                              │                                      │
├──────────────────────────────┴──────────────────────────────────────┤
│  MRR Waterfall — MTD (Waterfall Chart)                              │
│                                                                     │
│  Start MRR + New + Expansion - Contraction - Churn = Current MRR   │
│                                                                     │
├──────────────────────────────┬──────────────────────────────────────┤
│  Rep Efficiency (Table)      │  Cohort Watch List                   │
│                              │                                      │
│  Rep    Quota  Pipeline Eff. │  Cohort   NDR   Trend  Alert        │
│  Rep A  XX%    $XXK    X.Xx  │  Mar-25   95%   ▼      [!]         │
│  Rep B  XX%    $XXK    X.Xx  │  Jun-25   98%   ▼      [!]         │
│  Rep C  XX%    $XXK    X.Xx  │  Sep-25   103%  →      OK          │
│  Rep D  XX%    $XXK    X.Xx  │  Dec-25   108%  ▲      OK          │
│  Team   XX%    $X.XM   X.Xx │                                      │
│                              │                                      │
├──────────────────────────────┴──────────────────────────────────────┤
│  Alerts & Actions                                                   │
│                                                                     │
│  [!] CAC Payback trending up: 11 mo → 14 mo (3-month trend)       │
│  [!] MQL-to-SQL conversion dropped 5pp WoW (32% → 27%)            │
│  [!] Mar-25 cohort NDR below 100% for 3 consecutive months        │
│  [i] Referral channel LTV:CAC at 6.1x — consider scaling program  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Metrics Detail

| Metric | Definition | Cadence | Target | Action If Off-Track |
|--------|-----------|---------|--------|-------------------|
| MTD ARR Movement | Net change in ARR month-to-date | Weekly | Per monthly plan | Accelerate close-dated deals; investigate churn spikes |
| MTD Net New MRR | New + Expansion - Contraction - Churn MRR MTD | Weekly | Per monthly plan | Break down by component; address largest negative driver |
| Pipeline Created | New pipeline value created this week | Weekly | Per weekly target | Increase prospecting activity; review marketing spend |
| Funnel Health Score | Composite of conversion rates vs. benchmarks | Weekly | > 70/100 | Investigate lowest-performing stage transition |
| Weekly Funnel Flow | Conversion rates at each stage, WoW trends | Weekly | At or above benchmarks | Focus on stage with largest WoW decline |
| Stage Velocity | Average days in each funnel stage | Weekly | Within healthy range | Investigate stages with increasing velocity |
| Channel Performance | Leads, SQLs, and CAC by acquisition channel | Weekly | LTV:CAC > 3x per channel | Reallocate budget from underperforming channels |
| Pipeline-to-Revenue | Conversion of created pipeline to closed-won | Weekly | > 20% | Audit pipeline quality at entry; review lost deal reasons |
| MRR Waterfall | Decomposition of MRR movement MTD | Weekly | Expansion > Contraction + Churn | Address churn drivers; activate expansion playbooks |
| Rep Efficiency | Sales efficiency ratio by individual rep | Weekly | > 1.0x | Coaching for underperforming reps; territory rebalancing |
| Cohort Watch List | Cohorts with NDR below target or declining | Weekly | All cohorts > 100% NDR | Assign CS intervention for at-risk cohorts |

### Operational Alerts

The operations dashboard should generate automated alerts when key thresholds are breached:

| Alert | Trigger | Severity | Action |
|-------|---------|----------|--------|
| CAC Payback Spike | Payback increases > 2 months in a single period | High | Review channel mix; investigate rising costs |
| Funnel Stage Drop | Any stage conversion drops > 5pp WoW | Medium | Investigate stage-specific causes; review lead quality |
| Cohort NDR Below 100% | Any cohort below 100% NDR for 2+ consecutive months | High | Assign CS team for cohort review; investigate churn drivers |
| Channel CAC Threshold | Any channel CAC > 2x blended average | Medium | Pause or reduce spend; A/B test creative and targeting |
| Net New MRR Negative | Monthly net new MRR is negative | Critical | Emergency review: decompose into components; address largest driver |
| Pipeline Coverage Gap | Pipeline coverage drops below 3x for current quarter | High | Activate pipeline generation campaigns; increase outbound activity |
| Magic Number Decline | Magic Number drops below 0.5 for 2 consecutive quarters | High | GTM efficiency review; potential structural cost problem |

### Drill-Down Views

The operations dashboard should support drill-downs for deeper investigation:

1. **Channel Drill-Down:** Click on any channel to see full funnel by channel (Visitor to Close), cost breakdown, and LTV:CAC trend over time.
2. **Rep Drill-Down:** Click on any rep to see their individual funnel, pipeline composition, efficiency ratio trend, and coaching recommendations.
3. **Cohort Drill-Down:** Click on any cohort to see the full retention curve, expansion/contraction breakdown, and account-level detail.
4. **Stage Drill-Down:** Click on any funnel stage to see conversion by channel, by rep, and by segment, plus the specific deals or leads currently in that stage.

## Dashboard Implementation Checklist

When implementing any of these dashboards, verify:

- [ ] Data sources identified and accessible (CRM, billing, marketing automation, web analytics)
- [ ] Metric definitions documented and agreed upon (especially ARR vs. revenue, MQL definition)
- [ ] Refresh cadence configured (daily feeds for ops, monthly for exec, quarterly for board)
- [ ] Color-coding thresholds set based on company-specific targets (not just benchmarks)
- [ ] Drill-down paths implemented for the operations dashboard
- [ ] Alert thresholds configured and notification channels connected
- [ ] Historical data loaded for trend analysis (minimum 6 months, ideally 12+)
- [ ] Stakeholder review completed (each audience confirms their view answers their questions)
- [ ] Documentation created for metric definitions and data lineage
