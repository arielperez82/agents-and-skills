---

# === CORE IDENTITY ===
name: meeting-intelligence
title: Meeting Intelligence
description: Pre-call briefing, post-call follow-up, and proposal detection for B2B sales meetings. Enables AEs to enter every meeting prepared with research and leave every meeting with prompt, structured follow-ups.
domain: sales
subdomain: account-management

# === WEBSITE DISPLAY ===
difficulty: intermediate
time-saved: "Saves 30-45 minutes per meeting (15-20 min prep + 15-25 min follow-up)"
frequency: "Per-meeting, 3-8 times daily for active AEs"
use-cases:
  - Generating pre-call briefing documents from participant research
  - Drafting post-call follow-up emails from meeting notes or transcripts
  - Detecting proposal requests and action items from call transcripts
  - Preparing research summaries on external meeting participants
  - Creating structured meeting notes with next steps

# === RELATIONSHIPS ===
related-agents:
  - ap-account-executive
  - ap-sales-development-rep
related-skills:
  - sales-team/lead-research
  - sales-team/sales-call-analysis
  - sales-team/pipeline-analytics
  - sales-team/sales-outreach
related-commands: []
orchestrated-by: []

# === TECHNICAL ===
dependencies:
  scripts: []
  references: []
compatibility:
  platforms: [macos, linux, windows]

# === EXAMPLES ===
examples:
  - title: Pre-Call Briefing
    input: "Prepare briefing for tomorrow's call with Sarah Chen (CTO) and Mike Ross (VP Eng) at DataFlow Inc"
    output: "Briefing: DataFlow Inc ($25M ARR, 180 employees, data pipeline SaaS). Sarah Chen: CTO since 2023, prev AWS. Mike Ross: VP Eng, manages 40 engineers. Recent news: Series C, expanding to EU. Key pain: data latency complaints from enterprise customers. Suggested talking points: [3 items]"
  - title: Post-Call Follow-Up
    input: "Draft follow-up from transcript: discussed pricing, they want a proposal for 50-seat license, timeline Q2, concern about migration from current vendor"
    output: "Subject: Follow-up — DataFlow proposal and migration plan. Body: [structured email covering discussed topics, addressing migration concern, proposing next steps with timeline, attaching relevant case study]. Action items detected: Send proposal by Friday, schedule technical deep-dive with Mike."

# === ANALYTICS ===
stats:
  downloads: 0
  stars: 0
  rating: 0.0
  reviews: 0

# === VERSIONING ===
version: v1.0.0
author: Claude Skills Team
contributors: []
created: 2026-02-11
updated: 2026-02-11
license: MIT

# === DISCOVERABILITY ===
tags: [sales, meetings, briefing, follow-up, proposals, AE, account-executive, meeting-prep]
featured: false
verified: true
---

# Meeting Intelligence

## Overview

Meeting Intelligence covers the complete lifecycle of a B2B sales meeting: **before**, **during**, and **after**. The skill ensures Account Executives (AEs) never walk into a meeting underprepared and never let follow-ups slip through the cracks.

### The Meeting Lifecycle

```
BEFORE                      DURING                    AFTER
  |                           |                         |
  v                           v                         v
Calendar event fires    Meeting occurs with       Transcript / notes
  |                     prepared talking points    become available
  v                           |                         |
Research participants         v                         v
Research company         Capture notes in          Extract summary,
Pull deal context        structured format         action items, signals
  |                           |                         |
  v                           v                         v
Generate briefing doc    Meeting Notes Template    Draft follow-up email
Deliver to AE                                     Detect proposal requests
                                                  Update CRM, notify team
```

### Who Uses This

- **Primary:** Account Executives (AEs) managing mid- and late-stage deals
- **Secondary:** Sales Development Representatives (SDRs) preparing for qualified handoff calls
- **Tertiary:** Sales managers reviewing meeting outcomes across their team

### Core Value

1. **Never underprepared.** Every external meeting has a briefing doc delivered before the call, with participant bios, company context, deal history, and recommended talking points.
2. **Never drop a follow-up.** Every completed meeting produces a drafted follow-up email within minutes, not hours.
3. **Never miss a buying signal.** Proposal requests and budget discussions are automatically flagged and routed to the right people.

---

## Pre-Call Briefing Framework

The pre-call briefing is triggered by an upcoming calendar event that includes external participants. The goal is a single document an AE can review in 3-5 minutes to walk in informed.

### Step 1: Identify External Participants

Parse the calendar event for attendee information:

- Extract attendee names and email addresses
- Separate internal team members from external participants (by email domain)
- Identify the company from the external email domain(s)

### Step 2: Participant Research

For each external participant, gather:

| Field | Description | Source |
|-------|-------------|--------|
| **Name** | Full name | Calendar event |
| **Title** | Current job title | Professional profile / company website |
| **Role in decision** | Champion, Economic Buyer, Technical Evaluator, End User, Influencer | CRM notes + inference from title |
| **Professional summary** | 2-3 sentence bio: career trajectory, areas of expertise, notable achievements | Professional profile, company bio page |
| **Previous interactions** | Last meeting date, topics discussed, commitments made | CRM activity history |
| **Connection points** | Shared connections, alma mater, mutual interests, recent posts/articles | Professional profile, web search |

**Research priority:** Focus depth on the most senior external attendee and any new participants not previously met.

### Step 3: Company Context

Gather current intelligence on the prospect company:

| Category | What to Find |
|----------|--------------|
| **Company snapshot** | Industry, employee count, estimated revenue, headquarters, founded date |
| **Recent news** | Last 90 days: funding rounds, product launches, executive changes, partnerships, press coverage |
| **Competitive landscape** | Known competitors, current vendor(s) for the category your product serves |
| **Product/technology updates** | Recent product releases, tech stack signals, job postings that indicate priorities |
| **Financial signals** | Funding stage, recent fundraise, public earnings (if applicable), hiring velocity |

### Step 4: Deal Context

Pull current deal information from CRM and previous meeting records:

- **Current stage:** Where the deal sits in the pipeline (Discovery, Evaluation, Negotiation, etc.)
- **Previous touchpoints:** Summary of last 3 interactions (meetings, emails, calls)
- **Open questions:** Unresolved items from prior conversations
- **Known objections:** Concerns raised and how they were (or were not) addressed
- **Stakeholder map:** Who has been involved, who is missing from the buying committee
- **Timeline:** Any stated deadlines, budget cycles, or decision dates

### Step 5: Generate Talking Points

Based on the research, recommend 3-5 talking points:

1. **Opener** -- Reference a recent company event or participant achievement to show you did your homework
2. **Pain validation** -- A question that probes a known or inferred pain point
3. **Value connection** -- How your solution specifically addresses their situation
4. **Objection preemption** -- Proactively address a known or likely concern
5. **Next step driver** -- A question or statement designed to advance the deal to the next stage

### Briefing Document Template

```markdown
# Pre-Call Briefing: [Company Name]
**Meeting:** [Date] [Time] | [Duration]
**Meeting Link:** [if available]

---

## Participants

### External
| Name | Title | Decision Role | Last Interaction |
|------|-------|---------------|------------------|
| [Name] | [Title] | [Champion/Buyer/Evaluator/User] | [Date: brief summary] |

**[Name] — Quick Bio:**
[2-3 sentence professional summary. Career trajectory, expertise, notable items.]

**[Name] — Quick Bio:**
[2-3 sentence professional summary.]

### Internal (Our Team)
- [Name] ([Title]) — [Role in this meeting]

---

## Company Snapshot: [Company Name]
- **Industry:** [Industry]
- **Size:** [Employee count] employees | ~$[Revenue] ARR
- **HQ:** [Location] | **Founded:** [Year]
- **Funding:** [Stage / Last round]

### Recent News (Last 90 Days)
- [Date]: [Headline + 1-sentence summary]
- [Date]: [Headline + 1-sentence summary]

### Competitive Landscape
- Current vendor(s): [Known or suspected]
- Key competitors in space: [List]

---

## Deal Context
- **Pipeline Stage:** [Stage]
- **Deal Size:** $[Amount] | [Seat count / SKU]
- **Timeline:** [Stated decision date or budget cycle]
- **Last Touchpoint:** [Date] — [Brief summary of what happened]

### Open Questions
1. [Unresolved item from prior conversations]
2. [Another unresolved item]

### Known Objections
- **[Objection]:** [How it was addressed or "unresolved"]

---

## Recommended Talking Points
1. **Opener:** [Specific reference to recent news or participant achievement]
2. **Pain probe:** "[Suggested question about a known pain point]"
3. **Value connection:** [How your solution maps to their situation]
4. **Objection preemption:** [Proactive framing for a likely concern]
5. **Next step:** "[Question or statement to advance the deal]"

---

## Preparation Checklist
- [ ] Review this briefing (3-5 min)
- [ ] Check for any last-minute news on company/participants
- [ ] Confirm demo environment is ready (if applicable)
- [ ] Have pricing/proposal materials accessible (if deal stage warrants)
- [ ] Prepare screen share / materials for meeting
```

---

## Post-Call Follow-Up Framework

The post-call follow-up is triggered when a meeting ends and a transcript, recording summary, or set of notes becomes available. The goal is a drafted follow-up email delivered to the AE for review within minutes of the call ending.

### Step 1: Meeting Summary Extraction

From the transcript or notes, extract:

- **Key topics discussed** -- What subjects were covered, in order
- **Decisions made** -- Any agreements reached during the call
- **Questions asked by prospect** -- Signals interest areas and concerns
- **Concerns or objections raised** -- Explicit pushback or hesitation
- **Enthusiasm signals** -- Moments of strong positive reaction
- **Pricing/commercial discussion** -- Any mention of budget, pricing, contracts, terms

### Step 2: Action Item Detection

Scan for commitments made by either side:

| Field | Description |
|-------|-------------|
| **Action** | What was committed to |
| **Owner** | Who is responsible (name + company) |
| **Deadline** | When it is due (explicit date or relative: "by end of week", "next Tuesday") |
| **Category** | Proposal, Technical, Legal, Internal Review, Demo, Reference, Other |

**Detection patterns for action items:**

- "I will send you..." / "We will prepare..."
- "Can you share..." / "We need to get..."
- "Let's schedule..." / "How about we..."
- "By [date], we should have..."
- "The next step would be..."
- "I need to check with [person] and get back to you"

### Step 3: Route to Follow-Up Path

Determine the appropriate follow-up path based on the meeting content:

#### Sales Path (Active Deal Progression)

Use this path when the meeting involved:
- Pricing or commercial discussion
- Product evaluation or demo feedback
- Stakeholder introductions or expansion
- Explicit next steps toward a purchase decision

**Sales follow-up structure:**

1. **Thank and recap** -- Thank attendees, summarize 2-3 key discussion points
2. **Address concerns** -- Directly reference objections raised and provide responses or resources
3. **Confirm action items** -- List every commitment with owner and deadline
4. **Propose next step** -- Suggest a specific next meeting or milestone with proposed dates
5. **Attach resources** -- Reference any materials discussed (case studies, technical docs, pricing)

#### Non-Sales Path (Relationship / Informational)

Use this path when the meeting was:
- An introductory or networking call
- An informational session (not deal-related)
- A check-in with an existing customer (not expansion-related)

**Non-sales follow-up structure:**

1. **Thank for time** -- Genuine, brief appreciation
2. **Share value** -- One relevant resource, article, or introduction that helps them
3. **Offer availability** -- Open door for future conversation without pressure
4. **No hard ask** -- Do not propose a next meeting or push toward a sales outcome

### Follow-Up Email Template (Sales Path)

```markdown
Subject: Follow-up — [Primary Topic] | [Company Name]

Hi [First Name],

Thank you for taking the time to meet [today/yesterday]. It was great
connecting with [you / you and [other attendee names]].

**Key Takeaways from Our Discussion:**
- [Topic 1]: [1-sentence summary of what was discussed/decided]
- [Topic 2]: [1-sentence summary]
- [Topic 3]: [1-sentence summary]

[If objections were raised:]
You mentioned [concern/objection]. [1-2 sentences addressing it directly,
with a link to supporting material if available.]

**Action Items:**
- [ ] [Owner]: [Action] — by [date]
- [ ] [Owner]: [Action] — by [date]
- [ ] [Owner]: [Action] — by [date]

**Next Steps:**
[Propose a specific next meeting or milestone.] Would [Day, Date] at
[Time] work for [purpose of next meeting]? I have included a calendar
invite for your convenience.

[If attachments discussed:]
As discussed, I have attached [resource name] for your review.

Looking forward to continuing the conversation.

Best regards,
[AE Name]
```

### Follow-Up Email Template (Non-Sales Path)

```markdown
Subject: Great connecting — [brief reference to topic]

Hi [First Name],

Thank you for taking the time to chat [today/yesterday]. I enjoyed
learning about [specific thing they shared].

I thought you might find this useful: [link to relevant article, report,
or resource that relates to what they discussed].

If there is ever anything I can help with, do not hesitate to reach out.

Best,
[AE Name]
```

---

## Proposal Detection Patterns

Proposal detection identifies buying signals within call transcripts that indicate a prospect is ready to move toward a commercial decision. When detected, these signals trigger CRM updates and team notifications to accelerate response time.

### Direct Request Signals

These are explicit requests that clearly indicate a desire to evaluate pricing or receive a formal proposal:

| Signal Category | Example Phrases |
|----------------|-----------------|
| **Proposal request** | "Can you send us a proposal?", "We would like to see a formal quote", "Put together pricing for us" |
| **Pricing inquiry** | "What would this cost for [X] users?", "What is the pricing for the enterprise tier?", "Can you break down the licensing?" |
| **Contract questions** | "What are your contract terms?", "Do you offer annual billing?", "What does the SLA look like?" |
| **Procurement process** | "We need to run this through procurement", "Can you fill out our vendor assessment form?", "Our legal team will need to review" |
| **Budget confirmation** | "We have budget allocated for this quarter", "This falls within our approved spend", "We set aside budget for a tool like this" |

### Indirect Buying Signals

These are softer signals that suggest the prospect is mentally progressing toward a decision, even if they have not explicitly asked for a proposal:

| Signal Category | Example Phrases |
|----------------|-----------------|
| **Implementation planning** | "What does onboarding look like?", "How long does implementation take?", "What would migration from [current vendor] involve?" |
| **Internal socialization** | "I need to loop in [person/team]", "Can you present this to our leadership?", "We would need buy-in from engineering" |
| **Timeline pressure** | "We need a solution by Q[X]", "Our contract with [vendor] expires in [timeframe]", "We are evaluating this quarter" |
| **Technical validation** | "Can we do a proof of concept?", "Is there a sandbox we can test in?", "Our team would want to run a pilot" |
| **Comparison shopping** | "We are also looking at [competitor]", "How do you compare to [competitor]?", "What makes you different from [alternative]?" |
| **Success criteria** | "What would success look like in the first 90 days?", "What metrics do your customers typically see?", "Can you share case studies for companies like ours?" |

### Detection Confidence Levels

Assign a confidence level to each detected signal:

| Level | Confidence | Criteria | Action |
|-------|-----------|----------|--------|
| **High** | 90%+ | Direct proposal/pricing request with timeline and budget confirmation | Immediately flag for proposal creation |
| **Medium** | 60-89% | Direct pricing inquiry OR multiple indirect signals in same call | Flag for AE review, suggest proposal preparation |
| **Low** | 30-59% | Single indirect signal, exploratory tone | Log in CRM, monitor in subsequent calls |

### Proposal Detection Routing

When a proposal signal is detected:

```
Transcript analyzed
  |
  v
Buying signal detected?
  |
  +-- No --> Log meeting summary in CRM, send standard follow-up
  |
  +-- Yes --> Classify confidence level
                |
                +-- High confidence
                |     |
                |     v
                |   Update CRM opportunity:
                |     - Move stage to "Proposal Requested"
                |     - Set close date based on stated timeline
                |     - Add deal amount if pricing was discussed
                |     |
                |     v
                |   Notify team:
                |     - Alert AE (if not already aware)
                |     - Alert Sales Manager
                |     - Alert Solutions Engineer (if technical requirements mentioned)
                |     - Include: deal summary, signal quote, proposed next steps
                |     |
                |     v
                |   Create proposal task with deadline
                |
                +-- Medium confidence
                |     |
                |     v
                |   Update CRM: add note with detected signals
                |   Notify AE: "Possible proposal opportunity detected"
                |   Suggest: prepare proposal materials, confirm with prospect in follow-up
                |
                +-- Low confidence
                      |
                      v
                    Log signal in CRM notes
                    No notification (avoid alert fatigue)
                    Monitor for escalation in subsequent meetings
```

---

## Meeting Notes Template

Use this structured format during or immediately after meetings to capture intelligence consistently. This template feeds directly into the post-call follow-up and proposal detection workflows.

```markdown
# Meeting Notes: [Company Name] | [Date]

## Meeting Details
- **Date/Time:** [Date] [Time] ([Duration])
- **Type:** [Discovery / Demo / Technical Deep-Dive / Negotiation / Check-in / Other]
- **Meeting Link/Location:** [Link or address]

## Attendees

### External
| Name | Title | Role in Decision |
|------|-------|------------------|
| [Name] | [Title] | [Champion / Economic Buyer / Technical Evaluator / End User / Influencer] |

### Internal
| Name | Title | Role in Meeting |
|------|-------|-----------------|
| [Name] | [Title] | [AE / SE / Manager / Executive Sponsor] |

## Topics Discussed
1. **[Topic]:** [Summary of discussion, 2-3 sentences]
2. **[Topic]:** [Summary of discussion]
3. **[Topic]:** [Summary of discussion]

## Key Insights / Pain Points Revealed
- **[Pain Point]:** [What the prospect said, context for why it matters]
- **[Insight]:** [Something learned about their process, priorities, or organization]
- **[Priority Signal]:** [Evidence of what matters most to them right now]

## Objections Raised
| Objection | Our Response | Resolved? |
|-----------|-------------|-----------|
| [Objection] | [How we addressed it] | [Yes / Partially / No — needs follow-up] |

## Buying Signals Detected
- **Signal:** "[Direct quote or paraphrase]"
- **Confidence:** [High / Medium / Low]
- **Implication:** [What this means for deal progression]

## Action Items
| # | Action | Owner | Deadline | Status |
|---|--------|-------|----------|--------|
| 1 | [Action description] | [Name (Company)] | [Date] | [Pending / Complete] |
| 2 | [Action description] | [Name (Company)] | [Date] | [Pending / Complete] |
| 3 | [Action description] | [Name (Company)] | [Date] | [Pending / Complete] |

## Next Meeting
- **Scheduled:** [Yes — Date/Time] / [No — to be scheduled]
- **Purpose:** [What the next meeting will cover]
- **Required attendees:** [Who needs to be there]

## Internal Notes (Not for Sharing)
- [Deal strategy observations]
- [Competitive intelligence gathered]
- [Internal actions needed before next touch]
```

---

## Input/Output Contract

This section defines the data interfaces for the meeting intelligence skill. All references are tool-agnostic; wire inputs and outputs to your specific platforms as needed.

### Inputs

| Input | Source | Required Fields | When Used |
|-------|--------|----------------|-----------|
| **Calendar event** | Calendar platform | Attendee names, attendee emails, meeting title, date/time, duration, meeting link | Pre-call briefing |
| **Call transcript** | Meeting recording platform or manual notes | Full text transcript with speaker labels and timestamps | Post-call follow-up, proposal detection |
| **Meeting notes** | AE-entered or template-based capture | Topics, action items, attendees, key insights | Post-call follow-up (when no transcript available) |
| **Meeting summary** | Auto-generated by recording platform | Summary text, action items, key moments | Post-call follow-up (lightweight path) |
| **CRM deal record** | CRM platform | Current stage, deal amount, close date, activity history, stakeholder map | Pre-call briefing (deal context), proposal detection (stage update) |
| **Participant profiles** | Professional network, web research | Name, title, company, career history, recent activity | Pre-call briefing (participant research) |

### Outputs

| Output | Format | Recipient | Description |
|--------|--------|-----------|-------------|
| **Pre-call briefing document** | Structured markdown (see template above) | AE, via messaging platform or document platform | Complete briefing delivered 30-60 min before the meeting |
| **Post-call follow-up email draft** | Email-ready text with subject line | AE, for review and send | Personalized follow-up covering recap, action items, next steps |
| **Meeting notes (structured)** | Structured markdown (see template above) | AE + CRM | Formatted notes with action items, insights, buying signals |
| **Proposal detection flag** | Structured alert with confidence level | AE + Sales Manager + CRM | Signal classification, supporting quotes, recommended actions |
| **Action item list** | Tabular: action, owner, deadline, status | AE + CRM | Extracted commitments from the meeting |
| **CRM update payload** | Key-value pairs for CRM fields | CRM platform | Stage change, close date update, deal amount, activity log entry |

### External Actions (Recommended Integrations)

These actions extend the skill's outputs into operational workflows. Wire them to your specific platforms:

| Action | Trigger | Description |
|--------|---------|-------------|
| **Send follow-up email** | Post-call follow-up draft approved by AE | Deliver the follow-up email to meeting attendees via email platform |
| **Update CRM opportunity** | Proposal detected OR meeting completed | Update deal stage, add activity, adjust close date, log notes |
| **Notify team** | High-confidence proposal signal detected | Alert relevant team members via messaging platform with deal summary and urgency |
| **Schedule next meeting** | Next step agreed upon in follow-up | Create calendar event with proposed attendees, time, and agenda |
| **Create proposal document** | High-confidence proposal request confirmed | Generate proposal shell in document platform with deal details pre-populated |
| **Log to meeting tracker** | Every meeting completed | Append meeting record to team-wide meeting tracking spreadsheet or dashboard |

### Automation Trigger Patterns

These patterns describe when each workflow should fire. Implementation depends on your automation platform:

| Pattern | Trigger | Workflow |
|---------|---------|----------|
| **Pre-call: calendar-based** | Calendar event with external attendees starts in 1-24 hours | Research participants, build briefing, deliver to AE |
| **Pre-call: new meeting scheduled** | New calendar event created with external domain attendees | Lightweight participant lookup, queue for full briefing closer to meeting time |
| **Post-call: transcript available** | Call recording platform delivers transcript | Extract summary, detect proposals, draft follow-up, update CRM |
| **Post-call: manual trigger** | AE pastes notes or requests follow-up | Process notes through follow-up framework, draft email |
| **Proposal detection: async** | Transcript analyzed after call | Scan for buying signals, classify confidence, route accordingly |

---

## Quick Reference

### Pre-Call Briefing Checklist

Use this checklist to verify briefing completeness before delivery:

- [ ] All external participants identified and researched
- [ ] Each participant has: name, title, decision role, bio, previous interactions
- [ ] Company snapshot complete: industry, size, revenue, funding, HQ
- [ ] Recent news reviewed (last 90 days)
- [ ] Competitive landscape documented
- [ ] Deal context pulled: stage, last touchpoint, open questions, objections
- [ ] 3-5 talking points generated (opener, pain probe, value connection, objection preemption, next step driver)
- [ ] Briefing document formatted and delivered 30-60 minutes before meeting

### Post-Call Follow-Up Checklist

Use this checklist to verify follow-up quality before sending:

- [ ] Meeting summary extracted (key topics, decisions, concerns)
- [ ] All action items captured with owner and deadline
- [ ] Follow-up path determined (sales vs. non-sales)
- [ ] Email draft references specific discussion points (not generic)
- [ ] Objections addressed with supporting materials if available
- [ ] Next step proposed with specific date/time
- [ ] Tone matches relationship stage (not too formal, not too casual)
- [ ] AE has reviewed and personalized before sending
- [ ] CRM updated with meeting notes and action items

### Proposal Signal Keywords

Reference list of phrases that indicate buying intent. Use for manual review or as input to automated detection:

**High-confidence keywords:**
- "send us a proposal"
- "formal quote"
- "pricing for [X] users/seats"
- "contract terms"
- "procurement process"
- "budget allocated"
- "approved spend"
- "ready to move forward"
- "what are the next steps to get started"
- "vendor assessment form"

**Medium-confidence keywords:**
- "implementation timeline"
- "onboarding process"
- "loop in [finance/legal/leadership]"
- "proof of concept"
- "pilot program"
- "solution by [quarter/date]"
- "current contract expires"
- "comparing with [competitor]"
- "case studies for companies like ours"
- "ROI expectations"

**Low-confidence keywords (monitor, do not alert):**
- "interesting"
- "we should explore this"
- "good to know"
- "keep us posted"
- "circle back"
- "not a priority right now, but..."
- "down the road"
- "future consideration"

---

## Framework References

This skill draws on established B2B sales methodologies:

- **MEDDIC** (Metrics, Economic Buyer, Decision Criteria, Decision Process, Identify Pain, Champion) -- for stakeholder mapping and deal context in briefings
- **SPIN Selling** (Situation, Problem, Implication, Need-Payoff) -- for generating talking points that probe and expand pain
- **Challenger Sale** -- for framing talking points around teaching, tailoring, and taking control of the commercial conversation
- **BANT** (Budget, Authority, Need, Timeline) -- for proposal detection signal classification
