---
type: adr
endeavor: repo
initiative: I33-SHLFT
adr_id: I33-SHLFT-003
title: Fail-open design for all hooks
status: accepted
date: 2026-03-06
supersedes: []
superseded_by: null
decision_makers:
  - Engineering Lead
---

# I33-SHLFT-003: Fail-Open Design for All Hooks

## Status

Proposed

## Context

The two new hook packages (worktree-guard and review-nudge) execute shell scripts that parse JSON from stdin, run git commands, read/write cache files, and produce structured output. Any of these operations can fail: malformed JSON input, git commands returning errors (detached HEAD, no remote, corrupted repo), missing or unwritable cache files, unexpected environment state.

The question is how hooks should behave when they encounter an error in their own logic: should they fail open (exit 0, allow the tool call) or fail closed (exit 2, block the tool call)?

This decision also applies to the four existing hook packages (commit-monitor, context-management, lint-changed, prompt-injection-scanner), which already follow a fail-open pattern. This ADR documents the principle explicitly so future hook authors follow the same convention.

## Decision

All hooks fail open. When a hook encounters an internal error (JSON parse failure, git command error, cache file missing, unexpected input), it exits 0 (allow) rather than exit 2 (block).

Specific implementation:

- No `set -e` in hook scripts (a single failing command must not abort the entire script)
- Git commands use `2>/dev/null` to suppress errors and check return codes explicitly
- JSON parsing failures result in exit 0 (treat as "not my concern")
- Missing cache files are treated as "no data" (not an error)
- Missing environment variables (`CLAUDE_CODE_SSE_PORT`) fall back to a default value

## Rationale

1. **False positives are worse than false negatives.** A false positive (hook blocks a legitimate tool call) halts the agent entirely and requires human intervention. A false negative (hook allows a call it should have blocked) results in a suboptimal workflow but does not stop work. In a development pipeline, availability beats precision.

2. **Hooks run on every tool call.** PreToolUse hooks execute before every Bash, Write, Edit, etc. A hook that fails closed on unexpected input would block the agent on every tool call until the error condition is resolved. The blast radius of a false block is the entire session.

3. **Error conditions are transient and varied.** Git state can be unusual (detached HEAD, shallow clone, submodule, bare repo). Cache files can be deleted by OS cleanup. JSON input format may change between Claude Code versions. Hooks must tolerate conditions they were not designed for.

4. **Proven pattern.** All four existing hook packages use fail-open. Commit-monitor explicitly documents "no set -e" in its README. Context-management allows all tools through when cache is missing. The pattern has survived production use across multiple initiatives.

5. **The hook's job is enforcement, not gatekeeping.** Hooks enforce specific known-bad conditions (unpushed commits, missing review). They are not security boundaries. If a hook cannot determine the condition, the safe default is to allow.

## Alternatives Considered

### Alternative 1: Fail closed (exit 2 on errors)

Hooks exit 2 (block) when they encounter an internal error, erring on the side of caution.

**Pros:**
- Guarantees that no tool call proceeds without proper verification
- Forces errors to be surfaced and fixed immediately
- Appropriate for security-critical hooks

**Cons:**
- A single malformed JSON input blocks the entire agent session
- Git edge cases (detached HEAD, no remote) would block all worktree commands
- Missing cache file would block all tool calls until the file is recreated
- Requires exhaustive error handling for every possible failure mode (infeasible for shell scripts)
- Agent sessions become fragile -- any environmental change can cause a halt
- Human intervention required to unblock (agent cannot fix hook errors)

**Why Rejected**: The blast radius is too large. Shell scripts cannot anticipate every error condition, and blocking the agent on unanticipated states creates more harm than the checks prevent.

### Alternative 2: Fail closed with bypass mechanism

Hooks fail closed but provide an environment variable (`HOOK_BYPASS=1`) that disables blocking.

**Pros:**
- Safety by default
- Escape hatch for known-broken conditions
- Operators can disable individual hooks

**Cons:**
- Bypass variable must be documented and communicated
- Agents cannot set environment variables mid-session (the bypass requires human intervention)
- If the bypass is always set (because hooks are flaky), the hooks provide no value
- Two failure modes to reason about: "is this a real block or a hook error?"
- Complexity without proportional benefit for non-security hooks

**Why Rejected**: The bypass mechanism addresses the symptom (blocked sessions) without fixing the cause (hooks that fail on unexpected input). Fail-open eliminates the problem at the source.

### Alternative 3: Mixed -- fail-open for PostToolUse, fail-closed for PreToolUse

PostToolUse hooks (advisory nudges) fail open; PreToolUse hooks (blocking gates) fail closed.

**Pros:**
- Blocking hooks are more cautious (consistent with their blocking nature)
- Advisory hooks are lenient (consistent with their advisory nature)

**Cons:**
- PreToolUse hooks still run on every tool call -- a fail-closed PreToolUse that errors on JSON parsing blocks the entire session
- Creates two different error-handling conventions across the hook ecosystem
- The specific PreToolUse hooks in this initiative (worktree-guard) only need to block on one specific condition (unpushed commits + worktree add). Blocking on every other error is disproportionate.

**Why Rejected**: The argument for fail-closed PreToolUse assumes that blocking is always the safer default for blocking hooks. In practice, the unsafe condition is specific (unpushed commits) and all other states should allow. Fail-open handles this naturally: the hook only blocks when it positively detects the unsafe condition.

## Consequences

### Positive

- Agent sessions are resilient to hook errors, environmental edge cases, and unexpected input
- Hook authors can focus on detecting the specific condition they care about rather than exhaustively handling every error
- Consistent convention across all hook packages (existing and new)
- No human intervention needed for hook errors

### Negative

- If a hook silently fails open, the condition it guards against goes unchecked for the rest of the session
- Debugging "hook did not fire" requires checking the hook's logic, not just its exit code
- There is no alerting when a hook fails open (the failure is silent by design)

### Neutral

- Future hooks that protect security boundaries (e.g., credential leak prevention) may need a different failure mode -- this ADR applies to development workflow hooks, not security controls
- Hook test suites should include error-condition tests that verify fail-open behavior

## References

- Backlog architecture section: "Fail-open design for both hooks" (key design decision 4)
- Commit-monitor README: "no set -e" pattern documentation
- Context-management hook: allows all tools through when cache is missing
- Charter R1: "Hook false positives block legitimate work" -- fail-open is the primary mitigation
