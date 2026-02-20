import type { TelemetryClient } from '@/client';

export type Clock = { readonly now: () => number };

export type FileReader = (filePath: string) => string;

export type TimingStore = {
  readonly recordAgentStart: (agentId: string, startMs: number) => void;
  readonly consumeAgentStart: (agentId: string) => number | null;
  readonly recordSessionAgent: (sessionId: string, agentType: string) => void;
  readonly lookupSessionAgent: (sessionId: string) => string | null;
  readonly removeSessionAgent: (sessionId: string) => void;
};

export type CacheStore = {
  readonly read: () => { readonly additionalContext?: string };
  readonly write: (result: { readonly additionalContext?: string }) => void;
};

export type HealthLogger = (
  hookName: string,
  exitCode: number,
  durationMs: number,
  errorMessage: string | null,
  tinybirdStatusCode: number | null
) => void;

export type HookDeps<T extends Record<string, unknown> = Record<string, unknown>> = {
  readonly client: TelemetryClient;
  readonly clock: Clock;
  readonly health: HealthLogger;
} & T;
