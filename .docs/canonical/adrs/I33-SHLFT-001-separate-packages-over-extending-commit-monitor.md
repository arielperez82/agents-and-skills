---
type: adr
endeavor: repo
initiative: I33-SHLFT
adr_id: I33-SHLFT-001
title: Separate packages (worktree-guard, review-nudge) over extending commit-monitor
status: accepted
date: 2026-03-06
supersedes: []
superseded_by: null
decision_makers:
  - Engineering Lead
---

# I33-SHLFT-001: Separate Packages Over Extending commit-monitor

## Status

Proposed

## Context

The I33-SHLFT initiative introduces two new hook enforcement points: a PreToolUse blocker that prevents `git worktree add` when commits are unpushed (worktree-guard), and a PostToolUse nudge that reminds agents to run incremental review after commits (review-nudge).

Both hooks integrate into the same Claude Code hook lifecycle as the existing `commit-monitor` package. The question is whether to extend `commit-monitor` with these capabilities or create separate packages.

The existing hook packages in `packages/` each follow a one-concern-per-package pattern:

- `commit-monitor` -- tracks uncommitted work risk via line counts and time since last commit
- `context-management` -- tracks context window utilization percentage
- `lint-changed` -- runs linters on changed files only
- `prompt-injection-scanner` -- scans skill/agent content for injection patterns

Each package has its own `scripts/`, `tests/`, `install.sh`, `test.sh`, `claude-settings.example.json`, and `README.md`.

## Decision

Create two separate packages (`packages/worktree-guard/` and `packages/review-nudge/`) rather than extending `packages/commit-monitor/`.

## Rationale

1. **Distinct concerns.** Commit-monitor answers "how much uncommitted work is at risk?" Worktree-guard answers "is this branch pushed before dispatching?" Review-nudge answers "has review run since the last commit?" These are three different questions with different data sources, different cache files, and different thresholds.

2. **Independent installability.** Teams that use worktrees but do not care about review nudging (or vice versa) can install only what they need. Bundling unrelated hooks forces an all-or-nothing choice.

3. **Independent testability.** Each package has its own `test.sh` and test suite. Tests for worktree-guard do not need to set up commit-monitor's risk score infrastructure. Tests for review-nudge do not need to mock worktree state.

4. **Matches existing codebase pattern.** All four existing hook packages follow the one-concern pattern. Adding concerns to commit-monitor would break this convention and make it the only multi-concern package.

5. **Simpler maintenance.** Bug fixes or threshold changes to one hook do not risk regressions in unrelated hooks sharing the same script.

## Alternatives Considered

### Alternative 1: Extend commit-monitor with worktree-guard and review-nudge

Add new scripts to `packages/commit-monitor/scripts/` and expand its test suite.

**Pros:**
- Fewer top-level directories in `packages/`
- Shared install infrastructure (one `install.sh`)
- "All commit-related hooks in one place" conceptual grouping

**Cons:**
- Commit-monitor's concern is "uncommitted work risk" -- worktree push state and review tracking are not the same concern
- Test suite grows and becomes harder to reason about
- `install.sh` must handle partial installation (install worktree-guard but not review-nudge)
- Breaking the one-concern-per-package convention established by four existing packages
- Cache file management becomes complex (commit-monitor uses `/tmp/claude-commit-risk-*`, worktree-guard is stateless, review-nudge uses `/tmp/claude-review-pending-*`)

**Why Rejected**: The hooks share the Claude Code hook lifecycle but not the same concern. Grouping by lifecycle mechanism rather than by concern would produce a "kitchen drawer" package that grows with every new hook.

### Alternative 2: Single monolithic hooks package

Create one `packages/hooks/` package containing all hook scripts.

**Pros:**
- Single location for all hook code
- Shared test helpers
- One install script

**Cons:**
- Violates the separation already established by commit-monitor and context-management being separate packages
- Would require migrating existing packages (breaking change)
- All-or-nothing installation
- One failing test blocks all hook packages

**Why Rejected**: Requires migrating existing packages with no benefit. The existing convention works and is proven across four packages.

## Consequences

### Positive

- Each package is small, focused, and independently testable
- Installation is opt-in per hook (install only what you need)
- Follows the proven one-concern-per-package pattern
- New hooks in future initiatives follow the same template
- No risk of regression across unrelated hooks

### Negative

- Two new top-level directories in `packages/` (6 total, up from 4)
- Some boilerplate duplication across packages (`install.sh`, `test.sh` scaffolding)
- Developers must update `~/.claude/settings.json` separately for each package

### Neutral

- Total hook count increases to 5 PreToolUse + 4 PostToolUse, well within the <100ms-per-hook latency budget
- The boilerplate could be extracted into a shared template in a future initiative if the package count grows significantly

## References

- Backlog architecture section: "Separate packages vs extending existing" technology decision
- Charter constraint C4: "Existing hook packages must not be broken by new additions"
- Charter constraint C5: "Each story must be committable and valuable on its own"
- Existing packages: `packages/commit-monitor/`, `packages/context-management/`, `packages/lint-changed/`, `packages/prompt-injection-scanner/`
