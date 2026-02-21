import { createStubClient } from '@tests/helpers/stub-client';
import { describe, expect, it, vi } from 'vitest';

import type { LogSkillActivationDeps } from './log-skill-activation';
import { runLogSkillActivation } from './log-skill-activation';

const makeSkillEvent = (overrides?: Record<string, unknown>) =>
  JSON.stringify({
    session_id: 'sess-1',
    tool_name: 'Read',
    tool_input: { file_path: '/Users/test/skills/engineering-team/tdd/SKILL.md' },
    tool_response: { filePath: '/Users/test/skills/engineering-team/tdd/SKILL.md', success: true },
    tool_use_id: 'toolu_01ABC',
    cwd: '/Users/test/project',
    transcript_path: '/Users/test/.claude/projects/transcript.jsonl',
    permission_mode: 'default',
    hook_event_name: 'PostToolUse',
    ...overrides,
  });

const makeNonSkillEvent = () =>
  JSON.stringify({
    session_id: 'sess-1',
    tool_name: 'Read',
    tool_input: { file_path: '/Users/test/src/index.ts' },
    tool_response: { filePath: '/Users/test/src/index.ts', success: true },
    tool_use_id: 'toolu_01DEF',
    cwd: '/Users/test/project',
    transcript_path: '/Users/test/.claude/projects/transcript.jsonl',
    permission_mode: 'default',
    hook_event_name: 'PostToolUse',
  });

const makeDeps = (overrides?: Partial<LogSkillActivationDeps>): LogSkillActivationDeps => ({
  client: createStubClient(),
  clock: { now: vi.fn().mockReturnValue(1000) },
  timing: { lookupSessionAgent: vi.fn().mockReturnValue(null) },
  scriptTiming: { consumeScriptStart: vi.fn().mockReturnValue(null) },
  health: vi.fn(),
  ...overrides,
});

describe('runLogSkillActivation', () => {
  it('ingests skill activation for skill file reads', async () => {
    const deps = makeDeps();

    await runLogSkillActivation(makeSkillEvent(), deps);

    expect(deps.client.ingest.skillActivations).toHaveBeenCalledOnce();
  });

  it('skips ingest for non-skill file reads', async () => {
    const deps = makeDeps();

    await runLogSkillActivation(makeNonSkillEvent(), deps);

    expect(deps.client.ingest.skillActivations).not.toHaveBeenCalled();
  });

  it('does not throw on invalid event JSON', async () => {
    const deps = makeDeps();

    await expect(runLogSkillActivation('not json', deps)).resolves.not.toThrow();
  });

  it('exits silently for empty stdin with no health event', async () => {
    const deps = makeDeps();

    await runLogSkillActivation('', deps);

    expect(deps.client.ingest.skillActivations).not.toHaveBeenCalled();
    expect(deps.health).not.toHaveBeenCalled();
  });

  it('exits silently for truncated JSON with no health event', async () => {
    const deps = makeDeps();

    await runLogSkillActivation('truncated {', deps);

    expect(deps.client.ingest.skillActivations).not.toHaveBeenCalled();
    expect(deps.health).not.toHaveBeenCalled();
  });

  it('exits silently for non-skill file reads with no health event', async () => {
    const deps = makeDeps();

    await runLogSkillActivation(makeNonSkillEvent(), deps);

    expect(deps.health).not.toHaveBeenCalled();
  });

  it('logs success health event for skill file reads', async () => {
    const now = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1080);
    const deps = makeDeps({ clock: { now } });

    await runLogSkillActivation(makeSkillEvent(), deps);

    expect(deps.health).toHaveBeenCalledWith('log-skill-activation', 0, 80, null, null);
  });

  it('includes agent_type from session context lookup', async () => {
    const deps = makeDeps({
      timing: { lookupSessionAgent: vi.fn().mockReturnValue('tdd-reviewer') },
    });

    await runLogSkillActivation(makeSkillEvent(), deps);

    expect(deps.timing.lookupSessionAgent).toHaveBeenCalledWith('sess-1');
    expect(deps.client.ingest.skillActivations).toHaveBeenCalledOnce();
  });

  it('sends null agent_type when no session context exists', async () => {
    const deps = makeDeps();

    await runLogSkillActivation(makeSkillEvent(), deps);

    expect(deps.timing.lookupSessionAgent).toHaveBeenCalledWith('sess-1');
    expect(deps.client.ingest.skillActivations).toHaveBeenCalledOnce();
  });

  it('extracts project_name from cwd and passes to parser', async () => {
    const deps = makeDeps();
    const event = makeSkillEvent({ cwd: '/Users/test/projects/my-cool-project' });

    await runLogSkillActivation(event, deps);

    expect(deps.client.ingest.skillActivations).toHaveBeenCalledWith(
      expect.objectContaining({ project_name: 'my-cool-project' }) as Record<string, unknown>
    );
  });

  it('defaults project_name to empty string when cwd is missing', async () => {
    const deps = makeDeps();
    const event = makeSkillEvent({ cwd: undefined });

    await runLogSkillActivation(event, deps);

    expect(deps.client.ingest.skillActivations).toHaveBeenCalledWith(
      expect.objectContaining({ project_name: '' }) as Record<string, unknown>
    );
  });

  it('ingests reference file reads through the fast-path guard', async () => {
    const deps = makeDeps();
    const event = makeSkillEvent({
      tool_input: {
        file_path:
          '/Users/test/skills/engineering-team/typescript-strict/references/async-patterns.md',
      },
    });

    await runLogSkillActivation(event, deps);

    expect(deps.client.ingest.skillActivations).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: 'reference',
        parent_skill: 'typescript-strict',
        skill_name: 'async-patterns',
      }) as Record<string, unknown>
    );
  });

  it('ingests script Bash events through the fast-path guard', async () => {
    const deps = makeDeps();
    const event = makeSkillEvent({
      tool_name: 'Bash',
      tool_input: {
        command:
          'python /Users/test/skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py --velocity 23',
      },
    });

    await runLogSkillActivation(event, deps);

    expect(deps.client.ingest.skillActivations).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: 'script',
        parent_skill: 'agile-coach',
        skill_name: 'sprint_metrics_calculator',
      }) as Record<string, unknown>
    );
  });

  it('skips non-script Bash events silently', async () => {
    const deps = makeDeps();
    const event = makeSkillEvent({
      tool_name: 'Bash',
      tool_input: { command: 'npm test' },
    });

    await runLogSkillActivation(event, deps);

    expect(deps.client.ingest.skillActivations).not.toHaveBeenCalled();
    expect(deps.health).not.toHaveBeenCalled();
  });

  it('sets success to 0 for PostToolUseFailure script events', async () => {
    const deps = makeDeps();
    const event = makeSkillEvent({
      tool_name: 'Bash',
      tool_input: {
        command:
          'python /Users/test/skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py',
      },
      hook_event_name: 'PostToolUseFailure',
    });

    await runLogSkillActivation(event, deps);

    expect(deps.client.ingest.skillActivations).toHaveBeenCalledWith(
      expect.objectContaining({
        entity_type: 'script',
        success: 0,
      }) as Record<string, unknown>
    );
  });

  it('S-6.2: skips PostToolUseFailure for non-script Bash events', async () => {
    const deps = makeDeps();
    const event = makeSkillEvent({
      tool_name: 'Bash',
      tool_input: { command: 'rm -rf /nonexistent' },
      hook_event_name: 'PostToolUseFailure',
    });

    await runLogSkillActivation(event, deps);

    expect(deps.client.ingest.skillActivations).not.toHaveBeenCalled();
  });

  it('preserves success=1 for PostToolUse events (normal)', async () => {
    const deps = makeDeps();
    const event = makeSkillEvent({
      tool_name: 'Bash',
      tool_input: {
        command:
          'python /Users/test/skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py',
      },
      hook_event_name: 'PostToolUse',
    });

    await runLogSkillActivation(event, deps);

    expect(deps.client.ingest.skillActivations).toHaveBeenCalledWith(
      expect.objectContaining({
        success: 1,
      }) as Record<string, unknown>
    );
  });

  it('exits without ingest when parseSkillActivation returns null', async () => {
    const deps = makeDeps();

    await runLogSkillActivation(makeSkillEvent({ tool_name: 'Write' }), deps);

    expect(deps.client.ingest.skillActivations).not.toHaveBeenCalled();
  });

  it('logs failure health event when ingest throws', async () => {
    const client = createStubClient({
      ingest: { skillActivations: vi.fn().mockRejectedValue(new Error('ingest failed')) },
    });
    const deps = makeDeps({ client });

    await runLogSkillActivation(makeSkillEvent(), deps);

    expect(deps.health).toHaveBeenCalledWith(
      'log-skill-activation',
      1,
      expect.any(Number) as number,
      'ingest failed',
      null
    );
  });

  describe('script timing integration', () => {
    it('computes duration_ms for script events when timing file exists', async () => {
      const now = vi.fn().mockReturnValue(5000);
      const consumeScriptStart = vi.fn().mockReturnValue(3000);
      const deps = makeDeps({
        clock: { now },
        scriptTiming: { consumeScriptStart },
      });
      const event = makeSkillEvent({
        tool_name: 'Bash',
        tool_input: {
          command:
            'python /Users/test/skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py',
        },
        tool_use_id: 'toolu_01XYZ',
      });

      await runLogSkillActivation(event, deps);

      expect(consumeScriptStart).toHaveBeenCalledWith('toolu_01XYZ', 5000);
      expect(deps.client.ingest.skillActivations).toHaveBeenCalledWith(
        expect.objectContaining({
          entity_type: 'script',
          duration_ms: 2000,
        }) as Record<string, unknown>
      );
    });

    it('keeps duration_ms at 0 for script events when timing file is missing', async () => {
      const deps = makeDeps({
        scriptTiming: { consumeScriptStart: vi.fn().mockReturnValue(null) },
      });
      const event = makeSkillEvent({
        tool_name: 'Bash',
        tool_input: {
          command:
            'python /Users/test/skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py',
        },
        tool_use_id: 'toolu_01XYZ',
      });

      await runLogSkillActivation(event, deps);

      expect(deps.client.ingest.skillActivations).toHaveBeenCalledWith(
        expect.objectContaining({
          entity_type: 'script',
          duration_ms: 0,
        }) as Record<string, unknown>
      );
    });

    it('S-6.1: computes duration_ms for failed script (PostToolUseFailure) with timing', async () => {
      const now = vi.fn().mockReturnValue(8000);
      const consumeScriptStart = vi.fn().mockReturnValue(6500);
      const deps = makeDeps({
        clock: { now },
        scriptTiming: { consumeScriptStart },
      });
      const event = makeSkillEvent({
        tool_name: 'Bash',
        tool_input: {
          command:
            'python /Users/test/skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py',
        },
        tool_use_id: 'toolu_01FAIL',
        hook_event_name: 'PostToolUseFailure',
      });

      await runLogSkillActivation(event, deps);

      expect(deps.client.ingest.skillActivations).toHaveBeenCalledWith(
        expect.objectContaining({
          entity_type: 'script',
          success: 0,
          duration_ms: 1500,
        }) as Record<string, unknown>
      );
    });

    it('S-6.3: second duplicate event gets duration_ms 0 (timing consumed on first)', async () => {
      const consumeScriptStart = vi.fn().mockReturnValueOnce(3000).mockReturnValueOnce(null);
      const deps = makeDeps({
        clock: { now: vi.fn().mockReturnValue(5000) },
        scriptTiming: { consumeScriptStart },
      });
      const event = makeSkillEvent({
        tool_name: 'Bash',
        tool_input: {
          command:
            'python /Users/test/skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py',
        },
        tool_use_id: 'toolu_01DUP',
      });

      await runLogSkillActivation(event, deps);
      await runLogSkillActivation(event, deps);

      const calls = vi.mocked(deps.client.ingest.skillActivations).mock.calls;
      expect(calls[0]?.[0]).toEqual(expect.objectContaining({ duration_ms: 2000 }));
      expect(calls[1]?.[0]).toEqual(expect.objectContaining({ duration_ms: 0 }));
    });

    it('does not attempt timing lookup for skill (Read) events', async () => {
      const consumeScriptStart = vi.fn();
      const deps = makeDeps({ scriptTiming: { consumeScriptStart } });

      await runLogSkillActivation(makeSkillEvent(), deps);

      expect(consumeScriptStart).not.toHaveBeenCalled();
    });

    it('does not attempt timing lookup for command events', async () => {
      const consumeScriptStart = vi.fn();
      const deps = makeDeps({ scriptTiming: { consumeScriptStart } });
      const event = makeSkillEvent({
        tool_input: { file_path: '/Users/test/commands/git/cm.md' },
      });

      await runLogSkillActivation(event, deps);

      expect(consumeScriptStart).not.toHaveBeenCalled();
    });

    it('does not attempt timing lookup for reference events', async () => {
      const consumeScriptStart = vi.fn();
      const deps = makeDeps({ scriptTiming: { consumeScriptStart } });
      const event = makeSkillEvent({
        tool_input: {
          file_path:
            '/Users/test/skills/engineering-team/typescript-strict/references/async-patterns.md',
        },
      });

      await runLogSkillActivation(event, deps);

      expect(consumeScriptStart).not.toHaveBeenCalled();
    });
  });
});
