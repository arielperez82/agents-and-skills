import { z } from 'zod';

import type { SkillActivationRow } from '@/datasources';

export const postToolUseSchema = z.object({
  session_id: z.string(),
  tool_name: z.string(),
  tool_input: z.unknown(),
  success: z.boolean(),
  duration_ms: z.number(),
  timestamp: z.iso.datetime(),
});

const readToolInputSchema = z.object({
  file_path: z.string(),
});

const SKILL_PATH_PATTERN = /\/skills\/[^/]+\/([^/]+)\/SKILL\.md$/;
const COMMAND_PATH_PATTERN = /\/commands\/([^/]+\/[^/]+)\.md$/;

const extractSkillInfo = (
  filePath: string
): { skill_name: string; entity_type: 'skill' | 'command' } | null => {
  const skillMatch = SKILL_PATH_PATTERN.exec(filePath);
  if (skillMatch?.[1]) {
    return { skill_name: skillMatch[1], entity_type: 'skill' };
  }

  const commandMatch = COMMAND_PATH_PATTERN.exec(filePath);
  if (commandMatch?.[1]) {
    return { skill_name: commandMatch[1], entity_type: 'command' };
  }

  return null;
};

export const parseSkillActivation = (eventJson: string): SkillActivationRow | null => {
  const parsed: unknown = JSON.parse(eventJson);
  const event = postToolUseSchema.parse(parsed);

  if (event.tool_name !== 'Read') {
    return null;
  }

  const inputResult = readToolInputSchema.safeParse(event.tool_input);
  if (!inputResult.success) {
    return null;
  }

  const skillInfo = extractSkillInfo(inputResult.data.file_path);
  if (!skillInfo) {
    return null;
  }

  return {
    timestamp: new Date(event.timestamp),
    session_id: event.session_id,
    skill_name: skillInfo.skill_name,
    entity_type: skillInfo.entity_type,
    agent_type: null,
    duration_ms: event.duration_ms,
    success: event.success ? 1 : 0,
  };
};
