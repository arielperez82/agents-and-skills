import { objectKeysFromUnknown } from '@tests/helpers/object-keys';
import { describe, expect, it } from 'vitest';

import type { CostByAgentRow } from './cost-by-agent';
import { costByAgent } from './cost-by-agent';

const firstNode = () => {
  const n = costByAgent.options.nodes[0];
  if (!n) throw new Error('Expected at least one node');
  return n;
};

const getOutput = () => {
  const output = 'output' in costByAgent.options ? costByAgent.options.output : undefined;
  if (!output) throw new Error('Expected output to be defined');
  return output;
};

describe('cost_by_agent endpoint', () => {
  it('has the correct endpoint name', () => {
    expect(costByAgent._name).toBe('cost_by_agent');
  });

  it('defines days param with default of 7', () => {
    const params = costByAgent._params;
    expect(params).toHaveProperty('days');
    expect(params.days._tinybirdType).toBe('Int32');
    expect(params.days._required).toBe(false);
    expect(params.days._default).toBe(7);
  });

  it('defines optional agent_type filter param with empty string default', () => {
    const params = costByAgent._params;
    expect(params).toHaveProperty('agent_type');
    expect(params.agent_type._tinybirdType).toBe('String');
    expect(params.agent_type._required).toBe(false);
    expect(params.agent_type._default).toBe('');
  });

  it('defines all 9 expected output fields', () => {
    const fieldNames = objectKeysFromUnknown(getOutput());
    expect(fieldNames).toHaveLength(9);
    expect(fieldNames).toEqual([
      'agent_type',
      'model',
      'total_input',
      'total_output',
      'total_cache_read',
      'total_cost_usd',
      'invocations',
      'avg_cost_per_invocation',
      'avg_tokens_per_invocation',
    ]);
  });

  it('has a single node with the correct name', () => {
    const nodes = costByAgent.options.nodes;
    expect(nodes).toHaveLength(1);
    expect(firstNode()._name).toBe('cost_by_agent_node');
  });

  it('SQL queries agent_activations with event=stop filter', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('FROM agent_activations');
    expect(sql).toContain("event = 'stop'");
  });

  it('SQL groups by agent_type and model', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('GROUP BY agent_type, model');
  });

  it('SQL orders by total_cost_usd DESC', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('ORDER BY total_cost_usd DESC');
  });

  it('SQL filters by days parameter with INTERVAL', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('INTERVAL {{Int32(days, 7)}} DAY');
  });

  it('SQL excludes empty agent_type', () => {
    const sql = firstNode().sql;
    expect(sql).toContain("agent_type != ''");
  });

  it('SQL supports optional agent_type filter with pass-all-when-empty pattern', () => {
    const sql = firstNode().sql;
    expect(sql).toContain("{{String(agent_type, '')}} = ''");
    expect(sql).toContain('OR agent_type =');
  });

  it('configures telemetry_read token with READ scope', () => {
    const tokens = costByAgent.options.tokens;
    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);
    const tokenConfig = tokens?.[0] as {
      token: { _name: string };
      scope: string;
    };
    expect(tokenConfig.token._name).toBe('telemetry_read');
    expect(tokenConfig.scope).toBe('READ');
  });

  it('exports CostByAgentRow type matching the output', () => {
    const row: CostByAgentRow = {
      agent_type: 'tdd-reviewer',
      model: 'claude-sonnet-4-6',
      total_input: 50000,
      total_output: 5000,
      total_cache_read: 200000,
      total_cost_usd: 3.5,
      invocations: 10,
      avg_cost_per_invocation: 0.35,
      avg_tokens_per_invocation: 5500,
    };
    expect(row.agent_type).toBe('tdd-reviewer');
    expect(row.model).toBe('claude-sonnet-4-6');
    expect(row.total_cost_usd).toBe(3.5);
    expect(row.invocations).toBe(10);
    expect(row.avg_cost_per_invocation).toBe(0.35);
    expect(row.avg_tokens_per_invocation).toBe(5500);
  });
});
