import * as fs from 'node:fs';
import * as path from 'node:path';

import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { runInjectUsageContext } from './inject-usage-context';

const BASE_URL = 'https://api.tinybird.co';
const CACHE_DIR = path.join(process.env['HOME'] ?? '/tmp', '.cache', 'agents-and-skills');
const CACHE_FILE = path.join(CACHE_DIR, 'usage-context.json');

const setupEnv = () => {
  vi.stubEnv('TB_INGEST_TOKEN', 'test-ingest');
  vi.stubEnv('TB_READ_TOKEN', 'test-read');
  vi.stubEnv('TB_HOST', BASE_URL);
};

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

const mockAgentUsageSummaryEndpoint = (
  data: readonly Record<string, unknown>[] = makeMockAgentData()
) => {
  server.use(
    http.get(`${BASE_URL}/v0/pipes/agent_usage_summary.json`, () =>
      HttpResponse.json({
        data,
        meta: [],
        rows: data.length,
        statistics: { elapsed: 0.001, rows_read: 10, bytes_read: 100 },
      })
    )
  );
};

afterEach(() => {
  vi.unstubAllEnvs();
  try {
    fs.unlinkSync(CACHE_FILE);
  } catch {
    // ignore
  }
});

describe('runInjectUsageContext', () => {
  it('returns empty object when env vars are missing', async () => {
    vi.stubEnv('TB_INGEST_TOKEN', '');
    vi.stubEnv('TB_READ_TOKEN', '');
    vi.stubEnv('TB_HOST', '');

    const result = await runInjectUsageContext();

    expect(result).toEqual({});
  });

  it('returns additionalContext from successful query', async () => {
    setupEnv();
    mockAgentUsageSummaryEndpoint();

    const result = await runInjectUsageContext();

    expect(result).toHaveProperty('additionalContext');
    expect(typeof result.additionalContext).toBe('string');
    expect(result.additionalContext).toContain('tdd-reviewer');
  });

  it('caches result to disk on success', async () => {
    setupEnv();
    mockAgentUsageSummaryEndpoint();

    await runInjectUsageContext();

    expect(fs.existsSync(CACHE_FILE)).toBe(true);
    const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8')) as Record<string, unknown>;
    expect(cached).toHaveProperty('additionalContext');
  });

  it('falls back to cache when query fails', async () => {
    setupEnv();

    fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ additionalContext: 'cached data' }));

    server.use(
      http.get(`${BASE_URL}/v0/pipes/agent_usage_summary.json`, () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 })
      )
    );

    const result = await runInjectUsageContext();

    expect(result).toEqual({ additionalContext: 'cached data' });
  });

  it('returns empty object when query fails and no cache exists', async () => {
    setupEnv();

    server.use(
      http.get(`${BASE_URL}/v0/pipes/agent_usage_summary.json`, () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 })
      )
    );

    const result = await runInjectUsageContext();

    expect(result).toEqual({});
  });

  it('returns empty object when query returns no data', async () => {
    setupEnv();
    mockAgentUsageSummaryEndpoint([]);

    const result = await runInjectUsageContext();

    expect(result).toEqual({});
  });
});
