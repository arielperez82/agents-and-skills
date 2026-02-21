import { vi } from 'vitest';

import type { TelemetryClient } from '@/client';

type StubOverrides = {
  readonly ingest?: Partial<TelemetryClient['ingest']>;
  readonly query?: Partial<TelemetryClient['query']>;
};

const defaultIngestResult = { successful_rows: 1, quarantined_rows: 0 };
const defaultQueryResult = { data: [], meta: [], rows: 0, statistics: {} };

export const createStubClient = (overrides?: StubOverrides): TelemetryClient => ({
  ingest: {
    agentActivations: vi.fn().mockResolvedValue(defaultIngestResult),
    apiRequests: vi.fn().mockResolvedValue(defaultIngestResult),
    sessionSummaries: vi.fn().mockResolvedValue(defaultIngestResult),
    skillActivations: vi.fn().mockResolvedValue(defaultIngestResult),
    telemetryHealth: vi.fn().mockResolvedValue(defaultIngestResult),
    ...overrides?.ingest,
  },
  query: {
    agentUsageDaily: vi.fn().mockResolvedValue(defaultQueryResult),
    agentUsageSummary: vi.fn().mockResolvedValue(defaultQueryResult),
    costByAgent: vi.fn().mockResolvedValue(defaultQueryResult),
    costByModel: vi.fn().mockResolvedValue(defaultQueryResult),
    optimizationInsights: vi.fn().mockResolvedValue(defaultQueryResult),
    scriptPerformance: vi.fn().mockResolvedValue(defaultQueryResult),
    sessionOverview: vi.fn().mockResolvedValue(defaultQueryResult),
    skillFrequency: vi.fn().mockResolvedValue(defaultQueryResult),
    telemetryHealthSummary: vi.fn().mockResolvedValue(defaultQueryResult),
    ...overrides?.query,
  },
});
