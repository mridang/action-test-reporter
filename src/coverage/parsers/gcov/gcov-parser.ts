/**
 * @file Parses gcov text output into the shared coverage model.
 */

import type {
  CoverageParser,
  CoverageData,
  CoverageMetrics,
  FileCoverageDetails,
} from '../coverage-parser.js';
import type { GcovFileSection, GcovLine } from './gcov-types.js';

const GCOV_FILE_HEADER = /^File\s+'(.+)'$/u;
const GCOV_CREATING_HEADER = /^Creating\s+'(.+)'$/u;
const GCOV_EXTENSION = /\.gcov$/u;
const GCOV_LINES_SUMMARY = /^Lines executed:(\d+\.\d+)% of (\d+)$/u;
const GCOV_BRANCHES_SUMMARY = /^Branches executed:(\d+\.\d+)% of (\d+)$/u;
const GCOV_FUNCTIONS_SUMMARY = /^Functions executed:(\d+\.\d+)% of (\d+)$/u;
const GCOV_SOURCE_LINE = /^\s*([#\d-]+):\s*(\d+):\s*(.*)/u;

/**
 * A parser for gcov text output files.
 * @class GcovParser
 * @implements {CoverageParser}
 */
export class GcovParser implements CoverageParser {
  /**
   * Parses the gcov text content to extract coverage data.
   * @memberof GcovParser
   * @param content - The gcov text content.
   * @returns A promise that resolves to the
   * structured coverage data.
   */
  public async parse(content: string): Promise<CoverageData> {
    const sections = this.parseGcovContent(content);

    if (sections.length === 0) {
      throw new Error('No valid gcov data found in content');
    }

    const details = sections.map((section) =>
      this.processSectionToDetails(section),
    );
    const overall = this.aggregateOverallCoverage(details);

    return { overall, details };
  }

  /**
   * Parses the complete gcov text content into file sections.
   * @memberof GcovParser
   * @param content - The raw gcov text content.
   * @returns Array of parsed file sections.
   * @private
   */
  private parseGcovContent(content: string): GcovFileSection[] {
    const lines = content.split('\n').map((rawLine) => rawLine.trim());
    const starts = lines.flatMap((line, index) =>
      parseSectionFilename(line) === undefined ? [] : [index],
    );

    return starts.map((start, position): GcovFileSection => {
      const body = lines.slice(start, starts[position + 1] ?? lines.length);
      const summaries = body.flatMap((line) => parseSummaryLine(line) ?? []);
      return {
        filename: parseSectionFilename(lines[start])!,
        lines: body.flatMap((line) =>
          parseSummaryLine(line) === undefined
            ? (parseSourceLine(line) ?? [])
            : [],
        ),
        summary:
          summaries.length > 0
            ? {
                linesExecuted: { covered: 0, total: 0 },
                ...Object.fromEntries(
                  summaries.map(({ key, value }) => [key, value]),
                ),
              }
            : undefined,
      };
    });
  }

  /**
   * Converts a gcov file section into standardized coverage details.
   * @memberof GcovParser
   * @param section - The parsed gcov file section.
   * @returns The standardized coverage details.
   * @private
   */
  private processSectionToDetails(
    section: GcovFileSection,
  ): FileCoverageDetails {
    const executableLines = section.lines.filter(
      (line: GcovLine) => line.executionCount !== null,
    );
    const coveredLines = executableLines.filter(
      (line: GcovLine) => (line.executionCount ?? 0) > 0,
    );
    const uncoveredLines = executableLines
      .filter((line: GcovLine) => line.executionCount === 0)
      .map((line: GcovLine) => line.lineNumber);

    const lines: CoverageMetrics = section.summary?.linesExecuted ?? {
      total: executableLines.length,
      covered: coveredLines.length,
    };
    const branches: CoverageMetrics = {
      total: section.summary?.branchesExecuted?.total ?? 0,
      covered: section.summary?.branchesExecuted?.covered ?? 0,
    };
    const methods: CoverageMetrics = {
      total: section.summary?.functionsExecuted?.total ?? 0,
      covered: section.summary?.functionsExecuted?.covered ?? 0,
    };

    return {
      file: section.filename,
      lines,
      statements: lines,
      branches,
      methods,
      uncoveredLines,
    };
  }

  /**
   * Aggregates the details from all files to create an overall summary.
   * @memberof GcovParser
   * @param details - The details for all files.
   * @returns The project-wide coverage summary.
   * @private
   */
  private aggregateOverallCoverage(
    details: FileCoverageDetails[],
  ): CoverageData['overall'] {
    const sum = (
      pick: (detail: FileCoverageDetails) => CoverageMetrics,
    ): CoverageMetrics => ({
      total: details.reduce((total, d) => total + pick(d).total, 0),
      covered: details.reduce((total, d) => total + pick(d).covered, 0),
    });
    return {
      lines: sum((d) => d.lines),
      statements: sum((d) => d.statements),
      methods: sum((d) => d.methods),
      branches: sum((d) => d.branches),
    };
  }
}

/**
 * Reads the source file name from a gcov section header line.
 * @param line - The trimmed line to inspect.
 * @returns The source file name, or undefined when the line is not a header.
 * @example
 * const name = parseSectionFilename("File 'src/index.ts'"); // 'src/index.ts'
 */
function parseSectionFilename(line: string): string | undefined {
  const fileMatch = GCOV_FILE_HEADER.exec(line);
  if (fileMatch) {
    return fileMatch[1];
  }
  const creatingMatch = GCOV_CREATING_HEADER.exec(line);
  if (creatingMatch) {
    return creatingMatch[1].replace(GCOV_EXTENSION, '');
  }
  return undefined;
}

/**
 * Reads the lines, branches or functions percentage from a gcov summary line.
 * @param line - The trimmed line to inspect.
 * @returns The summary key and its value, or undefined when the line is not a summary line.
 * @example
 * const parsed = parseSummaryLine('Lines executed:50.00% of 4');
 */
function parseSummaryLine(line: string):
  | {
      key: 'linesExecuted' | 'branchesExecuted' | 'functionsExecuted';
      value: { covered: number; total: number };
    }
  | undefined {
  const summaryPatterns = [
    { key: 'linesExecuted', re: GCOV_LINES_SUMMARY },
    { key: 'branchesExecuted', re: GCOV_BRANCHES_SUMMARY },
    {
      key: 'functionsExecuted',
      re: GCOV_FUNCTIONS_SUMMARY,
    },
  ] as const;

  return summaryPatterns.flatMap(({ key, re }) => {
    const match = re.exec(line);
    if (!match) {
      return [];
    }
    const percentage = Number.parseFloat(match[1]);
    const total = Number.parseInt(match[2], 10);
    return [
      {
        key,
        value: { covered: Math.round((percentage / 100) * total), total },
      },
    ];
  })[0];
}

/**
 * Parses a gcov source line that starts with an execution count and a line number.
 * @param line - The trimmed line to parse.
 * @returns The parsed line, or undefined when the line has no count and number.
 * @example
 * const parsed = parseSourceLine('5: 12: return value;');
 */
function parseSourceLine(line: string): GcovLine | undefined {
  const lineMatch = GCOV_SOURCE_LINE.exec(line);
  if (!lineMatch) {
    return undefined;
  }
  const [, countString, lineNumberString, sourceCode] = lineMatch;
  return {
    lineNumber: Number.parseInt(lineNumberString, 10),
    executionCount: parseExecutionCount(countString),
    sourceCode: sourceCode || '',
  };
}

/**
 * Converts the execution count column of a gcov source line into a number.
 * @param countString - The raw count column, such as '5', '#####' or '-'.
 * @returns The execution count, or null when the line is not executable.
 * @example
 * const count = parseExecutionCount('#####'); // 0
 */
function parseExecutionCount(countString: string): number | null {
  const trimmed = countString.trim();
  if (trimmed === '-') {
    return null;
  }
  if (trimmed === '#####') {
    return 0;
  }
  const count = Number.parseInt(trimmed, 10);
  return Number.isNaN(count) ? null : count;
}
