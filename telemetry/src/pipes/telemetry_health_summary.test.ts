import { describe, expect, it } from 'vitest';

import type { TelemetryHealthSummaryRow } from './telemetry_health_summary';
import { telemetryHealthSummary } from './telemetry_health_summary';
import { objectKeysFromUnknown } from './test-utils';

describe('telemetry_health_summary endpoint', () => {
  it('has the correct endpoint name', () => {
    expect(telemetryHealthSummary._name).toBe('telemetry_health_summary');
  });

  it('defines hours param with default of 24', () => {
    const params = telemetryHealthSummary._params;
    expect(params).toHaveProperty('hours');
    expect(params.hours._tinybirdType).toBe('Int32');
    expect(params.hours._required).toBe(false);
    expect(params.hours._default).toBe(24);
  });

  it('defines all 6 expected output fields', () => {
    const output = telemetryHealthSummary.options.output;
    expect(output).toBeDefined();

    const fieldNames = objectKeysFromUnknown(output);
    expect(fieldNames).toHaveLength(6);
    expect(fieldNames).toEqual([
      'hook_name',
      'total_invocations',
      'failures',
      'failure_rate',
      'avg_duration_ms',
      'last_error',
    ]);
  });

  it('has a single node with the correct name', () => {
    const nodes = telemetryHealthSummary.options.nodes;
    expect(nodes).toHaveLength(1);

    const firstNode = nodes[0];
    expect(firstNode).toBeDefined();
    if (firstNode === undefined) return;
    expect(firstNode._name).toBe('telemetry_health_summary_node');
  });

  it('SQL references telemetry_health with hour-based window', () => {
    const firstNode = telemetryHealthSummary.options.nodes[0];
    expect(firstNode).toBeDefined();
    if (firstNode === undefined) return;

    const sql = firstNode.sql;
    expect(sql).toContain('telemetry_health');
    expect(sql).toContain('HOUR');
  });

  it('configures telemetry_read token with READ scope', () => {
    const tokens = telemetryHealthSummary.options.tokens;
    expect(tokens).toHaveLength(1);
    const tokenConfig = tokens?.[0] as {
      token: { _name: string };
      scope: string;
    };
    expect(tokenConfig.token._name).toBe('telemetry_read');
    expect(tokenConfig.scope).toBe('READ');
  });

  it('exports TelemetryHealthSummaryRow type with nullable last_error', () => {
    const row: TelemetryHealthSummaryRow = {
      hook_name: 'log-agent-stop',
      total_invocations: 100,
      failures: 3,
      failure_rate: 0.03,
      avg_duration_ms: 45.2,
      last_error: null,
    };
    expect(row.last_error).toBeNull();

    const rowWithError: TelemetryHealthSummaryRow = {
      hook_name: 'log-session-summary',
      total_invocations: 50,
      failures: 1,
      failure_rate: 0.02,
      avg_duration_ms: 30.0,
      last_error: 'Connection timeout',
    };
    expect(rowWithError.last_error).toBe('Connection timeout');
  });
});
