---
type: plan
endeavor: repo
initiative: I27-GTMSI
initiative_name: gtm-strategy-intelligence
status: draft
created: 2026-03-04
updated: 2026-03-04
---

# Implementation Plan: GTM Strategy & Intelligence Layer

**Initiative:** I27-GTMSI
**Charter:** `.docs/canonical/charters/charter-repo-I27-GTMSI-gtm-strategy-intelligence.md`
**Backlog:** `.docs/canonical/backlogs/backlog-repo-I27-GTMSI-gtm-strategy-intelligence.md`
**Research:** `.docs/reports/researcher-260304-ai-gtm-landscape-2025-2026.md`
**Scope type:** docs-only (all deliverables are markdown files)

---

## Convention Discovery (Pre-Step)

Analyzed reference files to extract conventions. All new agents/skills must match these exactly.

### Agent Frontmatter Schema (from `agents/product-marketer.md`, `agents/content-creator.md`, `agents/sales-development-rep.md`)

```yaml
# === CORE IDENTITY ===
name: kebab-case
title: Human Readable Title
description: One-line description
domain: marketing | sales
subdomain: specific-area
skills: team/skill-name  # or list of skills

# === USE CASES ===
difficulty: advanced | intermediate
use-cases: [list of 3-4 use cases]

# === AGENT CLASSIFICATION ===
classification:
  type: strategic | implementation
  color: blue | green
  field: marketing | sales
  expertise: expert | advanced
  execution: coordinated | autonomous
  model: sonnet | haiku

# === RELATIONSHIPS ===
related-agents: [list]
related-skills: [team/skill-name list]
related-commands: [list]
collaborates-with:  # optional, structured entries
  - agent: name
    purpose: description
    required: optional | required
    without-collaborator: "fallback behavior"

# === TECHNICAL ===
tools: [Read, Write, Bash, Grep, Glob]
dependencies:
  tools: [Read, Write, Bash, Grep, Glob]
  mcp-tools: []
  scripts: []

# === EXAMPLES ===
examples:
  - title: "Title"
    input: "realistic input"
    output: "realistic output"
```

### Agent Body Structure

1. `# Agent Name Agent` (H1)
2. `## Purpose` -- 3 paragraphs: what it does, who it's for, how it bridges a gap
3. `## Skill Integration` -- skill location, Python tools, knowledge bases, templates
4. `## Workflows` -- 2+ workflows with Goal, Steps (numbered with bash examples), Expected Output, Time Estimate, Example
5. `## Integration Examples` (optional) -- bash script examples
6. `## Success Metrics` -- categorized metrics with targets
7. `## Related Agents` -- markdown links with descriptions
8. `## References` -- skill docs, domain guides, agent dev guide
9. Footer: Last Updated, Status, Version

### Skill Frontmatter Schema (from `skills/marketing-team/marketing-strategy-pmm/SKILL.md`)

```yaml
name: skill-name
description: Multi-line description with trigger phrases
license: MIT
metadata:
  author: Claude Skills Team
  compatibility: {python-version, platforms}
  contributors: []
  created: date
  dependencies: {scripts: [], references: [], assets: []}
  difficulty: intermediate | advanced
  domain: marketing
  examples: [{title, input, output}]
  featured: false
  frequency: usage estimate
  orchestrated-by: []
  related-agents: [agent-name list]
  related-commands: []
  related-skills: []
  stats: {downloads: 0, stars: 0, rating: 0.0, reviews: 0}
  subdomain: specific-area
  tags: [list]
  tech-stack: [list]
  time-saved: estimate
  title: Human Readable Title
  updated: date
  use-cases: [list]
  verified: true
  version: v1.0.0
```

### Skill Body Structure

1. `# Skill Title` (H1)
2. `## Overview` -- what it provides, who it's for, core value
3. `## Core Capabilities` -- bullet list
4. `## Role Coverage` (optional) -- who uses it
5. `## Quick Start`
6. `## Key Workflows` -- numbered workflows with steps
7. `## Python Tools` (or note why none)
8. `## Best Practices` -- categorized tips
9. `## Performance Benchmarks` (optional)
10. `## Reference Guides` -- when to use each reference
11. `## Integration`
12. `## Additional Resources`
13. Footer: Last Updated, Version

### Integration Checklist (Nth-of-kind)

When adding a new agent, ensure it's referenced in:
- [ ] `agents/README.md` -- catalog entry under Marketing section
- [ ] Related agents' `related-agents` frontmatter (bidirectional)
- [ ] Related agents' `collaborates-with` entries (if applicable)
- [ ] Any commands that reference the agent
- [ ] `skills/README.md` if new skills added (check if marketing-team section exists)

When adding a new skill:
- [ ] Agent frontmatter `skills` and `related-skills` fields reference it
- [ ] Skill `metadata.related-agents` references consuming agents
- [ ] `skills/marketing-team/CLAUDE.md` updated if significant
- [ ] Reference files exist in `references/` subdirectory

---

## Wave 1: Walking Skeleton (B1 + B2 + B3) -- Parallel

Proves agent-skill wiring and resolves dangling command refs. All 3 items are independent.

### Step 1: Create `gtm-strategist` agent (B1)

- **Backlog:** I27-GTMSI-B01
- **What:** Create `agents/gtm-strategist.md` -- strategic agent for ICP definition, TAM/SAM/SOM analysis, market segmentation, niche market strategy
- **Files:**
  - Create: `agents/gtm-strategist.md`
- **Key decisions:**
  - Classification: type=strategic, color=blue, field=marketing, expertise=expert, execution=coordinated, model=sonnet
  - Core skills: `marketing-team/icp-modeling`, `marketing-team/niche-market-strategy`
  - Related skills: `marketing-team/marketing-strategy-pmm`
  - Related agents: `product-marketer`, `competitive-intelligence-analyst`
  - Collaborates-with: `product-marketer` (positioning handoff), `sales-development-rep` (ICP handoff)
  - 4 use-cases: ICP definition, TAM/SAM/SOM analysis, market segmentation, niche market entry strategy
  - 2+ workflows: ICP Definition, Market Segmentation
  - 2+ examples with realistic input/output (e.g. "Define ICP for developer tool company" -> firmographic + technographic + behavioral profile)
- **Content sources:** Research report sections 2 (GTM Strategy), 10 (Gap Analysis -- gtm-strategist row). Charter US-1 acceptance criteria. Algolia PLG+DevRel model from research section 2.
- **Acceptance criteria:**
  - Agent file matches frontmatter schema from convention discovery
  - Body has Purpose (3 paragraphs), Skill Integration, Workflows (2+), Examples (2+), Success Metrics, Related Agents, References
  - Passes `/agent/validate`
- **Dependencies:** None
- **Execution mode:** Solo
- **Agent:** Direct execution or `agent-author`

### Step 2: Create `icp-modeling` skill (B2)

- **Backlog:** I27-GTMSI-B02
- **What:** Create ICP modeling skill with SKILL.md + reference file
- **Files:**
  - Create: `skills/marketing-team/icp-modeling/SKILL.md`
  - Create: `skills/marketing-team/icp-modeling/references/icp-scoring-template.md`
- **Key decisions:**
  - domain=marketing, subdomain=icp-modeling
  - related-agents: `gtm-strategist`, `sales-development-rep`
  - tags: icp, ideal-customer-profile, lead-scoring, firmographics, enrichment
  - No Python scripts (methodology skill)
- **Content coverage (from charter US-2):**
  - Firmographic criteria (company size, industry, revenue, geography)
  - Technographic criteria (tech stack, tools)
  - Behavioral criteria (buying signals, engagement patterns)
  - Psychographic criteria (pain points, priorities)
  - Clay waterfall enrichment pattern (from research section 9)
  - Closed-won pattern analysis methodology
  - Scoring model template (weighted criteria, 0-100 composite) -- goes in references/
- **Content sources:** Research report sections 2 (ICP Definition), 9 (Clay Waterfall). Charter US-2. Existing `marketing-strategy-pmm` ICP section for scope differentiation (this skill goes deeper on profiling methodology; that skill covers positioning).
- **Acceptance criteria:**
  - SKILL.md matches frontmatter schema
  - Body has Overview, Core Capabilities, Key Workflows, Best Practices, Reference Guides
  - `references/icp-scoring-template.md` exists with weighted scoring model
  - Scope distinct from `marketing-strategy-pmm` (profiling methodology vs. positioning)
- **Dependencies:** None
- **Execution mode:** Solo
- **Agent:** Direct execution or `agent-author`

### Step 3: Create `copywriter` agent (B3)

- **Backlog:** I27-GTMSI-B03
- **What:** Create `agents/copywriter.md` -- execution agent that resolves 4 dangling command references
- **Files:**
  - Create: `agents/copywriter.md`
- **Key decisions:**
  - Classification: type=implementation, color=green, field=marketing, expertise=advanced, execution=autonomous, model=haiku
  - Core skills: `marketing-team/content-creator` (existing skill)
  - Related skills: `marketing-team/page-cro`, `marketing-team/marketing-psychology`
  - Related agents: `content-creator`
  - Related commands: `/content/cro`, `/content/enhance`, `/content/fast`, `/content/good`
  - Differentiation from `content-creator`: copywriter = execution agent (writes actual copy); content-creator = strategy agent (plans content, analyzes brand voice, optimizes SEO)
  - 2+ examples with realistic copy input/output (e.g. "Write CRO landing page hero" -> actual copy snippet)
- **Content sources:** Charter US-6. Commands `commands/content/cro.md`, `commands/content/enhance.md`, `commands/content/fast.md`, `commands/content/good.md` for understanding how commands invoke the agent.
- **Acceptance criteria:**
  - Agent file matches frontmatter schema
  - Body differentiates from `content-creator` in Purpose section
  - `related-commands` lists all 4 content commands
  - Passes `/agent/validate`
- **Dependencies:** None
- **Execution mode:** Solo
- **Agent:** Direct execution or `agent-author`

**Wave 1 exit criteria:** All 3 files created. B1 agent references B2 skill paths. B3 resolves 4 dangling command refs. All pass `/agent/validate`.

---

## Wave 2: Remaining Core (B4 + B5 + B6) -- Parallel

Completes the remaining agents and skills. Depends on Wave 1 (B5 references `gtm-strategist` which must exist; B4 is consumed by `gtm-strategist`).

### Step 4: Create `niche-market-strategy` skill (B4)

- **Backlog:** I27-GTMSI-B04
- **What:** Create niche market strategy skill with SKILL.md + reference file
- **Files:**
  - Create: `skills/marketing-team/niche-market-strategy/SKILL.md`
  - Create: `skills/marketing-team/niche-market-strategy/references/niche-market-evaluation-template.md`
- **Key decisions:**
  - domain=marketing, subdomain=niche-market-strategy
  - related-agents: `gtm-strategist`, `product-marketer`
  - tags: niche-market, plg, devrel, beachhead, market-entry, tam-sam-som
  - No Python scripts (methodology skill)
- **Content coverage (from charter US-3):**
  - Algolia-style PLG + DevRel model: free tier adoption, developer docs, API-first, community, bottom-up expansion (from research section 2)
  - Niche market identification: TAM/SAM/SOM sizing, segment analysis, beachhead strategy
  - 2+ market entry patterns beyond PLG: community-led growth, vertical SaaS, channel partnerships
  - Reference: niche market evaluation template (scoring framework for market attractiveness)
- **Acceptance criteria:**
  - SKILL.md matches frontmatter schema
  - Covers PLG+DevRel, TAM/SAM/SOM, 2+ additional market entry patterns
  - `references/niche-market-evaluation-template.md` exists
  - Scope distinct from `marketing-strategy-pmm` (market entry patterns vs. GTM execution)
- **Dependencies:** Wave 1 complete (B1 `gtm-strategist` references this skill)
- **Execution mode:** Solo
- **Agent:** Direct execution or `agent-author`

### Step 5: Create `competitive-intelligence-analyst` agent (B5)

- **Backlog:** I27-GTMSI-B05
- **What:** Create `agents/competitive-intelligence-analyst.md` -- strategic agent for CI monitoring, battlecards, win/loss analysis
- **Files:**
  - Create: `agents/competitive-intelligence-analyst.md`
- **Key decisions:**
  - Classification: type=strategic, color=blue, field=marketing, expertise=expert, execution=coordinated, model=sonnet
  - Core skills: `marketing-team/competitive-intel` (new, B6), `product-team/competitive-analysis` (existing)
  - Related agents: `product-marketer`, `gtm-strategist`, `sales-development-rep`, `account-executive`
  - Collaborates-with: `product-marketer` (battlecard handoff), `sales-development-rep` (competitive context for outreach)
  - 4 use-cases: CI monitoring, battlecard creation, win/loss analysis, competitor tracking
  - 2+ workflows: Competitor Monitoring, Battlecard Generation
  - 2+ examples (e.g. "Create battlecard for competitor X" -> structured battlecard output)
- **Content sources:** Research report sections 1 (Tier 3 point tools -- Crayon, Klue), 10 (Gap Analysis -- competitive-intelligence-analyst row). Charter US-4.
- **Acceptance criteria:**
  - Agent file matches frontmatter schema
  - Body has Purpose, Skill Integration (references both competitive-intel and competitive-analysis), Workflows (2+), Examples (2+), Success Metrics
  - Passes `/agent/validate`
- **Dependencies:** Wave 1 complete (references `gtm-strategist` in related-agents)
- **Execution mode:** Solo
- **Agent:** Direct execution or `agent-author`

### Step 6: Create `competitive-intel` skill (B6)

- **Backlog:** I27-GTMSI-B06
- **What:** Create competitive intelligence skill with SKILL.md + reference file
- **Files:**
  - Create: `skills/marketing-team/competitive-intel/SKILL.md`
  - Create: `skills/marketing-team/competitive-intel/references/battlecard-template.md`
- **Key decisions:**
  - domain=marketing, subdomain=competitive-intelligence
  - related-agents: `competitive-intelligence-analyst`, `product-marketer`
  - tags: competitive-intelligence, battlecards, win-loss, monitoring, sales-enablement
  - No Python scripts (methodology skill)
- **Content coverage (from charter US-5):**
  - Competitor identification methodology
  - Monitoring cadence: daily signals, weekly summaries, monthly deep-dives
  - Data sources: websites, job postings, press releases, product changes, pricing, reviews
  - Battlecard template: positioning, strengths/weaknesses, objection handling, landmines, win themes
  - Win/loss analysis framework: interview methodology, pattern extraction, actionable insights
  - Share-of-voice measurement approach
  - Differentiation from `product-team/competitive-analysis` (market-facing CI ops vs. repo/product scorecard)
  - Reference: battlecard template
- **Content sources:** Research report sections 1 (Crayon, Klue), 2 (positioning), 5 (objection handling). Charter US-5.
- **Acceptance criteria:**
  - SKILL.md matches frontmatter schema
  - Body covers all 6 content areas listed above
  - `references/battlecard-template.md` exists with structured template
  - Explicit differentiation from `product-team/competitive-analysis` in Overview section
- **Dependencies:** Wave 1 complete
- **Execution mode:** Solo
- **Agent:** Direct execution or `agent-author`

**Wave 2 exit criteria:** All 3 files created. B5 agent references B6 skill. B4 completes `gtm-strategist` skill set. All pass validation.

---

## Wave 3: Integration (B7 + B8 + B9) -- Sequential

Cross-reference wiring, catalog update, final validation. Depends on Waves 1+2.

### Step 7: Update existing agents with cross-references (B7)

- **Backlog:** I27-GTMSI-B07
- **What:** Update 3 existing agents' frontmatter to reference new agents/skills
- **Files:**
  - Modify: `agents/product-marketer.md`
  - Modify: `agents/sales-development-rep.md`
  - Modify: `agents/content-creator.md`
- **Changes:**
  - **B7-P1.1 `product-marketer`:** Add `gtm-strategist`, `competitive-intelligence-analyst` to `related-agents` (currently `[]`). Add `marketing-team/competitive-intel` to `related-skills`.
  - **B7-P1.2 `sales-development-rep`:** Add `gtm-strategist` to `related-agents` (currently `[account-executive]`). Add `collaborates-with` entry: `{agent: gtm-strategist, purpose: "ICP criteria definition informs lead qualification and targeting", required: optional, without-collaborator: "Uses generic ICP criteria without GTM strategist refinement"}`.
  - **B7-P1.3 `content-creator`:** Add `copywriter` to `related-agents` (currently `[sales-development-rep]`). Add `collaborates-with` entry: `{agent: copywriter, purpose: "Hands off copy writing tasks; content-creator plans and analyzes, copywriter executes", required: optional, without-collaborator: "Content-creator writes copy directly without specialized execution agent"}`.
- **Acceptance criteria:**
  - All 3 agents have updated frontmatter with correct cross-references
  - No existing fields removed or broken
  - All 3 pass `/agent/validate`
- **Dependencies:** Waves 1+2 complete (need new agent names to exist)
- **Execution mode:** Parallel (3 sub-edits are independent)
- **Agent:** Direct execution

### Step 8: Update `agents/README.md` (B8)

- **Backlog:** I27-GTMSI-B08
- **What:** Add 3 new agent entries to the agent catalog
- **Files:**
  - Modify: `agents/README.md`
- **Changes:**
  - Under `#### Marketing` section (line 30), add:
    - `**\`gtm-strategist\`** - GTM strategy for ICP definition, TAM/SAM/SOM analysis, market segmentation, and niche market entry strategy`
    - `**\`competitive-intelligence-analyst\`** - Competitive intelligence for CI monitoring, battlecard creation, win/loss analysis, and competitor tracking`
    - `**\`copywriter\`** - Copy execution for web, email, social, and landing page copy with CRO optimization and brand voice adherence`
  - Maintain alphabetical or logical ordering within section
- **Acceptance criteria:**
  - All 3 entries present under Marketing section
  - Format matches existing entries (backtick name, dash, description)
- **Dependencies:** B7 complete (README should reflect final agent state)
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 9: Final validation gate (B9)

- **Backlog:** I27-GTMSI-B09
- **What:** Run `/agent/validate` on all 6 new/modified agents as final quality gate
- **Files:** None created/modified
- **Validation targets:**
  - `agents/gtm-strategist.md` (new)
  - `agents/competitive-intelligence-analyst.md` (new)
  - `agents/copywriter.md` (new)
  - `agents/product-marketer.md` (modified)
  - `agents/sales-development-rep.md` (modified)
  - `agents/content-creator.md` (modified)
- **Acceptance criteria:**
  - All 6 agents pass `/agent/validate` with zero errors
  - Maps to SC-12 from charter
- **Dependencies:** B8 complete
- **Execution mode:** Solo
- **Agent:** `agent-validator`

**Wave 3 exit criteria:** Agent graph fully connected. README updated. All 6 agents pass validation (SC-12). Charter success criteria SC-1 through SC-12 satisfied.

---

## Success Criteria Traceability

| SC | Criterion | Plan Step |
|----|-----------|-----------|
| SC-1 | `gtm-strategist` exists + validates | B1, B9 |
| SC-2 | `competitive-intelligence-analyst` exists + validates | B5, B9 |
| SC-3 | `copywriter` exists + validates | B3, B9 |
| SC-4 | `copywriter` resolves 4 dangling command refs | B3 |
| SC-5 | `icp-modeling` skill exists with SKILL.md + reference | B2 |
| SC-6 | `niche-market-strategy` skill exists with SKILL.md + reference | B4 |
| SC-7 | `competitive-intel` skill exists with SKILL.md + reference | B6 |
| SC-8 | `product-marketer` updated with cross-refs | B7-P1.1 |
| SC-9 | `sales-development-rep` updated with cross-ref | B7-P1.2 |
| SC-10 | `content-creator` updated with cross-ref | B7-P1.3 |
| SC-11 | README updated with 3 entries | B8 |
| SC-12 | All 6 agents pass validation | B9 |

---

## Execution Recommendation

- **Method:** Subagent-driven development (Wave 1 parallel, Wave 2 parallel, Wave 3 sequential)
- **Agent:** `engineering-lead` with `subagent-driven-development` skill
- **Rationale:** 9 tasks across 3 waves. Waves 1 and 2 each have 3 independent tasks that can run in parallel. Wave 3 is sequential (cross-refs -> README -> validation). Subagent dispatch maximizes throughput within each wave.
- **Cost tier notes:**
  - B1-B6 (agent/skill authoring): T2 -- pattern-following work, each file follows established conventions from convention discovery. Could use haiku/gemini for draft, sonnet for review.
  - B7 (cross-ref edits): T1 -- mechanical frontmatter edits, deterministic
  - B8 (README update): T1 -- mechanical catalog entry additions
  - B9 (validation): T1 -- run existing validation script
- **Estimated effort:** ~9 items, all docs-only. With parallel execution, completable in 3 sequential batches (one per wave).
