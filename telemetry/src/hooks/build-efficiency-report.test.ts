import { describe, expect, it } from 'vitest';

import type { CraftBaselineRow, InitiativeMetricsRow } from '@/pipes';

import type { EfficiencyReportInput } from './build-efficiency-report';
import { buildEfficiencyReport } from './build-efficiency-report';

const makeMetricsRow = (overrides: Partial<InitiativeMetricsRow> = {}): InitiativeMetricsRow => ({
  agent_type: 'tdd-reviewer',
  invocations: 10,
  failures: 1,
  total_direct_tokens: 50000,
  total_cache_read: 200000,
  total_cost_usd: 3.5,
  avg_duration_ms: 1200,
  total_duration_ms: 12000,
  error_rate: 0.1,
  ...overrides,
});

const makeBaselineRow = (overrides: Partial<CraftBaselineRow> = {}): CraftBaselineRow => ({
  session_count: 10,
  avg_direct_tokens: 45000,
  median_direct_tokens: 42000,
  avg_cost_usd: 3.0,
  median_cost_usd: 2.8,
  avg_agent_count: 6,
  median_duration_ms: 100000,
  ...overrides,
});

const makeInput = (overrides: Partial<EfficiencyReportInput> = {}): EfficiencyReportInput => ({
  initiativeId: 'I25-TEST',
  metrics: [makeMetricsRow()],
  baseline7d: makeBaselineRow({ session_count: 5 }),
  baseline14d: makeBaselineRow({ session_count: 8 }),
  baseline30d: makeBaselineRow({ session_count: 15 }),
  ...overrides,
});

describe('buildEfficiencyReport', () => {
  describe('report structure', () => {
    it('returns report and summary', () => {
      const result = buildEfficiencyReport(makeInput());
      expect(result).toHaveProperty('report');
      expect(result).toHaveProperty('summary');
      expect(typeof result.report).toBe('string');
      expect(typeof result.summary).toBe('string');
    });

    it('includes initiative ID in report heading', () => {
      const { report } = buildEfficiencyReport(makeInput());
      expect(report).toContain('# Efficiency Report: I25-TEST');
    });

    it('includes Initiative Totals section', () => {
      const { report } = buildEfficiencyReport(makeInput());
      expect(report).toContain('## Initiative Totals');
    });

    it('includes Baseline Windows section', () => {
      const { report } = buildEfficiencyReport(makeInput());
      expect(report).toContain('## Baseline Windows');
    });

    it('includes Per-Agent Breakdown section', () => {
      const { report } = buildEfficiencyReport(makeInput());
      expect(report).toContain('## Per-Agent Breakdown');
    });
  });

  describe('initiative totals', () => {
    it('includes total cost', () => {
      const { report } = buildEfficiencyReport(makeInput());
      expect(report).toContain('$3.50');
    });

    it('includes total invocations', () => {
      const { report } = buildEfficiencyReport(makeInput());
      expect(report).toContain('10');
    });

    it('includes error rate', () => {
      const { report } = buildEfficiencyReport(makeInput());
      expect(report).toContain('10.0%');
    });

    it('calculates cache hit rate from metrics', () => {
      const { report } = buildEfficiencyReport(makeInput());
      expect(report).toContain('80.0%');
    });
  });

  describe('trend arrows', () => {
    it('shows up arrow when cost >10% above baseline median', () => {
      const input = makeInput({
        metrics: [makeMetricsRow({ total_cost_usd: 5.0 })],
        baseline7d: makeBaselineRow({ session_count: 5, median_cost_usd: 2.0 }),
      });
      const { report } = buildEfficiencyReport(input);
      expect(report).toMatch(/\$5\.00.*↑/);
    });

    it('shows down arrow when cost >10% below baseline median', () => {
      const input = makeInput({
        metrics: [makeMetricsRow({ total_cost_usd: 1.0 })],
        baseline7d: makeBaselineRow({ session_count: 5, median_cost_usd: 2.8 }),
      });
      const { report } = buildEfficiencyReport(input);
      expect(report).toMatch(/\$1\.00.*↓/);
    });

    it('shows stable arrow when cost within 10% of baseline', () => {
      const input = makeInput({
        metrics: [makeMetricsRow({ total_cost_usd: 2.9 })],
        baseline7d: makeBaselineRow({ session_count: 5, median_cost_usd: 2.8 }),
      });
      const { report } = buildEfficiencyReport(input);
      expect(report).toMatch(/\$2\.90.*→/);
    });

    it('shows n/a when no baseline data', () => {
      const input = makeInput({
        baseline7d: makeBaselineRow({ session_count: 0 }),
        baseline14d: makeBaselineRow({ session_count: 0 }),
        baseline30d: makeBaselineRow({ session_count: 0 }),
      });
      const { report } = buildEfficiencyReport(input);
      expect(report).toContain('n/a');
    });
  });

  describe('baseline selection', () => {
    it('prefers 7d baseline when >= 3 sessions', () => {
      const input = makeInput({
        baseline7d: makeBaselineRow({ session_count: 3, median_cost_usd: 1.0 }),
        baseline14d: makeBaselineRow({ session_count: 10, median_cost_usd: 5.0 }),
      });
      const { report } = buildEfficiencyReport(input);
      expect(report).toContain('7d');
    });

    it('falls back to 14d when 7d has < 3 sessions', () => {
      const input = makeInput({
        baseline7d: makeBaselineRow({ session_count: 2 }),
        baseline14d: makeBaselineRow({ session_count: 5, median_cost_usd: 3.0 }),
      });
      const { report } = buildEfficiencyReport(input);
      expect(report).toContain('14d');
    });

    it('falls back to 30d when 7d and 14d have < 3 sessions', () => {
      const input = makeInput({
        baseline7d: makeBaselineRow({ session_count: 1 }),
        baseline14d: makeBaselineRow({ session_count: 2 }),
        baseline30d: makeBaselineRow({ session_count: 10, median_cost_usd: 4.0 }),
      });
      const { report } = buildEfficiencyReport(input);
      expect(report).toContain('30d');
    });
  });

  describe('baseline windows table', () => {
    it('includes all three windows', () => {
      const { report } = buildEfficiencyReport(makeInput());
      expect(report).toContain('7d');
      expect(report).toContain('14d');
      expect(report).toContain('30d');
    });

    it('shows session counts', () => {
      const input = makeInput({
        baseline7d: makeBaselineRow({ session_count: 5 }),
        baseline14d: makeBaselineRow({ session_count: 8 }),
        baseline30d: makeBaselineRow({ session_count: 15 }),
      });
      const { report } = buildEfficiencyReport(input);
      expect(report).toContain('5');
      expect(report).toContain('8');
      expect(report).toContain('15');
    });
  });

  describe('per-agent breakdown', () => {
    it('lists each agent with metrics', () => {
      const input = makeInput({
        metrics: [
          makeMetricsRow({ agent_type: 'tdd-reviewer', invocations: 10, total_cost_usd: 3.5 }),
          makeMetricsRow({ agent_type: 'ts-enforcer', invocations: 5, total_cost_usd: 1.2 }),
        ],
      });
      const { report } = buildEfficiencyReport(input);
      expect(report).toContain('tdd-reviewer');
      expect(report).toContain('ts-enforcer');
    });

    it('shows agent failures', () => {
      const input = makeInput({
        metrics: [makeMetricsRow({ agent_type: 'broken-agent', failures: 3 })],
      });
      const { report } = buildEfficiencyReport(input);
      expect(report).toContain('3');
    });
  });

  describe('summary generation', () => {
    it('flags elevated error rate when > 5%', () => {
      const input = makeInput({
        metrics: [makeMetricsRow({ error_rate: 0.08 })],
      });
      const { summary } = buildEfficiencyReport(input);
      expect(summary).toContain('error rate');
    });

    it('flags low cache hit rate when < 30%', () => {
      const input = makeInput({
        metrics: [
          makeMetricsRow({
            total_direct_tokens: 80000,
            total_cache_read: 10000,
          }),
        ],
      });
      const { summary } = buildEfficiencyReport(input);
      expect(summary).toContain('cache');
    });

    it('does not flag normal metrics', () => {
      const input = makeInput({
        metrics: [
          makeMetricsRow({
            failures: 0,
            total_direct_tokens: 50000,
            total_cache_read: 200000,
          }),
        ],
      });
      const { summary } = buildEfficiencyReport(input);
      expect(summary).not.toContain('error rate');
      expect(summary).not.toContain('low cache');
    });

    it('mentions cost trend vs baseline', () => {
      const { summary } = buildEfficiencyReport(makeInput());
      expect(summary.length).toBeGreaterThan(0);
    });
  });

  describe('empty metrics', () => {
    it('returns report with no-data message when metrics empty', () => {
      const input = makeInput({ metrics: [] });
      const { report } = buildEfficiencyReport(input);
      expect(report).toContain('No telemetry data');
    });

    it('returns summary noting no data', () => {
      const input = makeInput({ metrics: [] });
      const { summary } = buildEfficiencyReport(input);
      expect(summary).toContain('No telemetry data');
    });
  });
});
