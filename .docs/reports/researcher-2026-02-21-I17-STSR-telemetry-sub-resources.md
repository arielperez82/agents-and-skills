# Research Report: I17-STSR Skill Telemetry Sub-Resources

**Date:** 2026-02-21

## Executive Summary

The charter is feasible with the existing codebase patterns. The critical `tool_use_id` question is answered: it IS present in both PreToolUse and PostToolUse events per official docs and existing test fixtures. `cwd` is present in all hook events as a common field. No PreToolUse hooks exist yet in this codebase, but the pattern is straightforward given the existing DI architecture. Tinybird schema migration is the highest-risk item -- new columns require nullable/default values and cannot be renamed/removed once deployed.

## Methodology

- Read all telemetry hook entrypoints, parsers, datasource schemas, agent-timing module, and test fixtures
- Cross-referenced against prior research report (researcher-260218-claude-code-hooks-json-schema.md) documenting official Claude Code hooks API
- Analyzed existing patterns for reuse potential

## Key Findings

### 1. tool_use_id Consistency (CONFIRMED SAFE)

**Both PreToolUse and PostToolUse include `tool_use_id`.** Per official docs and the existing research report:

- PreToolUse fields: `tool_name`, `tool_input`, `tool_use_id`
- PostToolUse fields: `tool_name`, `tool_input`, `tool_response`, `tool_use_id`

The same `tool_use_id` value identifies the same tool call across both events. The existing `postToolUseSchema` in `parse-skill-activation.ts` already declares `tool_use_id: z.string().optional()` -- it is optional in the Zod schema but documented as always-present in the API. For the PreToolUse hook, treat it as required (`z.string()`); if it is ever absent, skip timing silently.

Test fixtures already use realistic values like `'toolu_01ABC123'` and `'toolu_01ABC'`.

### 2. cwd Availability (CONFIRMED SAFE)

`cwd` is a **common field on ALL hook events** per official docs. The `subagentStartSchema` in `parse-agent-start.ts` already declares `cwd: z.string()` (required). The `postToolUseSchema` in `parse-skill-activation.ts` declares it as `z.string().optional()` -- conservative but cwd is always present. Project name extraction via `path.basename(cwd)` is trivially safe.

### 3. Existing Patterns to Reuse

**Agent timing pattern** (`agent-timing.ts`): File-based `/tmp/` store with write-then-consume semantics. Records `{ startMs }` keyed by agent ID. Includes path traversal protection via `safePath()`. Script timing should follow this exact pattern:
- New dir: `/tmp/telemetry-script-timing/`
- Key: `<tool_use_id>.json`
- Content: `{ startMs: number }`
- Functions: `recordScriptStart(toolUseId, startMs)`, `consumeScriptStart(toolUseId)`

**Entrypoint DI pattern** (`log-skill-activation.ts`): All entrypoints accept a `deps` object with `client`, `clock`, `timing`, `health`. New PreToolUse entrypoint should follow this pattern. The `runLogSkillActivation` function demonstrates the fast-path exit pattern for non-matching events.

**Fast-path guard** (`isSkillOrCommandPath`): Current guard in `log-skill-activation.ts` does a quick string-level check before full parsing. The PreToolUse hook needs an equivalent: check if `tool_name === 'Bash'` and if `tool_input.command` contains `/skills/` before doing regex work.

### 4. No Existing PreToolUse Hooks

Zero PreToolUse hooks exist in this codebase. The hooks config in `.claude/settings.local.json` has `"hooks": {}`. This means:
- A new hook registration is needed (likely in a project-level `.claude/settings.json` or the user's global settings)
- The hook JS entry file goes to `.claude/hooks/log-script-start.js` per the charter
- The compiled entrypoint lives at `telemetry/src/hooks/entrypoints/log-script-start.ts`

### 5. Tinybird Schema Migration Risks

**Current `skill_activations` schema** has 7 columns: `timestamp`, `session_id`, `skill_name`, `entity_type`, `agent_type`, `duration_ms`, `success`.

Charter adds 3 columns: `parent_skill`, `resource_path`, `project_name`. All three datasources need `project_name`.

**Constraints:**
- Tinybird append-only: can add columns, cannot remove/rename
- New columns MUST have defaults or be nullable (existing rows won't have values)
- `parent_skill` should be `nullable()` (null for top-level skills/commands)
- `resource_path` should default to empty string `''`
- `project_name` should default to empty string `''` (not nullable, per charter AC)
- `SkillActivationRow` type changes propagate to ALL callers (`parseSkillActivation`, `log-skill-activation`, tests)

**Migration approach:** Add columns with `.nullable()` or `.default('')` in the Tinybird SDK schema definition. Run `tinybird deploy` to push schema changes. Existing rows get default values automatically. Test with `tinybird build` against Tinybird Local first.

### 6. Detection Logic Changes

`parseSkillActivation` currently:
- Only processes `tool_name === 'Read'` (line 59)
- Only matches SKILL.md and commands/*.md paths

Needs to handle:
- `tool_name === 'Read'` with `/skills/**/references/*.md` paths -> `entity_type: 'reference'`
- `tool_name === 'Bash'` with `/skills/**/scripts/*.(py|sh)` in `tool_input.command` -> `entity_type: 'script'`

The `tool_name === 'Read'` guard must be relaxed to also accept `'Bash'`. The `extractSkillInfo` function needs new regex patterns and a new return shape (adding `parent_skill` and `resource_path`).

### 7. PreToolUse Latency Impact

PreToolUse hooks run **before** the tool executes. Claude Code waits for the hook to complete (or timeout). Critical constraints:
- Hook must exit in <50ms for non-matching commands
- For matching commands: one `fs.mkdirSync` + one `fs.writeFileSync` (~1-2ms)
- No network I/O (no Tinybird ingest) -- only local file write
- Fast-path: check `tool_name !== 'Bash'` first (single string compare), then check if command contains `/skills/` substring before regex

The agent-timing `recordAgentStart` already does synchronous file writes in SubagentStart hooks with no reported latency issues. Same pattern is safe here.

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Tinybird schema migration breaks pipes | Medium | Test all pipes after adding columns; use `tinybird build` locally first |
| `tool_use_id` absent in edge cases | Low | Schema declares it optional; skip timing if missing (duration_ms defaults to 0) |
| Bash command string doesn't contain absolute path | Medium | Skills typically reference absolute paths; add tests for both absolute and relative patterns |
| PreToolUse latency on non-Bash tools | None | Fast-path exit on tool_name check before any I/O |
| Type changes cascade to many files | Low | `SkillActivationRow` is derived from schema; update schema, fix callers |

## System-Wide Implications

1. **New hook registration required** -- someone needs to add PreToolUse hook to `.claude/settings.json` (or equivalent)
2. **All existing `parseSkillActivation` tests need updating** -- return type gains `parent_skill`, `resource_path`, `project_name`
3. **Pipe SQL changes** -- `skill_frequency` pipe already groups by `entity_type`; just needs `parent_skill` and `project_name` filter param
4. **No breaking changes to existing data** -- all new columns have defaults; existing ingestion continues working

## Unresolved Questions

1. **Where are hooks registered?** `.claude/settings.local.json` has `"hooks": {}` but this is user-local. Production hooks may be in a global config (`~/.claude/settings.json`) or per-project. Charter references `.claude/hooks/log-script-start.js` -- need to verify the build/deploy pipeline for hook JS files.
2. **PostToolUseFailure for scripts?** If a script fails (non-zero exit), does PostToolUse fire or PostToolUseFailure? If only the latter, the duration pairing needs to also handle PostToolUseFailure events. The official docs show PostToolUseFailure has `tool_use_id` so pairing would work, but the current `log-skill-activation` hook only fires on PostToolUse.
3. **Relative vs absolute paths in Bash commands?** Skills may reference scripts with relative paths (`python scripts/foo.py` from skill dir) or absolute paths. Need to test both patterns. A `cwd`-aware resolution might be needed.
