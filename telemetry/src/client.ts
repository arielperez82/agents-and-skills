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
  /* SDK createTinybirdClient return type does not resolve in our tooling; we enforce TelemetryClient contract. */
  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
  const fullClient = createTinybirdClient({
    datasources: datasourcesConfig,
    pipes: pipesConfig,
    baseUrl: config.baseUrl,
    token: config.ingestToken,
  }) as ProjectClient<Datasources, Pipes>;

  const readClient = createTinybirdClient({
    datasources: datasourcesConfig,
    pipes: pipesConfig,
    baseUrl: config.baseUrl,
    token: config.readToken,
  }) as ProjectClient<Datasources, Pipes>;

  return {
    ingest: fullClient.ingest,
    query: readClient.query,
  };
  /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
};
