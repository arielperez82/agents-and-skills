---
type: roadmap
endeavor: repo
initiative: I17-STSR
initiative_name: skill-telemetry-sub-resources
status: proposed
updated: 2026-02-21
---

# Roadmap: Skill Telemetry Sub-Resources (I17-STSR)

## Overview

Sequences the outcomes for extending I05-ATEL telemetry to track skill sub-resources (references, scripts), script duration, and project context. Spike-first to de-risk duration pairing, then walking skeleton, then breadth expansion.

## Implementation Waves

| Wave | Outcomes | Rationale |
|------|----------|-----------|
| 0 | O0 (Spike) &#124;&#124; O1 (Schema) | De-risk tool_use_id pairing while schema changes deploy in parallel |
| 1 | O2 (Project context) &#124;&#124; O3 (Reference tracking) &#124;&#124; O4 (Script detection) | Independent feature slices, all require O1 complete |
| 2 | O5 (Script duration) | Requires both O0 (validated pairing) and O4 (script detection) |
| 3 | O6 (Pipes) | Queries depend on all new columns and entity types from O1-O5 |
| 4 | O7 (Validation) | End-to-end verification after all features deployed |

## Walking Skeleton

Outcomes O1 + O2 + O3 (from Waves 0-1) form the thinnest end-to-end slice. Together they prove: schema migration works, broadened detection produces new entity types, project context flows through, and existing behavior is preserved. The walking skeleton acceptance tests are S-1.1, S-3.1, and S-1.5 from the charter.

## Outcome Sequence

### Wave 0: Foundation (parallel)

#### Outcome 0: Spike -- tool_use_id Validation [MUST]

Manual validation in a live Claude Code session. Confirms `tool_use_id` presence and consistency between PreToolUse, PostToolUse, and PostToolUseFailure events. Produces a report in `.docs/reports/`. Blocks Wave 2 (duration pairing). Covers US-0.

**Acceptance scenarios:** S-0.1 through S-0.4

#### Outcome 1: Schema Changes [MUST]

Add `parent_skill` (nullable), `resource_path`, `project_name` to `skill_activations`. Add `project_name` to `agent_activations` and `session_summaries`. Backward-compatible defaults. Deploy via `tinybird build` against Tinybird Local, then pipeline deploy. Covers US-1 (schema), US-2 (schema), US-3 (schema).

**Acceptance scenarios:** Schema is validated indirectly through all ingestion scenarios (S-1.1, S-2.1, S-3.1, etc.)

### Wave 1: Feature Slices (parallel, after O1)

#### Outcome 2: Project Context [MUST]

All hook entry points (agent-start, agent-stop, skill-activation, session-summary, usage-context) extract `project_name` from `cwd` last path segment. Covers US-3.

**Acceptance scenarios:** S-3.1 through S-3.6

#### Outcome 3: Reference Tracking [MUST]

Broaden `parse-skill-activation` to detect `/skills/**/references/*.md` reads. Produce rows with `entity_type: 'reference'` and `parent_skill`. Covers US-1.

**Acceptance scenarios:** S-1.1 through S-1.7

#### Outcome 4: Script Detection [MUST]

Extend PostToolUse hook to process Bash tool calls matching `/skills/**/scripts/*.(py|sh)`. Register `log-skill-activation` for PostToolUseFailure events. Covers US-2 (detection only, not duration), US-6 (registration).

**Acceptance scenarios:** S-2.4 through S-2.6, S-6.2

### Wave 2: Duration Pairing (after O0 + O4)

#### Outcome 5: Script Duration [MUST]

PreToolUse hook (`log-script-start`) captures start timestamps. PostToolUse/PostToolUseFailure hooks compute `duration_ms` via timing file pairing. Stale file cleanup. Covers US-2 (duration), US-5, US-6 (duration + failure tracking).

**Acceptance scenarios:** S-2.1 through S-2.3, S-2.7, S-5.1 through S-5.5, S-6.1, S-6.3

### Wave 3: Pipes (after O1-O5)

#### Outcome 6: Updated Pipes [SHOULD]

`skill_frequency` with `entity_type`, `parent_skill`, and `project_name` filter. New `script_performance` pipe with avg/p95/max duration. `agent_usage_summary` and `session_overview` with project filtering. Covers US-4.

**Acceptance scenarios:** S-4.1 through S-4.5

### Wave 4: Validation (after all)

#### Outcome 7: End-to-End Validation [MUST]

All tests green. Deploy to Tinybird production. Verify data flowing for all entity types (skill, command, reference, script) including failed scripts. Existing pipes return correct data with new columns.

## Dependency Graph

```
Wave 0:  O0 (Spike) ─────────────────────┐
         O1 (Schema) ──┬──────────────────┤
                        │                  │
Wave 1:  O2 (Project) ─┤                  │
         O3 (Refs)    ──┤                  │
         O4 (Scripts) ──┼──────────────────┤
                        │                  │
Wave 2:                 │    O5 (Duration) ┤  ← needs O0 + O4
                        │                  │
Wave 3:                 O6 (Pipes) ────────┤  ← needs O1-O5
                                           │
Wave 4:                        O7 (Validation)
```

## Risk Gates

| Gate | Condition | Fallback |
|------|-----------|----------|
| After O0 | tool_use_id confirmed consistent | Redesign O5 to use command-string hashing instead of tool_use_id pairing |
| After O1 | Existing pipes still return correct data | Roll back column additions (append new datasource version) |
| After Wave 1 | Walking skeleton acceptance tests S-1.1, S-3.1, S-1.5 pass | Debug detection logic before proceeding to duration pairing |
