import { describe, it, expect } from 'vitest';

import type { FileResult } from './formatters.js';
import { formatHuman, formatJson } from './formatters.js';
import type { Finding } from './types.js';

const createFinding = (overrides: Partial<Finding> = {}): Finding => ({
  category: 'instruction-override',
  severity: 'HIGH',
  line: 5,
  column: 1,
  matchedText: 'ignore all previous instructions',
  patternId: 'io-001',
  message: 'Instruction override attempt detected',
  context: 'body',
  ...overrides,
});

const createFileResult = (
  overrides: Partial<FileResult> = {},
): FileResult => ({
  file: 'test.md',
  findings: [],
  summary: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
  ...overrides,
});

describe('formatJson', () => {
  it('produces valid parseable JSON', () => {
    const results: readonly FileResult[] = [createFileResult()];

    const output = formatJson(results);

    expect(() => JSON.parse(output)).not.toThrow();
  });

  it('includes file, findings array, and summary in output', () => {
    const finding = createFinding();
    const result = createFileResult({
      file: 'docs/agent.md',
      findings: [finding],
      summary: { total: 1, critical: 0, high: 1, medium: 0, low: 0 },
    });

    const output = formatJson([result]);
    const parsed = JSON.parse(output) as readonly FileResult[];

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(
      expect.objectContaining({
        file: 'docs/agent.md',
        findings: [expect.objectContaining({ patternId: 'io-001' })],
        summary: expect.objectContaining({ total: 1, high: 1 }),
      }),
    );
  });

  it('handles multiple files', () => {
    const results: readonly FileResult[] = [
      createFileResult({ file: 'a.md' }),
      createFileResult({ file: 'b.md' }),
    ];

    const output = formatJson(results);
    const parsed = JSON.parse(output) as readonly FileResult[];

    expect(parsed).toHaveLength(2);
  });

  it('produces clean output for empty findings', () => {
    const output = formatJson([createFileResult()]);
    const parsed = JSON.parse(output) as readonly FileResult[];

    expect(parsed[0]?.findings).toEqual([]);
    expect(parsed[0]?.summary.total).toBe(0);
  });
});

describe('formatHuman', () => {
  it('groups output by file', () => {
    const results: readonly FileResult[] = [
      createFileResult({
        file: 'a.md',
        findings: [createFinding({ line: 1 })],
        summary: { total: 1, critical: 0, high: 1, medium: 0, low: 0 },
      }),
      createFileResult({
        file: 'b.md',
        findings: [createFinding({ line: 3 })],
        summary: { total: 1, critical: 0, high: 1, medium: 0, low: 0 },
      }),
    ];

    const output = formatHuman(results);

    expect(output).toContain('a.md');
    expect(output).toContain('b.md');
  });

  it('includes severity level in output', () => {
    const results: readonly FileResult[] = [
      createFileResult({
        findings: [createFinding({ severity: 'CRITICAL' })],
        summary: { total: 1, critical: 1, high: 0, medium: 0, low: 0 },
      }),
    ];

    const output = formatHuman(results);

    expect(output).toContain('CRITICAL');
  });

  it('includes line numbers in output', () => {
    const results: readonly FileResult[] = [
      createFileResult({
        findings: [createFinding({ line: 42 })],
        summary: { total: 1, critical: 0, high: 1, medium: 0, low: 0 },
      }),
    ];

    const output = formatHuman(results);

    expect(output).toContain('42');
  });

  it('includes pattern ID in output', () => {
    const results: readonly FileResult[] = [
      createFileResult({
        findings: [createFinding({ patternId: 'io-007' })],
        summary: { total: 1, critical: 0, high: 1, medium: 0, low: 0 },
      }),
    ];

    const output = formatHuman(results);

    expect(output).toContain('io-007');
  });

  it('produces clean output for empty findings', () => {
    const output = formatHuman([createFileResult()]);

    expect(output).toContain('0 findings');
  });

  it('shows summary counts', () => {
    const results: readonly FileResult[] = [
      createFileResult({
        findings: [
          createFinding({ severity: 'CRITICAL' }),
          createFinding({ severity: 'HIGH' }),
        ],
        summary: { total: 2, critical: 1, high: 1, medium: 0, low: 0 },
      }),
    ];

    const output = formatHuman(results);

    expect(output).toContain('2 findings');
  });
});
