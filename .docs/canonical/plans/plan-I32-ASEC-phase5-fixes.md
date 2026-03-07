---
type: plan
endeavor: repo
initiative: I32-ASEC
initiative_name: artifact-security-analysis
phase: 5
status: active
created: 2026-03-07
updated: 2026-03-07
parent_plan: .docs/canonical/plans/plan-repo-I32-ASEC-artifact-security-analysis.md
roadmap: .docs/canonical/roadmaps/roadmap-repo-I32-ASEC-artifact-security-analysis-2026.md
craft_status: .docs/reports/report-repo-craft-status-I32-ASEC.md
---

# Plan: I32-ASEC Phase 5 -- Review Fixes

Addresses all findings from the Phase 5 `/review/review-changes --mode diff` validation gate. Each fix follows TDD: RED (write/update failing test) -> GREEN (minimum fix) -> REFACTOR -> COMMIT.

Source: 9-agent parallel review (2026-03-07). 5 Fix Required + 18 Suggestions (14 unique after dedup).

## Fix Summary

| # | Type | Finding | Agent(s) | Files |
|---|------|---------|----------|-------|
| R1 | Fix | `--format`/`--ignore-pattern` bounds check on `$2` | code-reviewer | both checkers |
| R2 | Fix | JSON escaping missing backslash/newline/tab | code-reviewer, security-assessor | both checkers |
| R3 | Fix | Wrapper asymmetry undocumented + untested | code-reviewer, tdd-reviewer, security-assessor | both wrappers + tests |
| R4 | Fix | `check_file` 75 lines, exceeds 30-line guidance | refactor-assessor | alignment checker |
| R5 | Fix | JSON output semantic duplication across scripts | refactor-assessor | both checkers -> shared lib |
| S1 | Suggestion | `--format` rejects unknown values | security-assessor, code-reviewer | both checkers |
| S2 | Suggestion | Taint propagation iteration cap | security-assessor, code-reviewer | taint checker |
| S3 | Suggestion | Negation stripping regex brittle | code-reviewer | alignment checker |
| S4 | Suggestion | Consolidate keyword arrays | refactor-assessor | alignment checker |
| S5 | Suggestion | `_find_alignment_checker` walks to `/` | code-reviewer, refactor-assessor | quick_validate.py |
| S6 | Suggestion | CI glob nullglob + coverage alignment | code-reviewer, phase0-assessor | repo-ci.yml |
| S7 | Suggestion | CI actions pinned to SHA | security-assessor, phase0-assessor | repo-ci.yml |
| S8 | Suggestion | Human output format test | tdd-reviewer | both test scripts |
| S9 | Suggestion | Taint chain intermediate var assertion | tdd-reviewer | taint test script |
| S10 | Suggestion | Malformed `taint-ok` negative test | tdd-reviewer | taint test script |
| S11 | Suggestion | Quiet empty-glob stderr test robustness | tdd-reviewer | alignment test script |
| S12 | Suggestion | Python3 fallback stderr warning | security-assessor, code-reviewer | both checkers |
| S13 | Suggestion | `--ignore-pattern` regex docs | security-assessor | taint checker |
| S14 | Suggestion | security-assessor responsibility precision | agent-quality-assessor | agents/security-assessor.md |

Excluded (pre-existing, out of scope for this initiative):
- lint-staged filename quoting fragility (pre-existing across all rules)
- Backlog TDD ordering note (planning artifact, retrospective only)
- Per-line grep consolidation (performance optimization, no correctness issue, within budget)

---

## Steps

Each step is one TDD cycle: test -> fix -> refactor -> commit. Steps are ordered by dependency and severity (Fix Required first, then Suggestions).

### Step R1: Argument bounds checking

**RED:** Add tests to both test scripts:
- `--format` with no value -> exit 1, stderr error message
- `--ignore-pattern` with no value (taint only) -> exit 1, stderr error message

**GREEN:** Guard `$2` access in argument parsing with `[ $# -lt 2 ]` check.

**Files:** `artifact-alignment-checker.sh`, `artifact-alignment-checker.test.sh`, `bash-taint-checker.sh`, `bash-taint-checker.test.sh`

**Status:** complete

---

### Step S1: Validate `--format` value (combines naturally with R1)

**RED:** Add tests:
- `--format xml` -> exit 1, stderr "Unsupported format"
- `--format json` -> exit 0 (existing, verify)
- No `--format` flag -> defaults to human (existing, verify)

**GREEN:** Add format validation after parsing: reject values other than `json` and `human`.

**Files:** same as R1

**Status:** complete (combined with R1)

---

### Step R2: JSON escaping in `add_finding`

**RED:** Add tests to both test scripts:
- Finding with backslash in file path -> valid JSON output
- Finding with message containing special chars -> valid JSON output

**GREEN:** Extend `sed` escaping in `add_finding` to handle backslashes (`\\`), newlines, tabs, and control characters before quoting.

**Files:** `artifact-alignment-checker.sh`, `artifact-alignment-checker.test.sh`, `bash-taint-checker.sh`, `bash-taint-checker.test.sh`

**Status:** pending

---

### Step R3: Wrapper scripts -- document asymmetry + add tests

**RED:** Create test cases for both wrappers:
- `run-alignment-check.sh` with no args -> exit 0
- `run-alignment-check.sh` with misaligned agent -> exit 0 (non-blocking)
- `run-bash-taint-check.sh` with no args -> exit 0
- `run-bash-taint-check.sh` with tainted script -> exit 1 (blocking)
- Both wrappers with missing checker -> exit 0, stderr warning

**GREEN:** Add documenting comment to `run-bash-taint-check.sh` explaining why taint blocks but alignment doesn't. Fix any test failures.

**Files:** `scripts/run-alignment-check.sh`, `scripts/run-bash-taint-check.sh`, new `scripts/run-wrapper-scripts.test.sh`

**Status:** pending

---

### Step R4: Split `check_file` into smaller functions

**RED:** Existing tests serve as the safety net. No new tests needed — this is a pure refactor after green.

**REFACTOR:** Extract from `check_file`:
1. `check_alignment` — description-vs-tools heuristic (~25 lines)
2. `check_analyzability` — script opacity scan (~20 lines)
3. `check_file` becomes orchestrator (~15 lines): validate file, parse frontmatter, dispatch to `check_alignment` + `check_analyzability`

**GREEN:** All 43 existing tests pass unchanged.

**Files:** `artifact-alignment-checker.sh`

**Status:** pending

---

### Step R5: Extract shared `findings-output.sh` library

**RED:** Existing tests serve as safety net.

**REFACTOR:** Extract to `scripts/lib/findings-output.sh`:
- `init_findings` — initialize JSON array + counters
- `add_finding` — append finding with proper escaping (from R2)
- `output_findings` — handle `--quiet`, `--format json`, human-readable (with python3 fallback)
- `get_exit_code` — return 0/1 based on Critical/High presence

Both checkers `source` the library instead of duplicating.

**GREEN:** All 43 + 31 tests pass unchanged.

**Files:** new `scripts/lib/findings-output.sh`, `artifact-alignment-checker.sh`, `bash-taint-checker.sh`

**Status:** pending

---

### Step S2: Taint propagation iteration cap

**RED:** Add test:
- Script with 20-deep taint chain -> still detects final sink, emits warning about cap

**GREEN:** Add `MAX_PROPAGATION_PASSES=10` constant. Break loop + emit stderr warning when cap reached.

**Files:** `bash-taint-checker.sh`, `bash-taint-checker.test.sh`

**Status:** pending

---

### Step S3: Fix negation stripping regex

**RED:** Add test:
- Agent with "no-code review" in description -> NOT treated as write keyword removal
- Agent with "does not create files" -> correctly stripped

**GREEN:** Tighten regex to match only exact negation phrases (`does not`, `never`, `without`) followed by a verb, not the broad `\bno [a-z]+\b` pattern.

**Files:** `artifact-alignment-checker.sh`, `artifact-alignment-checker.test.sh`

**Status:** pending

---

### Step S4: Consolidate keyword arrays

**RED:** Existing tests cover keyword matching behavior.

**REFACTOR:** Merge `keywords` and `stem_keywords` arrays into a single array in `description_has_write_keyword`. Remove the second loop.

**GREEN:** All existing tests pass.

**Files:** `artifact-alignment-checker.sh`

**Status:** pending

---

### Step S5: Fix `_find_alignment_checker` in quick_validate.py

**RED:** No new test needed — existing integration works. This is a refactor.

**REFACTOR:** Replace directory-walk approach with `REPO_ROOT`-based direct path construction, matching `validate_agent.py` pattern.

**GREEN:** Manual verification: `python3 quick_validate.py skills/engineering-team/senior-security` still finds checker.

**Files:** `skills/agent-development-team/skill-creator/scripts/quick_validate.py`

**Status:** pending

---

### Step S6: CI glob nullglob + coverage alignment

**RED:** N/A (CI config, not testable locally).

**GREEN:** Wrap glob expansion in `shopt -s nullglob` subshell in the CI taint job. Align glob patterns with lint-staged coverage (`{scripts,skills}/**/*.sh` equivalent).

**Files:** `.github/workflows/repo-ci.yml`

**Status:** pending

---

### Step S7: Pin CI actions to SHA

**RED:** N/A (CI config).

**GREEN:** Replace all `actions/checkout@v4` with pinned SHA across entire workflow (not just new jobs — fixes pre-existing issue). Pin `actions/setup-node` and any other actions.

**Files:** `.github/workflows/repo-ci.yml`

**Status:** pending

---

### Step S8: Human output format test

**RED:** Add tests to both test scripts:
- Misaligned agent in default (human) mode -> output contains severity header, file path, "findings" count
- Tainted script in default mode -> output contains severity, chain info

**GREEN:** Tests should pass against current implementation (these are missing coverage, not broken behavior). If python3 formatting path has issues, fix them.

**Files:** `artifact-alignment-checker.test.sh`, `bash-taint-checker.test.sh`

**Status:** pending

---

### Step S9: Taint chain intermediate variable assertion

**RED:** Strengthen existing chain-eval test:
- Assert output contains intermediate variable name (e.g., "processed") — not just "eval"

**GREEN:** Should pass against current implementation (taint tracker already outputs chain info). If not, fix chain output.

**Files:** `bash-taint-checker.test.sh`

**Status:** pending

---

### Step S10: Malformed `taint-ok` negative test

**RED:** Add tests:
- `#taint-ok:no-space` (no space after `#`) -> finding NOT suppressed
- `# taint-ok` (no colon) -> finding NOT suppressed

**GREEN:** Should pass against current `grep -q '# taint-ok:'` pattern. If not, tighten the pattern.

**Files:** `bash-taint-checker.test.sh`

**Status:** pending

---

### Step S11: Quiet empty-glob stderr test robustness

**RED:** Update existing empty-glob test:
- Separate stdout and stderr capture
- Assert stderr contains "No files matched"
- Assert stdout is "0" in quiet mode

**GREEN:** Fix test infrastructure to capture stderr separately if needed.

**Files:** `artifact-alignment-checker.test.sh`

**Status:** pending

---

### Step S12: Python3 fallback stderr warning

**RED:** Add tests:
- When python3 unavailable, human output includes "python3 not available" on stderr

**GREEN:** Add stderr message in the `|| ...` fallback branch.

**Files:** `artifact-alignment-checker.sh`, `bash-taint-checker.sh`, both test scripts (or the shared lib from R5)

**Status:** pending

---

### Step S13: `--ignore-pattern` regex documentation

**RED:** N/A (documentation).

**GREEN:** Add usage note in `--help` output or header comment: "`--ignore-pattern` accepts grep-compatible regular expressions, not literal strings."

**Files:** `bash-taint-checker.sh`

**Status:** pending

---

### Step S14: security-assessor responsibility precision

**RED:** N/A (agent spec).

**GREEN:** Add explicit "Out of Scope" section to `agents/security-assessor.md` body: does not implement fixes, does not replace penetration testing, does not handle compliance certification. Tighten purpose statement.

**Files:** `agents/security-assessor.md`

**Status:** pending

---

## Execution Order

Sequential, one commit per step. Steps ordered by dependency:

1. **R1 + S1** (argument bounds + format validation — natural pair, one commit)
2. **R2** (JSON escaping — foundation for R5)
3. **R5** (extract shared lib — uses R2's escaping, enables S12)
4. **R4** (split `check_file` — after R5 reduces alignment checker size)
5. **S4** (consolidate keyword arrays — while in alignment checker)
6. **S3** (negation regex — while in alignment checker)
7. **R3** (wrapper docs + tests)
8. **S2** (iteration cap)
9. **S8** (human output tests)
10. **S9** (chain variable assertion)
11. **S10** (malformed taint-ok test)
12. **S11** (stderr test robustness)
13. **S12** (python3 fallback warning — in shared lib)
14. **S5** (quick_validate.py refactor)
15. **S6** (CI glob fix)
16. **S7** (CI action pinning)
17. **S13** (ignore-pattern docs)
18. **S14** (security-assessor responsibility)

Steps 1-6 are the critical core (all Fix Required + related suggestions).
Steps 7-14 are test strengthening.
Steps 15-18 are CI/docs (low risk, no test cycle needed).

---

## Completion Criteria

- All 43 + 31 existing tests still pass
- New tests added for each fix (est. ~20 new test cases)
- Zero Fix Required findings on re-review
- Craft status updated after each commit
