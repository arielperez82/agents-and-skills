import { defineDatasource, defineToken, engine, type InferRow, t } from '@tinybirdco/sdk';

const telemetryIngest = defineToken('telemetry_ingest');

export const apiRequests = defineDatasource('api_requests', {
  schema: {
    timestamp: t.dateTime(),
    session_id: t.string(),
    model: t.string().lowCardinality(),
    input_tokens: t.uint64(),
    output_tokens: t.uint64(),
    cache_read_tokens: t.uint64(),
    cache_creation_tokens: t.uint64(),
    cost_usd: t.float64(),
    duration_ms: t.uint64(),
    status_code: t.uint16(),
    error_type: t.string().lowCardinality().nullable(),
    source: t.string().lowCardinality(),
  },
  engine: engine.mergeTree({
    sortingKey: ['model', 'toStartOfHour(timestamp)', 'session_id'],
  }),
  tokens: [{ token: telemetryIngest, scope: 'APPEND' }],
});

export type ApiRequestRow = InferRow<typeof apiRequests>;
