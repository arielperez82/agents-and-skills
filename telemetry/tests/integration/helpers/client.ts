import { Tinybird } from '@tinybirdco/sdk';

import * as datasources from '@/datasources';
import * as pipes from '@/pipes';

const baseUrl = process.env.TB_HOST ?? 'http://localhost:7181';
const token = process.env.TB_TOKEN ?? '';

export const integrationClient = new Tinybird({
  datasources: {
    agentActivations: datasources.agentActivations,
    apiRequests: datasources.apiRequests,
    sessionSummaries: datasources.sessionSummaries,
    skillActivations: datasources.skillActivations,
    telemetryHealth: datasources.telemetryHealth,
  },
  pipes: {
    agentUsageSummary: pipes.agentUsageSummary,
    costByModel: pipes.costByModel,
    optimizationInsights: pipes.optimizationInsights,
    sessionOverview: pipes.sessionOverview,
    skillFrequency: pipes.skillFrequency,
    telemetryHealthSummary: pipes.telemetryHealthSummary,
  },
  baseUrl,
  token,
});
