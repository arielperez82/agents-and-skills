import { z } from 'zod';

import type { AgentActivationRow } from '@/datasources';

import { parseTranscriptTokens } from './parse-transcript-tokens';

const subagentStopSchema = z.object({
  session_id: z.string(),
  agent_id: z.string(),
  agent_type: z.string(),
  agent_transcript_path: z.string(),
  parent_session_id: z.string(),
  duration_ms: z.number(),
  success: z.boolean(),
  error: z.string().nullable(),
  cwd: z.string(),
  timestamp: z.string(),
});

export const parseAgentStop = (
  eventJson: string,
  transcriptContent: string
): AgentActivationRow => {
  const event = subagentStopSchema.parse(JSON.parse(eventJson) as unknown);
  const tokens = parseTranscriptTokens(transcriptContent);

  return {
    timestamp: new Date(event.timestamp),
    session_id: event.session_id,
    parent_session_id: event.parent_session_id,
    agent_type: event.agent_type,
    agent_id: event.agent_id,
    event: 'stop',
    input_tokens: tokens.input_tokens,
    output_tokens: tokens.output_tokens,
    cache_read_tokens: tokens.cache_read_tokens,
    cache_creation_tokens: tokens.cache_creation_tokens,
    duration_ms: event.duration_ms,
    est_cost_usd: tokens.est_cost_usd,
    model: tokens.model,
    success: event.success ? 1 : 0,
    error_type: event.error,
    tool_calls_count: 0,
  };
};
