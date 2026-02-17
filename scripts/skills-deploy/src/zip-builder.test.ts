import { describe, it, expect, afterEach } from 'vitest';
import { buildSkillZip } from './zip-builder.js';
import { mkdir, writeFile, rm, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const createTempSkillDir = async (
  files: ReadonlyArray<{ readonly path: string; readonly content: string }>,
): Promise<{ readonly skillDir: string; readonly rootDir: string }> => {
  const rootDir = await mkdtemp(join(tmpdir(), 'zip-builder-test-'));
  const skillDir = join(rootDir, 'skills', 'engineering-team', 'tdd');

  await mkdir(skillDir, { recursive: true });

  for (const file of files) {
    const fullPath = join(skillDir, file.path);
    const dir = fullPath.substring(0, fullPath.lastIndexOf('/'));
    await mkdir(dir, { recursive: true });
    await writeFile(fullPath, file.content);
  }

  return { skillDir, rootDir };
};

const listZipEntries = async (zipBuffer: Buffer): Promise<readonly string[]> => {
  const tempZip = join(
    await mkdtemp(join(tmpdir(), 'zip-verify-')),
    'test.zip',
  );
  tempDirs.push(tempZip.substring(0, tempZip.lastIndexOf('/')));
  await writeFile(tempZip, zipBuffer);

  const { stdout } = await execFileAsync('unzip', ['-l', tempZip]);

  return stdout
    .split('\n')
    .filter((line) => /^\s*\d+/.test(line))
    .map((line) => line.trim().split(/\s+/).slice(3).join(' '))
    .filter((entry) => entry.length > 0);
};

const tempDirs: string[] = [];

afterEach(async () => {
  for (const dir of tempDirs) {
    await rm(dir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
});

describe('buildSkillZip', () => {
  it('produces a valid zip buffer', async () => {
    const { skillDir, rootDir } = await createTempSkillDir([
      { path: 'SKILL.md', content: '# TDD Skill' },
    ]);
    tempDirs.push(rootDir);

    const result = await buildSkillZip({ skillDir, rootDir });

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('contains exactly one top-level directory matching the skill name', async () => {
    const { skillDir, rootDir } = await createTempSkillDir([
      { path: 'SKILL.md', content: '# TDD Skill' },
    ]);
    tempDirs.push(rootDir);

    const result = await buildSkillZip({ skillDir, rootDir });
    const entries = await listZipEntries(result);

    const topLevelDirs = [
      ...new Set(
        entries
          .filter((e) => !e.endsWith('/'))
          .map((e) => e.split('/')[0])
          .filter((d): d is string => d !== undefined),
      ),
    ];

    expect(topLevelDirs).toEqual(['tdd']);
  });

  it('places SKILL.md at <skillName>/SKILL.md', async () => {
    const { skillDir, rootDir } = await createTempSkillDir([
      { path: 'SKILL.md', content: '# TDD Skill' },
    ]);
    tempDirs.push(rootDir);

    const result = await buildSkillZip({ skillDir, rootDir });
    const entries = await listZipEntries(result);

    expect(entries).toContain('tdd/SKILL.md');
  });

  it('preserves nested files under <skillName>/', async () => {
    const { skillDir, rootDir } = await createTempSkillDir([
      { path: 'SKILL.md', content: '# TDD Skill' },
      { path: 'references/frameworks.md', content: '# Frameworks' },
      { path: 'references/deep/nested.md', content: '# Nested' },
      { path: 'scripts/run.sh', content: '#!/bin/bash' },
    ]);
    tempDirs.push(rootDir);

    const result = await buildSkillZip({ skillDir, rootDir });
    const entries = await listZipEntries(result);

    expect(entries).toContain('tdd/references/frameworks.md');
    expect(entries).toContain('tdd/references/deep/nested.md');
    expect(entries).toContain('tdd/scripts/run.sh');
  });

  it('does not include parent directory paths', async () => {
    const { skillDir, rootDir } = await createTempSkillDir([
      { path: 'SKILL.md', content: '# TDD Skill' },
    ]);
    tempDirs.push(rootDir);

    const result = await buildSkillZip({ skillDir, rootDir });
    const entries = await listZipEntries(result);

    const hasParentPaths = entries.some(
      (e) => e.includes('engineering-team') || e.includes('skills/'),
    );

    expect(hasParentPaths).toBe(false);
  });

  it('handles skill directories with only SKILL.md', async () => {
    const { skillDir, rootDir } = await createTempSkillDir([
      { path: 'SKILL.md', content: '# Minimal Skill' },
    ]);
    tempDirs.push(rootDir);

    const result = await buildSkillZip({ skillDir, rootDir });
    const entries = await listZipEntries(result);

    const fileEntries = entries.filter((e) => !e.endsWith('/'));
    expect(fileEntries).toEqual(['tdd/SKILL.md']);
  });

  it('handles empty subdirectories gracefully', async () => {
    const { skillDir, rootDir } = await createTempSkillDir([
      { path: 'SKILL.md', content: '# Skill' },
    ]);
    await mkdir(join(skillDir, 'empty-dir'), { recursive: true });
    tempDirs.push(rootDir);

    const result = await buildSkillZip({ skillDir, rootDir });
    const entries = await listZipEntries(result);

    expect(entries).toContain('tdd/SKILL.md');
    expect(Buffer.isBuffer(result)).toBe(true);
  });

  it('uses the last path segment as the zip root name', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'zip-builder-test-'));
    const skillDir = join(rootDir, 'skills', 'playwright-skill');
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, 'SKILL.md'), '# Playwright');
    tempDirs.push(rootDir);

    const result = await buildSkillZip({ skillDir, rootDir });
    const entries = await listZipEntries(result);

    const topLevelDirs = [
      ...new Set(
        entries
          .filter((e) => !e.endsWith('/'))
          .map((e) => e.split('/')[0])
          .filter((d): d is string => d !== undefined),
      ),
    ];

    expect(topLevelDirs).toEqual(['playwright-skill']);
    expect(entries).toContain('playwright-skill/SKILL.md');
  });

  it('preserves file contents in the zip', async () => {
    const skillContent = '# My Skill\n\nThis is the content.';
    const { skillDir, rootDir } = await createTempSkillDir([
      { path: 'SKILL.md', content: skillContent },
    ]);
    tempDirs.push(rootDir);

    const result = await buildSkillZip({ skillDir, rootDir });

    const tempZipDir = await mkdtemp(join(tmpdir(), 'zip-extract-'));
    tempDirs.push(tempZipDir);
    const tempZip = join(tempZipDir, 'test.zip');
    await writeFile(tempZip, result);

    await execFileAsync('unzip', ['-o', tempZip, '-d', tempZipDir]);

    const { readFile } = await import('node:fs/promises');
    const extracted = await readFile(
      join(tempZipDir, 'tdd', 'SKILL.md'),
      'utf-8',
    );

    expect(extracted).toBe(skillContent);
  });
});
