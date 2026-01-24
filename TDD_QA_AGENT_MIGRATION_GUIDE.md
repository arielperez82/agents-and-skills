# TDD/QA Agent Migration Guide

## Overview

Following the completion of the TDD/QA agent rationalization project, we've consolidated 4 overlapping testing agents into 2 focused agents with clear responsibilities. This guide helps you transition from the old agents to the new structure.

## What Changed

### Old Structure (4 Agents)
- `tdd-guardian.md` - TDD methodology enforcer (implementation-focused)
- `cs-tdd-engineer.md` - TDD implementation specialist
- `cs-qa-engineer.md` - Broad QA including manual testing
- `tester.md` - General testing execution

### New Structure (2 Agents)
- `tdd-guardian.md` - **REFORMED** as pure TDD methodology coach
- `qa-engineer.md` - **NEW** consolidated quality automation specialist

## Migration by Use Case

### If You Used `tdd-guardian` For...

| Old Use Case | New Approach |
|-------------|--------------|
| TDD process guidance | Continue using `tdd-guardian` (refocused) |
| Test structure advice | Use `qa-engineer` for implementation patterns |
| Coverage verification | Use `qa-engineer` for automation frameworks |
| Implementation examples | Use appropriate engineer agents (cs-frontend-engineer, etc.) |

### If You Used `cs-tdd-engineer` For...

| Old Use Case | New Approach |
|-------------|--------------|
| TDD workflow help | Use `tdd-guardian` for methodology coaching |
| Test implementation | Use language-specific engineers (cs-frontend-engineer, cs-backend-engineer) |
| Framework setup | Use `qa-engineer` for automation infrastructure |
| Red-Green-Refactor guidance | Use `tdd-guardian` for process coaching |

### If You Used `cs-qa-engineer` For...

| Old Use Case | New Approach |
|-------------|--------------|
| Test automation | Continue using `qa-engineer` (refocused) |
| Framework setup | Continue using `qa-engineer` |
| Quality metrics | Continue using `qa-engineer` |
| Manual test planning | Use `core-testing-methodology` skill for planning |
| Basic test execution | Use individual engineers for development testing |

### If You Used `tester` For...

| Old Use Case | New Approach |
|-------------|--------------|
| Test execution | Use individual engineers during development |
| Framework setup | Use `qa-engineer` for automation infrastructure |
| Coverage analysis | Use `qa-engineer` for quality metrics |
| Validation testing | Use `qa-engineer` for comprehensive testing |

## Skills Migration

### Testing Skills Consolidation

**Old Skills → New Skills:**

| Old Skill | New Skill | Rationale |
|-----------|-----------|-----------|
| `testing/SKILL.md` | `core-testing-methodology/SKILL.md` | Consolidated core testing principles |
| `tdd/SKILL.md` | `core-testing-methodology/SKILL.md` | Merged TDD methodology |
| `test-driven-development/SKILL.md` | `core-testing-methodology/SKILL.md` | Eliminated duplicate |
| `qa-test-planner/SKILL.md` | `core-testing-methodology/SKILL.md` | Merged QA planning |
| `e2e-testing-patterns/SKILL.md` | `testing-automation-patterns/SKILL.md` | Consolidated automation patterns |
| `vitest-*` skills | `testing-automation-patterns/SKILL.md` | Merged Vitest patterns |

**Skills That Remain Unchanged:**
- `front-end-testing/SKILL.md` (domain-specific)
- `react-testing/SKILL.md` (React-specific)
- `playwright-skill/SKILL.md` (tool-specific)

## New Agent Capabilities

### tdd-guardian (Reformed)

**What it provides:**
- TDD methodology coaching and guidance
- RED-GREEN-REFACTOR process guidance
- Test-First mindset education
- Standards enforcement for TDD compliance

**What it doesn't provide:**
- Implementation tools or frameworks
- Test execution or automation
- Technical testing patterns

**When to use:**
```
"I need help understanding TDD principles"
"How should I structure my TDD approach?"
"Review my TDD process"
"Is this following TDD best practices?"
```

### qa-engineer (New)

**What it provides:**
- Test automation frameworks and setup
- CI/CD testing integration
- Quality metrics and monitoring
- Testing infrastructure and patterns

**What it doesn't provide:**
- Manual testing execution
- TDD methodology coaching
- Basic development-time testing

**When to use:**
```
"Set up automated testing for my project"
"Optimize CI/CD testing pipeline"
"Implement quality metrics"
"Debug test automation issues"
"Design testing infrastructure"
```

## Common Migration Scenarios

### Scenario 1: Feature Development with TDD

**Before:**
```
1. Use cs-tdd-engineer for TDD workflow
2. Use cs-tdd-engineer for test implementation
3. Use cs-qa-engineer for test automation
```

**After:**
```
1. Use tdd-guardian for TDD methodology guidance
2. Use appropriate engineer (cs-frontend-engineer, etc.) for implementation
3. Use qa-engineer for automation framework setup
```

### Scenario 2: Test Automation Setup

**Before:**
```
1. Use cs-qa-engineer for planning
2. Use tester for execution patterns
3. Use cs-tdd-engineer for framework setup
```

**After:**
```
1. Use qa-engineer for comprehensive automation setup
2. Use core-testing-methodology skill for planning
3. Use testing-automation-patterns skill for patterns
```

### Scenario 3: Quality Assurance

**Before:**
```
1. Use cs-qa-engineer for broad QA
2. Use tester for validation
3. Use tdd-guardian for compliance
```

**After:**
```
1. Use qa-engineer for automation and infrastructure
2. Use tdd-guardian for TDD compliance coaching
3. Use individual engineers for development testing
```

## Transition Timeline

### Week 1-2: Awareness & Planning
- [ ] Review this migration guide
- [ ] Identify current agent usage patterns
- [ ] Plan transition for your workflows
- [ ] Update documentation references

### Week 3-4: Gradual Transition
- [ ] Start using new agents for new projects
- [ ] Update automated workflows and scripts
- [ ] Train team on new agent purposes
- [ ] Monitor adoption and gather feedback

### Week 5-6: Full Adoption
- [ ] Update all CI/CD and automation scripts
- [ ] Complete documentation updates
- [ ] Remove references to deprecated agents
- [ ] Validate that all use cases are covered

## Getting Help

### If You're Unsure Which Agent to Use

**Decision Tree:**
```
Do you need TDD methodology coaching?
├── Yes → Use tdd-guardian
└── No → Do you need test automation/infrastructure?
    ├── Yes → Use qa-engineer
    └── No → Use appropriate engineer agent (cs-frontend-engineer, etc.)
```

### Common Questions

**Q: "I used to get implementation examples from tdd-guardian. Where do I get those now?"**
A: Use the appropriate engineer agent for your technology stack (cs-frontend-engineer, cs-backend-engineer, etc.)

**Q: "I used tester for running tests. What's the replacement?"**
A: Use qa-engineer for automation infrastructure, or individual engineers for development-time testing.

**Q: "cs-tdd-engineer had comprehensive TDD tooling. Where did that go?"**
A: TDD is now every engineer's responsibility. Use tdd-guardian for methodology and appropriate engineers for implementation.

**Q: "I need both TDD coaching AND automation help"**
A: Use both agents: tdd-guardian for methodology, qa-engineer for automation infrastructure.

## Benefits of the New Structure

### For Developers
- **Clear separation** between methodology and implementation
- **Consistent TDD coaching** from dedicated agent
- **Better automation support** from specialized QA agent
- **Faster resolution** with focused agent responsibilities

### For Teams
- **Reduced confusion** about which agent to use
- **Consistent practices** across projects
- **Better scalability** as team grows
- **Clearer specialization** and expertise areas

### For Quality
- **TDD as standard** practice, not separate role
- **Automation focus** for QA engineering
- **Comprehensive coverage** of testing needs
- **Measurable improvements** in testing practices

## Success Metrics

Track these indicators to measure successful adoption:

- **Agent Usage Clarity**: >80% of team correctly identifies which agent to use
- **Resolution Time**: 30% faster issue resolution with focused agents
- **TDD Compliance**: 90%+ of features follow TDD process
- **Test Automation**: 95%+ of tests automated vs manual
- **Team Satisfaction**: Improved experience with clearer agent roles

## Need More Help?

If you encounter issues during migration or need clarification on specific scenarios:

1. **Review the agent descriptions** in their respective files
2. **Check the skills documentation** for detailed patterns
3. **Consult the OVERLAP_ANALYSIS.md** for the full analysis
4. **Reach out to the team** for additional guidance

This migration represents a significant improvement in our testing agent ecosystem, providing clearer responsibilities and better support for modern development practices.