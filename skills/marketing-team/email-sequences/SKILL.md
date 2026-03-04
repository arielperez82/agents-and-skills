---
name: email-sequences
description: Email sequence design for lifecycle marketing — welcome, nurture, re-engagement,
  and renewal sequences with deliverability management (SPF, DKIM, DMARC), segmentation
  strategies, A/B testing methodology, and performance metrics. Use when designing
  email sequences, troubleshooting deliverability, building segmentation for email
  campaigns, or when user mentions email marketing, nurture sequences, or drip emails.
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
    - references/sequence-template.md
    assets: []
  difficulty: intermediate
  domain: marketing
  examples:
  - title: "B2B Welcome Sequence"
    input: "Design a welcome email sequence for new demo requesters at a B2B analytics company"
    output: "5-email sequence over 10 days. Email 1 (immediate): Thank you + meeting confirmation + what to expect. Email 2 (Day 1): Prep for demo — 3 common use cases, pick one to explore. Email 3 (Day 3): Customer case study matching their industry. Email 4 (Day 7): ROI calculator + comparison guide. Email 5 (Day 10): Post-demo follow-up or re-engagement if demo not yet booked. Branch: if demo completed, exit sequence and enter post-demo nurture."
  featured: false
  frequency: Weekly during campaign planning
  orchestrated-by: []
  related-agents:
  - email-marketing-specialist
  - marketing-ops-manager
  related-commands: []
  related-skills:
  - marketing-team/marketing-automation
  - marketing-team/lead-scoring
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: email-sequences
  tags:
  - email-marketing
  - email-sequences
  - deliverability
  - nurture
  - drip-campaigns
  - a-b-testing
  - spf
  - dkim
  - dmarc
  tech-stack:
  - HubSpot
  - Marketo
  - Customer.io
  - Mailchimp
  - SendGrid
  time-saved: 3-4 hours per sequence design
  title: Email Sequences Skill
  updated: 2026-03-04
  use-cases:
  - Designing lifecycle email sequences (welcome, nurture, re-engagement)
  - Managing email deliverability infrastructure
  - Building segmentation strategies for email campaigns
  - Optimizing email performance through A/B testing
  verified: true
  version: v1.0.0
---

# Email Sequences

## Overview

Frameworks for designing B2B email sequences that move leads through the funnel — from welcome to nurture to re-engagement. This skill covers sequence architecture, email copy patterns, deliverability management, segmentation, A/B testing, and performance metrics for lifecycle email marketing.

**Core Value:** Turn email from a broadcast channel into a systematic, behavior-driven pipeline generation engine with measurable impact on conversion and revenue.

**Scope boundary:** This skill focuses on *email-specific design and deliverability*. For multi-channel workflow orchestration that includes email, see `marketing-automation`. For cold outreach emails (prospecting), see the `sales-development-rep` agent. For email copy and creative, see `copywriter`.

## Core Capabilities

- **Sequence Types** — Welcome, nurture, re-engagement, renewal, event-triggered, post-purchase sequences
- **Email Copy Patterns** — Subject line formulas, preview text optimization, body structure, CTA design
- **Deliverability Management** — SPF, DKIM, DMARC configuration, domain warm-up, sender reputation monitoring
- **Segmentation** — Behavioral, lifecycle, engagement-based, and firmographic segmentation for targeting
- **A/B Testing** — Subject line, send time, content, and CTA testing methodology with statistical rigor
- **Key Metrics** — Open rate, CTR, conversion, unsubscribe, bounce rate benchmarks and optimization

## Quick Start

1. Choose sequence type — what lifecycle stage are you targeting?
2. Define entry trigger — what event enrolls contacts in this sequence?
3. Map the sequence — use the template in `references/sequence-template.md`
4. Write email briefs — subject, preview, body structure, CTA for each email
5. Set branching — behavioral paths for engaged vs disengaged recipients
6. Configure exit — goal met, opt-out, or timeout conditions
7. Launch with A/B test — test subject line on Email 1 to optimize from the start

## Sequence Types

### Welcome Sequence

**Purpose:** Onboard new leads/users and drive first activation milestone

| Element | Guideline |
|---------|-----------|
| **Length** | 5-8 emails over 14-21 days |
| **Cadence** | Front-loaded: Day 0, 1, 3, 5, 7, 10, 14 |
| **Tone** | Helpful, educational, not salesy |
| **Goal** | First activation milestone (login, feature use, demo) |
| **Key metric** | Activation rate within sequence window |

**Content progression:** Quick-start guide, key feature spotlight, integration/setup help, use case story, social proof, advanced features, conversion CTA.

### Nurture Sequence

**Purpose:** Move leads from awareness to consideration to decision

| Element | Guideline |
|---------|-----------|
| **Length** | 6-10 emails over 4-8 weeks |
| **Cadence** | 1-2 per week, consistent spacing |
| **Tone** | Educational, building trust and authority |
| **Goal** | Demo request, trial signup, or sales conversation |
| **Key metric** | MQL-to-SQL conversion rate |

**Content progression:** Industry insight, problem education, solution framework, case study, comparison/differentiation, social proof, direct CTA.

### Re-engagement Sequence

**Purpose:** Win back inactive leads or churned users

| Element | Guideline |
|---------|-----------|
| **Length** | 3-4 emails over 14-21 days |
| **Cadence** | Wider spacing: Day 0, 5, 12, 21 |
| **Tone** | Value-focused, not guilt-driven |
| **Goal** | Re-engagement (login, reply, click) |
| **Key metric** | Reactivation rate |
| **Sunset** | After final email with no engagement, suppress for 90 days |

**Content progression:** What's new since they left, customer success story, incentive offer, final direct outreach + sunset.

### Renewal/Expansion Sequence

**Purpose:** Drive contract renewal or account expansion

| Element | Guideline |
|---------|-----------|
| **Length** | 4-6 emails starting 60-90 days before renewal |
| **Cadence** | Monthly, then weekly in final month |
| **Tone** | Appreciative, ROI-focused |
| **Goal** | Renewal commitment or expansion conversation |
| **Key metric** | Net revenue retention |

**Content progression:** Usage summary + value delivered, new features since last renewal, expansion opportunity, renewal logistics, final reminder.

## Email Copy Patterns

### Subject Lines

**Formulas that work for B2B:**

- **Curiosity gap:** "The metric most [role] teams are tracking wrong"
- **Specific benefit:** "Cut your [metric] by 30% with this framework"
- **Social proof:** "How [known company] solved [specific problem]"
- **Question:** "Is your team still doing [outdated practice]?"
- **Direct value:** "[Resource name]: Free [template/guide/checklist]"

**Rules:**

- 6-10 words (40-60 characters) optimal for B2B
- Personalization beyond first name: company, industry, or behavior
- Avoid: ALL CAPS, excessive punctuation (!!!), spam trigger words (free, guarantee, act now)
- Test: A/B test every Email 1 subject line in every sequence

### Preview Text

- 40-90 characters that complement (not repeat) the subject line
- Treat as a second headline — adds context or curiosity
- If left blank, email clients show first line of body (often unsubscribe text)

### Body Structure

**Standard B2B email body (150-250 words):**

1. **Opening hook** (1-2 sentences): Connect to recipient's situation or recent behavior
2. **Value statement** (2-3 sentences): What insight or resource you're sharing and why it matters to them
3. **Supporting detail** (2-4 sentences): Data point, example, or brief case study
4. **CTA** (1 sentence): Single, clear call-to-action. Button or inline link.
5. **PS line** (optional): Secondary CTA or social proof

**Rules:**

- One CTA per email — multiple CTAs reduce conversion by 30%+
- Mobile-first: 600px max width, large touch targets, short paragraphs
- Plain text or minimal HTML — plain text often outperforms designed emails for B2B

### CTA Design

| Type | Best For | Example |
|------|----------|---------|
| **Low commitment** | Early in sequence | "Read the guide", "Watch the 2-min video" |
| **Medium commitment** | Mid-sequence | "Download the template", "Join the webinar" |
| **High commitment** | Late in sequence | "Book a demo", "Start your trial", "Talk to sales" |

## Deliverability

### Authentication (Required)

| Protocol | Purpose | Implementation |
|----------|---------|---------------|
| **SPF** | Authorizes sending servers | DNS TXT record listing permitted IPs/domains |
| **DKIM** | Verifies email wasn't altered in transit | DNS TXT record with public key, email signed with private key |
| **DMARC** | Policy for SPF/DKIM failures | DNS TXT record: start with `p=none` (monitor), move to `p=quarantine`, then `p=reject` |

**Verification:** Use tools like MXToolbox, dmarcian, or Google Postmaster to verify all three are configured and passing.

### Domain Warm-Up

When sending from a new domain or IP:

| Week | Daily Volume | Target |
|------|-------------|--------|
| Week 1 | 50-100 | Most engaged contacts only |
| Week 2 | 200-500 | Highly engaged contacts |
| Week 3 | 500-1,000 | Engaged contacts |
| Week 4 | 1,000-5,000 | All active contacts |
| Week 5+ | Full volume | Normal sending |

**Rules:** Start with your most engaged recipients (highest open rates). Send only to verified, opted-in addresses during warm-up. Monitor bounce and complaint rates daily.

### Sender Reputation

| Metric | Healthy | Warning | Critical |
|--------|---------|---------|----------|
| **Bounce rate** | <1% | 1-2% | >2% |
| **Complaint rate** | <0.05% | 0.05-0.1% | >0.1% |
| **Unsubscribe rate** | <0.3% | 0.3-0.5% | >0.5% |
| **Sender score** | 80-100 | 60-79 | <60 |

### List Hygiene

- Remove hard bounces immediately (after first bounce)
- Suppress soft bounces after 3 consecutive occurrences
- Sunset contacts with zero engagement for 90+ days
- Re-confirm opt-in for contacts imported from old lists
- Never purchase email lists — destroys sender reputation

## A/B Testing

### What to Test

| Variable | Impact | Test Duration | Sample Size |
|----------|--------|--------------|-------------|
| **Subject line** | High | 2-4 hours (then send winner to rest) | 20% of list per variant |
| **Send time** | Medium | 2+ weeks (same content, different times) | Full list split |
| **CTA text** | Medium-High | 1-2 weeks | 500+ per variant |
| **Content format** | Medium | 2-4 weeks | 500+ per variant |
| **From name** | Medium | 2+ weeks | Full list split |

### Testing Rules

- Test one variable at a time — never subject AND content simultaneously
- Minimum 500 contacts per variant for meaningful results
- Run for at least 1 full business week (B2B engagement varies by day)
- Declare winner at 95% statistical confidence
- Document all test results for institutional knowledge

## Key Metrics and Benchmarks

### B2B Email Benchmarks (2025-2026)

| Metric | Good | Great | Investigate If |
|--------|------|-------|---------------|
| **Open rate** | 20-25% | >30% | <15% |
| **Click-through rate** | 2-3% | >5% | <1% |
| **Click-to-open rate** | 10-15% | >20% | <8% |
| **Conversion rate** | 1-2% | >3% | <0.5% |
| **Unsubscribe rate** | <0.3% | <0.1% | >0.5% |
| **Bounce rate** | <1% | <0.5% | >2% |

### Sequence-Level Metrics

- **Completion rate:** % of enrolled contacts who reach the final email
- **Goal conversion rate:** % who achieve the sequence objective (demo, trial, purchase)
- **Time to convert:** Average days from enrollment to goal achievement
- **Drop-off analysis:** Which step has the highest exit rate? (Optimize that email)
- **Revenue influence:** Pipeline and revenue attributed to sequence (via attribution model)

## Python Tools

This skill currently has no Python automation tools. All capabilities are delivered through strategic frameworks and reference templates.

## Best Practices

### Sequence Design

- One sequence, one objective — don't try to nurture AND sell AND re-engage in one flow
- Front-load value: the first 3 emails determine whether recipients stay engaged
- Include behavioral branching: engaged and disengaged recipients need different paths
- Always include exit conditions: goal met, opt-out, timeout

### Copy

- Write subject lines last (after body is clear, the subject becomes obvious)
- Personalize with behavior, not just merge fields: "I noticed you downloaded our guide on X"
- Keep emails scannable: short paragraphs, bullet points, bold key phrases
- Sound human: write like a helpful colleague, not a marketing department

### Deliverability

- Authenticate everything (SPF + DKIM + DMARC) before sending your first email
- Warm up new domains gradually — rushing volume destroys reputation
- Clean your list quarterly: remove bounces, suppress non-engagers, verify addresses
- Monitor metrics weekly: a sudden drop in open rates signals deliverability problems

## Reference Guides

**[sequence-template.md](references/sequence-template.md)** — Complete email sequence design template with enrollment criteria, step-by-step email briefs, branching logic, exit conditions, A/B test plan, and measurement framework.

## Integration

This skill works best with:

- HubSpot (sequences, workflows, analytics)
- Marketo (engagement programs, email analytics)
- Customer.io (event-triggered emails, segments)
- Mailchimp (campaigns, automations, analytics)
- SendGrid (transactional + marketing email, deliverability tools)

## Additional Resources

- Sequence Template: [references/sequence-template.md](references/sequence-template.md)
- Related Skill: [../marketing-automation/SKILL.md](../marketing-automation/SKILL.md)
- Related Skill: [../lead-scoring/SKILL.md](../lead-scoring/SKILL.md)

---

**Last Updated**: March 2026 | **Version**: 1.0
