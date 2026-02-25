---
type: adr
endeavor: repo
initiative: I18-RLMP
initiative_name: rlm-context-efficiency
status: proposed
date: 2026-02-25
supersedes: []
superseded_by: null
---

# ADR I18-RLMP-002: Symbolic Handle Pattern for Agent Context

## Status

Proposed

## Context

Review agents (docs-reviewer, code-reviewer, progress-assessor) currently receive full file contents and complete diffs in their LLM context window. This is the primary driver of token consumption: the LLM reads entire documents only to report that most sections are "fine." The RLM paper (arXiv:2512.24601v2) identifies this as the core inefficiency in recursive language model applications and proposes "symbolic handles with depth-based routing" as the solution.

The concept: instead of passing full content to the LLM, pass a structural summary (headings, metrics, flagged issues) plus file paths and line ranges. The LLM uses tool calls (the `Read` tool) to retrieve only the specific sections it needs for semantic judgment. This maps directly onto the existing T1/T2/T3 tier model where T1 scripts produce structural data and T3 models perform deep analysis.

The question is how agents receive their working context: full content up front (current approach), structural summaries with on-demand retrieval (symbolic handles), or a hybrid where summaries include excerpts.

## Decision

Agents receive T1 JSON summaries plus file paths as symbolic handles. When the LLM needs to examine a flagged section, it uses the `Read` tool on the specific file at the specific line range indicated by the T1 output. The LLM never receives full file contents in its initial prompt.

Specifically:

1. T1 scripts output JSON containing structural metadata: heading trees, diff statistics, frontmatter validity, broken links, section word counts, and significance classifications.
2. For sections flagged as needing LLM review, the JSON includes the file path, line start, line end, a reason string, and a short excerpt (first 200 characters).
3. The LLM's initial prompt contains only this JSON summary, not the source files.
4. When the LLM needs full content for a flagged section, it calls `Read` with the file path and line range from the JSON.
5. Files or sections classified as "trivial" by T1 are not sent to the LLM at all -- their structural findings are reported directly.

## Alternatives Considered

### Alternative 1: Full content in context (status quo)

Keep passing complete files and diffs to agents as today.

**Pros:**
- No changes needed to agent definitions or the review-changes command
- LLM has maximum context for nuanced analysis
- No risk of missing issues due to pre-filtering

**Cons:**
- Token consumption remains at current levels (the problem this initiative exists to solve)
- LLM spends most tokens reading material it will report as acceptable
- Does not scale as the repository or review frequency grows

**Why Rejected**: This is the problem, not a solution. The charter targets 50-70% token reduction, which is impossible without reducing what enters the context window.

### Alternative 2: T1 summaries with inline excerpts (no tool calls)

T1 scripts include full excerpts of flagged sections in the JSON output. The LLM receives everything it needs in one prompt, but only for flagged content.

**Pros:**
- Single prompt, no tool call overhead
- Simpler agent workflow (no iterative Read calls)
- Faster wall-clock time (one LLM call instead of multiple)

**Cons:**
- Excerpt length is hard to tune: too short misses context, too long approaches full-content token usage
- Large files with many flagged sections could produce JSON payloads approaching the size of the original content
- No granularity -- the LLM cannot decide to skip an excerpt it already received

**Why Rejected**: Defeats the purpose when many sections are flagged. The symbolic handle approach lets the LLM decide which flagged sections are worth reading in full, providing a second level of filtering that excerpts cannot offer.

### Alternative 3: T1 filtering with content streaming

T1 scripts emit only the filtered content (flagged sections' full text), discarding everything else. The LLM receives a reduced document, not JSON metadata.

**Pros:**
- LLM receives natural prose, not structured JSON
- No tool calls needed
- Simpler integration (just a smaller document)

**Cons:**
- Loses structural metadata (heading hierarchy, link inventory, word counts) that agents use for their assessments
- No distinction between "T1 found an issue" and "T1 wants LLM review" -- everything is content
- Cannot report T1 structural findings separately from LLM semantic findings
- The LLM loses awareness of document structure (what was filtered out and why)

**Why Rejected**: Structural metadata is itself valuable output (broken links, missing sections, frontmatter errors). Collapsing everything into filtered content loses the T1 layer's diagnostic value.

### Alternative 4: Two-pass approach (T2 haiku reads everything, T3 reads flagged only)

Skip T1 scripts entirely. Send full content to a T2 haiku model for scanning, then send only haiku's findings to T3 for deep review.

**Pros:**
- Haiku can catch semantic issues that structural analysis misses
- No TypeScript scripts to build or maintain
- Simpler architecture (LLM-to-LLM, no scripts)

**Cons:**
- T2 haiku still reads full content, so total token consumption may not decrease (it shifts from T3 to T2)
- Cost reduction depends entirely on the T2/T3 price ratio, not on reading less content
- Does not address structural issues that are cheaper to catch deterministically
- Adds latency (two sequential LLM calls instead of one script + one LLM call)

**Why Rejected**: This shifts cost from expensive to cheap models but does not reduce the total content processed. The RLM insight is that most content does not need to be read by any model -- deterministic analysis eliminates it entirely.

## Consequences

### Positive

- Primary mechanism for the 50-70% token reduction target
- LLM focus shifts from reading to judging -- higher-value use of expensive models
- Structural issues (broken links, missing sections, stale files) are reported deterministically with zero token cost
- The pattern is composable: future agents can adopt symbolic handles by adding a T1 script
- Tool-call-based retrieval gives the LLM agency over what it reads, enabling a second filtering pass

### Negative

- Agents make more tool calls (Read) during execution, adding some latency per call
- Agent prompts become more complex: they must understand JSON metadata format and know when to call Read
- If T1 classification is wrong (significant file marked trivial), the LLM never sees it -- a false-negative risk
- Depends on the Read tool being available and working correctly in the agent's execution environment

### Neutral

- T1 JSON includes short excerpts (200 chars) as a preview, providing some content even without Read calls
- Fallback behavior is preserved: if T1 output is absent, agents fall back to full-content processing (decision D5 in backlog)

## References

- RLM paper: arXiv:2512.24601v2, "Recursive Language Models" -- symbolic handles with depth-based routing
- Charter goal: "Reduce token consumption by 50-70% for the four highest-context review agents"
- Backlog architecture section 4, decision D2
- Existing exemplar: cognitive-load-assessor uses `cli_calculator.py` output (T1 JSON) and LLM only processes D4 (naming)
- Existing exemplar: code-reviewer Workflow 5 validation sandwich (T1 linters, T2 style, T3 architecture)
