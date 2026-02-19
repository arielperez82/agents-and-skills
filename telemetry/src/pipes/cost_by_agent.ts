import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const costByAgent = defineEndpoint('cost_by_agent', {
  description: 'Cost attribution by agent and model over a time window',
  params: {
    days: p.int32().optional(7),
    agent_type: p.string().optional(''),
  },
  nodes: [
    node({
      name: 'cost_by_agent_node',
      sql: `
        SELECT
          agent_type,
          model,
          sum(input_tokens) AS total_input,
          sum(output_tokens) AS total_output,
          sum(cache_read_tokens) AS total_cache_read,
          sum(est_cost_usd) AS total_cost_usd,
          count() AS invocations,
          if(count() > 0, sum(est_cost_usd) / count(), 0) AS avg_cost_per_invocation,
          if(count() > 0, sum(input_tokens + output_tokens) / count(), 0) AS avg_tokens_per_invocation
        FROM agent_activations
        WHERE event = 'stop'
          AND timestamp >= now() - INTERVAL {{Int32(days, 7)}} DAY
          AND agent_type != ''
          AND ({{String(agent_type, '')}} = '' OR agent_type = {{String(agent_type, '')}})
        GROUP BY agent_type, model
        ORDER BY total_cost_usd DESC
      `,
    }),
  ],
  output: {
    agent_type: t.string(),
    model: t.string(),
    total_input: t.uint64(),
    total_output: t.uint64(),
    total_cache_read: t.uint64(),
    total_cost_usd: t.float64(),
    invocations: t.uint64(),
    avg_cost_per_invocation: t.float64(),
    avg_tokens_per_invocation: t.float64(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type CostByAgentRow = InferOutputRow<typeof costByAgent>;
