// Root lint-staged: repo-wide files only.
// Subprojects handle their own lint-staged (telemetry/, scripts/skills-deploy/).
export default {
  '{scripts,skills}/**/*.sh': `sh scripts/run-shellcheck.sh`,
  '.github/workflows/*.{yml,yaml}': `sh scripts/run-actionlint.sh`,
  '{skills,packages}/**/*.{ts,js,mjs,cjs,py}': `sh scripts/run-semgrep.sh`,
  '**/*/package.json': () => [
    `bash -c 'set -o pipefail; pnpm audit --prod --audit-level high 2>&1 | tail -1'`,
  ],
};
