import { parseNetDuration } from '../../../src/testresult/utils/parse-utils.js';

describe('parseNetDuration', () => {
  test('returns 0 for 00:00:00', () => {
    const ms = parseNetDuration('00:00:00');
    expect(ms).toBe(0);
  });

  test('returns 0 for 00:00:00.0000000', () => {
    const ms = parseNetDuration('00:00:00.0000000');
    expect(ms).toBe(0);
  });

  test('returns 123 for 00:00:00.123', () => {
    const ms = parseNetDuration('00:00:00.123');
    expect(ms).toBe(123);
  });

  test('returns 12 * 1000 for 00:00:12', () => {
    const ms = parseNetDuration('00:00:12');
    expect(ms).toBe(12 * 1000);
  });

  test('returns 12 * 60 * 1000 for 00:12:00', () => {
    const ms = parseNetDuration('00:12:00');
    expect(ms).toBe(12 * 60 * 1000);
  });

  test('returns 12 * 60 * 60 * 1000 for 12:00:00', () => {
    const ms = parseNetDuration('12:00:00');
    expect(ms).toBe(12 * 60 * 60 * 1000);
  });

  test('throws when string has invalid format', () => {
    expect(() => parseNetDuration('12:34:56 not a duration')).toThrow(
      /^Invalid format/,
    );
  });
});
