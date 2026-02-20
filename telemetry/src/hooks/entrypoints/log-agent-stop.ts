import { consumeAgentStart, removeSessionAgent } from '@/hooks/agent-timing';
import { parseAgentStop } from '@/hooks/parse-agent-stop';

import type { Clock, FileReader, HealthLogger, TimingStore } from './ports';
import {
  createClientFromEnv,
  createFileReader,
  extractStringField,
  logHealthEvent,
  readStdin,
} from './shared';

const HOOK_NAME = 'log-agent-stop';

export type LogAgentStopDeps = {
  readonly client: import('@/client').TelemetryClient;
  readonly clock: Clock;
  readonly timing: Pick<TimingStore, 'consumeAgentStart' | 'removeSessionAgent'>;
  readonly readFile: FileReader;
  readonly health: HealthLogger;
};

export const runLogAgentStop = async (eventJson: string, deps: LogAgentStopDeps): Promise<void> => {
  const startTime = deps.clock.now();

  try {
    const transcriptPath = extractStringField(eventJson, 'agent_transcript_path');
    const transcriptContent = deps.readFile(transcriptPath);
    const agentId = extractStringField(eventJson, 'agent_id');
    const agentStartMs = agentId ? deps.timing.consumeAgentStart(agentId) : null;
    const durationMs = agentStartMs !== null ? startTime - agentStartMs : 0;
    const row = parseAgentStop(eventJson, transcriptContent, durationMs);
    const sessionId = extractStringField(eventJson, 'session_id');
    if (sessionId) deps.timing.removeSessionAgent(sessionId);

    await deps.client.ingest.agentActivations(row);

    const hookDurationMs = deps.clock.now() - startTime;
    deps.health(HOOK_NAME, 0, hookDurationMs, null, null);
  } catch (error) {
    const hookDurationMs = deps.clock.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    deps.health(HOOK_NAME, 1, hookDurationMs, errorMessage, null);
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

    return runLogAgentStop(eventJson, {
      client,
      clock: { now: Date.now },
      timing: { consumeAgentStart, removeSessionAgent },
      readFile: createFileReader(),
      health: (hookName, exitCode, durationMs, errorMessage, statusCode) => {
        void logHealthEvent(client, hookName, exitCode, durationMs, errorMessage, statusCode);
      },
    });
  });
}
