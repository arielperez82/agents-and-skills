import { createStubClient } from '@tests/helpers/stub-client';
import { describe, expect, it, vi } from 'vitest';

import type { InjectUsageContextDeps } from './inject-usage-context';
import { runInjectUsageContext } from './inject-usage-context';

const makeMockAgentData = () => [
  {
    agent_type: 'tdd-reviewer',
    invocations: 10,
    total_input: 5000,
    total_output: 2000,
    total_cache_read: 1000,
    avg_duration_ms: 500,
    est_cost_usd: 0.05,
    failure_count: 0,
    error_rate: 0,
  },
];

const makeDeps = (overrides?: Partial<InjectUsageContextDeps>): InjectUsageContextDeps => ({
  client: createStubClient({
    query: {
      agentUsageSummary: vi.fn().mockResolvedValue({
        data: makeMockAgentData(),
        meta: [],
        rows: 1,
        statistics: {},
      }),
    },
  }),
  clock: { now: vi.fn().mockReturnValue(1000) },
  cache: {
    read: vi.fn().mockReturnValue({}),
    write: vi.fn(),
  },
  health: vi.fn(),
  ...overrides,
});

describe('runInjectUsageContext', () => {
  it('returns additionalContext from successful query', async () => {
    const deps = makeDeps();

    const result = await runInjectUsageContext(deps);

    expect(result).toHaveProperty('additionalContext');
    expect(typeof result.additionalContext).toBe('string');
    expect(result.additionalContext).toContain('tdd-reviewer');
  });

  it('queries agent usage summary', async () => {
    const deps = makeDeps();

    await runInjectUsageContext(deps);

    expect(deps.client.query.agentUsageSummary).toHaveBeenCalledWith({ days: 7 });
  });

  it('caches result on success', async () => {
    const deps = makeDeps();

    await runInjectUsageContext(deps);

    expect(deps.cache.write).toHaveBeenCalledOnce();
    expect(deps.cache.write).toHaveBeenCalledWith(
      expect.objectContaining({ additionalContext: expect.any(String) as string })
    );
  });

  it('falls back to cache when query fails', async () => {
    const deps = makeDeps({
      client: createStubClient({
        query: {
          agentUsageSummary: vi.fn().mockRejectedValue(new Error('network')),
        },
      }),
      cache: {
        read: vi.fn().mockReturnValue({ additionalContext: 'cached data' }),
        write: vi.fn(),
      },
    });

    const result = await runInjectUsageContext(deps);

    expect(result).toEqual({ additionalContext: 'cached data' });
  });

  it('returns empty object when query returns no data', async () => {
    const deps = makeDeps({
      client: createStubClient({
        query: {
          agentUsageSummary: vi.fn().mockResolvedValue({
            data: [],
            meta: [],
            rows: 0,
            statistics: {},
          }),
        },
      }),
    });

    const result = await runInjectUsageContext(deps);

    expect(result).toEqual({});
  });

  it('logs success health event after query', async () => {
    const now = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1200);
    const deps = makeDeps({ clock: { now } });

    await runInjectUsageContext(deps);

    expect(deps.health).toHaveBeenCalledWith('inject-usage-context', 0, 200, null, null);
  });

  it('logs failure health event on query error', async () => {
    const deps = makeDeps({
      client: createStubClient({
        query: {
          agentUsageSummary: vi.fn().mockRejectedValue(new Error('timeout')),
        },
      }),
    });

    await runInjectUsageContext(deps);

    expect(deps.health).toHaveBeenCalledWith(
      'inject-usage-context',
      1,
      expect.any(Number) as number,
      'timeout',
      null
    );
  });

  it('returns empty object when query fails and no cache exists', async () => {
    const deps = makeDeps({
      client: createStubClient({
        query: {
          agentUsageSummary: vi.fn().mockRejectedValue(new Error('network')),
        },
      }),
      cache: {
        read: vi.fn().mockReturnValue({}),
        write: vi.fn(),
      },
    });

    const result = await runInjectUsageContext(deps);

    expect(result).toEqual({});
  });
});
