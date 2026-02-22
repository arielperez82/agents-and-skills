---
initiative: I14-MATO
initiative_name: Multi-Agent Token Optimization
type: plan
endeavor: repo
subject: cost-tier-activation
date: 2026-02-22
status: draft
---

# Plan: Activate Cost-Tier Routing and Subagent Delegation Skills

## Problem Statement

Two skills — `orchestrating-agents` and `subagent-driven-development` — exist with good content but are never activated because:

1. **No mandatory loading trigger** in CLAUDE.md for either skill
2. **`orchestrating-agents` is nobody's core skill** (related-only for 5 agents)
3. **No decision point** between "plan created" and "how to execute it"
4. **Cost-efficiency principle missing** from CLAUDE.md core philosophy
5. **No command entry point** for subagent-driven-development
6. **Commands reference `orchestrating-agents` as optional** ("if needed")
7. **researcher and code-reviewer don't delegate** to cheaper models for parallelizable sub-tasks

## Changes

### B01 — Add cost-efficiency principle to CLAUDE.md

**File:** `CLAUDE.md`

**Location:** Core Philosophy section, after "Leverage tools."

**Add:**

```markdown
- Route work to the cheapest capable model (T1 local scripts → T2 haiku/subscription CLIs → T3 sonnet/opus for novel judgment).
```

**Location:** Quick Reference → Key Principles, after "Use real schemas/types in tests, never redefine them"

**Add:**

```markdown
- Route subagent work by cost tier (T1 mechanical → T2 analytical → T3 strategic)
```

---

### B02 — Add mandatory loading triggers to CLAUDE.md

**File:** `CLAUDE.md`

**Location:** "Automatic Skill Loading (MANDATORY)" section. Add three new entries to the existing list:

```markdown
- **Executing a plan with 3+ tasks** → Load `subagent-driven-development` skill; engage `engineering-lead` agent
- **Dispatching parallel work or multi-agent workflows** → Load `orchestrating-agents` skill
- **Before dispatching any subagent** → Evaluate cost tier (T1/T2/T3 from `orchestrating-agents` skill)
```

---

### B03 — Promote `orchestrating-agents` to core skill for `engineering-lead`

**File:** `agents/engineering-lead.md`

**Frontmatter change:** Move `orchestrating-agents` from `related-skills` to `skills`:

```yaml
skills:
  - engineering-team/subagent-driven-development
  - engineering-team/code-reviewer
  - engineering-team/planning
  - orchestrating-agents   # NEW — core skill for cost-tier routing
```

Remove `orchestrating-agents` from `related-skills`.

**Body change:** Add new section after "Core: Planning":

```markdown
### Core: Orchestrating Agents
**Path:** `skills/orchestrating-agents/SKILL.md`

Used for:
- Cost-tier routing: evaluate each task/review dispatch as T1 (local script), T2 (haiku/gemini/codex), or T3 (sonnet/opus)
- Validation sandwich: cheap agents generate, expensive agents validate
- Parallel dispatch when tasks are independent
- Cross-vendor delegation (Cursor Agent, Gemini CLI, Codex CLI) for subscription-rate work

**Decision before every dispatch:**
```
Is this deterministic? ──yes──► T1 (local script, linter, tsc)
        │ no
Does it follow established patterns? ──yes──► T2 (haiku / gemini / codex / agent)
        │ no
Requires novel judgment? ──yes──► T3 (claude sonnet/opus)
```
```

---

### B04 — Add execution-method recommendation to `implementation-planner` output

**File:** `agents/implementation-planner.md`

**Location:** After the "Planning Checklist" section (around line 315), add:

```markdown
### Execution Method Recommendation (MANDATORY)

Every plan MUST end with an **Execution Recommendation** section that tells the executor HOW to run the plan. Evaluate the task list and recommend one of:

| Condition | Recommendation | Agent/Command |
|-----------|---------------|---------------|
| 3+ independent tasks, same session | Subagent-driven development | `engineering-lead` with `subagent-driven-development` skill |
| Parallel-safe tasks, multiple sessions OK | Parallel execution | `/code/parallel` |
| Tightly coupled tasks, sequential dependencies | Manual step-by-step | Direct execution or `/code/auto` |
| Single task | Direct dispatch | Appropriate engineer agent directly |

**Template for plan footer:**

```markdown
## Execution Recommendation

- **Method:** Subagent-driven development / Parallel execution / Manual step-by-step
- **Agent:** engineering-lead / direct / [specific engineer]
- **Rationale:** [why this method fits the task structure]
- **Cost tier notes:** [which tasks are T1/T2/T3, any that can use cheaper models]
```

This bridges the gap between "plan created" and "how to execute it." The executor (human or agent) reads this section to know which workflow to invoke.
```

Also add to the Planning Checklist:

```markdown
- [ ] **Execution recommendation included** (subagent-driven / parallel / manual + cost tier notes)
```

---

### B05 — Add cost-tier delegation to `researcher` agent

**File:** `agents/researcher.md`

**Location:** After "Collaboration Protocol" section (around line 127), add new section:

```markdown
## Cost-Tier Research Delegation

For large research tasks with multiple independent questions, delegate sub-tasks to cheaper models rather than doing everything yourself at T3 cost.

**Decision framework:**

| Research sub-task | Tier | Route to |
|-------------------|------|----------|
| Gather raw documentation, list features, find links | T2 | `claude --model haiku`, `gemini`, or `agent` |
| Summarize a single document or changelog | T2 | `claude --model haiku` or `gemini` |
| Compare alternatives with nuanced trade-offs | T3 | Self (sonnet/opus) |
| Synthesize multiple sources into recommendation | T3 | Self (sonnet/opus) |
| Web search + extract key facts | T2 | `gemini` (subscription, 2M context) |

**Pattern: Research fan-out with T2 gatherers**

```
1. Decompose research question into independent sub-questions
2. Dispatch T2 agents in parallel to gather raw findings per sub-question:
   - gemini -p "Research [sub-topic]. List key facts, links, and trade-offs." > /tmp/research-{n}.txt
   - OR: claude -p "[sub-question]" --model haiku > /tmp/research-{n}.txt
3. Collect all T2 outputs
4. Synthesize at T3 (yourself): read all gathered findings, cross-reference,
   evaluate trade-offs, produce final research report with recommendations
```

**When to delegate:** Research scope has 3+ independent sub-questions AND total research would exceed ~10 minutes of T3 time. For focused single-question research, do it yourself.

**Load `orchestrating-agents` skill** for CLI invocation patterns and parallel dispatch.
```

Also update frontmatter: promote `orchestrating-agents` from `related-skills` to `skills`:

```yaml
skills: [research, orchestrating-agents]
```

---

### B06 — Add cost-tier delegation to `code-reviewer` agent for large reviews

**File:** `agents/code-reviewer.md`

**Location:** After "Workflow 1: Pull Request Review" (around line 206), add new workflow:

```markdown
### Workflow 5: Cost-Optimized Large Review (Validation Sandwich)

**Goal:** For large reviews (>500 lines changed, or end-of-initiative sweeps like post-`/craft`), use cheaper models for first-pass analysis and reserve expensive models for judgment calls.

**When to use:** Large diffs, codebase-wide reviews, final `/craft` review, or any review touching 10+ files.

**Steps:**

1. **T1 — Automated checks first** (free, deterministic)
   ```bash
   # Run local tools before any LLM review
   pnpm lint
   pnpm type-check
   pnpm test
   ```

2. **T2 — First-pass review with cheaper models** (pattern-following)
   Dispatch cheap agents in parallel for mechanical review dimensions:
   ```bash
   # Style, naming, formatting issues
   claude -p "Review this diff for naming conventions, formatting issues, and style violations. List findings as: file:line — issue." --model haiku < diff.txt > /tmp/review-style.txt

   # Anti-pattern detection
   gemini -p "Scan this diff for common anti-patterns: magic numbers, deep nesting (>3 levels), any type usage, mutable state, missing error handling at boundaries. List findings." < diff.txt > /tmp/review-antipatterns.txt

   # Test coverage gaps
   claude -p "Compare test files with source files in this diff. List any source functions/methods that lack corresponding test coverage." --model haiku < diff.txt > /tmp/review-coverage.txt
   ```

3. **T3 — Expert review with expensive model** (novel judgment)
   You (sonnet/opus) review for dimensions that require judgment:
   - Architectural concerns and design pattern issues
   - Subtle bugs and edge cases
   - Security vulnerabilities requiring contextual understanding
   - Cross-cutting integration concerns
   - Validate T2 findings: filter false positives, confirm real issues

4. **Merge and report**
   Combine T2 findings (after T3 validation) with T3 findings into the standard tiered output format.

**Cost savings:** T2 first-pass catches ~60-70% of mechanical issues at ~10% of the T3 cost. T3 review input is smaller (focused on judgment calls + T2 validation) rather than full cold review.

**Load `orchestrating-agents` skill** for CLI invocation patterns and tier routing.
```

Also update frontmatter: promote `orchestrating-agents` from `related-skills` to `skills`:

```yaml
skills: [engineering-team/code-reviewer, orchestrating-agents]
```

---

### B07 — Update `review-changes` command to default to cost-tier routing

**File:** `commands/review/review-changes.md`

**Location:** Replace the note at line 207:

**Before:**
```
- Load `orchestrating-agents` skill for advanced parallel patterns if needed.
```

**After:**
```
- **Cost-tier routing (default):** Load `orchestrating-agents` skill for cost-optimized dispatch. When the diff is large (>500 lines or 10+ files), use the validation sandwich pattern: dispatch T2 agents (haiku/gemini) for mechanical checks (style, anti-patterns, naming), then T3 agents (sonnet) for judgment-dependent analysis (architecture, security, subtle bugs). For small diffs, all agents run at their classified model tier as normal.
```

---

### B08 — Add `orchestrating-agents` as core skill for `researcher`

Covered in B05 above (frontmatter change).

---

## Summary of File Changes

| File | Change Type | Backlog Item |
|------|-------------|--------------|
| `CLAUDE.md` | Add principle + mandatory triggers | B01, B02 |
| `agents/engineering-lead.md` | Promote skill, add section | B03 |
| `agents/implementation-planner.md` | Add execution recommendation | B04 |
| `agents/researcher.md` | Add delegation section + promote skill | B05 |
| `agents/code-reviewer.md` | Add large review workflow + promote skill | B06 |
| `commands/review/review-changes.md` | Change optional → default | B07 |

## Execution Recommendation

- **Method:** Manual step-by-step
- **Agent:** Direct execution (these are doc/config edits, not code)
- **Rationale:** All changes are markdown edits to existing files, tightly coupled in concept but simple to execute sequentially. No TDD needed (no production code). Each change is small and self-contained.
- **Cost tier notes:** All T3 (requires understanding the semantic intent of each change)

## Risks

1. **Over-prescription risk:** Adding too many mandatory triggers could make the loading list noisy. Mitigated by keeping triggers specific (3+ task plan, parallel work, subagent dispatch).
2. **Circular dependency risk:** If `orchestrating-agents` is loaded too eagerly, it might suggest delegation for trivial tasks. Mitigated by the tier decision tree (T1 first, T2 only for pattern-following, T3 for judgment).
3. **CLI availability:** Not all users will have gemini/codex/agent CLIs installed. The skill already handles this (falls back to claude with model flag).
