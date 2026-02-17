# Portfolio Allocation Framework

> **Source:** Originally `prioritization/perplexity-framework.md`. Migrated to skill reference when consolidating prioritization content.
> **When to use:** Establishing strategic bucket allocations and within-bucket prioritization methodologies.
> **Who uses it:** Product Director + CTO (allocations), Product Manager (within-bucket ranking)

---

Prioritizing across diverse categories like technical debt, growth bets, and revenue features requires a hybrid approach that combines portfolio allocation with structured evaluation frameworks.

## 1. Portfolio Allocation: Set Strategic Buckets

Allocate percentages of capacity to categories based on company stage and strategic goals. Example:
- **60% growth bets** (new features, experiments)
- **20% revenue/sales enablement** (direct monetization or deal-closing tools)
- **15% tech debt/bug fixes** (stability and scalability)
- **5% design polish** (UX improvements with proven impact)

This forces upfront trade-offs and prevents reactive prioritization. Adjust ratios based on urgency (e.g., higher tech debt allocation if systems are near failure).

## 2. Within-Bucket Prioritization Frameworks

Use objective criteria to rank items **within each bucket**:

### For Growth Bets and Revenue Features

**Weighted Scoring:** Assign scores for:
- **Expected ROI** (revenue lift, customer acquisition)
- **Strategic alignment** (1-5 scale with company goals)
- **Implementation complexity** (developer-weeks)
- **Risk-adjusted upside** (probability of success x impact)

### For Tech Debt and Bugs

**Debt Severity Matrix:** Evaluate based on:
- **Criticality** (security risks, outages: High/Medium/Low)
- **Compound interest** (cost of delay: $/month)
- **Dependency impact** (blocks other initiatives? Yes/No)

### For Design Polish and Sales Enablement

**Kano Model:** Classify as:
- **Basic expectations** (table stakes; e.g., fixing broken sales dashboards)
- **Performance drivers** (linear satisfaction gains; e.g., UI streamlining)
- **Delighters** (unexpected value; e.g., AI-powered sales insights)

## 3. Apples-to-Apples Conversion Tactics

Translate all work into comparable metrics:

| Metric | Tech Debt Example | Feature Example |
|--------|-------------------|-----------------|
| ROI (12-month) | $500K saved in support costs | $2M revenue uplift |
| Risk Mitigation | 90% outage reduction | 15% churn reduction |
| Effort (weeks) | 3 | 8 |
| Customer Impact | NPS +7 | NPS +10 |

Priority Score formula:

```
Score = (ROI + Risk Mitigation Value + Customer Impact) / Effort
```

## 4. Leadership Trade-off Slider

Present top contenders from each bucket in a visual matrix (e.g., "Short-Term Revenue vs. Long-Term Stability"). Forced-ranking all items as "apples-to-apples" is impractical due to differing time horizons and stakeholder incentives. Instead, use quarterly business reviews to adjust allocations based on shifting priorities (e.g., reducing growth bets before a liquidity event to clean up tech debt).

## 5. Continuous Rebalancing

- **Tech Debt Sprints:** Dedicate 10-20% of each release cycle to debt reduction.
- **Feature Sunset Clauses:** Automatically deprecate underperforming features to free up capacity.
- **Dynamic Weighting:** Adjust scoring criteria weights quarterly (e.g., emphasize scalability during hypergrowth).

## NPV-Based Cross-Type Comparison

### Quantify Tech Debt as a Cash Flow Drag

Model tech debt as a negative cash flow stream using NPV:
- **Interest payments:** Annual productivity tax (e.g., 33% of dev time wasted = 33% x $150K/engineer x team size)
- **Principal repayment:** Future modernization costs (e.g., $30K/year x probability of system failure)
- **Opportunity cost:** Delayed feature launches (e.g., 6-month delay on a $2M feature = $1M NPV loss at 10% discount rate)

Example NPV for Tech Debt Fix:
```
NPV = -$50,000 (fix cost) + SUM(t=1..5) [ ($200,000 - $30,000) / (1.1)^t ] = $598,000
```

### Convert Bugs to Revenue-at-Risk

Use customer lifetime value (CLV) math:
- **Churn cost:** (Monthly churn rate x ARPU x Gross margin) / (Discount rate - Retention rate)

Example — payment bug causing 5% churn among 1,000 customers ($100 ARPU, 70% margin):
```
NPV Loss = (5% x 1000 x $100 x 70%) / (0.1 - 0.95) = $233,000
```

### Risk-Adjusted NPV for Growth Bets vs Reliability

- **Growth feature:** 60% chance of $2M revenue, 40% chance of failure
  ```
  Adj. NPV = (0.6 x $2M) - Dev cost
  ```
- **Bug fix:** 90% chance of preventing $500K churn
  ```
  Adj. NPV = (0.9 x $500K) - Fix cost
  ```

### Unified Prioritization Matrix

| Initiative | NPV | Risk Adj. NPV | Strategic Score | Priority Score |
|-----------|-----|---------------|-----------------|---------------|
| Growth Feature X | $1.2M | $720K | 8/10 | **9.2** |
| Tech Debt Cluster Y | $598K | $538K | 9/10 | **8.7** |
| Critical Bug Fix Z | $467K | $420K | 7/10 | **7.8** |
| Sales Enablement A | $950K | $665K | 6/10 | **7.5** |

Priority Score = (Risk Adj. NPV x 0.7) + (Strategic Score x 0.3)

### Dynamic Thresholds for Action

- **Tech debt:** Address if NPV of fix > 2x debt interest
- **Bugs:** Fix if CLV loss NPV > 3x fix cost
- **Features:** Approve if Risk Adj. NPV > WACC + 5% hurdle rate
