import { describe, expect, it, vi } from 'vitest';

import type { LogScriptStartDeps } from './log-script-start';
import { runLogScriptStart } from './log-script-start';

const makeScriptEvent = (overrides?: Record<string, unknown>) =>
  JSON.stringify({
    session_id: 'sess-1',
    tool_name: 'Bash',
    tool_input: {
      command:
        'python /Users/test/skills/delivery-team/agile-coach/scripts/sprint_metrics_calculator.py --velocity 23',
    },
    tool_use_id: 'toolu_01ABC',
    hook_event_name: 'PreToolUse',
    ...overrides,
  });

const makeDeps = (overrides?: Partial<LogScriptStartDeps>): LogScriptStartDeps => ({
  clock: { now: vi.fn().mockReturnValue(1000) },
  scriptTiming: { recordScriptStart: vi.fn() },
  health: vi.fn(),
  ...overrides,
});

describe('runLogScriptStart', () => {
  it('records script start for matching Bash command', () => {
    const deps = makeDeps();

    runLogScriptStart(makeScriptEvent(), deps);

    expect(deps.scriptTiming.recordScriptStart).toHaveBeenCalledWith('toolu_01ABC', 1000);
  });

  it('does not record for non-matching Bash command', () => {
    const deps = makeDeps();

    runLogScriptStart(makeScriptEvent({ tool_input: { command: 'npm test' } }), deps);

    expect(deps.scriptTiming.recordScriptStart).not.toHaveBeenCalled();
  });

  it('does not record for non-Bash tool', () => {
    const deps = makeDeps();

    runLogScriptStart(
      makeScriptEvent({
        tool_name: 'Read',
        tool_input: { file_path: '/Users/test/skills/engineering-team/tdd/SKILL.md' },
      }),
      deps
    );

    expect(deps.scriptTiming.recordScriptStart).not.toHaveBeenCalled();
  });

  it('does not record when tool_use_id is missing', () => {
    const deps = makeDeps();

    runLogScriptStart(makeScriptEvent({ tool_use_id: undefined }), deps);

    expect(deps.scriptTiming.recordScriptStart).not.toHaveBeenCalled();
  });

  it('exits silently for empty stdin', () => {
    const deps = makeDeps();

    runLogScriptStart('', deps);

    expect(deps.scriptTiming.recordScriptStart).not.toHaveBeenCalled();
    expect(deps.health).not.toHaveBeenCalled();
  });

  it('exits silently for invalid JSON', () => {
    const deps = makeDeps();

    runLogScriptStart('not json {', deps);

    expect(deps.scriptTiming.recordScriptStart).not.toHaveBeenCalled();
    expect(deps.health).not.toHaveBeenCalled();
  });

  it('reports health on successful recording', () => {
    const deps = makeDeps();

    runLogScriptStart(makeScriptEvent(), deps);

    expect(deps.health).toHaveBeenCalledWith('log-script-start', 0, 0, null, null);
  });

  it('does not report health when event is skipped', () => {
    const deps = makeDeps();

    runLogScriptStart(makeScriptEvent({ tool_input: { command: 'npm test' } }), deps);

    expect(deps.health).not.toHaveBeenCalled();
  });

  it('matches shell script paths', () => {
    const deps = makeDeps();

    runLogScriptStart(
      makeScriptEvent({
        tool_input: {
          command: 'bash /Users/test/skills/engineering-team/tdd/scripts/run_tests.sh',
        },
      }),
      deps
    );

    expect(deps.scriptTiming.recordScriptStart).toHaveBeenCalledWith('toolu_01ABC', 1000);
  });

  it('skips Bash commands with /skills/ but no /scripts/', () => {
    const deps = makeDeps();

    runLogScriptStart(
      makeScriptEvent({
        tool_input: {
          command: 'cat /Users/test/skills/engineering-team/tdd/SKILL.md',
        },
      }),
      deps
    );

    expect(deps.scriptTiming.recordScriptStart).not.toHaveBeenCalled();
  });
});
