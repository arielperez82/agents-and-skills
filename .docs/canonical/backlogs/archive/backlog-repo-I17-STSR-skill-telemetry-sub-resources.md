---
type: backlog
endeavor: repo
initiative: I17-STSR
initiative_name: skill-telemetry-sub-resources
status: done
updated: 2026-02-21
---

# Backlog: Skill Telemetry Sub-Resources

Single continuous queue of **changes** (smallest independently valuable increments). Ordered by charter outcome and dependency. Implementers pull from here; execution is planned in the plan doc.

## Architecture Design

This section documents the technical design decisions that inform the backlog items below. Each subsection maps to a charter outcome and describes the concrete changes required.

### 1. Schema Changes (Outcome 1)

Three datasources require new columns. All new columns use backward-compatible defaults (empty string or nullable) so existing rows are unaffected and Tinybird's append-only schema migration is satisfied.

**`skill_activations` -- 3 new columns:**

```typescript
// telemetry/src/datasources/skill_activations.ts
export const skillActivations = defineDatasource('skill_activations', {
  schema: {
    timestamp: t.dateTime(),
    session_id: t.string(),
    skill_name: t.string().lowCardinality(),
    entity_type: t.string().lowCardinality(),       // existing; adds 'reference' | 'script' values
    agent_type: t.string().lowCardinality().nullable(),
    duration_ms: t.uint64(),
    success: t.uint8(),
    // NEW columns:
    parent_skill: t.string().lowCardinality().nullable(),  // owning skill; null for top-level skill/command
    resource_path: t.string(),                              // e.g. 'references/class-diagrams.md'; default ''
    project_name: t.string().lowCardinality(),              // derived from cwd; default ''
  },
  // sorting key unchanged
});
```

**`agent_activations` -- 1 new column:**

```typescript
// add after tool_calls_count:
project_name: t.string().lowCardinality(),  // default ''
```

**`session_summaries` -- 1 new column:**

```typescript
// add after model_primary:
project_name: t.string().lowCardinality(),  // default ''
```

**Type cascade:** `SkillActivationRow` (derived via `InferRow`) gains `parent_skill`, `resource_path`, `project_name`. All callers (`parseSkillActivation`, `log-skill-activation`, tests, factories) must be updated. `AgentActivationRow` gains `project_name`; callers: `parseAgentStart`, `parseAgentStop`, `log-agent-start`, `log-agent-stop`, tests. `SessionSummaryRow` gains `project_name`; callers: `buildSessionSummary`, `log-session-summary`, tests.

### 2. Project Name Extraction (Outcome 2)

A pure utility function, shared across all hook entry points:

```typescript
// telemetry/src/hooks/extract-project-name.ts
import * as path from 'node:path';

export const extractProjectName = (cwd: string | undefined): string => {
  if (!cwd || cwd === '/') return '';
  // Strip trailing slash, then take last segment
  const normalized = cwd.endsWith('/') ? cwd.slice(0, -1) : cwd;
  return path.basename(normalized);
};
```

Usage in each entry point: extract `cwd` from the event JSON (already available via `extractStringField`), call `extractProjectName(cwd)`, pass to parser. Each parser adds `project_name` to its returned row.

**Affected entry points (5 total):**
- `log-agent-start.ts` -- pass to `parseAgentStart`
- `log-agent-stop.ts` -- pass to `parseAgentStop`
- `log-skill-activation.ts` -- pass to `parseSkillActivation`
- `log-session-summary.ts` -- pass to `buildSessionSummary`
- `inject-usage-context.ts` -- no change (queries pipes, does not ingest; pipes will expose `project_name` in O6)

**Affected parsers (4 total):**
- `parseAgentStart` -- add `projectName` parameter, set in returned row
- `parseAgentStop` -- add `projectName` parameter, set in returned row
- `parseSkillActivation` -- add `projectName` parameter, set in returned row
- `buildSessionSummary` -- extract from event's `cwd` field (already in Zod schema), set in returned row

### 3. Reference File Detection (Outcome 3)

Extend `parse-skill-activation.ts` to detect reference files read via the `Read` tool.

**New regex pattern:**

```typescript
// Match: /skills/<any-team>/<skill-name>/references/<file>.md
const REFERENCE_PATH_PATTERN = /\/skills\/(?:[^/]+\/)*([^/]+)\/references\/([^/]+)\.md$/;
```

**Extended `extractSkillInfo` return type:**

```typescript
type SkillInfo = {
  readonly skill_name: string;
  readonly entity_type: 'skill' | 'command' | 'reference' | 'script';
  readonly parent_skill: string | null;
  readonly resource_path: string;
};
```

**Detection order** (first match wins):
1. SKILL.md pattern -> `entity_type: 'skill'`, `parent_skill: null`, `resource_path: ''`
2. Command pattern -> `entity_type: 'command'`, `parent_skill: null`, `resource_path: ''`
3. Reference pattern -> `entity_type: 'reference'`, `parent_skill: <skill-name>`, `resource_path: 'references/<file>.md'`

The `tool_name === 'Read'` guard stays. References are always `.md` files read via Read.

### 4. Script Detection in Bash Commands (Outcome 4)

Extend `parse-skill-activation.ts` to detect skill script executions in `Bash` tool calls.

**New regex pattern:**

```typescript
// Match skill script paths in Bash commands (both relative and absolute)
// Captures: skill name, script filename with extension
const SCRIPT_PATH_PATTERN = /(?:^|\s|["'])(?:[\w/.~-]*\/)?skills\/(?:[^/]+\/)*([^/]+)\/scripts\/([^/\s"']+\.(py|sh))(?:\s|["']|$)/;
```

**Changes to `parseSkillActivation`:**
- Remove the `if (event.tool_name !== 'Read') return null` guard
- Branch on `tool_name`:
  - `'Read'` -> existing logic + reference detection
  - `'Bash'` -> parse `tool_input.command` (string) for script path pattern
  - All other tools -> return null

**Bash tool_input schema:**

```typescript
const bashToolInputSchema = z.object({
  command: z.string(),
});
```

**Script detection produces:**
- `entity_type: 'script'`
- `parent_skill: <skill-name>` (captured from path)
- `skill_name: <filename>` (e.g. `sprint_metrics_calculator.py`)
- `resource_path: 'scripts/<filename>'`
- `duration_ms: 0` (populated by O5 via timing file)
- `success`: from `tool_response` for PostToolUse; `0` for PostToolUseFailure

**Fast-path guard update** in `log-skill-activation.ts`:
The `isSkillOrCommandPath` function must be broadened to `isRelevantEvent`. For `Read` events, check file_path patterns. For `Bash` events, check if `tool_input.command` contains the substring `/skills/` AND `/scripts/` before doing regex work. This ensures non-matching Bash calls (the vast majority) exit with zero overhead.

**PostToolUseFailure registration:**
The `log-skill-activation` hook must be registered for both `PostToolUse` and `PostToolUseFailure` events in `.claude/settings.local.json`. The `hook_event_name` field in the event distinguishes them. PostToolUseFailure events produce `success: 0`.

### 5. PreToolUse Hook for Script Timing (Outcome 5)

New entry point following the existing DI architecture pattern.

**Timing store** -- new module `telemetry/src/hooks/script-timing.ts`:

```typescript
// Follows agent-timing.ts pattern exactly
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const TIMING_DIR = path.join(os.tmpdir(), 'telemetry-script-timing');
const STALE_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

const safePath = (filename: string): string | null => {
  const resolved = path.resolve(TIMING_DIR, filename);
  return resolved.startsWith(TIMING_DIR + path.sep) ? resolved : null;
};

export const recordScriptStart = (toolUseId: string, startMs: number): void => {
  try {
    const filePath = safePath(`${toolUseId}.json`);
    if (!filePath) return;
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ startMs }));
  } catch { /* best-effort */ }
};

export const consumeScriptStart = (toolUseId: string, nowMs: number): number | null => {
  const p = safePath(`${toolUseId}.json`);
  if (!p) return null;
  try {
    const content = fs.readFileSync(p, 'utf-8');
    fs.unlinkSync(p);
    const data: unknown = JSON.parse(content);
    if (typeof data === 'object' && data !== null && 'startMs' in data) {
      const startMs = (data as Record<string, unknown>)['startMs'];
      if (typeof startMs === 'number') {
        // Stale file check
        if (nowMs - startMs > STALE_THRESHOLD_MS) return null;
        return startMs;
      }
    }
    return null;
  } catch { return null; }
};
```

**New entry point** `telemetry/src/hooks/entrypoints/log-script-start.ts`:

```typescript
// PreToolUse hook -- fires BEFORE Bash tool execution
// Only writes a timing file for matching skill script Bash calls
// No network I/O. No Tinybird ingestion. Sub-millisecond for non-matches.

export type LogScriptStartDeps = {
  readonly clock: Clock;
  readonly scriptTiming: Pick<ScriptTimingStore, 'recordScriptStart'>;
  readonly health: HealthLogger;
};

export const runLogScriptStart = async (
  eventJson: string,
  deps: LogScriptStartDeps
): Promise<void> => {
  // Fast path: parse minimally, check tool_name === 'Bash' first
  // Then check tool_input.command contains '/skills/' and '/scripts/'
  // Then regex match for script path pattern
  // On match: recordScriptStart(tool_use_id, clock.now())
  // On non-match: return immediately
};
```

**Hook JS wrapper** `.claude/hooks/log-script-start.js`:
Thin wrapper following the same pattern as existing hooks. Runs via `node` (pre-compiled).

**PreToolUse schema:**

```typescript
const preToolUseSchema = z.object({
  tool_name: z.string(),
  tool_input: z.unknown(),
  tool_use_id: z.string().optional(),
  cwd: z.string().optional(),
  hook_event_name: z.string().optional(),
});
```

Note: PreToolUse events do NOT include `session_id` (per official docs). The timing file only stores `startMs`; `session_id` comes from the PostToolUse event.

### 6. PostToolUse Duration Computation (Outcome 5, continued)

In `log-skill-activation.ts`, after detecting a script activation:
1. Read `tool_use_id` from event
2. Call `consumeScriptStart(toolUseId, clock.now())`
3. If timing file found and not stale: `duration_ms = clock.now() - startMs`
4. If missing or stale: `duration_ms = 0`

**Deduplication for PostToolUse + PostToolUseFailure:**
If both events fire for the same `tool_use_id`, the first event consumes the timing file (deletes it). The second event finds no timing file and gets `duration_ms = 0`. Since the timing file is consumed on first read, only one event can have a non-zero duration. This is acceptable -- the first event to arrive gets the accurate duration.

### 7. Pipe Updates (Outcome 6)

**`skill_frequency` pipe changes:**
- Add `parent_skill` and `project_name` to SELECT and output
- Add optional `project_name` param for filtering
- Add `parent_skill` to GROUP BY

```sql
SELECT
  skill_name,
  entity_type,
  parent_skill,
  project_name,
  count() AS activations,
  countIf(success = 1) AS successes,
  avg(duration_ms) AS avg_duration_ms
FROM skill_activations
WHERE timestamp >= now() - INTERVAL {{Int32(days, 7)}} DAY
  {% if defined(project_name) %}
    AND project_name = {{String(project_name)}}
  {% end %}
GROUP BY skill_name, entity_type, parent_skill, project_name
ORDER BY activations DESC
```

**New `script_performance` pipe:**

```sql
SELECT
  skill_name,
  parent_skill,
  project_name,
  count() AS executions,
  countIf(success = 1) AS successes,
  countIf(success = 0) AS failures,
  avg(duration_ms) AS avg_duration_ms,
  quantile(0.95)(duration_ms) AS p95_duration_ms,
  max(duration_ms) AS max_duration_ms
FROM skill_activations
WHERE entity_type = 'script'
  AND timestamp >= now() - INTERVAL {{Int32(days, 7)}} DAY
  {% if defined(project_name) %}
    AND project_name = {{String(project_name)}}
  {% end %}
GROUP BY skill_name, parent_skill, project_name
ORDER BY avg_duration_ms DESC
```

**`agent_usage_summary` pipe changes:**
- Add optional `project_name` param
- Filter: `{% if defined(project_name) %} AND project_name = {{String(project_name)}} {% end %}`
- No change to output schema (project_name is a filter, not a column -- keep the pipe focused)

**`session_overview` pipe changes:**
- Add `project_name` to SELECT and output
- Add optional `project_name` param for filtering
- Add `project_name` to GROUP BY

**Client type updates:**
- Add `project_name?: string` to query param types for `skillFrequency`, `agentUsageSummary`, `sessionOverview`
- Add new `scriptPerformance` query method
- Import and wire new `scriptPerformance` pipe

### 8. Hook Settings Changes (Outcome 4 + 5)

**`.claude/settings.local.json` hooks section** (currently empty `{}`):

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cd /Users/Ariel/projects/agents-and-skills/telemetry && node dist/hooks/entrypoints/log-script-start.js"
          }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "cd /Users/Ariel/projects/agents-and-skills/telemetry && node dist/hooks/entrypoints/log-skill-activation.js"
          }
        ]
      }
    ],
    "PostToolUseFailure": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "cd /Users/Ariel/projects/agents-and-skills/telemetry && node dist/hooks/entrypoints/log-skill-activation.js"
          }
        ]
      }
    ]
  }
}
```

Note: The existing hooks are registered via a mechanism not visible in `.claude/settings.local.json` (the hooks field is `{}`). The actual registration method needs investigation during the spike (B1). The settings above show the target state for the NEW hooks. Existing hooks (SubagentStart, SubagentStop, PostToolUse for Read, Stop) continue unchanged.

### 9. File/Directory Structure

**New files:**

```
telemetry/src/hooks/
  extract-project-name.ts          # O2: pure utility
  extract-project-name.test.ts     # O2: unit tests
  script-timing.ts                 # O5: timing store (follows agent-timing.ts)
  script-timing.test.ts            # O5: unit tests
  entrypoints/
    log-script-start.ts            # O5: PreToolUse entry point
    log-script-start.test.ts       # O5: unit tests

telemetry/src/pipes/
  script_performance.ts            # O6: new pipe
  script_performance.test.ts       # O6: unit tests
```

**Modified files:**

```
telemetry/src/datasources/
  skill_activations.ts             # O1: 3 new columns
  agent_activations.ts             # O1: 1 new column
  session_summaries.ts             # O1: 1 new column

telemetry/src/hooks/
  parse-skill-activation.ts        # O3+O4: broadened detection
  parse-skill-activation.test.ts   # O3+O4: new test cases
  parse-agent-start.ts             # O2: project_name param
  parse-agent-start.test.ts        # O2: updated tests
  parse-agent-stop.ts              # O2: project_name param (via event)
  parse-agent-stop.test.ts         # O2: updated tests
  build-session-summary.ts         # O2: project_name from cwd
  build-session-summary.test.ts    # O2: updated tests
  entrypoints/
    log-skill-activation.ts        # O4+O5: broadened guard, script timing
    log-skill-activation.test.ts   # O4+O5: new test cases
    log-agent-start.ts             # O2: pass project_name
    log-agent-start.test.ts        # O2: updated tests
    log-agent-stop.ts              # O2: pass project_name
    log-agent-stop.test.ts         # O2: updated tests
    log-session-summary.ts         # O2: pass project_name
    log-session-summary.test.ts    # O2: updated tests
    ports.ts                       # O5: add ScriptTimingStore type

telemetry/src/pipes/
  skill_frequency.ts               # O6: parent_skill, project_name
  skill_frequency.test.ts          # O6: updated tests
  agent_usage_summary.ts           # O6: project_name filter
  agent_usage_summary.test.ts      # O6: updated tests
  session_overview.ts              # O6: project_name
  session_overview.test.ts         # O6: updated tests
  index.ts                         # O6: export scriptPerformance

telemetry/src/client.ts            # O6: scriptPerformance query

.claude/settings.local.json        # O4+O5: hook registrations

tests/helpers/stub-client.ts       # O6: add scriptPerformance stub
tests/integration/helpers/factories.ts  # O1: updated factories
```

### 10. Ports Type Extensions

```typescript
// telemetry/src/hooks/entrypoints/ports.ts -- additions
export type ScriptTimingStore = {
  readonly recordScriptStart: (toolUseId: string, startMs: number) => void;
  readonly consumeScriptStart: (toolUseId: string, nowMs: number) => number | null;
};
```

The `LogSkillActivationDeps` type gains `scriptTiming: Pick<ScriptTimingStore, 'consumeScriptStart'>`.

---

## Changes (ranked)

Full ID prefix for this initiative: **I17-STSR**. In-doc shorthand: B1, B2, ... Cross-doc or reports: use I17-STSR-B01, I17-STSR-B02, etc.

### Wave 0: Foundation (O0 Spike || O1 Schema -- parallel)

| ID | Change | Charter outcome | Value | Status |
|----|--------|-----------------|-------|--------|
| B1 | **Spike: Validate tool_use_id pairing.** Create minimal test hooks (PreToolUse + PostToolUse + PostToolUseFailure) that log `tool_use_id` and `tool_name` to `/tmp/telemetry-spike/`. Run a live Claude Code session with at least one Bash call and one failing Bash call. Verify: (1) `tool_use_id` present on PreToolUse, (2) same ID on corresponding PostToolUse, (3) `tool_use_id` present on PostToolUseFailure for failed commands, (4) whether PostToolUse fires alongside PostToolUseFailure. Also verify how hooks are currently registered (settings file path, global vs project). Document findings in `.docs/reports/researcher-2026-02-<date>-I17-STSR-tool-use-id-spike.md`. If `tool_use_id` absent/inconsistent, document fallback approach (command-string hashing). **AC:** S-0.1 through S-0.4. **Files:** temporary test hooks (not committed); spike report. **Complexity:** XS (1-2 hours). **Deps:** none | 0 | De-risks all duration pairing work; informs O4 PostToolUseFailure design | todo |
| B2 | **Add `parent_skill`, `resource_path`, `project_name` columns to `skill_activations` datasource.** Update schema in `telemetry/src/datasources/skill_activations.ts`: add `parent_skill: t.string().lowCardinality().nullable()`, `resource_path: t.string()` (default `''`), `project_name: t.string().lowCardinality()` (default `''`). Update `SkillActivationRow` type (derived via `InferRow`). Update existing unit test to reflect 10-column schema. Verify `tinybird build` succeeds against Tinybird Local. **AC:** New columns appear in schema; existing tests updated for new row shape; `pnpm type-check` passes; `pnpm tinybird:build` succeeds. **Files:** `telemetry/src/datasources/skill_activations.ts`, `telemetry/src/datasources/skill_activations.test.ts`. **Complexity:** S (1-2 hours). **Deps:** none | 1 | Unblocks all feature work (O2-O5) that produces rows with new columns | todo |
| B3 | **Add `project_name` column to `agent_activations` datasource.** Update schema in `telemetry/src/datasources/agent_activations.ts`: add `project_name: t.string().lowCardinality()` (default `''`). Update existing unit test. Verify `tinybird build` succeeds. **AC:** New column in schema; type-check passes; tinybird build succeeds. **Files:** `telemetry/src/datasources/agent_activations.ts`, `telemetry/src/datasources/agent_activations.test.ts`. **Complexity:** XS. **Deps:** none | 1 | Unblocks O2 for agent hooks | todo |
| B4 | **Add `project_name` column to `session_summaries` datasource.** Update schema in `telemetry/src/datasources/session_summaries.ts`: add `project_name: t.string().lowCardinality()` (default `''`). Update existing unit test. Verify `tinybird build` succeeds. **AC:** New column in schema; type-check passes; tinybird build succeeds. **Files:** `telemetry/src/datasources/session_summaries.ts`, `telemetry/src/datasources/session_summaries.test.ts`. **Complexity:** XS. **Deps:** none | 1 | Unblocks O2 for session summary hook | todo |
| B5 | **Fix all callers broken by schema type changes.** After B2-B4, `SkillActivationRow`, `AgentActivationRow`, and `SessionSummaryRow` have new required fields. Update all parsers and entry points to populate new fields with defaults: `parent_skill: null`, `resource_path: ''`, `project_name: ''`. Update all existing tests to include new fields in expected values. Update integration test factories (`tests/integration/helpers/factories.ts`) and stub-client (`tests/helpers/stub-client.ts`). **AC:** `pnpm type-check && pnpm test:unit` passes with zero failures; all existing behavior preserved; new fields have empty/null defaults. **Files:** `parse-skill-activation.ts`, `parse-agent-start.ts`, `parse-agent-stop.ts`, `build-session-summary.ts`, all corresponding `.test.ts` files, all entry point `.test.ts` files, `tests/integration/helpers/factories.ts`, `tests/helpers/stub-client.ts`. **Complexity:** M (2-3 hours -- mechanical but touches many files). **Deps:** B2, B3, B4 | 1 | All tests green with new schema; unblocks Wave 1 feature work | todo |

### Wave 1: Feature Slices (O2 || O3 || O4 -- parallel, after B5)

| ID | Change | Charter outcome | Value | Status |
|----|--------|-----------------|-------|--------|
| B6 | **Create `extractProjectName` utility + unit test.** New file `telemetry/src/hooks/extract-project-name.ts`. Pure function: `extractProjectName(cwd: string \| undefined): string`. Uses `path.basename` after stripping trailing slash. Returns `''` for undefined, empty string, or `'/'`. **AC:** S-3.5 (root cwd), S-3.6 (trailing slash), S-3.4 (missing cwd). Tests cover: normal path, trailing slash, root path, undefined, empty string. **Files:** `telemetry/src/hooks/extract-project-name.ts`, `telemetry/src/hooks/extract-project-name.test.ts`. **Complexity:** XS. **Deps:** none (pure utility, no schema dependency) | 2 | Shared utility for all hooks; tested in isolation | todo |
| B7 | **Add project_name to skill activation flow.** Update `parseSkillActivation` to accept `projectName` parameter (default `''`), populate `project_name` field in returned row. Update `log-skill-activation.ts` entry point to extract `cwd` via `extractStringField`, call `extractProjectName`, pass to `parseSkillActivation`. Update all existing tests for `parseSkillActivation` and `log-skill-activation` to include `project_name` in expected rows. **AC:** S-3.1 (skill activation includes project_name), S-3.4 (missing cwd defaults to empty). **Files:** `parse-skill-activation.ts`, `parse-skill-activation.test.ts`, `entrypoints/log-skill-activation.ts`, `entrypoints/log-skill-activation.test.ts`. **Complexity:** S. **Deps:** B5, B6 | 2 | Walking skeleton scenario S-3.1 | todo |
| B8 | **Add project_name to agent start flow.** Update `parseAgentStart` to accept `projectName` parameter (from `cwd` already in Zod schema), populate `project_name` in returned row. Update `log-agent-start.ts` to extract cwd, call `extractProjectName`, pass to parser. Update tests. **AC:** S-3.2 (agent start includes project_name). **Files:** `parse-agent-start.ts`, `parse-agent-start.test.ts`, `entrypoints/log-agent-start.ts`, `entrypoints/log-agent-start.test.ts`. **Complexity:** S. **Deps:** B5, B6 | 2 | Project context on agent activations | todo |
| B9 | **Add project_name to agent stop flow.** Update `parseAgentStop` to accept `projectName` parameter, populate `project_name` in returned row. Update `log-agent-stop.ts` to extract cwd, call `extractProjectName`, pass to parser. Update tests. **AC:** Agent stop rows include project_name. **Files:** `parse-agent-stop.ts`, `parse-agent-stop.test.ts`, `entrypoints/log-agent-stop.ts`, `entrypoints/log-agent-stop.test.ts`. **Complexity:** S. **Deps:** B5, B6 | 2 | Project context on agent stop events (token counts attributed to project) | todo |
| B10 | **Add project_name to session summary flow.** `buildSessionSummary` already has access to `cwd` via its Zod schema (`sessionEndEventSchema`). Extract project_name inside the function using `extractProjectName(event.cwd)`, populate in returned row. Update `log-session-summary` tests. **AC:** S-3.3 (session summary includes project_name). **Files:** `build-session-summary.ts`, `build-session-summary.test.ts`, `entrypoints/log-session-summary.ts`, `entrypoints/log-session-summary.test.ts`. **Complexity:** S. **Deps:** B5, B6 | 2 | Project context on session summaries | todo |
| B11 | **Detect reference file reads in `parseSkillActivation`.** Add `REFERENCE_PATH_PATTERN` regex to `parse-skill-activation.ts`. Extend `extractSkillInfo` to check reference pattern after skill and command patterns. For matches: `entity_type: 'reference'`, `parent_skill: <skill-name>`, `skill_name: <reference-file-name>`, `resource_path: 'references/<file>.md'`. Only `.md` files match. The `tool_name === 'Read'` guard continues to apply. Update `isSkillOrCommandPath` in entry point to also match reference paths. **AC:** S-1.1 (reference read produces row), S-1.2 (nested team dir), S-1.3 (non-md ignored), S-1.4 (non-references dir ignored), S-1.5 (existing SKILL.md still works -- regression), S-1.6 (existing command still works -- regression), S-1.7 (path with "references" outside skills/ ignored). **Files:** `parse-skill-activation.ts`, `parse-skill-activation.test.ts`, `entrypoints/log-skill-activation.ts`, `entrypoints/log-skill-activation.test.ts`. **Complexity:** M (many test cases, careful regex). **Deps:** B5 | 3 | Walking skeleton scenario S-1.1; enables reference usage analytics | todo |
| B12 | **Detect script executions in Bash tool calls.** Extend `parseSkillActivation` to handle `tool_name === 'Bash'` events. Add `SCRIPT_PATH_PATTERN` regex. Parse `tool_input.command` for script paths. Produce rows with `entity_type: 'script'`, `parent_skill`, `skill_name` (filename), `resource_path: 'scripts/<filename>'`. Only `.py` and `.sh` extensions match. Update fast-path guard `isSkillOrCommandPath` -> `isRelevantEvent` to also match Bash events containing `/skills/` and `/scripts/` substrings. `duration_ms` defaults to `0` (populated by O5). **AC:** S-2.4 (non-script Bash ignored), S-2.5 (contains "skills" but not script path ignored), S-2.6 (.ts extension ignored). **Files:** `parse-skill-activation.ts`, `parse-skill-activation.test.ts`, `entrypoints/log-skill-activation.ts`, `entrypoints/log-skill-activation.test.ts`. **Complexity:** M. **Deps:** B5 | 4 | Script detection without duration; unblocks O5 | todo |
| B13 | **Register `log-skill-activation` for PostToolUseFailure events.** Add PostToolUseFailure hook registration in settings. In `log-skill-activation.ts`, handle `hook_event_name === 'PostToolUseFailure'` by setting `success: 0` for script activations. For Read-based activations (skill, command, reference), PostToolUseFailure is handled identically (success from tool_response). **AC:** S-6.2 (PostToolUseFailure for non-script Bash ignored). **Files:** `entrypoints/log-skill-activation.ts`, `entrypoints/log-skill-activation.test.ts`, `.claude/settings.local.json` (or equivalent hook config). **Complexity:** S. **Deps:** B12 | 4 | Failed scripts tracked; timing file consumed on failure path | todo |

### Wave 2: Duration Pairing (O5 -- after B1 + B12)

| ID | Change | Charter outcome | Value | Status |
|----|--------|-----------------|-------|--------|
| B14 | **Create `script-timing.ts` module + unit test.** New file `telemetry/src/hooks/script-timing.ts` following `agent-timing.ts` patterns exactly. Functions: `recordScriptStart(toolUseId, startMs)`, `consumeScriptStart(toolUseId, nowMs)`. Directory: `/tmp/telemetry-script-timing/`. Includes `safePath` for path traversal protection. `consumeScriptStart` returns `null` for stale files (>1 hour). **AC:** S-2.7 (stale timing file ignored). Tests: record + consume round-trip, missing file returns null, stale file returns null and is deleted, path traversal blocked, directory created on first write. **Files:** `telemetry/src/hooks/script-timing.ts`, `telemetry/src/hooks/script-timing.test.ts`. **Complexity:** S (follows existing pattern). **Deps:** B1 (spike confirms tool_use_id is usable) | 5 | Timing store for script duration; follows proven agent-timing pattern | todo |
| B15 | **Add `ScriptTimingStore` type to ports.** Add type definition to `telemetry/src/hooks/entrypoints/ports.ts`. **AC:** Type-check passes. **Files:** `entrypoints/ports.ts`. **Complexity:** XS. **Deps:** none | 5 | Type contract for DI | todo |
| B16 | **Create PreToolUse entry point `log-script-start.ts` + unit test.** New file `telemetry/src/hooks/entrypoints/log-script-start.ts`. DI deps: `{ clock, scriptTiming, health }`. Flow: parse stdin -> fast-path exit if not `Bash` tool or command doesn't contain `/skills/` -> regex match script path -> if match + tool_use_id present: `recordScriptStart(tool_use_id, clock.now())`. No network I/O. No Tinybird ingestion. Only local file write. **AC:** S-5.1 (matching command writes timing file), S-5.2 (non-matching no I/O), S-5.3 (non-Bash ignored), S-5.4 (missing tool_use_id skips), S-5.5 (directory created if absent). **Files:** `entrypoints/log-script-start.ts`, `entrypoints/log-script-start.test.ts`. **Complexity:** M. **Deps:** B14, B15 | 5 | Captures start timestamps for duration computation | todo |
| B17 | **Integrate script timing into PostToolUse flow.** Update `LogSkillActivationDeps` type to include `scriptTiming: Pick<ScriptTimingStore, 'consumeScriptStart'>`. In `runLogSkillActivation`, after detecting a script activation: read `tool_use_id`, call `consumeScriptStart(toolUseId, clock.now())`, compute `duration_ms = startMs ? nowMs - startMs : 0`. Pass `duration_ms` to `parseSkillActivation` (new parameter or return-value override). For PostToolUseFailure events: same timing logic but `success: 0`. **AC:** S-2.1 (Python script with duration), S-2.2 (shell script absolute path), S-2.3 (missing timing file defaults to 0), S-6.1 (failed script via PostToolUseFailure with duration), S-6.3 (duplicate events -- second gets duration 0). **Files:** `entrypoints/log-skill-activation.ts`, `entrypoints/log-skill-activation.test.ts`, `entrypoints/ports.ts` (updated deps type). **Complexity:** M. **Deps:** B12, B13, B14, B16 | 5 | Duration data on script execution rows | todo |
| B18 | **Register PreToolUse hook in settings.** Add PreToolUse hook for Bash tool calls pointing to `log-script-start` entry point. Determine correct registration mechanism (from spike B1 findings). **AC:** PreToolUse fires for Bash calls in live session. **Files:** `.claude/settings.local.json` (or equivalent). **Complexity:** XS. **Deps:** B16, B1 (spike determines registration mechanism) | 5 | Activates the PreToolUse timing hook | todo |

### Wave 3: Pipes (O6 -- after B2-B17)

| ID | Change | Charter outcome | Value | Status |
|----|--------|-----------------|-------|--------|
| B19 | **Update `skill_frequency` pipe with sub-resource and project support.** Add `parent_skill` and `project_name` to SELECT, GROUP BY, and output schema. Add optional `project_name` parameter for filtering. Update unit test. **AC:** S-4.1 (entity_type and parent_skill in output), S-4.2 (filter by project_name), S-4.5 (no filter returns all). **Files:** `telemetry/src/pipes/skill_frequency.ts`, `telemetry/src/pipes/skill_frequency.test.ts`. **Complexity:** S. **Deps:** B2 | 6 | Sub-resource breakdowns in existing pipe | todo |
| B20 | **Create `script_performance` pipe + unit test.** New pipe returning avg/p95/max `duration_ms` per script, filterable by `project_name` and time window. Output: `skill_name`, `parent_skill`, `project_name`, `executions`, `successes`, `failures`, `avg_duration_ms`, `p95_duration_ms`, `max_duration_ms`. **AC:** S-4.3 (duration stats per script), S-4.4 (empty result for no data). **Files:** `telemetry/src/pipes/script_performance.ts`, `telemetry/src/pipes/script_performance.test.ts`. **Complexity:** S. **Deps:** B2 | 6 | Primary analytics for identifying slow scripts | todo |
| B21 | **Update `agent_usage_summary` pipe with project filter.** Add optional `project_name` parameter. No change to output columns. Update unit test. **AC:** S-4.4 (filter applies). **Files:** `telemetry/src/pipes/agent_usage_summary.ts`, `telemetry/src/pipes/agent_usage_summary.test.ts`. **Complexity:** XS. **Deps:** B3 | 6 | Per-project agent cost analysis | todo |
| B22 | **Update `session_overview` pipe with project support.** Add `project_name` to SELECT, GROUP BY, and output. Add optional `project_name` param for filtering. Update unit test. **AC:** S-4.5 (project_name in output). **Files:** `telemetry/src/pipes/session_overview.ts`, `telemetry/src/pipes/session_overview.test.ts`. **Complexity:** XS. **Deps:** B4 | 6 | Per-project session drill-down | todo |
| B23 | **Export `scriptPerformance` from pipes barrel + update client.** Add `scriptPerformance` to `src/pipes/index.ts`. Add `scriptPerformance` query method to `TelemetryClient` type and `createTelemetryClient` implementation. Update `project_name` param types on `skillFrequency`, `agentUsageSummary`, `sessionOverview` query methods. Update client unit test and stub-client. **AC:** `pnpm type-check` passes; client exposes all new query methods. **Files:** `src/pipes/index.ts`, `src/client.ts`, `src/client.test.ts`, `tests/helpers/stub-client.ts`. **Complexity:** S. **Deps:** B19, B20, B21, B22 | 6 | Client wiring for all new/updated pipes | todo |
| B24 | **Update integration test factories and pipe integration tests.** Update factories to produce rows with new columns. Add integration tests for `script_performance` pipe against Tinybird Local. Update `skill_frequency` integration test for sub-resource and project filtering. Update `agent_usage_summary` and `session_overview` integration tests for project filtering. **AC:** All integration tests pass against Tinybird Local. **Files:** `tests/integration/helpers/factories.ts`, `tests/integration/**/*.test.ts`. **Complexity:** M. **Deps:** B23 | 6 | End-to-end pipe validation | todo |

### Wave 4: Validation (O7 -- after all)

| ID | Change | Charter outcome | Value | Status |
|----|--------|-----------------|-------|--------|
| B25 | **End-to-end validation and Tinybird deploy.** Run full test suite (`pnpm type-check && pnpm lint && pnpm test:unit && pnpm test:integration`). Verify `tinybird build` succeeds. Deploy to Tinybird production via CI pipeline (`telemetry-deploy.yml`). Verify in live Claude Code session: (1) SKILL.md read -> skill_activations row with project_name, (2) reference read -> row with entity_type=reference and parent_skill, (3) script execution -> row with entity_type=script, duration_ms>0, and parent_skill, (4) failed script -> row with success=0, (5) agent start/stop -> rows with project_name, (6) session summary -> row with project_name, (7) `skill_frequency` pipe returns sub-resource data, (8) `script_performance` pipe returns duration stats. **AC:** Charter success criteria 1-8 all met. **Files:** none (verification only). **Complexity:** M (manual E2E verification). **Deps:** all previous items | 7 | Full system validated in production | todo |

## Parallelization strategy

```
Wave 0:  B1 (spike)                        B2, B3, B4 (schemas -- parallel)
         │                                  │
         │                                  B5 (fix callers -- after B2+B3+B4)
         │                                  │
Wave 1:  │    B6 (extractProjectName)───────┤
         │    │                             │
         │    B7, B8, B9, B10 (project ─────┤ (parallel, after B5+B6)
         │    context -- parallel)          │
         │                                  B11 (references -- after B5)
         │                                  │
         │                                  B12 (scripts -- after B5)
         │                                  │
         │                                  B13 (PostToolUseFailure -- after B12)
         │                                  │
Wave 2:  B14 (script-timing -- after B1)────┤
         │                                  │
         B15 (ports type)                   │
         │                                  │
         B16 (PreToolUse entry -- B14+B15)  │
         │                                  │
         B17 (integrate timing -- B12+B13+B14+B16)
         │
         B18 (register PreToolUse -- B1+B16)
         │
Wave 3:  B19, B20, B21, B22 (pipes -- parallel, after schemas)
         │
         B23 (client wiring -- after B19-B22)
         │
         B24 (integration tests -- after B23)
         │
Wave 4:  B25 (E2E validation + deploy -- after all)
```

**Critical path:** B2 -> B5 -> B12 -> B13 -> B17 -> B25 (schema -> callers -> script detection -> failure handling -> timing integration -> validation)

**Parallel lanes:**
- Lane A (spike): B1 -> B14 -> B16 -> B18
- Lane B (schema + callers): B2+B3+B4 -> B5 -> B7+B8+B9+B10 (project context)
- Lane C (detection): B5 -> B11 (references) || B12 -> B13 (scripts + failure)
- Lane D (pipes): B19+B20+B21+B22 -> B23 -> B24

## Complexity estimates

| Size | Items | Estimated hours |
|------|-------|-----------------|
| XS   | B1, B3, B4, B6, B15, B18, B21, B22 | 1-2h each |
| S    | B2, B7, B8, B9, B10, B14, B16, B19, B20, B23 | 2-3h each |
| M    | B5, B11, B12, B13, B17, B24, B25 | 3-5h each |

**Total estimated effort:** 55-80 hours (2-3 developer-weeks)

## Backlog item lens (per charter)

- **Charter outcome:** Listed in table per item.
- **Value/impact:** Each item unblocks the next wave or delivers a charter capability.
- **Engineering:** Tinybird SDK schema changes, Zod-based hook parsing, file-based timing store, SQL pipes. TDD with co-located tests. TypeScript strict mode.
- **Security/privacy:** No new credentials; reuses existing TB_INGEST_TOKEN/TB_READ_TOKEN. `safePath` prevents timing file path traversal. No content fields read from Bash tool responses.
- **Observability:** All hooks log to `telemetry_health`. Script timing files are consumed (no leak). Stale files cleaned after 1 hour.
- **Rollback:** Remove new hook registrations from settings. New columns have defaults -- existing queries unaffected. Pipe changes are additive (new columns, new params with defaults).
- **Acceptance criteria:** Per charter acceptance scenarios (S-x.y). Each item references specific scenarios.
- **Definition of done:** Tests pass (unit + integration where applicable), type-check clean, lint clean, format clean, Tinybird build succeeds, CI green.

## Risk gates

| Gate | When | Condition | Fallback |
|------|------|-----------|----------|
| After B1 | Before Wave 2 | `tool_use_id` confirmed consistent | Redesign B14-B17 to use command-string hashing |
| After B5 | Before Wave 1 features | All tests green with new schema | Debug type cascade before proceeding |
| After B11+B12 | Before Wave 2 | Walking skeleton scenarios S-1.1, S-3.1, S-1.5 pass | Debug detection logic before adding duration |
| After B24 | Before deploy | All integration tests pass against Tinybird Local | Fix pipe SQL before production deploy |

## Links

- Charter: [charter-repo-I17-STSR-skill-telemetry-sub-resources.md](../charters/charter-repo-I17-STSR-skill-telemetry-sub-resources.md)
- Roadmap: [roadmap-repo-I17-STSR-skill-telemetry-sub-resources-2026.md](../roadmaps/roadmap-repo-I17-STSR-skill-telemetry-sub-resources-2026.md)
- Research report: [researcher-2026-02-21-I17-STSR-telemetry-sub-resources.md](../../reports/researcher-2026-02-21-I17-STSR-telemetry-sub-resources.md)
- Parent initiative (I05-ATEL): [charter-repo-agent-telemetry.md](../charters/charter-repo-agent-telemetry.md)
