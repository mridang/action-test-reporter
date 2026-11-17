/**
 * @file Parses Go cover profiles into the shared coverage model.
 */

import type {
  CoverageParser,
  CoverageData,
  CoverageMetrics,
  FileCoverageDetails,
} from '../coverage-parser.js';
import type { GocoverBlock, GocoverFileData } from './gocover-types.js';

/**
 * A parser for Go coverage profile files (output of `go test -coverprofile`).
 * @class GocoverParser
 * @implements {CoverageParser}
 */
export class GocoverParser implements CoverageParser {
  /**
   * Regular expression to match the mode line at the start of Go coverage files.
   * Valid modes are: set, count, atomic.
   */
  private static readonly MODE_REGEX = /^mode:\s*(set|count|atomic)\s*$/u;

  /**
   * Regular expression to match coverage block lines.
   * Format: file:startLine.startCol,endLine.endCol numStatements count.
   */
  private static readonly BLOCK_REGEX =
    /^(.+):(\d+)\.(\d+),(\d+)\.(\d+)\s+(\d+)\s+(\d+)$/u;

  /**
   * Parses Go coverage profile content.
   * @memberof GocoverParser
   * @param content - The Go coverage profile content.
   * @returns A promise that resolves to the
   * structured coverage data.
   * @throws {Error} If the content is not valid Go coverage format.
   */
  public async parse(content: string): Promise<CoverageData> {
    const lines = content.split('\n').filter((line) => line.trim() !== '');

    if (lines.length === 0) {
      throw new Error('Empty Go coverage content');
    }

    const modeLine = lines[0];
    if (!GocoverParser.MODE_REGEX.test(modeLine)) {
      throw new Error(
        'Invalid Go coverage format: missing or invalid mode line',
      );
    }

    const parsedBlocks = lines.slice(1).map((rawLine, offset) => {
      const line = rawLine.trim();
      const match = GocoverParser.BLOCK_REGEX.exec(line);
      if (!match) {
        throw new Error(
          `Invalid Go coverage format at line ${offset + 2}: ${line}`,
        );
      }

      const [
        ,
        filename,
        startLine,
        startCol,
        endLine,
        endCol,
        numberStmts,
        count,
      ] = match;

      const block: GocoverBlock = {
        startLine: Number.parseInt(startLine, 10),
        startCol: Number.parseInt(startCol, 10),
        endLine: Number.parseInt(endLine, 10),
        endCol: Number.parseInt(endCol, 10),
        numStatements: Number.parseInt(numberStmts, 10),
        count: Number.parseInt(count, 10),
      };
      return { filename, block };
    });

    if (parsedBlocks.length === 0) {
      throw new Error('No valid Go coverage data found in content');
    }

    const details = Array.from(
      new Set(parsedBlocks.map((entry) => entry.filename)),
      (filename) =>
        this.processFileToDetails({
          filename,
          blocks: parsedBlocks
            .filter((entry) => entry.filename === filename)
            .map((entry) => entry.block),
        }),
    );
    const overall = this.aggregateOverallCoverage(details);

    return { overall, details };
  }

  /**
   * Converts Go coverage file data into standardized coverage details.
   * @memberof GocoverParser
   * @param fileData - The parsed Go coverage file data.
   * @returns The standardized coverage details.
   * @private
   */
  private processFileToDetails(fileData: GocoverFileData): FileCoverageDetails {
    // Track coverage per line: Map<lineNumber, wasCovered>
    const lineCoverage = fileData.blocks
      .flatMap((block) =>
        Array.from(
          { length: block.endLine - block.startLine + 1 },
          (_unused, offset): [number, boolean] => [
            block.startLine + offset,
            block.count > 0,
          ],
        ),
      )
      .reduce(
        (covered, [line, wasCovered]) =>
          // A line is covered if any block covering it has count > 0
          // eslint-disable-next-line functional/immutable-data -- builds the lookup in a single pass; copying the map for every line would be quadratic
          covered.set(line, (covered.get(line) ?? false) || wasCovered),
        new Map<number, boolean>(),
      );

    const totalLines = lineCoverage.size;
    const coveredLines = [...lineCoverage.values()].filter(Boolean).length;
    const uncoveredLines = [...lineCoverage.entries()]
      .flatMap(([lineNumber, covered]) => (covered ? [] : [lineNumber]))
      .toSorted((a, b) => a - b);

    // Calculate statement coverage from blocks
    const totalStatements = fileData.blocks.reduce(
      (total, block) => total + block.numStatements,
      0,
    );
    const coveredStatements = fileData.blocks
      .filter((block) => block.count > 0)
      .reduce((total, block) => total + block.numStatements, 0);

    return {
      file: fileData.filename,
      lines: {
        total: totalLines,
        covered: coveredLines,
      },
      statements: {
        total: totalStatements,
        covered: coveredStatements,
      },
      branches: {
        total: 0,
        covered: 0,
      },
      methods: {
        total: 0,
        covered: 0,
      },
      uncoveredLines,
    };
  }

  /**
   * Aggregates the details from all files to create an overall summary.
   * @memberof GocoverParser
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
