#!/usr/bin/env npx tsx

import parseDiff from 'parse-diff';

export type DiffPrefilterOutput = {
  readonly files: ReadonlyArray<{
    readonly path: string;
    readonly oldPath?: string;
    readonly linesAdded: number;
    readonly linesRemoved: number;
    readonly significance: 'trivial' | 'moderate' | 'significant';
    readonly fileType: string;
    readonly changedFunctions: ReadonlyArray<{
      readonly name: string;
      readonly linesChanged: number;
    }>;
    readonly rawHunks?: string;
  }>;
  readonly summary: {
    readonly totalFiles: number;
    readonly totalLinesChanged: number;
    readonly trivialFiles: number;
    readonly moderateFiles: number;
    readonly significantFiles: number;
  };
};

type Significance = 'trivial' | 'moderate' | 'significant';

type ChangedFunction = {
  readonly name: string;
  readonly linesChanged: number;
};

type ParsedFile = ReturnType<typeof parseDiff>[number];

type SignificanceCounts = {
  readonly trivial: number;
  readonly moderate: number;
  readonly significant: number;
};

const EXTENSION_TO_TYPE: Readonly<Record<string, string>> = {
  ts: 'typescript',
  tsx: 'typescript',
  js: 'javascript',
  jsx: 'javascript',
  md: 'markdown',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  py: 'python',
  sh: 'shell',
};

const CODE_EXTENSIONS = new Set([
  'ts',
  'tsx',
  'js',
  'jsx',
  'py',
  'sh',
  'go',
  'rs',
  'java',
  'kt',
  'swift',
  'rb',
  'php',
  'c',
  'cpp',
  'h',
]);

const FUNCTION_BASE_PATTERNS = [
  /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(/,
  /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\(/,
  /(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*\S+\s*)?=>/,
];

// nosemgrep: detect-non-literal-regexp -- patterns built from hardcoded FUNCTION_BASE_PATTERNS, not user input
const FUNCTION_PATTERNS = FUNCTION_BASE_PATTERNS.flatMap((base) => [
  new RegExp(`^\\+\\s*${base.source}`),
  new RegExp(`^-\\s*${base.source}`),
]);

const getExtension = (filePath: string): string => {
  const lastDot = filePath.lastIndexOf('.');
  return lastDot === -1 ? '' : filePath.slice(lastDot + 1);
};

const getFileType = (filePath: string): string => {
  const ext = getExtension(filePath);
  return EXTENSION_TO_TYPE[ext] ?? ext;
};

const isRename = (file: ParsedFile): boolean =>
  file.from !== file.to &&
  file.from !== '/dev/null' &&
  file.to !== '/dev/null';

const getFilePath = (file: ParsedFile): string =>
  file.to === '/dev/null' ? (file.from ?? '') : (file.to ?? '');

const getOldPath = (file: ParsedFile): string | undefined =>
  isRename(file) ? (file.from ?? undefined) : undefined;

const extractChangedLines = (file: ParsedFile): ReadonlyArray<string> =>
  file.chunks.flatMap((chunk) =>
    chunk.changes
      .filter((change) => change.type === 'add' || change.type === 'del')
      .map((change) => change.content),
  );

const isWhitespaceOrImportOnly = (
  lines: ReadonlyArray<string>,
): boolean => {
  if (lines.length === 0) return true;
  return lines.every((line) => {
    const content = line.slice(1).trim();
    return (
      content.length === 0 ||
      content.startsWith('import ') ||
      content.startsWith('import{') ||
      content.startsWith('from ') ||
      content.startsWith('require(')
    );
  });
};

const detectFunctions = (
  lines: ReadonlyArray<string>,
  filePath: string,
): ReadonlyArray<ChangedFunction> => {
  const ext = getExtension(filePath);
  if (!CODE_EXTENSIONS.has(ext)) return [];

  const functionMap = new Map<string, number>();

  for (const line of lines) {
    for (const pattern of FUNCTION_PATTERNS) {
      const match = pattern.exec(line);
      if (match?.[1]) {
        const name = match[1];
        functionMap.set(name, (functionMap.get(name) ?? 0) + 1);
      }
    }
  }

  return [...functionMap.entries()].map(([name, linesChanged]) => ({
    name,
    linesChanged,
  }));
};

const classifySignificance = (
  linesAdded: number,
  linesRemoved: number,
  changedFunctions: ReadonlyArray<ChangedFunction>,
  changedLines: ReadonlyArray<string>,
): Significance => {
  const totalLines = linesAdded + linesRemoved;

  if (totalLines === 0) return 'trivial';
  if (isWhitespaceOrImportOnly(changedLines)) return 'trivial';

  if (changedFunctions.length > 0) return 'significant';
  if (totalLines >= 50) return 'significant';

  if (totalLines <= 5) return 'trivial';

  return 'moderate';
};

const buildRawHunks = (file: ParsedFile): string =>
  file.chunks
    .map(
      (chunk) =>
        `${chunk.content}\n${chunk.changes.map((c) => c.content).join('\n')}`,
    )
    .join('\n');

const processFile = (
  file: ParsedFile,
): DiffPrefilterOutput['files'][number] => {
  const path = getFilePath(file);
  const oldPath = getOldPath(file);
  const linesAdded = file.additions;
  const linesRemoved = file.deletions;
  const fileType = getFileType(path);
  const changedLines = extractChangedLines(file);
  const changedFunctions = detectFunctions(changedLines, path);
  const significance = classifySignificance(
    linesAdded,
    linesRemoved,
    changedFunctions,
    changedLines,
  );
  const rawHunks =
    significance === 'significant' && file.chunks.length > 0
      ? buildRawHunks(file)
      : undefined;

  return {
    path,
    ...(oldPath !== undefined ? { oldPath } : {}),
    linesAdded,
    linesRemoved,
    significance,
    fileType,
    changedFunctions,
    ...(rawHunks !== undefined ? { rawHunks } : {}),
  };
};

const countBySignificance = (
  files: DiffPrefilterOutput['files'],
): SignificanceCounts =>
  files.reduce<SignificanceCounts>(
    (counts, file) => ({
      ...counts,
      [file.significance]: counts[file.significance] + 1,
    }),
    { trivial: 0, moderate: 0, significant: 0 },
  );

export const prefilterDiff = (input: string): DiffPrefilterOutput => {
  const parsed = parseDiff(input);
  const files = parsed.map(processFile);
  const counts = countBySignificance(files);

  const summary = {
    totalFiles: files.length,
    totalLinesChanged: files.reduce(
      (sum, f) => sum + f.linesAdded + f.linesRemoved,
      0,
    ),
    trivialFiles: counts.trivial,
    moderateFiles: counts.moderate,
    significantFiles: counts.significant,
  };

  return { files, summary };
};

const readStdin = (): Promise<string> =>
  new Promise<string>((resolve) => {
    let data = '';
    process.stdin.on('data', (chunk: Buffer) => {
      data += chunk.toString();
    });
    process.stdin.on('end', () => resolve(data));
  });

const isMainModule = (): boolean => {
  const arg1 = process.argv[1] ?? '';
  return (
    arg1.endsWith('prefilter-diff.ts') || arg1.endsWith('prefilter-diff.js')
  );
};

if (isMainModule()) {
  readStdin()
    .then((input) => {
      if (input.trim().length === 0) {
        process.stdout.write(
          JSON.stringify(prefilterDiff(''), null, 2) + '\n',
        );
        process.exit(0);
      }
      try {
        const result = prefilterDiff(input);
        process.stdout.write(JSON.stringify(result, null, 2) + '\n');
        process.exit(0);
      } catch {
        process.stderr.write('Error: Failed to parse diff input\n');
        process.exit(2);
      }
    })
    .catch(() => {
      process.stderr.write('Error: Failed to read stdin\n');
      process.exit(1);
    });
}
