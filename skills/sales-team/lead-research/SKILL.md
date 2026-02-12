---

# === CORE IDENTITY ===
name: lead-research
title: Lead Research & Enrichment
description: Company research, lead enrichment, and web intelligence synthesis for B2B sales. Enables SDRs and AEs to research prospects, enrich contact records, and build comprehensive company profiles from web sources.
domain: sales
subdomain: sales-development

# === WEBSITE DISPLAY ===
difficulty: intermediate
time-saved: "Reduces per-lead research from 30 minutes to 5 minutes"
frequency: "Per-lead, multiple times daily"
use-cases:
  - Researching a prospect's company before outreach
  - Enriching CRM contact records with web-sourced data
  - Building company profiles (ARR, size, industry, key products, tech stack)
  - Classifying a lead's role, department, and decision-making authority
  - Preparing research briefs for account executives before meetings

# === RELATIONSHIPS ===
related-agents:
  - sales-development-rep
  - account-executive
related-skills:
  - sales-team/lead-qualification
  - sales-team/sales-outreach
  - sales-team/meeting-intelligence
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
  - title: Company Profile from Email Domain
    input: "Research the company behind contact@acmecorp.com"
    output: "AcmeCorp: Series B SaaS ($15M ARR), 120 employees, enterprise project management, based in Austin TX. Key pain points: scaling infrastructure, SOC 2 compliance."
  - title: Lead Role Classification
    input: "Classify role for Jane Smith, VP Engineering at AcmeCorp"
    output: "Decision-maker. Technical buyer. Reports to CTO. Budget authority for tooling and infrastructure. Pain points: team scaling, developer productivity."

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
tags: [sales, lead-research, enrichment, company-research, ABM, prospecting, SDR, web-research]
featured: false
verified: true
---

# Lead Research & Enrichment

## Overview

Lead Research & Enrichment is a systematic methodology for transforming minimal seed data (an email address, a company name, a domain) into actionable intelligence that drives personalized outreach and informed sales conversations.

**Core Value:** Eliminates guesswork from prospecting. Instead of sending generic messages, SDRs and AEs operate from a foundation of verified company data, role classification, and synthesized pain points. Research quality directly correlates with response rates and deal velocity.

**Target Audience:**
- **Sales Development Representatives (SDRs):** Use for pre-outreach research, email personalization, and lead enrichment before handoff.
- **Account Executives (AEs):** Use for meeting preparation, stakeholder mapping, and opportunity research during active deal cycles.

**When to Use:**
- A new lead enters the pipeline and needs enrichment before first touch
- Preparing personalized ABM outreach for a target account
- An AE has a meeting scheduled and needs a research brief
- Qualifying whether a lead matches your Ideal Customer Profile (ICP)
- Re-engaging a dormant lead with updated company intelligence

---

## Company Research Framework

### Seed Data Requirements

Research starts from one or more of these inputs:
- **Email address** (extract domain to identify company)
- **Company name** (search directly)
- **Company domain/URL** (most reliable starting point)
- **Individual's name + company** (for role-specific research)

### Information to Gather

Collect the following data points, organized by priority. Not every field will be available for every company. Prioritize what is findable and move on.

#### Tier 1: Must-Have (Block outreach without these)

| Field | Description | Where to Find |
|-------|-------------|---------------|
| Company name | Legal/operating name | Company website, business registries |
| Industry | Primary industry vertical | Company website "About" page, press coverage |
| Company size | Employee count range | Company website, job boards, press releases |
| What they do | Core product/service in one sentence | Homepage, "About" page |
| Headquarters | City, state/country | Company website footer, "Contact" page |

#### Tier 2: High-Value (Enables personalization)

| Field | Description | Where to Find |
|-------|-------------|---------------|
| Revenue/funding | ARR, total funding, last round | Press releases, news articles, funding databases |
| Key products | Primary product lines or services | Product pages, pricing pages |
| Tech stack | Technologies they use or build on | Job postings (requirements section), engineering blog |
| Recent news | Last 90 days of notable events | News search, company blog, press releases |
| Growth signals | Hiring velocity, office expansion, new markets | Job board listings, press releases |

#### Tier 3: Nice-to-Have (Deepens understanding)

| Field | Description | Where to Find |
|-------|-------------|---------------|
| Key executives | CEO, CTO, VP Sales, etc. | Company "Team" page, press quotes |
| Competitors | Who they compete with | Industry reports, comparison sites |
| Customer base | Who they sell to (B2B/B2C, segments) | Case studies, testimonials, press releases |
| Pain signals | Public complaints, challenges mentioned | Forum posts, review sites, conference talks |
| Regulatory context | Compliance requirements (SOC 2, HIPAA, GDPR) | Industry norms, job postings mentioning compliance |

### Research Methodology

Follow this structured search strategy. Each step builds on the previous one. Stop when you have enough to act.

**Step 1: Domain Extraction**
If starting from an email address, extract the domain portion (everything after `@`). Skip generic email providers (the domain must belong to the company). If the domain is a generic provider, search for the person's name directly.

**Step 2: Company Website Review**
Visit the company domain and extract:
- Homepage: value proposition, target audience, product positioning
- About page: founding story, mission, team size, location
- Product/pricing pages: what they sell, pricing model (freemium, enterprise, usage-based)
- Careers page: open roles (indicates growth areas and tech stack)
- Blog/newsroom: recent announcements, thought leadership topics

**Step 3: Web Search for Context**
Search for the company name combined with these terms:
- `"[company] funding"` or `"[company] raises"` -- funding history
- `"[company] revenue"` or `"[company] ARR"` -- revenue data
- `"[company] employees"` -- headcount
- `"[company] CEO"` or `"[company] leadership"` -- key executives
- `"[company] news"` -- recent events (filter to last 90 days)
- `"[company] reviews"` -- customer sentiment

**Step 4: Job Posting Analysis**
Search for the company's open job postings. Job listings reveal:
- **Tech stack:** Required technologies in engineering roles
- **Growth areas:** Departments hiring aggressively
- **Maturity signals:** Seeking senior hires (scaling) vs. junior hires (established)
- **Pain points:** "We're looking for someone to help us solve X" language

**Step 5: Synthesis**
Combine findings into the Company Profile Template (see below).

### Company Profile Template

```markdown
## Company Profile: [Company Name]

**Overview**
- Industry: [Primary industry]
- Founded: [Year]
- Headquarters: [City, State/Country]
- Employees: [Range or exact]
- Revenue/Funding: [ARR, last funding round, total raised]
- Website: [URL]

**What They Do**
[One-paragraph summary of core product/service, target market, and value proposition]

**Key Products/Services**
- [Product 1]: [Brief description]
- [Product 2]: [Brief description]

**Tech Stack** (if relevant to your offering)
- [Languages, frameworks, infrastructure]
- Source: [Job postings / engineering blog / other]

**Key Executives**
- CEO: [Name]
- CTO: [Name]
- [Relevant VP]: [Name]

**Recent News** (last 90 days)
- [Date]: [Event summary]
- [Date]: [Event summary]

**Growth Signals**
- [Signal 1, e.g., "Hiring 15 engineers, up from 5 open roles last quarter"]
- [Signal 2, e.g., "Opened new office in London"]

**Potential Pain Points**
- [Pain point 1 with evidence]
- [Pain point 2 with evidence]

**ICP Fit Assessment**
- Match: [Strong / Moderate / Weak]
- Rationale: [Why this company does or does not fit your ICP]
```

---

## Lead Enrichment Workflow

Use this workflow to transform a raw contact record (often just a name and email) into a fully enriched record suitable for CRM storage and personalized outreach.

### Step 1: Extract Company from Email Domain

Parse the email address to extract the company domain.

**Rules:**
- Strip everything before and including `@`
- If the domain is a known generic email provider, flag the record as "personal email -- company unknown" and attempt to find the company through a web search of the person's name and title
- If the domain is a company domain, proceed to company research

### Step 2: Research Company Profile

Follow the Company Research Framework above. At minimum, collect Tier 1 fields.

### Step 3: Research Individual

With the company context established, research the specific contact.

**Individual data points to collect:**

| Field | Description | Source |
|-------|-------------|--------|
| Full name | First and last name | Email signature, company team page |
| Title | Current job title | Company team page, professional profiles, press quotes |
| Department | Functional area | Inferred from title |
| Seniority level | IC / Manager / Director / VP / C-level | Inferred from title |
| Decision authority | Budget holder, influencer, or end-user | Inferred from title + department |
| Location | City/region | Company team page, professional profiles |
| Tenure | Time at current company | Professional profiles, press mentions |
| Professional background | Previous roles, education | Professional profiles |
| Public content | Blog posts, conference talks, quotes in press | Web search for name + company |

### Step 4: Map to ICP Criteria

Compare the enriched record against your Ideal Customer Profile. Score each dimension:

| ICP Dimension | Lead Value | Match? |
|---------------|-----------|--------|
| Company size | [Actual employee count] | Yes/No |
| Industry | [Actual industry] | Yes/No |
| Revenue range | [Actual revenue/funding] | Yes/No |
| Geography | [Actual location] | Yes/No |
| Role/Title | [Actual title] | Yes/No |
| Department | [Actual department] | Yes/No |
| Tech stack fit | [Relevant technologies] | Yes/No |

**ICP Score:** Count of matching dimensions / total dimensions. Prioritize leads with 5+ matches out of 7.

### Step 5: Output Enriched Contact Record

```markdown
## Enriched Contact Record

**Contact Information**
- Name: [Full Name]
- Email: [Email]
- Title: [Job Title]
- Department: [Department]
- Seniority: [Level]
- Location: [City, State/Country]
- Decision Authority: [Decision-maker / Influencer / End-user]

**Company Information**
- Company: [Company Name]
- Industry: [Industry]
- Employees: [Count/Range]
- Revenue/Funding: [Data]
- Website: [URL]
- Headquarters: [Location]

**ICP Fit**
- Score: [X/7 dimensions matching]
- Assessment: [Strong fit / Moderate fit / Weak fit]
- Key gaps: [Any ICP dimensions that do not match]

**Personalization Hooks**
- [Hook 1: Something specific to reference in outreach, e.g., recent company news]
- [Hook 2: Role-specific pain point]
- [Hook 3: Shared context, e.g., industry trend, mutual connection]

**Recommended Action**
- [Prioritize for immediate outreach / Queue for nurture / Disqualify with reason]

**Research Date:** [Date]
**Confidence Level:** [High / Medium / Low -- based on data availability]
```

### Enrichment for CRM Import

When enriching records for bulk CRM import, output structured data in this format:

| Field | Value |
|-------|-------|
| first_name | [Value] |
| last_name | [Value] |
| email | [Value] |
| title | [Value] |
| department | [Value] |
| seniority | [IC / Manager / Director / VP / C-level] |
| decision_authority | [decision-maker / influencer / end-user] |
| company_name | [Value] |
| company_domain | [Value] |
| industry | [Value] |
| employee_count | [Value or range] |
| revenue | [Value or range] |
| headquarters_city | [Value] |
| headquarters_country | [Value] |
| icp_score | [X/7] |
| icp_fit | [strong / moderate / weak] |
| enrichment_date | [ISO date] |
| confidence | [high / medium / low] |

---

## Role Classification Framework

Classifying a lead's role determines messaging strategy, urgency, and routing. A VP of Engineering receives a different message than a Senior Developer, even at the same company.

### Classification Dimensions

#### Dimension 1: Decision Authority

| Classification | Definition | Indicators |
|---------------|------------|------------|
| **Decision-maker** | Can approve budget and sign contracts | C-level, VP, Director with "Head of" in title; mentioned in procurement context |
| **Influencer** | Evaluates options, recommends to decision-maker | Senior Manager, Team Lead, Principal/Staff IC; runs evaluations, writes RFPs |
| **End-user** | Will use the product daily but does not control budget | IC-level engineers, analysts, designers; focuses on features and usability |
| **Champion** | Internal advocate who drives adoption bottom-up | Any level; has used competitor/similar tool, vocal about pain points |
| **Blocker** | May oppose the purchase | Procurement, legal, IT security; focuses on compliance, risk, cost |

#### Dimension 2: Department Mapping

Map the lead's title to a functional department. This determines which pain points and value propositions to lead with.

| Department | Common Titles | Primary Pain Points |
|------------|---------------|-------------------|
| Engineering | CTO, VP Engineering, Engineering Manager, Software Engineer | Developer productivity, technical debt, scaling, tooling |
| Product | CPO, VP Product, Product Manager, Product Owner | Roadmap prioritization, user insights, feature delivery speed |
| Marketing | CMO, VP Marketing, Marketing Manager, Growth Lead | Lead generation, attribution, content performance, CAC |
| Sales | CRO, VP Sales, Sales Manager, Account Executive | Pipeline velocity, conversion rates, forecasting accuracy |
| Finance | CFO, VP Finance, Controller, FP&A | Cost optimization, spend visibility, ROI measurement |
| Operations | COO, VP Operations, Operations Manager | Process efficiency, automation, vendor management |
| IT / Security | CIO, CISO, IT Director, Security Engineer | Compliance, risk reduction, infrastructure reliability |
| HR / People | CHRO, VP People, HR Director | Hiring velocity, retention, employee experience |

#### Dimension 3: Budget Authority Assessment

Estimate whether this person controls relevant budget:

| Signal | High Budget Authority | Low Budget Authority |
|--------|----------------------|---------------------|
| Title level | VP, C-level, "Head of" | Manager, Senior IC, IC |
| Team size (if known) | Manages 10+ people | Manages 0-3 people or IC |
| Procurement mentions | Quoted in vendor selection press | Not mentioned |
| Company size context | At <50 employees, Directors often hold budget | At 1000+ employees, even Directors may need VP approval |

### Pain Point Synthesis by Role Type

After classifying the lead, synthesize likely pain points based on role + company context.

**Technical Leadership (CTO, VP Engineering, Engineering Manager):**
- Scaling engineering team and maintaining velocity
- Technical debt accumulation slowing feature delivery
- Developer experience and tooling gaps
- Security and compliance requirements (SOC 2, HIPAA)
- Build vs. buy decisions for infrastructure

**Product Leadership (CPO, VP Product, Product Manager):**
- Prioritization across competing stakeholder demands
- Lack of data-driven decision-making tools
- Slow feedback loops from development to market
- Cross-functional alignment on roadmap

**Revenue Leadership (CRO, VP Sales, VP Marketing):**
- Pipeline generation and conversion optimization
- Attribution and ROI measurement across channels
- Sales and marketing alignment
- Forecasting accuracy and deal velocity

**Operational Leadership (COO, CFO, VP Operations):**
- Cost optimization and spend visibility
- Process automation and efficiency
- Vendor consolidation
- Compliance and audit readiness

### Classification Output Format

```markdown
## Role Classification: [Name], [Title] at [Company]

**Decision Authority:** [Decision-maker / Influencer / End-user / Champion / Blocker]
**Department:** [Department name]
**Budget Authority:** [High / Medium / Low]
**Seniority:** [C-level / VP / Director / Manager / Senior IC / IC]

**Rationale:**
[2-3 sentences explaining the classification based on title, company size, and department context]

**Likely Pain Points:**
1. [Pain point with evidence from company research]
2. [Pain point inferred from role type]
3. [Pain point from industry/company-stage context]

**Messaging Strategy:**
- Lead with: [Value proposition aligned to their pain points]
- Avoid: [Topics unlikely to resonate with this role]
- Proof points: [Case studies, metrics, or references relevant to their context]

**Recommended Outreach Channel:**
- [Email / Phone / Professional network / Event-based / Referral introduction]
- Rationale: [Why this channel for this role type]
```

---

## Research Brief Template

Use this template to produce a meeting-ready research document. SDRs produce a lighter version before handoff; AEs produce the full version before discovery calls and demos.

### SDR Pre-Outreach Brief (Lightweight)

```markdown
# Research Brief: [Company Name]
**Prepared for:** [SDR name]
**Date:** [Date]
**Purpose:** Pre-outreach research

## Company Snapshot
- **What they do:** [One sentence]
- **Industry:** [Industry]
- **Size:** [Employees] | **Revenue/Funding:** [Data]
- **HQ:** [Location]

## Why They Might Buy
- [Pain point 1 aligned to your product]
- [Pain point 2 with supporting evidence]

## Personalization Hooks
- [Recent news, event, or achievement to reference]
- [Role-specific angle based on contact's title]

## Contact
- **Name:** [Full name]
- **Title:** [Title]
- **Classification:** [Decision-maker / Influencer / End-user]
- **Email:** [Email]

## Recommended Approach
- **Opening angle:** [Specific hook for first message]
- **Value prop:** [Which product capability to lead with]
- **CTA:** [Suggested call to action]
```

### AE Meeting Prep Brief (Comprehensive)

```markdown
# Research Brief: [Company Name]
**Prepared for:** [AE name]
**Meeting date:** [Date]
**Meeting type:** [Discovery / Demo / Negotiation / QBR]
**Attendees:** [Names and titles of meeting participants]

## Company Overview
- **What they do:** [2-3 sentence summary]
- **Industry:** [Industry] | **Sub-vertical:** [If applicable]
- **Founded:** [Year] | **Stage:** [Startup / Growth / Enterprise]
- **Size:** [Employees] | **Revenue/Funding:** [Data]
- **HQ:** [Location] | **Other offices:** [If known]
- **Website:** [URL]

## Key Products/Services
- [Product 1]: [Description and target market]
- [Product 2]: [Description and target market]

## Business Context
- **Growth trajectory:** [Hiring trends, funding, expansion signals]
- **Recent news:** [Last 90 days, bulleted]
- **Competitive landscape:** [Key competitors, positioning]
- **Tech stack:** [Relevant technologies, sourced from job postings]

## Key Contacts
| Name | Title | Role in Deal | Notes |
|------|-------|-------------|-------|
| [Name] | [Title] | [Decision-maker / Influencer / End-user] | [Relevant context] |
| [Name] | [Title] | [Role] | [Relevant context] |

## Pain Points & Opportunities

### Confirmed Pain Points (from research evidence)
1. **[Pain point]:** [Evidence -- where this was observed or inferred]
2. **[Pain point]:** [Evidence]

### Hypothesized Pain Points (to validate in meeting)
1. **[Pain point]:** [Reasoning -- why you believe this based on company profile]
2. **[Pain point]:** [Reasoning]

### Opportunity Mapping
| Pain Point | Your Capability | Value Delivered | Proof Point |
|-----------|----------------|-----------------|-------------|
| [Pain] | [Feature/capability] | [Quantified value] | [Case study / metric] |
| [Pain] | [Feature/capability] | [Quantified value] | [Case study / metric] |

## Recommended Approach

### Meeting Objectives
1. [Primary objective -- what you need to learn or achieve]
2. [Secondary objective]
3. [Tertiary objective]

### Discovery Questions
1. [Question targeting confirmed pain point]
2. [Question targeting hypothesized pain point]
3. [Question about decision process and timeline]
4. [Question about current solution and gaps]

### Competitive Positioning
- **If they mention [Competitor A]:** [Differentiation talking point]
- **If they mention [Competitor B]:** [Differentiation talking point]

### Risks / Watch-Outs
- [Potential objection and prepared response]
- [Red flag to monitor during conversation]

### Next Steps to Propose
- [Recommended next step if meeting goes well]
- [Fallback next step if more discovery needed]
```

---

## Input/Output Contract

### Inputs

- **Lead email address** OR **company name/domain** OR **professional profile URL**
- (Optional) Known context: deal stage, product interest, previous interactions
- (Optional) ICP definition: criteria for company size, industry, revenue, role, geography, tech stack

### Outputs

- **Company profile** (structured markdown following the Company Profile Template)
- **Lead enrichment record** (structured data suitable for CRM import, following the Enriched Contact Record format)
- **Role classification** (decision-maker / influencer / end-user + rationale, following the Role Classification output format)
- **Research brief** (meeting-ready document following either the SDR or AE template)

### External Actions (recommended, not executed)

These actions are recommended based on research output. The agent does not execute them -- they are handed off to the user or downstream automation.

- Update CRM contact record with enriched data fields
- Attach research brief to the CRM opportunity record
- Notify account owner of research completion via messaging platform
- Flag high-ICP-fit leads for priority routing
- Tag disqualified leads with reason for future filtering
- Log research confidence level for data quality tracking

---

## Quick Reference

### Research Checklist (per lead)

1. Extract company from email domain
2. Review company website (homepage, about, careers, product pages)
3. Web search for funding, revenue, news, leadership
4. Analyze job postings for tech stack, growth signals, pain points
5. Research the individual (title, department, public content)
6. Classify role (decision authority, department, budget authority)
7. Score ICP fit (7 dimensions)
8. Synthesize pain points (confirmed + hypothesized)
9. Write research brief (SDR lightweight or AE comprehensive)
10. Output enriched record for CRM

### Decision Authority Quick Reference

| Title Pattern | Likely Authority |
|--------------|-----------------|
| C-level (CEO, CTO, CFO, CRO, CPO) | Decision-maker |
| VP of [Department] | Decision-maker |
| Head of [Department] | Decision-maker (small co) / Influencer (large co) |
| Director of [Department] | Decision-maker (small co) / Influencer (large co) |
| Senior Manager / Manager | Influencer |
| Team Lead / Principal / Staff | Influencer |
| Senior [Role] / [Role] | End-user or Champion |

### ICP Fit Scoring

| Score | Assessment | Action |
|-------|-----------|--------|
| 6-7 / 7 | Strong fit | Prioritize for immediate outreach |
| 4-5 / 7 | Moderate fit | Outreach with adjusted messaging; validate gaps in discovery |
| 2-3 / 7 | Weak fit | Queue for nurture; do not prioritize |
| 0-1 / 7 | No fit | Disqualify with documented reason |

### Pain Point Inference Rules

| Company Signal | Inferred Pain Point |
|---------------|-------------------|
| Hiring many engineers | Scaling challenges, developer productivity needs |
| Recent funding round | Growth pressure, need to deploy capital efficiently |
| Job postings mention compliance (SOC 2, HIPAA) | Security and compliance overhead |
| Multiple open roles in same department | Team bottleneck, possible tool/process gap |
| Press mentions of outage or incident | Reliability and infrastructure concerns |
| Competitor switch (mentioned in reviews or forums) | Dissatisfaction with current vendor |
| International expansion (new office, new market) | Localization, scaling operations across regions |

### Research Confidence Levels

| Level | Definition | When to Apply |
|-------|-----------|---------------|
| **High** | All Tier 1 fields verified from primary sources; Tier 2 substantially complete | Company has public website, press coverage, and findable team page |
| **Medium** | Tier 1 fields complete but some from secondary sources; Tier 2 partially complete | Company has limited web presence; some data inferred |
| **Low** | Tier 1 fields incomplete or unverified; significant gaps | Very early-stage company, stealth mode, or limited public information |
