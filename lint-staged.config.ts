// Root lint-staged: repo-wide files only.
// Subprojects handle their own lint-staged (telemetry/, scripts/skills-deploy/).
export default {
  '{scripts,skills}/**/*.sh': (files: readonly string[]) => {
    const nonTest = files.filter((f) => !f.endsWith('.test.sh'));
    return [
      `sh scripts/run-shellcheck.sh ${files.map((f) => '"' + f + '"').join(' ')}`,
      ...(nonTest.length > 0
        ? [`sh scripts/run-bash-taint-check.sh ${nonTest.map((f) => '"' + f + '"').join(' ')}`]
        : []),
    ];
  },
  '.github/workflows/*.{yml,yaml}': `sh scripts/run-actionlint.sh`,
  'skills/**/*.{ts,js,mjs,cjs,py}': `sh scripts/run-semgrep.sh`,
  '**/*/package.json': () => [
    `bash -c 'set -o pipefail; pnpm audit --prod --audit-level high 2>&1 | tail -1'`,
  ],
  '{agents,skills,commands}/**/*.md': (files: readonly string[]) => [
    `npx prompt-injection-scanner --severity HIGH ${files.map((f) => '"' + f + '"').join(' ')} --format json`,
    `sh scripts/run-alignment-check.sh ${files.map((f) => '"' + f + '"').join(' ')}`,
  ],
};
