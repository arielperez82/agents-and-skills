import { computePosition } from './text-utils.js';
import type { Finding } from './types.js';

export type SuppressionDirective = {
  readonly category: string;
  readonly justification: string;
  readonly scope: 'inline' | 'file';
  readonly line: number;
};

export type SuppressionOptions = {
  readonly noInlineConfig?: boolean;
};

const INLINE_PATTERN = /<!--\s*pips-allow:\s*(.+?)\s*-->/g;

const FILE_PATTERN = /<!--\s*pips-allow-file:\s*(.+?)\s*-->/g;

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
      line: computePosition(content, match.index).line,
    });
    match = regex.exec(content);
  }

  return directives;
};

export const parseSuppressionsFromContent = (content: string): readonly SuppressionDirective[] => {
  if (content === '') return [];

  return [
    ...parseWithPattern(content, INLINE_PATTERN, 'inline'),
    ...parseWithPattern(content, FILE_PATTERN, 'file'),
  ];
};

const createMissingJustificationFinding = (directive: SuppressionDirective): Finding => ({
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

/**
 * Matches an inline suppression directive to a finding.
 *
 * Checks if a suppression directive can suppress a finding based on:
 * - Matching category
 * - Proximity: directive on same line as finding OR on the line immediately before it
 *
 * The proximity is asymmetric by design: suppression comments match findings on the same line
 * or the line *after* the directive, but NOT the line before. This ensures that a suppression
 * comment must come *before* the thing it suppresses, which aligns with how developers naturally
 * write code comments (comments precede the code they document).
 *
 * Example:
 * ```
 * <!-- pips-allow: injection-risk -- code requires dynamic evaluation -->
 * eval(userInput);  // This is suppressed (same line as directive)
 *
 * const risky = eval(userInput);  // This is suppressed (directive on line before)
 *
 * eval(userInput);  // This is NOT suppressed (directive would need to come after)
 * <!-- pips-allow: injection-risk -- too late -->
 * ```
 *
 * @param finding - The security finding to check
 * @param directive - The suppression directive to match against
 * @returns true if the directive suppresses the finding, false otherwise
 */
const isInlineMatch = (finding: Finding, directive: SuppressionDirective): boolean =>
  directive.scope === 'inline' &&
  finding.category === directive.category &&
  (finding.line === directive.line || finding.line === directive.line + 1);

const isFileMatch = (finding: Finding, directive: SuppressionDirective): boolean =>
  directive.scope === 'file' && finding.category === directive.category;

export const applySuppressions = (
  findings: readonly Finding[],
  directives: readonly SuppressionDirective[],
  options?: SuppressionOptions,
): readonly Finding[] => {
  const noInlineConfig = options?.noInlineConfig === true;
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

    if (noInlineConfig) {
      return finding;
    }

    const inlineIndex = directives.findIndex(
      (d, idx) => isInlineMatch(finding, d) && !usedInlineDirectives.has(idx),
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
