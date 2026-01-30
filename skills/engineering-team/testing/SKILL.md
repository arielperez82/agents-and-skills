---
name: testing
description: Testing patterns for behavior-driven tests with proper structure. Use when writing tests or test factories.
---

# Testing Patterns

## Core Principles

**Test behavior, not implementation.** 100% coverage through business behavior, not implementation details.

**Test structure matters.** Proper organization makes tests maintainable and failures easy to diagnose.

---

## Test Structure & Organization

### Hierarchical Test Organization (Shallow)

**Structure tests by:**
1. Top-level `describe` for class/component/module
2. Nested `describe` for each method/function or major scenario ("when X condition")
3. `it` blocks for assertions

Keep nesting to **two levels** where possible (`describe(Module) -> describe("when X") -> it(...)`) to avoid hard-to-trace setup.

```typescript
describe('PaymentProcessor', () => {
  describe('processPayment', () => {
    describe('when amount is valid', () => {
      const processor = new PaymentProcessor();
      const payment = getMockPayment({ amount: 100 });
      const result = processor.processPayment(payment);

      // Each assertion gets its own focused test
      it('returns success status', () => {
        expect(result.success).toBe(true);
      });

      it('includes transaction ID', () => {
        expect(result.transactionId).toBeDefined();
      });

      it('charges the correct amount', () => {
        expect(result.chargedAmount).toBe(100);
      });
    });

    describe('when amount is negative', () => {
      const processor = new PaymentProcessor();
      const payment = getMockPayment({ amount: -100 });
      const result = processor.processPayment(payment);

      it('returns failure status', () => {
        expect(result.success).toBe(false);
      });

      it('includes error message', () => {
        expect(result.error).toContain('Amount must be positive');
      });
    });
  });
});
```

### Test Quality Principles

**✅ DO:**
- **Use pure setup functions for shared setup**: Define top-level helper/factory functions that perform Arrange + Act and return the values needed by tests. Call these helpers inside the relevant `describe` block and assign their result to `const` variables.
- **Avoid `let` in tests**: Prefer `const` and pure functions that return new values. If you find yourself needing `let` plus `beforeEach` to reassign state, extract a helper instead.
- **One Assertion Per Test**: Keep each `it` focused on a single behavior/expectation (one logical assertion), but allow multiple `it`s to reuse the same `const` result.
- **Start Test Names With Verbs**: Write as actions (e.g., `returns 400`, `rejects invalid input`)
- **Mock External Dependencies**: Isolate units by mocking databases, APIs, file systems
- **Test Behavior Through Public API**: Focus on what the code does, not how it does it
- **Use Factory Functions**: Create test data with optional overrides

**❌ DON'T:**
- Use `let` + `beforeEach` to reassign scenario state across nested blocks
- Hide setup in deeply nested hooks that make it hard to see where values come from
- Put multiple unrelated assertions in one test
- Start test names with "should" (the test either does or doesn't)
- Test implementation details (spying on internal methods)
- Use magic numbers or hardcoded test data
- Test private methods directly
- Use hooks for business/domain fixtures (use factories/helpers instead)

### Anti-Pattern vs Pattern Examples

#### ❌ ANTI-PATTERN: Repetitive Setup, Multiple Assertions

```typescript
describe('PaymentProcessor', () => {
  test('processes payment successfully', () => {
    // Repetitive setup in every test
    const payment = getMockPayment({ amount: 100 });
    const processor = new PaymentProcessor();
    const result = processor.processPayment(payment);

    // Multiple unrelated assertions in one test - hard to debug failures
    expect(result.success).toBe(true);
    expect(result.transactionId).toBeDefined();
    expect(result.chargedAmount).toBe(100);
    expect(result.timestamp).toBeInstanceOf(Date);
  });

  test('validates CVV', () => {
    // Same setup repeated again - duplication
    const payment = getMockPayment({ cvv: '12' });
    const processor = new PaymentProcessor();
    const result = processor.processPayment(payment);
    expect(result.success).toBe(false);
  });
});
```

#### ✅ CORRECT PATTERN: Pure Setup Functions, Focused Tests

```typescript
describe('PaymentProcessor', () => {
  describe('processPayment', () => {
    describe('when payment is valid', () => {
      const processor = new PaymentProcessor();
      const payment = getMockPayment({ amount: 100 });
      const result = processor.processPayment(payment);

      // Each assertion in its own focused test
      it('returns success status', () => {
        expect(result.success).toBe(true);
      });

      it('includes transaction ID', () => {
        expect(result.transactionId).toBeDefined();
      });

      it('charges the correct amount', () => {
        expect(result.chargedAmount).toBe(100);
      });

      it('includes timestamp', () => {
        expect(result.timestamp).toBeInstanceOf(Date);
      });
    });

    describe('when CVV is invalid', () => {
      const processor = new PaymentProcessor();
      const payment = getMockPayment({ cvv: '12' });
      const result = processor.processPayment(payment);

      it('returns failure status', () => {
        expect(result.success).toBe(false);
      });

      it('includes error message about CVV', () => {
        expect(result.error).toContain('Invalid CVV');
      });
    });
  });
});
```

---

## Test Behavior, Not Implementation

**Core Principle:** Test through public API only. Never test implementation details.

**Why this matters:**
- Tests remain valid when refactoring
- Tests document intended behavior
- Tests catch real bugs, not implementation changes

### Examples

❌ **WRONG - Testing implementation:**
```typescript
// ❌ Testing HOW (implementation detail)
it('calls validateAmount', () => {
  const spy = jest.spyOn(validator, 'validateAmount');
  processPayment(payment);
  expect(spy).toHaveBeenCalled(); // Tests HOW, not WHAT
});

// ❌ Testing private methods
it('validates CVV format', () => {
  const result = validator._validateCVV('123'); // Private method!
  expect(result).toBe(true);
});

// ❌ Testing internal state
it('sets isValidated flag', () => {
  processPayment(payment);
  expect(processor.isValidated).toBe(true); // Internal state
});
```

✅ **CORRECT - Testing behavior through public API:**
```typescript
describe('processPayment', () => {
  describe('when amount is negative', () => {
    const payment = getMockPayment({ amount: -100 });
    const result = processPayment(payment);

    it('rejects the payment', () => {
      expect(result.success).toBe(false);
    });

    it('returns error message about amount', () => {
      expect(result.error).toContain('Amount must be positive');
    });
  });

  describe('when CVV is invalid', () => {
    const payment = getMockPayment({ cvv: '12' }); // Only 2 digits
    const result = processPayment(payment);

    it('rejects the payment', () => {
      expect(result.success).toBe(false);
    });

    it('returns error message about CVV', () => {
      expect(result.error).toContain('Invalid CVV');
    });
  });

  describe('when payment is valid', () => {
    const payment = getMockPayment({ amount: 100, cvv: '123' });
    const result = processPayment(payment);

    it('accepts the payment', () => {
      expect(result.success).toBe(true);
    });

    it('includes transaction ID', () => {
      expect(result.data.transactionId).toBeDefined();
    });
  });
});
```

---

## Test Hooks: Cross-Cutting Concerns Only

**Use hooks only for cross-cutting concerns, not business setup.**

- `beforeEach`/`afterEach` are allowed for:
  - Resetting mocks (`jest.clearAllMocks()`), timers, global config
  - Library/framework cleanup (e.g. React Testing Library, DB reset)
- Do **not** use hooks to build business/domain fixtures for a scenario; use factories/helpers inside `describe` instead.

```typescript
// ✅ Allowed: Global concern
beforeEach(() => {
  jest.clearAllMocks();
});

// ❌ Avoid: Domain setup in hooks
beforeEach(() => {
  payment = getMockPayment({ amount: 100 });
  result = processPayment(payment);
});

// ✅ Correct: Domain setup with pure functions
describe('when payment is valid', () => {
  const payment = getMockPayment({ amount: 100 });
  const result = processPayment(payment);
  // ...
});
```

---

## Arrange-Act-Assert (AAA) with Helpers

**Arrange–Act–Assert (AAA) with helpers:**
- Arrange and Act usually happen in a setup/helper function
- Assert lives in the `it` block
- Use `describe('when X')` to express preconditions, and `it('returns Y')` to express outcomes

```typescript
const processValidPayment = () => {
  const payment = getMockPayment({ amount: 100 });  // Arrange
  return processPayment(payment);                    // Act
};

describe('processPayment', () => {
  describe('when amount is valid', () => {
    const result = processValidPayment();

    it('returns success status', () => {
      expect(result.success).toBe(true);            // Assert
    });

    it('includes transaction ID', () => {
      expect(result.transactionId).toBeDefined();
    });
  });
});
```

---

## Coverage Through Behavior

**Key insight:** When coverage drops, ask **"What business behavior am I not testing?"** not "What line am I missing?"

Validation code gets 100% coverage by testing the behavior it protects:

```typescript
// Tests covering validation WITHOUT testing validator directly
describe('processPayment', () => {
  describe('when amount is negative', () => {
    it('rejects the payment', () => {
      const payment = getMockPayment({ amount: -100 });
      const result = processPayment(payment);
      expect(result.success).toBe(false);
    });
  });

  describe('when amount exceeds limit', () => {
    it('rejects the payment', () => {
      const payment = getMockPayment({ amount: 15000 });
      const result = processPayment(payment);
      expect(result.success).toBe(false);
    });
  });

  describe('when CVV is invalid', () => {
    it('rejects the payment', () => {
      const payment = getMockPayment({ cvv: '12' });
      const result = processPayment(payment);
      expect(result.success).toBe(false);
    });
  });

  describe('when payment is valid', () => {
    it('processes the payment', () => {
      const payment = getMockPayment({ amount: 100, cvv: '123' });
      const result = processPayment(payment);
      expect(result.success).toBe(true);
    });
  });
});

// ✅ Result: payment-validator.ts has 100% coverage through behavior
```

**Example:** Validation code in `payment-validator.ts` gets 100% coverage by testing `processPayment()` behavior, NOT by directly testing validator functions.

---

## Test Factory Pattern

For test data, use factory functions with optional overrides.

### Core Principles

1. Return complete objects with sensible defaults
2. Accept `Partial<T>` overrides for customization
3. Validate with real schemas (don't redefine)
4. NO `let` in module scope - use factories and pure setup functions for fresh state

### Basic Pattern

```typescript
const getMockUser = (overrides?: Partial<User>): User => {
  return UserSchema.parse({
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides,
  });
};

// Usage in tests with pure setup functions
describe('createUser', () => {
  describe('when email is custom', () => {
    const user = getMockUser({ email: 'custom@example.com' });
    const result = createUser(user);

    it('creates the user', () => {
      expect(result.success).toBe(true);
    });

    it('uses the provided email', () => {
      expect(result.user.email).toBe('custom@example.com');
    });
  });
});
```

### Complete Factory Example

```typescript
import { UserSchema } from '@/schemas'; // Import real schema

const getMockUser = (overrides?: Partial<User>): User => {
  return UserSchema.parse({
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    ...overrides,
  });
};
```

**Why validate with schema?**
- Ensures test data is valid according to production schema
- Catches breaking changes early (schema changes fail tests)
- Single source of truth (no schema redefinition)

### Factory Composition

For nested objects, compose factories:

```typescript
const getMockItem = (overrides?: Partial<Item>): Item => {
  return ItemSchema.parse({
    id: 'item-1',
    name: 'Test Item',
    price: 100,
    ...overrides,
  });
};

const getMockOrder = (overrides?: Partial<Order>): Order => {
  return OrderSchema.parse({
    id: 'order-1',
    items: [getMockItem()],      // ✅ Compose factories
    customer: getMockCustomer(),  // ✅ Compose factories
    payment: getMockPayment(),    // ✅ Compose factories
    ...overrides,
  });
};

// Usage with pure setup functions
describe('calculateTotal', () => {
  describe('when order has multiple items', () => {
    const order = getMockOrder({
      items: [
        getMockItem({ price: 100 }),
        getMockItem({ price: 200 }),
      ],
    });
    const total = calculateTotal(order);

    it('returns the sum of item prices', () => {
      expect(total).toBe(300);
    });
  });
});
```

### Factory Anti-Patterns

❌ **WRONG: Module-scope `let` without beforeEach**
```typescript
let user: User = getMockUser();  // Shared mutable state at module level!

it('test 1', () => {
  user.name = 'Modified User';  // Mutates shared state
  // ...
});

it('test 2', () => {
  expect(user.name).toBe('Test User');  // Fails! Modified by test 1
});
```

✅ **CORRECT: Factory with const for fresh state**
```typescript
describe('userTests', () => {
  describe('when user is created', () => {
    const user = getMockUser();  // Fresh state for each scenario

    it('test 1', () => {
      const modifiedUser = { ...user, name: 'Modified User' };
      // ...
    });

    it('test 2', () => {
      expect(user.name).toBe('Test User');  // ✅ Passes - immutable state
    });
  });
});
```

❌ **WRONG: Incomplete objects**
```typescript
const getMockUser = () => ({
  id: 'user-123',  // Missing name, email, role!
});
```

✅ **CORRECT: Complete objects**
```typescript
const getMockUser = (overrides?: Partial<User>): User => {
  return UserSchema.parse({
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    ...overrides,  // All required fields present
  });
};
```

❌ **WRONG: Redefining schemas in tests**
```typescript
// ❌ Schema already defined in src/schemas/user.ts!
const UserSchema = z.object({ ... });
const getMockUser = () => UserSchema.parse({ ... });
```

✅ **CORRECT: Import real schema**
```typescript
import { UserSchema } from '@/schemas/user';

const getMockUser = (overrides?: Partial<User>): User => {
  return UserSchema.parse({
    id: 'user-123',
    name: 'Test User',
    email: 'test@example.com',
    ...overrides,
  });
};
```

---

## Coverage Theater Detection

Watch for these patterns that give fake 100% coverage:

### Pattern 1: Mock the function being tested

❌ **WRONG** - Gives 100% coverage but tests nothing:
```typescript
it('calls validator', () => {
  const spy = jest.spyOn(validator, 'validate');
  validate(payment);
  expect(spy).toHaveBeenCalled(); // Meaningless assertion
});
```

✅ **CORRECT** - Test actual behavior:
```typescript
describe('validate', () => {
  describe('when payment is invalid', () => {
    const payment = getMockPayment({ amount: -100 });
    const result = validate(payment);

    it('rejects the payment', () => {
      expect(result.success).toBe(false);
    });

    it('includes error message', () => {
      expect(result.error).toContain('Amount must be positive');
    });
  });
});
```

### Pattern 2: Test only that function was called

❌ **WRONG** - No behavior validation:
```typescript
it('processes payment', () => {
  const spy = jest.spyOn(processor, 'process');
  handlePayment(payment);
  expect(spy).toHaveBeenCalledWith(payment); // So what?
});
```

✅ **CORRECT** - Verify the outcome:
```typescript
describe('handlePayment', () => {
  describe('when payment is valid', () => {
    const payment = getMockPayment();
    const result = handlePayment(payment);

    it('processes the payment', () => {
      expect(result.success).toBe(true);
    });

    it('returns transaction ID', () => {
      expect(result.transactionId).toBeDefined();
    });
  });
});
```

### Pattern 3: Test trivial getters/setters

❌ **WRONG** - Testing implementation, not behavior:
```typescript
it('sets amount', () => {
  payment.setAmount(100);
  expect(payment.getAmount()).toBe(100); // Trivial
});
```

✅ **CORRECT** - Test meaningful behavior:
```typescript
describe('calculateTotal', () => {
  describe('when order has items with tax', () => {
    const order = createOrder({ items: [item1, item2] });
    const total = order.calculateTotal();

    it('includes tax in total', () => {
      expect(total).toBe(230); // 200 + 15% tax
    });
  });
});
```

### Pattern 4: 100% line coverage, 0% branch coverage

❌ **WRONG** - Missing edge cases:
```typescript
it('validates payment', () => {
  const result = validate(getMockPayment());
  expect(result.success).toBe(true); // Only happy path!
});
// Missing: negative amounts, invalid CVV, missing fields, etc.
```

✅ **CORRECT** - Test all branches:
```typescript
describe('validate', () => {
  describe('when amount is negative', () => {
    it('rejects the payment', () => {
      const payment = getMockPayment({ amount: -100 });
      expect(validate(payment).success).toBe(false);
    });
  });

  describe('when amount exceeds limit', () => {
    it('rejects the payment', () => {
      const payment = getMockPayment({ amount: 15000 });
      expect(validate(payment).success).toBe(false);
    });
  });

  describe('when CVV is invalid', () => {
    it('rejects the payment', () => {
      const payment = getMockPayment({ cvv: '12' });
      expect(validate(payment).success).toBe(false);
    });
  });

  describe('when payment is valid', () => {
    it('accepts the payment', () => {
      const payment = getMockPayment();
      expect(validate(payment).success).toBe(true);
    });
  });
});
```

---

## No 1:1 Mapping Between Tests and Implementation

Don't create test files that mirror implementation files.

❌ **WRONG:**
```
src/
  payment-validator.ts
  payment-processor.ts
  payment-formatter.ts
tests/
  payment-validator.test.ts  ← 1:1 mapping
  payment-processor.test.ts  ← 1:1 mapping
  payment-formatter.test.ts  ← 1:1 mapping
```

✅ **CORRECT:**
```
src/
  payment-validator.ts
  payment-processor.ts
  payment-formatter.ts
tests/
  process-payment.test.ts  ← Tests behavior, not implementation files
```

**Why:** Implementation details can be refactored without changing tests. Tests verify behavior remains correct regardless of how code is organized internally.

---

## Test Naming Conventions

### Start With Verbs

✅ **CORRECT - Action-oriented:**
- `returns success status`
- `rejects negative amounts`
- `includes transaction ID`
- `throws error for invalid input`
- `calculates total with tax`

❌ **WRONG - Using "should":**
- `should return success status`
- `should reject negative amounts`
- `should include transaction ID`

**Why avoid "should":** The test either does the thing or it doesn't. No need for "should".

---

## Summary Checklist

When writing tests, verify:

### Structure
- [ ] Tests organized hierarchically (describe/describe/it, max 2 levels)
- [ ] Shared setup uses pure setup functions (not beforeEach for domain setup)
- [ ] Avoid `let` - use `const` with pure functions
- [ ] Each test has one assertion
- [ ] Test names start with verbs (not "should")

### Behavior Testing
- [ ] Testing behavior through public API (not implementation details)
- [ ] No mocks of the function being tested
- [ ] No tests of private methods or internal state
- [ ] Edge cases covered (not just happy path)

### Test Data
- [ ] Factory functions return complete, valid objects
- [ ] Factories validate with real schemas (not redefined in tests)
- [ ] Using Partial<T> for type-safe overrides
- [ ] Fresh state via factories with const (not module-scope let, not beforeEach for domain setup)

### Coverage
- [ ] Tests would pass even if implementation is refactored
- [ ] No 1:1 mapping between test files and implementation files
- [ ] Coverage achieved through testing behavior, not mocking internals

## Schema Migration Test Coverage

**For database schema migrations, ensure comprehensive coverage:**

### UNIQUE Constraint Testing

```typescript
// ✅ CORRECT - Test UNIQUE constraint
describe('talent table', () => {
  describe('handle uniqueness', () => {
    it('rejects duplicate handles', async () => {
      const handle = 'test-handle';
      await createTestTalent({ handle });
      
      const duplicate = createTestTalent({ handle });
      const { error } = await client.from('talent').insert(duplicate);
      
      expect(error?.code).toBe('23505'); // Unique violation
    });
  });
});

// ✅ CORRECT - Test single-row pattern (configuration table)
describe('configuration table', () => {
  it('enforces single configuration row', async () => {
    // Attempt to insert second row should fail or be prevented
    const { error } = await client
      .from('configuration')
      .insert({ follow_up_intervals: [1, 2, 3] });
    
    // Either fails with unique constraint or is prevented by application logic
    expect(error).not.toBeNull();
  });
});
```

### Trigger Testing

**Test ALL triggers created in migration:**

```typescript
// ✅ CORRECT - Test all updated_at triggers
describe('updated_at triggers', () => {
  const tablesWithUpdatedAt = [
    'entity', 'contact', 'contact_account', 'thread',
    'talent', 'opportunity', 'talent_opportunity', 'deal', 'task', 'configuration'
  ];

  tablesWithUpdatedAt.forEach(table => {
    it(`updates ${table}.updated_at on row update`, async () => {
      // Create record
      const { data: created } = await createTestRecord(table);
      const originalUpdatedAt = created.updated_at;
      
      // Wait to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Update record
      await client.from(table).update({ /* some field */ }).eq('id', created.id);
      
      // Verify updated_at changed
      const { data: updated } = await client.from(table).select('updated_at').eq('id', created.id).single();
      expect(updated.updated_at).not.toEqual(originalUpdatedAt);
    });
  });
});
```

### Security Testing (Read + Write Operations)

**Use the template:** `assets/security-test-patterns.ts` for reusable test patterns.

**Test both read AND write operations for RLS:**

```typescript
// ✅ CORRECT - Security tests cover read AND write
describe('RLS security', () => {
  describe('anon client access', () => {
    it('blocks anon client from reading configuration', async () => {
      const { data, error } = await anonClient.from('configuration').select('id').limit(1);
      expect(data).toEqual([]);
    });

    it('blocks anon client from writing to configuration', async () => {
      const { error } = await anonClient
        .from('configuration')
        .insert({ follow_up_intervals: [1, 2, 3] });
      
      expect(error).not.toBeNull();
      expect(error?.code).toBe('42501'); // Insufficient privilege
    });

    it('blocks anon client from updating configuration', async () => {
      const { error } = await anonClient
        .from('configuration')
        .update({ follow_up_intervals: [1, 2, 3] })
        .eq('id', 'some-id');
      
      expect(error).not.toBeNull();
    });

    it('blocks anon client from deleting configuration', async () => {
      const { error } = await anonClient
        .from('configuration')
        .delete()
        .eq('id', 'some-id');
      
      expect(error).not.toBeNull();
    });
  });

  describe('service role access', () => {
    it('allows service role to write to configuration', async () => {
      const { error } = await serviceClient
        .from('configuration')
        .insert({ follow_up_intervals: [1, 2, 3] });
      
      // Should succeed or fail for business logic reasons, not RLS
      expect(error?.code).not.toBe('42501');
    });
  });
});
```

### Branch Coverage Requirements

**Target: Branch coverage ≥ 90%**

- Test all constraint edge cases (invalid values, boundary conditions)
- Test all error paths (foreign key violations, constraint violations)
- Test both success and failure scenarios
- Use coverage reports to identify untested branches

### Testing Anti-Patterns (Mocks and Behavior)

For mock-related anti-patterns (testing mock behavior, test-only methods in production, mocking without understanding, incomplete mocks, coverage theater), see [testing-anti-patterns.md](testing-anti-patterns.md) in this skill folder.