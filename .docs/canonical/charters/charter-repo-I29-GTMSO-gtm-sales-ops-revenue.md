# Charter: GTM Sales Ops & Revenue

**Initiative:** I29-GTMSO
**Date:** 2026-03-04
**Status:** Draft
**Charter:** 3 of 3 in GTM Team Buildout (I27-GTMSI, I28-GTMMC, I29-GTMSO)

## Goal

Build the sales operations and revenue analytics layer — agents and skills that manage CRM health, pipeline forecasting, deal intelligence, and full-funnel revenue analytics. Also enhance existing sales agents with richer cadence design and outreach capabilities. This layer consumes qualified leads from marketing ops (I28-GTMMC) and provides the data backbone for the entire GTM team.

## Scope

### In Scope

1. **2 new agents** (`.md` files in `agents/`)
2. **4 new skills** (SKILL.md + references in `skills/sales-team/`)
3. **Enhancements to 2 existing agents** (`sales-development-rep`, `account-executive`) — new collaborates-with entries and skill references
4. **README updates** (`agents/README.md`)
5. **Validation** via `/agent/validate`

### Out of Scope

- MCP tool integrations (HubSpot, Clarify, Gong APIs)
- Python automation scripts (reference skills first)
- New commands (future: `/sales/pipeline-review`, `/sales/forecast`)
- Customer success / post-sale agents (future initiative)
- Conversation intelligence / call recording analysis (requires Gong/Chorus integration)

## Success Criteria

| # | Criterion | Measurable |
|---|-----------|-----------|
| SC-1 | `sales-ops-analyst` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-2 | `revenue-ops-analyst` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-3 | All 4 new skills have SKILL.md with valid frontmatter and at least 1 reference file each | SKILL.md + references/ |
| SC-4 | `sales-development-rep` enhanced with cadence-design skill reference and gtm-strategist collaboration | Frontmatter updated |
| SC-5 | `account-executive` enhanced with pipeline-forecasting skill reference and sales-ops-analyst collaboration | Frontmatter updated |
| SC-6 | `agents/README.md` updated with 2 new agent entries | Entries present |
| SC-7 | All 4 modified/new agents pass `/agent/validate` | Pass/Fail |

## User Stories

### US-1: Sales Ops Analyst Agent (Must-Have) [Walking Skeleton]

**As a** sales team lead, **I want** an agent that manages CRM hygiene, pipeline analytics, deal risk scoring, and forecasting, **so that** the sales team operates on clean data with clear pipeline visibility.

**Acceptance Criteria:**
1. Agent file `agents/sales-ops-analyst.md` with valid frontmatter
2. Classification: type=implementation, color=green, field=sales, expertise=expert, execution=coordinated, model=sonnet
3. Core skills: `sales-team/crm-ops`, `sales-team/pipeline-forecasting`
4. Related agents: `account-executive`, `sales-development-rep`, `marketing-ops-manager` (I28)
5. Collaborates-with: `account-executive` (pipeline data handoff), `marketing-ops-manager` (lead routing alignment)
6. Purpose covers: CRM data hygiene and governance, pipeline health scoring, deal risk flagging (stale deals, single-threaded, stuck stages), revenue forecasting (weighted pipeline, AI-assisted), stage-to-stage conversion analytics
7. Differentiates from `account-executive`: AE does deal-level intelligence for individual accounts. Sales-ops does system-level pipeline analytics across all deals.
8. At least 2 workflows (Weekly Pipeline Review, CRM Health Audit)
9. Passes `/agent/validate`

### US-2: CRM Ops Skill (Must-Have) [Walking Skeleton]

**As a** sales ops analyst agent, **I want** a skill covering CRM management best practices, **so that** I can advise on CRM hygiene, data modeling, and integration patterns.

**Acceptance Criteria:**
1. Skill at `skills/sales-team/crm-ops/SKILL.md` with valid frontmatter
2. Covers: CRM data model design (contacts, companies, deals, activities), data hygiene practices (duplicate detection, field standardization, required fields), CRM integration patterns (marketing automation sync, enrichment tool sync, communication tool sync)
3. Tool-agnostic with specific notes for HubSpot and Clarify CRM
4. Includes CRM audit checklist (data completeness, field usage, automation health)
5. Reference file with CRM data model template or audit checklist
6. Related-agents: `sales-ops-analyst`, `marketing-ops-manager` (I28)

### US-3: Pipeline Forecasting Skill (Must-Have)

**As a** sales ops analyst agent, **I want** a skill covering pipeline analytics and forecasting, **so that** I can advise on predicting revenue and identifying pipeline risks.

**Acceptance Criteria:**
1. Skill at `skills/sales-team/pipeline-forecasting/SKILL.md` with valid frontmatter
2. Covers: forecasting methods (weighted pipeline, stage-probability, AI-assisted, rep judgment), pipeline health metrics (coverage ratio, velocity, conversion rates by stage, average deal size, win rate), deal risk signals (age > 2x average, no activity in 14+ days, single stakeholder, stuck stage), forecast cadence (weekly commit, monthly outlook, quarterly plan)
3. Includes B2B SaaS pipeline benchmarks for reference
4. Reference file with pipeline review template or forecast template
5. Related-agents: `sales-ops-analyst`, `account-executive`

### US-4: Revenue Ops Analyst Agent (Should-Have)

**As a** GTM leadership, **I want** an agent that provides cross-functional revenue analytics spanning marketing, sales, and customer success, **so that** we have full-funnel visibility from first touch to renewal.

**Acceptance Criteria:**
1. Agent file `agents/revenue-ops-analyst.md` with valid frontmatter
2. Classification: type=strategic, color=blue, field=sales, expertise=expert, execution=coordinated, model=sonnet
3. Core skills: `sales-team/revenue-analytics`
4. Related agents: `sales-ops-analyst`, `marketing-ops-manager` (I28), `gtm-strategist` (I27)
5. Purpose covers: full-funnel revenue analytics (lead → MQL → SQL → opportunity → closed-won → renewal), GTM efficiency metrics (CAC, LTV, LTV:CAC ratio, payback period, magic number), cross-functional alignment (marketing-sales handoff analysis, lead response time, SLA compliance), revenue forecasting at company level (vs sales-ops which is pipeline-level)
6. Differentiates from `sales-ops-analyst`: sales-ops is pipeline-level within sales. Revenue-ops is company-level across all GTM functions.
7. At least 2 workflows (Monthly Revenue Review, GTM Efficiency Analysis)
8. Passes `/agent/validate`

### US-5: Revenue Analytics Skill (Should-Have)

**As a** revenue ops analyst agent, **I want** a skill covering full-funnel revenue analytics, **so that** I can advise on GTM efficiency and revenue operations.

**Acceptance Criteria:**
1. Skill at `skills/sales-team/revenue-analytics/SKILL.md` with valid frontmatter
2. Covers: SaaS revenue metrics (ARR, MRR, net revenue retention, expansion revenue, churn), GTM efficiency metrics (CAC by channel, LTV:CAC, payback period, magic number, burn multiple), funnel analytics (stage conversion rates, velocity by segment, bottleneck identification), reporting frameworks (board-level dashboards, exec summaries, operational reports)
3. Complements existing `product-team/saas-finance` skill (saas-finance is product/business strategy; revenue-analytics is GTM operational measurement)
4. Reference file with revenue dashboard template or metric definitions
5. Related-agents: `revenue-ops-analyst`, `sales-ops-analyst`

### US-6: Cadence Design Skill (Must-Have)

**As a** sales development rep agent, **I want** a skill covering multi-channel outreach cadence design, **so that** I can advise on effective sequence structures.

**Acceptance Criteria:**
1. Skill at `skills/sales-team/cadence-design/SKILL.md` with valid frontmatter
2. Covers: multi-channel sequence structure (email + LinkedIn + phone touchpoints), cadence timing (spacing, day-of-week, time-of-day), touch count by segment (SMB: 8-12 touches, Mid-market: 12-16, Enterprise: 16-20), A/B testing methodology for sequences (subject lines, messaging, timing, channels), persona-based cadence adaptation
3. Differentiates from `sales-outreach` (outreach = individual message crafting; cadence-design = sequence architecture)
4. Reference file with cadence template (e.g., 14-day multi-channel sequence)
5. Related-agents: `sales-development-rep`, `email-marketing-specialist` (I28)

### US-7: Enhance Existing Sales Agents (Must-Have)

**As a** sales team user, **I want** existing sales agents to reference the new skills and agents, **so that** the sales ecosystem is fully connected.

**Acceptance Criteria:**
1. `sales-development-rep`: add `sales-team/cadence-design` to `related-skills`; add `gtm-strategist` (I27) to `collaborates-with` (ICP criteria handoff); add `sales-ops-analyst` to `related-agents`
2. `account-executive`: add `sales-team/pipeline-forecasting` to `related-skills`; add `sales-ops-analyst` to `collaborates-with` (pipeline data handoff); add `revenue-ops-analyst` to `related-agents`
3. All modified agents pass `/agent/validate`

### US-8: README Updates (Should-Have)

**Acceptance Criteria:**
1. `agents/README.md` includes entries for `sales-ops-analyst` and `revenue-ops-analyst`
2. Entries follow existing format

## Constraints

- Same schema conventions as I27-GTMSI and I28-GTMMC
- No Python scripts (reference skills only)
- All skills tool-agnostic (HubSpot, Clarify, Salesforce mentioned as examples, not requirements)
- Agent model: strategic (`revenue-ops-analyst`) → `sonnet`, ops (`sales-ops-analyst`) → `sonnet` (needs judgment for forecasting)

## Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| `pipeline-forecasting` overlap with existing `pipeline-analytics` skill | Medium | Verified: `pipeline-analytics` covers health monitoring, deal risk flagging, coaching. `pipeline-forecasting` covers forecasting methods, coverage ratios, forecast cadence — complementary, not duplicative. Both reference each other as related skills. |
| `revenue-analytics` overlap with `saas-finance` | Medium | revenue-analytics = operational GTM metrics. saas-finance = business/product strategy metrics. Document distinction. |
| Existing `account-executive` already has pipeline health scoring | Low | sales-ops-analyst provides system-level analytics; AE uses deal-level intelligence. Complementary, not duplicative. |

## Dependencies

- **Depends on:** I27-GTMSI (references `gtm-strategist`), I28-GTMMC (references `marketing-ops-manager`)
- **Depended on by:** None (terminal layer)
- **Soft dependency:** Can start Must-Have items (`sales-ops-analyst`, `crm-ops`, `pipeline-forecasting`, `cadence-design`) in parallel with I28. Revenue-ops items need I28 agents for cross-refs.

## Walking Skeleton

1. **US-1** (sales-ops-analyst) + **US-2** (crm-ops skill) — proves sales ops layer works
2. **US-6** (cadence-design skill) + **US-7** (enhance existing SDR) — enriches existing sales agent

## Priority

| Priority | Stories |
|----------|---------|
| Must-Have | US-1, US-2, US-3, US-6, US-7 |
| Should-Have | US-4, US-5, US-8 |

## Estimated Complexity

- **Scope type:** docs-only
- **Step count:** ~8 (2 agents, 4 skills, 2 agent updates)
- **Domain count:** 1 (agent/skill development)
- **Downstream consumers:** High
- **Recommended tier:** Light
