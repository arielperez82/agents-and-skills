import { z } from 'zod';

import type { SessionSummaryRow } from '@/datasources';

import { parseTranscriptAgents } from './parse-transcript-agents';
import { parseTranscriptTokens } from './parse-transcript-tokens';

const sessionEndEventSchema = z.object({
  session_id: z.string(),
  transcript_path: z.string().optional(),
  cwd: z.string(),
  reason: z.string().optional(),
  permission_mode: z.string().optional(),
  hook_event_name: z.string().optional(),
});

export const buildSessionSummary = (
  eventJson: string,
  transcriptContent: string
): SessionSummaryRow => {
  const parsed: unknown = JSON.parse(eventJson);
  const event = sessionEndEventSchema.parse(parsed);
  const tokens = parseTranscriptTokens(transcriptContent);
  const agents = parseTranscriptAgents(transcriptContent);

  return {
    timestamp: new Date(),
    session_id: event.session_id,
    total_duration_ms: 0,
    agent_count: agents.agent_count,
    skill_count: agents.skill_count,
    api_request_count: tokens.api_request_count,
    total_input_tokens: tokens.input_tokens,
    total_output_tokens: tokens.output_tokens,
    total_cache_read_tokens: tokens.cache_read_tokens,
    total_cost_usd: tokens.est_cost_usd,
    agents_used: [...agents.agents_used],
    skills_used: [...agents.skills_used],
    model_primary: tokens.model,
  };
};
