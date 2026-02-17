import { resolve } from 'node:path';
import { deployChangedSkills } from './deploy.js';

const main = async (): Promise<void> => {
  const apiKey = process.env['ANTHROPIC_API_KEY'];
  if (!apiKey) {
    console.error('Error: ANTHROPIC_API_KEY environment variable is required');
    process.exit(1);
  }

  const rootDir = resolve(process.cwd(), '../..');
  const manifestPath = resolve(rootDir, '.docs/canonical/ops/skills-api-manifest.json');
  const ref = process.env['DEPLOY_REF'] ?? 'HEAD~1';
  const baseUrl = process.env['ANTHROPIC_API_BASE_URL'];

  console.log(`Deploying changed skills (ref: ${ref})...`);
  console.log(`Root: ${rootDir}`);
  console.log(`Manifest: ${manifestPath}`);

  const summary = await deployChangedSkills({
    rootDir,
    manifestPath,
    apiKey,
    ref,
    baseUrl,
  });

  console.log('\n--- Deploy Summary ---');
  console.log(`Created: ${String(summary.created.length)}`);
  summary.created.forEach((entry) => {
    console.log(`  + ${entry.skillPath} → ${entry.skillId}`);
  });

  console.log(`Versioned: ${String(summary.versioned.length)}`);
  summary.versioned.forEach((entry) => {
    console.log(`  ↑ ${entry.skillPath} → v${entry.version}`);
  });

  console.log(`Skipped: ${String(summary.skipped.length)}`);
  summary.skipped.forEach((entry) => {
    console.log(`  ⊘ ${entry.skillPath}: ${entry.reason}`);
  });

  const total = summary.created.length + summary.versioned.length;
  console.log(`\nTotal deployed: ${String(total)}`);

  if (summary.created.length > 0) {
    console.log('\nManifest updated with new skill IDs.');
  }
};

main().catch((error: unknown) => {
  console.error('Deploy failed:', error);
  process.exit(1);
});
