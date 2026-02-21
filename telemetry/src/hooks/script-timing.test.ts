import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { consumeScriptStart, recordScriptStart } from './script-timing';

const TIMING_DIR = path.join(os.tmpdir(), 'telemetry-script-timing');

const cleanup = (filename: string): void => {
  try {
    fs.unlinkSync(path.join(TIMING_DIR, filename));
  } catch {
    /* ignore */
  }
};

describe('script-timing', () => {
  afterEach(() => {
    cleanup('test-tool-1.json');
    cleanup('test-tool-2.json');
  });

  it('records start time and returns it on consume', () => {
    const startMs = 1000;
    recordScriptStart('test-tool-1', startMs);

    const result = consumeScriptStart('test-tool-1', 2000);

    expect(result).toBe(1000);
  });

  it('deletes the file after consuming', () => {
    recordScriptStart('test-tool-1', 1000);

    const first = consumeScriptStart('test-tool-1', 2000);
    const second = consumeScriptStart('test-tool-1', 3000);

    expect(first).toBe(1000);
    expect(second).toBeNull();
  });

  it('returns null when no record exists', () => {
    const result = consumeScriptStart('nonexistent-tool', 5000);

    expect(result).toBeNull();
  });

  it('returns null and deletes file when stale (>1 hour)', () => {
    const startMs = 1000;
    const oneHourLater = startMs + 3_600_001;
    recordScriptStart('test-tool-1', startMs);

    const result = consumeScriptStart('test-tool-1', oneHourLater);

    expect(result).toBeNull();
    expect(fs.existsSync(path.join(TIMING_DIR, 'test-tool-1.json'))).toBe(false);
  });

  it('returns startMs when exactly at 1 hour threshold', () => {
    const startMs = 1000;
    const exactlyOneHour = startMs + 3_600_000;
    recordScriptStart('test-tool-1', startMs);

    const result = consumeScriptStart('test-tool-1', exactlyOneHour);

    expect(result).toBe(1000);
  });

  it('returns null for path traversal attempt', () => {
    recordScriptStart('../../etc/malicious', 9999);

    const result = consumeScriptStart('../../etc/malicious', 10000);

    expect(result).toBeNull();
  });

  it('does not write files outside timing directory for traversal id', () => {
    const traversalId = '../../etc/malicious';
    recordScriptStart(traversalId, 9999);

    const maliciousPath = path.resolve(TIMING_DIR, `${traversalId}.json`);
    expect(fs.existsSync(maliciousPath)).toBe(false);
  });

  it('returns null when file contains invalid JSON', () => {
    const filePath = path.join(TIMING_DIR, 'test-tool-1.json');
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, 'not valid json');

    const result = consumeScriptStart('test-tool-1', 5000);

    expect(result).toBeNull();
  });

  it('returns null when file has non-number startMs', () => {
    const filePath = path.join(TIMING_DIR, 'test-tool-1.json');
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ startMs: 'not-a-number' }));

    const result = consumeScriptStart('test-tool-1', 5000);

    expect(result).toBeNull();
  });

  it('returns null when file has no startMs key', () => {
    const filePath = path.join(TIMING_DIR, 'test-tool-1.json');
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ other: 123 }));

    const result = consumeScriptStart('test-tool-1', 5000);

    expect(result).toBeNull();
  });

  it('handles concurrent tool uses independently', () => {
    recordScriptStart('test-tool-1', 1000);
    recordScriptStart('test-tool-2', 2000);

    const result1 = consumeScriptStart('test-tool-1', 3000);
    const result2 = consumeScriptStart('test-tool-2', 3000);

    expect(result1).toBe(1000);
    expect(result2).toBe(2000);
  });
});
