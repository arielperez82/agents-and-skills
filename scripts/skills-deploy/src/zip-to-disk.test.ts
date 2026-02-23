import { describe, expect, it, vi } from 'vitest';

import type { ZipToDiskDeps } from './zip-to-disk.js';
import { writeSkillZips } from './zip-to-disk.js';

const createMockDeps = (overrides: Partial<ZipToDiskDeps> = {}): ZipToDiskDeps => ({
  getAllSkillDirs:
    overrides.getAllSkillDirs ?? vi.fn<() => Promise<string[]>>().mockResolvedValue([]),
  buildSkillZip:
    overrides.buildSkillZip ??
    vi.fn<() => Promise<Buffer>>().mockResolvedValue(Buffer.from('fake-zip')),
  parseSkillFrontmatter:
    overrides.parseSkillFrontmatter ??
    vi
      .fn<() => Promise<{ name: string; description: string } | undefined>>()
      .mockResolvedValue({ name: 'test-skill', description: 'A test skill' }),
  validateSkillName:
    overrides.validateSkillName ?? vi.fn<() => string | undefined>().mockReturnValue(undefined),
  writeFile: overrides.writeFile ?? vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
  mkdirp: overrides.mkdirp ?? vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
});

describe('writeSkillZips', () => {
  it('returns empty summary when no skill dirs exist', async () => {
    const deps = createMockDeps();

    const result = await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(result.written).toEqual([]);
    expect(result.skipped).toEqual([]);
  });

  it('writes zip file for a valid skill', async () => {
    const writeFile = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const deps = createMockDeps({
      getAllSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/engineering-team/tdd']),
      parseSkillFrontmatter: vi
        .fn<() => Promise<{ name: string; description: string } | undefined>>()
        .mockResolvedValue({ name: 'tdd', description: 'TDD skill' }),
      writeFile,
    });

    const result = await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(result.written).toEqual([
      { skillPath: 'skills/engineering-team/tdd', zipFileName: 'tdd.zip', name: 'tdd' },
    ]);
    expect(writeFile).toHaveBeenCalledWith('/output/tdd.zip', Buffer.from('fake-zip'));
  });

  it('creates the output directory before writing', async () => {
    const mkdirp = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const deps = createMockDeps({
      getAllSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/engineering-team/tdd']),
      mkdirp,
    });

    await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(mkdirp).toHaveBeenCalledWith('/output');
  });

  it('skips skills with no valid frontmatter', async () => {
    const deps = createMockDeps({
      getAllSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/no-frontmatter']),
      parseSkillFrontmatter: vi
        .fn<() => Promise<{ name: string; description: string } | undefined>>()
        .mockResolvedValue(undefined),
    });

    const result = await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(result.skipped).toEqual([
      {
        skillPath: 'skills/no-frontmatter',
        reason: 'No valid frontmatter (missing name or description)',
      },
    ]);
    expect(result.written).toEqual([]);
  });

  it('skips skills with invalid names', async () => {
    const deps = createMockDeps({
      getAllSkillDirs: vi.fn<() => Promise<string[]>>().mockResolvedValue(['skills/bad-skill']),
      parseSkillFrontmatter: vi
        .fn<() => Promise<{ name: string; description: string } | undefined>>()
        .mockResolvedValue({ name: 'BadName', description: 'Bad' }),
      validateSkillName: vi
        .fn<() => string | undefined>()
        .mockReturnValue('Name must contain only lowercase'),
    });

    const result = await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(result.skipped).toEqual([
      { skillPath: 'skills/bad-skill', reason: 'Name must contain only lowercase' },
    ]);
    expect(result.written).toEqual([]);
  });

  it('processes multiple skills and handles mixed outcomes', async () => {
    const writeFile = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const deps = createMockDeps({
      getAllSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue([
          'skills/engineering-team/tdd',
          'skills/no-frontmatter',
          'skills/engineering-team/testing',
        ]),
      parseSkillFrontmatter: vi
        .fn<(path: string) => Promise<{ name: string; description: string } | undefined>>()
        .mockImplementation(async (path: string) => {
          if (path.includes('no-frontmatter')) {
            return undefined;
          }
          if (path.includes('tdd')) {
            return { name: 'tdd', description: 'TDD skill' };
          }
          return { name: 'testing', description: 'Testing skill' };
        }),
      writeFile,
    });

    const result = await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(result.written).toHaveLength(2);
    expect(result.skipped).toHaveLength(1);
    expect(writeFile).toHaveBeenCalledTimes(3);
  });

  it('writes manifest.json alongside zips', async () => {
    const writtenFiles: Array<{ path: string; data: string | Buffer }> = [];
    const writeFile = vi
      .fn<(path: string, data: Buffer | string) => Promise<void>>()
      .mockImplementation(async (path: string, data: Buffer | string) => {
        writtenFiles.push({ path, data });
      });
    const deps = createMockDeps({
      getAllSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/engineering-team/tdd', 'skills/agent-browser']),
      parseSkillFrontmatter: vi
        .fn<(path: string) => Promise<{ name: string; description: string } | undefined>>()
        .mockImplementation(async (path: string) => {
          if (path.includes('tdd')) {
            return { name: 'tdd', description: 'TDD skill' };
          }
          return { name: 'agent-browser', description: 'Agent browser' };
        }),
      writeFile,
    });

    await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    const manifestEntry = writtenFiles.find((f) => f.path.endsWith('manifest.json'));
    expect(manifestEntry).toBeDefined();

    const manifestContent = JSON.parse(manifestEntry?.data as string) as Record<string, unknown>;
    expect(manifestContent).toEqual({
      skills: [
        {
          skillPath: 'skills/agent-browser',
          zipFileName: 'agent-browser.zip',
          name: 'agent-browser',
        },
        { skillPath: 'skills/engineering-team/tdd', zipFileName: 'tdd.zip', name: 'tdd' },
      ],
    });
  });

  it('does not write manifest when no skills are written', async () => {
    const writeFile = vi.fn<() => Promise<void>>().mockResolvedValue(undefined);
    const deps = createMockDeps({
      writeFile,
    });

    await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(writeFile).not.toHaveBeenCalled();
  });

  it('passes correct skillDir to buildSkillZip', async () => {
    const buildSkillZip = vi.fn<() => Promise<Buffer>>().mockResolvedValue(Buffer.from('fake-zip'));
    const deps = createMockDeps({
      getAllSkillDirs: vi
        .fn<() => Promise<string[]>>()
        .mockResolvedValue(['skills/engineering-team/tdd']),
      buildSkillZip,
    });

    await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(buildSkillZip).toHaveBeenCalledWith({
      skillDir: '/repo/skills/engineering-team/tdd',
      rootDir: '/repo',
    });
  });
});
