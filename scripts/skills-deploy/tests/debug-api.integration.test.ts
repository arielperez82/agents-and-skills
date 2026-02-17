/**
 * Integration test to verify skill creation and versioning against the real API.
 *
 * Run with: ANTHROPIC_API_KEY=<key> pnpm test:integration
 */
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createSkill, createSkillVersion } from '../src/api-client.js';
import { buildSkillZip } from '../src/zip-builder.js';

const API_KEY = process.env['ANTHROPIC_API_KEY'] ?? '';
const BASE_URL = process.env['ANTHROPIC_API_BASE_URL'] ?? 'https://api.anthropic.com';

const HEADERS = {
  'x-api-key': API_KEY,
  'anthropic-version': '2023-06-01',
  'anthropic-beta': 'skills-2025-10-02',
};

const sleep = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

const UNIQUE_SUFFIX = Date.now().toString(36);
const SKILL_NAME = `test-deploy-${UNIQUE_SUFFIX}`;

let tempDir: string;
let skillDir: string;
let createdSkillId: string | undefined;

beforeAll(async () => {
  if (!API_KEY) {
    throw new Error('ANTHROPIC_API_KEY is required for integration tests');
  }

  tempDir = await mkdtemp(join(tmpdir(), 'skill-deploy-test-'));
  skillDir = join(tempDir, 'skills', SKILL_NAME);
  await mkdir(skillDir, { recursive: true });

  await writeFile(
    join(skillDir, 'SKILL.md'),
    `---
name: ${SKILL_NAME}
description: "Temporary skill for verifying deploy pipeline"
---

# Test Deploy

Minimal test skill for integration testing.
`,
  );
});

afterAll(async () => {
  if (createdSkillId) {
    console.log(`Cleanup: DELETE /v1/skills/${createdSkillId}`);
    await fetch(`${BASE_URL}/v1/skills/${createdSkillId}`, {
      method: 'DELETE',
      headers: HEADERS,
    });
  }
  if (tempDir) {
    await rm(tempDir, { recursive: true, force: true });
  }
});

describe('Skills API - end-to-end', () => {
  it('should create a skill via createSkill', async () => {
    const zipBuffer = await buildSkillZip({ skillDir, rootDir: tempDir });

    const result = await createSkill({
      displayTitle: SKILL_NAME,
      zipBuffer,
      apiKey: API_KEY,
      baseUrl: BASE_URL,
    });

    console.log(`Created skill: ${result.id} (${result.display_title})`);
    createdSkillId = result.id;

    expect(result.id).toBeTruthy();
    expect(result.display_title).toBe(SKILL_NAME);
  });

  it('should create a version via createSkillVersion', async () => {
    if (createdSkillId === undefined) {
      throw new Error('Skill was not created in previous test');
    }

    await sleep(3000);

    const zipBuffer = await buildSkillZip({ skillDir, rootDir: tempDir });

    const result = await createSkillVersion({
      skillId: createdSkillId,
      zipBuffer,
      apiKey: API_KEY,
      baseUrl: BASE_URL,
    });

    console.log(`Created version: ${result.version} for skill ${result.skill_id}`);

    expect(result.skill_id).toBe(createdSkillId);
    expect(result.version).toBeTruthy();
  });
});
