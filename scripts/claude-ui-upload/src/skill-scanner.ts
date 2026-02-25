import { basename, dirname, join } from 'node:path';
import { readdir } from 'node:fs/promises';

import type { FileTreeReader } from './ports.js';

type SkillScannerDeps = {
  readonly fileTreeReader: FileTreeReader;
};

const nodeFileTreeReader: FileTreeReader = {
  readRecursive: async (dir: string): Promise<readonly string[]> => {
    try {
      return await readdir(dir, { recursive: true });
    } catch {
      return [];
    }
  },
};

const scanAllSkillDirs = async (
  rootDir: string,
  deps: SkillScannerDeps = { fileTreeReader: nodeFileTreeReader },
): Promise<readonly string[]> => {
  const skillsDir = join(rootDir, 'skills');
  const entries = await deps.fileTreeReader.readRecursive(skillsDir);

  const skillDirs = entries
    .filter((entry) => basename(entry) === 'SKILL.md')
    .map((entry) => join('skills', dirname(entry)))
    .filter((dir) => dir !== 'skills');

  return [...new Set(skillDirs)].sort((a, b) => a.localeCompare(b));
};

export { scanAllSkillDirs, nodeFileTreeReader };
export type { SkillScannerDeps };
