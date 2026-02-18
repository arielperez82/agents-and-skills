import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { runLogSessionSummary } from './log-session-summary';

const BASE_URL = 'https://api.tinybird.co';

const setupEnv = () => {
  vi.stubEnv('TB_INGEST_TOKEN', 'test-ingest');
  vi.stubEnv('TB_READ_TOKEN', 'test-read');
  vi.stubEnv('TB_HOST', BASE_URL);
};

const makeTranscriptFile = (): string => {
  const transcriptPath = path.join(
    os.tmpdir(),
    `test-session-transcript-${String(Date.now())}.jsonl`
  );
  const line = JSON.stringify({
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
  fs.writeFileSync(transcriptPath, line);
  return transcriptPath;
};

const makeSessionEndEvent = (transcriptPath: string) =>
  JSON.stringify({
    session_id: 'sess-1',
    transcript_path: transcriptPath,
    cwd: '/Users/test/project',
    permission_mode: 'default',
    hook_event_name: 'SessionEnd',
    reason: 'other',
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('runLogSessionSummary', () => {
  it('exits silently when env vars are missing', async () => {
    vi.stubEnv('TB_INGEST_TOKEN', '');
    vi.stubEnv('TB_READ_TOKEN', '');
    vi.stubEnv('TB_HOST', '');

    const transcriptPath = makeTranscriptFile();
    await expect(runLogSessionSummary(makeSessionEndEvent(transcriptPath))).resolves.not.toThrow();
  });

  it('ingests session summary row with transcript data', async () => {
    setupEnv();
    let capturedBody: unknown = null;
    const transcriptPath = makeTranscriptFile();

    server.use(
      http.post(`${BASE_URL}/v0/events`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
      })
    );

    await runLogSessionSummary(makeSessionEndEvent(transcriptPath));

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
      runLogSessionSummary(makeSessionEndEvent('/nonexistent/transcript.jsonl'))
    ).resolves.not.toThrow();
  });

  it('does not throw on invalid event JSON', async () => {
    setupEnv();
    await expect(runLogSessionSummary('not json')).resolves.not.toThrow();
  });
});
