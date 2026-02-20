import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  consumeAgentStart,
  lookupSessionAgent,
  recordAgentStart,
  recordSessionAgent,
  removeSessionAgent,
} from './agent-timing';

const TIMING_DIR = path.join(os.tmpdir(), 'telemetry-agent-timing');

const cleanup = (filename: string): void => {
  try {
    fs.unlinkSync(path.join(TIMING_DIR, filename));
  } catch {
    /* ignore */
  }
};

describe('agent-timing', () => {
  afterEach(() => {
    cleanup('test-agent-1.json');
    cleanup('test-agent-2.json');
  });

  it('records start time and returns it on consume', () => {
    recordAgentStart('test-agent-1', 1000);

    const result = consumeAgentStart('test-agent-1');

    expect(result).toBe(1000);
  });

  it('returns null on consume when no record exists for agentId', () => {
    const result = consumeAgentStart('nonexistent-agent');

    expect(result).toBeNull();
  });

  it('deletes the record after consuming it', () => {
    recordAgentStart('test-agent-1', 2000);

    const first = consumeAgentStart('test-agent-1');
    const second = consumeAgentStart('test-agent-1');

    expect(first).toBe(2000);
    expect(second).toBeNull();
  });

  it('handles concurrent agents with different agentIds independently', () => {
    recordAgentStart('test-agent-1', 1000);
    recordAgentStart('test-agent-2', 2000);

    const result1 = consumeAgentStart('test-agent-1');
    const result2 = consumeAgentStart('test-agent-2');

    expect(result1).toBe(1000);
    expect(result2).toBe(2000);
  });

  it('overwrites previous record for the same agentId', () => {
    recordAgentStart('test-agent-1', 1000);
    recordAgentStart('test-agent-1', 3000);

    const result = consumeAgentStart('test-agent-1');

    expect(result).toBe(3000);
  });

  it('returns null when timing file contains invalid JSON', () => {
    const filePath = path.join(TIMING_DIR, 'test-agent-1.json');
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, 'not valid json');

    const result = consumeAgentStart('test-agent-1');

    expect(result).toBeNull();
  });

  it('returns null when timing file has non-number startMs', () => {
    const filePath = path.join(TIMING_DIR, 'test-agent-1.json');
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ startMs: 'not-a-number' }));

    const result = consumeAgentStart('test-agent-1');

    expect(result).toBeNull();
  });

  it('returns null when timing file has no startMs key', () => {
    const filePath = path.join(TIMING_DIR, 'test-agent-1.json');
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ other: 123 }));

    const result = consumeAgentStart('test-agent-1');

    expect(result).toBeNull();
  });

  describe('path traversal protection', () => {
    it('does not write files outside timing directory for traversal agentId', () => {
      const traversalId = '../../etc/malicious';
      recordAgentStart(traversalId, 9999);

      const maliciousPath = path.resolve(TIMING_DIR, `${traversalId}.json`);
      expect(fs.existsSync(maliciousPath)).toBe(false);
    });

    it('returns null on consume for traversal agentId', () => {
      const result = consumeAgentStart('../../etc/passwd');

      expect(result).toBeNull();
    });
  });
});

describe('session-context', () => {
  afterEach(() => {
    cleanup('session-test-sess-1.json');
    cleanup('session-test-sess-2.json');
  });

  it('records and retrieves session agent type', () => {
    recordSessionAgent('test-sess-1', 'tdd-reviewer');

    const result = lookupSessionAgent('test-sess-1');

    expect(result).toBe('tdd-reviewer');
  });

  it('returns null for unknown session', () => {
    const result = lookupSessionAgent('nonexistent-session');

    expect(result).toBeNull();
  });

  it('does not delete record on lookup', () => {
    recordSessionAgent('test-sess-1', 'ts-enforcer');

    const first = lookupSessionAgent('test-sess-1');
    const second = lookupSessionAgent('test-sess-1');

    expect(first).toBe('ts-enforcer');
    expect(second).toBe('ts-enforcer');
  });

  it('cleans up on explicit removeSessionAgent call', () => {
    recordSessionAgent('test-sess-1', 'architect');

    removeSessionAgent('test-sess-1');
    const result = lookupSessionAgent('test-sess-1');

    expect(result).toBeNull();
  });

  it('handles concurrent sessions independently', () => {
    recordSessionAgent('test-sess-1', 'tdd-reviewer');
    recordSessionAgent('test-sess-2', 'code-reviewer');

    expect(lookupSessionAgent('test-sess-1')).toBe('tdd-reviewer');
    expect(lookupSessionAgent('test-sess-2')).toBe('code-reviewer');
  });

  it('returns null when session file contains invalid JSON', () => {
    const filePath = path.join(TIMING_DIR, 'session-test-sess-1.json');
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, 'corrupt data');

    const result = lookupSessionAgent('test-sess-1');

    expect(result).toBeNull();
  });

  it('returns null when session file has non-string agentType', () => {
    const filePath = path.join(TIMING_DIR, 'session-test-sess-1.json');
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ agentType: 42 }));

    const result = lookupSessionAgent('test-sess-1');

    expect(result).toBeNull();
  });

  it('returns null when session file has no agentType key', () => {
    const filePath = path.join(TIMING_DIR, 'session-test-sess-1.json');
    fs.mkdirSync(TIMING_DIR, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify({ other: 'data' }));

    const result = lookupSessionAgent('test-sess-1');

    expect(result).toBeNull();
  });

  it('rejects path traversal in sessionId', () => {
    recordSessionAgent('../../etc/malicious', 'evil-agent');

    const result = lookupSessionAgent('../../etc/malicious');

    expect(result).toBeNull();
  });
});
