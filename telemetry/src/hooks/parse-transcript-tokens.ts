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

type ModelPricing = {
  readonly inputPerMillion: number;
  readonly outputPerMillion: number;
  readonly cacheReadPerMillion: number;
  readonly cacheWritePerMillion: number;
};

const MODEL_PRICING: ReadonlyArray<readonly [string, ModelPricing]> = [
  [
    'claude-opus',
    {
      inputPerMillion: 15,
      outputPerMillion: 75,
      cacheReadPerMillion: 1.5,
      cacheWritePerMillion: 18.75,
    },
  ],
  [
    'claude-sonnet',
    {
      inputPerMillion: 3,
      outputPerMillion: 15,
      cacheReadPerMillion: 0.3,
      cacheWritePerMillion: 3.75,
    },
  ],
  [
    'claude-haiku',
    {
      inputPerMillion: 0.8,
      outputPerMillion: 4,
      cacheReadPerMillion: 0.08,
      cacheWritePerMillion: 1,
    },
  ],
];

const SONNET_PRICING: ModelPricing = {
  inputPerMillion: 3,
  outputPerMillion: 15,
  cacheReadPerMillion: 0.3,
  cacheWritePerMillion: 3.75,
};

const getPricing = (model: string): ModelPricing => {
  const entry = MODEL_PRICING.find(([prefix]) => model.includes(prefix));
  return entry?.[1] ?? SONNET_PRICING;
};

const computeCostFromTokens = (
  model: string,
  inputTokens: number,
  outputTokens: number,
  cacheReadTokens: number,
  cacheCreationTokens: number
): number => {
  const pricing = getPricing(model);
  return (
    (inputTokens * pricing.inputPerMillion +
      outputTokens * pricing.outputPerMillion +
      cacheReadTokens * pricing.cacheReadPerMillion +
      cacheCreationTokens * pricing.cacheWritePerMillion) /
    1_000_000
  );
};

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
    const rowInput = usage?.input_tokens ?? 0;
    const rowOutput = usage?.output_tokens ?? 0;
    const rowCacheRead = usage?.cache_read_input_tokens ?? 0;
    const rowCacheCreation = usage?.cache_creation_input_tokens ?? 0;
    const rowModel = row.message.model ?? model;

    inputTokens += rowInput;
    outputTokens += rowOutput;
    cacheReadTokens += rowCacheRead;
    cacheCreationTokens += rowCacheCreation;

    const rowCost =
      row.costUSD !== undefined && row.costUSD > 0
        ? row.costUSD
        : computeCostFromTokens(rowModel, rowInput, rowOutput, rowCacheRead, rowCacheCreation);
    costUsd += rowCost;

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
