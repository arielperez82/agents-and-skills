# ESLint Plugin Recipes

Detailed setup for each recommended plugin. All examples use flat config (`eslint.config.ts`).

## eslint-plugin-simple-import-sort

**Install:**

```bash
pnpm add -D eslint-plugin-simple-import-sort
```

**Config:**

```typescript
import simpleImportSort from 'eslint-plugin-simple-import-sort';

{
  plugins: {
    'simple-import-sort': simpleImportSort,
  },
  rules: {
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
  },
}
```

**What it catches:**
- Unsorted import statements
- Mixed import grouping (external and internal imports interleaved)
- Unsorted named exports

**Default sort order:**
1. Side-effect imports (`import './polyfills'`)
2. Node.js builtins (`import fs from 'node:fs'`)
3. External packages (`import React from 'react'`)
4. Internal aliases (`import { User } from '@/models/user'`)
5. Relative imports (`import { helper } from './utils'`)

**Custom grouping (optional):**

```typescript
rules: {
  'simple-import-sort/imports': ['error', {
    groups: [
      ['^node:'],           // Node builtins
      ['^@?\\w'],           // External packages
      ['^@/'],              // Internal aliases
      ['^\\.'],             // Relative imports
      ['^.+\\.s?css$'],    // Style imports last
    ],
  }],
}
```

**Gotchas:**
- Conflicts with ESLint's built-in `sort-imports` rule. Disable it: `'sort-imports': 'off'`.
- Conflicts with `import/order` from eslint-plugin-import. Disable it if using both plugins.
- 100% auto-fixable -- `eslint --fix` handles all violations.

## eslint-plugin-sonarjs

**Install:**

```bash
pnpm add -D eslint-plugin-sonarjs
```

**Config:**

```typescript
import sonarjsPlugin from 'eslint-plugin-sonarjs';

// In the config array:
...(sonarjsPlugin.configs?.recommended
  ? [sonarjsPlugin.configs.recommended]
  : []),
```

**What it catches:**

Bug detection:
- Identical expressions on both sides of a binary operator
- Collection operations with no effect (e.g., calling `.reverse()` without using the result)
- Gratuitous boolean expressions in conditions

Code smell detection:
- Cognitive complexity exceeding threshold (default: 15)
- Duplicate string literals (3+ occurrences)
- Collapsible if-statements (nested ifs that can be combined)
- Identical branches in if/else or switch
- Functions with too many parameters

**Key rules to know:**

| Rule | Default | Description |
|------|---------|-------------|
| `sonarjs/cognitive-complexity` | error (15) | Function cognitive complexity limit |
| `sonarjs/no-duplicate-string` | error (3) | Repeated string literals |
| `sonarjs/no-identical-functions` | error | Functions with identical bodies |
| `sonarjs/no-collapsible-if` | error | Nested ifs that can merge |
| `sonarjs/prefer-immediate-return` | error | Variables only used in return |

**Override cognitive complexity threshold:**

```typescript
{
  rules: {
    'sonarjs/cognitive-complexity': ['error', 20],
  },
}
```

**Gotchas:**

The `?.recommended` optional chaining is mandatory. The SonarJS TypeScript type declarations define `configs.recommended` as possibly undefined. Without optional chaining, `typescript-eslint/strictTypeChecked` will reject the config with a type error:

```typescript
// FAILS type checking under strictTypeChecked:
...sonarjsPlugin.configs.recommended,

// WORKS:
...(sonarjsPlugin.configs?.recommended
  ? [sonarjsPlugin.configs.recommended]
  : []),
```

Some SonarJS rules overlap with typescript-eslint rules (e.g., `no-unused-expressions`). If you see duplicate warnings, disable the SonarJS variant in favor of the typescript-eslint one:

```typescript
{
  rules: {
    'sonarjs/no-unused-expressions': 'off',
  },
}
```

## eslint-config-prettier

**Install:**

```bash
pnpm add -D eslint-config-prettier
```

**Config:**

```typescript
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  // ... all other configs ...
  prettierConfig,  // MUST be last (or near-last)
  {
    // Your custom rules block can go after -- it won't re-enable formatting rules
  },
);
```

**What it does:**
- Turns OFF every ESLint rule that conflicts with Prettier formatting
- Covers rules from: eslint core, typescript-eslint, and many plugins
- Does NOT run Prettier -- only disables conflicting rules

**What it does NOT do:**
- Does not format code (use Prettier directly)
- Does not add any new rules
- Does not require Prettier to be installed (though you should have it)

**Gotchas:**
- Must come after any config that enables formatting rules (e.g., after `strictTypeChecked`, after `sonarjs`). If placed before, those configs will re-enable the formatting rules Prettier disabled.
- Do NOT use `eslint-plugin-prettier` (which runs Prettier as an ESLint rule). It is slow and produces confusing error messages. Run Prettier separately.

## eslint-plugin-jsx-a11y (React projects only)

**Install:**

```bash
pnpm add -D eslint-plugin-jsx-a11y
```

**Config:**

```typescript
import jsxA11y from 'eslint-plugin-jsx-a11y';

// In the config array:
jsxA11y.flatConfigs.recommended,
```

**What it catches:**
- `<img>` without `alt` attribute
- Invalid ARIA attributes or roles
- Non-interactive elements with click handlers but no keyboard equivalent
- `<a>` tags without `href` (or with `href="#"`)
- Missing form `<label>` associations
- Autofocus on elements (disorienting for screen readers)
- `tabIndex` values greater than 0 (disrupts tab order)

**Strict mode (stricter than recommended):**

```typescript
jsxA11y.flatConfigs.strict,
```

Strict mode errors on things recommended mode only warns about.

**Gotchas:**
- Only applicable to projects using JSX (React, Preact, Solid). Do not add to pure TypeScript/Node.js projects.
- Uses `flatConfigs` (not `configs`). The legacy `configs.recommended` is for `.eslintrc` format.

## eslint-plugin-react-hooks (React projects only)

**Install:**

```bash
pnpm add -D eslint-plugin-react-hooks
```

**Config:**

```typescript
import reactHooks from 'eslint-plugin-react-hooks';

{
  plugins: {
    'react-hooks': reactHooks,
  },
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
  },
}
```

**What it catches:**

`rules-of-hooks` (error):
- Hooks called inside conditions (`if (x) { useState() }`)
- Hooks called inside loops
- Hooks called inside nested functions
- Hooks called in non-component, non-hook functions

`exhaustive-deps` (warn):
- Missing dependencies in `useEffect`, `useMemo`, `useCallback`, `useImperativeHandle`
- Unnecessary dependencies (values that never change)
- Functions defined outside the hook but used inside without being listed

**Gotchas:**
- `exhaustive-deps` is set to `warn` by default for good reason -- it can produce false positives with stable references (dispatch functions, refs). Promoting to `error` requires discipline.
- The plugin currently does not ship a flat config preset. You must manually register the plugin and rules as shown above.
- Only applicable to React projects. Do not add to Vue, Svelte, or non-framework projects.

## Full React Project Config

Combining all React-relevant plugins:

```typescript
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['coverage/**', 'dist/**', 'build/**', 'node_modules/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...(sonarjsPlugin.configs?.recommended
    ? [sonarjsPlugin.configs.recommended]
    : []),
  jsxA11y.flatConfigs.recommended,
  prettierConfig,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: ['*.config.ts'],
        defaultProject: 'tsconfig.eslint.json',
      },
    },
    plugins: {
      'simple-import-sort': simpleImportSort,
      'react-hooks': reactHooks,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
```
