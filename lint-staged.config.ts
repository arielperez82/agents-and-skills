// Root lint-staged: repo-wide files only.
// Subprojects handle their own lint-staged (telemetry/, scripts/skills-deploy/).
export default {
  '{scripts,skills}/**/*.sh': (stagedFiles: string[]) => [`sh scripts/run-shellcheck.sh ${stagedFiles.join(' ')}`],
  '.github/workflows/*.{yml,yaml}': (stagedFiles: string[]) => [`sh scripts/run-actionlint.sh ${stagedFiles.join(' ')}`],
};
