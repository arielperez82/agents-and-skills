# Testing Theater Anti-Patterns

Tests that create the illusion of safety without verifying real behavior. Testing Theater is the single most dangerous test quality issue -- a test suite with Theater is worse than no tests, because the team believes the code is tested when it is not.

## Definition

**Testing Theater** occurs when tests pass regardless of whether the production code is correct. The tests give false confidence: coverage numbers look healthy, the green bar is reassuring, but the tests would not catch a real bug.

The defining characteristic: **delete or break the production code, and the test still passes.**

## The Seven Anti-Patterns

### 1. Tautological Assertion

The test asserts something that is always true, regardless of what the production code does.

```typescript
// THEATER: these assertions never fail
expect(result).not.toBeNull();
expect(result).toBeDefined();
expect(typeof result).toBe('object');
expect(result instanceof Response).toBe(true);
```

**Why it is dangerous:** The test passes even if the result contains completely wrong data. Asserting existence or type without asserting correctness proves nothing about behavior.

**Fix:** Assert on specific behavioral outcomes:

```typescript
// REAL: asserts the actual business result
expect(result.status).toBe('approved');
expect(result.amount).toBe(150.00);
expect(result.approvedAt).toBeInstanceOf(Date);
```

**Severity:** CRITICAL

### 2. Mock-Dominated Test

The test mocks the system under test or sets up mocks that return the expected value directly. The production code is not exercised at all.

```typescript
// THEATER: the mock returns what the assertion expects
const service = { calculateTotal: vi.fn().mockReturnValue(100) };
const result = service.calculateTotal(items);
expect(result).toBe(100); // Tests the mock, not the code
```

**Why it is dangerous:** Removing the real `calculateTotal` implementation has zero effect on the test. The test verifies mock configuration, not business logic.

**Fix:** Use real objects for the system under test. Only mock external dependencies at boundaries:

```typescript
// REAL: real service, mocked dependency at boundary
const paymentGateway = createMockPaymentGateway();
const service = new OrderService(paymentGateway);
const result = service.calculateTotal(items);
expect(result).toBe(100); // Tests real calculation logic
```

**Severity:** CRITICAL

### 3. Circular Verification

The test recomputes the expected value using the same formula as the production code.

```typescript
// THEATER: duplicates production logic
const items = [{ price: 10, qty: 3 }, { price: 20, qty: 1 }];
const expected = items.reduce((sum, i) => sum + i.price * i.qty, 0);
const result = orderService.calculateTotal(items);
expect(result).toBe(expected); // Same formula, always passes
```

**Why it is dangerous:** If the production formula has a bug (e.g., ignoring tax), the test has the same bug. The test cannot catch what it replicates.

**Fix:** Use hardcoded expected values derived from business rules:

```typescript
// REAL: expected value from business knowledge, not code
const items = [{ price: 10, qty: 3 }, { price: 20, qty: 1 }];
const result = orderService.calculateTotal(items);
expect(result).toBe(50); // Known correct answer
```

**Severity:** CRITICAL

### 4. Always-Green Test

The test structure prevents failure through error swallowing, missing assertions, or unconditional success paths.

```typescript
// THEATER: try/catch swallows the failure
it('processes payment', async () => {
  try {
    const result = await paymentService.charge(amount);
    expect(result.success).toBe(true);
  } catch {
    // Test passes even when it throws
  }
});

// THEATER: no assertion at all
it('loads user data', () => {
  const user = userService.getById('user-123');
  // ... no expect() statement
});
```

**Why it is dangerous:** The test literally cannot fail. It provides zero information about code correctness.

**Fix:** Remove try/catch wrappers. Every test must have at least one assertion. If testing for thrown errors, use the testing framework's built-in matchers:

```typescript
// REAL: explicit assertion on thrown error
it('rejects invalid payment', async () => {
  await expect(paymentService.charge(-1))
    .rejects.toThrow('Amount must be positive');
});
```

**Severity:** CRITICAL

### 5. Implementation-Mirroring

The test only asserts that certain methods were called with certain arguments, without verifying any behavioral outcome.

```typescript
// THEATER: only checks calls, not results
it('sends notification', () => {
  orderService.placeOrder(order);
  expect(notificationService.send).toHaveBeenCalledOnce();
  expect(notificationService.send).toHaveBeenCalledWith(order.email, expect.any(String));
  // But: was the order actually placed? Was the email content correct?
});
```

**Why it is dangerous:** The implementation could call `send` with garbage content and the test would pass. Call verification without outcome verification is Testing Theater.

**Fix:** Assert on both the behavioral outcome and the meaningful content of side effects:

```typescript
// REAL: verifies behavior AND side effect content
it('places order and notifies customer', () => {
  const result = orderService.placeOrder(order);
  expect(result.status).toBe('confirmed');
  expect(notificationService.send).toHaveBeenCalledWith(
    order.email,
    expect.stringContaining('Order #' + result.orderId)
  );
});
```

**Severity:** HIGH

### 6. Assertion-Free Smoke Test

The test executes code but makes no assertions about outcomes. Sometimes disguised as "smoke tests" or "sanity checks."

```typescript
// THEATER: executes without asserting
it('creates a user', () => {
  const user = userService.create({ name: 'Alice', email: 'alice@example.com' });
  // "If it doesn't throw, it works!" -- No, it doesn't.
});
```

**Why it is dangerous:** The code could return a malformed user, skip validation, or silently fail, and the test would pass.

**Fix:** Assert on the expected outcome:

```typescript
// REAL: verifies the creation result
it('creates a user with generated id', () => {
  const user = userService.create({ name: 'Alice', email: 'alice@example.com' });
  expect(user.id).toMatch(/^user-/);
  expect(user.name).toBe('Alice');
  expect(user.email).toBe('alice@example.com');
});
```

**Severity:** CRITICAL

### 7. Hardcoded Magic Oracle

Expected values are unexplained magic numbers not traceable to business rules or acceptance criteria.

```typescript
// THEATER: where does 42.7 come from?
it('calculates shipping cost', () => {
  const cost = shippingService.calculate(order);
  expect(cost).toBe(42.7);
});
```

**Why it is dangerous:** If the expected value was copied from a previous (possibly incorrect) run, the test locks in a bug. Without traceability to business rules, no one can verify correctness.

**Fix:** Document the derivation or use named constants:

```typescript
// REAL: expected value traceable to business rule
it('calculates shipping as base rate + weight surcharge', () => {
  // Business rule: $5 base + $0.50/lb, order weighs 75.4 lbs
  const order = createOrder({ weightLbs: 75.4 });
  const cost = shippingService.calculate(order);
  expect(cost).toBe(5 + 75.4 * 0.5); // $42.70
});
```

**Severity:** HIGH

## How to Detect Testing Theater

### The Deletion Test

For each test, ask: **"If I delete the production code this test covers, does the test still pass?"**

If yes, the test is Theater.

### The Mutation Test

Introduce a logic bug in production code (wrong calculation, swapped condition, removed validation). **Does the test catch it?**

If no, the test is Theater.

### The Traceability Test

For each expected value in assertions: **"Can I trace this value back to an acceptance criterion or business rule?"**

If no, the test is suspicious and should be investigated.

### The Behavioral Test

Does the test assert on **observable behavior** (return values, state changes, side effects at boundaries)?

If it only asserts on types, existence, or internal method calls, it is likely Theater.

### Review Checklist

Apply to every new or modified test:

1. Delete the production code this test covers -- does the test fail? If not: **THEATER**
2. Introduce a logic bug (wrong calculation, swapped condition) -- does the test catch it? If not: **THEATER**
3. Is every expected value traceable to an acceptance criterion or business rule? If not: **SUSPICIOUS**
4. Does the test assert on observable behavior (return values, state changes, side effects at boundaries)? If it only asserts on types, existence, or internal calls: **THEATER**

## How to Fix Testing Theater

### Step 1: Identify the Intended Behavior

Before fixing the test, clarify: **"What business behavior should this test verify?"** If you cannot state the behavior in one sentence a stakeholder would understand, the test may not need to exist.

### Step 2: Write the Assertion First

Start with the assertion that would detect a real bug:

```typescript
// Start here: what should the outcome be?
expect(result.status).toBe('approved');
expect(result.discountApplied).toBe(true);
expect(result.finalAmount).toBe(85.00);
```

Then build the test setup (Arrange + Act) to exercise the behavior that produces that outcome.

### Step 3: Verify Falsifiability

Temporarily break the production code. The test must fail. If it does not, the test is still Theater.

### Step 4: Delete Redundant Tests

After fixing Theater tests, some test methods may become redundant (they tested the same behavior as another test). Delete them. Fewer meaningful tests are better than many meaningless ones.

## The Root Cause: Test-After-the-Fact Rationalization

Testing Theater most commonly arises when tests are written **after** production code to "cover" it, rather than **before** production code to drive it (TDD).

When writing tests after the fact:
- The developer already knows the code works (it was just written and manually tested)
- Tests become a checkbox exercise ("get coverage up") rather than a design tool
- Assertions tend toward existence checks ("it returns something") rather than behavioral verification ("it returns the right thing")
- Expected values get copied from actual output rather than derived from requirements

**TDD prevents Testing Theater by construction.** When the test is written first:
- The test must fail initially (proving it can detect absence of behavior)
- The expected values come from requirements, not from existing code
- Each test drives a specific behavior into existence
- There is no temptation to "just get coverage"

This is why TDD is non-negotiable: it is the primary defense against Testing Theater.
