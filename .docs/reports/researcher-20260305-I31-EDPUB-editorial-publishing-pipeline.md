# Research Report: I31-EDPUB Editorial Publishing Pipeline

**Date:** 2026-03-05 | **Scope:** Internal codebase pattern analysis | **Sources:** Repo files only (no external research needed)

## Executive Summary

Charter is well-structured, comprehensive, and implementation-ready. All 7 agents, 6 skills, 3 commands are clearly defined with acceptance criteria. Cross-referenced agents (`content-creator`, `copywriter`, `claims-verifier`) confirmed to exist. No gaps found. Two minor risks: (1) charter says "4 review agents" for editorial-review command but lists 4 (fact-checker + 3 reviewers) — consistent; (2) `newsletter` command category is new (needs directory creation). Recommend proceeding as-is.

## Key Findings

### 1. Template Files for Implementation

| Artifact Type | Template File (use as pattern) | Key Sections |
|---|---|---|
| Agent (implementation) | `agents/content-creator.md` | Frontmatter schema, When to Use table, Skill Integration, Workflows |
| Agent (quality/review) | `agents/claims-verifier.md` | Quality type, red color, adversarial framing |
| Agent (coordination) | `agents/engineering-lead.md` | Purple color, coordinated execution, orchestration workflows |
| Skill SKILL.md | `skills/marketing-team/content-creator/SKILL.md` | Frontmatter with metadata block, domain, related-agents |
| Team CLAUDE.md | `skills/marketing-team/CLAUDE.md` | Team overview, available skills list, tool summary |
| Command (simple) | `commands/content/fast.md` | YAML frontmatter (description + argument-hint), workflow section |
| Command (parallel review) | `commands/review/review-changes.md` | Parallel agent dispatch, combined report, verdict logic |

### 2. Cross-Reference Verification

| Agent Referenced | Exists? | Path |
|---|---|---|
| `content-creator` | Yes | `agents/content-creator.md` |
| `copywriter` | Yes | `agents/copywriter.md` |
| `claims-verifier` | Yes | `agents/claims-verifier.md` |
| `cognitive-load-assessor` | Yes | `agents/cognitive-load-assessor.md` |
| `brainstormer` | Yes | `agents/brainstormer.md` |

Skills referenced by poll-writer (`brainstorming`, `asking-questions`) exist at `skills/brainstorming/` and `skills/asking-questions/`.

### 3. Directory Structure Needed

```
skills/editorial-team/              # NEW team directory
  CLAUDE.md                         # Team overview (pattern: marketing-team/CLAUDE.md)
  script-to-article/SKILL.md
  script-to-article/references/
  editorial-voice-matching/SKILL.md
  editorial-voice-matching/references/samples/
  bias-screening/SKILL.md
  bias-screening/references/
  newsletter-assembly/SKILL.md
  newsletter-assembly/references/
  story-selection/SKILL.md
  reader-clarity/SKILL.md
  reader-clarity/references/
commands/newsletter/                # NEW command category
  generate.md
commands/content/fact-check.md      # Existing category
commands/review/editorial-review.md # Existing category
```

### 4. Frontmatter Conventions (from existing agents)

Agent frontmatter requires these sections in order:
1. `# === CORE IDENTITY ===` — name, title, description, domain, subdomain, skills
2. `# === USE CASES ===` — difficulty, use-cases
3. `# === AGENT CLASSIFICATION ===` — classification block (type, color, field, expertise, execution, model)
4. `# === RELATIONSHIPS ===` — related-agents, related-skills, related-commands, collaborates-with
5. `# === TECHNICAL ===` — tools, dependencies
6. `# === EXAMPLES ===` — examples array

Agent body requires: Purpose, When to Use (if disambiguation needed), Skill Integration, Workflows, Related Agents, References.

### 5. Scope Validation

| Aspect | Assessment |
|---|---|
| 7 agents well-defined? | Yes — 4 production (editorial-writer, fact-checker, newsletter-producer, poll-writer) + 3 review (voice-consistency-reviewer, reader-clarity-reviewer, editorial-accuracy-reviewer). Clear differentiation. |
| 6 skills well-defined? | Yes — each has specific methodology, references required, and clear consumer agents. |
| 3 commands well-defined? | Yes — follows existing patterns. `newsletter/generate` new category; `content/fact-check` extends existing; `review/editorial-review` mirrors `review/review-changes`. |
| Overlaps? | None. Charter explicitly documents differentiators: editorial-writer vs content-creator, fact-checker vs claims-verifier, editorial-accuracy-reviewer vs claims-verifier, reader-clarity-reviewer vs cognitive-load-assessor. |
| Gaps? | None significant. Minor: charter mentions "4 reviewers" in editorial-review command (US-17) = fact-checker + 3 review agents. This is correct per AC. |

### 6. Risk Assessment

| Risk | Severity | Notes |
|---|---|---|
| Docs-only initiative — no code to break | Low | Pure .md files; validation via `/agent/validate` only |
| Voice reference samples depend on external content | Medium | Charter acknowledges this as a prerequisite for US-3. Skill methodology can ship without samples. |
| Agent count (7 new + 3 modified) is large batch | Medium | Mitigate with wave-based execution: walking skeleton first (US-1+US-2+US-6+US-10), then quality layer, then review gate |
| `newsletter` command category is new | Low | Just `mkdir commands/newsletter/` before creating the file |
| Skill frontmatter schema differs from agent schema | Low | Skills use `metadata:` block with nested fields (see content-creator SKILL.md). Agents use flat sections. Use exact templates. |

### 7. Execution Recommendations

**Wave 1 (Walking Skeleton):** US-1 (editorial-writer) + US-2 (script-to-article) — proves agent+skill wiring
**Wave 2:** US-6 (newsletter-producer) + US-7 (story-selection) + US-9 (newsletter-assembly) + US-10 (generate command)
**Wave 3:** US-3 (voice-matching) + US-4 (fact-checker) + US-5 (bias-screening) + US-8 (poll-writer) + US-11 (fact-check command)
**Wave 4:** US-13-16 (3 review agents + reader-clarity skill) + US-17 (editorial-review command)
**Wave 5:** US-12 (cross-references + catalog updates)

Each wave is independently committable and validatable.

## Unresolved Questions

None. Charter is implementation-ready.

## References

All sources are local repo files:
- `agents/content-creator.md` — agent template (implementation type)
- `agents/claims-verifier.md` — agent template (quality type)
- `agents/copywriter.md` — agent template (short-form, haiku model)
- `skills/marketing-team/CLAUDE.md` — team CLAUDE.md template
- `skills/marketing-team/content-creator/SKILL.md` — skill frontmatter template
- `commands/content/fast.md` — simple command template
- `commands/review/review-changes.md` — parallel review command template
