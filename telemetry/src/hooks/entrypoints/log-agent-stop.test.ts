import { createStubClient } from '@tests/helpers/stub-client';
import { describe, expect, it, vi } from 'vitest';

import type { TelemetryClient } from '@/client';
import type { Clock, FileReader, HealthLogger, TimingStore } from '@/hooks/entrypoints/ports';

import { runLogAgentStop } from './log-agent-stop';

type LogAgentStopDeps = {
  readonly client: TelemetryClient;
  readonly clock: Clock;
  readonly timing: Pick<TimingStore, 'consumeAgentStart' | 'removeSessionAgent'>;
  readonly readFile: FileReader;
  readonly health: HealthLogger;
};

const makeStopEvent = (overrides?: Record<string, unknown>) =>
  JSON.stringify({
    session_id: 'sess-1',
    agent_id: 'agent-1',
    agent_type: 'tdd-reviewer',
    agent_transcript_path: '/Users/test/transcript.jsonl',
    cwd: '/Users/test/project',
    transcript_path: '/Users/test/.claude/projects/transcript.jsonl',
    permission_mode: 'default',
    hook_event_name: 'SubagentStop',
    stop_hook_active: false,
    ...overrides,
  });

const TRANSCRIPT_CONTENT = JSON.stringify({
  type: 'assistant',
  message: {
    model: 'claude-sonnet-4-20250514',
    usage: {
      input_tokens: 100,
      output_tokens: 50,
      cache_read_input_tokens: 20,
      cache_creation_input_tokens: 10,
    },
  },
  costUSD: 0.003,
});

const makeDeps = (overrides?: Partial<LogAgentStopDeps>): LogAgentStopDeps => ({
  client: createStubClient(),
  clock: { now: vi.fn().mockReturnValue(1000) },
  timing: {
    consumeAgentStart: vi.fn().mockReturnValue(null),
    removeSessionAgent: vi.fn(),
  },
  readFile: vi.fn().mockReturnValue(TRANSCRIPT_CONTENT),
  health: vi.fn(),
  ...overrides,
});

describe('runLogAgentStop', () => {
  it('ingests agent activation row on valid event', async () => {
    const deps = makeDeps();

    await runLogAgentStop(makeStopEvent(), deps);

    expect(deps.client.ingest.agentActivations).toHaveBeenCalledOnce();
  });

  it('reads transcript via injected readFile', async () => {
    const readFile = vi.fn().mockReturnValue(TRANSCRIPT_CONTENT);
    const deps = makeDeps({ readFile });

    await runLogAgentStop(makeStopEvent(), deps);

    expect(readFile).toHaveBeenCalledWith('/Users/test/transcript.jsonl');
  });

  it('consumes agent start timing for duration calculation', async () => {
    const deps = makeDeps({
      timing: {
        consumeAgentStart: vi.fn().mockReturnValue(500),
        removeSessionAgent: vi.fn(),
      },
    });

    await runLogAgentStop(makeStopEvent(), deps);

    expect(deps.timing.consumeAgentStart).toHaveBeenCalledWith('agent-1');
  });

  it('removes session agent on successful ingest', async () => {
    const deps = makeDeps();

    await runLogAgentStop(makeStopEvent(), deps);

    expect(deps.timing.removeSessionAgent).toHaveBeenCalledWith('sess-1');
  });

  it('logs success health event after ingest', async () => {
    const now = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1075);
    const deps = makeDeps({ clock: { now } });

    await runLogAgentStop(makeStopEvent(), deps);

    expect(deps.health).toHaveBeenCalledWith('log-agent-stop', 0, 75, null, null);
  });

  it('logs failure health event on ingest error', async () => {
    const client = createStubClient({
      ingest: { agentActivations: vi.fn().mockRejectedValue(new Error('network')) },
    });
    const deps = makeDeps({ client });

    await runLogAgentStop(makeStopEvent(), deps);

    expect(deps.health).toHaveBeenCalledWith(
      'log-agent-stop',
      1,
      expect.any(Number) as number,
      'network',
      null
    );
  });

  it('does not throw on invalid event JSON', async () => {
    const deps = makeDeps();

    await expect(runLogAgentStop('not json', deps)).resolves.not.toThrow();
  });

  it('passes empty transcript when agent_transcript_path missing', async () => {
    const readFile = vi.fn().mockReturnValue('');
    const deps = makeDeps({ readFile });

    await runLogAgentStop(makeStopEvent({ agent_transcript_path: undefined }), deps);

    expect(readFile).toHaveBeenCalledWith(null);
  });

  it('does not remove session agent when session_id missing', async () => {
    const deps = makeDeps();

    await runLogAgentStop(makeStopEvent({ session_id: undefined }), deps);

    expect(deps.timing.removeSessionAgent).not.toHaveBeenCalled();
  });
});
