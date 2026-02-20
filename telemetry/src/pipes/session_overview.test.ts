import { describe, expect, it } from 'vitest';

import type { SessionOverviewRow } from './session_overview';
import { sessionOverview } from './session_overview';
import { objectKeysFromUnknown } from './test-utils';

const firstNode = () => {
  const n = sessionOverview.options.nodes[0];
  if (!n) throw new Error('Expected at least one node');
  return n;
};

const getOutput = () => {
  const output = sessionOverview.options.output;
  if (!output) throw new Error('Expected output to be defined');
  return output;
};

describe('session_overview endpoint', () => {
  it('has the correct endpoint name', () => {
    expect(sessionOverview._name).toBe('session_overview');
  });

  it('defines session_id param as optional string', () => {
    const params = sessionOverview._params;
    expect(params).toHaveProperty('session_id');
    expect(params.session_id._tinybirdType).toBe('String');
    expect(params.session_id._required).toBe(false);
  });

  it('defines days param with default of 7', () => {
    const params = sessionOverview._params;
    expect(params).toHaveProperty('days');
    expect(params.days._tinybirdType).toBe('Int32');
    expect(params.days._required).toBe(false);
    expect(params.days._default).toBe(7);
  });

  it('defines all 6 expected output fields', () => {
    const fieldNames = objectKeysFromUnknown(getOutput());
    expect(fieldNames).toHaveLength(6);
    expect(fieldNames).toEqual([
      'session_id',
      'agents_used',
      'skills_used',
      'total_tokens',
      'total_cost_usd',
      'total_duration_ms',
    ]);
  });

  it('has a single node with the correct name', () => {
    const nodes = sessionOverview.options.nodes;
    expect(nodes).toHaveLength(1);
    expect(firstNode()._name).toBe('session_overview_node');
  });

  it('SQL references session_summaries datasource', () => {
    expect(firstNode().sql).toContain('session_summaries');
  });

  it('SQL includes optional session_id filter with Tinybird template', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('defined(session_id)');
    expect(sql).toContain('{{String(session_id)}}');
  });

  it('SQL uses days param with INTERVAL filter', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('{{Int32(days, 7)}}');
    expect(sql).toContain('INTERVAL');
  });

  it('SQL groups by session_id and orders by total_cost_usd DESC', () => {
    const sql = firstNode().sql;
    expect(sql).toContain('GROUP BY session_id');
    expect(sql).toContain('ORDER BY total_cost_usd DESC');
  });

  it('configures telemetry_read token with READ scope', () => {
    const tokens = sessionOverview.options.tokens;
    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);
    const tokenConfig = (tokens as NonNullable<typeof tokens>)[0] as {
      token: { _name: string };
      scope: string;
    };
    expect(tokenConfig.token._name).toBe('telemetry_read');
    expect(tokenConfig.scope).toBe('READ');
  });

  it('exports SessionOverviewRow type matching the output', () => {
    const row: SessionOverviewRow = {
      session_id: 'sess-abc-123',
      agents_used: 3,
      skills_used: 5,
      total_tokens: 250000,
      total_cost_usd: 5.25,
      total_duration_ms: 120000,
    };
    expect(row.session_id).toBe('sess-abc-123');
    expect(row.agents_used).toBe(3);
    expect(row.skills_used).toBe(5);
    expect(row.total_tokens).toBe(250000);
    expect(row.total_cost_usd).toBe(5.25);
    expect(row.total_duration_ms).toBe(120000);
  });
});
