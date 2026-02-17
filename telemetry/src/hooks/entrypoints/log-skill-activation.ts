import { parseSkillActivation } from '@/hooks/parse-skill-activation';

import { createClientFromEnv, logHealthEvent, readStdin } from './shared';

const HOOK_NAME = 'log-skill-activation';

export const runLogSkillActivation = async (eventJson: string): Promise<void> => {
  const startTime = Date.now();
  const client = createClientFromEnv();

  if (!client) {
    return;
  }

  try {
    const row = parseSkillActivation(eventJson);

    if (!row) {
      return;
    }

    await client.ingest.skillActivations(row);

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
  void readStdin().then(runLogSkillActivation);
}
