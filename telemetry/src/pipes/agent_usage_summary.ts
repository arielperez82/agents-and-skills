import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const agentUsageSummary = defineEndpoint('agent_usage_summary', {
  description: 'Agent usage analytics aggregated over a time window',
  params: {
    days: p.int32().optional(7),
  },
  nodes: [
    node({
      name: 'agent_usage_summary_node',
      sql: `
        SELECT
          agent_type,
          count() AS invocations,
          sum(input_tokens) AS total_input,
          sum(output_tokens) AS total_output,
          sum(cache_read_tokens) AS total_cache_read,
          avg(duration_ms) AS avg_duration_ms,
          sum(est_cost_usd) AS est_cost_usd,
          countIf(success = 0) AS failure_count,
          if(count() > 0, countIf(success = 0) / count(), 0) AS error_rate
        FROM agent_activations
        WHERE event = 'stop'
          AND timestamp >= now() - INTERVAL {{Int32(days, 7)}} DAY
        GROUP BY agent_type
        ORDER BY est_cost_usd DESC
      `,
    }),
  ],
  output: {
    agent_type: t.string(),
    invocations: t.uint64(),
    total_input: t.uint64(),
    total_output: t.uint64(),
    total_cache_read: t.uint64(),
    avg_duration_ms: t.float64(),
    est_cost_usd: t.float64(),
    failure_count: t.uint64(),
    error_rate: t.float64(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type AgentUsageSummaryRow = InferOutputRow<typeof agentUsageSummary>;
