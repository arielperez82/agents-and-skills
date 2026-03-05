import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import security from 'eslint-plugin-security';
import { configs as tsConfigs } from 'typescript-eslint';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig(
  {
    ignores: ['coverage/**', 'dist/**', 'node_modules/**', 'src/manual-test.ts'],
  },
  js.configs.recommended,
  tsConfigs.strictTypeChecked,

  ...(security.configs?.recommended ? [security.configs.recommended] : []),
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: [] },
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-confusing-void-expression': 'off',
      '@typescript-eslint/no-deprecated': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      'security/detect-non-literal-fs-filename': 'off',
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
  {
    files: ['**/*.test.ts', '**/*.spec.ts', '**/tests/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unnecessary-condition': 'off',
      '@typescript-eslint/require-await': 'off',
    },
  },
  prettier,
);
