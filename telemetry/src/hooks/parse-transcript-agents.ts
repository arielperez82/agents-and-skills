import * as path from 'node:path';

import {
  COMMAND_PATH_PATTERN,
  REFERENCE_PATH_PATTERN,
  SCRIPT_PATH_PATTERN,
  SKILL_PATH_PATTERN,
} from '@/hooks/skill-path-patterns';

export type TranscriptAgentSummary = {
  readonly agents_used: readonly string[];
  readonly skills_used: readonly string[];
  readonly agent_count: number;
  readonly skill_count: number;
};

const EMPTY_SUMMARY: TranscriptAgentSummary = {
  agents_used: [],
  skills_used: [],
  agent_count: 0,
  skill_count: 0,
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const extractContentBlocks = (parsed: unknown): readonly unknown[] => {
  if (!isRecord(parsed)) return [];
  const message = parsed['message'];
  if (!isRecord(message)) return [];
  const content = message['content'];
  return Array.isArray(content) ? (content as unknown[]) : [];
};

const extractAgentType = (block: unknown): string | null => {
  if (!isRecord(block)) return null;
  if (block['type'] !== 'tool_use' || block['name'] !== 'Task') return null;
  const input = block['input'];
  if (!isRecord(input)) return null;
  const subagentType = input['subagent_type'];
  return typeof subagentType === 'string' && subagentType.trim() ? subagentType : null;
};

const extractSkillName = (block: unknown): string | null => {
  if (!isRecord(block)) return null;
  if (block['type'] !== 'tool_use' || block['name'] !== 'Read') return null;
  const input = block['input'];
  if (!isRecord(input)) return null;
  const filePath = input['file_path'];
  if (typeof filePath !== 'string') return null;

  const skillMatch = SKILL_PATH_PATTERN.exec(filePath);
  if (skillMatch?.[1]) return skillMatch[1];

  const cmdMatch = COMMAND_PATH_PATTERN.exec(filePath);
  if (cmdMatch?.[1]) return cmdMatch[1];

  const refMatch = REFERENCE_PATH_PATTERN.exec(filePath);
  if (refMatch?.[2]) return path.parse(refMatch[2]).name;

  return null;
};

const extractScriptName = (block: unknown): string | null => {
  if (!isRecord(block)) return null;
  if (block['type'] !== 'tool_use' || block['name'] !== 'Bash') return null;
  const input = block['input'];
  if (!isRecord(input)) return null;
  const command = input['command'];
  if (typeof command !== 'string') return null;

  const scriptMatch = SCRIPT_PATH_PATTERN.exec(command);
  if (scriptMatch?.[2]) return path.parse(scriptMatch[2]).name;

  return null;
};

const tryParseAssistantLine = (line: string): Record<string, unknown> | null => {
  const trimmed = line.trim();
  if (!trimmed) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!isRecord(parsed) || parsed['type'] !== 'assistant') return null;
    return parsed;
  } catch {
    return null;
  }
};

const collectFromBlocks = (
  blocks: readonly unknown[],
  agentSet: Set<string>,
  skillSet: Set<string>
): void => {
  for (const block of blocks) {
    const agentType = extractAgentType(block);
    if (agentType) {
      agentSet.add(agentType);
      continue;
    }

    const skillName = extractSkillName(block);
    if (skillName) {
      skillSet.add(skillName);
      continue;
    }

    const scriptName = extractScriptName(block);
    if (scriptName) {
      skillSet.add(scriptName);
    }
  }
};

export const parseTranscriptAgents = (content: string): TranscriptAgentSummary => {
  if (!content.trim()) return EMPTY_SUMMARY;

  const agentSet = new Set<string>();
  const skillSet = new Set<string>();

  for (const line of content.split('\n')) {
    const parsed = tryParseAssistantLine(line);
    if (!parsed) continue;

    const blocks = extractContentBlocks(parsed);
    collectFromBlocks(blocks, agentSet, skillSet);
  }

  return {
    agents_used: [...agentSet],
    skills_used: [...skillSet],
    agent_count: agentSet.size,
    skill_count: skillSet.size,
  };
};
