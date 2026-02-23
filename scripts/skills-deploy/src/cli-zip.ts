import { resolve } from 'node:path';

import { writeSkillZips } from './zip-to-disk.js';

const main = async (): Promise<void> => {
  const rootDir = resolve(process.cwd(), '../..');
  const outputDir = process.env['OUTPUT_DIR'] ?? resolve(rootDir, 'dist/skill-zips');

  console.log('Generating skill zip files...');
  console.log(`Root: ${rootDir}`);
  console.log(`Output: ${outputDir}`);

  const summary = await writeSkillZips({ rootDir, outputDir });

  console.log('\n--- Zip Generation Summary ---');
  console.log(`Written: ${String(summary.written.length)}`);
  summary.written.forEach((entry) => {
    console.log(`  + ${entry.skillPath} → ${entry.zipFileName}`);
  });

  console.log(`Skipped: ${String(summary.skipped.length)}`);
  summary.skipped.forEach((entry) => {
    console.log(`  ⊘ ${entry.skillPath}: ${entry.reason}`);
  });

  console.log(`\nZip files written to: ${outputDir}`);

  if (summary.written.length > 0) {
    console.log(`Manifest: ${outputDir}/manifest.json`);
  }
};

main().catch((error: unknown) => {
  console.error('Zip generation failed:', error);
  process.exit(1);
});
