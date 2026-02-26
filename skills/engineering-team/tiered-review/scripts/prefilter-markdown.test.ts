import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import type { MarkdownPrefilterOutput } from './prefilter-markdown.ts';

const SCRIPT_PATH = join(
  import.meta.dirname,
  'prefilter-markdown.ts',
);

const runWithArgs = (
  args: ReadonlyArray<string>,
): { readonly stdout: string; readonly exitCode: number } => {
  try {
    const stdout = execFileSync('npx', ['tsx', SCRIPT_PATH, ...args], {
      encoding: 'utf-8',
      timeout: 30_000,
    });
    return { stdout, exitCode: 0 };
  } catch (error: unknown) {
    const errorObj = error as Record<string, unknown>;
    return {
      stdout: typeof errorObj.stdout === 'string' ? errorObj.stdout : '',
      exitCode: typeof errorObj.status === 'number' ? errorObj.status : 1,
    };
  }
};

const run = (
  ...filePaths: ReadonlyArray<string>
): { readonly stdout: string; readonly exitCode: number } =>
  runWithArgs(filePaths);

const createTempDir = (): string => mkdtempSync(join(tmpdir(), 'md-prefilter-'));

const createTempFile = (dir: string, name: string, content: string): string => {
  const filePath = join(dir, name);
  writeFileSync(filePath, content, 'utf-8');
  return filePath;
};

describe('prefilter-markdown', () => {
  describe('valid markdown with headings, links, and code blocks', () => {
    it('extracts heading tree with correct depths, line ranges, and word counts', () => {
      const dir = createTempDir();
      try {
        const content = [
          '# Main Title',
          '',
          'Some intro text here with several words.',
          '',
          '## Section One',
          '',
          'Content of section one has words.',
          '',
          '### Subsection',
          '',
          'Deep content here.',
          '',
          '## Section Two',
          '',
          'Final section content.',
        ].join('\n');
        const filePath = createTempFile(dir, 'test.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        assert.equal(file.headingTree.length, 4);

        assert.equal(file.headingTree[0].depth, 1);
        assert.equal(file.headingTree[0].text, 'Main Title');
        assert.equal(file.headingTree[0].lineStart, 1);

        assert.equal(file.headingTree[1].depth, 2);
        assert.equal(file.headingTree[1].text, 'Section One');

        assert.equal(file.headingTree[2].depth, 3);
        assert.equal(file.headingTree[2].text, 'Subsection');

        assert.equal(file.headingTree[3].depth, 2);
        assert.equal(file.headingTree[3].text, 'Section Two');

        assert.ok(file.headingTree[0].wordCount > 0);
        assert.ok(file.headingTree[1].wordCount > 0);
      } finally {
        rmSync(dir, { recursive: true });
      }
    });

    it('inventories links with correct text, url, and line numbers', () => {
      const dir = createTempDir();
      try {
        createTempFile(dir, 'other.md', '# Other');
        const content = [
          '# Links Test',
          '',
          '[valid link](other.md)',
          '',
          '[external](https://example.com)',
        ].join('\n');
        const filePath = createTempFile(dir, 'test.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        assert.equal(file.links.length, 2);

        const validLink = file.links.find(
          (l) => l.url === 'other.md',
        );
        assert.ok(validLink);
        assert.equal(validLink.text, 'valid link');
        assert.equal(validLink.status, 'valid');

        const externalLink = file.links.find(
          (l) => l.url === 'https://example.com',
        );
        assert.ok(externalLink);
        assert.equal(externalLink.status, 'external');
      } finally {
        rmSync(dir, { recursive: true });
      }
    });

    it('counts code blocks correctly', () => {
      const dir = createTempDir();
      try {
        const content = [
          '# Code Test',
          '',
          '```typescript',
          'const x = 1;',
          '```',
          '',
          '```bash',
          'echo hello',
          '```',
          '',
          'Some text.',
        ].join('\n');
        const filePath = createTempFile(dir, 'test.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        assert.equal(result.files[0].codeBlocks, 2);
      } finally {
        rmSync(dir, { recursive: true });
      }
    });

    it('calculates total word count', () => {
      const dir = createTempDir();
      try {
        const content = [
          '# Title',
          '',
          'One two three four five.',
          '',
          '## Section',
          '',
          'Six seven eight.',
        ].join('\n');
        const filePath = createTempFile(dir, 'test.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        assert.ok(result.files[0].totalWordCount >= 8);
      } finally {
        rmSync(dir, { recursive: true });
      }
    });
  });

  describe('broken internal links', () => {
    it('marks links to non-existent files as broken', () => {
      const dir = createTempDir();
      try {
        const content = [
          '# Broken Links',
          '',
          '[missing](does-not-exist.md)',
          '',
          '[also missing](./subdir/nope.md)',
        ].join('\n');
        const filePath = createTempFile(dir, 'test.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        assert.equal(file.links.length, 2);
        assert.ok(file.links.every((l) => l.status === 'broken'));
      } finally {
        rmSync(dir, { recursive: true });
      }
    });
  });

  describe('link validation', () => {
    it('treats links that traverse above the file directory as non-checkable', () => {
      const dir = createTempDir();
      try {
        const content = '# Test\n\n[escape](../../etc/passwd)\n';
        const filePath = createTempFile(dir, 'test.md', content);
        const { stdout, exitCode } = run(filePath);
        assert.equal(exitCode, 0);
        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const link = result.files[0].links[0];
        assert.equal(link.status, 'valid');
      } finally {
        rmSync(dir, { recursive: true });
      }
    });

    it('treats absolute-path links as external', () => {
      const dir = createTempDir();
      try {
        const content = '# Test\n\n[link](/etc/passwd)\n';
        const filePath = createTempFile(dir, 'test.md', content);
        const { stdout, exitCode } = run(filePath);
        assert.equal(exitCode, 0);
        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const link = result.files[0].links[0];
        assert.equal(link.status, 'external');
      } finally {
        rmSync(dir, { recursive: true });
      }
    });
  });

  describe('missing standard sections', () => {
    it('detects missing frontmatter in agent-like markdown', () => {
      const dir = createTempDir();
      try {
        const content = [
          '# My Agent',
          '',
          '## Purpose',
          '',
          'Does something.',
        ].join('\n');
        const filePath = createTempFile(dir, 'test.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        assert.ok(
          file.missingSections.some((s) => s.toLowerCase().includes('frontmatter')),
        );
      } finally {
        rmSync(dir, { recursive: true });
      }
    });

    it('does not flag frontmatter when present', () => {
      const dir = createTempDir();
      try {
        const content = [
          '---',
          'name: test-agent',
          'title: Test Agent',
          '---',
          '',
          '# Test Agent',
          '',
          '## Purpose',
          '',
          'Does things.',
        ].join('\n');
        const filePath = createTempFile(dir, 'test.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        assert.ok(
          !file.missingSections.some((s) => s.toLowerCase().includes('frontmatter')),
        );
      } finally {
        rmSync(dir, { recursive: true });
      }
    });

    it('detects missing common sections like Purpose or When to Use', () => {
      const dir = createTempDir();
      try {
        const content = [
          '---',
          'name: test',
          '---',
          '',
          '# Test',
          '',
          'Just some text without standard sections.',
        ].join('\n');
        const filePath = createTempFile(dir, 'test.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        assert.ok(file.missingSections.length > 0);
      } finally {
        rmSync(dir, { recursive: true });
      }
    });
  });

  describe('empty file', () => {
    it('handles empty file gracefully with zero counts and empty arrays', () => {
      const dir = createTempDir();
      try {
        const filePath = createTempFile(dir, 'empty.md', '');
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        assert.deepEqual(file.headingTree, []);
        assert.deepEqual(file.links, []);
        assert.equal(file.codeBlocks, 0);
        assert.equal(file.totalWordCount, 0);
        assert.deepEqual(file.structuralIssues, []);
        assert.deepEqual(file.flaggedSections, []);
      } finally {
        rmSync(dir, { recursive: true });
      }
    });
  });

  describe('non-existent file path', () => {
    it('exits with code 1 for missing files', () => {
      const { exitCode } = run('/tmp/absolutely-does-not-exist-12345.md');

      assert.equal(exitCode, 1);
    });

    it('exits with code 1 when no arguments provided', () => {
      const { exitCode } = run();

      assert.equal(exitCode, 1);
    });
  });

  describe('deeply nested headings', () => {
    it('captures heading depths from h1 through h6', () => {
      const dir = createTempDir();
      try {
        const content = [
          '# H1',
          '',
          '## H2',
          '',
          '### H3',
          '',
          '#### H4',
          '',
          '##### H5',
          '',
          '###### H6',
          '',
          'Final content.',
        ].join('\n');
        const filePath = createTempFile(dir, 'deep.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const headings = result.files[0].headingTree;

        assert.equal(headings.length, 6);
        assert.deepEqual(
          headings.map((h) => h.depth),
          [1, 2, 3, 4, 5, 6],
        );
        assert.deepEqual(
          headings.map((h) => h.text),
          ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'],
        );
      } finally {
        rmSync(dir, { recursive: true });
      }
    });
  });

  describe('files with only code blocks', () => {
    it('counts code blocks and has minimal heading tree', () => {
      const dir = createTempDir();
      try {
        const content = [
          '```javascript',
          'const a = 1;',
          'const b = 2;',
          '```',
          '',
          '```python',
          'x = 42',
          '```',
        ].join('\n');
        const filePath = createTempFile(dir, 'code-only.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        assert.equal(file.codeBlocks, 2);
        assert.equal(file.headingTree.length, 0);
      } finally {
        rmSync(dir, { recursive: true });
      }
    });
  });

  describe('multiple files', () => {
    it('produces per-file results in array output with correct summary', () => {
      const dir = createTempDir();
      try {
        const file1 = createTempFile(dir, 'one.md', '# File One\n\nContent here.');
        const file2 = createTempFile(dir, 'two.md', '# File Two\n\nMore content.');
        const file3 = createTempFile(
          dir,
          'three.md',
          '# File Three\n\n[broken](nope.md)',
        );

        const { stdout, exitCode } = run(file1, file2, file3);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);

        assert.equal(result.files.length, 3);
        assert.equal(result.summary.totalFiles, 3);
        assert.ok(result.summary.totalIssues >= 0);
        assert.ok(result.summary.filesNeedingLlmReview >= 0);
      } finally {
        rmSync(dir, { recursive: true });
      }
    });
  });

  describe('flagged sections', () => {
    it('flags empty sections with excerpt and line range', () => {
      const dir = createTempDir();
      try {
        const content = [
          '# Title',
          '',
          '## Empty Section',
          '',
          '## Real Section',
          '',
          'This section has real content with enough words to pass.',
        ].join('\n');
        const filePath = createTempFile(dir, 'flagged.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        const flagged = file.flaggedSections.find(
          (s) => s.heading === 'Empty Section',
        );
        assert.ok(flagged, 'Empty Section should be flagged');
        assert.ok(flagged.reason.length > 0);
        assert.ok(typeof flagged.lineStart === 'number');
        assert.ok(typeof flagged.lineEnd === 'number');
        assert.ok(typeof flagged.excerpt === 'string');
      } finally {
        rmSync(dir, { recursive: true });
      }
    });

    it('flags very short sections with fewer than 10 words', () => {
      const dir = createTempDir();
      try {
        const content = [
          '# Title',
          '',
          'Good intro with enough words to be okay.',
          '',
          '## Short Section',
          '',
          'Too few.',
          '',
          '## Adequate Section',
          '',
          'This section has plenty of words to be considered adequate content for review.',
        ].join('\n');
        const filePath = createTempFile(dir, 'short.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        const flagged = file.flaggedSections.find(
          (s) => s.heading === 'Short Section',
        );
        assert.ok(flagged, 'Short Section should be flagged');
        assert.ok(flagged.reason.toLowerCase().includes('short'));
      } finally {
        rmSync(dir, { recursive: true });
      }
    });

    it('flags sections containing broken links', () => {
      const dir = createTempDir();
      try {
        const content = [
          '# Title',
          '',
          '## Section With Broken Link',
          '',
          'Content with a [broken link](missing-file.md) that does not exist.',
          '',
          '## Clean Section',
          '',
          'This section is fine and has no issues whatsoever in its content.',
        ].join('\n');
        const filePath = createTempFile(dir, 'broken-section.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        const flagged = file.flaggedSections.find(
          (s) =>
            s.heading === 'Section With Broken Link' &&
            s.reason.toLowerCase().includes('broken'),
        );
        assert.ok(flagged, 'Section with broken link should be flagged with broken reason');
        assert.ok(flagged.reason.toLowerCase().includes('broken'));
      } finally {
        rmSync(dir, { recursive: true });
      }
    });

    it('limits excerpt to 200 characters', () => {
      const dir = createTempDir();
      try {
        const longText = 'word '.repeat(100);
        const content = [
          '# Title',
          '',
          '## Verbose Section',
          '',
          longText,
          '',
          '## Next',
          '',
          'Short.',
        ].join('\n');
        const filePath = createTempFile(dir, 'long.md', content);
        const { stdout, exitCode } = run(filePath);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        const file = result.files[0];

        const nextFlagged = file.flaggedSections.find(
          (s) => s.heading === 'Next',
        );
        if (nextFlagged) {
          assert.ok(nextFlagged.excerpt.length <= 200);
        }
      } finally {
        rmSync(dir, { recursive: true });
      }
    });
  });

  describe('summary', () => {
    it('counts filesNeedingLlmReview when issues exist', () => {
      const dir = createTempDir();
      try {
        const cleanFile = createTempFile(
          dir,
          'clean.md',
          [
            '---',
            'name: clean',
            '---',
            '',
            '# Clean File',
            '',
            '## Purpose',
            '',
            'This file is clean with enough content words here and more.',
            '',
            '## When to Use',
            '',
            'Use it when you need something that has enough content to not be flagged.',
          ].join('\n'),
        );
        const dirtyFile = createTempFile(
          dir,
          'dirty.md',
          [
            '# Dirty File',
            '',
            '[broken](nope.md)',
            '',
            '## Empty Section',
          ].join('\n'),
        );
        const { stdout, exitCode } = run(cleanFile, dirtyFile);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        assert.equal(result.summary.totalFiles, 2);
        assert.ok(result.summary.totalIssues > 0);
        assert.ok(result.summary.filesNeedingLlmReview >= 1);
      } finally {
        rmSync(dir, { recursive: true });
      }
    });
  });

  describe('--base-dir containment', () => {
    it('accepts files that reside inside the base directory', () => {
      const dir = createTempDir();
      try {
        const filePath = createTempFile(dir, 'inside.md', '# Inside\n\nContent here.');
        const { exitCode, stdout } = runWithArgs(['--base-dir', dir, filePath]);

        assert.equal(exitCode, 0);

        const result: MarkdownPrefilterOutput = JSON.parse(stdout);
        assert.equal(result.summary.totalFiles, 1);
      } finally {
        rmSync(dir, { recursive: true });
      }
    });

    it('exits with code 1 when a file resolves outside the base directory', () => {
      const baseDir = createTempDir();
      const otherDir = createTempDir();
      try {
        const outsideFile = createTempFile(otherDir, 'outside.md', '# Outside');
        const { exitCode } = runWithArgs(['--base-dir', baseDir, outsideFile]);

        assert.equal(exitCode, 1);
      } finally {
        rmSync(baseDir, { recursive: true });
        rmSync(otherDir, { recursive: true });
      }
    });

    it('exits with code 1 when --base-dir has no value', () => {
      const { exitCode } = runWithArgs(['--base-dir']);

      assert.equal(exitCode, 1);
    });
  });
});
