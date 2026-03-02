import { createStubClient } from '@tests/helpers/stub-client';
import { describe, expect, it, vi } from 'vitest';

import type { GenerateCraftEfficiencyReportDeps } from './generate-craft-efficiency-report';
import { runGenerateCraftEfficiencyReport } from './generate-craft-efficiency-report';

const VALID_STATUS_FILE = `---
initiative_id: I25-TEST
project_name: test-project
session_ids:
  - session-abc
  - session-def
complexity_tier: medium
---

# I25-TEST Status
`;

const makeMetricsData = () => [
  {
    agent_type: 'tdd-reviewer',
    invocations: 10,
    failures: 1,
    total_direct_tokens: 50000,
    total_cache_read: 200000,
    total_cost_usd: 3.5,
    avg_duration_ms: 1200,
    total_duration_ms: 12000,
    error_rate: 0.1,
  },
];

const makeBaselineData = (sessionCount = 10) => [
  {
    session_count: sessionCount,
    avg_direct_tokens: 45000,
    median_direct_tokens: 42000,
    avg_cost_usd: 3.0,
    median_cost_usd: 2.8,
    avg_agent_count: 6,
    median_duration_ms: 100000,
  },
];

const makeDeps = (
  overrides?: Partial<GenerateCraftEfficiencyReportDeps>
): GenerateCraftEfficiencyReportDeps => ({
  client: createStubClient({
    query: {
      initiativeMetrics: vi.fn().mockResolvedValue({
        data: makeMetricsData(),
        meta: [],
        rows: 1,
        statistics: {},
      }),
      craftBaseline: vi.fn().mockResolvedValue({
        data: makeBaselineData(),
        meta: [],
        rows: 1,
        statistics: {},
      }),
    },
  }),
  readFile: vi.fn().mockReturnValue(VALID_STATUS_FILE),
  writeFile: vi.fn(),
  health: vi.fn(),
  clock: { now: vi.fn().mockReturnValue(1000) },
  statusFilePath: '/path/to/status.md',
  outputDir: '/output',
  ...overrides,
});

describe('runGenerateCraftEfficiencyReport', () => {
  it('returns reportPath on success', async () => {
    const deps = makeDeps();
    const result = await runGenerateCraftEfficiencyReport(deps);
    expect(result.reportPath).toBe('/output/efficiency-report-I25-TEST.md');
  });

  it('reads the status file', async () => {
    const deps = makeDeps();
    await runGenerateCraftEfficiencyReport(deps);
    expect(deps.readFile).toHaveBeenCalledWith('/path/to/status.md');
  });

  it('queries initiative metrics with comma-separated session IDs', async () => {
    const deps = makeDeps();
    await runGenerateCraftEfficiencyReport(deps);
    expect(deps.client.query.initiativeMetrics).toHaveBeenCalledWith({
      session_ids: 'session-abc,session-def',
      project_name: 'test-project',
    });
  });

  it('queries craft baseline for 7d, 14d, and 30d', async () => {
    const deps = makeDeps();
    await runGenerateCraftEfficiencyReport(deps);
    expect(deps.client.query.craftBaseline).toHaveBeenCalledTimes(3);
    expect(deps.client.query.craftBaseline).toHaveBeenCalledWith({
      days: 7,
      project_name: 'test-project',
    });
    expect(deps.client.query.craftBaseline).toHaveBeenCalledWith({
      days: 14,
      project_name: 'test-project',
    });
    expect(deps.client.query.craftBaseline).toHaveBeenCalledWith({
      days: 30,
      project_name: 'test-project',
    });
  });

  it('writes markdown report to output directory', async () => {
    const deps = makeDeps();
    await runGenerateCraftEfficiencyReport(deps);
    expect(deps.writeFile).toHaveBeenCalledWith(
      '/output/efficiency-report-I25-TEST.md',
      expect.stringContaining('# Efficiency Report: I25-TEST') as string
    );
  });

  it('returns reason when status file has no session_ids', async () => {
    const deps = makeDeps({
      readFile: vi.fn().mockReturnValue(`---
initiative_id: I25-EMPTY
project_name: test
session_ids: []
---
`),
    });
    const result = await runGenerateCraftEfficiencyReport(deps);
    expect(result.reportPath).toBeNull();
    expect(result.reason).toContain('session');
  });

  it('returns reason when status file is unreadable', async () => {
    const deps = makeDeps({
      readFile: vi.fn().mockReturnValue(''),
    });
    const result = await runGenerateCraftEfficiencyReport(deps);
    expect(result.reportPath).toBeNull();
    expect(result.reason).toBeDefined();
  });

  it('returns reason on query failure without throwing', async () => {
    const deps = makeDeps({
      client: createStubClient({
        query: {
          initiativeMetrics: vi.fn().mockRejectedValue(new Error('network')),
          craftBaseline: vi.fn().mockRejectedValue(new Error('network')),
        },
      }),
    });
    const result = await runGenerateCraftEfficiencyReport(deps);
    expect(result.reportPath).toBeNull();
    expect(result.reason).toContain('network');
  });

  it('logs health event on success', async () => {
    const now = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1500);
    const deps = makeDeps({ clock: { now } });
    await runGenerateCraftEfficiencyReport(deps);
    expect(deps.health).toHaveBeenCalledWith(
      'generate-craft-efficiency-report',
      0,
      500,
      null,
      null
    );
  });

  it('logs health event on failure', async () => {
    const deps = makeDeps({
      client: createStubClient({
        query: {
          initiativeMetrics: vi.fn().mockRejectedValue(new Error('timeout')),
          craftBaseline: vi.fn().mockRejectedValue(new Error('timeout')),
        },
      }),
    });
    await runGenerateCraftEfficiencyReport(deps);
    expect(deps.health).toHaveBeenCalledWith(
      'generate-craft-efficiency-report',
      1,
      expect.any(Number) as number,
      'timeout',
      null
    );
  });

  it('handles missing initiative_id gracefully', async () => {
    const deps = makeDeps({
      readFile: vi.fn().mockReturnValue(`---
project_name: test
session_ids:
  - s1
---
`),
    });
    const result = await runGenerateCraftEfficiencyReport(deps);
    expect(result.reportPath).toBeNull();
    expect(result.reason).toContain('initiative_id');
  });

  it('handles status file without frontmatter', async () => {
    const deps = makeDeps({
      readFile: vi.fn().mockReturnValue('Just some content without frontmatter'),
    });
    const result = await runGenerateCraftEfficiencyReport(deps);
    expect(result.reportPath).toBeNull();
    expect(result.reason).toBeDefined();
  });
});
