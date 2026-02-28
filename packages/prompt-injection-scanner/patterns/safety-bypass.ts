import type { PatternCategory } from '../src/types.js';

export const safetyBypass: PatternCategory = {
  id: 'safety-bypass',
  name: 'Safety Bypass',
  description:
    'Detects attempts to disable safety measures, enter unrestricted modes, or bypass guardrails',
  rules: [
    {
      id: 'sb-001',
      pattern: /\b(maintenance|debug|test)\s+mode\b.*\b(restrictions?|filters?|limits?)\s+(are\s+)?(disabled|removed|off|lifted)\b/i,
      severity: 'CRITICAL',
      message: 'Attempt to enter maintenance mode with restrictions disabled',
    },
    {
      id: 'sb-002',
      pattern: /\b(jailbreak|DAN\s+mode|do\s+anything\s+now|developer\s+mode\s+enabled)\b/i,
      severity: 'CRITICAL',
      message: 'Jailbreak or DAN mode activation attempt',
    },
    {
      id: 'sb-003',
      pattern: /\b(ignore|disable|bypass|remove)\b.*\b(safety|content)\s+(guidelines?|filters?|restrictions?|policies)\b/i,
      severity: 'HIGH',
      message: 'Attempt to ignore or disable safety guidelines',
    },
    {
      id: 'sb-004',
      pattern: /\bact\s+(without|with\s+no)\s+(any\s+)?(restrictions?|limitations?|constraints?|boundaries)\b/i,
      severity: 'HIGH',
      message: 'Attempt to operate without restrictions',
    },
    {
      id: 'sb-005',
      pattern: /\bpretend\s+(you\s+)?(have\s+no|don'?t\s+have|are\s+free\s+from)\s+(rules?|guidelines?|restrictions?|limits?)\b/i,
      severity: 'HIGH',
      message: 'Attempt to pretend no rules apply',
    },
  ],
};
