---
type: adr
endeavor: repo
initiative: I33-SHLFT
adr_id: I33-SHLFT-004
title: RED evidence as skill convention, not Husky commit-msg hook
status: accepted
date: 2026-03-06
supersedes: []
superseded_by: null
decision_makers:
  - Engineering Lead
---

# I33-SHLFT-004: RED Evidence as Skill Convention, Not Husky commit-msg Hook

## Status

Proposed

## Context

Retrospective finding L74 identified that TDD discipline is invisible in git history: agents combine RED and GREEN work into a single commit, erasing evidence that tests were written first. The initiative introduces a "RED Evidence Protocol" where agents commit `.skip`/`.todo` tests with a `red:` commit message prefix before implementing the GREEN phase.

The `red:` prefix is a new commit message convention. The question is whether to enforce it via a Husky `commit-msg` hook (programmatic enforcement) or via skill guidance in the TDD SKILL.md (agent-discretionary convention).

This is a meaningful trade-off because the charter's core thesis is "hooks are guarantees; prompts are suggestions" -- yet this specific case favors the suggestion approach.

## Decision

The `red:` commit prefix starts as an **agent-discretionary convention** documented in the TDD skill. No Husky `commit-msg` hook enforces the prefix format.

The TDD SKILL.md documents the RED Evidence Protocol:

1. Write test with `.skip`/`.todo`
2. Commit with `red:` prefix (e.g., `red: user login returns 401 for expired tokens`)
3. Enable test, make it pass, refactor
4. Commit on GREEN with standard prefix (e.g., `feat:`, `fix:`, `test:`)

The `tdd-reviewer` agent checks for `red:` prefix commits in git history as an advisory observation, not a blocking finding.

## Rationale

1. **A commit-msg hook cannot distinguish intent.** The hook would need to determine whether a commit _should_ have a `red:` prefix. Not all commits are RED phase commits -- GREEN, REFACTOR, docs, and chore commits are equally valid. A hook that rejects commits without `red:` would block legitimate non-RED commits. A hook that only validates the prefix format (when present) provides minimal value.

2. **The convention needs adoption data before enforcement.** This is a new workflow pattern. Enforcing it via hook before teams have practiced it creates friction without understanding. Starting with skill guidance allows measurement: do agents naturally adopt `red:` commits? Is the 4-step cycle practical? What edge cases emerge? The charter explicitly defers hook enforcement to gather this data.

3. **Enforcement of commit message format is a different problem.** The existing commit message convention (`type(scope): subject`) is also not enforced by a Husky hook -- it is a CLAUDE.md convention that agents follow through prompt guidance. Adding a `commit-msg` hook for `red:` but not for the existing format would be inconsistent.

4. **The real value is in the `.skip`/`.todo` tests, not the prefix.** The RED Evidence Protocol's primary contribution is making test-first discipline visible through `.skip` test commits. The `red:` prefix is a labeling convenience for git log readability. If agents commit `.skip` tests but forget the `red:` prefix, the protocol still achieves its goal.

5. **Charter scope.** The charter's Out of Scope section explicitly states: "Enforcement of X1 commit message format via Husky commit-msg hook (deferred -- start with agent-discretionary convention, measure adoption, then decide)."

## Alternatives Considered

### Alternative 1: Husky commit-msg hook enforcing `red:` prefix

A `commit-msg` hook that validates commit messages. If the commit contains `.skip` or `.todo` test changes, require the `red:` prefix. Reject commits that add skipped tests without the prefix.

**Pros:**
- Programmatic enforcement -- cannot be skipped
- Consistent with the initiative's "hooks are guarantees" thesis
- Makes RED evidence truly mandatory

**Cons:**
- Requires parsing staged files in a commit-msg hook to detect `.skip`/`.todo` changes (complex, slow)
- False positives: legitimate `.skip` tests (temporarily disabled for debugging) would trigger the hook
- False negatives: agents could avoid the hook by committing `.skip` tests and production code separately
- Adds latency to every commit (must inspect staged files)
- No existing `commit-msg` hook in the project -- would be the first, adding a new hook type to the infrastructure
- The convention is untested -- enforcing before measuring adoption risks creating friction without proven value

**Why Rejected**: The hook cannot reliably determine when a `red:` prefix is appropriate. Parsing staged files for `.skip`/`.todo` patterns is fragile and slow. The convention needs adoption data before enforcement is justified.

### Alternative 2: PostToolUse hook that checks commit messages

A PostToolUse hook that inspects `git commit` output for commit messages. If the message contains patterns suggesting a RED phase (`.skip`, `.todo`, "failing test") but lacks the `red:` prefix, emit a `systemMessage` nudge.

**Pros:**
- Nudge approach (not blocking), consistent with review-nudge pattern
- Can detect RED-phase commits by inspecting the commit message after the fact
- No modification to git hooks infrastructure

**Cons:**
- Detection heuristic is unreliable: commit messages may not mention `.skip`/`.todo`
- Adds another PostToolUse hook (growing the hook count)
- The nudge fires after the commit is already made -- the agent would need to amend (which we discourage) or just note it for next time
- Solving a convention compliance problem with a hook is over-engineering when skill guidance achieves 80%+ compliance

**Why Rejected**: A PostToolUse hook for commit message style is over-engineering. The compliance target is agent behavior during TDD, which is better addressed by skill guidance that agents load at session start.

### Alternative 3: Enforce via tdd-reviewer as a blocking finding

Make the `tdd-reviewer` agent treat missing `red:` commits as a blocking review finding (not advisory).

**Pros:**
- Enforcement at review time, when context is available
- Reviewer can assess whether RED evidence should have been present
- No hook infrastructure needed

**Cons:**
- Review runs per-story, not per-commit -- feedback is delayed
- Blocking on missing `red:` commits would reject entire stories retroactively
- Cannot fix commit history without rebase (destructive operation)
- Disproportionate: missing a commit prefix label is not the same severity as missing tests

**Why Rejected**: Blocking a story because commit messages lack a prefix is disproportionate. The reviewer should note the observation for future improvement, not reject completed work.

## Consequences

### Positive

- Zero friction for adoption -- agents follow the convention naturally through skill loading
- No new hook type (commit-msg) added to the infrastructure
- Agents can adopt gradually, with the tdd-reviewer providing advisory feedback
- The convention can evolve based on adoption data before being locked down
- Consistent with how existing commit message conventions are handled (prompt-based, not hook-based)

### Negative

- Agents may skip the `red:` prefix under context pressure (the exact failure mode the initiative aims to prevent)
- No guarantee of RED evidence in git history -- compliance depends on agent behavior
- Measuring adoption requires manual git log inspection (no automated reporting)

### Neutral

- If adoption data shows >80% compliance, the convention is working and no hook is needed
- If adoption data shows <50% compliance, a commit-msg hook or PostToolUse nudge should be reconsidered
- The `.skip`/`.todo` test pattern itself is still valuable even without the `red:` prefix

## Revisit Trigger

Revisit this decision after 3+ initiatives have used the RED Evidence Protocol. If `red:` prefix adoption is below 50% in git history, consider Alternative 2 (PostToolUse nudge) as a graduated enforcement step.

## References

- Charter Out of Scope: "Enforcement of X1 commit message format via Husky commit-msg hook (deferred)"
- Backlog key design decision 6: "No Husky commit-msg hook for `red:` prefix enforcement"
- Retrospective L74: "No evidence of RED phase in git history"
- CLAUDE.md commit message format: `type(scope): subject` (agent-discretionary, not hook-enforced)
