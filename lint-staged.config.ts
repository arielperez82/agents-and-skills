// Root lint-staged: repo-wide files only.
// Subprojects handle their own lint-staged (telemetry/, scripts/skills-deploy/).
export default {
  '{scripts,skills}/**/*.sh': `sh scripts/run-shellcheck.sh`,
  '.github/workflows/*.{yml,yaml}': `sh scripts/run-actionlint.sh`,
  '{skills,packages}/**/*.{ts,js,mjs,cjs,py}': `sh scripts/run-semgrep.sh`,
};
