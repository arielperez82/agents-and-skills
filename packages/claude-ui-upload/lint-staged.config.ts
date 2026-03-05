import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const semgrepScript = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../scripts/run-semgrep.sh',
);

export default {
  '**/*.{md,json,yaml,yml}': (stagedFiles: string[]) => [
    `pnpm format:fix ${stagedFiles.join(' ')}`,
  ],
  '**/*.ts': (stagedFiles: string[]) => [
    'pnpm type-check',
    'pnpm lint:fix',
    `pnpm format:fix ${stagedFiles.join(' ')}`,
    'pnpm test:unit',
    `sh ${semgrepScript} ${stagedFiles.join(' ')}`,
  ],
};
