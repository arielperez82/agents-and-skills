---
name: marketing-automation
description: Marketing automation workflow design for nurture sequences, drip campaigns,
  trigger-based workflows, and multi-channel campaign orchestration. Covers segmentation
  strategies, workflow logic (branching, delays, conditional sends), and tool-agnostic
  patterns applicable to HubSpot, Marketo, and Customer.io. Use when designing marketing
  automation workflows, building nurture sequences, architecting campaign automation,
  or when user mentions drip campaigns, nurture flows, or marketing workflows.
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
    - references/workflow-template.md
    assets: []
  difficulty: intermediate
  domain: marketing
  examples:
  - title: "Design SaaS Onboarding Nurture Sequence"
    input: "Design a nurture workflow for new trial signups of a B2B SaaS product"
    output: "7-email drip sequence over 14 days: Day 0 welcome + quick-start guide, Day 1 key feature highlight, Day 3 use case story, Day 5 integration setup, Day 7 social proof + case study, Day 10 advanced features, Day 14 trial expiry + upgrade CTA. Branch: if user activates key feature before Day 5, skip to advanced track. If no login after Day 3, trigger re-engagement sequence."
  featured: false
  frequency: Weekly during campaign planning
  orchestrated-by: []
  related-agents:
  - marketing-ops-manager
  - email-marketing-specialist
  related-commands: []
  related-skills:
  - marketing-team/lead-scoring
  - marketing-team/email-sequences
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: marketing-automation
  tags:
  - marketing-automation
  - nurture
  - drip-campaigns
  - workflow
  - segmentation
  - campaign-orchestration
  tech-stack:
  - HubSpot
  - Marketo
  - Customer.io
  - ActiveCampaign
  - Pardot
  time-saved: 4-6 hours per workflow design
  title: Marketing Automation Skill
  updated: 2026-03-04
  use-cases:
  - Designing multi-step nurture workflows with branching logic
  - Building trigger-based automation for lifecycle events
  - Architecting multi-channel campaign orchestration
  - Creating segmentation strategies for targeted campaigns
  verified: true
  version: v1.0.0
---

# Marketing Automation

## Overview

Frameworks and patterns for designing marketing automation workflows that nurture leads through the funnel, trigger actions based on behavior, and orchestrate multi-channel campaigns. This skill covers workflow architecture (branching, delays, conditional logic), segmentation strategies, and campaign orchestration patterns that are tool-agnostic.

**Core Value:** Transform manual, inconsistent follow-up into systematic, behavior-driven workflows that deliver the right message at the right time — increasing conversion rates while reducing manual marketing effort.

**Scope boundary:** This skill focuses on *workflow design and automation logic* — how to structure sequences, define triggers, and orchestrate across channels. For email-specific copy patterns and deliverability, see `email-sequences`. For lead scoring that triggers workflows, see `lead-scoring`. For campaign strategy and channel selection, see `marketing-demand-acquisition`.

## Core Capabilities

- **Nurture Workflow Design** — Multi-step sequences with branching logic for drip campaigns, lifecycle nurture, and re-engagement flows
- **Trigger-Based Automation** — Event-driven workflows triggered by behavioral signals (form fills, page visits, product usage, score changes)
- **Segmentation Strategies** — Dynamic and static segmentation for targeted campaign delivery based on demographic, behavioral, and engagement criteria
- **Workflow Logic** — If/then branching, time delays, conditional sends, A/B path splits, and goal-based exits
- **Multi-Channel Orchestration** — Coordinating email, in-app, SMS, retargeting, and direct mail touchpoints in unified campaigns
- **Lifecycle Campaigns** — Onboarding, activation, retention, expansion, and win-back workflow patterns
- **Campaign Performance Optimization** — Workflow analytics, bottleneck identification, and iteration patterns

## Quick Start

1. Define the goal — what behavior or outcome should this workflow drive?
2. Map the audience segment — who enters this workflow and what do they have in common?
3. Design the trigger — what event or condition starts the workflow?
4. Build the sequence — use the workflow template in `references/workflow-template.md`
5. Add branching — define if/then paths based on recipient behavior
6. Set exit conditions — when does someone leave the workflow (goal met, unsubscribe, timeout)?
7. Test — send test messages, verify branching logic, check timing

## Key Workflows

### 1. Design Nurture Sequence

**Time:** 2-4 days

1. **Define objective:** What action should the lead take at the end? (demo request, trial signup, purchase)
2. **Map audience:** Which segment enters? (new leads, MQLs, trial users, churned accounts)
3. **Choose cadence:**
   - Awareness stage: 1 email per week (educational, non-salesy)
   - Consideration stage: 2-3 per week (case studies, comparisons, social proof)
   - Decision stage: Daily for 3-5 days (urgency, offers, direct CTA)
4. **Design content progression:**
   - Email 1: Value-first (solve a problem, share insight)
   - Email 2-3: Educate (how your solution works, use cases)
   - Email 4-5: Social proof (case studies, testimonials, data)
   - Email 6-7: Convert (demo CTA, trial offer, consultation)
5. **Add behavioral branches:**
   - If opens but doesn't click: send alternative content angle
   - If clicks pricing page: fast-track to sales sequence
   - If no opens after 3 emails: reduce frequency or pause
6. **Set exit conditions:**
   - Goal met (demo booked, trial started)
   - Unsubscribe
   - 30 days with zero engagement: move to re-engagement workflow
7. **Configure analytics:** Track conversion rate per step, drop-off points, time-to-convert

### 2. Build Trigger-Based Workflow

**Time:** 1-2 days per trigger

Trigger-based workflows respond to specific events in real-time:

1. **Identify trigger event:**
   - Form submission (content download, webinar registration, contact request)
   - Behavioral signal (pricing page visit, product signup, feature activation)
   - Score change (lead score crosses MQL threshold)
   - Lifecycle event (trial start, trial expiry approaching, contract renewal)
   - Negative signal (unsubscribe, bounce, complaint)
2. **Define immediate response** (within 5 minutes of trigger):
   - Confirmation/thank-you email
   - Internal notification (Slack alert to sales for high-intent triggers)
   - CRM record update (lifecycle stage, lead score adjustment)
3. **Design follow-up sequence:**
   - Time-delayed follow-ups (1 hour, 1 day, 3 days)
   - Branch based on subsequent behavior
   - Escalate to sales if high-intent signals accumulate
4. **Set suppression rules:**
   - Don't trigger if lead is already in a higher-priority workflow
   - Frequency cap: max 1 trigger workflow enrollment per 48 hours
   - Respect communication preferences and opt-outs

### 3. Architect Multi-Channel Campaign

**Time:** 1-2 weeks

Coordinate touchpoints across channels for unified campaigns:

1. **Define campaign theme and timeline** (4-8 week campaign window)
2. **Map channel mix:**
   - Email: Primary nurture (3-5 touchpoints)
   - LinkedIn: Sponsored content + InMail (2-3 touchpoints)
   - Retargeting: Display ads to engaged contacts (continuous)
   - In-app: Messages/banners for existing users (2-3 touchpoints)
   - Direct mail: For high-value target accounts only (1 touchpoint)
3. **Sequence across channels:**
   - Week 1: Email intro + LinkedIn Sponsored Content
   - Week 2: Email follow-up + retargeting starts
   - Week 3: LinkedIn InMail + email case study
   - Week 4: In-app message + email offer
   - Week 5-6: Retargeting intensifies + email urgency sequence
4. **Unify tracking:**
   - UTM parameters on all links
   - Cross-channel attribution (see `attribution-modeling` skill)
   - Single contact timeline in CRM showing all channel interactions
5. **Coordinate suppression:**
   - If lead converts via any channel, suppress across all others
   - If lead opts out of email, continue LinkedIn/retargeting (different consent)
   - Frequency cap: max 3 total touchpoints per week across all channels

## Segmentation Framework

### Segmentation Dimensions

| Dimension | Static | Dynamic | Example |
|-----------|--------|---------|---------|
| Demographic | Job title, seniority | — | "VP+ at companies >500 employees" |
| Firmographic | Industry, company size | Revenue growth | "SaaS companies, Series B+" |
| Behavioral | — | Page visits, content downloads | "Visited pricing 2+ times in 7 days" |
| Engagement | — | Email opens, event attendance | "Opened 3+ emails in last 30 days" |
| Lifecycle | — | Stage (lead, MQL, SQL, customer) | "MQL for 30+ days, not yet SQL" |
| Product | — | Feature usage, activation | "Activated core feature, not invited team" |

### Segmentation Best Practices

- **Start broad, refine narrow:** Begin with 3-5 segments, add granularity as data proves differences
- **Dynamic over static:** Prefer behavioral/engagement segments that update automatically
- **Mutually exclusive:** Each contact should be in one primary segment for any given campaign
- **Minimum viable segment:** At least 500 contacts per segment for statistically meaningful results
- **Review quarterly:** Segments drift as your audience evolves — re-validate criteria

## Workflow Logic Patterns

### Branching Patterns

```text
[Trigger: Form Submit]
  |
  +-- IF score >= 75 (SQL threshold)
  |   +-- Route to sales + send "meeting request" email
  |
  +-- IF score >= 50 (MQL threshold)
  |   +-- Enter nurture sequence (consideration stage)
  |
  +-- ELSE (below MQL)
      +-- Enter educational drip (awareness stage)
```

### Time Delay Patterns

- **Immediate:** Confirmation emails, internal alerts
- **1-4 hours:** Follow-up to high-intent actions (during business hours)
- **1 day:** Standard follow-up cadence
- **3-7 days:** Between nurture sequence steps
- **14-30 days:** Re-engagement check-in
- **Smart send:** Optimize send time per recipient based on historical open patterns

### Goal-Based Exit

Every workflow should have a clear exit condition:

- **Positive exit:** Goal achieved (demo booked, purchase made, feature activated)
- **Negative exit:** Opted out, bounced, disqualified
- **Timeout exit:** No engagement for X days — move to different workflow or suppress
- **Override exit:** Manually removed by sales or marketing

## Python Tools

This skill currently has no Python automation tools. All capabilities are delivered through strategic frameworks and reference templates.

## Best Practices

### Workflow Design

- One workflow, one objective — don't try to do everything in a single workflow
- Keep sequences to 5-8 steps maximum — longer sequences see diminishing returns
- Always include a "do nothing" path — not every lead needs immediate action
- Test workflows end-to-end before launching with real contacts
- Document workflow logic visually (flowchart) for team alignment

### Content

- Lead with value, not with your product — educational content outperforms sales pitches 3:1
- Personalize beyond first name — reference industry, company size, or previous behavior
- Match content depth to funnel stage — awareness (why), consideration (how), decision (proof)
- Include one clear CTA per email — multiple CTAs reduce conversion by 30%+

### Operations

- Set frequency caps: max 3 marketing emails per week per contact (across all workflows)
- Implement sunset policies: suppress contacts with zero engagement after 90 days
- Monitor deliverability: keep bounce rate <2%, complaint rate <0.1%
- A/B test one variable at a time: subject line OR send time OR content — never all at once

### Measurement

- Track conversion rate per workflow step (identify where leads drop off)
- Measure time-to-convert by workflow type
- Compare workflow performance against no-workflow control group
- Report on workflow contribution to pipeline (influenced revenue)

## Reference Guides

**[workflow-template.md](references/workflow-template.md)** — Complete workflow design template with trigger definition, audience criteria, sequence steps, branching logic, exit conditions, and measurement framework.

## Integration

This skill works best with:

- HubSpot (workflows, sequences, lists)
- Marketo (engagement programs, smart campaigns)
- Customer.io (segments, campaigns, broadcasts)
- ActiveCampaign (automations, conditional content)
- Pardot (engagement studio, automation rules)

## Additional Resources

- Workflow Template: [references/workflow-template.md](references/workflow-template.md)
- Related Skill: [../lead-scoring/SKILL.md](../lead-scoring/SKILL.md)
- Related Skill: [../email-sequences/SKILL.md](../email-sequences/SKILL.md)

---

**Last Updated**: March 2026 | **Version**: 1.0
