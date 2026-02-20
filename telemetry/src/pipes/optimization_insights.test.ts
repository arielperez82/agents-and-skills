import { objectKeysFromUnknown } from '@tests/helpers/object-keys';
import { describe, expect, it } from 'vitest';

import type { OptimizationInsightsRow } from './optimization_insights';
import { optimizationInsights } from './optimization_insights';

const firstNode = () => {
  const n = optimizationInsights.options.nodes[0];
  if (!n) throw new Error('Expected at least one node');
  return n;
};

describe('optimization_insights endpoint', () => {
  it('has the correct endpoint name', () => {
    expect(optimizationInsights._name).toBe('optimization_insights');
  });

  it('defines days param with default of 7', () => {
    const params = optimizationInsights._params;
    expect(params).toHaveProperty('days');
    expect(params.days._tinybirdType).toBe('Int32');
    expect(params.days._required).toBe(false);
    expect(params.days._default).toBe(7);
  });

  it('defines all 6 expected output fields with cache_hit_rate instead of cache_ratio', () => {
    const output =
      'output' in optimizationInsights.options ? optimizationInsights.options.output : undefined;
    expect(output).toBeDefined();
    const fieldNames = objectKeysFromUnknown(output);
    expect(fieldNames).toHaveLength(6);
    expect(fieldNames).toEqual([
      'agent_type',
      'avg_cost_per_invocation',
      'avg_tokens',
      'frequency',
      'cache_hit_rate',
      'efficiency_score',
    ]);
  });

  it('has a single node with the correct name', () => {
    const nodes = optimizationInsights.options.nodes;
    expect(nodes).toHaveLength(1);
    expect(firstNode()._name).toBe('optimization_insights_node');
  });

  it('SQL references agent_activations with event stop filter', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('agent_activations');
    expect(sql).toContain("event = 'stop'");
  });

  it('SQL uses bounded cache_hit_rate formula including cache_read_tokens in denominator', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('cache_hit_rate');
    expect(sql).not.toContain('cache_ratio');
    expect(sql).toContain('input_tokens + output_tokens + cache_read_tokens');
    expect(sql).toContain('log(');
  });

  it('SQL filters by days parameter with INTERVAL', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('{{Int32(days, 7)}}');
    expect(sql).toContain('INTERVAL');
  });

  it('SQL excludes empty agent_type rows', () => {
    const sql = firstNode().sql;
    expect(sql).toContain("agent_type != ''");
  });

  it('SQL groups by agent_type and orders by efficiency_score DESC', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('GROUP BY agent_type');
    expect(sql).toContain('ORDER BY efficiency_score DESC');
  });

  it('configures telemetry_read token with READ scope', () => {
    const tokens = optimizationInsights.options.tokens;
    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);
    const tokenConfig = tokens?.[0] as { token: { _name: string }; scope: string };
    expect(tokenConfig.token._name).toBe('telemetry_read');
    expect(tokenConfig.scope).toBe('READ');
  });

  it('exports OptimizationInsightsRow type with cache_hit_rate field', () => {
    const row: OptimizationInsightsRow = {
      agent_type: 'data-engineer',
      avg_cost_per_invocation: 0.05,
      avg_tokens: 5000,
      frequency: 42,
      cache_hit_rate: 0.35,
      efficiency_score: 1.31,
    };
    expect(row.agent_type).toBe('data-engineer');
    expect(row.cache_hit_rate).toBe(0.35);
  });
});
