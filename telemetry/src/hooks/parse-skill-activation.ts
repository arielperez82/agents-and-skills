import * as path from 'node:path';

import { z } from 'zod';

import type { SkillActivationRow } from '@/datasources';
import {
  COMMAND_PATH_PATTERN,
  REFERENCE_PATH_PATTERN,
  SCRIPT_PATH_PATTERN,
  SKILL_PATH_PATTERN,
} from '@/hooks/skill-path-patterns';

export const postToolUseSchema = z.object({
  session_id: z.string(),
  tool_name: z.string(),
  tool_input: z.unknown(),
  tool_response: z.unknown().optional(),
  tool_use_id: z.string().optional(),
  cwd: z.string().optional(),
  transcript_path: z.string().optional(),
  permission_mode: z.string().optional(),
  hook_event_name: z.string().optional(),
});

export const readToolInputSchema = z.object({
  file_path: z.string(),
});

export const bashToolInputSchema = z.object({
  command: z.string(),
});

type SkillInfo = {
  readonly skill_name: string;
  readonly entity_type: 'skill' | 'command' | 'reference' | 'script';
  readonly parent_skill: string | null;
  readonly resource_path: string;
};

const extractSkillInfo = (filePath: string): SkillInfo | null => {
  const skillMatch = SKILL_PATH_PATTERN.exec(filePath);
  if (skillMatch?.[1]) {
    return {
      skill_name: skillMatch[1],
      entity_type: 'skill',
      parent_skill: null,
      resource_path: '',
    };
  }

  const commandMatch = COMMAND_PATH_PATTERN.exec(filePath);
  if (commandMatch?.[1]) {
    return {
      skill_name: commandMatch[1],
      entity_type: 'command',
      parent_skill: null,
      resource_path: '',
    };
  }

  const referenceMatch = REFERENCE_PATH_PATTERN.exec(filePath);
  if (referenceMatch?.[1] && referenceMatch[2]) {
    const filename = referenceMatch[2];
    return {
      skill_name: filename.replace(/\.md$/, ''),
      entity_type: 'reference',
      parent_skill: referenceMatch[1],
      resource_path: `references/${filename}`,
    };
  }

  return null;
};

const extractScriptInfo = (command: string): SkillInfo | null => {
  if (!command.includes('/skills/') || !command.includes('/scripts/')) {
    return null;
  }

  const scriptMatch = SCRIPT_PATH_PATTERN.exec(command);
  if (!scriptMatch?.[1] || !scriptMatch[2]) {
    return null;
  }

  const filename = scriptMatch[2];
  return {
    skill_name: path.parse(filename).name,
    entity_type: 'script',
    parent_skill: scriptMatch[1],
    resource_path: `scripts/${filename}`,
  };
};

const extractSuccess = (toolResponse: unknown): number => {
  if (
    typeof toolResponse === 'object' &&
    toolResponse !== null &&
    'success' in toolResponse &&
    typeof toolResponse.success === 'boolean'
  ) {
    return toolResponse.success ? 1 : 0;
  }
  return 1;
};

type PostToolUseEvent = z.infer<typeof postToolUseSchema>;

const resolveSkillInfo = (event: PostToolUseEvent): SkillInfo | null => {
  if (event.tool_name === 'Read') {
    const inputResult = readToolInputSchema.safeParse(event.tool_input);
    if (!inputResult.success) {
      return null;
    }
    return extractSkillInfo(inputResult.data.file_path);
  }

  if (event.tool_name === 'Bash') {
    const inputResult = bashToolInputSchema.safeParse(event.tool_input);
    if (!inputResult.success) {
      return null;
    }
    return extractScriptInfo(inputResult.data.command);
  }

  return null;
};

export const parseSkillActivation = (
  eventJson: string,
  agentType: string | null = null,
  projectName: string = ''
): SkillActivationRow | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(eventJson);
  } catch {
    return null;
  }

  const result = postToolUseSchema.safeParse(parsed);
  if (!result.success) return null;
  const event = result.data;

  const skillInfo = resolveSkillInfo(event);
  if (!skillInfo) {
    return null;
  }

  return {
    timestamp: new Date().toISOString(),
    session_id: event.session_id,
    skill_name: skillInfo.skill_name,
    entity_type: skillInfo.entity_type,
    agent_type: agentType,
    parent_skill: skillInfo.parent_skill,
    resource_path: skillInfo.resource_path,
    duration_ms: 0,
    success: extractSuccess(event.tool_response),
    project_name: projectName,
  };
};
