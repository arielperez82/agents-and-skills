# Agentic Design Patterns

Seven design patterns for building effective AI agents. Use the decision tree to select the right pattern, then follow the pattern's structure.

## Pattern Decision Tree

```
Is the agent doing a single focused task?
  YES -> Does it need self-evaluation?
    YES -> Reflection
    NO  -> ReAct (default for most agents)
  NO -> Is it coordinating multiple agents?
    YES -> Are tasks independent?
      YES -> Parallel Orchestration
      NO  -> Are tasks sequential with dependencies?
        YES -> Sequential Orchestration
        NO  -> Hierarchical (supervisor + workers)
    NO -> Is it routing to one of several specialists?
      YES -> Router
      NO  -> Does it need structured task decomposition?
        YES -> Planning
        NO  -> ReAct (default)
```

## 1. ReAct (Reason + Act)

General-purpose pattern for agents needing tool calling and iterative problem-solving.

**Loop**: Reason about situation -> Select and execute action -> Observe result -> Repeat until done.

**When to use**: Default pattern. Most specialist agents that operate in a single domain, use tools, and iterate toward a solution.

**Examples**: Code generation agents, research agents, troubleshooting agents.

**Anti-patterns**:
- Giving a ReAct agent responsibilities across multiple unrelated domains (split into specialists instead)
- Omitting tool access when the agent needs to observe real state (reasoning without grounding)

## 2. Reflection

For agents that must evaluate and iteratively improve their own output.

**Loop**: Generate output -> Review against criteria -> Identify gaps -> Refine -> Validate quality threshold met.

**When to use**: Quality-critical outputs where a first draft is insufficient. Code review, architecture review, agent validation, any domain where self-critique improves results.

**Examples**: Code reviewer agents, architecture reviewer agents, agent validator agents.

**Anti-patterns**:
- Using Reflection for simple lookup or generation tasks (adds latency without value)
- Reflection without explicit quality criteria (the agent has nothing concrete to review against)
- Unlimited review loops (cap iterations; typically 2 is sufficient)

## 3. Router

For classifying a request and delegating to exactly one specialist.

**Loop**: Analyze request -> Classify task type -> Select appropriate specialist -> Delegate.

**When to use**: Task dispatching where only one execution path should fire. Low overhead, fast routing.

**Examples**: Workflow dispatchers, task routers, intent classifiers.

**Anti-patterns**:
- Router that also does work (routers delegate, they do not execute)
- Missing fallback for unclassifiable requests
- Router with only two routes (use a simple conditional instead)

## 4. Planning

For complex tasks requiring structured decomposition before execution.

**Loop**: Decompose into sub-tasks -> Sequence logically -> Allocate resources -> Execute with validation checkpoints.

**When to use**: Multi-step implementations, migrations, large refactoring, any task where executing without a plan leads to rework.

**Examples**: Project planner agents, migration coordinator agents.

**Anti-patterns**:
- Planning for tasks with fewer than 3 steps (over-engineering)
- Plans without validation checkpoints (no way to detect drift)
- Planning without executing (plans are means, not ends)

## 5. Sequential Orchestration

For linear workflows with clear dependencies between stages.

**Structure**: Agent1 -> Output1 -> Agent2 -> Output2 -> Agent3 -> Result

**When to use**: Pipeline workflows where each stage transforms the previous output. The output of one stage is the input to the next.

**Examples**: Document processing pipelines (extract -> transform -> validate -> publish), multi-phase development workflows.

**Anti-patterns**:
- Sequential orchestration for independent tasks (use Parallel instead)
- Long chains without intermediate validation (errors compound)
- Stages that do not actually depend on the previous output

## 6. Parallel Orchestration

For running multiple independent analyses simultaneously.

**Structure**: Supervisor -> [Worker1, Worker2, Worker3] (concurrent) -> Aggregate results.

**When to use**: Independent analyses, multi-aspect reviews, parallel risk assessment. Tasks share no dependencies.

**Examples**: Multi-reviewer code review (security + performance + correctness in parallel), parallel documentation generation.

**Anti-patterns**:
- Parallelizing tasks that have data dependencies (produces inconsistent results)
- No aggregation step (parallel results need synthesis)
- Too many parallel workers without resource consideration

## 7. Hierarchical

For a supervisor agent that coordinates multiple worker agents dynamically.

**Structure**: Supervisor manages [Worker1, Worker2, Worker3], routing tasks and aggregating results based on intermediate outcomes.

**When to use**: Complex coordination where task routing depends on intermediate results. The supervisor makes dynamic decisions about what to delegate next.

**Examples**: Feature coordinator supervising frontend/backend/database/testing specialists, incident response coordinator.

**Anti-patterns**:
- Hierarchical for static workflows (use Sequential or Parallel instead)
- Supervisor that does worker-level work (supervisors coordinate, they do not execute)
- Deep hierarchies (prefer flat; rarely more than 2 levels)

## Pattern Combinations

Agents can combine patterns:

- **ReAct + Reflection**: Agent reasons and acts, then self-reviews its output
- **Planning + Sequential**: Decompose task first, then execute as a pipeline
- **Router + Hierarchical**: Route to a supervisor who coordinates workers
- **Parallel + Reflection**: Run parallel analyses, then reflect on aggregated results

## Choosing Patterns by Agent Role

| Agent Role | Recommended Pattern | Rationale |
|-----------|-------------------|-----------|
| Specialist (single domain) | ReAct | Tool-using, iterative task completion |
| Reviewer / Validator | Reflection | Must self-evaluate and iterate on critique |
| Pipeline orchestrator | Sequential | Clear dependency chain between phases |
| Multi-agent coordinator | Hierarchical | Dynamic task routing to specialists |
| Task dispatcher | Router | Classification and single-path delegation |
| Independent multi-analysis | Parallel | No dependencies between analyses |
| Complex multi-step task | Planning | Needs decomposition before execution |

## General Anti-Patterns (All Patterns)

- **Pattern mismatch**: Using Hierarchical when Sequential suffices, or Planning for a single-step task. Match pattern complexity to task complexity.
- **Missing error handling**: No pattern works reliably without defining what happens when a step fails.
- **Unbounded loops**: Every iterative pattern (ReAct, Reflection, Planning) needs a termination condition.
- **Over-specification**: Specifying the pattern in excessive detail when the agent could figure out the mechanics. Specify the pattern choice and constraints; let the agent handle execution.
