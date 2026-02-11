---
type: charter
endeavor: repo
initiative: I04-SLSE
initiative_name: sales-enablement
status: active
updated: 2026-02-11
---

# Charter: Sales Enablement

## Intent

- Equip the repo with sales domain coverage via two new agents and six new skills under a `sales-team/` directory.
- Codify patterns extracted from 15 Zapier automation definitions, abstracting away vendor-specific integrations (HubSpot, Gmail, Slack, Google Sheets) into tool-agnostic input/output contracts.
- Fill the gap between marketing-side demand generation (ap-demand-gen-specialist) and product-side customer insights (ap-product-manager) with dedicated sales execution agents.

## Problem statement

The current agent catalog covers product management, engineering, delivery, UX, and marketing strategy. But it has **zero coverage for sales execution workflows**:

1. **No lead research or enrichment capability** -- researching a prospect's company, role, and pain points before outreach.
2. **No sales outreach drafting** -- personalized ABM emails, cold outreach based on prospect research.
3. **No lead qualification framework** -- scoring leads against enterprise criteria (ICP, BANT, MEDDIC).
4. **No meeting intelligence** -- pre-call briefing from participant research, post-call follow-up drafting, proposal detection.
5. **No sales call evaluation** -- scoring calls against methodology frameworks (SPIN, Challenger, etc.).
6. **No pipeline analytics** -- daily deal health monitoring, risk flagging, coaching insights.

Existing agents do NOT cover these:
- `ap-demand-gen-specialist` is marketing demand gen (paid channels, CAC, funnels) -- not 1:1 sales execution.
- `ap-product-marketer` is positioning and GTM strategy -- not daily meeting prep or call follow-up.
- `ap-product-manager` has customer interview analysis but not sales-focused call-to-PRD workflows.

## Primary approach

**Two new agents reflecting the B2B sales funnel split:**

### ap-sales-development-rep (SDR)
Top-of-funnel: lead research, enrichment, qualification, personalized outreach.
- **Core skills:** lead-research, lead-qualification, sales-outreach
- **Classification:** implementation / green / sales

### ap-account-executive (AE)
Mid-to-bottom funnel: meeting preparation, call follow-up, call evaluation, pipeline management.
- **Core skills:** meeting-intelligence, sales-call-analysis, pipeline-analytics
- **Related skills:** lead-research (for meeting prep research)
- **Classification:** implementation / green / sales

### Existing agent enhancements
- `ap-product-manager` -- add call-to-PRD workflow reference (Zapier #8)
- `ap-content-creator` -- add trending-content-pipeline reference (Zapier #15)

### Integration abstraction
Each skill defines an Input/Output Contract section:
- **Inputs:** What data the skill needs (lead email, call transcript, calendar event)
- **Outputs:** What it produces (email draft, briefing doc, score, enriched profile)
- **External actions (recommended):** Tool-agnostic recommendations (CRM update, send email, notify team)

Agents are the intelligence layer; users or their automation platforms handle integration plumbing.

## Source material analysis (Zapier automations)

| # | Automation | Disposition | Target |
|---|-----------|-------------|--------|
| 1 | ABM email personalization | BUILD | ap-sales-development-rep / lead-research + sales-outreach |
| 2 | Email reply drafts | DISCARD | Generic LLM capability, not domain-specific |
| 3 | Lead capture and follow-up | DISCARD | Pure integration orchestration, no intelligence to codify |
| 4 | Sales lead emails | BUILD | ap-sales-development-rep / lead-research + sales-outreach |
| 5 | Biz dev call briefer | BUILD | ap-account-executive / meeting-intelligence |
| 6 | Call follow-up email | BUILD | ap-account-executive / meeting-intelligence |
| 7 | Call follow-up CRM proposals | REFERENCE | Proposal detection pattern in meeting-intelligence |
| 8 | Customer call to PRD | EXTEND | ap-product-manager enhancement |
| 9 | Enterprise lead qualification | BUILD | ap-sales-development-rep / lead-qualification |
| 10 | Lead background search | BUILD | ap-sales-development-rep / lead-research |
| 11 | Lead enrichment | BUILD | ap-sales-development-rep / lead-research |
| 12 | Sales call analysis | BUILD | ap-account-executive / sales-call-analysis |
| 13 | Sales prep | BUILD | ap-account-executive / meeting-intelligence |
| 14 | Pipeline health monitor | BUILD | ap-account-executive / pipeline-analytics |
| 15 | Viral content creator | EXTEND | ap-content-creator enhancement |

**Summary:** 10 BUILD, 2 EXTEND, 1 REFERENCE, 2 DISCARD.

## Constraints (non-negotiable)

- **Two new agents maximum.** Pipeline analytics and call analysis are skills on ap-account-executive, not a separate ap-sales-manager.
- **No vendor-specific integrations.** All skills use tool-agnostic language (CRM, email, messaging, calendar -- never HubSpot, Gmail, Slack, Google Calendar).
- **Skills are knowledge, not connectors.** Skills teach methodology, frameworks, and templates. They do not execute API calls.
- **All canonical artifacts under `.docs/`** per I01-ACM conventions.
- **Agents follow existing frontmatter schema** per agents/README.md.

## Non-goals

- Building CRM/email/calendar integration connectors or automation scripts.
- Creating a separate ap-sales-manager agent (skills on AE cover this).
- Replacing ap-demand-gen-specialist's marketing acquisition scope.
- Codifying email reply drafting (#2) or lead capture workflows (#3).
- Migrating raw Zapier files as references (content is authored fresh, abstracting patterns).

## Decision rights

- **Charter changes:** Product Director + Engineering Lead.
- **Agent architecture (persona boundaries):** Product Director.
- **Skill content and frameworks:** Implementation owner with domain input.
- **Backlog ordering:** Product Manager.

## Success measures

- Two new agents (`ap-sales-development-rep`, `ap-account-executive`) pass agent validation.
- Six new skills exist under `skills/sales-team/` with SKILL.md content.
- `ap-product-manager` and `ap-content-creator` have updated references.
- All catalog READMEs (agents, skills) are updated.
- No Zapier-specific or vendor-specific integration references in any created content.

## References

- Source material: `~/zapier-agents/` (15 Zapier automation definitions -- external, not committed)
- Expert panel analysis: Conducted 2026-02-11 (brainstormer, researcher, product-director, UX-researcher, use-case-data-analyzer)
- Roadmap: [roadmap-repo-I04-SLSE-sales-enablement-2026.md](../roadmaps/roadmap-repo-I04-SLSE-sales-enablement-2026.md)
- Backlog: [backlog-repo-I04-SLSE-sales-enablement.md](../backlogs/backlog-repo-I04-SLSE-sales-enablement.md)
