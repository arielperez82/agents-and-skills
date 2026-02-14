import { defineDatasource, defineToken, engine, type InferRow, t } from '@tinybirdco/sdk';

const telemetryIngest = defineToken('telemetry_ingest');

export const sessionSummaries = defineDatasource('session_summaries', {
  schema: {
    timestamp: t.dateTime(),
    session_id: t.string(),
    total_duration_ms: t.uint64(),
    agent_count: t.uint32(),
    skill_count: t.uint32(),
    api_request_count: t.uint32(),
    total_input_tokens: t.uint64(),
    total_output_tokens: t.uint64(),
    total_cache_read_tokens: t.uint64(),
    total_cost_usd: t.float64(),
    agents_used: t.array(t.string()),
    skills_used: t.array(t.string()),
    model_primary: t.string().lowCardinality(),
  },
  engine: engine.mergeTree({
    sortingKey: ['toStartOfDay(timestamp)', 'session_id'],
  }),
  tokens: [{ token: telemetryIngest, scope: 'APPEND' }],
});

export type SessionSummaryRow = InferRow<typeof sessionSummaries>;
