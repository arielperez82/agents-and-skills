import { describe, expect, it } from 'vitest';

import { parseTranscriptAgents, type TranscriptAgentSummary } from './parse-transcript-agents';

const makeAssistantLine = (contentBlocks: readonly unknown[]): string =>
  JSON.stringify({
    type: 'assistant',
    message: {
      model: 'claude-sonnet-4-20250514',
      content: contentBlocks,
      usage: { input_tokens: 100, output_tokens: 50 },
    },
    costUSD: 0.003,
  });

const makeTaskToolUse = (subagentType: string, description = 'test task'): unknown => ({
  type: 'tool_use',
  id: 'toolu_123',
  name: 'Task',
  input: { subagent_type: subagentType, description, prompt: 'do something' },
});

const makeReadToolUse = (filePath: string): unknown => ({
  type: 'tool_use',
  id: 'toolu_456',
  name: 'Read',
  input: { file_path: filePath },
});

const makeTextBlock = (text: string): unknown => ({
  type: 'text',
  text,
});

describe('parseTranscriptAgents', () => {
  it('returns empty summary for empty transcript', () => {
    const result = parseTranscriptAgents('');

    expect(result).toEqual<TranscriptAgentSummary>({
      agents_used: [],
      skills_used: [],
      agent_count: 0,
      skill_count: 0,
    });
  });

  it('extracts agent names from Task tool_use content blocks', () => {
    const line = makeAssistantLine([makeTaskToolUse('researcher'), makeTextBlock('thinking...')]);
    const result = parseTranscriptAgents(line);

    expect(result.agents_used).toEqual(['researcher']);
    expect(result.agent_count).toBe(1);
  });

  it('extracts skill names from Read tool_use matching SKILL.md pattern', () => {
    const line = makeAssistantLine([
      makeReadToolUse('/Users/me/project/skills/engineering-team/tdd/SKILL.md'),
    ]);
    const result = parseTranscriptAgents(line);

    expect(result.skills_used).toEqual(['tdd']);
    expect(result.skill_count).toBe(1);
  });

  it('extracts command names from Read tool_use matching commands/ pattern', () => {
    const line = makeAssistantLine([
      makeReadToolUse('/Users/me/project/commands/review/review-changes.md'),
    ]);
    const result = parseTranscriptAgents(line);

    expect(result.skills_used).toEqual(['review/review-changes']);
    expect(result.skill_count).toBe(1);
  });

  it('deduplicates repeated agent and skill invocations', () => {
    const lines = [
      makeAssistantLine([makeTaskToolUse('researcher')]),
      makeAssistantLine([makeTaskToolUse('researcher')]),
      makeAssistantLine([
        makeReadToolUse('/skills/engineering-team/tdd/SKILL.md'),
        makeReadToolUse('/skills/engineering-team/tdd/SKILL.md'),
      ]),
    ].join('\n');

    const result = parseTranscriptAgents(lines);

    expect(result.agents_used).toEqual(['researcher']);
    expect(result.agent_count).toBe(1);
    expect(result.skills_used).toEqual(['tdd']);
    expect(result.skill_count).toBe(1);
  });

  it('ignores non-assistant rows', () => {
    const lines = [
      JSON.stringify({ type: 'user', message: { content: 'hello' } }),
      makeAssistantLine([makeTaskToolUse('architect')]),
    ].join('\n');

    const result = parseTranscriptAgents(lines);

    expect(result.agents_used).toEqual(['architect']);
    expect(result.agent_count).toBe(1);
  });

  it('ignores Read tool_use for non-skill/command paths', () => {
    const line = makeAssistantLine([
      makeReadToolUse('/Users/me/project/src/index.ts'),
      makeReadToolUse('/Users/me/project/package.json'),
    ]);

    const result = parseTranscriptAgents(line);

    expect(result.skills_used).toEqual([]);
    expect(result.skill_count).toBe(0);
  });

  it('handles malformed JSON lines without throwing', () => {
    const lines = ['not json {{{', makeAssistantLine([makeTaskToolUse('tdd-reviewer')])].join('\n');

    const result = parseTranscriptAgents(lines);

    expect(result.agents_used).toEqual(['tdd-reviewer']);
  });

  it('extracts both agents and skills from mixed transcript', () => {
    const lines = [
      makeAssistantLine([
        makeTaskToolUse('researcher'),
        makeReadToolUse('/skills/engineering-team/tdd/SKILL.md'),
      ]),
      makeAssistantLine([
        makeTaskToolUse('code-reviewer'),
        makeReadToolUse('/commands/review/review-changes.md'),
      ]),
    ].join('\n');

    const result = parseTranscriptAgents(lines);

    expect(result.agents_used).toEqual(expect.arrayContaining(['researcher', 'code-reviewer']));
    expect(result.agent_count).toBe(2);
    expect(result.skills_used).toEqual(expect.arrayContaining(['tdd', 'review/review-changes']));
    expect(result.skill_count).toBe(2);
  });

  it('ignores tool_use blocks that are not Task or Read', () => {
    const line = makeAssistantLine([
      {
        type: 'tool_use',
        id: 'toolu_789',
        name: 'Write',
        input: { file_path: '/Users/me/test.ts' },
      },
      { type: 'tool_use', id: 'toolu_790', name: 'Bash', input: { command: 'ls' } },
    ]);

    const result = parseTranscriptAgents(line);

    expect(result.agents_used).toEqual([]);
    expect(result.skills_used).toEqual([]);
  });

  it('ignores Task tool_use with missing input object', () => {
    const line = makeAssistantLine([{ type: 'tool_use', id: 'toolu_1', name: 'Task' }]);

    const result = parseTranscriptAgents(line);

    expect(result.agents_used).toEqual([]);
  });

  it('ignores Task tool_use with non-string subagent_type', () => {
    const line = makeAssistantLine([
      { type: 'tool_use', id: 'toolu_1', name: 'Task', input: { subagent_type: 42 } },
    ]);

    const result = parseTranscriptAgents(line);

    expect(result.agents_used).toEqual([]);
  });

  it('ignores Task tool_use with empty subagent_type', () => {
    const line = makeAssistantLine([
      { type: 'tool_use', id: 'toolu_1', name: 'Task', input: { subagent_type: '  ' } },
    ]);

    const result = parseTranscriptAgents(line);

    expect(result.agents_used).toEqual([]);
  });

  it('ignores Read tool_use with missing input', () => {
    const line = makeAssistantLine([{ type: 'tool_use', id: 'toolu_1', name: 'Read' }]);

    const result = parseTranscriptAgents(line);

    expect(result.skills_used).toEqual([]);
  });

  it('ignores Read tool_use with non-string file_path', () => {
    const line = makeAssistantLine([
      { type: 'tool_use', id: 'toolu_1', name: 'Read', input: { file_path: 42 } },
    ]);

    const result = parseTranscriptAgents(line);

    expect(result.skills_used).toEqual([]);
  });

  it('ignores non-object content blocks', () => {
    const line = makeAssistantLine([null, 42, 'string-block', true]);

    const result = parseTranscriptAgents(line);

    expect(result.agents_used).toEqual([]);
    expect(result.skills_used).toEqual([]);
  });

  it('handles assistant rows without content array gracefully', () => {
    const line = JSON.stringify({
      type: 'assistant',
      message: { model: 'claude-sonnet-4-20250514', usage: { input_tokens: 10 } },
      costUSD: 0.001,
    });

    const result = parseTranscriptAgents(line);

    expect(result.agents_used).toEqual([]);
    expect(result.skills_used).toEqual([]);
  });
});
