import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { runLogAgentStop } from './log-agent-stop';

const BASE_URL = 'https://api.tinybird.co';

const setupEnv = () => {
  vi.stubEnv('TB_INGEST_TOKEN', 'test-ingest');
  vi.stubEnv('TB_READ_TOKEN', 'test-read');
  vi.stubEnv('TB_HOST', BASE_URL);
};

const makeTranscriptFile = (): string => {
  const transcriptPath = path.join(os.tmpdir(), `test-transcript-${String(Date.now())}.jsonl`);
  const line = JSON.stringify({
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
  fs.writeFileSync(transcriptPath, line);
  return transcriptPath;
};

const makeStopEvent = (transcriptPath: string) =>
  JSON.stringify({
    session_id: 'sess-1',
    agent_id: 'agent-1',
    agent_type: 'tdd-reviewer',
    agent_transcript_path: transcriptPath,
    parent_session_id: 'parent-1',
    duration_ms: 5000,
    success: true,
    error: null,
    cwd: '/Users/test/project',
    timestamp: '2026-02-17T10:00:00.000Z',
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('runLogAgentStop', () => {
  it('exits silently when env vars are missing', async () => {
    vi.stubEnv('TB_INGEST_TOKEN', '');
    vi.stubEnv('TB_READ_TOKEN', '');
    vi.stubEnv('TB_HOST', '');

    const transcriptPath = makeTranscriptFile();
    await expect(runLogAgentStop(makeStopEvent(transcriptPath))).resolves.not.toThrow();
  });

  it('ingests agent activation row with transcript data', async () => {
    setupEnv();
    let capturedBody: unknown = null;
    const transcriptPath = makeTranscriptFile();

    server.use(
      http.post(`${BASE_URL}/v0/events`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
      })
    );

    await runLogAgentStop(makeStopEvent(transcriptPath));

    expect(capturedBody).not.toBeNull();
  });

  it('does not throw on missing transcript file', async () => {
    setupEnv();

    server.use(
      http.post(`${BASE_URL}/v0/events`, () =>
        HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 })
      )
    );

    await expect(
      runLogAgentStop(makeStopEvent('/nonexistent/transcript.jsonl'))
    ).resolves.not.toThrow();
  });

  it('does not throw on invalid event JSON', async () => {
    setupEnv();
    await expect(runLogAgentStop('not json')).resolves.not.toThrow();
  });
});
