import { defineDatasource, defineToken, engine, type InferRow, t } from '@tinybirdco/sdk';

const telemetryIngest = defineToken('telemetry_ingest');

export const skillActivations = defineDatasource('skill_activations', {
  schema: {
    timestamp: t.dateTime(),
    session_id: t.string(),
    skill_name: t.string().lowCardinality(),
    entity_type: t.string().lowCardinality(),
    agent_type: t.string().lowCardinality().nullable(),
    duration_ms: t.uint64(),
    success: t.uint8(),
  },
  engine: engine.mergeTree({
    sortingKey: ['skill_name', 'toStartOfHour(timestamp)', 'session_id'],
  }),
  tokens: [{ token: telemetryIngest, scope: 'APPEND' }],
});

export type SkillActivationRow = InferRow<typeof skillActivations>;
