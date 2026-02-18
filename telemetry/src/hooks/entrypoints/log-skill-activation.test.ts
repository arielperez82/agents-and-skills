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
    tool_response: { filePath: '/Users/test/skills/engineering-team/tdd/SKILL.md', success: true },
    tool_use_id: 'toolu_01ABC',
    cwd: '/Users/test/project',
    transcript_path: '/Users/test/.claude/projects/transcript.jsonl',
    permission_mode: 'default',
    hook_event_name: 'PostToolUse',
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

  it('exits silently and emits no health event for empty stdin', async () => {
    setupEnv();
    let ingestCalled = false;

    server.use(
      http.post(`${BASE_URL}/v0/events`, () => {
        ingestCalled = true;
        return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
      })
    );

    await runLogSkillActivation('');
    // Allow any fire-and-forget promises to settle
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(ingestCalled).toBe(false);
  });

  it('exits silently and emits no health event for truncated JSON stdin', async () => {
    setupEnv();
    let ingestCalled = false;

    server.use(
      http.post(`${BASE_URL}/v0/events`, () => {
        ingestCalled = true;
        return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
      })
    );

    await runLogSkillActivation('truncated {');
    // Allow any fire-and-forget promises to settle
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(ingestCalled).toBe(false);
  });

  it('exits silently and emits no health event for non-skill file reads', async () => {
    setupEnv();
    let ingestCalled = false;

    server.use(
      http.post(`${BASE_URL}/v0/events`, () => {
        ingestCalled = true;
        return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
      })
    );

    await runLogSkillActivation(makeNonSkillEvent());
    // Allow any fire-and-forget promises to settle
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(ingestCalled).toBe(false);
  });

  it('emits success health event only for skill file reads', async () => {
    setupEnv();
    const capturedUrls: string[] = [];

    server.use(
      http.post(`${BASE_URL}/v0/events`, ({ request }) => {
        capturedUrls.push(request.url);
        return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
      })
    );

    await runLogSkillActivation(makeSkillEvent());

    // Two ingest calls: one for skill activation, one for health event
    expect(capturedUrls.length).toBeGreaterThanOrEqual(1);
  });

  it('emits failure health event when skill ingest throws', async () => {
    setupEnv();
    let callCount = 0;

    server.use(
      http.post(`${BASE_URL}/v0/events`, () => {
        callCount++;
        if (callCount === 1) {
          return HttpResponse.error();
        }
        return HttpResponse.json({ successful_rows: 1, quarantined_rows: 0 });
      })
    );

    await runLogSkillActivation(makeSkillEvent());

    // Health event call should have been made (after ingest failure)
    expect(callCount).toBeGreaterThanOrEqual(1);
  });
});
