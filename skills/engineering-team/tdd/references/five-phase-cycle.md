# Five-Phase TDD Cycle

## Overview

The five-phase cycle extends the classic RED-GREEN-REFACTOR with explicit preparation and commit phases, adding gate criteria between each transition. This ensures disciplined outside-in TDD where every phase transition is validated before proceeding.

```
PREPARE ──► RED_ACCEPTANCE ──► RED_UNIT ──► GREEN ──► COMMIT
   │                                                     │
   └─────────────────── next cycle ◄─────────────────────┘
```

Each phase has an entry condition (the previous phase's gate) and an exit gate that must be satisfied before moving to the next phase.

## Phase 1: PREPARE

**Purpose:** Understand the requirement, identify the acceptance criterion, and plan the test approach before writing any code.

**Activities:**
- Read and understand the requirement or user story
- Identify the acceptance criterion for this cycle (one behavior at a time)
- Determine the driving port (entry point) and expected outcome
- Identify which driven ports (dependencies) need test doubles
- Plan the acceptance test structure (Given/When/Then)

**What NOT to do:**
- Do not write any production code
- Do not write any test code yet
- Do not start implementing "obvious" pieces

### Gate: PREPARE -> RED_ACCEPTANCE

Before moving to RED_ACCEPTANCE, verify:

- [ ] **Single behavior identified:** One clear, testable acceptance criterion
- [ ] **Entry point known:** Which driving port or public API the test will exercise
- [ ] **Expected outcome defined:** What observable result proves the behavior works
- [ ] **Dependencies identified:** Which driven ports need fakes/mocks/stubs
- [ ] **No ambiguity:** The requirement is understood well enough to write a failing test

If any gate criterion is not met, stay in PREPARE. Ask clarifying questions, review requirements, or break the behavior into smaller pieces.

## Phase 2: RED_ACCEPTANCE

**Purpose:** Write a failing acceptance test that describes the desired behavior from the user/customer perspective. This is the outer loop of double-loop TDD.

**Activities:**
- Write one acceptance test expressing the business behavior
- The test exercises the system through the driving port
- Assert on observable outcomes (state changes, return values, side effects at driven ports)
- Run the test and confirm it fails for the right reason

**What NOT to do:**
- Do not write production code to make it pass
- Do not write unit tests yet
- Do not write multiple acceptance tests at once

**Walking skeleton exception:** For the first slice of a new feature (walking skeleton), skip RED_UNIT and GREEN inner loops. Go directly from RED_ACCEPTANCE to GREEN with the thinnest possible implementation, then COMMIT.

### Gate: RED_ACCEPTANCE -> RED_UNIT

Before moving to RED_UNIT, verify:

- [ ] **Test exists:** Exactly one new acceptance test written
- [ ] **Test fails:** The acceptance test fails (not errors) when run
- [ ] **Fails for the right reason:** Failure is due to missing behavior, not typos or setup errors
- [ ] **Failure message is clear:** The assertion failure communicates what behavior is missing
- [ ] **Other tests still pass:** No existing tests broken by the new test setup

If the test errors (does not compile, throws unexpected exceptions), fix the test setup. If the test passes immediately, the behavior already exists -- either the test is wrong or the requirement is already met.

## Phase 3: RED_UNIT

**Purpose:** Write a failing unit test for the next small piece of implementation needed to move toward the acceptance test passing. This is the inner loop of double-loop TDD.

**Activities:**
- Identify the next smallest unit of behavior needed
- Write one unit test through the appropriate driving port (application service, module API)
- Mock only at port boundaries (external dependencies)
- Use real domain objects within the hexagon
- Run the test and confirm it fails for the right reason

**What NOT to do:**
- Do not write production code yet
- Do not write multiple unit tests at once
- Do not mock internal collaborators (entities, value objects, domain services)

### Gate: RED_UNIT -> GREEN

Before moving to GREEN, verify:

- [ ] **Test exists:** Exactly one new unit test written
- [ ] **Test fails:** The unit test fails (not errors) when run
- [ ] **Fails for the right reason:** Failure is due to missing implementation, not test bugs
- [ ] **Scope is small:** The test covers one unit of behavior (minutes to implement, not hours)
- [ ] **Other tests still pass:** No existing tests broken (except the acceptance test, which is expected to still be red)

If the unit test passes immediately, the behavior already exists. Either refine the test or move to a different unit of behavior.

## Phase 4: GREEN

**Purpose:** Write the minimum production code to make the failing unit test pass. Then assess whether the acceptance test also passes.

**Activities:**
- Write ONLY enough code to make the current unit test pass
- Resist adding functionality not demanded by the test
- Run the unit test and confirm it passes
- Run ALL tests to check for regressions
- Assess refactoring opportunities (improve names, extract duplication, simplify)
- If refactoring, keep all tests green throughout
- Check whether the acceptance test now passes

**What NOT to do:**
- Do not add features beyond what the failing test requires
- Do not refactor while tests are red
- Do not skip running the full test suite

**After GREEN, two paths:**

1. **Acceptance test still RED:** Return to RED_UNIT for the next inner-loop cycle
2. **Acceptance test now GREEN:** Proceed to COMMIT

```
                    ┌─── acceptance still RED ───► RED_UNIT (inner loop)
GREEN ──► check ────┤
                    └─── acceptance now GREEN ──► COMMIT
```

### Gate: GREEN -> COMMIT (or GREEN -> RED_UNIT)

Before proceeding, verify:

- [ ] **Unit test passes:** The current unit test is green
- [ ] **All tests pass:** No regressions in the full test suite
- [ ] **Minimum code only:** No speculative additions beyond what tests demand
- [ ] **Refactoring complete:** Any refactoring done with tests staying green
- [ ] **Acceptance test checked:** Know whether the outer loop is satisfied

If moving back to RED_UNIT: the acceptance test is still red, and there is more inner-loop work to do.

If moving to COMMIT: the acceptance test is green, and the full behavior is implemented.

## Phase 5: COMMIT

**Purpose:** Lock in the completed behavior with a clean commit. The acceptance test and all unit tests are green.

**Activities:**
- Run the full test suite one final time
- Verify code quality (linting, type checking, formatting)
- Create a commit with a conventional commit message
- The commit message should describe the business behavior, not implementation details

**Commit message format:**
```
feat(scope): describe the business behavior

- Acceptance: <what user-visible behavior was added>
- Implementation: <brief note on approach if non-obvious>
```

### Gate: COMMIT -> PREPARE (next cycle)

Before starting the next cycle, verify:

- [ ] **All tests pass:** Full suite green including acceptance tests
- [ ] **Commit created:** Changes committed with descriptive message
- [ ] **Quality checks pass:** Lint, type-check, format all clean
- [ ] **No leftover work:** No TODO comments or partial implementations

The cycle then repeats from PREPARE with the next behavior.

## Complete Cycle Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  PREPARE                                                    │
│  - Understand requirement                                   │
│  - Identify single behavior                                 │
│  - Plan test approach                                       │
│                                                             │
│  Gate: behavior identified, entry point known,              │
│        outcome defined, no ambiguity                        │
│                                                             │
├──────────────────────┬──────────────────────────────────────┤
│                      ▼                                      │
│  RED_ACCEPTANCE                                             │
│  - Write ONE failing acceptance test                        │
│  - Verify it fails for the right reason                     │
│                                                             │
│  Gate: test fails (not errors), clear failure message,      │
│        other tests still pass                               │
│                                                             │
├──────────────────────┬──────────────────────────────────────┤
│                      ▼                                      │
│  ┌─────────────────────────────────────┐                    │
│  │  RED_UNIT (inner loop)              │                    │
│  │  - Write ONE failing unit test      │                    │
│  │  - Verify it fails correctly        │                    │
│  │                                     │                    │
│  │  Gate: test fails, small scope,     │                    │
│  │        other tests pass             │                    │
│  │              │                      │                    │
│  │              ▼                      │                    │
│  │  GREEN                              │                    │
│  │  - Minimum code to pass             │                    │
│  │  - Run all tests                    │                    │
│  │  - Refactor if valuable             │                    │
│  │  - Check acceptance test            │                    │
│  │              │                      │                    │
│  │    ┌─────────┴──────────┐           │                    │
│  │    │                    │           │                    │
│  │    ▼                    ▼           │                    │
│  │  acceptance           acceptance    │                    │
│  │  still RED            now GREEN     │                    │
│  │    │                    │           │                    │
│  │    └──► RED_UNIT ◄──┘  │           │                    │
│  │         (repeat)        │           │                    │
│  └─────────────────────────┼───────────┘                    │
│                            ▼                                │
│  COMMIT                                                     │
│  - Full test suite green                                    │
│  - Quality checks pass                                      │
│  - Commit with descriptive message                          │
│                                                             │
│  Gate: all tests pass, commit created,                      │
│        quality checks clean                                 │
│                                                             │
├──────────────────────┬──────────────────────────────────────┤
│                      ▼                                      │
│  ───► PREPARE (next cycle)                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Phase Summary Table

| Phase | Purpose | Key Activity | Gate Criteria |
|-------|---------|-------------|---------------|
| PREPARE | Understand requirement | Identify single behavior and test approach | Behavior identified, entry point known, outcome defined |
| RED_ACCEPTANCE | Outer loop test | Write ONE failing acceptance test | Test fails for right reason, other tests pass |
| RED_UNIT | Inner loop test | Write ONE failing unit test | Test fails for right reason, small scope |
| GREEN | Implement | Minimum code to pass, refactor, check acceptance | Unit test green, all tests pass, no speculative code |
| COMMIT | Lock in | Full suite green, quality checks, commit | All tests pass, commit created, quality clean |

## Relationship to Classic TDD

The five-phase cycle wraps classic RED-GREEN-REFACTOR (which maps to RED_UNIT and GREEN) with:

- **PREPARE** before the cycle: explicit planning prevents writing the wrong test
- **RED_ACCEPTANCE** before inner loops: the outer loop ensures every unit test serves a real user need
- **COMMIT** after the cycle: explicit verification prevents committing broken or incomplete work

Teams already practicing classic TDD can adopt the five-phase cycle incrementally -- start by adding PREPARE (planning before testing) and COMMIT (verification before committing), then introduce RED_ACCEPTANCE for features that benefit from outside-in design.
