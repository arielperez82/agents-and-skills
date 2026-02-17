import { readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import { PassThrough } from 'node:stream';

import archiver from 'archiver';

type BuildSkillZipOptions = {
  readonly skillDir: string;
  readonly rootDir: string;
};

const FRONTMATTER_REGEX = /^---\n([\s\S]*?)\n---/;
const API_ALLOWED_FIELDS = ['name', 'description'] as const;

const sanitizeSkillMd = (content: string): string => {
  const match = FRONTMATTER_REGEX.exec(content);
  if (!match?.[1]) {
    return content;
  }

  const lines = match[1].split('\n');
  const sanitizedLines: string[] = [];
  let skipBlock = false;

  for (const line of lines) {
    const isTopLevel = !line.startsWith(' ') && !line.startsWith('\t');

    if (isTopLevel) {
      const key = line.split(':')[0]?.trim() ?? '';
      if (API_ALLOWED_FIELDS.includes(key as (typeof API_ALLOWED_FIELDS)[number])) {
        skipBlock = false;
        sanitizedLines.push(line);
      } else {
        skipBlock = true;
      }
    } else if (!skipBlock) {
      sanitizedLines.push(line);
    }
  }

  const sanitizedFrontmatter = sanitizedLines.join('\n');

  if (sanitizedFrontmatter === match[1]) {
    return content;
  }

  return content.replace(FRONTMATTER_REGEX, `---\n${sanitizedFrontmatter}\n---`);
};

const collectBuffer = (stream: PassThrough): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    stream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    stream.on('error', reject);
  });

const buildSkillZip = (options: BuildSkillZipOptions): Promise<Buffer> => {
  const { skillDir } = options;
  const skillName = basename(skillDir);

  const output = new PassThrough();
  const bufferPromise = collectBuffer(output);

  const archive = archiver('zip', { zlib: { level: 9 } });

  archive.on('error', (err: Error) => {
    output.destroy(err);
  });

  archive.pipe(output);

  const skillMdPath = join(skillDir, 'SKILL.md');
  try {
    const originalContent = readFileSync(skillMdPath, 'utf-8');
    const sanitizedContent = sanitizeSkillMd(originalContent);
    archive.append(sanitizedContent, { name: join(skillName, 'SKILL.md') });
    archive.directory(skillDir, skillName, (entry) => (entry.name === 'SKILL.md' ? false : entry));
  } catch {
    archive.directory(skillDir, skillName);
  }

  const finalizeAndCollect = async (): Promise<Buffer> => {
    await archive.finalize();
    return bufferPromise;
  };

  return finalizeAndCollect();
};

export { buildSkillZip };
export type { BuildSkillZipOptions };
