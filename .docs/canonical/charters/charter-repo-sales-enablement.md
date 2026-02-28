---
type: charter
endeavor: repo
initiative: I04-SLSE
initiative_name: sales-enablement
status: done
updated: 2026-02-11
---

# Charter: Sales Enablement

## Intent

- Equip the repo with sales domain coverage via two new agents and six new skills under a `sales-team/` directory.
- Codify patterns extracted from 15 Zapier automation definitions, abstracting away vendor-specific integrations (HubSpot, Gmail, Slack, Google Sheets) into tool-agnostic input/output contracts.
- Fill the gap between marketing-side demand generation (demand-gen-specialist) and product-side customer insights (product-manager) with dedicated sales execution agents.

## Problem statement

The current agent catalog covers product management, engineering, delivery, UX, and marketing strategy. But it has **zero coverage for sales execution workflows**:

1. **No lead research or enrichment capability** -- researching a prospect's company, role, and pain points before outreach.
2. **No sales outreach drafting** -- personalized ABM emails, cold outreach based on prospect research.
3. **No lead qualification framework** -- scoring leads against enterprise criteria (ICP, BANT, MEDDIC).
4. **No meeting intelligence** -- pre-call briefing from participant research, post-call follow-up drafting, proposal detection.
5. **No sales call evaluation** -- scoring calls against methodology frameworks (SPIN, Challenger, etc.).
6. **No pipeline analytics** -- daily deal health monitoring, risk flagging, coaching insights.

Existing agents do NOT cover these:
- `demand-gen-specialist` is marketing demand gen (paid channels, CAC, funnels) -- not 1:1 sales execution.
- `product-marketer` is positioning and GTM strategy -- not daily meeting prep or call follow-up.
- `product-manager` has customer interview analysis but not sales-focused call-to-PRD workflows.

## Primary approach

**Two new agents reflecting the B2B sales funnel split:**

### sales-development-rep (SDR)
Top-of-funnel: lead research, enrichment, qualification, personalized outreach.
- **Core skills:** lead-research, lead-qualification, sales-outreach
- **Classification:** implementation / green / sales

### account-executive (AE)
Mid-to-bottom funnel: meeting preparation, call follow-up, call evaluation, pipeline management.
- **Core skills:** meeting-intelligence, sales-call-analysis, pipeline-analytics
- **Related skills:** lead-research (for meeting prep research)
- **Classification:** implementation / green / sales

### Existing agent enhancements
- `product-manager` -- add call-to-PRD workflow reference (Zapier #8)
- `content-creator` -- add trending-content-pipeline reference (Zapier #15)

### Integration abstraction
Each skill defines an Input/Output Contract section:
- **Inputs:** What data the skill needs (lead email, call transcript, calendar event)
- **Outputs:** What it produces (email draft, briefing doc, score, enriched profile)
- **External actions (recommended):** Tool-agnostic recommendations (CRM update, send email, notify team)

Agents are the intelligence layer; users or their automation platforms handle integration plumbing.

## Source material analysis (Zapier automations)

| # | Automation | Disposition | Target |
|---|-----------|-------------|--------|
| 1 | ABM email personalization | BUILD | sales-development-rep / lead-research + sales-outreach |
| 2 | Email reply drafts | DISCARD | Generic LLM capability, not domain-specific |
| 3 | Lead capture and follow-up | DISCARD | Pure integration orchestration, no intelligence to codify |
| 4 | Sales lead emails | BUILD | sales-development-rep / lead-research + sales-outreach |
| 5 | Biz dev call briefer | BUILD | account-executive / meeting-intelligence |
| 6 | Call follow-up email | BUILD | account-executive / meeting-intelligence |
| 7 | Call follow-up CRM proposals | REFERENCE | Proposal detection pattern in meeting-intelligence |
| 8 | Customer call to PRD | EXTEND | product-manager enhancement |
| 9 | Enterprise lead qualification | BUILD | sales-development-rep / lead-qualification |
| 10 | Lead background search | BUILD | sales-development-rep / lead-research |
| 11 | Lead enrichment | BUILD | sales-development-rep / lead-research |
| 12 | Sales call analysis | BUILD | account-executive / sales-call-analysis |
| 13 | Sales prep | BUILD | account-executive / meeting-intelligence |
| 14 | Pipeline health monitor | BUILD | account-executive / pipeline-analytics |
| 15 | Viral content creator | EXTEND | content-creator enhancement |

**Summary:** 10 BUILD, 2 EXTEND, 1 REFERENCE, 2 DISCARD.

## Constraints (non-negotiable)

- **Two new agents maximum.** Pipeline analytics and call analysis are skills on account-executive, not a separate sales-manager agent.
- **No vendor-specific integrations.** All skills use tool-agnostic language (CRM, email, messaging, calendar -- never HubSpot, Gmail, Slack, Google Calendar).
- **Skills are knowledge, not connectors.** Skills teach methodology, frameworks, and templates. They do not execute API calls.
- **All canonical artifacts under `.docs/`** per I01-ACM conventions.
- **Agents follow existing frontmatter schema** per agents/README.md.

## Non-goals

- Building CRM/email/calendar integration connectors or automation scripts.
- Creating a separate sales-manager agent (skills on AE cover this).
- Replacing demand-gen-specialist's marketing acquisition scope.
- Codifying email reply drafting (#2) or lead capture workflows (#3).
- Migrating raw Zapier files as references (content is authored fresh, abstracting patterns).

## Decision rights

- **Charter changes:** Product Director + Engineering Lead.
- **Agent architecture (persona boundaries):** Product Director.
- **Skill content and frameworks:** Implementation owner with domain input.
- **Backlog ordering:** Product Manager.

## Success measures

- Two new agents (`sales-development-rep`, `account-executive`) pass agent validation.
- Six new skills exist under `skills/sales-team/` with SKILL.md content.
- `product-manager` and `content-creator` have updated references.
- All catalog READMEs (agents, skills) are updated.
- No Zapier-specific or vendor-specific integration references in any created content.

## Outcomes (sequenced)

Outcomes only; no task granularity. Execution is pulled from the backlog and planned in the plan doc.

| Order | Outcome | Checkpoint |
|-------|---------|------------|
| 1 | Sales team infrastructure exists | `skills/sales-team/` directory with CLAUDE.md; all 6 skill directories created |
| 2 | All 6 sales skills are authored with full content | Each SKILL.md has frontmatter, methodology sections, input/output contracts, and framework references |
| 3 | Two new sales agents are created and pass validation | `sales-development-rep` and `account-executive` agent definitions with frontmatter + body; validation passes |
| 4 | Existing agents enhanced with cross-functional workflows | `product-manager` has call-to-PRD reference; `content-creator` has trending-content reference |
| 5 | All catalogs updated and validated | `skills/README.md`, `agents/README.md`, `sales-team/CLAUDE.md` reflect new agents and skills; agent validation passes for all touched agents |

## Parallelization notes

- **Outcome 2 items are fully parallelizable** -- all 6 skills are independent of each other.
- **Outcome 3 items are parallelizable** -- both agents can be written simultaneously once skills exist.
- **Outcome 4 items are parallelizable** -- both existing agent updates are independent.
- **Outcome 1 must complete before Outcome 2.**
- **Outcome 2 must complete before Outcome 3** (agents reference skill paths).
- **Outcomes 3-4 can run in parallel** once Outcome 2 is done.
- **Outcome 5 depends on Outcomes 3-4 completing.**

## References

- Source material: `~/zapier-agents/` (15 Zapier automation definitions -- external, not committed)
- Expert panel analysis: Conducted 2026-02-11 (brainstormer, researcher, product-director, UX-researcher, use-case-data-analyzer)
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md)
- Backlog: [backlog-repo-I04-SLSE-sales-enablement.md](../backlogs/backlog-repo-I04-SLSE-sales-enablement.md)
