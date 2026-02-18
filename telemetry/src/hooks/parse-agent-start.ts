import { z } from 'zod';

import type { AgentActivationRow } from '@/datasources';

export const subagentStartSchema = z.object({
  session_id: z.string(),
  agent_id: z.string(),
  agent_type: z.string(),
  cwd: z.string(),
  transcript_path: z.string().optional(),
  permission_mode: z.string().optional(),
  hook_event_name: z.string().optional(),
});

export const parseAgentStart = (eventJson: string): AgentActivationRow => {
  const parsed: unknown = JSON.parse(eventJson);
  const event = subagentStartSchema.parse(parsed);

  return {
    timestamp: new Date(),
    session_id: event.session_id,
    parent_session_id: null,
    agent_type: event.agent_type,
    agent_id: event.agent_id,
    event: 'start',
    model: 'unknown',
    input_tokens: 0,
    output_tokens: 0,
    cache_read_tokens: 0,
    cache_creation_tokens: 0,
    duration_ms: 0,
    est_cost_usd: 0,
    success: 1,
    error_type: null,
    tool_calls_count: 0,
  };
};
