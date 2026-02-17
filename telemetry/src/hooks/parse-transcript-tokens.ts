import { z } from 'zod';

const usageSchema = z.object({
  input_tokens: z.number().optional(),
  output_tokens: z.number().optional(),
  cache_read_input_tokens: z.number().optional(),
  cache_creation_input_tokens: z.number().optional(),
});

export const transcriptApiResponseSchema = z.object({
  type: z.literal('assistant'),
  message: z.object({
    model: z.string().optional(),
    usage: usageSchema.optional(),
  }),
  costUSD: z.number().optional(),
});

export type TranscriptTokenSummary = {
  readonly input_tokens: number;
  readonly output_tokens: number;
  readonly cache_read_tokens: number;
  readonly cache_creation_tokens: number;
  readonly est_cost_usd: number;
  readonly model: string;
  readonly api_request_count: number;
};

const EMPTY_SUMMARY: TranscriptTokenSummary = {
  input_tokens: 0,
  output_tokens: 0,
  cache_read_tokens: 0,
  cache_creation_tokens: 0,
  est_cost_usd: 0,
  model: 'unknown',
  api_request_count: 0,
};

const tryParseJson = (line: string): unknown => {
  try {
    return JSON.parse(line) as unknown;
  } catch {
    return undefined;
  }
};

export const parseTranscriptTokens = (content: string): TranscriptTokenSummary => {
  if (!content.trim()) {
    return EMPTY_SUMMARY;
  }

  const lines = content.split('\n').filter((line) => line.trim());

  let inputTokens = 0;
  let outputTokens = 0;
  let cacheReadTokens = 0;
  let cacheCreationTokens = 0;
  let costUsd = 0;
  let model = 'unknown';
  let apiRequestCount = 0;

  for (const line of lines) {
    const parsed = tryParseJson(line);
    if (parsed === undefined) continue;

    const result = transcriptApiResponseSchema.safeParse(parsed);
    if (!result.success) continue;

    const row = result.data;
    apiRequestCount += 1;

    const usage = row.message.usage;
    if (usage) {
      inputTokens += usage.input_tokens ?? 0;
      outputTokens += usage.output_tokens ?? 0;
      cacheReadTokens += usage.cache_read_input_tokens ?? 0;
      cacheCreationTokens += usage.cache_creation_input_tokens ?? 0;
    }

    if (row.costUSD !== undefined) {
      costUsd += row.costUSD;
    }

    if (row.message.model) {
      model = row.message.model;
    }
  }

  return {
    input_tokens: inputTokens,
    output_tokens: outputTokens,
    cache_read_tokens: cacheReadTokens,
    cache_creation_tokens: cacheCreationTokens,
    est_cost_usd: costUsd,
    model,
    api_request_count: apiRequestCount,
  };
};
