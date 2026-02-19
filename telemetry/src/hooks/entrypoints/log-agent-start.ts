import { recordAgentStart } from '@/hooks/agent-timing';
import { parseAgentStart } from '@/hooks/parse-agent-start';

import { createClientFromEnv, extractStringField, logHealthEvent, readStdin } from './shared';

const HOOK_NAME = 'log-agent-start';

export const runLogAgentStart = async (eventJson: string): Promise<void> => {
  const startTime = Date.now();
  const client = createClientFromEnv();

  if (!client) {
    return;
  }

  try {
    const row = parseAgentStart(eventJson);
    const agentId = extractStringField(eventJson, 'agent_id');
    if (agentId) recordAgentStart(agentId, startTime);
    await client.ingest.agentActivations(row);

    const durationMs = Date.now() - startTime;
    void logHealthEvent(client, HOOK_NAME, 0, durationMs, null, null);
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    void logHealthEvent(client, HOOK_NAME, 1, durationMs, errorMessage, null);
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
  void readStdin().then(runLogAgentStart);
}
