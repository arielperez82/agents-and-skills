import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

type SkillEntry = {
  readonly skill_id: string;
};

type SkillManifest = {
  readonly skills: Readonly<Record<string, SkillEntry>>;
};

const EMPTY_MANIFEST: SkillManifest = { skills: {} };

const readManifest = async (path: string): Promise<SkillManifest> => {
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as SkillManifest;
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      return EMPTY_MANIFEST;
    }
    throw error;
  }
};

const writeManifest = async (path: string, manifest: SkillManifest): Promise<void> => {
  await mkdir(dirname(path), { recursive: true });
  const json = JSON.stringify(manifest, null, 2) + '\n';
  await writeFile(path, json, 'utf-8');
};

const getSkillId = (manifest: SkillManifest, skillPath: string): string | undefined =>
  manifest.skills[skillPath]?.skill_id;

const setSkillId = (
  manifest: SkillManifest,
  skillPath: string,
  skillId: string,
): SkillManifest => ({
  skills: {
    ...manifest.skills,
    [skillPath]: { skill_id: skillId },
  },
});

const isNodeError = (error: unknown): error is NodeJS.ErrnoException =>
  error instanceof Error && 'code' in error;

export { readManifest, writeManifest, getSkillId, setSkillId };
export type { SkillEntry, SkillManifest };
