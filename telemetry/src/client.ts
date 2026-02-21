import {
  createClient,
  type InferOutputRow,
  type InferRow,
  type IngestResult,
  type QueryResult,
} from '@tinybirdco/sdk';

import {
  agentActivations,
  apiRequests,
  sessionSummaries,
  skillActivations,
  telemetryHealth,
} from './datasources';
import {
  agentUsageDaily,
  agentUsageSummary,
  costByAgent,
  costByModel,
  optimizationInsights,
  scriptPerformance,
  sessionOverview,
  skillFrequency,
  telemetryHealthSummary,
} from './pipes';

export type TelemetryClientConfig = {
  readonly baseUrl: string;
  readonly ingestToken: string;
  readonly readToken: string;
};

export type TelemetryClient = {
  readonly ingest: {
    readonly agentActivations: (row: InferRow<typeof agentActivations>) => Promise<IngestResult>;
    readonly apiRequests: (row: InferRow<typeof apiRequests>) => Promise<IngestResult>;
    readonly sessionSummaries: (row: InferRow<typeof sessionSummaries>) => Promise<IngestResult>;
    readonly skillActivations: (row: InferRow<typeof skillActivations>) => Promise<IngestResult>;
    readonly telemetryHealth: (row: InferRow<typeof telemetryHealth>) => Promise<IngestResult>;
  };
  readonly query: {
    readonly agentUsageDaily: (params: {
      readonly days?: number;
    }) => Promise<QueryResult<InferOutputRow<typeof agentUsageDaily>>>;
    readonly agentUsageSummary: (params: {
      readonly days?: number;
      readonly project_name?: string;
    }) => Promise<QueryResult<InferOutputRow<typeof agentUsageSummary>>>;
    readonly costByAgent: (params: {
      readonly days?: number;
    }) => Promise<QueryResult<InferOutputRow<typeof costByAgent>>>;
    readonly costByModel: (params: {
      readonly days?: number;
    }) => Promise<QueryResult<InferOutputRow<typeof costByModel>>>;
    readonly optimizationInsights: (params: {
      readonly days?: number;
    }) => Promise<QueryResult<InferOutputRow<typeof optimizationInsights>>>;
    readonly scriptPerformance: (params: {
      readonly days?: number;
      readonly project_name?: string;
    }) => Promise<QueryResult<InferOutputRow<typeof scriptPerformance>>>;
    readonly sessionOverview: (params: {
      readonly days?: number;
      readonly session_id?: string;
      readonly project_name?: string;
    }) => Promise<QueryResult<InferOutputRow<typeof sessionOverview>>>;
    readonly skillFrequency: (params: {
      readonly days?: number;
      readonly project_name?: string;
    }) => Promise<QueryResult<InferOutputRow<typeof skillFrequency>>>;
    readonly telemetryHealthSummary: (params: {
      readonly days?: number;
    }) => Promise<QueryResult<InferOutputRow<typeof telemetryHealthSummary>>>;
  };
};

export const createTelemetryClient = (config: TelemetryClientConfig): TelemetryClient => {
  const writer = createClient({ baseUrl: config.baseUrl, token: config.ingestToken });
  const reader = createClient({ baseUrl: config.baseUrl, token: config.readToken });

  return {
    ingest: {
      agentActivations: (row) => writer.ingest('agent_activations', row),
      apiRequests: (row) => writer.ingest('api_requests', row),
      sessionSummaries: (row) => writer.ingest('session_summaries', row),
      skillActivations: (row) => writer.ingest('skill_activations', row),
      telemetryHealth: (row) => writer.ingest('telemetry_health', row),
    },
    query: {
      agentUsageDaily: (params) =>
        reader.query('agent_usage_daily', params as Record<string, unknown>),
      agentUsageSummary: (params) =>
        reader.query('agent_usage_summary', params as Record<string, unknown>),
      costByAgent: (params) => reader.query('cost_by_agent', params as Record<string, unknown>),
      costByModel: (params) => reader.query('cost_by_model', params as Record<string, unknown>),
      optimizationInsights: (params) =>
        reader.query('optimization_insights', params as Record<string, unknown>),
      scriptPerformance: (params) =>
        reader.query('script_performance', params as Record<string, unknown>),
      sessionOverview: (params) =>
        reader.query('session_overview', params as Record<string, unknown>),
      skillFrequency: (params) =>
        reader.query('skill_frequency', params as Record<string, unknown>),
      telemetryHealthSummary: (params) =>
        reader.query('telemetry_health_summary', params as Record<string, unknown>),
    },
  };
};
