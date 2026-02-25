// Root lint-staged: repo-wide files only.
// Subprojects handle their own lint-staged (telemetry/, scripts/skills-deploy/).
export default {
  '**/*.sh': (stagedFiles: string[]) =>
    stagedFiles.length > 0
      ? [`sh scripts/run-shellcheck.sh ${stagedFiles.join(' ')}`]
      : [],
  '.github/workflows/*.{yml,yaml}': (stagedFiles: string[]) =>
    stagedFiles.length > 0
      ? [`sh scripts/run-actionlint.sh ${stagedFiles.join(' ')}`]
      : [],
};
