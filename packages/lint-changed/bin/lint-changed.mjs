#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cli = resolve(__dirname, '..', 'src', 'cli.ts');

const require = createRequire(import.meta.url);
const tsxBin = resolve(dirname(require.resolve('tsx/package.json')), 'dist', 'cli.mjs');

try {
  execFileSync(process.execPath, [tsxBin, cli, ...process.argv.slice(2)], {
    stdio: 'inherit',
  });
} catch (err) {
  const code =
    err !== null && typeof err === 'object' && 'status' in err && typeof err.status === 'number'
      ? err.status
      : 1;
  process.exit(code);
}
