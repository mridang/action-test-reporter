/**
 * @file Tests the parsing of Java stack trace lines.
 */

import { randomStrings, referencePattern } from '../helpers/fuzz.js';
import {
  parseStackTraceElement,
  splitClassLoaderPrefix,
} from '../../../src/testresult/parsers/java-junit/java-stack-trace-element-parser.js';

describe('parseStackTraceLine tests', () => {
  test('empty line is not parsed', async () => {
    const line = '';
    expect(parseStackTraceElement(line)).toBeUndefined();
  });

  describe('java class', () => {
    test('simple', async () => {
      const line =
        'at org.apache.pulsar.AddMissingPatchVersionTest.testVersionStrings(AddMissingPatchVersionTest.java:29)';
      expect(parseStackTraceElement(line)).toEqual({
        tracePath:
          'org.apache.pulsar.AddMissingPatchVersionTest.testVersionStrings',
        fileName: 'AddMissingPatchVersionTest.java',
        lineStr: '29',
      });
    });

    test('inner class', async () => {
      const line = 'at com.foo.Main$Inner.run(Main.java:29)';
      expect(parseStackTraceElement(line)).toEqual({
        tracePath: 'com.foo.Main$Inner.run',
        fileName: 'Main.java',
        lineStr: '29',
      });
    });

    test('starts with whitespaces', async () => {
      const line =
        ' \tat org.apache.pulsar.AddMissingPatchVersionTest.testVersionStrings(AddMissingPatchVersionTest.java:29)';
      expect(parseStackTraceElement(line)).toEqual({
        tracePath:
          'org.apache.pulsar.AddMissingPatchVersionTest.testVersionStrings',
        fileName: 'AddMissingPatchVersionTest.java',
        lineStr: '29',
      });
    });

    describe('since Java 9', () => {
      test('with classloader and module', async () => {
        const line =
          'at com.foo.loader/foo@9.0/com.foo.Main.run(Main.java:101)';
        expect(parseStackTraceElement(line)).toEqual({
          classLoader: 'com.foo.loader',
          moduleNameAndVersion: 'foo@9.0',
          tracePath: 'com.foo.Main.run',
          fileName: 'Main.java',
          lineStr: '101',
        });
      });

      test('with classloader', async () => {
        const line = 'at com.foo.loader//com.foo.Main.run(Main.java:101)';
        expect(parseStackTraceElement(line)).toEqual({
          classLoader: 'com.foo.loader',
          tracePath: 'com.foo.Main.run',
          fileName: 'Main.java',
          lineStr: '101',
        });
      });
    });
  });

  describe('Kotlin class', () => {
    test('method name containing whitespaces', async () => {
      const line = 'at com.foo.Main.method with whitespaces(Main.kt:18)';
      expect(parseStackTraceElement(line)).toEqual({
        tracePath: 'com.foo.Main.method with whitespaces',
        fileName: 'Main.kt',
        lineStr: '18',
      });
    });
  });
});

const originalRe = referencePattern(
  '',
  String.raw`^\s*at (\S+\/\S*\/)?(.*)`,
  String.raw`\((.*):(\d+)\)$`,
);
const originalPrefixRe = referencePattern(
  '',
  String.raw`^(\S+\/\S*\/)?`,
  '(.*)$',
);

describe('java stack trace patterns match the original pattern', () => {
  test('parses the same random lines', () => {
    const samples = [
      ...randomStrings(
        ['a', 'b', '/', '/', ' ', '(', ')', ':', '1', '2', '.', '@', '\t'],
        60_000,
        16,
        'at ',
      ),
      ...randomStrings(['a', '/', ' ', '(', ')', ':', '1', 'at '], 20_000, 14),
    ];
    for (const sample of samples) {
      const match = originalRe.exec(sample);
      const parsed = parseStackTraceElement(sample);
      expect({ sample, matched: parsed !== undefined }).toEqual({
        sample,
        matched: match !== null,
      });
      if (match !== null) {
        expect({ sample, parsed }).toMatchObject({
          sample,
          parsed: {
            tracePath: match[2],
            fileName: match[3],
            lineStr: match[4],
          },
        });
      }
    }
  });

  test('splits the prefix the same way for random texts', () => {
    const samples = randomStrings(
      ['a', 'b', '/', '/', ' ', '.', '@', '\t', '('],
      80_000,
      14,
    );
    for (const sample of samples) {
      const match = originalPrefixRe.exec(sample) as RegExpExecArray;
      expect({ sample, split: splitClassLoaderPrefix(sample) }).toEqual({
        sample,
        split: [match[1], match[2]],
      });
    }
  });

  test('keeps the module prefix of a frame', () => {
    const line = 'at app//jdk.internal/com.example.App.run(App.java:42)';
    expect(parseStackTraceElement(line)?.classLoader).toBe('app');
  });

  test('stays fast on a long adversarial line', () => {
    const started = Date.now();
    expect(
      parseStackTraceElement(
        `at ${'/'.repeat(200_000)} ${'('.repeat(200_000)}`,
      ),
    ).toBeUndefined();
    expect(Date.now() - started).toBeLessThan(1000);
    const shortLine = `at ${'/'.repeat(150)} ${'('.repeat(150)}`;
    expect(parseStackTraceElement(shortLine)).toBeUndefined();
    expect(originalRe.exec(shortLine)).toBeNull();
  });
});
