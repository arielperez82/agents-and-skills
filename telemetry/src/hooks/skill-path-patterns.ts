// eslint-disable-next-line security/detect-unsafe-regex -- anchored path patterns, bounded input (file paths)
export const SKILL_PATH_PATTERN = /\/skills\/(?:[^/]+\/)*([^/]+)\/SKILL\.md$/;
export const COMMAND_PATH_PATTERN = /\/commands\/([^/]+\/[^/]+)\.md$/;
// eslint-disable-next-line security/detect-unsafe-regex -- anchored path patterns, bounded input (file paths)
export const REFERENCE_PATH_PATTERN = /\/skills\/(?:[^/]+\/)*([^/]+)\/references\/([^/]+\.md)$/;

/* eslint-disable security/detect-unsafe-regex -- anchored path pattern, bounded input (file paths) */
export const SCRIPT_PATH_PATTERN =
  /\/skills\/(?:[^/]+\/)*([^/]+)\/scripts\/([^/\s]+\.(py|sh))(?:\s|$)/;
/* eslint-enable security/detect-unsafe-regex */

export const isSkillRelatedPath = (filePath: string): boolean =>
  SKILL_PATH_PATTERN.test(filePath) ||
  COMMAND_PATH_PATTERN.test(filePath) ||
  REFERENCE_PATH_PATTERN.test(filePath);

export const isScriptCommand = (command: string): boolean =>
  command.includes('/skills/') &&
  command.includes('/scripts/') &&
  SCRIPT_PATH_PATTERN.test(command);
