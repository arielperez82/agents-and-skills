// Context-management package lint-staged config.
// Runs shellcheck, semgrep, and tests on staged shell scripts.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const semgrepScript = resolve(dirname(fileURLToPath(import.meta.url)), '../../scripts/run-semgrep.sh');

export default {
  '**/*.sh': (stagedFiles: string[]) => [
    `shellcheck --severity=warning ${stagedFiles.join(' ')}`,
    `sh ${semgrepScript} ${stagedFiles.join(' ')}`,
    'bash test.sh',
  ],
};
