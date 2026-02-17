import { describe, expect, it } from 'vitest';

import { buildSessionSummary } from './build-session-summary';

const makeEvent = (overrides: Record<string, unknown> = {}): string =>
  JSON.stringify({
    session_id: 'sess-abc-123',
    transcript_path: '/home/user/.claude/sessions/transcript.jsonl',
    duration_ms: 45000,
    cwd: '/home/user/project',
    timestamp: '2026-02-17T10:30:00.000Z',
    ...overrides,
  });

const makeTranscriptLine = (
  overrides: {
    model?: string;
    input_tokens?: number;
    output_tokens?: number;
    cache_read_input_tokens?: number;
    cache_creation_input_tokens?: number;
    costUSD?: number;
  } = {}
): string =>
  JSON.stringify({
    type: 'assistant',
    message: {
      model: overrides.model ?? 'claude-opus-4-6',
      usage: {
        input_tokens: overrides.input_tokens ?? 100,
        output_tokens: overrides.output_tokens ?? 50,
        cache_read_input_tokens: overrides.cache_read_input_tokens ?? 20,
        cache_creation_input_tokens: overrides.cache_creation_input_tokens ?? 10,
      },
    },
    costUSD: overrides.costUSD ?? 0.005,
  });

describe('buildSessionSummary', () => {
  it('aggregates tokens and cost from multiple API calls in transcript', () => {
    const transcript = [
      makeTranscriptLine({
        input_tokens: 100,
        output_tokens: 50,
        cache_read_input_tokens: 20,
        costUSD: 0.005,
        model: 'claude-opus-4-6',
      }),
      makeTranscriptLine({
        input_tokens: 200,
        output_tokens: 80,
        cache_read_input_tokens: 30,
        costUSD: 0.01,
        model: 'claude-opus-4-6',
      }),
      makeTranscriptLine({
        input_tokens: 150,
        output_tokens: 60,
        cache_read_input_tokens: 10,
        costUSD: 0.008,
        model: 'claude-opus-4-6',
      }),
    ].join('\n');

    const result = buildSessionSummary(makeEvent(), transcript);

    expect(result).toStrictEqual({
      timestamp: new Date('2026-02-17T10:30:00.000Z'),
      session_id: 'sess-abc-123',
      total_duration_ms: 45000,
      agent_count: 0,
      skill_count: 0,
      api_request_count: 3,
      total_input_tokens: 450,
      total_output_tokens: 190,
      total_cache_read_tokens: 60,
      total_cost_usd: 0.023,
      agents_used: [],
      skills_used: [],
      model_primary: 'claude-opus-4-6',
    });
  });

  it('returns zero tokens and model unknown for empty transcript', () => {
    const result = buildSessionSummary(makeEvent(), '');

    expect(result).toStrictEqual({
      timestamp: new Date('2026-02-17T10:30:00.000Z'),
      session_id: 'sess-abc-123',
      total_duration_ms: 45000,
      agent_count: 0,
      skill_count: 0,
      api_request_count: 0,
      total_input_tokens: 0,
      total_output_tokens: 0,
      total_cache_read_tokens: 0,
      total_cost_usd: 0,
      agents_used: [],
      skills_used: [],
      model_primary: 'unknown',
    });
  });

  it('throws on malformed event JSON', () => {
    expect(() => buildSessionSummary('not-valid-json{', '')).toThrow();
  });

  it('throws when required fields are missing from event', () => {
    const missingSessionId = JSON.stringify({
      transcript_path: '/home/user/.claude/sessions/t.jsonl',
      duration_ms: 1000,
      cwd: '/home',
      timestamp: '2026-02-17T10:30:00.000Z',
    });

    expect(() => buildSessionSummary(missingSessionId, '')).toThrow();
  });

  it('throws when duration_ms is not a number', () => {
    const badDuration = makeEvent({ duration_ms: 'not-a-number' });

    expect(() => buildSessionSummary(badDuration, '')).toThrow();
  });

  it('throws when timestamp is not a valid ISO string', () => {
    const badTimestamp = makeEvent({ timestamp: 'not-a-date' });

    expect(() => buildSessionSummary(badTimestamp, '')).toThrow();
  });
});
