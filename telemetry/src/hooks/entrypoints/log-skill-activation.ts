import { lookupSessionAgent } from '@/hooks/agent-timing';
import { extractProjectName } from '@/hooks/extract-project-name';
import { parseSkillActivation } from '@/hooks/parse-skill-activation';
import { consumeScriptStart } from '@/hooks/script-timing';
import { isScriptCommand, isSkillRelatedPath } from '@/hooks/skill-path-patterns';

import type { Clock, HealthLogger, ScriptTimingStore, TimingStore } from './ports';
import {
  createClientFromEnv,
  createHealthLogger,
  extractStringField,
  isMainModule,
  readStdin,
} from './shared';

const HOOK_NAME = 'log-skill-activation';

const isRelevantSkillPath = (eventJson: string): boolean => {
  if (!eventJson.trim()) return false;
  try {
    const parsed: unknown = JSON.parse(eventJson);
    if (typeof parsed !== 'object' || parsed === null) return false;

    const toolName = (parsed as Record<string, unknown>)['tool_name'];
    const toolInput = (parsed as Record<string, unknown>)['tool_input'];
    if (typeof toolInput !== 'object' || toolInput === null) return false;

    if (toolName === 'Read') {
      const filePath = (toolInput as Record<string, unknown>)['file_path'];
      if (typeof filePath !== 'string') return false;
      return isSkillRelatedPath(filePath);
    }

    if (toolName === 'Bash') {
      const command = (toolInput as Record<string, unknown>)['command'];
      if (typeof command !== 'string') return false;
      return isScriptCommand(command);
    }

    return false;
  } catch {
    return false;
  }
};

export type LogSkillActivationDeps = {
  readonly client: import('@/client').TelemetryClient;
  readonly clock: Clock;
  readonly timing: Pick<TimingStore, 'lookupSessionAgent'>;
  readonly scriptTiming: Pick<ScriptTimingStore, 'consumeScriptStart'>;
  readonly health: HealthLogger;
};

export const runLogSkillActivation = async (
  eventJson: string,
  deps: LogSkillActivationDeps
): Promise<void> => {
  const startTime = deps.clock.now();

  // Fast path: skip irrelevant events and malformed stdin without any health event.
  // Empty/truncated stdin from Claude Code is not a hook failure — exit silently.
  if (!isRelevantSkillPath(eventJson)) {
    return;
  }

  try {
    const sessionId = extractStringField(eventJson, 'session_id');
    const agentType = sessionId ? deps.timing.lookupSessionAgent(sessionId) : null;
    const cwd = extractStringField(eventJson, 'cwd');
    const projectName = extractProjectName(cwd ?? undefined);
    const row = parseSkillActivation(eventJson, agentType, projectName);

    if (!row) {
      return;
    }

    const hookEventName = extractStringField(eventJson, 'hook_event_name');
    const withFailure = hookEventName === 'PostToolUseFailure' ? { ...row, success: 0 } : row;

    const finalRow =
      withFailure.entity_type === 'script'
        ? applyScriptTiming(withFailure, eventJson, deps)
        : withFailure;

    await deps.client.ingest.skillActivations(finalRow);

    const durationMs = deps.clock.now() - startTime;
    deps.health(HOOK_NAME, 0, durationMs, null, null);
  } catch (error) {
    const durationMs = deps.clock.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    deps.health(HOOK_NAME, 1, durationMs, errorMessage, null);
  }
};

const applyScriptTiming = (
  row: import('@/datasources').SkillActivationRow,
  eventJson: string,
  deps: Pick<LogSkillActivationDeps, 'clock' | 'scriptTiming'>
): import('@/datasources').SkillActivationRow => {
  const toolUseId = extractStringField(eventJson, 'tool_use_id');
  if (!toolUseId) return row;

  const nowMs = deps.clock.now();
  const startMs = deps.scriptTiming.consumeScriptStart(toolUseId, nowMs);
  if (startMs === null) return row;

  return { ...row, duration_ms: nowMs - startMs };
};

if (isMainModule(import.meta.url)) {
  void readStdin().then((eventJson) => {
    const client = createClientFromEnv();
    if (!client) return;

    return runLogSkillActivation(eventJson, {
      client,
      clock: { now: Date.now },
      timing: { lookupSessionAgent },
      scriptTiming: { consumeScriptStart },
      health: createHealthLogger(client),
    });
  });
}
