import { objectKeysFromUnknown } from '@tests/helpers/object-keys';
import { describe, expect, it } from 'vitest';

import type { AgentUsageDailyRow } from './agent-usage-daily';
import { agentUsageDaily } from './agent-usage-daily';

const firstNode = () => {
  const n = agentUsageDaily.options.nodes[0];
  if (!n) throw new Error('Expected at least one node');
  return n;
};

describe('agent_usage_daily endpoint', () => {
  it('has the correct endpoint name', () => {
    expect(agentUsageDaily._name).toBe('agent_usage_daily');
  });

  it('defines days param with default of 30', () => {
    const params = agentUsageDaily._params;
    expect(params).toHaveProperty('days');
    expect(params.days._tinybirdType).toBe('Int32');
    expect(params.days._required).toBe(false);
    expect(params.days._default).toBe(30);
  });

  it('defines optional agent_type param with empty string default', () => {
    const params = agentUsageDaily._params;
    expect(params).toHaveProperty('agent_type');
    expect(params.agent_type._tinybirdType).toBe('String');
    expect(params.agent_type._required).toBe(false);
    expect(params.agent_type._default).toBe('');
  });

  it('defines all 6 expected output fields', () => {
    const output = 'output' in agentUsageDaily.options ? agentUsageDaily.options.output : undefined;
    expect(output).toBeDefined();
    const fieldNames = objectKeysFromUnknown(output);
    expect(fieldNames).toHaveLength(6);
    expect(fieldNames).toEqual([
      'day',
      'agent_type',
      'invocations',
      'total_direct_tokens',
      'total_cache_read',
      'total_cost_usd',
    ]);
  });

  it('has a single node with the correct name', () => {
    const nodes = agentUsageDaily.options.nodes;
    expect(nodes).toHaveLength(1);
    expect(firstNode()._name).toBe('agent_usage_daily_node');
  });

  it('SQL references agent_activations with event stop filter', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('agent_activations');
    expect(sql).toContain("event = 'stop'");
  });

  it('SQL groups by day and agent_type', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('toStartOfDay(timestamp)');
    expect(sql).toContain('GROUP BY day, agent_type');
  });

  it('SQL excludes empty agent_type rows', () => {
    const sql = firstNode().sql;
    expect(sql).toContain("agent_type != ''");
  });

  it('SQL supports optional agent_type filter that passes all rows when empty', () => {
    const sql = firstNode().sql;
    expect(sql).toContain("String(agent_type, '')}} = ''");
    expect(sql).toContain('OR agent_type =');
  });

  it('SQL orders by day DESC then invocations DESC', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('ORDER BY day DESC, invocations DESC');
  });

  it('configures telemetry_read token with READ scope', () => {
    const tokens = agentUsageDaily.options.tokens;
    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);
    const tokenConfig = tokens?.[0] as { token: { _name: string }; scope: string };
    expect(tokenConfig.token._name).toBe('telemetry_read');
    expect(tokenConfig.scope).toBe('READ');
  });

  it('exports AgentUsageDailyRow type matching the output', () => {
    const row: AgentUsageDailyRow = {
      day: '2026-02-19',
      agent_type: 'tdd-reviewer',
      invocations: 15,
      total_direct_tokens: 50000,
      total_cache_read: 120000,
      total_cost_usd: 0.45,
    };
    expect(row.agent_type).toBe('tdd-reviewer');
    expect(row.invocations).toBe(15);
  });
});
