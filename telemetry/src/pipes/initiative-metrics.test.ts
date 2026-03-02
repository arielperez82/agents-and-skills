import { objectKeysFromUnknown } from '@tests/helpers/object-keys';
import { describe, expect, it } from 'vitest';

import type { InitiativeMetricsRow } from './initiative-metrics';
import { initiativeMetrics } from './initiative-metrics';

const firstNode = () => {
  const n = initiativeMetrics.options.nodes[0];
  if (!n) throw new Error('Expected at least one node');
  return n;
};

const getOutput = () => {
  const output =
    'output' in initiativeMetrics.options ? initiativeMetrics.options.output : undefined;
  if (!output) throw new Error('Expected output to be defined');
  return output;
};

describe('initiative_metrics endpoint', () => {
  it('has the correct endpoint name', () => {
    expect(initiativeMetrics._name).toBe('initiative_metrics');
  });

  it('defines session_ids param as required string', () => {
    const params = initiativeMetrics._params;
    expect(params).toHaveProperty('session_ids');
    expect(params.session_ids._tinybirdType).toBe('String');
    expect(params.session_ids._required).toBe(true);
  });

  it('defines optional project_name param with empty string default', () => {
    const params = initiativeMetrics._params;
    expect(params).toHaveProperty('project_name');
    expect(params.project_name._tinybirdType).toBe('String');
    expect(params.project_name._required).toBe(false);
    expect(params.project_name._default).toBe('');
  });

  it('defines all 9 expected output fields', () => {
    const fieldNames = objectKeysFromUnknown(getOutput());
    expect(fieldNames).toHaveLength(9);
    expect(fieldNames).toEqual([
      'agent_type',
      'invocations',
      'failures',
      'total_direct_tokens',
      'total_cache_read',
      'total_cost_usd',
      'avg_duration_ms',
      'total_duration_ms',
      'error_rate',
    ]);
  });

  it('has a single node with the correct name', () => {
    const nodes = initiativeMetrics.options.nodes;
    expect(nodes).toHaveLength(1);
    expect(firstNode()._name).toBe('initiative_metrics_node');
  });

  it('SQL queries agent_activations with event=stop filter', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('FROM agent_activations');
    expect(sql).toContain("event = 'stop'");
  });

  it('SQL filters by session_ids using has(splitByChar)', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('has(splitByChar');
    expect(sql).toContain('session_id');
  });

  it('SQL groups by agent_type', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('GROUP BY agent_type');
  });

  it('SQL orders by total_cost_usd DESC', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('ORDER BY total_cost_usd DESC');
  });

  it('SQL supports optional project_name filter', () => {
    const sql = firstNode().sql;
    expect(sql).toContain("{{String(project_name, '')}} = ''");
    expect(sql).toContain('OR project_name =');
  });

  it('configures telemetry_read token with READ scope', () => {
    const tokens = initiativeMetrics.options.tokens;
    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);
    const tokenConfig = tokens?.[0] as {
      token: { _name: string };
      scope: string;
    };
    expect(tokenConfig.token._name).toBe('telemetry_read');
    expect(tokenConfig.scope).toBe('READ');
  });

  it('exports InitiativeMetricsRow type matching the output', () => {
    const row: InitiativeMetricsRow = {
      agent_type: 'tdd-reviewer',
      invocations: 10,
      failures: 1,
      total_direct_tokens: 50000,
      total_cache_read: 200000,
      total_cost_usd: 3.5,
      avg_duration_ms: 1200.5,
      total_duration_ms: 12005,
      error_rate: 0.1,
    };
    expect(row.agent_type).toBe('tdd-reviewer');
    expect(row.invocations).toBe(10);
    expect(row.total_cost_usd).toBe(3.5);
    expect(row.error_rate).toBe(0.1);
  });
});
