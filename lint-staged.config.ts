// Root lint-staged: repo-wide files and scripts/skills-deploy only.
// Telemetry is handled by telemetry/lint-staged.config.ts (run from pre-commit when telemetry files staged).
export default {
  '**/*.sh': (stagedFiles: string[]) =>
    stagedFiles.length > 0
      ? [`sh telemetry/scripts/run-shellcheck.sh ${stagedFiles.join(' ')}`]
      : [],
  '.github/workflows/*.{yml,yaml}': (stagedFiles: string[]) =>
    stagedFiles.length > 0
      ? [`sh telemetry/scripts/run-actionlint.sh ${stagedFiles.join(' ')}`]
      : [],
  'scripts/skills-deploy/**/*.ts': () => [
    'bash -c "cd scripts/skills-deploy && pnpm type-check"',
    'bash -c "cd scripts/skills-deploy && pnpm lint:fix"',
    'bash -c "cd scripts/skills-deploy && pnpm format:fix ."',
    'bash -c "cd scripts/skills-deploy && pnpm test:unit"',
  ],
};
