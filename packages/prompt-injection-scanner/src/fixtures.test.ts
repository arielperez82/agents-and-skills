import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

import { runCli } from './cli.js';
import { scan } from './scanner.js';
import type { Finding, Severity } from './types.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(currentDir, '..', 'fixtures');

const readFixture = (name: string): string =>
  readFileSync(resolve(fixturesDir, name), 'utf-8');

const fixturePath = (name: string): string => resolve(fixturesDir, name);

const hasHighOrCriticalFindings = (findings: readonly Finding[]): boolean =>
  findings.some(
    (f) => f.severity === 'HIGH' || f.severity === 'CRITICAL',
  );

const HIGH_OR_CRITICAL: readonly Severity[] = ['HIGH', 'CRITICAL'];

describe('fixture integration tests', () => {
  describe('4.1 — malicious fixtures produce findings when scanned', () => {
    it('detects instruction override in basic body text', () => {
      const content = readFixture('malicious-instruction-override-basic.txt');
      const result = scan(content);

      expect(hasHighOrCriticalFindings(result.findings)).toBe(true);

      const overrideFindings = result.findings.filter(
        (f) => f.category === 'instruction-override',
      );
      expect(overrideFindings.length).toBeGreaterThanOrEqual(1);
      expect(
        overrideFindings.every((f) =>
          HIGH_OR_CRITICAL.includes(f.severity),
        ),
      ).toBe(true);
    });

    it('detects instruction override hidden in frontmatter description', () => {
      const content = readFixture(
        'malicious-instruction-override-frontmatter.txt',
      );
      const result = scan(content);

      expect(hasHighOrCriticalFindings(result.findings)).toBe(true);

      const overrideFindings = result.findings.filter(
        (f) => f.category === 'instruction-override',
      );
      expect(overrideFindings.length).toBeGreaterThanOrEqual(1);
    });

    it('detects instruction override hidden in HTML comment', () => {
      const content = readFixture(
        'malicious-instruction-override-html-comment.txt',
      );
      const result = scan(content);

      expect(hasHighOrCriticalFindings(result.findings)).toBe(true);

      const overrideFindings = result.findings.filter(
        (f) => f.category === 'instruction-override',
      );
      expect(overrideFindings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('4.2 — benign fixtures produce zero HIGH/CRITICAL findings', () => {
    it('produces no HIGH/CRITICAL findings for standard agent definition', () => {
      const content = readFixture('benign-agent-standard.txt');
      const result = scan(content);

      const highOrCritical = result.findings.filter((f) =>
        HIGH_OR_CRITICAL.includes(f.severity),
      );
      expect(highOrCritical).toHaveLength(0);
    });

    it('produces no HIGH/CRITICAL findings for standard skill definition', () => {
      const content = readFixture('benign-skill-standard.txt');
      const result = scan(content);

      const highOrCritical = result.findings.filter((f) =>
        HIGH_OR_CRITICAL.includes(f.severity),
      );
      expect(highOrCritical).toHaveLength(0);
    });
  });

  describe('CLI integration with fixtures', () => {
    it('returns exit code 1 for malicious basic fixture', async () => {
      const result = await runCli([
        fixturePath('malicious-instruction-override-basic.txt'),
        '--format',
        'json',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toBe('');
    });

    it('returns exit code 1 for malicious frontmatter fixture', async () => {
      const result = await runCli([
        fixturePath('malicious-instruction-override-frontmatter.txt'),
        '--format',
        'json',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toBe('');
    });

    it('returns exit code 1 for malicious HTML comment fixture', async () => {
      const result = await runCli([
        fixturePath('malicious-instruction-override-html-comment.txt'),
        '--format',
        'json',
      ]);

      expect(result.exitCode).toBe(1);
      expect(result.stderr).toBe('');
    });

    it('returns exit code 0 for benign agent fixture', async () => {
      const result = await runCli([
        fixturePath('benign-agent-standard.txt'),
        '--format',
        'json',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe('');
    });

    it('returns exit code 0 for benign skill fixture', async () => {
      const result = await runCli([
        fixturePath('benign-skill-standard.txt'),
        '--format',
        'json',
      ]);

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe('');
    });

    it('CLI JSON output contains findings for malicious fixture', async () => {
      const result = await runCli([
        fixturePath('malicious-instruction-override-basic.txt'),
        '--format',
        'json',
      ]);

      const parsed = JSON.parse(result.stdout) as readonly {
        readonly findings: readonly Finding[];
      }[];
      const allFindings = parsed.flatMap((r) => r.findings);

      expect(allFindings.length).toBeGreaterThanOrEqual(1);
      expect(
        allFindings.some((f) => f.category === 'instruction-override'),
      ).toBe(true);
    });

    it('CLI JSON output contains zero findings for benign fixture', async () => {
      const result = await runCli([
        fixturePath('benign-agent-standard.txt'),
        '--format',
        'json',
      ]);

      const parsed = JSON.parse(result.stdout) as readonly {
        readonly findings: readonly Finding[];
      }[];
      const allFindings = parsed.flatMap((r) => r.findings);

      expect(allFindings).toHaveLength(0);
    });
  });
});
