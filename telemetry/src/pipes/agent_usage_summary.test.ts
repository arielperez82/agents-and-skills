import { describe, expect, it } from 'vitest';

import type { AgentUsageSummaryRow } from './agent_usage_summary';
import { agentUsageSummary } from './agent_usage_summary';

describe('agent_usage_summary endpoint', () => {
  it('has the correct endpoint name', () => {
    expect(agentUsageSummary._name).toBe('agent_usage_summary');
  });

  it('defines days param with default of 7', () => {
    const params = agentUsageSummary._params;
    expect(params).toHaveProperty('days');
    expect(params.days._tinybirdType).toBe('Int32');
    expect(params.days._required).toBe(false);
    expect(params.days._default).toBe(7);
  });

  it('defines all 9 expected output fields', () => {
    const output = agentUsageSummary.options.output;
    expect(output).toBeDefined();

    const fieldNames = Object.keys(output as Record<string, unknown>);
    expect(fieldNames).toHaveLength(9);
    expect(fieldNames).toEqual([
      'agent_type',
      'invocations',
      'total_input',
      'total_output',
      'total_cache_read',
      'avg_duration_ms',
      'est_cost_usd',
      'failure_count',
      'error_rate',
    ]);
  });

  it('has a single node with the correct name', () => {
    const nodes = agentUsageSummary.options.nodes;
    expect(nodes).toHaveLength(1);

    const [firstNode] = nodes;
    expect(firstNode).toBeDefined();
    expect(firstNode).toHaveProperty('_name', 'agent_usage_summary');
  });

  it('SQL references agent_activations with event stop filter', () => {
    const [firstNode] = agentUsageSummary.options.nodes;
    expect(firstNode).toBeDefined();

    const sql = (firstNode as { sql: string }).sql;
    expect(sql).toContain('agent_activations');
    expect(sql).toContain("event = 'stop'");
  });

  it('SQL groups by agent_type and orders by est_cost_usd DESC', () => {
    const [firstNode] = agentUsageSummary.options.nodes;
    expect(firstNode).toBeDefined();

    const sql = (firstNode as { sql: string }).sql;
    expect(sql).toContain('GROUP BY agent_type');
    expect(sql).toContain('ORDER BY est_cost_usd DESC');
  });

  it('SQL uses days param with INTERVAL filter', () => {
    const [firstNode] = agentUsageSummary.options.nodes;
    expect(firstNode).toBeDefined();

    const sql = (firstNode as { sql: string }).sql;
    expect(sql).toContain('{{Int32(days, 7)}}');
    expect(sql).toContain('INTERVAL');
  });

  it('configures telemetry_read token with READ scope', () => {
    const tokens = agentUsageSummary.options.tokens;
    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);

    const [firstToken] = tokens as ReadonlyArray<{
      token: { _name: string };
      scope: string;
    }>;
    expect(firstToken).toBeDefined();
    expect(firstToken).toHaveProperty('scope', 'READ');
    expect((firstToken as { token: { _name: string } }).token._name).toBe('telemetry_read');
  });

  it('exports AgentUsageSummaryRow type matching the output', () => {
    const row: AgentUsageSummaryRow = {
      agent_type: 'data-engineer',
      invocations: 42,
      total_input: 100000,
      total_output: 50000,
      total_cache_read: 20000,
      avg_duration_ms: 1500.5,
      est_cost_usd: 2.5,
      failure_count: 3,
      error_rate: 0.071,
    };
    expect(row.agent_type).toBe('data-engineer');
    expect(row.invocations).toBe(42);
  });
});
