---
name: competitive-intel
description: Competitive intelligence operations for CI monitoring, battlecard creation,
  win/loss analysis, and share-of-voice tracking. Market-facing CI methodology distinct
  from product-focused competitive-analysis. Use when monitoring competitors, creating
  battlecards, conducting win/loss analysis, tracking share-of-voice, or when user
  mentions competitive intelligence, CI, battlecards, win/loss, or competitor tracking.
license: MIT
metadata:
  author: Claude Skills Team
  compatibility:
    python-version: 3.8+
    platforms:
    - macos
    - linux
    - windows
  contributors: []
  created: 2026-03-04
  dependencies:
    scripts: []
    references:
    - references/battlecard-template.md
    assets: []
  difficulty: intermediate
  domain: marketing
  examples:
  - title: "Create Competitor Battlecard"
    input: "Create a battlecard for our main competitor in the API monitoring space"
    output: "Structured battlecard with: Overview (funding, team size, customer count), Positioning (their messaging vs reality), Strengths (3-5), Weaknesses (3-5), Win Strategy, Landmines (topics to avoid), Top 5 Objection Responses with talk tracks, Proof Points (customer quotes, win rate data)."
  featured: false
  frequency: Weekly for monitoring, monthly for battlecard updates
  orchestrated-by: []
  related-agents:
  - competitive-intelligence-analyst
  - product-marketer
  related-commands: []
  related-skills:
  - product-team/competitive-analysis
  - marketing-team/marketing-strategy-pmm
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: competitive-intelligence
  tags:
  - competitive-intelligence
  - battlecards
  - win-loss
  - monitoring
  - sales-enablement
  - share-of-voice
  tech-stack:
  - Crayon
  - Klue
  - Gong/Chorus
  - G2/Capterra
  - HubSpot CRM
  time-saved: 3-4 hours per battlecard, 2-3 hours per weekly digest
  title: Competitive Intelligence Skill
  updated: 2026-03-04
  use-cases:
  - Continuous competitive monitoring and signal detection
  - Creating and maintaining sales battlecards
  - Win/loss analysis to identify competitive patterns
  - Share-of-voice measurement and tracking
  verified: true
  version: v1.0.0
---

# Competitive Intelligence

## Overview

Operational frameworks for market-facing competitive intelligence — monitoring competitors, creating battlecards, analyzing win/loss patterns, and tracking share-of-voice. This skill provides the methodology for systematic CI operations that keep sales and marketing teams armed with current competitive data.

**Core Value:** Transform scattered competitive signals into actionable sales intelligence that directly improves competitive win rates.

**Scope boundary:** This skill focuses on *market-facing CI operations* — monitoring, battlecards, win/loss, share-of-voice. For repo/product-focused competitive analysis (scorecard-style feature comparison), see `product-team/competitive-analysis`. For positioning strategy informed by CI, see `marketing-strategy-pmm`.

## Core Capabilities

- **Competitor Monitoring** — Systematic tracking of competitor activities across multiple signal sources with classification and alerting
- **Battlecard Creation** — Structured competitive battlecards with positioning, strengths, weaknesses, win strategies, landmines, and objection handling
- **Win/Loss Analysis** — Interview methodology, pattern extraction, and actionable insights from closed deals
- **Share-of-Voice Tracking** — Measurement of brand visibility relative to competitors across channels
- **Competitive Signal Classification** — Categorizing and prioritizing competitive signals by threat level and action required
- **Sales Enablement** — Translating CI into talk tracks, objection responses, and competitive positioning for sales conversations

## Quick Start

1. Define your competitive set (direct, indirect, emerging)
2. Set up monitoring cadence (daily signals, weekly digest, monthly deep-dive)
3. Create initial battlecard for top 3 competitors using `references/battlecard-template.md`
4. Begin win/loss interviews (target 10-20 per month)
5. Establish quarterly competitive landscape review

## Key Workflows

### 1. Competitive Monitoring Setup

**Time:** 1 week initial setup, 2-3 hours/week ongoing

**Monitoring cadence:**

| Frequency | Signal Type | Action |
|-----------|-----------|--------|
| Daily | Product updates, pricing changes, outages, exec moves | Log and classify |
| Weekly | Job postings, press releases, review site changes, social media | Weekly CI digest |
| Monthly | Feature deep-dive, positioning analysis, content audit | Monthly CI report |
| Quarterly | Full competitive landscape refresh, trend analysis | Quarterly strategic CI |

**Data sources to monitor:**

1. **Websites** — Pricing pages, product pages, feature lists, blog posts, changelog
2. **Job postings** — LinkedIn, company careers page (hiring = investment signal)
3. **Press releases** — Funding announcements, partnerships, product launches
4. **Product changes** — Feature releases, API changes, integrations
5. **Pricing changes** — Plan restructuring, price increases/decreases, new tiers
6. **Review sites** — G2, Capterra, TrustRadius (new reviews, rating changes)
7. **Social media** — LinkedIn company page, Twitter, executive posts
8. **Patent filings** — New patent applications (early signal of future direction)
9. **Conference appearances** — Speaking slots, booth presence, sponsorships

**Signal classification:**

| Threat Level | Criteria | Response Time |
|-------------|---------|--------------|
| High | Directly threatens our differentiation or pricing | 24 hours — alert leadership and update battlecard |
| Medium | New capability or market move that may affect us | 1 week — add to weekly digest, assess impact |
| Low | Activity that doesn't directly impact our position | Monthly — include in monthly report for tracking |

### 2. Battlecard Creation

**Time:** 3-4 hours per competitor

Use the template in `references/battlecard-template.md`. Key sections:

1. **Competitor Overview** — Company basics (funding, team size, customer count, revenue estimate, key customers)
2. **Their Positioning** — How they describe themselves vs. reality. Identify gaps between messaging and product.
3. **Key Strengths** — What they genuinely do well (be honest — sales team credibility depends on accuracy)
4. **Key Weaknesses** — Where they fall short, supported by evidence (reviews, lost deals, product gaps)
5. **Our Win Strategy** — How to beat them: which features to demo, which proof points to use, which questions to ask
6. **Landmines** — Topics to avoid or redirect (areas where they're stronger)
7. **Objection Handling** — Top 5 objections with scripted responses:
   - Objection: "But CompetitorX has feature Y"
   - Response: "Here's why that's less important than [our differentiator]..."
   - Evidence: Customer quote, data point, or demo moment
8. **Proof Points** — Customer testimonials, case studies, benchmark data, win rate statistics

**Maintenance schedule:**
- Update within 48 hours of major competitor changes (product launch, pricing change, funding round)
- Full refresh quarterly
- Track battlecard usage correlation with competitive win rate

### 3. Win/Loss Analysis

**Time:** 30-45 min per interview, monthly reporting

**Interview methodology:**

1. **Select deals** — Last 30 days, mix of wins and losses, prioritize competitive deals
2. **Request interview** — Send within 7 days of close (memory fresh), offer incentive ($50 gift card)
3. **Interview structure** (30 min):
   - Opening (2 min): Thank them, explain purpose, get permission to record
   - Decision process (10 min): Who was involved? What was the timeline? What triggered the evaluation?
   - Evaluation criteria (10 min): What mattered most? How did you compare options? What almost changed your mind?
   - Outcome (5 min): For wins — why us? For losses — why them? What could we have done differently?
   - Close (3 min): Anything else? Permission to follow up?

4. **Pattern extraction** — After 10+ interviews, identify:
   - Top 3 win reasons (double down on these)
   - Top 3 loss reasons (address in product/positioning)
   - Common evaluation criteria (optimize sales process for these)
   - Competitor frequency (which competitors appear most often)

5. **Monthly reporting:**
   - Overall win rate and trend
   - Win rate by competitor
   - Win rate by segment/deal size
   - Top win/loss reasons with action items
   - Recommendations for product, sales, marketing

### 4. Share-of-Voice Measurement

**Time:** 4-6 hours quarterly

Measure brand visibility relative to competitors across channels:

1. **Search share-of-voice** — Branded search volume (Google Trends, SEMrush) as % of total category search
2. **Social share-of-voice** — Mentions and engagement across LinkedIn, Twitter, Reddit as % of competitive set
3. **Review site presence** — Review count, rating, and trend on G2/Capterra vs. competitors
4. **Content share-of-voice** — Blog posts, guest articles, conference talks, podcast appearances
5. **Media share-of-voice** — Press mentions, analyst coverage, thought leadership citations

**Tracking:**
- Measure quarterly and track trend over time
- Set targets: SOV should be at or above your market share target
- Identify channels where competitors have disproportionate SOV (opportunity or threat)

## Python Tools

This skill currently has no Python automation tools. For automated competitor tracking, see the `marketing-strategy-pmm` skill which includes a competitor tracker script.

## Best Practices

### Battlecard Quality

- Be honest about competitor strengths — sales teams lose trust in biased battlecards
- Include specific evidence (review quotes, benchmark data, customer testimonials)
- Keep battlecards to 1-2 pages — sales teams won't read a 10-page document
- Include "when to walk away" scenarios — some deals aren't worth the competitive fight

### Win/Loss Interviews

- Interview within 7 days of deal close (before memory fades)
- Talk to the economic buyer, not just your champion
- Ask open-ended questions — don't lead toward your preferred answer
- Distinguish between stated reasons and real reasons (dig deeper with "why" follow-ups)

### Monitoring Discipline

- Consistency beats intensity — 30 min daily is better than 4 hours monthly
- Automate what you can (Google Alerts, Feedly, competitor RSS feeds)
- Don't monitor everything — focus on your top 5 competitors and key signal types
- Share findings broadly — CI locked in one person's head has no value

## Reference Guides

**[battlecard-template.md](references/battlecard-template.md)** — Complete battlecard template with all 8 sections, example content, and maintenance guidelines.

## Integration

This skill works best with:
- Crayon/Klue (automated CI monitoring and battlecard platforms)
- Gong/Chorus (win/loss analysis from sales call recordings)
- G2/Capterra (review monitoring and competitive comparison)
- HubSpot CRM (deal data for win/loss analysis, competitive field tracking)
- Google Alerts/Feedly (news and content monitoring)
- SEMrush/SimilarWeb (search and traffic share-of-voice)

## Additional Resources

- Battlecard Template: [references/battlecard-template.md](references/battlecard-template.md)
- Related Skill: [../../product-team/competitive-analysis/SKILL.md](../../product-team/competitive-analysis/SKILL.md) (product-focused analysis)
- Related Skill: [../marketing-strategy-pmm/SKILL.md](../marketing-strategy-pmm/SKILL.md) (positioning from CI)

---

**Last Updated**: March 2026 | **Version**: 1.0
