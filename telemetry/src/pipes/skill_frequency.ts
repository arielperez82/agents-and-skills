import { defineEndpoint, defineToken, type InferOutputRow, node, p, t } from '@tinybirdco/sdk';

const telemetryRead = defineToken('telemetry_read');

export const skillFrequency = defineEndpoint('skill_frequency', {
  description: 'Skill and command usage frequency over a time window',
  params: {
    days: p.int32().optional(7),
  },
  nodes: [
    node({
      name: 'skill_frequency_node',
      sql: `
        SELECT
          skill_name,
          entity_type,
          count() AS activations,
          countIf(success = 1) AS successes,
          avg(duration_ms) AS avg_duration_ms
        FROM skill_activations
        WHERE timestamp >= now() - INTERVAL {{Int32(days, 7)}} DAY
        GROUP BY skill_name, entity_type
        ORDER BY activations DESC
      `,
    }),
  ],
  output: {
    skill_name: t.string(),
    entity_type: t.string(),
    activations: t.uint64(),
    successes: t.uint64(),
    avg_duration_ms: t.float64(),
  },
  tokens: [{ token: telemetryRead, scope: 'READ' as const }],
});

export type SkillFrequencyRow = InferOutputRow<typeof skillFrequency>;
