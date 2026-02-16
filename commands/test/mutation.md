---
description: Evaluate test suite effectiveness using mutation testing
argument-hint: [test-target]
---

**Test Target**:
$ARGUMENTS

Use the `qa-engineer` subagent with the `mutation-testing` skill to assess how well the test suite detects code changes.

## Process

1. **Load skill**: Load the `mutation-testing` skill (`skills/engineering-team/mutation-testing/SKILL.md`)
2. **Identify scope**: Determine which source files and corresponding tests to target
3. **Generate mutants**: Apply mutation operators (arithmetic, conditional, boundary, return value, etc.) to the target source
4. **Run tests**: Execute the test suite against each mutant
5. **Classify results**: Categorize mutants as killed (test caught it), survived (test missed it), or equivalent (mutation has no observable effect)
6. **Analyze survivors**: For surviving mutants, identify which behaviors lack test coverage
7. **Report**: Present mutation score and prioritized list of missing test cases

## Output

Structured report with:
- Mutation score (killed / total mutants)
- Survived mutants with source location and mutation type
- Recommended test cases to kill survivors (prioritized by risk)
- Equivalent mutants identified (no action needed)

**IMPORTANT**: **Do not** implement the missing tests automatically. Report findings and wait for user direction.
**IMPORTANT**: Focus on high-value survivors (business logic, edge cases) over trivial mutations.
