import { describe, it, expect, vi } from 'vitest';
import { getChangedSkillDirs } from './change-detection.js';
import type { ChangeDetectionDeps } from './change-detection.js';

const createDeps = (overrides: Partial<ChangeDetectionDeps> = {}): ChangeDetectionDeps => ({
  execGit: overrides.execGit ?? vi.fn<(args: string[]) => Promise<string>>().mockResolvedValue(''),
  fileExists: overrides.fileExists ?? (() => false),
});

describe('getChangedSkillDirs', () => {
  it('returns empty array when no files changed', async () => {
    const deps = createDeps({
      execGit: vi.fn<(args: string[]) => Promise<string>>().mockResolvedValue(''),
    });

    const result = await getChangedSkillDirs({ rootDir: '/repo' }, deps);

    expect(result).toEqual([]);
  });

  it('maps file paths to skill directories correctly', async () => {
    const deps = createDeps({
      execGit: vi
        .fn<(args: string[]) => Promise<string>>()
        .mockResolvedValue('skills/engineering-team/tdd/SKILL.md\n'),
      fileExists: (path: string) => path === '/repo/skills/engineering-team/tdd/SKILL.md',
    });

    const result = await getChangedSkillDirs({ rootDir: '/repo' }, deps);

    expect(result).toEqual(['skills/engineering-team/tdd']);
  });

  it('maps nested file changes to skill dir', async () => {
    const deps = createDeps({
      execGit: vi
        .fn<(args: string[]) => Promise<string>>()
        .mockResolvedValue('skills/engineering-team/tdd/references/foo.md\n'),
      fileExists: (path: string) => path === '/repo/skills/engineering-team/tdd/SKILL.md',
    });

    const result = await getChangedSkillDirs({ rootDir: '/repo' }, deps);

    expect(result).toEqual(['skills/engineering-team/tdd']);
  });

  it('deduplicates when multiple files in same skill dir changed', async () => {
    const deps = createDeps({
      execGit: vi
        .fn<(args: string[]) => Promise<string>>()
        .mockResolvedValue(
          [
            'skills/engineering-team/tdd/SKILL.md',
            'skills/engineering-team/tdd/references/bar.md',
            'skills/engineering-team/tdd/scripts/run.sh',
          ].join('\n') + '\n',
        ),
      fileExists: (path: string) => path === '/repo/skills/engineering-team/tdd/SKILL.md',
    });

    const result = await getChangedSkillDirs({ rootDir: '/repo' }, deps);

    expect(result).toEqual(['skills/engineering-team/tdd']);
  });

  it('sorts results alphabetically', async () => {
    const skillMdPaths = new Set([
      '/repo/skills/engineering-team/typescript-strict/SKILL.md',
      '/repo/skills/agent-browser/SKILL.md',
      '/repo/skills/engineering-team/tdd/SKILL.md',
    ]);

    const deps = createDeps({
      execGit: vi
        .fn<(args: string[]) => Promise<string>>()
        .mockResolvedValue(
          [
            'skills/engineering-team/typescript-strict/SKILL.md',
            'skills/agent-browser/SKILL.md',
            'skills/engineering-team/tdd/references/foo.md',
          ].join('\n') + '\n',
        ),
      fileExists: (path: string) => skillMdPaths.has(path),
    });

    const result = await getChangedSkillDirs({ rootDir: '/repo' }, deps);

    expect(result).toEqual([
      'skills/agent-browser',
      'skills/engineering-team/tdd',
      'skills/engineering-team/typescript-strict',
    ]);
  });

  it('uses default ref HEAD~1 when not provided', async () => {
    const mockExecGit = vi.fn<(args: string[]) => Promise<string>>().mockResolvedValue('');

    const deps = createDeps({ execGit: mockExecGit });

    await getChangedSkillDirs({ rootDir: '/repo' }, deps);

    expect(mockExecGit).toHaveBeenCalledWith(['diff', '--name-only', 'HEAD~1', '--', 'skills/']);
  });

  it('uses provided ref', async () => {
    const mockExecGit = vi.fn<(args: string[]) => Promise<string>>().mockResolvedValue('');

    const deps = createDeps({ execGit: mockExecGit });

    await getChangedSkillDirs({ rootDir: '/repo', ref: 'abc123' }, deps);

    expect(mockExecGit).toHaveBeenCalledWith(['diff', '--name-only', 'abc123', '--', 'skills/']);
  });

  it('handles root-level skills', async () => {
    const deps = createDeps({
      execGit: vi
        .fn<(args: string[]) => Promise<string>>()
        .mockResolvedValue('skills/agent-browser/SKILL.md\n'),
      fileExists: (path: string) => path === '/repo/skills/agent-browser/SKILL.md',
    });

    const result = await getChangedSkillDirs({ rootDir: '/repo' }, deps);

    expect(result).toEqual(['skills/agent-browser']);
  });

  it('excludes files not belonging to any skill directory', async () => {
    const deps = createDeps({
      execGit: vi
        .fn<(args: string[]) => Promise<string>>()
        .mockResolvedValue(
          ['skills/README.md', 'skills/engineering-team/tdd/SKILL.md'].join('\n') + '\n',
        ),
      fileExists: (path: string) => path === '/repo/skills/engineering-team/tdd/SKILL.md',
    });

    const result = await getChangedSkillDirs({ rootDir: '/repo' }, deps);

    expect(result).toEqual(['skills/engineering-team/tdd']);
  });

  it('handles deeply nested files by walking up to find SKILL.md', async () => {
    const deps = createDeps({
      execGit: vi
        .fn<(args: string[]) => Promise<string>>()
        .mockResolvedValue(
          'skills/engineering-team/playwright-skill/references/deep/nested/file.md\n',
        ),
      fileExists: (path: string) =>
        path === '/repo/skills/engineering-team/playwright-skill/SKILL.md',
    });

    const result = await getChangedSkillDirs({ rootDir: '/repo' }, deps);

    expect(result).toEqual(['skills/engineering-team/playwright-skill']);
  });
});
