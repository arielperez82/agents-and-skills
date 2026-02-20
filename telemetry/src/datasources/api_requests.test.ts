import { describe, expect, it } from 'vitest';

import type { ApiRequestRow } from './api_requests';
import { apiRequests } from './api_requests';

describe('api_requests datasource', () => {
  it('has the correct datasource name', () => {
    expect(apiRequests._name).toBe('api_requests');
  });

  it('defines all 12 expected schema fields', () => {
    const fieldNames = Object.keys(apiRequests.options.schema);

    expect(fieldNames).toHaveLength(12);
    expect(fieldNames).toEqual([
      'timestamp',
      'session_id',
      'model',
      'input_tokens',
      'output_tokens',
      'cache_read_tokens',
      'cache_creation_tokens',
      'cost_usd',
      'duration_ms',
      'status_code',
      'error_type',
      'source',
    ]);
  });

  it('uses MergeTree engine with correct sorting key', () => {
    const engineConfig = apiRequests.options.engine;

    expect(engineConfig).toBeDefined();
    expect(engineConfig?.type).toBe('MergeTree');
    expect(engineConfig?.sortingKey).toEqual(['model', 'toStartOfHour(timestamp)', 'session_id']);
  });

  it('configures telemetry_ingest token with APPEND scope', () => {
    const tokens = apiRequests.options.tokens;

    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);

    const tokenConfig = tokens?.[0];
    expect(tokenConfig).toHaveProperty('token');
    expect(tokenConfig).toHaveProperty('scope', 'APPEND');

    const tokenRef = tokenConfig as { token: { _name: string }; scope: string };
    expect(tokenRef.token._name).toBe('telemetry_ingest');
  });

  it('exports ApiRequestRow type that matches the schema', () => {
    const row: ApiRequestRow = {
      timestamp: new Date().toISOString(),
      session_id: 'sess-abc-123',
      model: 'claude-opus-4-6',
      input_tokens: 15000,
      output_tokens: 8000,
      cache_read_tokens: 2000,
      cache_creation_tokens: 500,
      cost_usd: 0.042,
      duration_ms: 3500,
      status_code: 200,
      error_type: null,
      source: 'claude-code',
    };

    expect(row.session_id).toBe('sess-abc-123');
    expect(row.model).toBe('claude-opus-4-6');
    expect(row.cost_usd).toBe(0.042);
    expect(row.error_type).toBeNull();
  });

  it('allows non-null values for nullable error_type field', () => {
    const row: ApiRequestRow = {
      timestamp: new Date().toISOString(),
      session_id: 'sess-err-456',
      model: 'claude-opus-4-6',
      input_tokens: 1000,
      output_tokens: 0,
      cache_read_tokens: 0,
      cache_creation_tokens: 0,
      cost_usd: 0.003,
      duration_ms: 12000,
      status_code: 529,
      error_type: 'overloaded_error',
      source: 'claude-code',
    };

    expect(row.error_type).toBe('overloaded_error');
    expect(row.status_code).toBe(529);
  });
});
