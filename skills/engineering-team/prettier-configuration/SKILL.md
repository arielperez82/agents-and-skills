---
name: prettier-configuration
description: Use when configuring Prettier with .ts config, ignore patterns, ESLint integration, and lint-staged setup.
allowed-tools: [Read, Write, Edit, Bash, Glob, Grep]
---

# Prettier Configuration

Configure Prettier for TypeScript projects using `.ts` config files, ESLint integration, lint-staged, Husky hooks, and CI pipelines.

## Installation

```bash
pnpm add -D prettier eslint-config-prettier
```

## TypeScript Config File

Prettier does not use `jiti` to load config files (unlike ESLint). A `.ts` config file requires Node 22+ with `--experimental-strip-types`. This flag must be set everywhere Prettier runs: npm scripts, Husky hooks, and lint-staged.

### `prettier.config.ts`

```typescript
import type { Config } from 'prettier';

const config: Config = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  semi: true,
  endOfLine: 'lf',
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
};

export default config;
```

### Option Reference

| Option | Value | Why |
|--------|-------|-----|
| `singleQuote` | `true` | Consistent with JS ecosystem convention |
| `trailingComma` | `'all'` | Cleaner diffs, required for trailing commas in function params |
| `printWidth` | `100` | Wider than default 80, fits modern monitors without excessive wrapping |
| `semi` | `true` | Avoids ASI edge cases |
| `endOfLine` | `'lf'` | Unix line endings everywhere, prevents mixed line endings across OS |
| `tabWidth` | `2` | Standard for JS/TS projects |
| `useTabs` | `false` | Spaces for consistent rendering |
| `bracketSpacing` | `true` | `{ foo }` not `{foo}` |
| `arrowParens` | `'always'` | Consistent parens, easier to add params |

### File-Type Overrides

Add overrides for file types that need different treatment:

```typescript
import type { Config } from 'prettier';

const config: Config = {
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  semi: true,
  endOfLine: 'lf',
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  arrowParens: 'always',
  overrides: [
    {
      files: '*.md',
      options: {
        proseWrap: 'always',
        printWidth: 80,
      },
    },
    {
      files: '*.json',
      options: {
        trailingComma: 'none',
      },
    },
    {
      files: '*.yaml',
      options: {
        singleQuote: false,
      },
    },
    {
      files: '*.html',
      options: {
        printWidth: 120,
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    {
      files: '*.css',
      options: {
        singleQuote: false,
      },
    },
  ],
};

export default config;
```

## `.prettierignore`

Without `.prettierignore`, Prettier will attempt to format build output, coverage reports, lock files, and other generated content. Always create this file.

```
coverage/
dist/
build/
node_modules/
pnpm-lock.yaml
package-lock.json
yarn.lock
*.min.js
*.min.css
.next/
.nuxt/
.astro/
```

See `references/ignore-patterns.md` for project-type-specific templates.

## Package.json Scripts

Every script that invokes Prettier must set `NODE_OPTIONS=--experimental-strip-types` when using a `.ts` config file.

```json
{
  "scripts": {
    "format:check": "NODE_OPTIONS=--experimental-strip-types prettier --check .",
    "format:fix": "NODE_OPTIONS=--experimental-strip-types prettier --write ."
  }
}
```

Run `format:fix` first, then `format:check` to verify zero remaining issues. Fix variants are always cheaper than diagnosing a wall of warnings.

## ESLint Integration with `eslint-config-prettier`

`eslint-config-prettier` disables all ESLint rules that conflict with Prettier. It must be the **last** item in your ESLint flat config so it overrides everything before it.

```bash
pnpm add -D eslint-config-prettier
```

In `eslint.config.ts`:

```typescript
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // ... your other configs (tseslint, etc.)
  eslintConfigPrettier,
];
```

This setup means: ESLint handles code quality rules (no-unused-vars, no-implicit-coercion, etc.), Prettier handles all formatting. No overlap, no conflicts.

Do **not** use `eslint-plugin-prettier`. It runs Prettier inside ESLint, which is slower and produces confusing lint errors for formatting issues. Keep them separate.

## lint-staged Integration

lint-staged also needs `NODE_OPTIONS=--experimental-strip-types` when it loads a `.ts` Prettier config.

In `package.json`:

```json
{
  "lint-staged": {
    "*": "prettier --write"
  }
}
```

The `NODE_OPTIONS` flag is set in the Husky hook that invokes lint-staged (see next section), so lint-staged inherits it. If you run lint-staged directly (outside Husky), set `NODE_OPTIONS=--experimental-strip-types` manually.

For projects that also run ESLint on staged files:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,yaml,yml,md,css,html}": "prettier --write"
  }
}
```

## Husky Hook Setup

The Husky pre-commit hook must set `NODE_OPTIONS` before invoking lint-staged. This is the critical piece that makes `.ts` configs work in the pre-commit flow.

### `.husky/pre-commit`

For a single-package project:

```bash
NODE_OPTIONS=--experimental-strip-types pnpx lint-staged --verbose
```

For a monorepo where the project is in a subdirectory:

```bash
cd my-project && NODE_OPTIONS=--experimental-strip-types pnpx lint-staged --verbose
```

The `--verbose` flag shows which files lint-staged processes and which commands it runs. Useful for debugging.

## CI Integration

Add a format check step to your GitHub Actions workflow. This catches formatting issues that slip past pre-commit hooks (direct pushes, hook bypass, etc.).

```yaml
name: CI
on: [push, pull_request]

jobs:
  format:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm format:check
```

Node 22 is required in CI because the npm script uses `--experimental-strip-types`.

## Complete Setup Checklist

1. Install: `pnpm add -D prettier eslint-config-prettier`
2. Create `prettier.config.ts` with standard options
3. Create `.prettierignore` with build/generated file patterns
4. Add `format:check` and `format:fix` scripts to `package.json`
5. Add `eslint-config-prettier` as last item in ESLint flat config
6. Configure lint-staged to run `prettier --write` on staged files
7. Set `NODE_OPTIONS=--experimental-strip-types` in Husky pre-commit hook
8. Add `format:check` step to CI pipeline
9. Verify: run `pnpm format:fix` then `pnpm format:check` -- zero issues

## Common Gotchas

### `.ts` config requires Node 22+

Prettier does not bundle `jiti` or any TypeScript loader. The `--experimental-strip-types` flag tells Node to strip type annotations before executing. This flag is available in Node 22+. If your project is on Node 20 or earlier, use `prettier.config.mjs` instead.

### `NODE_OPTIONS` must be set in three places

When using a `.ts` config, every execution context that loads Prettier needs `NODE_OPTIONS=--experimental-strip-types`:

1. **npm scripts** (`package.json` scripts section)
2. **Husky hooks** (`.husky/pre-commit`)
3. **lint-staged** (inherits from the Husky hook environment)

Missing it in any one of these causes `ERR_UNKNOWN_FILE_EXTENSION` for the `.ts` config file.

### `.prettierignore` is essential

Without it, `prettier --check .` or `prettier --write .` will:
- Try to parse `dist/` bundles and fail or produce garbage
- Reformat `coverage/` JSON reports
- Attempt to format lock files (slow, pointless, noisy diffs)
- Format minified files (destroys them)

### `endOfLine: 'lf'` prevents cross-platform issues

Windows defaults to CRLF. Without `endOfLine: 'lf'`, a team with mixed OS will produce constant line-ending churn in diffs. Set it once, enforce it everywhere.

### `eslint-config-prettier` must be last

If any ESLint config comes after `eslint-config-prettier` in the flat config array, it can re-enable formatting rules that conflict with Prettier. Always place it as the final element.

### Prettier and ESLint order in lint-staged

When running both ESLint and Prettier on the same files in lint-staged, run ESLint first. ESLint `--fix` may change code structure (removing unused imports, etc.), and Prettier should format the result.

```json
{
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

### Cache for faster runs

Prettier supports `--cache` to skip unchanged files. Useful for large repos:

```json
{
  "format:check": "NODE_OPTIONS=--experimental-strip-types prettier --check --cache .",
  "format:fix": "NODE_OPTIONS=--experimental-strip-types prettier --write --cache ."
}
```

The cache file (`.prettier-cache` or `node_modules/.cache/prettier`) should be gitignored. It is by default if `node_modules/` is ignored.

## Consolidated References

This skill consolidates the following sub-topics as reference documents:

- **Ignore Patterns** -- `references/ignore-patterns.md` -- Comprehensive `.prettierignore` templates per project type (Node.js, React/Next.js, Astro, monorepo)
- **Editor Integration** -- `references/editor-integration.md` -- VS Code settings, format-on-save, workspace config for monorepos
- **Integration** -- `references/integration.md` -- Editor, pre-commit, ESLint, and CI/CD integration patterns
- **Plugins** -- `references/plugins.md` -- Plugin ecosystem, custom parsers, and plugin development

Load these references on-demand when working in the specific sub-topic area.
