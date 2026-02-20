import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

export const coverageConfig = {
  provider: 'v8' as const,
  reporter: ['text', 'json', 'html'],
  exclude: ['node_modules/', 'dist/', '**/*.config.ts', '**/*.test.ts', 'tests/**'],
};

export const sharedConfig = defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@tests': resolve(__dirname, 'tests'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
