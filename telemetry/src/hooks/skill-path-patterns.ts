export const SKILL_PATH_PATTERN = /\/skills\/(?:[^/]+\/)*([^/]+)\/SKILL\.md$/;
export const COMMAND_PATH_PATTERN = /\/commands\/([^/]+\/[^/]+)\.md$/;
export const REFERENCE_PATH_PATTERN = /\/skills\/(?:[^/]+\/)*([^/]+)\/references\/([^/]+\.md)$/;
export const SCRIPT_PATH_PATTERN =
  /\/skills\/(?:[^/]+\/)*([^/]+)\/scripts\/([^/\s]+\.(py|sh))(?:\s|$)/;

export const isSkillRelatedPath = (filePath: string): boolean =>
  SKILL_PATH_PATTERN.test(filePath) ||
  COMMAND_PATH_PATTERN.test(filePath) ||
  REFERENCE_PATH_PATTERN.test(filePath);

export const isScriptCommand = (command: string): boolean =>
  command.includes('/skills/') &&
  command.includes('/scripts/') &&
  SCRIPT_PATH_PATTERN.test(command);
