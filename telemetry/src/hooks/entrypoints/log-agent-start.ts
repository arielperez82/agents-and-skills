import { recordAgentStart, recordSessionAgent } from '@/hooks/agent-timing';
import { parseAgentStart } from '@/hooks/parse-agent-start';

import type { Clock, HealthLogger, TimingStore } from './ports';
import { createClientFromEnv, extractStringField, logHealthEvent, readStdin } from './shared';

const HOOK_NAME = 'log-agent-start';

export type LogAgentStartDeps = {
  readonly client: import('@/client').TelemetryClient;
  readonly clock: Clock;
  readonly timing: Pick<TimingStore, 'recordAgentStart' | 'recordSessionAgent'>;
  readonly health: HealthLogger;
};

export const runLogAgentStart = async (
  eventJson: string,
  deps: LogAgentStartDeps
): Promise<void> => {
  const startTime = deps.clock.now();

  try {
    const row = parseAgentStart(eventJson);
    const agentId = extractStringField(eventJson, 'agent_id');
    const sessionId = extractStringField(eventJson, 'session_id');
    const agentType = extractStringField(eventJson, 'agent_type');
    if (agentId) deps.timing.recordAgentStart(agentId, startTime);
    if (sessionId && agentType) deps.timing.recordSessionAgent(sessionId, agentType);

    await deps.client.ingest.agentActivations(row);

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

    return runLogAgentStart(eventJson, {
      client,
      clock: { now: Date.now },
      timing: { recordAgentStart, recordSessionAgent },
      health: (hookName, exitCode, durationMs, errorMessage, statusCode) => {
        void logHealthEvent(client, hookName, exitCode, durationMs, errorMessage, statusCode);
      },
    });
  });
}
