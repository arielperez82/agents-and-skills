import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const optimizationInsights = defineEndpoint('optimization_insights', {
  description: 'Actionable optimization recommendations with efficiency scoring',
  params: {
    days: p.int32().optional(7),
  },
  nodes: [
    node({
      name: 'optimization_insights_node',
      sql: `
        SELECT
          agent_type,
          if(count() > 0, sum(est_cost_usd) / count(), 0) AS avg_cost_per_invocation,
          if(count() > 0, sum(input_tokens + output_tokens) / count(), 0) AS avg_tokens,
          count() AS frequency,
          if(sum(input_tokens + output_tokens + cache_read_tokens) > 0,
            sum(cache_read_tokens) / sum(input_tokens + output_tokens + cache_read_tokens),
            0) AS cache_hit_rate,
          if(sum(input_tokens + output_tokens + cache_read_tokens) > 0,
            (sum(cache_read_tokens) / sum(input_tokens + output_tokens + cache_read_tokens))
              * log(count() + 1),
            0) AS efficiency_score
        FROM agent_activations
        WHERE event = 'stop'
          AND timestamp >= now() - INTERVAL {{Int32(days, 7)}} DAY
          AND agent_type != ''
        GROUP BY agent_type
        ORDER BY efficiency_score DESC
      `,
    }),
  ],
  output: {
    agent_type: t.string(),
    avg_cost_per_invocation: t.float64(),
    avg_tokens: t.float64(),
    frequency: t.uint64(),
    cache_hit_rate: t.float64(),
    efficiency_score: t.float64(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type OptimizationInsightsRow = InferOutputRow<typeof optimizationInsights>;
