import { createTinybirdClient, type ProjectClient } from '@tinybirdco/sdk';

import {
  agentActivations,
  apiRequests,
  sessionSummaries,
  skillActivations,
  telemetryHealth,
} from './datasources';
import {
  agentUsageSummary,
  costByModel,
  optimizationInsights,
  sessionOverview,
  skillFrequency,
  telemetryHealthSummary,
} from './pipes';

const datasourcesConfig = {
  agentActivations,
  apiRequests,
  sessionSummaries,
  skillActivations,
  telemetryHealth,
} as const;

const pipesConfig = {
  agentUsageSummary,
  costByModel,
  optimizationInsights,
  sessionOverview,
  skillFrequency,
  telemetryHealthSummary,
} as const;

type Datasources = typeof datasourcesConfig;
type Pipes = typeof pipesConfig;

type IngestClient = ProjectClient<Datasources, Pipes>['ingest'];
type QueryClient = ProjectClient<Datasources, Pipes>['query'];

export type TelemetryClientConfig = {
  readonly baseUrl: string;
  readonly ingestToken: string;
  readonly readToken: string;
};

export type TelemetryClient = {
  readonly ingest: IngestClient;
  readonly query: QueryClient;
};

export const createTelemetryClient = (config: TelemetryClientConfig): TelemetryClient => {
  const ingestClient = createTinybirdClient({
    datasources: datasourcesConfig,
    pipes: pipesConfig,
    baseUrl: config.baseUrl,
    token: config.ingestToken,
  });

  const readClient = createTinybirdClient({
    datasources: datasourcesConfig,
    pipes: pipesConfig,
    baseUrl: config.baseUrl,
    token: config.readToken,
  });

  return {
    ingest: ingestClient.ingest,
    query: readClient.query,
  };
};
