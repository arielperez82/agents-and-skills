import { describe, expect, it } from 'vitest';

import type { AgentActivationRow } from './agent-activations';
import { agentActivations } from './agent-activations';

describe('agent_activations datasource', () => {
  it('has the correct datasource name', () => {
    expect(agentActivations._name).toBe('agent_activations');
  });

  it('defines all 17 expected schema fields', () => {
    const fieldNames = Object.keys(agentActivations.options.schema);

    expect(fieldNames).toHaveLength(17);
    expect(fieldNames).toEqual([
      'timestamp',
      'session_id',
      'parent_session_id',
      'agent_type',
      'agent_id',
      'event',
      'input_tokens',
      'output_tokens',
      'cache_read_tokens',
      'cache_creation_tokens',
      'duration_ms',
      'model',
      'est_cost_usd',
      'success',
      'error_type',
      'tool_calls_count',
      'project_name',
    ]);
  });

  it('uses MergeTree engine with correct sorting key', () => {
    const engineConfig = agentActivations.options.engine;

    expect(engineConfig).toBeDefined();
    expect(engineConfig?.type).toBe('MergeTree');
    expect(engineConfig?.sortingKey).toEqual([
      'agent_type',
      'model',
      'toStartOfHour(timestamp)',
      'session_id',
    ]);
  });

  it('configures telemetry_ingest token with APPEND scope', () => {
    const tokens = agentActivations.options.tokens;

    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);

    const tokenConfig = tokens?.[0];
    expect(tokenConfig).toHaveProperty('token');
    expect(tokenConfig).toHaveProperty('scope', 'APPEND');

    const tokenRef = tokenConfig as { token: { _name: string }; scope: string };
    expect(tokenRef.token._name).toBe('telemetry_ingest');
  });

  it('exports AgentActivationRow type that matches the schema', () => {
    const row: AgentActivationRow = {
      timestamp: new Date().toISOString(),
      session_id: 'sess-123',
      parent_session_id: null,
      agent_type: 'data-engineer',
      agent_id: 'agent-456',
      event: 'start',
      input_tokens: 1500,
      output_tokens: 800,
      cache_read_tokens: 200,
      cache_creation_tokens: 100,
      duration_ms: 45000,
      model: 'claude-opus-4-6',
      est_cost_usd: 0.05,
      success: 1,
      error_type: null,
      tool_calls_count: 12,
      project_name: '',
    };

    expect(row.session_id).toBe('sess-123');
    expect(row.parent_session_id).toBeNull();
    expect(row.error_type).toBeNull();
  });
});
