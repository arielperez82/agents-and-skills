import type { PatternCategory } from '../src/types.js';
import { dataExfiltration } from './data-exfiltration.js';
import { encodingObfuscation } from './encoding-obfuscation.js';
import { instructionOverride } from './instruction-override.js';
import { privilegeEscalation } from './privilege-escalation.js';
import { safetyBypass } from './safety-bypass.js';
import { socialEngineering } from './social-engineering.js';
import { toolMisuse } from './tool-misuse.js';
import { transitiveTrust } from './transitive-trust.js';

export const allCategories: readonly PatternCategory[] = [
  instructionOverride,
  dataExfiltration,
  toolMisuse,
  safetyBypass,
  socialEngineering,
  encodingObfuscation,
  privilegeEscalation,
  transitiveTrust,
];
