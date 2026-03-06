---
type: plan
endeavor: repo
initiative: I31-EDPUB
initiative_name: editorial-publishing-pipeline
status: done
created: 2026-03-05
updated: 2026-03-05
---

# Implementation Plan: Editorial Publishing Pipeline

**Initiative:** I31-EDPUB
**Charter:** `.docs/canonical/charters/charter-repo-I31-EDPUB-editorial-publishing-pipeline.md`
**Backlog:** `.docs/canonical/backlogs/backlog-repo-I31-EDPUB-editorial-publishing-pipeline.md`
**Roadmap:** `.docs/canonical/roadmaps/roadmap-repo-I31-EDPUB-editorial-publishing-pipeline-2026.md`
**Research:** `.docs/reports/researcher-20260305-I31-EDPUB-editorial-publishing-pipeline.md`
**Scope type:** docs-only (all deliverables are markdown files -- no code, no tests, no TDD loop)

---

## Convention Discovery (Pre-Step)

Analyzed 7 template files to extract conventions. All new agents/skills/commands must match these exactly.

### Agent Frontmatter Schema

**Implementation agents** (pattern: `agents/content-creator.md`):

```yaml
# === CORE IDENTITY ===
name: kebab-case
title: Human Readable Title
description: One-line description
domain: editorial
subdomain: specific-area
skills: editorial-team/skill-name  # or list

# === USE CASES ===
difficulty: advanced | intermediate
use-cases: [list]

# === AGENT CLASSIFICATION ===
classification:
  type: implementation | quality | coordination
  color: green | red | purple
  field: editorial
  expertise: expert | advanced
  execution: autonomous | coordinated
  model: sonnet | haiku

# === RELATIONSHIPS ===
related-agents: [list]
related-skills: [list]
related-commands: [list]
collaborates-with:
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

**Quality agents** (pattern: `agents/claims-verifier.md`): Same schema, type=quality, color=red, adversarial framing in Purpose/Workflows.

**Coordination agents** (pattern: `agents/engineering-lead.md`): Same schema, type=coordination, color=purple, orchestration workflows with step-by-step pipeline.

### Agent Body Structure

1. `# Agent Name Agent` (H1)
2. `## Purpose` -- 3 paragraphs: what, who, how it bridges a gap
3. `## When to Use` -- table differentiating from similar agents (when applicable)
4. `## Skill Integration` -- skill locations, references
5. `## Workflows` -- 2+ workflows with Goal, Steps, Expected Output
6. `## Success Metrics` -- categorized metrics with targets
7. `## Related Agents` -- markdown links with descriptions
8. `## References` -- skill docs, domain guides

### Skill Frontmatter Schema (pattern: `skills/marketing-team/content-creator/SKILL.md`)

```yaml
name: skill-name
description: Multi-line description
license: MIT
metadata:
  author: Claude Skills Team
  compatibility: {python-version, platforms}
  contributors: []
  created: 2026-03-05
  dependencies: {scripts: [], references: [list], assets: []}
  difficulty: intermediate | advanced
  domain: editorial
  examples: [{title, input, output}]
  featured: false
  frequency: usage-estimate
  orchestrated-by: []
  related-agents: [agent-name list]
  related-commands: []
  related-skills: []
  stats: {downloads: 0, stars: 0, rating: 0.0, reviews: 0}
  subdomain: specific-area
  tags: [list]
  tech-stack: []
  time-saved: estimate
  title: Human Readable Title
  updated: 2026-03-05
  use-cases: [list]
  verified: true
  version: v1.0.0
```

### Skill Body Structure

1. `# Skill Title` (H1)
2. `## Overview` -- what, who, core value
3. `## Core Capabilities` -- bullet list
4. `## Quick Start`
5. `## Key Workflows` -- numbered workflows with steps
6. `## Best Practices` -- categorized tips
7. `## Reference Guides` -- when to use each reference
8. `## Integration`

### Command Frontmatter (pattern: `commands/content/fast.md`)

```yaml
description: One-line description
argument-hint: "<required-param> [optional-param]"
```

Simple body: purpose, parameters, workflow steps, references agent.

**Parallel review command** (pattern: `commands/review/review-changes.md`): Multi-agent dispatch, combined report, verdict logic.

### Team CLAUDE.md (pattern: `skills/marketing-team/CLAUDE.md`)

Team overview, available skills list with descriptions, tool summary, related agents list.

### Integration Checklist (Nth-of-kind)

New agent:
- [ ] `agents/README.md` -- catalog entry under new "Editorial" section
- [ ] Related agents' `related-agents` frontmatter (bidirectional)
- [ ] `collaborates-with` entries where applicable
- [ ] Commands that reference the agent

New skill:
- [ ] Agent frontmatter `skills` and `related-skills` reference it
- [ ] Skill `metadata.related-agents` references consuming agents
- [ ] `skills/editorial-team/CLAUDE.md` lists it
- [ ] Reference files exist in `references/` subdirectory
- [ ] `skills/README.md` has editorial-team section

---

## Wave 1: Walking Skeleton (B1 + B2) -- Parallel

Proves agent-skill wiring. Creates team directory. Thinnest vertical slice.

### Step 1: Create `editorial-writer` agent + `script-to-article` skill (B1 + B2)

- **Backlog:** I31-EDPUB-B01, I31-EDPUB-B02
- **What:** Create the walking skeleton -- editorial-writer agent, script-to-article skill with reference file, and the `skills/editorial-team/` team directory. These two are tightly coupled (agent's primary skill) and should be authored together to ensure bidirectional wiring.
- **Template:** `agents/content-creator.md` (implementation agent pattern), `skills/marketing-team/content-creator/SKILL.md` (skill pattern)
- **Files:**
  - Create: `skills/editorial-team/script-to-article/SKILL.md`
  - Create: `skills/editorial-team/script-to-article/references/transformation-checklist.md`
  - Create: `agents/editorial-writer.md`
- **Key decisions:**
  - **Agent classification:** type=implementation, color=green, field=editorial, expertise=expert, execution=autonomous, model=sonnet
  - **Agent core skills:** `editorial-team/script-to-article`, `editorial-team/editorial-voice-matching`
  - **Agent related-skills:** `editorial-team/bias-screening`
  - **Agent related-agents:** `fact-checker`, `newsletter-producer`, `content-creator`
  - **Agent collaborates-with:** `fact-checker` (draft handoff for neutrality review)
  - **Agent "When to Use" table:** editorial-writer = neutral reporting (no persuasion) vs content-creator = marketing content (deliberate persuasion)
  - **Skill coverage:** 5 transformation areas (verbal tics, reading flow, factual preservation, condensing with 3-5x compression ratio, multi-story segmentation)
  - **Skill related-agents:** `editorial-writer`, `newsletter-producer`, `editorial-accuracy-reviewer`
  - **Reference file:** transformation-checklist.md with step-by-step transformation process
- **Acceptance criteria (charter):**
  - Agent passes `/agent/validate`, classification matches spec
  - Agent has 2+ examples (teleprompter->article, transcript->show notes), 2+ workflows
  - Skill SKILL.md exists at `skills/editorial-team/script-to-article/`
  - Skill covers all 5 transformation areas with compression ratio guidelines
  - Agent `skills` field resolves to skill path; skill `related-agents` includes `editorial-writer`
  - Scenarios 1.1, 1.2, 2.1, 2.2, INT-1 pass
- **Dependencies:** None
- **Execution mode:** Solo (1 step, tightly coupled files)
- **Agent:** `agent-author` or direct execution

**Wave 1 exit criteria:** Agent-skill bidirectional references resolve. Agent passes `/agent/validate`. Team directory exists.

---

## Wave 2: Pipeline Orchestration (B3-B6) -- Mixed

Proves coordination agent pattern, command-to-agent wiring, pipeline definition.

### Step 2: Create `story-selection` + `newsletter-assembly` skills (B4 + B5)

- **Backlog:** I31-EDPUB-B04, I31-EDPUB-B05
- **What:** Create two independent pipeline skills that newsletter-producer will consume. Done before the agent so skills exist when agent references them.
- **Template:** `skills/marketing-team/content-creator/SKILL.md`
- **Files:**
  - Create: `skills/editorial-team/story-selection/SKILL.md`
  - Create: `skills/editorial-team/newsletter-assembly/SKILL.md`
  - Create: `skills/editorial-team/newsletter-assembly/references/newsletter-edition-template.md`
- **Key decisions:**
  - **story-selection:** explicit + auto-select modes, 5 evaluation criteria (audience relevance, newsworthiness, topic diversity, engagement potential, narrative strength), weighted scoring model with diversity constraint, output includes rationale. related-agents: `newsletter-producer`
  - **newsletter-assembly:** edition template (subject line, 3 stories, poll, show notes, footer), subject line methodology (3-5 candidates), story ordering logic (lead=strongest, end=engaging, middle=substance), format-agnostic output. related-agents: `newsletter-producer`
- **Acceptance criteria:** Both SKILL.md files match frontmatter schema. newsletter-edition-template.md reference exists. Scenarios from charter US-7 and US-9 covered.
- **Dependencies:** Wave 1 (team directory exists)
- **Execution mode:** Parallel (2 independent skills)
- **Agent:** Direct execution

### Step 3: Create `newsletter-producer` agent (B3)

- **Backlog:** I31-EDPUB-B03
- **What:** Create coordination agent that orchestrates the full newsletter pipeline
- **Template:** `agents/engineering-lead.md` (coordination agent pattern)
- **Files:**
  - Create: `agents/newsletter-producer.md`
- **Key decisions:**
  - Classification: type=coordination, color=purple, field=editorial, expertise=expert, execution=coordinated, model=sonnet
  - Core skills: `editorial-team/newsletter-assembly`, `editorial-team/story-selection`
  - Related agents: `editorial-writer`, `fact-checker`, `poll-writer`, `voice-consistency-reviewer`, `reader-clarity-reviewer`, `editorial-accuracy-reviewer`
  - Collaborates-with: all 6 agents with clear handoff descriptions
  - 7-step pipeline: segment script -> select stories -> draft each story -> screen each draft -> generate poll -> assemble newsletter -> run editorial review gate
  - 2+ examples (full pipeline with auto-select, pipeline with explicit story picks)
- **Acceptance criteria:** Agent passes `/agent/validate`. 7-step pipeline defined. References all 6 collaborating agents. Scenarios 6.1, 6.2 pass.
- **Dependencies:** Step 1 (editorial-writer must exist), Step 2 (skills must exist)
- **Execution mode:** Solo
- **Agent:** `agent-author` or direct execution

### Step 4: Create `newsletter/generate` command (B6)

- **Backlog:** I31-EDPUB-B06
- **What:** Create command that invokes newsletter-producer. Creates new `commands/newsletter/` directory.
- **Template:** `commands/content/fast.md` (simple command pattern)
- **Files:**
  - Create: `commands/newsletter/generate.md`
- **Key decisions:**
  - Parameters: `script` (required), `stories` (optional), `count` (optional, default 3), `voice-ref` (optional)
  - References `newsletter-producer` agent
  - Output: complete newsletter edition in markdown
- **Acceptance criteria:** Command exists with proper frontmatter. References newsletter-producer. Scenarios 10.1, 10.2, INT-2 pass.
- **Dependencies:** Step 3 (newsletter-producer must exist)
- **Execution mode:** Solo
- **Agent:** Direct execution

**Wave 2 exit criteria:** Command-to-agent-to-skill chain resolves end-to-end. Newsletter-producer references editorial-writer from Wave 1.

---

## Wave 3: Quality Layer (B7-B11) -- Mixed

Adds editorial quality controls. Depends on Wave 1 (editorial-writer for cross-refs).

### Step 5: Create `editorial-voice-matching` + `bias-screening` skills (B7 + B9)

- **Backlog:** I31-EDPUB-B07, I31-EDPUB-B09
- **What:** Create two quality-layer skills. Done before their consuming agents (fact-checker, voice-consistency-reviewer).
- **Template:** `skills/marketing-team/content-creator/SKILL.md`
- **Files:**
  - Create: `skills/editorial-team/editorial-voice-matching/SKILL.md`
  - Create: `skills/editorial-team/editorial-voice-matching/references/voice-analysis-template.md`
  - Create: `skills/editorial-team/editorial-voice-matching/references/style-guide-skeleton.md`
  - Create: `skills/editorial-team/bias-screening/SKILL.md`
  - Create: `skills/editorial-team/bias-screening/references/loaded-terms-dictionary.md`
- **Key decisions:**
  - **editorial-voice-matching:** Two-layer approach (reference pairs + distilled principles), extraction process for 10+ reference pairs, prompt patterns for voice-matched generation, differentiates from brand_guidelines.md. `references/samples/` directory created empty (Daily Dip content prerequisite). related-agents: `editorial-writer`, `voice-consistency-reviewer`
  - **bias-screening:** 6 detection categories (loaded language, partisan framing, false balance, editorializing-as-reporting, selection bias, attribution asymmetry), severity classification (flag/warning/block), neutral vs centrist distinction, neutral rewriting patterns. related-agents: `fact-checker`, `editorial-writer`, `poll-writer`
- **Acceptance criteria:** Both SKILL.md files match schema. All reference files exist. Voice matching differentiates from brand_guidelines.md. Bias screening covers all 6 categories. Scenarios 3.1-3.3, 5.1-5.2 covered.
- **Dependencies:** Wave 1 (team directory)
- **Execution mode:** Parallel (2 independent skills)
- **Agent:** Direct execution

### Step 6: Create `fact-checker` + `poll-writer` agents (B8 + B10)

- **Backlog:** I31-EDPUB-B08, I31-EDPUB-B10
- **What:** Create two independent agents consuming skills from Step 5
- **Template:** `agents/claims-verifier.md` (quality agent for fact-checker), `agents/content-creator.md` (implementation agent for poll-writer)
- **Files:**
  - Create: `agents/fact-checker.md`
  - Create: `agents/poll-writer.md`
- **Key decisions:**
  - **fact-checker:** type=quality, color=red, field=editorial, expertise=expert, execution=autonomous, model=sonnet. Core skills: `editorial-team/bias-screening`. Collaborates-with: `editorial-writer`. Differentiates from `claims-verifier` (bias/tone/framing vs technical/factual claims). Output: flagged passages + severity + rewording. 2+ examples (partisan framing, loaded language).
  - **poll-writer:** type=implementation, color=green, field=editorial, expertise=advanced, execution=autonomous, model=haiku. Core skills: `editorial-team/bias-screening`, `brainstorming`, `asking-questions`. Poll principles: balanced options, 3-5 choices (4 sweet spot), story-specific, one unexpected option. 2+ examples.
- **Acceptance criteria:** Both agents pass `/agent/validate`. Fact-checker differentiates from claims-verifier. Poll-writer references brainstorming and asking-questions skills. Scenarios 4.1-4.3, 8.1-8.3 pass.
- **Dependencies:** Step 5 (bias-screening skill must exist)
- **Execution mode:** Parallel (2 independent agents)
- **Agent:** `agent-author` or direct execution

### Step 7: Create `content/fact-check` command (B11)

- **Backlog:** I31-EDPUB-B11
- **What:** Create standalone fact-check command reusable for any content
- **Template:** `commands/content/fast.md` (simple command pattern)
- **Files:**
  - Create: `commands/content/fact-check.md`
- **Key decisions:**
  - Parameters: `content` (required), `mode` (optional: full|quick, default full)
  - References `fact-checker` agent
  - Reusable for any content, not just newsletters
- **Acceptance criteria:** Command exists with proper frontmatter. References fact-checker. Scenarios 11.1-11.2 pass.
- **Dependencies:** Step 6 (fact-checker must exist)
- **Execution mode:** Solo
- **Agent:** Direct execution

**Wave 3 exit criteria:** Fact-checker and editorial-writer have consistent collaborates-with entries. Poll-writer references bias-screening. Fact-check command references fact-checker.

---

## Wave 4: Editorial Review Gate (B12-B16) -- Mixed

Adds 3 adversarial review agents, reader-clarity skill, parallel review command. Depends on Wave 3 (fact-checker for editorial-review).

### Step 8: Create `reader-clarity` skill (B14)

- **Backlog:** I31-EDPUB-B14
- **What:** Create reader clarity skill before its consuming agent
- **Template:** `skills/marketing-team/content-creator/SKILL.md`
- **Files:**
  - Create: `skills/editorial-team/reader-clarity/SKILL.md`
  - Create: `skills/editorial-team/reader-clarity/references/jargon-checklist.md`
- **Key decisions:**
  - Readability heuristics: Flesch-Kincaid grade 8-10 target
  - Context budget concept (N assumed-context credits per story)
  - Rewriting patterns (jargon->plain, complex->simple, passive->active)
  - Jargon checklist by domain (tech, politics, business, sports)
  - related-agents: `reader-clarity-reviewer`
- **Acceptance criteria:** SKILL.md matches schema. Jargon checklist reference exists. Scenarios 15.1-15.2 covered.
- **Dependencies:** Wave 1 (team directory)
- **Execution mode:** Solo
- **Agent:** Direct execution

### Step 9: Create 3 review agents (B12 + B13 + B15)

- **Backlog:** I31-EDPUB-B12, I31-EDPUB-B13, I31-EDPUB-B15
- **What:** Create all 3 adversarial review agents in parallel
- **Template:** `agents/claims-verifier.md` (quality agent pattern)
- **Files:**
  - Create: `agents/voice-consistency-reviewer.md`
  - Create: `agents/reader-clarity-reviewer.md`
  - Create: `agents/editorial-accuracy-reviewer.md`
- **Key decisions:**
  - **voice-consistency-reviewer:** type=quality, color=red, field=editorial, model=sonnet. Core skills: `editorial-team/editorial-voice-matching` (adversarial -- checking, not generating). 6 review dimensions (sentence rhythm, vocabulary register, humor calibration, opening/closing, attribution style, info density). Output: 0-100 score + flagged passages. related-agents: `editorial-writer`, `newsletter-producer`.
  - **reader-clarity-reviewer:** type=quality, color=red, field=editorial, model=sonnet. Core skills: `editorial-team/reader-clarity`. 6 review dimensions (jargon, assumed context, unclear antecedents, buried lede, sentence complexity, transition gaps). Differentiates from `cognitive-load-assessor` (editorial content readability vs code complexity). Output: 0-100 score + flagged passages. related-agents: `editorial-writer`, `newsletter-producer`, `cognitive-load-assessor`.
  - **editorial-accuracy-reviewer:** type=quality, color=red, field=editorial, model=sonnet. Core skills: `editorial-team/script-to-article` (adversarial -- comparing output to source). 5 review dimensions (hallucinated facts, misattributed quotes, invented context, material omissions, numerical accuracy). Differentiates from fact-checker (fidelity vs bias) and claims-verifier (source comparison vs external claims). Output: 0-100 score + source comparison. related-agents: `editorial-writer`, `newsletter-producer`, `claims-verifier`, `fact-checker`.
- **Acceptance criteria:** All 3 agents pass `/agent/validate`. All have consistent quality/red classification. Each has 2+ examples. Differentiation sections clear. Scenarios 13.1-13.3, 14.1-14.2, 16.1-16.2 pass.
- **Dependencies:** Step 5 (editorial-voice-matching skill), Step 8 (reader-clarity skill), Step 1 (script-to-article skill)
- **Execution mode:** Parallel (3 independent agents)
- **Agent:** `agent-author` or direct execution

### Step 10: Create `review/editorial-review` command (B16)

- **Backlog:** I31-EDPUB-B16
- **What:** Create parallel editorial review command following review-changes pattern
- **Template:** `commands/review/review-changes.md` (parallel review command pattern)
- **Files:**
  - Create: `commands/review/editorial-review.md`
- **Key decisions:**
  - Parameters: `newsletter` (required), `source` (required), `voice-ref` (optional)
  - Runs 4 agents in parallel: fact-checker, voice-consistency-reviewer, reader-clarity-reviewer, editorial-accuracy-reviewer
  - 3-tier verdict: PASS / PASS WITH NOTES / FAIL
  - Verdict logic: FAIL = any critical issue, PASS WITH NOTES = flagged but no critical, PASS = clean
- **Acceptance criteria:** Command follows review-changes pattern. References all 4 review agents. 3-tier verdict logic documented. Scenarios 17.1-17.4, INT-3 pass.
- **Dependencies:** Step 6 (fact-checker), Step 9 (3 review agents)
- **Execution mode:** Solo
- **Agent:** Direct execution

**Wave 4 exit criteria:** All 4 review agents have consistent quality/red classification. Editorial-review command references all 4. Review gate pattern proven.

---

## Wave 5: Cross-References and Catalog Updates (B17a-B18) -- Sequential

Integrates editorial team into broader repo. Depends on Waves 1-4.

### Step 11: Cross-references, team CLAUDE.md, and README updates (B17a + B17b + B17c + B17d)

- **Backlog:** I31-EDPUB-B17a, I31-EDPUB-B17b, I31-EDPUB-B17c, I31-EDPUB-B17d
- **What:** Wire editorial team into existing repo. All 4 sub-items are small edits that logically belong in one step.
- **Template:** `skills/marketing-team/CLAUDE.md` (team CLAUDE.md pattern)
- **Files:**
  - Modify: `agents/content-creator.md` -- add `editorial-writer` to `related-agents`
  - Modify: `agents/copywriter.md` -- add `editorial-writer` to `related-agents`
  - Modify: `agents/claims-verifier.md` -- add `fact-checker` to `related-agents`
  - Create: `skills/editorial-team/CLAUDE.md` -- team overview listing 6 skills, 7 agents
  - Modify: `agents/README.md` -- add "Editorial" section with 7 agent entries
  - Modify: `skills/README.md` -- add `editorial-team` section with 6 skill entries
- **Acceptance criteria:**
  - 3 existing agents updated with correct cross-refs, all still pass `/agent/validate`
  - Team CLAUDE.md follows marketing-team pattern
  - agents/README.md has Editorial section with all 7 agents
  - skills/README.md has editorial-team section with all 6 skills
  - Scenarios 12.1-12.6, INT-4, INT-5, INT-6 pass
- **Dependencies:** Waves 1-4 (all 7 agents and 6 skills must exist)
- **Execution mode:** Solo (sequential edits to avoid conflicts on shared files)
- **Agent:** Direct execution

### Step 12: Final validation gate (B18)

- **Backlog:** I31-EDPUB-B18
- **What:** Run `/agent/validate --all --summary` as final quality gate
- **Files:** None created/modified
- **Validation targets:**
  - 7 new agents: editorial-writer, newsletter-producer, fact-checker, poll-writer, voice-consistency-reviewer, reader-clarity-reviewer, editorial-accuracy-reviewer
  - 3 modified agents: content-creator, copywriter, claims-verifier
- **Acceptance criteria:** All 10 agents pass `/agent/validate` with zero errors. SC-20 satisfied. Zero regressions across full agent catalog.
- **Dependencies:** Step 11 complete
- **Execution mode:** Solo
- **Agent:** `agent-validator`

**Wave 5 exit criteria:** Agent graph fully connected. READMEs updated. Team CLAUDE.md created. All 10 agents pass validation.

---

## Step Summary

| Step | Wave | Backlog | What | Files | Mode | Deps |
|------|------|---------|------|-------|------|------|
| 1 | W1 | B1+B2 | editorial-writer agent + script-to-article skill | 3 create | Solo | None |
| 2 | W2 | B4+B5 | story-selection + newsletter-assembly skills | 3 create | Parallel | W1 |
| 3 | W2 | B3 | newsletter-producer agent | 1 create | Solo | S1, S2 |
| 4 | W2 | B6 | newsletter/generate command | 1 create | Solo | S3 |
| 5 | W3 | B7+B9 | editorial-voice-matching + bias-screening skills | 5 create | Parallel | W1 |
| 6 | W3 | B8+B10 | fact-checker + poll-writer agents | 2 create | Parallel | S5 |
| 7 | W3 | B11 | content/fact-check command | 1 create | Solo | S6 |
| 8 | W4 | B14 | reader-clarity skill | 2 create | Solo | W1 |
| 9 | W4 | B12+B13+B15 | 3 review agents | 3 create | Parallel | S5, S8, S1 |
| 10 | W4 | B16 | review/editorial-review command | 1 create | Solo | S6, S9 |
| 11 | W5 | B17a-d | Cross-refs + team CLAUDE.md + READMEs | 3 create, 5 modify | Solo | W1-W4 |
| 12 | W5 | B18 | Final validation gate | 0 | Solo | S11 |
| **Total** | | **18 items** | **7 agents, 6 skills, 3 commands, team CLAUDE.md** | **~25 files** | | |

---

## Success Criteria Traceability

| SC | Criterion | Plan Step |
|----|-----------|-----------|
| SC-1 | editorial-writer exists + validates | S1, S12 |
| SC-2 | script-to-article skill exists with 5 transformation areas | S1 |
| SC-3 | editorial-voice-matching skill exists with two-layer approach | S5 |
| SC-4 | fact-checker exists + validates, differentiates from claims-verifier | S6, S12 |
| SC-5 | bias-screening skill exists with 6 detection categories | S5 |
| SC-6 | newsletter-producer exists + validates with 7-step pipeline | S3, S12 |
| SC-7 | story-selection skill exists with 5 evaluation criteria | S2 |
| SC-8 | poll-writer exists + validates with balanced poll principles | S6, S12 |
| SC-9 | newsletter-assembly skill exists with edition template | S2 |
| SC-10 | newsletter/generate command exists | S4 |
| SC-11 | content/fact-check command exists | S7 |
| SC-12 | 3 review agents exist + validate with 0-100 scoring | S9, S12 |
| SC-13 | reader-clarity skill exists with Flesch-Kincaid target | S8 |
| SC-14 | review/editorial-review command with 3-tier verdict | S10 |
| SC-15 | Cross-refs on content-creator, copywriter, claims-verifier | S11 |
| SC-16 | agents/README.md has Editorial section with 7 entries | S11 |
| SC-17 | skills/README.md has editorial-team section with 6 entries | S11 |
| SC-18 | skills/editorial-team/CLAUDE.md exists | S11 |
| SC-19 | Agent graph fully connected (bidirectional refs) | S11 |
| SC-20 | All 10 agents pass `/agent/validate --all` zero regressions | S12 |

---

## Execution Recommendation

- **Method:** Subagent-driven development (waves map to sequential batches; steps within each wave run in parallel where marked)
- **Agent:** `engineering-lead` with `subagent-driven-development` skill
- **Rationale:** 12 steps across 5 waves. Each wave has 2-4 steps, several parallelizable. Subagent dispatch maximizes throughput within waves. All work is docs-only (no build/test/deploy), so iteration cycles are fast.
- **Cost tier notes:**
  - S1-S10 (agent/skill/command authoring): T2 -- pattern-following work, each file follows conventions from pre-step. Could use haiku/gemini for initial draft, sonnet for quality review.
  - S11 (cross-ref edits + README updates): T1 -- mechanical frontmatter edits and catalog entries, deterministic
  - S12 (validation): T1 -- run existing validation script
- **Estimated effort:** ~25 files, all docs-only. With parallel execution within waves, completable in 5 sequential batches. No code, no tests, no deploy pipeline -- pure documentation initiative.
