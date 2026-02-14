import { describe, expect, it } from 'vitest';

import { REQUIRED_ENV_VARS, validateOtelConfig, validateOtelEndpoint } from './validate-endpoint';

describe('validateOtelEndpoint', () => {
  it('accepts valid HTTPS endpoint', () => {
    const result = validateOtelEndpoint('https://api.tinybird.co/v0/events');
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('rejects HTTP endpoint', () => {
    // eslint-disable-next-line sonarjs/no-clear-text-protocols
    const result = validateOtelEndpoint('http://api.tinybird.co/v0/events');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('https://');
  });

  it('rejects empty endpoint', () => {
    const result = validateOtelEndpoint('');
    expect(result.valid).toBe(false);
  });

  it('rejects endpoint without protocol', () => {
    const result = validateOtelEndpoint('api.tinybird.co/v0/events');
    expect(result.valid).toBe(false);
  });
});

describe('REQUIRED_ENV_VARS', () => {
  it('includes all three required variables', () => {
    expect(REQUIRED_ENV_VARS).toContain('CLAUDE_CODE_ENABLE_TELEMETRY');
    expect(REQUIRED_ENV_VARS).toContain('OTEL_EXPORTER_OTLP_ENDPOINT');
    expect(REQUIRED_ENV_VARS).toContain('OTEL_LOG_TOOL_DETAILS');
    expect(REQUIRED_ENV_VARS).toHaveLength(3);
  });
});

describe('validateOtelConfig', () => {
  it('passes when all env vars are set and endpoint is HTTPS', () => {
    const env = {
      CLAUDE_CODE_ENABLE_TELEMETRY: '1',
      OTEL_EXPORTER_OTLP_ENDPOINT: 'https://api.tinybird.co/v0/events',
      OTEL_LOG_TOOL_DETAILS: 'true',
    };
    const result = validateOtelConfig(env);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('fails when env vars are missing', () => {
    const result = validateOtelConfig({});
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('fails when endpoint is HTTP', () => {
    const env = {
      CLAUDE_CODE_ENABLE_TELEMETRY: '1',
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      OTEL_EXPORTER_OTLP_ENDPOINT: 'http://api.tinybird.co/v0/events',
      OTEL_LOG_TOOL_DETAILS: 'true',
    };
    const result = validateOtelConfig(env);
    expect(result.valid).toBe(false);
    expect(result.errors).toContainEqual(expect.stringContaining('https://'));
  });

  it('collects multiple errors', () => {
    const env = {
      // eslint-disable-next-line sonarjs/no-clear-text-protocols
      OTEL_EXPORTER_OTLP_ENDPOINT: 'http://bad',
    };
    const result = validateOtelConfig(env);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
