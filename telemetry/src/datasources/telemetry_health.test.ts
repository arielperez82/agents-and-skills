import { describe, expect, it } from 'vitest';

import type { TelemetryHealthRow } from './telemetry_health';
import { telemetryHealth } from './telemetry_health';

describe('telemetry_health datasource', () => {
  it('has the correct datasource name', () => {
    expect(telemetryHealth._name).toBe('telemetry_health');
  });

  it('defines all 6 expected schema fields', () => {
    const fieldNames = Object.keys(telemetryHealth.options.schema);

    expect(fieldNames).toHaveLength(6);
    expect(fieldNames).toEqual([
      'timestamp',
      'hook_name',
      'exit_code',
      'duration_ms',
      'error_message',
      'tinybird_status_code',
    ]);
  });

  it('uses MergeTree engine with correct sorting key', () => {
    const engineConfig = telemetryHealth.options.engine;

    expect(engineConfig).toBeDefined();
    expect(engineConfig?.type).toBe('MergeTree');
    expect(engineConfig?.sortingKey).toEqual(['hook_name', 'toStartOfHour(timestamp)']);
  });

  it('configures telemetry_ingest token with APPEND scope', () => {
    const tokens = telemetryHealth.options.tokens;

    expect(tokens).toBeDefined();
    expect(tokens).toHaveLength(1);

    const tokenConfig = tokens?.[0];
    expect(tokenConfig).toHaveProperty('token');
    expect(tokenConfig).toHaveProperty('scope', 'APPEND');

    const tokenRef = tokenConfig as { token: { _name: string }; scope: string };
    expect(tokenRef.token._name).toBe('telemetry_ingest');
  });

  it('exports TelemetryHealthRow type that matches the schema', () => {
    const row: TelemetryHealthRow = {
      timestamp: new Date().toISOString(),
      hook_name: 'pre-push',
      exit_code: 0,
      duration_ms: 1234,
      error_message: null,
      tinybird_status_code: null,
    };

    expect(row.hook_name).toBe('pre-push');
    expect(row.exit_code).toBe(0);
    expect(row.duration_ms).toBe(1234);
    expect(row.error_message).toBeNull();
    expect(row.tinybird_status_code).toBeNull();
  });

  it('allows non-null values for nullable fields', () => {
    const row: TelemetryHealthRow = {
      timestamp: new Date().toISOString(),
      hook_name: 'pre-commit',
      exit_code: 1,
      duration_ms: 5678,
      error_message: 'lint failed',
      tinybird_status_code: 202,
    };

    expect(row.error_message).toBe('lint failed');
    expect(row.tinybird_status_code).toBe(202);
  });
});
