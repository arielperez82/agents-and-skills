import { mkdir, writeFile as fsWriteFile } from 'node:fs/promises';
import { join } from 'node:path';

import { getAllSkillDirs as defaultGetAllSkillDirs } from './change-detection.js';
import type { FrontmatterResult } from './frontmatter.js';
import {
  parseSkillFrontmatter as defaultParseSkillFrontmatter,
  validateSkillName as defaultValidateSkillName,
} from './frontmatter.js';
import { buildSkillZip as defaultBuildSkillZip } from './zip-builder.js';

type ZipToDiskDeps = {
  readonly getAllSkillDirs: (options: { rootDir: string }) => Promise<string[]>;
  readonly buildSkillZip: (options: { skillDir: string; rootDir: string }) => Promise<Buffer>;
  readonly parseSkillFrontmatter: (path: string) => Promise<FrontmatterResult | undefined>;
  readonly validateSkillName: (name: string) => string | undefined;
  readonly writeFile: (path: string, data: Buffer | string) => Promise<void>;
  readonly mkdirp: (path: string) => Promise<void>;
};

type ZipToDiskOptions = {
  readonly rootDir: string;
  readonly outputDir: string;
  readonly deps?: Partial<ZipToDiskDeps>;
};

type WrittenEntry = {
  readonly skillPath: string;
  readonly zipFileName: string;
  readonly name: string;
};

type SkippedEntry = {
  readonly skillPath: string;
  readonly reason: string;
};

type ZipToDiskSummary = {
  readonly written: readonly WrittenEntry[];
  readonly skipped: readonly SkippedEntry[];
};

const defaultDeps: ZipToDiskDeps = {
  getAllSkillDirs: (options) => defaultGetAllSkillDirs(options),
  buildSkillZip: (options) => defaultBuildSkillZip(options),
  parseSkillFrontmatter: defaultParseSkillFrontmatter,
  validateSkillName: defaultValidateSkillName,
  writeFile: (path, data) => fsWriteFile(path, data),
  mkdirp: (path) => mkdir(path, { recursive: true }).then(() => undefined),
};

const writeSkillZips = async (options: ZipToDiskOptions): Promise<ZipToDiskSummary> => {
  const { rootDir, outputDir, deps: depsOverrides } = options;
  const deps = { ...defaultDeps, ...depsOverrides };

  const allDirs = await deps.getAllSkillDirs({ rootDir });

  if (allDirs.length === 0) {
    return { written: [], skipped: [] };
  }

  await deps.mkdirp(outputDir);

  const written: WrittenEntry[] = [];
  const skipped: SkippedEntry[] = [];

  for (const skillPath of allDirs) {
    const skillMdPath = join(rootDir, skillPath, 'SKILL.md');
    const frontmatter = await deps.parseSkillFrontmatter(skillMdPath);

    if (frontmatter === undefined) {
      console.log(`  ⊘ ${skillPath}: skipped (no valid frontmatter)`);
      skipped.push({ skillPath, reason: 'No valid frontmatter (missing name or description)' });
      continue;
    }

    const nameError = deps.validateSkillName(frontmatter.name);
    if (nameError !== undefined) {
      console.log(`  ⊘ ${skillPath}: skipped (${nameError})`);
      skipped.push({ skillPath, reason: nameError });
      continue;
    }

    const zipBuffer = await deps.buildSkillZip({
      skillDir: join(rootDir, skillPath),
      rootDir,
    });

    const zipFileName = `${frontmatter.name}.zip`;
    await deps.writeFile(join(outputDir, zipFileName), zipBuffer);

    console.log(`  ✓ ${skillPath} → ${zipFileName}`);
    written.push({ skillPath, zipFileName, name: frontmatter.name });
  }

  if (written.length > 0) {
    const manifest = {
      skills: written
        .map((entry) => ({
          skillPath: entry.skillPath,
          zipFileName: entry.zipFileName,
          name: entry.name,
        }))
        .sort((a, b) => a.skillPath.localeCompare(b.skillPath)),
    };
    await deps.writeFile(join(outputDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  }

  return { written, skipped };
};

export { writeSkillZips };
export type { SkippedEntry, WrittenEntry, ZipToDiskDeps, ZipToDiskOptions, ZipToDiskSummary };
