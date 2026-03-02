import { objectKeysFromUnknown } from '@tests/helpers/object-keys';
import { describe, expect, it } from 'vitest';

import type { CraftBaselineRow } from './craft-baseline';
import { craftBaseline } from './craft-baseline';

const getNode = (index: number) => {
  // eslint-disable-next-line security/detect-object-injection -- index is test-controlled integer
  const n = craftBaseline.options.nodes[index];
  if (!n) throw new Error(`Expected node at index ${String(index)}`);
  return n;
};

const getOutput = () => {
  const output = 'output' in craftBaseline.options ? craftBaseline.options.output : undefined;
  if (!output) throw new Error('Expected output to be defined');
  return output;
};

describe('craft_baseline endpoint', () => {
  it('has the correct endpoint name', () => {
    expect(craftBaseline._name).toBe('craft_baseline');
  });

  it('defines days param with default of 30', () => {
    const params = craftBaseline._params;
    expect(params).toHaveProperty('days');
    expect(params.days._tinybirdType).toBe('Int32');
    expect(params.days._required).toBe(false);
    expect(params.days._default).toBe(30);
  });

  it('defines optional project_name param with empty string default', () => {
    const params = craftBaseline._params;
    expect(params).toHaveProperty('project_name');
    expect(params.project_name._tinybirdType).toBe('String');
    expect(params.project_name._required).toBe(false);
    expect(params.project_name._default).toBe('');
  });

  it('defines all 7 expected output fields', () => {
    const fieldNames = objectKeysFromUnknown(getOutput());
    expect(fieldNames).toHaveLength(7);
    expect(fieldNames).toEqual([
      'session_count',
      'avg_direct_tokens',
      'median_direct_tokens',
      'avg_cost_usd',
      'median_cost_usd',
      'avg_agent_count',
      'median_duration_ms',
    ]);
  });

  it('has two nodes', () => {
    const nodes = craftBaseline.options.nodes;
    expect(nodes).toHaveLength(2);
  });

  it('first node identifies craft-like sessions', () => {
    const firstNode = getNode(0);
    expect(firstNode._name).toBe('craft_sessions_node');
    const sql = firstNode.sql;
    expect(sql).toContain('FROM session_summaries');
    expect(sql).toContain('hasAny');
    expect(sql).toContain('product-director');
    expect(sql).toContain('acceptance-designer');
    expect(sql).toContain('architect');
    expect(sql).toContain('implementation-planner');
    expect(sql).toContain('engineering-lead');
  });

  it('first node filters by days parameter', () => {
    const sql = getNode(0).sql;
    expect(sql).toContain('INTERVAL {{Int32(days, 30)}} DAY');
  });

  it('first node supports optional project_name filter', () => {
    const sql = getNode(0).sql;
    expect(sql).toContain("{{String(project_name, '')}} = ''");
    expect(sql).toContain('OR project_name =');
  });

  it('second node computes avg and median aggregates', () => {
    const secondNode = getNode(1);
    expect(secondNode._name).toBe('craft_baseline_node');
    const sql = secondNode.sql;
    expect(sql).toContain('avg(');
    expect(sql).toContain('quantile(0.5)');
    expect(sql).toContain('FROM craft_sessions_node');
  });

  it('configures telemetry_read token with READ scope', () => {
    const tokens = craftBaseline.options.tokens;
    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);
    const tokenConfig = tokens?.[0] as {
      token: { _name: string };
      scope: string;
    };
    expect(tokenConfig.token._name).toBe('telemetry_read');
    expect(tokenConfig.scope).toBe('READ');
  });

  it('exports CraftBaselineRow type matching the output', () => {
    const row: CraftBaselineRow = {
      session_count: 15,
      avg_direct_tokens: 50000,
      median_direct_tokens: 45000,
      avg_cost_usd: 2.5,
      median_cost_usd: 2.1,
      avg_agent_count: 8,
      median_duration_ms: 120000,
    };
    expect(row.session_count).toBe(15);
    expect(row.median_cost_usd).toBe(2.1);
  });
});
