---
type: backlog
endeavor: repo
initiative: I31-EDPUB
initiative_name: editorial-publishing-pipeline
status: todo
updated: 2026-03-05
---

# Backlog: I31-EDPUB -- Editorial Publishing Pipeline

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by wave, charter outcome, and dependency. Implementers pull from here; execution is planned in the plan doc.

## Architecture Design

### Directory Structure

```
skills/editorial-team/                    # NEW team directory
  CLAUDE.md                               # Team overview (pattern: marketing-team/CLAUDE.md)
  script-to-article/
    SKILL.md
    references/
      transformation-checklist.md
  editorial-voice-matching/
    SKILL.md
    references/
      voice-analysis-template.md
      style-guide-skeleton.md
      samples/                            # Reference pairs (future: Daily Dip content)
  bias-screening/
    SKILL.md
    references/
      loaded-terms-dictionary.md
  story-selection/
    SKILL.md
  newsletter-assembly/
    SKILL.md
    references/
      newsletter-edition-template.md
  reader-clarity/
    SKILL.md
    references/
      jargon-checklist.md

agents/                                   # Existing directory
  editorial-writer.md                     # NEW (implementation/green)
  fact-checker.md                         # NEW (quality/red)
  newsletter-producer.md                  # NEW (coordination/purple)
  poll-writer.md                          # NEW (implementation/green, haiku)
  voice-consistency-reviewer.md           # NEW (quality/red)
  reader-clarity-reviewer.md              # NEW (quality/red)
  editorial-accuracy-reviewer.md          # NEW (quality/red)

commands/newsletter/                      # NEW command category
  generate.md
commands/content/
  fact-check.md                           # NEW (existing category)
commands/review/
  editorial-review.md                     # NEW (existing category)
```

### File Organization

| Artifact Type | Template (use as pattern) | Key Sections |
|---|---|---|
| Agent (implementation) | `agents/content-creator.md` | Frontmatter schema, When to Use table, Skill Integration, Workflows |
| Agent (quality/review) | `agents/claims-verifier.md` | Quality type, red color, adversarial framing |
| Agent (coordination) | `agents/engineering-lead.md` | Purple color, coordinated execution, orchestration workflows |
| Skill SKILL.md | `skills/marketing-team/content-creator/SKILL.md` | Frontmatter with metadata block, domain, related-agents |
| Team CLAUDE.md | `skills/marketing-team/CLAUDE.md` | Team overview, available skills list, tool summary |
| Command (simple) | `commands/content/fast.md` | YAML frontmatter (description + argument-hint), workflow section |
| Command (parallel review) | `commands/review/review-changes.md` | Parallel agent dispatch, combined report, verdict logic |

### Cross-Reference Strategy

The 7 agents, 6 skills, and 3 commands form a directed graph. Wiring rules:

**Agent → Skill (core skills in frontmatter):**

| Agent | Core Skills |
|---|---|
| editorial-writer | editorial-team/script-to-article, editorial-team/editorial-voice-matching |
| fact-checker | editorial-team/bias-screening |
| newsletter-producer | editorial-team/newsletter-assembly, editorial-team/story-selection |
| poll-writer | editorial-team/bias-screening, brainstorming, asking-questions |
| voice-consistency-reviewer | editorial-team/editorial-voice-matching |
| reader-clarity-reviewer | editorial-team/reader-clarity |
| editorial-accuracy-reviewer | editorial-team/script-to-article |

**Agent → Agent (collaborates-with):**

| Agent | Collaborates With | Handoff |
|---|---|---|
| editorial-writer | fact-checker | Draft handoff for neutrality review |
| fact-checker | editorial-writer | Receives drafts, returns flagged issues |
| newsletter-producer | editorial-writer, fact-checker, poll-writer, voice-consistency-reviewer, reader-clarity-reviewer, editorial-accuracy-reviewer | Pipeline orchestration |

**Agent → Agent (related-agents, bidirectional):**

- editorial-writer <-> fact-checker, newsletter-producer, content-creator
- fact-checker <-> editorial-writer, newsletter-producer, claims-verifier
- newsletter-producer <-> editorial-writer, fact-checker, poll-writer, voice-consistency-reviewer, reader-clarity-reviewer, editorial-accuracy-reviewer
- poll-writer <-> newsletter-producer, editorial-writer
- voice-consistency-reviewer <-> editorial-writer, newsletter-producer
- reader-clarity-reviewer <-> editorial-writer, newsletter-producer, cognitive-load-assessor
- editorial-accuracy-reviewer <-> editorial-writer, newsletter-producer, claims-verifier, fact-checker

**Command → Agent (references):**

| Command | References |
|---|---|
| newsletter/generate | newsletter-producer |
| content/fact-check | fact-checker |
| review/editorial-review | fact-checker, voice-consistency-reviewer, reader-clarity-reviewer, editorial-accuracy-reviewer |

**Existing agent updates (Wave 5):**

| Existing Agent | Add to related-agents |
|---|---|
| content-creator | editorial-writer |
| copywriter | editorial-writer |
| claims-verifier | fact-checker |

**Skill → Agent (related-agents in skill frontmatter):**

| Skill | Related Agents |
|---|---|
| script-to-article | editorial-writer, newsletter-producer, editorial-accuracy-reviewer |
| editorial-voice-matching | editorial-writer, voice-consistency-reviewer |
| bias-screening | fact-checker, editorial-writer, poll-writer |
| story-selection | newsletter-producer |
| newsletter-assembly | newsletter-producer |
| reader-clarity | reader-clarity-reviewer |

### Dependency Graph

```
Wave 1 (no deps)
  B1: editorial-writer agent ──┐
  B2: script-to-article skill ─┤── agent-skill wiring proven
                                │
Wave 2 (depends on W1)         │
  B3: newsletter-producer ─────┤── references editorial-writer from W1
  B4: story-selection skill ────┤
  B5: newsletter-assembly skill ┤
  B6: generate command ─────────┤── references newsletter-producer from B3
                                │
Wave 3 (depends on W1)         │
  B7: editorial-voice-matching ─┤── used by editorial-writer from W1
  B8: fact-checker agent ───────┤── collaborates-with editorial-writer from W1
  B9: bias-screening skill ─────┤── used by fact-checker from B8
  B10: poll-writer agent ───────┤── related to newsletter-producer from B3
  B11: fact-check command ──────┤── references fact-checker from B8
                                │
Wave 4 (depends on W3)         │
  B12: voice-consistency-reviewer ─┤── uses editorial-voice-matching from B7
  B13: reader-clarity-reviewer ────┤
  B14: reader-clarity skill ───────┤── used by B13
  B15: editorial-accuracy-reviewer ┤── references fact-checker from B8
  B16: editorial-review command ───┤── references B8, B12, B13, B15
                                   │
Wave 5 (depends on W1-W4)         │
  B17: cross-refs + catalog ───────┘── all 7 agents + 6 skills must exist
```

### Walking Skeleton Definition

**Thinnest vertical slice:** B1 (editorial-writer) + B2 (script-to-article)

This proves:
1. New team directory creation (`skills/editorial-team/`)
2. Agent file creation with valid frontmatter and classification
3. Skill file creation with valid frontmatter, methodology, and reference files
4. Agent-to-skill bidirectional wiring (agent references skill, skill references agent)
5. `/agent/validate` passing for new editorial-domain agent

**Walking skeleton acceptance criteria:**
- `agents/editorial-writer.md` passes `/agent/validate`
- `skills/editorial-team/script-to-article/SKILL.md` exists with frontmatter
- Agent's `skills` field resolves to the skill path
- Skill's `related-agents` includes `editorial-writer`
- Charter scenarios 1.1, 1.2, 2.1, 2.2, INT-1 pass

## Changes (ranked)

Full ID prefix for this initiative: **I31-EDPUB**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I31-EDPUB-B01, I31-EDPUB-B02, etc.

### Wave 1: Walking Skeleton -- Agent-Skill Wiring

Proves core agent-skill wiring and the fundamental transformation capability. No external dependencies.

| ID | Change | US | Outcome | Complexity | Parallel | Status |
|----|--------|----|---------|------------|----------|--------|
| B1 | Create `agents/editorial-writer.md` -- implementation agent (type=implementation, color=green, field=editorial, expertise=expert, execution=autonomous, model=sonnet). Core skills: `editorial-team/script-to-article`, `editorial-team/editorial-voice-matching`. Related skills: `editorial-team/bias-screening`. Related agents: `fact-checker`, `newsletter-producer`, `content-creator`. Collaborates-with: `fact-checker` (draft handoff for neutrality review). Purpose: script-to-article transformation, voice matching from reference samples, neutral/factual tone, removing verbal artifacts from spoken scripts. Differentiates from `content-creator`: editorial-writer = neutral reporting (no persuasion); content-creator = marketing content (deliberate persuasion). 2+ examples (teleprompter script to newsletter article, podcast transcript to show notes). 2+ workflows (Newsletter Article Drafting, Transcript-to-Article). Must pass `/agent/validate`. | US-1 | O1 | moderate | yes (W1) | todo |
| B2 | Create `skills/editorial-team/script-to-article/SKILL.md` + `references/transformation-checklist.md`. Create team directory `skills/editorial-team/`. Covers 5 transformation areas: removing verbal tics/filler/teleprompter cues, restructuring spoken flow to reading flow, preserving factual content and reporting angles, condensing without losing substance (3-5x compression ratio guidelines), handling multi-story scripts (story boundary segmentation). Story segmentation patterns documented. Compression ratio guidelines included. Related-agents: `editorial-writer`, `newsletter-producer`, `editorial-accuracy-reviewer`. | US-2 | O2 | moderate | yes (W1) | todo |

**Wave 1 acceptance:** B1 agent references B2 skill. Bidirectional references resolve. Both pass validation. Scenarios 1.1, 1.2, 2.1, 2.2, INT-1 pass.

### Wave 2: Pipeline Orchestration

Proves the coordination agent pattern, command-to-agent wiring, and end-to-end pipeline definition. Depends on Wave 1 (newsletter-producer references editorial-writer).

| ID | Change | US | Outcome | Complexity | Parallel | Status |
|----|--------|----|---------|------------|----------|--------|
| B3 | Create `agents/newsletter-producer.md` -- coordination agent (type=coordination, color=purple, field=editorial, expertise=expert, execution=coordinated, model=sonnet). Core skills: `editorial-team/newsletter-assembly`, `editorial-team/story-selection`. Related agents: `editorial-writer`, `fact-checker`, `poll-writer`, `voice-consistency-reviewer`, `reader-clarity-reviewer`, `editorial-accuracy-reviewer`. Collaborates-with entries for all 6 collaborating agents with clear handoff descriptions. 7-step pipeline defined (segment script, select stories, draft each story, screen each draft, generate poll, assemble newsletter, run editorial review gate). 2+ examples (full pipeline with auto-select, pipeline with explicit story picks). 1+ workflow (Full Newsletter Generation). Must pass `/agent/validate`. | US-6 | O3 | complex | no (needs B1) | todo |
| B4 | Create `skills/editorial-team/story-selection/SKILL.md`. Two modes: explicit (caller specifies stories by index/keyword/topic) and auto-select (evaluates all stories against 5 criteria, picks N default 3). Evaluation criteria: audience relevance, newsworthiness, topic diversity, engagement potential, narrative strength. Scoring model with weighted composite score and diversity constraint. Output: selected stories + rationale. Related-agents: `newsletter-producer`. | US-7 | O4 | simple | yes (W2) | todo |
| B5 | Create `skills/editorial-team/newsletter-assembly/SKILL.md` + `references/newsletter-edition-template.md`. Edition template: subject line, 3 stories (lead=longest/most impactful), poll with context sentence, show notes/links, standard footer. Subject line methodology (3-5 candidates, curiosity gap/key story/question format). Story ordering logic (lead with strongest, end with most engaging, middle for substance). Format-agnostic output (markdown targeting email HTML, CMS, or plain text). Related-agents: `newsletter-producer`. | US-9 | O5 | simple | yes (W2) | todo |
| B6 | Create `commands/newsletter/generate.md`. Create `commands/newsletter/` directory. Parameters: `script` (required, path to teleprompter script), `stories` (optional, explicit picks), `count` (optional, default 3), `voice-ref` (optional, path to voice reference directory). References `newsletter-producer` agent. Output: complete newsletter edition in markdown. Follows existing command format conventions (pattern: `commands/content/fast.md`). | US-10 | O6 | simple | no (needs B3) | todo |

**Wave 2 acceptance:** B3 references B1's editorial-writer. B6 references B3's newsletter-producer. Command-to-agent-to-skill chain resolves end-to-end. Scenarios 6.1, 6.2, 10.1, 10.2, INT-2 pass.

**Parallelization:** B4 and B5 can run in parallel (independent skills). B3 must complete before B6 (command references agent). B3 depends on B1 (references editorial-writer).

### Wave 3: Quality Layer

Adds editorial quality controls: voice matching, bias screening, fact-checking, poll generation, and the standalone fact-check command. Depends on Wave 1 (editorial-writer exists for cross-references).

| ID | Change | US | Outcome | Complexity | Parallel | Status |
|----|--------|----|---------|------------|----------|--------|
| B7 | Create `skills/editorial-team/editorial-voice-matching/SKILL.md` + `references/voice-analysis-template.md` + `references/style-guide-skeleton.md`. Two-layer approach: Layer 1 = reference pairs (raw transcript + finished article side-by-side, stored in `references/samples/`), Layer 2 = distilled principles (concise style guide extracted from pairs). Documents extraction process (how to analyze 10+ reference pairs and distill into style guide). Includes prompt patterns for voice-matched generation (system-level voice instructions + per-article generation prompts). Differentiates from `brand_guidelines.md` (example-based pattern matching vs archetype selection). Related-agents: `editorial-writer`, `voice-consistency-reviewer`. Note: `references/samples/` directory created but populated separately (Daily Dip Google Drive prerequisite). | US-3 | O7 | complex | yes (W3) | todo |
| B8 | Create `agents/fact-checker.md` -- quality agent (type=quality, color=red, field=editorial, expertise=expert, execution=autonomous, model=sonnet). Core skills: `editorial-team/bias-screening`. Related agents: `editorial-writer`, `newsletter-producer`, `claims-verifier`. Collaborates-with: `editorial-writer` (receives drafts, returns flagged issues). Differentiates from `claims-verifier`: claims-verifier validates technical/factual claims in plans/research; fact-checker screens editorial content for bias, tone, inflammatory language, and partisan framing. Output format: flagged passages with issue type, severity, and suggested neutral rewording. 2+ examples (partisan framing in political story, loaded language in tech industry story). 2+ workflows (Full Editorial Review, Quick Bias Scan). Must pass `/agent/validate`. | US-4 | O8 | moderate | yes (W3) | todo |
| B9 | Create `skills/editorial-team/bias-screening/SKILL.md` + `references/loaded-terms-dictionary.md`. 6 detection categories: loaded language, partisan framing, false balance, editorializing-as-reporting, selection bias, attribution asymmetry. Severity classification (flag vs warning vs block). Neutral rewriting patterns (loaded term -> neutral alternative, with examples). Documents neutral vs centrist distinction (neutral = not taking sides, not splitting the difference). Related-agents: `fact-checker`, `editorial-writer`, `poll-writer`. | US-5 | O9 | moderate | yes (W3) | todo |
| B10 | Create `agents/poll-writer.md` -- implementation agent (type=implementation, color=green, field=editorial, expertise=advanced, execution=autonomous, model=haiku). Core skills: `editorial-team/bias-screening`, `brainstorming`, `asking-questions`. Related agents: `newsletter-producer`, `editorial-writer`. Poll construction principles: genuinely interesting questions, balanced answer options (no obviously correct answer), lighter/more playful tone than articles, story-specific (not generic), 3-5 options (4 sweet spot), one slightly unexpected/humorous option when appropriate. 2+ examples with full article -> poll generation. Must pass `/agent/validate`. | US-8 | O10 | simple | yes (W3) | todo |
| B11 | Create `commands/content/fact-check.md`. Parameters: `content` (required, path to content file or inline text), `mode` (optional, `full` or `quick`, default `full`). References `fact-checker` agent. Output: flagged issues with severity, passage, and suggested alternatives. Reusable for any content, not just newsletters. Follows existing command format conventions. | US-11 | O11 | simple | no (needs B8) | todo |

**Wave 3 acceptance:** B8 references B9 skill. B10 references B9 for bias screening. B11 references B8's fact-checker. Scenarios 3.1-3.3, 4.1-4.3, 5.1-5.2, 8.1-8.3, 11.1-11.2 pass.

**Parallelization:** B7, B8, B9, B10 can all run in parallel (independent agents/skills). B11 must wait for B8 (command references fact-checker agent). B9 should precede B8 and B10 ideally (skill before agent), but since these are docs-only, the cross-reference can be wired in any order.

### Wave 4: Editorial Review Gate

Adds the 3 adversarial review agents, the reader-clarity skill, and the parallel editorial review command. Depends on Wave 3 (fact-checker must exist for editorial-review to reference it).

| ID | Change | US | Outcome | Complexity | Parallel | Status |
|----|--------|----|---------|------------|----------|--------|
| B12 | Create `agents/voice-consistency-reviewer.md` -- quality agent (type=quality, color=red, field=editorial, expertise=expert, execution=autonomous, model=sonnet). Core skills: `editorial-team/editorial-voice-matching` (uses same skill adversarially -- checking output, not generating it). Related agents: `editorial-writer`, `newsletter-producer`. 6 review dimensions: sentence rhythm, vocabulary register, humor/wit calibration, opening/closing conventions, attribution style, information density. Output: voice consistency score (0-100) + flagged passages with "reference says X, draft does Y" comparisons. 2+ examples (overly formal language in casual publication, missing humor in witty publication). Must pass `/agent/validate`. | US-13 | O12 | moderate | yes (W4) | todo |
| B13 | Create `agents/reader-clarity-reviewer.md` -- quality agent (type=quality, color=red, field=editorial, expertise=expert, execution=autonomous, model=sonnet). Core skills: `editorial-team/reader-clarity`. Related agents: `editorial-writer`, `newsletter-producer`, `cognitive-load-assessor`. Differentiates from `cognitive-load-assessor`: cognitive-load-assessor measures code complexity (8 dimensions, CLI score); reader-clarity-reviewer measures editorial content readability for general audience. 6 review dimensions: jargon/acronyms, assumed context, unclear antecedents, buried lede, sentence complexity, transition gaps. Output: clarity score (0-100) + flagged passages with issue type and suggested rewrite. 2+ examples. Must pass `/agent/validate`. | US-14 | O13 | moderate | yes (W4) | todo |
| B14 | Create `skills/editorial-team/reader-clarity/SKILL.md` + `references/jargon-checklist.md`. Readability heuristics: Flesch-Kincaid grade 8-10 target, jargon detection patterns (industry terms, acronyms, initialisms), 30-second test (can reader get key point in 30s of scanning), friend test (explain to non-expert without additional context). Context budget concept (N assumed-context credits per story, each unexplained reference spends one, zero = reader lost). Rewriting patterns: jargon -> plain language, complex -> simple, passive -> active. Jargon checklist organized by domain (tech, politics, business, sports). Related-agents: `reader-clarity-reviewer`. | US-15 | O14 | moderate | yes (W4) | todo |
| B15 | Create `agents/editorial-accuracy-reviewer.md` -- quality agent (type=quality, color=red, field=editorial, expertise=expert, execution=autonomous, model=sonnet). Core skills: `editorial-team/script-to-article` (uses same skill adversarially -- comparing output back to source, not transforming). Related agents: `editorial-writer`, `newsletter-producer`, `claims-verifier`, `fact-checker`. Differentiates from fact-checker (bias/tone vs fidelity) and claims-verifier (external claims vs source script comparison). 5 review dimensions: hallucinated facts, misattributed quotes, invented context, material omissions, numerical accuracy. Output: accuracy score (0-100) + flagged passages with source comparison. 2+ examples (hallucinated statistic, misattributed quote). Must pass `/agent/validate`. | US-16 | O15 | moderate | yes (W4) | todo |
| B16 | Create `commands/review/editorial-review.md`. Follows `review/review-changes` pattern (parallel agent execution, combined report). Parameters: `newsletter` (required, path to assembled newsletter), `source` (required, path to original teleprompter script), `voice-ref` (optional, path to voice reference directory). Runs 4 agents in parallel: fact-checker, voice-consistency-reviewer, reader-clarity-reviewer, editorial-accuracy-reviewer. Combined output: per-agent findings + overall verdict (PASS / PASS WITH NOTES / FAIL). Verdict logic: FAIL = any critical issue, PASS WITH NOTES = flagged items but no critical, PASS = clean/trivial only. Follows existing command format conventions. | US-17 | O16 | moderate | no (needs B8, B12, B13, B15) | todo |

**Wave 4 acceptance:** All 4 review agents have consistent quality/red classification. B16 references all 4 review agents. Scenarios 13.1-13.3, 14.1-14.2, 15.1-15.2, 16.1-16.2, 17.1-17.4, INT-3 pass.

**Parallelization:** B12, B13, B14, B15 can all run in parallel (independent agents/skills). B14 should precede B13 ideally (skill before agent consumer). B16 must wait for B12, B13, B15 (command references all review agents) and B8 from Wave 3.

### Wave 5: Cross-References and Catalog Updates

Integrates the editorial team into the broader repo. Depends on Waves 1-4 (all 7 agents and 6 skills must exist before catalog entries reference them).

| ID | Change | US | Outcome | Complexity | Parallel | Status |
|----|--------|----|---------|------------|----------|--------|
| B17a | Update 3 existing agents with cross-references. (a) `content-creator`: add `editorial-writer` to `related-agents`. (b) `copywriter`: add `editorial-writer` to `related-agents`. (c) `claims-verifier`: add `fact-checker` to `related-agents`. All 3 must still pass `/agent/validate`. | US-12 (AC 1-3) | O17 | simple | yes (W5, 3 sub-edits) | todo |
| B17b | Create `skills/editorial-team/CLAUDE.md` -- team overview following `skills/marketing-team/CLAUDE.md` pattern. Lists all 6 skills with descriptions. Summarizes team purpose (editorial/journalism content production pipeline). Lists the 7 agents that consume these skills. | US-12 (AC 6) | O17 | simple | yes (W5) | todo |
| B17c | Update `agents/README.md` with 7 new agent entries in new "Editorial" section. 4 production pipeline agents (editorial-writer, newsletter-producer, fact-checker, poll-writer) + 3 review gate agents (voice-consistency-reviewer, reader-clarity-reviewer, editorial-accuracy-reviewer). Follow existing format (name, description, classification, key skills). | US-12 (AC 4) | O17 | simple | no (after B17a) | todo |
| B17d | Update `skills/README.md` with `editorial-team` section listing 6 skills. Follow existing format. | US-12 (AC 5) | O17 | simple | yes (W5) | todo |
| B18 | Run `/agent/validate` on all 10 modified/new agents (7 new + 3 modified) as final quality gate. Verify zero regressions across all agents with `--all --summary`. | SC-20 | -- | trivial | no (after B17a-d) | todo |

**Wave 5 acceptance:** Agent graph fully connected. READMEs updated. Team CLAUDE.md created. All 10 agents pass validation (SC-20). Scenarios 12.1-12.6, INT-4, INT-5, INT-6 pass.

**Parallelization:** B17a, B17b, B17d can run in parallel. B17c depends on B17a (README should reflect final cross-ref state). B18 is the final gate after all Wave 5 items.

## Backlog item lens (per charter)

- **Charter outcome:** Mapped via US and Outcome references in tables.
- **Value/impact:** Wave 1 proves architecture (agent-skill wiring); Wave 2 proves orchestration (coordination agent + command); Wave 3 adds quality controls; Wave 4 completes the adversarial review gate; Wave 5 ensures discoverability.
- **Design/UX:** N/A (internal tooling).
- **Engineering:** Agent frontmatter + body authoring, skill SKILL.md authoring, reference file creation, command file creation.
- **Security/privacy:** N/A.
- **Observability:** N/A.
- **Rollout/comms:** Update agents/README.md and skills/README.md when complete.
- **Acceptance criteria:** Per charter US acceptance criteria and SC-1 through SC-20.
- **Definition of done:** All changes merged; all 10 agents pass `/agent/validate --all`; 7 new agents + 6 new skills + 3 new commands created; no scope overlap with existing skills; editorial-team fully integrated into repo catalogs.

## Summary

| Wave | Items | New Agents | New Skills | New Commands | Other | Parallel? |
|------|-------|-----------|-----------|-------------|-------|-----------|
| 1 | B1-B2 | 1 | 1 | 0 | team dir | B1, B2 parallel |
| 2 | B3-B6 | 1 | 2 | 1 | -- | B4, B5 parallel; B3 then B6 sequential |
| 3 | B7-B11 | 2 | 2 | 1 | -- | B7-B10 parallel; B11 after B8 |
| 4 | B12-B16 | 3 | 1 | 1 | -- | B12-B15 parallel; B16 after all |
| 5 | B17a-B18 | 0 | 0 | 0 | 3 cross-refs, 2 READMEs, team CLAUDE.md, final validate | B17a,b,d parallel; B17c after B17a; B18 last |
| **Total** | **18** | **7** | **6** | **3** | **~22 files** | |

## Links

- Charter: [charter-repo-I31-EDPUB-editorial-publishing-pipeline.md](../charters/charter-repo-I31-EDPUB-editorial-publishing-pipeline.md)
- Roadmap: [roadmap-repo-I31-EDPUB-editorial-publishing-pipeline-2026.md](../roadmaps/roadmap-repo-I31-EDPUB-editorial-publishing-pipeline-2026.md)
- Research: [researcher-20260305-I31-EDPUB-editorial-publishing-pipeline.md](../../reports/researcher-20260305-I31-EDPUB-editorial-publishing-pipeline.md)
