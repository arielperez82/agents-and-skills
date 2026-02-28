import { adjustSeverity } from './context-severity-matrix.js';
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

const isCodeBlockContext = (context: string): boolean =>
  context.includes('code-block');

const computeLineAndColumn = (
  text: string,
  charIndex: number,
): { readonly line: number; readonly column: number } => {
  const prefix = text.slice(0, charIndex);
  const lineOffset = prefix.split('\n').length - 1;
  const lastNewline = prefix.lastIndexOf('\n');
  const column = lastNewline === -1 ? charIndex + 1 : charIndex - lastNewline;
  return { line: 1 + lineOffset, column };
};

const createFinding = (
  patternId: string,
  rawSeverity: Severity,
  message: string,
  matchedText: string,
  text: string,
  charIndex: number,
  context: string,
): Finding => {
  const { line, column } = computeLineAndColumn(text, charIndex);
  const { adjustedSeverity, contextReason } = adjustSeverity(
    rawSeverity,
    context,
  );
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

const detectZeroWidthChars = (
  text: string,
  context: string,
): readonly Finding[] => {
  const findings: Finding[] = [];
  const rawSeverity: Severity = isCodeBlockContext(context) ? 'MEDIUM' : 'HIGH';

  for (let i = 0; i < text.length; i++) {
    const codePoint = text.codePointAt(i);
    if (codePoint !== undefined && ZERO_WIDTH_CHARS.has(codePoint)) {
      const formatted = formatCodePoint(codePoint);
      findings.push(
        createFinding(
          'uc-001',
          rawSeverity,
          `Zero-width character detected: ${formatted}`,
          text[i] ?? '',
          text,
          i,
          context,
        ),
      );
    }
  }

  return findings;
};

const detectBidiOverrides = (
  text: string,
  context: string,
): readonly Finding[] => {
  const findings: Finding[] = [];

  for (let i = 0; i < text.length; i++) {
    const codePoint = text.codePointAt(i);
    if (codePoint !== undefined && BIDI_OVERRIDE_CHARS.has(codePoint)) {
      const formatted = formatCodePoint(codePoint);
      findings.push(
        createFinding(
          'uc-002',
          'HIGH',
          `Bidirectional override character detected: ${formatted}`,
          text[i] ?? '',
          text,
          i,
          context,
        ),
      );
    }
  }

  return findings;
};

const containsLatinLetters = (word: string): boolean =>
  /[a-zA-Z]/.test(word);

const detectCyrillicHomoglyphs = (
  text: string,
  context: string,
): readonly Finding[] => {
  const findings: Finding[] = [];
  const words = text.split(/\s+/);
  let currentIndex = 0;

  for (const word of words) {
    const wordStart = text.indexOf(word, currentIndex);
    const hasLatin = containsLatinLetters(word);

    if (hasLatin) {
      for (let i = 0; i < word.length; i++) {
        const codePoint = word.codePointAt(i);
        if (codePoint !== undefined && CYRILLIC_HOMOGLYPHS.has(codePoint)) {
          const formatted = formatCodePoint(codePoint);
          const latinEquiv = CYRILLIC_HOMOGLYPHS.get(codePoint) ?? '';
          findings.push(
            createFinding(
              'uc-003',
              'HIGH',
              `Cyrillic homoglyph detected: ${formatted} (looks like Latin '${latinEquiv}')`,
              word[i] ?? '',
              text,
              wordStart + i,
              context,
            ),
          );
        }
      }
    }

    currentIndex = wordStart + word.length;
  }

  return findings;
};

const BASE64_PATTERN =
  /(?<![a-zA-Z0-9+/])[A-Za-z0-9+/]{21,}={0,2}(?![a-zA-Z0-9+/=])/g;

const looksLikeBase64 = (str: string): boolean => {
  if (str.length <= 20) return false;
  const hasUpperAndLower = /[A-Z]/.test(str) && /[a-z]/.test(str);
  const hasDigitsOrSpecial = /[0-9+/]/.test(str);
  return hasUpperAndLower && hasDigitsOrSpecial;
};

const detectBase64Strings = (
  text: string,
  context: string,
): readonly Finding[] => {
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

const HTML_ENTITY_SEQUENCE_PATTERN =
  /(?:&#x?[0-9a-fA-F]+;|&[a-zA-Z]+;){3,}/g;

const detectHtmlEntitySequences = (
  text: string,
  context: string,
): readonly Finding[] => {
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

export const detectUnicodeIssues = (
  text: string,
  context: string,
): readonly Finding[] => [
  ...detectZeroWidthChars(text, context),
  ...detectBidiOverrides(text, context),
  ...detectCyrillicHomoglyphs(text, context),
  ...detectBase64Strings(text, context),
  ...detectHtmlEntitySequences(text, context),
];
