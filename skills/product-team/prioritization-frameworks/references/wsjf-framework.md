# WSJF (Weighted Shortest Job First) Framework

Within-bucket sequencing framework for time-sensitive prioritization. Adapted from SAFe WSJF for product management contexts.

## Formula

```
WSJF = (Business Value + Time Criticality + Risk Reduction / Opportunity Enablement) / Job Size
```

The numerator is the **Cost of Delay** proxy: the sum of three dimensions that together estimate the economic cost of not doing this work now. Dividing by Job Size produces the highest economic return per unit of time invested.

## Scoring Rubrics (1-10 Scale)

Score each dimension using modified Fibonacci-friendly anchors. Use relative sizing within the candidate set, not absolute values.

### Business Value

How much direct user or business value does this deliver?

| Score | Anchor | Example |
|-------|--------|---------|
| 1 | Minimal user impact; nice-to-have cosmetic change | Tooltip text improvement |
| 3 | Modest improvement for a segment; measurable but small | CSV export for power users |
| 5 | Clear value for a significant user segment; moves a metric | Bulk actions on list views |
| 7 | High value; directly tied to a key business metric (revenue, retention, activation) | Self-serve onboarding flow replacing manual setup |
| 10 | Transformative capability; unlocks a new market or eliminates a top churn reason | Real-time collaboration replacing async-only workflow |

### Time Criticality

How much does the value decay if we delay?

| Score | Anchor | Example |
|-------|--------|---------|
| 1 | No deadline pressure; value is stable over time | Internal tooling improvement |
| 3 | Mild decay; a competitor might get there first in 6+ months | Feature parity item on a slow-moving competitor |
| 5 | Moderate urgency; value drops meaningfully after this quarter | Seasonal feature for a key sales period |
| 7 | High urgency; contractual or partnership deadline within 4-6 weeks | Integration required for a signed enterprise deal |
| 10 | Must ship this sprint or lose the opportunity entirely | Regulatory compliance deadline; market window closing in days |

### Risk Reduction / Opportunity Enablement (RR/OE)

How much does this reduce risk to the portfolio or unblock other valuable work?

| Score | Anchor | Example |
|-------|--------|---------|
| 1 | No dependencies unlocked; standalone value only | Dark mode toggle |
| 3 | Reduces one known risk or enables one follow-on item | Adds monitoring that would catch a known failure class |
| 5 | Enables a medium-priority initiative or retires a significant risk | API versioning that unblocks 2 partner integrations |
| 7 | Unblocks multiple high-value items; critical path enabler | Auth service rewrite that unblocks SSO, RBAC, and audit logging |
| 10 | Blocks the most valuable items in the portfolio; existential risk if not addressed | Platform migration that every Q2 initiative depends on |

### Job Size

How much effort to complete? Score relative to the candidate set.

| Score | Anchor | Example |
|-------|--------|---------|
| 1 | Trivial; less than half a day | Config change, copy update |
| 3 | Small; 1-3 days, single engineer | API endpoint addition with existing patterns |
| 5 | Medium; 1-2 weeks, single engineer or small pair | New feature with UI + backend + tests |
| 7 | Large; 2-4 weeks, requires coordination across 2+ engineers | Multi-service feature with data migration |
| 10 | Very large; more than 2 weeks, cross-team dependency | Platform rewrite, new infrastructure component |

**Scoring protocol:** Score all items on one dimension before moving to the next. This forces relative comparison and reduces anchoring bias.

## Worked Examples

### Example Set

Five items competing for the same sprint capacity within a growth bucket:

| Item | Business Value | Time Criticality | RR/OE | Job Size | WSJF |
|------|---------------|-----------------|-------|----------|------|
| A. Platform migration | 6 | 3 | 10 | 10 | **1.9** |
| B. Self-serve onboarding | 7 | 5 | 3 | 7 | **2.1** |
| C. Partner API auth | 5 | 7 | 7 | 3 | **6.3** |
| D. Bulk export | 3 | 1 | 1 | 1 | **5.0** |
| E. Seasonal promo feature | 5 | 10 | 1 | 5 | **3.2** |

**WSJF Sequence:** C (6.3) > D (5.0) > E (3.2) > B (2.1) > A (1.9)

### Insight 1: Small high-value items beat large high-value items

**Naive priority** (by Business Value alone): B (7) > A (6) > C = E (5) > D (3)

**WSJF reorders:** D (bulk export, score 5.0) jumps from last to second. Its trivial size (1) means the team captures value almost immediately. B (self-serve onboarding, score 2.1) drops despite highest business value because its large size (7) delays value delivery.

**Takeaway:** WSJF penalizes large jobs. If a high-value item is large, break it into smaller increments to improve its WSJF score for individual slices.

### Insight 2: Time criticality changes sequencing

E (seasonal promo) has only moderate business value (5) but maximum time criticality (10). WSJF ranks it 3rd, well ahead of where pure business value would place it. If the team waited to ship it after B and A, the seasonal window would close and the value would drop to zero.

**Takeaway:** WSJF naturally surfaces "ship now or never" items that pure value scoring misses.

### Insight 3: Enablers surface through RR/OE

C (partner API auth) has moderate standalone value (5) but high RR/OE (7) because it unblocks multiple partner integrations. Combined with a small job size (3), WSJF ranks it first. A (platform migration) has the highest RR/OE (10) but its massive size (10) dilutes the score to last place.

**Takeaway:** RR/OE prevents enablers from being deprioritized behind flashier features. But even enablers must be right-sized; a large enabler should be sliced.

## Relationship to Portfolio Allocation

WSJF operates **within** strategic buckets, not across them.

- **Within growth/revenue buckets:** Use WSJF to sequence items when time sensitivity and dependencies matter.
- **Within tech debt bucket:** WSJF can supplement the Debt Severity Matrix when debt items have time-dependent costs (e.g., a deprecation deadline).
- **Cross-bucket comparison:** Still uses the unified priority score from SKILL.md (`Risk-Adjusted NPV_norm x 0.7 + Strategic Alignment x 0.3`). WSJF is a sequencing tool, not a cross-bucket comparison tool.

WSJF does not replace portfolio allocation. The Product Director and CTO still set bucket percentages quarterly. WSJF tells the Product Manager what order to build items in once the bucket is funded.

## Decision Guide: WSJF vs RICE

### Use RICE when

- **Reach/adoption matters most.** RICE explicitly models how many users a feature affects. WSJF does not.
- **Early-stage product with uncertain market fit.** Reach is a proxy for learning velocity; shipping to more users generates more signal.
- **Comparing items with very different user bases.** RICE's Reach dimension normalizes across segments (e.g., 10K free users vs. 200 enterprise accounts).

### Use WSJF when

- **Sequencing matters.** You have limited capacity and must pick the order, not just the set. WSJF is built for sequencing; RICE is built for scoring.
- **Time-sensitive items exist.** Time Criticality is a first-class dimension in WSJF. In RICE, urgency is invisible.
- **Items have dependencies that affect other work.** RR/OE explicitly rewards enablers. RICE has no equivalent.
- **Cost of Delay is significant.** If delaying a feature costs real money (contracts, partnerships, regulatory fines), WSJF captures that directly.

### Use BOTH when

- **Pressure-testing narrative prioritization.** Run both frameworks independently. If they converge on the same top 3, confidence is high. If they diverge, investigate the divergent items -- the difference reveals which dimensions (reach vs. urgency vs. enablement) are driving the disagreement.
- **Quarterly planning reviews.** RICE for initial scoring, WSJF for final sequencing. RICE answers "what should we build?" WSJF answers "in what order?"

### Quick Decision Matrix

| Situation | Framework |
|-----------|-----------|
| "Which features should we invest in this quarter?" | RICE |
| "What order should we build these 8 approved features?" | WSJF |
| "Should we build Feature X at all?" | RICE |
| "Should we build Feature X before or after Feature Y?" | WSJF |
| "We have a regulatory deadline in 3 weeks" | WSJF |
| "We're trying to find product-market fit" | RICE |
| "This item unblocks 3 other items" | WSJF |
| "We need to convince leadership with data" | Both (convergence = strong case) |
