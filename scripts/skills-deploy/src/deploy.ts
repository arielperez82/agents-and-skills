import { join } from 'node:path';

import { createSkill, createSkillVersion, DuplicateTitleError, listSkills } from './api-client.js';
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

type SkillDeployResult =
  | { readonly kind: 'created'; readonly skillId: string }
  | { readonly kind: 'versioned'; readonly skillId: string; readonly version: string };

const recoverFromDuplicateTitle = async (options: {
  readonly displayTitle: string;
  readonly skillPath: string;
  readonly zipBuffer: Buffer;
  readonly apiKey: string;
  readonly baseUrl?: string;
}): Promise<{ readonly skillId: string; readonly version: string }> => {
  const { displayTitle, skillPath, zipBuffer, apiKey, baseUrl } = options;

  const skills = await listSkills({ apiKey, baseUrl });
  const existing = skills.find((s) => s.display_title === displayTitle);

  if (existing === undefined) {
    throw new Error(
      `Skill with display_title "${displayTitle}" reported as duplicate but not found via API (skill path: ${skillPath})`,
    );
  }

  const versionResponse = await createSkillVersion({
    skillId: existing.id,
    zipBuffer,
    apiKey,
    baseUrl,
  });

  return { skillId: existing.id, version: versionResponse.version };
};

const createOrRecoverSkill = async (options: {
  readonly displayTitle: string;
  readonly skillPath: string;
  readonly zipBuffer: Buffer;
  readonly apiKey: string;
  readonly baseUrl?: string;
}): Promise<SkillDeployResult> => {
  const { displayTitle, skillPath, zipBuffer, apiKey, baseUrl } = options;

  try {
    const response = await createSkill({ displayTitle, zipBuffer, apiKey, baseUrl });
    return { kind: 'created', skillId: response.id };
  } catch (error) {
    if (!(error instanceof DuplicateTitleError)) {
      throw error;
    }

    const recovered = await recoverFromDuplicateTitle({
      displayTitle,
      skillPath,
      zipBuffer,
      apiKey,
      baseUrl,
    });
    return { kind: 'versioned', skillId: recovered.skillId, version: recovered.version };
  }
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
  let manifestUpdated = false;

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
      const result = await createOrRecoverSkill({
        displayTitle,
        skillPath,
        zipBuffer,
        apiKey,
        baseUrl,
      });

      if (result.kind === 'created') {
        created.push({ skillPath, skillId: result.skillId });
      } else {
        versioned.push({ skillPath, version: result.version });
      }

      manifest = setSkillId(manifest, skillPath, result.skillId);
      manifestUpdated = true;
    }
  }

  if (created.length > 0 || manifestUpdated) {
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
