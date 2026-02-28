import type { PatternCategory } from '../src/types.js';

export const toolMisuse: PatternCategory = {
  id: 'tool-misuse',
  name: 'Tool Misuse',
  description:
    'Detects attempts to abuse tools for malicious operations like shell injection or file system attacks',
  rules: [
    {
      id: 'tm-001',
      pattern: /\bcat\b.*\|\s*curl\b|\bwget\b.*\|\s*bash\b|\bcurl\b.*\|\s*(bash|sh|eval)\b/i,
      severity: 'CRITICAL',
      message: 'Bash command piping data to external service or execution',
    },
    {
      id: 'tm-002',
      pattern: /\b(write|create|modify|overwrite)\b.*\b(\/etc\/|~\/\.ssh\/|~\/\.bashrc|~\/\.profile|\/root\/|authorized_keys)\b/i,
      severity: 'CRITICAL',
      message: 'File write to sensitive system path',
    },
    {
      id: 'tm-003',
      pattern: /\b(fetch|download|retrieve)\b.*\b(from|at)\b.*https?:\/\/.*\b(execute|run|eval)\b/i,
      severity: 'HIGH',
      message: 'Tool invocation fetching and executing from external URL',
    },
    {
      id: 'tm-004',
      pattern: /\beval\s*\(|\bexec\s*\(|\bnew\s+Function\s*\(/i,
      severity: 'CRITICAL',
      message: 'Dynamic code evaluation pattern (eval/exec)',
    },
    {
      id: 'tm-005',
      pattern: /\brm\s+-rf\s+\/|\bmkfs\b|\bdd\s+if=.*of=\/dev\/|;\s*rm\s+-rf\b|\b&&\s*rm\s+-rf\b/i,
      severity: 'HIGH',
      message: 'Destructive shell command pattern',
    },
  ],
};
