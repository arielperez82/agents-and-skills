import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';

import { parse as parseYaml } from 'yaml';

type FrontmatterResult = {
  readonly name: string;
  readonly description: string;
};

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;

const RESERVED_NAMES: ReadonlyArray<string> = ['anthropic', 'claude'];

const NAME_PATTERN = /^[a-z0-9-]+$/;

const XML_TAG_PATTERN = /<[^>]+>/;

const parseSkillFrontmatter = async (
  skillMdPath: string,
): Promise<FrontmatterResult | undefined> => {
  const content = await readFile(skillMdPath, 'utf-8').catch(() => undefined);

  if (content === undefined) {
    return undefined;
  }

  const match = FRONTMATTER_REGEX.exec(content);
  if (!match?.[1]) {
    return undefined;
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(match[1]);
  } catch {
    return undefined;
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return undefined;
  }

  const record = parsed as Record<string, unknown>;
  const name = record['name'];
  const description = record['description'];

  if (typeof name !== 'string' || typeof description !== 'string') {
    return undefined;
  }

  return { name, description };
};

const validateSkillName = (name: string): string | undefined => {
  if (name.length === 0) {
    return 'Name must not be empty';
  }

  if (name.length > 64) {
    return `Name must be at most 64 characters (got ${String(name.length)})`;
  }

  if (XML_TAG_PATTERN.test(name)) {
    return 'Name must not contain XML tags';
  }

  if (!NAME_PATTERN.test(name)) {
    return 'Name must contain only lowercase letters, numbers, and hyphens';
  }

  if (RESERVED_NAMES.includes(name)) {
    return `Name "${name}" is reserved and cannot be used`;
  }

  return undefined;
};

const deriveDisplayTitle = (
  skillDir: string,
  frontmatter: FrontmatterResult | undefined,
): string => {
  if (frontmatter !== undefined) {
    return frontmatter.name;
  }

  return basename(skillDir);
};

export { deriveDisplayTitle, parseSkillFrontmatter, validateSkillName };
export type { FrontmatterResult };
