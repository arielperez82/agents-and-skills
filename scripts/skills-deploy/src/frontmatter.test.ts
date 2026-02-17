import { describe, it, expect, afterEach } from 'vitest';
import { writeFile, mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { parseSkillFrontmatter, validateSkillName, deriveDisplayTitle } from './frontmatter.js';

const createTempDir = async (): Promise<string> => {
  const dir = join(
    tmpdir(),
    `frontmatter-test-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  await mkdir(dir, { recursive: true });
  return dir;
};

const writeSkillMd = async (dir: string, content: string): Promise<string> => {
  const filePath = join(dir, 'SKILL.md');
  await writeFile(filePath, content, 'utf-8');
  return filePath;
};

describe('parseSkillFrontmatter', () => {
  const tempDirs: string[] = [];

  const trackTempDir = async (): Promise<string> => {
    const dir = await createTempDir();
    tempDirs.push(dir);
    return dir;
  };

  afterEach(async () => {
    await Promise.all(tempDirs.map((d) => rm(d, { recursive: true, force: true })));
    tempDirs.length = 0;
  });

  it('parses valid frontmatter with name and description', async () => {
    const dir = await trackTempDir();
    const filePath = await writeSkillMd(
      dir,
      `---
name: tdd
description: Test-Driven Development methodology and workflow
version: "1.0"
---

# TDD Skill
Content here...
`,
    );

    const result = await parseSkillFrontmatter(filePath);

    expect(result).toEqual({
      name: 'tdd',
      description: 'Test-Driven Development methodology and workflow',
    });
  });

  it('returns undefined for missing file', async () => {
    const result = await parseSkillFrontmatter('/nonexistent/path/SKILL.md');

    expect(result).toBeUndefined();
  });

  it('returns undefined for file with no frontmatter delimiters', async () => {
    const dir = await trackTempDir();
    const filePath = await writeSkillMd(
      dir,
      `# TDD Skill
Just content, no frontmatter.
`,
    );

    const result = await parseSkillFrontmatter(filePath);

    expect(result).toBeUndefined();
  });

  it('returns undefined for frontmatter missing name field', async () => {
    const dir = await trackTempDir();
    const filePath = await writeSkillMd(
      dir,
      `---
description: Some description
version: "1.0"
---

# Content
`,
    );

    const result = await parseSkillFrontmatter(filePath);

    expect(result).toBeUndefined();
  });

  it('returns undefined for frontmatter missing description field', async () => {
    const dir = await trackTempDir();
    const filePath = await writeSkillMd(
      dir,
      `---
name: tdd
version: "1.0"
---

# Content
`,
    );

    const result = await parseSkillFrontmatter(filePath);

    expect(result).toBeUndefined();
  });

  it('extracts only name and description from frontmatter with extra fields', async () => {
    const dir = await trackTempDir();
    const filePath = await writeSkillMd(
      dir,
      `---
name: typescript-strict
description: TypeScript strict mode patterns
version: "2.0"
domain: engineering
tags:
  - typescript
  - strict
---

# TypeScript Strict
`,
    );

    const result = await parseSkillFrontmatter(filePath);

    expect(result).toEqual({
      name: 'typescript-strict',
      description: 'TypeScript strict mode patterns',
    });
  });
});

describe('validateSkillName', () => {
  it('accepts valid names with lowercase letters and hyphens', () => {
    expect(validateSkillName('tdd')).toBeUndefined();
    expect(validateSkillName('typescript-strict')).toBeUndefined();
    expect(validateSkillName('my-skill-123')).toBeUndefined();
  });

  it('rejects names over 64 characters', () => {
    const longName = 'a'.repeat(65);

    const result = validateSkillName(longName);

    expect(result).toBeDefined();
    expect(result).toContain('64');
  });

  it('accepts names exactly 64 characters', () => {
    const name = 'a'.repeat(64);

    expect(validateSkillName(name)).toBeUndefined();
  });

  it('rejects names with uppercase letters', () => {
    const result = validateSkillName('MySkill');

    expect(result).toBeDefined();
    expect(result).toContain('lowercase');
  });

  it('rejects reserved word "anthropic"', () => {
    const result = validateSkillName('anthropic');

    expect(result).toBeDefined();
    expect(result).toContain('reserved');
  });

  it('rejects reserved word "claude"', () => {
    const result = validateSkillName('claude');

    expect(result).toBeDefined();
    expect(result).toContain('reserved');
  });

  it('rejects names with special characters', () => {
    expect(validateSkillName('my_skill')).toBeDefined();
    expect(validateSkillName('my skill')).toBeDefined();
    expect(validateSkillName('my.skill')).toBeDefined();
    expect(validateSkillName('my@skill')).toBeDefined();
  });

  it('rejects names containing XML tags', () => {
    const result = validateSkillName('<tag>name</tag>');

    expect(result).toBeDefined();
  });

  it('rejects empty names', () => {
    const result = validateSkillName('');

    expect(result).toBeDefined();
  });
});

describe('deriveDisplayTitle', () => {
  it('uses frontmatter name when available', () => {
    const result = deriveDisplayTitle('/skills/engineering-team/tdd', {
      name: 'tdd',
      description: 'TDD skill',
    });

    expect(result).toBe('tdd');
  });

  it('falls back to last path segment when no frontmatter', () => {
    const result = deriveDisplayTitle('/skills/engineering-team/typescript-strict', undefined);

    expect(result).toBe('typescript-strict');
  });

  it('falls back to last path segment when frontmatter is undefined', () => {
    const result = deriveDisplayTitle('/skills/agent-browser', undefined);

    expect(result).toBe('agent-browser');
  });
});
