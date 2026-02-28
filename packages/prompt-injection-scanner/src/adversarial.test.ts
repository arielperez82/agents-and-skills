import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

import { scan } from './scanner.js';
import type { Finding, Severity } from './types.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(currentDir, '..', 'fixtures');

const readFixture = (name: string): string => readFileSync(resolve(fixturesDir, name), 'utf-8');

const HIGH_OR_CRITICAL: readonly Severity[] = ['HIGH', 'CRITICAL'];

const hasUnsuppressedHighOrCritical = (findings: readonly Finding[]): boolean =>
  findings.some(
    (f) => (f.severity === 'HIGH' || f.severity === 'CRITICAL') && f.suppressed !== true,
  );

describe('adversarial fixture tests', () => {
  describe('trojan skill with HTML comment injection', () => {
    it('produces HIGH or CRITICAL findings', () => {
      const content = readFixture('adversarial-trojan-skill-html-comment.txt');
      const result = scan(content);

      expect(hasUnsuppressedHighOrCritical(result.findings)).toBe(true);
    });

    it('detects instruction-override category', () => {
      const content = readFixture('adversarial-trojan-skill-html-comment.txt');
      const result = scan(content);

      const overrideFindings = result.findings.filter((f) => f.category === 'instruction-override');
      expect(overrideFindings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('YAML description injection', () => {
    it('produces HIGH or CRITICAL findings', () => {
      const content = readFixture('adversarial-yaml-description-injection.txt');
      const result = scan(content);

      expect(hasUnsuppressedHighOrCritical(result.findings)).toBe(true);
    });

    it('detects injection in frontmatter context', () => {
      const content = readFixture('adversarial-yaml-description-injection.txt');
      const result = scan(content);

      const frontmatterFindings = result.findings.filter((f) =>
        f.context.startsWith('frontmatter:'),
      );
      expect(frontmatterFindings.length).toBeGreaterThanOrEqual(1);
      expect(frontmatterFindings.some((f) => HIGH_OR_CRITICAL.includes(f.severity))).toBe(true);
    });
  });

  describe('unicode invisible character injection', () => {
    it('produces HIGH or CRITICAL findings', () => {
      const content = readFixture('adversarial-unicode-invisible.txt');
      const result = scan(content);

      expect(hasUnsuppressedHighOrCritical(result.findings)).toBe(true);
    });

    it('detects encoding-obfuscation category from zero-width chars', () => {
      const content = readFixture('adversarial-unicode-invisible.txt');
      const result = scan(content);

      const unicodeFindings = result.findings.filter((f) => f.category === 'encoding-obfuscation');
      expect(unicodeFindings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('multi-vector attack combining techniques', () => {
    it('produces HIGH or CRITICAL findings', () => {
      const content = readFixture('adversarial-multi-vector.txt');
      const result = scan(content);

      expect(hasUnsuppressedHighOrCritical(result.findings)).toBe(true);
    });

    it('detects at least two distinct categories', () => {
      const content = readFixture('adversarial-multi-vector.txt');
      const result = scan(content);

      const highOrCriticalFindings = result.findings.filter((f) =>
        HIGH_OR_CRITICAL.includes(f.severity),
      );
      const distinctCategories = new Set(highOrCriticalFindings.map((f) => f.category));
      expect(distinctCategories.size).toBeGreaterThanOrEqual(2);
    });

    it('detects instruction-override among the findings', () => {
      const content = readFixture('adversarial-multi-vector.txt');
      const result = scan(content);

      expect(result.findings.some((f) => f.category === 'instruction-override')).toBe(true);
    });

    it('detects transitive-trust or encoding-obfuscation among the findings', () => {
      const content = readFixture('adversarial-multi-vector.txt');
      const result = scan(content);

      const hasSecondVector = result.findings.some(
        (f) => f.category === 'transitive-trust' || f.category === 'encoding-obfuscation',
      );
      expect(hasSecondVector).toBe(true);
    });
  });
});
