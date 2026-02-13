import { defineConfig, mergeConfig } from 'vitest/config';

import { coverageConfig, sharedConfig } from './vitest.shared.config';

export default defineConfig(
  mergeConfig(sharedConfig, {
    test: {
      name: 'integration',
      include: ['tests/integration/**/*.test.ts'],
      testTimeout: 30_000,
      hookTimeout: 60_000,
      silent: 'passed-only',
      fileParallelism: false,
      poolOptions: {
        threads: { singleThread: true },
      },
      coverage: {
        ...coverageConfig,
        thresholds: {
          lines: 50,
          functions: 50,
          branches: 50,
          statements: 50,
        },
      },
    },
  })
);
