---
type: backlog
endeavor: repo
initiative: I28-GTMMC
initiative_name: gtm-marketing-channels
status: todo
updated: 2026-03-04
---

# Backlog: GTM Marketing Ops & Channels

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by wave, charter outcome, and dependency. Implementers pull from here; execution is planned in the plan doc.

## Architecture Summary

This is a docs-only initiative. All deliverables are markdown files -- no code, no scripts, no deployments.

**Component structure:**
- 5 new agent files (`agents/*.md`)
- 6 new skill directories (`skills/marketing-team/*/SKILL.md` + `references/`)
- Cross-reference updates to 3 existing agents
- 1 README update

**Interface contracts:**
- Agent frontmatter schema: see `agents/gtm-strategist.md` (I27 agent, same team)
- Skill frontmatter schema: see `skills/marketing-team/icp-modeling/SKILL.md` (I27 skill, same team)

**Scope boundaries (risk mitigations from charter):**
- `marketing-automation` = workflow design & automation logic (nurture, drip, trigger-based). Distinct from `marketing-demand-acquisition` which covers campaign strategy & channel optimization.
- `lead-scoring` = scoring model design (MQL/SQL/PQL, demographic + behavioral signals). Distinct from `icp-modeling` (I27) which covers ICP profiling methodology.
- `attribution-modeling` = multi-touch attribution models & measurement. Distinct from `marketing-demand-acquisition` which covers acquisition channels.
- `linkedin-strategy` = LinkedIn organic + paid playbooks. Distinct from `content-creator` which covers cross-platform content strategy.
- `email-sequences` = email sequence design & deliverability. Distinct from `copywriter` which writes the actual copy.
- `aeo-geo-optimization` = AI answer engine optimization. Distinct from `seo-strategist` agent which covers traditional SEO.
- `email-marketing-specialist` agent = lifecycle/nurture/marketing emails. Distinct from `sales-development-rep` which does cold outreach.

## Changes (ranked)

Full ID prefix for this initiative: **I28-GTMMC**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I28-GTMMC-B01, I28-GTMMC-B02, etc.

### Wave 1: Walking Skeleton

Proves the ops layer (marketing-ops-manager + lead-scoring) and strategic campaign layer (abm-strategist + abm-strategy). All 4 items can be parallelized.

| ID | Change | US | Complexity | Parallel | Status |
|----|--------|----|------------|----------|--------|
| B1 | Create `agents/marketing-ops-manager.md` -- implementation agent (type=implementation, color=green, model=sonnet). Core skills: `marketing-team/marketing-automation`, `marketing-team/lead-scoring`, `marketing-team/attribution-modeling`. Related agents: `demand-gen-specialist`, `gtm-strategist`, `sales-development-rep`. Collaborates-with: `demand-gen-specialist` (campaign data handoff), `sales-development-rep` (MQL routing). Purpose: lead scoring (MQL/SQL/PQL), marketing automation workflow design, multi-touch attribution modeling, campaign performance analytics, CRM integration guidance. 2+ workflows (Lead Scoring Model Setup, Campaign Attribution Analysis). Must pass `/agent/validate`. | US-1 | moderate | yes (W1) | todo |
| B2 | Create `skills/marketing-team/lead-scoring/SKILL.md` + `references/scoring-model-template.md`. Covers: MQL/SQL/PQL definitions and transition criteria, scoring model design (demographic + firmographic + behavioral + engagement signals), score decay and recency weighting, threshold-based routing rules (hot/warm/nurture/disqualify), predictive vs rule-based scoring comparison. Related-agents: `marketing-ops-manager`, `sales-development-rep`. | US-2 | moderate | yes (W1) | todo |
| B3 | Create `agents/abm-strategist.md` -- strategic agent (type=strategic, color=blue, model=sonnet). Core skills: `marketing-team/abm-strategy`. Related agents: `gtm-strategist`, `demand-gen-specialist`, `sales-development-rep`, `marketing-ops-manager`. Collaborates-with: `gtm-strategist` (target account selection from ICP), `sales-development-rep` (ABM outreach execution). Purpose: target account selection and tiering, multi-stakeholder engagement mapping, ABM campaign orchestration (1:1, 1:few, 1:many), intent data analysis, account penetration tracking. 2+ workflows (Target Account Selection, ABM Campaign Launch). Must pass `/agent/validate`. | US-5 | moderate | yes (W1) | todo |
| B4 | Create `skills/marketing-team/abm-strategy/SKILL.md` + `references/account-tier-template.md`. Covers: ABM tiers (1:1 strategic, 1:few cluster, 1:many programmatic), target account selection criteria, account scoring, intent data sources and signals (Bombora, G2, 6sense), multi-stakeholder engagement mapping, ABM metrics (account penetration, engagement score, pipeline influence). Differentiates ABM from traditional demand gen (account-centric vs lead-centric). Related-agents: `abm-strategist`, `demand-gen-specialist`. | US-6 | moderate | yes (W1) | todo |

**Wave 1 acceptance:** B1 agent references B2 skill (lead-scoring). B3 agent references B4 skill (abm-strategy). Walking skeleton proves both ops and strategic campaign layers. All 4 pass `/agent/validate`.

### Wave 2: Remaining Core Skills

Remaining Must-Have skills that complete the marketing-ops-manager's skill set. Both items can be parallelized. Depends on Wave 1 completion (B1 references these skills).

| ID | Change | US | Complexity | Parallel | Status |
|----|--------|----|------------|----------|--------|
| B5 | Create `skills/marketing-team/marketing-automation/SKILL.md` + `references/workflow-template.md`. Covers: nurture workflow patterns (drip campaigns, trigger-based, lifecycle), segmentation strategies, workflow logic (if/then branching, time delays, conditional sends), tool-agnostic patterns (applicable to HubSpot, Marketo, Customer.io), campaign orchestration framework (multi-channel coordination). Related-agents: `marketing-ops-manager`, `email-marketing-specialist`. | US-3 | moderate | yes (W2) | todo |
| B6 | Create `skills/marketing-team/attribution-modeling/SKILL.md` + `references/attribution-model-selection-guide.md`. Covers: first-touch, last-touch, linear, time-decay, position-based, W-shaped models with pros/cons for each. B2B attribution challenges (long sales cycles, multiple stakeholders, dark social). Self-reported attribution as complement to software attribution. Related-agents: `marketing-ops-manager`, `demand-gen-specialist`. | US-4 | moderate | yes (W2) | todo |

**Wave 2 acceptance:** B5 and B6 complete marketing-ops-manager's core skill triad (lead-scoring + marketing-automation + attribution-modeling). All pass validation.

### Wave 3: Channel Agents & Skills

Should-Have channel-specific agents and their skills. All 6 items can be parallelized within wave. Depends on Wave 1 (cross-references to marketing-ops-manager).

| ID | Change | US | Complexity | Parallel | Status |
|----|--------|----|------------|----------|--------|
| B7 | Create `agents/linkedin-strategist.md` -- implementation agent (type=implementation, color=green, model=haiku). Core skills: `marketing-team/linkedin-strategy`. Related agents: `content-creator`, `sales-development-rep`. Purpose: LinkedIn organic content strategy, LinkedIn Ads campaigns, Sales Navigator workflows, employee advocacy programs, social selling cadences. 2+ workflows (Thought Leadership Content, LinkedIn Ads Campaign). Must pass `/agent/validate`. | US-7 | moderate | yes (W3) | todo |
| B8 | Create `skills/marketing-team/linkedin-strategy/SKILL.md` + `references/content-calendar-template.md`. Covers: organic content (post formats, carousel vs text vs video, optimal length, hashtag strategy, engagement tactics, algorithm signals), LinkedIn Ads (Sponsored Content, Message Ads, Dynamic Ads, targeting options, bidding strategies), Sales Navigator (search filters, lead lists, InMail best practices), employee advocacy (guidelines, content library, amplification). LinkedIn automation risks and ToS compliance. | US-8 | moderate | yes (W3) | todo |
| B9 | Create `agents/email-marketing-specialist.md` -- implementation agent (type=implementation, color=green, model=haiku). Core skills: `marketing-team/email-sequences`. Related agents: `marketing-ops-manager`, `sales-development-rep`, `copywriter`. Purpose: email sequence design, deliverability management, email warm-up, segmentation, A/B testing, lifecycle email (onboarding, re-engagement, renewal). Differentiates from `sales-development-rep` (SDR does cold outreach; this agent does lifecycle/nurture/marketing emails). Must pass `/agent/validate`. | US-9 | moderate | yes (W3) | todo |
| B10 | Create `skills/marketing-team/email-sequences/SKILL.md` + `references/sequence-template.md`. Covers: sequence types (welcome, nurture, re-engagement, renewal, event-triggered), email copy patterns (subject lines, preview text, body structure, CTAs), deliverability (SPF, DKIM, DMARC, warm-up, sender reputation), segmentation strategies, A/B testing methodology, key metrics (open rate, CTR, conversion, unsubscribe, bounce). | US-10 | moderate | yes (W3) | todo |
| B11 | Create `agents/aeo-geo-strategist.md` -- strategic agent (type=strategic, color=blue, model=sonnet). Core skills: `marketing-team/aeo-geo-optimization`. Related agents: `seo-strategist`, `content-creator`. Collaborates-with: `seo-strategist` (traditional SEO handoff), `content-creator` (content optimization handoff). Purpose: AEO (Answer Engine Optimization for Perplexity, ChatGPT Search, Google AI Overviews), GEO (Generative Engine Optimization for broader AI citation), structured data strategy, AI-citation monitoring. Must pass `/agent/validate`. | US-11 | moderate | yes (W3) | todo |
| B12 | Create `skills/marketing-team/aeo-geo-optimization/SKILL.md` + `references/aeo-geo-audit-checklist.md`. Covers AEO: FAQ schema, HowTo schema, direct answer formatting (40-60 word concise answers), citation-worthy content patterns, AI search engine behavior. Covers GEO: entity optimization, knowledge panel signals, unique data/research, authoritative sourcing, brand mention monitoring. Differentiates from traditional SEO. | US-12 | moderate | yes (W3) | todo |

**Wave 3 acceptance:** All 3 channel agent-skill pairs created. Each agent references its skill. All pass validation.

### Wave 4: Integration

Cross-reference wiring and catalog updates. B13 depends on Waves 1-3 (needs new agent names to reference). B14 depends on B13 (README should reflect final state). B13 sub-edits can be parallelized internally.

| ID | Change | US | Complexity | Parallel | Status |
|----|--------|----|------------|----------|--------|
| B13 | Update 3 existing agents with cross-references. (a) `demand-gen-specialist`: add `marketing-ops-manager`, `abm-strategist` to `related-agents`. (b) `content-creator`: add `linkedin-strategist`, `aeo-geo-strategist` to `related-agents`. (c) `seo-strategist`: add `aeo-geo-strategist` to `related-agents`. All 3 must still pass `/agent/validate`. | US-13 | simple | yes (W4, 3 sub-edits) | todo |
| B14 | Update `agents/README.md` with 5 new agent entries: `marketing-ops-manager`, `abm-strategist`, `linkedin-strategist`, `email-marketing-specialist`, `aeo-geo-strategist`. Follow existing format. | US-14 | trivial | no (after B13) | todo |
| B15 | Run `/agent/validate` on all 8 modified/new agents as final quality gate (SC-9). | SC-9 | trivial | no (after B14) | todo |

**Wave 4 acceptance:** Agent graph fully connected. README updated. All 8 agents pass validation (SC-9).

## Backlog item lens (per charter)

- **Charter outcome:** Mapped via US references in table.
- **Value/impact:** Wave 1 proves architecture (walking skeleton); Wave 2 completes ops core; Wave 3 adds channel execution; Wave 4 ensures discoverability.
- **Design/UX:** N/A (internal tooling).
- **Engineering:** Agent frontmatter + body authoring, skill SKILL.md authoring, reference file creation.
- **Security/privacy:** N/A.
- **Observability:** N/A.
- **Rollout/comms:** Update agents/README.md when complete. I29-GTMSO depends on this initiative.
- **Acceptance criteria:** Per charter US acceptance criteria and SC-1 through SC-9.
- **Definition of done:** All changes merged; all 8 agents pass `/agent/validate`; no scope overlap with existing skills.

## Links

- Charter: [charter-repo-I28-GTMMC-gtm-marketing-channels.md](../charters/charter-repo-I28-GTMMC-gtm-marketing-channels.md)
- Roadmap: [roadmap-repo.md](../roadmaps/roadmap-repo.md)
- Research: [researcher-260304-ai-gtm-landscape-2025-2026.md](../../reports/researcher-260304-ai-gtm-landscape-2025-2026.md)
- I27 Backlog (pattern): [backlog-repo-I27-GTMSI-gtm-strategy-intelligence.md](backlog-repo-I27-GTMSI-gtm-strategy-intelligence.md)
