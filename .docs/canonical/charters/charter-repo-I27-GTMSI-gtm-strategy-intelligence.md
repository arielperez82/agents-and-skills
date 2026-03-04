# Charter: GTM Strategy & Intelligence Layer

**Initiative:** I27-GTMSI
**Date:** 2026-03-04
**Status:** Draft
**Charter:** 1 of 3 in GTM Team Buildout (I27-GTMSI, I28-GTMMC, I29-GTMSO)

## Goal

Create the GTM strategy layer — the foundational agents and skills that define ICP, market positioning, competitive intelligence, and brand copy. All downstream GTM agents (marketing ops, channels, sales ops) depend on this layer's outputs.

## Scope

### In Scope

1. **3 new agents** (`.md` files in `agents/`)
2. **3 new skills** (SKILL.md + references/scripts in `skills/marketing-team/`)
3. **Cross-reference updates** to 3 existing agents
4. **README updates** (`agents/README.md`)
5. **Validation** via `/agent/validate`

### Out of Scope

- Marketing ops agents (I28-GTMMC)
- Sales ops agents (I29-GTMSO)
- MCP tool integrations (HubSpot, Clay, etc.)
- Python scripts for new skills (scripts are future enhancement; SKILL.md + references first)
- Changes to existing skill SKILL.md content (only cross-reference wiring)

## Success Criteria

| # | Criterion | Measurable |
|---|-----------|-----------|
| SC-1 | `gtm-strategist` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-2 | `competitive-intelligence-analyst` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-3 | `copywriter` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-4 | `copywriter` agent resolves dangling references from 4 content commands (`/content/cro`, `/content/enhance`, `/content/fast`, `/content/good`) | 4 commands reference existing agent |
| SC-5 | `icp-modeling` skill exists with SKILL.md and at least 1 reference file | SKILL.md + references/ |
| SC-6 | `niche-market-strategy` skill exists with SKILL.md and at least 1 reference file | SKILL.md + references/ |
| SC-7 | `competitive-intel` skill exists with SKILL.md and at least 1 reference file | SKILL.md + references/ |
| SC-8 | `product-marketer` agent updated with related-agents cross-refs to new agents | Frontmatter includes refs |
| SC-9 | `sales-development-rep` agent updated with related-agents ref to `gtm-strategist` | Frontmatter includes ref |
| SC-10 | `content-creator` agent updated with related-agents ref to `copywriter` | Frontmatter includes ref |
| SC-11 | `agents/README.md` updated with 3 new agent entries | Entries present |
| SC-12 | All 6 modified/new agents pass `/agent/validate` | Pass/Fail |

## User Stories

### US-1: GTM Strategist Agent (Must-Have) [Walking Skeleton]

**As a** GTM leader, **I want** an agent that can define and refine the Ideal Customer Profile using enrichment-driven analysis, **so that** all downstream marketing and sales agents target the right accounts.

**Acceptance Criteria:**
1. Agent file `agents/gtm-strategist.md` exists with valid frontmatter
2. Classification: type=strategic, color=blue, field=marketing, expertise=expert, execution=coordinated, model=sonnet
3. Core skills reference `marketing-team/icp-modeling` and `marketing-team/niche-market-strategy`
4. Related skills include `marketing-team/marketing-strategy-pmm` (existing)
5. Related agents include `product-marketer`, `competitive-intelligence-analyst`
6. Collaborates-with entries for `product-marketer` (positioning handoff) and `sales-development-rep` (ICP handoff)
7. Purpose section covers: ICP definition, TAM/SAM/SOM analysis, market segmentation, niche market strategy (Algolia PLG+DevRel model)
8. At least 2 concrete examples with realistic input/output
9. At least 2 workflows (ICP Definition, Market Segmentation)
10. Passes `/agent/validate`

### US-2: ICP Modeling Skill (Must-Have) [Walking Skeleton]

**As a** GTM strategist agent, **I want** a skill that provides ICP definition frameworks and enrichment-driven profiling patterns, **so that** I can build data-driven customer profiles.

**Acceptance Criteria:**
1. Skill at `skills/marketing-team/icp-modeling/SKILL.md` with valid frontmatter
2. Covers: firmographic criteria (company size, industry, revenue, geography), technographic criteria (tech stack, tools), behavioral criteria (buying signals, engagement patterns), psychographic criteria (pain points, priorities)
3. Documents the Clay waterfall enrichment pattern for multi-source data assembly
4. Includes closed-won pattern analysis methodology (analyze winning deals to refine ICP)
5. Includes scoring model template (weighted criteria with 0-100 composite score)
6. At least 1 reference file in `references/` (ICP worksheet or scoring template)
7. Related-agents includes `gtm-strategist`, `sales-development-rep`

### US-3: Niche Market Strategy Skill (Must-Have)

**As a** GTM strategist agent, **I want** a skill covering niche market entry strategies including PLG and developer-first GTM, **so that** I can advise on market entry for technical/developer audiences.

**Acceptance Criteria:**
1. Skill at `skills/marketing-team/niche-market-strategy/SKILL.md` with valid frontmatter
2. Covers Algolia-style PLG + DevRel model: free tier adoption, developer documentation, API-first product, community building, bottom-up expansion
3. Covers niche market identification: TAM/SAM/SOM sizing, segment analysis, beachhead strategy
4. Includes at least 2 market entry patterns beyond PLG (e.g., community-led growth, vertical SaaS, channel partnerships)
5. Reference file with niche market evaluation template
6. Related-agents includes `gtm-strategist`, `product-marketer`

### US-4: Competitive Intelligence Analyst Agent (Must-Have)

**As a** product marketing or sales team member, **I want** an agent that continuously monitors competitors and produces actionable battlecards, **so that** our sales and positioning stay current with market moves.

**Acceptance Criteria:**
1. Agent file `agents/competitive-intelligence-analyst.md` with valid frontmatter
2. Classification: type=strategic, color=blue, field=marketing, expertise=expert, execution=coordinated, model=sonnet
3. Core skills reference `marketing-team/competitive-intel` (new) and `product-team/competitive-analysis` (existing)
4. Related agents include `product-marketer`, `gtm-strategist`, `sales-development-rep`, `account-executive`
5. Collaborates-with entries for `product-marketer` (battlecard handoff) and `sales-development-rep` (competitive context for outreach)
6. Purpose covers: continuous CI monitoring, automated battlecard creation, win/loss analysis, share-of-voice tracking, competitor feature/pricing tracking
7. At least 2 concrete examples
8. At least 2 workflows (Competitor Monitoring, Battlecard Generation)
9. Passes `/agent/validate`

### US-5: Competitive Intel Skill (Must-Have)

**As a** competitive intelligence analyst agent, **I want** a skill providing CI monitoring frameworks and battlecard templates, **so that** I can systematically track and analyze competitors.

**Acceptance Criteria:**
1. Skill at `skills/marketing-team/competitive-intel/SKILL.md` with valid frontmatter
2. Covers: competitor identification methodology, monitoring cadence (daily signals, weekly summaries, monthly deep-dives), data sources (websites, job postings, press releases, product changes, pricing, reviews)
3. Battlecard template: positioning, strengths/weaknesses, objection handling, landmines, win themes
4. Win/loss analysis framework: interview methodology, pattern extraction, actionable insights
5. Share-of-voice measurement approach
6. Differentiates from existing `product-team/competitive-analysis` skill (that one is repo/product-focused scorecard analysis; this one is market-facing CI operations)
7. At least 1 reference file (battlecard template or monitoring checklist)
8. Related-agents includes `competitive-intelligence-analyst`, `product-marketer`

### US-6: Copywriter Agent (Must-Have)

**As a** content workflow user, **I want** the `copywriter` agent that 4 content commands already reference to actually exist, **so that** `/content/cro`, `/content/enhance`, `/content/fast`, and `/content/good` commands work correctly.

**Acceptance Criteria:**
1. Agent file `agents/copywriter.md` with valid frontmatter
2. Classification: type=implementation, color=green, field=marketing, expertise=advanced, execution=autonomous, model=haiku
3. Core skills reference `marketing-team/content-creator` (existing)
4. Related skills include `marketing-team/page-cro` and `marketing-team/marketing-psychology`
5. Related agents include `content-creator`
6. Related commands include the 4 content commands that reference it
7. Purpose covers: writing and editing copy for web, email, social, landing pages; CRO-optimized copy; brand voice adherence
8. Differentiates from `content-creator`: copywriter is the execution agent (writes the actual copy); content-creator is the strategy agent (plans content, analyzes brand voice, optimizes SEO)
9. At least 2 concrete examples with realistic copy input/output
10. Passes `/agent/validate`

### US-7: Cross-Reference Existing Agents (Should-Have)

**As a** GTM team user, **I want** existing agents to reference the new agents in their relationships, **so that** the agent graph is fully connected and discoverable.

**Acceptance Criteria:**
1. `product-marketer` frontmatter updated: `related-agents` includes `gtm-strategist`, `competitive-intelligence-analyst`; `related-skills` includes `marketing-team/competitive-intel`
2. `sales-development-rep` frontmatter updated: `related-agents` includes `gtm-strategist`; new `collaborates-with` entry for `gtm-strategist` (ICP criteria handoff)
3. `content-creator` frontmatter updated: `related-agents` includes `copywriter`; new `collaborates-with` entry for `copywriter`
4. All 3 modified agents still pass `/agent/validate`

### US-8: README and Catalog Updates (Should-Have)

**As a** repo user, **I want** the agent README to include the 3 new agents, **so that** they are discoverable in the catalog.

**Acceptance Criteria:**
1. `agents/README.md` includes entries for `gtm-strategist`, `competitive-intelligence-analyst`, `copywriter`
2. Entries follow existing format (name, description, classification, key skills)
3. Marketing team section updated if one exists

## Constraints

- Follow existing agent frontmatter schema exactly (see `agents/product-marketer.md` as reference)
- Follow existing skill frontmatter schema exactly (see `skills/marketing-team/marketing-strategy-pmm/SKILL.md` as reference)
- No new Python scripts in this charter (defer to future enhancement)
- All skills are reference/methodology skills (no code dependencies)
- Agent model assignments: strategic agents use `sonnet`, execution agents use `haiku`

## Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Skill content overlap with existing `marketing-strategy-pmm` | Medium | ICP-modeling focuses on profiling methodology; niche-market-strategy on market entry; marketing-strategy-pmm on positioning. Clear scope boundaries in each SKILL.md. |
| `competitive-intel` vs `competitive-analysis` confusion | Medium | competitive-intel = market-facing CI operations (monitoring, battlecards). competitive-analysis = repo/product scorecard analysis. Document distinction in both skills. |
| `copywriter` vs `content-creator` role confusion | Low | copywriter = writes copy (execution). content-creator = plans content strategy (strategic+execution). Document distinction in both agents. |

## Dependencies

- **Depends on:** Research report `.docs/reports/researcher-260304-ai-gtm-landscape-2025-2026.md` (complete)
- **Depended on by:** I28-GTMMC (marketing ops agents reference gtm-strategist for ICP), I29-GTMSO (sales ops reference competitive-intel)
- **No blocking dependencies** — can start immediately

## Walking Skeleton

The thinnest vertical slice that proves the architecture:

1. **US-1** (gtm-strategist agent) + **US-2** (icp-modeling skill) — proves the agent-skill wiring works
2. **US-6** (copywriter agent) — resolves the dangling command references

These 3 items together validate: new agent creation, new skill creation, cross-reference wiring, and existing command resolution.

## Priority

| Priority | Stories |
|----------|---------|
| Must-Have | US-1, US-2, US-3, US-4, US-5, US-6 |
| Should-Have | US-7, US-8 |

## Estimated Complexity

- **Scope type:** docs-only (all artifacts are `.md` files)
- **Step count:** ~10 (3 agents, 3 skills, 3 agent updates, 1 README update)
- **Domain count:** 1 (agent/skill development)
- **Downstream consumers:** High (agents are consumed by users, commands, other agents)
- **Recommended tier:** Light-Medium
