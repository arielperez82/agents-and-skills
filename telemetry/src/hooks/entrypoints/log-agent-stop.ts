import { consumeAgentStart, removeSessionAgent } from '@/hooks/agent-timing';
import { parseAgentStop } from '@/hooks/parse-agent-stop';

import type { Clock, FileReader, HealthLogger, TimingStore } from './ports';
import {
  createClientFromEnv,
  createFileReader,
  createHealthLogger,
  extractStringField,
  isMainModule,
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

if (isMainModule(import.meta.url)) {
  void readStdin().then((eventJson) => {
    const client = createClientFromEnv();
    if (!client) return;

    return runLogAgentStop(eventJson, {
      client,
      clock: { now: Date.now },
      timing: { consumeAgentStart, removeSessionAgent },
      readFile: createFileReader(),
      health: createHealthLogger(client),
    });
  });
}
