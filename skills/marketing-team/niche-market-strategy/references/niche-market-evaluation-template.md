# Niche Market Evaluation Template

A multi-criteria scoring framework for comparing niche market opportunities. Score each candidate market on all dimensions, then use the composite score to select your beachhead.

## Scoring Dimensions

### 1. Market Attractiveness (Weight: 30%)

| Criterion | 10 (Excellent) | 7-9 (Good) | 4-6 (Moderate) | 1-3 (Poor) | 0 (Disqualify) |
|-----------|---------------|-----------|----------------|-----------|---------------|
| TAM/SAM Size | $500M+ SAM | $100M-$500M | $25M-$100M | $5M-$25M | <$5M |
| Growth Rate | 30%+ YoY | 15-30% | 5-15% | 0-5% | Declining |
| Willingness to Pay | Premium pricing ($50K+ ACV) | Standard ($10K-$50K) | Budget ($2K-$10K) | Low (<$2K) | Free-only |
| Sales Cycle | <30 days | 30-60 days | 60-120 days | 120-180 days | 180+ days |

### 2. Competitive Dynamics (Weight: 25%)

| Criterion | 10 (Favorable) | 7-9 (Good) | 4-6 (Neutral) | 1-3 (Challenging) | 0 (Avoid) |
|-----------|---------------|-----------|--------------|-------------------|----------|
| Competitor Count | 0-1 direct | 2-3 direct | 4-6 direct | 7-10 direct | 10+ / monopoly |
| Market Concentration | Fragmented (no >20% share) | Moderate | Semi-concentrated | Concentrated (1-2 leaders) | Monopoly (1 > 60%) |
| Differentiation Potential | Unique capability | Strong differentiation | Moderate | Weak | Commodity |
| Switching Cost for Buyers | Low (easy to adopt) | Moderate | High (but worth it) | Very high (hard to displace) | Locked-in |

### 3. Product Fit (Weight: 25%)

| Criterion | 10 (Perfect) | 7-9 (Strong) | 4-6 (Partial) | 1-3 (Weak) | 0 (No Fit) |
|-----------|-------------|-------------|--------------|-----------|-----------|
| Problem-Solution Fit | Core value prop solves #1 pain | Solves top 3 pain | Solves adjacent pain | Tangential value | No value |
| Product Readiness | Ship today | Minor customization | Moderate development | Major features needed | Rebuild required |
| Technical Fit | Native integration | API available | Workaround exists | Custom build needed | Incompatible |
| Use Case Clarity | Obvious, urgent use case | Clear use case | Requires education | Ambiguous | No use case |

### 4. Strategic Value (Weight: 20%)

| Criterion | 10 (High) | 7-9 (Good) | 4-6 (Moderate) | 1-3 (Low) | 0 (None) |
|-----------|----------|-----------|----------------|----------|---------|
| Referral Potential | Strong network effects | Good word-of-mouth | Moderate | Low | Isolated buyers |
| Adjacent Markets | Opens 3+ adjacent segments | Opens 1-2 segments | Limited expansion | Dead-end niche | N/A |
| Brand Value | Prestigious logos, PR-worthy | Good logos | Average | Low profile | Negative association |
| Data/Learning Value | Deep product insights | Good signal | Moderate | Low | No learning |

## Composite Score Calculation

```
Market Attractiveness Score = average(criteria) x 10   → 0-100
Competitive Dynamics Score = average(criteria) x 10    → 0-100
Product Fit Score = average(criteria) x 10             → 0-100
Strategic Value Score = average(criteria) x 10          → 0-100

Composite = (Attractiveness x 0.30) + (Competitive x 0.25) + (Product Fit x 0.25) + (Strategic x 0.20)
```

## Decision Tiers

| Tier | Score Range | Recommendation |
|------|-----------|---------------|
| Beachhead Candidate | 75-100 | Strong candidate for first market entry |
| Near-Term Target | 55-74 | Good expansion market after beachhead established |
| Long-Term Opportunity | 35-54 | Monitor and revisit when product matures |
| Deprioritize | 0-34 | Not worth pursuing in current state |

## Example Evaluation

| Dimension | Fintech Developers | Healthcare IT | E-commerce Platforms | EdTech Startups |
|-----------|-------------------|--------------|---------------------|----------------|
| Market Attractiveness | 78 | 72 | 85 | 55 |
| Competitive Dynamics | 70 | 65 | 50 | 80 |
| Product Fit | 85 | 60 | 75 | 70 |
| Strategic Value | 82 | 70 | 65 | 60 |
| **Composite** | **79** | **67** | **69** | **66** |
| **Tier** | **Beachhead** | **Near-Term** | **Near-Term** | **Long-Term** |

## Customization Notes

- Adjust dimension weights based on your company stage: early-stage should weight Product Fit higher (30-35%), later-stage should weight Market Attractiveness higher
- Add industry-specific criteria within dimensions (e.g., "Regulatory Complexity" for healthcare)
- Score at least 3 candidate markets to enable comparison
- Revisit scoring quarterly as markets and product evolve
