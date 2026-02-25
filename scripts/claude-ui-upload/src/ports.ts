export type FileTreeReader = {
  readonly readRecursive: (dir: string) => Promise<readonly string[]>;
};

export type SkillZipBuilder = {
  readonly build: (skillDir: string) => Promise<Buffer>;
};

export type ZipOutputWriter = {
  readonly writeFile: (path: string, data: Buffer) => Promise<void>;
  readonly ensureDir: (dir: string) => Promise<void>;
};
