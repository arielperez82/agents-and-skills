import { describe, expect, it } from 'vitest';

import type { SkillActivationRow } from '@/datasources';

import { parseSkillActivation } from './parse-skill-activation';

const makeValidEvent = (overrides: Record<string, unknown> = {}) =>
  JSON.stringify({
    session_id: 'sess-abc-123',
    tool_name: 'Read',
    tool_input: {
      file_path: '/Users/dev/projects/agents-and-skills/skills/engineering-team/tdd/SKILL.md',
    },
    tool_output: 'file contents here',
    success: true,
    duration_ms: 42,
    cwd: '/Users/dev/my-project',
    timestamp: '2026-02-17T14:30:00.000Z',
    ...overrides,
  });

const expectRow = (result: SkillActivationRow | null): SkillActivationRow => {
  expect(result).not.toBeNull();
  return result as SkillActivationRow;
};

describe('parseSkillActivation', () => {
  describe('skill file reads', () => {
    it('returns SkillActivationRow for engineering-team skill read', () => {
      const result = parseSkillActivation(makeValidEvent());

      expect(result).toEqual<SkillActivationRow>({
        timestamp: new Date('2026-02-17T14:30:00.000Z'),
        session_id: 'sess-abc-123',
        skill_name: 'tdd',
        entity_type: 'skill',
        agent_type: null,
        duration_ms: 42,
        success: 1,
      });
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
      const result = parseSkillActivation(
        makeValidEvent({
          tool_input: {
            file_path: '/Users/dev/projects/agents-and-skills/commands/agent/validate.md',
          },
        })
      );

      expect(result).toEqual<SkillActivationRow>({
        timestamp: new Date('2026-02-17T14:30:00.000Z'),
        session_id: 'sess-abc-123',
        skill_name: 'agent/validate',
        entity_type: 'command',
        agent_type: null,
        duration_ms: 42,
        success: 1,
      });
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

  describe('success field mapping', () => {
    it('maps success=true to 1', () => {
      const result = expectRow(parseSkillActivation(makeValidEvent({ success: true })));

      expect(result.success).toBe(1);
    });

    it('maps success=false to 0', () => {
      const result = expectRow(
        parseSkillActivation(
          makeValidEvent({
            success: false,
            tool_input: {
              file_path: '/path/to/skills/team/tdd/SKILL.md',
            },
          })
        )
      );

      expect(result.success).toBe(0);
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
