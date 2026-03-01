import type { PatternCategory } from '../src/types.js';

export const toolMisuse: PatternCategory = {
  id: 'tool-misuse',
  name: 'Tool Misuse',
  description:
    'Detects attempts to abuse tools for malicious operations like shell injection or file system attacks',
  rules: [
    {
      id: 'tm-001',
      pattern:
        /\bcat\b.{0,200}\|\s*curl\b|\bwget\b.{0,200}\|\s*bash\b|\bcurl\b.{0,200}\|\s*(bash|sh|eval)\b/i,
      severity: 'CRITICAL',
      message: 'Bash command piping data to external service or execution',
    },
    {
      id: 'tm-002',
      pattern:
        /\b(write|create|modify|overwrite)\b.{0,200}\b(\/etc\/|~\/\.ssh\/|~\/\.bashrc|~\/\.profile|\/root\/|authorized_keys)\b/i,
      severity: 'CRITICAL',
      message: 'File write to sensitive system path',
    },
    {
      id: 'tm-003',
      pattern:
        /\b(fetch|download|retrieve)\b.{0,200}\b(from|at)\b.{0,200}https?:\/\/.{0,200}\b(execute|run|eval)\b/i,
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
      pattern:
        /\brm\s+-rf\s+\/|\bmkfs\b|\bdd\s+if=.{0,200}of=\/dev\/|;\s*rm\s+-rf\b|\b&&\s*rm\s+-rf\b/i,
      severity: 'HIGH',
      message: 'Destructive shell command pattern',
    },
  ],
};
