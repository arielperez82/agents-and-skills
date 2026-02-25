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

# ADR I18-RLMP-003: Sequential Pre-Filters Before Parallel Agent Dispatch

## Status

Proposed

## Context

The `review-changes` command currently gathers uncommitted changes (git diff, git status), then dispatches all applicable review agents in parallel. I18-RLMP adds T1 pre-filter scripts that must run before agents can consume their JSON output. The question is where in the execution timeline these pre-filters run.

Three T1 scripts need to execute:

- `prefilter-markdown.ts` (serves docs-reviewer) -- parses markdown AST
- `prefilter-diff.ts` (serves code-reviewer) -- parses git diff output
- `prefilter-progress.ts` (serves progress-assessor) -- scans `.docs/` directory

Each script is sub-second (AST parsing, diff parsing, file system traversal). LLM agent execution takes seconds to minutes. The pre-filter output (JSON) must be available when the consuming agent starts.

## Decision

Pre-filter scripts run sequentially in a single phase that completes before any agent is dispatched. The execution timeline becomes:

```
1. Gather diff (git diff HEAD, git status)           -- existing step
2. Classify files by type (markdown, source, .docs/)  -- new step
3. Run applicable T1 pre-filters (sequential)          -- new step
4. Dispatch agents in parallel (existing behavior)     -- existing step, now with T1 JSON
```

All applicable pre-filters complete before step 4 begins. The three pre-filters may run sequentially within step 3 (simplest implementation) or in parallel with each other (minor optimization), but step 3 as a whole completes before step 4.

## Alternatives Considered

### Alternative 1: Each agent invokes its own pre-filter at startup

Each agent definition includes a "run this script first" step. The agent process spawns the T1 script, waits for output, then proceeds with LLM processing.

**Pros:**
- No changes to the review-changes command
- Each agent is self-contained -- it manages its own T1 step
- Agents that are not invoked do not trigger unnecessary pre-filter runs

**Cons:**
- Agents are markdown definition files interpreted by an LLM -- they cannot reliably spawn subprocesses
- Multiple agents consuming the same pre-filter (e.g., if two agents need diff data) would run it redundantly
- Race condition risk: if the agent's LLM starts before the script completes, the prompt lacks T1 data
- Agent definitions become more complex, mixing orchestration logic with review logic
- Testing becomes harder: must test both the script and the agent's ability to invoke it

**Why Rejected**: Agents in this system are LLM prompt definitions, not process managers. Pushing orchestration into agent definitions conflates two concerns and introduces unreliable subprocess management within an LLM context.

### Alternative 2: Pre-filters run in parallel with agent dispatch

Pre-filters start at the same time as agents. Agents that need T1 data wait (poll or block) for their pre-filter to finish. Agents that do not need T1 data proceed immediately.

**Pros:**
- Minimal latency impact -- pre-filters and non-dependent agents run concurrently
- Optimal wall-clock time for the overall review gate

**Cons:**
- Requires a synchronization mechanism (agents must wait for their pre-filter's JSON)
- Agents that start before their T1 data is ready need retry logic or a blocking read
- Adds complexity to the review-changes command (concurrent process management with dependencies)
- The latency savings are negligible: pre-filters complete in sub-second, while LLM agents take seconds to minutes
- Debugging becomes harder when agent failures correlate with pre-filter timing

**Why Rejected**: The complexity of concurrent dependency management is not justified by sub-second latency savings. Pre-filters take <1 second total; LLM inference takes 10-60 seconds per agent. Running pre-filters first adds <1% to total wall-clock time while eliminating all synchronization complexity.

### Alternative 3: Pre-filters as a pre-commit hook (separate from review-changes)

Pre-filters run as part of the Husky pre-commit hook. Their JSON output is cached (e.g., in `/tmp/`). The review-changes command reads cached output if available.

**Pros:**
- Pre-filter data available before review-changes even starts
- Separates structural analysis from the review gate

**Cons:**
- Pre-commit hooks run on staged files, not the full diff that review-changes analyzes
- Cached output may be stale if files change between commit and review
- Adds a dependency on temp file management and cache invalidation
- Pre-commit hooks should be fast; adding three scripts (even sub-second) increases commit friction
- Not all review-changes invocations are triggered by commits

**Why Rejected**: review-changes operates on a different file set than pre-commit hooks (uncommitted changes vs. staged changes). Caching introduces staleness. The pre-filter step belongs in the same pipeline as agent dispatch.

## Consequences

### Positive

- Simple, linear execution model: gather data, pre-filter, dispatch agents
- No synchronization, no race conditions, no polling
- Every agent has its T1 data available at startup -- guaranteed
- Easy to debug: pre-filter failures are caught before any agent runs
- Pre-filter errors can abort the review gate early (fail fast) without wasting LLM tokens

### Negative

- Pre-filters run even for agents that might be excluded by the review-changes inclusion logic (minor waste)
- Total wall-clock time increases by the pre-filter duration (sub-second, negligible vs. LLM inference)
- If a fourth or fifth pre-filter is added in the future, the sequential phase grows (still sub-second per script, but worth monitoring)

### Neutral

- The three pre-filters within step 3 can be parallelized with each other as a future optimization, since they have no dependencies between them
- The decision does not preclude a future move to Alternative 2 if pre-filter execution time grows significantly

## References

- Backlog architecture section 3 (integration patterns) and section 4, decision D4
- Charter constraint: "Modifying the parallel execution model in review-changes" is out of scope -- agents still run in parallel
- Backlog item B10: "Pre-filters invoked before agent dispatch, JSON passed as context"
- Existing pattern: review-changes already has a sequential "gather diff" step before parallel dispatch
