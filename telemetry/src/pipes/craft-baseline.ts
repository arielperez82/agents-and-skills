import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const craftBaseline = defineEndpoint('craft_baseline', {
  description: 'Rolling baseline metrics for craft-like sessions over a time window',
  params: {
    days: p.int32().optional(30),
    project_name: p.string().optional(''),
  },
  nodes: [
    node({
      name: 'craft_sessions_node',
      sql: `
        SELECT
          session_id,
          sum(total_input_tokens + total_output_tokens) AS direct_tokens,
          sum(total_cache_read_tokens) AS cache_read,
          sum(total_cost_usd) AS cost_usd,
          max(agent_count) AS agent_count,
          sum(total_duration_ms) AS duration_ms
        FROM session_summaries
        WHERE timestamp >= now() - INTERVAL {{Int32(days, 30)}} DAY
          AND hasAny(agents_used, ['product-director','acceptance-designer','architect','implementation-planner','engineering-lead'])
          AND ({{String(project_name, '')}} = '' OR project_name = {{String(project_name, '')}})
        GROUP BY session_id
      `,
    }),
    node({
      name: 'craft_baseline_node',
      sql: `
        SELECT
          count() AS session_count,
          avg(direct_tokens) AS avg_direct_tokens,
          quantile(0.5)(direct_tokens) AS median_direct_tokens,
          avg(cost_usd) AS avg_cost_usd,
          quantile(0.5)(cost_usd) AS median_cost_usd,
          avg(agent_count) AS avg_agent_count,
          quantile(0.5)(duration_ms) AS median_duration_ms
        FROM craft_sessions_node
      `,
    }),
  ],
  output: {
    session_count: t.uint64(),
    avg_direct_tokens: t.float64(),
    median_direct_tokens: t.float64(),
    avg_cost_usd: t.float64(),
    median_cost_usd: t.float64(),
    avg_agent_count: t.float64(),
    median_duration_ms: t.float64(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type CraftBaselineRow = InferOutputRow<typeof craftBaseline>;
