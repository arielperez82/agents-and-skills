// Telemetry-only; repo-wide *.sh and .github/workflows are in root lint-staged.config.ts.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const semgrepScript = resolve(dirname(fileURLToPath(import.meta.url)), '../scripts/run-semgrep.sh');

export default {
  '**/*.ts': (stagedFiles: string[]) => [
    'pnpm type-check',
    'pnpm lint:fix',
    `pnpm format:fix ${stagedFiles.join(' ')}`,
    `sh ${semgrepScript} ${stagedFiles.join(' ')}`,
  ],
  '**/*.{md,json,yaml,yml}': (stagedFiles: string[]) => [
    `pnpm format:fix ${stagedFiles.join(' ')}`,
  ],
  '{src,tests}/**/*.ts': () => ['pnpm test:unit:coverage'],
};
