import { describe, expect, it } from 'vitest';

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
    agent_transcript_path: '/home/user/.claude/transcripts/transcript.jsonl',
    parent_session_id: 'parent-sess-001',
    duration_ms: 5000,
    success: true,
    error: null,
    cwd: '/home/user/project',
    timestamp: '2026-02-17T12:00:00.000Z',
    ...overrides,
  });

describe('parseAgentStop', () => {
  describe('valid event + valid transcript', () => {
    it('returns correct AgentActivationRow with token counts from transcript', () => {
      const event = makeEvent();
      const transcript = [makeTranscriptLine(), makeTranscriptLine()].join('\n');

      const result = parseAgentStop(event, transcript);

      expect(result).toEqual<AgentActivationRow>({
        timestamp: new Date('2026-02-17T12:00:00.000Z'),
        session_id: 'sess-001',
        parent_session_id: 'parent-sess-001',
        agent_type: 'tdd-reviewer',
        agent_id: 'agent-abc',
        event: 'stop',
        input_tokens: 200,
        output_tokens: 100,
        cache_read_tokens: 40,
        cache_creation_tokens: 20,
        duration_ms: 5000,
        est_cost_usd: 0.006,
        model: 'claude-sonnet-4-20250514',
        success: 1,
        error_type: null,
        tool_calls_count: 0,
      });
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

    it('throws when timestamp is missing', () => {
      const event = makeEvent();
      const parsed = JSON.parse(event) as Record<string, unknown>;
      delete parsed['timestamp'];

      expect(() => parseAgentStop(JSON.stringify(parsed), '')).toThrow();
    });

    it('throws when duration_ms is missing', () => {
      const event = makeEvent();
      const parsed = JSON.parse(event) as Record<string, unknown>;
      delete parsed['duration_ms'];

      expect(() => parseAgentStop(JSON.stringify(parsed), '')).toThrow();
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

  describe('failure events', () => {
    it('returns success=0 and error_type when success is false', () => {
      const event = makeEvent({
        success: false,
        error: 'TimeoutError',
      });

      const result = parseAgentStop(event, '');

      expect(result.success).toBe(0);
      expect(result.error_type).toBe('TimeoutError');
    });

    it('returns success=1 and error_type null on successful event', () => {
      const result = parseAgentStop(makeEvent(), '');

      expect(result.success).toBe(1);
      expect(result.error_type).toBeNull();
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
