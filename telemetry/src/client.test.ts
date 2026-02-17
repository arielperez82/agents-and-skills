import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { createTelemetryClient } from './client';

const BASE_URL = 'https://api.tinybird.co';
const INGEST_TOKEN = 'test-ingest-token';
const READ_TOKEN = 'test-read-token';

const createClient = () =>
  createTelemetryClient({
    baseUrl: BASE_URL,
    ingestToken: INGEST_TOKEN,
    readToken: READ_TOKEN,
  });

describe('createTelemetryClient', () => {
  describe('factory', () => {
    it('returns an object with ingest and query namespaces', () => {
      const client = createClient();

      expect(client.ingest).toBeDefined();
      expect(client.query).toBeDefined();
    });

    it('exposes batch ingest methods for all datasources', () => {
      const client = createClient();

      expect(typeof client.ingest.agentActivationsBatch).toBe('function');
      expect(typeof client.ingest.apiRequestsBatch).toBe('function');
      expect(typeof client.ingest.sessionSummariesBatch).toBe('function');
      expect(typeof client.ingest.skillActivationsBatch).toBe('function');
      expect(typeof client.ingest.telemetryHealthBatch).toBe('function');
    });

    it('exposes query methods for all pipes', () => {
      const client = createClient();

      expect(typeof client.query.agentUsageSummary).toBe('function');
      expect(typeof client.query.costByModel).toBe('function');
      expect(typeof client.query.optimizationInsights).toBe('function');
      expect(typeof client.query.sessionOverview).toBe('function');
      expect(typeof client.query.skillFrequency).toBe('function');
      expect(typeof client.query.telemetryHealthSummary).toBe('function');
    });
  });

  describe('query operations', () => {
    it('returns data from a successful query', async () => {
      const mockData = [{ agent_type: 'tdd-reviewer', invocations: 5, est_cost_usd: 0.05 }];

      server.use(
        http.get(`${BASE_URL}/v0/pipes/agent_usage_summary.json`, ({ request }) => {
          expect(request.headers.get('Authorization')).toBe(`Bearer ${READ_TOKEN}`);
          return HttpResponse.json({
            data: mockData,
            meta: [{ name: 'agent_type', type: 'String' }],
            rows: 1,
            statistics: { elapsed: 0.001, rows_read: 10, bytes_read: 100 },
          });
        })
      );

      const client = createClient();
      const result = await client.query.agentUsageSummary({ days: 7 });

      expect(result.data).toEqual(mockData);
      expect(result.rows).toBe(1);
    });

    it('returns empty data array when no results match', async () => {
      server.use(
        http.get(`${BASE_URL}/v0/pipes/agent_usage_summary.json`, () =>
          HttpResponse.json({
            data: [],
            meta: [],
            rows: 0,
            statistics: { elapsed: 0.001, rows_read: 0, bytes_read: 0 },
          })
        )
      );

      const client = createClient();
      const result = await client.query.agentUsageSummary({ days: 7 });

      expect(result.data).toEqual([]);
      expect(result.rows).toBe(0);
    });
  });

  describe('ingest operations', () => {
    it('sends ingest request with ingest token', async () => {
      let capturedAuth: string | null = null;

      server.use(
        http.post(`${BASE_URL}/v0/events`, ({ request }) => {
          capturedAuth = request.headers.get('Authorization');
          return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
        })
      );

      const client = createClient();
      await client.ingest.telemetryHealth({
        timestamp: new Date(),
        hook_name: 'test-hook',
        exit_code: 0,
        duration_ms: 100,
        error_message: null,
        tinybird_status_code: null,
      });

      expect(capturedAuth).toBe(`Bearer ${INGEST_TOKEN}`);
    });
  });

  describe('error handling', () => {
    it('rejects with error on 401 Unauthorized', async () => {
      server.use(
        http.get(`${BASE_URL}/v0/pipes/agent_usage_summary.json`, () =>
          HttpResponse.json({ error: 'Forbidden' }, { status: 401 })
        )
      );

      const client = createClient();
      await expect(client.query.agentUsageSummary({ days: 7 })).rejects.toThrow();
    });

    it('rejects with error on 429 Too Many Requests', async () => {
      server.use(
        http.get(`${BASE_URL}/v0/pipes/cost_by_model.json`, () =>
          HttpResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
        )
      );

      const client = createClient();
      await expect(client.query.costByModel({ days: 7 })).rejects.toThrow();
    });

    it('rejects with error on 500 Internal Server Error', async () => {
      server.use(
        http.get(`${BASE_URL}/v0/pipes/skill_frequency.json`, () =>
          HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
        )
      );

      const client = createClient();
      await expect(client.query.skillFrequency({ days: 7 })).rejects.toThrow();
    });

    it('rejects on network timeout', async () => {
      server.use(
        http.get(`${BASE_URL}/v0/pipes/agent_usage_summary.json`, () => HttpResponse.error())
      );

      const client = createClient();
      await expect(client.query.agentUsageSummary({ days: 7 })).rejects.toThrow();
    });

    it('rejects on malformed JSON response', async () => {
      server.use(
        http.get(
          `${BASE_URL}/v0/pipes/agent_usage_summary.json`,
          () =>
            new HttpResponse('not json {{{', {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            })
        )
      );

      const client = createClient();
      await expect(client.query.agentUsageSummary({ days: 7 })).rejects.toThrow();
    });

    it('rejects on ingest 401', async () => {
      server.use(
        http.post(`${BASE_URL}/v0/events`, () =>
          HttpResponse.json({ error: 'Forbidden' }, { status: 401 })
        )
      );

      const client = createClient();
      await expect(
        client.ingest.telemetryHealth({
          timestamp: new Date(),
          hook_name: 'test',
          exit_code: 0,
          duration_ms: 0,
          error_message: null,
          tinybird_status_code: null,
        })
      ).rejects.toThrow();
    });
  });
});
