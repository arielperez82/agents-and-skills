---
name: refactoring
description: Refactoring assessment and patterns. Use after tests pass (GREEN phase) to assess improvement opportunities.
---

# Refactoring

Refactoring is the third step of TDD. After GREEN, assess if refactoring adds value.

## When to Refactor

- Always assess after green
- Only refactor if it improves the code
- **Commit working code BEFORE refactoring** (critical safety net)

### Commit Before Refactoring - WHY

Having a working baseline before refactoring:
- Allows reverting if refactoring breaks things
- Provides safety net for experimentation
- Makes refactoring less risky
- Shows clear separation in git history

**Workflow:**
1. GREEN: Tests pass
2. COMMIT: Save working code
3. REFACTOR: Improve structure
4. COMMIT: Save refactored code

## Priority Classification

| Priority | Action | Examples |
|----------|--------|----------|
| Critical | Fix now | Mutations, knowledge duplication, >3 levels nesting |
| High | This session | Magic numbers, unclear names, >30 line functions |
| Nice | Later | Minor naming, single-use helpers |
| Skip | Don't change | Already clean code |

## DRY = Knowledge, Not Code

**Abstract when**:
- Same business concept (semantic meaning)
- Would change together if requirements change
- Obvious why grouped together

**Keep separate when**:
- Different concepts that look similar (structural)
- Would evolve independently
- Coupling would be confusing

## Pattern: Extract Co-located Pure Functions from Adapters

When an adapter class mixes pure transformation logic with HTTP orchestration, the pure logic becomes untestable in unit tests (correctly — unit tests should not exercise fetch/retry/URL construction). This is a **High Value** extraction opportunity.

**Recognition signal:** Adapter class with low unit coverage (~5-7%) where response parsing, ID resolution, format mapping, or error normalization logic lives inside class methods alongside fetch calls.

**Extraction recipe** — co-locate these as exported standalone functions in the same adapter file, above the class:

| Extract | When you see |
|---|---|
| `parseXxxResponse(data, ...)` | JSON-to-domain-type conversion inside a fetch handler |
| `resolveXxxAssetId(asset)` | Domain-to-provider ID mapping inside a method |
| `mapToStorageFormat(record)` | Domain-to-storage row transformation (camelCase to snake_case, field renames) |
| `toXxxError(err: unknown)` | Error normalization (status extraction, regex parsing, fallback codes) |

**What stays in the class:** HTTP orchestration (URL construction, fetch, retry wrapping, header assembly).

**Do not split into separate files.** Co-location keeps related logic together. The functions are exported and independently testable without indirection.

**Classification:** High Value (fix this session) — improves testability and separation of concerns without changing behavior.

After extraction, the unit vs integration test boundary becomes clear: extracted pure functions get unit tests (no mocks), while the remaining HTTP orchestration gets integration tests with mock servers. If coverage thresholds need adjusting, look for guidance on structural function coverage gaps in adapter-heavy packages.

---

## Example Assessment

```typescript
// After GREEN:
const processOrder = (order: Order): ProcessedOrder => {
  const itemsTotal = order.items.reduce((sum, item) => sum + item.price, 0);
  const shipping = itemsTotal > 50 ? 0 : 5.99;
  return { ...order, total: itemsTotal + shipping, shippingCost: shipping };
};

// ASSESSMENT:
// ⚠️ High: Magic numbers 50, 5.99 → extract constants
// ✅ Skip: Structure is clear enough
// DECISION: Extract constants only
```

## Speculative Code is a TDD Violation

If code isn't driven by a failing test, don't write it.

**Key lesson**: Every line must have a test that demanded its existence.

❌ **Speculative code examples:**
- "Just in case" logic
- Features not yet needed
- Code written "for future flexibility"
- Untested error handling paths

**What to do**: Delete speculative code. Add behavior tests instead.

---

## When NOT to Refactor

Don't refactor when:

- ❌ Code works correctly (no bug to fix)
- ❌ No test demands the change (speculative refactoring)
- ❌ Would change behavior (that's a feature, not refactoring)
- ❌ Premature optimization
- ❌ Code is "good enough" for current phase

**Remember**: Refactoring should improve code structure without changing behavior.

---

## Commit Messages for Refactoring

```
refactor: extract scenario validation logic
refactor: simplify error handling flow
refactor: rename ambiguous parameter names
```

**Format**: `refactor: <what was changed>`

**Note**: Refactoring commits should NOT be mixed with feature commits.

---

## Refactoring Checklist

- [ ] All tests pass without modification
- [ ] No new public APIs added
- [ ] Code more readable than before
- [ ] Committed separately from features
- [ ] Committed BEFORE refactoring (safety net)
- [ ] No speculative code added
- [ ] Behavior unchanged (tests prove this)
