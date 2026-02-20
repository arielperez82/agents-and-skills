import { createStubClient } from '@tests/helpers/stub-client';
import { describe, expect, it, vi } from 'vitest';

import type { TelemetryClient } from '@/client';
import type { Clock, HealthLogger, TimingStore } from '@/hooks/entrypoints/ports';

import { runLogAgentStart } from './log-agent-start';

type LogAgentStartDeps = {
  readonly client: TelemetryClient;
  readonly clock: Clock;
  readonly timing: Pick<TimingStore, 'recordAgentStart' | 'recordSessionAgent'>;
  readonly health: HealthLogger;
};

const makeStartEvent = (overrides?: Record<string, unknown>) =>
  JSON.stringify({
    session_id: 'sess-1',
    agent_id: 'agent-1',
    agent_type: 'tdd-reviewer',
    cwd: '/Users/test/project',
    transcript_path: '/Users/test/.claude/projects/transcript.jsonl',
    permission_mode: 'default',
    hook_event_name: 'SubagentStart',
    ...overrides,
  });

const makeDeps = (overrides?: Partial<LogAgentStartDeps>): LogAgentStartDeps => ({
  client: createStubClient(),
  clock: { now: vi.fn().mockReturnValue(1000) },
  timing: {
    recordAgentStart: vi.fn(),
    recordSessionAgent: vi.fn(),
  },
  health: vi.fn(),
  ...overrides,
});

describe('runLogAgentStart', () => {
  it('ingests agent activation row on valid event', async () => {
    const deps = makeDeps();

    await runLogAgentStart(makeStartEvent(), deps);

    expect(deps.client.ingest.agentActivations).toHaveBeenCalledOnce();
  });

  it('records agent start timing for valid agent_id', async () => {
    const deps = makeDeps();

    await runLogAgentStart(makeStartEvent(), deps);

    expect(deps.timing.recordAgentStart).toHaveBeenCalledWith('agent-1', 1000);
  });

  it('records session agent for valid session_id and agent_type', async () => {
    const deps = makeDeps();

    await runLogAgentStart(makeStartEvent(), deps);

    expect(deps.timing.recordSessionAgent).toHaveBeenCalledWith('sess-1', 'tdd-reviewer');
  });

  it('logs success health event after ingest', async () => {
    const now = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1050);
    const deps = makeDeps({ clock: { now } });

    await runLogAgentStart(makeStartEvent(), deps);

    expect(deps.health).toHaveBeenCalledWith('log-agent-start', 0, 50, null, null);
  });

  it('logs failure health event on ingest error', async () => {
    const client = createStubClient({
      ingest: { agentActivations: vi.fn().mockRejectedValue(new Error('network')) },
    });
    const deps = makeDeps({ client });

    await runLogAgentStart(makeStartEvent(), deps);

    expect(deps.health).toHaveBeenCalledWith(
      'log-agent-start',
      1,
      expect.any(Number) as number,
      'network',
      null
    );
  });

  it('does not throw on invalid event JSON', async () => {
    const deps = makeDeps();

    await expect(runLogAgentStart('not valid json', deps)).resolves.not.toThrow();
  });

  it('does not record timing when agent_id is missing', async () => {
    const deps = makeDeps();

    await runLogAgentStart(makeStartEvent({ agent_id: undefined }), deps);

    expect(deps.timing.recordAgentStart).not.toHaveBeenCalled();
  });

  it('does not record session agent when session_id is missing', async () => {
    const deps = makeDeps();

    await runLogAgentStart(makeStartEvent({ session_id: undefined }), deps);

    expect(deps.timing.recordSessionAgent).not.toHaveBeenCalled();
  });

  it('does not record session agent when agent_type is missing', async () => {
    const deps = makeDeps();

    await runLogAgentStart(makeStartEvent({ agent_type: undefined }), deps);

    expect(deps.timing.recordSessionAgent).not.toHaveBeenCalled();
  });
});
