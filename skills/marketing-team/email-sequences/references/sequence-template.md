# Email Sequence Template

## Sequence Overview

| Field | Value |
|-------|-------|
| **Sequence Name** | [Descriptive name, e.g., "Trial Welcome Sequence"] |
| **Type** | Welcome / Nurture / Re-engagement / Renewal / Event-triggered |
| **Objective** | [Single clear goal: activation, demo request, renewal] |
| **Owner** | [Marketing team member responsible] |
| **Created** | [Date] |
| **Status** | Draft / Active / Paused / Archived |

## Enrollment Criteria

| Field | Value |
|-------|-------|
| **Trigger** | [Event that enrolls contacts: form fill, score change, lifecycle event] |
| **Segment** | [Who qualifies: persona, lifecycle stage, behavior] |
| **Exclusions** | [Who should NOT receive: existing customers, competitors, recent contacts] |
| **Re-enrollment** | Yes / No (cooldown period: [X] days) |
| **Suppression** | [Other sequences that prevent enrollment] |

## Email Sequence

### Email 1: [Name]

| Field | Value |
|-------|-------|
| **Send timing** | [Immediate / +X hours/days] |
| **Subject line** | [Subject] |
| **Preview text** | [Preview] |
| **From name** | [Person name or company] |
| **Body summary** | [2-3 sentence description of email content and purpose] |
| **CTA** | [Primary call-to-action text and link destination] |
| **A/B test** | [What to test: subject line variant, send time, etc.] |

### Email 2: [Name]

| Field | Value |
|-------|-------|
| **Send timing** | [+X days after Email 1] |
| **Subject line** | [Subject] |
| **Preview text** | [Preview] |
| **Body summary** | [Content description] |
| **CTA** | [CTA] |

### Email 3: Branch Point

| Condition | Path |
|-----------|------|
| **IF** [engaged: opened/clicked Email 1 or 2] | Continue to Email 4A (consideration track) |
| **IF** [not engaged: no opens] | Send Email 4B (re-engagement) |
| **IF** [goal met: booked demo] | Exit sequence |

### Email 4A: [Engaged Track]

| Field | Value |
|-------|-------|
| **Send timing** | [+X days after branch] |
| **Subject line** | [Subject] |
| **Body summary** | [Higher-commitment content for engaged leads] |
| **CTA** | [Stronger CTA] |

### Email 4B: [Re-engagement Track]

| Field | Value |
|-------|-------|
| **Send timing** | [+X days after branch] |
| **Subject line** | [Different angle / curiosity subject] |
| **Body summary** | [Value-first content, lower commitment ask] |
| **CTA** | [Softer CTA] |

### Email 5: [Final]

| Field | Value |
|-------|-------|
| **Send timing** | [+X days] |
| **Subject line** | [Subject] |
| **Body summary** | [Final value + direct ask] |
| **CTA** | [Primary conversion CTA] |

*(Add or remove emails as needed — recommend 5-8 emails per sequence)*

## Exit Conditions

| Exit Type | Condition | Action |
|-----------|-----------|--------|
| **Goal Met** | [Desired conversion achieved] | Remove, update CRM, notify sales if applicable |
| **Opt-Out** | Unsubscribe | Remove immediately |
| **Hard Bounce** | Email address invalid | Remove, suppress address |
| **Timeout** | Completed sequence with no goal | Move to [next sequence] or suppress |
| **Manual** | Removed by team member | Remove, log reason |

## A/B Test Plan

| Email | Variable | Variant A | Variant B | Sample | Duration |
|-------|----------|-----------|-----------|--------|----------|
| Email 1 | Subject line | [Option A] | [Option B] | 20% each, winner to 60% | 4 hours |
| Email 3 | CTA text | [Option A] | [Option B] | 50/50 | 1 week |

**Rules:** One variable per test. 500+ contacts per variant. 95% confidence to declare winner. Document results.

## Metrics and Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Open rate (Email 1)** | >40% | [Welcome] or >25% [Nurture] |
| **Average open rate** | >25% | Across all sequence emails |
| **Click-through rate** | >3% | Average across sequence |
| **Goal conversion** | >[X]% | Enrolled to goal achieved |
| **Completion rate** | >[X]% | Enrolled to final email |
| **Unsubscribe rate** | <0.3% | Per email |
| **Time to convert** | <[X] days | Enrollment to goal |

## Deliverability Checklist

- [ ] SPF record configured and passing
- [ ] DKIM record configured and passing
- [ ] DMARC policy set (at minimum p=none for monitoring)
- [ ] Sending domain warmed up (if new)
- [ ] List cleaned: no hard bounces, no purchased addresses
- [ ] Unsubscribe link present in all emails
- [ ] Physical mailing address in footer (CAN-SPAM compliance)
- [ ] Test emails rendered correctly in Gmail, Outlook, Apple Mail

## Approval Checklist

- [ ] Sequence logic reviewed (enrollment, branching, exits)
- [ ] All email copy reviewed and approved
- [ ] Subject lines A/B test planned
- [ ] Suppression rules verified
- [ ] Deliverability checklist complete
- [ ] Test contacts run through full sequence
- [ ] Analytics and UTM tracking configured
- [ ] Launch date confirmed

---

**Usage:** Copy this template for each new email sequence. Complete all sections before building in your email platform. Review with team before launch. Update metrics section weekly during first month.
