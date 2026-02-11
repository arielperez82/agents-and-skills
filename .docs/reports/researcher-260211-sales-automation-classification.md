# Research Report: B2B Sales Automation Classification for Agent Architecture

**Date:** 2026-02-11
**Researcher:** ap-researcher
**Purpose:** Classify 15 Zapier automations by functional role to inform agent/skill architecture decisions

## Executive Summary

Analysis of 15 Zapier automations against standard B2B sales org structure reveals a clear split: **9 automations are SDR/prospecting activities**, **4 are AE/deal-management activities**, **1 is sales ops/management**, **1 is marketing**, and **1 is product**. The SDR vs AE distinction is clean enough to warrant **separate agents**, not a combined sales agent. The handoff point (lead qualification) is well-defined and maps directly to automation #9.

Key finding: most automations cluster around **pre-meeting research** and **post-meeting follow-up** -- two phases that have different owners (SDR owns pre-meeting for prospecting; AE owns pre-meeting for deal advancement). This phase-based pattern, not just role-based, should inform agent design.

## Research Methodology

- Sources: Domain expertise from B2B SaaS sales operations, informed by standard frameworks from Outreach, SalesLoft, Gong, Apollo, HubSpot, Salesforce
- Key frameworks applied: BANT qualification, SiriusDecisions Demand Waterfall, Revenue Operations model, MEDDIC/MEDDPICC
- Cross-referenced against: SalesLoft cadence taxonomy, Outreach sequence categories, Gong analytics categories, Apollo workflow types

## Key Findings

### 1. SDR vs AE: Canonical Role Distinction

**SDR (Sales Development Rep) / BDR (Business Development Rep):**
- Top-of-funnel ownership
- Prospecting: identifying and researching potential buyers
- Outbound outreach: cold email, cold call, LinkedIn
- Inbound lead qualification: responding to MQLs, scoring, routing
- Meeting booking: getting the first qualified meeting on AE calendar
- **Exit criteria:** Accepted meeting with qualified prospect (SQL handoff)

**AE (Account Executive):**
- Mid-to-bottom-funnel ownership
- Discovery calls and needs analysis
- Solution presentation and demos
- Proposal creation and negotiation
- Deal management and pipeline progression
- Closing
- **Entry criteria:** Qualified meeting from SDR or self-sourced opportunity

**The handoff point** is the SQL (Sales Qualified Lead) -- when a lead meets qualification criteria (budget, authority, need, timeline) and is accepted by the AE for a discovery call. This is automation #9 (Enterprise lead qualification).

**Key distinction for automation classification:**
- If the automation helps **find, research, or qualify a lead before first real conversation** = SDR
- If the automation helps **advance a deal after qualification** = AE
- If the automation could serve either depending on context = classify by primary use case

### 2. Sales Automation Taxonomy (Industry Standard)

Modern platforms categorize automation into these buckets:

| Category | Description | Platforms |
|----------|-------------|-----------|
| **Prospecting/Research** | Lead finding, enrichment, company research | Apollo, ZoomInfo, Clearbit |
| **Outreach/Sequencing** | Email cadences, multi-channel sequences | Outreach, SalesLoft, Apollo |
| **Lead Scoring/Qualification** | Fit scoring, intent signals, MQL→SQL routing | HubSpot, Marketo, 6sense |
| **Meeting Prep** | Pre-call research, briefing docs, participant intel | Gong, Chorus (pre-call) |
| **Conversation Intelligence** | Call recording, transcription, analysis, coaching | Gong, Chorus, Clari |
| **Deal Management** | Pipeline tracking, risk flagging, forecast | Clari, Gong Forecast, SFDC |
| **Post-Meeting Follow-up** | Summary emails, CRM updates, next-step tracking | Gong, Outreach |
| **Content/Collateral** | Email templates, proposal generation, content creation | Seismic, Highspot |

### 3. Lead Lifecycle Stages and Automation Mapping

Standard B2B lead lifecycle (SiriusDecisions Demand Waterfall adapted):

```
Lead → MQL → SQL → Opportunity → Proposal → Closed-Won → Customer
 |       |      |        |            |           |
 v       v      v        v            v           v
Capture  Score  Qualify  Discover     Propose     Onboard
Enrich   Route  Accept   Demo         Negotiate   Expand
Research Nurture Book    Present      Close
```

**Stage-to-automation mapping:**

| Stage | Owner | Automations |
|-------|-------|-------------|
| Lead (raw) | Marketing/SDR | #3 (capture), #10 (background), #11 (enrichment) |
| MQL | SDR | #1 (ABM email), #4 (outreach), #9 (qualification) |
| SQL | SDR→AE handoff | #9 (qualification output) |
| Opportunity | AE | #5 (call briefer), #13 (sales prep) |
| Active Deal | AE | #6 (follow-up email), #7 (proposal tracking), #12 (call analysis) |
| Pipeline | Sales Mgmt | #14 (pipeline health) |
| Cross-functional | Product | #8 (call→PRD) |
| Cross-functional | Marketing | #15 (viral content) |

### 4. Content Creation vs Demand Gen vs Product Marketing

**Content Marketing:** Creates assets (blog posts, videos, newsletters, social content). Focus: audience building, brand awareness, thought leadership. Automation #15 is squarely here.

**Demand Generation:** Uses content + channels to create pipeline. Includes paid ads, email nurture, events, ABM campaigns. Automation #1 has demand-gen overlap but is execution-level SDR work, not strategy.

**Product Marketing:** Positioning, messaging, competitive intel, sales enablement collateral, launch strategy. Automation #8 (call→PRD) is closer to product management than product marketing.

**Boundaries:** Content creation is a tool used by all three. The differentiator is intent: brand awareness (content), pipeline creation (demand gen), or market positioning (product marketing).

## Classification of 15 Automations

### SDR Activities (Top-of-Funnel, Prospecting, Qualifying)

| # | Automation | Rationale |
|---|-----------|-----------|
| 1 | ABM email personalization | Classic SDR outbound: research target → craft personalized outreach |
| 3 | Lead capture and follow-up | Inbound lead processing: form→CRM→welcome→calendar. SDR inbound workflow |
| 4 | Sales lead emails | Outbound prospecting: research company → draft cold outreach |
| 9 | Enterprise lead qualification | Lead scoring/qualification. SDR qualifies before AE handoff |
| 10 | Lead background search | Pre-outreach research. SDR enrichment for targeting |
| 11 | Lead enrichment | CRM contact enrichment. SDR/RevOps data hygiene for prospecting |

**6 automations.** Core SDR motions: research, outreach, qualification, enrichment.

### AE Activities (Mid-Funnel, Deal Management, Closing)

| # | Automation | Rationale |
|---|-----------|-----------|
| 5 | Biz dev call briefer | Pre-call prep for qualified meetings. AE preparing for discovery/demo |
| 6 | Call follow-up email assistant | Post-call follow-up on active deals. AE maintaining deal momentum |
| 7 | Call follow-up CRM proposal tracking | Proposal stage tracking. AE deal management |
| 13 | Sales prep | Meeting participant research. AE preparing for multi-stakeholder deals |

**4 automations.** Core AE motions: meeting prep, follow-up, deal progression.

### Sales Management / Ops

| # | Automation | Rationale |
|---|-----------|-----------|
| 12 | Sales call analysis | Coaching/evaluation tool. Manager evaluates rep performance |
| 14 | Sales pipeline health monitor | Pipeline management. Sales manager/ops risk monitoring |

**2 automations.** Pipeline oversight and rep coaching.

### Marketing

| # | Automation | Rationale |
|---|-----------|-----------|
| 15 | Viral content creator | Content creation workflow. Marketing/content team |

**1 automation.**

### Product

| # | Automation | Rationale |
|---|-----------|-----------|
| 8 | Customer call summary → PRD | Voice-of-customer → product requirements. Product management |

**1 automation.**

### Generic Productivity

| # | Automation | Rationale |
|---|-----------|-----------|
| 2 | Email reply drafts | Tone-matched reply drafting. Could serve any role. Generic communication tool |

**1 automation.** Not role-specific; useful across sales, CS, marketing.

### Reclassification Notes

- **#2 (Email reply drafts):** Initially tempting to put in SDR or AE, but "auto-draft replies matching tone" is a generic communication assistant. No sales-specific logic.
- **#5 vs #13:** Both are meeting prep, but #5 specifically says "biz dev call" (more AE/partnership) while #13 says "sales prep" (could be either). Classified both as AE because meeting prep for *qualified* meetings is AE territory. SDRs don't typically need briefing docs -- they need prospect research for outreach, which is #10.
- **#12 (Sales call analysis):** Could be AE self-coaching, but "evaluate against framework + score" is a management/coaching activity. Gong positions this as a manager feature.
- **#11 vs #10:** Both are research/enrichment. #11 is CRM enrichment (data ops), #10 is background search (prospecting research). Both SDR-adjacent.

## Agent Architecture Recommendation

### Verdict: SEPARATE SDR and AE Agents

**Reasoning:**

1. **Different funnel ownership.** SDR works pre-qualification, AE works post-qualification. The data inputs, success metrics, and output artifacts are fundamentally different.

2. **Different automation patterns:**
   - SDR automations are **batch/volume operations**: enrich many leads, send many personalized emails, score many leads. Pattern: `list → research → template → send`.
   - AE automations are **single-deal operations**: prep for one meeting, follow up on one call, track one proposal. Pattern: `event → enrich → generate → update`.

3. **Different tool integrations:**
   - SDR: Apollo, ZoomInfo, Clearbit, email sequencers, lead scoring
   - AE: Calendar, CRM opportunities, proposal tools, call recording platforms

4. **Different skill sets:**
   - SDR: prospecting research, lead qualification criteria, outbound messaging, personalization at scale
   - AE: discovery questioning, deal strategy, stakeholder mapping, proposal writing, negotiation

5. **Industry precedent.** Every major sales platform (Outreach, SalesLoft, Gong) has separate feature sets and even separate products for SDR vs AE workflows. Apollo explicitly separates "Prospecting" from "Deal Management."

6. **Clean handoff point.** Automation #9 (lead qualification) is the natural boundary. SDR agent qualifies → passes SQL to AE agent.

### Proposed Agent Structure

| Agent | Scope | Automations |
|-------|-------|-------------|
| `ap-sdr` (or `ap-sales-prospector`) | Prospecting, outreach, qualification, enrichment | #1, #3, #4, #9, #10, #11 |
| `ap-account-executive` (or `ap-deal-manager`) | Meeting prep, follow-up, deal progression, proposals | #5, #6, #7, #13 |
| `ap-sales-ops` (or fold into existing ops agent) | Pipeline health, call coaching, analytics | #12, #14 |
| `ap-content-creator` (or fold into marketing agent) | Content workflows | #15 |
| `ap-product-analyst` (existing?) | Customer insights → product artifacts | #8 |
| Generic skill (not agent) | Email reply drafting | #2 |

### Shared Skills (used by both SDR and AE agents)

- `company-research` -- web research on companies/contacts (used by #1, #4, #5, #10, #11, #13)
- `email-drafting` -- composing professional emails with personalization (used by #1, #2, #4, #6)
- `crm-operations` -- CRM read/write patterns (used by #3, #7, #11, #14)
- `call-intelligence` -- processing call transcripts/recordings (used by #6, #7, #8, #12)

### Why NOT a Combined Sales Agent

A combined agent would need to handle both volume-based prospecting AND single-deal management, requiring:
- Conflicting prompt optimization (batch vs individual)
- Bloated skill set covering entire funnel
- Ambiguous context about which stage a task belongs to
- Harder to test and validate outputs

The SDR/AE split follows the same principle as having separate `ap-architect` and `ap-implementation-planner` agents -- different phases of the same pipeline need different expertise and patterns.

### Counterargument Acknowledged

In small startups, one person does both SDR and AE work ("full-cycle AE"). If the target user base includes solo founders, a combined agent with SDR/AE modes could work. But for agent architecture, separation is cleaner -- a coordinator can always invoke both.

## Risk Assessment

| Risk | Mitigation |
|------|-----------|
| SDR/AE boundary is fuzzy for some automations (#5 could be SDR for initial meetings) | Use qualification status as the branching criterion, not the automation name |
| Company research skill gets duplicated across agents | Extract as shared skill, not embedded in either agent |
| #2 (email replies) has no clear home | Make it a skill, not an agent. Any agent can use it |
| Sales ops (2 automations) may not justify a full agent | Could be a skill set attached to a broader ops/analytics agent |
| #8 (call→PRD) crosses sales/product boundary | Route to product agent; sales agent provides the transcript, product agent generates the PRD |

## Unresolved Questions

1. **Does the repo already have an `ap-product-analyst` or similar agent** that could own automation #8? If so, #8 is just a new skill for that agent.
2. **How do these automations relate to existing agents in the catalog?** Some of the 56 existing agents may already cover adjacent ground (e.g., research, content creation).
3. **Should "company research" be one skill or two?** SDR research (surface-level for outreach) differs from AE research (deep for deal strategy). Could be one skill with depth parameter, or two distinct skills.
4. **What's the intended user persona?** If targeting B2B SaaS sales teams specifically, the SDR/AE split is canonical. If targeting broader "small business automation," a combined agent may be more intuitive.
5. **Are these 15 automations the complete scope, or are more coming?** If more sales automations are planned, the separate-agent architecture scales better.
