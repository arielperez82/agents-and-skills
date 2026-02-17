import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { runLogAgentStart } from './log-agent-start';

const BASE_URL = 'https://api.tinybird.co';

const setupEnv = () => {
  vi.stubEnv('TB_INGEST_TOKEN', 'test-ingest');
  vi.stubEnv('TB_READ_TOKEN', 'test-read');
  vi.stubEnv('TB_HOST', BASE_URL);
};

const makeStartEvent = () =>
  JSON.stringify({
    session_id: 'sess-1',
    agent_id: 'agent-1',
    agent_type: 'tdd-reviewer',
    agent_transcript_path: '/Users/test/.claude/agent-transcript.jsonl',
    parent_session_id: 'parent-1',
    cwd: '/Users/test/project',
    timestamp: '2026-02-17T10:00:00.000Z',
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('runLogAgentStart', () => {
  it('exits silently when env vars are missing', async () => {
    vi.stubEnv('TB_INGEST_TOKEN', '');
    vi.stubEnv('TB_READ_TOKEN', '');
    vi.stubEnv('TB_HOST', '');

    await expect(runLogAgentStart(makeStartEvent())).resolves.not.toThrow();
  });

  it('ingests agent activation row on valid event', async () => {
    setupEnv();
    let capturedBody: unknown = null;

    server.use(
      http.post(`${BASE_URL}/v0/events`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
      })
    );

    await runLogAgentStart(makeStartEvent());

    expect(capturedBody).not.toBeNull();
  });

  it('does not throw on ingest failure', async () => {
    setupEnv();

    server.use(
      http.post(`${BASE_URL}/v0/events`, () =>
        HttpResponse.json({ error: 'Server error' }, { status: 500 })
      )
    );

    await expect(runLogAgentStart(makeStartEvent())).resolves.not.toThrow();
  });

  it('does not throw on invalid event JSON', async () => {
    setupEnv();

    await expect(runLogAgentStart('not valid json')).resolves.not.toThrow();
  });
});
