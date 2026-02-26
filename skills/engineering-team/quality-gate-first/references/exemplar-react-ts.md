# Exemplar: React + TypeScript

Complete Phase 0 config files for a React TypeScript project (Next.js, Vite, CRA). Extends the Node.js exemplar with frontend-specific additions: JSX a11y, React hooks, Stylelint, and DOM lib.

## Directory structure

```
project-root/
├── .husky/
│   └── pre-commit
├── eslint.config.ts
├── prettier.config.ts
├── .prettierignore
├── .stylelintrc.json
├── lint-staged.config.ts
├── tsconfig.json
└── tsconfig.eslint.json
```

## `.husky/pre-commit`

```bash
NODE_OPTIONS=--experimental-strip-types pnpx lint-staged --verbose
```

> **Note:** Same as Node.js exemplar — `NODE_OPTIONS=--experimental-strip-types` required for `.ts` config files (Node 22+).

## `eslint.config.ts`

```ts
import eslint from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import security from 'eslint-plugin-security';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import sonarjsPlugin from 'eslint-plugin-sonarjs';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['coverage/**', 'dist/**', 'build/**', 'node_modules/**', '.next/**'] },
  eslint.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...(sonarjsPlugin.configs?.recommended ? [sonarjsPlugin.configs.recommended] : []),
  ...(security.configs?.recommended ? [security.configs.recommended] : []),
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

**Differences from Node.js exemplar:**

- Adds `.next/**` to ignores
- Adds `eslint-plugin-jsx-a11y` (flat config: `jsxA11y.flatConfigs.recommended`)
- Adds `eslint-plugin-react-hooks` with rules-of-hooks and exhaustive-deps
- Security plugin and `no-restricted-properties` rules are inherited from Node.js exemplar

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
  jsxSingleQuote: false,
};

export default config;
```

**Difference from Node.js exemplar:** Adds `jsxSingleQuote: false` for JSX attribute quotes.

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
.next/
.vercel/
```

**Difference from Node.js exemplar:** Adds `.next/` and `.vercel/` ignores.

## `.stylelintrc.json`

```json
{
  "extends": ["stylelint-config-standard", "stylelint-config-prettier"],
  "rules": {
    "declaration-block-no-redundant-longhand-properties": true,
    "shorthand-property-no-redundant-values": true,
    "no-descending-specificity": null
  }
}
```

**Frontend-only.** Not present in the Node.js exemplar.

## `lint-staged.config.ts`

```ts
const config = {
  '*.{ts,tsx}': [() => 'tsc --noEmit', 'eslint --fix', 'prettier --write'],
  '*.css': ['stylelint --fix', 'prettier --write'],
  '*.{json,yaml,yml,md}': ['prettier --write'],
};

export default config;
```

**Difference from Node.js exemplar:** Adds `*.css` glob with Stylelint.

## `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ES2022"],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "noEmit": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts", "tests/**/*.tsx"],
  "exclude": ["node_modules", "dist", "coverage", ".next"]
}
```

**Differences from Node.js exemplar:**

- Adds `"lib": ["DOM", "DOM.Iterable", "ES2022"]` for browser APIs
- Uses `"module": "ESNext"` + `"moduleResolution": "Bundler"` (bundler-based, not NodeNext)
- Adds `"jsx": "react-jsx"`
- Uses `"noEmit": true` instead of `outDir`/`rootDir`/`declaration` (bundler handles output)
- Adds path alias `@/*` → `src/*` (must also configure in Vite/Vitest `resolve.alias`)
- Includes `.tsx` files

## `tsconfig.eslint.json`

```json
{
  "extends": "./tsconfig.json",
  "include": ["*.config.ts", "src/**/*.ts", "src/**/*.tsx", "tests/**/*.ts", "tests/**/*.tsx"]
}
```

Same purpose as Node.js exemplar — adds `*.config.ts` for ESLint type-checking. Also includes `.tsx` globs.
