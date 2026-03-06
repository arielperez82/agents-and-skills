import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../scripts');
const semgrepScript = resolve(scriptsDir, 'run-semgrep.sh');
const shellcheckScript = resolve(scriptsDir, 'run-shellcheck.sh');

export default {
  '**/*.ts': (stagedFiles: string[]) => [
    'pnpm type-check',
    'pnpm lint:fix',
    `pnpm format:fix ${stagedFiles.join(' ')}`,
  ],
  'src/**/*.ts': () => ['pnpm test:coverage'],
  '**/*.sh': (stagedFiles: string[]) => [`sh ${shellcheckScript} ${stagedFiles.join(' ')}`],
  '**/*.{sh,ts}': () => [`sh ${semgrepScript}`],
};
