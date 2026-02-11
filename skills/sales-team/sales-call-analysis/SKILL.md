---

# === CORE IDENTITY ===
name: sales-call-analysis
title: Sales Call Analysis
description: Sales call evaluation frameworks, scoring methodology, and coaching insights for B2B sales. Enables systematic assessment of sales conversations against proven methodologies (SPIN, Challenger, MEDDIC) with quantified scorecards and improvement recommendations.
domain: sales
subdomain: sales-operations

# === WEBSITE DISPLAY ===
difficulty: advanced
time-saved: "Reduces call review from 45 minutes to 10 minutes per call"
frequency: "Per-call, daily for sales managers; weekly self-review for reps"
use-cases:
  - Evaluating sales calls against methodology frameworks
  - Generating quantified call scorecards with dimension breakdowns
  - Identifying coaching opportunities and patterns across multiple calls
  - Self-review for reps to improve call performance
  - Comparing call quality trends over time

# === RELATIONSHIPS ===
related-agents:
  - ap-account-executive
  - ap-sales-development-rep
related-skills:
  - sales-team/meeting-intelligence
  - sales-team/pipeline-analytics
  - sales-team/lead-qualification
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
  - title: Discovery Call Evaluation
    input: "Evaluate this discovery call transcript against SPIN framework"
    output: "Overall: 72/100 (Good). Situation: 85 (thorough context gathering). Problem: 78 (identified 2 of 3 pain points). Implication: 55 (missed cost quantification). Need-Payoff: 70 (connected to value but weak on urgency). Coaching: Focus on implication questions — quantify the cost of inaction."
  - title: Demo Call Scoring
    input: "Score this demo call: did the rep handle objections and close effectively?"
    output: "Overall: 65/100 (Needs improvement). Engagement: 80, Discovery recap: 90, Demo relevance: 70, Objection handling: 45 (deflected rather than addressed), Close: 50 (no clear next step agreed). Coaching: Practice objection reframing — acknowledge, question, position."

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
tags: [sales, call-analysis, coaching, SPIN, challenger, MEDDIC, scoring, sales-methodology]
featured: false
verified: true
---

# Sales Call Analysis

Systematic evaluation of B2B sales conversations against proven methodologies, producing quantified scorecards with dimension-level breakdowns and targeted coaching recommendations. Transforms subjective call reviews into objective, repeatable assessments that drive measurable rep improvement.

## Overview

Sales call analysis is the practice of reviewing sales conversations against structured frameworks to identify what a rep did well, where they fell short, and what specific behaviors to change. Without a systematic approach, call reviews devolve into subjective opinions that vary by reviewer and produce inconsistent coaching.

This skill provides three things:

1. **Evaluation frameworks** (SPIN, Challenger, MEDDIC) matched to call type, so you score against the right criteria.
2. **Universal scoring dimensions** with rubrics, so scores are consistent across reviewers and over time.
3. **Coaching translation patterns**, so scores become actionable improvement plans rather than abstract numbers.

**Who uses this skill:**

- **Sales managers** review rep calls to identify coaching opportunities, track improvement over time, and maintain team-wide quality standards. A manager reviewing five calls per week can complete reviews in under an hour instead of four.
- **Account executives** self-review their own calls to identify blind spots before a manager does. Self-review builds self-awareness faster than external feedback alone.
- **Sales enablement teams** analyze call patterns across the organization to identify training gaps, update playbooks, and measure the impact of methodology changes.
- **Revenue leaders** use aggregated call quality data to correlate call scores with pipeline conversion and identify which behaviors drive revenue.

**Core value proposition:** Objective evaluation produces targeted improvement. When you know that a rep consistently scores 4/10 on implication questions but 8/10 on rapport, you coach implication questions specifically rather than running generic "discovery skills" training. Targeted coaching produces faster improvement with less wasted effort.

## Call Evaluation Frameworks

Each framework targets a different call type and sales motion. Select the framework that matches the call's purpose, or use the universal scoring dimensions (next section) for calls that do not fit neatly into one framework.

### SPIN Selling (Discovery Calls)

**When to use:** Early-stage discovery calls where the primary goal is understanding the prospect's situation, uncovering problems, and building urgency. Best for consultative selling motions where the rep needs to diagnose before prescribing.

**Framework dimensions:**

| Dimension | What to evaluate | Strong signal | Weak signal |
|-----------|-----------------|---------------|-------------|
| **Situation** | Did the rep gather context about the prospect's current state, processes, tools, team structure, and constraints? | Asked targeted questions informed by pre-call research; avoided asking questions answerable from public sources | Asked generic "tell me about your company" questions; no evidence of preparation |
| **Problem** | Did the rep surface explicit problems, frustrations, or gaps the prospect experiences? | Prospect articulated 2+ specific problems in their own words; rep used open-ended questions to draw them out | Rep stated problems for the prospect; leading questions that put words in their mouth |
| **Implication** | Did the rep help the prospect understand the downstream consequences of their problems? | Prospect quantified impact (cost, time, risk); emotional engagement visible ("that keeps me up at night") | Problems discussed in abstract terms; no connection to business impact or urgency |
| **Need-Payoff** | Did the rep guide the prospect to articulate the value of solving the problem? | Prospect described desired future state; connected solution to their specific pains | Rep pitched features; prospect passive during value discussion |

**SPIN scoring weights:**

- Situation: 15% (necessary but lower-value; over-indexing here wastes call time)
- Problem: 25% (core discovery competency)
- Implication: 35% (highest-value; this is where urgency is built)
- Need-Payoff: 25% (bridges discovery to solution)

**Red flags in SPIN calls:**

- More than 30% of call time on Situation questions (over-research, under-discovery)
- Zero Implication questions (problem identified but not amplified)
- Rep answering their own Need-Payoff questions instead of letting the prospect articulate value

### Challenger Sale (Complex Enterprise Calls)

**When to use:** Mid-cycle enterprise calls where the rep needs to teach the prospect something new, reframe their thinking, or push back on the status quo. Best for competitive situations where differentiation matters.

**Framework dimensions:**

| Dimension | What to evaluate | Strong signal | Weak signal |
|-----------|-----------------|---------------|-------------|
| **Teach** | Did the rep share an insight the prospect did not already know? Did they reframe the problem in a way that changes how the prospect thinks about it? | Prospect said "I never thought about it that way" or asked follow-up questions indicating new understanding | Rep repeated what the prospect already knew; no commercial insight delivered |
| **Tailor** | Did the rep connect the teaching to the prospect's specific situation, industry, role, or priorities? | Referenced prospect's specific metrics, competitive landscape, or strategic priorities | Generic pitch delivered identically regardless of audience; no personalization |
| **Take Control** | Did the rep guide the conversation, handle pushback constructively, and drive toward a commitment? | Pushed back respectfully on prospect objections; proposed concrete next steps; maintained control of agenda | Deferred to prospect on all decisions; avoided tension; ended without clear commitment |

**Challenger scoring weights:**

- Teach: 40% (the differentiating behavior)
- Tailor: 30% (relevance multiplier)
- Take Control: 30% (execution and closing)

**Red flags in Challenger calls:**

- Teaching insight is a product feature rather than a market/business insight
- Tailoring consists only of using the prospect's company name in a templated pitch
- "Taking control" manifests as aggression rather than constructive tension

### MEDDIC (Qualification Calls)

**When to use:** Qualification and deal progression calls where the goal is to determine whether a deal is real, winnable, and worth pursuing. Best for high-value enterprise deals with long sales cycles.

**Framework dimensions:**

| Dimension | What to evaluate | Strong signal | Weak signal |
|-----------|-----------------|---------------|-------------|
| **Metrics** | Did the rep identify the quantifiable outcomes the prospect needs to achieve? | Prospect stated specific KPIs ("reduce churn by 15%", "save 20 hours per week") | Vague goals ("improve efficiency") with no numbers attached |
| **Economic Buyer** | Did the rep identify who controls the budget and approval? | Named the decision-maker; discussed their priorities; has a plan to engage them | Unclear who approves; talking only to a champion without economic buyer access |
| **Decision Criteria** | Did the rep uncover the criteria the prospect will use to evaluate solutions? | Listed specific evaluation factors (price, integration, support, compliance); understands relative priority | Assumed criteria based on rep's own product strengths; did not ask prospect directly |
| **Decision Process** | Did the rep map out the steps, timeline, and stakeholders in the buying process? | Clear timeline with milestones; knows who is involved at each stage; identified potential blockers | Vague "we'll get back to you"; no timeline; unknown stakeholders |
| **Identify Pain** | Did the rep surface a compelling pain that creates urgency to act? | Pain is specific, quantified, and tied to a business consequence; prospect owns the pain | Pain is assumed by the rep; prospect does not express urgency |
| **Champion** | Did the rep identify and validate an internal advocate? | Champion has influence, access to the economic buyer, and a personal reason to support the deal | No internal advocate; or a "champion" who has no influence or access |

**MEDDIC scoring weights:**

- Metrics: 15%
- Economic Buyer: 20%
- Decision Criteria: 15%
- Decision Process: 15%
- Identify Pain: 20%
- Champion: 15%

**Red flags in MEDDIC calls:**

- Economic buyer not identified by second call
- Decision process described as "they'll figure it out internally"
- Champion cannot articulate why they support this solution

## Universal Scoring Dimensions

These seven dimensions apply to every sales call regardless of which methodology framework is used. They measure the foundational behaviors that determine call quality independent of framework-specific competencies.

### Dimension 1: Opening and Rapport (0-10)

**What it measures:** Did the rep establish trust, set expectations, and create a productive conversation environment in the first two minutes?

| Score | Description | Evidence |
|-------|-------------|----------|
| **1-3 (Poor)** | No agenda set. Jumped straight into pitch. Prospect confused about call purpose. | "So let me tell you about what we do..." with no context-setting |
| **4-6 (Adequate)** | Basic agenda stated but generic. Some rapport attempted. Prospect understood purpose. | "Today I'd like to learn about your needs and share how we might help" |
| **7-8 (Good)** | Personalized opening referencing prior research or conversation. Clear agenda with time check. Prospect engaged early. | "Last time you mentioned X challenge. I'd like to dig into that today. We have 30 minutes -- does that still work?" |
| **9-10 (Excellent)** | Opening establishes credibility, references specific context, sets a mutual agenda, and gets prospect buy-in on structure. Natural rapport without forced small talk. | "Based on our last conversation and what I've seen in your industry, I've prepared three areas to explore. Before we start, what's most important to you today?" |

### Dimension 2: Discovery Quality (0-10)

**What it measures:** Did the rep ask open-ended questions, listen actively, and probe beneath surface-level answers?

| Score | Description | Evidence |
|-------|-------------|----------|
| **1-3 (Poor)** | Closed questions only. Rep talked more than listened. No follow-up on prospect answers. | Rapid-fire yes/no questions; prospect gives one-word answers |
| **4-6 (Adequate)** | Mix of open and closed questions. Some follow-up. Prospect provided useful information but conversation stayed surface-level. | "What challenges are you facing?" followed by immediate pivot to pitch |
| **7-8 (Good)** | Open-ended questions with genuine follow-up. Active listening signals (paraphrasing, clarifying). Multi-layered discovery that went beyond initial answers. | "You mentioned turnover is a problem. Help me understand -- what happens when someone leaves? What's the downstream impact?" |
| **9-10 (Excellent)** | Prospect did most of the talking. Rep asked layered questions that revealed insights the prospect had not previously articulated. Discovery felt like a valuable conversation for the prospect. | Prospect volunteers information unprompted; says "that's a great question"; pauses to think before answering |

### Dimension 3: Pain Identification (0-10)

**What it measures:** Were customer pain points surfaced, validated, and quantified?

| Score | Description | Evidence |
|-------|-------------|----------|
| **1-3 (Poor)** | No pain identified. Rep assumed pain without validation. Prospect did not express frustration or urgency. | Rep stated "companies like yours struggle with X" without confirmation |
| **4-6 (Adequate)** | Pain identified at a general level. Prospect acknowledged the problem but did not quantify it or express urgency. | "Yes, that's a challenge for us" without specifics on impact |
| **7-8 (Good)** | Specific pain identified and quantified. Prospect described impact in measurable terms. Connection to business outcomes established. | "We lose about 20 hours per week on manual reconciliation, and it's caused two late filings this quarter" |
| **9-10 (Excellent)** | Multiple pains surfaced, prioritized, and quantified. Prospect articulated both the business cost and the personal impact. Urgency to solve is clear. | Prospect describes financial impact, career risk, and competitive pressure; ranks their top three pains and says "this has to change this quarter" |

### Dimension 4: Value Articulation (0-10)

**What it measures:** Was the product/solution connected to the prospect's specific pains rather than presented as generic features?

| Score | Description | Evidence |
|-------|-------------|----------|
| **1-3 (Poor)** | Feature dump with no connection to prospect's situation. Same pitch regardless of what was learned in discovery. | "Our platform has 50+ integrations, AI-powered analytics, and real-time dashboards" with no tie to stated needs |
| **4-6 (Adequate)** | Some features connected to stated needs. Value proposition partially personalized but still mostly generic. | "Since you mentioned reporting challenges, our analytics module can help with that" |
| **7-8 (Good)** | Value proposition directly mapped to specific pains identified in discovery. Prospect can see how the solution addresses their situation. | "You said you lose 20 hours weekly on reconciliation. Here's specifically how that workflow would change..." |
| **9-10 (Excellent)** | Value articulated in the prospect's own language, tied to their metrics, and framed as solving their highest-priority pain. Prospect articulates the value themselves. | Prospect says "So this would save us roughly $X per quarter and eliminate the late filing risk" without being prompted |

### Dimension 5: Objection Handling (0-10)

**What it measures:** Were objections addressed directly with acknowledgment, exploration, and resolution -- not deflected or ignored?

| Score | Description | Evidence |
|-------|-------------|----------|
| **1-3 (Poor)** | Objections ignored, dismissed, or met with defensive responses. Prospect's concerns not acknowledged. | "That's not really an issue" or pivoting away from the objection entirely |
| **4-6 (Adequate)** | Objections acknowledged but not fully resolved. Rep provided a response but did not check whether the prospect was satisfied. | "I understand your concern about pricing. We do offer flexible packages." (no follow-up) |
| **7-8 (Good)** | Objections acknowledged, explored with questions, and addressed with relevant evidence. Rep confirmed resolution before moving on. | "That's a fair concern. Help me understand -- is it the total cost or the payment structure? ... Here's how similar companies have handled that. Does that address your concern?" |
| **9-10 (Excellent)** | Objections treated as buying signals. Rep reframed the objection, provided compelling evidence (case studies, data), and turned the objection into a reason to buy. Prospect's concern fully resolved. | Prospect says "Actually, that makes sense" and moves forward with increased confidence |

### Dimension 6: Next Steps and Close (0-10)

**What it measures:** Was a clear, specific, time-bound next action agreed upon by both parties?

| Score | Description | Evidence |
|-------|-------------|----------|
| **1-3 (Poor)** | No next step discussed. Call ended with "we'll be in touch" or "let me know if you have questions." | Vague follow-up with no date, no action, no commitment from either party |
| **4-6 (Adequate)** | Next step mentioned but not specific. One party committed but not the other. No calendar hold. | "I'll send you some materials and we can reconnect next week" |
| **7-8 (Good)** | Specific next step agreed with date and time. Both parties have clear actions. Calendar invite sent during the call. | "Let's schedule a demo for your team on Thursday at 2 PM. I'll send the invite now. Can you confirm who should attend?" |
| **9-10 (Excellent)** | Next step advances the deal meaningfully. Multiple stakeholders committed. Prospect took an action that demonstrates investment (scheduled internal meeting, shared data, made an introduction). | Prospect says "I'll set up time with our VP for next week and send you our current vendor contract before then" |

### Dimension 7: Talk/Listen Ratio

**What it measures:** The proportion of call time spent talking (rep) versus listening (prospect talking). This is not scored 0-10 but measured as a percentage and compared against targets.

| Call Type | Target Ratio (Rep:Prospect) | Acceptable Range |
|-----------|----------------------------|------------------|
| Discovery | 30:70 | 25:75 to 40:60 |
| Demo | 50:50 | 40:60 to 60:40 |
| Negotiation | 40:60 | 30:70 to 50:50 |
| Follow-up | 35:65 | 25:75 to 45:55 |

**Scoring conversion:**

- Within target range: +5 bonus points to overall score
- Within acceptable range: +0 (neutral)
- Outside acceptable range: -5 penalty to overall score

**How to estimate without tooling:** Count the number of uninterrupted speaking segments longer than 30 seconds for each party. If the rep has significantly more long segments, the ratio is skewed.

## Scorecard Template

Use this template to produce a structured evaluation for every call reviewed.

### Call Metadata

```
Call Date:          [YYYY-MM-DD]
Participants:       [Rep name] (Seller) | [Prospect name, title, company] (Buyer)
Call Type:          [Discovery | Demo | Qualification | Negotiation | Follow-up]
Duration:           [MM:SS]
Deal Stage:         [Prospecting | Discovery | Evaluation | Negotiation | Closed]
Deal Value:         [Estimated contract value, if known]
Recording Source:   [Call recording platform or manual notes]
```

### Framework Applied

```
Primary Framework:  [SPIN | Challenger | MEDDIC | Universal Only]
Rationale:          [Why this framework was selected for this call type]
```

### Dimension Scores

```
UNIVERSAL DIMENSIONS                    SCORE    EVIDENCE
-----------------------------------------------------------------------
1. Opening & Rapport                    [X/10]   [One-sentence evidence]
2. Discovery Quality                    [X/10]   [One-sentence evidence]
3. Pain Identification                  [X/10]   [One-sentence evidence]
4. Value Articulation                   [X/10]   [One-sentence evidence]
5. Objection Handling                   [X/10]   [One-sentence evidence]
6. Next Steps & Close                   [X/10]   [One-sentence evidence]
7. Talk/Listen Ratio                    [XX:XX]  [Within/outside target]
-----------------------------------------------------------------------
Universal Subtotal:                     [XX/60]

FRAMEWORK-SPECIFIC DIMENSIONS           SCORE    EVIDENCE
-----------------------------------------------------------------------
[Dimension 1 per framework]             [X/10]   [One-sentence evidence]
[Dimension 2 per framework]             [X/10]   [One-sentence evidence]
[... additional dimensions]             [X/10]   [One-sentence evidence]
-----------------------------------------------------------------------
Framework Subtotal:                     [XX/XX]
Talk/Listen Adjustment:                 [+5/0/-5]
-----------------------------------------------------------------------
OVERALL SCORE:                          [XX/100]
GRADE:                                  [See grading scale below]
```

### Grading Scale

| Score | Grade | Interpretation |
|-------|-------|----------------|
| 90-100 | A (Exceptional) | Top-tier execution. Use as training example for the team. |
| 80-89 | B (Strong) | Solid call with minor improvement opportunities. |
| 70-79 | C (Good) | Competent execution but clear areas to develop. |
| 60-69 | D (Needs Improvement) | Fundamental gaps in one or more dimensions. Coaching required. |
| Below 60 | F (Critical) | Multiple dimensions failed. Immediate intervention needed. |

### Overall Score Calculation

The overall score is a weighted composite:

1. **Universal dimensions** (60% of total): Sum of dimensions 1-6, each worth up to 10 points, normalized to 60 points.
2. **Framework-specific dimensions** (40% of total): Sum of framework dimensions, weighted per framework section above, normalized to 40 points.
3. **Talk/Listen adjustment**: Applied as +5, 0, or -5 after the composite.
4. **Cap at 100**: If the adjustment pushes above 100, cap at 100.

### Strengths and Improvement Areas

```
TOP 3 STRENGTHS
-----------------------------------------------------------------------
1. [Dimension]: [Specific behavior observed with evidence from the call]
2. [Dimension]: [Specific behavior observed with evidence from the call]
3. [Dimension]: [Specific behavior observed with evidence from the call]

TOP 3 IMPROVEMENT AREAS
-----------------------------------------------------------------------
1. [Dimension] (Score: X/10)
   Issue:       [What went wrong or was missing]
   Impact:      [How this affected the call outcome]
   Coaching:    [Specific drill, practice, or behavior change recommended]

2. [Dimension] (Score: X/10)
   Issue:       [What went wrong or was missing]
   Impact:      [How this affected the call outcome]
   Coaching:    [Specific drill, practice, or behavior change recommended]

3. [Dimension] (Score: X/10)
   Issue:       [What went wrong or was missing]
   Impact:      [How this affected the call outcome]
   Coaching:    [Specific drill, practice, or behavior change recommended]
```

### Trend Comparison

```
TREND (last 5 calls)
-----------------------------------------------------------------------
Dimension               Current    Avg (Last 5)    Trend
-----------------------------------------------------------------------
Opening & Rapport       [X/10]     [X.X]           [up/down/stable]
Discovery Quality       [X/10]     [X.X]           [up/down/stable]
Pain Identification     [X/10]     [X.X]           [up/down/stable]
Value Articulation      [X/10]     [X.X]           [up/down/stable]
Objection Handling      [X/10]     [X.X]           [up/down/stable]
Next Steps & Close      [X/10]     [X.X]           [up/down/stable]
Overall                 [XX/100]   [XX.X]          [up/down/stable]
-----------------------------------------------------------------------
Notable pattern:        [e.g., "Pain identification improving steadily
                         since implication question coaching started"]
```

## Coaching Insights Pattern

Scores are only useful if they translate into changed behavior. This section covers how to turn scorecard data into coaching that actually improves performance.

### Pattern Recognition Across Multiple Calls

After reviewing three or more calls from the same rep, look for these patterns:

**Consistent weakness (same dimension scores low across calls):**
This indicates a skill gap, not a one-time miss. The rep needs targeted practice on that specific dimension. Example: If a rep scores 3-4 on Objection Handling across five calls, they need objection handling drills, not a reminder to "handle objections better."

**Inconsistent performance (dimension scores vary widely across calls):**
This indicates the rep has the skill but does not apply it consistently. The coaching approach is different: build awareness of when they do and do not use the skill, and identify the triggers that cause them to drop it. Example: A rep who scores 8 on discovery in some calls and 3 in others may be rushing when they feel behind on quota.

**Correlated weaknesses (two dimensions that drop together):**
Some dimensions are causally linked. Poor discovery almost always leads to poor value articulation because the rep does not know enough about the prospect's situation to connect features to pains. Fix the upstream dimension first. Common correlations:

- Low Discovery Quality + Low Pain Identification (not asking enough questions to surface pain)
- Low Pain Identification + Low Value Articulation (cannot connect value without understanding pain)
- Low Opening/Rapport + Low Discovery Quality (prospect not comfortable sharing)
- Low Objection Handling + Low Close (unresolved concerns prevent commitment)

**Declining trend (dimension that was strong but is dropping):**
This may indicate burnout, quota pressure causing shortcuts, or a change in prospect mix (e.g., moving upmarket without adjusting approach). Investigate the cause before coaching the symptom.

### Specific Drill Recommendations Per Dimension

For each dimension that scores below 7, assign one of these focused drills:

**Opening and Rapport (below 7):**
- **Drill: The 90-Second Open.** Rep records themselves delivering their opening for five different prospects. Each opening must reference something specific to that prospect (not generic). Review recordings for personalization and clarity. Practice until the rep can deliver a personalized, agenda-setting open in under 90 seconds without notes.

**Discovery Quality (below 7):**
- **Drill: The Five Whys.** In role-play, the rep must ask at least five follow-up questions for every initial answer the prospect gives. No pivoting to a new topic until the current thread is exhausted. This builds the habit of going deeper rather than wider.

**Pain Identification (below 7):**
- **Drill: Quantify the Pain.** For every pain statement the prospect makes, the rep must ask one question that surfaces a number (cost, time, frequency, headcount). Practice: "How often does that happen?" "What does that cost you per month?" "How many people are affected?" The rep cannot move forward until at least one pain is quantified.

**Value Articulation (below 7):**
- **Drill: The Mirror.** After discovery, the rep must restate the prospect's top three pains using the prospect's exact words before introducing any solution. Then, for each pain, state one specific capability and the expected outcome in the prospect's terms. No feature names allowed -- only outcomes.

**Objection Handling (below 7):**
- **Drill: Acknowledge-Question-Position (AQP).** For every objection in role-play, the rep must: (1) acknowledge the concern without dismissing it, (2) ask a clarifying question to understand the root cause, (3) position a response only after understanding the real concern. Practice with the ten most common objections from the team's objection library.

**Next Steps and Close (below 7):**
- **Drill: The Calendar Test.** Every practice call must end with a specific calendar event. If the rep cannot get a calendar commitment in role-play, they repeat the close sequence until they can. Focus on: proposing a specific date/time, stating what both parties will prepare, and confirming attendance.

### Sample Coaching Conversation Starters

These are opening lines for a manager starting a coaching session based on scorecard data. They are designed to be collaborative rather than punitive.

**For a consistent weakness:**
> "I've reviewed your last four discovery calls. Your opening and rapport scores are consistently strong -- 8s across the board. I want to build on that. I noticed your implication questions are an area where we can level up. In three of the four calls, the prospect identified a problem but the conversation moved to the solution before we explored the downstream impact. What do you think is driving that?"

**For an inconsistent dimension:**
> "Your objection handling is interesting. On the Acme call you scored a 9 -- you acknowledged, asked a follow-up, and resolved it cleanly. But on the GlobalCorp call, you scored a 4 on the same dimension. What felt different to you in those two conversations?"

**For a correlated weakness:**
> "I'm seeing a pattern in your last few calls: the discovery scores and value articulation scores move together. When you go deep on discovery, your value pitch lands perfectly. When discovery is lighter, the value pitch feels more generic. I think if we focus on just one thing -- getting one more layer of detail in discovery -- the value articulation will improve on its own. What do you think?"

**For a declining trend:**
> "Your scores have been strong all quarter, but the last two weeks I'm seeing a dip in the close dimension. You're running great calls but ending without specific next steps. Is there something going on that's making the close feel harder? Quota pressure, different prospect types, something else?"

### Progress Tracking Approach

Track improvement using this structure:

1. **Baseline:** Average score per dimension over the last five calls before coaching intervention.
2. **Target:** Specific numeric target for the dimension being coached (e.g., "move Objection Handling from 4.2 average to 6.5 within four weeks").
3. **Cadence:** Review two calls per week for the coached dimension. Score only the target dimension to keep focus narrow.
4. **Check-in:** Weekly 15-minute coaching session focused solely on the target dimension. Review one good example and one example to improve from that week's calls.
5. **Graduation:** When the rep achieves the target average for three consecutive weeks, move to the next priority dimension.

**Progress log format:**

```
Rep:              [Name]
Coaching Focus:   [Dimension]
Baseline:         [X.X average over last 5 calls]
Target:           [X.X]
Start Date:       [YYYY-MM-DD]

Week 1: [X.X avg] - [Notes on what improved/didn't]
Week 2: [X.X avg] - [Notes]
Week 3: [X.X avg] - [Notes]
Week 4: [X.X avg] - [Notes]

Status: [In progress | Target met | Graduated]
```

## Input/Output Contract

This skill operates on a defined set of inputs and outputs, independent of any specific tooling or platform. Any automation, integration, or manual process can implement this contract.

### Inputs

| Input | Required | Format | Description |
|-------|----------|--------|-------------|
| Call content | Yes (one of three formats) | Transcript text, recording summary, or detailed notes | The raw material to evaluate. Full transcript is highest fidelity; detailed notes are minimum viable. |
| Call type | Yes | Enum: `discovery`, `demo`, `qualification`, `negotiation`, `follow-up` | Determines target talk/listen ratio and default framework. |
| Framework | No (defaults to universal) | Enum: `SPIN`, `Challenger`, `MEDDIC`, `universal` | Which methodology framework to apply in addition to universal dimensions. If omitted, only universal dimensions are scored. |
| Call metadata | Recommended | Structured: date, participants, duration, deal stage, deal value | Enables trend tracking and context-aware scoring. |
| Historical scores | Optional | Array of prior scorecards for this rep | Enables trend comparison in the output. |
| Custom rubric overrides | Optional | Dimension name + modified scoring criteria | For organizations that have adapted the standard rubrics to their sales motion. |

### Outputs

| Output | Format | Description |
|--------|--------|-------------|
| Scorecard | Structured markdown (see template above) | Complete evaluation with dimension scores, evidence, grade, strengths, and improvement areas. |
| Coaching recommendations | Structured text within scorecard | Top 3 improvement areas with specific drill assignments and coaching conversation starters. |
| Trend data point | Structured data (dimension scores + metadata) | One row of data for the rep's historical trend. Designed to be appended to a tracking spreadsheet or database. |
| Executive summary | One-paragraph text | For managers reviewing many calls: overall grade, one standout strength, one critical improvement area. |

### External Actions (Recommended)

These actions are not performed by this skill but are recommended as downstream steps. The user wires these to their own platforms and workflows.

| Action | Trigger | Description |
|--------|---------|-------------|
| Log scorecard | Every evaluation | Append scorecard data to a tracking spreadsheet or database for trend analysis. |
| Notify manager | Score below 60 (Grade F) | Alert the sales manager when a call requires immediate coaching intervention. |
| Update rep development plan | Every evaluation | Add coaching recommendations to the rep's ongoing development plan. |
| Flag training example | Score above 90 (Grade A) | Mark high-scoring calls as training examples for the team. |
| Update pipeline risk | Low close or qualification scores | Flag the associated deal in the CRM as at-risk if close or qualification scores are below threshold. |

## Quick Reference

### Framework Selection Guide

```
CALL TYPE?
|
+-- Discovery call
|   +-- Early stage, consultative motion  --> SPIN
|   +-- Need to reframe prospect thinking --> Challenger
|   +-- Just need a general evaluation    --> Universal only
|
+-- Demo call
|   +-- Standard product demo             --> Universal only
|   +-- Competitive displacement          --> Challenger
|
+-- Qualification call
|   +-- Enterprise, long sales cycle      --> MEDDIC
|   +-- Mid-market, shorter cycle         --> Universal only
|
+-- Negotiation call
|   +-- Always                            --> Universal only
|
+-- Follow-up call
|   +-- Always                            --> Universal only
```

### Scoring Rubric Summary

| Score Range | Label | Meaning |
|-------------|-------|---------|
| 9-10 | Excellent | Best-in-class execution; use as training example |
| 7-8 | Good | Strong performance with minor refinement opportunities |
| 4-6 | Adequate | Meets minimum bar but significant room for improvement |
| 1-3 | Poor | Fundamental gap; requires immediate coaching |

### Coaching Action Map

| Dimension Below 7 | Primary Drill | Time to Improve |
|--------------------|--------------|-----------------|
| Opening and Rapport | The 90-Second Open | 1-2 weeks |
| Discovery Quality | The Five Whys | 2-3 weeks |
| Pain Identification | Quantify the Pain | 2-3 weeks |
| Value Articulation | The Mirror | 3-4 weeks |
| Objection Handling | Acknowledge-Question-Position | 3-4 weeks |
| Next Steps and Close | The Calendar Test | 1-2 weeks |

### Overall Score Interpretation

| Grade | Manager Action | Rep Action |
|-------|---------------|------------|
| A (90-100) | Share as team training example | Maintain and mentor others |
| B (80-89) | Acknowledge strengths; assign one refinement area | Self-review; pick one dimension to push to 9+ |
| C (70-79) | Weekly coaching on top 2 improvement areas | Practice assigned drills twice weekly |
| D (60-69) | Bi-weekly coaching; ride-along on next call | Daily drill practice; review one A-grade call daily |
| F (Below 60) | Immediate intervention; structured improvement plan | Pause prospecting for 1 week; intensive coaching |

---

**Version:** 1.0.0
**Last Updated:** 2026-02-11
**Skill Type:** Methodology-first (no automation scripts; human or AI can execute the frameworks manually)
