#!/usr/bin/env npx tsx

import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, basename, relative } from 'node:path';
import matter from 'gray-matter';

type FileType = 'charter' | 'roadmap' | 'backlog' | 'plan' | 'report' | 'adr' | 'other';

type FrontmatterResult = {
  readonly valid: boolean;
  readonly initiative?: string;
  readonly initiativeName?: string;
  readonly status?: string;
  readonly missingFields: ReadonlyArray<string>;
};

type FileEntry = {
  readonly path: string;
  readonly type: FileType;
  readonly frontmatter: FrontmatterResult;
  readonly lastModified: string;
  readonly stale: boolean;
  readonly needsLlmReview: boolean;
  readonly staleDays?: number;
};

type InitiativeEntry = {
  readonly id: string;
  readonly hasCharter: boolean;
  readonly hasRoadmap: boolean;
  readonly hasBacklog: boolean;
  readonly hasPlan: boolean;
  readonly hasReport: boolean;
  readonly missingFiles: ReadonlyArray<string>;
};

export type ProgressPrefilterOutput = {
  readonly files: ReadonlyArray<FileEntry>;
  readonly initiatives: ReadonlyArray<InitiativeEntry>;
  readonly summary: {
    readonly totalFiles: number;
    readonly validFrontmatter: number;
    readonly invalidFrontmatter: number;
    readonly staleFiles: number;
    readonly needsLlmReview: number;
  };
};

const STALENESS_THRESHOLD_DAYS = 14;
const CONTENT_HEAVY_TYPES: ReadonlyArray<FileType> = ['charter', 'roadmap', 'backlog', 'plan'];
const TERMINAL_STATUSES: ReadonlyArray<string> = ['completed', 'archived', 'closed'];
const CANONICAL_REQUIRED_FIELDS: ReadonlyArray<string> = ['type', 'initiative', 'initiative_name', 'status'];
const REPORT_REQUIRED_FIELDS: ReadonlyArray<string> = ['type'];
const CANONICAL_FILE_TYPES: ReadonlyArray<string> = ['charter', 'roadmap', 'backlog', 'plan', 'report'];

const FILE_TYPE_VALUES: ReadonlyArray<string> = ['charter', 'roadmap', 'backlog', 'plan', 'report', 'adr', 'other'];

const PREFIX_MAP: ReadonlyArray<readonly [string, FileType]> = [
  ['charter-', 'charter'],
  ['roadmap-', 'roadmap'],
  ['backlog-', 'backlog'],
  ['plan-', 'plan'],
  ['report-', 'report'],
];

const discoverMarkdownFiles = (dirPath: string): ReadonlyArray<string> => {
  try {
    const entries = readdirSync(dirPath, { recursive: true, encoding: 'utf-8' });
    return entries
      .filter((entry) => entry.endsWith('.md'))
      .map((entry) => join(dirPath, entry))
      .filter((fullPath) => statSync(fullPath).isFile());
  } catch {
    return [];
  }
};

const isValidFileType = (value: string): value is FileType =>
  FILE_TYPE_VALUES.includes(value);

const detectFileType = (
  filePath: string,
  rootDir: string,
  frontmatterType?: string,
): FileType => {
  const name = basename(filePath);
  const relativePath = relative(rootDir, filePath);

  if (relativePath.startsWith('adrs/') || relativePath.includes('/adrs/')) {
    return 'adr';
  }

  const matched = PREFIX_MAP.find(([prefix]) => name.startsWith(prefix));
  if (matched) {
    return matched[1];
  }

  if (frontmatterType && isValidFileType(frontmatterType)) {
    return frontmatterType;
  }

  return 'other';
};

const parseFrontmatter = (
  content: string,
): { readonly data: Record<string, unknown>; readonly valid: boolean } => {
  try {
    const result = matter(content);
    return { data: result.data as Record<string, unknown>, valid: true };
  } catch {
    return { data: {}, valid: false };
  }
};

const getRequiredFields = (fileType: FileType): ReadonlyArray<string> => {
  if (CONTENT_HEAVY_TYPES.includes(fileType)) {
    return CANONICAL_REQUIRED_FIELDS;
  }
  if (fileType === 'report') {
    return REPORT_REQUIRED_FIELDS;
  }
  return [];
};

const stringFieldOrUndefined = (data: Record<string, unknown>, key: string): string | undefined =>
  typeof data[key] === 'string' ? data[key] : undefined;

const validateFrontmatter = (
  data: Record<string, unknown>,
  fileType: FileType,
  yamlValid: boolean,
): FrontmatterResult => {
  if (!yamlValid) {
    return { valid: false, missingFields: getRequiredFields(fileType) };
  }

  const requiredFields = getRequiredFields(fileType);
  const missingFields = requiredFields.filter(
    (field) => data[field] === undefined || data[field] === null || data[field] === '',
  );

  const initiative = stringFieldOrUndefined(data, 'initiative');
  const initiativeName = stringFieldOrUndefined(data, 'initiative_name');
  const status = stringFieldOrUndefined(data, 'status');

  return {
    valid: missingFields.length === 0,
    ...(initiative !== undefined ? { initiative } : {}),
    ...(initiativeName !== undefined ? { initiativeName } : {}),
    ...(status !== undefined ? { status } : {}),
    missingFields,
  };
};

const computeStaleness = (
  lastModified: Date,
  status: string | undefined,
): { readonly stale: boolean; readonly staleDays?: number } => {
  const daysSinceModified = Math.floor(
    (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24),
  );

  const isTerminal = status !== undefined && TERMINAL_STATUSES.includes(status);
  const stale = !isTerminal && daysSinceModified > STALENESS_THRESHOLD_DAYS;

  return stale ? { stale: true, staleDays: daysSinceModified } : { stale: false };
};

const computeNeedsLlmReview = (
  frontmatterValid: boolean,
  stale: boolean,
  fileType: FileType,
): boolean =>
  frontmatterValid && !stale && CONTENT_HEAVY_TYPES.includes(fileType);

const processFile = (filePath: string, rootDir: string): FileEntry => {
  const content = readFileSync(filePath, 'utf-8');
  const { data, valid: yamlValid } = parseFrontmatter(content);
  const frontmatterType = stringFieldOrUndefined(data, 'type');
  const fileType = detectFileType(filePath, rootDir, frontmatterType);
  const frontmatter = validateFrontmatter(data, fileType, yamlValid);
  const stat = statSync(filePath);
  const lastModified = stat.mtime;
  const { stale, staleDays } = computeStaleness(lastModified, frontmatter.status);
  const needsLlmReview = computeNeedsLlmReview(frontmatter.valid, stale, fileType);

  return {
    path: relative(rootDir, filePath),
    type: fileType,
    frontmatter,
    lastModified: lastModified.toISOString(),
    stale,
    needsLlmReview,
    ...(staleDays !== undefined ? { staleDays } : {}),
  };
};

const groupInitiatives = (
  files: ReadonlyArray<FileEntry>,
): ReadonlyArray<InitiativeEntry> => {
  const initiativeMap = new Map<string, Set<string>>();

  for (const file of files) {
    const id = file.frontmatter.initiative;
    if (id === undefined) continue;

    const existing = initiativeMap.get(id) ?? new Set<string>();
    existing.add(file.type);
    initiativeMap.set(id, existing);
  }

  return [...initiativeMap.entries()]
    .map(([id, types]) => ({
      id,
      hasCharter: types.has('charter'),
      hasRoadmap: types.has('roadmap'),
      hasBacklog: types.has('backlog'),
      hasPlan: types.has('plan'),
      hasReport: types.has('report'),
      missingFiles: CANONICAL_FILE_TYPES.filter((t) => !types.has(t)),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
};

const buildSummary = (
  files: ReadonlyArray<FileEntry>,
): ProgressPrefilterOutput['summary'] => ({
  totalFiles: files.length,
  validFrontmatter: files.filter((f) => f.frontmatter.valid).length,
  invalidFrontmatter: files.filter((f) => !f.frontmatter.valid).length,
  staleFiles: files.filter((f) => f.stale).length,
  needsLlmReview: files.filter((f) => f.needsLlmReview).length,
});

export const prefilterProgress = (docsPath: string): ProgressPrefilterOutput => {
  const filePaths = discoverMarkdownFiles(docsPath);
  const files = filePaths.map((fp) => processFile(fp, docsPath));
  const initiatives = groupInitiatives(files);
  const summary = buildSummary(files);
  return { files, initiatives, summary };
};

const main = (): void => {
  const docsPath = process.argv[2];

  if (docsPath === undefined || docsPath === '') {
    process.stderr.write('Usage: prefilter-progress.ts <docs-directory>\n');
    process.exit(1);
  }

  try {
    const stat = statSync(docsPath);
    if (!stat.isDirectory()) {
      process.stderr.write(`Error: ${docsPath} is not a directory\n`);
      process.exit(1);
    }
  } catch {
    process.stderr.write(`Error: ${docsPath} does not exist\n`);
    process.exit(1);
  }

  try {
    const output = prefilterProgress(docsPath);
    process.stdout.write(JSON.stringify(output, null, 2) + '\n');
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Parse error: ${message}\n`);
    process.exit(2);
  }
};

main();
