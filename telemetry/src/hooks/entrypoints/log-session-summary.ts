import { buildSessionSummary } from '@/hooks/build-session-summary';

import type { Clock, FileReader, HealthLogger } from './ports';
import {
  createClientFromEnv,
  createFileReader,
  extractStringField,
  logHealthEvent,
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

const isMainModule = (): boolean => {
  try {
    const entryPath = process.argv[1] ?? '';
    return import.meta.url === `file://${entryPath}`;
  } catch {
    return false;
  }
};

if (isMainModule()) {
  void readStdin().then((eventJson) => {
    const client = createClientFromEnv();
    if (!client) return;

    return runLogSessionSummary(eventJson, {
      client,
      clock: { now: Date.now },
      readFile: createFileReader(),
      health: (hookName, exitCode, durationMs, errorMessage, statusCode) => {
        void logHealthEvent(client, hookName, exitCode, durationMs, errorMessage, statusCode);
      },
    });
  });
}
