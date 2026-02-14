import { describe, expect, it } from 'vitest';

import type { SessionSummaryRow } from './session_summaries';
import { sessionSummaries } from './session_summaries';

describe('session_summaries datasource', () => {
  it('has the correct datasource name', () => {
    expect(sessionSummaries._name).toBe('session_summaries');
  });

  it('defines all 13 expected schema fields', () => {
    const fieldNames = Object.keys(sessionSummaries.options.schema);

    expect(fieldNames).toHaveLength(13);
    expect(fieldNames).toEqual([
      'timestamp',
      'session_id',
      'total_duration_ms',
      'agent_count',
      'skill_count',
      'api_request_count',
      'total_input_tokens',
      'total_output_tokens',
      'total_cache_read_tokens',
      'total_cost_usd',
      'agents_used',
      'skills_used',
      'model_primary',
    ]);
  });

  it('uses MergeTree engine with correct sorting key', () => {
    const engineConfig = sessionSummaries.options.engine;

    expect(engineConfig).toBeDefined();
    expect(engineConfig?.type).toBe('MergeTree');
    expect(engineConfig?.sortingKey).toEqual(['toStartOfDay(timestamp)', 'session_id']);
  });

  it('configures telemetry_ingest token with APPEND scope', () => {
    const tokens = sessionSummaries.options.tokens;

    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);

    const tokenConfig = tokens?.[0];
    expect(tokenConfig).toHaveProperty('token');
    expect(tokenConfig).toHaveProperty('scope', 'APPEND');

    const tokenRef = tokenConfig as { token: { _name: string }; scope: string };
    expect(tokenRef.token._name).toBe('telemetry_ingest');
  });

  it('exports SessionSummaryRow type that matches the schema', () => {
    const row: SessionSummaryRow = {
      timestamp: new Date(),
      session_id: 'sess-abc-123',
      total_duration_ms: 45000,
      agent_count: 3,
      skill_count: 5,
      api_request_count: 12,
      total_input_tokens: 15000,
      total_output_tokens: 8000,
      total_cache_read_tokens: 2000,
      total_cost_usd: 0.042,
      agents_used: ['data-engineer', 'tdd-reviewer'],
      skills_used: ['tdd', 'typescript-strict', 'testing'],
      model_primary: 'claude-opus-4-6',
    };

    expect(row.session_id).toBe('sess-abc-123');
    expect(row.agents_used).toEqual(['data-engineer', 'tdd-reviewer']);
    expect(row.skills_used).toEqual(['tdd', 'typescript-strict', 'testing']);
  });
});
