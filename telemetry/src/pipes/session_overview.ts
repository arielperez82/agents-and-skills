import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const sessionOverview = defineEndpoint('session_overview', {
  description: 'Per-session drill-down with aggregated metrics',
  params: {
    session_id: p.string().optional(),
    days: p.int32().optional(7),
    project_name: p.string().optional(),
  },
  nodes: [
    node({
      name: 'session_overview_node',
      sql: `
        SELECT
          session_id,
          project_name,
          max(agent_count) AS agents_used,
          max(skill_count) AS skills_used,
          sum(total_input_tokens + total_output_tokens) AS total_tokens,
          sum(total_cost_usd) AS total_cost_usd,
          sum(total_duration_ms) AS total_duration_ms
        FROM session_summaries
        WHERE timestamp >= now() - INTERVAL {{Int32(days, 7)}} DAY
          {% if defined(session_id) %}
            AND session_id = {{String(session_id)}}
          {% end %}
          {% if defined(project_name) %}
            AND project_name = {{String(project_name)}}
          {% end %}
        GROUP BY session_id, project_name
        ORDER BY total_cost_usd DESC
      `,
    }),
  ],
  output: {
    session_id: t.string(),
    project_name: t.string(),
    agents_used: t.uint64(),
    skills_used: t.uint64(),
    total_tokens: t.uint64(),
    total_cost_usd: t.float64(),
    total_duration_ms: t.uint64(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type SessionOverviewRow = InferOutputRow<typeof sessionOverview>;
