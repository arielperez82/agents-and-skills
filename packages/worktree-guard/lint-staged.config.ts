// Worktree-guard package lint-staged config.
// Runs shellcheck, semgrep, and tests on staged shell scripts.
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../scripts');
const semgrepScript = resolve(scriptsDir, 'run-semgrep.sh');
const shellcheckScript = resolve(scriptsDir, 'run-shellcheck.sh');

export default {
  '**/*.sh': (stagedFiles: string[]) => [
    `sh ${shellcheckScript} --fix ${stagedFiles.join(' ')}`,
    `sh ${semgrepScript} ${stagedFiles.join(' ')}`,
    'bash test.sh',
  ],
};
