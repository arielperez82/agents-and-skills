import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, utimesSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execSync } from 'node:child_process';

const SCRIPT_PATH = join(import.meta.dirname, 'prefilter-progress.ts');

const createTempDir = (): string =>
  mkdtempSync(join(tmpdir(), 'prefilter-progress-test-'));

const writeFile = (dir: string, relativePath: string, content: string): void => {
  const fullPath = join(dir, relativePath);
  const parentDir = fullPath.substring(0, fullPath.lastIndexOf('/'));
  mkdirSync(parentDir, { recursive: true });
  writeFileSync(fullPath, content, 'utf-8');
};

const setFileAge = (dir: string, relativePath: string, daysAgo: number): void => {
  const fullPath = join(dir, relativePath);
  const past = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
  utimesSync(fullPath, past, past);
};

const runScript = (
  docsPath: string,
): { stdout: string; exitCode: number } => {
  try {
    const stdout = execSync(`npx tsx ${SCRIPT_PATH} ${docsPath}`, {
      encoding: 'utf-8',
      timeout: 15_000,
    });
    return { stdout, exitCode: 0 };
  } catch (error: unknown) {
    const execError = error as { stdout?: string; status?: number };
    return {
      stdout: execError.stdout ?? '',
      exitCode: execError.status ?? 1,
    };
  }
};

type FileEntry = {
  readonly path: string;
  readonly type: string;
  readonly frontmatter: {
    readonly valid: boolean;
    readonly initiative?: string;
    readonly initiativeName?: string;
    readonly status?: string;
    readonly missingFields: ReadonlyArray<string>;
  };
  readonly lastModified: string;
  readonly stale: boolean;
  readonly needsLlmReview: boolean;
  readonly staleDays?: number;
};

type InitiativeEntry = {
  readonly id: string;
  readonly hasCharter: boolean;
  readonly hasRoadmap: boolean;
  readonly hasBacklog: boolean;
  readonly hasPlan: boolean;
  readonly hasReport: boolean;
  readonly missingFiles: ReadonlyArray<string>;
};

type PrefilterOutput = {
  readonly files: ReadonlyArray<FileEntry>;
  readonly initiatives: ReadonlyArray<InitiativeEntry>;
  readonly summary: {
    readonly totalFiles: number;
    readonly validFrontmatter: number;
    readonly invalidFrontmatter: number;
    readonly staleFiles: number;
    readonly needsLlmReview: number;
  };
};

const parseOutput = (stdout: string): PrefilterOutput =>
  JSON.parse(stdout) as PrefilterOutput;

describe('prefilter-progress', () => {
  it('produces full inventory for a complete .docs/ structure', () => {
    const dir = createTempDir();

    writeFile(
      dir,
      'charter-I01-TEST.md',
      [
        '---',
        'type: charter',
        'initiative: I01-TEST',
        'initiative_name: Test Initiative',
        'status: in-progress',
        '---',
        '# Charter',
      ].join('\n'),
    );
    writeFile(
      dir,
      'roadmap-I01-TEST.md',
      [
        '---',
        'type: roadmap',
        'initiative: I01-TEST',
        'initiative_name: Test Initiative',
        'status: in-progress',
        '---',
        '# Roadmap',
      ].join('\n'),
    );
    writeFile(
      dir,
      'backlog-I01-TEST.md',
      [
        '---',
        'type: backlog',
        'initiative: I01-TEST',
        'initiative_name: Test Initiative',
        'status: in-progress',
        '---',
        '# Backlog',
      ].join('\n'),
    );
    writeFile(
      dir,
      'plan-I01-TEST.md',
      [
        '---',
        'type: plan',
        'initiative: I01-TEST',
        'initiative_name: Test Initiative',
        'status: in-progress',
        '---',
        '# Plan',
      ].join('\n'),
    );
    writeFile(
      dir,
      'report-I01-TEST.md',
      [
        '---',
        'type: report',
        'initiative: I01-TEST',
        '---',
        '# Report',
      ].join('\n'),
    );

    const result = runScript(dir);
    assert.equal(result.exitCode, 0);

    const output = parseOutput(result.stdout);

    assert.equal(output.files.length, 5);
    assert.equal(output.summary.totalFiles, 5);
    assert.equal(output.summary.validFrontmatter, 5);
    assert.equal(output.summary.invalidFrontmatter, 0);
    assert.equal(output.summary.staleFiles, 0);

    const charter = output.files.find((f) => f.type === 'charter');
    assert.ok(charter);
    assert.equal(charter.frontmatter.valid, true);
    assert.equal(charter.frontmatter.initiative, 'I01-TEST');
    assert.equal(charter.frontmatter.initiativeName, 'Test Initiative');
    assert.equal(charter.frontmatter.status, 'in-progress');
    assert.deepEqual(charter.frontmatter.missingFields, []);

    const initiative = output.initiatives.find((i) => i.id === 'I01-TEST');
    assert.ok(initiative);
    assert.equal(initiative.hasCharter, true);
    assert.equal(initiative.hasRoadmap, true);
    assert.equal(initiative.hasBacklog, true);
    assert.equal(initiative.hasPlan, true);
    assert.equal(initiative.hasReport, true);
    assert.deepEqual(initiative.missingFiles, []);
  });

  it('detects missing charter for an initiative', () => {
    const dir = createTempDir();

    writeFile(
      dir,
      'roadmap-I02-MISS.md',
      [
        '---',
        'type: roadmap',
        'initiative: I02-MISS',
        'initiative_name: Missing Charter',
        'status: in-progress',
        '---',
        '# Roadmap',
      ].join('\n'),
    );
    writeFile(
      dir,
      'backlog-I02-MISS.md',
      [
        '---',
        'type: backlog',
        'initiative: I02-MISS',
        'initiative_name: Missing Charter',
        'status: in-progress',
        '---',
        '# Backlog',
      ].join('\n'),
    );

    const result = runScript(dir);
    assert.equal(result.exitCode, 0);

    const output = parseOutput(result.stdout);
    const initiative = output.initiatives.find((i) => i.id === 'I02-MISS');
    assert.ok(initiative);
    assert.equal(initiative.hasCharter, false);
    assert.equal(initiative.hasRoadmap, true);
    assert.equal(initiative.hasBacklog, true);
    assert.equal(initiative.hasPlan, false);
    assert.equal(initiative.hasReport, false);
    assert.ok(initiative.missingFiles.includes('charter'));
    assert.ok(initiative.missingFiles.includes('plan'));
    assert.ok(initiative.missingFiles.includes('report'));
  });

  it('flags invalid frontmatter with missing required fields', () => {
    const dir = createTempDir();

    writeFile(
      dir,
      'charter-I03-BAD.md',
      [
        '---',
        'initiative: I03-BAD',
        '---',
        '# Charter with missing type, initiative_name, status',
      ].join('\n'),
    );

    const result = runScript(dir);
    assert.equal(result.exitCode, 0);

    const output = parseOutput(result.stdout);
    const file = output.files.find((f) => f.path.includes('charter-I03-BAD'));
    assert.ok(file);
    assert.equal(file.type, 'charter');
    assert.equal(file.frontmatter.valid, false);
    assert.ok(file.frontmatter.missingFields.includes('type'));
    assert.ok(file.frontmatter.missingFields.includes('initiative_name'));
    assert.ok(file.frontmatter.missingFields.includes('status'));
    assert.equal(output.summary.invalidFrontmatter, 1);
  });

  it('marks stale files modified more than 14 days ago with active status', () => {
    const dir = createTempDir();

    writeFile(
      dir,
      'plan-I04-STALE.md',
      [
        '---',
        'type: plan',
        'initiative: I04-STALE',
        'initiative_name: Stale Plan',
        'status: in-progress',
        '---',
        '# Stale plan',
      ].join('\n'),
    );
    setFileAge(dir, 'plan-I04-STALE.md', 20);

    const result = runScript(dir);
    assert.equal(result.exitCode, 0);

    const output = parseOutput(result.stdout);
    const file = output.files.find((f) => f.path.includes('plan-I04-STALE'));
    assert.ok(file);
    assert.equal(file.stale, true);
    assert.ok(file.staleDays !== undefined && file.staleDays >= 19);
    assert.equal(file.needsLlmReview, false);
    assert.equal(output.summary.staleFiles, 1);
  });

  it('handles an empty directory with zero totals', () => {
    const dir = createTempDir();

    const result = runScript(dir);
    assert.equal(result.exitCode, 0);

    const output = parseOutput(result.stdout);
    assert.deepEqual(output.files, []);
    assert.deepEqual(output.initiatives, []);
    assert.equal(output.summary.totalFiles, 0);
    assert.equal(output.summary.validFrontmatter, 0);
    assert.equal(output.summary.invalidFrontmatter, 0);
    assert.equal(output.summary.staleFiles, 0);
    assert.equal(output.summary.needsLlmReview, 0);
  });

  it('groups multiple initiatives correctly', () => {
    const dir = createTempDir();

    writeFile(
      dir,
      'charter-I05-ALPHA.md',
      [
        '---',
        'type: charter',
        'initiative: I05-ALPHA',
        'initiative_name: Alpha',
        'status: in-progress',
        '---',
        '# Alpha Charter',
      ].join('\n'),
    );
    writeFile(
      dir,
      'charter-I06-BETA.md',
      [
        '---',
        'type: charter',
        'initiative: I06-BETA',
        'initiative_name: Beta',
        'status: in-progress',
        '---',
        '# Beta Charter',
      ].join('\n'),
    );
    writeFile(
      dir,
      'plan-I06-BETA.md',
      [
        '---',
        'type: plan',
        'initiative: I06-BETA',
        'initiative_name: Beta',
        'status: in-progress',
        '---',
        '# Beta Plan',
      ].join('\n'),
    );

    const result = runScript(dir);
    assert.equal(result.exitCode, 0);

    const output = parseOutput(result.stdout);
    assert.equal(output.initiatives.length, 2);

    const alpha = output.initiatives.find((i) => i.id === 'I05-ALPHA');
    assert.ok(alpha);
    assert.equal(alpha.hasCharter, true);
    assert.equal(alpha.hasPlan, false);

    const beta = output.initiatives.find((i) => i.id === 'I06-BETA');
    assert.ok(beta);
    assert.equal(beta.hasCharter, true);
    assert.equal(beta.hasPlan, true);
  });

  it('flags valid content-heavy files as needing LLM review', () => {
    const dir = createTempDir();

    writeFile(
      dir,
      'charter-I07-REVIEW.md',
      [
        '---',
        'type: charter',
        'initiative: I07-REVIEW',
        'initiative_name: Review Me',
        'status: in-progress',
        '---',
        '# Charter needing review',
      ].join('\n'),
    );

    writeFile(
      dir,
      'report-I07-REVIEW.md',
      [
        '---',
        'type: report',
        '---',
        '# Report - should NOT need LLM review',
      ].join('\n'),
    );

    const result = runScript(dir);
    assert.equal(result.exitCode, 0);

    const output = parseOutput(result.stdout);

    const charter = output.files.find((f) => f.path.includes('charter-I07'));
    assert.ok(charter);
    assert.equal(charter.needsLlmReview, true);

    const report = output.files.find((f) => f.path.includes('report-I07'));
    assert.ok(report);
    assert.equal(report.needsLlmReview, false);

    assert.equal(output.summary.needsLlmReview, 1);
  });

  it('exits with code 1 for non-existent directory', () => {
    const result = runScript('/tmp/this-path-definitely-does-not-exist-xyz');
    assert.equal(result.exitCode, 1);
  });
});
