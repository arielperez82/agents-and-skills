---
name: tiered-review
description: T1-T2-T3 processing pattern for review agents — deterministic pre-filtering before LLM analysis to reduce token consumption 50-70%.
metadata:
  title: Tiered Review Processing
  domain: engineering
  subdomain: review-optimization
  tags: [review, pre-filtering, token-optimization, tiered-processing]
  status: active
  version: 1.0.0
  updated: 2026-02-25
  initiative: I18-RLMP
  initiative_name: Review-Led Model Processing
---

# Tiered Review Processing

Reduce token consumption in review agents by routing work through three tiers: T1 deterministic scripts for structural analysis, T2 haiku for scanning, T3 sonnet/opus for deep semantic judgment. The LLM never sees full file contents — only structural summaries and flagged section excerpts.

## When to Load This Skill

- Designing or updating review/assessment agents that process documents or code
- Adding pre-filter scripts to reduce agent context size
- Implementing the symbolic handle pattern (pass paths + summaries, not content)
- Optimizing token consumption for high-frequency agents

## Core Pattern: T1-T2-T3 Processing Pipeline

```
Input (files, diff, docs)
  |
  v
T1: Deterministic Script (TypeScript)
  - Structural analysis (AST, regex, file system)
  - JSON output: structural issues + flagged sections
  - Sub-second execution, zero tokens
  |
  v
T2: Haiku/Gemini Scan (optional)
  - Receives T1 JSON + excerpts from flagged sections
  - Scans for patterns T1 cannot detect (style, clarity, naming)
  - Produces condensed findings list
  |
  v
T3: Sonnet/Opus Deep Review
  - Receives T1 summary + T2 findings + symbolic handles
  - Uses Read tool to access only flagged sections
  - Deep semantic judgment on issues requiring expertise
```

### Decision Framework: What Belongs at Each Tier

| Tier | Characteristics | Examples |
|------|----------------|----------|
| **T1 (Script)** | Deterministic, structural, no judgment needed | Broken links, missing sections, file existence, frontmatter validation, complexity metrics, line counts, AST analysis |
| **T2 (Haiku)** | Pattern matching, style, low-judgment scanning | Grammar/clarity scan, naming quality, code style violations, anti-pattern detection |
| **T3 (Sonnet/Opus)** | Semantic, architectural, requires deep context | Architecture review, security vulnerability analysis, business logic correctness, cross-file implications |

**Rule of thumb:** If a check can be expressed as "does X exist / match pattern Y / exceed threshold Z" — it belongs at T1. If it requires reading prose and making a subjective judgment — it belongs at T2 or T3.

## Symbolic Handle Pattern

The primary token-reduction mechanism. Instead of passing full file contents to the LLM:

1. **T1 script** produces a JSON summary with file paths, line ranges, and structural metadata
2. **Agent prompt** receives the JSON summary (compact) instead of raw file contents (large)
3. **LLM uses `Read` tool** to access only the specific line ranges flagged by T1/T2
4. **Result:** LLM context contains summaries (~100-500 tokens per file) instead of full content (~2000-10000 tokens per file)

```
BEFORE (full context):
  Agent receives: [entire file content, 5000 tokens]
  LLM reads everything, reports "looks fine" for 90% of content

AFTER (symbolic handles):
  Agent receives: { path: "README.md", issues: [...], flagged: [{ lines: "45-60", reason: "..." }] }
  LLM reads only lines 45-60 via Read tool when needed
  Token savings: 60-80% per file
```

## Existing Exemplars

### cognitive-load-assessor (T1-first pattern, Python)

The best existing example of tiered execution. Uses `cli_calculator.py` (T1 Python script) for D1-D8 dimension scoring. The LLM handles only D4 (naming assessment) — the one dimension requiring semantic judgment.

- **T1:** `cli_calculator.py` computes structural complexity, nesting, volume, coupling, cohesion, duplication, navigability
- **T3:** LLM assesses naming quality (D4) — the only dimension requiring reading and judging code semantics
- **Result:** ~80% of the assessment is deterministic; LLM tokens reserved for the 20% needing judgment

### code-reviewer Workflow 5 (validation sandwich)

Documented in `agents/code-reviewer.md` as the approach for large reviews. Three-pass structure:

- **T1:** Linters + `pr_analyzer.py` + `code_quality_checker.py` catch mechanical issues
- **T2:** Haiku scans for style, naming, anti-patterns, test coverage gaps
- **T3:** Sonnet reviews architecture, security, subtle bugs — only for files/sections flagged by T1/T2

## T1 Script Conventions

Scripts in this skill follow established patterns from `quality-gate-first/scripts/`:

- **Shebang:** `#!/usr/bin/env npx tsx`
- **Language:** TypeScript strict mode, readonly types, no `any`
- **I/O:** CLI args or stdin for input, JSON to stdout
- **Exit codes:** 0 (success), 1 (invalid input), 2 (parse error)
- **Side effects:** None — pure functions, no file writes, no network calls
- **Tests:** Co-located `.test.ts` files using `node:test` + `node:assert`

### Available Pre-Filter Scripts

| Script | Input | Output | Serves |
|--------|-------|--------|--------|
| `prefilter-markdown.ts` | File paths (CLI args) | `MarkdownPrefilterOutput` JSON | docs-reviewer |
| `prefilter-diff.ts` | Git diff (stdin) | `DiffPrefilterOutput` JSON | code-reviewer |
| `prefilter-progress.ts` | Directory path (CLI arg) | `ProgressPrefilterOutput` JSON | progress-assessor |

Type definitions (`MarkdownPrefilterOutput`, `DiffPrefilterOutput`, `ProgressPrefilterOutput`) are exported from each script's source file.

### Adding a New Pre-Filter

1. Create `prefilter-<domain>.ts` under `scripts/` with the shebang and conventions above
2. Define and export the output type (extend the symbolic handle pattern)
3. Add co-located `.test.ts` using `node:test` + `node:assert/strict`
4. Update the "Available Pre-Filter Scripts" table above
5. Wire the consuming agent's prompt to receive `T1 PRE-FILTER RESULTS:` JSON block

## References

- ADR `I18-RLMP-001-scripts-colocated-under-tiered-review-skill.md`: Scripts co-located under this skill
- ADR `I18-RLMP-002-symbolic-handle-pattern.md`: Symbolic handle pattern
- ADR `I18-RLMP-003-sequential-prefilters-before-parallel-dispatch.md`: Sequential pre-filters before parallel dispatch
