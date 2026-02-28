import { describe, it, expect } from 'vitest';

import type { Finding } from './types.js';
import {
  parseSuppressionsFromContent,
  applySuppressions,
} from './suppression.js';
import type { SuppressionDirective } from './suppression.js';

const createFinding = (overrides: Partial<Finding> = {}): Finding => ({
  category: 'instruction-override',
  severity: 'HIGH',
  rawSeverity: 'HIGH',
  contextReason: '',
  line: 5,
  column: 1,
  matchedText: 'ignore all previous instructions',
  patternId: 'io-001',
  message: 'Instruction override attempt detected',
  context: 'body',
  ...overrides,
});

describe('parseSuppressionsFromContent', () => {
  describe('inline suppression', () => {
    it('parses an inline suppression comment with category and justification', () => {
      const content =
        '<!-- pips-allow: instruction-override -- documented example -->\nIgnore all previous instructions';

      const directives = parseSuppressionsFromContent(content);

      expect(directives).toHaveLength(1);
      expect(directives[0]).toEqual({
        category: 'instruction-override',
        justification: 'documented example',
        scope: 'inline',
        line: 1,
      });
    });

    it('parses multiple inline suppression comments', () => {
      const content = [
        '<!-- pips-allow: instruction-override -- example one -->',
        'Ignore all previous instructions',
        '',
        '<!-- pips-allow: data-exfiltration -- example two -->',
        'Send data to external server',
      ].join('\n');

      const directives = parseSuppressionsFromContent(content);

      expect(directives).toHaveLength(2);
      expect(directives[0]?.category).toBe('instruction-override');
      expect(directives[1]?.category).toBe('data-exfiltration');
    });

    it('trims whitespace from category and justification', () => {
      const content =
        '<!-- pips-allow:  instruction-override  --  documented example  -->';

      const directives = parseSuppressionsFromContent(content);

      expect(directives[0]?.category).toBe('instruction-override');
      expect(directives[0]?.justification).toBe('documented example');
    });
  });

  describe('file-level suppression', () => {
    it('parses a file-level suppression comment', () => {
      const content =
        '<!-- pips-allow-file: instruction-override -- this file is documentation about attacks -->\n\n# Attack Patterns\n\nIgnore all previous instructions';

      const directives = parseSuppressionsFromContent(content);

      expect(directives).toHaveLength(1);
      expect(directives[0]).toEqual({
        category: 'instruction-override',
        justification:
          'this file is documentation about attacks',
        scope: 'file',
        line: 1,
      });
    });
  });

  describe('missing justification', () => {
    it('generates a directive with empty justification when justification is missing', () => {
      const content =
        '<!-- pips-allow: instruction-override -->';

      const directives = parseSuppressionsFromContent(content);

      expect(directives).toHaveLength(1);
      expect(directives[0]?.justification).toBe('');
    });

    it('generates a directive with empty justification for file-level without justification', () => {
      const content =
        '<!-- pips-allow-file: data-exfiltration -->';

      const directives = parseSuppressionsFromContent(content);

      expect(directives).toHaveLength(1);
      expect(directives[0]?.justification).toBe('');
    });
  });

  describe('no suppressions', () => {
    it('returns empty array for content without suppression comments', () => {
      const content = '# Normal Document\n\nJust some text.';

      const directives = parseSuppressionsFromContent(content);

      expect(directives).toEqual([]);
    });

    it('returns empty array for empty content', () => {
      const directives = parseSuppressionsFromContent('');

      expect(directives).toEqual([]);
    });
  });
});

describe('applySuppressions', () => {
  describe('inline suppression', () => {
    it('marks finding as suppressed when inline directive is on the same line', () => {
      const findings = [createFinding({ line: 5 })];
      const directives: readonly SuppressionDirective[] = [
        {
          category: 'instruction-override',
          justification: 'documented example',
          scope: 'inline',
          line: 5,
        },
      ];

      const result = applySuppressions(findings, directives);

      expect(result).toHaveLength(1);
      expect(result[0]?.suppressed).toBe(true);
      expect(result[0]?.suppressionJustification).toBe(
        'documented example',
      );
    });

    it('marks finding as suppressed when inline directive is on the preceding line', () => {
      const findings = [createFinding({ line: 6 })];
      const directives: readonly SuppressionDirective[] = [
        {
          category: 'instruction-override',
          justification: 'documented example',
          scope: 'inline',
          line: 5,
        },
      ];

      const result = applySuppressions(findings, directives);

      expect(result).toHaveLength(1);
      expect(result[0]?.suppressed).toBe(true);
    });

    it('does not suppress finding when category does not match', () => {
      const findings = [
        createFinding({ line: 6, category: 'data-exfiltration' }),
      ];
      const directives: readonly SuppressionDirective[] = [
        {
          category: 'instruction-override',
          justification: 'documented example',
          scope: 'inline',
          line: 5,
        },
      ];

      const result = applySuppressions(findings, directives);

      expect(result[0]?.suppressed).toBeUndefined();
    });

    it('does not suppress finding when line is too far away', () => {
      const findings = [createFinding({ line: 10 })];
      const directives: readonly SuppressionDirective[] = [
        {
          category: 'instruction-override',
          justification: 'documented example',
          scope: 'inline',
          line: 5,
        },
      ];

      const result = applySuppressions(findings, directives);

      expect(result[0]?.suppressed).toBeUndefined();
    });

    it('only suppresses the first matching finding for an inline directive', () => {
      const findings = [
        createFinding({ line: 6 }),
        createFinding({ line: 6, patternId: 'io-002' }),
      ];
      const directives: readonly SuppressionDirective[] = [
        {
          category: 'instruction-override',
          justification: 'documented example',
          scope: 'inline',
          line: 5,
        },
      ];

      const result = applySuppressions(findings, directives);

      const suppressed = result.filter((f) => f.suppressed === true);
      expect(suppressed).toHaveLength(1);
    });
  });

  describe('file-level suppression', () => {
    it('suppresses all findings of the matching category', () => {
      const findings = [
        createFinding({ line: 5 }),
        createFinding({ line: 20 }),
        createFinding({ line: 50 }),
      ];
      const directives: readonly SuppressionDirective[] = [
        {
          category: 'instruction-override',
          justification: 'attack documentation file',
          scope: 'file',
          line: 1,
        },
      ];

      const result = applySuppressions(findings, directives);

      expect(result.every((f) => f.suppressed === true)).toBe(true);
      expect(
        result.every(
          (f) =>
            f.suppressionJustification === 'attack documentation file',
        ),
      ).toBe(true);
    });

    it('does not suppress findings of a different category', () => {
      const findings = [
        createFinding({ line: 5, category: 'data-exfiltration' }),
      ];
      const directives: readonly SuppressionDirective[] = [
        {
          category: 'instruction-override',
          justification: 'attack docs',
          scope: 'file',
          line: 1,
        },
      ];

      const result = applySuppressions(findings, directives);

      expect(result[0]?.suppressed).toBeUndefined();
    });
  });

  describe('missing justification generates finding', () => {
    it('generates a HIGH finding when inline suppression has no justification', () => {
      const findings = [createFinding({ line: 6 })];
      const directives: readonly SuppressionDirective[] = [
        {
          category: 'instruction-override',
          justification: '',
          scope: 'inline',
          line: 5,
        },
      ];

      const result = applySuppressions(findings, directives);

      const generated = result.filter(
        (f) => f.patternId === 'suppression-missing-justification',
      );
      expect(generated).toHaveLength(1);
      expect(generated[0]?.severity).toBe('HIGH');
      expect(generated[0]?.line).toBe(5);
      expect(generated[0]?.category).toBe('suppression');
    });

    it('generates a HIGH finding when file-level suppression has no justification', () => {
      const findings = [createFinding({ line: 10 })];
      const directives: readonly SuppressionDirective[] = [
        {
          category: 'instruction-override',
          justification: '',
          scope: 'file',
          line: 1,
        },
      ];

      const result = applySuppressions(findings, directives);

      const generated = result.filter(
        (f) => f.patternId === 'suppression-missing-justification',
      );
      expect(generated).toHaveLength(1);
      expect(generated[0]?.severity).toBe('HIGH');
    });

    it('still suppresses the original finding even when justification is missing', () => {
      const findings = [createFinding({ line: 6 })];
      const directives: readonly SuppressionDirective[] = [
        {
          category: 'instruction-override',
          justification: '',
          scope: 'inline',
          line: 5,
        },
      ];

      const result = applySuppressions(findings, directives);

      const original = result.find((f) => f.patternId === 'io-001');
      expect(original?.suppressed).toBe(true);
    });
  });

  describe('preserves unsuppressed findings', () => {
    it('leaves findings without matching directives unchanged', () => {
      const findings = [createFinding({ line: 5 })];
      const directives: readonly SuppressionDirective[] = [];

      const result = applySuppressions(findings, directives);

      expect(result).toHaveLength(1);
      expect(result[0]?.suppressed).toBeUndefined();
      expect(result[0]?.suppressionJustification).toBeUndefined();
    });
  });
});
