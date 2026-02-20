---
type: charter
endeavor: repo
initiative: I15-TOPT
initiative_name: telemetry-optimize-command
status: proposed
updated: 2026-02-19
---

# Charter: Telemetry Optimize Command

## Goal

Create a `/telemetry:optimize` command (`commands/telemetry/optimize.md`) that queries two existing Tinybird MCP server pipes (`optimization_insights` and `cost_by_agent`), classifies agents into priority buckets using thresholds from the `agent-cost-optimization` skill, and outputs a prioritized markdown table with per-agent optimization recommendations.

This is the last-mile connection that converts the I05-ATEL telemetry infrastructure and the agent-cost-optimization skill from reference material into an executable, single-command workflow.

## Scope

**In scope:**

- One command file: `commands/telemetry/optimize.md`
- Queries `optimization_insights` pipe (per-agent efficiency metrics) via Tinybird MCP
- Queries `cost_by_agent` pipe (cost by model tier) via Tinybird MCP
- Classifies agents into CRITICAL / HIGH / MEDIUM / LOW buckets per agent-cost-optimization skill thresholds
- Outputs a prioritized markdown table sorted by priority then cost descending
- Per-agent actionable recommendation based on the skill's diagnostic workflow
- Accepts optional `--days N` argument (default: 30)
- Documents prerequisite: Tinybird MCP server must be configured

**Out of scope:**

- No new Tinybird pipes or datasources
- No new TypeScript code or scripts
- No automated remediation (command reports; operator acts)
- No dashboard or visualization beyond the text table
- No changes to existing skill thresholds
- No report persistence (inline output only)

## Success Criteria

1. `commands/telemetry/optimize.md` exists with valid YAML frontmatter and follows command conventions
2. Running `/telemetry:optimize` queries both pipes, merges results by `agent_type`, and renders a prioritized table
3. Classification matches agent-cost-optimization skill thresholds exactly
4. Each CRITICAL and HIGH agent has a specific recommendation
5. The command handles empty pipe results with a warning
6. The command passes `command-validator` validation

## User Stories

### US-1: Basic optimization report [MUST -- Walking Skeleton]

**As a** developer working in the agents-and-skills repo,
**I want to** run `/telemetry:optimize` and see a prioritized table of agents ranked by cost optimization priority,
**So that** I can identify which agents need immediate attention without manually querying pipes.

**Acceptance criteria:**

1. The command queries `optimization_insights` with the specified days parameter (default 30)
2. The command queries `cost_by_agent` with the same days parameter
3. Results are merged by `agent_type` to combine efficiency metrics with model tier data
4. Each agent is classified into exactly one bucket: CRITICAL, HIGH, MEDIUM, or LOW
5. Output is a markdown table with columns: Priority, Agent, Avg Cost, Avg Tokens, Cache Rate, Model, Recommendation
6. Table is sorted by priority (CRITICAL first) then by avg cost descending within each priority
7. When no data is returned, the command outputs a warning about insufficient telemetry data

### US-2: Priority classification using skill thresholds [MUST -- Walking Skeleton]

**As a** developer reviewing the optimization report,
**I want** the priority classification to use the exact thresholds from the agent-cost-optimization skill,
**So that** the report is consistent with the skill's guidance.

**Acceptance criteria:**

1. CRITICAL: `avg_cost_per_invocation` > $5.00
2. HIGH: `avg_cost_per_invocation` between $2.00 and $5.00
3. MEDIUM: `cache_hit_rate` < 0.80 (and not already CRITICAL or HIGH)
4. LOW: all metrics in healthy range
5. Additional signal: `avg_tokens` > 30K flagged as "token budget critical"; > 10K as "token budget warning"
6. Additional signal: input ratio > 0.95 flagged as "prompt bloat"
7. Thresholds are referenced from the skill (loaded at runtime), not hardcoded

### US-3: Per-agent actionable recommendations [MUST]

**As a** developer reading the optimization report,
**I want** each agent flagged CRITICAL or HIGH to have a specific, actionable recommendation,
**So that** I know what to do next.

**Acceptance criteria:**

1. CRITICAL agents get recommendation based on the skill's diagnostic workflow
2. HIGH agents get recommendation addressing the primary cost driver
3. MEDIUM agents get cache optimization recommendation
4. LOW agents show "Healthy -- monitor only"
5. When cost_by_agent shows opus model, recommendation includes "Consider downgrading to sonnet" if appropriate

### US-4: Model tier mismatch detection [SHOULD]

**As a** developer optimizing agent costs,
**I want** the report to flag agents using a more expensive model tier than necessary,
**So that** I can identify model downgrade opportunities.

**Acceptance criteria:**

1. The model column from cost_by_agent is included in the output table
2. Opus agents not classified as CRITICAL by token volume get a model tier review suggestion
3. Multiple model entries for the same agent appear as separate rows

### US-5: Configurable time window [SHOULD]

**As a** developer reviewing cost trends,
**I want to** specify a custom time window (e.g., `/telemetry:optimize --days 7`),
**So that** I can compare recent costs against longer baselines.

**Acceptance criteria:**

1. Command accepts and parses `--days N` from `$ARGUMENTS`
2. Default is 30 days
3. Days value passed to both pipe queries
4. Report header displays the time window

### US-6: MCP query execution via use-mcp pattern [MUST -- Walking Skeleton]

**As a** command author,
**I want** the command to use the established use-mcp pattern for querying Tinybird,
**So that** it follows existing conventions.

**Acceptance criteria:**

1. Pipe queries use `echo "..." | gemini -y -m gemini-2.5-flash` (stdin pipe)
2. Command documents the Tinybird MCP prerequisite
3. Fallback to mcp-manager subagent if Gemini CLI unavailable
4. Query prompts request JSON-only responses

### US-7: Command validation [MUST]

**As a** repo maintainer,
**I want** the new command to pass command-validator validation,
**So that** it meets repo quality standards.

**Acceptance criteria:**

1. YAML frontmatter includes description and argument-hint
2. Command body includes purpose, execution steps, output format, notes
3. command-validator produces no errors

## Walking Skeleton

US-1 + US-2 + US-6 form the walking skeleton: command file exists, queries both pipes via MCP, classifies using thresholds, renders prioritized table.

## Constraints

- Command-only deliverable: single `.md` file
- Follows existing command conventions
- References skill thresholds by name (not hardcoded)
- Uses the use-mcp pattern for pipe queries

## Assumptions

1. Tinybird MCP server is configured and accessible
2. Both pipes are deployed and returning data (I05-ATEL)
3. Agent-cost-optimization skill thresholds are stable
4. Gemini CLI is available (with mcp-manager fallback)

## Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Tinybird MCP not configured | Command fails | Medium | Document setup prerequisite |
| Empty pipe results | Misleading output | Medium | Warn if <5 agents have data |
| Gemini CLI unavailable | No query path | Low | Fallback to mcp-manager |

## Outcomes (sequenced)

| Order | Outcome | Status |
|-------|---------|--------|
| 1 | Walking skeleton: command queries pipes, renders classified table | todo |
| 2 | Enriched recommendations and model tier detection | todo |
| 3 | Validation and documentation | todo |

## Acceptance Scenarios

Scenarios interact exclusively through the `/telemetry:optimize` command interface (the driving port). Pipe query results and rendered output are the observable inputs and outputs. No internal implementation details are referenced.

Scenario tags: `[WS]` = walking skeleton, `[HP]` = happy path, `[EP]` = error path, `[EC]` = edge case.

### Feature: Basic Optimization Report (US-1)

#### Scenario 1.1: Standard report with mixed-priority agents [WS] [HP]

```gherkin
Given the optimization_insights pipe returns data for 4 agents over the last 30 days:
  | agent_type        | avg_cost_per_invocation | avg_tokens | cache_hit_rate | frequency |
  | architect         | 7.20                    | 35000      | 0.72           | 45        |
  | tdd-reviewer      | 3.10                    | 12000      | 0.88           | 210       |
  | ts-enforcer       | 0.85                    | 4500       | 0.65           | 180       |
  | code-reviewer     | 1.20                    | 8000       | 0.92           | 95        |
And the cost_by_agent pipe returns model tier data:
  | agent_type        | model              | total_cost |
  | architect         | claude-opus-4      | 324.00     |
  | tdd-reviewer      | claude-sonnet-4    | 651.00     |
  | ts-enforcer       | claude-sonnet-4    | 153.00     |
  | code-reviewer     | claude-sonnet-4    | 114.00     |
When the developer runs /telemetry:optimize
Then the output is a markdown table with columns: Priority, Agent, Avg Cost, Avg Tokens, Cache Rate, Model, Recommendation
And the table contains 4 agent rows
And the rows are sorted: architect (CRITICAL) first, then tdd-reviewer (HIGH), then ts-enforcer (MEDIUM), then code-reviewer (LOW)
And within the same priority bucket, agents are sorted by avg cost descending
```

#### Scenario 1.2: Both pipes return empty results [WS] [EP]

```gherkin
Given the optimization_insights pipe returns zero rows for the last 30 days
And the cost_by_agent pipe returns zero rows for the last 30 days
When the developer runs /telemetry:optimize
Then the output contains a warning: "Insufficient telemetry data. Ensure Tinybird pipes have data for the requested period."
And no markdown table is rendered
```

#### Scenario 1.3: optimization_insights returns data but cost_by_agent is empty [EP]

```gherkin
Given the optimization_insights pipe returns data for 2 agents over the last 30 days:
  | agent_type   | avg_cost_per_invocation | avg_tokens | cache_hit_rate | frequency |
  | architect    | 7.20                    | 35000      | 0.72           | 45        |
  | tdd-reviewer | 3.10                    | 12000      | 0.88           | 210       |
And the cost_by_agent pipe returns zero rows
When the developer runs /telemetry:optimize
Then the table is rendered with the Model column showing "unknown" for all agents
And classification and recommendations still appear based on available metrics
```

#### Scenario 1.4: Only one agent has data [EC]

```gherkin
Given the optimization_insights pipe returns data for 1 agent over the last 30 days:
  | agent_type | avg_cost_per_invocation | avg_tokens | cache_hit_rate | frequency |
  | architect  | 7.20                    | 35000      | 0.72           | 45        |
And the cost_by_agent pipe returns:
  | agent_type | model         | total_cost |
  | architect  | claude-opus-4 | 324.00     |
When the developer runs /telemetry:optimize
Then the table contains exactly 1 row for architect classified as CRITICAL
```

#### Scenario 1.5: Pipe query fails due to MCP connectivity [EP]

```gherkin
Given the Tinybird MCP server is not configured
When the developer runs /telemetry:optimize
Then the output contains an error: "Tinybird MCP server is not reachable. Verify MCP configuration."
And the output includes a reference to the setup prerequisite documentation
```

#### Scenario 1.6: All agents are healthy [EC]

```gherkin
Given the optimization_insights pipe returns data for 3 agents:
  | agent_type    | avg_cost_per_invocation | avg_tokens | cache_hit_rate | frequency |
  | tdd-reviewer  | 0.90                    | 4000       | 0.95           | 210       |
  | ts-enforcer   | 0.85                    | 4500       | 0.93           | 180       |
  | code-reviewer | 1.20                    | 8000       | 0.92           | 95        |
And the cost_by_agent pipe returns matching model data (all sonnet)
When the developer runs /telemetry:optimize
Then all 3 agents are classified as LOW
And each recommendation reads "Healthy -- monitor only"
```

### Feature: Priority Classification (US-2)

#### Scenario 2.1: CRITICAL classification at cost threshold boundary [WS] [EC]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type   | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | agent-above  | 5.01                    | 15000      | 0.85           |
  | agent-at     | 5.00                    | 15000      | 0.85           |
  | agent-below  | 4.99                    | 15000      | 0.85           |
When the developer runs /telemetry:optimize
Then agent-above is classified as CRITICAL
And agent-at is classified as HIGH (threshold is strictly greater than $5.00)
And agent-below is classified as HIGH
```

#### Scenario 2.2: HIGH classification at cost threshold boundary [WS] [EC]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type   | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | agent-above  | 2.01                    | 8000       | 0.85           |
  | agent-at     | 2.00                    | 8000       | 0.85           |
  | agent-below  | 1.99                    | 8000       | 0.85           |
When the developer runs /telemetry:optimize
Then agent-above is classified as HIGH
And agent-at is classified as HIGH ($2.00 is the lower bound of the HIGH range)
And agent-below with cache_hit_rate 0.85 is classified as LOW (above 0.80 cache threshold)
```

#### Scenario 2.3: MEDIUM classification by cache_hit_rate when cost is healthy [WS] [HP]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type  | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | agent-a     | 1.50                    | 8000       | 0.79           |
  | agent-b     | 1.50                    | 8000       | 0.80           |
When the developer runs /telemetry:optimize
Then agent-a is classified as MEDIUM (cache_hit_rate < 0.80)
And agent-b is classified as LOW (cache_hit_rate at 0.80 is not below threshold)
```

#### Scenario 2.4: Cost takes precedence over cache rate for classification [HP]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | agent-x    | 6.00                    | 20000      | 0.50           |
When the developer runs /telemetry:optimize
Then agent-x is classified as CRITICAL (not MEDIUM, because cost threshold takes precedence)
```

#### Scenario 2.5: Token budget signals are appended to classification [HP]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | agent-a    | 6.00                    | 35000      | 0.85           |
  | agent-b    | 3.00                    | 15000      | 0.85           |
  | agent-c    | 1.00                    | 9000       | 0.90           |
When the developer runs /telemetry:optimize
Then agent-a recommendation includes "token budget critical" (avg_tokens > 30K)
And agent-b recommendation includes "token budget warning" (avg_tokens > 10K)
And agent-c recommendation does not include any token budget flag
```

#### Scenario 2.6: Prompt bloat signal detected [HP]

```gherkin
Given the optimization_insights pipe returns an agent with:
  | agent_type | avg_cost_per_invocation | avg_tokens | cache_hit_rate | input_ratio |
  | agent-z    | 3.50                    | 20000      | 0.85           | 0.96        |
And input_ratio is derived from agent_usage_summary data merged into the report
When the developer runs /telemetry:optimize
Then agent-z recommendation includes "prompt bloat" flag
```

### Feature: Per-Agent Recommendations (US-3)

#### Scenario 3.1: CRITICAL agent with opus model gets model downgrade recommendation [HP]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | architect  | 7.20                    | 35000      | 0.72           |
And cost_by_agent shows architect uses claude-opus-4
When the developer runs /telemetry:optimize
Then the architect recommendation includes "Consider downgrading to sonnet"
And the recommendation references the skill diagnostic workflow: check model tier, check prompt size, check invocation frequency
```

#### Scenario 3.2: HIGH agent gets primary cost driver recommendation [HP]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type   | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | tdd-reviewer | 3.10                    | 12000      | 0.88           |
And cost_by_agent shows tdd-reviewer uses claude-sonnet-4
When the developer runs /telemetry:optimize
Then the tdd-reviewer recommendation addresses the primary cost driver
And the recommendation includes "Review model selection and prompt size"
```

#### Scenario 3.3: MEDIUM agent gets cache optimization recommendation [HP]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type  | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | ts-enforcer | 0.85                    | 4500       | 0.65           |
When the developer runs /telemetry:optimize
Then ts-enforcer recommendation includes cache optimization guidance
And the recommendation references prompt structure for cache hits
```

#### Scenario 3.4: LOW agent gets monitor-only recommendation [HP]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type    | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | code-reviewer | 1.20                    | 8000       | 0.92           |
When the developer runs /telemetry:optimize
Then code-reviewer recommendation reads "Healthy -- monitor only"
```

#### Scenario 3.5: CRITICAL agent already on sonnet does not get model downgrade recommendation [EP]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type     | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | engineering-lead | 5.50                  | 40000      | 0.60           |
And cost_by_agent shows engineering-lead uses claude-sonnet-4
When the developer runs /telemetry:optimize
Then the engineering-lead recommendation does NOT include "Consider downgrading to sonnet"
And the recommendation focuses on prompt size and invocation frequency instead
```

### Feature: Model Tier Mismatch Detection (US-4)

#### Scenario 4.1: Opus agent with healthy cost gets model tier review suggestion [HP]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type    | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | code-reviewer | 1.80                    | 8000       | 0.92           |
And cost_by_agent shows code-reviewer uses claude-opus-4
When the developer runs /telemetry:optimize
Then code-reviewer gets a model tier review suggestion: "Uses opus but cost is not critical -- review if sonnet would suffice"
```

#### Scenario 4.2: Agent with multiple model entries appears as separate rows [EC]

```gherkin
Given cost_by_agent returns two rows for the same agent:
  | agent_type   | model              | total_cost |
  | tdd-reviewer | claude-sonnet-4    | 500.00     |
  | tdd-reviewer | claude-opus-4      | 151.00     |
And optimization_insights has one row for tdd-reviewer
When the developer runs /telemetry:optimize
Then the table contains two rows for tdd-reviewer, one per model
And each row shows the respective model and cost
```

#### Scenario 4.3: Opus agent classified CRITICAL by token volume is not flagged for tier review [EP]

```gherkin
Given the optimization_insights pipe returns:
  | agent_type | avg_cost_per_invocation | avg_tokens | cache_hit_rate |
  | architect  | 7.20                    | 35000      | 0.72           |
And cost_by_agent shows architect uses claude-opus-4
When the developer runs /telemetry:optimize
Then the architect recommendation does NOT include a model tier review suggestion
And instead follows the CRITICAL diagnostic workflow (model tier check is part of the CRITICAL audit, not a separate suggestion)
```

### Feature: Configurable Time Window (US-5)

#### Scenario 5.1: Custom days parameter changes query window [HP]

```gherkin
Given the optimization_insights and cost_by_agent pipes have data for the last 90 days
When the developer runs /telemetry:optimize --days 7
Then both pipe queries use days=7 as the time window parameter
And the report header displays "Optimization Report (last 7 days)"
```

#### Scenario 5.2: Default time window is 30 days [WS] [HP]

```gherkin
Given the optimization_insights and cost_by_agent pipes have data
When the developer runs /telemetry:optimize with no arguments
Then both pipe queries use days=30 as the time window parameter
And the report header displays "Optimization Report (last 30 days)"
```

#### Scenario 5.3: Invalid days argument [EP]

```gherkin
Given the developer provides a non-numeric days value
When the developer runs /telemetry:optimize --days abc
Then the output contains an error: "Invalid --days value. Expected a positive integer."
And no pipe queries are executed
```

#### Scenario 5.4: Zero or negative days argument [EP]

```gherkin
Given the developer provides zero as the days value
When the developer runs /telemetry:optimize --days 0
Then the output contains an error: "Invalid --days value. Expected a positive integer."
And no pipe queries are executed
```

### Feature: MCP Query Execution (US-6)

#### Scenario 6.1: Queries use the stdin pipe pattern for Gemini CLI [WS] [HP]

```gherkin
Given the Tinybird MCP server is configured and accessible
And the Gemini CLI is available
When the developer runs /telemetry:optimize
Then the command issues pipe queries using the stdin pipe pattern: echo "..." | gemini -y -m gemini-2.5-flash
And query prompts request JSON-only responses
And both optimization_insights and cost_by_agent are queried
```

#### Scenario 6.2: Gemini CLI is unavailable, falls back to mcp-manager [EP]

```gherkin
Given the Tinybird MCP server is configured and accessible
But the Gemini CLI is not available
When the developer runs /telemetry:optimize
Then the command falls back to the mcp-manager subagent for pipe queries
And the same data is retrieved and the report is rendered normally
```

#### Scenario 6.3: MCP returns malformed JSON [EP]

```gherkin
Given the Tinybird MCP server returns a non-JSON response for optimization_insights
When the developer runs /telemetry:optimize
Then the output contains an error about unparseable pipe response
And the command does not render a partial table
```

#### Scenario 6.4: MCP returns partial data (one pipe succeeds, one fails) [EP]

```gherkin
Given the optimization_insights pipe query succeeds with valid data
But the cost_by_agent pipe query returns an error
When the developer runs /telemetry:optimize
Then the command renders the table using available data
And the Model column shows "query failed" for all agents
And a warning is displayed about the partial result
```

### Feature: Command Validation (US-7)

#### Scenario 7.1: Command file passes command-validator [HP]

```gherkin
Given the commands/telemetry/optimize.md file exists
When the command-validator runs against the file
Then validation produces zero errors
And the frontmatter includes description and argument-hint fields
And the body includes purpose, execution steps, output format, and notes sections
```

#### Scenario 7.2: Command frontmatter missing required fields [EP]

```gherkin
Given the commands/telemetry/optimize.md file exists but description is missing from frontmatter
When the command-validator runs against the file
Then validation reports an error for missing description field
```

### Scenario Summary

| Category    | Count | Percentage |
|-------------|-------|------------|
| Happy path  | 12    | 46%        |
| Error path  | 10    | 38%        |
| Edge case   | 4     | 15%        |
| **Total**   | **26**| **100%**   |

Error + edge case scenarios represent 54% of the suite, exceeding the 40% target.

### Walking Skeleton Scenarios

The following scenarios form the walking skeleton validation set (US-1 + US-2 + US-6):

1. **1.1** -- Standard report with mixed-priority agents (proves end-to-end: query, classify, render)
2. **1.2** -- Empty pipe results (proves error handling exists from day one)
3. **2.1** -- CRITICAL threshold boundary (proves classification logic is wired)
4. **2.2** -- HIGH threshold boundary (proves classification cascade)
5. **2.3** -- MEDIUM classification by cache rate (proves secondary classification)
6. **5.2** -- Default 30-day window (proves argument defaulting)
7. **6.1** -- MCP stdin pipe pattern (proves query mechanism works)

These 7 scenarios define "done" for the walking skeleton. When all 7 pass, the thinnest end-to-end slice is proven and the architecture holds.
