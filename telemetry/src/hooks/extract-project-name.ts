import path from 'node:path';

export const extractProjectName = (cwd: string | undefined): string => {
  if (!cwd) return '';

  const normalized = cwd.endsWith('/') ? cwd.slice(0, -1) : cwd;
  if (!normalized) return '';

  return path.basename(normalized);
};
