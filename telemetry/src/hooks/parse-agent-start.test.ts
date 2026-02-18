import { describe, expect, it, vi } from 'vitest';

import type { AgentActivationRow } from '@/datasources';

import { parseAgentStart, subagentStartSchema } from './parse-agent-start';

const makeValidEvent = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    session_id: 'sess-abc-123',
    agent_id: 'agent-xyz-789',
    agent_type: 'tdd-reviewer',
    cwd: '/Users/dev/my-project',
    transcript_path: '/Users/dev/.claude/projects/transcript.jsonl',
    permission_mode: 'default',
    hook_event_name: 'SubagentStart',
    ...overrides,
  });

describe('parseAgentStart', () => {
  describe('valid SubagentStart event', () => {
    it('returns correct AgentActivationRow with event=start', () => {
      const now = new Date('2026-02-18T10:00:00.000Z');
      vi.setSystemTime(now);

      const result = parseAgentStart(makeValidEvent());

      expect(result).toEqual<AgentActivationRow>({
        timestamp: now,
        session_id: 'sess-abc-123',
        parent_session_id: null,
        agent_type: 'tdd-reviewer',
        agent_id: 'agent-xyz-789',
        event: 'start',
        model: 'unknown',
        input_tokens: 0,
        output_tokens: 0,
        cache_read_tokens: 0,
        cache_creation_tokens: 0,
        duration_ms: 0,
        est_cost_usd: 0,
        success: 1,
        error_type: null,
        tool_calls_count: 0,
      });

      vi.useRealTimers();
    });

    it('generates timestamp from current time since Claude Code does not send it', () => {
      const before = Date.now();
      const result = parseAgentStart(makeValidEvent());
      const after = Date.now();

      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(after);
    });

    it('hardcodes event to start', () => {
      const result = parseAgentStart(makeValidEvent());

      expect(result.event).toBe('start');
    });

    it('sets model to unknown since it is not available at start', () => {
      const result = parseAgentStart(makeValidEvent());

      expect(result.model).toBe('unknown');
    });

    it('sets all numeric fields to zero', () => {
      const result = parseAgentStart(makeValidEvent());

      expect(result.input_tokens).toBe(0);
      expect(result.output_tokens).toBe(0);
      expect(result.cache_read_tokens).toBe(0);
      expect(result.cache_creation_tokens).toBe(0);
      expect(result.duration_ms).toBe(0);
      expect(result.est_cost_usd).toBe(0);
      expect(result.tool_calls_count).toBe(0);
    });

    it('sets success to 1 and error_type to null', () => {
      const result = parseAgentStart(makeValidEvent());

      expect(result.success).toBe(1);
      expect(result.error_type).toBe(null);
    });

    it('sets parent_session_id to null', () => {
      const result = parseAgentStart(makeValidEvent());

      expect(result.parent_session_id).toBeNull();
    });
  });

  describe('missing required fields', () => {
    it('throws when session_id is missing', () => {
      const event = makeValidEvent();
      const parsed = JSON.parse(event) as Record<string, unknown>;
      delete parsed['session_id'];

      expect(() => parseAgentStart(JSON.stringify(parsed))).toThrow();
    });

    it('throws when agent_id is missing', () => {
      const event = makeValidEvent();
      const parsed = JSON.parse(event) as Record<string, unknown>;
      delete parsed['agent_id'];

      expect(() => parseAgentStart(JSON.stringify(parsed))).toThrow();
    });

    it('throws when agent_type is missing', () => {
      const event = makeValidEvent();
      const parsed = JSON.parse(event) as Record<string, unknown>;
      delete parsed['agent_type'];

      expect(() => parseAgentStart(JSON.stringify(parsed))).toThrow();
    });
  });

  describe('malformed JSON', () => {
    it('throws on invalid JSON string', () => {
      expect(() => parseAgentStart('not valid json {{')).toThrow();
    });

    it('throws on empty string', () => {
      expect(() => parseAgentStart('')).toThrow();
    });
  });

  describe('forward compatibility', () => {
    it('ignores extra fields in the event payload', () => {
      const result = parseAgentStart(
        makeValidEvent({
          extra_field: 'should be ignored',
          another_field: 42,
          nested: { deep: true },
        })
      );

      expect(result.session_id).toBe('sess-abc-123');
      expect(result.event).toBe('start');
    });
  });
});

describe('subagentStartSchema', () => {
  it('validates a real Claude Code SubagentStart event', () => {
    const event = {
      session_id: 'sess-abc',
      agent_id: 'agent-xyz',
      agent_type: 'tdd-reviewer',
      cwd: '/home/dev',
      transcript_path: '/home/dev/.claude/projects/transcript.jsonl',
      permission_mode: 'default',
      hook_event_name: 'SubagentStart',
    };

    const result = subagentStartSchema.safeParse(event);
    expect(result.success).toBe(true);
  });

  it('rejects event missing required fields', () => {
    const event = { session_id: 'sess-abc' };

    const result = subagentStartSchema.safeParse(event);
    expect(result.success).toBe(false);
  });
});
