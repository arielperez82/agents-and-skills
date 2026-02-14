import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const telemetryHealthSummary = defineEndpoint('telemetry_health_summary', {
  description: 'Self-observability summary of hook health and failures',
  params: {
    hours: p.int32().optional(24),
  },
  nodes: [
    node({
      name: 'telemetry_health_summary',
      sql: `
        SELECT
          hook_name,
          count() AS total_invocations,
          countIf(exit_code != 0) AS failures,
          if(count() > 0, countIf(exit_code != 0) / count(), 0) AS failure_rate,
          avg(duration_ms) AS avg_duration_ms,
          argMax(error_message, timestamp) AS last_error
        FROM telemetry_health
        WHERE timestamp >= now() - INTERVAL {{Int32(hours, 24)}} HOUR
        GROUP BY hook_name
        ORDER BY failures DESC
      `,
    }),
  ],
  output: {
    hook_name: t.string(),
    total_invocations: t.uint64(),
    failures: t.uint64(),
    failure_rate: t.float64(),
    avg_duration_ms: t.float64(),
    last_error: t.string().nullable(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type TelemetryHealthSummaryRow = InferOutputRow<typeof telemetryHealthSummary>;
