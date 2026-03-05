# Charter: Editorial Publishing Pipeline

**Initiative:** I31-EDPUB
**Date:** 2026-03-05
**Status:** Draft
**First consumer:** Daily Dip Newsletter (Phil & Davin's team)

## Problem Statement

No editorial/journalism capabilities exist in the repo. All content agents assume marketing voice and persuasive intent. Media teams producing newsletters, show notes, and editorial content from source material (teleprompter scripts, transcripts, interviews) have zero coverage. The existing brand voice framework uses marketing archetypes (Expert, Friend, Innovator, Guide, Motivator) — none of which map to neutral, factual reporting.

The Daily Dip newsletter currently takes ~5 hours/week across 2 people and 4 different AI tools (ChatGPT, Perplexity, Claude, Grok) stitched together manually. This initiative creates the agents, skills, and commands to collapse that into a single pipeline with human review at the end.

## Goal

Create a reusable `editorial-team` skill set that can power newsletter generation and generalize to any source-to-publication editorial workflow (podcast show notes, event recaps, earnings call summaries, briefing docs).

## Scope

### In Scope

1. **7 new agents** (`.md` files in `agents/`) — 4 production pipeline + 3 editorial review gate
2. **6 new skills** (SKILL.md + references in `skills/editorial-team/`)
3. **3 new commands** (`commands/newsletter/generate.md`, `commands/content/fact-check.md`, `commands/review/editorial-review.md`)
4. **New team directory** (`skills/editorial-team/`)
5. **Cross-reference updates** to existing agents (`content-creator`, `copywriter`, `claims-verifier`)
6. **README updates** (`agents/README.md`, `skills/README.md`)
7. **Validation** via `/agent/validate`

### Out of Scope

- Slack integration (how the script arrives is a deployment concern, not a skill)
- Google Drive automation (same — ingestion infrastructure is separate)
- Email sending / ESP integration (output is a ready-to-review newsletter)
- Image selection for newsletter editions (human curation for v1)
- MCP tool integrations
- Python scripts (defer to future enhancement — SKILL.md + references first)

## Success Criteria

| # | Criterion | Measurable |
|---|-----------|-----------|
| SC-1 | `editorial-writer` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-2 | `fact-checker` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-3 | `newsletter-producer` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-4 | `poll-writer` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-5 | `script-to-article` skill exists with SKILL.md and at least 1 reference | SKILL.md + references/ |
| SC-6 | `editorial-voice-matching` skill exists with SKILL.md and reference samples | SKILL.md + references/ |
| SC-7 | `bias-screening` skill exists with SKILL.md and at least 1 reference | SKILL.md + references/ |
| SC-8 | `newsletter-assembly` skill exists with SKILL.md and newsletter template | SKILL.md + references/ |
| SC-9 | `story-selection` skill exists with SKILL.md | SKILL.md |
| SC-10 | `newsletter/generate` command exists and references `newsletter-producer` | Command file present |
| SC-11 | `content/fact-check` command exists and references `fact-checker` | Command file present |
| SC-12 | `voice-consistency-reviewer` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-13 | `reader-clarity-reviewer` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-14 | `editorial-accuracy-reviewer` agent exists and passes `/agent/validate` | Pass/Fail |
| SC-15 | `reader-clarity` skill exists with SKILL.md and at least 1 reference | SKILL.md + references/ |
| SC-16 | `review/editorial-review` command exists and references all 4 review agents | Command file present |
| SC-17 | `content-creator` agent updated with `related-agents` ref to `editorial-writer` | Frontmatter includes ref |
| SC-18 | `agents/README.md` updated with 7 new agent entries | Entries present |
| SC-19 | `skills/README.md` updated with editorial-team section and 6 skills | Entries present |
| SC-20 | All 7 new agents + 3 modified agents pass `/agent/validate` | Pass/Fail |

## User Stories

### US-1: Editorial Writer Agent (Must-Have) [Walking Skeleton]

**As a** newsletter producer, **I want** an agent that transforms teleprompter scripts and transcripts into written articles with neutral, factual voice matched to a publication's style, **so that** raw source material becomes publication-ready editorial content.

**Acceptance Criteria:**
1. Agent file `agents/editorial-writer.md` exists with valid frontmatter
2. Classification: type=implementation, color=green, field=editorial, expertise=expert, execution=autonomous, model=sonnet
3. Core skills reference `editorial-team/script-to-article` and `editorial-team/editorial-voice-matching`
4. Related skills include `editorial-team/bias-screening`
5. Related agents include `fact-checker`, `newsletter-producer`, `content-creator`
6. Collaborates-with entry for `fact-checker` (draft handoff for neutrality review)
7. Purpose covers: script-to-article transformation, voice matching from reference samples, neutral/factual tone, removing verbal artifacts from spoken scripts
8. Differentiates from `content-creator`: editorial-writer produces neutral reporting (no persuasion); content-creator produces marketing content (deliberate persuasion). Editorial-writer matches an existing publication's voice from examples; content-creator uses brand archetypes.
9. At least 2 examples: (a) teleprompter script to newsletter article, (b) podcast transcript to show notes
10. At least 2 workflows (Newsletter Article Drafting, Transcript-to-Article)
11. Passes `/agent/validate`

### US-2: Script-to-Article Skill (Must-Have) [Walking Skeleton]

**As an** editorial-writer agent, **I want** a skill that provides methodology for transforming spoken scripts and transcripts into written articles, **so that** I can consistently convert source material into readable editorial content.

**Acceptance Criteria:**
1. Skill at `skills/editorial-team/script-to-article/SKILL.md` with valid frontmatter
2. Covers transformation methodology:
   - Removing verbal tics, filler words, false starts, and teleprompter cues
   - Restructuring spoken flow into reading flow (spoken order != reading order)
   - Preserving factual content and original reporting angles
   - Condensing without losing substance (scripts are typically 3-5x longer than articles)
   - Handling multi-story scripts (segmenting by story boundary)
3. Includes story segmentation patterns (how to identify story boundaries in a multi-topic script)
4. Includes compression ratio guidelines (script → article word count targets)
5. At least 1 reference file: transformation checklist
6. Related-agents includes `editorial-writer`, `newsletter-producer`

### US-3: Editorial Voice Matching Skill (Must-Have)

**As an** editorial-writer agent, **I want** a skill that teaches me to learn and reproduce a publication's voice from example input→output pairs, **so that** my output sounds like the Daily Dip (or any publication), not like generic AI text.

**Acceptance Criteria:**
1. Skill at `skills/editorial-team/editorial-voice-matching/SKILL.md` with valid frontmatter
2. Two-layer voice matching approach:
   - **Layer 1: Reference pairs** — Raw transcript + finished newsletter side-by-side. These are the ground truth. The agent studies what changed between input and output to learn the publication's editorial choices (sentence structure, vocabulary level, humor style, information density, attribution patterns).
   - **Layer 2: Distilled principles** — A concise style guide extracted from the reference pairs. Covers: sentence length targets, vocabulary register, humor/wit usage, attribution style, paragraph structure, transition patterns, opening/closing conventions. This is the "cheat sheet" the agent uses at generation time.
3. Documents the extraction process: how to analyze 10+ reference pairs and distill them into a style guide (not just "read the examples")
4. Includes prompt patterns for voice-matched generation: system-level voice instructions + per-article generation prompts
5. Differentiates from `brand_guidelines.md` (marketing archetypes) — this skill uses example-based pattern matching, not archetype selection
6. At least 2 reference files:
   - Voice analysis template (structured format for documenting a publication's voice from examples)
   - Sample style guide skeleton (fillable template for the distilled principles)
7. Related-agents includes `editorial-writer`

### US-4: Fact-Checker Agent (Must-Have)

**As a** newsletter producer, **I want** an agent that screens content for bias, inflammatory language, and factual accuracy, **so that** published content maintains editorial neutrality and credibility.

**Acceptance Criteria:**
1. Agent file `agents/fact-checker.md` exists with valid frontmatter
2. Classification: type=quality, color=red, field=editorial, expertise=expert, execution=autonomous, model=sonnet
3. Core skills reference `editorial-team/bias-screening`
4. Related agents include `editorial-writer`, `newsletter-producer`, `claims-verifier`
5. Collaborates-with entry for `editorial-writer` (receives drafts, returns flagged issues)
6. Differentiates from `claims-verifier`: claims-verifier validates technical/factual claims in plans and research; fact-checker screens editorial content for bias, tone, inflammatory language, and partisan framing. Different inputs, different outputs, different evaluation criteria.
7. Purpose covers: bias detection, inflammatory language flagging, partisan framing identification, neutral alternative suggestions, factual claim spotting (flags claims that should be verified, without doing the verification itself)
8. Output format: flagged passages with issue type, severity, and suggested neutral rewording
9. At least 2 examples: (a) detecting partisan framing in a political story, (b) flagging loaded language in a tech industry story
10. At least 2 workflows (Full Editorial Review, Quick Bias Scan)
11. Passes `/agent/validate`

### US-5: Bias Screening Skill (Must-Have)

**As a** fact-checker agent, **I want** a skill providing systematic methods for detecting bias, inflammatory language, and editorial neutrality violations, **so that** I can consistently screen content to a professional editorial standard.

**Acceptance Criteria:**
1. Skill at `skills/editorial-team/bias-screening/SKILL.md` with valid frontmatter
2. Covers bias detection categories:
   - **Loaded language**: emotionally charged words that could be replaced with neutral equivalents
   - **Partisan framing**: presenting one side's perspective as default/obvious
   - **False balance**: giving equal weight to unequal evidence
   - **Editorializing-as-reporting**: opinion statements presented as factual reporting
   - **Selection bias**: cherry-picking facts that support a narrative
   - **Attribution asymmetry**: "critics say" vs "experts confirm" for equivalent claims
3. Includes severity classification (flag vs warning vs block)
4. Includes neutral rewriting patterns (loaded term → neutral alternative, with examples)
5. Documents the difference between "neutral" and "centrist" — neutral means not taking sides, not splitting the difference
6. At least 1 reference file: common loaded terms dictionary (organized by topic domain)
7. Related-agents includes `fact-checker`, `editorial-writer`

### US-6: Newsletter Producer Agent (Must-Have)

**As a** newsletter team member, **I want** an orchestration agent that manages the end-to-end newsletter pipeline, **so that** I can go from raw script to ready-to-review newsletter in one command.

**Acceptance Criteria:**
1. Agent file `agents/newsletter-producer.md` exists with valid frontmatter
2. Classification: type=coordination, color=purple, field=editorial, expertise=expert, execution=coordinated, model=sonnet
3. Core skills reference `editorial-team/newsletter-assembly` and `editorial-team/story-selection`
4. Related agents include `editorial-writer`, `fact-checker`, `poll-writer`, `voice-consistency-reviewer`, `reader-clarity-reviewer`, `editorial-accuracy-reviewer`
5. Collaborates-with entries for all collaborating agents with clear handoff descriptions
6. Purpose covers: end-to-end newsletter pipeline orchestration, story selection (auto-select with explicit override), coordinating drafting → fact-check → voice pass → poll → assembly → editorial review gate
7. Pipeline definition:
   - **Input**: Teleprompter script (full show) + optional story picks
   - **Step 1**: Segment script into individual stories (via `script-to-article`)
   - **Step 2**: Select stories — use explicit picks if provided, otherwise auto-select using story-selection criteria
   - **Step 3**: Draft each story (dispatch to `editorial-writer`)
   - **Step 4**: Screen each draft (dispatch to `fact-checker`)
   - **Step 5**: Generate poll from one story (dispatch to `poll-writer`)
   - **Step 6**: Assemble newsletter (via `newsletter-assembly`)
   - **Step 7**: Run editorial review gate (dispatch `/review/editorial-review` — 4 reviewers in parallel)
   - **Output**: Complete newsletter edition + review findings, ready for human review
8. At least 2 examples: (a) full pipeline with auto-select, (b) pipeline with explicit story picks
9. At least 1 workflow (Full Newsletter Generation)
10. Passes `/agent/validate`

### US-7: Story Selection Skill (Must-Have)

**As a** newsletter producer agent, **I want** a skill for selecting which stories to feature from a larger set, **so that** the newsletter consistently picks the most relevant and engaging stories.

**Acceptance Criteria:**
1. Skill at `skills/editorial-team/story-selection/SKILL.md` with valid frontmatter
2. Two modes:
   - **Explicit mode**: Caller specifies which stories (by index, title keyword, or topic). Producer uses these directly.
   - **Auto-select mode**: Agent evaluates all stories against selection criteria and picks N (default 3).
3. Auto-select evaluation criteria:
   - **Audience relevance**: How much will the target audience care about this?
   - **Newsworthiness**: Recency, impact, surprise factor
   - **Topic diversity**: Selected stories should cover different topics (avoid 3 stories about the same thing)
   - **Engagement potential**: Does this story invite discussion, opinion, or action?
   - **Narrative strength**: Does the source material have enough substance for a good article?
4. Scoring model: each criterion weighted, composite score, top N selected with diversity constraint
5. Output: selected stories + rationale (why these, why not the others) for human review
6. Related-agents includes `newsletter-producer`

### US-8: Poll Writer Agent (Must-Have)

**As a** newsletter producer, **I want** an agent that creates fun, engaging, well-constructed polls tied to newsletter stories, **so that** readers interact with the content and the newsletter drives engagement metrics.

**Acceptance Criteria:**
1. Agent file `agents/poll-writer.md` exists with valid frontmatter
2. Classification: type=implementation, color=green, field=editorial, expertise=advanced, execution=autonomous, model=haiku
3. Core skills: `editorial-team/bias-screening` (polls must be neutral too), `brainstorming` (generate multiple options before picking), `asking-questions` (question construction expertise)
4. Related agents include `newsletter-producer`, `editorial-writer`
5. Purpose covers: generating engagement polls from article content, writing fun/clever question framing, creating balanced answer options, avoiding leading questions
6. Poll construction principles:
   - Question must be genuinely interesting (not "did you like this article?")
   - Answer options should be balanced (no obviously "correct" answer)
   - Tone can be lighter/more playful than the articles themselves
   - Must relate to a specific story (not generic)
   - 3-5 answer options (4 is the sweet spot)
   - Include one option that's slightly unexpected/humorous when appropriate
7. At least 2 examples with full article → poll generation
8. Passes `/agent/validate`

### US-9: Newsletter Assembly Skill (Must-Have)

**As a** newsletter producer agent, **I want** a skill that provides templates and methodology for assembling complete newsletter editions, **so that** the final output is consistently formatted and ready to review.

**Acceptance Criteria:**
1. Skill at `skills/editorial-team/newsletter-assembly/SKILL.md` with valid frontmatter
2. Newsletter edition template covering:
   - Subject line (patterns: curiosity gap, key story highlight, question format)
   - Story 1 (lead story — longest, most impactful)
   - Story 2
   - Story 3
   - Poll (with context sentence connecting it to the source story)
   - Show notes / links section
   - Standard footer
3. Subject line generation methodology: 3-5 candidates, A/B testing considerations
4. Story ordering logic: lead with strongest, end with most engaging, middle for substance
5. Format-agnostic output (markdown that can target email HTML, CMS, or plain text)
6. At least 1 reference file: newsletter edition template
7. Related-agents includes `newsletter-producer`

### US-10: Newsletter Generate Command (Must-Have)

**As a** newsletter team member, **I want** a `/newsletter/generate` command that kicks off the full pipeline, **so that** I can generate a newsletter edition with one command.

**Acceptance Criteria:**
1. Command at `commands/newsletter/generate.md`
2. Input parameters:
   - `script`: path to teleprompter script file (required)
   - `stories`: explicit story picks — comma-separated indices or keywords (optional, defaults to auto-select 3)
   - `count`: number of stories to select (optional, default 3)
   - `voice-ref`: path to voice reference directory (optional, defaults to skill's built-in references)
3. References `newsletter-producer` agent
4. Output: complete newsletter edition in markdown
5. Follows existing command format conventions

### US-11: Fact-Check Command (Should-Have)

**As a** content creator or editor, **I want** a `/content/fact-check` command that screens any content for bias and neutrality, **so that** I can use the fact-checker independently of the newsletter pipeline.

**Acceptance Criteria:**
1. Command at `commands/content/fact-check.md`
2. Input parameters:
   - `content`: path to content file or inline text (required)
   - `mode`: `full` (thorough review) or `quick` (bias-only scan) (optional, default `full`)
3. References `fact-checker` agent
4. Output: flagged issues with severity, passage, and suggested alternatives
5. Reusable for any content, not just newsletters

### US-12: Cross-References and Catalog Updates (Should-Have)

**As a** repo user, **I want** existing agents to cross-reference the new editorial agents, and all catalogs to be updated, **so that** the editorial team is discoverable.

**Acceptance Criteria:**
1. `content-creator` frontmatter updated: `related-agents` includes `editorial-writer`
2. `copywriter` frontmatter updated: `related-agents` includes `editorial-writer`
3. `claims-verifier` frontmatter updated: `related-agents` includes `fact-checker`
4. `agents/README.md` updated with 7 new agent entries in new "Editorial" section (4 production + 3 review gate)
5. `skills/README.md` updated with `editorial-team` section listing 6 skills
6. `skills/editorial-team/CLAUDE.md` created with team overview (pattern: `skills/marketing-team/CLAUDE.md`)
7. All modified agents still pass `/agent/validate`

### US-13: Voice Consistency Reviewer Agent (Must-Have)

**As a** newsletter producer, **I want** an adversarial reviewer that checks whether the generated articles actually sound like the target publication, **so that** voice drift from the style guide is caught before human review.

**Acceptance Criteria:**
1. Agent file `agents/voice-consistency-reviewer.md` exists with valid frontmatter
2. Classification: type=quality, color=red, field=editorial, expertise=expert, execution=autonomous, model=sonnet
3. Core skills reference `editorial-team/editorial-voice-matching` (uses the same skill adversarially — checking output, not generating it)
4. Related agents include `editorial-writer`, `newsletter-producer`
5. Purpose covers: comparing generated articles against reference pairs and distilled style guide, flagging voice drift, scoring voice consistency (0-100), identifying specific passages that don't match the publication's patterns
6. Review dimensions:
   - **Sentence rhythm**: Does sentence length/variety match reference patterns?
   - **Vocabulary register**: Are word choices at the right formality level?
   - **Humor/wit calibration**: Right amount, right style, right placement?
   - **Opening/closing conventions**: Do articles start/end the way this publication does?
   - **Attribution style**: Are sources referenced the way this publication does it?
   - **Information density**: Right ratio of detail to summary?
7. Output format: voice consistency score (0-100) + flagged passages with "reference says X, draft does Y" comparisons
8. At least 2 examples: (a) catching overly formal language in a casual publication, (b) catching missing humor in a publication that uses wit
9. Passes `/agent/validate`

### US-14: Reader Clarity Reviewer Agent (Must-Have)

**As a** newsletter producer, **I want** an adversarial reviewer that evaluates whether a casual reader can understand the newsletter in one quick pass, **so that** content is accessible and doesn't assume context the reader doesn't have.

**Acceptance Criteria:**
1. Agent file `agents/reader-clarity-reviewer.md` exists with valid frontmatter
2. Classification: type=quality, color=red, field=editorial, expertise=expert, execution=autonomous, model=sonnet
3. Core skills reference `editorial-team/reader-clarity`
4. Related agents include `editorial-writer`, `newsletter-producer`, `cognitive-load-assessor`
5. Differentiates from `cognitive-load-assessor`: cognitive-load-assessor measures code complexity (8 dimensions, CLI score). Reader-clarity-reviewer measures editorial content readability for a general audience. Different inputs, different heuristics, different output format.
6. Purpose covers: jargon detection, assumed-context flagging, unclear reference identification, lede-burying detection, readability scoring, "explain it to a friend" test
7. Review dimensions:
   - **Jargon/acronyms**: Technical terms or acronyms used without explanation
   - **Assumed context**: References to events, people, or concepts the reader may not know
   - **Unclear antecedents**: Pronouns or references where "who/what" is ambiguous
   - **Buried lede**: The most important information isn't near the top
   - **Sentence complexity**: Overly long or nested sentences that require re-reading
   - **Transition gaps**: Jumps between ideas without connecting logic
8. Output format: clarity score (0-100) + flagged passages with issue type and suggested rewrite
9. At least 2 examples
10. Passes `/agent/validate`

### US-15: Reader Clarity Skill (Must-Have)

**As a** reader-clarity-reviewer agent, **I want** a skill providing systematic methods for evaluating editorial content readability and accessibility, **so that** I can consistently assess whether content works for a general audience.

**Acceptance Criteria:**
1. Skill at `skills/editorial-team/reader-clarity/SKILL.md` with valid frontmatter
2. Covers readability heuristics:
   - Flesch-Kincaid readability targets for newsletter content (aim for grade 8-10)
   - Jargon detection patterns (industry terms, acronyms, initialisms)
   - The "30-second test": can a reader get the key point in 30 seconds of scanning?
   - The "friend test": could you explain this to a non-expert friend without additional context?
3. Includes the "context budget" concept: every newsletter story gets N assumed-context credits. Each unexplained reference spends one. Zero = reader is lost.
4. Includes rewriting patterns: jargon → plain language, complex → simple, passive → active
5. At least 1 reference file: jargon/acronym detection checklist organized by common newsletter domains (tech, politics, business, sports)
6. Related-agents includes `reader-clarity-reviewer`

### US-16: Editorial Accuracy Reviewer Agent (Must-Have)

**As a** newsletter producer, **I want** an adversarial reviewer that checks whether the generated articles faithfully represent what the source script actually said, **so that** hallucinated details, misattributed quotes, and invented context are caught.

**Acceptance Criteria:**
1. Agent file `agents/editorial-accuracy-reviewer.md` exists with valid frontmatter
2. Classification: type=quality, color=red, field=editorial, expertise=expert, execution=autonomous, model=sonnet
3. Core skills reference `editorial-team/script-to-article` (uses the same skill adversarially — comparing output back to source, not transforming)
4. Related agents include `editorial-writer`, `newsletter-producer`, `claims-verifier`, `fact-checker`
5. Differentiates from `fact-checker`: fact-checker screens for bias and inflammatory language (tone/framing). Editorial-accuracy-reviewer compares draft against source material for fidelity (did the article say something the script didn't?). Different failure modes, different checks.
6. Differentiates from `claims-verifier`: claims-verifier validates external claims against sources. Editorial-accuracy-reviewer validates that the article's content matches the *specific source script provided*, not external truth.
7. Purpose covers: source fidelity verification, hallucination detection, misattribution flagging, omission detection (key points in script missing from article), fabricated detail identification
8. Review dimensions:
   - **Hallucinated facts**: Details in the article that don't appear in the source script
   - **Misattributed quotes**: Quotes attributed to the wrong person or paraphrased as direct quotes
   - **Invented context**: Background information or explanations added by the AI that weren't in the script and may be incorrect
   - **Material omissions**: Key points from the script that were dropped (not just condensed — lost)
   - **Numerical accuracy**: Statistics, dates, and figures that don't match the source
9. Output format: accuracy score (0-100) + flagged passages with source comparison ("script says X, article says Y" or "article says X, not found in script")
10. At least 2 examples: (a) catching a hallucinated statistic, (b) catching a misattributed quote
11. Passes `/agent/validate`

### US-17: Editorial Review Command (Must-Have)

**As a** newsletter producer or editor, **I want** a `/review/editorial-review` command that runs all 4 editorial review agents in parallel on a newsletter edition, **so that** I get comprehensive adversarial feedback before publishing.

**Acceptance Criteria:**
1. Command at `commands/review/editorial-review.md`
2. Follows the same pattern as `/review/review-changes` (parallel agent execution, combined report)
3. Input parameters:
   - `newsletter`: path to assembled newsletter file (required)
   - `source`: path to original teleprompter script (required for editorial-accuracy-reviewer)
   - `voice-ref`: path to voice reference directory (optional, defaults to skill's built-in references)
4. Runs 4 agents in parallel:
   - `fact-checker` — bias + neutrality screening
   - `voice-consistency-reviewer` — voice drift from reference style
   - `reader-clarity-reviewer` — readability + accessibility for general audience
   - `editorial-accuracy-reviewer` — source fidelity (draft vs original script)
5. Combined output: per-agent findings + overall editorial readiness verdict (PASS / PASS WITH NOTES / FAIL)
6. Verdict logic:
   - **FAIL**: Any agent reports a critical issue (hallucinated fact, severe bias, completely wrong voice)
   - **PASS WITH NOTES**: No critical issues, but flagged items exist (minor voice drift, jargon, style suggestions)
   - **PASS**: All agents report clean or trivial findings only
7. Follows existing command format conventions

## Voice Reference Strategy

The editorial-voice-matching skill uses a **two-layer approach**:

### Layer 1: Reference Pairs (the ground truth)

10 February 2026 Daily Dip editions from the Google Drive folder. Each contains:
- **Input**: Raw teleprompter script (bottom of the Google Doc)
- **Output**: Finished newsletter story (top of the Google Doc, right column = edited)

These pairs are stored in `skills/editorial-team/editorial-voice-matching/references/samples/` as paired files:
```
samples/
  2026-02-03-input.md
  2026-02-03-output.md
  2026-02-05-input.md
  2026-02-05-output.md
  ...
```

The agent studies what changed between input and output: sentence restructuring, vocabulary choices, information added/removed, humor patterns, attribution style, opening/closing conventions.

### Layer 2: Distilled Style Guide (the cheat sheet)

A concise document extracted from analyzing the 10 reference pairs. Lives at `skills/editorial-team/editorial-voice-matching/references/daily-dip-style-guide.md`. Contains:
- Sentence length targets and rhythm
- Vocabulary register (formal ↔ casual spectrum with examples)
- Humor/wit usage patterns (when, how much, what style)
- Attribution and sourcing style
- Paragraph structure and transition patterns
- Opening conventions (how stories typically start)
- Closing conventions (how stories typically end)
- Tone guardrails (what the Daily Dip never does)

### Layer 3: Generation Prompts (the execution)

Prompt patterns embedded in the editorial-voice-matching SKILL.md:
- System-level voice instruction (sets the baseline voice)
- Per-article generation prompt (takes script segment + style guide → article draft)
- Voice verification prompt (checks draft against reference pairs for consistency)

### Why this works

- Reference pairs show, don't tell. The agent sees real transformations, not abstract rules.
- The distilled style guide makes it fast at generation time (no need to re-analyze 10 docs every run).
- Generation prompts encode the mechanics. The style guide says "what," the prompts say "how."
- New publications just need new reference pairs + a new style guide extraction. The skill methodology is reusable.

## Constraints

- Follow existing agent frontmatter schema exactly (see `agents/content-creator.md` as reference)
- Follow existing skill frontmatter schema exactly (see `skills/marketing-team/content-creator/SKILL.md` as reference)
- No new Python scripts in this charter (defer to future enhancement)
- All skills are reference/methodology skills (no code dependencies)
- Agent model assignments: coordination agents use `sonnet`, quality/review agents use `sonnet` (fact-checker, voice-consistency-reviewer, reader-clarity-reviewer, editorial-accuracy-reviewer), implementation agents with complex judgment (editorial-writer) use `sonnet`, fast execution agents (poll-writer) use `haiku`
- Voice reference samples require the Daily Dip Google Drive content to be converted to markdown and committed — this is a prerequisite step before US-3 can be fully delivered

## Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Voice matching quality depends on reference sample quality | High | Require minimum 10 input→output pairs. Include pair quality criteria in US-3 (sufficient length, variety of topics, representative of typical output). |
| "Neutral tone" is subjective and contested | Medium | bias-screening skill explicitly defines neutral as "not taking sides" (not "splitting the difference"). Include concrete examples of neutral vs centrist vs biased for same content. |
| fact-checker vs claims-verifier role confusion | Low | Clear scope split: claims-verifier = technical/factual claims in plans/research. fact-checker = editorial tone/bias/framing in published content. Document in both agents. |
| editorial-writer vs content-creator role confusion | Medium | Clear scope split: editorial-writer = neutral reporting from source material. content-creator = marketing content with persuasive intent. Document "When to Use" table in both agents. |
| Daily Dip style guide may not generalize | Low | The skill teaches the extraction *process*, not the Daily Dip style specifically. Daily Dip is the first consumer; the methodology works for any publication with 10+ reference pairs. |
| Poll quality is hard to evaluate objectively | Low | poll-writer uses brainstorming skill to generate 3-5 candidates, then selects the best. Newsletter producer presents the top pick + 1 runner-up for human review. |
| Editorial review gate adds latency to pipeline | Medium | 4 reviewers run in parallel (not sequential). Gate is advisory — human can override PASS WITH NOTES. For time-sensitive newsletters, the gate can be run concurrently with human review. |
| voice-consistency-reviewer requires populated reference pairs to be useful | Medium | Same dependency as US-3 (editorial-voice-matching). Without reference pairs, the reviewer can only check against the distilled style guide. Mark as degraded-but-functional without samples. |
| editorial-accuracy-reviewer needs source script alongside newsletter | Low | Command requires both inputs. Newsletter-producer pipeline automatically passes source through. Standalone use requires the caller to provide both files. |

## Dependencies

- **Depends on:** Daily Dip February Google Drive content (10 editions, converted to markdown) — required for US-3 reference pairs
- **Depends on:** Existing skills: `brainstorming`, `asking-questions` (used by poll-writer) — already exist
- **No blocking dependencies on other initiatives** — can start immediately for all stories except US-3 reference sample population
- **Depended on by:** Future GTM Plugin 10 (Editorial & Newsletter) if the plugin catalog expands

## Walking Skeleton

The thinnest vertical slice that proves the architecture:

1. **US-1** (editorial-writer agent) + **US-2** (script-to-article skill) — proves the agent-skill wiring and core transformation capability
2. **US-6** (newsletter-producer agent) + **US-10** (newsletter/generate command) — proves the orchestration pipeline and command interface

These 4 items together validate: new agent creation, new skill creation, new team directory, coordination agent pattern, and command-to-agent wiring. The full voice-matching (US-3) and fact-checking (US-4, US-5) add quality layers on top.

## Priority

| Priority | Stories |
|----------|---------|
| Must-Have | US-1, US-2, US-3, US-4, US-5, US-6, US-7, US-8, US-9, US-10, US-13, US-14, US-15, US-16, US-17 |
| Should-Have | US-11, US-12 |

## Estimated Complexity

- **Scope type:** docs-only (all artifacts are `.md` files)
- **New artifacts:** 7 agents, 6 skills, 3 commands, 1 team CLAUDE.md = 17 new files + references
- **Modified artifacts:** 3 existing agents, 2 READMEs = 5 files
- **Domain count:** 1 (agent/skill development) but new domain definition (editorial)
- **Downstream consumers:** Medium (newsletter teams, content teams)
- **Recommended tier:** Medium-Heavy

## Reusability Beyond Daily Dip

Every piece in this charter generalizes:

| Artifact | Daily Dip Use | General Use |
|----------|--------------|-------------|
| `editorial-writer` | Teleprompter → newsletter | Any transcript → article (podcasts, interviews, earnings calls, event recaps) |
| `fact-checker` + `bias-screening` | Newsletter neutrality check | Any publication's editorial review, press release screening, internal comms review |
| `newsletter-producer` + `newsletter-assembly` | Daily Dip editions | Any recurring newsletter (company, product, industry) |
| `story-selection` | Pick 3 from Phil's show | Any editorial curation from a larger feed |
| `script-to-article` | Phil's teleprompter scripts | Podcast show notes, webinar recaps, briefing docs, meeting summaries |
| `poll-writer` | Newsletter engagement poll | Any audience engagement artifact (social polls, survey questions, discussion prompts) |
| `editorial-voice-matching` | Daily Dip voice | Any publication with 10+ reference samples |
| `voice-consistency-reviewer` | Does it sound like the Daily Dip? | Voice drift detection for any publication |
| `reader-clarity-reviewer` | Newsletter readability check | Any editorial content accessibility review |
| `editorial-accuracy-reviewer` | Draft vs Phil's script | Any source-to-article fidelity check (transcripts, interviews, briefs) |
| `/review/editorial-review` | Pre-publish newsletter gate | Parallel editorial quality gate for any publication |
