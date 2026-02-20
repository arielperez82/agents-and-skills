import { describe, expect, it, vi } from 'vitest';

import type { SkillActivationRow } from '@/datasources';

import { parseSkillActivation } from './parse-skill-activation';

const makeValidEvent = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    session_id: 'sess-abc-123',
    tool_name: 'Read',
    tool_input: {
      file_path: '/Users/dev/projects/agents-and-skills/skills/engineering-team/tdd/SKILL.md',
    },
    tool_response: {
      filePath: '/Users/dev/projects/agents-and-skills/skills/engineering-team/tdd/SKILL.md',
      success: true,
    },
    tool_use_id: 'toolu_01ABC123',
    cwd: '/Users/dev/my-project',
    transcript_path: '/Users/dev/.claude/projects/transcript.jsonl',
    permission_mode: 'default',
    hook_event_name: 'PostToolUse',
    ...overrides,
  });

const expectRow = (result: SkillActivationRow | null): SkillActivationRow => {
  expect(result).not.toBeNull();
  return result as SkillActivationRow;
};

describe('parseSkillActivation', () => {
  describe('skill file reads', () => {
    it('returns SkillActivationRow for engineering-team skill read', () => {
      const now = new Date('2026-02-18T10:00:00.000Z');
      vi.setSystemTime(now);

      const result = parseSkillActivation(makeValidEvent());

      expect(result).toEqual<SkillActivationRow>({
        timestamp: now.toISOString(),
        session_id: 'sess-abc-123',
        skill_name: 'tdd',
        entity_type: 'skill',
        agent_type: null,
        duration_ms: 0,
        success: 1,
      });

      vi.useRealTimers();
    });

    it('extracts skill name from agent-development-team path', () => {
      const result = expectRow(
        parseSkillActivation(
          makeValidEvent({
            tool_input: {
              file_path:
                '/Users/dev/projects/agents-and-skills/skills/agent-development-team/creating-agents/SKILL.md',
            },
          })
        )
      );

      expect(result.skill_name).toBe('creating-agents');
      expect(result.entity_type).toBe('skill');
    });

    it('extracts skill name from deeply nested skill path', () => {
      const result = expectRow(
        parseSkillActivation(
          makeValidEvent({
            tool_input: {
              file_path: '/some/other/path/skills/some-team/my-skill/SKILL.md',
            },
          })
        )
      );

      expect(result.skill_name).toBe('my-skill');
      expect(result.entity_type).toBe('skill');
    });
  });

  describe('command file reads', () => {
    it('returns SkillActivationRow for command read with entity_type command', () => {
      const now = new Date('2026-02-18T10:00:00.000Z');
      vi.setSystemTime(now);

      const result = parseSkillActivation(
        makeValidEvent({
          tool_input: {
            file_path: '/Users/dev/projects/agents-and-skills/commands/agent/validate.md',
          },
        })
      );

      expect(result).toEqual<SkillActivationRow>({
        timestamp: now.toISOString(),
        session_id: 'sess-abc-123',
        skill_name: 'agent/validate',
        entity_type: 'command',
        agent_type: null,
        duration_ms: 0,
        success: 1,
      });

      vi.useRealTimers();
    });

    it('extracts command path for review/review-changes', () => {
      const result = expectRow(
        parseSkillActivation(
          makeValidEvent({
            tool_input: {
              file_path: '/Users/dev/projects/agents-and-skills/commands/review/review-changes.md',
            },
          })
        )
      );

      expect(result.skill_name).toBe('review/review-changes');
      expect(result.entity_type).toBe('command');
    });
  });

  describe('non-matching paths', () => {
    it('returns null for a Read of a non-skill file', () => {
      const result = parseSkillActivation(
        makeValidEvent({
          tool_input: {
            file_path: '/Users/dev/projects/agents-and-skills/src/index.ts',
          },
        })
      );

      expect(result).toBeNull();
    });

    it('returns null for a Read of a random markdown file', () => {
      const result = parseSkillActivation(
        makeValidEvent({
          tool_input: {
            file_path: '/Users/dev/projects/agents-and-skills/README.md',
          },
        })
      );

      expect(result).toBeNull();
    });
  });

  describe('non-Read tool usage', () => {
    it('returns null when tool_name is Write', () => {
      const result = parseSkillActivation(
        makeValidEvent({
          tool_name: 'Write',
          tool_input: {
            file_path: '/Users/dev/skills/engineering-team/tdd/SKILL.md',
            content: 'some content',
          },
        })
      );

      expect(result).toBeNull();
    });

    it('returns null when tool_name is Bash', () => {
      const result = parseSkillActivation(
        makeValidEvent({
          tool_name: 'Bash',
          tool_input: { command: 'ls' },
        })
      );

      expect(result).toBeNull();
    });
  });

  describe('missing or invalid fields', () => {
    it('returns null when tool_input has no file_path', () => {
      const result = parseSkillActivation(
        makeValidEvent({
          tool_input: { command: 'ls' },
        })
      );

      expect(result).toBeNull();
    });

    it('returns null when tool_input is a string', () => {
      const result = parseSkillActivation(
        makeValidEvent({
          tool_input: 'not an object',
        })
      );

      expect(result).toBeNull();
    });
  });

  describe('success extraction from tool_response', () => {
    it('extracts success=true from tool_response', () => {
      const result = expectRow(
        parseSkillActivation(
          makeValidEvent({
            tool_response: { success: true },
          })
        )
      );

      expect(result.success).toBe(1);
    });

    it('extracts success=false from tool_response', () => {
      const result = expectRow(
        parseSkillActivation(
          makeValidEvent({
            tool_input: {
              file_path: '/path/to/skills/team/tdd/SKILL.md',
            },
            tool_response: { success: false },
          })
        )
      );

      expect(result.success).toBe(0);
    });

    it('defaults to success=1 when tool_response has no success field', () => {
      const result = expectRow(
        parseSkillActivation(
          makeValidEvent({
            tool_response: { filePath: '/some/path' },
          })
        )
      );

      expect(result.success).toBe(1);
    });

    it('defaults to success=1 when tool_response is not an object', () => {
      const result = expectRow(
        parseSkillActivation(
          makeValidEvent({
            tool_response: 'some string response',
          })
        )
      );

      expect(result.success).toBe(1);
    });
  });

  describe('malformed JSON', () => {
    it('throws on invalid JSON string', () => {
      expect(() => parseSkillActivation('not valid json {{')).toThrow();
    });

    it('throws on empty string', () => {
      expect(() => parseSkillActivation('')).toThrow();
    });
  });

  describe('agent_type parameter', () => {
    it('uses provided agentType in the row', () => {
      const result = expectRow(parseSkillActivation(makeValidEvent(), 'tdd-reviewer'));

      expect(result.agent_type).toBe('tdd-reviewer');
    });

    it('defaults agentType to null when not provided', () => {
      const result = expectRow(parseSkillActivation(makeValidEvent()));

      expect(result.agent_type).toBeNull();
    });
  });

  describe('forward compatibility', () => {
    it('ignores extra fields in the event payload', () => {
      const result = expectRow(
        parseSkillActivation(
          makeValidEvent({
            extra_field: 'should be ignored',
            another_field: 42,
          })
        )
      );

      expect(result.session_id).toBe('sess-abc-123');
    });
  });
});
