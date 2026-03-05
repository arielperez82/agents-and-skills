---
type: adr
endeavor: repo
initiative: I17-STSR
initiative_name: skill-telemetry-sub-resources
status: proposed
created: 2026-02-21
updated: 2026-02-21
---

# ADR I17-STSR-001: tool_use_id as the Timing Pairing Key

## Status

Proposed (pending spike B1 validation)

## Context

Script duration tracking requires pairing a PreToolUse event (start timestamp) with the corresponding PostToolUse/PostToolUseFailure event (end timestamp) for the same Bash tool call. We need a reliable key to match these events across two separate hook invocations that run in different processes.

Claude Code hook events include a `tool_use_id` field that uniquely identifies each tool invocation. This field is documented in the official hooks API but has not been validated in a live session for our pairing use case.

## Decision

Use `tool_use_id` as the sole key for matching PreToolUse to PostToolUse/PostToolUseFailure events. The PreToolUse hook writes a timing file named `<tool_use_id>.json`; the PostToolUse hook reads and deletes it by the same ID.

If the spike (B1) reveals `tool_use_id` is absent or inconsistent, fall back to command-string hashing (see Alternatives).

## Consequences

### Positive

1. **Exact 1:1 matching.** Each tool invocation gets a unique ID, so there is zero ambiguity even if the same script runs concurrently in multiple sessions.
2. **No state management.** The ID is provided by Claude Code, not generated or tracked by our hooks.
3. **Works for both PostToolUse and PostToolUseFailure.** Both event types carry the same `tool_use_id`, so failed scripts pair correctly.

### Negative

1. **Dependency on undocumented stability.** If Claude Code changes or removes `tool_use_id`, pairing breaks. Mitigated by the spike and by graceful fallback (`duration_ms: 0` when timing file is missing).
2. **Missing ID means no duration.** If `tool_use_id` is absent on a PreToolUse event, no timing file is written and duration defaults to 0. This is acceptable -- we get the activation row, just without duration.

### Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| Command-string hashing (hash of `tool_input.command`) | Collisions when the same command runs multiple times in one session. Cannot distinguish concurrent identical calls. Designated as fallback only. |
| Session-scoped counter (increment per Bash call) | Requires shared mutable state between PreToolUse and PostToolUse hooks running in separate processes. Complex and fragile. |
| In-memory map keyed by command substring | Hooks run as separate processes (one per event). No shared memory. Would require an external coordination mechanism. |

## References

- Charter: Outcome 0 (spike), Outcome 5 (script duration)
- Backlog: B1 (spike), B14-B17 (timing implementation)
- Risk gate: "After B1, before Wave 2 -- tool_use_id confirmed consistent"
