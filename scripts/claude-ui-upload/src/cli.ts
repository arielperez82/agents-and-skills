import { resolve } from 'node:path';

import { packageAllSkills } from './package-skills.js';

const parseArgs = (): { rootDir: string; outputDir: string } => {
  const args = process.argv.slice(2);
  const rootDir = resolve(process.cwd(), '../..');
  let outputDir = resolve(process.cwd(), 'dist');

  for (let i = 0; i < args.length; i++) {
    const next = args[i + 1];
    // eslint-disable-next-line security/detect-object-injection -- sequential array index
    if (args[i] === '--output' && next !== undefined) {
      outputDir = resolve(process.cwd(), next);
      i++;
      // eslint-disable-next-line security/detect-object-injection -- sequential array index
    } else if (args[i] === '--root' && next !== undefined) {
      return {
        rootDir: resolve(process.cwd(), next),
        outputDir,
      };
    }
  }

  return { rootDir, outputDir };
};

const main = async (): Promise<void> => {
  const { rootDir, outputDir } = parseArgs();

  console.log(`Packaging skills for Claude UI upload...`);
  console.log(`Root:   ${rootDir}`);
  console.log(`Output: ${outputDir}`);

  const summary = await packageAllSkills({ rootDir, outputDir });

  console.log('\n--- Package Summary ---');
  console.log(`Packaged: ${String(summary.packaged.length)}`);
  summary.packaged.forEach((entry) => {
    console.log(`  ✓ ${entry.skillPath} → ${entry.zipFileName}`);
  });

  if (summary.skipped.length > 0) {
    console.log(`\nSkipped: ${String(summary.skipped.length)}`);
    summary.skipped.forEach((entry) => {
      console.log(`  ✗ ${entry.skillPath}: ${entry.reason}`);
    });
  }

  console.log(`\nDone. ${String(summary.packaged.length)} zip(s) written to: ${outputDir}`);
};

main().catch((error: unknown) => {
  console.error('Packaging failed:', error);
  process.exit(1);
});
