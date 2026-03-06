# I33-SHLFT Phase 5 Validate — Deferred Suggestions

**Date:** 2026-03-06
**Source:** Phase 5 Final Sweep (7 parallel review agents)
**Status:** RESOLVED — all 14 items applied (12 code, 2 noted as future practice)

---

## Code Reviewer Suggestions

### S3: Add `matcher` to worktree-guard settings

**File:** `packages/worktree-guard/claude-settings.example.json`

The hook only cares about `Bash` tool calls. Adding `"matcher": "Bash"` avoids invoking the shell subprocess for non-Bash tools (Read, Write, etc.), reducing unnecessary process spawns.

### S4: Add cleanup/SessionEnd test for review-nudge

**File:** `packages/review-nudge/tests/review-nudge-post.test.sh` (or new `review-nudge-cleanup.test.sh`)

The cleanup script is trivial (4 lines) but has no test. Add a minimal test:
- Create pending + throttle files
- Run cleanup script
- Assert both files removed

### S6: Test singular/plural in nudge message

**File:** `packages/review-nudge/tests/review-nudge-post.test.sh`

The hook has pluralization logic ("1 commit" vs "2 commits"). Tests check for "commit" but do not verify singular vs plural. Add assertions:
- `pending_count=1` should contain "1 unreviewed commit" (not "commits")
- `pending_count=3` should contain "3 unreviewed commits"

---

## Refactor Assessor Suggestions

### R1: Extract JSON field extraction helpers in review-nudge-post.sh

**File:** `packages/review-nudge/scripts/review-nudge-post.sh`, lines 30-50

The `grep -o ... | sed` pattern is repeated 3 times (tool_name, command, exit_code). Extract:

```bash
json_str_field() {
  printf '%s' "$INPUT" | grep -o "\"$1\" *: *\"[^\"]*\"" | head -1 | sed 's/.*: *"//;s/"//'
}
json_int_field() {
  printf '%s' "$INPUT" | grep -o "\"$1\" *: *[0-9]*" | head -1 | sed 's/.*: *//'
}
```

### R2: Consolidate prefix-ignore pattern

**File:** `packages/review-nudge/scripts/review-nudge-post.sh`, lines 64-69

Two identical if-blocks for wip/docs. Consolidate to single regex:

```bash
IGNORE_PREFIXES="wip|docs"
if echo "$INPUT" | grep -qiE "\\-m[[:space:]]*[^a-zA-Z]*(${IGNORE_PREFIXES}):"; then
  suppress
fi
```

Makes adding new ignored prefixes a one-line change.

---

## Docs Reviewer Suggestions

### D1: Cross-reference Pre-RED Checklist and Security Checklist for File/Process Scripts

**File:** `skills/engineering-team/tdd/SKILL.md`, after line ~46

Add a brief note: "For file/process scripts specifically, also consult the Security Checklist for File/Process Scripts in the RED section below."

### D2: Anchor link for forward reference to RED Evidence Protocol

**File:** `skills/engineering-team/tdd/SKILL.md`, line ~81

Change "per the RED Evidence Protocol" to "per the [RED Evidence Protocol](#red-evidence-protocol)" so readers can jump to the definition.

### D3: Clarify hook layer context in quality-gate-first

**File:** `skills/engineering-team/quality-gate-first/SKILL.md`, Hook Latency Budget section

Add contextual note: "This section covers Claude Code agent hooks (PreToolUse/PostToolUse), which complement the git pre-commit hooks described above. Both are quality gate mechanisms but operate at different layers."

---

## Security Assessor Suggestions

### SEC-M2: Sanitize CLAUDE_CODE_SSE_PORT in file paths

**Files:** All hook scripts using `/tmp/claude-*-${CLAUDE_CODE_SSE_PORT}`

Strip non-alphanumeric characters before use:
```bash
SAFE_PORT=$(printf '%s' "${CLAUDE_CODE_SSE_PORT:-global}" | tr -cd 'a-zA-Z0-9._-')
```

Cross-cutting: affects review-nudge, worktree-guard (if it adds temp files), commit-monitor, context-management.

### SEC-M3: Validate REVIEW_NUDGE_THROTTLE as integer

**File:** `packages/review-nudge/scripts/review-nudge-post.sh`, line 19

```bash
case "$THROTTLE_SECONDS" in *[!0-9]*) THROTTLE_SECONDS=60 ;; esac
```

### SEC-M5: Use `printf` instead of `echo` for untrusted data

**File:** `packages/review-nudge/scripts/review-nudge-post.sh`, lines 31, 42, 48, 53, 60, 64, 67

Replace `echo "$INPUT" | grep` with `printf '%s\n' "$INPUT" | grep` throughout. The worktree-guard hook already uses `printf '%s'` correctly.

### SEC-L1: Use $TMPDIR instead of hardcoded /tmp

**Files:** All hook packages (review-nudge, commit-monitor, context-management)

Replace `/tmp/claude-*` with `${TMPDIR:-/tmp}/claude-*`. On macOS, `$TMPDIR` points to a per-user directory, eliminating cross-user interference. This is a cross-cutting fix across all hook packages.

---

## TDD Reviewer Suggestions

### T1: Performance test flakiness risk

**Files:**
- `packages/worktree-guard/tests/worktree-guard-pre.test.sh:201`
- `packages/review-nudge/tests/review-nudge-post.test.sh:246`

Both use a hard 100ms threshold. Consider increasing to 200ms or marking as a separate test category for CI exclusion.

### T3: Smaller commits for code portions

Future work: commit test+implementation pairs separately even within waves, to preserve TDD evidence in git history. Adopt `red:` commit prefix convention.
