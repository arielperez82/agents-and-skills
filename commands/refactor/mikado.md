---
description: Plan a safe refactoring using the Mikado Method dependency graph
argument-hint: [refactoring-goal]
---

**Refactoring Goal**:
$ARGUMENTS

Use the `refactor-assessor` subagent with the `mikado-method` skill to build a Mikado dependency graph for this refactoring.

## Process

1. **Load skill**: Load the `mikado-method` skill (`skills/engineering-team/mikado-method/SKILL.md`)
2. **Define goal**: State the top-level refactoring goal as the Mikado graph root
3. **Explore dependencies**: Attempt the goal naively, record what breaks, revert, and add prerequisites as child nodes
4. **Build graph**: Recursively expand until all leaf nodes are safe, independent changes
5. **Order execution**: Identify the bottom-up execution order (leaves first, goal last)
6. **Report**: Present the Mikado graph and execution plan

## Output

Structured report with:
- Mikado graph (goal at top, prerequisites as children)
- Execution order (leaf-to-root)
- Risk assessment per node
- Estimated effort per node
- Revert safety notes

**IMPORTANT**: **Do not** start implementing the refactoring. Deliver the plan and wait for user direction.
**IMPORTANT**: Each node in the execution plan should be a small, independently committable change.
