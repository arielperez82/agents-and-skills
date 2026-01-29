---
name: tpp
description: >
  Provides reference material on the Transformation Priority Premise (TPP) for Test-Driven Development. 
  Contains transformation catalog, priority ordering, and methodology for avoiding TDD impasses.
  Load when learning about transformations or reviewing TPP principles.
---

# Transformation Priority Premise (TPP)

**Core Insight:** "As the tests get more specific, the code gets more generic."

The Transformation Priority Premise provides a methodology for choosing which tests to write and how to implement them during TDD's RED-GREEN cycle.

## What Are Transformations?

**Transformations** change the behavior of code, moving it from specific to generic forms.
**Refactorings** change the structure of code without changing behavior.

During TDD:
- **RED→GREEN**: Use transformations (change behavior to pass test)
- **GREEN→REFACTOR**: Use refactorings (improve structure, preserve behavior)

---

## The Transformation Catalog

Listed from simplest (top) to most complex (bottom):

| # | Transformation | Description | Example |
|---|---------------|-------------|---------|
| 1 | `({}→nil)` | No code → code that returns nil | `return null;` |
| 2 | `(nil→constant)` | nil → a constant value | `return "";` |
| 3 | `(constant→constant+)` | Simple constant → more complex constant | `return 0;` → `return 42;` |
| 4 | `(constant→scalar)` | Constant → variable/argument | `return 0;` → `return score;` |
| 5 | `(statement→statements)` | One statement → multiple statements | Add more unconditional logic |
| 6 | `(unconditional→if)` | Unconditional code → conditional split | Add `if` statement |
| 7 | `(scalar→array)` | Single value → collection | `let x = 5;` → `let x = [5];` |
| 8 | `(array→container)` | Array → more complex structure | Array → Map/Set/Object |
| 9 | `(statement→recursion)` | Statement → recursive call | `x++;` → `fn(x+1);` |
| 10 | `(if→while)` | Conditional → loop | `if (...)` → `while (...)` |
| 11 | `(expression→function)` | Expression → algorithm/function | `x + y` → `calculate(x, y)` |
| 12 | `(variable→assignment)` | Immutable → mutable state | `const x = 5;` → `let x = 5; x++;` |

---

## The Priority Premise

**Prefer transformations higher in the list** (simpler) over those lower (more complex).

### Why Priority Matters

1. **Simpler transformations = smaller steps**
2. **Smaller steps = easier to keep tests green**
3. **Wrong order = impasses** (stuck, can't proceed without rewriting)

### The Rule

**When in GREEN phase:**
- Try to pass the test using the highest priority transformation possible
- If forced to use low-priority transformation, consider if there's a simpler test

**When in RED phase:**
- Choose tests that can be passed with high-priority transformations
- Defer tests requiring complex transformations until simpler ones establish patterns

---

## Transformation Examples

### 1. `(nil→constant)` - Simplest Start

```typescript
// Test (RED)
it('returns empty string for null input', () => {
  expect(wrap(null, 10)).toBe('');
});

// Implementation (GREEN)
function wrap(s: string | null, length: number): string {
  return '';  // (nil→constant)
}
```

### 2. `(constant→scalar)` - Introduce Variable

```typescript
// Test (RED)
it('returns the input string unchanged', () => {
  expect(wrap('word', 10)).toBe('word');
});

// Implementation (GREEN)
function wrap(s: string | null, length: number): string {
  if (s === null) return '';
  return s;  // (constant→scalar) - was '', now variable s
}
```

### 3. `(unconditional→if)` - Split Execution Path

```typescript
// Test (RED)
it('breaks long words at the length limit', () => {
  expect(wrap('longword', 4)).toBe('long\nword');
});

// Implementation (GREEN)
function wrap(s: string | null, length: number): string {
  if (s === null) return '';
  
  if (s.length <= length)  // (unconditional→if)
    return s;
  else
    return 'long\nword';  // (nil→constant) in new branch
}
```

### 4. `(constant→scalar)` Again - Remove Hard-Coded Value

```typescript
// Test (RED) - Add second assertion to force generalization
it('breaks long words at the length limit', () => {
  expect(wrap('longword', 4)).toBe('long\nword');
  expect(wrap('longerword', 6)).toBe('longer\nword');
});

// Implementation (GREEN)
function wrap(s: string | null, length: number): string {
  if (s === null) return '';
  
  if (s.length <= length)
    return s;
  else
    return s.substring(0, length) + '\n' + s.substring(length);  // (constant→scalar)
}
```

### 5. `(statement→recursion)` - Handle Multiple Breaks

```typescript
// Test (RED)
it('breaks very long words multiple times', () => {
  expect(wrap('verylongword', 4)).toBe('very\nlong\nword');
});

// Implementation (GREEN)
function wrap(s: string | null, length: number): string {
  if (s === null) return '';
  
  if (s.length <= length)
    return s;
  else
    // (statement→recursion) - recurse on remainder
    return s.substring(0, length) + '\n' + wrap(s.substring(length), length);
}
```

---

## Avoiding Impasses: The Word Wrap Kata

### The Wrong Path (Leads to Impasse)

```typescript
// Early test using low-priority transformation
it('wraps two words at space', () => {
  expect(wrap('word word', 6)).toBe('word\nword');
});

// "Clever" solution using (expression→function) - too early!
function wrap(s: string | null, length: number): string {
  if (s === null) return '';
  return s.replaceAll(' ', '\n');  // Breaks for next test!
}

// Next test reveals the impasse
it('wraps three words correctly', () => {
  expect(wrap('word word word', 9)).toBe('word word\nword');
  // Can't pass without major rewrite!
});
```

**Problem:** Used low-priority transformation `(expression→function)` too early, before establishing the core algorithm with simpler transformations.

### The Right Path (Following TPP)

```typescript
// 1. Start with simpler test (breaking long words)
it('breaks long words at length', () => {
  expect(wrap('longword', 4)).toBe('long\nword');
});
// Pass with: (unconditional→if) + (constant→scalar)

// 2. Generalize with recursion
it('breaks very long words multiple times', () => {
  expect(wrap('verylongword', 4)).toBe('very\nlong\nword');
});
// Pass with: (statement→recursion)

// 3. NOW handle spaces (builds on existing algorithm)
it('wraps at space when possible', () => {
  expect(wrap('word word', 6)).toBe('word\nword');
});
// Pass with: (unconditional→if) - fits naturally into existing structure
```

**Why this works:** Each transformation builds on the previous, establishing patterns that accommodate future tests.

---

## Transformation Priority in Practice

### Decision Framework

**When choosing next test:**

1. **Can I pass with `(nil→constant)` or `(constant→scalar)`?**
   - These are always preferred
   - Build foundation incrementally

2. **Will this require `(unconditional→if)`?**
   - Acceptable if no simpler option
   - Try to defer until patterns emerge

3. **Will this require `(expression→function)` or lower?**
   - ⚠️ Warning sign - might be too early
   - Ask: "Is there a simpler test I could write first?"

4. **Will this require complete algorithm redesign?**
   - 🚫 Definitely wrong order
   - Backtrack and find intermediate tests

### Red Flags

**Signs you're on wrong path:**
- Can't pass test without rewriting existing code
- Forced to use transformation from bottom of list
- "Simple" test requires complex implementation
- Previous tests become harder to understand

**Solution:** Backtrack. Find simpler test that uses higher-priority transformation.

---

## TPP and Code Evolution

### The Pattern

```
Start: Specific, correct for one case
  ↓  (transformation)
More generic, correct for more cases
  ↓  (transformation)
Even more generic, correct for all cases
```

### Example: Scoring Algorithm Evolution

```typescript
// Test 1: Gutter game (all zeros)
score() { return 0; }  // (nil→constant)

// Test 2: All ones
score() { return rolls.reduce((a, b) => a + b); }  // (constant→scalar)

// Test 3: Spare handling
score() { 
  let score = 0;
  for (let i = 0; i < rolls.length; i++) {  // (scalar→array) + (statement→statements)
    score += rolls[i];
    if (isSpare(i)) score += rolls[i + 1];
  }
  return score;
}
// (unconditional→if)

// Algorithm emerged through transformations, not designed upfront
```

---

## Common Transformation Sequences

### Building Collections

```
(nil→constant)           return null
  ↓
(constant→scalar)        return []
  ↓
(scalar→array)          return [item]
  ↓
(statement→statements)   return [item1, item2]
  ↓
(expression→function)    return items.map(transform)
```

### Building Conditional Logic

```
(nil→constant)           return false
  ↓
(constant→scalar)        return isValid
  ↓
(unconditional→if)       if (condition) return true; return false;
  ↓
(if→while)              while (condition) { ... }
```

### Building Calculations

```
(nil→constant)           return 0
  ↓
(constant→scalar)        return value
  ↓
(statement→statements)   let x = value; return x * 2;
  ↓
(expression→function)    return calculate(value)
```

---

## TPP and Test Selection

### Good Test Progression (Following TPP)

```typescript
// 1. Degenerate case
it('returns empty for null', () => { ... });           // (nil→constant)

// 2. Simplest real case  
it('returns unchanged when short', () => { ... });     // (constant→scalar)

// 3. Simple boundary
it('breaks at exact length', () => { ... });           // (unconditional→if)

// 4. Multiple occurrences
it('breaks multiple times', () => { ... });            // (statement→recursion)

// 5. Complex case builds on foundation
it('prefers breaking at spaces', () => { ... });       // (unconditional→if) in recursion
```

### Poor Test Progression (Ignoring TPP)

```typescript
// 1. Degenerate case
it('returns empty for null', () => { ... });           // (nil→constant)

// 2. JUMP TO COMPLEX CASE - BAD!
it('wraps multiple words at spaces', () => { ... });   // Requires (expression→function)!

// Now stuck - can't build incrementally
```

---

## Key Principles

### 1. Transformations Change Behavior
During GREEN phase, you're changing what the code does to satisfy the test.

### 2. Simpler is Better
Higher-priority transformations = smaller, safer steps.

### 3. Tests Drive Transformations
The test you choose determines which transformation you'll need.

### 4. Generalization Over Time
Don't try to write the general solution immediately. Let it emerge through transformations.

### 5. Impasses Signal Wrong Order
If stuck, you probably chose tests in wrong order. Backtrack.

---

## When to Apply TPP

**Use TPP when:**
- ✅ Choosing which test to write next
- ✅ Deciding how to make a test pass
- ✅ Feeling stuck during GREEN phase
- ✅ Code seems to require major rewrite for simple test

**Don't overthink TPP when:**
- ❌ Transformation choice is obvious
- ❌ Only one reasonable option
- ❌ Already have working algorithm (REFACTOR phase)

---

## TPP Workflow

### RED Phase
```
1. Look at current code state
2. Consider next test options
3. Choose test that uses highest-priority transformation
4. Write that test
```

### GREEN Phase
```
1. Look at failing test
2. Consider transformation options
3. Choose highest-priority transformation that works
4. Apply transformation to pass test
5. If forced to use low-priority transformation:
   - Question if there's simpler test first
   - Consider backtracking
```

### REFACTOR Phase
```
TPP doesn't apply here - use refactorings, not transformations
```

---

## Further Reading

- [Original TPP Blog Post by Uncle Bob](http://blog.cleancoder.com/uncle-bob/2013/05/27/TheTransformationPriorityPremise.html)
- [Prime Factors Kata](http://butunclebob.com/ArticleS.UncleBob.ThePrimeFactorsKata)
- [Bowling Game Kata](http://butunclebob.com/ArticleS.UncleBob.TheBowlingGameKata)
- [Word Wrap Kata](http://thecleancoder.blogspot.com/2010/10/craftsman-62-dark-path.html)

---

## Summary

**TPP = A methodology for choosing tests and transformations that avoids TDD impasses**

**Core concepts:**
1. Transformations change behavior (specific → generic)
2. Transformations have priority (simple → complex)
3. Prefer high-priority transformations
4. Choose tests that use high-priority transformations
5. Wrong order leads to impasses

**When properly applied:**
- Smooth TDD flow
- Algorithms emerge naturally
- Small, safe steps
- No rewrites or impasses