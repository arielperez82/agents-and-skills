import { z } from 'zod';

import type { SessionSummaryRow } from '@/datasources';

import { parseTranscriptTokens } from './parse-transcript-tokens';

const isoDateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

const sessionEndEventSchema = z.object({
  session_id: z.string(),
  transcript_path: z.string(),
  duration_ms: z.number(),
  cwd: z.string(),
  timestamp: z.string().regex(isoDateTimeRegex, 'timestamp must be ISO 8601'),
});

export const buildSessionSummary = (
  eventJson: string,
  transcriptContent: string
): SessionSummaryRow => {
  const parsed: unknown = JSON.parse(eventJson);
  const event = sessionEndEventSchema.parse(parsed);
  const tokens = parseTranscriptTokens(transcriptContent);

  return {
    timestamp: new Date(event.timestamp),
    session_id: event.session_id,
    total_duration_ms: event.duration_ms,
    agent_count: 0,
    skill_count: 0,
    api_request_count: tokens.api_request_count,
    total_input_tokens: tokens.input_tokens,
    total_output_tokens: tokens.output_tokens,
    total_cache_read_tokens: tokens.cache_read_tokens,
    total_cost_usd: tokens.est_cost_usd,
    agents_used: [],
    skills_used: [],
    model_primary: tokens.model,
  };
};
