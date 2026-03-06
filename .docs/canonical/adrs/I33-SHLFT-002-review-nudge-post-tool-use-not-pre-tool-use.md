---
type: adr
endeavor: repo
initiative: I33-SHLFT
adr_id: I33-SHLFT-002
title: review-nudge as PostToolUse nudge, not PreToolUse block
status: proposed
date: 2026-03-06
supersedes: []
superseded_by: null
decision_makers:
  - Engineering Lead
---

# I33-SHLFT-002: review-nudge as PostToolUse Nudge, Not PreToolUse Block

## Status

Proposed

## Context

The craft pipeline specifies that `/review/review-changes --mode diff` should run after each Build commit. Retrospective findings L65 and L71 show that agents skip this review step under context pressure -- the check is agent-discretionary, not enforced. The initiative needs a programmatic mechanism to ensure review happens.

Claude Code hooks provide two enforcement points:

- **PreToolUse**: Runs before a tool call executes. Exit 2 blocks the tool call entirely.
- **PostToolUse**: Runs after a tool call completes. Can emit a `systemMessage` that the agent sees as context, but cannot prevent the next action.

The question is which hook type to use for review enforcement.

## Decision

Use **PostToolUse** with a `systemMessage` nudge, not PreToolUse with a block.

When the hook detects a successful `git commit` in Bash tool output, it sets a "review pending" flag. On subsequent tool calls, if the flag is set and no `/review/review-changes` has been detected, the hook emits a nudge via `systemMessage`. The nudge is throttled to once per 60 seconds and suppressed for `wip:` and `docs:` commit prefixes.

## Rationale

1. **Blocking halts TDD cycles.** The TDD workflow is RED-GREEN-REFACTOR-COMMIT. A PreToolUse block after commit would prevent the agent from starting the next RED step until review completes. This breaks the fast feedback loop that TDD depends on.

2. **Review is a per-story gate, not a per-commit gate.** The validation model in CLAUDE.md defines two tiers: per-commit (lightweight, automatic) and per-story (heavyweight, manual trigger). Review-changes is a per-story gate. Blocking every tool call until review runs would effectively make it a per-commit gate, which is too aggressive.

3. **Nudges preserve agent autonomy.** A PostToolUse `systemMessage` gives the agent information ("you have pending review") without removing its ability to act. The agent can batch several rapid TDD cycles and then review, which is the intended workflow for small increments.

4. **Matches the commit-monitor pattern.** The existing `commit-monitor` PostToolUse hook uses the same nudge approach: it warns when risk score is high but only blocks at the red threshold via a separate PreToolUse hook. Review-nudge follows this graduated pattern (nudge first, no block).

5. **Charter specification.** US-7 AC-1 explicitly specifies PostToolUse detection, and R7 in the risk table acknowledges that blocking would be noisy during rapid TDD cycles.

## Alternatives Considered

### Alternative 1: PreToolUse block until review runs

A PreToolUse hook that blocks all tool calls (exit 2) when the review-pending flag is set, forcing the agent to run `/review/review-changes` before continuing.

**Pros:**
- Guarantees review runs after every commit -- zero chance of skipping
- Enforcement is absolute, not advisory
- Simple mental model: commit triggers review, no exceptions

**Cons:**
- Halts TDD cycles: agent cannot write the next failing test until review completes
- Review-changes takes 30-120 seconds per run (parallel agent dispatch + LLM inference)
- Forcing review after every commit in a rapid TDD session (5-10 commits/hour) would add 5-20 minutes of blocked time per hour
- Creates an incentive to make fewer, larger commits (opposite of the desired "20 small commits > 1 large commit" rule)
- The per-commit/per-story distinction exists precisely because heavyweight gates should not run on every cycle

**Why Rejected**: The cost of blocking TDD cycles outweighs the benefit of absolute enforcement. Agents that ignore nudges are a lower risk than agents that cannot make progress.

### Alternative 2: PreToolUse block with allowlist

A PreToolUse hook that blocks most tool calls but allows Read, Grep, Glob, and Write (so the agent can prepare for review). Only blocks Bash and Agent tool calls.

**Pros:**
- Less disruptive than blocking everything
- Agent can still read code and write files
- Only blocks execution and delegation

**Cons:**
- Still prevents `bash npx vitest` (running tests), which is essential for TDD
- Partial blocking is confusing: "why can I read but not run tests?"
- Complex allowlist logic adds maintenance burden
- Does not solve the core problem: blocking the TDD cycle

**Why Rejected**: Any block that prevents running tests breaks TDD. The allowlist approach tries to find a middle ground but the fundamental conflict remains.

### Alternative 3: Hybrid -- nudge first, block after N commits

PostToolUse nudge for the first 2-3 commits without review, then escalate to PreToolUse block.

**Pros:**
- Allows rapid TDD for a few cycles
- Eventually forces review if agent ignores nudges
- Graduated escalation

**Cons:**
- Adds complexity (counter logic, threshold tuning)
- The "right" number of commits before blocking varies by context
- Still blocks TDD when the threshold is hit
- Harder to reason about: "sometimes it nudges, sometimes it blocks"

**Why Rejected**: Adds complexity without a clear benefit. If nudging is insufficient, the answer is to investigate why agents ignore nudges (prompt tuning), not to add a delayed block.

## Consequences

### Positive

- TDD cycles remain uninterrupted -- agents can maintain flow
- Review is encouraged but not forced, preserving the per-commit/per-story distinction
- Throttling (60-second window) prevents context window pollution
- `wip:` and `docs:` prefix exclusions reduce noise for non-feature commits
- Consistent with commit-monitor's graduated nudge pattern

### Negative

- Agents can ignore the nudge and skip review entirely (advisory, not mandatory)
- No guarantee that review runs after every commit -- some commits may go unreviewed until the per-story gate
- Relies on agent compliance with `systemMessage` content (which is generally high but not 100%)

### Neutral

- If future data shows agents consistently ignore nudges, this decision can be revisited with the hybrid approach (Alternative 3) or with prompt-level reinforcement in the tdd-reviewer agent
- The nudge frequency can be tuned via `REVIEW_NUDGE_THROTTLE` env var without code changes

## References

- Charter US-7: "PostToolUse hook detects `git commit` and nudges if `/review/review-changes --mode diff` has not run"
- Charter R7: "Review-pending hook is noisy during rapid TDD cycles" -- mitigated by PostToolUse + throttling
- CLAUDE.md validation model: per-commit (lightweight) vs per-story (heavyweight)
- Commit-monitor pattern: PostToolUse nudge with graduated escalation to PreToolUse block at red threshold
