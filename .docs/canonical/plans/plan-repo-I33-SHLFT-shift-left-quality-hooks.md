---
type: plan
endeavor: repo
initiative: I33-SHLFT
initiative_name: shift-left-quality-hooks
status: proposed
created: 2026-03-06
updated: 2026-03-06
scope_type: mixed
---

# Plan: I33-SHLFT -- Shift-Left Quality Hooks

**Charter:** [charter-repo-I33-SHLFT](../charters/charter-repo-I33-SHLFT-shift-left-quality-hooks.md)
**Roadmap:** [roadmap-repo-I33-SHLFT](../roadmaps/roadmap-repo-I33-SHLFT-shift-left-quality-hooks-2026.md)
**Backlog:** [backlog-repo-I33-SHLFT](../backlogs/backlog-repo-I33-SHLFT-shift-left-quality-hooks.md)
**ADRs:** I33-SHLFT-001 through I33-SHLFT-004
**Design Panel:** [assessment-repo-design-panel-I33-SHLFT](../assessments/assessment-repo-design-panel-I33-SHLFT-2026-03-06.md)

## Convention Discovery (Analog Diff)

Template package: `packages/commit-monitor/`. All new hook packages replicate this structure exactly.

**Package template checklist (from commit-monitor):**

| File | Purpose | Notes |
|---|---|---|
| `scripts/<name>-pre.sh` or `scripts/<name>-post.sh` | Hook script | Naming: `{package}-{pre\|post}.sh` |
| `tests/<name>-pre.test.sh` or `tests/<name>-post.test.sh` | Bash test suite | Uses `assert_exit` + `assert_stderr_contains` helpers |
| `install.sh` | Symlink installer | Three modes: install (default), `--check`, `--uninstall` |
| `test.sh` | Test runner | Iterates `tests/*.test.sh` |
| `claude-settings.example.json` | Hook registration | PreToolUse/PostToolUse/SessionEnd entries |
| `README.md` | Package docs | Purpose, install, config, cache format |

**Conventions extracted from commit-monitor:**

- No `set -e` in hook scripts (fail-open, ADR-003)
- `CLAUDE_CODE_SSE_PORT` for session isolation
- Cache files at `/tmp/claude-{name}-{SSE_PORT}`
- Test port: `export CLAUDE_CODE_SSE_PORT="test-{name}-$$"`
- `install.sh` uses `set -euo pipefail` (installer CAN fail hard)
- JSON parsing via bash string manipulation (grep/sed), no jq (R4)
- SessionEnd cleanup: inline `rm -f` in claude-settings.example.json

---

## Steps

### Wave 1: Walking Skeleton (B01, B02, B03, B04)

Proves all three enforcement mechanisms end-to-end. B01, B02, B03 are parallel. B04 follows B03.

---

#### Step 1 -- B01: Update quality-gate-first skill + hook latency budget + enforcement levels

**Backlog item:** B01 + Panel R1 + Panel R2
**What to build:**

1. Add "Type-Check in Pre-Commit" section to `skills/engineering-team/quality-gate-first/SKILL.md`:
   - lint-staged must include `tsc --noEmit` for `.ts`/`.tsx` files
   - Add to Phase 0 checklist as required step
   - Include example lint-staged config snippet
   - Performance note: `tsc --noEmit --incremental` for large projects
2. Add "Hook Latency Budget" section (R1):
   - Total PreToolUse hook latency must stay under 500ms
   - Total PostToolUse hook latency must stay under 500ms
   - Individual hooks target <100ms
3. Add "Hook Enforcement Levels" section (R2):
   - Level 1: Advisory nudge (PostToolUse `systemMessage`, agent can continue)
   - Level 2: Blocking gate (PreToolUse exit 2, agent cannot proceed)
   - Each new hook must declare its level in README

**Files to modify:**

- `skills/engineering-team/quality-gate-first/SKILL.md`

**Tests:** N/A (docs-only)

**Acceptance criteria:**

- [ ] Phase 0 checklist includes `tsc --noEmit` as required lint-staged step
- [ ] Example lint-staged config snippet present
- [ ] `--incremental` performance guidance included
- [ ] Hook latency budget documented (500ms per hook type)
- [ ] Hook enforcement levels documented (Level 1 nudge, Level 2 block)

**Dependencies:** None
**Execution mode:** Solo
**Agent:** `devsecops-engineer` or direct edit

---

#### Step 2 -- B02-Build: Create worktree-guard hook package (scripts + tests)

**Backlog item:** B02 (Build phase)
**What to build:**

Create `packages/worktree-guard/` following commit-monitor template:

1. `scripts/worktree-guard-pre.sh` -- PreToolUse hook:
   - Read stdin JSON, extract `tool_input.command` via bash string manipulation (no jq)
   - Fast path: if command does not contain `git worktree add`, exit 0
   - If match: run `git log @{push}..HEAD --oneline 2>/dev/null` to detect unpushed commits
   - If unpushed: exit 2 with stderr message (count + push instruction)
   - If pushed or no tracking branch: exit 0 (fail-open)
   - No `set -e`
2. `tests/worktree-guard-pre.test.sh` -- TDD: write tests FIRST:
   - Non-worktree command = exit 0
   - Worktree add with no unpushed commits = exit 0
   - Worktree add with unpushed commits = exit 2
   - No remote tracking branch = exit 0 (fail-open)
   - Block message includes push instruction
   - Malformed JSON = exit 0 (fail-open)
   - Performance: completes in <100ms
3. `test.sh` -- Test runner (copy from commit-monitor)
4. `README.md` -- Package docs (purpose, install, env vars, enforcement level: Level 2 blocker)

**Files to create:**

- `packages/worktree-guard/scripts/worktree-guard-pre.sh`
- `packages/worktree-guard/tests/worktree-guard-pre.test.sh`
- `packages/worktree-guard/test.sh`
- `packages/worktree-guard/README.md`

**Tests:** `bash packages/worktree-guard/test.sh` -- write test.sh tests first, then implement hook script

**Acceptance criteria:**

- [ ] `bash packages/worktree-guard/test.sh` passes all tests
- [ ] Hook blocks `git worktree add` when unpushed commits exist (exit 2)
- [ ] Hook allows when branch is pushed (exit 0)
- [ ] Hook allows all non-worktree commands (exit 0, fast path)
- [ ] Hook fails open on no remote tracking, malformed JSON (exit 0)
- [ ] No jq dependency -- bash string manipulation only
- [ ] Hook completes in <100ms

**Dependencies:** None
**Execution mode:** Solo
**Agent:** `devsecops-engineer`

---

#### Step 3 -- B02-Integrate: Wire worktree-guard into hook ecosystem

**Backlog item:** B02 (Integration phase)
**What to build:**

1. `install.sh` -- Symlink installer (copy commit-monitor template, update LINKS array for `worktree-guard-pre.sh`)
2. `claude-settings.example.json` -- PreToolUse registration (timeout: 2)
3. Verify coexistence: run existing hook package tests to confirm no interference

**Files to create:**

- `packages/worktree-guard/install.sh`
- `packages/worktree-guard/claude-settings.example.json`

**Tests:** `bash packages/worktree-guard/install.sh --check` reports status correctly

**Acceptance criteria:**

- [ ] `install.sh` creates symlink, `--check` reports status, `--uninstall` removes
- [ ] `claude-settings.example.json` contains valid PreToolUse registration
- [ ] Existing hook tests still pass (`bash packages/commit-monitor/test.sh`)

**Dependencies:** Step 2
**Execution mode:** Solo
**Agent:** `devsecops-engineer`

---

#### Step 4 -- B03: Add RED evidence protocol and double-loop cycle checklist to TDD skill

**Backlog item:** B03 (expanded to include double-loop cycle checklist convention)
**What to build:**

Add two connected sections to `skills/engineering-team/tdd/SKILL.md`:

**Section 1 — "RED Evidence Protocol":**

1. Define the 4-step cycle:
   - Write test with `.skip` (Jest/Vitest) or `.todo` marker
   - Commit with `red:` prefix: `red: user login returns 401 for expired tokens`
   - Enable test (remove `.skip`), make it pass, refactor
   - Commit on GREEN: `feat: implement expired token check in user login`
2. Document Jest/Vitest compatibility: `it.skip()`, `test.skip()`, `it.todo()`, `test.todo()`
3. Explicitly state: build must never break -- `.skip`/`.todo` keeps CI green
4. Warn against `.only` (restricts test suite, can mask failures)
5. State: never merge with `.skip` tests still present

**Section 2 — "Double-Loop Cycle Checklist" (outside-in TDD workflow):**

This section surfaces the existing `references/outside-in-double-loop.md` pattern into the main SKILL.md as the standard development workflow for code steps. It defines how developers plan their work before writing any code:

1. **Start with the outer test** — Take the BDD scenario (from the acceptance-designer / plan) and write it as a `.skip` acceptance test. This is the feature-level test that stays RED until all inner tests pass.
   ```ts
   it.skip('blocks worktree add when unpushed commits exist')
   ```

2. **Enumerate inner tests** — Break the feature into unit-level `.skip` tests. Each test is one RED→GREEN→REFACTOR→COMMIT cycle. This list IS the developer's task checklist. Use the pre-RED checklist (Step 6) to identify edge cases.
   ```ts
   describe('worktree-guard', () => {
     it.skip('exits 0 for non-worktree commands')        // cycle 1
     it.skip('exits 0 when branch is pushed')             // cycle 2
     it.skip('exits 2 when unpushed commits exist')       // cycle 3
     it.skip('exits 0 when no remote tracking branch')    // cycle 4
     it.skip('exits 0 on malformed JSON input')           // cycle 5
   })
   ```

3. **Work inside-out** — Unskip one inner test at a time, make it GREEN, refactor, commit. Each commit is a checkpoint. The `.skip` list tracks remaining work.

4. **Unskip outer test** — When all inner tests pass, unskip the acceptance test. It should now pass. If it doesn't, the gap reveals a missing inner test. Commit when GREEN.

5. **The `.skip` list = progress tracker** — At any point, the ratio of active:skipped tests shows exactly how far along the feature is. The engineering-lead uses this to verify progress without reading implementation code.

**Key rules:**
- The `.skip` list must exist BEFORE the first GREEN (write all skeletons upfront)
- Each `.skip` test has a descriptive name documenting expected behavior
- The outer acceptance test is the LAST test to go GREEN
- Reference `references/outside-in-double-loop.md` for the full double-loop theory

**Files to modify:**

- `skills/engineering-team/tdd/SKILL.md`

**Tests:** N/A (docs-only)

**Acceptance criteria:**

- [ ] "RED Evidence Protocol" section present in TDD SKILL.md
- [ ] 4-step cycle documented with `red:` commit prefix example
- [ ] Jest and Vitest compatibility noted
- [ ] `.only` warning included
- [ ] "Never merge with .skip" rule stated
- [ ] "Double-Loop Cycle Checklist" section present
- [ ] Documents the 5-step outside-in workflow (outer skip → enumerate inner skips → work inside-out → unskip outer → progress tracking)
- [ ] Concrete example showing outer `.skip` + inner `.skip` list
- [ ] States `.skip` list must exist before first GREEN
- [ ] States outer acceptance test is last to go GREEN
- [ ] States `.skip` list = progress tracker for engineering-lead
- [ ] References `references/outside-in-double-loop.md`
- [ ] Sections are additive (no restructuring of existing content)

**Dependencies:** None
**Execution mode:** Solo
**Agent:** `tdd-reviewer` or direct edit

---

#### Step 5 -- B04: Update tdd-reviewer agent for RED evidence and double-loop verification

**Backlog item:** B04 (expanded to include double-loop cycle checklist verification)
**What to build:**

Update `agents/tdd-reviewer.md`:

1. **RED evidence check:** Add to review checklist: "Check git history for `red:` prefix commits as evidence of test-first discipline." If no RED evidence found, note as advisory observation (not blocking).
2. **Double-loop cycle checklist verification:** Add to review checklist:
   - "Verify outer acceptance test exists as `.skip` (or is now GREEN if feature is complete)"
   - "Verify inner `.skip` tests were enumerated before first GREEN (check git history for skeleton commit)"
   - "Verify remaining `.skip` count matches expected remaining work"
   - "If outer test is GREEN but inner tests are still `.skip`, flag as anomaly (outer should be LAST to pass)"
3. Reference TDD skill's RED Evidence Protocol and Double-Loop Cycle Checklist sections

**Files to modify:**

- `agents/tdd-reviewer.md`

**Tests:** N/A (docs-only)

**Acceptance criteria:**

- [ ] tdd-reviewer.md includes RED evidence check in review workflow
- [ ] tdd-reviewer.md includes double-loop cycle checklist verification (outer test, inner enumeration, skip count, outer-last rule)
- [ ] All checks are advisory (observation), not blocking
- [ ] References TDD skill's RED Evidence Protocol and Double-Loop Cycle Checklist sections

**Dependencies:** Step 4 (B03)
**Execution mode:** Solo
**Agent:** Direct edit

---

### Wave 2: TDD Hardening (B05, B06, B07)

B05 and B06 both edit TDD SKILL.md. Per R5, assign to same agent to avoid merge conflicts. Execute B05 then B06 sequentially, then B07.

---

#### Step 6 -- B05+B06: Add pre-RED checklist and edge case enumeration to TDD skill

**Backlog item:** B05 + B06 (same agent per R5 -- both edit TDD SKILL.md)
**What to build:**

**B05 portion -- Pre-RED Checklist:**

1. Add "Pre-RED Checklist" section to `skills/engineering-team/tdd/SKILL.md`, positioned before RED phase guidance
2. Max 15 yes/no questions covering:
   - Trust boundaries (user input, network, filesystem)
   - Attacker inputs (shell injection, path traversal, ReDoS)
   - Empty/null/undefined, boundary values (0, -1, MAX_INT, empty string)
   - Symlink attacks, shell command construction
   - Regex on user input (ReDoS)
   - Network boundary concerns (timeout, retry, auth)
3. Reference `skills/agent-development-team/skill-intake/references/security-checklist.md`

**B06 portion -- Edge Case Enumeration:**

1. Update RED phase section to add enumeration step
2. After writing primary `.skip` test, enumerate all edge cases from pre-RED checklist
3. Write `.skip`/`.todo` skeleton tests with descriptive names: `it.skip('returns 400 when email is empty string')`
4. Enumeration happens before first GREEN -- edge cases shape interface design
5. Reference RED Evidence Protocol's `.skip`/`.todo` convention

**Files to modify:**

- `skills/engineering-team/tdd/SKILL.md` (two sections in one edit session)

**Tests:** N/A (docs-only)

**Acceptance criteria:**

- [ ] "Pre-RED Checklist" section present, max 15 items, yes/no format
- [ ] Covers trust boundaries, attacker inputs, empty/null/boundary, symlinks, injection, ReDoS
- [ ] References security-checklist.md
- [ ] RED phase includes edge case enumeration step
- [ ] Skeleton test naming convention documented with example
- [ ] Enumeration placed before first GREEN
- [ ] References RED Evidence Protocol `.skip`/`.todo` convention
- [ ] Fits on one screen (concise)

**Dependencies:** Step 4 (B03 -- RED Evidence Protocol must exist for B06 to reference)
**Execution mode:** Solo (same agent does both B05 and B06 sequentially)
**Agent:** `tdd-reviewer` or direct edit

---

#### Step 7 -- B07: Update tdd-reviewer for checklist and enumeration checks

**Backlog item:** B07
**What to build:**

Update `agents/tdd-reviewer.md` review workflow:

1. Check for evidence that pre-RED checklist was consulted (edge case tests exist for trust boundaries, boundary values)
2. Check for skeleton `.skip` tests present during RED phase review
3. Both checks are advisory (observations), not blocking
4. Reference new TDD skill sections

**Files to modify:**

- `agents/tdd-reviewer.md`

**Tests:** N/A (docs-only)

**Acceptance criteria:**

- [ ] tdd-reviewer.md includes checklist and enumeration verification
- [ ] Checks are advisory, not blocking
- [ ] References the new Pre-RED Checklist and Edge Case Enumeration sections

**Dependencies:** Step 6 (B05+B06)
**Execution mode:** Solo
**Agent:** Direct edit

---

### Wave 3: Pipeline Enforcement (B08, B09)

B08 and B09 are independent. Can run in parallel.

---

#### Step 8 -- B08: Document mechanical issue automation process

**Backlog item:** B08
**What to build:**

Add "Automate Recurring Issues" section to `skills/engineering-team/tdd/SKILL.md`:

1. 4-step escalation process:
   - **Identify**: Find issue class in review-overrides.md or review findings
   - **Count**: If same class caught 2+ times, qualifies for automation
   - **Determine mechanism**: lint rule, pre-commit hook, or PostToolUse hook
   - **Implement**: Create automation within 48 hours, verify it catches the issue
2. Cite L72 (scanner promoted to pre-commit) as model pattern
3. Document that review-overrides.md format supports counting by issue class

**Files to modify:**

- `skills/engineering-team/tdd/SKILL.md`

**Tests:** N/A (docs-only)

**Acceptance criteria:**

- [ ] 4-step process documented (identify, count, determine mechanism, implement)
- [ ] "Caught twice" threshold defined
- [ ] Three enforcement mechanisms listed (lint rule, pre-commit, PostToolUse)
- [ ] 48-hour SLA stated
- [ ] L72 cited as model
- [ ] review-overrides.md counting format referenced

**Dependencies:** None
**Execution mode:** Solo
**Agent:** Direct edit

---

#### Step 9 -- B09-Build: Create review-nudge hook package (scripts + tests)

**Backlog item:** B09 (Build phase) + Panel R3 + Panel R6
**What to build:**

Create `packages/review-nudge/` following commit-monitor template:

1. `scripts/review-nudge-post.sh` -- PostToolUse hook:
   - Drain stdin, inspect for commit/review signals via bash string manipulation (no jq)
   - Detect successful `git commit` in Bash tool output (not failed commits)
   - Ignore commits with `wip:` or `docs:` prefix in commit message
   - On commit detection: increment counter in `/tmp/claude-review-pending-{SSE_PORT}` (format: `count|timestamp`)
   - Detect `/review/review-changes` in tool output: clear pending flag
   - If flag set: emit nudge via `systemMessage` (throttled to `REVIEW_NUDGE_THROTTLE` seconds, default 60)
   - Quiet output (`{"suppressOutput": true}`) when no nudge needed
   - No `set -e` (fail-open)
2. `scripts/review-nudge-cleanup.sh` -- SessionEnd cleanup script (R6: dedicated script for consistency with commit-monitor pattern)
   - Removes `/tmp/claude-review-pending-{SSE_PORT}` and `/tmp/claude-review-throttle-{SSE_PORT}`
3. `tests/review-nudge-post.test.sh` -- TDD: write tests FIRST:
   - Commit detected = flag set
   - Review detected = flag cleared
   - Flag set + next tool call = nudge emitted (systemMessage format)
   - Throttling: second nudge within window = suppressed
   - `wip:` commit = flag not set
   - `docs:` commit = flag not set
   - Failed commit (non-zero exit) = flag not set
   - No commit in output = no flag change
   - Malformed JSON = exit 0 (fail-open)
   - Performance: <100ms
4. `test.sh` -- Test runner (copy from commit-monitor)
5. `README.md` -- Package docs including:
   - Purpose, install, env vars, cache format, enforcement level: Level 1 nudge
   - Context-utilization caveat (R3): "At high context utilization (>50%), prefer `/context/handoff` over `/review/review-changes`. The context-management hook will enforce this boundary."

**Files to create:**

- `packages/review-nudge/scripts/review-nudge-post.sh`
- `packages/review-nudge/scripts/review-nudge-cleanup.sh`
- `packages/review-nudge/tests/review-nudge-post.test.sh`
- `packages/review-nudge/test.sh`
- `packages/review-nudge/README.md`

**Tests:** `bash packages/review-nudge/test.sh` -- write test.sh tests first, then implement hook script

**Acceptance criteria:**

- [ ] `bash packages/review-nudge/test.sh` passes all tests
- [ ] Hook sets pending flag on successful `git commit` detection
- [ ] Hook clears flag when `/review/review-changes` detected
- [ ] Hook emits nudge when flag set (systemMessage format)
- [ ] Hook respects throttle (default 60s, configurable via `REVIEW_NUDGE_THROTTLE`)
- [ ] Hook ignores `wip:` and `docs:` commit prefixes
- [ ] Hook ignores failed commits
- [ ] Hook completes in <100ms
- [ ] No jq dependency -- bash string manipulation only
- [ ] README includes context-utilization caveat (R3)

**Dependencies:** None
**Execution mode:** Solo
**Agent:** `devsecops-engineer`

---

#### Step 10 -- B09-Integrate: Wire review-nudge into hook ecosystem

**Backlog item:** B09 (Integration phase)
**What to build:**

1. `install.sh` -- Symlink installer (template from commit-monitor, LINKS array for `review-nudge-post.sh` and `review-nudge-cleanup.sh`)
2. `claude-settings.example.json` -- PostToolUse registration (timeout: 2) + SessionEnd cleanup calling `review-nudge-cleanup.sh`
3. Verify coexistence: run existing hook package tests

**Files to create:**

- `packages/review-nudge/install.sh`
- `packages/review-nudge/claude-settings.example.json`

**Tests:** `bash packages/review-nudge/install.sh --check` reports status correctly

**Acceptance criteria:**

- [ ] `install.sh` creates symlinks for both scripts, `--check` reports, `--uninstall` removes
- [ ] `claude-settings.example.json` contains PostToolUse + SessionEnd registration
- [ ] SessionEnd calls `review-nudge-cleanup.sh` (not inline rm, per R6)
- [ ] Existing hook tests still pass

**Dependencies:** Step 9
**Execution mode:** Solo
**Agent:** `devsecops-engineer`

---

### Wave 4: Guidance Updates (B10, B11, B12)

All three can run in parallel. B11 depends on Wave 2 (TDD skill stability).

---

#### Step 11 -- B10: Update craft command, implementation-planner, and engineering-lead for pipeline orchestration

**Backlog item:** B10 (expanded to include engineering-lead double-loop dispatch protocol and code command)
**What to build:**

**B10 original — Team CLAUDE.md ordering:**

1. Update `commands/craft/craft.md` Phase 3: if plan creates a new `skills/{team}/` directory, first plan step must be "Create `skills/{team}/CLAUDE.md`"
2. Update `agents/implementation-planner.md` with same ordering rule
3. Include rationale referencing L83

**New — Engineering-lead double-loop dispatch protocol:**

4. Update `agents/engineering-lead.md` Workflow 1 (Execute Implementation Plan), step 4 (per-task dispatch):
   - After dispatching implementer, BEFORE implementer writes production code:
   - "Verify implementer has emitted a `.skip` cycle checklist: outer acceptance test + enumerated inner `.skip` tests"
   - "If code step and no `.skip` list produced, ask implementer to produce it before proceeding"
   - "Track progress by checking `.skip` → active test ratio after each commit"
   - "Outer acceptance test must be the LAST test to go GREEN — if it passes early, flag as anomaly"
   - For docs-only steps: no `.skip` list required (no TDD cycles)

**New — Code command Phase 4 dispatch:**

5. Update `commands/code/code.md` (or `commands/craft/craft.md` Phase 4 section): when dispatching engineering-lead for code steps, include the instruction that developers must produce a `.skip` cycle checklist before coding. This ensures the convention flows from craft → engineering-lead → developer.

**Files to modify:**

- `commands/craft/craft.md`
- `agents/implementation-planner.md`
- `agents/engineering-lead.md`
- `commands/code/code.md` (if separate from craft.md Phase 4)

**Tests:** N/A (docs-only)

**Acceptance criteria:**

- [ ] craft.md updated with Team CLAUDE.md ordering constraint (L83)
- [ ] implementation-planner.md updated with same rule
- [ ] engineering-lead.md Workflow 1 updated with `.skip` cycle checklist verification before coding
- [ ] engineering-lead.md states: verify `.skip` list exists, track skip→active ratio, outer-last rule
- [ ] craft.md Phase 4 or code.md updated to pass double-loop convention to engineering-lead
- [ ] Docs-only steps explicitly exempted from `.skip` requirement
- [ ] Rules are constraints, not suggestions

**Dependencies:** None
**Execution mode:** Solo
**Agent:** Direct edit

---

#### Step 12 -- B11: Add shared test exemplar pattern to TDD skill

**Backlog item:** B11
**What to build:**

1. Add "Shared Test Exemplar" section to `skills/engineering-team/tdd/SKILL.md`:
   - First test file in a directory is the exemplar
   - New sibling test files copy exemplar's structure (imports, factory pattern, describe/it nesting, assertion style)
   - Divergence from exemplar requires explicit justification
2. Update `agents/tdd-reviewer.md` to check structural consistency across sibling test files

**Files to modify:**

- `skills/engineering-team/tdd/SKILL.md`
- `agents/tdd-reviewer.md`

**Tests:** N/A (docs-only)

**Acceptance criteria:**

- [ ] TDD SKILL.md contains "Shared Test Exemplar" section
- [ ] Exemplar-sibling relationship defined
- [ ] Divergence justification rule stated
- [ ] tdd-reviewer updated to check sibling consistency

**Dependencies:** Step 6 (B05+B06 -- TDD skill must be stable after Wave 2 edits)
**Execution mode:** Solo
**Agent:** Direct edit

---

#### Step 13 -- B12: Add quality agent example requirements to creating-agents skill

**Backlog item:** B12
**What to build:**

1. Update `skills/agent-development-team/creating-agents/SKILL.md`:
   - Require minimum 2 examples (1 pass + 1 fail) for type:quality agents
2. Evaluate `skills/agent-development-team/creating-agents/scripts/validate_agent.py`:
   - If feasible (simple frontmatter parse for type + example section count), add check
   - Document decision either way
3. Audit existing quality agents, log gaps as follow-on backlog item (not fix here)

**Files to modify:**

- `skills/agent-development-team/creating-agents/SKILL.md`
- `skills/agent-development-team/creating-agents/scripts/validate_agent.py` (conditional)

**Tests:** If validator updated, run `python scripts/validate_agent.py --all --summary` to verify no regressions

**Acceptance criteria:**

- [ ] creating-agents SKILL.md requires min 2 examples for type:quality agents
- [ ] Examples must include 1 pass + 1 fail
- [ ] Validator check added if feasible (decision documented)
- [ ] Existing quality agent gaps logged as follow-on

**Dependencies:** None
**Execution mode:** Solo
**Agent:** Direct edit (skill) + `backend-engineer` (if validator update)

---

## Step-to-Backlog Mapping

| Step | Backlog | Wave | Type | Parallel with |
|---|---|---|---|---|
| 1 | B01+R1+R2 | 1 | Docs | Steps 2, 4 |
| 2 | B02 (Build) | 1 | Hook | Steps 1, 4 |
| 3 | B02 (Integrate) | 1 | Hook | -- (after Step 2) |
| 4 | B03 + double-loop cycle checklist | 1 | Docs | Steps 1, 2 |
| 5 | B04 + double-loop verification | 1 | Docs | -- (after Step 4) |
| 6 | B05+B06 | 2 | Docs | -- (after Step 4; same agent per R5) |
| 7 | B07 | 2 | Docs | -- (after Step 6) |
| 8 | B08 | 3 | Docs | Step 9 |
| 9 | B09 (Build) | 3 | Hook | Step 8 |
| 10 | B09 (Integrate) | 3 | Hook | -- (after Step 9) |
| 11 | B10 + eng-lead dispatch + code cmd | 4 | Docs | Steps 12, 13 |
| 12 | B11 | 4 | Docs | Steps 11, 13 (after Step 6) |
| 13 | B12 | 4 | Docs+Script | Steps 11, 12 |

## Dependency Graph

```
Wave 1 (parallel where marked):
  Step 1 (B01+R1+R2) ──────────────────────────────────────→ done
  Step 2 (B02 Build) ──→ Step 3 (B02 Integrate) ───────────→ done
  Step 4 (B03) ──→ Step 5 (B04) ────────────────────────────→ done

Wave 2 (after Step 4):
  Step 4 ──→ Step 6 (B05+B06) ──→ Step 7 (B07) ────────────→ done

Wave 3 (parallel, independent):
  Step 8 (B08) ─────────────────────────────────────────────→ done
  Step 9 (B09 Build) ──→ Step 10 (B09 Integrate) ──────────→ done

Wave 4 (parallel, B11 after Wave 2):
  Step 11 (B10) ────────────────────────────────────────────→ done
  Step 6 ──→ Step 12 (B11) ────────────────────────────────→ done
  Step 13 (B12) ────────────────────────────────────────────→ done
```

## Summary

| Wave | Steps | Items | Type | Est. Effort |
|---|---|---|---|---|
| 1 | 1-5 | B01+R1+R2, B02, B03, B04 | 1 hook pkg + 3 docs | 2-3h |
| 2 | 6-7 | B05+B06, B07 | 2 docs (same file) | 1-2h |
| 3 | 8-10 | B08, B09+R3+R6 | 1 hook pkg + 1 docs | 2-3h |
| 4 | 11-13 | B10, B11, B12 | 3 docs + 1 conditional script | 1-2h |
| **Total** | **13** | **12 backlog + 4 panel recs** | **2 hook pkgs, 9 doc updates** | **6-10h** |

## Execution Recommendation

- **Method:** Subagent-driven development
- **Agent:** `engineering-lead` with `subagent-driven-development` skill
- **Rationale:** 13 steps across 4 waves with clear parallelism within waves. Wave 1 has 3 parallel tracks (Steps 1, 2+3, 4+5). Wave 3 has 2 parallel tracks (Steps 8, 9+10). Wave 4 has 3 parallel tracks (Steps 11, 12, 13). Subagent dispatch maximizes throughput while respecting sequential dependencies.
- **Cost tier notes:**
  - T3 (sonnet/opus): Steps 2, 3, 9, 10 (hook packages -- bash scripting with TDD, need judgment for edge cases)
  - T2 (haiku/gemini): Steps 1, 4, 5, 6, 7, 8, 11, 12 (docs-only edits, pattern-following)
  - T3 for Step 13 only if validator update is attempted; T2 if docs-only

## Double-Loop Convention Flow

This initiative establishes the double-loop cycle checklist as a cross-cutting convention. Here is how it flows through the system:

```
craft.md Phase 4
  → dispatches engineering-lead with plan steps
    → engineering-lead reads TDD skill (double-loop cycle checklist)
    → per code step: dispatches developer agent
      → developer reads TDD skill
      → developer writes outer .skip acceptance test (from BDD scenario)
      → developer enumerates inner .skip unit tests (from pre-RED checklist)
      → developer commits skeleton (.skip list = cycle checklist)
      → engineering-lead verifies .skip list exists
      → developer works inside-out: unskip → GREEN → REFACTOR → COMMIT (per cycle)
      → engineering-lead tracks .skip→active ratio per commit
      → developer unskips outer test (last to go GREEN)
      → engineering-lead confirms outer test GREEN
    → tdd-reviewer verifies: RED evidence, .skip enumeration, outer-last rule
```

**Touchpoints updated by this initiative:**

| Component | What's added | Step |
|---|---|---|
| TDD skill (`SKILL.md`) | Double-Loop Cycle Checklist section + RED Evidence Protocol | 4 |
| tdd-reviewer agent | Double-loop verification checks (outer test, enumeration, skip count, outer-last) | 5 |
| engineering-lead agent | `.skip` list verification before coding, progress tracking via skip ratio | 11 |
| craft command (`craft.md`) | Phase 4 dispatch includes double-loop convention instruction | 11 |
| code command (`code.md`) | Same double-loop instruction for non-craft code execution | 11 |

## Unresolved Questions

None. All ambiguities resolved by charter, backlog architecture, ADRs, and design panel recommendations.
