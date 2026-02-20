import { describe, expect, it } from 'vitest';

import type { CostByModelRow } from './cost_by_model';
import { costByModel } from './cost_by_model';
import { objectKeysFromUnknown } from './test-utils';

const firstNode = () => {
  const n = costByModel.options.nodes[0];
  if (!n) throw new Error('Expected at least one node');
  return n;
};

const getOutput = () => {
  const output = 'output' in costByModel.options ? costByModel.options.output : undefined;
  if (!output) throw new Error('Expected output to be defined');
  return output;
};

describe('cost_by_model endpoint', () => {
  it('has the correct endpoint name', () => {
    expect(costByModel._name).toBe('cost_by_model');
  });

  it('defines days param with default of 7', () => {
    const params = costByModel._params;
    expect(params).toHaveProperty('days');
    expect(params.days._tinybirdType).toBe('Int32');
    expect(params.days._required).toBe(false);
    expect(params.days._default).toBe(7);
  });

  it('defines all 8 expected output fields', () => {
    const fieldNames = objectKeysFromUnknown(getOutput());
    expect(fieldNames).toHaveLength(8);
    expect(fieldNames).toEqual([
      'model',
      'total_input',
      'total_output',
      'total_cache_read',
      'total_cost_usd',
      'request_count',
      'error_count',
      'error_rate',
    ]);
  });

  it('has a single node with the correct name', () => {
    const nodes = costByModel.options.nodes;
    expect(nodes).toHaveLength(1);
    expect(firstNode()._name).toBe('cost_by_model_node');
  });

  it('SQL queries api_requests table', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('FROM api_requests');
  });

  it('SQL groups by model and orders by total_cost_usd DESC', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('GROUP BY model');
    expect(sql).toContain('ORDER BY total_cost_usd DESC');
  });

  it('SQL filters by days parameter with INTERVAL', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('INTERVAL {{Int32(days, 7)}} DAY');
  });

  it('configures telemetry_read token with READ scope', () => {
    const tokens = costByModel.options.tokens;
    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);
    const tokenConfig = tokens?.[0] as {
      token: { _name: string };
      scope: string;
    };
    expect(tokenConfig.token._name).toBe('telemetry_read');
    expect(tokenConfig.scope).toBe('READ');
  });

  it('exports CostByModelRow type matching the output', () => {
    const row: CostByModelRow = {
      model: 'claude-opus-4-6',
      total_input: 500000,
      total_output: 250000,
      total_cache_read: 100000,
      total_cost_usd: 15.75,
      request_count: 100,
      error_count: 2,
      error_rate: 0.02,
    };
    expect(row.model).toBe('claude-opus-4-6');
    expect(row.total_cache_read).toBe(100000);
    expect(row.total_cost_usd).toBe(15.75);
    expect(row.request_count).toBe(100);
    expect(row.error_count).toBe(2);
    expect(row.error_rate).toBe(0.02);
  });
});
