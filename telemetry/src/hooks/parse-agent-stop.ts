import { z } from 'zod';

import type { AgentActivationRow } from '@/datasources';

import { parseTranscriptTokens } from './parse-transcript-tokens';

const subagentStopSchema = z.object({
  session_id: z.string(),
  agent_id: z.string(),
  agent_type: z.string(),
  agent_transcript_path: z.string().optional(),
  cwd: z.string(),
  stop_hook_active: z.boolean().optional(),
  transcript_path: z.string().optional(),
  permission_mode: z.string().optional(),
  hook_event_name: z.string().optional(),
});

export const parseAgentStop = (
  eventJson: string,
  transcriptContent: string
): AgentActivationRow => {
  const event = subagentStopSchema.parse(JSON.parse(eventJson) as unknown);

  if (!event.agent_type.trim()) {
    throw new Error('agent_type is empty — skipping ingestion');
  }

  const tokens = parseTranscriptTokens(transcriptContent);

  return {
    timestamp: new Date(),
    session_id: event.session_id,
    parent_session_id: null,
    agent_type: event.agent_type,
    agent_id: event.agent_id,
    event: 'stop',
    input_tokens: tokens.input_tokens,
    output_tokens: tokens.output_tokens,
    cache_read_tokens: tokens.cache_read_tokens,
    cache_creation_tokens: tokens.cache_creation_tokens,
    duration_ms: 0,
    est_cost_usd: tokens.est_cost_usd,
    model: tokens.model,
    success: 1,
    error_type: null,
    tool_calls_count: 0,
  };
};
