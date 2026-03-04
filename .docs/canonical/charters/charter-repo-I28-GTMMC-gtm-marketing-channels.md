# Charter: GTM Marketing Ops & Channels

**Initiative:** I28-GTMMC
**Date:** 2026-03-04
**Status:** Draft
**Charter:** 2 of 3 in GTM Team Buildout (I27-GTMSI, I28-GTMMC, I29-GTMSO)

## Goal

Build the marketing operations and channel execution agents — the layer that orchestrates campaigns, manages lead scoring/attribution, and executes across LinkedIn, email, and emerging AEO/GEO channels. These agents consume the strategy outputs from I27-GTMSI and feed qualified leads to the sales team.

## Scope

### In Scope

1. **5 new agents** (`.md` files in `agents/`)
2. **6 new skills** (SKILL.md + references in `skills/marketing-team/`)
3. **Cross-reference updates** to existing agents (`demand-gen-specialist`, `content-creator`, `seo-strategist`)
4. **README updates** (`agents/README.md`)
5. **Validation** via `/agent/validate`

### Out of Scope

- Sales ops agents (I29-GTMSO)
- MCP tool integrations (HubSpot, 6sense, LinkedIn APIs)
- Python automation scripts (reference skills first)
- Changes to I27-GTMSI agents (only cross-reference wiring)
- Paid advertising campaign management (Google Ads, Meta Ads — future)
- Social media platforms beyond LinkedIn (Instagram, X, TikTok — future)

## Success Criteria

| # | Criterion | Measurable |
|---|-----------|-----------|
| SC-1 | `marketing-ops-manager` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-2 | `abm-strategist` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-3 | `linkedin-strategist` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-4 | `email-marketing-specialist` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-5 | `aeo-geo-strategist` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-6 | All 6 new skills have SKILL.md with valid frontmatter and at least 1 reference file each | SKILL.md + references/ |
| SC-7 | Existing agents (`demand-gen-specialist`, `content-creator`, `seo-strategist`) updated with cross-refs | Frontmatter includes refs |
| SC-8 | `agents/README.md` updated with 5 new agent entries | Entries present |
| SC-9 | All 8 modified/new agents pass `/agent/validate` | Pass/Fail |

## User Stories

### US-1: Marketing Ops Manager Agent (Must-Have) [Walking Skeleton]

**As a** marketing team lead, **I want** an agent that manages lead scoring models, marketing automation workflows, and attribution analysis, **so that** leads are properly scored, routed, and campaigns are measured.

**Acceptance Criteria:**
1. Agent file `agents/marketing-ops-manager.md` with valid frontmatter
2. Classification: type=implementation, color=green, field=marketing, expertise=expert, execution=coordinated, model=sonnet
3. Core skills: `marketing-team/marketing-automation`, `marketing-team/lead-scoring`, `marketing-team/attribution-modeling`
4. Related agents: `demand-gen-specialist`, `gtm-strategist` (I27), `sales-development-rep`
5. Collaborates-with: `demand-gen-specialist` (campaign data handoff), `sales-development-rep` (MQL routing)
6. Purpose covers: lead scoring (MQL/SQL/PQL), marketing automation workflow design, multi-touch attribution modeling, campaign performance analytics, CRM integration guidance
7. At least 2 workflows (Lead Scoring Model Setup, Campaign Attribution Analysis)
8. Passes `/agent/validate`

### US-2: Lead Scoring Skill (Must-Have) [Walking Skeleton]

**As a** marketing ops manager agent, **I want** a skill covering lead scoring frameworks, **so that** I can design and advise on scoring models.

**Acceptance Criteria:**
1. Skill at `skills/marketing-team/lead-scoring/SKILL.md` with valid frontmatter
2. Covers: MQL/SQL/PQL definitions and transition criteria, scoring model design (demographic + firmographic + behavioral + engagement signals), score decay and recency weighting, threshold-based routing rules (hot/warm/nurture/disqualify)
3. Includes predictive vs rule-based scoring comparison
4. Reference file with scoring model template
5. Related-agents: `marketing-ops-manager`, `sales-development-rep`

### US-3: Marketing Automation Skill (Must-Have)

**As a** marketing ops manager agent, **I want** a skill covering marketing automation patterns, **so that** I can design nurture workflows and campaign automation.

**Acceptance Criteria:**
1. Skill at `skills/marketing-team/marketing-automation/SKILL.md` with valid frontmatter
2. Covers: nurture workflow patterns (drip campaigns, trigger-based, lifecycle), segmentation strategies, workflow logic (if/then branching, time delays, conditional sends), tool-agnostic patterns (applicable to HubSpot, Marketo, Customer.io)
3. Includes campaign orchestration framework (multi-channel coordination)
4. Reference file with workflow template
5. Related-agents: `marketing-ops-manager`, `email-marketing-specialist`

### US-4: Attribution Modeling Skill (Must-Have)

**As a** marketing ops manager agent, **I want** a skill covering attribution models, **so that** I can advise on measuring marketing's impact on revenue.

**Acceptance Criteria:**
1. Skill at `skills/marketing-team/attribution-modeling/SKILL.md` with valid frontmatter
2. Covers: first-touch, last-touch, linear, time-decay, position-based, W-shaped models with pros/cons for each
3. B2B attribution challenges (long sales cycles, multiple stakeholders, dark social)
4. Self-reported attribution as complement to software attribution
5. Reference file with attribution model selection guide
6. Related-agents: `marketing-ops-manager`, `demand-gen-specialist`

### US-5: ABM Strategist Agent (Must-Have)

**As a** demand generation team member, **I want** an agent that orchestrates account-based marketing campaigns targeting specific high-value accounts, **so that** we can focus resources on accounts most likely to convert.

**Acceptance Criteria:**
1. Agent file `agents/abm-strategist.md` with valid frontmatter
2. Classification: type=strategic, color=blue, field=marketing, expertise=expert, execution=coordinated, model=sonnet
3. Core skills: `marketing-team/abm-strategy`
4. Related agents: `gtm-strategist` (I27), `demand-gen-specialist`, `sales-development-rep`, `marketing-ops-manager`
5. Collaborates-with: `gtm-strategist` (target account selection from ICP), `sales-development-rep` (ABM outreach execution)
6. Purpose covers: target account selection and tiering, multi-stakeholder engagement mapping, ABM campaign orchestration (1:1, 1:few, 1:many), intent data analysis, account penetration tracking
7. At least 2 workflows (Target Account Selection, ABM Campaign Launch)
8. Passes `/agent/validate`

### US-6: ABM Strategy Skill (Must-Have)

**As an** ABM strategist agent, **I want** a skill covering ABM frameworks, **so that** I can design account-based campaigns.

**Acceptance Criteria:**
1. Skill at `skills/marketing-team/abm-strategy/SKILL.md` with valid frontmatter
2. Covers: ABM tiers (1:1 strategic, 1:few cluster, 1:many programmatic), target account selection criteria, account scoring, intent data sources and signals (Bombora, G2, 6sense), multi-stakeholder engagement mapping, ABM metrics (account penetration, engagement score, pipeline influence)
3. Differentiates ABM from traditional demand gen (account-centric vs lead-centric)
4. Reference file with account tier template
5. Related-agents: `abm-strategist`, `demand-gen-specialist`

### US-7: LinkedIn Strategist Agent (Should-Have)

**As a** B2B marketer, **I want** an agent specialized in LinkedIn organic and paid strategy, **so that** I can maximize the #1 B2B channel for thought leadership and pipeline generation.

**Acceptance Criteria:**
1. Agent file `agents/linkedin-strategist.md` with valid frontmatter
2. Classification: type=implementation, color=green, field=marketing, expertise=advanced, execution=autonomous, model=haiku
3. Core skills: `marketing-team/linkedin-strategy`
4. Related agents: `content-creator`, `sales-development-rep`
5. Purpose covers: LinkedIn organic content strategy (post types, frequency, algorithm), LinkedIn Ads (campaign types, targeting, budgets), LinkedIn Sales Navigator workflows, employee advocacy programs, social selling cadences
6. At least 2 workflows (Thought Leadership Content, LinkedIn Ads Campaign)
7. Passes `/agent/validate`

### US-8: LinkedIn Strategy Skill (Should-Have)

**As a** linkedin strategist agent, **I want** a skill covering LinkedIn playbooks, **so that** I can advise on LinkedIn organic and paid.

**Acceptance Criteria:**
1. Skill at `skills/marketing-team/linkedin-strategy/SKILL.md` with valid frontmatter
2. Covers: organic content (post formats, carousel vs text vs video, optimal length, hashtag strategy, engagement tactics, algorithm signals), LinkedIn Ads (Sponsored Content, Message Ads, Dynamic Ads, targeting options, bidding strategies), Sales Navigator (search filters, lead lists, InMail best practices), employee advocacy (guidelines, content library, amplification)
3. LinkedIn automation risks and safe practices (ToS compliance)
4. Reference file with content calendar template or ad campaign checklist

### US-9: Email Marketing Specialist Agent (Should-Have)

**As a** demand generation team member, **I want** an agent for email marketing expertise, **so that** nurture campaigns, sequences, and lifecycle emails drive engagement and conversion.

**Acceptance Criteria:**
1. Agent file `agents/email-marketing-specialist.md` with valid frontmatter
2. Classification: type=implementation, color=green, field=marketing, expertise=advanced, execution=autonomous, model=haiku
3. Core skills: `marketing-team/email-sequences`
4. Related agents: `marketing-ops-manager`, `sales-development-rep`, `copywriter` (I27)
5. Purpose covers: email sequence design, deliverability management, email warm-up, segmentation, A/B testing, lifecycle email (onboarding, re-engagement, renewal)
6. Differentiates from `sales-development-rep` (SDR does cold outreach emails; this agent does lifecycle/nurture/marketing emails)
7. Passes `/agent/validate`

### US-10: Email Sequences Skill (Should-Have)

**As an** email marketing specialist agent, **I want** a skill covering email sequence design and deliverability, **so that** I can advise on effective email marketing.

**Acceptance Criteria:**
1. Skill at `skills/marketing-team/email-sequences/SKILL.md` with valid frontmatter
2. Covers: sequence types (welcome, nurture, re-engagement, renewal, event-triggered), email copy patterns (subject lines, preview text, body structure, CTAs), deliverability (SPF, DKIM, DMARC, warm-up, sender reputation), segmentation strategies, A/B testing methodology (subject, send time, content, CTA), key metrics (open rate, CTR, conversion, unsubscribe, bounce)
3. Reference file with sequence template

### US-11: AEO/GEO Strategist Agent (Should-Have)

**As a** marketing/SEO team member, **I want** an agent specialized in optimizing for AI answer engines and generative search, **so that** our content is cited by ChatGPT, Perplexity, Google AI Overviews, and other AI search tools.

**Acceptance Criteria:**
1. Agent file `agents/aeo-geo-strategist.md` with valid frontmatter
2. Classification: type=strategic, color=blue, field=marketing, expertise=expert, execution=coordinated, model=sonnet
3. Core skills: `marketing-team/aeo-geo-optimization`
4. Related agents: `seo-strategist`, `content-creator`
5. Collaborates-with: `seo-strategist` (traditional SEO handoff), `content-creator` (content optimization handoff)
6. Purpose covers: AEO (Answer Engine Optimization for Perplexity, ChatGPT Search, Google AI Overviews), GEO (Generative Engine Optimization for broader AI citation), structured data strategy, AI-citation monitoring
7. Passes `/agent/validate`

### US-12: AEO/GEO Optimization Skill (Should-Have)

**As an** AEO/GEO strategist agent, **I want** a skill covering AI search optimization, **so that** I can advise on getting content cited by AI engines.

**Acceptance Criteria:**
1. Skill at `skills/marketing-team/aeo-geo-optimization/SKILL.md` with valid frontmatter
2. Covers AEO: FAQ schema, HowTo schema, direct answer formatting (40-60 word concise answers), citation-worthy content patterns, AI search engine behavior
3. Covers GEO: entity optimization, knowledge panel signals, unique data/research, authoritative sourcing, brand mention monitoring
4. Differentiates from traditional SEO (keyword density vs authority signals)
5. Reference file with AEO/GEO audit checklist

### US-13: Cross-Reference Existing Agents (Should-Have)

**As a** GTM team user, **I want** existing marketing agents to reference the new agents.

**Acceptance Criteria:**
1. `demand-gen-specialist`: `related-agents` adds `marketing-ops-manager`, `abm-strategist`
2. `content-creator`: `related-agents` adds `linkedin-strategist`, `aeo-geo-strategist`
3. `seo-strategist`: `related-agents` adds `aeo-geo-strategist`
4. All modified agents pass `/agent/validate`

### US-14: README Updates (Should-Have)

**Acceptance Criteria:**
1. `agents/README.md` includes entries for all 5 new agents
2. Entries follow existing format

## Constraints

- Same schema conventions as I27-GTMSI
- No Python scripts (reference skills only)
- Agent model: strategic agents → `sonnet`, execution agents → `haiku`
- All skills must be tool-agnostic (applicable to HubSpot, Marketo, Customer.io, etc.)

## Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Scope creep — 5 agents + 6 skills is large | High | Strict scope: SKILL.md + 1 reference each. No scripts. Wave-based execution. |
| `marketing-automation` overlap with `marketing-demand-acquisition` | Medium | marketing-automation = workflow design & automation logic. marketing-demand-acquisition = campaign strategy & channel optimization. |
| AEO/GEO is rapidly evolving | Medium | Skill documents current best practices (2025-2026) with note that quarterly review is needed. |

## Dependencies

- **Depends on:** I27-GTMSI (references `gtm-strategist`, `copywriter` agents)
- **Depended on by:** I29-GTMSO (sales ops references marketing-ops-manager for lead routing)
- **Soft dependency:** Can start in parallel with I27-GTMSI if new agent references use forward declarations

## Walking Skeleton

1. **US-1** (marketing-ops-manager) + **US-2** (lead-scoring skill) — proves the ops layer works
2. **US-5** (abm-strategist) + **US-6** (abm-strategy skill) — proves the strategic campaign layer

## Priority

| Priority | Stories |
|----------|---------|
| Must-Have | US-1, US-2, US-3, US-4, US-5, US-6 |
| Should-Have | US-7, US-8, US-9, US-10, US-11, US-12, US-13, US-14 |

## Estimated Complexity

- **Scope type:** docs-only
- **Step count:** ~14 (5 agents, 6 skills, 3 agent updates)
- **Domain count:** 1 (agent/skill development)
- **Downstream consumers:** High
- **Recommended tier:** Medium
