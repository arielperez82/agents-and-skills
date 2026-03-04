# Marketing Automation Workflow Template

## Workflow Overview

| Field | Value |
|-------|-------|
| **Workflow Name** | [Descriptive name, e.g., "Trial Onboarding Nurture"] |
| **Objective** | [Single clear goal: demo request, trial conversion, feature adoption] |
| **Owner** | [Marketing team member responsible] |
| **Created** | [Date] |
| **Last Updated** | [Date] |
| **Status** | Draft / Active / Paused / Archived |

## Enrollment Criteria

### Trigger

| Trigger Type | Condition |
|-------------|-----------|
| **Event** | [Form submit / Page visit / Score change / Lifecycle event] |
| **Filter** | [Additional criteria: segment, score range, property value] |
| **Exclusion** | [Who should NOT enter: existing customers, competitors, internal] |

### Audience Segment

| Dimension | Criteria |
|-----------|----------|
| **Lifecycle Stage** | [Lead / MQL / SQL / Customer] |
| **Persona** | [Job title, seniority, department] |
| **Firmographic** | [Company size, industry, revenue] |
| **Behavioral** | [Recent actions, engagement level] |
| **Estimated Size** | [Number of contacts matching criteria] |

### Enrollment Rules

- **Re-enrollment:** Yes / No (can contacts go through this workflow more than once?)
- **Re-enrollment cooldown:** [X days before re-enrollment allowed]
- **Suppression:** [Other workflows that prevent enrollment in this one]
- **Priority:** [If contact qualifies for multiple workflows, which takes precedence?]

## Sequence Steps

### Step 1: [Step Name]

| Field | Value |
|-------|-------|
| **Type** | Email / Wait / Branch / Internal action / CRM update |
| **Timing** | Immediate / +[X] hours/days after previous step |
| **Content** | [Email subject or action description] |
| **CTA** | [Primary call-to-action] |
| **Success Metric** | [Open rate / Click rate / Conversion] |

### Step 2: [Step Name]

| Field | Value |
|-------|-------|
| **Type** | [Type] |
| **Timing** | [Timing] |
| **Content** | [Description] |
| **CTA** | [CTA] |
| **Success Metric** | [Metric] |

### Step 3: Branch

| Condition | Path |
|-----------|------|
| **IF** [condition A] | Go to Step [X] |
| **ELSE IF** [condition B] | Go to Step [Y] |
| **ELSE** | Go to Step [Z] |

*(Copy and extend steps as needed — recommend 5-8 steps maximum)*

## Exit Conditions

| Exit Type | Condition | Action |
|-----------|-----------|--------|
| **Goal Met** | [Desired conversion achieved] | Remove from workflow, update CRM |
| **Opt-Out** | Unsubscribe or complaint | Remove immediately, respect preference |
| **Timeout** | No engagement for [X] days | Move to re-engagement or suppress |
| **Disqualify** | [Competitor, invalid email, wrong persona] | Remove, update lead status |
| **Manual** | Sales or marketing removes contact | Remove, log reason |

## Measurement Framework

### KPIs

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Enrollment Rate** | [X]% of eligible contacts | Enrolled / Eligible |
| **Completion Rate** | [X]% reach final step | Completed / Enrolled |
| **Conversion Rate** | [X]% achieve goal | Goal met / Enrolled |
| **Time to Convert** | [X] days average | Enrollment to goal |
| **Drop-off Rate** | <[X]% per step | Lost per step / Entered step |

### Reporting Cadence

- **Weekly:** Enrollment rate, step-level metrics
- **Monthly:** Conversion rate, time-to-convert, A/B test results
- **Quarterly:** ROI analysis, workflow comparison, optimization recommendations

## A/B Testing Plan

| Test | Variable | Hypothesis | Duration |
|------|----------|-----------|----------|
| Test 1 | [Subject line / Send time / Content / CTA] | [Expected outcome] | [X] weeks |
| Test 2 | [Variable] | [Hypothesis] | [Duration] |

**Rules:** Test one variable at a time. Minimum 500 contacts per variant. Run for at least 2 weeks or until statistical significance (95% confidence).

## Technical Requirements

| Requirement | Details |
|-------------|---------|
| **Platform** | [HubSpot / Marketo / Customer.io / etc.] |
| **Integrations** | [CRM, Slack, analytics tools] |
| **Custom Properties** | [Any new fields needed] |
| **Lists/Segments** | [Static or dynamic lists to create] |
| **Templates** | [Email templates needed] |

## Approval Checklist

- [ ] Workflow logic reviewed by team
- [ ] Email content approved by stakeholders
- [ ] Suppression rules verified (no overlap with other workflows)
- [ ] Test contacts run through full workflow
- [ ] Analytics/UTM tracking configured
- [ ] Exit conditions tested
- [ ] Enrollment criteria validated against current database
- [ ] Launch date confirmed

---

**Usage:** Copy this template for each new workflow. Fill in all sections before building in your automation platform. Review with team before launch.
