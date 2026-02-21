---
type: charter
endeavor: repo
initiative: I17-STSR
initiative_name: skill-telemetry-sub-resources
status: proposed
updated: 2026-02-21
---

# Charter: Skill Telemetry Sub-Resources

## Goal

Extend the I05-ATEL telemetry system to track the full footprint of skill usage — not just the initial SKILL.md load, but every reference file read and script execution that a skill triggers. Add project context (which repo/project the session runs in) across all telemetry events so usage can be analyzed per-project. Add script execution duration so slow scripts can be identified and optimized.

Today, a skill activation is a single row in `skill_activations` when the agent reads `SKILL.md`. But skills are more than one file — they have `references/` directories with methodology docs, examples, and templates, plus `scripts/` directories with Python and Bash tools. None of these are tracked. This means:

1. **No visibility into which sub-resources are actually used.** A skill may have 6 reference files but agents might only ever read 2 of them. The rest are dead weight in the skill.
2. **No script performance data.** Scripts like `codebase_inventory.py` or `sprint_metrics_calculator.py` run via Bash but their execution time is invisible. Slow scripts degrade the agent experience and we can't identify them.
3. **No project attribution.** All telemetry events lack the project/repo context where they occurred. Usage patterns may differ dramatically between projects — the same agent in `agents-and-skills` vs `trival-sales-brain` may have very different cost profiles.

## Problem Statement

### Sub-resource blindness

The `skill_activations` datasource records one event per `SKILL.md` read. When an agent subsequently reads `skills/mermaid-diagrams/references/class-diagrams.md` or runs `python skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py`, those are invisible to telemetry. We cannot answer:

- Which reference files are most/least read across all skills?
- Which scripts are executed, how often, and how long do they take?
- Are some reference files never loaded (candidates for removal or consolidation)?
- Which scripts are slow enough to warrant optimization?

### Missing project context

Every hook event includes `cwd` in its payload, but no datasource stores it. We cannot answer:

- Which projects use which agents/skills most?
- Do cost profiles differ by project?
- Is a skill heavily used in one project but never in another?

## Scope

### In scope

1. **Spike: Validate `tool_use_id` consistency** between PreToolUse and PostToolUse events in a live Claude Code session, confirming the pairing mechanism works before building duration tracking
2. **New `entity_type` values** for `skill_activations`: `'reference'` and `'script'` alongside existing `'skill'` and `'command'`
3. **New column `parent_skill`** on `skill_activations` — the skill that owns the sub-resource (e.g., `mermaid-diagrams` for a reference read under `skills/mermaid-diagrams/references/`)
4. **Script duration tracking** — for `entity_type: 'script'`, populate `duration_ms` using a PreToolUse/PostToolUse timing pair on Bash tool calls that match skill script paths
5. **New column `project_name`** on `skill_activations`, `agent_activations`, and `session_summaries` — derived from `cwd` (last path segment, e.g., `/Users/Ariel/projects/agents-and-skills` → `agents-and-skills`)
6. **Updated detection logic** in `parse-skill-activation.ts` — broaden path matching from just `SKILL.md` and `commands/*.md` to also match `references/*.md` and `scripts/*.{py,sh}`
7. **New hook entry point** for PreToolUse — to capture start timestamps for Bash tool calls that match skill script paths (enabling duration calculation on the corresponding PostToolUse)
8. **PostToolUseFailure handling** — the PostToolUse event may not fire if a script fails; the `log-skill-activation` hook must also register for PostToolUseFailure events to capture failed script executions and consume timing files
9. **Updated pipes** — `skill_frequency` and any other relevant pipes to expose sub-resource data and project breakdowns; new `script_performance` pipe for script duration analysis

### Out of scope

- Tracking Read duration for SKILL.md or reference files (file I/O time is not meaningful)
- Session duration (no SessionStart event exists; separate initiative if needed)
- Modifying skill definitions or SKILL.md files
- Breaking changes to existing `skill_activations` rows — new columns must have defaults or be nullable

## Approach

### Sub-resource detection

Extend the existing PostToolUse hook (`log-skill-activation`) with broader path pattern matching:

| Pattern | `entity_type` | `parent_skill` | Example path |
|---------|--------------|----------------|-------------|
| `/skills/**/<name>/SKILL.md` | `skill` | `null` (it IS the skill) | `skills/engineering-team/tdd/SKILL.md` |
| `/commands/<cat>/<name>.md` | `command` | `null` | `commands/agent/validate.md` |
| `/skills/**/<skill>/references/<file>.md` | `reference` | `<skill>` | `skills/mermaid-diagrams/references/class-diagrams.md` |
| `/skills/**/<skill>/scripts/<file>.(py\|sh)` | `script` | `<skill>` | `skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py` |

For Read tool calls: detect reference files by matching `/skills/**/references/*.md`.

For Bash tool calls: detect script executions by matching `/skills/**/scripts/*.(py|sh)` within the `tool_input.command` string. This requires the hook to also process `tool_name: 'Bash'` events (currently filtered to `Read` only).

### Script duration via PreToolUse → PostToolUse pairing

Add a new hook on `PreToolUse` that:
1. Inspects `tool_input.command` for skill script path patterns
2. If matched, writes a timestamp to the existing tmp-file timing store (same pattern as agent timing: `/tmp/telemetry-script-timing/<tool_use_id>.json`)
3. The PostToolUse hook reads and consumes this file to compute `duration_ms`

This reuses the proven file-based timing pattern from agent start/stop (`telemetry/src/hooks/agent-timing.ts`).

**PostToolUseFailure handling:** If a script fails (non-zero exit or crash), Claude Code may emit a `PostToolUseFailure` event instead of (or in addition to) `PostToolUse`. The `log-skill-activation` hook must register for both `PostToolUse` and `PostToolUseFailure` events. Both events include `tool_use_id`, so the timing file pairing works identically. The `success` field is set to `false` for PostToolUseFailure events.

### Project name extraction

Derive `project_name` from `cwd` using the last path segment:
- `/Users/Ariel/projects/agents-and-skills` → `agents-and-skills`
- `/Users/Ariel/projects/trival-sales-brain` → `trival-sales-brain`

Add `project_name` as a `LowCardinality(String)` column on `skill_activations`, `agent_activations`, and `session_summaries`. Populate from `cwd` which is already parsed in every hook event but currently discarded.

### Schema changes

**`skill_activations` — new columns:**
- `parent_skill: t.string().lowCardinality().nullable()` — the owning skill name; null for top-level skill/command activations
- `project_name: t.string().lowCardinality()` — derived from cwd
- `resource_path: t.string()` — the specific file path or script name (for drill-down)

**`agent_activations` — new column:**
- `project_name: t.string().lowCardinality()` — derived from cwd

**`session_summaries` — new column:**
- `project_name: t.string().lowCardinality()` — derived from cwd

**New `entity_type` values:** `'reference'` and `'script'` (existing: `'skill'`, `'command'`)

## Constraints

- All I05-ATEL constraints carry forward: TypeScript strict mode, TDD, async non-blocking hooks, transcript field allowlist, Phase 0 quality gate, HTTPS only, separate read/write tokens, all deploys via pipeline, canonical artifacts under `.docs/`
- New columns must be backward-compatible — existing rows get default/null values
- Tinybird schema migrations are append-only (can add columns, cannot remove or rename)
- PreToolUse hook must be as lightweight as the existing PostToolUse hook — no perceptible latency impact on tool execution
- Script path detection in Bash commands must be conservative — match only explicit `/skills/**/scripts/` paths, not arbitrary commands that happen to contain "skills"

## User Stories

### US-0: Spike — Validate tool_use_id pairing [MUST]

**As a** telemetry developer,
**I want to** verify that `tool_use_id` is present and consistent between PreToolUse and PostToolUse/PostToolUseFailure events in a live Claude Code session,
**So that** I can confirm the duration pairing mechanism before building the PreToolUse hook.

**Acceptance criteria:**

1. Create a minimal PreToolUse hook that logs `tool_use_id` and `tool_name` to a tmp file
2. Create a minimal PostToolUse hook that logs `tool_use_id` and `tool_name` to a tmp file
3. Run a Claude Code session that invokes at least one Bash tool call
4. Verify the same `tool_use_id` appears in both PreToolUse and PostToolUse logs for the same tool call
5. Document whether PostToolUseFailure fires instead of PostToolUse for failed commands, and whether `tool_use_id` is present
6. If `tool_use_id` is absent or inconsistent, document the fallback approach (command-string hashing)
7. Spike findings documented in `.docs/reports/`

### US-1: Track skill reference file reads [MUST]

**As a** skill maintainer,
**I want to** see which reference files within a skill are actually loaded by agents,
**So that** I can identify unused references (consolidation candidates) and heavily-used ones (worth investing in).

**Acceptance criteria:**

1. When an agent reads a file matching `/skills/**/<skill>/references/*.md`, a `skill_activations` row is ingested with `entity_type: 'reference'` and `parent_skill` set to the owning skill name
2. The `skill_name` field contains the reference file name (e.g., `class-diagrams`)
3. The `resource_path` field contains the relative path from the skill root (e.g., `references/class-diagrams.md`)
4. Non-markdown files in `references/` are not tracked (only `.md`)

### US-2: Track skill script executions with duration [MUST]

**As a** skill maintainer,
**I want to** see which scripts are executed and how long they take,
**So that** I can identify slow scripts that degrade the agent experience.

**Acceptance criteria:**

1. When an agent runs a Bash command containing a path matching `/skills/**/<skill>/scripts/*.(py|sh)`, a `skill_activations` row is ingested with `entity_type: 'script'` and `parent_skill` set to the owning skill name
2. The `duration_ms` field contains the wall-clock execution time (PreToolUse timestamp to PostToolUse timestamp)
3. The `success` field reflects whether the script exited successfully (from `tool_response`)
4. If the PreToolUse timing file is missing (race condition, crash), `duration_ms` defaults to 0
5. Failed script executions (PostToolUseFailure events) are also tracked with `success: false` and correct `duration_ms`

### US-3: Add project context to all telemetry events [MUST]

**As a** developer using skills across multiple projects,
**I want** telemetry events to include which project they occurred in,
**So that** I can analyze usage patterns per-project.

**Acceptance criteria:**

1. `skill_activations`, `agent_activations`, and `session_summaries` all include a `project_name` column
2. `project_name` is derived from `cwd` (last path segment)
3. Existing rows have an empty string default (not null) for backward compatibility
4. All hook entry points populate `project_name` from the event's `cwd` field

### US-4: Updated pipes expose sub-resource and project data [SHOULD]

**As a** developer querying telemetry,
**I want** existing pipes to surface sub-resource breakdowns and project filters,
**So that** I can drill into skill usage without writing raw SQL.

**Acceptance criteria:**

1. `skill_frequency` pipe accepts optional `project_name` parameter for filtering
2. `skill_frequency` pipe includes `entity_type` and `parent_skill` in its output
3. A new `script_performance` pipe returns avg/p95/max `duration_ms` per script, filterable by `project_name` and time window
4. `agent_usage_summary` pipe accepts optional `project_name` parameter
5. `session_overview` pipe includes `project_name` in its output

### US-5: PreToolUse hook for script timing [MUST]

**As a** telemetry system,
**I want** a PreToolUse hook that captures start timestamps for skill script Bash calls,
**So that** PostToolUse can compute accurate duration.

**Acceptance criteria:**

1. A new hook entry point (`.claude/hooks/log-script-start.js`) fires on PreToolUse events
2. It inspects `tool_input.command` for skill script path patterns
3. On match, writes `{ startMs }` to `/tmp/telemetry-script-timing/<tool_use_id>.json`
4. On non-match, exits immediately with no I/O
5. The PostToolUse hook (`log-skill-activation`) reads and deletes the timing file when processing a matching script event
6. The PostToolUseFailure hook also reads and deletes the timing file for failed script executions
7. Timing file cleanup: stale files older than 1 hour are ignored (not consumed)

### US-6: PostToolUseFailure handling for script executions [MUST]

**As a** telemetry system,
**I want** failed script executions to be tracked even when PostToolUse does not fire,
**So that** script failure rates and durations are accurately captured.

**Acceptance criteria:**

1. The `log-skill-activation` hook is registered for both `PostToolUse` and `PostToolUseFailure` events in `.claude/settings.local.json`
2. PostToolUseFailure events are parsed with the same detection logic as PostToolUse (skill script path matching)
3. Script activations from PostToolUseFailure have `success: false`
4. Duration pairing works identically via `tool_use_id` for both event types
5. If a script produces both PostToolUse and PostToolUseFailure, only one activation row is ingested (deduplicate by `tool_use_id`)

## Walking Skeleton

**Outcome 0 (spike)** runs first to validate `tool_use_id` pairing. Then **Outcome 1 (schema changes) + Outcome 2 (project context) + Outcome 3 (reference tracking)** form the thinnest end-to-end slice: schema change + broadened detection + data flowing to Tinybird. This validates the full pipeline before adding the more complex PreToolUse hook and duration tracking.

## Success Criteria

1. `skill_activations` rows appear for reference file reads and script executions with correct `entity_type`, `parent_skill`, and `resource_path`
2. Script execution rows have non-zero `duration_ms` reflecting actual wall-clock time
3. Failed script executions (PostToolUseFailure) are tracked with `success: false` and correct `duration_ms`
4. All three datasources include `project_name` derived from `cwd`
5. `skill_frequency` pipe returns sub-resource breakdowns filterable by project
6. `script_performance` pipe identifies the slowest scripts
7. All new code has passing unit tests; existing tests remain green
8. No measurable latency impact on tool execution from the PreToolUse hook

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Bash command string doesn't contain full skill script path (relative paths, aliases) | Script executions go undetected | Medium | Agents typically use absolute or repo-relative paths in SKILL.md quick-start sections; add integration test coverage for both absolute and relative path patterns; consider `cwd`-aware path resolution as a follow-up if false-negative rate is high |
| PreToolUse hook adds latency to every Bash call | Degraded agent responsiveness | Low | Fast-path exit for non-matching commands (string check before regex); async timing file write; existing agent-timing hooks demonstrate sub-millisecond overhead |
| Tinybird column additions break existing queries | Pipe errors | Low | New columns have defaults; test existing pipes after migration using `tinybird build` against Tinybird Local |
| `tool_use_id` not available or not consistent between Pre/PostToolUse | Duration pairing fails | Medium | Front-loaded spike (Outcome 0) validates before dependent work begins; fall back to command-string hashing if needed |
| PostToolUseFailure not firing or missing `tool_use_id` | Failed scripts not tracked, timing files leak | Medium | Spike (Outcome 0) validates PostToolUseFailure behavior; timing file cleanup handles stale files; `success` field defaults to `true` for PostToolUse events |
| Type changes cascade to many callers | Increased implementation scope | Low | `SkillActivationRow` is derived from Tinybird schema; update schema definition, fix all callers mechanically |

## Assumptions

1. `tool_use_id` is present and consistent between PreToolUse and PostToolUse events for the same tool call (to be validated by spike)
2. Skill scripts are invoked with paths containing `/skills/` (not symlinked or aliased)
3. `cwd` is always present in hook event payloads (confirmed by existing schema parsing and official docs)
4. Tinybird supports adding nullable/default columns to existing datasources without data migration
5. PostToolUseFailure events include `tool_use_id` (documented in official Claude Code hooks API)

## Outcomes (sequenced)

| Order | Outcome | Status |
|-------|---------|--------|
| 0 | **Spike: tool_use_id validation.** Minimal PreToolUse + PostToolUse test hooks verify `tool_use_id` presence and consistency. Also verify PostToolUseFailure behavior for failed commands. Findings documented in `.docs/reports/`. | todo |
| 1 | **Schema changes.** Add `parent_skill`, `resource_path`, `project_name` to `skill_activations`; add `project_name` to `agent_activations` and `session_summaries`; add new `entity_type` values. All with backward-compatible defaults. | todo |
| 2 | **Project context.** All hook entry points (agent-start, agent-stop, skill-activation, session-summary, usage-context) extract and populate `project_name` from `cwd`. | todo |
| 3 | **Reference tracking.** Broaden `parse-skill-activation` to detect `/skills/**/references/*.md` reads with `entity_type: 'reference'` and `parent_skill`. | todo |
| 4 | **Script detection.** Extend PostToolUse hook to process Bash tool calls matching `/skills/**/scripts/*.(py\|sh)` with `entity_type: 'script'` and `parent_skill`. Register `log-skill-activation` for PostToolUseFailure events as well. | todo |
| 5 | **Script duration.** PreToolUse hook captures start timestamp; PostToolUse/PostToolUseFailure computes `duration_ms` via timing file pairing. | todo |
| 6 | **Updated pipes.** `skill_frequency` with sub-resource and project support; new `script_performance` pipe for duration analysis; `agent_usage_summary` and `session_overview` with project filtering. | todo |
| 7 | **Validation.** All tests green, deploy to Tinybird, verify data flowing for all entity types including failed scripts. | todo |

## Parallelization Notes

- **Outcome 0 (spike) must complete before Outcome 5** — duration pairing depends on confirmed `tool_use_id` behavior. The spike also informs Outcome 4 (PostToolUseFailure handling).
- **Outcome 1 must complete before Outcomes 2-6** — schema changes are prerequisites for all data changes
- **Outcomes 0 and 1 are parallelizable** — the spike validates hook behavior while schema changes are applied to Tinybird
- **Outcomes 2, 3, 4 are parallelizable** (after Outcome 1) — project context, reference detection, and script detection are independent changes
- **Outcome 5 depends on Outcomes 0 and 4** — duration pairing requires both validated `tool_use_id` and script detection in place
- **Outcome 6 depends on Outcomes 1-5** — pipes query the new columns and entity types
- **Outcome 7 depends on all** — end-to-end verification

**Wave structure:**
- **Wave 0:** Spike (O0) || Schema changes (O1) — parallel
- **Wave 1:** Project context (O2) || Reference tracking (O3) || Script detection (O4) — parallel, after O1
- **Wave 2:** Script duration (O5) — after O0 + O4
- **Wave 3:** Pipes (O6) — after O1-O5
- **Wave 4:** Validation (O7) — after all

## Acceptance Scenarios

Driving ports used across all scenarios:

- **Hook event input**: JSON on stdin (the "When")
- **Tinybird ingestion**: What the hook sends to Tinybird (the "Then" -- verified via ingestion spy/mock)
- **Pipe query output**: What a pipe endpoint returns (the "Then" for pipe scenarios)
- **Timing file system**: Files written to `/tmp/telemetry-script-timing/` (observable side-effect for PreToolUse)

### US-0: Spike -- Validate tool_use_id Pairing

_Note: US-0 is a manual spike. These scenarios describe the validation criteria, not automated acceptance tests. The spike produces a report document, not executable code._

#### S-0.1: tool_use_id present on PreToolUse Bash event

```
Given a Claude Code session is active
When a PreToolUse event fires for a Bash tool call
Then the event JSON contains a non-empty "tool_use_id" string field
```

#### S-0.2: tool_use_id matches between PreToolUse and PostToolUse

```
Given a PreToolUse event fired for Bash tool_use_id "toolu_abc123"
When the corresponding PostToolUse event fires for the same Bash call
Then the PostToolUse event contains tool_use_id "toolu_abc123"
```

#### S-0.3: PostToolUseFailure carries tool_use_id for failed commands

```
Given a PreToolUse event fired for Bash tool_use_id "toolu_fail456"
  and the Bash command exits with a non-zero status
When the PostToolUseFailure event fires
Then the event contains tool_use_id "toolu_fail456"
```

#### S-0.4: Spike findings are documented (error path -- id absent)

```
Given tool_use_id is absent or inconsistent in observed events
When the spike report is written
Then the report documents the fallback approach (command-string hashing)
  and the report is saved under ".docs/reports/"
```

### US-1: Track Skill Reference File Reads

#### S-1.1: Reference file read produces ingestion row [Walking Skeleton]

```
Given a PostToolUse event for tool_name "Read"
  with tool_input.file_path "/Users/Ariel/projects/agents-and-skills/skills/mermaid-diagrams/references/class-diagrams.md"
  and session_id "sess-ref-001"
  and cwd "/Users/Ariel/projects/agents-and-skills"
When the log-skill-activation hook processes the event
Then a skill_activations row is ingested with:
  | field         | value                        |
  | entity_type   | reference                    |
  | skill_name    | class-diagrams               |
  | parent_skill  | mermaid-diagrams             |
  | resource_path | references/class-diagrams.md |
  | session_id    | sess-ref-001                 |
  | success       | 1                            |
```

#### S-1.2: Reference in nested team directory

```
Given a PostToolUse event for tool_name "Read"
  with tool_input.file_path "/Users/Ariel/projects/agents-and-skills/skills/engineering-team/typescript-strict/references/async-patterns.md"
  and session_id "sess-ref-002"
When the log-skill-activation hook processes the event
Then a skill_activations row is ingested with:
  | field         | value                         |
  | entity_type   | reference                     |
  | parent_skill  | typescript-strict             |
  | skill_name    | async-patterns                |
  | resource_path | references/async-patterns.md  |
```

#### S-1.3: Non-markdown file in references directory is ignored (error path)

```
Given a PostToolUse event for tool_name "Read"
  with tool_input.file_path "/Users/Ariel/projects/agents-and-skills/skills/mermaid-diagrams/references/diagram-examples.png"
When the log-skill-activation hook processes the event
Then no skill_activations row is ingested
```

#### S-1.4: File outside references directory is ignored (error path)

```
Given a PostToolUse event for tool_name "Read"
  with tool_input.file_path "/Users/Ariel/projects/agents-and-skills/skills/mermaid-diagrams/assets/template.md"
When the log-skill-activation hook processes the event
Then no skill_activations row is ingested
```

#### S-1.5: Existing SKILL.md detection still works (regression guard)

```
Given a PostToolUse event for tool_name "Read"
  with tool_input.file_path "/Users/Ariel/projects/agents-and-skills/skills/engineering-team/tdd/SKILL.md"
  and session_id "sess-reg-001"
When the log-skill-activation hook processes the event
Then a skill_activations row is ingested with:
  | field         | value |
  | entity_type   | skill |
  | skill_name    | tdd   |
  | parent_skill  | null  |
```

#### S-1.6: Existing command detection still works (regression guard)

```
Given a PostToolUse event for tool_name "Read"
  with tool_input.file_path "/Users/Ariel/projects/agents-and-skills/commands/agent/validate.md"
  and session_id "sess-reg-002"
When the log-skill-activation hook processes the event
Then a skill_activations row is ingested with:
  | field        | value          |
  | entity_type  | command        |
  | skill_name   | agent/validate |
  | parent_skill | null           |
```

#### S-1.7: Path containing "references" but not under skills/ is ignored (edge case)

```
Given a PostToolUse event for tool_name "Read"
  with tool_input.file_path "/Users/Ariel/projects/agents-and-skills/docs/references/overview.md"
When the log-skill-activation hook processes the event
Then no skill_activations row is ingested
```

### US-2: Track Skill Script Executions with Duration

#### S-2.1: Python script execution produces ingestion row

```
Given a PostToolUse event for tool_name "Bash"
  with tool_input.command "python skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py --sprint 42"
  and session_id "sess-script-001"
  and tool_use_id "toolu_script_py"
  and tool_response.success true
  and cwd "/Users/Ariel/projects/agents-and-skills"
  and a timing file exists at "/tmp/telemetry-script-timing/toolu_script_py.json" with startMs 1708500000000
When the log-skill-activation hook processes the event at timestamp 1708500003500
Then a skill_activations row is ingested with:
  | field         | value                                       |
  | entity_type   | script                                      |
  | skill_name    | sprint_metrics_calculator.py                |
  | parent_skill  | agile-coach                                 |
  | resource_path | scripts/sprint_metrics_calculator.py         |
  | duration_ms   | 3500                                        |
  | success       | 1                                           |
  and the timing file "/tmp/telemetry-script-timing/toolu_script_py.json" is deleted
```

#### S-2.2: Shell script execution via absolute path

```
Given a PostToolUse event for tool_name "Bash"
  with tool_input.command "/Users/Ariel/projects/agents-and-skills/skills/engineering-team/shell-scripting/scripts/shellcheck_runner.sh src/"
  and tool_use_id "toolu_script_sh"
  and tool_response.success true
  and a timing file exists with startMs 1708500010000
When the log-skill-activation hook processes the event at timestamp 1708500012000
Then a skill_activations row is ingested with:
  | field         | value                        |
  | entity_type   | script                       |
  | parent_skill  | shell-scripting              |
  | duration_ms   | 2000                         |
  | success       | 1                            |
```

#### S-2.3: Missing timing file defaults duration to zero (error path)

```
Given a PostToolUse event for tool_name "Bash"
  with tool_input.command "python skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py"
  and tool_use_id "toolu_no_timing"
  and no timing file exists for "toolu_no_timing"
When the log-skill-activation hook processes the event
Then a skill_activations row is ingested with duration_ms 0
```

#### S-2.4: Bash command without skill script path is ignored (error path)

```
Given a PostToolUse event for tool_name "Bash"
  with tool_input.command "npm test"
When the log-skill-activation hook processes the event
Then no skill_activations row is ingested
```

#### S-2.5: Bash command containing "skills" but not a script path is ignored (edge case)

```
Given a PostToolUse event for tool_name "Bash"
  with tool_input.command "grep -r 'skills' README.md"
When the log-skill-activation hook processes the event
Then no skill_activations row is ingested
```

#### S-2.6: Script with .ts extension is ignored (edge case)

```
Given a PostToolUse event for tool_name "Bash"
  with tool_input.command "npx ts-node skills/engineering-team/tdd/scripts/helper.ts"
When the log-skill-activation hook processes the event
Then no skill_activations row is ingested
```

#### S-2.7: Stale timing file older than 1 hour is ignored (error path)

```
Given a timing file at "/tmp/telemetry-script-timing/toolu_stale.json"
  with startMs from 2 hours ago
  and a PostToolUse event for tool_name "Bash" matching a skill script
  with tool_use_id "toolu_stale"
When the log-skill-activation hook processes the event
Then a skill_activations row is ingested with duration_ms 0
  and the stale timing file is deleted
```

### US-3: Add Project Context to All Telemetry Events

#### S-3.1: Skill activation includes project_name [Walking Skeleton]

```
Given a PostToolUse event for tool_name "Read"
  with tool_input.file_path ending in "/skills/engineering-team/tdd/SKILL.md"
  and cwd "/Users/Ariel/projects/agents-and-skills"
When the log-skill-activation hook processes the event
Then the ingested skill_activations row has project_name "agents-and-skills"
```

#### S-3.2: Agent start includes project_name

```
Given a SubagentStart event for agent_type "tdd-reviewer"
  and cwd "/Users/Ariel/projects/trival-sales-brain"
When the log-agent-start hook processes the event
Then the ingested agent_activations row has project_name "trival-sales-brain"
```

#### S-3.3: Session summary includes project_name

```
Given a Stop event with session_id "sess-proj-001"
  and cwd "/Users/Ariel/projects/agents-and-skills"
When the log-session-summary hook processes the event
Then the ingested session_summaries row has project_name "agents-and-skills"
```

#### S-3.4: Missing cwd defaults project_name to empty string (error path)

```
Given a PostToolUse event for tool_name "Read"
  with tool_input.file_path ending in "/skills/engineering-team/tdd/SKILL.md"
  and no cwd field in the event
When the log-skill-activation hook processes the event
Then the ingested skill_activations row has project_name ""
```

#### S-3.5: Root-level cwd produces last segment (edge case)

```
Given an event with cwd "/"
When project_name is derived from cwd
Then project_name is ""
```

#### S-3.6: Trailing slash on cwd is handled (edge case)

```
Given an event with cwd "/Users/Ariel/projects/agents-and-skills/"
When project_name is derived from cwd
Then project_name is "agents-and-skills"
```

### US-5: PreToolUse Hook for Script Timing

#### S-5.1: Matching Bash command writes timing file

```
Given a PreToolUse event for tool_name "Bash"
  with tool_input.command "python skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py"
  and tool_use_id "toolu_pre_001"
When the log-script-start hook processes the event
Then a file is created at "/tmp/telemetry-script-timing/toolu_pre_001.json"
  containing a startMs numeric timestamp
```

#### S-5.2: Non-matching Bash command produces no I/O

```
Given a PreToolUse event for tool_name "Bash"
  with tool_input.command "git status"
  and tool_use_id "toolu_pre_002"
When the log-script-start hook processes the event
Then no file is created under "/tmp/telemetry-script-timing/"
```

#### S-5.3: Non-Bash tool is ignored

```
Given a PreToolUse event for tool_name "Read"
  with tool_use_id "toolu_pre_003"
When the log-script-start hook processes the event
Then no file is created under "/tmp/telemetry-script-timing/"
```

#### S-5.4: Missing tool_use_id skips timing (error path)

```
Given a PreToolUse event for tool_name "Bash"
  with tool_input.command "python skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py"
  and no tool_use_id field
When the log-script-start hook processes the event
Then no file is created under "/tmp/telemetry-script-timing/"
```

#### S-5.5: Timing file directory is created if absent

```
Given the directory "/tmp/telemetry-script-timing/" does not exist
  and a PreToolUse event matching a skill script path
  with tool_use_id "toolu_pre_005"
When the log-script-start hook processes the event
Then the directory is created
  and the timing file is written successfully
```

### US-6: PostToolUseFailure Handling for Script Executions

#### S-6.1: Failed script tracked via PostToolUseFailure

```
Given a timing file at "/tmp/telemetry-script-timing/toolu_fail_001.json" with startMs 1708500020000
  and a PostToolUseFailure event for tool_name "Bash"
  with tool_input.command "python skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py --bad-arg"
  and tool_use_id "toolu_fail_001"
  and session_id "sess-fail-001"
When the log-skill-activation hook processes the event at timestamp 1708500021500
Then a skill_activations row is ingested with:
  | field       | value |
  | entity_type | script |
  | success     | 0      |
  | duration_ms | 1500   |
  and the timing file is deleted
```

#### S-6.2: PostToolUseFailure for non-script Bash is ignored (error path)

```
Given a PostToolUseFailure event for tool_name "Bash"
  with tool_input.command "rm -rf /nonexistent"
  and tool_use_id "toolu_fail_002"
When the log-skill-activation hook processes the event
Then no skill_activations row is ingested
```

#### S-6.3: Duplicate events for same tool_use_id ingest only one row (edge case)

```
Given a timing file at "/tmp/telemetry-script-timing/toolu_dup_001.json"
  and both a PostToolUse and a PostToolUseFailure event arrive for tool_use_id "toolu_dup_001"
  both matching the same skill script path
When the log-skill-activation hook processes both events
Then exactly one skill_activations row is ingested for tool_use_id "toolu_dup_001"
```

### US-4: Updated Pipes Expose Sub-Resource and Project Data

#### S-4.1: skill_frequency returns entity_type and parent_skill columns

```
Given skill_activations contains rows with entity_type "reference" and parent_skill "mermaid-diagrams"
When the skill_frequency pipe is queried with days 7
Then the result includes rows with entity_type and parent_skill fields
  and rows with parent_skill "mermaid-diagrams" appear alongside entity_type "reference"
```

#### S-4.2: skill_frequency filters by project_name

```
Given skill_activations contains rows for project_name "agents-and-skills" and "trival-sales-brain"
When the skill_frequency pipe is queried with project_name "agents-and-skills"
Then only rows from project_name "agents-and-skills" are returned
```

#### S-4.3: script_performance returns duration statistics per script

```
Given skill_activations contains script rows:
  | skill_name                    | duration_ms |
  | sprint_metrics_calculator.py  | 1200        |
  | sprint_metrics_calculator.py  | 3400        |
  | sprint_metrics_calculator.py  | 800         |
When the script_performance pipe is queried with days 7
Then the result includes a row for "sprint_metrics_calculator.py" with:
  | field           | approximate_value |
  | avg_duration_ms | 1800              |
  | max_duration_ms | 3400              |
```

#### S-4.4: script_performance with no data returns empty result (error path)

```
Given skill_activations contains no script entity_type rows
When the script_performance pipe is queried
Then the result is an empty array
```

#### S-4.5: skill_frequency without project_name returns all projects (default)

```
Given skill_activations contains rows for project_name "agents-and-skills" and "trival-sales-brain"
When the skill_frequency pipe is queried without a project_name parameter
Then rows from both projects are included
```

### Scenario Summary

| Category     | Count | Percentage |
|-------------|-------|------------|
| Happy path   | 14    | 42%        |
| Error path   | 12    | 36%        |
| Edge case    | 6     | 18%        |
| Regression   | 2     | 6%         |
| **Total**    | **34**| **100%**   |

Error + edge case combined: 54% (exceeds 40% target).

### Walking Skeleton Scenarios

The following scenarios form the thinnest end-to-end slice proving the architecture works. They should be the first acceptance tests implemented (after the spike):

1. **S-1.1** -- Reference file read produces ingestion row (proves broadened detection + new entity_type + parent_skill + resource_path flow through to Tinybird)
2. **S-3.1** -- Skill activation includes project_name (proves project context extraction flows through to ingestion)
3. **S-1.5** -- Existing SKILL.md detection still works (proves backward compatibility is maintained)

These three scenarios together validate: schema changes deployed, detection logic broadened, project context populated, existing behavior preserved. They map to Outcomes 1 + 2 + 3 running after Wave 0.

## References

- Parent initiative: [I05-ATEL Charter](charter-repo-agent-telemetry.md)
- Research report: [researcher-2026-02-21-I17-STSR-telemetry-sub-resources.md](../../reports/researcher-2026-02-21-I17-STSR-telemetry-sub-resources.md)
- Strategic assessment: [researcher-2026-02-21-I17-STSR-strategic-assessment.md](../../reports/researcher-2026-02-21-I17-STSR-strategic-assessment.md)
- Existing skill detection: `telemetry/src/hooks/parse-skill-activation.ts`
- Agent timing pattern (reusable): `telemetry/src/hooks/agent-timing.ts`
- Skill structure: `skills/README.md`
- Roadmap: [roadmap-repo-I17-STSR-skill-telemetry-sub-resources-2026.md](../roadmaps/roadmap-repo-I17-STSR-skill-telemetry-sub-resources-2026.md)
