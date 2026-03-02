import { adjustSeverity } from './context-severity-matrix.js';
import { computePosition } from './text-utils.js';
import type { Finding, Severity } from './types.js';

const ZERO_WIDTH_CHARS = new Set([
  0x200b, // Zero-width space
  0x200c, // Zero-width non-joiner
  0x200d, // Zero-width joiner
  0xfeff, // Byte order mark / zero-width no-break space
]);

const BIDI_OVERRIDE_CHARS = new Set([
  0x202a, // LRE
  0x202b, // RLE
  0x202c, // PDF
  0x202d, // LRO
  0x202e, // RLO
  0x2066, // LRI
  0x2067, // RLI
  0x2068, // FSI
  0x2069, // PDI
]);

const CYRILLIC_HOMOGLYPHS: ReadonlyMap<number, string> = new Map([
  [0x043e, 'o'], // Cyrillic o looks like Latin o
  [0x0430, 'a'], // Cyrillic a looks like Latin a
  [0x0435, 'e'], // Cyrillic e looks like Latin e
  [0x0440, 'p'], // Cyrillic p looks like Latin p
  [0x0441, 'c'], // Cyrillic c looks like Latin c
  [0x0445, 'x'], // Cyrillic x looks like Latin x
]);

const formatCodePoint = (codePoint: number): string =>
  `U+${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;

const isCodeBlockContext = (context: string): boolean => context.includes('code-block');

const createFinding = (
  patternId: string,
  rawSeverity: Severity,
  message: string,
  matchedText: string,
  text: string,
  charIndex: number,
  context: string,
): Finding => {
  const { line, column } = computePosition(text, charIndex);
  const { adjustedSeverity, contextReason } = adjustSeverity(rawSeverity, context);
  return {
    category: 'encoding-obfuscation',
    severity: adjustedSeverity,
    rawSeverity,
    contextReason,
    line,
    column,
    matchedText,
    patternId,
    message,
    context,
  };
};

/**
 * Higher-order function that captures the shared char-scan pattern:
 * iterate over characters in a segment, check membership in a predicate,
 * and produce a Finding per match.
 *
 * @param charSet   - Set of code points to match against
 * @param patternId - Finding pattern ID (e.g. 'uc-001')
 * @param getSeverity - Derives severity from context
 * @param buildMessage - Builds the human-readable message from code point
 */
const collectFindings =
  (
    charSet: ReadonlySet<number>,
    patternId: string,
    getSeverity: (context: string) => Severity,
    buildMessage: (codePoint: number) => string,
  ) =>
  (segment: string, fullText: string, segmentOffset: number, context: string): readonly Finding[] =>
    Array.from({ length: segment.length }, (_, i) => i).flatMap((i) => {
      const codePoint = segment.codePointAt(i);
      if (codePoint === undefined || !charSet.has(codePoint)) return [];
      return [
        createFinding(
          patternId,
          getSeverity(context),
          buildMessage(codePoint),
          segment[i] ?? '',
          fullText,
          segmentOffset + i,
          context,
        ),
      ];
    });

const collectZeroWidthFindings = collectFindings(
  ZERO_WIDTH_CHARS,
  'uc-001',
  (context) => (isCodeBlockContext(context) ? 'MEDIUM' : 'HIGH'),
  (codePoint) => `Zero-width character detected: ${formatCodePoint(codePoint)}`,
);

const collectBidiFindings = collectFindings(
  BIDI_OVERRIDE_CHARS,
  'uc-002',
  () => 'HIGH',
  (codePoint) => `Bidirectional override character detected: ${formatCodePoint(codePoint)}`,
);

const collectCyrillicFindings = collectFindings(
  new Set(CYRILLIC_HOMOGLYPHS.keys()),
  'uc-003',
  () => 'HIGH',
  (codePoint) => {
    const latinEquiv = CYRILLIC_HOMOGLYPHS.get(codePoint) ?? '';
    return `Cyrillic homoglyph detected: ${formatCodePoint(codePoint)} (looks like Latin '${latinEquiv}')`;
  },
);

const detectZeroWidthChars = (text: string, context: string): readonly Finding[] =>
  collectZeroWidthFindings(text, text, 0, context);

const detectBidiOverrides = (text: string, context: string): readonly Finding[] =>
  collectBidiFindings(text, text, 0, context);

const containsLatinLetters = (word: string): boolean => /[a-zA-Z]/.test(word);

const detectCyrillicHomoglyphs = (text: string, context: string): readonly Finding[] =>
  [...text.matchAll(/\S+/g)].flatMap((match) => {
    const word = match[0];
    const wordStart = match.index;
    if (!containsLatinLetters(word)) return [];
    return collectCyrillicFindings(word, text, wordStart, context);
  });

const BASE64_PATTERN = /(?<![a-zA-Z0-9+/])[A-Za-z0-9+/]{21,}={0,2}(?![a-zA-Z0-9+/=])/g;

const looksLikeSlashSeparatedWords = (str: string): boolean =>
  /^[A-Za-z0-9]+(?:\/[A-Za-z0-9]+)+$/.test(str);

const looksLikeBase64 = (str: string): boolean => {
  if (str.length <= 20) return false;
  if (looksLikeSlashSeparatedWords(str)) return false;
  const hasUpperAndLower = /[A-Z]/.test(str) && /[a-z]/.test(str);
  const hasDigitsOrSpecial = /[0-9+/]/.test(str);
  return hasUpperAndLower && hasDigitsOrSpecial;
};

const detectBase64Strings = (text: string, context: string): readonly Finding[] => {
  const findings: Finding[] = [];
  const regex = new RegExp(BASE64_PATTERN.source, 'g');
  let match: RegExpExecArray | null = regex.exec(text);

  while (match !== null) {
    const candidate = match[0];
    if (looksLikeBase64(candidate)) {
      findings.push(
        createFinding(
          'uc-004',
          'MEDIUM',
          `Suspicious Base64 string detected (${candidate.length} chars)`,
          candidate,
          text,
          match.index,
          context,
        ),
      );
    }
    match = regex.exec(text);
  }

  return findings;
};

const HTML_ENTITY_SEQUENCE_PATTERN = /(?:&#x?[0-9a-fA-F]+;|&[a-zA-Z]+;){3,}/g;

const detectHtmlEntitySequences = (text: string, context: string): readonly Finding[] => {
  const findings: Finding[] = [];
  const regex = new RegExp(HTML_ENTITY_SEQUENCE_PATTERN.source, 'g');
  let match: RegExpExecArray | null = regex.exec(text);

  while (match !== null) {
    findings.push(
      createFinding(
        'uc-005',
        'MEDIUM',
        'Suspicious HTML entity sequence detected (possible hidden instructions)',
        match[0],
        text,
        match.index,
        context,
      ),
    );
    match = regex.exec(text);
  }

  return findings;
};

export const detectUnicodeIssues = (text: string, context: string): readonly Finding[] => [
  ...detectZeroWidthChars(text, context),
  ...detectBidiOverrides(text, context),
  ...detectCyrillicHomoglyphs(text, context),
  ...detectBase64Strings(text, context),
  ...detectHtmlEntitySequences(text, context),
];
