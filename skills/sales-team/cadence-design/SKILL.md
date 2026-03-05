---
name: cadence-design
description: Multi-channel outreach sequence architecture, cadence timing optimization,
  persona-based adaptation, and A/B testing methodology for B2B sales development.
  Complements sales-outreach (individual message crafting) with sequence-level design
  and optimization.
license: MIT
metadata:
  author: Claude Skills Team
  compatibility:
    platforms:
    - macos
    - linux
    - windows
  contributors: []
  created: 2026-03-05
  dependencies:
    scripts: []
    references:
    - cadence-template.md
  difficulty: intermediate
  domain: sales
  examples:
  - title: SMB Multi-Channel Cadence
    input: 'Design a cadence for SMB SaaS prospects (50-200 employees), targeting
      VP of Engineering, pain point: slow CI/CD pipelines'
    output: '8-touch cadence over 14 days: Day 1 email (pain hook), Day 2 LinkedIn
      connect, Day 4 email (case study), Day 6 phone, Day 8 LinkedIn message, Day
      10 email (social proof), Day 12 phone, Day 14 breakup email. Channel mix: 50%
      email, 25% phone, 25% LinkedIn.'
  - title: Enterprise Executive Cadence
    input: 'Design a cadence for enterprise CIO at a Fortune 500, pain point: cloud
      migration stalled at 30% completion'
    output: '18-touch cadence over 40 days: LinkedIn-heavy opening (exec visibility),
      brief outcome-focused emails, strategic phone attempts at 7am/5pm windows, peer
      reference offers. Longer spacing (3-5 days between touches), executive tone
      throughout, board-level language in subject lines.'
  featured: false
  frequency: Per-campaign or per-persona segment, weekly iteration
  orchestrated-by: []
  related-agents:
  - sales-development-rep
  - email-marketing-specialist
  related-commands: []
  related-skills:
  - sales-team/sales-outreach
  - sales-team/lead-qualification
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: sales-development
  tags:
  - sales
  - cadence
  - outreach
  - sequence
  - sdr
  - prospecting
  - sales-development
  time-saved: Reduces cadence design from 2-3 hours to 15 minutes per persona segment
  title: Cadence Design & Sequence Architecture
  updated: 2026-03-05
  use-cases:
  - Designing multi-channel outreach sequences for new persona segments
  - Optimizing touch count and spacing by deal size (SMB, mid-market, enterprise)
  - Adapting cadence structure for different buyer personas (technical, executive, operational)
  - Running A/B tests on cadence variables (timing, channel mix, messaging angle)
  - Diagnosing underperforming cadences and identifying improvement levers
  - Building branching logic for prospect engagement signals
  verified: true
  version: v1.0.0
---

# Cadence Design & Sequence Architecture

## Overview

This skill covers the architecture of multi-channel outreach sequences -- the structural decisions about how many touches, which channels, what spacing, and in what order. It is the sequence-level counterpart to sales-outreach, which handles individual message crafting.

**The distinction matters:** sales-outreach answers "What should this email say?" Cadence design answers "Should this touchpoint be an email at all, or should it be a phone call? And should it happen on Day 3 or Day 7?" These are different decisions requiring different frameworks.

**Core belief:** A mediocre message delivered through a well-designed cadence will outperform a brilliant message sent once with no follow-up. Persistence, channel variety, and intelligent timing are the structural advantages that separate high-performing SDR teams from average ones. Most prospects do not respond to the first touch -- not because the message was bad, but because the timing was wrong or the channel did not match their behavior.

**Target audience:** SDR managers designing cadences for their team, individual SDRs building custom sequences for specific segments, and revenue operations teams standardizing outreach playbooks across the organization.

**What this skill does NOT cover:** Individual email copy, subject line writing, or personalization hooks (use capability discovery for "sales outreach" or "email personalization"). Lead research and qualification (use capability discovery for "lead research" or "lead qualification"). This skill starts with a defined target persona and produces a complete sequence architecture.

**Relationship to sales-outreach:** These two skills are complementary. Cadence design produces the sequence blueprint (channels, timing, touch count, branching logic). Sales-outreach fills in each touchpoint with personalized content. Use both together for a complete outreach program.

---

## Multi-Channel Sequence Structure

A cadence is an ordered sequence of touchpoints across multiple channels, designed to maximize the probability of a meaningful conversation with a prospect. Single-channel cadences (email-only) underperform multi-channel cadences by 30-50% on reply rates because they depend entirely on one communication preference.

### Channel Selection

Each channel has different strengths, appropriate use cases, and prospect expectations.

| Channel | Strengths | Best For | Limitations |
|---------|-----------|----------|-------------|
| **Email** | Asynchronous, scalable, trackable (opens/clicks), allows detailed content | Sharing value (case studies, insights, data), initial outreach, follow-ups | Easy to ignore, spam filters, inbox fatigue |
| **LinkedIn** | Professional context, profile visibility, social proof, connection persistence | Executive outreach, establishing credibility, warm touches between emails | Character limits on connection requests, InMail costs, platform restrictions |
| **Phone** | Real-time conversation, rapport building, immediate objection handling | Urgent follow-ups, breaking through after email silence, operational buyers | Low pickup rates (8-12%), time-zone dependent, requires preparation |
| **Video message** | Personal touch, differentiator, demonstrates effort | High-value targets, mid-cadence pattern interrupt, product demonstrations | Production time, file size for email embedding, not scalable |
| **Direct mail** | Physical presence, pattern interrupt, high memorability | Enterprise targets, executive buyers, account-based plays | Cost, logistics, slow delivery, hard to track |

### Channel Selection by Persona

Different buyer personas have different channel preferences. Match your primary channel to their behavior patterns.

| Persona | Primary Channel | Secondary Channel | Avoid |
|---------|----------------|-------------------|-------|
| **Technical buyers** (engineers, architects) | Email (technical content) | LinkedIn (if active) | Cold phone (interrupts flow state) |
| **Executive buyers** (VP+, C-suite) | LinkedIn (visibility + brevity) | Email (brief, outcome-focused) | Long emails, generic phone calls |
| **Operational buyers** (directors, managers) | Phone (pragmatic, direct) | Email (demo-forward content) | LinkedIn-only (less active on platform) |

### Channel Mixing Rules

Predictable channel patterns are easy to tune out. Vary channels to reach prospects where they are most receptive at that moment.

**Rules:**

1. **Never use the same channel three times in a row.** Two consecutive emails are acceptable (e.g., initial + value-add follow-up). Three consecutive emails signal automation and get filtered.
2. **Alternate high-effort and low-effort touches.** A phone call (high effort) should be followed by a lighter touch (LinkedIn view or brief email), not another phone call.
3. **Open with a channel that establishes context.** Email or LinkedIn provide written context the prospect can reference. Starting with a cold call gives no context and forces real-time processing.
4. **Use phone calls after digital engagement signals.** If a prospect opens an email or views your LinkedIn profile, that is the moment to call -- they have context and demonstrated interest.
5. **Place pattern interrupts mid-cadence.** If the first half of the cadence is email + LinkedIn, introduce phone or video in the middle to break the pattern.

### Sequence Architecture Patterns

**The Surround Pattern (recommended for most B2B):**

```
Email → LinkedIn → Email → Phone → LinkedIn → Email → Phone → Breakup Email
```

This pattern surrounds the prospect across channels without being overwhelming on any single channel. Each channel reinforces the others: email provides detail, LinkedIn provides social proof and visibility, phone provides urgency and personal connection.

**The Digital-First Pattern (for technical buyers):**

```
Email → LinkedIn → Email → Email → LinkedIn → Email → Breakup Email
```

Minimizes phone interruption. Relies on written communication where technical buyers are most comfortable. Uses LinkedIn for visibility rather than direct messaging.

**The Phone-Heavy Pattern (for operational buyers):**

```
Email → Phone → Email → Phone → LinkedIn → Phone → Email → Breakup Email
```

Leads with email for context, then emphasizes phone for the pragmatic, conversation-oriented operational buyer. Phone attempts are spaced with written touches so each call has a new reason to connect.

**The Executive Pattern (for VP+ targets):**

```
LinkedIn Connect → LinkedIn Message → Email → Phone → LinkedIn → Email → Breakup Email
```

Opens on LinkedIn where executives maintain professional presence. Establishes visibility before email outreach. Phone call placed after digital engagement to maximize pickup probability.

---

## Cadence Timing

Timing is the most underrated variable in cadence design. The same message sent on Tuesday at 8am and Friday at 4pm will produce dramatically different results. Timing optimization covers three dimensions: spacing between touches, day of week, and time of day.

### Spacing Between Touches

Spacing determines cadence intensity. Too tight and you annoy the prospect. Too loose and you lose momentum and mindshare.

**Spacing framework:**

| Cadence Phase | Spacing | Rationale |
|---------------|---------|-----------|
| **Touches 1-3** (opening) | 2-3 days apart | Establish presence quickly while the trigger event or research is fresh |
| **Touches 4-6** (middle) | 3-4 days apart | Give the prospect time to engage; reduce pressure |
| **Touches 7+** (closing) | 4-5 days apart | Wider spacing signals respect for their time while maintaining persistence |
| **Breakup touch** | 5-7 days after last touch | Clean separation before the final message |

**Why spacing expands over time:** Early in the cadence, you are establishing awareness -- tighter spacing builds familiarity. Later in the cadence, if the prospect has not responded, either the timing is wrong or the priority is low. Wider spacing reduces annoyance while keeping you in consideration for when priorities shift.

### Day-of-Week Optimization

Not all days are equal for outreach. Aggregate B2B data shows consistent patterns, though individual results vary by industry and persona.

**Email:**

| Day | Effectiveness | Notes |
|-----|--------------|-------|
| Monday | Low-Moderate | Inbox is full from weekend; emails get buried |
| **Tuesday** | **High** | Best day for email across most B2B segments |
| **Wednesday** | **High** | Second-best day; mid-week focus time |
| **Thursday** | **High** | Strong; prospect has cleared Monday backlog |
| Friday | Low | Winding down; less likely to start new conversations |

**Phone:**

| Day | Effectiveness | Notes |
|-----|--------------|-------|
| **Monday** | **Moderate-High** | Prospects are planning their week; more likely to be at desk |
| Tuesday | Moderate | Good, but email is the stronger channel today |
| Wednesday | Moderate | Mid-week; acceptable for phone |
| Thursday | Moderate | Acceptable |
| **Friday** | **Moderate-High** | Lighter schedules; more likely to pick up; casual tone works |

**LinkedIn:**

| Day | Effectiveness | Notes |
|-----|--------------|-------|
| Monday | Moderate | Professionals check LinkedIn early in the week |
| **Tuesday** | **High** | Peak professional social activity |
| **Wednesday** | **High** | Strong LinkedIn engagement mid-week |
| Thursday | Moderate | Acceptable |
| Friday | Low-Moderate | Lower engagement as the week winds down |

### Time-of-Day by Persona

Different roles have different schedule patterns. Reach them when they are most likely to be available and receptive.

**Executive buyers (VP+, C-suite):**

| Time Window | Effectiveness | Rationale |
|-------------|--------------|-----------|
| **7:00-8:00 AM** | **High** | Before meetings start; reviewing messages during morning routine |
| 8:00 AM-12:00 PM | Low | Back-to-back meetings; unlikely to engage with cold outreach |
| 12:00-1:00 PM | Low-Moderate | Lunch; may check messages briefly |
| 1:00-5:00 PM | Low | Afternoon meetings; deep work if any |
| **5:00-6:00 PM** | **High** | Meetings done; clearing inbox before leaving |

**Technical buyers (engineers, architects, CTOs at smaller companies):**

| Time Window | Effectiveness | Rationale |
|-------------|--------------|-----------|
| 7:00-9:00 AM | Low-Moderate | May be in deep work or standup meetings |
| **10:00 AM-12:00 PM** | **High** | Post-standup, pre-lunch; checking communications |
| **12:00-2:00 PM** | **High** | Lunch break and early afternoon; more receptive to non-coding tasks |
| 2:00-5:00 PM | Low-Moderate | Afternoon coding blocks; do not disturb |
| 5:00-6:00 PM | Moderate | Wrapping up; may check messages |

**Operational buyers (directors, managers, IT leads):**

| Time Window | Effectiveness | Rationale |
|-------------|--------------|-----------|
| **8:00-10:00 AM** | **High** | Morning planning; reviewing priorities for the day |
| 10:00 AM-12:00 PM | Moderate | In meetings or managing team |
| 12:00-1:00 PM | Moderate | Lunch; may check messages |
| **1:00-3:00 PM** | **High** | Post-lunch; back to execution mode; evaluating tools and processes |
| 3:00-5:00 PM | Moderate | End-of-day wrap-up; acceptable but not peak |

---

## Touch Count by Segment

The number of touches and total cadence duration should scale with deal complexity, decision-making speed, and typical sales cycle length. Under-touching loses winnable deals. Over-touching damages brand perception.

### SMB Cadences (8-12 touches over 14-21 days)

**Why fewer touches, shorter duration:** SMB buyers make faster decisions with fewer stakeholders. The decision maker is often the user. Budget approval is simpler. If they are interested, they respond quickly. If they do not respond after 8-12 touches, the timing is wrong -- park the lead and revisit in 60-90 days.

**Recommended structure:**

| Touch | Day | Channel | Purpose |
|-------|-----|---------|---------|
| 1 | 1 | Email | Initial outreach with personalization hook |
| 2 | 2 | LinkedIn | Connection request with brief note |
| 3 | 4 | Email | Value-add follow-up (case study or data point) |
| 4 | 6 | Phone | Direct conversation attempt |
| 5 | 8 | Email | Different angle (social proof or new insight) |
| 6 | 10 | LinkedIn | Engage with their content or send resource |
| 7 | 13 | Phone | Second call attempt with voicemail |
| 8 | 15 | Email | Breakup email |

**Optional extensions (touches 9-12):** Add if the prospect has shown partial engagement (opened emails, viewed LinkedIn profile) but has not replied. Space additional touches 3-4 days apart, alternating email and phone.

**Channel mix target:** 50% email, 25% phone, 25% LinkedIn.

### Mid-Market Cadences (12-16 touches over 21-30 days)

**Why more touches, longer duration:** Mid-market deals involve 3-5 stakeholders, budget reviews, and vendor evaluations. The prospect may be interested but needs time to socialize the idea internally. Persistence through a longer cadence gives them time to build internal consensus.

**Recommended structure:**

| Touch | Day | Channel | Purpose |
|-------|-----|---------|---------|
| 1 | 1 | Email | Initial outreach with personalization hook |
| 2 | 2 | LinkedIn | Connection request with context |
| 3 | 4 | Email | Value-add (relevant case study, same industry/size) |
| 4 | 6 | Phone | Direct call attempt |
| 5 | 8 | LinkedIn | Share relevant content or engage with their post |
| 6 | 10 | Email | Different angle (ROI data, competitive insight) |
| 7 | 12 | Phone | Second call attempt, reference previous touches |
| 8 | 15 | Email | New trigger or insight |
| 9 | 17 | LinkedIn | Direct message with peer reference offer |
| 10 | 19 | Phone | Third call attempt |
| 11 | 22 | Email | Social proof from similar company |
| 12 | 25 | Email | Breakup email |

**Optional extensions (touches 13-16):** For prospects showing engagement signals. Add video message (touch 13, Day 27), phone (touch 14, Day 29), email with executive sponsor intro offer (touch 15, Day 32), final breakup (touch 16, Day 35).

**Channel mix target:** 40% email, 25% phone, 25% LinkedIn, 10% video/other.

### Enterprise Cadences (16-20 touches over 30-45 days)

**Why the most touches, longest duration:** Enterprise deals involve 7-15 stakeholders, long procurement cycles, and committee-based decisions. The prospect you are contacting may need 5+ touches before they even forward your message internally. Enterprise cadences are marathons, not sprints -- they require patience, variety, and escalating value at each stage.

**Recommended structure:**

| Touch | Day | Channel | Purpose |
|-------|-----|---------|---------|
| 1 | 1 | LinkedIn | Connection request (establish professional presence) |
| 2 | 2 | Email | Initial outreach, outcome-focused, executive tone |
| 3 | 4 | LinkedIn | Engage with their content or company page |
| 4 | 6 | Email | Industry-specific insight or analyst report |
| 5 | 8 | Phone | First call attempt, reference email content |
| 6 | 10 | Email | Peer company case study (same industry, similar scale) |
| 7 | 13 | LinkedIn | Share thought leadership content |
| 8 | 15 | Phone | Second call attempt |
| 9 | 17 | Email | Executive-to-executive intro offer |
| 10 | 20 | LinkedIn | Direct message with specific question |
| 11 | 22 | Phone | Third call attempt with voicemail |
| 12 | 25 | Email | New angle (competitive intelligence, market trend) |
| 13 | 28 | Video message | Personal video with prospect-specific insight |
| 14 | 30 | Phone | Fourth call attempt |
| 15 | 33 | Email | Event or webinar invitation |
| 16 | 36 | LinkedIn | Final engagement attempt |
| 17 | 39 | Email | Breakup email (leave door open) |

**Optional extensions (touches 18-20):** Direct mail piece (Day 41), executive sponsor voicemail (Day 43), final email with long-term nurture offer (Day 45).

**Channel mix target:** 35% email, 25% phone, 25% LinkedIn, 15% video/direct mail/other.

### Touch Count Decision Framework

When unsure about touch count for a specific situation, use this decision matrix:

| Factor | Fewer Touches | More Touches |
|--------|--------------|--------------|
| Deal size | < $10K ACV | > $50K ACV |
| Decision makers | 1-2 | 5+ |
| Sales cycle | < 30 days | > 90 days |
| Prospect awareness | Inbound or warm referral | Cold outbound |
| Competitive situation | Solo evaluation | Multi-vendor bake-off |
| Industry | Tech-forward (quick decisions) | Regulated (slow procurement) |

---

## A/B Testing Methodology

Cadence optimization requires systematic testing. Without A/B testing, you are guessing which variables matter. With it, you build a data-driven playbook that improves over time.

### Testing Principles

1. **Test one variable at a time.** If you change the subject line AND the send time simultaneously, you cannot attribute any difference in results to either variable.
2. **Hold everything else constant.** The test group and control group must be identical in every way except the variable being tested. Same persona segment, same territory, same time period.
3. **Use sufficient sample sizes.** Small samples produce noisy results. Minimum sample sizes depend on expected effect size, but a rule of thumb: at least 100 prospects per variant for email tests, 50 per variant for phone tests.
4. **Run tests for a complete cadence cycle.** Do not judge a cadence after 3 days. Let the full sequence play out before comparing results.
5. **Define success metrics before starting.** Decide whether you are optimizing for open rate, reply rate, meeting booked rate, or pipeline generated -- these can point in different directions.

### What to Test

#### Subject Line Testing

**Method:** Same email body, same send time, same persona segment. Only the subject line changes.

**Variables to test:**

| Variable | Variant A | Variant B |
|----------|-----------|-----------|
| Length | Short (3-5 words): "Quick question about CI/CD" | Long (8-12 words): "How 3 fintechs solved CI/CD bottlenecks post-Series B" |
| Personalization | Company name: "[Company]'s deployment pipeline" | No company name: "Deployment pipeline bottleneck" |
| Style | Question: "Is developer onboarding slowing you down?" | Statement: "Developer onboarding at scale" |
| Specificity | Specific: "Reducing p99 latency from 800ms to 200ms" | General: "Improving API performance" |

**Metrics:** Open rate (primary), reply rate (secondary). High open rate with low reply rate means the subject line overpromised relative to the body.

#### Messaging Angle Testing

**Method:** Same subject line, same send time, same persona segment. The email body uses a different messaging angle.

**Angles to test:**

| Angle | Approach | Example Hook |
|-------|----------|-------------|
| **Pain-focused** | Lead with the problem they are experiencing | "Most teams at your stage lose 20 hours/week to manual deployments" |
| **Aspiration-focused** | Lead with the outcome they want | "Teams using automated pipelines ship 3x faster and sleep better" |
| **Social proof** | Lead with what peers are doing | "3 companies in your space switched to automated pipelines last quarter" |
| **Fear of missing out** | Lead with competitive risk | "Your two closest competitors automated their pipelines in Q4" |
| **Curiosity** | Lead with an incomplete insight | "I found something interesting about your deployment patterns" |

**Metrics:** Reply rate (primary), meeting booked rate (secondary). Reply rate tells you which angle resonates; meeting rate tells you which produces quality conversations.

#### Timing Testing

**Method:** Same email, same body, same subject line. Different send day and time.

**Variables to test:**

| Variable | Variant A | Variant B |
|----------|-----------|-----------|
| Day of week | Tuesday 9am | Thursday 9am |
| Time of day | 8:00 AM (early) | 11:00 AM (mid-morning) |
| Spacing | 2-day intervals | 3-day intervals |

**Metrics:** Open rate (primary for time-of-day tests), reply rate (primary for spacing tests). Spacing tests require tracking the full cadence, not just individual emails.

#### Channel Mix Testing

**Method:** Same messaging, same persona segment, same time period. Different channel sequence.

**Variables to test:**

| Variable | Variant A | Variant B |
|----------|-----------|-----------|
| Opening channel | Email first | LinkedIn first |
| Phone placement | Phone on touch 4 | Phone on touch 6 |
| Channel ratio | 50% email / 25% phone / 25% LinkedIn | 35% email / 35% phone / 30% LinkedIn |

**Metrics:** Meeting booked rate (primary), total touches to meeting (secondary). Channel mix tests must run for the full cadence duration.

### Statistical Significance

Do not declare a winner until the results are statistically significant. Premature conclusions based on small samples will lead to worse cadences, not better ones.

**Minimum sample sizes per variant (rule of thumb):**

| Test Type | Minimum Per Variant | Ideal Per Variant |
|-----------|-------------------|-------------------|
| Subject line (open rate) | 100 | 250+ |
| Messaging angle (reply rate) | 100 | 200+ |
| Timing (open rate) | 100 | 250+ |
| Channel mix (meeting rate) | 50 | 100+ |

**Quick significance check:** If Variant A has a 15% reply rate and Variant B has a 12% reply rate with 100 prospects each, that 3-point difference is likely NOT significant. You need either a larger sample or a larger effect size. As a rough guide, look for differences of at least 5 percentage points with 100+ per variant, or 3 percentage points with 250+ per variant.

**When in doubt:** Run the test longer. A confident decision based on sufficient data is always better than a fast decision based on noise.

### Testing Cadence

Run tests in a structured rotation. Do not test everything at once.

**Recommended testing calendar:**

| Week | Test Focus | Why This Order |
|------|-----------|----------------|
| Weeks 1-2 | Subject line testing | Highest volume, fastest results; establishes baseline open rate |
| Weeks 3-4 | Messaging angle testing | Builds on optimized subject lines; tests body content |
| Weeks 5-6 | Timing testing | With optimized content, find the best delivery window |
| Weeks 7-8 | Channel mix testing | Most complex test; requires a full cadence cycle to evaluate |
| Week 9+ | Re-test winners against new variants | Continuous improvement cycle |

---

## Persona-Based Cadence Adaptation

The same cadence structure should not be used for every buyer persona. Channel preference, content depth, touch intensity, and messaging tone all shift based on who you are reaching.

### Technical Buyers

**Profile:** Engineers, architects, technical leads, CTOs at smaller companies. They evaluate solutions bottom-up, starting with "does it work?" before "do we need it?"

**Cadence characteristics:**

| Dimension | Adaptation |
|-----------|------------|
| **Touch count** | Fewer (8-12). Technical buyers decide relatively quickly once they have sufficient technical information. Over-touching signals desperation. |
| **Channel preference** | Email-dominant (60%+). Technical buyers prefer asynchronous, written communication they can process on their own schedule. Minimize cold phone calls -- interrupting a coding session generates hostility, not interest. |
| **Content depth** | Depth-first. Share architecture diagrams, benchmark data, technical blog posts, open-source contributions, API documentation. Avoid marketing collateral. |
| **Spacing** | Standard to wide (3-4 days). Give them time to evaluate technical content. Rushing a technical buyer backfires. |
| **Tone** | Precise, specific, jargon-appropriate. Reference their tech stack. Acknowledge trade-offs. Never oversimplify. |
| **CTA style** | Offer technical content or a conversation with an engineer, not a "demo with a sales rep." |

**Example cadence structure (technical buyer, mid-market):**

```
Day 1:  Email — Technical hook referencing their stack + specific benchmark
Day 3:  LinkedIn — Connection request with brief technical context
Day 6:  Email — Architecture comparison or technical case study
Day 9:  Email — Open-source contribution, benchmark report, or technical blog post
Day 12: LinkedIn — Share technical content relevant to their domain
Day 16: Email — Offer conversation with your engineering team
Day 20: Email — Breakup with link to technical documentation
```

### Executive Buyers

**Profile:** VP-level and above, C-suite, founders. They evaluate solutions top-down, starting with "what is the business impact?" and delegating technical evaluation.

**Cadence characteristics:**

| Dimension | Adaptation |
|-----------|------------|
| **Touch count** | Moderate (10-14). Executives need multiple touches for awareness, but each touch must be high-value. Filler touches damage credibility. |
| **Channel preference** | LinkedIn-heavy (35-40%). Executives maintain professional presence on LinkedIn and use it for peer visibility. Email should be brief and outcome-focused. Phone calls should target early morning (7-8am) or end of day (5-6pm). |
| **Content depth** | Outcome-first. Lead with business results, revenue impact, competitive positioning, and risk mitigation. Never lead with features or technical specifications. |
| **Spacing** | Standard (2-3 days initially, expanding). Executives filter aggressively -- consistent but respectful presence wins. |
| **Tone** | Strategic, concise, peer-level. Reference board-level concerns, market dynamics, and peer companies. Under 100 words per email. |
| **CTA style** | Direct time request ("15 minutes next Tuesday?") or offer a one-pager / executive summary. Never ask them to "check out our website." |

**Example cadence structure (executive buyer, enterprise):**

```
Day 1:  LinkedIn — Connection request (mutual connections, brief context)
Day 2:  Email — Outcome-focused hook, peer company reference, 15-min ask
Day 5:  LinkedIn — Engage with their content or share relevant insight
Day 8:  Phone — 7:30am attempt, reference email content
Day 11: Email — Executive-to-executive intro offer
Day 14: LinkedIn — Direct message with specific strategic question
Day 18: Phone — 5:15pm attempt with prepared voicemail
Day 22: Email — Competitive intelligence or market trend insight
Day 26: LinkedIn — Final visibility touch
Day 30: Email — Breakup (door open, tied to strategic priority)
```

### Operational Buyers

**Profile:** Directors of operations, IT managers, procurement leads, implementation owners. They evaluate solutions pragmatically: "Will this work in our environment? What is the rollout risk?"

**Cadence characteristics:**

| Dimension | Adaptation |
|-----------|------------|
| **Touch count** | Higher (12-16). Operational buyers are cautious and methodical. They need multiple proof points and reassurance before engaging. Persistence pays off because they appreciate thoroughness. |
| **Channel preference** | Phone-heavy (30-35%). Operational buyers are phone-comfortable and prefer direct conversation where they can ask practical questions. Email supports with details. LinkedIn is less important for this persona. |
| **Content depth** | Workflow-first. Show implementation timelines, integration specifics, migration paths, support SLAs, and similar-environment case studies. They want to know what Day 1 and Day 30 look like after purchase. |
| **Spacing** | Tighter initially (2 days), standard later (3-4 days). Operational buyers respond to consistent follow-through because it signals how you will behave as a vendor. |
| **Tone** | Pragmatic, honest about trade-offs, implementation-aware. Acknowledge migration effort. Reference support and reliability. Never hand-wave integration complexity. |
| **CTA style** | Offer a walkthrough with an implementation engineer or a demo focused on their specific workflow. Frame it as practical evaluation, not a sales pitch. |

**Example cadence structure (operational buyer, mid-market):**

```
Day 1:  Email — Workflow-specific hook, implementation timeline reference
Day 2:  Phone — Direct call, reference email, offer quick walkthrough
Day 4:  Email — Case study from similar-size company in similar environment
Day 7:  Phone — Second attempt, prepared voicemail with specific question
Day 9:  Email — Demo invitation focused on their specific workflow
Day 11: LinkedIn — Connection request with context
Day 14: Phone — Third attempt, different time of day
Day 17: Email — Implementation guide or migration checklist
Day 20: Phone — Fourth attempt with voicemail referencing new content
Day 23: Email — Peer reference offer (talk to existing customer in similar role)
Day 26: Phone — Final call attempt
Day 28: Email — Breakup email (door open, reference implementation resources)
```

---

## Cadence Performance Metrics

Track these metrics to evaluate and improve cadence performance over time.

### Primary Metrics

| Metric | Definition | Good Benchmark (B2B) |
|--------|-----------|---------------------|
| **Reply rate** | Percentage of prospects who reply (positive or negative) | 15-25% across full cadence |
| **Meeting booked rate** | Percentage of prospects who book a meeting | 5-12% across full cadence |
| **Touches to meeting** | Average number of touches before a meeting is booked | 4-7 touches |
| **Positive reply rate** | Percentage of replies that are positive (interested, willing to talk) | 8-15% across full cadence |

### Secondary Metrics

| Metric | Definition | What It Reveals |
|--------|-----------|----------------|
| **Open rate** (email) | Percentage of emails opened | Subject line effectiveness and send timing |
| **Click rate** (email) | Percentage of emails with link clicks | Content relevance |
| **Connect rate** (phone) | Percentage of calls where prospect answers | Call timing effectiveness |
| **Connection accept rate** (LinkedIn) | Percentage of connection requests accepted | LinkedIn messaging and targeting |
| **Opt-out rate** | Percentage of prospects who unsubscribe or ask to stop | Cadence intensity (too high = higher opt-outs) |
| **Bounce rate** | Percentage of emails that hard bounce | Data quality |

### Diagnostic Patterns

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| High open rate, low reply rate | Subject line overpromises; email body does not deliver | Align body content with subject line promise |
| Low open rate across all emails | Subject lines are generic; send timing is wrong; deliverability issues | Test subject lines; check spam score; test send times |
| Good reply rate, low meeting rate | Replies are negative or prospect is "interested" but won't commit | Strengthen CTA; improve qualification before cadence |
| High opt-out rate | Too many touches, too close together, or irrelevant content | Reduce touch count or widen spacing; improve targeting |
| Meetings from late touches (touch 6+) | Good persistence but could be more efficient | Test front-loading higher-impact channels earlier |
| Meetings only from early touches (1-2) | Cadence is not adding value after initial outreach | Improve mid-cadence content variety and channel mix |

---

## Input/Output Contract

### Inputs

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Target persona | Lead qualification output or SDR judgment | Yes | Buyer type (technical, executive, operational) and seniority level |
| Target segment | Account data or SDR judgment | Yes | Deal size segment (SMB, mid-market, enterprise) that determines touch count and duration |
| Product value propositions | Internal sales enablement | Yes | 3-5 core value props for mapping to cadence touchpoints |
| Existing cadence performance data | Sales engagement platform analytics | Recommended | Reply rates, meeting rates, opt-out rates for current cadences (needed for optimization) |
| Channel availability | Platform capabilities | Recommended | Which channels the team can execute (email, phone, LinkedIn, video, direct mail) |
| Industry vertical | Account data | Optional | For industry-specific timing and content recommendations |
| Competitive context | Sales intelligence | Optional | For competitive positioning in messaging angle selection |

### Outputs

| Output | Format | Description |
|--------|--------|-------------|
| Cadence blueprint | Structured sequence (day, channel, purpose, content focus) | Complete multi-channel sequence architecture for the specified persona and segment |
| Timing recommendations | Day-of-week and time-of-day per channel | Optimized send/call windows based on persona behavior patterns |
| Channel mix ratios | Percentage breakdown by channel | Target distribution across email, phone, LinkedIn, and other channels |
| A/B test plan | Test variable, variants, sample size, duration, success metric | Next test to run for cadence optimization |
| Branching logic | Decision tree based on engagement signals | What to do when prospect opens, clicks, views profile, or goes silent |
| Performance benchmarks | Target metrics by cadence type | Expected reply rate, meeting rate, and touches-to-meeting for the cadence |

### External Actions (Recommended)

These actions are NOT performed by this skill. They are recommendations for the SDR team or their automation platform:

| Action | Platform | When |
|--------|----------|------|
| Load cadence into sales engagement platform | Sales engagement tool | After cadence blueprint is finalized |
| Configure A/B test variants | Sales engagement tool | When running optimization tests |
| Set up engagement signal triggers | Sales engagement tool | For branching logic (open/click/view triggers) |
| Schedule phone blocks | Calendar | Align call times with persona time-of-day windows |
| Report cadence metrics weekly | Sales engagement tool or BI platform | For ongoing optimization and testing decisions |
| Archive underperforming cadences | Sales engagement tool | When test results show a clear winner |

---

## Quick Reference

### Touch Count by Segment

| Segment | Touches | Duration | Channel Mix |
|---------|---------|----------|-------------|
| **SMB** | 8-12 | 14-21 days | 50% email, 25% phone, 25% LinkedIn |
| **Mid-market** | 12-16 | 21-30 days | 40% email, 25% phone, 25% LinkedIn, 10% other |
| **Enterprise** | 16-20 | 30-45 days | 35% email, 25% phone, 25% LinkedIn, 15% other |

### Timing Quick Reference

| Persona | Best Email Days | Best Phone Times | Best LinkedIn Days |
|---------|----------------|-------------------|-------------------|
| **Technical** | Tue-Thu, 10am-2pm | Avoid cold calls | Tue-Wed |
| **Executive** | Tue-Thu, 7-8am or 5-6pm | Mon/Fri, 7-8am or 5-6pm | Tue-Wed |
| **Operational** | Tue-Thu, 8-10am or 1-3pm | Mon-Fri, 8-10am or 1-3pm | Any weekday |

### Spacing Rules

| Phase | Days Between Touches |
|-------|---------------------|
| Opening (touches 1-3) | 2-3 days |
| Middle (touches 4-6) | 3-4 days |
| Closing (touches 7+) | 4-5 days |
| Before breakup | 5-7 days |

### Channel Mixing Rules

1. Never 3x same channel in a row
2. Alternate high-effort (phone) and low-effort (LinkedIn view) touches
3. Open with a written channel (email or LinkedIn) for context
4. Phone after digital engagement signals (opens, profile views)
5. Pattern interrupt mid-cadence (introduce a new channel)

### A/B Testing Priority

| Priority | Test | Minimum Sample |
|----------|------|---------------|
| 1st | Subject lines | 100 per variant |
| 2nd | Messaging angle | 100 per variant |
| 3rd | Send timing | 100 per variant |
| 4th | Channel mix | 50 per variant |
