import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { packageAllSkills } from './package-skills.js';
import type { SkillZipBuilder, ZipOutputWriter } from './ports.js';

class FixedZipBuilder implements SkillZipBuilder {
  build(skillDir: string): Promise<Buffer> {
    return Promise.resolve(Buffer.from(`zip:${skillDir}`));
  }
}

class FailingZipBuilder implements SkillZipBuilder {
  build(skillDir: string): Promise<Buffer> {
    return Promise.reject(new Error(`Failed to zip ${skillDir}`));
  }
}

class SpyZipOutputWriter implements ZipOutputWriter {
  readonly written: Array<{ path: string; data: Buffer }> = [];
  readonly ensuredDirs: string[] = [];

  writeFile(path: string, data: Buffer): Promise<void> {
    this.written.push({ path, data });
    return Promise.resolve();
  }

  ensureDir(dir: string): Promise<void> {
    this.ensuredDirs.push(dir);
    return Promise.resolve();
  }
}

const makeScanner =
  (dirs: readonly string[]) =>
  (_rootDir: string): Promise<readonly string[]> =>
    Promise.resolve(dirs);

describe('packageAllSkills', () => {
  it('returns empty summary when no skills found', async () => {
    const writer = new SpyZipOutputWriter();

    const result = await packageAllSkills(
      { rootDir: '/repo', outputDir: '/repo/dist' },
      {
        scanSkillDirs: makeScanner([]),
        buildZip: new FixedZipBuilder(),
        outputWriter: writer,
      },
    );

    expect(result.packaged).toEqual([]);
    expect(result.skipped).toEqual([]);
  });

  it('packages each skill and writes a zip file to output dir', async () => {
    const writer = new SpyZipOutputWriter();

    const result = await packageAllSkills(
      { rootDir: '/repo', outputDir: '/repo/dist' },
      {
        scanSkillDirs: makeScanner(['skills/engineering-team/tdd']),
        buildZip: new FixedZipBuilder(),
        outputWriter: writer,
      },
    );

    expect(result.packaged).toHaveLength(1);
    expect(result.packaged[0]).toMatchObject({ skillPath: 'skills/engineering-team/tdd' });
    expect(writer.written).toHaveLength(1);
  });

  it('names the zip file from the skill path slug', async () => {
    const writer = new SpyZipOutputWriter();

    await packageAllSkills(
      { rootDir: '/repo', outputDir: '/repo/dist' },
      {
        scanSkillDirs: makeScanner(['skills/engineering-team/tdd']),
        buildZip: new FixedZipBuilder(),
        outputWriter: writer,
      },
    );

    expect(writer.written[0]?.path).toBe(join('/repo/dist', 'engineering-team-tdd.zip'));
  });

  it('ensures the output directory exists before writing', async () => {
    const writer = new SpyZipOutputWriter();

    await packageAllSkills(
      { rootDir: '/repo', outputDir: '/repo/dist' },
      {
        scanSkillDirs: makeScanner(['skills/engineering-team/tdd']),
        buildZip: new FixedZipBuilder(),
        outputWriter: writer,
      },
    );

    expect(writer.ensuredDirs).toContain('/repo/dist');
  });

  it('writes the buffer returned by the zip builder', async () => {
    const writer = new SpyZipOutputWriter();

    await packageAllSkills(
      { rootDir: '/repo', outputDir: '/repo/dist' },
      {
        scanSkillDirs: makeScanner(['skills/agent-browser']),
        buildZip: new FixedZipBuilder(),
        outputWriter: writer,
      },
    );

    const expected = Buffer.from('zip:/repo/skills/agent-browser');
    expect(writer.written[0]?.data).toEqual(expected);
  });

  it('packages multiple skills and returns all in summary', async () => {
    const writer = new SpyZipOutputWriter();

    const result = await packageAllSkills(
      { rootDir: '/repo', outputDir: '/repo/dist' },
      {
        scanSkillDirs: makeScanner([
          'skills/agent-browser',
          'skills/engineering-team/tdd',
          'skills/research',
        ]),
        buildZip: new FixedZipBuilder(),
        outputWriter: writer,
      },
    );

    expect(result.packaged).toHaveLength(3);
    expect(writer.written).toHaveLength(3);
  });

  it('records the zip file name in the packaged summary', async () => {
    const writer = new SpyZipOutputWriter();

    const result = await packageAllSkills(
      { rootDir: '/repo', outputDir: '/repo/dist' },
      {
        scanSkillDirs: makeScanner(['skills/delivery-team/senior-project-manager']),
        buildZip: new FixedZipBuilder(),
        outputWriter: writer,
      },
    );

    expect(result.packaged[0]?.zipFileName).toBe('delivery-team-senior-project-manager.zip');
  });

  it('skips a skill and continues when zip building fails', async () => {
    const writer = new SpyZipOutputWriter();

    const result = await packageAllSkills(
      { rootDir: '/repo', outputDir: '/repo/dist' },
      {
        scanSkillDirs: makeScanner([
          'skills/engineering-team/tdd',
          'skills/agent-browser',
        ]),
        buildZip: {
          build: (skillDir: string): Promise<Buffer> => {
            if (skillDir.includes('tdd')) {
              return Promise.reject(new Error('zip error'));
            }
            return Promise.resolve(Buffer.from('ok'));
          },
        },
        outputWriter: writer,
      },
    );

    expect(result.packaged).toHaveLength(1);
    expect(result.packaged[0]?.skillPath).toBe('skills/agent-browser');
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0]?.skillPath).toBe('skills/engineering-team/tdd');
    expect(writer.written).toHaveLength(1);
  });

  it('includes error reason in skipped entries', async () => {
    const writer = new SpyZipOutputWriter();

    const result = await packageAllSkills(
      { rootDir: '/repo', outputDir: '/repo/dist' },
      {
        scanSkillDirs: makeScanner(['skills/engineering-team/tdd']),
        buildZip: new FailingZipBuilder(),
        outputWriter: writer,
      },
    );

    expect(result.skipped[0]?.reason).toContain('Failed to zip');
  });
});
