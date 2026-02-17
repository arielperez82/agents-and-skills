import { server } from '@tests/mocks/server';
import { http, HttpResponse } from 'msw';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { runLogSkillActivation } from './log-skill-activation';

const BASE_URL = 'https://api.tinybird.co';

const setupEnv = () => {
  vi.stubEnv('TB_INGEST_TOKEN', 'test-ingest');
  vi.stubEnv('TB_READ_TOKEN', 'test-read');
  vi.stubEnv('TB_HOST', BASE_URL);
};

const makeSkillEvent = () =>
  JSON.stringify({
    session_id: 'sess-1',
    tool_name: 'Read',
    tool_input: { file_path: '/Users/test/skills/engineering-team/tdd/SKILL.md' },
    success: true,
    duration_ms: 50,
    timestamp: '2026-02-17T10:00:00.000Z',
  });

const makeNonSkillEvent = () =>
  JSON.stringify({
    session_id: 'sess-1',
    tool_name: 'Read',
    tool_input: { file_path: '/Users/test/src/index.ts' },
    success: true,
    duration_ms: 50,
    timestamp: '2026-02-17T10:00:00.000Z',
  });

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('runLogSkillActivation', () => {
  it('exits silently when env vars are missing', async () => {
    vi.stubEnv('TB_INGEST_TOKEN', '');
    vi.stubEnv('TB_READ_TOKEN', '');
    vi.stubEnv('TB_HOST', '');

    await expect(runLogSkillActivation(makeSkillEvent())).resolves.not.toThrow();
  });

  it('ingests skill activation for skill file reads', async () => {
    setupEnv();
    let capturedBody: unknown = null;

    server.use(
      http.post(`${BASE_URL}/v0/events`, async ({ request }) => {
        capturedBody = await request.json();
        return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
      })
    );

    await runLogSkillActivation(makeSkillEvent());

    expect(capturedBody).not.toBeNull();
  });

  it('skips ingest for non-skill file reads', async () => {
    setupEnv();
    let ingestCalled = false;

    server.use(
      http.post(`${BASE_URL}/v0/events`, () => {
        ingestCalled = true;
        return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
      })
    );

    await runLogSkillActivation(makeNonSkillEvent());

    expect(ingestCalled).toBe(false);
  });

  it('does not throw on invalid event JSON', async () => {
    setupEnv();
    await expect(runLogSkillActivation('not json')).resolves.not.toThrow();
  });
});
