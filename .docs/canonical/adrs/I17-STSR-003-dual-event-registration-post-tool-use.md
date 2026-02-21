---
type: adr
endeavor: repo
initiative: I17-STSR
initiative_name: skill-telemetry-sub-resources
status: proposed
created: 2026-02-21
updated: 2026-02-21
---

# ADR I17-STSR-003: Dual Event Registration for PostToolUse and PostToolUseFailure

## Status

Proposed

## Context

When a Bash tool call fails (non-zero exit, crash), Claude Code may emit a `PostToolUseFailure` event instead of or in addition to `PostToolUse`. If we only register `log-skill-activation` for `PostToolUse`, failed script executions become invisible -- no activation row, and the timing file leaks (never consumed).

Script failure rates are a key metric for identifying broken or flaky scripts. Missing them defeats the purpose of script telemetry.

## Decision

Register `log-skill-activation` for both `PostToolUse` and `PostToolUseFailure` events. The same entry point handles both event types. The `hook_event_name` field in the event JSON distinguishes them: PostToolUseFailure events produce `success: 0`. The `PostToolUseFailure` matcher is scoped to `"Bash"` since only script (Bash) failures need this treatment.

For deduplication: if both events fire for the same `tool_use_id`, the first to arrive consumes the timing file. The second finds no file and gets `duration_ms: 0`. Both produce an activation row, but only one has accurate duration. This is acceptable for analytics.

## Consequences

### Positive

1. **Complete failure tracking.** Failed scripts are captured with `success: 0` and duration, enabling failure rate analysis.
2. **Timing file cleanup.** Even if PostToolUse does not fire, PostToolUseFailure consumes the timing file, preventing leaks.
3. **Single code path.** One entry point handles both events, differing only in the `success` field derivation. No code duplication.

### Negative

1. **Potential duplicate rows.** If both PostToolUse and PostToolUseFailure fire for the same tool call, two activation rows are ingested. For analytics (counts, averages), this is a minor distortion. Acceptable given the rarity of this edge case.
2. **Additional hook registration.** One more hook entry in settings. Negligible operational cost since it only fires on Bash failures.

### Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| Single PostToolUse registration with error field parsing | PostToolUse may not fire at all on failure. Would miss failed scripts entirely and leak timing files. |
| Separate hook entry point for PostToolUseFailure | Duplicates the detection and timing logic. Same code, two files. Unnecessary maintenance burden. |
| Timer-based cleanup of orphaned timing files | Only cleans up timing files but does not capture the failure event. Misses the primary goal of tracking failed scripts. |

## References

- Charter: US-6 (PostToolUseFailure handling)
- Backlog: B13 (PostToolUseFailure registration), B17 (timing integration)
- Acceptance scenarios: S-6.1, S-6.2, S-6.3
