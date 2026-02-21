import { describe, expect, it } from 'vitest';

import { extractProjectName } from './extract-project-name';

describe('extractProjectName', () => {
  it('extracts project name from normal path', () => {
    expect(extractProjectName('/Users/Ariel/projects/agents-and-skills')).toBe('agents-and-skills');
  });

  it('extracts project name from path with trailing slash', () => {
    expect(extractProjectName('/Users/Ariel/projects/agents-and-skills/')).toBe(
      'agents-and-skills'
    );
  });

  it('returns empty string for root path', () => {
    expect(extractProjectName('/')).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(extractProjectName(undefined)).toBe('');
  });

  it('returns empty string for empty string', () => {
    expect(extractProjectName('')).toBe('');
  });
});
