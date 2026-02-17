import { describe, expect, it, vi } from 'vitest';

import { createClientFromEnv, readStdin } from './shared';

describe('createClientFromEnv', () => {
  it('returns null when TB_INGEST_TOKEN is missing', () => {
    vi.stubEnv('TB_INGEST_TOKEN', '');
    vi.stubEnv('TB_READ_TOKEN', 'read-token');
    vi.stubEnv('TB_HOST', 'https://api.tinybird.co');

    const result = createClientFromEnv();

    expect(result).toBeNull();
    vi.unstubAllEnvs();
  });

  it('returns null when TB_READ_TOKEN is missing', () => {
    vi.stubEnv('TB_INGEST_TOKEN', 'ingest-token');
    vi.stubEnv('TB_READ_TOKEN', '');
    vi.stubEnv('TB_HOST', 'https://api.tinybird.co');

    const result = createClientFromEnv();

    expect(result).toBeNull();
    vi.unstubAllEnvs();
  });

  it('returns null when TB_HOST is missing', () => {
    vi.stubEnv('TB_INGEST_TOKEN', 'ingest-token');
    vi.stubEnv('TB_READ_TOKEN', 'read-token');
    vi.stubEnv('TB_HOST', '');

    const result = createClientFromEnv();

    expect(result).toBeNull();
    vi.unstubAllEnvs();
  });

  it('returns a TelemetryClient when all env vars are set', () => {
    vi.stubEnv('TB_INGEST_TOKEN', 'ingest-token');
    vi.stubEnv('TB_READ_TOKEN', 'read-token');
    vi.stubEnv('TB_HOST', 'https://api.tinybird.co');

    const result = createClientFromEnv();

    expect(result).not.toBeNull();
    expect(result?.ingest).toBeDefined();
    expect(result?.query).toBeDefined();
    vi.unstubAllEnvs();
  });
});

describe('readStdin', () => {
  it('is exported as a function', () => {
    expect(typeof readStdin).toBe('function');
  });
});
