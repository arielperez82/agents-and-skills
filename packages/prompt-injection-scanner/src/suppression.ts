import type { Finding } from './types.js';

export type SuppressionDirective = {
  readonly category: string;
  readonly justification: string;
  readonly scope: 'inline' | 'file';
  readonly line: number;
};

const INLINE_PATTERN =
  /<!--\s*pips-allow:\s*(.+?)\s*-->/g;

const FILE_PATTERN =
  /<!--\s*pips-allow-file:\s*(.+?)\s*-->/g;

const parseDirectiveBody = (
  body: string,
): { readonly category: string; readonly justification: string } => {
  const separatorIndex = body.indexOf('--');
  if (separatorIndex === -1) {
    return { category: body.trim(), justification: '' };
  }

  const category = body.slice(0, separatorIndex).trim();
  const justification = body.slice(separatorIndex + 2).trim();
  return { category, justification };
};

const lineNumberOf = (content: string, charIndex: number): number => {
  const prefix = content.slice(0, charIndex);
  return prefix.split('\n').length;
};

const parseWithPattern = (
  content: string,
  pattern: RegExp,
  scope: 'inline' | 'file',
): readonly SuppressionDirective[] => {
  const directives: SuppressionDirective[] = [];
  const regex = new RegExp(pattern.source, pattern.flags);
  let match = regex.exec(content);

  while (match !== null) {
    const body = match[1] ?? '';
    const { category, justification } = parseDirectiveBody(body);
    directives.push({
      category,
      justification,
      scope,
      line: lineNumberOf(content, match.index),
    });
    match = regex.exec(content);
  }

  return directives;
};

export const parseSuppressionsFromContent = (
  content: string,
): readonly SuppressionDirective[] => {
  if (content === '') return [];

  return [
    ...parseWithPattern(content, INLINE_PATTERN, 'inline'),
    ...parseWithPattern(content, FILE_PATTERN, 'file'),
  ];
};

const createMissingJustificationFinding = (
  directive: SuppressionDirective,
): Finding => ({
  category: 'suppression',
  severity: 'HIGH',
  rawSeverity: 'HIGH',
  contextReason: 'Suppression directive missing justification',
  line: directive.line,
  column: 1,
  matchedText: `pips-allow${directive.scope === 'file' ? '-file' : ''}: ${directive.category}`,
  patternId: 'suppression-missing-justification',
  message: `Suppression directive for "${directive.category}" is missing a justification. Add a justification after "--".`,
  context: 'body',
});

const isInlineMatch = (
  finding: Finding,
  directive: SuppressionDirective,
): boolean =>
  directive.scope === 'inline' &&
  finding.category === directive.category &&
  (finding.line === directive.line || finding.line === directive.line + 1);

const isFileMatch = (
  finding: Finding,
  directive: SuppressionDirective,
): boolean =>
  directive.scope === 'file' && finding.category === directive.category;

export const applySuppressions = (
  findings: readonly Finding[],
  directives: readonly SuppressionDirective[],
): readonly Finding[] => {
  const usedInlineDirectives = new Set<number>();

  const processedFindings = findings.map((finding) => {
    const fileDirective = directives.find((d) => isFileMatch(finding, d));
    if (fileDirective) {
      return {
        ...finding,
        suppressed: true as const,
        suppressionJustification: fileDirective.justification,
      };
    }

    const inlineIndex = directives.findIndex(
      (d, idx) =>
        isInlineMatch(finding, d) && !usedInlineDirectives.has(idx),
    );

    if (inlineIndex !== -1) {
      usedInlineDirectives.add(inlineIndex);
      const directive = directives[inlineIndex];
      if (directive === undefined) return finding;
      return {
        ...finding,
        suppressed: true as const,
        suppressionJustification: directive.justification,
      };
    }

    return finding;
  });

  const missingJustificationFindings = directives
    .filter((d) => d.justification === '')
    .map(createMissingJustificationFinding);

  return [...processedFindings, ...missingJustificationFindings];
};
