---
type: backlog
endeavor: repo
initiative: I33-SHLFT
initiative_name: shift-left-quality-hooks
status: proposed
created: 2026-03-06
updated: 2026-03-06
---

# Backlog: I33-SHLFT -- Shift-Left Quality Hooks

Single continuous queue of changes ordered by wave, charter outcome, and dependency. Each item is the smallest independently valuable increment. Walking skeleton items prove all three enforcement mechanisms before broader investment.

## Architecture Design

### Component Structure

The initiative produces three categories of change, each following an established codebase pattern:

1. **Hook packages** (new scripts in `packages/`) -- Programmatic enforcement via Claude Code PreToolUse/PostToolUse hooks. Two new packages: `worktree-guard` (PreToolUse blocker) and `review-nudge` (PostToolUse nudge). Each follows the commit-monitor package template exactly: `scripts/`, `tests/`, `install.sh`, `test.sh`, `claude-settings.example.json`, `README.md`.

2. **Skill updates** (edits to existing `SKILL.md` files) -- New sections added to `skills/engineering-team/tdd/SKILL.md`, `skills/engineering-team/quality-gate-first/SKILL.md`, and `skills/agent-development-team/creating-agents/SKILL.md`. No new files; sections appended to existing documents.

3. **Agent/command updates** (edits to existing `.md` files) -- Updated guidance in `agents/tdd-reviewer.md`, `commands/craft/craft.md`, and `agents/implementation-planner.md`. No new agents or commands.

### Technology Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Hook language | Bash (POSIX-compatible) | Matches all 4 existing hook packages. No runtime dependencies. Sub-100ms execution. |
| Test framework | Bash test scripts (`*.test.sh`) | Matches commit-monitor and context-management test patterns. `assert_exit` + `assert_stderr_contains` helpers. No external test runner needed. |
| Cache mechanism | `/tmp/claude-*-{SSE_PORT}` files | Proven pattern from commit-monitor and context-management. Per-session isolation via `CLAUDE_CODE_SSE_PORT`. SessionEnd cleanup. |
| Hook registration | `claude-settings.example.json` + `install.sh` symlinks | Identical to commit-monitor and context-management. Symlinks from `~/.claude/hooks/` to canonical scripts. |
| Separate packages vs extending existing | Separate packages | Each hook has a distinct concern (worktree safety vs review nudging). Separate packages are independently installable and testable. Matches the existing 1-concern-per-package pattern. |
| Skill updates: new files vs section additions | Section additions | Charter specifies updates to existing skills, not new skill creation. Adding sections keeps skills as single-document references. |

### Integration Patterns

```
                    Claude Code Agent Loop
                           |
              +------------+------------+
              |                         |
         PreToolUse                PostToolUse
              |                         |
    +---------+---------+     +---------+---------+
    |         |         |     |         |         |
 context   commit   worktree  context  commit   review
  gate      gate     guard    monitor  nudge    nudge
 (exist)  (exist)   (NEW)    (exist)  (exist)   (NEW)
```

**Data flow for worktree-guard (PreToolUse):**
1. Receives JSON on stdin: `{"tool_name": "Bash", "tool_input": {"command": "git worktree add ..."}}`
2. Extracts `tool_input.command`, checks for `git worktree add`
3. If match: runs `git log @{push}..HEAD --oneline` to check for unpushed commits
4. If unpushed: exit 2 (block) with stderr message
5. If pushed or no remote: exit 0 (allow)
6. If not a worktree command: exit 0 (allow)

**Data flow for review-nudge (PostToolUse):**
1. Receives JSON on stdin (tool result)
2. Checks if Bash tool output contains successful `git commit`
3. If commit detected: writes flag to `/tmp/claude-review-pending-{SSE_PORT}`
4. On subsequent calls: if flag exists and no `/review/review-changes` detected, emits nudge via `systemMessage`
5. Throttled to max 1 nudge per 60 seconds
6. Ignores commits with `wip:` or `docs:` prefixes

**Skill/agent updates** have no runtime integration -- they change agent behavior through prompt content at session start.

### Key Design Decisions

1. **worktree-guard is a separate package, not a commit-monitor extension.** Commit-monitor's concern is "uncommitted work risk." Worktree dispatch safety is a different concern (pushed vs unpushed). Separate packages can be installed independently.

2. **review-nudge uses PostToolUse (nudge), not PreToolUse (block).** Blocking all tool calls until review runs would halt TDD cycles. A nudge after commit gives the agent a reminder without preventing progress. This matches the charter's US-7 AC-1 specification.

3. **worktree-guard checks `tool_input.command` not just `tool_name`.** PreToolUse hooks receive both tool name and input. We need to inspect the Bash command string to detect `git worktree add` specifically, not block all Bash calls.

4. **Fail-open design for both hooks.** If git commands fail, cache is missing, or JSON parsing fails, hooks exit 0 (allow). This prevents false positives from blocking legitimate work. Matches commit-monitor's `no set -e` pattern.

5. **Skill updates are additive sections, not restructuring.** The TDD SKILL.md gets 4 new sections (RED evidence protocol, pre-RED checklist, edge case enumeration, shared test exemplar). Each is a self-contained section that can be added without moving existing content. This minimizes diff size and merge conflicts.

6. **No Husky commit-msg hook for `red:` prefix enforcement.** Charter explicitly defers this (Out of Scope). The `red:` prefix convention starts as agent-discretionary guidance in the TDD skill.

### File/Directory Structure

```
packages/
  worktree-guard/                          # NEW package (US-2)
    scripts/
      worktree-guard-pre.sh                # PreToolUse hook script
    tests/
      worktree-guard-pre.test.sh           # Bash test suite
    install.sh                             # Symlink installer
    test.sh                                # Test runner
    claude-settings.example.json           # Settings registration
    README.md                              # Package documentation

  review-nudge/                            # NEW package (US-7)
    scripts/
      review-nudge-post.sh                 # PostToolUse hook script
    tests/
      review-nudge-post.test.sh            # Bash test suite
    install.sh                             # Symlink installer
    test.sh                                # Test runner
    claude-settings.example.json           # Settings registration
    README.md                              # Package documentation

skills/engineering-team/
  tdd/
    SKILL.md                               # UPDATED: 4 new sections (US-3,4,5,9)
  quality-gate-first/
    SKILL.md                               # UPDATED: tsc lint-staged guidance (US-1)

skills/agent-development-team/
  creating-agents/
    SKILL.md                               # UPDATED: quality agent examples (US-10)

agents/
  tdd-reviewer.md                          # UPDATED: RED evidence + checklist checks (US-3,4,5,9)
  implementation-planner.md                # UPDATED: Team CLAUDE.md ordering (US-8)

commands/craft/
  craft.md                                 # UPDATED: Team CLAUDE.md ordering (US-8)
```

**No new directories beyond the two new packages.** All other changes are edits to existing files.

### Interface Contracts

**worktree-guard-pre.sh:**

| Aspect | Specification |
|---|---|
| Stdin | JSON: `{"tool_name": "<string>", "tool_input": {"command": "<string>"}}` |
| Exit 0 | Allow (not a worktree command, or branch is pushed, or no remote tracking) |
| Exit 2 | Block with stderr message |
| Stderr (on block) | `"BLOCKED: Push your branch before dispatching worktree agents.\n\nYou have N unpushed commit(s). Run:\n  git push\n\nThen retry the worktree command."` |
| Env vars | `CLAUDE_CODE_SSE_PORT` (session isolation) |
| Performance | < 100ms |
| Cache files | None (stateless -- checks git state on each call) |

**review-nudge-post.sh:**

| Aspect | Specification |
|---|---|
| Stdin | JSON (tool result -- drained, content inspected for commit/review detection) |
| Stdout (nudge) | `{"systemMessage": "Review pending: run /review/review-changes --mode diff before continuing. (N commit(s) since last review)"}` |
| Stdout (suppress) | `{"suppressOutput": true}` |
| Env vars | `CLAUDE_CODE_SSE_PORT` (session isolation), `REVIEW_NUDGE_THROTTLE` (seconds, default 60) |
| Cache files | `/tmp/claude-review-pending-{SSE_PORT}` (format: `count\|timestamp`), cleaned by SessionEnd |
| Performance | < 100ms |
| Ignored prefixes | `wip:`, `docs:` in commit messages |

**claude-settings.example.json (worktree-guard):**

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/worktree-guard-pre.sh",
            "timeout": 2
          }
        ]
      }
    ]
  }
}
```

**claude-settings.example.json (review-nudge):**

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "~/.claude/hooks/review-nudge-post.sh",
            "timeout": 2
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "rm -f /tmp/claude-review-pending-${CLAUDE_CODE_SSE_PORT:-global} /tmp/claude-review-throttle-${CLAUDE_CODE_SSE_PORT:-global}"
          }
        ]
      }
    ]
  }
}
```

### Deployment Strategy

"Deployment" in this codebase means registration in `~/.claude/settings.json` and symlinks from `~/.claude/hooks/`.

1. Each hook package has an `install.sh` that creates symlinks from `~/.claude/hooks/<script>.sh` to `packages/<pkg>/scripts/<script>.sh`.
2. Each package has a `claude-settings.example.json` showing the required settings.json entries.
3. Users merge the example JSON into their `~/.claude/settings.json` manually (same pattern as all existing packages).
4. Skill and agent updates take effect immediately -- agents load SKILL.md content at session start.

**Rollback:** Run `install.sh --uninstall` to remove symlinks. Remove the corresponding entries from `~/.claude/settings.json`. Skill/agent changes can be reverted via git.

### Observability and Monitoring

All observability is through hook stdout/stderr messages to the Claude Code agent.

| Hook | Signal Type | Message Pattern |
|---|---|---|
| worktree-guard-pre | Block (stderr) | `BLOCKED: Push your branch before dispatching worktree agents.` |
| worktree-guard-pre | Allow (silent) | No output (exit 0) |
| review-nudge-post | Nudge (systemMessage) | `Review pending: run /review/review-changes --mode diff before continuing.` |
| review-nudge-post | Quiet (suppressOutput) | `{"suppressOutput": true}` when no pending review or throttled |

**How we know it is working:**
- worktree-guard: Agents see block messages when they try `git worktree add` with unpushed commits. Absence of "worktree on stale branch" issues in retrospectives.
- review-nudge: Agents see nudge messages after commits. Review runs become more frequent. Absence of "skipped incremental review" issues in retrospectives.
- Skill updates: Agents produce RED evidence commits, enumerate edge cases before GREEN, and consult security checklist. Observable in git history (`red:` prefix commits) and review findings (fewer security/edge-case catches by reviewers).

### Operational Readiness

**Enable/disable:** Each hook is independently installable. Remove symlink + settings.json entry to disable a hook without affecting others.

**Override mechanisms:**
- worktree-guard: No threshold -- it is binary (pushed or not). Override by pushing first. Fail-open if no remote tracking branch.
- review-nudge: `REVIEW_NUDGE_THROTTLE` env var controls nudge frequency (default 60s). Set to a very high number to effectively disable.

**Throttling:**
- worktree-guard: No throttling needed (PreToolUse, only fires on `git worktree add` commands).
- review-nudge: Throttled to 1 nudge per `REVIEW_NUDGE_THROTTLE` seconds (default 60). Follows commit-monitor pattern.

**Coexistence with existing hooks:**
- PreToolUse hooks run serially. Adding worktree-guard adds one hook that exits in <100ms for non-worktree commands (fast path: check `tool_input.command` for `git worktree`, exit 0 if no match).
- PostToolUse hooks run serially. Adding review-nudge adds one hook that exits in <100ms (fast path: drain stdin, check cache file, suppress if no pending review).
- Total hook budget after this initiative: 5 PreToolUse hooks (was 4), 4 PostToolUse hooks (was 3). Well within acceptable latency.

---

## Backlog

### Legend

- **Wave**: Charter delivery phase
- **Outcome**: Roadmap outcome ID (O1-O10)
- **Deps**: Other backlog items that must complete first
- **Parallel**: Whether this item can run in parallel with other items in the same wave
- **Complexity**: XS (<30 min), S (30-60 min), M (1-2 hours)

### Wave 1: Walking Skeleton (Must-Have)

Proves all three enforcement mechanisms. No dependencies. All three items can run in parallel.

| ID | Title | Outcome | Deps | Parallel | Complexity |
|---|---|---|---|---|---|
| B01 | Update quality-gate-first skill with tsc lint-staged guidance | O1 | none | yes | XS |
| B02 | Create worktree-guard hook package | O2 | none | yes | S |
| B03 | Add RED evidence protocol to TDD skill | O3 | none | yes | S |
| B04 | Update tdd-reviewer agent for RED evidence checks | O3 | B03 | no (after B03) | XS |

#### B01: Update quality-gate-first skill with tsc lint-staged guidance

**Outcome:** O1 (Compilation check documented in quality-gate-first skill)

**What to build:**
- Add a "Type-Check in Pre-Commit" section to `skills/engineering-team/quality-gate-first/SKILL.md`
- Document that lint-staged config must include `tsc --noEmit` for `.ts` files
- Add the step to the Phase 0 checklist as a required lint-staged step
- Include example lint-staged config snippet:
  ```ts
  export default {
    '*.ts': ['tsc --noEmit', 'eslint --fix', 'prettier --write'],
    '*.tsx': ['tsc --noEmit', 'eslint --fix', 'prettier --write'],
  }
  ```
- Document performance note: use `tsc --noEmit --incremental` for large projects

**Acceptance criteria:**
1. SKILL.md Phase 0 checklist includes `tsc --noEmit` as required lint-staged step
2. Example lint-staged config snippet present showing correct integration
3. Performance tuning guidance included (`--incremental` flag)
4. Existing content not moved or restructured -- new section only

**Complexity:** XS

---

#### B02: Create worktree-guard hook package

**Outcome:** O2 (Worktree push-gate hook operational)

**What to build:**
- Create `packages/worktree-guard/` with the standard package structure:
  - `scripts/worktree-guard-pre.sh` -- PreToolUse hook that:
    - Reads stdin JSON, extracts `tool_input.command`
    - Checks if command contains `git worktree add`
    - If match: runs `git log @{push}..HEAD --oneline 2>/dev/null` to detect unpushed commits
    - If unpushed: exit 2 with descriptive stderr message
    - If pushed or no tracking branch: exit 0
    - If not a worktree command: exit 0 (fast path)
    - Fail-open on all errors (no `set -e`)
  - `tests/worktree-guard-pre.test.sh` -- Tests covering:
    - Non-worktree command = allow (exit 0)
    - Worktree command with no unpushed commits = allow (exit 0)
    - Worktree command with unpushed commits = block (exit 2)
    - Worktree command with no remote tracking = allow (exit 0, fail-open)
    - Block message includes push instruction
  - `install.sh` -- Symlink installer (template: commit-monitor/install.sh)
  - `test.sh` -- Test runner (template: commit-monitor/test.sh)
  - `claude-settings.example.json` -- PreToolUse registration
  - `README.md` -- Package documentation

**Acceptance criteria:**
1. `bash packages/worktree-guard/test.sh` passes all tests
2. Hook blocks `git worktree add` when unpushed commits exist (exit 2)
3. Hook allows `git worktree add` when branch is pushed (exit 0)
4. Hook allows all non-worktree Bash commands (exit 0, fast path)
5. Hook fails open when no remote tracking branch exists (exit 0)
6. Hook completes in <100ms (measured by test)
7. `install.sh` creates correct symlink, `--check` reports status, `--uninstall` removes
8. `claude-settings.example.json` contains valid PreToolUse registration

**Complexity:** S

---

#### B03: Add RED evidence protocol to TDD skill

**Outcome:** O3 (RED evidence protocol in TDD skill)

**What to build:**
- Add "RED Evidence Protocol" section to `skills/engineering-team/tdd/SKILL.md`
- Protocol defines the cycle:
  1. Write test with `.skip` (Jest/Vitest) or `.todo` marker
  2. Commit with `red:` prefix: `red: user login returns 401 for expired tokens`
  3. Enable test (remove `.skip`), make it pass, refactor
  4. Commit on GREEN: `feat: implement expired token check in user login`
- Document Jest/Vitest compatibility: `it.skip()`, `test.skip()`, `it.todo()`, `test.todo()`
- Explicitly state: build must never break -- `.skip`/`.todo` keeps CI green
- Warn against `.only` (restricts test suite, can mask failures)
- State: never merge with `.skip` tests still present

**Acceptance criteria:**
1. TDD SKILL.md contains "RED Evidence Protocol" section
2. Protocol documents the 4-step cycle (write skip, commit red, enable+pass, commit green)
3. `red:` commit prefix format documented with example
4. Jest and Vitest compatibility noted
5. `.only` warning included
6. "Never merge with .skip" rule stated
7. Section is self-contained and does not require restructuring existing content

**Complexity:** S

---

#### B04: Update tdd-reviewer agent for RED evidence checks

**Outcome:** O3 (RED evidence protocol in TDD skill)

**What to build:**
- Update `agents/tdd-reviewer.md` to include RED evidence checking guidance
- Add to review checklist: "Check git history for `red:` prefix commits as evidence of test-first discipline"
- Add: "If no RED evidence found in commit history, note as observation (not blocking)"

**Acceptance criteria:**
1. tdd-reviewer.md updated with RED evidence check in review workflow
2. Check is advisory (observation), not blocking
3. References the TDD skill's RED Evidence Protocol section

**Complexity:** XS

---

### Wave 2: TDD Hardening (Should-Have)

Extends TDD skill with security awareness and edge-case enumeration. Depends on Wave 1 (B03 establishes the .skip/.todo convention that B06 references). Both items can run in parallel after B03.

| ID | Title | Outcome | Deps | Parallel | Complexity |
|---|---|---|---|---|---|
| B05 | Add pre-RED security and edge-case checklist to TDD skill | O4 | B03 | yes | S |
| B06 | Add edge case enumeration step to TDD skill RED phase | O5 | B03 | yes | S |
| B07 | Update tdd-reviewer for checklist and enumeration checks | O4, O5 | B05, B06 | no (after both) | XS |

#### B05: Add pre-RED security and edge-case checklist to TDD skill

**Outcome:** O4 (Pre-RED security and edge-case checklist in TDD skill)

**What to build:**
- Add "Pre-RED Checklist" section to `skills/engineering-team/tdd/SKILL.md`, positioned before the RED phase guidance
- Checklist as yes/no questions (max 15 items), covering:
  - Does this feature accept user input? (trust boundary)
  - Could an attacker craft malicious input? (shell injection, path traversal, ReDoS)
  - What happens with empty, null, or undefined input?
  - What happens at boundary values (0, -1, MAX_INT, empty string)?
  - Does this touch the filesystem? (symlinks, path traversal)
  - Does this construct shell commands? (injection)
  - Does this use regex on user input? (ReDoS)
  - Does this cross a network boundary? (timeout, retry, auth)
- Reference `skills/agent-development-team/skill-intake/references/security-checklist.md` as a model

**Acceptance criteria:**
1. TDD SKILL.md contains "Pre-RED Checklist" section before RED phase
2. Checklist has max 15 items as yes/no questions
3. Covers: trust boundaries, attacker inputs, empty/null/boundary, symlinks, shell injection, ReDoS, path traversal
4. References security-checklist.md
5. Concise -- fits on one screen

**Complexity:** S

---

#### B06: Add edge case enumeration step to TDD skill RED phase

**Outcome:** O5 (Edge case enumeration step in RED phase)

**What to build:**
- Update the RED phase section of `skills/engineering-team/tdd/SKILL.md`
- Add enumeration step: after writing the primary failing test (`.skip`), enumerate all edge cases from the pre-RED checklist and write `.skip`/`.todo` skeleton tests for each
- Skeleton tests have descriptive names documenting expected behavior: `it.skip('returns 400 when email is empty string')`
- Enumeration happens before the first GREEN -- edge cases shape the interface design
- References the RED Evidence Protocol for the `.skip`/`.todo` convention

**Acceptance criteria:**
1. RED phase section includes edge case enumeration step
2. Step defines: enumerate edge cases, write `.skip` skeleton tests
3. Skeleton test naming convention documented with example
4. Placed before first GREEN in the workflow
5. References RED Evidence Protocol's `.skip`/`.todo` convention

**Complexity:** S

---

#### B07: Update tdd-reviewer for checklist and enumeration checks

**Outcome:** O4 + O5

**What to build:**
- Update `agents/tdd-reviewer.md` review workflow to check for:
  - Evidence that pre-RED checklist was consulted (edge case tests exist for trust boundaries, boundary values)
  - Skeleton `.skip` tests present during RED phase review
- Both checks are advisory (observations), not blocking

**Acceptance criteria:**
1. tdd-reviewer.md updated with checklist and enumeration verification
2. Checks are advisory, not blocking
3. References the new TDD skill sections

**Complexity:** XS

---

### Wave 3: Pipeline Enforcement (Should-Have)

Process documentation and the review-nudge hook. Independent of Waves 1-2 content-wise, but sequenced after them to prioritize walking skeleton and TDD hardening. Both items can run in parallel.

| ID | Title | Outcome | Deps | Parallel | Complexity |
|---|---|---|---|---|---|
| B08 | Document mechanical issue automation process | O6 | none | yes | S |
| B09 | Create review-nudge hook package | O7 | none | yes | M |

#### B08: Document mechanical issue automation process

**Outcome:** O6 (Mechanical issue automation process documented)

**What to build:**
- Add "Automate Recurring Issues" section to `skills/engineering-team/tdd/SKILL.md` (or `commands/review/review-changes.md` -- whichever reads more naturally; prefer TDD skill for proximity to the build phase)
- 4-step escalation process:
  1. **Identify**: Find the issue class in review-overrides.md (or review findings)
  2. **Count**: If same class caught 2+ times, it qualifies for automation
  3. **Determine mechanism**: lint rule, pre-commit hook, or PostToolUse hook
  4. **Implement**: Create automation within 48 hours, verify it catches the issue
- Cite L72 (scanner promoted to pre-commit) as the model pattern
- Document that review-overrides.md format supports counting by issue class

**Acceptance criteria:**
1. Process documented with 4 clear steps
2. "Caught twice" threshold defined
3. Three enforcement mechanisms listed (lint rule, pre-commit, PostToolUse)
4. 48-hour SLA stated
5. L72 cited as model
6. review-overrides.md counting format documented or referenced

**Complexity:** S

---

#### B09: Create review-nudge hook package

**Outcome:** O7 (Incremental review enforcement hook operational)

**What to build:**
- Create `packages/review-nudge/` with the standard package structure:
  - `scripts/review-nudge-post.sh` -- PostToolUse hook that:
    - Drains stdin and inspects content for commit/review signals
    - Detects successful `git commit` in Bash tool output (not failed commits)
    - Ignores commits with `wip:` or `docs:` prefix in commit message
    - On commit detection: increments counter in `/tmp/claude-review-pending-{SSE_PORT}`
    - Detects `/review/review-changes` in tool output: clears pending flag
    - If pending flag set: emits nudge via `systemMessage` (throttled)
    - Throttle: max 1 nudge per `REVIEW_NUDGE_THROTTLE` seconds (default 60)
    - Quiet output (`suppressOutput: true`) when no nudge needed
  - `tests/review-nudge-post.test.sh` -- Tests covering:
    - Commit detected = flag set
    - Review detected = flag cleared
    - Flag set + next tool call = nudge emitted
    - Throttling: second nudge within window = suppressed
    - `wip:` commit = flag not set
    - `docs:` commit = flag not set
    - Failed commit (exit code != 0) = flag not set
    - No commit in output = no flag change
  - `install.sh` -- Symlink installer
  - `test.sh` -- Test runner
  - `claude-settings.example.json` -- PostToolUse + SessionEnd registration
  - `README.md` -- Package documentation

**Acceptance criteria:**
1. `bash packages/review-nudge/test.sh` passes all tests
2. Hook sets pending flag on successful `git commit` detection
3. Hook clears flag when `/review/review-changes` detected
4. Hook emits nudge when flag is set (systemMessage format)
5. Hook respects throttle (default 60s, configurable via env var)
6. Hook ignores `wip:` and `docs:` commit prefixes
7. Hook ignores failed commits
8. Hook completes in <100ms
9. SessionEnd cleanup removes cache files
10. `install.sh` and `claude-settings.example.json` follow package template

**Complexity:** M

---

### Wave 4: Guidance Updates (Could-Have)

Three low-effort guidance updates. B10 and B11 can run in parallel. B12 can run in parallel with both. B11 depends on Wave 2 (TDD skill stability after checklist and enumeration additions).

| ID | Title | Outcome | Deps | Parallel | Complexity |
|---|---|---|---|---|---|
| B10 | Update craft command and implementation-planner for Team CLAUDE.md ordering | O8 | none | yes | XS |
| B11 | Add shared test exemplar pattern to TDD skill | O9 | B05, B06 | yes | S |
| B12 | Add quality agent example requirements to creating-agents skill | O10 | none | yes | S |

#### B10: Update craft command and implementation-planner for Team CLAUDE.md ordering

**Outcome:** O8 (Team CLAUDE.md ordering enforced in craft pipeline)

**What to build:**
- Update `commands/craft/craft.md` Phase 3 (architect/implementation-planner step): if plan creates a new `skills/{team}/` directory, the first plan step must be "Create `skills/{team}/CLAUDE.md`"
- Update `agents/implementation-planner.md` with the same ordering rule
- Include rationale referencing L83

**Acceptance criteria:**
1. craft.md updated with Team CLAUDE.md ordering constraint
2. implementation-planner.md updated with same rule
3. Rationale references L83
4. Rule is clearly stated as a constraint, not a suggestion

**Complexity:** XS

---

#### B11: Add shared test exemplar pattern to TDD skill

**Outcome:** O9 (Shared test exemplar pattern in TDD skill)

**What to build:**
- Add "Shared Test Exemplar" section to `skills/engineering-team/tdd/SKILL.md`
- Pattern defines:
  1. First test file in a directory is the exemplar
  2. New sibling test files copy the exemplar's structure (imports, factory pattern, describe/it nesting, assertion style)
  3. Divergence from exemplar requires explicit justification
- Update `agents/tdd-reviewer.md` to check structural consistency across sibling test files

**Acceptance criteria:**
1. TDD SKILL.md contains "Shared Test Exemplar" section
2. Exemplar-sibling relationship defined
3. Divergence justification rule stated
4. tdd-reviewer updated to check sibling consistency

**Complexity:** S

---

#### B12: Add quality agent example requirements to creating-agents skill

**Outcome:** O10 (Quality agent example requirements in creating-agents skill)

**What to build:**
- Update `skills/agent-development-team/creating-agents/SKILL.md` to require minimum 2 examples (1 pass + 1 fail) for type:quality agents
- Evaluate whether `skills/agent-development-team/creating-agents/scripts/validate_agent.py` can check example count for quality agents without excessive complexity; if feasible (simple frontmatter/section parse), add the check
- Audit existing quality agents and log gaps as follow-on work (not fix in this initiative)

**Acceptance criteria:**
1. creating-agents SKILL.md requires min 2 examples for type:quality agents
2. Examples must include at least 1 pass and 1 fail
3. agent-validator check added if feasible (decision documented either way)
4. Existing quality agent gaps logged as follow-on backlog item

**Complexity:** S

---

## Dependency Graph

```
Wave 1 (parallel, no blockers):
  B01 ─────────────────────────────────────────────────────────→ done
  B02 ─────────────────────────────────────────────────────────→ done
  B03 ──→ B04 ─────────────────────────────────────────────────→ done

Wave 2 (after B03):
  B03 ──→ B05 ──┐
  B03 ──→ B06 ──┼──→ B07 ─────────────────────────────────────→ done

Wave 3 (parallel, independent of Wave 1-2 content):
  B08 ─────────────────────────────────────────────────────────→ done
  B09 ─────────────────────────────────────────────────────────→ done

Wave 4 (B11 after Wave 2):
  B10 ─────────────────────────────────────────────────────────→ done
  B05+B06 ──→ B11 ─────────────────────────────────────────────→ done
  B12 ─────────────────────────────────────────────────────────→ done
```

## Summary

| Wave | Items | New Packages | Skill Updates | Agent/Cmd Updates | Total Complexity |
|---|---|---|---|---|---|
| 1 | B01-B04 | 1 (worktree-guard) | 2 (quality-gate-first, tdd) | 1 (tdd-reviewer) | ~2-3h |
| 2 | B05-B07 | 0 | 1 (tdd) | 1 (tdd-reviewer) | ~1-2h |
| 3 | B08-B09 | 1 (review-nudge) | 0-1 (tdd) | 0 | ~2-3h |
| 4 | B10-B12 | 0 | 2 (tdd, creating-agents) | 2 (craft, impl-planner) | ~2-3h |
| **Total** | **12** | **2** | **3-4 unique** | **4 unique** | **~7-11h** |
