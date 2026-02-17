export default {
  '**/*.ts': (stagedFiles: string[]) => [
    'pnpm type-check',
    'pnpm lint:fix',
    `pnpm format:fix ${stagedFiles.join(' ')}`,
  ],
  '**/*.{md,json,yaml,yml}': 'pnpm format:fix',
  '{src,tests}/**/*.ts': () => ['pnpm test:unit'],
  '../.github/workflows/*.{yml,yaml}': (stagedFiles: string[]) => {
    const args = stagedFiles.map((f) => f.replace(/^\.\.\//, '')).join(' ');
    return stagedFiles.length > 0 ? ['sh scripts/run-actionlint.sh ' + args] : [];
  },
  '../**/*.sh': (stagedFiles: string[]) => {
    const args = stagedFiles.map((f) => f.replace(/^\.\.\//, '')).join(' ');
    return stagedFiles.length > 0 ? ['sh scripts/run-shellcheck.sh ' + args] : [];
  },
  '**/*.sh': (stagedFiles: string[]) => {
    const args = stagedFiles
      .map((f) => (f.startsWith('/') || f.startsWith('telemetry/') ? f : 'telemetry/' + f))
      .join(' ');
    return stagedFiles.length > 0 ? ['sh scripts/run-shellcheck.sh ' + args] : [];
  },
};
