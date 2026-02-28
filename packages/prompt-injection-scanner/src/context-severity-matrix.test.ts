import { describe, it, expect } from 'vitest';
import { adjustSeverity } from './context-severity-matrix.js';
import type { Severity } from './types.js';

describe('adjustSeverity', () => {
  describe('description fields elevate +1', () => {
    it('elevates LOW to MEDIUM for frontmatter:description', () => {
      const result = adjustSeverity('LOW', 'frontmatter:description');
      expect(result.adjustedSeverity).toBe('MEDIUM');
      expect(result.contextReason).toContain('description');
    });

    it('elevates MEDIUM to HIGH for frontmatter:description', () => {
      const result = adjustSeverity('MEDIUM', 'frontmatter:description');
      expect(result.adjustedSeverity).toBe('HIGH');
    });

    it('elevates HIGH to CRITICAL for frontmatter:description', () => {
      const result = adjustSeverity('HIGH', 'frontmatter:description');
      expect(result.adjustedSeverity).toBe('CRITICAL');
    });

    it('keeps CRITICAL as CRITICAL for frontmatter:description', () => {
      const result = adjustSeverity('CRITICAL', 'frontmatter:description');
      expect(result.adjustedSeverity).toBe('CRITICAL');
    });
  });

  describe('code blocks reduce -1', () => {
    it('reduces CRITICAL to HIGH for body:code-block', () => {
      const result = adjustSeverity('CRITICAL', 'body:code-block');
      expect(result.adjustedSeverity).toBe('HIGH');
      expect(result.contextReason).toContain('code block');
    });

    it('reduces HIGH to MEDIUM for body:code-block', () => {
      const result = adjustSeverity('HIGH', 'body:code-block');
      expect(result.adjustedSeverity).toBe('MEDIUM');
    });

    it('reduces MEDIUM to LOW for body:code-block', () => {
      const result = adjustSeverity('MEDIUM', 'body:code-block');
      expect(result.adjustedSeverity).toBe('LOW');
    });

    it('keeps LOW as LOW for body:code-block', () => {
      const result = adjustSeverity('LOW', 'body:code-block');
      expect(result.adjustedSeverity).toBe('LOW');
    });
  });

  describe('HTML comments elevate to minimum HIGH', () => {
    it('elevates LOW to HIGH for body:html-comment', () => {
      const result = adjustSeverity('LOW', 'body:html-comment');
      expect(result.adjustedSeverity).toBe('HIGH');
      expect(result.contextReason).toContain('HTML comment');
    });

    it('elevates MEDIUM to HIGH for body:html-comment', () => {
      const result = adjustSeverity('MEDIUM', 'body:html-comment');
      expect(result.adjustedSeverity).toBe('HIGH');
    });

    it('keeps HIGH as HIGH for body:html-comment', () => {
      const result = adjustSeverity('HIGH', 'body:html-comment');
      expect(result.adjustedSeverity).toBe('HIGH');
    });

    it('keeps CRITICAL as CRITICAL for body:html-comment', () => {
      const result = adjustSeverity('CRITICAL', 'body:html-comment');
      expect(result.adjustedSeverity).toBe('CRITICAL');
    });
  });

  describe('body text elevates +1', () => {
    it('elevates LOW to MEDIUM for bare body context', () => {
      const result = adjustSeverity('LOW', 'body');
      expect(result.adjustedSeverity).toBe('MEDIUM');
      expect(result.contextReason).toContain('body text');
    });

    it('elevates MEDIUM to HIGH for body:heading:Setup', () => {
      const result = adjustSeverity('MEDIUM', 'body:heading:Setup');
      expect(result.adjustedSeverity).toBe('HIGH');
    });

    it('elevates HIGH to CRITICAL for body:heading:Core', () => {
      const result = adjustSeverity('HIGH', 'body:heading:Core');
      expect(result.adjustedSeverity).toBe('CRITICAL');
    });

    it('keeps CRITICAL as CRITICAL for body text', () => {
      const result = adjustSeverity('CRITICAL', 'body');
      expect(result.adjustedSeverity).toBe('CRITICAL');
    });
  });

  describe('Workflows/Instructions sections use baseline', () => {
    it('keeps baseline severity for body:heading:Workflows', () => {
      const result = adjustSeverity('MEDIUM', 'body:heading:Workflows');
      expect(result.adjustedSeverity).toBe('MEDIUM');
      expect(result.contextReason).toContain('baseline');
    });

    it('keeps baseline severity for body:heading:Instructions', () => {
      const result = adjustSeverity('HIGH', 'body:heading:Instructions');
      expect(result.adjustedSeverity).toBe('HIGH');
    });

    it('keeps LOW as LOW for body:heading:Workflows', () => {
      const result = adjustSeverity('LOW', 'body:heading:Workflows');
      expect(result.adjustedSeverity).toBe('LOW');
    });

    it('keeps CRITICAL as CRITICAL for body:heading:Instructions', () => {
      const result = adjustSeverity('CRITICAL', 'body:heading:Instructions');
      expect(result.adjustedSeverity).toBe('CRITICAL');
    });
  });

  describe('other frontmatter fields use baseline', () => {
    it('keeps baseline severity for frontmatter:title', () => {
      const result = adjustSeverity('MEDIUM', 'frontmatter:title');
      expect(result.adjustedSeverity).toBe('MEDIUM');
    });

    it('keeps baseline severity for frontmatter:name', () => {
      const result = adjustSeverity('HIGH', 'frontmatter:name');
      expect(result.adjustedSeverity).toBe('HIGH');
    });
  });

  describe('return shape', () => {
    it('returns adjustedSeverity and contextReason', () => {
      const result = adjustSeverity('LOW', 'body:code-block');
      expect(result).toHaveProperty('adjustedSeverity');
      expect(result).toHaveProperty('contextReason');
      expect(typeof result.contextReason).toBe('string');
      expect(result.contextReason.length).toBeGreaterThan(0);
    });
  });

  describe('severity ordering is correct', () => {
    const severities: readonly Severity[] = [
      'LOW',
      'MEDIUM',
      'HIGH',
      'CRITICAL',
    ];

    it.each(severities)(
      'adjustSeverity returns a valid Severity for raw=%s in any context',
      (raw) => {
        const contexts = [
          'frontmatter:description',
          'body:code-block',
          'body:html-comment',
          'body',
          'body:heading:Workflows',
          'body:heading:Setup',
          'frontmatter:title',
        ];

        for (const ctx of contexts) {
          const result = adjustSeverity(raw, ctx);
          expect(severities).toContain(result.adjustedSeverity);
        }
      },
    );
  });
});
