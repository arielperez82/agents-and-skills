import { defineDatasource, defineToken, engine, type InferRow, t } from '@tinybirdco/sdk';

const telemetryIngest = defineToken('telemetry_ingest');

export const agentActivations = defineDatasource('agent_activations', {
  schema: {
    timestamp: t.dateTime(),
    session_id: t.string(),
    parent_session_id: t.string().nullable(),
    agent_type: t.string().lowCardinality(),
    agent_id: t.string(),
    event: t.string().lowCardinality(),
    input_tokens: t.uint64(),
    output_tokens: t.uint64(),
    cache_read_tokens: t.uint64(),
    cache_creation_tokens: t.uint64(),
    duration_ms: t.uint64(),
    model: t.string().lowCardinality(),
    est_cost_usd: t.float64(),
    success: t.uint8(),
    error_type: t.string().lowCardinality().nullable(),
    tool_calls_count: t.uint32(),
  },
  engine: engine.mergeTree({
    sortingKey: ['agent_type', 'model', 'toStartOfHour(timestamp)', 'session_id'],
  }),
  tokens: [{ token: telemetryIngest, scope: 'APPEND' }],
});

export type AgentActivationRow = InferRow<typeof agentActivations>;
