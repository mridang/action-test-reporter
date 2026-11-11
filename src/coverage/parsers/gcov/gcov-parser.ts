/**
 * @file Parses gcov text output into the shared coverage model.
 */

import {
  CoverageParser,
  CoverageData,
  CoverageMetrics,
  FileCoverageDetails,
} from '../coverage-parser.js';
import { GcovFileSection, GcovLine } from './gcov-types.js';

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
    const lines = content.split('\n');
    const sections: GcovFileSection[] = [];
    let currentSection: GcovFileSection | null = null;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const filename = parseSectionFilename(line);

      if (filename !== undefined) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = { filename, lines: [] };
      }
      if (currentSection && !applySummaryLine(currentSection, line)) {
        const sourceLine = parseSourceLine(line);
        if (sourceLine) {
          currentSection.lines.push(sourceLine);
        }
      }
    }

    if (currentSection) {
      sections.push(currentSection);
    }

    return sections;
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

    let lines: CoverageMetrics;
    const branches: CoverageMetrics = { total: 0, covered: 0 };
    const methods: CoverageMetrics = { total: 0, covered: 0 };

    lines = section.summary?.linesExecuted ?? {
      total: executableLines.length,
      covered: coveredLines.length,
    };

    if (section.summary?.branchesExecuted) {
      branches.total = section.summary.branchesExecuted.total;
      branches.covered = section.summary.branchesExecuted.covered;
    }

    if (section.summary?.functionsExecuted) {
      methods.total = section.summary.functionsExecuted.total;
      methods.covered = section.summary.functionsExecuted.covered;
    }

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
    return details.reduce(
      (acc, detail) => {
        acc.lines.total += detail.lines.total;
        acc.lines.covered += detail.lines.covered;
        acc.statements.total += detail.statements.total;
        acc.statements.covered += detail.statements.covered;
        acc.methods.total += detail.methods.total;
        acc.methods.covered += detail.methods.covered;
        acc.branches.total += detail.branches.total;
        acc.branches.covered += detail.branches.covered;
        return acc;
      },
      {
        lines: { total: 0, covered: 0 },
        statements: { total: 0, covered: 0 },
        methods: { total: 0, covered: 0 },
        branches: { total: 0, covered: 0 },
      },
    );
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
  const fileMatch = /^File\s+'(.+)'$/.exec(line);
  if (fileMatch) {
    return fileMatch[1];
  }
  const creatingMatch = /^Creating\s+'(.+)'$/.exec(line);
  if (creatingMatch) {
    return creatingMatch[1].replace(/\.gcov$/, '');
  }
  return undefined;
}

/**
 * Stores the lines, branches or functions percentage from a gcov summary line in the section.
 * @param section - The section that receives the summary value.
 * @param line - The trimmed line to inspect.
 * @returns True when the line was a summary line and has been applied.
 * @example
 * const applied = applySummaryLine(section, 'Lines executed:50.00% of 4');
 */
function applySummaryLine(section: GcovFileSection, line: string): boolean {
  const summaryPatterns = [
    { key: 'linesExecuted', re: /^Lines executed:(\d+\.\d+)% of (\d+)$/ },
    { key: 'branchesExecuted', re: /^Branches executed:(\d+\.\d+)% of (\d+)$/ },
    {
      key: 'functionsExecuted',
      re: /^Functions executed:(\d+\.\d+)% of (\d+)$/,
    },
  ] as const;

  for (const { key, re } of summaryPatterns) {
    const match = re.exec(line);
    if (match) {
      const percentage = Number.parseFloat(match[1]);
      const total = Number.parseInt(match[2], 10);
      const covered = Math.round((percentage / 100) * total);

      section.summary ??= { linesExecuted: { covered: 0, total: 0 } };
      section.summary[key] = { covered, total };
      return true;
    }
  }
  return false;
}

/**
 * Parses a gcov source line that starts with an execution count and a line number.
 * @param line - The trimmed line to parse.
 * @returns The parsed line, or undefined when the line has no count and number.
 * @example
 * const parsed = parseSourceLine('5: 12: return value;');
 */
function parseSourceLine(line: string): GcovLine | undefined {
  const lineMatch = /^\s*([#\d-]+):\s*(\d+):\s*(.*)/.exec(line);
  if (!lineMatch) {
    return undefined;
  }
  const [, countStr, lineNumberStr, sourceCode] = lineMatch;
  return {
    lineNumber: Number.parseInt(lineNumberStr, 10),
    executionCount: parseExecutionCount(countStr),
    sourceCode: sourceCode || '',
  };
}

/**
 * Converts the execution count column of a gcov source line into a number.
 * @param countStr - The raw count column, such as '5', '#####' or '-'.
 * @returns The execution count, or null when the line is not executable.
 * @example
 * const count = parseExecutionCount('#####'); // 0
 */
function parseExecutionCount(countStr: string): number | null {
  const trimmed = countStr.trim();
  if (trimmed === '-') {
    return null;
  }
  if (trimmed === '#####') {
    return 0;
  }
  const count = Number.parseInt(trimmed, 10);
  return Number.isNaN(count) ? null : count;
}
