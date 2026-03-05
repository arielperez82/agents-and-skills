import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import {
  createSkill,
  createSkillVersion,
  DuplicateTitleError,
  listSkills,
  MalformedFrontmatterError,
} from './api-client.js';

const API_BASE = 'https://api.anthropic.com';

const makeSkillRecord = (id: string, displayTitle: string, latestVersion = '1234567890') => ({
  id,
  created_at: '2026-02-17T00:00:00Z',
  display_title: displayTitle,
  latest_version: latestVersion,
  source: 'custom',
  type: 'skill',
  updated_at: '2026-02-17T00:00:00Z',
});

const server = setupServer();

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});
afterEach(() => {
  server.resetHandlers();
});
afterAll(() => {
  server.close();
});

describe('createSkill', () => {
  it('sends POST to /v1/skills with correct headers', async () => {
    let capturedHeaders: Record<string, string> = {};

    server.use(
      http.post(`${API_BASE}/v1/skills`, async ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers.entries());
        return HttpResponse.json(makeSkillRecord('skill_01abc', 'tdd'));
      }),
    );

    await createSkill({
      displayTitle: 'tdd',
      zipBuffer: Buffer.from('fake-zip'),
      apiKey: 'test-key',
    });

    expect(capturedHeaders['x-api-key']).toBe('test-key');
    expect(capturedHeaders['anthropic-version']).toBe('2023-06-01');
    expect(capturedHeaders['anthropic-beta']).toBe('skills-2025-10-02');
  });

  it('sends multipart form data with display_title and files', async () => {
    let capturedDisplayTitle = '';
    let capturedFileName = '';

    server.use(
      http.post(`${API_BASE}/v1/skills`, async ({ request }) => {
        const formData = await request.formData();
        capturedDisplayTitle = formData.get('display_title') as string;
        const file = formData.get('files[]') as File;
        capturedFileName = file.name;

        return HttpResponse.json(makeSkillRecord('skill_01abc', 'tdd'));
      }),
    );

    await createSkill({
      displayTitle: 'tdd',
      zipBuffer: Buffer.from('fake-zip'),
      apiKey: 'test-key',
    });

    expect(capturedDisplayTitle).toBe('tdd');
    expect(capturedFileName).toBe('skill.zip');
  });

  it('returns the skill id from the response', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills`, () =>
        HttpResponse.json(makeSkillRecord('skill_01xyz', 'tdd')),
      ),
    );

    const result = await createSkill({
      displayTitle: 'tdd',
      zipBuffer: Buffer.from('fake-zip'),
      apiKey: 'test-key',
    });

    expect(result.id).toBe('skill_01xyz');
  });

  it('throws on non-200 response', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills`, () =>
        HttpResponse.json({ error: 'Bad Request' }, { status: 400 }),
      ),
    );

    await expect(
      createSkill({
        displayTitle: 'tdd',
        zipBuffer: Buffer.from('fake-zip'),
        apiKey: 'test-key',
      }),
    ).rejects.toThrow('400');
  });

  it('throws DuplicateTitleError when API returns duplicate display_title error', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills`, () =>
        HttpResponse.json(
          {
            type: 'error',
            error: {
              type: 'invalid_request_error',
              message: 'Skill cannot reuse an existing display_title: agent-browser',
            },
          },
          { status: 400 },
        ),
      ),
    );

    await expect(
      createSkill({
        displayTitle: 'agent-browser',
        zipBuffer: Buffer.from('fake-zip'),
        apiKey: 'test-key',
      }),
    ).rejects.toThrow(DuplicateTitleError);
  });

  it('includes display title in DuplicateTitleError', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills`, () =>
        HttpResponse.json(
          {
            type: 'error',
            error: {
              type: 'invalid_request_error',
              message: 'Skill cannot reuse an existing display_title: agent-browser',
            },
          },
          { status: 400 },
        ),
      ),
    );

    try {
      await createSkill({
        displayTitle: 'agent-browser',
        zipBuffer: Buffer.from('fake-zip'),
        apiKey: 'test-key',
      });
      expect.fail('Expected DuplicateTitleError');
    } catch (error) {
      expect(error).toBeInstanceOf(DuplicateTitleError);
      expect((error as DuplicateTitleError).displayTitle).toBe('agent-browser');
    }
  });

  it('throws MalformedFrontmatterError when API returns malformed YAML frontmatter error', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills`, () =>
        HttpResponse.json(
          {
            type: 'error',
            error: {
              type: 'invalid_request_error',
              message: 'malformed YAML frontmatter in SKILL.md',
            },
          },
          { status: 400 },
        ),
      ),
    );

    await expect(
      createSkill({
        displayTitle: 'bad-skill',
        zipBuffer: Buffer.from('fake-zip'),
        apiKey: 'test-key',
      }),
    ).rejects.toThrow(MalformedFrontmatterError);
  });

  it('uses custom baseUrl when provided', async () => {
    const customBase = 'https://custom.api.example.com';
    let capturedUrl = '';

    server.use(
      http.post(`${customBase}/v1/skills`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(makeSkillRecord('skill_01abc', 'tdd'));
      }),
    );

    await createSkill({
      displayTitle: 'tdd',
      zipBuffer: Buffer.from('fake-zip'),
      apiKey: 'test-key',
      baseUrl: customBase,
    });

    expect(capturedUrl).toContain(customBase);
  });
});

describe('createSkillVersion', () => {
  it('sends POST to /v1/skills/:id/versions', async () => {
    let capturedUrl = '';

    server.use(
      http.post(`${API_BASE}/v1/skills/:skillId/versions`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          id: 'sv_01abc',
          created_at: '2026-02-17T00:00:00Z',
          description: 'TDD skill',
          directory: 'tdd',
          name: 'tdd',
          skill_id: 'skill_01abc',
          type: 'skill_version',
          version: '1234567890',
        });
      }),
    );

    await createSkillVersion({
      skillId: 'skill_01abc',
      zipBuffer: Buffer.from('fake-zip'),
      apiKey: 'test-key',
    });

    expect(capturedUrl).toContain('/v1/skills/skill_01abc/versions');
  });

  it('sends correct headers', async () => {
    let capturedHeaders: Record<string, string> = {};

    server.use(
      http.post(`${API_BASE}/v1/skills/:skillId/versions`, ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers.entries());
        return HttpResponse.json({
          id: 'sv_01abc',
          created_at: '2026-02-17T00:00:00Z',
          description: 'TDD skill',
          directory: 'tdd',
          name: 'tdd',
          skill_id: 'skill_01abc',
          type: 'skill_version',
          version: '1234567890',
        });
      }),
    );

    await createSkillVersion({
      skillId: 'skill_01abc',
      zipBuffer: Buffer.from('fake-zip'),
      apiKey: 'test-key',
    });

    expect(capturedHeaders['x-api-key']).toBe('test-key');
    expect(capturedHeaders['anthropic-beta']).toBe('skills-2025-10-02');
  });

  it('returns the version from the response', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills/:skillId/versions`, () =>
        HttpResponse.json({
          id: 'sv_01abc',
          created_at: '2026-02-17T00:00:00Z',
          description: 'TDD skill',
          directory: 'tdd',
          name: 'tdd',
          skill_id: 'skill_01abc',
          type: 'skill_version',
          version: '9999999999',
        }),
      ),
    );

    const result = await createSkillVersion({
      skillId: 'skill_01abc',
      zipBuffer: Buffer.from('fake-zip'),
      apiKey: 'test-key',
    });

    expect(result.version).toBe('9999999999');
  });

  it('throws on non-200 response', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills/:skillId/versions`, () =>
        HttpResponse.json({ error: 'Not Found' }, { status: 404 }),
      ),
    );

    await expect(
      createSkillVersion({
        skillId: 'skill_01notfound',
        zipBuffer: Buffer.from('fake-zip'),
        apiKey: 'test-key',
      }),
    ).rejects.toThrow('404');
  });

  it('throws MalformedFrontmatterError when API returns malformed YAML frontmatter error', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills/:skillId/versions`, () =>
        HttpResponse.json(
          {
            type: 'error',
            error: {
              type: 'invalid_request_error',
              message: 'malformed YAML frontmatter in SKILL.md',
            },
          },
          { status: 400 },
        ),
      ),
    );

    await expect(
      createSkillVersion({
        skillId: 'skill_01abc',
        zipBuffer: Buffer.from('fake-zip'),
        apiKey: 'test-key',
      }),
    ).rejects.toThrow(MalformedFrontmatterError);
  });
});

describe('listSkills', () => {
  it('sends GET to /v1/skills with correct headers', async () => {
    let capturedHeaders: Record<string, string> = {};

    server.use(
      http.get(`${API_BASE}/v1/skills`, ({ request }) => {
        capturedHeaders = Object.fromEntries(request.headers.entries());
        return HttpResponse.json({ data: [], has_more: false });
      }),
    );

    await listSkills({ apiKey: 'test-key' });

    expect(capturedHeaders['x-api-key']).toBe('test-key');
    expect(capturedHeaders['anthropic-version']).toBe('2023-06-01');
    expect(capturedHeaders['anthropic-beta']).toBe('skills-2025-10-02');
  });

  it('returns skills from the response', async () => {
    server.use(
      http.get(`${API_BASE}/v1/skills`, () =>
        HttpResponse.json({
          data: [
            makeSkillRecord('skill_01abc', 'agent-browser'),
            makeSkillRecord('skill_02def', 'tdd', '9876543210'),
          ],
          has_more: false,
        }),
      ),
    );

    const result = await listSkills({ apiKey: 'test-key' });

    expect(result).toHaveLength(2);
    expect(result[0]?.id).toBe('skill_01abc');
    expect(result[0]?.display_title).toBe('agent-browser');
    expect(result[1]?.id).toBe('skill_02def');
  });

  it('throws on non-200 response', async () => {
    server.use(
      http.get(`${API_BASE}/v1/skills`, () =>
        HttpResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      ),
    );

    await expect(listSkills({ apiKey: 'bad-key' })).rejects.toThrow('401');
  });

  it('requests limit=100 per page', async () => {
    let capturedUrl = '';

    server.use(
      http.get(`${API_BASE}/v1/skills`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], has_more: false });
      }),
    );

    await listSkills({ apiKey: 'test-key' });

    expect(capturedUrl).toContain('limit=100');
  });

  it('collects results across multiple pages in order', async () => {
    const page1Skills = [
      makeSkillRecord('skill_page1_a', 'skill-alpha', '1111111111'),
      makeSkillRecord('skill_page1_b', 'skill-beta', '2222222222'),
    ];

    const page2Skills = [makeSkillRecord('skill_page2_a', 'skill-gamma', '3333333333')];

    server.use(
      http.get(`${API_BASE}/v1/skills`, ({ request }) => {
        const url = new URL(request.url);
        const afterId = url.searchParams.get('after_id');

        if (afterId === null) {
          return HttpResponse.json({
            data: page1Skills,
            has_more: true,
            next_page: 'cursor_page2',
          });
        }

        return HttpResponse.json({
          data: page2Skills,
          has_more: false,
        });
      }),
    );

    const result = await listSkills({ apiKey: 'test-key' });

    expect(result).toHaveLength(3);
    expect(result[0]?.id).toBe('skill_page1_a');
    expect(result[1]?.id).toBe('skill_page1_b');
    expect(result[2]?.id).toBe('skill_page2_a');
  });

  it('passes next_page cursor as after_id query parameter', async () => {
    const capturedUrls: string[] = [];

    server.use(
      http.get(`${API_BASE}/v1/skills`, ({ request }) => {
        capturedUrls.push(request.url);
        const url = new URL(request.url);
        const afterId = url.searchParams.get('after_id');

        if (afterId === null) {
          return HttpResponse.json({
            data: [makeSkillRecord('skill_01', 'skill-alpha')],
            has_more: true,
            next_page: 'cursor_page2',
          });
        }

        return HttpResponse.json({
          data: [makeSkillRecord('skill_02', 'skill-beta')],
          has_more: false,
        });
      }),
    );

    await listSkills({ apiKey: 'test-key' });

    expect(capturedUrls).toHaveLength(2);
    expect(capturedUrls[1]).toContain('after_id=cursor_page2');
  });

  it('throws when pagination exceeds maximum page limit', async () => {
    let requestCount = 0;

    server.use(
      http.get(`${API_BASE}/v1/skills`, () => {
        requestCount++;
        return HttpResponse.json({
          data: [
            makeSkillRecord(
              `skill_page${String(requestCount)}`,
              `skill-${String(requestCount)}`,
              '1111111111',
            ),
          ],
          has_more: true,
          next_page: `cursor_${String(requestCount + 1)}`,
        });
      }),
    );

    await expect(listSkills({ apiKey: 'test-key' })).rejects.toThrow('exceeded maximum');
  });

  it('throws when has_more is true but next_page is absent', async () => {
    server.use(
      http.get(`${API_BASE}/v1/skills`, () =>
        HttpResponse.json({
          data: [makeSkillRecord('skill_01abc', 'skill-alpha', '1111111111')],
          has_more: true,
        }),
      ),
    );

    await expect(listSkills({ apiKey: 'test-key' })).rejects.toThrow(
      'API returned has_more: true but omitted next_page cursor',
    );
  });

  it('uses custom baseUrl when provided', async () => {
    const customBase = 'https://custom.api.example.com';
    let capturedUrl = '';

    server.use(
      http.get(`${customBase}/v1/skills`, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({ data: [], has_more: false });
      }),
    );

    await listSkills({ apiKey: 'test-key', baseUrl: customBase });

    expect(capturedUrl).toContain(customBase);
  });
});
