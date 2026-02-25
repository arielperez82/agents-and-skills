import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it } from 'vitest';

import { buildSkillZip } from './zip-builder.js';

const execFileAsync = promisify(execFile);

const tempDirs: string[] = [];

const createTempSkillDir = async (
  files: ReadonlyArray<{ readonly path: string; readonly content: string }>,
): Promise<{ readonly skillDir: string; readonly rootDir: string }> => {
  const rootDir = await mkdtemp(join(tmpdir(), 'claude-ui-zip-test-'));
  tempDirs.push(rootDir);
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
  const tempDir = await mkdtemp(join(tmpdir(), 'zip-verify-'));
  tempDirs.push(tempDir);
  const tempZip = join(tempDir, 'test.zip');
  await writeFile(tempZip, zipBuffer);

  const { stdout } = await execFileAsync('unzip', ['-l', tempZip]);

  return stdout
    .split('\n')
    .filter((line) => /^\s*\d+/.test(line))
    .map((line) => line.trim().split(/\s+/).slice(3).join(' '))
    .filter((entry) => entry.length > 0);
};

const extractZip = async (zipBuffer: Buffer): Promise<string> => {
  const tempDir = await mkdtemp(join(tmpdir(), 'zip-extract-'));
  tempDirs.push(tempDir);
  const tempZip = join(tempDir, 'test.zip');
  await writeFile(tempZip, zipBuffer);
  await execFileAsync('unzip', ['-o', tempZip, '-d', tempDir]);
  return tempDir;
};

afterEach(async () => {
  for (const dir of tempDirs) {
    await rm(dir, { recursive: true, force: true });
  }
  tempDirs.length = 0;
});

describe('buildSkillZip', () => {
  it('produces a valid non-empty zip buffer', async () => {
    const { skillDir } = await createTempSkillDir([{ path: 'SKILL.md', content: '# TDD Skill' }]);

    const result = await buildSkillZip(skillDir);

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('places SKILL.md at {skillName}/SKILL.md', async () => {
    const { skillDir } = await createTempSkillDir([{ path: 'SKILL.md', content: '# TDD Skill' }]);

    const result = await buildSkillZip(skillDir);
    const entries = await listZipEntries(result);

    expect(entries).toContain('tdd/SKILL.md');
  });

  it('uses basename of skill dir as the root folder in the zip', async () => {
    const rootDir = await mkdtemp(join(tmpdir(), 'zip-test-'));
    tempDirs.push(rootDir);
    const skillDir = join(rootDir, 'playwright-skill');
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, 'SKILL.md'), '# Playwright');

    const result = await buildSkillZip(skillDir);
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
  });

  it('includes nested reference and script files', async () => {
    const { skillDir } = await createTempSkillDir([
      { path: 'SKILL.md', content: '# TDD' },
      { path: 'references/frameworks.md', content: '# Frameworks' },
      { path: 'references/deep/nested.md', content: '# Nested' },
      { path: 'scripts/run.sh', content: '#!/bin/bash' },
    ]);

    const result = await buildSkillZip(skillDir);
    const entries = await listZipEntries(result);

    expect(entries).toContain('tdd/references/frameworks.md');
    expect(entries).toContain('tdd/references/deep/nested.md');
    expect(entries).toContain('tdd/scripts/run.sh');
  });

  it('does not include parent directory paths in the zip', async () => {
    const { skillDir } = await createTempSkillDir([{ path: 'SKILL.md', content: '# TDD' }]);

    const result = await buildSkillZip(skillDir);
    const entries = await listZipEntries(result);

    const hasParentPaths = entries.some(
      (e) => e.includes('engineering-team') || e.startsWith('skills/'),
    );
    expect(hasParentPaths).toBe(false);
  });

  it('preserves full SKILL.md content including all frontmatter fields', async () => {
    const skillContent = [
      '---',
      'name: my-skill',
      'description: A test skill',
      'allowed-tools:',
      '  - Read',
      '  - Write',
      'version: 1.0.0',
      '---',
      '',
      '# My Skill',
      '',
      'Content here.',
    ].join('\n');

    const { skillDir } = await createTempSkillDir([{ path: 'SKILL.md', content: skillContent }]);

    const result = await buildSkillZip(skillDir);
    const extractDir = await extractZip(result);

    const { readFile } = await import('node:fs/promises');
    const extracted = await readFile(join(extractDir, 'tdd', 'SKILL.md'), 'utf-8');

    expect(extracted).toBe(skillContent);
  });

  it('preserves SKILL.md with no frontmatter unchanged', async () => {
    const skillContent = '# No Frontmatter\n\nJust content.';
    const { skillDir } = await createTempSkillDir([{ path: 'SKILL.md', content: skillContent }]);

    const result = await buildSkillZip(skillDir);
    const extractDir = await extractZip(result);

    const { readFile } = await import('node:fs/promises');
    const extracted = await readFile(join(extractDir, 'tdd', 'SKILL.md'), 'utf-8');

    expect(extracted).toBe(skillContent);
  });
});
