---

# === CORE IDENTITY ===
name: sales-outreach
title: Sales Outreach & Personalization
description: ABM email personalization, cold outreach drafting, and professional tone frameworks for B2B sales. Enables SDRs to craft research-backed, personalized outreach that connects prospect pain points to product value.
domain: sales
subdomain: sales-development

# === WEBSITE DISPLAY ===
difficulty: intermediate
time-saved: "Reduces outreach drafting from 20 minutes to 3 minutes per email"
frequency: "Per-lead, multiple times daily"
use-cases:
  - Drafting personalized ABM emails from lead research
  - Creating cold outreach based on prospect's website and public information
  - Adapting outreach tone for different buyer personas (technical, executive, operational)
  - Writing multi-touch outreach sequences (initial, follow-up, breakup)
  - Personalizing at scale while maintaining authenticity

# === RELATIONSHIPS ===
related-agents:
  - sales-development-rep
  - account-executive
related-skills:
  - sales-team/lead-research
  - sales-team/lead-qualification
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
  - title: ABM Personalized Email
    input: "Draft outreach to VP Engineering at a 200-person fintech scaling their platform team, pain point: developer onboarding taking 3 weeks"
    output: "Subject: Cutting dev onboarding from 3 weeks to 3 days. Body: Hi [Name], I noticed [Company] is scaling engineering rapidly... [personalized value prop connecting onboarding pain to solution]"
  - title: Website-Based Cold Outreach
    input: "Draft outreach based on acmecorp.com — they sell project management software and just raised Series B"
    output: "Subject: Congrats on the Series B — scaling infrastructure question. Body: Hi [Name], saw the Series B news... [connects growth stage to scaling challenges to product value]"

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
tags: [sales, outreach, ABM, email, personalization, cold-email, SDR, prospecting]
featured: false
verified: true
---

# Sales Outreach & Personalization

## Overview

This skill transforms lead research into personalized, high-conversion sales outreach. It replaces the "spray and pray" approach to cold email with a systematic research-to-outreach pipeline that connects real prospect pain points to specific product value.

**Core belief:** Research-backed personalization consistently outperforms generic templates. A single well-researched email that references a prospect's actual situation will generate more pipeline than fifty templated messages with `{first_name}` merge fields. Prospects can tell the difference instantly.

**Target audience:** Sales Development Representatives (SDRs) responsible for top-of-funnel outreach, Account Executives writing targeted ABM sequences, and anyone who needs to turn prospect intelligence into compelling first-touch communication.

**What this skill does NOT cover:** Lead research itself (see `lead-research` skill), lead scoring/qualification (see `lead-qualification` skill), or post-meeting follow-up (see `meeting-intelligence` skill). This skill starts where research ends and produces a ready-to-send email draft.

**Upstream dependency:** This skill consumes the output of the `lead-research` skill. The quality of outreach is directly proportional to the quality of research. Garbage research produces garbage personalization.

---

## Personalization Framework

The research-to-outreach pipeline is a four-step process. Each step builds on the previous one. Skipping steps produces the kind of outreach that gets deleted without reading.

### Step 1: Gather Research

Start with the output of the `lead-research` skill. At minimum, you need:

- **Company context:** Industry, size, stage (startup/growth/enterprise), recent news, public challenges
- **Prospect context:** Role, seniority, responsibilities, tenure at company, public content they have created (blog posts, conference talks, LinkedIn activity)
- **Website intelligence:** Product positioning, messaging, tech stack signals, job postings (indicate growth areas and pain points), recent blog posts or press releases
- **Competitive context:** Who they compete with, how they position against alternatives

**If research is thin:** You can still write effective outreach, but you must be honest about your personalization depth. A genuine observation about their website is better than a fabricated connection. See Anti-Patterns for what NOT to do with limited research.

### Step 2: Identify the Personalization Hook

The personalization hook is the specific, verifiable observation that proves you did your homework. It is the single most important element of any outreach email. Without it, you are sending spam with a name on it.

**Hook types, ranked by effectiveness:**

| Hook Type | Example | Strength | When to Use |
|-----------|---------|----------|-------------|
| **Pain point** | "I noticed you're hiring 5 DevOps engineers, which usually means deployment is a bottleneck" | Strongest | When research reveals a specific operational challenge |
| **Recent event** | "Congrats on the Series B. Scaling from 50 to 200 engineers brings infrastructure decisions that..." | Strong | Funding rounds, product launches, leadership changes, acquisitions |
| **Public content** | "Your talk at [Conference] about migrating to microservices resonated -- especially the part about..." | Strong | When prospect has published content relevant to your solution |
| **Job posting signal** | "Your open req for a Senior Data Engineer with Spark experience suggests you're building a real-time pipeline" | Moderate | Job postings reveal strategic priorities and capability gaps |
| **Industry trend** | "Most Series B fintechs we work with hit a compliance wall around 150 employees" | Moderate | When you lack company-specific intel but understand their segment |
| **Mutual connection** | "Sarah Chen on your platform team suggested I reach out" | Strong (if genuine) | Only when you have a real, warm connection -- never fabricate |
| **Website observation** | "I noticed your pricing page mentions SOC 2 compliance, which tells me security is a selling point for your customers" | Moderate | When website reveals something non-obvious about their priorities |

**Hook selection rules:**

1. Use the most specific hook available. Company-specific beats industry-generic every time.
2. The hook must be verifiable. If the prospect checks, they should confirm that you got it right.
3. The hook must connect to something you can help with. A compliment with no bridge to value is flattery, not sales.
4. One hook per email. Multiple hooks dilute the message and feel like you are trying too hard.

### Step 3: Connect Hook to Value Proposition

The bridge is the logical connection between "I see your situation" and "here is how we help." This is where most outreach fails -- the personalization and the pitch feel disconnected, as if two different people wrote them.

**The bridge formula:**

```
[Personalization hook] + [Implication of that situation] + [How we address that implication]
```

**Example:**

- Hook: "I noticed you just opened a second engineering office in Berlin."
- Implication: "Distributed teams usually hit collaboration friction around sprint planning and code review within the first 6 months."
- Bridge: "We built [Product] specifically for distributed engineering teams to reduce that friction. Teams like [Similar Company] cut their PR cycle time by 40% in the first quarter."

**Bridge quality checklist:**

- [ ] The implication is plausible and non-obvious (not "hiring is hard" or "growth is challenging")
- [ ] The connection to your product feels natural, not forced
- [ ] You include a specific, quantified result from a similar customer (if available)
- [ ] The bridge is 1-2 sentences, not a paragraph

### Step 4: Draft with Appropriate Tone and Structure

Select the email structure template (see next section) based on outreach type, then apply the tone guide (see Tone Adaptation Guide) based on buyer persona. Write the draft, then apply the quality checklist:

**Draft quality checklist:**

- [ ] Subject line is under 60 characters and creates curiosity without clickbait
- [ ] Opening line references the personalization hook (not "I hope this email finds you well")
- [ ] Body is under 150 words (under 100 for executives)
- [ ] Exactly one call-to-action, and it is low-friction
- [ ] No jargon the prospect would not use themselves
- [ ] No superlatives ("best", "leading", "revolutionary", "cutting-edge")
- [ ] Read it aloud -- does it sound like a human wrote it to another human?

---

## Email Structure Templates

### Initial Cold Outreach

Use for first-touch emails when you have moderate research (website, LinkedIn, news). Goal: earn a reply, not close a deal.

```
SUBJECT LINE: [Specific observation] + [implied question or value]
  - Max 60 characters
  - No ALL CAPS, no exclamation marks, no emojis
  - Good: "Developer onboarding at [Company] -- quick question"
  - Bad: "INCREASE YOUR REVENUE BY 300%!!!"

OPENING HOOK (1-2 sentences):
  - Lead with the personalization hook
  - Prove you know something about their world
  - Example: "I came across [Company]'s open reqs for 3 platform
    engineers and your recent blog post about migrating off the
    monolith. Sounds like a big year for your infrastructure team."

VALUE BRIDGE (2-3 sentences):
  - Connect their situation to your solution
  - Include one specific, quantified result from a similar company
  - Example: "Teams in that transition usually struggle with
    deployment velocity dropping 40-60% during the migration.
    We helped [Similar Company] maintain their release cadence
    through a similar migration by [specific mechanism]."

CALL-TO-ACTION (1 sentence):
  - Low friction. Ask for a conversation, not a commitment.
  - Specific time frame, but flexible.
  - Good: "Worth a 15-minute call next week to see if that
    applies to your situation?"
  - Bad: "Let me know when you're free for a 60-minute demo
    so I can walk you through our entire platform."

SIGNATURE:
  - Name, title, company
  - No inspirational quotes, no legal disclaimers, no banner images
```

**Total length target:** 80-120 words in the body. Shorter is almost always better.

### ABM Personalized Email

Use for high-value target accounts where you have deep research (multiple data points, account-level strategy). Goal: demonstrate that you understand their business deeply enough to be worth talking to.

```
SUBJECT LINE: [Specific, account-relevant insight]
  - Reference something only someone who did research would know
  - Good: "Re: [Company]'s Q3 platform reliability goals"
  - Good: "[Mutual connection] suggested we connect about [topic]"

OPENING (2-3 sentences):
  - Lead with the strongest personalization hook
  - Add a second, supporting observation to establish depth
  - Example: "Your keynote at [Event] about real-time fraud
    detection caught my attention, especially the challenge you
    described around false positive rates at scale. I also noticed
    [Company] recently posted for an ML Ops engineer, which
    suggests you're operationalizing those models."

PAIN POINT ARTICULATION (2-3 sentences):
  - Name the specific challenge based on your research
  - Show you understand the business impact, not just the technical problem
  - Example: "In our experience, fraud teams at your scale
    typically lose 15-20% of legitimate transactions to false
    positives. That's real revenue, and it compounds as you
    grow into new markets."

VALUE PROPOSITION (2-3 sentences):
  - Connect to the pain point with specificity
  - Reference a relevant case study or metric
  - Show awareness of their competitive landscape
  - Example: "We've helped 3 fintechs at your stage reduce
    false positives by 60% without increasing fraud exposure.
    [Specific company] saw $2M in recovered revenue in Q1
    alone."

CALL-TO-ACTION (1-2 sentences):
  - Slightly warmer than cold outreach -- you have earned more trust
  - Can propose a specific agenda for the conversation
  - Example: "I'd love to share how [Similar Company] approached
    this. Would 20 minutes work next Tuesday or Wednesday?"

SIGNATURE:
  - Name, title, company
```

**Total length target:** 120-180 words. ABM emails earn the right to be slightly longer because the personalization demonstrates value.

### Follow-Up Email

Use 3-5 business days after initial outreach with no reply. Goal: add new value, not just "bumping this to the top of your inbox."

```
SUBJECT LINE: Re: [Original subject line]
  - Keep the thread. Do not start a new subject.

OPENING (1 sentence):
  - Brief, not apologetic
  - Good: "Quick follow-up with something I thought you'd find useful."
  - Bad: "Just circling back on my last email..."
  - Bad: "I know you're busy, but..."

NEW VALUE (2-3 sentences):
  - Share something genuinely useful: relevant article, industry
    benchmark, case study, or new observation about their business
  - This is NOT a restatement of your first email
  - Example: "I came across this benchmark report on deployment
    frequency in fintech (link). Your team's public metrics suggest
    you're ahead of the curve on release cadence but the
    reliability data might be useful context for your migration."

SOFTER CTA (1 sentence):
  - Lower friction than the first email
  - Good: "Happy to share how other teams used that benchmark
    data if it's useful."
  - Good: "No pressure -- just thought this was relevant to
    what you're building."

SIGNATURE
```

**Total length target:** 50-80 words. Follow-ups should be shorter than the initial email.

**Follow-up cadence:**

| Touch | Timing | Approach |
|-------|--------|----------|
| Follow-up 1 | Day 3-5 | Add new value (article, insight, data) |
| Follow-up 2 | Day 8-10 | Different angle or new trigger event |
| Follow-up 3 (breakup) | Day 14-18 | Respectful close (see below) |

### Breakup / Final Touch Email

Use after 2-3 unreturned emails. Goal: close the loop respectfully and leave the door open for future engagement.

```
SUBJECT LINE: Re: [Original subject line]
  - Keep the thread

BODY (3-4 sentences total):
  - Acknowledge they may not be interested or the timing is wrong
  - No guilt, no passive aggression, no "I've tried reaching you 47 times"
  - Leave the door open with a clear, low-pressure statement
  - Example:

    "Hi [Name],

    I've reached out a couple of times about [topic] and haven't
    heard back -- totally understand if the timing isn't right or
    this isn't a priority.

    I'll leave you be, but if [specific pain point] becomes a
    focus down the line, I'm here. Happy to pick this up whenever
    it makes sense.

    Best,
    [Name]"

SIGNATURE
```

**Total length target:** 40-60 words. Brevity is respect.

**Rules for breakup emails:**

- Never be passive-aggressive ("I guess you're not interested")
- Never create false urgency ("This offer expires Friday")
- Never guilt-trip ("I've spent hours researching your company")
- Do reference the specific topic (not "my previous emails")
- Do leave a clear door open tied to their pain point
- Do make it easy for them to re-engage later with zero awkwardness

---

## Tone Adaptation Guide

The same value proposition must be communicated differently depending on who receives it. Tone is not about changing your message -- it is about respecting how different roles process information and make decisions.

### Technical Buyers

**Who:** Engineering leads, architects, CTOs at smaller companies, DevOps managers, technical directors.

**How they think:** Bottom-up. They evaluate whether something works before evaluating whether they want it. They will mentally architect your solution before agreeing to a call. They distrust marketing language on a cellular level.

**Tone principles:**

| Do | Do Not |
|----|--------|
| Be specific and technical ("reduces p99 latency by 40ms") | Use vague claims ("blazing fast performance") |
| Reference architecture and implementation ("works alongside your existing CI pipeline") | Assume they do not understand ("in simple terms...") |
| Mention specific technologies they use ("I noticed you're on Kubernetes based on your job postings") | Use buzzwords without substance ("AI-powered", "next-gen", "disruptive") |
| Share technical content (benchmarks, architecture docs, open-source contributions) | Send case studies with only business metrics |
| Respect their time with brevity and directness | Pad the email with relationship-building pleasantries |
| Acknowledge trade-offs honestly ("this works best for teams already on containers") | Claim your solution does everything with no downsides |

**Example opening:**

> "Your team's migration from a Rails monolith to Go microservices (based on your recent blog post) is a pattern we've seen at about a dozen companies at your scale. The piece most teams underestimate is observability across service boundaries -- specifically distributed tracing when you go from 1 service to 30+."

**CTA style:** Offer something technical, not a "chat." Example: "Happy to share our architecture doc on distributed tracing for Go services. Would that be useful?"

### Executive Buyers

**Who:** VP-level and above, C-suite, founders, general managers. Whoever owns the budget and strategic direction.

**How they think:** Top-down. They care about outcomes, risk, and strategic positioning. They want to know the "so what" in the first sentence. They are time-constrained and filter aggressively.

**Tone principles:**

| Do | Do Not |
|----|--------|
| Lead with business outcomes ("reduce customer churn by 15%") | Lead with features or technology |
| Quantify impact in dollars, time, or competitive advantage | Use percentages without context ("40% faster" -- 40% of what?) |
| Reference their strategic priorities (board goals, market positioning) | Focus on operational details they delegate |
| Keep it under 100 words | Write paragraphs about how the product works |
| Reference peer companies and competitive dynamics | Name-drop irrelevant logos |
| Frame as risk mitigation or opportunity capture | Frame as "interesting technology" |

**Example opening:**

> "Three fintechs at your stage -- post-Series B, scaling from 100 to 500 employees -- have told us the same thing: compliance costs tripled before they found a systematic approach. I'd like to share what worked for them."

**CTA style:** Be direct and respect their calendar. Example: "Worth 15 minutes next week? I can also send a one-page summary first if that's more useful."

### Operational Buyers

**Who:** Directors of operations, IT managers, procurement leads, implementation decision-makers. The people who will live with the solution daily and own the rollout.

**How they think:** Pragmatic and risk-aware. They evaluate feasibility, integration complexity, change management burden, and support quality. They have been burned by vendors who oversold and underdelivered.

**Tone principles:**

| Do | Do Not |
|----|--------|
| Address implementation specifics ("integrates with your existing SSO via SAML") | Hand-wave integration ("seamlessly integrates with everything") |
| Discuss rollout and change management ("most teams go live in 2 weeks with zero downtime") | Ignore the transition period |
| Highlight reliability and support ("99.9% uptime SLA with dedicated support engineer") | Focus only on features without operational context |
| Reference similar-sized deployments ("works for teams of 50-500") | Only reference massive enterprise logos |
| Acknowledge migration effort honestly ("there's a 1-week data migration, here's how we handle it") | Pretend there is zero switching cost |
| Discuss vendor stability and roadmap | Avoid questions about your company's maturity |

**Example opening:**

> "I know evaluating new tools is a time investment, so I'll be direct: we built [Product] specifically for ops teams managing [specific workflow] across multiple environments. The typical rollout for a team your size is 10 business days with no downtime."

**CTA style:** Offer proof that reduces risk. Example: "Would a 30-minute walkthrough with one of our implementation engineers be useful? They can speak to the technical details of migration."

---

## Anti-Patterns

These are the outreach behaviors that damage response rates, brand reputation, and pipeline quality. Each one is common, and each one is avoidable.

### 1. Generic Templates with Mail-Merge Personalization

**What it looks like:** "Hi {first_name}, I noticed {company_name} is growing fast. We help companies like {company_name} with..."

**Why it fails:** Prospects immediately recognize merge-field personalization. It signals that you spent zero time on them and are running a volume play. The email gets deleted or marked as spam.

**The fix:** If you cannot write a genuinely personalized observation about a prospect, either do more research or do not email them. A smaller outreach volume with real personalization will always outperform high-volume templates.

### 2. Fake Personalization

**What it looks like:** "I was really impressed by your company's innovative approach to [industry]." Or: "I can see that [Company] is a leader in the [industry] space."

**Why it fails:** This says nothing specific. The prospect knows you could have written this sentence about any company in their industry without visiting their website. It is worse than no personalization because it pretends to be personal.

**The fix:** Every personalization must reference something specific and verifiable. "I noticed your team open-sourced your feature flagging library last month" is personalization. "I'm impressed by your engineering culture" is not.

### 3. Premature Pitching

**What it looks like:** Leading with a product description, feature list, or pricing before establishing relevance. "Hi, I'm reaching out from [Company]. We offer a platform that does X, Y, and Z. Our customers include..."

**Why it fails:** You are asking someone to care about your solution before you have demonstrated that you understand their problem. Without a personalization hook and value bridge, product details are noise.

**The fix:** Follow the framework: hook first, bridge second, product third. The prospect should understand why you are emailing them before they hear what you sell.

### 4. Over-Automation Without Quality Gates

**What it looks like:** Sending hundreds of outreach emails per day with no human review of personalization quality. Automated sequences where every email sounds the same regardless of the prospect.

**Why it fails:** Domain reputation degrades. Response rates drop below 1%. Your company's brand becomes associated with spam. Individual prospects who might have been good-fit customers are permanently turned off.

**The fix:** Every outreach email should pass a human quality check before sending. If you cannot review every email, reduce volume until you can. Use automation for scheduling and tracking, not for replacing judgment.

### 5. Spam Trigger Language

**What it looks like:** Subject lines and body copy that trigger spam filters or pattern-match to known spam:

- ALL CAPS in subject lines
- Exclamation marks (especially multiple)
- "Free", "guaranteed", "limited time", "act now"
- Excessive links (more than 1-2)
- Large images or HTML-heavy formatting
- "Dear Sir/Madam" or "To whom it may concern"
- Tracking pixels from unknown domains

**The fix:** Write like a colleague sending an email, not like a marketing campaign. Plain text or minimal formatting. One link at most. No images in cold outreach. Professional subject lines that you would actually write to someone you know.

### 6. No Clear CTA or Multiple CTAs

**What it looks like:** Ending with "Let me know if you'd like to learn more, see a demo, read our case studies, meet the team, or discuss pricing." Or ending with no ask at all.

**Why it fails:** Choice paralysis kills replies. When you give someone five things to respond to, they respond to none. When you make no ask, there is nothing to act on.

**The fix:** One CTA per email. Make it low-friction. "Worth a 15-minute call next week?" is almost always the right starting CTA for cold outreach.

### 7. Excessive Length

**What it looks like:** Emails over 200 words for cold outreach. Multiple paragraphs describing your company history, product features, customer list, and team background.

**Why it fails:** Busy professionals make a read/delete decision in under 3 seconds. Long emails signal that the sender does not respect the recipient's time. Even if the content is good, it will not be read.

**The fix:** Cold outreach: 80-120 words. ABM: 120-180 words. Follow-up: 50-80 words. Breakup: 40-60 words. If you cannot make your point in these limits, you have not clarified your thinking.

---

## Input/Output Contract

### Inputs

| Input | Source | Required | Description |
|-------|--------|----------|-------------|
| Lead research brief | `lead-research` skill output | Yes | Company profile, prospect role, pain points, recent events, tech stack signals |
| Company website URL | Provided by SDR or enrichment tool | Recommended | For website-based personalization hooks |
| Product value propositions | Internal sales enablement | Yes | 3-5 core value props with supporting metrics and case studies |
| Buyer persona | SDR judgment or `lead-qualification` output | Yes | Technical, executive, or operational -- drives tone selection |
| Outreach type | SDR judgment | Yes | Initial cold, ABM, follow-up, or breakup -- drives template selection |
| Previous outreach history | CRM activity log | For follow-ups | What was sent before, when, and whether it was opened/replied |
| Sequence position | SDR judgment | For sequences | Which touch number (1st, 2nd, 3rd) to calibrate intensity |

### Outputs

| Output | Format | Description |
|--------|--------|-------------|
| Email draft | Plain text with subject line | Complete, ready-to-send email following the selected template |
| Personalization rationale | 2-3 bullet points | Explains which hook was used, why it was selected, and how it connects to the value proposition. Useful for SDR coaching and quality review. |
| Tone classification | One of: technical, executive, operational | Which tone framework was applied and why |
| Recommended send timing | Day of week + time of day | Based on persona (executives: Tuesday-Thursday 7-8am; technical: Tuesday-Wednesday 10-11am; operational: Monday-Wednesday 9-10am) |
| Follow-up plan | Next 2-3 touches with timing and angle | Brief description of what each follow-up should contain and when to send it |
| Quality score | 1-5 rating with explanation | Self-assessment against the draft quality checklist |

### External Actions (Recommended)

These actions are NOT performed by this skill. They are recommendations for the SDR or their automation platform:

| Action | Platform | When |
|--------|----------|------|
| Send email | Email platform | After SDR review and approval of draft |
| Log activity | CRM | After email is sent -- record email type, template used, personalization hook |
| Schedule follow-up | CRM or task manager | Immediately after send -- create task for follow-up based on recommended plan |
| Update lead status | CRM | After sequence completes -- update lead status based on engagement |
| Track engagement | Email platform | Monitor opens, clicks, replies for sequence optimization |
| Share with team | Messaging platform | When a reply is received, notify the account team |

---

## Quick Reference

### Email Structure Cheat Sheet

| Type | Length | Subject Line | Opening | CTA | Timing After Previous |
|------|--------|-------------|---------|-----|----------------------|
| **Initial cold** | 80-120 words | Specific observation + implied question | Personalization hook | "Worth a 15-min call?" | N/A (first touch) |
| **ABM personalized** | 120-180 words | Account-specific insight | Strongest hook + supporting observation | Propose specific agenda | N/A (first touch) |
| **Follow-up 1** | 50-80 words | Re: [original] | "Quick follow-up with something useful" | Softer: "Happy to share if useful" | 3-5 business days |
| **Follow-up 2** | 50-80 words | Re: [original] | New angle or trigger event | Even softer: open-ended question | 5-7 business days |
| **Breakup** | 40-60 words | Re: [original] | Acknowledge no reply, no guilt | Door-open statement | 5-8 business days |

### Tone Guide Per Persona

| Persona | Word Count | Language Style | Lead With | CTA Style | Content to Share |
|---------|-----------|---------------|-----------|-----------|-----------------|
| **Technical** | 80-120 | Specific, precise, no buzzwords | Technical observation about their stack | Offer technical content | Architecture docs, benchmarks, open-source |
| **Executive** | 60-100 | Outcome-focused, strategic, brief | Business impact or competitive insight | Direct time request | One-pager, peer reference, ROI data |
| **Operational** | 80-120 | Pragmatic, implementation-aware | Rollout feasibility and risk reduction | Offer implementation walkthrough | Migration guide, uptime SLA, support details |

### Personalization Hook Types

| Hook | Strength | Data Source | Example Signal |
|------|----------|-------------|---------------|
| **Pain point** | Strongest | Research brief, job postings, public content | "Hiring 5 DevOps engineers" = deployment bottleneck |
| **Recent event** | Strong | News, press releases, funding databases | Series B, acquisition, product launch, expansion |
| **Public content** | Strong | Blog, conference talks, podcasts, social media | Prospect published something relevant to your domain |
| **Mutual connection** | Strong | Network, LinkedIn, warm introductions | Real, verified connection (never fabricated) |
| **Job posting signal** | Moderate | Career pages, job boards | Open roles reveal strategic priorities and capability gaps |
| **Website observation** | Moderate | Company website | Pricing page, tech stack, integrations, messaging changes |
| **Industry trend** | Moderate | Industry reports, market analysis | Applies to their segment but not company-specific |

### The 30-Second Self-Edit

Before sending any outreach email, answer these five questions:

1. **Is the personalization hook verifiable?** Could the prospect confirm your observation is accurate?
2. **Does the bridge connect logically?** If you removed the personalization, would the pitch still make sense on its own? If yes, the bridge is weak.
3. **Is the CTA singular and low-friction?** One ask. Under 15 words. Easy to say yes to.
4. **Would you reply to this email?** Read it as if you received it from a stranger. Be honest.
5. **Is it under the word limit?** Check the cheat sheet above. If over, cut from the middle -- never cut the hook or CTA.
