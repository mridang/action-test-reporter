/**
 * @file Tests the Dart JSON test result parser against its fixtures.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import {
  DartJsonParser,
  FLUTTER_EXCEPTION_PRINT,
  matchDartFrame,
  matchFlutterFrame,
} from '../../../src/testresult/parsers/dart-json/dart-json-parser.js';
import { randomStrings, referencePattern } from '../helpers/fuzz.js';
import { ParseOptions } from '../../../src/testresult/test-parser.js';
import {
  DEFAULT_OPTIONS,
  getReport,
} from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utils.js';
import { getDirname } from '../helpers/dir.js';

const testDir = getDirname(import.meta.url);

describe('dart-json tests', () => {
  test('produces empty test run result when there are no test cases', async () => {
    const fixturePath = path.join(
      testDir,
      '..',
      '__fixtures__',
      'empty',
      'dart-json.json',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new DartJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result.tests).toBe(0);
    expect(result.result).toBe('success');
  });

  test('matches report snapshot', async () => {
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [
        'lib/main.dart',
        'test/main_test.dart',
        'test/second_test.dart',
      ],
    };

    const fixturePath = path.join(testDir, '../__fixtures__', 'dart-json.json');
    const outputPath = path.join(testDir, '../__outputs__', 'dart-json.md');
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const parser = new DartJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report);
  });

  test('report from rrousselGit/provider test results matches snapshot', async () => {
    const fixturePath = path.join(
      testDir,
      '..',
      '__fixtures__',
      'external',
      'flutter',
      'provider-test-results.json',
    );
    const trackedFilesPath = path.join(
      testDir,
      '..',
      '__fixtures__',
      'external',
      'flutter',
      'files.txt',
    );
    const outputPath = path.join(
      testDir,
      '..',
      '__outputs__',
      'provider-test-results.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const rawTrackedFiles = await readFile(trackedFilesPath, {
      encoding: 'utf8',
    });
    const trackedFiles = rawTrackedFiles.split(/\n\r?/g);
    const opts: ParseOptions = {
      trackedFiles,
      parseErrors: true,
    };

    const parser = new DartJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report);
  });

  test('report does not include a title by default', async () => {
    const fixturePath = path.join(testDir, '../__fixtures__', 'dart-json.json');
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new DartJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result]);
    expect(report).toMatch(/^!\[Tests failed]/);
  });

  test.each([
    ['empty string', ''],
    ['space', ' '],
    ['tab', '\t'],
    ['newline', '\n'],
  ])(
    'report does not include a title when configured value is %s',
    async (_, reportTitle) => {
      const fixturePath = path.join(
        testDir,
        '../__fixtures__',
        'dart-json.json',
      );
      const filePath = normalizeFilePath(
        path.relative(path.join(testDir, '..'), fixturePath),
      );
      const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

      const opts: ParseOptions = {
        parseErrors: true,
        trackedFiles: [],
      };

      const parser = new DartJsonParser(opts);
      const result = await parser.parse(filePath, fileContent);
      const report = getReport([result], {
        ...DEFAULT_OPTIONS,
        reportTitle,
      });
      expect(report).toMatch(/^!\[Tests failed]/);
    },
  );

  test('report includes a custom report title', async () => {
    const fixturePath = path.join(testDir, '../__fixtures__', 'dart-json.json');
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new DartJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      reportTitle: 'My Custom Title',
    });
    expect(report).toMatch(/^# My Custom Title\n/);
  });
});

describe('dart stack trace patterns match the original patterns', () => {
  const originalDart = referencePattern(
    '',
    '^(?!package:)(.*)',
    String.raw`\s+(\d+):\d+\s+`,
  );
  const originalFlutter = referencePattern(
    '',
    String.raw`^#\d+\s+.*`,
    String.raw`\((?!package:)(.*)`,
    String.raw`:(\d+):\d+\)$`,
  );
  const originalPrint = referencePattern(
    'ms',
    String.raw`^══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞═+\s+(.*)`,
    String.raw`\s+When the exception was thrown, this was the stack:`,
  );

  test('reads the same Dart frames from random lines', () => {
    const samples = randomStrings(
      ['a', 'b', ' ', ' ', '\t', ':', ':', '1', '2', '/', 'package:', '('],
      150_000,
      14,
    );
    for (const sample of samples) {
      const match = originalDart.exec(sample);
      expect({ sample, frame: matchDartFrame(sample) }).toEqual({
        sample,
        frame: match === null ? undefined : [match[1], match[2]],
      });
    }
  });

  test('reads the same Flutter frames from random lines', () => {
    const samples = randomStrings(
      ['a', ' ', ' ', ':', ':', '1', '2', '/', 'package:', '(', '(', ')'],
      150_000,
      16,
      '#1 ',
    );
    for (const sample of samples) {
      const match = originalFlutter.exec(sample);
      expect({ sample, frame: matchFlutterFrame(sample) }).toEqual({
        sample,
        frame: match === null ? undefined : [match[1], match[2]],
      });
    }
  });

  test('reads the same exception text from random prints', () => {
    const header = '══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞═';
    const marker = 'When the exception was thrown, this was the stack:';
    const samples = randomStrings(
      ['x', ' ', ' ', '\n', '\n', '═', marker, header, '\t'],
      60_000,
      9,
    );
    for (const sample of samples) {
      const match = originalPrint.exec(sample);
      const actual = FLUTTER_EXCEPTION_PRINT.exec(sample);
      expect({ sample, text: actual?.[1].trimStart() }).toEqual({
        sample,
        text: match?.[1],
      });
    }
  });

  test('stays fast on long adversarial input', () => {
    const started = Date.now();
    expect(matchDartFrame(`a${' '.repeat(200_000)}x`)).toBeUndefined();
    expect(matchFlutterFrame(`#1 ${'('.repeat(200_000)}`)).toBeUndefined();
    expect(
      matchFlutterFrame(`#1 ${'(package:'.repeat(50_000)}:1:2)`),
    ).toBeUndefined();
    expect(
      FLUTTER_EXCEPTION_PRINT.exec(
        `══╡ EXCEPTION CAUGHT BY FLUTTER TEST FRAMEWORK ╞═${' '.repeat(200_000)}x`,
      ),
    ).toBeNull();
    expect(Date.now() - started).toBeLessThan(1000);
    expect(originalDart.exec(`a${' '.repeat(3000)}x`)).toBeNull();
    expect(matchDartFrame(`a${' '.repeat(3000)}x`)).toBeUndefined();
  });
});
