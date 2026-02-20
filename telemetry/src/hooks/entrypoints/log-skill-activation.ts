import { lookupSessionAgent } from '@/hooks/agent-timing';
import { parseSkillActivation } from '@/hooks/parse-skill-activation';

import type { Clock, HealthLogger, TimingStore } from './ports';
import { createClientFromEnv, extractStringField, logHealthEvent, readStdin } from './shared';

const HOOK_NAME = 'log-skill-activation';

// These patterns must match parse-skill-activation.ts exactly to avoid divergence
const SKILL_PATH_PATTERN = /\/skills\/[^/]+\/([^/]+)\/SKILL\.md$/;
const COMMAND_PATH_PATTERN = /\/commands\/([^/]+\/[^/]+)\.md$/;

const isSkillOrCommandPath = (eventJson: string): boolean => {
  if (!eventJson.trim()) return false;
  try {
    const parsed: unknown = JSON.parse(eventJson);
    if (typeof parsed !== 'object' || parsed === null) return false;
    const toolInput = (parsed as Record<string, unknown>)['tool_input'];
    if (typeof toolInput !== 'object' || toolInput === null) return false;
    const filePath = (toolInput as Record<string, unknown>)['file_path'];
    if (typeof filePath !== 'string') return false;
    return SKILL_PATH_PATTERN.test(filePath) || COMMAND_PATH_PATTERN.test(filePath);
  } catch {
    return false;
  }
};

export type LogSkillActivationDeps = {
  readonly client: import('@/client').TelemetryClient;
  readonly clock: Clock;
  readonly timing: Pick<TimingStore, 'lookupSessionAgent'>;
  readonly health: HealthLogger;
};

export const runLogSkillActivation = async (
  eventJson: string,
  deps: LogSkillActivationDeps
): Promise<void> => {
  const startTime = deps.clock.now();

  // Fast path: skip non-skill/command reads and malformed stdin without any health event.
  // Empty/truncated stdin from Claude Code is not a hook failure — exit silently.
  if (!isSkillOrCommandPath(eventJson)) {
    return;
  }

  try {
    const sessionId = extractStringField(eventJson, 'session_id');
    const agentType = sessionId ? deps.timing.lookupSessionAgent(sessionId) : null;
    const row = parseSkillActivation(eventJson, agentType);

    if (!row) {
      return;
    }

    await deps.client.ingest.skillActivations(row);

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

    return runLogSkillActivation(eventJson, {
      client,
      clock: { now: Date.now },
      timing: { lookupSessionAgent },
      health: (hookName, exitCode, durationMs, errorMessage, statusCode) => {
        void logHealthEvent(client, hookName, exitCode, durationMs, errorMessage, statusCode);
      },
    });
  });
}
