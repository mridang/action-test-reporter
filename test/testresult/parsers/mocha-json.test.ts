/**
 * @file Tests the Mocha JSON test result parser against its fixtures.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { MochaJsonParser } from '../../../src/testresult/parsers/mocha-json/mocha-json-parser.js';
import { ParseOptions } from '../../../src/testresult/test-parser.js';
import {
  DEFAULT_OPTIONS,
  getReport,
} from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utils.js';
import { getDirname } from '../helpers/dir.js';

const testDir = getDirname(import.meta.url);

describe('mocha-json tests', () => {
  test('produces empty test run result when there are no test cases', async () => {
    const fixturePath = path.join(
      testDir,
      '..',
      '__fixtures__',
      'empty',
      'mocha-json.json',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new MochaJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result.tests).toBe(0);
    expect(result.result).toBe('success');
  });

  test('report from ./reports/mocha-json test results matches snapshot', async () => {
    const fixturePath = path.join(
      testDir,
      '../__fixtures__',
      'mocha-json.json',
    );
    const outputPath = path.join(testDir, '../__outputs__', 'mocha-json.md');
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: ['test/main.test.js', 'test/second.test.js', 'lib/main.js'],
    };

    const parser = new MochaJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report);
  });

  test('report from mochajs/mocha test results matches snapshot', async () => {
    const fixturePath = path.join(
      testDir,
      '..',
      '__fixtures__',
      'external',
      'mocha',
      'mocha-test-results.json',
    );
    const trackedFilesPath = path.join(
      testDir,
      '..',
      '__fixtures__',
      'external',
      'mocha',
      'files.txt',
    );
    const outputPath = path.join(
      testDir,
      '..',
      '__outputs__',
      'mocha-test-results.md',
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
      parseErrors: true,
      trackedFiles,
    };

    const parser = new MochaJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, report);
  });

  test('report does not include a title by default', async () => {
    const fixturePath = path.join(
      testDir,
      '../__fixtures__',
      'mocha-json.json',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new MochaJsonParser(opts);
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
        'mocha-json.json',
      );
      const filePath = normalizeFilePath(
        path.relative(path.join(testDir, '..'), fixturePath),
      );
      const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

      const opts: ParseOptions = {
        parseErrors: true,
        trackedFiles: [],
      };

      const parser = new MochaJsonParser(opts);
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
      testDir,
      '../__fixtures__',
      'mocha-json.json',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(testDir, '..'), fixturePath),
    );
    const fileContent = await readFile(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new MochaJsonParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      reportTitle: 'My Custom Title',
    });
    expect(report).toMatch(/^# My Custom Title\n/);
  });
});
