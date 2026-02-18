# Research Report: Claude Code Hooks JSON Schema Reference

**Date:** 2026-02-18
**Source:** https://docs.anthropic.com/en/docs/claude-code/hooks

---

## Executive Summary

Claude Code hooks receive JSON via stdin. All events share a set of common fields, then each event adds its own fields on top. The five events requested (SubagentStart, SubagentStop, PostToolUse, SessionStart, SessionEnd) plus every other event are fully documented below with exact field names and example payloads from the official docs.

---

## Common Input Fields (all events)

Every hook event receives these on stdin:

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf.jsonl",
  "cwd": "/home/user/my-project",
  "permission_mode": "default",
  "hook_event_name": "EventName"
}
```

| Field | Type | Description |
|---|---|---|
| `session_id` | string | Current session identifier |
| `transcript_path` | string | Path to conversation JSONL |
| `cwd` | string | Current working directory when hook invoked |
| `permission_mode` | string | `"default"`, `"plan"`, `"acceptEdits"`, `"dontAsk"`, or `"bypassPermissions"` |
| `hook_event_name` | string | Name of the event that fired |

---

## Event-Specific Schemas

### SessionStart

Fires when a session begins or resumes.

**Additional fields:** `source`, `model`, and optionally `agent_type`.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SessionStart",
  "source": "startup",
  "model": "claude-sonnet-4-6"
}
```

| Field | Type | Values | Description |
|---|---|---|---|
| `source` | string | `"startup"`, `"resume"`, `"clear"`, `"compact"` | How the session started |
| `model` | string | model ID | Model identifier |
| `agent_type` | string | agent name | Only present when started with `claude --agent <name>` |

**Matcher values:** `startup`, `resume`, `clear`, `compact`

---

### SessionEnd

Fires when a session terminates.

**Additional fields:** `reason`.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SessionEnd",
  "reason": "other"
}
```

| Field | Type | Values | Description |
|---|---|---|---|
| `reason` | string | `"clear"`, `"logout"`, `"prompt_input_exit"`, `"bypass_permissions_disabled"`, `"other"` | Why the session ended |

**Matcher values:** `clear`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other`

**Note:** No decision control. Cannot block session termination.

---

### SubagentStart

Fires when a subagent is spawned via the Task tool.

**Additional fields:** `agent_id`, `agent_type`.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SubagentStart",
  "agent_id": "agent-abc123",
  "agent_type": "Explore"
}
```

| Field | Type | Description |
|---|---|---|
| `agent_id` | string | Unique identifier for the subagent |
| `agent_type` | string | Agent name: built-in (`"Bash"`, `"Explore"`, `"Plan"`) or custom agent names from `.claude/agents/` |

**Matcher values:** `Bash`, `Explore`, `Plan`, or custom agent names

**Note:** Cannot block subagent creation. Exit code 2 just shows stderr to user.

---

### SubagentStop

Fires when a subagent finishes responding.

**Additional fields:** `stop_hook_active`, `agent_id`, `agent_type`, `agent_transcript_path`.

```json
{
  "session_id": "abc123",
  "transcript_path": "~/.claude/projects/.../abc123.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "SubagentStop",
  "stop_hook_active": false,
  "agent_id": "def456",
  "agent_type": "Explore",
  "agent_transcript_path": "~/.claude/projects/.../abc123/subagents/agent-def456.jsonl"
}
```

| Field | Type | Description |
|---|---|---|
| `stop_hook_active` | boolean | Whether already continuing due to a stop hook |
| `agent_id` | string | Unique identifier for the subagent |
| `agent_type` | string | Agent name (used for matcher filtering) |
| `agent_transcript_path` | string | Subagent's own transcript in nested `subagents/` folder |

**Matcher values:** same as SubagentStart

**Decision control:** same as Stop — exit code 2 prevents subagent from stopping.

---

### PostToolUse

Fires immediately after a tool completes successfully.

**Additional fields:** `tool_name`, `tool_input`, `tool_response`, `tool_use_id`.

```json
{
  "session_id": "abc123",
  "transcript_path": "/Users/.../.claude/projects/.../00893aaf.jsonl",
  "cwd": "/Users/...",
  "permission_mode": "default",
  "hook_event_name": "PostToolUse",
  "tool_name": "Write",
  "tool_input": {
    "file_path": "/path/to/file.txt",
    "content": "file content"
  },
  "tool_response": {
    "filePath": "/path/to/file.txt",
    "success": true
  },
  "tool_use_id": "toolu_01ABC123..."
}
```

| Field | Type | Description |
|---|---|---|
| `tool_name` | string | Name of the tool that ran |
| `tool_input` | object | Arguments sent to the tool (schema varies by tool) |
| `tool_response` | object | Result returned by the tool (schema varies by tool) |
| `tool_use_id` | string | Unique identifier for this tool call |

**Matcher values:** `Bash`, `Edit`, `Write`, `Read`, `Glob`, `Grep`, `Task`, `WebFetch`, `WebSearch`, MCP tool names (`mcp__<server>__<tool>`)

**Decision control:** Cannot block (tool already ran). Exit code 2 shows stderr to Claude as error.

---

## Other Events (for completeness)

### PreToolUse

```json
{
  "session_id": "abc123",
  "transcript_path": "...",
  "cwd": "...",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "tool_name": "Bash",
  "tool_input": { "command": "npm test" },
  "tool_use_id": "toolu_01ABC123..."
}
```

### PostToolUseFailure

```json
{
  "session_id": "abc123",
  "transcript_path": "...",
  "cwd": "...",
  "permission_mode": "default",
  "hook_event_name": "PostToolUseFailure",
  "tool_name": "Bash",
  "tool_input": { "command": "npm test", "description": "Run test suite" },
  "tool_use_id": "toolu_01ABC123...",
  "error": "Command exited with non-zero status code 1",
  "is_interrupt": false
}
```

### UserPromptSubmit

```json
{
  "session_id": "abc123",
  "transcript_path": "...",
  "cwd": "...",
  "permission_mode": "default",
  "hook_event_name": "UserPromptSubmit",
  "prompt": "Write a function to calculate the factorial of a number"
}
```

### Stop

```json
{
  "session_id": "abc123",
  "transcript_path": "...",
  "cwd": "...",
  "permission_mode": "default",
  "hook_event_name": "Stop",
  "stop_hook_active": true
}
```

### PermissionRequest

```json
{
  "session_id": "abc123",
  "transcript_path": "...",
  "cwd": "...",
  "permission_mode": "default",
  "hook_event_name": "PermissionRequest",
  "tool_name": "Bash",
  "tool_input": { "command": "rm -rf node_modules", "description": "Remove node_modules directory" },
  "permission_suggestions": [
    { "type": "toolAlwaysAllow", "tool": "Bash" }
  ]
}
```

### Notification

```json
{
  "session_id": "abc123",
  "transcript_path": "...",
  "cwd": "...",
  "permission_mode": "default",
  "hook_event_name": "Notification",
  "message": "Claude needs your permission to use Bash",
  "title": "Permission needed",
  "notification_type": "permission_prompt"
}
```

### PreCompact

```json
{
  "session_id": "abc123",
  "transcript_path": "...",
  "cwd": "...",
  "permission_mode": "default",
  "hook_event_name": "PreCompact",
  "trigger": "manual",
  "custom_instructions": ""
}
```

### TeammateIdle

```json
{
  "session_id": "abc123",
  "transcript_path": "...",
  "cwd": "...",
  "permission_mode": "default",
  "hook_event_name": "TeammateIdle",
  "teammate_name": "researcher",
  "team_name": "my-project"
}
```

### TaskCompleted

```json
{
  "session_id": "abc123",
  "transcript_path": "...",
  "cwd": "...",
  "permission_mode": "default",
  "hook_event_name": "TaskCompleted",
  "task_id": "task-001",
  "task_subject": "Implement user authentication",
  "task_description": "Add login and signup endpoints",
  "teammate_name": "implementer",
  "team_name": "my-project"
}
```

---

## Summary Table

| Event | Extra Fields |
|---|---|
| `SessionStart` | `source`, `model`, `agent_type?` |
| `SessionEnd` | `reason` |
| `UserPromptSubmit` | `prompt` |
| `PreToolUse` | `tool_name`, `tool_input`, `tool_use_id` |
| `PermissionRequest` | `tool_name`, `tool_input`, `permission_suggestions?` |
| `PostToolUse` | `tool_name`, `tool_input`, `tool_response`, `tool_use_id` |
| `PostToolUseFailure` | `tool_name`, `tool_input`, `tool_use_id`, `error`, `is_interrupt?` |
| `Notification` | `message`, `title?`, `notification_type` |
| `SubagentStart` | `agent_id`, `agent_type` |
| `SubagentStop` | `stop_hook_active`, `agent_id`, `agent_type`, `agent_transcript_path` |
| `Stop` | `stop_hook_active` |
| `TeammateIdle` | `teammate_name`, `team_name` |
| `TaskCompleted` | `task_id`, `task_subject`, `task_description?`, `teammate_name?`, `team_name?` |
| `PreCompact` | `trigger`, `custom_instructions` |

---

## Source

- https://docs.anthropic.com/en/docs/claude-code/hooks (fetched 2026-02-18)
