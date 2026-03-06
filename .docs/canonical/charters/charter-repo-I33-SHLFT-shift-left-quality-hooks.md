---
type: charter
endeavor: repo
initiative: I33-SHLFT
initiative_name: shift-left-quality-hooks
status: proposed
scope_type: mixed
complexity: light
created: 2026-03-06
updated: 2026-03-06
---

# Charter: I33-SHLFT -- Shift-Left Quality Hooks

## Goal

Eliminate the 30-40% rework tax identified across L65-L84 by converting 10 retrospective findings into programmatic hooks, skill updates, and pipeline changes that shift quality checks left in the craft pipeline. Every check that can be deterministic becomes a hook (not agent-discretionary). Every check that requires judgment gets encoded as explicit skill guidance with checklists and examples.

The initiative extends the proven hook infrastructure (commit-monitor, context-management, lint-changed, prompt-injection-scanner) with new enforcement points and updates the TDD skill family to catch security, edge-case, and mechanical issues during BUILD, not during REVIEW.

## Problem

The L65-L84 retrospective identified a systemic pattern: predictable issues are caught late in the pipeline by reviewers rather than by builders or hooks. This creates a compounding rework tax:

- **Mechanical issues** (L65, L66, L70): Missing types, format violations, compilation failures after review fixes -- all caught by reviewers, fixable by automation.
- **Security and edge cases** (L68, L69, L77): Trust boundary violations, shell injection, ReDoS, empty/null handling -- all caught by reviewers, preventable by a 5-minute pre-RED checklist.
- **TDD discipline gaps** (L74): No evidence of RED phase in git history -- combined commits erase test-first discipline.
- **Pipeline enforcement gaps** (L65, L71): Incremental review after each Build commit is specified in craft.md but enforcement is agent-discretionary -- agents skip it under context pressure.
- **Worktree dispatch failures** (L75): Agents dispatch worktree agents before pushing, causing worktrees to branch from stale origin/main.

The same failure pattern (late review catching predictable issues) appeared in 2+ initiatives. Documentation-only fixes have been tried and failed -- agents skip discretionary checks under load. Hooks are guarantees; prompts are suggestions.

## Scope

### In Scope

1. **Hook enforcement** (S1, S7, X2, X3) -- Programmatic, deterministic checks that run automatically via Claude Code hooks or pre-commit hooks
2. **Skill and agent updates** (S2, S3, S4, S5, S6, X1) -- Guidance updates to tdd skill, tdd-reviewer agent, creating-agents skill, craft command, and quality-gate agents
3. **Pipeline change** (S1) -- Structural enforcement of incremental review at every Build commit

### Out of Scope

- New feature work -- this is purely pipeline improvement
- Changes to the review-changes command itself (S1 enforces running it, does not modify it)
- Project-specific lint rules for S7 (the initiative creates the process and hook infrastructure for automating mechanical issues; specific lint rules are created per-project as issues are identified)
- Modifications to Claude's built-in `/compact` command or context management
- Changes to subagent internal behavior (hooks enforce the orchestrator level)
- New agent creation -- all changes are updates to existing agents, skills, and commands
- Enforcement of X1 commit message format via Husky commit-msg hook (deferred -- start with agent-discretionary convention, measure adoption, then decide)

## Success Criteria

| # | Criterion | Measurable |
|---|-----------|-----------|
| SC-1 | `tsc --noEmit` runs as part of pre-commit via lint-staged for all `.ts` files in projects using the quality-gate-first skill | Verify lint-staged config includes type-check step |
| SC-2 | PreToolUse hook blocks `git worktree add` when local commits are not pushed to remote | Test: create unpushed commit, attempt worktree add, verify block |
| SC-3 | TDD skill documents RED evidence protocol using `.skip`/`.todo` tests with failure evidence in commit message | SKILL.md updated with protocol section |
| SC-4 | TDD skill includes pre-RED security and edge-case checklist | SKILL.md updated with checklist reference |
| SC-5 | TDD skill mandates edge case enumeration with skeleton `.skip` tests during RED phase | SKILL.md updated with enumeration step |
| SC-6 | PostToolUse hook detects `git commit` and nudges if `/review/review-changes --mode diff` has not run since last commit | Test: commit without review, verify nudge at next tool call |
| SC-7 | Craft command and implementation-planner updated to require Team CLAUDE.md as first artifact when creating a new `skills/{team}/` directory | Command and agent files updated |
| SC-8 | TDD skill includes shared test exemplar pattern guidance | SKILL.md updated with exemplar section |
| SC-9 | Creating-agents skill requires minimum 2 examples (pass + fail) for type:quality agents | SKILL.md updated with requirement |
| SC-10 | Process documented for automating mechanical issues caught twice by reviewers | Process documented in tdd skill or review-changes command |

## Source Material Analysis

All 10 items derive from the L65-L84 retrospective. Classification by enforcement mechanism:

| Item | Retro Source | Type | Enforcement | Target Artifact |
|------|-------------|------|-------------|-----------------|
| X2 | L66 | Hook-enforceable | Pre-commit (lint-staged) | quality-gate-first skill |
| X3 | L75 | Hook-enforceable | PreToolUse hook | New hook script or commit-monitor extension |
| X1 | L74 | Skill update | Agent-discretionary | tdd SKILL.md, tdd-reviewer agent |
| S2 | L68, L69, L77 | Skill update | Agent-discretionary | tdd SKILL.md (reference addition) |
| S3 | L69 | Skill update | Agent-discretionary | tdd SKILL.md |
| S7 | L65, L66, L70 | Process + hook | Mixed | tdd skill or review-changes command |
| S1 | L65, L71 | Pipeline change | PostToolUse hook | New hook script |
| S4 | L83 | Agent/command update | Agent-discretionary | craft command, implementation-planner |
| S5 | L67 | Skill update | Agent-discretionary | tdd SKILL.md (reference addition) |
| S6 | L81 | Skill update | Agent-discretionary | creating-agents SKILL.md, quality agents |

## User Stories

### US-1: Compilation Verification in Pre-Commit (Must-Have) [Walking Skeleton]

**As a** developer using the quality-gate-first skill, **I want** `tsc --noEmit` to run automatically as part of lint-staged pre-commit checks for TypeScript files, **so that** compilation failures are caught before commit rather than discovered in review fix-the-fix cycles.

**Acceptance Criteria:**
1. quality-gate-first SKILL.md documents that lint-staged config must include `tsc --noEmit` for `.ts` files
2. The skill's Phase 0 checklist includes type-check as a required lint-staged step
3. phase-0-check command (if applicable) verifies type-check is in lint-staged config
4. Documentation includes example lint-staged config snippet showing correct type-check integration

**Retro source:** X2 (L66)

### US-2: Branch Push Verification Before Worktree Dispatch (Must-Have) [Walking Skeleton]

**As a** developer dispatching work to worktree agents, **I want** a PreToolUse hook that blocks `git worktree add` when my current branch has unpushed commits, **so that** worktree agents branch from up-to-date remote state and do not miss my latest work.

**Acceptance Criteria:**
1. PreToolUse hook script exists that intercepts Bash tool calls containing `git worktree add`
2. Hook runs `git log @{push}..HEAD` (or equivalent) to detect unpushed commits
3. If unpushed commits exist, hook exits with code 2 (block) and message: "Push your branch before dispatching worktree agents. Run: git push"
4. If no unpushed commits, hook exits with code 0 (allow)
5. Hook runs in under 100ms
6. Hook is registered in settings.json (either new package or extension to commit-monitor)
7. Hook includes a test script that validates blocking and allowing behavior

**Retro source:** X3 (L75)

### US-3: RED Evidence Protocol via Disabled Tests (Must-Have) [Walking Skeleton]

**As a** TDD practitioner, **I want** the TDD skill to define a RED evidence protocol that commits `.skip`/`.todo` tests with failure evidence in the commit message, **so that** test-first discipline is visible in git history without ever breaking the build.

**Acceptance Criteria:**
1. TDD SKILL.md updated with "RED Evidence Protocol" section
2. Protocol defines the cycle: (a) write test with `.skip`/`.todo`, (b) commit with `red:` prefix and expected failure description in commit message, (c) enable test, make it pass, refactor, (d) commit on GREEN
3. tdd-reviewer agent updated to check for RED evidence in commit history when reviewing
4. Protocol explicitly states the build must never break -- `.skip`/`.todo` keeps CI green
5. Commit message format example included: `red: user login returns 401 for expired tokens`

**Retro source:** X1 (L74)

### US-4: Pre-RED Security and Edge-Case Checklist (Should-Have)

**As a** developer starting a new feature, **I want** the TDD skill to include a pre-RED security and edge-case checklist that I consult before writing my first test, **so that** I enumerate trust boundaries, attacker inputs, and boundary conditions upfront rather than having reviewers catch them later.

**Acceptance Criteria:**
1. TDD SKILL.md updated with "Pre-RED Checklist" section positioned before the RED phase guidance
2. Checklist covers: trust boundaries, attacker inputs, empty/null/boundary cases, symlinks, shell injection, ReDoS, path traversal
3. Checklist is concise (fits on one screen -- max 15 items) and actionable (each item is a yes/no question)
4. References the existing security-checklist.md from skill-intake as a model
5. tdd-reviewer agent updated to verify pre-RED checklist was consulted (check for edge case tests)

**Retro source:** S2 (L68, L69, L77)

### US-5: Edge Case Enumeration During RED Phase (Should-Have)

**As a** TDD practitioner, **I want** the TDD skill to mandate writing skeleton `.skip` tests for all identified edge cases before implementing the first GREEN, **so that** edge cases drive my design from the start rather than being discovered by reviewers.

**Acceptance Criteria:**
1. TDD SKILL.md updated in the RED phase section to include edge case enumeration step
2. Step defines: after writing the primary failing test, enumerate all edge cases from the pre-RED checklist and write `.skip`/`.todo` skeleton tests for each
3. Skeleton tests include descriptive names that document the expected behavior
4. The enumeration happens before the first GREEN -- edge cases shape the interface design
5. tdd-reviewer agent updated to check for skeleton edge case tests during RED review

**Retro source:** S3 (L69)

### US-6: Automate Mechanical Issues Caught Twice (Should-Have)

**As a** team lead, **I want** a documented process for converting any mechanical issue caught twice by reviewers into a lint rule or hook within 48 hours, **so that** human review is reserved for design judgment and never spent on predictable, automatable violations.

**Acceptance Criteria:**
1. Process documented in the TDD skill or review-changes command (location TBD based on best fit)
2. Process defines: (a) identify the issue class from review-overrides.md, (b) determine enforcement mechanism (lint rule, pre-commit hook, or PostToolUse hook), (c) implement within 48 hours, (d) verify the automation catches the issue
3. The review-overrides.md tracking format supports counting issue occurrences by class
4. L72 (scanner to pre-commit promotion) is cited as the model pattern

**Retro source:** S7 (L65, L66, L70)

### US-7: Incremental Review Enforcement Hook (Should-Have)

**As a** craft pipeline user, **I want** a PostToolUse hook that detects `git commit` and nudges me to run `/review/review-changes --mode diff` if I have not done so since the last commit, **so that** incremental review is enforced programmatically rather than relying on agent discipline.

**Acceptance Criteria:**
1. PostToolUse hook script exists that detects `git commit` in Bash tool output
2. Hook sets a "review pending" flag in cache file `/tmp/claude-review-pending-{SSE_PORT}`
3. Flag is cleared when `/review/review-changes` is detected in subsequent tool output
4. If flag is set at next tool call, hook emits a nudge: "Review pending: run /review/review-changes --mode diff before continuing"
5. Hook respects throttling (max 1 nudge per 60 seconds, consistent with existing hooks)
6. Hook ignores commits with `wip:` or `docs:` prefixes (these do not require incremental review)
7. Hook runs in under 100ms
8. Hook is registered in settings.json

**Retro source:** S1 (L65, L71)

### US-8: Team CLAUDE.md Ordering in Craft Pipeline (Could-Have)

**As an** implementation planner, **I want** the craft command and implementation-planner agent to enforce that Team CLAUDE.md is the first artifact created when an initiative introduces a new `skills/{team}/` directory, **so that** all downstream subagents have a domain brief before they start work.

**Acceptance Criteria:**
1. Craft command updated to check: if plan creates a new `skills/{team}/` directory, the first plan step must be "Create `skills/{team}/CLAUDE.md`"
2. implementation-planner agent updated with the same ordering rule
3. Rule documented with rationale referencing L83

**Retro source:** S4 (L83)

### US-9: Shared Test Exemplar Pattern (Could-Have)

**As a** TDD practitioner writing tests in a multi-file test suite, **I want** the TDD skill to document a shared test exemplar pattern where the first test file sets the template and siblings copy its structure before adding cases, **so that** sibling test files remain structurally consistent and avoid mechanical bulk replacement in review.

**Acceptance Criteria:**
1. TDD SKILL.md updated with "Shared Test Exemplar" section in references or main body
2. Pattern defines: (a) first test file in a directory is the exemplar, (b) new sibling test files copy the exemplar's structure (imports, factory pattern, describe/it nesting, assertion style), (c) divergence from exemplar requires explicit justification
3. tdd-reviewer agent updated to check structural consistency across sibling test files

**Retro source:** S5 (L67)

### US-10: Quality Agent Example Requirements (Could-Have)

**As an** agent author creating a quality-type agent, **I want** the creating-agents skill to require a minimum of 2 examples (one pass, one fail) for any type:quality agent, **so that** quality agents have concrete reference points that improve their assessment accuracy.

**Acceptance Criteria:**
1. creating-agents SKILL.md updated to require min 2 examples for type:quality agents
2. Examples must include at least 1 passing example and 1 failing example
3. agent-validator script updated to check example count for quality agents (if feasible without excessive complexity)
4. Existing quality agents audited and gaps logged as follow-on work (not in scope of this initiative to fix all existing agents)

**Retro source:** S6 (L81)

## Walking Skeleton

Stories US-1, US-2, and US-3 form the walking skeleton. They prove three distinct enforcement mechanisms end-to-end:

| Story | Mechanism | What It Proves |
|-------|-----------|---------------|
| US-1 | Pre-commit (lint-staged) config | Existing hook infrastructure can enforce compilation checks |
| US-2 | PreToolUse hook (new script) | New hook scripts can intercept and block unsafe tool calls |
| US-3 | Skill update (TDD workflow change) | Skill guidance changes propagate to agent behavior |

Together they validate that all three delivery mechanisms work before investing in the remaining 7 stories. US-1 and US-2 are the thinnest possible hooks (trivial logic, high impact). US-3 is the simplest skill update (adds a section, no structural changes).

## Delivery Order

Following the strategic assessment's recommendation (highest-impact, lowest-effort first):

| Phase | Stories | Type | Effort |
|-------|---------|------|--------|
| 1 - Walking Skeleton | US-1 (X2), US-2 (X3), US-3 (X1) | 2 hooks + 1 skill | XS-S |
| 2 - TDD Hardening | US-4 (S2), US-5 (S3) | 2 skill updates | S |
| 3 - Pipeline Enforcement | US-6 (S7), US-7 (S1) | 1 process + 1 hook | S-M |
| 4 - Guidance Updates | US-8 (S4), US-9 (S5), US-10 (S6) | 3 skill/agent updates | XS-S |

Each story is independently committable and delivers value on its own. No story depends on another story being complete (though US-4 and US-5 are more effective together).

## Total Effort Estimate

- Phase 1 (Walking Skeleton): 2-3 hours
- Phase 2 (TDD Hardening): 1-2 hours
- Phase 3 (Pipeline Enforcement): 2-3 hours
- Phase 4 (Guidance Updates): 2-3 hours
- **Total: 7-11 hours** (1-2 sessions)

## Constraints

1. **Hook latency budget:** All PreToolUse and PostToolUse hooks must complete in under 100ms. The pipeline currently has 4 PreToolUse hooks running serially; adding more must not create perceptible latency.
2. **Context consumption budget:** Hook messages consume context window. All new hooks must follow the existing throttling pattern (max 1 message per 60-120 seconds) and use `suppressOutput` for clean states.
3. **No build breakage:** The RED evidence protocol (US-3) must never result in a broken build. Tests use `.skip`/`.todo` -- the CI suite stays green at all times.
4. **Backward compatibility:** Existing hook packages (commit-monitor, context-management, lint-changed) must not be broken by new additions.
5. **Independent deliverability:** Each story must be committable and valuable on its own. No story may create a dependency that requires a later story to resolve.
6. **10-item scope lock:** The charter scopes to exactly the 10 retro items (S1-S7, X1-X3). No new items without charter amendment.

## Assumptions

1. The existing hook infrastructure (PreToolUse, PostToolUse, Stop) is stable and will not change during this initiative.
2. lint-staged can be configured to run `tsc --noEmit` without excessive performance impact on pre-commit (type-checking scoped to staged files or the project).
3. `git log @{push}..HEAD` works reliably across git versions for detecting unpushed commits.
4. Agents will follow updated skill guidance once it is encoded in SKILL.md (the existing pattern from tdd, typescript-strict, and refactoring skills shows this works).
5. The `.skip`/`.todo` test convention is supported by both Jest and Vitest (the two test runners used in consumer projects).
6. The review-overrides.md file format is stable enough to support programmatic counting of issue occurrences.

## Risks

| # | Risk | Likelihood | Impact | Mitigation |
|---|------|-----------|--------|------------|
| R1 | Hook false positives block legitimate work | Low | Medium | Each hook has an allowlist/override mechanism (proven pattern from commit-monitor). Worktree hook checks `@{push}` which is precise. |
| R2 | Hooks add cumulative latency to every tool call | Low | Low | Budget: <100ms per hook. Current 4 hooks run in <400ms total. Adding 2 keeps total under 600ms. |
| R3 | Skill updates are ignored by agents under context pressure | Medium | Low | The critical items (X2, X3, S1) are hooks, not skill guidance. Skill updates handle advisory items where partial adoption still reduces rework. |
| R4 | Scope creep beyond 10 retro items | Medium | Medium | Charter explicitly scopes to 10 items. No new items without charter amendment. Each item maps to a specific L-number. |
| R5 | RED evidence protocol (US-3) creates confusion about when to use `.skip` vs real failing tests | Low | Medium | Protocol clearly defines: `.skip` is for the RED commit only. The GREEN commit enables the test and makes it pass. Never merge with `.skip` tests. |
| R6 | `tsc --noEmit` in lint-staged is slow for large projects | Medium | Low | Scope type-check to the project (not individual files). Can use `tsc --noEmit --incremental` for speed. Quality-gate-first skill can document performance tuning. |
| R7 | Review-pending hook (US-7) is noisy during rapid TDD cycles | Medium | Low | Hook ignores `wip:` and `docs:` prefixes. Throttled to max 1 nudge per 60 seconds. PostToolUse (nudge) not PreToolUse (block). |

## References

- **Research report:** `.docs/reports/researcher-260306-shift-left-quality-hooks.md`
- **Strategic assessment:** `.docs/reports/researcher-260306-shift-left-quality-hooks-strategic-assessment.md`
- **Retrospective:** `.docs/reports/report-retro-learnings-L65-L84-20260306.md`
- **Existing hook packages:** `packages/commit-monitor/`, `packages/context-management/`, `packages/lint-changed/`, `packages/prompt-injection-scanner/`
- **TDD skill:** `skills/engineering-team/tdd/SKILL.md`
- **Quality-gate-first skill:** `skills/engineering-team/quality-gate-first/SKILL.md`
- **Creating-agents skill:** `skills/agent-development-team/creating-agents/SKILL.md`
- **Craft command:** `commands/craft/craft.md`
