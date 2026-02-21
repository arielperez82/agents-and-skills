import { describe, expect, it, vi } from 'vitest';

import type { TelemetryClient } from '@/client';

import { createStubClient } from './stub-client';

describe('createStubClient', () => {
  it('returns an object satisfying TelemetryClient shape', () => {
    const client: TelemetryClient = createStubClient();

    expect(client.ingest.agentActivations).toBeTypeOf('function');
    expect(client.ingest.apiRequests).toBeTypeOf('function');
    expect(client.ingest.sessionSummaries).toBeTypeOf('function');
    expect(client.ingest.skillActivations).toBeTypeOf('function');
    expect(client.ingest.telemetryHealth).toBeTypeOf('function');

    expect(client.query.agentUsageDaily).toBeTypeOf('function');
    expect(client.query.agentUsageSummary).toBeTypeOf('function');
    expect(client.query.costByAgent).toBeTypeOf('function');
    expect(client.query.costByModel).toBeTypeOf('function');
    expect(client.query.optimizationInsights).toBeTypeOf('function');
    expect(client.query.scriptPerformance).toBeTypeOf('function');
    expect(client.query.sessionOverview).toBeTypeOf('function');
    expect(client.query.skillFrequency).toBeTypeOf('function');
    expect(client.query.telemetryHealthSummary).toBeTypeOf('function');
  });

  it('ingest methods are vi.fn() stubs that resolve by default', async () => {
    const client = createStubClient();

    const result = await client.ingest.agentActivations({} as never);
    expect(result).toEqual({ successful_rows: 1, quarantined_rows: 0 });
    expect(vi.isMockFunction(client.ingest.agentActivations)).toBe(true);
  });

  it('query methods are vi.fn() stubs that resolve with empty data', async () => {
    const client = createStubClient();

    const result = await client.query.agentUsageSummary({ days: 7 });
    expect(result).toEqual({ data: [], meta: [], rows: 0, statistics: {} });
    expect(vi.isMockFunction(client.query.agentUsageSummary)).toBe(true);
  });

  it('allows overriding ingest methods', async () => {
    const custom = vi.fn().mockRejectedValue(new Error('boom'));
    const client = createStubClient({ ingest: { agentActivations: custom } });

    await expect(client.ingest.agentActivations({} as never)).rejects.toThrow('boom');
    expect(client.ingest.apiRequests).toBeTypeOf('function');
  });

  it('allows overriding query methods', async () => {
    const custom = vi
      .fn()
      .mockResolvedValue({ data: [{ agent_type: 'test' }], meta: [], rows: 1, statistics: {} });
    const client = createStubClient({ query: { agentUsageSummary: custom } });

    const result = await client.query.agentUsageSummary({ days: 7 });
    expect(result.data).toHaveLength(1);
  });
});
