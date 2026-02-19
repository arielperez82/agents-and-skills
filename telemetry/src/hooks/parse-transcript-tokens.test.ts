import { describe, expect, it } from 'vitest';

import {
  parseTranscriptTokens,
  transcriptApiResponseSchema,
  type TranscriptTokenSummary,
} from './parse-transcript-tokens';

const makeApiResponseLine = (overrides: Record<string, unknown> = {}) =>
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
    durationMs: 500,
    ...overrides,
  });

const makeNonApiLine = () =>
  JSON.stringify({
    type: 'user',
    message: { role: 'user', content: [{ type: 'text', text: 'secret user content' }] },
    timestamp: '2026-02-17T10:00:00Z',
  });

describe('parseTranscriptTokens', () => {
  describe('valid transcripts', () => {
    it('extracts token counts from a single api_response row', () => {
      const content = makeApiResponseLine();
      const result = parseTranscriptTokens(content);

      expect(result).toEqual<TranscriptTokenSummary>({
        input_tokens: 100,
        output_tokens: 50,
        cache_read_tokens: 20,
        cache_creation_tokens: 10,
        est_cost_usd: 0.003,
        model: 'claude-sonnet-4-20250514',
        api_request_count: 1,
      });
    });

    it('aggregates token counts across multiple api_response rows', () => {
      const lines = [
        makeApiResponseLine(),
        makeNonApiLine(),
        makeApiResponseLine({
          message: {
            model: 'claude-sonnet-4-20250514',
            usage: {
              input_tokens: 200,
              output_tokens: 100,
              cache_read_input_tokens: 30,
              cache_creation_input_tokens: 5,
            },
          },
          costUSD: 0.005,
        }),
      ].join('\n');

      const result = parseTranscriptTokens(lines);

      expect(result.input_tokens).toBe(300);
      expect(result.output_tokens).toBe(150);
      expect(result.cache_read_tokens).toBe(50);
      expect(result.cache_creation_tokens).toBe(15);
      expect(result.est_cost_usd).toBeCloseTo(0.008);
      expect(result.api_request_count).toBe(2);
    });

    it('uses the last model seen as the primary model', () => {
      const lines = [
        makeApiResponseLine({
          message: {
            model: 'claude-haiku-4-20250514',
            usage: { input_tokens: 10, output_tokens: 5 },
          },
          costUSD: 0.001,
        }),
        makeApiResponseLine({
          message: {
            model: 'claude-sonnet-4-20250514',
            usage: { input_tokens: 100, output_tokens: 50 },
          },
          costUSD: 0.003,
        }),
      ].join('\n');

      const result = parseTranscriptTokens(lines);
      expect(result.model).toBe('claude-sonnet-4-20250514');
    });

    it('skips non-assistant rows without errors', () => {
      const lines = [makeNonApiLine(), makeNonApiLine(), makeApiResponseLine()].join('\n');

      const result = parseTranscriptTokens(lines);
      expect(result.api_request_count).toBe(1);
      expect(result.input_tokens).toBe(100);
    });
  });

  describe('empty and missing data', () => {
    it('returns zero summary for empty string', () => {
      const result = parseTranscriptTokens('');

      expect(result).toEqual<TranscriptTokenSummary>({
        input_tokens: 0,
        output_tokens: 0,
        cache_read_tokens: 0,
        cache_creation_tokens: 0,
        est_cost_usd: 0,
        model: 'unknown',
        api_request_count: 0,
      });
    });

    it('returns zero summary when no api_response rows exist', () => {
      const content = [makeNonApiLine(), makeNonApiLine()].join('\n');
      const result = parseTranscriptTokens(content);

      expect(result.api_request_count).toBe(0);
      expect(result.input_tokens).toBe(0);
    });

    it('handles rows missing token fields gracefully', () => {
      const line = JSON.stringify({
        type: 'assistant',
        message: { model: 'claude-sonnet-4-20250514' },
        costUSD: 0.001,
      });

      const result = parseTranscriptTokens(line);
      expect(result.input_tokens).toBe(0);
      expect(result.output_tokens).toBe(0);
      expect(result.api_request_count).toBe(1);
    });
  });

  describe('malformed input', () => {
    it('skips lines that are not valid JSON', () => {
      const lines = ['not json {{{', makeApiResponseLine(), 'another bad line'].join('\n');

      const result = parseTranscriptTokens(lines);
      expect(result.api_request_count).toBe(1);
      expect(result.input_tokens).toBe(100);
    });

    it('skips lines with unexpected structure', () => {
      const lines = [
        JSON.stringify({ unexpected: 'structure' }),
        JSON.stringify([1, 2, 3]),
        makeApiResponseLine(),
      ].join('\n');

      const result = parseTranscriptTokens(lines);
      expect(result.api_request_count).toBe(1);
    });
  });

  describe('security: no content leakage', () => {
    it('does not include message content in output', () => {
      const line = makeApiResponseLine({
        message: {
          model: 'claude-sonnet-4-20250514',
          content: [{ type: 'text', text: 'SECRET ASSISTANT RESPONSE' }],
          usage: { input_tokens: 100, output_tokens: 50 },
        },
        costUSD: 0.003,
      });

      const result = parseTranscriptTokens(line);
      const serialized = JSON.stringify(result);

      expect(serialized).not.toContain('SECRET');
      expect(result.input_tokens).toBe(100);
    });
  });

  describe('large transcripts', () => {
    it('handles transcripts with many rows', () => {
      const lines = Array.from({ length: 500 }, (_, i) =>
        i % 3 === 0
          ? makeApiResponseLine({
              message: {
                model: 'claude-sonnet-4-20250514',
                usage: {
                  input_tokens: 10,
                  output_tokens: 5,
                  cache_read_input_tokens: 2,
                  cache_creation_input_tokens: 1,
                },
              },
              costUSD: 0.001,
            })
          : makeNonApiLine()
      ).join('\n');

      const result = parseTranscriptTokens(lines);
      const apiRows = Math.ceil(500 / 3);

      expect(result.api_request_count).toBe(apiRows);
      expect(result.input_tokens).toBe(apiRows * 10);
    });
  });

  describe('cost computation fallback', () => {
    it('uses costUSD from transcript when non-zero', () => {
      const line = makeApiResponseLine({ costUSD: 0.003 });
      const result = parseTranscriptTokens(line);

      expect(result.est_cost_usd).toBeCloseTo(0.003);
    });

    it('computes cost from tokens when costUSD is 0', () => {
      const line = makeApiResponseLine({
        costUSD: 0,
        message: {
          model: 'claude-sonnet-4-20250514',
          usage: {
            input_tokens: 1000,
            output_tokens: 500,
            cache_read_input_tokens: 0,
            cache_creation_input_tokens: 0,
          },
        },
      });
      const result = parseTranscriptTokens(line);

      // Sonnet: (1000 * 3 + 500 * 15) / 1_000_000 = 0.0105
      expect(result.est_cost_usd).toBeCloseTo(0.0105);
    });

    it('computes cost from tokens when costUSD is absent', () => {
      const line = JSON.stringify({
        type: 'assistant',
        message: {
          model: 'claude-sonnet-4-20250514',
          usage: {
            input_tokens: 1000,
            output_tokens: 500,
            cache_read_input_tokens: 0,
            cache_creation_input_tokens: 0,
          },
        },
      });
      const result = parseTranscriptTokens(line);

      expect(result.est_cost_usd).toBeCloseTo(0.0105);
    });

    it('uses opus pricing for claude-opus model', () => {
      const line = makeApiResponseLine({
        costUSD: 0,
        message: {
          model: 'claude-opus-4-6',
          usage: {
            input_tokens: 1000,
            output_tokens: 500,
            cache_read_input_tokens: 0,
            cache_creation_input_tokens: 0,
          },
        },
      });
      const result = parseTranscriptTokens(line);

      // Opus: (1000 * 15 + 500 * 75) / 1_000_000 = 0.0525
      expect(result.est_cost_usd).toBeCloseTo(0.0525);
    });

    it('uses haiku pricing for claude-haiku model', () => {
      const line = makeApiResponseLine({
        costUSD: 0,
        message: {
          model: 'claude-haiku-4-5-20251001',
          usage: {
            input_tokens: 1000,
            output_tokens: 500,
            cache_read_input_tokens: 0,
            cache_creation_input_tokens: 0,
          },
        },
      });
      const result = parseTranscriptTokens(line);

      // Haiku: (1000 * 0.8 + 500 * 4) / 1_000_000 = 0.0028
      expect(result.est_cost_usd).toBeCloseTo(0.0028);
    });

    it('falls back to sonnet pricing for unknown model', () => {
      const line = makeApiResponseLine({
        costUSD: 0,
        message: {
          model: 'some-unknown-model',
          usage: {
            input_tokens: 1000,
            output_tokens: 500,
            cache_read_input_tokens: 0,
            cache_creation_input_tokens: 0,
          },
        },
      });
      const result = parseTranscriptTokens(line);

      // Sonnet default: (1000 * 3 + 500 * 15) / 1_000_000 = 0.0105
      expect(result.est_cost_usd).toBeCloseTo(0.0105);
    });

    it('includes cache tokens in cost computation', () => {
      const line = makeApiResponseLine({
        costUSD: 0,
        message: {
          model: 'claude-sonnet-4-20250514',
          usage: {
            input_tokens: 0,
            output_tokens: 0,
            cache_read_input_tokens: 1_000_000,
            cache_creation_input_tokens: 100_000,
          },
        },
      });
      const result = parseTranscriptTokens(line);

      // Sonnet: (1M * 0.3 + 100K * 3.75) / 1_000_000 = 0.3 + 0.375 = 0.675
      expect(result.est_cost_usd).toBeCloseTo(0.675);
    });

    it('returns 0 cost when all token counts are 0 and costUSD is 0', () => {
      const line = makeApiResponseLine({
        costUSD: 0,
        message: {
          model: 'claude-sonnet-4-20250514',
          usage: {
            input_tokens: 0,
            output_tokens: 0,
            cache_read_input_tokens: 0,
            cache_creation_input_tokens: 0,
          },
        },
      });
      const result = parseTranscriptTokens(line);

      expect(result.est_cost_usd).toBe(0);
    });
  });
});

describe('transcriptApiResponseSchema', () => {
  it('validates a well-formed api_response row', () => {
    const row = {
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
    };

    const result = transcriptApiResponseSchema.safeParse(row);
    expect(result.success).toBe(true);
  });

  it('rejects rows without type=assistant', () => {
    const row = {
      type: 'user',
      message: { model: 'test', usage: { input_tokens: 1, output_tokens: 1 } },
    };

    const result = transcriptApiResponseSchema.safeParse(row);
    expect(result.success).toBe(false);
  });
});
