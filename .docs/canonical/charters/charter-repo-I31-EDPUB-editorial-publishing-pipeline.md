# Charter: Editorial Publishing Pipeline

**Initiative:** I31-EDPUB
**Date:** 2026-03-05
**Status:** Complete
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

## Acceptance Scenarios

BDD acceptance scenarios grouped by user story. Each scenario interacts through driving ports only: `/agent/validate` for agent/skill validation, `/newsletter/generate` for pipeline execution, `/content/fact-check` for standalone screening, and `/review/editorial-review` for the review gate. No internal implementation details (file parsing logic, frontmatter schema internals, scoring algorithms) are referenced.

**Scenario budget:** 68 scenarios total (28 happy path, 28 error/edge, 12 integration = 41% error/edge coverage).

**Walking skeleton markers:** Scenarios tagged `[Walking Skeleton]` validate the thinnest vertical slice.

---

### US-1: Editorial Writer Agent

#### Scenario 1.1: Editorial writer agent passes validation [Walking Skeleton] [Happy Path]

```gherkin
Scenario: Editorial writer agent passes validation
  Given the agent file "agents/editorial-writer.md" exists
  When I run /agent/validate on "editorial-writer"
  Then the validation result is PASS
  And the agent classification shows type "implementation", color "green", field "editorial"
```

#### Scenario 1.2: Editorial writer references required core skills [Walking Skeleton] [Happy Path]

```gherkin
Scenario: Editorial writer references required core skills
  Given the agent file "agents/editorial-writer.md" exists
  When I inspect the agent's core skills
  Then the skills include "editorial-team/script-to-article"
  And the skills include "editorial-team/editorial-voice-matching"
```

#### Scenario 1.3: Editorial writer differentiates from content-creator [Happy Path]

```gherkin
Scenario: Editorial writer differentiates from content-creator
  Given the agent file "agents/editorial-writer.md" exists
  When I inspect the agent's purpose and workflows
  Then the purpose describes neutral reporting from source material
  And the purpose explicitly differentiates from content-creator's marketing voice
```

#### Scenario 1.4: Editorial writer includes collaboration handoff [Happy Path]

```gherkin
Scenario: Editorial writer includes collaboration handoff
  Given the agent file "agents/editorial-writer.md" exists
  When I inspect the agent's collaborates-with entries
  Then a handoff to "fact-checker" is defined for draft neutrality review
```

#### Scenario 1.5: Editorial writer fails validation when core skill is missing [Error Path]

```gherkin
Scenario: Editorial writer fails validation when core skill is missing
  Given the agent file "agents/editorial-writer.md" exists
  And the core skill "editorial-team/script-to-article" has been removed from the frontmatter
  When I run /agent/validate on "editorial-writer"
  Then the validation result is FAIL
  And the failure reason references a missing core skill
```

#### Scenario 1.6: Editorial writer includes minimum required examples [Edge Case]

```gherkin
Scenario: Editorial writer includes minimum required examples
  Given the agent file "agents/editorial-writer.md" exists
  When I inspect the agent's examples section
  Then at least 2 examples are present
  And one example covers teleprompter script to newsletter article
  And one example covers podcast transcript to show notes
```

---

### US-2: Script-to-Article Skill

#### Scenario 2.1: Script-to-article skill exists with valid structure [Walking Skeleton] [Happy Path]

```gherkin
Scenario: Script-to-article skill exists with valid structure
  Given the skill file "skills/editorial-team/script-to-article/SKILL.md" exists
  When I inspect the skill's content
  Then the skill covers removing verbal tics and filler words
  And the skill covers restructuring spoken flow into reading flow
  And the skill covers preserving factual content
  And the skill covers condensing without losing substance
  And the skill covers handling multi-story scripts
```

#### Scenario 2.2: Script-to-article skill includes transformation reference [Walking Skeleton] [Happy Path]

```gherkin
Scenario: Script-to-article skill includes transformation reference
  Given the skill directory "skills/editorial-team/script-to-article/" exists
  When I inspect the references directory
  Then at least 1 reference file exists as a transformation checklist
```

#### Scenario 2.3: Script-to-article skill includes compression ratio guidelines [Happy Path]

```gherkin
Scenario: Script-to-article skill includes compression ratio guidelines
  Given the skill file "skills/editorial-team/script-to-article/SKILL.md" exists
  When I inspect the skill's content for compression guidance
  Then the skill provides script-to-article word count targets
  And the targets account for scripts being 3-5x longer than articles
```

#### Scenario 2.4: Script-to-article skill handles single-story scripts [Edge Case]

```gherkin
Scenario: Script-to-article skill covers single-story edge case
  Given the skill file "skills/editorial-team/script-to-article/SKILL.md" exists
  When I inspect the story segmentation patterns
  Then the patterns handle a script containing only one story
  And no segmentation is required when a single story is detected
```

---

### US-3: Editorial Voice Matching Skill

#### Scenario 3.1: Editorial voice matching skill has two-layer approach [Happy Path]

```gherkin
Scenario: Editorial voice matching skill has two-layer approach
  Given the skill file "skills/editorial-team/editorial-voice-matching/SKILL.md" exists
  When I inspect the skill's methodology
  Then Layer 1 describes reference pairs (raw transcript + finished newsletter)
  And Layer 2 describes distilled principles (concise style guide)
```

#### Scenario 3.2: Editorial voice matching includes extraction process [Happy Path]

```gherkin
Scenario: Editorial voice matching includes extraction process
  Given the skill file "skills/editorial-team/editorial-voice-matching/SKILL.md" exists
  When I inspect the skill's extraction methodology
  Then the process documents how to analyze 10+ reference pairs
  And the process produces a distilled style guide
  And the process is not limited to "read the examples"
```

#### Scenario 3.3: Editorial voice matching includes reference templates [Happy Path]

```gherkin
Scenario: Editorial voice matching includes reference templates
  Given the skill directory "skills/editorial-team/editorial-voice-matching/" exists
  When I inspect the references directory
  Then a voice analysis template exists
  And a sample style guide skeleton exists
```

#### Scenario 3.4: Editorial voice matching differentiates from brand guidelines [Error Path]

```gherkin
Scenario: Editorial voice matching differentiates from marketing brand guidelines
  Given the skill file "skills/editorial-team/editorial-voice-matching/SKILL.md" exists
  When I inspect the skill's differentiation section
  Then the skill explicitly distinguishes itself from brand_guidelines.md marketing archetypes
  And the skill uses example-based pattern matching not archetype selection
```

#### Scenario 3.5: Voice matching works with fewer than 10 reference pairs [Edge Case]

```gherkin
Scenario: Voice matching methodology addresses insufficient reference pairs
  Given the skill file "skills/editorial-team/editorial-voice-matching/SKILL.md" exists
  When I inspect the extraction process for minimum requirements
  Then the skill states a minimum of 10 reference pairs is recommended
  And the skill describes degraded quality when fewer pairs are available
```

---

### US-4: Fact-Checker Agent

#### Scenario 4.1: Fact-checker agent passes validation [Happy Path]

```gherkin
Scenario: Fact-checker agent passes validation
  Given the agent file "agents/fact-checker.md" exists
  When I run /agent/validate on "fact-checker"
  Then the validation result is PASS
  And the agent classification shows type "quality", color "red", field "editorial"
```

#### Scenario 4.2: Fact-checker differentiates from claims-verifier [Happy Path]

```gherkin
Scenario: Fact-checker differentiates from claims-verifier
  Given the agent file "agents/fact-checker.md" exists
  When I inspect the agent's purpose
  Then the purpose describes screening editorial content for bias and tone
  And the purpose explicitly differentiates from claims-verifier's technical/factual validation
```

#### Scenario 4.3: Fact-checker output format includes structured findings [Happy Path]

```gherkin
Scenario: Fact-checker output format includes structured findings
  Given the agent file "agents/fact-checker.md" exists
  When I inspect the agent's output format specification
  Then the output includes flagged passages with issue type
  And the output includes severity level per finding
  And the output includes suggested neutral rewording
```

#### Scenario 4.4: Fact-checker fails validation without bias-screening skill [Error Path]

```gherkin
Scenario: Fact-checker fails validation without bias-screening skill
  Given the agent file "agents/fact-checker.md" exists
  And the core skill "editorial-team/bias-screening" has been removed from the frontmatter
  When I run /agent/validate on "fact-checker"
  Then the validation result is FAIL
```

#### Scenario 4.5: Fact-checker includes partisan framing detection example [Happy Path]

```gherkin
Scenario: Fact-checker includes partisan framing detection example
  Given the agent file "agents/fact-checker.md" exists
  When I inspect the agent's examples
  Then one example demonstrates detecting partisan framing in a political story
  And one example demonstrates flagging loaded language in a tech industry story
```

---

### US-5: Bias Screening Skill

#### Scenario 5.1: Bias screening skill covers all detection categories [Happy Path]

```gherkin
Scenario: Bias screening skill covers all detection categories
  Given the skill file "skills/editorial-team/bias-screening/SKILL.md" exists
  When I inspect the bias detection categories
  Then the skill covers loaded language detection
  And the skill covers partisan framing detection
  And the skill covers false balance detection
  And the skill covers editorializing-as-reporting detection
  And the skill covers selection bias detection
  And the skill covers attribution asymmetry detection
```

#### Scenario 5.2: Bias screening includes severity classification [Happy Path]

```gherkin
Scenario: Bias screening includes severity classification
  Given the skill file "skills/editorial-team/bias-screening/SKILL.md" exists
  When I inspect the severity classification system
  Then three levels are defined: flag, warning, and block
  And each level has clear criteria for when it applies
```

#### Scenario 5.3: Bias screening distinguishes neutral from centrist [Error Path]

```gherkin
Scenario: Bias screening distinguishes neutral from centrist
  Given the skill file "skills/editorial-team/bias-screening/SKILL.md" exists
  When I inspect the neutrality definition
  Then the skill defines neutral as "not taking sides"
  And the skill explicitly states neutral is not "splitting the difference"
  And concrete examples illustrate neutral vs centrist vs biased for the same content
```

#### Scenario 5.4: Bias screening includes loaded terms reference [Happy Path]

```gherkin
Scenario: Bias screening includes loaded terms reference
  Given the skill directory "skills/editorial-team/bias-screening/" exists
  When I inspect the references directory
  Then a loaded terms dictionary exists organized by topic domain
```

---

### US-6: Newsletter Producer Agent

#### Scenario 6.1: Newsletter producer agent passes validation [Walking Skeleton] [Happy Path]

```gherkin
Scenario: Newsletter producer agent passes validation
  Given the agent file "agents/newsletter-producer.md" exists
  When I run /agent/validate on "newsletter-producer"
  Then the validation result is PASS
  And the agent classification shows type "coordination", color "purple", field "editorial"
```

#### Scenario 6.2: Newsletter producer defines complete 7-step pipeline [Walking Skeleton] [Happy Path]

```gherkin
Scenario: Newsletter producer defines complete 7-step pipeline
  Given the agent file "agents/newsletter-producer.md" exists
  When I inspect the agent's pipeline definition
  Then Step 1 segments the script into individual stories
  And Step 2 selects stories using explicit picks or auto-select
  And Step 3 dispatches each story to editorial-writer for drafting
  And Step 4 dispatches each draft to fact-checker for screening
  And Step 5 dispatches one story to poll-writer for poll generation
  And Step 6 assembles the newsletter via newsletter-assembly
  And Step 7 runs the editorial review gate with 4 parallel reviewers
```

#### Scenario 6.3: Newsletter producer handles explicit story picks [Happy Path]

```gherkin
Scenario: Newsletter producer handles explicit story picks
  Given the agent file "agents/newsletter-producer.md" exists
  When I inspect the pipeline for story selection
  Then explicit picks mode uses caller-specified story indices or keywords
  And auto-select mode is used only when no explicit picks are provided
```

#### Scenario 6.4: Newsletter producer references all collaborating agents [Happy Path]

```gherkin
Scenario: Newsletter producer references all collaborating agents
  Given the agent file "agents/newsletter-producer.md" exists
  When I inspect the agent's related-agents
  Then "editorial-writer" is listed
  And "fact-checker" is listed
  And "poll-writer" is listed
  And "voice-consistency-reviewer" is listed
  And "reader-clarity-reviewer" is listed
  And "editorial-accuracy-reviewer" is listed
```

#### Scenario 6.5: Newsletter producer fails when missing newsletter-assembly skill [Error Path]

```gherkin
Scenario: Newsletter producer fails validation without newsletter-assembly skill
  Given the agent file "agents/newsletter-producer.md" exists
  And the core skill "editorial-team/newsletter-assembly" has been removed from the frontmatter
  When I run /agent/validate on "newsletter-producer"
  Then the validation result is FAIL
```

#### Scenario 6.6: Newsletter producer pipeline handles zero stories from script [Error Path]

```gherkin
Scenario: Newsletter producer pipeline defines behavior for zero-story scripts
  Given the agent file "agents/newsletter-producer.md" exists
  When I inspect the pipeline error handling
  Then the pipeline defines behavior when script segmentation yields zero stories
  And the output communicates the failure clearly to the caller
```

---

### US-7: Story Selection Skill

#### Scenario 7.1: Story selection skill supports two modes [Happy Path]

```gherkin
Scenario: Story selection skill supports explicit and auto-select modes
  Given the skill file "skills/editorial-team/story-selection/SKILL.md" exists
  When I inspect the skill's modes
  Then explicit mode accepts story indices, title keywords, or topics
  And auto-select mode evaluates all stories against selection criteria
```

#### Scenario 7.2: Auto-select uses five evaluation criteria [Happy Path]

```gherkin
Scenario: Auto-select uses five evaluation criteria
  Given the skill file "skills/editorial-team/story-selection/SKILL.md" exists
  When I inspect the auto-select evaluation criteria
  Then the criteria include audience relevance
  And the criteria include newsworthiness
  And the criteria include topic diversity
  And the criteria include engagement potential
  And the criteria include narrative strength
```

#### Scenario 7.3: Auto-select output includes rationale [Happy Path]

```gherkin
Scenario: Auto-select output includes rationale for picks and rejections
  Given the skill file "skills/editorial-team/story-selection/SKILL.md" exists
  When I inspect the output specification
  Then selected stories include a rationale for why they were chosen
  And rejected stories include a rationale for why they were not chosen
```

#### Scenario 7.4: Auto-select enforces topic diversity constraint [Edge Case]

```gherkin
Scenario: Auto-select enforces topic diversity constraint
  Given the skill file "skills/editorial-team/story-selection/SKILL.md" exists
  When I inspect the diversity constraint
  Then the scoring model prevents selecting 3 stories about the same topic
  And the diversity constraint is applied after initial scoring
```

#### Scenario 7.5: Auto-select handles fewer stories than requested count [Error Path]

```gherkin
Scenario: Auto-select handles fewer available stories than requested count
  Given the skill file "skills/editorial-team/story-selection/SKILL.md" exists
  When I inspect the edge case handling
  Then the skill defines behavior when the script contains fewer stories than the requested count
```

---

### US-8: Poll Writer Agent

#### Scenario 8.1: Poll writer agent passes validation [Happy Path]

```gherkin
Scenario: Poll writer agent passes validation
  Given the agent file "agents/poll-writer.md" exists
  When I run /agent/validate on "poll-writer"
  Then the validation result is PASS
  And the agent classification shows type "implementation", color "green", model "haiku"
```

#### Scenario 8.2: Poll writer uses brainstorming for candidate generation [Happy Path]

```gherkin
Scenario: Poll writer uses brainstorming for candidate generation
  Given the agent file "agents/poll-writer.md" exists
  When I inspect the agent's core skills
  Then "brainstorming" is listed as a core skill
  And "asking-questions" is listed as a core skill
```

#### Scenario 8.3: Poll writer enforces balanced answer options [Happy Path]

```gherkin
Scenario: Poll writer enforces balanced answer options
  Given the agent file "agents/poll-writer.md" exists
  When I inspect the poll construction principles
  Then answer options must be balanced with no obviously correct answer
  And 3-5 answer options are required with 4 as the sweet spot
```

#### Scenario 8.4: Poll writer screens polls for bias [Error Path]

```gherkin
Scenario: Poll writer screens polls for bias
  Given the agent file "agents/poll-writer.md" exists
  When I inspect the agent's core skills
  Then "editorial-team/bias-screening" is listed
  And the purpose mentions avoiding leading questions
```

#### Scenario 8.5: Poll writer rejects generic polls not tied to a story [Error Path]

```gherkin
Scenario: Poll writer requires polls to relate to a specific story
  Given the agent file "agents/poll-writer.md" exists
  When I inspect the poll construction principles
  Then polls must relate to a specific story
  And generic polls like "did you like this article?" are explicitly excluded
```

---

### US-9: Newsletter Assembly Skill

#### Scenario 9.1: Newsletter assembly skill includes edition template [Happy Path]

```gherkin
Scenario: Newsletter assembly skill includes edition template
  Given the skill file "skills/editorial-team/newsletter-assembly/SKILL.md" exists
  When I inspect the newsletter edition template
  Then the template includes a subject line section
  And the template includes Story 1 as the lead story
  And the template includes Story 2 and Story 3 slots
  And the template includes a poll section with context sentence
  And the template includes show notes and links
  And the template includes a standard footer
```

#### Scenario 9.2: Newsletter assembly includes subject line methodology [Happy Path]

```gherkin
Scenario: Newsletter assembly includes subject line methodology
  Given the skill file "skills/editorial-team/newsletter-assembly/SKILL.md" exists
  When I inspect the subject line generation section
  Then the methodology generates 3-5 candidates
  And pattern types include curiosity gap, key story highlight, and question format
```

#### Scenario 9.3: Newsletter assembly defines story ordering logic [Happy Path]

```gherkin
Scenario: Newsletter assembly defines story ordering logic
  Given the skill file "skills/editorial-team/newsletter-assembly/SKILL.md" exists
  When I inspect the story ordering section
  Then the lead position goes to the strongest story
  And the closing position goes to the most engaging story
  And the middle position is for substantive content
```

#### Scenario 9.4: Newsletter assembly output is format-agnostic [Edge Case]

```gherkin
Scenario: Newsletter assembly output is format-agnostic
  Given the skill file "skills/editorial-team/newsletter-assembly/SKILL.md" exists
  When I inspect the output format specification
  Then the output is markdown that can target email HTML, CMS, or plain text
  And no format-specific markup is required
```

#### Scenario 9.5: Newsletter assembly includes template reference file [Happy Path]

```gherkin
Scenario: Newsletter assembly includes template reference file
  Given the skill directory "skills/editorial-team/newsletter-assembly/" exists
  When I inspect the references directory
  Then a newsletter edition template reference file exists
```

---

### US-10: Newsletter Generate Command

#### Scenario 10.1: Newsletter generate command exists with required parameters [Walking Skeleton] [Happy Path]

```gherkin
Scenario: Newsletter generate command exists with required parameters
  Given the command file "commands/newsletter/generate.md" exists
  When I inspect the command's input parameters
  Then "script" is a required parameter for the teleprompter script path
  And "stories" is an optional parameter for explicit story picks
  And "count" is an optional parameter defaulting to 3
  And "voice-ref" is an optional parameter for voice reference directory
```

#### Scenario 10.2: Newsletter generate command references newsletter-producer [Walking Skeleton] [Happy Path]

```gherkin
Scenario: Newsletter generate command references newsletter-producer agent
  Given the command file "commands/newsletter/generate.md" exists
  When I inspect the command's agent reference
  Then the command references the "newsletter-producer" agent
```

#### Scenario 10.3: Newsletter generate command output is markdown [Happy Path]

```gherkin
Scenario: Newsletter generate command output is markdown
  Given the command file "commands/newsletter/generate.md" exists
  When I inspect the command's output specification
  Then the output is a complete newsletter edition in markdown format
```

#### Scenario 10.4: Newsletter generate command follows existing format conventions [Happy Path]

```gherkin
Scenario: Newsletter generate command follows existing format conventions
  Given the command file "commands/newsletter/generate.md" exists
  When I compare the command format against existing commands in "commands/"
  Then the format matches the established command file conventions
```

#### Scenario 10.5: Newsletter generate command validates required script parameter [Error Path]

```gherkin
Scenario: Newsletter generate command defines script as required
  Given the command file "commands/newsletter/generate.md" exists
  When I inspect the parameter requirements
  Then the "script" parameter is marked as required
  And omitting the script parameter results in a usage error
```

---

### US-13: Voice Consistency Reviewer Agent

#### Scenario 13.1: Voice consistency reviewer passes validation [Happy Path]

```gherkin
Scenario: Voice consistency reviewer passes validation
  Given the agent file "agents/voice-consistency-reviewer.md" exists
  When I run /agent/validate on "voice-consistency-reviewer"
  Then the validation result is PASS
  And the agent classification shows type "quality", color "red", field "editorial"
```

#### Scenario 13.2: Voice consistency reviewer covers all review dimensions [Happy Path]

```gherkin
Scenario: Voice consistency reviewer covers all review dimensions
  Given the agent file "agents/voice-consistency-reviewer.md" exists
  When I inspect the review dimensions
  Then the dimensions include sentence rhythm
  And the dimensions include vocabulary register
  And the dimensions include humor/wit calibration
  And the dimensions include opening/closing conventions
  And the dimensions include attribution style
  And the dimensions include information density
```

#### Scenario 13.3: Voice consistency reviewer outputs scored findings [Happy Path]

```gherkin
Scenario: Voice consistency reviewer outputs scored findings
  Given the agent file "agents/voice-consistency-reviewer.md" exists
  When I inspect the output format
  Then the output includes a voice consistency score from 0 to 100
  And the output includes flagged passages with "reference says X, draft does Y" comparisons
```

#### Scenario 13.4: Voice consistency reviewer degrades gracefully without reference pairs [Error Path]

```gherkin
Scenario: Voice consistency reviewer degrades without reference pairs
  Given the agent file "agents/voice-consistency-reviewer.md" exists
  When I inspect the agent's behavior without reference pairs
  Then the agent can still check against the distilled style guide only
  And the agent reports degraded-but-functional status
```

---

### US-14: Reader Clarity Reviewer Agent

#### Scenario 14.1: Reader clarity reviewer passes validation [Happy Path]

```gherkin
Scenario: Reader clarity reviewer passes validation
  Given the agent file "agents/reader-clarity-reviewer.md" exists
  When I run /agent/validate on "reader-clarity-reviewer"
  Then the validation result is PASS
  And the agent classification shows type "quality", color "red", field "editorial"
```

#### Scenario 14.2: Reader clarity reviewer covers all review dimensions [Happy Path]

```gherkin
Scenario: Reader clarity reviewer covers all review dimensions
  Given the agent file "agents/reader-clarity-reviewer.md" exists
  When I inspect the review dimensions
  Then the dimensions include jargon/acronym detection
  And the dimensions include assumed context flagging
  And the dimensions include unclear antecedent identification
  And the dimensions include buried lede detection
  And the dimensions include sentence complexity assessment
  And the dimensions include transition gap detection
```

#### Scenario 14.3: Reader clarity reviewer differentiates from cognitive-load-assessor [Error Path]

```gherkin
Scenario: Reader clarity reviewer differentiates from cognitive-load-assessor
  Given the agent file "agents/reader-clarity-reviewer.md" exists
  When I inspect the agent's differentiation section
  Then the agent explicitly distinguishes itself from cognitive-load-assessor
  And the distinction explains that cognitive-load-assessor measures code complexity
  And the distinction explains that reader-clarity-reviewer measures editorial content readability
```

#### Scenario 14.4: Reader clarity reviewer outputs scored findings [Happy Path]

```gherkin
Scenario: Reader clarity reviewer outputs scored findings
  Given the agent file "agents/reader-clarity-reviewer.md" exists
  When I inspect the output format
  Then the output includes a clarity score from 0 to 100
  And the output includes flagged passages with issue type and suggested rewrite
```

---

### US-15: Reader Clarity Skill

#### Scenario 15.1: Reader clarity skill covers readability heuristics [Happy Path]

```gherkin
Scenario: Reader clarity skill covers readability heuristics
  Given the skill file "skills/editorial-team/reader-clarity/SKILL.md" exists
  When I inspect the readability heuristics
  Then the skill includes Flesch-Kincaid readability targets for grade 8-10
  And the skill includes jargon detection patterns
  And the skill includes the "30-second test" for key point scanning
  And the skill includes the "friend test" for non-expert explanation
```

#### Scenario 15.2: Reader clarity skill includes context budget concept [Happy Path]

```gherkin
Scenario: Reader clarity skill includes context budget concept
  Given the skill file "skills/editorial-team/reader-clarity/SKILL.md" exists
  When I inspect the context budget methodology
  Then each story gets N assumed-context credits
  And each unexplained reference spends one credit
  And zero remaining credits means the reader is lost
```

#### Scenario 15.3: Reader clarity skill includes rewriting patterns [Happy Path]

```gherkin
Scenario: Reader clarity skill includes rewriting patterns
  Given the skill file "skills/editorial-team/reader-clarity/SKILL.md" exists
  When I inspect the rewriting patterns
  Then patterns cover jargon to plain language conversion
  And patterns cover complex to simple sentence restructuring
  And patterns cover passive to active voice conversion
```

#### Scenario 15.4: Reader clarity skill includes jargon reference [Happy Path]

```gherkin
Scenario: Reader clarity skill includes jargon detection reference
  Given the skill directory "skills/editorial-team/reader-clarity/" exists
  When I inspect the references directory
  Then a jargon/acronym detection checklist exists
  And it is organized by common newsletter domains: tech, politics, business, sports
```

#### Scenario 15.5: Reader clarity skill handles domain-specific jargon not in checklist [Edge Case]

```gherkin
Scenario: Reader clarity skill handles unknown domain jargon
  Given the skill file "skills/editorial-team/reader-clarity/SKILL.md" exists
  When I inspect the jargon detection methodology
  Then the methodology provides heuristics for identifying jargon beyond the checklist
  And domain-unlisted terms can still be flagged based on structural patterns
```

---

### US-16: Editorial Accuracy Reviewer Agent

#### Scenario 16.1: Editorial accuracy reviewer passes validation [Happy Path]

```gherkin
Scenario: Editorial accuracy reviewer passes validation
  Given the agent file "agents/editorial-accuracy-reviewer.md" exists
  When I run /agent/validate on "editorial-accuracy-reviewer"
  Then the validation result is PASS
  And the agent classification shows type "quality", color "red", field "editorial"
```

#### Scenario 16.2: Editorial accuracy reviewer covers all review dimensions [Happy Path]

```gherkin
Scenario: Editorial accuracy reviewer covers all review dimensions
  Given the agent file "agents/editorial-accuracy-reviewer.md" exists
  When I inspect the review dimensions
  Then the dimensions include hallucinated facts detection
  And the dimensions include misattributed quotes detection
  And the dimensions include invented context detection
  And the dimensions include material omissions detection
  And the dimensions include numerical accuracy verification
```

#### Scenario 16.3: Editorial accuracy reviewer differentiates from fact-checker [Error Path]

```gherkin
Scenario: Editorial accuracy reviewer differentiates from fact-checker
  Given the agent file "agents/editorial-accuracy-reviewer.md" exists
  When I inspect the differentiation section
  Then the agent distinguishes itself from fact-checker (bias/tone vs source fidelity)
  And the agent distinguishes itself from claims-verifier (external truth vs source script match)
```

#### Scenario 16.4: Editorial accuracy reviewer outputs source comparison findings [Happy Path]

```gherkin
Scenario: Editorial accuracy reviewer outputs source comparison findings
  Given the agent file "agents/editorial-accuracy-reviewer.md" exists
  When I inspect the output format
  Then the output includes an accuracy score from 0 to 100
  And the output includes "script says X, article says Y" comparisons
  And the output includes "article says X, not found in script" flags
```

#### Scenario 16.5: Editorial accuracy reviewer requires source script input [Error Path]

```gherkin
Scenario: Editorial accuracy reviewer requires source script
  Given the agent file "agents/editorial-accuracy-reviewer.md" exists
  When I inspect the agent's input requirements
  Then both the draft article and the original source script are required inputs
  And the agent cannot run without the source script
```

---

### US-17: Editorial Review Command

#### Scenario 17.1: Editorial review command exists with required parameters [Happy Path]

```gherkin
Scenario: Editorial review command exists with required parameters
  Given the command file "commands/review/editorial-review.md" exists
  When I inspect the command's input parameters
  Then "newsletter" is a required parameter for the assembled newsletter path
  And "source" is a required parameter for the original teleprompter script path
  And "voice-ref" is an optional parameter for the voice reference directory
```

#### Scenario 17.2: Editorial review command runs 4 agents in parallel [Happy Path]

```gherkin
Scenario: Editorial review command runs 4 agents in parallel
  Given the command file "commands/review/editorial-review.md" exists
  When I inspect the command's agent execution
  Then "fact-checker" runs for bias and neutrality screening
  And "voice-consistency-reviewer" runs for voice drift detection
  And "reader-clarity-reviewer" runs for readability assessment
  And "editorial-accuracy-reviewer" runs for source fidelity verification
  And all 4 agents run in parallel
```

#### Scenario 17.3: Editorial review command produces PASS verdict [Happy Path]

```gherkin
Scenario: Editorial review command produces PASS verdict when all agents report clean
  Given the command file "commands/review/editorial-review.md" exists
  When I inspect the verdict logic
  Then verdict is PASS when all agents report clean or trivial findings only
```

#### Scenario 17.4: Editorial review command produces FAIL verdict on critical issue [Error Path]

```gherkin
Scenario: Editorial review command produces FAIL verdict on critical issue
  Given the command file "commands/review/editorial-review.md" exists
  When I inspect the verdict logic for critical issues
  Then verdict is FAIL when any agent reports a hallucinated fact
  And verdict is FAIL when any agent reports severe bias
  And verdict is FAIL when any agent reports completely wrong voice
```

#### Scenario 17.5: Editorial review command produces PASS WITH NOTES on minor issues [Edge Case]

```gherkin
Scenario: Editorial review command produces PASS WITH NOTES on minor issues
  Given the command file "commands/review/editorial-review.md" exists
  When I inspect the verdict logic for non-critical flagged items
  Then verdict is PASS WITH NOTES when no critical issues exist but flagged items are present
  And minor voice drift qualifies as PASS WITH NOTES
  And unexplained jargon qualifies as PASS WITH NOTES
```

#### Scenario 17.6: Editorial review follows review-changes parallel pattern [Happy Path]

```gherkin
Scenario: Editorial review follows review-changes parallel pattern
  Given the command file "commands/review/editorial-review.md" exists
  When I compare the command against "commands/review/review-changes.md"
  Then the editorial-review follows the same parallel agent execution pattern
  And the output combines per-agent findings into a single report
```

#### Scenario 17.7: Editorial review command requires source for accuracy reviewer [Error Path]

```gherkin
Scenario: Editorial review command requires source parameter
  Given the command file "commands/review/editorial-review.md" exists
  When I inspect the parameter requirements
  Then the "source" parameter is required specifically for the editorial-accuracy-reviewer
  And omitting the source parameter results in a usage error
```

---

### US-11: Fact-Check Command (Should-Have)

#### Scenario 11.1: Fact-check command exists as standalone [Happy Path]

```gherkin
Scenario: Fact-check command exists as standalone command
  Given the command file "commands/content/fact-check.md" exists
  When I inspect the command's input parameters
  Then "content" is a required parameter accepting a file path or inline text
  And "mode" is an optional parameter with values "full" or "quick" defaulting to "full"
```

#### Scenario 11.2: Fact-check command is reusable for any content [Happy Path]

```gherkin
Scenario: Fact-check command is reusable for any content type
  Given the command file "commands/content/fact-check.md" exists
  When I inspect the command's scope
  Then the command is not limited to newsletters
  And any editorial or marketing content can be screened
```

#### Scenario 11.3: Fact-check command quick mode runs bias-only scan [Edge Case]

```gherkin
Scenario: Fact-check command quick mode runs bias-only scan
  Given the command file "commands/content/fact-check.md" exists
  When I inspect the mode parameter
  Then "quick" mode runs a bias-only scan
  And "full" mode runs a thorough review including all detection categories
```

#### Scenario 11.4: Fact-check command references fact-checker agent [Happy Path]

```gherkin
Scenario: Fact-check command references fact-checker agent
  Given the command file "commands/content/fact-check.md" exists
  When I inspect the command's agent reference
  Then the command references the "fact-checker" agent
```

---

### US-12: Cross-References and Catalog Updates (Should-Have)

#### Scenario 12.1: Content-creator cross-references editorial-writer [Happy Path]

```gherkin
Scenario: Content-creator cross-references editorial-writer
  Given the agent file "agents/content-creator.md" exists
  When I inspect the agent's related-agents frontmatter
  Then "editorial-writer" is listed
```

#### Scenario 12.2: Claims-verifier cross-references fact-checker [Happy Path]

```gherkin
Scenario: Claims-verifier cross-references fact-checker
  Given the agent file "agents/claims-verifier.md" exists
  When I inspect the agent's related-agents frontmatter
  Then "fact-checker" is listed
```

#### Scenario 12.3: Agents README includes 7 new editorial agents [Happy Path]

```gherkin
Scenario: Agents README includes editorial team section
  Given the file "agents/README.md" exists
  When I inspect the agent catalog
  Then an "Editorial" section exists with 7 agent entries
  And the section includes 4 production pipeline agents and 3 review gate agents
```

#### Scenario 12.4: Skills README includes editorial-team section [Happy Path]

```gherkin
Scenario: Skills README includes editorial-team section
  Given the file "skills/README.md" exists
  When I inspect the skills catalog
  Then an "editorial-team" section exists listing 6 skills
```

#### Scenario 12.5: All modified agents still pass validation [Error Path]

```gherkin
Scenario: All modified agents still pass validation after cross-reference updates
  Given cross-references have been added to "content-creator", "copywriter", and "claims-verifier"
  When I run /agent/validate on each modified agent
  Then all 3 modified agents pass validation
  And no existing frontmatter has been broken by the additions
```

#### Scenario 12.6: Editorial team CLAUDE.md exists [Happy Path]

```gherkin
Scenario: Editorial team guide exists
  Given the file "skills/editorial-team/CLAUDE.md" exists
  When I inspect the team overview
  Then the guide follows the pattern of "skills/marketing-team/CLAUDE.md"
  And the guide covers all 6 editorial-team skills
```

---

### Integration Scenarios

#### Scenario INT-1: Walking skeleton proves agent-skill wiring [Walking Skeleton] [Integration]

```gherkin
Scenario: Walking skeleton proves agent-skill wiring end-to-end
  Given "agents/editorial-writer.md" exists and passes validation
  And "skills/editorial-team/script-to-article/SKILL.md" exists
  When I inspect the editorial-writer's core skills
  Then "editorial-team/script-to-article" resolves to an existing skill file
  And the skill's related-agents includes "editorial-writer"
  And the bidirectional reference is consistent
```

#### Scenario INT-2: Walking skeleton proves pipeline orchestration [Walking Skeleton] [Integration]

```gherkin
Scenario: Walking skeleton proves pipeline orchestration end-to-end
  Given "agents/newsletter-producer.md" exists and passes validation
  And "commands/newsletter/generate.md" exists
  When I inspect the generate command's agent reference
  Then the command references "newsletter-producer"
  And the newsletter-producer's pipeline references all required agents
  And each referenced agent exists and passes validation
```

#### Scenario INT-3: Editorial review gate agents all pass validation [Integration]

```gherkin
Scenario: All 4 editorial review gate agents pass validation
  Given agents exist for fact-checker, voice-consistency-reviewer, reader-clarity-reviewer, and editorial-accuracy-reviewer
  When I run /agent/validate on all 4 review agents
  Then all 4 agents pass validation
  And all 4 agents have classification type "quality" and color "red"
```

#### Scenario INT-4: All 7 new agents pass validation [Integration]

```gherkin
Scenario: All 7 new editorial agents pass validation
  Given agents exist for editorial-writer, fact-checker, newsletter-producer, poll-writer, voice-consistency-reviewer, reader-clarity-reviewer, and editorial-accuracy-reviewer
  When I run /agent/validate --all
  Then all 7 new agents pass validation
  And no existing agents have been broken
```

#### Scenario INT-5: Newsletter producer pipeline agent references are all resolvable [Integration]

```gherkin
Scenario: Newsletter producer pipeline references are all resolvable
  Given "agents/newsletter-producer.md" exists
  When I resolve every agent name in the pipeline steps
  Then "editorial-writer" resolves to an existing agent file
  And "fact-checker" resolves to an existing agent file
  And "poll-writer" resolves to an existing agent file
  And every skill referenced by the producer resolves to an existing SKILL.md
```

#### Scenario INT-6: Command-to-agent wiring is complete [Integration]

```gherkin
Scenario: All 3 commands reference existing agents
  Given commands exist at "commands/newsletter/generate.md", "commands/content/fact-check.md", and "commands/review/editorial-review.md"
  When I resolve each command's agent reference
  Then "newsletter/generate" references "newsletter-producer" which exists
  And "content/fact-check" references "fact-checker" which exists
  And "review/editorial-review" references all 4 review agents which exist
```
