import { defineDatasource, defineToken, engine, type InferRow, t } from '@tinybirdco/sdk';

const tokenName = defineToken('telemetry_ingest');

export const telemetryHealth = defineDatasource('telemetry_health', {
  schema: {
    timestamp: t.dateTime(),
    hook_name: t.string().lowCardinality(),
    exit_code: t.uint8(),
    duration_ms: t.uint64(),
    error_message: t.string().nullable(),
    tinybird_status_code: t.uint16().nullable(),
  },
  engine: engine.mergeTree({
    sortingKey: ['hook_name', 'toStartOfHour(timestamp)'],
  }),
  tokens: [{ token: tokenName, scope: 'APPEND' }],
});

export type TelemetryHealthRow = InferRow<typeof telemetryHealth>;
