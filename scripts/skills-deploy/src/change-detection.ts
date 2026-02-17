import { execFile } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

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
          reject(error);
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

  return deduplicated.sort();
};
