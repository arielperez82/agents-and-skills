# Coverage Verification

## NEVER Trust Coverage Claims Without Verification

**Always run coverage yourself before approving PRs.**

### Verification Process

**Before approving any PR claiming "100% coverage":**

1. Check out the branch
   ```bash
   git checkout feature-branch
   ```

2. Run coverage verification:
   ```bash
   cd packages/core
   pnpm test:coverage
   # OR
   pnpm exec vitest run --coverage
   ```

3. Verify ALL metrics hit 100%:
   - Lines: 100%
   - Statements: 100%
   - Branches: 100%
   - Functions: 100%

4. Check that tests are behavior-driven (not testing implementation details)

### Reading Coverage Output

Look for the "All files" line in coverage summary:

```text
File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
---------------|---------|----------|---------|---------|-------------------
All files      |     100 |      100 |     100 |     100 |
setup.ts       |     100 |      100 |     100 |     100 |
context.ts     |     100 |      100 |     100 |     100 |
```

All four metrics at 100% = verified.

### Red Flags

Watch for these signs of incomplete coverage:

**PR claims "100% coverage" but you haven't verified**

- Never trust claims without running coverage yourself

**Coverage summary shows <100% on any metric**

```text
All files      |   97.11 |    93.97 |   81.81 |   97.11 |
```

- This is NOT 100% coverage (Functions: 81.81%, Lines: 97.11%)

**"Uncovered Line #s" column shows line numbers**

```text
setup.ts       |   95.23 |      100 |      60 |   95.23 | 45-48, 52-55
```

- Lines 45-48 and 52-55 are not covered

**Coverage gaps without explicit exception documentation**

- If coverage <100%, exception should be documented

### When Coverage Drops, Ask

**"What business behavior am I not testing?"**

NOT "What line am I missing?"

Add tests for behavior, and coverage follows naturally.

## 100% Coverage Exception Process

### Default Rule: 100% Coverage Required

No exceptions without explicit approval and documentation.

### Acceptable Exceptions (No Approval Needed)

**Re-export Files**: Files that only re-export from other modules don't need coverage.

```typescript
// index.ts - re-export only, no implementation
export { createSupabaseClient } from './supabase/client';
```

**Why**: Re-exports don't implement behavior - they're organizational. The actual implementation files should have 100% coverage.

**Verification**: When checking coverage, verify that implementation files (not re-exports) have 100% coverage.

**Example Coverage Output:**

```text
All files     |   96.15 |    83.33 |   66.66 |   96.15 |
 src          |       0 |        0 |       0 |       0 |
  index.ts    |       0 |        0 |       0 |       0 | 1  <- Re-export, acceptable
 src/supabase |     100 |      100 |     100 |     100 |
  client.ts   |     100 |      100 |     100 |     100 |  <- Implementation, 100%
```

### Requesting an Exception

If 100% coverage cannot be achieved:

**Step 1: Document in package README**

Explain:

- Current coverage metrics
- WHY 100% cannot be achieved in this package
- WHERE the missing coverage will come from (integration tests, E2E, etc.)

**Step 2: Get explicit approval**

From project maintainer or team lead

**Step 3: Document in CLAUDE.md**

Under "Test Coverage: 100% Required" section, list the exception

**Example Exception:**

```markdown
## Current Exceptions

- **Next.js Adapter**: 86% function coverage
  - Documented in `/packages/nextjs-adapter/README.md`
  - Missing coverage from SSR functions (tested in E2E layer)
  - Approved: 2024-11-15
```

### Remember

The burden of proof is on the requester. 100% is the default expectation.
