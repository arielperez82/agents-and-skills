---
name: mikado-method
description: Mikado Method for complex architectural refactoring - systematic dependency discovery, tree-based planning, and leaf-first bottom-up execution
---

# Mikado Method

Systematic approach for complex refactoring where direct implementation causes cascading failures across multiple classes or modules. Uses a dependency graph to discover prerequisites, reverts on failure, and executes leaf-first from the bottom up.

## When to Use Mikado vs Simple Refactoring

**Use Mikado when:**

- Refactoring goal affects multiple classes/modules
- Direct implementation attempt causes cascade of failures
- Dependencies between changes are not immediately clear
- Risk of breaking existing functionality is high
- You need to interrupt and resume refactoring safely

**Use simple refactoring when:**

- Change is localized to one file or module
- Dependencies are obvious and few
- The transformation can be completed in a single commit
- Automated refactoring tools handle the change directly

## Core Process

Cycle: **Set Goal > Experiment > Visualize Prerequisites > Revert to Working State**

Treat compilation and test failures as valuable information. Each failure reveals a prerequisite node in the dependency graph. Reverting keeps the codebase shippable at all times.

## Two-Mode Operation

### Exploration Mode

1. Attempt naive implementation of the refactoring goal
2. Capture compilation and test failures with full details
3. Create concrete prerequisite nodes with method-level specificity
4. Add dependencies to the tree file with proper indentation nesting
5. Commit the tree update only (not the code changes)
6. Revert all code changes completely (keep only the tree file)
7. Repeat until no new dependencies are discovered

### Execution Mode

1. Identify the deepest indentation level with incomplete nodes
2. Select only true leaves (most nested nodes with zero prerequisites)
3. Execute one leaf at a time for safety
4. Complete all nodes at current level before moving up
5. Never attempt a parent node until all children are complete
6. Implement the minimal possible change per leaf
7. Validate with full test execution
8. Commit implementation and update the tree marking the node complete
9. Proceed bottom-up to the next true leaf

## Exhaustive Exploration Algorithm

Sequence: **EXPERIMENT > LEARN > GRAPH > COMMIT GRAPH > REVERT**

1. **Experiment**: Attempt naive implementation of the stated goal
2. **Learn**: Capture ALL compilation and test failures immediately
3. **Graph**: Create concrete prerequisite nodes with exact specifications
4. **Commit Graph**: Commit the dependency discovery (tree file only)
5. **Revert**: Revert ALL code changes to maintain clean state

### Termination Criteria

- Every apparent leaf candidate has been systematically attempted
- No new dependencies emerge from leaf implementation attempts
- Tree structure remains stable across multiple exploration cycles
- True leaves confirmed with zero prerequisites

## Dependency Tree Structure

### File Convention

- Directory: `docs/mikado/`
- Filename: `<goal-name>.mikado.md`
- Format: `- [ ]` pending, `- [x]` completed
- Indentation: 4 spaces per nesting level
- Dependencies indented deeper than their dependents

### Tree Rules

1. Root goal at 0 indentation
2. Direct dependencies at 4-space indentation
3. Sub-dependencies at 8-space indentation, continuing per level
4. Child nodes must complete before parent nodes
5. Nodes at the same indentation level are independent (parallelizable)

### Example Tree

```markdown
- [ ] Goal: Replace direct DB calls in OrderController with repository pattern
    - [ ] Update OrderController constructor to use IOrderRepository
        - [ ] Implement SqlOrderRepository : IOrderRepository
            - [ ] Create IOrderRepository interface
                - [ ] Define GetOrderById(int orderId) -> Order? method signature
                - [ ] Define SaveOrder(Order order) -> Task method signature
            - [ ] Add constructor SqlOrderRepository(IDbContext context)
                - [ ] Verify IDbContext is registered in DI container
        - [ ] Implement GetOrderById method
            - [ ] Handle null order case with OrderNotFoundException
                - [x] Create OrderNotFoundException class
    - [ ] Register IOrderRepository in DI container
    - [ ] Remove IDbContext _context field from OrderController
```

Execution order: deepest leaves first, working up level by level.

## Concrete Node Specification

Nodes require method-level specificity:

- **Method signatures**: `ClassName.MethodName(parameter types) -> ReturnType`
- **File locations**: `src/Services/UserService.ts, line 45`
- **Access modifiers**: public, private, protected
- **Refactoring technique**: Extract Method, Move Method, Inline, etc.
- **Code smell target**: Long Method, Feature Envy, etc.

## Timeboxed Experimentation

10-minute timebox per attempt. If a change cannot be completed in 10 minutes, it is too complex and needs further breakdown.

- **Success**: commit, check off node, move to next
- **Fail**: revert, identify missing prerequisites, write subgoals

## Goal Definition

Frame goals in terms of business value, not technical tasks:

- **Good**: "Customer address is retrieved using the latest version of the third-party API for improved reliability"
- **Avoid**: "Update third-party API to version X"

## Discovery Commit Formats

Commit immediately after each dependency discovery to preserve exploration history and enable interrupt/resume.

- **Dependency**: `mikado: [Class.Method(params)] requires [Prerequisite] in [File:Line]`
- **False leaf**: `mikado: false leaf - [Node] blocked by [Dependency]`
- **Exploration complete**: `mikado: no new dependencies - exploration complete for [GoalArea]`
- **Ready**: `mikado: true leaves identified - [Count] leaves ready for execution`

## Integration with TDD

The Mikado Method and TDD reinforce each other directly:

- All Mikado execution steps maintain passing tests (green bar)
- Each leaf execution produces one atomic commit with tests passing
- If any step breaks tests, revert immediately and reassess dependencies
- Exploration mode uses test failures as dependency discovery signals
- Baby steps rhythm: test-commit-integrate every small change

### Combined Workflow

1. **RED**: Write a test for the leaf node change
2. **GREEN**: Implement the minimal change to pass the test
3. **REFACTOR**: Clean up while keeping tests green
4. **COMMIT**: Mark the leaf complete in the tree, commit both code and tree
5. **NEXT**: Move to the next leaf (same level or up one level)

If the test reveals unexpected failures in other areas, those failures become new nodes in the Mikado tree. Revert and update the tree before proceeding.

## Quick Reference Checklist

- [ ] Define the refactoring goal with business value framing
- [ ] Create the Mikado tree file in `docs/mikado/`
- [ ] Run exploration: experiment, capture failures, graph, commit tree, revert code
- [ ] Repeat exploration until no new dependencies emerge
- [ ] Identify true leaves (deepest nodes with no children)
- [ ] Execute leaves bottom-up, one at a time
- [ ] TDD each leaf: RED > GREEN > REFACTOR > COMMIT
- [ ] Mark completed nodes in the tree
- [ ] Never attempt a parent until all children are done
- [ ] Timebox each attempt to 10 minutes
