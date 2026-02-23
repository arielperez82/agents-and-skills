import { describe, expect, it } from 'vitest';

import type { FrontmatterResult } from './frontmatter.js';
import type { ZipToDiskDeps } from './zip-to-disk.js';
import { writeSkillZips } from './zip-to-disk.js';

type WrittenFile = {
  readonly path: string;
  readonly data: Buffer | string;
};

type BuiltZip = {
  readonly skillDir: string;
  readonly rootDir: string;
};

type TestDepsConfig = {
  readonly skillDirs?: readonly string[];
  readonly frontmatters?: Readonly<Record<string, FrontmatterResult | undefined>>;
  readonly nameErrors?: Readonly<Record<string, string>>;
  readonly zipContent?: Buffer;
};

type TestDepsResult = {
  readonly deps: ZipToDiskDeps;
  readonly writtenFiles: WrittenFile[];
  readonly createdDirs: string[];
  readonly builtZips: BuiltZip[];
};

const createTestDeps = (config: TestDepsConfig = {}): TestDepsResult => {
  const writtenFiles: WrittenFile[] = [];
  const createdDirs: string[] = [];
  const builtZips: BuiltZip[] = [];
  const zipContent = config.zipContent ?? Buffer.from('fake-zip');

  const deps: ZipToDiskDeps = {
    getAllSkillDirs: async () => [...(config.skillDirs ?? [])],

    parseSkillFrontmatter: async (path: string): Promise<FrontmatterResult | undefined> => {
      if (config.frontmatters === undefined) {
        return { name: 'test-skill', description: 'A test skill' };
      }
      const match = Object.entries(config.frontmatters).find(([key]) => path.includes(key));
      return match?.[1];
    },

    validateSkillName: (name: string): string | undefined => {
      if (config.nameErrors === undefined) {
        return undefined;
      }
      return config.nameErrors[name];
    },

    buildSkillZip: async (options: { skillDir: string; rootDir: string }): Promise<Buffer> => {
      builtZips.push({ skillDir: options.skillDir, rootDir: options.rootDir });
      return zipContent;
    },

    writeFile: async (path: string, data: Buffer | string): Promise<void> => {
      writtenFiles.push({ path, data });
    },

    mkdirp: async (path: string): Promise<void> => {
      createdDirs.push(path);
    },
  };

  return { deps, writtenFiles, createdDirs, builtZips };
};

describe('writeSkillZips', () => {
  it('returns empty summary when no skill dirs exist', async () => {
    const { deps } = createTestDeps();

    const result = await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(result.written).toEqual([]);
    expect(result.skipped).toEqual([]);
  });

  it('writes zip file for a valid skill', async () => {
    const { deps, writtenFiles } = createTestDeps({
      skillDirs: ['skills/engineering-team/tdd'],
      frontmatters: { tdd: { name: 'tdd', description: 'TDD skill' } },
    });

    const result = await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(result.written).toEqual([
      { skillPath: 'skills/engineering-team/tdd', zipFileName: 'tdd.zip', name: 'tdd' },
    ]);

    const zipFile = writtenFiles.find((f) => f.path === '/output/tdd.zip');
    expect(zipFile).toBeDefined();
    expect(zipFile?.data).toEqual(Buffer.from('fake-zip'));
  });

  it('creates the output directory before writing', async () => {
    const { deps, createdDirs } = createTestDeps({
      skillDirs: ['skills/engineering-team/tdd'],
    });

    await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(createdDirs).toContain('/output');
  });

  it('skips skills with no valid frontmatter', async () => {
    const { deps, writtenFiles } = createTestDeps({
      skillDirs: ['skills/no-frontmatter'],
      frontmatters: { 'no-frontmatter': undefined },
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
    expect(writtenFiles.filter((f) => f.path.endsWith('.zip'))).toEqual([]);
  });

  it('skips skills with invalid names', async () => {
    const { deps } = createTestDeps({
      skillDirs: ['skills/bad-skill'],
      frontmatters: { 'bad-skill': { name: 'BadName', description: 'Bad' } },
      nameErrors: { BadName: 'Name must contain only lowercase' },
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
    const { deps, writtenFiles } = createTestDeps({
      skillDirs: [
        'skills/engineering-team/tdd',
        'skills/no-frontmatter',
        'skills/engineering-team/testing',
      ],
      frontmatters: {
        tdd: { name: 'tdd', description: 'TDD skill' },
        'no-frontmatter': undefined,
        testing: { name: 'testing', description: 'Testing skill' },
      },
    });

    const result = await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(result.written).toHaveLength(2);
    expect(result.skipped).toHaveLength(1);

    const zipFiles = writtenFiles.filter((f) => f.path.endsWith('.zip'));
    expect(zipFiles).toHaveLength(2);
  });

  it('writes manifest.json alongside zips', async () => {
    const { deps, writtenFiles } = createTestDeps({
      skillDirs: ['skills/engineering-team/tdd', 'skills/agent-browser'],
      frontmatters: {
        tdd: { name: 'tdd', description: 'TDD skill' },
        'agent-browser': { name: 'agent-browser', description: 'Agent browser' },
      },
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
    const { deps, writtenFiles } = createTestDeps();

    await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(writtenFiles).toEqual([]);
  });

  it('passes correct skillDir to buildSkillZip', async () => {
    const { deps, builtZips } = createTestDeps({
      skillDirs: ['skills/engineering-team/tdd'],
    });

    await writeSkillZips({
      rootDir: '/repo',
      outputDir: '/output',
      deps,
    });

    expect(builtZips).toEqual([
      { skillDir: '/repo/skills/engineering-team/tdd', rootDir: '/repo' },
    ]);
  });
});
