# Acceptance Test Design Mandates

Full specifications for the three design mandates summarized in the parent SKILL.md. All three must pass before acceptance tests are considered complete.

## Mandate 1: Hexagonal Boundary Enforcement

Tests invoke through driving ports (entry points), never internal components.

### Driving Ports (Test Through These)

- Application services / orchestrators
- API controllers / CLI handlers
- Message consumers / event handlers
- Public API facade classes

### Not Entry Points (Never Test Directly)

- Internal validators, parsers, formatters
- Domain entities or value objects
- Repository implementations
- Internal service components

### Correct Pattern

```typescript
// Invoke through system entry point (driving port)
import { AppOrchestrator } from '../src/orchestrator'

when('user performs action', ({ context }) => {
  const orchestrator = new AppOrchestrator()
  result = orchestrator.performAction({ context })
})
```

### Violation Pattern

```typescript
// Invoking internal component directly
import { InputValidator } from '../src/validator' // INTERNAL

when('user validates input', ({ input }) => {
  const validator = new InputValidator() // WRONG BOUNDARY
  result = validator.validate(input)
})
```

### Why It Matters

Testing internal components creates Testing Theater: tests pass but users cannot access the feature through the actual entry point. Integration wiring bugs remain hidden.

## Mandate 2: Business Language Abstraction

Step methods speak business language, abstract all technical details.

### Three Abstraction Layers

**Layer 1 - Gherkin**: Pure business language, accessible to all stakeholders.

- Use domain terms from ubiquitous language
- Zero technical jargon (no HTTP, database, API, JSON terms)
- Describe WHAT user does, not HOW system does it

```gherkin
Scenario: Customer places order for available product
  Given customer has items in shopping cart
  When customer submits order
  Then order is confirmed
  And customer receives confirmation email
```

**Layer 2 - Step Definitions**: Business service delegation, abstract infrastructure.

- Method names use business domain terms
- Delegate to business service layer (OrderService, not HTTP client)
- Assert business outcomes (order.isConfirmed()), not technical state (statusCode === 201)

```typescript
when('customer submits order', () => {
  result = orderService.placeOrder({
    customer,
    items: cartItems,
  })
})

then('order is confirmed', () => {
  expect(result.isConfirmed()).toBe(true)
  expect(result.hasOrderNumber()).toBe(true)
})
```

**Layer 3 - Business Services**: Production services handle technical implementation. Technical details (HTTP calls, database transactions, SMTP) hidden inside service layer.

### Test Smell Indicators

- `fetch()` or HTTP client calls in step definitions
- `db.query()` in step definitions
- `expect(response.status).toBe(200)`
- Technical terms in Gherkin (HTTP, REST, JSON, database)

## Mandate 3: User Journey Completeness

Tests validate complete user journeys with business value, not isolated technical operations.

### Complete Journey Structure

Every scenario includes:

- **User trigger**: Given/When - what user does or business event occurs
- **Business logic**: When - system processes business rules
- **Observable outcome**: Then - user sees result
- **Business value**: Then - value delivered (confirmation, data, access)

### Correct Example

```gherkin
Scenario: Customer successfully completes purchase
  Given customer has selected products worth $150
  And customer has valid payment method
  When customer submits order
  Then order is confirmed with order number
  And customer receives email confirmation
  And order appears in customer's order history
```

### Violation Example

```gherkin
Scenario: Order validator accepts valid order data
  Given valid order JSON exists
  When validator.validate() is called
  Then validation passes
# Tests isolated validation, not user journey
```

### Scenario Name Test

Does the scenario name express user value or a technical operation?

- "Customer completes purchase" = correct
- "Validator accepts JSON" = violation

## Mandate Compliance Verification

Handoff to implementation includes proof that all three mandates pass:

- **Mandate 1**: All test files import entry points (driving ports), zero internal component imports
- **Mandate 2**: Gherkin scenarios use business terms only, step definitions delegate to services
- **Mandate 3**: Scenarios validate complete user journeys with business value

Evidence format: import listings, grep results for technical terms, walking skeleton identification and focused scenario count.
