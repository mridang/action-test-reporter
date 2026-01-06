import * as fs from 'fs';
import * as path from 'path';

import { JavaJunitParser } from '../../../src/testresult/parsers/java-junit/java-junit-parser.js';
import { ParseOptions } from '../../../src/testresult/test-parser.js';
import {
  DEFAULT_OPTIONS,
  getReport,
} from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utils.js';
import { getDirname } from '../helpers/dir.js';

const __dirname = getDirname(import.meta.url);

describe('java-junit tests', () => {
  test('produces empty test run result when there are no test cases', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'empty',
      'java-junit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JavaJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result.tests).toBe(0);
    expect(result.result).toBe('success');
  });

  test('report from apache/pulsar single suite test results matches snapshot', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'java',
      'TEST-org.apache.pulsar.AddMissingPatchVersionTest.xml',
    );
    const trackedFilesPath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'java',
      'files.txt',
    );
    const outputPath = path.join(
      __dirname,
      '..',
      '__outputs__',
      'pulsar-test-results-no-merge.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const trackedFiles = fs
      .readFileSync(trackedFilesPath, { encoding: 'utf8' })
      .split(/\n\r?/g);
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles,
    };

    const parser = new JavaJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('report from apache/pulsar test results matches snapshot', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'java',
      'pulsar-test-report.xml',
    );
    const trackedFilesPath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'java',
      'files.txt',
    );
    const outputPath = path.join(
      __dirname,
      '..',
      '__outputs__',
      'pulsar-test-results.md',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const trackedFiles = fs
      .readFileSync(trackedFilesPath, { encoding: 'utf8' })
      .split(/\n\r?/g);
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles,
    };

    const parser = new JavaJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    expect(result).toMatchSnapshot();

    const report = getReport([result]);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, report);
  });

  test('parses empty failures in test results', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'external',
      'java',
      'empty_failures.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const trackedFiles: string[] = [];
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles,
    };

    const parser = new JavaJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);

    expect(result.result === 'failed');
    expect(result.failed === 1);
  });

  test('report does not include a title by default', async () => {
    const fixturePath = path.join(
      __dirname,
      '..',
      '__fixtures__',
      'junit-with-message.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JavaJunitParser(opts);
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
        '..',
        '__fixtures__',
        'junit-with-message.xml',
      );
      const filePath = normalizeFilePath(
        path.relative(path.join(__dirname, '..'), fixturePath),
      );
      const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

      const opts: ParseOptions = {
        parseErrors: true,
        trackedFiles: [],
      };

      const parser = new JavaJunitParser(opts);
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
      '..',
      '__fixtures__',
      'empty',
      'java-junit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new JavaJunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      reportTitle: 'My Custom Title',
    });
    expect(report).toMatch(/^# My Custom Title\n/);
  });
});
