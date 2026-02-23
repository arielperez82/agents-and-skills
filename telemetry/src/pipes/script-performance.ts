import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const scriptPerformance = defineEndpoint('script_performance', {
  description: 'Performance metrics for script executions over a time window',
  params: {
    days: p.int32().optional(30),
    project_name: p.string().optional(),
  },
  nodes: [
    node({
      name: 'script_performance_node',
      sql: `
        SELECT
          skill_name,
          parent_skill,
          project_name,
          count() AS executions,
          countIf(success = 1) AS successes,
          countIf(success = 0) AS failures,
          avg(duration_ms) AS avg_duration_ms,
          quantile(0.95)(duration_ms) AS p95_duration_ms,
          max(duration_ms) AS max_duration_ms
        FROM skill_activations
        WHERE entity_type = 'script'
          AND timestamp >= now() - INTERVAL {{Int32(days, 30)}} DAY
          {% if defined(project_name) %}
            AND project_name = {{String(project_name)}}
          {% end %}
        GROUP BY skill_name, parent_skill, project_name
        ORDER BY executions DESC
      `,
    }),
  ],
  output: {
    skill_name: t.string(),
    parent_skill: t.string(),
    project_name: t.string(),
    executions: t.uint64(),
    successes: t.uint64(),
    failures: t.uint64(),
    avg_duration_ms: t.float64(),
    p95_duration_ms: t.float64(),
    max_duration_ms: t.uint64(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type ScriptPerformanceRow = InferOutputRow<typeof scriptPerformance>;
