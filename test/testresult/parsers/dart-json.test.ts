import * as fs from 'fs';
import * as path from 'path';

import { DartJsonParser } from '../../../src/testresult/parsers/dart-json/dart-json-parser.js';
import { ParseOptions } from '../../../src/testresult/test-parser.js';
import {
  DEFAULT_OPTIONS,
  getReport,
} from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utils.js';
import { getDirname } from '../helpers/dir.js';

const __dirname = getDirname(import.meta.url);

describe('dart-json tests', () => {
  test('produces empty test run result when there are no test cases', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'empty',
      'dart-json.json',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

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

    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'dart-json.json',
    );
    const outputPath = path.join(__dirname, '../__outputs__', 'dart-json.md');
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const parser = new DartJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('report from rrousselGit/provider test results matches snapshot', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'flutter',
      'provider-test-results.json',
    );
    const trackedFilesPath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'flutter',
      'files.txt',
    );
    const outputPath = path.join(
      __dirname,
      '..',
      '__outputs__',
      'provider-test-results.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const trackedFiles = fs
      .readFileSync(trackedFilesPath, { encoding: 'utf8' })
      .split(/\n\r?/g);
    const opts: ParseOptions = {
      trackedFiles,
      parseErrors: true,
    };

    const parser = new DartJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('report does not include a title by default', async () => {
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'dart-json.json',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

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
        __dirname,
        '../__fixtures__',
        'dart-json.json',
      );
      const filePath = normalizeFilePath(
        path.relative(path.join(__dirname, '..'), fixturePath),
      );
      const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

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
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'dart-json.json',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

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
