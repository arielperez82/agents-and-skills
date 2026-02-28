---
type: plan
endeavor: repo
initiative: I05-ATEL
initiative_name: agent-telemetry
subject: telemetry-data-quality
status: done
created: 2026-02-18
---

# Plan: I05-ATEL — Telemetry Data Quality Fixes

Addresses all issues from the health audit (`report-telemetry-health-audit-20260218.md`).
Organized into three waves by priority. Each step is TDD-executable.

**Source of truth for field names:** `researcher-260218-claude-code-hooks-json-schema.md`
(official Claude Code docs, fetched 2026-02-18).

---

## Key Findings (pre-plan diagnosis)

Before the waves, two root-cause clarifications the plan depends on:

### RC-1: SubagentStart/SubagentStop actual payloads (confirmed mismatch)

The official schema (`researcher-260218-claude-code-hooks-json-schema.md`) shows:

**SubagentStart** — extra fields beyond common: `agent_id`, `agent_type` only.
- `parent_session_id` — NOT present (only `session_id`, which is the parent's session)
- `agent_transcript_path` — NOT present at start time
- `timestamp` — NOT present (common fields don't include it per official docs)
- `duration_ms` — NOT present

**SubagentStop** — extra fields beyond common: `stop_hook_active`, `agent_id`, `agent_type`, `agent_transcript_path`.
- `parent_session_id` — NOT present
- `duration_ms` — NOT present (earlier research report said it was; official schema says not)
- `success` — NOT present
- `error` — NOT present
- `timestamp` — NOT present

**SessionEnd** — extra fields beyond common: `reason` only.
- `duration_ms` — NOT present (earlier research said it was; official schema says not)
- `timestamp` — NOT present

**Conclusion:** The `subagentStopSchema` in `parse-agent-stop.ts` already correctly omits
these (it marks `stop_hook_active`, `transcript_path`, `permission_mode`,
`hook_event_name` as optional). The parsers are correct. The 27–43% failure rates
must stem from somewhere else — most likely from the `log-skill-activation` hook
throwing exceptions that pollute the health log with misleading hook names, OR from
a separate validation layer not visible in the provided source files.

### RC-2: Skill activation 79.5% failure root cause

`parse-skill-activation.ts` already handles non-skill reads by returning `null`.
`log-skill-activation.ts` already guards `if (!row) return`. The `Unexpected end of JSON
input` error means the hook is receiving malformed/empty stdin on some invocations —
specifically when the hook fires but Claude Code sends an incomplete payload (e.g.,
truncation during large tool responses). The fix is to wrap JSON.parse in a try/catch
at the entrypoint level before calling the parser, and emit a health event for silent
drops rather than hard errors.

### RC-3: `est_cost_usd` always $0

`parseTranscriptTokens` correctly reads `costUSD` from transcript rows. The $0 values
mean the transcript files have 0 `costUSD` on all `assistant` rows — Claude Code may
be writing `0` or omitting `costUSD` in some versions. The fix is to add a
per-model price fallback: if `costUSD` is 0 or absent, compute from token counts
using known pricing.

### RC-4: `agents_used`/`skills_used` always empty

`buildSessionSummary` hardcodes `agents_used: []` and `skills_used: []`. The session
transcript contains subagent invocations as `type: tool_use` rows with `name: "Task"`
and skill reads as `type: tool_use` rows with `name: "Read"`. Parsing these from the
session transcript is feasible without reading message content.

### RC-5: 22 empty `agent_type` rows

These are SubagentStart events where the `agent_type` field in the Claude Code payload
is either empty string or absent. The Zod schema requires it (`z.string()`) but an
empty string passes validation. Add a guard to skip ingestion when `agent_type` is blank.

---

## Wave 1 — Stop Data Loss (P0)

Target: Drive hook failure rates below 10%.

---

### B40-P1.1 — Guard skill-activation entrypoint against malformed stdin

**Backlog item:** New (post-audit fix, part of B33 verification remediation)
**Failure addressed:** log-skill-activation 79.5% failure (`Unexpected end of JSON input`)

#### Problem

When Claude Code sends a large file read response, the PostToolUse stdin can be
truncated or malformed. `parseSkillActivation` calls `JSON.parse` which throws.
The thrown error is caught by `runLogSkillActivation`'s catch block and logged as
a failure health event — even though it is not a real failure (the hook simply
received bad input it cannot process).

#### Files to modify

- `telemetry/src/hooks/entrypoints/log-skill-activation.ts` (lines 16–30)
- `telemetry/src/hooks/entrypoints/log-skill-activation.test.ts`

#### What to change

Add a pre-parse guard in `runLogSkillActivation`. If `eventJson` is empty or
`JSON.parse` fails, exit silently (no health event — this is not a hook failure,
it is a Claude Code delivery artifact).

```typescript
// BEFORE (simplified):
try {
  const row = parseSkillActivation(eventJson);
  if (!row) return;
  await client.ingest.skillActivations(row);
  void logHealthEvent(client, HOOK_NAME, 0, ...);
} catch (error) {
  void logHealthEvent(client, HOOK_NAME, 1, ...);  // logged even for parse errors
}

// AFTER:
// Step 1: fast JSON validity check before any parse attempt
if (!eventJson.trim()) return;
let rawParsed: unknown;
try {
  rawParsed = JSON.parse(eventJson);
} catch {
  // Malformed stdin from Claude Code — not a hook failure, exit silently
  return;
}
// Step 2: check file_path pattern BEFORE full schema parse (fast-path rejection)
const filePath = (rawParsed as Record<string, unknown>)?.['tool_input'];
// ... extract file_path, check SKILL/command pattern
// Step 3: only run full parseSkillActivation if path matches
try {
  const row = parseSkillActivation(eventJson);
  if (!row) return;
  ...
}
```

Actually the cleanest approach: extract `tool_input.file_path` cheaply, check the
pattern, return early if no match (no health event), then call `parseSkillActivation`
only for matching paths.

**Exact change to `log-skill-activation.ts`:**

```typescript
const SKILL_PATH_PATTERN = /\/skills\/[^/]+\/[^/]+\/SKILL\.md$/;
const COMMAND_PATH_PATTERN = /\/commands\/[^/]+\/[^/]+\.md$/;

const isSkillOrCommandPath = (eventJson: string): boolean => {
  try {
    const parsed: unknown = JSON.parse(eventJson);
    if (typeof parsed !== 'object' || parsed === null) return false;
    const toolInput = (parsed as Record<string, unknown>)['tool_input'];
    if (typeof toolInput !== 'object' || toolInput === null) return false;
    const filePath = (toolInput as Record<string, unknown>)['file_path'];
    if (typeof filePath !== 'string') return false;
    return SKILL_PATH_PATTERN.test(filePath) || COMMAND_PATH_PATTERN.test(filePath);
  } catch {
    return false;
  }
};

export const runLogSkillActivation = async (eventJson: string): Promise<void> => {
  const startTime = Date.now();
  const client = createClientFromEnv();
  if (!client) return;

  // Fast path: skip non-skill/command reads without any health event
  if (!isSkillOrCommandPath(eventJson)) return;

  try {
    const row = parseSkillActivation(eventJson);
    if (!row) return;
    await client.ingest.skillActivations(row);
    void logHealthEvent(client, HOOK_NAME, 0, Date.now() - startTime, null, null);
  } catch (error) {
    void logHealthEvent(client, HOOK_NAME, 1, Date.now() - startTime,
      error instanceof Error ? error.message : 'Unknown error', null);
  }
};
```

Note: The regex patterns here are slightly more permissive than `parse-skill-activation.ts`
(which has `\/skills\/[^/]+\/([^/]+)\/SKILL\.md$`). They must match the same paths.
Use the same patterns from the parser to avoid divergence — import them or keep them
in sync via a shared constant.

#### Test approach

Add to `log-skill-activation.test.ts`:

1. `it('exits silently and emits no health event for non-JSON stdin')` — pass `''` and
   `'truncated {'` as `eventJson`, assert no health ingest call fired.
2. `it('exits silently and emits no health event for regular file reads')` — pass a valid
   PostToolUse event for `/src/index.ts`, assert no ingest call fired (already tested
   but verify no health event either).
3. `it('emits success health event only for skill file reads')` — existing test extended
   to assert health ingest was called with exit_code=0.
4. `it('emits failure health event when skill ingest throws')` — mock ingest to throw,
   assert health event with exit_code=1.

#### Verification

After deploy, monitor `telemetry_health_summary` for `hook_name = 'log-skill-activation'`.
Expected: failure_rate drops from 79.5% to <5% (only genuine Tinybird errors should fail).
The invocation count should drop significantly too (only skill/command reads trigger
health events now).

#### Dependencies

None. This is the highest-impact, lowest-risk fix.

---

### B40-P1.2 — Fix empty `agent_type` ingestion guard in `parse-agent-start.ts`

**Failure addressed:** 22 rows with empty `agent_type` polluting agent analytics

#### Files to modify

- `telemetry/src/hooks/parse-agent-start.ts` (after line 17)
- `telemetry/src/hooks/parse-agent-start.test.ts`

#### What to change

After Zod parse succeeds, add a guard: if `agent_type` is empty string, throw with a
descriptive message. The entrypoint's catch block will log a health event for this
case, making it visible in `telemetry_health`.

```typescript
export const parseAgentStart = (eventJson: string): AgentActivationRow => {
  const parsed: unknown = JSON.parse(eventJson);
  const event = subagentStartSchema.parse(parsed);

  if (!event.agent_type.trim()) {
    throw new Error('agent_type is empty — skipping ingestion');
  }

  return { ... };
};
```

Alternatively, skip silently in the entrypoint without a health event (since this is
a Claude Code data quality issue, not a hook failure). The health-event approach is
preferred for observability: it shows how often Claude Code sends empty agent_type.

#### Test approach

Add to `parse-agent-start.test.ts`:

1. `it('throws when agent_type is empty string')` — call `parseAgentStart` with
   `agent_type: ''`, expect throw.
2. `it('throws when agent_type is whitespace only')` — `agent_type: '   '`, expect throw.

#### Verification

After deploy: zero rows with empty `agent_type` in new data. Query `agent_usage_summary`
— the `*(empty)*` row disappears from results.

#### Dependencies

None (parallel with P1.1).

---

### B40-P1.3 — Verify and fix `parse-agent-stop.ts` schema alignment

**Failure addressed:** log-agent-stop 27.3% failure

#### Analysis

The official schema confirms SubagentStop does NOT send `parent_session_id`,
`duration_ms`, `success`, `error`, or `timestamp`. The current `subagentStopSchema`
in `parse-agent-stop.ts` does not include these fields — it only requires
`session_id`, `agent_id`, `agent_type`, `agent_transcript_path`, `cwd`,
plus optional `stop_hook_active`, `transcript_path`, `permission_mode`,
`hook_event_name`. This looks correct.

The 27.3% failure rate must come from one of:
(a) `agent_transcript_path` being absent on some SubagentStop events, OR
(b) `fs.readFileSync` failing on the transcript (file not found / race condition), OR
(c) a different failure path not visible in the current source

`agent_transcript_path` IS in the official SubagentStop schema — it should always
be present. Most likely cause: (b) the transcript file is written asynchronously and
may not exist yet when the hook fires.

#### Files to modify

- `telemetry/src/hooks/entrypoints/log-agent-stop.ts` (lines 20–27)
- `telemetry/src/hooks/parse-agent-stop.ts` (line 11 — make `agent_transcript_path` optional)
- `telemetry/src/hooks/entrypoints/log-agent-stop.test.ts`
- `telemetry/src/hooks/parse-agent-stop.test.ts`

#### What to change

**In `parse-agent-stop.ts`:** Make `agent_transcript_path` optional in the schema to
handle cases where the field might be absent. Default to empty string when missing.

```typescript
const subagentStopSchema = z.object({
  session_id: z.string(),
  agent_id: z.string(),
  agent_type: z.string(),
  agent_transcript_path: z.string().optional(),  // was required
  cwd: z.string(),
  stop_hook_active: z.boolean().optional(),
  transcript_path: z.string().optional(),
  permission_mode: z.string().optional(),
  hook_event_name: z.string().optional(),
});
```

Also add the empty-agent_type guard (same as P1.2):

```typescript
if (!event.agent_type.trim()) {
  throw new Error('agent_type is empty — skipping ingestion');
}
```

**In `log-agent-stop.ts` `readTranscriptContent`:** Add a retry with a short delay
(50ms, 1 attempt) for the file-not-found case, since transcripts may not be flushed yet.

```typescript
const readTranscriptContent = (transcriptPath: string | null): string => {
  if (!transcriptPath) return '';
  try {
    return fs.readFileSync(transcriptPath, 'utf-8');
  } catch {
    // File may not be flushed yet — try once after a brief pause
    // (synchronous 50ms wait using busy-wait to stay in sync context)
    const start = Date.now();
    while (Date.now() - start < 50) { /* busy wait */ }
    try {
      return fs.readFileSync(transcriptPath, 'utf-8');
    } catch {
      return '';
    }
  }
};
```

Note: Busy-wait is acceptable here because the hook is a short-lived process where
a 50ms pause is inconsequential and avoids the complexity of async timers in a
sync context.

#### Test approach

Add to `parse-agent-stop.test.ts`:

1. `it('succeeds when agent_transcript_path is missing')` — pass event without the field,
   expect valid row with zero tokens.

Add to `log-agent-stop.test.ts`:

2. `it('ingests with zero tokens when transcript file does not exist')` — pass
   event with nonexistent path, assert ingest fires with zero token fields.

#### Verification

Monitor `telemetry_health` for `log-agent-stop`. Expected: failure rate drops to <5%.
Remaining failures should only be genuine Tinybird ingest errors.

#### Dependencies

B40-P1.2 for the empty `agent_type` guard pattern (copy the pattern, do not import).

---

### B40-P1.4 — Verify and fix `build-session-summary.ts` schema alignment

**Failure addressed:** log-session-summary 42.9% failure

#### Analysis

The official SessionEnd schema shows: `session_id`, `transcript_path`, `cwd`,
`permission_mode`, `hook_event_name` (common) plus `reason` (extra). No `duration_ms`,
no `timestamp`. The current `sessionEndEventSchema` in `build-session-summary.ts`
requires `session_id` and `transcript_path` — both confirmed present. The 42.9%
failure is reported as "Missing `duration_ms`, `timestamp`" but neither is in the
current schema. This suggests the health log's `last_error` field reflects an older
error that predates the schema fixes.

If the current schema is already correct, the 42.9% failure rate may be due to:
(a) The transcript file not existing at SessionEnd time (file deleted or path wrong), OR
(b) A Tinybird ingest error (arrays in `agents_used`/`skills_used` serialized incorrectly)

The most likely current cause: `agents_used: []` and `skills_used: []` serialize
correctly as `[]` in JSON. However, the `jsonPath: '$.agents_used[:]'` on the
datasource requires the field to be present in the NDJSON payload. Verify the
Tinybird SDK serializes empty arrays correctly.

#### Files to modify

- `telemetry/src/hooks/build-session-summary.ts` — add transcript-missing logging
- `telemetry/src/hooks/entrypoints/log-session-summary.ts` — add better error context
- `telemetry/src/hooks/build-session-summary.test.ts`

#### What to change

**In `log-session-summary.ts`:** Add explicit handling when `transcript_path` is missing
from the event (graceful degradation: build summary with empty transcript):

```typescript
const readTranscriptPath = (eventJson: string): string | null => {
  try {
    const parsed: unknown = JSON.parse(eventJson);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const transcriptPath = (parsed as Record<string, unknown>)['transcript_path'];
    return typeof transcriptPath === 'string' && transcriptPath.length > 0
      ? transcriptPath
      : null;
  } catch {
    return null;
  }
};
```

The current implementation already does this. The issue is likely the SessionEnd
schema requires `transcript_path` (non-optional `z.string()`) but Claude Code may
occasionally not include it. Make it optional:

**In `build-session-summary.ts`:**

```typescript
const sessionEndEventSchema = z.object({
  session_id: z.string(),
  transcript_path: z.string().optional(),  // was required
  cwd: z.string(),
  reason: z.string().optional(),
  permission_mode: z.string().optional(),
  hook_event_name: z.string().optional(),
});
```

When `transcript_path` is absent, `buildSessionSummary` gets an empty string from
`readTranscriptContent(null)` and produces a zero-token summary. This is correct
behavior — better to record the session with zeros than to drop the row.

#### Test approach

Add to `build-session-summary.test.ts`:

1. `it('succeeds with zero tokens when transcript_path is absent from event')` — pass
   event without `transcript_path`, expect valid row with zero tokens, session_id preserved.

Add to `log-session-summary.test.ts`:

2. `it('ingests session with zero tokens when transcript_path missing from event')` —
   assert ingest fires and health event is success even with missing path.

#### Verification

Monitor `telemetry_health` for `log-session-summary`. Expected: failure rate drops to <5%.
Session count in `session_overview` should increase to match actual session count.

#### Dependencies

None (parallel with P1.1, P1.2, P1.3).

---

## Wave 2 — Fill Data Gaps (P1)

Target: Populate `est_cost_usd`, `agents_used`, `skills_used`, and `duration_ms` fields.

---

### B41-P2.1 — Add per-model pricing fallback to `parseTranscriptTokens`

**Gap addressed:** `est_cost_usd` always $0 in `agent_activations` and `session_summaries`

#### Analysis

`parseTranscriptTokens` correctly reads `costUSD` from transcript rows. The $0 values
mean Claude Code is writing `costUSD: 0` (or omitting it) in the local transcript.
The fix: compute cost from token counts using published Anthropic pricing when `costUSD`
is 0 or absent. Use the model field (already extracted) to look up the rate.

**Published pricing (as of Feb 2026, per million tokens):**
- `claude-opus-4-*`: input $15, output $75, cache-read $1.50, cache-write $18.75
- `claude-sonnet-4-*`: input $3, output $15, cache-read $0.30, cache-write $3.75
- `claude-haiku-4-*`: input $0.80, output $4, cache-read $0.08, cache-write $1
- Default (unknown): use Sonnet rates as conservative estimate

These rates should be in a constant table — easy to update when pricing changes.

#### Files to modify

- `telemetry/src/hooks/parse-transcript-tokens.ts` (add pricing table + compute function)
- `telemetry/src/hooks/parse-transcript-tokens.test.ts` (add cost computation tests)

#### New code in `parse-transcript-tokens.ts`

```typescript
type ModelPricing = {
  readonly inputPerMillion: number;
  readonly outputPerMillion: number;
  readonly cacheReadPerMillion: number;
  readonly cacheWritePerMillion: number;
};

const MODEL_PRICING: ReadonlyArray<readonly [string, ModelPricing]> = [
  ['claude-opus', { inputPerMillion: 15, outputPerMillion: 75,
                    cacheReadPerMillion: 1.5, cacheWritePerMillion: 18.75 }],
  ['claude-sonnet', { inputPerMillion: 3, outputPerMillion: 15,
                      cacheReadPerMillion: 0.3, cacheWritePerMillion: 3.75 }],
  ['claude-haiku', { inputPerMillion: 0.8, outputPerMillion: 4,
                     cacheReadPerMillion: 0.08, cacheWritePerMillion: 1 }],
];

const DEFAULT_PRICING: ModelPricing = MODEL_PRICING[1][1]; // Sonnet as default

const getPricing = (model: string): ModelPricing => {
  const entry = MODEL_PRICING.find(([prefix]) => model.includes(prefix));
  return entry?.[1] ?? DEFAULT_PRICING;
};

const computeCost = (
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number,
  cacheCreationTokens: number,
): number => {
  const pricing = getPricing(model);
  return (
    (inputTokens * pricing.inputPerMillion +
     outputTokens * pricing.outputPerMillion +
     cacheReadTokens * pricing.cacheReadPerMillion +
     cacheCreationTokens * pricing.cacheWritePerMillion) / 1_000_000
  );
};
```

In the accumulator loop, when `row.costUSD` is 0 or undefined AND token counts are
non-zero, compute from pricing table:

```typescript
const rowCost = (row.costUSD !== undefined && row.costUSD > 0)
  ? row.costUSD
  : computeCost(
      row.message.model ?? model,
      usage?.input_tokens ?? 0,
      usage?.output_tokens ?? 0,
      usage?.cache_read_input_tokens ?? 0,
      usage?.cache_creation_input_tokens ?? 0,
    );
costUsd += rowCost;
```

#### Test approach

Add to `parse-transcript-tokens.test.ts`:

1. `describe('cost computation')`:
   - `it('uses costUSD from transcript when non-zero')` — row with costUSD=0.003, verify
     est_cost_usd equals 0.003 (no pricing override).
   - `it('computes cost from tokens when costUSD is 0')` — row with costUSD=0 and
     input_tokens=1000, output_tokens=500 for claude-sonnet model. Verify
     est_cost_usd = (1000*3 + 500*15) / 1_000_000 = 0.0105.
   - `it('computes cost from tokens when costUSD is absent')` — row without `costUSD`
     field, same verification.
   - `it('uses opus pricing for claude-opus-4 model')` — verify higher rate.
   - `it('uses haiku pricing for claude-haiku model')` — verify lower rate.
   - `it('falls back to sonnet pricing for unknown model')` — model='unknown', verify
     sonnet rates applied.
   - `it('returns 0 cost when all token counts are 0')` — no tokens, costUSD=0,
     expect est_cost_usd=0.

#### Verification

After deploy: query `agent_usage_summary` — `est_cost_usd` column should show non-zero
values for agents that had actual token usage. Cross-check: researcher agent with
~26K input tokens at Sonnet rates ≈ $0.078 for input alone. The $0.00 in the audit
data should become meaningful values.

#### Dependencies

None. Standalone change to the transcript parser.

---

### B41-P2.2 — Extract `agents_used` and `skills_used` from session transcript

**Gap addressed:** `agents_used`/`skills_used` always `[]` in `session_summaries`

#### Analysis

The session transcript (referenced by `SessionEnd.transcript_path`) contains all
tool calls. Subagent invocations appear as `type: "tool_use"` rows with `name: "Task"`.
Skill/command reads appear as `type: "tool_use"` rows with `name: "Read"` and
`input.file_path` matching the skill/command patterns.

The current `parseTranscriptTokens` only processes `type: "assistant"` rows. We need
a second pass (or an extension) that extracts:
- `agents_used`: unique agent names from Task tool invocations
- `skills_used`: unique skill/command names from matching Read invocations
- `agent_count`: count of Task tool invocations
- `skill_count`: count of matching Read invocations

**Transcript row shapes (from research report):**
- Tool use rows have `type: "tool_use"`, `name: <tool_name>`, `input: <object>`
- For Task: `input.description` or `input.agent` or similar — need to check actual shape
- The research report confirms `type: "tool_use"` rows contain tool calls

**Important constraint:** The `parseTranscriptTokens` function must remain content-safe.
Tool use rows do not contain user/assistant text content — they contain tool parameters
which are safe to read.

#### New file: `telemetry/src/hooks/parse-transcript-agents.ts`

```typescript
import { z } from 'zod';

const taskToolUseSchema = z.object({
  type: z.literal('tool_use'),
  name: z.literal('Task'),
  input: z.object({
    description: z.string().optional(),
    agent_type: z.string().optional(),  // if present
  }).passthrough(),
});

const readToolUseSchema = z.object({
  type: z.literal('tool_use'),
  name: z.literal('Read'),
  input: z.object({
    file_path: z.string(),
  }).passthrough(),
});

const SKILL_PATH_PATTERN = /\/skills\/[^/]+\/([^/]+)\/SKILL\.md$/;
const COMMAND_PATH_PATTERN = /\/commands\/([^/]+\/[^/]+)\.md$/;

export type TranscriptAgentSummary = {
  readonly agents_used: readonly string[];
  readonly skills_used: readonly string[];
  readonly agent_count: number;
  readonly skill_count: number;
};

export const parseTranscriptAgents = (content: string): TranscriptAgentSummary => {
  if (!content.trim()) {
    return { agents_used: [], skills_used: [], agent_count: 0, skill_count: 0 };
  }

  const agentSet = new Set<string>();
  const skillSet = new Set<string>();

  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    let parsed: unknown;
    try { parsed = JSON.parse(trimmed); } catch { continue; }

    // Check for Task tool use (subagent invocation)
    const taskResult = taskToolUseSchema.safeParse(parsed);
    if (taskResult.success) {
      const agentType = taskResult.data.input.agent_type
        ?? taskResult.data.input.description
        ?? 'unknown';
      agentSet.add(agentType);
      continue;
    }

    // Check for Read tool use matching skill/command path
    const readResult = readToolUseSchema.safeParse(parsed);
    if (readResult.success) {
      const filePath = readResult.data.input.file_path;
      const skillMatch = SKILL_PATH_PATTERN.exec(filePath);
      if (skillMatch?.[1]) { skillSet.add(skillMatch[1]); continue; }
      const cmdMatch = COMMAND_PATH_PATTERN.exec(filePath);
      if (cmdMatch?.[1]) { skillSet.add(cmdMatch[1]); }
    }
  }

  return {
    agents_used: [...agentSet],
    skills_used: [...skillSet],
    agent_count: agentSet.size,
    skill_count: skillSet.size,
  };
};
```

Note on `agent_type` extraction from Task rows: the actual field name depends on how
Claude Code writes Task invocations to the transcript. This must be validated against
a real transcript. The schema uses `.passthrough()` so unknown fields don't break
parsing. If the field name is different, only the constant name changes.

#### Modify `build-session-summary.ts`

```typescript
import { parseTranscriptAgents } from './parse-transcript-agents';

export const buildSessionSummary = (
  eventJson: string,
  transcriptContent: string,
): SessionSummaryRow => {
  const parsed: unknown = JSON.parse(eventJson);
  const event = sessionEndEventSchema.parse(parsed);
  const tokens = parseTranscriptTokens(transcriptContent);
  const agents = parseTranscriptAgents(transcriptContent);  // NEW

  return {
    timestamp: new Date(),
    session_id: event.session_id,
    total_duration_ms: 0,
    agent_count: agents.agent_count,          // was hardcoded 0
    skill_count: agents.skill_count,          // was hardcoded 0
    api_request_count: tokens.api_request_count,
    total_input_tokens: tokens.input_tokens,
    total_output_tokens: tokens.output_tokens,
    total_cache_read_tokens: tokens.cache_read_tokens,
    total_cost_usd: tokens.est_cost_usd,
    agents_used: [...agents.agents_used],     // was hardcoded []
    skills_used: [...agents.skills_used],     // was hardcoded []
    model_primary: tokens.model,
  };
};
```

#### New test file: `telemetry/src/hooks/parse-transcript-agents.test.ts`

1. `it('returns empty summary for empty transcript')`
2. `it('extracts agent names from Task tool_use rows')`
3. `it('extracts skill names from Read tool_use rows matching SKILL.md pattern')`
4. `it('extracts command names from Read tool_use rows matching commands/ pattern')`
5. `it('deduplicates repeated agent/skill invocations')`
6. `it('ignores non-tool_use rows')`
7. `it('ignores Read tool_use for non-skill/command paths')`
8. `it('handles malformed JSON lines without throwing')`
9. `it('counts agents and skills separately')`

#### Modify `build-session-summary.test.ts`

Add test cases with transcript lines containing Task and Read tool_use rows. Assert
that `agents_used`, `skills_used`, `agent_count`, `skill_count` are populated.

#### Verification

After deploy: query `session_overview`. The `agents_used` and `skills_used` columns
should show non-zero values for sessions that used subagents or loaded skills.

**Important caveat:** The exact field name for agent identity in Task tool_use rows
needs verification against a real transcript. The implementation uses a best-guess
schema with `.passthrough()`. Monitor `telemetry_health` after deploy; if `agents_used`
remains empty, inspect a real transcript and adjust the schema.

#### Dependencies

B41-P2.1 (none — parallel is fine, but ordering for review: P2.1 first so cost data
is available when P2.2 tests run in integration).

---

### B41-P2.3 — Compute `duration_ms` for agents from paired start/stop events

**Gap addressed:** `duration_ms` always 0 in `agent_activations`

#### Analysis

Claude Code does not send `duration_ms` in SubagentStart or SubagentStop events
(confirmed by official schema). Timestamps are also not in the event payloads.
The only available approach:
- At SubagentStart: record wall-clock time in a local temp file keyed by `agent_id`
- At SubagentStop: read the start time, compute diff, write `duration_ms` to the row

This requires a side-channel: a small JSON file in the OS temp directory.

#### New file: `telemetry/src/hooks/agent-timing.ts`

```typescript
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const TIMING_DIR = path.join(os.tmpdir(), 'telemetry-agent-timing');

const timingPath = (agentId: string): string =>
  path.join(TIMING_DIR, `${agentId}.json`);

export const recordAgentStart = (agentId: string, startMs: number): void => {
  try {
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(timingPath(agentId), JSON.stringify({ startMs }));
  } catch { /* best-effort */ }
};

export const consumeAgentStart = (agentId: string): number | null => {
  const p = timingPath(agentId);
  try {
    const content = fs.readFileSync(p, 'utf-8');
    fs.unlinkSync(p);  // consume (delete) after reading
    const data: unknown = JSON.parse(content);
    if (typeof data === 'object' && data !== null && 'startMs' in data) {
      return typeof (data as Record<string, unknown>)['startMs'] === 'number'
        ? ((data as Record<string, unknown>)['startMs'] as number)
        : null;
    }
    return null;
  } catch { return null; }
};
```

#### Modify `log-agent-start.ts`

After successful ingest, record start time:

```typescript
import { recordAgentStart } from '@/hooks/agent-timing';

export const runLogAgentStart = async (eventJson: string): Promise<void> => {
  ...
  try {
    const row = parseAgentStart(eventJson);
    // Record start time before ingest (even if ingest fails, timing is useful)
    const agentId = extractAgentId(eventJson);  // lightweight JSON.parse
    if (agentId) recordAgentStart(agentId, startTime);
    await client.ingest.agentActivations(row);
    ...
  }
};

const extractAgentId = (eventJson: string): string | null => {
  try {
    const p: unknown = JSON.parse(eventJson);
    if (typeof p !== 'object' || p === null) return null;
    const id = (p as Record<string, unknown>)['agent_id'];
    return typeof id === 'string' ? id : null;
  } catch { return null; }
};
```

#### Modify `parse-agent-stop.ts`

Pass `durationMs` as a parameter rather than hardcoding 0:

```typescript
export const parseAgentStop = (
  eventJson: string,
  transcriptContent: string,
  durationMs: number = 0,  // new parameter with default
): AgentActivationRow => {
  ...
  return {
    ...
    duration_ms: durationMs,  // was hardcoded 0
    ...
  };
};
```

#### Modify `log-agent-stop.ts`

Consume the start time and compute duration:

```typescript
import { consumeAgentStart } from '@/hooks/agent-timing';

export const runLogAgentStop = async (eventJson: string): Promise<void> => {
  const hookStartTime = Date.now();
  ...
  try {
    const transcriptPath = readTranscriptPath(eventJson);
    const transcriptContent = readTranscriptContent(transcriptPath);
    const agentId = extractAgentId(eventJson);
    const agentStartMs = agentId ? consumeAgentStart(agentId) : null;
    const durationMs = agentStartMs !== null ? hookStartTime - agentStartMs : 0;
    const row = parseAgentStop(eventJson, transcriptContent, durationMs);
    ...
  }
};
```

#### New test file: `telemetry/src/hooks/agent-timing.test.ts`

1. `it('records start time and returns it on consume')`
2. `it('returns null on consume when no record exists for agentId')`
3. `it('deletes the record after consuming it (each agentId consumed once)')`
4. `it('handles concurrent agents with different agentIds independently')`
5. `it('returns null gracefully when temp dir is not writable')`

#### Modify `parse-agent-stop.test.ts`

Update existing tests to pass `durationMs` parameter. Add:
- `it('uses provided durationMs in the row')`
- `it('defaults durationMs to 0 when not provided')`

#### Verification

After deploy: `agent_activations` rows with `event='stop'` should show non-zero
`duration_ms` values for agents that had corresponding `event='start'` rows in the
same Claude Code process run. The `optimization_insights` endpoint `avg_cost_per_invocation`
remains valid; `avg_tokens` and frequency data improve in reliability.

**Caveat:** Timing data only works when both start and stop hooks run in the same
OS process context (same machine, session). Cross-machine or session-restart scenarios
yield 0. This is acceptable.

#### Dependencies

B40-P1.3 (verifying start/stop schema alignment first is recommended).

---

### B41-P2.4 — Retire `api_requests` datasource or wire it

**Gap addressed:** `api_requests` datasource has zero rows; `cost_by_model` returns nothing

#### Decision

Two options:
1. **Populate from transcript**: During `log-agent-stop`, emit individual rows to
   `api_requests` for each `assistant` row in the transcript (one row per API call).
2. **Remove the datasource and `cost_by_model` pipe**: Derive cost-by-model data from
   `agent_activations` (which already has `model` and `est_cost_usd`).

**Recommendation: Option 2 (remove and derive).** Rationale:
- Option 1 requires emitting potentially hundreds of rows per agent stop, increasing
  Tinybird ingest volume and adding complexity to `log-agent-stop`.
- `agent_activations` already has `model` + `est_cost_usd` per agent stop event.
  A pipe over `agent_activations` can produce `cost_by_model` equivalent data.
- YAGNI: the per-API-call granularity `api_requests` was designed for is not needed
  given current analytics requirements.

#### Files to modify

- `telemetry/src/pipes/cost_by_model.ts` — rewrite SQL to query `agent_activations`
- `telemetry/src/datasources/api_requests.ts` — mark as deprecated (or remove)
- Remove `api_requests` ingest from `src/datasources/index.ts` barrel (if present)
- `telemetry/src/pipes/cost_by_model.test.ts` (integration test update)

#### New SQL for `cost_by_model` pipe

```sql
SELECT
  model,
  sum(input_tokens) AS total_input,
  sum(output_tokens) AS total_output,
  sum(cache_read_tokens) AS total_cache_read,
  sum(est_cost_usd) AS total_cost_usd,
  countIf(event = 'stop') AS request_count,
  countIf(success = 0) AS error_count,
  if(countIf(event = 'stop') > 0,
    countIf(success = 0) / countIf(event = 'stop'), 0) AS error_rate
FROM agent_activations
WHERE event = 'stop'
  AND timestamp >= now() - INTERVAL {{Int32(days, 7)}} DAY
GROUP BY model
ORDER BY total_cost_usd DESC
```

Note: `api_requests` datasource definition can remain in Tinybird (to avoid breaking
the deployed schema) but receive no new data. The pipe changes routing only.

#### Test approach

Update integration test for `cost_by_model` to:
1. Seed `agent_activations` with known model + cost rows
2. Query `cost_by_model` endpoint
3. Assert totals match seeded data

#### Verification

After deploy: `cost_by_model` endpoint returns rows grouped by model with non-zero
values. Cross-check: sum of `total_cost_usd` across all models should equal sum of
`est_cost_usd` in `agent_activations` for the same time window.

#### Dependencies

B41-P2.1 (cost data must be non-zero for this to be meaningful).

---

## Wave 3 — Improve Analytics (P2)

Target: More reliable efficiency scores, time-series trending, agent-skill correlation.

---

### B42-P3.1 — Fix `optimization_insights` efficiency formula

**Gap addressed:** Cache ratios of 1,000–4,600x are unreliable

#### Analysis

The current formula:
```sql
cache_ratio = cache_read_tokens / (input_tokens + output_tokens)
efficiency_score = cache_ratio * log(frequency + 1)
```

Problem: when `input_tokens + output_tokens` is very small (e.g., 25 for
acceptance-designer) but `cache_read_tokens` is 116K, the ratio is 4,656. This is
mathematically correct but analytically useless — it means "116K tokens were served
from cache for this agent invocation." The ratio is not capped.

Better formula: use total tokens processed (including cache) as denominator:
```sql
cache_hit_rate = cache_read_tokens / (input_tokens + output_tokens + cache_read_tokens)
```

This bounds the ratio to [0, 1]. An agent with 116K cache reads and 25 I/O tokens
gets a cache_hit_rate of 116000/(116000+25) ≈ 0.9998. That is accurate and useful.

For efficiency_score, combine cache hit rate with cost efficiency:
```sql
efficiency_score = cache_hit_rate * log(frequency + 1)
```

This rewards agents that: (a) hit cache frequently and (b) are invoked more often.

Additionally: fix the `avg_tokens` metric — it currently computes avg of
`input + output` only. Include cache reads for a complete picture, or keep it as
"direct tokens" and add a `cache_read_avg` column.

#### Files to modify

- `telemetry/src/pipes/optimization_insights.ts` (lines 13–29)

#### New SQL

```sql
SELECT
  agent_type,
  if(count() > 0, sum(est_cost_usd) / count(), 0) AS avg_cost_per_invocation,
  if(count() > 0, sum(input_tokens + output_tokens) / count(), 0) AS avg_tokens,
  count() AS frequency,
  if(sum(input_tokens + output_tokens + cache_read_tokens) > 0,
    sum(cache_read_tokens) / sum(input_tokens + output_tokens + cache_read_tokens),
    0) AS cache_hit_rate,
  if(sum(input_tokens + output_tokens + cache_read_tokens) > 0,
    (sum(cache_read_tokens) / sum(input_tokens + output_tokens + cache_read_tokens))
      * log(count() + 1),
    0) AS efficiency_score
FROM agent_activations
WHERE event = 'stop'
  AND timestamp >= now() - INTERVAL {{Int32(days, 7)}} DAY
  AND agent_type != ''
GROUP BY agent_type
ORDER BY efficiency_score DESC
```

Note: Added `AND agent_type != ''` to exclude the empty-agent_type rows (Belt-and-suspenders
guard alongside the P1.2 fix).

Rename output field `cache_ratio` → `cache_hit_rate` in both the SQL and the pipe
output schema.

#### Files to modify

- `telemetry/src/pipes/optimization_insights.ts`
- Update `OptimizationInsightsRow` type accordingly

#### Test approach

The optimization_insights pipe is an integration test (B21). Update integration test:

1. Seed data with known token distributions:
   - Agent A: 100 input, 50 output, 10,000 cache_read → cache_hit_rate = 10000/10150 ≈ 0.985
   - Agent B: 5000 input, 2000 output, 100 cache_read → cache_hit_rate = 100/7100 ≈ 0.014
2. Assert `cache_hit_rate` is in [0, 1] for all rows.
3. Assert Agent A has higher `efficiency_score` than Agent B (for same frequency).
4. Assert empty agent_type rows are excluded.

#### Verification

After deploy: query `optimization_insights`. The `cache_hit_rate` column should show
values in [0, 1]. `researcher` (high absolute cache reads, high I/O) should have a
moderate cache_hit_rate. The "1000x" values from the audit should be gone.

Update `buildUsageContext.ts` to use `cache_hit_rate` field name instead of
`cache_ratio` (the field was renamed — verify the pipe's output schema name change
is reflected in the TypeScript type and in `build-usage-context.ts` formatting logic).

#### Dependencies

B41-P2.1 (accurate cost data makes avg_cost_per_invocation meaningful).
B40-P1.2 (empty agent_type fix makes the SQL filter redundant but correct defensively).

---

### B42-P3.2 — Add daily trend pipe (`agent_usage_daily`)

**Gap addressed:** No time-series trending; can't see adoption/usage over time

#### New file: `telemetry/src/pipes/agent_usage_daily.ts`

```typescript
import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const agentUsageDaily = defineEndpoint('agent_usage_daily', {
  description: 'Daily agent usage trends for adoption tracking',
  params: {
    days: p.int32().optional(30),
    agent_type: p.string().optional(''),
  },
  nodes: [
    node({
      name: 'agent_usage_daily_node',
      sql: `
        SELECT
          toStartOfDay(timestamp) AS day,
          agent_type,
          countIf(event = 'stop') AS invocations,
          sum(input_tokens + output_tokens) AS total_direct_tokens,
          sum(cache_read_tokens) AS total_cache_read,
          sum(est_cost_usd) AS total_cost_usd
        FROM agent_activations
        WHERE event = 'stop'
          AND timestamp >= now() - INTERVAL {{Int32(days, 30)}} DAY
          AND agent_type != ''
          AND ({{String(agent_type, '')}} = '' OR agent_type = {{String(agent_type, '')}})
        GROUP BY day, agent_type
        ORDER BY day DESC, invocations DESC
      `,
    }),
  ],
  output: {
    day: t.date(),
    agent_type: t.string(),
    invocations: t.uint64(),
    total_direct_tokens: t.uint64(),
    total_cache_read: t.uint64(),
    total_cost_usd: t.float64(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type AgentUsageDailyRow = InferOutputRow<typeof agentUsageDaily>;
```

Add to `telemetry/src/pipes/index.ts` barrel export.

#### Test approach

Integration test (add to B21 test file or new file):

1. Seed `agent_activations` with rows across multiple days (use different timestamps).
2. Query `agent_usage_daily` with `days=7`.
3. Assert rows are grouped by day, with correct invocation counts per day.
4. Test optional `agent_type` filter: filter to one agent, assert only that agent's rows.

#### Verification

After deploy: the new endpoint is visible in Tinybird. Query with `days=30` returns
one row per (day, agent_type) combination. Time-series charts can be built from this.

#### Dependencies

B40-P1.2 (empty agent_type fix — the SQL filter `AND agent_type != ''` provides
additional protection regardless).

---

### B42-P3.3 — Populate `skill_activations.agent_type` via session context

**Gap addressed:** `agent_type` always null in `skill_activations`

#### Analysis

When a subagent reads a skill file, the PostToolUse event fires with the subagent's
`session_id`. There is no `agent_type` field in the PostToolUse event. To populate
`agent_type` in `skill_activations`, we need to know which agent is running in the
current session context.

**Approach: session-scoped agent tracking file**

In `log-agent-start.ts`, write a mapping of `session_id → agent_type` to a temp file
(similar to the timing approach in B41-P2.3). In `log-skill-activation.ts`, read this
mapping to look up the current `agent_type` for the session.

This works because: when a subagent is active, SubagentStart fires (recording
session_id → agent_type), then PostToolUse fires with the same session_id for all
tool calls during that subagent's lifetime.

#### New additions to `agent-timing.ts` (or new file `session-context.ts`)

```typescript
export const recordSessionAgent = (sessionId: string, agentType: string): void => {
  const p = path.join(TIMING_DIR, `session-${sessionId}.json`);
  try {
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(p, JSON.stringify({ agentType }));
  } catch { /* best-effort */ }
};

export const lookupSessionAgent = (sessionId: string): string | null => {
  const p = path.join(TIMING_DIR, `session-${sessionId}.json`);
  try {
    const content = fs.readFileSync(p, 'utf-8');
    const data: unknown = JSON.parse(content);
    if (typeof data === 'object' && data !== null && 'agentType' in data) {
      return typeof (data as Record<string, unknown>)['agentType'] === 'string'
        ? ((data as Record<string, unknown>)['agentType'] as string)
        : null;
    }
    return null;
  } catch { return null; }
};
```

**Note:** Do NOT delete the session file in lookupSessionAgent (unlike agentId timing).
The session file should persist until the SubagentStop fires. Add cleanup in
`log-agent-stop.ts`.

#### Modify `log-agent-start.ts`

After calling `parseAgentStart`, also call `recordSessionAgent(session_id, agent_type)`.

#### Modify `parse-skill-activation.ts`

Add `agentType` parameter:

```typescript
export const parseSkillActivation = (
  eventJson: string,
  agentType: string | null = null,
): SkillActivationRow | null => {
  ...
  return {
    ...
    agent_type: agentType,  // was hardcoded null
    ...
  };
};
```

#### Modify `log-skill-activation.ts`

Look up `agent_type` from the session context file before calling `parseSkillActivation`:

```typescript
import { lookupSessionAgent } from '@/hooks/session-context';

// In runLogSkillActivation, after path check passes:
const sessionId = extractSessionId(eventJson);
const agentType = sessionId ? lookupSessionAgent(sessionId) : null;
const row = parseSkillActivation(eventJson, agentType);
```

#### Test approach

New tests for `session-context.ts`:
1. `it('records and retrieves session agent type')`
2. `it('returns null for unknown session')`
3. `it('does not delete record on lookup')`
4. `it('cleans up on explicit delete call')`

Update `parse-skill-activation.test.ts`:
5. `it('uses provided agentType in the row')`
6. `it('defaults agentType to null when not provided')`

Integration:
7. Simulate SubagentStart → Read skill file → verify `agent_type` populated in
   `skill_activations` row (use real temp files in the test).

#### Verification

After deploy: query `skill_frequency` endpoint. The `skill_activations` table should
show non-null `agent_type` values for skill reads that occurred during subagent sessions.
The previously null `agent_type` column should show agent names.

#### Dependencies

B41-P2.3 (shares the temp file infrastructure — extract `agent-timing.ts` common dir
into a shared `session-context.ts` module, then both timing and agent-type tracking
use the same module).

---

## Execution Order

```
Wave 1 (P0) — run in parallel:
  B40-P1.1 (skill activation guard)
  B40-P1.2 (empty agent_type guard)
  B40-P1.3 (agent stop schema)
  B40-P1.4 (session summary schema)

Wave 2 (P1) — after Wave 1 is stable:
  B41-P2.1 (cost pricing fallback)      ← standalone, start immediately
  B41-P2.2 (agents/skills extraction)   ← depends on nothing, parallel
  B41-P2.3 (duration_ms timing)         ← depends on nothing, parallel
  B41-P2.4 (retire api_requests)        ← after P2.1 (cost must be non-zero first)

Wave 3 (P2) — after Wave 2:
  B42-P3.1 (efficiency formula fix)     ← after P2.1 (accurate cost data)
  B42-P3.2 (daily trend pipe)           ← standalone, no dependencies
  B42-P3.3 (agent_type in skills)       ← after P2.3 (shares temp file infra)
```

---

## Verification Checklist (post-all-waves)

- [ ] `log-skill-activation` failure rate <10% in `telemetry_health_summary`
- [ ] `log-agent-start` failure rate <5%
- [ ] `log-agent-stop` failure rate <5%
- [ ] `log-session-summary` failure rate <5%
- [ ] Zero rows with empty `agent_type` in new `agent_activations` data
- [ ] `est_cost_usd` shows non-zero values for agents with actual token usage
- [ ] `session_overview` shows non-zero `agents_used` and `skills_used`
- [ ] `cost_by_model` endpoint returns rows (via `agent_activations` source)
- [ ] `optimization_insights` `cache_hit_rate` is in [0, 1] for all agents
- [ ] `agent_usage_daily` endpoint returns daily trend rows
- [ ] `skill_activations.agent_type` populated for subagent skill reads
- [ ] All existing tests pass (no regressions)

---

## Unresolved Questions

1. **Task tool_use field for agent_type:** The exact field name for identifying which
   agent was invoked via the Task tool in a session transcript is unknown. Need to
   inspect a real session transcript. B41-P2.2 uses `.passthrough()` and best-guess
   field names; may need adjustment after first real-data test.

2. **SubagentStop transcript timing:** The 27.3% failure rate cause is not definitively
   confirmed. The retry approach in B40-P1.3 addresses the race-condition hypothesis;
   if failures persist, deeper inspection of real error messages in `telemetry_health`
   is needed.

3. **Tinybird array serialization:** Empty arrays `[]` in `agents_used`/`skills_used`
   may behave differently than populated arrays with the `jsonPath: '$.agents_used[:]'`
   column configuration. Verify with a real Tinybird local build before Wave 2 deploy.

4. **`agent_type` in SubagentStart session_id:** The official schema shows SubagentStart
   sends `session_id` = parent's session ID. PostToolUse during a subagent sends the
   **subagent's** session_id. These may differ. If the session_id in PostToolUse
   doesn't match the session_id from SubagentStart, B42-P3.3 won't correlate correctly.
   The research report (B23) notes this nuance. May need to key the session-context file
   on `agent_id` instead of `session_id`.
