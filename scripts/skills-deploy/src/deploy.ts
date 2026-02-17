import { join } from 'node:path';

import { createSkill, createSkillVersion } from './api-client.js';
import {
  getAllSkillDirs as defaultGetAllSkillDirs,
  getChangedSkillDirs as defaultGetChangedSkillDirs,
} from './change-detection.js';
import type { FrontmatterResult } from './frontmatter.js';
import {
  deriveDisplayTitle,
  parseSkillFrontmatter as defaultParseSkillFrontmatter,
  validateSkillName as defaultValidateSkillName,
} from './frontmatter.js';
import type { SkillManifest } from './manifest.js';
import {
  getSkillId,
  readManifest as defaultReadManifest,
  setSkillId,
  writeManifest as defaultWriteManifest,
} from './manifest.js';
import { buildSkillZip as defaultBuildSkillZip } from './zip-builder.js';

type DeployDeps = {
  readonly getChangedSkillDirs: (options: { rootDir: string; ref?: string }) => Promise<string[]>;
  readonly getAllSkillDirs: (options: { rootDir: string }) => Promise<string[]>;
  readonly buildSkillZip: (options: { skillDir: string; rootDir: string }) => Promise<Buffer>;
  readonly readManifest: (path: string) => Promise<SkillManifest>;
  readonly writeManifest: (path: string, manifest: SkillManifest) => Promise<void>;
  readonly parseSkillFrontmatter: (path: string) => Promise<FrontmatterResult | undefined>;
  readonly validateSkillName: (name: string) => string | undefined;
};

type DeployOptions = {
  readonly rootDir: string;
  readonly manifestPath: string;
  readonly apiKey: string;
  readonly ref?: string;
  readonly baseUrl?: string;
  readonly deps?: Partial<DeployDeps>;
};

type CreatedEntry = {
  readonly skillPath: string;
  readonly skillId: string;
};

type VersionedEntry = {
  readonly skillPath: string;
  readonly version: string;
};

type SkippedEntry = {
  readonly skillPath: string;
  readonly reason: string;
};

type DeploySummary = {
  readonly created: readonly CreatedEntry[];
  readonly versioned: readonly VersionedEntry[];
  readonly skipped: readonly SkippedEntry[];
};

const defaultDeps: DeployDeps = {
  getChangedSkillDirs: (options) => defaultGetChangedSkillDirs(options),
  getAllSkillDirs: (options) => defaultGetAllSkillDirs(options),
  buildSkillZip: (options) => defaultBuildSkillZip(options),
  readManifest: defaultReadManifest,
  writeManifest: defaultWriteManifest,
  parseSkillFrontmatter: defaultParseSkillFrontmatter,
  validateSkillName: defaultValidateSkillName,
};

const deployChangedSkills = async (options: DeployOptions): Promise<DeploySummary> => {
  const { rootDir, manifestPath, apiKey, ref, baseUrl, deps: depsOverrides } = options;
  const deps = { ...defaultDeps, ...depsOverrides };

  const changedDirs = await deps.getChangedSkillDirs({ rootDir, ref });

  let manifest = await deps.readManifest(manifestPath);

  const allDirs = await deps.getAllSkillDirs({ rootDir });
  const undeployedDirs = allDirs.filter((dir) => getSkillId(manifest, dir) === undefined);

  const dirsToProcess = [...new Set([...changedDirs, ...undeployedDirs])].sort((a, b) =>
    a.localeCompare(b),
  );

  if (dirsToProcess.length === 0) {
    return { created: [], versioned: [], skipped: [] };
  }

  const created: CreatedEntry[] = [];
  const versioned: VersionedEntry[] = [];
  const skipped: SkippedEntry[] = [];

  for (const skillPath of dirsToProcess) {
    const skillMdPath = join(rootDir, skillPath, 'SKILL.md');
    const frontmatter = await deps.parseSkillFrontmatter(skillMdPath);

    if (frontmatter === undefined) {
      skipped.push({ skillPath, reason: 'No valid frontmatter (missing name or description)' });
      continue;
    }

    const nameError = deps.validateSkillName(frontmatter.name);
    if (nameError !== undefined) {
      skipped.push({ skillPath, reason: nameError });
      continue;
    }

    const zipBuffer = await deps.buildSkillZip({
      skillDir: join(rootDir, skillPath),
      rootDir,
    });

    const displayTitle = deriveDisplayTitle(skillPath, frontmatter);
    const existingId = getSkillId(manifest, skillPath);

    if (existingId !== undefined) {
      const response = await createSkillVersion({
        skillId: existingId,
        zipBuffer,
        apiKey,
        baseUrl,
      });
      versioned.push({ skillPath, version: response.version });
    } else {
      const response = await createSkill({
        displayTitle,
        zipBuffer,
        apiKey,
        baseUrl,
      });
      created.push({ skillPath, skillId: response.id });
      manifest = setSkillId(manifest, skillPath, response.id);
    }
  }

  if (created.length > 0) {
    await deps.writeManifest(manifestPath, manifest);
  }

  return { created, versioned, skipped };
};

export { deployChangedSkills };
export type {
  CreatedEntry,
  DeployDeps,
  DeployOptions,
  DeploySummary,
  SkippedEntry,
  VersionedEntry,
};
