// Telemetry-only; repo-wide *.sh and .github/workflows are in root lint-staged.config.ts.
export default {
  '**/*.ts': (stagedFiles: string[]) => [
    'pnpm type-check',
    'pnpm lint:fix',
    `pnpm format:fix ${stagedFiles.join(' ')}`,
  ],
  '**/*.{md,json,yaml,yml}': 'pnpm format:fix',
  '{src,tests}/**/*.ts': () => ['pnpm test:unit'],
  '**/*.sh': (stagedFiles: string[]) => {
    const args = stagedFiles.join(' ');
    return stagedFiles.length > 0 ? ['sh scripts/run-shellcheck.sh ' + args] : [];
  },
};
