import { describe, expect, it } from 'vitest';

import { scanAllSkillDirs } from './skill-scanner.js';
import type { FileTreeReader } from './ports.js';

class FakeFileTreeReader implements FileTreeReader {
  constructor(private readonly files: readonly string[]) {}

  readRecursive(_dir: string): Promise<readonly string[]> {
    return Promise.resolve(this.files);
  }
}

describe('scanAllSkillDirs', () => {
  it('returns empty array when no files exist', async () => {
    const reader = new FakeFileTreeReader([]);

    const result = await scanAllSkillDirs('/repo', { fileTreeReader: reader });

    expect(result).toEqual([]);
  });

  it('returns skill dir for a SKILL.md file', async () => {
    const reader = new FakeFileTreeReader(['agent-browser/SKILL.md']);

    const result = await scanAllSkillDirs('/repo', { fileTreeReader: reader });

    expect(result).toEqual(['skills/agent-browser']);
  });

  it('returns skill dir for deeply nested SKILL.md file', async () => {
    const reader = new FakeFileTreeReader(['engineering-team/tdd/SKILL.md']);

    const result = await scanAllSkillDirs('/repo', { fileTreeReader: reader });

    expect(result).toEqual(['skills/engineering-team/tdd']);
  });

  it('ignores files that are not named SKILL.md', async () => {
    const reader = new FakeFileTreeReader([
      'engineering-team/tdd/README.md',
      'engineering-team/tdd/references/guide.md',
    ]);

    const result = await scanAllSkillDirs('/repo', { fileTreeReader: reader });

    expect(result).toEqual([]);
  });

  it('returns multiple skill dirs sorted alphabetically', async () => {
    const reader = new FakeFileTreeReader([
      'engineering-team/typescript-strict/SKILL.md',
      'agent-browser/SKILL.md',
      'engineering-team/tdd/SKILL.md',
    ]);

    const result = await scanAllSkillDirs('/repo', { fileTreeReader: reader });

    expect(result).toEqual([
      'skills/agent-browser',
      'skills/engineering-team/tdd',
      'skills/engineering-team/typescript-strict',
    ]);
  });

  it('mixes SKILL.md and non-SKILL.md files correctly', async () => {
    const reader = new FakeFileTreeReader([
      'engineering-team/tdd/SKILL.md',
      'engineering-team/tdd/references/frameworks.md',
      'engineering-team/tdd/scripts/run.sh',
      'agent-browser/README.md',
    ]);

    const result = await scanAllSkillDirs('/repo', { fileTreeReader: reader });

    expect(result).toEqual(['skills/engineering-team/tdd']);
  });

  it('handles standalone top-level skill dirs', async () => {
    const reader = new FakeFileTreeReader([
      'mermaid-diagrams/SKILL.md',
      'research/SKILL.md',
    ]);

    const result = await scanAllSkillDirs('/repo', { fileTreeReader: reader });

    expect(result).toEqual(['skills/mermaid-diagrams', 'skills/research']);
  });
});
