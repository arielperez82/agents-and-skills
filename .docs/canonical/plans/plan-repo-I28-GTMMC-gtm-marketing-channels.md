---
type: plan
endeavor: repo
initiative: I28-GTMMC
initiative_name: gtm-marketing-channels
status: draft
created: 2026-03-04
updated: 2026-03-04
---

# Implementation Plan: GTM Marketing Ops & Channels

**Initiative:** I28-GTMMC
**Charter:** `.docs/canonical/charters/charter-repo-I28-GTMMC-gtm-marketing-channels.md`
**Backlog:** `.docs/canonical/backlogs/backlog-repo-I28-GTMMC-gtm-marketing-channels.md`
**Research:** `.docs/reports/researcher-260304-ai-gtm-landscape-2025-2026.md`
**Scope type:** docs-only (all deliverables are markdown files)

---

## Convention Discovery (Pre-Step)

Conventions inherited from I27-GTMSI (same team, same schema). See I27 plan for full schema documentation.

**Reference files (established in I27):**

- Agent frontmatter: `agents/gtm-strategist.md`
- Agent body: `agents/gtm-strategist.md` (Purpose, Skill Integration, Workflows, Examples, Success Metrics, Related Agents, References)
- Skill frontmatter: `skills/marketing-team/icp-modeling/SKILL.md`
- Skill body: `skills/marketing-team/icp-modeling/SKILL.md` (Overview, Core Capabilities, Key Workflows, Best Practices, Reference Guides)

### Integration Checklist (Nth-of-kind)

When adding a new agent:

- [ ] `agents/README.md` -- catalog entry under Marketing section
- [ ] Related agents' `related-agents` frontmatter (bidirectional)
- [ ] Related agents' `collaborates-with` entries (if applicable)

When adding a new skill:

- [ ] Agent frontmatter `skills` and `related-skills` reference it
- [ ] Skill `metadata.related-agents` references consuming agents
- [ ] Reference files exist in `references/` subdirectory

---

## Wave 1: Walking Skeleton (B1 + B2 + B3 + B4) -- Parallel

Proves the ops layer (marketing-ops-manager + lead-scoring) and strategic campaign layer (abm-strategist + abm-strategy). All 4 items are independent.

### Step 1: Create `marketing-ops-manager` agent (B1)

- **Backlog:** I28-GTMMC-B01
- **What:** Create `agents/marketing-ops-manager.md` -- implementation agent for lead scoring, marketing automation, and attribution
- **Files:**
  - Create: `agents/marketing-ops-manager.md`
- **Key decisions:**
  - Classification: type=implementation, color=green, field=marketing, expertise=expert, execution=coordinated, model=sonnet
  - Core skills: `marketing-team/marketing-automation`, `marketing-team/lead-scoring`, `marketing-team/attribution-modeling`
  - Related agents: `demand-gen-specialist`, `gtm-strategist`, `sales-development-rep`
  - Collaborates-with: `demand-gen-specialist` (campaign data handoff), `sales-development-rep` (MQL routing)
  - 4 use-cases: lead scoring model design, marketing automation workflow design, multi-touch attribution modeling, campaign performance analytics
  - 2+ workflows: Lead Scoring Model Setup, Campaign Attribution Analysis
  - 2+ examples with realistic input/output
- **Content sources:** Research report sections 4 (Marketing Ops), 5 (Lead Scoring). Charter US-1 acceptance criteria.
- **Acceptance criteria:**
  - Agent file matches I27 frontmatter schema
  - Body has Purpose (3 paragraphs), Skill Integration, Workflows (2+), Examples (2+), Success Metrics, Related Agents, References
  - Passes `/agent/validate`
- **Dependencies:** None
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 2: Create `lead-scoring` skill (B2)

- **Backlog:** I28-GTMMC-B02
- **What:** Create lead scoring skill with SKILL.md + reference file
- **Files:**
  - Create: `skills/marketing-team/lead-scoring/SKILL.md`
  - Create: `skills/marketing-team/lead-scoring/references/scoring-model-template.md`
- **Key decisions:**
  - domain=marketing, subdomain=lead-scoring
  - related-agents: `marketing-ops-manager`, `sales-development-rep`
  - tags: lead-scoring, mql, sql, pql, scoring-model, lead-qualification
  - No Python scripts (methodology skill)
- **Content coverage (from charter US-2):**
  - MQL/SQL/PQL definitions and transition criteria
  - Scoring model design: demographic + firmographic + behavioral + engagement signals
  - Score decay and recency weighting
  - Threshold-based routing rules (hot/warm/nurture/disqualify)
  - Predictive vs rule-based scoring comparison
  - Reference: scoring model template (weighted criteria)
- **Acceptance criteria:**
  - SKILL.md matches I27 frontmatter schema
  - Body covers all content areas
  - `references/scoring-model-template.md` exists
  - Scope distinct from `icp-modeling` (scoring methodology vs. profile definition)
- **Dependencies:** None
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 3: Create `abm-strategist` agent (B3)

- **Backlog:** I28-GTMMC-B03
- **What:** Create `agents/abm-strategist.md` -- strategic agent for account-based marketing
- **Files:**
  - Create: `agents/abm-strategist.md`
- **Key decisions:**
  - Classification: type=strategic, color=blue, field=marketing, expertise=expert, execution=coordinated, model=sonnet
  - Core skills: `marketing-team/abm-strategy`
  - Related agents: `gtm-strategist`, `demand-gen-specialist`, `sales-development-rep`, `marketing-ops-manager`
  - Collaborates-with: `gtm-strategist` (target account selection from ICP), `sales-development-rep` (ABM outreach execution)
  - 4 use-cases: target account selection, multi-stakeholder engagement mapping, ABM campaign orchestration, intent data analysis
  - 2+ workflows: Target Account Selection, ABM Campaign Launch
  - 2+ examples with realistic input/output
- **Content sources:** Research report section 4 (ABM). Charter US-5 acceptance criteria.
- **Acceptance criteria:**
  - Agent file matches I27 frontmatter schema
  - Body has Purpose, Skill Integration, Workflows (2+), Examples (2+), Success Metrics
  - Passes `/agent/validate`
- **Dependencies:** None
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 4: Create `abm-strategy` skill (B4)

- **Backlog:** I28-GTMMC-B04
- **What:** Create ABM strategy skill with SKILL.md + reference file
- **Files:**
  - Create: `skills/marketing-team/abm-strategy/SKILL.md`
  - Create: `skills/marketing-team/abm-strategy/references/account-tier-template.md`
- **Key decisions:**
  - domain=marketing, subdomain=abm-strategy
  - related-agents: `abm-strategist`, `demand-gen-specialist`
  - tags: abm, account-based-marketing, intent-data, account-scoring, account-penetration
  - No Python scripts (methodology skill)
- **Content coverage (from charter US-6):**
  - ABM tiers: 1:1 strategic, 1:few cluster, 1:many programmatic
  - Target account selection criteria and account scoring
  - Intent data sources and signals (Bombora, G2, 6sense)
  - Multi-stakeholder engagement mapping
  - ABM metrics: account penetration, engagement score, pipeline influence
  - Differentiation from traditional demand gen (account-centric vs lead-centric)
  - Reference: account tier template
- **Acceptance criteria:**
  - SKILL.md matches I27 frontmatter schema
  - Body covers all content areas
  - `references/account-tier-template.md` exists
- **Dependencies:** None
- **Execution mode:** Solo
- **Agent:** Direct execution

**Wave 1 exit criteria:** All 4 files created. B1 references B2 skill. B3 references B4 skill. Walking skeleton proves both ops and strategic campaign layers. All pass `/agent/validate`.

---

## Wave 2: Remaining Core Skills (B5 + B6) -- Parallel

Completes the marketing-ops-manager's core skill triad. Depends on Wave 1 (B1 references these skills).

### Step 5: Create `marketing-automation` skill (B5)

- **Backlog:** I28-GTMMC-B05
- **What:** Create marketing automation skill with SKILL.md + reference file
- **Files:**
  - Create: `skills/marketing-team/marketing-automation/SKILL.md`
  - Create: `skills/marketing-team/marketing-automation/references/workflow-template.md`
- **Key decisions:**
  - domain=marketing, subdomain=marketing-automation
  - related-agents: `marketing-ops-manager`, `email-marketing-specialist`
  - tags: marketing-automation, nurture, drip-campaigns, workflow, segmentation
  - No Python scripts (methodology skill)
- **Content coverage (from charter US-3):**
  - Nurture workflow patterns: drip campaigns, trigger-based, lifecycle
  - Segmentation strategies
  - Workflow logic: if/then branching, time delays, conditional sends
  - Tool-agnostic patterns (applicable to HubSpot, Marketo, Customer.io)
  - Campaign orchestration framework (multi-channel coordination)
  - Reference: workflow template
- **Acceptance criteria:**
  - SKILL.md matches I27 frontmatter schema
  - Body covers all content areas
  - `references/workflow-template.md` exists
  - Scope distinct from `marketing-demand-acquisition` (workflow design vs. channel optimization)
- **Dependencies:** Wave 1 complete
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 6: Create `attribution-modeling` skill (B6)

- **Backlog:** I28-GTMMC-B06
- **What:** Create attribution modeling skill with SKILL.md + reference file
- **Files:**
  - Create: `skills/marketing-team/attribution-modeling/SKILL.md`
  - Create: `skills/marketing-team/attribution-modeling/references/attribution-model-selection-guide.md`
- **Key decisions:**
  - domain=marketing, subdomain=attribution-modeling
  - related-agents: `marketing-ops-manager`, `demand-gen-specialist`
  - tags: attribution, multi-touch, first-touch, last-touch, b2b-attribution, marketing-measurement
  - No Python scripts (methodology skill)
- **Content coverage (from charter US-4):**
  - Models: first-touch, last-touch, linear, time-decay, position-based, W-shaped with pros/cons
  - B2B attribution challenges: long sales cycles, multiple stakeholders, dark social
  - Self-reported attribution as complement to software attribution
  - Reference: attribution model selection guide
- **Acceptance criteria:**
  - SKILL.md matches I27 frontmatter schema
  - Body covers all content areas
  - `references/attribution-model-selection-guide.md` exists
- **Dependencies:** Wave 1 complete
- **Execution mode:** Solo
- **Agent:** Direct execution

**Wave 2 exit criteria:** Both skills created. marketing-ops-manager now has all 3 core skills available. All pass validation.

---

## Wave 3: Channel Agents & Skills (B7 + B8 + B9 + B10 + B11 + B12) -- Parallel

Should-Have channel-specific agents and their paired skills. All 6 items are independent within wave. Depends on Wave 1 (cross-references to marketing-ops-manager).

### Step 7: Create `linkedin-strategist` agent (B7)

- **Backlog:** I28-GTMMC-B07
- **What:** Create `agents/linkedin-strategist.md` -- implementation agent for LinkedIn strategy
- **Files:**
  - Create: `agents/linkedin-strategist.md`
- **Key decisions:**
  - Classification: type=implementation, color=green, field=marketing, expertise=advanced, execution=autonomous, model=haiku
  - Core skills: `marketing-team/linkedin-strategy`
  - Related agents: `content-creator`, `sales-development-rep`
  - 4 use-cases: LinkedIn organic content, LinkedIn Ads, Sales Navigator, employee advocacy
  - 2+ workflows: Thought Leadership Content, LinkedIn Ads Campaign
- **Content sources:** Research report section 6 (LinkedIn). Charter US-7.
- **Acceptance criteria:**
  - Agent file matches I27 frontmatter schema
  - Passes `/agent/validate`
- **Dependencies:** Wave 1 complete
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 8: Create `linkedin-strategy` skill (B8)

- **Backlog:** I28-GTMMC-B08
- **What:** Create LinkedIn strategy skill with SKILL.md + reference file
- **Files:**
  - Create: `skills/marketing-team/linkedin-strategy/SKILL.md`
  - Create: `skills/marketing-team/linkedin-strategy/references/content-calendar-template.md`
- **Content coverage (from charter US-8):**
  - Organic: post formats, carousel vs text vs video, hashtag strategy, algorithm signals
  - LinkedIn Ads: Sponsored Content, Message Ads, Dynamic Ads, targeting, bidding
  - Sales Navigator: search filters, lead lists, InMail best practices
  - Employee advocacy: guidelines, content library, amplification
  - Automation risks and ToS compliance
- **Dependencies:** Wave 1 complete
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 9: Create `email-marketing-specialist` agent (B9)

- **Backlog:** I28-GTMMC-B09
- **What:** Create `agents/email-marketing-specialist.md` -- implementation agent for email marketing
- **Files:**
  - Create: `agents/email-marketing-specialist.md`
- **Key decisions:**
  - Classification: type=implementation, color=green, field=marketing, expertise=advanced, execution=autonomous, model=haiku
  - Core skills: `marketing-team/email-sequences`
  - Related agents: `marketing-ops-manager`, `sales-development-rep`, `copywriter`
  - Differentiation from SDR: this agent does lifecycle/nurture/marketing emails; SDR does cold outreach
  - 2+ workflows: Welcome Sequence Design, Re-engagement Campaign
- **Content sources:** Research report section 6 (Email). Charter US-9.
- **Dependencies:** Wave 1 complete
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 10: Create `email-sequences` skill (B10)

- **Backlog:** I28-GTMMC-B10
- **What:** Create email sequences skill with SKILL.md + reference file
- **Files:**
  - Create: `skills/marketing-team/email-sequences/SKILL.md`
  - Create: `skills/marketing-team/email-sequences/references/sequence-template.md`
- **Content coverage (from charter US-10):**
  - Sequence types: welcome, nurture, re-engagement, renewal, event-triggered
  - Email copy patterns: subject lines, preview text, body structure, CTAs
  - Deliverability: SPF, DKIM, DMARC, warm-up, sender reputation
  - Segmentation strategies, A/B testing methodology
  - Key metrics: open rate, CTR, conversion, unsubscribe, bounce
- **Dependencies:** Wave 1 complete
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 11: Create `aeo-geo-strategist` agent (B11)

- **Backlog:** I28-GTMMC-B11
- **What:** Create `agents/aeo-geo-strategist.md` -- strategic agent for AI answer engine optimization
- **Files:**
  - Create: `agents/aeo-geo-strategist.md`
- **Key decisions:**
  - Classification: type=strategic, color=blue, field=marketing, expertise=expert, execution=coordinated, model=sonnet
  - Core skills: `marketing-team/aeo-geo-optimization`
  - Related agents: `seo-strategist`, `content-creator`
  - Collaborates-with: `seo-strategist` (traditional SEO handoff), `content-creator` (content optimization handoff)
  - 4 use-cases: AEO for AI search engines, GEO for broader AI citation, structured data strategy, AI-citation monitoring
  - 2+ workflows: AEO Content Audit, GEO Entity Optimization
- **Content sources:** Research report section 6 (AEO/GEO). Charter US-11.
- **Dependencies:** Wave 1 complete
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 12: Create `aeo-geo-optimization` skill (B12)

- **Backlog:** I28-GTMMC-B12
- **What:** Create AEO/GEO optimization skill with SKILL.md + reference file
- **Files:**
  - Create: `skills/marketing-team/aeo-geo-optimization/SKILL.md`
  - Create: `skills/marketing-team/aeo-geo-optimization/references/aeo-geo-audit-checklist.md`
- **Content coverage (from charter US-12):**
  - AEO: FAQ schema, HowTo schema, direct answer formatting (40-60 words), citation-worthy content, AI search engine behavior
  - GEO: entity optimization, knowledge panel signals, unique data/research, authoritative sourcing, brand mention monitoring
  - Differentiation from traditional SEO
- **Dependencies:** Wave 1 complete
- **Execution mode:** Solo
- **Agent:** Direct execution

**Wave 3 exit criteria:** All 6 files created. Each agent references its paired skill. All pass validation.

---

## Wave 4: Integration (B13 + B14 + B15) -- Sequential

Cross-reference wiring, catalog update, final validation. Depends on Waves 1-3.

### Step 13: Update existing agents with cross-references (B13)

- **Backlog:** I28-GTMMC-B13
- **What:** Update 3 existing agents' frontmatter to reference new agents
- **Files:**
  - Modify: `agents/demand-gen-specialist.md`
  - Modify: `agents/content-creator.md`
  - Modify: `agents/seo-strategist.md`
- **Changes:**
  - **`demand-gen-specialist`:** Add `marketing-ops-manager`, `abm-strategist` to `related-agents`
  - **`content-creator`:** Add `linkedin-strategist`, `aeo-geo-strategist` to `related-agents`
  - **`seo-strategist`:** Add `aeo-geo-strategist` to `related-agents`
- **Acceptance criteria:**
  - All 3 agents have updated frontmatter
  - No existing fields removed or broken
  - All 3 pass `/agent/validate`
- **Dependencies:** Waves 1-3 complete
- **Execution mode:** Parallel (3 sub-edits are independent)
- **Agent:** Direct execution

### Step 14: Update `agents/README.md` (B14)

- **Backlog:** I28-GTMMC-B14
- **What:** Add 5 new agent entries to the agent catalog
- **Files:**
  - Modify: `agents/README.md`
- **Changes:** Add under Marketing section:
  - `marketing-ops-manager` -- Marketing ops for lead scoring, automation workflows, and attribution modeling
  - `abm-strategist` -- ABM strategy for account selection, tiering, and campaign orchestration
  - `linkedin-strategist` -- LinkedIn strategy for organic content, ads, and Sales Navigator
  - `email-marketing-specialist` -- Email marketing for sequences, deliverability, and lifecycle campaigns
  - `aeo-geo-strategist` -- AEO/GEO optimization for AI search engines and generative search citation
- **Acceptance criteria:**
  - All 5 entries present under Marketing section
  - Format matches existing entries
- **Dependencies:** Step 13 complete
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 15: Final validation gate (B15)

- **Backlog:** I28-GTMMC-B15
- **What:** Run `/agent/validate` on all 8 new/modified agents
- **Validation targets:**
  - New: `marketing-ops-manager`, `abm-strategist`, `linkedin-strategist`, `email-marketing-specialist`, `aeo-geo-strategist`
  - Modified: `demand-gen-specialist`, `content-creator`, `seo-strategist`
- **Acceptance criteria:**
  - All 8 agents pass `/agent/validate` with zero errors
  - Maps to SC-9 from charter
- **Dependencies:** Step 14 complete
- **Execution mode:** Solo
- **Agent:** `agent-validator`

**Wave 4 exit criteria:** Agent graph fully connected. README updated. All 8 agents pass validation (SC-9). Charter success criteria SC-1 through SC-9 satisfied.

---

## Success Criteria Traceability

| SC | Criterion | Plan Step |
|----|-----------|-----------|
| SC-1 | `marketing-ops-manager` exists + validates | B1, B15 |
| SC-2 | `abm-strategist` exists + validates | B3, B15 |
| SC-3 | `linkedin-strategist` exists + validates | B7, B15 |
| SC-4 | `email-marketing-specialist` exists + validates | B9, B15 |
| SC-5 | `aeo-geo-strategist` exists + validates | B11, B15 |
| SC-6 | All 6 new skills have SKILL.md + references | B2, B4, B5, B6, B8, B10, B12 |
| SC-7 | Existing agents updated with cross-refs | B13 |
| SC-8 | README updated with 5 entries | B14 |
| SC-9 | All 8 agents pass validation | B15 |

---

## Execution Recommendation

- **Method:** Direct execution (docs-only, Light complexity)
- **Rationale:** 15 tasks across 4 waves. Waves 1 (4 items), 2 (2 items), and 3 (6 items) can each be parallelized internally. Wave 4 is sequential. All tasks follow established I27 conventions -- no novel decisions needed.
- **Cost tier notes:**
  - B1-B12 (agent/skill authoring): T2 -- pattern-following work using I27 conventions
  - B13 (cross-ref edits): T1 -- mechanical frontmatter edits
  - B14 (README update): T1 -- mechanical catalog entries
  - B15 (validation): T1 -- run existing validation script
- **Estimated effort:** ~15 items, all docs-only. With parallel execution, completable in 4 sequential batches (one per wave).
