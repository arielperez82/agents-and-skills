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
});
