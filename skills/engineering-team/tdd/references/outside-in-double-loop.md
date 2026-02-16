# Outside-In Double-Loop TDD

## Double-Loop Architecture

Outside-In TDD operates with two nested feedback loops:

**Outer loop (Acceptance Tests):** Customer/user perspective. Tests express business requirements as executable specifications. A single outer-loop test stays RED for hours or days while inner-loop cycles build the implementation incrementally.

**Inner loop (Unit Tests):** Developer perspective. Classic RED-GREEN-REFACTOR on individual units of behavior. Each cycle completes in minutes.

```
Outer Loop (ATDD)           Inner Loop (TDD)
  RED acceptance test ──────► RED unit test
       │                        │
       │                      GREEN unit test
       │                        │
       │                      REFACTOR
       │                        │
       │                      RED unit test (next piece)
       │                        │
       │                      GREEN unit test
       │                        │
       │                      REFACTOR
       │                        │
  GREEN acceptance test ◄───── (all inner cycles complete)
```

The outer loop drives WHAT to build. The inner loop drives HOW to build it. Never build components not required by an actual user scenario.

## Outside-In vs Inside-Out (Classic)

**Inside-Out (Classic/Bottom-Up):**
- Start with the innermost domain objects
- Discover collaborators through refactoring
- TDD guides design completely
- State verification preferred
- Less coupled to implementation details
- Survives refactoring better

**Outside-In (London/Top-Down):**
- Start at the entry point (API, controller, UI)
- Know collaborators upfront, mock them
- Implement each layer moving inward
- Behavior verification at boundaries
- Lighter setup per test
- More coupled to implementation (mitigate with port-boundary mocking only)

**When to use Outside-In:**
- Architectural boundaries are known (hexagonal/ports-and-adapters)
- Programming to interfaces, not implementations
- Building features that span multiple layers
- Team has clear domain model and bounded contexts

**When to use Inside-Out (Classic):**
- Exploring a new domain (design not yet known)
- Building isolated utilities or libraries
- Domain logic is the primary complexity
- Fewer collaborating layers

## The Outside-In Development Workflow

Based on the Bache approach:

1. **Write a Guiding Test (acceptance)** from the user perspective -- a thick slice of functionality
2. **Start at the top-level entry point**, design collaborating modules incrementally
3. **Use test doubles to experiment with interfaces/protocols** at port boundaries
4. **As each layer is implemented**, move to previously mocked collaborators and TDD them with real implementations
5. **Never build what is not needed** for actual user scenarios

## Port-to-Port Testing

Tests enter through the driving port (application service / public API) and assert outcomes at driven port boundaries. Internal classes (entities, value objects, domain services) are exercised indirectly -- never instantiated directly in test code.

```
Driving Port ──► Application ──► Domain ──► Driven Port (mocked)
```

```typescript
// Test through driving port (application service)
// Mock only at driven port boundaries (external dependencies)

it('processes payment when order is placed', () => {
  const paymentGateway = createMockPaymentGateway();
  const orderRepo = createInMemoryOrderRepository();

  const orderService = createOrderService({ paymentGateway, orderRepo });
  const result = orderService.placeOrder({
    customerId: 'cust-123',
    items: [{ productId: 'prod-1', quantity: 2 }],
  });

  expect(result.isConfirmed).toBe(true);
  expect(paymentGateway.chargeCalledWith).toEqual(
    expect.objectContaining({ amount: 100.00 })
  );
});
```

## Unit of Behavior (Not Unit of Code)

A test is a story about the problem your code solves. Granularity relates to stakeholder needs, not class boundaries.

A unit of behavior may span multiple classes. Test from driving port to driven port boundary.

Key question: "Can I explain this test to a stakeholder?" If not, you are testing implementation details.

## Test Doubles Policy

**Mock at port boundaries only:**
- `MockPaymentGateway` -- external payment service port
- `MockEmailService` -- external email provider port
- `InMemoryUserRepository` -- fake for fast tests (implements repository port)

**Do not mock inside the hexagon:**
- Domain entities (Order, Customer) -- use real objects
- Value objects (Money, Email) -- cheap to create, deterministic
- Application services (OrderProcessor) -- use real with mocked ports
- Domain services (PricingService) -- use real objects

**Strategic combination:** Behavior verification at layer boundaries, state verification within layers.

## Test Doubles Taxonomy

| Type | Purpose | Example |
|------|---------|---------|
| Dummy | Passed but never used | Placeholder dependency |
| Fake | Working implementation with shortcuts | In-memory database |
| Stub | Predefined answers to calls | Fixed return values |
| Spy | Stub that records interactions | Call tracking |
| Mock | Pre-programmed expectations | Behavior verification |

Choose by need: mock for interaction design at boundaries, stub when you don't care about interaction details, fake for integration bridges.

## Hexagonal Architecture Testing Strategy

### Domain Layer
Tested indirectly through driving port (application service) unit tests with real domain objects. Domain entities, value objects, and domain services are implementation details.

**Exception:** Standalone domain logic with complex algorithms (e.g., pricing engine) MAY be tested directly when complexity warrants it and the class has a stable public interface. This is the exception, not the rule.

### Application Layer
Classical TDD within the layer, mockist TDD at port boundaries. Use real domain objects (Order, Money, Customer) in application service tests. Mock port interfaces (PaymentGateway, EmailService) when testing orchestration.

### Infrastructure Layer
Integration tests ONLY -- no unit tests for adapters. Mocking infrastructure inside an adapter test is testing the mock, not the adapter. Use real infrastructure (testcontainers, in-memory databases) to verify actual behavior.

### E2E Tests
Minimal mocking -- only truly external systems (third-party APIs beyond your control). Use real domain services, application services, and repositories.

## Walking Skeleton

A walking skeleton is the thinnest possible end-to-end slice that proves the architecture works. At most one walking skeleton per new feature.

**Walking skeleton protocol:**
1. Write exactly ONE acceptance test proving end-to-end wiring
2. Implement the thinnest possible slice -- hardcoded values, minimal branching
3. Do NOT write unit tests -- the acceptance test IS the deliverable
4. Do NOT add error handling, edge cases, or validation
5. Skip the inner TDD loop; go directly from RED acceptance to GREEN

The walking skeleton is the one justified acceptance test per feature. Once green, subsequent scenarios are built through normal double-loop TDD.

## E2E Test Management

Enable ONE acceptance test at a time to prevent commit blocks:

1. All acceptance tests except the first are marked with `skip` / `it.skip`
2. Complete the first scenario through outside-in TDD
3. Commit the working implementation
4. Enable the next acceptance test
5. Repeat until all scenarios are implemented

## ATDD Integration (Lightweight)

Lightweight ATDD avoids the heavyweight ceremony of traditional approaches:

- **Few** Given/When/Then examples, not many
- **Separate** requirements (communicate intent) from tests (verify behavior)
- **Smallest subset** of the team with relevant skills
- **Value** = shared understanding, not executable specifications
- **Automate** only where high-value

## BDD Connection

BDD emerged from outside-in TDD. Given (context) / When (action) / Then (outcome) maps naturally to the outside-in mindset. BDD reframes TDD as a design and specification technique, not just testing. Use Gherkin pragmatically -- automate only where the value justifies the cost.

## Business-Focused Testing

### Naming Conventions

- **Describe block:** `<DrivingPort>` or `<Feature>`
- **Test name:** `<expected outcome> when <specific behavior> [given <preconditions>]`
- Example: `increases balance when deposit is made given sufficient funds`

### Behavior Types

| Type | Pattern | Structure |
|------|---------|-----------|
| Command | Changes system state | Given-When-Then |
| Query | Returns state projection | Given-Then |
| Process | Orchestrates multiple operations | Given-When-Then (multi-assert) |

### Test Structure

```typescript
it('confirms order when payment succeeds', () => {
  // Arrange: set up business context
  const gateway = createStubPaymentGateway({ willSucceed: true });
  const service = createOrderService({ paymentGateway: gateway });

  // Act: perform business action
  const result = service.placeOrder(validOrderRequest());

  // Assert: validate business outcome
  expect(result.status).toBe('confirmed');
});
```
