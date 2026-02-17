---
type: plan
endeavor: repo
initiative: I10-PMSI
initiative_name: pm-skills-intake
status: in_progress
updated: 2026-02-17
---

# Plan: PM Skills Intake (I10-PMSI)

Incorporate 42 product-manager skills from Dean Peters' external repo into `skills/product-team/` via 3 ADD and 5 ADAPT operations across 3 waves. 4 skills deferred.

- **Operating reference:** [.docs/AGENTS.md](../../AGENTS.md)
- **Source:** `.claude/skills/_sandbox/product-manager-skills/source/`

---

## Execution Status Snapshot (2026-02-17)

Current state reconciled from the terminal run log and repository file checks.

| Item | Status | Notes | Next action |
|---|---|---|---|
| B01 | done | `skills/product-team/saas-finance/` created with `SKILL.md` + 7 references | None |
| B02 | done | `skills/product-team/continuous-discovery/` created with `SKILL.md` + 4 references | None |
| B03 | done | `skills/product-team/workshop-facilitation/SKILL.md` created | None |
| B04 | in_progress | 4 reference files created, but `agile-product-owner/SKILL.md` still needs dependency/body alignment for this intake batch | Finish SKILL.md updates and verify links |
| B05 | in_progress | 3 reference files created, but `product-strategist/SKILL.md` still has placeholder fields and missing intake-specific reference wiring | Finish SKILL.md updates and verify links |
| B06 | not_started | No new PM-toolkit intake references yet | Execute Wave 3 B06 |
| B07 | not_started | No new competitive-analysis intake references yet | Execute Wave 3 B07 |
| B08 | not_started | No new prioritization-frameworks intake reference yet | Execute Wave 3 B08 |
| B09 | not_started | `skills/product-team/CLAUDE.md` still shows pre-intake state (5 skills) | Update team catalog after Wave 3 |
| B10 | not_started | `skills/README.md` product-team section does not include the 3 new skills | Update central catalog after Wave 3 |

### Wave-level status

| Wave | Scope | Status |
|---|---|---|
| Wave 1 | B01-B02 | done |
| Wave 2 | B03-B05 | in_progress |
| Wave 3 | B06-B08 | not_started |
| Post-Wave | B09-B10 | not_started |

### Immediate remaining work

1. Close B04 and B05 by updating both target SKILL files to include the new references and required frontmatter/body changes.
2. Execute Wave 3 (B06-B08).
3. Run catalog updates (B09-B10).
4. Complete verification checklist before setting plan status to `done`.

---

## Conventions

**Attribution header** (required on every new reference file):

```markdown
<!-- Source: Product-Manager-Skills by Dean Peters (https://github.com/deanpeters/Product-Manager-Skills)
     License: CC BY-NC-SA 4.0 — Attribution required, NonCommercial, ShareAlike
     Adapted for agents-and-skills skill format. -->
```

**SKILL.md frontmatter** must follow existing product-team format: YAML with `# === CORE IDENTITY ===` header, sections for WEBSITE DISPLAY, RELATIONSHIPS, TECHNICAL (listing references under `dependencies.references`), EXAMPLES, ANALYTICS, VERSIONING, DISCOVERABILITY. See `prioritization-frameworks/SKILL.md` as exemplar.

**Reference file format**: Title heading, source attribution header, brief "When to use / Who uses it" block, then adapted content (Purpose, Key Concepts, Application, Examples, Common Pitfalls as applicable). Strip source SKILL.md frontmatter; keep substantive content.

**Adaptation rules for all source files**:
1. Remove source YAML frontmatter (`---` block)
2. Add attribution header
3. Retain all substantive content (frameworks, tables, templates, workflows, examples)
4. Remove self-referential cross-links to other source skills (replace with relative path to sibling reference or parent SKILL.md if needed)
5. Fix markdown formatting to match repo style (no trailing spaces, consistent heading levels)

**Merge rules** (when 2 source skills combine into 1 reference):
- Lead with the more structured/complete source as the base
- Append unique content from the second source as additional sections
- Note both source skill names in the attribution header

---

## Wave 1: ADD saas-finance + ADD continuous-discovery

Two new skill directories. Independent, parallelizable.

### B01 — ADD `product-team/saas-finance/`

**Status:** done

**What:** New skill consolidating 7 SaaS finance source skills into 1 SKILL.md + 7 references.

**File structure:**
```
skills/product-team/saas-finance/
  SKILL.md
  references/
    metrics-quickref.md
    revenue-growth-metrics.md
    economics-efficiency-metrics.md
    pricing-advisor.md
    channel-advisor.md
    investment-advisor.md
    business-health-diagnostic.md
```

**SKILL.md creation:**
- Domain: `product`, subdomain: `saas-finance`
- Description: "SaaS finance metrics, pricing, acquisition channels, investment analysis, and business health diagnostics. Consolidates 7 reference guides for PM financial fluency."
- Body sections: Purpose (PM financial literacy hub), Key Concepts (4 metric families from metrics-quickref: Revenue & Growth, Unit Economics, Capital Efficiency, Efficiency Ratios), Application (when to use which reference), Consolidated References table linking all 7 refs
- `dependencies.references` lists all 7 reference files
- `related-skills`: `product-team/prioritization-frameworks`, `product-team/product-strategist`
- `related-agents`: `product-director`, `product-manager`, `product-analyst`
- Tags: `saas, finance, metrics, pricing, acquisition, investment, ltv, cac, mrr, arr`

**Reference file details:**

| Reference file | Source skill | Lines | Content to extract |
|---|---|---|---|
| `metrics-quickref.md` | `finance-metrics-quickref` (299 lines) | All content after frontmatter: metric reference table (32+ metrics), decision frameworks, red flags. This is the cheat sheet. |
| `revenue-growth-metrics.md` | `saas-revenue-growth-metrics` (619 lines) | Deep-dive on revenue metrics: MRR/ARR components, NRR calculation, expansion revenue, churn analysis with formulas and examples. |
| `economics-efficiency-metrics.md` | `saas-economics-efficiency-metrics` (684 lines) | Unit economics: CAC, LTV, payback period, contribution margin, Rule of 40, magic number with benchmarks and calculation guides. |
| `pricing-advisor.md` | `finance-based-pricing-advisor` (753 lines) | Interactive pricing framework: value-based pricing, price sensitivity, packaging/tiering, discount strategies, pricing experimentation. |
| `channel-advisor.md` | `acquisition-channel-advisor` (633 lines) | Channel selection framework: channel scoring, CAC by channel, channel mix optimization, attribution models. |
| `investment-advisor.md` | `feature-investment-advisor` (629 lines) | Feature investment analysis: ROI modeling, build-vs-buy, investment thesis, financial case templates. |
| `business-health-diagnostic.md` | `business-health-diagnostic` (772 lines) | Business health assessment: diagnostic framework, metric dashboards, red flag identification, action plans by health status. |

**Steps:**
1. Create `skills/product-team/saas-finance/` directory
2. Create SKILL.md with frontmatter + body referencing all 7 refs
3. Create each reference file: strip frontmatter, add attribution header, retain all content
4. Verify all 7 references listed in SKILL.md `dependencies.references`

**Rollback:** `rm -rf skills/product-team/saas-finance/`

---

### B02 — ADD `product-team/continuous-discovery/`

**Status:** done

**What:** New skill consolidating 5 discovery source skills into 1 SKILL.md + 4 references.

**File structure:**
```
skills/product-team/continuous-discovery/
  SKILL.md
  references/
    problem-framing-canvas.md
    opportunity-solution-tree.md
    interview-prep-guide.md
    problem-statement-template.md
```

**SKILL.md creation:**
- Domain: `product`, subdomain: `product-discovery`
- Description: "Continuous discovery workflow — from problem hypothesis to validated solution. Orchestrates problem framing, customer interviews, opportunity mapping, and experimentation into a structured 6-phase cycle."
- Body: Absorb `discovery-process` (493 lines) as the main SKILL.md body. It already has the 6-phase workflow (Frame, Research, Synthesize, Generate, Validate, Decide). Keep Purpose, Key Concepts (what is discovery, why it works, anti-patterns, when to/not to use), Application (all 6 phases with detailed steps). Add Consolidated References section linking 4 refs.
- Reference to `workshop-facilitation` skill in body (as discovery-process already does)
- `dependencies.references` lists 4 reference files
- `related-skills`: `product-team/workshop-facilitation`, `product-team/product-manager-toolkit`, `product-team/agile-product-owner`
- `related-agents`: `product-manager`, `product-analyst`, `ux-researcher-designer`
- Tags: `discovery, continuous-discovery, customer-research, problem-framing, opportunity-mapping, interviews, teresa-torres`

**Reference file details:**

| Reference file | Source skill | Lines | Content to extract |
|---|---|---|---|
| `problem-framing-canvas.md` | `problem-framing-canvas` (456 lines) | Canvas template: problem definition fields, stakeholder identification, scope boundaries, assumptions log, success criteria. |
| `opportunity-solution-tree.md` | `opportunity-solution-tree` (418 lines) | OST methodology: outcome at root, opportunities as branches, solutions as leaves; how to build/maintain the tree, prioritization within tree. |
| `interview-prep-guide.md` | `discovery-interview-prep` (398 lines) | Interview preparation: research checklist, question design (open-ended, follow-up, probing), Mom Test principles, recording/consent, synthesis template. |
| `problem-statement-template.md` | `problem-statement` (244 lines) | Problem statement format: who/what/why/impact structure, examples, common anti-patterns, iteration guidance. |

**Steps:**
1. Create `skills/product-team/continuous-discovery/` directory
2. Create SKILL.md: convert `discovery-process` body into our frontmatter format, add consolidated references section
3. Create each reference file: strip frontmatter, add attribution header, retain all content
4. Verify all 4 references listed in SKILL.md `dependencies.references`

**Rollback:** `rm -rf skills/product-team/continuous-discovery/`

---

## Wave 2: ADD workshop-facilitation + ADAPT agile-product-owner + ADAPT product-strategist

Three independent operations. Parallelizable.

### B03 — ADD `product-team/workshop-facilitation/`

**Status:** done

**What:** New standalone skill (76 lines, compact). No references subdirectory needed.

**File structure:**
```
skills/product-team/workshop-facilitation/
  SKILL.md
```

**SKILL.md creation:**
- Domain: `product`, subdomain: `facilitation`
- Description: "Canonical facilitation protocol for interactive multi-turn workshops. One-step-at-a-time flow with progress labels, numbered recommendations at decision points, quick-select options, and interruption handling."
- Body: Absorb entire `workshop-facilitation` source (76 lines). Content is already well-structured with Purpose, Key Concepts, Application (12-step protocol), Examples, Common Pitfalls. Wrap in our frontmatter format.
- `related-skills`: `product-team/continuous-discovery`, `product-team/agile-product-owner`
- `related-agents`: `product-manager`, `product-analyst`, `agile-coach`
- Tags: `workshop, facilitation, interactive, multi-turn, guided-conversation`

**Steps:**
1. Create `skills/product-team/workshop-facilitation/` directory
2. Create SKILL.md with our frontmatter wrapping source content

**Rollback:** `rm -rf skills/product-team/workshop-facilitation/`

---

### B04 — ADAPT `product-team/agile-product-owner/`

**Status:** in_progress

**What:** Add 4 reference files from 5 source skills (2 merge into 1). Update SKILL.md frontmatter.

**File changes:**
```
skills/product-team/agile-product-owner/
  SKILL.md                                    # MODIFY (frontmatter + consolidated refs section)
  references/
    story-splitting-patterns.md               # CREATE
    epic-breakdown-patterns.md                # CREATE
    epic-hypothesis-format.md                 # CREATE
    story-mapping-workshop.md                 # CREATE (merged from 2 sources)
```

**Reference file details:**

| Reference file | Source skill(s) | Lines | Content to extract |
|---|---|---|---|
| `story-splitting-patterns.md` | `user-story-splitting` (301 lines) | Story splitting patterns: SPIDR, conjunctions, workflow steps, business rules, data variations. Each pattern with before/after examples. |
| `epic-breakdown-patterns.md` | `epic-breakdown-advisor` (655 lines) | Epic decomposition: breakdown strategies, dependency mapping, sizing heuristics, vertical slice patterns, acceptance criteria rollup. |
| `epic-hypothesis-format.md` | `epic-hypothesis` (275 lines) | Hypothesis-driven epic format: "We believe [capability] will [outcome] for [persona], measured by [metric]." Templates and examples. |
| `story-mapping-workshop.md` | `user-story-mapping` (283 lines) + `user-story-mapping-workshop` (475 lines) | **Merged**: story mapping methodology (backbone, walking skeleton, release slicing) from the base skill, plus workshop facilitation protocol (activities, timing, group exercises, synthesis) from the workshop skill. Attribution header names both sources. |

**SKILL.md modifications:**
- Add 4 entries to `dependencies.references`
- Add `related-skills`: `product-team/workshop-facilitation`, `product-team/continuous-discovery`
- Add body section "## Consolidated References" with table linking each reference + one-line description

**Steps:**
1. Read existing `agile-product-owner/SKILL.md`
2. Create 4 reference files in `references/`
3. Update SKILL.md: add references to `dependencies.references`, add consolidated references body section
4. Verify references exist and are linked

**Rollback:** `git checkout -- skills/product-team/agile-product-owner/SKILL.md` + remove 4 new reference files

---

### B05 — ADAPT `product-team/product-strategist/`

**Status:** in_progress

**What:** Add 3 reference files from 4 source skills (2 merge into 1). Update SKILL.md frontmatter.

**File changes:**
```
skills/product-team/product-strategist/
  SKILL.md                                    # MODIFY
  references/
    strategy-session-workflow.md              # CREATE
    roadmap-planning-guide.md                 # CREATE
    positioning-framework.md                  # CREATE (merged from 2 sources)
```

**Reference file details:**

| Reference file | Source skill(s) | Lines | Content to extract |
|---|---|---|---|
| `strategy-session-workflow.md` | `product-strategy-session` (424 lines) | Strategy session facilitation: agenda, pre-work, vision/mission alignment, market context review, strategic pillars, OKR drafting, action items. |
| `roadmap-planning-guide.md` | `roadmap-planning` (494 lines) | Roadmap creation: now/next/later framework, theme-based vs feature-based, stakeholder alignment, capacity mapping, communication formats, update cadence. |
| `positioning-framework.md` | `positioning-statement` (219 lines) + `positioning-workshop` (414 lines) | **Merged**: positioning statement template ("For [target] who [need], [product] is a [category] that [benefit]") from base, plus workshop protocol (competitive context exercise, differentiation mapping, messaging hierarchy) from workshop. Attribution header names both sources. |

**SKILL.md modifications:**
- Add 3 entries to `dependencies.references`
- Add `related-skills`: `product-team/workshop-facilitation`, `product-team/prioritization-frameworks`
- Add `related-agents`: `product-director`, `product-manager`
- Add body section "## Consolidated References"
- Fix existing TODO placeholders in frontmatter (`time-saved`, `frequency`, `use-cases`, `examples`) with reasonable values

**Steps:**
1. Read existing `product-strategist/SKILL.md`
2. Create 3 reference files in `references/`
3. Update SKILL.md frontmatter and body
4. Verify references exist and are linked

**Rollback:** `git checkout -- skills/product-team/product-strategist/SKILL.md` + remove 3 new reference files

---

## Wave 3: ADAPT product-manager-toolkit + ADAPT competitive-analysis + ADAPT prioritization-frameworks

Three independent operations. Parallelizable.

### B06 — ADAPT `product-team/product-manager-toolkit/`

**Status:** not_started

**What:** Add 8 reference files. Largest batch. Update SKILL.md frontmatter.

**File changes:**
```
skills/product-team/product-manager-toolkit/
  SKILL.md                                    # MODIFY
  references/
    press-release-faq.md                      # CREATE
    proto-persona-template.md                 # CREATE
    recommendation-canvas.md                  # CREATE
    prd-development-guide.md                  # CREATE
    storyboard-template.md                    # CREATE
    eol-message-template.md                   # CREATE
    jobs-to-be-done.md                        # CREATE
    lean-ux-canvas.md                         # CREATE
```

**Reference file details:**

| Reference file | Source skill | Lines | Content to extract |
|---|---|---|---|
| `press-release-faq.md` | `press-release` (267 lines) | Amazon Working Backwards PR/FAQ format: press release template (headline, subhead, problem, solution, quote, call-to-action), internal FAQ, external FAQ, iteration guidance. |
| `proto-persona-template.md` | `proto-persona` (324 lines) | Lightweight persona creation: demographics, behaviors, needs/goals, pain points, quotes. Template format with examples; NOT full research-backed personas (those live in ux-team). |
| `recommendation-canvas.md` | `recommendation-canvas` (373 lines) | Decision recommendation format: context, options considered, recommendation, evidence, risks, next steps. Structured canvas for presenting product decisions to stakeholders. |
| `prd-development-guide.md` | `prd-development` (644 lines) | PRD writing guide: sections (problem, goals, requirements, user stories, success metrics, technical considerations, timeline), templates, review checklist, common anti-patterns. |
| `storyboard-template.md` | `storyboard` (250 lines) | Visual narrative template: scenario setup, user steps, pain points, solution moments, outcome. Low-fidelity storyboard creation for communicating user journeys. |
| `eol-message-template.md` | `eol-message` (346 lines) | End-of-life communication: EOL decision framework, customer notification templates (email, in-app, docs), migration guidance, timeline communication, sunset checklist. |
| `jobs-to-be-done.md` | `jobs-to-be-done` (368 lines) | JTBD framework: job statement format ("When [situation], I want to [motivation], so I can [outcome]"), job map, outcome-driven innovation, switch interviews, forces of progress. |
| `lean-ux-canvas.md` | `lean-ux-canvas` (551 lines) | Lean UX canvas: business problem, outcomes, users, user outcomes/benefits, solutions, hypotheses, MVP experiments. Canvas template with fill instructions and examples. |

**SKILL.md modifications:**
- Add 8 entries to `dependencies.references`
- Add `related-skills`: `product-team/continuous-discovery`, `product-team/agile-product-owner`
- Add body section "## Consolidated References"

**Steps:**
1. Read existing `product-manager-toolkit/SKILL.md`
2. Create 8 reference files in `references/`
3. Update SKILL.md frontmatter and body
4. Verify all 8 references exist and are linked

**Rollback:** `git checkout -- skills/product-team/product-manager-toolkit/SKILL.md` + remove 8 new reference files

---

### B07 — ADAPT `product-team/competitive-analysis/`

**Status:** not_started

**What:** Add 4 reference files from 5 source skills (2 merge into 1). Update SKILL.md frontmatter.

**File changes:**
```
skills/product-team/competitive-analysis/
  SKILL.md                                    # MODIFY
  references/
    pestel-analysis.md                        # CREATE
    company-research-template.md              # CREATE
    tam-sam-som-methodology.md                # CREATE
    customer-journey-mapping.md               # CREATE (merged from 2 sources)
```

**Reference file details:**

| Reference file | Source skill(s) | Lines | Content to extract |
|---|---|---|---|
| `pestel-analysis.md` | `pestel-analysis` (374 lines) | PESTEL framework: Political, Economic, Social, Technological, Environmental, Legal factor analysis. Scoring methodology, impact assessment, strategic implications template. |
| `company-research-template.md` | `company-research` (383 lines) | Competitor research template: company overview, product analysis, pricing, go-to-market, strengths/weaknesses, funding/financials, strategic direction. Structured for competitive intelligence gathering. |
| `tam-sam-som-methodology.md` | `tam-sam-som-calculator` (390 lines) | Market sizing: TAM/SAM/SOM calculation methods (top-down, bottom-up, value-theory), data sources, assumptions documentation, presentation format. |
| `customer-journey-mapping.md` | `customer-journey-map` (334 lines) + `customer-journey-mapping-workshop` (513 lines) | **Merged**: journey map methodology (stages, touchpoints, emotions, pain points, opportunities) from base, plus workshop protocol (participant selection, pre-work, facilitation activities, synthesis, action planning) from workshop. Attribution header names both sources. |

**SKILL.md modifications:**
- Add 4 entries to `dependencies.references`
- Add `related-skills`: `product-team/continuous-discovery`, `product-team/product-manager-toolkit`
- Add body section "## Consolidated References"

**Steps:**
1. Read existing `competitive-analysis/SKILL.md`
2. Create 4 reference files in `references/`
3. Update SKILL.md frontmatter and body
4. Verify references exist and are linked

**Rollback:** `git checkout -- skills/product-team/competitive-analysis/SKILL.md` + remove 4 new reference files

---

### B08 — ADAPT `product-team/prioritization-frameworks/`

**Status:** not_started

**What:** Add 1 reference file. Smallest ADAPT operation. Update SKILL.md frontmatter.

**File changes:**
```
skills/product-team/prioritization-frameworks/
  SKILL.md                                    # MODIFY
  references/
    framework-selection-guide.md              # CREATE
```

**Reference file details:**

| Reference file | Source skill | Lines | Content to extract |
|---|---|---|---|
| `framework-selection-guide.md` | `prioritization-advisor` (438 lines) | Framework selection decision tree: when to use RICE vs ICE vs MoSCoW vs Kano vs WSJF vs portfolio allocation. Comparison matrix, team maturity fit, data requirements per framework, migration path between frameworks. |

**SKILL.md modifications:**
- Add 1 entry to `dependencies.references`
- Add body section "## Consolidated References" (or append to existing references list)

**Steps:**
1. Read existing `prioritization-frameworks/SKILL.md`
2. Create reference file in `references/`
3. Update SKILL.md: add reference to `dependencies.references`, add consolidated references body section
4. Verify reference exists and is linked

**Rollback:** `git checkout -- skills/product-team/prioritization-frameworks/SKILL.md` + remove 1 new reference file

---

## Post-Wave: Catalog Updates

### B09 — Update `skills/product-team/CLAUDE.md`

**Status:** not_started

**What:** Update team guide to document 3 new skills and all new references across 5 adapted skills.

**Modifications:**
- Update skill count: 5 existing + 3 new = 8 product skills
- Add entries for `saas-finance/`, `continuous-discovery/`, `workshop-facilitation/`
- For each existing skill, note new reference files added
- Update "Total Tools" if applicable (tools count stays same; references are documentation not scripts)
- Add new workflow: "Workflow 4: Discovery to Delivery" showing continuous-discovery -> product-manager-toolkit -> agile-product-owner flow
- Add new workflow: "Workflow 5: Financial Analysis" showing saas-finance for PM financial decisions
- Update "Last Updated" date and skill count

**Rollback:** `git checkout -- skills/product-team/CLAUDE.md`

### B10 — Update `skills/README.md`

**Status:** not_started

**What:** Add 3 new skill entries to the product-team section of the skills catalog.

**Steps:**
1. Read `skills/README.md`
2. Add entries for `saas-finance`, `continuous-discovery`, `workshop-facilitation` in the product-team section
3. Verify alphabetical ordering within section

**Rollback:** `git checkout -- skills/README.md`

---

## Execution Summary

| Wave | Backlog items | New files | Modified files | Parallelizable |
|------|--------------|-----------|---------------|---------------|
| 1 | B01, B02 | 14 (2 SKILL.md + 11 refs + 1 dir) | 0 | Yes (2 threads) |
| 2 | B03, B04, B05 | 8 (1 SKILL.md + 7 refs) | 2 SKILL.md | Yes (3 threads) |
| 3 | B06, B07, B08 | 13 refs | 3 SKILL.md | Yes (3 threads) |
| Post | B09, B10 | 0 | 2 | Sequential after Wave 3 |
| **Total** | **10** | **35** | **7** | |

**Total source skills consumed:** 38 (of 42 assessed; 4 deferred)

**File count breakdown:**
- 3 new SKILL.md files (saas-finance, continuous-discovery, workshop-facilitation)
- 30 new reference files across 8 skill directories
- 7 modified SKILL.md files (5 ADAPT + CLAUDE.md + README.md)

---

## Deferred (not in this plan)

| Source skill | Reason |
|---|---|
| `context-engineering-advisor` | AI/agent-specific; evaluate for `agent-development-team/` |
| `ai-shaped-readiness-advisor` | AI/agent-specific; evaluate for `agent-development-team/` |
| `agent-orchestration-advisor` | AI/agent-specific; evaluate for `agent-development-team/` |
| `skill-authoring-workflow` | Overlaps with existing `creating-agents` and skill-creator skills |

---

## Verification Checklist (per batch)

- [ ] All new files have attribution header
- [ ] SKILL.md frontmatter follows `# === CORE IDENTITY ===` format
- [ ] `dependencies.references` lists all reference files with correct relative paths
- [ ] No broken cross-references between SKILL.md and references
- [ ] No source YAML frontmatter left in reference files
- [ ] No dangling cross-links to other source skills (replaced or removed)
- [ ] `skills/product-team/CLAUDE.md` reflects final state (after B09)
- [ ] `skills/README.md` reflects 3 new skills (after B10)
