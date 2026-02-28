import type { PatternCategory } from '../src/types.js';

// Zero-width character class for detecting evasion via invisible characters.
// Built at runtime from char codes. The character class intentionally contains
// zero-width joiners/non-joiners to detect evasion attempts -- this is not misleading.
const buildZeroWidthPattern = (): RegExp => {
  const zws = String.fromCharCode(0x200b);
  const zwnj = String.fromCharCode(0x200c);
  const zwj = String.fromCharCode(0x200d);
  const bom = String.fromCharCode(0xfeff);
  const zwc = `[${zws}${zwnj}${zwj}${bom}]`;
  const src = `ig${zwc}+n${zwc}*o${zwc}*r${zwc}*e${zwc}*\\s+${zwc}*(all\\s+)?prev${zwc}*ious`;

  // eslint-disable-next-line no-misleading-character-class
  return new RegExp(src, 'i');
};

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
    {
      id: 'io-006',
      pattern:
        /(?:[1l!|]gnore|1gn0re|ign0re|ignor3|igno[r\u0155]3|[1l!|]gn[0\u00f8]re)\s+(all\s+)?previous\s+instructions/i,
      severity: 'MEDIUM',
      message:
        'Typoglycemia variant of "ignore previous instructions" with character swaps',
    },
    {
      id: 'io-007',
      pattern: buildZeroWidthPattern(),
      severity: 'HIGH',
      message:
        'Zero-width character insertion in "ignore previous" to evade detection',
    },
  ],
};
