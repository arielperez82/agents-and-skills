import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { describe, expect, it, vi } from 'vitest';

import { createTelemetryClient } from '@/client';
import type { CacheStore, HealthLogger } from '@/hooks/entrypoints/ports';

import {
  createCacheStore,
  createClientFromEnv,
  createFileReader,
  createHealthLogger,
  extractStringField,
  isMainModule,
  logHealthEvent,
} from './shared';

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

describe('isMainModule', () => {
  it('returns true when import.meta.url matches process.argv[1]', () => {
    const entryPath = process.argv[1] ?? '';
    const result = isMainModule(`file://${entryPath}`);

    expect(result).toBe(true);
  });

  it('returns false when import.meta.url does not match', () => {
    const result = isMainModule('file:///some/other/module.ts');

    expect(result).toBe(false);
  });
});

describe('createHealthLogger', () => {
  it('returns a function matching HealthLogger type', () => {
    const client = createTelemetryClient({
      baseUrl: 'https://api.tinybird.co',
      ingestToken: 'test',
      readToken: 'test',
    });

    const logger: HealthLogger = createHealthLogger(client);

    expect(typeof logger).toBe('function');
  });
});

describe('extractStringField', () => {
  it('extracts a string field from valid JSON', () => {
    const json = JSON.stringify({ session_id: 'sess-1', agent_type: 'tdd-reviewer' });

    expect(extractStringField(json, 'session_id')).toBe('sess-1');
    expect(extractStringField(json, 'agent_type')).toBe('tdd-reviewer');
  });

  it('returns null for non-string field values', () => {
    const json = JSON.stringify({ count: 42, nested: { key: 'value' } });

    expect(extractStringField(json, 'count')).toBeNull();
    expect(extractStringField(json, 'nested')).toBeNull();
  });

  it('returns null for missing fields', () => {
    const json = JSON.stringify({ session_id: 'sess-1' });

    expect(extractStringField(json, 'nonexistent')).toBeNull();
  });

  it('returns null for invalid JSON', () => {
    expect(extractStringField('not json {{{', 'field')).toBeNull();
  });

  it('returns null for non-object JSON values', () => {
    expect(extractStringField('"just a string"', 'field')).toBeNull();
    expect(extractStringField('42', 'field')).toBeNull();
    expect(extractStringField('null', 'field')).toBeNull();
  });
});

describe('createCacheStore', () => {
  it('returns empty object when cache file does not exist', () => {
    const tmpDir = path.join(os.tmpdir(), `test-cache-${String(Date.now())}`);
    const cacheFile = path.join(tmpDir, 'cache.json');
    const cache: CacheStore = createCacheStore(tmpDir, cacheFile);

    const result = cache.read();

    expect(result).toEqual({});
  });

  it('writes and reads cache successfully', () => {
    const tmpDir = path.join(os.tmpdir(), `test-cache-${String(Date.now())}`);
    const cacheFile = path.join(tmpDir, 'cache.json');
    const cache: CacheStore = createCacheStore(tmpDir, cacheFile);

    cache.write({ additionalContext: 'test context' });
    const result = cache.read();

    expect(result).toEqual({ additionalContext: 'test context' });
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns empty object for invalid cache content', () => {
    const tmpDir = path.join(os.tmpdir(), `test-cache-${String(Date.now())}`);
    const cacheFile = path.join(tmpDir, 'cache.json');
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(cacheFile, 'not json');
    const cache: CacheStore = createCacheStore(tmpDir, cacheFile);

    const result = cache.read();

    expect(result).toEqual({});
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('returns empty object when additionalContext is not a string', () => {
    const tmpDir = path.join(os.tmpdir(), `test-cache-${String(Date.now())}`);
    const cacheFile = path.join(tmpDir, 'cache.json');
    fs.mkdirSync(tmpDir, { recursive: true });
    fs.writeFileSync(cacheFile, JSON.stringify({ additionalContext: 42 }));
    const cache: CacheStore = createCacheStore(tmpDir, cacheFile);

    const result = cache.read();

    expect(result).toEqual({});
    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('createFileReader', () => {
  it('reads file content successfully', () => {
    const readFile = createFileReader();
    const tmpPath = path.join(os.tmpdir(), `test-reader-${String(Date.now())}.txt`);
    fs.writeFileSync(tmpPath, 'hello world');

    const content = readFile(tmpPath);

    expect(content).toBe('hello world');
    fs.unlinkSync(tmpPath);
  });

  it('returns empty string for non-existent file', () => {
    const readFile = createFileReader();

    const content = readFile('/nonexistent/path/file.txt');

    expect(content).toBe('');
  });

  it('returns empty string for null path', () => {
    const readFile = createFileReader();

    const content = readFile(null);

    expect(content).toBe('');
  });
});

describe('logHealthEvent', () => {
  const BASE_URL = 'https://api.tinybird.co';

  it('ingests a health event successfully', async () => {
    let capturedBody: unknown = null;

    server.use(
      http.post(`${BASE_URL}/v0/events`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
      })
    );

    const client = createTelemetryClient({
      baseUrl: BASE_URL,
      ingestToken: 'test-ingest',
      readToken: 'test-read',
    });

    await logHealthEvent(client, 'test-hook', 0, 100, null, null);

    expect(capturedBody).not.toBeNull();
  });

  it('does not throw when ingest fails', async () => {
    server.use(
      http.post(`${BASE_URL}/v0/events`, () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 })
      )
    );

    const client = createTelemetryClient({
      baseUrl: BASE_URL,
      ingestToken: 'test-ingest',
      readToken: 'test-read',
    });

    await expect(
      logHealthEvent(client, 'test-hook', 1, 50, 'some error', 500)
    ).resolves.not.toThrow();
  });
});
