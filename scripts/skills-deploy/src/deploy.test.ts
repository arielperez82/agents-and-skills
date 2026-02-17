import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import type { DeployDeps } from './deploy.js';
import { deployChangedSkills } from './deploy.js';
import type { SkillManifest } from './manifest.js';

const API_BASE = 'https://api.anthropic.com';
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

const createMockDeps = (overrides: Partial<DeployDeps> = {}): DeployDeps => ({
  getChangedSkillDirs:
    overrides.getChangedSkillDirs ?? vi.fn<() => Promise<string[]>>().mockResolvedValue([]),
  getAllSkillDirs:
    overrides.getAllSkillDirs ?? vi.fn<() => Promise<string[]>>().mockResolvedValue([]),
  buildSkillZip:
    overrides.buildSkillZip ??
    vi.fn<() => Promise<Buffer>>().mockResolvedValue(Buffer.from('fake-zip')),
  readManifest:
    overrides.readManifest ??
    vi.fn<() => Promise<SkillManifest>>().mockResolvedValue({ skills: {} }),
  writeManifest:
    overrides.writeManifest ?? vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  parseSkillFrontmatter:
    overrides.parseSkillFrontmatter ??
    vi
      .fn<() => Promise<{ name: string; description: string } | undefined>>()
      .mockResolvedValue({ name: 'test-skill', description: 'A test skill' }),
  validateSkillName:
    overrides.validateSkillName ?? vi.fn<() => string | undefined>().mockReturnValue(undefined),
});

describe('deployChangedSkills', () => {
  it('returns empty summary when no skills changed', async () => {
    const deps = createMockDeps();

    const result = await deployChangedSkills({
      rootDir: '/repo',
      manifestPath: '/repo/manifest.json',
      apiKey: 'test-key',
      deps,
    });

    expect(result.created).toEqual([]);
    expect(result.versioned).toEqual([]);
    expect(result.skipped).toEqual([]);
  });

  it('creates new skill when not in manifest', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills`, () =>
        HttpResponse.json({
          id: 'skill_01new',
          created_at: '2026-02-17T00:00:00Z',
          display_title: 'tdd',
          latest_version: '1234567890',
          source: 'custom',
          type: 'skill',
          updated_at: '2026-02-17T00:00:00Z',
        }),
      ),
    );

    const deps = createMockDeps({
      getChangedSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/engineering-team/tdd']),
      parseSkillFrontmatter: vi
        .fn<() => Promise<{ name: string; description: string } | undefined>>()
        .mockResolvedValue({ name: 'tdd', description: 'TDD skill' }),
    });

    const result = await deployChangedSkills({
      rootDir: '/repo',
      manifestPath: '/repo/manifest.json',
      apiKey: 'test-key',
      deps,
    });

    expect(result.created).toEqual([
      { skillPath: 'skills/engineering-team/tdd', skillId: 'skill_01new' },
    ]);
    expect(deps.writeManifest).toHaveBeenCalled();
  });

  it('creates new version when skill exists in manifest', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills/:skillId/versions`, () =>
        HttpResponse.json({
          id: 'sv_01abc',
          created_at: '2026-02-17T00:00:00Z',
          description: 'TDD skill',
          directory: 'tdd',
          name: 'tdd',
          skill_id: 'skill_01existing',
          type: 'skill_version',
          version: '9999999999',
        }),
      ),
    );

    const deps = createMockDeps({
      getChangedSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/engineering-team/tdd']),
      readManifest: vi.fn<() => Promise<SkillManifest>>().mockResolvedValue({
        skills: {
          'skills/engineering-team/tdd': { skill_id: 'skill_01existing' },
        },
      }),
      parseSkillFrontmatter: vi
        .fn<() => Promise<{ name: string; description: string } | undefined>>()
        .mockResolvedValue({ name: 'tdd', description: 'TDD skill' }),
    });

    const result = await deployChangedSkills({
      rootDir: '/repo',
      manifestPath: '/repo/manifest.json',
      apiKey: 'test-key',
      deps,
    });

    expect(result.versioned).toEqual([
      { skillPath: 'skills/engineering-team/tdd', version: '9999999999' },
    ]);
  });

  it('skips skills with invalid names', async () => {
    const deps = createMockDeps({
      getChangedSkillDirs: vi.fn<() => Promise<string[]>>().mockResolvedValue(['skills/bad-skill']),
      parseSkillFrontmatter: vi
        .fn<() => Promise<{ name: string; description: string } | undefined>>()
        .mockResolvedValue({ name: 'BadName', description: 'Bad' }),
      validateSkillName: vi
        .fn<() => string | undefined>()
        .mockReturnValue('Name must contain only lowercase'),
    });

    const result = await deployChangedSkills({
      rootDir: '/repo',
      manifestPath: '/repo/manifest.json',
      apiKey: 'test-key',
      deps,
    });

    expect(result.skipped).toEqual([
      { skillPath: 'skills/bad-skill', reason: 'Name must contain only lowercase' },
    ]);
    expect(result.created).toEqual([]);
  });

  it('skips skills with no frontmatter', async () => {
    const deps = createMockDeps({
      getChangedSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/no-frontmatter']),
      parseSkillFrontmatter: vi
        .fn<() => Promise<{ name: string; description: string } | undefined>>()
        .mockResolvedValue(undefined),
    });

    const result = await deployChangedSkills({
      rootDir: '/repo',
      manifestPath: '/repo/manifest.json',
      apiKey: 'test-key',
      deps,
    });

    expect(result.skipped).toEqual([
      {
        skillPath: 'skills/no-frontmatter',
        reason: 'No valid frontmatter (missing name or description)',
      },
    ]);
  });

  it('processes multiple skills in one run', async () => {
    let createCallCount = 0;

    server.use(
      http.post(`${API_BASE}/v1/skills`, () => {
        createCallCount++;
        return HttpResponse.json({
          id: `skill_0${String(createCallCount)}`,
          created_at: '2026-02-17T00:00:00Z',
          display_title: 'test',
          latest_version: '1234567890',
          source: 'custom',
          type: 'skill',
          updated_at: '2026-02-17T00:00:00Z',
        });
      }),
      http.post(`${API_BASE}/v1/skills/:skillId/versions`, () =>
        HttpResponse.json({
          id: 'sv_01abc',
          created_at: '2026-02-17T00:00:00Z',
          description: 'Test',
          directory: 'existing',
          name: 'existing',
          skill_id: 'skill_existing',
          type: 'skill_version',
          version: '9999',
        }),
      ),
    );

    const deps = createMockDeps({
      getChangedSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/new-skill', 'skills/existing-skill', 'skills/bad-skill']),
      readManifest: vi.fn<() => Promise<SkillManifest>>().mockResolvedValue({
        skills: {
          'skills/existing-skill': { skill_id: 'skill_existing' },
        },
      }),
      parseSkillFrontmatter: vi
        .fn<(path: string) => Promise<{ name: string; description: string } | undefined>>()
        .mockImplementation(async (path: string) => {
          if (path.includes('bad-skill')) {
            return { name: 'BadName', description: 'Bad' };
          }
          if (path.includes('new-skill')) {
            return { name: 'new-skill', description: 'New skill' };
          }
          return { name: 'existing-skill', description: 'Existing' };
        }),
      validateSkillName: vi
        .fn<(name: string) => string | undefined>()
        .mockImplementation((name: string) => (name === 'BadName' ? 'Invalid name' : undefined)),
    });

    const result = await deployChangedSkills({
      rootDir: '/repo',
      manifestPath: '/repo/manifest.json',
      apiKey: 'test-key',
      deps,
    });

    expect(result.created).toHaveLength(1);
    expect(result.versioned).toHaveLength(1);
    expect(result.skipped).toHaveLength(1);
  });

  it('deploys undeployed skills even when no files changed in git diff', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills`, () =>
        HttpResponse.json({
          id: 'skill_01new',
          created_at: '2026-02-17T00:00:00Z',
          display_title: 'tdd',
          latest_version: '1234567890',
          source: 'custom',
          type: 'skill',
          updated_at: '2026-02-17T00:00:00Z',
        }),
      ),
    );

    const deps = createMockDeps({
      getChangedSkillDirs: vi.fn<() => Promise<string[]>>().mockResolvedValue([]),
      getAllSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/engineering-team/tdd']),
      readManifest: vi.fn<() => Promise<SkillManifest>>().mockResolvedValue({ skills: {} }),
      parseSkillFrontmatter: vi
        .fn<() => Promise<{ name: string; description: string } | undefined>>()
        .mockResolvedValue({ name: 'tdd', description: 'TDD skill' }),
    });

    const result = await deployChangedSkills({
      rootDir: '/repo',
      manifestPath: '/repo/manifest.json',
      apiKey: 'test-key',
      deps,
    });

    expect(result.created).toEqual([
      { skillPath: 'skills/engineering-team/tdd', skillId: 'skill_01new' },
    ]);
  });

  it('does not duplicate skills that are both changed and undeployed', async () => {
    server.use(
      http.post(`${API_BASE}/v1/skills`, () =>
        HttpResponse.json({
          id: 'skill_01new',
          created_at: '2026-02-17T00:00:00Z',
          display_title: 'tdd',
          latest_version: '1234567890',
          source: 'custom',
          type: 'skill',
          updated_at: '2026-02-17T00:00:00Z',
        }),
      ),
    );

    const deps = createMockDeps({
      getChangedSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/engineering-team/tdd']),
      getAllSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/engineering-team/tdd']),
      readManifest: vi.fn<() => Promise<SkillManifest>>().mockResolvedValue({ skills: {} }),
      parseSkillFrontmatter: vi
        .fn<() => Promise<{ name: string; description: string } | undefined>>()
        .mockResolvedValue({ name: 'tdd', description: 'TDD skill' }),
    });

    const result = await deployChangedSkills({
      rootDir: '/repo',
      manifestPath: '/repo/manifest.json',
      apiKey: 'test-key',
      deps,
    });

    expect(result.created).toHaveLength(1);
  });

  it('skips already-deployed skills that did not change', async () => {
    const deps = createMockDeps({
      getChangedSkillDirs: vi.fn<() => Promise<string[]>>().mockResolvedValue([]),
      getAllSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/engineering-team/tdd']),
      readManifest: vi.fn<() => Promise<SkillManifest>>().mockResolvedValue({
        skills: {
          'skills/engineering-team/tdd': { skill_id: 'skill_01existing' },
        },
      }),
    });

    const result = await deployChangedSkills({
      rootDir: '/repo',
      manifestPath: '/repo/manifest.json',
      apiKey: 'test-key',
      deps,
    });

    expect(result.created).toEqual([]);
    expect(result.versioned).toEqual([]);
    expect(result.skipped).toEqual([]);
  });
});
