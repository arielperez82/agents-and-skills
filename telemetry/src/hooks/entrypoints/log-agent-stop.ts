import * as fs from 'node:fs';

import { parseAgentStop } from '@/hooks/parse-agent-stop';

import { createClientFromEnv, logHealthEvent, readStdin } from './shared';

const HOOK_NAME = 'log-agent-stop';

const readTranscriptPath = (eventJson: string): string | null => {
  try {
    const parsed: unknown = JSON.parse(eventJson);
    if (typeof parsed !== 'object' || parsed === null) return null;
    const transcriptPath = (parsed as Record<string, unknown>)['agent_transcript_path'];
    return typeof transcriptPath === 'string' ? transcriptPath : null;
  } catch {
    return null;
  }
};

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
    const transcriptPath = readTranscriptPath(eventJson);
    const transcriptContent = readTranscriptContent(transcriptPath);
    const row = parseAgentStop(eventJson, transcriptContent);
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
  void readStdin().then(runLogAgentStop);
}
