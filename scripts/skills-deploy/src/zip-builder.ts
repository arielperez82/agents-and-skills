import archiver from 'archiver';
import { basename } from 'node:path';
import { PassThrough } from 'node:stream';

type BuildSkillZipOptions = {
  readonly skillDir: string;
  readonly rootDir: string;
};

const collectBuffer = (stream: PassThrough): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => {
      chunks.push(chunk);
    });
    stream.on('end', () => resolve(Buffer.concat(chunks)));
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

  archive.directory(skillDir, skillName);

  const finalizeAndCollect = async (): Promise<Buffer> => {
    await archive.finalize();
    return bufferPromise;
  };

  return finalizeAndCollect();
};

export { buildSkillZip };
export type { BuildSkillZipOptions };
