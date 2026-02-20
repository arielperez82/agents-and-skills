import { describe, expect, it } from 'vitest';

import { buildSessionSummary } from './build-session-summary';

const makeEvent = (overrides: Record<string, unknown> = {}): string =>
  JSON.stringify({
    session_id: 'sess-abc-123',
    transcript_path: '/home/user/.claude/sessions/transcript.jsonl',
    cwd: '/home/user/project',
    permission_mode: 'default',
    hook_event_name: 'SessionEnd',
    reason: 'other',
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

    const before = Date.now();
    const result = buildSessionSummary(makeEvent(), transcript);
    const after = Date.now();

    expect(typeof result.timestamp).toBe('string');
    const ts = new Date(result.timestamp).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
    expect(result.session_id).toBe('sess-abc-123');
    expect(result.total_duration_ms).toBe(0);
    expect(result.agent_count).toBe(0);
    expect(result.skill_count).toBe(0);
    expect(result.api_request_count).toBe(3);
    expect(result.total_input_tokens).toBe(450);
    expect(result.total_output_tokens).toBe(190);
    expect(result.total_cache_read_tokens).toBe(60);
    expect(result.total_cost_usd).toBe(0.023);
    expect(result.agents_used).toEqual([]);
    expect(result.skills_used).toEqual([]);
    expect(result.model_primary).toBe('claude-opus-4-6');
  });

  it('returns zero tokens and model unknown for empty transcript', () => {
    const result = buildSessionSummary(makeEvent(), '');

    expect(result.session_id).toBe('sess-abc-123');
    expect(result.total_duration_ms).toBe(0);
    expect(result.api_request_count).toBe(0);
    expect(result.total_input_tokens).toBe(0);
    expect(result.total_output_tokens).toBe(0);
    expect(result.total_cache_read_tokens).toBe(0);
    expect(result.total_cost_usd).toBe(0);
    expect(result.model_primary).toBe('unknown');
  });

  it('throws on malformed event JSON', () => {
    expect(() => buildSessionSummary('not-valid-json{', '')).toThrow();
  });

  it('throws when required fields are missing from event', () => {
    const missingSessionId = JSON.stringify({
      transcript_path: '/home/user/.claude/sessions/t.jsonl',
      cwd: '/home',
      permission_mode: 'default',
      hook_event_name: 'SessionEnd',
      reason: 'other',
    });

    expect(() => buildSessionSummary(missingSessionId, '')).toThrow();
  });

  it('generates timestamp from current time since Claude Code does not send it', () => {
    const before = Date.now();
    const result = buildSessionSummary(makeEvent(), '');
    const after = Date.now();

    expect(typeof result.timestamp).toBe('string');
    const ts = new Date(result.timestamp).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });

  it('sets total_duration_ms to 0 since Claude Code does not send duration', () => {
    const result = buildSessionSummary(makeEvent(), '');

    expect(result.total_duration_ms).toBe(0);
  });

  it('extracts agents_used and skills_used from transcript tool_use blocks', () => {
    const transcriptWithToolUse = [
      JSON.stringify({
        type: 'assistant',
        message: {
          model: 'claude-opus-4-6',
          content: [
            {
              type: 'tool_use',
              id: 'toolu_1',
              name: 'Task',
              input: { subagent_type: 'researcher', prompt: 'research' },
            },
            {
              type: 'tool_use',
              id: 'toolu_2',
              name: 'Read',
              input: { file_path: '/skills/engineering-team/tdd/SKILL.md' },
            },
          ],
          usage: { input_tokens: 100, output_tokens: 50 },
        },
        costUSD: 0.005,
      }),
      makeTranscriptLine({ input_tokens: 200, output_tokens: 80, costUSD: 0.01 }),
    ].join('\n');

    const result = buildSessionSummary(makeEvent(), transcriptWithToolUse);

    expect(result.agents_used).toEqual(['researcher']);
    expect(result.agent_count).toBe(1);
    expect(result.skills_used).toEqual(['tdd']);
    expect(result.skill_count).toBe(1);
    expect(result.api_request_count).toBe(2);
  });

  it('succeeds with zero tokens when transcript_path is absent from event', () => {
    const eventWithoutTranscriptPath = JSON.stringify({
      session_id: 'sess-no-transcript',
      cwd: '/home/user/project',
      permission_mode: 'default',
      hook_event_name: 'SessionEnd',
      reason: 'other',
      // transcript_path intentionally omitted
    });

    const result = buildSessionSummary(eventWithoutTranscriptPath, '');

    expect(result.session_id).toBe('sess-no-transcript');
    expect(result.total_input_tokens).toBe(0);
    expect(result.total_output_tokens).toBe(0);
    expect(result.total_cost_usd).toBe(0);
    expect(result.model_primary).toBe('unknown');
  });
});
