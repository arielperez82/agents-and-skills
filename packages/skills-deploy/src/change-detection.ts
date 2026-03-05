import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

export type ChangeDetectionDeps = {
  execGit: (args: string[]) => Promise<string>;
  fileExists: (path: string) => boolean;
};

type ChangeDetectionOptions = {
  rootDir: string;
  ref?: string;
};

const defaultExecGit =
  (rootDir: string) =>
  (args: string[]): Promise<string> =>
    new Promise((resolve, reject) => {
      execFile('git', args, { cwd: rootDir }, (error, stdout) => {
        if (error) {
          reject(error as Error);
          return;
        }
        resolve(stdout);
      });
    });

const defaultFileExists = (path: string): boolean => existsSync(path);

const parseChangedFiles = (output: string): readonly string[] =>
  output
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

const findSkillDir = (
  filePath: string,
  rootDir: string,
  fileExists: (path: string) => boolean,
): string | undefined => {
  const parts = filePath.split('/');

  if (parts[0] !== 'skills' || parts.length < 2) {
    return undefined;
  }

  for (let i = parts.length - 1; i >= 1; i--) {
    const candidateDir = parts.slice(0, i + 1).join('/');
    const skillMdPath = join(rootDir, candidateDir, 'SKILL.md');

    if (fileExists(skillMdPath)) {
      return candidateDir;
    }
  }

  return undefined;
};

export const getChangedSkillDirs = async (
  options: ChangeDetectionOptions,
  deps?: Partial<ChangeDetectionDeps>,
): Promise<string[]> => {
  const { rootDir, ref = 'HEAD~1' } = options;
  const execGit = deps?.execGit ?? defaultExecGit(rootDir);
  const fileExists = deps?.fileExists ?? defaultFileExists;

  const gitArgs = ['diff', '--name-only', ref, '--', 'skills/'];
  const output = await execGit(gitArgs);
  const changedFiles = parseChangedFiles(output);

  const skillDirs = changedFiles
    .map((filePath) => findSkillDir(filePath, rootDir, fileExists))
    .filter((dir): dir is string => dir !== undefined);

  const deduplicated = [...new Set(skillDirs)];

  return deduplicated.sort((a, b) => a.localeCompare(b));
};

export type AllSkillsDeps = {
  readDir: (dir: string) => Promise<string[]>;
};

const defaultReadDir = async (dir: string): Promise<string[]> => {
  try {
    const entries = await readdir(dir, { recursive: true });
    return entries;
  } catch {
    return [];
  }
};

export const getAllSkillDirs = async (
  options: { rootDir: string },
  deps?: Partial<AllSkillsDeps>,
): Promise<string[]> => {
  const { rootDir } = options;
  const readDirFn = deps?.readDir ?? defaultReadDir;

  let entries: string[];
  try {
    entries = await readDirFn(join(rootDir, 'skills'));
  } catch {
    return [];
  }

  const skillDirs = entries
    .filter((entry) => basename(entry) === 'SKILL.md')
    .map((entry) => join('skills', dirname(entry)))
    .filter((dir) => dir !== 'skills');

  return [...new Set(skillDirs)].sort((a, b) => a.localeCompare(b));
};
