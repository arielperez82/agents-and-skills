# Migrating to ESLint Flat Config

Guide for migrating from legacy `.eslintrc.json` / `.eslintrc.js` to `eslint.config.ts` (flat config). ESLint v9+ uses flat config by default. Legacy config is deprecated.

## Key Differences

| Aspect | Legacy (`.eslintrc`) | Flat Config (`eslint.config.ts`) |
|--------|---------------------|----------------------------------|
| File format | JSON, JS, YAML | JS or TS module (default export) |
| Config resolution | Cascading (searches up directory tree) | Single file per project root |
| Plugin loading | String names (`"plugins": ["react"]`) | Imported objects |
| Extends | String names (`"extends": ["eslint:recommended"]`) | Spread imported configs |
| Environments | `"env": { "node": true }` | `languageOptions.globals` |
| Globals | `"globals": { "fetch": true }` | `languageOptions.globals` |
| Ignore file | `.eslintignore` | `ignores` property in config |
| Parser | `"parser": "@typescript-eslint/parser"` | `languageOptions.parser` (or use `tseslint.config()`) |

## Migration Patterns

### extends to spread imports

**Before:**

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/strict-type-checked",
    "prettier"
  ]
}
```

**After:**

```typescript
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  prettierConfig,
);
```

### plugins from strings to imports

**Before:**

```json
{
  "plugins": ["simple-import-sort", "sonarjs"]
}
```

**After:**

```typescript
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjsPlugin from 'eslint-plugin-sonarjs';

{
  plugins: {
    'simple-import-sort': simpleImportSort,
  },
}

// SonarJS uses a preset config instead of manual plugin registration:
...(sonarjsPlugin.configs?.recommended
  ? [sonarjsPlugin.configs.recommended]
  : []),
```

In flat config, plugins are JavaScript objects, not string names. Each plugin is registered under a namespace key in the `plugins` object. Plugins that ship flat config presets (like SonarJS) can be spread directly.

### env to languageOptions.globals

**Before:**

```json
{
  "env": {
    "node": true,
    "es2022": true
  }
}
```

**After:**

```typescript
import globals from 'globals';

{
  languageOptions: {
    globals: {
      ...globals.node,
      ...globals.es2021,  // es2022 globals are in es2021 in the globals package
    },
  },
}
```

Install the `globals` package:

```bash
pnpm add -D globals
```

Note: When using `typescript-eslint` with `projectService`, TypeScript handles type-aware globals resolution. You typically only need explicit globals for non-TypeScript files (e.g., `.js` config files) or for global variables not in any type definition.

### parser configuration

**Before:**

```json
{
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "ecmaVersion": 2022,
    "sourceType": "module"
  }
}
```

**After:**

```typescript
import tseslint from 'typescript-eslint';

export default tseslint.config(
  ...tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
```

Key changes:
- `typescript-eslint` configs automatically set the parser. No need to import `@typescript-eslint/parser` separately.
- `projectService: true` replaces `project: './tsconfig.json'`. It is faster and handles multi-tsconfig setups automatically.
- `tsconfigRootDir: import.meta.dirname` replaces `__dirname` (which is not available in ES modules).

### .eslintignore to ignores property

**Before (`.eslintignore`):**

```
coverage
dist
build
node_modules
```

**After:**

```typescript
export default tseslint.config(
  { ignores: ['coverage/**', 'dist/**', 'build/**', 'node_modules/**'] },
  // ... rest of config
);
```

The `ignores` must be in a standalone config object (without `files` or `rules`) to act as a global ignore. Placing it inside a config with other properties scopes it to that config only.

### overrides to files-scoped configs

**Before:**

```json
{
  "overrides": [
    {
      "files": ["*.test.ts"],
      "rules": {
        "@typescript-eslint/no-unsafe-assignment": "off"
      }
    }
  ]
}
```

**After:**

```typescript
{
  files: ['**/*.test.ts'],
  rules: {
    '@typescript-eslint/no-unsafe-assignment': 'off',
  },
}
```

In flat config, each object in the config array can have a `files` property to scope it. This replaces the `overrides` array.

### rules remain the same

Rule names and severity levels are unchanged:

```typescript
{
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
  },
}
```

## Step-by-Step Migration

1. **Install jiti** (required for `.ts` config):

   ```bash
   pnpm add -D jiti
   ```

2. **Delete legacy files:**

   ```bash
   rm .eslintrc.json .eslintrc.js .eslintrc.yml .eslintignore
   ```

3. **Create `eslint.config.ts`** with the complete config from the main SKILL.md.

4. **Create `tsconfig.eslint.json`** to cover config files and test files.

5. **Update `package.json` scripts** -- no changes needed. `eslint .` works with flat config.

6. **Test:**

   ```bash
   pnpm lint
   ```

   Fix any issues. Common first-run problems:
   - Missing `jiti` devDependency
   - Files outside any tsconfig (add to `allowDefaultProject` or `tsconfig.eslint.json`)
   - Plugin not exporting flat config format (check plugin docs for v9 support)

## Plugins Without Flat Config Support

Some older plugins have not been updated for flat config. Use the `@eslint/compat` package:

```bash
pnpm add -D @eslint/compat
```

```typescript
import { fixupPluginRules } from '@eslint/compat';
import someOldPlugin from 'eslint-plugin-old';

{
  plugins: {
    'old': fixupPluginRules(someOldPlugin),
  },
}
```

This wraps legacy plugins to work with flat config. Check plugin repositories for native flat config support before using this -- most popular plugins now support flat config natively.

## Verifying Migration

After migration, run ESLint on your entire codebase and compare the output with the legacy config. The same rules should trigger the same violations. If not, check:

- All `extends` are translated to spread imports
- All plugins are registered as objects
- Global ignores are in a standalone config object
- `parserOptions` are under `languageOptions.parserOptions`
- Custom rules are in a config object with appropriate `files` scoping
