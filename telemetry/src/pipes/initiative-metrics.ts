import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const initiativeMetrics = defineEndpoint('initiative_metrics', {
  description: 'Per-initiative agent aggregation filtered by session IDs',
  params: {
    session_ids: p.string().required(),
    project_name: p.string().optional(''),
  },
  nodes: [
    node({
      name: 'initiative_metrics_node',
      sql: `
        SELECT
          agent_type,
          count() AS invocations,
          countIf(exit_code != 0) AS failures,
          sum(input_tokens + output_tokens) AS total_direct_tokens,
          sum(cache_read_tokens) AS total_cache_read,
          sum(est_cost_usd) AS total_cost_usd,
          if(count() > 0, sum(duration_ms) / count(), 0) AS avg_duration_ms,
          sum(duration_ms) AS total_duration_ms,
          if(count() > 0, countIf(exit_code != 0) / count(), 0) AS error_rate
        FROM agent_activations
        WHERE event = 'stop'
          AND has(splitByChar(',', {{String(session_ids)}}), session_id)
          AND agent_type != ''
          AND ({{String(project_name, '')}} = '' OR project_name = {{String(project_name, '')}})
        GROUP BY agent_type
        ORDER BY total_cost_usd DESC
      `,
    }),
  ],
  output: {
    agent_type: t.string(),
    invocations: t.uint64(),
    failures: t.uint64(),
    total_direct_tokens: t.uint64(),
    total_cache_read: t.uint64(),
    total_cost_usd: t.float64(),
    avg_duration_ms: t.float64(),
    total_duration_ms: t.uint64(),
    error_rate: t.float64(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type InitiativeMetricsRow = InferOutputRow<typeof initiativeMetrics>;
