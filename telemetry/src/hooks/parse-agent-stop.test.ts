import { describe, expect, it, vi } from 'vitest';

import type { AgentActivationRow } from '@/datasources';

import { parseAgentStop } from './parse-agent-stop';

const makeTranscriptLine = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    type: 'assistant',
    message: {
      model: 'claude-sonnet-4-20250514',
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        cache_read_input_tokens: 20,
        cache_creation_input_tokens: 10,
      },
    },
    costUSD: 0.003,
    ...overrides,
  });

const makeEvent = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    session_id: 'sess-001',
    agent_id: 'agent-abc',
    agent_type: 'tdd-reviewer',
    agent_transcript_path: '/home/user/.claude/projects/subagents/agent-abc.jsonl',
    cwd: '/home/user/project',
    transcript_path: '/home/user/.claude/projects/transcript.jsonl',
    permission_mode: 'default',
    hook_event_name: 'SubagentStop',
    stop_hook_active: false,
    ...overrides,
  });

describe('parseAgentStop', () => {
  describe('valid event + valid transcript', () => {
    it('returns correct AgentActivationRow with token counts from transcript', () => {
      const now = new Date('2026-02-18T10:00:00.000Z');
      vi.setSystemTime(now);

      const event = makeEvent();
      const transcript = [makeTranscriptLine(), makeTranscriptLine()].join('\n');

      const result = parseAgentStop(event, transcript);

      expect(result).toEqual<AgentActivationRow>({
        timestamp: now,
        session_id: 'sess-001',
        parent_session_id: null,
        agent_type: 'tdd-reviewer',
        agent_id: 'agent-abc',
        event: 'stop',
        input_tokens: 200,
        output_tokens: 100,
        cache_read_tokens: 40,
        cache_creation_tokens: 20,
        duration_ms: 0,
        est_cost_usd: 0.006,
        model: 'claude-sonnet-4-20250514',
        success: 1,
        error_type: null,
        tool_calls_count: 0,
      });

      vi.useRealTimers();
    });
  });

  describe('valid event + empty transcript', () => {
    it('returns row with zero tokens', () => {
      const result = parseAgentStop(makeEvent(), '');

      expect(result.input_tokens).toBe(0);
      expect(result.output_tokens).toBe(0);
      expect(result.cache_read_tokens).toBe(0);
      expect(result.cache_creation_tokens).toBe(0);
      expect(result.est_cost_usd).toBe(0);
      expect(result.model).toBe('unknown');
    });
  });

  describe('valid event + malformed transcript', () => {
    it('returns row with zero tokens when transcript is garbage', () => {
      const result = parseAgentStop(makeEvent(), 'not json {{{ garbage');

      expect(result.input_tokens).toBe(0);
      expect(result.output_tokens).toBe(0);
      expect(result.cache_read_tokens).toBe(0);
      expect(result.cache_creation_tokens).toBe(0);
      expect(result.est_cost_usd).toBe(0);
    });
  });

  describe('missing required event fields', () => {
    it('throws when session_id is missing', () => {
      const event = makeEvent();
      const parsed = JSON.parse(event) as Record<string, unknown>;
      delete parsed['session_id'];

      expect(() => parseAgentStop(JSON.stringify(parsed), '')).toThrow();
    });

    it('throws when agent_id is missing', () => {
      const event = makeEvent();
      const parsed = JSON.parse(event) as Record<string, unknown>;
      delete parsed['agent_id'];

      expect(() => parseAgentStop(JSON.stringify(parsed), '')).toThrow();
    });

    it('succeeds with zero tokens when agent_transcript_path is missing', () => {
      const event = makeEvent();
      const parsed = JSON.parse(event) as Record<string, unknown>;
      delete parsed['agent_transcript_path'];

      const result = parseAgentStop(JSON.stringify(parsed), '');

      expect(result.input_tokens).toBe(0);
      expect(result.output_tokens).toBe(0);
      expect(result.session_id).toBe('sess-001');
    });
  });

  describe('empty agent_type guard', () => {
    it('throws when agent_type is empty string', () => {
      expect(() => parseAgentStop(makeEvent({ agent_type: '' }), '')).toThrow(
        'agent_type is empty'
      );
    });

    it('throws when agent_type is whitespace only', () => {
      expect(() => parseAgentStop(makeEvent({ agent_type: '   ' }), '')).toThrow(
        'agent_type is empty'
      );
    });
  });

  describe('malformed event JSON', () => {
    it('throws on unparseable JSON', () => {
      expect(() => parseAgentStop('not json {{{', '')).toThrow();
    });

    it('throws on empty string event', () => {
      expect(() => parseAgentStop('', '')).toThrow();
    });
  });

  describe('defaults for fields not provided by Claude Code', () => {
    it('sets parent_session_id to null', () => {
      const result = parseAgentStop(makeEvent(), '');

      expect(result.parent_session_id).toBeNull();
    });

    it('defaults duration_ms to 0 when not provided', () => {
      const result = parseAgentStop(makeEvent(), '');

      expect(result.duration_ms).toBe(0);
    });

    it('uses provided durationMs in the row', () => {
      const result = parseAgentStop(makeEvent(), '', 1500);

      expect(result.duration_ms).toBe(1500);
    });

    it('defaults success to 1 and error_type to null', () => {
      const result = parseAgentStop(makeEvent(), '');

      expect(result.success).toBe(1);
      expect(result.error_type).toBeNull();
    });

    it('generates timestamp from current time', () => {
      const before = Date.now();
      const result = parseAgentStop(makeEvent(), '');
      const after = Date.now();

      expect(result.timestamp).toBeInstanceOf(Date);
      expect(result.timestamp.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.timestamp.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('security: no content leakage', () => {
    it('does not include transcript text in result', () => {
      const transcript = [
        makeTranscriptLine({
          message: {
            model: 'claude-sonnet-4-20250514',
            content: [{ type: 'text', text: 'TOP SECRET RESPONSE DATA' }],
            usage: { input_tokens: 10, output_tokens: 5 },
          },
          costUSD: 0.001,
        }),
      ].join('\n');

      const result = parseAgentStop(makeEvent(), transcript);
      const serialized = JSON.stringify(result);

      expect(serialized).not.toContain('TOP SECRET');
      expect(serialized).not.toContain('RESPONSE DATA');
    });
  });
});
