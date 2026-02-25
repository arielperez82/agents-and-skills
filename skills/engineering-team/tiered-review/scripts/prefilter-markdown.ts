#!/usr/bin/env npx tsx

import { readFileSync, existsSync } from 'node:fs';
import { dirname, resolve, isAbsolute } from 'node:path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import type { Node } from 'unist';

type HeadingEntry = {
  readonly depth: number;
  readonly text: string;
  readonly lineStart: number;
  readonly lineEnd: number;
  readonly wordCount: number;
};

type LinkEntry = {
  readonly url: string;
  readonly text: string;
  readonly line: number;
  readonly status: 'valid' | 'broken' | 'external';
};

type StructuralIssue = {
  readonly type: string;
  readonly message: string;
  readonly line: number;
};

type FlaggedSection = {
  readonly heading: string;
  readonly lineStart: number;
  readonly lineEnd: number;
  readonly reason: string;
  readonly excerpt: string;
};

type FileResult = {
  readonly path: string;
  readonly headingTree: ReadonlyArray<HeadingEntry>;
  readonly links: ReadonlyArray<LinkEntry>;
  readonly codeBlocks: number;
  readonly totalWordCount: number;
  readonly missingSections: ReadonlyArray<string>;
  readonly structuralIssues: ReadonlyArray<StructuralIssue>;
  readonly flaggedSections: ReadonlyArray<FlaggedSection>;
};

export type MarkdownPrefilterOutput = {
  readonly files: ReadonlyArray<FileResult>;
  readonly summary: {
    readonly totalFiles: number;
    readonly totalIssues: number;
    readonly filesNeedingLlmReview: number;
  };
};

type MdastNode = Node & {
  readonly children?: ReadonlyArray<MdastNode>;
  readonly depth?: number;
  readonly value?: string;
  readonly url?: string;
  readonly position?: {
    readonly start: { readonly line: number };
    readonly end: { readonly line: number };
  };
};

type RawHeading = {
  readonly depth: number;
  readonly text: string;
  readonly lineStart: number;
};

type AstExtraction = {
  readonly headings: ReadonlyArray<RawHeading>;
  readonly links: ReadonlyArray<LinkEntry>;
  readonly codeBlocks: number;
};

type SectionAnalysis = {
  readonly structuralIssues: ReadonlyArray<StructuralIssue>;
  readonly flaggedSections: ReadonlyArray<FlaggedSection>;
};

const COMMON_SECTIONS = ['Purpose', 'When to Use'] as const;
const MIN_SECTION_WORDS = 10;
const MAX_EXCERPT_LENGTH = 200;

const extractTextFromNode = (node: MdastNode): string => {
  if (node.value) return node.value;
  if (!node.children) return '';
  return node.children.map(extractTextFromNode).join('');
};

const countWords = (text: string): number => {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  return trimmed.split(/\s+/).length;
};

const isExternalUrl = (url: string): boolean =>
  url.startsWith('http://') ||
  url.startsWith('https://') ||
  url.startsWith('mailto:') ||
  url.startsWith('//');

const hasFrontmatter = (content: string): boolean => {
  const trimmed = content.trimStart();
  if (!trimmed.startsWith('---')) return false;
  const secondDelimiter = trimmed.indexOf('---', 3);
  return secondDelimiter > 3;
};

const resolveInternalLink = (url: string, fileDir: string): string => {
  const urlWithoutFragment = url.split('#')[0];
  if (urlWithoutFragment.length === 0) return '';
  if (isAbsolute(urlWithoutFragment)) return urlWithoutFragment;
  return resolve(fileDir, urlWithoutFragment);
};

const getLinkStatus = (url: string, fileDir: string): 'valid' | 'broken' | 'external' => {
  if (isExternalUrl(url)) return 'external';
  const resolved = resolveInternalLink(url, fileDir);
  if (resolved.length === 0) return 'valid';
  return existsSync(resolved) ? 'valid' : 'broken';
};

const getSectionContent = (
  lines: ReadonlyArray<string>,
  lineStart: number,
  lineEnd: number,
): string =>
  lines
    .slice(lineStart, lineEnd)
    .filter((line) => !line.startsWith('#'))
    .join('\n')
    .trim();

const computeLineEnd = (
  index: number,
  headingStarts: ReadonlyArray<number>,
  totalLines: number,
): number =>
  index < headingStarts.length - 1
    ? headingStarts[index + 1] - 1
    : totalLines;

const extractAstData = (tree: MdastNode, fileDir: string): AstExtraction => {
  const headings: Array<RawHeading> = [];
  const links: Array<LinkEntry> = [];
  let codeBlocks = 0;

  visit(tree as Node, (node: Node) => {
    const mdNode = node as MdastNode;

    if (mdNode.type === 'heading' && mdNode.position) {
      headings.push({
        depth: mdNode.depth ?? 1,
        text: extractTextFromNode(mdNode),
        lineStart: mdNode.position.start.line,
      });
    }

    if (mdNode.type === 'link' && mdNode.position && mdNode.url) {
      links.push({
        url: mdNode.url,
        text: extractTextFromNode(mdNode),
        line: mdNode.position.start.line,
        status: getLinkStatus(mdNode.url, fileDir),
      });
    }

    if (mdNode.type === 'code') {
      codeBlocks += 1;
    }
  });

  return { headings, links, codeBlocks };
};

const buildHeadingTree = (
  rawHeadings: ReadonlyArray<RawHeading>,
  lines: ReadonlyArray<string>,
  totalLines: number,
): ReadonlyArray<HeadingEntry> => {
  const headingStarts = rawHeadings.map((h) => h.lineStart);

  return rawHeadings.map((h, i) => {
    const lineEnd = computeLineEnd(i, headingStarts, totalLines);
    const sectionText = getSectionContent(lines, h.lineStart - 1, lineEnd);
    return {
      depth: h.depth,
      text: h.text,
      lineStart: h.lineStart,
      lineEnd,
      wordCount: countWords(sectionText),
    };
  });
};

const detectMissingSections = (
  content: string,
  headingTexts: ReadonlyArray<string>,
): ReadonlyArray<string> => {
  const missing: Array<string> = [];

  if (!hasFrontmatter(content)) {
    missing.push('Frontmatter (--- delimiters)');
  }

  return [
    ...missing,
    ...COMMON_SECTIONS.filter(
      (section) => !headingTexts.includes(section.toLowerCase()),
    ),
  ];
};

const analyzeSections = (
  headingTree: ReadonlyArray<HeadingEntry>,
  links: ReadonlyArray<LinkEntry>,
  lines: ReadonlyArray<string>,
): SectionAnalysis => {
  const structuralIssues: Array<StructuralIssue> = [];
  const flaggedSections: Array<FlaggedSection> = [];

  headingTree.forEach((heading) => {
    const sectionText = getSectionContent(lines, heading.lineStart - 1, heading.lineEnd);
    const sectionWordCount = countWords(sectionText);
    const excerpt = sectionText.slice(0, MAX_EXCERPT_LENGTH);

    const sectionLinks = links.filter(
      (link) => link.line >= heading.lineStart && link.line <= heading.lineEnd,
    );
    const brokenLinks = sectionLinks.filter((l) => l.status === 'broken');

    if (sectionWordCount === 0) {
      structuralIssues.push({
        type: 'empty-section',
        message: `Section "${heading.text}" is empty`,
        line: heading.lineStart,
      });
      flaggedSections.push({
        heading: heading.text,
        lineStart: heading.lineStart,
        lineEnd: heading.lineEnd,
        reason: 'Empty section with no content',
        excerpt,
      });
    } else if (sectionWordCount < MIN_SECTION_WORDS) {
      flaggedSections.push({
        heading: heading.text,
        lineStart: heading.lineStart,
        lineEnd: heading.lineEnd,
        reason: `Short section with only ${sectionWordCount} words`,
        excerpt,
      });
    }

    if (brokenLinks.length > 0) {
      flaggedSections.push({
        heading: heading.text,
        lineStart: heading.lineStart,
        lineEnd: heading.lineEnd,
        reason: `Section contains ${brokenLinks.length} broken link(s)`,
        excerpt,
      });
    }
  });

  return { structuralIssues, flaggedSections };
};

const EMPTY_FILE_RESULT = (filePath: string): FileResult => ({
  path: filePath,
  headingTree: [],
  links: [],
  codeBlocks: 0,
  totalWordCount: 0,
  missingSections: [],
  structuralIssues: [],
  flaggedSections: [],
});

const analyzeFile = (filePath: string): FileResult => {
  const content = readFileSync(filePath, 'utf-8');
  if (content.trim().length === 0) return EMPTY_FILE_RESULT(filePath);

  const fileDir = dirname(filePath);
  const lines = content.split('\n');
  const tree = unified().use(remarkParse).parse(content) as MdastNode;

  const { headings, links, codeBlocks } = extractAstData(tree, fileDir);
  const headingTree = buildHeadingTree(headings, lines, lines.length);

  const totalWordCount = countWords(
    lines
      .filter((line) => !line.startsWith('```') && !line.startsWith('#'))
      .join(' '),
  );

  const headingTexts = headings.map((h) => h.text.toLowerCase());
  const missingSections = detectMissingSections(content, headingTexts);
  const { structuralIssues, flaggedSections } = analyzeSections(headingTree, links, lines);

  return {
    path: filePath,
    headingTree,
    links,
    codeBlocks,
    totalWordCount,
    missingSections,
    structuralIssues,
    flaggedSections,
  };
};

const countFileIssues = (file: FileResult): number =>
  file.missingSections.length +
  file.structuralIssues.length +
  file.flaggedSections.length +
  file.links.filter((l) => l.status === 'broken').length;

export const prefilterMarkdown = (
  filePaths: ReadonlyArray<string>,
): MarkdownPrefilterOutput => {
  const files = filePaths.map(analyzeFile);
  const totalIssues = files.reduce((sum, file) => sum + countFileIssues(file), 0);
  const filesNeedingLlmReview = files.filter((file) => countFileIssues(file) > 0).length;

  return {
    files,
    summary: {
      totalFiles: files.length,
      totalIssues,
      filesNeedingLlmReview,
    },
  };
};

const main = (): void => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    process.stderr.write('Error: No file paths provided\n');
    process.stderr.write('Usage: npx tsx prefilter-markdown.ts file1.md file2.md ...\n');
    process.exit(1);
  }

  const missingFiles = args.filter((f) => !existsSync(f));
  if (missingFiles.length > 0) {
    process.stderr.write(`Error: Files not found: ${missingFiles.join(', ')}\n`);
    process.exit(1);
  }

  try {
    const result = prefilterMarkdown(args);
    process.stdout.write(JSON.stringify(result, null, 2));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`Error: Parse error - ${message}\n`);
    process.exit(2);
  }
};

main();
