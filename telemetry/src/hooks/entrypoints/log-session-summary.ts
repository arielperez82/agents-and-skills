import { buildSessionSummary } from '@/hooks/build-session-summary';

import type { Clock, FileReader, HealthLogger } from './ports';
import {
  createClientFromEnv,
  createFileReader,
  createHealthLogger,
  extractStringField,
  isMainModule,
  readStdin,
} from './shared';

const HOOK_NAME = 'log-session-summary';

export type LogSessionSummaryDeps = {
  readonly client: import('@/client').TelemetryClient;
  readonly clock: Clock;
  readonly readFile: FileReader;
  readonly health: HealthLogger;
};

export const runLogSessionSummary = async (
  eventJson: string,
  deps: LogSessionSummaryDeps
): Promise<void> => {
  const startTime = deps.clock.now();

  try {
    const transcriptPath = extractStringField(eventJson, 'transcript_path');
    const transcriptContent = deps.readFile(transcriptPath);
    const row = buildSessionSummary(eventJson, transcriptContent);

    await deps.client.ingest.sessionSummaries(row);

    const durationMs = deps.clock.now() - startTime;
    deps.health(HOOK_NAME, 0, durationMs, null, null);
  } catch (error) {
    const durationMs = deps.clock.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    deps.health(HOOK_NAME, 1, durationMs, errorMessage, null);
  }
};

if (isMainModule(import.meta.url)) {
  void readStdin().then((eventJson) => {
    const client = createClientFromEnv();
    if (!client) return;

    return runLogSessionSummary(eventJson, {
      client,
      clock: { now: Date.now },
      readFile: createFileReader(),
      health: createHealthLogger(client),
    });
  });
}
