# Exemplar: Node.js + TypeScript

Complete Phase 0 config files for a Node.js TypeScript project (backend, CLI, library).

## Directory structure

```
project-root/
├── .husky/
│   └── pre-commit
├── eslint.config.ts
├── prettier.config.ts
├── .prettierignore
├── lint-staged.config.ts
├── tsconfig.json
└── tsconfig.eslint.json
```

## `.husky/pre-commit`

```bash
NODE_OPTIONS=--experimental-strip-types pnpx lint-staged --verbose
```

> **Note:** `NODE_OPTIONS=--experimental-strip-types` is required (Node 22+) because lint-staged and Prettier don't natively support `.ts` config files.

## `eslint.config.ts`

```ts
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import security from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['coverage/**', 'dist/**', 'build/**', 'node_modules/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...(sonarjsPlugin.configs?.recommended ? [sonarjsPlugin.configs.recommended] : []),
  ...(security.configs?.recommended ? [security.configs.recommended] : []),
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
      'no-restricted-properties': [
        'error',
        {
          object: 'child_process',
          property: 'execSync',
          message: 'Use execFileSync with array args to prevent shell injection.',
        },
        {
          object: 'child_process',
          property: 'exec',
          message: 'Use execFile with callback and array args to prevent shell injection.',
        },
        {
          object: 'fs',
          property: 'statSync',
          message: 'Use lstatSync to avoid following symlinks outside containment boundary.',
        },
        {
          object: 'fs',
          property: 'stat',
          message: 'Use lstat to avoid following symlinks outside containment boundary.',
        },
      ],
    },
  },
);
```

**Key patterns:**

- `strictTypeChecked` requires `projectService` + `tsconfigRootDir`
- `allowDefaultProject: ['*.config.ts']` + `defaultProject: 'tsconfig.eslint.json'` lets ESLint type-check config files
- SonarJS and security plugin `configs.recommended` may be `undefined` — use optional chaining with spread
- `jiti` must be installed as devDependency for ESLint to load `.ts` config
- `no-restricted-properties` enforces `execFileSync` over `execSync` (shell injection) and `lstatSync` over `statSync` (symlink safety)
- `eslint-plugin-security` detects non-literal fs filenames, eval, object injection, and other Node.js security anti-patterns

## `prettier.config.ts`

```ts
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

## `.prettierignore`

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
```

## `lint-staged.config.ts`

```ts
const config = {
  '*.{ts,tsx}': [() => 'tsc --noEmit', 'eslint --fix', 'prettier --write'],
  '*.{json,yaml,yml,md}': ['prettier --write'],
};

export default config;
```

**Key pattern:** `() => 'tsc --noEmit'` uses function form so lint-staged runs the command as-is (full-project type-check) instead of appending staged file paths.

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src",
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["src/**/*.ts", "tests/**/*.ts"],
  "exclude": ["node_modules", "dist", "coverage"]
}
```

## `tsconfig.eslint.json`

```json
{
  "extends": "./tsconfig.json",
  "include": ["*.config.ts", "src/**/*.ts", "tests/**/*.ts"]
}
```

Extends the main config and adds `*.config.ts` so ESLint can type-check config files via `defaultProject`.
