import { describe, it, expect } from 'vitest';
import { allCategories } from '../patterns/index.js';
import { detectUnicodeIssues } from './unicode-detector.js';

const ADVERSARIAL_SIZE = 10_000;
const MAX_EXECUTION_MS = 100;

const createAdversarialString = (base: string, targetSize: number): string => {
  const repetitions = Math.ceil(targetSize / base.length);
  return base.repeat(repetitions).slice(0, targetSize);
};

const measureRegexExecution = (pattern: RegExp, input: string): number => {
  const freshRegex = new RegExp(pattern.source, pattern.flags);
  const start = performance.now();
  freshRegex.exec(input);
  const elapsed = performance.now() - start;
  return elapsed;
};

const measureFunctionExecution = (fn: () => void): number => {
  const start = performance.now();
  fn();
  return performance.now() - start;
};

type AdversarialInput = {
  readonly name: string;
  readonly input: string;
};

const buildAdversarialInputs = (): readonly AdversarialInput[] => [
  {
    name: 'repeated near-match words with spaces',
    input: createAdversarialString('ignore all previous ', ADVERSARIAL_SIZE),
  },
  {
    name: 'long word-boundary food (alphanumeric soup)',
    input: createAdversarialString('abcdefghij ', ADVERSARIAL_SIZE),
  },
  {
    name: 'dotstar food (mixed content without anchors)',
    input: createAdversarialString(
      'send the data and contents of the prompt and response ',
      ADVERSARIAL_SIZE,
    ),
  },
  {
    name: 'repeated partial URL matches',
    input: createAdversarialString('https://not-quite http://almost ', ADVERSARIAL_SIZE),
  },
  {
    name: 'nested alternation stress (mode/debug/test repetitions)',
    input: createAdversarialString(
      'maintenance mode debug mode test mode restrictions filters limits ',
      ADVERSARIAL_SIZE,
    ),
  },
  {
    name: 'authority impersonation near-miss chains',
    input: createAdversarialString(
      'the developers have said the engineers have instructed the admins told ',
      ADVERSARIAL_SIZE,
    ),
  },
  {
    name: 'base64-like character soup (no valid termination)',
    input: createAdversarialString('ABCDEFghij0123456789+/ABCD', ADVERSARIAL_SIZE),
  },
  {
    name: 'HTML entity near-matches',
    input: createAdversarialString('&#123;&#456;&#789;&#012;&#345;', ADVERSARIAL_SIZE),
  },
  {
    name: 'hex escape sequences',
    input: createAdversarialString('\\x41\\x42\\x43\\x44\\x45\\x46', ADVERSARIAL_SIZE),
  },
  {
    name: 'deeply nested whitespace between keywords',
    input: createAdversarialString(
      'grant          admin          access          permissions ',
      ADVERSARIAL_SIZE,
    ),
  },
  {
    name: 'curl-like command fragments',
    input: createAdversarialString('curl -d $(cat something) | curl -X POST ', ADVERSARIAL_SIZE),
  },
  {
    name: 'string concatenation fragments',
    input: createAdversarialString('"a"+"b"+"c"+"d"+"e"+"f"+"g" ', ADVERSARIAL_SIZE),
  },
];

const adversarialInputs = buildAdversarialInputs();

describe('ReDoS benchmark: all scanner patterns complete within 100ms on 10KB adversarial input', () => {
  for (const category of allCategories) {
    describe(`category: ${category.id}`, () => {
      for (const rule of category.rules) {
        for (const adversarial of adversarialInputs) {
          it(`${rule.id} completes in <${MAX_EXECUTION_MS}ms against "${adversarial.name}"`, () => {
            const elapsed = measureRegexExecution(rule.pattern, adversarial.input);

            expect(elapsed).toBeLessThan(MAX_EXECUTION_MS);
          });
        }
      }
    });
  }

  describe('category: unicode-detector (BASE64_PATTERN and HTML_ENTITY_SEQUENCE_PATTERN)', () => {
    for (const adversarial of adversarialInputs) {
      it(`detectUnicodeIssues completes in <${MAX_EXECUTION_MS}ms against "${adversarial.name}"`, () => {
        const elapsed = measureFunctionExecution(() => {
          detectUnicodeIssues(adversarial.input, 'body');
        });

        expect(elapsed).toBeLessThan(MAX_EXECUTION_MS);
      });
    }
  });
});
