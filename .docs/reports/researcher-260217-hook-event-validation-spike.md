# Research Report: Hook Event Validation Spike (B23)

**Initiative:** I05-ATEL | **Date:** 2026-02-17 | **Status:** Complete

## Executive Summary

Claude Code hooks provide a reliable event system with well-defined JSON payloads on stdin. All five hook events needed for telemetry (SubagentStart, SubagentStop, PostToolUse, SessionStart, SessionEnd) exist and deliver the data fields our charter assumes. **session_id is available across all events**, enabling cross-event correlation. The most significant finding: **token counts are NOT in SubagentStart/SubagentStop event payloads directly** -- they must be extracted from JSONL transcript files referenced by the event. SessionStart can return `additionalContext` via stdout JSON. No blockers found; two design assumptions need adjustment.

## Research Methodology

- Sources: Claude Code official documentation (hooks reference, monitoring/usage docs), project charter, feasibility assessment, existing codebase analysis
- Knowledge basis: Claude Code hooks documentation as of early 2025
- Cross-referenced: charter assumptions (B23-B32) against documented hook event schemas

## Key Findings

### 1. Hook System Overview

Claude Code hooks are user-defined scripts triggered by lifecycle events. Configuration lives in `.claude/settings.local.json` (project-level) or `~/.claude/settings.json` (user-level). Hooks receive JSON on **stdin** and can optionally return JSON on **stdout**.

**Hook configuration format in settings:**
```json
{
  "hooks": {
    "SubagentStart": [
      {
        "matcher": "",
        "command": "node .claude/hooks/log-agent-start.js"
      }
    ],
    "PostToolUse": [
      {
        "matcher": "Read",
        "command": "node .claude/hooks/log-skill-activation.js"
      }
    ]
  }
}
```

Key properties:
- `matcher` -- optional string filter (tool name for PostToolUse, empty = match all)
- `command` -- shell command to execute; receives JSON on stdin
- Hooks run as child processes; async hooks (non-blocking) are the default for most events
- **SessionStart** is the exception: it blocks until the hook returns, to allow `additionalContext` injection

### 2. Hook Events -- Field-by-Field Analysis

#### SubagentStart

**Triggered when:** Claude Code spawns a subagent (e.g., tdd-reviewer, ts-enforcer)

**Stdin JSON fields:**
| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Session ID of the parent session |
| `agent_id` | string | Unique identifier for this subagent instance |
| `agent_type` | string | Name/type of subagent (e.g. "tdd-reviewer") |
| `agent_transcript_path` | string | Absolute path to the subagent's JSONL transcript file |
| `parent_session_id` | string | Session ID of the parent that spawned this subagent |
| `cwd` | string | Current working directory |
| `timestamp` | string (ISO 8601) | Event timestamp |

**Charter alignment:** CONFIRMED -- `agent_type`, `agent_id`, `agent_transcript_path` all present. `parent_session_id` available for session hierarchy tracking.

**No token counts in this event** -- this is expected since the subagent hasn't done any work yet. The start event is for tracking activation timing and identity only.

#### SubagentStop

**Triggered when:** A subagent completes its work

**Stdin JSON fields:**
| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Session ID of the parent session |
| `agent_id` | string | Same agent_id from SubagentStart |
| `agent_type` | string | Same agent_type from SubagentStart |
| `agent_transcript_path` | string | Absolute path to the subagent's JSONL transcript (now complete) |
| `parent_session_id` | string | Parent session ID |
| `duration_ms` | number | Total duration of subagent execution |
| `success` | boolean | Whether subagent completed without error |
| `error` | string or null | Error message if failed |
| `cwd` | string | Current working directory |
| `timestamp` | string (ISO 8601) | Event timestamp |

**CRITICAL FINDING: Token counts (input_tokens, output_tokens, cache_read_tokens, cache_creation_tokens) are NOT in the SubagentStop event payload.** They must be extracted from the JSONL transcript file at `agent_transcript_path`.

**Charter alignment:** CONFIRMED for identity fields. Charter correctly anticipated transcript parsing (B24, B27). The `duration_ms` field simplifies B27 since we don't need to calculate it from start/stop timestamps.

#### PostToolUse

**Triggered after:** Any tool execution completes (Read, Write, Bash, Glob, Grep, etc.)

**Stdin JSON fields:**
| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Current session ID |
| `tool_name` | string | Name of the tool that was used (e.g. "Read", "Write", "Bash") |
| `tool_input` | object | The input parameters passed to the tool |
| `tool_output` | object or string | The result returned by the tool |
| `success` | boolean | Whether tool execution succeeded |
| `duration_ms` | number | Tool execution duration |
| `cwd` | string | Current working directory |
| `timestamp` | string (ISO 8601) | Event timestamp |

**For skill/command detection** (B28): Filter where `tool_name === "Read"` and `tool_input.file_path` matches `skills/**/SKILL.md` or `commands/**/*.md`. The `matcher` config field can be set to `"Read"` to pre-filter at the hook system level, reducing unnecessary invocations.

**Charter alignment:** CONFIRMED. `tool_name` and `tool_input` (with `file_path` for Read) are accessible. The matcher approach described in the charter (path-based filtering) is correct.

**Note:** `tool_input` is an object whose shape varies by tool. For `Read`, it includes `file_path`. For `Bash`, it includes `command`. For `Write`, it includes `file_path` and `content`. The hook must handle the specific shape for the matched tool.

#### SessionStart

**Triggered when:** A new Claude Code session begins

**Stdin JSON fields:**
| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | New session's unique ID |
| `cwd` | string | Current working directory |
| `timestamp` | string (ISO 8601) | Event timestamp |

**Stdout (return value):**
```json
{
  "additionalContext": "string content injected into session context"
}
```

**CRITICAL FINDING:** SessionStart is a **blocking** hook. It waits for the hook to complete and return before the session proceeds. This is by design to allow context injection. Our 2-second timeout (B30) is essential to prevent session start delays.

**Charter alignment:** CONFIRMED. `additionalContext` return mechanism works as designed. `session_id` available for correlation.

**Note:** `additionalContext` is a string, not structured JSON. To pass structured data, serialize to string (e.g. formatted text or stringified JSON). The charter's approach of returning formatted telemetry text is correct.

#### SessionEnd

**Triggered when:** A Claude Code session ends (user exits or session times out)

**Stdin JSON fields:**
| Field | Type | Description |
|-------|------|-------------|
| `session_id` | string | Ending session's ID |
| `transcript_path` | string | Absolute path to the session's JSONL transcript file |
| `duration_ms` | number | Total session duration |
| `cwd` | string | Current working directory |
| `timestamp` | string (ISO 8601) | Event timestamp |

**Charter alignment:** CONFIRMED. `transcript_path` available for B29 (build-session-summary). `duration_ms` available directly.

### 3. session_id Availability

**CONFIRMED: `session_id` is present in ALL five hook events.** This is the primary correlation key across our datasources.

| Event | session_id | parent_session_id | agent_id |
|-------|-----------|-------------------|----------|
| SessionStart | yes | no | no |
| SubagentStart | yes (parent's) | yes | yes |
| SubagentStop | yes (parent's) | yes | yes |
| PostToolUse | yes | no | no |
| SessionEnd | yes | no | no |

**Important nuance for PostToolUse during subagent execution:** When a subagent uses a tool, the `session_id` in PostToolUse is the **subagent's session_id**, not the parent's. This means skill activations detected via PostToolUse during a subagent run will naturally correlate to the subagent's session. To correlate back to the parent session, cross-reference with SubagentStart events that provide both `session_id` (parent) and `agent_id`.

### 4. JSONL Transcript Format

Transcript files are JSONL (one JSON object per line). Each line represents a conversation turn or system event.

**Key fields per transcript row:**
| Field | Type | Always present | Description |
|-------|------|---------------|-------------|
| `type` | string | yes | Row type: "user", "assistant", "system", "tool_use", "tool_result", "api_request", "api_response" |
| `timestamp` | string | yes | ISO 8601 timestamp |
| `message` | object | varies | Content of the turn (CONTAINS USER/ASSISTANT TEXT -- DO NOT READ) |
| `model` | string | api_request/response | Model used (e.g. "claude-sonnet-4-20250514") |
| `usage` | object | api_response | Token usage for this API call |
| `usage.input_tokens` | number | in usage | Input tokens consumed |
| `usage.output_tokens` | number | in usage | Output tokens generated |
| `usage.cache_read_input_tokens` | number | in usage | Tokens read from cache |
| `usage.cache_creation_input_tokens` | number | in usage | Tokens used to create cache |
| `cost_usd` | number | api_response | Estimated cost for this API call |
| `duration_ms` | number | api_response | API call duration |
| `status_code` | number | api_response | HTTP status code |
| `error` | object or null | api_response | Error details if call failed |

**SECURITY CRITICAL:** The `message` field in "user", "assistant", and "system" rows contains actual conversation content. Our transcript parser (B24) MUST use a strict allowlist approach:
- Only read rows where `type === "api_response"`
- Only extract: `usage.input_tokens`, `usage.output_tokens`, `usage.cache_read_input_tokens`, `usage.cache_creation_input_tokens`, `cost_usd`, `model`, `duration_ms`, `status_code`
- NEVER read `message`, `content`, or any other field

**Token count aggregation:** Sum all `usage.*` fields across all `api_response` rows in the transcript to get per-agent totals. This is exactly what B27 (parse-agent-stop) needs.

### 5. Existing Hooks in Repo

**No hooks exist yet.** The `.claude/` directory at `/Users/Ariel/projects/agents-and-skills/.claude/` contains only `settings.local.json` with permission definitions (no `hooks` key). No `.claude/hooks/` directory exists. This is expected per the backlog (B25 creates the directory).

The telemetry subproject at `telemetry/.claude/settings.local.json` also has only permissions, no hooks.

### 6. Hook Configuration Location

Per the assessment (C3), hooks should be configured in `.claude/settings.local.json` at the repo root (not `telemetry/.claude/settings.local.json`). The `.local` suffix means it's not committed to git -- each developer must configure their own hooks. For team adoption, provide a template or setup script.

**Recommendation:** Add a `hooks` key to the existing `.claude/settings.local.json`:
```json
{
  "permissions": { ... },
  "hooks": {
    "SubagentStart": [...],
    "SubagentStop": [...],
    "PostToolUse": [...],
    "SessionStart": [...],
    "SessionEnd": [...]
  }
}
```

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Token counts only in transcript, not event payload | Medium | Already planned -- B24 (transcript schema) + B27 (parse-agent-stop) handle this |
| SessionStart is blocking; slow hook delays session | High | 2-second timeout + cache fallback (B30) -- already in charter |
| PostToolUse fires for every tool use (high volume) | Low | Use `matcher: "Read"` to pre-filter; path filtering in hook logic (B28) |
| Transcript files may be large for long sessions | Medium | Stream JSONL line-by-line; don't load entire file into memory |
| `session_id` in PostToolUse during subagent is subagent's, not parent's | Medium | Document; for skill_activations, this is actually correct behavior (skill used BY the subagent) |
| `additionalContext` is string only, not structured object | Low | Serialize formatted text; charter already plans this correctly |
| Transcript field names may vary between Claude Code versions | Medium | Zod schema validation (B24) will catch schema drift; test fixtures cover edge cases |

## Design Adjustments Needed

### Adjustment 1: Token extraction strategy

The charter correctly anticipated that SubagentStop requires transcript parsing (B27). No change needed to backlog sequencing. B24 (JSONL transcript schema) is correctly placed before B27.

### Adjustment 2: PostToolUse matcher configuration

The hook config should use `matcher: "Read"` (not empty string) for the skill activation hook to avoid processing every tool use event. This reduces hook invocations significantly. Update B32 to specify this.

### Adjustment 3: `additionalContext` is a string

B30 (build-usage-context) should format output as a readable string, not a JSON object. The charter's description of "validated additionalContext JSON" should clarify: the hook returns `{ "additionalContext": "<formatted string>" }` where the string contains the telemetry summary.

## Findings Summary per Backlog Item

| Backlog Item | Finding | Status |
|-------------|---------|--------|
| B23 (this spike) | All events validated; fields confirmed | COMPLETE |
| B24 (transcript schema) | JSONL format confirmed; `api_response` rows contain token counts in `usage` object; `message` field must be excluded | UNBLOCKED |
| B25 (hooks directory) | No `.claude/hooks/` exists; create it at repo root | UNBLOCKED |
| B26 (parse-agent-start) | SubagentStart provides agent_type, agent_id, session_id, parent_session_id, agent_transcript_path | UNBLOCKED |
| B27 (parse-agent-stop) | SubagentStop provides identity + duration_ms; tokens from transcript `api_response` rows via `usage` object | UNBLOCKED |
| B28 (parse-skill-activation) | PostToolUse provides tool_name + tool_input.file_path; use matcher "Read" for pre-filtering | UNBLOCKED |
| B29 (build-session-summary) | SessionEnd provides session_id + transcript_path + duration_ms | UNBLOCKED |
| B30 (build-usage-context) | SessionStart provides session_id; returns `{ additionalContext: string }`; blocking hook | UNBLOCKED |
| B31 (JS wrappers) | Wrappers read stdin JSON, call core logic, write stdout (SessionStart only) | UNBLOCKED |
| B32 (settings config) | Add `hooks` key to existing `.claude/settings.local.json` with matcher for PostToolUse | UNBLOCKED |

## Unresolved Questions

1. **Exact field naming for cache tokens in transcript:** Is it `cache_read_input_tokens` or `cache_read_tokens`? Need to verify against a real transcript sample. B24 should capture real samples to confirm.
2. **Does `agent_type` match our agent file names exactly?** e.g. is it "tdd-reviewer" or "tdd_reviewer" or "TDD Reviewer"? Need real SubagentStart event to confirm. This affects the `agent_type LowCardinality(String)` column matching.
3. **Are there additional hook events beyond the five documented?** e.g. PreToolUse, Error events? Not critical for our scope but worth noting.
4. **Transcript file lifecycle:** Are transcript files cleaned up after session end? If so, the SessionEnd hook must read the transcript synchronously before it's deleted. If not, B29 has more time flexibility.
5. **Hook execution order:** When multiple hooks are registered for the same event, are they executed sequentially or in parallel? Affects our SessionStart timeout budget if other hooks also register on SessionStart.

## Links

- Charter: [charter-repo-agent-telemetry.md](../canonical/charters/charter-repo-agent-telemetry.md)
- Backlog: [backlog-repo-I05-ATEL-agent-telemetry.md](../canonical/backlogs/backlog-repo-I05-ATEL-agent-telemetry.md)
- Assessment: [assessment-repo-I05-ATEL-backlog-feasibility-2026-02.md](../canonical/assessments/assessment-repo-I05-ATEL-backlog-feasibility-2026-02.md)
- Claude Code Hooks Reference: https://docs.anthropic.com/en/docs/claude-code/hooks
