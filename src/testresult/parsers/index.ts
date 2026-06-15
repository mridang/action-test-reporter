import { ParseOptions, TestParser } from '../test-parser.js';
import { TestRunResult } from '../test-results.js';
import { DartJsonParser } from './dart-json/dart-json-parser.js';
import { DotnetNunitParser } from './dotnet-nunit/dotnet-nunit-parser.js';
import { DotnetTrxParser } from './dotnet-trx/dotnet-trx-parser.js';
import { GolangJsonParser } from './golang-json/golang-json-parser.js';
import { JavaJunitParser } from './java-junit/java-junit-parser.js';
import { JestJunitParser } from './jest-junit/jest-junit-parser.js';
import { MochaJsonParser } from './mocha-json/mocha-json-parser.js';
import { RspecJsonParser } from './rspec-json/rspec-json-parser.js';

type ParserFactory = (options: ParseOptions) => TestParser;

interface ParserEntry {
  name: string;
  factory: ParserFactory;
}

/**
 * An array of all available parser factories to be tried in order.
 * The order matters: most specific formats first, most permissive last.
 *
 * Detection order:
 * 1. TRX - XML with root `TestRun` and Microsoft namespace
 * 2. NUnit - XML with root `test-run` (hyphenated tags)
 * 3. Jest JUnit - XML with `testsuites` and `name="jest tests"`
 * 4. Dart/Flutter - NDJSON with `type` field and `protocolVersion`
 * 5. Golang - NDJSON with `Action` and `Package` fields
 * 6. RSpec - JSON with `version` and `examples` array
 * 7. Mocha - JSON with `stats`, `passes`, `failures`, `pending`
 * 8. Java JUnit - XML with `testsuites` or `testsuite` (fallback)
 *
 * Note: Python xUnit and Swift xUnit are structurally identical to Java JUnit.
 */
const orderedParsers: ParserEntry[] = [
  { name: 'dotnet-trx', factory: (opts) => new DotnetTrxParser(opts) },
  { name: 'dotnet-nunit', factory: (opts) => new DotnetNunitParser(opts) },
  { name: 'jest-junit', factory: (opts) => new JestJunitParser(opts) },
  { name: 'dart-json', factory: (opts) => new DartJsonParser(opts) },
  { name: 'golang-json', factory: (opts) => new GolangJsonParser(opts) },
  { name: 'rspec-json', factory: (opts) => new RspecJsonParser(opts) },
  { name: 'mocha-json', factory: (opts) => new MochaJsonParser(opts) },
  { name: 'java-junit', factory: (opts) => new JavaJunitParser(opts) },
];

export interface DetectedTestResult {
  parser: TestParser;
  result: TestRunResult;
  format: string;
}

/**
 * Detects the test result format by trying each parser in order.
 * Returns the first parser that successfully parses the content.
 *
 * @param path - The file path (used for error reporting and some parsers)
 * @param content - The raw file content to parse
 * @param options - Parse options including workDir and trackedFiles
 * @returns The detected parser, parsed result, and format name
 * @throws Error if no parser can handle the content
 */
export async function detectTestFormat(
  path: string,
  content: string,
  options: ParseOptions,
): Promise<DetectedTestResult> {
  for (const { name, factory } of orderedParsers) {
    try {
      const parser = factory(options);
      const result = await parser.parse(path, content);
      return { parser, result, format: name };
    } catch {
      // Parser couldn't handle this format, try next
    }
  }

  throw new Error(
    'Could not determine test result format. None of the available parsers succeeded.',
  );
}
