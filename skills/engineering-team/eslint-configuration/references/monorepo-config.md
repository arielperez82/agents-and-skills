# ESLint in Monorepos

Patterns for sharing ESLint configuration across workspaces in a monorepo (pnpm workspaces, Turborepo, Nx).

## Architecture

```
monorepo/
  eslint.config.ts          # Root config (shared rules)
  tsconfig.json             # Root tsconfig (shared compiler options)
  tsconfig.eslint.json      # Root eslint tsconfig (covers root config files)
  packages/
    api/
      eslint.config.ts      # Extends root, sets tsconfigRootDir
      tsconfig.json          # Workspace tsconfig
      tsconfig.eslint.json   # Workspace eslint tsconfig
      src/
    web/
      eslint.config.ts      # Extends root, adds React plugins
      tsconfig.json
      tsconfig.eslint.json
      src/
    shared/
      eslint.config.ts      # Extends root
      tsconfig.json
      tsconfig.eslint.json
      src/
```

Each workspace has its own `eslint.config.ts` that imports the root config and sets workspace-specific options.

## Root Config (Shared Rules)

The root `eslint.config.ts` defines rules shared across all workspaces:

```typescript
// eslint.config.ts (monorepo root)
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['coverage/**', 'dist/**', 'build/**', 'node_modules/**', '.turbo/**'] },
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

## Workspace Config (Extends Root)

Each workspace imports the root config and overrides `tsconfigRootDir`:

```typescript
// packages/api/eslint.config.ts
import rootConfig from '../../eslint.config.ts';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...rootConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
```

The critical override is `tsconfigRootDir`. Without it, the workspace inherits the root's `tsconfigRootDir`, and `projectService` will look for tsconfigs in the monorepo root instead of the workspace directory.

## Workspace with React (Additional Plugins)

```typescript
// packages/web/eslint.config.ts
import rootConfig from '../../eslint.config.ts';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...rootConfig,
  jsxA11y.flatConfigs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
);
```

React-specific plugins are only added to workspaces that use React, not the root config.

## Workspace tsconfig.eslint.json

Each workspace needs its own `tsconfig.eslint.json`:

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

This covers config files at the workspace root and all source/test files.

## Running ESLint

### Per-workspace (recommended for CI)

```bash
# Run lint in a specific workspace
pnpm --filter api lint
pnpm --filter web lint

# Run lint in all workspaces
pnpm -r lint
```

### With Turborepo

```json
{
  "tasks": {
    "lint": {
      "dependsOn": ["^build"],
      "inputs": ["src/**/*.ts", "src/**/*.tsx", "eslint.config.ts", "tsconfig.json"],
      "cache": true
    }
  }
}
```

Turborepo caches lint results. The `inputs` array ensures cache invalidation when source files or config changes.

### From monorepo root

```bash
# Lint everything from root (each workspace uses its own config)
pnpm -r lint
```

Do NOT run `eslint .` from the monorepo root expecting it to lint all workspaces. ESLint uses the nearest `eslint.config.ts` for each file, so running from root would use the root config for everything (wrong `tsconfigRootDir` for workspace files). Always run per-workspace.

## Shared Config as a Package

For large monorepos, extract shared ESLint config into a workspace package:

```
packages/
  eslint-config/
    package.json
    index.ts
```

```json
// packages/eslint-config/package.json
{
  "name": "@myorg/eslint-config",
  "type": "module",
  "main": "index.ts",
  "dependencies": {
    "@eslint/js": "^9.0.0",
    "eslint-config-prettier": "^10.0.0",
    "eslint-plugin-simple-import-sort": "^12.0.0",
    "eslint-plugin-sonarjs": "^3.0.0",
    "typescript-eslint": "^8.0.0"
  }
}
```

```typescript
// packages/eslint-config/index.ts
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

export const baseConfig = tseslint.config(
  { ignores: ['coverage/**', 'dist/**', 'build/**', 'node_modules/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...(sonarjsPlugin.configs?.recommended
    ? [sonarjsPlugin.configs.recommended]
    : []),
  prettierConfig,
  {
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

Consumer workspaces:

```typescript
// packages/api/eslint.config.ts
import { baseConfig } from '@myorg/eslint-config';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...baseConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
        allowDefaultProject: ['*.config.ts'],
        defaultProject: 'tsconfig.eslint.json',
      },
    },
  },
);
```

Note: The shared config does NOT set `tsconfigRootDir`, `allowDefaultProject`, or `defaultProject`. These are workspace-specific and must be set by each consumer. The shared config only contains rules, plugins, and ignores that are universal.

## Common Monorepo Gotchas

### tsconfigRootDir must be per-workspace

Every workspace `eslint.config.ts` must set `tsconfigRootDir: import.meta.dirname`. Inheriting the root's value causes `projectService` to look for tsconfigs in the wrong directory.

### Workspace dependencies on shared config

If using a shared config package, each consuming workspace must list it in `devDependencies`:

```json
{
  "devDependencies": {
    "@myorg/eslint-config": "workspace:*"
  }
}
```

### Plugin versions must be consistent

All workspaces should use the same version of ESLint and plugins. Hoisting (pnpm's default) handles this. If you see different rule behavior across workspaces, check for duplicate or mismatched plugin versions:

```bash
pnpm why eslint-plugin-sonarjs
```

### Turborepo cache invalidation

If ESLint config changes are not picked up after modification, the Turborepo cache may be stale. Include config files in `inputs`:

```json
{
  "lint": {
    "inputs": [
      "src/**",
      "eslint.config.ts",
      "tsconfig.json",
      "tsconfig.eslint.json",
      "../../eslint.config.ts"
    ]
  }
}
```

The `../../eslint.config.ts` ensures root config changes invalidate workspace lint caches.

### Root config files

The root `tsconfig.eslint.json` should only cover root-level config files:

```json
{
  "extends": "./tsconfig.json",
  "include": ["*.config.ts"]
}
```

Do NOT include workspace source files in the root tsconfig. Each workspace manages its own TypeScript project.
