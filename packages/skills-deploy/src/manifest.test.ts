import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { getSkillId, readManifest, setSkillId, writeManifest } from './manifest.js';

const createTempDir = () => mkdtemp(join(tmpdir(), 'manifest-test-'));

describe('manifest', () => {
  const tempDirs: string[] = [];

  const makeTempDir = async () => {
    const dir = await createTempDir();
    tempDirs.push(dir);
    return dir;
  };

  afterEach(async () => {
    await Promise.all(tempDirs.map((d) => rm(d, { recursive: true, force: true })));
    tempDirs.length = 0;
  });

  describe('readManifest', () => {
    it('returns empty skills when file does not exist', async () => {
      const dir = await makeTempDir();
      const result = await readManifest(join(dir, 'nonexistent.json'));

      expect(result).toEqual({ skills: {} });
    });

    it('parses valid manifest file', async () => {
      const dir = await makeTempDir();
      const filePath = join(dir, 'manifest.json');
      const manifest = {
        skills: {
          'skills/engineering-team/tdd': { skill_id: 'sk_abc123' },
        },
      };
      await writeManifest(filePath, manifest);

      const result = await readManifest(filePath);

      expect(result).toEqual(manifest);
    });
  });

  describe('writeManifest', () => {
    it('creates valid JSON with trailing newline', async () => {
      const dir = await makeTempDir();
      const filePath = join(dir, 'manifest.json');
      const manifest = { skills: {} } as const;

      await writeManifest(filePath, manifest);

      const raw = await readFile(filePath, 'utf-8');
      expect(raw).toBe('{\n  "skills": {}\n}\n');
      expect(raw.endsWith('\n')).toBe(true);
    });

    it('creates parent directories if needed', async () => {
      const dir = await makeTempDir();
      const filePath = join(dir, 'nested', 'deep', 'manifest.json');
      const manifest = { skills: {} } as const;

      await writeManifest(filePath, manifest);

      const result = await readManifest(filePath);
      expect(result).toEqual(manifest);
    });
  });

  describe('getSkillId', () => {
    it('returns skill_id when path exists', () => {
      const manifest = {
        skills: {
          'skills/engineering-team/tdd': { skill_id: 'sk_abc123' },
        },
      } as const;

      const result = getSkillId(manifest, 'skills/engineering-team/tdd');

      expect(result).toBe('sk_abc123');
    });

    it('returns undefined when path does not exist', () => {
      const manifest = { skills: {} } as const;

      const result = getSkillId(manifest, 'skills/nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('setSkillId', () => {
    it('returns new manifest with added entry', () => {
      const manifest = { skills: {} } as const;

      const result = setSkillId(manifest, 'skills/engineering-team/tdd', 'sk_abc123');

      expect(result).toEqual({
        skills: {
          'skills/engineering-team/tdd': { skill_id: 'sk_abc123' },
        },
      });
    });

    it('does not modify original manifest', () => {
      const manifest = {
        skills: {
          'skills/engineering-team/tdd': { skill_id: 'sk_abc123' },
        },
      } as const;

      setSkillId(manifest, 'skills/engineering-team/testing', 'sk_def456');

      expect(manifest.skills).toEqual({
        'skills/engineering-team/tdd': { skill_id: 'sk_abc123' },
      });
      expect('skills/engineering-team/testing' in manifest.skills).toBe(false);
    });

    it('overwrites existing entry for same path', () => {
      const manifest = {
        skills: {
          'skills/engineering-team/tdd': { skill_id: 'sk_old' },
        },
      };

      const result = setSkillId(manifest, 'skills/engineering-team/tdd', 'sk_new');

      expect(result.skills['skills/engineering-team/tdd']?.skill_id).toBe('sk_new');
    });
  });

  describe('round-trip', () => {
    it('write then read produces same data', async () => {
      const dir = await makeTempDir();
      const filePath = join(dir, 'manifest.json');
      const manifest = {
        skills: {
          'skills/engineering-team/tdd': { skill_id: 'sk_abc123' },
          'skills/engineering-team/testing': { skill_id: 'sk_def456' },
        },
      };

      await writeManifest(filePath, manifest);
      const result = await readManifest(filePath);

      expect(result).toEqual(manifest);
    });
  });
});
