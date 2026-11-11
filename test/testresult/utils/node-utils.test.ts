/**
 * @file Tests how stack trace frames are read from Node-based results.
 */

import { randomStrings, referencePattern } from '../helpers/fuzz.js';
import { matchStackFrame } from '../../../src/testresult/utils/node-utils.js';

const originalRe = referencePattern(
  '',
  String.raw`\((.*)`,
  String.raw`:(\d+):\d+\)$`,
);

describe('matchStackFrame', () => {
  test('reads the path and line of a frame', () => {
    expect(matchStackFrame('at run (/work/src/index.ts:10:5)')).toEqual([
      '/work/src/index.ts',
      '10',
    ]);
  });

  test('returns undefined for a line without a location', () => {
    expect(matchStackFrame('at run')).toBeUndefined();
  });

  test('matches the original pattern on random lines', () => {
    const samples = randomStrings(
      ['a', '(', '(', ')', ':', ':', '1', '2', ' ', '/', 'at '],
      150_000,
      16,
    );
    for (const sample of samples) {
      const match = originalRe.exec(sample);
      expect({ sample, frame: matchStackFrame(sample) }).toEqual({
        sample,
        frame: match === null ? undefined : [match[1], match[2]],
      });
    }
  });

  test('stays fast on a long adversarial line', () => {
    const started = Date.now();
    expect(matchStackFrame('('.repeat(200_000))).toBeUndefined();
    expect(matchStackFrame(`${'(:1'.repeat(100_000)}x`)).toBeUndefined();
    expect(Date.now() - started).toBeLessThan(1000);
    const shortLine = '('.repeat(3000);
    expect(originalRe.exec(shortLine)).toBeNull();
    expect(matchStackFrame(shortLine)).toBeUndefined();
  });
});
