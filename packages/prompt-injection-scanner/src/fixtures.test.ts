import { readFileSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';

import { runCli } from './cli.js';
import { scan } from './scanner.js';
import type { Finding, Severity } from './types.js';

const currentDir = dirname(fileURLToPath(import.meta.url));
const fixturesDir = resolve(currentDir, '..', 'fixtures');

const readFixture = (name: string): string => readFileSync(resolve(fixturesDir, name), 'utf-8');

const fixturePath = (name: string): string => resolve(fixturesDir, name);

const HIGH_OR_CRITICAL: readonly Severity[] = ['HIGH', 'CRITICAL'];

const hasHighOrCriticalFindings = (findings: readonly Finding[]): boolean =>
  findings.some((f) => HIGH_OR_CRITICAL.includes(f.severity));

const listFixtures = (prefix: string): readonly string[] =>
  readdirSync(fixturesDir)
    .filter((f) => f.startsWith(prefix) && f.endsWith('.txt'))
    .sort();

type CategoryFixtureSpec = {
  readonly category: string;
  readonly fixturePrefix: string;
  readonly minFixtures: number;
};

const MALICIOUS_CATEGORIES: readonly CategoryFixtureSpec[] = [
  {
    category: 'instruction-override',
    fixturePrefix: 'malicious-instruction-override-',
    minFixtures: 3,
  },
  {
    category: 'data-exfiltration',
    fixturePrefix: 'malicious-data-exfiltration-',
    minFixtures: 3,
  },
  {
    category: 'tool-misuse',
    fixturePrefix: 'malicious-tool-misuse-',
    minFixtures: 3,
  },
  {
    category: 'safety-bypass',
    fixturePrefix: 'malicious-safety-bypass-',
    minFixtures: 3,
  },
  {
    category: 'social-engineering',
    fixturePrefix: 'malicious-social-engineering-',
    minFixtures: 3,
  },
  {
    category: 'encoding-obfuscation',
    fixturePrefix: 'malicious-encoding-obfuscation-',
    minFixtures: 3,
  },
  {
    category: 'privilege-escalation',
    fixturePrefix: 'malicious-privilege-escalation-',
    minFixtures: 3,
  },
  {
    category: 'transitive-trust',
    fixturePrefix: 'malicious-transitive-trust-',
    minFixtures: 3,
  },
];

describe('fixture integration tests', () => {
  describe('malicious fixtures produce HIGH/CRITICAL findings per category', () => {
    for (const spec of MALICIOUS_CATEGORIES) {
      describe(`${spec.category} fixtures`, () => {
        const fixtures = listFixtures(spec.fixturePrefix);

        it(`has at least ${String(spec.minFixtures)} fixture files`, () => {
          expect(fixtures.length).toBeGreaterThanOrEqual(spec.minFixtures);
        });

        for (const fixtureName of fixtures) {
          it(`detects ${spec.category} in ${fixtureName}`, () => {
            const content = readFixture(fixtureName);
            const result = scan(content);

            expect(hasHighOrCriticalFindings(result.findings)).toBe(true);

            const categoryFindings = result.findings.filter((f) => f.category === spec.category);
            expect(categoryFindings.length).toBeGreaterThanOrEqual(1);
          });
        }
      });
    }
  });

  describe('benign fixtures produce zero HIGH/CRITICAL findings', () => {
    const benignFixtures = listFixtures('benign-');

    it('has at least 5 benign fixture files', () => {
      expect(benignFixtures.length).toBeGreaterThanOrEqual(5);
    });

    for (const fixtureName of benignFixtures) {
      it(`produces no HIGH/CRITICAL findings for ${fixtureName}`, () => {
        const content = readFixture(fixtureName);
        const result = scan(content);

        const highOrCritical = result.findings.filter((f) => HIGH_OR_CRITICAL.includes(f.severity));
        expect(highOrCritical).toHaveLength(0);
      });
    }
  });

  describe('all fixtures have header comments documenting technique', () => {
    const maliciousFixtures = readdirSync(fixturesDir)
      .filter((f) => f.startsWith('malicious-') && f.endsWith('.txt'))
      .sort();

    for (const fixtureName of maliciousFixtures) {
      it(`${fixtureName} has header comment with attack technique`, () => {
        const content = readFixture(fixtureName);
        const lines = content.split('\n');
        const commentLines = lines.filter(
          (line) => line.startsWith('# Attack:') || line.startsWith('# Technique:'),
        );
        expect(commentLines.length).toBeGreaterThanOrEqual(2);
      });
    }
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
      const result = await runCli([fixturePath('benign-agent-standard.txt'), '--format', 'json']);

      expect(result.exitCode).toBe(0);
      expect(result.stderr).toBe('');
    });

    it('returns exit code 0 for benign skill fixture', async () => {
      const result = await runCli([fixturePath('benign-skill-standard.txt'), '--format', 'json']);

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
      expect(allFindings.some((f) => f.category === 'instruction-override')).toBe(true);
    });

    it('CLI JSON output contains zero findings for benign fixture', async () => {
      const result = await runCli([fixturePath('benign-agent-standard.txt'), '--format', 'json']);

      const parsed = JSON.parse(result.stdout) as readonly {
        readonly findings: readonly Finding[];
      }[];
      const allFindings = parsed.flatMap((r) => r.findings);

      expect(allFindings).toHaveLength(0);
    });
  });
});
