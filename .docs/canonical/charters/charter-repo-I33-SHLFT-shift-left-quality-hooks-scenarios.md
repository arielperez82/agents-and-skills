# Acceptance Scenarios: I33-SHLFT -- Shift-Left Quality Hooks

**Charter:** [charter-repo-I33-SHLFT](charter-repo-I33-SHLFT-shift-left-quality-hooks.md)
**Date:** 2026-03-06

Scenarios interact through driving ports only: hook exit codes and stderr, file contents (SKILL.md, command files, settings.json), and CLI commands (git, tsc, lint-staged). No internal implementation details (function names, variable names, class hierarchies) appear in any scenario.

---

## US-1: Compilation Verification in Pre-Commit

### Scenario 1.1: Happy Path -- Skill documents type-check in lint-staged

```gherkin
Given the quality-gate-first SKILL.md exists
When I read the Phase 0 checklist section
Then it lists "tsc --noEmit" as a required lint-staged step for ".ts" files
And it includes an example lint-staged config snippet showing the type-check command
```

### Scenario 1.2: Happy Path -- lint-staged config includes type-check

```gherkin
Given a project follows the quality-gate-first skill
And lint-staged is configured with the documented pattern
When I stage a TypeScript file with a type error (e.g., assigning string to number)
And I run git commit
Then lint-staged runs tsc --noEmit
And the commit is blocked with a type error message
```

### Scenario 1.3: Error Path -- type-check missing from lint-staged config

```gherkin
Given a project has lint-staged configured without a tsc --noEmit step
When I run the phase-0-check command
Then the output reports type-check is missing from lint-staged config
And the check fails with a clear remediation message
```

### Scenario 1.4: Edge Case -- incremental type-check for large projects

```gherkin
Given the quality-gate-first SKILL.md exists
When I read the type-check lint-staged guidance
Then it documents the --incremental flag as a performance optimization for large projects
And it notes that type-check scope is the full project (not individual staged files)
```

### Scenario 1.5: Error Path -- non-TypeScript project

```gherkin
Given a project has no TypeScript files and no tsconfig.json
When I run the phase-0-check command
Then the type-check lint-staged requirement is reported as "not applicable"
And no failure is raised for the missing tsc step
```

---

## US-2: Branch Push Verification Before Worktree Dispatch

### Scenario 2.1: Happy Path -- worktree add allowed when branch is pushed

```gherkin
Given my current branch "feature/US-2" has 3 commits
And all 3 commits are pushed to the remote
When a Bash tool call contains "git worktree add ../worktree-dir feature/US-2"
Then the PreToolUse hook exits with code 0
And the worktree add command proceeds
```

### Scenario 2.2: Error Path -- worktree add blocked when commits are unpushed

```gherkin
Given my current branch "feature/US-2" has 3 commits
And the most recent commit is not pushed to the remote
When a Bash tool call contains "git worktree add ../worktree-dir feature/US-2"
Then the PreToolUse hook exits with code 2
And stderr contains "Push your branch before dispatching worktree agents. Run: git push"
And the worktree add command does not execute
```

### Scenario 2.3: Edge Case -- detached HEAD state

```gherkin
Given my working directory is in detached HEAD state (no tracking branch)
When a Bash tool call contains "git worktree add ../worktree-dir"
Then the PreToolUse hook exits with code 2
And stderr contains a message about needing a branch with a remote tracking ref
```

### Scenario 2.4: Edge Case -- no remote configured

```gherkin
Given my repository has no remote configured
When a Bash tool call contains "git worktree add ../worktree-dir main"
Then the PreToolUse hook exits with code 0
And the worktree add proceeds (no remote to push to, fail-open design)
```

### Scenario 2.5: Error Path -- multiple unpushed commits

```gherkin
Given my current branch "feature/batch" has 5 unpushed commits
When a Bash tool call contains "git worktree add ../wt feature/batch"
Then the PreToolUse hook exits with code 2
And stderr includes the count of unpushed commits: "5 unpushed commit(s)"
```

### Scenario 2.6: Happy Path -- non-worktree git commands are not intercepted

```gherkin
Given my current branch has unpushed commits
When a Bash tool call contains "git status"
Then the PreToolUse hook exits with code 0
And the command proceeds without any worktree-related check
```

### Scenario 2.7: Performance -- hook completes within latency budget

```gherkin
Given the PreToolUse hook is registered in settings.json
When a Bash tool call contains "git worktree add ../wt main"
Then the hook completes in under 100ms
```

### Scenario 2.8: Edge Case -- worktree command embedded in a compound command

```gherkin
Given my current branch has unpushed commits
When a Bash tool call contains "cd /tmp && git worktree add ../wt main"
Then the PreToolUse hook detects "git worktree add" in the command string
And the hook exits with code 2
```

---

## US-3: RED Evidence Protocol via Disabled Tests

### Scenario 3.1: Happy Path -- protocol section exists in TDD skill

```gherkin
Given the TDD SKILL.md at skills/engineering-team/tdd/SKILL.md exists
When I read the "RED Evidence Protocol" section
Then it describes the cycle: write test with .skip/.todo, commit with "red:" prefix, enable test and make it pass, commit on GREEN
And it includes the commit message example: "red: user login returns 401 for expired tokens"
```

### Scenario 3.2: Happy Path -- protocol keeps CI green

```gherkin
Given the TDD SKILL.md "RED Evidence Protocol" section exists
When I read the protocol constraints
Then it explicitly states the build must never break
And it specifies that .skip/.todo markers keep the CI suite green
And it states .skip tests must never be merged to main
```

### Scenario 3.3: Error Path -- tdd-reviewer checks for RED evidence

```gherkin
Given the tdd-reviewer agent definition exists
When I read its review workflow
Then it includes a step to check git history for "red:" prefixed commits
And it flags when multiple GREEN commits appear with no preceding RED evidence
```

### Scenario 3.4: Edge Case -- Jest and Vitest compatibility

```gherkin
Given the TDD SKILL.md "RED Evidence Protocol" section exists
When I read the .skip/.todo usage guidance
Then it documents both Jest syntax (it.skip, test.todo) and Vitest syntax (it.skip, it.todo)
And it notes that both runners support these markers identically
```

### Scenario 3.5: Error Path -- developer uses .only instead of .skip

```gherkin
Given the TDD SKILL.md "RED Evidence Protocol" section exists
When I read the protocol
Then it explicitly warns against using .only (which runs only one test and silently skips others)
And it specifies .skip as the only acceptable RED marker
```

---

## US-4: Pre-RED Security and Edge-Case Checklist

### Scenario 4.1: Happy Path -- checklist exists before RED phase guidance

```gherkin
Given the TDD SKILL.md at skills/engineering-team/tdd/SKILL.md exists
When I read the sections in order
Then a "Pre-RED Checklist" section appears before the RED phase section
And the checklist contains no more than 15 items
```

### Scenario 4.2: Happy Path -- checklist covers required categories

```gherkin
Given the TDD SKILL.md "Pre-RED Checklist" section exists
When I read the checklist items
Then it includes items for: trust boundaries, attacker inputs, empty/null/boundary cases, symlinks, shell injection, ReDoS, and path traversal
And each item is phrased as a yes/no question
```

### Scenario 4.3: Error Path -- tdd-reviewer verifies checklist usage

```gherkin
Given the tdd-reviewer agent definition exists
When I read its review workflow
Then it includes a step to check for edge case tests that correspond to pre-RED checklist items
And it flags when a feature touches trust boundaries but has no security-related test cases
```

### Scenario 4.4: Edge Case -- checklist references existing security material

```gherkin
Given the TDD SKILL.md "Pre-RED Checklist" section exists
When I read the references
Then it cites the security-checklist.md from skill-intake as a model
And it does not duplicate the full security-checklist content (references only)
```

### Scenario 4.5: Error Path -- checklist not applicable to pure logic

```gherkin
Given the TDD SKILL.md "Pre-RED Checklist" section exists
When I read the applicability guidance
Then it specifies which items are "always" vs "when applicable" (e.g., shell injection only applies when spawning processes)
And it states that pure transformation functions need only empty/null/boundary checks
```

---

## US-5: Edge Case Enumeration During RED Phase

### Scenario 5.1: Happy Path -- RED phase includes enumeration step

```gherkin
Given the TDD SKILL.md at skills/engineering-team/tdd/SKILL.md exists
When I read the RED phase section
Then it includes a step: after writing the primary failing test, enumerate edge cases from the pre-RED checklist
And it mandates writing .skip/.todo skeleton tests for each identified edge case
```

### Scenario 5.2: Happy Path -- skeleton tests have descriptive names

```gherkin
Given the TDD SKILL.md edge case enumeration step exists
When I read the guidance for skeleton test names
Then it requires names that document expected behavior (e.g., "rejects path with ../traversal", "returns empty array for null input")
And it prohibits generic names (e.g., "edge case 1", "handles error")
```

### Scenario 5.3: Error Path -- tdd-reviewer checks for skeleton tests

```gherkin
Given the tdd-reviewer agent definition exists
When I read its RED phase review criteria
Then it checks for the presence of .skip/.todo skeleton tests alongside the primary failing test
And it flags when the primary test has no companion edge case skeletons
```

### Scenario 5.4: Edge Case -- enumeration happens before first GREEN

```gherkin
Given the TDD SKILL.md edge case enumeration step exists
When I read the step ordering
Then it explicitly places enumeration before the GREEN phase
And it states the rationale: edge cases shape interface design before implementation locks in assumptions
```

---

## US-6: Automate Mechanical Issues Caught Twice

### Scenario 6.1: Happy Path -- escalation process documented

```gherkin
Given the process for automating mechanical issues exists in the TDD skill or review-changes command
When I read the process steps
Then it defines: (a) identify issue class from review-overrides.md, (b) determine enforcement mechanism, (c) implement within 48 hours, (d) verify automation catches the issue
And it cites L72 (scanner to pre-commit promotion) as the model pattern
```

### Scenario 6.2: Happy Path -- review-overrides.md supports occurrence counting

```gherkin
Given the review-overrides.md tracking format is documented
When I read the format specification
Then each entry includes an occurrence count field
And the format supports incrementing the count when the same issue class recurs
And it specifies that count >= 2 triggers the automation escalation process
```

### Scenario 6.3: Error Path -- enforcement mechanism selection

```gherkin
Given the escalation process documentation exists
When I read the enforcement mechanism decision tree
Then it distinguishes between: lint rule (for code pattern violations), pre-commit hook (for file-level checks), and PostToolUse hook (for workflow violations)
And each mechanism includes an example from existing infrastructure
```

### Scenario 6.4: Edge Case -- issue appears in different forms

```gherkin
Given the escalation process documentation exists
When I read the issue classification guidance
Then it addresses how to handle issues that appear in different surface forms but share the same root cause (e.g., "missing type annotation" on functions vs variables counts as one class)
```

---

## US-7: Incremental Review Enforcement Hook

### Scenario 7.1: Happy Path -- commit sets review-pending flag

```gherkin
Given the PostToolUse hook for review enforcement is registered
And no review is currently pending
When a Bash tool call completes with output containing "git commit" and exit code 0
Then the hook writes a flag to /tmp/claude-review-pending-{SSE_PORT}
```

### Scenario 7.2: Happy Path -- review clears pending flag

```gherkin
Given a review-pending flag exists at /tmp/claude-review-pending-{SSE_PORT}
When a Bash tool call completes with output containing "/review/review-changes"
Then the hook clears the flag file
And no nudge is emitted
```

### Scenario 7.3: Error Path -- nudge emitted when review is pending

```gherkin
Given a review-pending flag exists at /tmp/claude-review-pending-{SSE_PORT}
And at least 60 seconds have elapsed since the last nudge
When any tool call completes
Then the hook emits: "Review pending: run /review/review-changes --mode diff before continuing"
```

### Scenario 7.4: Edge Case -- wip: commit prefix skips review enforcement

```gherkin
Given no review is currently pending
When a Bash tool call completes with output containing 'git commit -m "wip: checkpoint"'
Then the hook does NOT set the review-pending flag
And no nudge is emitted for subsequent tool calls
```

### Scenario 7.5: Edge Case -- docs: commit prefix skips review enforcement

```gherkin
Given no review is currently pending
When a Bash tool call completes with output containing 'git commit -m "docs: update README"'
Then the hook does NOT set the review-pending flag
```

### Scenario 7.6: Error Path -- throttling prevents nudge spam

```gherkin
Given a review-pending flag exists
And a nudge was emitted 30 seconds ago
When another tool call completes
Then no nudge is emitted (throttle window is 60 seconds)
```

### Scenario 7.7: Performance -- hook completes within latency budget

```gherkin
Given the PostToolUse hook for review enforcement is registered
When any Bash tool call completes
Then the hook completes in under 100ms
```

### Scenario 7.8: Edge Case -- multiple commits without review

```gherkin
Given a review-pending flag already exists from a previous commit
When a Bash tool call completes with another "git commit" and exit code 0
Then the flag remains set (not duplicated or corrupted)
And the nudge message still references the original pending review
```

### Scenario 7.9: Happy Path -- hook registered in settings.json

```gherkin
Given the review enforcement hook script exists
When I read the settings.json registration example
Then it registers the PostToolUse hook with a timeout of 5 seconds or less
And it includes a SessionEnd hook to clean up the flag file
```

### Scenario 7.10: Error Path -- failed commit does not set flag

```gherkin
Given no review is currently pending
When a Bash tool call completes with output containing "git commit" and exit code 1 (failure)
Then the hook does NOT set the review-pending flag
```

---

## US-8: Team CLAUDE.md Ordering in Craft Pipeline (Could-Have)

### Scenario 8.1: Happy Path -- craft command enforces Team CLAUDE.md first

```gherkin
Given the craft command at commands/craft/craft.md exists
When I read the planning constraints
Then it requires: if a plan creates a new skills/{team}/ directory, the first plan step must be "Create skills/{team}/CLAUDE.md"
And the rationale references L83
```

### Scenario 8.2: Happy Path -- implementation-planner enforces the same rule

```gherkin
Given the implementation-planner agent definition exists
When I read its planning workflow
Then it includes the same ordering constraint: Team CLAUDE.md is the first artifact for new skill team directories
```

### Scenario 8.3: Error Path -- rule does not apply to existing teams

```gherkin
Given the craft command ordering rule exists
When a plan adds skills to an existing skills/{team}/ directory that already has CLAUDE.md
Then the ordering constraint does not apply
And the plan can proceed with skill creation directly
```

---

## US-9: Shared Test Exemplar Pattern (Could-Have)

### Scenario 9.1: Happy Path -- pattern documented in TDD skill

```gherkin
Given the TDD SKILL.md at skills/engineering-team/tdd/SKILL.md exists
When I read the "Shared Test Exemplar" section
Then it defines: (a) first test file in a directory is the exemplar, (b) sibling test files copy the exemplar's structure, (c) divergence requires explicit justification
```

### Scenario 9.2: Error Path -- tdd-reviewer checks sibling consistency

```gherkin
Given the tdd-reviewer agent definition exists
When I read its review criteria
Then it includes checking structural consistency across sibling test files in the same directory
And it flags when a sibling test file uses a different factory pattern or assertion style than the exemplar
```

---

## US-10: Quality Agent Example Requirements (Could-Have)

### Scenario 10.1: Happy Path -- creating-agents skill requires examples

```gherkin
Given the creating-agents SKILL.md at skills/agent-development-team/creating-agents/SKILL.md exists
When I read the requirements for type:quality agents
Then it mandates a minimum of 2 examples: at least 1 passing and 1 failing
```

### Scenario 10.2: Error Path -- agent-validator checks example count

```gherkin
Given a type:quality agent definition has only 1 example
When I run the agent-validator script against it
Then the validator reports a warning: "Quality agents require minimum 2 examples (1 pass + 1 fail)"
```

### Scenario 10.3: Edge Case -- non-quality agents are not affected

```gherkin
Given a type:implementation agent definition has 1 example
When I run the agent-validator script against it
Then no warning about example count is raised
And the agent passes validation
```

---

## Integration Scenarios

### INT-1: Walking Skeleton -- All three enforcement mechanisms work

```gherkin
Given US-1 (lint-staged type-check), US-2 (worktree push gate), and US-3 (RED evidence protocol) are implemented
When I verify each:
  - quality-gate-first SKILL.md documents tsc --noEmit in lint-staged
  - The worktree PreToolUse hook blocks unpushed-branch worktree adds (exit 2) and allows pushed-branch worktree adds (exit 0)
  - TDD SKILL.md contains the RED Evidence Protocol section with .skip/.todo guidance
Then the walking skeleton is complete: pre-commit hook enforcement, PreToolUse hook enforcement, and skill guidance updates are all proven delivery mechanisms
```

### INT-2: Hook coexistence -- new hooks do not break existing hooks

```gherkin
Given the existing hooks are registered: commit-gate-pre.sh, commit-nudge-post.sh, context-pre.sh, context-post.sh
And the new hooks are registered: worktree-push-gate-pre.sh, review-nudge-post.sh
When all PreToolUse hooks run serially on a Bash tool call
Then total hook execution time is under 600ms
And no hook interferes with another hook's cache files
```

### INT-3: TDD skill coherence -- new sections integrate with existing flow

```gherkin
Given the TDD SKILL.md has been updated with: Pre-RED Checklist, RED Evidence Protocol, edge case enumeration, and shared test exemplar
When I read the skill from top to bottom
Then the sections follow the natural TDD workflow order: Pre-RED Checklist -> RED (with evidence protocol and enumeration) -> GREEN -> REFACTOR
And no guidance contradicts existing TDD skill content
```

---

## Scenario Distribution

| Category | Count | Percentage |
|----------|-------|-----------|
| Happy Path | 19 | 43% |
| Error Path | 14 | 32% |
| Edge Case | 12 | 27% |
| Integration | 3 | -- |
| **Total (excl. integration)** | **45** | **100%** |

Error + Edge Case combined: 59% (exceeds the 40% target).

## Walking Skeleton Scenarios

Scenarios that validate the walking skeleton (US-1, US-2, US-3):

- **US-1:** 1.1, 1.2, 1.3, 1.4, 1.5
- **US-2:** 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8
- **US-3:** 3.1, 3.2, 3.3, 3.4, 3.5
- **Integration:** INT-1, INT-2

Walking skeleton is proven when all 18 walking skeleton scenarios plus INT-1 pass.
