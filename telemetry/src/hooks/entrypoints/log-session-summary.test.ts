import { createStubClient } from '@tests/helpers/stub-client';
import { describe, expect, it, vi } from 'vitest';

import type { LogSessionSummaryDeps } from './log-session-summary';
import { runLogSessionSummary } from './log-session-summary';

const TRANSCRIPT_CONTENT = JSON.stringify({
  type: 'assistant',
  message: {
    model: 'claude-sonnet-4-20250514',
    usage: {
      input_tokens: 500,
      output_tokens: 200,
      cache_read_input_tokens: 100,
      cache_creation_input_tokens: 50,
    },
  },
  costUSD: 0.01,
});

const makeSessionEndEvent = (overrides?: Record<string, unknown>) =>
  JSON.stringify({
    session_id: 'sess-1',
    transcript_path: '/Users/test/transcript.jsonl',
    cwd: '/Users/test/project',
    permission_mode: 'default',
    hook_event_name: 'SessionEnd',
    reason: 'other',
    ...overrides,
  });

const makeDeps = (overrides?: Partial<LogSessionSummaryDeps>): LogSessionSummaryDeps => ({
  client: createStubClient(),
  clock: { now: vi.fn().mockReturnValue(1000) },
  readFile: vi.fn().mockReturnValue(TRANSCRIPT_CONTENT),
  health: vi.fn(),
  ...overrides,
});

describe('runLogSessionSummary', () => {
  it('ingests session summary row on valid event', async () => {
    const deps = makeDeps();

    await runLogSessionSummary(makeSessionEndEvent(), deps);

    expect(deps.client.ingest.sessionSummaries).toHaveBeenCalledOnce();
  });

  it('reads transcript via injected readFile', async () => {
    const readFile = vi.fn().mockReturnValue(TRANSCRIPT_CONTENT);
    const deps = makeDeps({ readFile });

    await runLogSessionSummary(makeSessionEndEvent(), deps);

    expect(readFile).toHaveBeenCalledWith('/Users/test/transcript.jsonl');
  });

  it('logs success health event after ingest', async () => {
    const now = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1060);
    const deps = makeDeps({ clock: { now } });

    await runLogSessionSummary(makeSessionEndEvent(), deps);

    expect(deps.health).toHaveBeenCalledWith('log-session-summary', 0, 60, null, null);
  });

  it('logs failure health event on ingest error', async () => {
    const client = createStubClient({
      ingest: { sessionSummaries: vi.fn().mockRejectedValue(new Error('timeout')) },
    });
    const deps = makeDeps({ client });

    await runLogSessionSummary(makeSessionEndEvent(), deps);

    expect(deps.health).toHaveBeenCalledWith(
      'log-session-summary',
      1,
      expect.any(Number) as number,
      'timeout',
      null
    );
  });

  it('does not throw on invalid event JSON', async () => {
    const deps = makeDeps();

    await expect(runLogSessionSummary('not json', deps)).resolves.not.toThrow();
  });

  it('passes null to readFile when transcript_path missing', async () => {
    const readFile = vi.fn().mockReturnValue('');
    const deps = makeDeps({ readFile });

    await runLogSessionSummary(makeSessionEndEvent({ transcript_path: undefined }), deps);

    expect(readFile).toHaveBeenCalledWith(null);
  });
});
