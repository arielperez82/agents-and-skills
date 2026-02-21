---
type: adr
endeavor: repo
initiative: I17-STSR
initiative_name: skill-telemetry-sub-resources
status: proposed
created: 2026-02-21
updated: 2026-02-21
---

# ADR I17-STSR-004: Project Name Derived from cwd Basename

## Status

Proposed

## Context

All telemetry events include `cwd` (the working directory where Claude Code runs), but no datasource stores project context. We need a `project_name` field across `skill_activations`, `agent_activations`, and `session_summaries` to enable per-project usage analysis. The extraction must work in every hook entry point with zero configuration.

## Decision

Derive `project_name` by taking `path.basename(cwd)` -- the last segment of the working directory path. For example, `/Users/Ariel/projects/agents-and-skills` produces `agents-and-skills`. Edge cases: missing/empty `cwd` or root `/` produce an empty string.

This is implemented as a pure utility function `extractProjectName(cwd: string | undefined): string` shared by all hook entry points.

## Consequences

### Positive

1. **Zero configuration.** Works immediately for every project without config files, env vars, or git operations.
2. **Universal.** Every hook event already includes `cwd`. No new data source needed.
3. **Human-readable.** Directory names like `agents-and-skills` or `trival-sales-brain` are meaningful in dashboards and queries.
4. **Pure function.** No I/O, no side effects, trivially testable.

### Negative

1. **Ambiguity with common names.** Two projects named `app` in different parent directories produce the same `project_name`. Acceptable -- this is a single-developer tool where directory names are unique in practice.
2. **Rename sensitivity.** Moving a project directory changes its `project_name`, splitting its history. Acceptable -- directory renames are rare and the impact is cosmetic (historical data shows old name, new data shows new name).
3. **No semantic meaning.** The basename is a filesystem artifact, not a project identifier. It works because developers name directories meaningfully.

### Alternatives Considered

| Alternative | Why Rejected |
|------------|-------------|
| Full absolute path (`cwd` as-is) | Contains PII (username, home directory structure). High cardinality in ClickHouse. Not useful for grouping. |
| Git remote URL (`git remote get-url origin`) | Requires spawning a subprocess in every hook invocation. Adds 50-200ms latency. Not available in non-git directories. Violates the "no perceptible latency" constraint. |
| Config file (`.telemetry.json` with project name) | Requires manual setup per project. Breaks zero-configuration principle. Easy to forget, leading to missing data. |
| Hash of cwd | Not human-readable. Defeats the purpose of project-level dashboards. |

## References

- Charter: US-3 (project context), Outcome 2
- Backlog: B6 (extractProjectName utility), B7-B10 (integration into all hooks)
- Acceptance scenarios: S-3.1 through S-3.6
