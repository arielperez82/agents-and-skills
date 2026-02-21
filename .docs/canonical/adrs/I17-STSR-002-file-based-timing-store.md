---
type: adr
endeavor: repo
initiative: I17-STSR
initiative_name: skill-telemetry-sub-resources
status: proposed
created: 2026-02-21
updated: 2026-02-21
---

# ADR I17-STSR-002: File-Based Timing Store for Script Duration

## Status

Proposed

## Context

Script duration requires persisting a start timestamp in PreToolUse and reading it in PostToolUse. These hooks run as separate Node.js processes invoked by Claude Code -- they share no memory, no long-lived server, and no database connection. The existing agent start/stop timing (`agent-timing.ts`) already solved this same problem using JSON files in `/tmp/`.

## Decision

Use a file-based timing store at `/tmp/telemetry-script-timing/`, writing one JSON file per `tool_use_id`. The implementation follows the `agent-timing.ts` pattern exactly: `recordScriptStart` writes `{ startMs }`, `consumeScriptStart` reads and deletes the file atomically, `safePath` prevents path traversal, and files older than 1 hour are treated as stale.

## Consequences

### Positive

1. **Proven pattern.** Reuses the exact architecture from `agent-timing.ts` which has been running reliably in production. No new failure modes to discover.
2. **Zero infrastructure.** No database, no IPC, no daemon process. Just filesystem operations that work everywhere.
3. **Self-cleaning.** Files are consumed (deleted) on read. Stale files are ignored after 1 hour. No accumulation over time.
4. **Sub-millisecond overhead.** A single `writeFileSync` of ~30 bytes is negligible compared to the Bash tool execution it precedes.

### Negative

1. **Not atomic across read+delete.** A race between PostToolUse and PostToolUseFailure for the same `tool_use_id` means only the first arrival gets the duration. Acceptable -- one row gets accurate duration, the other gets 0.
2. **Filesystem dependency.** If `/tmp/` is unavailable or full, timing silently fails. Duration defaults to 0. Hooks never crash on timing failures (best-effort).

### Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| In-memory store (Map in a long-lived process) | Hooks are ephemeral processes, not a server. No shared memory between PreToolUse and PostToolUse invocations. |
| SQLite database in /tmp/ | Over-engineered for storing a single integer per tool call. Adds a dependency. The file pattern already works. |
| Unix domain socket / IPC | Requires a daemon process. Dramatically increases complexity for a simple timestamp handoff. |
| Environment variables / stdout piping | Claude Code hooks communicate via stdin JSON, not env vars. No mechanism to pass data between Pre and Post hooks. |

## References

- Existing pattern: `telemetry/src/hooks/agent-timing.ts`
- Backlog: B14 (script-timing module), B16 (PreToolUse entry point), B17 (PostToolUse integration)
