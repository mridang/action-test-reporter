import * as fs from 'fs';
import * as path from 'path';

import { SwiftXunitParser } from '../../../src/testresult/parsers/swift-xunit/swift-xunit-parser.js';
import { ParseOptions } from '../../../src/testresult/test-parser.js';
import {
  DEFAULT_OPTIONS,
  getReport,
} from '../../../src/testresult/formatter/summary-formatter.js';
import { normalizeFilePath } from '../../../src/testresult/utils/path-utils.js';
import { getDirname } from '../helpers/dir.js';

const __dirname = getDirname(import.meta.url);

describe('swift-xunit tests', () => {
  test('report from swift test results matches snapshot', async () => {
    const fixturePath = path.join(
      __dirname,
      '../__fixtures__',
      'swift-xunit.xml',
    );
    const outputPath = path.join(__dirname, '../__outputs__', 'swift-xunit.md');
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const trackedFiles = [
      'Package.swift',
      'Sources/AcmeLib/AcmeLib.swift',
      'Tests/AcmeLibTests/AcmeLibTests.swift',
    ];
    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles,
    };

    const parser = new SwiftXunitParser(opts);
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
      'swift-xunit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new SwiftXunitParser(opts);
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
        'swift-xunit.xml',
      );
      const filePath = normalizeFilePath(
        path.relative(path.join(__dirname, '..'), fixturePath),
      );
      const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

      const opts: ParseOptions = {
        parseErrors: true,
        trackedFiles: [],
      };

      const parser = new SwiftXunitParser(opts);
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
      'swift-xunit.xml',
    );
    const filePath = normalizeFilePath(
      path.relative(path.join(__dirname, '..'), fixturePath),
    );
    const fileContent = fs.readFileSync(fixturePath, { encoding: 'utf8' });

    const opts: ParseOptions = {
      parseErrors: true,
      trackedFiles: [],
    };

    const parser = new SwiftXunitParser(opts);
    const result = await parser.parse(filePath, fileContent);
    const report = getReport([result], {
      ...DEFAULT_OPTIONS,
      reportTitle: 'My Custom Title',
    });
    expect(report).toMatch(/^# My Custom Title\n/);
  });
});
