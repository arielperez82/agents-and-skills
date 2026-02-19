import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const agentUsageDaily = defineEndpoint('agent_usage_daily', {
  description: 'Daily agent usage trends for adoption tracking',
  params: {
    days: p.int32().optional(30),
    agent_type: p.string().optional(''),
  },
  nodes: [
    node({
      name: 'agent_usage_daily_node',
      sql: `
        SELECT
          toStartOfDay(timestamp) AS day,
          agent_type,
          count() AS invocations,
          sum(input_tokens + output_tokens) AS total_direct_tokens,
          sum(cache_read_tokens) AS total_cache_read,
          sum(est_cost_usd) AS total_cost_usd
        FROM agent_activations
        WHERE event = 'stop'
          AND timestamp >= now() - INTERVAL {{Int32(days, 30)}} DAY
          AND agent_type != ''
          AND ({{String(agent_type, '')}} = '' OR agent_type = {{String(agent_type, '')}})
        GROUP BY day, agent_type
        ORDER BY day DESC, invocations DESC
      `,
    }),
  ],
  output: {
    day: t.date(),
    agent_type: t.string(),
    invocations: t.uint64(),
    total_direct_tokens: t.uint64(),
    total_cache_read: t.uint64(),
    total_cost_usd: t.float64(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type AgentUsageDailyRow = InferOutputRow<typeof agentUsageDaily>;
