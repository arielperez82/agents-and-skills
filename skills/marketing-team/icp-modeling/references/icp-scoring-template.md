# ICP Scoring Template

A weighted scoring model for evaluating accounts against your Ideal Customer Profile. Customize the criteria values based on your closed-won analysis.

## Scoring Dimensions

### 1. Firmographic Criteria (Weight: 30%)

| Criterion | 10 (Ideal) | 7-9 (Strong) | 4-6 (Partial) | 1-3 (Weak) | 0 (Disqualify) |
|-----------|-----------|-------------|--------------|-----------|---------------|
| Company Size | 200-1000 employees | 100-200 or 1000-2000 | 50-100 or 2000-5000 | 20-50 or 5000+ | <20 |
| Industry | SaaS / DevTools | Enterprise Software | General Tech | Non-tech B2B | Consumer / Govt |
| Annual Revenue | $10M-$100M | $5M-$10M or $100M-$500M | $1M-$5M or $500M+ | $500K-$1M | <$500K |
| Geography | North America | Western Europe | APAC (English-speaking) | LATAM / Eastern Europe | Restricted markets |
| Funding Stage | Series B-D | Series A or E | Seed or Public | Pre-seed | N/A (non-startup) |

### 2. Technographic Criteria (Weight: 25%)

| Criterion | 10 (Ideal) | 7-9 (Strong) | 4-6 (Partial) | 1-3 (Weak) | 0 (Disqualify) |
|-----------|-----------|-------------|--------------|-----------|---------------|
| Cloud Platform | AWS + multi-cloud | Single major cloud | Hybrid cloud | On-premise migrating | Fully on-premise |
| Architecture | Microservices + K8s | Microservices | Monolith breaking up | Legacy monolith | Mainframe |
| Dev Tools Maturity | CI/CD + observability | CI/CD established | Basic CI | Manual deployment | No automation |
| Team Size (Engineering) | 20-100 developers | 10-20 or 100-200 | 5-10 or 200+ | 3-5 | <3 |

### 3. Behavioral Criteria (Weight: 25%)

| Criterion | 10 (Ideal) | 7-9 (Strong) | 4-6 (Partial) | 1-3 (Weak) | 0 (Disqualify) |
|-----------|-----------|-------------|--------------|-----------|---------------|
| Buying Signals | Active vendor evaluation | Budget approved | Exploring solutions | Aware of problem | No awareness |
| Engagement | Multiple touchpoints | Downloaded content | Visited website | LinkedIn connection | No engagement |
| Hiring Patterns | Hiring for our category | Growing engineering team | Stable team | Shrinking | Hiring freeze |
| Technology Adoption | Early adopter | Early majority | Late majority | Laggard | N/A |

### 4. Psychographic Criteria (Weight: 20%)

| Criterion | 10 (Ideal) | 7-9 (Strong) | 4-6 (Partial) | 1-3 (Weak) | 0 (Disqualify) |
|-----------|-----------|-------------|--------------|-----------|---------------|
| Primary Pain Point | Directly matches our value prop | Related pain point | Tangential | Different problem | No pain |
| Decision Speed | Fast (<60 days) | Standard (60-120 days) | Slow (120-180 days) | Very slow (180+) | No decision process |
| Risk Tolerance | Innovation-driven | Balanced | Conservative | Risk-averse | Change-resistant |
| Budget Authority | Champion is budget holder | Champion has influence | No champion identified | Blocked by procurement | No budget path |

## Composite Score Calculation

```
Firmographic Score = average(criterion scores) x 10  → 0-100
Technographic Score = average(criterion scores) x 10 → 0-100
Behavioral Score = average(criterion scores) x 10    → 0-100
Psychographic Score = average(criterion scores) x 10  → 0-100

Composite = (Firmographic x 0.30) + (Technographic x 0.25) + (Behavioral x 0.25) + (Psychographic x 0.20)
```

## Score Tiers

| Tier | Score Range | Action | SLA |
|------|-----------|--------|-----|
| Tier 1 (Ideal) | 80-100 | Fast-track to AE, priority outreach | Contact within 24 hours |
| Tier 2 (Good) | 60-79 | Standard sales follow-up | Contact within 48 hours |
| Tier 3 (Marginal) | 40-59 | Marketing nurture sequence | Add to drip campaign |
| Disqualify | 0-39 | Do not pursue | Archive |

## Calibration Guide

1. **Baseline test:** Score your last 20 closed-won deals — average should be 75+
2. **Separation test:** Score your last 20 closed-lost deals — average should be below 60
3. **Gap check:** If the gap between won and lost averages is <15 points, your criteria need sharper differentiation
4. **Recalibrate:** Quarterly with fresh deal data
5. **Monitor:** Track score-to-conversion correlation monthly as the key health metric

## Customization Notes

- Adjust dimension weights based on your data (some industries care more about firmographics vs. technographics)
- Add or remove criteria within dimensions as needed
- The specific values in each cell (e.g., "200-1000 employees") are examples — replace with your actual ideal ranges from closed-won analysis
- Consider adding a "negative scoring" row for disqualifying signals (competitor customer, pending acquisition, etc.)
- For PLG products, behavioral criteria weight may increase to 30-35% (usage signals are stronger predictors)
