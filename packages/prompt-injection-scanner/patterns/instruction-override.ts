import type { PatternCategory } from '../src/types.js';

export const instructionOverride: PatternCategory = {
  id: 'instruction-override',
  name: 'Instruction Override',
  description:
    'Detects attempts to override, ignore, or replace system instructions',
  rules: [
    {
      id: 'io-001',
      pattern: /ignore\s+(all\s+)?previous\s+instructions/i,
      severity: 'HIGH',
      message: 'Attempt to ignore previous instructions',
    },
    {
      id: 'io-002',
      pattern: /disregard\s+(all|the)?\s*above/i,
      severity: 'HIGH',
      message: 'Attempt to disregard preceding content',
    },
    {
      id: 'io-003',
      pattern: /new\s+system\s+prompt/i,
      severity: 'CRITICAL',
      message: 'Attempt to inject a new system prompt',
    },
    {
      id: 'io-004',
      pattern: /override\s+(your|all|system)?\s*instructions/i,
      severity: 'HIGH',
      message: 'Attempt to override system instructions',
    },
    {
      id: 'io-005',
      pattern: /forget\s+(all|everything)\s+(you|about)/i,
      severity: 'HIGH',
      message: 'Attempt to erase prior context or training',
    },
  ],
};
