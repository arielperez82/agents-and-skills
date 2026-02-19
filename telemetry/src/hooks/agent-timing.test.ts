import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { consumeAgentStart, recordAgentStart } from './agent-timing';

const TIMING_DIR = path.join(os.tmpdir(), 'telemetry-agent-timing');

const cleanup = (agentId: string): void => {
  try {
    fs.unlinkSync(path.join(TIMING_DIR, `${agentId}.json`));
  } catch {
    /* ignore */
  }
};

describe('agent-timing', () => {
  afterEach(() => {
    cleanup('test-agent-1');
    cleanup('test-agent-2');
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
