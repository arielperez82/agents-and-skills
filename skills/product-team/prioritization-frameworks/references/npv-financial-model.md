# NPV Financial Model for Cross-Type Prioritization

> **Source:** Originally `prioritization/chatgpt-framework.md`. Migrated to skill reference as part of I03-PRFR.
> **When to use:** Making the dollar case for a specific tech debt or reliability investment to leadership.
> **Who uses it:** Product Manager + Engineering leads

---

Features, bugs, tech debt, reliability, and growth bets all compete for scarce engineering resources.

To compare apples-to-apples, we need a universal model that captures:

| Factor | Explanation |
|--------|-------------|
| Value Created or Protected (NPV) | Positive impact (revenue, retention, cost savings, risk reduction) discounted over time. |
| Cost of Delay (CoD) | Value lost per unit time if delayed — favors urgency-sensitive investments. |
| Confidence/Probability | Reduces the impact of speculative/uncertain bets — prevents over-weighting moonshots. |
| Effort/Cost | Time + opportunity cost — normalizes against investment. |
| Strategic Alignment | Is this needed for existential or roadmap-level reasons (i.e. OKRs)? |
| Risk of Inaction | Bugs, tech debt, platform instability — modeled as negative expected value — destroys NPV. |
| Compounding Effects (Drag or Leverage) | Tech debt increases future delivery costs — multiplier on future NPVs. Reliability reduces future risk. |

## Universal Prioritization Model

```
Priority Score = (NPV + Risk Avoidance Value + Cost of Delay) / Effort × Confidence
```

Where:
- **NPV** — modeled cash value, discounted for time (could be revenue, savings, churn avoidance)
- **Risk Avoidance Value** — expected value of avoiding negative outcomes (bugs, outages)
- **Cost of Delay** — value lost if not shipped promptly (urgency)
- **Effort** — normalized engineering cost (T-shirt size, weeks, $)
- **Confidence** — probability or belief in the estimates (0-1 multiplier)

Optional modifier — Future Velocity Multiplier (for tech debt / reliability):

```
Adjusted Score = Priority Score × (1 + Velocity_Drag_Reduction)
```

## Pressure Testing the Model

### Example 1: Tech Debt Paydown

- NPV = +$0 directly
- Risk Avoidance = +$500K (avoiding 10% slowdown on $5M future feature value)
- Cost of Delay = Medium (drag compounds over time)
- Effort = Medium
- Confidence = High

Result: High leverage investment with high certainty.

### Example 2: Validated New Feature (Revenue)

- NPV = +$3M (directly drives revenue)
- Risk Avoidance = None
- Cost of Delay = High (market window closes in 3 months)
- Effort = High
- Confidence = Medium-High

Result: Strong business driver, urgent. High priority.

### Example 3: Speculative Experiment (Growth Bet)

- NPV = +$10M (possible upside, uncertain)
- Risk Avoidance = None
- Cost of Delay = Low (can wait)
- Effort = Medium
- Confidence = Low (0.2)

Result: Possible high upside, but speculative — lower priority unless strategic bet.

### Example 4: Bug Fix (Outage Risk)

- NPV = None
- Risk Avoidance = +$1M (outage avoidance — modeled EV = $1M loss x 10% = $100K)
- Cost of Delay = High (any day unfixed = exposure)
- Effort = Low
- Confidence = High

Result: Risk destroyer + low cost = very high priority.

### Example 5: Platform Reliability Enhancement

- NPV = None
- Risk Avoidance = +$500K/year (prevents scale-related incidents)
- Cost of Delay = Medium
- Effort = High
- Confidence = Medium

Result: Important for future-proofing, but expensive — medium unless reliability is urgent.

### Example 6: Sales Enablement Feature

- NPV = +$2M (accelerates deal closure)
- Risk Avoidance = None
- Cost of Delay = High (Q4 deals need this)
- Effort = Low
- Confidence = High

Result: High ROI, urgent timing — very high priority.

### Example 7: UX Polish / Delight

- NPV = +$200K (conversion, perception)
- Risk Avoidance = None
- Cost of Delay = Low
- Effort = Low
- Confidence = Medium

Result: Nice-to-have — only gets priority if UX is strategic.

## Observations

- Revenue + Urgency = top priority (Sales enablement + validated feature)
- Risk avoidance + low effort = next priority (Bugs, tech debt)
- Platform / Reliability = steady investments, medium priority unless urgent
- Speculative bets = low priority unless strategic bet
- UX Polish = lowest unless linked to conversion/retention lift

## When Drag + Compounding Justify Tech Debt Paydown

Tech debt only jumps ahead when:
- Drag is becoming compounding (velocity noticeably slowing)
- Bugs / incidents stemming from debt increase
- Upcoming roadmap features depend on fixing it (strategic gating)
