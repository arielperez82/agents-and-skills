---
name: attribution-modeling
description: Multi-touch attribution frameworks for measuring marketing's impact on
  B2B revenue. Covers first-touch, last-touch, linear, time-decay, position-based,
  and W-shaped models with selection guidance. Addresses B2B attribution challenges
  (long sales cycles, multiple stakeholders, dark social) and self-reported attribution.
  Use when building attribution models, measuring campaign ROI, analyzing marketing
  channel effectiveness, or when user mentions attribution, marketing measurement,
  or channel ROI.
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
    - references/attribution-model-selection-guide.md
    assets: []
  difficulty: advanced
  domain: marketing
  examples:
  - title: "Select Attribution Model for B2B SaaS"
    input: "Which attribution model should we use for a B2B SaaS company with 90-day sales cycles and 3-5 stakeholders per deal?"
    output: "Recommend W-shaped (U-shaped + opportunity creation) as primary model. Allocates 30% to first touch, 30% to lead creation, 30% to opportunity creation, 10% distributed across middle touches. Captures the three critical conversion moments in B2B. Supplement with self-reported attribution ('How did you hear about us?') to capture dark social and word-of-mouth that software attribution misses."
  featured: false
  frequency: Monthly during pipeline reviews
  orchestrated-by: []
  related-agents:
  - marketing-ops-manager
  - demand-gen-specialist
  related-commands: []
  related-skills:
  - marketing-team/lead-scoring
  - marketing-team/marketing-automation
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: attribution-modeling
  tags:
  - attribution
  - multi-touch
  - first-touch
  - last-touch
  - b2b-attribution
  - marketing-measurement
  tech-stack:
  - HubSpot
  - Salesforce
  - Google Analytics
  - Bizible
  - Dreamdata
  time-saved: 3-5 hours per attribution analysis
  title: Attribution Modeling Skill
  updated: 2026-03-04
  use-cases:
  - Selecting the right attribution model for B2B sales cycles
  - Building multi-touch attribution reports for marketing ROI
  - Analyzing channel effectiveness across long sales cycles
  - Implementing self-reported attribution to complement software tracking
  verified: true
  version: v1.0.0
---

# Attribution Modeling

## Overview

Frameworks for measuring marketing's contribution to revenue through multi-touch attribution models. This skill covers model selection (first-touch through W-shaped), B2B-specific attribution challenges, self-reported attribution, and practical implementation guidance for connecting marketing activities to pipeline and revenue.

**Core Value:** Move beyond vanity metrics (impressions, clicks) to revenue attribution that shows which marketing activities actually generate pipeline and closed deals — enabling data-driven budget allocation.

**Scope boundary:** This skill focuses on *attribution methodology* — how to measure and credit marketing touchpoints. For campaign workflow design, see `marketing-automation`. For lead scoring that feeds attribution data, see `lead-scoring`. For campaign strategy, see `marketing-demand-acquisition`.

## Core Capabilities

- **Single-Touch Models** — First-touch and last-touch attribution with use cases and limitations
- **Multi-Touch Models** — Linear, time-decay, position-based (U-shaped), and W-shaped models with pros/cons
- **B2B Attribution Challenges** — Long sales cycles, multiple stakeholders, dark social, offline touchpoints
- **Self-Reported Attribution** — Survey-based attribution as a complement to software tracking
- **Model Selection** — Decision framework for choosing the right model based on sales cycle, data maturity, and business goals
- **Channel Effectiveness** — Measuring and comparing channel contribution to pipeline and revenue
- **Attribution Implementation** — Practical guidance for setting up attribution in CRM and analytics tools

## Quick Start

1. Audit your current state — what touchpoint data do you capture today?
2. Choose a model — use the selection guide in `references/attribution-model-selection-guide.md`
3. Implement tracking — ensure UTMs, CRM touchpoints, and form fields are capturing data
4. Add self-reported attribution — "How did you hear about us?" on key conversion forms
5. Build reports — attribution by channel, campaign, and content asset
6. Review monthly — compare model outputs with sales team's anecdotal feedback

## Attribution Models

### Single-Touch Models

#### First-Touch Attribution

Credits 100% of revenue to the first marketing interaction.

| Aspect | Details |
|--------|---------|
| **Best for** | Understanding top-of-funnel channel effectiveness |
| **Strength** | Simple to implement, highlights demand generation sources |
| **Weakness** | Ignores all nurturing and conversion touchpoints |
| **Use when** | Optimizing awareness campaigns, early-stage companies with limited data |

#### Last-Touch Attribution

Credits 100% of revenue to the final marketing interaction before conversion.

| Aspect | Details |
|--------|---------|
| **Best for** | Understanding what closes deals |
| **Strength** | Simple, directly tied to conversion event |
| **Weakness** | Ignores everything that brought the lead to the decision point |
| **Use when** | Optimizing bottom-of-funnel conversion, short sales cycles (<30 days) |

### Multi-Touch Models

#### Linear Attribution

Distributes credit equally across all touchpoints.

| Aspect | Details |
|--------|---------|
| **Best for** | Valuing the entire customer journey equally |
| **Credit distribution** | Each touchpoint gets 1/N of the credit (N = total touchpoints) |
| **Strength** | Fair representation of all marketing efforts |
| **Weakness** | Overvalues low-impact touches, undervalues critical conversion moments |
| **Use when** | Early multi-touch implementation, when you lack data to weight touches |

#### Time-Decay Attribution

Gives more credit to touchpoints closer to conversion.

| Aspect | Details |
|--------|---------|
| **Best for** | B2B with long sales cycles where recent interactions matter most |
| **Credit distribution** | Exponential decay from conversion backward (half-life typically 7-14 days) |
| **Strength** | Reflects that recent interactions are more influential |
| **Weakness** | Undervalues awareness activities that started the journey |
| **Use when** | Long sales cycles (60+ days), optimizing for conversion acceleration |

#### Position-Based (U-Shaped) Attribution

Weights first and last touches heavily, distributes remainder across middle touches.

| Aspect | Details |
|--------|---------|
| **Best for** | Balancing awareness and conversion |
| **Credit distribution** | 40% first touch, 40% last touch, 20% distributed across middle |
| **Strength** | Recognizes both demand gen and conversion while acknowledging nurture |
| **Weakness** | Arbitrary weighting (why 40/40/20?), misses the lead creation moment |
| **Use when** | Mid-maturity marketing teams, balanced channel optimization |

#### W-Shaped Attribution

Weights three critical moments: first touch, lead creation, and opportunity creation.

| Aspect | Details |
|--------|---------|
| **Best for** | B2B with distinct stages (awareness, lead, opportunity) |
| **Credit distribution** | 30% first touch, 30% lead creation, 30% opportunity creation, 10% distributed |
| **Strength** | Captures the three most important B2B conversion moments |
| **Weakness** | Requires clear lifecycle stage tracking in CRM, more complex to implement |
| **Use when** | Mature B2B marketing teams, 60+ day sales cycles, multiple stakeholders |

### Model Comparison

| Model | Complexity | Data Required | Best For | Limitation |
|-------|-----------|---------------|----------|-----------|
| First-touch | Low | Minimal | Top-of-funnel optimization | Ignores nurture |
| Last-touch | Low | Minimal | Conversion optimization | Ignores awareness |
| Linear | Medium | All touchpoints | Fair overview | Overvalues noise |
| Time-decay | Medium | Timestamped touchpoints | Long cycles | Undervalues awareness |
| U-shaped | Medium | First + last touch | Balanced view | Misses lead creation |
| W-shaped | High | Full lifecycle tracking | B2B revenue attribution | Complex setup |

## Key Workflows

### 1. Select and Implement Attribution Model

**Time:** 1-2 weeks

1. **Audit data availability:**
   - What touchpoints do you track? (UTMs, form fills, page visits, email clicks)
   - Do you have lifecycle stage tracking? (lead, MQL, SQL, opportunity, customer)
   - How many touchpoints per deal on average? (<5: single-touch is fine, 5-15: U-shaped, 15+: W-shaped)
2. **Assess sales cycle complexity:**
   - Average sales cycle length (under 30 days: last-touch, 30-90 days: U-shaped, 90+ days: W-shaped)
   - Average stakeholders per deal (1-2: simpler models, 3+: multi-touch essential)
   - Buying committee involvement (if multiple contacts per deal, account-level attribution needed)
3. **Choose model** using the selection guide in `references/attribution-model-selection-guide.md`
4. **Implement tracking:**
   - UTM taxonomy: source/medium/campaign/content/term standardized across all channels
   - CRM touchpoint object: capture every marketing interaction per contact
   - Form hidden fields: capture UTM params on all forms
   - Offline tracking: event attendance, direct mail codes, sales-assisted touches
5. **Build attribution reports:**
   - Channel attribution: revenue and pipeline by source/medium
   - Campaign attribution: ROI by campaign
   - Content attribution: which content assets influence pipeline
6. **Validate with sales:** Compare model output with sales team's perception of what influenced deals

### 2. Implement Self-Reported Attribution

**Time:** 2-3 days

Self-reported attribution captures what software misses:

1. **Add "How did you hear about us?" to key forms:**
   - Demo request form
   - Contact sales form
   - Trial signup (if B2B)
   - Not on every form — only high-intent conversion points
2. **Design the field:**
   - Open text field (richest data, hardest to analyze) OR
   - Dropdown with common options + "Other" (easier to analyze, may miss novel sources)
   - Recommended options: Search engine, LinkedIn, Podcast, Colleague/friend, Conference/event, Blog/article, Community (Slack/Discord), Other
3. **Analyze regularly:**
   - Compare self-reported sources with software-attributed sources
   - Identify "dark funnel" channels that software misses: podcasts, communities, word-of-mouth, social media browsing
   - Use discrepancies to inform budget allocation — if 30% self-report "podcast" but software shows 0% podcast attribution, your software model is blind to a major channel

### 3. Build Channel Effectiveness Report

**Time:** 1-2 days (recurring monthly)

1. **Pull data by channel:**
   - Spend per channel (monthly)
   - Leads generated per channel
   - MQLs per channel
   - Pipeline influenced per channel (using chosen attribution model)
   - Revenue attributed per channel
2. **Calculate efficiency metrics:**
   - Cost per Lead (CPL) = Spend / Leads
   - Cost per MQL = Spend / MQLs
   - Cost per Opportunity = Spend / Opportunities influenced
   - Customer Acquisition Cost (CAC) = Spend / Customers acquired
   - Return on Ad Spend (ROAS) = Revenue attributed / Spend
3. **Compare and rank channels** by efficiency at each stage
4. **Identify disconnects:**
   - Channels that generate lots of leads but few MQLs (quality problem)
   - Channels with high CAC but high LTV (acceptable if net positive)
   - Channels underrepresented in software but prominent in self-reported (dark funnel)

## B2B Attribution Challenges

### Long Sales Cycles

B2B deals can take 30-180+ days from first touch to close:

- **Cookie expiration:** Third-party cookies expire before deals close — use first-party data
- **Multi-session journeys:** Same person returns across devices/sessions — unify with email/login identity
- **Touchpoint decay:** Early touches lose significance in models — consider adjusting half-life

### Multiple Stakeholders

B2B deals involve 6-10 stakeholders on average:

- **Account-level attribution:** Roll up individual contact touches to the account level
- **Buying committee mapping:** Different roles discover, evaluate, and approve — attribute accordingly
- **Shared credit:** When 3 contacts from the same account each have different first-touch sources, all three channels deserve credit

### Dark Social and Dark Funnel

Significant influence happens where software can't track:

- **Word of mouth:** Colleague recommendations, team discussions
- **Communities:** Slack groups, Discord servers, Reddit threads (no UTMs when shared)
- **Podcasts:** Audio content has no clickable links — listeners search directly
- **Social browsing:** LinkedIn feed, Twitter scroll — influenced but not clicked
- **Mitigation:** Self-reported attribution is the primary tool for dark funnel visibility

## Python Tools

This skill currently has no Python automation tools. All capabilities are delivered through strategic frameworks and reference templates.

## Best Practices

### Model Selection

- Start simple (first-touch or last-touch), add complexity as data matures
- Run multiple models in parallel for 3 months before committing to one
- No model is "correct" — each tells a different story about the customer journey
- Combine software attribution with self-reported for the most complete picture

### Data Quality

- Standardize UTM taxonomy across all teams and channels before implementing attribution
- Audit UTM compliance monthly — one malformed campaign parameter can skew a quarter of data
- Ensure CRM captures all touchpoints, including offline (events, direct mail, sales calls)
- Deduplicate contacts and merge records to prevent double-counting

### Reporting

- Report attribution at three levels: channel, campaign, and content asset
- Show pipeline influence (how many deals touched) alongside revenue credit
- Include confidence indicators: "high confidence" for tracked, "estimated" for modeled
- Present self-reported alongside software-attributed to show the full picture

### Common Pitfalls

- **Over-crediting paid channels:** Paid ads are easy to track, so they often get disproportionate credit versus organic/dark funnel
- **Ignoring assisted touches:** Focus on "influenced pipeline" not just "sourced pipeline"
- **Attribution as truth:** Attribution models are *models* — useful approximations, not reality
- **Set-and-forget:** Review and recalibrate models quarterly as channels and buyer behavior evolve

## Reference Guides

**[attribution-model-selection-guide.md](references/attribution-model-selection-guide.md)** — Decision framework for selecting the right attribution model based on sales cycle length, data maturity, stakeholder count, and business goals. Includes selection flowchart and implementation checklist.

## Integration

This skill works best with:

- HubSpot (multi-touch attribution reporting)
- Salesforce (campaign influence, Bizible/Marketo Measure)
- Google Analytics (channel grouping, conversion paths)
- Dreamdata (B2B revenue attribution)
- Segment (event tracking, identity resolution)

## Additional Resources

- Attribution Model Selection Guide: [references/attribution-model-selection-guide.md](references/attribution-model-selection-guide.md)
- Related Skill: [../lead-scoring/SKILL.md](../lead-scoring/SKILL.md)
- Related Skill: [../marketing-automation/SKILL.md](../marketing-automation/SKILL.md)

---

**Last Updated**: March 2026 | **Version**: 1.0
