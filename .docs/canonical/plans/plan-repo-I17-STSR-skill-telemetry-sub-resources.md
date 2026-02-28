---
type: plan
endeavor: repo
initiative: I17-STSR
initiative_name: skill-telemetry-sub-resources
status: done
created: 2026-02-21
updated: 2026-02-21
---

# Implementation Plan: Skill Telemetry Sub-Resources (I17-STSR)

## Overview

Step-by-step implementation plan for extending I05-ATEL telemetry to track skill sub-resources (references, scripts), add script execution duration via PreToolUse/PostToolUse pairing, and add project context to all events.

**Backlog items:** B1-B25 from [backlog-repo-I17-STSR](../backlogs/backlog-repo-I17-STSR-skill-telemetry-sub-resources.md)
**ADRs:** I17-STSR-001 (tool_use_id pairing), I17-STSR-002 (file-based timing store), I17-STSR-003 (dual event registration), I17-STSR-004 (project name from cwd)

## Key Codebase Facts

- Hooks registered in `~/.claude/settings.json` (global user config), NOT `.claude/settings.local.json` (project-level). PostToolUse currently has `"matcher": "Read"` -- must add Bash matcher or remove matcher to catch both.
- Hooks run via `pnpx dotenv-cli -e ~/.claude/.env.prod -- pnpx tsx` from `~/.claude/telemetry-hooks` (a symlink/copy of telemetry src).
- `SkillActivationRow` is derived via `InferRow<typeof skillActivations>` -- changing schema auto-updates the type, then all callers must be fixed.
- `parseSkillActivation` currently guards on `tool_name !== 'Read'` returning null. Must broaden to also handle `'Bash'`.
- `isSkillOrCommandPath` in `log-skill-activation.ts` duplicates regex patterns from `parse-skill-activation.ts` for fast-path filtering. Must stay in sync.
- `cwd` is already parsed by all Zod event schemas (`subagentStartSchema`, `subagentStopSchema`, `sessionEndEventSchema`, `postToolUseSchema`) but currently unused in returned rows.
- `agent-timing.ts` is the proven pattern for file-based timing store. `script-timing.ts` follows it exactly.

## Critical Path

```
B2 (schema) -> B5 (fix callers) -> B12 (script detection) -> B13 (failure handling) -> B17 (timing integration) -> B25 (validation)
```

## Wave 0: Foundation (B1 || B2+B3+B4 -- parallel)

### Step 0.1: Spike -- Validate tool_use_id pairing [B1]

**What to build:** Temporary test hooks (not committed) to validate `tool_use_id` presence/consistency in PreToolUse, PostToolUse, and PostToolUseFailure events. Also document how hook registration works (`~/.claude/settings.json` global hooks section).

**What to test (manual):**
- PreToolUse event for Bash has non-empty `tool_use_id`
- PostToolUse event for same Bash call has matching `tool_use_id`
- PostToolUseFailure for failed `exit 1` Bash call has `tool_use_id`
- Whether both PostToolUse AND PostToolUseFailure fire for failed commands
- Confirm PostToolUse matcher changes: current `"matcher": "Read"` only fires for Read tools; need `""` (empty, matches all) or two separate entries for Read and Bash

**Files:**
- Create: `.docs/reports/report-repo-I17-STSR-tool-use-id-spike-2026-02.md` (spike findings)
- Temporary: test hooks in `/tmp/` (not committed)

**Acceptance criteria:**
- S-0.1 through S-0.4 from charter validated
- Spike report documents: tool_use_id consistency, PostToolUseFailure behavior, hook registration mechanism, recommended settings.json changes
- If tool_use_id absent: document command-string hashing fallback

**Dependencies:** None
**Execution mode:** Solo
**Agents:** Manual investigation (developer). No specialist agent needed.
**Complexity:** XS (1-2h)
**Critical path:** No (but blocks Wave 2)

---

### Step 0.2: Add columns to `skill_activations` schema [B2]

**What to build:** Three new columns on `skill_activations` datasource: `parent_skill` (nullable LowCardinality string), `resource_path` (string, default `''`), `project_name` (LowCardinality string, default `''`).

**What to test (TDD):**
- Schema has 10 columns (was 7)
- `SkillActivationRow` type includes `parent_skill: string | null`, `resource_path: string`, `project_name: string`
- `tinybird build` succeeds against Tinybird Local

**Files:**
- Modify: `telemetry/src/datasources/skill_activations.ts` (add 3 columns)
- Modify: `telemetry/src/datasources/skill_activations.test.ts` (update schema test)

**Acceptance criteria:**
- `pnpm type-check` passes in telemetry/
- Datasource test updated and green
- New columns have backward-compatible defaults

**Dependencies:** None
**Execution mode:** Parallel with B1, B3, B4
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** S (1-2h)
**Critical path:** YES

---

### Step 0.3: Add `project_name` to `agent_activations` schema [B3]

**What to build:** One new column on `agent_activations`: `project_name` (LowCardinality string, default `''`).

**What to test (TDD):**
- Schema has 16 columns (was 15)
- `AgentActivationRow` type includes `project_name: string`

**Files:**
- Modify: `telemetry/src/datasources/agent_activations.ts`
- Modify: `telemetry/src/datasources/agent_activations.test.ts`

**Acceptance criteria:**
- Type-check passes; datasource test green

**Dependencies:** None
**Execution mode:** Parallel with B1, B2, B4
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** XS (30min)
**Critical path:** No

---

### Step 0.4: Add `project_name` to `session_summaries` schema [B4]

**What to build:** One new column on `session_summaries`: `project_name` (LowCardinality string, default `''`).

**What to test (TDD):**
- Schema has 13 columns (was 12)
- `SessionSummaryRow` type includes `project_name: string`

**Files:**
- Modify: `telemetry/src/datasources/session_summaries.ts`
- Modify: `telemetry/src/datasources/session_summaries.test.ts`

**Acceptance criteria:**
- Type-check passes; datasource test green

**Dependencies:** None
**Execution mode:** Parallel with B1, B2, B3
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** XS (30min)
**Critical path:** No

---

### Step 0.5: Fix all callers broken by schema type changes [B5]

**What to build:** After B2-B4, `InferRow` types gain required fields. All parsers and entry points must populate new fields with defaults. This is mechanical but touches many files.

**What to test (TDD):**
- All existing tests updated with new fields in expected values
- `parseSkillActivation` returns `parent_skill: null, resource_path: '', project_name: ''`
- `parseAgentStart` returns `project_name: ''`
- `parseAgentStop` returns `project_name: ''`
- `buildSessionSummary` returns `project_name: ''`
- All entry point tests pass with updated row shapes

**Files to modify:**
- `telemetry/src/hooks/parse-skill-activation.ts` -- add defaults to returned row
- `telemetry/src/hooks/parse-skill-activation.test.ts` -- update expected rows
- `telemetry/src/hooks/parse-agent-start.ts` -- add `project_name: ''`
- `telemetry/src/hooks/parse-agent-start.test.ts` -- update expected rows
- `telemetry/src/hooks/parse-agent-stop.ts` -- add `project_name: ''`
- `telemetry/src/hooks/parse-agent-stop.test.ts` -- update expected rows
- `telemetry/src/hooks/build-session-summary.ts` -- add `project_name: ''`
- `telemetry/src/hooks/build-session-summary.test.ts` -- update expected rows
- `telemetry/src/hooks/entrypoints/log-skill-activation.test.ts` -- update stubs
- `telemetry/src/hooks/entrypoints/log-agent-start.test.ts` -- update stubs
- `telemetry/src/hooks/entrypoints/log-agent-stop.test.ts` -- update stubs
- `telemetry/src/hooks/entrypoints/log-session-summary.test.ts` -- update stubs

**Acceptance criteria:**
- `pnpm type-check && pnpm test:unit` passes with zero failures
- All existing behavior preserved; new fields default to empty/null
- No feature logic yet -- just defaults

**Dependencies:** B2, B3, B4
**Execution mode:** Solo (after Wave 0 schemas)
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** M (2-3h -- mechanical but many files)
**Critical path:** YES

---

**RISK GATE after Step 0.5:** All tests must be green with new schema before proceeding to Wave 1. Run `pnpm type-check && pnpm test:unit` as gate check.

---

## Wave 1: Feature Slices (B6-B13 -- parallel tracks after B5)

Three parallel tracks. Within each track, steps are sequential. Across tracks, independent.

### Track A: Project Context (B6 -> B7+B8+B9+B10 parallel)

#### Step 1.1: Create `extractProjectName` utility [B6]

**What to build:** Pure function `extractProjectName(cwd: string | undefined): string` in new file. Uses `path.basename` after stripping trailing slash. Returns `''` for undefined, empty, or `'/'`.

**What to test (TDD):**
- Normal path `/Users/Ariel/projects/agents-and-skills` -> `'agents-and-skills'`
- Trailing slash `/Users/Ariel/projects/agents-and-skills/` -> `'agents-and-skills'`
- Root `'/'` -> `''`
- Undefined -> `''`
- Empty string -> `''`

**Files:**
- Create: `telemetry/src/hooks/extract-project-name.ts`
- Create: `telemetry/src/hooks/extract-project-name.test.ts`

**Acceptance criteria:**
- S-3.4 (missing cwd), S-3.5 (root), S-3.6 (trailing slash) covered
- Pure function, no I/O

**Dependencies:** None (pure utility)
**Execution mode:** Parallel with B11, B12
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** XS (30min)
**Critical path:** No

---

#### Step 1.2: Add project_name to skill activation flow [B7]

**What to build:** Update `parseSkillActivation` to accept `projectName` parameter (default `''`), set in returned row. Update `runLogSkillActivation` to extract `cwd` via `extractStringField`, call `extractProjectName`, pass to parser.

**What to test (TDD):**
- `parseSkillActivation` with `projectName: 'agents-and-skills'` returns row with `project_name: 'agents-and-skills'`
- `parseSkillActivation` without projectName returns `project_name: ''`
- Entry point extracts cwd from event JSON, passes to parser
- S-3.1: skill activation includes project_name
- S-3.4: missing cwd defaults to empty

**Files:**
- Modify: `telemetry/src/hooks/parse-skill-activation.ts` -- add `projectName` param
- Modify: `telemetry/src/hooks/parse-skill-activation.test.ts`
- Modify: `telemetry/src/hooks/entrypoints/log-skill-activation.ts` -- extract cwd, call extractProjectName
- Modify: `telemetry/src/hooks/entrypoints/log-skill-activation.test.ts`

**Acceptance criteria:**
- Walking skeleton scenario S-3.1 passes
- Existing tests still green with updated signature

**Dependencies:** B5, B6
**Execution mode:** Parallel with B8, B9, B10
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** S (1-2h)
**Critical path:** No

---

#### Step 1.3: Add project_name to agent start flow [B8]

**What to build:** Update `parseAgentStart` to accept `projectName` parameter. `cwd` already in `subagentStartSchema`. Update `runLogAgentStart` to extract cwd, call `extractProjectName`, pass to parser.

**What to test (TDD):**
- S-3.2: agent start event with cwd `/Users/Ariel/projects/trival-sales-brain` produces `project_name: 'trival-sales-brain'`

**Files:**
- Modify: `telemetry/src/hooks/parse-agent-start.ts`
- Modify: `telemetry/src/hooks/parse-agent-start.test.ts`
- Modify: `telemetry/src/hooks/entrypoints/log-agent-start.ts`
- Modify: `telemetry/src/hooks/entrypoints/log-agent-start.test.ts`

**Acceptance criteria:** S-3.2 passes

**Dependencies:** B5, B6
**Execution mode:** Parallel with B7, B9, B10
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** S (1h)
**Critical path:** No

---

#### Step 1.4: Add project_name to agent stop flow [B9]

**What to build:** Update `parseAgentStop` to accept `projectName` parameter. Update `runLogAgentStop` to extract cwd, call `extractProjectName`, pass to parser.

**What to test (TDD):**
- Agent stop event produces row with `project_name` derived from cwd

**Files:**
- Modify: `telemetry/src/hooks/parse-agent-stop.ts`
- Modify: `telemetry/src/hooks/parse-agent-stop.test.ts`
- Modify: `telemetry/src/hooks/entrypoints/log-agent-stop.ts`
- Modify: `telemetry/src/hooks/entrypoints/log-agent-stop.test.ts`

**Acceptance criteria:** Agent stop rows include project_name

**Dependencies:** B5, B6
**Execution mode:** Parallel with B7, B8, B10
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** S (1h)
**Critical path:** No

---

#### Step 1.5: Add project_name to session summary flow [B10]

**What to build:** `buildSessionSummary` already parses `cwd` via `sessionEndEventSchema`. Add `extractProjectName(event.cwd)` call, set `project_name` in returned row.

**What to test (TDD):**
- S-3.3: session summary with cwd produces correct project_name
- Missing cwd (schema requires it, so test the empty string case)

**Files:**
- Modify: `telemetry/src/hooks/build-session-summary.ts`
- Modify: `telemetry/src/hooks/build-session-summary.test.ts`
- Modify: `telemetry/src/hooks/entrypoints/log-session-summary.test.ts` (if needed)

**Acceptance criteria:** S-3.3 passes

**Dependencies:** B5, B6
**Execution mode:** Parallel with B7, B8, B9
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** S (1h)
**Critical path:** No

---

### Track B: Reference Tracking (B11)

#### Step 1.6: Detect reference file reads [B11]

**What to build:** Add `REFERENCE_PATH_PATTERN` regex to `parse-skill-activation.ts`. Extend `extractSkillInfo` return type to include `parent_skill` and `resource_path`. Detection order: SKILL.md -> command -> reference (first match wins). Update `isSkillOrCommandPath` fast-path in `log-skill-activation.ts` to also match reference paths (rename to `isRelevantPath`).

**What to test (TDD):**
- S-1.1: `/skills/mermaid-diagrams/references/class-diagrams.md` -> entity_type `'reference'`, parent_skill `'mermaid-diagrams'`, skill_name `'class-diagrams'`, resource_path `'references/class-diagrams.md'`
- S-1.2: nested team dir `/skills/engineering-team/typescript-strict/references/async-patterns.md` -> parent_skill `'typescript-strict'`
- S-1.3: `.png` in references/ -> ignored (no row)
- S-1.4: file in `assets/` not `references/` -> ignored
- S-1.5: SKILL.md still detected as entity_type `'skill'` (regression)
- S-1.6: command still detected (regression)
- S-1.7: `/docs/references/overview.md` (not under skills/) -> ignored

**Files:**
- Modify: `telemetry/src/hooks/parse-skill-activation.ts` -- add REFERENCE_PATH_PATTERN, extend extractSkillInfo
- Modify: `telemetry/src/hooks/parse-skill-activation.test.ts` -- 7 new test cases
- Modify: `telemetry/src/hooks/entrypoints/log-skill-activation.ts` -- update fast-path to match references
- Modify: `telemetry/src/hooks/entrypoints/log-skill-activation.test.ts`

**Acceptance criteria:**
- S-1.1 through S-1.7 all pass
- Walking skeleton scenario S-1.1 verified
- Existing SKILL.md and command detection unbroken

**Dependencies:** B5
**Execution mode:** Parallel with Track A and Track C
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** M (2-3h -- many test scenarios, careful regex)
**Critical path:** No

---

### Track C: Script Detection (B12 -> B13)

#### Step 1.7: Detect script executions in Bash tool calls [B12]

**What to build:** Extend `parseSkillActivation` to handle `tool_name === 'Bash'`. Add `SCRIPT_PATH_PATTERN` regex matching `/skills/**/<skill>/scripts/<file>.(py|sh)` in `tool_input.command`. Remove the `tool_name !== 'Read'` early return; branch on Read vs Bash vs other. Add `bashToolInputSchema` for `tool_input.command` parsing. Update fast-path guard to check Bash events containing `/skills/` AND `/scripts/` substrings.

**What to test (TDD):**
- Python script in command string -> entity_type `'script'`, parent_skill extracted, skill_name is filename, resource_path `'scripts/<filename>'`
- Shell script via absolute path -> correctly parsed
- S-2.4: `npm test` (non-script Bash) -> no row
- S-2.5: `grep -r 'skills' README.md` (contains "skills" but not script path) -> no row
- S-2.6: `.ts` extension -> no row
- `duration_ms` defaults to 0 (duration populated later in B17)

**Files:**
- Modify: `telemetry/src/hooks/parse-skill-activation.ts` -- add SCRIPT_PATH_PATTERN, bash handling, bashToolInputSchema
- Modify: `telemetry/src/hooks/parse-skill-activation.test.ts` -- new test cases
- Modify: `telemetry/src/hooks/entrypoints/log-skill-activation.ts` -- update fast-path for Bash events
- Modify: `telemetry/src/hooks/entrypoints/log-skill-activation.test.ts`

**Acceptance criteria:**
- S-2.4, S-2.5, S-2.6 pass
- Script Bash events produce rows; non-script Bash events silently ignored
- Read-based events (skill, command, reference) still work (regression guard)

**Dependencies:** B5
**Execution mode:** Parallel with Track A and Track B
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** M (2-3h)
**Critical path:** YES

---

#### Step 1.8: Register for PostToolUseFailure + handle failure events [B13]

**What to build:** Update `runLogSkillActivation` to detect `hook_event_name === 'PostToolUseFailure'` and set `success: 0` for script activations. Update hook registration: the PostToolUse entry in `~/.claude/settings.json` must change from `"matcher": "Read"` to either no matcher (catches all) or add a second PostToolUse entry for Bash. Add a PostToolUseFailure entry with `"matcher": "Bash"`.

**Important discovery:** Hooks are in `~/.claude/settings.json` (global), not project-level `.claude/settings.local.json`. The backlog's reference to settings.local.json is incorrect. The actual registration changes go in `~/.claude/settings.json`.

**What to test (TDD):**
- S-6.2: PostToolUseFailure for non-script Bash (`rm -rf /nonexistent`) -> no row
- PostToolUseFailure for script Bash -> row with `success: 0`
- PostToolUse event (normal) -> row with `success: 1` (existing behavior)

**Files:**
- Modify: `telemetry/src/hooks/entrypoints/log-skill-activation.ts` -- detect hook_event_name, set success
- Modify: `telemetry/src/hooks/entrypoints/log-skill-activation.test.ts`
- Document: hook registration changes for `~/.claude/settings.json` (PostToolUse matcher change + PostToolUseFailure addition)

**Acceptance criteria:**
- S-6.2 passes
- PostToolUseFailure events with script paths produce rows with success=0
- Non-script PostToolUseFailure events silently ignored

**Dependencies:** B12
**Execution mode:** Sequential after B12
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** S (1-2h)
**Critical path:** YES

---

**RISK GATE after Wave 1:** Walking skeleton scenarios S-1.1, S-3.1, and S-1.5 must pass. Run full test suite as gate check before proceeding to Wave 2.

---

## Wave 2: Duration Pairing (B14-B18 -- after B1 + B12)

### Step 2.1: Create script-timing module [B14]

**What to build:** New module `telemetry/src/hooks/script-timing.ts` following `agent-timing.ts` pattern exactly. Functions: `recordScriptStart(toolUseId, startMs)`, `consumeScriptStart(toolUseId, nowMs)`. Dir: `/tmp/telemetry-script-timing/`. Includes `safePath` for traversal protection. `consumeScriptStart` returns `null` for stale files (>1h) and deletes them.

**What to test (TDD):**
- Record + consume round-trip: write start, read it back, file deleted
- Missing file returns null
- Stale file (>1h) returns null and is deleted
- Path traversal attempt (e.g. `../../etc/passwd`) blocked
- Directory created on first write
- S-2.7: stale timing file ignored

**Files:**
- Create: `telemetry/src/hooks/script-timing.ts`
- Create: `telemetry/src/hooks/script-timing.test.ts`

**Acceptance criteria:**
- S-2.7 covered
- All round-trip and error-path tests pass
- Pattern matches `agent-timing.ts` structure

**Dependencies:** B1 (spike confirms tool_use_id is usable)
**Execution mode:** Parallel with B15
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** S (1-2h)
**Critical path:** No

---

### Step 2.2: Add ScriptTimingStore type to ports [B15]

**What to build:** Add `ScriptTimingStore` type to `ports.ts`:
```typescript
export type ScriptTimingStore = {
  readonly recordScriptStart: (toolUseId: string, startMs: number) => void;
  readonly consumeScriptStart: (toolUseId: string, nowMs: number) => number | null;
};
```

**What to test:** Type-check only (no runtime test needed for a type definition).

**Files:**
- Modify: `telemetry/src/hooks/entrypoints/ports.ts`

**Acceptance criteria:** `pnpm type-check` passes

**Dependencies:** None
**Execution mode:** Parallel with B14
**Agents:** `ts-enforcer`
**Complexity:** XS (15min)
**Critical path:** No

---

### Step 2.3: Create PreToolUse entry point [B16]

**What to build:** New entry point `telemetry/src/hooks/entrypoints/log-script-start.ts`. DI deps: `{ clock, scriptTiming, health }`. Flow: read stdin -> parse JSON minimally -> fast-path exit if not Bash or command lacks `/skills/` + `/scripts/` -> regex match -> if match + tool_use_id: `recordScriptStart(tool_use_id, clock.now())`. No network I/O. No Tinybird ingestion.

**Important:** PreToolUse events do NOT include `session_id`. Only `tool_name`, `tool_input`, `tool_use_id`, `cwd`, `hook_event_name`.

**What to test (TDD):**
- S-5.1: matching Bash command -> timing file written
- S-5.2: non-matching command -> no I/O (verify scriptTiming.recordScriptStart NOT called)
- S-5.3: non-Bash tool -> no I/O
- S-5.4: missing tool_use_id -> no file written
- S-5.5: directory creation (handled by script-timing module, but test through entry point)

**Files:**
- Create: `telemetry/src/hooks/entrypoints/log-script-start.ts`
- Create: `telemetry/src/hooks/entrypoints/log-script-start.test.ts`

**Acceptance criteria:**
- S-5.1 through S-5.5 pass
- Zero network I/O in any code path
- Fast-path exit for non-matching events

**Dependencies:** B14, B15
**Execution mode:** Sequential after B14+B15
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** M (2-3h)
**Critical path:** No

---

### Step 2.4: Integrate script timing into PostToolUse flow [B17]

**What to build:** Update `LogSkillActivationDeps` to include `scriptTiming: Pick<ScriptTimingStore, 'consumeScriptStart'>`. In `runLogSkillActivation`, after `parseSkillActivation` returns a script-type row:
1. Extract `tool_use_id` from event
2. Call `consumeScriptStart(toolUseId, clock.now())`
3. If timing found and not stale: override `duration_ms = nowMs - startMs`
4. If missing/stale: `duration_ms = 0`

Also handle PostToolUseFailure path: same timing logic, but row already has `success: 0` from B13.

**What to test (TDD):**
- S-2.1: Python script with timing file -> correct duration_ms computed
- S-2.2: Shell script absolute path with timing -> correct duration_ms
- S-2.3: Missing timing file -> duration_ms = 0
- S-6.1: Failed script via PostToolUseFailure -> success=0, correct duration_ms
- S-6.3: Duplicate events (PostToolUse + PostToolUseFailure) -> first gets duration, second gets 0

**Files:**
- Modify: `telemetry/src/hooks/entrypoints/log-skill-activation.ts` -- add scriptTiming dep, compute duration
- Modify: `telemetry/src/hooks/entrypoints/log-skill-activation.test.ts` -- extensive new test cases
- Modify: `telemetry/src/hooks/entrypoints/ports.ts` (if not already done in B15)

**Acceptance criteria:**
- S-2.1, S-2.2, S-2.3, S-6.1, S-6.3 pass
- Timing file consumed (deleted) after reading
- Non-script rows unaffected (no timing lookup for skill/command/reference)

**Dependencies:** B12, B13, B14, B16
**Execution mode:** Sequential (last step in Wave 2)
**Agents:** `tdd-reviewer`, `ts-enforcer`
**Complexity:** M (2-3h)
**Critical path:** YES

---

### Step 2.5: Register PreToolUse hook and update PostToolUse registration [B18]

**What to build:** Document the required changes to `~/.claude/settings.json`:
1. Add PreToolUse entry with `"matcher": "Bash"` pointing to `log-script-start.ts`
2. Change PostToolUse `"matcher": "Read"` to `""` (or add second entry for Bash)
3. Add PostToolUseFailure entry with `"matcher": "Bash"` pointing to `log-skill-activation.ts`

**Note:** This is a manual config change to the user's global settings, not a committed file. Document exact JSON in spike report and provide a script or instructions.

**What to test:** Manual verification in live session that:
- PreToolUse fires for Bash calls
- PostToolUse fires for both Read and Bash calls
- PostToolUseFailure fires for failed Bash calls

**Files:**
- Create/update: `.docs/reports/report-repo-I17-STSR-hook-registration-2026-02.md`

**Acceptance criteria:**
- All three event types fire correctly in live session
- Existing hooks (SubagentStart, SubagentStop, SessionEnd, SessionStart) unaffected

**Dependencies:** B1 (spike), B16
**Execution mode:** Solo
**Agents:** Manual
**Complexity:** XS (30min)
**Critical path:** No

---

## Wave 3: Pipes (B19-B24 -- after all features)

### Step 3.1: Update skill_frequency pipe [B19]

**What to build:** Add `parent_skill` and `project_name` to SELECT, GROUP BY, and output. Add optional `project_name` param for filtering. Update SQL with conditional WHERE clause.

**What to test (TDD):**
- S-4.1: output includes entity_type and parent_skill columns
- S-4.2: filter by project_name returns only matching rows
- S-4.5: no project_name filter returns all projects

**Files:**
- Modify: `telemetry/src/pipes/skill_frequency.ts`
- Modify: `telemetry/src/pipes/skill_frequency.test.ts`

**Acceptance criteria:** S-4.1, S-4.2, S-4.5 pass

**Dependencies:** B2 (schema columns exist)
**Execution mode:** Parallel with B20, B21, B22
**Agents:** `tdd-reviewer`
**Complexity:** S (1h)
**Critical path:** No

---

### Step 3.2: Create script_performance pipe [B20]

**What to build:** New pipe returning avg/p95/max duration_ms per script. Output: skill_name, parent_skill, project_name, executions, successes, failures, avg_duration_ms, p95_duration_ms, max_duration_ms. Filtered to `entity_type = 'script'`. Optional project_name and days params.

**What to test (TDD):**
- S-4.3: rows with known durations produce correct avg/max
- S-4.4: empty result when no script rows exist

**Files:**
- Create: `telemetry/src/pipes/script_performance.ts`
- Create: `telemetry/src/pipes/script_performance.test.ts`

**Acceptance criteria:** S-4.3, S-4.4 pass

**Dependencies:** B2 (schema)
**Execution mode:** Parallel with B19, B21, B22
**Agents:** `tdd-reviewer`
**Complexity:** S (1-2h)
**Critical path:** No

---

### Step 3.3: Update agent_usage_summary pipe [B21]

**What to build:** Add optional `project_name` param for filtering. No change to output columns.

**What to test (TDD):**
- Filter by project_name returns only matching rows
- No filter returns all

**Files:**
- Modify: `telemetry/src/pipes/agent_usage_summary.ts`
- Modify: `telemetry/src/pipes/agent_usage_summary.test.ts`

**Acceptance criteria:** Filter works correctly

**Dependencies:** B3 (schema)
**Execution mode:** Parallel with B19, B20, B22
**Agents:** `tdd-reviewer`
**Complexity:** XS (30min)
**Critical path:** No

---

### Step 3.4: Update session_overview pipe [B22]

**What to build:** Add `project_name` to SELECT, GROUP BY, output. Add optional `project_name` param.

**What to test (TDD):**
- project_name appears in output
- Filter by project_name works

**Files:**
- Modify: `telemetry/src/pipes/session_overview.ts`
- Modify: `telemetry/src/pipes/session_overview.test.ts`

**Acceptance criteria:** project_name in output and filterable

**Dependencies:** B4 (schema)
**Execution mode:** Parallel with B19, B20, B21
**Agents:** `tdd-reviewer`
**Complexity:** XS (30min)
**Critical path:** No

---

### Step 3.5: Export pipes + update client [B23]

**What to build:** Add `scriptPerformance` to `src/pipes/index.ts`. Add `scriptPerformance` query method to `TelemetryClient` type and `createTelemetryClient`. Add `project_name?: string` to query param types for `skillFrequency`, `agentUsageSummary`, `sessionOverview`.

**What to test (TDD):**
- Client type includes `scriptPerformance` method
- All query methods accept `project_name` param
- Type-check passes

**Files:**
- Modify: `telemetry/src/pipes/index.ts`
- Modify: `telemetry/src/client.ts`
- Modify: `telemetry/src/client.test.ts` (if exists)

**Acceptance criteria:** `pnpm type-check` passes; client exposes all new/updated methods

**Dependencies:** B19, B20, B21, B22
**Execution mode:** Sequential after all pipe changes
**Agents:** `ts-enforcer`
**Complexity:** S (1h)
**Critical path:** No

---

### Step 3.6: Update integration test factories and pipe tests [B24]

**What to build:** Update test factories to produce rows with new columns. Add integration tests for `script_performance` against Tinybird Local. Update existing integration tests for new params/columns.

**What to test:**
- Integration tests for all updated pipes pass against Tinybird Local
- New `script_performance` pipe returns expected results

**Files:**
- Modify: test factory files (if they exist under `tests/integration/`)
- Add: integration test for script_performance

**Acceptance criteria:** All integration tests pass against Tinybird Local

**Dependencies:** B23
**Execution mode:** Sequential after B23
**Agents:** `tdd-reviewer`
**Complexity:** M (2-3h)
**Critical path:** No

---

**RISK GATE after Wave 3:** All integration tests must pass against Tinybird Local before deploying. Run `pnpm test:integration` with Tinybird Local running.

---

## Wave 4: Validation (B25 -- after all)

### Step 4.1: End-to-end validation and deploy [B25]

**What to build:** No new code. Verification and deployment.

**What to test (manual, in live Claude Code session):**
1. Read a SKILL.md -> `skill_activations` row with `project_name`, entity_type=skill
2. Read a reference .md -> row with entity_type=reference, parent_skill set
3. Run a skill script -> row with entity_type=script, duration_ms > 0, parent_skill set
4. Run a failing skill script -> row with success=0, duration_ms set
5. Agent start/stop -> `agent_activations` rows with project_name
6. Session end -> `session_summaries` row with project_name
7. `skill_frequency` pipe returns sub-resource data
8. `script_performance` pipe returns duration stats

**Files:** None (verification only)

**Steps:**
1. Run `pnpm type-check && pnpm lint && pnpm test:unit && pnpm test:integration`
2. Verify `tinybird build` against Tinybird Local
3. Deploy to Tinybird production via CI pipeline
4. Apply hook registration changes to `~/.claude/settings.json`
5. Run a Claude Code session exercising all paths
6. Query Tinybird to verify data

**Acceptance criteria:** Charter success criteria 1-8 all met

**Dependencies:** All prior steps
**Execution mode:** Solo
**Agents:** Manual verification
**Complexity:** M (2-3h manual E2E)
**Critical path:** YES

---

## Parallelization Map

```
Wave 0:  B1 (spike)                    B2, B3, B4 (schemas -- parallel)
         |                              |
         |                              B5 (fix callers -- after B2+B3+B4)
         |                              |
Wave 1:  |    B6 (extractProjectName)---+
         |    |                         |
         |    B7, B8, B9, B10 ----------+ (parallel, after B5+B6)
         |    (project context)         |
         |                              B11 (references -- after B5)
         |                              |
         |                              B12 (scripts -- after B5) [CRITICAL PATH]
         |                              |
         |                              B13 (PostToolUseFailure -- after B12) [CRITICAL PATH]
         |                              |
Wave 2:  B14 (script-timing -- B1) ----+
         |                              |
         B15 (ports type)               |
         |                              |
         B16 (PreToolUse -- B14+B15)    |
         |                              |
         B17 (integrate timing -- B12+B13+B14+B16) [CRITICAL PATH]
         |
         B18 (register hooks -- B1+B16)
         |
Wave 3:  B19, B20, B21, B22 (pipes -- parallel)
         |
         B23 (client wiring -- after B19-B22)
         |
         B24 (integration tests -- after B23)
         |
Wave 4:  B25 (E2E validation + deploy)
```

## Complexity Summary

| Size | Items | Est. hours each |
|------|-------|-----------------|
| XS   | B1, B3, B4, B6, B15, B18, B21, B22 (8) | 0.5-1h |
| S    | B2, B7, B8, B9, B10, B14, B19, B20, B23 (9) | 1-2h |
| M    | B5, B11, B12, B13, B16, B17, B24, B25 (8) | 2-3h |

**Total items:** 25
**Estimated total effort:** 35-55 hours

## Unresolved Questions

1. **Hook registration location:** The backlog references `.claude/settings.local.json` for hook registration, but actual hooks are in `~/.claude/settings.json` (global user config). The spike (B1) must clarify whether project-level hooks in `.claude/settings.local.json` are even supported, or if all registration must go in the global settings file. This affects B13 and B18.

2. **PostToolUse matcher broadening:** Current PostToolUse has `"matcher": "Read"`. To catch Bash events for script detection, options are: (a) remove matcher entirely (catches ALL tool uses -- perf concern for every Write, Grep, Glob call), (b) add second PostToolUse entry for Bash alongside Read, or (c) use empty matcher and rely on fast-path guard in `isRelevantEvent`. The spike should benchmark option (a) vs (b).

3. **Symlinked telemetry path:** Hooks run from `~/.claude/telemetry-hooks` which appears to be a symlink/copy. Changes to `telemetry/src/` must be deployed there. Need to confirm the deployment mechanism (is it a symlink, or does it require manual copy/build?).

## References

- Charter: [charter-repo-I17-STSR](../charters/charter-repo-I17-STSR-skill-telemetry-sub-resources.md)
- Roadmap: [roadmap-repo-I17-STSR](../roadmaps/roadmap-repo-I17-STSR-skill-telemetry-sub-resources-2026.md)
- Backlog: [backlog-repo-I17-STSR](../backlogs/backlog-repo-I17-STSR-skill-telemetry-sub-resources.md)
- ADRs: I17-STSR-001 through I17-STSR-004
- Agent timing pattern: `telemetry/src/hooks/agent-timing.ts`
- Current hook registrations: `~/.claude/settings.json`
