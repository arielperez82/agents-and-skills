export default {
  '**/*.ts': (stagedFiles: string[]) => [
    'pnpm type-check',
    'pnpm lint:fix',
    `pnpm format:fix ${stagedFiles.join(' ')}`,
  ],
  '**/*.{md,json,yaml,yml}': 'pnpm format:fix',
  '{src,tests}/**/*.ts': () => ['pnpm test:unit'],
  '.github/workflows/*.{yml,yaml}': () => [
    'sh',
    '-c',
    'cd "$(git rev-parse --show-toplevel)" && actionlint',
  ],
};
