# Confidence-Driven Prioritization Patterns

> **Source:** Monte Carlo forecasting integration with WSJF and portfolio management.
> **When to use:** Translating probabilistic forecasts into prioritization decisions, stakeholder commitments, and rebalancing triggers.
> **Who uses it:** Product Director (portfolio review), Senior Project Manager (delivery commitments), Product Manager (sprint-level planning).

---

## 1. Reading Percentile Tables

Monte Carlo simulations produce percentile distributions. Three percentiles matter for product decisions:

| Percentile | Meaning | Use for |
|------------|---------|---------|
| **P50** (50th) | Coin flip -- equal chance of finishing earlier or later | Internal targets, optimistic planning |
| **P85** (85th) | High confidence -- 85% chance of finishing by this date | Internal commitments, sprint/quarter planning |
| **P95** (95th) | Near certain -- 95% chance of finishing by this date | External promises, contractual deadlines |

### Rules of Thumb

- **Internal planning:** Quote P85. This is the date you staff against and communicate to leadership.
- **External commitments:** Quote P95. Contracts, launch announcements, partner integrations use this date.
- **Team-level targets:** Use P50 as the aspirational target -- it keeps urgency without creating false pressure.
- **Spread as risk signal:** A wide gap between P50 and P95 indicates high uncertainty. Narrow the gap by reducing scope, resolving unknowns, or stabilizing throughput.

### Reading Example

| Initiative | P50 | P85 | P95 | Spread (P95-P50) |
|------------|-----|-----|-----|-------------------|
| Auth Overhaul | Sprint 3 | Sprint 5 | Sprint 7 | 4 sprints (high uncertainty) |
| Dashboard v2 | Sprint 2 | Sprint 3 | Sprint 3 | 1 sprint (low uncertainty) |
| API Migration | Sprint 4 | Sprint 4 | Sprint 6 | 2 sprints (moderate) |

Dashboard v2 is predictable and safe to commit externally. Auth Overhaul has high uncertainty -- investigate scope or throughput variance before committing.

---

## 2. Adjusting WSJF Time Criticality from Forecast Confidence

WSJF (Weighted Shortest Job First) uses time_criticality as one of its Cost of Delay components. Monte Carlo forecasts provide empirical data to set this score instead of relying on gut feel.

### The Pattern

```
adjusted_time_criticality = base_time_criticality + deadline_proximity_factor
```

Where **deadline_proximity_factor** measures how close the P85 forecast date is to the actual deadline:

| Condition | Proximity Factor | Meaning |
|-----------|-----------------|---------|
| P85 is well before deadline (>2 periods of buffer) | +0 | Comfortable margin, no adjustment needed |
| P85 is close to deadline (1-2 periods of buffer) | +1 | Buffer is thin, moderate urgency increase |
| P85 is at or past deadline | +2 | Will likely miss deadline, high urgency |
| P50 is already past deadline | +3 | Deadline is almost certainly missed without intervention |

### Worked Example

| Initiative | Base TC | Deadline | P85 Date | Buffer | Proximity | Adjusted TC |
|------------|---------|----------|----------|--------|-----------|-------------|
| Auth Overhaul | 5 | Sprint 6 | Sprint 5 | 1 sprint | +1 | 6 |
| Dashboard v2 | 3 | Sprint 8 | Sprint 3 | 5 sprints | +0 | 3 |
| API Migration | 7 | Sprint 4 | Sprint 4 | 0 sprints | +2 | 9 |

API Migration jumps to highest adjusted time criticality because its P85 lands exactly on the deadline -- no margin for error.

### When to Apply

- Apply at backlog refinement or quarterly planning when forecast data is available.
- Recalculate when forecasts are updated (see Re-forecasting Triggers below).
- Cap adjusted_time_criticality at the scale maximum (e.g., 10 on a 1-10 scale) to avoid distorting WSJF scores.

---

## 3. Stakeholder Communication Templates

Use these templates to translate forecast data into clear messages. Adjust the bracketed values from your Monte Carlo output.

### Template 1: Internal Planning

> Based on our throughput data, we estimate **[initiative]** will complete in **[P50 periods] periods** with 50% confidence, or **[P85 periods] periods** with 85% confidence. Planning should assume **[P85 date]**.

**When to use:** Sprint planning, quarterly roadmap reviews, resource allocation discussions.

**Example:**
> Based on our throughput data, we estimate Auth Overhaul will complete in 3 sprints with 50% confidence, or 5 sprints with 85% confidence. Planning should assume end of Sprint 5 (March 14).

### Template 2: External Commitment

> We can commit to delivering **[initiative]** by **[P95 date]**. Our internal target is **[P85 date]**.

**When to use:** Customer promises, partner agreements, marketing launch dates, board updates.

**Example:**
> We can commit to delivering API Migration by end of Sprint 6 (March 28). Our internal target is end of Sprint 4 (Feb 28).

### Template 3: Portfolio Review

> Current forecast for **[initiative]**: 50% by **[P50 date]**, 85% by **[P85 date]**, 95% by **[P95 date]**. Throughput trend: **[stable/improving/declining]**.

**When to use:** Monthly portfolio reviews, executive status updates, board reporting.

**Example:**
> Current forecast for Dashboard v2: 50% by Feb 14, 85% by Feb 28, 95% by Feb 28. Throughput trend: stable.

### Template 4: Risk Escalation

> **[Initiative]** forecast has shifted. Previous P85: **[old date]**. Current P85: **[new date]**. Cause: **[throughput change / scope addition / team change]**. Recommended action: **[scope cut / staffing / deadline renegotiation]**.

**When to use:** When re-forecasting reveals a material change. Pair with a concrete recommendation.

---

## 4. Re-forecasting Triggers

Forecasts are perishable. Stale forecasts create false confidence. Re-forecast when any of these triggers fire:

### Mandatory Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| **P50 date passed** | The 50th percentile date has passed and the initiative is not complete | Mandatory re-forecast. If the initiative is still in progress, the original forecast is no longer valid. |
| **Scope change** | Items added to or removed from remaining work | Re-run forecast with updated item count. Even small scope changes compound. |
| **Team change** | Team member joins or leaves | Wait 2-3 periods for throughput to stabilize, then recalibrate. Use the new throughput data, not the old. |

### Advisory Triggers

| Trigger | Condition | Action |
|---------|-----------|--------|
| **Throughput shift** | 3+ consecutive periods significantly above or below historical median | Recalibrate. The historical distribution no longer represents current capability. |
| **Blocked work spike** | More than 30% of in-progress items are blocked | Re-forecast after resolving blockers. Blocked items distort throughput data. |
| **External dependency slip** | A dependency outside the team's control misses its date | Re-forecast the downstream initiative immediately. |

### Re-forecasting Cadence

| Phase | Frequency |
|-------|-----------|
| Active initiative (in-progress) | Weekly |
| Planning phase (not yet started) | Monthly or at planning events |
| Stable initiative (predictable throughput, no triggers) | Bi-weekly |

---

## 5. Integration with Portfolio Rebalancing

These patterns connect forecast confidence to the portfolio rebalancing triggers defined in the prioritization-frameworks skill.

### RAG Status from Forecast Data

Replace subjective RAG (Red/Amber/Green) with forecast-driven status:

| Status | Condition | Action |
|--------|-----------|--------|
| **Green** | On track to complete by P85 date | Continue. Report at portfolio review. |
| **Amber** | Past P50 date, not yet complete | Investigate. Is throughput declining? Has scope grown? Report cause and mitigation. |
| **Red** | Past P85 date, not yet complete | Escalate. Scope cut, staffing change, or deadline renegotiation required. |

### Portfolio Review Triggers

**Forecast-driven triggers that should prompt a rebalancing discussion:**

1. **Wide confidence spread:** When P95 minus P50 exceeds 2x the initiative's planned duration, uncertainty is too high for reliable planning. Flag for scope reduction or discovery work.

2. **Clustering P85 dates:** When 3+ initiatives have P85 dates in the same period, resource contention risk is high. Stagger or re-sequence to reduce peak load.

3. **Declining throughput trend:** When throughput drops for 3+ consecutive periods across the portfolio (not just one team), systemic issues are present. Pause new intake until throughput stabilizes.

4. **Budget burn vs. forecast mismatch:** When an initiative has consumed >60% of budget but P50 shows >50% of work remaining, the initiative is burning faster than delivering. Review scope or investment.

### Connecting to WSJF Rebalancing

When portfolio rebalancing occurs:

1. Re-run Monte Carlo for all active initiatives with current throughput data.
2. Recalculate adjusted_time_criticality using the pattern from Section 2.
3. Recompute WSJF scores with updated Cost of Delay.
4. Re-sequence the backlog based on new WSJF order.
5. Communicate changes using Templates from Section 3.

This creates a closed feedback loop: forecast data drives prioritization, which drives execution, which produces new throughput data for the next forecast.

---

## Quick Reference Card

| Decision | Use This |
|----------|----------|
| What date to plan against internally? | P85 |
| What date to promise externally? | P95 |
| Is this initiative at risk? | Check if past P50 without completion |
| Should I raise time_criticality? | Check P85 vs. deadline buffer |
| When to re-forecast? | P50 passed, scope changed, team changed, or 3+ periods of throughput shift |
| When to escalate to portfolio review? | Past P85, wide P50-P95 spread, or multiple P85 dates clustering |
