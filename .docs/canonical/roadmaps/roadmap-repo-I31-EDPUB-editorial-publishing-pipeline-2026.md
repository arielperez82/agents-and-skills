# Roadmap: I31-EDPUB — Editorial Publishing Pipeline (2026)

**Initiative:** I31-EDPUB
**Date:** 2026-03-05
**Status:** Draft
**Charter:** [charter-repo-I31-EDPUB](../charters/charter-repo-I31-EDPUB-editorial-publishing-pipeline.md)

## Outcome Sequence

### Wave 1: Walking Skeleton — Agent-Skill Wiring (Must-Have)

Proves the core agent-skill wiring pattern and the fundamental transformation capability. Thinnest vertical slice: one agent + one skill, both passing validation with bidirectional references.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O1 | Editorial writer agent operational | US-1 | Agent passes `/agent/validate`, classification type=implementation/green/editorial, core skills reference script-to-article and editorial-voice-matching, collaborates-with fact-checker, 2+ examples, 2+ workflows |
| O2 | Script-to-article skill operational | US-2 | SKILL.md exists at `skills/editorial-team/script-to-article/`, covers all 5 transformation areas (verbal tics, reading flow, factual preservation, condensing, multi-story), includes compression ratio guidelines, 1+ reference file (transformation checklist) |

**Walking skeleton acceptance:** Scenarios 1.1, 1.2, 2.1, 2.2, INT-1 all pass. Agent-skill bidirectional references resolve.

### Wave 2: Pipeline Orchestration (Must-Have)

Proves the coordination agent pattern, command-to-agent wiring, and end-to-end pipeline definition. Adds story selection and newsletter assembly as core pipeline skills.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O3 | Newsletter producer agent operational | US-6 | Agent passes `/agent/validate`, classification type=coordination/purple/editorial, 7-step pipeline defined, references all 6 collaborating agents |
| O4 | Story selection skill operational | US-7 | SKILL.md exists, explicit + auto-select modes, 5 evaluation criteria, scoring model with diversity constraint, output includes rationale |
| O5 | Newsletter assembly skill operational | US-9 | SKILL.md exists, edition template (subject line, 3 stories, poll, show notes, footer), subject line methodology, story ordering logic, 1+ reference file |
| O6 | Newsletter generate command operational | US-10 | Command exists at `commands/newsletter/generate.md`, required `script` param, optional `stories`/`count`/`voice-ref`, references newsletter-producer, follows command format conventions |

**Pipeline acceptance:** Scenarios 6.1, 6.2, 10.1, 10.2, INT-2 all pass. Command-to-agent-to-skill chain resolves end-to-end.

**Dependency:** Wave 1 (editorial-writer must exist for newsletter-producer to reference it).

### Wave 3: Quality Layer (Must-Have + Should-Have)

Adds editorial quality controls: voice matching, bias screening, fact-checking, poll generation, and the standalone fact-check command.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O7 | Editorial voice matching skill operational | US-3 | SKILL.md exists, two-layer approach (reference pairs + distilled principles), extraction process documented, prompt patterns included, differentiates from brand_guidelines.md, 2+ reference files (voice analysis template, style guide skeleton) |
| O8 | Fact-checker agent operational | US-4 | Agent passes `/agent/validate`, classification type=quality/red/editorial, differentiates from claims-verifier, output format includes flagged passages + severity + rewording, 2+ examples |
| O9 | Bias screening skill operational | US-5 | SKILL.md exists, 6 detection categories, severity classification (flag/warning/block), neutral vs centrist distinction, 1+ reference file (loaded terms dictionary) |
| O10 | Poll writer agent operational | US-8 | Agent passes `/agent/validate`, classification type=implementation/green/haiku, core skills include brainstorming + asking-questions + bias-screening, poll construction principles (balanced, 3-5 options, story-specific), 2+ examples |
| O11 | Fact-check command operational | US-11 | Command exists at `commands/content/fact-check.md`, required `content` param, optional `mode` (full/quick), references fact-checker agent, reusable for any content |

**Quality acceptance:** Scenarios 3.1-3.3, 4.1-4.3, 5.1-5.2, 8.1-8.3, 11.1-11.2 all pass. Fact-checker and editorial-writer have consistent collaborates-with entries.

**Dependency:** Wave 1 (editorial-writer exists for cross-references). Wave 2 (newsletter-producer exists to reference these agents).

### Wave 4: Editorial Review Gate (Must-Have)

Adds the 3 adversarial review agents, the reader clarity skill, and the parallel editorial review command. Completes the newsletter-producer's Step 7.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O12 | Voice consistency reviewer operational | US-13 | Agent passes `/agent/validate`, classification type=quality/red/editorial, 6 review dimensions, output includes 0-100 score + flagged passages, degrades gracefully without reference pairs |
| O13 | Reader clarity reviewer operational | US-14 | Agent passes `/agent/validate`, classification type=quality/red/editorial, 6 review dimensions, differentiates from cognitive-load-assessor, output includes 0-100 score + flagged passages |
| O14 | Reader clarity skill operational | US-15 | SKILL.md exists, readability heuristics (Flesch-Kincaid grade 8-10), context budget concept, rewriting patterns, 1+ reference file (jargon checklist by domain) |
| O15 | Editorial accuracy reviewer operational | US-16 | Agent passes `/agent/validate`, classification type=quality/red/editorial, 5 review dimensions, differentiates from fact-checker and claims-verifier, output includes 0-100 score + source comparison, requires source script input |
| O16 | Editorial review command operational | US-17 | Command exists at `commands/review/editorial-review.md`, required `newsletter` + `source` params, runs 4 agents in parallel, 3-tier verdict (PASS/PASS WITH NOTES/FAIL), follows review-changes pattern |

**Review gate acceptance:** Scenarios 13.1-13.3, 14.1-14.2, 15.1-15.2, 16.1-16.2, 17.1-17.4, INT-3 all pass. All 4 review agents have consistent quality/red classification.

**Dependency:** Wave 3 (fact-checker must exist for editorial-review to reference it). Wave 1 (editorial-writer for cross-references).

### Wave 5: Cross-References and Catalog Updates (Should-Have)

Integrates the editorial team into the broader repo: cross-references from existing agents, README updates, team guide.

| # | Outcome | Stories | Validation |
|---|---------|---------|-----------|
| O17 | Cross-references and catalog integration complete | US-12 | content-creator, copywriter, claims-verifier updated with related-agents refs. agents/README.md has Editorial section with 7 entries. skills/README.md has editorial-team section with 6 skills. skills/editorial-team/CLAUDE.md exists following marketing-team pattern. All modified agents pass `/agent/validate`. |

**Integration acceptance:** Scenarios 12.1-12.6, INT-4, INT-5, INT-6 all pass. `/agent/validate --all` shows zero regressions.

**Dependency:** Waves 1-4 (all 7 agents and 6 skills must exist before catalog updates reference them).

## Dependencies

- Wave 1 has no blockers (can start immediately)
- Wave 2 depends on Wave 1 (newsletter-producer references editorial-writer)
- Wave 3 depends on Wave 1 (fact-checker collaborates-with editorial-writer); US-3 voice matching reference pairs depend on Daily Dip Google Drive content conversion
- Wave 4 depends on Wave 3 (editorial-review command references fact-checker)
- Wave 5 depends on Waves 1-4 (all artifacts must exist for catalog entries)

## Summary

| Wave | Stories | New Agents | New Skills | New Commands | Key Validation |
|------|---------|-----------|-----------|-------------|---------------|
| 1 | US-1, US-2 | 1 | 1 | 0 | Agent-skill wiring proven |
| 2 | US-6, US-7, US-9, US-10 | 1 | 2 | 1 | Pipeline orchestration proven |
| 3 | US-3, US-4, US-5, US-8, US-11 | 2 | 2 | 1 | Quality controls operational |
| 4 | US-13, US-14, US-15, US-16, US-17 | 3 | 1 | 1 | Review gate operational |
| 5 | US-12 | 0 | 0 | 0 | Catalog integration complete |
| **Total** | **17** | **7** | **6** | **3** | **Full pipeline end-to-end** |
