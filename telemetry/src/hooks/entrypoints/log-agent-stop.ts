import * as fs from 'node:fs';

import { consumeAgentStart, removeSessionAgent } from '@/hooks/agent-timing';
import { parseAgentStop } from '@/hooks/parse-agent-stop';

import { createClientFromEnv, extractStringField, logHealthEvent, readStdin } from './shared';

const HOOK_NAME = 'log-agent-stop';

const readTranscriptContent = (transcriptPath: string | null): string => {
  if (!transcriptPath) return '';
  try {
    return fs.readFileSync(transcriptPath, 'utf-8');
  } catch {
    return '';
  }
};

export const runLogAgentStop = async (eventJson: string): Promise<void> => {
  const startTime = Date.now();
  const client = createClientFromEnv();

  if (!client) {
    return;
  }

  try {
    const transcriptPath = extractStringField(eventJson, 'agent_transcript_path');
    const transcriptContent = readTranscriptContent(transcriptPath);
    const agentId = extractStringField(eventJson, 'agent_id');
    const agentStartMs = agentId ? consumeAgentStart(agentId) : null;
    const durationMs = agentStartMs !== null ? startTime - agentStartMs : 0;
    const row = parseAgentStop(eventJson, transcriptContent, durationMs);
    const sessionId = extractStringField(eventJson, 'session_id');
    if (sessionId) removeSessionAgent(sessionId);
    await client.ingest.agentActivations(row);

    const hookDurationMs = Date.now() - startTime;
    void logHealthEvent(client, HOOK_NAME, 0, hookDurationMs, null, null);
  } catch (error) {
    const hookDurationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    void logHealthEvent(client, HOOK_NAME, 1, hookDurationMs, errorMessage, null);
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
  void readStdin().then(runLogAgentStop);
}
