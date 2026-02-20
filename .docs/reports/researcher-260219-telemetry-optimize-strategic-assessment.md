# Strategic Assessment: /telemetry:optimize Command

**Date:** 2026-02-19
**Assessor:** product-director
**Initiative:** I05-ATEL (Agent Telemetry)
**Status:** GO -- proceed to Define phase

---

## 1. Strategic Alignment

**Rating: Strong**

This command is the operational payoff of the I05-ATEL infrastructure investment. The telemetry pipes (`optimization_insights`, `cost_by_agent`) and the agent-cost-optimization skill already define the data model, thresholds, and diagnostic workflow. What is missing is the last-mile connection: a single command that queries the pipes and presents a prioritized optimization report.

Without this command, the cost optimization workflow documented in the agent-cost-optimization skill remains a manual, multi-step process that requires the operator to remember pipe names, query parameters, and threshold values. The command converts a reference document into an executable workflow.

This directly supports the project's telemetry-informed agent selection principle (documented in CLAUDE.md): "Use usage data to decide which optional agents to engage." The command provides the data surface that makes that principle actionable.

## 2. Value vs. Effort

**Rating: High value, low effort**

### What already exists (no new work needed)

| Component | Location | Status |
|---|---|---|
| `optimization_insights` pipe | `telemetry/src/pipes/optimization_insights.ts` | Deployed, tested |
| `cost_by_agent` pipe | `telemetry/src/pipes/cost_by_agent.ts` | Deployed, tested |
| Priority thresholds | `skills/agent-development-team/agent-cost-optimization/SKILL.md` | Documented |
| Diagnostic workflow (3-step) | Same skill, "Cost Diagnostic Workflow" section | Documented |
| Command conventions | `commands/` directory (72+ commands) | Established |

### What needs to be built

1. A command definition file (`commands/telemetry/optimize.md`) following existing conventions (frontmatter + behavior spec).
2. The command instructs the agent to query two Tinybird MCP pipes, apply threshold classification, and render a prioritized table.

This is a **wiring task**, not a design task. The data model, thresholds, output format, and diagnostic logic are all defined. Estimated effort: 1-2 hours for the command definition, plus testing.

### Expected impact

- Reduces cost optimization workflow from ~15 minutes of manual pipe querying and threshold lookup to a single command invocation.
- Makes cost visibility a routine part of agent development (run after adding/modifying agents).
- Creates a feedback loop: build agents -> measure cost -> optimize -> measure again.

## 3. Alternative Approaches

### Alternative A: Keep it manual (status quo)
Operators read the agent-cost-optimization skill, manually query Tinybird pipes, and apply thresholds by hand. This works but has low adoption -- the friction of remembering pipe names and thresholds means it only happens during dedicated optimization sessions, not as routine practice.

**Verdict:** Rejected. The whole point of I05-ATEL was to operationalize telemetry, not leave it as reference material.

### Alternative B: Script instead of command
Write a shell/Python script in `telemetry/scripts/` that queries the Tinybird API directly (via curl or SDK) and outputs a formatted report.

**Verdict:** Inferior. A command integrates into the agent workflow natively (operators type `/telemetry:optimize`). A standalone script requires leaving the agent context, running a separate tool, and manually interpreting results. The command format also allows the agent to reason about the results and suggest next steps.

### Alternative C: Dashboard in Tinybird
Build a Tinybird dashboard that visualizes cost and optimization data.

**Verdict:** Complementary but not a substitute. A dashboard is good for ongoing monitoring but does not integrate into the agent development workflow. Could be a future addition (Later horizon), but the command is the higher-priority deliverable.

## 4. Opportunity Cost

Minimal. At 1-2 hours of effort, this displaces very little other work. The closest alternative use of that time would be:

- Adding more telemetry pipes (lower priority -- the core pipes are built)
- Improving existing agent definitions (ongoing, not blocked by this)
- Working on other initiatives

The opportunity cost of NOT building this is higher: the I05-ATEL investment remains under-utilized, and cost optimization stays manual and low-adoption.

## 5. Go/No-Go Recommendation

**GO. Proceed immediately.**

This is a high-value, low-effort task that operationalizes an existing infrastructure investment. All prerequisite components exist. The command convention is well-established with 72+ examples to follow.

## 6. Prioritization Guidance for Define Phase

### Scope (keep tight)

The command should do exactly four things:

1. **Query** `optimization_insights` pipe (default: 7 days, accept `--days` override)
2. **Query** `cost_by_agent` pipe (same time window)
3. **Classify** agents into CRITICAL / HIGH / MEDIUM / LOW buckets using thresholds from the agent-cost-optimization skill
4. **Output** a prioritized table with agent name, priority bucket, key metrics (cost, cache hit rate, efficiency score), model tier, and one-line recommendation per agent

### Non-goals (explicitly exclude)

- No new Tinybird pipes or datasources
- No automated remediation (the command reports; the operator acts)
- No dashboard or visualization beyond the text table
- No changes to existing skill thresholds (those are set; the command reads them)

### Command definition structure

Follow the pattern from `commands/agent/optimize.md`:

```
---
description: Query telemetry pipes and produce a prioritized agent cost optimization report
argument-hint: [--days N]
---
```

The command body should specify:
1. Load the agent-cost-optimization skill for threshold reference
2. Query both pipes via Tinybird MCP server
3. Merge results by `agent_type`
4. Apply priority classification
5. Render sorted table (CRITICAL first, then HIGH, MEDIUM, LOW)
6. For each CRITICAL/HIGH agent, include a specific recommendation based on the diagnostic workflow in the skill

### Dependencies

- Tinybird MCP server must be configured and accessible
- The `optimization_insights` and `cost_by_agent` pipes must be deployed
- Both are already in place per I05-ATEL

### Sequencing

This is a **Now** item. It is the natural next step after the I05-ATEL pipe infrastructure was built and the agent-cost-optimization skill was created. It completes the operational loop.
