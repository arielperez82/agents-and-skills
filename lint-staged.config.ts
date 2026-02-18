// Root lint-staged: repo-wide files only.
// Subprojects handle their own lint-staged (telemetry/, scripts/skills-deploy/).
export default {
  '**/*.sh': (stagedFiles: string[]) => {
    const nonTelemetry = stagedFiles.filter((f) => !f.startsWith('telemetry/'));
    return nonTelemetry.length > 0
      ? [`sh telemetry/scripts/run-shellcheck.sh ${nonTelemetry.join(' ')}`]
      : [];
  },
  '.github/workflows/*.{yml,yaml}': (stagedFiles: string[]) =>
    stagedFiles.length > 0
      ? [`sh telemetry/scripts/run-actionlint.sh ${stagedFiles.join(' ')}`]
      : [],
};
