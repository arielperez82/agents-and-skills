# Strategic vs Tactical Planning Analysis

**Date**: 2026-01-26  
**Context**: Phase 8 of Guardians/Monitors/Validators cleanup  
**Question**: Do we need separate strategic and tactical planners?

## Executive Summary

**Decision: Keep Option A - Single Planner (cs-implementation-planner) with Delegation Pattern**

Tactical TDD planning is already handled by specialized guardians (cs-tpp-guardian, cs-tdd-guardian, cs-progress-guardian). cs-implementation-planner should create strategic plans and delegate tactical TDD guidance to these guardians when needed. No split is warranted.

## Current State

**cs-implementation-planner** currently handles:
- Strategic planning: High-level phases, dependencies, milestones, risk assessment, portfolio alignment
- Some tactical elements: Step-by-step breakdown, sprint-sized increments

**Question**: Should tactical TDD-focused planning be separated?

## Definitions

### Strategic Planning
- **Scope**: High-level phases (weeks/months)
- **Focus**: Dependencies, milestones, risk assessment, resource allocation
- **Output**: Phased implementation roadmap with decision gates
- **Example**: "Phase 1: Research (2 weeks) → Phase 2: Backend (3 weeks) → Phase 3: Frontend (2 weeks)"

### Tactical Planning (TDD-Focused)
- **Scope**: Individual test ordering, transformation guidance
- **Focus**: Test-first approach, TPP transformations, RED-GREEN-REFACTOR cycles
- **Output**: Test sequence recommendations, transformation choices
- **Example**: "Test 1: null case → Test 2: simple case → Test 3: edge case (use constant→scalar transformation)"

## Analysis: Is Tactical Planning Already Covered?

### Existing Agents That Handle Tactical TDD Planning

**1. cs-tpp-guardian** (Transformation Priority Premise Coach)
- **Purpose**: Strategic TDD coach for test selection and transformation guidance
- **Handles**: 
  - Planning test order for TDD cycles
  - Choosing which tests to write next
  - Selecting transformations to make tests pass
  - Detecting and resolving TDD impasses
- **Verdict**: ✅ **ALREADY HANDLES** tactical TDD planning (test ordering, transformation guidance)

**2. cs-tdd-guardian** (TDD Methodology Coach)
- **Purpose**: TDD methodology coaching and RED-GREEN-REFACTOR guidance
- **Handles**:
  - TDD principles and test-first approaches
  - Structuring RED-GREEN-REFACTOR cycles
  - Reviewing code for TDD compliance
- **Verdict**: ✅ **ALREADY HANDLES** tactical TDD methodology

**3. cs-progress-guardian** (Progress Tracking Validator)
- **Purpose**: Step-by-step progress tracking using PLAN.md, WIP.md, LEARNINGS.md
- **Handles**:
  - Creating step-by-step tracking documents
  - Validating progress through TDD cycles
  - Managing RED-GREEN-REFACTOR status
- **Verdict**: ✅ **ALREADY HANDLES** tactical step-by-step tracking

### Gap Analysis

**What cs-implementation-planner does:**
- Creates strategic plans with phases and milestones
- Breaks down work into sprint-sized increments
- Identifies dependencies and risks
- Aligns with product requirements and portfolio

**What tactical TDD planning would do:**
- Order individual tests within a step
- Recommend transformations for passing tests
- Guide RED-GREEN-REFACTOR cycles
- Detect TDD impasses

**Conclusion**: Tactical TDD planning is **ALREADY COVERED** by cs-tpp-guardian, cs-tdd-guardian, and cs-progress-guardian. There is no gap.

## Option Analysis

### Option A: Keep Single Planner (Recommended ✅)

**Approach**: cs-implementation-planner creates strategic plans, delegates tactical TDD guidance to guardians

**Workflow**:
```
1. cs-implementation-planner → Creates strategic plan:
   - Phase 1: User authentication (2 weeks)
     - Step 1.1: Implement JWT token generation
     - Step 1.2: Implement token validation
     - Step 1.3: Implement refresh token flow
   
2. During execution, for each step:
   - Developer consults cs-tpp-guardian: "Which test should I write first?"
   - cs-tpp-guardian: "Start with null case test, use (nil→constant) transformation"
   - Developer consults cs-tdd-guardian: "Is this TDD-compliant?"
   - cs-tdd-guardian: "Yes, following RED-GREEN-REFACTOR correctly"
   - cs-progress-guardian tracks progress in WIP.md
```

**Pros**:
- ✅ No duplication - tactical planning already handled by guardians
- ✅ Clear separation: Strategic (planner) vs Tactical (guardians)
- ✅ Single source of truth for strategic planning
- ✅ Guardians remain focused on their domains
- ✅ No new agents needed

**Cons**:
- ⚠️ Requires developers to know when to consult guardians (but this is already the pattern)

**Verdict**: ✅ **RECOMMENDED** - This is the correct pattern

### Option B: Split into cs-strategic-planner and cs-tactical-planner

**Approach**: Separate agents for strategic vs tactical planning

**Pros**:
- Clear separation of concerns

**Cons**:
- ❌ Duplicates existing guardian functionality (cs-tpp-guardian already does tactical TDD planning)
- ❌ Creates confusion: When to use cs-tactical-planner vs cs-tpp-guardian?
- ❌ Adds unnecessary complexity
- ❌ Breaks existing workflow patterns

**Verdict**: ❌ **NOT RECOMMENDED** - Would create overlap with existing guardians

### Option C: cs-implementation-planner for strategic, add cs-tdd-planner for tactical

**Approach**: Keep strategic planner, add new tactical TDD planner

**Pros**:
- Keeps strategic planning separate

**Cons**:
- ❌ Duplicates cs-tpp-guardian functionality
- ❌ Creates confusion: cs-tdd-planner vs cs-tpp-guardian vs cs-tdd-guardian?
- ❌ Adds unnecessary agent
- ❌ Breaks existing patterns

**Verdict**: ❌ **NOT RECOMMENDED** - Would duplicate existing guardian functionality

## Recommended Solution

### Keep Option A with Enhanced Collaboration

**cs-implementation-planner** should:
1. Create strategic implementation plans with TDD-aware steps
2. Document that tactical TDD guidance should come from guardians
3. Add collaboration patterns with cs-tpp-guardian and cs-tdd-guardian

**Implementation**:
- Add collaboration documentation to cs-implementation-planner:
  ```yaml
  collaborates-with:
    - agent: cs-tpp-guardian
      purpose: Tactical TDD planning - test ordering and transformation guidance within strategic plan steps
      required: optional
      when: When strategic plan steps need TDD test ordering guidance
    - agent: cs-tdd-guardian
      purpose: TDD methodology validation for strategic plan steps
      required: optional
      when: When validating that strategic plan steps follow TDD principles
  ```

**Workflow Clarification**:
- **Strategic Planning**: cs-implementation-planner creates high-level phases and steps
- **Tactical TDD Planning**: cs-tpp-guardian provides test ordering and transformation guidance for each step
- **TDD Methodology**: cs-tdd-guardian ensures TDD compliance
- **Progress Tracking**: cs-progress-guardian tracks execution through PLAN.md/WIP.md

## Decision

**✅ RECOMMENDATION: Keep Option A - Single Planner with Delegation Pattern**

**Rationale**:
1. Tactical TDD planning is already handled by specialized guardians
2. No gap exists that requires a new agent
3. Current pattern (strategic planner + tactical guardians) is correct
4. Adding a tactical planner would create confusion and duplication

**Action Items**:
1. ✅ Document decision in OVERLAP_ANALYSIS.md
2. ⚠️ Add collaboration patterns to cs-implementation-planner (optional enhancement)
3. ✅ No new agents needed

## Conclusion

The question "Do we need separate strategic and tactical planners?" is answered: **No**. Tactical TDD planning is already comprehensively handled by cs-tpp-guardian, cs-tdd-guardian, and cs-progress-guardian. cs-implementation-planner should focus on strategic planning and delegate tactical TDD guidance to these guardians when needed.

This maintains clear separation of concerns:
- **Strategic Planning** → cs-implementation-planner
- **Tactical TDD Planning** → cs-tpp-guardian, cs-tdd-guardian, cs-progress-guardian

No split is warranted.
