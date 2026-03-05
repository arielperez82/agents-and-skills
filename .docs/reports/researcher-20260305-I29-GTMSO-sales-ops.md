# Research Report: I29-GTMSO Sales Ops & Revenue Analytics

**Date:** 2026-03-05 | **Initiative:** I29-GTMSO | **Phase:** Pre-implementation research

## 1. Existing Patterns (I27/I28 Conventions)

Reviewed `gtm-strategist` (I27), `marketing-ops-manager` (I28), `sales-development-rep`, `account-executive`. All follow the same agent template:

- **Frontmatter sections:** CORE IDENTITY, USE CASES, AGENT CLASSIFICATION, RELATIONSHIPS, TECHNICAL, EXAMPLES (all use `tools: [Read, Write, Bash, Grep, Glob]`, `mcp-tools: []`, `scripts: []`)
- **Body sections:** Purpose (3 paragraphs: what, who, bridge), Skill Integration (locations + knowledge bases), Workflows (2-3 with Goal/Steps/Expected Output/Time Estimate/Example), Integration Examples (bash scripts documenting handoffs), Success Metrics (4 categories, 4 bullets each), Related Agents, References
- **Footer:** Last Updated, Status, Version
- **Classification pattern for charter:** strategic agents use `type: strategic, color: blue`; ops/implementation agents use `type: implementation, color: green`. Both sales agents use `model: haiku`. Charter proposes `model: sonnet` for both new agents -- this is a deliberate upgrade from the haiku pattern used by SDR/AE, justified by the judgment required for forecasting and cross-functional analytics.
- **Skill convention:** `skills/sales-team/{name}/SKILL.md` with YAML frontmatter including `metadata.related-agents`, `metadata.related-skills`, `metadata.domain: sales`, `metadata.subdomain`.

## 2. Existing Sales-Team Skills (6 skills)

| Skill | Subdomain | Primary Consumer |
|-------|-----------|-----------------|
| `lead-research` | sales-development | SDR |
| `lead-qualification` | sales-development | SDR |
| `sales-outreach` | sales-development | SDR |
| `meeting-intelligence` | account-management | AE |
| `sales-call-analysis` | account-management | AE |
| `pipeline-analytics` | sales-operations | AE |

The `sales-team/CLAUDE.md` documents 6 skills and 2 agents. It will need updating to reflect 10 skills and 4 agents after I29.

## 3. Overlap Analysis

### pipeline-analytics vs. pipeline-forecasting (charter Risk #1)

**Verified: complementary, not duplicative.** The existing `pipeline-analytics` skill covers:
- Pipeline health scoring (0-100 composite)
- Deal risk flagging (5 rule categories: stale, missing milestones, engagement decay, single-threaded, stuck stage)
- Stage-to-stage conversion analysis with benchmarks
- Coaching insights from pipeline patterns
- Daily/weekly review templates

The proposed `pipeline-forecasting` focuses on: forecasting methods (weighted pipeline, stage-probability, AI-assisted, rep judgment), coverage ratios, forecast cadence (weekly commit, monthly outlook, quarterly plan), and B2B SaaS benchmarks. These are distinct: analytics = "what is happening now"; forecasting = "what will happen and when." Charter's mitigation is sound. Recommend adding `pipeline-analytics` to `pipeline-forecasting`'s `related-skills` and vice versa.

### revenue-analytics vs. saas-finance (charter Risk #2)

**Verified: complementary.** `saas-finance` (product-team) covers PM financial fluency: SaaS metrics definitions, pricing advisor, channel advisor, investment advisor, business health diagnostic. It is a reference/education skill for product managers. The proposed `revenue-analytics` is an operational GTM measurement skill: funnel analytics, CAC by channel, LTV:CAC, magic number, board-level dashboards. Different audience (RevOps vs PM), different purpose (operational measurement vs financial literacy). Charter's distinction is accurate.

### account-executive pipeline health vs. sales-ops-analyst

**Verified: complementary.** AE's `pipeline-analytics` is deal-level (individual rep's pipeline). Sales-ops-analyst operates at system-level (all deals, all reps, cross-functional). No overlap.

## 4. Risk Mitigations Assessment

| Risk | Charter Mitigation | Assessment |
|------|-------------------|------------|
| pipeline-forecasting overlap | Documented as complementary | **Sound** -- confirmed by skill content review |
| revenue-analytics vs saas-finance | Different audience/purpose | **Sound** -- verified by saas-finance frontmatter |
| AE pipeline health overlap | System vs deal level | **Sound** -- confirmed by AE agent body |

**Additional risks not in charter:**
- **sales-team/CLAUDE.md staleness**: Must update to reflect 10 skills / 4 agents. Not called out in charter user stories.
- **SDR model mismatch**: SDR currently uses `model: haiku`. Adding `gtm-strategist` to `collaborates-with` is fine, but the SDR agent body does not reference cadence design concepts. The US-7 enhancement only touches frontmatter, not body text -- body may benefit from a cadence section. Charter scope may be intentionally minimal here.

## 5. README Format Conventions

The Sales Agents section in `agents/README.md` (line 125-128) uses a flat list format:
```
### Sales Agents
- **`agent-name`** - One-line description
```
New entries for `sales-ops-analyst` and `revenue-ops-analyst` should follow this exact pattern, inserted alphabetically within the Sales Agents section.

## 6. Summary of Findings

1. **Charter is well-structured** and follows I27/I28 patterns precisely.
2. **All 3 overlap risks verified as non-issues** -- skills are complementary with clear boundaries.
3. **4 new skills** (crm-ops, pipeline-forecasting, revenue-analytics, cadence-design) fill genuine gaps in the sales-team skill set.
4. **2 new agents** (sales-ops-analyst, revenue-ops-analyst) extend the sales catalog with system-level and cross-functional perspectives missing from deal-level SDR/AE agents.
5. **Minor gap**: Charter does not mention updating `sales-team/CLAUDE.md` -- recommend adding as a sub-task of US-8 or a separate checklist item.
6. **Implementation is straightforward**: docs-only, ~8 steps, no code, no scripts. Light tier is appropriate.
