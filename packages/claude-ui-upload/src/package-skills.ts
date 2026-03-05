import { join } from 'node:path';
import { mkdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';

import { scanAllSkillDirs } from './skill-scanner.js';
import { buildSkillZip } from './zip-builder.js';
import type { SkillZipBuilder, ZipOutputWriter } from './ports.js';

type PackagedSkill = {
  readonly skillPath: string;
  readonly zipFileName: string;
};

type SkippedSkill = {
  readonly skillPath: string;
  readonly reason: string;
};

type PackageSummary = {
  readonly packaged: readonly PackagedSkill[];
  readonly skipped: readonly SkippedSkill[];
};

type PackageSkillsOptions = {
  readonly rootDir: string;
  readonly outputDir: string;
};

type PackageSkillsDeps = {
  readonly scanSkillDirs: (rootDir: string) => Promise<readonly string[]>;
  readonly buildZip: SkillZipBuilder;
  readonly outputWriter: ZipOutputWriter;
};

const nodeOutputWriter: ZipOutputWriter = {
  writeFile: async (path: string, data: Buffer): Promise<void> => {
    await writeFile(path, data);
  },
  ensureDir: async (dir: string): Promise<void> => {
    await mkdir(dir, { recursive: true });
  },
};

const skillPathToZipFileName = (skillPath: string): string => {
  const withoutPrefix = skillPath.replace(/^skills\//, '');
  return withoutPrefix.replace(/\//g, '-') + '.zip';
};

const packageAllSkills = async (
  options: PackageSkillsOptions,
  deps: PackageSkillsDeps = {
    scanSkillDirs: scanAllSkillDirs,
    buildZip: { build: buildSkillZip },
    outputWriter: nodeOutputWriter,
  },
): Promise<PackageSummary> => {
  const { rootDir, outputDir } = options;

  await deps.outputWriter.ensureDir(outputDir);

  const skillPaths = await deps.scanSkillDirs(rootDir);

  const packaged: PackagedSkill[] = [];
  const skipped: SkippedSkill[] = [];

  for (const skillPath of skillPaths) {
    const skillDir = join(rootDir, skillPath);
    const zipFileName = skillPathToZipFileName(skillPath);
    const outputPath = join(outputDir, zipFileName);

    try {
      const zipBuffer = await deps.buildZip.build(skillDir);
      await deps.outputWriter.writeFile(outputPath, zipBuffer);
      packaged.push({ skillPath, zipFileName });
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);
      skipped.push({ skillPath, reason });
    }
  }

  return { packaged, skipped };
};

export { packageAllSkills, nodeOutputWriter, skillPathToZipFileName };
export type {
  PackageSummary,
  PackagedSkill,
  SkippedSkill,
  PackageSkillsDeps,
  PackageSkillsOptions,
};
