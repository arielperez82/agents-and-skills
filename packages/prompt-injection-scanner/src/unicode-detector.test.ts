import { describe, it, expect } from 'vitest';
import { detectUnicodeIssues } from './unicode-detector.js';
import type { Finding } from './types.js';

const findByPatternId = (
  findings: readonly Finding[],
  prefix: string,
): readonly Finding[] =>
  findings.filter((f) => f.patternId.startsWith(prefix));

describe('detectUnicodeIssues', () => {
  describe('zero-width characters', () => {
    it('detects zero-width space (U+200B)', () => {
      const text = 'hello\u200Bworld';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-001');
      expect(findings[0]?.rawSeverity).toBe('HIGH');
      expect(findings[0]?.category).toBe('encoding-obfuscation');
      expect(findings[0]?.message).toContain('U+200B');
    });

    it('detects zero-width non-joiner (U+200C)', () => {
      const text = 'hello\u200Cworld';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-001');
      expect(findings[0]?.message).toContain('U+200C');
    });

    it('detects zero-width joiner (U+200D)', () => {
      const text = 'hello\u200Dworld';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-001');
      expect(findings[0]?.message).toContain('U+200D');
    });

    it('detects byte order mark / zero-width no-break space (U+FEFF)', () => {
      const text = 'hello\uFEFFworld';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-001');
      expect(findings[0]?.message).toContain('U+FEFF');
    });

    it('detects multiple zero-width characters and reports each', () => {
      const text = 'a\u200Bb\u200Cc';
      const findings = detectUnicodeIssues(text, 'body');
      const zwFindings = findByPatternId(findings, 'uc-001');

      expect(zwFindings).toHaveLength(2);
    });

    it('has rawSeverity MEDIUM inside code blocks', () => {
      const text = 'hello\u200Bworld';
      const findings = detectUnicodeIssues(text, 'body:code-block');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.rawSeverity).toBe('MEDIUM');
    });

    it('has rawSeverity HIGH outside code blocks', () => {
      const text = 'hello\u200Bworld';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.rawSeverity).toBe('HIGH');
    });

    it('reports exact column position of zero-width character', () => {
      const text = 'abc\u200Bdef';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings[0]?.column).toBe(4);
    });
  });

  describe('bidirectional override characters', () => {
    it('detects LRE (U+202A)', () => {
      const text = 'text\u202Ahere';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-002');
      expect(findings[0]?.rawSeverity).toBe('HIGH');
      expect(findings[0]?.message).toContain('U+202A');
    });

    it('detects RLE (U+202B)', () => {
      const text = 'text\u202Bhere';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-002');
      expect(findings[0]?.message).toContain('U+202B');
    });

    it('detects PDF (U+202C)', () => {
      const text = 'text\u202Chere';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-002');
    });

    it('detects LRO (U+202D)', () => {
      const text = 'text\u202Dhere';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-002');
    });

    it('detects RLO (U+202E)', () => {
      const text = 'text\u202Ehere';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-002');
    });

    it('detects LRI (U+2066)', () => {
      const text = 'text\u2066here';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-002');
    });

    it('detects RLI (U+2067)', () => {
      const text = 'text\u2067here';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-002');
    });

    it('detects FSI (U+2068)', () => {
      const text = 'text\u2068here';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-002');
    });

    it('detects PDI (U+2069)', () => {
      const text = 'text\u2069here';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.patternId).toBe('uc-002');
    });

    it('has rawSeverity HIGH regardless of context', () => {
      const text = 'text\u202Ehere';
      const findings = detectUnicodeIssues(text, 'body:code-block');

      expect(findings).toHaveLength(1);
      expect(findings[0]?.rawSeverity).toBe('HIGH');
    });
  });

  describe('Cyrillic homoglyphs', () => {
    it('detects Cyrillic "o" (U+043E) mixed with Latin', () => {
      const text = 'passw\u043Erd';
      const findings = detectUnicodeIssues(text, 'body');
      const homoglyphFindings = findByPatternId(findings, 'uc-003');

      expect(homoglyphFindings).toHaveLength(1);
      expect(homoglyphFindings[0]?.rawSeverity).toBe('HIGH');
      expect(homoglyphFindings[0]?.message).toContain('U+043E');
    });

    it('detects Cyrillic "a" (U+0430) mixed with Latin', () => {
      const text = 'p\u0430ssword';
      const findings = detectUnicodeIssues(text, 'body');
      const homoglyphFindings = findByPatternId(findings, 'uc-003');

      expect(homoglyphFindings).toHaveLength(1);
      expect(homoglyphFindings[0]?.message).toContain('U+0430');
    });

    it('detects Cyrillic "e" (U+0435) mixed with Latin', () => {
      const text = 'ex\u0435cute';
      const findings = detectUnicodeIssues(text, 'body');
      const homoglyphFindings = findByPatternId(findings, 'uc-003');

      expect(homoglyphFindings).toHaveLength(1);
      expect(homoglyphFindings[0]?.message).toContain('U+0435');
    });

    it('detects Cyrillic "p" (U+0440) mixed with Latin', () => {
      const text = '\u0440rompt';
      const findings = detectUnicodeIssues(text, 'body');
      const homoglyphFindings = findByPatternId(findings, 'uc-003');

      expect(homoglyphFindings).toHaveLength(1);
      expect(homoglyphFindings[0]?.message).toContain('U+0440');
    });

    it('detects Cyrillic "c" (U+0441) mixed with Latin', () => {
      const text = 'exe\u0441ute';
      const findings = detectUnicodeIssues(text, 'body');
      const homoglyphFindings = findByPatternId(findings, 'uc-003');

      expect(homoglyphFindings).toHaveLength(1);
      expect(homoglyphFindings[0]?.message).toContain('U+0441');
    });

    it('detects Cyrillic "x" (U+0445) mixed with Latin', () => {
      const text = 'e\u0445ecute';
      const findings = detectUnicodeIssues(text, 'body');
      const homoglyphFindings = findByPatternId(findings, 'uc-003');

      expect(homoglyphFindings).toHaveLength(1);
      expect(homoglyphFindings[0]?.message).toContain('U+0445');
    });

    it('does NOT flag pure Cyrillic text (no Latin mixing)', () => {
      const text = '\u043F\u0440\u0438\u0432\u0435\u0442';
      const findings = detectUnicodeIssues(text, 'body');
      const homoglyphFindings = findByPatternId(findings, 'uc-003');

      expect(homoglyphFindings).toHaveLength(0);
    });

    it('reports code point in the finding message', () => {
      const text = 'passw\u043Erd';
      const findings = detectUnicodeIssues(text, 'body');
      const homoglyphFindings = findByPatternId(findings, 'uc-003');

      expect(homoglyphFindings[0]?.message).toMatch(/U\+[0-9A-F]{4}/);
    });
  });

  describe('Base64 strings', () => {
    it('detects Base64 string longer than 20 characters', () => {
      const text = 'data: SGVsbG8gV29ybGQgdGhpcyBpcyBhIHRlc3Q=';
      const findings = detectUnicodeIssues(text, 'body');
      const b64Findings = findByPatternId(findings, 'uc-004');

      expect(b64Findings).toHaveLength(1);
      expect(b64Findings[0]?.rawSeverity).toBe('MEDIUM');
      expect(b64Findings[0]?.category).toBe('encoding-obfuscation');
    });

    it('does NOT flag Base64 strings of 20 chars or fewer', () => {
      const text = 'token: SGVsbG8gV29ybGQ=';
      const findings = detectUnicodeIssues(text, 'body');
      const b64Findings = findByPatternId(findings, 'uc-004');

      expect(b64Findings).toHaveLength(0);
    });

    it('does NOT flag normal words that happen to be alphanumeric', () => {
      const text = 'This is a normal sentence with words';
      const findings = detectUnicodeIssues(text, 'body');
      const b64Findings = findByPatternId(findings, 'uc-004');

      expect(b64Findings).toHaveLength(0);
    });
  });

  describe('HTML entity patterns', () => {
    it('detects sequence of numeric HTML entities', () => {
      const text = '&#105;&#103;&#110;&#111;&#114;&#101;';
      const findings = detectUnicodeIssues(text, 'body');
      const htmlFindings = findByPatternId(findings, 'uc-005');

      expect(htmlFindings).toHaveLength(1);
      expect(htmlFindings[0]?.rawSeverity).toBe('MEDIUM');
    });

    it('detects sequence of named HTML entities', () => {
      const text = '&lt;&gt;&amp;&quot;&apos;';
      const findings = detectUnicodeIssues(text, 'body');
      const htmlFindings = findByPatternId(findings, 'uc-005');

      expect(htmlFindings).toHaveLength(1);
      expect(htmlFindings[0]?.rawSeverity).toBe('MEDIUM');
    });

    it('detects hex HTML entities', () => {
      const text = '&#x69;&#x67;&#x6E;&#x6F;&#x72;';
      const findings = detectUnicodeIssues(text, 'body');
      const htmlFindings = findByPatternId(findings, 'uc-005');

      expect(htmlFindings).toHaveLength(1);
    });

    it('does NOT flag a single HTML entity', () => {
      const text = 'Use &amp; for ampersand';
      const findings = detectUnicodeIssues(text, 'body');
      const htmlFindings = findByPatternId(findings, 'uc-005');

      expect(htmlFindings).toHaveLength(0);
    });
  });

  describe('legitimate Unicode not flagged', () => {
    it('does NOT flag accented Latin characters', () => {
      const text = 'caf\u00E9 r\u00E9sum\u00E9 na\u00EFve';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(0);
    });

    it('does NOT flag CJK characters', () => {
      const text = '\u4F60\u597D\u4E16\u754C';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(0);
    });

    it('does NOT flag emoji', () => {
      const text = 'Hello \uD83D\uDE00 World \uD83C\uDF0D';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(0);
    });

    it('does NOT flag common typographic characters', () => {
      const text = '\u2014 em dash, \u2013 en dash, \u2018quotes\u2019, \u2026 ellipsis';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(0);
    });

    it('does NOT flag Arabic text', () => {
      const text = '\u0645\u0631\u062D\u0628\u0627 \u0628\u0627\u0644\u0639\u0627\u0644\u0645';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(0);
    });
  });

  describe('finding shape', () => {
    it('returns findings with all required fields', () => {
      const text = 'hello\u200Bworld';
      const findings = detectUnicodeIssues(text, 'body');

      expect(findings).toHaveLength(1);
      const finding = findings[0] as Finding;

      expect(finding).toEqual(
        expect.objectContaining({
          category: 'encoding-obfuscation',
          severity: expect.any(String),
          rawSeverity: expect.any(String),
          contextReason: expect.any(String),
          line: expect.any(Number),
          column: expect.any(Number),
          matchedText: expect.any(String),
          patternId: expect.any(String),
          message: expect.any(String),
          context: expect.any(String),
        }),
      );
    });

    it('sets context to the provided context string', () => {
      const text = 'hello\u200Bworld';
      const findings = detectUnicodeIssues(text, 'body:heading:Setup');

      expect(findings[0]?.context).toBe('body:heading:Setup');
    });
  });
});
