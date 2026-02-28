---
name: lead-qualification
description: Enterprise lead scoring rubrics, ICP matching, and qualification frameworks
  (BANT, MEDDIC, CHAMP) for B2B sales. Enables systematic lead scoring against ideal
  customer profiles with configurable criteria and threshold-based routing.
license: MIT
metadata:
  author: Claude Skills Team
  compatibility:
    platforms:
    - macos
    - linux
    - windows
  contributors: []
  created: 2026-02-11
  dependencies:
    scripts: []
    references: []
  difficulty: intermediate
  domain: sales
  examples:
  - title: Enterprise Lead Scoring
    input: 'Score: Jane Smith, VP Engineering, 500-person SaaS company, expressed
      interest in automation'
    output: 'Score: 85/100 (Hot). ICP match: 92%. BANT: Budget (likely), Authority
      (yes — VP), Need (automation interest), Timeline (unknown). Route: Assign to
      AE immediately.'
  - title: SMB Lead Filtering
    input: 'Score: John Doe, Marketing Intern, 5-person agency, downloaded whitepaper'
    output: 'Score: 25/100 (Cold). ICP match: 15%. BANT: Budget (unlikely), Authority
      (no), Need (unclear), Timeline (none). Route: Nurture sequence.'
  featured: false
  frequency: Per-lead, multiple times daily
  orchestrated-by: []
  related-agents:
  - sales-development-rep
  - account-executive
  related-commands: []
  related-skills:
  - sales-team/lead-research
  - sales-team/sales-outreach
  - sales-team/pipeline-analytics
  stats:
    downloads: 0
    stars: 0
    rating: 0.0
    reviews: 0
  subdomain: sales-development
  tags:
  - sales
  - lead-qualification
  - scoring
  - BANT
  - MEDDIC
  - CHAMP
  - ICP
  - enterprise
  - SDR
  time-saved: Reduces qualification time from 15 minutes to 2 minutes per lead
  title: Lead Qualification & Scoring
  updated: 2026-02-11
  use-cases:
  - Scoring inbound leads against enterprise qualification criteria
  - Matching leads to Ideal Customer Profile (ICP) definitions
  - Applying BANT/MEDDIC/CHAMP frameworks to assess deal viability
  - Setting MQL/SQL thresholds and routing rules
  - Qualifying leads from form submissions, events, or inbound inquiries
  verified: true
  version: v1.0.0
---

# Lead Qualification & Scoring

Systematic lead scoring against ideal customer profiles with configurable criteria, enterprise qualification frameworks, and threshold-based routing for B2B sales teams.

## Overview

### What This Skill Does

Lead qualification transforms raw lead data into actionable sales intelligence. Instead of relying on gut feeling or ad-hoc judgment, this skill provides a repeatable, data-driven methodology for:

- **Scoring** every lead on a 0-100 scale using weighted criteria
- **Matching** leads against a defined Ideal Customer Profile (ICP)
- **Assessing** deal viability through structured qualification frameworks (BANT, MEDDIC, CHAMP)
- **Routing** leads to the right destination based on score thresholds

### Who Uses It

- **Sales Development Representatives (SDRs):** Prioritize which leads to contact first, avoid wasting time on unqualified leads
- **Account Executives (AEs):** Validate that handed-off leads meet SQL criteria before investing meeting time
- **Sales Managers:** Standardize qualification criteria across the team, ensure consistent pipeline quality
- **Revenue Operations:** Configure scoring models, set thresholds, analyze conversion rates by score band

### When to Use It

- A new lead arrives from any source (form submission, event, referral, inbound inquiry)
- Batch-qualifying a list of leads (e.g., post-event attendee lists, imported contact lists)
- Reviewing pipeline quality and re-scoring existing leads against updated ICP criteria
- Onboarding new SDRs who need a systematic qualification process

### Workflow Position

```
Lead arrives --> lead-research (enrich company data) --> lead-qualification (this skill)
  --> Route: Hot --> AE handoff
  --> Route: Warm --> SDR follow-up via sales-outreach
  --> Route: Cold --> Automated nurture sequence
```

---

## Ideal Customer Profile (ICP) Definition

The ICP is the foundation of all scoring. Every lead is measured against how closely they match your ideal buyer. Define the ICP before building a scoring model.

### ICP Criteria Dimensions

| Dimension | Description | Example Values |
|-----------|-------------|----------------|
| **Company Size** | Employee count or revenue range | 100-2,000 employees; $10M-$500M ARR |
| **Industry** | Target verticals | SaaS, FinTech, Healthcare IT, E-commerce |
| **Geography** | Target markets | North America, Western Europe, ANZ |
| **Tech Stack** | Technologies the prospect uses | Cloud-native, API-first, uses automation tools |
| **Budget Range** | Typical deal size they can support | $25K-$250K annual contract value |
| **Use Case Fit** | Problems your product solves for them | Process automation, data integration, workflow orchestration |
| **Growth Stage** | Company maturity | Series B+, established mid-market, scaling enterprise |
| **Buying Signals** | Observable indicators of intent | Hiring for relevant roles, recent funding, technology migration |

### ICP Definition Template

Use this template to define your ICP. Each criterion has an ideal value (perfect match) and acceptable range (still qualifies).

```
ICP Name: [e.g., "Enterprise Automation Buyer"]
Last Updated: [date]
Owner: [revenue ops / sales leadership]

FIRMOGRAPHIC CRITERIA
  Company Size:
    Ideal: 200-1,000 employees
    Acceptable: 50-5,000 employees
    Disqualifying: < 10 employees

  Annual Revenue:
    Ideal: $20M-$200M
    Acceptable: $5M-$1B
    Disqualifying: < $1M

  Industry:
    Ideal: SaaS, FinTech, Healthcare IT
    Acceptable: Any technology-driven vertical
    Disqualifying: Government (long procurement), Non-profit (budget)

  Geography:
    Ideal: US, Canada, UK, Australia
    Acceptable: Any English-speaking market
    Disqualifying: Embargoed regions

TECHNOGRAPHIC CRITERIA
  Tech Stack:
    Ideal: Cloud-native, uses APIs, existing automation tools
    Acceptable: Cloud-migrating, some API usage
    Disqualifying: Fully on-premise, no API infrastructure

  Automation Maturity:
    Ideal: Has dedicated automation team or initiative
    Acceptable: Exploring automation, ad-hoc scripts
    Disqualifying: No interest in automation

USE CASE CRITERIA
  Primary Pain:
    Ideal: Manual processes consuming 10+ hours/week per team
    Acceptable: Efficiency goals, scaling challenges
    Disqualifying: No clear pain or use case

  Budget Authority:
    Ideal: Department-level budget for tools ($25K+)
    Acceptable: Budget exists but requires approval
    Disqualifying: No budget, no procurement path

BEHAVIORAL CRITERIA
  Buying Signals:
    Strong: Requested demo, attended webinar, replied to outreach
    Moderate: Downloaded content, visited pricing page, opened emails
    Weak: Single website visit, social media follow
```

### ICP Match Percentage

Calculate ICP match as the percentage of criteria the lead satisfies:

```
ICP Match % = (Criteria Met / Total Criteria) x 100

Scoring:
  90-100%  --> "Ideal fit" (prioritize immediately)
  70-89%   --> "Strong fit" (high priority)
  50-69%   --> "Moderate fit" (worth pursuing with caveats)
  30-49%   --> "Weak fit" (nurture only)
  0-29%    --> "No fit" (disqualify or deprioritize)
```

For weighted ICP matching, assign importance weights to each criterion (see Scoring Model below).

---

## Lead Scoring Model

The scoring model assigns a numeric score (0-100) to each lead based on weighted dimensions. This score determines routing priority and follow-up urgency.

### Scoring Dimensions

Every lead is scored across five dimensions. Each dimension contributes a weighted portion of the total score.

| Dimension | Weight | What It Measures | Data Sources |
|-----------|--------|------------------|--------------|
| **Firmographic Fit** | 30% | How well the company matches your ICP | Company size, industry, revenue, geography |
| **Role Authority** | 25% | Decision-making power of the contact | Job title, seniority level, department |
| **Need Signal** | 20% | Evidence of a problem your product solves | Form responses, content consumed, stated pain |
| **Engagement Level** | 15% | Depth and recency of interaction | Pages visited, emails opened, events attended |
| **Timing Signal** | 10% | Indicators of near-term purchase intent | Budget cycle, contract renewal, stated timeline |

### Detailed Scoring Rubric

#### Firmographic Fit (30 points max)

| Criterion | Points | Example |
|-----------|--------|---------|
| Company size in ideal range | 10 | 200-1,000 employees |
| Company size in acceptable range | 5 | 50-200 or 1,000-5,000 employees |
| Industry is ideal vertical | 8 | SaaS, FinTech |
| Industry is acceptable vertical | 4 | Any tech-adjacent |
| Revenue in ideal range | 7 | $20M-$200M |
| Revenue in acceptable range | 3 | $5M-$20M or $200M-$1B |
| Geography is target market | 5 | US, Canada, UK |
| Geography is acceptable market | 2 | Other English-speaking |

#### Role Authority (25 points max)

| Criterion | Points | Example Titles |
|-----------|--------|----------------|
| C-level or VP (economic buyer) | 25 | CTO, VP Engineering, VP Operations |
| Director (strong influence) | 20 | Director of Engineering, Director of IT |
| Senior Manager (champion potential) | 15 | Sr. Engineering Manager, Head of Automation |
| Manager (evaluator) | 10 | Engineering Manager, IT Manager |
| Individual Contributor (user) | 5 | Software Engineer, Analyst |
| Intern / Student / Unknown | 2 | Intern, Student, no title provided |

#### Need Signal (20 points max)

| Criterion | Points | Evidence |
|-----------|--------|----------|
| Explicitly stated pain point | 20 | "We spend 20 hours/week on manual data entry" |
| Requested demo or pricing | 16 | Demo form submission, pricing page + contact |
| Described a relevant use case | 12 | "Looking to automate our onboarding workflow" |
| Consumed problem-aware content | 8 | Downloaded "Guide to Process Automation" |
| General interest, no specific need | 4 | Visited blog, attended general webinar |
| No need signal detected | 0 | No engagement beyond basic contact info |

#### Engagement Level (15 points max)

| Criterion | Points | Evidence |
|-----------|--------|----------|
| Multiple high-intent actions (last 7 days) | 15 | Demo request + pricing page + case study |
| Single high-intent action (last 14 days) | 12 | Demo request or trial signup |
| Multiple medium-intent actions (last 30 days) | 9 | Webinar + whitepaper download |
| Single medium-intent action (last 30 days) | 6 | Whitepaper download or webinar attendance |
| Low-intent action (last 60 days) | 3 | Email open, single page visit |
| No engagement or stale (60+ days) | 0 | No tracked activity |

#### Timing Signal (10 points max)

| Criterion | Points | Evidence |
|-----------|--------|----------|
| Active buying process (stated timeline) | 10 | "Evaluating tools this quarter" |
| Budget approved or allocated | 8 | "We have budget for this fiscal year" |
| Trigger event detected | 6 | Recent funding, new hire in relevant role |
| General exploration, no urgency | 3 | "Might look at this next year" |
| No timing signal | 0 | No timeline information |

### Scoring Calculation

```
Total Score = Firmographic Fit (0-30)
            + Role Authority (0-25)
            + Need Signal (0-20)
            + Engagement Level (0-15)
            + Timing Signal (0-10)
            = 0-100

Example: Jane Smith, VP Engineering, 500-person SaaS company, automation interest
  Firmographic Fit:  10 (size ideal) + 8 (SaaS) + 7 (revenue est.) + 5 (US) = 30
  Role Authority:    25 (VP-level)
  Need Signal:       12 (described automation use case)
  Engagement Level:  12 (demo request this week)
  Timing Signal:     6  (recent funding round)
  -----------------------------------------------
  Total:             85/100 (Hot)
```

### Score Bands

| Band | Score Range | Label | Meaning |
|------|-------------|-------|---------|
| A | 80-100 | Hot | High-value, ready for sales conversation |
| B | 60-79 | Warm | Promising, needs SDR qualification call |
| C | 40-59 | Cool | Some fit, requires nurturing |
| D | 20-39 | Cold | Low fit, automated nurture only |
| F | 0-19 | Disqualified | No fit, do not pursue |

---

## Qualification Frameworks

After scoring, apply a qualification framework to assess deal viability in a structured conversation. Choose the framework that matches your sales motion and deal complexity.

### Framework Selection Guide

| Framework | Best For | Complexity | When to Use |
|-----------|----------|------------|-------------|
| **BANT** | SMB / transactional deals | Low | Fast qualification, short sales cycles, < $25K ACV |
| **MEDDIC** | Enterprise / complex deals | High | Long sales cycles, multiple stakeholders, > $50K ACV |
| **CHAMP** | Challenger-sale aligned | Medium | Consultative selling, creating urgency, $25K-$100K ACV |

### BANT (Budget, Authority, Need, Timeline)

**Best for:** SMB and mid-market deals with straightforward buying processes.

**How it works:** Assess four binary-ish criteria. A lead that satisfies 3-4 criteria is qualified.

| Criterion | Question to Answer | Qualified | Partially Qualified | Not Qualified |
|-----------|--------------------|-----------|---------------------|---------------|
| **Budget** | Can they afford the solution? | Budget allocated or clear path to funding | Budget exists but needs approval | No budget, no procurement path |
| **Authority** | Is this person the decision-maker? | Economic buyer or direct report to buyer | Influencer who can champion internally | No influence on buying decision |
| **Need** | Do they have a problem we solve? | Explicit, urgent pain point | General interest, pain not yet quantified | No clear need or problem |
| **Timeline** | When do they need a solution? | Active evaluation, decision within 90 days | Planning for next quarter/half | No timeline, "maybe someday" |

**BANT Scoring:**

```
4/4 criteria met  --> SQL (Sales Qualified Lead) - hand to AE
3/4 criteria met  --> MQL (Marketing Qualified Lead) - SDR deepens qualification
2/4 criteria met  --> Nurture - stay in touch, re-qualify in 30-60 days
0-1/4 criteria met --> Disqualify - archive or long-term nurture
```

**BANT Assessment Template:**

```
Lead: [Name, Title, Company]
Date: [Assessment date]
Assessed by: [SDR name]

Budget:     [ ] Yes  [ ] Partial  [ ] No
  Notes: [Evidence or conversation notes]

Authority:  [ ] Yes  [ ] Partial  [ ] No
  Notes: [Title, org chart position, buying role]

Need:       [ ] Yes  [ ] Partial  [ ] No
  Notes: [Stated pain, use case, urgency indicators]

Timeline:   [ ] Yes  [ ] Partial  [ ] No
  Notes: [Stated timeline, trigger events, contract renewals]

Result:     [ ] SQL  [ ] MQL  [ ] Nurture  [ ] Disqualify
Next Action: [Specific next step with date]
```

### MEDDIC (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion)

**Best for:** Enterprise deals with long sales cycles, multiple stakeholders, and complex procurement.

**How it works:** Map six elements of the deal. Incomplete MEDDIC indicates deal risk. All six should be identified before forecasting a deal as "commit."

| Element | Question to Answer | What "Good" Looks Like |
|---------|--------------------|-----------------------|
| **Metrics** | What quantifiable outcomes does the buyer expect? | "Reduce manual processing time by 60%, saving $200K/year" |
| **Economic Buyer** | Who has final budget authority and can say yes? | Identified by name, have access (direct or via champion) |
| **Decision Criteria** | What criteria will they use to evaluate solutions? | Written list: technical requirements, integration needs, pricing model, security |
| **Decision Process** | What is the step-by-step process to make a purchase? | Mapped: evaluation --> shortlist --> POC --> security review --> procurement --> signature |
| **Identify Pain** | What specific, quantified pain are they experiencing? | "Our team spends 40 hours/week on manual data entry, error rate is 12%" |
| **Champion** | Who inside the org is actively selling on your behalf? | Named individual with authority, access to economic buyer, and personal motivation |

**MEDDIC Scoring:**

```
6/6 elements identified  --> Strong deal, forecast as "commit"
4-5/6 elements identified --> Active deal, gaps need filling (forecast as "best case")
2-3/6 elements identified --> Early stage, significant discovery needed
0-1/6 elements identified --> Not qualified for enterprise pursuit
```

**MEDDIC Assessment Template:**

```
Deal: [Company Name] - [Opportunity Name]
Stage: [Discovery / Evaluation / POC / Negotiation / Closed]
ACV: [$estimated]
Assessed by: [AE name]
Date: [Assessment date]

Metrics:
  Status: [ ] Identified  [ ] Partial  [ ] Unknown
  Detail: [Quantified business outcomes the buyer expects]

Economic Buyer:
  Status: [ ] Identified  [ ] Partial  [ ] Unknown
  Name:   [Name and title]
  Access: [ ] Direct  [ ] Via Champion  [ ] No Access

Decision Criteria:
  Status: [ ] Identified  [ ] Partial  [ ] Unknown
  Detail: [List of evaluation criteria]

Decision Process:
  Status: [ ] Mapped  [ ] Partial  [ ] Unknown
  Steps:  [Step-by-step buying process with timeline]

Identify Pain:
  Status: [ ] Quantified  [ ] Qualitative  [ ] Unknown
  Detail: [Specific, measurable pain points]

Champion:
  Status: [ ] Strong  [ ] Developing  [ ] None
  Name:   [Name and title]
  Why:    [Their personal motivation to champion your solution]

MEDDIC Score: [X/6]
Deal Risk:    [ ] Low  [ ] Medium  [ ] High
Next Action:  [Specific next step to fill gaps]
```

### CHAMP (Challenges, Authority, Money, Prioritization)

**Best for:** Consultative and challenger-sale approaches where the seller helps the buyer quantify and prioritize their pain.

**How it works:** Lead with the buyer's challenges (not your budget question). This reorders BANT to be buyer-centric: understand challenges first, then determine if you can help.

| Element | Question to Answer | Assessment Criteria |
|---------|--------------------|--------------------|
| **Challenges** | What problems are they trying to solve? What happens if they do nothing? | Specific, quantifiable challenges that align with your solution |
| **Authority** | Who owns this challenge? Who allocates resources to solve it? | Challenge owner identified, decision-making structure understood |
| **Money** | Is there budget or can budget be created for a solution of this magnitude? | Budget exists, or the pain is severe enough to justify creating budget |
| **Prioritization** | Where does solving this rank among their other initiatives? | Top-3 priority this quarter, or blocking a strategic initiative |

**CHAMP Scoring:**

```
4/4 strong  --> Qualified, high priority outreach
3/4 strong  --> Qualified, standard priority
2/4 strong  --> Developing, needs nurturing
0-1/4 strong --> Not ready, long-term nurture
```

**CHAMP Assessment Template:**

```
Lead: [Name, Title, Company]
Date: [Assessment date]
Assessed by: [SDR/AE name]

Challenges:
  Status: [ ] Clear & Quantified  [ ] Stated but vague  [ ] Unknown
  Detail: [What challenges did they describe?]
  Impact: [What happens if they don't solve this?]
  Fit:    [How well do our capabilities address this?]

Authority:
  Status: [ ] Decision Maker  [ ] Influencer  [ ] Unknown
  Detail: [Who owns the challenge? Who approves spend?]
  Map:    [Org chart / buying committee understanding]

Money:
  Status: [ ] Budget Allocated  [ ] Budget Possible  [ ] No Budget
  Detail: [Budget size, fiscal year, procurement process]
  Create: [If no budget, is the pain severe enough to create one?]

Prioritization:
  Status: [ ] Top Priority  [ ] Medium Priority  [ ] Low/None
  Detail: [Where does this rank? What else competes for attention?]
  Urgency: [Any deadlines, trigger events, or consequences of delay?]

Result:     [ ] Qualified  [ ] Developing  [ ] Not Ready
Next Action: [Specific next step with date]
```

---

## Threshold-Based Routing

Scoring and qualification produce a routing decision. Define clear thresholds so every lead gets the right treatment without manual judgment calls.

### MQL and SQL Definitions

| Threshold | Score | Framework Result | Definition |
|-----------|-------|------------------|------------|
| **SQL (Sales Qualified Lead)** | 80-100 | BANT 4/4, MEDDIC 4+/6, CHAMP 4/4 | Ready for AE conversation. Has authority, budget, need, and timing. |
| **MQL (Marketing Qualified Lead)** | 60-79 | BANT 3/4, MEDDIC 2-3/6, CHAMP 3/4 | Promising but needs further qualification. SDR follows up. |
| **Nurture** | 20-59 | BANT 1-2/4, MEDDIC 1/6, CHAMP 1-2/4 | Some interest or fit, but not ready for sales. Automated nurture. |
| **Disqualified** | 0-19 | BANT 0/4, MEDDIC 0/6, CHAMP 0/4 | No fit. Archive or exclude from outreach. |

### Routing Rules

```
IF score >= 80 (SQL):
  --> Assign to Account Executive
  --> Create opportunity in CRM
  --> Send internal notification: "Hot lead: [Name] at [Company], Score: [X]"
  --> SLA: AE must respond within 4 hours

IF score 60-79 (MQL):
  --> Assign to SDR for qualification call
  --> Add to SDR work queue (priority: high)
  --> Send internal notification: "Warm lead: [Name] at [Company], Score: [X]"
  --> SLA: SDR must contact within 24 hours

IF score 40-59 (Nurture - Warm):
  --> Enroll in automated nurture sequence (educational content)
  --> Re-score in 30 days or on next engagement
  --> No manual outreach unless engagement spikes

IF score 20-39 (Nurture - Cold):
  --> Enroll in long-term nurture sequence (monthly newsletter)
  --> Re-score in 90 days or on next engagement
  --> No manual outreach

IF score < 20 (Disqualified):
  --> Mark as disqualified in CRM with reason
  --> Exclude from outreach sequences
  --> Do not delete (may re-qualify if company changes)
```

### Re-Scoring Triggers

Leads should be re-scored when new information arrives:

| Trigger | Action |
|---------|--------|
| Lead fills out new form | Re-score with updated need/engagement signals |
| Lead visits pricing page | Add engagement points, re-evaluate routing |
| Company raises funding round | Update firmographic score (growth signal) |
| Lead replies to outreach email | Upgrade engagement score, re-route if threshold crossed |
| 30/60/90 days elapsed | Decay engagement score by 20%, re-evaluate band |
| Lead's company appears in news | Re-assess firmographic fit and timing signals |

### Score Decay

Engagement and timing scores should decay over time to reflect diminishing relevance:

```
Decay Schedule:
  0-30 days:   No decay (scores at full value)
  31-60 days:  Engagement and Timing scores decay by 20%
  61-90 days:  Engagement and Timing scores decay by 50%
  91+ days:    Engagement and Timing scores decay by 80%

Note: Firmographic Fit and Role Authority do NOT decay
      (company size and job title are stable attributes)
```

---

## Input/Output Contract

This skill follows tool-agnostic input/output contracts. Wire these to your specific platforms (CRM, email, notifications) as needed.

### Inputs

| Field | Type | Required | Source | Description |
|-------|------|----------|--------|-------------|
| `lead.email` | string | Yes | Form, CRM, event registration | Primary identifier for the lead |
| `lead.first_name` | string | Yes | Form, CRM | Contact first name |
| `lead.last_name` | string | Yes | Form, CRM | Contact last name |
| `lead.title` | string | Yes | Form, CRM, enrichment | Job title (used for Role Authority scoring) |
| `lead.company_name` | string | Yes | Form, CRM, enrichment | Company name |
| `lead.company_size` | integer | Recommended | Enrichment, CRM | Employee count (used for Firmographic Fit) |
| `lead.company_revenue` | string | Recommended | Enrichment | Annual revenue range |
| `lead.industry` | string | Recommended | Enrichment, CRM | Industry vertical |
| `lead.geography` | string | Recommended | Form, enrichment | Country or region |
| `lead.source` | string | Yes | Form, CRM | How the lead arrived (form, event, referral, etc.) |
| `lead.form_responses` | object | If available | Form submission | Answers to qualification questions on forms |
| `lead.engagement_history` | array | If available | CRM, analytics | List of tracked actions (page visits, downloads, emails) |
| `lead.notes` | string | If available | SDR, event notes | Free-text context about the lead |
| `icp_definition` | object | Yes | Configuration | The ICP criteria to score against (see ICP template above) |
| `scoring_weights` | object | Optional | Configuration | Custom dimension weights (defaults to standard model) |
| `thresholds` | object | Optional | Configuration | Custom MQL/SQL thresholds (defaults: SQL=80, MQL=60) |

### Outputs

| Field | Type | Description |
|-------|------|-------------|
| `score.total` | integer (0-100) | Overall lead score |
| `score.band` | string | Score band: "Hot", "Warm", "Cool", "Cold", "Disqualified" |
| `score.breakdown.firmographic_fit` | integer (0-30) | Firmographic dimension score |
| `score.breakdown.role_authority` | integer (0-25) | Role authority dimension score |
| `score.breakdown.need_signal` | integer (0-20) | Need signal dimension score |
| `score.breakdown.engagement_level` | integer (0-15) | Engagement dimension score |
| `score.breakdown.timing_signal` | integer (0-10) | Timing dimension score |
| `icp_match_pct` | integer (0-100) | Percentage match to ICP definition |
| `icp_match_detail` | object | Per-criterion ICP match (met/partial/unmet) |
| `framework_assessment` | object | BANT, MEDDIC, or CHAMP assessment results |
| `framework_assessment.framework` | string | Which framework was applied |
| `framework_assessment.criteria` | object | Per-criterion status (yes/partial/no/unknown) |
| `framework_assessment.summary` | string | One-line assessment summary |
| `routing.action` | string | "assign_ae", "assign_sdr", "nurture_warm", "nurture_cold", "disqualify" |
| `routing.priority` | string | "immediate", "high", "standard", "low" |
| `routing.sla_hours` | integer | Hours within which the lead must be contacted |
| `routing.reason` | string | Human-readable explanation of routing decision |
| `qualified_at` | datetime | Timestamp of qualification |
| `next_review_date` | date | When to re-score (based on decay schedule) |

### External Actions (Recommended)

These actions should be triggered by the consuming automation or workflow engine. This skill produces the data; your platform executes the action.

| Action | Trigger Condition | Data Passed |
|--------|-------------------|-------------|
| **CRM Update** | Every qualification | Score, band, ICP match, framework results, routing decision |
| **Team Notification** | Score >= 60 (MQL or SQL) | Lead name, company, score, routing action, SLA |
| **AE Assignment** | Score >= 80 (SQL) | Full qualification output, lead profile, recommended framework |
| **SDR Queue Addition** | Score 60-79 (MQL) | Lead summary, score breakdown, suggested talk track |
| **Nurture Enrollment** | Score 20-59 | Lead email, score band, content preference signals |
| **Disqualification Log** | Score < 20 | Lead email, disqualification reason, do-not-contact flag |
| **Re-Score Schedule** | Every qualification | Lead email, next review date, decay schedule |

---

## Quick Reference

### Lead Scoring Summary

```
DIMENSION          WEIGHT    MAX POINTS
Firmographic Fit   30%       30
Role Authority     25%       25
Need Signal        20%       20
Engagement Level   15%       15
Timing Signal      10%       10
------------------------------------
TOTAL              100%      100
```

### Score-to-Action Table

| Score | Band | Route | SLA | Action |
|-------|------|-------|-----|--------|
| 80-100 | Hot | AE | 4 hours | Create opportunity, assign AE, notify team |
| 60-79 | Warm | SDR | 24 hours | Add to SDR queue, schedule qualification call |
| 40-59 | Cool | Nurture | -- | Enroll in educational nurture sequence |
| 20-39 | Cold | Nurture | -- | Enroll in long-term newsletter nurture |
| 0-19 | Disqualified | None | -- | Mark disqualified, exclude from sequences |

### Framework Selection Decision Tree

```
Is the deal > $50K ACV with multiple stakeholders?
  YES --> Use MEDDIC
  NO  --> Is the sales motion consultative / challenger-style?
    YES --> Use CHAMP
    NO  --> Use BANT
```

### Framework Comparison

| Aspect | BANT | MEDDIC | CHAMP |
|--------|------|--------|-------|
| Complexity | Low | High | Medium |
| Best ACV | < $25K | > $50K | $25K-$100K |
| Sales Cycle | < 30 days | 90+ days | 30-90 days |
| Focus | Buyer readiness | Deal mechanics | Buyer challenges |
| Criteria Count | 4 | 6 | 4 |
| Qualification Speed | Fast (1 call) | Slow (multi-call) | Medium (1-2 calls) |
| Strengths | Simple, fast | Thorough, predictive | Buyer-centric, consultative |
| Weaknesses | Misses complexity | Heavyweight for SMB | Less rigor than MEDDIC |

### Qualification Checklist (Universal)

Before routing any lead as SQL, confirm at minimum:

- [ ] ICP match is 70% or above
- [ ] Lead score is 80 or above
- [ ] Authority: contact is a decision-maker or has direct access to one
- [ ] Need: a specific, relevant pain point has been identified
- [ ] At least one timing signal exists (budget, deadline, trigger event)
- [ ] Framework assessment completed (BANT, MEDDIC, or CHAMP)
- [ ] CRM record updated with score, framework results, and routing decision
- [ ] Handoff notes written for the receiving AE (if SQL)

---

*Last updated: 2026-02-11 | Version: v1.0.0*
