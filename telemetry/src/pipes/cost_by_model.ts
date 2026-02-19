import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const costByModel = defineEndpoint('cost_by_model', {
  description: 'Cost attribution by model over a time window',
  params: {
    days: p.int32().optional(7),
  },
  nodes: [
    node({
      name: 'cost_by_model_node',
      sql: `
        SELECT
          model,
          sum(input_tokens) AS total_input,
          sum(output_tokens) AS total_output,
          sum(cache_read_tokens) AS total_cache_read,
          sum(est_cost_usd) AS total_cost_usd,
          countIf(event = 'stop') AS request_count,
          countIf(success = 0) AS error_count,
          if(countIf(event = 'stop') > 0,
            countIf(success = 0) / countIf(event = 'stop'), 0) AS error_rate
        FROM agent_activations
        WHERE event = 'stop'
          AND timestamp >= now() - INTERVAL {{Int32(days, 7)}} DAY
        GROUP BY model
        ORDER BY total_cost_usd DESC
      `,
    }),
  ],
  output: {
    model: t.string(),
    total_input: t.uint64(),
    total_output: t.uint64(),
    total_cache_read: t.uint64(),
    total_cost_usd: t.float64(),
    request_count: t.uint64(),
    error_count: t.uint64(),
    error_rate: t.float64(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type CostByModelRow = InferOutputRow<typeof costByModel>;
