---
name: acceptance-test-design
description: BDD outer-loop methodology for acceptance tests - walking skeleton strategy, driving-port-only testing, business language purity, and design mandates that connect to the TDD inner loop
---

# Acceptance Test Design

Design acceptance tests that validate business outcomes through public interfaces, decoupled from implementation details. This skill covers the outer loop of outside-in double-loop TDD.

## Outside-In Double-Loop TDD

Acceptance tests form the outer loop. Unit tests form the inner loop. Development starts from the user's perspective and drives inward.

**Outer loop (acceptance/BDD):** hours to days, user perspective, business language, defines "done."

- Written from outside: what does the user want? What do they observe?
- Scenarios describe user goals and observable outcomes, not system internals
- A failing outer-loop test is the starting signal for implementation

**Inner loop (unit/TDD):** minutes, developer perspective, technical terms, implements components.

- Driven from inside: how does the system fulfill the user's goal?

### Workflow

1. Write failing acceptance test from user's perspective (outer loop)
2. Drop to inner loop: unit tests to implement components
3. Iterate inner loop until acceptance test passes
4. The passing acceptance test proves user value is delivered
5. Repeat for next behavior

Outer loop defines WHAT users need. Inner loop drives HOW to build it.

## Given-When-Then Structure

```gherkin
Scenario: [Business-focused title describing one behavior]
  Given [preconditions - system state in business terms]
  When [single user action or business event]
  Then [observable business outcome]
```

### Scenario Writing Rules

1. **One scenario, one behavior.** Split multi-behavior scenarios into focused singles.
2. **Declarative, not imperative.** Describe business outcomes, not UI interactions. "When I log in with valid credentials" not "When I click Login button and enter email in field."
3. **Concrete examples, not abstractions.** Use specific values: "Given my account balance is $100.00" not "Given the user has sufficient funds."
4. **Keep scenarios short (3-5 steps).** If longer, you are testing multiple behaviors or including irrelevant details.
5. **Background for shared Given steps only.** Actions and validations belong in scenarios.

### Scenario Categorization

- **Happy path**: Primary successful user workflows
- **Error path**: Invalid inputs, failures, unauthorized access (target 40%+ of scenarios)
- **Edge case**: Boundary conditions, unusual but valid behavior
- **Integration**: Cross-component and cross-system interactions

For each capability, test the golden path, alternative paths, and error paths. Select representative examples that reveal different business rules. Do not test every combination.

### Scenario Outlines for Boundary Testing

```gherkin
Scenario Outline: Account minimum balance validation
  Given I have an account with balance $<initial_balance>
  When I attempt to withdraw $<withdrawal_amount>
  Then the withdrawal is <result>

  Examples: Valid withdrawals
    | initial_balance | withdrawal_amount | result   |
    | 100.00         | 50.00            | accepted |
    | 25.00          | 25.00            | accepted |

  Examples: Invalid withdrawals
    | initial_balance | withdrawal_amount | result                       |
    | 100.00         | 101.00           | rejected (insufficient funds) |
```

Use outlines for boundary conditions and calculation variations. Avoid when scenarios diverge structurally.

## Three Design Mandates

Every acceptance test must satisfy these three mandates. See `references/design-mandates.md` for full details with code examples.

### Mandate 1: Hexagonal Boundary Enforcement

Tests invoke through driving ports (entry points), never internal components.

**Test through these (driving ports):**

- Application services / orchestrators
- API controllers / CLI handlers
- Message consumers / event handlers
- Public API facade classes

**Never test directly (internals):**

- Internal validators, parsers, formatters
- Domain entities or value objects
- Repository implementations
- Internal service components

Testing internal components creates Testing Theater: tests pass but users cannot access the feature through the actual entry point. Integration wiring bugs remain hidden.

### Mandate 2: Business Language Abstraction

Three abstraction layers separate business language from technical details:

| Layer | Content | Example |
|-------|---------|---------|
| Gherkin | Pure business language, zero technical jargon | "When customer submits order" |
| Step definitions | Business service delegation | `orderService.placeOrder(customer, items)` |
| Business services | Technical implementation hidden | HTTP calls, DB transactions inside |

**Test smell indicators:** HTTP clients in step definitions, database queries in step definitions, status code assertions, technical terms in Gherkin (HTTP, REST, JSON, database).

### Mandate 3: User Journey Completeness

Every scenario includes: user trigger (Given/When), business logic processing (When), observable outcome (Then), and business value delivery (Then).

**Scenario name test:** Does the name express user value or a technical operation? "Customer completes purchase" = correct. "Validator accepts JSON" = violation.

## Walking Skeleton Strategy

Balance user-centric E2E integration tests with focused boundary tests.

### Walking Skeletons (2-5 per feature)

- Trace a thin vertical slice that delivers observable user value end-to-end
- Each skeleton answers: "Can a user accomplish this goal and see the result?"
- Express the simplest complete user journey, not layer-by-layer connectivity
- Validate that the system delivers value a stakeholder could demo
- Touch all layers as a consequence of the user journey, not as a design goal

### Walking Skeleton Litmus Test

A walking skeleton is user-centric if:

1. The scenario title describes a user goal ("Customer purchases a product") not a technical flow ("Order passes through all layers")
2. The Given/When steps describe user actions and context, not system state setup
3. The Then steps describe what the user observes (confirmation, email, receipt), not internal side effects (database row inserted, message queued)
4. A non-technical stakeholder can read it and confirm "yes, that is what users need"

### Focused Scenarios (majority of suite)

- Test specific business rules at driving port boundary
- Use test doubles for external dependencies (faster, isolated)
- Cover business rule variations and edge cases
- Invoke through entry point (application service, orchestrator)

### Recommended Ratio

For a typical feature with 20 acceptance scenarios:

- 2-3 walking skeletons (user value E2E)
- 17-18 focused scenarios (boundary tests with test doubles)

Walking skeletons prove users can achieve their goals through the system. Focused scenarios run fast and cover breadth. Both use business language and invoke through entry points.

## Anti-Patterns

| Anti-Pattern | Fix |
|-------------|-----|
| Testing through UI | Test through service/API layer |
| Multiple When actions | Split into separate scenarios |
| Feature-coupled steps | Organize by domain concept |
| Conjunction steps ("Given A and B" as one step) | Break into atomic steps |
| Incidental details | Include only behavior-relevant information |
| Technical jargon in scenarios | Replace with business domain language |
| Abstract scenarios | Use concrete values and specific examples |
| Rambling scenarios (8+ steps) | Extract to 3-5 focused steps |

## Step Organization

Organize step definitions by domain concept, not by feature file:

```
steps/
  authentication.steps.ts   # All auth-related steps
  account.steps.ts          # All account-related steps
  transaction.steps.ts      # All transaction-related steps
```

## Living Documentation

Scenarios serve dual purpose: executable tests and living documentation.

Organization: Business Goal > Capability > Feature > Scenario > Test

Each scenario traces to business capability. Stakeholders see which capabilities are implemented, tested, and passing. Replace HTTP verbs with business actions, JSON with domain concepts, status codes with business outcomes.

## Mandate Compliance Checklist

Before implementation handoff, verify:

- [ ] **Mandate 1 (Boundary):** All test files import entry points (driving ports), zero internal component imports
- [ ] **Mandate 2 (Language):** Gherkin uses business terms only, step definitions delegate to services
- [ ] **Mandate 3 (Journey):** Scenarios validate complete user journeys with business value
- [ ] **Error coverage:** Error scenarios are at least 40% of total
- [ ] **Walking skeletons:** 2-5 per feature, all pass the litmus test
- [ ] **Scenario length:** All scenarios are 3-5 steps

## Consolidated References

This skill includes detailed reference documents:

- **Design Mandates** -- `references/design-mandates.md` -- Full mandate specifications with code examples and violation patterns
- **Critique Dimensions** -- `references/critique-dimensions.md` -- Six review dimensions for acceptance test quality assessment

Load these references on-demand when performing detailed design or review work.

## Related Skills

- **bdd-principles** -- Core BDD philosophy, Three Amigos, example mapping
- **tdd** -- Inner-loop TDD methodology (RED-GREEN-REFACTOR)
- **testing** -- General testing patterns and strategies
