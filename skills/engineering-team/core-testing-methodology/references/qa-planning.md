# QA Planning Fundamentals

## Test Plan Structure

- **Test scope and objectives**: What to test, what not to test
- **Testing approach and strategy**: Manual vs automated, priorities
- **Environment requirements**: Browsers, devices, data
- **Entry/exit criteria**: When testing starts/stops
- **Risk assessment**: What could go wrong, mitigations
- **Timeline and milestones**: Schedule and deliverables

## Test Case Structure

- **Priority**: P0 (Critical), P1 (High), P2 (Medium), P3 (Low)
- **Type**: Functional, UI, Integration, Regression, Performance, Security
- **Preconditions**: Setup required before testing
- **Steps**: Specific actions with expected results
- **Test data**: Sample inputs and configurations
- **Post-conditions**: System state after testing

## Manual Test Case Template

```markdown
## TC-001: [Test Case Title]

**Priority:** High | Medium | Low
**Type:** Functional | UI | Integration | Regression
**Status:** Not Run | Pass | Fail | Blocked

### Objective
[What are we testing and why]

### Preconditions
- [Setup requirement 1]
- [Setup requirement 2]
- [Test data needed]

### Test Steps
1. [Action to perform]
   **Expected:** [What should happen]

2. [Action to perform]
   **Expected:** [What should happen]

### Test Data
- Input: [Test data values]
- User: [Test account details]
- Configuration: [Environment settings]

### Post-conditions
- [System state after test]
- [Cleanup required]

### Notes
- [Edge cases to consider]
- [Related test cases]
- [Known issues]
```
