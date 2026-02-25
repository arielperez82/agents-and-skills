import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prefilterDiff } from './prefilter-diff.ts';

const tsDiffWithFunctionChanges = [
  'diff --git a/src/utils.ts b/src/utils.ts',
  'index abc1234..def5678 100644',
  '--- a/src/utils.ts',
  '+++ b/src/utils.ts',
  '@@ -1,9 +1,14 @@',
  " import { something } from 'somewhere';",
  ' ',
  '-export function oldHelper(x: number): number {',
  '-  return x + 1;',
  '-}',
  '+export function newHelper(x: number, y: number): number {',
  '+  return x + y;',
  '+}',
  '+',
  '+export const formatOutput = (data: string): string => {',
  '+  const trimmed = data.trim();',
  '+  return trimmed.toUpperCase();',
  '+};',
  ' ',
  ' export function unchanged(): void {',
  "   console.log('still here');",
  ' }',
].join('\n');

const markdownOnlyDiff = [
  'diff --git a/README.md b/README.md',
  'index 1111111..2222222 100644',
  '--- a/README.md',
  '+++ b/README.md',
  '@@ -1,4 +1,7 @@',
  ' # My Project',
  ' ',
  '-Old description here.',
  '-End.',
  '+New description here with more detail.',
  '+',
  '+## Getting Started',
  '+',
  '+Run the thing.',
].join('\n');

const jsonDiff = [
  'diff --git a/package.json b/package.json',
  'index aaa1111..bbb2222 100644',
  '--- a/package.json',
  '+++ b/package.json',
  '@@ -1,3 +1,4 @@',
  ' {',
  '-  "description": "old"',
  '+  "description": "new",',
  '+  "license": "MIT"',
  ' }',
].join('\n');

const renameDiff = [
  'diff --git a/old-name.ts b/new-name.ts',
  'similarity index 100%',
  'rename from old-name.ts',
  'rename to new-name.ts',
].join('\n');

const binaryDiff = [
  'diff --git a/logo.png b/logo.png',
  'new file mode 100644',
  'index 0000000..abcdef1',
  'Binary files /dev/null and b/logo.png differ',
].join('\n');

const whitespaceOnlyDiff = [
  'diff --git a/src/index.ts b/src/index.ts',
  'index abc1234..def5678 100644',
  '--- a/src/index.ts',
  '+++ b/src/index.ts',
  '@@ -1,3 +1,3 @@',
  "-import { a } from './a';",
  "-import { b } from './b';",
  "+import { b } from './b';",
  "+import { a } from './a';",
  ' export const x = 1;',
].join('\n');

const functionAddedDiff = [
  'diff --git a/src/service.ts b/src/service.ts',
  'index abc1234..def5678 100644',
  '--- a/src/service.ts',
  '+++ b/src/service.ts',
  '@@ -1,3 +1,12 @@',
  " import { db } from './db';",
  ' ',
  ' export const existing = true;',
  '+',
  '+export function brandNewFunction(input: string): boolean {',
  '+  const cleaned = input.trim();',
  '+  if (cleaned.length === 0) return false;',
  "+  return cleaned.startsWith('valid');",
  '+}',
  '+',
  '+export const anotherNew = (x: number): number => x * 2;',
  '+',
].join('\n');

const generateLargeDiff = (): string => {
  const addedLines = Array.from(
    { length: 600 },
    (_, i) => `+  const line${i} = ${i};`,
  );
  const removedLines = Array.from(
    { length: 500 },
    (_, i) => `-  const oldLine${i} = ${i};`,
  );
  return [
    'diff --git a/src/big-file.ts b/src/big-file.ts',
    'index abc1234..def5678 100644',
    '--- a/src/big-file.ts',
    '+++ b/src/big-file.ts',
    '@@ -1,502 +1,603 @@',
    " import { stuff } from 'things';",
    '+export function newBigFunction(): void {',
    ...addedLines,
    ...removedLines,
    '+}',
    ' export const end = true;',
  ].join('\n');
};

describe('prefilterDiff', () => {
  it('parses TypeScript diff with function changes and marks as significant', () => {
    const result = prefilterDiff(tsDiffWithFunctionChanges);

    assert.equal(result.files.length, 1);

    const file = result.files[0];
    assert.equal(file.path, 'src/utils.ts');
    assert.equal(file.fileType, 'typescript');
    assert.equal(file.significance, 'significant');
    assert.ok(file.linesAdded > 0);
    assert.ok(file.linesRemoved > 0);
    assert.ok(file.changedFunctions.length > 0);

    const functionNames = file.changedFunctions.map((f) => f.name);
    assert.ok(
      functionNames.includes('newHelper'),
      `expected changedFunctions to include 'newHelper', got: ${JSON.stringify(functionNames)}`,
    );
    assert.ok(
      functionNames.includes('formatOutput'),
      `expected changedFunctions to include 'formatOutput', got: ${JSON.stringify(functionNames)}`,
    );

    assert.ok(
      file.rawHunks !== undefined && file.rawHunks.length > 0,
      'significant files should include rawHunks',
    );
  });

  it('classifies markdown diff correctly with no function extraction', () => {
    const result = prefilterDiff(markdownOnlyDiff);

    assert.equal(result.files.length, 1);

    const file = result.files[0];
    assert.equal(file.path, 'README.md');
    assert.equal(file.fileType, 'markdown');
    assert.deepEqual(file.changedFunctions, []);
    assert.ok(file.linesAdded > 0);
  });

  it('handles mixed diff with TS, MD, and JSON files', () => {
    const mixed = [
      tsDiffWithFunctionChanges,
      markdownOnlyDiff,
      jsonDiff,
    ].join('\n');
    const result = prefilterDiff(mixed);

    assert.equal(result.files.length, 3);
    assert.equal(result.summary.totalFiles, 3);

    const fileTypes = result.files.map((f) => f.fileType).sort();
    assert.deepEqual(fileTypes, ['json', 'markdown', 'typescript']);

    const tsFile = result.files.find((f) => f.fileType === 'typescript');
    assert.ok(tsFile);
    assert.ok(tsFile.changedFunctions.length > 0);

    const mdFile = result.files.find((f) => f.fileType === 'markdown');
    assert.ok(mdFile);
    assert.deepEqual(mdFile.changedFunctions, []);
  });

  it('returns empty output for empty diff input', () => {
    const result = prefilterDiff('');

    assert.deepEqual(result.files, []);
    assert.equal(result.summary.totalFiles, 0);
    assert.equal(result.summary.totalLinesChanged, 0);
    assert.equal(result.summary.trivialFiles, 0);
    assert.equal(result.summary.moderateFiles, 0);
    assert.equal(result.summary.significantFiles, 0);
  });

  it('populates oldPath for rename-only diffs and marks as trivial', () => {
    const result = prefilterDiff(renameDiff);

    assert.equal(result.files.length, 1);

    const file = result.files[0];
    assert.equal(file.path, 'new-name.ts');
    assert.equal(file.oldPath, 'old-name.ts');
    assert.equal(file.significance, 'trivial');
    assert.equal(file.linesAdded, 0);
    assert.equal(file.linesRemoved, 0);
  });

  it('handles binary files with zero line counts and trivial significance', () => {
    const result = prefilterDiff(binaryDiff);

    assert.equal(result.files.length, 1);

    const file = result.files[0];
    assert.equal(file.path, 'logo.png');
    assert.equal(file.fileType, 'png');
    assert.equal(file.linesAdded, 0);
    assert.equal(file.linesRemoved, 0);
    assert.equal(file.significance, 'trivial');
    assert.deepEqual(file.changedFunctions, []);
  });

  it('marks large diffs as significant and includes rawHunks', () => {
    const largeDiff = generateLargeDiff();
    const result = prefilterDiff(largeDiff);

    assert.equal(result.files.length, 1);

    const file = result.files[0];
    assert.equal(file.significance, 'significant');
    assert.ok(
      file.rawHunks !== undefined && file.rawHunks.length > 0,
      'significant files should include rawHunks',
    );
    assert.ok(
      result.summary.totalLinesChanged > 1000,
      `expected > 1000 total lines changed, got ${result.summary.totalLinesChanged}`,
    );
    assert.equal(result.summary.significantFiles, 1);
  });

  it('classifies whitespace/import-only changes as trivial without rawHunks', () => {
    const result = prefilterDiff(whitespaceOnlyDiff);

    assert.equal(result.files.length, 1);

    const file = result.files[0];
    assert.equal(file.significance, 'trivial');
    assert.equal(file.rawHunks, undefined);
  });

  it('detects new function additions and marks as significant', () => {
    const result = prefilterDiff(functionAddedDiff);

    assert.equal(result.files.length, 1);

    const file = result.files[0];
    assert.equal(file.significance, 'significant');
    assert.ok(file.changedFunctions.length > 0);

    const functionNames = file.changedFunctions.map((f) => f.name);
    assert.ok(
      functionNames.includes('brandNewFunction'),
      `expected 'brandNewFunction' in ${JSON.stringify(functionNames)}`,
    );
    assert.ok(
      functionNames.includes('anotherNew'),
      `expected 'anotherNew' in ${JSON.stringify(functionNames)}`,
    );

    assert.ok(
      file.rawHunks !== undefined,
      'significant files should include rawHunks',
    );
  });
});
