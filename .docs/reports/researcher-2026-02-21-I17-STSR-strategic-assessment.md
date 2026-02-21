# Strategic Assessment: I17-STSR Skill Telemetry Sub-Resources

**Date:** 2026-02-21
**Initiative:** I17-STSR
**Assessor:** product-director
**Recommendation:** GO -- slot into Now horizon as I05-ATEL completion work

---

## 1. Strategic Alignment

**Rating: Strong**

I17-STSR directly advances the core telemetry objective established by I05-ATEL. The parent initiative's charter explicitly states the goal of providing "visibility into cost, frequency, and value of the 58+ agents, 65+ commands, and dozens of skills." Today, skill telemetry captures only SKILL.md reads -- a single event per skill activation. The actual usage footprint (which references agents consult, which scripts they run, how long scripts take) is invisible.

This creates a concrete gap: the telemetry system cannot answer the questions it was built to answer. Without sub-resource tracking, skill maintainers cannot identify dead reference files, slow scripts, or per-project usage patterns. I05-ATEL Outcome 9 (interpretation skills) depends on having rich enough data to interpret -- sub-resource data makes that outcome meaningful rather than superficial.

The project context addition (project_name across all datasources) is strategically significant on its own. The repo serves multiple projects (`agents-and-skills`, `trival-sales-brain`, and others). Without project attribution, all telemetry analysis is aggregated across contexts where usage patterns differ dramatically.

**Alignment score: 9/10.** This is not a new strategic direction; it completes an existing one.

## 2. Value vs. Effort

**Rating: High value, low incremental effort**

### Infrastructure already in place

The charter builds on proven, working infrastructure:

- **5 datasources** deployed and ingesting data (schema migration is additive -- new nullable columns)
- **6 pipes** deployed as SQL APIs (extend with new columns/parameters)
- **5 hook core logic modules** with co-located tests and full TDD coverage
- **Pre-compiled JS entry point architecture** proven and documented
- **File-based timing pattern** (`agent-timing.ts`) already implemented for agent start/stop -- script timing reuses the identical pattern
- **CI/CD pipeline** operational (Phase 0 complete)
- **Zod schemas** for event parsing already handle `tool_use_id`, `cwd`, and `tool_input` fields

### What is genuinely new

1. **Broader path matching in `parse-skill-activation.ts`**: Two new regex patterns for `references/*.md` and `scripts/*.{py,sh}`. The existing `extractSkillInfo` function already demonstrates the pattern -- adding two more matchers is mechanical.
2. **Bash tool_input parsing**: Currently the hook filters `tool_name !== 'Read'` and exits. Extending to also process `tool_name === 'Bash'` with command-string matching is straightforward.
3. **PreToolUse hook entry point**: New hook, but the architecture is identical to existing hooks. The timing file pattern is copied from `agent-timing.ts`.
4. **Three new columns on existing datasources**: `parent_skill`, `resource_path`, `project_name`. Tinybird supports additive schema changes with defaults.
5. **One new pipe** (`script_performance`): Standard aggregation query.

### Effort estimate

Given the existing infrastructure, this is 2-3 days of focused implementation work (not weeks). The charter's 7 outcomes are well-sequenced, and 3 of 7 are parallelizable. The spike to verify `tool_use_id` consistency is the only unknown, and the charter already documents a fallback (command-string hashing).

**Value/effort ratio: High.** The marginal cost of adding sub-resource tracking to an already-built telemetry system is low. The marginal value is high -- it transforms "we know which skills are loaded" into "we know which parts of skills are actually used and how they perform."

## 3. Alternative Approaches Considered

### Alternative A: Log-based analysis instead of telemetry events

Parse Claude Code transcript JSONL files post-hoc to extract sub-resource usage. This avoids schema changes and new hooks but produces batch analytics rather than real-time telemetry, breaks the existing Tinybird query model, and requires a separate ETL pipeline. **Rejected.** The hook-based approach is already proven and keeps all telemetry in one system.

### Alternative B: Track only project context, defer sub-resources

Add `project_name` across all datasources (US-3) and skip reference/script tracking for now. This is the lowest-effort option and provides immediate per-project analysis. **Viable as a phase but not recommended as the final scope.** The sub-resource tracking is where the unique insight lives -- project context alone just adds a filter dimension to existing data.

### Alternative C: Sample-based script profiling

Instead of tracking every script execution, periodically profile scripts via a separate tool. **Rejected.** The PreToolUse/PostToolUse pairing captures real execution time in real contexts at negligible overhead. A separate profiling system adds complexity for worse data.

**Selected approach: Full charter scope as proposed.** The incremental cost over Alternative B is small, and the value difference is large.

## 4. Risk Assessment

| Risk | Severity | Likelihood | Mitigation | Assessment |
|------|----------|------------|------------|------------|
| `tool_use_id` inconsistency between Pre/PostToolUse | Medium | Medium | Front-loaded spike; fallback to command-string hashing | **Manageable.** The spike approach is correct -- verify before building. |
| Bash command strings vary (relative paths, aliases) | Low | Medium | Conservative regex matching on `/skills/**/scripts/` | **Acceptable.** False negatives (missed scripts) are tolerable; false positives would be worse. |
| PreToolUse hook latency | Low | Low | Fast-path exit for non-matching commands | **Negligible.** Existing hooks demonstrate sub-millisecond overhead. |
| Tinybird schema migration breaks existing pipes | Low | Low | New columns have defaults; test pipes after migration | **Standard.** This is a well-understood migration pattern. |

No blocking risks identified. The `tool_use_id` spike is the right call -- it resolves the highest-uncertainty item before any dependent work begins.

## 5. Dependency and Sequencing Analysis

### Relationship to I05-ATEL

I05-ATEL is at status "near-complete" with Outcomes 1-6 done, Outcome 7 blocked (OTel -- external dependency on Tinybird OTLP), Outcome 8 partial (deploy blocked on secrets), and Outcome 9 todo (interpretation skills).

I17-STSR has no dependency on the blocked I05-ATEL outcomes (7 and 8). It builds on Outcomes 1-6 which are fully complete. This means I17-STSR can proceed immediately without waiting for I05-ATEL blockers to resolve.

### Relationship to other Now initiatives

- **I12-CRFT** (Craft Command): No dependency. Different system area.
- **I13-RCHG** (Review Changes): No dependency. Different system area.
- **I10-ARFE** (Review Feedback): No dependency, though I17-STSR telemetry data could eventually inform review effectiveness analysis.

I17-STSR does not compete for the same code areas as any other Now initiative.

### Proposed parallelization with spike

The user's instinct to front-load the `tool_use_id` spike is correct. The recommended execution order:

1. **Spike** (30 min): Verify `tool_use_id` presence and consistency in PreToolUse/PostToolUse events
2. **Wave 1** (parallel): Schema changes (O1) -- prerequisite for everything else
3. **Wave 2** (parallel): Project context (O2) + Reference tracking (O3) + Script detection (O4)
4. **Wave 3** (sequential): Script duration (O5, depends on O4 + spike result)
5. **Wave 4** (sequential): Pipes (O6, depends on O1-O5)
6. **Wave 5**: Validation (O7)

This maximizes parallelism while respecting real dependencies.

## 6. Go/No-Go Recommendation

**GO.**

Rationale:

1. **Completes an existing investment.** I05-ATEL built the telemetry infrastructure. I17-STSR fills known data gaps that limit the system's analytical value. Not doing this leaves I05-ATEL at ~80% of its potential utility.

2. **Low incremental effort on proven infrastructure.** Every architectural pattern needed (hook entry points, timing files, Zod event parsing, Tinybird schema, pipe queries) already exists and is tested. This is extension work, not greenfield.

3. **No blocking risks.** The highest-uncertainty item (tool_use_id consistency) has a planned spike and a documented fallback.

4. **No capacity conflict.** Does not compete with other Now initiatives for code areas or attention.

5. **Enables I05-ATEL Outcome 9.** The interpretation skills (agent-cost-optimization, telemetry-analysis) become substantially more valuable when they can analyze sub-resource usage and per-project patterns.

### Roadmap recommendation

Slot I17-STSR into the **Now** horizon as an active initiative. It is effectively the completion phase of I05-ATEL's data collection layer, adding the granularity needed for the telemetry system to fulfill its charter's stated goals.

Update the roadmap to reflect:
- I17-STSR added to Now with status "active"
- I05-ATEL remains in Now at "near-complete" (its remaining outcomes are independent of I17-STSR)

### Estimated timeline

2-3 days of focused work. P85 estimate: 4 days accounting for spike findings that require the command-string hashing fallback.
