import { defineConfig, mergeConfig } from 'vitest/config';

import { coverageConfig, sharedConfig } from './vitest.shared.config';

export default defineConfig(
  mergeConfig(sharedConfig, {
    test: {
      name: 'unit',
      include: ['src/**/*.test.ts'],
      setupFiles: ['tests/setup-msw.ts'],
      testTimeout: 3000,
      coverage: {
        ...coverageConfig,
        thresholds: {
          lines: 65,
          functions: 65,
          branches: 65,
          statements: 65,
        },
      },
    },
  })
);
