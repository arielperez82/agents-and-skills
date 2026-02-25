---
name: eslint-configuration
description: Use when configuring ESLint with flat config, typescript-eslint strict, plugins, and lint-staged integration.
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# ESLint Configuration

Flat config (`eslint.config.ts`) with `typescript-eslint/strictTypeChecked`, plugin recipes, and CI/lint-staged integration. No legacy `.eslintrc` patterns.

## Prerequisites

```bash
pnpm add -D eslint @eslint/js typescript-eslint jiti
```

`jiti` is required as a devDependency. ESLint uses jiti internally to transpile `.ts` config files. Without it, `eslint.config.ts` will fail to load. This is an ESLint-specific mechanism -- you do NOT need `NODE_OPTIONS=--experimental-strip-types` for ESLint (that is needed for tools like Prettier and lint-staged that lack built-in TypeScript config support).

## Complete eslint.config.ts

This is the centerpiece. A working config with strict type-checked rules, SonarJS, import sorting, and Prettier compatibility.

```typescript
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
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
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },
);
```

Install all dependencies:

```bash
pnpm add -D eslint @eslint/js typescript-eslint jiti \
  eslint-plugin-simple-import-sort \
  eslint-plugin-sonarjs \
  eslint-config-prettier
```

## tsconfig.eslint.json

Config files (`*.config.ts`) live outside `src/` and are not typically included in the main `tsconfig.json`. Test files should be included in the main `tsconfig.json` (it uses `noEmit` anyway). The `tsconfig.eslint.json` extends the base and adds config file globs so `projectService` can find them.

```json
{
  "extends": "./tsconfig.json",
  "include": [
    "*.config.ts",
    "src/**/*.ts",
    "src/**/*.tsx",
    "tests/**/*.ts",
    "tests/**/*.tsx"
  ]
}
```

Why this is needed: `projectService` with `allowDefaultProject` tells typescript-eslint "for files matching `*.config.ts` that are not in any tsconfig, use `defaultProject` as a fallback." The `tsconfig.eslint.json` is that fallback. Without it, ESLint cannot type-check config files and will error.

## projectService Configuration

The `parserOptions` block controls how typescript-eslint finds type information:

| Option | Purpose |
|--------|---------|
| `projectService: true` | Use TypeScript's project service (faster than legacy `project` option) |
| `tsconfigRootDir: import.meta.dirname` | Root for resolving tsconfig paths |
| `allowDefaultProject: ['*.config.ts']` | Glob patterns for files allowed to fall back to `defaultProject` |
| `defaultProject: 'tsconfig.eslint.json'` | Fallback tsconfig for files not in any project |

Keep `allowDefaultProject` minimal. Only add patterns for files that genuinely live outside your main tsconfig's `include` (config files at project root). Do NOT add `'**/*.ts'` -- that defeats the purpose.

## Ignore Patterns

The first config object should always be the ignores block:

```typescript
{ ignores: ['coverage/**', 'dist/**', 'build/**', 'node_modules/**'] }
```

These are the standard exclusions. Add project-specific patterns as needed (e.g., `'.next/**'` for Next.js, `'.turbo/**'` for Turborepo).

In flat config, `ignores` as a standalone object (without `files`) acts as a global ignore -- equivalent to the old `.eslintignore`.

## Plugin Recipes

### eslint-plugin-simple-import-sort

```bash
pnpm add -D eslint-plugin-simple-import-sort
```

```typescript
import simpleImportSort from 'eslint-plugin-simple-import-sort';

// In your config array:
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

Auto-fixable with `eslint --fix`. Sorts imports by: builtin modules, external packages, internal aliases, relative paths, side-effect imports.

### eslint-plugin-sonarjs

```bash
pnpm add -D eslint-plugin-sonarjs
```

```typescript
import sonarjsPlugin from 'eslint-plugin-sonarjs';

// In your config array:
...(sonarjsPlugin.configs?.recommended
  ? [sonarjsPlugin.configs.recommended]
  : []),
```

The optional chaining (`?.recommended`) is required. The SonarJS plugin types declare `configs.recommended` as possibly undefined. Without the `?.`, TypeScript will error under strict type checking. The spread with conditional array ensures the config is only applied if defined.

Catches: cognitive complexity, duplicate branches, identical expressions, collapsible if-statements, unused collection operations.

### eslint-config-prettier

```bash
pnpm add -D eslint-config-prettier
```

```typescript
import prettierConfig from 'eslint-config-prettier';

// MUST be last in the config array to override formatting rules:
export default tseslint.config(
  // ... other configs ...
  prettierConfig,  // Last
  {
    // Your custom rules block (after prettierConfig is fine)
  },
);
```

This disables all ESLint rules that would conflict with Prettier formatting. It does NOT run Prettier -- it only turns off conflicting rules. Always place it after any config that enables formatting rules.

### eslint-plugin-jsx-a11y (React projects)

```bash
pnpm add -D eslint-plugin-jsx-a11y
```

```typescript
import jsxA11y from 'eslint-plugin-jsx-a11y';

// In your config array:
jsxA11y.flatConfigs.recommended,
```

Only add to React/JSX projects. Catches: missing alt text, invalid ARIA attributes, non-interactive element handlers, missing form labels.

### eslint-plugin-react-hooks (React projects)

```bash
pnpm add -D eslint-plugin-react-hooks
```

```typescript
import reactHooks from 'eslint-plugin-react-hooks';

// In your config array:
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

Only add to React projects. Enforces Rules of Hooks (no conditional hooks, no hooks in loops) and exhaustive dependency arrays for `useEffect`/`useMemo`/`useCallback`.

## lint-staged Integration

In `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix"]
  }
}
```

Or in `lint-staged.config.ts` (requires `NODE_OPTIONS=--experimental-strip-types` in the Husky hook, since lint-staged does NOT use jiti):

```typescript
export default {
  '*.{ts,tsx}': ['eslint --fix'],
};
```

Husky pre-commit hook (`.husky/pre-commit`):

```bash
cd your-package-dir && NODE_OPTIONS=--experimental-strip-types pnpx lint-staged --verbose
```

Note: `NODE_OPTIONS=--experimental-strip-types` is needed for lint-staged (it has no built-in `.ts` config support), but NOT for ESLint itself (ESLint uses jiti).

## CI Integration

GitHub Actions job:

```yaml
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: pnpm/action-setup@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: pnpm
    - run: pnpm install --frozen-lockfile
    - run: pnpm lint
```

The `pnpm lint` script in `package.json`:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint --fix ."
  }
}
```

Always run `lint:fix` locally before committing. CI runs `lint` (no fix) to catch anything that was not auto-fixable.

## Monorepo Patterns

Root `eslint.config.ts` shared across workspaces. Each workspace can extend or override.

```typescript
// packages/api/eslint.config.ts
import rootConfig from '../../eslint.config.ts';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...rootConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,  // Points to this workspace
      },
    },
  },
);
```

Key: `tsconfigRootDir` must be set per workspace to resolve that workspace's tsconfig. The root config provides shared rules; workspace configs set the correct TypeScript project root.

See `references/monorepo-config.md` for detailed patterns.

## Common Gotchas

### SonarJS typing with optional chaining

`sonarjsPlugin.configs.recommended` is typed as possibly undefined. Direct spread (`...sonarjsPlugin.configs.recommended`) will fail type checking. Always use the conditional pattern:

```typescript
...(sonarjsPlugin.configs?.recommended
  ? [sonarjsPlugin.configs.recommended]
  : [])
```

### projectService and config files

Config files at the project root (`eslint.config.ts`, `vitest.config.ts`, etc.) are typically outside any tsconfig's `include`. Without `allowDefaultProject` + `defaultProject`, ESLint will fail with "file not found in any project" errors. The `tsconfig.eslint.json` pattern solves this.

### jiti must be a devDependency

ESLint will silently fail or throw confusing errors if `jiti` is not installed. It is NOT bundled with ESLint. Always verify it is in `devDependencies`:

```bash
pnpm add -D jiti
```

### NODE_OPTIONS=--experimental-strip-types is NOT needed for ESLint

ESLint uses jiti to load `.ts` config files. The `--experimental-strip-types` flag is for tools that lack built-in TypeScript support (Prettier, lint-staged, Husky hooks). Do not add it to your ESLint scripts.

### Flat config ignores vs. legacy .eslintignore

In flat config, there is no `.eslintignore` file. Use the `ignores` property in a standalone config object (without `files`). Placing `ignores` inside a config object that also has `files` or `rules` scopes those ignores to that config only -- it does NOT create a global ignore.

```typescript
// Global ignore (correct):
{ ignores: ['dist/**'] }

// Scoped ignore (only applies to this config object):
{ files: ['src/**'], ignores: ['src/generated/**'], rules: { ... } }
```

### strictTypeChecked requires type information

Every `.ts`/`.tsx` file linted must be part of a TypeScript project. If ESLint reports "file is not part of any tsconfig project," either add the file to a tsconfig's `include` or add its pattern to `allowDefaultProject`.

## When to Use This Skill

- Setting up ESLint in a new TypeScript project
- Migrating from legacy `.eslintrc` to flat config
- Adding plugins (SonarJS, import sorting, a11y, React hooks)
- Configuring ESLint for monorepos
- Integrating ESLint with lint-staged and CI
- Debugging projectService / tsconfig resolution errors

## Consolidated References

This skill includes the following reference documents for deeper topics:

- **Plugin Recipes** -- `references/plugin-recipes.md` -- Detailed per-plugin setup, what each catches, and gotchas
- **Flat Config Migration** -- `references/flat-config-migration.md` -- Migrating from legacy `.eslintrc` to `eslint.config.ts`
- **Monorepo Config** -- `references/monorepo-config.md` -- Multi-workspace ESLint with shared configs
- **Rules** -- `references/rules.md` -- Built-in rules, severity levels, and disabling strategies
- **Custom Rules** -- `references/custom-rules.md` -- Custom rule development, AST traversal, and publishing

Load these references on-demand when working in the specific sub-topic area.
