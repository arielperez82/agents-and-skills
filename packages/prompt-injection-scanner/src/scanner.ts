import matter from 'gray-matter';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import { SKIP, visit } from 'unist-util-visit';
import type { Heading, Root, Text } from 'mdast';

import { allCategories } from '../patterns/index.js';
import type {
  Finding,
  PatternCategory,
  PatternRule,
  ScanOptions,
  ScanResult,
} from './types.js';

type ContentSegment = {
  readonly text: string;
  readonly line: number;
  readonly column: number;
  readonly context: string;
};

const buildSummary = (findings: readonly Finding[]) => ({
  total: findings.length,
  critical: findings.filter((f) => f.severity === 'CRITICAL').length,
  high: findings.filter((f) => f.severity === 'HIGH').length,
  medium: findings.filter((f) => f.severity === 'MEDIUM').length,
  low: findings.filter((f) => f.severity === 'LOW').length,
});

const computeLineFromOffset = (
  text: string,
  charOffset: number,
): { readonly lineOffset: number; readonly column: number } => {
  const prefix = text.slice(0, charOffset);
  const newlines = prefix.split('\n').length - 1;
  const lastNewline = prefix.lastIndexOf('\n');
  const column =
    lastNewline === -1 ? charOffset + 1 : charOffset - lastNewline;
  return { lineOffset: newlines, column };
};

const matchRule = (
  segment: ContentSegment,
  rule: PatternRule,
  categoryId: string,
): Finding | undefined => {
  const match = rule.pattern.exec(segment.text);
  if (!match) return undefined;

  const matchIndex = match.index;
  const { lineOffset, column } = computeLineFromOffset(
    segment.text,
    matchIndex,
  );

  return {
    category: categoryId,
    severity: rule.severity,
    line: segment.line + lineOffset,
    column,
    matchedText: match[0],
    patternId: rule.id,
    message: rule.message,
    context: segment.context,
  };
};

const applyPatterns = (
  segments: readonly ContentSegment[],
  categories: readonly PatternCategory[],
): readonly Finding[] =>
  segments.flatMap((segment) =>
    categories.flatMap((category) =>
      category.rules.flatMap((rule) => {
        const finding = matchRule(segment, rule, category.id);
        return finding ? [finding] : [];
      }),
    ),
  );

const extractFrontmatterValue = (value: unknown): readonly string[] => {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value))
    return value.flatMap((item: unknown) => extractFrontmatterValue(item));
  return [];
};

const hasFrontmatter = (content: string): boolean =>
  content.startsWith('---');

const countFrontmatterLines = (content: string): number => {
  const lines = content.split('\n');
  if (lines[0] !== '---') return 0;

  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') return i + 1;
  }

  return 0;
};

const scanFrontmatter = (content: string): readonly ContentSegment[] => {
  const parsed = matter(content);
  const rawLines = content.split('\n');
  const data = parsed.data as Record<string, unknown>;

  return Object.entries(data).flatMap(([key, value]) => {
    const values = extractFrontmatterValue(value);
    return values.map((text) => {
      const lineIndex = rawLines.findIndex(
        (rawLine) => rawLine.includes(key) && rawLine.includes(text),
      );
      return {
        text,
        line: lineIndex === -1 ? 1 : lineIndex + 1,
        column: 1,
        context: `frontmatter:${key}`,
      };
    });
  });
};

const getHeadingText = (heading: Heading): string =>
  heading.children
    .filter((child): child is Text => child.type === 'text')
    .map((child) => child.value)
    .join('');

const collectHeadingRanges = (
  tree: Root,
): ReadonlyMap<number, string> => {
  const headingAtLine = new Map<number, string>();
  visit(tree, 'heading', (node: Heading) => {
    const startLine = node.position?.start.line ?? 1;
    headingAtLine.set(startLine, getHeadingText(node));
  });
  return headingAtLine;
};

const findCurrentHeading = (
  headingAtLine: ReadonlyMap<number, string>,
  nodeLine: number,
): string | undefined => {
  let result: string | undefined;
  let closestLine = 0;

  for (const [line, text] of headingAtLine) {
    if (line < nodeLine && line > closestLine) {
      closestLine = line;
      result = text;
    }
  }

  return result;
};

const scanBody = (content: string): readonly ContentSegment[] => {
  const parsed = matter(content);
  const bodyContent = parsed.content;

  if (bodyContent.trim() === '') return [];

  const tree = unified().use(remarkParse).parse(bodyContent);
  const lineOffset = hasFrontmatter(content)
    ? countFrontmatterLines(content)
    : 0;
  const headingAtLine = collectHeadingRanges(tree);
  const segments: ContentSegment[] = [];

  visit(tree, (node) => {
    if (node.type === 'heading') {
      return SKIP;
    }

    if (node.type === 'code') {
      const nodeLine = node.position?.start.line ?? 1;
      segments.push({
        text: node.value,
        line: nodeLine + lineOffset,
        column: node.position?.start.column ?? 1,
        context: 'body:code-block',
      });
      return SKIP;
    }

    if (node.type === 'html') {
      const nodeLine = node.position?.start.line ?? 1;
      segments.push({
        text: node.value,
        line: nodeLine + lineOffset,
        column: node.position?.start.column ?? 1,
        context: 'body:html-comment',
      });
      return SKIP;
    }

    if (node.type === 'text') {
      const nodeLine = node.position?.start.line ?? 1;
      const heading = findCurrentHeading(headingAtLine, nodeLine);
      const headingContext = heading ? `body:heading:${heading}` : 'body';
      segments.push({
        text: node.value,
        line: nodeLine + lineOffset,
        column: node.position?.start.column ?? 1,
        context: headingContext,
      });
    }

    return undefined;
  });

  return segments;
};

export const scan = (
  content: string,
  _options?: ScanOptions,
): ScanResult => {
  if (content.trim() === '') {
    return { findings: [], summary: buildSummary([]) };
  }

  const frontmatterSegments = hasFrontmatter(content)
    ? scanFrontmatter(content)
    : [];
  const bodySegments = scanBody(content);
  const allSegments = [...frontmatterSegments, ...bodySegments];
  const findings = applyPatterns(allSegments, allCategories);

  return {
    findings,
    summary: buildSummary(findings),
  };
};
